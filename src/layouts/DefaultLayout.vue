<template>
  <div class="default-layout">
    <!-- 顶部导航栏 -->
    <header class="layout-header">
      <div class="header-container">
        <!-- 移动端菜单按钮 -->
        <div class="mobile-menu-btn" @click="toggleMobileMenu">
          <el-icon><Menu /></el-icon>
        </div>

        <div class="header-logo" @click="$router.push('/home')">
          <h2>GoingTour</h2>
        </div>

        <!-- 桌面端导航 -->
        <nav class="header-nav desktop-nav">
          <div class="nav-menu">
            <div
              class="nav-item"
              :class="{ 'is-active': activeMenu === '/home' }"
              @click="handleNavClick('/home')"
            >
              <el-icon><House /></el-icon>
              <span>首页</span>
            </div>
            <div
              class="nav-item"
              :class="{ 'is-active': activeMenu === '/community' }"
              @click="handleNavClick('/community')"
            >
              <el-icon><ChatDotRound /></el-icon>
              <span>社区</span>
            </div>
            <div
              class="nav-item"
              :class="{ 'is-active': activeMenu === '/destinations' }"
              @click="handleNavClick('/destinations')"
            >
              <el-icon><MapLocation /></el-icon>
              <span>目的地</span>
            </div>
            <div
              class="nav-item"
              :class="{ 'is-active': activeMenu === '/personal' }"
              @click="handleNavClick('/personal')"
            >
              <el-icon><User /></el-icon>
              <span>个人中心</span>
            </div>
          </div>
        </nav>

        <div class="header-user">
          <el-dropdown @command="handleUserCommand" trigger="click">
            <div class="user-info">
              <el-avatar :src="avatar" :size="32">
                <img src="@/assets/images/default-avatar.jpg" alt="avatar" />
              </el-avatar>
              <span class="username">{{ nickname }}</span>
              <el-icon class="dropdown-icon">
                <ArrowDown />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="personal">
                  <el-icon><User /></el-icon>个人资料
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- 移动端抽屉菜单 -->
    <el-drawer
      v-model="mobileMenuVisible"
      direction="ltr"
      size="70%"
      :with-header="false"
      class="mobile-nav-drawer"
      append-to-body
    >
      <div class="drawer-content">
        <div class="drawer-header" @click="handleNavClick('/home')">
          <h2>GoingTour</h2>
        </div>
        <div class="drawer-menu">
          <div
            class="drawer-item"
            :class="{ 'is-active': activeMenu === '/home' }"
            @click="handleNavClick('/home')"
          >
            <el-icon><House /></el-icon>
            <span>首页</span>
          </div>
          <div
            class="drawer-item"
            :class="{ 'is-active': activeMenu === '/community' }"
            @click="handleNavClick('/community')"
          >
            <el-icon><ChatDotRound /></el-icon>
            <span>社区</span>
          </div>
          <div
            class="drawer-item"
            :class="{ 'is-active': activeMenu === '/destinations' }"
            @click="handleNavClick('/destinations')"
          >
            <el-icon><MapLocation /></el-icon>
            <span>目的地</span>
          </div>
          <div
            class="drawer-item"
            :class="{ 'is-active': activeMenu === '/personal' }"
            @click="handleNavClick('/personal')"
          >
            <el-icon><User /></el-icon>
            <span>个人中心</span>
          </div>
        </div>
        <div class="drawer-footer">
          <el-button type="danger" plain @click="handleUserCommand('logout')" class="logout-btn">
            <el-icon><SwitchButton /></el-icon>退出登录
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 主要内容区域 -->
    <main
      class="layout-main"
      :class="{ 'trip-detail-layout': isTripDetailPage }"
      ref="mainContent"
    >
      <div
        class="main-container"
        :class="{
          'trip-detail-container': isTripDetailPage,
          'full-width': isFullWidthPage,
        }"
      >
      <router-view />
      </div>
    </main>
  </div>
</template>

<script>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/composables/user/useAuth.js";
import { useUserStore } from "@/store/user.js";
import {
  MapLocation,
  Calendar,
  User,
  SwitchButton,
  ArrowDown,
  House,
  ChatDotRound,
  Menu,
} from "@element-plus/icons-vue";

