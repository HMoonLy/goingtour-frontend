<!--
POI详情对话框组件
展示高德API获取的完整地点信息
-->

<template>
  <el-dialog
    v-model="visible"
    :title="''"
    width="80%"
    :max-width="800"
    destroy-on-close
    center
    :show-close="false"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    class="poi-detail-dialog"
  >
    <div v-if="poi && poi.name" class="poi-detail-content">
      <!-- 头部信息 -->
      <div class="poi-header">
        <div class="poi-basic-info">
          <h2 class="poi-name">{{ poi.name }}</h2>
          <div class="poi-category">
            <el-tag type="info" size="large">{{ getPoiCategory() }}</el-tag>
            <el-tag v-if="poi.isEnhanced" type="success" size="small">
              <el-icon><Check /></el-icon>
              高德数据
            </el-tag>
          </div>
        </div>
        
        <!-- 关闭按钮 -->
        <div class="poi-close-btn">
          <el-button
            type="info"
            :icon="Close"
            circle
            size="large"
            @click="visible = false"
            class="close-button"
          />
        </div>
      </div>

      <!-- 图片展示 -->
      <div v-if="getImages().length > 0" class="poi-images">
        <h3 class="section-title">
          <el-icon><Picture /></el-icon>
          实景图片
        </h3>
        <div class="images-grid">
          <el-image
            v-for="(image, index) in getImages().slice(0, 6)"
            :key="index"
            :src="image.url"
            :alt="image.alt || poi.name"
            fit="cover"
            class="poi-image"
            :preview-src-list="getImages().map(img => img.url)"
            :initial-index="index"
            lazy
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
        <div v-if="getImages().length > 6" class="more-images">
          还有 {{ getImages().length - 6 }} 张图片...
        </div>
      </div>

      <!-- 详细信息 -->
      <div class="poi-details">
        <div class="details-grid">
          <!-- 基本信息 -->
          <div class="detail-section">
            <h3 class="section-title">
              <el-icon><InfoFilled /></el-icon>
              基本信息
            </h3>
            <div class="detail-items">
              <div v-if="getAddress()" class="detail-item">
                <span class="label">地址:</span>
                <span class="value">{{ getAddress() }}</span>
              </div>
              <div v-if="poi.tel || poi.poi?.tel" class="detail-item">
                <span class="label">电话:</span>
                <span class="value">{{ poi.tel || poi.poi?.tel }}</span>
              </div>
              <div v-if="poi.openTime || poi.poi?.openTime" class="detail-item">
                <span class="label">营业时间:</span>
                <span class="value">{{ poi.openTime || poi.poi?.openTime }}</span>
              </div>
              <div v-if="poi.poi?.businessArea" class="detail-item">
                <span class="label">商圈:</span>
                <span class="value">{{ poi.poi.businessArea }}</span>
              </div>
              <div v-if="poi.poi?.district" class="detail-item">
                <span class="label">所在区域:</span>
                <span class="value">{{ poi.poi.district }}</span>
              </div>
              <div v-if="poi.poi?.website" class="detail-item">
                <span class="label">官网:</span>
                <a :href="poi.poi.website" target="_blank" class="value link">
                  {{ poi.poi.website }}
                </a>
              </div>
            </div>
          </div>

          <!-- 位置信息 -->
          <div v-if="poi.coordinates || poi.poi?.coordinates" class="detail-section">
            <h3 class="section-title">
              <el-icon><MapLocation /></el-icon>
              位置信息
            </h3>
            <div class="detail-items">
              <div class="detail-item">
                <span class="label">坐标:</span>
                <span class="value">
                  {{ formatCoordinates(poi.coordinates || poi.poi?.coordinates) }}
                </span>
              </div>
              <div class="map-actions">
                <el-button
                  size="small"
                  type="primary"
                  @click="openInMap"
                >
                  <el-icon><MapLocation /></el-icon>
                  在地图中查看
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 描述信息 -->
        <div v-if="getDescription()" class="description-section">
          <h3 class="section-title">
            <el-icon><Document /></el-icon>
            详细介绍
          </h3>
          <div class="description-content">
            {{ getDescription() }}
          </div>
        </div>

        <!-- AI推荐理由 -->
        <div v-if="poi.reasoning || poi.reason" class="reasoning-section">
          <h3 class="section-title">
            <el-icon><StarFilled /></el-icon>
            推荐理由
          </h3>
          <div class="reasoning-content">
            {{ poi.reasoning || poi.reason }}
          </div>
        </div>

        <!-- 匹配偏好 -->
        <div v-if="poi.matchedPreferences?.length" class="preferences-section">
          <h3 class="section-title">
            <el-icon><CollectionTag /></el-icon>
            匹配偏好
          </h3>
          <div class="preferences-tags">
            <el-tag
              v-for="preference in poi.matchedPreferences"
              :key="preference"
              size="large"
              type="info"
              effect="plain"
            >
              {{ preference }}
            </el-tag>
          </div>
        </div>

        <!-- 标签 -->
        <div v-if="poi.tags?.length" class="tags-section">
          <h3 class="section-title">
            <el-icon><PriceTag /></el-icon>
            相关标签
          </h3>
          <div class="tags-container">
            <el-tag
              v-for="tag in poi.tags"
              :key="tag"
              size="default"
              effect="plain"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button v-if="!isSelected" type="primary" @click="handleSelect">
          <el-icon><Plus /></el-icon>
          选择此地点
        </el-button>
        <el-button v-else type="success" @click="handleUnselect">
          <el-icon><Check /></el-icon>
          已选择
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Check,
  Picture,
  InfoFilled,
  MapLocation,
  Document,
  StarFilled,
  CollectionTag,
  PriceTag,
  Plus,
  Close
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  poi: {
    type: Object,
    default: () => ({})
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'select', 'unselect'])

