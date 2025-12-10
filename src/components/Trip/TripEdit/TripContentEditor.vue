<template>
  <div class="content-card-custom">
    <!-- 编辑模式选择（仅在非只读模式显示） -->
    <div v-if="!isReadOnly" class="editor-tabs">
      <el-radio-group v-model="localEditMode" class="edit-mode-selector">
        <el-radio-button value="preview"> 预览模式 </el-radio-button>
        <el-radio-button value="markdown"> Markdown编辑 </el-radio-button>
      </el-radio-group>
    </div>

    <!-- Markdown编辑器 -->
    <div
      v-if="!isReadOnly && localEditMode === 'markdown'"
      class="editor-container"
    >
      <el-input
        v-model="localContent"
        type="textarea"
        :rows="25"
        placeholder="请输入行程内容..."
        class="content-textarea"
      />
    </div>

    <!-- 预览模式 - 使用与AiTripDisplay相同的样式 -->
    <TripMarkdownRenderer
      v-else
      :content="localContent || tripData.aiContent"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import TripMarkdownRenderer from "@/components/Trip/Steps/TripMarkdownRenderer.vue";

const props = defineProps({
  isReadOnly: Boolean,
  editMode: {
    type: String,
    default: "preview",
  },
  content: {
    type: String,
    default: "",
  },
  tripData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:editMode", "update:content"]);

const localEditMode = computed({
  get: () => props.editMode,
  set: (val) => emit("update:editMode", val),
});

const localContent = computed({
  get: () => props.content,
  set: (val) => emit("update:content", val),
});
</script>

<style scoped>
.content-card-custom {
  margin: 0 auto 24px auto !important;
  border-radius: 12px !important;
  overflow: visible !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06) !important;
  background: white !important;
  padding: 24px !important;
  min-height: auto !important;
  width: 100% !important;
  max-width: 1200px !important;
}

.editor-tabs {
  margin-bottom: 20px;
  text-align: center;
}

.edit-mode-selector {
  background: #f8fafc;
  border-radius: 8px;
  padding: 4px;
  border: 1px solid #e2e8f0;
}

.edit-mode-selector :deep(.el-radio-button__inner) {
  border: none;
  background: transparent;
  color: #718096;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.edit-mode-selector
  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #91a8d0;
  color: white;
  box-shadow: 0 2px 4px rgba(145, 168, 208, 0.3);
}

.content-textarea {
  width: 100%;
}

.content-textarea :deep(.el-textarea__inner) {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  resize: vertical;
}

.content-textarea :deep(.el-textarea__inner):focus {
  border-color: #91a8d0;
  box-shadow: 0 0 0 3px rgba(145, 168, 208, 0.1);
}

@media (max-width: 768px) {
  .content-card-custom {
    margin: 0 auto 16px auto !important;
    padding: 16px !important;
  }
  .editor-tabs {
    margin-bottom: 16px !important;
  }
}
</style>

