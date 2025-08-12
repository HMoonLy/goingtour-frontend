<template>
  <div class="destinations">
    <!-- 英雄横幅（大图+搜索） -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <h1 class="hero-title">去哪里旅行</h1>
        <p class="hero-sub">发现灵感目的地 · 开启下一段旅程</p>
        <div class="hero-search">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索城市、地区..."
            size="large"
            class="hero-input"
            clearable
            @input="debouncedSearch"
            @clear="clearSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button class="hero-btn" type="primary" @click="debouncedSearch()">
            搜索
          </el-button>
        </div>
      </div>
    </section>

    <!-- 内容区域 -->
    <div class="cities-content-wrapper">
      <!-- 滚动指示器（隐藏） -->
      <div class="scroll-indicator" style="display:none">
        {{ activeLetter }}
      </div>

      <div ref="citiesContent" class="cities-content">
        <!-- 加载状态 -->
        <div v-if="loading"
class="loading-container">
          <el-skeleton :rows="10"
animated />
        </div>

        <!-- 搜索结果 -->
        <div v-else-if="isSearchMode"
class="search-results">
          <h2 v-if="searchResults.length > 0">
            搜索结果 ({{ searchResults.length }})
          </h2>
          <el-empty
v-else description="未找到匹配的城市，请尝试其他关键词"
/>

          <!-- 列表视图（默认，仅显示结果，不展示收藏按钮） -->
          <div class="city-rows">
            <div
              v-for="city in searchResults"
              :key="city.adcode"
              class="city-row"
            >
              <div class="city-left"
