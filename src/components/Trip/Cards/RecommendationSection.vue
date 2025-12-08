<template>
  <div class="recommendation-section">
    <!-- 选择摘要悬浮卡片 -->
    <RecommendationSummary
      :selected-attractions="selectedAttractions"
      :selected-restaurants="selectedRestaurants"
      :selected-hotels="selectedHotels"
      @remove-attraction="$emit('remove-attraction', $event)"
      @remove-restaurant="$emit('remove-restaurant', $event)"
      @remove-hotel="$emit('remove-hotel', $event)"
      @clear-all-selections="clearAllSelections"
    />

    <!-- 推荐区域主体 -->
    <div class="form-section">
      <div class="section-title">
        <el-icon><Location /></el-icon>
        <span>{{ (cityInfo?.destinationName || "目的地") + "推荐内容" }}</span>
      </div>

      <!-- 切换标签 -->
      <RecommendationTabs v-model="activeTab" />

      <!-- 搜索功能 -->
      <RecommendationSearch
        v-model:search-keyword="searchKeyword"
        v-model:sort-by="sortBy"
        :active-tab="activeTab"
        @search="handleSearch"
        @clear-search="handleClearSearch"
      />

      <!-- 景点推荐内容 -->
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

      <!-- 餐厅推荐内容 -->
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

      <!-- 酒店推荐内容 -->
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .form-section {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  /* 平板适配 */
  .form-section {
    padding: 20px 16px;
    margin: 0 8px;
  }
  
  .section-title {
    font-size: 18px;
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  /* 手机端优化 */
  .form-section {
    padding: 16px 12px;
    margin: 0 4px;
    border-radius: 12px;
  }
  
  .section-title {
    font-size: 16px;
    margin-bottom: 16px;
  }
}
</style>