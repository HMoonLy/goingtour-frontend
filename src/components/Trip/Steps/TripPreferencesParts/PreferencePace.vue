<template>
  <el-card class="section" shadow="never">
    <template #header>
      <div class="section-header">
        <el-icon><Timer /></el-icon>
        <div>
          <div class="section-title">这次想要什么样的节奏？</div>
          <div class="section-desc">
            根据您的时间和体力情况选择合适的行程节奏
            <span v-if="recommendedValue" class="smart-tip">
              <el-icon><MagicStick /></el-icon>
              基于您的性格推荐：{{ getDisplayName(recommendedValue) }}
            </span>
          </div>
        </div>
      </div>
    </template>

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

          <!-- 推荐标记 (选中时隐藏) -->
          <div
            v-if="recommendedValue === pace.value && modelValue !== pace.value"
            class="recommended-badge"
          >
            <el-icon><Star /></el-icon>
            <span>推荐</span>
          </div>
          
          <el-icon
            v-if="modelValue === pace.value"
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
import { Timer, MagicStick, InfoFilled, Star, Check } from "@element-plus/icons-vue";

export default {
  name: "PreferencePace",
  components: {
    Timer,
    MagicStick,
    InfoFilled,
    Star,
    Check
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

.pace-content {
  padding: 20px;
}

.pace-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.pace-card {
  position: relative;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.pace-card:hover {
  border-color: #91a8d0;
  background: #f5f7fa;
}

.pace-card.selected {
  border-color: #91a8d0;
  background: rgba(145, 168, 208, 0.1);
}

.pace-card.recommended {
  border-color: #f7cac9;
}

.pace-visual {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.pace-icon {
  font-size: 28px;
}

.pace-name {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.pace-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
}

.pace-strategy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
  font-style: italic;
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

@media (max-width: 768px) {
  .pace-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
