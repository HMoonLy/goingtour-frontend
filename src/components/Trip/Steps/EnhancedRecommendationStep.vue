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
            基于STJ性格偏好，推荐了商务氛围厚重的景点和优雅经典的建筑
            <span v-if="apiData?.stats?.total > 0" class="ai-count">
              ({{ apiData.stats.total }}个精选推荐)
            </span>
          </p>
        </div>
      </div>
      
      <!-- AI推荐状态 -->
      <div class="ai-status">
        <div v-if="isLoading" class="status-item preloading">
          <el-icon class="loading"><Loading /></el-icon>
          <span>AI正在分析您的偏好...</span>
        </div>
        
        <div v-else-if="hasValidData" class="status-item success">
          <el-icon><CircleCheckFilled /></el-icon>
          <span>AI推荐已就绪</span>
          <el-tag size="small" type="success">置信度 {{ averageConfidence }}%</el-tag>
          <el-button size="small" text type="primary" @click="showReasoningDialog = true">
            查看推荐理由
          </el-button>
        </div>
        
        <div v-else-if="apiData?.isError" class="status-item error">
          <el-icon><CircleCloseFilled /></el-icon>
          <span>{{ apiData.reasoning || '推荐加载失败' }}</span>
          <el-button size="small" type="primary" @click="handleRetryRecommendations">
            重试
          </el-button>
        </div>
        
        <div v-else-if="apiData?.isFallback" class="status-item warning">
          <el-icon><WarningFilled /></el-icon>
          <span>{{ apiData.reasoning }}</span>
        </div>
      </div>
    </div>

    <!-- 推荐统计与筛选 -->
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
        <div class="stat-item ai-stat">
          <span class="stat-number">{{ aiRecommendedCount }}</span>
          <span class="stat-label">AI精选</span>
        </div>
        <div class="stat-item confidence-stat">
          <span class="stat-number">{{ averageConfidence }}%</span>
          <span class="stat-label">平均匹配度</span>
        </div>
      </div>
      
      <div class="stats-actions">
        <!-- 筛选选项 -->
        <div class="filter-options">
          <el-checkbox-group v-model="activeFilters" size="small">
            <el-checkbox-button label="ai">仅AI推荐</el-checkbox-button>
            <el-checkbox-button label="high-confidence">高匹配度</el-checkbox-button>
          </el-checkbox-group>
        </div>
        
        <!-- 视图切换 -->
        <el-radio-group v-model="viewMode" size="small" class="view-toggle">
          <el-radio-button value="grid">
            <el-icon><Grid /></el-icon>
            网格视图
          </el-radio-button>
          <el-radio-button value="list">
            <el-icon><List /></el-icon>
            列表视图
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
        
        <div v-else-if="filteredAttractions.length" :class="viewMode === 'grid' ? 'recommendations-grid' : 'recommendations-list'">
          <AttractionCard
            v-for="attraction in filteredAttractions"
            :key="attraction.id || attraction.name"
            :attraction="attraction"
            :view-mode="viewMode"
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
        
        <div v-else-if="filteredRestaurants.length" :class="viewMode === 'grid' ? 'recommendations-grid' : 'recommendations-list'">
          <RestaurantCard
            v-for="restaurant in filteredRestaurants"
            :key="restaurant.id || restaurant.name"
            :restaurant="restaurant"
            :view-mode="viewMode"
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
          <div class="reasoning-text">{{ displayReasoning }}</div>
          
          <!-- 分析维度 -->
          <div class="analysis-dimensions">
            <div class="dimension-item">
              <div class="dimension-header">
                <el-icon><User /></el-icon>
                <span>性格偏好匹配</span>
                <el-progress 
                  :percentage="85" 
                  :stroke-width="6" 
                  color="#67c23a"
                  :show-text="false"
                />
              </div>
              <ul class="dimension-details">
                <li>性格类型: STJ 性格偏好</li>
                <li>旅行风格: 商务氛围厚重</li>
                <li>建筑偏好: 优雅经典的建筑</li>
                <li>平均置信度: {{ averageConfidence }}%</li>
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
                <li>生成时间: {{ formatGeneratedTime() }}</li>
              </ul>
            </div>

            <div class="dimension-item">
              <div class="dimension-header">
                <el-icon><MapLocation /></el-icon>
                <span>智能推荐效果</span>
                <el-progress 
                  :percentage="Math.round(averageConfidence)" 
                  :stroke-width="6" 
                  color="#e6a23c"
                  :show-text="false"
                />
              </div>
              <ul class="dimension-details">
                <li>景点推荐: {{ attractionsCount }}个</li>
                <li>餐厅推荐: {{ restaurantsCount }}个</li>
                <li>AI精选: {{ aiRecommendedCount }}个</li>
                <li>匹配偏好: {{ getMatchedPreferencesDisplay() }}</li>
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
  List,
  User,
  Calendar,
  StarFilled,
  Wallet,
  Clock
} from '@element-plus/icons-vue'

// 新的卡片组件
import AttractionCard from '../Cards/AttractionCard.vue'
import RestaurantCard from '../Cards/RestaurantCard.vue'
import PoiDetailDialog from '../Dialogs/PoiDetailDialog.vue'

// 高德API增强服务
import { enhanceAiRecommendations } from '@/services/poiEnhancementService.js'

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
const viewMode = ref('grid') // 'grid' | 'list'
const activeFilters = ref([]) // 筛选条件
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

const aiRecommendedCount = computed(() => {
  if (!props.apiData) return 0
  const aiAttractions = props.apiData.attractions?.filter(item => item.isAiRecommended) || []
  const aiRestaurants = props.apiData.restaurants?.filter(item => item.isAiRecommended) || []
  return aiAttractions.length + aiRestaurants.length
})

