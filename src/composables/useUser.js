/**
 * useUser - 用户功能统一入口
 * 使用方式：
 * import { useUser } from '@/composables/useUser.js'
 * const { login, logout, currentUser, updateProfile } = useUser()
 */

import { computed } from 'vue'
import { useAuth } from '@/composables/user/useAuth.js'
import { useProfile } from '@/composables/user/useProfile.js'
import { useUserStore } from '@/store/user.js'

/**
 * 用户功能主组合函数
 * 
 * 整合认证和资料管理功能，提供统一的API接口
 * 避免重复封装，直接暴露子组合函数的功能
 */
export function useUser() {
    const userStore = useUserStore()
    const auth = useAuth()
    const profile = useProfile()

    // ========== 核心状态（直接从store获取，避免重复包装） ==========
    const isLoggedIn = computed(() => userStore.isLoggedIn)
    const currentUser = computed(() => userStore.currentUser)
    const userId = computed(() => userStore.userId)
    const nickname = computed(() => userStore.nickname)
    const email = computed(() => userStore.email)
    const avatar = computed(() => userStore.avatar)
    const userPreferences = computed(() => userStore.userPreferences)
    const hasPreferences = computed(() => userStore.hasPreferences)

    // ========== 认证相关方法（来自useAuth） ==========
    const {
        login,
        register,
        logout,
        sendVerificationCode,
        requireLogin
    } = auth

    // ========== 用户资料方法（来自useProfile） ==========
    const {
        fetchUserInfo,
        updateUserInfo,
        fetchUserPreferences,
        updateUserPreferences,
        getDisplayName,
        getUserInitials
    } = profile

    // ========== 加载状态（整合各模块的loading状态） ==========
    const loading = computed(() => auth.loading.value || profile.loading.value)
    const verifyCodeLoading = computed(() => auth.verifyCodeLoading.value)
    const countdown = computed(() => auth.countdown.value)

    // ========== 便捷方法（简化常用操作） ==========

    /**
     * 更新用户资料（简化版）
     * @param {Object} data - 用户资料数据
     * @param {string} data.nickname - 昵称
     * @param {string} data.avatar - 头像URL
     */
    async function updateProfile(data) {
        const { nickname: newNickname, avatar: newAvatar } = data
        return await updateUserInfo(newNickname, newAvatar)
    }

    /**
     * 更新用户偏好（简化版）
     * @param {Object} preferences - 偏好设置对象
     */
    async function updatePreferences(preferences) {
        return await updateUserPreferences(preferences)
    }

    /**
     * 初始化用户数据（登录后调用）
     */
    async function initializeUserData() {
        if (!isLoggedIn.value) {
            console.warn('用户未登录，跳过数据初始化')
            return false
        }

        try {
            // 并行获取用户信息和偏好设置
            const [userInfo, preferences] = await Promise.allSettled([
                fetchUserInfo(),
                fetchUserPreferences()
            ])

            // 记录获取结果（不阻塞流程）
            if (userInfo.status === 'rejected') {
                console.warn('获取用户信息失败:', userInfo.reason)
            }
            if (preferences.status === 'rejected') {
                console.warn('获取用户偏好失败:', preferences.reason)
            }

            return true
        } catch (error) {
            console.error('初始化用户数据失败:', error)
            return false
        }
    }

    /**
     * 检查用户是否完成了基础设置
     */
    function isProfileComplete() {
        return !!(nickname.value && hasPreferences.value)
    }

    /**
     * 获取用户状态摘要
     */
    function getUserStatus() {
        return {
            isLoggedIn: isLoggedIn.value,
            hasProfile: !!nickname.value,
            hasPreferences: hasPreferences.value,
            isComplete: isProfileComplete()
        }
    }

    // ========== 返回统一API ==========
    return {
        // 核心状态
        isLoggedIn,
        currentUser,
        userId,
        nickname,
        email,
        avatar,
        userPreferences,
        hasPreferences,
        loading,
        verifyCodeLoading,
        countdown,

        // 认证方法
        login,
        register,
        logout,
        sendVerificationCode,
        requireLogin,

        // 资料管理方法
        fetchUserInfo,
        updateUserInfo,
        updateProfile,
        fetchUserPreferences,
        updateUserPreferences,
        updatePreferences,

        // 便捷方法
        initializeUserData,
        getDisplayName,
        getUserInitials,
        isProfileComplete,
        getUserStatus,
        isValidEmail: profile.isValidEmail,
        cleanup: () => {}, // 兼容性函数，目前为空

        // 原始子组合函数（供高级用法）
        auth,
        profile,
        store: userStore
    }
}

/**
 * 导出子组合函数，支持按需使用
 */
export { useAuth }
from '@/composables/user/useAuth.js'
export { useProfile }
from '@/composables/user/useProfile.js'

/**
 * 兼容性导出 - 保持原有API不变
 */
export function useUserAuth() {
    const auth = useAuth()
    const userStore = useUserStore()

    /**
     * 检查用户是否就绪（支持参数）
     */
    function requireUserReady(options = {}) {
        const { showMessage = true } = options
        return auth.requireLogin(!showMessage)
    }

    /**
     * 等待用户状态就绪
     */
    async function waitForUserReady(timeout = 3000) {
        return new Promise((resolve) => {
            // 如果已经登录，直接返回
            if (userStore.isLoggedIn) {
                resolve(true)
                return
            }

            // 设置超时
            const timer = setTimeout(() => {
                resolve(false)
            }, timeout)

            // 监听用户状态变化
            const unwatch = userStore.$subscribe((mutation, state) => {
                if (state.isLoggedIn) {
                    clearTimeout(timer)
                    unwatch()
                    resolve(true)
                }
            })
        })
    }

    return {
        ...auth,
        userId: computed(() => userStore.userId),
        requireUserReady,
        waitForUserReady
    }
}

export function useUserInfo() {
    const profile = useProfile()
    const userStore = useUserStore()

    return {
        ...profile,
        currentUser: computed(() => userStore.currentUser),
        nickname: computed(() => userStore.nickname),
        email: computed(() => userStore.email),
        avatar: computed(() => userStore.avatar),
        userId: computed(() => userStore.userId)
    }
}

/**
 * 默认导出
 */
export default useUser