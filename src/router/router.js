import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/store/user";

const routes = [
  // ========== 认证相关页面（无需登录） ==========
  {
    path: "/login",
    name: "Login",
    component: () => import("../pages/User/Auth/Login.vue"),
    meta: {
      titleKey: "route.login",
      requiresAuth: false,
    },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../pages/User/Auth/Register.vue"),
    meta: {
      titleKey: "route.register",
      requiresAuth: false,
    },
  },

  // ========== 主应用页面（使用DefaultLayout） ==========
  {
    path: "/",
    component: () => import("../layouts/DefaultLayout.vue"),
    children: [
      // 默认重定向到首页
      {
        path: "",
        redirect: "/home",
      },

      // 用户模块
      {
        path: "home",
        name: "Home",
        component: () => import("../pages/Home/Dashboard.vue"),
        meta: {
          titleKey: "route.home",
          requiresAuth: true,
        },
      },
      {
        path: "personal",
        name: "Personal",
        component: () => import("../pages/User/Profile/Profile.vue"),
        meta: {
          titleKey: "route.personal",
          requiresAuth: true,
        },
      },
      {
        path: "personal/profile",
        name: "PersonalProfile",
        component: () => import("../pages/User/Profile/Profile.vue"),
        meta: {
          titleKey: "route.personal",
          requiresAuth: true,
        },
      },
      {
        path: "personal/security",
        name: "PersonalSecurity",
        component: () => import("../pages/User/Settings/Security.vue"),
        meta: {
          titleKey: "settings.securitySettings",
          requiresAuth: true,
        },
      },
      {
        path: "personal/preferences",
        name: "PersonalPreferences",
        component: () => import("../pages/User/Settings/Preferences.vue"),
        meta: {
          titleKey: "settings.preferences",
          requiresAuth: true,
        },
      },
      {
        path: "personal/notifications",
        name: "PersonalNotifications",
        component: () => import("../pages/User/Settings/Notifications.vue"),
        meta: {
          titleKey: "settings.notifications",
          requiresAuth: true,
        },
      },
      {
        path: "personal/system",
        name: "PersonalSystem",
        component: () => import("../pages/User/Settings/SystemSettings.vue"),
        meta: {
          titleKey: "settings.systemSettings",
          requiresAuth: true,
        },
      },
      {
        path: "personal/history",
        name: "PersonalHistory",
        component: () => import("../pages/User/Settings/LoginHistory.vue"),
        meta: {
          titleKey: "settings.loginHistory",
          requiresAuth: true,
        },
      },
      {
        path: "personal/data",
        name: "PersonalData",
        component: () => import("../pages/User/Settings/DataAndPrivacy.vue"),
        meta: {
          titleKey: "settings.exportData",
          requiresAuth: true,
        },
      },
      {
        path: "personal/danger",
        name: "PersonalDanger",
        component: () => import("../pages/User/Settings/DangerZone.vue"),
        meta: {
          titleKey: "settings.deleteAccount",
          requiresAuth: true,
        },
      },
      {
        path: "account-settings",
        name: "AccountSettings",
        component: () => import("../pages/User/Profile/AccountSettings.vue"),
        meta: {
          titleKey: "route.accountSettings",
          requiresAuth: true,
        },
      },
      {
        path: "preferences",
        name: "Preferences",
        component: () => import("../pages/User/Settings/Preferences.vue"),
        meta: {
          titleKey: "route.preferences",
          requiresAuth: true,
        },
      },

      // 行程模块
      {
        path: "destinations",
        name: "Destinations",
        component: () => import("../pages/Trip/Destinations.vue"),
        meta: {
          titleKey: "route.destinations",
          requiresAuth: true,
        },
      },
      {
        path: "trip/create",
        name: "TripCreate",
        component: () => import("../pages/Trip/TripCreate.vue"),
        meta: {
          titleKey: "route.tripCreate",
          requiresAuth: true,
          requiresDestination: true, // 需要先选择目的地
        },
      },
      {
        path: "trip/:id",
        name: "TripDetail",
        component: () => import("../pages/Trip/TripDetail.vue"),
        props: true,
        meta: {
          titleKey: "route.tripDetail",
          requiresAuth: true,
        },
      },
      {
        path: "ai-trip/:id/edit",
        name: "AiTripEdit",
        component: () => import("../pages/Trip/AiTripEdit.vue"),
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
        component: () => import("../pages/Data/AttractionDetail.vue"),
        props: true,
        meta: {
          titleKey: "route.attractionDetail",
          requiresAuth: false, // 景点详情可以不登录查看
        },
      },
      {
        path: "restaurants",
        name: "RestaurantList",
        component: () => import("../pages/Data/RestaurantList.vue"),
        meta: {
          titleKey: "route.restaurantList",
          requiresAuth: false,
        },
      },
      {
        path: "search",
        name: "Search",
        component: () => import("../pages/Data/Search.vue"),
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
    component: () => import("../pages/Trip/TripShare.vue"),
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
    component: () => import("../pages/Error/NotFound.vue"),
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
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  // 路由标题映射
  const titleMap = {
    "route.login": "登录",
    "route.register": "注册",
    "route.home": "首页",
    "route.personal": "个人中心",
    "route.accountSettings": "账户设置",
    "route.preferences": "偏好设置",
    "route.destinations": "选择目的地",
    "route.tripCreate": "创建行程",
    "route.tripDetail": "行程详情",
    "route.aiTripEdit": "编辑AI行程",
    "route.attractionDetail": "景点详情",
    "route.restaurantList": "餐厅列表",
    "route.search": "搜索结果",
    "route.tripShare": "行程分享",
    "route.notFound": "页面不存在",
    "settings.securitySettings": "安全设置",
    "settings.notifications": "通知设置",
    "settings.systemSettings": "系统设置",
    "settings.loginHistory": "登录记录",
    "settings.exportData": "导出数据",
    "settings.deleteAccount": "注销账户"
  };

  const titleKey = to.meta.titleKey;
  const translated = titleKey ? titleMap[titleKey] || "GoingTour" : "GoingTour";
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
    const hasSavedProgress = localStorage.getItem("goingtour_trip_progress");
    
    // 检查是否有草稿正在加载（通过Pinia store）
    let hasDraftToRestore = false;
    try {
      // 动态导入并检查草稿store
      const { useDraftStore } = await import("@/store/draft.js");
      const draftStore = useDraftStore();
      hasDraftToRestore = draftStore.hasDraftToRestore();
      console.log("🔍 路由守卫检查草稿状态:", hasDraftToRestore);
    } catch (error) {
      console.warn("检查草稿store失败:", error);
    }

    let hasValidDestination = hasDestinationParam || hasDraftToRestore;

    // 如果没有URL参数和草稿，检查保存的进度
    if (!hasValidDestination && hasSavedProgress) {
      try {
        const progressData = JSON.parse(hasSavedProgress);
        const isValidProgress =
          progressData &&
          progressData.baseForm &&
          progressData.baseForm.destinationName &&
          Date.now() - progressData.timestamp <= 24 * 60 * 60 * 1000; // 24小时内有效

        hasValidDestination = isValidProgress;
      } catch (error) {
        console.warn("解析保存的进度失败:", error);
      }
    }

    if (!hasValidDestination) {
      // 没有目的地信息，重定向到目的地选择页面
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

  // 如果已登录用户访问登录页，重定向到首页
  if (
    userStore.isLoggedIn &&
    (to.path === "/login" || to.path === "/register")
  ) {
    next("/home");
    return;
  }

  next();
});

export default router;
