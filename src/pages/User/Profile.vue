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
          <span class="title">{{ t('settings.securitySettings') }}</span>
        </div>
        <div class="grid-item" @click="goTo('/personal/preferences')">
          <span class="title">{{ t('settings.preferences') }}</span>
        </div>
        <div class="grid-item" @click="goTo('/personal/notifications')">
          <span class="title">{{ t('settings.notifications') }}</span>
        </div>
        <div class="grid-item" @click="goTo('/personal/system')">
          <span class="title">{{ t('settings.systemSettings') }}</span>
        </div>
        <div class="grid-item" @click="goTo('/personal/history')">
          <span class="title">{{ t('settings.loginHistory') }}</span>
        </div>
        <div class="grid-item" @click="goTo('/personal/data')">
          <span class="title">{{ t('settings.privacySettings') }}</span>
        </div>
        <div class="grid-item danger" @click="goTo('/personal/danger')">
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
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user.js';
import { useI18n, formatDate as i18nFormatDate } from '@/utils/i18n.js';
import UserCenterNav from '@/components/User/UserCenterNav.vue';

export default {
  name: 'Profile',
  components: { UserCenterNav },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const { t } = useI18n();

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

    onMounted(() => {
      if (!userStore.isLoggedIn) router.push('/login');
    });

    return { userStore, t, joinDateText, goAccountSettings, goPreferences, goTo };
  },
};
</script>

<style scoped>
.profile-page {
  max-width: 960px;
  margin: 24px auto;
  padding: 0 16px;
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
</style>


