<template>
  <div class="trip-preferences-container">
    <!-- 页面标题区域 -->
    <div class="page-title">
      <div class="title-content">
        <el-icon class="title-icon">
          <MagicStick />
        </el-icon>
        <div class="title-text">
          <h2 class="main-title">✈️ 本次行程偏好</h2>
          <p class="subtitle">为这次旅行量身定制专属推荐</p>
        </div>
      </div>
    </div>

    <!-- 智能预填提示 -->
    <div v-if="hasUserPreferences" class="smart-prefill-tip">
      <div class="tip-icon">
        <el-icon><Star /></el-icon>
      </div>
      <div class="tip-content">
        <h4>🎯 智能预填已启用</h4>
        <p>根据您的个人档案，我们已为您预选了合适的选项，您可以随时调整</p>
      </div>
    </div>

    <!-- 表单区域 -->
    <div class="form-sections">
      <div class="form-section">
        <el-form
          :model="localPreferenceForm"
          class="trip-preferences-form"
          label-position="top"
        >
          
          <!-- 本次行程目标 -->
          <div class="preference-group">
            <div class="group-header">
              <div class="group-icon">
                <el-icon><Trophy /></el-icon>
              </div>
              <div class="group-info">
                <h4 class="group-title">🎯 本次行程目标</h4>
                <p class="group-desc">选择这次旅行的主要目的和期望（可多选）</p>
              </div>
            </div>
            <div class="option-cards">
              <div
                v-for="goal in tripGoalOptions"
                :key="goal.value"
                class="option-card"
                :class="{
                  active: localPreferenceForm.tripGoals.includes(goal.value),
                }"
                @click="toggleTripGoal(goal.value)"
              >
                <div class="option-content">
                  <div class="option-emoji">{{ goal.emoji }}</div>
                  <span class="option-label">{{ goal.label }}</span>
                </div>
                <div
                  v-if="localPreferenceForm.tripGoals.includes(goal.value)"
                  class="option-check"
                >
                  <el-icon><Check /></el-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- 行程节奏偏好 -->
          <div class="preference-group">
            <div class="group-header">
              <div class="group-icon">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="group-info">
                <h4 class="group-title">⏰ 行程节奏偏好</h4>
                <p class="group-desc">选择符合您这次旅行的时间安排和体验深度</p>
              </div>
            </div>
            <div class="pace-cards">
              <div
                v-for="pace in paceOptions"
                :key="pace.value"
                class="pace-card"
                :class="{
                  active: localPreferenceForm.pacePreference === pace.value,
                }"
                @click="localPreferenceForm.pacePreference = pace.value"
              >
                <div class="pace-icon">
                  {{ pace.icon }}
                </div>
                <div class="pace-content">
                  <div class="pace-title">
                    {{ pace.title }}
                  </div>
                  <div class="pace-desc">
                    {{ pace.desc }}
                  </div>
                </div>
                <div
                  v-if="localPreferenceForm.pacePreference === pace.value"
                  class="pace-check"
                >
                  <el-icon><Check /></el-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- 重点体验 -->
          <div class="preference-group">
            <div class="group-header">
              <div class="group-icon">
                <el-icon><Star /></el-icon>
              </div>
              <div class="group-info">
                <h4 class="group-title">🌟 重点体验</h4>
                <p class="group-desc">
                  选择本次行程最想体验的内容（最多5项）
                  <span
                    v-if="recommendedFocusAreas.length > 0"
                    class="smart-tip"
                  >
                    <el-icon><Star /></el-icon>
                    已为您推荐 {{ recommendedFocusAreas.length }} 项体验重点
                  </span>
                </p>
              </div>
            </div>
            <div class="experience-tags">
              <div
                v-for="option in allExperienceOptions"
                :key="option.value"
                class="experience-tag"
                :class="{
                  active: localPreferenceForm.focusAreas.includes(option.value),
                  recommended: isRecommendedFocusArea(option.value),
                  disabled:
                    !localPreferenceForm.focusAreas.includes(option.value) &&
                    localPreferenceForm.focusAreas.length >= 5,
                }"
                @click="toggleFocusArea(option.value)"
              >
                <span class="tag-emoji">{{ option.emoji }}</span>
                <span class="tag-label">{{ option.label }}</span>
                <el-icon
                  v-if="isRecommendedFocusArea(option.value)"
                  class="recommend-star"
                >
                  <Star />
                </el-icon>
                <el-icon
                  v-if="localPreferenceForm.focusAreas.includes(option.value)"
                  class="tag-check"
                >
                  <Check />
                </el-icon>
              </div>
            </div>
            <div class="selection-counter">
              已选择 {{ localPreferenceForm.focusAreas.length }}/5
            </div>
          </div>

          <!-- 环境氛围偏好 -->
          <div class="preference-group">
            <div class="group-header">
              <div class="group-icon">
                <el-icon><UserFilled /></el-icon>
              </div>
              <div class="group-info">
                <h4 class="group-title">🎭 环境氛围偏好</h4>
                <p class="group-desc">选择您更喜欢的旅行环境和氛围</p>
              </div>
            </div>
            <div class="social-cards">
              <div
                class="social-card"
                :class="{
                  active: localPreferenceForm.socialPreference === 'lively',
                }"
                @click="localPreferenceForm.socialPreference = 'lively'"
              >
                <div class="social-emoji">🎉</div>
                <div class="social-content">
                  <div class="social-title">热闹有趣</div>
                  <div class="social-desc">人气餐厅、热门景点、繁华商区</div>
                </div>
              </div>
              <div
                class="social-card"
                :class="{
                  active: localPreferenceForm.socialPreference === 'quiet',
                }"
                @click="localPreferenceForm.socialPreference = 'quiet'"
              >
                <div class="social-emoji">🌸</div>
                <div class="social-content">
                  <div class="social-title">安静私密</div>
                  <div class="social-desc">小众场所、人少景点、宁静环境</div>
                </div>
              </div>
              <div
                class="social-card"
                :class="{
                  active: localPreferenceForm.socialPreference === 'mixed',
                }"
                @click="localPreferenceForm.socialPreference = 'mixed'"
              >
                <div class="social-emoji">⚖️</div>
                <div class="social-content">
                  <div class="social-title">灵活搭配</div>
                  <div class="social-desc">热门与小众结合，丰富多样</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 拍照打卡需求 -->
          <div class="preference-group">
            <div class="group-header">
              <div class="group-icon">
                <el-icon><Camera /></el-icon>
              </div>
              <div class="group-info">
                <h4 class="group-title">📸 拍照打卡需求</h4>
                <p class="group-desc">告诉我们您对拍照和分享的重视程度</p>
              </div>
            </div>
            <div class="photo-cards">
              <div
                class="photo-card"
                :class="{
                  active: localPreferenceForm.photoPreference === 'essential',
                }"
                @click="localPreferenceForm.photoPreference = 'essential'"
              >
                <div class="photo-emoji">📸</div>
                <div class="photo-content">
                  <div class="photo-title">必须有</div>
                  <div class="photo-desc">网红打卡点优先，拍照效果佳</div>
                </div>
              </div>
              <div
                class="photo-card"
                :class="{
                  active: localPreferenceForm.photoPreference === 'casual',
                }"
                @click="localPreferenceForm.photoPreference = 'casual'"
              >
                <div class="photo-emoji">🌅</div>
                <div class="photo-content">
                  <div class="photo-title">随性拍拍</div>
                  <div class="photo-desc">自然美景即可，不刻意追求</div>
                </div>
              </div>
              <div
                class="photo-card"
                :class="{
                  active: localPreferenceForm.photoPreference === 'minimal',
                }"
                @click="localPreferenceForm.photoPreference = 'minimal'"
              >
                <div class="photo-emoji">👁️</div>
                <div class="photo-content">
                  <div class="photo-title">不太在意</div>
                  <div class="photo-desc">体验优先，拍照其次</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 本次行程的特殊限制 -->
          <div class="preference-group important-group">
            <div class="group-header">
              <div class="group-icon important">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="group-info">
                <h4 class="group-title">
                  ⚠️ 本次行程的特殊限制
                  <el-tag type="warning" size="small">重要</el-tag>
                </h4>
                <p class="group-desc">
                  请告知我们这次旅行的特殊情况和需求，确保为您推荐合适的选项
                </p>
              </div>
            </div>
            
            <!-- 临时饮食限制 -->
            <div class="restriction-category">
              <h5 class="category-title">
                <el-icon><Coffee /></el-icon>
                临时饮食限制
              </h5>
              <p class="category-desc">如果这次旅行有特殊的饮食需求（与个人档案不同）</p>
              
              <div class="dietary-tags">
                <div
                  v-for="restriction in dietaryOptions"
                  :key="restriction.value"
                  class="dietary-tag"
                  :class="{
                    active: localPreferenceForm.temporaryDietaryRestrictions.includes(
                      restriction.value
                    ),
                  }"
                  @click="toggleTemporaryDietaryRestriction(restriction.value)"
                >
                  <span class="dietary-label">{{ restriction.label }}</span>
                  <el-icon
                    v-if="
                      localPreferenceForm.temporaryDietaryRestrictions.includes(
                        restriction.value
                      )
                    "
                    class="dietary-check"
                  >
                    <Check />
                  </el-icon>
                </div>
              </div>
            </div>
            
            <!-- 行程限制 -->
            <div class="restriction-category">
              <h5 class="category-title">
                <el-icon><User /></el-icon>
                行程限制
              </h5>
              
              <div class="trip-restrictions">
                <div class="restriction-item">
                  <span>带有小孩（需要亲子友好场所）</span>
                  <el-switch v-model="localPreferenceForm.hasChildren" />
                </div>
                <div class="restriction-item">
                  <span>带有老人（需要无障碍设施）</span>
                  <el-switch v-model="localPreferenceForm.hasElderly" />
                </div>
                <div class="restriction-item">
                  <span>行动不便（需要无障碍通道）</span>
                  <el-switch v-model="localPreferenceForm.needAccessibility" />
                </div>
                <div class="restriction-item">
                  <span>预算紧张（优先经济实惠选项）</span>
                  <el-switch v-model="localPreferenceForm.budgetConstraint" />
                </div>
              </div>
            </div>

            <!-- 特殊请求 -->
            <div class="restriction-category">
              <h5 class="category-title">
                <el-icon><Edit /></el-icon>
                其他特殊请求
              </h5>
              <el-input
                v-model="localPreferenceForm.specialRequirements"
                type="textarea"
                :rows="3"
                placeholder="请描述任何其他需要特别考虑的情况，如：庆祝生日需要浪漫餐厅、商务出差时间紧张、宠物随行等"
                class="special-input"
              />
            </div>
          </div>
        </el-form>
      </div>

      <!-- 推荐区域 -->
      <RecommendationSection
        :city-info="cityInfo"
        :recommended-attractions="recommendedAttractions"
        :recommended-restaurants="recommendedRestaurants"
        :selected-attractions="selectedAttractions"
        :selected-restaurants="selectedRestaurants"
        :loading-attractions="loadingAttractions"
        :loading-restaurants="loadingRestaurants"
        :api-error="apiError"
        :search-results="searchResults"
        :is-search-mode="isSearchMode"
        :searching="searching"
        :extract-attraction-tags="extractAttractionTags"
        :extract-signature-dishes="extractSignatureDishes"
        @add-attraction="addAttractionToPlan"
        @remove-attraction="removeAttractionFromPlan"
        @add-restaurant="addRestaurantToPlan"
        @remove-restaurant="removeRestaurantFromPlan"
        @load-more-attractions="loadMoreAttractions"
        @load-more-restaurants="loadMoreRestaurants"
        @search="handleSearchFromComponent"
        @clear-search="handleClearSearch"
        @clear-all-selections="clearAllSelections"
      />

      <!-- 操作按钮区域 -->
      <div class="action-section">
        <div class="action-left">
          <el-button size="large" @click="$emit('prev-step')">
            <el-icon><ArrowLeft /></el-icon>
            上一步
          </el-button>
        </div>
        <div class="action-center">
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
          <el-button type="primary" size="large" @click="$emit('next-step')">
            下一步
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  MagicStick,
  Edit,
  Setting,
  Check,
  Star,
  ArrowLeft,
  ArrowRight,
  KnifeFork,
  Trophy,
  Timer,
  UserFilled,
  Camera,
  Document,
  Warning,
  Coffee,
  User,
} from "@element-plus/icons-vue";
import {
  getRecommendedAttractions,
  getRecommendedRestaurants,
  searchPlaces,
} from "@/api/amap.js";
import RecommendationSection from "./RecommendationSection.vue";
import { translateTag } from "@/utils/data/tagMapping.js";
import { dataCache } from "@/utils/api/dataCache.js";
import { usePreferenceStore } from "@/store/preference.js";
import { useUserStore } from "@/store/user.js";

