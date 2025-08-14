<template>
  <div class="page-shell footprints-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">
            <el-icon><Star /></el-icon>
            我的足迹
          </h1>
          <p class="page-subtitle">记录你的足迹，分享你的旅行故事</p>

          <!-- 快捷操作按钮组 -->
          <div class="quick-actions-buttons">
           <!-- 去过的城市照片展示 - 新组件 -->
           <VisitedCitiesGallery
             :visited-cities="visitedCities"
             :max-display-count="6"
             @photo-uploaded="handlePhotoUploaded"
             @photo-deleted="handlePhotoDeleted"
             @add-visited-city="handleOpenTypeSelection"
           />

            <!-- 足迹统计卡片 -->
          <FootprintStats
            :stats="wishlistStore.footprintStats"
            :has-data="wishlistStore.hasCities"
            @share="handleShareFootprint"
            @view-achievements="handleViewAchievements"
          />
          </div>
          
        </div>
      </div>
    </div>

    <!-- 足迹内容 -->
    <div class="page-content">
      <!-- 状态切换控制区域 -->
      <div v-if="wishlistStore.hasCities" class="view-control-section">
        <div class="control-header">
          <h3 class="control-title">
            <el-icon><View /></el-icon>
            地图显示模式
          </h3>
          <p class="control-subtitle">选择在地图上显示的城市类型，去过的城市已在上方展示</p>
        </div>
        
        <div class="view-mode-buttons">
          <el-button
            :type="mapDisplayMode === 'all' ? 'primary' : ''"
            size="large"
            class="mode-button"
            @click="mapDisplayMode = 'all'"
          >
            <el-icon><Location /></el-icon>
            全部显示
            <span class="mode-count">({{ wishlistStore.totalCount }})</span>
          </el-button>
          
          <el-button
            :type="mapDisplayMode === 'wishlist' ? 'primary' : ''"
            size="large" 
            class="mode-button wishlist-mode"
            @click="mapDisplayMode = 'wishlist'"
          >
            <el-icon><Star /></el-icon>
            想去的城市
            <span class="mode-count">({{ wishlistStore.wishlistOnlyCount }})</span>
          </el-button>
          
          <el-button
            :type="mapDisplayMode === 'visited' ? 'primary' : ''"
            size="large"
            class="mode-button visited-mode"
            @click="mapDisplayMode = 'visited'"
          >
            <el-icon><Check /></el-icon>
            去过的城市
            <span class="mode-count">({{ wishlistStore.visitedCount }})</span>
          </el-button>
        </div>
      </div>

      <!-- 地图区域 -->
      <div v-if="wishlistStore.hasCities" class="map-section">
        <div class="map-header">
          <div class="map-title-group">
            <h3 class="map-title">
              <el-icon><MapLocation /></el-icon>
              足迹地图
            </h3>
            <div class="footprint-stats">
              <span class="stat-badge visited">
                <el-icon><Check /></el-icon>
                已去过 {{ wishlistStore.visitedCount }}
              </span>
              <span class="stat-badge wishlist">
                <el-icon><Star /></el-icon>
                想去 {{ wishlistStore.wishlistOnlyCount }}
              </span>
              <span class="stat-badge provinces">
                <el-icon><Location /></el-icon>
                {{ wishlistStore.exploredProvincesCount }} 省份
              </span>
            </div>
          </div>
          <div class="map-controls">
            <el-button size="small" type="primary" @click="handleFullscreenMap">
              <el-icon><View /></el-icon>
              全屏查看
            </el-button>
          </div>
        </div>

        <div class="map-container">
          <ChinaWishlistMap
            :wishlist-items="mapDisplayItems"
            height="600px"
            :enable-map-click="true"
            :highlighted-city="highlightedCity"
            @city-click="handleMapCityClick"
            @map-click="handleMapClick"
            @map-right-click="handleMapRightClick"
          />
        </div>
      </div>

      <!-- 动态内容展示区域 -->
      <div v-if="wishlistStore.hasCities" class="content-display-area">
        
        <!-- 想去的城市卡片展示 -->
        <div 
          v-if="wishlistStore.wishlistOnlyCount > 0"
          class="wishlist-cities-cards"
        >
          <div class="section-header">
            <h4 class="section-title">
              <el-icon><Star /></el-icon>
              想去的城市 ({{ wishlistStore.wishlistOnlyCount }})
            </h4>
            <el-button
              size="small"
              type="primary"
              @click="handleOpenTypeSelection"
            >
              <el-icon><Plus /></el-icon>
              添加城市
            </el-button>
          </div>
          
          <div class="simple-cards-container">
            <div 
              v-for="item in wishlistCities" 
              :key="item.id"
              class="simple-wishlist-card"
              @click="handleCardClick(item)"
            >
              <div class="card-header">
                <h5 class="card-city-name">{{ item.cityName }}</h5>
                <div class="card-actions">
                  <el-button 
                    size="small"
                    type="success"
                    circle
                    @click.stop="handleStatusChange({ id: item.id, status: 'visited' })"
                  >
                    <el-icon><Check /></el-icon>
                  </el-button>
                </div>
              </div>
              
              <div v-if="item.tags && item.tags.length > 0" class="card-tags">
                <el-tag 
                  v-for="tag in item.tags.slice(0, 2)" 
                  :key="tag"
                  size="small"
                  class="card-tag"
                >
                  {{ tag }}
                </el-tag>
                <span v-if="item.tags.length > 2" class="more-tags">
                  +{{ item.tags.length - 2 }}
                </span>
              </div>
              
              <p v-if="item.reason" class="card-reason">
                {{ item.reason }}
              </p>
            </div>
            
            <!-- 空状态 -->
            <div v-if="wishlistCities.length === 0" class="empty-wishlist">
              <el-icon size="48"><Star /></el-icon>
              <p>还没有心愿城市</p>
              <el-button size="small" type="primary" @click="handleOpenTypeSelection">
                添加心愿城市
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 想去城市空状态 -->
        <div v-if="wishlistStore.wishlistOnlyCount === 0" class="empty-wishlist-state">
          <div class="empty-content">
            <el-icon size="64" color="#C0C4CC">
              <Star />
            </el-icon>
            <h4>还没有心愿城市</h4>
            <p>添加你想去的城市，开始规划你的旅行</p>
            <el-button type="primary" @click="handleOpenTypeSelection">
              <el-icon><Plus /></el-icon>
              添加第一个心愿城市
            </el-button>
          </div>
        </div>
        
      </div>

      <!-- 完全没有数据的空状态 -->
      <div v-if="!wishlistStore.hasCities" class="empty-wishlist">
        <el-icon size="64" color="#C0C4CC">
          <Star />
        </el-icon>
        <h4>开始你的足迹之旅</h4>
        <p>添加想去或去过的城市，在地图上记录你的足迹</p>

        <div class="empty-actions">
          <el-button type="primary" @click="handleOpenTypeSelection">
            <el-icon><Plus /></el-icon>
            添加第一个城市
          </el-button>
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
        @click="handleOpenTypeSelection"
      >
        <el-icon><Plus /></el-icon>
      </el-button>
    </div>

    <!-- 类型选择对话框 -->
    <el-dialog
      v-model="showTypeSelection"
      width="420px"
      class="type-selection-dialog"
      align-center
      :show-close="false"
    >
      <div class="type-selection-content">
        <div class="type-selection-header">
          <div class="header-icon">
            <el-icon size="24">
              <Plus />
            </el-icon>
          </div>
          <div class="header-text">
            <h3>选择添加类型</h3>
            <p>你想要添加哪种类型的城市？</p>
          </div>
        </div>

        <div class="type-options">
          <div 
            class="type-option wishlist-option"
            @click="handleAddTypeSelection('wishlist')"
          >
            <div class="option-icon">
              <el-icon size="32">
                <Star />
              </el-icon>
            </div>
            <div class="option-content">
              <h4>心愿城市</h4>
              <p>添加你想去的城市</p>
            </div>
          </div>

          <div 
            class="type-option visited-option"
            @click="handleAddTypeSelection('visited')"
          >
            <div class="option-icon">
              <el-icon size="32">
                <Check />
              </el-icon>
            </div>
            <div class="option-content">
              <h4>足迹城市</h4>
              <p>记录你去过的城市</p>
            </div>
          </div>
        </div>

        <div class="type-selection-actions">
          <el-button
            size="large"
            @click="showTypeSelection = false"
          >
            取消
          </el-button>
        </div>
      </div>
    </el-dialog>

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
            <h3>{{ dialogContent.title }}</h3>
            <p>{{ dialogContent.description }}</p>
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

          <el-form-item :label="dialogContent.reasonLabel" class="reason-form-item">
            <el-input
              v-model="quickAddForm.reason"
              type="textarea"
              :rows="3"
              :placeholder="dialogContent.reasonPlaceholder"
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
              {{ quickAdding ? "添加中..." : dialogContent.submitText }}
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
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Star,
  Plus,
  MapLocation,
  View,
  Search,
  Check,
  Location,
  Share,
  Camera,
  Delete,
} from "@element-plus/icons-vue";
import { useWishlistStore } from "@/store/wishlist.js";
import WishlistCard from "@/components/Common/Wishlist/WishlistCard.vue";
import MiniWishlistCard from "@/components/Common/Wishlist/MiniWishlistCard.vue";
import ChinaWishlistMap from "@/components/Common/Map/ChinaWishlistMap.vue";
import FootprintStats from "@/components/Common/Stats/FootprintStats.vue";
import VisitedCitiesGallery from "@/components/Common/Footprints/VisitedCitiesGallery.vue";
import pinyin from "pinyin";
import { debounce } from "@/utils/apiOptimizer.js";

