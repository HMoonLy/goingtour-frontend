<!--
✈️ 本次行程偏好设置页面 - 每次旅行可调整
这个页面的设计重点：
1. 清晰说明这是"针对本次旅行"的设置，可以随时调整
2. 展示个人档案如何智能影响当前选择
3. 实时显示AI将如何理解这些偏好
4. 提供丰富的智能预填和推荐功能
-->

<template>
  <div class="trip-preferences-container">
    <!-- AI推荐加载遮罩 -->
    <div v-if="saving" class="ai-loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner">
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
        </div>
        <h3 class="loading-title">🤖 AI正在为您生成专属推荐</h3>
        <p class="loading-desc">根据您的偏好分析最适合的景点、餐厅和行程安排</p>
        <div class="loading-progress">
          <div class="progress-steps">
            <div class="step active">
              <div class="step-icon">✓</div>
              <span>分析您的偏好</span>
            </div>
            <div class="step active">
              <div class="step-icon">🔍</div>
              <span>搜索匹配景点</span>
            </div>
            <div class="step active">
              <div class="step-icon">⚡</div>
              <span>智能推荐生成中...</span>
            </div>
          </div>
        </div>
        <div class="loading-tips">
          <p>💡 推荐生成通常需要1-3分钟，请耐心等待</p>
        </div>
        <div class="loading-actions">
          <el-button type="primary" plain @click="cancelAiRequest">
            使用高德地图推荐
          </el-button>
          <div class="cancel-hint">
            <span>不等AI了？我们为您提供基于高德地图的热门推荐</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 页面头部 - 突出"本次旅行"概念 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <el-icon><Suitcase /></el-icon>
        </div>
        <div class="header-text">
          <h1 class="page-title">✈️本次行程偏好设置</h1>
          <p class="page-subtitle">
            为这次旅行量身定制，随时可以调整的偏好设置
          </p>
          
          <!-- 填写提示 -->
          <div class="fill-hint">
            💡 <strong>提示</strong>：为了获得更精准的AI推荐，建议您完整填写所有偏好设置，特别是"旅行目的"选项。
          </div>
        </div>
      </div>

      <!-- 个人档案智能提示 -->
      <div v-if="hasPersonalProfile" class="smart-prefill-notice">
        <div class="notice-icon">
          <el-icon><MagicStick /></el-icon>
        </div>
        <div class="notice-content">
          <h4>🎯智能预填已启用</h4>
          <p>
            根据您的个人旅行档案，我们已为您预选了合适的选项。您可以根据这次旅行的具体情况随时调整。
          </p>
          <div class="profile-summary">
            <span v-if="personalProfile.mbtiType"
              >性格：{{ getMbtiDisplayName(personalProfile.mbtiType) }}</span
            >
            <span v-if="personalProfile.coreInterests?.length"
              >兴趣：{{ personalProfile.coreInterests.length }}项</span
            >
            <span v-if="personalProfile.budgetLevel"
              >预算：{{
                getBudgetDisplayName(personalProfile.budgetLevel)
              }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 行程偏好设置区域 -->
    <div class="preferences-content">
      <!-- 1. 旅行目的 -->
      <div class="preference-section purpose-section">
        <div class="section-header">
          <div class="section-icon">
            <el-icon><Flag /></el-icon>
          </div>
          <div class="section-info">
            <h3 class="section-title">🎯 这次旅行的主要目的</h3>
            <p class="section-desc">
              告诉我们这次旅行的特殊意义，我们会相应调整推荐风格
            </p>
          </div>
        </div>

        <div class="purpose-content">
          <div class="purpose-cards">
            <div
              v-for="purpose in tripPurposeOptions"
              :key="purpose.value"
              class="purpose-card"
              :class="{
                selected: tripPreferences.tripPurpose === purpose.value,
              }"
              @click="selectTripPurpose(purpose.value)"
            >
              <div class="purpose-header">
                <span class="purpose-icon">{{ purpose.icon }}</span>
                <span class="purpose-name">{{ purpose.name }}</span>
              </div>
              <p class="purpose-desc">{{ purpose.description }}</p>
              <div class="purpose-ai-strategy">
                🤖
                <span>{{ purpose.aiStrategy }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. 体验重点 -->
      <div class="preference-section focus-section">
        <div class="section-header">
          <div class="section-icon">
            <el-icon><Star /></el-icon>
          </div>
          <div class="section-info">
            <h3 class="section-title">🌟 这次最想体验什么？</h3>
            <p class="section-desc">
              选择这次旅行您最期待的体验类型（最多3个）
              <span v-if="recommendedFocusAreas.length > 0" class="smart-tip">
                <el-icon><Star /></el-icon>
                基于您的兴趣，推荐了 {{ recommendedFocusAreas.length }} 项
              </span>
            </p>
          </div>
        </div>

        <div class="focus-content">
          <div class="focus-grid">
            <div
              v-for="focus in focusAreaOptions"
              :key="focus.value"
              class="focus-item"
              :class="{
                selected: tripPreferences.focusAreas.includes(focus.value),
                recommended: recommendedFocusAreas.includes(focus.value),
                disabled:
                  !tripPreferences.focusAreas.includes(focus.value) &&
                  tripPreferences.focusAreas.length >= 3,
              }"
              @click="toggleFocusArea(focus.value)"
            >
              <div class="focus-header">
                <span class="focus-icon">{{ focus.icon }}</span>
                <span class="focus-name">{{ focus.name }}</span>
              </div>
              <p class="focus-desc">{{ focus.description }}</p>

              <!-- 推荐标记 -->
              <div
                v-if="recommendedFocusAreas.includes(focus.value)"
                class="recommended-badge"
              >
                <el-icon><Star /></el-icon>
                <span>推荐</span>
              </div>

              <!-- 选中标记 -->
              <div
                v-if="tripPreferences.focusAreas.includes(focus.value)"
                class="selected-badge"
              >
                <el-icon><Check /></el-icon>
              </div>
            </div>
          </div>

          <div class="selection-info">
            <span class="selection-count"
              >已选择 {{ tripPreferences.focusAreas.length }}/3</span
            >
            <el-button
              v-if="tripPreferences.focusAreas.length > 0"
              link
              size="small"
              @click="clearFocusAreas"
            >
              清空选择
            </el-button>
          </div>
        </div>
      </div>

      <!-- 3. 行程节奏 -->
      <div class="preference-section pace-section">
        <div class="section-header">
          <div class="section-icon">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="section-info">
            <h3 class="section-title">⏰ 这次想要什么样的节奏？</h3>
            <p class="section-desc">
              根据您的时间和体力情况选择合适的行程节奏
              <span v-if="recommendedPace" class="smart-tip">
                <el-icon><MagicStick /></el-icon>
                基于您的性格，推荐：{{ getPaceDisplayName(recommendedPace) }}
              </span>
            </p>
          </div>
        </div>

        <div class="pace-content">
          <div class="pace-cards">
            <div
              v-for="pace in pacePreferenceOptions"
              :key="pace.value"
              class="pace-card"
              :class="{
                selected: tripPreferences.pacePreference === pace.value,
                recommended: recommendedPace === pace.value,
              }"
              @click="selectPacePreference(pace.value)"
            >
              <div class="pace-visual">
                <span class="pace-icon">{{ pace.icon }}</span>
                <span class="pace-name">{{ pace.name }}</span>
              </div>
              <p class="pace-desc">{{ pace.description }}</p>
              <div class="pace-strategy">
                <el-icon><InfoFilled /></el-icon>
                <span>{{ pace.aiStrategy }}</span>
              </div>

              <!-- 推荐标记 -->
              <div
                v-if="recommendedPace === pace.value"
                class="pace-recommended"
              >
                <el-icon><Star /></el-icon>
                <span>推荐</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. 社交偏好 -->
      <div class="preference-section social-section">
        <div class="section-header">
          <div class="section-icon">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="section-info">
            <h3 class="section-title">🎭 这次偏好什么样的氛围？</h3>
            <p class="section-desc">
              选择您希望的旅行氛围和环境类型
              <span v-if="recommendedSocial" class="smart-tip">
                <el-icon><MagicStick /></el-icon>
                基于您的性格，推荐：{{
                  getSocialDisplayName(recommendedSocial)
                }}
              </span>
            </p>
          </div>
        </div>

        <div class="social-content">
          <div class="social-options">
            <div
              v-for="social in socialPreferenceOptions"
              :key="social.value"
              class="social-option"
              :class="{
                selected: tripPreferences.socialPreference === social.value,
                recommended: recommendedSocial === social.value,
              }"
              @click="selectSocialPreference(social.value)"
            >
              <div class="social-header">
                <span class="social-icon">{{ social.icon }}</span>
                <span class="social-name">{{ social.name }}</span>
              </div>
              <p class="social-desc">{{ social.description }}</p>
              <div class="social-strategy">
                <span>{{ social.aiStrategy }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. 拍照需求 -->
      <div class="preference-section photo-section">
        <div class="section-header">
          <div class="section-icon">
            <el-icon><Camera /></el-icon>
          </div>
          <div class="section-info">
            <h3 class="section-title">📸 这次旅行对拍照的重视程度</h3>
            <p class="section-desc">
              帮助我们安排合适的拍照时间和推荐上镜景点
              <span v-if="recommendedPhoto" class="smart-tip">
                <el-icon><MagicStick /></el-icon>
                基于您的兴趣，推荐：{{ getPhotoDisplayName(recommendedPhoto) }}
              </span>
            </p>
          </div>
        </div>

        <div class="photo-content">
          <div class="photo-levels">
            <div
              v-for="(photo, index) in photoPreferenceOptions"
              :key="photo.value"
              class="photo-level"
              :class="{
                selected: tripPreferences.photoPreference === photo.value,
                recommended: recommendedPhoto === photo.value,
              }"
              @click="selectPhotoPreference(photo.value)"
            >
              <div class="photo-header">
                <span class="photo-icon">{{ photo.icon }}</span>
                <span class="photo-name">{{ photo.name }}</span>
              </div>
              <p class="photo-desc">{{ photo.description }}</p>
              <div class="photo-strategy">
                <span>{{ photo.aiStrategy }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 6. 临时特殊需求 -->
      <div class="preference-section needs-section">
        <div class="section-header">
          <div class="section-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="section-info">
            <h3 class="section-title">⚠️ 这次旅行的特殊情况</h3>
            <p class="section-desc">选择这次旅行需要特别考虑的因素（可多选）</p>
          </div>
        </div>

        <div class="needs-content">
          <div class="needs-grid">
            <div
              v-for="need in temporaryNeedsOptions"
              :key="need.value"
              class="need-item"
              :class="{
                selected: tripPreferences.temporaryNeeds.includes(need.value),
              }"
              @click="toggleTemporaryNeed(need.value)"
            >
              <div class="need-header">
                <span class="need-icon">{{ need.icon }}</span>
                <span class="need-name">{{ need.name }}</span>
              </div>
              <p class="need-desc">{{ need.description }}</p>
              <div class="need-strategy">
                <el-icon><InfoFilled /></el-icon>
                <span>{{ need.aiStrategy }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI理解预览 -->
    <div v-if="hasValidPreferences" class="ai-preview">
      <div class="preview-header">
        <h4>🤖 AI将如何为您规划行程</h4>
      </div>
      <div class="preview-content">
        <div class="preview-text">
          {{ generateAIPreview() }}
        </div>
        <el-button link @click="showDetailedAI = !showDetailedAI">
          {{ showDetailedAI ? "收起" : "查看详细" }}AI解读
        </el-button>

        <div v-if="showDetailedAI" class="detailed-ai-preview">
          <pre>{{ generateDetailedAI() }}</pre>
        </div>
      </div>
    </div>

    <!-- 操作区域 -->
    <div class="step-actions">
      <div class="action-left">
        <el-button
          size="large"
          type="info"
          plain
          :disabled="saving"
          @click="saveDraft"
        >
          <el-icon><Document /></el-icon>
          保存草稿
        </el-button>
      </div>

      <div class="action-right">
        <div class="navigation-buttons">
          <el-button size="large" @click="goToPreviousStep">
            <el-icon><ArrowLeft /></el-icon>
            上一步
          </el-button>

          <el-button
            type="primary"
            :loading="saving"
            size="large"
            @click="savePreferences"
          >
            <template v-if="saving"> AI推荐生成中... </template>
            <template v-else>
              下一步
              <el-icon><ArrowRight /></el-icon>
            </template>
          </el-button>
        </div>
      </div>
    </div>

    <!-- AI推荐确认对话框 -->
    <el-dialog
      v-model="showAiRecommendationDialog"
      title=""
      width="500px"
      :append-to-body="true"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      :show-close="true"
      class="ai-recommendation-dialog"
    >
      <div class="dialog-content">
        <div class="dialog-header">
          <div class="header-icon">
            <el-icon><MagicStick /></el-icon>
          </div>
          <div >
            <h3>选择推荐方式</h3>
            <h3>🤖 是否使用AI智能推荐？</h3>
          </div>
        </div>

        <div class="dialog-body">
          <p class="dialog-description">
            我们提供两种推荐方式，请选择您偏好的方式：
          </p>

          <div class="option-cards">
            <div class="option-card ai-option">
              <div class="card-header">
                <el-icon class="card-icon"><MagicStick /></el-icon>
                <h4>🚀 AI智能推荐</h4>
              </div>
              <div class="card-content">
                <ul>
                  <li>🎯 基于设置进行个性化推荐</li>
                  <li>🤖 AI分析生成专属行程建议</li>
                  <li>⭐ 更精准的景点和餐厅匹配</li>
                  <li>⏰ 生成时间约1-3分钟</li>
                </ul>
              </div>
            </div>

            <div class="option-card basic-option">
              <div class="card-header">
                <el-icon class="card-icon"><MapLocation /></el-icon>
                <h4>🗺️ 基础推荐</h4>
              </div>
              <div class="card-content">
                <ul>
                  <li>📍 基于高德地图的热门推荐</li>
                  <li>⚡ 快速获取推荐结果</li>
                  <li>🏆 经典热门景点和餐厅</li>
                  <li>⏱️ 立即显示结果</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="dialog-actions">
          <el-button
            size="large"
            type="default"
            @click="confirmUseBasicRecommendation"
          >
            <el-icon><MapLocation /></el-icon>
            使用基础推荐
          </el-button>

          <el-button
            size="large"
            type="primary"
            @click="confirmUseAiRecommendation"
          >
            <el-icon><MagicStick /></el-icon>
            使用AI智能推荐
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  Suitcase,
  Flag,
  Star,
  Timer,
  UserFilled,
  Camera,
  Warning,
  MagicStick,
  Check,
  InfoFilled,
  Document,
  ArrowRight,
  ArrowLeft,
  Loading,
  MapLocation,
} from "@element-plus/icons-vue";
import {
  TRIP_PREFERENCES_OPTIONS,
  PERSONAL_PROFILE_OPTIONS,
} from "@/utils/data/travelDataSystem.js";
import {
  TripPreferencesInterpreter,
  SmartPrefillEngine,
  CompletePromptGenerator,
} from "@/utils/data/aiPromptEngine.js";
import { useUserStore } from "@/store/user.js";

