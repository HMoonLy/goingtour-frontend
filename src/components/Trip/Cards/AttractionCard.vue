<!--
景点推荐卡片组件 - 重点突出推荐理由的信息驱动设计
-->

<template>
  <div class="attraction-card" :class="{ selected: isSelected }">
    <!-- 卡片头部：紧凑的信息区 -->
    <div class="card-header">
      <!-- 左侧：小图片 + 基本信息 -->
      <div class="header-left">
        <div class="mini-image" @click="handleShowDetails">
          <img :src="getImageUrl()" :alt="attraction.name" />
          <div class="image-overlay">
            <el-icon><ZoomIn /></el-icon>
          </div>
        </div>
        
        <div class="basic-info">
          <h3 class="name">{{ attraction.name }}</h3>
          <div class="location">
            <el-icon><MapLocation /></el-icon>
            <span>{{ getLocationText() }}</span>
          </div>
          <div v-if="getRating()" class="rating">
            <el-rate 
              :model-value="getRating()" 
              disabled 
              size="small"
              show-score
              :score-template="`${getRating().toFixed(1)}分`"
            />
          </div>
        </div>
      </div>
      
      <!-- 右侧：类型标签 -->
      <div class="type-section">
        <el-tag type="primary" size="small">景点</el-tag>
        <el-tag v-if="attraction.type" type="info" size="small">
          {{ attraction.type }}
        </el-tag>
      </div>
    </div>

    <!-- 推荐理由区域 - 重点突出 -->
    <div class="recommendation-reason">
      <div class="reason-header">
        <el-icon class="ai-icon"><StarFilled /></el-icon>
        <span class="reason-label">AI推荐理由</span>
      </div>
      <p class="reason-text">
        {{ attraction.reasoning || attraction.reason || '基于您的偏好和行程安排为您推荐此景点' }}
      </p>
    </div>

    <!-- 匹配标签 -->
    <div v-if="attraction.matchedPreferences?.length" class="matched-tags">
      <span class="tags-label">匹配您的偏好：</span>
      <div class="tags-container">
        <el-tag
          v-for="preference in attraction.matchedPreferences.slice(0, 3)"
          :key="preference"
          size="small"
          type="success"
          effect="light"
        >
          {{ preference }}
        </el-tag>
        <span v-if="attraction.matchedPreferences.length > 3" class="more-tags">
          +{{ attraction.matchedPreferences.length - 3 }}
        </span>
      </div>
    </div>

    <!-- 其他标签 -->
    <div v-if="attraction.tags?.length" class="other-tags">
      <el-tag
        v-for="tag in attraction.tags.slice(0, 4)"
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
      <el-button size="small" type="primary" text @click="handleShowDetails">
        <el-icon><InfoFilled /></el-icon>
        查看详情
      </el-button>
      
      <el-button 
        size="small"
        :type="isSelected ? 'success' : 'primary'"
        @click="isSelected ? handleUnselect() : handleSelect()"
      >
        <el-icon>
          <component :is="isSelected ? 'Check' : 'Plus'" />
        </el-icon>
        {{ isSelected ? '已选择' : '选择此地' }}
      </el-button>
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
  ZoomIn
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  attraction: {
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

// 获取简化的图片URL - 使用本地默认图片
const getImageUrl = () => {
  // 使用景点的实际图片或占位符
  if (props.attraction.photos && props.attraction.photos.length > 0) {
    return props.attraction.photos[0].url || props.attraction.photos[0]
  }
  if (props.attraction.poi?.photos && props.attraction.poi.photos.length > 0) {
    return props.attraction.poi.photos[0].url || props.attraction.poi.photos[0]
  }
  
  // 尝试根据景点名称匹配本地图片
  const name = props.attraction.name?.toLowerCase() || ''
  const cityImages = {
    '故宫': '/images/destinations/beijing.jpg',
    '天坛': '/images/destinations/beijing.jpg', 
    '长城': '/images/destinations/beijing.jpg',
    '颐和园': '/images/destinations/beijing.jpg',
    '天安门': '/images/destinations/beijing.jpg',
    '西湖': '/images/destinations/hangzhou.jpg',
    '雷峰塔': '/images/destinations/hangzhou.jpg',
    '断桥': '/images/destinations/hangzhou.jpg',
    '外滩': '/images/destinations/shanghai.jpg',
    '东方明珠': '/images/destinations/shanghai.jpg',
    '豫园': '/images/destinations/shanghai.jpg',
    '南京路': '/images/destinations/shanghai.jpg',
    '黄山': '/images/destinations/huangshan.jpg',
    '九寨沟': '/images/destinations/jiuzhaigou.jpg',
    '张家界': '/images/destinations/zhangjiajie.jpg',
    '桂林': '/images/destinations/guilin.jpg',
    '丽江': '/images/destinations/lijiang.jpg',
    '大理': '/images/destinations/dali.jpg',
    '西安': '/images/destinations/xian.jpg',
    '兵马俑': '/images/destinations/xian.jpg',
    '大雁塔': '/images/destinations/xian.jpg',
    '厦门': '/images/destinations/xiamen.jpg',
    '鼓浪屿': '/images/destinations/xiamen.jpg',
    '青岛': '/images/destinations/qingdao.jpg',
    '苏州': '/images/destinations/suzhou.jpg',
    '拙政园': '/images/destinations/suzhou.jpg',
    '南京': '/images/destinations/nanjing.jpg'
  }
  
  // 查找匹配的城市图片
  for (const [keyword, imagePath] of Object.entries(cityImages)) {
    if (name.includes(keyword.toLowerCase()) || name.includes(keyword)) {
      return imagePath
    }
  }
  
  // 使用默认景点图片，最终回退到SVG
  return '/images/defaults/attraction.svg'
}

// 获取位置信息
const getLocationText = () => {
  if (props.attraction.poi?.address) {
    return props.attraction.poi.address
  }
  if (props.attraction.address) {
    return props.attraction.address
  }
  if (props.attraction.location) {
    return props.attraction.location
  }
  return '位置信息待补充'
}

// 获取评分
const getRating = () => {
  if (props.attraction.poi?.rating && props.attraction.poi.rating > 0) {
    return Number(props.attraction.poi.rating)
  }
  if (props.attraction.rating && props.attraction.rating > 0) {
    return Number(props.attraction.rating)
  }
  return null
}

// 事件处理
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
  padding: 14px;
  transition: all 0.3s ease;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.attraction-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.attraction-card.selected {
  border-color: #57799a;
  background: linear-gradient(to bottom, #f0f8ff, #ffffff);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 头部区域 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.header-left {
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

/* 小图片区域 */
.mini-image {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  border: 2px solid #f0f2f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.mini-image:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transform: scale(1.05);
}

.mini-image img {
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
  font-size: 18px;
}

.mini-image:hover .image-overlay {
  opacity: 1;
}

/* 基本信息区域 */
.basic-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.name {
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
}

.location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.location .el-icon {
  color: #409eff;
  flex-shrink: 0;
}

.location span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.rating {
  display: flex;
  align-items: center;
}

/* 类型标签区域 */
.type-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  flex-shrink: 0;
}

/* 推荐理由区域 - 重点突出 */
.recommendation-reason {
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
  border: 1px solid #c6e2ff;
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid #409eff;
  position: relative;
  overflow: hidden;
}

.recommendation-reason::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #409eff, #79bbff);
}

.reason-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.ai-icon {
  color: #409eff;
  font-size: 16px;
}

.reason-label {
  font-weight: 600;
  color: #409eff;
  font-size: 14px;
}

.reason-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #606266;
}

/* 匹配标签区域 */
.matched-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.tags-label {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  font-weight: 500;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  flex: 1;
}

.more-tags {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 其他标签区域 */
.other-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* 操作区域 */
.card-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

.card-actions .el-button {
  flex: 1;
}

.card-actions .el-button .el-icon {
  margin-right: 4px;
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
}

/* 列表视图适配 */
@media (max-width: 480px) {
  .attraction-card {
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
}
</style>