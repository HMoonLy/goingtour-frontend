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

    <!-- 表单区域 -->
    <div class="form-sections">
      <el-form
        ref="tripFormRef"
        :model="tripForm"
        :rules="tripRules"
        label-position="top"
      >
        <!-- 基本信息区域 -->
        <div class="form-section">
          <div class="section-title">
            <el-icon><MapLocation /></el-icon>
            <span>行程基础信息</span>
          </div>

          <el-row :gutter="24">
            <!-- 目的地选择 -->
            <el-col :span="12">
              <el-form-item label="目的地" prop="destination">
                <el-input
                  v-model="tripForm.destinationName"
                  placeholder="搜索城市、地区..."
                  size="large"
                  style="width: 100%"
                  disabled
                />
                <div class="selected-city-info">
                  <el-tag type="success" size="small">
                    已选择:{{ tripForm.destinationName }}
                  </el-tag>
                </div>
              </el-form-item>
            </el-col>

            <!-- 出行天数 -->
            <el-col :span="12">
              <el-form-item label="天数" prop="days">
                <div class="days-input-container">
                  <el-input-number
                    v-model="tripForm.days"
                    :min="1"
                    :max="365"
                    size="large"
                    style="width: 100%"
                    placeholder="根据日期自动计算"
                    disabled
                  />
                  <!-- 天数描述 -->
                  <div v-if="tripForm.days" class="days-description">
                    <span class="days-text">{{ getDaysDescription() }}</span>
                  </div>
                  <div class="form-tip">根据日期范围自动计算天数</div>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <!-- 出行日期 -->
            <el-col :span="12">
              <el-form-item label="行程时间" prop="dateRange" :error="dateRangeError">
                <el-date-picker
                  v-model="tripForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  size="large"
                  style="width: 100%"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  :disabled-date="disabledDate"
                  :clearable="true"
                  @change="handleDateChange"
                />
                <div class="form-tip">
                  <template v-if="tripForm.dateRange && tripForm.dateRange.length === 2">
                    <div class="date-info">
                      <span class="date-match">
                        <el-icon><Check /></el-icon>
                        已选择日期范围：{{ formatDateRange() }}
                      </span>
                    </div>
                  </template>
                  <template v-else> 请选择您计划出行的日期范围 </template>
                </div>
              </el-form-item>
            </el-col>

            <!-- 出行人数 -->
            <el-col :span="12">
              <el-form-item label="人数" prop="travelers">
                <el-input-number
                  v-model="tripForm.travelers"
                  :min="1"
                  :max="20"
                  size="large"
                  style="width: 100%"
                />
                <div class="form-tip">人数会影响餐厅和住宿推荐</div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 天气信息区域 -->
        <div
          v-if="
            tripForm.destinationName &&
            (loadingWeather || weatherError || weatherSuggestion)
          "
          class="form-section weather-section"
          :class="{
            'weather-disabled': isWeatherDisabled(),
            'weather-outdated': isForecastOutdated(),
          }"
        >
          <div class="section-title">
            <el-icon><Sunny /></el-icon>
            <span>天气预报</span>
            <el-tag
              v-if="weatherSuggestion"
              :type="getWeatherTagType()"
              size="small"
              effect="plain"
              class="weather-source-tag"
            >
              {{ getWeatherSourceText() }}
            </el-tag>
          </div>

          <!-- 天气加载状态 -->
          <div v-if="loadingWeather" class="weather-loading">
            <el-icon class="is-loading">
              <Loading />
            </el-icon>
            <span>正在获取天气信息...</span>
          </div>

          <!-- 天气错误状态 -->
          <div v-else-if="weatherError" class="weather-error">
            <el-icon><Warning /></el-icon>
            <span>{{ weatherError }}</span>
          </div>

          <!-- 天气信息显示 -->
          <div v-else-if="weatherSuggestion" class="weather-content">
            <!-- 失效提示 -->
            <div v-if="isWeatherDisabled()" class="weather-disabled-notice">
              <el-icon><InfoFilled /></el-icon>
              <span v-if="isDateRangeOutOfForecast()">
                所选日期超出天气预报范围（{{ formatDateRange() }}）
              </span>
              <span v-else-if="isForecastOutdated()">
                行程天数（{{ tripForm.days }}天）超出预报范围（{{
                  weatherSuggestion?.forecast?.length || 0
                }}天）
              </span>
            </div>

            <!-- 天气预报网格 -->
            <div
              v-if="weatherSuggestion?.forecast && weatherSuggestion.forecast.length > 0"
              class="weather-forecast-grid"
            >
              <div
                v-for="(forecast, index) in weatherSuggestion?.forecast || []"
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
          <div class="weather-summary">
            <div class="summary-item">
              <span class="summary-label">温度范围</span>
              <span class="summary-value">{{ weatherSuggestion?.tempRange || '暂无数据' }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">预报天数</span>
              <span class="summary-value">{{ weatherSuggestion?.forecast?.length || 0 }}天</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">数据来源</span>
              <span class="summary-value">{{ getWeatherSourceText() }}</span>
            </div>
          </div>

          <!-- 出行建议 -->
          <div v-if="getSmartTravelTips().length > 0" class="weather-tips">
            <div class="tips-header">
              <el-icon><InfoFilled /></el-icon>
              <span class="tips-title">出行建议</span>
            </div>
            <div class="tips-content">
              {{ getSmartTravelTips().slice(0, 2).join("；") }}
            </div>
          </div>
        </div>
      </el-form>
    </div>

    <!-- 预算选择区域 -->
    <div class="form-section budget-section">
      <div class="section-title">
        <el-icon><Money /></el-icon>
        <span>预算范围</span>
        <span class="section-subtitle">每人/天</span>
      </div>

      <el-form-item prop="budget">
        <div
          v-if="userPreferences && userPreferences.budget"
          class="preference-hint-banner"
        >
          <el-icon><Star /></el-icon>
          <span>根据您的偏好，推荐预算：¥{{ userPreferences.budget }}/天</span>
          <el-button type="link" size="small" @click="applyRecommendedBudget">
            应用推荐
          </el-button>
        </div>

        <div class="budget-selector">
          <div
            v-for="option in budgetOptions"
            :key="option.value"
            class="budget-card"
            :class="{
              selected: tripForm.budget === option.value,
              recommended: isRecommendedBudget(option.value),
            }"
            @click="selectBudget(option.value)"
          >
            <div class="budget-icon">
              <el-icon>
                <component :is="option.icon" />
              </el-icon>
            </div>
            <div class="budget-content">
              <h4 class="budget-title">
                {{ option.title }}
                <el-tag
                  v-if="isRecommendedBudget(option.value)"
                  size="small"
                  type="success"
                >
                  推荐
                </el-tag>
              </h4>
              <div class="budget-price">
                {{ option.price }}
              </div>
              <div class="budget-desc">
                {{ option.description }}
              </div>
            </div>
            <div v-if="tripForm.days && tripForm.travelers" class="budget-preview">
              <div class="preview-label">总预算</div>
              <div class="preview-amount">
                {{ calculateBudgetPreview(option.value) }}
              </div>
            </div>
            <div v-if="tripForm.budget === option.value" class="budget-check">
              <el-icon><Check /></el-icon>
            </div>
          </div>
        </div>

      </el-form-item>
    </div>

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
<script>
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  MapLocation,
  Calendar,
  Check,
  Warning,
  Star,
  Money,
  Setting,
  ArrowRight,
  Loading,
  Sunny,
  InfoFilled,
  Document,
} from "@element-plus/icons-vue";

