import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { handleApiError, handleSuccess } from '@/utils/api/errorHandler.js'
import { userApi } from '@/api/user.js'

/**
 * useAuth - 用户认证业务逻辑
 * 
 * 🎯 职责：认证相关的API调用 + 业务逻辑 + UI交互
 * - 发送验证码API + 倒计时管理
 * - 登录API + 流程控制
 * - 注册API + 流程控制  
 * - Token刷新API
 * - 路由跳转处理
 * - UI反馈和错误处理
 * 
 * ✅ 包含：
 * - 认证相关的API调用
 * - 业务流程编排
 * - UI交互逻辑
 * - 路由控制
 * - 错误处理和用户反馈
 */
export function useAuth() {
    const userStore = useUserStore()
    const router = useRouter()

    // ========== 响应式状态 ==========
    const loading = ref(false)
    const verifyCodeLoading = ref(false)
    const countdown = ref(0)

    // ========== 计算属性 ==========
    const isLoggedIn = computed(() => userStore.isLoggedIn)
    const currentUser = computed(() => userStore.currentUser)
    const userId = computed(() => userStore.currentUser?.id)

    // ========== 核心认证方法 ==========

    /**
     * 发送验证码（API调用 + 业务逻辑：验证 -> API -> UI反馈 -> 倒计时）
     */
    async function sendVerificationCode(email, type = 'login') {
        // 1. 前置验证
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            ElMessage.warning('请输入正确的邮箱地址')
            return false
        }

        if (verifyCodeLoading.value || countdown.value > 0) return false

        try {
            verifyCodeLoading.value = true

            // 2. 直接调用API
            await userApi.sendCode({ email, type })

            // 3. UI反馈
            ElMessage.success('验证码已发送到您的邮箱')

            // 4. 启动倒计时
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
     * 启动倒计时
     */
    function startCountdown(seconds = 60) {
        countdown.value = seconds
        const timer = setInterval(() => {
            countdown.value--
                if (countdown.value <= 0) {
                    clearInterval(timer)
                    countdown.value = 0
                }
        }, 1000)
    }

    /**
     * 用户登录（API调用 + 业务流程：验证 -> API -> 更新状态 -> UI反馈 -> 路由跳转）
     */
    async function login(email, code) {
        // 1. 前置验证
        if (!email || !code) {
            ElMessage.warning('请填写完整的登录信息')
            return null
        }

        try {
            loading.value = true

            // 2. 调用登录API
            const response = await userApi.login({ email, code })
            const authData = response.data

            // 3. 更新store状态
            const user = userStore.setLoginState(authData)

            // 4. UI成功反馈
            handleSuccess(`欢迎回来，${user.nickname || '用户'}！`, {
                showNotification: true
            })

            // 5. 处理登录后路由跳转
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
     * 用户注册（API调用 + 业务流程：验证 -> API -> 更新状态 -> UI反馈 -> 路由跳转）
     */
    async function register(email, code, nickname) {
        if (!email || !code) {
            ElMessage.warning('请填写完整的注册信息')
            return null
        }

        try {
            loading.value = true

            // 1. 调用注册API
            const response = await userApi.register({
                email,
                code,
                nickname,
            })
            const authData = response.data

            // 2. 更新store状态
            const user = userStore.setRegisterState(authData)

            // 3. UI成功反馈
            handleSuccess(`注册成功，欢迎加入 GoingTour！`, {
                showNotification: true,
                title: '注册成功'
            })

            // 4. 延时跳转到首页
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
     * 用户退出登录（业务流程：确认 -> 清理数据 -> UI反馈 -> 路由跳转）
     */
    async function logout(showConfirm = true) {
        // 1. 用户确认（可选）
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
                return false // 用户取消
            }
        }

        try {
            // 2. 调用store清理数据
            userStore.logout()

            // 3. UI反馈
            handleSuccess('已安全退出')

            // 4. 路由跳转
            await router.push('/login')
            return true
        } catch (error) {
            handleApiError(error, '退出登录失败')
            return false
        }
    }

    /**
     * 验证用户是否已登录（简化版）
     */
    function requireLogin(redirectToLogin = true) {
        if (!isLoggedIn.value) {
            ElMessage.warning('请先登录')

            if (redirectToLogin) {
                userStore.setRedirectPath(router.currentRoute.value.fullPath)
                router.push('/login')
            }
            return false
        }
        return true
    }

    /**
     * 刷新访问令牌（API调用 + 状态更新）
     */
    async function refreshToken() {
        if (!userStore.refreshToken) {
            throw new Error('没有可用的刷新令牌')
        }

        try {
            const response = await userApi.refreshToken(userStore.refreshToken)
            const tokenData = response.data

            // 更新store中的token信息
            userStore.updateTokens(tokenData)

            return tokenData.accessToken
        } catch (error) {
            // 刷新失败，清除认证状态
            userStore.clearAuthState()
            throw error
        }
    }

    return {
        // 状态
        loading: computed(() => loading.value),
        verifyCodeLoading: computed(() => verifyCodeLoading.value),
        countdown: computed(() => countdown.value),
        isLoggedIn,
        currentUser,
        userId,

        // 方法
        sendVerificationCode,
        login,
        register,
        logout,
        requireLogin,
        refreshToken
    }
}