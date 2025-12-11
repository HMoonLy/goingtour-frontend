<template>
  <el-card class="section" shadow="never">
    <template #header>
      <div class="section-header">
        <el-icon><MapLocation /></el-icon>
        <div>
          <div class="section-title">出行方式偏好</div>
          <div class="section-desc">影响行程安排和路线规划的交通建议</div>
        </div>
      </div>
    </template>

    <div class="form-item">
      <div class="item-label">
        <span>选择您偏好的交通方式</span>
        <!-- 不限制数量，或者限制全选 -->
      </div>
      <div class="item-help">
        我们会优先推荐您喜欢的交通方式，并在行程中合理安排换乘和路线
      </div>

      <div class="transport-grid">
          <div
            v-for="transport in transportPreferenceOptions"
            :key="transport.value"
          class="transport-item"
            :class="{
            selected: modelValue.includes(transport.value),
            }"
            @click="toggleTransport(transport.value)"
          >
          <span class="transport-icon">{{ transport.icon }}</span>
          <div class="transport-info">
            <span class="transport-name">{{ transport.name }}</span>
            <span class="transport-desc">{{ transport.description }}</span>
          </div>
          <el-icon
            v-if="modelValue.includes(transport.value)"
            class="check-icon"
          >
            <Check />
          </el-icon>
          </div>
        </div>

      <div class="selection-status">
        <span class="count">已选择 {{ modelValue.length }} 种交通方式</span>
        <span v-if="modelValue.length === 0" class="hint"
          >请至少选择1种交通方式</span
        >
      </div>
    </div>
  </el-card>
</template>

<script>
import { computed } from "vue";
import { MapLocation, Check } from "@element-plus/icons-vue";
import { PERSONAL_PROFILE_OPTIONS } from "@/utils/data/travelDataSystem.js";

export default {
  name: "TransportSection",
  components: { MapLocation, Check },
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const transportPreferenceOptions = computed(() => {
      return Object.entries(
        PERSONAL_PROFILE_OPTIONS.transportPreferences.options
      ).map(([key, value]) => ({
        value: key,
        ...value,
      }));
    });

    const toggleTransport = (transport) => {
      const newValue = [...props.modelValue];
      const index = newValue.indexOf(transport);
      if (index > -1) {
        newValue.splice(index, 1);
      } else {
        newValue.push(transport);
      }
      emit("update:modelValue", newValue);
    };

    return {
      transportPreferenceOptions,
      toggleTransport,
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

.item-help {
  color: #909399;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
}

.transport-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.transport-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.transport-item:hover {
  border-color: #91a8d0;
  background: #f5f7fa;
}

.transport-item.selected {
  border-color: #91a8d0;
  background: rgba(145, 168, 208, 0.1);
}

.transport-icon {
  font-size: 20px;
  width: 32px;
  text-align: center;
}

.transport-info {
  flex: 1;
}

.transport-name {
  display: block;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.transport-desc {
  color: #909399;
  font-size: 13px;
}

.check-icon {
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
  .transport-grid {
    flex-direction: column;
  }
}
</style>
