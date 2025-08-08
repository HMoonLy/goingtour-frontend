<template>
  <div class="personal-page simple">
    <UserCenterNav />
    <h2 class="title">{{ t('settings.notifications') }}</h2>
    <el-card class="section">
      <div class="row"><span>Email</span><el-switch v-model="email" @change="persist" /></div>
      <div class="row"><span>SMS</span><el-switch v-model="sms" @change="persist" /></div>
      <div class="row"><span>In-app</span><el-switch v-model="inapp" @change="persist" /></div>
    </el-card>
  </div>
</template>
<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user.js';
import { useI18n } from '@/utils/i18n.js';
import UserCenterNav from '@/components/User/UserCenterNav.vue';
export default {
  name: 'Notifications',
  components: { UserCenterNav },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const { t } = useI18n();
    const email = ref(true), sms = ref(false), inapp = ref(true);

    const storageKey = () => `goingtour_notify_${userStore.userId || 'guest'}`;
    const load = () => {
      try {
        const raw = localStorage.getItem(storageKey());
        if (raw) {
          const data = JSON.parse(raw);
          email.value = !!data.email;
          sms.value = !!data.sms;
          inapp.value = data.inapp !== false; // 默认true
        }
      } catch {}
    };
    const persist = () => {
      try {
        const data = { email: email.value, sms: sms.value, inapp: inapp.value };
        localStorage.setItem(storageKey(), JSON.stringify(data));
      } catch {}
    };

    onMounted(() => {
      if (!userStore.isLoggedIn) return router.push('/login');
      load();
    });

    return { t, email, sms, inapp, persist };
  }
}
</script>
<style scoped>
.personal-page.simple { max-width: 960px; margin: 24px auto; padding: 0 16px; }
.title { margin: 0 0 16px 0; }
.section { margin-bottom: 16px; }
.row { display:flex; justify-content: space-between; padding:8px 0; }
</style>


