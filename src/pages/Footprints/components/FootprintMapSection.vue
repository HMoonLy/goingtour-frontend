<template>
  <div>
    <!-- 状态切换控制区域 -->
    <div class="view-control-section">
      <div class="control-header">
        <h3 class="control-title">
          <el-icon><View /></el-icon>
          地图显示模式
        </h3>
        <p class="control-subtitle">
          选择在地图上显示的城市类型，去过的城市已在上方展示
        </p>
      </div>

      <div class="view-mode-buttons">
        <el-button
          :type="modelValue === 'all' ? 'primary' : ''"
          size="large"
          class="mode-button"
          @click="updateMode('all')"
        >
          <el-icon><Location /></el-icon>
          全部显示
        </el-button>

        <el-button
          :type="modelValue === 'wishlist' ? 'primary' : ''"
          size="large"
          class="mode-button wishlist-mode"
          @click="updateMode('wishlist')"
        >
          <el-icon><Star /></el-icon>
          想去的城市
        </el-button>

        <el-button
          :type="modelValue === 'visited' ? 'primary' : ''"
          size="large"
          class="mode-button visited-mode"
          @click="updateMode('visited')"
        >
          <el-icon><Check /></el-icon>
          去过的城市
        </el-button>
      </div>
    </div>

    <!-- 地图区域 -->
    <div class="map-section">
      <div class="map-header">
        <div class="map-title-group">
          <h3 class="map-title">
            <el-icon><MapLocation /></el-icon>
            足迹地图
          </h3>
          <div class="footprint-stats">
            <span class="stat-badge visited">
              <el-icon><Check /></el-icon>
              已去过 {{ visitedCount }}
            </span>
            <span class="stat-badge wishlist">
              <el-icon><Star /></el-icon>
              想去 {{ wishlistCount }}
            </span>
            <span class="stat-badge provinces">
              <el-icon><Location /></el-icon>
              {{ provincesCount }} 省份
            </span>
          </div>
        </div>
        <div class="map-controls">
          <el-button size="small" type="primary" @click="$emit('fullscreen')">
            <el-icon><View /></el-icon>
            全屏查看
          </el-button>
        </div>
      </div>

      <div class="map-container">
        <ChinaWishlistMap
          :wishlist-items="mapItems"
          height="600px"
          :enable-map-click="true"
          :highlighted-city="highlightedCity"
          @city-click="$emit('city-click', $event)"
          @map-click="$emit('map-click', $event)"
          @map-right-click="$emit('map-right-click', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { View, Location, Star, Check, MapLocation } from '@element-plus/icons-vue';
import ChinaWishlistMap from '@/components/Common/Map/ChinaWishlistMap.vue';

const props = defineProps({
  modelValue: { // mapDisplayMode
    type: String,
    default: 'all'
  },
  visitedCount: {
    type: Number,
    default: 0
  },
  wishlistCount: {
    type: Number,
    default: 0
  },
  provincesCount: {
    type: Number,
    default: 0
  },
  mapItems: {
    type: Array,
    default: () => []
  },
  highlightedCity: {
    type: Object,
    default: null
  }
});

const emit = defineEmits([
  'update:modelValue',
  'fullscreen',
  'city-click',
  'map-click',
  'map-right-click'
]);

const updateMode = (mode) => {
  emit('update:modelValue', mode);
};
</script>

<style scoped>
.view-control-section {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #ebeef5;
}

.control-header {
  margin-bottom: 20px;
}

.control-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.view-mode-buttons {
  display: flex;
  gap: 16px;
}

.mode-button {
  flex: 1;
}

.map-section {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #ebeef5;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.map-title-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.map-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.footprint-stats {
  display: flex;
  gap: 12px;
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.stat-badge.visited {
  background: #f0f9eb;
  color: #67c23a;
}

.stat-badge.wishlist {
  background: #fdf6ec;
  color: #e6a23c;
}

.stat-badge.provinces {
  background: #ecf5ff;
  color: #409eff;
}

.map-container {
  border-radius: 12px;
  overflow: hidden;
  background: #f5f7fa;
}

@media (max-width: 768px) {
  .view-mode-buttons {
    flex-direction: column;
  }
  
  .map-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .footprint-stats {
    flex-wrap: wrap;
  }
}
</style>

