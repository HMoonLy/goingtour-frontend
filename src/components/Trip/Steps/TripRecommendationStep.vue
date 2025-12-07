<!--
✈️ 推荐选择步骤 - 独立的推荐选择流程
让用户专注于选择景点和餐厅，不被其他信息干扰
-->

<template>
  <div class="trip-recommendation-step">
    <!-- 页面头部 -->
    <div class="step-header">
      <div class="header-content">
        <div class="header-icon">
          <el-icon><Star /></el-icon>
        </div>
        <div class="header-text">
          <h2 class="step-title">🗺️ {{ cityInfo?.destinationName || '目的地' }}热门推荐</h2>
          <p class="step-subtitle">基于高德地图数据为您推荐热门景点和餐厅，选择您感兴趣的进行旅行规划</p>
        </div>
      </div>
      
      <!-- 进度提示 -->
      <div class="progress-hint">
        <div class="hint-content">
          <el-icon><InfoFilled /></el-icon>
          <span>💡 基于高德地图数据，为您推荐该地区的热门景点和餐厅</span>
        </div>
      </div>
    </div>

    <!-- 推荐内容区域 -->
    <div class="recommendation-main">
      <RecommendationSection
        :city-info="cityInfo"
        :recommended-attractions="recommendedAttractions"
        :recommended-restaurants="recommendedRestaurants"
        :selected-attractions="selectedAttractions"
        :selected-restaurants="selectedRestaurants"
        :loading-attractions="loadingAttractions"
        :loading-restaurants="loadingRestaurants"
        :api-error="apiError"
        :search-results="searchResults"
        :is-search-mode="isSearchMode"
        :searching="searching"
        :extract-attraction-tags="extractAttractionTags"
        :extract-signature-dishes="extractSignatureDishes"
        :attraction-pagination="attractionPagination"
        :restaurant-pagination="restaurantPagination"
        :loading-more-attractions="loadingMoreAttractions"
        :loading-more-restaurants="loadingMoreRestaurants"
        :attraction-load-complete="attractionLoadComplete"
        :restaurant-load-complete="restaurantLoadComplete"
        @add-attraction="handleAddAttraction"
        @remove-attraction="handleRemoveAttraction"
        @add-restaurant="handleAddRestaurant"
        @remove-restaurant="handleRemoveRestaurant"
        @load-more-attractions="handleLoadMoreAttractions"
        @load-more-restaurants="handleLoadMoreRestaurants"
        @search="handleSearch"
        @clear-search="handleClearSearch"
        @clear-all-selections="handleClearAllSelections"
      />
    </div>

    <!-- 底部操作区域 -->
    <div class="step-actions">
      <div class="actions-content">
        <!-- 左侧：选择摘要 -->
        <div class="selection-summary">
          <div class="summary-stats">
            <div class="stat-item">
              <el-icon class="stat-icon" color="#91a8d0"><Location /></el-icon>
              <span>{{ selectedAttractions.length }} 个景点</span>
            </div>
            <div class="stat-item">
              <el-icon class="stat-icon" color="#f7cac9"><Food /></el-icon>
              <span>{{ selectedRestaurants.length }} 家餐厅</span>
            </div>
          </div>
          <div v-if="totalSelected > 0" class="selection-tip">
            <el-icon><Check /></el-icon>
            <span>已选择 {{ totalSelected }} 项，可以继续生成行程</span>
          </div>
          <div v-else class="no-selection-tip">
            <el-icon><Warning /></el-icon>
            <span>建议至少选择1个景点或餐厅</span>
          </div>
        </div>

        <!-- 右侧：操作按钮 -->
        <div class="action-buttons">
          <el-button
            size="large"
            :disabled="generating"
            @click="$emit('prev-step')"
          >
            <el-icon><ArrowLeft /></el-icon>
            上一步
          </el-button>
          
          <el-button
            type="primary"
            size="large"
            :disabled="generating"
            @click="handleContinue"
          >
            <el-icon><ArrowRight /></el-icon>
            {{ totalSelected > 0 ? '继续生成行程' : '跳过直接生成' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 推荐助手提示 -->
    <div v-if="showAiTip" class="ai-tip-card">
      <div class="ai-tip-content">
        <div class="ai-tip-header">
          <el-icon class="ai-icon"><MagicStick /></el-icon>
          <h4>💡 推荐建议</h4>
          <el-button 
            link 
            size="small" 
            @click="showAiTip = false"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        <div class="ai-tip-text">
          {{ getAiTipText() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Star, InfoFilled, Location, Food, Check, Warning,
  ArrowLeft, ArrowRight, MagicStick, Close
} from '@element-plus/icons-vue';
import RecommendationSection from '../Cards/RecommendationSection.vue';
import { getRecommendedAttractions, getRecommendedRestaurants } from '@/api/amap.js';
import { useAmap } from '@/composables/useAmap.js';

export default {
  name: 'TripRecommendationStep',
  components: {
    RecommendationSection,
    Star, InfoFilled, Location, Food, Check, Warning,
    ArrowLeft, ArrowRight, MagicStick, Close
  },
  props: {
    // 城市信息
    cityInfo: {
      type: Object,
      default: () => ({})
    },
    // 行程基础信息
    baseForm: {
      type: Object,
      required: true
    },
    // 偏好信息
    preferenceForm: {
      type: Object,
      default: () => ({})
    },
    // 生成状态
    generating: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'prev-step',
    'next-step', 
    'selections-updated',
    'save-draft'
  ],
  setup(props, { emit }) {
    // 使用地图服务composable
    const { searchPlaces } = useAmap();

    // 推荐数据
    const recommendedAttractions = ref([]);
    const recommendedRestaurants = ref([]);
    const selectedAttractions = ref([]);
    const selectedRestaurants = ref([]);

    // 加载状态
    const loadingAttractions = ref(false);
    const loadingRestaurants = ref(false);
    const loadingMoreAttractions = ref(false);
    const loadingMoreRestaurants = ref(false);
    const apiError = ref(null);
    const hasLoaded = ref(false); // 防止重复加载
    const currentCityName = ref(''); // 记录当前已加载的城市
    
    // 加载完成状态
    const attractionLoadComplete = ref(false);
    const restaurantLoadComplete = ref(false);

    // 搜索相关
    const searchResults = ref([]);
    const isSearchMode = ref(false);
    const searching = ref(false);

    // 分页相关状态（用于加载更多）
    const attractionPagination = ref({
      currentPage: 1,
      pageSize: 9,
      total: 0
    });
    
    const restaurantPagination = ref({
      currentPage: 1,
      pageSize: 6,
      total: 0
    });

    // AI提示
    const showAiTip = ref(true);

    // 计算属性
    const totalSelected = computed(() => 
      selectedAttractions.value.length + selectedRestaurants.value.length
    );

    // 从POI数据中提取标签
    const extractTags = (poi) => {
      const tags = [];
      
      // 处理type字段 - 过滤掉通用的服务分类
      if (poi.type && typeof poi.type === 'string') {
        const typeSegments = poi.type.split(';').filter(Boolean).filter(token => {
          const trimmed = token.trim();
          // 过滤掉通用的餐饮服务分类
          const excludeTypes = [
            "餐饮服务", "中餐厅", "外国餐厅", "快餐厅", "咖啡厅", 
            "茶艺馆", "酒吧", "食品", "商务服务", "生活服务"
          ];
          return !excludeTypes.some(exclude => trimmed.includes(exclude));
        });
        tags.push(...typeSegments);
      }
      
      // 处理tag字段 - 只提取推荐菜品相关内容
      if (poi.tag && typeof poi.tag === 'string') {
        const dishTags = extractSignatureDishes(poi);
        tags.push(...dishTags);
      }
      
      // 从business_area提取
      if (poi.business_area && typeof poi.business_area === 'string') {
        tags.push(poi.business_area);
      }
      
      // 去重并过滤空值，确保tag是字符串
      return [...new Set(tags)].filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0);
    };

    // 提取景点标签
    const extractAttractionTags = (attraction) => {
      return attraction.tags || [];
    };

    // 提取餐厅招牌菜
    const extractSignatureDishes = (restaurant) => {
      if (
        !restaurant ||
        !restaurant.tag ||
        typeof restaurant.tag !== "string"
      ) {
        return restaurant.tags || [];
      }

      const dishes = [];
      const tagContent = restaurant.tag;
      
      // 支持多种分隔符
      const separators = [",", "，", "、", ";", "；", "|"];
      let tagTokens = [tagContent];
      
      // 找到合适的分隔符并分割
      for (const separator of separators) {
        if (tagContent.includes(separator)) {
          tagTokens = tagContent.split(separator);
          break;
        }
      }

      // 过滤掉明显的非菜品标签
      const excludeKeywords = [
        "餐饮服务", "中餐厅", "外国餐厅", "快餐厅", "咖啡厅", 
        "茶艺馆", "酒吧", "商务服务", "生活服务", "环境", "价格", 
        "停车", "位置", "交通", "商圈", "商场", "广场", "设施", 
        "装修", "氛围", "音乐", "包间", "营业时间", "电话", "地址"
      ];

      tagTokens.forEach((token) => {
        const trimmedToken = token.trim();
        
        // 基本过滤：长度合理，不为空
        if (trimmedToken.length > 0 && trimmedToken.length <= 20) {
          // 检查是否包含排除关键词
          const shouldExclude = excludeKeywords.some(keyword => 
            trimmedToken.includes(keyword)
          );
          
          if (!shouldExclude) {
            dishes.push(trimmedToken);
          }
        }
      });

      return [...new Set(dishes)]; // 去重
    };

      // 加载推荐数据(分页加载)
      const loadRecommendations = async (forceReload = false) => {
        const cityName = props.cityInfo?.destinationName;
        
        if (!cityName) {
          console.warn('缺少城市信息，无法加载推荐');
          return;
        }
        
        // 如果城市变化或强制重载，重置状态
        const shouldReset = currentCityName.value !== cityName || forceReload;
        
        if (shouldReset) {
          console.log('🔄 重置数据和分页状态', { 
            cityChange: currentCityName.value !== cityName,
            forceReload,
            from: currentCityName.value, 
            to: cityName 
          });
          hasLoaded.value = false;
          currentCityName.value = '';
          recommendedAttractions.value = [];
          recommendedRestaurants.value = [];
          // 重置分页状态
          attractionPagination.value.currentPage = 1;
          attractionPagination.value.total = 0;
          restaurantPagination.value.currentPage = 1;
          restaurantPagination.value.total = 0;
          // 重置加载完成状态
          attractionLoadComplete.value = false;
          restaurantLoadComplete.value = false;
        }
        
        // 防止重复加载
        if (!shouldReset && hasLoaded.value && currentCityName.value === cityName) {
          console.log('🛑 该城市数据已加载，跳过重复请求，当前城市:', cityName);
          return;
        }
        
        console.log('🚀 开始为城市加载推荐数据:', cityName);

      try {
        loadingAttractions.value = true;
        loadingRestaurants.value = true;
        apiError.value = null;

        // 并行加载景点和餐厅推荐(基于分页参数)
        const [attractionsResponse, restaurantsResponse] = await Promise.all([
          getRecommendedAttractions(
            props.cityInfo.destinationName, 
            attractionPagination.value.currentPage, 
            attractionPagination.value.pageSize
          ).catch(err => {
            console.warn('景点推荐API调用失败:', err);
            if (err.message && err.message.includes('CUQPS_HAS_EXCEEDED_THE_LIMIT')) {
              throw new Error('API调用次数已达上限，请稍后再试');
            }
            return { pois: [], count: 0 };
          }),
          getRecommendedRestaurants(
            props.cityInfo.destinationName, 
            restaurantPagination.value.currentPage, 
            restaurantPagination.value.pageSize
          ).catch(err => {
            console.warn('餐厅推荐API调用失败:', err);
            if (err.message && err.message.includes('CUQPS_HAS_EXCEEDED_THE_LIMIT')) {
              throw new Error('API调用次数已达上限，请稍后再试');
            }
            return { pois: [], count: 0 };
          })
        ]);
        // 格式化景点数据
        if (attractionsResponse.pois && attractionsResponse.pois.length > 0) {
          recommendedAttractions.value = attractionsResponse.pois.map((poi) => ({
            id: poi.id,
            name: poi.name,
            address: poi.address,
            rating: (poi.biz_ext && poi.biz_ext.rating) || "4.5",
            photos: poi.photos || [],
            type: poi.type ? poi.type.split(";")[0] : "景点",
            distance: poi.distance || null,
            tags: extractTags(poi),
            tag: poi.tag,
          }));
        } else {
          recommendedAttractions.value = [];
        }
        
        // 更新景点分页信息
        attractionPagination.value.total = Number(attractionsResponse.count) || attractionsResponse.pois?.length || 0;

        // 格式化餐厅数据
        if (restaurantsResponse.pois && restaurantsResponse.pois.length > 0) {
          recommendedRestaurants.value = restaurantsResponse.pois.map((poi) => ({
            id: poi.id,
            name: poi.name,
            address: poi.address,
            rating: (poi.biz_ext && poi.biz_ext.rating) || "4.5",
            photos: poi.photos || [],
            type: poi.type ? poi.type.split(";")[0] : "餐厅",
            price: (poi.biz_ext && poi.biz_ext.cost) || "¥¥",
            tags: extractTags(poi),
            tag: poi.tag,
          }));
        } else {
          recommendedRestaurants.value = [];
        }
        
        // 更新餐厅分页信息
        restaurantPagination.value.total = Number(restaurantsResponse.count) || restaurantsResponse.pois?.length || 0;
        // 标记已加载，防止重复请求
        hasLoaded.value = true;
        currentCityName.value = cityName;

      } catch (error) {
        console.error('❌ 加载推荐数据失败:', error);
        apiError.value = error.message || '推荐数据加载失败';
      } finally {
        loadingAttractions.value = false;
        loadingRestaurants.value = false;
      }
    };

    // 景点操作
    const handleAddAttraction = (attraction) => {
      selectedAttractions.value.push(attraction);
      emitSelectionUpdate();
      ElMessage.success(`已添加景点：${attraction.name}`);
    };

    const handleRemoveAttraction = (attraction) => {
      const index = selectedAttractions.value.findIndex(a => a.id === attraction.id);
      if (index > -1) {
        selectedAttractions.value.splice(index, 1);
        emitSelectionUpdate();
        ElMessage.info(`已移除景点：${attraction.name}`);
      }
    };

    // 餐厅操作
    const handleAddRestaurant = (restaurant) => {
      selectedRestaurants.value.push(restaurant);
      emitSelectionUpdate();
      ElMessage.success(`已添加餐厅：${restaurant.name}`);
    };

    const handleRemoveRestaurant = (restaurant) => {
      const index = selectedRestaurants.value.findIndex(r => r.id === restaurant.id);
      if (index > -1) {
        selectedRestaurants.value.splice(index, 1);
        emitSelectionUpdate();
        ElMessage.info(`已移除餐厅：${restaurant.name}`);
      }
    };

    // 加载更多处理函数
    const handleLoadMoreAttractions = async () => {
      if (loadingMoreAttractions.value || attractionLoadComplete.value) {
        return;
      }
      
      const nextPage = attractionPagination.value.currentPage + 1;
      
      console.log('🔄 加载更多景点:', { 
        当前页: attractionPagination.value.currentPage,
        下一页: nextPage,
        城市: props.cityInfo?.destinationName,
        当前数据量: recommendedAttractions.value.length
      });
      
      try {
        loadingMoreAttractions.value = true;
        
        console.log('📡 开始加载更多景点数据...');
        const response = await getRecommendedAttractions(
          props.cityInfo.destinationName, 
          nextPage, 
          attractionPagination.value.pageSize
        ).catch(err => {
          console.warn('加载更多景点数据API调用失败:', err);
          if (err.message && err.message.includes('CUQPS_HAS_EXCEEDED_THE_LIMIT')) {
            ElMessage.warning('API调用次数已达上限，无法加载更多数据');
            throw err;
          }
          throw err;
        });
        
        console.log('📦 API响应数据:', {
          总数: response.count,
          数据长度: response.pois?.length,
          前2项: response.pois?.slice(0, 2).map(poi => poi.name)
        });
        
        if (response.pois && response.pois.length > 0) {
          // 累积模式：将新数据添加到现有数据后面
          const newAttractions = response.pois.map((poi) => ({
            id: poi.id,
            name: poi.name,
            address: poi.address,
            rating: (poi.biz_ext && poi.biz_ext.rating) || "4.5",
            photos: poi.photos || [],
            type: poi.type ? poi.type.split(";")[0] : "景点",
            distance: poi.distance || null,
            tags: extractTags(poi),
            tag: poi.tag,
          }));
          
          // 去重处理，避免重复数据
          const existingIds = new Set(recommendedAttractions.value.map(item => item.id));
          const uniqueNewAttractions = newAttractions.filter(item => !existingIds.has(item.id));
          
          recommendedAttractions.value = [...recommendedAttractions.value, ...uniqueNewAttractions];
          
          // 更新分页状态
          attractionPagination.value.currentPage = nextPage;
          attractionPagination.value.total = Number(response.count) || recommendedAttractions.value.length;
          
          // 检查是否已加载完所有数据
          if (response.pois.length < attractionPagination.value.pageSize) {
            attractionLoadComplete.value = true;
            ElMessage.success('已加载全部景点数据');
          } else {
            ElMessage.success(`已加载 ${uniqueNewAttractions.length} 个新景点`);
          }
          
          console.log('✅ 景点数据累积成功:', {
            新增数量: uniqueNewAttractions.length,
            总数据量: recommendedAttractions.value.length,
            当前页: attractionPagination.value.currentPage,
            加载完成: attractionLoadComplete.value
          });
          
          // 平滑滚动到新加载的内容
          setTimeout(() => {
            const newItemsStartIndex = recommendedAttractions.value.length - uniqueNewAttractions.length;
            const targetElement = document.querySelector(`.recommendation-card:nth-child(${newItemsStartIndex + 1})`);
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
          
        } else {
          attractionLoadComplete.value = true;
          console.log('⚠️ 没有更多景点数据');
          ElMessage.info('已加载全部景点数据');
        }
      } catch (error) {
        console.error('❌ 加载更多景点数据失败:', error);
        ElMessage.error('加载更多景点数据失败，请稍后重试');
      } finally {
        loadingMoreAttractions.value = false;
      }
    };

    const handleLoadMoreRestaurants = async () => {
      if (loadingMoreRestaurants.value || restaurantLoadComplete.value) {
        return;
      }
      
      const nextPage = restaurantPagination.value.currentPage + 1;
      
      console.log('🔄 加载更多餐厅:', { 
        当前页: restaurantPagination.value.currentPage,
        下一页: nextPage,
        城市: props.cityInfo?.destinationName,
        当前数据量: recommendedRestaurants.value.length
      });
      
      try {
        loadingMoreRestaurants.value = true;
        
        console.log('📡 开始加载更多餐厅数据...');
        const response = await getRecommendedRestaurants(
          props.cityInfo.destinationName, 
          nextPage, 
          restaurantPagination.value.pageSize
        ).catch(err => {
          console.warn('加载更多餐厅数据API调用失败:', err);
          if (err.message && err.message.includes('CUQPS_HAS_EXCEEDED_THE_LIMIT')) {
            ElMessage.warning('API调用次数已达上限，无法加载更多数据');
            throw err;
          }
          throw err;
        });
        
        console.log('📦 API响应数据:', {
          总数: response.count,
          数据长度: response.pois?.length,
          前2项: response.pois?.slice(0, 2).map(poi => poi.name)
        });
        
        if (response.pois && response.pois.length > 0) {
          // 累积模式：将新数据添加到现有数据后面
          const newRestaurants = response.pois.map((poi) => ({
            id: poi.id,
            name: poi.name,
            address: poi.address,
            rating: (poi.biz_ext && poi.biz_ext.rating) || "4.5",
            photos: poi.photos || [],
            type: poi.type ? poi.type.split(";")[0] : "餐厅",
            price: (poi.biz_ext && poi.biz_ext.cost) || "¥¥",
            tags: extractTags(poi),
            tag: poi.tag,
          }));
          
          // 去重处理，避免重复数据
          const existingIds = new Set(recommendedRestaurants.value.map(item => item.id));
          const uniqueNewRestaurants = newRestaurants.filter(item => !existingIds.has(item.id));
          
          recommendedRestaurants.value = [...recommendedRestaurants.value, ...uniqueNewRestaurants];
          
          // 更新分页状态
          restaurantPagination.value.currentPage = nextPage;
          restaurantPagination.value.total = Number(response.count) || recommendedRestaurants.value.length;
          
          // 检查是否已加载完所有数据
          if (response.pois.length < restaurantPagination.value.pageSize) {
            restaurantLoadComplete.value = true;
            ElMessage.success('已加载全部餐厅数据');
          } else {
            ElMessage.success(`已加载 ${uniqueNewRestaurants.length} 家新餐厅`);
          }
          
          console.log('✅ 餐厅数据累积成功:', {
            新增数量: uniqueNewRestaurants.length,
            总数据量: recommendedRestaurants.value.length,
            当前页: restaurantPagination.value.currentPage,
            加载完成: restaurantLoadComplete.value
          });
          
          // 平滑滚动到新加载的内容
          setTimeout(() => {
            const newItemsStartIndex = recommendedRestaurants.value.length - uniqueNewRestaurants.length;
            const targetElement = document.querySelector(`.recommendation-card:nth-child(${newItemsStartIndex + 1})`);
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
          
        } else {
          restaurantLoadComplete.value = true;
          console.log('⚠️ 没有更多餐厅数据');
          ElMessage.info('已加载全部餐厅数据');
        }
      } catch (error) {
        console.error('❌ 加载更多餐厅数据失败:', error);
        ElMessage.error('加载更多餐厅数据失败，请稍后重试');
      } finally {
        loadingMoreRestaurants.value = false;
      }
    };

    // 搜索功能
    const handleSearch = async (searchParams) => {
      try {
        searching.value = true;
        
        // 使用useAmap搜索
        const response = await searchPlaces({
          keywords: searchParams.keyword,
          city: props.cityInfo.destinationName,
          types: searchParams.type === 'attractions' ? '110000' : '050000', // 风景名胜或餐饮服务
          pageSize: 10,
          page: 1
        }).catch(err => {
          console.warn('搜索API调用失败:', err);
          if (err.message && err.message.includes('CUQPS_HAS_EXCEEDED_THE_LIMIT')) {
            ElMessage.warning('API调用次数已达上限，无法执行搜索');
            throw err;
          }
          throw err;
        });
        
        // 直接使用增强后的POI数据
        // useAmap.searchPlaces 现在返回的是pois数组
        searchResults.value = response || [];
        
        console.log('搜索结果:', searchResults.value.length, '个POI');
        console.log('景点数量:', searchResults.value.filter(poi => poi.isAttraction).length);
        searchResults.value.forEach(poi => {
          console.log(`${poi.name}: isAttraction = ${poi.isAttraction}, type = "${poi.type}"`);
        });
        
        isSearchMode.value = true;
        
        // 添加更多调试信息
        console.log('🔍 搜索完成状态更新:', {
          isSearchMode: isSearchMode.value,
          searchResults长度: searchResults.value.length,
          景点数: searchResults.value.filter(item => item.isAttraction).length,
          餐厅数: searchResults.value.filter(item => !item.isAttraction).length,
          前2个结果: searchResults.value.slice(0, 2).map(item => ({
            name: item.name,
            isAttraction: item.isAttraction,
            type: item.type
          }))
        });
      } catch (error) {
        console.error('搜索失败:', error);
        ElMessage.error('搜索失败');
      } finally {
        searching.value = false;
      }
    };

    const handleClearSearch = () => {
      searchResults.value = [];
      isSearchMode.value = false;
    };

    // 清空所有选择
    const handleClearAllSelections = () => {
      selectedAttractions.value = [];
      selectedRestaurants.value = [];
      emitSelectionUpdate();
      ElMessage.info('已清空所有选择');
    };

    // 继续到下一步
    const handleContinue = () => {
      // 发送选择更新事件
      emitSelectionUpdate();
      
      if (totalSelected.value > 0) {
        ElMessage.success(`已选择 ${totalSelected.value} 项，开始生成行程`);
      } else {
        ElMessage.info('跳过推荐选择，直接生成行程');
      }
      
      emit('next-step');
    };

    // 发送选择更新事件
    const emitSelectionUpdate = () => {
      emit('selections-updated', {
        selectedAttractions: selectedAttractions.value,
        selectedRestaurants: selectedRestaurants.value
      });
    };



    // 获取提示文本
    const getAiTipText = () => {
      if (totalSelected.value === 0) {
        return '💡 建议选择一些感兴趣的景点和餐厅，这样系统能为您制定更精准的行程安排。您也可以跳过此步骤直接生成行程。';
      } else if (totalSelected.value < 3) {
        return `✨ 很好！您已选择了 ${totalSelected.value} 项。可以继续添加更多选择，或直接进入下一步生成行程。`;
      } else {
        return `🎉 太棒了！您已选择了 ${totalSelected.value} 项丰富的内容，系统将为您制定完美的行程安排！`;
      }
    };

    // 监听城市信息变化
    watch(
      () => props.cityInfo?.destinationName,
      (newCityName, oldCityName) => {
        console.log('🔄 城市信息变化:', { oldCityName, newCityName });
        if (newCityName && newCityName !== oldCityName) {
          loadRecommendations();
        }
      },
      { immediate: true } // 立即执行一次
    );

    // 组件挂载时的调试信息
    onMounted(() => {
      console.log('🚀 推荐选择步骤组件挂载', {
        hasLoaded: hasLoaded.value,
        currentCity: currentCityName.value,
        propCity: props.cityInfo?.destinationName
      });
    });

    return {
      // 数据
      recommendedAttractions,
      recommendedRestaurants,
      selectedAttractions,
      selectedRestaurants,
      loadingAttractions,
      loadingRestaurants,
      loadingMoreAttractions,
      loadingMoreRestaurants,
      attractionLoadComplete,
      restaurantLoadComplete,
      apiError,
      searchResults,
      isSearchMode,
      searching,
      showAiTip,
      totalSelected,
      attractionPagination,
      restaurantPagination,
      
      // 方法
      handleAddAttraction,
      handleRemoveAttraction,
      handleAddRestaurant,
      handleRemoveRestaurant,
      handleLoadMoreAttractions,
      handleLoadMoreRestaurants,
      handleSearch,
      handleClearSearch,
      handleClearAllSelections,
      handleContinue,
      extractAttractionTags,
      extractSignatureDishes,
      getAiTipText
    };
  }
};
</script>

<style scoped>
.trip-recommendation-step {
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
  min-height: 100vh;
  padding: 0 16px;
}

/* 步骤头部 */
.step-header {
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 32px;
  color: white;
  position: relative;
  overflow: hidden;
}

.step-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="a" cx="50" cy="50" r="50"><stop offset="0" stop-color="white" stop-opacity="0.1"/><stop offset="1" stop-color="white" stop-opacity="0.05"/></radialGradient></defs><rect width="100" height="20" fill="url(%23a)"/></svg>');
  opacity: 0.3;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.header-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  backdrop-filter: blur(10px);
}

.step-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.step-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
}

.progress-hint {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 20px 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.hint-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
}

/* 推荐内容区域 */
.recommendation-main {
  margin-bottom: 32px;
}

/* 底部操作区域 */
.step-actions {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8eaed;
  margin-bottom: 32px;
  position: sticky;
  bottom: 20px;
  z-index: 50;
}

.actions-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
}

/* 选择摘要 */
.selection-summary {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.stat-icon {
  font-size: 20px;
}

.selection-tip,
.no-selection-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.selection-tip {
  color: #67c23a;
}

.no-selection-tip {
  color: #e6a23c;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 16px;
}

.action-buttons .el-button {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  min-width: 120px;
  transition: all 0.3s ease;
}

.action-buttons .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 推荐助手提示卡片 */
.ai-tip-card {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 320px;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  color: white;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.ai-tip-content {
  padding: 20px;
}

.ai-tip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.ai-tip-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-icon {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
}

.ai-tip-text {
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .trip-recommendation-step {
    padding: 0 8px;
  }
  
  .step-header {
    padding: 24px 20px;
    margin-bottom: 20px;
    border-radius: 16px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .header-icon {
    width: 60px;
    height: 60px;
    font-size: 30px;
  }

  .step-title {
    font-size: 28px;
  }

  .step-subtitle {
    font-size: 14px;
    line-height: 1.6;
  }

  .progress-hint {
    padding: 16px 20px;
    border-radius: 12px;
  }

  .hint-content {
    font-size: 13px;
    gap: 8px;
  }

  .step-actions {
    padding: 24px 16px;
    border-radius: 16px;
    margin-bottom: 20px;
  }

  .actions-content {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .selection-summary {
    text-align: center;
  }

  .summary-stats {
    justify-content: center;
    gap: 16px;
  }

  .stat-item {
    font-size: 15px;
  }

  .action-buttons {
    justify-content: stretch;
    gap: 12px;
  }

  .action-buttons .el-button {
    flex: 1;
    min-width: auto;
    padding: 14px 20px;
    font-size: 15px;
  }

  .ai-tip-card {
    position: relative;
    width: auto;
    margin: 16px 8px;
    right: auto;
    bottom: auto;
    border-radius: 12px;
  }
}

@media (max-width: 480px) {
  .trip-recommendation-step {
    padding: 0 4px;
  }

  .step-header {
    padding: 20px 16px;
    margin-bottom: 16px;
    border-radius: 12px;
  }

  .header-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }

  .step-title {
    font-size: 22px;
    margin-bottom: 8px;
  }

  .step-subtitle {
    font-size: 13px;
  }

  .progress-hint {
    padding: 12px 16px;
  }

  .hint-content {
    font-size: 12px;
  }

  .step-actions {
    padding: 20px 16px;
    margin-bottom: 16px;
    border-radius: 12px;
  }

  .selection-summary {
    gap: 8px;
  }

  .summary-stats {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  .stat-item {
    font-size: 14px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 12px;
  }

  .action-buttons .el-button {
    padding: 12px 16px;
    font-size: 14px;
    min-width: 80px;
  }

  .ai-tip-card {
    margin: 12px 4px;
    border-radius: 8px;
  }
}
</style>
