import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/store/user";

function hasAdminRole(role) {
    const normalized = (role || "").toUpperCase();
    return normalized === "ADMIN" || normalized === "ROLE_ADMIN";
}

const routes = [
    {
        path: "/login",
        name: "Login",
        component: () =>
            import("../pages/User/Auth/Login.vue"),
        meta: {
            titleKey: "route.login",
            requiresAuth: false,
        },
    },
    {
        path: "/register",
        name: "Register",
        component: () =>
            import("../pages/User/Auth/Register.vue"),
        meta: {
            titleKey: "route.register",
            requiresAuth: false,
        },
    },
    {
        path: "/admin-login",
        name: "AdminLogin",
        component: () =>
            import("../pages/Admin/AdminLogin.vue"),
        meta: {
            titleKey: "route.adminLogin",
            requiresAuth: false,
        },
    },
    {
        path: "/",
        component: () =>
            import("../layouts/DefaultLayout.vue"),
        children: [
            {
                path: "",
                redirect: "/home",
            },
            {
                path: "home",
                name: "Home",
                component: () =>
                    import("../pages/Home/Dashboard.vue"),
                meta: {
                    titleKey: "route.home",
                    requiresAuth: false,
                },
            },
            {
                path: "user/dashboard",
                name: "UserDashboard",
                component: () =>
                    import("../pages/User/components/Dashboard.vue"),
                meta: {
                    titleKey: "route.personal",
                    requiresAuth: true,
                },
            },
            {
                path: "personal",
                redirect: "/user/dashboard",
            },
            {
                path: "user/settings",
                name: "UserSettings",
                component: () =>
                    import("../pages/User/Settings/index.vue"),
                meta: {
                    titleKey: "route.personalSettings",
                    requiresAuth: true,
                },
            },
            {
                path: "personal/settings",
                redirect: "/user/settings",
            },
            {
                path: "user/profile",
                name: "PersonalProfile",
                component: () =>
                    import("../pages/User/Settings/PersonalProfile.vue"),
                meta: {
                    titleKey: "route.personalProfile",
                    requiresAuth: true,
                },
            },
            {
                path: "u/:userId",
                name: "UserProfile",
                component: () =>
                    import("../pages/User/Profile/UserProfile.vue"),
                meta: {
                    titleKey: "route.userProfile",
                    requiresAuth: false,
                },
            },
            {
                path: "footprints",
                name: "Footprints",
                component: () =>
                    import("../pages/Footprints/FootprintsPage.vue"),
                meta: {
                    titleKey: "route.footprints",
                    requiresAuth: true,
                },
            },
            {
                path: "wishlist",
                redirect: "/footprints",
            },
            {
                path: "community",
                name: "CommunityPlaza",
                component: () =>
                    import("../pages/Community/CommunityPlaza.vue"),
                meta: {
                    titleKey: "route.community",
                    requiresAuth: false,
                },
            },
            {
                path: "community/post/:id",
                name: "PostDetail",
                component: () =>
                    import("../pages/Community/PostDetail.vue"),
                meta: {
                    titleKey: "route.postDetail",
                    requiresAuth: false,
                },
            },
            {
                path: "community/publish",
                name: "PostPublish",
                component: () =>
                    import("../pages/Community/PostPublish.vue"),
                meta: {
                    titleKey: "route.postPublish",
                    requiresAuth: true,
                },
            },
            {
                path: "destinations",
                name: "Destinations",
                component: () =>
                    import("../pages/Trip/Destinations.vue"),
                meta: {
                    titleKey: "route.destinations",
                    requiresAuth: true,
                },
            },
            {
                path: "trip/create",
                name: "TripCreate",
                component: () =>
                    import("../pages/Trip/TripCreate.vue"),
                meta: {
                    titleKey: "route.tripCreate",
                    requiresAuth: true,
                    requiresDestination: true,
                },
            },
            {
                path: "ai-trip/:id/edit",
                name: "AiTripEdit",
                component: () =>
                    import("../pages/Trip/AiTripEdit.vue"),
                props: true,
                meta: {
                    titleKey: "route.aiTripEdit",
                    requiresAuth: true,
                },
            },
        ],
    },
    {
        path: "/admin",
        component: () =>
            import("../layouts/AdminLayout.vue"),
        children: [
            {
                path: "",
                name: "AdminPanel",
                component: () =>
                    import("../pages/Admin/AdminPanel.vue"),
                meta: {
                    titleKey: "route.admin",
                    requiresAuth: true,
                    requiresAdmin: true,
                },
            },
        ],
    },
    {
        path: "/share/trip/:id",
        name: "TripShare",
        component: () =>
            import("../pages/Trip/TripShare.vue"),
        props: true,
        meta: {
            titleKey: "route.tripShare",
            requiresAuth: false,
        },
    },
    {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: () =>
            import("../pages/Error/NotFound.vue"),
        meta: {
            titleKey: "route.notFound",
            requiresAuth: false,
        },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { top: 0 };
        }
    },
});
router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore();
    const titleMap = {
        "route.login": "Login",
        "route.register": "Register",
        "route.adminLogin": "Admin Login",
        "route.home": "Home",
        "route.community": "Community",
        "route.postDetail": "Post Detail",
        "route.postPublish": "Publish Post",
        "route.personal": "Personal Center",
        "route.personalProfile": "Profile",
        "route.userProfile": "User Profile",
        "route.accountSettings": "Account Settings",
        "route.preferences": "Preferences",
        "route.destinations": "Destinations",
        "route.tripCreate": "Create Trip",
        "route.tripDetail": "Trip Detail",
        "route.aiTripEdit": "Edit AI Trip",
        "route.attractionDetail": "Attraction Detail",
        "route.restaurantList": "Restaurant List",
        "route.search": "Search",
        "route.tripShare": "Trip Share",
        "route.admin": "Admin Panel",
        "route.notFound": "Not Found",
        "route.footprints": "Footprints",
        "route.wishlist": "Wishlist",
        "settings.securitySettings": "Security Settings",
        "settings.notifications": "Notifications",
        "settings.systemSettings": "System Settings",
        "settings.loginHistory": "Login History",
        "settings.exportData": "Export Data",
        "settings.deleteAccount": "Delete Account",
    };
    const titleKey = to.meta.titleKey;
    const translated = titleKey ? titleMap[titleKey] || "GoingTour" : "GoingTour";
    document.title = `${translated} - GoingTour`;

    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
        const loginPath = to.path.startsWith("/admin") ? "/admin-login" : "/login";
        next({
            path: loginPath,
            query: { redirect: to.fullPath },
        });
        return;
    }

    // Logged-in user without role in local storage: pull once from backend.
    if (userStore.isLoggedIn && userStore.currentUser?.id && !userStore.currentUser?.role) {
        try {
            const { userApi } = await import("@/api/user.js");
            const res = await userApi.getUserInfo(userStore.currentUser.id);
            const role = res?.data?.role;
            const status = res?.data?.status;
            if (role || status) {
                userStore.updateUserInfo({ role, status });
            }
        } catch (error) {
            console.warn("Failed to sync user role:", error);
        }
    }

    if (to.meta.requiresAdmin && !hasAdminRole(userStore.currentUser?.role)) {
        next("/home");
        return;
    }

    // Admin users are restricted to admin routes only.
    if (userStore.isLoggedIn && hasAdminRole(userStore.currentUser?.role)) {
        const isAdminRoute = to.path === "/admin" || to.path.startsWith("/admin/");
        const isAuthRoute = to.path === "/login" || to.path === "/register" || to.path === "/admin-login";
        if (!isAdminRoute && !isAuthRoute) {
            next("/admin");
            return;
        }
    }
    if (to.meta.requiresDestination) {
        const hasDestinationParam = to.query.city && to.query.cityName;
        const hasLoadDraftParam = !!to.query.loadDraft;
        const hasSavedProgress = localStorage.getItem("goingtour_trip_progress");
        let hasDraftToRestore = false;
        try {
            const { useDraft } = await import("@/composables/trip/useDraft.js");
            const draft = useDraft();
            hasDraftToRestore = draft.hasDraftToRestore();
        } catch (error) {
            console.warn("Failed to check local draft:", error);
        }

        let hasValidDestination = hasDestinationParam || hasDraftToRestore || hasLoadDraftParam;
        if (!hasValidDestination && hasSavedProgress) {
            try {
                const progressData = JSON.parse(hasSavedProgress);
                const isValidProgress =
                    progressData &&
                    progressData.baseForm &&
                    progressData.baseForm.destinationName &&
                    Date.now() - progressData.timestamp <= 24 * 60 * 60 * 1000;

                hasValidDestination = isValidProgress;
            } catch (error) {
                console.warn("Failed to parse saved trip progress:", error);
            }
        }

        if (!hasValidDestination) {
            next({
                path: "/destinations",
                query: {
                    redirect: to.fullPath,
                    message: "请先选择目的地再创建行程",
                },
            });
            return;
        }
    }
    if (
        userStore.isLoggedIn &&
        (to.path === "/login" || to.path === "/register" || to.path === "/admin-login")
    ) {
        next(hasAdminRole(userStore.currentUser?.role) ? "/admin" : "/home");
        return;
    }

    next();
});

export default router;


