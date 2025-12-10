<template>
  <div class="preference-section purpose-section">
    <div class="section-header">
      <div class="section-info">
        <h3 class="section-title">🎯 这次旅行的主要目的</h3>
        <p class="section-desc">
          告诉我们这次旅行的特殊意义，我们会相应调整推荐风格
        </p>
      </div>
    </div>

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
            🤖
            <span>{{ purpose.aiStrategy }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Flag } from "@element-plus/icons-vue";

export default {
  name: "PreferenceTripPurpose",
  components: {
    Flag,
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
.preference-section {
  background: white;
  padding: 24px;
  box-shadow: none;
  border: 1px solid #e4e7ed;
  border-radius: 16px;
}


.section-header {
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

/* 旅行目的卡片 */
.purpose-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.purpose-card {
  padding: 24px;
  border: 2px solid #e4e7ed;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.purpose-card:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.purpose-card.selected {
  border-color: #91a8d0;
  background: linear-gradient(
    135deg,
    rgba(145, 168, 208, 0.1) 0%,
    #ffffff 100%
  );
}

.purpose-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.purpose-icon {
  font-size: 24px;
}

.purpose-name {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.purpose-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

.purpose-ai-strategy {
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

  .purpose-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>