export default {
  name: "TripPreferencesNew",
  components: {
    Suitcase,
    Flag,
    Star,
    Timer,
    UserFilled,
    Camera,
    Warning,
    MagicStick,
    Check,
    InfoFilled,
    Document,
    ArrowRight,
    ArrowLeft,
    Loading,
    MapLocation,
  },
  props: {
    tripContext: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: [
    "preferences-updated",
    "preferences-saved",
    "go-to-previous-step",
    "ai-recommendations-generated",
    "use-enhanced-recommendation",
    "use-basic-recommendation",
  ],
  setup(props, { emit }) {
    const userStore = useUserStore();
    const saving = ref(false);
    const showDetailedAI = ref(false);
    const showAiRecommendationDialog = ref(false);

    // 注：不再需要请求控制器，依赖后端超时设置

    // 个人档案数据
    const personalProfile = ref({});
    const hasPersonalProfile = computed(
      () => Object.keys(personalProfile.value).length > 0
    );

    // 行程偏好数据
    const tripPreferences = reactive({
      tripPurpose: "",
      focusAreas: [],
      pacePreference: "balanced",
      socialPreference: "mixed",
      photoPreference: "casual",
      temporaryNeeds: [],
    });

    // 选项数据（从新的数据系统获取）
    const tripPurposeOptions = computed(() =>
      Object.entries(TRIP_PREFERENCES_OPTIONS.tripPurpose.options).map(
        ([key, value]) => ({
          value: key,
          ...value,
        })
      )
    );

    const focusAreaOptions = computed(() =>
      Object.entries(TRIP_PREFERENCES_OPTIONS.focusAreas.options).map(
        ([key, value]) => ({
          value: key,
          ...value,
        })
      )
    );

    const pacePreferenceOptions = computed(() =>
      Object.entries(TRIP_PREFERENCES_OPTIONS.pacePreference.options).map(
        ([key, value]) => ({
          value: key,
          ...value,
        })
      )
    );

    const socialPreferenceOptions = computed(() =>
      Object.entries(TRIP_PREFERENCES_OPTIONS.socialPreference.options).map(
        ([key, value]) => ({
          value: key,
          ...value,
        })
      )
    );

    const photoPreferenceOptions = computed(() =>
      Object.entries(TRIP_PREFERENCES_OPTIONS.photoPreference.options).map(
        ([key, value]) => ({
          value: key,
          ...value,
        })
      )
    );

    const temporaryNeedsOptions = computed(() =>
      Object.entries(TRIP_PREFERENCES_OPTIONS.temporaryNeeds.options).map(
        ([key, value]) => ({
          value: key,
          ...value,
        })
      )
    );

    // 智能推荐数据
    const smartPrefill = ref(null);
    const recommendedFocusAreas = ref([]);
    const recommendedPace = ref("");
    const recommendedSocial = ref("");
    const recommendedPhoto = ref("");

    // 偏好完整性检查
    const hasValidPreferences = computed(() => {
      return (
        tripPreferences.tripPurpose ||
        tripPreferences.focusAreas.length > 0 ||
        tripPreferences.temporaryNeeds.length > 0
      );
    });

    // 选择函数
    const selectTripPurpose = (purpose) => {
      tripPreferences.tripPurpose = purpose;
      emit("preferences-updated", { ...tripPreferences });
    };

    const toggleFocusArea = (area) => {
      const index = tripPreferences.focusAreas.indexOf(area);
      if (index > -1) {
        tripPreferences.focusAreas.splice(index, 1);
      } else if (tripPreferences.focusAreas.length < 3) {
        tripPreferences.focusAreas.push(area);
      }
      emit("preferences-updated", { ...tripPreferences });
    };

    const clearFocusAreas = () => {
      tripPreferences.focusAreas = [];
      emit("preferences-updated", { ...tripPreferences });
    };

    const selectPacePreference = (pace) => {
      tripPreferences.pacePreference = pace;
      emit("preferences-updated", { ...tripPreferences });
    };

    const selectSocialPreference = (social) => {
      tripPreferences.socialPreference = social;
      emit("preferences-updated", { ...tripPreferences });
    };

    const selectPhotoPreference = (photo) => {
      tripPreferences.photoPreference = photo;
      emit("preferences-updated", { ...tripPreferences });
    };

    const toggleTemporaryNeed = (need) => {
      const index = tripPreferences.temporaryNeeds.indexOf(need);
      if (index > -1) {
        tripPreferences.temporaryNeeds.splice(index, 1);
      } else {
        tripPreferences.temporaryNeeds.push(need);
      }
      emit("preferences-updated", { ...tripPreferences });
    };

    // 显示名称函数
    const getMbtiDisplayName = (type) => {
      return type; // 简化显示，实际可以从选项中获取
    };

    const getBudgetDisplayName = (level) => {
      const option = PERSONAL_PROFILE_OPTIONS.budgetLevel?.options[level];
      return option ? option.name : level;
    };

    const getPaceDisplayName = (pace) => {
      const option = pacePreferenceOptions.value.find(
        (opt) => opt.value === pace
      );
      return option ? option.name : pace;
    };

    const getSocialDisplayName = (social) => {
      const option = socialPreferenceOptions.value.find(
        (opt) => opt.value === social
      );
      return option ? option.name : social;
    };

    const getPhotoDisplayName = (photo) => {
      const option = photoPreferenceOptions.value.find(
        (opt) => opt.value === photo
      );
      return option ? option.name : photo;
    };

    // AI预览生成
    const generateAIPreview = () => {
      const interpreter = new TripPreferencesInterpreter(tripPreferences);
      const preview = interpreter.generateCompletePreferences();

      // 简化显示前2行
      const lines = preview.split("\n\n").slice(0, 2);
      return lines.join(" ");
    };

    const generateDetailedAI = () => {
      if (!hasPersonalProfile.value)
        return "需要设置个人档案才能生成详细AI解读";

      const generator = new CompletePromptGenerator(
        personalProfile.value,
        tripPreferences,
        props.tripContext
      );
      return generator.generateCompletePrompt();
    };

    // 智能预填功能
    const initializeSmartPrefill = () => {
      if (!hasPersonalProfile.value) return;

      smartPrefill.value = new SmartPrefillEngine(personalProfile.value);
      const defaults = smartPrefill.value.getSmartDefaults();

      // 设置推荐项
      recommendedFocusAreas.value = defaults.focusAreas || [];
      recommendedPace.value = defaults.pacePreference || "";
      recommendedSocial.value = defaults.socialPreference || "";
      recommendedPhoto.value = defaults.photoPreference || "";

      // 应用默认值（如果用户还没有设置）
      if (
        !tripPreferences.pacePreference ||
        tripPreferences.pacePreference === "balanced"
      ) {
        tripPreferences.pacePreference = defaults.pacePreference;
      }
      if (
        !tripPreferences.socialPreference ||
        tripPreferences.socialPreference === "mixed"
      ) {
        tripPreferences.socialPreference = defaults.socialPreference;
      }
      if (
        !tripPreferences.photoPreference ||
        tripPreferences.photoPreference === "casual"
      ) {
        tripPreferences.photoPreference = defaults.photoPreference;
      }
      if (
        tripPreferences.focusAreas.length === 0 &&
        defaults.focusAreas.length > 0
      ) {
        tripPreferences.focusAreas = [...defaults.focusAreas.slice(0, 3)];
      }
    };

    // 保存偏好
    const savePreferences = async () => {
      if (saving.value) {
        console.warn("正在保存中，请勿重复点击");
        return;
      }

      try {
        // 显示AI推荐确认对话框
        showAiRecommendationDialog.value = true;
      } catch (error) {
        console.error("保存偏好失败:", error);
        ElMessage.error("保存失败：" + (error.message || "请重试"));
      }
    };

    // 确认使用AI推荐
    const confirmUseAiRecommendation = async () => {
      // 防止重复调用
      if (saving.value) {
        console.warn("AI推荐正在生成中，请勿重复点击");
        return;
      }
      
      showAiRecommendationDialog.value = false;
      saving.value = true;
      console.log("🚀 开始保存偏好和生成AI推荐");

      // 显示AI推荐加载提示
      ElMessage.info("正在为您生成个性化AI推荐，请稍候...");

      // 调用AI推荐API，携带完整数据
      let apiResponse = null;

      try {
        // 动态导入AI推荐API
        const { aiRecommendationApi } = await import(
          "@/api/aiRecommendation.js"
        );

        // 使用travelDataSystem.js转换详细信息
        const convertToDetailedData = (category, value) => {
          if (!value) return null;
          
          const options = TRIP_PREFERENCES_OPTIONS[category]?.options || PERSONAL_PROFILE_OPTIONS[category]?.options;
          if (!options || !options[value]) return null;
          
          return {
            key: value,
            ...options[value]
          };
        };

        const convertListToDetailedData = (category, values) => {
          if (!Array.isArray(values) || values.length === 0) return [];
          
          const options = TRIP_PREFERENCES_OPTIONS[category]?.options || PERSONAL_PROFILE_OPTIONS[category]?.options;
          if (!options) return [];
          
          return values.map(value => {
            if (options[value]) {
              return {
                key: value,
                ...options[value]
              };
            }
            return { key: value, name: value };
          }).filter(item => item !== null);
        };

        // 构建完整的请求参数，包含前两个步骤的所有信息和详细转换
        const requestParams = {
          // 第一步：基础信息（从TripBaseInfo获取）
          baseInfo: {
            destinationName: props.tripContext?.destinationName || props.tripContext?.destination || "",
            destination: props.tripContext?.destination || props.tripContext?.destinationName || "",
            days: props.tripContext?.days || 3,
            budget: props.tripContext?.budget || "moderate",
            travelers: props.tripContext?.travelers || 1,
            dateRange: props.tripContext?.dateRange || null,
          },
          
          // 第二步：行程偏好（当前组件的数据）- 包含原始值和详细转换
          preferences: {
            // 旅行目的 - 原始值和详细信息
            travelPurpose: tripPreferences.tripPurpose || "",
            travelPurposeDetail: convertToDetailedData('tripPurpose', tripPreferences.tripPurpose),

            // 关注领域/兴趣点 - 原始值和详细信息
            focusAreas: tripPreferences.focusAreas || [],
            focusAreasDetails: convertListToDetailedData('focusAreas', tripPreferences.focusAreas),
            interests: tripPreferences.focusAreas || [], // 兼容字段

            // 节奏偏好 - 原始值和详细信息
            pacePreference: tripPreferences.pacePreference || "",
            pacePreferenceDetail: convertToDetailedData('pacePreference', tripPreferences.pacePreference),

            // 社交偏好 - 原始值和详细信息
            socialPreference: tripPreferences.socialPreference || "",
            socialPreferenceDetail: convertToDetailedData('socialPreference', tripPreferences.socialPreference),

            // 拍照偏好 - 原始值和详细信息
            photoPreference: tripPreferences.photoPreference || "",
            photoPreferenceDetail: convertToDetailedData('photoPreference', tripPreferences.photoPreference),

            // 特殊需求和临时需要 - 原始值和详细信息
            specialRequirements: tripPreferences.specialRequirements || "",
            temporaryNeeds: tripPreferences.temporaryNeeds || [],
            temporaryNeedsDetails: convertListToDetailedData('temporaryNeeds', tripPreferences.temporaryNeeds),

            // 饮食相关（从个人档案和当前设置合并）
            dietaryRestrictions: [
              ...(personalProfile.value?.dietaryRestrictions || []),
              ...(tripPreferences.dietaryRestrictions || []),
            ],
            dietaryRestrictionsDetails: convertListToDetailedData('dietaryRestrictions', [
              ...(personalProfile.value?.dietaryRestrictions || []),
              ...(tripPreferences.dietaryRestrictions || []),
            ]),
            customDietaryNotes: tripPreferences.customDietaryNotes || "",

            // 预算和住宿偏好
            budgetPreference: props.tripContext?.budget || "moderate",
            accommodationLevel: tripPreferences.accommodationLevel || "moderate",

            // 交通偏好（从个人档案获取）
            transportationMode: personalProfile.value?.transportPreferences || [],
            transportationModeDetails: convertListToDetailedData('transportPreferences', personalProfile.value?.transportPreferences || []),
          },
          
          // 用户个人档案信息 - 包含原始值和详细转换
          userProfile: {
            // MBTI性格类型 - 原始值和详细信息
            mbtiType: personalProfile.value?.mbtiType || "",
            mbtiDetail: convertToDetailedData('mbtiTypes', personalProfile.value?.mbtiType),

            // 核心兴趣爱好 - 原始值和详细信息
            coreInterests: personalProfile.value?.coreInterests || [],
            coreInterestsDetails: convertListToDetailedData('coreInterests', personalProfile.value?.coreInterests || []),

            // 预算档位 - 原始值和详细信息
            budgetLevel: personalProfile.value?.budgetLevel || "moderate",
            budgetLevelDetail: convertToDetailedData('budgetLevel', personalProfile.value?.budgetLevel),

            // 饮食限制 - 原始值和详细信息
            dietaryRestrictions: personalProfile.value?.dietaryRestrictions || [],
            dietaryRestrictionsDetails: convertListToDetailedData('dietaryRestrictions', personalProfile.value?.dietaryRestrictions || []),

            // 交通偏好 - 原始值和详细信息
            transportPreferences: personalProfile.value?.transportPreferences || [],
            transportPreferencesDetails: convertListToDetailedData('transportPreferences', personalProfile.value?.transportPreferences || []),
          },
          
          // API请求参数 - 减少生成数量以避免超时
          maxAttractions: 8,
          maxRestaurants: 6,
          maxHotels: 4,
          includeReasonings: false, // 减少生成内容，避免超时
          includeConfidenceScores: false, // 减少生成内容，避免超时

          // 其他上下文信息
          context: {
            timestamp: new Date().toISOString(),
            source: "trip-preferences-step",
            version: "3.0", // 版本升级，表示包含详细转换数据
          },
        };

        console.log("🤖 发起AI推荐请求，携带完整的前两步信息:", {
          baseInfo: requestParams.baseInfo,
          preferences: requestParams.preferences,
          userProfile: requestParams.userProfile,
          context: requestParams.context,
        });
        
        // 发起AI推荐请求，依赖后端超时设置（4分钟）
        console.log("🚀 开始AI推荐请求，预计耗时2-4分钟...");

        // 添加进度提示
        const progressInterval = setInterval(() => {
          console.log("⏳ AI推荐生成中，请耐心等待...");
        }, 15000); // 每15秒提示一次

        try {
          apiResponse = await aiRecommendationApi.getPersonalizedRecommendations(requestParams);
          clearInterval(progressInterval);
          console.log("✅ AI推荐请求完成");
        } catch (error) {
          clearInterval(progressInterval);
          console.log("❌ AI推荐请求失败:", error.message);
          throw error;
        }

        if (apiResponse && apiResponse.success) {
          console.log("✅ AI推荐请求成功:", apiResponse.data);
          ElMessage.success(
            `AI推荐生成完成！为您推荐了 ${apiResponse.data?.attractions?.length || 0} 个景点、${apiResponse.data?.restaurants?.length || 0} 个餐厅、${apiResponse.data?.hotels?.length || 0} 个酒店`
          );

          // 可以将推荐结果存储到store或通过事件传递给父组件
          emit("ai-recommendations-generated", apiResponse.data);
          emit("use-enhanced-recommendation");
        } else {
          throw new Error(apiResponse?.message || "AI推荐服务返回异常");
        }
      } catch (apiError) {
        console.error("❌ AI推荐API调用失败:", apiError);

        if (apiError.message && apiError.message.includes("超时")) {
          ElMessage.warning("AI推荐生成超时，正在为您获取高德地图推荐数据...");
        } else {
          ElMessage.warning("AI推荐生成失败，正在为您获取高德地图推荐数据...");
        }

        // AI失败时，自动降级到高德API
        try {
          const fallbackData = await getFallbackRecommendations();
          emit("ai-recommendations-generated", fallbackData);
          emit("use-enhanced-recommendation");
          ElMessage.success(
            `已为您获取基于高德地图的推荐数据：${fallbackData.attractions.length} 个景点，${fallbackData.restaurants.length} 个餐厅`
          );
        } catch (fallbackError) {
          console.error("❌ 高德API降级也失败了:", fallbackError);
          ElMessage.error("推荐数据获取失败，您可以在推荐页面手动搜索");
        }
      }

      // 无论AI推荐成功与否，都要保存偏好并进入下一步
      // console.log("💾 保存偏好数据:", tripPreferences);
      emit("preferences-saved", { ...tripPreferences });
      saving.value = false;
    };

    // 确认使用基础推荐
    const confirmUseBasicRecommendation = () => {
      showAiRecommendationDialog.value = false;
      console.log("🗺️ 用户选择使用基础推荐（高德地图）");

      // 直接保存偏好并进入下一步，不在这里发起API请求
      // API请求将在 TripRecommendationStep 组件中进行
      emit("use-basic-recommendation");
      console.log("💾 保存偏好数据:", tripPreferences);
      emit("preferences-saved", { ...tripPreferences });
    };

    // 获取基础推荐数据（用户主动选择）
    const getBasicRecommendations = async () => {
      console.log('🗺️ 用户选择使用高德地图基础推荐，开始获取数据...')
      
      const { getRecommendedAttractions, getRecommendedRestaurants } =
        await import("@/api/amap.js");

      const cityName = props.tripContext?.destination || "";
      if (!cityName) {
        throw new Error("缺少目的地信息，无法获取推荐数据");
      }

      console.log(`📍 正在获取 ${cityName} 的高德地图推荐数据...`);

      // 减少请求数量以节约API配额
      const [attractionsResult, restaurantsResult] = await Promise.all([
        getRecommendedAttractions(cityName, 1, 8).catch((err) => {
          console.warn("高德景点API调用失败:", err);
          if (err.message && err.message.includes('CUQPS_HAS_EXCEEDED_THE_LIMIT')) {
            throw new Error('API调用次数已达上限，请稍后再试');
          }
          return { pois: [] };
        }),
        getRecommendedRestaurants(cityName, 1, 6).catch((err) => {
          console.warn("高德餐厅API调用失败:", err);
          if (err.message && err.message.includes('CUQPS_HAS_EXCEEDED_THE_LIMIT')) {
            throw new Error('API调用次数已达上限，请稍后再试');
          }
          return { pois: [] };
        }),
      ]);

      // 转换高德API数据格式为推荐格式
      const attractions = (attractionsResult.pois || []).map((poi, index) => ({
        id: poi.id || `attraction_${index}`,
        name: poi.name,
        description: poi.address || poi.type || '暂无描述',
        rating: parseFloat((poi.biz_ext && poi.biz_ext.rating) || 4.5),
        tags: poi.type ? [poi.type.split(';')[0], '高德推荐'] : ['高德推荐'],
        image: (poi.photos && poi.photos.length > 0) ? poi.photos[0].url : '/api/placeholder/300/200',
        location: poi.address || '暂无地址',
        coordinates: poi.location ? poi.location.split(',').map(Number) : null,
        isAiRecommended: false,
        isBasicRecommended: true,
        confidence: 0.7,
        reasoning: '基于高德地图热门推荐',
        rawData: poi
      }));

      const restaurants = (restaurantsResult.pois || []).map((poi, index) => ({
        id: poi.id || `restaurant_${index}`,
        name: poi.name,
        description: poi.address || poi.type || '暂无描述',
        rating: parseFloat((poi.biz_ext && poi.biz_ext.rating) || 4.5),
        price: parseInt((poi.biz_ext && poi.biz_ext.cost) || 50),
        cuisineType: poi.type ? poi.type.split(';')[0] : '综合',
        tags: poi.type ? [poi.type.split(';')[0], '高德推荐'] : ['高德推荐'],
        image: (poi.photos && poi.photos.length > 0) ? poi.photos[0].url : '/api/placeholder/300/200',
        location: poi.address || '暂无地址',
        coordinates: poi.location ? poi.location.split(',').map(Number) : null,
        isAiRecommended: false,
        isBasicRecommended: true,
        confidence: 0.7,
        reasoning: '基于高德地图热门推荐',
        rawData: poi
      }));

      // 构建推荐结果对象
      return {
        attractions,
        restaurants,
        hotels: [],
        reasoning: `为您展示 ${cityName} 的热门推荐。基于高德地图数据的优质选择，值得一游！`,
        stats: {
          total: attractions.length + restaurants.length,
          attractions: attractions.length,
          restaurants: restaurants.length,
          hotels: 0,
          ai: 0,
          confidence: 0.75,
          averageRating: 4.1,
          averageConfidence: 0.7,
          processingTime: 500,
        },
        isBasic: true,
        isAmapData: true,
        sessionId: `basic_${Date.now()}`,
        generatedAt: new Date().toISOString(),
        timestamp: Date.now(),
      };
    };

    // 获取高德API推荐数据的通用方法（仅作为AI推荐失败时的备用方案）
    const getFallbackRecommendations = async () => {
      console.warn('⚠️ AI推荐服务不可用，正在使用高德API作为备用方案...')
      console.warn('⚠️ 请注意API调用限制，避免配额超限')
      
      const { getRecommendedAttractions, getRecommendedRestaurants } =
        await import("@/api/amap.js");

      const cityName = props.tripContext?.destination || "";
      if (!cityName) {
        throw new Error("缺少目的地信息，无法获取推荐数据");
      }

      console.log(`🗺️ 使用高德API获取 ${cityName} 的推荐数据（备用方案）`);

      // 减少请求数量以节约API配额
      const [attractionsResult, restaurantsResult] = await Promise.all([
        getRecommendedAttractions(cityName, 1, 8).catch((err) => {
          console.warn("高德景点API调用失败:", err);
          if (err.message && err.message.includes('CUQPS_HAS_EXCEEDED_THE_LIMIT')) {
            throw new Error('API调用次数已达上限，请稍后再试');
          }
          return { pois: [] };
        }),
        getRecommendedRestaurants(cityName, 1, 6).catch((err) => {
          console.warn("高德餐厅API调用失败:", err);
          if (err.message && err.message.includes('CUQPS_HAS_EXCEEDED_THE_LIMIT')) {
            throw new Error('API调用次数已达上限，请稍后再试');
          }
          return { pois: [] };
        }),
      ]);

      // 转换高德API数据格式为推荐格式
      const attractions = (attractionsResult.pois || []).map((poi, index) => ({
        id: poi.id || `attraction_${index}`,
        name: poi.name || "未知景点",
        description: poi.description || poi.address || poi.type || "暂无描述",
        rating: parseFloat(poi.rating) || 4.0,
        price: parseInt(poi.cost) || Math.floor(Math.random() * 100 + 50),
        tags: poi.tags || (poi.type ? [poi.type, "高德推荐"] : ["高德推荐"]),
        image: poi.imageUrl || "/api/placeholder/300/200",
        imageUrl: poi.imageUrl,
        images: poi.images || [],
        location: poi.address || "位置信息待完善",
        address: poi.address,
        coordinates: poi.coordinates || (poi.location ? poi.location.split(",").map(Number) : null),
        isAiRecommended: false,
        isFallback: true,
        confidence: 0.6,
        reasoning: "基于高德地图数据的热门推荐",
        recommendationScore: Math.random() * 0.4 + 0.6,
        estimatedDuration: "2-3小时",
        bestTimeToVisit: "全天",
        tel: poi.tel || "",
        // 新增字段
        category: poi.category,
        businessArea: poi.businessArea,
        openTime: poi.openTime,
        website: poi.website,
        rawData: poi.rawData
      }));

      const restaurants = (restaurantsResult.pois || []).map((poi, index) => ({
        id: poi.id || `restaurant_${index}`,
        name: poi.name || "未知餐厅",
        description: poi.description || poi.address || poi.type || "暂无描述",
        rating: parseFloat(poi.rating) || 4.0,
        price: parseInt(poi.cost) || Math.floor(Math.random() * 150 + 50),
        cuisineType: poi.type || "综合",
        tags: poi.tags || (poi.type ? [poi.type, "高德推荐"] : ["高德推荐"]),
        image: poi.imageUrl || "/api/placeholder/300/200",
        imageUrl: poi.imageUrl,
        images: poi.images || [],
        location: poi.address || "位置信息待完善",
        address: poi.address,
        coordinates: poi.coordinates || (poi.location ? poi.location.split(",").map(Number) : null),
        isAiRecommended: false,
        isFallback: true,
        confidence: 0.6,
        reasoning: "基于高德地图数据的人气餐厅",
        recommendationScore: Math.random() * 0.4 + 0.6,
        priceRange: poi.cost || "中等消费",
        signature_dishes: [],
        tel: poi.tel || "",
        // 新增字段
        category: poi.category,
        businessArea: poi.businessArea,
        openTime: poi.openTime,
        website: poi.website,
        rawData: poi.rawData
      }));

      // 构建推荐结果对象
      return {
        attractions,
        restaurants,
        hotels: [],
        reasoning: `为您展示 ${cityName} 的热门推荐。基于高德地图数据的优质选择，值得一游！`,
        stats: {
          total: attractions.length + restaurants.length,
          attractions: attractions.length,
          restaurants: restaurants.length,
          hotels: 0,
          ai: 0,
          confidence: 0.75,
          averageRating: 4.1,
          averageConfidence: 0.6,
          processingTime: 500,
        },
        isFallback: true,
        isAmapData: true,
        sessionId: `amap_${Date.now()}`,
        generatedAt: new Date().toISOString(),
        timestamp: Date.now(),
      };
    };

    // 取消AI推荐请求
    const cancelAiRequest = async () => {
      console.log("🚫 用户取消AI推荐请求，使用高德API获取数据");

      try {
        // 注：不再需要手动取消请求，依赖后端超时

        // 显示正在使用高德API获取数据的提示
        ElMessage.info("正在为您获取基础推荐数据...");

        // 使用基础推荐方法获取高德推荐数据
        const basicRecommendations = await getBasicRecommendations();

        console.log("✅ 高德API推荐数据获取成功:", basicRecommendations);

        // 显示成功消息
        ElMessage.success(
          `基于高德地图为您推荐了 ${basicRecommendations.attractions.length} 个景点和 ${basicRecommendations.restaurants.length} 个餐厅`
        );

        // 发送推荐数据给父组件
        emit("ai-recommendations-generated", basicRecommendations);
      } catch (error) {
        console.error("❌ 获取高德推荐数据失败:", error);
        ElMessage.warning("获取推荐数据失败，将进入空白推荐页面");

        // 即使失败也要发送一个空的推荐结果
        const emptyRecommendations = {
          attractions: [],
          restaurants: [],
          hotels: [],
          reasoning: "推荐数据获取失败，您可以在推荐页面手动搜索或重试",
          stats: {
            total: 0,
            attractions: 0,
            restaurants: 0,
            hotels: 0,
            ai: 0,
            confidence: 0,
          },
          isFallback: true,
          isError: true,
          timestamp: Date.now(),
        };

        emit("ai-recommendations-generated", emptyRecommendations);
      } finally {
        // 重置状态并进入下一步
        saving.value = false;

        // 保存偏好并进入下一步
        // console.log("💾 保存偏好数据并进入下一步");
        emit("preferences-saved", { ...tripPreferences });
      }
    };

    // 保存草稿
    const saveDraft = async () => {
      try {
        // 这里可以调用API保存草稿
        // await api.saveDraft(tripPreferences);

        ElMessage.success("草稿已保存！");
        emit("draft-saved", { ...tripPreferences });
      } catch (error) {
        console.error("保存草稿失败:", error);
        ElMessage.error("保存草稿失败：" + (error.message || "请重试"));
      }
    };

    // 返回上一步
    const goToPreviousStep = () => {
      emit("go-to-previous-step");
    };

    // 加载个人档案
    const loadPersonalProfile = async () => {
      try {
        await userStore.fetchUserPreferences();
        const userPrefs = userStore.currentUser?.preferences;

        if (userPrefs) {
          const parsed =
            typeof userPrefs === "string" ? JSON.parse(userPrefs) : userPrefs;
          personalProfile.value = parsed;

          // 初始化智能预填
          initializeSmartPrefill();
        }
      } catch (error) {
        console.warn("加载个人档案失败:", error);
      }
    };

    onMounted(() => {
      loadPersonalProfile();
    });

    // 监听个人档案变化
    watch(
      () => userStore.currentUser?.preferences,
      (newPrefs) => {
        if (newPrefs) {
          const parsed =
            typeof newPrefs === "string" ? JSON.parse(newPrefs) : newPrefs;
          personalProfile.value = parsed;
          initializeSmartPrefill();
        }
      },
      { deep: true }
    );

    return {
      tripPreferences,
      personalProfile,
      hasPersonalProfile,
      saving,
      showDetailedAI,
      showAiRecommendationDialog,
      tripPurposeOptions,
      focusAreaOptions,
      pacePreferenceOptions,
      socialPreferenceOptions,
      photoPreferenceOptions,
      temporaryNeedsOptions,
      recommendedFocusAreas,
      recommendedPace,
      recommendedSocial,
      recommendedPhoto,
      hasValidPreferences,
      selectTripPurpose,
      toggleFocusArea,
      clearFocusAreas,
      selectPacePreference,
      selectSocialPreference,
      selectPhotoPreference,
      toggleTemporaryNeed,
      getMbtiDisplayName,
      getBudgetDisplayName,
      getPaceDisplayName,
      getSocialDisplayName,
      getPhotoDisplayName,
      generateAIPreview,
      generateDetailedAI,
      savePreferences,
      confirmUseAiRecommendation,
      confirmUseBasicRecommendation,
      cancelAiRequest,
      saveDraft,
      goToPreviousStep,
    };
  },
};
</script>

<style scoped>
.trip-preferences-container {
  padding: 24px;
  background: #fff;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 32px;
  color: white;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="a" cx="50" cy="50" r="50"><stop offset="0" stop-color="white" stop-opacity="0.1"/><stop offset="1" stop-color="white" stop-opacity="0.05"/></radialGradient></defs><rect width="100" height="20" fill="url(%23a)"/></svg>');
  opacity: 0.3;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
}

.header-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  backdrop-filter: blur(10px);
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
}

