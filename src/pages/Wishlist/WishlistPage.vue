<template>
  <div class="page-shell wishlist-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <el-icon><Star /></el-icon>
            我的愿望清单
          </h1>
          <p class="page-subtitle">收集你想去的目的地，让旅行灵感永不枯竭</p>
        </div>

        <div v-if="wishlistStore.wishlistCount > 0" class="header-stats">
          <div class="stat-item">
            <span class="stat-number">{{ wishlistStore.wishlistCount }}</span>
            <span class="stat-label">个城市</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ uniqueTagsCount }}</span>
            <span class="stat-label">个标签</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 愿望清单内容 -->
    <div class="page-content">
      <!-- 地图预览区域 -->
      <div v-if="wishlistStore.hasCities" class="map-section">
        <div class="map-header">
          <h3 class="map-title">
            <el-icon><MapLocation /></el-icon>
            愿望地图
          </h3>
          <div class="map-controls">
            <el-button size="small" type="primary" disabled>
              <el-icon><View /></el-icon>
              全屏查看
            </el-button>
          </div>
        </div>

        <div class="map-container">
          <div class="map-placeholder">
            <el-icon size="48" color="#91a8d0">
              <MapLocation />
            </el-icon>
            <h4>中国愿望地图</h4>
            <p>即将上线，敬请期待</p>
            <div class="coming-soon-features">
              <el-tag effect="plain" type="info"> 点亮访问过的城市 </el-tag>
              <el-tag effect="plain" type="info"> 一键规划旅行路线 </el-tag>
              <el-tag effect="plain" type="info"> 分享你的足迹 </el-tag>
            </div>
          </div>
        </div>
      </div>

      <div v-loading="wishlistStore.loading" class="wishlist-content">
        <div v-if="wishlistStore.hasCities" class="wishlist-grid">
          <WishlistCard
            v-for="item in sortedWishlistItems"
            :key="item.id"
            :wishlist-item="item"
            :is-current-weather-city="isCurrentWeatherCity(item)"
            @remove="handleRemove"
            @edit="handleEdit"
            @view-weather="handleViewWeather"
            @plan-trip="handlePlanTrip"
          />
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-wishlist">
          <el-icon size="64" color="#C0C4CC">
            <Star />
          </el-icon>
          <h4>还没有心仪的目的地</h4>
          <p>添加你想去的城市，让旅行灵感永不枯竭</p>

          <div class="empty-actions">
            <el-button type="primary" @click="showQuickAdd = true">
              <el-icon><Plus /></el-icon>
              添加第一个城市
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速操作悬浮按钮 -->
    <div class="floating-actions">
      <el-button
        type="primary"
        circle
        size="large"
        class="fab-main"
        @click="showQuickAdd = true"
      >
        <el-icon><Plus /></el-icon>
      </el-button>
    </div>

    <!-- 快速添加对话框 -->
    <el-dialog
      v-model="showQuickAdd"
      width="480px"
      :before-close="handleQuickAddClose"
      class="wishlist-add-dialog"
      align-center
    >
      <div class="dialog-content">
        <!-- 对话框头部 -->
        <div class="dialog-header">
          <div class="header-icon">
            <el-icon size="24">
              <Star />
            </el-icon>
          </div>
          <div class="header-text">
            <h3>添加心愿城市</h3>
            <p>选择你想去的城市，开启下一段旅程</p>
          </div>
        </div>

        <el-form :model="quickAddForm" label-position="top" class="add-form">
          <el-form-item label="选择城市">
            <el-select
              v-model="quickAddForm.selectedCity"
              placeholder="请选择或搜索城市..."
              filterable
              remote
              reserve-keyword
              :remote-method="searchCities"
              :loading="searchLoading"
              clearable
              size="large"
              class="city-selector"
              @change="handleCitySelect"
            >
              <el-option-group
                v-if="displayCities.length > 0"
                :label="searchKeyword ? '搜索结果' : '热门城市'"
              >
                <el-option
                  v-for="city in displayCities"
                  :key="city.adcode"
                  :label="city.中文名"
                  :value="city.adcode"
                  class="city-option"
                >
                  <div class="city-option-content">
                    <span class="city-name">{{ city.中文名 }}</span>
                    <span class="city-code">{{ city.citycode }}</span>
                  </div>
                </el-option>
              </el-option-group>

              <div
                v-if="
                  displayCities.length === 0 && searchKeyword && !searchLoading
                "
                class="no-results"
              >
                <el-icon><Search /></el-icon>
                <span>未找到匹配的城市</span>
              </div>
            </el-select>
          </el-form-item>

          <el-form-item label="选择标签" class="tags-form-item">
            <div class="tags-selection">
              <div class="predefined-tags">
                <el-check-tag
                  v-for="tag in predefinedTags"
                  :key="tag.name"
                  :checked="quickAddForm.selectedTags.includes(tag.name)"
                  class="tag-item"
                  :style="{ '--tag-color': tag.color }"
                  @change="toggleTag(tag.name)"
                >
                  {{ tag.name }}
                </el-check-tag>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="想去的原因" class="reason-form-item">
            <el-input
              v-model="quickAddForm.reason"
              type="textarea"
              :rows="3"
              placeholder="分享一下你想去这里的理由..."
              maxlength="200"
              show-word-limit
              class="reason-input"
            />
          </el-form-item>

          <div class="dialog-actions">
            <el-button
              size="large"
              class="cancel-btn"
              @click="handleQuickAddClose"
            >
              取消
            </el-button>
            <el-button
              type="primary"
              size="large"
              :loading="quickAdding"
              :disabled="!quickAddForm.selectedCity"
              class="submit-btn"
              @click="handleQuickAddSubmit"
            >
              <el-icon v-if="!quickAdding">
                <Plus />
              </el-icon>
              {{ quickAdding ? "添加中..." : "添加到心愿单" }}
            </el-button>
          </div>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Star, Plus, MapLocation, View, Search } from "@element-plus/icons-vue";
