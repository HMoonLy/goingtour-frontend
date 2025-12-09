<template>
  <el-card class="feedback-card" shadow="hover">
    <template #header>
      <div class="card-title">
        <el-icon color="#67c23a">
          <ChatDotSquare />
        </el-icon>
        <span>反馈与评价</span>
      </div>
    </template>

    <div class="feedback-content">
      <div class="rating-section">
        <span class="rating-label">总体满意度</span>
        <el-rate
          :model-value="userRating"
          @update:model-value="$emit('update:userRating', $event)"
          :colors="['#F7BA2A', '#F7BA2A', '#F7BA2A']"
          show-text
          :texts="['非常不好', '不好', '一般', '好', '非常好']"
          @change="$emit('submitRating')"
        />
      </div>

      <el-input
        :model-value="userFeedback"
        @update:model-value="$emit('update:userFeedback', $event)"
        type="textarea"
        :rows="3"
        placeholder="请分享您的看法和建议..."
        maxlength="200"
        show-word-limit
        class="feedback-input"
      />

      <div class="feedback-actions">
        <el-button
          size="small"
          :disabled="!userFeedback.trim()"
          @click="$emit('submitFeedback')"
        >
          提交反馈
        </el-button>
        <el-button size="small" link @click="$emit('clearFeedback')"> 重置 </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ChatDotSquare } from "@element-plus/icons-vue";

defineProps({
  userRating: {
    type: Number,
    default: 0
  },
  userFeedback: {
    type: String,
    default: ""
  }
});

defineEmits([
  'update:userRating', 
  'update:userFeedback', 
  'submitRating', 
  'submitFeedback', 
  'clearFeedback'
]);
</script>

<style scoped>
.feedback-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background: white;
}

.feedback-card :deep(.el-card__body) {
  padding: 24px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  color: #2d3748;
  margin-bottom: 20px;
}

.feedback-content > * + * {
  margin-top: 20px;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.rating-label {
  font-size: 14px;
  color: #2d3748;
  font-weight: 500;
}

.feedback-input {
  margin: 16px 0;
}

.feedback-input :deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  font-size: 14px;
  line-height: 1.6;
}

.feedback-input :deep(.el-textarea__inner):focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.feedback-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.feedback-actions :deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .rating-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>

