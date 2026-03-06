<template>
  <div class="admin-login-page">
    <el-card class="admin-login-card" shadow="always">
      <h2>管理员登录</h2>
      <p class="sub">仅后台管理账号可登录</p>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="handleSubmit">
        <el-form-item label="账号" prop="account">
          <el-input v-model="form.account" placeholder="请输入管理员账号" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入管理员密码" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" class="submit-btn" @click="handleSubmit">
            登录后台
          </el-button>
        </el-form-item>
      </el-form>

      <div class="links">
        <el-link type="primary" @click="$router.push('/login')">返回普通用户登录</el-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/user/useAuth.js";

const router = useRouter();
const { adminLogin, loading } = useAuth();
const formRef = ref(null);

const form = reactive({
  account: "",
  password: "",
});

const rules = {
  account: [{ required: true, message: "请输入账号", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate();
  const user = await adminLogin(form.account.trim(), form.password);
  if (user) {
    router.push("/admin");
  }
};
</script>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #1f2937, #111827);
}

.admin-login-card {
  width: 100%;
  max-width: 420px;
}

h2 {
  margin: 0;
}

.sub {
  margin: 8px 0 18px;
  color: #6b7280;
}

.submit-btn {
  width: 100%;
}

.links {
  text-align: center;
}
</style>
