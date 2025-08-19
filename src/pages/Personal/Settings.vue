<template>
  <div class="page-shell settings-page">
    <!-- 设置头部 -->
    <div class="settings-header">
      <el-button link class="back-btn" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1>个人设置</h1>
    </div>

    <!-- 设置内容 -->
    <div class="settings-content">
      <!-- 设置导航 -->
      <div class="settings-nav">
        <div class="nav-list">
          <div
            v-for="section in sections"
            :key="section.key"
            class="nav-item"
            :class="{ active: activeSection === section.key }"
            @click="activeSection = section.key"
          >
            <el-icon>
              <component :is="section.icon" />
            </el-icon>
            <span>{{ section.title }}</span>
          </div>
        </div>
      </div>

      <!-- 设置面板 -->
      <div class="settings-panel">
        <!-- 基本信息 -->
        <div v-if="activeSection === 'profile'" class="settings-section">
          <AccountSettings :embedded="true" />
        </div>

        <!-- 旅行偏好 -->
        <div v-else-if="activeSection === 'preferences'" class="settings-section">
          <!-- <Preferences :embedded="true" /> -->
          <PersonalProfile :embedded="true"></PersonalProfile>
        </div>

        <!-- 通知设置 -->
        <div v-else-if="activeSection === 'notifications'" class="settings-section">
          <Notifications :embedded="true" />
        </div>

        <!-- 隐私系统 -->
        <div v-else-if="activeSection === 'privacy'" class="settings-section">
          <PrivacySystem :embedded="true" />
        </div>

        <!-- 账户安全 -->
        <div v-else-if="activeSection === 'security'" class="settings-section">
          <AccountSecurity :embedded="true" />
        </div>

        <!-- 危险区域 -->
        <div v-else-if="activeSection === 'danger'" class="settings-section">
          <DangerZone :embedded="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { ArrowLeft, User, Star, Bell, Lock, Setting, Document, Warning } from "@element-plus/icons-vue";

// 导入User目录下的子组件
import AccountSettings from "../User/Profile/AccountSettings.vue";
import Notifications from "../User/Settings/Notifications.vue";
import PrivacySystem from "../User/Settings/PrivacySystem.vue";
import AccountSecurity from "../User/Settings/AccountSecurity.vue";
import DangerZone from "../User/Settings/DangerZone.vue";
import PersonalProfile from "../User/Settings/PersonalProfile.vue";

export default {
  name: "PersonalSettings",
  components: {
    ArrowLeft,
    User,
    Star,
    Bell,
    Lock,
    Setting,
    Document,
    Warning,
    AccountSettings,
    Notifications,
    PrivacySystem,
    AccountSecurity,
    DangerZone,
    PersonalProfile,
  },
  setup() {
    // 当前激活的设置部分
    const activeSection = ref("profile");

    // 设置导航
    const sections = [
      { key: "profile", title: "基本信息", icon: "User" },
      { key: "preferences", title: "旅行偏好", icon: "Star" },
      { key: "notifications", title: "通知设置", icon: "Bell" },
      { key: "privacy", title: "隐私系统", icon: "Setting" },
      { key: "security", title: "账户安全", icon: "Lock" },
      { key: "danger", title: "危险区域", icon: "Warning" },
    ];

    return {
      activeSection,
      sections,
    };
  },
};
</script>

<style scoped>
.settings-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.settings-header {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.back-btn {
  margin-right: 16px;
  font-size: 14px;
  color: #606266;
}

.settings-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.settings-content {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 32px;
}

/* 导航部分 */
.settings-nav {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  height: fit-content;
}

.nav-list {
  padding: 8px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #f5f7fa;
  color: #303133;
}

.nav-item.active {
  background: rgba(145, 168, 208, 0.1);
  color: #91a8d0;
  font-weight: 500;
}

.nav-item .el-icon {
  font-size: 16px;
}

/* 设置面板 */
.settings-panel {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  padding: 24px;
  min-height: 600px;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.settings-section {
  max-width: 100%;
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .settings-nav {
    order: 2;
  }

  .nav-list {
    display: flex;
    overflow-x: auto;
    padding: 8px;
    gap: 8px;
  }

  .nav-item {
    flex-shrink: 0;
    padding: 8px 12px;
    border-radius: 6px;
    white-space: nowrap;
  }

  .settings-panel {
    order: 1;
  }
}
</style>
