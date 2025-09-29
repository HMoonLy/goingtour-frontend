<template>
  <div class="avatar-uploader">
    <!-- 当前头像显示 -->
    <div class="current-avatar"
@click="openUploader">
      <div class="avatar-container">
        <img
          v-if="currentAvatar"
          :src="currentAvatar"
          alt="用户头像"
          class="avatar-image"
        />
        <div v-else
class="default-avatar">
          <span class="avatar-text">{{ getInitials(userName) }}</span>
        </div>
        <div class="avatar-overlay">
          <el-icon class="upload-icon">
            <Plus />
          </el-icon>
          <span class="upload-text">更换头像</span>
        </div>
      </div>
    </div>

    <!-- 头像上传对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="设置头像"
      width="600px"
      :before-close="handleClose"
      class="avatar-dialog"
    >
      <div class="upload-container">
        <!-- 上传选项卡 -->
        <el-tabs v-model="activeTab"
class="upload-tabs">
          <!-- 上传头像 -->
          <el-tab-pane label="上传头像"
name="upload">
            <div class="upload-section">
              <el-upload
                v-if="!rawImage && !uploadSuccess"
                ref="uploadRef"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleFileChange"
                accept="image/png,image/jpeg,image/jpg,image/gif"
                drag
                class="upload-dragger"
              >
                <div class="upload-content">
                  <el-icon class="upload-icon-large">
                    <Upload />
                  </el-icon>
                  <div class="upload-text-large">
                    <p>点击或拖拽图片到此处上传</p>
                    <p class="upload-tip">
                      支持 PNG、JPG、JPEG、GIF 格式，大小不超过 5MB
                    </p>
                  </div>
                </div>
              </el-upload>

              <!-- 图片预览区域 -->
              <div v-if="rawImage && !uploadSuccess"
class="preview-section">
                <div class="image-preview">
                  <img
:src="rawImage" alt="预览图片" class="preview-image" />
                </div>
                <div class="preview-actions">
                  <el-button
                    size="small"
                    type="info"
                    plain
                    @click="resetImageSelection"
                  >
                    重新选择
                  </el-button>
                </div>
              </div>

              <!-- 上传成功提示 -->
              <div v-if="uploadSuccess"
class="upload-success-section">
                <div class="success-icon">
                  <el-icon size="48"
color="#67c23a">
                    <CircleCheck />
                  </el-icon>
                </div>
                <div class="success-info">
                  <h3>头像上传成功！</h3>
                  <p>您的头像已更新，可以关闭此窗口或选择其他头像</p>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 默认头像 -->
          <el-tab-pane label="默认头像"
name="default">
            <div class="default-avatars">
              <div
                v-for="(avatar, index) in defaultAvatars"
                :key="index"
                class="default-avatar-item"
                :class="{ selected: selectedDefaultAvatar === avatar }"
                @click="selectDefaultAvatar(avatar)"
              >
                <img
:src="avatar" :alt="`默认头像${index + 1}`" />
              </div>
            </div>
          </el-tab-pane>

          <!-- 个性头像 -->
          <el-tab-pane label="个性头像"
