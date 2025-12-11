<template>
  <div class="recommendation-section">
    <!-- 选择摘要悬浮卡片 (保持不变) -->
    <RecommendationSummary
      :selected-attractions="selectedAttractions"
      :selected-restaurants="selectedRestaurants"
      :selected-hotels="selectedHotels"
      @remove-attraction="$emit('remove-attraction', $event)"
      @remove-restaurant="$emit('remove-restaurant', $event)"
      @remove-hotel="$emit('remove-hotel', $event)"
      @clear-all-selections="clearAllSelections"
    />

    <!-- 主要布局容器：左右分栏 -->
    <div class="main-layout">
      
      <!-- 左侧：导航栏 -->
      <div class="sidebar">
        <!-- 可以在这里放一个小标题，比如"分类" -->
        <RecommendationTabs v-model="activeTab" />
      </div>

      <!-- 右侧：内容区 -->
      <div class="content-area">

      <!-- 搜索功能 -->
        <div class="search-wrapper">
      <RecommendationSearch
        v-model:search-keyword="searchKeyword"
        v-model:sort-by="sortBy"
        :active-tab="activeTab"
        @search="handleSearch"
        @clear-search="handleClearSearch"
      />
        </div>

        <!-- 列表内容 -->
        <div class="list-container">
      <AttractionList
        v-show="activeTab === 'attractions'"
        :city-info="cityInfo"
        :selected-items="selectedAttractions"
        v-model:search-keyword="searchKeyword"
        :trigger-search="triggerSearch"
        :sort-by="sortBy"
        @add="$emit('add-attraction', $event)"
        @remove="$emit('remove-attraction', $event)"
      />

      <RestaurantList
        v-show="activeTab === 'restaurants'"
        :city-info="cityInfo"
        :selected-items="selectedRestaurants"
        v-model:search-keyword="searchKeyword"
        :trigger-search="triggerSearch"
        :sort-by="sortBy"
        @add="$emit('add-restaurant', $event)"
        @remove="$emit('remove-restaurant', $event)"
      />

      <HotelList
        v-show="activeTab === 'hotels'"
        :city-info="cityInfo"
        :selected-items="selectedHotels"
        v-model:search-keyword="searchKeyword"
        :trigger-search="triggerSearch"
        :sort-by="sortBy"
        @add="$emit('add-hotel', $event)"
        @remove="$emit('remove-hotel', $event)"
      />
    </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { Location } from "@element-plus/icons-vue";
import RecommendationSummary from "./RecommendationSummary.vue";
import RecommendationTabs from "./RecommendationTabs.vue";
import RecommendationSearch from "./RecommendationSearch.vue";
import AttractionList from "./AttractionList.vue";
import RestaurantList from "./RestaurantList.vue";
import HotelList from "./HotelList.vue";

export default {
  name: "RecommendationSection",
  components: {
    Location,
    RecommendationSummary,
    RecommendationTabs,
    RecommendationSearch,
    AttractionList,
    RestaurantList,
    HotelList
  },
  props: {
    // 城市信息
    cityInfo: {
      type: Object,
      default: () => null,
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
    selectedHotels: {
      type: Array,
      default: () => [],
    }
  },
  emits: [
    "add-attraction",
    "remove-attraction",
    "add-restaurant", 
    "remove-restaurant",
    "add-hotel",
    "remove-hotel",
    "clear-all-selections",
  ],
  setup(props, { emit }) {
    // 当前激活的标签页
    const activeTab = ref("attractions");
    
    // 搜索关键词
    const searchKeyword = ref("");
    
    // 排序方式
    const sortBy = ref("default");
    
    // 触发搜索的信号
    const triggerSearch = ref(0);

    // 搜索处理
    const handleSearch = () => {
      if (!searchKeyword.value.trim()) {
        ElMessage.warning("请输入搜索关键词");
        return;
      }
      triggerSearch.value = Date.now();
    };

    // 清除搜索
    const handleClearSearch = () => {
      searchKeyword.value = "";
      triggerSearch.value = Date.now(); // 触发子组件重置
    };

    // 清空所有选择
    const clearAllSelections = () => {
        // 逻辑已移至子组件内部确认，这里只接收确认后的事件
        // 但子组件emit的是"clear-all-selections"，所以直接转发
        emit("clear-all-selections");
    };

    // 切换tab时清空搜索？或者保留？
    watch(activeTab, () => {
        // 切换Tab时保留关键词，但不自动触发搜索
    });

    return {
      activeTab,
      searchKeyword,
      sortBy,
      triggerSearch,
      handleSearch,
      handleClearSearch,
      clearAllSelections,
    };
  },
};
</script>

<style scoped>
.recommendation-section {
  position: relative;
}

/* 核心布局：左右 Flex，回归极简通透 */
.main-layout {
  display: flex;
  align-items: flex-start;
  gap: 32px; /* 稍微拉大间距，利用留白分割 */
  /* 去掉 background, box-shadow, border */
  min-height: auto;
}

/* 左侧边栏 */
.sidebar {
  width: 180px;
  flex-shrink: 0;
  padding: 0; /* 去掉内边距 */
  /* 去掉 background, border */
  position: sticky;
  top: 24px;
  /* 如果希望和右侧搜索框顶部严格对齐，可以微调 margin-top */
  margin-top: 4px; 
}

/* 右侧内容区 */
.content-area {
  flex: 1;
  min-width: 0;
  padding: 0; /* 去掉内边距 */
  /* 去掉 background */
}

/* 搜索框：去掉白色背景，让它变轻 */
.search-wrapper {
  margin-bottom: 24px;
  background: transparent; /* 去掉白色背景 */
  padding: 0; /* 去掉内边距 */
  box-shadow: none; /* 去掉阴影 */
}

/* 响应式 */
@media (max-width: 900px) {
  .main-layout {
    flex-direction: column;
    gap: 20px;
  }
  .sidebar {
    width: 100%;
    position: static;
    margin-top: 0;
  }
  .search-wrapper {
    /* 移动端可能还是需要一点背景或者 padding */
    margin-bottom: 16px;
  }
}
</style>