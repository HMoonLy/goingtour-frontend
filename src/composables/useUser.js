import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { handleApiError, handleSuccess } from '@/utils/api/errorHandler.js'

/**
 * useUser - 用户管理组合函数
 * 
 * 提供统一的用户状态管理、认证操作和错误处理
 * 
 * 功能特性：
 * - 用户状态响应式监听
 * - 统一的用户验证逻辑
 * - 标准化的认证操作接口
 * - 自动错误处理和提示
 * - 路由跳转管理
 * - 用户信息缓存机制
 */
export function useUser() {
    const userStore = useUserStore()
    const router = useRouter()

    // ========== 响应式状态 ==========

    // 操作状态
    const loading = ref(false)
    const verifyCodeLoading = ref(false)
    const countdown = ref(0)

    // 验证码倒计时定时器
    let countdownTimer = null

    // ========== 计算属性 ==========

    /**
     * 用户登录状态
     */
    const isLoggedIn = computed(() => userStore.isLoggedIn)

    /**
     * 当前用户信息
     */
    const currentUser = computed(() => userStore.currentUser)

    /**
     * 用户ID（多种获取方式兼容）
     */
    const userId = computed(() => {
        return userStore.currentUser?.id || userStore.userId || null
    })

    /**
     * 用户昵称
     */
    const nickname = computed(() => {
        return userStore.currentUser?.nickname || userStore.nickname || '用户'
    })

    /**
     * 用户头像
     */
    const avatar = computed(() => {
        return userStore.avatar || '/images/default-avatar.jpg'
    })

    /**
     * 用户邮箱
     */
    const email = computed(() => {
        return userStore.currentUser?.email || userStore.email || ''
    })

    /**
     * 用户偏好设置
     */
    const userPreferences = computed(() => userStore.userPreferences)

    /**
     * 是否已设置偏好
     */
    const hasPreferences = computed(() => userStore.hasPreferences)

    /**
     * 偏好标签
     */
    const preferenceLabels = computed(() => userStore.preferenceLabels)

    /**
     * 用户状态是否就绪（已登录且有用户ID）
     */
    const isUserReady = computed(() => {
        return isLoggedIn.value && !!userId.value
    })

    // ========== 用户验证方法 ==========

    /**
     * 验证用户是否已登录
     * @param {Object} options 配置选项
     * @param {boolean} options.showMessage 是否显示提示消息
     * @param {boolean} options.redirectToLogin 是否重定向到登录页
     * @param {string} options.redirectPath 登录后重定向路径
     * @returns {boolean} 是否已登录
     */
    const requireLogin = (options = {}) => {
        const {
            showMessage = true,
                redirectToLogin = true,
                redirectPath = router.currentRoute.value.fullPath
        } = options

        if (!isLoggedIn.value) {
            if (showMessage) {
                ElMessage.warning('请先登录')
            }

            if (redirectToLogin) {
                // 保存当前路径用于登录后跳转
                userStore.setRedirectPath(redirectPath)
                router.push('/login')
            }
            return false
        }

        return true
    }

    /**
     * 验证用户状态是否完整（已登录且有用户ID）
     * @param {Object} options 配置选项
     * @returns {boolean} 用户状态是否完整
     */
    const requireUserReady = (options = {}) => {
        if (!requireLogin(options)) {
            return false
        }

        if (!userId.value) {
            if (options.showMessage !== false) {
                ElMessage.warning('用户信息加载中，请稍候...')
            }
            return false
        }

        return true
    }

    /**
     * 等待用户状态就绪
     * @param {number} timeout 超时时间（毫秒）
     * @returns {Promise<boolean>} 用户是否就绪
     */
    const waitForUserReady = async(timeout = 5000) => {
        if (isUserReady.value) {
            return true
        }

        if (!isLoggedIn.value) {
            return false
        }

        return new Promise((resolve) => {
            let resolved = false

            // 设置超时
            const timer = setTimeout(() => {
                if (!resolved) {
                    resolved = true
                    console.warn('⏰ 等待用户状态就绪超时')
                    resolve(false)
                }
            }, timeout)

            // 监听用户状态变化
            const unwatch = watch(
                () => userId.value,
                (newUserId) => {
                    if (newUserId && !resolved) {
                        resolved = true
                        clearTimeout(timer)
                        unwatch()
                        resolve(true)
                    }
                }, { immediate: true }
            )
        })
    }

    // ========== 认证操作方法 ==========

    /**
     * 发送验证码
     * @param {string} email 邮箱地址
     * @param {string} type 验证码类型 (login/register)
     * @returns {Promise<boolean>} 是否发送成功
     */
    const sendVerificationCode = async(email, type = 'login') => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            ElMessage.warning('请输入正确的邮箱地址')
            return false
        }

        if (verifyCodeLoading.value || countdown.value > 0) {
            return false
        }

        try {
            verifyCodeLoading.value = true

            await userStore.sendVerificationCode(email, type)

            ElMessage.success('验证码已发送到您的邮箱')

            // 开始倒计时
            startCountdown(60)

            return true
        } catch (error) {
            handleApiError(error, '发送验证码失败')
            return false
        } finally {
            verifyCodeLoading.value = false
        }
    }

    /**
     * 用户登录
     * @param {string} email 邮箱地址
     * @param {string} code 验证码
     * @returns {Promise<Object|null>} 用户信息或null
     */
    const login = async(email, code) => {
        if (!email || !code) {
            ElMessage.warning('请填写完整的登录信息')
            return null
        }

        try {
            loading.value = true

            const user = await userStore.login(email, code)

            handleSuccess(`欢迎回来，${user.nickname || '用户'}！`, {
                showNotification: true
            })

            // 等待状态更新
            await nextTick()

            // 处理登录后跳转
            const redirectPath = userStore.getAndClearRedirectPath() || '/home'
            await router.push(redirectPath)

            return user
        } catch (error) {
            handleApiError(error, '登录失败')
            return null
        } finally {
            loading.value = false
        }
    }

    /**
     * 用户注册
     * @param {string} email 邮箱地址
     * @param {string} code 验证码
     * @param {string} nickname 昵称（可选）
     * @returns {Promise<Object|null>} 用户信息或null
     */
    const register = async(email, code, nickname) => {
        if (!email || !code) {
            ElMessage.warning('请填写完整的注册信息')
            return null
        }

        try {
            loading.value = true

            const user = await userStore.register(email, code, nickname)

            handleSuccess(`注册成功，欢迎加入 GoingTour！`, {
                showNotification: true,
                title: '注册成功'
            })

            // 等待状态更新
            await nextTick()

            // 注册成功后跳转到首页
            setTimeout(() => {
                router.push('/home')
            }, 1500)

            return user
        } catch (error) {
            handleApiError(error, '注册失败')
            return null
        } finally {
            loading.value = false
        }
    }

    /**
     * 用户退出登录
     * @param {Object} options 配置选项
     * @param {boolean} options.showConfirm 是否显示确认对话框
     * @param {boolean} options.redirectToLogin 是否重定向到登录页
     */
    const logout = async(options = {}) => {
        const {
            showConfirm = true,
                redirectToLogin = true
        } = options

        if (showConfirm) {
            try {
                await ElMessageBox.confirm(
                    '确定要退出登录吗？',
                    '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                )
            } catch {
                // 用户取消
                return false
            }
        }

        try {
            userStore.logout()
            handleSuccess('已安全退出')

            if (redirectToLogin) {
                await router.push('/login')
            }

            return true
        } catch (error) {
            handleApiError(error, '退出登录失败')
            return false
        }
    }

    // ========== 用户信息管理方法 ==========

    /**
     * 获取用户完整信息
     * @returns {Promise<Object|null>} 用户信息或null
     */
    const fetchUserInfo = async() => {
        if (!requireUserReady({ showMessage: false })) {
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
     * @param {string} nickname 昵称
     * @param {string} avatar 头像URL
     * @returns {Promise<boolean>} 是否更新成功
     */
    const updateUserInfo = async(nickname, avatar) => {
        if (!requireUserReady()) {
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
     * @returns {Promise<Object|null>} 偏好设置或null
     */
    const fetchUserPreferences = async() => {
        if (!requireUserReady({ showMessage: false })) {
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
     * @param {Object} preferences 偏好设置
     * @returns {Promise<boolean>} 是否更新成功
     */
    const updateUserPreferences = async(preferences) => {
        if (!requireUserReady()) {
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

    // ========== 辅助方法 ==========

    /**
     * 开始验证码倒计时
     * @param {number} seconds 倒计时秒数
     */
    const startCountdown = (seconds) => {
        countdown.value = seconds

        if (countdownTimer) {
            clearInterval(countdownTimer)
        }

        countdownTimer = setInterval(() => {
            countdown.value--
                if (countdown.value <= 0) {
                    clearInterval(countdownTimer)
                    countdownTimer = null
                }
        }, 1000)
    }

    /**
     * 停止验证码倒计时
     */
    const stopCountdown = () => {
        if (countdownTimer) {
            clearInterval(countdownTimer)
            countdownTimer = null
        }
        countdown.value = 0
    }

    /**
     * 检查邮箱格式是否有效
     * @param {string} email 邮箱地址
     * @returns {boolean} 是否有效
     */
    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    /**
     * 获取用户显示名称
     * @returns {string} 显示名称
     */
    const getDisplayName = () => {
        return nickname.value || email.value || '用户'
    }

    /**
     * 获取用户初始字母（用于默认头像）
     * @returns {string} 初始字母
     */
    const getUserInitials = () => {
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

    // ========== 生命周期管理 ==========

    /**
     * 清理资源（组件卸载时调用）
     */
    const cleanup = () => {
        stopCountdown()
    }

    // ========== 用户状态监听器 ==========

    /**
     * 监听用户登录状态变化
     * @param {Function} callback 回调函数
     * @param {Object} options 监听选项
     * @returns {Function} 取消监听函数
     */
    const watchLoginStatus = (callback, options = {}) => {
        return watch(
            isLoggedIn,
            (newStatus, oldStatus) => {
                if (typeof callback === 'function') {
                    callback(newStatus, oldStatus)
                }
            }, { immediate: options.immediate || false }
        )
    }

    /**
     * 监听用户信息变化
     * @param {Function} callback 回调函数
     * @param {Object} options 监听选项
     * @returns {Function} 取消监听函数
     */
    const watchUserInfo = (callback, options = {}) => {
        return watch(
            currentUser,
            (newUser, oldUser) => {
                if (typeof callback === 'function') {
                    callback(newUser, oldUser)
                }
            }, {
                immediate: options.immediate || false,
                deep: options.deep !== false
            }
        )
    }

    /**
     * 监听用户ID变化
     * @param {Function} callback 回调函数
     * @param {Object} options 监听选项
     * @returns {Function} 取消监听函数
     */
    const watchUserId = (callback, options = {}) => {
        return watch(
            userId,
            (newId, oldId) => {
                if (typeof callback === 'function') {
                    callback(newId, oldId)
                }
            }, { immediate: options.immediate || false }
        )
    }

    // ========== 返回公共接口 ==========
    return {
        // 响应式状态
        loading: computed(() => loading.value),
        verifyCodeLoading: computed(() => verifyCodeLoading.value),
        countdown: computed(() => countdown.value),

        // 用户状态
        isLoggedIn,
        currentUser,
        userId,
        nickname,
        avatar,
        email,
        userPreferences,
        hasPreferences,
        preferenceLabels,
        isUserReady,

        // 验证方法
        requireLogin,
        requireUserReady,
        waitForUserReady,

        // 认证操作
        sendVerificationCode,
        login,
        register,
        logout,

        // 用户信息管理
        fetchUserInfo,
        updateUserInfo,
        fetchUserPreferences,
        updateUserPreferences,

        // 辅助方法
        isValidEmail,
        getDisplayName,
        getUserInitials,
        startCountdown,
        stopCountdown,
        cleanup,

        // 状态监听
        watchLoginStatus,
        watchUserInfo,
        watchUserId
    }
}

/**
 * 用户验证组合函数
 * 专门用于需要用户登录验证的场景
 */
export function useUserAuth() {
    const {
        isLoggedIn,
        userId,
        requireLogin,
        requireUserReady,
        waitForUserReady
    } = useUser()

    return {
        isLoggedIn,
        userId,
        requireLogin,
        requireUserReady,
        waitForUserReady
    }
}

/**
 * 用户信息组合函数
 * 专门用于显示用户信息的场景
 */
export function useUserInfo() {
    const {
        currentUser,
        nickname,
        avatar,
        email,
        userPreferences,
        hasPreferences,
        preferenceLabels,
        getDisplayName,
        getUserInitials,
        fetchUserInfo,
        updateUserInfo
    } = useUser()

    return {
        currentUser,
        nickname,
        avatar,
        email,
        userPreferences,
        hasPreferences,
        preferenceLabels,
        getDisplayName,
        getUserInitials,
        fetchUserInfo,
        updateUserInfo
    }
}