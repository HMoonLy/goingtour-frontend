<template>
  <div class="trip-preferences-container">
    <!-- AI推荐加载遮罩 -->
    <div v-if="saving">
      <AiLoadingOverlay @cancel="cancelAiRequest" />
    </div>

    <!-- 页面标题区域 -->
    <div class="page-title">
      <div class="title-content">
        <el-icon class="title-icon">
          <Suitcase />
        </el-icon>
        <div class="title-text">
          <h2 class="main-title">行程偏好设置</h2>
          <p class="subtitle">为这次旅行量身定制，随时可以调整的偏好设置</p>
        </div>
      </div>
    </div>

    <!-- 行程偏好设置区域 -->
    <el-card class="info-card">
      <div class="preferences-content">
        <!-- 个人档案智能提示 (保留并简化) -->
        <div v-if="hasPersonalProfile" class="smart-prefill-simple">
          <el-alert
            title="智能预填已启用"
            type="success"
            :closable="false"
            show-icon
          >
            <template #default>
              根据您的个人档案（{{ getMbtiDisplayName(personalProfile.mbtiType) }}），已为您预选合适的选项。
            </template>
          </el-alert>
        </div>

        <!-- 1. 旅行目的 -->
        <PreferenceTripPurpose
          :model-value="localPreferences.tripPurpose"
          :options="tripPurposeOptions"
          @update:model-value="(val) => updatePreference('tripPurpose', val)"
        />

        <!-- 2. 体验重点 -->
        <PreferenceFocusArea
          :model-value="localPreferences.focusAreas"
          :options="focusAreaOptions"
          :recommended-options="recommendedFocusAreas"
          @update:model-value="(val) => updatePreference('focusAreas', val)"
        />

        <!-- 3. 行程节奏 -->
        <PreferencePace
          :model-value="localPreferences.pacePreference"
          :options="pacePreferenceOptions"
          :recommended-value="recommendedPace"
          @update:model-value="(val) => updatePreference('pacePreference', val)"
        />

        <!-- 4. 社交偏好 -->
        <PreferenceSocial
          :model-value="localPreferences.socialPreference"
          :options="socialPreferenceOptions"
          :recommended-value="recommendedSocial"
          @update:model-value="(val) => updatePreference('socialPreference', val)"
        />

        <!-- 5. 拍照需求 -->
        <PreferencePhoto
          :model-value="localPreferences.photoPreference"
          :options="photoPreferenceOptions"
          :recommended-value="recommendedPhoto"
          @update:model-value="(val) => updatePreference('photoPreference', val)"
        />

        <!-- 6. 临时特殊需求 -->
        <PreferenceTemporaryNeeds
          :model-value="localPreferences.temporaryNeeds"
          :options="temporaryNeedsOptions"
          @update:model-value="(val) => updatePreference('temporaryNeeds', val)"
        />
      </div>
    </el-card>

    <!-- AI理解预览 -->
    <AiPreviewSection
      :preferences="localPreferences"
      :personal-profile="personalProfile"
      :trip-context="tripContext"
      :has-valid-preferences="hasValidPreferences"
      style="margin-top: 24px;"
    />

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
    <AiRecommendationDialog
      v-model="showAiRecommendationDialog"
      @confirm-ai="confirmUseAiRecommendation"
      @confirm-basic="confirmUseBasicRecommendation"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  Document,
  ArrowRight,
  ArrowLeft,
  Suitcase,
} from "@element-plus/icons-vue";
import {
  TRIP_PREFERENCES_OPTIONS,
  PERSONAL_PROFILE_OPTIONS,
} from "@/utils/data/travelDataSystem.js";
import {
  SmartPrefillEngine,
} from "@/utils/data/aiPromptEngine.js";
import { useUserStore } from "@/store/user.js";
import { usePreferenceStore } from "@/store/preference.js";
import { useProfile } from "@/composables/user/useProfile.js";

