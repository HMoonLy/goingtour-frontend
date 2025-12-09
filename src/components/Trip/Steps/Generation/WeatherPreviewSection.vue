<template>
  <div v-if="weatherSuggestion" class="prompt-section">
    <div class="section-header">
      <el-icon><Sunny /></el-icon>
      <h4>天气建议</h4>
      <el-tag
        v-if="weatherSuggestion.isHistorical"
        size="small"
        type="info"
        effect="plain"
      >
        {{ weatherSuggestion.dataSource }}
      </el-tag>
      <el-tag v-else size="small" type="success" effect="plain">
        高德天气API
      </el-tag>
    </div>
    <div class="prompt-text">
      <!-- 日期在预报范围内的正常天气描述 -->
      <template v-if="isDateWithinForecastRange">
        <p>
          <template v-if="weatherSuggestion.isHistorical">
            基于历史气候数据，出行期间天气预计<span class="highlight">{{
              weatherSuggestion.weatherDesc
            }}</span
            >， 气温<span class="highlight">{{
              weatherSuggestion.tempRange
            }}</span
            >。
            <template v-if="weatherSuggestion.rainProbability">
              降雨概率约<span class="highlight">{{
                weatherSuggestion.rainProbability
              }}</span
              >。
            </template>
            <template v-if="weatherSuggestion.season">
              <span class="highlight">{{ weatherSuggestion.season }}</span
              >时节特点明显。
            </template>
          </template>
          <template v-else>
            根据高德天气API实时数据，出行期间天气预计<span class="highlight">{{
              weatherSuggestion.weatherDesc
            }}</span
            >， 气温<span class="highlight">{{
              weatherSuggestion.tempRange
            }}</span
            >。
            <template v-if="weatherSuggestion.humidity">
              湿度<span class="highlight">{{ weatherSuggestion.humidity }}</span
              >。
            </template>
            <template
              v-if="
                weatherSuggestion.windDirection && weatherSuggestion.windPower
              "
            >
              风向<span class="highlight"
                >{{ weatherSuggestion.windDirection
                }}{{ weatherSuggestion.windPower }}级</span
              >。
            </template>
          </template>
        </p>
      </template>

      <!-- 日期超出预报范围的说明 -->
      <template v-else>
        <div class="weather-limitation-notice">
          <template
            v-if="
              baseForm &&
              baseForm.days &&
              baseForm.days > (weatherSuggestion.forecast?.length || 0)
            "
          >
            <p class="notice-title">🌤️ 天气预报说明</p>
            <p>
              您的<span class="highlight">{{ baseForm.days }}天</span
              >行程中，我们仅能提供前<span class="highlight"
                >{{ weatherSuggestion.forecast?.length || 0 }}天</span
              >的准确天气预报。
            </p>
            <template
              v-if="
                weatherSuggestion.forecast &&
                weatherSuggestion.forecast.length > 0
              "
            >
              <p>
                已知的天气情况：<span class="highlight">{{
                  weatherSuggestion.weatherDesc
                }}</span
                >，气温<span class="highlight">{{
                  weatherSuggestion.tempRange
                }}</span
                >。
              </p>
            </template>
            <p class="notice-suggestion">
              超出预报范围的日期建议您关注当地实时天气预报，并准备适应性较强的衣物。
            </p>
          </template>
          <template v-else>
            <p class="notice-title">⚠️ 天气预报说明</p>
            <p>
              由于您选择的出行日期与当前天气预报时间范围不匹配，无法提供准确的天气预报。
            </p>
            <p class="notice-suggestion">
              建议您在出行前关注目的地的实时天气预报。
            </p>
          </template>
        </div>
      </template>
      <template
        v-if="
          isDateWithinForecastRange &&
          weatherSuggestion.activities &&
          weatherSuggestion.activities.length > 0
        "
      >
        <p>
          适合安排<span class="highlight">{{
            weatherSuggestion.activities.join("、")
          }}</span
          >等活动。
        </p>
      </template>
      <template
        v-if="
          weatherSuggestion.tips &&
          weatherSuggestion.tips.length > 0 &&
          isDateWithinForecastRange
        "
      >
        <p>
          建议：<span class="highlight">{{
            weatherSuggestion.tips.join("；")
          }}</span
          >。
        </p>
      </template>
      <template
        v-if="
          weatherSuggestion.avoid &&
          weatherSuggestion.avoid.length > 0 &&
          isDateWithinForecastRange
        "
      >
        <p>
          注意事项：<span class="highlight">{{
            weatherSuggestion.avoid.join("；")
          }}</span
          >。
        </p>
      </template>

      <!-- 天气预报详情展示 -->
      <template
        v-if="
          weatherSuggestion.forecast && weatherSuggestion.forecast.length > 0
        "
      >
        <div class="weather-forecast">
          <h5>
            <el-icon><Calendar /></el-icon>
            <template v-if="isDateWithinForecastRange">
              具体天气预报
            </template>
            <template
              v-else-if="
                baseForm &&
                baseForm.days &&
                weatherSuggestion.forecast &&
                baseForm.days > weatherSuggestion.forecast.length
              "
            >
              部分天气预报（前{{ weatherSuggestion.forecast.length }}天）
            </template>
            <template v-else>
              参考天气预报
            </template>
            <el-tag
              v-if="weatherSuggestion.isHistorical"
              size="small"
              type="info"
            >
              历史气候模拟
            </el-tag>
            <el-tag v-else size="small" type="success">
              高德API实时预报
            </el-tag>
            <el-tag
              v-if="!isDateWithinForecastRange"
              size="small"
              type="warning"
            >
              日期超出范围
            </el-tag>
          </h5>
          <div class="forecast-list">
            <div
              v-for="(day, index) in weatherSuggestion.forecast"
              :key="index"
              class="forecast-item"
              :class="{
                'forecast-outdated': !isDateWithinForecastRange,
              }"
            >
              <div class="forecast-date">
                {{ day.date }}
              </div>
              <div class="forecast-weather">
                <span class="day-weather">{{ day.dayWeather }}</span>
                <span
                  v-if="day.nightWeather && day.nightWeather !== day.dayWeather"
                  class="night-weather"
                >
                  / {{ day.nightWeather }}
                </span>
              </div>
              <div class="forecast-temp">
                {{ day.dayTemp }}℃/{{ day.nightTemp }}℃
              </div>
              <div v-if="day.dayWind || day.nightWind" class="forecast-wind">
                <template v-if="day.dayWind">
                  {{ day.dayWind }}{{ day.dayPower }}级
                </template>
                <template v-if="day.nightWind && day.nightWind !== day.dayWind">
                  / {{ day.nightWind }}{{ day.nightPower }}级
                </template>
              </div>
            </div>
          </div>
          <!-- 超出预报范围的提醒 -->
          <template
            v-if="
              !isDateWithinForecastRange &&
              baseForm &&
              baseForm.days &&
              weatherSuggestion.forecast &&
              baseForm.days > weatherSuggestion.forecast.length
            "
          >
            <div class="forecast-limitation-notice">
              <el-icon><Warning /></el-icon>
              <span>{{
                `第${
                  weatherSuggestion.forecast.length + 1
                }天及之后需要特别关注天气变化`
              }}</span>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>

  <!-- 天气加载状态 -->
  <div v-else-if="loadingWeather" class="prompt-section">
    <div class="section-header">
      <el-icon><Loading /></el-icon>
      <h4>天气建议</h4>
    </div>
    <div class="prompt-text loading-text">
      正在加载天气信息...
    </div>
  </div>

  <!-- 天气错误状态 -->
  <div v-else-if="weatherError" class="prompt-section">
    <div class="section-header">
      <el-icon><Warning /></el-icon>
      <h4>天气建议</h4>
    </div>
    <div class="prompt-text error-text">
      天气信息获取失败：{{ weatherError }}
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { Sunny, Calendar, Loading, Warning } from "@element-plus/icons-vue";

