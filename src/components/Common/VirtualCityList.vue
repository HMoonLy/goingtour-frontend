<template>
  <div
ref="containerRef" class="virtual-city-list"
>
    <!-- 虚拟滚动容器 -->
    <div
      class="virtual-scroll-container"
      :style="{ height: containerHeight + 'px' }"
    >
      <!-- 虚拟占位空间 -->
      <div
class="virtual-spacer" :style="{ height: offsetY + 'px' }" />

      <!-- 可见项目 -->
      <div
        v-for="group in visibleGroups"
        :id="'letter-' + group.letter"
        :key="group.letter"
        :ref="
          (el) => {
            if (el) groupRefs[group.letter] = el;
          }
        "
        class="city-section"
      >
        <h2>
          <i class="letter-icon">{{ group.letter }}</i>
        </h2>
        <div class="city-rows">
          <div
            v-for="city in group.cities"
            :key="city.adcode"
            class="city-row"
            :class="{
              'in-wishlist': wishlistStore.isCityInWishlist(city.adcode),
            }"
          >
            <div class="city-left" @click="$emit('selectCity', city)">
              <span class="city-name">{{ city.中文名 }}</span>
              <span class="city-province">{{ getProvinceName(city) }}</span>
            </div>
            <div class="city-right">
              <el-button
                type="default"
                size="small"
                circle
                class="wishlist-toggle"
                :class="{
                  active: wishlistStore.isCityInWishlist(city.adcode),
                }"
                :title="
                  wishlistStore.isCityInWishlist(city.adcode)
                    ? '从愿望清单移除'
                    : '添加到愿望清单'
                "
                @click.stop="$emit('toggleWishlist', city)"
              >
                <el-icon size="14">
                  <StarFilled
                    v-if="wishlistStore.isCityInWishlist(city.adcode)"
                  />
                  <Star v-else />
                </el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 虚拟占位空间（底部） -->
      <div class="virtual-spacer" :style="{ height: endSpacerHeight + 'px' }" />
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
} from "vue";
import { Star, StarFilled } from "@element-plus/icons-vue";
import { useWishlistStore } from "@/store/wishlist.js";

export default {
  name: "VirtualCityList",
  components: {
    Star,
    StarFilled,
  },
  props: {
    cityGroups: {
      type: Array,
      required: true,
    },
  },
  emits: ["selectCity", "toggleWishlist"],
  setup(props) {
    const containerRef = ref(null);
    const wishlistStore = useWishlistStore();
    const groupRefs = ref({});

    // 虚拟滚动参数
    const itemHeight = 90; // 每个分组的估算高度
    const containerHeight = ref(600);
    const scrollTop = ref(0);
    const visibleCount = ref(10);
    const offsetY = ref(0);

    // 计算可见的分组
    const visibleGroups = computed(() => {
      if (!props.cityGroups.length) return [];

      const startIndex = Math.floor(scrollTop.value / itemHeight);
      const endIndex = Math.min(
        startIndex + visibleCount.value,
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

    // 滚动处理
    const handleScroll = () => {
      if (!containerRef.value) return;
      scrollTop.value = containerRef.value.scrollTop;
    };

    // 更新容器高度
    const updateContainerHeight = () => {
      if (containerRef.value) {
        containerHeight.value = containerRef.value.clientHeight;
        visibleCount.value = Math.ceil(containerHeight.value / itemHeight) + 2;
      }
    };

    // 获取省份名称（复制自原组件）
    const getProvinceName = (city) => {
      const adcode = String(city.adcode || "");
      if (!adcode || adcode.length < 2) {
        return "";
      }

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
    };

    // 响应式更新
    const resizeObserver = ref(null);

    onMounted(() => {
      updateContainerHeight();

      if (containerRef.value) {
        containerRef.value.addEventListener("scroll", handleScroll, {
          passive: true,
        });

        // 监听容器大小变化
        resizeObserver.value = new ResizeObserver(updateContainerHeight);
        resizeObserver.value.observe(containerRef.value);
      }

      // 监听窗口大小变化
      window.addEventListener("resize", updateContainerHeight);
    });

    onBeforeUnmount(() => {
      if (containerRef.value) {
        containerRef.value.removeEventListener("scroll", handleScroll);
      }

      if (resizeObserver.value) {
        resizeObserver.value.disconnect();
      }

      window.removeEventListener("resize", updateContainerHeight);
    });

    // 监听城市数据变化，重新计算
    watch(
      () => props.cityGroups.length,
      () => {
        nextTick(() => {
          updateContainerHeight();
        });
      },
    );

    return {
      containerRef,
      groupRefs,
      wishlistStore,
      visibleGroups,
      containerHeight,
      offsetY,
      endSpacerHeight,
      getProvinceName,
    };
  },
};
</script>

<style scoped>
.virtual-city-list {
  height: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.virtual-scroll-container {
  position: relative;
}

.virtual-spacer {
  height: 0;
}

/* 复用原有的城市列表样式 */
.city-section {
  margin: 0 0 24px 0;
  padding: 20px;
  background: var(--card-bg, #fff);
  border-radius: 8px;
  border: 1px solid var(--border-color, #ebeef5);
  transition: all 0.3s;
}

.city-section h2 {
  font-size: 20px;
  color: #303133;
  margin: 0 0 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  font-weight: 600;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--card-bg, #fff);
}

.letter-icon {
  font-style: normal;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--bg-secondary, #f5f7fa);
  border: 1px solid var(--border-color, #eaeef2);
  color: var(--text-secondary, #606266);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 12px;
  font-weight: 600;
}

.city-rows {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}

@media (min-width: 992px) {
  .city-rows {
    grid-template-columns: 1fr 1fr;
  }
}

.city-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  min-height: 36px;
  padding: 6px 10px;
  border-radius: 6px;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.city-row:hover {
  background: var(--bg-secondary, #f5f7fa);
}

.city-row.in-wishlist {
  background: var(--bg-secondary, #f8f9fa);
  border: 1px solid var(--border-color, #eaeef2);
}

.city-left {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.city-left .city-name {
  font-size: 14px;
  color: #303133;
}

.city-left .city-province {
  font-size: 12px;
  color: #909399;
}

.city-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.wishlist-toggle {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-color, #eaeef2);
  background: var(--btn-bg, #fff);
  color: var(--text-secondary, #606266);
}

.wishlist-toggle.active {
  background: var(--primary-color, #409eff);
  border-color: var(--primary-color, #409eff);
  color: #fff;
  animation: wishlist-pop 120ms ease-out;
}

.wishlist-toggle:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.25);
}

@keyframes wishlist-pop {
  0% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}
</style>