// 导入拆分的子组件
import AiLoadingOverlay from "./TripPreferencesParts/AiLoadingOverlay.vue";
import PreferenceTripPurpose from "./TripPreferencesParts/PreferenceTripPurpose.vue";
import PreferenceFocusArea from "./TripPreferencesParts/PreferenceFocusArea.vue";
import PreferencePace from "./TripPreferencesParts/PreferencePace.vue";
import PreferenceSocial from "./TripPreferencesParts/PreferenceSocial.vue";
import PreferencePhoto from "./TripPreferencesParts/PreferencePhoto.vue";
import PreferenceTemporaryNeeds from "./TripPreferencesParts/PreferenceTemporaryNeeds.vue";
import AiPreviewSection from "./TripPreferencesParts/AiPreviewSection.vue";
import AiRecommendationDialog from "./TripPreferencesParts/AiRecommendationDialog.vue";

export default {
  name: "TripPreferencesNew",
  components: {
    Document,
    ArrowRight,
    ArrowLeft,
    Suitcase,
    AiLoadingOverlay,
    // TripPreferencesHeader,
    PreferenceTripPurpose,
    PreferenceFocusArea,
    PreferencePace,
    PreferenceSocial,
    PreferencePhoto,
    PreferenceTemporaryNeeds,
    AiPreviewSection,
    AiRecommendationDialog,
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
    "draft-saved",
  ],
  setup(props, { emit }) {
    const userStore = useUserStore();
    const preferenceStore = usePreferenceStore();
    const { fetchUserPreferences } = useProfile();
    const saving = ref(false);
    const showAiRecommendationDialog = ref(false);

    // 个人档案数据
    const personalProfile = ref({});
    const hasPersonalProfile = computed(
      () => Object.keys(personalProfile.value).length > 0
    );

    // 行程偏好数据 - 直接使用 preferenceStore 的数据
    const tripPreferences = computed({
      get: () => preferenceStore.tripPreferenceForm,
      set: (value) => preferenceStore.updateTripPreferences(value),
    });

    // 本地临时状态（用于兼容现有UI逻辑）
    const localPreferences = reactive({
      tripPurpose: "", // 映射到 tripGoals
      focusAreas: [],
      pacePreference: "balanced",
      socialPreference: "mixed", 
      photoPreference: "casual",
      temporaryNeeds: [],
      specialRequirements: "",
      dietaryRestrictions: [],
      customDietaryNotes: "",
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

    // 数据同步函数：将本地数据同步到store
    const syncToStore = () => {
      const storeData = {
        tripGoals: localPreferences.tripPurpose ? [localPreferences.tripPurpose] : [],
        focusAreas: [...localPreferences.focusAreas],
        pacePreference: localPreferences.pacePreference,
        socialPreference: localPreferences.socialPreference,
        photoPreference: localPreferences.photoPreference,
        specialRequirements: localPreferences.specialRequirements,
        dietaryRestrictions: [...localPreferences.dietaryRestrictions],
        customDietaryNotes: localPreferences.customDietaryNotes,
        temporaryNeeds: [...localPreferences.temporaryNeeds],
      };
      
      preferenceStore.updateTripPreferences(storeData);
      
      // 同时触发父组件更新事件
      emit("preferences-updated", storeData);
    };

    // 通用更新函数
    const updatePreference = (key, value) => {
      localPreferences[key] = value;
      syncToStore();
    };

    // 从store初始化本地数据
    const initFromStore = () => {
      const storeData = preferenceStore.tripPreferenceForm;
      if (storeData) {
        localPreferences.tripPurpose = storeData.tripGoals?.[0] || "";
        localPreferences.focusAreas = [...(storeData.focusAreas || [])];
        localPreferences.pacePreference = storeData.pacePreference || "balanced";
        localPreferences.socialPreference = storeData.socialPreference || "mixed";
        localPreferences.photoPreference = storeData.photoPreference || "casual";
        localPreferences.specialRequirements = storeData.specialRequirements || "";
        localPreferences.dietaryRestrictions = [...(storeData.dietaryRestrictions || [])];
        localPreferences.customDietaryNotes = storeData.customDietaryNotes || "";
        localPreferences.temporaryNeeds = [...(storeData.temporaryNeeds || [])];
      }
    };

    // 偏好完整性检查 - 基于本地数据
    const hasValidPreferences = computed(() => {
      return !!(
        localPreferences.tripPurpose ||
        localPreferences.focusAreas.length > 0 ||
        localPreferences.temporaryNeeds.length > 0 ||
        localPreferences.pacePreference !== "balanced" ||
        localPreferences.socialPreference !== "mixed" ||
        localPreferences.photoPreference !== "casual"
      );
    });

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
        !localPreferences.pacePreference ||
        localPreferences.pacePreference === "balanced"
      ) {
        localPreferences.pacePreference = defaults.pacePreference;
      }
      if (
        !localPreferences.socialPreference ||
        localPreferences.socialPreference === "mixed"
      ) {
        localPreferences.socialPreference = defaults.socialPreference;
      }
      if (
        !localPreferences.photoPreference ||
        localPreferences.photoPreference === "casual"
      ) {
        localPreferences.photoPreference = defaults.photoPreference;
      }
      if (
        localPreferences.focusAreas.length === 0 &&
        defaults.focusAreas.length > 0
      ) {
        localPreferences.focusAreas = [...defaults.focusAreas.slice(0, 3)];
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
        // (保持原有逻辑)
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

        // 构建完整的请求参数
        const requestParams = {
          baseInfo: {
            destinationName: props.tripContext?.destinationName || props.tripContext?.destination || "",
            destination: props.tripContext?.destination || props.tripContext?.destinationName || "",
            days: props.tripContext?.days || 3,
            budget: props.tripContext?.budget || "moderate",
            travelers: props.tripContext?.travelers || 1,
            dateRange: props.tripContext?.dateRange || null,
          },
          
          preferences: {
            travelPurpose: localPreferences.tripPurpose || "",
            travelPurposeDetail: convertToDetailedData('tripPurpose', localPreferences.tripPurpose),
            focusAreas: localPreferences.focusAreas || [],
            focusAreasDetails: convertListToDetailedData('focusAreas', localPreferences.focusAreas),
            interests: localPreferences.focusAreas || [],
            pacePreference: localPreferences.pacePreference || "",
            pacePreferenceDetail: convertToDetailedData('pacePreference', localPreferences.pacePreference),
            socialPreference: localPreferences.socialPreference || "",
            socialPreferenceDetail: convertToDetailedData('socialPreference', localPreferences.socialPreference),
            photoPreference: localPreferences.photoPreference || "",
            photoPreferenceDetail: convertToDetailedData('photoPreference', localPreferences.photoPreference),
            specialRequirements: localPreferences.specialRequirements || "",
            temporaryNeeds: localPreferences.temporaryNeeds || [],
            temporaryNeedsDetails: convertListToDetailedData('temporaryNeeds', localPreferences.temporaryNeeds),
            dietaryRestrictions: [
              ...(personalProfile.value?.dietaryRestrictions || []),
              ...(localPreferences.dietaryRestrictions || []),
            ],
            dietaryRestrictionsDetails: convertListToDetailedData('dietaryRestrictions', [
              ...(personalProfile.value?.dietaryRestrictions || []),
              ...(localPreferences.dietaryRestrictions || []),
            ]),
            customDietaryNotes: localPreferences.customDietaryNotes || "",
            budgetPreference: props.tripContext?.budget || "moderate",
            accommodationLevel: localPreferences.accommodationLevel || "moderate",
            transportationMode: personalProfile.value?.transportPreferences || [],
            transportationModeDetails: convertListToDetailedData('transportPreferences', personalProfile.value?.transportPreferences || []),
          },
          
          userProfile: {
            mbtiType: personalProfile.value?.mbtiType || "",
            mbtiDetail: convertToDetailedData('mbtiTypes', personalProfile.value?.mbtiType),
            coreInterests: personalProfile.value?.coreInterests || [],
            coreInterestsDetails: convertListToDetailedData('coreInterests', personalProfile.value?.coreInterests || []),
            budgetLevel: personalProfile.value?.budgetLevel || "moderate",
            budgetLevelDetail: convertToDetailedData('budgetLevel', personalProfile.value?.budgetLevel),
            dietaryRestrictions: personalProfile.value?.dietaryRestrictions || [],
            dietaryRestrictionsDetails: convertListToDetailedData('dietaryRestrictions', personalProfile.value?.dietaryRestrictions || []),
            transportPreferences: personalProfile.value?.transportPreferences || [],
            transportPreferencesDetails: convertListToDetailedData('transportPreferences', personalProfile.value?.transportPreferences || []),
          },
          
          maxAttractions: 8,
          maxRestaurants: 6,
          maxHotels: 4,
          includeReasonings: false,
          includeConfidenceScores: false,
          context: {
            timestamp: new Date().toISOString(),
            source: "trip-preferences-step",
            version: "3.0",
          },
        };

        console.log("🤖 发起AI推荐请求，携带完整的前两步信息:", requestParams);
        
        const progressInterval = setInterval(() => {
          console.log("⏳ AI推荐生成中，请耐心等待...");
        }, 15000);

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
            `AI推荐生成完成！为您推荐了 ${apiResponse.data?.attractions?.length || 0} 个景点、${apiResponse.data?.restaurants?.length || 0} 个餐厅`
          );
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

      emit("preferences-saved", { ...tripPreferences.value });
      saving.value = false;
    };

    // 确认使用基础推荐
    const confirmUseBasicRecommendation = () => {
      showAiRecommendationDialog.value = false;
      console.log("🗺️ 用户选择使用基础推荐（高德地图）");
      emit("use-basic-recommendation");
      console.log("💾 保存偏好数据:", tripPreferences.value);
      emit("preferences-saved", { ...tripPreferences.value });
    };

    // 获取基础推荐数据 (保持原有逻辑)
    const getBasicRecommendations = async () => {
      console.log('🗺️ 用户选择使用高德地图基础推荐，开始获取数据...')
      const { getRecommendedAttractions, getRecommendedRestaurants, getRecommendedHotels } =
        await import("@/api/amap.js");

      const cityName = props.tripContext?.destination || "";
      if (!cityName) {
        throw new Error("缺少目的地信息，无法获取推荐数据");
      }

      const [attractionsResult, restaurantsResult, hotelsResult] = await Promise.all([
        getRecommendedAttractions(cityName, 1, 8).catch((err) => ({ pois: [] })),
        getRecommendedRestaurants(cityName, 1, 6).catch((err) => ({ pois: [] })),
        getRecommendedHotels(cityName, 1, 4).catch((err) => ({ pois: [] })),
      ]);

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

      const hotels = (hotelsResult.pois || []).map((poi, index) => ({
        id: poi.id || `hotel_${index}`,
        name: poi.name,
        description: poi.address || poi.type || '暂无描述',
        rating: parseFloat((poi.biz_ext && poi.biz_ext.rating) || 4.5),
        price: parseInt((poi.biz_ext && poi.biz_ext.cost) || 300),
        starRating: (poi.biz_ext && poi.biz_ext.star) ? poi.biz_ext.star.length : 4,
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

      return {
        attractions,
        restaurants,
        hotels,
        reasoning: `为您展示 ${cityName} 的热门推荐。基于高德地图数据的优质选择，值得一游！`,
        stats: {
          total: attractions.length + restaurants.length + hotels.length,
          attractions: attractions.length,
          restaurants: restaurants.length,
          hotels: hotels.length,
          ai: 0,
          confidence: 0.75,
        },
        isBasic: true,
        isAmapData: true,
        sessionId: `basic_${Date.now()}`,
        generatedAt: new Date().toISOString(),
        timestamp: Date.now(),
      };
    };

    // 获取备用推荐
    const getFallbackRecommendations = async () => {
      // 这里的逻辑复用 getBasicRecommendations 或类似逻辑
      // 为简化，直接调用 basic
      return await getBasicRecommendations();
    };

    // 取消AI推荐请求
    const cancelAiRequest = async () => {
      console.log("🚫 用户取消AI推荐请求，直接跳转到基础推荐页面");

      try {
        // 1. 切换到基础推荐模式
        emit("use-basic-recommendation");
        
        // 2. 停止loading
        saving.value = false;
        
        // 3. 同步并保存偏好（触发父组件跳转）
        syncToStore();
        emit("preferences-saved", preferenceStore.tripPreferenceForm);
        
        ElMessage.success("已切换至基础推荐模式");
      } catch (error) {
        console.error("切换推荐模式失败:", error);
        ElMessage.error("操作失败，请重试");
        saving.value = false;
      }
    };

    // 保存草稿
    const saveDraft = async () => {
      try {
        ElMessage.success("草稿已保存！");
        emit("draft-saved", { ...localPreferences });
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
        await fetchUserPreferences();
        const userPrefs = userStore.currentUser?.preferences;

        if (userPrefs) {
          const parsed =
            typeof userPrefs === "string" ? JSON.parse(userPrefs) : userPrefs;
          personalProfile.value = parsed;
          initializeSmartPrefill();
        }
      } catch (error) {
        console.warn("加载个人档案失败:", error);
      }
    };

    onMounted(() => {
      loadPersonalProfile();
      initFromStore();
    });

    // 监听 store 变化，确保草稿恢复时本地状态能同步
    watch(
      () => preferenceStore.tripPreferenceForm,
      (newVal) => {
        if (newVal) {
          console.log("🔄 检测到 Store 偏好更新，同步到本地状态...");
          initFromStore();
        }
      },
      { deep: true }
    );

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

    // 获取MBTI显示名称
    const getMbtiDisplayName = (type) => {
      return type || ''; 
    };

    return {
      tripPreferences,
      localPreferences,
      personalProfile,
      hasPersonalProfile,
      getMbtiDisplayName,
      saving,
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
      
      updatePreference,
      
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
  width: 100%;
}

.page-title {
  padding: 24px 16px;
}

.title-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 48px;
  height: 48px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border-radius: 12px;
  color: var(--el-color-primary);
  border: 1px solid var(--el-color-primary-light-5);
}

.title-text .main-title {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.title-text .subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
  line-height: 1.4;
}

.info-card {
  border: none;
  box-shadow: none;
  overflow: visible;
}

.preferences-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.smart-prefill-simple {
  margin-bottom: 16px;
}

/* 操作区域 */
.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
  background: transparent;
  box-shadow: none;
  border-radius: 0;
  padding: 24px 0 0 0;
}

.action-left {
  display: flex;
  gap: 16px;
}

.action-right {
  display: flex;
  gap: 16px;
}

/* 导航按钮容器 */
.navigation-buttons {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* 统一按钮样式 */
/* .el-button styles inherit from theme or scoped logic if needed, but Element defaults are fine usually */

@media (max-width: 768px) {
  .page-title {
    padding: 16px;
    margin-bottom: 16px;
  }

  .title-content {
    gap: 12px;
  }

  .title-text .main-title {
    font-size: 20px;
  }

  .step-actions {
    flex-direction: column-reverse;
    gap: 16px;
    padding: 20px 0 0 0;
  }
  
  .action-left, .action-right {
    width: 100%;
  }

  .navigation-buttons {
    width: 100%;
    justify-content: space-between;
  }

  .navigation-buttons .el-button,
  .action-left .el-button {
    flex: 1;
    width: 100%;
  }
}
</style>
