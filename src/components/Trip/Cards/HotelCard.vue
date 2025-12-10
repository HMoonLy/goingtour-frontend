<!--
酒店推荐卡片组件 - 重点突出推荐理由的信息驱动设计
-->

<template>
  <div class="hotel-card" :class="{ selected: isSelected }">
    <!-- 卡片主要内容区 -->
    <div class="card-content">
      <!-- 卡片头部：图片和主要信息 -->
      <div class="card-header">
        <!-- 左侧：图片展示区 -->
        <div class="image-section">
          <div class="main-image" @click="handleShowDetails">
            <img :src="getImageUrl()" :alt="hotel.name" />
            <div class="image-overlay">
              <el-icon><ZoomIn /></el-icon>
            </div>
          </div>
        </div>
        
        <!-- 右侧：基本信息 -->
        <div class="info-section">
          <div class="name-area">
            <h2 class="hotel-name">{{ hotel.name }}</h2>
            <el-tag type="success" size="small" class="type-tag">酒店</el-tag>
          </div>
          
          <div class="meta-info">
            <div class="location-info">
              <el-icon class="location-icon"><MapLocation /></el-icon>
              <span class="location-text">{{ getLocationText() }}</span>
            </div>
            
            <div v-if="getRating()" class="rating-info">
              <el-rate 
                :model-value="getRating()" 
                disabled 
                size="small"
                show-score
                :score-template="`${getRating().toFixed(1)}分`"
                class="rating-stars"
              />
            </div>
          </div>
        </div>
      </div>

    <!-- 推荐理由区域 - 重点突出 -->
    <div class="recommendation-reason">
      <div class="reason-header">
        <el-icon class="ai-icon"><StarFilled /></el-icon>
        <span class="reason-label">AI推荐理由</span>
      </div>
      <p class="reason-text">
        {{ hotel.reasoning || hotel.reason || '基于您的住宿偏好和行程安排为您推荐此酒店' }}
      </p>
    </div>

    <!-- 酒店特色信息 -->
    <div v-if="hotel.price || hotel.facilities" class="hotel-features">
      <div v-if="hotel.price" class="feature-item">
        <el-icon><Money /></el-icon>
        <span>{{ hotel.price }}</span>
      </div>
      <div v-if="hotel.facilities" class="feature-item">
        <el-icon><House /></el-icon>
        <span>{{ hotel.facilities }}</span>
      </div>
    </div>

    <!-- 匹配标签 -->
    <div v-if="hotel.matchedPreferences?.length" class="matched-tags">
      <span class="tags-label">匹配您的偏好：</span>
      <div class="tags-container">
        <el-tag
          v-for="preference in hotel.matchedPreferences.slice(0, 3)"
          :key="preference"
          size="small"
          type="success"
          effect="light"
        >
          {{ preference }}
        </el-tag>
        <span v-if="hotel.matchedPreferences.length > 3" class="more-tags">
          +{{ hotel.matchedPreferences.length - 3 }}
        </span>
      </div>
    </div>

    <!-- 其他标签 -->
    <div v-if="hotel.tags?.length" class="other-tags">
      <el-tag
        v-for="tag in hotel.tags.slice(0, 4)"
        :key="tag"
        size="small"
        effect="plain"
        type="info"
      >
        {{ tag }}
      </el-tag>
    </div>

      <!-- 操作区域 -->
      <div class="card-actions">
        <el-button 
          size="default" 
          class="details-btn"
          @click="handleShowDetails"
        >
          <el-icon class="btn-icon"><InfoFilled /></el-icon>
          <span>查看详情</span>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </el-button>
        
        <el-button 
          size="default"
          :type="isSelected ? 'success' : 'primary'"
          :class="['select-btn', { 'selected': isSelected }]"
          @click="isSelected ? handleUnselect() : handleSelect()"
        >
          <el-icon class="btn-icon">
            <component :is="isSelected ? 'Check' : 'Plus'" />
          </el-icon>
          <span>{{ isSelected ? '已选择' : '选择此地' }}</span>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  StarFilled, 
  MapLocation, 
  InfoFilled,
  Check,
  Plus,
  ZoomIn,
  ArrowRight,
  Money,
  House
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

