<!--
景点推荐卡片组件
展示景点的详细信息，支持网格和列表视图
-->

<template>
  <div 
    class="attraction-card" 
    :class="{ 
      'grid-view': viewMode === 'grid', 
      'list-view': viewMode === 'list',
      'selected': isSelected,
      'ai-recommended': attraction.isAiRecommended 
    }"
  >
    <!-- AI推荐标识 -->
    <div v-if="attraction.isAiRecommended" class="ai-badge">
      <el-icon><StarFilled /></el-icon>
      AI推荐
    </div>

    <!-- 景点图片 -->
    <div class="card-image" @click="handleShowDetails">
      <el-image
        :src="getImageUrl()"
        :alt="attraction.name"
        fit="cover"
        class="image"
        lazy
      >
        <template #error>
          <div class="image-error">
            <el-icon><Picture /></el-icon>
            <span>暂无图片</span>
          </div>
        </template>
      </el-image>
      
      <!-- 置信度标识 -->
      <div v-if="attraction.confidence" class="confidence-badge">
        <el-tag size="small" :type="getConfidenceType(attraction.confidence)">
          {{ Math.round(attraction.confidence * 100) }}%匹配
        </el-tag>
      </div>
    </div>

    <!-- 景点信息 -->
    <div class="card-content">
      <div class="card-header">
        <h3 class="attraction-name">{{ attraction.name }}</h3>
        <div class="card-actions">
          <el-button
            v-if="!isSelected"
            size="small"
            type="primary"
            @click="handleSelect"
          >
            <el-icon><Plus /></el-icon>
            选择
          </el-button>
          <el-button
            v-else
            size="small"
            type="success"
            @click="handleUnselect"
          >
            <el-icon><Check /></el-icon>
            已选择
          </el-button>
          
          <el-button
            size="small"
            text
            @click="handleShowDetails"
          >
            详情
          </el-button>
        </div>
      </div>

      <div class="attraction-info">
        <!-- 位置信息 -->
        <div class="location">
          <el-icon><MapLocation /></el-icon>
          <span>{{ getLocationText() }}</span>
        </div>

        <!-- 联系信息 -->
        <div v-if="attraction.tel || attraction.poi?.tel" class="contact-info">
          <el-icon><Phone /></el-icon>
          <span>{{ attraction.tel || attraction.poi?.tel }}</span>
        </div>

        <!-- 营业时间 -->
        <div v-if="attraction.openTime || attraction.poi?.openTime" class="open-time">
          <el-icon><Clock /></el-icon>
          <span>{{ attraction.openTime || attraction.poi?.openTime }}</span>
        </div>

        <!-- 描述 -->
        <div class="description-section">
          <div class="description-label">景点介绍：</div>
          <p class="description">
            {{ attraction.description || '暂无详细介绍' }}
          </p>
        </div>

        <!-- 评分 -->
        <div v-if="getRating()" class="rating">
          <el-rate
            :model-value="getRating()"
            disabled
            show-score
            text-color="#ff9900"
            :score-template="`${getRating().toFixed(1)}分`"
            :max="5"
          />
        </div>

        <!-- 增强状态指示 -->
        <div v-if="attraction.isEnhanced" class="enhancement-status">
          <el-icon class="enhanced-icon"><Check /></el-icon>
          <span class="enhanced-text">已获取详细信息</span>
        </div>
        <div v-else-if="attraction.isEnhanced === false" class="enhancement-status">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span class="loading-text">正在获取详细信息...</span>
        </div>

        <!-- 推荐理由 -->
        <div class="reasoning">
          <div class="reasoning-header">
            <el-icon><InfoFilled /></el-icon>
            <span class="reasoning-label">推荐理由：</span>
          </div>
          <span class="reasoning-text">{{ attraction.reasoning || attraction.reason || '基于您的偏好推荐' }}</span>
        </div>

        <!-- 匹配偏好 -->
        <div v-if="attraction.matchedPreferences?.length" class="matched-preferences">
          <span class="preferences-label">匹配偏好:</span>
          <div class="preferences-tags">
            <el-tag
              v-for="preference in attraction.matchedPreferences.slice(0, 3)"
              :key="preference"
              size="small"
              type="info"
              effect="plain"
            >
              {{ preference }}
            </el-tag>
            <span v-if="attraction.matchedPreferences.length > 3" class="more-count">
              +{{ attraction.matchedPreferences.length - 3 }}
            </span>
          </div>
        </div>

        <!-- 标签 -->
        <div v-if="attraction.tags?.length" class="tags">
          <el-tag
            v-for="tag in attraction.tags.slice(0, 4)"
            :key="tag"
            size="small"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  StarFilled, 
  Picture, 
  Plus, 
  Check, 
  MapLocation, 
  InfoFilled,
  Phone,
  Clock,
  Loading
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  attraction: {
    type: Object,
    required: true
  },
  viewMode: {
    type: String,
    default: 'grid', // 'grid' | 'list'
    validator: (value) => ['grid', 'list'].includes(value)
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['select', 'unselect', 'show-details'])

