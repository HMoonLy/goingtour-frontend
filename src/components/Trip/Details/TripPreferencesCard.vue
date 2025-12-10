<template>
  <el-card class="preferences-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <h3>
          <el-icon><Setting /></el-icon>
          行程偏好
        </h3>
      </div>
    </template>

    <div class="preferences-content">
      <div class="preference-group">
        <h4>行程强度</h4>
        <el-tag>
          {{ getIntensityText(preferences?.intensity) }}
        </el-tag>
      </div>

      <div
        v-if="preferences?.experiences?.length > 0"
        class="preference-group"
      >
        <h4>特殊体验</h4>
        <div class="tags-row">
          <el-tag
            v-for="exp in preferences.experiences"
            :key="exp"
            effect="plain"
          >
            {{ getExperienceText(exp) }}
          </el-tag>
        </div>
      </div>

      <div v-if="preferences?.transport?.length > 0" class="preference-group">
        <h4>交通偏好</h4>
        <div class="tags-row">
          <el-tag
            v-for="transport in preferences.transport"
            :key="transport"
            effect="plain"
          >
            {{ getTransportText(transport) }}
          </el-tag>
        </div>
      </div>

      <div v-if="preferences?.specialRequests" class="preference-group">
        <h4>特殊需求</h4>
        <p class="special-requests">
          {{ preferences.specialRequests }}
        </p>
      </div>
    </div>
  </el-card>
</template>

<script>
import { Setting } from "@element-plus/icons-vue";
import { translateTag } from "@/utils/data/travelDataSystem.js";

export default {
  name: "TripPreferencesCard",
  components: {
    Setting,
  },
  props: {
    preferences: {
      type: Object,
      default: () => ({}),
    },
  },
  setup() {
    const getIntensityText = (intensity) => {
      if (!intensity) return "未设置";
      // 兼容旧数据映射
      const map = {
        relaxed: "slow",
        moderate: "balanced",
        fast: "intensive",
      };
      const key = map[intensity] || intensity;
      return translateTag(key, "pacePreference");
    };

    const getExperienceText = (experience) => {
      // 尝试直接翻译
      return translateTag(experience, "focusAreas");
    };

    const getTransportText = (transport) => {
      // 尝试直接翻译
      return translateTag(transport, "transportPreferences");
    };

    return {
      getIntensityText,
      getExperienceText,
      getTransportText,
    };
  },
};
</script>

<style scoped>
/* 偏好设置卡片 */
.preferences-card {
  margin-bottom: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.preferences-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #91a8d0, #f7cac9);
  color: white;
  border-bottom: none;
}

.preferences-card :deep(.el-card__header) h3 {
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.preferences-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preference-group h4 {
  font-size: 14px;
  color: #4a5568;
  margin: 0 0 8px 0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.special-requests {
  font-size: 14px;
  line-height: 1.6;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  color: #4a5568;
  margin: 0;
}

@media (max-width: 480px) {
  .preferences-content {
    padding: 16px;
  }
}
</style>

