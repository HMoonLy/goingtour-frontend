<template>
  <div class="user-center-nav">
    <div class="bar">
      <el-tabs
v-model="active" @tab-change="onChange"
>
        <el-tab-pane
:label="'个人资料'" name="profile"
/>
        <el-tab-pane
:label="'安全设置'" name="security"
/>
        <el-tab-pane
:label="'偏好设置'" name="preferences"
/>
        <el-tab-pane :label="'通知设置'" name="notifications" />
        <el-tab-pane
:label="'系统设置'" name="system"
/>
        <el-tab-pane
:label="'登录历史'" name="history"
/>
        <el-tab-pane
:label="'数据与隐私'" name="data"
/>
        <el-tab-pane
:label="'危险区'" name="danger"
/>
      </el-tabs>
    </div>
    <div class="right">
      <el-link
type="primary" :underline="false"
@click="goPersonal"
>
        ← {{ "个人中心" }}
      </el-link>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

export default {
  name: "UserCenterNav",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const active = ref("profile");

    const syncActive = () => {
      const p = route.path;
      if (p.startsWith("/personal/security")) active.value = "security";
      else if (p.startsWith("/personal/preferences"))
        active.value = "preferences";
      else if (p.startsWith("/personal/notifications"))
        active.value = "notifications";
      else if (p.startsWith("/personal/system")) active.value = "system";
      else if (p.startsWith("/personal/history")) active.value = "history";
      else if (p.startsWith("/personal/data")) active.value = "data";
      else if (p.startsWith("/personal/danger")) active.value = "danger";
      else active.value = "profile";
    };

    watch(() => route.path, syncActive, { immediate: true });

    const onChange = (name) => {
      const map = {
        profile: "/personal/profile",
        security: "/personal/security",
        preferences: "/personal/preferences",
        notifications: "/personal/notifications",
        system: "/personal/system",
        history: "/personal/history",
        data: "/personal/data",
        danger: "/personal/danger",
      };
      router.push(map[name] || "/personal");
    };

    const goPersonal = () => router.push("/personal");

    return { active, onChange, goPersonal };
  },
};
</script>

<style scoped>
.user-center-nav {
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.bar {
  flex: 1;
  min-width: 0;
}
.right {
  margin-left: 12px;
  white-space: nowrap;
}

/* 弱化Tab视觉，贴合内容区 */
:deep(.el-tabs__header) {
  margin: 0;
  border: none;
}
:deep(.el-tabs__nav-wrap)::after {
  display: none;
}
:deep(.el-tabs__item) {
  padding: 8px 12px;
}
:deep(.el-tabs__item.is-active) {
  font-weight: 600;
}
</style>
