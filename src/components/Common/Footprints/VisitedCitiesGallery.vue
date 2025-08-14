<template>
  <div class="visited-cities-gallery">
    <div class="gallery-header">
      <h3 class="gallery-title">
        <el-icon><Camera /></el-icon>
        我去过的城市
        <span v-if="visitedCities.length > 0"
class="count">
          ({{ visitedCities.length }})
        </span>
      </h3>
      <div class="header-actions">
        <el-button size="small"
@click="toggleViewMode">
          <el-icon>
            <Grid v-if="viewMode === 'list'" />
            <List v-else />
          </el-icon>
          {{ viewMode === "list" ? "网格视图" : "列表视图" }}
        </el-button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="visitedCities.length === 0"
class="empty-state">
      <el-icon size="48"
color="#C0C4CC">
        <Camera />
      </el-icon>
      <h4>还没有去过的城市</h4>
      <p>标记城市为"去过"并上传照片来记录你的足迹</p>
    </div>

    <!-- 城市列表 -->
    <div v-else
class="cities-container" :class="[`view-${viewMode}`]">
      <div
        v-for="city in visitedCities"
        :key="city.id"
        class="city-item"
        @click="handleCityClick(city)"
      >
        <!-- 城市基本信息 -->
        <div class="city-info">
          <div class="city-header">
            <h4 class="city-name">
              {{ city.cityName }}
            </h4>
            <div class="city-meta">
              <span class="visit-date">
                {{ formatDate(city.updatedAt) }}
              </span>
              <el-tag size="small"
type="warning">
                <el-icon><Check /></el-icon>
                已去过
              </el-tag>
            </div>
          </div>

          <div v-if="city.reason"
class="city-reason">
            {{ city.reason }}
          </div>

          <div v-if="city.tags && city.tags.length > 0"
class="city-tags">
            <el-tag
              v-for="tag in city.tags.slice(0, 3)"
              :key="tag"
              size="small"
              class="tag"
            >
              {{ tag }}
            </el-tag>
            <span v-if="city.tags.length > 3"
class="more-tags">
              +{{ city.tags.length - 3 }}
            </span>
          </div>
        </div>

        <!-- 照片展示区域 -->
        <div class="photos-section">
          <div v-if="getCityPhotos(city.id).length === 0"
class="no-photos">
            <el-icon size="32"
color="#E5E7EB">
              <Picture />
            </el-icon>
            <p>暂无照片</p>
            <el-button
              size="small"
              type="primary"
              @click.stop="handleUploadClick(city)"
            >
              <el-icon><Plus /></el-icon>
              上传照片
            </el-button>
          </div>

          <div v-else
class="photos-grid">
            <div
              v-for="(photo, index) in getCityPhotos(city.id).slice(0, 4)"
              :key="photo.id"
              class="photo-item"
              :class="{ 'is-cover': photo.isCover }"
              @click.stop="handlePhotoClick(photo, city)"
            >
              <img
                :src="photo.thumbnailUrl || photo.photoUrl"
                :alt="photo.caption || '城市照片'"
                class="photo-image"
                @error="handleImageError"
              />
              <div v-if="photo.caption"
class="photo-caption">
                {{ photo.caption }}
              </div>
              <!-- 更多照片指示器 -->
              <div
                v-if="index === 3 && getCityPhotos(city.id).length > 4"
                class="more-photos-overlay"
              >
                <span>+{{ getCityPhotos(city.id).length - 4 }}</span>
              </div>
            </div>

            <!-- 添加照片按钮 -->
            <div class="add-photo-btn"
@click.stop="handleUploadClick(city)">
              <el-icon size="24">
                <Plus />
              </el-icon>
            </div>
          </div>

          <!-- 照片管理工具栏 -->
          <div v-if="getCityPhotos(city.id).length > 0"
