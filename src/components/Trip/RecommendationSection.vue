<template>
  <div class="recommendation-section">
    <!-- 选择摘要悬浮卡片 -->
    <div
      v-if="selectedAttractions.length > 0 || selectedRestaurants.length > 0"
      class="selection-summary-float"
    >
      <div class="summary-float-card">
        <div class="summary-header">
          <div class="summary-title">
            <el-icon><Check /></el-icon>
            <span>已选择</span>
            <el-tag size="small" type="primary">
              {{ selectedAttractions.length + selectedRestaurants.length }}
            </el-tag>
          </div>
          <el-button
            type="primary"
            size="small"
            @click="toggleSummaryDetail"
          >
            {{ showSummaryDetail ? '收起' : '查看详情' }}
          </el-button>
        </div>
        
        <!-- 详情展开区域 -->
        <div v-if="showSummaryDetail" class="summary-detail">
          <div class="selected-items-compact">
            <!-- 已选择的景点 -->
            <div v-if="selectedAttractions.length > 0" class="selected-section-compact">
              <div class="section-header-compact">
                <el-icon class="section-icon" color="#91a8d0">
                  <Location />
                </el-icon>
                <span class="section-title-compact">
                  必去景点 ({{ selectedAttractions.length }})
                </span>
              </div>
              <div class="selected-list-compact">
                <el-tag
                  v-for="attraction in selectedAttractions"
                  :key="attraction.id"
                  type="primary"
                  closable
                  size="small"
                  class="selection-tag-compact"
                  @close="$emit('remove-attraction', attraction)"
                >
                  {{ attraction.name }}
                </el-tag>
              </div>
            </div>

            <!-- 已选择的餐厅 -->
            <div v-if="selectedRestaurants.length > 0" class="selected-section-compact">
              <div class="section-header-compact">
                <el-icon class="section-icon" color="#E6A23C">
                  <Food />
                </el-icon>
                <span class="section-title-compact">
                  必去餐厅 ({{ selectedRestaurants.length }})
                </span>
              </div>
              <div class="selected-list-compact">
                <el-tag
                  v-for="restaurant in selectedRestaurants"
                  :key="restaurant.id"
                  type="warning"
                  closable
                  size="small"
                  class="selection-tag-compact"
                  @close="$emit('remove-restaurant', restaurant)"
                >
                  {{ restaurant.name }}
                </el-tag>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="summary-actions-compact">
              <el-button type="danger" link size="small" @click="clearAllSelections">
                重置所有选择
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 推荐区域主体 -->
    <div class="form-section">
      <div class="section-title">
        <el-icon><Location /></el-icon>
        <span>{{ (cityInfo?.destinationName || "目的地") + "推荐内容" }}</span>
      </div>

      <!-- 切换标签 -->
      <div class="tab-switcher">
        <div
          class="tab-item"
          :class="{ active: activeTab === 'attractions' }"
          @click="activeTab = 'attractions'"
        >
          <el-icon><Location /></el-icon>
          <span>必去景点</span>
          <el-tag size="small" type="success"> 高德API </el-tag>
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'restaurants' }"
          @click="activeTab = 'restaurants'"
        >
          <el-icon><Food /></el-icon>
          <span>必去餐厅</span>
          <el-tag size="small" type="warning"> 高德API </el-tag>
        </div>
      </div>

      <!-- 搜索功能 -->
      <div class="search-section">
        <div class="search-input-group">
          <el-input
            v-model="searchKeyword"
            :placeholder="
              activeTab === 'attractions' ? '请输入景点名称或关键词' : '请输入餐厅名称或关键词'
            "
            clearable
            @keyup.enter="handleSearch"
            @clear="handleClearSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button
            type="primary"
            :loading="searching"
            @click="handleSearch"
          >
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>
        <div class="search-filters">
          <el-select
            v-model="sortBy"
            placeholder="排序方式"
            size="small"
            style="width: 120px"
          >
            <el-option label="默认排序" value="default" />
            <el-option label="评分优先" value="rating" />
            <el-option label="距离优先" value="distance" />
          </el-select>
        </div>
      </div>

      <!-- 景点推荐内容 -->
      <div v-show="activeTab === 'attractions'" class="recommendation-content">
        <!-- 搜索模式提示 -->
        <div
          v-if="isSearchMode && searchResults.length > 0"
          class="search-mode-tip"
        >
          <el-alert
            :title="
              '搜索结果：' +
              searchKeyword +
              '（共 ' +
              searchResults.filter((item) => item.isAttraction).length +
              ' 个景点）'
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

        <div v-if="loadingAttractions" class="loading-state">
          <el-skeleton :rows="3" animated />
        </div>

        <div
          v-else-if="recommendedAttractions.length === 0 && !apiError"
          class="empty-state"
        >
          <el-empty description="暂无推荐景点" />
        </div>

        <div v-else-if="apiError" class="error-state">
          <el-alert
            :title="apiError"
            type="error"
            :closable="false"
            show-icon
          />
        </div>

        <div v-else class="recommendation-list">
          <div
            v-for="attraction in isSearchMode
              ? searchResults.filter((item) => item.isAttraction)
              : recommendedAttractions"
            :key="attraction.id"
            class="recommendation-item vertical-layout"
          >
            <div class="recommendation-image">
              <img
                v-if="attraction.photos && attraction.photos.length > 0"
                :src="attraction.photos[0].url"
                :alt="attraction.name"
                @error="
                  (e) =>
                    (e.target.src =
                      'https://via.placeholder.com/300x200?text=Attraction')
                "
              />
              <div v-else class="no-image">
                <el-icon><Picture /></el-icon>
              </div>
            </div>
            <div class="recommendation-content">
              <h4 :title="attraction.name" class="full-width-name">
                {{ attraction.name }}
              </h4>
              <div class="recommendation-rating rating-with-number">
                <el-rate
                  :model-value="Number(attraction.rating)"
                  disabled
                  text-color="#ff9900"
                />
                <span class="rating-value">{{ attraction.rating }}</span>
              </div>
              <div class="recommendation-tags">
                <el-tag size="small" type="success" class="category-tag">
                  风景名胜
                </el-tag>
                <el-tag size="small" class="tag-item">
                  {{ attraction.type }}
                </el-tag>
              </div>

              <!-- 景点标签信息 -->
              <div class="attraction-tags">
                <p class="tags-title">
                  <el-icon><Star /></el-icon>
                  推荐 :
                </p>
                <div
                  v-if="extractAttractionTags(attraction).length > 0"
                  class="feature-tags"
                >
                  <el-tag
                    v-for="(tag, index) in extractAttractionTags(
                      attraction
                    ).slice(0, 3)"
                    :key="index"
                    size="small"
                    effect="plain"
                    type="info"
                    class="feature-tag"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
                <div v-else class="feature-tags">
                  <el-tag
                    size="small"
                    effect="plain"
                    type="info"
                    class="feature-tag empty-tag"
                  >
                    无
                  </el-tag>
                </div>
              </div>

              <p class="recommendation-address">
                <el-icon><Location /></el-icon>
                <span class="address-text">{{
                  attraction.address || "暂无地址信息"
                }}</span>
              </p>

              <!-- 添加到计划按钮 -->
              <div class="add-to-plan">
                <el-button
                  v-if="!isAttractionSelected(attraction)"
                  type="success"
                  size="small"
                  plain
                  @click="$emit('add-attraction', attraction)"
                >
                  <el-icon><Plus /></el-icon>
                  添加到计划
                </el-button>
                <el-button
                  v-else
                  type="success"
                  size="small"
                  @click="$emit('remove-attraction', attraction)"
                >
                  <el-icon><Check /></el-icon>
                  已添加
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="recommendedAttractions.length > 0 && !isSearchMode"
          class="view-more-container"
        >
          <el-button
            type="primary"
            plain
            size="small"
            @click="$emit('load-more-attractions')"
          >
            <el-icon><More /></el-icon>
            查看更多景点
          </el-button>
        </div>
      </div>

      <!-- 餐厅推荐内容 -->
      <div v-show="activeTab === 'restaurants'" class="recommendation-content">
        <!-- 搜索模式提示 -->
        <div
          v-if="isSearchMode && searchResults.length > 0"
          class="search-mode-tip"
        >
          <el-alert
            :title="
              '搜索\'' +
              searchKeyword +
              '\'\u7684结果（' +
              searchResults.filter((item) => !item.isAttraction).length +
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

        <div v-if="loadingRestaurants" class="loading-state">
          <el-skeleton :rows="3" animated />
        </div>

        <div
          v-else-if="recommendedRestaurants.length === 0 && !apiError"
          class="empty-state"
        >
          <el-empty description="暂无推荐餐厅" />
        </div>

        <div
          v-else-if="apiError && recommendedAttractions.length === 0"
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
            v-for="restaurant in isSearchMode
              ? searchResults.filter((item) => !item.isAttraction)
              : recommendedRestaurants"
            :key="restaurant.id"
            class="recommendation-item vertical-layout"
          >
            <div class="recommendation-image">
              <img
                v-if="restaurant.photos && restaurant.photos.length > 0"
                :src="restaurant.photos[0].url"
                :alt="restaurant.name"
                @error="
                  (e) =>
                    (e.target.src =
                      'https://via.placeholder.com/300x200?text=Food')
                "
              />
              <div v-else class="no-image">
                <el-icon><Food /></el-icon>
              </div>
            </div>
            <div class="recommendation-content">
              <h4 :title="restaurant.name" class="full-width-name">
                {{ restaurant.name }}
              </h4>
              <div class="recommendation-rating rating-with-number">
                <el-rate
                  :model-value="Number(restaurant.rating)"
                  disabled
                  text-color="#ff9900"
                />
                <span class="rating-value">{{ restaurant.rating }}</span>
              </div>
              <div class="recommendation-tags">
                <el-tag size="small" type="danger" class="price-tag">
                  人均￥{{ restaurant.price }}
                </el-tag>
                <el-tag size="small" type="warning" class="category-tag">
                  餐饮服务
                </el-tag>
                <el-tag size="small" class="tag-item">
                  {{ restaurant.type }}
                </el-tag>
              </div>

              <!-- 招牌菜信息 -->
              <div class="signature-dishes">
                <p class="signature-title">
                  <el-icon><Star /></el-icon>
                  推荐
                </p>
                <div
                  v-if="extractSignatureDishes(restaurant).length > 0"
                  class="dish-tags"
                >
                  <el-tag
                    v-for="(dish, index) in extractSignatureDishes(
                      restaurant
                    ).slice(0, 3)"
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
                  v-if="!isRestaurantSelected(restaurant)"
                  type="danger"
                  size="small"
                  plain
                  @click="$emit('add-restaurant', restaurant)"
                >
                  <el-icon><Plus /></el-icon>
                  添加到计划
                </el-button>
                <el-button
                  v-else
                  type="danger"
                  size="small"
                  @click="$emit('remove-restaurant', restaurant)"
                >
                  <el-icon><Check /></el-icon>
                  已添加
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="recommendedRestaurants.length > 0 && !isSearchMode"
          class="view-more-container"
        >
          <el-button
            type="primary"
            plain
            size="small"
            @click="$emit('load-more-restaurants')"
          >
            <el-icon><More /></el-icon>
            查看更多餐厅
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Location,
  Food,
  More,
  Check,
  Star,
  Plus,
  Search,
  Picture,
} from "@element-plus/icons-vue";