export default {
  name: "FootprintsPage",
  components: {
    WishlistCard,
    MiniWishlistCard,
    ChinaWishlistMap,
    FootprintStats,
    VisitedCitiesGallery,
    Star,
    Plus,
    MapLocation,
    View,
    Search,
    Check,
    Location,
    Share,
    Camera,
    Delete,
  },
  setup() {
    const router = useRouter();
    const wishlistStore = useWishlistStore();

    // 快速添加功能
    const showQuickAdd = ref(false);
    const showTypeSelection = ref(false); // 添加类型选择对话框状态
    const selectedAddType = ref(''); // 选择的添加类型
    const quickAdding = ref(false);
    const quickAddForm = ref({
      selectedCity: null,
      selectedTags: [],
      reason: "",
      status: "wishlist", // 默认为想去
    });

    // 地图-卡片联动状态
    const highlightedCity = ref(null);
    const filterStatus = ref("all"); // all, visited, wishlist
    const mapDisplayMode = ref("all"); // 地图显示模式：all, visited, wishlist

    // 预定义标签
    const predefinedTags = ref([
      { name: "历史文化", color: "#91a8d0" },
      { name: "自然风光", color: "#7cb342" },
      { name: "美食之旅", color: "#fb8c00" },
      { name: "度假休闲", color: "#f7cac9" },
      { name: "购物天堂", color: "#8b5cf6" },
      { name: "艺术文化", color: "#06b6d4" },
      { name: "夜生活", color: "#ef4444" },
      { name: "亲子旅行", color: "#10b981" },
      { name: "冒险探索", color: "#f59e0b" },
      { name: "古镇古村", color: "#84cc16" },
      { name: "海滨城市", color: "#3b82f6" },
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

    // 筛选后的心愿清单
    const filteredWishlistItems = computed(() => {
      let items = [...wishlistStore.wishlistItems].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      if (filterStatus.value !== "all") {
        items = items.filter((item) => item.status === filterStatus.value);
      }

      return items;
    });

    // 动态对话框内容
    const dialogContent = computed(() => {
      const isVisited = quickAddForm.value.status === 'visited';
      return {
        title: isVisited ? '记录足迹城市' : '添加心愿城市',
        description: isVisited 
          ? '记录你去过的城市，分享你的旅行回忆' 
          : '选择你想去的城市，开启下一段旅程',
        reasonLabel: isVisited ? '旅行感受' : '想去的原因',
        reasonPlaceholder: isVisited 
          ? '分享一下你在这里的旅行感受...' 
          : '分享一下你想去这里的理由...',
        submitText: isVisited ? '添加到足迹' : '添加到心愿单'
      };
    });

    // 地图显示的城市数据
    const mapDisplayItems = computed(() => {
      if (mapDisplayMode.value === 'all') {
        return wishlistStore.wishlistItems;
      } else {
        return wishlistStore.wishlistItems.filter(item => item.status === mapDisplayMode.value);
      }
    });

    // 去过的城市
    const visitedCities = computed(() => {
      return wishlistStore.wishlistItems.filter(item => item.status === 'visited');
    });

    // 想去的城市
    const wishlistCities = computed(() => {
      return wishlistStore.wishlistItems.filter(item => item.status === 'wishlist');
    });

    // 地图-卡片联动事件
    const handleCardClick = (item) => {
      // 点击卡片时在地图上高亮对应城市
      highlightedCity.value = item.cityName;
      setTimeout(() => {
        highlightedCity.value = null;
      }, 3000); // 3秒后取消高亮
    };

    const handleCardHover = ({ item, type }) => {
      if (type === "enter") {
        highlightedCity.value = item.cityName;
      } else {
        highlightedCity.value = null;
      }
    };

    const handleMapCityClick = (cityData) => {
      // 点击地图城市时，可以显示详情或跳转
      ElMessage.success(`点击了${cityData.cityName}`);
    };

    const handleMapClick = (mapData) => {
      // 点击地图空白区域，显示添加城市对话框
      if (mapData.provinceName) {
        ElMessage.info(`点击了${mapData.provinceName}，可以添加该省份的城市`);
        showQuickAdd.value = true;
      }
    };

    const handleMapRightClick = (mapData) => {
      // 右键点击地图，快速添加菜单
      if (mapData.provinceName) {
        ElMessage.info(`右键点击${mapData.provinceName}，快速添加功能`);
      }
    };

    // 状态切换处理
    const handleStatusChange = async ({ id, status }) => {
      await wishlistStore.toggleCityStatus(id, status);
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

    // 足迹分享和成就功能
    const handleShareFootprint = async (stats) => {
      try {
        // 这里实现分享功能，可以生成图片或分享链接
        ElMessage.success("正在生成足迹分享图片...");
        // TODO: 实现实际的分享功能
      } catch (error) {
        console.error("分享失败:", error);
        ElMessage.error("分享失败，请重试");
      }
    };

    const handleViewAchievements = () => {
      // 显示全部成就页面或弹窗
      ElMessage.info("成就系统开发中...");
    };

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
          status: quickAddForm.value.status, // 添加状态字段
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

    // 处理类型选择
    const handleAddTypeSelection = (type) => {
      selectedAddType.value = type;
      quickAddForm.value.status = type;
      showTypeSelection.value = false;
      showQuickAdd.value = true;
    };

    // 打开类型选择对话框
    const handleOpenTypeSelection = () => {
      showTypeSelection.value = true;
    };

    // 关闭快速添加对话框
    const handleQuickAddClose = () => {
      showQuickAdd.value = false;
      quickAddForm.value = {
        selectedCity: null,
        selectedTags: [],
        reason: "",
        status: "wishlist",
      };
      searchKeyword.value = "";
      searchResults.value = allCities.value.slice(0, 20);
    };

    // 照片事件处理
    const handlePhotoUploaded = async (city) => {
      ElMessage.success(`${city.cityName} 的照片上传成功！`);
      // 可以在这里执行额外的逻辑，如刷新数据等
    };

    const handlePhotoDeleted = async (photo) => {
      ElMessage.success('照片删除成功');
      // 可以在这里执行额外的逻辑，如刷新数据等
    };

    // 地图相关功能
    const handleFullscreenMap = () => {
      // 全屏查看地图功能
      ElMessage.info("全屏地图功能开发中...");
    };

    // 页面初始化
    onMounted(() => {
      wishlistStore.loadWishlist();
      loadCityData();
    });

    return {
      wishlistStore,
      filteredWishlistItems,
      dialogContent,
      // 地图显示控制
      mapDisplayMode,
      mapDisplayItems,
      visitedCities,
      wishlistCities,
      // 地图-卡片联动
      highlightedCity,
      filterStatus,
      handleCardClick,
      handleCardHover,
      handleMapCityClick,
      handleMapClick,
      handleMapRightClick,
      handleStatusChange,
      // 足迹功能
      handleShareFootprint,
      handleViewAchievements,
      // 照片事件处理
      handlePhotoUploaded,
      handlePhotoDeleted,
      // 卡片事件
      handleRemove,
      handleEdit,
      handleViewWeather,
      handlePlanTrip,
      // 类型选择功能
      showTypeSelection,
      selectedAddType,
      handleAddTypeSelection,
      handleOpenTypeSelection,
      // 快速添加功能
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
      // 地图相关
      handleFullscreenMap,
    };
  },
};
</script>

<style scoped>
.footprints-page {
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
  flex-direction: column;
  gap: 20px;
}

.header-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quick-actions-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}

.quick-actions-buttons .el-button {
  border-radius: 20px;
  padding: 8px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* 想去城市空状态样式 */
.empty-wishlist-state {
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-radius: 16px;
  padding: 40px 24px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  box-shadow: 0 2px 12px rgba(145, 168, 208, 0.06);
  text-align: center;
}

.empty-content h4 {
  margin: 20px 0 10px 0;
  font-size: 20px;
  font-weight: 600;
  color: #374151;
}

.empty-content p {
  margin: 0 0 30px 0;
  font-size: 16px;
  line-height: 1.5;
  color: #6b7280;
}

.empty-content .el-button {
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.3);
  transition: all 0.3s ease;
}

.empty-content .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(145, 168, 208, 0.4);
}

.quick-actions-buttons .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.3);
}

