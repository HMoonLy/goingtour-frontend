<template>
  <div class="trip-create-container">
    <!-- 目的地未选择的提示 -->
    <div v-if="!baseForm.destinationName && !isRestoringProgress" class="no-destination-notice">
      <el-card class="notice-card" shadow="hover">
        <div class="notice-content">
          <el-icon class="notice-icon" color="#F56C6C" size="48">
            <Location />
          </el-icon>
          <h2>{{ t('trip.destination') }}</h2>
          <p>{{ t('trip.createTrip') }}</p>
          <div class="notice-actions">
            <el-button type="primary" size="large" @click="goToDestinations">
              <el-icon><Location /></el-icon>
              {{ t('trip.destination') }}
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 正常的行程创建界面 -->
    <template v-else>
      <h1 class="page-title">{{ t('trip.createTrip') }}</h1>

      <el-card class="steps-card">
        <el-steps :active="currentStep"
  finish-status="success" align-center>
          <el-step :title="t('trip.editTrip') || '基础信息'" />
          <el-step :title="t('trip.preferences') || '个性化偏好'" />
          <el-step :title="t('trip.aiGeneration') || '智能生成'" />
          <el-step :title="t('trip.tripDetails') || '行程预览'" />
        </el-steps>
        
        <!-- 草稿操作区域 -->
        <div class="draft-actions" v-if="baseForm.destinationName">
          <div class="draft-actions-left">
            <el-button 
              size="small" 
              type="info" 
              plain 
              @click="showDraftList = true"
              :disabled="generating"
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
              @click="saveDraftDialog = true"
              :disabled="generating || !canSaveDraft"
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
        :title="t('trip.onboarding.title') || '创建向导'"
        :description="t('trip.onboarding.desc') || '按步骤完成基础信息、偏好设置和AI生成；你可以随时返回修改。'"
      />
      <!-- 第一步：基础信息 -->
      <TripBaseInfo
        v-show="currentStep === 0"
        v-model:base-form="baseForm"
        :weather-suggestion="weatherSuggestion"
        :loading-weather="loadingWeather"
        :weather-error="weatherError"
        @next-step="nextStep"
        @fetch-weather="fetchWeatherForTrip"
      />

      <!-- 第二步：个性化偏好 -->
      <TripPreferences
        v-show="currentStep === 1"
        v-model:preference-form="preferenceForm"
        :base-form="baseForm"
        :user-preferences="userStore.userPreferences"
        :selected-attractions="selectedAttractions"
        :selected-restaurants="selectedRestaurants"
        :is-from-draft="isFromDraft"
        @update:selected-attractions="selectedAttractions = $event"
        @update:selected-restaurants="selectedRestaurants = $event"
        @next-step="nextStep"
        @prev-step="prevStep"
      />

      <!-- 第三步：智能生成 -->
      <TripGeneration
        v-show="currentStep === 2"
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
        @update:extra-requirements="extraRequirements = $event"
        @update:generating="generating = $event"
        @update:generation-progress="generationProgress = $event"
        @update:progress-percent="progressPercent = $event"
        @generation-complete="handleGenerationComplete"
        @next-step="nextStep"
        @prev-step="prevStep"
      />

      <!-- 第四步：行程展示 -->
      <!-- AI生成的行程展示 -->
      <AiTripDisplay
        v-if="currentStep === 3 && tripData && tripData.content"
        :trip-data="tripData"
        @regenerate="regenerateTrip"
        @save="handleTripSaved"
        @share="handleTripShare"
      />
      
      <!-- 传统结构化行程展示 -->
      <TripPreview
        v-else-if="currentStep === 3 && tripData && tripData.dailyPlan"
        :trip-data="tripData"
        :is-loading="isLoadingTrip"
        :base-form="baseForm"
        @regenerate="regenerateTrip"
        @saved="handleTripSaved"
        @prev-step="prevStep"
      />
      
      <!-- 空状态展示 -->
      <div v-else-if="currentStep === 3" class="empty-trip-state">
          <el-empty 
          :description="t('trip.noTripData')"
          :image-size="200"
        >
          <el-button type="primary" @click="regenerateTrip">
            {{ t('trip.generateTrip') }}
          </el-button>
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
          <el-button @click="saveDraftDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSaveDraft" :loading="savingDraft">
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
                <h4 class="draft-title">{{ draft.name }}</h4>
                <el-dropdown @command="handleDraftAction" trigger="click">
                  <el-button type="text" size="small" class="draft-menu-btn">
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="{action: 'load', id: draft.id}">
                        <el-icon><Folder /></el-icon>
                        加载草稿
                      </el-dropdown-item>
                      <el-dropdown-item :command="{action: 'rename', id: draft.id}">
                        <el-icon><Edit /></el-icon>
                        重命名
                      </el-dropdown-item>
                      <el-dropdown-item :command="{action: 'copy', id: draft.id}">
                        <el-icon><CopyDocument /></el-icon>
                        复制
                      </el-dropdown-item>
                      <el-dropdown-item :command="{action: 'delete', id: draft.id}" divided>
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
                  {{ draft.baseForm?.destinationName || '未知目的地' }}
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
                  @click="handleLoadDraft(draft.id)"
                  :loading="loadingDraftId === draft.id"
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
            <el-button 
              type="danger" 
              size="small" 
              plain 
              @click="handleClearAllDrafts"
            >
              <el-icon><Delete /></el-icon>
              清空所有草稿
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 重命名草稿对话框 -->
    <el-dialog 
      v-model="renameDraftDialog" 
      title="重命名草稿" 
      width="400px"
    >
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
          <el-button @click="renameDraftDialog = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmRename" :loading="renamingDraft">
            确认重命名
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch, onBeforeUnmount, nextTick } from "vue";
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
  Clock 
} from "@element-plus/icons-vue";
import { useI18n } from "@/utils/i18n.js";
import { useUserStore } from "@/store/user.js";
import { weatherApi } from "@/api/weather.js";
import { draftManager } from "@/utils/draftManager.js";
import TripBaseInfo from "@/components/Trip/TripBaseInfo.vue";
import TripPreferences from "@/components/Trip/TripPreferences.vue";
import TripGeneration from "@/components/Trip/TripGeneration.vue";
import TripPreview from "@/components/Trip/TripPreview.vue";
import AiTripDisplay from "@/components/Trip/AiTripDisplay.vue";

