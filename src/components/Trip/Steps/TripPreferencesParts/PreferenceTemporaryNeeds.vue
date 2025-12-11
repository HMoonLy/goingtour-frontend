<template>
  <el-card class="section" shadow="never">
    <template #header>
      <div class="section-header">
        <el-icon><Warning /></el-icon>
        <div>
          <div class="section-title">这次旅行的特殊情况</div>
          <div class="section-desc">选择这次旅行需要特别考虑的因素（可多选）</div>
        </div>
      </div>
    </template>

    <div class="needs-content">
      <div class="needs-grid">
        <div
          v-for="need in options"
          :key="need.value"
          class="need-item"
          :class="{
            selected: modelValue.includes(need.value),
          }"
          @click="toggleTemporaryNeed(need.value)"
        >
          <div class="need-header">
            <span class="need-icon">{{ need.icon }}</span>
            <span class="need-name">{{ need.name }}</span>
          </div>
          <p class="need-desc">{{ need.description }}</p>
          <div class="need-strategy">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ need.aiStrategy }}</span>
          </div>

          <el-icon
            v-if="modelValue.includes(need.value)"
            class="check-icon"
          >
            <Check />
          </el-icon>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { Warning, InfoFilled, Check } from "@element-plus/icons-vue";

export default {
  name: "PreferenceTemporaryNeeds",
  components: {
    Warning,
    InfoFilled,
    Check,
  },
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    options: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const toggleTemporaryNeed = (need) => {
      const newValue = [...props.modelValue];
      const index = newValue.indexOf(need);
      if (index > -1) {
        newValue.splice(index, 1);
      } else {
        newValue.push(need);
      }
      emit("update:modelValue", newValue);
    };

    return {
      toggleTemporaryNeed,
    };
  },
};
</script>

<style scoped>
.section {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.section :deep(.el-card__header) {
  background: linear-gradient(
    90deg,
    rgba(145, 168, 208, 0.12),
    rgba(247, 202, 201, 0.06)
  );
  padding: 20px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.section-header .el-icon {
  font-size: 20px;
  color: #91a8d0;
  margin-top: 2px;
}

.section-title {
  font-weight: 600;
  color: #303133;
  font-size: 18px;
  margin-bottom: 4px;
}

.section-desc {
  color: #909399;
  font-size: 14px;
}

.needs-content {
  padding: 20px;
}

.needs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.need-item {
  position: relative;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.need-item:hover {
  border-color: #91a8d0;
  background: #f5f7fa;
}

.need-item.selected {
  border-color: #91a8d0;
  background: rgba(145, 168, 208, 0.1);
}

.need-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.need-icon {
  font-size: 20px;
}

.need-name {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.need-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
}

.need-strategy {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
  font-style: italic;
}

.check-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #67c23a;
  font-size: 18px;
}

@media (max-width: 768px) {
  .needs-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