class="photo-actions">
            <el-button-group size="small">
              <el-button @click.stop="handleUploadClick(city)">
                <el-icon><Upload /></el-icon>
                添加
              </el-button>
              <el-button @click.stop="handleViewAllPhotos(city)">
                <el-icon><View /></el-icon>
                查看全部 ({{ getCityPhotos(city.id).length }})
              </el-button>
            </el-button-group>
          </div>
        </div>
      </div>
    </div>

    <!-- 照片上传对话框 -->
    <el-dialog
      v-model="showUploadDialog"
      :title="`为 ${currentCity?.cityName} 上传照片`"
      width="600px"
      class="photo-upload-dialog"
    >
      <div class="upload-content">
        <el-upload
          ref="uploadRef"
          :action="uploadAction"
          :headers="uploadHeaders"
          :data="uploadData"
          :before-upload="beforeUpload"
          :on-success="onUploadSuccess"
          :on-error="onUploadError"
          :on-progress="onUploadProgress"
          multiple
          accept="image/*"
          drag
          class="photo-uploader"
        >
          <el-icon size="48"
color="#C0C4CC">
            <Upload />
          </el-icon>
          <div class="upload-text">
            <p>将照片拖到此处，或<em>点击上传</em></p>
            <p class="upload-tip">支持 JPG、PNG 格式，单张图片不超过 10MB</p>
          </div>
        </el-upload>

        <!-- 上传列表 -->
        <div v-if="uploadingFiles.length > 0"
class="upload-list">
          <h4>上传进度</h4>
          <div
            v-for="file in uploadingFiles"
            :key="file.uid"
            class="upload-item"
          >
            <div class="file-info">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
            <el-progress
              :percentage="file.progress || 0"
              :status="file.status"
              :stroke-width="4"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showUploadDialog = false"> 取消 </el-button>
          <el-button type="primary"
:loading="uploading" @click="finishUpload">
            完成
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 照片查看器 -->
    <el-dialog
      v-model="showPhotoViewer"
      :title="`${currentCity?.cityName} 的照片`"
      width="80%"
      class="photo-viewer-dialog"
      fullscreen
    >
      <div class="photo-viewer">
        <div class="viewer-toolbar">
          <div class="toolbar-left">
            <span class="photo-counter">
              {{ currentPhotoIndex + 1 }} / {{ currentCityPhotos.length }}
            </span>
          </div>
          <div class="toolbar-right">
            <el-button-group size="small">
              <el-button :disabled="currentPhotoIndex === 0"
@click="prevPhoto">
                <el-icon><ArrowLeft /></el-icon>
                上一张
              </el-button>
              <el-button
                :disabled="currentPhotoIndex === currentCityPhotos.length - 1"
                @click="nextPhoto"
              >
                下一张
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </el-button-group>
          </div>
        </div>

        <div class="photo-display">
          <img
            v-if="currentPhoto"
            :src="currentPhoto.photoUrl"
            :alt="currentPhoto.caption"
            class="main-photo"
          />
        </div>

        <div v-if="currentPhoto"
class="photo-info-panel">
          <div class="photo-meta">
            <h4>{{ currentPhoto.caption || "无标题" }}</h4>
            <p class="upload-date">
              上传于 {{ formatDate(currentPhoto.uploadTime) }}
            </p>
            <div v-if="currentPhoto.tags"
class="photo-tags">
              <el-tag v-for="tag in currentPhoto.tags"
:key="tag" size="small">
                {{ tag }}
              </el-tag>
            </div>
          </div>

          <div class="photo-actions-panel">
            <el-button size="small"
@click="editPhotoCaption(currentPhoto)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="deletePhoto(currentPhoto)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>

        <!-- 缩略图条 -->
        <div class="thumbnail-strip">
          <div
            v-for="(photo, index) in currentCityPhotos"
            :key="photo.id"
            class="thumbnail-item"
            :class="{ 'is-active': index === currentPhotoIndex }"
            @click="currentPhotoIndex = index"
          >
            <img
              :src="photo.thumbnailUrl || photo.photoUrl"
              :alt="photo.caption"
              class="thumbnail-image"
            />
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Camera,
  Grid,
  List,
  Check,
  Picture,
  Plus,
  Upload,
  View,
  ArrowLeft,
  ArrowRight,
  Edit,
  Delete,
} from "@element-plus/icons-vue";
import { useWishlistStore } from "@/store/wishlist.js";
import { uploadTripImages } from "@/utils/ossUpload.js";

