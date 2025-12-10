<template>
  <div class="step-actions">
    <div class="action-left">
      <el-button
        size="large"
        type="info"
        plain
        :disabled="generating"
        @click="$emit('save-draft')"
      >
        <el-icon><Document /></el-icon>
        保存草稿
      </el-button>

      <el-button 
        type="success" 
        size="large" 
        :disabled="generating"
        @click="$emit('show-full-prompt')"
      >
        <el-icon><ViewIcon /></el-icon>
        查看完整提示词
      </el-button>
    </div>
    <div class="action-right">
      <div class="navigation-buttons">
        <el-button 
          size="large" 
          :disabled="generating"
          @click="$emit('prev-step')"
        >
          <el-icon><ArrowLeft /></el-icon>
          上一步
        </el-button>

        <el-button
          v-if="!generating && !generatedTrip"
          type="primary"
          size="large"
          :disabled="!canGenerateTrip"
          @click="$emit('generate-trip')"
        >
          <el-icon><MagicStick /></el-icon>
          生成行程
        </el-button>

        <!-- 生成中的状态按钮 -->
        <el-button
          v-else-if="generating"
          type="danger"
          size="large"
          @click="$emit('cancel-generation')"
        >
          <el-icon><Close /></el-icon>
          取消生成
        </el-button>

        <!-- 生成完成后的下一步按钮 -->
        <el-button
          v-else-if="generatedTrip && !generating"
          type="primary"
          size="large"
          @click="$emit('next-step')"
        >
          查看详细行程
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { Document, View as ViewIcon, ArrowLeft, MagicStick, Close, ArrowRight } from "@element-plus/icons-vue";

export default {
  name: "GenerationActions",
  components: { Document, ViewIcon, ArrowLeft, MagicStick, Close, ArrowRight },
  props: {
    generating: Boolean,
    generatedTrip: Object,
    canGenerateTrip: Boolean
  },
  emits: ["save-draft", "show-full-prompt", "prev-step", "generate-trip", "cancel-generation", "next-step"]
};
</script>

<style scoped>
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
}

.action-left,
.action-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.navigation-buttons {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* 统一按钮样式 (可选，如果全局已有则可简化) */
/* .step-actions .el-button { ... } */

@media (max-width: 768px) {
  .step-actions {
    flex-direction: column-reverse; /* Put primary actions at bottom on mobile usually, or keep column */
    gap: 16px;
    padding-top: 20px;
    align-items: stretch;
  }

  .action-left,
  .action-right {
    width: 100%;
    flex-direction: column;
    gap: 12px;
  }
  
  .navigation-buttons {
    width: 100%;
    flex-direction: column;
    gap: 12px;
  }

  .step-actions .el-button {
    width: 100%;
  }
}
</style>