/* 去过的城市展示区域 */
.visited-cities-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(145, 168, 208, 0.1);
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
  flex-shrink: 0;
  min-width: 300px;
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

/* 页面内容布局优化 */
.page-content {
  position: relative;
}

/* 心愿城市列表样式 */
.wishlist-section {
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  box-shadow: 0 2px 12px rgba(145, 168, 208, 0.06);
  margin-bottom: 24px;
}

/* 地图区域样式 - 全宽度版本 */
.map-section {
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(145, 168, 208, 0.12);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(145, 168, 208, 0.08);
  margin-bottom: 24px;
  min-height: 500px;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.map-title-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.map-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.map-title .el-icon {
  color: #91a8d0;
  font-size: 20px;
}

.footprint-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid transparent;
}

.stat-badge.visited {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
  border-color: rgba(217, 119, 6, 0.2);
}

.stat-badge.wishlist {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
  border-color: rgba(29, 78, 216, 0.2);
}

.stat-badge.provinces {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  color: #7c3aed;
  border-color: rgba(124, 58, 237, 0.2);
}

.map-controls {
  display: flex;
  gap: 12px;
}

.map-container {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  min-height: 400px;
}

/* 心愿城市列表样式 */
.wishlist-section {
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  box-shadow: 0 2px 12px rgba(145, 168, 208, 0.06);
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title .el-icon {
  color: #91a8d0;
  font-size: 18px;
}

.section-actions {
  flex-shrink: 0;
}

/* 心愿城市卡片容器 - 优化版本 */
.wishlist-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
  padding: 4px;
}

