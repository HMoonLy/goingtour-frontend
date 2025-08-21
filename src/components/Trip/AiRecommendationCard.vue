<!--
🤖 AI推荐卡片组件
显示AI推荐的景点/餐厅，包含推荐理由和置信度
-->

<template>
  <div class="ai-recommendation-card" :class="{ 'is-selected': isSelected }">
    <!-- AI推荐标识 -->
    <div v-if="item.isAiRecommended" class="ai-badge">
      <el-icon class="ai-icon"><MagicStick /></el-icon>
      <span class="ai-text">AI推荐</span>
      <div class="confidence-bar">
        <div 
          class="confidence-fill" 
          :style="{ width: `${(item.confidence || 0.8) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- 卡片内容 -->
    <div class="card-content">
      <!-- 图片区域 -->
      <div class="image-section">
        <el-image
          :src="item.image || getDefaultImage()"
          :alt="item.name"
          class="item-image"
          fit="cover"
          :preview-src-list="item.images || [item.image]"
          preview-teleported
        >
          <template #error>
            <div class="image-error">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-image>
        
        <!-- 价格标签 -->
        <div v-if="item.price" class="price-tag">
          ¥{{ item.price }}{{ getPriceUnit() }}
        </div>

        <!-- 距离标签 -->
        <div v-if="item.distance" class="distance-tag">
          {{ item.distance }}km
        </div>
      </div>

      <!-- 信息区域 -->
      <div class="info-section">
        <!-- 标题和评分 -->
        <div class="title-row">
          <h3 class="item-title">{{ item.name }}</h3>
          <div v-if="item.rating" class="rating-section">
            <el-rate
              :model-value="item.rating"
              disabled
              show-score
              score-template="{value}"
              size="small"
            />
          </div>
        </div>

        <!-- 标签 -->
        <div v-if="item.tags && item.tags.length > 0" class="tags-section">
          <el-tag
            v-for="tag in item.tags.slice(0, 3)"
            :key="tag"
            size="small"
            type="info"
            effect="plain"
            class="item-tag"
          >
            {{ tag }}
          </el-tag>
        </div>

        <!-- 地址 -->
        <div v-if="item.address" class="address-section">
          <el-icon class="address-icon">🗺</el-icon>
          <span class="address-text">{{ item.address }}</span>
        </div>

        <!-- AI推荐理由 -->
        <div v-if="item.isAiRecommended && item.aiReason" class="ai-reason">
          <div class="reason-header">
            <el-icon class="reason-icon"></el-icon>
            <span class="reason-title">推荐理由</span>
          </div>
          <p class="reason-text">{{ item.aiReason }}</p>
        </div>

        <!-- 简介 -->
        <div v-else-if="item.description" class="description">
          <p class="description-text">
            {{ item.description.length > 100 
             ?item.description.substring(0, 100) + '...' 
              : item.description 
            }}
          </p>
        </div>

        <!-- 特色信息 -->
        <div v-if="getSpecialInfo()" class="special-info">
          <el-icon class="special-icon"><InfoFilled /></el-icon>
          <span class="special-text">{{ getSpecialInfo() }}</span>
        </div>
      </div>

      <!-- 操作区域 -->
      <div class="action-section">
        <div class="action-left">
          <el-button
            v-if="!isSelected"
            type="primary"
            size="small"
            @click="handleSelect"
          >
            <el-icon><Plus /></el-icon>
            选择
          </el-button>
          <el-button
            v-else
            type="success"
            size="small"
            @click="handleUnselect"
          >
            <el-icon><Check /></el-icon>
            已选择
          </el-button>
        </div>

        <div class="action-right">
          <el-button
            size="small"
            text
            type="info"
            @click="showDetails"
          >
            <el-icon><View /></el-icon>
            详情
          </el-button>
          
          <el-button
            v-if="item.isAiRecommended"
            size="small"
            text
            type="primary"
            @click="showAiAnalysis"
          >
            <el-icon><DataAnalysis /></el-icon>
            AI分析
          </el-button>
        </div>
      </div>
    </div>

    <!-- AI分析弹窗 -->
    <el-dialog
      v-model="showAnalysisDialog"
      title="AI推荐分析"
      width="500px"
      :append-to-body="true"
    >
      <div class="ai-analysis">
        <div class="analysis-item">
          <h4>推荐理由</h4>
          <p>{{ item.aiReason || '基于您的偏好和行程安排，这个地点很适合您' }}</p>
        </div>
        
        <div class="analysis-item">
          <h4>匹配度</h4>
          <el-progress
            :percentage="Math.round((item.confidence || 0.8) * 100)"
            :color="getConfidenceColor(item.confidence || 0.8)"
          />
          <p class="confidence-desc">
            {{ getConfidenceDescription(item.confidence || 0.8) }}
          </p>
        </div>

        <div v-if="item.matchingFactors" class="analysis-item">
          <h4>匹配因素</h4>
          <ul class="matching-factors">
            <li v-for="factor in item.matchingFactors" :key="factor">
              {{ factor }}
            </li>
          </ul>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  MagicStick,
  Picture,
  InfoFilled,
  Plus,
  Check,
  View,
  DataAnalysis,
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    required: true,
    validator: value => ['attraction', 'restaurant'].includes(value)
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['select', 'unselect', 'show-details'])

