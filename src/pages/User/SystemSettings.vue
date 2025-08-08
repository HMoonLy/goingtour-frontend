<template>
  <div class="personal-page simple" :class="{ embedded }">
    <UserCenterNav v-if="!embedded" />
    <h2 class="title" v-if="!embedded">{{ t('settings.systemSettings') }}</h2>
    <el-card class="section">
      <div class="row">
        <span>{{ t('settings.language') }}</span>
        <el-select v-model="lang" style="width:160px">
          <el-option label="简体中文" value="zh-CN" />
          <el-option label="English" value="en-US" />
        </el-select>
      </div>
      <div class="row">
        <span>{{ t('settings.theme') }}</span>
        <el-radio-group v-model="theme">
          <el-radio-button label="light">{{ t('settings.lightMode') }}</el-radio-button>
          <el-radio-button label="dark">{{ t('settings.darkMode') }}</el-radio-button>
          <el-radio-button label="system">{{ t('settings.systemMode') }}</el-radio-button>
        </el-radio-group>
      </div>
    </el-card>
  </div>
</template>
<script>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user.js';
import { useI18n } from '@/utils/i18n.js';
import { useTheme } from '@/utils/theme.js';
import UserCenterNav from '@/components/User/UserCenterNav.vue';
export default {
  name: 'SystemSettings',
  props: { embedded: Boolean },
  components: { UserCenterNav },
  setup(props) {
    const router = useRouter();
    const userStore = useUserStore();
    const { t, setLocale, getLocale } = useI18n();
    const { setTheme, getTheme } = useTheme();

    const lang = ref(getLocale());
    const theme = ref(getTheme());

    watch(lang, (val) => {
      if (val) setLocale(val);
    });

    watch(theme, (val) => {
      if (val) setTheme(val);
    });

    onMounted(() => {
      if (!userStore.isLoggedIn) return router.push('/login');
      // 同步一次，确保控件显示与当前实际一致
      lang.value = getLocale();
      theme.value = getTheme();
    });

    return { t, lang, theme, embedded: props.embedded };
  }
}
 </script>
<style scoped>
.personal-page.simple { max-width: 960px; margin: 24px auto; padding: 0 16px; }
.personal-page.simple.embedded { max-width: 100%; margin: 0; padding: 0; }
.title { margin: 0 0 16px 0; }
.section { margin-bottom: 16px; border-radius: 12px; box-shadow: 0 6px 18px rgba(0,0,0,0.06); overflow: hidden; }
.row { display:flex; justify-content: space-between; align-items:center; padding:12px 0; gap: 16px; }
.section :deep(.el-card__header) { background: linear-gradient(90deg, rgba(102,126,234,.12), rgba(118,75,162,.06)); }
</style>