import { useWishlistStore } from "@/store/wishlist.js";
import WishlistCard from "@/components/Common/Wishlist/WishlistCard.vue";
import pinyin from "pinyin";
import { debounce } from "@/utils/apiOptimizer.js";

export default {
  name: "WishlistPage",
  components: {
    WishlistCard,
    Star,
    Plus,
    MapLocation,
    View,
    Search,
  },
  setup() {
    const router = useRouter();
    const wishlistStore = useWishlistStore();

    // 快速添加功能
    const showQuickAdd = ref(false);
    const quickAdding = ref(false);
    const quickAddForm = ref({
      selectedCity: null,
      selectedTags: [],
      reason: "",
    });

    // 预定义标签
    const predefinedTags = ref([
      { name: "历史文化", color: "#91A8D0" },
      { name: "自然风光", color: "#7CB342" },
      { name: "美食之旅", color: "#FB8C00" },
      { name: "度假休闲", color: "#F7CAC9" },
      { name: "购物天堂", color: "#8B5CF6" },
      { name: "艺术文化", color: "#06B6D4" },
      { name: "夜生活", color: "#EF4444" },
      { name: "亲子旅行", color: "#10B981" },
      { name: "冒险探索", color: "#F59E0B" },
      { name: "古镇古村", color: "#84CC16" },
      { name: "海滨城市", color: "#3B82F6" },
      { name: "山水之间", color: "#059669" },
    ]);

    // 城市数据相关
    const allCities = ref([]);
    const hotCities = ref([]);
    const searchResults = ref([]);
    const searchLoading = ref(false);
    const searchKeyword = ref("");

    // 显示的城市列表（热门城市或搜索结果）
    const displayCities = computed(() => {
      if (searchKeyword.value && searchResults.value.length > 0) {
        return searchResults.value;
      }
      return hotCities.value;
    });

    // 排序后的愿望清单
    const sortedWishlistItems = computed(() => {
      return [...wishlistStore.wishlistItems].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    });

    // 检查是否为当前天气城市
    const isCurrentWeatherCity = (item) => {
      return wishlistStore.currentWeatherCity?.id === item.id;
    };

    // 处理卡片事件
    const handleRemove = async (wishlistId) => {
      await wishlistStore.removeFromWishlist(wishlistId);
    };

    const handleEdit = async ({ id, updateData }) => {
      await wishlistStore.updateWishlistItem(id, updateData);
    };

    const handleViewWeather = (city) => {
      wishlistStore.setCurrentWeatherCity(city);
      handleWeatherCityChange(city);
      ElMessage.success(`已切换到 ${city.cityName} 的天气预览`);
    };

    const handlePlanTrip = (city) => {
      router.push({
        path: "/trip/create",
        query: {
          city: city.cityCode,
          cityName: encodeURIComponent(city.cityName),
        },
      });
    };

    // 统计信息
    const uniqueTagsCount = computed(() => {
      const allTags = wishlistStore.wishlistItems.reduce((tags, item) => {
        return tags.concat(item.tags || []);
      }, []);
      return new Set(allTags).size;
    });

    // 城市数据加载 - 只加载热门城市
    const loadCityData = async () => {
      try {
        const response = await fetch("/data/city-codes.json");
        if (!response.ok) {
          throw new Error(`加载城市数据失败: ${response.status}`);
        }
        const cityData = await response.json();

        // 过滤市级城市（5位数adcode，且不含区县）
        const cities = cityData.filter((city) => {
          const adcode = parseInt(city.adcode);
          return (
            adcode >= 100000 &&
            adcode < 1000000 &&
            city.adcode.toString().endsWith("00") &&
            !city.中文名.includes("区") &&
            !city.中文名.includes("县")
          );
        });

        allCities.value = cities;

        // 扩展热门城市列表
        const hotCityNames = [
          "北京市",
          "上海市",
          "广州市",
          "深圳市",
          "杭州市",
          "南京市",
          "成都市",
          "西安市",
          "重庆市",
          "天津市",
          "苏州市",
          "武汉市",
          "厦门市",
          "青岛市",
          "大连市",
          "三亚市",
          "丽江市",
          "桂林市",
          "拉萨市",
          "乌鲁木齐市",
        ];
        hotCities.value = cities.filter((city) =>
          hotCityNames.includes(city.中文名)
        );
      } catch (error) {
        console.error("加载城市数据失败:", error);
        ElMessage.error("加载城市数据失败");
      }
    };

    // 城市搜索
    const searchCities = debounce((keyword) => {
      searchKeyword.value = keyword;
      if (!keyword || keyword.length < 1) {
        searchResults.value = allCities.value.slice(0, 20);
        return;
      }

      searchLoading.value = true;

      try {
        const filtered = allCities.value
          .filter((city) => {
            // 中文名匹配
            if (city.中文名.includes(keyword)) return true;

            // 拼音匹配
            const pinyinStr = pinyin(city.中文名, {
              style: pinyin.STYLE_NORMAL,
            })
              .flat()
              .join("");
            const pinyinFirst = pinyin(city.中文名, {
              style: pinyin.STYLE_FIRST_LETTER,
            })
              .flat()
              .join("");

            return (
              pinyinStr.toLowerCase().includes(keyword.toLowerCase()) ||
              pinyinFirst.toLowerCase().includes(keyword.toLowerCase())
            );
          })
          .slice(0, 50); // 限制搜索结果数量

        searchResults.value = filtered;
      } catch (error) {
        console.error("城市搜索失败:", error);
        searchResults.value = [];
      } finally {
        searchLoading.value = false;
      }
    }, 300);

    // 处理城市选择
    const handleCitySelect = (cityAdcode) => {
      const selectedCity = allCities.value.find(
        (city) => city.adcode === cityAdcode
      );
      if (selectedCity) {
        quickAddForm.value.cityName = selectedCity.中文名;
        quickAddForm.value.cityCode =
          selectedCity.citycode || selectedCity.adcode.toString();
      }
    };

    // 切换标签选择
    const toggleTag = (tagName) => {
      const index = quickAddForm.value.selectedTags.indexOf(tagName);
      if (index > -1) {
        quickAddForm.value.selectedTags.splice(index, 1);
      } else {
        quickAddForm.value.selectedTags.push(tagName);
      }
    };

    // 处理天气城市变更（传递给父级路由）
    const handleWeatherCityChange = (city) => {
      // 可以通过 router 或 emit 传递给其他页面
      console.log("Weather city changed:", city);
    };

    // 快速添加城市
    const handleQuickAddSubmit = async () => {
      if (!quickAddForm.value.selectedCity) {
        ElMessage.warning("请选择城市");
        return;
      }

      const selectedCity = allCities.value.find(
        (city) => city.adcode === quickAddForm.value.selectedCity
      );
      if (!selectedCity) {
        ElMessage.warning("请选择有效的城市");
        return;
      }

      quickAdding.value = true;
      try {
        const tags =
          quickAddForm.value.selectedTags.length > 0
            ? quickAddForm.value.selectedTags
            : ["快速添加"];

        const success = await wishlistStore.addToWishlist({
          cityCode: selectedCity.citycode || selectedCity.adcode.toString(),
          cityName: selectedCity.中文名,
          reason: quickAddForm.value.reason,
          tags: tags,
        });

        if (success) {
          handleQuickAddClose();
        }
      } catch (error) {
        console.error("快速添加失败:", error);
      } finally {
        quickAdding.value = false;
      }
    };

    // 关闭快速添加对话框
    const handleQuickAddClose = () => {
      showQuickAdd.value = false;
      quickAddForm.value = {
        selectedCity: null,
        selectedTags: [],
        reason: "",
      };
      searchKeyword.value = "";
      searchResults.value = allCities.value.slice(0, 20);
    };

    // 页面初始化
    onMounted(() => {
      wishlistStore.loadWishlist();
      loadCityData();
    });

    return {
      wishlistStore,
      uniqueTagsCount,
      sortedWishlistItems,
      isCurrentWeatherCity,
      handleRemove,
      handleEdit,
      handleViewWeather,
      handlePlanTrip,
      showQuickAdd,
      quickAdding,
      quickAddForm,
      handleWeatherCityChange,
      handleQuickAddSubmit,
      handleQuickAddClose,
      // 城市相关
      displayCities,
      hotCities,
      searchResults,
      searchLoading,
      searchKeyword,
      searchCities,
      handleCitySelect,
      // 标签相关
      predefinedTags,
      toggleTag,
    };
  },
};
</script>