export default {
  name: "VisitedCitiesGallery",
  components: {
    Camera,
    Grid,
    List,
    Check,
    Picture,
    Plus,
    Upload,
    View,
    ArrowLeft,
    ArrowRight,
    Edit,
    Delete,
  },
  setup() {
    const wishlistStore = useWishlistStore();

    // 视图相关
    const viewMode = ref("grid"); // grid | list

    // 照片相关
    const cityPhotos = ref(new Map()); // cityId -> photos[]

    // 上传相关
    const showUploadDialog = ref(false);
    const currentCity = ref(null);
    const uploading = ref(false);
    const uploadingFiles = ref([]);
    const uploadRef = ref(null);

    // 查看器相关
    const showPhotoViewer = ref(false);
    const currentPhotoIndex = ref(0);

    // 计算属性
    const visitedCities = computed(() => {
      return wishlistStore.wishlistItems.filter(
        (item) => item.status === "visited",
      );
    });

    const currentCityPhotos = computed(() => {
      if (!currentCity.value) return [];
      return getCityPhotos(currentCity.value.id);
    });

    const currentPhoto = computed(() => {
      if (currentCityPhotos.value.length === 0) return null;
      return currentCityPhotos.value[currentPhotoIndex.value];
    });

    // 上传配置
    const uploadAction = "/api/photos/upload"; // 后端上传接口
    const uploadHeaders = computed(() => ({
      Authorization: `Bearer ${wishlistStore.userToken}`, // 用户token
    }));
    const uploadData = computed(() => ({
      wishlistItemId: currentCity.value?.id,
    }));

    // 方法
    const toggleViewMode = () => {
      viewMode.value = viewMode.value === "grid" ? "list" : "grid";
    };

    const getCityPhotos = (cityId) => {
      return cityPhotos.value.get(cityId) || [];
    };

    const loadCityPhotos = async () => {
      try {
        // 这里调用API获取所有城市的照片
        // const photos = await api.getCityPhotos();
        // 临时模拟数据
        const mockPhotos = new Map();
        visitedCities.value.forEach((city) => {
          mockPhotos.set(city.id, []);
        });
        cityPhotos.value = mockPhotos;
      } catch (error) {
        console.error("加载城市照片失败:", error);
        ElMessage.error("加载照片失败");
      }
    };

    const handleCityClick = (city) => {
      // 点击城市，可以展开详情或跳转
      console.log("点击城市:", city);
    };

    const handleUploadClick = (city) => {
      currentCity.value = city;
      showUploadDialog.value = true;
      uploadingFiles.value = [];
    };

    const handlePhotoClick = (photo, city) => {
      currentCity.value = city;
      currentPhotoIndex.value = getCityPhotos(city.id).findIndex(
        (p) => p.id === photo.id,
      );
      showPhotoViewer.value = true;
    };

    const handleViewAllPhotos = (city) => {
      currentCity.value = city;
      currentPhotoIndex.value = 0;
      showPhotoViewer.value = true;
    };

    // 上传相关方法
    const beforeUpload = (file) => {
      const isImage = file.type.startsWith("image/");
      const isLt10M = file.size / 1024 / 1024 < 10;

      if (!isImage) {
        ElMessage.error("只能上传图片文件!");
        return false;
      }
      if (!isLt10M) {
        ElMessage.error("上传图片大小不能超过 10MB!");
        return false;
      }

      // 添加到上传列表
      uploadingFiles.value.push({
        uid: file.uid,
        name: file.name,
        size: file.size,
        status: "uploading",
        progress: 0,
      });

      return true;
    };

    const onUploadProgress = (evt, file) => {
      const item = uploadingFiles.value.find((f) => f.uid === file.uid);
      if (item) {
        item.progress = Math.round((evt.loaded / evt.total) * 100);
      }
    };

    const onUploadSuccess = (response, file) => {
      const item = uploadingFiles.value.find((f) => f.uid === file.uid);
      if (item) {
        item.status = "success";
        item.progress = 100;
      }

      // 更新城市照片列表
      if (response.success && response.data) {
        const cityId = currentCity.value.id;
        const photos = getCityPhotos(cityId);
        photos.push(response.data);
        cityPhotos.value.set(cityId, photos);
      }

      ElMessage.success("照片上传成功");
    };

    const onUploadError = (error, file) => {
      const item = uploadingFiles.value.find((f) => f.uid === file.uid);
      if (item) {
        item.status = "exception";
      }

      ElMessage.error("照片上传失败");
      console.error("上传错误:", error);
    };

    const finishUpload = () => {
      showUploadDialog.value = false;
      // 刷新照片列表
      loadCityPhotos();
    };

    // 查看器相关方法
    const prevPhoto = () => {
      if (currentPhotoIndex.value > 0) {
        currentPhotoIndex.value--;
      }
    };

    const nextPhoto = () => {
      if (currentPhotoIndex.value < currentCityPhotos.value.length - 1) {
        currentPhotoIndex.value++;
      }
    };

    const editPhotoCaption = async (photo) => {
      try {
        const { value: caption } = await ElMessageBox.prompt(
          "编辑照片描述",
          "编辑照片",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            inputValue: photo.caption || "",
            inputPlaceholder: "请输入照片描述",
          },
        );

        // 调用API更新照片描述
        // await api.updatePhoto(photo.id, { caption });
        photo.caption = caption;
        ElMessage.success("照片描述已更新");
      } catch (error) {
        console.log("取消编辑");
      }
    };

    const deletePhoto = async (photo) => {
      try {
        await ElMessageBox.confirm("确定要删除这张照片吗？", "删除照片", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });

        // 调用API删除照片
        // await api.deletePhoto(photo.id);

        // 更新本地列表
        const cityId = currentCity.value.id;
        const photos = getCityPhotos(cityId);
        const index = photos.findIndex((p) => p.id === photo.id);
        if (index > -1) {
          photos.splice(index, 1);
          cityPhotos.value.set(cityId, photos);
        }

        // 更新当前照片索引
        if (currentPhotoIndex.value >= photos.length) {
          currentPhotoIndex.value = Math.max(0, photos.length - 1);
        }

        ElMessage.success("照片已删除");

        // 如果没有照片了，关闭查看器
        if (photos.length === 0) {
          showPhotoViewer.value = false;
        }
      } catch (error) {
        console.log("取消删除");
      }
    };

    // 工具方法
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("zh-CN");
    };

    const formatFileSize = (bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const handleImageError = (event) => {
      event.target.src = "/images/placeholder-photo.jpg"; // 占位图
    };

    // 生命周期
    onMounted(() => {
      loadCityPhotos();
    });

    return {
      // 数据
      viewMode,
      visitedCities,
      cityPhotos,

      // 上传相关
      showUploadDialog,
      currentCity,
      uploading,
      uploadingFiles,
      uploadRef,
      uploadAction,
      uploadHeaders,
      uploadData,

      // 查看器相关
      showPhotoViewer,
      currentPhotoIndex,
      currentCityPhotos,
      currentPhoto,

      // 方法
      toggleViewMode,
      getCityPhotos,
      handleCityClick,
      handleUploadClick,
      handlePhotoClick,
      handleViewAllPhotos,
      beforeUpload,
      onUploadProgress,
      onUploadSuccess,
      onUploadError,
      finishUpload,
      prevPhoto,
      nextPhoto,
      editPhotoCaption,
      deletePhoto,
      formatDate,
      formatFileSize,
      handleImageError,
    };
  },
};
</script>

