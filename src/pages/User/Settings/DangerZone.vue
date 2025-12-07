<template>
  <div class="personal-page simple"
:class="{ embedded }">
    <UserCenterNav v-if="!embedded" />
    <h2 v-if="!embedded"
class="title">
      {{ "删除账户" }}
    </h2>
    <el-alert
      type="warning"
      show-icon
      :closable="false"
      title="危险操作警告"
      description="以下操作具有风险性，执行前请确保您了解其后果。"
    />
    
    <el-card class="section">
      <template #header>
        <span>账户注销</span>
      </template>
      <div class="danger-content">
        <div class="danger-info">
          <h4>注销账户将会：</h4>
          <ul>
            <li>永久删除您的个人信息和旅行数据</li>
            <li>取消所有正在进行的预订</li>
            <li>清除所有旅行记录和收藏</li>
            <li>此操作不可撤销</li>
          </ul>
        </div>
        <el-button type="danger" @click="deleteAccount">
          注销账户
        </el-button>
      </div>
    </el-card>
  </div>
</template>
<script>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user.js";
import { ElMessageBox, ElMessage } from "element-plus";
import UserCenterNav from "@/components/User/UserCenterNav.vue";
export default {
  name: "DangerZone",
  components: { UserCenterNav },
  props: { embedded: Boolean },
  setup(props) {
    const router = useRouter();
    const userStore = useUserStore();
    onMounted(() => {
      if (!userStore.isLoggedIn) router.push("/login");
    });
    const deleteAccount = async () => {
      try {
        await ElMessageBox.confirm(
          "确认要注销账号吗？该操作不可撤销。",
          "危险操作",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          },
        );
        const { userApi } = await import("@/api/user.js");
        await userApi.deleteAccount(userStore.currentUser?.id, {
          email: userStore.email,
          confirmText: "DELETE",
        });
        ElMessage.success("操作成功");
        userStore.logout();
        router.push("/login");
      } catch (e) {
        if (e !== "cancel") ElMessage.error("操作失败");
      }
    };
    return { deleteAccount, embedded: props.embedded };
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
.personal-page.simple.embedded .section {
  margin-top: 0;
  margin-bottom: 20px;
}
.title {
  margin: 0 0 16px 0;
}
.section {
  margin-top: 16px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.section :deep(.el-card__header) {
  background: linear-gradient(
    90deg,
    rgba(245, 108, 108, 0.16),
    rgba(244, 63, 94, 0.08)
  );
}

.danger-content {
  padding: 16px 0;
}

.danger-info {
  margin-bottom: 24px;
}

.danger-info h4 {
  margin: 0 0 12px 0;
  color: #f56c6c;
  font-size: 16px;
  font-weight: 600;
}

.danger-info ul {
  margin: 0;
  padding-left: 20px;
  list-style-type: disc;
}

.danger-info li {
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}
</style>
