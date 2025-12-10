<template>
  <div class="page-shell destinations" ref="pageShell">
    <!-- 英雄横幅（大图+搜索） -->
    <DestinationsHero
      ref="heroRef"
      v-model="searchKeyword"
      @search="debouncedSearch"
      @clear="clearSearch"
    />

    <!-- 内容区域 -->
    <div class="cities-content-wrapper">
      <div ref="citiesContent" class="cities-content">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="10" animated />
        </div>

        <!-- 搜索结果 -->
        <DestinationsSearchResults
          v-else-if="isSearchMode"
          :results="searchResults"
          @select="selectCity"
        />

        <!-- 常规展示模式（整页流式） -->
        <template v-else>
          <!-- 热门目的地 -->
          <DestinationsHot
            :destinations="hotDestinations"
            @select="selectCity"
          />

          <!-- 当季推荐 -->
          <DestinationsSeasonal
            v-model:month="selectedMonth"
            :months="months"
            :cities="seasonalDisplayCities"
            @select="selectCity"
          />

          <!-- 全国城市 -->
          <DestinationsAllCities
              :city-groups="cityGroups"
            :wishlist-items="
              wishlist.wishlistItems.value || wishlist.wishlistItems || []
            "
            :is-wishlist-mode="isWishlistMode"
            @select="selectCity"
            @toggle-wishlist-mode="toggleWishlistMode"
            />
        </template>
            </div>

      <!-- 字母导航 -->
      <Transition name="nav-fade">
        <DestinationsLetterNav
          v-show="showLetterNav"
          :active-letter="activeLetter"
          :hot-label="hotLabel"
          :show-indicator="showScrollIndicator"
          @change="scrollToLetter"
        />
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import pinyin from "pinyin";

import { createCachedRequest, debounce } from "@/utils/api/apiOptimizer.js";
import { useWishlist } from "@/composables/user/useWishlist.js";
import { hotRegions, findCity, seasonalByMonth } from "@/data/destinations.js";
import {
  pagePerformance,
  imagePerformance,
} from "@/utils/performance/performanceMonitor.js";
import {
  interactionMonitor,
  createDebouncedHandler,
} from "@/utils/system/interactionMonitor.js";

// Components
import DestinationsHero from "@/components/Trip/Destinations/DestinationsHero.vue";
import DestinationsHot from "@/components/Trip/Destinations/DestinationsHot.vue";
import DestinationsSeasonal from "@/components/Trip/Destinations/DestinationsSeasonal.vue";
import DestinationsSearchResults from "@/components/Trip/Destinations/DestinationsSearchResults.vue";
import DestinationsAllCities from "@/components/Trip/Destinations/DestinationsAllCities.vue";
import DestinationsLetterNav from "@/components/Trip/Destinations/DestinationsLetterNav.vue";

    const router = useRouter();
    const route = useRoute();
    const wishlist = useWishlist();

    // 响应式数据
    const searchKeyword = ref("");
    const allCities = ref([]);
    const loading = ref(true);
    const isSearchMode = ref(false);
    const searchResults = ref([]);
    const hotLabel = "热门";
    const activeLetter = ref(hotLabel);
    const showScrollIndicator = ref(false);
    const showLetterNav = ref(false);
    const heroRef = ref(null);



    // 当季推荐静态数据
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const selectedMonth = ref(new Date().getMonth() + 1);

    const seasonalDisplayCities = computed(() => {
      const names = seasonalByMonth[selectedMonth.value] || [];
      const mapped = names.map((n) => {
        const hit = findCity(n);
        return {
          name: n,
          adcode: hit?.adcode || "",
          cover: hit?.cover || "",
          province: "",
        };
      });
      return mapped;
    });

    // 热门目的地安全计算属性（显示前12个）
    const hotDestinations = computed(() => {
      if (!hotRegions || !Array.isArray(hotRegions) || hotRegions.length === 0) {
        return [];
      }
      return (hotRegions[0]?.cities || []).slice(0, 8);
    });

