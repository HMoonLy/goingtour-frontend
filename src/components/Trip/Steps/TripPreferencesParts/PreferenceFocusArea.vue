<template>
  <div class="preference-section focus-section">
    <div class="section-header">
      <el-icon class="section-icon">
        <Star />
      </el-icon>
      <div class="section-info">
        <h3 class="section-title">这次最想体验什么？</h3>
        <p class="section-desc">
          选择这次旅行您最期待的体验类型（最多3个）
          <span v-if="recommendedOptions.length > 0" class="smart-tip">
            <el-icon><Star /></el-icon>
            基于您的兴趣，推荐了 {{ recommendedOptions.length }} 项
          </span>
        </p>
      </div>
    </div>

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

          <!-- 推荐标记 -->
          <div
            v-if="recommendedOptions.includes(focus.value)"
            class="recommended-badge"
          >
            <el-icon><Star /></el-icon>
            <span>推荐</span>
          </div>

          <!-- 选中标记 -->
          <div
            v-if="modelValue.includes(focus.value)"
            class="selected-badge"
          >
            <el-icon><Check /></el-icon>
          </div>
        </div>
      </div>

      <div class="selection-info">
        <span class="selection-count"
          >已选择 {{ modelValue.length }}/3</span
        >
        <el-button
          v-if="modelValue.length > 0"
          link
          size="small"
          @click="clearFocusAreas"
        >
          清空选择
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { Star, Check } from "@element-plus/icons-vue";

export default {
  name: "PreferenceFocusArea",
  components: {
    Star,
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
.preference-section {
  background: white;
  padding: 24px;
  box-shadow: none;
  border: 1px solid #e4e7ed;
  border-radius: 16px;
}


.section-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 32px;
}

.section-icon {
  width: 48px;
  height: 48px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 关键点：用极淡的背景色代替边框 */
  background: var(--el-color-primary-light-9); 
  color: var(--el-color-primary);
  border-radius: 12px;
  /* 去掉边框 */
  border: none; 
  flex-shrink: 0;
}
.section-info {
  flex: 1;
}

.section-title {
  margin: 0 0 8px;
  font-weight: 600;
  font-size: 24px;
  color: #303133;
}

.section-desc {
  margin: 0;
  font-size: 16px;
  color: #606266;
  line-height: 1.5;
}

.smart-tip {
  background: rgba(145, 168, 208, 0.1);
  color: #91a8d0;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* 体验重点网格 */
.focus-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.focus-item {
  position: relative;
  padding: 20px;
  border: 2px solid #e4e7ed;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.focus-item:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.focus-item.selected {
  border-color: #91a8d0;
  background: linear-gradient(
    135deg,
    rgba(145, 168, 208, 0.1) 0%,
    #ffffff 100%
  );
}

.focus-item.recommended {
  border-color: #f7cac9;
  background: linear-gradient(
    135deg,
    rgba(247, 202, 201, 0.1) 0%,
    #ffffff 100%
  );
}

.focus-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.focus-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.focus-icon {
  font-size: 20px;
}

.focus-name {
  font-weight: 600;
  color: #303133;
}

.focus-desc {
  margin: 0;
  font-size: 13px;
  color: #606266;
}

.recommended-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #f7cac9;
  color: #2c3e50;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 2px;
}

.selected-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  color: #67c23a;
  font-size: 18px;
}

.selection-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  font-size: 14px;
}

.selection-count {
  font-weight: 600;
  color: #303133;
}

@media (max-width: 768px) {
  .preference-section {
    padding: 24px 20px;
  }

  .section-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
  }

  .focus-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>