<style scoped>
.wishlist-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* 页面头部 */
.page-header {
  margin-bottom: 32px;
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(145, 168, 208, 0.06);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #1f2937 0%, #91a8d0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title .el-icon {
  font-size: 36px;
  color: #91a8d0;
  animation: sparkle 3s ease-in-out infinite;
}

@keyframes sparkle {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  25% {
    transform: scale(1.1) rotate(5deg);
    opacity: 0.8;
  }
  50% {
    transform: scale(0.9) rotate(-3deg);
    opacity: 1;
  }
  75% {
    transform: scale(1.05) rotate(2deg);
    opacity: 0.9;
  }
}

.page-subtitle {
  margin: 0;
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
  max-width: 500px;
}

.header-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  text-align: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border: 1px solid rgba(145, 168, 208, 0.1);
  min-width: 80px;
}

.stat-number {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #91a8d0;
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

/* 页面内容 */
.page-content {
  position: relative;
}

/* 地图区域样式 */
.map-section {
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid rgba(145, 168, 208, 0.12);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(145, 168, 208, 0.08);
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.map-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
}

.map-title .el-icon {
  color: #91a8d0;
  font-size: 24px;
}

.map-controls {
  display: flex;
  gap: 12px;
}

.map-container {
  width: 100%;
  height: 400px;
  border-radius: 16px;
  border: 2px dashed rgba(145, 168, 208, 0.2);
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.map-placeholder {
  text-align: center;
  color: #6b7280;
  padding: 40px 20px;
}

.map-placeholder .el-icon {
  margin-bottom: 16px;
  opacity: 0.8;
}

.map-placeholder h4 {
  margin: 16px 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #374151;
}

.map-placeholder p {
  margin: 0 0 24px 0;
  font-size: 16px;
  color: #6b7280;
}

.coming-soon-features {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.coming-soon-features .el-tag {
  border-radius: 20px;
  font-size: 12px;
  background: rgba(145, 168, 208, 0.1);
  border-color: rgba(145, 168, 208, 0.3);
  color: #91a8d0;
}

/* 愿望清单内容 */
.wishlist-content {
  min-height: 200px;
}

.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 4px;
}

/* 空状态 */
.empty-wishlist {
  text-align: center;
  padding: 80px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border: 2px dashed rgba(99, 102, 241, 0.2);
  margin: 20px 0;
}

.empty-wishlist .el-icon {
  color: #91a8d0 !important;
  margin-bottom: 20px;
  opacity: 0.7;
}

.empty-wishlist h4 {
  margin: 16px 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.empty-wishlist p {
  margin: 0 0 32px 0;
  font-size: 15px;
  line-height: 1.6;
  color: #6b7280;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.empty-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.empty-actions .el-button {
  border-radius: 12px;
  font-weight: 500;
  padding: 10px 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.empty-actions .el-button--primary {
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(145, 168, 208, 0.3);
}

.empty-actions .el-button--primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 24px rgba(145, 168, 208, 0.4);
}

.full-featured-manager {
  box-shadow: none;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
}

/* 悬浮操作按钮 */
.floating-actions {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 1000;
}

.fab-main {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border: none;
  box-shadow:
    0 8px 32px rgba(145, 168, 208, 0.3),
    0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-main:hover {
  transform: scale(1.1) translateY(-2px);
  box-shadow:
    0 12px 40px rgba(145, 168, 208, 0.4),
    0 6px 20px rgba(0, 0, 0, 0.15);
}

.fab-main:active {
  transform: scale(0.95);
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 标签选择样式 */
.tags-selection {
  width: 100%;
}

.predefined-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.tag-item {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 16px;
  font-size: 12px;
  padding: 4px 12px;
}

.tag-item:not(.is-checked) {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-regular);
  border: 1px solid var(--el-border-color);
}

.tag-item.is-checked {
  background: var(--tag-color, var(--el-color-primary));
  color: white;
  border: 1px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tag-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.selected-tags {
  padding: 12px;
  background: var(--el-fill-color-extra-light);
  border-radius: 8px;
  border: 1px dashed var(--el-border-color-light);
}

.tags-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-right: 8px;
  font-weight: 500;
}

/* 快速添加对话框现代化样式 */
.wishlist-add-dialog {
  border-radius: 20px !important;
}

.wishlist-add-dialog .el-dialog__header {
  background: none !important;
  border-bottom: none !important;
  padding: 16px 20px 0 20px !important;
}

.wishlist-add-dialog .el-dialog__title {
  display: none; /* 隐藏标题文本，保留关闭按钮 */
}

.wishlist-add-dialog .el-dialog__headerbtn {
  top: 16px !important;
  right: 16px !important;
}

.wishlist-add-dialog .el-dialog__body {
  padding: 0;
}

.dialog-content {
  padding: 32px;
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid rgba(145, 168, 208, 0.1);
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 16px rgba(145, 168, 208, 0.3);
  flex-shrink: 0;
}

.header-text h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  background: linear-gradient(135deg, #1f2937 0%, #91a8d0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-text p {
  margin: 0;
  font-size: 15px;
  color: #6b7280;
  line-height: 1.5;
}

.add-form {
  margin-top: 0;
}

.add-form .el-form-item {
  margin-bottom: 28px;
}

.add-form .el-form-item__label {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  line-height: 1.2;
}

.city-selector {
  border-radius: 12px !important;
}

.city-selector .el-input__wrapper {
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  padding: 12px 16px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.city-selector .el-input__wrapper:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
}

.city-selector .el-input__wrapper.is-focus {
  border-color: #91a8d0;
  box-shadow:
    0 0 0 3px rgba(145, 168, 208, 0.1),
    0 4px 12px rgba(145, 168, 208, 0.2);
}

.city-option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.city-name {
  font-weight: 500;
  color: #374151;
}

.city-code {
  font-size: 12px;
  color: #9ca3af;
  padding: 2px 6px;
  border-radius: 6px;
}

.no-results {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #9ca3af;
  font-size: 14px;
  padding: 20px;
  text-align: center;
}

.tags-form-item .predefined-tags {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
  margin-bottom: 16px;
}

.tag-item {
  border-radius: 20px !important;
  font-size: 13px !important;
  padding: 8px 16px !important;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent !important;
}

.tag-item:not(.is-checked) {
  background: #f8fafc !important;
  color: #64748b !important;
  border-color: #e2e8f0 !important;
}

.tag-item:not(.is-checked):hover {
  background: #f1f5f9 !important;
  border-color: #91a8d0 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
}

.tag-item.is-checked {
  background: var(--tag-color, #91a8d0) !important;
  color: white !important;
  border-color: var(--tag-color, #91a8d0) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.25);
}

.reason-form-item .reason-input .el-textarea__inner {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.5;
  transition: all 0.3s ease;
  resize: none;
}

.reason-form-item .reason-input .el-textarea__inner:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
}

.reason-form-item .reason-input .el-textarea__inner:focus {
  border-color: #91a8d0;
  box-shadow:
    0 0 0 3px rgba(145, 168, 208, 0.1),
    0 4px 12px rgba(145, 168, 208, 0.2);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(145, 168, 208, 0.1);
}

.cancel-btn,
.submit-btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.cancel-btn {
  background: #f8fafc;
  color: #64748b;
  border-color: #e2e8f0;
}

.cancel-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.submit-btn {
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  color: white;
  border: none;
  min-width: 140px;
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(145, 168, 208, 0.4);
}

.submit-btn:hover::before {
  left: 100%;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.submit-btn:disabled:hover::before {
  left: -100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .wishlist-page {
    padding: 16px 12px;
  }

  /* 移动端对话框优化 */
  .wishlist-add-dialog {
    width: 95% !important;
    margin: 0 auto !important;
  }

  .dialog-content {
    padding: 24px 20px;
  }

  .dialog-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
  }

  .header-icon {
    width: 40px;
    height: 40px;
  }

  .header-text h3 {
    font-size: 20px;
  }

  .header-text p {
    font-size: 14px;
  }

  .add-form .el-form-item {
    margin-bottom: 20px;
  }

  .add-form .el-form-item__label {
    font-size: 15px;
  }

  .tags-form-item .predefined-tags {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 6px;
  }

  .tag-item {
    font-size: 12px !important;
    padding: 6px 12px !important;
  }

  .dialog-actions {
    margin-top: 24px;
    padding-top: 16px;
    flex-direction: column;
    gap: 12px;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
    padding: 14px 20px;
    font-size: 14px;
  }

  .page-header {
    padding: 24px 20px;
    margin-bottom: 24px;
  }

  .header-content {
    flex-direction: column;
    gap: 20px;
  }

  .page-title {
    font-size: 28px;
    gap: 10px;
  }

  .page-title .el-icon {
    font-size: 32px;
  }

  .header-stats {
    gap: 16px;
    justify-content: center;
  }

  .stat-item {
    padding: 12px 16px;
    min-width: 70px;
  }

  .stat-number {
    font-size: 24px;
  }

  /* 地图区域移动端样式 */
  .map-section {
    padding: 16px;
    margin-bottom: 24px;
  }

  .map-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .map-title {
    font-size: 18px;
  }

  .map-container {
    height: 300px;
  }

  .map-placeholder {
    padding: 20px 16px;
  }

  .map-placeholder h4 {
    font-size: 20px;
  }

  .map-placeholder p {
    font-size: 14px;
  }

  .coming-soon-features {
    gap: 6px;
  }

  .floating-actions {
    bottom: 24px;
    right: 24px;
  }

  .fab-main {
    width: 48px;
    height: 48px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .page-header {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border-color: rgba(99, 102, 241, 0.2);
  }

  .page-title {
    background: linear-gradient(135deg, #f9fafb 0%, #f7cac9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .page-subtitle {
    color: #d1d5db;
  }

  .stat-item {
    background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
    border-color: rgba(99, 102, 241, 0.2);
  }

  .stat-number {
    color: #f7cac9;
  }

  .stat-label {
    color: #d1d5db;
  }
}
</style>