.wishlist-cards-container::-webkit-scrollbar {
  width: 4px;
}

.wishlist-cards-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.wishlist-cards-container::-webkit-scrollbar-thumb {
  background: #91a8d0;
  border-radius: 2px;
}

/* 小型空状态 */
.empty-wishlist-mini {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-wishlist-mini p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

/* 空状态 */
.empty-wishlist {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-wishlist h4 {
  margin: 20px 0 10px 0;
  font-size: 20px;
  font-weight: 600;
  color: #374151;
}

.empty-wishlist p {
  margin: 0 0 30px 0;
  font-size: 16px;
  line-height: 1.5;
}

.empty-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

/* 悬浮按钮 */
.floating-actions {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 1000;
}

.fab-main {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(145, 168, 208, 0.3);
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border: none;
  transition: all 0.3s ease;
}

.fab-main:hover {
  transform: translateY(-4px) scale(1.1);
  box-shadow: 0 8px 24px rgba(145, 168, 208, 0.4);
}

/* 对话框样式 */
.wishlist-add-dialog {
  border-radius: 20px;
}

/* 类型选择对话框样式 */
.type-selection-dialog {
  border-radius: 20px;
}

.type-selection-content {
  padding: 32px 24px;
}

.type-selection-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(145, 168, 208, 0.1);
}

.type-selection-header .header-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.type-selection-header .header-text h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.type-selection-header .header-text p {
  margin: 0;
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
}

.type-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.type-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
}

