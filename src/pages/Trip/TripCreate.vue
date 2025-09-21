<template>
  <div class="trip-create-container">
    <!-- 目的地未选择的提示 - 只在非草稿状态且无目的地时显示 -->
    <div
      v-if="!baseForm.destinationName && !isRestoringProgress && !isFromDraft"
      class="no-destination-notice"
    >
      <el-card class="notice-card" shadow="hover">
        <div class="notice-content">
          <el-icon class="notice-icon" color="#F56C6C" size="48">
            <Location />
          </el-icon>
          <h2>目的地</h2>
          <p>创建行程</p>
          <div class="notice-actions">
            <el-button type="primary" size="large" @click="goToDestinations">
              <el-icon><Location /></el-icon>
              目的地
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

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

      <!-- 草稿操作区域 - 修改显示条件 -->
      <el-card
        v-if="!(!baseForm.destinationName && !isRestoringProgress && !isFromDraft)"
        class="draft-actions-card"
      >
        <div class="draft-actions">
          <div class="draft-actions-left">
            <el-button
              size="small"
              type="info"
              plain
              :disabled="generating"
              @click="showDraftList = true"
            >
              <el-icon><Folder /></el-icon>
              我的草稿 ({{ drafts.length }})
            </el-button>
          </div>
          <div class="draft-actions-right">
            <el-button
              size="small"
              type="primary"
              plain
              :disabled="generating || !canSaveDraft"
              :loading="savingDraft"
              @click="saveDraftDialog = true"
            >
              <el-icon><Document /></el-icon>
              保存草稿
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 步骤内容 -->
      <div class="step-container">
        <!-- 顶部引导条 -->
        <el-alert
          class="onboarding-hint"
          type="success"
          show-icon
          closable
          title="创建向导"
          description="按步骤完成基础信息、偏好设置和AI生成；你可以随时返回修改。"
        />
        <!-- 第一步：基础信息 -->
        <TripBaseInfo
          v-show="currentStep === 0"
          v-model:base-form="baseForm"
          :weather-suggestion="weatherSuggestion"
          :loading-weather="loadingWeather"
          :weather-error="weatherError"
          :saving-draft="savingDraft"
          @next-step="nextStep"
          @fetch-weather="fetchWeatherForTrip"
          @save-draft="handleQuickSaveDraft"
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

        <!-- 第三步：推荐选择 - 根据用户选择动态显示组件 -->
        <!-- AI智能推荐组件 -->
        <EnhancedRecommendationStep
          v-if="currentStep === 2 && recommendationType === 'enhanced'"
          :city-info="{ destinationName: baseForm.destinationName, destination: baseForm.destination }"
          :base-form="baseForm"
          :preference-form="preferenceForm"
          :api-data="aiRecommendationsData"
          :generating="generating"
          @prev-step="prevStep"
          @next-step="nextStep"
          @selections-updated="handleSelectionsUpdated"
          @save-draft="handleQuickSaveDraft"
        />
        
        <!-- 基础推荐组件（高德地图） -->
        <TripRecommendationStep
          v-if="currentStep === 2 && recommendationType === 'basic'"
          :city-info="{ destinationName: baseForm.destinationName, destination: baseForm.destination }"
          :base-form="baseForm"
          :preference-form="preferenceForm"
          :generating="generating"
          @prev-step="prevStep"
          @next-step="nextStep"
          @selections-updated="handleSelectionsUpdated"
          @save-draft="handleQuickSaveDraft"
        />

        <!-- 第四步：智能生成 -->
        <TripGeneration
          v-show="currentStep === 3"
          :base-form="baseForm"
          :preference-form="preferenceForm"
          :user-preferences="userStore.userPreferences"
          :selected-attractions="selectedAttractions"
          :selected-restaurants="selectedRestaurants"
          :extra-requirements="extraRequirements"
          :weather-suggestion="weatherSuggestion"
          :loading-weather="loadingWeather"
          :weather-error="weatherError"
          :generating="generating"
          :generation-progress="generationProgress"
          :progress-percent="progressPercent"
          :saving-draft="savingDraft"
          @update:extra-requirements="extraRequirements = $event"
          @update:generating="generating = $event"
          @update:generation-progress="generationProgress = $event"
          @update:progress-percent="progressPercent = $event"
          @generation-complete="handleGenerationComplete"
          @next-step="nextStep"
          @prev-step="prevStep"
          @save-draft="handleQuickSaveDraft"
        />

        <!-- 第五步：行程展示 -->
        <!-- AI生成的行程展示 -->
        <AiTripDisplay
          v-if="currentStep === 4 && tripData && tripData.content"
          :trip-data="tripData"
          @regenerate="regenerateTrip"
          @save="handleTripSaved"
          @share="handleTripShare"
        />

        <!-- 传统结构化行程展示 -->
        <TripPreview
          v-else-if="currentStep === 4 && tripData && tripData.dailyPlan"
          :trip-data="tripData"
          :is-loading="isLoadingTrip"
          :base-form="baseForm"
          @regenerate="regenerateTrip"
          @saved="handleTripSaved"
          @prev-step="prevStep"
        />
        <!-- 空状态展示 -->
        <div v-else-if="currentStep === 4" class="empty-trip-state">
          <el-empty description="未找到行程数据" :image-size="200">
            >
            <el-button type="primary" @click="regenerateTrip"> 生成行程 </el-button>
          </el-empty>
        </div>
      </div>
    </template>

    <!-- 保存草稿对话框 -->
    <el-dialog
      v-model="saveDraftDialog"
      title="保存草稿"
      width="400px"
      :before-close="handleCloseSaveDraftDialog"
    >
      <el-form label-width="80px">
        <el-form-item label="草稿名称">
          <el-input
            v-model="draftName"
            placeholder="请输入草稿名称"
            maxlength="50"
            show-word-limit
            @keyup.enter="handleSaveDraft"
          />
        </el-form-item>
        <el-form-item label="当前进度">
          <el-tag type="info" size="small">
            第{{ currentStep + 1 }}步：{{ getStepName(currentStep) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="目的地">
          <span class="draft-destination">{{ baseForm.destinationName }}</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="saveDraftDialog = false"> 取消 </el-button>
          <el-button type="primary" :loading="savingDraft" @click="handleSaveDraft">
            <el-icon><Document /></el-icon>
            保存草稿
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 草稿列表对话框 -->
    <el-dialog
      v-model="showDraftList"
      title="我的草稿"
      width="700px"
      :before-close="handleCloseDraftList"
    >
      <div class="draft-list-container">
        <div v-if="drafts.length === 0" class="empty-drafts">
          <el-empty description="暂无保存的草稿" image-size="120">
            <el-button type="primary" @click="showDraftList = false">
              开始创建行程
            </el-button>
          </el-empty>
        </div>

        <div v-else class="draft-grid">
          <div
            v-for="draft in drafts"
            :key="draft.id"
            class="draft-item"
            :class="{ 'draft-item-loading': loadingDraftId === draft.id }"
          >
            <div class="draft-content">
              <div class="draft-header">
                <h4 class="draft-title">
                  {{ draft.name }}
                </h4>
                <el-dropdown trigger="click" @command="handleDraftAction">
                  <el-button link size="small" class="draft-menu-btn">
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="{ action: 'load', id: draft.id }">
                        <el-icon><Folder /></el-icon>
                        加载草稿
                      </el-dropdown-item>
                      <el-dropdown-item :command="{ action: 'rename', id: draft.id }">
                        <el-icon><Edit /></el-icon>
                        重命名
                      </el-dropdown-item>
                      <el-dropdown-item :command="{ action: 'copy', id: draft.id }">
                        <el-icon><CopyDocument /></el-icon>
                        复制
                      </el-dropdown-item>
                      <el-dropdown-item
                        :command="{ action: 'delete', id: draft.id }"
                        divided
                      >
                        <el-icon><Delete /></el-icon>
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>

              <div class="draft-info">
                <div class="draft-destination">
                  <el-icon><Location /></el-icon>
                  {{ draft.baseForm?.destinationName || "未知目的地" }}
                </div>
                <div class="draft-step">
                  <el-icon><List /></el-icon>
                  {{ getStepName(draft.currentStep) }}
                </div>
                <div class="draft-time">
                  <el-icon><Clock /></el-icon>
                  {{ getDraftTimeAgo(draft.updatedAt) }}
                </div>
              </div>

              <div class="draft-actions">
                <el-button
                  type="primary"
                  size="small"
                  :loading="loadingDraftId === draft.id"
                  @click="handleLoadDraft(draft.id)"
                >
                  <el-icon><Folder /></el-icon>
                  加载草稿
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 草稿统计信息 -->
        <div v-if="drafts.length > 0" class="draft-stats">
          <el-divider />
          <div class="stats-row">
            <span>共 {{ drafts.length }} 个草稿</span>
            <el-button type="danger" size="small" plain @click="handleClearAllDrafts">
              <el-icon><Delete /></el-icon>
              清空所有草稿
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 重命名草稿对话框 -->
    <el-dialog v-model="renameDraftDialog" title="重命名草稿" width="400px">
      <el-form label-width="80px">
        <el-form-item label="草稿名称">
          <el-input
            v-model="newDraftName"
            placeholder="请输入新的草稿名称"
            maxlength="50"
            show-word-limit
            @keyup.enter="handleConfirmRename"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="renameDraftDialog = false"> 取消 </el-button>
          <el-button type="primary" :loading="renamingDraft" @click="handleConfirmRename">
            确认重命名
          </el-button>
        </div>
      </template>
    </el-dialog>
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
  onBeforeUnmount,
  nextTick,
} from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Location,
  Folder,
  Document,
  MoreFilled,
  Edit,
  CopyDocument,
  Delete,
  List,
  Clock,
} from "@element-plus/icons-vue";
import { useUserStore } from "@/store/user.js";
import { usePreferenceStore } from "@/store/preference.js";
import { useDraft } from "@/composables/useDraft.js";
import { weatherApi } from "@/api/weather.js";
import { draftApi } from "@/api/draft.js";
import { useWeather } from "@/composables/useWeather.js";
import TripBaseInfo from "@/components/Trip/Steps/TripBaseInfo.vue";
import TripGeneration from "@/components/Trip/Steps/TripGeneration.vue";
import TripPreview from "@/components/Trip/Steps/TripPreview.vue";
import AiTripDisplay from "@/components/Trip/Steps/AiTripDisplay.vue";
import TripPreferencesNew from "@/components/Trip/Steps/TripPreferencesNew.vue";
import TripRecommendationStep from "@/components/Trip/Steps/TripRecommendationStep.vue";
import EnhancedRecommendationStep from "@/components/Trip/Steps/EnhancedRecommendationStep.vue"; 

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
    Location,
    Folder,
    Document,
    MoreFilled,
    Edit,
    CopyDocument,
    Delete,
    List,
    Clock,
  },

  setup() {
    const route = useRoute();
    const router = useRouter();
const userStore = useUserStore();
const preferenceStore = usePreferenceStore();
const draft = useDraft();


    // 当前步骤
    const currentStep = ref(0);

    // 基础表单数据
    const baseForm = reactive({
      destination: "",
      destinationName: "",
      days: 3,
      dateRange: null, // 初始设置为null而不是空数组
      travelers: 1,
      budget: "moderate", // 修改为字符串类型以匹配子组件期望
    });

    // 偏好表单数据 - 使用preferenceStore
    const preferenceForm = computed({
      get: () => preferenceStore.tripPreferenceForm,
      set: (value) => preferenceStore.updateTripPreferences(value),
    });

    // 已选景点和餐厅
    const selectedAttractions = ref([]);
    const selectedRestaurants = ref([]);

    // 额外需求
    const extraRequirements = ref("");

    // 生成的行程数据
    const tripData = ref({});
    const isLoadingTrip = ref(false);

    // AI生成状态
    const generating = ref(false);
    const generationProgress = ref("");
    const progressPercent = ref(0);

    // 天气相关功能
    const { 
      fetchForecastWeather, 
      forecastWeather, 
      isLoadingForecast, 
      error: weatherError
    } = useWeather();

    // 天气建议数据（兼容现有代码）
    const weatherSuggestion = computed(() => {
      if (!forecastWeather.value) return null;
      
      return {
        ...forecastWeather.value,
        forecast: forecastWeather.value.forecast || forecastWeather.value.casts || []
      };
    });

    // 加载状态（兼容现有代码）
    const loadingWeather = computed(() => isLoadingForecast.value);

    // 进度恢复状态
    const isRestoringProgress = ref(false);

    // 草稿状态标识
    const isFromDraft = ref(false);

    // 推荐方式选择 - 默认为enhanced（AI推荐）
    const recommendationType = ref('enhanced');
    
    // AI推荐数据存储
    const aiRecommendationsData = ref(null);

    // 草稿相关状态
    const saveDraftDialog = ref(false);
    const showDraftList = ref(false);
    const renameDraftDialog = ref(false);
    const draftName = ref("");
    const newDraftName = ref("");
    const drafts = ref([]);
    const loadingDraftId = ref("");
    const savingDraft = ref(false);
    const renamingDraft = ref(false);
    const currentRenamingDraftId = ref("");

    // 计算属性：是否可以保存草稿
    const canSaveDraft = computed(() => {
      // 只要不在生成中且有任何表单数据就允许保存草稿
      return (
        !generating.value &&
        (baseForm.destinationName || // 有目的地
          Object.keys(preferenceStore.tripPreferenceForm || {}).length > 0 || // 有偏好设置
          selectedAttractions.value.length > 0 || // 有选中的景点
          selectedRestaurants.value.length > 0 || // 有选中的餐厅
          extraRequirements.value.trim()) // 有额外需求
      );
    });

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

    // 处理行程生成完成事件
    const handleGenerationComplete = (generatedTripData) => {
      tripData.value = generatedTripData;
      nextStep(); // 进入行程预览步骤
    };

    // 重新生成行程
    const regenerateTrip = () => {
      // 回到生成步骤
      currentStep.value = 3;
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // 处理行程保存成功事件
    const handleTripSaved = () => {
      ElMessage.success("更新成功");
      // 保存后的跳转逻辑已经在TripPreview组件中处理
    };

    // 处理行程分享事件
    const handleTripShare = (tripData) => {
      // 分享行程功能
      ElMessage.success("Share WIP");
    };

    // 处理偏好更新事件
    const handlePreferencesUpdate = (preferences) => {
      // 偏好数据已经在 TripPreferencesNew 组件中同步到 store
      // 这里只需要标记数据已更改
      markDataChanged();
    };

    // 处理偏好保存事件
    const handlePreferencesSaved = async (preferences) => {
      // 偏好数据已经通过 preferenceStore 管理，这里确保数据完整性
      if (preferences && Object.keys(preferences).length > 0) {
        // 数据已经在 preferenceStore 中，无需额外处理
        console.log("✅ 偏好数据已保存到 store:", preferences);
      }
      
      ElMessage.success("偏好设置已保存");
      
      // 进入下一步
      nextStep();
    };

    // 处理推荐选择更新事件
    const handleSelectionsUpdated = (selections) => {
      selectedAttractions.value = selections.selectedAttractions || [];
      selectedRestaurants.value = selections.selectedRestaurants || [];
      markDataChanged();
    };

    // 处理AI推荐生成事件
    const handleAiRecommendationsGenerated = (recommendations) => {
      
      if (recommendations) {
        // 将AI推荐结果存储到响应式状态中，供第三步使用
        aiRecommendationsData.value = recommendations;
        
        if (recommendations.attractions) {
        }
        if (recommendations.restaurants) {
        }
        if (recommendations.hotels) {
          // console.log(`🏨 接收到 ${recommendations.hotels.length} 个酒店推荐`);
        }
        
        // 立即检查数据是否正确设置
        // console.log("✅ aiRecommendationsData已设置:", {
        //   hasData: !!aiRecommendationsData.value,
        //   attractionsCount: aiRecommendationsData.value?.attractions?.length || 0,
        //   restaurantsCount: aiRecommendationsData.value?.restaurants?.length || 0,
        //   isError: aiRecommendationsData.value?.isError,
        //   isFallback: aiRecommendationsData.value?.isFallback,
        //   timestamp: new Date().toLocaleTimeString()
        // });
        
        markDataChanged();
        
        // 如果选择了增强推荐模式，确保跳转到推荐选择步骤
        if (recommendationType.value === 'enhanced') {
          // console.log("🎯 AI推荐数据已就绪，当前步骤:", currentStep.value);
          // console.log("🎯 准备跳转到推荐选择步骤 (step 2)");
          
          // 使用 nextTick 确保 Vue 响应式系统更新完成
          nextTick(() => {
            // console.log("🔄 nextTick: aiRecommendationsData.value 状态:", !!aiRecommendationsData.value);
            // console.log("🔄 nextTick: 数据详情:", {
            //   attractions: aiRecommendationsData.value?.attractions?.length || 0,
            //   restaurants: aiRecommendationsData.value?.restaurants?.length || 0
            // });
            
            setTimeout(() => {
              // 确保跳转到第三步（推荐选择）
              if (currentStep.value !== 2) {
                // console.log(`📍 从第${currentStep.value}步跳转到第2步（推荐选择）`);
                // console.log(`📍 跳转前最终确认 aiRecommendationsData:`, !!aiRecommendationsData.value);
                currentStep.value = 2;
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                // console.log("✅ 已在推荐选择步骤，无需跳转");
              }
              
              // 额外验证数据状态
              setTimeout(() => {
                // console.log("🔍 跳转后验证 aiRecommendationsData.value:", !!aiRecommendationsData.value);
                // console.log("🔍 跳转后验证 数据详情:", aiRecommendationsData.value);
              }, 100);
            }, 200); // 减少延迟时间
          });
        }
      } else {
        console.warn("⚠️ 接收到空的推荐数据");
      }
    };

    // 处理用户选择使用AI智能推荐
    const handleUseEnhancedRecommendation = () => {
      console.log("🚀 用户选择使用AI智能推荐");
      recommendationType.value = 'enhanced';
      ElMessage.success("已切换到AI智能推荐模式");
      
      // 不要立即跳转，等待AI推荐数据生成完成
      // nextStep() 将在 handleAiRecommendationsGenerated 中调用
      // console.log("⏳ 等待AI推荐数据生成完成...");
    };

    // 处理用户选择使用基础推荐（高德地图）
    const handleUseBasicRecommendation = () => {
      // console.log("🗺️ 用户选择使用基础推荐（高德地图）");
      recommendationType.value = 'basic';
      ElMessage.success("已切换到基础推荐模式");
    };

    // 获取天气信息
    const fetchWeatherForTrip = async (city, startDate, days) => {
      if (!city) {
        // 缺少城市信息，跳过天气获取
        return;
      }

      try {
        console.log("🌤️ 开始获取天气信息:", { city, startDate, days });
        
        // 使用重构后的天气服务
        await fetchForecastWeather(city);
        
        if (forecastWeather.value) {
          console.log("✅ 天气信息获取成功", forecastWeather.value);
        } else {
          console.log("❌ 天气信息获取失败");
        }
      } catch (error) {
        console.error("❌ 获取天气信息时出错:", error);
      }
    };

    // 跳转到目的地选择页面
    const goToDestinations = () => {
      // 重置草稿状态，因为用户开始新的行程创建
      isFromDraft.value = false;
      router.push("/destinations");
    };

    // 监听城市变化，立即获取天气数据
    watch(
      () => baseForm.destinationName,
      (city) => {

        if (city) {
          // 立即获取天气数据，不依赖用户的日期选择
          fetchWeatherForTrip(city, null, null);
        }
      },
      { immediate: true }
    );

    // 标记数据已更改 - 简化版本（移除draftManager依赖）
    const markDataChanged = () => {
      // 这里可以添加简单的本地状态管理逻辑
      // 现在主要用于调试输出
    };

    // 组件挂载后检查草稿数据和用户偏好
    onMounted(async () => {

      // 首先检查是否有草稿需要恢复
      restoreDraftData();

      // 加载草稿列表
      loadDrafts();

      // 确保用户偏好数据已加载
      if (userStore.isLoggedIn && userStore.currentUser?.id) {
        try {
          await userStore.fetchUserPreferences();
        } catch (error) {
          console.warn("⚠️ 加载用户偏好失败:", error);
        }
      }

      // 检查是否从偏好设置返回
      if (route.query.fromPreferences === "true") {
        // 从偏好设置返回时，强制重新加载偏好数据
        ElMessage.success("偏好设置已更新");
      }

      // 处理模板/场景预填（允许从 /destinations 透传）
      if (route.query.preset) {
        try {
          const payload = JSON.parse(decodeURIComponent(route.query.preset));
          const { type, id } = payload || {};
          if (type && id) {
            if (type === "scenario") {
              const { findScenarioById } = await import("@/data/aiScenarios.js");
              const sc = findScenarioById(id);
              if (sc?.preset) {
                Object.assign(baseForm, {
                  ...baseForm,
                  ...(sc.preset.baseForm || {}),
                });
                Object.assign(preferenceForm, {
                  ...preferenceForm,
                  ...(sc.preset.preferenceForm || {}),
                });
                ElMessage.success(`已应用场景：${sc.title}`);
                // TODO: 可在 TripGeneration 处利用 sc.preset.ai.hint 影响提示词
              }
            }
          }
        } catch (e) {
          console.warn("解析 preset 失败", e);
        }
      }

      // 检查URL中是否包含城市信息
      if (route.query.city && route.query.cityName) {
        baseForm.destination = route.query.city;
        baseForm.destinationName = decodeURIComponent(route.query.cityName); // 解码中文名称
        ElMessage.success(`目的地: ${baseForm.destinationName}`);

        // 注意：天气获取将由watch监听器自动触发，不需要在这里手动调用
      }

      // 尝试恢复进度（简化版：只从URL查询参数恢复）
      if (!route.query.city && !route.query.fromPreferences) {
        // 这里可以添加其他自动恢复逻辑，暂时留空
      }
    });

    // 监听数据变化，标记为已更改 - 使用宽松条件
    watch(
      [
        currentStep,
        baseForm,
        preferenceForm,
        selectedAttractions,
        selectedRestaurants,
        extraRequirements,
      ],
      () => {
        // 允许在任何情况下标记更改，这样可以保存更多的用户输入状态
        markDataChanged();
      },
      { deep: true }
    );

    // 监视 aiRecommendationsData 的变化
    watch(
      () => aiRecommendationsData.value,
      (newData, oldData) => {
        // console.log("🔄 aiRecommendationsData变化:", {
        //   from: oldData ? "有数据" : "无数据",
        //   to: newData ? "有数据" : "无数据",
        //   newData: newData,
        //   attractionsCount: newData?.attractions?.length || 0,
        //   restaurantsCount: newData?.restaurants?.length || 0
        // });
      },
      { deep: true }
    );

    // 路由离开前确认 - 简化版
    onBeforeRouteLeave(async (to, from) => {
      console.log("🚀 路由离开守卫触发，目标路由:", to.path);

      if (generating.value) {
        ElMessage.warning("行程正在生成中，请稍候...");
        return false;
      }

      // 简化的离开确认，不再使用draftManager
      // 这里可以根据需要添加简单的确认逻辑
      console.log("🚀 允许路由离开");
      return true;
    });

    // 初始化草稿列表
    const loadDrafts = async () => {
      try {
        const { useUserStore } = await import("@/store/user.js");
        const userStore = useUserStore();
        const userId = userStore.currentUser?.id;

        if (!userId) return;

        const response = await draftApi.getUserDrafts(userId);
        drafts.value = response.data || [];
      } catch (error) {
        console.error("加载草稿列表失败:", error);
        drafts.value = [];
      }
    };

    // 快捷保存草稿（从子组件调用）
    const handleQuickSaveDraft = async () => {
      if (!canSaveDraft.value) return;

      // 生成默认草稿名称
      const now = new Date();
      const defaultName = `行程草稿_${
        now.getMonth() + 1
      }月${now.getDate()}日_${now.getHours()}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      savingDraft.value = true;
      try {
        const formData = {
          currentStep: currentStep.value,
          baseForm: baseForm,
          preferenceForm: preferenceStore.tripPreferenceForm,
          selectedAttractions: selectedAttractions.value,
          selectedRestaurants: selectedRestaurants.value,
          extraRequirements: extraRequirements.value,
          weatherSuggestion: forecastWeather.value,
          recommendationType: recommendationType.value,
        };

        const draftId = await draft.saveDraft(formData, defaultName);

        if (draftId) {
          await loadDrafts();
        }
      } catch (error) {
        console.error("快捷保存草稿失败:", error);
      } finally {
        savingDraft.value = false;
      }
    };
    const handleSaveDraft = async () => {
      if (!canSaveDraft.value) return;

      savingDraft.value = true;
      try {
        // 简单直接的数据收集
        const formData = {
          currentStep: currentStep.value,
          baseForm: baseForm,
          preferenceForm: preferenceStore.tripPreferenceForm,
          selectedAttractions: selectedAttractions.value,
          selectedRestaurants: selectedRestaurants.value,
          extraRequirements: extraRequirements.value,
          weatherSuggestion: forecastWeather.value,
          recommendationType: recommendationType.value,
        };

        const draftId = await draft.saveDraft(formData, draftName.value);

        if (draftId) {
          saveDraftDialog.value = false;
          draftName.value = "";
          await loadDrafts();
        }
      } catch (error) {
        console.error("保存草稿失败:", error);
      } finally {
        savingDraft.value = false;
      }
    };

    const handleLoadDraft = async (draftId) => {
      loadingDraftId.value = draftId;
      try {
        // 使用新的草稿store加载草稿
        const success = await draft.loadDraft(draftId);
        if (!success) {
          return;
        }

        // 确认是否加载草稿
        await ElMessageBox.confirm(
          `确定要加载草稿吗？当前的进度将会被覆盖。`,
          "加载草稿",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        // 草稿数据已经加载到store中，现在在当前页面恢复数据
        restoreDraftData();

        showDraftList.value = false;
      } catch (error) {
        console.error("❌ 加载草稿失败:", error);
        if (error !== "cancel") {
          ElMessage.error("加载草稿失败！");
        }
      } finally {
        loadingDraftId.value = null;
      }
    };

    const handleDraftAction = (command) => {
      const { action, id } = command;

      switch (action) {
        case "load":
          handleLoadDraft(id);
          break;
        case "rename":
          handleRenameDraft(id);
          break;
        case "copy":
          handleCopyDraft(id);
          break;
        case "delete":
          handleDeleteDraft(id);
          break;
      }
    };

    const handleRenameDraft = async (draftId) => {
      // 使用简单的API调用获取草稿信息
      try {
        const { useUserStore } = await import("@/store/user.js");
        const userStore = useUserStore();
        const userId = userStore.currentUser?.id;

        if (!userId) return;

        const response = await draftApi.getDraft(draftId, userId);
        const draft = response.data;
        if (!draft) return;

        currentRenamingDraftId.value = draftId;
        newDraftName.value = draft.name;
        renameDraftDialog.value = true;
      } catch (error) {
        console.error("获取草稿信息失败:", error);
        ElMessage.error("获取草稿信息失败！");
      }
    };

    const handleConfirmRename = async () => {
      if (!newDraftName.value.trim()) {
        ElMessage.warning("请输入草稿名称！");
        return;
      }

      renamingDraft.value = true;
      try {
        const { useUserStore } = await import("@/store/user.js");
        const userStore = useUserStore();
        const userId = userStore.currentUser?.id;

        if (!userId) return;

        await draftApi.renameDraft(
          currentRenamingDraftId.value,
          newDraftName.value.trim(),
          userId
        );
        ElMessage.success("重命名成功！");
        renameDraftDialog.value = false;
        loadDrafts();
      } catch (error) {
        console.error("重命名草稿失败:", error);
        ElMessage.error("重命名失败！");
      } finally {
        renamingDraft.value = false;
      }
    };

    const handleCopyDraft = async (draftId) => {
      try {
        const { useUserStore } = await import("@/store/user.js");
        const userStore = useUserStore();
        const userId = userStore.currentUser?.id;

        if (!userId) return;

        await draftApi.copyDraft(draftId, `草稿副本_${Date.now()}`, userId);
        ElMessage.success("草稿复制成功！");
        loadDrafts();
      } catch (error) {
        console.error("复制草稿失败:", error);
        ElMessage.error("草稿复制失败！");
      }
    };

    const handleDeleteDraft = async (draftId) => {
      try {
        const { useUserStore } = await import("@/store/user.js");
        const userStore = useUserStore();
        const userId = userStore.currentUser?.id;

        if (!userId) return;

        const response = await draftApi.getDraft(draftId, userId);
        const draft = response.data;
        if (!draft) return;

        await ElMessageBox.confirm(
          `确定要删除草稿"${draft.name}"吗？删除后无法恢复。`,
          "删除草稿",
          {
            confirmButtonText: "确定删除",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        await draftApi.deleteDraft(draftId, userId);
        ElMessage.success("草稿删除成功！");
        loadDrafts();
      } catch (error) {
        if (error === "cancel") {
          // 用户取消，不做处理
        } else {
          console.error("删除草稿失败:", error);
          ElMessage.error("草稿删除失败！");
        }
      }
    };

    const handleClearAllDrafts = async () => {
      try {
        await ElMessageBox.confirm(
          "确定要删除所有草稿吗？删除后无法恢复。",
          "清空所有草稿",
          {
            confirmButtonText: "确定删除",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        const { useUserStore } = await import("@/store/user.js");
        const userStore = useUserStore();
        const userId = userStore.currentUser?.id;

        if (!userId) return;

        // 获取所有草稿ID
        const response = await draftApi.getUserDrafts(userId);
        const draftIds = response.data?.map((draft) => draft.id) || [];

        if (draftIds.length > 0) {
          await draftApi.batchDeleteDrafts(draftIds, userId);
          ElMessage.success("所有草稿已清空！");
          loadDrafts();
        }
      } catch (error) {
        if (error === "cancel") {
          // 用户取消，不做处理
        } else {
          console.error("清空草稿失败:", error);
          ElMessage.error("清空草稿失败！");
        }
      }
    };

    const handleCloseSaveDraftDialog = () => {
      draftName.value = "";
      saveDraftDialog.value = false;
    };

    const handleCloseDraftList = () => {
      showDraftList.value = false;
    };

    // 获取步骤名称
    const getStepName = (step) => {
      const stepNames = ["基础信息", "个性化偏好", "推荐选择", "智能生成", "行程预览"];
      return stepNames[step] || "未知步骤";
    };

    // 获取相对时间
    const getDraftTimeAgo = (timestamp) => {
      const now = Date.now();
      const time = new Date(timestamp).getTime();
      const diff = now - time;

      if (diff < 60000) return "刚刚";
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
      return `${Math.floor(diff / 86400000)}天前`;
    };


    // 简单直接的草稿恢复函数
    const restoreDraftData = () => {
      if (draft.hasDraftToRestore()) {
        const draftData = draft.currentDraft;

        // 恢复步骤
        currentStep.value = draftData.currentStep || 0;

        // 恢复基础表单数据
        if (draftData.baseForm && Object.keys(draftData.baseForm).length > 0) {
          Object.assign(baseForm, draftData.baseForm);
        }

        // 恢复偏好数据
        if (draftData.preferenceForm && Object.keys(draftData.preferenceForm).length > 0) {
          preferenceStore.loadDraftPreferences(draftData.preferenceForm);
        }

        // 恢复其他数据
        selectedAttractions.value = draftData.selectedAttractions || [];
        selectedRestaurants.value = draftData.selectedRestaurants || [];
        extraRequirements.value = draftData.extraRequirements || "";
        // weatherSuggestion 现在是computed属性，从forecastWeather恢复
        if (draftData.weatherSuggestion) {
          forecastWeather.value = draftData.weatherSuggestion;
        }
        recommendationType.value = draftData.recommendationType || 'enhanced';

        // 设置标识
        isFromDraft.value = true;


        // 恢复完成后清除store中的数据
        draft.clearDraft();

        ElMessage.success(`草稿"${draftData.name}"已恢复`);
      } else {
        // 没有检测到草稿数据需要恢复
      }
    };

    // 在主要的onMounted中已经处理了草稿加载逻辑，删除重复的挂载钩子

    return {
      currentStep,
      baseForm,
      preferenceForm,
      selectedAttractions,
      selectedRestaurants,
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
      aiRecommendationsData, // 添加AI推荐数据
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
      isRestoringProgress,
      goToDestinations,
      // 草稿相关
      saveDraftDialog,
      showDraftList,
      renameDraftDialog,
      draftName,
      newDraftName,
      drafts,
      loadingDraftId,
      savingDraft,
      renamingDraft,
      currentRenamingDraftId,
      canSaveDraft,
      handleSaveDraft,
      handleQuickSaveDraft,
      handleLoadDraft,
      handleDraftAction,
      handleRenameDraft,
      handleConfirmRename,
      handleCopyDraft,
      handleDeleteDraft,
      handleClearAllDrafts,
      handleCloseSaveDraftDialog,
      handleCloseDraftList,
      getStepName,
      getDraftTimeAgo,
      isFromDraft,
    };
  },
};
</script>

<style scoped>
/* 目的地未选择提示样式 */
.no-destination-notice {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 20px;
}

.notice-card {
  max-width: 500px;
  width: 100%;
  border-radius: 16px;
  border: 2px solid #f7cac9;
  background: linear-gradient(135deg, rgba(247, 202, 201, 0.1) 0%, #ffffff 100%);
}

.notice-card :deep(.el-card__body) {
  padding: 48px 32px;
}

.notice-content {
  text-align: center;
}

.notice-icon {
  margin-bottom: 24px;
  animation: bounce 2s infinite;
  color: #91a8d0;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.notice-content h2 {
  color: #91a8d0;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.notice-content p {
  color: #666;
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 32px 0;
}

.notice-actions {
  display: flex;
  justify-content: center;
}

.notice-actions .el-button {
  height: 48px;
  padding: 0 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.notice-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(145, 168, 208, 0.3);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .no-destination-notice {
    min-height: 50vh;
    padding: 16px;
  }

  .notice-card :deep(.el-card__body) {
    padding: 32px 24px;
  }

  .notice-content h2 {
    font-size: 20px;
  }

  .notice-content p {
    font-size: 14px;
  }

  .notice-actions .el-button {
    height: 44px;
    padding: 0 24px;
    font-size: 15px;
  }
}

.empty-trip-state {
  padding: 60px 20px;
  text-align: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  margin: 20px 0;
}

.empty-trip-state :deep(.el-empty__description) {
  font-size: 16px;
  color: #666;
  margin: 20px 0;
}

.empty-trip-state :deep(.el-button--primary) {
  padding: 12px 30px;
  font-size: 16px;
  border-radius: 8px;
}

.trip-create-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
  position: relative;
  height: 100%;
  /* overflow: hidden; */
}

.page-title {
  text-align: center;
  margin-bottom: 24px;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
  position: relative;
}

.page-title::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border-radius: 3px;
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
  min-height: auto;
  margin-bottom: 40px;
  overflow: visible;
}

@media (max-width: 768px) {
  .trip-create-container {
    padding: 16px;
    min-height: calc(100vh - 56px); /* 移动端导航栏可能更矮 */
  }

  .page-title {
    font-size: 24px;
    margin-bottom: 16px;
  }

  .steps-card {
    margin-bottom: 16px;
  }

  .step-container {
    padding: 16px;
    margin-bottom: 24px;
  }
}

@media (max-width: 480px) {
  .trip-create-container {
    padding: 10px;
    min-height: calc(100vh - 56px);
  }

  .page-title {
    font-size: 20px;
  }

  .step-container {
    padding: 12px;
    margin-bottom: 16px;
  }
}

/* 草稿相关样式 */
.draft-actions-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.draft-actions-card :deep(.el-card__body) {
  padding: 16px 20px;
}

.draft-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.draft-actions-left,
.draft-actions-right {
padding: 0 5px;
}

.draft-destination {
  color: #606266;
  font-weight: 500;
}

/* 草稿列表样式 */
.draft-list-container {
  max-height: 60vh;
  overflow-y: auto;
}

.empty-drafts {
  padding: 40px;
  text-align: center;
}

.draft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.draft-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: #fff;
}

.draft-item:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.draft-item-loading {
  opacity: 0.7;
  pointer-events: none;
}

.draft-content {
  padding: 16px;
}

.draft-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.draft-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  word-break: break-word;
  flex: 1;
  margin-right: 8px;
}

.draft-menu-btn {
  color: #909399;
  padding: 4px;
  min-height: auto;
}

.draft-menu-btn:hover {
  color: #91a8d0;
}

.draft-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.draft-destination,
.draft-step,
.draft-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.draft-destination .el-icon,
.draft-step .el-icon,
.draft-time .el-icon {
  color: #909399;
  font-size: 16px;
}

.draft-actions {
  display: flex;
  justify-content: flex-end;
}

.draft-stats {
  margin-top: 20px;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #606266;
  font-size: 14px;
}

/* 对话框内表单样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .draft-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .draft-actions-left,
  .draft-actions-right {
    justify-content: center;
  }

  .draft-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .draft-header {
    align-items: center;
  }

  .stats-row {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
}
</style>
