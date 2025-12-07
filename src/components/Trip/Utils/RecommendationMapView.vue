<!--
🗺️ 推荐地图视图组件
在地图上展示景点和餐厅推荐，支持选择和详情查看
-->

<template>
  <div class="recommendation-map-view">
    <!-- 地图头部工具栏 -->
    <div class="map-toolbar">
      <div class="toolbar-left">
        <h3 class="map-title">
          <el-icon><MapLocation /></el-icon>
          推荐地图
        </h3>
        <div class="map-stats">
          <el-tag size="small" type="primary">{{ attractions.length }}个景点</el-tag>
          <el-tag size="small" type="success">{{ restaurants.length }}个餐厅</el-tag>
        </div>
      </div>
      
      <div class="toolbar-right">
        <!-- 图层控制 -->
        <el-checkbox-group v-model="visibleLayers" size="small" class="layer-controls">
          <el-checkbox value="attractions" border>
            <el-icon><Camera /></el-icon>
            景点
          </el-checkbox>
          <el-checkbox value="restaurants" border>
            <el-icon><Bowl /></el-icon>
            餐厅
          </el-checkbox>
        </el-checkbox-group>
        
        <!-- 地图控制 -->
        <el-button-group size="small">
          <el-button @click="centerMap">
            <el-icon><Aim /></el-icon>
            居中
          </el-button>
          <el-button @click="toggleFullscreen">
            <el-icon><FullScreen /></el-icon>
            全屏
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 地图容器 -->
    <div class="map-container" :class="{ fullscreen: isFullscreen }">
      <div v-if="loading" class="map-loading">
        <el-skeleton animated>
          <template #template>
            <div class="skeleton-map">
              <el-skeleton-item variant="rect" style="height: 100%;" />
            </div>
          </template>
        </el-skeleton>
        <div class="loading-overlay">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span>正在加载地图...</span>
        </div>
      </div>
      
      <!-- 实际地图将在这里渲染 -->
      <div v-else id="recommendation-map" class="map-instance"></div>
      
      <!-- 地图侧边栏 -->
      <div v-if="!loading && selectedItem" class="map-sidebar">
        <div class="sidebar-header">
          <h4>{{ selectedItem.name }}</h4>
          <el-button 
            size="small" 
            text 
            type="info"
            @click="selectedItem = null"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        
        <div class="sidebar-content">
          <!-- 基本信息 -->
          <div class="item-info">
            <div class="info-row">
              <span class="label">类型:</span>
              <el-tag :type="selectedItem.type === 'attraction'?'primary' : 'success'" size="small">
                {{ selectedItem.type === 'attraction'?'景点' : '餐厅' }}
              </el-tag>
            </div>
            
            <div v-if="selectedItem.rating" class="info-row">
              <span class="label">评分:</span>
              <el-rate 
                :model-value="selectedItem.rating" 
                disabled 
                size="small"
                show-score
              />
            </div>
            
            <div v-if="selectedItem.price" class="info-row">
              <span class="label">价格:</span>
              <span class="price">{{ selectedItem.price }}</span>
            </div>
            
            <div v-if="selectedItem.address" class="info-row">
              <span class="label">地址:</span>
              <span class="address">{{ selectedItem.address }}</span>
            </div>
          </div>
          
          <!-- 推荐理由 -->
          <div v-if="selectedItem.aiReason" class="ai-reason">
            <div class="reason-header">
              <el-icon></el-icon>
              <span>AI推荐理由</span>
            </div>
            <p class="reason-text">{{ selectedItem.aiReason }}</p>
          </div>
          
          <!-- 操作按钮 -->
          <div class="sidebar-actions">
            <el-button
              v-if="!isItemSelected(selectedItem)"
              type="primary"
              size="small"
              @click="handleSelectItem(selectedItem)"
            >
              <el-icon><Plus /></el-icon>
              添加到行程
            </el-button>
            
            <el-button
              v-else
              type="danger"
              size="small"
              @click="handleUnselectItem(selectedItem)"
            >
              <el-icon><Minus /></el-icon>
              从行程移除
            </el-button>
            
            <el-button
              size="small"
              @click="handleShowDetails(selectedItem)"
            >
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 选择统计 -->
    <div class="map-selection-stats">
      <div class="stats-content">
        <span class="stats-text">
          已选择: {{ selectedAttractions.length }}个景点, {{ selectedRestaurants.length }}个餐厅
        </span>
      </div>
      
      <div class="stats-actions">
        <el-button size="small" text @click="showAllItems">
          显示全部
        </el-button>
        <el-button size="small" text @click="showSelectedOnly">
          仅显示已选
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  MapLocation,
  Camera,
  Bowl,
  Aim,
  FullScreen,
  Loading,
  Close,
  Plus,
  Minus,
  View
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  attractions: {
    type: Array,
    default: () => []
  },
  restaurants: {
    type: Array,
    default: () => []
  },
  selectedAttractions: {
    type: Array,
    default: () => []
  },
  selectedRestaurants: {
    type: Array,
    default: () => []
  },
  cityCenter: {
    type: Object,
    default: () => ({ lat: 39.9042, lng: 116.4074 })
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'select-attraction',
  'unselect-attraction',
  'select-restaurant',
  'unselect-restaurant',
  'show-details'
])

// 本地状态
const visibleLayers = ref(['attractions', 'restaurants'])
const isFullscreen = ref(false)
const selectedItem = ref(null)
const mapInstance = ref(null)
const showSelectedItemsOnly = ref(false)

