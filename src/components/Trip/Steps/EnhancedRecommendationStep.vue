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
        <div class="stat-item">
          <span class="stat-number">{{ hotelsCount }}</span>
          <span class="stat-label">酒店推荐</span>
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
            v-for="i in 8"
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
            v-for="i in 8"
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

      <!-- 酒店推荐 -->
      <div class="recommendation-section">
        <div class="section-header">
          <h3 class="section-title">
            <el-icon><User /></el-icon>
            酒店推荐
            <el-tag v-if="filteredHotels.length" size="small" type="info">
              {{ filteredHotels.length }}个
            </el-tag>
          </h3>
        </div>
        
        <div v-if="isLoading" class="loading-grid">
          <el-skeleton
            v-for="i in 6"
            :key="`hotel-skeleton-${i}`"
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
        
        <div v-else-if="filteredHotels.length" class="recommendations-grid">
          <HotelCard
            v-for="hotel in filteredHotels"
            :key="hotel.id || hotel.name"
            :hotel="hotel"
            view-mode="grid"
            :is-selected="isHotelSelected(hotel)"
            @select="handleSelectHotel"
            @unselect="handleUnselectHotel"
            @show-details="handleShowDetails"
          />
        </div>
        
        <div v-else class="empty-state">
          <el-empty description="暂无酒店推荐" />
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
              <span v-if="selectedHotels.length">{{ selectedHotels.length }}个酒店</span>
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

    <!-- POI详情对话框 -->
    <PoiDetailDialog
      v-model="showDetailsDialog"
      :poi="selectedItemDetails || {}"
      :type="getItemType(selectedItemDetails)"
      @openMap="handleOpenMap"
    />
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
import HotelCard from '../Cards/HotelCard.vue'
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
const selectedHotels = ref([])
const showReasoningDialog = ref(false)
const showDetailsDialog = ref(false)
const selectedItemDetails = ref(null)
const isLoading = ref(false)

// 增强后的推荐数据
const enhancedAttractions = ref([])
const enhancedRestaurants = ref([])
const enhancedHotels = ref([])
const isEnhancing = ref(false)

// 计算属性 - 基于真实API数据
const hasValidData = computed(() => {
  return props.apiData && 
         !props.apiData.isError && 
         !props.apiData.isFallback &&
         (props.apiData.attractions?.length > 0 || props.apiData.restaurants?.length > 0 || props.apiData.hotels?.length > 0)
})

const attractionsCount = computed(() => props.apiData?.attractions?.length || 0)
const restaurantsCount = computed(() => props.apiData?.restaurants?.length || 0)
const hotelsCount = computed(() => props.apiData?.hotels?.length || 0)



const displayReasoning = computed(() => {
  return props.apiData?.reasoning || "根据STJ性格偏好，推荐了商务氛围厚重的景点和优雅经典的建筑"
})

// 推荐列表（优先使用增强后的数据）
const filteredAttractions = computed(() => {
  return enhancedAttractions.value.length > 0 
   ?enhancedAttractions.value 
    : props.apiData?.attractions || []
})

const filteredRestaurants = computed(() => {
  return enhancedRestaurants.value.length > 0 
   ?enhancedRestaurants.value 
    : props.apiData?.restaurants || []
})

const filteredHotels = computed(() => {
  return enhancedHotels.value.length > 0 
   ?enhancedHotels.value 
    : props.apiData?.hotels || []
})

const totalSelected = computed(() => 
  selectedAttractions.value.length + selectedRestaurants.value.length + selectedHotels.value.length
)

// 方法
const enhanceRecommendationsWithAmap = async () => {
  if (!props.apiData || (!props.apiData.attractions?.length && !props.apiData.restaurants?.length && !props.apiData.hotels?.length)) {
    return
  }

  const city = props.cityInfo?.destinationName
  if (!city) {
    console.warn('无法获取城市信息，跳过高德API增强')
    return
  }

  isEnhancing.value = true
  
  try {
    console.log(`🚀 开始增强推荐数据 - 城市: ${city}`)
    
    // 并行增强景点、餐厅和酒店数据
    const [enhancedAttractionsResult, enhancedRestaurantsResult, enhancedHotelsResult] = await Promise.allSettled([
      props.apiData.attractions?.length > 0 
       ?enhanceAiRecommendations(props.apiData.attractions, city)
        : Promise.resolve([]),
      props.apiData.restaurants?.length > 0 
       ?enhanceAiRecommendations(props.apiData.restaurants, city)
        : Promise.resolve([]),
      props.apiData.hotels?.length > 0 
       ?enhanceAiRecommendations(props.apiData.hotels, city)
        : Promise.resolve([])
    ])

    // 处理景点增强结果
    if (enhancedAttractionsResult.status === 'fulfilled') {
      enhancedAttractions.value = enhancedAttractionsResult.value
      console.log(`✅ 景点数据增强完成: ${enhancedAttractionsResult.value.length} 个`)
    } else {
      console.error('❌ 景点数据增强失败:', enhancedAttractionsResult.reason)
      enhancedAttractions.value = props.apiData.attractions || []
    }

    // 处理餐厅增强结果
    if (enhancedRestaurantsResult.status === 'fulfilled') {
      enhancedRestaurants.value = enhancedRestaurantsResult.value
      console.log(`✅ 餐厅数据增强完成: ${enhancedRestaurantsResult.value.length} 个`)
    } else {
      console.error('❌ 餐厅数据增强失败:', enhancedRestaurantsResult.reason)
      enhancedRestaurants.value = props.apiData.restaurants || []
    }

    // 处理酒店增强结果
    if (enhancedHotelsResult.status === 'fulfilled') {
      enhancedHotels.value = enhancedHotelsResult.value
      console.log(`✅ 酒店数据增强完成: ${enhancedHotelsResult.value.length} 个`)
    } else {
      console.error('❌ 酒店数据增强失败:', enhancedHotelsResult.reason)
      enhancedHotels.value = props.apiData.hotels || []
    }

    // 统计增强成功的数量
    const enhancedCount = [
      ...enhancedAttractions.value.filter(item => item.isEnhanced),
      ...enhancedRestaurants.value.filter(item => item.isEnhanced),
      ...enhancedHotels.value.filter(item => item.isEnhanced)
    ].length

    if (enhancedCount > 0) {
      ElMessage.success(`已为 ${enhancedCount} 个地点获取详细信息`)
    } else {
      ElMessage.info('推荐数据已加载，部分地点详细信息正在补充中')
    }

  } catch (error) {
    console.error('❌ 增强推荐数据失败:', error)
    // 失败时使用原始数据
    enhancedAttractions.value = props.apiData.attractions || []
    enhancedRestaurants.value = props.apiData.restaurants || []
    enhancedHotels.value = props.apiData.hotels || []
    ElMessage.warning('地点详细信息获取失败，使用基础推荐数据')
  } finally {
    isEnhancing.value = false
  }
}

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

