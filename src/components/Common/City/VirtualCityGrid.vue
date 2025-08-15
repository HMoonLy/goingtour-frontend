<template>
  <div ref="containerRef"
class="virtual-city-grid-container">
    <!-- 虚拟滚动容器 - 移除内部滚动 -->
    <div class="virtual-scroll-wrapper">
      <!-- 可见的城市分组 - 显示全部 -->
      <div
        v-for="group in visibleGroups"
        :id="'letter-' + group.letter"
        :key="group.letter"
        class="city-group-section modern"
      >
        <!-- 分组标题 - 固定样式 -->
        <div class="group-header">
          <div class="group-title-container">
            <div class="group-letter-badge">
              {{ group.letter }}
            </div>
          </div>
        </div>

        <!-- 城市卡片网格 -->
        <CityGridList
          :cities="group.cities"
          :wishlist-items="wishlistItems"
          :loading="false"
          class="group-grid"
          @select-city="$emit('selectCity', $event)"
          @toggle-wishlist="$emit('toggleWishlist', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
  shallowRef,
} from "vue";
import CityGridList from "./CityGridList.vue";

export default {
  name: "VirtualCityGrid",
  components: {
    CityGridList,
  },
  props: {
    cityGroups: {
      type: Array,
      required: true,
    },
    wishlistItems: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["selectCity", "toggleWishlist"],
  setup(props) {
    const containerRef = ref(null);
    const groupRefs = shallowRef(new Map());

    // 虚拟滚动参数 - 适配页面滚动
    const itemHeight = 400; // 每个分组的估算高度（考虑卡片网格布局）
    const scrollTop = ref(0);
    const visibleCount = ref(6); // 减少可见项目数量，因为卡片占用更多空间
    const offsetY = ref(0);

    // 计算可见的分组 - 基于页面滚动
    const visibleGroups = computed(() => {
      if (!props.cityGroups.length) return [];

      // 显示所有分组，不再使用虚拟滚动（避免双滚动条）
      return props.cityGroups;
    });

    // 移除原有的滚动处理逻辑

    // 简化生命周期钩子 - 移除滚动监听
    onMounted(() => {
      // 不再需要复杂的滚动和容器高度监听
      console.log("VirtualCityGrid mounted - 显示所有城市分组");
    });

    onBeforeUnmount(() => {
      // 清理工作已不需要
    });

    // 监听城市数据变化 - 简化版
    watch(
      () => props.cityGroups.length,
      () => {
        console.log("城市数据变化:", props.cityGroups.length);
      },
    );

    return {
      containerRef,
      visibleGroups,
    };
  },
};
</script>

<style scoped>
/* ===== 虚拟滚动容器样式 ===== */
.virtual-city-grid-container {
  width: 100%;
  position: relative;
  /* 移除固定高度和内部滚动 */
}

/* ===== 虚拟滚动包装器 ===== */
.virtual-scroll-wrapper {
  width: 100%;
  /* 移除内部滚动设置 */
}

/* ===== 虚拟占位空间 ===== */
.virtual-spacer-top,
.virtual-spacer-bottom {
  height: 0;
  pointer-events: none;
  flex-shrink: 0;
}

/* ===== 城市分组样式 ===== */
.city-group-section.modern {
  margin-bottom: 40px;
  padding: 0 20px;

  /* 性能优化 */
  will-change: transform;
  transform: translateZ(0);
}

/* ===== 分组标题样式 - 修复行高问题 ===== */
.group-header {
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 10;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(248, 250, 252, 0.95) 100%
  );
  backdrop-filter: blur(12px);
  border-radius: 12px 12px 0 0;

  /* 固定高度和内边距，解决行高问题 */
  min-height: 90px;
  padding: 24px 16px;
  display: flex;
  align-items: center;
  margin: 0 -20px 24px -20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.group-title-container {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  margin-left: 0;
}

.group-letter-badge {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  box-shadow:
    0 4px 14px rgba(99, 102, 241, 0.4),
    0 2px 6px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.group-letter-badge:hover {
  transform: scale(1.05) translateY(-1px);
  box-shadow:
    0 6px 20px rgba(99, 102, 241, 0.5),
    0 4px 8px rgba(0, 0, 0, 0.15);
}

.group-title {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;

  /* 固定行高，解决样式问题 */
  line-height: 1.2;
  height: 32px;

  /* 优化字体渲染 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.city-count {
  font-size: 16px;
  font-weight: 400;
  color: #6b7280;
  background: rgba(107, 114, 128, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
}

/* ===== 网格容器样式 ===== */
.group-grid {
  margin-bottom: 20px;
}

/* ===== 响应式设计 ===== */
@media (max-width: 1024px) {
  .city-group-section.modern {
    padding: 0 16px;
    margin-bottom: 32px;
  }

  .group-header {
    margin-bottom: 20px;
    padding-bottom: 12px;
  }

  .group-letter-badge {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }

  .group-title {
    font-size: 20px;
  }

  .city-count {
    font-size: 14px;
    padding: 3px 10px;
  }
}

@media (max-width: 640px) {
  .city-group-section.modern {
    padding: 0 12px;
    margin-bottom: 24px;
  }

  .group-title-container {
    gap: 12px;
  }

  .group-letter-badge {
    width: 32px;
    height: 32px;
    font-size: 13px;
  }

  .group-title {
    font-size: 18px;
    gap: 8px;
  }

  .city-count {
    font-size: 13px;
    padding: 2px 8px;
  }
}

/* ===== 暗色模式支持 ===== */
@media (prefers-color-scheme: dark) {
  .group-header {
    background: linear-gradient(
      135deg,
      rgba(31, 41, 55, 0.98) 0%,
      rgba(17, 24, 39, 0.95) 100%
    );
    border-bottom-color: rgba(99, 102, 241, 0.2);
  }

  .group-letter-badge {
    box-shadow:
      0 4px 14px rgba(99, 102, 241, 0.6),
      0 2px 6px rgba(0, 0, 0, 0.3);
  }
}

/* ===== 性能优化 ===== */
.virtual-city-grid-container * {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* 减少重排重绘 */
@media (prefers-reduced-motion: reduce) {
  .virtual-scroll-wrapper {
    scroll-behavior: auto;
  }

  .city-group-section.modern {
    transform: none;
  }
}

/* ===== 打印样式 ===== */
@media print {
  .virtual-city-grid-container {
    height: auto;
  }

  .virtual-scroll-wrapper {
    height: auto;
    overflow: visible;
  }

  .group-header {
    position: static;
    background: white;
    backdrop-filter: none;
  }
}

/* ===== 高对比度模式 ===== */
@media (prefers-contrast: high) {
  .group-header {
    border-bottom: 2px solid #000000;
  }

  .group-letter-badge {
    background: #000000;
    color: #ffffff;
    box-shadow: none;
  }

  .group-title {
    color: #000000;
  }
}
</style>
