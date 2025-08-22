<!--
POI详情对话框组件
展示高德API获取的完整地点信息
-->

<template>
  <el-dialog
    v-model="visible"
    :title="poi.name || '地点详情'"
    width="80%"
    :max-width="800"
    destroy-on-close
    center
    class="poi-detail-dialog"
  >
    <div v-if="poi" class="poi-detail-content">
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
        
        <!-- 评分和基本统计 -->
        <div class="poi-stats">
          <div v-if="getRating()" class="rating-section">
            <el-rate
              :model-value="getRating()"
              disabled
              show-score
              text-color="#ff9900"
              :score-template="`${getRating().toFixed(1)}分`"
              :max="5"
            />
          </div>
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
  Plus
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

// Data
const visible = ref(false)

// Watch
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
})

watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
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
  --el-dialog-border-radius: 16px;
}

.poi-detail-content {
  padding: 0;
}

.poi-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.poi-basic-info {
  flex: 1;
}

.poi-name {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1.3;
}

.poi-category {
  display: flex;
  gap: 8px;
  align-items: center;
}

.poi-stats {
  text-align: right;
}

.rating-section {
  margin-bottom: 8px;
}

.poi-images {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.poi-image {
  width: 100%;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #c0c4cc;
  background: #f5f7fa;
}

.more-images {
  margin-top: 8px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.poi-details {
  margin-bottom: 16px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.detail-section {
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
}

.detail-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.detail-item .label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
  flex-shrink: 0;
}

.detail-item .value {
  color: #303133;
  word-break: break-all;
}

.detail-item .value.link {
  color: #409eff;
  text-decoration: none;
}

.detail-item .value.link:hover {
  text-decoration: underline;
}

.map-actions {
  margin-top: 12px;
}

.description-section,
.reasoning-section,
.preferences-section,
.tags-section {
  margin-bottom: 20px;
}

.description-content,
.reasoning-content {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #606266;
  line-height: 1.6;
}

.reasoning-content {
  background: rgba(255, 193, 7, 0.1);
  border-left: 4px solid #ffc107;
}

.preferences-tags,
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .poi-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .poi-stats {
    text-align: left;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .poi-image {
    height: 80px;
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