.type-option:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 16px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.wishlist-option:hover {
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
}

.visited-option:hover {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.type-option .option-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.wishlist-option .option-icon {
  background: linear-gradient(135deg, #91a8d0 0%, #6366f1 100%);
  color: white;
}

.visited-option .option-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.type-option .option-content h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.type-option .option-content p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.type-selection-actions {
  display: flex;
  justify-content: center;
  padding-top: 20px;
  border-top: 1px solid rgba(145, 168, 208, 0.1);
}

.type-selection-actions .el-button {
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 500;
  border-color: #d1d5db;
  color: #6b7280;
}

.dialog-content {
  padding: 32px 24px;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(145, 168, 208, 0.1);
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
  font-size: 24px;
}

.header-text h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.header-text p {
  margin: 0;
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
}

.add-form .el-form-item {
  margin-bottom: 24px;
}

.add-form .el-form-item__label {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.city-selector {
  width: 100%;
}

.city-option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.city-name {
  font-weight: 500;
  color: #1f2937;
}

.city-code {
  font-size: 12px;
  color: #9ca3af;
}

.no-results {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #9ca3af;
  font-size: 14px;
}

/* 状态选择样式 */
.status-form-item .status-radio-group {
  width: 100%;
  display: flex;
}

.status-radio-group .el-radio-button {
  flex: 1;
}

.status-radio-group .el-radio-button__inner {
  width: 100%;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 20px;
}

.wishlist-radio .el-radio-button__inner {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #64748b;
}

.wishlist-radio.is-active .el-radio-button__inner {
  background: linear-gradient(135deg, #91a8d0 0%, #6366f1 100%);
  border-color: #91a8d0;
  color: white;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.3);
}

.visited-radio .el-radio-button__inner {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #64748b;
}

.visited-radio.is-active .el-radio-button__inner {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-color: #f59e0b;
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

/* 标签选择 */
.tags-selection {
  width: 100%;
}

.predefined-tags {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
}

.tag-item {
  background: var(--tag-color, #91a8d0) !important;
  color: white !important;
  border: 2px solid transparent !important;
  border-radius: 20px !important;
  padding: 8px 16px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  cursor: pointer;
  text-align: center;
  opacity: 0.8;
}

.tag-item:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  opacity: 0.9;
}

.tag-item.is-checked {
  opacity: 1 !important;
  border-color: #1f2937 !important;
  transform: translateY(-2px) scale(1.05) !important;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25) !important;
  font-weight: 600 !important;
}

/* 原因输入 */
.reason-input {
  width: 100%;
}

.reason-input .el-textarea__inner {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 15px;
  line-height: 1.6;
  resize: none;
}

.reason-input .el-textarea__inner:focus {
  border-color: #91a8d0;
  box-shadow: 0 0 0 3px rgba(145, 168, 208, 0.1);
}

/* 对话框操作按钮 */
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid rgba(145, 168, 208, 0.1);
}

.cancel-btn {
  border-radius: 12px !important;
  padding: 12px 24px !important;
  font-weight: 500 !important;
  border-color: #d1d5db !important;
  color: #6b7280 !important;
}

.submit-btn {
  border-radius: 12px !important;
  padding: 12px 24px !important;
  font-weight: 600 !important;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.3) !important;
}

.submit-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(145, 168, 208, 0.4) !important;
}

