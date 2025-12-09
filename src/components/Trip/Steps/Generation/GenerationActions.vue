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
  background: white;
  border-radius: 20px;
  padding: 32px;
  margin: 32px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8eaed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.step-actions:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.action-left,
.action-right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

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

@media (max-width: 768px) {
  .step-actions {
    padding: 24px 20px;
    flex-direction: column;
    gap: 16px;
  }

  .action-left,
  .action-right {
    width: 100%;
    justify-content: center;
  }

  .step-actions .el-button {
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
  }
}
</style>

