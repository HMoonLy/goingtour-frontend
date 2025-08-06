<template>
  <transition
    :name="transitionName"
    :mode="mode"
    :appear="appear"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @after-leave="onAfterLeave"
  >
    <slot />
  </transition>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // 过渡类型
  type: {
    type: String,
    default: 'fade',
    validator: (value) => [
      'fade', 'slide-left', 'slide-right', 'slide-up', 'slide-down',
      'zoom', 'flip', 'bounce', 'elastic'
    ].includes(value)
  },
  // 过渡模式
  mode: {
    type: String,
    default: 'out-in',
    validator: (value) => ['in-out', 'out-in', ''].includes(value)
  },
  // 是否在初始渲染时应用过渡
  appear: {
    type: Boolean,
    default: false
  },
  // 过渡持续时间（毫秒）
  duration: {
    type: Number,
    default: 300
  },
  // 延迟时间（毫秒）
  delay: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits([
  'before-enter',
  'enter',
  'after-enter',
  'before-leave',
  'leave',
  'after-leave'
]);

// 计算过渡名称
const transitionName = computed(() => {
  return `page-transition-${props.type}`;
});

// 过渡事件处理
const onBeforeEnter = (el) => {
  emit('before-enter', el);
};

const onEnter = (el, done) => {
  emit('enter', el, done);
  if (props.delay > 0) {
    setTimeout(done, props.duration + props.delay);
  } else {
    setTimeout(done, props.duration);
  }
};

const onAfterEnter = (el) => {
  emit('after-enter', el);
};

const onBeforeLeave = (el) => {
  emit('before-leave', el);
};

const onLeave = (el, done) => {
  emit('leave', el, done);
  setTimeout(done, props.duration);
};

const onAfterLeave = (el) => {
  emit('after-leave', el);
};
</script>

<style scoped>
/* 淡入淡出 */
.page-transition-fade-enter-active,
.page-transition-fade-leave-active {
  transition: opacity v-bind(duration + 'ms') ease;
}

.page-transition-fade-enter-from,
.page-transition-fade-leave-to {
  opacity: 0;
}

/* 左滑 */
.page-transition-slide-left-enter-active,
.page-transition-slide-left-leave-active {
  transition: all v-bind(duration + 'ms') cubic-bezier(0.25, 0.8, 0.25, 1);
}

.page-transition-slide-left-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.page-transition-slide-left-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* 右滑 */
.page-transition-slide-right-enter-active,
.page-transition-slide-right-leave-active {
  transition: all v-bind(duration + 'ms') cubic-bezier(0.25, 0.8, 0.25, 1);
}

.page-transition-slide-right-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.page-transition-slide-right-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* 上滑 */
.page-transition-slide-up-enter-active,
.page-transition-slide-up-leave-active {
  transition: all v-bind(duration + 'ms') cubic-bezier(0.25, 0.8, 0.25, 1);
}

.page-transition-slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.page-transition-slide-up-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

/* 下滑 */
.page-transition-slide-down-enter-active,
.page-transition-slide-down-leave-active {
  transition: all v-bind(duration + 'ms') cubic-bezier(0.25, 0.8, 0.25, 1);
}

.page-transition-slide-down-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.page-transition-slide-down-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* 缩放 */
.page-transition-zoom-enter-active,
.page-transition-zoom-leave-active {
  transition: all v-bind(duration + 'ms') cubic-bezier(0.25, 0.8, 0.25, 1);
}

.page-transition-zoom-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.page-transition-zoom-leave-to {
  opacity: 0;
  transform: scale(1.2);
}

/* 翻转 */
.page-transition-flip-enter-active,
.page-transition-flip-leave-active {
  transition: all v-bind(duration + 'ms') ease;
}

.page-transition-flip-enter-from {
  opacity: 0;
  transform: rotateY(-90deg);
}

.page-transition-flip-leave-to {
  opacity: 0;
  transform: rotateY(90deg);
}

/* 弹跳 */
.page-transition-bounce-enter-active {
  animation: bounce-in v-bind(duration + 'ms') ease;
}

.page-transition-bounce-leave-active {
  animation: bounce-out v-bind(duration + 'ms') ease;
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounce-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  30% {
    transform: scale(1.1);
  }
  100% {
    opacity: 0;
    transform: scale(0.3);
  }
}

/* 弹性 */
.page-transition-elastic-enter-active {
  animation: elastic-in v-bind(duration + 'ms') ease;
}

.page-transition-elastic-leave-active {
  animation: elastic-out v-bind(duration + 'ms') ease;
}

@keyframes elastic-in {
  0% {
    opacity: 0;
    transform: scale(0) rotate(360deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) rotate(180deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes elastic-out {
  0% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) rotate(-180deg);
  }
  100% {
    opacity: 0;
    transform: scale(0) rotate(-360deg);
  }
}

/* 减少动画在移动端的性能消耗 */
@media (max-width: 768px) {
  .page-transition-flip-enter-active,
  .page-transition-flip-leave-active,
  .page-transition-elastic-enter-active,
  .page-transition-elastic-leave-active {
    transition: opacity v-bind(duration + 'ms') ease;
    animation: none;
  }
  
  .page-transition-flip-enter-from,
  .page-transition-flip-leave-to,
  .page-transition-elastic-enter-from,
  .page-transition-elastic-leave-to {
    opacity: 0;
    transform: none;
  }
}

/* 尊重用户的减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .page-transition-fade-enter-active,
  .page-transition-fade-leave-active,
  .page-transition-slide-left-enter-active,
  .page-transition-slide-left-leave-active,
  .page-transition-slide-right-enter-active,
  .page-transition-slide-right-leave-active,
  .page-transition-slide-up-enter-active,
  .page-transition-slide-up-leave-active,
  .page-transition-slide-down-enter-active,
  .page-transition-slide-down-leave-active,
  .page-transition-zoom-enter-active,
  .page-transition-zoom-leave-active,
  .page-transition-flip-enter-active,
  .page-transition-flip-leave-active {
    transition: opacity 150ms ease;
    animation: none;
  }
  
  .page-transition-bounce-enter-active,
  .page-transition-bounce-leave-active,
  .page-transition-elastic-enter-active,
  .page-transition-elastic-leave-active {
    transition: opacity 150ms ease;
    animation: none;
  }
  
  .page-transition-slide-left-enter-from,
  .page-transition-slide-left-leave-to,
  .page-transition-slide-right-enter-from,
  .page-transition-slide-right-leave-to,
  .page-transition-slide-up-enter-from,
  .page-transition-slide-up-leave-to,
  .page-transition-slide-down-enter-from,
  .page-transition-slide-down-leave-to,
  .page-transition-zoom-enter-from,
  .page-transition-zoom-leave-to,
  .page-transition-flip-enter-from,
  .page-transition-flip-leave-to,
  .page-transition-bounce-enter-from,
  .page-transition-bounce-leave-to,
  .page-transition-elastic-enter-from,
  .page-transition-elastic-leave-to {
    opacity: 0;
    transform: none;
  }
}
</style>