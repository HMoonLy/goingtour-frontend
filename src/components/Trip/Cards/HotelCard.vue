<!--
酒店推荐卡片组件
展示酒店的详细信息，支持网格和列表视图
-->

<template>
  <div 
    class="hotel-card" 
    :class="{ 
      'grid-view': viewMode === 'grid', 
      'list-view': viewMode === 'list',
      'selected': isSelected,
      'ai-recommended': hotel.isAiRecommended 
    }"
  >
    <!-- AI推荐标识 -->
    <div v-if="hotel.isAiRecommended" class="ai-badge">
      <el-icon><StarFilled /></el-icon>
      AI推荐
    </div>

    <!-- 酒店图片 -->
    <div class="card-image" @click="handleShowDetails">
      <el-image
        :src="getImageUrl()"
        :alt="hotel.name"
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
      <div v-if="hotel.confidence" class="confidence-badge">
        <el-tag size="small" :type="getConfidenceType(hotel.confidence)">
          {{ Math.round(hotel.confidence * 100) }}%匹配
        </el-tag>
      </div>
    </div>

    <!-- 酒店信息 -->
    <div class="card-content">
      <div class="card-header">
        <h3 class="hotel-name">{{ hotel.name }}</h3>
        
        <!-- 评分 -->
        <div v-if="hotel.rating" class="rating">
          <el-rate
            v-model="ratingValue"
            disabled
            show-score
            :score-template="parseFloat(hotel.rating).toFixed(1) + '分'"
            size="small"
          />
        </div>
      </div>

      <!-- 地址 -->
      <div v-if="hotel.address" class="address">
        <el-icon><MapLocation /></el-icon>
        <span>{{ hotel.address }}</span>
      </div>

      <!-- 推荐理由 -->
      <div v-if="hotel.reason" class="reason">
        <el-icon><ChatLineRound /></el-icon>
        <span>{{ hotel.reason }}</span>
      </div>

      <!-- 描述 -->
      <div v-if="hotel.description" class="description">
        <p>{{ hotel.description }}</p>
      </div>

      <!-- 详细信息 -->
      <div class="details-info">
        <!-- 酒店类型 -->
        <div v-if="hotel.type && hotel.type !== 'hotel'" class="detail-item">
          <el-tag size="small" type="info">{{ hotel.type }}</el-tag>
        </div>
        
        <!-- 价位（如果有的话）-->
        <div v-if="hotel.price" class="detail-item">
          <el-icon><Wallet /></el-icon>
          <span>{{ hotel.price }}</span>
        </div>

        <!-- 数据来源 -->
        <div class="detail-item">
          <el-icon v-if="hotel.isAiRecommended"><MagicStick /></el-icon>
          <el-icon v-else><User /></el-icon>
          <span class="source-text">
            {{ hotel.isAiRecommended ? 'AI智能推荐' : '基础推荐' }}
          </span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="card-actions">
        <el-button
          v-if="!isSelected"
          type="primary"
          size="small"
          @click="handleSelect"
          :icon="Plus"
        >
          选择
        </el-button>
        
        <el-button
          v-else
          type="success"
          size="small"
          @click="handleUnselect"
          :icon="Check"
        >
          已选择
        </el-button>
        
        <el-button
          size="small"
          type="info"
          text
          @click="handleShowDetails"
          :icon="InfoFilled"
        >
          详情
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  StarFilled, 
  Picture, 
  MapLocation, 
  ChatLineRound, 
  Wallet, 
  MagicStick, 
  User, 
  Plus, 
  Check, 
  InfoFilled 
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  hotel: {
    type: Object,
    required: true
  },
  viewMode: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'list'].includes(value)
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['select', 'unselect', 'show-details'])

// 评分值（Element Plus Rate组件需要）
const ratingValue = computed(() => {
  if (!props.hotel.rating) return 0
  const rating = parseFloat(props.hotel.rating)
  return isNaN(rating) ? 0 : rating
})

// 获取图片URL
const getImageUrl = () => {
  // 如果酒店有图片数据
  if (props.hotel.photos && props.hotel.photos.length > 0) {
    return props.hotel.photos[0].url
  }
  
  // 默认酒店图片
  return '/images/default-hotel.jpg'
}

// 获取置信度类型
const getConfidenceType = (confidence) => {
  if (confidence >= 0.8) return 'success'
  if (confidence >= 0.6) return 'warning'
  return 'info'
}

// 事件处理
const handleSelect = () => {
  emit('select', props.hotel)
}

const handleUnselect = () => {
  emit('unselect', props.hotel)
}

const handleShowDetails = () => {
  emit('show-details', props.hotel)
}
</script>

<style scoped>
.hotel-card {
  position: relative;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.hotel-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.hotel-card.selected {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.hotel-card.ai-recommended {
  background: linear-gradient(135deg, #fff 0%, #f0f9ff 100%);
}

/* AI推荐标识 */
.ai-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
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
  object-fit: cover;
  transition: transform 0.3s ease;
}

.hotel-card:hover .image {
  transform: scale(1.05);
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #9ca3af;
  gap: 8px;
}

.image-error .el-icon {
  font-size: 32px;
}

.image-error span {
  font-size: 14px;
}

/* 置信度标识 */
.confidence-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 5;
}

/* 内容区域 */
.card-content {
  padding: 16px;
}

.card-header {
  margin-bottom: 12px;
}

.hotel-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.rating {
  margin-bottom: 8px;
}

.address, .reason {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.address .el-icon, .reason .el-icon {
  color: #9ca3af;
  font-size: 14px;
  margin-top: 2px;
  flex-shrink: 0;
}

.description {
  margin-bottom: 12px;
}

.description p {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 详细信息 */
.details-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  align-items: center;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}

.detail-item .el-icon {
  font-size: 13px;
  color: #9ca3af;
}

.source-text {
  font-weight: 500;
}

/* 操作按钮 */
.card-actions {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.card-actions .el-button {
  flex: 1;
}

/* 网格视图特定样式 */
.hotel-card.grid-view {
  /* 网格视图的特定样式 */
}

/* 列表视图特定样式 */
.hotel-card.list-view {
  display: flex;
  border-radius: 8px;
}

.hotel-card.list-view .card-image {
  width: 200px;
  height: 120px;
  flex-shrink: 0;
}

.hotel-card.list-view .card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hotel-card.list-view .card-actions {
  margin-top: auto;
  padding-top: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hotel-card.list-view {
    flex-direction: column;
  }
  
  .hotel-card.list-view .card-image {
    width: 100%;
    height: 150px;
  }
}
</style>
