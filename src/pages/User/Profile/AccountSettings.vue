<template>
  <div class="account-settings-page" :class="{ embedded }">
    <div class="settings-container">
      <!-- 页面头部 -->
      <div v-if="!embedded" class="page-header">
        <div class="header-content">
          <h1 class="page-title">账户设置</h1>
          <p class="page-subtitle">个性化旅行规划助手</p>
        </div>
        <el-button plain @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>

      <!-- 个人信息设置 -->
      <div class="settings-content">
        <div class="setting-section">
          <h3 v-if="!embedded" class="section-title">个人信息设置</h3>

          <!-- 头像设置 -->
          <div class="setting-item">
            <div class="item-label">
              <span class="label-text">头像</span>
              <span class="label-desc">编辑</span>
            </div>
            <div class="item-control">
              <AvatarUploader
                :avatar="profileForm.avatar"
                :user-name="profileForm.nickname"
                size="large"
                @update:avatar="handleAvatarChange"
              />
            </div>
          </div>

          <!-- 昵称设置 -->
          <div class="setting-item">
            <div class="item-label">
              <span class="label-text">昵称</span>
              <span class="label-desc">可选</span>
            </div>
            <div class="item-control">
              <el-input
                v-model="profileForm.nickname"
                placeholder="请输入昵称"
                maxlength="20"
                show-word-limit
                :disabled="profileLoading"
              />
              <el-button
                type="primary"
                :loading="profileLoading"
                :disabled="!isProfileChanged"
                @click="updateProfile"
              >
                保存
              </el-button>
            </div>
          </div>

          <!-- 邮箱显示 -->
          <div class="setting-item">
            <div class="item-label">
              <span class="label-text">邮箱</span>
              <span class="label-desc">信息</span>
            </div>
            <div class="item-control">
              <el-input :value="userInfo.email" readonly disabled />
              <el-tag type="info" size="small"> 信息 </el-tag>
            </div>
          </div>

          <!-- 注册时间 -->
          <div class="setting-item">
            <div class="item-label">
              <span class="label-text">注册时间</span>
              <span class="label-desc">信息</span>
            </div>
            <div class="item-control">
              <span class="info-text">{{ formatJoinDate(userInfo.createTime) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user.js";
import { ElMessage } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";
import AvatarUploader from "@/components/Common/UI/AvatarUploader.vue";

export default {
  name: "AccountSettings",
  components: {
    ArrowLeft,
    AvatarUploader,
  },
  props: {
    embedded: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const router = useRouter();
    const userStore = useUserStore();

    // 响应式数据
    const profileLoading = ref(false);
    const userInfo = computed(() => userStore.currentUser || {});

    // 个人信息表单
    const profileForm = reactive({
      nickname: "",
      avatar: "",
    });

    // 计算属性
    const isProfileChanged = computed(() => {
      return (
        profileForm.nickname !== userInfo.value.nickname ||
        profileForm.avatar !== userInfo.value.avatar
      );
    });

    // 监听器
    watch(
      userInfo,
      (newUserInfo) => {
        if (newUserInfo) {
          profileForm.nickname = newUserInfo.nickname || "";
          profileForm.avatar = newUserInfo.avatar || "";
        }
      },
      { immediate: true }
    );

    // 生命周期
    onMounted(async () => {
      if (!userStore.isLoggedIn) {
        router.push("/login");
        return;
      }
      await userStore.fetchUserInfo();
    });

    // 方法
    const goBack = () => {
      router.back();
    };

    const formatJoinDate = (createTime) => {
      if (!createTime) return "未知";
      const date = new Date(createTime);
      return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const handleAvatarChange = async (newAvatar) => {
      profileForm.avatar = newAvatar;

      // 自动保存头像更新
      try {
        await userStore.updateUserInfo(profileForm.nickname, profileForm.avatar);
        ElMessage.success("头像更新成功");
      } catch (error) {
        console.error("头像更新失败:", error);
        ElMessage.error("头像更新失败，请重试");
      }
    };

    const updateProfile = async () => {
      profileLoading.value = true;
      try {
        await userStore.updateUserInfo(profileForm.nickname, profileForm.avatar);
        ElMessage.success("个人信息更新成功");
      } catch (error) {
        ElMessage.error("更新失败，请重试");
      } finally {
        profileLoading.value = false;
      }
    };

    return {
      // 响应式数据
      profileLoading,
      userInfo,
      profileForm,
      isProfileChanged,
      // 方法
      goBack,
      formatJoinDate,
      handleAvatarChange,
      updateProfile,
    };
  },
};
</script>

<style scoped>
.account-settings-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.account-settings-page.embedded {
  background: transparent;
  min-height: auto;
}

.settings-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.account-settings-page.embedded .settings-container {
  max-width: 100%;
  margin: 0;
  padding: 0;
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.header-content p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

/* 设置内容 */
.settings-content {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.setting-section {
  margin-bottom: 32px;
}

.setting-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 24px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

/* 设置项目 */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-bottom: 1px solid #f0f2f5;
}

.setting-item:last-child {
  border-bottom: none;
}

.item-label {
  flex: 0 0 auto;
  margin-right: 24px;
}

.label-text {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.label-desc {
  display: block;
  font-size: 12px;
  color: #909399;
}

.item-control {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-end;
}

.item-control .el-input {
  max-width: 300px;
}

.info-text {
  color: #606266;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .item-label {
    margin-right: 0;
  }

  .item-control {
    width: 100%;
    justify-content: flex-start;
  }

  .item-control .el-input {
    max-width: 100%;
  }
}
</style>