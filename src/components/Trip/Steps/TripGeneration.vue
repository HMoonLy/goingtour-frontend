<template>
  <div class="trip-generation-container">
    <!-- 页面头部 -->
    <TripGenerationHeader />

    <!-- AI提示词预览面板 -->
    <PromptPreviewCard
      :baseForm="baseForm"
      :preferenceForm="preferenceForm"
      :currentUserPreferences="currentUserPreferences"
      :selectedPreferenceTags="selectedPreferenceTags"
      :hasUserPreferences="hasUserPreferences"
      :selectedAttractions="selectedAttractions"
      :selectedRestaurants="selectedRestaurants"
      :selectedHotels="selectedHotels"
      :weatherSuggestion="weatherSuggestion"
      :loadingWeather="loadingWeather"
      :weatherError="weatherError"
      :generating="generating"
      :generatedTrip="generatedTrip"
      :generationProgress="generationProgress"
      :progressPercent="progressPercent"
      :validationErrors="validationErrors"
      :validationWarnings="validationWarnings"
      :canGenerateTrip="canGenerateTrip"
      :promptCompletionText="getPromptCompletionText()"
      :promptCompletionClass="getPromptCompletionClass()"
      :promptCompletionScore="getPromptCompletionScore()"
      v-model:selectedGenerationStyle="selectedGenerationStyle"
      @show-full-prompt="showFullPrompt"
      @cancel-generation="cancelGeneration"
      @next-step="goToNextStep"
    />

    <!-- 操作区域 -->
    <GenerationActions
      :generating="generating"
      :generatedTrip="generatedTrip"
      :canGenerateTrip="canGenerateTrip"
      @save-draft="saveDraft"
      @show-full-prompt="showFullPrompt"
      @prev-step="goToPreviousStep"
      @generate-trip="handleGenerateTrip"
      @cancel-generation="cancelGeneration"
      @next-step="goToNextStep"
    />

    <!-- 完整提示词弹窗 -->
    <FullPromptDialog
      v-model:visible="fullPromptVisible"
      :promptText="fullPromptText"
      :completionScore="getPromptCompletionScore()"
      :completionClass="getPromptCompletionClass()"
      :completionText="getPromptCompletionText()"
      @copy="copyPromptToClipboard"
      @copy-close="copyPromptAndClose"
    />
  </div>
</template>

<script>
import { onMounted, nextTick, computed } from "vue";
import { useUserStore } from "@/store/user.js";
import { useProfile } from "@/composables/user/useProfile.js";
import { useTripGenerationLogic } from "@/composables/trip/useTripGenerationLogic.js";
import { useTripPrompt } from "@/composables/trip/useTripPrompt.js";

// Components
import TripGenerationHeader from "./Generation/TripGenerationHeader.vue";
import PromptPreviewCard from "./Generation/PromptPreviewCard.vue";
import GenerationActions from "./Generation/GenerationActions.vue";
import FullPromptDialog from "./Generation/FullPromptDialog.vue";

export default {
  name: "TripGeneration",
  components: {
    TripGenerationHeader,
    PromptPreviewCard,
    GenerationActions,
    FullPromptDialog
  },
  props: {
    baseForm: { type: Object, required: true },
    preferenceForm: { type: Object, required: true },
    userPreferences: { type: Object, default: () => ({}) },
    selectedAttractions: { type: Array, default: () => [] },
    selectedRestaurants: { type: Array, default: () => [] },
    selectedHotels: { type: Array, default: () => [] },
    extraRequirements: { type: String, default: "" },
    weatherSuggestion: { type: Object, default: null },
    loadingWeather: { type: Boolean, default: false },
    weatherError: { type: String, default: null },
    generatedTrip: { type: Object, default: null },
    generating: { type: Boolean, default: false },
    generationProgress: { type: String, default: "" },
    progressPercent: { type: Number, default: 0 },
    savingDraft: { type: Boolean, default: false },
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
    "save-draft",
  ],
  setup(props, { emit }) {
    const userStore = useUserStore();
    const { fetchUserPreferences } = useProfile();

    // Use Composables
    const {
      selectedGenerationStyle,
      fullPromptVisible,
      fullPromptText,
      currentUserPreferences,
      selectedPreferenceTags,
      hasUserPreferences,
      getPromptCompletionClass,
      getPromptCompletionText,
      getPromptCompletionScore,
      generatePromptText,
      showFullPrompt,
      copyPromptToClipboard,
      copyPromptAndClose,
      validateTripData,
      canGenerateTrip
    } = useTripPrompt(props);

    const { generateTrip, cancelGeneration } = useTripGenerationLogic(props, emit);

    // Validation State for UI
    const validationResult = computed(() => validateTripData());
    const validationErrors = computed(() => validationResult.value.errors);
    const validationWarnings = computed(() => validationResult.value.warnings);

    // Handle Generation Trigger
    const handleGenerateTrip = () => {
        const tripState = {
          ...props.baseForm,
          ...props.preferenceForm,
          dateRange: props.baseForm.dateRange,
          userPreferences: currentUserPreferences.value,
          travelTags: selectedPreferenceTags.value,
          generationStyle: selectedGenerationStyle.value,
          selectedAttractions: props.selectedAttractions,
          selectedRestaurants: props.selectedRestaurants,
          selectedHotels: props.selectedHotels,
          extraRequirements: props.extraRequirements
        };

      generateTrip({
        validation: validationResult.value,
        canGenerateTrip: canGenerateTrip.value,
        tripState,
        generatePromptText
      });
    };

    // Navigation & Actions
    const saveDraft = () => emit('save-draft');
    const goToPreviousStep = () => emit('prev-step');
    const goToNextStep = () => emit('next-step');

    // On Mount Logic
    onMounted(async () => {
      if (
        userStore.isLoggedIn &&
        (!props.userPreferences || Object.keys(props.userPreferences).length === 0)
      ) {
        try {
          await fetchUserPreferences();
          await nextTick();
        } catch (error) {
          console.error("Failed to fetch user preferences:", error);
        }
      }
    });

    return {
      // Prompt & Data
      selectedGenerationStyle,
      fullPromptVisible,
      fullPromptText,
      currentUserPreferences,
      selectedPreferenceTags,
      hasUserPreferences,
      getPromptCompletionClass,
      getPromptCompletionText,
      getPromptCompletionScore,
      showFullPrompt,
      copyPromptToClipboard,
      copyPromptAndClose,
      
      // Validation
      canGenerateTrip,
      validationErrors,
      validationWarnings,

      // Generation Logic
      handleGenerateTrip,
      cancelGeneration,

      // Actions
      saveDraft,
      goToPreviousStep,
      goToNextStep
    };
  },
};
</script>

<style scoped>
.trip-generation-container {
  width: 100%;
}

</style>