name="generated">
            <div class="generated-avatars">
              <div class="avatar-generator">
                <h4>基于用户名生成</h4>
                <div class="generated-preview">
                  <div
                    v-for="(style, index) in generatedStyles"
                    :key="index"
                    class="generated-avatar-item"
                    :class="{ selected: selectedGeneratedStyle === style }"
                    @click="selectGeneratedStyle(style)"
                  >
                    <div
                      class="generated-avatar"
                      :style="getGeneratedAvatarStyle(style)"
                    >
                      {{ getInitials(userName) }}
                    </div>
                    <span class="style-name">{{ style.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <!-- 预览区域 -->
        <div class="preview-section">
          <h4>预览效果</h4>
          <div class="preview-container">
            <div class="preview-item">
              <div class="preview-avatar large">
                <img
v-if="previewAvatar" :src="previewAvatar" alt="预览" />
                <div v-else
class="preview-placeholder">
                  <span>{{ getInitials(userName) }}</span>
                </div>
              </div>
              <span>大头像</span>
            </div>
            <div class="preview-item">
              <div class="preview-avatar medium">
                <img
v-if="previewAvatar" :src="previewAvatar" alt="预览" />
                <div v-else
class="preview-placeholder">
                  <span>{{ getInitials(userName) }}</span>
                </div>
              </div>
              <span>中头像</span>
            </div>
            <div class="preview-item">
              <div class="preview-avatar small">
                <img
v-if="previewAvatar" :src="previewAvatar" alt="预览" />
                <div v-else
class="preview-placeholder">
                  <span>{{ getInitials(userName) }}</span>
                </div>
              </div>
              <span>小头像</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose"> 取消 </el-button>
          <el-button type="primary"
:loading="saving" @click="saveAvatar">
            保存头像
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { Plus, Upload, CircleCheck } from "@element-plus/icons-vue";
import { useUserStore } from "@/store/user.js";
import { userApi } from "@/api/user.js";
import { getAvatarUrl } from "@/utils/ui/avatarUtils.js";

const props = defineProps({
  avatar: {
    type: String,
    default: "",
  },
  userName: {
    type: String,
    default: "用户",
  },
  size: {
    type: String,
    default: "large", // large, medium, small
  },
});

const emit = defineEmits(["update:avatar"]);

// 响应式数据
const dialogVisible = ref(false);
const activeTab = ref("upload");
const saving = ref(false);
const uploadRef = ref();

// 图片相关
const rawImage = ref(null);
const uploadSuccess = ref(false);

// 选择状态
const selectedDefaultAvatar = ref("");
const selectedGeneratedStyle = ref(null);

// 当前头像（支持OSS私有存储）
const currentAvatar = ref("");
const loadingAvatar = ref(false);

// 使用用户信息
const userStore = useUserStore();
const currentUser = computed(() => userStore.currentUser);

// 监听头像prop变化，直接设置头像URL
watch(
  () => props.avatar,
  (newAvatar) => {
    const userId = currentUser.value?.id;
    currentAvatar.value = getAvatarUrl(newAvatar, userId);
  },
  { immediate: true },
);

// 预览头像
const previewAvatar = computed(() => {
  if (activeTab.value === "upload" && rawImage.value) {
    return rawImage.value;
  } else if (activeTab.value === "default" && selectedDefaultAvatar.value) {
    return selectedDefaultAvatar.value;
  } else if (activeTab.value === "generated" && selectedGeneratedStyle.value) {
    return generateAvatarDataURL(selectedGeneratedStyle.value);
  }
  return currentAvatar.value;
});

// 默认头像列表 - 使用在线头像资源
const defaultAvatars = ref([
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Lucky&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Princess&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Scooter&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Midnight&backgroundColor=c7d2fe",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Chester&backgroundColor=fecaca",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Tigger&backgroundColor=a7f3d0",
]);

// 生成头像样式
const generatedStyles = ref([
  {
    name: "经典蓝",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#ffffff",
  },
  {
    name: "温暖橙",
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    color: "#ffffff",
  },
  {
    name: "清新绿",
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    color: "#ffffff",
  },
  {
    name: "优雅紫",
    background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    color: "#333333",
  },
  {
    name: "活力红",
    background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    color: "#333333",
  },
  {
    name: "深邃黑",
    background: "linear-gradient(135deg, #434343 0%, #000000 100%)",
    color: "#ffffff",
  },
]);

// 方法
const getInitials = (name) => {
  if (!name) return "U";
  const names = name.trim().split(" ");
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return name.substring(0, 1).toUpperCase();
};

const openUploader = () => {
  dialogVisible.value = true;
  resetStates();
};

const resetStates = () => {
  activeTab.value = "upload";
  rawImage.value = null;
  uploadSuccess.value = false;
  selectedDefaultAvatar.value = "";
  selectedGeneratedStyle.value = null;
};

const handleClose = () => {
  dialogVisible.value = false;
  resetStates();
};

const handleFileChange = (file) => {
  const { raw } = file;

  // 检查文件大小
  if (raw.size > 5 * 1024 * 1024) {
    ElMessage.error("文件大小不能超过 5MB");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    rawImage.value = e.target.result;
    // 直接使用原图，不进行裁剪处理
    console.log("✅ 图片加载成功，将使用完整图片");
  };
  reader.readAsDataURL(raw);
};

// 重新选择图片
const resetImageSelection = () => {
  rawImage.value = null;
  uploadSuccess.value = false;
  // 清空文件输入
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
};

const selectDefaultAvatar = (avatar) => {
  selectedDefaultAvatar.value = avatar;
  selectedGeneratedStyle.value = null;
};

const selectGeneratedStyle = (style) => {
  selectedGeneratedStyle.value = style;
  selectedDefaultAvatar.value = "";
};

const getGeneratedAvatarStyle = (style) => {
  return {
    background: style.background,
    color: style.color,
  };
};

// 压缩图片以适应数据库存储
const compressImageForStorage = (dataURL) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // 设置最大尺寸
      const maxSize = 300;
      let { width, height } = img;

      // 计算缩放比例
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // 绘制压缩后的图片
      ctx.drawImage(img, 0, 0, width, height);

      // 输出为JPEG格式，减少文件大小
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };

    img.src = dataURL;
  });
};