export default {
  name: "WeatherPreviewSection",
  components: { Sunny, Calendar, Loading, Warning },
  props: {
    weatherSuggestion: Object,
    baseForm: Object,
    loadingWeather: Boolean,
    weatherError: String
  },
  setup(props) {
    const isDateWithinForecastRange = computed(() => {
      if (
        !props.weatherSuggestion ||
        !props.weatherSuggestion.forecast ||
        !props.baseForm ||
        !props.baseForm.dateRange ||
        !props.baseForm.dateRange.length
      ) {
        return false;
      }

      const userStartDate = new Date(props.baseForm.dateRange[0]);
      const userEndDate = new Date(props.baseForm.dateRange[1]);

      const forecastDates = props.weatherSuggestion.forecast.map((f) => new Date(f.date));
      const forecastStartDate = new Date(Math.min(...forecastDates));
      const forecastEndDate = new Date(Math.max(...forecastDates));

      return userStartDate <= forecastEndDate && userEndDate >= forecastStartDate;
    });

    return {
      isDateWithinForecastRange
    };
  }
};
</script>

<style scoped>
.prompt-section {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
  background-color: #fafafa;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.section-header h4 {
  margin: 0;
  font-weight: 500;
  font-size: 15px;
}

.prompt-text {
  color: #303133;
  line-height: 1.6;
  font-size: 14px;
}

