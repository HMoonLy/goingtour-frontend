<template>
  <div class="preference-section needs-section">
    <div class="section-header">
      <div class="section-info">
        <h3 class="section-title">⚠️ 这次旅行的特殊情况</h3>
        <p class="section-desc">选择这次旅行需要特别考虑的因素（可多选）</p>
      </div>
    </div>

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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Warning, InfoFilled } from "@element-plus/icons-vue";

export default {
  name: "PreferenceTemporaryNeeds",
  components: {
    Warning,
    InfoFilled,
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

/* 特殊需求网格 */
.needs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.need-item {
  padding: 24px;
  border: 2px solid #e4e7ed;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.need-item:hover {
  border-color: #e53935;
  box-shadow: 0 4px 12px rgba(229, 57, 53, 0.15);
  transform: translateY(-2px);
}

.need-item.selected {
  border-color: #e53935;
  background: linear-gradient(135deg, rgba(229, 57, 53, 0.05) 0%, #ffffff 100%);
}

.need-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
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
  margin: 0 0 16px;
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

.need-strategy {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #909399;
  font-style: italic;
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

  .needs-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>

