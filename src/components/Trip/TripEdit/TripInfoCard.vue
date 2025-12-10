<template>
  <div class="trip-header-card-custom">
    <div class="trip-header-content">
      <div class="trip-title-section">
        <div class="title-with-icon">
          <el-icon class="ai-icon" color="#91A8D0">
            <Cpu />
          </el-icon>
          <h1 v-if="isReadOnly" class="trip-main-title">
            {{ tripData.title }}
          </h1>
          <el-input
            v-else
            v-model="editedTrip.title"
            class="trip-title-input"
            placeholder="请输入行程标题"
            maxlength="100"
            show-word-limit
          />
        </div>
        <p class="trip-subtitle">
          AI {{ editedTrip?.days || tripData.days || 3 }}
          {{ tripData?.destinationInfo?.name || tripData.city || "" }}
        </p>
      </div>
      <div class="trip-stats">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon color="#91A8D0">
              <Calendar />
            </el-icon>
          </div>
          <div class="stat-content">
            <div v-if="isReadOnly" class="stat-number">
              {{ editedTrip?.days || tripData.days || 0 }}
            </div>
            <el-input-number
              v-else
              v-model="editedTrip.days"
              :min="1"
              :max="30"
              controls-position="right"
              class="stat-input"
            />
            <div class="stat-label">天数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon color="#91A8D0">
              <User />
            </el-icon>
          </div>
          <div class="stat-content">
            <div v-if="isReadOnly" class="stat-number">
              {{ editedTrip?.mate || tripData.mate || 0 }}
            </div>
            <el-input-number
              v-else
              v-model="editedTrip.mate"
              :min="1"
              :max="20"
              controls-position="right"
              class="stat-input"
            />
            <div class="stat-label">人数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon color="#7CB342">
              <Trophy />
            </el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">
              {{ tripData?.qualityScore || 0 }}
            </div>
            <div class="stat-label">质量分</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon color="#96ACD2">
              <Timer />
            </el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">
              {{ formatProcessingTime(tripData?.processingTime) }}
            </div>
            <div class="stat-label">用时</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Cpu, Calendar, User, Trophy, Timer } from "@element-plus/icons-vue";

const props = defineProps({
  isReadOnly: Boolean,
  tripData: {
    type: Object,
    default: () => ({}),
  },
  editedTrip: {
    type: Object,
    default: () => ({}),
  },
});

const formatProcessingTime = (time) => {
  if (!time) return "0s";
  return time < 1000 ? `${time}ms` : `${Math.round(time / 1000)}s`;
};
</script>

<style scoped>
.trip-header-card-custom {
  margin: 0 auto 24px auto !important;
  border-radius: 12px !important;
  border: 1px solid #e2e8f0 !important;
  background: white !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06) !important;
  padding: 24px !important;
  overflow: visible !important;
  width: 100% !important;
  max-width: 1200px !important;
}

.trip-header-content {
  text-align: center;
}

.title-with-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.ai-icon {
  font-size: 32px;
  color: #91a8d0;
}

.trip-main-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.trip-title-input {
  max-width: 400px;
  margin: 0 auto;
}

.trip-title-input :deep(.el-input__inner) {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  color: #2d3748;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
}

.trip-subtitle {
  font-size: 16px;
  color: #718096;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.trip-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #91a8d0;
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  border-radius: 8px;
  font-size: 24px;
  color: #91a8d0;
  border: 1px solid #e2e8f0;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  line-height: 1;
}

.stat-input {
  width: 100%;
}

.stat-input :deep(.el-input-number__input) {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #718096;
  margin-top: 4px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .trip-header-card-custom {
    margin: 0 auto 16px auto !important;
    padding: 16px !important;
  }
  .trip-main-title {
    font-size: 24px;
  }
  .trip-subtitle {
    font-size: 14px;
  }
  .trip-stats {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 12px !important;
  }
  .stat-card {
    padding: 12px !important;
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}
@media (max-width: 480px) {
  .trip-stats {
    grid-template-columns: 1fr;
  }
}
</style>

