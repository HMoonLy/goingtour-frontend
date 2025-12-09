<template>
  <div class="ai-loading-overlay">
    <div class="loading-content">
      <div class="loading-spinner">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
      </div>
      <h3 class="loading-title">🤖 AI正在为您生成专属推荐</h3>
      <p class="loading-desc">根据您的偏好分析最适合的景点、餐厅和行程安排</p>
      <div class="loading-progress">
        <div class="progress-steps">
          <div class="step active">
            <div class="step-icon">✓</div>
            <span>分析您的偏好</span>
          </div>
          <div class="step active">
            <div class="step-icon">🔍</div>
            <span>搜索匹配景点</span>
          </div>
          <div class="step active">
            <div class="step-icon">⚡</div>
            <span>智能推荐生成中...</span>
          </div>
        </div>
      </div>
      <div class="loading-tips">
        <p>💡 推荐生成通常需要1-3分钟，请耐心等待</p>
      </div>
      <div class="loading-actions">
        <el-button type="primary" plain @click="$emit('cancel')">
          使用高德地图推荐
        </el-button>
        <div class="cancel-hint">
          <span>不等AI了？我们为您提供基于高德地图的热门推荐</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Loading } from "@element-plus/icons-vue";

export default {
  name: "AiLoadingOverlay",
  components: {
    Loading,
  },
  emits: ["cancel"],
};
</script>

<style scoped>
/* AI推荐加载遮罩样式 */
.ai-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.loading-content {
  background: white;
  border-radius: 24px;
  padding: 48px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.loading-content::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, transparent, #91a8d0, transparent);
  animation: loading-bar 2s infinite;
}

@keyframes loading-bar {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.loading-spinner {
  margin-bottom: 24px;
}

.loading-spinner .el-icon {
  font-size: 48px;
  color: #91a8d0;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-title {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #91a8d0, #f7cac9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.loading-desc {
  font-size: 16px;
  color: #606266;
  margin: 0 0 32px 0;
  line-height: 1.5;
}

.loading-progress {
  margin-bottom: 32px;
}

.progress-steps {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 16px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  opacity: 0.3;
  transition: all 0.5s ease;
}

.step.active {
  opacity: 1;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #91a8d0, #f7cac9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(145, 168, 208, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(145, 168, 208, 0);
  }
}

.step span {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  text-align: center;
}

.step.active span {
  color: #303133;
  font-weight: 600;
}

.loading-tips {
  background: linear-gradient(135deg, #f0f9eb 0%, #f7fdf2 100%);
  border: 1px solid #d9f7be;
  border-radius: 12px;
  padding: 16px 20px;
  color: #52c41a;
  font-size: 14px;
}

.loading-tips p {
  margin: 0;
  line-height: 1.4;
}

.loading-actions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-actions .el-button {
  padding: 12px 24px;
  font-size: 14px;
  border-radius: 8px;
  transition: all 0.3s ease;
  min-width: 180px;
}

.loading-actions .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cancel-hint {
  text-align: center;
  max-width: 280px;
}

.cancel-hint span {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .loading-content {
    padding: 32px 24px;
    max-width: 90%;
  }

  .loading-title {
    font-size: 20px;
  }

  .loading-desc {
    font-size: 14px;
  }

  .progress-steps {
    flex-direction: column;
    gap: 12px;
  }

  .step {
    flex-direction: row;
    justify-content: flex-start;
    text-align: left;
    width: 100%;
  }

  .step-icon {
    width: 32px;
    height: 32px;
    font-size: 14px;
    flex-shrink: 0;
  }

  .step span {
    font-size: 13px;
    margin-left: 12px;
  }
}
</style>

