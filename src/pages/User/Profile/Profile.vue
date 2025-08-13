<template>
  <div class="profile-page">
    <div class="profile-header">
      <el-avatar
:src="userStore.avatar" :size="72"
/>
      <div class="profile-basic">
        <h2>{{ userStore.nickname }}</h2>
        <p v-if="userStore.email"
class="email">
          {{ userStore.email }}
        </p>
      </div>
    </div>

    <!-- 移除顶部重复按钮，避免与下方功能卡片重复 -->

    <el-card class="quick-nav">
      <div class="grid">
        <div
class="grid-item" @click="openSecurity()"
>
          <el-icon><Lock /></el-icon>
          <span class="title">安全设置</span>
        </div>
        <div
class="grid-item" @click="openPreferences()"
>
          <el-icon><Setting /></el-icon>
          <span class="title">个性化设置</span>
        </div>
        <div
class="grid-item" @click="openNotifications()"
>
          <el-icon><Bell /></el-icon>
          <span class="title">通知设置</span>
        </div>
        <div
class="grid-item" @click="openSystem()"
>
          <el-icon><Cpu /></el-icon>
          <span class="title">系统设置</span>
        </div>
        <div
class="grid-item" @click="openHistory()"
>
          <el-icon><Timer /></el-icon>
          <span class="title">登录历史</span>
        </div>
        <div
class="grid-item" @click="openData()"
>
          <el-icon><Document /></el-icon>
          <span class="title">隐私设置</span>
        </div>
        <div
class="grid-item danger" @click="openDanger()"
>
          <el-icon><Warning /></el-icon>
          <span class="title">删除账户</span>
        </div>
      </div>
    </el-card>
    <div class="profile-sections">
      <el-card class="section-card">
        <template #header>
          <div class="card-header">
            <span>个人资料设置</span>
          </div>
        </template>
        <div class="row">
          <span class="label">昵称</span>
          <span class="value">{{ userStore.nickname }}</span>
        </div>
        <div class="row">
          <span class="label">手机号</span>
          <span class="value">{{
            userStore.currentUser?.phone || "未绑定"
          }}</span>
        </div>
        <div class="row">
          <span class="label">加入时间</span>
          <span class="value">{{ joinDateText }}</span>
        </div>
      </el-card>

      <!-- 偏好快速概览，与首页保持一致结构 -->
      <el-card class="section-card">
        <template #header>
          <div class="card-header">
            <span>我的偏好</span>
          </div>
        </template>
        <div v-if="parsedPreferences.mbtiType"
class="summary-row">
          <img
            class="mbti-badge"
            :src="`/images/mbti/${parsedPreferences.mbtiType}.png`"
          />
          <span class="summary-text">
            {{ parsedPreferences.mbtiType }} ·
            {{ getMbtiName(parsedPreferences.mbtiType) }}
          </span>
        </div>
        <div v-if="summaryTransportText"
class="summary-row">
          <span class="summary-label">交通方式</span>
          <span class="summary-text">{{ summaryTransportText }}</span>
        </div>
        <div v-if="summaryPaceText"
class="summary-row">
          <span class="summary-label">旅行节奏</span>
          <span class="summary-text">{{ summaryPaceText }}</span>
        </div>
        <div v-if="summaryDietText"
class="summary-row">
          <span class="summary-label">饮食偏好</span>
          <span class="summary-text">{{ summaryDietText }}</span>
        </div>
      </el-card>
    </div>
  </div>
  <el-drawer v-model="showPref" title="个性化设置" size="60%" destroy-on-close>
    <Preferences
embedded @saved="onPrefSaved"
/>
  </el-drawer>

  <el-drawer
    v-model="showSecurity"
    title="安全设置"
    size="60%"
    destroy-on-close
  >
    <Security embedded />
  </el-drawer>

  <el-drawer
    v-model="showNotifications"
    title="通知设置"
    size="60%"
    destroy-on-close
  >
    <Notifications embedded />
  </el-drawer>

  <el-drawer v-model="showSystem" title="系统设置" size="60%" destroy-on-close>
    <SystemSettings embedded />
  </el-drawer>

  <el-drawer v-model="showHistory" title="登录历史" size="60%" destroy-on-close>
    <LoginHistory embedded />
  </el-drawer>

  <el-drawer v-model="showData" title="隐私设置" size="60%" destroy-on-close>
    <DataAndPrivacy embedded />
  </el-drawer>

  <el-drawer v-model="showDanger" title="删除账户" size="60%" destroy-on-close>
    <DangerZone embedded />
  </el-drawer>
