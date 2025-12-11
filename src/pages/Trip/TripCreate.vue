<template>
  <div class="trip-create-container">
    <!-- 目的地未选择的提示 -->
    <TripNoDestination
      v-if="!baseForm.destinationName && !isRestoringProgress"
      @go-to-destinations="goToDestinations"
    />

    <!-- 正常的行程创建界面 -->
    <template v-else>
      <h1 class="page-title">创建行程</h1>

      <el-card class="steps-card">
        <el-steps :active="currentStep" finish-status="success" align-center>
          <el-step title="基础信息" />
          <el-step title="个性化偏好" />
          <el-step title="推荐选择" />
          <el-step title="智能生成" />
          <el-step title="行程预览" />
        </el-steps>
      </el-card>

      <!-- 自动保存状态指示器 -->
      <div v-if="saveStatus !== 'idle'" class="auto-save-indicator" :class="saveStatus">
        <el-icon v-if="saveStatus === 'saving'" class="is-loading"><Loading /></el-icon>
        <el-icon v-if="saveStatus === 'success'"><Check /></el-icon>
        <el-icon v-if="saveStatus === 'error'"><Warning /></el-icon>
        <span>{{ statusText }}</span>
      </div>

      <!-- 步骤内容 -->
      <div class="step-container">
        <!-- 顶部引导条 -->
        <el-alert
          class="onboarding-hint"
          type="success"
          show-icon
          closable
          title="创建向导"
          description="系统会自动保存您的进度，您可以随时关闭页面稍后继续。"
        />
        <!-- 第一步：基础信息 -->
        <TripBaseInfo
          ref="tripBaseInfoRef"
          v-show="currentStep === 0"
          :base-form="baseForm"
          :weather-suggestion="weatherSuggestion"
          :loading-weather="loadingWeather"
          :weather-error="weatherError"
          @next-step="nextStep"
          @fetch-weather="fetchWeatherForTrip"
          @change="(val) => Object.assign(baseForm, val)"
        />

        <!-- 第二步：个性化偏好 -->
        <TripPreferencesNew
          v-show="currentStep === 1"
          :trip-context="{ 
            destination: baseForm.destinationName,
            days: baseForm.days,
            dateRange: baseForm.dateRange,
            travelers: baseForm.travelers,
            budget: baseForm.budget
          }"
          @preferences-updated="handlePreferencesUpdate"
          @preferences-saved="handlePreferencesSaved"
          @ai-recommendations-generated="handleAiRecommendationsGenerated"
          @use-enhanced-recommendation="handleUseEnhancedRecommendation"
          @use-basic-recommendation="handleUseBasicRecommendation"
          @go-to-previous-step="prevStep"
        />

        <!-- 第三步：推荐选择 -->
        <EnhancedRecommendationStep
          v-if="currentStep === 2 && recommendationType === 'enhanced'"
          :city-info="{ destinationName: baseForm.destinationName, destination: baseForm.destination }"
          :base-form="baseForm"
          :preference-form="preferenceForm"
          :api-data="aiRecommendationsData"
          :generating="generating"
          :initial-selected-attractions="selectedAttractions"
          :initial-selected-restaurants="selectedRestaurants"
          :initial-selected-hotels="selectedHotels"
          @prev-step="prevStep"
          @next-step="nextStep"
          @selections-updated="handleSelectionsUpdated"
        />
        
        <TripRecommendationStep
          v-if="currentStep === 2 && recommendationType === 'basic'"
          :city-info="{ destinationName: baseForm.destinationName, destination: baseForm.destination }"
          :base-form="baseForm"
          :preference-form="preferenceForm"
          :generating="generating"
          :initial-selected-attractions="selectedAttractions"
          :initial-selected-restaurants="selectedRestaurants"
          :initial-selected-hotels="selectedHotels"
          @prev-step="prevStep"
          @next-step="nextStep"
          @selections-updated="handleSelectionsUpdated"
        />

        <!-- 第四步：智能生成 -->
        <TripGeneration
          v-show="currentStep === 3"
          :base-form="baseForm"
          :preference-form="preferenceForm"
          :user-preferences="userStore.userPreferences"
          :selected-attractions="selectedAttractions"
          :selected-restaurants="selectedRestaurants"
          :selected-hotels="selectedHotels"
          :extra-requirements="extraRequirements"
          :weather-suggestion="weatherSuggestion"
          :loading-weather="loadingWeather"
          :weather-error="weatherError"
          :generating="generating"
          :generation-progress="generationProgress"
          :progress-percent="progressPercent"
          @update:extra-requirements="extraRequirements = $event"
          @update:generating="generating = $event"
          @update:generation-progress="generationProgress = $event"
          @update:progress-percent="progressPercent = $event"
          @generation-complete="handleGenerationComplete"
          @next-step="nextStep"
          @prev-step="prevStep"
        />

        <!-- 第五步：行程展示 -->
        <AiTripDisplay
          v-if="currentStep === 4 && tripData && tripData.content"
          :trip-data="tripData"
          @regenerate="regenerateTrip"
          @save="handleTripSaved"
          @share="handleTripShare"
        />

        <TripPreview
          v-else-if="currentStep === 4 && tripData && tripData.dailyPlan"
          :trip-data="tripData"
          :is-loading="isLoadingTrip"
          :base-form="baseForm"
          @regenerate="regenerateTrip"
          @saved="handleTripSaved"
          @prev-step="prevStep"
        />
        
        <div v-else-if="currentStep === 4" class="empty-trip-state">
          <el-empty description="未找到行程数据" :image-size="200">
            <el-button type="primary" @click="regenerateTrip"> 生成行程 </el-button>
          </el-empty>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import {
  ref,
  reactive,
  computed,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { ElMessage } from "element-plus";
import { Check, Loading, Warning } from "@element-plus/icons-vue";
import { useUserStore } from "@/store/user.js";
import { usePreferenceStore } from "@/store/preference.js";
import { useDraft } from "@/composables/trip/useDraft.js";
import { useProfile } from "@/composables/user/useProfile.js";
import { useWeather } from "@/composables/common/useWeather.js";

// 组件引入
import TripBaseInfo from "@/components/Trip/Steps/TripBaseInfo.vue";
import TripGeneration from "@/components/Trip/Steps/TripGeneration.vue";
import TripPreview from "@/components/Trip/Steps/TripPreview.vue";
import AiTripDisplay from "@/components/Trip/Steps/AiTripDisplay.vue";
import TripPreferencesNew from "@/components/Trip/Steps/TripPreferencesNew.vue";
import TripRecommendationStep from "@/components/Trip/Steps/TripRecommendationStep.vue";
import EnhancedRecommendationStep from "@/components/Trip/Steps/EnhancedRecommendationStep.vue"; 
import TripNoDestination from "@/components/Trip/Steps/TripNoDestination.vue";

export default {
  name: "TripCreate",
  components: {
    TripBaseInfo,
    TripPreferencesNew,
    TripRecommendationStep,
    EnhancedRecommendationStep,
    TripGeneration,
    TripPreview,
    AiTripDisplay,
    TripNoDestination,
    Check,
    Loading,
    Warning
  },

  setup() {
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    const preferenceStore = usePreferenceStore();
    const { fetchUserPreferences } = useProfile();
    
    // 使用新的 useDraft Hook
    const { 
      setupAutoSave, 
      forceSave, 
      checkAndRestoreAutoDraft, 
      saveStatus 
    } = useDraft();

    // 当前步骤
    const currentStep = ref(0);

    const tripBaseInfoRef = ref(null);

    // 基础表单数据
    const baseForm = reactive({
      destination: "",
      destinationName: "",
      days: 3,
      dateRange: null,
      travelers: 1,
      budget: "moderate",
    });

    // 偏好表单数据
    const preferenceForm = computed({
      get: () => preferenceStore.tripPreferenceForm,
      set: (value) => preferenceStore.updateTripPreferences(value),
    });

    // 已选数据
    const selectedAttractions = ref([]);
    const selectedRestaurants = ref([]);
    const selectedHotels = ref([]);
    const extraRequirements = ref("");

    // 生成结果
    const tripData = ref({});
    const isLoadingTrip = ref(false);
    const generating = ref(false);
    const generationProgress = ref("");
    const progressPercent = ref(0);
    const isRestoringProgress = ref(false);

    // AI/推荐相关
    const recommendationType = ref('enhanced');
    const aiRecommendationsData = ref(null);

    // 自动保存状态文本
    const statusText = computed(() => {
        switch (saveStatus.value) {
            case 'waiting': return '等待保存...';
            case 'saving': return '保存中...';
            case 'success': return '已自动保存';
            case 'error': return '保存失败';
            default: return '';
        }
    });

    // 天气相关
    const { 
      fetchForecastWeather, 
      forecastWeather, 
      isLoadingForecast, 
      error: weatherError
    } = useWeather();

    const weatherSuggestion = computed(() => {
      if (!forecastWeather.value) return null;
      return {
        ...forecastWeather.value,
        forecast: forecastWeather.value.forecast || forecastWeather.value.casts || []
      };
    });
    const loadingWeather = computed(() => isLoadingForecast.value);

    const getData = () => {
      // 优先从子组件获取最新的基础信息状态，确保数据实时性
      let currentBaseForm = { ...baseForm };
      if (tripBaseInfoRef.value) {
          const childData = tripBaseInfoRef.value.getFormData();
          // 合并数据，以子组件为准
          Object.assign(currentBaseForm, childData);
      }

      // 显式提取日期数组，强制转换为纯数组，规避 Proxy 问题
      let rawDateRange = null;
      if (currentBaseForm.dateRange && Array.isArray(currentBaseForm.dateRange) && currentBaseForm.dateRange.length === 2) {
          rawDateRange = [currentBaseForm.dateRange[0], currentBaseForm.dateRange[1]];
      }

      const safeBaseForm = {
        destination: currentBaseForm.destination,
        destinationName: currentBaseForm.destinationName,
        days: Number(currentBaseForm.days),
        travelers: Number(currentBaseForm.travelers),
        budget: currentBaseForm.budget,
        dateRange: rawDateRange
      };

      return {
        currentStep: currentStep.value,
        baseForm: safeBaseForm,
        preferenceForm: { ...preferenceStore.tripPreferenceForm },
        selectedAttractions: [...selectedAttractions.value],
        selectedRestaurants: [...selectedRestaurants.value],
        selectedHotels: [...selectedHotels.value],
        extraRequirements: extraRequirements.value,
        weatherSuggestion: forecastWeather.value,
        recommendationType: recommendationType.value,
        aiRecommendationsData: aiRecommendationsData.value,
      };
    };

    const restoreDraftData = (draftData) => {
      // 基础信息恢复
      if (draftData.baseForm) {
        // 使用 Object.assign 批量更新本地响应式对象
        Object.assign(baseForm, draftData.baseForm);
        
        // 类型转换修复
        if (baseForm.travelers) baseForm.travelers = Number(baseForm.travelers);
        if (baseForm.days) baseForm.days = Number(baseForm.days);
        
        // 日期处理
        if (draftData.baseForm.dateRange && Array.isArray(draftData.baseForm.dateRange)) {
             baseForm.dateRange = draftData.baseForm.dateRange;
        }

        // 【关键】同步给子组件，确保 UI 状态正确
        if (tripBaseInfoRef.value) {
            tripBaseInfoRef.value.setFormData(baseForm);
        } else {
            // 如果子组件还没挂载，nextTick 后再试一次
            nextTick(() => {
                if (tripBaseInfoRef.value) {
                    tripBaseInfoRef.value.setFormData(baseForm);
                }
            });
        }
      }

      if (draftData.preferenceForm) {
          preferenceStore.loadDraftPreferences(draftData.preferenceForm);
      }
      
      // 恢复已选项目
      selectedAttractions.value = draftData.selectedAttractions || [];
      selectedRestaurants.value = draftData.selectedRestaurants || [];
      selectedHotels.value = draftData.selectedHotels || [];
      
      extraRequirements.value = draftData.extraRequirements || "";
      if (draftData.weatherSuggestion) forecastWeather.value = draftData.weatherSuggestion;
      
      // 恢复 AI 推荐数据 & 决定推荐模式
      if (draftData.aiRecommendationsData && Object.keys(draftData.aiRecommendationsData).length > 0) {
        aiRecommendationsData.value = draftData.aiRecommendationsData;
        recommendationType.value = 'enhanced';
      } else {
        recommendationType.value = draftData.recommendationType || 'basic';
      }

      // 恢复步骤
      currentStep.value = draftData.currentStep || 0;
      
      ElMessage.success("已恢复上次的编辑进度");
    };


    // 步骤控制
    const nextStep = () => {
      if (currentStep.value < 4) {
        currentStep.value += 1;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    const prevStep = () => {
      if (currentStep.value > 0) {
        currentStep.value -= 1;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    // 其他业务逻辑处理
    const handleGenerationComplete = (generatedTripData) => {
      tripData.value = generatedTripData;
      nextStep();
    };

    const regenerateTrip = () => {
      currentStep.value = 3;
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleTripSaved = () => {
      ElMessage.success("行程已保存");
    };

    const handleTripShare = () => {
      ElMessage.success("分享功能开发中");
    };

    const handlePreferencesUpdate = () => {}; 
    const handlePreferencesSaved = () => { nextStep(); };
    
    const handleSelectionsUpdated = (selections) => {
      if (selections.selectedAttractions) selectedAttractions.value = selections.selectedAttractions;
      if (selections.selectedRestaurants) selectedRestaurants.value = selections.selectedRestaurants;
      if (selections.selectedHotels) selectedHotels.value = selections.selectedHotels;
    };

    const handleAiRecommendationsGenerated = async (recommendations) => {
      aiRecommendationsData.value = recommendations;
      
      // 立即保存草稿，防止刷新丢失昂贵的 AI 数据
      await forceSave(getData());

      if (recommendationType.value === 'enhanced') {
        nextTick(() => {
          setTimeout(() => {
            if (currentStep.value !== 2) {
              currentStep.value = 2;
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }, 200);
        });
      }
    };

    const handleUseEnhancedRecommendation = () => { recommendationType.value = 'enhanced'; };
    const handleUseBasicRecommendation = () => { recommendationType.value = 'basic'; };

    const fetchWeatherForTrip = async (city) => {
      if (city) await fetchForecastWeather(city);
    };

    const goToDestinations = () => {
      router.push("/destinations");
    };

    // 监听城市变化
    watch(() => baseForm.destinationName, (city) => {
      console.log("🏙️ destinationName changed to:", city);
      if (city) {
        fetchWeatherForTrip(city);
      } else if (!isRestoringProgress.value) {
        // 如果非恢复状态下城市被清空，记录日志
        console.warn("⚠️ destinationName cleared unexpectedly");
      }
    });

    let autoSaveCleanup = null;

    onUnmounted(() => {
      if (autoSaveCleanup) autoSaveCleanup();
    });

    // 生命周期
    onMounted(async () => {
      // 1. 加载用户偏好
      if (userStore.isLoggedIn) await fetchUserPreferences();
      
      // 2. 检查是否有自动保存的草稿需要恢复
      // 只有当不是从"目的地选择页"特意跳过来开始新行程时，才检查
      if (!route.query.city && !route.query.preset) {
        isRestoringProgress.value = true;
        try {
          const draftData = await checkAndRestoreAutoDraft();
          if (draftData) {
              restoreDraftData(draftData);
          }
        } finally {
          isRestoringProgress.value = false;
        }
      }
      
      // 3. 处理URL参数预设 (Keep existing logic)
      if (route.query.city && route.query.cityName) {
        baseForm.destination = route.query.city;
        baseForm.destinationName = decodeURIComponent(route.query.cityName);
      }

      // 4. 启动自动保存监听
      // 传入 getData 函数，useDraft 会监听其返回值变化
      autoSaveCleanup = setupAutoSave(getData);
    });

    // 路由守卫：离开前保存
    onBeforeRouteLeave(async () => {
      if (generating.value) {
        ElMessage.warning("行程正在生成中...");
        return false;
      }
      // 离开时尝试最后一次强制保存
      if (baseForm.destinationName) {
         await forceSave(getData());
      }
      return true;
    });

    return {
      currentStep,
      baseForm,
      preferenceForm,
      selectedAttractions,
      selectedRestaurants,
      selectedHotels,
      extraRequirements,
      tripData,
      isLoadingTrip,
      generating,
      generationProgress,
      progressPercent,
      weatherSuggestion,
      loadingWeather,
      weatherError,
      userStore,
      recommendationType,
      aiRecommendationsData,
      nextStep,
      prevStep,
      handleGenerationComplete,
      regenerateTrip,
      handleTripSaved,
      handleTripShare,
      handlePreferencesUpdate,
      handlePreferencesSaved,
      handleSelectionsUpdated,
      handleAiRecommendationsGenerated,
      handleUseEnhancedRecommendation,
      handleUseBasicRecommendation,
      fetchWeatherForTrip,
      goToDestinations,
      isRestoringProgress,
      saveStatus,
      statusText
    };
  },
};
</script>

<style scoped>
.trip-create-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  min-height: 80vh;
}

.page-title {
  text-align: center;
  margin-bottom: 24px;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
  position: relative;
}

.steps-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.step-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  min-height: 500px;
  margin-bottom: 40px;
}

/* 自动保存指示器 */
.auto-save-indicator {
  position: fixed;
  top: 80px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  color: #606266;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 100;
  transition: all 0.3s;
  border: 1px solid #ebeef5;
}

.auto-save-indicator.success {
    color: #67c23a;
    border-color: #e1f3d8;
    background-color: #f0f9eb;
}

.auto-save-indicator.error {
    color: #f56c6c;
    border-color: #fde2e2;
    background-color: #fef0f0;
}

.auto-save-indicator.saving {
    color: #409eff;
    border-color: #d9ecff;
    background-color: #ecf5ff;
}

.empty-trip-state {
  padding: 60px 20px;
  text-align: center;
}

/* 适配移动端 */
@media (max-width: 768px) {
  .trip-create-container {
    padding: 10px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .step-container {
    padding: 10px;
  }
  
  .auto-save-indicator {
    top: auto;
    bottom: 20px;
    right: 50%;
    transform: translateX(50%);
  }
}
</style>