// 热门城市列表 (Used for adding random recommendations if needed, keeping logic)
    const hotCities = computed(() => {
      if (!hotRegions || !Array.isArray(hotRegions) || hotRegions.length === 0) {
        return [];
      }
      return (hotRegions[0]?.cities || []).map((c) => ({
        中文名: c.name,
        adcode: c.adcode,
      }));
    });

    // 原始城市数据加载函数
    const fetchCityData = async () => {
      const response = await fetch("/data/city-codes.json");
      if (!response.ok) {
        throw new Error(`加载城市数据失败: ${response.status}`);
      }
      return await response.json();
    };

    // 带缓存的城市数据加载函数
    const cachedFetchCityData = createCachedRequest(fetchCityData, {
      cacheKey: "city-data",
      ttl: 30 * 60 * 1000, // 缓存30分钟
      enableCache: true,
    });

    // 加载城市数据
    const loadCityData = async () => {
      pagePerformance.start("city-data-load");
      loading.value = true;
      try {
        const cityData = await cachedFetchCityData();

        // 过滤只保留市级城市
        allCities.value = cityData.filter((city) => {
          const name = city.中文名 || "";
          return (
            name.includes("市") ||
            name.includes("自治州") ||
            name.includes("地区") ||
            name.includes("盟")
          );
        });

        pagePerformance.end();
      } catch (error) {
        console.error("加载城市数据失败:", error);
        ElMessage.error("城市数据加载失败，请刷新重试");
        allCities.value = [];
        pagePerformance.end();
      } finally {
        loading.value = false;
      }
    };

    // 按首字母分组城市数据
    const cityGroups = computed(() => {
      if (!allCities.value || !Array.isArray(allCities.value)) {
        return [];
      }

      const groups = {};

      // 使用汉字拼音首字母作为分组键
      allCities.value.forEach((city) => {
        const cityName = city.中文名 || "";
        if (!cityName) return;

        try {
          // 获取城市名的拼音首字母
          const firstLetter = pinyin(cityName[0], {
            style: pinyin.STYLE_FIRST_LETTER,
          })[0][0].toUpperCase();

          // 初始化字母分组
          if (!groups[firstLetter]) {
            groups[firstLetter] = {
              letter: firstLetter,
              cities: [],
            };
          }

          // 将城市添加到对应字母分组
          groups[firstLetter].cities.push(city);
        } catch (e) {
          console.warn("处理城市拼音失败:", cityName, e);
        }
      });

      // 转换为数组并按字母排序
      return Object.values(groups).sort((a, b) => a.letter.localeCompare(b.letter));
    });

    // 搜索功能
    const searchCities = () => {
      const keyword = searchKeyword.value.trim().toLowerCase();
      if (!keyword) {
        clearSearch();
        return;
      }

      isSearchMode.value = true;

      // 在城市名、省份、拼音等字段中搜索
      if (!allCities.value || !Array.isArray(allCities.value)) {
        searchResults.value = [];
        return;
      }

      searchResults.value = allCities.value.filter((city) => {
        const cityName = city.中文名 || "";
        const province = city.province || "";

        // 简单模糊匹配，可以根据需要扩展
        return cityName.includes(keyword) || province.includes(keyword);
      });
    };

    // 清除搜索
    const clearSearch = () => {
      searchKeyword.value = "";
      isSearchMode.value = false;
      searchResults.value = [];
    };

    // 防抖搜索
    const debouncedSearch = debounce(searchCities, 300);

    // 选择城市
    const selectCity = (city) => {
      console.log("选择城市:", city);
      
      if (isWishlistMode.value) {
        // 心愿清单模式：添加到心愿清单
        toggleWishlist(city);
      } else {
        // 正常模式：跳转到创建行程页面
        router.push({
          name: "TripCreate",
          query: {
            city: city.adcode,
            cityName: city.中文名,
          },
        });
      }
    };

    // 监听搜索模式变化，更新导航栏显示
    watch(isSearchMode, () => {
      handleScroll();
    });

    // 滚动到指定字母区域
    const scrollToLetter = (letter) => {
  // 设置激活字母
      activeLetter.value = letter;

      // 如果在搜索模式，先清除搜索
      if (isSearchMode.value) {
        clearSearch();
      }

      // 显示滚动指示器
      showScrollIndicator.value = true;

  // 延迟执行滚动，确保搜索模式已退出且DOM已更新
      setTimeout(() => {
        let targetElement = null;

        if (letter === hotLabel) {
          targetElement = document.getElementById("hot-cities");
        } else {
          targetElement = document.getElementById(`letter-${letter}`);
        }

        if (targetElement) {
      // 使用 scrollIntoView，它能自动找到滚动容器并滚动
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          // 视觉反馈 - 高亮显示区域
          targetElement.classList.add("highlight");

          setTimeout(() => {
            targetElement.classList.remove("highlight");
            setTimeout(() => {
              showScrollIndicator.value = false;
            }, 800);
          }, 1000);
        }
      }, 100);
    };

    // 滚动监听容器引用
    const pageShell = ref(null);

    // 监听滚动，更新当前激活的字母
    const handleScroll = () => {
      if (!isSearchMode.value && heroRef.value && heroRef.value.$el) {
        const heroRect = heroRef.value.$el.getBoundingClientRect();
        if (heroRect.bottom < 80) {
          showLetterNav.value = true;
        } else {
          showLetterNav.value = false;
        }
      } else {
        // 如果无法获取 Hero ref 或者在搜索模式下，fallback 或隐藏
        if (isSearchMode.value) {
            showLetterNav.value = false;
        }
      }
      
      // 后续逻辑仅在非搜索模式下执行...
      if (isSearchMode.value) return;

      const sections = [...document.getElementsByClassName("city-section")];
      if (sections.length === 0) return;

      // 获取搜索框的高度或头部偏移
      const headerOffset = 100;

      // 检查元素是否在可见区域
      const isElementInView = (el) => {
        const rect = el.getBoundingClientRect();
        // 当元素顶部接近视口顶部(考虑偏移)时，或者元素覆盖了视口大部分时
        return rect.top <= headerOffset + 60 && rect.bottom > headerOffset;
      };

      let newActiveLetter = activeLetter.value;
      let letterChanged = false;

      // 检查热门区域
      const hotSection = document.getElementById("hot-cities");
      if (hotSection && isElementInView(hotSection)) {
        if (activeLetter.value !== hotLabel) {
          newActiveLetter = hotLabel;
          letterChanged = true;
        }
      } else {
        // 检查字母区域
        let foundVisible = false;

        for (let i = 0; i < sections.length; i++) {
          const section = sections[i];
          if (!section.id.startsWith("letter-")) continue;

          if (isElementInView(section)) {
            const letter = section.id.replace("letter-", "");
            if (activeLetter.value !== letter) {
              newActiveLetter = letter;
              letterChanged = true;
            }
            foundVisible = true;
            break;
          }
        }
      }

      if (letterChanged) {
        activeLetter.value = newActiveLetter;
      }
    };

