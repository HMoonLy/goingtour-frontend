<template>
  <div class="personal-page simple">
    <UserCenterNav />
    <h2 class="title">{{ t('settings.privacySettings') }}</h2>
    <el-card class="section">
      <div class="row">
        <span>{{ t('settings.exportData') }}</span>
        <el-button type="primary" plain @click="exportData">{{ t('settings.exportData') }}</el-button>
      </div>
      <div class="row">
        <span>{{ t('settings.clearAllRecords') }}</span>
        <el-button type="danger" plain @click="clearLocal">{{ t('settings.clearAllRecords') }}</el-button>
      </div>
    </el-card>
  </div>
</template>
<script>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user.js';
import { useI18n } from '@/utils/i18n.js';
import { ElMessage } from 'element-plus';
import UserCenterNav from '@/components/User/UserCenterNav.vue';
export default {
  name: 'DataAndPrivacy',
  components: { UserCenterNav },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const { t } = useI18n();
    onMounted(() => { if (!userStore.isLoggedIn) router.push('/login'); });
    const exportData = async () => {
      try {
        const { userApi } = await import('@/api/user.js');
        const resp = await userApi.exportUserData(userStore.currentUser.id);
        const payload = resp?.data || {};
        const data = JSON.stringify(payload, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'goingtour_user_data.json'; a.click();
        URL.revokeObjectURL(url);
        ElMessage.success(t('messages.operationSuccess'));
      } catch { ElMessage.error(t('messages.operationFailed')); }
    };
    const clearLocal = () => {
      try {
        localStorage.clear();
        ElMessage.success(t('messages.operationSuccess'));
      } catch { ElMessage.error(t('messages.operationFailed')); }
    };
    return { t, exportData, clearLocal };
  }
}
</script>
<style scoped>
.personal-page.simple { max-width: 960px; margin: 24px auto; padding: 0 16px; }
.title { margin: 0 0 16px 0; }
.section { margin-bottom: 16px; }
.row { display:flex; justify-content: space-between; align-items:center; padding:12px 0; }
</style>


