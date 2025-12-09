<template>
  <el-card class="actions-card" shadow="never">
    <div class="action-buttons">
      <el-button :loading="copying" @click="$emit('copy')">
        <el-icon><DocumentCopy /></el-icon>
        复制内容
      </el-button>
      <el-button type="primary" :loading="saving" @click="$emit('save')">
        <el-icon><Folder /></el-icon>
        保存行程
      </el-button>
      <el-button type="success" :loading="sharing" @click="$emit('share')">
        <el-icon><Share /></el-icon>
        分享
      </el-button>
      <el-button type="warning" @click="$emit('regenerate')">
        <el-icon><Refresh /></el-icon>
        重新生成
      </el-button>
    </div>
  </el-card>
</template>

<script setup>
import { DocumentCopy, Folder, Share, Refresh } from "@element-plus/icons-vue";

defineProps({
  copying: Boolean,
  saving: Boolean,
  sharing: Boolean
});

defineEmits(['copy', 'save', 'share', 'regenerate']);
</script>

<style scoped>
.actions-card {
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.actions-card :deep(.el-card__body) {
  padding: 24px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.action-buttons :deep(.el-button) {
  min-width: 120px;
  height: 40px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
}

.action-buttons :deep(.el-button):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
}
</style>

