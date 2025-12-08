<template>
  <div class="recommendation-content">
    <!-- 搜索模式提示 -->
    <div
      v-if="isSearchMode && items.length > 0"
      class="search-mode-tip"
    >
      <el-alert
        :title="
          '搜索\'' +
          currentSearchKeyword +
          '\'\u7684结果（' +
          items.length +
          '家餐厅）'
        "
        type="info"
        :closable="false"
        show-icon
      />
      <div style="margin-top: 8px">
        <el-button size="small" @click="handleClearSearch">
          返回推荐
        </el-button>
      </div>
    </div>

    <!-- 搜索无结果 -->
    <div
      v-else-if="isSearchMode && items.length === 0 && !loading"
      class="no-search-results"
    >
      <el-empty description="没有找到相关餐厅">
        <el-button type="primary" @click="handleClearSearch">
          返回推荐列表
        </el-button>
      </el-empty>
    </div>

    <div v-if="loading && items.length === 0" class="loading-state">
      <div class="skeleton-grid">
        <div 
          v-for="n in 8" 
          :key="n" 
          class="skeleton-card"
        >
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="image" style="height: 140px; border-radius: 8px 8px 0 0;" />
              <div style="padding: 12px;">
                <el-skeleton-item variant="h3" style="width: 75%; margin-bottom: 8px;" />
                <el-skeleton-item variant="text" style="width: 50%; margin-bottom: 6px;" />
                <div style="display: flex; gap: 4px; margin: 8px 0;">
                  <el-skeleton-item variant="text" style="width: 45px; height: 20px; border-radius: 4px;" />
                  <el-skeleton-item variant="text" style="width: 40px; height: 20px; border-radius: 4px;" />
                  <el-skeleton-item variant="text" style="width: 55px; height: 20px; border-radius: 4px;" />
                </div>
                <el-skeleton-item variant="text" style="width: 85%; margin-bottom: 8px;" />
                <el-skeleton-item variant="text" style="width: 95%; margin-bottom: 12px;" />
                <el-skeleton-item variant="button" style="width: 100%; height: 32px;" />
              </div>
            </template>
          </el-skeleton>
        </div>
      </div>
    </div>

    <div
      v-else-if="items.length === 0 && !apiError"
      class="empty-state"
    >
      <el-empty description="暂无推荐餐厅" />
    </div>

    <div
      v-else-if="apiError"
      class="error-state"
    >
      <el-alert
        :title="apiError"
        type="error"
        :closable="false"
        show-icon
      />
    </div>

    <div v-else class="recommendation-list">
      <div
        v-for="restaurant in items"
        :key="restaurant.id"
        class="recommendation-item vertical-layout"
      >
        <div class="recommendation-image">
          <img
            v-if="restaurant.photos && restaurant.photos.length > 0 && !restaurant.imageError"
            :src="restaurant.photos[0].url"
            :alt="restaurant.name"
            @error="handleImageError(restaurant)"
          />
          <div v-else class="no-image">
            <el-icon><Food /></el-icon>
            <span>暂无图片</span>
          </div>
        </div>
        <div class="recommendation-content-body">
          <h4 :title="restaurant.name" class="full-width-name">
            {{ restaurant.name }}
          </h4>
          <div class="recommendation-rating rating-with-number">
            <el-rate
              :model-value="Number(restaurant.rating) || 0"
              disabled
              text-color="#ff9900"
            />
            <span class="rating-value">{{ restaurant.rating || '暂无' }}</span>
          </div>
          <div class="recommendation-tags">
            <el-tag 
              v-if="restaurant.price || restaurant.cost" 
              size="small" 
              type="danger" 
              class="price-tag"
            >
              人均￥{{ restaurant.price || restaurant.cost }}
            </el-tag>
            <el-tag size="small" type="warning" class="category-tag">
              餐饮服务
            </el-tag>
            <el-tag size="small" class="tag-item">
              {{ restaurant.type || '餐厅' }}
            </el-tag>
          </div>

          <!-- 招牌菜信息 -->
          <div class="signature-dishes">
            <p class="signature-title">
              <el-icon><Star /></el-icon>
              推荐
            </p>
            <div
              v-if="getTags(restaurant).length > 0"
              class="dish-tags"
            >
              <el-tag
                v-for="(dish, index) in getTags(restaurant).slice(0, 3)"
                :key="index"
                size="small"
                effect="plain"
                type="success"
                class="dish-tag"
              >
                {{ dish }}
              </el-tag>
            </div>
            <div v-else class="dish-tags">
              <el-tag
                size="small"
                effect="plain"
                type="success"
                class="dish-tag empty-tag"
              >
                无
              </el-tag>
            </div>
          </div>

          <p class="recommendation-address">
            <el-icon><Location /></el-icon>
            <span class="address-text">{{
              restaurant.address || "暂无地址信息"
            }}</span>
          </p>

          <!-- 添加到计划按钮 -->
          <div class="add-to-plan">
            <el-button
              v-if="!isSelected(restaurant)"
              size="small"
              plain
              @click="$emit('add', restaurant)"
            >
              <el-icon><Plus /></el-icon>
              添加到计划
            </el-button>
            <el-button
              v-else
              type="danger"
              size="small"
              @click="$emit('remove', restaurant)"
            >
              <el-icon><Close /></el-icon>
              取消添加
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 餐厅加载更多按钮 -->
    <div
      v-if="items.length > 0 && !isSearchMode && !loadComplete"
      class="load-more-container"
    >
      <el-button
        type="primary"
        size="large"
        :loading="loadingMore"
        :disabled="loadComplete"
        @click="loadMore"
        class="load-more-btn"
      >
        <template v-if="!loadingMore">
          <el-icon><ArrowDown /></el-icon>
          加载更多餐厅
        </template>
        <template v-else>
          加载中...
        </template>
      </el-button>
    </div>

    <!-- 餐厅加载完成提示 -->
    <div
      v-if="items.length > 0 && !isSearchMode && loadComplete"
      class="load-complete-tip"
    >
      <el-divider>
        <span class="complete-text">
          <el-icon><Check /></el-icon>
          已显示全部 {{ items.length }} 家餐厅
        </span>
      </el-divider>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue';
