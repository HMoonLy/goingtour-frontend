<template>
  <div class="profile-page">
    <div class="profile-header">
      <el-avatar :src="userStore.avatar" :size="72" />
      <div class="profile-basic">
        <h2>{{ userStore.nickname }}</h2>
        <p class="email" v-if="userStore.email">{{ userStore.email }}</p>
      </div>
    </div>

    <!-- 移除顶部重复按钮，避免与下方功能卡片重复 -->

    <el-card class="quick-nav">
      <div class="grid">
        <div class="grid-item" @click="goTo('/personal/security')">
          <el-icon><Lock /></el-icon>
          <span class="title">{{ t('settings.securitySettings') }}</span>
        </div>
        <div class="grid-item" @click="openPreferences()">
          <el-icon><Setting /></el-icon>
          <span class="title">{{ t('settings.preferences') }}</span>
        </div>
        <div class="grid-item" @click="goTo('/personal/notifications')">
          <el-icon><Bell /></el-icon>
          <span class="title">{{ t('settings.notifications') }}</span>
        </div>
        <div class="grid-item" @click="goTo('/personal/system')">
          <el-icon><Cpu /></el-icon>
          <span class="title">{{ t('settings.systemSettings') }}</span>
        </div>
        <div class="grid-item" @click="goTo('/personal/history')">
          <el-icon><Timer /></el-icon>
          <span class="title">{{ t('settings.loginHistory') }}</span>
        </div>
        <div class="grid-item" @click="goTo('/personal/data')">
          <el-icon><Document /></el-icon>
          <span class="title">{{ t('settings.privacySettings') }}</span>
        </div>
        <div class="grid-item danger" @click="goTo('/personal/danger')">
          <el-icon><Warning /></el-icon>
          <span class="title">{{ t('settings.deleteAccount') }}</span>
        </div>
      </div>
    </el-card>

    <el-divider />

    <div class="profile-sections">
      <el-card class="section-card">
        <template #header>
          <div class="card-header">
            <span>{{ t('settings.profileSettings') }}</span>
          </div>
        </template>
        <div class="row">
          <span class="label">{{ t('settings.nickname') }}</span>
          <span class="value">{{ userStore.nickname }}</span>
        </div>
        <div class="row">
          <span class="label">{{ t('settings.phone') }}</span>
          <span class="value">{{ userStore.currentUser?.phone || t('personal.noPhone') }}</span>
        </div>
        <div class="row">
          <span class="label">{{ t('settings.joinDate') }}</span>
          <span class="value">{{ joinDateText }}</span>
        </div>
      </el-card>

      <!-- 偏好快速概览，与首页保持一致结构 -->
      <el-card class="section-card">
        <template #header>
          <div class="card-header">
            <span>{{ t('personal.myPreferences') }}</span>
          </div>
        </template>
        <div class="summary-row" v-if="parsedPreferences.mbtiType">
          <img class="mbti-badge" :src="`/images/mbti/${parsedPreferences.mbtiType}.png`" />
          <span class="summary-text">
            {{ parsedPreferences.mbtiType }} · {{ getMbtiName(parsedPreferences.mbtiType) }}
          </span>
        </div>
        <div class="summary-row" v-if="summaryTransportText">
          <span class="summary-label">{{ t('personal.card.transport') }}</span>
          <span class="summary-text">{{ summaryTransportText }}</span>
        </div>
        <div class="summary-row" v-if="summaryPaceText">
          <span class="summary-label">{{ t('personal.card.travelPace') }}</span>
          <span class="summary-text">{{ summaryPaceText }}</span>
        </div>
        <div class="summary-row" v-if="summaryDietText">
          <span class="summary-label">{{ t('personal.card.diet') }}</span>
          <span class="summary-text">{{ summaryDietText }}</span>
        </div>
      </el-card>
    </div>
  </div>
    <el-drawer v-model="showPref" :title="t('settings.preferences')" size="60%">
      <Preferences embedded @saved="onPrefSaved" />
    </el-drawer>

