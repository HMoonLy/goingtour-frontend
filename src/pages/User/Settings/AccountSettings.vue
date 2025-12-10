<template>
  <div class="account-settings" :class="{ embedded: embedded }">
    <el-card class="section" shadow="never">
      <template #header>
        <div class="section-header">
          <span>基本信息</span>
          <el-button
            type="primary"
            link
            :disabled="!hasChanges"
            @click="saveChanges"
          >
            保存修改
          </el-button>
        </div>
      </template>

      <div class="form-content">
        <!-- 头像设置 -->
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <el-avatar :size="80" :src="formData.avatar" @error="() => true">
              <img
                src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"
              />
            </el-avatar>
            <div class="avatar-overlay" @click="triggerFileUpload">
              <el-icon><Camera /></el-icon>
            </div>
            <input
              type="file"
              ref="fileInput"
              accept="image/*"
              style="display: none"
              @change="handleFileChange"
            />
          </div>
          <div class="avatar-tip">点击修改头像</div>
        </div>

        <!-- 表单项 -->
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-position="top"
          class="settings-form"
        >
          <el-row :gutter="20">
            <el-col :span="12" :xs="24">
              <el-form-item label="昵称" prop="username">
                <el-input
                  v-model="formData.username"
                  placeholder="请输入昵称"
                  maxlength="20"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :xs="24">
              <el-form-item label="邮箱" prop="email">
                <el-input
                  v-model="formData.email"
                  placeholder="请输入邮箱"
                  disabled
                >
                  <template #append>
                    <el-button link>已验证</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12" :xs="24">
              <el-form-item label="手机号" prop="phone">
                <el-input
                  v-model="formData.phone"
                  placeholder="未绑定手机号"
                  disabled
                >
                  <template #append>
                    <el-button link>绑定</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="个人简介" prop="bio">
                <el-input
                  v-model="formData.bio"
                  type="textarea"
                  rows="3"
                  placeholder="介绍一下自己吧..."
                  maxlength="100"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-card>

    <el-card class="section" shadow="never">
      <template #header>
        <div class="section-header">
          <span>账户状态</span>
        </div>
      </template>
      <div class="account-status">
        <div class="status-item">
          <div class="status-label">注册时间</div>
          <div class="status-value">{{ formatDate(userStore.currentUser?.createTime) }}</div>
        </div>
        <div class="status-item">
          <div class="status-label">用户ID</div>
          <div class="status-value">{{ userStore.userId }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { Camera } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/store/user";
import { userApi } from "@/api/user";

const props = defineProps({
  embedded: Boolean,
});

const userStore = useUserStore();
const fileInput = ref(null);
const formRef = ref(null);
const loading = ref(false);

const formData = reactive({
  username: "",
  email: "",
  phone: "",
  bio: "",
  avatar: "",
});

const originalData = reactive({});

const rules = {
  username: [
    { required: true, message: "请输入昵称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
  ],
};

// 初始化数据
onMounted(() => {
  initData();
});

const initData = () => {
  const user = userStore.currentUser || {};
  formData.username = user.username || "";
  formData.email = user.email || "";
  formData.phone = user.phone || "";
  formData.bio = user.bio || "";
  formData.avatar = user.avatar || "";

  // 保存原始数据用于比较
  Object.assign(originalData, JSON.parse(JSON.stringify(formData)));
};

// 检查是否有修改
const hasChanges = computed(() => {
  return (
    formData.username !== originalData.username ||
    formData.bio !== originalData.bio ||
    formData.avatar !== originalData.avatar
  );
});

// 头像上传
const triggerFileUpload = () => {
  fileInput.value.click();
};

const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    ElMessage.warning("图片大小不能超过 2MB");
    return;
  }

  // 实际上传逻辑应该类似：
  try {
     loading.value = true;
     const reader = new FileReader();
     reader.readAsDataURL(file);
     reader.onload = () => {
       formData.avatar = reader.result;
     };
  } catch (error) {
     ElMessage.error('上传失败');
  } finally {
     loading.value = false;
  }
};

// 保存修改
const saveChanges = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true;
        // 调用更新接口
        await userApi.updateProfile(userStore.userId, {
          username: formData.username,
          bio: formData.bio,
          avatar: formData.avatar
        });
        
        // 更新store
        userStore.updateUserInfo({
          username: formData.username,
          bio: formData.bio,
          avatar: formData.avatar
        });
        
        // 更新原始数据
        Object.assign(originalData, JSON.parse(JSON.stringify(formData)));
        
        ElMessage.success("保存成功");
      } catch (error) {
        console.error(error);
        ElMessage.error("保存失败，请重试");
      } finally {
        loading.value = false;
      }
    }
  });
};

const formatDate = (dateStr) => {
  if (!dateStr) return "未知";
  return new Date(dateStr).toLocaleDateString();
};
</script>

<style scoped>
.account-settings {
  max-width: 800px;
}

.account-settings.embedded {
  max-width: 100%;
}

.section {
  margin-bottom: 24px;
  border-radius: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.form-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

/* 头像样式 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #f2f6fc;
  transition: all 0.3s;
}

.avatar-wrapper:hover {
  border-color: #91a8d0;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
  font-size: 24px;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-tip {
  font-size: 12px;
  color: #909399;
}

.settings-form {
  width: 100%;
  max-width: 600px;
}

.account-status {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.status-item {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.status-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.status-value {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

@media (max-width: 768px) {
  .form-content {
    gap: 24px;
  }
}
</style>