// 获取图片URL - 直接使用默认酒店图片
const getImageUrl = () => {
  // 直接使用默认酒店图片
  return '/images/defaults/hotel.png'
}

// 获取位置信息
const getLocationText = () => {
  if (props.hotel.poi?.address) {
    return props.hotel.poi.address
  }
  if (props.hotel.address) {
    return props.hotel.address
  }
  if (props.hotel.location) {
    return props.hotel.location
  }
  return '位置信息待补充'
}

// 获取评分
const getRating = () => {
  if (props.hotel.poi?.rating && props.hotel.poi.rating > 0) {
    return Number(props.hotel.poi.rating)
  }
  if (props.hotel.rating && props.hotel.rating > 0) {
    return Number(props.hotel.rating)
  }
  return null
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
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 0;
  transition: all 0.3s ease;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.hotel-card:hover {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.08);
  transform: translateY(-2px);
  border-color: #000000;
}


.hotel-card.selected:hover {
  transform: translateY(-2px);
}

/* 移除装饰性背景，保持简洁 */

/* 卡片内容区域 */
.card-content {
  position: relative;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

/* 头部区域 */
.card-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

/* 图片展示区域 */
.image-section {
  flex-shrink: 0;
}

.main-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.main-image:hover {
  border-color: #409eff;
  transform: scale(1.05);
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(64, 158, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-size: 16px;
}

.main-image:hover .image-overlay {
  opacity: 1;
}

/* 信息区域 */
.info-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.name-area {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 2px;
}

.hotel-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.type-tag {
  flex-shrink: 0;
}

.meta-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.location-icon {
  color: #409eff;
  flex-shrink: 0;
  font-size: 14px;
}

.location-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.rating-info {
  display: flex;
  align-items: center;
}

/* 推荐理由区域 - 简洁版 */
.recommendation-reason {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px;
  margin: 6px 0;
}

.reason-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.ai-icon {
  color: #91c3f5;
  font-size: 14px;
}

.reason-label {
  font-weight: 600;
  color: #303133;
  font-size: 13px;
}

.reason-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: #606266;
}

/* 酒店特色信息 */
.hotel-features {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
  background: #f8f9fa;
  padding: 6px 10px;
  border-radius: 6px;
}

.feature-item .el-icon {
  color: #67c23a;
  font-size: 14px;
}

/* 匹配标签区域 */
.matched-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: 4px 0;
}

.tags-label {
  font-size: 12px;
  color: #409eff;
  white-space: nowrap;
  font-weight: 500;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  flex: 1;
}

.more-tags {
  font-size: 11px;
  color: #409eff;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 其他标签区域 */
.other-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 4px 0;
}

/* 操作区域 */
.card-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 6px;
}

/* 查看详情按钮 */
.details-btn {
  flex: 1;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  color: #606266;
  border-radius: 6px;
  height: 36px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.details-btn:hover {
  background: #409eff;
  border-color: #409eff;
  color: white;
}

/* 选择按钮 */
.select-btn {
  flex: 1;
  border-radius: 6px;
  height: 36px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.select-btn:not(.selected) {
  background: #409eff;
  border-color: #409eff;
  color: white;
}

.select-btn:not(.selected):hover {
  background: #337ecc;
  border-color: #337ecc;
}

.select-btn.selected {
  background: #409eff;
  border-color: #409eff;
  color: white;
}

.select-btn.selected:hover {
  background: #337ecc;
  border-color: #337ecc;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .type-section {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }
  
  .mini-image {
    width: 60px;
    height: 60px;
  }
  
  .name {
    font-size: 16px;
  }
  
  .matched-tags {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  
  .tags-label {
    margin-bottom: 2px;
  }
  
  .hotel-features {
    gap: 8px;
  }
}

/* 列表视图适配 */
@media (max-width: 480px) {
  .hotel-card {
    padding: 12px;
    gap: 12px;
    min-height: auto;
  }
  
  .header-left {
    gap: 8px;
  }
  
  .mini-image {
    width: 50px;
    height: 50px;
  }
  
  .name {
    font-size: 15px;
  }
  
  .recommendation-reason {
    padding: 10px;
  }
  
  .card-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .hotel-features {
    flex-direction: column;
    gap: 6px;
  }
}
</style>