</template>

<script>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user.js";
// 自定义日期格式化函数
const formatDate = (date, options = {}) => {
  if (!date) return "";
  const defaultOptions = { year: "numeric", month: "long", day: "numeric" };
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      ...defaultOptions,
      ...options,
    }).format(new Date(date));
  } catch {
    return String(date);
  }
};
import {
  Lock,
  Setting,
  Bell,
  Cpu,
  Timer,
  Document,
  Warning,
} from "@element-plus/icons-vue";
import UserCenterNav from "@/components/User/UserCenterNav.vue";
import { translateTag, getMbtiName } from "@/utils/tagMapping.js";
import Preferences from "../Settings/Preferences.vue";
import Security from "../Settings/Security.vue";
import Notifications from "../Settings/Notifications.vue";
import SystemSettings from "../Settings/SystemSettings.vue";
import LoginHistory from "../Settings/LoginHistory.vue";
import DataAndPrivacy from "../Settings/DataAndPrivacy.vue";
import DangerZone from "../Settings/DangerZone.vue";

export default {
  name: "Profile",
  components: {
    UserCenterNav,
    Preferences,
    Security,
    Notifications,
    SystemSettings,
    LoginHistory,
    DataAndPrivacy,
    DangerZone,
    Lock,
    Setting,
    Bell,
    Cpu,
    Timer,
    Document,
    Warning,
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const showPref = ref(false);
    const showSecurity = ref(false);
    const showNotifications = ref(false);
    const showSystem = ref(false);
    const showHistory = ref(false);
    const showData = ref(false);
    const showDanger = ref(false);

    const joinDateText = computed(() => {
      const ts = userStore.currentUser?.createTime;
      if (!ts) return "";
      try {
        const date = new Date(ts);
        const pretty = formatDate(date, { year: "numeric", month: "long" });
        return `加入于 ${pretty}`;
      } catch (e) {
        return "";
      }
    });

    const goAccountSettings = () => router.push("/account-settings");
    const goPreferences = () => (showPref.value = true);
    const openSecurity = () => (showSecurity.value = true);
    const openPreferences = () => {
      showPref.value = true;
    };
    const openNotifications = () => (showNotifications.value = true);
    const openSystem = () => (showSystem.value = true);
    const openHistory = () => (showHistory.value = true);
    const openData = () => (showData.value = true);
    const openDanger = () => (showDanger.value = true);
    const onPrefSaved = () => {
      showPref.value = false;
    };

    // 解析偏好（与首页逻辑保持一致）
    const parsedPreferences = computed(() => {
      try {
        const preferences = userStore.currentUser?.preferences;
        if (!preferences) return {};
        return typeof preferences === "string"
          ? JSON.parse(preferences)
          : preferences;
      } catch {
        return {};
      }
    });
    const summaryTransportText = computed(() => {
      const transports = parsedPreferences.value.selectedTransports || [];
      return transports.length
        ? transports
            .slice(0, 3)
            .map((x) => translateTag(x))
            .join("、")
        : "";
    });
    const summaryPaceText = computed(() => {
      const pace = parsedPreferences.value.travelPace;
      return pace ? translateTag(pace) : "";
    });
    const summaryDietText = computed(() => {
      const tastes = parsedPreferences.value.foodTastes || [];
      const restrictions = parsedPreferences.value.dietaryRestrictions || [];
      const parts = [];
      if (tastes.length)
        parts.push(
          tastes
            .slice(0, 2)
            .map((x) => translateTag(x))
            .join("、"),
        );
      if (restrictions.length)
        parts.push(
          restrictions
            .slice(0, 2)
            .map((x) => translateTag(x, "dietary"))
            .join("、"),
        );
      return parts.join(" · ");
    });

    onMounted(() => {
      if (!userStore.isLoggedIn) router.push("/login");
    });

    return {
      userStore,
      joinDateText,
      goAccountSettings,
      goPreferences,
      showPref,
      showSecurity,
      showNotifications,
      showSystem,
      showHistory,
      showData,
      showDanger,
      openPreferences,
      openSecurity,
      openNotifications,
      openSystem,
      openHistory,
      openData,
      openDanger,
      onPrefSaved,
      translateTag,
      getMbtiName,
      parsedPreferences,
      summaryTransportText,
      summaryPaceText,
      summaryDietText,
    };
  },
};
</script>

