<template>
  <el-card class="trip-header-card" shadow="never">
    <div class="trip-header-content">
      <div class="trip-title-section">
        <div class="title-with-icon">
          <el-icon class="ai-icon" color="#409eff">
            <Cpu />
          </el-icon>
          <h1 class="trip-main-title">
            {{ (tripData?.destinationInfo?.name || "") + "智能行程推荐" }}
          </h1>
        </div>
        <p v-if="tripData?.destinationInfo" class="trip-subtitle">
          {{
            `为您推荐${tripData?.tripBasicInfo?.days || 3}天${
              tripData?.destinationInfo?.name || "目的地"
            }的精彩行程`
          }}
        </p>
      </div>

      <!-- 快速统计信息 -->
      <div class="trip-stats">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon color="#409eff">
              <Calendar />
            </el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">
              {{ tripData?.tripBasicInfo?.days || 0 }}
            </div>
            <div class="stat-label">天数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon color="#67c23a">
              <User />
            </el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">
              {{ tripData?.tripBasicInfo?.travelers || 0 }}
            </div>
            <div class="stat-label">出行人数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon color="#e6a23c">
              <Trophy />
            </el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">
              {{ tripData?.qualityScore || 0 }}
            </div>
            <div class="stat-label">质量评分</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon color="#f56c6c">
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
  </el-card>
</template>

<script setup>
import { Cpu, Calendar, User, Trophy, Timer } from "@element-plus/icons-vue";

defineProps({
  tripData: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

const formatProcessingTime = (time) => {
  if (!time) return "0s";
  return time < 1000 ? `${time}ms` : `${Math.round(time / 1000)}s`;
};
</script>

<style scoped>
.trip-header-card {
  margin-bottom: 24px;
  border-radius: 12px;
  border: none;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.trip-header-card :deep(.el-card__body) {
  padding: 32px;
  background: transparent;
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
  color: #667eea;
}

.trip-main-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
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
  border-color: #667eea;
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
  color: #667eea;
  border: 1px solid #e2e8f0;
}

.stat-content {
  flex: 1;
  text-align: left;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #718096;
  margin-top: 4px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .trip-header-card :deep(.el-card__body) {
    padding: 24px;
  }

  .trip-main-title {
    font-size: 26px;
  }

  .trip-subtitle {
    font-size: 16px;
  }

  .trip-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .stat-card {
    padding: 20px;
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .stat-content {
    text-align: center;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .trip-stats {
    grid-template-columns: 1fr;
  }
}
</style>