export default {
  name: "TripCreate",
  components: {
    TripBaseInfo,
    TripPreferences,
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
    const { t } = useI18n();

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

    // 偏好表单数据 - 更新为新的AI-focused结构
    const preferenceForm = reactive({
      tripGoals: [], // 行程目标
      pacePreference: "balanced", // 行程节奏偏好
      focusAreas: [], // 重点体验（合并了最想体验和特别体验）
      socialPreference: "mixed", // 社交环境偏好
      photoPreference: "casual", // 拍照打卡需求
      dietaryRestrictions: [], // 饮食禁忌
      customDietaryNotes: "", // 其他饮食禁忌
      specialRequirements: "", // 特殊需求
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

    // 天气相关状态
    const weatherSuggestion = ref(null);
    const loadingWeather = ref(false);
    const weatherError = ref(null);

    // 进度恢复状态
    const isRestoringProgress = ref(false);
    
    // 草稿状态标识
    const isFromDraft = ref(false);

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
      return baseForm.destinationName && !generating.value;
    });

    // 步骤控制
    const nextStep = () => {
      if (currentStep.value < 3) {
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
      currentStep.value = 2;
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // 处理行程保存成功事件
    const handleTripSaved = () => {
      ElMessage.success(t('messages.updateSuccess'));
      // 保存后的跳转逻辑已经在TripPreview组件中处理
    };

    // 处理行程分享事件
    const handleTripShare = (tripData) => {
      // 分享行程功能
      ElMessage.success('Share WIP');
    };

    // 获取天气信息
    const fetchWeatherForTrip = async (city, startDate, days) => {
      if (!city) {
        // 缺少城市信息，跳过天气获取
        return;
      }

      try {
        loadingWeather.value = true;
        weatherError.value = null;
        
        if (startDate && days) {
          // 获取天气信息
          const weatherData = await weatherApi.getWeatherSuggestions(city, new Date(startDate), days);
          if (weatherData) {
            weatherSuggestion.value = weatherData;
            console.log("✅ 天气信息获取成功", weatherData);
          }
        } else {
          console.log(`🌤️ 开始获取${city}的基础天气数据（不依赖日期选择）`);
          // 获取基础天气数据，不依赖用户的具体日期选择
          const weatherData = await weatherApi.getWeatherSuggestions(city, new Date(), 3); // 默认3天
          if (weatherData) {
            weatherSuggestion.value = weatherData;
            console.log("✅ 基础天气信息获取成功", weatherData);
          }
        }
        
        if (!weatherSuggestion.value) {
          weatherError.value = t('messages.updateFailed');
          console.log("❌ 天气信息获取失败");
        }
      } catch (error) {
        console.error("❌ 获取天气信息时出错:", error);
        weatherError.value = error.message || t('messages.updateFailed');
      } finally {
        loadingWeather.value = false;
      }
    };

    // 跳转到目的地选择页面
    const goToDestinations = () => {
      // 重置草稿状态，因为用户开始新的行程创建
      isFromDraft.value = false;
      router.push('/destinations');
    };

    // 监听城市变化，立即获取天气数据
    watch(
      () => baseForm.destinationName,
      (city) => {
        console.log(`🔍 监听到城市变化：${city}`);
        
        if (city) {
          // 清空之前的天气数据
          weatherSuggestion.value = null;
          weatherError.value = null;
          
          console.log(`🌤️ 城市确定，立即获取天气数据：${city}`);
          // 立即获取天气数据，不依赖用户的日期选择
          fetchWeatherForTrip(city, null, null);
        }
      },
      { immediate: true }
    );

    // 标记数据已更改
    const markDataChanged = () => {
      // 只有在有目的地信息时才标记更改
      if (!baseForm.destinationName) return;

      const progressData = {
        currentStep: currentStep.value,
        baseForm: JSON.parse(JSON.stringify(baseForm)),
        preferenceForm: JSON.parse(JSON.stringify(preferenceForm)),
        selectedAttractions: selectedAttractions.value,
        selectedRestaurants: selectedRestaurants.value,
        extraRequirements: extraRequirements.value,
        weatherSuggestion: weatherSuggestion.value
      };
      
      // 标记数据已更改
      draftManager.markAsChanged(progressData);
    };

    // 恢复进度功能（基于新的草稿系统）
    const restoreProgress = async () => {
      // 检查是否有自动草稿
      if (!(await draftManager.hasAutoDraft())) {
        return false;
      }

      isRestoringProgress.value = true;
      
      try {
        // 获取自动草稿摘要
        const progressSummary = await draftManager.getAutoDraftSummary();
        if (!progressSummary) return false;
        
        await ElMessageBox.confirm(
          `发现您有未完成的行程创建进度：\n目的地：${progressSummary.destination}\n步骤：${progressSummary.stepName}\n保存时间：${progressSummary.timeAgo}\n\n是否继续之前的进度？`,
          '恢复创建进度',
          {
            confirmButtonText: '恢复进度',
            cancelButtonText: '重新开始',
            type: 'info',
          }
        );

        // 获取自动草稿数据
        const autoDraft = await draftManager.getAutoDraft();
        
        if (autoDraft) {
          // 恢复数据 - 使用更安全的方式更新reactive对象
          currentStep.value = autoDraft.currentStep;
          
          // 清空并重新设置baseForm
          Object.keys(baseForm).forEach(key => delete baseForm[key]);
          Object.assign(baseForm, autoDraft.baseForm);
          
          // 清空并重新设置preferenceForm
          Object.keys(preferenceForm).forEach(key => delete preferenceForm[key]);
          Object.assign(preferenceForm, autoDraft.preferenceForm);
          
          selectedAttractions.value = autoDraft.selectedAttractions || [];
          selectedRestaurants.value = autoDraft.selectedRestaurants || [];
          extraRequirements.value = autoDraft.extraRequirements || "";
          weatherSuggestion.value = autoDraft.weatherSuggestion || null;

          // 设置草稿状态
          isFromDraft.value = true;

          ElMessage.success(`已恢复到第${autoDraft.currentStep + 1}步：${progressSummary.stepName}`);
          return true;
        }
      } catch {
        // 用户选择重新开始，删除自动草稿
        const autoDraft = await draftManager.getAutoDraft();
        if (autoDraft) {
          await draftManager.deleteDraft(autoDraft.id);
        }
        ElMessage.info('已开始新的行程创建');
      } finally {
        isRestoringProgress.value = false;
      }
      
      return false;
    };

    // 组件挂载后检查URL参数并加载用户偏好
    onMounted(async () => {
      console.log("🚀 TripCreate组件挂载，获取路由参数:", route.query);
      console.log("🌤️ 当前基础表单数据:", {
        destination: baseForm.destination,
        destinationName: baseForm.destinationName,
        dateRange: baseForm.dateRange,
        days: baseForm.days
      });

      // 首先加载草稿列表
      loadDrafts();

      // 检查是否有直接草稿加载请求
      await handleDirectDraftLoad();

      // 确保用户偏好数据已加载
      if (userStore.isLoggedIn && userStore.currentUser?.id) {
        try {
          console.log("🔄 加载用户偏好数据...");
          await userStore.fetchUserPreferences();
          console.log("✅ 用户偏好数据加载完成");
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
          const payload = JSON.parse(decodeURIComponent(route.query.preset))
          const { type, id } = payload || {}
          if (type && id) {
            if (type === 'scenario') {
              const { findScenarioById } = await import('@/data/aiScenarios.js')
              const sc = findScenarioById(id)
              if (sc?.preset) {
                Object.assign(baseForm, { ...baseForm, ...(sc.preset.baseForm || {}) })
                Object.assign(preferenceForm, { ...preferenceForm, ...(sc.preset.preferenceForm || {}) })
                ElMessage.success(`已应用场景：${sc.title}`)
                // TODO: 可在 TripGeneration 处利用 sc.preset.ai.hint 影响提示词
              }
            }
          }
        } catch (e) {
          console.warn('解析 preset 失败', e)
        }
      }

      // 检查URL中是否包含城市信息
      if (route.query.city && route.query.cityName) {
        baseForm.destination = route.query.city;
        baseForm.destinationName = decodeURIComponent(route.query.cityName); // 解码中文名称
        console.log(`从URL获取到目的地城市：${baseForm.destinationName}(${baseForm.destination})`);
        ElMessage.success(`${t('trip.destination')}: ${baseForm.destinationName}`);
        
        // 注意：天气获取将由watch监听器自动触发，不需要在这里手动调用
      }

      // 尝试恢复进度（只有在没有URL参数时才尝试恢复）
      if (!route.query.city && !route.query.fromPreferences) {
        await restoreProgress();
      }
    });

    // 监听数据变化，标记为已更改
    watch([currentStep, baseForm, preferenceForm, selectedAttractions, selectedRestaurants, extraRequirements], 
      () => {
        // 只有在有基本信息时才标记更改
        if (baseForm.destinationName) {
          markDataChanged();
        }
      }, 
      { deep: true }
    );

    // 成功保存行程后重置更改状态
    const originalHandleTripSaved = handleTripSaved;
    const enhancedHandleTripSaved = () => {
      draftManager.resetChangeState();
      originalHandleTripSaved();
    };

    // 路由离开前确认
    onBeforeRouteLeave(async (to, from) => {
      if (generating.value) {
        ElMessage.warning('行程正在生成中，请稍候...');
        return false;
      }

      const progressData = {
        currentStep: currentStep.value,
        baseForm: JSON.parse(JSON.stringify(baseForm)),
        preferenceForm: JSON.parse(JSON.stringify(preferenceForm)),
        selectedAttractions: selectedAttractions.value,
        selectedRestaurants: selectedRestaurants.value,
        extraRequirements: extraRequirements.value,
        weatherSuggestion: weatherSuggestion.value
      };

      const canLeave = await draftManager.confirmBeforeExit(progressData);
      return canLeave;
    });

    // 初始化草稿列表
    const loadDrafts = async () => {
      drafts.value = await draftManager.getAllDrafts();
    };

    // 草稿相关方法
    const handleSaveDraft = async () => {
      if (!canSaveDraft.value) return;
      
      savingDraft.value = true;
      try {
        const progressData = {
          currentStep: currentStep.value,
          baseForm: JSON.parse(JSON.stringify(baseForm)),
          preferenceForm: JSON.parse(JSON.stringify(preferenceForm)),
          selectedAttractions: selectedAttractions.value,
          selectedRestaurants: selectedRestaurants.value,
          extraRequirements: extraRequirements.value,
          weatherSuggestion: weatherSuggestion.value
        };
        
        const draftId = await draftManager.saveDraft(progressData, draftName.value, false);
        if (draftId) {
          draftManager.resetChangeState(); // 重置更改状态
          saveDraftDialog.value = false;
          draftName.value = '';
          await loadDrafts();
          ElMessage.success('草稿保存成功！');
        }
      } catch (error) {
        console.error('保存草稿失败:', error);
        ElMessage.error('草稿保存失败！');
      } finally {
        savingDraft.value = false;
      }
    };

    const handleLoadDraft = async (draftId) => {
      loadingDraftId.value = draftId;
      try {
        const draft = await draftManager.getDraft(draftId);
        if (!draft) {
          ElMessage.error('草稿不存在！');
          return;
        }

        // 确认是否加载草稿
        await ElMessageBox.confirm(
          `确定要加载草稿"${draft.name}"吗？当前的进度将会被覆盖。`,
          '加载草稿',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        // 设置草稿状态标识
        isFromDraft.value = true;
        
        // 安全地更新reactive对象数据
        currentStep.value = draft.currentStep || 0;
        
        // 安全更新baseForm
        if (draft.baseForm) {
          Object.keys(baseForm).forEach(key => {
            if (draft.baseForm.hasOwnProperty(key)) {
              baseForm[key] = draft.baseForm[key];
            }
          });
        }
        
        // 安全更新preferenceForm
        if (draft.preferenceForm) {
          Object.keys(preferenceForm).forEach(key => {
            if (draft.preferenceForm.hasOwnProperty(key)) {
              preferenceForm[key] = draft.preferenceForm[key];
            }
          });
        }
        
        selectedAttractions.value = draft.selectedAttractions || [];
        selectedRestaurants.value = draft.selectedRestaurants || [];
        extraRequirements.value = draft.extraRequirements || '';
        weatherSuggestion.value = draft.weatherSuggestion || null;

        console.log('✅ 手动草稿加载完成，对比数据:', {
          '原始草稿数据': {
            currentStep: draft.currentStep,
            baseForm: draft.baseForm,
            preferenceForm: draft.preferenceForm,
            selectedAttractions: draft.selectedAttractions,
            selectedRestaurants: draft.selectedRestaurants
          },
          '加载后表单状态': {
            currentStep: currentStep.value,
            baseForm: JSON.parse(JSON.stringify(baseForm)),
            preferenceForm: JSON.parse(JSON.stringify(preferenceForm)),
            selectedAttractions: selectedAttractions.value,
            selectedRestaurants: selectedRestaurants.value
          },
          isFromDraft: isFromDraft.value
        });

        // 等待数据传递给子组件
        await nextTick();

        ElMessage.success(`已加载草稿：${draft.name}`);
        draftManager.resetChangeState(); // 加载草稿后重置更改状态
        showDraftList.value = false;
        await loadDrafts(); // 重新加载草稿列表
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
      } catch (error) {
        if (error === 'cancel') {
          // 用户取消，不做处理
        } else {
          console.error('加载草稿失败:', error);
          ElMessage.error('加载草稿失败！');
        }
      } finally {
        loadingDraftId.value = '';
      }
    };

    const handleDraftAction = (command) => {
      const { action, id } = command;
      
      switch (action) {
        case 'load':
          handleLoadDraft(id);
          break;
        case 'rename':
          handleRenameDraft(id);
          break;
        case 'copy':
          handleCopyDraft(id);
          break;
        case 'delete':
          handleDeleteDraft(id);
          break;
      }
    };

    const handleRenameDraft = async (draftId) => {
      const draft = await draftManager.getDraft(draftId);
      if (!draft) return;
      
      currentRenamingDraftId.value = draftId;
      newDraftName.value = draft.name;
      renameDraftDialog.value = true;
    };

    const handleConfirmRename = async () => {
      if (!newDraftName.value.trim()) {
        ElMessage.warning('请输入草稿名称！');
        return;
      }

      renamingDraft.value = true;
      try {
        const success = await draftManager.renameDraft(currentRenamingDraftId.value, newDraftName.value.trim());
        if (success) {
          ElMessage.success('重命名成功！');
          renameDraftDialog.value = false;
          loadDrafts();
        } else {
          ElMessage.error('重命名失败！');
        }
      } catch (error) {
        console.error('重命名草稿失败:', error);
        ElMessage.error('重命名失败！');
      } finally {
        renamingDraft.value = false;
      }
    };

    const handleCopyDraft = async (draftId) => {
      try {
        const draft = await draftManager.getDraft(draftId);
        if (!draft) return;

        const newDraftId = await draftManager.copyDraft(draftId);
        if (newDraftId) {
          ElMessage.success('草稿复制成功！');
          loadDrafts();
        } else {
          ElMessage.error('草稿复制失败！');
        }
      } catch (error) {
        console.error('复制草稿失败:', error);
        ElMessage.error('草稿复制失败！');
      }
    };

    const handleDeleteDraft = async (draftId) => {
      try {
        const draft = await draftManager.getDraft(draftId);
        if (!draft) return;

        await ElMessageBox.confirm(
          `确定要删除草稿"${draft.name}"吗？删除后无法恢复。`,
          '删除草稿',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        const success = await draftManager.deleteDraft(draftId);
        if (success) {
          ElMessage.success('草稿删除成功！');
          loadDrafts();
        } else {
          ElMessage.error('草稿删除失败！');
        }
      } catch (error) {
        if (error === 'cancel') {
          // 用户取消，不做处理
        } else {
          console.error('删除草稿失败:', error);
          ElMessage.error('草稿删除失败！');
        }
      }
    };

    const handleClearAllDrafts = async () => {
      try {
        await ElMessageBox.confirm(
          '确定要删除所有草稿吗？删除后无法恢复。',
          '清空所有草稿',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        const success = await draftManager.clearAllDrafts();
        if (success) {
          ElMessage.success('所有草稿已清空！');
          loadDrafts();
        } else {
          ElMessage.error('清空草稿失败！');
        }
      } catch (error) {
        if (error === 'cancel') {
          // 用户取消，不做处理
        } else {
          console.error('清空草稿失败:', error);
          ElMessage.error('清空草稿失败！');
        }
      }
    };

    const handleCloseSaveDraftDialog = () => {
      draftName.value = '';
      saveDraftDialog.value = false;
    };

    const handleCloseDraftList = () => {
      showDraftList.value = false;
    };

    // 获取步骤名称
    const getStepName = (step) => {
      return draftManager.getStepName(step);
    };

    // 获取相对时间
    const getDraftTimeAgo = (timestamp) => {
      return draftManager.getTimeAgo(new Date(timestamp));
    };

    // 检查是否有直接加载草稿的请求
    const handleDirectDraftLoad = async () => {
      const loadDraftId = route.query.loadDraft;
      if (loadDraftId) {
        try {
          const draft = await draftManager.getDraft(loadDraftId);
          if (draft) {
            console.log('📂 开始加载草稿数据:', draft);
            
            // 设置草稿状态标识
            isFromDraft.value = true;
            
            // 直接加载草稿数据，不需要确认
            currentStep.value = draft.currentStep;
            Object.keys(baseForm).forEach(key => delete baseForm[key]);
            Object.assign(baseForm, draft.baseForm);
            Object.keys(preferenceForm).forEach(key => delete preferenceForm[key]);
            Object.assign(preferenceForm, draft.preferenceForm);
            selectedAttractions.value = draft.selectedAttractions || [];
            selectedRestaurants.value = draft.selectedRestaurants || [];
            extraRequirements.value = draft.extraRequirements || '';
            weatherSuggestion.value = draft.weatherSuggestion || null;

            console.log('✅ 草稿数据加载完成，当前表单状态:', {
              baseForm,
              preferenceForm,
              currentStep: currentStep.value,
              isFromDraft: isFromDraft.value
            });

            // 等待下一个tick确保数据已经传递给子组件
            await nextTick();
            
            ElMessage.success(`已加载草稿：${draft.name}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // 清除URL参数
            router.replace({ path: '/trip/create' });
          } else {
            ElMessage.error('草稿不存在或已过期！');
            router.replace({ path: '/trip/create' });
          }
        } catch (error) {
          console.error('加载草稿失败:', error);
          ElMessage.error('加载草稿失败！');
          router.replace({ path: '/trip/create' });
        }
      }
    };

    // 在主要的onMounted中已经处理了草稿加载逻辑，删除重复的挂载钩子

    return {
      t,
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
      nextStep,
      prevStep,
      handleGenerationComplete,
      regenerateTrip,
      handleTripSaved: enhancedHandleTripSaved,
      handleTripShare,
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
  border: 2px solid #f56c6c;
  background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
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
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
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
  color: #f56c6c;
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
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.3);
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
  background-color: #f5f7fa;
  box-sizing: border-box;
  position: relative;
  height: calc(100vh - 64px);
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
  background-color: #409eff;
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
.draft-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.draft-actions-left,
.draft-actions-right {
  display: flex;
  gap: 12px;
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
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
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
  color: #409eff;
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
