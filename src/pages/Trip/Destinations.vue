<template>
  <div class="destinations">
    <!-- 搜索部分 -->
    <div class="search-section">
      <div class="search-container">
        <h1>{{ t('destinations.title') }}</h1>
        
        <el-input
          v-model="searchKeyword"
          :placeholder="t('destinations.searchPlaceholder')"
          size="large"
          class="search-input"
          clearable
          @input="debouncedSearch"
          @clear="clearSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 城市展示区域 -->
    <div class="cities-content-wrapper">
      <!-- 滚动指示器 -->
      <div
class="scroll-indicator" :class="{ visible: showScrollIndicator }"
>
        {{ activeLetter }}
      </div>

      <div ref="citiesContent"
class="cities-content" @scroll="handleScroll">
        <!-- 加载状态 -->
        <div
v-if="loading" class="loading-container"
>
          <el-skeleton
:rows="10" animated
/>
        </div>

        <!-- 搜索结果 -->
        <div
v-else-if="isSearchMode" class="search-results"
>
          <h2 v-if="searchResults.length > 0">
            {{ t('destinations.searchResults') }} ({{ searchResults.length }})
          </h2>
          <el-empty v-else :description="t('destinations.noMatch')" />

          <div class="city-grid">
            <div
              v-for="city in searchResults"
              :key="city.adcode"
              class="city-item"
              @click="selectCity(city)"
            >
              <div class="city-card">
                <div class="city-name">
                  {{ city.中文名 }}
                </div>
                <div class="city-info">
                  {{ getProvinceName(city) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 常规展示模式 -->
        <template v-else>
          <!-- 热门城市 -->
          <div id="hot-cities"
class="city-section hot-city-section">
            <h2><i class="hot-icon">🔥</i> {{ t('destinations.hotCities') }}</h2>
            <div class="city-grid">
              <div
                v-for="city in hotCities"
                :key="city.adcode"
                class="city-item"
                @click="selectCity(city)"
              >
                <div class="city-card hot-city-card">
                  <div class="city-name">
                    {{ city.中文名 }}
                  </div>
                  <div class="city-info">
                    {{ getProvinceName(city) }}
                  </div>
                </div>
              </div>
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
            <div class="cities-list">
              <div
                v-for="city in group.cities"
                :key="city.adcode"
                class="city-tag"
                @click="selectCity(city)"
              >
                {{ city.中文名 }}
              </div>
            </div>
          </div>
        </template>

        <!-- 导航辅助按钮组 -->
        <div class="nav-assist-buttons">
          <el-tooltip :content="t('destinations.hotCities')" placement="left" :offset="10">
            <el-button
              class="nav-button hot-button"
              circle
              size="small"
              @click="scrollToLetter('热门')"
            >
              <el-icon><Top /></el-icon>
            </el-button>
          </el-tooltip>

          <el-backtop
target=".cities-content" :right="50"
:bottom="100"
>
            <div class="back-top">
              <el-icon><Top /></el-icon>
            </div>
          </el-backtop>

          <el-tooltip :content="t('destinations.jumpTo', { letter: 'Z' })" placement="left" :offset="10">
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

      <!-- 添加快捷字母导航 -->
      <div class="letter-nav">
        <div
          class="letter-item special"
          :class="{ active: activeLetter === hotLabel }"
          :title="t('destinations.hotCities')"
          @click="scrollToLetter(hotLabel)"
        >
          {{ t('destinations.hot') }}
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
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { Search, Top, Bottom } from "@element-plus/icons-vue";
import pinyin from "pinyin";
import { createCachedRequest, debounce } from "@/utils/apiOptimizer.js";
  import { useI18n } from "@/utils/i18n.js";

export default {
  name: "Destinations",
  components: {
    Search,
    Top,
    Bottom,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { t } = useI18n();

    // 响应式数据
    const searchKeyword = ref("");
    const allCities = ref([]);
    const loading = ref(true);
    const isSearchMode = ref(false);
    const searchResults = ref([]);
    const hotLabel = '热门';
    const activeLetter = ref(hotLabel);
    const citiesContent = ref(null);
    const letterSections = ref([]);
    const showScrollIndicator = ref(false);

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
    const hotCities = [
      { 中文名: "北京市", adcode: "110000", province: "直辖市" },
      { 中文名: "上海市", adcode: "310000", province: "直辖市" },
      { 中文名: "广州市", adcode: "440100", province: "广东省" },
      { 中文名: "深圳市", adcode: "440300", province: "广东省" },
      { 中文名: "杭州市", adcode: "330100", province: "浙江省" },
      { 中文名: "成都市", adcode: "510100", province: "四川省" },
      { 中文名: "重庆市", adcode: "500000", province: "直辖市" },
      { 中文名: "西安市", adcode: "610100", province: "陕西省" },
      { 中文名: "南京市", adcode: "320100", province: "江苏省" },
      { 中文名: "厦门市", adcode: "350200", province: "福建省" },
      { 中文名: "三亚市", adcode: "460200", province: "海南省" },
      { 中文名: "丽江市", adcode: "530700", province: "云南省" },
    ];

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
      cacheKey: 'city-data',
      ttl: 30 * 60 * 1000, // 缓存30分钟
      enableCache: true
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
        return t('destinations.hotCities');
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

      // 添加resize事件监听
      window.addEventListener("resize", handleScroll);

      // 检查是否有重定向消息
      if (route.query.message) {
        ElMessage.warning({
          message: route.query.message,
          duration: 4000,
          showClose: true
        });
      }
    });

    onBeforeUnmount(() => {
      // 移除resize事件监听
      window.removeEventListener("resize", handleScroll);
    });

    return {
      t,
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
      clearSearch,
      debouncedSearch,
      selectCity,
      scrollToLetter,
      handleScroll,
      getLetterTitle,
      getProvinceName,
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

/* 搜索部分 */
.search-section {
  display: flex;
  background: #fff;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 10;
  position: relative;
}

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

.search-input :deep(.el-input__inner) {
  border-radius: 20px;
  padding-left: 15px;
  transition: all 0.3s;
}

.search-input :deep(.el-input__inner):focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 字母导航 */
.letter-nav {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 改为空间分布 */
  background: #fff;
  z-index: 10;
  text-align: center;
  width: 40px;
  padding: 15px 0; /* 增大内边距 */
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  box-shadow: -2px 0 20px rgba(0, 0, 0, 0.1);
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
  height: 20px; /* 调小高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px; /* 调小字体 */
  cursor: pointer;
  color: #606266;
  transition: all 0.2s;
  user-select: none;
  position: relative;
  margin: 1px 0; /* 增加上下间距 */
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
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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
}

.hot-icon {
  font-style: normal;
  margin-right: 8px;
  font-size: 18px;
  color: #f56c6c;
}

.letter-icon {
  font-style: normal;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

/* 热门城市网格 */
.city-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.city-item {
  cursor: pointer;
  transition: all 0.3s;
}

.city-card {
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.3s;
  border: 1px solid #ebeef5;
  position: relative;
  overflow: hidden;
}

.city-card:hover {
  background: #ecf5ff;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(64, 158, 255, 0.15);
  border-color: #b3d8ff;
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
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  transition: all 0.3s ease;
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
</style>
