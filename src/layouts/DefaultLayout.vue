<template>
  <div class="default-layout">
    <header class="layout-header">
      <div class="header-container">
        <div class="mobile-menu-btn" @click="toggleMobileMenu">
          <el-icon><Menu /></el-icon>
        </div>

        <div class="header-logo" @click="$router.push('/home')">
          <h2>GoingTour</h2>
        </div>

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
                <img src="/vite.svg" alt="avatar" />
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
                <el-dropdown-item v-if="isAdmin" command="admin">
                  <el-icon><Setting /></el-icon>后台管理
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

    <main class="layout-main" :class="{ 'trip-detail-layout': isTripDetailPage }" ref="mainContent">
      <div
        class="main-container"
        :class="{ 'trip-detail-container': isTripDetailPage, 'full-width': isFullWidthPage }"
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
  User,
  SwitchButton,
  ArrowDown,
  House,
  ChatDotRound,
  Menu,
  Setting,
} from "@element-plus/icons-vue";

export default {
  name: "DefaultLayout",
  components: {
    MapLocation,
    User,
    SwitchButton,
    ArrowDown,
    House,
    ChatDotRound,
    Menu,
    Setting,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const mainContent = ref(null);
    const mobileMenuVisible = ref(false);

    const userStore = useUserStore();
    const nickname = computed(() => userStore.nickname);
    const avatar = computed(() => userStore.avatar);
    const isAdmin = computed(() => userStore.isAdmin);
    const { logout } = useAuth();

    const activeMenu = computed(() => {
      const path = route.path;
      if (path === "/" || path.startsWith("/home")) return "/home";
      if (path.startsWith("/community")) return "/community";
      if (path.startsWith("/destinations")) return "/destinations";
      if (path.startsWith("/personal") || path.startsWith("/user")) return "/personal";
      if (path.startsWith("/admin")) return "/admin";
      return "";
    });

    const isTripDetailPage = computed(() => {
      return route.path.startsWith("/trip/") && route.params.id && !route.path.includes("/ai-trip/");
    });

    const isFullWidthPage = computed(() => {
      const path = route.path;
      return path.startsWith("/home") || path.startsWith("/destinations");
    });

    watch(
      () => route.path,
      () => {
        mobileMenuVisible.value = false;
        if (mainContent.value) {
          mainContent.value.scrollTop = 0;
        }
      },
    );

    const toggleMobileMenu = () => {
      mobileMenuVisible.value = !mobileMenuVisible.value;
    };

    const handleNavClick = (path) => {
      router.push(path);
      mobileMenuVisible.value = false;
    };

    const handleUserCommand = async (command) => {
      if (command === "logout") {
        await logout();
      } else if (command === "personal") {
        router.push("/personal");
      } else if (command === "admin") {
        router.push("/admin");
      }
      mobileMenuVisible.value = false;
    };

    return {
      activeMenu,
      nickname,
      avatar,
      isAdmin,
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
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  overflow: hidden;
}

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

.mobile-menu-btn {
  display: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-primary);
  padding: 8px;
  margin-right: 10px;
}

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

.layout-main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  width: 100%;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.layout-main.trip-detail-layout {
  overflow-y: auto;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100%;
  box-sizing: border-box;
  padding: 20px;
}

.main-container.full-width,
.main-container.trip-detail-container {
  max-width: none;
  padding: 0;
}

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

@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .header-container {
    padding: 0 16px;
    justify-content: space-between;
  }

  .header-logo h2 {
    font-size: 1.2rem;
  }

  .username {
    display: none;
  }

  .user-info {
    padding: 4px;
  }

  .dropdown-icon {
    display: none;
  }

  .main-container {
    padding: 16px;
  }

  .main-container.full-width {
    padding: 0;
  }
}
</style>
