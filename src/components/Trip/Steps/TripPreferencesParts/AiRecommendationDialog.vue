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
          <div class="option-card ai-option" @click="$emit('confirm-ai')">
            <div class="card-header">
              <el-icon class="card-icon"><MagicStick /></el-icon>
              <h4>AI智能推荐</h4>
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

          <div class="option-card basic-option" @click="$emit('confirm-basic')">
            <div class="card-header">
              <el-icon class="card-icon"><MapLocation /></el-icon>
              <h4>基础推荐</h4>
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
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* 覆盖Element Plus默认样式 */
:deep(.el-overlay .el-dialog.ai-recommendation-dialog .el-dialog__header),
:deep(.ai-recommendation-dialog.el-dialog .el-dialog__header),
:deep(.ai-recommendation-dialog .el-dialog__header) {
  padding: 0 !important;
  margin: 0 !important;
  display: none !important; /* 完全隐藏默认header */
}

:deep(.ai-recommendation-dialog .el-dialog__body) {
  padding: 0;
}

.dialog-content {
  padding: 32px;
  background-color: #ffffff;
}

.dialog-header {
  text-align: center;
  margin-bottom: 20px;
}

.dialog-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

.dialog-body {
  padding: 0;
}

.dialog-description {
  text-align: center;
  color: #606266;
  margin: 0 0 32px 0;
  font-size: 15px;
  line-height: 1.6;
  opacity: 0.8;
}

.option-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.option-card {
  border: 1px solid #ebeef5;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.option-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
  border-color: transparent;
}

/* AI 选项样式 */
.ai-option {
  background: linear-gradient(145deg, #f0f7ff 0%, #ffffff 100%);
  border-color: #e1effe;
}

.ai-option:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 12px 28px rgba(64, 158, 255, 0.15);
}

/* 基础选项样式 */
.basic-option {
  background: linear-gradient(145deg, #f9fafb 0%, #ffffff 100%);
  border-color: #f0f2f5;
}

.basic-option:hover {
  border-color: #dcdfe6;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.card-icon {
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-option .card-icon {
  color: var(--el-color-primary);
}

.basic-option .card-icon {
  color: #909399;
}

.card-header h4 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #303133;
}

.card-content {
  flex: 1;
}

.card-content ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.card-content li {
  padding: 8px 0;
  font-size: 13px;
  color: #555;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
}

/* 列表项前的emoji微调 */
.card-content li::first-letter {
  margin-right: 0px; /* emoji本身自带间距，这里如果不带emoji可以加icon */
}

.dialog-actions {
  display: flex;
  gap: 16px;
  padding: 0;
}

.dialog-actions .el-button {
  flex: 1;
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  transition: all 0.3s ease;
}

.dialog-actions .el-button--default {
  background-color: #f5f7fa;
  color: #606266;
}

.dialog-actions .el-button--default:hover {
  background-color: #e4e7ed;
  color: #303133;
  transform: translateY(-2px);
}

.dialog-actions .el-button--primary {
  background: linear-gradient(90deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.dialog-actions .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
  filter: brightness(1.05);
}

/* 响应式适配 */
@media (max-width: 768px) {
  :deep(.ai-recommendation-dialog) {
    width: 92% !important;
  }
  
  .dialog-content {
    padding: 24px;
  }

  .option-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .dialog-actions {
    flex-direction: column-reverse; /* 手机端把主要按钮放上面 */
  }
  
  .dialog-actions .el-button {
    width: 100%;
    margin: 0 !important;
  }
}
</style>
