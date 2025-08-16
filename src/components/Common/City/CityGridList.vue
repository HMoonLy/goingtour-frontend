<template>
  <div class="city-grid-container">
    <!-- 网格布局的城市卡片 - 性能优化版本 -->
    <div class="city-grid"
:class="{ 'has-wishlist': hasWishlistItems }">
      <!-- 使用v-memo优化大列表渲染性能 -->
      <CityCard
        v-for="city in cities"
        :key="city.adcode"
        :city="city"
        :is-in-wishlist="wishlistSet.has(city.adcode)"
        class="grid-item"
        @select-city="handleSelectCity"
        @toggle-wishlist="handleToggleWishlist"
        @plan-trip="handlePlanTrip"
        @view-details="handleViewDetails"
        @edit="handleEdit"
      />
    </div>

    <!-- 空状态展示 -->
    <div v-if="cities.length === 0 && !loading"
class="empty-state">
      <div class="empty-icon">
        <svg width="64"
height="64" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            fill="#9ca3af"
          />
        </svg>
      </div>
      <h3 class="empty-title">暂无城市数据</h3>
      <p class="empty-description">请尝试其他搜索条件或稍后再试</p>
    </div>

    <!-- 加载骨架屏 -->
    <div v-if="loading"
class="loading-grid">
      <div
        v-for="i in skeletonCount"
        :key="'skeleton-' + i"
        class="skeleton-card"
      >
        <div class="skeleton-header">
          <div class="skeleton-circle" />
        </div>
        <div class="skeleton-content">
          <div class="skeleton-line skeleton-title" />
          <div class="skeleton-line skeleton-subtitle" />
        </div>
        <div class="skeleton-footer">
          <div class="skeleton-line skeleton-badge" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, defineComponent, onBeforeUnmount } from "vue";
import CityCard from "./CityCard.vue";

export default defineComponent({
  name: "CityGridList",
  components: {
    CityCard,
  },
  props: {
    cities: {
      type: Array,
      required: true,
    },
    wishlistItems: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["selectCity", "toggleWishlist", "planTrip", "viewDetails", "edit"],
  setup(props, { emit }) {
    // 使用Set缓存心愿清单城市编码，提升查询性能
    const wishlistSet = computed(() => {
      return new Set(props.wishlistItems.map((item) => item.adcode));
    });

    // 是否有收藏的城市
    const hasWishlistItems = computed(() => props.wishlistItems.length > 0);

    // 骨架屏数量（根据屏幕大小动态计算）
    const skeletonCount = computed(() => {
      // 默认显示12个骨架卡片
      return 12;
    });

    // 性能优化：防抖处理事件发射
    let selectTimeout = null;
    let wishlistTimeout = null;
    let planTripTimeout = null;
    let viewDetailsTimeout = null;
    let editTimeout = null;

    const handleSelectCity = (city) => {
      // 防止快速点击导致的多次触发
      if (selectTimeout) clearTimeout(selectTimeout);
      selectTimeout = setTimeout(() => {
        emit("selectCity", city);
      }, 50);
    };

    const handleToggleWishlist = (city) => {
      // 防止快速点击导致的多次切换
      if (wishlistTimeout) clearTimeout(wishlistTimeout);
      wishlistTimeout = setTimeout(() => {
        emit("toggleWishlist", city);
      }, 100);
    };

    const handlePlanTrip = (city) => {
      if (planTripTimeout) clearTimeout(planTripTimeout);
      planTripTimeout = setTimeout(() => {
        emit("planTrip", city);
      }, 50);
    };

    const handleViewDetails = (city) => {
      if (viewDetailsTimeout) clearTimeout(viewDetailsTimeout);
      viewDetailsTimeout = setTimeout(() => {
        emit("viewDetails", city);
      }, 50);
    };

    const handleEdit = (city) => {
      if (editTimeout) clearTimeout(editTimeout);
      editTimeout = setTimeout(() => {
        emit("edit", city);
      }, 50);
    };

    // 清理定时器
    onBeforeUnmount(() => {
      if (selectTimeout) clearTimeout(selectTimeout);
      if (wishlistTimeout) clearTimeout(wishlistTimeout);
      if (planTripTimeout) clearTimeout(planTripTimeout);
      if (viewDetailsTimeout) clearTimeout(viewDetailsTimeout);
      if (editTimeout) clearTimeout(editTimeout);
    });

    return {
      wishlistSet,
      hasWishlistItems,
      skeletonCount,
      handleSelectCity,
      handleToggleWishlist,
      handlePlanTrip,
      handleViewDetails,
      handleEdit,
    };
  },
});
</script>

<style scoped>
/* ===== 网格容器样式 ===== */
.city-grid-container {
  width: 100%;
  min-height: 200px;
}

/* ===== 瀑布流网格布局 ===== */
.city-grid {
  display: grid;
  gap: 20px;
  width: 100%;

  /* 瀑布流布局：一行放3-4个，自适应高度 */
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  
  /* 关键：允许行高自适应，像照片墙一样 */
  grid-auto-rows: auto;
  
  /* 顶部对齐，让卡片从顶部开始排列 */
  align-items: start;

  /* 性能优化：启用GPU加速 */
  will-change: transform;
  transform: translateZ(0);

  /* 大量数据优化：使用 contain 属性提升渲染性能 */
  contain: layout style paint;
}

/* 中等屏幕：一行2-3个 */
@media (max-width: 1400px) and (min-width: 1024px) {
  .city-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 18px;
  }
}

