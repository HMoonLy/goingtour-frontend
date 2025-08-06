<template>
  <div class="loading-spinner" :class="{ 'fullscreen': fullscreen }">
    <div class="spinner-container">
      <!-- 主要加载动画 -->
      <div class="spinner" :class="size">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      
      <!-- 加载文本 -->
      <div v-if="text" class="loading-text" :class="textSize">
        {{ text }}
      </div>
      
      <!-- 进度指示器 -->
      <div v-if="showProgress && progress >= 0" class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }"
          ></div>
        </div>
        <div class="progress-text">{{ Math.round(progress) }}%</div>
      </div>
    </div>
    
    <!-- 背景遮罩 -->
    <div v-if="overlay" class="loading-overlay"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // 加载文本
  text: {
    type: String,
    default: '加载中...'
  },
  // 尺寸：small, medium, large
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  // 是否全屏显示
  fullscreen: {
    type: Boolean,
    default: false
  },
  // 是否显示遮罩
  overlay: {
    type: Boolean,
    default: false
  },
  // 是否显示进度
  showProgress: {
    type: Boolean,
    default: false
  },
  // 进度值 0-100
  progress: {
    type: Number,
    default: -1
  },
  // 主题色
  color: {
    type: String,
    default: '#409EFF'
  }
});

// 文本大小
const textSize = computed(() => {
  const sizeMap = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };
  return sizeMap[props.size] || 'text-base';
});
</script>

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.loading-spinner.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(2px);
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  z-index: 1;
}

/* 加载动画 */
.spinner {
  position: relative;
  display: inline-block;
}

.spinner.small {
  width: 32px;
  height: 32px;
}

.spinner.medium {
  width: 48px;
  height: 48px;
}

.spinner.large {
  width: 64px;
  height: 64px;
}

.spinner-ring {
  position: absolute;
  border: 3px solid transparent;
  border-top: 3px solid v-bind(color);
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner.small .spinner-ring {
  width: 32px;
  height: 32px;
}

.spinner.medium .spinner-ring {
  width: 48px;
  height: 48px;
}

.spinner.large .spinner-ring {
  width: 64px;
  height: 64px;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
  border-top-color: rgba(64, 158, 255, 0.6);
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
  border-top-color: rgba(64, 158, 255, 0.4);
}

.spinner-ring:nth-child(4) {
  border-top-color: rgba(64, 158, 255, 0.2);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 加载文本 */
.loading-text {
  color: #606266;
  font-weight: 500;
  text-align: center;
  user-select: none;
}

.text-sm {
  font-size: 12px;
}

.text-base {
  font-size: 14px;
}

.text-lg {
  font-size: 16px;
}

/* 进度条 */
.progress-container {
  width: 200px;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, v-bind(color), lighten(v-bind(color), 20%));
  border-radius: 2px;
  transition: width 0.3s ease;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
}

.progress-text {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

/* 遮罩层 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .spinner-container {
    gap: 12px;
  }
  
  .progress-container {
    width: 150px;
  }
  
  .loading-text {
    font-size: 12px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .loading-spinner.fullscreen {
    background: rgba(0, 0, 0, 0.9);
  }
  
  .loading-text {
    color: #e4e7ed;
  }
  
  .progress-bar {
    background: #2d2d2d;
  }
  
  .progress-text {
    color: #909399;
  }
}
</style>