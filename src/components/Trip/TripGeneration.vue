<template>
  <div class="step-content">
    <!-- AI提示词预览面板 -->
    <el-card class="ai-prompt-card" shadow="hover">
      <template #header>
        <div class="ai-prompt-header">
          <div class="header-left">
            <el-icon size="18">
              <MagicStick />
            </el-icon>
            <span>AI提示词预览</span>
            <el-tag size="small" :type="getPromptCompletionClass()">
              {{ getPromptCompletionText() }}
            </el-tag>
          </div>
          <div class="header-right">
            <el-tooltip content="查看完整提示词" placement="top">
              <el-button type="info" link @click="previewFullPrompt">
                <el-icon><ViewIcon /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </template>

      <div class="ai-prompt-content">
        <div v-if="!generating && !generatedTrip">
          <div class="generation-intro">
            <el-icon size="48" color="#409EFF">
              <MagicStick />
            </el-icon>
            <h3>准备生成您的专属行程</h3>
            <p>基于您的偏好和要求，AI将为您精心规划行程路线</p>
          </div>

          <div class="prompt-sections">
            <div class="prompt-section">
              <div class="section-header">
                <el-icon><MapLocation /></el-icon>
                <h4>基本信息</h4>
              </div>
              <div v-if="baseForm.destination && baseForm.days" class="prompt-text">
                为我规划一次前往<span class="highlight">{{ getSelectedCityName() }}</span
                >的 <span class="highlight">{{ baseForm.days }}天</span>行程， 共<span
                  class="highlight"
                  >{{ baseForm.travelers }}人</span
                >出行， 预算约<span class="highlight">{{ getBudgetText() }}</span
                >。 出行日期为<span class="highlight">{{
                  formatDateRange(baseForm.dateRange)
                }}</span
                >。
              </div>
              <div v-else class="prompt-placeholder">
                请填写基本信息（目的地、天数、日期等）
              </div>
            </div>

            <div class="prompt-section">
              <div class="section-header">
                <el-icon><User /></el-icon>
                <h4>个人偏好</h4>
              </div>
              <div v-if="hasUserPreferences" class="prompt-text">
                我的旅行偏好是<span class="highlight">{{
                  selectedPreferenceTags.join("、")
                }}</span
                >。
                <template v-if="currentUserPreferences.accommodationType">
                  住宿偏好<span class="highlight">{{
                    tagMapping[currentUserPreferences.accommodationType] ||
                    currentUserPreferences.accommodationType
                  }}</span
                  >。
                </template>
                <template v-if="currentUserPreferences.travelPace">
                  旅行节奏偏好<span class="highlight">{{
                    tagMapping[currentUserPreferences.travelPace] || currentUserPreferences.travelPace
                  }}</span
                  >。
                </template>
                <template
                  v-if="
                    currentUserPreferences.foodTastes && currentUserPreferences.foodTastes.length > 0
                  "
                >
                  饮食偏好<span class="highlight">{{
                    currentUserPreferences.foodTastes
                      .map((taste) => tagMapping[taste] || taste)
                      .join("、")
                  }}</span
                  >。
                </template>
              </div>
              <div v-else class="prompt-placeholder">
                未设置个人偏好，可以在"个人中心-偏好设置"中设置
              </div>
            </div>

            <div class="prompt-section">
              <div class="section-header">
                <el-icon><MagicStick /></el-icon>
                <h4>本次行程偏好</h4>
              </div>
              <div
                v-if="
                  preferenceForm.tripStyle ||
                  preferenceForm.intensity ||
                  preferenceForm.focusAreas.length > 0
                "
                class="prompt-text"
              >
                <template v-if="preferenceForm.tripStyle">
                  本次行程风格为<span class="highlight">{{
                    getTripStyleText(preferenceForm.tripStyle)
                  }}</span
                  >。
                </template>
                <template v-if="preferenceForm.intensity">
                  活动强度为<span class="highlight">{{
                    getIntensityText(preferenceForm.intensity)
                  }}</span
                  >。
                </template>
                <template
                  v-if="preferenceForm.focusAreas && preferenceForm.focusAreas.length > 0"
                >
                  重点体验<span class="highlight">{{
                    getFocusAreasText(preferenceForm.focusAreas)
                  }}</span
                  >。
                </template>
                <template
                  v-if="
                    preferenceForm.specialExperiences &&
                    preferenceForm.specialExperiences.length > 0
                  "
                >
                  希望特别体验<span class="highlight">{{
                    getSpecialExperiencesText(preferenceForm.specialExperiences)
                  }}</span
                  >。
                </template>
                <template v-if="preferenceForm.specialRequirements">
                  特殊需求：<span class="highlight">{{
                    preferenceForm.specialRequirements
                  }}</span>
                </template>
              </div>
              <div v-else class="prompt-placeholder">
                请在"个性化偏好"步骤中设置本次行程偏好
              </div>
            </div>

            <!-- 饮食禁忌部分 -->
            <div
              v-if="
                preferenceForm.dietaryRestrictions &&
                (preferenceForm.dietaryRestrictions.length > 0 ||
                  preferenceForm.customDietaryNotes)
              "
              class="prompt-section"
            >
              <div class="section-header">
                <el-icon><Food /></el-icon>
                <h4>饮食禁忌</h4>
              </div>
              <div class="prompt-text">
                <span
                  v-if="
                    preferenceForm.dietaryRestrictions &&
                    preferenceForm.dietaryRestrictions.length > 0
                  "
                  class="highlight"
                  >{{
                    getDietaryRestrictionsText(preferenceForm.dietaryRestrictions)
                  }}</span
                >
                <template v-if="preferenceForm.customDietaryNotes">
                  <template
                    v-if="
                      preferenceForm.dietaryRestrictions &&
                      preferenceForm.dietaryRestrictions.length > 0
                    "
                  >
                    ，
                  </template>
                  <span class="highlight">{{ preferenceForm.customDietaryNotes }}</span>
                </template>
              </div>
            </div>



            <!-- 天气建议部分 -->
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
                <el-tag 
                  v-else
                  size="small" 
                  type="success"
                  effect="plain"
                >
                  高德天气API
                </el-tag>
              </div>
              <div class="prompt-text">
                <!-- 日期在预报范围内的正常天气描述 -->
                <template v-if="isDateWithinForecastRange()">
                  <p>
                    <template v-if="weatherSuggestion.isHistorical">
                      基于历史气候数据，出行期间天气预计<span class="highlight">{{
                        weatherSuggestion.weatherDesc
                      }}</span
                      >， 气温<span class="highlight">{{ weatherSuggestion.tempRange }}</span
                      >。
                      <template v-if="weatherSuggestion.rainProbability">
                        降雨概率约<span class="highlight">{{ weatherSuggestion.rainProbability }}</span>。
                      </template>
                      <template v-if="weatherSuggestion.season">
                        <span class="highlight">{{ weatherSuggestion.season }}</span>时节特点明显。
                      </template>
                    </template>
                    <template v-else>
                      根据高德天气API实时数据，出行期间天气预计<span class="highlight">{{
                        weatherSuggestion.weatherDesc
                      }}</span
                      >， 气温<span class="highlight">{{ weatherSuggestion.tempRange }}</span
                      >。
                      <template v-if="weatherSuggestion.humidity">
                        湿度<span class="highlight">{{ weatherSuggestion.humidity }}</span>。
                      </template>
                      <template v-if="weatherSuggestion.windDirection && weatherSuggestion.windPower">
                        风向<span class="highlight">{{ weatherSuggestion.windDirection }}{{ weatherSuggestion.windPower }}级</span>。
                      </template>
                    </template>
                  </p>
                </template>
                
                <!-- 日期超出预报范围的说明 -->
                <template v-else>
                  <div class="weather-limitation-notice">
                    <template v-if="baseForm.days > (weatherSuggestion.forecast?.length || 0)">
                      <p class="notice-title">🌤️ 天气预报说明</p>
                      <p>您的<span class="highlight">{{ baseForm.days }}天</span>行程中，我们仅能提供前<span class="highlight">{{ weatherSuggestion.forecast?.length || 0 }}天</span>的准确天气预报。</p>
                      <template v-if="weatherSuggestion.forecast && weatherSuggestion.forecast.length > 0">
                        <p>已知的天气情况：<span class="highlight">{{ weatherSuggestion.weatherDesc }}</span>，气温<span class="highlight">{{ weatherSuggestion.tempRange }}</span>。</p>
                      </template>
                      <p class="notice-suggestion">超出预报范围的日期建议您关注当地实时天气预报，并准备适应性较强的衣物。</p>
                    </template>
                    <template v-else>
                      <p class="notice-title">⚠️ 天气预报说明</p>
                      <p>由于您选择的出行日期与当前天气预报时间范围不匹配，无法提供准确的天气预报。</p>
                      <p class="notice-suggestion">建议您在出行前关注目的地的实时天气预报。</p>
                    </template>
                  </div>
                </template>
                <template
                  v-if="
                    isDateWithinForecastRange() &&
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
                  v-if="weatherSuggestion.tips && weatherSuggestion.tips.length > 0 && isDateWithinForecastRange()"
                >
                  <p>
                    建议：<span class="highlight">{{
                      weatherSuggestion.tips.join("；")
                    }}</span
                    >。
                  </p>
                </template>
                <template
                  v-if="weatherSuggestion.avoid && weatherSuggestion.avoid.length > 0 && isDateWithinForecastRange()"
                >
                  <p>
                    注意事项：<span class="highlight">{{
                      weatherSuggestion.avoid.join("；")
                    }}</span
                    >。
                  </p>
                </template>
                
                <!-- 天气预报详情展示 -->
                <template v-if="weatherSuggestion.forecast && weatherSuggestion.forecast.length > 0">
                  <div class="weather-forecast">
                    <h5>
                      <el-icon><Calendar /></el-icon>
                      <template v-if="isDateWithinForecastRange()">
                        天气预报详情
                      </template>
                      <template v-else-if="baseForm.days > weatherSuggestion.forecast.length">
                        可获取的天气预报（前{{ weatherSuggestion.forecast.length }}天）
                      </template>
                      <template v-else>
                        参考天气预报
                      </template>
                      <el-tag v-if="weatherSuggestion.isHistorical" size="mini" type="info">
                        基于历史数据模拟
                      </el-tag>
                      <el-tag v-else size="mini" type="success">
                        高德API预报
                      </el-tag>
                      <el-tag v-if="!isDateWithinForecastRange()" size="mini" type="warning">
                        日期超出预报范围
                      </el-tag>
                    </h5>
                    <div class="forecast-list">
                      <div 
                        v-for="(day, index) in weatherSuggestion.forecast" 
                        :key="index"
                        class="forecast-item"
                        :class="{ 'forecast-outdated': !isDateWithinForecastRange() }"
                      >
                        <div class="forecast-date">{{ day.date }}</div>
                        <div class="forecast-weather">
                          <span class="day-weather">{{ day.dayWeather }}</span>
                          <span v-if="day.nightWeather && day.nightWeather !== day.dayWeather" class="night-weather">
                            / {{ day.nightWeather }}
                          </span>
                        </div>
                        <div class="forecast-temp">{{ day.dayTemp }}℃/{{ day.nightTemp }}℃</div>
                        <div v-if="day.dayWind || day.nightWind" class="forecast-wind">
                          <template v-if="day.dayWind">{{ day.dayWind }}{{ day.dayPower }}级</template>
                          <template v-if="day.nightWind && day.nightWind !== day.dayWind">
                            / {{ day.nightWind }}{{ day.nightPower }}级
                          </template>
                        </div>
                      </div>
                    </div>
                    <!-- 超出预报范围的提醒 -->
                    <template v-if="!isDateWithinForecastRange() && baseForm.days > weatherSuggestion.forecast.length">
                      <div class="forecast-limitation-notice">
                        <el-icon><Warning /></el-icon>
                        <span>第{{ weatherSuggestion.forecast.length + 1 }}天及之后的天气情况需要关注实时预报</span>
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
              <div class="prompt-text loading-text">正在获取天气数据，请稍候...</div>
            </div>

            <!-- 天气错误状态 -->
            <div v-else-if="weatherError" class="prompt-section">
              <div class="section-header">
                <el-icon><Warning /></el-icon>
                <h4>天气建议</h4>
              </div>
              <div class="prompt-text error-text">
                获取天气数据失败: {{ weatherError }}
              </div>
            </div>

            <div class="prompt-section">
              <div class="section-header">
                <el-icon><Location /></el-icon>
                <h4>必去景点</h4>
              </div>
              <div v-if="selectedAttractions.length > 0" class="prompt-text">
                必去景点：<span class="highlight">{{
                  selectedAttractions.map((a) => a.name).join("、")
                }}</span>
              </div>
              <div v-else class="prompt-placeholder">
                未选择必去景点，可以从推荐景点中添加
              </div>
            </div>

            <div class="prompt-section">
              <div class="section-header">
                <el-icon><Shop /></el-icon>
                <h4>必去餐厅</h4>
              </div>
              <div v-if="selectedRestaurants.length > 0" class="prompt-text">
                必去餐厅：<span class="highlight">{{
                  selectedRestaurants.map((r) => r.name).join("、")
                }}</span>
              </div>
              <div v-else class="prompt-placeholder">
                未选择必去餐厅，可以从推荐餐厅中添加
              </div>
            </div>
          </div>

          <div class="prompt-actions">
            <el-button
              type="success"
              size="large"
              @click="showFullPrompt"
            >
              <el-icon><ViewIcon /></el-icon>
              查看完整提示词
            </el-button>
            <el-button
              type="primary"
              size="large"
              :disabled="!canGenerateTrip"
              @click="generateTrip"
            >
              <el-icon><MagicStick /></el-icon>
              使用此提示词生成行程
            </el-button>
          </div>
        </div>

        <div v-if="generating" class="generating">
          <el-icon size="64" color="#409EFF" class="rotating">
            <Loading />
          </el-icon>
          <h3>AI正在为您生成行程...</h3>
          <p>{{ generationProgress }}</p>
          <el-progress :percentage="progressPercent" :stroke-width="8" />
        </div>

        <div v-if="generatedTrip && !generating" class="generation-complete">
          <el-icon size="48" color="#67C23A">
            <Check />
          </el-icon>
          <h3>行程生成完成！</h3>
          <p>
            为您推荐了 {{ generatedTrip?.attractions?.length || 0 }} 个景点和
            {{ generatedTrip?.restaurants?.length || 0 }} 家餐厅
          </p>
          <el-button type="primary" size="large" @click="$emit('next-step')">
            查看行程详情
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 步骤操作按钮 -->
    <div v-if="!generating && !generatedTrip" class="step-actions">
      <el-button size="large" @click="$emit('prev-step')">
        <el-icon><ArrowLeft /></el-icon>
        上一步
      </el-button>
    </div>

    <!-- 完整提示词弹窗 -->
    <el-dialog
      v-model="fullPromptVisible"
      title="完整AI生成提示词"
      width="80%"
      max-width="800px"
      :show-close="true"
      destroy-on-close
    >
      <div class="full-prompt-content">
        <div class="prompt-stats">
          <el-tag :type="getPromptCompletionClass()" size="large">
            {{ getPromptCompletionText() }} ({{ getPromptCompletionScore() }}/100)
          </el-tag>
          <el-button type="primary" @click="copyPromptToClipboard">
            <el-icon><DocumentCopy /></el-icon>
            复制提示词
          </el-button>
        </div>
        <div class="prompt-text-area">
          <pre>{{ fullPromptText }}</pre>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="fullPromptVisible = false">关闭</el-button>
          <el-button type="primary" @click="copyPromptAndClose">
            复制并关闭
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { computed, onMounted, watch, nextTick, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  MapLocation,
  User,
  MagicStick,
  Calendar,
  Loading,
  Check,
  Shop,
  Location,
  Food,
  Warning,
  Sunny,
  ArrowLeft,
  ArrowRight,
  View as ViewIcon,
  DocumentCopy,
} from "@element-plus/icons-vue";
import {
  tagMapping,
  focusAreaMapping,
  dietaryRestrictionMapping,
  tripStyleMapping,
  intensityMapping,
  specialExperienceMapping,
  getBudgetText as getBudgetTextUtil,
  getCityName,
} from "@/utils/tagMapping.js";
import { useUserStore } from "@/store/user.js";

