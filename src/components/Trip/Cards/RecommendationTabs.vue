<template>
  <!-- 结构不变，依靠样式改变排列 -->
  <div class="tab-switcher">
    <div
      v-for="tab in tabs"
      :key="tab.value"
      class="tab-item"
      :class="{ active: modelValue === tab.value }"
      @click="$emit('update:modelValue', tab.value)"
    >
      <div class="tab-content">
        <el-icon class="tab-icon" :size="18">
          <component :is="tab.icon" />
        </el-icon>
        <span class="tab-label">{{ tab.label }}</span>
      </div>
      
      <!-- 只有在大屏时显示Tag，或者直接去掉Tag -->
      <!-- <div class="tab-tag-wrapper">...</div> -->
    </div>
  </div>
</template>

<script>
import { Location, Food, House } from "@element-plus/icons-vue";

export default {
  name: "RecommendationTabs",
  components: {
    Location,
    Food,
    House
  },
  props: {
    modelValue: {
      type: String,
      required: true
    }
  },
  emits: ["update:modelValue"],
  setup() {
    const tabs = [
      { 
        label: '必去景点', 
        value: 'attractions', 
        icon: 'Location', 
        tagText: '高德API', 
        tagType: 'success' 
      },
      { 
        label: '必去餐厅', 
        value: 'restaurants', 
        icon: 'Food', 
        tagText: '高德API', 
        tagType: 'warning' 
      },
      { 
        label: '酒店住宿', 
        value: 'hotels', 
        icon: 'House', 
        tagText: '高德API', 
        tagType: 'primary' 
      }
    ];

    return {
      tabs
    };
  }
};
</script>

<style scoped>
/* 容器：垂直排列 */
.tab-switcher {
  display: flex;
  flex-direction: column; /* 关键：垂直方向 */
  gap: 8px;
  background: transparent;
  padding: 0;
  border: none;
}

/* 单个 Tab：左侧菜单项样式 */
.tab-item {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 左对齐 */
  padding: 12px 16px;
  cursor: pointer;
  color: #606266;
  border-radius: 8px;
  transition: all 0.2s;
  font-size: 15px;
}

/* 选中状态：浅蓝背景 + 深蓝文字 + 左侧蓝条 */
.tab-item.active {
  background: #ecf5ff; /* 极淡的蓝色背景 */
  color: var(--el-color-primary);
  font-weight: 600;
}

.tab-content {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.tab-icon {
  color: inherit;
}

/* Hover 效果 */
.tab-item:not(.active):hover {
  background: #f5f7fa;
}

/* 响应式：在移动端/平板端变回水平排列 */
@media (max-width: 900px) {
  .tab-switcher {
    flex-direction: row; /* 变回水平 */
    overflow-x: auto; /* 支持横向滚动 */
    background: #f1f3f5; /* 回归胶囊背景 */
    padding: 4px;
    border-radius: 8px;
  }

  .tab-item {
    flex: 1;
    justify-content: center;
    padding: 8px;
  }
  
  .tab-item.active {
    background: #fff;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }
}
</style>