<style scoped>
.visited-cities-gallery {
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  box-shadow: 0 2px 12px rgba(145, 168, 208, 0.06);
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(145, 168, 208, 0.1);
}

.gallery-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
}

.gallery-title .el-icon {
  color: #91a8d0;
  font-size: 24px;
}

.count {
  font-size: 16px;
  color: #6b7280;
  font-weight: 400;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-state h4 {
  margin: 20px 0 10px 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

/* 城市容器 */
.cities-container {
  display: grid;
  gap: 20px;
}

.cities-container.view-grid {
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.cities-container.view-list {
  grid-template-columns: 1fr;
}

/* 城市项 */
.city-item {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.city-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(145, 168, 208, 0.15);
  border-color: rgba(145, 168, 208, 0.2);
}

/* 城市信息 */
.city-info {
  margin-bottom: 16px;
}

.city-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.city-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.city-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.visit-date {
  font-size: 12px;
  color: #6b7280;
}

.city-reason {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.city-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.tag {
  font-size: 12px;
}

.more-tags {
  font-size: 12px;
  color: #9ca3af;
}

/* 照片区域 */
.photos-section {
  border-top: 1px solid rgba(145, 168, 208, 0.1);
  padding-top: 16px;
}

.no-photos {
  text-align: center;
  padding: 24px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
}

.no-photos p {
  margin: 12px 0;
  font-size: 14px;
  color: #6b7280;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  position: relative;
}

.photo-item {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.photo-item:hover {
  transform: scale(1.05);
}

.photo-item.is-cover {
  grid-column: span 2;
  grid-row: span 2;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 8px;
  font-size: 12px;
  line-height: 1.3;
}

.more-photos-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
}

.add-photo-btn {
  aspect-ratio: 1;
  background: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #9ca3af;
}

.add-photo-btn:hover {
  background: #e5e7eb;
  border-color: #91a8d0;
  color: #91a8d0;
}

.photo-actions {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

/* 上传对话框 */
.photo-upload-dialog :deep(.el-dialog) {
  border-radius: 16px;
}

.upload-content {
  padding: 20px 0;
}

.photo-uploader {
  margin-bottom: 20px;
}

.photo-uploader :deep(.el-upload-dragger) {
  border-radius: 12px;
  border: 2px dashed #d1d5db;
  background: #fafbfc;
  transition: all 0.3s ease;
}

.photo-uploader :deep(.el-upload-dragger:hover) {
  border-color: #91a8d0;
  background: #f8fafc;
}

.upload-text {
  margin-top: 16px;
  text-align: center;
}

.upload-text p {
  margin: 8px 0;
  color: #6b7280;
}

.upload-text em {
  color: #91a8d0;
  font-style: normal;
}

.upload-tip {
  font-size: 12px !important;
  color: #9ca3af !important;
}

.upload-list {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
}

.upload-list h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #374151;
}

.upload-item {
  margin-bottom: 16px;
}

.upload-item:last-child {
  margin-bottom: 0;
}

.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.file-name {
  font-size: 14px;
  color: #374151;
}

.file-size {
  font-size: 12px;
  color: #9ca3af;
}

/* 照片查看器 */
.photo-viewer-dialog :deep(.el-dialog) {
  border-radius: 16px;
}

.photo-viewer {
  height: 80vh;
  display: flex;
  flex-direction: column;
}

.viewer-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 20px;
}

.photo-counter {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.photo-display {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
}

.main-photo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.photo-info-panel {
  padding: 20px 0;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.photo-meta h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #1f2937;
}

.upload-date {
  margin: 0 0 12px 0;
  font-size: 12px;
  color: #6b7280;
}

.photo-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.thumbnail-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 16px 0;
  scrollbar-width: thin;
}

.thumbnail-item {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.thumbnail-item.is-active {
  border-color: #91a8d0;
}

.thumbnail-item:hover {
  transform: scale(1.1);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .visited-cities-gallery {
    padding: 16px;
  }

  .gallery-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .cities-container.view-grid {
    grid-template-columns: 1fr;
  }

  .city-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .city-meta {
    align-items: flex-start;
  }

  .photos-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .photo-item.is-cover {
    grid-column: span 1;
    grid-row: span 1;
  }

  .photo-viewer {
    height: 70vh;
  }

  .viewer-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .photo-info-panel {
    flex-direction: column;
    gap: 16px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .visited-cities-gallery {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border-color: rgba(99, 102, 241, 0.2);
  }

  .gallery-title {
    color: #f9fafb;
  }

  .city-item {
    background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
    border-color: rgba(99, 102, 241, 0.2);
  }

  .city-name {
    color: #f9fafb;
  }

  .city-reason {
    color: #d1d5db;
  }

  .no-photos {
    background: #374151;
    border-color: #4b5563;
  }

  .add-photo-btn {
    background: #374151;
    border-color: #4b5563;
    color: #9ca3af;
  }

  .add-photo-btn:hover {
    background: #4b5563;
    border-color: #6366f1;
    color: #6366f1;
  }
}
</style>
