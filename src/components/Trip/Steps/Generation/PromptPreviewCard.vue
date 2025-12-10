<template>
  <div class="ai-prompt-card">
    <div class="card-header">
      <div class="header-left">
        <div class="header-icon-small">
          <el-icon size="20">
            <MagicStick />
          </el-icon>
        </div>
        <div class="header-info">
          <h3 class="card-title">🤖 AI提示词预览</h3>
          <p class="card-subtitle">查看AI将如何理解您的需求</p>
        </div>
      </div>
      <div class="header-right">
        <el-tag size="large" :type="promptCompletionClass">
          {{ promptCompletionText }}
        </el-tag>
        <el-tooltip content="查看完整提示词" placement="top">
          <el-button type="primary" link @click="$emit('show-full-prompt')">
            <el-icon><ViewIcon /></el-icon>
            查看详情
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <div class="ai-prompt-content">
      <div v-if="!generating && !generatedTrip">
        <div class="generation-intro">
          <el-icon size="48" color="#91A8D0">
            <MagicStick />
          </el-icon>
          <h3>准备生成您的个性化行程</h3>
          <p>根据您的偏好，我们将为您定制一份精彩的旅行计划</p>
        </div>

        <div class="prompt-sections">
          <div class="prompt-section">
            <div class="section-header">
              <el-icon><MapLocation /></el-icon>
              <h4>基本信息</h4>
            </div>
            <div v-if="baseForm.destination && baseForm.days" class="prompt-text">
              为我规划一次前往
              <span class="highlight">{{ getSelectedCityName() }}</span>
              的 <span class="highlight">{{ baseForm.days }}天</span>行程， 共
              <span class="highlight">{{ baseForm.travelers }}人</span>
              出行， 预算约
              <span class="highlight">{{ getBudgetText() }}</span>
              。出行日期为
              <span class="highlight">{{ formatDateRange() }}</span
              >。
            </div>
            <div v-else class="prompt-placeholder">
              请填写基本信息
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
                  translateTag(currentUserPreferences.accommodationType)
                }}</span
                >。
              </template>
              <template v-if="currentUserPreferences.travelPace">
                旅行节奏偏好<span class="highlight">{{
                  translateTag(currentUserPreferences.travelPace)
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
                  translateTagsToString(currentUserPreferences.foodTastes)
                }}</span
                >。
              </template>
            </div>
            <div v-else class="prompt-placeholder">
              请在设置中配置您的偏好
            </div>
          </div>

          <div class="prompt-section">
            <div class="section-header">
              <el-icon><MagicStick /></el-icon>
              <h4>本次行程偏好</h4>
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
                特殊需求：<span class="highlight">{{
                  preferenceForm.specialRequirements
                }}</span>
              </template>
            </div>
            <div v-else class="prompt-placeholder">
              请在上一步设置您的偏好
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
          <WeatherPreviewSection 
            :weatherSuggestion="weatherSuggestion"
            :baseForm="baseForm"
            :loadingWeather="loadingWeather"
            :weatherError="weatherError"
          />

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
              请选择您必须去的景点
            </div>
          </div>

          <div class="prompt-section">
            <div class="section-header">
              <el-icon><Shop /></el-icon>
              <h4>必吃美食</h4>
            </div>
            <div v-if="selectedRestaurants.length > 0" class="prompt-text">
              必吃美食：<span class="highlight">{{
                selectedRestaurants.map((r) => r.name).join("、")
              }}</span>
            </div>
            <div v-else class="prompt-placeholder">
              请选择您必须尝试的美食
            </div>
          </div>

          <div class="prompt-section">
            <div class="section-header">
              <el-icon><House /></el-icon>
              <h4>住宿偏好</h4>
            </div>
            <div v-if="selectedHotels.length > 0" class="prompt-text">
              已选酒店：<span class="highlight">{{
                selectedHotels.map((h) => h.name).join("、")
              }}</span>
            </div>
            <div v-else class="prompt-placeholder">
              请选择您的意向酒店
            </div>
          </div>
        </div>

        <!-- 生成选项 -->
        <div class="generation-options">
          <div class="option-group">
            <span class="option-label">生成格式</span>
            <el-radio-group
              :model-value="selectedGenerationStyle"
              @update:model-value="$emit('update:selectedGenerationStyle', $event)"
              size="small"
              class="inline-style-options"
            >
              <el-radio value="table">
                <span class="style-name">表格式</span>
                <span class="style-desc">清晰的时间表格</span>
              </el-radio>
              <el-radio value="narrative">
                <span class="style-name">叙述式</span>
                <span class="style-desc">详细的文字描述</span>
              </el-radio>
              <el-radio value="card">
                <span class="style-name">卡片式</span>
                <span class="style-desc">精美的卡片布局</span>
              </el-radio>
              <el-radio value="checklist">
                <span class="style-name">清单式</span>
                <span class="style-desc">简洁的检查清单</span>
              </el-radio>
            </el-radio-group>
          </div>
        </div>
      </div>

      <!-- 数据验证提示 -->
      <div v-if="!canGenerateTrip && baseForm.destination" class="validation-hints">
        <el-alert
          v-for="(error, index) in validationErrors"
          :key="`error-${index}`"
          :title="typeof error === 'string' ? error : error.message"
          :description="typeof error === 'object' ? error.suggestion : undefined"
          type="error"
          :closable="false"
          show-icon
          class="validation-error"
        />
        <el-alert
          v-for="(warning, index) in validationWarnings"
          :key="`warning-${index}`"
          :title="typeof warning === 'string' ? warning : warning.message"
          :description="typeof warning === 'object' ? warning.suggestion : undefined"
          type="warning"
          :closable="false"
          show-icon
          class="validation-warning"
        />
      </div>

      <!-- 生成中状态 / 生成完成状态 -->
      <GenerationStatus
        :generating="generating"
        :generatedTrip="generatedTrip"
        :generationProgress="generationProgress"
        :progressPercent="progressPercent"
        @cancel-generation="$emit('cancel-generation')"
        @next-step="$emit('next-step')"
      />
    </div>
  </div>