export default {
  name: "TripPreferences",
  components: {
    MagicStick,
    Edit,
    Setting,
    Check,
    Star,
    ArrowLeft,
    ArrowRight,
    KnifeFork,
    Trophy,
    Timer,
    UserFilled,
    Camera,
    Document,
    Warning,
    Coffee,
    User,
    RecommendationSection,
  },
  props: {
    // 从父组件接收的表单数据
    baseForm: {
      type: Object,
      required: true,
    },
    // 用户偏好
    userPreferences: {
      type: Object,
      default: () => ({}),
    },
    // 偏好表单
    preferenceForm: {
      type: Object,
      required: true,
    },
    // 已选择的景点
    selectedAttractions: {
      type: Array,
      default: () => [],
    },
    // 已选择的餐厅
    selectedRestaurants: {
      type: Array,
      default: () => [],
    },
    // 是否来自草稿
    isFromDraft: {
      type: Boolean,
      default: false,
    },
    // 保存草稿状态
    savingDraft: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    "update:preferenceForm",
    "update:selectedAttractions",
    "update:selectedRestaurants",
    "prev-step",
    "next-step",
    "save-draft",
  ],
  setup(props, { emit }) {
    // 使用统一的偏好管理store
    const preferenceStore = usePreferenceStore();
    const userStore = useUserStore();

    // 计算属性：直接从store获取偏好表单数据
    const localPreferenceForm = computed({
      get: () => preferenceStore.tripPreferenceForm,
      set: (value) => preferenceStore.updateTripPreferences(value),
    });

    // 检查是否有用户偏好数据
    const hasUserPreferences = computed(() => {
      return props.userPreferences && Object.keys(props.userPreferences).length > 0;
    });

    // 初始化偏好设置
    const initializePreferences = () => {
      if (props.isFromDraft) {
        console.log("🔒 检测到草稿状态，跳过用户偏好初始化");
        return;
      }

      console.log("🔄 初始化行程偏好设置，使用preferenceStore");
      preferenceStore.initializeTripPreferences();
    };

    // 监听store中偏好表单的变化，同步到父组件
    watch(
      () => preferenceStore.tripPreferenceForm,
      (newVal) => {
        emit("update:preferenceForm", newVal);
      },
      { deep: true, immediate: true }
    );

    // 监听props.preferenceForm的变化，同步到store
    watch(
      () => props.preferenceForm,
      (newVal, oldVal) => {
        if (newVal && typeof newVal === "object") {
          const hasRealChange = JSON.stringify(newVal) !== JSON.stringify(oldVal);
          const isInitialLoad = !oldVal || Object.keys(oldVal).length === 0;

          if (hasRealChange || isInitialLoad) {
            if (props.isFromDraft) {
              console.log("🔒 从草稿加载偏好数据到store");
              preferenceStore.loadDraftPreferences(newVal);
            } else {
              console.log("📋 更新store中的偏好表单数据");
              preferenceStore.updateTripPreferences(newVal);
            }
          }
        } else if (newVal === null || newVal === undefined) {
          console.log("🔄 接收到空的preferenceForm，重置store");
          preferenceStore.resetPreferences();
        }
      },
      { deep: true, immediate: true }
    );

    // 城市信息相关状态
    const cityInfo = ref(null);
    const loadingCityInfo = ref(false);

    // 推荐景点和餐厅
    const recommendedAttractions = ref([]);
    const recommendedRestaurants = ref([]);
    const loadingAttractions = ref(false);
    const loadingRestaurants = ref(false);
    const apiError = ref(null);

    // 搜索相关状态
    const searching = ref(false);
    const searchResults = ref([]);
    const isSearchMode = ref(false);

    // 分页状态
    const attractionsPage = ref(1);
    const restaurantsPage = ref(1);
    const attractionsPageSize = 8;
    const restaurantsPageSize = 8;
    const loadingMoreAttractions = ref(false);
    const loadingMoreRestaurants = ref(false);
    const noMoreAttractions = ref(false);
    const noMoreRestaurants = ref(false);

    // 行程目标选项 - 更新为本次行程专用
    const tripGoalOptions = [
      { value: "celebration", label: "庆祝节日/生日", emoji: "🎂" },
      { value: "business", label: "商务出差顺便游玩", emoji: "💼" },
      { value: "family", label: "家庭亲子游", emoji: "👨‍👩‍👧‍👦" },
      { value: "romantic", label: "情侣蜜月游", emoji: "💕" },
      { value: "friendship", label: "朋友聚会游", emoji: "👥" },
      { value: "solo", label: "个人独旅", emoji: "🚶" },
      { value: "learning", label: "学习文化知识", emoji: "📚" },
      { value: "relaxation", label: "放松减压", emoji: "🧘" },
      { value: "adventure", label: "寻求刺激冒险", emoji: "🏔️" },
      { value: "photography", label: "摄影创作", emoji: "📷" },
    ];

    // 行程节奏选项
    const paceOptions = [
      {
        value: "slow",
        title: "慢节奏",
        desc: "深度体验，充分休息，每天2-3个地点",
        icon: "🐌",
      },
      {
        value: "balanced",
        title: "平衡型",
        desc: "景点与休息并重，每天4-5个地点",
        icon: "⚖️",
      },
      {
        value: "fast",
        title: "紧凑型",
        desc: "多看多玩，充实行程，每天6+个地点",
        icon: "⚡",
      },
    ];

    // 体验选项 - 更新为本次行程专用
    const allExperienceOptions = [
      { value: "historical_culture", label: "历史文化", emoji: "🏛️" },
      { value: "natural_scenery", label: "自然风光", emoji: "🌄" },
      { value: "local_cuisine", label: "地道美食", emoji: "🍜" },
      { value: "photo_spots", label: "网红打卡", emoji: "📸" },
      { value: "art_culture", label: "文艺体验", emoji: "🎨" },
      { value: "leisure_entertainment", label: "休闲娱乐", emoji: "🎪" },
      { value: "outdoor_adventure", label: "户外探险", emoji: "🏕️" },
      { value: "urban_lifestyle", label: "城市风情", emoji: "🏙️" },
      { value: "shopping", label: "购物体验", emoji: "🛍️" },
      { value: "nightlife", label: "夜生活", emoji: "🌃" },
      { value: "traditional_crafts", label: "传统工艺", emoji: "🏺" },
      { value: "modern_technology", label: "现代科技", emoji: "🔬" },
      { value: "religious_sites", label: "宗教文化", emoji: "⛩️" },
      { value: "local_festivals", label: "节庆活动", emoji: "🎊" },
      { value: "wellness", label: "健康养生", emoji: "🧘‍♀️" },
    ];

    // 饮食禁忌选项
    const dietaryOptions = [
      { value: "halal", label: "清真饮食" },
      { value: "vegetarian", label: "素食" },
      { value: "vegan", label: "纯素食（全素）" },
      { value: "no_pork", label: "不吃猪肉" },
      { value: "no_beef", label: "不吃牛肉" },
      { value: "no_seafood", label: "不吃海鲜" },
      { value: "no_spicy", label: "不吃辣" },
      { value: "gluten_free", label: "无麸质" },
      { value: "no_alcohol", label: "不饮酒" },
    ];

    // 根据用户偏好推荐体验重点
    const recommendedFocusAreas = computed(() => {
      if (!props.userPreferences?.selectedTags?.length) return [];
      return preferenceStore.mapUserTagsToFocusAreas(
        props.userPreferences.selectedTags
      );
    });

    // 判断是否为推荐的体验重点
    const isRecommendedFocusArea = (areaValue) => {
      return recommendedFocusAreas.value.includes(areaValue);
    };

    // 切换行程目标选择
    const toggleTripGoal = (goalValue) => {
      const goals = [...preferenceStore.tripPreferenceForm.tripGoals];
      const index = goals.indexOf(goalValue);
      if (index > -1) {
        goals.splice(index, 1);
      } else {
        goals.push(goalValue);
      }
      preferenceStore.updateTripPreference("tripGoals", goals);
    };

    // 切换体验重点选择
    const toggleFocusArea = (areaValue) => {
      const areas = [...preferenceStore.tripPreferenceForm.focusAreas];
      const index = areas.indexOf(areaValue);
      if (index > -1) {
        areas.splice(index, 1);
      } else if (areas.length < 5) {
        areas.push(areaValue);
      }
      preferenceStore.updateTripPreference("focusAreas", areas);
    };

    // 切换临时饮食禁忌选择
    const toggleTemporaryDietaryRestriction = (restrictionValue) => {
      const restrictions = [
        ...preferenceStore.tripPreferenceForm.temporaryDietaryRestrictions,
      ];
      const index = restrictions.indexOf(restrictionValue);
      if (index > -1) {
        restrictions.splice(index, 1);
      } else {
        restrictions.push(restrictionValue);
      }
      preferenceStore.updateTripPreference("temporaryDietaryRestrictions", restrictions);
    };

    // 加载城市信息和推荐 (保持原有逻辑)
    const loadCityInfo = async (city) => {
      console.log("加载城市信息和推荐");

      if (!city) {
        cityInfo.value = null;
        recommendedAttractions.value = [];
        recommendedRestaurants.value = [];
        return;
      }

      try {
        loadingCityInfo.value = true;
        apiError.value = null;
        console.log("🔍 开始加载城市信息和推荐:", city);
        cityInfo.value = city;

        // 获取推荐景点
        loadingAttractions.value = true;
        attractionsPage.value = 1;
        noMoreAttractions.value = false;

        const cityName = city.destinationName;
        console.log("使用城市名称获取推荐:", cityName);

        try {
          console.log("🔄 获取景点数据...");

          const cacheKey = dataCache.generateKey(
            "attractions",
            cityName,
            attractionsPage.value
          );
          let attractionsResponse = dataCache.get(cacheKey);

          if (!attractionsResponse) {
            console.log("🌐 调用高德API获取景点数据...");
            attractionsResponse = await getRecommendedAttractions(
              cityName,
              attractionsPage.value,
              attractionsPageSize
            );

            if (attractionsResponse && attractionsResponse.pois) {
              dataCache.set(cacheKey, attractionsResponse);
            }
          } else {
            console.log("📦 使用缓存的景点数据");
          }

          if (
            attractionsResponse &&
            attractionsResponse.pois &&
            attractionsResponse.pois.length > 0
          ) {
            console.log(
              "✅ 成功获取景点数据，共",
              attractionsResponse.pois.length,
              "条"
            );
            const attractions = attractionsResponse.pois.map((poi) => ({
              id: poi.id,
              name: poi.name,
              address: poi.address,
              rating: (poi.biz_ext && poi.biz_ext.rating) || "4.5",
              photos: poi.photos || [],
              type: poi.type.split(";")[0] || "景点",
              distance: poi.distance || null,
              tags: extractTags(poi),
              tag: poi.tag,
              matchScore: 0,
            }));

            calculateAttractionMatchScores(attractions);
            recommendedAttractions.value = sortByRelevance(attractions);

            if (
              attractionsResponse.pois.length < attractionsPageSize ||
              !attractionsResponse.count ||
              Number(attractionsResponse.count) <= attractionsPageSize
            ) {
              noMoreAttractions.value = true;
            }
          } else {
            console.log("⚠️ 景点数据为空");
            recommendedAttractions.value = [];
            noMoreAttractions.value = true;
          }
        } catch (error) {
          console.error("❌ 获取推荐景点失败:", error);
          apiError.value = "获取推荐景点失败，请稍后再试";
          recommendedAttractions.value = [];
        } finally {
          loadingAttractions.value = false;
        }

        // 获取推荐餐厅
        loadingRestaurants.value = true;
        restaurantsPage.value = 1;
        noMoreRestaurants.value = false;

        try {
          console.log("🔄 获取餐厅数据...");

          const restaurantCacheKey = dataCache.generateKey(
            "restaurants",
            cityName,
            restaurantsPage.value
          );
          let restaurantsResponse = dataCache.get(restaurantCacheKey);

          if (!restaurantsResponse) {
            console.log("🌐 调用高德API获取餐厅数据...");
            restaurantsResponse = await getRecommendedRestaurants(
              cityName,
              restaurantsPage.value,
              restaurantsPageSize
            );

            if (restaurantsResponse && restaurantsResponse.pois) {
              dataCache.set(restaurantCacheKey, restaurantsResponse);
            }
          } else {
            console.log("📦 使用缓存的餐厅数据");
          }

          if (
            restaurantsResponse &&
            restaurantsResponse.pois &&
            restaurantsResponse.pois.length > 0
          ) {
            console.log(
              "✅ 成功获取餐厅数据，共",
              restaurantsResponse.pois.length,
              "条"
            );
            const restaurants = restaurantsResponse.pois.map((poi) => ({
              id: poi.id,
              name: poi.name,
              address: poi.address,
              rating: (poi.biz_ext && poi.biz_ext.rating) || "4.5",
              photos: poi.photos || [],
              type: poi.type.split(";")[0] || "餐厅",
              price: (poi.biz_ext && poi.biz_ext.cost) || "¥¥",
              tags: extractTags(poi),
              tag: poi.tag,
              matchScore: 0,
            }));

            calculateRestaurantMatchScores(restaurants);
            recommendedRestaurants.value = sortByRelevance(restaurants);

            if (
              restaurantsResponse.pois.length < restaurantsPageSize ||
              !restaurantsResponse.count ||
              Number(restaurantsResponse.count) <= restaurantsPageSize
            ) {
              noMoreRestaurants.value = true;
            }
          } else {
            console.log("⚠️ 餐厅数据为空");
            recommendedRestaurants.value = [];
            noMoreRestaurants.value = true;
          }
        } catch (error) {
          console.error("❌ 获取推荐餐厅失败:", error);
          if (!apiError.value) {
            apiError.value = "获取推荐餐厅失败，请稍后再试";
          }
          recommendedRestaurants.value = [];
        } finally {
          loadingRestaurants.value = false;
        }
      } catch (error) {
        console.error("❌ 加载城市信息失败:", error);
        cityInfo.value = null;
        apiError.value = "加载城市信息失败，请稍后再试";
      } finally {
        loadingCityInfo.value = false;
      }
    };

    // 从POI数据中提取标签
    const extractTags = (poi) => {
      const tags = [];

      if (poi.type && typeof poi.type === "string") {
        const typeTokens = poi.type.split(";");
        tags.push(...typeTokens);
      }

      if (poi.tag && typeof poi.tag === "string") {
        const tagTokens = poi.tag.split(",");
        tags.push(...tagTokens);
      }

      if (poi.biz_type && typeof poi.biz_type === "string") {
        tags.push(poi.biz_type);
      }

      return [...new Set(tags)];
    };

    // 计算景点匹配分数
    const calculateAttractionMatchScores = (attractions) => {
      attractions.forEach((attraction) => {
        const rating = parseFloat(attraction.rating || "0");
        attraction.matchScore = rating * 10;
      });
    };

    // 计算餐厅匹配分数
    const calculateRestaurantMatchScores = (restaurants) => {
      restaurants.forEach((restaurant) => {
        const rating = parseFloat(restaurant.rating || "0");
        restaurant.matchScore = rating * 10;
      });
    };

    // 按相关性排序
    const sortByRelevance = (items) => {
      return [...items].sort((a, b) => {
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }
        return parseFloat(b.rating) - parseFloat(a.rating);
      });
    };

    // 从景点POI数据中提取标签
    const extractAttractionTags = (attraction) => {
      if (
        !attraction ||
        !attraction.tag ||
        typeof attraction.tag !== "string"
      ) {
        return [];
      }

      const tags = [];
      const tagContent = attraction.tag;
      const separators = [",", "，", "、", ";", "；", "|"];

      let tagTokens = [tagContent];
      for (const separator of separators) {
        if (tagContent.includes(separator)) {
          tagTokens = tagContent.split(separator);
          break;
        }
      }

      const featureKeywords = [
        "文化", "历史", "古迹", "自然", "风景", "公园", "博物馆", "寺庙",
        "古建筑", "休闲", "娱乐", "购物", "美食", "艺术", "科技", "亲子",
        "户外", "登山", "湖泊", "森林", "海滩", "名胜", "地标", "观光",
        "游览", "热门", "网红",
      ];

      tagTokens.forEach((token) => {
        const trimmedToken = token.trim();
        if (trimmedToken.length > 1) {
          const isFeature = featureKeywords.some((keyword) =>
            trimmedToken.includes(keyword)
          );

          const notFeature = [
            "停车", "位置", "交通", "商圈", "商场", "广场", "服务", "环境",
          ].some((keyword) => trimmedToken.includes(keyword));

          if (isFeature && !notFeature) {
            tags.push(trimmedToken);
          } else if (trimmedToken.length <= 6 && !notFeature) {
            tags.push(trimmedToken);
          }
        }
      });

      return tags;
    };

    // 从餐厅POI数据中提取招牌菜信息
    const extractSignatureDishes = (restaurant) => {
      if (
        !restaurant ||
        !restaurant.tag ||
        typeof restaurant.tag !== "string"
      ) {
        return [];
      }

      const dishes = [];
      const tagContent = restaurant.tag;
      const separators = [",", "，", "、", ";", "；", "|"];

      let tagTokens = [tagContent];
      for (const separator of separators) {
        if (tagContent.includes(separator)) {
          tagTokens = tagContent.split(separator);
          break;
        }
      }

      const dishKeywords = [
        "招牌", "特色", "推荐", "必点", "名菜", "人气", "菜", "饭", "面",
        "粉", "汤", "锅", "煲", "炒", "烤", "蒸", "炖", "煮", "焖", "烧",
        "卤", "鱼", "虾", "蟹", "牛", "羊", "猪", "鸡", "鸭", "鹅",
      ];

      tagTokens.forEach((token) => {
        const trimmedToken = token.trim();
        if (trimmedToken.length > 1) {
          const isDish = dishKeywords.some((keyword) =>
            trimmedToken.includes(keyword)
          );

          const notDish = [
            "餐饮", "服务", "环境", "价格", "停车", "位置", "交通",
            "商圈", "商场", "广场",
          ].some((keyword) => trimmedToken.includes(keyword));

          if (isDish && !notDish) {
            dishes.push(trimmedToken);
          }
        }
      });

      return dishes;
    };

    // 加载更多景点数据
    const loadMoreAttractions = async () => {
      try {
        loadingMoreAttractions.value = true;
        const cityName = props.baseForm.destinationName;
        attractionsPage.value += 1;

        const cacheKey = dataCache.generateKey(
          "attractions",
          cityName,
          attractionsPage.value
        );
        let response = dataCache.get(cacheKey);

        if (!response) {
          response = await getRecommendedAttractions(
            cityName,
            attractionsPage.value,
            attractionsPageSize
          );

          if (response && response.pois) {
            dataCache.set(cacheKey, response);
          }
        }

        if (response && response.pois && response.pois.length > 0) {
          const newAttractions = response.pois.map((poi) => ({
            id: poi.id,
            name: poi.name,
            address: poi.address,
            rating: (poi.biz_ext && poi.biz_ext.rating) || "4.5",
            photos: poi.photos || [],
            type: poi.type.split(";")[0] || "景点",
            distance: poi.distance || null,
            tags: extractTags(poi),
            tag: poi.tag,
            matchScore: 0,
          }));

          calculateAttractionMatchScores(newAttractions);
          recommendedAttractions.value = [
            ...recommendedAttractions.value,
            ...newAttractions,
          ];

          ElMessage.success(`已加载${newAttractions.length}个新推荐景点`);

          if (
            response.pois.length < attractionsPageSize ||
            !response.count ||
            Number(response.count) <= attractionsPageSize * attractionsPage.value
          ) {
            noMoreAttractions.value = true;
            ElMessage.info("已加载全部推荐景点");
          }
        } else {
          noMoreAttractions.value = true;
          ElMessage.info("没有更多推荐景点了");
        }
      } catch (error) {
        console.error("❌ 加载更多景点失败:", error);
        ElMessage.error("加载推荐景点失败，请稍后再试");
      } finally {
        loadingMoreAttractions.value = false;
      }
    };

    // 加载更多餐厅数据
    const loadMoreRestaurants = async () => {
      try {
        loadingMoreRestaurants.value = true;
        const cityName = props.baseForm.destinationName;
        restaurantsPage.value += 1;

        const cacheKey = dataCache.generateKey(
          "restaurants",
          cityName,
          restaurantsPage.value
        );
        let response = dataCache.get(cacheKey);

        if (!response) {
          response = await getRecommendedRestaurants(
            cityName,
            restaurantsPage.value,
            restaurantsPageSize
          );

          if (response && response.pois) {
            dataCache.set(cacheKey, response);
          }
        }

        if (response && response.pois && response.pois.length > 0) {
          const newRestaurants = response.pois.map((poi) => ({
            id: poi.id,
            name: poi.name,
            address: poi.address,
            rating: (poi.biz_ext && poi.biz_ext.rating) || "4.5",
            photos: poi.photos || [],
            type: poi.type.split(";")[0] || "餐厅",
            price: (poi.biz_ext && poi.biz_ext.cost) || "¥¥",
            tags: extractTags(poi),
            tag: poi.tag,
            matchScore: 0,
          }));

          calculateRestaurantMatchScores(newRestaurants);
          recommendedRestaurants.value = [
            ...recommendedRestaurants.value,
            ...newRestaurants,
          ];

          ElMessage.success(`已加载${newRestaurants.length}个新推荐餐厅`);

          if (
            response.pois.length < restaurantsPageSize ||
            !response.count ||
            Number(response.count) <= restaurantsPageSize * restaurantsPage.value
          ) {
            noMoreRestaurants.value = true;
            ElMessage.info("已加载全部推荐餐厅");
          }
        } else {
          noMoreRestaurants.value = true;
          ElMessage.info("没有更多推荐餐厅了");
        }
      } catch (error) {
        console.error("❌ 加载更多餐厅失败:", error);
        ElMessage.error("加载推荐餐厅失败，请稍后再试");
      } finally {
        loadingMoreRestaurants.value = false;
      }
    };

    // 处理来自子组件的搜索事件
    const handleSearchFromComponent = async (searchParams) => {
      try {
        searching.value = true;
        isSearchMode.value = true;
        apiError.value = null;

        const searchOptions = {
          keywords: searchParams.keyword,
          city: cityInfo.value?.destinationName,
          offset: 20,
          page: 1,
        };

        if (searchParams.type === 'attractions') {
          searchOptions.types = "110000";
        } else if (searchParams.type === 'restaurants') {
          searchOptions.types = "050000";
        }

        console.log("🔍 开始搜索:", searchOptions);
        const response = await searchPlaces(searchOptions);

        if (response && response.pois && response.pois.length > 0) {
          console.log("✅ 搜索成功，找到", response.pois.length, "个结果");

          const results = response.pois.map((poi) => {
            const isAttraction = poi.type && poi.type.includes("风景名胜");
            return {
              id: poi.id,
              name: poi.name,
              address: poi.address,
              rating: (poi.biz_ext && poi.biz_ext.rating) || "4.5",
              photos: poi.photos || [],
              type: poi.type.split(";")[0] || (isAttraction ? "景点" : "餐厅"),
              price: (poi.biz_ext && poi.biz_ext.cost) || "¥¥",
              distance: poi.distance || null,
              tags: extractTags(poi),
              tag: poi.tag,
              matchScore: 0,
              isAttraction: isAttraction,
            };
          });

          const sortedResults = sortSearchResults(results, searchParams.sortBy);
          searchResults.value = sortedResults;

          ElMessage.success(`找到 ${results.length} 个搜索结果`);
        } else {
          searchResults.value = [];
          ElMessage.info("未找到相关结果，请尝试其他关键词");
        }
      } catch (error) {
        console.error("❌ 搜索失败:", error);
        apiError.value = "搜索失败";
        searchResults.value = [];
        ElMessage.error("搜索失败");
      } finally {
        searching.value = false;
      }
    };

    // 清除搜索
    const handleClearSearch = () => {
      searchResults.value = [];
      isSearchMode.value = false;
      apiError.value = null;
    };

    // 排序搜索结果
    const sortSearchResults = (results, sortType) => {
      const sorted = [...results];

      switch (sortType) {
        case "rating":
          return sorted.sort(
            (a, b) => parseFloat(b.rating) - parseFloat(a.rating)
          );
        case "distance":
          return sorted.sort((a, b) => {
            const distA = parseFloat(a.distance) || Infinity;
            const distB = parseFloat(b.distance) || Infinity;
            return distA - distB;
          });
        default:
          return sorted;
      }
    };

    // 景点和餐厅选择相关方法
    const isAttractionSelected = (attraction) => {
      return props.selectedAttractions.some((a) => a.id === attraction.id);
    };

    const addAttractionToPlan = (attraction) => {
      if (!isAttractionSelected(attraction)) {
        const updatedAttractions = [...props.selectedAttractions, attraction];
        emit("update:selectedAttractions", updatedAttractions);
        ElMessage.success("操作成功");
      }
    };

    const removeAttractionFromPlan = (attraction) => {
      const index = props.selectedAttractions.findIndex(
        (a) => a.id === attraction.id
      );
      if (index !== -1) {
        const updatedAttractions = [...props.selectedAttractions];
        updatedAttractions.splice(index, 1);
        emit("update:selectedAttractions", updatedAttractions);
        ElMessage.info("删除成功");
      }
    };

    const isRestaurantSelected = (restaurant) => {
      return props.selectedRestaurants.some((r) => r.id === restaurant.id);
    };

    const addRestaurantToPlan = (restaurant) => {
      if (!isRestaurantSelected(restaurant)) {
        const updatedRestaurants = [...props.selectedRestaurants, restaurant];
        emit("update:selectedRestaurants", updatedRestaurants);
        ElMessage.success("操作成功");
      }
    };

    const removeRestaurantFromPlan = (restaurant) => {
      const index = props.selectedRestaurants.findIndex(
        (r) => r.id === restaurant.id
      );
      if (index !== -1) {
        const updatedRestaurants = [...props.selectedRestaurants];
        updatedRestaurants.splice(index, 1);
        emit("update:selectedRestaurants", updatedRestaurants);
        ElMessage.info("删除成功");
      }
    };

    // 清空所有选择
    const clearAllSelections = async () => {
      try {
        await ElMessageBox.confirm(
          `确定要清空所有选择吗？共 ${props.selectedAttractions.length} 个景点和 ${props.selectedRestaurants.length} 家餐厅。`,
          "警告",
          {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        emit("update:selectedAttractions", []);
        emit("update:selectedRestaurants", []);
        ElMessage.success("操作成功");
      } catch {
        // 用户取消
      }
    };

    // 监听目的地变化，加载城市信息
    watch(
      () => props.baseForm.destinationCity,
      (newDestination) => {
        if (newDestination) {
          loadCityInfo(newDestination);
        }
      },
      { immediate: true }
    );

    // 监听用户偏好变化，动态应用默认值
    watch(
      () => props.userPreferences,
      (newPreferences) => {
        if (props.isFromDraft) {
          console.log("🔒 草稿状态中，跳过用户偏好变化处理");
          return;
        }

        if (newPreferences && Object.keys(newPreferences).length > 0) {
          console.log(
            "🔄 检测到用户偏好数据变化，重新应用默认值:",
            newPreferences
          );
          initializePreferences();
        }
      },
      { deep: true, immediate: false }
    );

    // 组件加载时初始化
    onMounted(() => {
      if (!props.isFromDraft) {
        console.log("🔄 非草稿状态，初始化偏好设置");
        initializePreferences();
      } else {
        console.log("🔒 草稿状态，偏好已通过store加载");
      }

      if (props.baseForm) {
        console.log("pre 高德");
        setTimeout(async () => {
          await loadCityInfo(props.baseForm);
        }, 1000);
      }
    });

    return {
      localPreferenceForm,
      hasUserPreferences,
      cityInfo,
      recommendedAttractions,
      recommendedRestaurants,
      loadingAttractions,
      loadingRestaurants,
      apiError,
      loadMoreAttractions,
      loadMoreRestaurants,
      tripGoalOptions,
      paceOptions,
      allExperienceOptions,
      dietaryOptions,
      translateTag,
      recommendedFocusAreas,
      isRecommendedFocusArea,
      extractTags,
      extractAttractionTags,
      extractSignatureDishes,
      isAttractionSelected,
      addAttractionToPlan,
      removeAttractionFromPlan,
      isRestaurantSelected,
      addRestaurantToPlan,
      removeRestaurantFromPlan,
      clearAllSelections,
      toggleTripGoal,
      toggleFocusArea,
      toggleTemporaryDietaryRestriction,
      searching,
      searchResults,
      isSearchMode,
      handleSearchFromComponent,
      handleClearSearch,
    };
  },
};
</script>

<style scoped>
/* 整体布局 */
.trip-preferences-container {
  width: 100%;
  background: #f8f9fa;
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

/* 智能预填提示 */
.smart-prefill-tip {
  background: linear-gradient(135deg, #fff7e6 0%, #fffbf0 100%);
  border: 1px solid #ffe7ba;
  border-radius: 16px;
  padding: 20px 24px;
  margin: 0 24px 32px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.1);
}

.tip-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
}

.tip-content h4 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #d46b08;
}

