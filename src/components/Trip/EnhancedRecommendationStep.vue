<!--
🚀 增强版推荐选择步骤
集成AI预加载和智能筛选功能
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
            基于您的偏好，AI为您精选了最适合的景点和餐厅
            <span v-if="recommendationStats.ai > 0" class="ai-count">
              ({{ recommendationStats.ai }}个AI推荐)
            </span>
          </p>
        </div>
      </div>
      
      <!-- AI推荐状态 -->
      <div class="ai-status">
        <div v-if="isPreloading" class="status-item preloading">
          <el-icon class="loading"><Loading /></el-icon>
          <span>AI正在分析您的偏好...</span>
        </div>
        
        <div v-else-if="hasAiRecommendations()" class="status-item success">
          <el-icon><CircleCheckFilled /></el-icon>
          <span>AI推荐已就绪</span>
          <el-button size="small" text type="primary" @click="showReasoningDialog = true">
            查看推荐理由
          </el-button>
        </div>
        
        <div v-else-if="recommendations.isFallback" class="status-item warning">
          <el-icon><WarningFilled /></el-icon>
          <span>{{ recommendations.reasoning }}</span>
        </div>
        
        <div v-else-if="recommendations.isError" class="status-item error">
          <el-icon><CircleCloseFilled /></el-icon>
          <span>{{ recommendations.reasoning }}</span>
          <el-button size="small" type="primary" @click="handleRetryRecommendations">
            重试
          </el-button>
        </div>
      </div>
    </div>

    <!-- 智能筛选 -->
    <SmartFilters
      v-model="filters"
      :recommendations="recommendations"
      :filtered-items-count="filteredItemsCount"
      @filter-change="handleFilterChange"
    />

    <!-- 推荐统计 -->
    <div class="recommendation-stats">
      <div class="stats-content">
        <div class="stat-item">
          <span class="stat-number">{{ recommendationStats.attractions }}</span>
          <span class="stat-label">景点推荐</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ recommendationStats.restaurants }}</span>
          <span class="stat-label">餐厅推荐</span>
        </div>
        <div class="stat-item ai-stat">
          <span class="stat-number">{{ recommendationStats.ai }}</span>
          <span class="stat-label">AI精选</span>
        </div>
      </div>
      
      <div class="stats-actions">
        <!-- 视图切换 -->
        <el-radio-group v-model="viewMode" size="small" class="view-toggle">
          <el-radio-button value="grid">
            <el-icon><Grid /></el-icon>
            网格视图
          </el-radio-button>
          <el-radio-button value="map">
            <el-icon><MapLocation /></el-icon>
            地图视图
          </el-radio-button>
        </el-radio-group>
        
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
      <!-- 地图视图 -->
      <div v-if="viewMode === 'map'" class="map-view-container">
        <RecommendationMapView
          :attractions="filteredRecommendations.attractions || []"
          :restaurants="filteredRecommendations.restaurants || []"
          :selected-attractions="selectedAttractions"
          :selected-restaurants="selectedRestaurants"
          :city-center="mapCenter"
          :loading="isLoading"
          @select-attraction="handleSelectAttraction"
          @unselect-attraction="handleUnselectAttraction"
          @select-restaurant="handleSelectRestaurant"
          @unselect-restaurant="handleUnselectRestaurant"
          @show-details="handleShowDetails"
        />
      </div>
      
      <!-- 网格视图 -->
      <div v-else class="grid-view-container">
        <!-- 景点推荐 -->
        <div class="recommendation-section">
        <div class="section-header">
          <h3 class="section-title">
            <el-icon><MapLocation /></el-icon>
            景点推荐
            <el-tag v-if="filteredRecommendations.attractions?.length" size="small" type="info">
              {{ filteredRecommendations.attractions.length }}个
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
        
        <div v-else-if="filteredRecommendations.attractions?.length" class="recommendations-grid">
          <AiRecommendationCard
            v-for="attraction in filteredRecommendations.attractions"
            :key="attraction.id || attraction.name"
            :item="attraction"
            type="attraction"
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
            <el-tag v-if="filteredRecommendations.restaurants?.length" size="small" type="info">
              {{ filteredRecommendations.restaurants.length }}个
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
        
        <div v-else-if="filteredRecommendations.restaurants?.length" class="recommendations-grid">
          <AiRecommendationCard
            v-for="restaurant in filteredRecommendations.restaurants"
            :key="restaurant.id || restaurant.name"
            :item="restaurant"
            type="restaurant"
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
      </div> <!-- 关闭 grid-view-container -->
    </div>

    <!-- 选择摘要 -->
    <div class="selection-summary">
      <div class="summary-content">
        <div class="summary-stats">
          <span class="selected-count">已选择 {{ totalSelected }} 项</span>
          <div class="selected-breakdown">
            <span v-if="selectedAttractions.length">{{ selectedAttractions.length }}个景点</span>
            <span v-if="selectedRestaurants.length">{{ selectedRestaurants.length }}个餐厅</span>
          </div>
        </div>
        
        <div class="summary-actions">
          <el-button @click="handlePrevStep">
            <el-icon><ArrowLeft /></el-icon>
            上一步
          </el-button>
          
          <el-button
            type="primary"
            :disabled="totalSelected === 0"
            @click="handleNextStep"
          >
            下一步
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- AI推荐理由弹窗 -->
    <el-dialog
      v-model="showReasoningDialog"
      title="AI推荐分析报告"
      width="700px"
      :append-to-body="true"
      class="ai-reasoning-dialog"
    >
      <div class="reasoning-content">
        <!-- 总体推荐摘要 -->
        <div class="reasoning-overview">
          <div class="overview-header">
            <el-icon class="reasoning-icon"></el-icon>
            <h3>智能推荐摘要</h3>
          </div>
          <div class="overview-stats">
            <div class="stat-card">
              <div class="stat-number">{{ recommendationStats.ai }}</div>
              <div class="stat-label">AI精选推荐</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ Math.round(getAverageConfidence() * 100) }}%</div>
              <div class="stat-label">平均匹配度</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ getMatchedPreferencesCount() }}</div>
              <div class="stat-label">匹配偏好</div>
            </div>
          </div>
        </div>

        <!-- 推荐理由详情 -->
        <div class="reasoning-details">
          <h4>推荐依据</h4>
          <div class="reasoning-text">{{ getRecommendationReasoning() }}</div>
          
          <!-- 分析维度 -->
          <div class="analysis-dimensions">
            <div class="dimension-item">
              <div class="dimension-header">
                <el-icon><User /></el-icon>
                <span>个人偏好匹配</span>
                <el-progress 
                  :percentage="85" 
                  :stroke-width="6" 
                  color="#67c23a"
                  :show-text="false"
                />
              </div>
              <ul class="dimension-details">
                <li v-if="preferenceForm.travelPurpose">旅行目的: {{ getTravelPurposeText(preferenceForm.travelPurpose) }}</li>
                <li v-if="preferenceForm.interests?.length">兴趣爱好: {{ preferenceForm.interests.slice(0, 3).join(', ') }}</li>
                <li v-if="preferenceForm.budgetPreference">预算偏好: {{ getBudgetText(preferenceForm.budgetPreference) }}</li>
              </ul>
            </div>

            <div class="dimension-item">
              <div class="dimension-header">
                <el-icon><Calendar /></el-icon>
                <span>行程安排匹配</span>
                <el-progress 
                  :percentage="92" 
                  :stroke-width="6" 
                  color="#409eff"
                  :show-text="false"
                />
              </div>
              <ul class="dimension-details">
                <li>行程天数: {{ baseForm.days }}天</li>
                <li>出行时间: {{ formatDateRange(baseForm.dateRange) }}</li>
                <li>人数规模: {{ baseForm.travelers }}人</li>
              </ul>
            </div>

            <div class="dimension-item">
              <div class="dimension-header">
                <el-icon><MapLocation /></el-icon>
                <span>地理位置优化</span>
                <el-progress 
                  :percentage="78" 
                  :stroke-width="6" 
                  color="#e6a23c"
                  :show-text="false"
                />
              </div>
              <ul class="dimension-details">
                <li>景点分布均衡，减少往返时间</li>
                <li>考虑交通便利性</li>
                <li>优化游览路线</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 推荐亮点 -->
        <div v-if="getRecommendationHighlights().length > 0" class="recommendation-highlights">
          <h4>推荐亮点</h4>
          <div class="highlights-grid">
            <div 
              v-for="(highlight, index) in getRecommendationHighlights()" 
              :key="index"
              class="highlight-item"
            >
              <el-icon class="highlight-icon"><StarFilled /></el-icon>
              <span>{{ highlight }}</span>
            </div>
          </div>
        </div>

        <!-- 个性化建议 -->
        <div class="personalized-suggestions">
          <h4>个性化建议</h4>
          <div class="suggestions-list">
            <div class="suggestion-item">
              <el-icon class="suggestion-icon"></el-icon>
              <div class="suggestion-content">
                <h5>最佳游览时间</h5>
                <p>建议{{ getRecommendedTimeSlot() }}游览，避开人流高峰</p>
              </div>
            </div>
            <div class="suggestion-item">
              <el-icon class="suggestion-icon"><Wallet /></el-icon>
              <div class="suggestion-content">
                <h5>预算优化</h5>
                <p>根据您的{{ getBudgetText(baseForm.budget) }}预算，推荐的项目性价比较高</p>
              </div>
            </div>
            <div class="suggestion-item">
              <el-icon class="suggestion-icon"><Clock /></el-icon>
              <div class="suggestion-content">
                <h5>时间安排</h5>
                <p>建议每个景点预留{{ getRecommendedDuration() }}，包含拍照和休息时间</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

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
  ArrowLeft,
  ArrowRight,
  Grid,
  User,
  Calendar,
  StarFilled,
  Wallet,
  Clock
} from '@element-plus/icons-vue'

