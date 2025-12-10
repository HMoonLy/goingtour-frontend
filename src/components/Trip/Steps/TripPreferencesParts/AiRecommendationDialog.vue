<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title=""
    width="500px"
    :append-to-body="true"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :show-close="true"
    class="ai-recommendation-dialog"
  >
    <div class="dialog-content">
      <div class="dialog-header">
        <div>
          <h3>选择推荐方式</h3>
        </div>
      </div>

      <div class="dialog-body">
        <p class="dialog-description">
          我们提供两种推荐方式，请选择您偏好的方式：
        </p>

        <div class="option-cards">
          <div class="option-card ai-option">
            <div class="card-header">
              <el-icon class="card-icon"><MagicStick /></el-icon>
              <h4>🚀 AI智能推荐</h4>
            </div>
            <div class="card-content">
              <ul>
                <li>🎯 基于设置进行个性化推荐</li>
                <li>🤖 AI分析生成专属行程建议</li>
                <li>⭐ 更精准的景点和餐厅匹配</li>
                <li>⏰ 生成时间约1-3分钟</li>
              </ul>
            </div>
          </div>

          <div class="option-card basic-option">
            <div class="card-header">
              <el-icon class="card-icon"><MapLocation /></el-icon>
              <h4>🗺️ 基础推荐</h4>
            </div>
            <div class="card-content">
              <ul>
                <li>📍 基于高德地图的热门推荐</li>
                <li>⚡ 快速获取推荐结果</li>
                <li>🏆 经典热门景点和餐厅</li>
                <li>⏱️ 立即显示结果</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="dialog-actions">
        <el-button
          size="large"
          type="default"
          @click="$emit('confirm-basic')"
        >
          <el-icon><MapLocation /></el-icon>
          使用基础推荐
        </el-button>

        <el-button
          size="large"
          type="primary"
          @click="$emit('confirm-ai')"
        >
          <el-icon><MagicStick /></el-icon>
          使用AI智能推荐
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { MagicStick, MapLocation } from "@element-plus/icons-vue";

export default {
  name: "AiRecommendationDialog",
  components: {
    MagicStick,
    MapLocation,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "confirm-ai", "confirm-basic"],
};
</script>

<style scoped>
/* AI推荐确认对话框样式 */
:deep(.ai-recommendation-dialog) {
  border-radius: 16px;
}

/* 使用最高优先级的选择器来覆盖Element Plus样式 */
:deep(.el-overlay .el-dialog.ai-recommendation-dialog .el-dialog__header),
:deep(.ai-recommendation-dialog.el-dialog .el-dialog__header),
:deep(.ai-recommendation-dialog .el-dialog__header) {
  padding: 0 !important;
  border-bottom: none !important;
  background-color: transparent !important;
  background: transparent !important;
  border: none !important;
}

/* 确保对话框头部完全没有背景和边框 */
:deep(.el-dialog.ai-recommendation-dialog .el-dialog__header::before),
:deep(.el-dialog.ai-recommendation-dialog .el-dialog__header::after) {
  display: none !important;
}

:deep(.ai-recommendation-dialog .el-dialog__body) {
  padding: 0;
}

.dialog-content {
  padding: 0;
}

.dialog-header {
  display: flex;
  background-color: #e4e7ed;
  color: #303133;
  padding: 24px;
  text-align: center;
  border-radius: 16px;
  border: none;
  box-shadow: none;
  align-items: center;
}

.dialog-header .header-icon {
  font-size: 32px;
  margin-bottom: 12px;
  margin-right: 25px;
}

.dialog-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.dialog-body {
  padding: 24px;
}

.dialog-description {
  text-align: center;
  color: #606266;
  margin: 0 0 24px 0;
  font-size: 16px;
  line-height: 1.5;
}

.option-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 24px;
}

.option-card {
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.option-card:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.ai-option {
  background: var(--el-color-primary-light-9);
}

.basic-option {
  background: #fafafa;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.card-icon {
  font-size: 20px;
  color: #91a8d0;
}

.basic-option .card-icon {
  color: #f7cac9;
}

.card-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-content ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.card-content li {
  padding: 6px 0;
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

.dialog-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 0 24px 24px 24px;
}

.dialog-actions .el-button {
  flex: 1;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  min-height: 48px;
  transition: all 0.3s ease;
}

.dialog-actions .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 响应式 - 对话框 */
@media (max-width: 768px) {
  :deep(.ai-recommendation-dialog) {
    width: 90% !important;
    margin: 0 !important;
  }

  .option-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .dialog-actions {
    flex-direction: column;
    gap: 12px;
  }

  .dialog-actions .el-button {
    min-height: 44px;
    font-size: 15px;
  }
}
</style>

