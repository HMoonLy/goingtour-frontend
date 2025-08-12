<template>
  <div ref="containerRef" class="virtual-city-grid-container">
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
            <h2 class="group-title">
              {{ getGroupTitle(group.letter) }}
            </h2>
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

    // 不再需要底部占位高度
    const endSpacerHeight = computed(() => {
      return 0; // 移除虚拟占位空间
    });

    // 获取分组标题
    const getGroupTitle = (letter) => {
      const cityCount =
        props.cityGroups.find((g) => g.letter === letter)?.cities.length || 0;

      if (letter === "热门") {
        return "热门城市";
      }

      // 根据字母返回相应的中文描述
      const letterDescriptions = {
        A: "A",
        B: "B字母开头",
        C: "C字母开头",
        D: "D字母开头",
        E: "E字母开头",
        F: "F字母开头",
        G: "G字母开头",
        H: "H字母开头",
        I: "I字母开头",
        J: "J字母开头",
        K: "K字母开头",
        L: "L字母开头",
        M: "M字母开头",
        N: "N字母开头",
        O: "O字母开头",
        P: "P字母开头",
        Q: "Q字母开头",
        R: "R字母开头",
        S: "S字母开头",
        T: "T字母开头",
        U: "U字母开头",
        V: "V字母开头",
        W: "W字母开头",
        X: "X字母开头",
        Y: "Y字母开头",
        Z: "Z字母开头",
      };

      return letterDescriptions[letter] || `${letter}字母开头`;
    };

    // 移除原有的滚动处理逻辑

    // 简化生命周期钩子 - 移除滚动监听
    onMounted(() => {
      // 不再需要复杂的滚动和容器高度监听
      console.log('VirtualCityGrid mounted - 显示所有城市分组');
    });

    onBeforeUnmount(() => {
      // 清理工作已不需要
    });

    // 监听城市数据变化 - 简化版
    watch(
      () => props.cityGroups.length,
      () => {
        console.log('城市数据变化:', props.cityGroups.length);
      }
    );

    return {
      containerRef,
      visibleGroups,
      getGroupTitle,
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  
  /* 固定高度和内边距，解决行高问题 */
  min-height: 80px;
  padding: 20px 0;
  display: flex;
  align-items: center;
}

.group-title-container {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  margin-left: 10px;
}

.group-letter-badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  flex-shrink: 0;
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
    background: rgba(31, 41, 55, 0.95);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .group-title {
    color: #f9fafb;
  }

  .city-count {
    color: #9ca3af;
    background: rgba(156, 163, 175, 0.1);
  }

  .virtual-scroll-wrapper::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.3);
  }

  .virtual-scroll-wrapper::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.5);
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
