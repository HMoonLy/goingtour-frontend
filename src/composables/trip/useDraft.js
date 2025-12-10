
import { ref, watch, onUnmounted, computed, getCurrentInstance } from 'vue'
import { draftApi } from '@/api/draft.js'
import { useUserStore } from '@/store/user.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const saveStatus = ref('idle') // 'idle' | 'saving' | 'success' | 'error'
const lastSavedTime = ref(null)
const autoDraftId = ref(null) // 记录当前关联的自动草稿ID
const draftList = ref([]) // 草稿列表
const draftStats = ref({}) // 草稿统计
const currentDraft = ref(null) // 当前加载的草稿

export function useDraft() {
    const userStore = useUserStore()
    
    // 防抖定时器
    let _debounceTimer = null
    const _normalizeData = (apiData) => {
        if (!apiData) return null
        
        // 深拷贝避免修改原数据
        const data = { ...apiData }
        
        // 需要 JSON parse 的字段
        const jsonFields = [
            'baseForm', 
            'preferenceForm', 
            'selectedAttractions', 
            'selectedRestaurants', 
            'selectedHotels',
            'weatherSuggestion',
            'aiRecommendationsData',
            'extraRequirements'
        ]

        jsonFields.forEach(field => {
            const value = data[field];
            if (value) {
                if (typeof value === 'string') {
                    try {
                        data[field] = JSON.parse(value)
                    } catch (e) {
                        console.warn(`[Draft] 解析字段 ${field} 失败，保留原值`, e)
                    }
                }
                // 如果已经是对象则无需处理
            }
        })
        
        return data
    }

    // --- 核心功能：自动保存 ---

    /**
     * 启动自动保存监听
     */
    const setupAutoSave = (dataGetter, delay = 2000) => {
        // 监听数据变化
        const stopWatch = watch(
            dataGetter, 
            (newData) => {
                if (!userStore.isLoggedIn) return
                
                // 只有当有实质内容时才保存
                if (!newData?.baseForm?.destinationName) return

                saveStatus.value = 'waiting' // 标记为等待保存
                
                // 防抖逻辑
                if (_debounceTimer) clearTimeout(_debounceTimer)
                
                _debounceTimer = setTimeout(async () => {
                    await _performAutoSave(newData)
                }, delay)
            },
            { deep: true } // 深度监听对象变化
        )

        // 定义清理函数
        const cleanup = () => {
            if (_debounceTimer) clearTimeout(_debounceTimer)
            stopWatch()
        }

        // 尝试自动注册销毁钩子
        if (getCurrentInstance()) {
            onUnmounted(cleanup)
        }

        // 返回清理函数，以便在非 setup 上下文中手动清理
        return cleanup
    }

    /**
     * 执行自动保存（内部调用）
     */
    const _performAutoSave = async (data) => {
        try {
            saveStatus.value = 'saving'
            const userId = userStore.currentUser?.id
            if (!userId) return

            // 构造 API 需要的数据结构
            // 显式处理复杂字段的序列化，确保后端存储格式统一
            const payload = { 
                ...data,
                // 确保有 name 字段
                name: data.name || (data.baseForm?.destinationName ? `${data.baseForm.destinationName}的行程` : '我的行程草稿')
            }
            
            // 定义需要序列化为字符串的字段
            const jsonFields = [
                'baseForm', 
                'preferenceForm', 
                'selectedAttractions', 
                'selectedRestaurants', 
                'selectedHotels',
                'weatherSuggestion',
                'aiRecommendationsData',
                'extraRequirements'
            ]

            jsonFields.forEach(field => {
                // 如果该字段存在且为对象（非null），则转为JSON字符串
                if (payload[field] && typeof payload[field] === 'object') {
                    try {
                        payload[field] = JSON.stringify(payload[field])
                    } catch (e) {
                        console.warn(`[Draft] 序列化字段 ${field} 失败`, e)
                    }
                }
            })

            let res;
            if (!autoDraftId.value) {
                res = await draftApi.getOrCreateAutoDraft(userId, payload)
                if (res.data?.id) autoDraftId.value = res.data.id
            } else {
                // 更新时带上 ID
                payload.id = autoDraftId.value
                res = await draftApi.updateAutoDraft(userId, payload)
            }

            saveStatus.value = 'success'
            lastSavedTime.value = new Date()
            
            // 2秒后重置状态
            setTimeout(() => {
                if (saveStatus.value === 'success') saveStatus.value = 'idle'
            }, 2000)
            
        } catch (error) {
            console.error('[Draft] 自动保存失败', error)
            saveStatus.value = 'error'
        }
    }

    /**
     * 立即保存
     */
    const forceSave = async (data) => {
        if (_debounceTimer) clearTimeout(_debounceTimer)
        await _performAutoSave(data)
    }

    // --- 核心功能：恢复与检查 ---

    /**
     * 获取所有草稿列表 (原名 fetchDraftList, 兼容 loadDraftList)
     */
    const loadDraftList = async () => {
        if (!userStore.isLoggedIn) return []
        try {
            const res = await draftApi.getUserDrafts(userStore.currentUser.id)
            const list = (res.data || []).map(_normalizeData)
            draftList.value = list // 更新全局状态
            return list
        } catch (e) {
            console.error('[Draft] 获取列表失败', e)
            return []
        }
    }

    /**
     * 兼容旧版：获取草稿统计
     */
    const getDraftStats = async () => {
        if (!userStore.isLoggedIn) return {}
        try {
            const res = await draftApi.getDraftStats(userStore.currentUser.id)
            draftStats.value = res.data || {}
            return draftStats.value
        } catch (e) {
            return {}
        }
    }

    /**
     * 兼容旧版：加载特定草稿到当前状态
     */
    const loadDraft = async (draftId) => {
        try {
            const userId = userStore.currentUser?.id
            if (!userId) return false
            
            const res = await draftApi.getDraft(draftId, userId)
            if (res.data) {
                const data = _normalizeData(res.data)
                currentDraft.value = data
                autoDraftId.value = data.id // 设置为当前自动草稿ID，以便后续更新
                
                // 这里可能需要一种机制将数据传递给 TripCreate 页面
                // 目前主要通过 autoDraftId 或 currentDraft 全局状态传递
                return true
            }
            return false
        } catch (e) {
            console.error('[Draft] 加载草稿失败', e)
            return false
        }
    }

    /**
     * 兼容旧版：路由守卫检查
     * 检查是否有可恢复的草稿状态
     */
    const hasDraftToRestore = () => {
        // 简单检查：如果有全局的自动草稿ID，或者本地存储中有进度
        return !!autoDraftId.value || !!localStorage.getItem('goingtour_trip_progress')
    }

    /**
     * 获取自动草稿 (用于 Dashboard)
     */
    const getAutoDraft = async () => {
        await loadDraftList() // 刷新列表
        return draftList.value.find(d => d.isAuto) || null
    }
    
    /**
     * 获取自动草稿摘要
     */
    const getAutoDraftSummary = async () => {
        const auto = await getAutoDraft()
        if (!auto) return null
        return {
            destination: auto.baseForm?.destinationName,
            stepName: getStepName(auto.currentStep || 0),
            timeAgo: getTimeAgo(auto.updatedAt)
        }
    }

    /**
     * 检查并恢复自动草稿 (交互式)
     */
    const checkAndRestoreAutoDraft = async () => {
        if (!userStore.isLoggedIn) return null
        
        try {
            const autoDraft = await getAutoDraft()
            console.log("🔍 Auto draft found:", autoDraft); // Debug log

            if (!autoDraft) return null

            // 检查是否有实质内容
            if (!autoDraft?.baseForm?.destinationName) {
                console.warn("⚠️ Auto draft is empty or missing destinationName");
                return null
            }

            // 记录ID以便后续更新
            autoDraftId.value = autoDraft.id

            // 询问用户
            const confirmed = await ElMessageBox.confirm(
                `检测到您有一个关于 "${autoDraft.baseForm.destinationName}" 的未完成行程，是否继续编辑？`,
                '恢复进度',
                {
                    confirmButtonText: '继续编辑',
                    cancelButtonText: '开始新行程',
                    type: 'info',
                    distinguishCancelAndClose: true
                }
            ).catch(() => false)

            if (confirmed === 'confirm') {
                return autoDraft
            } else {
                return null
            }

        } catch (e) {
            console.error('[Draft] 检查自动草稿失败', e)
            return null
        }
    }

    // --- 显式操作功能 ---

    const saveAsSnapshot = async (data, name) => {
        try {
            const userId = userStore.currentUser?.id
            const payload = { ...data, userId, name }
            await draftApi.createDraft(payload)
            ElMessage.success('已保存到草稿箱')
            loadDraftList() // 刷新列表
            return true
        } catch (e) {
            console.error('[Draft] 另存为失败', e)
            ElMessage.error('保存失败')
            return false
        }
    }

    const deleteDraft = async (id, options = {}) => {
        try {
            if (options.showConfirm) {
                 await ElMessageBox.confirm('确定要删除这个草稿吗？', '提示', { type: 'warning' })
            }
            await draftApi.deleteDraft(id, userStore.currentUser.id)
            ElMessage.success('删除成功')
            await loadDraftList() // 刷新列表
            return true
        } catch (e) {
            if (e !== 'cancel') ElMessage.error('删除失败')
            return false
        }
    }

    // --- 辅助函数 ---
    
    const getStepName = (step) => {
        const map = { 0: '基础信息', 1: '偏好设置', 2: '推荐选择', 3: '智能生成', 4: '行程预览' }
        return map[step] || '进行中'
    }

    const getTimeAgo = (dateStr) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        const now = new Date()
        const diff = (now - date) / 1000
        if (diff < 60) return '刚刚'
        if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
        if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
        return `${Math.floor(diff / 86400)}天前`
    }

    return {
        // 状态 (现在是全局响应式状态)
        saveStatus,
        lastSavedTime,
        draftList,
        draftStats,
        currentDraft,
        
        // 方法
        setupAutoSave,
        forceSave,
        checkAndRestoreAutoDraft,
        saveAsSnapshot,
        loadDraftList, // Alias for compatibility
        fetchDraftList: loadDraftList,
        deleteDraft,
        getDraftStats, // Added
        loadDraft, // Added
        hasDraftToRestore, // Added for Router
        getAutoDraft, // Added
        getAutoDraftSummary, // Added
        getStepName, // Added
        getTimeAgo // Added
    }
}