export default {
  name: "RecommendationSection",
  components: {
    Location,
    Food,
    More,
    Check,
    Star,
    Plus,
    Search,
    Picture,
  },
  props: {
    // 城市信息
    cityInfo: {
      type: Object,
      default: () => null,
    },
    // 推荐景点和餐厅
    recommendedAttractions: {
      type: Array,
      default: () => [],
    },
    recommendedRestaurants: {
      type: Array,
      default: () => [],
    },
    // 已选择的景点和餐厅
    selectedAttractions: {
      type: Array,
      default: () => [],
    },
    selectedRestaurants: {
      type: Array,
      default: () => [],
    },
    // 加载状态
    loadingAttractions: {
      type: Boolean,
      default: false,
    },
    loadingRestaurants: {
      type: Boolean,
      default: false,
    },
    // API错误
    apiError: {
      type: String,
      default: null,
    },
    // 搜索相关
    searchResults: {
      type: Array,
      default: () => [],
    },
    isSearchMode: {
      type: Boolean,
      default: false,
    },
    searching: {
      type: Boolean,
      default: false,
    },
    // 工具函数
    extractAttractionTags: {
      type: Function,
      required: true,
    },
    extractSignatureDishes: {
      type: Function,
      required: true,
    },
  },
  emits: [
    "add-attraction",
    "remove-attraction",
    "add-restaurant", 
    "remove-restaurant",
    "load-more-attractions",
    "load-more-restaurants",
    "search",
    "clear-search",
    "clear-all-selections",
  ],
  setup(props, { emit }) {
    // 当前激活的标签页
    const activeTab = ref("attractions");
    
    // 搜索关键词
    const searchKeyword = ref("");
    
    // 排序方式
    const sortBy = ref("default");
    
    // 选择摘要详情展开状态
    const showSummaryDetail = ref(false);

    // 判断景点是否已选择
    const isAttractionSelected = (attraction) => {
      return props.selectedAttractions.some((a) => a.id === attraction.id);
    };

    // 判断餐厅是否已选择
    const isRestaurantSelected = (restaurant) => {
      return props.selectedRestaurants.some((r) => r.id === restaurant.id);
    };

    // 搜索处理
    const handleSearch = () => {
      if (!searchKeyword.value.trim()) {
        ElMessage.warning("请输入搜索关键词");
        return;
      }
      emit("search", {
        keyword: searchKeyword.value.trim(),
        type: activeTab.value,
        sortBy: sortBy.value,
      });
    };

    // 清除搜索
    const handleClearSearch = () => {
      searchKeyword.value = "";
      emit("clear-search");
    };

    // 切换摘要详情
    const toggleSummaryDetail = () => {
      showSummaryDetail.value = !showSummaryDetail.value;
    };

    // 清空所有选择
    const clearAllSelections = async () => {
      try {
        await ElMessageBox.confirm(
          `确定要清空所有选择吗？共 ${props.selectedAttractions.length} 个景点和 ${props.selectedRestaurants.length} 家餐厅。`,
          "警告",
          {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            type: "warning",
          }
        );
        emit("clear-all-selections");
      } catch {
        // 用户取消
      }
    };

    return {
      activeTab,
      searchKeyword,
      sortBy,
      showSummaryDetail,
      isAttractionSelected,
      isRestaurantSelected,
      handleSearch,
      handleClearSearch,
      toggleSummaryDetail,
      clearAllSelections,
    };
  },
};
</script>

