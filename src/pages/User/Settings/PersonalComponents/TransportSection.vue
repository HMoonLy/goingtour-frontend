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
      <div class="item-label">选择您偏好的交通方式</div>
      <div class="item-help">
        我们会优先推荐您喜欢的交通方式，并在行程中合理安排换乘和路线
      </div>

      <!-- 紧凑标签式 -->
      <div class="transport-compact-wrapper">
        <div class="compact-grid">
          <div
            v-for="transport in transportPreferenceOptions"
            :key="transport.value"
            class="compact-item"
            :class="{
              selected: modelValue.includes(
                transport.value
              ),
            }"
            @click="toggleTransport(transport.value)"
          >
            <span class="compact-icon">{{ transport.icon }}</span>
            <span class="compact-name">{{ transport.name }}</span>
          </div>
        </div>

        <!-- 紧凑模式的详情展示 -->
        <div
          v-if="selectedTransportDetails.length > 0"
          class="compact-details"
        >
          <div class="compact-details-title">已选择：</div>
          <div class="compact-details-content">
            <div
              v-for="item in selectedTransportDetails"
              :key="item.value"
              class="compact-detail-item"
            >
              <strong>{{ item.icon }} {{ item.name }}</strong
              >：{{ item.benefit }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { computed } from "vue";
import { MapLocation } from "@element-plus/icons-vue";
import { PERSONAL_PROFILE_OPTIONS } from "@/utils/data/travelDataSystem.js";

export default {
  name: "TransportSection",
  components: { MapLocation },
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

    const selectedTransportDetails = computed(() => {
      return transportPreferenceOptions.value.filter((transport) =>
        props.modelValue.includes(transport.value)
      );
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
      selectedTransportDetails,
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

.transport-compact-wrapper {
  margin-top: 12px;
}

.compact-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}

.compact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px solid #e8f0fe;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  position: relative;
  min-width: 140px;
}

.compact-item:hover {
  border-color: #91a8d0;
  box-shadow: 0 2px 8px rgba(145, 168, 208, 0.15);
}

.compact-item.selected {
  border-color: #1976d2;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1976d2;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.25);
  transform: translateY(-1px);
  position: relative;
}

.compact-item.selected::before {
  content: "";
  position: absolute;
  top: -2px;
  right: -2px;
  bottom: -2px;
  left: -2px;
  background: linear-gradient(45deg, #1976d2, #42a5f5);
  border-radius: inherit;
  z-index: -1;
  opacity: 0.6;
}

.compact-item.selected .compact-icon {
  text-shadow: 0 1px 3px rgba(25, 118, 210, 0.3);
  transform: scale(1.1);
}

.compact-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.compact-name {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.compact-details {
  margin-top: 16px;
  padding: 16px;
  background: #f8faff;
  border: 1px solid #e3f2fd;
  border-radius: 8px;
}

.compact-details-title {
  font-size: 14px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 12px;
}

.compact-details-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.compact-detail-item {
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .compact-grid {
    gap: 8px;
  }
  
  .compact-item {
    padding: 10px 12px;
    min-width: 120px;
  }
  
  .compact-icon {
    font-size: 18px;
  }
  
  .compact-name {
    font-size: 13px;
  }
}
</style>

