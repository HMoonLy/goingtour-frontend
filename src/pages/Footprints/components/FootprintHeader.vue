<template>
  <div class="page-header">
    <div class="header-content">
      <div>
        <h1 class="page-title">
          <el-icon><Star /></el-icon>
          我的足迹
        </h1>
        <p class="page-subtitle">记录你的足迹，分享你的旅行故事</p>

        <div class="quick-actions-buttons">
          <!-- 去过的城市照片展示 -->
          <VisitedCitiesGallery
            :max-display-count="6"
            :visited-cities-data="visitedCities"
            @photo-uploaded="(...args) => $emit('photo-uploaded', ...args)"
            @photo-deleted="(...args) => $emit('photo-deleted', ...args)"
            @city-deleted="(...args) => $emit('city-deleted', ...args)"
            @add-visited-city="$emit('add-visited-city')"
          />

          <!-- 足迹统计卡片 -->
          <FootprintStats
            :stats="stats"
            :has-data="hasData"
            @share="$emit('share')"
            @view-achievements="$emit('view-achievements')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Star } from '@element-plus/icons-vue';
import VisitedCitiesGallery from '@/components/Common/Footprints/VisitedCitiesGallery.vue';
import FootprintStats from '@/components/Common/Stats/FootprintStats.vue';

defineProps({
  visitedCities: {
    type: Array,
    default: () => []
  },
  stats: {
    type: Object,
    default: () => ({})
  },
  hasData: Boolean
});

defineEmits([
  'photo-uploaded',
  'photo-deleted',
  'city-deleted',
  'add-visited-city',
  'share',
  'view-achievements'
]);
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}


.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title .el-icon {
  color: #409eff;
}

.page-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.quick-actions-buttons {
width:100%;
}

@media (max-width: 768px) {
  .quick-actions-buttons {
    flex-direction: column;
    gap: 16px;
  }
}
</style>

