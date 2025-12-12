<template>
  <div v-if="visible" class="ai-tip-bubble">
    <div class="tip-content">
      <el-icon class="icon"><MagicStick /></el-icon>
      <span class="text">{{ tipText }}</span>
    </div>
    <div class="close-btn" @click.stop="$emit('close')">
      <el-icon><Close /></el-icon>
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
.ai-tip-bubble {
  position: fixed;
  top: 150px;
  right: 20px;
  width: 260px;
  /* 保持渐变风格但更紧凑 */
  background: linear-gradient(135deg, rgba(145, 168, 208, 0.95) 0%, rgba(247, 202, 201, 0.95) 100%);
  backdrop-filter: blur(4px);
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  color: white;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  animation: slideInRight 0.3s ease-out;
  transition: all 0.3s;
}

.ai-tip-bubble:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.16);
}

.tip-content {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.icon {
  font-size: 16px;
  margin-top: 3px; /* 微调图标对齐 */
  opacity: 0.95;
}

.text {
  font-size: 13px;
  line-height: 1.5;
  text-align: justify;
  font-weight: 500;
}

.close-btn {
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
  display: flex;
  margin-top: 2px;
}

.close-btn:hover {
  opacity: 1;
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

@media (max-width: 768px) {
  .ai-tip-bubble {
    top: 80px;
    right: 16px;
    width: auto;
    max-width: 280px;
  }
}
</style>