// 组件导入
import SmartFilters from './SmartFilters.vue'
import AiRecommendationCard from './AiRecommendationCard.vue'
import RecommendationMapView from './RecommendationMapView.vue'

// 组合函数导入
import { useAiRecommendations } from '@/composables/useAiRecommendations'

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
  }
})

// Emits
const emit = defineEmits([
  'prev-step',
  'next-step',
  'selections-updated',
  'save-draft'
])

// 使用AI推荐组合函数
const {
  recommendations,
  filteredRecommendations,
  isLoading,
  isPreloading,
  error,
  filters,
  hasRecommendations,
  aiRecommendationsCount,
  recommendationStats,
  preloadRecommendations,
  fetchRecommendations,
  refreshRecommendations,
  updateFilters,
  clearFilters,
  getRecommendationReasoning,
  hasAiRecommendations
} = useAiRecommendations()

// 本地状态
const selectedAttractions = ref([])
const selectedRestaurants = ref([])
const showReasoningDialog = ref(false)
const showDetailsDialog = ref(false)
const selectedItemDetails = ref(null)
const viewMode = ref('grid') // 'grid' | 'map'

// 地图中心点（基于目的地）
const mapCenter = computed(() => {
  if (props.cityInfo?.destination) {
    // 假设 destination 包含坐标信息
    return {
      lat: props.cityInfo.destination.lat || 39.9042, // 默认北京
      lng: props.cityInfo.destination.lng || 116.4074
    }
  }
  return { lat: 39.9042, lng: 116.4074 }
})

