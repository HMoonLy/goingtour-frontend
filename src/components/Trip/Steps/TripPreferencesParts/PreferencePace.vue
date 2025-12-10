<template>
  <div class="preference-section pace-section">
    <div class="section-header">
      <div class="section-info">
        <h3 class="section-title">⏰ 这次想要什么样的节奏？</h3>
        <p class="section-desc">
          根据您的时间和体力情况选择合适的行程节奏
          <span v-if="recommendedValue" class="smart-tip">
            <el-icon><MagicStick /></el-icon>
            基于您的性格，推荐：{{ getDisplayName(recommendedValue) }}
          </span>
        </p>
      </div>
    </div>

    <div class="pace-content">
      <div class="pace-cards">
        <div
          v-for="pace in options"
          :key="pace.value"
          class="pace-card"
          :class="{
            selected: modelValue === pace.value,
            recommended: recommendedValue === pace.value,
          }"
          @click="$emit('update:modelValue', pace.value)"
        >
          <div class="pace-visual">
            <span class="pace-icon">{{ pace.icon }}</span>
            <span class="pace-name">{{ pace.name }}</span>
          </div>
          <p class="pace-desc">{{ pace.description }}</p>
          <div class="pace-strategy">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ pace.aiStrategy }}</span>
          </div>

          <!-- 推荐标记 -->
          <div
            v-if="recommendedValue === pace.value"
            class="pace-recommended"
          >
            <el-icon><Star /></el-icon>
            <span>推荐</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Timer, MagicStick, InfoFilled, Star } from "@element-plus/icons-vue";

export default {
  name: "PreferencePace",
  components: {
    Timer,
    MagicStick,
    InfoFilled,
    Star,
  },
  props: {
    modelValue: {
      type: String,
      default: "balanced",
    },
    options: {
      type: Array,
      default: () => [],
    },
    recommendedValue: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
  setup(props) {
    const getDisplayName = (pace) => {
      const option = props.options.find((opt) => opt.value === pace);
      return option ? option.name : pace;
    };
    return { getDisplayName };
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

/* 节奏卡片 */
.pace-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.pace-card {
  position: relative;
  padding: 24px;
  border: 2px solid #e4e7ed;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.pace-card:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.pace-card.selected {
  border-color: #91a8d0;
  background: linear-gradient(
    135deg,
    rgba(145, 168, 208, 0.1) 0%,
    #ffffff 100%
  );
}

.pace-card.recommended {
  border-color: #f7cac9;
  background: linear-gradient(
    135deg,
    rgba(247, 202, 201, 0.1) 0%,
    #ffffff 100%
  );
}

.pace-visual {
  margin-bottom: 16px;
}

.pace-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.pace-name {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.pace-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: #606266;
}

.pace-strategy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: #909399;
  font-style: italic;
}

.pace-recommended {
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

  .pace-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>

