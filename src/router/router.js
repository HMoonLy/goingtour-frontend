import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/user'

const routes = [
    // 重定向到登录页
    {
        path: '/',
        redirect: '/login'
    },

    // ========== 认证相关页面（无需登录） ==========
    {
        path: '/auth',
        component: () =>
            import ('../layouts/AuthLayout.vue'),
        children: [{
                path: '/login',
                name: 'Login',
                component: () =>
                    import ('../pages/User/Login.vue'),
                meta: {
                    title: '登录',
                    requiresAuth: false
                }
            },
            {
                path: '/register',
                name: 'Register',
                component: () =>
                    import ('../pages/User/Register.vue'),
                meta: {
                    title: '注册',
                    requiresAuth: false
                }
            }
        ]
    },

    // ========== 主应用页面（需要登录） ==========
    {
        path: '/app',
        component: () =>
            import ('../layouts/DefaultLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            // 用户模块
            {
                path: '/personal',
                name: 'Personal',
                component: () =>
                    import ('../pages/User/Personal.vue'),
                meta: {
                    title: '个人中心',
                    requiresAuth: true
                }
            },
            {
                path: '/preferences',
                name: 'Preferences',
                component: () =>
                    import ('../pages/User/Preferences.vue'),
                meta: {
                    title: '偏好设置',
                    requiresAuth: true
                }
            },

            // 行程模块
            {
                path: '/destinations',
                name: 'Destinations',
                component: () =>
                    import ('../pages/Trip/Destinations.vue'),
                meta: {
                    title: '选择目的地',
                    requiresAuth: true
                }
            },
            {
                path: '/trip/create',
                name: 'TripCreate',
                component: () =>
                    import ('../pages/Trip/TripCreate.vue'),
                meta: {
                    title: '创建行程',
                    requiresAuth: true
                }
            },
            {
                path: '/trip/:id',
                name: 'TripDetail',
                component: () =>
                    import ('../pages/Trip/TripDetail.vue'),
                props: true,
                meta: {
                    title: '行程详情',
                    requiresAuth: true
                }
            },

            // 数据模块
            {
                path: '/attraction/:id',
                name: 'AttractionDetail',
                component: () =>
                    import ('../pages/Data/AttractionDetail.vue'),
                props: true,
                meta: {
                    title: '景点详情',
                    requiresAuth: false // 景点详情可以不登录查看
                }
            },
            {
                path: '/restaurants',
                name: 'RestaurantList',
                component: () =>
                    import ('../pages/Data/RestaurantList.vue'),
                meta: {
                    title: '餐厅列表',
                    requiresAuth: false
                }
            },
            {
                path: '/search',
                name: 'Search',
                component: () =>
                    import ('../pages/Data/Search.vue'),
                meta: {
                    title: '搜索结果',
                    requiresAuth: false
                }
            }
        ]
    },

    // ========== 分享页面（无需登录） ==========
    {
        path: '/share/trip/:id',
        name: 'TripShare',
        component: () =>
            import ('../pages/Trip/TripShare.vue'),
        props: true,
        meta: {
            title: '行程分享',
            requiresAuth: false
        }
    },

    // ========== 404页面 ==========
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () =>
            import ('../pages/Error/NotFound.vue'),
        meta: {
            title: '页面不存在',
            requiresAuth: false
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    // 路由切换时滚动到顶部
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

// ========== 全局路由守卫 ==========
router.beforeEach(async(to, from, next) => {
    const userStore = useUserStore()

    // 设置页面标题
    document.title = to.meta.title ? `${to.meta.title} - GoingTour` : 'GoingTour'

    // 检查是否需要登录
    if (to.meta.requiresAuth) {
        if (!userStore.isLoggedIn) {
            // 未登录，重定向到登录页
            next({
                path: '/login',
                query: { redirect: to.fullPath } // 保存原始路径，登录后跳转
            })
            return
        }
    }

    // 如果已登录用户访问登录页，重定向到个人中心
    if (userStore.isLoggedIn && (to.path === '/login' || to.path === '/register')) {
        next('/personal')
        return
    }

    next()
})

export default router