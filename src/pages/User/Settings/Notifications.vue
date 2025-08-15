<template>
  <div class="personal-page simple"
:class="{ embedded }">
    <UserCenterNav v-if="!embedded" />
    <h2
v-if="!embedded" class="title">通知设置</h2>
    <el-card class="section">
      <div class="row">
        <span>Email</span><el-switch v-model="email"
@change="persist" />
      </div>
      <div class="row">
        <span>SMS</span><el-switch v-model="sms"
@change="persist" />
      </div>
      <div class="row">
        <span>In-app</span><el-switch v-model="inapp"
@change="persist" />
      </div>
    </el-card>
  </div>
</template>
<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user.js";
import UserCenterNav from "@/components/User/UserCenterNav.vue";
export default {
  name: "Notifications",
  components: { UserCenterNav },
  props: { embedded: Boolean },
  setup(props) {
    const router = useRouter();
    const userStore = useUserStore();
    const email = ref(true),
      sms = ref(false),
      inapp = ref(true);

    const storageKey = () => `goingtour_notify_${userStore.userId || "guest"}`;
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
      if (!userStore.isLoggedIn) return router.push("/login");
      load();
    });

    return { email, sms, inapp, persist, embedded: props.embedded };
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
  padding: 8px 0;
}
.section :deep(.el-card__header) {
  background: linear-gradient(
    90deg,
    rgba(102, 126, 234, 0.12),
    rgba(118, 75, 162, 0.06)
  );
}
</style>
