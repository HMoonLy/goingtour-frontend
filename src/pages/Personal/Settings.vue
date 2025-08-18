<template>
  <div class="page-shell settings-page">
    <!-- 设置头部 -->
    <div class="settings-header">
      <el-button link class="back-btn" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1>个人设置</h1>
    </div>

    <!-- 设置内容 -->
    <div class="settings-content">
      <!-- 设置导航 -->
      <div class="settings-nav">
        <div class="nav-list">
          <div
            v-for="section in sections"
            :key="section.key"
            class="nav-item"
            :class="{ active: activeSection === section.key }"
            @click="activeSection = section.key"
          >
            <el-icon>
              <component :is="section.icon" />
            </el-icon>
            <span>{{ section.title }}</span>
          </div>
        </div>
      </div>

      <!-- 设置面板 -->
      <div class="settings-panel">
        <!-- 基本信息 -->
        <div v-if="activeSection === 'profile'" class="settings-section">
          <div class="section-title">
            <h3>基本信息</h3>
            <p>管理你的个人资料和基本信息</p>
          </div>

          <el-form
            ref="profileFormRef"
            :model="profileForm"
            label-width="120px"
            class="settings-form"
          >
            <!-- 头像 -->
            <el-form-item label="头像">
              <AvatarUploader
                :avatar="profileForm.avatar"
                :user-name="profileForm.nickname"
                size="large"
                @update:avatar="handleAvatarChange"
              />
            </el-form-item>

            <!-- 昵称 -->
            <el-form-item label="昵称" prop="nickname">
              <el-input
                v-model="profileForm.nickname"
                placeholder="请输入昵称"
                maxlength="20"
              />
            </el-form-item>

            <!-- 邮箱 -->
            <el-form-item label="邮箱">
              <el-input v-model="profileForm.email" disabled placeholder="邮箱地址">
                <template #suffix>
                  <el-tag
                    :type="profileForm.emailVerified ? 'success' : 'warning'"
                    size="small"
                  >
                    {{ profileForm.emailVerified ? "已验证" : "未验证" }}
                  </el-tag>
                </template>
              </el-input>
            </el-form-item>

            <!-- 手机号 -->
            <el-form-item label="手机号" prop="phone">
              <el-input
                v-model="profileForm.phone"
                placeholder="请输入手机号"
                maxlength="11"
              />
            </el-form-item>

            <!-- 个人介绍 -->
            <el-form-item label="个人介绍">
              <el-input
                v-model="profileForm.bio"
                type="textarea"
                placeholder="介绍一下自己吧..."
                :rows="3"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="saving" @click="saveProfile">
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 旅行偏好 -->
        <div v-else-if="activeSection === 'preferences'" class="settings-section">
          <div class="section-title">
            <h3>旅行偏好</h3>
            <p>设置你的旅行偏好，获得更个性化的推荐</p>
          </div>

          <el-form
            ref="preferencesFormRef"
            :model="preferencesForm"
            label-width="120px"
            class="settings-form"
          >
            <!-- MBTI类型 -->
            <el-form-item label="MBTI类型">
              <el-select
                v-model="preferencesForm.mbtiType"
                placeholder="选择你的MBTI类型"
              >
                <el-option
                  v-for="type in mbtiTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>

            <!-- 旅行类型 -->
            <el-form-item label="旅行类型">
              <el-checkbox-group v-model="preferencesForm.travelTypes">
                <el-checkbox
                  v-for="type in travelTypes"
                  :key="type.value"
                  :label="type.value"
                >
                  {{ type.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <!-- 预算范围 -->
            <el-form-item label="预算偏好">
              <el-radio-group v-model="preferencesForm.budgetRange">
                <el-radio
                  v-for="range in budgetRanges"
                  :key="range.value"
                  :label="range.value"
                >
                  {{ range.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 饮食限制 -->
            <el-form-item label="饮食限制">
              <el-checkbox-group v-model="preferencesForm.dietaryRestrictions">
                <el-checkbox
                  v-for="restriction in dietaryRestrictions"
                  :key="restriction.value"
                  :label="restriction.value"
                >
                  {{ restriction.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <!-- 交通偏好 -->
            <el-form-item label="交通偏好">
              <el-checkbox-group v-model="preferencesForm.transportPreferences">
                <el-checkbox
                  v-for="transport in transportOptions"
                  :key="transport.value"
                  :label="transport.value"
                >
                  {{ transport.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="saving" @click="savePreferences">
                保存偏好
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 通知设置 -->
        <div v-else-if="activeSection === 'notifications'" class="settings-section">
          <div class="section-title">
            <h3>通知设置</h3>
            <p>管理你的通知偏好</p>
          </div>

          <div class="notification-settings">
            <div class="notification-item">
              <div class="notification-info">
                <h4>邮件通知</h4>
                <p>接收行程提醒和系统通知</p>
              </div>
              <el-switch v-model="notificationForm.email" />
            </div>

            <div class="notification-item">
              <div class="notification-info">
                <h4>行程提醒</h4>
                <p>即将出发的行程提醒</p>
              </div>
              <el-switch v-model="notificationForm.tripReminders" />
            </div>

            <div class="notification-item">
              <div class="notification-info">
                <h4>营销推送</h4>
                <p>接收产品更新和推荐信息</p>
              </div>
              <el-switch v-model="notificationForm.marketing" />
            </div>

            <div class="notification-actions">
              <el-button type="primary" :loading="saving" @click="saveNotifications">
                保存设置
              </el-button>
            </div>
          </div>
        </div>

        <!-- 隐私设置 -->
        <div v-else-if="activeSection === 'privacy'" class="settings-section">
          <div class="section-title">
            <h3>隐私设置</h3>
            <p>控制你的隐私和数据使用</p>
          </div>

          <div class="privacy-settings">
            <div class="privacy-item">
              <div class="privacy-info">
                <h4>个人资料可见性</h4>
                <p>控制其他用户是否可以看到你的资料</p>
              </div>
              <el-switch v-model="privacyForm.profileVisible" />
            </div>

            <div class="privacy-item">
              <div class="privacy-info">
                <h4>行程分享</h4>
                <p>允许分享你的公开行程</p>
              </div>
              <el-switch v-model="privacyForm.tripsShareable" />
            </div>

            <div class="privacy-item">
              <div class="privacy-info">
                <h4>数据分析</h4>
                <p>允许使用你的数据来改善服务</p>
              </div>
              <el-switch v-model="privacyForm.dataAnalytics" />
            </div>

            <div class="privacy-actions">
              <el-button type="primary" :loading="saving" @click="savePrivacy">
                保存设置
              </el-button>
              <el-button @click="exportUserData"> 导出我的数据 </el-button>
            </div>
          </div>
        </div>

        <!-- 账户安全 -->
        <div v-else-if="activeSection === 'security'" class="settings-section">
          <div class="section-title">
            <h3>账户安全</h3>
            <p>管理你的账户安全设置</p>
          </div>

          <div class="security-settings">
            <div class="security-item">
              <div class="security-info">
                <h4>修改密码</h4>
                <p>定期修改密码以保护账户安全</p>
              </div>
              <el-button @click="changePassword"> 修改密码 </el-button>
            </div>

            <div class="security-item">
              <div class="security-info">
                <h4>两步验证</h4>
                <p>增强账户安全性</p>
              </div>
              <el-button
                :type="securityForm.twoFactorEnabled ? 'danger' : 'primary'"
                @click="toggleTwoFactor"
              >
                {{ securityForm.twoFactorEnabled ? "关闭" : "开启" }}两步验证
              </el-button>
            </div>

            <div class="security-item">
              <div class="security-info">
                <h4>登录历史</h4>
                <p>查看最近的登录记录</p>
              </div>
              <el-button @click="viewLoginHistory"> 查看记录 </el-button>
            </div>

            <div class="security-item danger">
              <div class="security-info">
                <h4>注销账户</h4>
                <p>永久删除你的账户和所有数据</p>
              </div>
              <el-button type="danger" @click="deleteAccount"> 注销账户 </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  ArrowLeft,
  User,
  Star,
  Bell,
  Lock,
  Setting,
  Document,
  Warning,
} from "@element-plus/icons-vue";
import { useUserStore } from "@/store/user.js";
import { userApi } from "@/api/user.js";
import AvatarUploader from "@/components/Common/UI/AvatarUploader.vue";

export default {
  name: "PersonalSettings",
  components: {
    ArrowLeft,
    User,
    Star,
    Bell,
    Lock,
    Setting,
    Document,
    Warning,
    AvatarUploader,
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();

    // 当前激活的设置部分
    const activeSection = ref("profile");
    const saving = ref(false);

    // 设置导航
    const sections = [
      { key: "profile", title: "基本信息", icon: "User" },
      { key: "preferences", title: "旅行偏好", icon: "Star" },
      { key: "notifications", title: "通知设置", icon: "Bell" },
      { key: "privacy", title: "隐私设置", icon: "setting" },
      { key: "security", title: "账户安全", icon: "Lock" },
    ];

    // 基本信息表单
    const profileForm = reactive({
      avatar: "",
      nickname: "",
      email: "",
      phone: "",
      bio: "",
      emailVerified: false,
    });

    // 旅行偏好表单
    const preferencesForm = reactive({
      mbtiType: "",
      travelTypes: [],
      budgetRange: "",
      dietaryRestrictions: [],
      transportPreferences: [],
    });

    // 通知设置表单
    const notificationForm = reactive({
      email: true,
      tripReminders: true,
      marketing: false,
    });

    // 隐私设置表单
    const privacyForm = reactive({
      profileVisible: true,
      tripsShareable: true,
      dataAnalytics: true,
    });

    // 安全设置表单
    const securityForm = reactive({
      twoFactorEnabled: false,
    });

    // 选项数据
    const mbtiTypes = [
      { value: "INTJ", label: "INTJ - 建筑师" },
      { value: "INTP", label: "INTP - 思想家" },
      { value: "ENTJ", label: "ENTJ - 指挥官" },
      { value: "ENTP", label: "ENTP - 辩论家" },
      { value: "INFJ", label: "INFJ - 提倡者" },
      { value: "INFP", label: "INFP - 调停者" },
      { value: "ENFJ", label: "ENFJ - 主人公" },
      { value: "ENFP", label: "ENFP - 竞选者" },
      { value: "ISTJ", label: "ISTJ - 物流师" },
      { value: "ISFJ", label: "ISFJ - 守护者" },
      { value: "ESTJ", label: "ESTJ - 总经理" },
      { value: "ESFJ", label: "ESFJ - 执政官" },
      { value: "ISTP", label: "ISTP - 鉴赏家" },
      { value: "ISFP", label: "ISFP - 探险家" },
      { value: "ESTP", label: "ESTP - 企业家" },
      { value: "ESFP", label: "ESFP - 娱乐家" },
    ];

    const travelTypes = [
      { value: "cultural", label: "文化历史" },
      { value: "nature", label: "自然风光" },
      { value: "adventure", label: "冒险户外" },
      { value: "relaxation", label: "休闲度假" },
      { value: "food", label: "美食之旅" },
      { value: "photography", label: "摄影采风" },
      { value: "shopping", label: "购物血拼" },
      { value: "nightlife", label: "夜生活" },
    ];

    const budgetRanges = [
      { value: "budget", label: "经济型 (￥500以下/天)" },
      { value: "mid", label: "舒适型 (￥500-1000/天)" },
      { value: "luxury", label: "奢华型 (￥1000+/天)" },
    ];

    const dietaryRestrictions = [
      { value: "vegetarian", label: "素食主义" },
      { value: "vegan", label: "严格素食" },
      { value: "halal", label: "清真食品" },
      { value: "glutenfree", label: "无麸质" },
      { value: "lactosefree", label: "无乳糖" },
    ];

    const transportOptions = [
      { value: "plane", label: "飞机" },
      { value: "train", label: "火车" },
      { value: "car", label: "自驾" },
      { value: "bus", label: "大巴" },
      { value: "bike", label: "骑行" },
      { value: "walk", label: "徒步" },
    ];

    // 方法
    const loadUserData = () => {
      const user = userStore.currentUser;
      if (user) {
        profileForm.avatar = user.avatar || "";
        profileForm.nickname = user.nickname || "";
        profileForm.email = user.email || "";
        profileForm.phone = user.phone || "";
        profileForm.bio = user.bio || "";
        profileForm.emailVerified = user.emailVerified || false;

        // 加载用户偏好
        const preferences = user.preferences || {};
        preferencesForm.mbtiType = preferences.mbtiType || "";
        preferencesForm.travelTypes = preferences.travelTypes || [];
        preferencesForm.budgetRange = preferences.budgetRange || "";
        preferencesForm.dietaryRestrictions = preferences.dietaryRestrictions || [];
        preferencesForm.transportPreferences = preferences.transportPreferences || [];

        // 加载通知设置
        const notifications = user.notificationSettings || {};
        notificationForm.email = notifications.email !== false;
        notificationForm.tripReminders = notifications.tripReminders !== false;
        notificationForm.marketing = notifications.marketing || false;

        // 加载隐私设置
        const privacy = user.privacySettings || {};
        privacyForm.profileVisible = privacy.profileVisible !== false;
        privacyForm.tripsShareable = privacy.tripsShareable !== false;
        privacyForm.dataAnalytics = privacy.dataAnalytics !== false;

        // 加载安全设置
        const security = user.securitySettings || {};
        securityForm.twoFactorEnabled = security.twoFactorEnabled || false;
      }
    };

    // 头像上传相关
    const avatarDialogVisible = ref(false);

    const uploadAvatar = () => {
      avatarDialogVisible.value = true;
    };

    const handleAvatarChange = async (newAvatarUrl) => {
      try {
        // 调用API更新用户头像
        const userId = userStore.currentUser?.id;
        if (!userId) {
          throw new Error("用户未登录");
        }

        await userApi.updateInfo(userId, { avatar: newAvatarUrl });

        // 更新本地状态
        profileForm.avatar = newAvatarUrl;
        userStore.updateProfile({ avatar: newAvatarUrl });

        avatarDialogVisible.value = false;
        ElMessage.success("头像更新成功！");
      } catch (error) {
        console.error("头像更新失败:", error);
        ElMessage.error("头像更新失败，请重试");
      }
    };

    const saveProfile = async () => {
      saving.value = true;
      try {
        // TODO: 调用用户API保存基本信息
        const userData = {
          nickname: profileForm.nickname,
          phone: profileForm.phone,
          bio: profileForm.bio,
        };

        // 模拟API调用
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 更新userStore中的用户信息
        userStore.updateProfile(userData);

        ElMessage.success("基本信息保存成功！");
      } catch (error) {
        console.error("保存基本信息失败:", error);
        ElMessage.error("保存失败，请重试");
      } finally {
        saving.value = false;
      }
    };

    const savePreferences = async () => {
      saving.value = true;
      try {
        // 保存偏好设置到userStore
        const preferences = {
          mbtiType: preferencesForm.mbtiType,
          travelTypes: preferencesForm.travelTypes,
          budgetRange: preferencesForm.budgetRange,
          dietaryRestrictions: preferencesForm.dietaryRestrictions,
          transportPreferences: preferencesForm.transportPreferences,
        };

        // 模拟API调用
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // TODO: 调用用户API保存偏好设置
        userStore.updatePreferences(preferences);

        ElMessage.success("偏好设置保存成功！");
      } catch (error) {
        console.error("保存偏好设置失败:", error);
        ElMessage.error("保存失败，请重试");
      } finally {
        saving.value = false;
      }
    };

    const saveNotifications = async () => {
      saving.value = true;
      try {
        const notifications = {
          email: notificationForm.email,
          tripReminders: notificationForm.tripReminders,
          marketing: notificationForm.marketing,
        };

        // 模拟API调用
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // TODO: 调用用户API保存通知设置
        userStore.updateNotificationSettings(notifications);

        ElMessage.success("通知设置保存成功！");
      } catch (error) {
        console.error("保存通知设置失败:", error);
        ElMessage.error("保存失败，请重试");
      } finally {
        saving.value = false;
      }
    };

    const savePrivacy = async () => {
      saving.value = true;
      try {
        const privacy = {
          profileVisible: privacyForm.profileVisible,
          tripsShareable: privacyForm.tripsShareable,
          dataAnalytics: privacyForm.dataAnalytics,
        };

        // 模拟API调用
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // TODO: 调用用户API保存隐私设置
        userStore.updatePrivacySettings(privacy);

        ElMessage.success("隐私设置保存成功！");
      } catch (error) {
        console.error("保存隐私设置失败:", error);
        ElMessage.error("保存失败，请重试");
      } finally {
        saving.value = false;
      }
    };

    const exportUserData = async () => {
      try {
        const userData = {
          profile: profileForm,
          preferences: preferencesForm,
          notifications: notificationForm,
          privacy: privacyForm,
          exportDate: new Date().toISOString(),
        };

        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });

        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `我的个人数据_${new Date().toLocaleDateString("zh-CN")}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        ElMessage.success("个人数据导出成功！");
      } catch (error) {
        ElMessage.error("导出失败，请重试");
      }
    };

    const changePassword = () => {
      ElMessage.info("密码修改功能正在开发中...");
    };

    const toggleTwoFactor = () => {
      ElMessage.info("两步验证功能正在开发中...");
    };

    const viewLoginHistory = () => {
      ElMessage.info("登录历史功能正在开发中...");
    };

    const deleteAccount = async () => {
      try {
        await ElMessageBox.confirm(
          "此操作将永久删除你的账户和所有数据，无法恢复。确定要继续吗？",
          "危险操作",
          {
            confirmButtonText: "确定删除",
            cancelButtonText: "取消",
            type: "error",
          }
        );

        ElMessage.info("账户注销功能正在开发中...");
      } catch (error) {
        // 用户取消
      }
    };

    onMounted(() => {
      loadUserData();
    });

    return {
      activeSection,
      saving,
      sections,
      profileForm,
      preferencesForm,
      notificationForm,
      privacyForm,
      securityForm,
      mbtiTypes,
      travelTypes,
      budgetRanges,
      dietaryRestrictions,
      transportOptions,
      uploadAvatar,
      handleAvatarChange,
      saveProfile,
      savePreferences,
      saveNotifications,
      savePrivacy,
      exportUserData,
      changePassword,
      toggleTwoFactor,
      viewLoginHistory,
      deleteAccount,
    };
  },
};
</script>

<style scoped>
.settings-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.settings-header {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.back-btn {
  margin-right: 16px;
  font-size: 14px;
  color: #606266;
}

.settings-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.settings-content {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 32px;
}

/* 导航部分 */
.settings-nav {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  height: fit-content;
}

.nav-list {
  padding: 8px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #f5f7fa;
  color: #303133;
}

.nav-item.active {
  background: rgba(145, 168, 208, 0.1);
  color: #91a8d0;
  font-weight: 500;
}

.nav-item .el-icon {
  font-size: 16px;
}

/* 设置面板 */
.settings-panel {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  padding: 24px;
}

.settings-section {
  max-width: 600px;
}

.section-title {
  margin-bottom: 24px;
}

.section-title h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.section-title p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.settings-form {
  margin-top: 24px;
}

/* 头像上传 */
.avatar-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-actions {
  flex: 1;
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

/* 通知设置 */
.notification-settings,
.privacy-settings,
.security-settings {
  margin-top: 24px;
}

.notification-item,
.privacy-item,
.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
}

.notification-item:last-child,
.privacy-item:last-child,
.security-item:last-child {
  border-bottom: none;
}

.notification-info h4,
.privacy-info h4,
.security-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.notification-info p,
.privacy-info p,
.security-info p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.security-item.danger .security-info h4 {
  color: #f56c6c;
}

.notification-actions,
.privacy-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .settings-nav {
    order: 2;
  }

  .nav-list {
    display: flex;
    overflow-x: auto;
    padding: 8px;
    gap: 8px;
  }

  .nav-item {
    flex-shrink: 0;
    padding: 8px 12px;
    border-radius: 6px;
    white-space: nowrap;
  }

  .settings-panel {
    order: 1;
  }

  .notification-item,
  .privacy-item,
  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .avatar-upload {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
