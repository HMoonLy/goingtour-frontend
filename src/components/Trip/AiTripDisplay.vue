<template>
  <div class="ai-trip-display">
    <!-- 顶部信息卡片 -->
    <div class="trip-header">
      <div class="header-content">
        <div class="trip-title-section">
          <h1 class="trip-title">
            <el-icon class="title-icon"><Cpu /></el-icon>
            {{ structuredData?.title || '智能行程计划' }}
          </h1>
          <p class="trip-description" v-if="structuredData?.description">
            {{ structuredData.description }}
          </p>
        </div>
        
        <!-- 快速信息统计 -->
        <div class="quick-stats">
          <div class="stat-item">
            <div class="stat-value">{{ tripData?.tripBasicInfo?.days || 0 }}</div>
            <div class="stat-label">天数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ tripData?.tripBasicInfo?.travelers || 0 }}</div>
            <div class="stat-label">人数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ tripData?.qualityScore || 0 }}</div>
            <div class="stat-label">质量分</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 每日行程主体 -->
    <div class="daily-itineraries" v-if="structuredData?.dailyItineraries?.length">
      <div 
        v-for="(day, index) in structuredData.dailyItineraries" 
        :key="index"
        class="day-section"
      >
        <!-- 日期标题 -->
        <div class="day-header">
          <div class="day-badge">
            <span class="day-number">{{ index + 1 }}</span>
          </div>
          <div class="day-title-content">
            <h2 class="day-title">{{ day.theme || `第${index + 1}天` }}</h2>
            <div class="day-meta">
              <span class="day-date" v-if="day.date">{{ day.date }}</span>
              <span class="day-budget" v-if="day.dailyBudget">预算: {{ day.dailyBudget }}</span>
            </div>
          </div>
        </div>

        <!-- 当日活动列表 -->
        <div class="activities-list" v-if="day.activities?.length">
          <div 
            v-for="(activity, actIndex) in day.activities" 
            :key="actIndex"
            class="activity-card"
            :class="getActivityTypeClass(activity.type)"
          >
            <div class="activity-header">
              <div class="activity-time" v-if="activity.time">
                <el-icon><Clock /></el-icon>
                {{ activity.time }}
              </div>
              <div class="activity-type-badge" v-if="activity.type">
                {{ getActivityTypeText(activity.type) }}
              </div>
            </div>
            
            <h3 class="activity-title">{{ activity.title }}</h3>
            
            <div class="activity-details">
              <div class="activity-location" v-if="activity.location">
                <el-icon><MapPin /></el-icon>
                <span>{{ activity.location }}</span>
              </div>
              
              <div class="activity-cost" v-if="activity.cost">
                <el-icon><Money /></el-icon>
                <span>{{ activity.cost }}</span>
              </div>
              
              <div class="activity-transport" v-if="activity.transportation">
                <el-icon><CaretTop /></el-icon>
                <span>{{ activity.transportation }}</span>
              </div>
            </div>
            
            <p class="activity-description" v-if="activity.description">
              {{ activity.description }}
            </p>
            
            <div class="activity-notes" v-if="activity.notes?.length">
              <div class="notes-title">
                <el-icon><Warning /></el-icon>
                注意事项
              </div>
              <ul class="notes-list">
                <li v-for="(note, noteIndex) in activity.notes" :key="noteIndex">
                  {{ note }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 当日提示 -->
        <div class="day-tips" v-if="day.dailyTips?.length">
          <div class="tips-header">
            <el-icon><InfoFilled /></el-icon>
            当日提示
          </div>
          <ul class="tips-list">
            <li v-for="(tip, tipIndex) in day.dailyTips" :key="tipIndex">
              {{ tip }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 附加信息区域 -->
    <div class="additional-info">
      <!-- 预算分配 -->
      <el-card class="info-card budget-card" v-if="structuredData?.budgetAllocation" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Money /></el-icon>
            <span>预算分配建议</span>
          </div>
        </template>
        
        <div class="budget-total" v-if="structuredData.budgetAllocation.totalBudget">
          <span class="total-label">总预算:</span>
          <span class="total-amount">{{ structuredData.budgetAllocation.totalBudget }}</span>
        </div>
        
        <div class="budget-categories" v-if="structuredData.budgetAllocation.categories?.length">
          <div 
            v-for="(category, index) in structuredData.budgetAllocation.categories" 
            :key="index"
            class="budget-item"
          >
            <div class="budget-item-header">
              <span class="category-name">{{ category.name }}</span>
              <span class="category-amount">{{ category.amount }}</span>
              <span class="category-percentage" v-if="category.percentage">({{ category.percentage }})</span>
            </div>
            <p class="category-description" v-if="category.description">
              {{ category.description }}
            </p>
          </div>
        </div>
      </el-card>

      <!-- 出行提示 -->
      <el-card class="info-card tips-card" v-if="structuredData?.travelTips?.length" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Warning /></el-icon>
            <span>实用出行提示</span>
          </div>
        </template>
        <ul class="tips-list">
          <li v-for="(tip, index) in structuredData.travelTips" :key="index">
            {{ tip }}
          </li>
        </ul>
      </el-card>

      <!-- 必备物品清单 -->
      <el-card class="info-card packing-card" v-if="structuredData?.packingList?.length" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Suitcase /></el-icon>
            <span>必备物品清单</span>
          </div>
        </template>
        <div class="packing-grid">
          <div 
            v-for="(item, index) in structuredData.packingList" 
            :key="index"
            class="packing-item"
          >
            <el-icon><Check /></el-icon>
            <span>{{ item }}</span>
          </div>
        </div>
      </el-card>

      <!-- 备选方案 -->
      <el-card class="info-card backup-card" v-if="structuredData?.backupPlans?.length" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Cloudy /></el-icon>
            <span>备选方案</span>
          </div>
        </template>
        <ul class="backup-list">
          <li v-for="(plan, index) in structuredData.backupPlans" :key="index">
            {{ plan }}
          </li>
        </ul>
      </el-card>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="default" @click="copyToClipboard">
        <el-icon><DocumentCopy /></el-icon>
        复制行程
      </el-button>
      <el-button type="primary" @click="saveTrip">
        <el-icon><Folder /></el-icon>
        保存行程
      </el-button>
      <el-button type="success" @click="shareTrip">
        <el-icon><Share /></el-icon>
        分享行程
      </el-button>
      <el-button type="warning" @click="regenerateTrip">
        <el-icon><Refresh /></el-icon>
        重新生成
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Cpu, Clock, MapPin, Money, CaretTop, Warning, InfoFilled,
  Check, Cloudy, DocumentCopy, Folder, Share, Refresh, Suitcase
} from '@element-plus/icons-vue'

const props = defineProps({
  tripData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save', 'share', 'regenerate'])

// 计算属性：结构化数据
const structuredData = computed(() => {
  return props.tripData?.structuredData || null
})

// 获取活动类型样式类
const getActivityTypeClass = (type) => {
  const typeClasses = {
    '文化': 'activity-culture',
    '美食': 'activity-food',
    '购物': 'activity-shopping',
    '娱乐': 'activity-entertainment',
    '休闲': 'activity-leisure',
    '交通': 'activity-transport'
  }
  return typeClasses[type] || 'activity-default'
}

// 获取活动类型文本
const getActivityTypeText = (type) => {
  const typeTexts = {
    '文化': '文化',
    '美食': '美食',
    '购物': '购物',
    '娱乐': '娱乐',
    '休闲': '休闲',
    '交通': '交通'
  }
  return typeTexts[type] || '其他'
}

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    const content = props.tripData?.content || JSON.stringify(structuredData.value, null, 2)
    await navigator.clipboard.writeText(content)
    ElMessage.success('行程内容已复制到剪贴板！')
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage.error('复制失败，请手动选择复制')
  }
}

// 保存行程
const saveTrip = () => {
  ElMessage.success('保存功能开发中...')
  emit('save', props.tripData)
}

// 分享行程
const shareTrip = () => {
  ElMessage.success('分享功能开发中...')
  emit('share', props.tripData)
}

// 重新生成行程
const regenerateTrip = () => {
  ElMessageBox.confirm('重新生成将覆盖当前行程，确定要继续吗？', '确认重新生成', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      emit('regenerate')
    })
    .catch(() => {
      // 用户取消
    })
}
</script>

