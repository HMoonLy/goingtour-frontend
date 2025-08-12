<template>
  <div
    class="city-card modern"
    :class="{
      'is-favorited': isInWishlist,
      'is-processing': isProcessing,
    }"
    @click="handleCitySelect"
  >
    <!-- 收藏按钮 - 右上角 -->
    <div
      class="favorite-button"
      :class="{ 'is-favorited': isInWishlist, 'is-processing': isProcessing }"
      :title="wishlistTitle"
      @click.stop="handleWishlistToggle"
    >
      <div class="heart-container">
        <!-- 处理中显示加载动画 -->
        <div v-if="isProcessing"
class="heart-loading">
          <div class="loading-spinner" />
        </div>
        <!-- 正常状态显示心形图标 -->
        <div v-else
class="heart-icon">
          <svg
            :class="{ filled: isInWishlist }"
            viewBox="0 0 24 24"
            width="14"
            height="14"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- 城市信息 -->
    <div class="city-info">
      <div class="city-header">
        <h3 class="city-name">
          {{ city.中文名 }}
        </h3>
        <div class="city-meta">
          <span class="province-name">{{ provinceName }}</span>
          <!-- 可扩展：添加热度标签等 -->
          <div v-if="cityHotness"
class="hotness-indicator">
            <span class="hotness-badge">{{ cityHotness }}</span>
          </div>
        </div>
      </div>

      <!-- 底部状态指示 -->
      <div class="card-footer">
        <div class="status-indicator">
          <span v-if="isInWishlist"
class="wishlist-badge">已收藏</span>
          <span v-else
class="normal-badge">点击选择</span>
        </div>
        <div class="action-hint">
          <svg width="14"
height="14" viewBox="0 0 24 24" class="arrow-icon">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, defineComponent } from "vue";

export default defineComponent({
  name: "CityCard",
  props: {
    city: {
      type: Object,
      required: true,
    },
    isInWishlist: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["selectCity", "toggleWishlist"],
  setup(props, { emit }) {
    const isProcessing = ref(false);

    // 计算省份名称
    const provinceName = computed(() => {
      const adcode = String(props.city.adcode || "");
      if (!adcode || adcode.length < 2) return "";

      const provinceCode = adcode.substring(0, 2);
      const provinceMap = {
        11: "北京市",
        12: "天津市",
        13: "河北省",
        14: "山西省",
        15: "内蒙古",
        21: "辽宁省",
        22: "吉林省",
        23: "黑龙江省",
        31: "上海市",
        32: "江苏省",
        33: "浙江省",
        34: "安徽省",
        35: "福建省",
        36: "江西省",
        37: "山东省",
        41: "河南省",
        42: "湖北省",
        43: "湖南省",
        44: "广东省",
        45: "广西",
        46: "海南省",
        50: "重庆市",
        51: "四川省",
        52: "贵州省",
        53: "云南省",
        54: "西藏",
        61: "陕西省",
        62: "甘肃省",
        63: "青海省",
        64: "宁夏",
        65: "新疆",
        71: "台湾省",
        81: "香港",
        82: "澳门",
      };
      return provinceMap[provinceCode] || "";
    });

    // 计算城市热度（可扩展功能）
    const cityHotness = computed(() => {
      // 热门城市列表，可以从props或store获取
      const hotCities = [
        "北京市",
        "上海市",
        "深圳市",
        "广州市",
        "杭州市",
        "成都市",
        "西安市",
        "武汉市",
        "南京市",
        "重庆市",
      ];
      return hotCities.includes(props.city.中文名) ? "热门" : null;
    });

    const wishlistTitle = computed(() => {
      if (isProcessing.value) return "处理中...";
      return props.isInWishlist ? "从收藏中移除" : "添加到收藏";
    });

    // 防抖处理城市选择
    let selectTimeout;
    const handleCitySelect = () => {
      clearTimeout(selectTimeout);
      selectTimeout = setTimeout(() => {
        emit("selectCity", props.city);
      }, 100);
    };

    // 防抖处理收藏切换
    let toggleTimeout;
    const handleWishlistToggle = () => {
      if (isProcessing.value) return;

      clearTimeout(toggleTimeout);
      toggleTimeout = setTimeout(async () => {
        isProcessing.value = true;

        try {
          await emit("toggleWishlist", props.city);
        } finally {
          // 添加短暂延迟，让用户看到反馈
          setTimeout(() => {
            isProcessing.value = false;
          }, 300);
        }
      }, 50);
    };

    return {
      isProcessing,
      provinceName,
      cityHotness,
      wishlistTitle,
      handleCitySelect,
      handleWishlistToggle,
    };
  },
});
</script>

<style scoped>
/* ===== 现代卡片基础样式 ===== */
.city-card.modern {
  position: relative;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  will-change: transform;

  /* 微妙阴影 */
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.06);
}