// Computed
const visible = computed({
  get() {
    console.log('POI Dialog get visible:', props.modelValue)
    return props.modelValue
  },
  set(value) {
    console.log('POI Dialog set visible:', value, 'emitting update:modelValue')
    emit('update:modelValue', value)
  }
})

// Methods
const getPoiCategory = () => {
  if (props.poi.poi?.category) {
    return props.poi.poi.category
  }
  if (props.poi.category) {
    return props.poi.category
  }
  if (props.poi.type) {
    return props.poi.type
  }
  return '地点'
}

const getRating = () => {
  if (props.poi.poi?.rating && props.poi.poi.rating > 0) {
    return Number(props.poi.poi.rating)
  }
  if (props.poi.rating && props.poi.rating > 0) {
    return Number(props.poi.rating)
  }
  return null
}

const getImages = () => {
  // 优先使用POI的images
  if (props.poi.poi?.images && Array.isArray(props.poi.poi.images)) {
    return props.poi.poi.images
  }
  
  // 使用基本images
  if (props.poi.images && Array.isArray(props.poi.images)) {
    return props.poi.images
  }
  
  // 兼容旧格式
  if (props.poi.photos && Array.isArray(props.poi.photos)) {
    return props.poi.photos.map(photo => ({
      url: photo.url || photo,
      alt: props.poi.name
    }))
  }
  
  return []
}

const getAddress = () => {
  if (props.poi.poi?.address) {
    return props.poi.poi.address
  }
  if (props.poi.address) {
    return props.poi.address
  }
  if (props.poi.location) {
    return props.poi.location
  }
  return null
}

const getDescription = () => {
  if (props.poi.poi?.description) {
    return props.poi.poi.description
  }
  if (props.poi.description) {
    return props.poi.description
  }
  return null
}

const formatCoordinates = (coordinates) => {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
    return '坐标信息不可用'
  }
  const [lng, lat] = coordinates
  return `经度: ${lng.toFixed(6)}, 纬度: ${lat.toFixed(6)}`
}

const openInMap = () => {
  const coordinates = props.poi.coordinates || props.poi.poi?.coordinates
  if (coordinates && Array.isArray(coordinates) && coordinates.length >= 2) {
    const [lng, lat] = coordinates
    // 打开高德地图
    const url = `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent(props.poi.name)}`
    window.open(url, '_blank')
  }
}

