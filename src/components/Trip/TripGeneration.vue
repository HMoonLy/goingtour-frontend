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
            <span>{{ t('trip.aiPrompt.preview') }}</span>
            <el-tag size="small" :type="getPromptCompletionClass()">
              {{ getPromptCompletionText() }}
            </el-tag>
          </div>
          <div class="header-right">
            <el-tooltip :content="t('trip.aiPrompt.viewFull')" placement="top">
              <el-button type="info" link @click="showFullPrompt">
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
            <h3>{{ t('trip.prepareGenerate') }}</h3>
            <p>{{ t('trip.prepareGenerateDesc') }}</p>
          </div>

          <div class="prompt-sections">
            <div class="prompt-section">
              <div class="section-header">
                <el-icon><MapLocation /></el-icon>
              <h4>{{ t('trip.baseInfo.title') }}</h4>
              </div>
              <div v-if="baseForm.destination && baseForm.days" class="prompt-text">
                为我规划一次前往
                <span class="highlight">{{ getSelectedCityName() }}</span>
                的 <span class="highlight">{{ baseForm.days }}天</span>行程， 共
                <span class="highlight">{{ baseForm.travelers }}人</span>
                出行， 预算约
                <span class="highlight">{{ getBudgetText() }}</span>
                。出行日期为
                <span class="highlight">{{ formatDateRange(baseForm.dateRange) }}</span
                >。
              </div>
              <div v-else class="prompt-placeholder">
                {{ t('trip.fillBasicInfo') }}
              </div>
            </div>

            <div class="prompt-section">
              <div class="section-header">
                <el-icon><User /></el-icon>
                <h4>{{ t('trip.personalPreferences') }}</h4>
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
                    tagMapping[currentUserPreferences.travelPace] ||
                    currentUserPreferences.travelPace
                  }}</span
                  >。
                </template>
                <template
                  v-if="
                    currentUserPreferences.foodTastes &&
                    currentUserPreferences.foodTastes.length > 0
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
                {{ t('trip.noUserPreferences') }}
              </div>
            </div>

            <div class="prompt-section">
              <div class="section-header">
                <el-icon><MagicStick /></el-icon>
                <h4>{{ t('trip.thisTripPreferences') }}</h4>
              </div>
              <div
                v-if="
                  (preferenceForm.tripGoals && preferenceForm.tripGoals.length > 0) ||
                  preferenceForm.pacePreference ||
                  preferenceForm.socialPreference ||
                  preferenceForm.photoPreference ||
                  (preferenceForm.focusAreas && preferenceForm.focusAreas.length > 0) ||
                  preferenceForm.specialRequirements
                "
                class="prompt-text"
              >
                <template
                  v-if="preferenceForm.tripGoals && preferenceForm.tripGoals.length > 0"
                >
                  本次行程目标是<span class="highlight">{{
                    getTripGoalsText(preferenceForm.tripGoals)
                  }}</span
                  >。
                </template>
                <template v-if="preferenceForm.pacePreference">
                  行程节奏偏好<span class="highlight">{{
                    getPacePreferenceText(preferenceForm.pacePreference)
                  }}</span
                  >。
                </template>
                <template v-if="preferenceForm.socialPreference">
                  社交环境偏好<span class="highlight">{{
                    getSocialPreferenceText(preferenceForm.socialPreference)
                  }}</span
                  >。
                </template>
                <template v-if="preferenceForm.photoPreference">
                  拍照打卡需求<span class="highlight">{{
                    getPhotoPreferenceText(preferenceForm.photoPreference)
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
                <template v-if="preferenceForm.specialRequirements">
                  {{ t('trip.specialRequests') }}：<span class="highlight">{{
                    preferenceForm.specialRequirements
                  }}</span>
                </template>
              </div>
              <div v-else class="prompt-placeholder">
                {{ t('trip.setPreferencesInStep') }}
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
                <h4>{{ t('trip.dietaryRestrictions') }}</h4>
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
                <h4>{{ t('trip.weatherSuggestion') }}</h4>
                <el-tag
                  v-if="weatherSuggestion.isHistorical"
                  size="small"
                  type="info"
                  effect="plain"
                >
                  {{ weatherSuggestion.dataSource }}
                </el-tag>
                <el-tag v-else size="small" type="success" effect="plain">
                  {{ t('trip.weather.amapApi') }}
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
                       <p class="notice-title">🌤️ {{ t('trip.weather.noticeTitle') }}</p>
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
                         {{ t('trip.weather.outOfRangeAdvice') }}
                      </p>
                    </template>
                    <template v-else>
                       <p class="notice-title">⚠️ {{ t('trip.weather.noticeTitle') }}</p>
                      <p>
                         {{ t('trip.weather.noAccurateForecast') }}
                      </p>
                      <p class="notice-suggestion">
                         {{ t('trip.weather.checkBeforeTravel') }}
                      </p>
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
                     {{ t('trip.weather.suitableActivitiesPrefix') }}<span class="highlight">{{
                       weatherSuggestion.activities.join("、")
                     }}</span
                     >{{ t('trip.weather.suitableActivitiesSuffix') }}
                   </p>
                </template>
                <template
                  v-if="
                    weatherSuggestion.tips &&
                    weatherSuggestion.tips.length > 0 &&
                    isDateWithinForecastRange()
                  "
                >
                   <p>
                     {{ t('trip.weather.tips') }}<span class="highlight">{{
                       weatherSuggestion.tips.join("；")
                     }}</span
                     >。
                   </p>
                </template>
                <template
                  v-if="
                    weatherSuggestion.avoid &&
                    weatherSuggestion.avoid.length > 0 &&
                    isDateWithinForecastRange()
                  "
                >
                   <p>
                     {{ t('trip.weather.cautions') }}<span class="highlight">{{
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
                       <template v-if="isDateWithinForecastRange()">
                         {{ t('trip.weather.detail') }}
                      </template>
                      <template
                        v-else-if="
                          baseForm &&
                          baseForm.days &&
                          weatherSuggestion.forecast &&
                          baseForm.days > weatherSuggestion.forecast.length
                        "
                      >
                         {{ t('trip.weather.partialForecastPrefix') }}{{ weatherSuggestion.forecast.length }}{{ t('trip.weather.daysSuffix') }}
                      </template>
                       <template v-else> {{ t('trip.weather.referenceForecast') }} </template>
                      <el-tag
                        v-if="weatherSuggestion.isHistorical"
                        size="small"
                        type="info"
                      >
                         {{ t('trip.weather.historicalSim') }}
                      </el-tag>
                       <el-tag v-else size="small" type="success"> {{ t('trip.weather.amapApiForecast') }} </el-tag>
                      <el-tag
                        v-if="!isDateWithinForecastRange()"
                        size="small"
                        type="warning"
                      >
                         {{ t('trip.weather.dateOutOfRange') }}
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
                          <template v-if="day.dayWind"
                            >{{ day.dayWind }}{{ day.dayPower }}级</template
                          >
                          <template v-if="day.nightWind && day.nightWind !== day.dayWind">
                            / {{ day.nightWind }}{{ day.nightPower }}级
                          </template>
                        </div>
                      </div>
                    </div>
                    <!-- 超出预报范围的提醒 -->
                    <template
                      v-if="
                        !isDateWithinForecastRange() &&
                        baseForm &&
                        baseForm.days &&
                        weatherSuggestion.forecast &&
                        baseForm.days > weatherSuggestion.forecast.length
                      "
                    >
                       <div class="forecast-limitation-notice">
                        <el-icon><Warning /></el-icon>
                         <span>{{ t('trip.weather.afterDayNeedsAttention', { day: weatherSuggestion.forecast.length + 1 }) }}</span>
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
                <h4>{{ t('trip.weatherSuggestion') }}</h4>
              </div>
              <div class="prompt-text loading-text">{{ t('trip.weather.loading') }}</div>
            </div>

            <!-- 天气错误状态 -->
            <div v-else-if="weatherError" class="prompt-section">
              <div class="section-header">
                <el-icon><Warning /></el-icon>
                <h4>{{ t('trip.weatherSuggestion') }}</h4>
              </div>
              <div class="prompt-text error-text">
                {{ t('trip.weather.fetchFailedPrefix') }} {{ weatherError }}
              </div>
            </div>

            <div class="prompt-section">
            <div class="section-header">
                <el-icon><Location /></el-icon>
              <h4>{{ t('trip.mustSee') }}</h4>
              </div>
              <div v-if="selectedAttractions.length > 0" class="prompt-text">
              {{ t('trip.mustSee') }}：<span class="highlight">{{
                  selectedAttractions.map((a) => a.name).join("、")
                }}</span>
              </div>
              <div v-else class="prompt-placeholder">
              {{ t('trip.noMustSeeSelected') }}
              </div>
            </div>

            <div class="prompt-section">
            <div class="section-header">
                <el-icon><Shop /></el-icon>
              <h4>{{ t('trip.mustEat') }}</h4>
              </div>
              <div v-if="selectedRestaurants.length > 0" class="prompt-text">
              {{ t('trip.mustEat') }}：<span class="highlight">{{
                  selectedRestaurants.map((r) => r.name).join("、")
                }}</span>
              </div>
              <div v-else class="prompt-placeholder">
              {{ t('trip.noMustEatSelected') }}
              </div>
            </div>
          </div>

          <!-- 生成选项 -->
          <div class="generation-options">
            <div class="option-group">
            <span class="option-label">{{ t('trip.generation.format') }}</span>
              <el-radio-group
                v-model="selectedGenerationStyle"
                size="small"
                class="inline-style-options"
              >
                <el-radio value="table">
                <span class="style-name">{{ t('trip.generation.styles.table') }}</span>
                <span class="style-desc">{{ t('trip.generation.styleDesc.table') }}</span>
                </el-radio>
                <el-radio value="narrative">
                <span class="style-name">{{ t('trip.generation.styles.narrative') }}</span>
                <span class="style-desc">{{ t('trip.generation.styleDesc.narrative') }}</span>
                </el-radio>
                <el-radio value="card">
                <span class="style-name">{{ t('trip.generation.styles.card') }}</span>
                <span class="style-desc">{{ t('trip.generation.styleDesc.card') }}</span>
                </el-radio>
                <el-radio value="checklist">
                <span class="style-name">{{ t('trip.generation.styles.checklist') }}</span>
                <span class="style-desc">{{ t('trip.generation.styleDesc.checklist') }}</span>
                </el-radio>
              </el-radio-group>
            </div>
          </div>

          <div class="prompt-actions">
            <el-button type="success" size="large" @click="showFullPrompt">
              <el-icon><ViewIcon /></el-icon>
            {{ t('trip.actions.viewFullPrompt') }}
            </el-button>
            <el-button
              v-if="!generating"
              type="primary"
              size="large"
              :disabled="!canGenerateTrip"
              @click="generateTrip"
            >
              <el-icon><MagicStick /></el-icon>
            {{ t('trip.actions.generateUsingPrompt') }}
            </el-button>
            
            <!-- 生成中的状态 -->
            <template v-else>
              <el-button
                type="primary"
                size="large"
                loading
                disabled
              >
              {{ t('trip.actions.generating') }}
              </el-button>
              <el-button
                type="danger"
                size="large"
                @click="cancelGeneration"
              >
                <el-icon><Close /></el-icon>
              {{ t('common.cancel') }}
              </el-button>
            </template>
          </div>
        </div>

        <!-- 数据验证提示 -->
        <div v-if="!canGenerateTrip && baseForm.destination" class="validation-hints">
          <el-alert
            v-for="(error, index) in validateTripData().errors"
            :key="`error-${index}`"
            :title="typeof error === 'string' ? error : error.message"
            :description="typeof error === 'object' ? error.suggestion : undefined"
            type="error"
            :closable="false"
            show-icon
            class="validation-error"
          />
          <el-alert
            v-for="(warning, index) in validateTripData().warnings"
            :key="`warning-${index}`"
            :title="typeof warning === 'string' ? warning : warning.message"
            :description="typeof warning === 'object' ? warning.suggestion : undefined"
            type="warning"
            :closable="false"
            show-icon
            class="validation-warning"
          />
        </div>

        <div v-if="generating" class="generating">
        <div class="generating-animation">
            <el-icon size="80" color="#409EFF" class="rotating">
              <Loading />
            </el-icon>
            <div class="generating-content">
            <h3>✨ {{ t('trip.generating.aiWorking') }}</h3>
              <p class="progress-text">{{ generationProgress }}</p>
              <el-progress
                :percentage="progressPercent"
                :stroke-width="12"
                :show-text="false"
              />
              <div class="progress-info">
                <span class="progress-percentage">{{ progressPercent }}%</span>
              <span class="progress-desc">
                {{ t('trip.generating.timeRemaining', { s: Math.max(0, Math.ceil((100 - progressPercent) * 1.2)) }) }}
              </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="generatedTrip && !generating" class="generation-complete">
          <el-icon size="48" color="#67C23A">
            <Check />
          </el-icon>
        <h3>{{ t('trip.generated') }}</h3>
        <p>
          {{ t('trip.recommendedCounts', { attractions: generatedTrip?.attractions?.length || 0, restaurants: generatedTrip?.restaurants?.length || 0 }) }}
        </p>
          <el-button type="primary" size="large" @click="$emit('next-step')">
          {{ t('trip.viewDetails') }}
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 步骤操作按钮 -->
    <div v-if="!generating && !generatedTrip" class="step-actions">
      <el-button size="large" @click="$emit('prev-step')">
        <el-icon><ArrowLeft /></el-icon>
        {{ t('common.previous') }}
      </el-button>
    </div>

    <!-- 完整提示词弹窗 -->
    <el-dialog
      v-model="fullPromptVisible"
      :title="t('trip.dialog.fullPromptTitle')"
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
            {{ t('trip.dialog.copyPrompt') }}
          </el-button>
        </div>
        <div class="prompt-text-area">
          <pre>{{ fullPromptText }}</pre>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="fullPromptVisible = false">{{ t('trip.dialog.close') }}</el-button>
          <el-button type="primary" @click="copyPromptAndClose"> {{ t('trip.dialog.copyAndClose') }} </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { computed, onMounted, watch, nextTick, ref } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "@/utils/i18n.js";
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
  tagMappingZh,
  tagMappingEn,
  focusAreaMapping,
  dietaryRestrictionMappingZh,
  dietaryRestrictionMappingEn,
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
    "prev-step",
  ],
  setup(props, { emit }) {
    const { t, locale } = useI18n();
    // 获取用户store
    const userStore = useUserStore();

        // 生成风格选择
    const selectedGenerationStyle = ref("table"); // 默认表格式
 
    // 完整提示词弹窗显示状态
    const fullPromptVisible = ref(false);
 
    // 完整提示词文本
    const fullPromptText = ref("");
    
    // 取消生成的控制器
    let abortController = null;

    // 注意：generatedTrip 通过 props 传递，直接使用 props.generatedTrip

    // 获取实时的用户偏好数据，优先使用store中的数据
    const currentUserPreferences = computed(() => {
      // 优先使用 props 传递的数据，如果没有则使用 store 中的数据
      const preferences = props.userPreferences || userStore.userPreferences;
      // 调试用：当前用户偏好数据
      return preferences;
    });

    // 语言映射对象（用于模板中的直接索引）
    const tagMapping = computed(() => (locale.value === 'en-US' ? tagMappingEn : tagMappingZh));
    const dietaryRestrictionMapping = computed(() => (locale.value === 'en-US' ? dietaryRestrictionMappingEn : dietaryRestrictionMappingZh));

    // 计算用户偏好标签的中文显示
    const selectedPreferenceTags = computed(() => {
      const preferences = currentUserPreferences.value;
      if (!preferences) return [];

      const tags = [];

      // 从旅行类型标签中提取并转换为中文 - 兼容多种数据格式
      const travelTags = preferences.selectedTags || preferences.tags || [];
      if (Array.isArray(travelTags) && travelTags.length > 0) {
        travelTags.forEach((tag) => {
          const chineseTag = tagMapping.value[tag] || tag;
          tags.push(chineseTag);
        });
      }

      // 从其他各种偏好中提取标签
      const transports = preferences.selectedTransports || [];
      if (Array.isArray(transports) && transports.length > 0) {
        transports.forEach((transport) => {
          const chineseTag = tagMapping.value[transport];
          if (chineseTag) tags.push(chineseTag);
        });
      }

      // 住宿类型
      if (preferences.accommodationType) {
        const chineseTag = tagMapping.value[preferences.accommodationType];
        if (chineseTag) tags.push(chineseTag);
      }

      // 旅行节奏
      if (preferences.travelPace) {
        const chineseTag = tagMapping.value[preferences.travelPace];
        if (chineseTag) tags.push(chineseTag);
      }

      // 美食偏好
      const foodTastes = preferences.foodTastes || [];
      if (Array.isArray(foodTastes) && foodTastes.length > 0) {
        foodTastes.forEach((taste) => {
          const chineseTag = tagMapping.value[taste] || taste;
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
        preferences.selectedTags?.length > 0 ||
        preferences.tags?.length > 0 ||
        preferences.selectedTransports?.length > 0 ||
        preferences.accommodationType ||
        preferences.travelPace ||
        preferences.foodTastes?.length > 0 ||
        preferences.dietaryRestrictions?.length > 0 ||
        preferences.mbtiType ||
        preferences.budget ||
        preferences.dailyBudget
      );

      // 调试用：用户是否有偏好设置
      return hasPrefs;
    });

    // 获取城市名称
    const getSelectedCityName = () => {
      if (!props || !props.baseForm) return "未设置";
      return getCityName(props.baseForm?.destination, props.baseForm?.destinationName);
    };

    // 格式化日期范围显示
    const formatDateRange = () => {
      if (
        !props ||
        !props.baseForm ||
        !props.baseForm.dateRange ||
        props.baseForm.dateRange.length !== 2
      ) {
        return "未设置";
      }
      const startDate = new Date(props.baseForm.dateRange[0]);
      const endDate = new Date(props.baseForm.dateRange[1]);
      return `${startDate.toLocaleDateString()} 至 ${endDate.toLocaleDateString()}`;
    };

    // 获取预算文本
    const getBudgetText = () => {
      if (!props || !props.baseForm) return "未设置";
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
      const mapObj = dietaryRestrictionMapping.value;
      return restrictions.map((r) => mapObj[r] || r).join("、");
    };

    // 新增：获取行程目标文本
    const getTripGoalsText = (goals) => {
      if (!goals || goals.length === 0) return "";
      const goalMapping = {
        celebration: "庆祝节日/生日",
        business: "商务出差顺便游玩",
        family: "家庭亲子游",
        romantic: "情侣蜜月游",
        friendship: "朋友聚会游",
        solo: "个人独旅",
        learning: "学习文化知识",
        relaxation: "放松减压",
        adventure: "寻求刺激冒险",
        photography: "摄影创作",
      };
      return goals.map((goal) => goalMapping[goal] || goal).join("、");
    };

    // 新增：获取节奏偏好文本
    const getPacePreferenceText = (pace) => {
      const paceMapping = {
        slow: "慢节奏（深度体验，充分休息）",
        balanced: "平衡型（景点与休息并重）",
        fast: "紧凑型（多看多玩，充实行程）",
      };
      return paceMapping[pace] || pace;
    };

    // 新增：获取社交偏好文本
    const getSocialPreferenceText = (social) => {
      const socialMapping = {
        lively: "热闹有趣（人气餐厅、热门景点）",
        quiet: "安静私密（小众场所、人少景点）",
        mixed: "灵活搭配（热门与小众结合）",
      };
      return socialMapping[social] || social;
    };

    // 新增：获取拍照偏好文本
    const getPhotoPreferenceText = (photo) => {
      const photoMapping = {
        essential: "必须有（网红打卡点优先）",
        casual: "随性拍拍（自然美景即可）",
        minimal: "不太在意（体验优先）",
      };
      return photoMapping[photo] || photo;
    };

    // 生成提示词完整度评估
    const getPromptCompletionScore = () => {
      // 安全检查：确保props已经初始化
      if (!props || !props.baseForm || !props.preferenceForm) return 0;

      let score = 0;

      // 基本信息 (40分)
      if (props.baseForm.destination) score += 10;
      if (props.baseForm.days) score += 10;
      if (props.baseForm.dateRange && props.baseForm.dateRange.length === 2) score += 10;
      if (props.baseForm.budget) score += 10;

      // 个人偏好 (20分)
      if (currentUserPreferences.value && selectedPreferenceTags.value.length > 0)
        score += 10;
      if (currentUserPreferences.value && currentUserPreferences.value.travelPace)
        score += 5;
      if (
        currentUserPreferences.value &&
        currentUserPreferences.value.foodTastes &&
        currentUserPreferences.value.foodTastes.length > 0
      )
        score += 5;

      // 本次行程偏好 (30分)
      if (props.preferenceForm.tripGoals && props.preferenceForm.tripGoals.length > 0)
        score += 6;
      if (props.preferenceForm.pacePreference) score += 6;
      if (props.preferenceForm.socialPreference) score += 4;
      if (props.preferenceForm.photoPreference) score += 4;
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
      if (score >= 80) return t('trip.promptQuality.high');
      if (score >= 50) return t('trip.promptQuality.medium');
      return t('trip.promptQuality.low');
    };

    // 生成完整提示词文本
    const generatePromptText = () => {
      // 安全检查：确保props已经初始化
      if (!props || !props.baseForm || !props.preferenceForm) return "";

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
          prompt += `饮食偏好${currentUserPreferences.value.foodTastes
            .map((taste) => tagMapping[taste] || taste)
            .join("、")}。`;
        }
        prompt += "\n\n";
      }

      // 本次行程偏好
      const hasAnyPreference =
        (props.preferenceForm.tripGoals && props.preferenceForm.tripGoals.length > 0) ||
        props.preferenceForm.pacePreference ||
        props.preferenceForm.socialPreference ||
        props.preferenceForm.photoPreference ||
        (props.preferenceForm.focusAreas && props.preferenceForm.focusAreas.length > 0) ||
        props.preferenceForm.specialRequirements;

      if (hasAnyPreference) {
        // 行程目标
        if (props.preferenceForm.tripGoals && props.preferenceForm.tripGoals.length > 0) {
          prompt += `本次行程目标是${getTripGoalsText(props.preferenceForm.tripGoals)}。`;
        }

        // 行程节奏偏好
        if (props.preferenceForm.pacePreference) {
          prompt += `行程节奏偏好${getPacePreferenceText(
            props.preferenceForm.pacePreference
          )}。`;
        }

        // 社交环境偏好
        if (props.preferenceForm.socialPreference) {
          prompt += `社交环境偏好${getSocialPreferenceText(
            props.preferenceForm.socialPreference
          )}。`;
        }

        // 拍照打卡需求
        if (props.preferenceForm.photoPreference) {
          prompt += `拍照打卡需求${getPhotoPreferenceText(
            props.preferenceForm.photoPreference
          )}。`;
        }

        // 重点体验内容
        if (
          props.preferenceForm.focusAreas &&
          props.preferenceForm.focusAreas.length > 0
        ) {
          prompt += `重点体验${getFocusAreasText(props.preferenceForm.focusAreas)}。`;
        }

        // 特殊需求
        if (props.preferenceForm.specialRequirements) {
          prompt += `特殊需求：${props.preferenceForm.specialRequirements}。`;
        }

        prompt += "\n\n";
      }

      // 天气建议
      if (props.weatherSuggestion) {
        const isDateInRange = isDateWithinForecastRange();
        const tripDays = props.baseForm.days || 1;
        const forecastDays = props.weatherSuggestion.forecast
          ? props.weatherSuggestion.forecast.length
          : 0;

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

            if (
              props.weatherSuggestion.windDirection &&
              props.weatherSuggestion.windPower
            ) {
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
            if (
              props.weatherSuggestion.forecast &&
              props.weatherSuggestion.forecast.length > 0
            ) {
              prompt += `已知的天气情况：${props.weatherSuggestion.weatherDesc}，气温${props.weatherSuggestion.tempRange}。`;
            }
            prompt += `超出预报范围的日期建议您关注当地实时天气预报，并准备适应性较强的衣物。`;
          } else {
            prompt += `⚠️ 天气预报说明：由于您选择的出行日期与当前天气预报时间范围不匹配，无法提供准确的天气预报。建议您在出行前关注目的地的实时天气预报。`;
          }
        }

        // 只有在日期范围内时才添加活动建议
        if (
          isDateInRange &&
          props.weatherSuggestion.activities &&
          props.weatherSuggestion.activities.length > 0
        ) {
          prompt += `适合安排${props.weatherSuggestion.activities.join("、")}等活动。`;
        }

        // 只有在日期范围内时才添加建议和注意事项
        if (
          isDateInRange &&
          props.weatherSuggestion.tips &&
          props.weatherSuggestion.tips.length > 0
        ) {
          prompt += `建议：${props.weatherSuggestion.tips.join("；")}。`;
        }

        if (
          isDateInRange &&
          props.weatherSuggestion.avoid &&
          props.weatherSuggestion.avoid.length > 0
        ) {
          prompt += `注意事项：${props.weatherSuggestion.avoid.join("；")}。`;
        }

        // 详细天气预报：根据日期覆盖情况调整
        if (
          props.weatherSuggestion.forecast &&
          props.weatherSuggestion.forecast.length > 0
        ) {
          if (isDateInRange) {
            prompt += `具体天气预报：`;
            const forecastSummary = props.weatherSuggestion.forecast
              .map(
                (day) => `${day.date}${day.dayWeather}，${day.dayTemp}℃/${day.nightTemp}℃`
              )
              .join("；");
            prompt += forecastSummary + "。";
          } else if (tripDays > forecastDays) {
            // 部分日期有预报
            prompt += `可获取的天气预报（前${forecastDays}天）：`;
            const forecastSummary = props.weatherSuggestion.forecast
              .map(
                (day) => `${day.date}${day.dayWeather}，${day.dayTemp}℃/${day.nightTemp}℃`
              )
              .join("；");
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
      if (
        !props ||
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

      // 获取天气预报的日期范围
      const forecastDates = props.weatherSuggestion.forecast.map((f) => new Date(f.date));
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
        message: t('trip.messages.fullPromptReady'),
        type: "success",
        duration: 3000,
      });
    };

    // 复制提示词到剪贴板
    const copyPromptToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(fullPromptText.value);
        ElMessage({
          message: t('trip.messages.copySuccess'),
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
            message: t('trip.messages.copySuccess'),
            type: "success",
            duration: 2000,
          });
        } catch (err) {
          ElMessage({
            message: t('trip.messages.copyFailed'),
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
      // 安全检查：确保props已经初始化
      if (!props || !props.baseForm) return false;

      const basicInfoValid =
        props.baseForm.destination && props.baseForm.days && props.baseForm.travelers;
      if (!basicInfoValid) return false;

      // 验证数据逻辑一致性
      const validation = validateTripData();
      return validation.isValid;
    });

    // 数据验证逻辑
    const validateTripData = () => {
      const errors = [];
      const warnings = [];

      // 安全检查：确保props已经初始化
      if (!props || !props.baseForm || !props.preferenceForm) {
        return {
          isValid: false,
          errors: [],
          warnings: [],
        };
      }

      // 检查基础信息
      const travelers = props.baseForm.travelers;
      const userPrefs = currentUserPreferences.value;
      const prefForm = props.preferenceForm;

      // 获取实际的标签数据（可能是英文或中文）
      const rawTags = userPrefs?.selectedTags || userPrefs?.tags || [];
      const chineseTags = selectedPreferenceTags.value || [];

      // console.log('🔍 数据验证检查:', {
      //   travelers,
      //   rawTags,
      //   chineseTags,
      //   userPrefs,
      //   prefForm
      // });

      // 定义标签检查函数（同时检查英文和中文标签）
      const hasTag = (englishTag, chineseTag) => {
        return (
          rawTags.includes(englishTag) ||
          rawTags.includes(chineseTag) ||
          chineseTags.includes(chineseTag)
        );
      };

      // 1. 严重错误检查（阻止生成）
      if (prefForm.tripGoals && Array.isArray(prefForm.tripGoals)) {
        if (prefForm.tripGoals.includes("family") && travelers < 3) {
          errors.push({
            type: 'mismatch',
            message: '家庭亲子游通常需要至少3人（包含大人和小孩）',
            suggestion: '调整人数为3人或以上，或选择其他行程目标',
            allowIgnore: true
          });
        }
        if (prefForm.tripGoals.includes("romantic") && travelers !== 2) {
          errors.push({
            type: 'mismatch', 
            message: '情侣蜜月游适合2人出行，当前设置不匹配',
            suggestion: '调整人数为2人，或选择其他行程目标',
            allowIgnore: true
          });
        }
        if (prefForm.tripGoals.includes("solo") && travelers > 1) {
          errors.push({
            type: 'mismatch',
            message: '个人独旅是一个人的旅行体验',
            suggestion: '调整人数为1人，或选择"朋友聚会游"等其他目标',
            allowIgnore: false
          });
        }
      }

      // 2. 检查传统标签与人数匹配（向后兼容，但不强制）
      if (hasTag("family", "亲子出游") && travelers < 3) {
        warnings.push({
          type: 'legacy_mismatch',
          message: '用户偏好标签"亲子出游"与人数不匹配',
          suggestion: '建议至少3人出行，或调整个人偏好设置',
          allowIgnore: true
        });
      }

      // 6. 预算合理性检查
      const budget = props.baseForm.budget;
      const days = props.baseForm.days;
      if (budget && days && travelers) {
        const budgetMatch = budget.match(/(\d+)/g);
        if (budgetMatch && budgetMatch.length > 0) {
          const avgBudget = parseInt(budgetMatch[0]);
          const perPersonPerDay = avgBudget / (days * travelers);
          
          if (perPersonPerDay < 200) {
            warnings.push({
              type: 'budget',
              message: `人均每日预算约${Math.round(perPersonPerDay)}元，可能偏低`,
              suggestion: '建议适当增加预算或调整行程期望，确保旅行体验质量',
              allowIgnore: true
            });
          } else if (perPersonPerDay > 2000) {
            warnings.push({
              type: 'budget',
              message: `人均每日预算约${Math.round(perPersonPerDay)}元，属于高端旅行`,
              suggestion: 'AI将为您推荐高品质的景点、餐厅和体验项目',
              allowIgnore: true
            });
          }
        }
      } else if (days > 7 && !budget) {
        warnings.push({
          type: 'budget',
          message: '长途旅行建议设置预算范围',
          suggestion: '设置预算有助于AI推荐更符合您消费水平的景点和餐厅',
          allowIgnore: true
        });
      }

      // 7. 体验类型冲突检查（更清晰的说明）
      if (prefForm.focusAreas && Array.isArray(prefForm.focusAreas)) {
        const hasNature = prefForm.focusAreas.some((area) =>
          ["natural_scenery", "outdoor_adventure"].includes(area)
        );
        const hasUrban = prefForm.focusAreas.some((area) =>
          ["urban_lifestyle", "shopping", "nightlife"].includes(area)
        );

        if (hasNature && hasUrban && days < 5) {
          warnings.push({
            type: 'experience_conflict',
            message: '您同时选择了自然风光和城市体验',
            suggestion: `${days}天行程建议重点选择一种：自然风光（山水景观、户外活动）或城市体验（购物、夜生活、都市文化）`,
            allowIgnore: true
          });
        }
      }

      // 8. 其他建议性检查
      if (prefForm.pacePreference && days) {
        if (prefForm.pacePreference === "fast" && days > 10) {
          warnings.push({
            type: 'pace_mismatch',
            message: '长途旅行选择紧凑节奏可能比较辛苦',
            suggestion: '建议选择"平衡型"节奏，既能多看景点又有充分休息',
            allowIgnore: true
          });
        }
      }

      // console.log('✅ 验证结果:', {
      //   isValid: errors.length === 0,
      //   errors,
      //   warnings
      // });

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    };

    // 生成行程
    const generateTrip = async () => {
      // 数据验证
      const validation = validateTripData();

              if (!validation.isValid) {
          // 显示具体的验证错误
          validation.errors.forEach((error) => {
            if (typeof error === 'string') {
              ElMessage.error(error);
            } else {
              ElMessage.error({
                message: error.message,
                duration: 6000,
                showClose: true
              });
            }
          });
          return;
        }

        // 显示警告（但不阻止生成）
        if (validation.warnings.length > 0) {
          validation.warnings.forEach((warning) => {
            if (typeof warning === 'string') {
              ElMessage.warning(warning);
            } else {
              ElMessage.warning({
                message: `${warning.message}\n建议：${warning.suggestion}`,
                duration: 8000,
                showClose: true
              });
            }
          });
        }

      if (!canGenerateTrip.value) {
        ElMessage.warning(t('trip.warnings.completeBasicInfo'));
        return;
      }

      try {
        // 通过emit通知父组件更新状态
        emit("update:generating", true);
        emit("update:generationProgress", t('trip.progress.start'));
        emit("update:progressPercent", 5);

        // 等待一下让用户看到开始状态
        await new Promise((resolve) => setTimeout(resolve, 800));

        emit("update:generationProgress", t('trip.progress.analyzingPrefs'));
        emit("update:progressPercent", 15);

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
          generationStyle: selectedGenerationStyle.value,

          // 用户偏好
          travelTags: selectedPreferenceTags.value,
          transports: currentUserPreferences.value?.selectedTransports,
          accommodationType: currentUserPreferences.value?.accommodationType,
          travelPace: currentUserPreferences.value?.travelPace,
          foodTastes: currentUserPreferences.value?.foodTastes,
          dietaryRestrictions: props.preferenceForm.dietaryRestrictions,
          customDietaryNotes: props.preferenceForm.customDietaryNotes,

          // 行程偏好 - 修复字段映射
          tripGoals: props.preferenceForm.tripGoals,
          pacePreference: props.preferenceForm.pacePreference,
          socialPreference: props.preferenceForm.socialPreference,
          photoPreference: props.preferenceForm.photoPreference,
          focusAreas: props.preferenceForm.focusAreas,
          specialRequirements: props.preferenceForm.specialRequirements,

          // 为了兼容后端，也发送映射后的字段
          tripStyle: mapTripGoalsToStyle(props.preferenceForm.tripGoals),
          intensity: mapPaceToIntensity(props.preferenceForm.pacePreference),

          // 必去景点和餐厅
          selectedAttractions: props.selectedAttractions?.map((a) => ({
            name: a.name,
            description: a.description,
            address: a.address,
          })),
          selectedRestaurants: props.selectedRestaurants?.map((r) => ({
            name: r.name,
            description: r.description,
            address: r.address,
          })),

          // 天气信息
          weatherInfo: props.weatherSuggestion
            ? {
                weatherDesc: props.weatherSuggestion.weatherDesc,
                tempRange: props.weatherSuggestion.tempRange,
                tips: props.weatherSuggestion.tips,
                avoid: props.weatherSuggestion.avoid,
                isHistorical: props.weatherSuggestion.isHistorical,
              }
            : null,

          // 用户类型判断
          userType: determineUserType(),
        };

        // 数据准备完成
        emit("update:generationProgress", t('trip.progress.buildPrompt'));
        emit("update:progressPercent", 25);

        await new Promise((resolve) => setTimeout(resolve, 600));

        emit("update:generationProgress", t('trip.progress.connectAi'));
        emit("update:progressPercent", 35);

        await new Promise((resolve) => setTimeout(resolve, 500));

        emit("update:generationProgress", t('trip.progress.deepAnalyze'));
        emit("update:progressPercent", 45);

        // 调用后端AI接口
        emit("update:generationProgress", t('trip.progress.sending'));
        emit("update:progressPercent", 55);

        // 创建取消控制器
        abortController = new AbortController();

        const response = await fetch("/api/ai/trip/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
          signal: abortController.signal,
        });

         emit("update:generationProgress", t('trip.progress.generating'));
         emit("update:progressPercent", 75);
 
         // 检查响应状态
         if (!response.ok) {
           const errorText = await response.text();
           throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
         }
         
         // 安全地解析JSON
         let result;
         try {
           const responseText = await response.text();
           if (!responseText.trim()) {
             throw new Error("服务器返回空响应");
           }
           result = JSON.parse(responseText);
         } catch (jsonError) {
           console.error("JSON解析错误:", jsonError);
           throw new Error("服务器响应格式错误，请稍后重试");
         }

        emit("update:generationProgress", t('trip.progress.formatting'));
        emit("update:progressPercent", 90);

        if (result.code === 200) {
          emit("update:generationProgress", t('trip.generated'));
          emit("update:progressPercent", 100);

          // 处理成功结果
          const tripData = {
            id: result.data.tripId,
            content: result.data.content,
            aiProvider: result.data.aiProvider,
            processingTime: result.data.processingTime,
            qualityScore: result.data.qualityScore,
            destinationInfo: result.data.destinationInfo,
            tripBasicInfo: result.data.tripBasicInfo,
          };

          // 给用户一点时间看到完成状态
          await new Promise((resolve) => setTimeout(resolve, 800));

          emit("update:generatedTrip", tripData);
          emit("generation-complete", tripData);

          ElMessage.success({
            message: t('trip.messages.generateSuccess', { score: result.data.qualityScore, seconds: Math.round(result.data.processingTime / 1000) }),
            duration: 5000,
            showClose: true,
          });
        } else {
          throw new Error(result.msg || t('trip.errors.generateFailed'));
        }
      } catch (error) {
        console.error("生成行程失败:", error);
        
        // 检查是否是用户主动取消
        if (error.name === 'AbortError') {
          emit("update:generationProgress", t('trip.messages.cancelled'));
          emit("update:progressPercent", 0);
          ElMessage.info({
            message: t('trip.messages.cancelled'),
            duration: 3000,
          });
          emit("update:generating", false);
          abortController = null;
          return;
        }
        
        emit("update:generationProgress", t('trip.errors.generateFailedRetry'));
        emit("update:progressPercent", 0);

        // 根据错误类型提供不同的提示
        let errorMessage = t('trip.errors.generateFailed');
        if (
          error.message.includes("timeout") ||
          error.message.includes("TimeoutException")
        ) {
          errorMessage = t('trip.errors.timeout');
        } else if (
          error.message.includes("402") ||
          error.message.includes("Payment Required")
        ) {
          errorMessage = t('trip.errors.paymentRequired');
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = t('trip.errors.network');
        } else {
          errorMessage = `${t('trip.errors.withMessage')} ${error.message}`;
        }

        ElMessage.error({
          message: errorMessage,
          duration: 6000,
          showClose: true,
        });
      } finally {
        // 延迟一下再关闭loading，让用户看到完成状态
        setTimeout(() => {
          emit("update:generating", false);
          abortController = null;
        }, 2000);
      }
    };

    // 取消生成
    const cancelGeneration = () => {
      if (abortController) {
        abortController.abort();
        ElMessage.info({
          message: t('trip.messages.cancelling'),
          duration: 2000,
        });
      }
    };

    // 判断用户类型的辅助方法
    const determineUserType = () => {
      if (!props || !props.baseForm || !props.baseForm.travelers) return "INDIVIDUAL";
      if (props.baseForm.travelers > 2) return "FAMILY";
      if (props.baseForm.travelers === 2) return "COUPLE";
      return "INDIVIDUAL";
    };

    // 映射新的行程目标到旧的行程风格字段
    const mapTripGoalsToStyle = (tripGoals) => {
      if (!tripGoals || !Array.isArray(tripGoals) || tripGoals.length === 0) {
        return null;
      }

      // 根据主要目标确定行程风格
      if (tripGoals.includes("learning") || tripGoals.includes("culture")) {
        return "cultural"; // 文化深度游
      }
      if (tripGoals.includes("relaxation")) {
        return "leisure"; // 休闲游
      }
      if (tripGoals.includes("adventure")) {
        return "adventure"; // 探险游
      }
      if (tripGoals.includes("photography")) {
        return "photo"; // 摄影游
      }
      if (tripGoals.includes("business")) {
        return "business"; // 商务游
      }
      if (tripGoals.includes("family")) {
        return "family"; // 家庭游
      }
      if (tripGoals.includes("romantic")) {
        return "romantic"; // 浪漫游
      }

      // 默认综合游
      return "comprehensive";
    };

    // 映射新的节奏偏好到旧的强度字段
    const mapPaceToIntensity = (pacePreference) => {
      if (!pacePreference) return null;

      const paceMapping = {
        slow: "light", // 慢节奏 -> 轻松
        balanced: "moderate", // 平衡型 -> 适中
        fast: "intensive", // 紧凑型 -> 紧凑
      };

      return paceMapping[pacePreference] || "moderate";
    };


    // 组件挂载时的处理
    onMounted(async () => {
      // TripGeneration组件挂载

      // 如果用户已登录但没有偏好数据，尝试从API获取
      if (
        userStore.isLoggedIn &&
        (!props.userPreferences || Object.keys(props.userPreferences).length === 0)
      ) {
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
      t,
      generatePromptText,
      showFullPrompt,
      copyPromptToClipboard,
      copyPromptAndClose,
      fullPromptVisible,
      fullPromptText,
      getPromptCompletionClass,
      getPromptCompletionText,
      getPromptCompletionScore,
      validateTripData,
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
      // 新增的函数
      getTripGoalsText,
      getPacePreferenceText,
      getSocialPreferenceText,
      getPhotoPreferenceText,
      selectedPreferenceTags,
      hasUserPreferences,
      currentUserPreferences,
      tagMapping: tagMapping.value,
      isDateWithinForecastRange,
      // 风格选择相关
      selectedGenerationStyle,
      // 取消生成
      cancelGeneration,
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

/* 数据验证提示样式 */
.validation-hints {
  margin: 20px 0;
}

.validation-error {
  margin-bottom: 10px;
}

.validation-warning {
  margin-bottom: 10px;
}

.generating {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 16px;
  margin: 20px 0;
  position: relative;
  overflow: hidden;
}

.generating::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.generating-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.generating-content {
  width: 100%;
  max-width: 400px;
}

.generating h3 {
  margin: 0 0 15px;
  color: #1e40af;
  font-size: 20px;
  font-weight: 600;
}

.progress-text {
  margin: 0 0 20px;
  font-size: 16px;
  color: #374151;
  min-height: 24px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  font-size: 14px;
}

.progress-percentage {
  font-weight: 600;
  color: #1e40af;
}

.progress-desc {
  color: #6b7280;
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
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
    Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
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

/* 生成选项样式 - 融入prompt内容区域 */
.generation-options {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0 20px 0;
}

.option-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.option-label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  flex-shrink: 0;
}

.inline-style-options {
  display: flex;
  gap: 20px;
}

.inline-style-options :deep(.el-radio) {
  margin-right: 0;
}

.inline-style-options :deep(.el-radio__label) {
  font-size: 14px;
  color: #4b5563;
  padding-left: 8px;
  font-weight: 400;
}

.inline-style-options :deep(.el-radio.is-checked .el-radio__label) {
  color: #059669;
  font-weight: 500;
}

.inline-style-options :deep(.el-radio__input.is-checked .el-radio__inner) {
  border-color: #059669;
  background-color: #059669;
}

.inline-style-options :deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #059669;
}

/* 风格选择样式增强 */
.inline-style-options :deep(.el-radio__label) {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.style-name {
  font-weight: 500;
  font-size: 14px;
}

.style-desc {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}

.inline-style-options :deep(.el-radio.is-checked .style-desc) {
  color: #059669;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .generation-options {
    padding: 12px;
    margin: 12px 0 16px 0;
  }
  
  .option-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .inline-style-options {
    gap: 16px;
    flex-wrap: wrap;
  }
  
  .inline-style-options :deep(.el-radio__label) {
    font-size: 13px;
  }
}
</style>