@click="selectCity(city)">
                <span class="city-name">{{ city.中文名 }}</span>
                <span class="city-province">{{ getProvinceName(city) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 常规展示模式（整页流式） -->
        <template v-else>
          <!-- 热门目的地（分组标签云） -->
          <div class="city-section hot-group-section">
            <h2><i class="hot-icon">🔥</i> 热门目的地</h2>
            <div class="group-tabs">
              <button
                v-for="(cat, idx) in hotCats"
                :key="cat.label"
                class="group-tab"
                :class="{ active: activeHotIdx === idx }"
                @click="activeHotIdx = idx"
              >
                {{ cat.label }}
              </button>
            </div>
            <div class="hot-tags">
              <a
                v-for="city in hotCats[activeHotIdx].cities"
                :key="city.name"
                class="hot-tag"
                @click="handleCityClick(city.name)"
              >
                {{ city.name }}
              </a>
            </div>
          </div>

          <!-- 当季推荐 -->
          <div class="city-section season-section">
            <h2>
              <i class="letter-icon">季</i>
              当季推荐
            </h2>
            <div class="month-tabs">
              <button
                v-for="m in months"
                :key="m"
                class="month-tab"
                :class="{ active: selectedMonth === m }"
                @click="selectedMonth = m"
                @mouseenter="handleMonthHover(m)"
              >
                {{ m }}月
              </button>
            </div>
            <div class="dest-grid">
              <div
                v-for="item in seasonalWithMore"
                :key="item.name || 'more'"
                :class="['dest-card', { 'more-card': item.isMore }]"
              >
                <template v-if="!item.isMore">
                  <div class="dest-cover" :style="getCoverStyle(item)"></div>
                  <div class="dest-meta" @click="selectCity({ 中文名: item.name, adcode: item.adcode })">
                    <div class="dest-title">{{ item.name }}</div>
                    <div class="dest-sub">{{ item.province || '' }}</div>
                  </div>
                </template>
                <template v-else>
                  <div class="dest-cover dest-cover-more" @click="goMonthMore">
                    <span>更多 ›</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <!-- 热门目的地（区域 tabs + 城市标签） -->
          <div v-if="false" id="hot-cities" class="city-section hot-city-section">
            <h2><i class="hot-icon">🔥</i> 热门目的地</h2>
            <div class="region-tabs">
              <button
                v-for="(r, idx) in regions"
                :key="r.label"
                class="region-tab"
                :class="{ active: activeRegionIdx === idx }"
                @click="activeRegionIdx = idx"
              >
                {{ r.label }}
              </button>
            </div>
            <div class="city-tags">
              <a
                v-for="city in regions[activeRegionIdx].cities"
                :key="city.adcode"
                class="city-tag-link"
                @click="selectCity({ 中文名: city.name, adcode: city.adcode })"
              >
                {{ city.name }}
              </a>
            </div>
          </div>

          <!-- 按省份分组的城市 -->
          <div
            v-for="(group, index) in cityGroups"
            :id="'letter-' + group.letter"
            :key="index"
            ref="letterSections"
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
                <div class="city-left"
@click="selectCity(city)">
                  <span class="city-name">{{ city.中文名 }}</span>
                  <span class="city-province">{{ getProvinceName(city) }}</span>
                </div>
                <div class="city-right">
                  <el-button
                    type="default"
                    size="small"
                    circle
                    class="wishlist-toggle"
                    :class="{ active: wishlistStore.isCityInWishlist(city.adcode) }"
                    :title="
                      wishlistStore.isCityInWishlist(city.adcode)
                        ? '从愿望清单移除'
                        : '添加到愿望清单'
                    "
                    @click.stop="toggleWishlist(city)"
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
        </template>

        <!-- 导航辅助按钮组（隐藏） -->
        <div class="nav-assist-buttons" style="display:none;">
          <el-tooltip content="热门城市" placement="left" :offset="10">
            <el-button
              class="nav-button hot-button"
              circle
              size="small"
              @click="scrollToLetter(hotLabel)"
            >
              <el-icon><Top /></el-icon>
            </el-button>
          </el-tooltip>

          <el-backtop target=".cities-content"
:right="50" :bottom="100">
            <div class="back-top">
              <el-icon><Top /></el-icon>
            </div>
          </el-backtop>

          <el-tooltip content="跳至Z" placement="left" :offset="10">
            <el-button
              class="nav-button z-button"
              circle
              size="small"
              @click="scrollToLetter('Z')"
            >
              <el-icon><Bottom /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <!-- 添加快捷字母导航（隐藏） -->
      <div class="letter-nav" style="display:none;">
        <div
          class="letter-item special"
          :class="{ active: activeLetter === hotLabel }"
          title="热门城市"
          @click="scrollToLetter(hotLabel)"
        >
          热门
        </div>

        <div class="letter-section">
          <div
            v-for="letter in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"
            :key="letter"
            class="letter-item"
            :class="{ active: activeLetter === letter }"
            :title="letter"
            @click="scrollToLetter(letter)"
          >
            {{ letter }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import {
  Search,
  Top,
  Bottom,
  Star,
  StarFilled,
  ArrowDown,
  ArrowUp,
  MagicStick,
} from "@element-plus/icons-vue";
import pinyin from "pinyin";
import { createCachedRequest, debounce } from "@/utils/apiOptimizer.js";
import { useWishlistStore } from "@/store/wishlist.js";
import { hotRegions, themeGroups, findCity } from "@/data/destinations.js";
import { hotCategories as hotCategoriesData } from "@/data/hotGroups.js";
import { seasonalByMonth } from "@/data/seasonalCities.js";

export default {
  name: "Destinations",
  components: {
    Search,
    Top,
    Bottom,
    Star,
    StarFilled,
    ArrowDown,
    ArrowUp,
    MagicStick,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const wishlistStore = useWishlistStore();

    // 响应式数据
    const searchKeyword = ref("");
    // 统一为整页流式样式，不提供卡片/列表切换
    const allCities = ref([]);
    const loading = ref(true);
    const isSearchMode = ref(false);
    const searchResults = ref([]);
    const hotLabel = "热门";
    const activeLetter = ref(hotLabel);
    const citiesContent = ref(null);
    const letterSections = ref([]);
    const showScrollIndicator = ref(false);

    // 热门区域 tabs
    const regions = hotRegions;
    const activeRegionIdx = ref(0);
    // 热门目的地分组云
    const hotCats = hotCategoriesData;
    const activeHotIdx = ref(0);

    // 当季推荐静态数据
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const selectedMonth = ref(new Date().getMonth() + 1);

    const seasonalDisplayCities = computed(() => {
      const names = seasonalByMonth[selectedMonth.value] || [];
      // 在 hotRegions 或 themeGroups 中尝试匹配 adcode/封面
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

    // 增加“更多”卡片（占位，点击跳转更多页，当前可复用热门或搜索）
    const seasonalWithMore = computed(() => {
      const arr = seasonalDisplayCities.value.slice(0, 5); // 显示前5个
      return [...arr, { isMore: true }];
    });

    function handleMonthHover(m) {
      selectedMonth.value = m;
    }

    function goMonthMore() {
      // 暂跳到热门区域或触发搜索；此处简化为滚动到顶部
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function getCoverStyle(item) {
      return item.cover
        ? { backgroundImage: `url(${item.cover})`, backgroundSize: "cover", backgroundPosition: "center" }
        : { background: "linear-gradient(135deg, #eef2ff, #f8fafc)" };
    }

    function handleCityClick(name) {
      // 若是具体城市名称（含“市”或英文/拼音），直接进入创建行程，否则跳转二级页
      const isConcreteCity = /市$/.test(name) || /[A-Za-z]/.test(name);
      if (isConcreteCity) {
        const hit = findCity(name) || { adcode: '', name };
        selectCity({ 中文名: name, adcode: hit.adcode || '' });
      } else {
        // 类似“欧洲/海岛”等分类，跳到二级浏览
        window.location.href = '/destinations/browse';
      }
    }

    // 批量操作相关状态
    const showWishlistQuickView = ref(false);
    const addingRecommendations = ref(false);

    // 字母导航列表 - 单独定义每个字母
    const letterNavs = [
      hotLabel,
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
    ];

    // 热门城市列表
    const hotCities = hotRegions[0].cities.map((c) => ({ 中文名: c.name, adcode: c.adcode }));

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
      loading.value = true;
      try {
        const cityData = await cachedFetchCityData();

        if (import.meta.env.DEV) {
          console.log(`加载了 ${cityData.length} 条城市数据`);
        }

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

        if (import.meta.env.DEV) {
          console.log(`过滤后保留了 ${allCities.value.length} 条城市数据`);
        }
      } catch (error) {
        console.error("加载城市数据失败:", error);
        ElMessage.error("城市数据加载失败，请刷新重试");
        allCities.value = [];
      } finally {
        loading.value = false;
      }
    };

    // 按首字母分组城市数据
    const cityGroups = computed(() => {
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
      return Object.values(groups).sort((a, b) =>
        a.letter.localeCompare(b.letter),
      );
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
      // 跳转到创建行程页面
      router.push({
        name: "TripCreate",
        query: {
          city: city.adcode,
          cityName: city.中文名,
        },
      });
    };

    // 滚动到指定字母区域
    const scrollToLetter = (letter) => {
      // 设置激活字母（即使在搜索模式下也应该更新）
      activeLetter.value = letter;

      // 如果在搜索模式，先清除搜索
      if (isSearchMode.value) {
        clearSearch();
      }

      // 显示滚动指示器
      showScrollIndicator.value = true;

      // 延迟一点时间等待DOM更新和搜索清除完成
      setTimeout(() => {
        let targetElement = null;

        if (letter === hotLabel) {
          // 滚动到热门城市区域
          targetElement = document.getElementById("hot-cities");
        } else {
          // 滚动到对应字母区域
          targetElement = document.getElementById(`letter-${letter}`);
        }

        if (targetElement) {
          // 平滑滚动到目标元素
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          // 视觉反馈 - 高亮显示区域
          targetElement.classList.add("highlight");

          // 移除高亮效果
          setTimeout(() => {
            targetElement.classList.remove("highlight");

            // 隐藏滚动指示器
            setTimeout(() => {
              showScrollIndicator.value = false;
            }, 800);
          }, 1000);
        }
      }, 100);
    };

    // 监听滚动，更新当前激活的字母
    const handleScroll = () => {
      if (!citiesContent.value || isSearchMode.value) return;

      // 获取所有字母区域元素
      const sections = [...document.getElementsByClassName("city-section")];
      if (sections.length === 0) return;

      // 获取搜索框的高度，作为偏移量计算
      const searchSectionHeight =
        document.querySelector(".search-section")?.offsetHeight || 0;

      // 检查元素是否在可见区域，考虑搜索框的高度
      const isElementInView = (el, offset = 0) => {
        const rect = el.getBoundingClientRect();
        // 这里的值包含了搜索框高度和其他UI元素的偏移
        const threshold = searchSectionHeight + 60 + offset;
        return rect.top <= threshold && rect.bottom > threshold - 20;
      };

      let newActiveLetter = activeLetter.value;
      let letterChanged = false;

      // 如果滚动到顶部，激活热门
      if (citiesContent.value.scrollTop < 10) {
        if (activeLetter.value !== hotLabel) {
          newActiveLetter = hotLabel;
          letterChanged = true;
        }
      } else {
        // 检查热门区域是否在视口内
        const hotSection = document.getElementById("hot-cities");
        if (hotSection && isElementInView(hotSection, 0)) {
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

          // 如果没有找到可见的字母区域，尝试根据滚动位置确定最接近的字母
          if (!foundVisible) {
            // 检查是否滚动到底部 - 激活Z
            const scrollBottom =
              citiesContent.value.scrollTop + citiesContent.value.clientHeight;
            const scrollPercentage =
              scrollBottom / citiesContent.value.scrollHeight;

            if (scrollPercentage > 0.95) {
              const zSection = document.getElementById("letter-Z");
              if (zSection && activeLetter.value !== "Z") {
                newActiveLetter = "Z";
                letterChanged = true;
              }
            } else {
              // 找出最接近视口顶部的部分
              let closestSection = null;
              let minDistance = Infinity;

              for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                if (!section.id.startsWith("letter-")) continue;

                const rect = section.getBoundingClientRect();
                const distance = Math.abs(rect.top - searchSectionHeight);

                if (distance < minDistance) {
                  minDistance = distance;
                  closestSection = section;
                }
              }

              if (closestSection) {
                const letter = closestSection.id.replace("letter-", "");
                if (activeLetter.value !== letter) {
                  newActiveLetter = letter;
                  letterChanged = true;
                }
              }
            }
          }
        }
      }

      // 如果字母变化，更新并显示指示器
      if (letterChanged) {
        activeLetter.value = newActiveLetter;
        showScrollIndicator.value = true;

        // 自动隐藏指示器
        setTimeout(() => {
          showScrollIndicator.value = false;
        }, 1500);
      }
    };

    // 获取字母导航项的title
    const getLetterTitle = (letter) => {
      if (letter === hotLabel) {
        return "热门城市";
      }
      return letter;
    };

    // 获取省份名称
    const getProvinceName = (city) => {
      const adcode = String(city.adcode || "");
      if (!adcode || adcode.length < 2) {
        return "";
      }

      // 通过adcode前两位判断省份
      const provinceCode = adcode.substring(0, 2);

      // 省份编码映射
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

    // 生命周期钩子
    onMounted(() => {
      loadCityData();

      // 加载愿望清单数据
      wishlistStore.loadWishlist();

      // 添加resize事件监听
      window.addEventListener("resize", handleScroll);

      // 检查是否有重定向消息
      if (route.query.message) {
        ElMessage.warning({
          message: route.query.message,
          duration: 4000,
          showClose: true,
        });
      }
    });

    onBeforeUnmount(() => {
      // 移除resize事件监听
      window.removeEventListener("resize", handleScroll);
    });

    // 愿望清单相关方法
    const toggleWishlist = async (city) => {
      try {
        if (wishlistStore.isCityInWishlist(city.adcode)) {
          // 从愿望清单移除
          const wishlistItem = wishlistStore.getWishlistItemByCityCode(
            city.adcode,
          );
          if (wishlistItem) {
            await wishlistStore.removeFromWishlist(wishlistItem.id);
          }
        } else {
          // 添加到愿望清单
          await wishlistStore.addToWishlist({
            cityCode: city.adcode,
            cityName: city.中文名,
            reason: "从目的地界面添加",
            tags: ["目的地浏览"],
          });
        }
      } catch (error) {
        console.error("愿望清单操作失败:", error);
        ElMessage.error("操作失败，请重试");
      }
    };

    // 批量添加推荐城市
    const addRandomRecommendations = async () => {
      if (addingRecommendations.value) return;

      addingRecommendations.value = true;

      try {
        // 从热门城市中随机选择未添加的城市
        const availableHotCities = hotCities.filter(
          (city) => !wishlistStore.isCityInWishlist(city.adcode),
        );

        // 从所有城市中随机选择一些有趣的城市
        const interestingCities = [
          { 中文名: "拉萨市", adcode: "540100" },
          { 中文名: "乌鲁木齐市", adcode: "650100" },
          { 中文名: "银川市", adcode: "640100" },
          { 中文名: "兰州市", adcode: "620100" },
          { 中文名: "呼和浩特市", adcode: "150100" },
          { 中文名: "太原市", adcode: "140100" },
          { 中文名: "贵阳市", adcode: "520100" },
          { 中文名: "海口市", adcode: "460100" },
          { 中文名: "长春市", adcode: "220100" },
          { 中文名: "哈尔滨市", adcode: "230100" },
        ];

        const availableInterestingCities = interestingCities.filter(
          (city) => !wishlistStore.isCityInWishlist(city.adcode),
        );

        // 合并所有可选城市
        const allAvailableCities = [
          ...availableHotCities,
          ...availableInterestingCities,
        ];

        if (allAvailableCities.length === 0) {
          ElMessage.info("已经添加了所有推荐城市！");
          return;
        }

        // 随机选择3-5个城市
        const numToAdd = Math.min(
          Math.floor(Math.random() * 3) + 3,
          allAvailableCities.length,
        );
        const citiesContainer = [...allAvailableCities];
        const citiesToAdd = [];

        for (let i = 0; i < numToAdd; i++) {
          const randomIndex = Math.floor(
            Math.random() * citiesContainer.length,
          );
          citiesToAdd.push(citiesContainer.splice(randomIndex, 1)[0]);
        }

        // 批量添加到愿望清单
        const addPromises = citiesToAdd.map((city) =>
          wishlistStore.addToWishlist({
            cityCode: city.adcode,
            cityName: city.中文名,
            reason: "系统智能推荐",
            tags: ["智能推荐", "精选目的地"],
          }),
        );

        await Promise.all(addPromises);

        ElMessage.success(`已为你推荐 ${citiesToAdd.length} 个精选城市！`);

        // 自动展开愿望清单预览
        showWishlistQuickView.value = true;
      } catch (error) {
        console.error("添加推荐城市失败:", error);
        ElMessage.error("推荐失败，请重试");
      } finally {
        addingRecommendations.value = false;
      }
    };

    return {
      searchKeyword,
      hotCities,
      cityGroups,
      loading,
      isSearchMode,
      searchResults,
      activeLetter,
      hotLabel,
      letterNavs,
      citiesContent,
      letterSections,
      // 热门区域 tabs
      regions,
      activeRegionIdx,
      // 热门分组标签云
      hotCats,
      activeHotIdx,
      handleCityClick,
      clearSearch,
      debouncedSearch,
      selectCity,
      scrollToLetter,
      handleScroll,
      getLetterTitle,
      getProvinceName,
      // 愿望清单相关
      wishlistStore,
      toggleWishlist,
      // 批量操作相关
      showWishlistQuickView,
      addingRecommendations,
      addRandomRecommendations,
      // 当季
      months,
      selectedMonth,
      seasonalDisplayCities,
      seasonalWithMore,
      handleMonthHover,
      goMonthMore,
      getCoverStyle,
    };
  },
};
</script>

<style scoped>
/* 整体布局 */
.destinations {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  overflow: hidden;
  background: #f0f2f5;
  position: relative;
}

/* 英雄横幅（大图） */
.hero {
  position: relative;
  height: 260px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.35)), url('/images/scenarios/weekend_citywalk.jpg');
  background-size: cover;
  background-position: center;
  filter: saturate(1.05);
}

.hero-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-align: center;
}

.hero-title { font-size: 32px; font-weight: 700; letter-spacing: 1px; }
.hero-sub { margin-top: 6px; opacity: 0.9; }

.hero-search { margin-top: 16px; display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.9); border-radius: 12px; padding: 8px; }
.hero-input { width: 420px; }
.hero-btn { border-radius: 10px; }

.search-container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.search-container h1 {
  font-size: 28px;
  color: #303133;
  margin: 0 0 20px;
  font-weight: 600;
  position: relative;
  display: inline-block;
}

.search-container h1:after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background-color: #409eff;
  border-radius: 3px;
}

.search-input {
  max-width: 500px;
  margin: 0 auto;
}

.view-toggle {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

.search-input :deep(.el-input__inner) {
  border-radius: 20px;
  padding-left: 15px;
  transition: all 0.3s;
}

.search-input :deep(.el-input__inner):focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 批量操作区域 */
.batch-actions {
  margin-top: 20px;
  padding: 16px;
  background: rgba(64, 158, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.batch-info {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  margin-bottom: 0;
}

.wishlist-quick-view {
  border-top: 1px solid rgba(64, 158, 255, 0.1);
  padding-top: 12px;
  margin-top: 12px;
}

.quick-view-cities {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.more-indicator {
  color: #909399;
  font-size: 12px;
  align-self: center;
}

/* 字母导航 */
.letter-nav {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.9);
  z-index: 10;
  text-align: center;
  width: 32px; /* 瘦身，弱化抢占 */
  padding: 10px 0;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  box-shadow: inset 1px 0 0 #ebeef5; /* 改为细分隔线，弱化存在感 */
  transition: all 0.3s ease;
  overflow-y: auto;
  overflow-x: hidden;
}

.letter-nav:hover {
  box-shadow: -3px 0 15px rgba(64, 158, 255, 0.15);
  width: 42px;
}

.letter-item {
  width: 100%;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  color: #606266;
  transition: all 0.2s;
  user-select: none;
  position: relative;
  margin: 1px 0;
}

.letter-item:after {
  content: "";
  position: absolute;
  left: 0;
  width: 2px;
  height: 0;
  background-color: #409eff;
  transition: all 0.2s ease;
  border-radius: 2px;
  opacity: 0;
}

.letter-item:hover:after {
  height: 60%;
  opacity: 0.6;
}

.letter-item.active:after {
  width: 3px;
  height: 80%;
  opacity: 1;
}

.letter-item.special {
  font-weight: 500;
  color: #409eff;
  height: 30px; /* 增大热门选项高度 */
  font-size: 13px; /* 略大字体 */
  padding: 2px 0;
  margin-top: 0; /* 移除顶部大间距 */
  margin-bottom: 8px; /* 增加底部间距 */
}

.letter-item.special:after {
  height: 0;
  opacity: 0;
}

.letter-item.special.active:after {
  height: 70%;
  opacity: 1;
}

.letter-section {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
  padding: 5px 0;
  height: calc(100% - 40px); /* 减去热门按钮的高度 */
}

.letter-item:hover {
  color: #409eff;
  font-weight: 500;
  background-color: #f5f7fa;
}

.letter-item.active {
  color: #fff;
  background-color: #409eff;
  font-weight: 500;
}

/* 移除分隔线样式 */
.letter-divider {
  display: none;
}

/* 内容和导航栏容器 */
.cities-content-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  overflow: hidden;
  width: 100%;
}

/* 城市内容区域 */
.cities-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 60px 20px 20px; /* 增加右侧padding，为字母导航栏留出空间 */
  max-width: 1200px;
  margin: 0 auto;
  width: calc(100% - 40px); /* 减去导航栏宽度 */
  box-sizing: border-box;
  scroll-behavior: smooth;
  position: relative;
}

.loading-container {
  padding: 20px;
}

/* 城市分组 */
.city-section {
  margin-bottom: 24px;
  padding: 20px;
  background: var(--card-bg, #fff);
  border-radius: 8px;
  border: 1px solid var(--border-color, #ebeef5);
  transition: all 0.3s;
}

.city-section h2 {
  font-size: 20px;
  color: #303133;
  margin: 0 0 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  font-weight: 600;
  display: flex;
  align-items: center;
  position: sticky; /* 分组标题吸顶 */
  top: 0;
  z-index: 2;
  background: var(--card-bg, #fff);
}

.hot-icon {
  font-style: normal;
  margin-right: 8px;
  font-size: 18px;
  color: #f56c6c;
}

.group-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
.group-tab { padding: 6px 10px; border: 1px solid var(--border-color, #ebeef5); background: var(--btn-bg, #fff); color: var(--text-secondary, #606266); border-radius: 6px; font-size: 12px; cursor: pointer; }
.group-tab.active { background: var(--primary-color, #409eff); border-color: var(--primary-color, #409eff); color: #fff; }
.hot-tags { display: flex; flex-wrap: wrap; gap: 10px 14px; }
.hot-tag { color: #303133; font-size: 14px; padding: 4px 8px; border-radius: 6px; background: #f7f8fa; border: 1px solid var(--border-color, #ebeef5); cursor: pointer; }
.hot-tag:hover { background: #ecf5ff; border-color: #b3d8ff; color: #409eff; }

.region-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
.region-tab { padding: 6px 10px; border: 1px solid var(--border-color, #ebeef5); background: var(--btn-bg, #fff); color: var(--text-secondary, #606266); border-radius: 6px; font-size: 12px; }
.region-tab.active { background: var(--primary-color, #409eff); border-color: var(--primary-color, #409eff); color: #fff; }

.city-tags { display: flex; flex-wrap: wrap; gap: 10px 14px; }
.city-tag-link { color: #303133; font-size: 14px; padding: 4px 8px; border-radius: 6px; background: #f7f8fa; border: 1px solid var(--border-color, #ebeef5); cursor: pointer; }
.city-tag-link:hover { background: #ecf5ff; border-color: #b3d8ff; color: #409eff; }

/* 月份 tabs */
.month-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.month-tab { padding: 6px 10px; border: 1px solid var(--border-color, #ebeef5); background: var(--btn-bg, #fff); color: var(--text-secondary, #606266); border-radius: 6px; font-size: 12px; cursor: pointer; }
.month-tab.active { background: var(--primary-color, #409eff); border-color: var(--primary-color, #409eff); color: #fff; }

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

/* 热门城市网格 */
.city-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

/* 卡片视图（主流卡片风格） */
.dest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.dest-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #ebeef5);
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dest-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.dest-cover {
  position: relative;
  background: linear-gradient(135deg, #eef2ff, #f8fafc);
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dest-cover-fallback {
  font-size: 36px;
  color: var(--text-secondary, #606266);
  font-weight: 700;
  opacity: 0.4;
}

.dest-cover-more { display: flex; align-items: center; justify-content: center; color: #fff; background: linear-gradient(135deg, #3b82f6, #60a5fa); }
.more-card span { font-weight: 600; letter-spacing: 1px; }

.favorite-btn {
  position: absolute;
  right: 10px;
  top: 10px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--border-color, #eaeef2);
  background: rgba(255, 255, 255, 0.85);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary, #606266);
  transition: background 0.2s ease, transform 0.2s ease;
}

.favorite-btn:hover {
  transform: scale(1.05);
}

.favorite-btn.active {
  background: var(--primary-color, #409eff);
  color: #fff;
  border-color: var(--primary-color, #409eff);
}

.dest-meta {
  padding: 12px 12px 14px;
}

.dest-title {
  font-weight: 600;
  color: #303133;
}

.dest-sub {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.city-item {
  cursor: pointer;
  transition: all 0.3s;
}

  /* 旧卡片样式（不再使用） */
  .city-card { display: none; }

.city-card:hover {
}

.city-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 6px;
  transition: all 0.3s;
}

.city-info {
  font-size: 12px;
  color: #909399;
  transition: all 0.3s;
}

.city-card:hover .city-name {
  color: #409eff;
}

/* 省份分组 */
.provinces-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.province-group {
  margin-bottom: 10px;
}

.province-name {
  font-size: 16px;
  font-weight: 500;
  color: #666;
  margin: 0 0 10px;
  border-left: 3px solid #ff9d00;
  padding-left: 10px;
}

.cities-list {
  display: none; /* 切换为行式列表后不再使用 */
}

.city-rows {
  display: grid;
  grid-template-columns: 1fr; /* 默认单列 */
  gap: 6px;
}

@media (min-width: 992px) {
  .city-rows {
    grid-template-columns: 1fr 1fr; /* 桌面端双列，提高信息密度 */
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
  0% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

.city-tag {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
  margin-right: 8px;
  display: inline-block;
}

.city-tag:hover {
  background: #409eff;
  color: #fff;
}

/* 搜索结果 */
.search-results h2 {
  margin-bottom: 20px;
  color: #303133;
  font-size: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
}

/* 滚动指示器 - 当前字母高亮 */
.scroll-indicator {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  background: rgba(64, 158, 255, 0.9);
  color: #fff;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  opacity: 0;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); /* 弹性动画 */
  z-index: 999;
  pointer-events: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.scroll-indicator.visible {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
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
  }

  .letter-nav {
    position: fixed;
    right: unset;
    top: unset;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 40px;
    flex-direction: row;
    justify-content: space-around;
    padding: 5px 0;
    border-radius: 0;
    border-top: 1px solid #ebeef5;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .letter-section {
    flex-direction: row;
    padding: 0;
    margin-left: 10px;
  }

  .letter-item {
    width: auto;
    padding: 0 3px;
  }

  .letter-item:after {
    left: 0;
    bottom: -2px;
    width: 100%;
    height: 0;
  }

  .letter-item:hover:after,
  .letter-item.active:after {
    width: 100%;
    height: 2px;
  }

  .letter-item.special {
    margin: 0;
  }

  .city-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  .city-card {
    height: 60px;
    padding: 10px;
  }

  .city-name {
    font-size: 16px;
  }

  .search-container h1 {
    font-size: 22px;
  }

  .city-section h2 {
    font-size: 20px;
  }
}

/* 添加高亮动画效果 */
@keyframes highlight-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(64, 158, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
  }
}

.city-section.highlight {
  animation: highlight-pulse 1s ease-out;
  background-color: rgba(236, 245, 255, 0.9);
  transition: background-color 1s ease;
}

/* 添加热门城市区域的样式 */
.hot-city-section {
  background: #ffffff;
}

.hot-city-card {
  background: #f6faff;
  border: 1px solid #d9ecff;
}

.hot-city-card:hover {
  background: #ecf5ff;
  border-color: #a0cfff;
}

/* 导航辅助按钮组 */
.nav-assist-buttons {
  position: absolute;
  bottom: 100px; /* 调整位置，使其在底部 */
  right: 50px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10;
}

.nav-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  color: #606266;
}

.nav-button:hover {
  background-color: #ecf5ff;
  border-color: #b3d8ff;
  color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.hot-button {
  font-size: 20px;
}

.z-button {
  font-size: 18px;
}

/* 回到顶部按钮样式 */
.back-top {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

:deep(.el-backtop) {
  background-color: #fff;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  color: #606266;
}

:deep(.el-backtop:hover) {
  background-color: #ecf5ff;
  border-color: #b3d8ff;
  color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 重定向提示样式 */
.redirect-notice {
  margin-bottom: 20px;
}

.custom-alert {
  border-radius: 12px;
  border: 2px solid #409eff;
  background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
}

.alert-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.alert-text {
  flex: 1;
}

.alert-text strong {
  color: #409eff;
  font-size: 16px;
  display: block;
  margin-bottom: 4px;
}

.alert-text p {
  color: #606266;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.alert-icon {
  margin-left: 16px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .redirect-notice {
    margin-bottom: 16px;
  }

  .alert-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .alert-icon {
    margin-left: 0;
  }
}

/* 愿望清单相关样式 */
.city-item {
  position: relative;
  display: flex;
  flex-direction: column;
}

.city-item.in-wishlist {
  transform: scale(1.02);
}

.city-item.in-wishlist .city-card {
}

.city-actions {
  display: none;
}

.city-item:hover .city-actions {
}

.city-item.in-wishlist .city-actions {
}

.wishlist-btn {
  transition: all 0.3s ease;
}

.wishlist-btn:hover {
  transform: scale(1.1);
}

/* 字母分组城市的愿望清单样式 */
.city-tag-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin: 0; /* 依赖父容器gap，避免双重间距导致不齐 */
  padding: 0; /* 不为按钮预留额外空间，避免布局不齐 */
  border-radius: 16px;
  transition: all 0.3s ease;
}

.city-tag-container:hover {
  background: rgba(64, 158, 255, 0.1);
}

.city-tag-container.in-wishlist {
  background: rgba(103, 194, 58, 0.1);
  border: 1px solid rgba(103, 194, 58, 0.3);
}

.city-tag-container .city-tag {
  flex: 0 0 auto; /* 仅按内容宽度展示，避免被拉伸 */
  margin: 0;
  cursor: pointer;
  white-space: nowrap; /* 保持单行展示 */
  padding-right: 22px; /* 为悬浮按钮预留少量内边距，不影响整体布局 */
}

.wishlist-btn-small {
  position: absolute;
  right: 2px; /* 覆盖在标签内部右缘，不挤占布局 */
  top: 50%;
  transform: translateY(-50%) scale(0.8);
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s ease;
  height: 24px;
  width: 24px;
  min-width: 24px;
  z-index: 1;
}

.city-tag-container:hover .wishlist-btn-small,
.city-tag-container.in-wishlist .wishlist-btn-small {
  opacity: 1;
  transform: translateY(-50%) scale(1);
  pointer-events: auto;
}

/* 愿望清单状态指示器 */
.city-item.in-wishlist::before {
  content: none;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .city-actions {
    display: none;
  }

  .city-item.in-wishlist::before {
    display: none;
  }
}
</style>
