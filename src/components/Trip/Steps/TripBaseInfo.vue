<template>
  <div class="step-content">
    <!-- 页面标题区域 -->
    <div class="page-title">
      <div class="title-content">
        <el-icon class="title-icon">
          <MapLocation />
        </el-icon>
        <div class="title-text">
          <h2 class="main-title">行程基础信息</h2>
          <p class="subtitle">完善您的出行计划，我们将为您量身定制专属行程</p>
        </div>
      </div>
    </div>

    <el-card class="info-card">
      <el-form
        ref="tripFormRef"
        :model="tripForm"
        :rules="tripRules"
        label-position="top"
      >
        <!-- 1. 基本信息表单 -->
        <TripBaseForm
          v-model="tripForm"
          :date-range-error="dateRangeError"
          @date-change="handleDateChange"
        />

        <!-- 2. 天气信息区域 -->
        <TripWeatherInfo
          :visible="!!(tripForm.destinationName && (loadingWeather || weatherError || weatherSuggestion))"
          :loading="loadingWeather"
          :error="weatherError"
          :suggestion="weatherSuggestion"
          :days="tripForm.days"
          :is-disabled="isWeatherDisabled()"
          :is-outdated="isForecastOutdated()"
          :is-out-of-range="isDateRangeOutOfForecast()"
          :format-date-range="formatDateRange()"
        />

        <!-- 3. 预算选择区域 -->
        <TripBudgetSelector
          v-model="tripForm.budget"
          :days="tripForm.days"
          :travelers="tripForm.travelers"
          :user-preferences="userPreferences"
        />
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <div class="step-actions">
      <div class="action-left">
        <el-button
          size="large"
          type="info"
          plain
          :loading="savingDraft"
          @click="$emit('save-draft')"
        >
          <el-icon><Document /></el-icon>
          保存草稿
        </el-button>
      </div>
      <div class="action-right">
        <el-button type="primary" size="large" @click="goToNextStep">
          下一步
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted} from "vue";
import { ElMessage } from "element-plus";
import { MapLocation, ArrowRight, Document } from "@element-plus/icons-vue";

// 引入子组件
import TripBaseForm from "./BaseInfo/TripBaseForm.vue";
import TripWeatherInfo from "./BaseInfo/TripWeatherInfo.vue";
import TripBudgetSelector from "./BaseInfo/TripBudgetSelector.vue";

const props = defineProps({
  baseForm: { type: Object, required: true },
  userPreferences: { type: Object, default: () => ({}) },
  weatherSuggestion: { type: Object, default: null },
  loadingWeather: { type: Boolean, default: false },
  weatherError: { type: String, default: null },
  savingDraft: { type: Boolean, default: false },
});

const emit = defineEmits(["update:baseForm", "next-step", "formValid", "fetch-weather", "save-draft"]);

// 本地状态，完全由组件自己管理
const tripForm = ref({
  destination: "",
  destinationName: "",
  days: 3,
  dateRange: null,
  travelers: 1,
  budget: "moderate"
});

const tripFormRef = ref(null);
const dateRangeError = ref("");

// 对外暴露的方法
const getFormData = () => {
    // 返回纯净数据副本
    return JSON.parse(JSON.stringify(tripForm.value));
};

const setFormData = (data) => {
    if (!data) return;
    Object.assign(tripForm.value, data);
    // 确保类型正确
    if (tripForm.value.travelers) tripForm.value.travelers = Number(tripForm.value.travelers);
    if (tripForm.value.days) tripForm.value.days = Number(tripForm.value.days);
};

defineExpose({
    getFormData,
    setFormData,
    validate: () => {
        return new Promise(resolve => {
            if (tripFormRef.value) {
                tripFormRef.value.validate(resolve);
            } else {
                resolve(true); // 简单模式下默认通过
            }
        });
    }
});

// 初始化
watch(() => props.baseForm, (newVal) => {
  // 仅在初始化时或明确需要重置时接收父组件的初始值
  // 这里做一个简单的判断：如果本地是空的，父组件有值，则同步
  if (newVal && newVal.destinationName && !tripForm.value.destinationName) {
      setFormData(newVal);
  }
}, { immediate: true, deep: true });

// 移除原来的复杂 watch 和 emit 逻辑，不再实时 emit update:baseForm
// 改为在关键变化时通知父组件（可选，仅用于触发某些联动）
watch(tripForm, (newVal) => {
    emit("change", newVal); // 发出一个普通的 change 事件供父组件监听（如果需要）
    if(newVal.destinationName) {
        emit("update:baseForm", newVal); // 保持兼容，但主要数据流走 getFormData
    }
}, { deep: true });

