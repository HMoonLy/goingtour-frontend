<template>
  <div class="admin-layout">
    <header class="admin-header">
      <div class="left">
        <h2 class="logo" @click="goAdmin">GoingTour Admin</h2>
        <el-menu mode="horizontal" :default-active="activeMenu" class="admin-menu" @select="handleSelect">
          <el-menu-item index="/admin">后台管理</el-menu-item>
        </el-menu>
      </div>
      <div class="right">
        <span class="nickname">{{ userStore.nickname }}</span>
        <el-button size="small" @click="handleLogout">退出登录</el-button>
      </div>
    </header>

    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store/user.js";
import { useAuth } from "@/composables/user/useAuth.js";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { logout } = useAuth();

const activeMenu = computed(() => (route.path.startsWith("/admin") ? "/admin" : ""));
const handleSelect = (index) => router.push(index);
const goAdmin = () => router.push("/admin");
const handleLogout = async () => logout(true);
</script>

<style scoped>
.admin-layout { min-height: 100vh; background: #f5f7fb; }
.admin-header {
  height: 64px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1f2937;
  color: #fff;
}
.left { display: flex; align-items: center; gap: 20px; min-width: 0; }
.logo { margin: 0; font-size: 18px; font-weight: 700; cursor: pointer; white-space: nowrap; }
.admin-menu { border-bottom: none; background: transparent; }
.admin-menu :deep(.el-menu-item) { color: #cfd8e3; }
.admin-menu :deep(.el-menu-item.is-active) { color: #fff; border-bottom-color: #fff; }
.right { display: flex; align-items: center; gap: 12px; }
.nickname { font-size: 14px; color: #d1d5db; }
.admin-main { padding: 16px 20px; }
@media (max-width: 768px) {
  .admin-header { height: auto; padding: 10px 12px; flex-direction: column; align-items: flex-start; gap: 8px; }
  .right { width: 100%; justify-content: space-between; }
}
</style>