export default {
  name: "DefaultLayout",
  components: {
    MapLocation,
    Calendar,
    User,
    SwitchButton,
    ArrowDown,
    House,
    ChatDotRound,
    Menu,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const mainContent = ref(null);
    const mobileMenuVisible = ref(false);

    // 使用用户信息
    const userStore = useUserStore();
    const nickname = computed(() => userStore.nickname);
    const avatar = computed(() => userStore.avatar);

    // 认证功能
    const { logout } = useAuth();

    // 当前激活的菜单项
    const activeMenu = computed(() => {
      const path = route.path;
      if (path === "/" || path.startsWith("/home")) return "/home";
      if (path.startsWith("/community")) return "/community";
      if (path.startsWith("/destinations")) return "/destinations";
      if (path.startsWith("/personal") || path.startsWith("/user")) return "/personal";
      if (path.startsWith("/wishlist") || path.startsWith("/footprints")) return "/wishlist";
      return "";
    });

    // 监听路由变化，关闭移动端菜单并滚动到顶部
    watch(
      () => route.path,
      () => {
        mobileMenuVisible.value = false;
        if (mainContent.value) {
          mainContent.value.scrollTop = 0;
        }
      }
    );

    // 是否显示页脚
    const showFooter = computed(() => {
      const hideFooterRoutes = ["/trip/create"];
      return !hideFooterRoutes.includes(route.path);
    });

    // 检查是否是TripDetail页面
    const isTripDetailPage = computed(() => {
      return (
        route.path.startsWith("/trip/") &&
        route.params.id &&
        !route.path.includes("/ai-trip/")
      );
    });

    // 需要全宽布局的页面
    const isFullWidthPage = computed(() => {
      const path = route.path;
      return path.startsWith("/home") || path.startsWith("/destinations");
    });

    const toggleMobileMenu = () => {
      mobileMenuVisible.value = !mobileMenuVisible.value;
    };

    const handleNavClick = (path) => {
      router.push(path);
      mobileMenuVisible.value = false;
    };

    // 处理用户命令
    const handleUserCommand = async (command) => {
      if (command === "logout") {
        await logout();
      } else if (command === "personal") {
        router.push("/personal");
      }
      mobileMenuVisible.value = false;
    };

    return {
      activeMenu,
      showFooter,
      nickname,
      avatar,
      handleUserCommand,
      isTripDetailPage,
      isFullWidthPage,
      mobileMenuVisible,
      toggleMobileMenu,
      handleNavClick,
      mainContent,
    };
  },
};
</script>

<style scoped>
.default-layout {
  height: 100vh; /* 固定高度 */
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  overflow: hidden; /* 防止外层滚动 */
}

/* 顶部导航栏 */
.layout-header {
  background: var(--card-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  flex-shrink: 0;
  height: var(--header-height);
}

.header-container {
  width: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  position: relative;
  max-width: 1440px;
  margin: 0 auto;
}

.header-logo {
  cursor: pointer;
  transition: transform 0.2s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.header-logo:hover {
  transform: scale(1.05);
}

.header-logo h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #91a8d0, #f7cac9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-primary);
  padding: 8px;
  margin-right: 10px;
}

/* 导航菜单 */
.header-nav {
  flex: 1;
  display: flex;
  justify-content: center;
  margin: 0 20px;
}

.nav-menu {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  user-select: none;
}

.nav-item:hover,
.nav-item.is-active {
  background-color: var(--bg-secondary);
  color: var(--primary-color);
}

.nav-item .el-icon {
  font-size: 18px;
}

/* 用户信息区域 */
.header-user {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: var(--bg-secondary);
}

.username {
  margin: 0 8px;
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 500;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  font-size: 12px;
  color: #a0aec0;
}

/* 主要内容区域 */
.layout-main {
  flex: 1;
  overflow-y: auto; /* 允许垂直滚动 */
  overflow-x: hidden;
  position: relative;
  width: 100%;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch; /* iOS顺滑滚动 */
}

/* TripDetail页面特殊布局 */
.layout-main.trip-detail-layout {
  /* TripDetail可能需要特殊的滚动处理，保持一致性 */
  overflow-y: auto;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100%;
  box-sizing: border-box;
  padding: 20px;
}

/* 全宽布局 */
.main-container.full-width {
  max-width: none;
  padding: 0;
}

.main-container.trip-detail-container {
  max-width: none;
  padding: 0;
}


/* 移动端抽屉样式 */
.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
}

.drawer-header {
  margin-bottom: 30px;
  cursor: pointer;
}

.drawer-header h2 {
  font-size: 1.5rem;
  background: linear-gradient(135deg, #91a8d0, #f7cac9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.drawer-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.drawer-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 16px;
  transition: all 0.2s;
}

.drawer-item:hover,
.drawer-item.is-active {
  background-color: var(--bg-secondary);
  color: var(--primary-color);
}

.drawer-footer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.logout-btn {
  width: 100%;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .desktop-nav {
    display: none; /* 隐藏桌面端导航 */
  }

  .mobile-menu-btn {
    display: block; /* 显示移动端菜单按钮 */
  }

  .header-container {
    padding: 0 16px;
    justify-content: space-between;
  }

  /* 调整Header Logo位置 */
  .header-logo h2 {
    font-size: 1.2rem;
  }

  /* 调整用户信息显示 */
  .username {
    display: none; /* 移动端隐藏用户名 */
  }

  .user-info {
    padding: 4px;
  }
  
  .dropdown-icon {
    display: none;
  }

  .main-container {
    padding: 16px; /* 移动端内边距减小 */
  }
  
  .main-container.full-width {
    padding: 0;
  }
}
</style>