<style scoped>
.profile-page {
  --content-max-width: 980px;
  position: fixed !important;
  top: 64px !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: calc(100vh - 64px) !important;
  margin: 0 !important;
  padding: 20px !important;
  background: #f5f7fa !important;
  overflow-y: auto !important;
  z-index: 1 !important;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 18px;
  width: 100% !important;
  max-width: 1200px !important;
  margin: 0 auto 24px auto !important;
  padding: 18px 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  color: #fff;
  box-shadow: 0 10px 30px rgba(247, 202, 201, 0.18);
  position: relative;
  overflow: hidden;
}
.profile-header::after {
  content: "";
  position: absolute;
  right: -40px;
  top: -40px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  filter: blur(2px);
}
.profile-header :deep(.el-avatar) {
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.18),
    0 0 0 4px rgba(255, 255, 255, 0.35);
}
.profile-basic h2 {
  margin: 0;
  color: #fff;
}
.profile-basic .email {
  color: rgba(255, 255, 255, 0.85);
  margin-top: 4px;
}
.profile-actions {
  margin: 16px 0;
  display: flex;
  gap: 12px;
}
.section-card {
  margin-bottom: 16px;
  width: 100% !important;
  max-width: 1200px !important;
  margin: 0 auto 24px auto !important;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}
.row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px dashed #eef2f7;
}
.row:last-child {
  border-bottom: none;
}
.label {
  color: #8a8f98;
}
.value {
  color: #2c2f36;
  font-weight: 600;
}

.quick-nav {
  margin-top: 16px;
  width: 100% !important;
  max-width: 1200px !important;
  margin: 0 auto 24px auto !important;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
.grid-item {
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 14px 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.grid-item:hover {
  border-color: rgba(145, 168, 208, 0.35);
  box-shadow: 0 10px 20px rgba(145, 168, 208, 0.18);
  transform: translateY(-3px);
}
.grid-item .title {
  font-weight: 600;
  color: #303133;
}
.grid-item .desc {
  color: #909399;
  font-size: 12px;
}
.grid-item.danger {
  border-color: #f56c6c;
}

/* 彩色图标圆点（与项目色系一致） */
.grid-item :deep(.el-icon) {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
}
.grid-item:nth-child(1) :deep(.el-icon) {
  background: linear-gradient(135deg, #91a8d0, #f7cac9);
}
.grid-item:nth-child(2) :deep(.el-icon) {
  background: linear-gradient(135deg, #f7cac9, #91a8d0);
}
.grid-item:nth-child(3) :deep(.el-icon) {
  background: linear-gradient(135deg, #91a8d0, #f7cac9);
}
.grid-item:nth-child(4) :deep(.el-icon) {
  background: linear-gradient(135deg, #91a8d0, #f7cac9);
}
.grid-item:nth-child(5) :deep(.el-icon) {
  background: linear-gradient(135deg, #f7cac9, #91a8d0);
}
.grid-item:nth-child(6) :deep(.el-icon) {
  background: linear-gradient(135deg, #91a8d0, #f7cac9);
}
.grid-item.danger :deep(.el-icon) {
  background: linear-gradient(135deg, #f56c6c, #f43f5e);
}

/* 偏好概览样式（与首页协调） */
.summary-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}
.summary-label {
  color: #909399;
  font-size: 13px;
  min-width: 84px;
}
.summary-text {
  color: #91a8d0;
  font-weight: 600;
  background: rgba(247, 202, 201, 0.1);
  padding: 6px 10px;
  border-radius: 999px;
}
.mbti-badge {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  object-fit: cover;
  background: #fff;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.12));
}
/* 卡片头部强调条 */
.section-card :deep(.el-card__header) {
  background: linear-gradient(
    90deg,
    rgba(145, 168, 208, 0.12),
    rgba(247, 202, 201, 0.06)
  );
}
.card-header {
  position: relative;
  padding-left: 10px;
}
.card-header::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  border-radius: 2px;
  background: linear-gradient(180deg, #91a8d0, #f7cac9);
}

/* 响应式优化 */
@media (max-width: 768px) {
  .profile-page {
    padding: 12px !important;
  }
  .profile-header {
    padding: 16px;
    gap: 12px;
    border-radius: 12px;
  }
  .summary-text {
    font-weight: 500;
  }
}
</style>