.smart-prefill-notice {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.notice-icon {
  font-size: 32px;
  color: #f7cac9;
  flex-shrink: 0;
}

.notice-content h4 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
}

.notice-content p {
  margin: 0 0 12px;
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.4;
}

.profile-summary {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.profile-summary span {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 填写提示样式 */
.fill-hint {
  background: rgba(255, 255, 255, 0.15);
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  margin-top: 16px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.fill-hint strong {
  color: #f7cac9;
}

/* 偏好内容区域 */
.preferences-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.preference-section {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8eaed;
  transition: all 0.3s ease;
}

.preference-section:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 区块头部 */
.section-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 32px;
}

.section-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.2);
  flex-shrink: 0;
}

.section-info {
  flex: 1;
}

.section-title {
  margin: 0 0 8px;
  font-weight: 600;
  font-size: 24px;
  color: #303133;
}

.section-desc {
  margin: 0;
  font-size: 16px;
  color: #606266;
  line-height: 1.5;
}

.smart-tip {
  background: rgba(145, 168, 208, 0.1);
  color: #91a8d0;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* 旅行目的卡片 */
.purpose-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.purpose-card {
  padding: 24px;
  border: 2px solid #e4e7ed;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.purpose-card:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.purpose-card.selected {
  border-color: #91a8d0;
  background: linear-gradient(
    135deg,
    rgba(145, 168, 208, 0.1) 0%,
    #ffffff 100%
  );
}

.purpose-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.purpose-icon {
  font-size: 24px;
}

.purpose-name {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.purpose-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

.purpose-ai-strategy {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #909399;
  font-style: italic;
}

/* 体验重点网格 */
.focus-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.focus-item {
  position: relative;
  padding: 20px;
  border: 2px solid #e4e7ed;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.focus-item:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.focus-item.selected {
  border-color: #91a8d0;
  background: linear-gradient(
    135deg,
    rgba(145, 168, 208, 0.1) 0%,
    #ffffff 100%
  );
}

.focus-item.recommended {
  border-color: #f7cac9;
  background: linear-gradient(
    135deg,
    rgba(247, 202, 201, 0.1) 0%,
    #ffffff 100%
  );
}

.focus-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.focus-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.focus-icon {
  font-size: 20px;
}

.focus-name {
  font-weight: 600;
  color: #303133;
}

.focus-desc {
  margin: 0;
  font-size: 13px;
  color: #606266;
}

.recommended-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #f7cac9;
  color: #2c3e50;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 2px;
}

.selected-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  color: #67c23a;
  font-size: 18px;
}

