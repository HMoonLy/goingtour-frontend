<template>
  <div class="personal-page simple" :class="{ embedded }">
    <UserCenterNav v-if="!embedded" />
    <h2 v-if="!embedded" class="title">隐私与系统</h2>

    <!-- 系统设置 -->
    <el-card class="section">
      <template #header>
        <span>系统设置</span>
      </template>
      <div class="row">
        <div>
          <div class="row-title">主题模式</div>
          <div class="row-desc">选择您偏好的界面主题</div>
        </div>
        <el-radio-group v-model="theme">
          <el-radio-button value="light">浅色模式</el-radio-button>
          <el-radio-button value="dark">深色模式</el-radio-button>
          <el-radio-button value="system">跟随系统</el-radio-button>
        </el-radio-group>
      </div>
    </el-card>

    <!-- 数据管理 -->
    <el-card class="section">
      <template #header>
        <span>数据管理</span>
      </template>
      <div class="row">
        <div>
          <div class="row-title">导出数据</div>
          <div class="row-desc">下载您的个人数据和旅行记录</div>
        </div>
        <el-button type="primary" plain @click="exportData">
          导出数据
        </el-button>
      </div>
      <div class="row">
        <div>
          <div class="row-title">清除本地数据</div>
          <div class="row-desc">清除浏览器中保存的本地数据</div>
        </div>
        <el-button type="danger" plain @click="clearLocal">
          清除本地数据
        </el-button>
      </div>
    </el-card>

    <!-- 隐私设置 -->
    <el-card class="section">
      <template #header>
        <span>隐私设置</span>
      </template>
      <div class="row">
        <div>
          <div class="row-title">个人资料可见性</div>
          <div class="row-desc">控制其他用户查看您资料的权限</div>
        </div>
        <el-select
          v-model="privacySettings.profileVisibility"
          size="small"
          @change="updatePrivacySettings"
        >
          <el-option label="完全公开" value="public" />
          <el-option label="仅好友" value="friends" />
          <el-option label="完全私密" value="private" />
        </el-select>
      </div>
      <div class="row">
        <div>
          <div class="row-title">旅行记录公开</div>
          <div class="row-desc">是否允许其他用户查看您的旅行记录</div>
        </div>
        <el-switch
          v-model="privacySettings.showTravelHistory"
          @change="updatePrivacySettings"
        />
      </div>
      <div class="row">
        <div>
          <div class="row-title">在线状态显示</div>
          <div class="row-desc">是否显示您的在线状态</div>
        </div>
        <el-switch
          v-model="privacySettings.showOnlineStatus"
          @change="updatePrivacySettings"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user.js";
import { useTheme } from "@/utils/ui/theme.js";
import { ElMessage } from "element-plus";
import UserCenterNav from "@/components/User/UserCenterNav.vue";

export default {
  name: "PrivacySystem",
  components: { UserCenterNav },
  props: { embedded: Boolean },
  setup(props) {
    const router = useRouter();
    const userStore = useUserStore();
    const { setTheme, getTheme } = useTheme();

    // 系统设置
    const theme = ref(getTheme());

    // 隐私设置
    const privacySettings = reactive({
      profileVisibility: "public",
      showTravelHistory: true,
      showOnlineStatus: true,
    });

    // 监听主题变化
    watch(theme, (val) => {
      if (val) setTheme(val);
    });

    onMounted(() => {
      if (!userStore.isLoggedIn) router.push("/login");
      theme.value = getTheme();
      loadPrivacySettings();
    });

    // 隐私设置方法
    const loadPrivacySettings = () => {
      const saved = localStorage.getItem("privacy_settings");
      if (saved) {
        Object.assign(privacySettings, JSON.parse(saved));
      }
    };

    const updatePrivacySettings = () => {
      try {
        localStorage.setItem("privacy_settings", JSON.stringify(privacySettings));
        ElMessage.success("隐私设置已保存");
      } catch {
        ElMessage.error("保存失败");
      }
    };

    // 数据管理方法
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

    return {
      theme,
      privacySettings,
      updatePrivacySettings,
      exportData,
      clearLocal,
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
  gap: 16px;
}

.row:last-child {
  border-bottom: none;
}

.row-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
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
