<template>
  <div class="step-content">
    <el-card
class="info-card" shadow="hover"
>
      <template #header>
        <div class="card-header">
          <el-icon><MapLocation /></el-icon>
          <span>行程基础信息</span>
        </div>
      </template>

      <el-form
        ref="tripFormRef"
        :model="tripForm"
        :rules="tripRules"
        label-position="top"
      >
        <el-row :gutter="24">
          <!-- 目的地选择 -->
          <el-col :span="12">
            <el-form-item
label="目的地" prop="destination"
>
              <el-input
                v-model="tripForm.destinationName"
                placeholder="选择你想去的城市"
                size="large"
                style="width: 100%"
                disabled
              />
              <div class="selected-city-info">
                <el-tag type="success">
                  已选择: {{ tripForm.destinationName }}
                </el-tag>
              </div>
            </el-form-item>
          </el-col>

          <!-- 出行天数 -->
          <el-col :span="12">
            <el-form-item
label="出行天数" prop="days"
>
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
                <div v-if="tripForm.days"
class="days-description">
                  <span class="days-text">{{ getDaysDescription() }}</span>
                </div>
                <div class="form-tip">天数将根据您选择的日期范围自动计算</div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <!-- 出行日期 -->
          <el-col :span="12">
            <el-form-item
              label="出行日期"
              prop="dateRange"
              :error="dateRangeError"
            >
              <el-date-picker
                v-model="tripForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="large"
                style="width: 100%"
                format="YYYY年MM月DD日"
                value-format="YYYY-MM-DD"
                :disabled-date="disabledDate"
                :clearable="true"
                @change="handleDateChange"
              />
              <div class="form-tip">
                <template
                  v-if="tripForm.dateRange && tripForm.dateRange.length === 2"
                >
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
            <el-form-item
