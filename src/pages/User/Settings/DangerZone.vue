<template>
  <div class="personal-page simple" :class="{ embedded }">
    <UserCenterNav v-if="!embedded" />
    <h2
v-if="!embedded" class="title"
>
      {{ "删除账户" }}
    </h2>
    <el-alert
      type="warning"
      show-icon
      :closable="false"
      :title="'删除账户'"
      description="此操作不可逆，请谨慎操作。"
    />
    <el-card class="section">
      <el-button type="danger" @click="deleteAccount">
        {{ "删除账户" }}
      </el-button>
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
</style>
