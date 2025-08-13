<template>
  <div class="simple-city-grid">
    <!-- 性能提示信息 -->
    <div
v-if="cityGroups.length > 10" class="performance-notice"
>
      <el-icon><InfoFilled /></el-icon>
      <span>正在展示{{ totalCityCount }}个城市，请耐心等待加载完成</span>
    </div>

    <!-- 城市分组展示 -->
    <div
      v-for="group in cityGroups"
      :id="'letter-' + group.letter"
      :key="group.letter"
      class="city-group-section"
    >
      <!-- 分组标题 -->
      <div class="group-header">
        <div class="group-title-container">
          <div class="group-letter-badge">
            {{ group.letter }}
          </div>
          <h2 class="group-title">
            <span class="city-count">({{ group.cities.length }})</span>
          </h2>
        </div>
      </div>

      <!-- 城市卡片网格 - 懒加载优化 -->
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
</template>

<script>
import { defineComponent, computed } from "vue";
import { InfoFilled } from "@element-plus/icons-vue";
import CityGridList from "./CityGridList.vue";

export default defineComponent({
  name: "SimpleCityGrid",
  components: {
    CityGridList,
    InfoFilled,
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
    // 计算总城市数量
    const totalCityCount = computed(() => {
      return props.cityGroups.reduce((total, group) => {
        return total + (group.cities?.length || 0);
      }, 0);
    });

    return {
      totalCityCount,
    };
  },
});
</script>

<style scoped>
/* ===== 简单网格容器样式 ===== */
.simple-city-grid {
  width: 100%;
}

/* ===== 性能提示样式 ===== */
.performance-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #fff7e6 0%, #fffbf0 100%);
  border: 1px solid #ffe7ba;
  border-left: 4px solid #e6a23c;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  color: #d46b08;
  font-size: 14px;
  font-weight: 500;
}

.performance-notice .el-icon {
  color: #e6a23c;
  font-size: 18px;
  flex-shrink: 0;
}

/* ===== 城市分组样式 ===== */
.city-group-section {
  margin-bottom: 40px;
  padding: 0 20px;

  /* 性能优化 */
  will-change: transform;
  transform: translateZ(0);
}

/* ===== 分组标题样式 ===== */
.group-header {
  margin-bottom: 24px;
  padding: 24px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);

  /* 固定高度解决行高问题 */
  min-height: 90px;
  display: flex;
  align-items: center;

  /* 吸顶效果 */
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
  margin: 0 -20px 24px -20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.group-title-container {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
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

  /* 固定行高 */
  line-height: 1.2;

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
  white-space: nowrap;
}

/* ===== 网格容器样式 ===== */
.group-grid {
  margin-bottom: 20px;
}

/* ===== 响应式设计 ===== */
@media (max-width: 1024px) {
  .city-group-section {
    padding: 0 16px;
    margin-bottom: 32px;
  }

  .group-header {
    margin-bottom: 20px;
    padding: 16px 0;
    min-height: 72px;
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
  .city-group-section {
    padding: 0 12px;
    margin-bottom: 24px;
  }

  .group-header {
    min-height: 64px;
    padding: 12px 0;
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
.simple-city-grid * {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* 减少重排重绘 */
@media (prefers-reduced-motion: reduce) {
  .city-group-section {
    transform: none;
  }
}

/* ===== 打印样式 ===== */
@media print {
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