import {
  Food,
  Star,
  Location,
  Plus,
  Close,
  ArrowDown,
  Check
} from "@element-plus/icons-vue";
import { getRecommendedRestaurants } from '@/api/amap.js';
import { useAmap } from '@/composables/map/useAmap.js';
import { extractSignatureDishes } from '@/utils/poiUtils.js';
import { ElMessage } from 'element-plus';

export default {
  name: "RestaurantList",
  components: {
    Food,
    Star,
    Location,
    Plus,
    Close,
    ArrowDown,
    Check
  },
  props: {
    cityInfo: {
      type: Object,
      default: () => ({})
    },
    selectedItems: {
      type: Array,
      default: () => []
    },
    searchKeyword: {
      type: String,
      default: ""
    },
    triggerSearch: {
      type: Number,
      default: 0
    },
    sortBy: {
      type: String,
      default: 'default'
    }
  },
  emits: ["add", "remove", "update:search-keyword"],
  setup(props, { emit }) {
    const { searchPlaces } = useAmap();

    // 状态
    const items = ref([]);
    const loading = ref(false);
    const loadingMore = ref(false);
    const loadComplete = ref(false);
    const apiError = ref(null);
    const isSearchMode = ref(false);
    const currentSearchKeyword = ref("");

    // 分页
    const pagination = ref({
      currentPage: 1,
      pageSize: 6,
      total: 0
    });

    // 提取标签辅助函数
    const getTags = (item) => extractSignatureDishes(item);

    // 判断是否选中
    const isSelected = (item) => {
      return props.selectedItems.some((i) => i.id === item.id);
    };

    // 处理图片错误
    const handleImageError = (item) => {
      item.imageError = true;
    };

    // 加载数据
    const loadData = async (reset = false) => {
      if (!props.cityInfo?.destinationName) return;
      
      if (reset) {
        pagination.value.currentPage = 1;
        items.value = [];
        loadComplete.value = false;
        isSearchMode.value = false;
      }

      try {
        if (pagination.value.currentPage === 1) {
          loading.value = true;
        } else {
          loadingMore.value = true;
        }
        apiError.value = null;

        const response = await getRecommendedRestaurants(
          props.cityInfo.destinationName,
          pagination.value.currentPage,
          pagination.value.pageSize
        );

        const newItems = (response.pois || []).map(poi => ({
          id: poi.id,
          name: poi.name,
          address: poi.address,
          rating: (poi.biz_ext && poi.biz_ext.rating) || "4.5",
          photos: poi.photos || [],
          type: poi.type ? poi.type.split(";")[0] : "餐厅",
          price: (poi.biz_ext && poi.biz_ext.cost) || "¥¥",
          cost: (poi.biz_ext && poi.biz_ext.cost),
          tags: getTags(poi),
          tag: poi.tag,
        }));

        if (reset) {
          items.value = newItems;
        } else {
           // 去重
           const existingIds = new Set(items.value.map(i => i.id));
           const uniqueNew = newItems.filter(i => !existingIds.has(i.id));
           items.value = [...items.value, ...uniqueNew];
        }

        // 更新分页和完成状态
        if (newItems.length < pagination.value.pageSize) {
          loadComplete.value = true;
        }

      } catch (err) {
        console.error('加载餐厅失败:', err);
        apiError.value = err.message || '加载失败';
      } finally {
        loading.value = false;
        loadingMore.value = false;
      }
    };

    // 加载更多
    const loadMore = () => {
      if (loadingMore.value || loadComplete.value) return;
      pagination.value.currentPage++;
      loadData(false);
    };

    // 搜索功能
    const handleSearch = async () => {
      if (!props.searchKeyword.trim()) {
        if (isSearchMode.value) {
            handleClearSearch();
        }
        return;
      }

      try {
        loading.value = true;
        isSearchMode.value = true;
        currentSearchKeyword.value = props.searchKeyword;
        
        // 调用搜索API (typeCode 050000 餐饮服务)
        const response = await searchPlaces({
          keywords: props.searchKeyword,
          city: props.cityInfo.destinationName,
          types: '050000', 
          pageSize: 20,
          page: 1
        });

        const rawResults = response || [];
        items.value = rawResults.map(poi => ({
          ...poi,
          tags: getTags(poi),
           // 确保字段一致性
          rating: (poi.biz_ext && poi.biz_ext.rating) || "4.5",
          price: (poi.biz_ext && poi.biz_ext.cost),
          type: poi.type ? poi.type.split(";")[0] : "餐厅",
        }));
        
        loadComplete.value = true; 

      } catch (err) {
        console.error('搜索餐厅失败:', err);
        ElMessage.error('搜索失败');
      } finally {
        loading.value = false;
      }
    };

    // 清除搜索
    const handleClearSearch = () => {
      isSearchMode.value = false;
      currentSearchKeyword.value = "";
      emit('update:search-keyword', ''); // 通知父组件清空输入框
      loadData(true); 
    };

    // 监听排序变化 (本地排序)
    watch(() => props.sortBy, (newSort) => {
        if (items.value.length === 0) return;
        
        const sorted = [...items.value];
        if (newSort === 'rating') {
            sorted.sort((a, b) => {
                const ra = parseFloat(a.rating) || 0;
                const rb = parseFloat(b.rating) || 0;
                return rb - ra;
            });
        } else {
             if (!isSearchMode.value) {
                 loadData(true);
                 return;
             }
        }
        items.value = sorted;
    });

    // 监听城市变化
    watch(() => props.cityInfo?.destinationName, (newVal, oldVal) => {
      if (newVal && newVal !== oldVal) {
        loadData(true);
      }
    }, { immediate: true });

    // 监听搜索触发
    watch(() => props.triggerSearch, () => {
        handleSearch();
    });

    return {
      items,
      loading,
      loadingMore,
      loadComplete,
      apiError,
      isSearchMode,
      currentSearchKeyword,
      handleImageError,
      isSelected,
      getTags,
      loadMore,
      handleClearSearch
    };
  }
};
</script>