label="出行人数" prop="travelers"
>
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

        <!-- 天气预览卡片 - 独立一行 -->
        <el-row v-if="tripForm.destinationName && (loadingWeather || weatherError || weatherSuggestion)">
          <el-col :span="24">
            <div class="weather-preview-card-standalone">
              <!-- 天气加载状态 -->
              <div v-if="loadingWeather" class="weather-loading">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>正在获取天气信息...</span>
              </div>
              
              <!-- 天气错误状态 -->
              <div v-else-if="weatherError" class="weather-error">
                <el-icon><Warning /></el-icon>
                <span>{{ weatherError }}</span>
              </div>
              
              <!-- 天气信息显示 -->
              <div v-else-if="weatherSuggestion" class="weather-content">
                <div class="weather-header">
                  <div class="weather-icon">
                    <el-icon><Sunny /></el-icon>
                  </div>
                  <div class="weather-title-section">
                    <h4 class="weather-title">{{ tripForm.destinationName }}天气参考</h4>
                    <div class="weather-validity">
                      <el-icon><Calendar /></el-icon>
                      <span>{{ getWeatherValidityText() }}</span>
                    </div>
                  </div>
                  <el-tag 
                    :type="getWeatherTagType()" 
                    size="small" 
                    effect="plain"
                    class="weather-source-tag"
                  >
                    {{ getWeatherSourceText() }}
                  </el-tag>
                </div>
                
                <div class="weather-body">
                  <div class="weather-main-info">
                    <div class="weather-condition">
                      <span class="weather-desc">{{ weatherSuggestion.weatherDesc }}</span>
                      <span class="weather-temp">{{ weatherSuggestion.tempRange }}</span>
                    </div>
                    
                    <!-- 附加天气信息 -->
                    <div v-if="weatherSuggestion.humidity || weatherSuggestion.windDirection" class="weather-details">
                      <span v-if="weatherSuggestion.humidity" class="weather-detail-item">
                        <el-icon><Cloudy /></el-icon>
                        湿度 {{ weatherSuggestion.humidity }}
                      </span>
                      <span v-if="weatherSuggestion.windDirection" class="weather-detail-item">
                        <el-icon><WindPower /></el-icon>
                        {{ weatherSuggestion.windDirection }}{{ weatherSuggestion.windPower }}级
                      </span>
                    </div>
                  </div>
                  
                  <!-- 出行建议 -->
                  <div v-if="weatherSuggestion.tips && weatherSuggestion.tips.length > 0" class="weather-tips">
                    <div class="tips-header">
                      <el-icon><InfoFilled /></el-icon>
                      <span class="tips-title">出行建议</span>
                    </div>
                    <div class="tips-content">
                      {{ weatherSuggestion.tips.slice(0, 2).join('；') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-row>
          <!-- 预算范围 -->
          <el-col>
            <el-form-item
label="预算范围（每人每天）" prop="budget"
>
              <div
                v-if="userPreferences && userPreferences.budget"
                class="preference-hint-banner"
              >
                <el-icon><Star /></el-icon>
                <span
                  >基于您的偏好设置，推荐预算：¥{{
                    userPreferences.budget
                }}/天</span
                >
                <el-button
                  type="link"
                  size="small"
                  @click="applyRecommendedBudget"
                >
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
                  <div
                    v-if="tripForm.days && tripForm.travelers"
                    class="budget-preview"
                  >
                    <div class="preview-label">预计总花费</div>
                    <div class="preview-amount">
                      {{ calculateBudgetPreview(option.value) }}
                    </div>
                  </div>
                  <div
                    v-if="tripForm.budget === option.value"
                    class="budget-check"
                  >
                    <el-icon><Check /></el-icon>
                  </div>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="form-tip">
        <template v-if="tripForm.budget">
          已选择{{ getBudgetText() }}档位
          <span v-if="tripForm.days && tripForm.travelers">
            ，{{ tripForm.days }}天{{ tripForm.travelers }}人预计花费{{
              getEstimatedCost()
            }}
          </span>
        </template>
        <template v-else> 预算将影响景点、餐厅和住宿推荐 </template>
      </div>

      <!-- 下一步按钮 -->
      <div class="next-step-container">
        <el-button
type="primary" size="large"
@click="goToNextStep"
>
          下一步
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </el-card>
  </div>
</template>
<script>
import { ref, reactive, computed, watch, nextTick, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
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
  Cloudy,
  WindPower,
} from "@element-plus/icons-vue";

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
    Cloudy,
    WindPower,
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
  },
  emits: ["update:baseForm", "next-step", "formValid", "fetch-weather"],
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
          console.log(
            "✅ 应用用户预算偏好:",
            userBudget,
            "-> 档位:",
            budgetType,
          );
        }

        // 应用出行人数偏好（如果用户有家庭偏好）
        if (
          props.userPreferences.includeKidsActivities &&
          !tripForm.value.travelers
        ) {
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
      { deep: true },
    );

    // 监听props.baseForm的变化，同步到本地
    watch(
      () => props.baseForm,
      (newVal) => {
        if (JSON.stringify(newVal) !== JSON.stringify(tripForm.value)) {
          tripForm.value = { ...newVal };
        }
      },
      { deep: true },
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
      { deep: true },
    );

    // 可用城市列表 - 从API获取
    const availableCities = ref([]);
    const loadingCities = ref(false);

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
      travelers: [
        { required: true, message: "请填写出行人数", trigger: "blur" },
      ],
      budget: [
        { required: true, message: "请选择预算范围", trigger: "change" },
      ],
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
      console.log("🗓️ 日期范围变化:", newDateRange);
      console.log("🗓️ 当前目的地:", tripForm.value.destinationName);

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

        const actualDays =
          Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
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

    // 获取实际天数
    const getActualDays = computed(() => {
      if (!tripForm.value.dateRange || tripForm.value.dateRange.length !== 2) {
        return 0;
      }
      const startDate = new Date(tripForm.value.dateRange[0]);
      const endDate = new Date(tripForm.value.dateRange[1]);
      return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    });

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

    // 获取预算文本
    const getBudgetText = () => {
      const budgetMap = {
        budget: { text: "经济实惠", price: "约400元/天" },
        moderate: { text: "适中舒适", price: "约750元/天" },
        comfort: { text: "舒适便利", price: "约1000元/天" },
        luxury: { text: "豪华奢华", price: "约1500元/天" },
      };

      const option = budgetMap[tripForm.value.budget];
      if (!option) return "";

      return `${option.text}(${option.price})`;
    };

    // 应用推荐预算
    const applyRecommendedBudget = () => {
      if (budgetRecommendation.value) {
        tripForm.value.budget = budgetRecommendation.value;
        ElMessage.success(`已应用推荐预算：${getBudgetText()}`);
      }
    };

    // 获取预计总花费
    const getEstimatedCost = () => {
      if (
        !tripForm.value ||
        !tripForm.value.budget ||
        !tripForm.value.days ||
        !tripForm.value.travelers
      ) {
        return "计算中...";
      }

      const budgetMap = {
        budget: 400,
        moderate: 750,
        luxury: 1500,
      };
      const dailyBudget = budgetMap[tripForm.value.budget] || 750;
      const totalCost =
        dailyBudget * tripForm.value.days * tripForm.value.travelers;
      return `约 ¥${totalCost.toLocaleString()}`;
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
      console.log("🚀 TripBaseInfo组件挂载", props.baseForm);
      // 处理从父组件传递的目的地信息
      if (props.baseForm.destination && props.baseForm.destinationName) {
        console.log(
          `接收到父组件的目的地信息: ${props.baseForm.destinationName}(${props.baseForm.destination})`,
        );

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

    // 格式化特定日期
    const formatDayDate = (dayIndex) => {
      if (
        !tripForm.value.dateRange ||
        tripForm.value.dateRange.length !== 2 ||
        !tripForm.value.days
      ) {
        return `第${dayIndex + 1}天`;
      }

      try {
        const startDate = new Date(tripForm.value.dateRange[0]);
        const currentDate = new Date(startDate);

        if (isNaN(startDate.getTime())) {
          return `第${dayIndex + 1}天`;
        }

        currentDate.setDate(startDate.getDate() + dayIndex);

        const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
        const weekday = weekdays[currentDate.getDay()];

        return `第${dayIndex + 1}天 ${formatDate(currentDate)} (周${weekday})`;
      } catch (error) {
        console.error("日期格式化失败:", error);
        return `第${dayIndex + 1}天`;
      }
    };

    // 天气相关工具函数
    const getWeatherSourceText = () => {
      if (!props.weatherSuggestion) return '';
      
      if (props.weatherSuggestion.isHistorical) {
        if (props.weatherSuggestion.isFallback) {
          return '季节性参考';
        }
        return '历史气候数据';
      }
      return '高德实时数据';
    };

    const getWeatherValidityText = () => {
      if (!props.weatherSuggestion) return '';
      
      const today = new Date();
      const currentDate = today.toISOString().split('T')[0];
      
      if (props.weatherSuggestion.isHistorical) {
        return '基于历史同期气候特征预测';
      }
      
      // 实时数据的有效期计算
      return `数据更新时间：今日，预报范围：今日起3天内`;
    };

    const getWeatherTagType = () => {
      if (!props.weatherSuggestion) return 'info';
      
      if (props.weatherSuggestion.isHistorical) {
        return props.weatherSuggestion.isFallback ? 'warning' : 'info';
      }
      return 'success';
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
      getActualDays,
      budgetRecommendation,
      isRecommendedBudget,
      getBudgetText,
      applyRecommendedBudget,
      getEstimatedCost,
      goToNextStep,
      formatDayDate,
      dateRangeError,
      getWeatherSourceText,
      getWeatherValidityText,
      getWeatherTagType,
    };
  },
};
</script>

