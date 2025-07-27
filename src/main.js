import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router/router.js'
import { useUserStore } from './store/user.js'

// 导入全局样式
import './style.css'

// 创建Vue应用实例
const app = createApp(App)

// 创建Pinia状态管理
const pinia = createPinia()

// 注册Pinia
app.use(pinia)

// 注册路由
app.use(router)

// 注册Element Plus
app.use(ElementPlus)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 开发环境下的调试功能
if (
    import.meta.env.DEV) {
    // 清理用户状态的调试方法
    window.clearUserState = () => {
        localStorage.removeItem('goingtour_user')
        localStorage.removeItem('goingtour_token')
        console.log('✅ 用户状态已清理，请刷新页面')
        window.location.reload()
    }

    // 查看当前用户状态的调试方法
    window.checkUserState = () => {
        const userData = localStorage.getItem('goingtour_user')
        const token = localStorage.getItem('goingtour_token')
        console.log('📊 当前用户状态:')
        console.log('- userData:', userData ? JSON.parse(userData) : null)
        console.log('- token:', token)
    }
}

// 初始化应用
const initApp = async() => {
    // 恢复用户登录状态
    const userStore = useUserStore()
    userStore.restoreFromStorage()

    // 如果用户已登录，刷新用户信息
    if (userStore.isLoggedIn && userStore.currentUser?.id) {
        try {
            await userStore.fetchUserInfo()
        } catch (error) {
            console.warn('刷新用户信息失败:', error)
                // 如果刷新失败，可能token已过期，清除登录状态
            userStore.logout()
        }
    }
}

// 启动应用
initApp().then(() => {
    app.mount('#app')
})

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
    console.error('Vue全局错误:', err, info)
        // 这里可以上报错误到监控系统
}

// 开发环境下的调试信息
if (
    import.meta.env.DEV) {
    console.log('🚀 GoingTour 前端应用启动成功！')
    console.log('📊 当前环境:',
        import.meta.env.MODE)
    console.log('🔗 API地址:',
        import.meta.env.VITE_API_BASE_URL || '/api')
    console.log('')
    console.log('🛠️  调试工具:')
    console.log('- clearUserState() - 清理用户登录状态')
    console.log('- checkUserState() - 查看当前用户状态')
}

// 性能监控（开发环境）
if (
    import.meta.env.DEV) {
    app.config.performance = true
}

// 处理未捕获的Promise错误
window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason)
        // 阻止默认的控制台错误输出
        // event.preventDefault()
})