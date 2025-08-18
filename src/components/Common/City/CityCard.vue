<template>
  <div
    class="city-card"
    :class="{
      'in-wishlist': isInWishlist,
      'processing': isProcessing,
    }"
    @click="handleCitySelect"
  >
    <div class="card-content">
      <div class="city-info">
        <h4 class="city-name">{{ city.中文名 }}</h4>
        <p class="city-province">{{ provinceName }}</p>
      </div>
      
      <div class="card-actions">
        <div
          class="wishlist-button"
          :class="{
            'is-favorited': isInWishlist,
            'is-processing': isProcessing,
          }"
          :title="wishlistTitle"
          @click.stop="handleWishlistToggle"
        >
          <div v-if="isProcessing" class="loading-icon">⭐</div>
          <div v-else class="star-icon">
            {{ isInWishlist ? "⭐" : "☆" }}
          </div>
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

    // 缓存省份名称计算
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

    const wishlistTitle = computed(() => {
      if (isProcessing.value) return "处理中...";
      return props.isInWishlist ? "从愿望清单移除" : "添加到愿望清单";
    });

    // 防抖处理城市选择
    let selectTimeout;
    const handleCitySelect = () => {
      clearTimeout(selectTimeout);
      selectTimeout = setTimeout(() => {
        emit("selectCity", props.city);
      }, 100);
    };

    // 防抖处理心愿清单切换
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
          }, 150);
        }
      }, 50);
    };

    return {
      isProcessing,
      provinceName,
      wishlistTitle,
      handleCitySelect,
      handleWishlistToggle,
    };
  },
});
</script>

<style scoped>
.city-card {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-height: 100px;
  display: flex;
  flex-direction: column;
}

.city-card:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.city-card.in-wishlist {
  border-color: #67c23a;
  background: rgba(103, 194, 58, 0.05);
}

.city-card.in-wishlist:hover {
  border-color: #67c23a;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
}

.city-card.processing {
  opacity: 0.8;
  cursor: wait;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  height: 100%;
}

.city-info {
  flex: 1;
  min-width: 0;
}

.city-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  word-break: break-word;
}

.city-province {
  margin: 0;
  font-size: 13px;
  color: #909399;
  line-height: 1.3;
}

.card-actions {
  flex-shrink: 0;
  margin-left: 12px;
}

.wishlist-button {
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  user-select: none;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  will-change: transform;
}

.wishlist-button:hover {
  transform: scale(1.2);
  background: rgba(255, 193, 7, 0.1);
}

.wishlist-button.is-favorited {
  transform: scale(1.1);
}

.wishlist-button.is-favorited:hover {
  transform: scale(1.3);
}

.wishlist-button.is-processing {
  cursor: not-allowed;
  opacity: 0.7;
}

.star-icon {
  transition: all 0.2s ease;
  font-size: 18px;
}

.wishlist-button.is-favorited .star-icon {
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

.loading-icon {
  animation: star-pulse 1s ease-in-out infinite;
  font-size: 18px;
  color: #ffd700;
}

@keyframes star-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .city-card {
    padding: 12px;
    min-height: 80px;
  }

  .city-name {
    font-size: 15px;
  }

  .city-province {
    font-size: 12px;
  }

  .wishlist-button {
    width: 32px;
    height: 32px;
  }

  .star-icon,
  .loading-icon {
    font-size: 16px;
  }
}

/* 减少重排重绘的优化 */
.city-card * {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
</style>