const handleSelect = () => {
  emit('select', props.poi)
}

const handleUnselect = () => {
  emit('unselect', props.poi)
}
</script>

<style scoped>
.poi-detail-dialog {
  --el-dialog-border-radius: 20px;
  --el-dialog-box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.poi-detail-dialog :deep(.el-dialog) {
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.poi-detail-dialog :deep(.el-dialog__header) {
  padding: 24px 32px 16px;
  border-bottom: 1px solid #f0f2f5;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px 20px 0 0;
}

.poi-detail-dialog :deep(.el-dialog__title) {
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.poi-detail-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
  font-size: 18px;
}

.poi-detail-dialog :deep(.el-dialog__body) {
  padding: 32px;
}

.poi-detail-content {
  padding: 0;
}

.poi-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.poi-basic-info {
  flex: 1;
}

.poi-name {
  margin: 0 0 12px 0;
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1.2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.poi-category {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.poi-close-btn {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.close-button {
  --el-button-bg-color: #f5f5f5;
  --el-button-border-color: #dcdfe6;
  --el-button-text-color: #606266;
  transition: all 0.3s ease;
}

.close-button:hover {
  --el-button-bg-color: #e74c3c;
  --el-button-border-color: #e74c3c;
  --el-button-text-color: #ffffff;
  transform: scale(1.05);
}

.poi-images {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  padding-bottom: 8px;
  border-bottom: 2px solid #e8f4fd;
}

.section-title .el-icon {
  color: #409eff;
  font-size: 20px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.poi-image {
  width: 100%;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.poi-image:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #c0c4cc;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-size: 24px;
}

.more-images {
  margin-top: 12px;
  text-align: center;
  color: #909399;
  font-size: 14px;
  font-style: italic;
}

.poi-details {
  margin-bottom: 24px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.detail-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e8f4fd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.detail-section:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.detail-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f2f5;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 90px;
  flex-shrink: 0;
  font-size: 14px;
}

.detail-item .value {
  color: #34495e;
  word-break: break-all;
  line-height: 1.5;
  font-size: 14px;
}

.detail-item .value.link {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}

.detail-item .value.link:hover {
  text-decoration: underline;
  color: #66b1ff;
}

.map-actions {
  margin-top: 16px;
}

.description-section,
.reasoning-section,
.preferences-section,
.tags-section {
  margin-bottom: 28px;
}

.description-content,
.reasoning-content {
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  color: #495057;
  line-height: 1.7;
  border: 1px solid #e8f4fd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  font-size: 15px;
}

.reasoning-content {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%);
  border-left: 4px solid #ffc107;
  border-color: rgba(255, 193, 7, 0.3);
}

.preferences-tags,
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.preferences-tags .el-tag,
.tags-container .el-tag {
  border-radius: 20px;
  padding: 8px 16px;
  font-weight: 500;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.preferences-tags .el-tag:hover,
.tags-container .el-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #f0f2f5;
  margin-top: 32px;
}

.dialog-footer .el-button {
  border-radius: 24px;
  padding: 12px 24px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.dialog-footer .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .poi-detail-dialog :deep(.el-dialog__body) {
    padding: 20px;
  }
  
  .poi-header {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    margin-bottom: 24px;
  }
  
  .poi-name {
    font-size: 24px;
  }
  
  .poi-close-btn {
    justify-content: center;
    margin-top: 16px;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 24px;
  }
  
  .detail-section {
    padding: 20px;
  }
  
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }
  
  .poi-image {
    height: 100px;
  }
  
  .section-title {
    font-size: 16px;
    margin-bottom: 16px;
  }
  
  .description-content,
  .reasoning-content {
    padding: 16px;
    font-size: 14px;
  }
  
  .dialog-footer {
    flex-direction: column;
    gap: 8px;
  }
  
  .dialog-footer .el-button {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .poi-name {
    font-size: 20px;
  }
  
  .images-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .detail-section {
    padding: 12px;
  }
}
</style>