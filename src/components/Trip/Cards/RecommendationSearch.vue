<template>
  <div class="search-section">
    <div class="search-container">
      <!-- 搜索输入框 -->
      <div class="search-input-wrapper">
        <el-input
          :model-value="searchKeyword"
          :placeholder="placeholder"
          clearable
          class="search-input"
          @update:model-value="handleInput"
          @keyup.enter="handleSearch"
          @clear="handleClear"
        >
          <template #prefix>
            <el-icon class="search-icon"><Search /></el-icon>
          </template>
        </el-input>
        
        <!-- 搜索按钮 (桌面端显示文字，移动端可能只显示图标或隐藏) -->
        <el-button 
          type="primary" 
          :loading="loading"
          class="search-btn"
          @click="handleSearch"
        >
          搜索
        </el-button>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-group">
        <span class="filter-label">排序：</span>
        <el-select
          :model-value="sortBy"
          size="default"
          class="sort-select"
          @update:model-value="$emit('update:sort-by', $event)"
        >
          <el-option label="默认推荐" value="default" />
          <el-option label="评分最高" value="rating" />
          <!-- 可以预留更多排序选项 -->
          <!-- <el-option label="距离最近" value="distance" /> -->
        </el-select>
      </div>
    </div>
    
    <!-- 可扩展的标签栏 (预留位置) -->
    <!-- <div class="quick-tags" v-if="activeTab === 'attractions'">
       <el-tag>自然风光</el-tag> <el-tag>人文古迹</el-tag>
    </div> -->
  </div>
</template>

<script>
import { computed, ref } from "vue";
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
    },
    // 新增：加载状态
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    "update:search-keyword", 
    "update:sort-by", 
    "search", 
    "clear-search"
  ],
  setup(props, { emit }) {
    const placeholder = computed(() => {
      const map = {
        attractions: '搜索景点...',
        restaurants: '搜索美食/餐厅...',
        hotels: '搜索酒店/住宿...',
      };
      return map[props.activeTab] || '请输入关键词搜索...';
    });

    // 简单的防抖函数实现
    let timer = null;
    const handleInput = (val) => {
      emit('update:search-keyword', val);
      
      // 防抖：输入停止 500ms 后自动触发搜索
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        emit('search');
      }, 500);
    };

    const handleSearch = () => {
      if (timer) clearTimeout(timer);
      emit('search');
    };

    const handleClear = () => {
      emit('update:search-keyword', '');
      emit('clear-search');
      // 清空通常意味着重置列表，也可以触发一次搜索
    };

    return {
      placeholder,
      handleInput,
      handleSearch,
      handleClear
    };
  }
};
</script>

<style scoped>
.search-section {
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #f0f2f5;
  /* 如果不需要底部边框，可以去掉，或者改为圆角卡片背景 */
  /* background: #f8f9fa; border-radius: 8px; */
}

.search-container {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

/* 输入框包装器，让它占据剩余空间 */
.search-input-wrapper {
  display: flex;
  flex: 1;
  gap: 8px;
  min-width: 200px;
}

.search-input {
  flex: 1;
}

/* 覆盖 Element Plus 输入框样式，使其更圆润或更平滑 */
:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  border-radius: 4px;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.filter-label {
  font-size: 14px;
  color: #606266;
}

.sort-select {
  width: 110px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .search-section {
    padding: 12px;
  }
  
  .search-container {
    gap: 12px;
  }

  /* 移动端搜索框和按钮独占一行 */
  .search-input-wrapper {
    min-width: 100%;
  }
  
  /* 移动端筛选栏也独占一行，或者靠右 */
  .filter-group {
    width: 100%;
    justify-content: space-between;
  }
  
  .sort-select {
    width: 130px; /* 稍微宽一点方便点击 */
  }
}
</style>
