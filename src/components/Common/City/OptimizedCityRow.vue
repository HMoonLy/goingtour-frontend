<template>
  <div
    class="city-row optimized"
    :class="{
      'in-wishlist': isInWishlist,
      processing: isProcessing,
    }"
  >
    <div class="city-left" @click="handleCitySelect">
      <span class="city-name">{{ city.中文名 }}</span>
      <span class="city-province">{{ provinceName }}</span>
    </div>
    <div class="city-right">
      <!-- 简化的五角星收藏按钮 -->
      <div
        class="star-button"
        :class="{
          'is-favorited': isInWishlist,
          'is-processing': isProcessing,
        }"
        :title="wishlistTitle"
        @click.stop="handleWishlistToggle"
      >
        <!-- 处理中显示旋转效果 -->
        <div v-if="isProcessing" class="star-loading">⭐</div>
        <!-- 正常状态显示五角星 -->
        <div v-else class="star-icon">
          {{ isInWishlist ? '⭐' : '☆' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, defineComponent } from 'vue';

export default defineComponent({
  name: 'OptimizedCityRow',
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
  emits: ['selectCity', 'toggleWishlist'],
  setup(props, { emit }) {
    const isProcessing = ref(false);

    // 缓存省份名称计算
    const provinceName = computed(() => {
      const adcode = String(props.city.adcode || '');
      if (!adcode || adcode.length < 2) return '';

      const provinceCode = adcode.substring(0, 2);
      const provinceMap = {
        11: '北京市',
        12: '天津市',
        13: '河北省',
        14: '山西省',
        15: '内蒙古',
        21: '辽宁省',
        22: '吉林省',
        23: '黑龙江省',
        31: '上海市',
        32: '江苏省',
        33: '浙江省',
        34: '安徽省',
        35: '福建省',
        36: '江西省',
        37: '山东省',
        41: '河南省',
        42: '湖北省',
        43: '湖南省',
        44: '广东省',
        45: '广西',
        46: '海南省',
        50: '重庆市',
        51: '四川省',
        52: '贵州省',
        53: '云南省',
        54: '西藏',
        61: '陕西省',
        62: '甘肃省',
        63: '青海省',
        64: '宁夏',
        65: '新疆',
        71: '台湾省',
        81: '香港',
        82: '澳门',
      };
      return provinceMap[provinceCode] || '';
    });

    const wishlistTitle = computed(() => {
      if (isProcessing.value) return '处理中...';
      return props.isInWishlist ? '从愿望清单移除' : '添加到愿望清单';
    });

    // 防抖处理城市选择
    let selectTimeout;
    const handleCitySelect = () => {
      clearTimeout(selectTimeout);
      selectTimeout = setTimeout(() => {
        emit('selectCity', props.city);
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
          await emit('toggleWishlist', props.city);
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
.city-row.optimized {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  min-height: 36px;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background-color 0.15s ease;
  will-change: background-color;
}

.city-row.optimized:hover {
  background: var(--bg-secondary, #f5f7fa);
}

.city-row.optimized.in-wishlist {
  background: rgba(103, 194, 58, 0.08);
  border: 1px solid rgba(103, 194, 58, 0.2);
}

.city-row.optimized.processing {
  opacity: 0.8;
}

.city-left {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.city-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.city-province {
  font-size: 12px;
  color: #909399;
}

.city-right {
  display: flex;
  align-items: center;
}

/* 简化的五角星收藏按钮 */
.star-button {
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  user-select: none;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  will-change: transform;
}

.star-button:hover {
  transform: scale(1.2);
  background: rgba(255, 193, 7, 0.1);
}

.star-button.is-favorited {
  transform: scale(1.1);
}

.star-button.is-favorited:hover {
  transform: scale(1.3);
}

.star-button.is-processing {
  cursor: not-allowed;
  opacity: 0.7;
}

.star-icon {
  transition: all 0.2s ease;
  font-size: 16px;
}

.star-button.is-favorited .star-icon {
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

.star-loading {
  animation: star-pulse 1s ease-in-out infinite;
  font-size: 16px;
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

/* 减少重排重绘的优化 */
.city-row.optimized * {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .city-row.optimized {
    min-height: 40px;
    padding: 8px 12px;
  }

  .wishlist-toggle {
    width: 32px;
    height: 32px;
  }

  .city-name {
    font-size: 15px;
  }
}
</style>