</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user.js';
import { useI18n, formatDate as i18nFormatDate } from '@/utils/i18n.js';
import { Lock, Setting, Bell, Cpu, Timer, Document, Warning } from '@element-plus/icons-vue';
import UserCenterNav from '@/components/User/UserCenterNav.vue';
import { translateTag, getMbtiName } from '@/utils/tagMapping.js';
import Preferences from '@/pages/User/Preferences.vue';

export default {
  name: 'Profile',
  components: { UserCenterNav, Preferences, Lock, Setting, Bell, Cpu, Timer, Document, Warning },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const { t } = useI18n();
    const showPref = ref(false);

    const joinDateText = computed(() => {
      const ts = userStore.currentUser?.createTime;
      if (!ts) return '';
      try {
        const date = new Date(ts);
        const pretty = i18nFormatDate(date, { year: 'numeric', month: 'long' });
        return t('personal.joinedAt', { date: pretty });
      } catch (e) {
        return '';
      }
    });

    const goAccountSettings = () => router.push('/account-settings');
    const goPreferences = () => router.push('/personal/preferences');
    const goTo = (path) => router.push(path);
    const openPreferences = () => { showPref.value = true; };
    const onPrefSaved = () => { showPref.value = false; };

    // 解析偏好（与首页逻辑保持一致）
    const parsedPreferences = computed(() => {
      try {
        const preferences = userStore.currentUser?.preferences;
        if (!preferences) return {};
        return typeof preferences === 'string' ? JSON.parse(preferences) : preferences;
      } catch { return {}; }
    });
    const summaryTransportText = computed(() => {
      const transports = parsedPreferences.value.selectedTransports || [];
      return transports.length ? transports.slice(0,3).map(x=>translateTag(x)).join('、') : '';
    });
    const summaryPaceText = computed(() => {
      const pace = parsedPreferences.value.travelPace;
      return pace ? translateTag(pace) : '';
    });
    const summaryDietText = computed(() => {
      const tastes = parsedPreferences.value.foodTastes || [];
      const restrictions = parsedPreferences.value.dietaryRestrictions || [];
      const parts = [];
      if (tastes.length) parts.push(tastes.slice(0,2).map(x=>translateTag(x)).join('、'));
      if (restrictions.length) parts.push(restrictions.slice(0,2).map(x=>translateTag(x,'dietary')).join('、'));
      return parts.join(' · ');
    });

    onMounted(() => {
      if (!userStore.isLoggedIn) router.push('/login');
    });

    return { userStore, t, joinDateText, goAccountSettings, goPreferences, goTo, showPref, openPreferences, onPrefSaved, translateTag, getMbtiName, parsedPreferences, summaryTransportText, summaryPaceText, summaryDietText };
  },
};
</script>

<style scoped>
.profile-page {
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
  gap: 16px;
}
.profile-basic h2 { margin: 0; }
.profile-basic .email { color: #909399; margin-top: 4px; }
.profile-actions { margin: 16px 0; display: flex; gap: 12px; }
.section-card { margin-bottom: 16px; }
.row { display: flex; justify-content: space-between; padding: 8px 0; }
.label { color: #909399; }
.value { color: #303133; }

.quick-nav { margin-top: 16px; }
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
  transition: all .2s;
  display: flex; flex-direction: column; gap: 6px;
}
.grid-item:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(0,0,0,.06);
  transform: translateY(-2px);
}
.grid-item .title { font-weight: 600; color: #303133; }
.grid-item .desc { color: #909399; font-size: 12px; }
.grid-item.danger { border-color: #f56c6c; }

/* 偏好概览样式（与首页协调） */
.summary-row { display:flex; align-items:center; gap:10px; padding:6px 0; }
.summary-label { color:#909399; font-size:13px; min-width:84px; }
.summary-text { color:#303133; font-weight:500; }
.mbti-badge { width:64px; height:64px; border-radius:10px; object-fit:cover; background:#fff; filter: drop-shadow(0 2px 6px rgba(0,0,0,.12)); }
</style>


