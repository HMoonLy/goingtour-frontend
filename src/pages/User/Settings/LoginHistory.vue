<template>
  <div class="personal-page simple"
:class="{ embedded }">
    <UserCenterNav v-if="!embedded" />
    <h2 v-if="!embedded"
class="title">
      {{ "登录历史" }}
    </h2>
    <el-card class="section">
      <div
        style="
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-bottom: 12px;
        "
      >
        <el-button
size="small" @click="load"> 刷新 </el-button>
        <el-popconfirm title="确定要删除吗？"
@confirm="clearAll">
          <template #reference>
            <el-button size="small"
type="danger">
              {{ "清除所有记录" }}
            </el-button>
          </template>
        </el-popconfirm>
      </div>
      <el-table :data="records"
style="width: 100%">
        <el-table-column prop="loginTime"
label="登录时间" width="180" />
        <el-table-column prop="ipAddress"
label="登录IP" width="160" />
        <el-table-column prop="location"
label="位置" />
        <el-table-column prop="deviceType"
label="设备类型" width="120" />
        <el-table-column prop="browser"
label="浏览器" width="140" />
        <el-table-column prop="operatingSystem"
label="操作系统" width="140" />
        <el-table-column prop="sessionDuration"
label="会话时长" width="140" />
      </el-table>
    </el-card>
  </div>
</template>
<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user.js";
import { ElMessage } from "element-plus";
import UserCenterNav from "@/components/User/UserCenterNav.vue";
export default {
  name: "LoginHistory",
  components: { UserCenterNav },
  props: { embedded: Boolean },
  setup(props) {
    const router = useRouter();
    const userStore = useUserStore();
    const records = ref([]);
    const load = async () => {
      if (!userStore.isLoggedIn) return router.push("/login");
      try {
        const { userApi } = await import("@/api/user.js");
        const resp = await userApi.getLoginHistory(
          userStore.currentUser.id,
          1,
          50,
        );
        const page = resp?.data;
        records.value = Array.isArray(page) ? page : page?.records || [];
      } catch {
        records.value = [];
      }
    };
    const clearAll = async () => {
      try {
        const { userApi } = await import("@/api/user.js");
        await userApi.clearLoginHistory(userStore.currentUser.id);
        records.value = [];
        ElMessage.success("操作成功");
      } catch {
        ElMessage.error("操作失败");
      }
    };
    onMounted(load);
    return { records, load, clearAll, embedded: props.embedded };
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
.section :deep(.el-card__header) {
  background: linear-gradient(
    90deg,
    rgba(102, 126, 234, 0.12),
    rgba(118, 75, 162, 0.06)
  );
}
</style>