// 响应式数据
const showAnalysisDialog = ref(false)

// 计算属性
const isAttraction = computed(() => props.type === 'attraction')
const isRestaurant = computed(() => props.type === 'restaurant')

// 方法
const getDefaultImage = () => {
  return isAttraction.value 
   ?'/images/default-attraction.jpg'
    : '/images/default-restaurant.jpg'
}

const getPriceUnit = () => {
  return isAttraction.value?'/人' : '/餐'
}

const getSpecialInfo = () => {
  const { item } = props
  
  if (isAttraction.value) {
    if (item.openTime) return `开放时间: ${item.openTime}`
    if (item.duration) return `建议游览: ${item.duration}`
  }
  
  if (isRestaurant.value) {
    if (item.cuisineType) return `菜系: ${item.cuisineType}`
    if (item.signature) return `招牌菜: ${item.signature}`
  }
  
  return null
}

const handleSelect = () => {
  emit('select', props.item)
}

const handleUnselect = () => {
  emit('unselect', props.item)
}

const showDetails = () => {
  emit('show-details', props.item)
}

const showAiAnalysis = () => {
  showAnalysisDialog.value = true
}

const getConfidenceColor = (confidence) => {
  if (confidence >= 0.8) return '#67c23a'
  if (confidence >= 0.6) return '#e6a23c'
  return '#f56c6c'
}

const getConfidenceDescription = (confidence) => {
  if (confidence >= 0.9) return '高度推荐 - 非常符合您的偏好'
  if (confidence >= 0.8) return '强烈推荐 - 很符合您的偏好'
  if (confidence >= 0.7) return '推荐 - 比较符合您的偏好'
  if (confidence >= 0.6) return '一般推荐 - 可能符合您的偏好'
  return '备选推荐 - 您可以考虑'
}
</script>

<style scoped>
.ai-recommendation-card {
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.ai-recommendation-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.ai-recommendation-card.is-selected {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
}

/* AI推荐标识 */
.ai-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.ai-icon {
  font-size: 12px;
}

.ai-text {
  font-weight: 600;
}

.confidence-bar {
  width: 30px;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
  margin-left: 4px;
}

.confidence-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* 卡片内容 */
.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 图片区域 */
.image-section {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.item-image {
  width: 100%;
  height: 100%;
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #c0c4cc;
}

.price-tag {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.distance-tag {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(64, 158, 255, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

/* 信息区域 */
.info-section {
  padding: 16px;
  flex: 1;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.item-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  flex: 1;
  margin-right: 8px;
}

.rating-section {
  flex-shrink: 0;
}

.tags-section {
  margin-bottom: 8px;
}

.item-tag {
  margin-right: 6px;
  margin-bottom: 4px;
}

.address-section {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: #909399;
  font-size: 13px;
}

.address-icon {
  margin-right: 4px;
  font-size: 12px;
}

.address-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* AI推荐理由 */
.ai-reason {
  background: linear-gradient(135deg, #f6f9ff 0%, #f0f7ff 100%);
  border: 1px solid #e1ecff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.reason-header {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.reason-icon {
  color: #409eff;
  margin-right: 6px;
  font-size: 14px;
}

.reason-title {
  font-size: 13px;
  font-weight: 600;
  color: #409eff;
}

.reason-text {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

/* 描述 */
.description {
  margin-bottom: 12px;
}

.description-text {
  margin: 0;
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
}

/* 特色信息 */
.special-info {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: #67c23a;
  font-size: 13px;
}

.special-icon {
  margin-right: 4px;
  font-size: 12px;
}

/* 操作区域 */
.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  background: #fafbfc;
}

.action-left,
.action-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* AI分析弹窗 */
.ai-analysis {
  padding: 16px 0;
}

.analysis-item {
  margin-bottom: 20px;
}

.analysis-item h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 14px;
}

.analysis-item p {
  margin: 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.5;
}

.confidence-desc {
  margin-top: 8px !important;
  font-size: 12px;
  color: #909399;
}

.matching-factors {
  margin: 0;
  padding-left: 16px;
}

.matching-factors li {
  color: #606266;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .image-section {
    height: 140px;
  }

  .info-section {
    padding: 12px;
  }

  .item-title {
    font-size: 15px;
  }

  .action-section {
    padding: 10px 12px;
  }

  .action-right {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
