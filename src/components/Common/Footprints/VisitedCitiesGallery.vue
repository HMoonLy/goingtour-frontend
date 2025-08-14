<template>
  <div class="visited-cities-gallery">
    <!-- 标题区域 -->
    <div class="gallery-header">
      <div class="header-title">
        <el-icon size="20"><Camera /></el-icon>
        <h3>去过的城市</h3>
        <span v-if="visitedCities.length > 0" class="photo-count"
          >({{ visitedCities.length }}个城市)</span
        >
      </div>
    </div>

    <!-- 照片展示区域 -->
    <div class="photos-container">
      <!-- 有去过城市的情况 -->
      <div v-if="visitedCities.length > 0" class="photos-grid">
        <div
          v-for="(city, index) in displayCities"
          :key="city.id"
          class="city-photo-item"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="photo-wrapper" @click="handlePhotoClick(city)">
            <!-- 有照片的情况（显示封面/第一张） -->
            <template v-if="getCoverUrl(city)">
              <img
                :src="getCoverUrl(city)"
                :alt="city.cityName"
                class="city-photo"
                @error="handleImageError"
              />
            </template>

            <!-- 没有照片的情况 - 上传引导 -->
            <template v-else>
              <div class="upload-placeholder">
                <el-icon size="32" class="upload-icon"><Plus /></el-icon>
                <p class="upload-text">添加照片</p>
                <p class="upload-hint">点击上传</p>
              </div>
            </template>

            <!-- 照片信息遮罩 -->
            <div v-if="getCoverUrl(city)" class="photo-overlay">
              <div class="city-info">
                <span class="city-name">{{ city.cityName }}</span>
                <span class="visit-date">{{
                  formatVisitDate(city.updatedAt)
                }}</span>
              </div>

              <!-- 操作按钮 -->
              <div class="photo-actions">
                <el-tooltip content="更换照片" placement="top">
                  <el-button
                    size="small"
                    type="primary"
                    circle
                    class="action-btn"
                    @click.stop="handlePhotoClick(city)"
                  >
                    <el-icon><Camera /></el-icon>
                  </el-button>
                </el-tooltip>

                <el-tooltip content="删除照片" placement="top">
                  <el-button
                    size="small"
                    type="danger"
                    circle
                    class="action-btn"
                    @click.stop="handleDeletePhoto(city)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>

            <!-- 城市名称 (无照片时显示) -->
            <div v-if="!getCoverUrl(city)" class="city-name-bottom">
              {{ city.cityName }}
            </div>

            <!-- 胶片孔效果 -->
            <div v-if="city.photo" class="film-holes">
              <div class="hole"></div>
              <div class="hole"></div>
              <div class="hole"></div>
            </div>
          </div>
        </div>

        <!-- 显示更多按钮 -->
        <div
          v-if="visitedCities.length > maxDisplayCount && !showAll"
          class="more-cities-btn"
          @click="showAll = true"
        >
          <div class="more-content">
            <el-icon size="24"><Plus /></el-icon>
            <span>+{{ visitedCities.length - maxDisplayCount }}</span>
          </div>
        </div>
      </div>

      <!-- 完全没有去过城市的空状态 -->
      <div v-else class="empty-gallery">
        <div class="empty-content">
          <el-icon size="64" class="empty-icon"><CameraFilled /></el-icon>
          <h4>还没有足迹照片</h4>
          <p>标记一些城市为"去过"，然后上传你的旅行照片</p>
          <el-button type="primary" @click="$emit('add-visited-city')">
            <el-icon><Plus /></el-icon>
            添加去过的城市
          </el-button>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/gif"
      style="display: none"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Camera, Plus, Delete, CameraFilled } from '@element-plus/icons-vue';
import { useWishlistStore } from '@/store/wishlist.js';
import { getCityPhotoUrl, getCityThumbnailUrl } from '@/utils/media/imageUrl.js';

