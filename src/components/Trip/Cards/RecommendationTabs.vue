<template>
  <div class="tab-switcher">
    <div
      class="tab-item"
      :class="{ active: modelValue === 'attractions' }"
      @click="$emit('update:modelValue', 'attractions')"
    >
      <el-icon><Location /></el-icon>
      <span>必去景点</span>
      <el-tag size="small" type="success"> 高德API </el-tag>
    </div>
    <div
      class="tab-item"
      :class="{ active: modelValue === 'restaurants' }"
      @click="$emit('update:modelValue', 'restaurants')"
    >
      <el-icon><Food /></el-icon>
      <span>必去餐厅</span>
      <el-tag size="small" type="warning"> 高德API </el-tag>
    </div>
    <div
      class="tab-item"
      :class="{ active: modelValue === 'hotels' }"
      @click="$emit('update:modelValue', 'hotels')"
    >
      <el-icon><House /></el-icon>
      <span>酒店住宿</span>
      <el-tag size="small" type="primary"> 高德API </el-tag>
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
  emits: ["update:modelValue"]
};
</script>

<style scoped>
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
  position: relative;
  min-height: 60px;
}

.tab-item:hover {
  background: #f5f7fa;
}

.tab-item.active {
  background: #fff;
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

@media (max-width: 768px) {
  .tab-switcher {
    margin-bottom: 20px;
  }

  .tab-item {
    padding: 14px 16px;
    min-height: 56px;
    font-size: 14px;
  }
}
</style>