<style scoped>
.recommendation-content {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-state,
.empty-state,
.error-state {
  padding: 40px 20px;
  text-align: center;
}

.search-mode-tip {
  margin-bottom: 16px;
}

/* Skeleton styles */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 16px;
}

.skeleton-card {
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.recommendation-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 16px;
  min-height: 200px;
}

.recommendation-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.recommendation-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.recommendation-item.vertical-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.recommendation-image {
  height: 140px;
  overflow: hidden;
  position: relative;
}

.recommendation-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.5s;
}

.recommendation-item:hover .recommendation-image img {
  transform: scale(1.05);
}

.no-image {
  background: #f5f7fa;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 24px;
  gap: 8px;
}

.no-image span {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 4px;
}

.recommendation-content-body {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.recommendation-content-body h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.full-width-name {
  width: 100%;
}

.recommendation-rating {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.rating-with-number .el-rate {
  font-size: 14px;
  line-height: 1;
}

.rating-value {
  margin-left: 8px;
  color: #ff9900;
  font-size: 13px;
  font-weight: 500;
}

.recommendation-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.category-tag,
.tag-item {
  font-size: 11px;
}

.signature-dishes {
  margin: 6px 0;
}

.signature-title {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 4px;
  font-size: 11px;
  color: #606266;
}

.dish-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.dish-tag {
  margin-right: 2px;
  margin-bottom: 2px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
}

.empty-tag {
  opacity: 0.6;
}

.recommendation-address {
  display: flex;
  align-items: flex-start;
  margin: 6px 0;
  color: #606266;
  font-size: 11px;
  line-height: 1.3;
}

.address-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  margin-left: 4px;
}

.add-to-plan {
  margin-top: auto;
  padding-top: 8px;
  text-align: right;
}

.add-to-plan .el-button {
  padding: 6px 12px;
  font-size: 12px;
  background: #91A8D0;
  color: white;
}

/* Load more styles */
.load-more-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin: 5px 0;
  padding: 5px;
  transition: all 0.3s ease;
}