<style scoped>
.ai-trip-display {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* 顶部信息卡片 */
.trip-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  color: white;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
}

.trip-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
}

.header-content {
  position: relative;
  z-index: 2;
}

.trip-title-section {
  text-align: center;
  margin-bottom: 24px;
}

.trip-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 36px;
  color: #fff;
}

.trip-description {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  line-height: 1.6;
}

.quick-stats {
  display: flex;
  justify-content: center;
  gap: 48px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  display: block;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
  margin-top: 4px;
}

/* 每日行程 */
.daily-itineraries {
  margin-bottom: 32px;
}

.day-section {
  margin-bottom: 40px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.day-header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 24px;
  color: white;
  display: flex;
  align-items: center;
  gap: 20px;
}

.day-badge {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.day-number {
  font-size: 20px;
  font-weight: 700;
}

.day-title-content {
  flex: 1;
}

.day-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.day-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  opacity: 0.9;
}

/* 活动列表 */
.activities-list {
  padding: 24px;
}

.activity-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border-left: 4px solid #409eff;
  transition: all 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.activity-card:last-child {
  margin-bottom: 0;
}

/* 活动类型样式 */
.activity-culture { border-left-color: #8e44ad; }
.activity-food { border-left-color: #e67e22; }
.activity-shopping { border-left-color: #f39c12; }
.activity-entertainment { border-left-color: #e74c3c; }
.activity-leisure { border-left-color: #27ae60; }
.activity-transport { border-left-color: #34495e; }

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.activity-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

.activity-type-badge {
  background: #409eff;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.activity-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.activity-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.activity-location,
.activity-cost,
.activity-transport {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
}

.activity-description {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
  margin: 0 0 16px 0;
}

.activity-notes {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 12px;
}

.notes-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #856404;
  margin-bottom: 8px;
}

.notes-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notes-list li {
  font-size: 13px;
  color: #856404;
  margin-bottom: 4px;
  padding-left: 16px;
  position: relative;
}

.notes-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #856404;
}

/* 当日提示 */
.day-tips {
  background: #e3f2fd;
  margin: 0 24px 24px 24px;
  padding: 16px;
  border-radius: 8px;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 8px;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-list li {
  font-size: 13px;
  color: #1976d2;
  margin-bottom: 4px;
  padding-left: 16px;
  position: relative;
}

.tips-list li::before {
  content: '💡';
  position: absolute;
  left: 0;
}

/* 附加信息区域 */
.additional-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.info-card {
  border: none;
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

/* 预算卡片 */
.budget-total {
  padding: 16px;
  background: #f0f7ff;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
}

.total-label {
  font-size: 14px;
  color: #666;
  margin-right: 8px;
}

.total-amount {
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
}

.budget-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.budget-item:last-child {
  border-bottom: none;
}

.budget-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.category-name {
  font-weight: 600;
  color: #303133;
}

.category-amount {
  font-weight: 600;
  color: #409eff;
}

.category-percentage {
  font-size: 12px;
  color: #909399;
}

.category-description {
  font-size: 13px;
  color: #666;
  margin: 0;
}

/* 必备物品网格 */
.packing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.packing-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f0f7ff;
  border-radius: 6px;
  font-size: 14px;
}

/* 备选方案列表 */
.backup-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.backup-list li {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  padding-left: 24px;
}

.backup-list li:last-child {
  border-bottom: none;
}

.backup-list li::before {
  content: '🌧️';
  position: absolute;
  left: 0;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
}

.action-buttons .el-button {
  padding: 12px 24px;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-trip-display {
    padding: 16px;
  }
  
  .trip-header {
    padding: 24px 20px;
  }
  
  .trip-title {
    font-size: 24px;
  }
  
  .quick-stats {
    gap: 24px;
  }
  
  .day-header {
    padding: 20px;
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .day-badge {
    margin: 0 auto;
  }
  
  .activities-list {
    padding: 16px;
  }
  
  .activity-details {
    flex-direction: column;
    gap: 8px;
  }
  
  .additional-info {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>