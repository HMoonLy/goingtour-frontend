<template>
  <div class="default-layout">
    <!-- 顶部导航栏 -->
    <header class="layout-header">
      <div class="header-container">
                <div
          class="header-logo" @click="$router.push('/destinations')"
        >
          <h2>GoingTour</h2>
        </div>

        <nav class="header-nav">
          <div class="nav-menu">
            <div
              class="nav-item"
              :class="{ 'is-active': activeMenu === '/destinations' }"
              @click="$router.push('/destinations')"
            >
              <el-icon><MapLocation /></el-icon>
              <span>目的地</span>
            </div>
            <div
              class="nav-item"
              :class="{ 'is-active': activeMenu === '/trip/create' }"
              @click="$router.push('/trip/create')"
            >
              <el-icon><Calendar /></el-icon>
              <span>创建行程</span>
            </div>
          </div>
        </nav>

        <div class="header-user">
          <el-dropdown @command="handleUserCommand">
            <div class="user-info">
              <el-avatar
:src="userStore.avatar" :size="32"
>
                <img
src="../assets/images/default-avatar.jpg" alt="avatar" />
              </el-avatar>
              <span class="username">{{ userStore.nickname }}</span>
              <el-icon class="dropdown-icon">
                <ArrowDown />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="personal">
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item command="preferences">
                  <el-icon><Setting /></el-icon>偏好设置
                </el-dropdown-item>
                <el-dropdown-item
divided command="logout"
>
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main
      class="layout-main"
      :class="{ 'trip-detail-layout': isTripDetailPage }"
    >
      <div
        class="main-container"
        :class="{ 'trip-detail-container': isTripDetailPage }"
      >
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store/user.js";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  MapLocation,
  Calendar,
  User,
  Setting,
  SwitchButton,
  ArrowDown,
} from "@element-plus/icons-vue";

export default {
  name: "DefaultLayout",
  components: {
    MapLocation,
    Calendar,
    User,
    Setting,
    SwitchButton,
    ArrowDown,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();

    // 当前激活的菜单项
    const activeMenu = computed(() => {
      const path = route.path;
      if (path.startsWith("/destinations")) return "/destinations";
      if (path.startsWith("/trip/create")) return "/trip/create";
      // 其他页面不激活任何主导航菜单项
      return "";
    });

    // 是否显示页脚
    const showFooter = computed(() => {
      // 在某些页面可能不需要显示页脚
      const hideFooterRoutes = ["/trip/create"];
      return !hideFooterRoutes.includes(route.path);
    });

    // 检查是否是TripDetail页面
    const isTripDetailPage = computed(() => {
      return route.path.startsWith("/trip/") && route.params.id && !route.path.includes("/ai-trip/");
    });

    // 处理用户命令
    const handleUserCommand = async (command) => {
      if (command === "logout") {
        try {
          await ElMessageBox.confirm("确定要退出登录吗？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          });

          // 执行退出登录
          userStore.logout();
          ElMessage.success("退出登录成功");

          // 跳转到登录页
          router.push("/login");
        } catch (error) {
          // 用户取消退出
          console.log("用户取消退出登录");
        }
      } else if (command === "personal") {
        router.push("/personal");
      } else if (command === "preferences") {
        router.push("/preferences");
      }
    };

    return {
      activeMenu,
      showFooter,
      userStore,
      handleUserCommand,
      isTripDetailPage,
    };
  },
};
</script>

<style scoped>
.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f7fafc;
  overflow-x: hidden; /* 只防止水平滚动条 */
}

/* 顶部导航栏 */
.layout-header {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 1000;
  flex-shrink: 0; /* 防止导航栏被压缩 */
}

.header-container {
  width: 100%;
  max-width: none;
  padding: 0 24px; /* 减少左右padding，给菜单更多空间 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  position: relative; /* 确保定位上下文 */
}

.header-logo {
  cursor: pointer;
  transition: transform 0.2s;
  flex-shrink: 0; /* 防止logo被压缩 */
  z-index: 1; /* 确保logo在最上层 */
}

