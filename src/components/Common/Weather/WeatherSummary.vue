<template>
  <div class="weather-summary">
    <div class="weather-header">
      <div class="header-left">
        <h3 class="section-title">
          <el-icon><Sunny /></el-icon>
          天气速览
        </h3>
        <el-tag
          v-if="weather && weather.city"
          size="small"
          type="primary"
          class="city-tag"
        >
          {{ weather.city }}
        </el-tag>
      </div>

      <div class="header-actions">
        <el-button
          size="small"
          type="primary"
          plain
          :loading="loading"
          @click="refreshWeather"
        >
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 天气内容 -->
    <div
v-if="weather" class="weather-content"
>
      <div class="current-weather">
        <div class="weather-main">
          <div class="temp-info">
            <span class="current-temp">{{ weather.currentTemp || "--" }}°</span>
            <span class="weather-desc">{{
              weather.currentWeather || weather.weatherDesc || "晴"
            }}</span>
          </div>
          <div class="weather-meta">
            <span class="feels-like">体感温度</span>
            <span class="temp-range">{{ weather.tempRange || "--" }}</span>
          </div>
        </div>

        <div class="weather-icon">
          <el-icon size="32">
            <Sunny />
          </el-icon>
        </div>
      </div>

      <!-- 未来几天预报 -->
      <div
        v-if="weather.forecast && weather.forecast.length > 0"
        class="forecast"
      >
        <div
          v-for="day in weather.forecast.slice(0, 3)"
          :key="day.date"
          class="forecast-item"
        >
          <div class="forecast-date">
            {{ formatDate(day.date) }}
          </div>
          <div class="forecast-weather">
            {{ day.dayWeather || day.weather || "晴" }}
          </div>
          <div class="forecast-temp">
            {{ day.dayTemp }}°/{{ day.nightTemp }}°
          </div>
        </div>
      </div>

      <!-- 出行建议 -->
      <div
v-if="weather.tips && weather.tips.length > 0" class="travel-tips"
>
        <div class="tips-title">
          <el-icon><InfoFilled /></el-icon>
          出行建议
        </div>
        <div class="tips-content">
          {{ weather.tips[0] }}
        </div>
      </div>
    </div>

    <!-- 空状态 - 引导用户添加愿望城市 -->
    <div
v-else class="empty-state"
>
      <el-icon
size="48" color="#C0C4CC"
>
        <Sunny />
      </el-icon>
      <p>添加心仪的城市到愿望清单</p>
      <p class="empty-hint">天气速览将显示你感兴趣的城市天气信息</p>
      <div class="empty-actions">
        <el-button size="small"
type="primary" @click="goToWishlist">
          <el-icon><Plus /></el-icon>
          添加愿望城市
        </el-button>
        <el-button
          size="small"
          type="primary"
          plain
          :loading="loading"
          @click="loadDefaultWeather"
        >
          <el-icon><Refresh /></el-icon>
          查看北京天气
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Sunny, Refresh, InfoFilled, Plus } from "@element-plus/icons-vue";
import { weatherApi } from "@/api/weather.js";
import { useRouter } from "vue-router";

export default {
  name: "WeatherSummary",
  components: {
    Sunny,
    Refresh,
    InfoFilled,
    Plus,
  },
  props: {
    weather: {
      type: Object,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["refresh-weather"],
  setup(props, { emit }) {
    const router = useRouter();

    const refreshWeather = () => {
      emit("refresh-weather");
    };

    const goToWishlist = () => {
      router.push("/wishlist");
    };

    const loadDefaultWeather = async () => {
      try {
        // 获取默认城市（北京）的天气
        await emit("refresh-weather", "北京");
      } catch (error) {
        ElMessage.error("获取天气信息失败");
      }
    };

    const formatDate = (dateStr) => {
      try {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
          return "今天";
        } else if (date.toDateString() === tomorrow.toDateString()) {
          return "明天";
        } else {
          return date.toLocaleDateString("zh-CN", {
            month: "short",
            day: "numeric",
          });
        }
      } catch {
        return dateStr;
      }
    };

    return {
      refreshWeather,
      goToWishlist,
      loadDefaultWeather,
      formatDate,
    };
  },
};
</script>

<style scoped>
.weather-summary {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(145, 168, 208, 0.1);
  box-shadow: 0 2px 8px rgba(145, 168, 208, 0.08);
}

/* 头部 */
.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(145, 168, 208, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title .el-icon {
  color: #91a8d0;
  font-size: 20px;
}

.city-tag {
  background: rgba(145, 168, 208, 0.1);
  color: #91a8d0;
  border: 1px solid rgba(145, 168, 208, 0.2);
  font-weight: 500;
}

/* 天气内容 */
.weather-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.current-weather {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(145, 168, 208, 0.04);
  border-radius: 8px;
}

.weather-main {
  flex: 1;
}

.temp-info {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
}

.current-temp {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
}

.weather-desc {
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
}

.weather-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #6b7280;
}

.weather-icon {
  color: #91a8d0;
  opacity: 0.8;
}

/* 预报 */
.forecast {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.forecast-item {
  text-align: center;
  padding: 12px;
  background: #ffffff;
  border: 1px solid rgba(145, 168, 208, 0.1);
  border-radius: 8px;
}

.forecast-date {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
}

.forecast-weather {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  margin-bottom: 4px;
}

.forecast-temp {
  font-size: 12px;
  color: #6b7280;
}

/* 出行建议 */
.travel-tips {
  padding: 16px;
  background: rgba(34, 197, 94, 0.04);
  border-radius: 8px;
  border-left: 3px solid #22c55e;
}

.tips-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #065f46;
  margin-bottom: 8px;
}

.tips-title .el-icon {
  color: #22c55e;
  font-size: 16px;
}

.tips-content {
  font-size: 14px;
  color: #065f46;
  line-height: 1.5;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-state p {
  margin: 16px 0 8px 0;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.empty-hint {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 20px !important;
  line-height: 1.4;
}

.empty-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .weather-summary {
    padding: 20px;
  }

  .weather-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .header-left {
    justify-content: space-between;
  }

  .current-weather {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .temp-info {
    justify-content: center;
  }

  .current-temp {
    font-size: 28px;
  }

  .forecast {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .forecast-item {
    padding: 8px;
  }
}
</style>