.load-more-container:hover {
  transform: translateY(-1px);
}

.load-more-btn {
  padding: 12px 32px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  min-width: 160px;
}

.load-more-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(79, 130, 202, 0.2);
}

.load-complete-tip {
  margin: 20px 0;
  text-align: center;
}

.complete-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #10b981;
  font-weight: 500;
  padding: 8px 16px;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 1px solid #bbf7d0;
  border-radius: 20px;
}

/* Responsive */
@media (max-width: 1200px) {
  .recommendation-list,
  .skeleton-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

@media (max-width: 900px) {
  .recommendation-list,
  .skeleton-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .load-more-container {
    margin: 16px 0;
    padding: 16px;
    gap: 12px;
  }
  
  .load-more-btn {
    padding: 10px 24px;
    font-size: 13px;
    min-width: 140px;
  }
}

@media (max-width: 480px) {
  .recommendation-list,
  .skeleton-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .recommendation-item {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #f0f0f0;
  }

  .recommendation-image {
    height: 160px;
  }

  .recommendation-content-body {
    padding: 12px;
  }

  .recommendation-content-body h4 {
    font-size: 15px;
    margin-bottom: 8px;
    line-height: 1.3;
  }

  .rating-with-number .el-rate {
    font-size: 14px;
  }

  .rating-value {
    font-size: 13px;
    margin-left: 6px;
  }

  .recommendation-tags,
  .signature-dishes {
    margin: 8px 0;
  }

  .category-tag,
  .tag-item,
  .dish-tag {
    font-size: 11px;
    padding: 2px 6px;
  }
  
  .recommendation-address {
    font-size: 12px;
    margin: 8px 0;
  }

  .add-to-plan {
    padding-top: 12px;
  }

  .add-to-plan .el-button {
    padding: 8px 16px;
    font-size: 12px;
    border-radius: 8px;
    width: 100%;
  }

  .load-more-container {
    margin: 12px 0;
    padding: 12px;
    gap: 10px;
  }
  
  .load-more-btn {
    padding: 8px 20px;
    font-size: 12px;
    min-width: 120px;
  }
  
  .complete-text {
    font-size: 13px;
    padding: 6px 12px;
  }
}
</style>