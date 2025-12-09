/**
 * 行程管理组合函数
 * 提供行程相关的响应式状态管理和操作方法
 */
import { ref, computed, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuth } from '@/composables/user/useAuth.js'
import { useUserStore } from '@/store/user.js'
import { tripService } from '@/services/trip/tripService.js'
import { tripProgressManager } from '@/utils/system/tripProgress.js'

export function useTrip() {
    // 使用用户认证
    const auth = useAuth()
    const userStore = useUserStore()

    // 兼容性适配
    const requireUserReady = (options = {}) => {
        const { showMessage = true } = options
        return auth.requireLogin(!showMessage)
    }

    const waitForUserReady = async(timeout = 3000) => {
        return new Promise((resolve) => {
            if (userStore.isLoggedIn) {
                resolve(true)
                return
            }

            const timer = setTimeout(() => resolve(false), timeout)
            const unwatch = userStore.$subscribe((mutation, state) => {
                if (state.isLoggedIn) {
                    clearTimeout(timer)
                    unwatch()
                    resolve(true)
                }
            })
        })
    }

    const userId = userStore.userId

    // ==================== 响应式状态 ====================

    // 行程列表和当前行程
    const tripList = ref([])
    const currentTrip = ref(null)
    const tripDetails = ref(null)

    // 行程生成相关状态
    const generatedTrip = ref(null) // AI生成的行程数据
    const generationProgress = ref('')
    const generationPercent = ref(0)
    const isGenerating = ref(false)

    // 加载状态
    const loading = reactive({
        fetching: false,
        creating: false,
        updating: false,
        deleting: false,
        generating: false,
        saving: false
    })

    // 行程创建表单数据
    const createForm = reactive({
        title: '',
        city: '',
        days: 3,
        travelers: 1,
        budget: 0,
        status: 1 // 草稿状态
    })

    // 错误状态
    const error = ref(null)

    // ==================== 计算属性 ====================

    /**
     * 行程总数
     */
    const tripCount = computed(() => tripList.value.length)

    /**
     * 按状态分组的行程
     */
    const tripsByStatus = computed(() => {
        const groups = {
            draft: [], // 草稿
            published: [], // 已发布
            completed: [] // 已完成
        }

        tripList.value.forEach(trip => {
            switch (trip.statusCode || trip.status) {
                case 1:
                    groups.draft.push(trip)
                    break
                case 2:
                    groups.published.push(trip)
                    break
                case 3:
                    groups.completed.push(trip)
                    break
                default:
                    groups.draft.push(trip)
            }
        })

        return groups
    })

    /**
     * 当前行程ID
     */
    const currentTripId = computed(() => currentTrip.value ? .id)

    /**
     * 是否有当前行程
     */
    const hasCurrentTrip = computed(() => !!currentTrip.value)

    /**
     * 行程统计信息
     */
    const tripStats = computed(() => {
        const stats = {
            total: tripList.value.length,
            draft: tripsByStatus.value.draft.length,
            published: tripsByStatus.value.published.length,
            completed: tripsByStatus.value.completed.length,
            aiGenerated: 0,
            totalDays: 0
        }

        tripList.value.forEach(trip => {
            if (trip.aiGenerated) {
                stats.aiGenerated++
            }
            stats.totalDays += trip.days || 0
        })

        return stats
    })

    /**
     * 是否可以操作（用户已登录且就绪）
     */
    const canOperate = computed(() => {
        return requireUserReady({ showMessage: false })
    })

    // ==================== 行程CRUD操作 ====================

    /**
     * 加载用户行程列表
     * @param {boolean} useCache 是否使用缓存
     * @param {number} retryCount 重试次数
     */
    const loadUserTrips = async(useCache = true, retryCount = 0) => {
        if (!requireUserReady()) {
            // 如果用户未就绪，尝试等待
            if (retryCount < 3) {
                const userReady = await waitForUserReady(2000)
                if (userReady) {
                    return loadUserTrips(useCache, retryCount + 1)
                }
            }
            tripList.value = []
            return { success: false, message: '用户未登录' }
        }

        if (loading.fetching) return

        loading.fetching = true
        error.value = null

        try {
            console.log('🔍 正在加载行程列表...')

            const result = await tripService.getUserTrips(userId.value, { useCache })

            if (result.success) {
                tripList.value = result.data
                console.log(`✅ 行程列表加载成功，共 ${result.data.length} 个行程`)
                return { success: true, data: result.data }
            } else {
                error.value = result.message
                ElMessage.error(result.message || '加载行程列表失败')
                return result
            }
        } catch (err) {
            const errorMessage = err.message || '加载行程列表失败'
            error.value = errorMessage
            console.error('❌ 加载行程列表失败:', err)

            // 网络错误重试
            if (retryCount < 2 && (err.code === 'NETWORK_ERROR' || err.status >= 500)) {
                console.log(`🔄 重试加载行程列表 (${retryCount + 1}/2)`)
                setTimeout(() => {
                    loadUserTrips(useCache, retryCount + 1)
                }, (retryCount + 1) * 1000)
                return
            }

            ElMessage.error(errorMessage)
            return { success: false, message: errorMessage }
        } finally {
            loading.fetching = false
        }
    }

    /**
     * 获取行程详情
     * @param {number} tripId 行程ID
     * @param {boolean} setAsCurrent 是否设置为当前行程
     */
    const getTripDetail = async(tripId, setAsCurrent = true) => {
        if (!requireUserReady()) {
            return { success: false, message: '用户未登录' }
        }

        if (!tripId) {
            return { success: false, message: '行程ID不能为空' }
        }

        loading.fetching = true
        error.value = null

        try {
            console.log('🔍 正在获取行程详情:', tripId)

            const result = await tripService.getTripDetail(tripId, userId.value)

            if (result.success) {
                const tripData = result.data

                if (setAsCurrent) {
                    currentTrip.value = tripData
                }
                tripDetails.value = tripData

                console.log('✅ 行程详情获取成功:', tripData.title)
                return { success: true, data: tripData }
            } else {
                error.value = result.message
                ElMessage.error(result.message || '获取行程详情失败')
                return result
            }
        } catch (err) {
            const errorMessage = err.message || '获取行程详情失败'
            error.value = errorMessage
            console.error('❌ 获取行程详情失败:', err)
            ElMessage.error(errorMessage)
            return { success: false, message: errorMessage }
        } finally {
            loading.fetching = false
        }
    }

    /**
     * 创建新行程
     * @param {Object} tripData 行程数据
     */
    const createTrip = async(tripData) => {
        if (!requireUserReady()) {
            return { success: false, message: '用户未登录' }
        }

        loading.creating = true
        error.value = null

        try {
            console.log('📝 正在创建行程:', tripData)

            const result = await tripService.createTrip(userId.value, tripData)

            if (result.success) {
                const newTrip = result.data

                // 添加到列表开头
                tripList.value.unshift(newTrip)

                // 设置为当前行程
                currentTrip.value = newTrip

                ElMessage.success('行程创建成功')
                console.log('✅ 行程创建成功:', newTrip.title)

                return { success: true, data: newTrip }
            } else {
                error.value = result.message
                ElMessage.error(result.message || '创建行程失败')
                return result
            }
        } catch (err) {
            const errorMessage = err.message || '创建行程失败'
            error.value = errorMessage
            console.error('❌ 创建行程失败:', err)
            ElMessage.error(errorMessage)
            return { success: false, message: errorMessage }
        } finally {
            loading.creating = false
        }
    }

    /**
     * 更新行程
     * @param {number} tripId 行程ID
     * @param {Object} updateData 更新数据
     */
    const updateTrip = async(tripId, updateData) => {
        if (!requireUserReady()) {
            return { success: false, message: '用户未登录' }
        }

        if (!tripId) {
            return { success: false, message: '行程ID不能为空' }
        }

        loading.updating = true
        error.value = null

        try {
            console.log('📝 正在更新行程:', tripId, updateData)

            const result = await tripService.updateTrip(tripId, userId.value, updateData)

            if (result.success) {
                const updatedTrip = result.data

                // 更新列表中的行程
                const index = tripList.value.findIndex(trip => trip.id === tripId)
                if (index !== -1) {
                    tripList.value[index] = updatedTrip
                }

                // 更新当前行程
                if (currentTrip.value ? .id === tripId) {
                    currentTrip.value = updatedTrip
                }

                ElMessage.success('行程更新成功')
                console.log('✅ 行程更新成功:', updatedTrip.title)

                return { success: true, data: updatedTrip }
            } else {
                error.value = result.message
                ElMessage.error(result.message || '更新行程失败')
                return result
            }
        } catch (err) {
            const errorMessage = err.message || '更新行程失败'
            error.value = errorMessage
            console.error('❌ 更新行程失败:', err)
            ElMessage.error(errorMessage)
            return { success: false, message: errorMessage }
        } finally {
            loading.updating = false
        }
    }

    /**
     * 删除行程
     * @param {number} tripId 行程ID
     * @param {boolean} showConfirm 是否显示确认对话框
     */
    const deleteTrip = async(tripId, showConfirm = true) => {
        if (!requireUserReady()) {
            return { success: false, message: '用户未登录' }
        }

        if (!tripId) {
            return { success: false, message: '行程ID不能为空' }
        }

        // 获取要删除的行程名称
        const tripToDelete = tripList.value.find(trip => trip.id === tripId)
        const tripName = tripToDelete ? .title || '此行程'

        // 显示确认对话框
        if (showConfirm) {
            try {
                await ElMessageBox.confirm(
                    `确定要删除"${tripName}"吗？删除后不可恢复。`,
                    '删除确认', {
                        confirmButtonText: '确定删除',
                        cancelButtonText: '取消',
                        type: 'warning',
                        confirmButtonClass: 'el-button--danger'
                    }
                )
            } catch {
                return { success: false, message: '用户取消删除' }
            }
        }

        loading.deleting = true
        error.value = null

        try {
            console.log('🗑️ 正在删除行程:', tripId)

            const result = await tripService.deleteTrip(tripId, userId.value)

            if (result.success) {
                // 从列表中移除
                tripList.value = tripList.value.filter(trip => trip.id !== tripId)

                // 如果删除的是当前行程，清空当前行程
                if (currentTrip.value ? .id === tripId) {
                    currentTrip.value = null
                    tripDetails.value = null
                }

                ElMessage.success(`"${tripName}"已删除`)
                console.log('✅ 行程删除成功:', tripId)

                return { success: true }
            } else {
                error.value = result.message
                ElMessage.error(result.message || '删除行程失败')
                return result
            }
        } catch (err) {
            const errorMessage = err.message || '删除行程失败'
            error.value = errorMessage
            console.error('❌ 删除行程失败:', err)
            ElMessage.error(errorMessage)
            return { success: false, message: errorMessage }
        } finally {
            loading.deleting = false
        }
    }

    /**
     * 复制行程
     * @param {number} tripId 行程ID
     * @param {string} newTitle 新标题
     */
    const duplicateTrip = async(tripId, newTitle) => {
        if (!requireUserReady()) {
            return { success: false, message: '用户未登录' }
        }

        loading.creating = true
        error.value = null

        try {
            console.log('📋 正在复制行程:', tripId)

            const result = await tripService.duplicateTrip(tripId, userId.value, newTitle)

            if (result.success) {
                const newTrip = result.data

                // 添加到列表开头
                tripList.value.unshift(newTrip)

                ElMessage.success('行程复制成功')
                console.log('✅ 行程复制成功:', newTrip.title)

                return { success: true, data: newTrip }
            } else {
                error.value = result.message
                ElMessage.error(result.message || '复制行程失败')
                return result
            }
        } catch (err) {
            const errorMessage = err.message || '复制行程失败'
            error.value = errorMessage
            console.error('❌ 复制行程失败:', err)
            ElMessage.error(errorMessage)
            return { success: false, message: errorMessage }
        } finally {
            loading.creating = false
        }
    }

    // ==================== AI行程生成 ====================

    /**
     * 生成AI行程
     */
    const generateAiTrip = async(generationParams) => {
        if (!requireUserReady()) {
            return { success: false, message: '用户未登录' }
        }

        loading.generating = true
        isGenerating.value = true
        generationProgress.value = '开始生成行程...'
        generationPercent.value = 0
        error.value = null

        try {
            const tripData = await tripService.generateAiTrip(userId.value, generationParams, {
                onProgress: (progress) => {
                    generationProgress.value = progress.message
                    generationPercent.value = progress.percent
                }
            })

            generatedTrip.value = tripData
            generationProgress.value = '行程生成完成！'
            generationPercent.value = 100

            ElMessage.success(`AI行程生成成功！质量评分：${tripData.qualityScore}`)
            return { success: true, data: tripData }
        } catch (err) {
            const errorMessage = err.message || 'AI行程生成失败'
            error.value = errorMessage
            ElMessage.error(errorMessage)
            return { success: false, message: errorMessage }
        } finally {
            loading.generating = false
            isGenerating.value = false
        }
    }

    /**
     * 保存AI生成的行程
     * @param {Object} aiTripData AI行程数据
     * @param {Object} saveOptions 保存选项
     */
    const saveAiTrip = async(aiTripData, saveOptions = {}) => {
        if (!requireUserReady()) {
            return { success: false, message: '用户未登录' }
        }

        loading.saving = true
        error.value = null

        try {
            console.log('💾 正在保存AI行程:', aiTripData)

            const result = await tripService.saveAiTrip(userId.value, aiTripData, saveOptions)

            if (result.success) {
                const savedTrip = result.data

                // 添加到列表开头
                tripList.value.unshift(savedTrip)

                // 设置为当前行程
                currentTrip.value = savedTrip

                // 清空生成的临时数据
                generatedTrip.value = null
                generationProgress.value = ''
                generationPercent.value = 0

                ElMessage.success('AI行程保存成功')
                console.log('✅ AI行程保存成功:', savedTrip.title)

                return { success: true, data: savedTrip }
            } else {
                error.value = result.message
                ElMessage.error(result.message || '保存AI行程失败')
                return result
            }
        } catch (err) {
            const errorMessage = err.message || '保存AI行程失败'
            error.value = errorMessage
            console.error('❌ 保存AI行程失败:', err)
            ElMessage.error(errorMessage)
            return { success: false, message: errorMessage }
        } finally {
            loading.saving = false
        }
    }

    // ==================== 行程状态管理 ====================

    /**
     * 更新行程状态
     * @param {number} tripId 行程ID
     * @param {number} status 新状态
     */
    const updateTripStatus = async(tripId, status) => {
        if (!requireUserReady()) {
            return { success: false, message: '用户未登录' }
        }

        try {
            console.log('📝 正在更新行程状态:', tripId, status)

            const result = await tripService.updateTripStatus(tripId, userId.value, status)

            if (result.success) {
                // 更新列表中的行程状态
                const index = tripList.value.findIndex(trip => trip.id === tripId)
                if (index !== -1) {
                    tripList.value[index].statusCode = status
                    tripList.value[index].status = status
                }

                // 更新当前行程状态
                if (currentTrip.value ? .id === tripId) {
                    currentTrip.value.statusCode = status
                    currentTrip.value.status = status
                }

                const statusText = status === 1 ? '草稿' : status === 2 ? '已发布' : '已完成'
                ElMessage.success(`行程状态已更新为${statusText}`)

                return { success: true }
            } else {
                ElMessage.error(result.message || '更新状态失败')
                return result
            }
        } catch (err) {
            const errorMessage = err.message || '更新状态失败'
            console.error('❌ 更新行程状态失败:', err)
            ElMessage.error(errorMessage)
            return { success: false, message: errorMessage }
        }
    }

    // ==================== 行程分享功能 ====================

    /**
     * 生成分享码
     * @param {number} tripId 行程ID
     */
    const generateShareCode = async(tripId) => {
        if (!requireUserReady()) {
            return { success: false, message: '用户未登录' }
        }

        try {
            console.log('🔗 正在生成分享码:', tripId)

            const result = await tripService.generateShareCode(tripId, userId.value)

            if (result.success) {
                // 更新行程的分享码
                const index = tripList.value.findIndex(trip => trip.id === tripId)
                if (index !== -1) {
                    tripList.value[index].shareCode = result.data.shareCode
                }

                if (currentTrip.value ? .id === tripId) {
                    currentTrip.value.shareCode = result.data.shareCode
                }

                ElMessage.success('分享码生成成功')
                console.log('✅ 分享码生成成功:', result.data.shareCode)

                return { success: true, data: result.data }
            } else {
                ElMessage.error(result.message || '生成分享码失败')
                return result
            }
        } catch (err) {
            const errorMessage = err.message || '生成分享码失败'
            console.error('❌ 生成分享码失败:', err)
            ElMessage.error(errorMessage)
            return { success: false, message: errorMessage }
        }
    }

    /**
     * 通过分享码获取行程
     * @param {string} shareCode 分享码
     */
    const getTripByShareCode = async(shareCode) => {
        loading.fetching = true
        error.value = null

        try {
            console.log('🔗 正在获取分享行程:', shareCode)

            const result = await tripService.getTripByShareCode(shareCode)

            if (result.success) {
                console.log('✅ 分享行程获取成功:', result.data.title)
                return { success: true, data: result.data }
            } else {
                error.value = result.message
                ElMessage.error(result.message || '获取分享行程失败')
                return result
            }
        } catch (err) {
            const errorMessage = err.message || '获取分享行程失败'
            error.value = errorMessage
            console.error('❌ 获取分享行程失败:', err)
            ElMessage.error(errorMessage)
            return { success: false, message: errorMessage }
        } finally {
            loading.fetching = false
        }
    }

    // ==================== 工具方法 ====================

    /**
     * 设置当前行程
     * @param {Object} trip 行程数据
     */
    const setCurrentTrip = (trip) => {
        currentTrip.value = trip
        if (trip) {
            console.log('📍 设置当前行程:', trip.title)
        }
    }

    /**
     * 清空当前行程
     */
    const clearCurrentTrip = () => {
        currentTrip.value = null
        tripDetails.value = null
        console.log('🧹 已清空当前行程')
    }

    /**
     * 清空生成的行程数据
     */
    const clearGeneratedTrip = () => {
        generatedTrip.value = null
        generationProgress.value = ''
        generationPercent.value = 0
        isGenerating.value = false
        console.log('🧹 已清空生成的行程数据')
    }

    /**
     * 重置创建表单
     */
    const resetCreateForm = () => {
        Object.assign(createForm, {
            title: '',
            city: '',
            days: 3,
            travelers: 1,
            budget: 0,
            status: 1
        })
    }

    /**
     * 根据ID查找行程
     * @param {number} tripId 行程ID
     */
    const findTripById = (tripId) => {
        return tripList.value.find(trip => trip.id === tripId)
    }

    /**
     * 检查是否为行程所有者
     * @param {Object} trip 行程数据
     */
    const isOwner = (trip) => {
        return trip && trip.userId === userId.value
    }

    /**
     * 保存行程创建进度
     * @param {Object} progressData 进度数据
     */
    const saveProgress = (progressData) => {
        return tripProgressManager.saveProgress(progressData)
    }

    /**
     * 恢复行程创建进度
     */
    const restoreProgress = () => {
        return tripProgressManager.restoreProgress()
    }

    /**
     * 清除保存的进度
     */
    const clearProgress = () => {
        return tripProgressManager.clearProgress()
    }

    // ==================== 监听器 ====================

    // 监听用户状态变化，自动加载行程列表
    watch(
        () => userId.value,
        (newUserId) => {
            if (newUserId) {
                console.log('👤 用户状态就绪，自动加载行程列表')
                loadUserTrips()
            } else {
                // 用户登出，清空数据
                tripList.value = []
                clearCurrentTrip()
                clearGeneratedTrip()
            }
        }, { immediate: true }
    )

    // ==================== 返回的接口 ====================

    return {
        // 响应式状态
        tripList,
        currentTrip,
        tripDetails,
        generatedTrip,
        generationProgress,
        generationPercent,
        isGenerating,
        loading,
        createForm,
        error,

        // 计算属性
        tripCount,
        tripsByStatus,
        currentTripId,
        hasCurrentTrip,
        tripStats,
        canOperate,

        // 行程CRUD方法
        loadUserTrips,
        getTripDetail,
        createTrip,
        updateTrip,
        deleteTrip,
        duplicateTrip,

        // AI行程生成方法
        generateAiTrip,
        saveAiTrip,

        // 状态管理方法
        updateTripStatus,

        // 分享功能方法
        generateShareCode,
        getTripByShareCode,

        // 工具方法
        setCurrentTrip,
        clearCurrentTrip,
        clearGeneratedTrip,
        resetCreateForm,
        findTripById,
        isOwner,

        // 进度管理方法
        saveProgress,
        restoreProgress,
        clearProgress
    }
}

