<template>
  <div ref="containerRef"
class="optimized-virtual-city-list">
    <!-- 虚拟滚动容器 -->
    <div class="virtual-scroll-container"
:style="containerStyle">
      <!-- 虚拟占位空间 -->
      <div class="virtual-spacer"
:style="{ height: offsetY + 'px' }" />

      <!-- 可见项目 -->
      <div
        v-for="group in visibleGroups"
        :id="'letter-' + group.letter"
        :key="group.letter"
        :ref="(el) => setGroupRef(group.letter, el)"
        class="city-section optimized"
      >
        <h2 class="section-header">
          <span class="letter-icon">{{ group.letter }}</span>
          <span class="city-count">({{ group.cities.length }})</span>
        </h2>

        <!-- 使用优化的城市行组件 -->
        <div class="city-rows">
          <OptimizedCityRow
            v-for="city in group.cities"
            :key="city.adcode"
            :city="city"
            :is-in-wishlist="wishlistSet.has(city.adcode)"
            @select-city="$emit('selectCity', $event)"
            @toggle-wishlist="$emit('toggleWishlist', $event)"
          />
        </div>
      </div>

      <!-- 虚拟占位空间（底部） -->
      <div class="virtual-spacer"
:style="{ height: endSpacerHeight + 'px' }" />
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
import OptimizedCityRow from "./OptimizedCityRow.vue";

export default {
  name: "OptimizedVirtualCityList",
  components: {
    OptimizedCityRow,
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

    // 虚拟滚动参数 - 优化版
    const itemHeight = 85; // 每个分组的估算高度
    const containerHeight = ref(800);
    const scrollTop = ref(0);
    const visibleCount = ref(12);
    const offsetY = ref(0);

    // 使用Set缓存心愿清单城市编码，提升查询性能
    const wishlistSet = computed(() => {
      return new Set(props.wishlistItems.map((item) => item.cityCode));
    });

    // 容器样式 - 使用computed缓存
    const containerStyle = computed(() => ({
      height: containerHeight.value + "px",
    }));

    // 计算可见的分组 - 优化算法
    const visibleGroups = computed(() => {
      if (!props.cityGroups.length) return [];

      const startIndex = Math.max(
        0,
        Math.floor(scrollTop.value / itemHeight) - 1,
      );
      const endIndex = Math.min(
        startIndex + visibleCount.value + 2, // 增加缓冲区
        props.cityGroups.length,
      );

      offsetY.value = startIndex * itemHeight;

      return props.cityGroups.slice(startIndex, endIndex);
    });

    // 计算底部占位高度
    const endSpacerHeight = computed(() => {
      const totalHeight = props.cityGroups.length * itemHeight;
      const visibleHeight = visibleGroups.value.length * itemHeight;
      return Math.max(0, totalHeight - offsetY.value - visibleHeight);
    });

    // 优化的滚动处理 - 使用requestAnimationFrame
    let scrollRAF = null;
    const handleScroll = () => {
      if (scrollRAF) return;

      scrollRAF = requestAnimationFrame(() => {
        if (containerRef.value) {
          scrollTop.value = containerRef.value.scrollTop;
        }
        scrollRAF = null;
      });
    };

    // 优化的容器高度更新
    const updateContainerHeight = () => {
      if (containerRef.value) {
        const rect = containerRef.value.getBoundingClientRect();
        containerHeight.value = rect.height;
        visibleCount.value = Math.ceil(containerHeight.value / itemHeight) + 4;
      }
    };

    // 设置分组引用
    const setGroupRef = (letter, el) => {
      if (el) {
        groupRefs.value.set(letter, el);
      } else {
        groupRefs.value.delete(letter);
      }
    };

    // 响应式更新 - 使用ResizeObserver优化
    let resizeObserver = null;

    onMounted(() => {
      updateContainerHeight();

      if (containerRef.value) {
        containerRef.value.addEventListener("scroll", handleScroll, {
          passive: true,
          capture: false,
        });

        // 监听容器大小变化
        if (window.ResizeObserver) {
          resizeObserver = new ResizeObserver(updateContainerHeight);
          resizeObserver.observe(containerRef.value);
        }
      }

      // 监听窗口大小变化
      window.addEventListener("resize", updateContainerHeight, {
        passive: true,
      });
    });

    onBeforeUnmount(() => {
      if (scrollRAF) {
        cancelAnimationFrame(scrollRAF);
      }

      if (containerRef.value) {
        containerRef.value.removeEventListener("scroll", handleScroll);
      }

      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      window.removeEventListener("resize", updateContainerHeight);
    });

    // 监听城市数据变化，重新计算 - 使用nextTick优化
    watch(
      () => props.cityGroups.length,
      () => {
        nextTick(updateContainerHeight);
      },
    );

    return {
      containerRef,
      groupRefs,
      visibleGroups,
      containerStyle,
      offsetY,
      endSpacerHeight,
      wishlistSet,
      setGroupRef,
    };
  },
};
</script>

<style scoped>
.optimized-virtual-city-list {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  /* 优化滚动性能 */
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.optimized-virtual-city-list::-webkit-scrollbar {
  width: 6px;
}

.optimized-virtual-city-list::-webkit-scrollbar-track {
  background: transparent;
}

.optimized-virtual-city-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.virtual-scroll-container {
  position: relative;
  will-change: scroll-position;
}

.virtual-spacer {
  height: 0;
  pointer-events: none;
}

/* 复用原有的城市列表样式 - 优化版 */
.city-section.optimized {
  margin: 0 0 20px 0;
  padding: 16px 20px 20px;
  background: var(--card-bg, #fff);
  border-radius: 8px;
  border: 1px solid var(--border-color, #ebeef5);
  will-change: transform;
  /* 使用GPU加速 */
  transform: translateZ(0);
}

.section-header {
  font-size: 18px;
  color: #303133;
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  /* 优化字体渲染 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.letter-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--primary-color, #409eff), #66b3ff);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.city-count {
  font-size: 14px;
  color: #909399;
  font-weight: 400;
}

.city-rows {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
}

@media (min-width: 992px) {
  .city-rows {
    grid-template-columns: 1fr 1fr;
    gap: 8px 16px;
  }
}

/* 性能优化相关样式 */
.city-section.optimized * {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* 减少重排重绘 */
@media (prefers-reduced-motion: reduce) {
  .optimized-virtual-city-list {
    scroll-behavior: auto;
  }

  .city-section.optimized {
    transform: none;
  }
}

/* 响应式优化 */
@media (max-width: 768px) {
  .city-section.optimized {
    margin: 0 0 16px 0;
    padding: 12px 16px 16px;
  }

  .section-header {
    font-size: 16px;
    margin-bottom: 12px;
    padding-bottom: 10px;
  }

  .letter-icon {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }
}
</style>