export default {
  name: "TripGeneration",
  components: {
    MapLocation,
    User,
    MagicStick,
    Calendar,
    Loading,
    Check,
    Shop,
    Location,
    Food,
    Warning,
    Sunny,
    ArrowLeft,
    ArrowRight,
    ViewIcon,
    DocumentCopy,
  },
  props: {
    // 基础表单数据
    baseForm: {
      type: Object,
      required: true,
    },
    // 偏好表单数据
    preferenceForm: {
      type: Object,
      required: true,
    },
    // 用户偏好数据
    userPreferences: {
      type: Object,
      default: () => ({}),
    },
    // 选择的景点
    selectedAttractions: {
      type: Array,
      default: () => [],
    },
    // 选择的餐厅
    selectedRestaurants: {
      type: Array,
      default: () => [],
    },
    // 额外需求
    extraRequirements: {
      type: String,
      default: "",
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
    // 生成的行程
    generatedTrip: {
      type: Object,
      default: null,
    },
    // 生成状态
    generating: {
      type: Boolean,
      default: false,
    },
    // 生成进度
    generationProgress: {
      type: String,
      default: "",
    },
    // 进度百分比
    progressPercent: {
      type: Number,
      default: 0,
    },
  },
  emits: [
    "update:extraRequirements", 
    "update:generatedTrip",
    "update:generating",
    "update:generationProgress", 
    "update:progressPercent",
    "generation-complete", 
    "next-step", 
    "prev-step"
  ],
  setup(props, { emit }) {
    // 获取用户store
    const userStore = useUserStore();
    
    // 完整提示词弹窗显示状态
    const fullPromptVisible = ref(false);
    
    // 完整提示词文本
    const fullPromptText = ref("");
    
    // 注意：generatedTrip 通过 props 传递，直接使用 props.generatedTrip

    // 获取实时的用户偏好数据，优先使用store中的数据
    const currentUserPreferences = computed(() => {
      // 优先使用 props 传递的数据，如果没有则使用 store 中的数据
      const preferences = props.userPreferences || userStore.userPreferences;
      // 调试用：当前用户偏好数据
      return preferences;
    });

    // 计算用户偏好标签的中文显示
    const selectedPreferenceTags = computed(() => {
      const preferences = currentUserPreferences.value;
      if (!preferences) return [];
      
      const tags = [];

      // 从旅行类型标签中提取并转换为中文 - 兼容多种数据格式
      const travelTags = preferences.selectedTags || preferences.tags || [];
      if (Array.isArray(travelTags) && travelTags.length > 0) {
        travelTags.forEach((tag) => {
          const chineseTag = tagMapping[tag] || tag;
          tags.push(chineseTag);
        });
      }

      // 从其他各种偏好中提取标签
      const transports = preferences.selectedTransports || [];
      if (Array.isArray(transports) && transports.length > 0) {
        transports.forEach((transport) => {
          const chineseTag = tagMapping[transport];
          if (chineseTag) tags.push(chineseTag);
        });
      }

      // 住宿类型
      if (preferences.accommodationType) {
        const chineseTag = tagMapping[preferences.accommodationType];
        if (chineseTag) tags.push(chineseTag);
      }

      // 旅行节奏
      if (preferences.travelPace) {
        const chineseTag = tagMapping[preferences.travelPace];
        if (chineseTag) tags.push(chineseTag);
      }

      // 美食偏好
      const foodTastes = preferences.foodTastes || [];
      if (Array.isArray(foodTastes) && foodTastes.length > 0) {
        foodTastes.forEach((taste) => {
          const chineseTag = tagMapping[taste] || taste;
          tags.push(chineseTag);
        });
      }

      // MBTI 类型
      if (preferences.mbtiType) {
        tags.push(`MBTI: ${preferences.mbtiType}`);
      }

      // 调试用：解析的偏好标签
      return [...new Set(tags)].slice(0, 15);
    });

    // 判断用户是否有设置偏好 - 更全面的检查
    const hasUserPreferences = computed(() => {
      const preferences = currentUserPreferences.value;
      if (!preferences) return false;

      // 检查是否有任何偏好设置
      const hasPrefs = !!(
        (preferences.selectedTags?.length > 0) ||
        (preferences.tags?.length > 0) ||
        (preferences.selectedTransports?.length > 0) ||
        preferences.accommodationType ||
        preferences.travelPace ||
        (preferences.foodTastes?.length > 0) ||
        (preferences.dietaryRestrictions?.length > 0) ||
        preferences.mbtiType ||
        preferences.budget ||
        preferences.dailyBudget
      );

      // 调试用：用户是否有偏好设置
      return hasPrefs;
    });

    // 获取城市名称
    const getSelectedCityName = () => {
      return getCityName(props.baseForm?.destination, props.baseForm?.destinationName);
    };

    // 格式化日期范围显示
    const formatDateRange = () => {
      if (!props.baseForm.dateRange || props.baseForm.dateRange.length !== 2) {
        return "未设置";
      }
      const startDate = new Date(props.baseForm.dateRange[0]);
      const endDate = new Date(props.baseForm.dateRange[1]);
      return `${startDate.toLocaleDateString()} 至 ${endDate.toLocaleDateString()}`;
    };

    // 获取预算文本
    const getBudgetText = () => {
      return getBudgetTextUtil(props.baseForm.budget);
    };

    // 获取不同偏好的文本表示
    const getTripStyleText = (style) => {
      if (!style) return "";
      return tripStyleMapping[style] || style;
    };

    const getIntensityText = (intensity) => {
      if (!intensity) return "";
      return intensityMapping[intensity] || intensity;
    };

    const getFocusAreasText = (areas) => {
      if (!areas || areas.length === 0) return "";
      return areas.map((area) => focusAreaMapping[area] || area).join("、");
    };

    const getSpecialExperiencesText = (experiences) => {
      if (!experiences || experiences.length === 0) return "";
      return experiences.map((exp) => specialExperienceMapping[exp] || exp).join("、");
    };

    const getDietaryRestrictionsText = (restrictions) => {
      if (!restrictions || restrictions.length === 0) return "";
      return restrictions.map((r) => dietaryRestrictionMapping[r] || r).join("、");
    };





    // 生成提示词完整度评估
    const getPromptCompletionScore = () => {
      let score = 0;

      // 基本信息 (40分)
      if (props.baseForm.destination) score += 10;
      if (props.baseForm.days) score += 10;
      if (props.baseForm.dateRange && props.baseForm.dateRange.length === 2) score += 10;
      if (props.baseForm.budget) score += 10;

      // 个人偏好 (20分)
      if (currentUserPreferences.value && selectedPreferenceTags.value.length > 0) score += 10;
      if (currentUserPreferences.value && currentUserPreferences.value.travelPace) score += 5;
      if (
        currentUserPreferences.value &&
        currentUserPreferences.value.foodTastes &&
        currentUserPreferences.value.foodTastes.length > 0
      )
        score += 5;

      // 本次行程偏好 (30分)
      if (props.preferenceForm.tripStyle) score += 10;
      if (props.preferenceForm.intensity) score += 10;
      if (props.preferenceForm.focusAreas && props.preferenceForm.focusAreas.length > 0)
        score += 10;

      // 必去景点和餐厅 (10分)
      if (props.selectedAttractions.length > 0) score += 5;
      if (props.selectedRestaurants.length > 0) score += 5;

      return score;
    };

    // 获取提示词完成度样式
    const getPromptCompletionClass = () => {
      const score = getPromptCompletionScore();
      if (score >= 80) return "success";
      if (score >= 50) return "warning";
      return "danger";
    };

    // 获取提示词完成度文本
    const getPromptCompletionText = () => {
      const score = getPromptCompletionScore();
      if (score >= 80) return "完善度高";
      if (score >= 50) return "基本完善";
      return "需完善";
    };

    // 生成完整提示词文本
    const generatePromptText = () => {
      let prompt = "";

      // 基本信息
      if (props.baseForm.destination && props.baseForm.days) {
        prompt += `为我规划一次前往${getSelectedCityName()}的${
          props.baseForm.days
        }天行程，共${props.baseForm.travelers}人出行，`;
        prompt += `预算约${getBudgetText()}。`;
        if (props.baseForm.dateRange && props.baseForm.dateRange.length === 2) {
          prompt += `出行日期为${formatDateRange()}。\n\n`;
        } else {
          prompt += "\n\n";
        }
      }

      // 个人偏好
      if (currentUserPreferences.value && selectedPreferenceTags.value.length > 0) {
        prompt += `我的旅行偏好是${selectedPreferenceTags.value.join("、")}。`;
        if (currentUserPreferences.value.accommodationType) {
          prompt += `住宿偏好${
            tagMapping[currentUserPreferences.value.accommodationType] ||
            currentUserPreferences.value.accommodationType
          }。`;
        }
        if (currentUserPreferences.value.travelPace) {
          prompt += `旅行节奏偏好${
            tagMapping[currentUserPreferences.value.travelPace] ||
            currentUserPreferences.value.travelPace
          }。`;
        }
        if (
          currentUserPreferences.value.foodTastes &&
          currentUserPreferences.value.foodTastes.length > 0
        ) {
          prompt += `饮食偏好${currentUserPreferences.value.foodTastes.map(taste => tagMapping[taste] || taste).join("、")}。`;
        }
        prompt += "\n\n";
      }

      // 本次行程偏好
      if (
        props.preferenceForm.tripStyle ||
        props.preferenceForm.intensity ||
        props.preferenceForm.focusAreas.length > 0
      ) {
        if (props.preferenceForm.tripStyle) {
          prompt += `本次行程风格为${getTripStyleText(props.preferenceForm.tripStyle)}。`;
        }
        if (props.preferenceForm.intensity) {
          prompt += `活动强度为${getIntensityText(props.preferenceForm.intensity)}。`;
        }
        if (props.preferenceForm.focusAreas.length > 0) {
          prompt += `重点体验${getFocusAreasText(props.preferenceForm.focusAreas)}。`;
        }
        if (
          props.preferenceForm.specialExperiences &&
          props.preferenceForm.specialExperiences.length > 0
        ) {
          prompt += `希望特别体验${getSpecialExperiencesText(
            props.preferenceForm.specialExperiences
          )}。`;
        }
        if (props.preferenceForm.specialRequirements) {
          prompt += `特殊需求：${props.preferenceForm.specialRequirements}。`;
        }
        prompt += "\n\n";
      }



      // 天气建议
      if (props.weatherSuggestion) {
        const isDateInRange = isDateWithinForecastRange();
        const tripDays = props.baseForm.days || 1;
        const forecastDays = props.weatherSuggestion.forecast ? props.weatherSuggestion.forecast.length : 0;
        
        // 根据日期范围和数据来源添加前缀说明
        if (isDateInRange) {
          // 日期在预报范围内
          if (props.weatherSuggestion.isHistorical) {
            prompt += `基于历史气候数据分析，出行期间天气预计${props.weatherSuggestion.weatherDesc}，气温${props.weatherSuggestion.tempRange}。`;
            
            // 如果有降雨概率信息，添加到提示中
            if (props.weatherSuggestion.rainProbability) {
              prompt += `降雨概率约${props.weatherSuggestion.rainProbability}。`;
            }
            
            // 添加季节信息
            if (props.weatherSuggestion.season) {
              prompt += `${props.weatherSuggestion.season}时节特点明显。`;
            }
          } else {
            prompt += `根据高德天气API实时数据，出行期间天气预计${props.weatherSuggestion.weatherDesc}，气温${props.weatherSuggestion.tempRange}。`;
            
            // 添加高德API提供的详细天气信息
            if (props.weatherSuggestion.humidity) {
              prompt += `湿度${props.weatherSuggestion.humidity}。`;
            }
            
            if (props.weatherSuggestion.windDirection && props.weatherSuggestion.windPower) {
              prompt += `风向${props.weatherSuggestion.windDirection}${props.weatherSuggestion.windPower}级。`;
            }
            
            // 如果有当前温度信息
            if (props.weatherSuggestion.currentTemp) {
              prompt += `当前温度${props.weatherSuggestion.currentTemp}℃。`;
            }
          }
        } else {
          // 日期超出预报范围，给出说明
          if (tripDays > forecastDays) {
            prompt += `🌤️ 天气预报说明：您的${tripDays}天行程中，我们仅能提供前${forecastDays}天的准确天气预报。`;
            if (props.weatherSuggestion.forecast && props.weatherSuggestion.forecast.length > 0) {
              prompt += `已知的天气情况：${props.weatherSuggestion.weatherDesc}，气温${props.weatherSuggestion.tempRange}。`;
            }
            prompt += `超出预报范围的日期建议您关注当地实时天气预报，并准备适应性较强的衣物。`;
          } else {
            prompt += `⚠️ 天气预报说明：由于您选择的出行日期与当前天气预报时间范围不匹配，无法提供准确的天气预报。建议您在出行前关注目的地的实时天气预报。`;
          }
        }

        // 只有在日期范围内时才添加活动建议
        if (isDateInRange && props.weatherSuggestion.activities && props.weatherSuggestion.activities.length > 0) {
          prompt += `适合安排${props.weatherSuggestion.activities.join("、")}等活动。`;
        }

        // 只有在日期范围内时才添加建议和注意事项
        if (isDateInRange && props.weatherSuggestion.tips && props.weatherSuggestion.tips.length > 0) {
          prompt += `建议：${props.weatherSuggestion.tips.join("；")}。`;
        }

        if (isDateInRange && props.weatherSuggestion.avoid && props.weatherSuggestion.avoid.length > 0) {
          prompt += `注意事项：${props.weatherSuggestion.avoid.join("；")}。`;
        }

        // 详细天气预报：根据日期覆盖情况调整
        if (props.weatherSuggestion.forecast && props.weatherSuggestion.forecast.length > 0) {
          if (isDateInRange) {
            prompt += `具体天气预报：`;
            const forecastSummary = props.weatherSuggestion.forecast.map(day => 
              `${day.date}${day.dayWeather}，${day.dayTemp}℃/${day.nightTemp}℃`
            ).join("；");
            prompt += forecastSummary + "。";
          } else if (tripDays > forecastDays) {
            // 部分日期有预报
            prompt += `可获取的天气预报（前${forecastDays}天）：`;
            const forecastSummary = props.weatherSuggestion.forecast.map(day => 
              `${day.date}${day.dayWeather}，${day.dayTemp}℃/${day.nightTemp}℃`
            ).join("；");
            prompt += forecastSummary + "。";
            prompt += `第${forecastDays + 1}天及之后的天气情况需要关注实时预报。`;
          }
        }

        // 如果完全没有可用预报，给出通用建议
        if (!isDateInRange && tripDays <= forecastDays) {
          prompt += `建议在行程规划时预留天气变化的应对方案，准备雨具和适合不同天气的衣物。`;
        }

        prompt += "\n\n";
      }

      // 饮食禁忌
      // 饮食禁忌
      if (
        props.preferenceForm.dietaryRestrictions &&
        (props.preferenceForm.dietaryRestrictions.length > 0 ||
          props.preferenceForm.customDietaryNotes)
      ) {
        prompt += "饮食禁忌：";
        if (
          props.preferenceForm.dietaryRestrictions &&
          props.preferenceForm.dietaryRestrictions.length > 0
        ) {
          prompt += getDietaryRestrictionsText(props.preferenceForm.dietaryRestrictions);
        }
        if (props.preferenceForm.customDietaryNotes) {
          if (
            props.preferenceForm.dietaryRestrictions &&
            props.preferenceForm.dietaryRestrictions.length > 0
          ) {
            prompt += "，";
          }
          prompt += props.preferenceForm.customDietaryNotes;
        }
        prompt += "。\n\n";
      }

      // 必去景点和餐厅
      if (props.selectedAttractions.length > 0) {
        prompt += `必去景点：${props.selectedAttractions
          .map((a) => a.name)
          .join("、")}。\n`;
      }
      if (props.selectedRestaurants.length > 0) {
        prompt += `必去餐厅：${props.selectedRestaurants
          .map((r) => r.name)
          .join("、")}。\n`;
      }

      // 添加专业的AI生成指导
      prompt += "\n\n请根据以上信息，为我生成一份详细的旅行计划，包括：\n";
      prompt += "1. 每日行程安排（包含具体时间、景点、餐厅、交通方式）\n";
      prompt += "2. 预算分配建议（门票、餐饮、交通、住宿等）\n";
      prompt += "3. 实用出行提示（最佳游览时间、避坑指南、当地文化注意事项）\n";
      prompt += "4. 备选方案（雨天室内活动、行程调整建议）\n";
      prompt += "5. 必备物品清单\n\n";
      
      prompt += "请确保：\n";
      prompt += "- 行程安排合理，时间充裕，避免过度紧张\n";
      prompt += "- 推荐的景点和餐厅具有当地特色和良好口碑\n";
      prompt += "- 考虑交通便利性和地理位置的合理性\n";
      prompt += "- 预算控制在指定范围内\n";
      prompt += "- 提供具体的地址、营业时间、门票价格等实用信息\n";
      prompt += "- 语言表达亲切自然，适合实际执行\n";

      return prompt;
    };

    // 检查用户选择的日期是否在天气预报范围内
    const isDateWithinForecastRange = () => {
      if (!props.weatherSuggestion || !props.weatherSuggestion.forecast || !props.baseForm.dateRange || !props.baseForm.dateRange.length) {
        return false;
      }
      
      const userStartDate = new Date(props.baseForm.dateRange[0]);
      const userEndDate = new Date(props.baseForm.dateRange[1]);
      
      // 获取天气预报的日期范围
      const forecastDates = props.weatherSuggestion.forecast.map(f => new Date(f.date));
      const forecastStartDate = new Date(Math.min(...forecastDates));
      const forecastEndDate = new Date(Math.max(...forecastDates));
      
      // 检查用户选择的日期是否与天气预报日期有重叠
      return userStartDate <= forecastEndDate && userEndDate >= forecastStartDate;
    };

    // 显示完整提示词弹窗
    const showFullPrompt = () => {
      fullPromptText.value = generatePromptText();
      fullPromptVisible.value = true;
      ElMessage({
        message: "完整提示词已生成，您可以复制后在AI工具中测试",
        type: "success",
        duration: 3000,
      });
    };

    // 复制提示词到剪贴板
    const copyPromptToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(fullPromptText.value);
        ElMessage({
          message: "提示词已复制到剪贴板！",
          type: "success",
          duration: 2000,
        });
      } catch (error) {
        // 如果现代API不可用，使用传统方法
        const textArea = document.createElement("textarea");
        textArea.value = fullPromptText.value;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          ElMessage({
            message: "提示词已复制到剪贴板！",
            type: "success",
            duration: 2000,
          });
        } catch (err) {
          ElMessage({
            message: "复制失败，请手动复制",
            type: "error",
            duration: 3000,
          });
        }
        document.body.removeChild(textArea);
      }
    };

    // 复制并关闭弹窗
    const copyPromptAndClose = async () => {
      await copyPromptToClipboard();
      fullPromptVisible.value = false;
    };

    // 检查是否可以生成行程
    const canGenerateTrip = computed(() => {
      return (
        props.baseForm.destination && props.baseForm.days && props.baseForm.travelers
      );
    });

    // 生成行程
    const generateTrip = async () => {
      if (!canGenerateTrip.value) {
        ElMessage.warning("请先完善基本信息");
        return;
      }

      try {
        // 通过emit通知父组件更新状态
        emit("update:generating", true);
        emit("update:generationProgress", "正在分析您的偏好...");
        emit("update:progressPercent", 0);



        // 构建AI请求数据
        const requestData = {
          // 基础信息
          destination: props.baseForm.destination,
          destinationName: getSelectedCityName(),
          days: props.baseForm.days,
          travelers: props.baseForm.travelers,
          budget: getBudgetText(),
          startDate: props.baseForm.dateRange?.[0],
          endDate: props.baseForm.dateRange?.[1],
          
          // 用户偏好
          travelTags: selectedPreferenceTags.value,
          transports: currentUserPreferences.value?.selectedTransports,
          accommodationType: currentUserPreferences.value?.accommodationType,
          travelPace: currentUserPreferences.value?.travelPace,
          foodTastes: currentUserPreferences.value?.foodTastes,
          dietaryRestrictions: props.preferenceForm.dietaryRestrictions,
          customDietaryNotes: props.preferenceForm.customDietaryNotes,
          
          // 行程偏好
          tripStyle: props.preferenceForm.tripStyle,
          intensity: props.preferenceForm.intensity,
          focusAreas: props.preferenceForm.focusAreas,
          specialExperiences: props.preferenceForm.specialExperiences,
          specialRequirements: props.preferenceForm.specialRequirements,
          
          // 必去景点和餐厅
          selectedAttractions: props.selectedAttractions?.map(a => ({
            name: a.name,
            description: a.description,
            address: a.address
          })),
          selectedRestaurants: props.selectedRestaurants?.map(r => ({
            name: r.name,
            description: r.description,
            address: r.address
          })),
          
          // 天气信息
          weatherInfo: props.weatherSuggestion ? {
            weatherDesc: props.weatherSuggestion.weatherDesc,
            tempRange: props.weatherSuggestion.tempRange,
            tips: props.weatherSuggestion.tips,
            avoid: props.weatherSuggestion.avoid,
            isHistorical: props.weatherSuggestion.isHistorical
          } : null,
          
          // 用户类型判断
          userType: determineUserType()
        };

        emit("update:generationProgress", "AI正在分析您的需求...");
        emit("update:progressPercent", 50);

        // 调用后端AI接口
        const response = await fetch('/api/ai/trip/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        });

        const result = await response.json();

        if (result.code === 200) {
          emit("update:generationProgress", "行程生成完成！");
          emit("update:progressPercent", 100);
          
          // 处理成功结果
          const tripData = {
            id: result.data.tripId,
            content: result.data.content,
            aiProvider: result.data.aiProvider,
            processingTime: result.data.processingTime,
            qualityScore: result.data.qualityScore,
            destinationInfo: result.data.destinationInfo,
            tripBasicInfo: result.data.tripBasicInfo
          };
          
          emit("update:generatedTrip", tripData);
          emit("generation-complete", tripData);
          
          ElMessage.success(`AI行程生成成功！质量评分：${result.data.qualityScore}/100，用时${Math.round(result.data.processingTime/1000)}秒`);
        } else {
          throw new Error(result.msg || '生成失败');
        }

      } catch (error) {
        console.error("生成行程失败:", error);
        emit("update:generationProgress", "生成失败");
        emit("update:progressPercent", 0);
        
        ElMessage.error(`生成行程失败: ${error.message}`);
      } finally {
        // 延迟一下再关闭loading，让用户看到完成状态
        setTimeout(() => {
          emit("update:generating", false);
        }, 2000);
      }
    };

    // 判断用户类型的辅助方法
    const determineUserType = () => {
      if (props.baseForm.travelers > 2) return "FAMILY";
      if (props.baseForm.travelers === 2) return "COUPLE";
      return "INDIVIDUAL";
    };

    // 创建优化的每日计划 (简化版)
    const createOptimizedDailyPlan = (attractions, restaurants) => {
      const days = props.baseForm.days || 1;
      const plans = [];

      // 简单分配景点和餐厅
      for (let dayIndex = 0; dayIndex < days; dayIndex++) {
        const activities = [];

        // 上午景点
        if (attractions[dayIndex % attractions.length]) {
          const attraction = attractions[dayIndex % attractions.length];
          activities.push({
            time: "09:00",
            name: attraction.name,
            description: attraction.description || "精彩景点等你探索",
            tags: attraction.tags || ["景点"],
            type: "attraction",
            data: attraction,
          });
        }

        // 午餐
        if (restaurants[dayIndex % restaurants.length]) {
          const restaurant = restaurants[dayIndex % restaurants.length];
          activities.push({
            time: "12:00",
            name: restaurant.name,
            description: restaurant.description || "美味佳肴等你品尝",
            tags: restaurant.tags || ["餐厅"],
            type: "restaurant",
            data: restaurant,
          });
        }

        // 下午景点 (如果有足够的景点)
        if (attractions[(dayIndex + 1) % attractions.length]) {
          const attraction = attractions[(dayIndex + 1) % attractions.length];
          activities.push({
            time: "14:30",
            name: attraction.name,
            description: attraction.description || "精彩景点等你探索",
            tags: attraction.tags || ["景点"],
            type: "attraction",
            data: attraction,
          });
        }

        plans.push({ activities });
      }

      return plans;
    };

    // 分析用户偏好
    const analyzePreferences = async () => {
      // 分析用户偏好中...
      return Promise.resolve();
    };

    // 获取景点数据 (简化版)
    const fetchAttractions = async () => {
      return {
        attractions: [
          {
            id: "1",
            name: "故宫博物院",
            description:
              "中国明清两代的皇家宫殿，世界上现存规模最大、保存最为完整的木质结构古建筑之一。",
            rating: "4.8",
            tags: ["历史古迹", "博物馆", "宫殿"],
          },
          {
            id: "2",
            name: "长城",
            description: "中国古代的伟大防御工程，是中华民族的象征之一。",
            rating: "4.9",
            tags: ["历史古迹", "自然风光", "世界遗产"],
          },
          {
            id: "3",
            name: "颐和园",
            description:
              "中国清朝时期的皇家园林，以昆明湖、万寿山为基址，以杭州西湖为蓝本。",
            rating: "4.7",
            tags: ["园林", "湖泊", "历史景点"],
          },
        ],
      };
    };

    // 获取餐厅数据 (简化版)
    const fetchRestaurants = async () => {
      return {
        restaurants: [
          {
            id: "1",
            name: "全聚德烤鸭店",
            description: "北京著名的烤鸭老字号，以其独特的挂炉烤鸭而闻名。",
            rating: "4.6",
            tags: ["中餐", "烤鸭", "老字号"],
          },
          {
            id: "2",
            name: "南锣鼓巷小吃街",
            description: "汇集了众多北京传统小吃的美食街区。",
            rating: "4.5",
            tags: ["小吃", "传统美食", "街区"],
          },
        ],
      };
    };

    // 优化路线
    const optimizeRoute = async () => {
      // 优化路线中...
      return Promise.resolve();
    };

    // 构建每日计划
    const buildDailyPlan = async () => {
      // 构建每日计划中...
      return Promise.resolve();
    };

    // 注意：generating, generationProgress, progressPercent 这些状态通过 props 传递，不需要在这里定义

    // 组件挂载时的处理
    onMounted(async () => {
      // TripGeneration组件挂载
      
      // 如果用户已登录但没有偏好数据，尝试从API获取
      if (userStore.isLoggedIn && (!props.userPreferences || Object.keys(props.userPreferences).length === 0)) {
        try {
          // 尝试获取用户偏好数据
          await userStore.fetchUserPreferences();
          
          // 等待下一个tick确保数据更新完成
          await nextTick();
          // 用户偏好数据获取完成
        } catch (error) {
          // 获取用户偏好数据失败
        }
      }
    });

    // 监听用户偏好数据变化
    watch(
      () => [props.userPreferences, userStore.userPreferences],
      () => {
        // 监听到偏好数据变化，可以在这里处理数据更新逻辑
        // 数据自动通过computed响应式更新
      },
      { deep: true, immediate: true }
    );

    return {
      generatePromptText,
      showFullPrompt,
      copyPromptToClipboard,
      copyPromptAndClose,
      fullPromptVisible,
      fullPromptText,
      getPromptCompletionClass,
      getPromptCompletionText,
      getPromptCompletionScore,
      canGenerateTrip,
      generateTrip,
      getSelectedCityName,
      formatDateRange,
      getBudgetText,
      getTripStyleText,
      getIntensityText,
      getFocusAreasText,
      getSpecialExperiencesText,
      getDietaryRestrictionsText,
      selectedPreferenceTags,
      hasUserPreferences,
      currentUserPreferences,
      tagMapping,
      isDateWithinForecastRange,
    };
  },
};
</script>

