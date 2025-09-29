import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user.js'
import { handleApiError, handleSuccess } from '@/utils/api/errorHandler.js'

/**
 * useProfile - 用户资料管理组合函数
 * 
 * 专注于用户信息展示和管理功能
 * 精简版本，移除了重复的getter和复杂的状态处理
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
     * 获取用户完整信息
     */
    async function fetchUserInfo() {
        if (!userId.value) {
            console.warn('用户未登录，无法获取用户信息')
            return null
        }

        try {
            loading.value = true
            const userInfo = await userStore.fetchUserInfo()
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
     * 更新用户基本信息
     */
    async function updateUserInfo(nickname, avatar) {
        if (!userId.value) {
            handleApiError(new Error('用户未登录'), '更新失败')
            return false
        }

        try {
            loading.value = true
            await userStore.updateUserInfo(nickname, avatar)
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
     * 获取用户偏好设置
     */
    async function fetchUserPreferences() {
        if (!userId.value) {
            console.warn('用户未登录，无法获取偏好设置')
            return null
        }

        try {
            const preferences = await userStore.fetchUserPreferences()
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
     * 更新用户偏好设置
     */
    async function updateUserPreferences(preferences) {
        if (!userId.value) {
            handleApiError(new Error('用户未登录'), '更新失败')
            return false
        }

        try {
            loading.value = true
            await userStore.updateUserPreferences(preferences)
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