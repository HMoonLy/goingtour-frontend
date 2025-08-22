<!--
🚀 增强版推荐选择步骤
基于真实API数据的智能推荐界面
-->

<template>
  <div class="enhanced-recommendation-step">
    <!-- 页面头部 -->
    <div class="step-header">
      <div class="header-content">
        <div class="header-icon">
          <el-icon><MagicStick /></el-icon>
        </div>
        <div class="header-text">
          <h2 class="step-title">🎯 {{ cityInfo?.destinationName || '目的地' }}智能推荐</h2>
          <p class="step-subtitle">
            基于您的偏好，为您精选了合适的景点和餐厅
            <span v-if="apiData?.stats?.total > 0" class="item-count">
              ({{ apiData.stats.total }}个精选推荐)
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- 推荐统计 -->
    <div class="recommendation-stats">
      <div class="stats-content">
        <div class="stat-item">
          <span class="stat-number">{{ attractionsCount }}</span>
          <span class="stat-label">景点推荐</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ restaurantsCount }}</span>
          <span class="stat-label">餐厅推荐</span>
        </div>
      </div>
      
      <div class="stats-actions">
        <el-button
          size="small"
          type="primary"
          text
          :loading="isLoading"
          @click="handleRefreshRecommendations"
        >
          <el-icon><Refresh /></el-icon>
          刷新推荐
        </el-button>
      </div>
    </div>

    <!-- 推荐内容 -->
    <div class="recommendation-content">
      <!-- 景点推荐 -->
      <div class="recommendation-section">
        <div class="section-header">
          <h3 class="section-title">
            <el-icon><MapLocation /></el-icon>
            景点推荐
            <el-tag v-if="filteredAttractions.length" size="small" type="info">
              {{ filteredAttractions.length }}个
            </el-tag>
          </h3>
        </div>
        
        <div v-if="isLoading" class="loading-grid">
          <el-skeleton
            v-for="i in 6"
            :key="`attraction-skeleton-${i}`"
            animated
          >
            <template #template>
              <div class="skeleton-card">
                <el-skeleton-item variant="image" style="height: 160px;" />
                <div style="padding: 16px;">
                  <el-skeleton-item variant="h3" style="width: 60%;" />
                  <el-skeleton-item variant="text" style="width: 80%;" />
                  <el-skeleton-item variant="text" style="width: 40%;" />
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>
        
        <div v-else-if="filteredAttractions.length" class="recommendations-grid">
          <AttractionCard
            v-for="attraction in filteredAttractions"
            :key="attraction.id || attraction.name"
            :attraction="attraction"
            view-mode="grid"
            :is-selected="isAttractionSelected(attraction)"
            @select="handleSelectAttraction"
            @unselect="handleUnselectAttraction"
            @show-details="handleShowDetails"
          />
        </div>
        
        <div v-else class="empty-state">
          <el-empty description="暂无景点推荐" />
        </div>
      </div>

      <!-- 餐厅推荐 -->
      <div class="recommendation-section">
        <div class="section-header">
          <h3 class="section-title">
            <el-icon><Bowl /></el-icon>
            餐厅推荐
            <el-tag v-if="filteredRestaurants.length" size="small" type="info">
              {{ filteredRestaurants.length }}个
            </el-tag>
          </h3>
        </div>
        
        <div v-if="isLoading" class="loading-grid">
          <el-skeleton
            v-for="i in 4"
            :key="`restaurant-skeleton-${i}`"
            animated
          >
            <template #template>
              <div class="skeleton-card">
                <el-skeleton-item variant="image" style="height: 160px;" />
                <div style="padding: 16px;">
                  <el-skeleton-item variant="h3" style="width: 60%;" />
                  <el-skeleton-item variant="text" style="width: 80%;" />
                  <el-skeleton-item variant="text" style="width: 40%;" />
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>
        
        <div v-else-if="filteredRestaurants.length" class="recommendations-grid">
          <RestaurantCard
            v-for="restaurant in filteredRestaurants"
            :key="restaurant.id || restaurant.name"
            :restaurant="restaurant"
            view-mode="grid"
            :is-selected="isRestaurantSelected(restaurant)"
            @select="handleSelectRestaurant"
            @unselect="handleUnselectRestaurant"
            @show-details="handleShowDetails"
          />
        </div>
        
        <div v-else class="empty-state">
          <el-empty description="暂无餐厅推荐" />
        </div>
      </div>
    </div>

    <!-- 选择摘要 -->
    <div class="selection-summary">
      <div class="summary-content">
        <div class="summary-info">
          <div class="summary-title">选择确认</div>
          <div class="summary-stats">
            <span class="selected-count">已选择 {{ totalSelected }} 项</span>
            <div class="selected-breakdown">
              <span v-if="selectedAttractions.length">{{ selectedAttractions.length }}个景点</span>
              <span v-if="selectedRestaurants.length">{{ selectedRestaurants.length }}个餐厅</span>
            </div>
          </div>
        </div>
        
        <div class="step-actions">
          <el-button size="large" @click="handlePrevStep">
            上一步
          </el-button>
          
          <el-button
            size="large"
            type="primary"
            :disabled="totalSelected === 0"
            @click="handleNextStep"
          >
            下一步
          </el-button>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="showDetailsDialog"
      :title="selectedItemDetails?.name"
      width="700px"
      :append-to-body="true"
    >
      <div v-if="selectedItemDetails" class="details-content">
        <!-- 详情内容将在这里展示 -->
        <p>详情功能开发中...</p>
      </div>
    </el-dialog>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  MagicStick,
  Loading,
  CircleCheckFilled,
  WarningFilled,
  CircleCloseFilled,
  Refresh,
  MapLocation,
  Bowl,
  User,
  Calendar,
  StarFilled,
  Wallet,
  Clock
} from '@element-plus/icons-vue'

