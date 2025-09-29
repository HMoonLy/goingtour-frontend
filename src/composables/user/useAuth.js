import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { handleApiError, handleSuccess } from '@/utils/api/errorHandler.js'

/**
 * useAuth - 用户认证组合函数
 * 
 * 专注于用户登录、注册、退出等认证相关功能
 * 精简版本，移除了过度封装和无用功能
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
     * 发送验证码
     */
    async function sendVerificationCode(email, type = 'login') {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            ElMessage.warning('请输入正确的邮箱地址')
            return false
        }

        if (verifyCodeLoading.value || countdown.value > 0) return false

        try {
            verifyCodeLoading.value = true
            await userStore.sendVerificationCode(email, type)
            ElMessage.success('验证码已发送到您的邮箱')

            // 启动倒计时
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
     * 用户登录
     */
    async function login(email, code) {
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
     */
    async function register(email, code, nickname) {
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
     */
    async function logout(showConfirm = true) {
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
                return false
            }
        }

        try {
            userStore.logout()
            handleSuccess('已安全退出')
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
        requireLogin
    }
}