/* 平板屏幕：一行2个 */
@media (max-width: 1024px) and (min-width: 640px) {
  .city-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }
}

/* 手机屏幕：一行1个 */
@media (max-width: 640px) {
  .city-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

/* 网格项目样式 - 瀑布流适配 */
.grid-item {
  width: 100%;
  /* 移除固定高度，让卡片自适应内容 */
  height: auto;

  /* 防止卡片在打印或分栏时被分割 */
  break-inside: avoid;
  page-break-inside: avoid;

  /* 性能优化：减少重排重绘 */
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;

  /* 使用GPU加速，避免布局抖动 */
  transform: translateZ(0);
  contain: layout style paint;
}

/* ===== 空状态样式 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
  line-height: 1.5;
}

/* ===== 加载骨架屏样式 - 瀑布流适配 ===== */
.loading-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-auto-rows: auto;
  align-items: start;
}

@media (max-width: 1400px) and (min-width: 1024px) {
  .loading-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 18px;
  }
}

@media (max-width: 1024px) and (min-width: 640px) {
  .loading-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 640px) {
  .loading-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.skeleton-card {
  background: white;
  border-radius: 16px;
  /* 骨架屏也使用自适应高度，模拟真实卡片 */
  height: auto;
  min-height: 240px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.04);
}

/* 骨架屏封面区域 */
.skeleton-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 180px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@media (max-width: 640px) {
  .skeleton-card {
    min-height: 200px;
  }
  
  .skeleton-card::before {
    height: 140px;
  }
}

/* 骨架屏内容区域 - 匹配照片墙结构 */
.skeleton-header {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}

.skeleton-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(90deg, rgba(255,255,255,0.8) 25%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.8) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: white;
  min-height: 80px;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-bottom: 8px;
}

.skeleton-title {
  height: 18px;
  width: 65%;
  margin-bottom: 8px;
  border-radius: 9px;
}

.skeleton-subtitle {
  height: 14px;
  width: 45%;
  margin-bottom: 12px;
  border-radius: 7px;
}

.skeleton-footer {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 8px;
}

.skeleton-badge {
  height: 20px;
  width: 40px;
  border-radius: 10px;
  margin: 0;
}

/* 移动端骨架屏适配 */
@media (max-width: 640px) {
  .skeleton-content {
    padding: 16px;
    min-height: 60px;
  }
  
  .skeleton-header {
    top: 8px;
    right: 8px;
  }
  
  .skeleton-circle {
    width: 28px;
    height: 28px;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* ===== 优化性能 ===== */
.city-grid-container * {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* 减少重排重绘 */
@media (prefers-reduced-motion: reduce) {
  .skeleton-card,
  .skeleton-circle,
  .skeleton-line {
    animation: none;
  }
}

/* ===== 暗色模式支持 ===== */
@media (prefers-color-scheme: dark) {
  .empty-title {
    color: #f9fafb;
  }

  .empty-description {
    color: #6b7280;
  }

  .skeleton-card {
    background: #1f2937;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .skeleton-circle,
  .skeleton-line {
    background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
    background-size: 200% 100%;
  }
}

/* ===== 打印样式 ===== */
@media print {
  .city-grid {
    display: block;
  }

  .grid-item {
    break-inside: avoid;
    margin-bottom: 20px;
  }
}

/* ===== 高对比度模式支持 ===== */
@media (prefers-contrast: high) {
  .skeleton-card {
    border: 2px solid #000000;
  }

  .empty-state {
    color: #000000;
  }
}
</style>