<style scoped>
/* 表单样式 */
.info-card {
  border-radius: 12px;
  margin-bottom: 24px;
}

.step-content {
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.city-option {
  display: flex;
  flex-direction: column;
}

.city-desc {
  font-size: 12px;
  color: #909399;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
  margin-left: 10px;
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

/* 预算选择器样式 */
.budget-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
  margin: 16px 0;
}

.budget-card {
  position: relative;
  background: #ffffff;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.budget-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.budget-card.selected {
  border-color: #409eff;
  background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.2);
}

.budget-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: white;
  font-size: 20px;
}

.budget-card.selected .budget-icon {
  background: linear-gradient(135deg, #67c23a, #409eff);
}

.budget-content {
  flex: 1;
}

.budget-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.budget-price {
  font-size: 15px;
  font-weight: 500;
  color: #409eff;
  margin-bottom: 8px;
}

.budget-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.4;
  margin-bottom: 12px;
}

.budget-preview {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 8px 12px;
  margin-top: 12px;
}

.preview-label {
  font-size: 11px;
  color: #909399;
  margin-bottom: 2px;
}

.preview-amount {
  font-size: 14px;
  font-weight: 600;
  color: #e6a23c;
}

.budget-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: #67c23a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
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

@media (max-width: 768px) {
  .budget-selector {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .budget-card {
    padding: 16px;
  }

  .budget-title {
    font-size: 15px;
  }

  .quick-days-buttons .el-button-group {
    width: 100%;
    justify-content: flex-start;
  }

  .quick-days-buttons .el-button-group .el-button {
    flex: 1;
    min-width: 60px;
    padding: 8px 4px;
    font-size: 12px;
  }

  .weather-preview-card {
    margin-left: 0;
    padding: 16px;
    border-radius: 8px;
  }

  .weather-preview-card-standalone {
    margin: 16px 0;
    padding: 16px;
    border-radius: 8px;
  }

  .weather-icon {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .weather-title {
    font-size: 14px;
  }

  .weather-validity {
    font-size: 11px;
  }

  .weather-condition {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .weather-desc {
    font-size: 14px;
  }

  .weather-temp {
    font-size: 16px;
  }

  .weather-details {
    gap: 8px;
  }

  .weather-detail-item {
    font-size: 12px;
    padding: 4px 8px;
  }

  .weather-tips span {
    font-size: 12px;
  }

  .weather-temp {
    font-size: 16px;
  }

  .weather-details {
    gap: 8px;
  }

  .weather-detail-item {
    font-size: 12px;
    padding: 4px 8px;
  }

  .tips-content {
    margin-left: 0;
    font-size: 12px;
  }
}
</style>
