<template>
  <div
    class="city-card"
    :class="{
      'in-wishlist': isInWishlist,
      'processing': isProcessing,
    }"
    @click="handleCitySelect"
  >
    <!-- 收藏状态指示器 -->
    <div v-if="isInWishlist" class="wishlist-indicator">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    </div>

    <div class="card-content">
      <div class="city-info">
        <h3 class="city-name">{{ city.中文名 }}</h3>
        <p class="city-province">{{ city.省份 }}</p>
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
    isProcessing: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["selectCity"],
  setup(props, { emit }) {
    // 省份信息映射
    const provinceInfo = computed(() => {
      const adcode = String(props.city.adcode || "");
      if (!adcode || adcode.length < 2) return { name: "", short: "", color: "#91a8d0" };

      const provinceCode = adcode.substring(0, 2);
      const provinceMap = {
        11: { name: "北京市", short: "京", color: "#e74c3c", type: "直辖市" },
        12: { name: "天津市", short: "津", color: "#3498db", type: "直辖市" },
        13: { name: "河北省", short: "冀", color: "#f39c12", type: "省份" },
        14: { name: "山西省", short: "晋", color: "#9b59b6", type: "省份" },
        15: { name: "内蒙古", short: "蒙", color: "#1abc9c", type: "自治区" },
        21: { name: "辽宁省", short: "辽", color: "#34495e", type: "省份" },
        22: { name: "吉林省", short: "吉", color: "#e67e22", type: "省份" },
        23: { name: "黑龙江省", short: "黑", color: "#2c3e50", type: "省份" },
        31: { name: "上海市", short: "沪", color: "#e74c3c", type: "直辖市" },
        32: { name: "江苏省", short: "苏", color: "#3498db", type: "省份" },
        33: { name: "浙江省", short: "浙", color: "#2ecc71", type: "省份" },
        34: { name: "安徽省", short: "皖", color: "#f39c12", type: "省份" },
        35: { name: "福建省", short: "闽", color: "#9b59b6", type: "省份" },
        36: { name: "江西省", short: "赣", color: "#1abc9c", type: "省份" },
        37: { name: "山东省", short: "鲁", color: "#34495e", type: "省份" },
        41: { name: "河南省", short: "豫", color: "#e67e22", type: "省份" },
        42: { name: "湖北省", short: "鄂", color: "#2c3e50", type: "省份" },
        43: { name: "湖南省", short: "湘", color: "#e74c3c", type: "省份" },
        44: { name: "广东省", short: "粤", color: "#3498db", type: "省份" },
        45: { name: "广西", short: "桂", color: "#2ecc71", type: "自治区" },
        46: { name: "海南省", short: "琼", color: "#f39c12", type: "省份" },
        50: { name: "重庆市", short: "渝", color: "#e74c3c", type: "直辖市" },
        51: { name: "四川省", short: "川", color: "#9b59b6", type: "省份" },
        52: { name: "贵州省", short: "贵", color: "#1abc9c", type: "省份" },
        53: { name: "云南省", short: "云", color: "#34495e", type: "省份" },
        54: { name: "西藏", short: "藏", color: "#e67e22", type: "自治区" },
        61: { name: "陕西省", short: "陕", color: "#2c3e50", type: "省份" },
        62: { name: "甘肃省", short: "甘", color: "#e74c3c", type: "省份" },
        63: { name: "青海省", short: "青", color: "#3498db", type: "省份" },
        64: { name: "宁夏", short: "宁", color: "#2ecc71", type: "自治区" },
        65: { name: "新疆", short: "新", color: "#f39c12", type: "自治区" },
        71: { name: "台湾省", short: "台", color: "#9b59b6", type: "省份" },
        81: { name: "香港", short: "港", color: "#1abc9c", type: "特别行政区" },
        82: { name: "澳门", short: "澳", color: "#34495e", type: "特别行政区" },
      };
      return provinceMap[provinceCode] || { name: "", short: "", color: "#91a8d0", type: "其他" };
    });

    // 计算属性
    const provinceName = computed(() => provinceInfo.value.name);
    const provinceShortName = computed(() => provinceInfo.value.short);
    const provinceColor = computed(() => provinceInfo.value.color);
    const provinceColorLight = computed(() => provinceInfo.value.color + '20'); // 添加透明度
    const cityTypeLabel = computed(() => provinceInfo.value.type);

    // 防抖处理城市选择
    let selectTimeout;
    const handleCitySelect = () => {
      clearTimeout(selectTimeout);
      selectTimeout = setTimeout(() => {
        emit("selectCity", props.city);
      }, 100);
    };

    return {
      provinceName,
      provinceShortName,
      provinceColor,
      provinceColorLight,
      cityTypeLabel,
      handleCitySelect,
    };
  },
});
</script>

<style scoped>
/* ===== 简洁城市卡片设计 ===== */
.city-card {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  min-height: 50px;
  display: flex;
  flex-direction: column;
}

.city-card:hover {
  border-color: #91a8d0;
  box-shadow: 0 2px 8px rgba(145, 168, 208, 0.15);
}

.city-card.in-wishlist {
  border-color: #f7cac9;
  background: rgba(247, 202, 201, 0.05);
}

.city-card.in-wishlist:hover {
  border-color: #f7cac9;
  box-shadow: 0 2px 8px rgba(247, 202, 201, 0.2);
}

.city-card.processing {
  opacity: 0.6;
  cursor: wait;
}

/* ===== 卡片内容 ===== */
.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.city-info {
  flex: 1;
}

.city-name {
  margin: 0 0 2px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  line-height: 1.3;
  word-break: break-word;
}

.city-province {
  margin: 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
}

/* ===== 收藏状态 ===== */
.wishlist-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 16px;
  height: 16px;
  color: #f7cac9;
}

/* ===== 响应式设计 ===== */
@media (max-width: 768px) {
  .city-card {
    padding: 12px;
    min-height: 70px;
  }

  .city-name {
    font-size: 15px;
  }

  .city-province {
    font-size: 12px;
  }

  .wishlist-indicator {
    top: 8px;
    right: 8px;
    width: 14px;
    height: 14px;
  }
}

@media (max-width: 480px) {
  .city-card {
    padding: 10px;
    min-height: 65px;
  }

  .city-name {
    font-size: 14px;
  }

  .city-province {
    font-size: 11px;
  }
}

/* ===== 性能优化 ===== */
.city-card * {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
</style>
