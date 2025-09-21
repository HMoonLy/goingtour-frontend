/**
 * 草稿管理 Composable
 * 提供完整的草稿操作功能，包括自动保存、加载、管理等
 */
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { draftApi } from '@/api/draft.js'
import { useUserStore } from '@/store/user.js'

/**
 * 草稿管理主要功能
 */
export function useDraft() {
    const userStore = useUserStore()

    // 状态管理
    const draftList = ref([])
    const currentDraft = ref(null)
    const autoDraft = ref(null)
    const loading = ref({
        list: false,
        save: false,
        load: false,
        delete: false,
        auto: false
    })
    const error = ref(null)
    const autoSaveTimer = ref(null)
    const lastSaveTime = ref(null)

    // 计算属性
    const hasDrafts = computed(() => draftList.value.length > 0)
    const hasCurrentDraft = computed(() => !!currentDraft.value)
    const hasAutoDraft = computed(() => !!autoDraft.value)
    const canAutoSave = computed(() => userStore.isLoggedIn && userStore.currentUser ? .id)

    const draftStats = computed(() => {
        const total = draftList.value.length
        const recent = draftList.value.filter(draft => {
            const updated = new Date(draft.updatedAt)
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            return updated > weekAgo
        }).length

        return {
            total,
            recent,
            hasRecent: recent > 0
        }
    })

    // 方法

    /**
     * 获取用户ID
     */
    const getUserId = () => {
        const userId = userStore.currentUser ? .id || userStore.userId
        if (!userId) {
            throw new Error('用户未登录')
        }
        return userId
    }

    /**
     * 加载草稿列表
     */
    const loadDraftList = async(showMessage = false) => {
        try {
            loading.value.list = true
            error.value = null

            const userId = getUserId()
            const response = await draftApi.getUserDrafts(userId)

            if (response.data) {
                draftList.value = response.data.map(draft => ({
                    ...draft,
                    formattedDate: new Date(draft.updatedAt).toLocaleDateString(),
                    formattedTime: new Date(draft.updatedAt).toLocaleTimeString(),
                    isRecent: Date.now() - new Date(draft.updatedAt).getTime() < 24 * 60 * 60 * 1000
                }))

                if (showMessage && draftList.value.length > 0) {
                    ElMessage.success(`加载了 ${draftList.value.length} 个草稿`)
                }
            }

            return draftList.value
        } catch (err) {
            console.error('加载草稿列表失败:', err)
            error.value = err.message || '加载草稿列表失败'

            if (showMessage) {
                ElMessage.error('加载草稿列表失败，请重试')
            }

            throw err
        } finally {
            loading.value.list = false
        }
    }

    /**
     * 保存草稿
     */
    const saveDraft = async(formData, draftName, options = {}) => {
        try {
            loading.value.save = true
            error.value = null

            const userId = getUserId()
            const { showMessage = true, updateCurrent = true } = options

            const draftData = {
                userId,
                name: draftName || `草稿_${new Date().toLocaleDateString()}`,
                currentStep: formData.currentStep || 0,
                baseForm: formData.baseForm || {},
                preferenceForm: formData.preferenceForm || {},
                selectedAttractions: formData.selectedAttractions || [],
                selectedRestaurants: formData.selectedRestaurants || [],
                extraRequirements: formData.extraRequirements || "",
                weatherSuggestion: formData.weatherSuggestion || null,
                lastModified: new Date().toISOString()
            }

            const response = await draftApi.createDraft(draftData)

            if (response.data ? .id) {
                const savedDraft = {
                    ...response.data,
                    formattedDate: new Date().toLocaleDateString(),
                    formattedTime: new Date().toLocaleTimeString(),
                    isRecent: true
                }

                // 更新列表
                draftList.value.unshift(savedDraft)

                // 更新当前草稿
                if (updateCurrent) {
                    currentDraft.value = savedDraft
                }

                lastSaveTime.value = new Date()

                if (showMessage) {
                    ElMessage.success(`草稿"${draftName}"保存成功`)
                }

                return savedDraft
            }

            throw new Error('保存失败：无效的返回数据')
        } catch (err) {
            console.error('保存草稿失败:', err)
            error.value = err.message || '保存草稿失败'

            ElMessage.error('保存草稿失败，请重试')
            throw err
        } finally {
            loading.value.save = false
        }
    }

    /**
     * 更新草稿
     */
    const updateDraft = async(draftId, formData, options = {}) => {
        try {
            loading.value.save = true
            error.value = null

            const userId = getUserId()
            const { showMessage = true } = options

            const draftData = {
                userId,
                currentStep: formData.currentStep || 0,
                baseForm: formData.baseForm || {},
                preferenceForm: formData.preferenceForm || {},
                selectedAttractions: formData.selectedAttractions || [],
                selectedRestaurants: formData.selectedRestaurants || [],
                extraRequirements: formData.extraRequirements || "",
                weatherSuggestion: formData.weatherSuggestion || null,
                lastModified: new Date().toISOString()
            }

            const response = await draftApi.updateDraft(draftId, draftData)

            if (response.data) {
                // 更新列表中的草稿
                const index = draftList.value.findIndex(draft => draft.id === draftId)
                if (index !== -1) {
                    draftList.value[index] = {
                        ...draftList.value[index],
                        ...response.data,
                        formattedDate: new Date().toLocaleDateString(),
                        formattedTime: new Date().toLocaleTimeString(),
                        isRecent: true
                    }
                }

                // 更新当前草稿
                if (currentDraft.value ? .id === draftId) {
                    currentDraft.value = draftList.value[index]
                }

                lastSaveTime.value = new Date()

                if (showMessage) {
                    ElMessage.success('草稿更新成功')
                }

                return response.data
            }
        } catch (err) {
            console.error('更新草稿失败:', err)
            error.value = err.message || '更新草稿失败'

            ElMessage.error('更新草稿失败，请重试')
            throw err
        } finally {
            loading.value.save = false
        }
    }

    /**
     * 加载草稿
     */
    const loadDraft = async(draftId, options = {}) => {
        try {
            loading.value.load = true
            error.value = null

            const { applyToStore = true, showMessage = true } = options
            const userId = getUserId()

            const response = await draftApi.getDraft(draftId, userId)

            if (response.data) {
                const loadedDraft = response.data

                // 解析JSON字段
                const parsedDraft = {
                    id: loadedDraft.id,
                    name: loadedDraft.name,
                    currentStep: loadedDraft.currentStep || 0,
                    baseForm: typeof loadedDraft.baseForm === "string" ?
                        JSON.parse(loadedDraft.baseForm) : loadedDraft.baseForm || {},
                    preferenceForm: typeof loadedDraft.preferenceForm === "string" ?
                        JSON.parse(loadedDraft.preferenceForm) : loadedDraft.preferenceForm || {},
                    selectedAttractions: typeof loadedDraft.selectedAttractions === "string" ?
                        JSON.parse(loadedDraft.selectedAttractions) : loadedDraft.selectedAttractions || [],
                    selectedRestaurants: typeof loadedDraft.selectedRestaurants === "string" ?
                        JSON.parse(loadedDraft.selectedRestaurants) : loadedDraft.selectedRestaurants || [],
                    extraRequirements: loadedDraft.extraRequirements || "",
                    weatherSuggestion: typeof loadedDraft.weatherSuggestion === "string" ?
                        JSON.parse(loadedDraft.weatherSuggestion) : loadedDraft.weatherSuggestion,
                    createdAt: loadedDraft.createdAt,
                    updatedAt: loadedDraft.updatedAt
                }

                currentDraft.value = parsedDraft

                // 注意：不再需要应用到单独的store，useDraft已经是完整的状态管理

                if (showMessage) {
                    ElMessage.success(`草稿"${parsedDraft.name}"加载成功`)
                }

                return parsedDraft
            }

            throw new Error('草稿不存在或加载失败')
        } catch (err) {
            console.error('加载草稿失败:', err)
            error.value = err.message || '加载草稿失败'

            ElMessage.error('加载草稿失败，请重试')
            throw err
        } finally {
            loading.value.load = false
        }
    }

    /**
     * 删除草稿
     */
    const deleteDraft = async(draftId, options = {}) => {
        try {
            const { showConfirm = true, showMessage = true } = options

            // 确认删除
            if (showConfirm) {
                const draftName = draftList.value.find(d => d.id === draftId) ? .name || '草稿'
                await ElMessageBox.confirm(
                    `确定要删除草稿"${draftName}"吗？删除后无法恢复。`,
                    '确认删除', {
                        confirmButtonText: '删除',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                )
            }

            loading.value.delete = true
            const userId = getUserId()

            await draftApi.deleteDraft(draftId, userId)

            // 从列表中移除
            const index = draftList.value.findIndex(draft => draft.id === draftId)
            if (index !== -1) {
                const deletedDraft = draftList.value.splice(index, 1)[0]

                // 如果删除的是当前草稿，清空当前草稿
                if (currentDraft.value ? .id === draftId) {
                    currentDraft.value = null
                }

                if (showMessage) {
                    ElMessage.success(`草稿"${deletedDraft.name}"删除成功`)
                }
            }

            return true
        } catch (err) {
            if (err.action === 'cancel') {
                return false
            }

            console.error('删除草稿失败:', err)
            error.value = err.message || '删除草稿失败'

            ElMessage.error('删除草稿失败，请重试')
            throw err
        } finally {
            loading.value.delete = false
        }
    }

    /**
     * 重命名草稿
     */
    const renameDraft = async(draftId, newName) => {
        try {
            if (!newName || !newName.trim()) {
                throw new Error('草稿名称不能为空')
            }

            const userId = getUserId()
            await draftApi.renameDraft(draftId, newName.trim(), userId)

            // 更新列表中的名称
            const index = draftList.value.findIndex(draft => draft.id === draftId)
            if (index !== -1) {
                draftList.value[index].name = newName.trim()

                // 更新当前草稿名称
                if (currentDraft.value ? .id === draftId) {
                    currentDraft.value.name = newName.trim()
                }
            }

            ElMessage.success('重命名成功')
            return true
        } catch (err) {
            console.error('重命名草稿失败:', err)
            ElMessage.error('重命名失败，请重试')
            throw err
        }
    }

    /**
     * 复制草稿
     */
    const copyDraft = async(draftId, newName) => {
        try {
            const userId = getUserId()
            const response = await draftApi.copyDraft(draftId, newName, userId)

            if (response.data) {
                const copiedDraft = {
                    ...response.data,
                    formattedDate: new Date().toLocaleDateString(),
                    formattedTime: new Date().toLocaleTimeString(),
                    isRecent: true
                }

                draftList.value.unshift(copiedDraft)
                ElMessage.success(`草稿复制成功："${newName}"`)

                return copiedDraft
            }
        } catch (err) {
            console.error('复制草稿失败:', err)
            ElMessage.error('复制草稿失败，请重试')
            throw err
        }
    }

    /**
     * 批量删除草稿
     */
    const batchDeleteDrafts = async(draftIds) => {
        try {
            await ElMessageBox.confirm(
                `确定要删除选中的 ${draftIds.length} 个草稿吗？删除后无法恢复。`,
                '批量删除确认', {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            )

            const userId = getUserId()
            await draftApi.batchDeleteDrafts(draftIds, userId)

            // 从列表中移除
            draftList.value = draftList.value.filter(draft => !draftIds.includes(draft.id))

            // 如果当前草稿被删除，清空
            if (currentDraft.value && draftIds.includes(currentDraft.value.id)) {
                currentDraft.value = null
            }

            ElMessage.success(`成功删除 ${draftIds.length} 个草稿`)
            return true
        } catch (err) {
            if (err.action === 'cancel') {
                return false
            }

            console.error('批量删除草稿失败:', err)
            ElMessage.error('批量删除失败，请重试')
            throw err
        }
    }

    /**
     * 自动保存功能
     */
    const startAutoSave = (formData, interval = 30000) => {
        if (!canAutoSave.value) {
            console.warn('用户未登录，无法启动自动保存')
            return
        }

        stopAutoSave()

        autoSaveTimer.value = setInterval(async() => {
            try {
                await saveOrUpdateAutoDraft(formData, { showMessage: false })
                console.log('自动保存成功:', new Date().toLocaleTimeString())
            } catch (error) {
                console.warn('自动保存失败:', error)
            }
        }, interval)

        console.log(`自动保存已启动，间隔 ${interval / 1000} 秒`)
    }

    /**
     * 停止自动保存
     */
    const stopAutoSave = () => {
        if (autoSaveTimer.value) {
            clearInterval(autoSaveTimer.value)
            autoSaveTimer.value = null
            console.log('自动保存已停止')
        }
    }

    /**
     * 保存或更新自动草稿
     */
    const saveOrUpdateAutoDraft = async(formData, options = {}) => {
        try {
            loading.value.auto = true
            const { showMessage = false } = options
            const userId = getUserId()

            const draftData = {
                currentStep: formData.currentStep || 0,
                baseForm: formData.baseForm || {},
                preferenceForm: formData.preferenceForm || {},
                selectedAttractions: formData.selectedAttractions || [],
                selectedRestaurants: formData.selectedRestaurants || [],
                extraRequirements: formData.extraRequirements || "",
                weatherSuggestion: formData.weatherSuggestion || null,
                lastModified: new Date().toISOString()
            }

            // 先尝试获取或创建自动草稿
            let response
            if (autoDraft.value) {
                response = await draftApi.updateAutoDraft(userId, draftData)
            } else {
                response = await draftApi.getOrCreateAutoDraft(userId, draftData)
            }

            if (response.data) {
                autoDraft.value = response.data
                lastSaveTime.value = new Date()

                if (showMessage) {
                    ElMessage.success('自动草稿保存成功')
                }

                return response.data
            }
        } catch (err) {
            console.error('自动草稿操作失败:', err)
            if (options.showMessage) {
                ElMessage.error('自动草稿保存失败')
            }
            throw err
        } finally {
            loading.value.auto = false
        }
    }

    /**
     * 清理过期草稿
     */
    const cleanupExpiredDrafts = async() => {
        try {
            const userId = getUserId()
            const response = await draftApi.cleanupExpiredDrafts(userId)

            if (response.data ? .deletedCount > 0) {
                ElMessage.success(`清理了 ${response.data.deletedCount} 个过期草稿`)
                    // 重新加载列表
                await loadDraftList()
            } else {
                ElMessage.info('没有过期草稿需要清理')
            }

            return response.data
        } catch (err) {
            console.error('清理过期草稿失败:', err)
            ElMessage.error('清理过期草稿失败，请重试')
            throw err
        }
    }

    /**
     * 清空当前草稿
     */
    const clearCurrentDraft = () => {
        currentDraft.value = null
        autoDraft.value = null
        stopAutoSave()

        console.log('已清空当前草稿数据')
    }

    /**
     * 获取草稿预览信息
     */
    const getDraftPreview = (draft) => {
        const preview = {
            hasBaseForm: !!(draft.baseForm && Object.keys(draft.baseForm).length > 0),
            hasPreferences: !!(draft.preferenceForm && Object.keys(draft.preferenceForm).length > 0),
            attractionCount: draft.selectedAttractions ? .length || 0,
            restaurantCount: draft.selectedRestaurants ? .length || 0,
            stepProgress: draft.currentStep || 0,
            lastModified: draft.updatedAt || draft.lastModified,
            isComplete: false
        }

        preview.isComplete = preview.hasBaseForm && preview.hasPreferences &&
            (preview.attractionCount > 0 || preview.restaurantCount > 0)

        return preview
    }

    // 组件销毁时清理定时器
    const cleanup = () => {
        stopAutoSave()
    }

    /**
     * 检查是否有草稿数据需要恢复（兼容原 draftStore 接口）
     */
    const hasDraftToRestore = () => {
        return !!(currentDraft.value)
    }

    /**
     * 获取要恢复到的步骤（兼容原 draftStore 接口）
     */
    const getRestoreStep = () => {
        if (!hasDraftToRestore()) return 0
        return currentDraft.value.currentStep || 0
    }

    /**
     * 标记正在从草稿加载（兼容原 draftStore 接口）
     */
    const isLoadingFromDraft = ref(false)

    const setLoadingFromDraft = (loading) => {
        isLoadingFromDraft.value = loading
    }

    /**
     * 清除草稿（兼容原 draftStore 接口）
     */
    const clearDraft = () => {
        clearCurrentDraft()
        isLoadingFromDraft.value = false
    }

    return {
        // 状态
        draftList,
        currentDraft,
        autoDraft,
        loading,
        error,
        lastSaveTime,
        isLoadingFromDraft,

        // 计算属性
        hasDrafts,
        hasCurrentDraft,
        hasAutoDraft,
        canAutoSave,
        draftStats,

        // 草稿管理方法
        loadDraftList,
        saveDraft,
        updateDraft,
        loadDraft,
        deleteDraft,
        renameDraft,
        copyDraft,
        batchDeleteDrafts,

        // 自动保存方法
        startAutoSave,
        stopAutoSave,
        saveOrUpdateAutoDraft,

        // 工具方法
        clearCurrentDraft,
        cleanupExpiredDrafts,
        getDraftPreview,
        cleanup,

        // 兼容原 draftStore 的方法
        hasDraftToRestore,
        getRestoreStep,
        clearDraft,
        setLoadingFromDraft
    }
}

/**
 * 专用于草稿列表管理的composable
 */
export function useDraftList() {
    const {
        draftList,
        loading,
        error,
        hasDrafts,
        draftStats,
        loadDraftList,
        deleteDraft,
        renameDraft,
        copyDraft,
        batchDeleteDrafts,
        cleanupExpiredDrafts,
        getDraftPreview
    } = useDraft()

    // 额外的列表管理功能
    const selectedDrafts = ref([])
    const searchKeyword = ref('')
    const sortOrder = ref('updatedAt') // 'updatedAt', 'createdAt', 'name'

    const filteredDrafts = computed(() => {
        let filtered = draftList.value

        // 搜索过滤
        if (searchKeyword.value) {
            const keyword = searchKeyword.value.toLowerCase()
            filtered = filtered.filter(draft =>
                draft.name.toLowerCase().includes(keyword) ||
                (draft.baseForm ? .destinationName || '').toLowerCase().includes(keyword)
            )
        }

        // 排序
        filtered.sort((a, b) => {
            switch (sortOrder.value) {
                case 'name':
                    return a.name.localeCompare(b.name)
                case 'createdAt':
                    return new Date(b.createdAt) - new Date(a.createdAt)
                case 'updatedAt':
                default:
                    return new Date(b.updatedAt) - new Date(a.updatedAt)
            }
        })

        return filtered
    })

    const hasSelectedDrafts = computed(() => selectedDrafts.value.length > 0)

    const selectAllDrafts = () => {
        selectedDrafts.value = filteredDrafts.value.map(draft => draft.id)
    }

    const clearSelection = () => {
        selectedDrafts.value = []
    }

    const batchDeleteSelected = async() => {
        if (selectedDrafts.value.length === 0) return

        const success = await batchDeleteDrafts(selectedDrafts.value)
        if (success) {
            clearSelection()
        }
        return success
    }

    return {
        // 状态
        draftList: filteredDrafts,
        selectedDrafts,
        searchKeyword,
        sortOrder,
        loading,
        error,

        // 计算属性
        hasDrafts,
        draftStats,
        hasSelectedDrafts,

        // 方法
        loadDraftList,
        deleteDraft,
        renameDraft,
        copyDraft,
        cleanupExpiredDrafts,
        getDraftPreview,
        selectAllDrafts,
        clearSelection,
        batchDeleteSelected
    }
}