// Props
const props = defineProps({
  visitedCities: {
    type: Array,
    default: () => [],
  },
  maxDisplayCount: {
    type: Number,
    default: 6,
  },
});

// Emits
const emit = defineEmits([
  'photo-uploaded',
  'photo-deleted',
  'add-visited-city',
]);

// Store
const wishlistStore = useWishlistStore();

// 响应式数据
const showAll = ref(false);
const fileInput = ref(null);
const currentCity = ref(null);
const uploading = ref(false);
const coverMap = ref({}); // wishlistItemId -> cover URL

// 计算属性
const displayCities = computed(() => {
  if (showAll.value) {
    return props.visitedCities;
  }
  return props.visitedCities.slice(0, props.maxDisplayCount);
});

// 方法

const normalizePhotoUrl = url => {
  if (!url) return '';
  // 服务端在标记为 visited 时可能插入占位图片记录，路径为 /static/images/visited-placeholder*.jpg。
  // 该静态路径并不存在于前端工程，视为"无照片"以展示上传占位。
  if (url.startsWith('/static/images/visited-placeholder')) return '';
  
  // 使用统一的图片URL规范化工具
  return getCityPhotoUrl(url);
};

const getCoverUrl = city => coverMap.value[city.id] || '';

const refreshCoverForCity = async cityId => {
  try {
    const photos = await wishlistStore.getCityPhotos(cityId);
    if (photos && photos.length > 0) {
      const cover = photos.find(p => p.isCover) || photos[0];
      // 优先使用缩略图，如果没有则使用原图
      const imageUrl = cover.thumbnailUrl 
        ? getCityThumbnailUrl(cover.thumbnailUrl)
        : getCityPhotoUrl(cover.photoUrl);
      
      coverMap.value = {
        ...coverMap.value,
        [cityId]: imageUrl,
      };
    } else {
      // 无照片
      const { [cityId]: _, ...rest } = coverMap.value;
      coverMap.value = rest;
    }
  } catch (e) {
    // 忽略
  }
};

const refreshAllCovers = async () => {
  const ids = props.visitedCities.map(c => c.id);
  await Promise.all(ids.map(id => refreshCoverForCity(id)));
};

/**
 * 处理照片点击 - 上传或替换照片
 */
const handlePhotoClick = city => {
  currentCity.value = city;
  fileInput.value?.click();
};

/**
 * 处理文件选择
 */
const handleFileSelect = event => {
  const file = event.target.files[0];
  if (!file || !currentCity.value) return;

  // 验证文件
  const validation = validateFile(file);
  if (!validation.valid) {
    ElMessage.error(validation.error);
    return;
  }

  uploadPhoto(file);
};

/**
 * 上传照片
 */
