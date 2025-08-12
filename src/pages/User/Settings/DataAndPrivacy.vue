<template>
  <div
class="personal-page simple" :class="{ embedded }"
>
    <UserCenterNav v-if="!embedded" />
    <h2 v-if="!embedded"
class="title">
      {{ "数据与隐私" }}
    </h2>
    <el-card class="section">
      <div class="row">
        <span>{{ "导出数据" }}</span>
        <el-button
type="primary" plain
@click="exportData"
>
          {{ "导出数据" }}
        </el-button>
      </div>
      <div class="row">
        <span>{{ "清除本地数据" }}</span>
        <el-button
type="danger" plain
@click="clearLocal"
>
          {{ "清除本地数据" }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>
<script>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user.js";
import { ElMessage } from "element-plus";
import UserCenterNav from "@/components/User/UserCenterNav.vue";
export default {
  name: "DataAndPrivacy",
  components: { UserCenterNav },
  props: { embedded: Boolean },
  setup(props) {
    const router = useRouter();
    const userStore = useUserStore();
    onMounted(() => {
      if (!userStore.isLoggedIn) router.push("/login");
    });
    const exportData = async () => {
      try {
        const { userApi } = await import("@/api/user.js");
        const resp = await userApi.exportUserData(userStore.currentUser.id);
        const payload = resp?.data || {};
        const data = JSON.stringify(payload, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "goingtour_user_data.json";
        a.click();
        URL.revokeObjectURL(url);
        ElMessage.success("操作成功");
      } catch {
        ElMessage.error("操作失败");
      }
    };
    const clearLocal = () => {
      try {
        localStorage.clear();
        ElMessage.success("操作成功");
      } catch {
        ElMessage.error("操作失败");
      }
    };
    return { exportData, clearLocal, embedded: props.embedded };
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
}
.section :deep(.el-card__header) {
  background: linear-gradient(
    90deg,
    rgba(102, 126, 234, 0.12),
    rgba(118, 75, 162, 0.06)
  );
}
</style>