/**
 * 行程创建专用组合函数
 * 用于行程创建页面的状态管理
 */
export function useTripCreation() {
    const {
        generatedTrip,
        generationProgress,
        generationPercent,
        isGenerating,
        loading,
        createForm,
        generateAiTrip,
        saveAiTrip,
        clearGeneratedTrip,
        resetCreateForm,
        saveProgress,
        restoreProgress,
        clearProgress
    } = useTrip()

    return {
        // 生成相关状态
        generatedTrip,
        generationProgress,
        generationPercent,
        isGenerating,
        loading: computed(() => loading.generating || loading.saving),
        createForm,

        // 生成相关方法
        generateAiTrip,
        saveAiTrip,
        clearGeneratedTrip,
        resetCreateForm,

        // 进度管理
        saveProgress,
        restoreProgress,
        clearProgress
    }
}

/**
 * 行程管理专用组合函数
 * 用于行程列表和管理页面
 */
export function useTripManagement() {
    const {
        tripList,
        currentTrip,
        loading,
        tripCount,
        tripsByStatus,
        tripStats,
        loadUserTrips,
        getTripDetail,
        updateTrip,
        deleteTrip,
        duplicateTrip,
        updateTripStatus,
        generateShareCode,
        setCurrentTrip,
        clearCurrentTrip,
        findTripById,
        isOwner
    } = useTrip()

    return {
        // 列表状态
        tripList,
        currentTrip,
        loading: computed(() => loading.fetching || loading.updating || loading.deleting),

        // 统计信息
        tripCount,
        tripsByStatus,
        tripStats,

        // 管理方法
        loadUserTrips,
        getTripDetail,
        updateTrip,
        deleteTrip,
        duplicateTrip,
        updateTripStatus,
        generateShareCode,

        // 工具方法
        setCurrentTrip,
        clearCurrentTrip,
        findTripById,
        isOwner
    }
}