// t函数已移除，所有文本已直接使用中文

export default {
  name: "TripBaseInfo",
  components: {
    MapLocation,
    Calendar,
    Check,
    Warning,
    Star,
    Money,
    Setting,
    ArrowRight,
    Loading,
    Sunny,
    InfoFilled,
    Document,
  },
  props: {
    // 从父组件接收的行程表单数据
    baseForm: {
      type: Object,
      required: true,
    },
    // 用户偏好
    userPreferences: {
      type: Object,
      default: () => ({}),
    },
    // 天气建议
    weatherSuggestion: {
      type: Object,
      default: null,
    },
    // 天气加载状态
    loadingWeather: {
      type: Boolean,
      default: false,
    },
    // 天气错误状态
    weatherError: {
      type: String,
      default: null,
    },
    // 保存草稿状态
    savingDraft: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:baseForm", "next-step", "formValid", "fetch-weather", "save-draft"],
  setup(props, { emit }) {
    // 使用父组件传递的值初始化本地数据
    const tripForm = ref({ ...props.baseForm });

    // 应用用户偏好默认值
    const applyUserPreferences = () => {
      if (props.userPreferences) {
        // 应用预算偏好
        if (props.userPreferences.budget && !tripForm.value.budget) {
          const userBudget = parseInt(props.userPreferences.budget);
          let budgetType = "moderate"; // 默认中档

          if (userBudget <= 500) {
            budgetType = "budget";
          } else if (userBudget > 1000) {
            budgetType = "luxury";
          }

          tripForm.value.budget = budgetType;
          console.log("✅ 应用用户预算偏好:", userBudget, "-> 档位:", budgetType);
        }

        // 应用出行人数偏好（如果用户有家庭偏好）
        if (props.userPreferences.includeKidsActivities && !tripForm.value.travelers) {
          tripForm.value.travelers = 3; // 家庭出行建议3人
          console.log("✅ 应用家庭出行人数偏好: 3人");
        }
      }
    };

    // 监听tripForm的变化，同步到父组件
    watch(
      tripForm,
      (newVal) => {
        emit("update:baseForm", newVal);
      },
      { deep: true }
    );

    // 监听props.baseForm的变化，同步到本地
    watch(
      () => props.baseForm,
      (newVal) => {
        if (JSON.stringify(newVal) !== JSON.stringify(tripForm.value)) {
          tripForm.value = { ...newVal };
        }
      },
      { deep: true }
    );

    const tripFormRef = ref(null);

    // 表单验证状态
    const formValid = ref(false);

    // 日期范围错误信息
    const dateRangeError = ref("");

    // 验证表单并通知父组件
    const validateForm = () => {
      // 检查并重置日期错误
      dateRangeError.value = "";

      if (!tripFormRef.value) return;

      tripFormRef.value.validate((valid) => {
        formValid.value = valid;
        emit("formValid", valid);
      });
    };

    // 监听表单数据变化，验证表单
    watch(
      tripForm,
      () => {
        validateForm();
      },
      { deep: true }
    );

    // 可用城市列表 - 从API获取
    const availableCities = ref([]);

    // 预算选项配置
    const budgetOptions = [
      {
        value: "budget",
        title: "经济实惠",
        price: "< ¥500/天",
        description: "青旅、经济型酒店、当地小吃",
        icon: "Money",
        dailyAmount: 400,
      },
      {
        value: "moderate",
        title: "舒适享受",
        price: "¥500-1000/天",
        description: "三星酒店、特色餐厅、景点门票",
        icon: "Star",
        dailyAmount: 750,
      },
      {
        value: "luxury",
        title: "豪华体验",
        price: "> ¥1000/天",
        description: "高端酒店、精品餐厅、VIP服务",
        icon: "Setting",
        dailyAmount: 1500,
      },
    ];

    // 表单验证规则
    const tripRules = {
      days: [
        {
          required: true,
          message: "请选择日期范围以计算天数",
          trigger: "change",
        },
      ],
      dateRange: [
        { required: true, message: "请选择出行日期", trigger: "change" },
        {
          validator: (rule, value, callback) => {
            if (!value || value.length !== 2) {
              callback();
              return;
            }

            try {
              const startDate = new Date(value[0]);
              const endDate = new Date(value[1]);

              // 检查是否为有效日期
              if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                callback(new Error("日期格式不正确"));
                return;
              }

              // 验证开始日期不能早于今天
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (startDate < today) {
                callback(new Error("开始日期不能早于今天"));
                return;
              }

              // 验证日期范围不能超过365天
              const daysDifference =
                Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
              if (daysDifference > 365) {
                callback(new Error("行程不能超过365天"));
                return;
              }

              callback();
            } catch (error) {
              console.error("日期验证错误:", error);
              callback(new Error("日期验证出错"));
            }
          },
          trigger: "change",
        },
      ],
      travelers: [{ required: true, message: "请填写出行人数", trigger: "blur" }],
      budget: [{ required: true, message: "请选择预算范围", trigger: "change" }],
    };

    // 禁用日期的方法
    const disabledDate = (time) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 禁用今天之前的日期
      if (time.getTime() < today.getTime()) {
        return true;
      }

      // 禁用超过两年后的日期（支持长期旅居）
      const twoYearsLater = new Date();
      twoYearsLater.setFullYear(today.getFullYear() + 2);
      if (time.getTime() > twoYearsLater.getTime()) {
        return true;
      }

      return false;
    };

    // 处理日期变化
    const handleDateChange = (newDateRange) => {
      // console.log("🗓️ 日期范围变化:", newDateRange);
      // console.log("🗓️ 当前目的地:", tripForm.value.destinationName);

      if (!newDateRange || newDateRange.length !== 2) {
        return;
      }

      try {
        // 输出调试信息
        // console.log("日期字符串格式:", typeof newDateRange[0], newDateRange[0], typeof newDateRange[1], newDateRange[1]);

        // 确保是有效的Date对象
        const startDate = new Date(newDateRange[0]);
        const endDate = new Date(newDateRange[1]);

        // 检查是否为有效日期
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.error("无效的日期对象:", newDateRange);
          ElMessage.error("日期格式不正确");
          return;
        }

        // console.log("有效的日期对象:", startDate, endDate);
        // console.log("有效的日期范围:", formatDate(startDate), "至", formatDate(endDate));

        const actualDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        // console.log(`计算得出实际天数: ${actualDays}天`);

        // 根据日期范围自动设置天数
        tripForm.value.days = actualDays;
        ElMessage.success(`根据所选日期，行程天数设为${actualDays}天`);

        // 重新验证表单
        nextTick(() => {
          tripFormRef.value?.validateField("days");
          tripFormRef.value?.validateField("dateRange");
        });
      } catch (error) {
        console.error("处理日期范围时出错:", error);
        ElMessage.error("处理日期时出错");
      }
    };

    // 格式化日期范围显示
    const formatDateRange = () => {
      if (!tripForm.value.dateRange || tripForm.value.dateRange.length !== 2) {
        return "未设置";
      }
      try {
        const startDate = new Date(tripForm.value.dateRange[0]);
        const endDate = new Date(tripForm.value.dateRange[1]);

        // 检查是否为有效日期
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.error("无效日期:", tripForm.value.dateRange);
          return "日期格式错误";
        }

        return `${formatDate(startDate)} 至 ${formatDate(endDate)}`;
      } catch (error) {
        console.error("日期格式化失败:", error);
        return "日期格式错误";
      }
    };

    // 获取天数描述
    const getDaysDescription = () => {
      const days = tripForm.value.days;
      if (!days) return "";

      if (days === 1) return "当日往返，短途游览";
      if (days <= 3) return "短途旅行，周末休闲";
      if (days <= 7) return "一周以内，深度游览";
      if (days <= 14) return "两周行程，充分探索";
      if (days <= 30) return "一个月旅行，深度体验";
      if (days <= 90) return "长期旅居，季度体验";
      if (days <= 180) return "半年旅居，深度融入";
      return "长期旅居，生活体验";
    };

    // 预算相关方法
    const selectBudget = (value) => {
      tripForm.value.budget = value;

      // 重新验证表单
      nextTick(() => {
        tripFormRef.value?.validateField("budget");
      });
    };

    // 计算预算预览
    const calculateBudgetPreview = (budgetType) => {
      if (!tripForm.value.days || !tripForm.value.travelers) return "¥0";

      const option = budgetOptions.find((opt) => opt.value === budgetType);
      if (!option) return "¥0";

      const totalAmount =
        option.dailyAmount * tripForm.value.days * tripForm.value.travelers;
      return `¥${totalAmount.toLocaleString()}`;
    };

    // 预算推荐计算
    const budgetRecommendation = computed(() => {
      if (!props.userPreferences?.budget) return null;

      const userBudget = parseInt(props.userPreferences.budget);
      if (userBudget <= 200) return "budget";
      if (userBudget <= 500) return "moderate";
      if (userBudget <= 1000) return "comfort";
      return "luxury";
    });

    // 判断是否为推荐的预算选项
    const isRecommendedBudget = (budgetValue) => {
      return budgetRecommendation.value === budgetValue;
    };

    // 应用推荐预算
    const applyRecommendedBudget = () => {
      if (budgetRecommendation.value) {
        tripForm.value.budget = budgetRecommendation.value;
        ElMessage.success(`已应用推荐预算：${getBudgetText()}`);
      }
    };

    // 获取每日预算金额
    const getBudgetDailyAmount = () => {
      const budgetMap = {
        budget: 400,
        moderate: 750,
        luxury: 1500,
      };
      return budgetMap[tripForm.value.budget] || 750;
    };


    // 判断是否显示预算摘要
    const shouldShowBudgetSummary = () => {
      // 如果用户有偏好预算，且已选择预算档位，显示简化信息
      if (tripForm.value.budget && props.userPreferences?.budget) {
        return true;
      }
      // 如果用户选择了预算档位但没有偏好设置，也显示基本信息
      if (tripForm.value.budget) {
        return true;
      }
      return false;
    };

    // 处理下一步按钮点击
    const goToNextStep = () => {
      // 验证表单
      if (!tripFormRef.value) return;

      tripFormRef.value.validate((valid) => {
        if (valid) {
          emit("next-step");
        } else {
          ElMessage.warning("请完善基本信息后继续");
        }
      });
    };

    // 组件加载时初始化
    onMounted(async () => {
      // 处理从父组件传递的目的地信息
      if (props.baseForm.destination && props.baseForm.destinationName) {
        // 确保本地表单数据同步
        tripForm.value.destination = props.baseForm.destination;
        tripForm.value.destinationName = props.baseForm.destinationName;
      }

      // 应用用户偏好默认值
      applyUserPreferences();

      validateForm(); // 初始验证表单
    });

    // 格式化单个日期
    const formatDate = (date) => {
      if (!date || isNaN(date.getTime())) return "日期格式错误";
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}年${month}月${day}日`;
    };

    // 天气相关工具函数
    const getWeatherSourceText = () => {
      if (!props.weatherSuggestion) return "";

      if (props.weatherSuggestion.isHistorical) {
        if (props.weatherSuggestion.isFallback) {
          return "季节性参考";
        }
        return "历史气候数据";
      }
      return "高德实时数据";
    };

    const getWeatherValidityText = () => {
      if (!props.weatherSuggestion) return "";
      if (props.weatherSuggestion.isHistorical) {
        return "基于历史同期气候特征预测";
      }

      // 实时数据的有效期计算
      return `数据更新时间：今日，预报范围：今日起3天内`;
    };

    const getWeatherTagType = () => {
      if (!props.weatherSuggestion) return "info";

      if (props.weatherSuggestion.isHistorical) {
        return props.weatherSuggestion.isFallback ? "warning" : "info";
      }
      return "success";
    };

    // 根据天气类型返回对应的emoji
    const getWeatherEmoji = (weather) => {
      if (!weather) return "☀️";

      const weatherEmojiMap = {
        晴: "☀️",
        多云: "⛅",
        阴: "☁️",
        小雨: "🌦️",
        中雨: "🌧️",
        大雨: "⛈️",
        暴雨: "⛈️",
        雷阵雨: "⛈️",
        阵雨: "🌦️",
        小雪: "❄️",
        中雪: "🌨️",
        大雪: "❄️",
        暴雪: "❄️",
        雨夹雪: "🌨️",
        雾: "🌫️",
        霾: "😷",
        沙尘暴: "💨",
        大风: "💨",
      };

      // 尝试精确匹配
      if (weatherEmojiMap[weather]) {
        return weatherEmojiMap[weather];
      }

      // 模糊匹配
      for (const [key, emoji] of Object.entries(weatherEmojiMap)) {
        if (weather.includes(key)) {
          return emoji;
        }
      }

      // 默认返回太阳
      return "☀️";
    };

    // 检查用户选择的日期是否在天气预报范围内
    const isDateWithinForecastRange = () => {
      if (
        !props.weatherSuggestion ||
        !props.weatherSuggestion.forecast ||
        !tripForm.value.dateRange ||
        !tripForm.value.dateRange.length
      ) {
        return false;
      }

      const userStartDate = new Date(tripForm.value.dateRange[0]);
      const userEndDate = new Date(tripForm.value.dateRange[1]);

      // 获取天气预报的日期范围
      const forecastDates = props.weatherSuggestion.forecast.map((f) => new Date(f.date));
      const forecastStartDate = new Date(Math.min(...forecastDates));
      const forecastEndDate = new Date(Math.max(...forecastDates));


      // 检查用户选择的日期是否与天气预报日期有重叠
      const hasOverlap =
        userStartDate <= forecastEndDate && userEndDate >= forecastStartDate;

      return hasOverlap;
    };

    // 生成智能的出行建议
    const getSmartTravelTips = () => {
      if (!props.weatherSuggestion || !props.weatherSuggestion.forecast) {
        return [];
      }

      // 检查用户选择的日期是否在天气预报范围内
      if (!isDateWithinForecastRange()) {
        return []; // 如果日期超出预报范围，不显示天气建议
      }

      const tips = [];
      const forecasts = props.weatherSuggestion.forecast.slice(0, 4);

      // 分析温度变化
      const temps = forecasts.map((f) => ({
        day: parseInt(f.dayTemp) || 0,
        night: parseInt(f.nightTemp) || 0,
      }));

      const maxTemp = Math.max(...temps.map((t) => t.day));
      const minTemp = Math.min(...temps.map((t) => t.night));
      const tempDiff = maxTemp - minTemp;

      // 温度建议
      if (tempDiff > 15) {
        tips.push(`温差较大（${tempDiff}℃），建议穿层次丰富的衣物`);
      } else if (maxTemp > 30) {
        tips.push("气温较高，建议携带防晒用品和多补水");
      } else if (minTemp < 5) {
        tips.push("气温较低，请注意保暖，建议携带厚外套");
      }

      // 分析天气类型
      const weatherTypes = new Set();
      forecasts.forEach((f) => {
        if (f.dayWeather) weatherTypes.add(f.dayWeather);
        if (f.nightWeather) weatherTypes.add(f.nightWeather);
      });

      const weatherArray = Array.from(weatherTypes);
      const hasRain = weatherArray.some((w) => w.includes("雨"));
      const hasSnow = weatherArray.some((w) => w.includes("雪"));
      const hasStorm = weatherArray.some((w) => w.includes("雷") || w.includes("暴"));

      // 根据季节和天气给出合理建议
      const currentMonth = new Date().getMonth() + 1; // 1-12
      const isSummer = currentMonth >= 6 && currentMonth <= 8;

      if (hasRain && !hasSnow) {
        tips.push("有降雨天气，建议携带雨具");
      } else if (hasSnow && !isSummer) {
        tips.push("有降雪天气，建议携带保暖衣物和防滑鞋");
      } else if (hasStorm) {
        tips.push("有雷暴天气，建议避免户外活动，注意安全");
      }

      // 风力建议
      const hasStrongWind = forecasts.some((f) => {
        const power = parseInt(f.dayPower) || 0;
        return power >= 4;
      });

      if (hasStrongWind) {
        tips.push("风力较大，户外活动请注意安全");
      }

      // 如果没有特殊建议，给出通用建议
      if (tips.length === 0) {
        if (weatherArray.some((w) => w.includes("晴"))) {
          tips.push("天气良好，适合户外活动和观光");
        } else {
          tips.push("天气平稳，适合按计划进行行程");
        }
      }

      return tips;
    };

    // 检查行程天数是否超出天气预报范围
    const getTripDaysExceedForecast = () => {
      if (
        !props.weatherSuggestion ||
        !props.weatherSuggestion.forecast ||
        !tripForm.value.days
      ) {
        return false;
      }

      return tripForm.value.days > props.weatherSuggestion.forecast.length;
    };

    // 检查天气预报是否严重过时（行程天数超过预报天数的2倍以上）
    const isForecastOutdated = () => {
      if (
        !props.weatherSuggestion ||
        !props.weatherSuggestion.forecast ||
        !tripForm.value.days
      ) {
        return false;
      }

      const forecastDays = props.weatherSuggestion.forecast.length;
      return tripForm.value.days > forecastDays * 2;
    };

    // 检查用户选择的日期范围是否完全超出天气预报范围
    const isDateRangeOutOfForecast = () => {
      if (
        !props.weatherSuggestion ||
        !props.weatherSuggestion.forecast ||
        !tripForm.value.dateRange ||
        tripForm.value.dateRange.length !== 2
      ) {
        return false;
      }

      try {
        const userStartDate = new Date(tripForm.value.dateRange[0]);
        const userEndDate = new Date(tripForm.value.dateRange[1]);

        // 获取天气预报的日期范围
        const forecastDates = props.weatherSuggestion.forecast.map(
          (f) => new Date(f.date)
        );
        const forecastStartDate = new Date(Math.min(...forecastDates));
        const forecastEndDate = new Date(Math.max(...forecastDates));

        // 检查用户的日期范围是否完全超出预报范围
        return userStartDate > forecastEndDate || userEndDate < forecastStartDate;
      } catch (error) {
        console.error("日期范围检查错误:", error);
        return false;
      }
    };

    // 检查天气是否应该显示为失效状态
    const isWeatherDisabled = () => {
      return isDateRangeOutOfForecast() || isForecastOutdated();
    };

    return {
      tripForm,
      tripFormRef,
      tripRules,
      availableCities,
      budgetOptions,
      selectBudget,
      calculateBudgetPreview,
      disabledDate,
      handleDateChange,
      formatDateRange,
      getDaysDescription,
      budgetRecommendation,
      isRecommendedBudget,
      applyRecommendedBudget,
      getBudgetDailyAmount,
      shouldShowBudgetSummary,
      goToNextStep,
      dateRangeError,
      getWeatherSourceText,
      getWeatherValidityText,
      getWeatherTagType,
      getWeatherEmoji,
      getSmartTravelTips,
      getTripDaysExceedForecast,
      isForecastOutdated,
      isDateWithinForecastRange,
      isDateRangeOutOfForecast,
      isWeatherDisabled,
    };
  },
};
</script>

<style scoped>
/* 整体布局 */
.step-content {
  padding: 24px;
  background: #fff;
  min-height: 100vh;
}

/* 页面标题区域 */
.page-title {
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  color: white;
  padding: 32px 24px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
}

.page-title::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="a" cx="50" cy="50" r="50"><stop offset="0" stop-color="white" stop-opacity="0.1"/><stop offset="1" stop-color="white" stop-opacity="0.05"/></radialGradient></defs><rect width="100" height="20" fill="url(%23a)"/></svg>');
  opacity: 0.3;
}

.title-content {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.title-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  backdrop-filter: blur(10px);
}

.title-text .main-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title-text .subtitle {
  font-size: 16px;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
}

/* 表单区域 */
.form-sections {
  padding: 0;
  width: 100%;
  max-width: none;
  margin: 0 auto;
}

/* 表单分区样式 */
.form-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8eaed;
  transition: all 0.3s ease;
  width: 100%;
  max-width: none;
}

.form-section:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 分区标题 */
.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f2f5;
  position: relative;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(135deg, #91a8d0, #f7cac9);
  border-radius: 1px;
}

.section-title .el-icon {
  color: #91a8d0;
  font-size: 24px;
}

.section-subtitle {
  font-size: 14px;
  color: #909399;
  font-weight: 400;
  margin-left: auto;
}

/* 天气区域特殊样式 */
.weather-section {
  transition: all 0.5s ease;
}

.weather-section.weather-disabled {
  background: #f5f5f5;
  opacity: 0.7;
  filter: grayscale(50%);
  position: relative;
}

.weather-section.weather-disabled::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(0, 0, 0, 0.02) 10px,
    rgba(0, 0, 0, 0.02) 20px
  );
  border-radius: 16px;
  pointer-events: none;
  z-index: 1;
}

.weather-section.weather-disabled .section-title {
  color: #909399;
}

.weather-section.weather-disabled .section-title .el-icon {
  color: #c0c4cc;
}

/* 天气失效提示 */
.weather-disabled-notice {
  background: linear-gradient(135deg, #fef0f0 0%, #fef5f5 100%);
  border: 1px solid #f8c2c2;
  border-left: 4px solid #f56c6c;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #c45656;
  line-height: 1.5;
}

.weather-disabled-notice .el-icon {
  color: #f56c6c;
  font-size: 18px;
  flex-shrink: 0;
}

/* 表单元素样式 */
.form-tip {
  font-size: 13px;
  color: #909399;
  margin-top: 0px;
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 4px;
}

.selected-city-info {
  margin-top: 8px;
}

.days-text {
  font-size: 13px;
  color: #91a8d0;
  font-weight: 500;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-match {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #67c23a;
  font-size: 12px;
}

.date-mismatch {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #f56c6c;
  font-size: 12px;
}

.date-mismatch .el-button {
  margin-left: 8px;
}

/* 天气预报样式 */
.weather-content {
  position: relative;
  z-index: 2;
}

.weather-loading,
.weather-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  font-size: 15px;
  border-radius: 12px;
  margin: 20px 0;
}

.weather-loading {
  background: #fafbfc;
  color: #91a8d0;
}

.weather-error {
  background: #fef0f0;
  color: #f56c6c;
}

.weather-forecast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin: 20px 0;
}

.forecast-card {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
}

.forecast-card:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 15px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.forecast-card.today {
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fa 100%);
  border-color: #91a8d0;
}

.forecast-card.today::before {
  content: "今日";
  position: absolute;
  top: -8px;
  right: -8px;
  background: #91a8d0;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
}

.forecast-date .date-text {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
}

.forecast-date .week-text {
  font-size: 11px;
  color: #909399;
}

.weather-icon-large {
  font-size: 32px;
  margin: 12px 0 8px;
  line-height: 1;
}

.weather-desc {
  font-size: 12px;
  color: #606266;
  margin-bottom: 8px;
}

.temp-high {
  font-size: 16px;
  font-weight: 700;
  color: #e6a23c;
  margin-bottom: 2px;
}

.temp-low {
  font-size: 12px;
  color: #909399;
}

.wind-info {
  font-size: 11px;
  color: #909399;
  background: white;
  border: 1px solid #e4e7ed;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-block;
  margin-top: 8px;
}

.weather-summary {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 16px;
  margin: 20px 0;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.summary-label {
  font-size: 12px;
  color: #909399;
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  color: #91a8d0;
}

.weather-tips {
  background: linear-gradient(135deg, #fff7e6 0%, #fffbf0 100%);
  border: 1px solid #ffe7ba;
  border-left: 4px solid #e6a23c;
  border-radius: 12px;
  padding: 16px 20px;
  margin: 20px 0;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.tips-title {
  font-weight: 600;
  color: #d46b08;
}

.tips-content {
  font-size: 14px;
  color: #d46b08;
  line-height: 1.5;
}

/* 预算选择器样式 */
.budget-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
  margin: 20px 0;
}

.budget-card {
  position: relative;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.budget-card:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 20px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.budget-card.selected {
  border-color: #91a8d0;
  background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
  box-shadow: 0 6px 20px rgba(145, 168, 208, 0.2);
}

.budget-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #91a8d0, #f7cac9);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: white;
  font-size: 24px;
  transition: all 0.3s ease;
}

.budget-card.selected .budget-icon {
  background: linear-gradient(135deg, #f7cac9, #91a8d0);
  transform: scale(1.1);
}

.budget-content {
  flex: 1;
}

.budget-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.budget-price {
  font-size: 16px;
  font-weight: 700;
  color: #91a8d0;
  margin-bottom: 8px;
}

.budget-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 16px;
}

.budget-preview {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 16px;
}

.preview-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.preview-amount {
  font-size: 16px;
  font-weight: 700;
  color: #e6a23c;
}

.budget-check {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 28px;
  height: 28px;
  background: #67c23a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
}

.budget-summary {
  margin-top: 16px;
  padding: 16px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #91a8d0;
}

.budget-info-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.budget-label {
  font-size: 14px;
  color: #909399;
}

.budget-value {
  font-size: 14px;
  color: #91a8d0;
  font-weight: 600;
}

.budget-total {
  font-size: 15px;
  color: #67c23a;
  font-weight: 700;
  margin-left: auto;
}

/* 偏好提示横条 */
.preference-hint-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #f0f9eb 0%, #f7fdf2 100%);
  border: 1px solid #d9f7be;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  color: #52c41a;
  font-size: 14px;
}

.preference-hint-banner .el-icon {
  color: #52c41a;
  font-size: 18px;
}

/* 操作按钮区域 */
.step-actions {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8eaed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.action-left {
  flex: 0 0 auto;
}

.action-right {
  flex: 0 0 auto;
}

.step-actions .el-button {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  min-width: 120px;
  transition: all 0.3s ease;
}

.step-actions .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 天数选择相关样式 */
.days-input-container {
  width: 100%;
}

.quick-days-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}

.quick-days-buttons .el-button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.quick-days-buttons .el-button-group .el-button {
  margin: 0;
  border-radius: 6px;
  font-size: 13px;
  padding: 8px 16px;
  transition: all 0.3s ease;
}

.quick-days-buttons .el-button-group .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.2);
}

.custom-days-trigger {
  color: #409eff;
}

.custom-days-input {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-to-quick {
  color: #909399;
}

.days-description {
  margin-top: 8px;
  color: #606266;
  font-size: 13px;
}

.preference-hint-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0f9eb;
  border-radius: 4px;
  padding: 10px 16px;
  margin-bottom: 16px;
  color: #67c23a;
}

.next-step-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.selected-city-info {
  margin-top: 8px;
  margin-left: 10px;
}

/* 天气预览卡片样式 - 采用项目统一设计风格 */
.weather-preview-card {
  margin-top: 16px;
  margin-left: 10px;
  background: #ffffff;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

/* 独立天气预览卡片样式 - 占满整行 */
.weather-preview-card-standalone {
  margin: 20px 0;
  background: #ffffff;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.weather-preview-card:hover,
.weather-preview-card-standalone:hover {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.weather-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #409eff;
  font-size: 14px;
  padding: 16px 0;
}

.weather-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #f56c6c;
  font-size: 14px;
  padding: 16px 0;
}

.weather-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.weather-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.weather-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
}

.weather-title-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.weather-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  line-height: 1.3;
}

.weather-validity {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.weather-validity .el-icon {
  color: #606266;
}

.weather-source-tag {
  flex-shrink: 0;
}

.weather-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.weather-main-info {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.weather-main-info:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.weather-condition {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.weather-desc {
  font-size: 16px;
  color: #409eff;
  font-weight: 600;
}

.weather-temp {
  font-size: 18px;
  color: #67c23a;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.weather-details {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.weather-detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #606266;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  padding: 6px 10px;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.weather-detail-item:hover {
  border-color: #409eff;
  background: #f0f7ff;
}

.weather-detail-item .el-icon {
  color: #409eff;
}

.weather-tips {
  background: linear-gradient(135deg, #fff7e6 0%, #fffbf0 100%);
  border: 1px solid #ffe7ba;
  border-left: 4px solid #e6a23c;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  transition: all 0.3s ease;
}

.weather-tips.forecast-outdated {
  opacity: 0.5;
  filter: grayscale(60%);
  background: linear-gradient(135deg, #f5f5f5 0%, #f0f0f0 100%);
  border-color: #d3d3d3;
  border-left-color: #999999;
}

.weather-tips .el-icon {
  color: #e6a23c;
  font-size: 16px;
  margin-top: 1px;
  flex-shrink: 0;
}

.weather-tips span {
  font-size: 13px;
  color: #d46b08;
  line-height: 1.4;
}

/* 移动端响应式样式 */
@media (max-width: 1024px) {
  .form-sections {
    padding: 0 16px 24px;
  }

  .form-section {
    padding: 24px;
    margin-bottom: 24px;
  }

  .budget-selector {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .page-title {
    padding: 24px 16px;
    margin-bottom: 24px;
  }

  .title-content {
    gap: 12px;
  }

  .title-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .title-text .main-title {
    font-size: 24px;
  }

  .title-text .subtitle {
    font-size: 14px;
  }

  .form-section {
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 18px;
    margin-bottom: 20px;
    padding-bottom: 12px;
  }

  .section-title .el-icon {
    font-size: 20px;
  }

  .budget-card {
    padding: 20px;
    min-height: 140px;
  }

  .budget-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
    margin-bottom: 12px;
  }

  .budget-title {
    font-size: 16px;
  }

  .budget-price {
    font-size: 14px;
  }

  .budget-desc {
    font-size: 13px;
  }

  .budget-info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .budget-total {
    margin-left: 0;
    font-size: 14px;
  }

  .weather-forecast-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .forecast-card {
    padding: 12px;
  }

  .weather-icon-large {
    font-size: 24px;
    margin: 8px 0 6px;
  }

  .temp-high {
    font-size: 14px;
  }

  .forecast-date .date-text {
    font-size: 12px;
  }

  .weather-summary {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }

  .summary-item {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }

  .step-actions {
    padding: 20px;
    margin-bottom: 24px;
    flex-direction: column;
    gap: 16px;
  }
  
  .action-left,
  .action-right {
    width: 100%;
    text-align: center;
  }
  
  .step-actions .el-button {
    width: 100%;
    min-width: auto;
  }

  .next-btn {
    height: 48px;
    padding: 0 32px;
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .page-title {
    padding: 20px 12px;
  }

  .form-sections {
    padding: 0 12px 20px;
  }

  .form-section {
    padding: 16px;
  }

  .section-title {
    font-size: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .section-subtitle {
    margin-left: 0;
  }

  .weather-forecast-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .forecast-card {
    padding: 10px;
  }

  .weather-icon-large {
    font-size: 20px;
    margin: 6px 0 4px;
  }

  .budget-card {
    padding: 16px;
  }

  .budget-icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .action-section {
    padding: 20px;
    justify-content: center;
  }

  .action-section .el-button {
    width: 100%;
  }
}
</style>