// 批量操作相关状态
const isWishlistMode = ref(false);

    // 切换心愿清单模式
    const toggleWishlistMode = () => {
      isWishlistMode.value = !isWishlistMode.value;
    };

    // 愿望清单相关方法 - 优化版
    const toggleWishlist = createDebouncedHandler(async (city) => {
      return interactionMonitor.measureInteraction("wishlist-toggle", async () => {
        try {
          const isInWishlist = wishlist.isCityInWishlist(city.adcode);
          
          if (isInWishlist) {
            // 从愿望清单移除
            const wishlistItem = wishlist.getWishlistItemByCityCode(city.adcode);
            if (wishlistItem) {
              await wishlist.removeFromWishlist(wishlistItem.id);
              if (isWishlistMode.value) {
                ElMessage.success(`已从心愿清单移除 ${city.中文名}`);
              }
            }
          } else {
            // 添加到愿望清单
            await wishlist.addToWishlist({
              adcode: city.adcode,
              cityName: city.中文名,
              reason: "从目的地界面添加",
              tags: ["目的地浏览"],
            });
            if (isWishlistMode.value) {
              ElMessage.success(`已添加 ${city.中文名} 到心愿清单`);
            }
          }
        } catch (error) {
          console.error("愿望清单操作失败:", error);
          // 错误消息已在store中处理，这里不再重复显示
        }
      });
    }, 150);

// 生命周期钩子
onMounted(() => {
  // 启动页面性能监控
  pagePerformance.start("page-mount");
  pagePerformance.observePageRender();

  // 启动交互性能监控
  interactionMonitor.start();

  loadCityData();

  // 加载愿望清单数据
  wishlist.loadWishlist();

  // 全局滚动监听，以防万一
  window.addEventListener("scroll", handleScroll, true);


  handleScroll();

  // 检查是否有重定向消息
  if (route.query.message) {
    ElMessage.warning({
      message: route.query.message,
      duration: 4000,
      showClose: true,
    });
  }

  pagePerformance.end();
});

onBeforeUnmount(() => {
  // 清理性能监控
  pagePerformance.disconnect();
  imagePerformance.disconnect();
  interactionMonitor.stop();

  window.removeEventListener("scroll", handleScroll, true);
  
  // 移除scroll事件监听 - 尝试移除所有可能的容器监听
  const mainScrollContainer = document.querySelector('.layout-main');
  if (mainScrollContainer) mainScrollContainer.removeEventListener("scroll", handleScroll);
  
  if (pageShell.value) pageShell.value.removeEventListener("scroll", handleScroll);
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
/* 内容和导航栏容器 */
.cities-content-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  width: 100%;
}

/* 城市内容区域 */
.cities-content {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  scroll-behavior: smooth;
  position: relative;
}


.loading-container {
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 导航栏变为水平固定在底部 */
  .cities-content-wrapper {
    flex-direction: column;
  }

  .cities-content {
    width: 100%;
    padding: 20px;
    height: auto; /* Let it flow on mobile? Or fixed height? */
    /* Mobile usually scrolls body or specific container */
  }
}

/* 添加高亮动画效果 */
@keyframes highlight-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(145, 168, 208, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(145, 168, 208, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(145, 168, 208, 0);
  }
}

:deep(.city-section.highlight) {
  animation: highlight-pulse 1s ease-out;
  background-color: rgba(236, 245, 255, 0.9);
  transition: background-color 1s ease;
}

/* 导航栏过渡动画 */
.nav-fade-enter-active,
.nav-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.nav-fade-enter-from,
.nav-fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

@media (max-width: 768px) {
  .nav-fade-enter-from,
  .nav-fade-leave-to {
    transform: translateY(30px);
  }
}
</style>