const uploadPhoto = async file => {
  if (uploading.value) return;

  uploading.value = true;
  const loadingMessage = ElMessage.info({
    message: `正在上传 ${currentCity.value.cityName} 的照片...`,
    duration: 0,
  });

  try {
    // 直接走服务端上传与持久化
    const result = await wishlistStore.uploadCityPhoto(
      file,
      currentCity.value.id,
      '',
      []
    );

    if (result) {
      ElMessage.success(`${currentCity.value.cityName} 的照片上传成功！`);
      await refreshCoverForCity(currentCity.value.id);
      emit('photo-uploaded', currentCity.value);
    } else {
      ElMessage.error('照片上传失败，请重试');
    }
  } catch (error) {
    console.error('照片上传失败:', error);
    ElMessage.error('照片上传失败，请重试');
  } finally {
    loadingMessage.close();
    uploading.value = false;
    currentCity.value = null;
    // 清空文件输入
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};

/**
 * 删除照片
 */
const handleDeletePhoto = async city => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${city.cityName} 的封面照片吗？`,
      '删除照片',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    // 查询该城市的照片并删除封面（或第一张）
    const photos = await wishlistStore.getCityPhotos(city.id);
    const cover = photos.find(p => p.isCover) || photos[0];
    if (!cover) {
      ElMessage.info('当前城市没有可删除的照片');
      return;
    }

    const ok = await wishlistStore.deletePhoto(cover.id);
    if (ok) {
      ElMessage.success(`${city.cityName} 的照片已删除`);
      await refreshCoverForCity(city.id);
      emit('photo-deleted', city);
    } else {
      ElMessage.error('照片删除失败，请重试');
    }
  } catch (error) {
    // 用户取消或删除失败
  }
};

onMounted(() => {
  if (props.visitedCities && props.visitedCities.length > 0) {
    refreshAllCovers();
  }
});

watch(
  () => props.visitedCities.map(c => c.id).join(','),
  () => {
    refreshAllCovers();
  }
);

/**
 * 处理图片加载错误
 */
const handleImageError = event => {
  const img = event.target;

  // 若已尝试过回退且已处理，则直接返回
  if (img.dataset.errorHandled === 'true') {
    return;
  }

  // 优先尝试从缩略图回退到原图
  const currentSrc = img.getAttribute('src') || '';
  const hasTriedFallback = img.dataset.fallbackTried === 'true';
  if (!hasTriedFallback && currentSrc.includes('/thumbnails/')) {
    const fallbackSrc = currentSrc.replace('/thumbnails/', '/');
    img.dataset.fallbackTried = 'true';
    img.src = fallbackSrc;
    return;
  }

  // 回退失败或无回退路径时，显示占位符
  img.dataset.errorHandled = 'true';
  img.style.display = 'none';

  const placeholder = document.createElement('div');
  placeholder.className = 'image-error-placeholder';
  placeholder.style.cssText = `
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 12px;
    text-align: center;
    position: absolute;
    top: 0;
    left: 0;
  `;
  placeholder.textContent = '图片加载失败';

  const parent = img.parentNode;
  if (parent) {
    parent.style.position = 'relative';
    parent.appendChild(placeholder);
  }
};

/**
 * 验证文件
 */
const validateFile = file => {
  if (!file) {
    return { valid: false, error: '请选择文件' };
  }

  // 检查文件大小 (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: '文件大小不能超过5MB' };
  }

  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return { valid: false, error: '只支持 JPG、PNG、GIF 格式的图片' };
  }

  return { valid: true };
};

/**
 * 压缩图片
 */
const compressImage = (
  file,
  maxWidth = 800,
  maxHeight = 600,
  quality = 0.8
) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 计算新尺寸
      let { width, height } = img;
      const ratio = Math.min(maxWidth / width, maxHeight / height);

      if (ratio < 1) {
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // 绘制并压缩
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        blob => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('图片压缩失败'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * 文件转Base64
 */
const fileToBase64 = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
};

/**
 * 格式化访问日期
 */
const formatVisitDate = dateString => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}.${month}`;
};
</script>

<style scoped>
.visited-cities-gallery {
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(145, 168, 208, 0.06);
  position: relative;
  overflow: hidden;
}

.visited-cities-gallery::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(
      circle at 20% 30%,
      rgba(145, 168, 208, 0.02) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(247, 202, 201, 0.02) 0%,
      transparent 50%
    );
  pointer-events: none;
}

/* 标题区域 */
.gallery-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(145, 168, 208, 0.15);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #91a8d0;
}

.header-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  letter-spacing: 0.5px;
}

.photo-count {
  font-size: 12px;
  color: #6b7280;
}

/* 照片展示区域 */
.photos-container {
  position: relative;
}

.photos-grid {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 16px 8px;
}

.photos-grid::-webkit-scrollbar {
  height: 8px;
}

.photos-grid::-webkit-scrollbar-track {
  background: rgba(145, 168, 208, 0.1);
  border-radius: 4px;
}

.photos-grid::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #91a8d0, #f7cac9);
  border-radius: 4px;
}

/* 城市照片项 */
.city-photo-item {
  flex-shrink: 0;
  width: 180px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: photoSlideIn 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(20px) rotate(-2deg);
}

