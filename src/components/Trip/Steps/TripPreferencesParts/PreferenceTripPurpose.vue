<template>
  <el-card class="section">
    <template #header>
      <div class="section-header">
        <el-icon><Flag /></el-icon>
        <div>
          <div class="section-title">这次旅行的主要目的</div>
          <div class="section-desc">
            告诉我们这次旅行的特殊意义，我们会相应调整推荐风格
          </div>
        </div>
      </div>
    </template>

    <div class="purpose-content">
      <div class="purpose-cards">
        <div
          v-for="purpose in options"
          :key="purpose.value"
          class="purpose-card"
          :class="{
            selected: modelValue === purpose.value,
          }"
          @click="$emit('update:modelValue', purpose.value)"
        >
          <div class="purpose-header">
            <span class="purpose-icon">{{ purpose.icon }}</span>
            <span class="purpose-name">{{ purpose.name }}</span>
          </div>
          <p class="purpose-desc">{{ purpose.description }}</p>
          <div class="purpose-ai-strategy">
            <el-icon><MagicStick /></el-icon>
            <span>{{ purpose.aiStrategy }}</span>
          </div>
          <el-icon
            v-if="modelValue === purpose.value"
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
import { Flag, MagicStick, Check } from "@element-plus/icons-vue";

export default {
  name: "PreferenceTripPurpose",
  components: {
    Flag,
    MagicStick,
    Check,
  },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    options: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:modelValue"],
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

/* 旅行目的卡片 */
.purpose-content {
  padding: 20px;
}

.purpose-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.purpose-card {
  position: relative;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.purpose-card:hover {
  border-color: #91a8d0;
  background: #f5f7fa;
}

.purpose-card.selected {
  border-color: #91a8d0;
  background: rgba(145, 168, 208, 0.1);
}

.purpose-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.purpose-icon {
  font-size: 24px;
  width: 32px;
  text-align: center;
}

.purpose-name {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.purpose-desc {
  margin: 0 0 12px;
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
  flex: 1;
}

.purpose-ai-strategy {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
  font-style: italic;
  margin-top: auto;
}

.check-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #67c23a;
  font-size: 18px;
}

@media (max-width: 768px) {
  .purpose-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
