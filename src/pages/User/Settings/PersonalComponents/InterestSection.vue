<template>
  <el-card class="section" shadow="never">
    <template #header>
      <div class="section-header">
        <el-icon><Collection /></el-icon>
        <div>
          <div class="section-title">核心兴趣爱好</div>
          <div class="section-desc">影响景点推荐、活动安排和路线规划</div>
        </div>
      </div>
    </template>

    <div class="form-item">
      <div class="item-label">
        <span>选择您最感兴趣的领域</span>
        <span class="limit-tag">最多5个</span>
      </div>
      <div class="item-help">
        这些兴趣将直接影响我们为您推荐的景点类型。例如：选择"历史文化"会优先推荐博物馆、古迹等
      </div>

      <div class="interests-grid">
        <div
          v-for="interest in coreInterestOptions"
          :key="interest.value"
          class="interest-item"
          :class="{
            selected: modelValue.includes(interest.value),
            disabled:
              !modelValue.includes(interest.value) &&
              modelValue.length >= 5,
          }"
          @click="toggleInterest(interest.value)"
        >
          <span class="interest-icon">{{ interest.icon }}</span>
          <div class="interest-info">
            <span class="interest-name">{{ interest.name }}</span>
            <span class="interest-desc">{{ interest.description }}</span>
          </div>
          <el-icon
            v-if="modelValue.includes(interest.value)"
            class="check-icon"
          >
            <Check />
          </el-icon>
        </div>
      </div>

      <div class="selection-status">
        <span class="count"
          >已选择 {{ modelValue.length }}/5 个兴趣</span
        >
        <span v-if="modelValue.length < 3" class="hint"
          >建议至少选择3个以获得更好的推荐效果</span
        >
      </div>
    </div>
  </el-card>
</template>

<script>
import { computed } from "vue";
import { Collection, Check } from "@element-plus/icons-vue";
import { PERSONAL_PROFILE_OPTIONS } from "@/utils/data/travelDataSystem.js";

export default {
  name: "InterestSection",
  components: { Collection, Check },
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const coreInterestOptions = computed(() =>
      Object.entries(PERSONAL_PROFILE_OPTIONS.coreInterests.options).map(
        ([key, value]) => ({
          value: key,
          ...value,
        })
      )
    );

    const toggleInterest = (interest) => {
      const newValue = [...props.modelValue];
      const index = newValue.indexOf(interest);
      if (index > -1) {
        newValue.splice(index, 1);
      } else if (newValue.length < 5) {
        newValue.push(interest);
      }
      emit("update:modelValue", newValue);
    };

    return {
      coreInterestOptions,
      toggleInterest,
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

.form-item {
  padding: 20px;
}

.item-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #303133;
}

.limit-tag {
  background: #fdf6ec;
  color: #e6a23c;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.item-help {
  color: #909399;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
}

.interests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.interest-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative; /* 为绝对定位的check-icon做准备 */
}

.interest-item:hover {
  border-color: #91a8d0;
  background: #f5f7fa;
}

.interest-item.selected {
  border-color: #91a8d0;
  background: rgba(145, 168, 208, 0.1);
}

.interest-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.interest-icon {
  font-size: 20px;
  width: 32px;
  text-align: center;
}

.interest-info {
  flex: 1;
}

.interest-name {
  display: block;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.interest-desc {
  color: #909399;
  font-size: 13px;
}

.check-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #67c23a;
  font-size: 16px;
}

.selection-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px;
  font-size: 14px;
}

.count {
  color: #606266;
  font-weight: 500;
}

.hint {
  color: #e6a23c;
}

@media (max-width: 768px) {
  .interests-grid {
    flex-direction: column;
  }
}
</style>