.tip-content p {
  margin: 0;
  font-size: 14px;
  color: #ad6800;
  line-height: 1.4;
}

/* 表单区域 */
.form-sections {
  padding: 0;
  width: 100%;
  max-width: none;
  margin: 0 auto;
}

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

.trip-preferences-form {
  margin-top: 0;
}

.preference-group {
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 1px solid #f0f2f5;
}

.preference-group:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.preference-group.important-group {
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
  border: 1px solid #fde2e2;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 40px;
}

/* 组头部样式 */
.group-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.group-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.2);
  flex-shrink: 0;
}

.group-icon.important {
  background: linear-gradient(135deg, #f56c6c 0%, #ff7875 100%);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.group-info {
  flex: 1;
}

.group-title {
  margin: 0 0 8px;
  font-weight: 600;
  font-size: 18px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-desc {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.smart-tip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #fff7e6 0%, #fffbf0 100%);
  border: 1px solid #ffe7ba;
  border-radius: 12px;
  padding: 4px 8px;
  color: #d46b08;
  font-size: 12px;
  margin-left: 8px;
}

/* 选项卡片样式 */
.option-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.option-card {
  position: relative;
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-card:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.option-card.active {
  border-color: #91a8d0;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  box-shadow: 0 6px 16px rgba(145, 168, 208, 0.2);
}

.option-content {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.option-emoji {
  font-size: 24px;
}

.option-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.option-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: #67c23a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

/* 节奏卡片样式 */
.pace-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.pace-card {
  position: relative;
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 16px;
}

.pace-card:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.pace-card.active {
  border-color: #91a8d0;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  box-shadow: 0 6px 16px rgba(145, 168, 208, 0.2);
}

.pace-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.pace-content {
  flex: 1;
}

.pace-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.pace-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.4;
}

.pace-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 20px;
  height: 20px;
  background: #67c23a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

/* 体验标签样式 */
.experience-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.experience-tag {
  position: relative;
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 20px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
}

.experience-tag:hover:not(.disabled) {
  border-color: #91a8d0;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(145, 168, 208, 0.15);
}

.experience-tag.active {
  border-color: #91a8d0;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  color: #91a8d0;
}

.experience-tag.recommended {
  border-color: #faad14;
  background: linear-gradient(135deg, #fff7e6 0%, #ffffff 100%);
}

.experience-tag.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tag-emoji {
  font-size: 16px;
}

.tag-label {
  font-size: 14px;
  font-weight: 500;
}

.recommend-star {
  color: #faad14;
  font-size: 12px;
}

.tag-check {
  color: #67c23a;
  font-size: 14px;
}

.selection-counter {
  margin-top: 12px;
  font-size: 13px;
  color: #909399;
  text-align: center;
}

/* 社交和拍照卡片样式 */
.social-cards,
.photo-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.social-card,
.photo-card {
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.social-card:hover,
.photo-card:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.social-card.active,
.photo-card.active {
  border-color: #91a8d0;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
}

.social-emoji,
.photo-emoji {
  font-size: 32px;
  margin-bottom: 12px;
}

.social-content,
.photo-content {
  text-align: center;
}

.social-title,
.photo-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.social-desc,
.photo-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.4;
}

/* 限制条件样式 */
.restriction-category {
  margin-bottom: 24px;
  padding: 20px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.restriction-category:last-child {
  margin-bottom: 0;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.category-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: #909399;
  line-height: 1.4;
}

/* 饮食禁忌标签样式 */
.dietary-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.dietary-tag {
  position: relative;
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 20px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
}

.dietary-tag:hover {
  border-color: #f56c6c;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.15);
}

.dietary-tag.active {
  border-color: #f56c6c;
  background: linear-gradient(135deg, #fef0f0 0%, #ffffff 100%);
  color: #f56c6c;
}

.dietary-label {
  font-size: 14px;
  font-weight: 500;
}

.dietary-check {
  color: #67c23a;
  font-size: 14px;
}

/* 行程限制 */
.trip-restrictions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.restriction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.restriction-item:last-child {
  border-bottom: none;
}

/* 特殊需求输入框 */
.special-input {
  border-radius: 8px;
  border: 2px solid #e4e7ed;
}

.special-input:focus-within {
  border-color: #91a8d0;
}

/* 操作按钮区域 */
.action-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-top: 32px;
  margin-bottom: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: none;
}

.action-left {
  flex: 0 0 auto;
}

.action-center {
  flex: 0 0 auto;
}

.action-right {
  flex: 0 0 auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .trip-preferences-container {
    padding: 16px;
  }

  .page-title {
    padding: 24px 16px;
  }

  .smart-prefill-tip {
    margin: 0 16px 24px;
    padding: 16px;
    flex-direction: column;
    text-align: center;
  }

  .form-section {
    padding: 24px 20px;
  }

  .group-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }

  .option-cards {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 10px;
  }

  .pace-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .social-cards,
  .photo-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .experience-tags {
    justify-content: center;
  }

  .dietary-tags {
    justify-content: center;
  }

  .trip-restrictions {
    gap: 12px;
  }

  .action-section {
    flex-direction: column;
    gap: 16px;
  }

  .action-section .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .title-text .main-title {
    font-size: 24px;
  }

  .option-cards {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .experience-tags {
    flex-direction: column;
    align-items: center;
  }

  .dietary-tags {
    flex-direction: column;
    align-items: center;
  }
}
</style>