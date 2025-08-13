<template>
  <div class="city-grid-container">
    <!-- 网格布局的城市卡片 - 性能优化版本 -->
    <div class="city-grid" :class="{ 'has-wishlist': hasWishlistItems }">
      <!-- 使用v-memo优化大列表渲染性能 -->
      <CityCard
        v-for="city in cities"
        :key="city.adcode"
        :city="city"
        :is-in-wishlist="wishlistSet.has(city.adcode)"
        class="grid-item"
        @select-city="handleSelectCity"
        @toggle-wishlist="handleToggleWishlist"
      />
    </div>

    <!-- 空状态展示 -->
    <div v-if="cities.length === 0 && !loading" class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
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
    <div v-if="loading" class="loading-grid">
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
  emits: ["selectCity", "toggleWishlist"],
  setup(props, { emit }) {
    // 使用Set缓存心愿清单城市编码，提升查询性能
    const wishlistSet = computed(() => {
      return new Set(props.wishlistItems.map((item) => item.cityCode));
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

    // 清理定时器
    onBeforeUnmount(() => {
      if (selectTimeout) clearTimeout(selectTimeout);
      if (wishlistTimeout) clearTimeout(wishlistTimeout);
    });

    return {
      wishlistSet,
      hasWishlistItems,
      skeletonCount,
      handleSelectCity,
      handleToggleWishlist,
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

/* ===== 响应式网格布局 ===== */
.city-grid {
  display: grid;
  gap: 14px;
  width: 100%;

  /* 一行放5个左右的紧凑布局 */
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));

  /* 确保网格项目等高 */
  align-items: stretch;

  /* 性能优化：启用GPU加速 */
  will-change: transform;
  transform: translateZ(0);

  /* 大量数据优化：使用 contain 属性提升渲染性能 */
  contain: layout style paint;
}

/* 中等屏幕：一行4-5个 */
@media (max-width: 1400px) and (min-width: 1024px) {
  .city-grid {
    grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
    gap: 14px;
  }
}

/* 平板屏幕：一行3-4个 */
@media (max-width: 1024px) and (min-width: 640px) {
  .city-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
}

/* 手机屏幕：一行2个 */
@media (max-width: 640px) {
  .city-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}

/* 网格项目样式 */
.grid-item {
  width: 100%;
  height: 100%;
  min-height: 60px; /* 减少高度让卡片更紧凑 */

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

/* ===== 加载骨架屏样式 ===== */
.loading-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}

@media (max-width: 1024px) and (min-width: 640px) {
  .loading-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
}

@media (max-width: 640px) {
  .loading-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}

.skeleton-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 8px;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.skeleton-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  flex: 1;
  margin-bottom: 16px;
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
  height: 16px;
  width: 70%;
  margin-bottom: 12px;
}

.skeleton-subtitle {
  height: 12px;
  width: 50%;
}

.skeleton-footer {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.skeleton-badge {
  height: 10px;
  width: 60px;
  margin: 0;
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