</template>

<script>
import { MagicStick, View as ViewIcon, MapLocation, User, Food, Location, Shop, House } from "@element-plus/icons-vue";
import { 
  getCityName, 
  getBudgetText as getBudgetTextUtil, 
  translateTag, 
  translateTagsToString,
  TRIP_PREFERENCES_OPTIONS
} from "@/utils/data/travelDataSystem.js";
import WeatherPreviewSection from './WeatherPreviewSection.vue';
import GenerationStatus from './GenerationStatus.vue';

export default {
  name: "PromptPreviewCard",
  components: {
    MagicStick,
    ViewIcon,
    MapLocation,
    User,
    Food,
    Location,
    Shop,
    House,
    WeatherPreviewSection,
    GenerationStatus
  },
  props: {
    baseForm: Object,
    preferenceForm: Object,
    currentUserPreferences: Object,
    selectedPreferenceTags: Array,
    hasUserPreferences: Boolean,
    selectedAttractions: Array,
    selectedRestaurants: Array,
    selectedHotels: Array,
    weatherSuggestion: Object,
    loadingWeather: Boolean,
    weatherError: String,
    generating: Boolean,
    generatedTrip: Object,
    generationProgress: String,
    progressPercent: Number,
    selectedGenerationStyle: String,
    validationErrors: {
      type: Array,
      default: () => []
    },
    validationWarnings: {
      type: Array,
      default: () => []
    },
    canGenerateTrip: Boolean,
    promptCompletionText: String,
    promptCompletionClass: String
  },
  emits: ["update:selectedGenerationStyle", "show-full-prompt", "cancel-generation", "next-step"],
  setup(props) {
    // Helper methods that use local imports
    const getSelectedCityName = () => {
      if (!props || !props.baseForm) return "未设置";
      return getCityName(props.baseForm?.destination, props.baseForm?.destinationName);
    };

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

    const getBudgetText = () => {
      if (!props || !props.baseForm) return "未设置";
      return getBudgetTextUtil(props.baseForm.budget);
    };

    const getSystemOptionText = (category, key) => {
      if (!key) return "";
      if (category === 'pacePreference' && key === 'fast') key = 'intensive';
      
      const options = TRIP_PREFERENCES_OPTIONS[category]?.options;
      if (options && options[key]) {
        return `${options[key].name}（${options[key].description}）`;
      }
      return translateTag(key, category);
    };

    const getTripGoalsText = (goals) => {
      if (!goals || goals.length === 0) return "";
      return goals.map(goal => getSystemOptionText('tripPurpose', goal)).join("、");
    };

    const getPacePreferenceText = (pace) => getSystemOptionText('pacePreference', pace);
    const getSocialPreferenceText = (social) => getSystemOptionText('socialPreference', social);
    const getPhotoPreferenceText = (photo) => getSystemOptionText('photoPreference', photo);
    const getFocusAreasText = (areas) => {
      if (!areas || areas.length === 0) return "";
      return translateTagsToString(areas, 'focusAreas');
    };
    const getDietaryRestrictionsText = (restrictions) => {
      if (!restrictions || restrictions.length === 0) return "";
      return translateTagsToString(restrictions, 'specialRequirements');
    };

    return {
      getSelectedCityName,
      formatDateRange,
      getBudgetText,
      getTripGoalsText,
      getPacePreferenceText,
      getSocialPreferenceText,
      getPhotoPreferenceText,
      getFocusAreasText: getFocusAreasText,
      getDietaryRestrictionsText,
      translateTag,
      translateTagsToString
    };
  }
};
</script>