const generateAvatarDataURL = (style) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const size = 80; // 大幅减小尺寸，确保Base64数据在数据库限制内

  canvas.width = size;
  canvas.height = size;

  // 确保画布有不透明背景，避免格子问题
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // 简化背景处理，直接使用纯色
  let backgroundColor = "#667eea"; // 默认颜色

  try {
    // 尝试提取渐变中的主色调
    const gradientMatch = style.background.match(/linear-gradient\(([^)]+)\)/);
    if (gradientMatch) {
      const gradientStr = gradientMatch[1];
      const colorMatch = gradientStr.match(/#[0-9a-fA-F]{6}/);
      if (colorMatch) {
        backgroundColor = colorMatch[0];
      }
    } else if (style.background.includes("#")) {
      const colorMatch = style.background.match(/#[0-9a-fA-F]{6}/);
      if (colorMatch) {
        backgroundColor = colorMatch[0];
      }
    }
  } catch (error) {
    console.warn("解析颜色失败，使用默认颜色:", error);
  }

  // 绘制纯色背景
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, size, size);

  // 绘制文字
  ctx.fillStyle = style.color || "#ffffff";
  ctx.font = `bold ${Math.floor(size * 0.45)}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const initials = getInitials(props.userName);
  ctx.fillText(initials, size / 2, size / 2);

  // 使用JPEG格式，低质量压缩以减少数据大小
  return canvas.toDataURL("image/jpeg", 0.6);
};

const saveAvatar = async () => {
  try {
    saving.value = true;

    let avatarUrl = "";

    if (activeTab.value === "upload" && rawImage.value) {
      // 用户上传的图片 - 直接使用原图
      try {
        ElMessage.info("正在处理头像...");

        // 压缩图片以适应存储
        const compressedImage = await compressImageForStorage(rawImage.value);
        const response = await fetch(compressedImage);
        const blob = await response.blob();
        const fileToUpload = new File([blob], `avatar_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        // 调后端统一上传接口（使用私有存储）
        const userId = currentUser.value?.id;
        if (!userId) {
          throw new Error("用户未登录");
        }
        const uploadResp = await userApi.uploadAvatar(userId, fileToUpload);

        // 后端返回头像URL
        const responseData = uploadResp.data || uploadResp;
        avatarUrl = responseData.url || "";

        if (!avatarUrl) {
          throw new Error("上传失败");
        }
      } catch (error) {
        console.error("图片处理失败:", error);
        ElMessage.error("头像上传失败，请重试");
        return;
      }
    } else if (activeTab.value === "default" && selectedDefaultAvatar.value) {
      // 默认头像 - 直接使用URL，不上传
      avatarUrl = selectedDefaultAvatar.value;
    } else if (
      activeTab.value === "generated" &&
      selectedGeneratedStyle.value
    ) {
      // 个性头像 - 生成Base64，不上传到OSS
      avatarUrl = generateAvatarDataURL(selectedGeneratedStyle.value);
    }

    if (!avatarUrl) {
      ElMessage.warning("请选择或上传头像");
      return;
    }

    // 触发更新事件，传递最终的头像URL
    emit("update:avatar", avatarUrl);

    ElMessage.success("头像更新成功！");

    // 对于上传的图片，显示成功状态而不是立即关闭对话框
    if (activeTab.value === "upload") {
      uploadSuccess.value = true;
      // 3秒后自动关闭对话框
      setTimeout(() => {
        dialogVisible.value = false;
      }, 3000);
    } else {
      // 对于默认头像和个性头像，立即关闭对话框
      dialogVisible.value = false;
    }
  } catch (error) {
    console.error("❌ 保存头像失败:", error);
    ElMessage.error("保存头像失败，请重试");
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.avatar-uploader {
  display: inline-block;
}

.current-avatar {
  cursor: pointer;
  position: relative;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #e1e8ed;
  transition: all 0.3s ease;
}

.avatar-container:hover {
  border-color: #91a8d0;
  transform: scale(1.05);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  color: white;
  font-size: 40px;
  font-weight: bold;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 12px;
}

/* 对话框样式 */
.avatar-dialog :deep(.el-dialog) {
  border-radius: 12px;
}

.upload-container {
  padding: 20px 0;
}

.upload-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0 20px;
}