// 逻辑方法
const applyUserPreferences = () => {
  if (props.userPreferences) {
    if (props.userPreferences.budget && !tripForm.value.budget) {
      const userBudget = parseInt(props.userPreferences.budget);
      if (userBudget <= 500) tripForm.value.budget = "budget";
      else if (userBudget > 1000) tripForm.value.budget = "luxury";
      else tripForm.value.budget = "moderate";
    }
    if (props.userPreferences.includeKidsActivities && !tripForm.value.travelers) {
      tripForm.value.travelers = 3;
    }
  }
};

const handleDateChange = (val) => {
  if (val && val.length === 2) {
    const start = new Date(val[0]);
    const end = new Date(val[1]);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    tripForm.value.days = diffDays;
    
    if (tripForm.value.destinationName) emit("fetch-weather");
    validateForm();
  } else {
    tripForm.value.days = 3;
  }
};

const validateForm = () => {
  if (tripForm.value.dateRange && tripForm.value.dateRange.length === 2) {
    dateRangeError.value = "";
  }
  if (tripFormRef.value) {
    tripFormRef.value.validate((valid) => emit("formValid", valid));
  } else {
    const isValid = tripForm.value.destinationName && tripForm.value.days > 0 && 
                    tripForm.value.dateRange && tripForm.value.dateRange.length === 2 && 
                    tripForm.value.travelers > 0;
    emit("formValid", isValid);
  }
};

const goToNextStep = () => {
  if (!tripFormRef.value) return;
  tripFormRef.value.validate((valid) => {
    if (valid) emit("next-step");
    else ElMessage.warning("请完善基本信息后继续");
  });
};

// 天气相关辅助逻辑 (保留核心判断逻辑，展示逻辑移入子组件)
const formatDateRange = () => {
  if (!tripForm.value.dateRange || tripForm.value.dateRange.length !== 2) return "";
  return `${tripForm.value.dateRange[0]} 至 ${tripForm.value.dateRange[1]} (${tripForm.value.days}天)`;
};

const isForecastOutdated = () => {
  if (!tripForm.value.dateRange || !props.weatherSuggestion?.forecast) return false;
  const lastForecastDate = new Date(props.weatherSuggestion.forecast[props.weatherSuggestion.forecast.length - 1].date);
  const tripStartDate = new Date(tripForm.value.dateRange[0]);
  return tripStartDate > lastForecastDate;
};

const isDateRangeOutOfForecast = () => {
  if (!tripForm.value.dateRange || !props.weatherSuggestion?.forecast) return false;
  const tripStart = new Date(tripForm.value.dateRange[0]);
  const tripEnd = new Date(tripForm.value.dateRange[1]);
  const forecastStart = new Date(props.weatherSuggestion.forecast[0].date);
  const forecastEnd = new Date(props.weatherSuggestion.forecast[props.weatherSuggestion.forecast.length - 1].date);
  return tripEnd < forecastStart || tripStart > forecastEnd;
};

const isWeatherDisabled = () => isDateRangeOutOfForecast() || isForecastOutdated();

// 生命周期
onMounted(() => {
  if (props.baseForm.destination && props.baseForm.destinationName) {
    tripForm.value.destination = props.baseForm.destination;
    tripForm.value.destinationName = props.baseForm.destinationName;
  }
  applyUserPreferences();
  validateForm();
});
</script>

<style scoped>
.step-content {
  width: 100%;
}

.page-title {
  padding: 24px 16px;
}

.title-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 48px;
  height: 48px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border-radius: 12px;
  color: var(--el-color-primary);
  border: 1px solid var(--el-color-primary-light-5);
}

.title-text .main-title {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.title-text .subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
  line-height: 1.4;
}

.info-card {
  border: none;
  box-shadow: none;
  margin-bottom: 24px;
  overflow: visible;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.action-left, .action-right {
  display: flex;
  gap: 16px;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .page-title {
    padding: 16px;
    margin-bottom: 16px;
  }

  .title-content {
    gap: 12px;
  }

  .title-text .main-title {
    font-size: 20px;
  }
  
  .step-actions {
    flex-direction: column-reverse;
    gap: 16px;
  }
  
  .action-left, .action-right {
    width: 100%;
  }
  
  .action-left .el-button, .action-right .el-button {
    width: 100%;
  }
}
</style>
