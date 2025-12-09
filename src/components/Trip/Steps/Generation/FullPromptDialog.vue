<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :title="'完整提示词预览'"
    width="80%"
    max-width="800px"
    :show-close="true"
    destroy-on-close
  >
    <div class="full-prompt-content">
      <div class="prompt-stats">
        <el-tag :type="completionClass" size="large">
          {{ completionText }} ({{ completionScore }}/100)
        </el-tag>
        <el-button type="primary" @click="$emit('copy')">
          <el-icon><DocumentCopy /></el-icon>
          复制提示词
        </el-button>
      </div>
      <div class="prompt-text-area">
        <pre>{{ promptText }}</pre>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:visible', false)">
          关闭
        </el-button>
        <el-button type="primary" @click="$emit('copy-close')">
          复制并关闭
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { DocumentCopy } from "@element-plus/icons-vue";

export default {
  name: "FullPromptDialog",
  components: { DocumentCopy },
  props: {
    visible: Boolean,
    promptText: String,
    completionScore: Number,
    completionClass: String,
    completionText: String
  },
  emits: ["update:visible", "copy", "copy-close"]
};
</script>

<style scoped>
.full-prompt-content {
  min-height: 400px;
}

.prompt-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.prompt-text-area {
  background: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.prompt-text-area pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
    Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #2c3e50;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .prompt-stats {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .prompt-text-area {
    max-height: 300px;
    padding: 12px;
  }

  .prompt-text-area pre {
    font-size: 13px;
  }
}
</style>