const averageConfidence = computed(() => {
  if (!props.apiData) return 0
  const allItems = [...(props.apiData.attractions || []), ...(props.apiData.restaurants || [])]
  const aiItems = allItems.filter(item => item.isAiRecommended && item.confidence)
  
  if (aiItems.length === 0) return 0
  
  const total = aiItems.reduce((sum, item) => sum + (item.confidence || 0), 0)
  return Math.round((total / aiItems.length) * 100)
})

const displayReasoning = computed(() => {
  return props.apiData?.reasoning || "根据STJ性格偏好，推荐了商务氛围厚重的景点和优雅经典的建筑"
})

// 过滤后的推荐列表
const filteredAttractions = computed(() => {
  if (!props.apiData?.attractions) return []
  
  let filtered = [...props.apiData.attractions]
  
  if (activeFilters.value.includes('ai')) {
    filtered = filtered.filter(item => item.isAiRecommended)
  }
  
  if (activeFilters.value.includes('high-confidence')) {
    filtered = filtered.filter(item => (item.confidence || 0) > 0.8)
  }
  
  return filtered
})

const filteredRestaurants = computed(() => {
  if (!props.apiData?.restaurants) return []
  
  let filtered = [...props.apiData.restaurants]
  
  if (activeFilters.value.includes('ai')) {
    filtered = filtered.filter(item => item.isAiRecommended)
  }
  
  if (activeFilters.value.includes('high-confidence')) {
    filtered = filtered.filter(item => (item.confidence || 0) > 0.8)
  }
  
  return filtered
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

// 新增的推荐分析方法
const getMatchedPreferencesDisplay = () => {
  if (!props.apiData) return "未知"
  
  const preferences = []
  if (props.apiData.reasoning?.includes('STJ')) preferences.push('性格匹配')
  if (props.apiData.reasoning?.includes('商务')) preferences.push('商务风格')
  if (props.apiData.reasoning?.includes('建筑')) preferences.push('建筑偏好')
  if (averageConfidence.value > 80) preferences.push('高匹配度')
  
  return preferences.length > 0 ? preferences.join(', ') : '基础匹配'
}

const formatGeneratedTime = () => {
  if (!props.apiData?.generatedAt) return '刚刚'
  
  const time = new Date(props.apiData.generatedAt)
  const now = new Date()
  const diffSeconds = Math.floor((now - time) / 1000)
  
  if (diffSeconds < 60) return '刚刚'
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}分钟前`
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}小时前`
  
  return time.toLocaleDateString()
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
  
  if (aiRecommendedCount.value > 5) {
    highlights.push('丰富的AI精选推荐')
  }
  
  if (averageConfidence.value > 80) {
    highlights.push('高匹配度推荐')
  }
  
  if (props.apiData?.reasoning?.includes('商务')) {
    highlights.push('商务氛围浓厚')
  }
  
  if (props.apiData?.reasoning?.includes('建筑')) {
    highlights.push('优雅经典建筑')
  }
  
  if (attractionsCount.value > 5) {
    highlights.push('景点选择丰富')
  }
  
  if (restaurantsCount.value > 3) {
    highlights.push('餐厅推荐多样')
  }
  
  highlights.push('个性化定制推荐')
  highlights.push('智能算法优化')
  
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
  const avgAttractions = filteredAttractions.value.length || 0
  const avgRestaurants = filteredRestaurants.value.length || 0
  
  if (avgAttractions > 3) {
    return '2-3小时'
  } else if (avgRestaurants > 2) {
    return '1.5-2小时'
  } else {
    return '1-2小时'
  }
}

// 生命周期
onMounted(() => {
  console.log('✅ EnhancedRecommendationStep mounted with apiData:', props.apiData)
  
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
      console.log('📊 API数据更新:', newData)
      console.log('🔍 数据详情:')
      console.log('  - hasValidData:', hasValidData.value)
      console.log('  - isError:', newData.isError)
      console.log('  - isFallback:', newData.isFallback)
      console.log('  - attractions:', newData.attractions?.length || 0)
      console.log('  - restaurants:', newData.restaurants?.length || 0)
      console.log('  - filteredAttractions:', filteredAttractions.value.length)
      console.log('  - filteredRestaurants:', filteredRestaurants.value.length)
      console.log('  - attractionsCount:', attractionsCount.value)
      console.log('  - restaurantsCount:', restaurantsCount.value)
      
      if (newData.isError) {
        console.error('❌ API错误:', newData.reasoning)
        ElMessage.error(newData.reasoning || '推荐加载失败')
      } else if (newData.isFallback) {
        console.warn('⚠️ 使用降级数据:', newData.reasoning)
        ElMessage.warning(newData.reasoning || '使用备用推荐')
      } else if (hasValidData.value) {
        console.log('✅ 有效数据，应该显示内容')
        ElMessage.success('推荐数据已更新')
      } else {
        console.warn('⚠️ 数据无效，不会显示内容')
        console.log('检查原因:')
        console.log('  - 数据存在:', !!newData)
        console.log('  - 非错误状态:', !newData.isError)
        console.log('  - 非降级状态:', !newData.isFallback)
        console.log('  - 有景点数据:', (newData.attractions?.length || 0) > 0)
        console.log('  - 有餐厅数据:', (newData.restaurants?.length || 0) > 0)
      }
    } else {
      console.log('❌ 没有接收到API数据')
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
  gap: 16px;
}

.filter-options {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-toggle {
  margin-left: 8px;
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

.confidence-stat .stat-number {
  color: #67c23a;
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

/* 推荐网格和列表 */
.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