/* 状态切换控制区域样式 */
.view-control-section {
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-radius: 16px;
  padding: 20px 24px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  box-shadow: 0 2px 12px rgba(145, 168, 208, 0.06);
  margin-bottom: 24px;
}

.control-header {
  margin-bottom: 20px;
}

.control-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-title .el-icon {
  color: #91a8d0;
  font-size: 20px;
}

.control-subtitle {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.view-mode-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.mode-button {
  border-radius: 12px !important;
  padding: 12px 20px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.mode-button:not(.el-button--primary) {
  background: #f8fafc !important;
  border-color: #e2e8f0 !important;
  color: #64748b !important;
}

.mode-button:not(.el-button--primary):hover {
  background: #f1f5f9 !important;
  border-color: #91a8d0 !important;
  color: #1f2937 !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15) !important;
}

.mode-button.el-button--primary {
  background: linear-gradient(135deg, #91a8d0 0%, #6366f1 100%) !important;
  border: none !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.3) !important;
}

.mode-count {
  font-size: 12px;
  opacity: 0.8;
  margin-left: 4px;
}

/* 动态内容展示区域 */
.content-display-area {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 去过的城市照片展示区域 */
.visited-cities-photos {
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-radius: 16px;
  padding: 20px 24px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  box-shadow: 0 2px 12px rgba(145, 168, 208, 0.06);
}

.photos-scroll-container {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 8px 0;
  scroll-behavior: smooth;
}

.photos-scroll-container::-webkit-scrollbar {
  height: 6px;
}

.photos-scroll-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.photos-scroll-container::-webkit-scrollbar-thumb {
  background: #91a8d0;
  border-radius: 3px;
}

.city-photo-item {
  flex-shrink: 0;
  width: 200px;
}

.photo-wrapper {
  position: relative;
  width: 100%;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.photo-wrapper:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.city-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.photo-wrapper:hover .city-photo {
  transform: scale(1.05);
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 16px 12px 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  opacity: 0;
  transition: all 0.3s ease;
}

.photo-wrapper:hover .photo-overlay {
  opacity: 1;
}

.city-name {
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.upload-btn {
  background: rgba(255, 255, 255, 0.9) !important;
  color: #1f2937 !important;
  border: none !important;
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  transition: all 0.3s ease !important;
}

.upload-btn:hover {
  background: white !important;
  transform: scale(1.1) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

.empty-photos {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
  min-width: 300px;
}

.empty-photos .el-icon {
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-photos p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

/* 想去的城市卡片展示区域 */
.wishlist-cities-cards {
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-radius: 16px;
  padding: 20px 24px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  box-shadow: 0 2px 12px rgba(145, 168, 208, 0.06);
}

.simple-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
}

.simple-cards-container::-webkit-scrollbar {
  width: 4px;
}

.simple-cards-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.simple-cards-container::-webkit-scrollbar-thumb {
  background: #91a8d0;
  border-radius: 2px;
}

.simple-wishlist-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid rgba(145, 168, 208, 0.1);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.simple-wishlist-card:hover {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-color: #91a8d0;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(145, 168, 208, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card-city-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-actions .el-button {
  border-radius: 8px !important;
  padding: 6px !important;
  width: 32px !important;
  height: 32px !important;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.card-tag {
  font-size: 12px !important;
  padding: 2px 8px !important;
  border-radius: 10px !important;
  background: #91a8d0 !important;
  color: white !important;
  border: none !important;
}

.more-tags {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.card-reason {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-wishlist {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.empty-wishlist .el-icon {
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-wishlist p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footprints-page {
    padding: 16px 12px;
  }

  .page-header {
    padding: 24px 20px;
    margin-bottom: 24px;
  }

  .header-content {
    gap: 16px;
  }

  .header-left {
    gap: 12px;
  }

  /* 移动端头部照片展示 */
  .header-visited-cities {
    padding: 16px 20px;
    border-radius: 16px;
  }

  .header-visited-cities::after {
    font-size: 8px;
    letter-spacing: 1px;
  }

  .header-photos-container {
    gap: 12px;
    padding: 8px 4px 6px;
  }

  .header-visited-cities .city-photo-item {
    width: 80px;
  }

  .header-visited-cities .photo-wrapper {
    height: 60px;
  }

  .header-visited-cities .city-name {
    font-size: 10px;
  }

  .header-visited-cities .visit-date {
    font-size: 8px;
  }

  .film-holes .hole {
    width: 2px;
    height: 2px;
  }

  .more-cities-btn {
    width: 80px;
    height: 60px;
  }

  .more-cities-btn .el-button {
    font-size: 11px !important;
  }

  .quick-actions-buttons {
    gap: 12px;
  }

  .page-title {
    font-size: 28px;
    gap: 10px;
  }

  .page-title .el-icon {
    font-size: 32px;
  }

  .quick-actions-buttons {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .quick-actions-buttons .el-button {
    width: 100%;
  }

  .header-stats {
    gap: 16px;
    justify-content: center;
    min-width: unset;
    width: 100%;
  }

  /* 移动端地图区域优化 */
  .map-section {
    padding: 16px;
    min-height: 300px;
    margin-bottom: 16px;
  }

  .map-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .map-title-group {
    width: 100%;
  }

  .footprint-stats {
    flex-wrap: wrap;
    gap: 8px;
  }

  .stat-badge {
    font-size: 12px;
    padding: 4px 8px;
  }

  .map-title {
    font-size: 16px;
  }

  .map-container {
    min-height: 250px;
  }

  /* 移动端单栏布局 - 移除不需要的样式 */
  .wishlist-section {
    padding: 16px;
  }

  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .section-title {
    font-size: 14px;
  }

  .section-actions {
    width: 100%;
  }

  .section-actions .el-button-group {
    width: 100%;
  }

  .section-actions .el-button {
    flex: 1;
    font-size: 12px;
  }

  /* 移动端卡片容器 */
  .wishlist-cards-container {
    grid-template-columns: 1fr;
    gap: 8px;
    max-height: 300px;
  }

  .empty-wishlist-mini {
    padding: 30px 16px;
  }

  .floating-actions {
    bottom: 24px;
    right: 24px;
  }

  .fab-main {
    width: 48px;
    height: 48px;
  }

  /* 移动端状态切换控制区域 */
  .view-control-section {
    padding: 16px 20px;
    margin-bottom: 16px;
  }

  .control-header {
    margin-bottom: 16px;
  }

  .control-title {
    font-size: 16px;
  }

  .control-subtitle {
    font-size: 13px;
  }

  /* 移动端空状态样式 */
  .empty-wishlist-state {
    padding: 30px 20px;
  }

  .empty-content h4 {
    font-size: 18px;
  }

  .empty-content p {
    font-size: 14px;
    margin-bottom: 24px;
  }

  .empty-content .el-button {
    padding: 10px 20px;
    font-size: 14px;
  }

  .view-mode-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .mode-button {
    width: 100% !important;
    justify-content: center !important;
    padding: 10px 16px !important;
    font-size: 14px !important;
  }

  /* 移动端动态内容展示区域 */
  .content-display-area {
    gap: 16px;
  }

  /* 移动端照片展示区域 */
  .visited-cities-photos {
    padding: 16px 20px;
  }

  .photos-scroll-container {
    gap: 12px;
  }

  .city-photo-item {
    width: 160px;
  }

  .photo-wrapper {
    height: 120px;
  }

  .photo-overlay {
    padding: 12px 10px 8px;
  }

  .city-name {
    font-size: 13px;
  }

  .upload-btn {
    width: 28px !important;
    height: 28px !important;
  }

  .empty-photos {
    padding: 30px 16px;
    min-width: 250px;
  }

  .empty-photos .el-icon {
    font-size: 40px !important;
  }

  .empty-photos p {
    font-size: 13px;
  }

  /* 移动端卡片展示区域 */
  .wishlist-cities-cards {
    padding: 16px 20px;
  }

  .simple-cards-container {
    grid-template-columns: 1fr;
    gap: 12px;
    max-height: 300px;
  }

  .simple-wishlist-card {
    padding: 14px;
  }

  .card-city-name {
    font-size: 15px;
  }

  .card-actions .el-button {
    width: 28px !important;
    height: 28px !important;
    padding: 4px !important;
  }

  .card-tag {
    font-size: 11px !important;
    padding: 1px 6px !important;
  }

  .more-tags {
    font-size: 11px;
  }

  .card-reason {
    font-size: 12px;
  }

  .empty-wishlist {
    padding: 30px 16px;
    min-height: 150px;
  }

  .empty-wishlist .el-icon {
    font-size: 40px !important;
  }

  .empty-wishlist p {
    font-size: 13px;
  }

  /* 移动端对话框优化 */
  .wishlist-add-dialog {
    width: 95% !important;
    margin: 0 auto !important;
  }

  .type-selection-dialog {
    width: 95% !important;
    margin: 0 auto !important;
  }

  .type-selection-content {
    padding: 24px 20px;
  }

  .type-selection-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
  }

  .type-selection-header .header-icon {
    width: 40px;
    height: 40px;
  }

  .type-selection-header .header-text h3 {
    font-size: 20px;
  }

  .type-selection-header .header-text p {
    font-size: 14px;
  }

  .type-options {
    gap: 12px;
    margin-bottom: 24px;
  }

  .type-option {
    padding: 16px;
  }

  .type-option .option-icon {
    width: 48px;
    height: 48px;
  }

  .type-option .option-content h4 {
    font-size: 16px;
  }

  .type-option .option-content p {
    font-size: 13px;
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

  .status-radio-group .el-radio-button__inner {
    padding: 10px 16px;
    font-size: 14px;
  }

  .predefined-tags {
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
