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
/* 容器 */
.tab-switcher {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: transparent;
  padding: 0;
  border: none;
  width: 100%;
}

/* 单个 Tab */
.tab-item {
  display: flex;
  align-items: center;
  /* 左侧内边距稍微调小，紧凑一点 */
  padding: 10px 12px; 
  cursor: pointer;
  color: #606266;
  border-radius: 8px;
  transition: all 0.2s;
  font-size: 15px;
  width: 100%;
}

/* 关键：修复对齐！ */
.tab-content {
  display: flex;
  align-items: center;
  width: 100%;
}

/* 给图标容器一个固定宽度，比如 24px，并居中 */
.tab-icon {
  width: 24px; 
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px; /* 图标和文字的间距 */
  flex-shrink: 0; /* 防止图标被压缩 */
}

/* 选中状态：用最轻的交互 */
.tab-item.active {
  background: #fff; /* 纯白背景 */
  color: var(--el-color-primary);
  font-weight: 600;
  /* 加一个小阴影，让选中的项浮起来，而不是凹下去 */
  box-shadow: 0 2px 8px rgba(0,0,0,0.05); 
}

/* Hover 效果 */
.tab-item:not(.active):hover {
  background: rgba(0,0,0,0.03); /* 极淡的灰 */
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
  
  .tab-icon {
    margin-right: 6px;
    width: auto;
  }
}
</style>