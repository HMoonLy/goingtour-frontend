<template>
  <div class="search-section">
    <div class="search-input-group">
      <el-input
        :model-value="searchKeyword"
        :placeholder="placeholder"
        clearable
        class="search-input"
        @update:model-value="$emit('update:search-keyword', $event)"
        @keyup.enter="$emit('search')"
        @clear="$emit('clear-search')"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button
        type="primary"
        @click="$emit('search')"
      >
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
    </div>
    
    <div class="search-filters">
      <el-select
        :model-value="sortBy"
        placeholder="排序方式"
        size="small"
        style="width: 120px"
        @update:model-value="$emit('update:sort-by', $event)"
      >
        <el-option label="默认排序" value="default" />
        <el-option label="评分优先" value="rating" />
      </el-select>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { Search } from "@element-plus/icons-vue";

export default {
  name: "RecommendationSearch",
  components: {
    Search
  },
  props: {
    searchKeyword: {
      type: String,
      default: ""
    },
    sortBy: {
      type: String,
      default: "default"
    },
    activeTab: {
      type: String,
      default: "attractions"
    }
  },
  emits: [
    "update:search-keyword", 
    "update:sort-by", 
    "search", 
    "clear-search"
  ],
  setup(props) {
    const placeholder = computed(() => {
      switch (props.activeTab) {
        case 'attractions':
          return '搜索景点名称或输入关键词';
        case 'restaurants':
          return '搜索餐厅名称或输入关键词';
        case 'hotels':
          return '搜索酒店名称或输入关键词';
        default:
          return '搜索...';
      }
    });

    return {
      placeholder
    };
  }
};
</script>

<style scoped>
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

.search-input-group .el-input,
.search-input-group .search-input {
  flex: 1;
}

.search-input {
  font-size: 16px; /* 防止iOS缩放 */
}

.search-filters {
  display: flex;
  gap: 12px;
  align-items: center;
}

@media (max-width: 768px) {
  .search-section {
    padding: 16px;
    margin-bottom: 20px;
  }

  .search-input-group {
    flex-direction: column;
    gap: 12px;
  }

  .search-filters {
    flex-wrap: wrap;
    gap: 12px;
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  /* 搜索区域手机优化 */
  .search-section {
    padding: 12px;
    border-radius: 12px;
  }

  .search-input-group .el-button {
    padding: 12px 20px;
    font-size: 14px;
  }
}
</style>
