<template>
  <div class="ai-trip-display">
    <!-- 行程标题卡片 -->
    <AiTripHeader :trip-data="tripData" />

    <!-- 完整的行程内容 -->
    <el-card class="content-card" shadow="hover">
      <TripMarkdownRenderer :content="tripData?.content" />
    </el-card>

    <!-- 操作按钮区域 -->
    <AiTripActions
      :copying="copying"
      :saving="saving"
      :sharing="sharing"
      @copy="copyToClipboard"
      @save="saveTrip"
      @share="shareTrip"
      @regenerate="regenerateTrip"
    />

    <!-- 用户反馈区域 -->
    <AiTripFeedback
      v-model:userRating="userRating"
      v-model:userFeedback="userFeedback"
      @submitRating="submitRating"
      @submitFeedback="submitFeedback"
      @clearFeedback="clearFeedback"
    />
  </div>
</template>

<script setup>
import TripMarkdownRenderer from "./TripMarkdownRenderer.vue";
import AiTripHeader from "./AiTripDisplayParts/AiTripHeader.vue";
import AiTripActions from "./AiTripDisplayParts/AiTripActions.vue";
import AiTripFeedback from "./AiTripDisplayParts/AiTripFeedback.vue";
import { useAiTripDisplay } from "@/composables/trip/useAiTripDisplay.js";

const props = defineProps({
  tripData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["save", "share", "regenerate"]);

// 使用新的 composable 接管逻辑
const {
  copying,
  saving,
  sharing,
  userRating,
  userFeedback,
  copyToClipboard,
  saveTrip,
  shareTrip,
  regenerateTrip,
  submitRating,
  submitFeedback,
  clearFeedback,
} = useAiTripDisplay(props, emit);
</script>

<style scoped>
.ai-trip-display {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

/* 内容卡片 */
.content-card {
  margin-bottom: 24px;
  overflow: hidden;
}

.content-card :deep(.el-card__body) {
  padding: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-trip-display {
    padding: 16px;
    background: #f8fafc;
  }

  .content-card :deep(.el-card__body) {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .ai-trip-display {
    padding: 12px;
  }
}
</style>