.selection-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  font-size: 14px;
}

.selection-count {
  font-weight: 600;
  color: #303133;
}

/* 节奏卡片 */
.pace-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.pace-card {
  position: relative;
  padding: 24px;
  border: 2px solid #e4e7ed;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.pace-card:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.pace-card.selected {
  border-color: #91a8d0;
  background: linear-gradient(
    135deg,
    rgba(145, 168, 208, 0.1) 0%,
    #ffffff 100%
  );
}

.pace-card.recommended {
  border-color: #f7cac9;
  background: linear-gradient(
    135deg,
    rgba(247, 202, 201, 0.1) 0%,
    #ffffff 100%
  );
}

.pace-visual {
  margin-bottom: 16px;
}

.pace-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.pace-name {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.pace-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: #606266;
}

.pace-strategy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: #909399;
  font-style: italic;
}

.pace-recommended {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #f7cac9;
  color: #2c3e50;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 2px;
}

/* 社交选项 */
.social-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.social-option {
  padding: 24px;
  border: 2px solid #e4e7ed;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-option:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.social-option.selected {
  border-color: #91a8d0;
  background: linear-gradient(
    135deg,
    rgba(145, 168, 208, 0.1) 0%,
    #ffffff 100%
  );
}

.social-option.recommended {
  border-color: #f7cac9;
  background: linear-gradient(
    135deg,
    rgba(247, 202, 201, 0.1) 0%,
    #ffffff 100%
  );
}