/* 上传区域样式 */
.upload-section {
  padding: 20px;
}

.upload-dragger :deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  border: 2px dashed #d9d9d9;
  background: #fafafa;
  transition: all 0.3s ease;
}

.upload-dragger :deep(.el-upload-dragger:hover) {
  border-color: #91a8d0;
  background: #fafbfc;
}

.upload-content {
  text-align: center;
  padding: 40px 20px;
}

.upload-icon-large {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text-large p {
  margin: 8px 0;
  color: #606266;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
}

/* 图片预览样式 */
.preview-section {
  margin-top: 30px;
  text-align: center;
}

.image-preview {
  display: inline-block;
  max-width: 300px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-image {
  width: 100%;
  height: auto;
  display: block;
}

.preview-info {
  margin-top: 16px;
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  color: #0369a1;
}

.preview-info p {
  margin: 0;
  font-size: 14px;
}

.preview-actions {
  margin-top: 16px;
  text-align: center;
}

/* 上传成功样式 */
.upload-success-section {
  margin-top: 30px;
  text-align: center;
  padding: 40px 20px;
}

.success-icon {
  margin-bottom: 20px;
}

.success-info h3 {
  margin: 0 0 12px 0;
  color: #67c23a;
  font-size: 18px;
  font-weight: bold;
}

.success-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* 默认头像样式 */
.default-avatars {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 16px;
  padding: 20px;
}

.default-avatar-item {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.default-avatar-item:hover {
  border-color: #91a8d0;
  transform: scale(1.1);
}

.default-avatar-item.selected {
  border-color: #91a8d0;
  box-shadow: 0 0 0 2px rgba(145, 168, 208, 0.2);
}

.default-avatar-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 生成头像样式 */
.generated-avatars {
  padding: 20px;
}

.avatar-generator h4 {
  margin-bottom: 20px;
  color: #303133;
}

.generated-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
}

.generated-avatar-item {
  text-align: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.generated-avatar-item:hover {
  background: #f5f7fa;
}

.generated-avatar-item.selected {
  background: #fafbfc;
  border: 2px solid #91a8d0;
}

.generated-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin: 0 auto 8px;
}

.style-name {
  font-size: 12px;
  color: #606266;
}

/* 预览区域样式 */
.preview-section {
  border-top: 1px solid #e4e7ed;
  padding: 20px;
  margin-top: 20px;
}

.preview-section h4 {
  margin-bottom: 16px;
  color: #303133;
}

.preview-container {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.preview-item {
  text-align: center;
}

.preview-avatar {
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e1e8ed;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-avatar.large {
  width: 80px;
  height: 80px;
}

.preview-avatar.medium {
  width: 60px;
  height: 60px;
}

.preview-avatar.small {
  width: 40px;
  height: 40px;
}

.preview-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.preview-avatar.large .preview-placeholder span {
  font-size: 32px;
}

.preview-avatar.medium .preview-placeholder span {
  font-size: 24px;
}

.preview-avatar.small .preview-placeholder span {
  font-size: 16px;
}

.preview-item span {
  font-size: 12px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .avatar-container {
    width: 100px;
    height: 100px;
  }

  .avatar-text {
    font-size: 32px;
  }

  .upload-container {
    padding: 10px 0;
  }

  .upload-content {
    padding: 20px 10px;
  }

  .default-avatars {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding: 15px;
  }

  .default-avatar-item {
    width: 60px;
    height: 60px;
  }

  .generated-preview {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .preview-container {
    gap: 20px;
  }

  .preview-avatar.large {
    width: 60px;
    height: 60px;
  }

  .preview-avatar.medium {
    width: 45px;
    height: 45px;
  }

  .preview-avatar.small {
    width: 30px;
    height: 30px;
  }
}
</style>