// 新的卡片组件
import AttractionCard from '../Cards/AttractionCard.vue'
import RestaurantCard from '../Cards/RestaurantCard.vue'

// Props
const props = defineProps({
  cityInfo: {
    type: Object,
    required: true
  },
  baseForm: {
    type: Object,
    required: true
  },
  preferenceForm: {
    type: Object,
    default: () => ({})
  },
  generating: {
    type: Boolean,
    default: false
  },
  // 新增：接收API数据
  apiData: {
    type: Object,
    default: () => null
  }
})

// Emits
const emit = defineEmits([
  'prev-step',
  'next-step',
  'selections-updated',
  'save-draft',
  'refresh-recommendations',
  'retry-recommendations'
])

// 本地状态
const selectedAttractions = ref([])
const selectedRestaurants = ref([])
const showReasoningDialog = ref(false)
const showDetailsDialog = ref(false)
const selectedItemDetails = ref(null)
const isLoading = ref(false)

// 计算属性 - 基于真实API数据
const hasValidData = computed(() => {
  return props.apiData && 
         !props.apiData.isError && 
         !props.apiData.isFallback &&
         (props.apiData.attractions?.length > 0 || props.apiData.restaurants?.length > 0)
})

const attractionsCount = computed(() => props.apiData?.attractions?.length || 0)
const restaurantsCount = computed(() => props.apiData?.restaurants?.length || 0)



const displayReasoning = computed(() => {
  return props.apiData?.reasoning || "根据STJ性格偏好，推荐了商务氛围厚重的景点和优雅经典的建筑"
})

// 推荐列表（无过滤）
const filteredAttractions = computed(() => {
  return props.apiData?.attractions || []
})

const filteredRestaurants = computed(() => {
  return props.apiData?.restaurants || []
})

const totalSelected = computed(() => 
  selectedAttractions.value.length + selectedRestaurants.value.length
)

// 方法
const handleRefreshRecommendations = async () => {
  isLoading.value = true
  try {
    // 这里应该调用父组件的刷新方法
    emit('refresh-recommendations')
    ElMessage.success('推荐已刷新')
  } catch (err) {
    ElMessage.error('刷新推荐失败')
  } finally {
    isLoading.value = false
  }
}

const handleRetryRecommendations = async () => {
  isLoading.value = true
  try {
    // 这里应该调用父组件的重试方法
    emit('retry-recommendations')
  } catch (err) {
    ElMessage.error('重试失败')
  } finally {
    isLoading.value = false
  }
}

const isAttractionSelected = (attraction) => {
  return selectedAttractions.value.some(item => 
    item.id === attraction.id || item.name === attraction.name
  )
}

const isRestaurantSelected = (restaurant) => {
  return selectedRestaurants.value.some(item => 
    item.id === restaurant.id || item.name === restaurant.name
  )
}

const handleSelectAttraction = (attraction) => {
  if (!isAttractionSelected(attraction)) {
    selectedAttractions.value.push(attraction)
    emitSelectionsUpdate()
  }
}