<style scoped>
.recommendation-section {
  position: relative;
}

/* 悬浮选择摘要卡片 */
.selection-summary-float {
  position: sticky;
  top: 20px;
  z-index: 100;
  margin-bottom: 20px;
}

.summary-float-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid #91a8d0;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(145, 168, 208, 0.2);
  backdrop-filter: blur(10px);
  overflow: hidden;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  color: white;
}

.summary-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.summary-detail {
  padding: 16px 20px;
  border-top: 1px solid rgba(145, 168, 208, 0.1);
  animation: slideDown 0.2s ease-out;
}

.selected-items-compact {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selected-section-compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-header-compact {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.section-title-compact {
  font-size: 14px;
}

.selected-list-compact {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.selection-tag-compact {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
}

.summary-actions-compact {
  display: flex;
  justify-content: center;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

/* 表单分区样式 */
.form-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8eaed;
  transition: all 0.3s ease;
}

.form-section:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 分区标题 */
.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f2f5;
  position: relative;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(135deg, #91a8d0, #f7cac9);
  border-radius: 1px;
}

.section-title .el-icon {
  color: #91a8d0;
  font-size: 24px;
}

/* 标签切换器样式 */
.tab-switcher {
  display: flex;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
  position: relative;
  min-height: 60px;
}

.tab-item:hover {
  background: #f5f7fa;
}

.tab-item.active {
  background: #fff;
  border-bottom-color: #91a8d0;
  color: #91a8d0;
  font-weight: 500;
}

.tab-item .el-icon {
  font-size: 16px;
}

.tab-item span {
  font-size: 14px;
  font-weight: 500;
}

.tab-item .el-tag {
  margin-left: auto;
}

.tab-item.active::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 3px;
  background: #91a8d0;
  animation: slideIn 0.3s ease-out;
}

/* 搜索区域样式 */
.search-section {
  padding: 16px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.search-input-group {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.search-input-group .el-input {
  flex: 1;
}

.search-filters {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-mode-tip {
  margin-bottom: 16px;
}

/* 推荐内容样式 */
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

.recommendation-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 16px;
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
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 24px;
}

.recommendation-content {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.recommendation-content h4 {
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

.category-tag {
  font-size: 11px;
}

.tag-item {
  font-size: 11px;
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

.view-more-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 特色标签和招牌菜样式 */
.attraction-tags,
.signature-dishes {
  margin: 6px 0;
}

.tags-title,
.signature-title {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 4px;
  font-size: 11px;
  color: #606266;
}

.feature-tags,
.dish-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.feature-tag,
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

.add-to-plan {
  margin-top: auto;
  padding-top: 8px;
  text-align: right;
}

.add-to-plan .el-button {
  padding: 6px 12px;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .recommendation-list {
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
}

@media (max-width: 768px) {
  .tab-switcher {
    flex-direction: column;
  }

  .tab-item {
    padding: 12px 16px;
  }

  .search-section {
    padding: 12px 16px;
  }

  .search-input-group {
    flex-direction: column;
    gap: 8px;
  }

  .search-filters {
    flex-wrap: wrap;
    gap: 8px;
  }

  .recommendation-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .summary-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .selected-list-compact {
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .recommendation-list {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .recommendation-image {
    height: 120px;
  }

  .recommendation-content {
    padding: 8px;
  }

  .recommendation-content h4 {
    font-size: 13px;
    margin-bottom: 6px;
  }

  .rating-with-number .el-rate {
    font-size: 12px;
  }

  .rating-value {
    font-size: 12px;
  }

  .attraction-tags,
  .signature-dishes {
    margin: 4px 0;
  }

  .add-to-plan .el-button {
    padding: 4px 8px;
    font-size: 11px;
  }

  .summary-float-card {
    margin: 0 -10px;
    border-radius: 12px;
  }

  .summary-header {
    padding: 12px 16px;
  }

  .summary-detail {
    padding: 12px 16px;
  }
}
</style>