// 计算属性
const totalSelected = computed(() => 
  selectedAttractions.value.length + selectedRestaurants.value.length
)

const filteredItemsCount = computed(() => {
  const attractionsCount = filteredRecommendations.value.attractions?.length || 0
  const restaurantsCount = filteredRecommendations.value.restaurants?.length || 0
  return attractionsCount + restaurantsCount
})

// 方法
const handleFilterChange = (newFilters) => {
  updateFilters(newFilters)
}

const handleRefreshRecommendations = async () => {
  try {
    await refreshRecommendations(props.baseForm, props.preferenceForm)
    ElMessage.success('推荐已刷新')
  } catch (err) {
    ElMessage.error('刷新推荐失败')
  }
}

const handleRetryRecommendations = async () => {
  try {
    await fetchRecommendations(props.baseForm, props.preferenceForm, true)
  } catch (err) {
    ElMessage.error('重试失败')
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

// 新增的推荐分析方法
const getAverageConfidence = () => {
  const allRecommendations = [
    ...(filteredRecommendations.value.attractions || []),
    ...(filteredRecommendations.value.restaurants || [])
  ]
  
  if (allRecommendations.length === 0) return 0.8
  
  const aiRecommendations = allRecommendations.filter(item => item.isAiRecommended)
  if (aiRecommendations.length === 0) return 0.8
  
  const totalConfidence = aiRecommendations.reduce((sum, item) => sum + (item.confidence || 0.8), 0)
  return totalConfidence / aiRecommendations.length
}

const getMatchedPreferencesCount = () => {
  // 模拟匹配的偏好数量
  let count = 0
  if (props.preferenceForm?.travelPurpose) count++
  if (props.preferenceForm?.interests?.length > 0) count++
  if (props.preferenceForm?.budgetPreference) count++
  if (props.preferenceForm?.accommodationLevel) count++
  if (props.preferenceForm?.transportationMode) count++
  return count
}

const getTravelPurposeText = (purpose) => {
  const purposeMap = {
    leisure: '休闲度假',
    business: '商务出行',
    adventure: '冒险探索',
    culture: '文化体验',
    family: '家庭出游',
    romantic: '浪漫之旅'
  }
  return purposeMap[purpose] || purpose
}

const getBudgetText = (budget) => {
  const budgetMap = {
    budget: '经济型',
    moderate: '中等',
    luxury: '豪华型',
    unlimited: '不限预算'
  }
  return budgetMap[budget] || budget
}

const formatDateRange = (dateRange) => {
  if (!dateRange || !Array.isArray(dateRange) || dateRange.length < 2) {
    return '未指定'
  }
  
  const startDate = new Date(dateRange[0])
  const endDate = new Date(dateRange[1])
  
  const formatDate = (date) => {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
  
  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}

const getRecommendationHighlights = () => {
  const highlights = []
  
  if (recommendationStats.value.ai > 5) {
    highlights.push('丰富的AI精选推荐')
  }
  
  if (props.preferenceForm?.interests?.includes('photography')) {
    highlights.push('适合摄影的绝佳景点')
  }
  
  if (props.baseForm?.budget === 'budget') {
    highlights.push('高性价比选择')
  }
  
  if (props.baseForm?.travelers > 1) {
    highlights.push('适合多人出行')
  }
  
  highlights.push('交通便利，节省时间')
  highlights.push('本地特色体验')
  
  return highlights.slice(0, 4) // 最多显示4个亮点
}

const getRecommendedTimeSlot = () => {
  const currentMonth = new Date().getMonth() + 1
  
  if (currentMonth >= 6 && currentMonth <= 8) {
    return '上午9-11点或下午4-6点'
  } else if (currentMonth >= 12 || currentMonth <= 2) {
    return '上午10点-下午4点'
  } else {
    return '上午9点-下午5点'
  }
}

const getRecommendedDuration = () => {
  const avgAttractions = filteredRecommendations.value.attractions?.length || 0
  const avgRestaurants = filteredRecommendations.value.restaurants?.length || 0
  
  if (avgAttractions > 3) {
    return '2-3小时'
  } else if (avgRestaurants > 2) {
    return '1.5-2小时'
  } else {
    return '1-2小时'
  }
}

// 生命周期
onMounted(async () => {
  // 尝试获取推荐（可能已经预加载了）
  try {
    await fetchRecommendations(props.baseForm, props.preferenceForm)
  } catch (err) {
    console.error('初始加载推荐失败:', err)
  }
})

// 监听属性变化
watch(
  [() => props.baseForm, () => props.preferenceForm],
  async ([newBaseForm, newPreferenceForm]) => {
    if (newBaseForm?.destinationName) {
      try {
        await fetchRecommendations(newBaseForm, newPreferenceForm)
      } catch (err) {
        console.error('重新加载推荐失败:', err)
      }
    }
  },
  { deep: true }
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
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

.ai-count {
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
  gap: 12px;
}

.view-toggle {
  margin-right: 8px;
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

.ai-stat .stat-number {
  color: #667eea;
}

/* 推荐内容 */
.recommendation-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 地图视图 */
.map-view-container {
  background: white;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  overflow: hidden;
  min-height: 600px;
}

/* 网格视图 */
.grid-view-container {
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

/* 推荐网格 */
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
  border-radius: 12px;
  padding: 20px 24px;
  margin-top: 24px;
  position: sticky;
  bottom: 20px;
  z-index: 10;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.summary-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.summary-actions {
  display: flex;
  gap: 12px;
}

/* 弹窗内容 */
.reasoning-content {
  padding: 0;
}

/* 推荐摘要 */
.reasoning-overview {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  margin: -20px -20px 24px -20px;
  border-radius: 8px 8px 0 0;
}

.overview-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.reasoning-icon {
  font-size: 24px;
}

.overview-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  opacity: 0.9;
}

/* 推荐详情 */
.reasoning-details {
  margin-bottom: 24px;
}

.reasoning-details h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.reasoning-text {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

/* 分析维度 */
.analysis-dimensions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dimension-item {
  background: white;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
}

.dimension-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.dimension-header span {
  font-weight: 600;
  color: #303133;
  flex: 1;
}

.dimension-details {
  margin: 0;
  padding-left: 24px;
  color: #606266;
  font-size: 14px;
}

.dimension-details li {
  margin-bottom: 6px;
  line-height: 1.5;
}

/* 推荐亮点 */
.recommendation-highlights {
  margin-bottom: 24px;
}

.recommendation-highlights h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 8px;
  color: #d48806;
  font-size: 14px;
}

.highlight-icon {
  font-size: 16px;
  color: #faad14;
}

/* 个性化建议 */
.personalized-suggestions h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f0f9ff;
  border: 1px solid #bae7ff;
  border-radius: 8px;
}

.suggestion-icon {
  font-size: 18px;
  color: #1890ff;
  margin-top: 2px;
  flex-shrink: 0;
}

.suggestion-content h5 {
  margin: 0 0 6px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.suggestion-content p {
  margin: 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.5;
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
    justify-content: space-around;
    gap: 16px;
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

  .summary-actions {
    justify-content: center;
  }
}
</style>