// 计算属性
const allItems = computed(() => [
  ...props.attractions.map(item => ({ ...item, type: 'attraction' })),
  ...props.restaurants.map(item => ({ ...item, type: 'restaurant' }))
])

const visibleItems = computed(() => {
  let items = allItems.value.filter(item => {
    // 图层过滤
    if (item.type === 'attraction' && !visibleLayers.value.includes('attractions')) {
      return false
    }
    if (item.type === 'restaurant' && !visibleLayers.value.includes('restaurants')) {
      return false
    }
    
    // 选择状态过滤
    if (showSelectedItemsOnly.value) {
      return isItemSelected(item)
    }
    
    return true
  })
  
  return items
})

// 方法
const isItemSelected = (item) => {
  if (item.type === 'attraction') {
    return props.selectedAttractions.some(selected => 
      selected.id === item.id || selected.name === item.name
    )
  } else {
    return props.selectedRestaurants.some(selected => 
      selected.id === item.id || selected.name === item.name
    )
  }
}

const handleSelectItem = (item) => {
  if (item.type === 'attraction') {
    emit('select-attraction', item)
  } else {
    emit('select-restaurant', item)
  }
}

const handleUnselectItem = (item) => {
  if (item.type === 'attraction') {
    emit('unselect-attraction', item)
  } else {
    emit('unselect-restaurant', item)
  }
}

const handleShowDetails = (item) => {
  emit('show-details', item)
}

const centerMap = () => {
  if (mapInstance.value) {
    // 重新居中地图到城市中心
    // 这里需要根据具体的地图库实现
    ElMessage.info('地图已居中')
  }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  nextTick(() => {
    // 地图需要重新调整大小
    if (mapInstance.value) {
      // 触发地图resize事件
    }
  })
}

const showAllItems = () => {
  showSelectedItemsOnly.value = false
}

const showSelectedOnly = () => {
  showSelectedItemsOnly.value = true
}

const initMap = async () => {
  // 这里将初始化地图
  // 由于我们还没有集成具体的地图服务，先用模拟实现
  await nextTick()
  
  const mapContainer = document.getElementById('recommendation-map')
  if (mapContainer) {
    mapContainer.innerHTML = `
      <div class="map-placeholder">
        <div class="placeholder-content">
          <el-icon class="placeholder-icon"><MapLocation /></el-icon>
          <h3>地图功能开发中</h3>
          <p>将集成高德地图或百度地图显示推荐位置</p>
          <div class="placeholder-stats">
            <div>城市中心: ${props.cityCenter.lat}, ${props.cityCenter.lng}</div>
            <div>可见项目: ${visibleItems.value.length}个</div>
          </div>
        </div>
      </div>
    `
  }
}

// 生命周期
onMounted(() => {
  if (!props.loading) {
    initMap()
  }
})

// 监听加载状态变化
watch(() => props.loading, (newLoading) => {
  if (!newLoading) {
    nextTick(() => {
      initMap()
    })
  }
})

// 监听可见项目变化，更新地图标记
watch(visibleItems, (newItems) => {
  // 更新地图上的标记点
  console.log('可见项目已更新:', newItems.length)
}, { deep: true })

// 清理
onUnmounted(() => {
  if (mapInstance.value) {
    // 清理地图实例
  }
})
</script>

<style scoped>
.recommendation-map-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 地图工具栏 */
.map-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.map-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.map-stats {
  display: flex;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.layer-controls {
  margin-right: 8px;
}

/* 地图容器 */
.map-container {
  flex: 1;
  position: relative;
  background: #f5f7fa;
  min-height: 500px;
}

.map-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: white;
}

.map-loading {
  position: relative;
  height: 100%;
}

.skeleton-map {
  height: 100%;
  background: #f5f7fa;
}

.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #909399;
}

.loading-icon {
  font-size: 24px;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.map-instance {
  height: 100%;
  width: 100%;
}

/* 地图占位符样式 */
.map-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.placeholder-content {
  text-align: center;
  padding: 40px;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.placeholder-content h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

.placeholder-content p {
  margin: 0 0 20px 0;
  opacity: 0.9;
}

.placeholder-stats {
  background: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
}

.placeholder-stats div {
  margin-bottom: 4px;
}

/* 侧边栏 */
.map-sidebar {
  position: absolute;
  top: 0;
  right: 0;
  width: 320px;
  height: 100%;
  background: white;
  border-left: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.sidebar-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.item-info {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.label {
  width: 60px;
  font-size: 14px;
  color: #606266;
  margin-right: 8px;
}

.price {
  color: #e6a23c;
  font-weight: 600;
}

.address {
  font-size: 14px;
  color: #909399;
  line-height: 1.4;
}

.ai-reason {
  background: #f0f9ff;
  border: 1px solid #e1f5fe;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.reason-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #0288d1;
}

.reason-text {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 选择统计 */
.map-selection-stats {
  padding: 12px 20px;
  border-top: 1px solid #ebeef5;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-text {
  font-size: 14px;
  color: #606266;
}

.stats-actions {
  display: flex;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .map-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    justify-content: center;
  }

  .layer-controls {
    margin-right: 0;
  }

  .map-sidebar {
    width: 100%;
    height: 60%;
    top: auto;
    bottom: 0;
    right: 0;
    border-left: none;
    border-top: 1px solid #ebeef5;
  }

  .map-selection-stats {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .stats-actions {
    justify-content: center;
  }
}
</style>
