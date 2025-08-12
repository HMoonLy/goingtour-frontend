<template>
  <div class="personal-page simple" :class="{ embedded }">
    <UserCenterNav v-if="!embedded" />
    <h2 v-if="!embedded"
class="title"
>
安全设置
</h2>

    <el-card class="section">
      <div class="row">
        <div>
          <div class="row-title">
设置密码
</div>
          <div class="row-desc">首次设置或重置登录密码</div>
        </div>
        <el-button type="primary"
plain @click="openSet"
>
设置密码
</el-button>
      </div>
      <div class="row">
        <div>
          <div class="row-title">
修改密码
</div>
          <div class="row-desc">使用当前密码更改为新密码</div>
        </div>
        <el-button type="primary"
@click="openChange"
>
修改密码
</el-button>
      </div>
      <div class="row">
        <div>
          <div class="row-title">
清除密码
</div>
          <div class="row-desc">清除已有密码（仅保留验证码登录）</div>
        </div>
        <el-button type="danger"
plain @click="clearPwd"
>
清除密码
</el-button>
      </div>
    </el-card>

    <!-- 设置密码对话框 -->
    <el-dialog v-model="setVisible"
title="设置密码" width="420px">
      <el-form label-width="120px">
        <el-form-item label="新密码">
          <el-input v-model="setForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="setForm.confirm" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="setVisible = false">
取消
</el-button>
        <el-button type="primary" :loading="loading" @click="submitSet">
          确认
        </el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="changeVisible"
title="修改密码" width="420px">
      <el-form label-width="120px">
        <el-form-item label="当前密码">
          <el-input
            v-model="changeForm.current"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="changeForm.newPwd" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input
            v-model="changeForm.confirm"
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="changeVisible = false"> 取消 </el-button>
        <el-button type="primary" :loading="loading" @click="submitChange">
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user.js";
import { userApi } from "@/api/user.js";
import { ElMessage, ElMessageBox } from "element-plus";
import UserCenterNav from "@/components/User/UserCenterNav.vue";

export default {
  name: "Security",
  components: { UserCenterNav },
  props: { embedded: Boolean },
  setup(props) {
    const router = useRouter();
    const userStore = useUserStore();
    const loading = ref(false);

    const setVisible = ref(false);
    const changeVisible = ref(false);
    const setForm = ref({ password: "", confirm: "" });
    const changeForm = ref({ current: "", newPwd: "", confirm: "" });

    onMounted(() => {
      if (!userStore.isLoggedIn) router.push("/login");
    });

    const openSet = () => {
      setForm.value = { password: "", confirm: "" };
      setVisible.value = true;
    };
    const openChange = () => {
      changeForm.value = { current: "", newPwd: "", confirm: "" };
      changeVisible.value = true;
    };

    const submitSet = async () => {
      if (!userStore.userId) return;
      const strong = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\W]{8,}$/;
      if (!strong.test(setForm.value.password)) {
        ElMessage.error("密码至少8位，需包含字母与数字");
        return;
      }
      if (
        !setForm.value.password ||
        setForm.value.password !== setForm.value.confirm
      ) {
        ElMessage.error("两次输入密码不一致");
        return;
      }
      try {
        loading.value = true;
        await userApi.setPassword(userStore.userId, {
          password: setForm.value.password,
          confirmPassword: setForm.value.confirm,
        });
        ElMessage.success("设置成功");
        setVisible.value = false;
      } catch (e) {
        ElMessage.error("设置失败");
      } finally {
        loading.value = false;
      }
    };

    const submitChange = async () => {
      if (!userStore.userId) return;
      const strong = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\W]{8,}$/;
      if (!strong.test(changeForm.value.newPwd)) {
        ElMessage.error("密码至少8位，需包含字母与数字");
        return;
      }
      if (
        !changeForm.value.newPwd ||
        changeForm.value.newPwd !== changeForm.value.confirm
      ) {
        ElMessage.error("两次输入密码不一致");
        return;
      }
      try {
        loading.value = true;
        await userApi.changePassword(userStore.userId, {
          currentPassword: changeForm.value.current,
          newPassword: changeForm.value.newPwd,
          confirmPassword: changeForm.value.confirm,
        });
        ElMessage.success("修改成功");
        changeVisible.value = false;
      } catch (e) {
        ElMessage.error("修改失败");
      } finally {
        loading.value = false;
      }
    };

    const clearPwd = async () => {
      if (!userStore.userId) return;
      try {
        await ElMessageBox.confirm(
          "确定要清除密码吗？清除后仅能使用邮箱验证码登录。",
          "确认操作",
          {
            type: "warning",
            confirmButtonText: "确定",
            cancelButtonText: "取消",
          },
        );
        loading.value = true;
        await userApi.clearPassword(userStore.userId);
        ElMessage.success("清除成功");
      } catch (e) {
        if (e !== "cancel") ElMessage.error("清除失败");
      } finally {
        loading.value = false;
      }
    };

    return {
      loading,
      setVisible,
      changeVisible,
      setForm,
      changeForm,
      openSet,
      openChange,
      submitSet,
      submitChange,
      clearPwd,
      embedded: props.embedded,
    };
  },
};
</script>

<style scoped>
.personal-page.simple {
  max-width: 960px;
  margin: 24px auto;
  padding: 0 16px;
}
.personal-page.simple.embedded {
  max-width: 100%;
  margin: 0;
  padding: 0;
}
.title {
  margin: 0 0 16px 0;
}
.section {
  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}
.row:last-child {
  border-bottom: none;
}
.row-title {
  font-weight: 600;
  color: #303133;
}
.row-desc {
  color: #909399;
  font-size: 12px;
}
.section :deep(.el-card__header) {
  background: linear-gradient(
    90deg,
    rgba(102, 126, 234, 0.12),
    rgba(118, 75, 162, 0.06)
  );
}
</style>
