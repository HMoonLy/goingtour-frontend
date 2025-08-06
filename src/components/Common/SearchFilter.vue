<template>
  <div class="search-filter">
    <!-- 搜索框 -->
    <div class="search-section">
      <el-input
        v-model="searchQuery"
        :placeholder="searchPlaceholder"
        :size="size"
        clearable
        @input="handleSearch"
        @clear="handleClear"
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 过滤器 -->
    <div v-if="showFilters" class="filter-section">
      <!-- 标签过滤 -->
      <div v-if="tagOptions.length > 0" class="filter-group">
        <label class="filter-label">标签筛选</label>
        <div class="tag-filters">
          <el-tag
            v-for="tag in tagOptions"
            :key="tag.value"
            :type="selectedTags.includes(tag.value) ? 'primary' : ''"
            :effect="selectedTags.includes(tag.value) ? 'dark' : 'plain'"
            @click="toggleTag(tag.value)"
            class="filter-tag"
          >
            {{ tag.label }}
          </el-tag>
        </div>
      </div>

      <!-- 日期范围过滤 -->
      <div v-if="showDateFilter" class="filter-group">
        <label class="filter-label">创建时间</label>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          :size="size"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
          class="date-filter"
        />
      </div>

      <!-- 排序选项 -->
      <div v-if="sortOptions.length > 0" class="filter-group">
        <label class="filter-label">排序方式</label>
        <el-select
          v-model="selectedSort"
          :placeholder="sortPlaceholder"
          :size="size"
          @change="handleSortChange"
          class="sort-select"
        >
          <el-option
            v-for="option in sortOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>

      <!-- 自定义过滤器插槽 -->
      <div v-if="$slots.customFilters" class="filter-group">
        <slot name="customFilters" />
      </div>
    </div>

    <!-- 过滤器切换按钮 -->
    <div v-if="collapsible" class="filter-toggle">
      <el-button
        :type="showFilters ? 'primary' : ''"
        :icon="showFilters ? ArrowUp : ArrowDown"
        @click="toggleFilters"
        size="small"
      >
        {{ showFilters ? '收起筛选' : '展开筛选' }}
      </el-button>
    </div>

    <!-- 清除所有过滤器 -->
    <div v-if="hasActiveFilters" class="clear-filters">
      <el-button
        type="danger"
        link
        @click="clearAllFilters"
        size="small"
      >
        清除所有筛选
      </el-button>
    </div>

    <!-- 结果统计 -->
    <div v-if="showResultCount" class="result-count">
      <span class="count-text">
        找到 <strong>{{ resultCount }}</strong> 个结果
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Search, ArrowUp, ArrowDown } from '@element-plus/icons-vue';
import { debounce } from '@/utils/apiOptimizer.js';

const props = defineProps({
  // 搜索占位符
  searchPlaceholder: {
    type: String,
    default: '搜索...'
  },
  // 组件大小
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['large', 'default', 'small'].includes(value)
  },
  // 是否显示过滤器
  showFilters: {
    type: Boolean,
    default: true
  },
  // 是否可折叠过滤器
  collapsible: {
    type: Boolean,
    default: false
  },
  // 标签选项
  tagOptions: {
    type: Array,
    default: () => []
  },
  // 是否显示日期过滤
  showDateFilter: {
    type: Boolean,
    default: false
  },
  // 排序选项
  sortOptions: {
    type: Array,
    default: () => []
  },
  // 排序占位符
  sortPlaceholder: {
    type: String,
    default: '选择排序方式'
  },
  // 是否显示结果数量
  showResultCount: {
    type: Boolean,
    default: false
  },
  // 结果数量
  resultCount: {
    type: Number,
    default: 0
  },
  // 防抖延迟
  debounceDelay: {
    type: Number,
    default: 300
  }
});

const emit = defineEmits([
  'search',
  'filter-change',
  'sort-change',
  'date-change',
  'clear'
]);

// 响应式数据
const searchQuery = ref('');
const selectedTags = ref([]);
const dateRange = ref([]);
const selectedSort = ref('');
const filtersVisible = ref(props.showFilters);

// 计算属性
const showFilters = computed({
  get: () => props.collapsible ? filtersVisible.value : props.showFilters,
  set: (value) => {
    filtersVisible.value = value;
  }
});

const hasActiveFilters = computed(() => {
  return searchQuery.value || 
         selectedTags.value.length > 0 || 
         dateRange.value.length > 0 || 
         selectedSort.value;
});

// 防抖搜索
const debouncedSearch = debounce(() => {
  emitFilterChange();
}, props.debounceDelay);

// 方法
const handleSearch = () => {
  debouncedSearch();
};

const handleClear = () => {
  searchQuery.value = '';
  emitFilterChange();
  emit('clear');
};

const toggleTag = (tagValue) => {
  const index = selectedTags.value.indexOf(tagValue);
  if (index > -1) {
    selectedTags.value.splice(index, 1);
  } else {
    selectedTags.value.push(tagValue);
  }
  emitFilterChange();
};

const handleDateChange = (dates) => {
  dateRange.value = dates || [];
  emitFilterChange();
  emit('date-change', dates);
};

const handleSortChange = (sortValue) => {
  selectedSort.value = sortValue;
  emit('sort-change', sortValue);
};

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const clearAllFilters = () => {
  searchQuery.value = '';
  selectedTags.value = [];
  dateRange.value = [];
  selectedSort.value = '';
  emitFilterChange();
  emit('clear');
};

const emitFilterChange = () => {
  const filterData = {
    search: searchQuery.value,
    tags: selectedTags.value,
    dateRange: dateRange.value,
    sort: selectedSort.value
  };
  
  emit('search', searchQuery.value);
  emit('filter-change', filterData);
};

// 监听器
watch([selectedTags], () => {
  emitFilterChange();
}, { deep: true });

// 暴露方法给父组件
defineExpose({
  clearAllFilters,
  setSearchQuery: (query) => {
    searchQuery.value = query;
  },
  setTags: (tags) => {
    selectedTags.value = [...tags];
  },
  setDateRange: (dates) => {
    dateRange.value = dates || [];
  },
  setSort: (sort) => {
    selectedSort.value = sort;
  }
});
</script>

<style scoped>
.search-filter {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.search-section {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.tag-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tag:hover {
  transform: translateY(-1px);
}

.date-filter {
  width: 100%;
  max-width: 300px;
}

.sort-select {
  width: 100%;
  max-width: 200px;
}

.filter-toggle {
  display: flex;
  justify-content: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.clear-filters {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.result-count {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.count-text {
  font-size: 14px;
  color: #606266;
}

.count-text strong {
  color: #409eff;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .filter-section {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-end;
  }

  .filter-group {
    flex: 1;
    min-width: 200px;
    max-width: 300px;
  }

  .tag-filters {
    max-width: 400px;
  }
}

@media (max-width: 767px) {
  .search-filter {
    padding: 12px;
  }

  .filter-group {
    gap: 6px;
  }

  .filter-label {
    font-size: 13px;
  }

  .tag-filters {
    gap: 6px;
  }

  .filter-tag {
    font-size: 12px;
    padding: 4px 8px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .search-filter {
    background: #2d2d2d;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .filter-label {
    color: #e4e7ed;
  }

  .count-text {
    color: #909399;
  }

  .filter-toggle {
    border-top-color: #4c4d4f;
  }

  .result-count {
    border-top-color: #4c4d4f;
  }
}
</style>