<style scoped>
.ai-prompt-card {
  background: white;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: none;
  border:none;
  transition: all 0.3s ease;
}

.ai-prompt-card:hover {
  border-color: #c0c4cc;
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f5f7fa;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.header-icon-small {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.2);
  flex-shrink: 0;
}

.header-info {
  flex: 1;
}

.card-title {
  margin: 0 0 8px;
  font-weight: 600;
  font-size: 20px;
  color: #303133;
}

.card-subtitle {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.ai-prompt-content {
  padding: 0;
}

.generation-intro {
  text-align: center;
  margin-bottom: 32px;
  padding: 32px 24px;
  background: linear-gradient(135deg, #f8faff 0%, #fff8f8 100%);
  border-radius: 16px;
  border: 1px solid #e8eaed;
}

.generation-intro h3 {
  margin: 16px 0 12px;
  font-weight: 600;
  font-size: 20px;
  color: #303133;
}

.generation-intro p {
  color: #606266;
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
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
  color: #91a8d0;
  font-weight: 500;
}

.generation-options {
  background: linear-gradient(135deg, #f8faff 0%, #fff8f8 100%);
  border: 1px solid #e8eaed;
  border-radius: 16px;
  padding: 24px;
  margin: 24px 0;
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
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
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

.validation-hints {
  margin: 20px 0;
}

.validation-error {
  margin-bottom: 10px;
}

.validation-warning {
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .ai-prompt-card {
    padding: 24px 20px;
    margin-bottom: 24px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
  }

  .header-left {
    width: 100%;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .generation-intro {
    padding: 24px 20px;
    margin-bottom: 24px;
  }

  .generation-intro h3 {
    font-size: 18px;
  }

  .generation-intro p {
    font-size: 14px;
  }

  .prompt-section {
    padding: 16px;
    margin-bottom: 16px;
  }

  .prompt-text,
  .prompt-placeholder {
    font-size: 13px;
  }

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