@keyframes photoSlideIn {
  to {
    opacity: 1;
    transform: translateY(0) rotate(-1deg);
  }
}

.city-photo-item:nth-child(odd) {
  transform: rotate(-2deg) translateY(2px);
}

.city-photo-item:nth-child(even) {
  transform: rotate(1.5deg) translateY(-1px);
}

.photo-wrapper {
  position: relative;
  width: 100%;
  height: 135px;
  background: #fff;
  padding: 4px;
  border-radius: 6px;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 0, 0, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
}

.photo-wrapper:hover {
  transform: rotate(0deg) translateY(-8px) scale(1.05);
  box-shadow:
    0 16px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(0, 0, 0, 0.2),
    inset 0 0 0 1px rgba(255, 255, 255, 0.9);
}

/* 照片样式 */
.city-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  transition: all 0.4s ease;
  filter: grayscale(20%) contrast(1.1);
}

.photo-wrapper:hover .city-photo {
  filter: grayscale(0%) contrast(1.2) brightness(1.05);
}

/* 上传占位符 */
.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px dashed #6c757d;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.upload-placeholder:hover {
  border-color: #91a8d0;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
}

.upload-icon {
  color: #6c757d;
  margin-bottom: 8px;
}

.upload-text {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.upload-hint {
  margin: 0;
  font-size: 11px;
  color: #6c757d;
}

/* 照片信息遮罩 */
.photo-overlay {
  position: absolute;
  bottom: 4px;
  left: 4px;
  right: 4px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 12px 8px 8px;
  opacity: 0;
  transition: all 0.3s ease;
  border-radius: 0 0 4px 4px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.photo-wrapper:hover .photo-overlay {
  opacity: 1;
}

.city-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.city-name {
  font-size: 13px;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  line-height: 1.2;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: 0.5px;
}

.visit-date {
  font-size: 10px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
}

/* 操作按钮 */
.photo-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  width: 26px !important;
  height: 26px !important;
  border-radius: 50% !important;
  border: none !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

.action-btn[type='primary'] {
  background: rgba(145, 168, 208, 0.9) !important;
  color: white !important;
}

.action-btn[type='primary']:hover {
  background: #91a8d0 !important;
  transform: scale(1.1) !important;
}

.action-btn[type='danger'] {
  background: rgba(239, 68, 68, 0.9) !important;
  color: white !important;
}

.action-btn[type='danger']:hover {
  background: #ef4444 !important;
  transform: scale(1.1) !important;
}

/* 城市名称（无照片时） */
.city-name-bottom {
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #495057;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
}

/* 胶片孔效果 */
.film-holes {
  position: absolute;
  left: 2px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.film-holes .hole {
  width: 4px;
  height: 4px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.8);
}

/* 更多按钮 */
.more-cities-btn {
  flex-shrink: 0;
  width: 180px;
  height: 135px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border: 2px dashed rgba(145, 168, 208, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: rotate(-1deg);
}

.more-cities-btn:hover {
  transform: rotate(0deg) translateY(-6px);
  background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%);
  border-color: #91a8d0;
  box-shadow: 0 12px 24px rgba(145, 168, 208, 0.15);
}

.more-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #91a8d0;
  font-weight: 700;
  font-size: 16px;
}

/* 空状态 */
.empty-gallery {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 40px 20px;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  color: rgba(145, 168, 208, 0.4);
  margin-bottom: 20px;
}

.empty-content h4 {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.empty-content p {
  margin: 0 0 24px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #6b7280;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .visited-cities-gallery {
    padding: 16px;
    border-radius: 16px;
  }

  .photos-grid {
    gap: 12px;
    padding: 12px 4px;
  }

  .city-photo-item {
    width: 140px;
  }

  .photo-wrapper {
    height: 105px;
  }

  .more-cities-btn {
    width: 140px;
    height: 105px;
  }

  .action-btn {
    width: 32px !important;
    height: 32px !important;
  }
}
</style>
