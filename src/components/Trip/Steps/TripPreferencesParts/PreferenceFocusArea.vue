<template>
  <el-card class="section" shadow="never">
    <template #header>
      <div class="section-header">
        <el-icon><Star /></el-icon>
        <div>
          <div class="section-title">这次最想体验什么？</div>
          <div class="section-desc">
            选择这次旅行您最期待的体验类型（最多3个）
            <span v-if="recommendedOptions.length > 0" class="smart-tip">
              <el-icon><MagicStick /></el-icon>
              基于您的兴趣推荐
            </span>
          </div>
        </div>
      </div>
    </template>

    <div class="focus-content">
      <div class="focus-grid">
        <div
          v-for="focus in options"
          :key="focus.value"
          class="focus-item"
          :class="{
            selected: modelValue.includes(focus.value),
            recommended: recommendedOptions.includes(focus.value),
            disabled:
              !modelValue.includes(focus.value) &&
              modelValue.length >= 3,
          }"
          @click="toggleFocusArea(focus.value)"
        >
          <div class="focus-header">
            <span class="focus-icon">{{ focus.icon }}</span>
            <span class="focus-name">{{ focus.name }}</span>
          </div>
          <p class="focus-desc">{{ focus.description }}</p>

          <!-- 推荐标记 (选中时隐藏) -->
          <div
            v-if="recommendedOptions.includes(focus.value) && !modelValue.includes(focus.value)"
            class="recommended-badge"
          >
            <el-icon><Star /></el-icon>
            <span>推荐</span>
          </div>

          <!-- 选中标记 -->
          <el-icon
            v-if="modelValue.includes(focus.value)"
            class="check-icon"
          >
            <Check />
          </el-icon>
        </div>
      </div>

      <div class="selection-info" v-if="modelValue.length > 0">
        <span class="selection-count"
          >已选择 {{ modelValue.length }}/3</span
        >
        <el-button
          link
          size="small"
          type="primary"
          @click="clearFocusAreas"
        >
          清空选择
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script>
import { Star, Check, MagicStick } from "@element-plus/icons-vue";

export default {
  name: "PreferenceFocusArea",
  components: {
    Star,
    Check,
    MagicStick,
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
    recommendedOptions: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const toggleFocusArea = (area) => {
      const newValue = [...props.modelValue];
      const index = newValue.indexOf(area);
      if (index > -1) {
        newValue.splice(index, 1);
      } else if (newValue.length < 3) {
        newValue.push(area);
      }
      emit("update:modelValue", newValue);
    };

    const clearFocusAreas = () => {
      emit("update:modelValue", []);
    };

    return {
      toggleFocusArea,
      clearFocusAreas,
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
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.smart-tip {
  background: rgba(145, 168, 208, 0.1);
  color: #91a8d0;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.focus-content {
  padding: 20px;
}

.focus-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.focus-item {
  position: relative;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.focus-item:hover {
  border-color: #91a8d0;
  background: #f5f7fa;
}

.focus-item.selected {
  border-color: #91a8d0;
  background: rgba(145, 168, 208, 0.1);
}

.focus-item.recommended {
  border-color: #f7cac9;
}

.focus-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.focus-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.focus-icon {
  font-size: 20px;
}

.focus-name {
  font-weight: 600;
  color: #303133;
  font-size: 15px;
}

.focus-desc {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
}

.recommended-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #f7cac9;
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 2px;
}

.check-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #67c23a;
  font-size: 18px;
}

.selection-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px;
  font-size: 14px;
}

.selection-count {
  font-weight: 500;
  color: #606266;
}

@media (max-width: 768px) {
  .focus-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
