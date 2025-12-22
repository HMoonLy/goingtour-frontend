import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "element-plus/theme-chalk/dark/css-vars.css";
import App from "./App.vue";
import router from "./router/router.js";
import { initTheme } from "./utils/ui/theme.js";
import { useUserStore } from "./store/user.js";

// 导入全局样式
import "./style.css";
import "./styles/themes.css";
import "./styles/element-plus-overrides.css"; 

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

// 初始化应用
const initApp = async() => {
    initTheme();

    const userStore = useUserStore();
    userStore.loadFromStorage();
};

// 启动应用
initApp().then(() => {
    app.mount("#app");
}).catch((error) => {
    console.error("应用初始化失败:", error);
    app.mount("#app");
});