.highlight {
  color: #91a8d0;
  font-weight: 500;
}

.error-text {
  color: #f56c6c;
}

.loading-text {
  color: #909399;
}

.weather-forecast {
  margin-top: 12px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #91a8d0;
}

.weather-forecast h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 6px;
}

.forecast-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.forecast-item {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1.5fr;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
  font-size: 13px;
  align-items: center;
}

.forecast-item:last-child {
  border-bottom: none;
}

.forecast-date {
  color: #606266;
  font-weight: 500;
  font-size: 12px;
}

.forecast-weather {
  color: #91a8d0;
  font-size: 13px;
}

.forecast-weather .day-weather {
  font-weight: 500;
}

.forecast-weather .night-weather {
  color: #909399;
  font-size: 12px;
}

.forecast-temp {
  color: #909399;
  font-family: monospace;
  font-size: 13px;
  text-align: center;
}

.forecast-wind {
  color: #67c23a;
  font-size: 11px;
  text-align: right;
}

.weather-limitation-notice {
  background: linear-gradient(135deg, #fff7e6 0%, #fffbf0 100%);
  border: 1px solid #ffe7ba;
  border-left: 4px solid #e6a23c;
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
}

.weather-limitation-notice .notice-title {
  font-weight: 600;
  font-size: 14px;
  color: #d46b08;
  margin: 0 0 8px 0;
}

.weather-limitation-notice .notice-suggestion {
  color: #d46b08;
  font-size: 13px;
  margin: 8px 0 0 0;
  font-style: italic;
}

.forecast-item.forecast-outdated {
  opacity: 0.7;
  background-color: #f5f5f5;
  border-radius: 4px;
  position: relative;
}

.forecast-item.forecast-outdated::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(230, 162, 60, 0.1);
  border-radius: 4px;
  pointer-events: none;
}

.forecast-limitation-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  background: #fdf6ec;
  border: 1px solid #ffd591;
  border-radius: 4px;
  color: #d46b08;
  font-size: 12px;
}

.forecast-limitation-notice .el-icon {
  color: #e6a23c;
  font-size: 14px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .weather-forecast {
    padding: 12px;
  }

  .forecast-item {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    font-size: 12px;
  }

  .forecast-date {
    font-size: 11px;
  }

  .forecast-wind {
    display: none;
  }
}
</style>

