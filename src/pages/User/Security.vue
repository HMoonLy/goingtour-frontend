<template>
  <div class="personal-page simple">
    <UserCenterNav />
    <h2 class="title">{{ t('settings.securitySettings') }}</h2>

    <el-card class="section">
      <div class="row">
        <div>
          <div class="row-title">{{ t('settings.setPassword') }}</div>
          <div class="row-desc">首次设置或重置登录密码</div>
        </div>
        <el-button type="primary" plain @click="openSet">{{ t('settings.setPassword') }}</el-button>
      </div>
      <div class="row">
        <div>
          <div class="row-title">{{ t('settings.changePassword') }}</div>
          <div class="row-desc">使用当前密码更改为新密码</div>
        </div>
        <el-button type="primary" @click="openChange">{{ t('settings.changePassword') }}</el-button>
      </div>
      <div class="row">
        <div>
          <div class="row-title">{{ t('settings.clearPassword') }}</div>
          <div class="row-desc">清除已有密码（仅保留验证码登录）</div>
        </div>
        <el-button type="danger" plain @click="clearPwd">{{ t('settings.clearPassword') }}</el-button>
      </div>
    </el-card>

    <!-- 设置密码对话框 -->
    <el-dialog v-model="setVisible" :title="t('settings.setPassword')" width="420px">
      <el-form label-width="120px">
        <el-form-item :label="t('settings.setPassword')">
          <el-input v-model="setForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item :label="t('common.confirm')">
          <el-input v-model="setForm.confirm" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="setVisible=false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="loading" @click="submitSet">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="changeVisible" :title="t('settings.changePassword')" width="420px">
      <el-form label-width="120px">
        <el-form-item :label="t('settings.passwordLogin')">
          <el-input v-model="changeForm.current" type="password" show-password />
        </el-form-item>
        <el-form-item :label="t('settings.setPassword')">
          <el-input v-model="changeForm.newPwd" type="password" show-password />
        </el-form-item>
        <el-form-item :label="t('common.confirm')">
          <el-input v-model="changeForm.confirm" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="changeVisible=false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="loading" @click="submitChange">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
  
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user.js';
import { useI18n } from '@/utils/i18n.js';
import { userApi } from '@/api/user.js';
import { ElMessage, ElMessageBox } from 'element-plus';
import UserCenterNav from '@/components/User/UserCenterNav.vue';

export default {
  name: 'Security',
  components: { UserCenterNav },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const { t } = useI18n();
    const loading = ref(false);

    const setVisible = ref(false);
    const changeVisible = ref(false);
    const setForm = ref({ password: '', confirm: '' });
    const changeForm = ref({ current: '', newPwd: '', confirm: '' });

    onMounted(() => { if (!userStore.isLoggedIn) router.push('/login'); });

    const openSet = () => { setForm.value = { password: '', confirm: '' }; setVisible.value = true; };
    const openChange = () => { changeForm.value = { current: '', newPwd: '', confirm: '' }; changeVisible.value = true; };

    const submitSet = async () => {
      if (!userStore.userId) return;
      const strong = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\W]{8,}$/;
      if (!strong.test(setForm.value.password)) {
        ElMessage.error('密码至少8位，需包含字母与数字');
        return;
      }
      if (!setForm.value.password || setForm.value.password !== setForm.value.confirm) {
        ElMessage.error(t('validation.passwordMismatch'));
        return;
      }
      try {
        loading.value = true;
        await userApi.setPassword(userStore.userId, {
          password: setForm.value.password,
          confirmPassword: setForm.value.confirm
        });
        ElMessage.success(t('messages.updateSuccess'));
        setVisible.value = false;
      } catch (e) {
        ElMessage.error(t('messages.updateFailed'));
      } finally { loading.value = false; }
    };

    const submitChange = async () => {
      if (!userStore.userId) return;
      const strong = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\W]{8,}$/;
      if (!strong.test(changeForm.value.newPwd)) {
        ElMessage.error('密码至少8位，需包含字母与数字');
        return;
      }
      if (!changeForm.value.newPwd || changeForm.value.newPwd !== changeForm.value.confirm) {
        ElMessage.error(t('validation.passwordMismatch'));
        return;
      }
      try {
        loading.value = true;
        await userApi.changePassword(userStore.userId, {
          currentPassword: changeForm.value.current,
          newPassword: changeForm.value.newPwd,
          confirmPassword: changeForm.value.confirm
        });
        ElMessage.success(t('messages.updateSuccess'));
        changeVisible.value = false;
      } catch (e) {
        ElMessage.error(t('messages.updateFailed'));
      } finally { loading.value = false; }
    };

    const clearPwd = async () => {
      if (!userStore.userId) return;
      try {
        await ElMessageBox.confirm('确定要清除密码吗？清除后仅能使用邮箱验证码登录。', '确认操作', {
          type: 'warning',
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel')
        });
        loading.value = true;
        await userApi.clearPassword(userStore.userId);
        ElMessage.success(t('messages.updateSuccess'));
      } catch (e) {
        if (e !== 'cancel') ElMessage.error(t('messages.updateFailed'));
      } finally { loading.value = false; }
    };

    return { t, loading, setVisible, changeVisible, setForm, changeForm, openSet, openChange, submitSet, submitChange, clearPwd };
  }
};
</script>

<style scoped>
.personal-page.simple { max-width: 960px; margin: 24px auto; padding: 0 16px; }
.title { margin: 0 0 16px 0; }
.section { margin-bottom: 16px; }
.row { display:flex; justify-content: space-between; align-items:center; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
.row:last-child { border-bottom: none; }
.row-title { font-weight: 600; color: #303133; }
.row-desc { color: #909399; font-size: 12px; }
</style>


