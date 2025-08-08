<template>
  <div class="profile-page">
    <div class="profile-header">
      <el-avatar :src="userStore.avatar" :size="72" />
      <div class="profile-basic">
        <h2>{{ userStore.nickname }}</h2>
        <p class="email" v-if="userStore.email">{{ userStore.email }}</p>
      </div>
    </div>

    <div class="profile-actions">
      <el-button type="primary" @click="goAccountSettings">
        {{ t('settings.accountSettings') }}
      </el-button>
      <el-button @click="goPreferences">{{ t('settings.preferences') }}</el-button>
    </div>

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

export default {
  name: 'Profile',
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
    const goPreferences = () => router.push('/preferences');

    onMounted(() => {
      if (!userStore.isLoggedIn) router.push('/login');
    });

    return { userStore, t, joinDateText, goAccountSettings, goPreferences };
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
</style>


