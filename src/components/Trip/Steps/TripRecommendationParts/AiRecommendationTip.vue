<template>
  <div v-if="visible" class="ai-tip-card">
    <div class="ai-tip-content">
      <div class="ai-tip-header">
        <el-icon class="ai-icon"><MagicStick /></el-icon>
        <h4>💡 推荐建议</h4>
        <el-button 
          link 
          size="small" 
          @click="$emit('close')"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
      <div class="ai-tip-text">
        {{ tipText }}
      </div>
    </div>
  </div>
</template>

<script>
import { MagicStick, Close } from '@element-plus/icons-vue';

export default {
  name: 'AiRecommendationTip',
  components: {
    MagicStick,
    Close
  },
  props: {
    visible: {
      type: Boolean,
      default: true
    },
    tipText: {
      type: String,
      default: ''
    }
  },
  emits: ['close']
};
</script>

<style scoped>
.ai-tip-card {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 320px;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  color: white;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.ai-tip-content {
  padding: 20px;
}

.ai-tip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.ai-tip-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-icon {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
}

.ai-tip-text {
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .ai-tip-card {
    position: relative;
    width: auto;
    margin: 16px 8px;
    right: auto;
    bottom: auto;
    border-radius: 12px;
  }
}

@media (max-width: 480px) {
  .ai-tip-card {
    margin: 12px 4px;
    border-radius: 8px;
  }
}
</style>

