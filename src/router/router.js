import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/store/user";
import { t } from "@/utils/i18n.js";

const routes = [
    // ========== 认证相关页面（无需登录） ==========
    {
        path: "/login",
        name: "Login",
        component: () =>
            import ("../pages/User/Login.vue"),
        meta: {
            titleKey: "route.login",
            requiresAuth: false,
        },
    },
    {
        path: "/register",
        name: "Register",
        component: () =>
            import ("../pages/User/Register.vue"),
        meta: {
            titleKey: "route.register",
            requiresAuth: false,
        },
    },

    // ========== 主应用页面（使用DefaultLayout） ==========
    {
        path: "/",
        component: () =>
            import ("../layouts/DefaultLayout.vue"),
        children: [
            // 默认重定向到个人中心
            {
                path: "",
                redirect: "/personal",
            },

            // 用户模块
            {
                path: "personal",
                name: "Personal",
                component: () =>
                    import ("../pages/User/Personal.vue"),
                meta: {
                    titleKey: "route.personal",
                    requiresAuth: true,
                },
            },
            {
                path: "account-settings",
                name: "AccountSettings",
                component: () =>
                    import ("../pages/User/AccountSettings.vue"),
                meta: {
                    titleKey: "route.accountSettings",
                    requiresAuth: true,
                },
            },
            {
                path: "preferences",
                name: "Preferences",
                component: () =>
                    import ("../pages/User/Preferences.vue"),
                meta: {
                    titleKey: "route.preferences",
                    requiresAuth: true,
                },
            },

            // 行程模块
            {
                path: "destinations",
                name: "Destinations",
                component: () =>
                    import ("../pages/Trip/Destinations.vue"),
                meta: {
                    titleKey: "route.destinations",
                    requiresAuth: true,
                },
            },
            {
                path: "trip/create",
                name: "TripCreate",
                component: () =>
                    import ("../pages/Trip/TripCreate.vue"),
                meta: {
                    titleKey: "route.tripCreate",
                    requiresAuth: true,
                    requiresDestination: true, // 需要先选择目的地
                },
            },
            {
                path: "trip/:id",
                name: "TripDetail",
                component: () =>
                    import ("../pages/Trip/TripDetail.vue"),
                props: true,
                meta: {
                    titleKey: "route.tripDetail",
                    requiresAuth: true,
                },
            },
            {
                path: "ai-trip/:id/edit",
                name: "AiTripEdit",
                component: () =>
                    import ("../pages/Trip/AiTripEdit.vue"),
                props: true,
                meta: {
                    titleKey: "route.aiTripEdit",
                    requiresAuth: true,
                },
            },

            // 数据模块
            {
                path: "attraction/:id",
                name: "AttractionDetail",
                component: () =>
                    import ("../pages/Data/AttractionDetail.vue"),
                props: true,
                meta: {
                    titleKey: "route.attractionDetail",
                    requiresAuth: false, // 景点详情可以不登录查看
                },
            },
            {
                path: "restaurants",
                name: "RestaurantList",
                component: () =>
                    import ("../pages/Data/RestaurantList.vue"),
                meta: {
                    titleKey: "route.restaurantList",
                    requiresAuth: false,
                },
            },
            {
                path: "search",
                name: "Search",
                component: () =>
                    import ("../pages/Data/Search.vue"),
                meta: {
                    titleKey: "route.search",
                    requiresAuth: false,
                },
            },
        ],
    },

    // ========== 分享页面（无需登录） ==========
    {
        path: "/share/trip/:id",
        name: "TripShare",
        component: () =>
            import ("../pages/Trip/TripShare.vue"),
        props: true,
        meta: {
            titleKey: "route.tripShare",
            requiresAuth: false,
        },
    },

    // ========== 404页面 ==========
    {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: () =>
            import ("../pages/Error/NotFound.vue"),
        meta: {
            titleKey: "route.notFound",
            requiresAuth: false,
        },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    // 路由切换时滚动到顶部
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { top: 0 };
        }
    },
});

// ========== 全局路由守卫 ==========
router.beforeEach(async(to, from, next) => {
    const userStore = useUserStore();

    // 设置页面标题 (i18n)
    const titleKey = to.meta.titleKey;
    const translated = titleKey ? t(titleKey) : "GoingTour";
    document.title = `${translated} - GoingTour`;

    // 检查是否需要登录
    if (to.meta.requiresAuth) {
        if (!userStore.isLoggedIn) {
            // 未登录，重定向到登录页
            next({
                path: "/login",
                query: { redirect: to.fullPath }, // 保存原始路径，登录后跳转
            });
            return;
        }
    }

    // 检查是否需要先选择目的地
    if (to.meta.requiresDestination) {
        // 检查是否有城市参数或保存的进度
        const hasDestinationParam = to.query.city && to.query.cityName;
        const hasSavedProgress = localStorage.getItem('goingtour_trip_progress');

        let hasValidDestination = hasDestinationParam;

        // 如果没有URL参数，检查保存的进度
        if (!hasValidDestination && hasSavedProgress) {
            try {
                const progressData = JSON.parse(hasSavedProgress);
                const isValidProgress = progressData &&
                    progressData.baseForm &&
                    progressData.baseForm.destinationName &&
                    (Date.now() - progressData.timestamp <= 24 * 60 * 60 * 1000); // 24小时内有效

                hasValidDestination = isValidProgress;
            } catch (error) {
                console.warn('解析保存的进度失败:', error);
            }
        }

        if (!hasValidDestination) {
            // 没有目的地信息，重定向到目的地选择页面
            next({
                path: "/destinations",
                query: {
                    redirect: to.fullPath,
                    message: "请先选择目的地再创建行程"
                }
            });
            return;
        }
    }

    // 如果已登录用户访问登录页，重定向到个人中心
    if (
        userStore.isLoggedIn &&
        (to.path === "/login" || to.path === "/register")
    ) {
        next("/personal");
        return;
    }

    next();
});

export default router;