// 计算属性
const getConfidenceType = (confidence) => {
  if (confidence >= 0.8) return 'success'
  if (confidence >= 0.6) return 'warning'
  return 'info'
}

// 获取图片URL
const getImageUrl = () => {
  // 优先使用增强后的imageUrl
  if (props.attraction.imageUrl) {
    return props.attraction.imageUrl
  }
  
  // 使用POI数据中的图片
  if (props.attraction.poi?.imageUrl) {
    return props.attraction.poi.imageUrl
  }
  
  // 使用POI的images数组
  if (props.attraction.poi?.images && props.attraction.poi.images.length > 0) {
    return props.attraction.poi.images[0].url
  }
  
  // 兼容旧格式的photos数组
  if (props.attraction.photos && props.attraction.photos.length > 0) {
    const photo = props.attraction.photos[0]
    return photo.url || photo
  }
  
  // 如果有images数组（新增强格式）
  if (props.attraction.images && props.attraction.images.length > 0) {
    return props.attraction.images[0].url
  }
  
  // 默认图片
  return '/images/default-attraction.jpg'
}

// 获取位置信息
const getLocationText = () => {
  // 优先使用POI的详细地址
  if (props.attraction.poi?.address) {
    return props.attraction.poi.address
  }
  
  // 使用基本地址信息
  if (props.attraction.address) {
    return props.attraction.address
  }
  
  // 使用location字段
  if (props.attraction.location) {
    return props.attraction.location
  }
  
  return '位置信息待补充'
}

// 获取评分
const getRating = () => {
  // 优先使用POI的评分
  if (props.attraction.poi?.rating && props.attraction.poi.rating > 0) {
    return Number(props.attraction.poi.rating)
  }
  
  // 使用原始评分
  if (props.attraction.rating && props.attraction.rating > 0) {
    return Number(props.attraction.rating)
  }
  
  return null
}

// 方法
const handleSelect = () => {
  emit('select', props.attraction)
}

const handleUnselect = () => {
  emit('unselect', props.attraction)
}

const handleShowDetails = () => {
  emit('show-details', props.attraction)
}
</script>

<style scoped>
.attraction-card {
  background: white;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
}

.attraction-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.attraction-card.selected {
  /* border-color: #91a8d0;
  box-shadow: 0 0 0 2px rgba(145, 168, 208, 0.2); */
}

.attraction-card.ai-recommended {
  /* border-color: #91a8d0; */
}

.attraction-card.ai-recommended::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #91a8d0, #a8bbdb);
  z-index: 1;
}

/* AI推荐标识 */
.ai-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #91a8d0, #a8bbdb);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 图片区域 */
.card-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.image {
  width: 100%;
  height: 100%;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #c0c4cc;
  background: #f5f7fa;
}

.image-error span {
  margin-top: 8px;
  font-size: 14px;
}

.confidence-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: 2;
}

/* 内容区域 */
.card-content {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.attraction-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  flex: 1;
  margin-right: 12px;
}

.card-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.attraction-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.description-section {
  margin-bottom: 4px;
}

.description-label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  margin-bottom: 4px;
}

.description {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.location .el-icon {
  color: #91a8d0;
}

.contact-info,
.open-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
  padding: 4px 0;
}

.contact-info .el-icon,
.open-time .el-icon {
  color: #91a8d0;
}

.enhancement-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background: #f0f9ff;
  color: #1890ff;
}

.enhanced-icon {
  color: #52c41a;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rating {
  display: flex;
  align-items: center;
}

.reasoning {
  background: rgba(145, 168, 208, 0.1);
  padding: 10px;
  border-radius: 8px;
  border-left: 3px solid #91a8d0;
  margin-top: 4px;
}

.reasoning-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.reasoning-label {
  font-size: 12px;
  color: #91a8d0;
  font-weight: 600;
}

.reasoning-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
  flex: 1;
}

.matched-preferences {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preferences-label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.preferences-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.more-count {
  font-size: 12px;
  color: #909399;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* 列表视图样式 */
.attraction-card.list-view {
  display: flex;
  align-items: stretch;
}

.attraction-card.list-view .card-image {
  width: 200px;
  height: 140px;
  flex-shrink: 0;
}

.attraction-card.list-view .card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.attraction-card.list-view .card-header {
  margin-bottom: 8px;
}

.attraction-card.list-view .attraction-info {
  flex: 1;
}

.attraction-card.list-view .description {
  -webkit-line-clamp: 1;
  line-clamp: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .attraction-card.list-view {
    flex-direction: column;
  }

  .attraction-card.list-view .card-image {
    width: 100%;
    height: 160px;
  }

  .card-header {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .card-actions {
    justify-content: flex-end;
  }

  .attraction-name {
    margin-right: 0;
  }
}
</style>