.social-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.social-icon {
  font-size: 24px;
}

.social-name {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.social-desc {
  margin: 0 0 12px;
  font-size: 14px;
  color: #606266;
}

.social-strategy {
  font-size: 13px;
  color: #909399;
  font-style: italic;
}

/* 拍照需求 */
.photo-levels {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.photo-level {
  padding: 24px;
  border: 2px solid #e4e7ed;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.photo-level:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.photo-level.selected {
  border-color: #91a8d0;
  background: linear-gradient(
    135deg,
    rgba(145, 168, 208, 0.1) 0%,
    #ffffff 100%
  );
}

.photo-level.recommended {
  border-color: #f7cac9;
  background: linear-gradient(
    135deg,
    rgba(247, 202, 201, 0.1) 0%,
    #ffffff 100%
  );
}

.photo-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.photo-icon {
  font-size: 24px;
}

.photo-name {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.photo-desc {
  margin: 0 0 12px;
  font-size: 14px;
  color: #606266;
}

.photo-strategy {
  font-size: 13px;
  color: #909399;
  font-style: italic;
}

/* 特殊需求网格 */
.needs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.need-item {
  padding: 24px;
  border: 2px solid #e4e7ed;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.need-item:hover {
  border-color: #e53935;
  box-shadow: 0 4px 12px rgba(229, 57, 53, 0.15);
  transform: translateY(-2px);
}

.need-item.selected {
  border-color: #e53935;
  background: linear-gradient(135deg, rgba(229, 57, 53, 0.05) 0%, #ffffff 100%);
}

.need-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.need-icon {
  font-size: 20px;
}

.need-name {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.need-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

.need-strategy {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #909399;
  font-style: italic;
}

/* AI预览 */
.ai-preview {
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border-radius: 20px;
  padding: 32px;
  margin: 32px 0;
  color: white;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.preview-header h4 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.preview-content {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.preview-text {
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.9;
  margin-bottom: 16px;
}

.detailed-ai-preview {
  margin-top: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.detailed-ai-preview pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  opacity: 0.8;
}

/* 操作区域 */
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

/* 导航按钮容器 */
.navigation-buttons {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* 统一按钮样式 - 与TripBaseInfo保持一致 */
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

/* AI推荐加载遮罩样式 */
.ai-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.loading-content {
  background: white;
  border-radius: 24px;
  padding: 48px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.loading-content::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, transparent, #91a8d0, transparent);
  animation: loading-bar 2s infinite;
}

@keyframes loading-bar {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.loading-spinner {
  margin-bottom: 24px;
}

.loading-spinner .el-icon {
  font-size: 48px;
  color: #91a8d0;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-title {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #91a8d0, #f7cac9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.loading-desc {
  font-size: 16px;
  color: #606266;
  margin: 0 0 32px 0;
  line-height: 1.5;
}

.loading-progress {
  margin-bottom: 32px;
}

.progress-steps {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 16px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  opacity: 0.3;
  transition: all 0.5s ease;
}

.step.active {
  opacity: 1;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #91a8d0, #f7cac9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(145, 168, 208, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(145, 168, 208, 0);
  }
}

.step span {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  text-align: center;
}

.step.active span {
  color: #303133;
  font-weight: 600;
}

.loading-tips {
  background: linear-gradient(135deg, #f0f9eb 0%, #f7fdf2 100%);
  border: 1px solid #d9f7be;
  border-radius: 12px;
  padding: 16px 20px;
  color: #52c41a;
  font-size: 14px;
}

.loading-tips p {
  margin: 0;
  line-height: 1.4;
}

.loading-actions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-actions .el-button {
  padding: 12px 24px;
  font-size: 14px;
  border-radius: 8px;
  transition: all 0.3s ease;
  min-width: 180px;
}

.loading-actions .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cancel-hint {
  text-align: center;
  max-width: 280px;
}

.cancel-hint span {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .trip-preferences-container {
    padding: 16px;
  }

  .step-actions {
    padding: 20px 16px;
    flex-direction: column;
    gap: 16px;
  }

  .navigation-buttons {
    width: 100%;
    justify-content: space-between;
  }

  .page-header {
    padding: 32px 24px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .page-title {
    font-size: 28px;
  }

  .smart-prefill-notice {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .profile-summary {
    justify-content: center;
  }

  .preference-section {
    padding: 24px 20px;
  }

  .section-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
  }

  .purpose-cards,
  .focus-grid,
  .pace-cards,
  .social-options,
  .needs-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .photo-levels {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .navigation-buttons .el-button {
    flex: 1;
    min-width: auto;
  }

  /* 移动端加载遮罩样式 */
  .loading-content {
    padding: 32px 24px;
    max-width: 90%;
  }

  .loading-title {
    font-size: 20px;
  }

  .loading-desc {
    font-size: 14px;
  }

  .progress-steps {
    flex-direction: column;
    gap: 12px;
  }

  .step {
    flex-direction: row;
    justify-content: flex-start;
    text-align: left;
    width: 100%;
  }

  .step-icon {
    width: 32px;
    height: 32px;
    font-size: 14px;
    flex-shrink: 0;
  }

  .step span {
    font-size: 13px;
    margin-left: 12px;
  }
}

/* AI推荐确认对话框样式 */
.ai-recommendation-dialog {
  border-radius: 16px;
}

/* 使用最高优先级的选择器来覆盖Element Plus样式 */
.el-overlay .el-dialog.ai-recommendation-dialog .el-dialog__header,
.ai-recommendation-dialog.el-dialog .el-dialog__header,
.ai-recommendation-dialog .el-dialog__header {
  padding: 0 !important;
  border-bottom: none !important;
  background-color: transparent !important;
  background: transparent !important;
  border: none !important;
}

/* 确保对话框头部完全没有背景和边框 */
.el-dialog.ai-recommendation-dialog .el-dialog__header::before,
.el-dialog.ai-recommendation-dialog .el-dialog__header::after {
  display: none !important;
}

.ai-recommendation-dialog .el-dialog__body {
  padding: 0;
}

.dialog-content {
  padding: 0;
}

.dialog-header {
  display: flex;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  color: white;
  padding: 24px;
  text-align: center;
  border-radius: 8px 8px 0 0;
  align-items: center;
}

.dialog-header .header-icon {
  font-size: 32px;
  margin-bottom: 12px;
  margin-right: 25px;
}

.dialog-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.dialog-body {
  padding: 24px;
}

.dialog-description {
  text-align: center;
  color: #606266;
  margin: 0 0 24px 0;
  font-size: 16px;
  line-height: 1.5;
}

.option-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 24px;
}

.option-card {
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.option-card:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.ai-option {
  background: linear-gradient(
    135deg,
    rgba(145, 168, 208, 0.05) 0%,
    rgba(255, 255, 255, 1) 100%
  );
}

.basic-option {
  background: linear-gradient(
    135deg,
    rgba(247, 202, 201, 0.05) 0%,
    rgba(255, 255, 255, 1) 100%
  );
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.card-icon {
  font-size: 20px;
  color: #91a8d0;
}

.basic-option .card-icon {
  color: #f7cac9;
}

.card-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-content ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.card-content li {
  padding: 6px 0;
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

.dialog-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 0 24px 24px 24px;
}

.dialog-actions .el-button {
  flex: 1;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  min-height: 48px;
  transition: all 0.3s ease;
}

.dialog-actions .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 响应式 - 对话框 */
@media (max-width: 768px) {
  .ai-recommendation-dialog {
    width: 90% !important;
    margin: 0 !important;
  }

  .option-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .dialog-actions {
    flex-direction: column;
    gap: 12px;
  }

  .dialog-actions .el-button {
    min-height: 44px;
    font-size: 15px;
  }
}
</style>
