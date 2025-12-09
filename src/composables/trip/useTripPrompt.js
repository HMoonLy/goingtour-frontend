import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import {
  translateTag,
  translateTagsToString,
  smartTranslateTag,
  getBudgetText as getBudgetTextUtil,
  getCityName,
  validateTripGenerationRules,
  TRIP_PREFERENCES_OPTIONS
} from "@/utils/data/travelDataSystem.js";
import { generateCompletePrompt } from "@/utils/data/aiPromptEngine.js";
import { useUserStore } from "@/store/user.js";

export function useTripPrompt(props) {
  const userStore = useUserStore();
  
  // Generation style
  const selectedGenerationStyle = ref("table");
  
  // Prompt dialog state
  const fullPromptVisible = ref(false);
  const fullPromptText = ref("");

  // Computed: Current User Preferences
  const currentUserPreferences = computed(() => {
    return props.userPreferences || userStore.userPreferences;
  });

  // Computed: Has User Preferences
  const hasUserPreferences = computed(() => {
    const preferences = currentUserPreferences.value;
    if (!preferences) return false;

    return !!(
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
  });

  // Computed: Selected Preference Tags (Chinese)
  const selectedPreferenceTags = computed(() => {
    const preferences = currentUserPreferences.value;
    if (!preferences) return [];

    const tags = [];
    const travelTags = preferences.selectedTags || preferences.tags || [];

    if (Array.isArray(travelTags) && travelTags.length > 0) {
      const tripFocus = props.preferenceForm && Array.isArray(props.preferenceForm.focusAreas)
        ? props.preferenceForm.focusAreas
        : [];
      const isTripFocusSet = tripFocus.length > 0;
      
      travelTags.forEach((tag) => {
        const focusAreaTranslation = translateTag(tag, 'coreInterests');
        const isFocusDomainTag = focusAreaTranslation !== tag;
        if (isTripFocusSet && isFocusDomainTag && !tripFocus.includes(tag)) {
          return;
        }
        const chineseTag = smartTranslateTag(tag);
        tags.push(chineseTag);
      });
    }

    const transports = preferences.selectedTransports || [];
    if (Array.isArray(transports) && transports.length > 0) {
      transports.forEach((transport) => {
        const chineseTag = translateTag(transport, 'transportPreferences');
        if (chineseTag) tags.push(chineseTag);
      });
    }

    if (preferences.accommodationType) {
      const chineseTag = smartTranslateTag(preferences.accommodationType);
      if (chineseTag) tags.push(chineseTag);
    }

    if (preferences.travelPace && !(props.preferenceForm && props.preferenceForm.pacePreference)) {
      const chineseTag = translateTag(preferences.travelPace, 'pacePreference');
      if (chineseTag) tags.push(chineseTag);
    }

    const foodTastes = preferences.foodTastes || [];
    if (Array.isArray(foodTastes) && foodTastes.length > 0) {
      foodTastes.forEach((taste) => {
        const chineseTag = translateTag(taste, 'cuisinePreference');
        tags.push(chineseTag);
      });
    }

    if (preferences.mbtiType) {
      tags.push(`MBTI: ${preferences.mbtiType}`);
    }

    return [...new Set(tags)].slice(0, 15);
  });

  // Helper: Get City Name
  const getSelectedCityName = () => {
    if (!props || !props.baseForm) return "未设置";
    return getCityName(props.baseForm?.destination, props.baseForm?.destinationName);
  };

  // Helper: Format Date Range
  const formatDateRange = (dateRange) => {
    const range = dateRange || props.baseForm?.dateRange;
    if (!range || range.length !== 2) {
      return "未设置";
    }
    const startDate = new Date(range[0]);
    const endDate = new Date(range[1]);
    return `${startDate.toLocaleDateString()} 至 ${endDate.toLocaleDateString()}`;
  };

  // Helper: Get Budget Text
  const getBudgetText = () => {
    if (!props || !props.baseForm) return "未设置";
    return getBudgetTextUtil(props.baseForm.budget);
  };

  // Helper: Get System Option Text
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

  // Helper: Prompt Score
  const getPromptCompletionScore = () => {
    if (!props || !props.baseForm || !props.preferenceForm) return 0;

    let score = 0;
    if (props.baseForm.destination) score += 10;
    if (props.baseForm.days) score += 10;
    if (props.baseForm.dateRange && props.baseForm.dateRange.length === 2) score += 10;
    if (props.baseForm.budget) score += 10;

    if (currentUserPreferences.value && selectedPreferenceTags.value.length > 0) score += 10;
    if (currentUserPreferences.value && currentUserPreferences.value.travelPace) score += 5;
    if (currentUserPreferences.value && currentUserPreferences.value.foodTastes && currentUserPreferences.value.foodTastes.length > 0) score += 5;

    if (props.preferenceForm.tripGoals && props.preferenceForm.tripGoals.length > 0) score += 6;
    if (props.preferenceForm.pacePreference) score += 6;
    if (props.preferenceForm.socialPreference) score += 4;
    if (props.preferenceForm.photoPreference) score += 4;
    if (props.preferenceForm.focusAreas && props.preferenceForm.focusAreas.length > 0) score += 10;

    if (props.selectedAttractions.length > 0) score += 5;
    if (props.selectedRestaurants.length > 0) score += 5;

    return score;
  };

  const getPromptCompletionClass = () => {
    const score = getPromptCompletionScore();
    if (score >= 80) return "success";
    if (score >= 50) return "warning";
    return "danger";
  };

  const getPromptCompletionText = () => {
    const score = getPromptCompletionScore();
    if (score >= 80) return "信息完整度高";
    if (score >= 50) return "信息完整度中等";
    return "信息完整度较低";
  };

  // Generate Prompt Text
  const generatePromptText = () => {
    if (!props || !props.baseForm || !props.preferenceForm) return "";

    const context = {
      destination: props.baseForm.destination,
      destinationName: props.baseForm.destinationName || getSelectedCityName(),
      days: props.baseForm.days,
      travelers: props.baseForm.travelers,
      dateRange: props.baseForm.dateRange,
      startDate: props.baseForm.dateRange?.[0],
      budget: props.baseForm.budget,
      tripPurpose: props.preferenceForm.tripGoals?.[0], 
      focusAreas: props.preferenceForm.focusAreas,
      pacePreference: props.preferenceForm.pacePreference,
      socialPreference: props.preferenceForm.socialPreference,
      photoPreference: props.preferenceForm.photoPreference,
      dietaryRestrictions: props.preferenceForm.dietaryRestrictions,
      customDietaryNotes: props.preferenceForm.customDietaryNotes,
      extraRequirements: props.extraRequirements || props.preferenceForm.specialRequirements,
      weatherSuggestion: props.weatherSuggestion,
      selectedAttractions: props.selectedAttractions,
      selectedRestaurants: props.selectedRestaurants,
      selectedHotels: props.selectedHotels,
      generationStyle: selectedGenerationStyle.value
    };

    return generateCompletePrompt(currentUserPreferences.value, context);
  };

  const showFullPrompt = () => {
    fullPromptText.value = generatePromptText();
    fullPromptVisible.value = true;
    ElMessage({
      message: "完整提示词已准备就绪",
      type: "success",
      duration: 3000,
    });
  };

  const copyPromptToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullPromptText.value);
      ElMessage.success("复制成功");
    } catch (error) {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = fullPromptText.value;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        ElMessage.success("复制成功");
      } catch (err) {
        ElMessage.error("复制失败，请手动复制");
      }
      document.body.removeChild(textArea);
    }
  };

  const copyPromptAndClose = async () => {
    await copyPromptToClipboard();
    fullPromptVisible.value = false;
  };

  // Validate Trip Data
  const validateTripData = () => {
    if (!props || !props.baseForm || !props.preferenceForm) {
      return { isValid: false, errors: [], warnings: [] };
    }
    return validateTripGenerationRules(
      props.baseForm, 
      props.preferenceForm, 
      currentUserPreferences.value,
      selectedPreferenceTags.value
    );
  };

  const canGenerateTrip = computed(() => {
    if (!props || !props.baseForm) return false;
    const basicInfoValid = props.baseForm.destination && props.baseForm.days && props.baseForm.travelers;
    if (!basicInfoValid) return false;
    const validation = validateTripData();
    return validation.isValid;
  });

  return {
    selectedGenerationStyle,
    fullPromptVisible,
    fullPromptText,
    currentUserPreferences,
    selectedPreferenceTags,
    hasUserPreferences,
    getSelectedCityName,
    formatDateRange,
    getBudgetText,
    getTripGoalsText,
    getPacePreferenceText,
    getSocialPreferenceText,
    getPhotoPreferenceText,
    getFocusAreasText,
    getDietaryRestrictionsText,
    getPromptCompletionScore,
    getPromptCompletionClass,
    getPromptCompletionText,
    generatePromptText,
    showFullPrompt,
    copyPromptToClipboard,
    copyPromptAndClose,
    validateTripData,
    canGenerateTrip
  };
}

