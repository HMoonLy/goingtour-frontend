import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user.js'
import { handleApiError, handleSuccess } from '@/utils/api/errorHandler.js'
import { userApi } from '@/api/user.js'

/**
 * useProfile - 用户资料管理业务逻辑
 * 
 * 🎯 职责：用户资料相关的API调用 + 业务逻辑 + UI交互
 * - 获取用户信息API + 流程控制
 * - 更新用户信息API + 流程控制
 * - 获取/更新偏好设置API + 流程控制
 * - 资料展示相关的辅助方法
 * - UI反馈和错误处理
 * 
 * ✅ 包含：
 * - 用户资料相关的API调用
 * - 资料管理业务流程
 * - UI交互逻辑
 * - 数据格式化和验证
 * - 错误处理和用户反馈
 */
export function useProfile() {
    const userStore = useUserStore()
    const loading = ref(false)

    // ========== 计算属性（直接从store获取，不重复封装） ==========
    const currentUser = computed(() => userStore.currentUser)
    const nickname = computed(() => userStore.nickname)
    const email = computed(() => userStore.email)
    const avatar = computed(() => userStore.avatar)
    const userId = computed(() => userStore.userId)
    const userPreferences = computed(() => userStore.userPreferences)
    const hasPreferences = computed(() => userStore.hasPreferences)
    const preferenceLabels = computed(() => userStore.preferenceLabels)

    // ========== 核心功能方法 ==========

    /**
     * 获取用户完整信息（API调用 + 业务逻辑：验证 -> API -> 更新状态 -> 错误处理）
     */
    async function fetchUserInfo() {
        // 1. 前置验证
        if (!userId.value) {
            console.warn('用户未登录，无法获取用户信息')
            return null
        }

        try {
            loading.value = true

            // 2. 调用用户信息API
            const response = await userApi.getUserInfo(userId.value)
            const userInfo = response.data

            // 3. 更新store状态
            userStore.updateUserInfo(userInfo)

            return userInfo
        } catch (error) {
            handleApiError(error, '获取用户信息失败', {
                showNotification: false,
                logError: true
            })
            return null
        } finally {
            loading.value = false
        }
    }

    /**
     * 更新用户基本信息（API调用 + 业务流程：验证 -> API -> 更新状态 -> UI反馈）
     */
    async function updateUserInfo(nickname, avatar) {
        // 1. 前置验证
        if (!userId.value) {
            handleApiError(new Error('用户未登录'), '更新失败')
            return false
        }

        try {
            loading.value = true

            // 2. 调用更新用户信息API
            const response = await userApi.updateInfo(userId.value, {
                nickname,
                avatar
            })
            const updatedInfo = response.data

            // 3. 更新store状态
            userStore.updateUserInfo(updatedInfo)

            // 4. UI成功反馈
            handleSuccess('个人信息更新成功')
            return true
        } catch (error) {
            handleApiError(error, '更新个人信息失败')
            return false
        } finally {
            loading.value = false
        }
    }

    /**
     * 获取用户偏好设置（API调用 + 业务逻辑：验证 -> API -> 更新状态 -> 错误处理）
     */
    async function fetchUserPreferences() {
        if (!userId.value) {
            console.warn('用户未登录，无法获取偏好设置')
            return null
        }

        try {
            // 1. 调用获取偏好设置API
            const response = await userApi.getUserPreferences(userId.value)
                // 提取偏好数据 - API返回的数据结构是 { preferences: {...}, userId: ..., budget: ... }
            const preferences = response.data.preferences || response.data
                // 2. 更新store状态
            userStore.setUserPreferences(preferences)
            return preferences
        } catch (error) {
            handleApiError(error, '获取用户偏好失败', {
                showNotification: false,
                logError: true
            })
            return null
        }
    }

    /**
     * 更新用户偏好设置（API调用 + 业务流程：验证 -> API -> 更新状态 -> UI反馈）
     */
    async function updateUserPreferences(preferences) {
        if (!userId.value) {
            handleApiError(new Error('用户未登录'), '更新失败')
            return false
        }

        try {
            loading.value = true

            // 1. 调用更新偏好设置API
            const response = await userApi.updatePreferences(userId.value, preferences)
                // 提取偏好数据 - API返回的数据结构可能是 { preferences: {...} } 或直接是偏好对象
            const updatedPreferences = response.data.preferences || response.data
                // 2. 更新store状态
            userStore.setUserPreferences(updatedPreferences)

            // 3. UI成功反馈
            handleSuccess('偏好设置更新成功')
            return true
        } catch (error) {
            handleApiError(error, '更新偏好设置失败')
            return false
        } finally {
            loading.value = false
        }
    }

    /**
     * 获取用户显示名称
     */
    function getDisplayName() {
        return nickname.value || email.value || '用户'
    }

    /**
     * 获取用户首字母（用于默认头像）
     */
    function getUserInitials() {
        const name = nickname.value || email.value
        if (!name) return '用'

        // 如果是中文名字，取前两个字符
        if (/[\u4e00-\u9fa5]/.test(name)) {
            return name.slice(0, 2)
        }

        // 如果是英文，取首字母
        const words = name.split(' ')
        if (words.length >= 2) {
            return words[0][0].toUpperCase() + words[1][0].toUpperCase()
        }

        return name[0].toUpperCase()
    }

    /**
     * 检查邮箱格式
     */
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    return {
        // 状态
        loading: computed(() => loading.value),

        // 用户信息（直接从store计算，不重复封装）
        currentUser,
        nickname,
        email,
        avatar,
        userId,
        userPreferences,
        hasPreferences,
        preferenceLabels,

        // 方法
        fetchUserInfo,
        updateUserInfo,
        fetchUserPreferences,
        updateUserPreferences,
        getDisplayName,
        getUserInitials,
        isValidEmail
    }
}