/* 悬浮效果 */
.city-card.modern:hover {
  transform: translateY(-4px);
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.12),
    0 4px 10px rgba(0, 0, 0, 0.08);
  border-color: rgba(64, 158, 255, 0.2);
}

/* 已收藏状态 */
.city-card.modern.is-favorited {
  background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
  border-color: rgba(255, 193, 7, 0.3);
  box-shadow:
    0 2px 8px rgba(255, 193, 7, 0.15),
    0 1px 3px rgba(0, 0, 0, 0.08);
}

.city-card.modern.is-favorited:hover {
  border-color: rgba(255, 193, 7, 0.4);
  box-shadow:
    0 12px 30px rgba(255, 193, 7, 0.2),
    0 6px 15px rgba(0, 0, 0, 0.1);
}

/* 处理中状态 */
.city-card.modern.is-processing {
  opacity: 0.8;
  pointer-events: none;
}

/* ===== 收藏按钮样式 ===== */
.favorite-button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 2;
  cursor: pointer;

  /* 初始状态稍微透明 */
  opacity: 0.7;
}

.favorite-button:hover {
  opacity: 1;
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.favorite-button.is-favorited {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  border-color: rgba(255, 193, 7, 0.3);
  opacity: 1;
}

.favorite-button.is-favorited:hover {
  background: linear-gradient(135deg, #ffb300 0%, #ff8f00 100%);
  box-shadow: 0 6px 20px rgba(255, 193, 7, 0.4);
}

/* 心形图标容器 */
.heart-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.heart-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.heart-icon svg {
  transition: all 0.3s ease;
  fill: #9ca3af;
  stroke: none;
  /* 确保SVG在容器中完全居中 */
  display: block;
  margin: 0;
}

.heart-icon svg.filled {
  fill: #ffffff;
  animation: heartPulse 0.6s ease;
}

.favorite-button:not(.is-favorited) .heart-icon svg {
  fill: none;
  stroke: #6b7280;
  stroke-width: 1.5;
}

.favorite-button:not(.is-favorited):hover .heart-icon svg {
  stroke: #ef4444;
}

/* 加载动画 */
.heart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes heartPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* ===== 城市信息样式 ===== */
.city-info {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 60px;
}

.city-header {
  flex: 1;
  margin-bottom: 8px;
}

.city-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
  line-height: 1.3;
  /* 防止文字过长 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.city-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.province-name {
  font-size: 12px;
  color: #6b7280;
  font-weight: 400;
}

.hotness-indicator {
  margin-left: auto;
}

.hotness-badge {
  display: inline-block;
  padding: 2px 8px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 11px;
  font-weight: 500;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ===== 底部状态栏 ===== */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.status-indicator {
  flex: 1;
}

.wishlist-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: rgba(34, 197, 94, 0.1);
  color: #059669;
  font-size: 12px;
  font-weight: 500;
  border-radius: 12px;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.normal-badge {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 400;
}

.action-hint {
  display: flex;
  align-items: center;
  color: #9ca3af;
  transition: all 0.3s ease;
}

.city-card.modern:hover .action-hint {
  color: #6366f1;
  transform: translateX(2px);
}

.arrow-icon {
  transition: all 0.3s ease;
}

/* ===== 响应式设计 ===== */
@media (max-width: 768px) {
  .city-card.modern {
    padding: 10px;
    min-height: 50px;
  }

  .favorite-button {
    width: 24px;
    height: 24px;
    top: 6px;
    right: 6px;
  }

  .city-name {
    font-size: 14px;
  }

  .province-name {
    font-size: 11px;
  }
}

/* ===== 暗色模式支持 ===== */
@media (prefers-color-scheme: dark) {
  .city-card.modern {
    background: #1f2937;
    border-color: rgba(255, 255, 255, 0.1);
    color: #f9fafb;
  }

  .city-card.modern.is-favorited {
    background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
    border-color: rgba(255, 193, 7, 0.3);
  }

  .city-name {
    color: #f9fafb;
  }

  .province-name {
    color: #9ca3af;
  }

  .favorite-button {
    background: rgba(31, 41, 55, 0.9);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

/* ===== 性能优化 ===== */
.city-card.modern * {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* 减少重排重绘 */
@media (prefers-reduced-motion: reduce) {
  .city-card.modern,
  .favorite-button,
  .heart-icon svg,
  .action-hint {
    transition: none;
  }

  .city-card.modern:hover {
    transform: none;
  }
}
</style>
