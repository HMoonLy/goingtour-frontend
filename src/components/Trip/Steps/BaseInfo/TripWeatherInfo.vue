<template>
  <div
    v-if="visible"
    class="form-section weather-section"
    :class="{
      'weather-disabled': isDisabled,
      'weather-outdated': isOutdated,
    }"
  >
    <div class="section-title">
      <el-icon><Sunny /></el-icon>
      <span>天气预报</span>
      <el-tag
        v-if="suggestion"
        type="info"
        size="small"
        effect="plain"
        class="weather-source-tag"
      >
        {{ getWeatherSourceText() }}
      </el-tag>
    </div>

    <!-- 天气加载状态 -->
    <div v-if="loading" class="weather-loading">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span>正在获取天气信息...</span>
    </div>

    <!-- 天气错误状态 -->
    <div v-else-if="error" class="weather-error">
      <el-icon><Warning /></el-icon>
      <span>{{ error }}</span>
    </div>

    <!-- 天气信息显示 -->
    <div v-else-if="suggestion" class="weather-content">
      <!-- 失效提示 -->
      <div v-if="isDisabled" class="weather-disabled-notice">
        <el-icon><InfoFilled /></el-icon>
        <span v-if="isOutOfRange">
          所选日期超出天气预报范围（{{ formatDateRange }}）
        </span>
        <span v-else-if="isOutdated">
          行程天数（{{ days }}天）超出预报范围（{{
            suggestion?.forecast?.length || 0
          }}天）
        </span>
      </div>

      <!-- 天气预报网格 -->
      <div
        v-if="suggestion?.forecast && suggestion.forecast.length > 0"
        class="weather-forecast-grid"
      >
        <div
          v-for="(forecast, index) in suggestion?.forecast || []"
          :key="index"
          class="forecast-card"
          :class="{ today: index === 0 }"
        >
          <div class="forecast-date">
            <div class="date-text">
              {{ forecast.date }}
            </div>
            <div class="week-text">周{{ forecast.week }}</div>
          </div>

          <div class="forecast-weather">
            <div class="weather-icon-large">
              {{ getWeatherEmoji(forecast.dayWeather) }}
            </div>
            <div class="weather-desc">
              {{ forecast.dayWeather }}
            </div>
          </div>

          <div class="forecast-temp">
            <div class="temp-high">{{ forecast.dayTemp }}°</div>
            <div class="temp-low">{{ forecast.nightTemp }}°</div>
          </div>

          <div class="forecast-wind">
            <div class="wind-info">
              {{ forecast.dayWind }} {{ forecast.dayPower }}级
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 天气综合信息 -->
    <div v-if="!loading && !error && suggestion" class="weather-summary">
      <div class="summary-item">
        <span class="summary-label">温度范围</span>
        <span class="summary-value">{{ suggestion?.tempRange || '暂无数据' }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">预报天数</span>
        <span class="summary-value">{{ suggestion?.forecast?.length || 0 }}天</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">数据来源</span>
        <span class="summary-value">{{ getWeatherSourceText() }}</span>
      </div>
    </div>

    <!-- 出行建议 -->
    <div v-if="!loading && !error && tips.length > 0" class="weather-tips">
      <div class="tips-header">
        <el-icon><InfoFilled /></el-icon>
        <span class="tips-title">出行建议</span>
      </div>
      <div class="tips-content">
        {{ tips.slice(0, 2).join("；") }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Sunny, Loading, Warning, InfoFilled } from '@element-plus/icons-vue';

const props = defineProps({
  visible: Boolean,
  loading: Boolean,
  error: String,
  suggestion: Object,
  days: Number,
  isDisabled: Boolean,
  isOutdated: Boolean,
  isOutOfRange: Boolean,
  formatDateRange: String
});

const tips = computed(() => props.suggestion?.tips || []);

// 工具函数
const getWeatherEmoji = (weather) => {
  if (!weather) return "⛅";
  if (weather.includes("晴")) return "☀️";
  if (weather.includes("云") || weather.includes("阴")) return "☁️";
  if (weather.includes("雨")) return "🌧️";
  if (weather.includes("雪")) return "❄️";
  if (weather.includes("雷")) return "⛈️";
  if (weather.includes("雾") || weather.includes("霾")) return "🌫️";
  return "⛅";
};


const getWeatherSourceText = () => {
  if (!props.suggestion) return "";
  return props.suggestion.source === 'realtime' ? '实时预报' : '历史平均';
};
</script>

<style scoped>
.form-section {
  padding: 24px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 16px;
  box-shadow: none;
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
  padding-bottom: 0;
  border-bottom: none;
}

.section-title .el-icon {
  width: 48px;
  height: 48px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 12px;
  padding: 0;
  flex-shrink: 0;
}

.weather-section {
  background: linear-gradient(180deg, #fdfeff 0%, #ffffff 100%);
}

.weather-loading, .weather-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #909399;
  gap: 12px;
}

.weather-error {
  color: #f56c6c;
}

.weather-loading .el-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.weather-source-tag {
  margin-left: auto;
}

.weather-disabled-notice {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
  padding: 10px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  margin-bottom: 16px;
  border: 1px solid var(--el-color-warning-light-8);
}

/* 天气预报网格样式 */
.weather-forecast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin: 16px 0;
  transition: all 0.3s ease;
}

.forecast-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
}

.forecast-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}

.forecast-card.today {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
}

.forecast-card.today::before {
  content: "今日";
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--el-color-primary);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
}

.forecast-date {
  margin-bottom: 12px;
}

.date-text {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
}

.week-text {
  font-size: 11px;
  color: #909399;
}

.forecast-weather {
  margin-bottom: 12px;
}

.weather-icon-large {
  font-size: 32px;
  margin-bottom: 6px;
  line-height: 1;
}

.weather-desc {
  font-size: 12px;
  color: #606266;
  line-height: 1.2;
}

.forecast-temp {
  margin-bottom: 8px;
}

.temp-high {
  font-size: 16px;
  font-weight: 700;
  color: var(--el-color-warning);
  margin-bottom: 2px;
}

.temp-low {
  font-size: 12px;
  color: #909399;
}

.forecast-wind {
  margin-top: auto;
}

.wind-info {
  font-size: 11px;
  color: #909399;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-block;
}

.weather-summary {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px;
  margin: 16px 0;
  transition: all 0.3s ease;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.summary-label {
  font-size: 11px;
  color: #909399;
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.weather-tips {
  margin-top: 16px;
  background: var(--el-color-primary-light-9);
  border-radius: 8px;
  padding: 12px 16px;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--el-color-primary);
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
}

.tips-content {
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
  padding-left: 20px;
}

@media (max-width: 768px) {
  .form-section {
    padding: 16px;
  }
  
  .weather-forecast-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .weather-summary {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .weather-forecast-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>

