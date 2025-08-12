<template>
  <div
    ref="imageContainer"
    class="lazy-image-container"
    :class="{ 'is-loaded': isLoaded, 'is-loading': isLoading }"
    :style="containerStyle"
  >
    <!-- 占位图/骨架屏 -->
    <div
v-if="!isLoaded" class="lazy-image-placeholder"
>
      <div
v-if="showSkeleton" class="skeleton-shimmer" />
      <div
v-else class="gradient-placeholder" />
    </div>

    <!-- 实际图片 -->
    <div v-show="isLoaded"
class="lazy-image" :style="imageStyle" :title="alt">
      <!-- 插槽内容，如覆盖层等 -->
      <slot />
    </div>

    <!-- 加载失败占位 -->
    <div
v-if="hasError" class="error-placeholder"
>
      <span class="error-icon">🏞️</span>
      <span class="error-text">图片加载失败</span>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";

export default {
  name: "LazyImage",
  props: {
    src: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      default: "",
    },
    width: {
      type: [String, Number],
      default: "100%",
    },
    height: {
      type: [String, Number],
      default: "200px",
    },
    showSkeleton: {
      type: Boolean,
      default: false,
    },
    rootMargin: {
      type: String,
      default: "50px",
    },
    threshold: {
      type: Number,
      default: 0.1,
    },
  },
  setup(props) {
    const imageContainer = ref(null);
    const isLoaded = ref(false);
    const isLoading = ref(false);
    const hasError = ref(false);
    const observer = ref(null);

    // 容器样式
    const containerStyle = computed(() => ({
      width: typeof props.width === "number" ? `${props.width}px` : props.width,
      height:
        typeof props.height === "number" ? `${props.height}px` : props.height,
    }));

    // 图片样式
    const imageStyle = computed(() => ({
      backgroundImage: isLoaded.value ? `url(${props.src})` : "none",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      width: "100%",
      height: "100%",
    }));

    // 加载图片
    const loadImage = () => {
      if (isLoading.value || isLoaded.value) return;

      isLoading.value = true;
      hasError.value = false;

      const img = new Image();

      img.onload = () => {
        isLoaded.value = true;
        isLoading.value = false;

        // 添加淡入效果的延迟
        setTimeout(() => {
          if (imageContainer.value) {
            imageContainer.value.classList.add("fade-in");
          }
        }, 50);
      };

      img.onerror = () => {
        isLoading.value = false;
        hasError.value = true;
        console.warn(`Failed to load image: ${props.src}`);
      };

      img.src = props.src;
    };

    // 初始化 Intersection Observer
    const initObserver = () => {
      if (!window.IntersectionObserver) {
        // 降级处理：直接加载图片
        loadImage();
        return;
      }

      observer.value = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting) {
            loadImage();
            // 加载后停止观察
            if (observer.value) {
              observer.value.unobserve(entry.target);
            }
          }
        },
        {
          rootMargin: props.rootMargin,
          threshold: props.threshold,
        },
      );

      if (imageContainer.value) {
        observer.value.observe(imageContainer.value);
      }
    };

    // 监听src变化
    watch(
      () => props.src,
      () => {
        if (props.src) {
          isLoaded.value = false;
          isLoading.value = false;
          hasError.value = false;

          // 重新初始化观察者
          if (observer.value && imageContainer.value) {
            observer.value.unobserve(imageContainer.value);
            observer.value.observe(imageContainer.value);
          }
        }
      },
    );

    onMounted(() => {
      if (props.src) {
        initObserver();
      }
    });

    onBeforeUnmount(() => {
      if (observer.value && imageContainer.value) {
        observer.value.unobserve(imageContainer.value);
        observer.value.disconnect();
      }
    });

    return {
      imageContainer,
      isLoaded,
      isLoading,
      hasError,
      containerStyle,
      imageStyle,
    };
  },
};
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  transition: opacity 0.3s ease;
}

.lazy-image-container.fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(1.02);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.lazy-image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gradient-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
}

.skeleton-shimmer {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.lazy-image {
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
}

.error-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%);
  color: #999;
}

.error-icon {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.6;
}

.error-text {
  font-size: 12px;
  opacity: 0.8;
}

/* 针对暗色主题的适配 */
@media (prefers-color-scheme: dark) {
  .gradient-placeholder {
    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  }

  .skeleton-shimmer {
    background: linear-gradient(90deg, #2d3748 25%, #4a5568 50%, #2d3748 75%);
    background-size: 200% 100%;
  }

  .error-placeholder {
    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
    color: #a0aec0;
  }
}

/* 响应式优化 */
@media (max-width: 768px) {
  .lazy-image-container {
    border-radius: 6px;
  }

  .error-icon {
    font-size: 24px;
  }

  .error-text {
    font-size: 11px;
  }
}
</style>