const isHotelSelected = (hotel) => {
  return selectedHotels.value.some(item => 
    item.id === hotel.id || item.name === hotel.name
  )
}

const handleSelectHotel = (hotel) => {
  if (!isHotelSelected(hotel)) {
    selectedHotels.value.push(hotel)
    emitSelectionsUpdate()
  }
}

const handleUnselectHotel = (hotel) => {
  const index = selectedHotels.value.findIndex(item => 
    item.id === hotel.id || item.name === hotel.name
  )
  if (index > -1) {
    selectedHotels.value.splice(index, 1)
    emitSelectionsUpdate()
  }
}

const handleShowDetails = (item) => {
  selectedItemDetails.value = item
  showDetailsDialog.value = true
}

// 监听对话框关闭，清空选中的详情
watch(showDetailsDialog, (newValue, oldValue) => {
  console.log('showDetailsDialog changed:', oldValue, '->', newValue)
  if (!newValue) {
    console.log('Clearing selectedItemDetails')
    selectedItemDetails.value = null
  }
})

// 获取项目类型
const getItemType = (item) => {
  if (!item) return 'attraction'
  
  // 根据数据结构判断类型
  if (item.type === 'hotel' || (item.type && item.type.includes('酒店'))) {
    return 'hotel'
  }
  if (item.type && item.type.includes('餐')) {
    return 'restaurant'
  }
  if (item.category && (item.category.includes('餐') || item.category.includes('食'))) {
    return 'restaurant'
  }
  if (item.category && (item.category.includes('酒店') || item.category.includes('住宿'))) {
    return 'hotel'
  }
  if (item.tags && item.tags.some(tag => tag.includes('餐') || tag.includes('食'))) {
    return 'restaurant'
  }
  if (item.tags && item.tags.some(tag => tag.includes('酒店') || tag.includes('住宿'))) {
    return 'hotel'
  }
  
  return 'attraction'
}

// 在地图中打开
const handleOpenMap = (poi) => {
  console.log('在地图中打开POI:', poi.name)
  // 这里可以添加地图功能或导航功能
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
    restaurants: selectedRestaurants.value,
    hotels: selectedHotels.value
  })
}



// 生命周期
onMounted(() => {
  // 如果有API数据，显示欢迎消息
  if (hasValidData.value) {
    const parts = []
    if (attractionsCount.value > 0) parts.push(`${attractionsCount.value} 个景点`)
    if (restaurantsCount.value > 0) parts.push(`${restaurantsCount.value} 个餐厅`)
    if (hotelsCount.value > 0) parts.push(`${hotelsCount.value} 个酒店`)
    
    if (parts.length > 0) {
      ElMessage.success(`成功加载 ${parts.join('、')} 推荐`)
    }
  }
})

// 监听apiData变化
watch(
  () => props.apiData,
  async (newData) => {
    if (newData) {
      if (newData.isError) {
        ElMessage.error(newData.reasoning || '推荐加载失败')
      } else if (newData.isFallback) {
        ElMessage.warning(newData.reasoning || '使用备用推荐')
      } else if (hasValidData.value) {
        ElMessage.success('推荐数据已更新')
        // 自动增强推荐数据
        await enhanceRecommendationsWithAmap()
      }
    }
  },
  { immediate: true, deep: true }
)
</script>

<style scoped>
.enhanced-recommendation-step {
  padding: 0 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面头部 */
.step-header {
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  color: white;
  padding: 32px 24px;
  border-radius: 16px;
  margin-bottom: 24px;
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
  gap: 40px;
  margin-bottom: 40px;
}

.recommendation-section {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.recommendation-section:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.section-header {
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f5f5f5;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 推荐网格和列表 */
.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;
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



/* 大屏设备优化 */
@media (min-width: 1400px) {
  .recommendations-grid,
  .loading-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 28px;
  }
}

/* 平板设备响应式布局 */
@media (max-width: 1200px) and (min-width: 769px) {
  .recommendations-grid,
  .loading-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .recommendation-section {
    padding: 24px;
  }
}

/* 移动设备响应式设计 */
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
    padding: 20px;
    border-radius: 16px;
  }
  
  .recommendation-content {
    gap: 24px;
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
