import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "element-plus/theme-chalk/dark/css-vars.css";
import App from "./App.vue";
import router from "./router/router.js";
import { useUserStore } from "./store/user.js";
import { initTheme } from "./utils/theme.js";

// 导入全局样式
import "./style.css";
import "./styles/themes.css";

// 创建Vue应用实例
const app = createApp(App);

// 创建Pinia状态管理
const pinia = createPinia();

// 注册Pinia
app.use(pinia);

// 注册路由
app.use(router);

// 注册Element Plus
app.use(ElementPlus);

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 开发环境下的调试功能
if (import.meta.env.DEV) {
  // 清理用户状态的调试方法
  window.clearUserState = () => {
    localStorage.removeItem("goingtour_user");
    localStorage.removeItem("goingtour_token");
    localStorage.removeItem("goingtour_refresh_token");
    localStorage.removeItem("goingtour_token_expiry");
    localStorage.removeItem("goingtour_preferences");
    console.log("✅ 用户状态已清理，请刷新页面");
    window.location.reload();
  };

  // 查看当前用户状态的调试方法
  window.checkUserState = () => {
    const userData = localStorage.getItem("goingtour_user");
    const token = localStorage.getItem("goingtour_token");
    const refreshToken = localStorage.getItem("goingtour_refresh_token");
    const tokenExpiry = localStorage.getItem("goingtour_token_expiry");
    console.log("📊 当前用户状态:");
    console.log("- userData:", userData ? JSON.parse(userData) : null);
    console.log("- accessToken:", token);
    console.log("- refreshToken:", refreshToken);
    console.log(
      "- tokenExpiry:",
      tokenExpiry ? new Date(parseInt(tokenExpiry)) : null,
    );
  };
}

// 初始化应用
const initApp = async () => {
  // i18n功能已移除，应用直接使用中文界面

  // 初始化主题
  initTheme();

  // 初始化用户状态（包括JWT令牌恢复）
  const userStore = useUserStore();
  userStore.init();

  // 如果用户已登录，刷新用户信息
  if (userStore.isLoggedIn && userStore.currentUser?.id) {
    try {
      await userStore.fetchUserInfo();
    } catch (error) {
      console.warn("刷新用户信息失败:", error);
      // 如果刷新失败，可能token已过期，清除登录状态
      userStore.logout();
    }
  }
};

// 启动应用
initApp().then(() => {
  app.mount("#app");
});

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error("Vue全局错误:", err, info);
  // 这里可以上报错误到监控系统
};

// 开发环境下的基本启动信息
if (import.meta.env.DEV) {
  console.log("🚀 GoingTour 应用启动成功");
}

// 初始化PWA功能
if (import.meta.env.PROD) {
  import("./utils/pwaManager.js")
    .then(({ pwaManager }) => {
      console.log("🔧 PWA功能已初始化");
    })
    .catch((error) => {
      console.error("PWA初始化失败:", error);
    });
}

// 初始化无障碍访问功能
import("./utils/accessibility.js")
  .then(({ initAccessibility }) => {
    initAccessibility();
    console.log("♿ 无障碍访问功能已启用");
  })
  .catch((error) => {
    console.error("无障碍访问初始化失败:", error);
  });

// 性能监控（开发环境）
if (import.meta.env.DEV) {
  app.config.performance = true;
}

// 处理未捕获的Promise错误
window.addEventListener("unhandledrejection", (event) => {
  console.error("未处理的Promise拒绝:", event.reason);
  // 阻止默认的控制台错误输出
  // event.preventDefault()
});
