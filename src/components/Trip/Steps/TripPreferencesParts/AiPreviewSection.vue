<template>
  <div v-if="hasValidPreferences" class="ai-preview">
    <div class="preview-header">
      <h4>🤖 AI将如何为您规划行程</h4>
    </div>
    <div class="preview-content">
      <div class="preview-text">
        {{ previewText }}
      </div>
      <el-button link @click="showDetailedAI = !showDetailedAI">
        {{ showDetailedAI ? "收起" : "查看详细" }}AI解读
      </el-button>

      <div v-if="showDetailedAI" class="detailed-ai-preview">
        <pre>{{ detailedPreview }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import {
  TripPreferencesInterpreter,
  CompletePromptGenerator,
} from "@/utils/data/aiPromptEngine.js";

export default {
  name: "AiPreviewSection",
  props: {
    preferences: {
      type: Object,
      required: true,
    },
    personalProfile: {
      type: Object,
      default: () => ({}),
    },
    tripContext: {
      type: Object,
      default: () => ({}),
    },
    hasValidPreferences: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const showDetailedAI = ref(false);

    const getCurrentPreferences = () => ({
      tripGoals: props.preferences.tripPurpose ? [props.preferences.tripPurpose] : [],
      focusAreas: [...props.preferences.focusAreas],
      pacePreference: props.preferences.pacePreference,
      socialPreference: props.preferences.socialPreference,
      photoPreference: props.preferences.photoPreference,
      specialRequirements: props.preferences.specialRequirements,
      dietaryRestrictions: [...props.preferences.dietaryRestrictions],
      customDietaryNotes: props.preferences.customDietaryNotes,
      temporaryNeeds: [...props.preferences.temporaryNeeds],
    });

    const previewText = computed(() => {
      const currentPreferences = getCurrentPreferences();
      const interpreter = new TripPreferencesInterpreter(currentPreferences);
      const preview = interpreter.generateCompletePreferences();
      const lines = preview.split("\n\n").slice(0, 2);
      return lines.join(" ");
    });

    const detailedPreview = computed(() => {
      const hasPersonalProfile = Object.keys(props.personalProfile).length > 0;
      if (!hasPersonalProfile) return "需要设置个人档案才能生成详细AI解读";

      const currentPreferences = getCurrentPreferences();
      const generator = new CompletePromptGenerator(
        props.personalProfile,
        currentPreferences,
        props.tripContext
      );
      return generator.generateCompletePrompt();
    });

    return {
      showDetailedAI,
      previewText,
      detailedPreview,
    };
  },
};
</script>

<style scoped>
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
</style>