.header-logo:hover {
  transform: scale(1.05);
}

.header-logo h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-nav {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 0;
  max-width: 600px; /* 限制最大宽度，避免过度拉伸 */
  margin: 0 20px; /* 左右给一些边距 */
}

.nav-menu {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 16px; /* 菜单项之间的间距 */
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: #2d3748;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  user-select: none;
}

.nav-item:hover {
  background-color: #f7fafc;
  color: #667eea;
}

.nav-item.is-active {
  background-color: #edf2f7;
  color: #667eea;
}

.nav-item .el-icon {
  font-size: 16px;
}

/* 用户信息区域 */
.header-user {
  display: flex;
  align-items: center;
  flex-shrink: 0; /* 防止用户区域被压缩 */
  min-width: 120px; /* 确保最小宽度 */
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f7fafc;
}

.username {
  margin: 0 8px;
  font-size: 0.9rem;
  color: #2d3748;
  font-weight: 500;
}

.dropdown-icon {
  font-size: 12px;
  color: #a0aec0;
}

/* 主要内容区域 */
.layout-main {
  flex: 1;
  overflow-y: auto; /* 允许垂直滚动 */
  overflow-x: hidden; /* 防止水平滚动 */
  min-height: calc(100vh - 64px); /* 确保最小高度，减去导航栏高度 */
  position: relative;
  width: 100%;
}

/* TripDetail页面特殊布局 */
.layout-main.trip-detail-layout {
  overflow: visible; /* TripDetail页面允许溢出 */
  position: relative;
  z-index: 1; /* 确保内容在导航栏下方 */
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0; /* 移除padding，让子页面自己控制 */
  min-height: auto; /* 不限制最小高度 */
  box-sizing: border-box;
  width: 100%;
}

/* TripDetail页面的容器特殊处理 */
.main-container.trip-detail-container {
  max-width: none; /* 移除宽度限制 */
  margin: 0;
  padding: 0;
  position: relative;
  z-index: 1;
  min-height: auto; /* 重置最小高度 */
}

/* 全宽布局，用于destinations等页面 */
.main-container.full-width {
  max-width: none;
  margin: 0;
  padding: 0;
  min-height: auto; /* 重置最小高度 */
}

/* 页脚 */
.layout-footer {
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 20px 0;
  flex-shrink: 0; /* 防止页脚被压缩 */
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.footer-container p {
  color: #718096;
  font-size: 0.85rem;
  margin: 0;
}

/* 响应式设计 */
@media (min-width: 1200px) {
  .header-container {
    padding: 0 40px; /* 大屏幕上给更多空间 */
  }

  .header-nav {
    max-width: 800px; /* 大屏幕上允许更宽的菜单 */
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
  }

  .header-nav {
    margin: 0 10px;
  }

  .nav-item {
    padding: 8px 12px;
    font-size: 13px;
  }

  .layout-main {
    min-height: calc(100vh - 56px); /* 移动端导航栏可能更矮 */
  }

  .main-container {
    padding: 15px;
  }

  /* 全宽布局在移动端保持全宽 */
  .main-container.full-width {
    padding: 0;
  }

  .username {
    display: none; /* 移动端隐藏用户名，节省空间 */
  }
}

@media (max-width: 480px) {
  .header-container {
    height: 56px;
    padding: 0 12px;
  }

  .header-logo h2 {
    font-size: 1.3rem;
  }

  .header-nav {
    margin: 0 6px;
  }

  .nav-item {
    padding: 6px 10px;
    font-size: 12px;
  }

  .nav-item span {
    display: none; /* 超小屏幕只显示图标 */
  }

  .layout-main {
    min-height: calc(100vh - 56px); /* 超小屏幕的导航栏高度 */
  }

  .main-container {
    padding: 10px;
  }

  /* 全宽布局在超小屏幕也保持全宽 */
  .main-container.full-width {
    padding: 0;
  }
}
</style>