<style scoped>
.ai-prompt-card {
  border-radius: 8px;
  margin-bottom: 24px;
}

.ai-prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-prompt-content {
  padding: 0;
}

.generation-intro {
  text-align: center;
  margin-bottom: 24px;
  padding: 24px 0;
}

.generation-intro h3 {
  margin: 16px 0 8px;
  font-weight: 600;
}

.generation-intro p {
  color: #606266;
}

.prompt-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
}

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

.prompt-placeholder {
  color: #c0c4cc;
  font-style: italic;
  font-size: 14px;
}

.highlight {
  color: #409eff;
  font-weight: 500;
}

.error-text {
  color: #f56c6c;
}

.loading-text {
  color: #909399;
}

.prompt-actions {
  text-align: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.generating {
  text-align: center;
  padding: 40px 20px;
}

.generating h3 {
  margin: 16px 0 8px;
  font-weight: 600;
}

.generating p {
  margin-bottom: 24px;
  color: #606266;
}

.rotating {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.generation-complete {
  text-align: center;
  padding: 40px 20px;
}

.generation-complete h3 {
  margin: 16px 0 8px;
  font-weight: 600;
  color: #67c23a;
}

.generation-complete p {
  color: #606266;
}

.step-content {
  width: 100%;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

/* 天气预报样式 */
.weather-forecast {
  margin-top: 12px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #409eff;
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
  color: #409eff;
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

/* 天气限制通知样式 */
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

/* 过时天气预报样式 */
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

/* 预报限制提醒样式 */
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
  .prompt-section {
    padding: 12px;
  }

  .prompt-text {
    font-size: 13px;
  }

  .generating,
  .generation-complete {
    padding: 20px 12px;
  }

  .weather-forecast {
    padding: 8px;
  }

  .forecast-item {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 4px;
    font-size: 11px;
  }

  .forecast-date {
    font-size: 10px;
  }

  .forecast-wind {
    display: none; /* 在小屏幕上隐藏风力信息以节省空间 */
  }
}

/* 完整提示词弹窗样式 */
.full-prompt-content {
  min-height: 400px;
}

.prompt-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.prompt-text-area {
  background: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.prompt-text-area pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #2c3e50;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .prompt-stats {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .prompt-text-area {
    max-height: 300px;
    padding: 12px;
  }
  
  .prompt-text-area pre {
    font-size: 13px;
  }
}
</style>