const handleUnselectAttraction = (attraction) => {
  const index = selectedAttractions.value.findIndex(item => 
    item.id === attraction.id || item.name === attraction.name
  )
  if (index > -1) {
    selectedAttractions.value.splice(index, 1)
    emitSelectionsUpdate()
  }
}

const handleSelectRestaurant = (restaurant) => {
  if (!isRestaurantSelected(restaurant)) {
    selectedRestaurants.value.push(restaurant)
    emitSelectionsUpdate()
  }
}

const handleUnselectRestaurant = (restaurant) => {
  const index = selectedRestaurants.value.findIndex(item => 
    item.id === restaurant.id || item.name === restaurant.name
  )
  if (index > -1) {
    selectedRestaurants.value.splice(index, 1)
    emitSelectionsUpdate()
  }
}

const handleShowDetails = (item) => {
  selectedItemDetails.value = item
  showDetailsDialog.value = true
}

const handlePrevStep = () => {
  emit('prev-step')
}

const handleNextStep = () => {
  if (totalSelected.value === 0) {
    ElMessage.warning('请至少选择一个景点或餐厅')
    return
  }
  emit('next-step')
}

const emitSelectionsUpdate = () => {
  emit('selections-updated', {
    attractions: selectedAttractions.value,
    restaurants: selectedRestaurants.value
  })
}



// 生命周期
onMounted(() => {
  // 如果有API数据，显示欢迎消息
  if (hasValidData.value) {
    ElMessage.success(`成功加载 ${attractionsCount.value} 个景点和 ${restaurantsCount.value} 个餐厅推荐`)
  }
})

// 监听apiData变化
watch(
  () => props.apiData,
  (newData) => {
    if (newData) {
      if (newData.isError) {
        ElMessage.error(newData.reasoning || '推荐加载失败')
      } else if (newData.isFallback) {
        ElMessage.warning(newData.reasoning || '使用备用推荐')
      } else if (hasValidData.value) {
        ElMessage.success('推荐数据已更新')
      }
    }
  },
  { immediate: true, deep: true }
)
</script>

<style scoped>
.enhanced-recommendation-step {
  padding: 0 16px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 页面头部 */
.step-header {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: white;
  padding: 32px 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(24, 144, 255, 0.3);
}

.header-content {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.header-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 28px;
}

.header-text {
  flex: 1;
}

.step-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
}

.step-subtitle {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.5;
}

.item-count {
  color: #ffd700;
  font-weight: 600;
}

/* AI状态 */
.ai-status {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
}

.status-item.preloading {
  background: rgba(255, 255, 255, 0.2);
}

.status-item.success {
  background: rgba(103, 194, 58, 0.2);
}

.status-item.warning {
  background: rgba(230, 162, 60, 0.2);
}

.status-item.error {
  background: rgba(245, 108, 108, 0.2);
}

.loading {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 推荐统计 */
.recommendation-stats {
  background: white;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}



.stats-content {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}



/* 推荐内容 */
.recommendation-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}



.recommendation-section {
  background: white;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  padding: 24px;
}

.section-header {
  margin-bottom: 20px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 推荐网格和列表 */
.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}



.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.skeleton-card {
  border: 1px solid #ebeef5;
  border-radius: 12px;
  overflow: hidden;
}

/* 空状态 */
.empty-state {
  padding: 40px 20px;
  text-align: center;
}

/* 选择摘要 */
.selection-summary {
  background: white;
  border: 1px solid #ebeef5;
  border-radius: 16px;
  padding: 24px 32px;
  margin-top: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.summary-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-info {
  flex: 1;
}

.summary-title {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 8px;
}

.summary-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.selected-count {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.selected-breakdown {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #909399;
}

.step-actions {
  display: flex;
  gap: 16px;
  flex-shrink: 0;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .enhanced-recommendation-step {
    padding: 0 8px;
  }

  .step-header {
    padding: 24px 16px;
    margin-bottom: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-icon {
    width: 56px;
    height: 56px;
    font-size: 24px;
    margin-right: 0;
  }

  .step-title {
    font-size: 24px;
  }

  .step-subtitle {
    font-size: 14px;
  }

  .recommendation-stats {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .stats-content {
    width: 100%;
    justify-content: flex-start;
    gap: 32px;
  }

  .recommendations-grid,
  .loading-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .recommendation-section {
    padding: 16px;
  }

  .selection-summary {
    padding: 16px;
  }

  .summary-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .step-actions {
    justify-content: center;
  }
}
</style>
