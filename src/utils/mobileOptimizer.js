/**
 * 移动端优化工具
 * 提供移动端特定的交互和性能优化
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';

/**
 * 设备检测
 */
export class DeviceDetector {
    constructor() {
        this.userAgent = navigator.userAgent.toLowerCase();
        this.isTouch = 'ontouchstart' in window;
        this.viewport = this.getViewport();
    }

    /**
     * 是否为移动设备
     */
    get isMobile() {
        return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(this.userAgent);
    }

    /**
     * 是否为平板设备
     */
    get isTablet() {
        return /ipad|android(?!.*mobile)|tablet/i.test(this.userAgent);
    }

    /**
     * 是否为iOS设备
     */
    get isIOS() {
        return /iphone|ipad|ipod/i.test(this.userAgent);
    }

    /**
     * 是否为Android设备
     */
    get isAndroid() {
        return /android/i.test(this.userAgent);
    }

    /**
     * 是否支持触摸
     */
    get isTouchDevice() {
        return this.isTouch;
    }

    /**
     * 获取视口信息
     */
    getViewport() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            ratio: window.devicePixelRatio || 1
        };
    }

    /**
     * 更新视口信息
     */
    updateViewport() {
        this.viewport = this.getViewport();
        return this.viewport;
    }

    /**
     * 是否为小屏幕设备
     */
    get isSmallScreen() {
        return this.viewport.width < 768;
    }

    /**
     * 是否为中等屏幕设备
     */
    get isMediumScreen() {
        return this.viewport.width >= 768 && this.viewport.width < 1024;
    }

    /**
     * 是否为大屏幕设备
     */
    get isLargeScreen() {
        return this.viewport.width >= 1024;
    }
}

// 全局设备检测实例
export const deviceDetector = new DeviceDetector();

/**
 * 触摸手势处理
 */
export class TouchGestureHandler {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            threshold: 50, // 滑动阈值
            timeout: 500, // 长按时间
            ...options
        };

        this.startX = 0;
        this.startY = 0;
        this.startTime = 0;
        this.isLongPress = false;
        this.longPressTimer = null;

        this.init();
    }

    init() {
        if (!this.element) return;

        this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    }

    handleTouchStart(e) {
        const touch = e.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
        this.startTime = Date.now();
        this.isLongPress = false;

        // 长按检测
        this.longPressTimer = setTimeout(() => {
            this.isLongPress = true;
            this.onLongPress && this.onLongPress(e);
        }, this.options.timeout);
    }

    handleTouchMove(e) {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }

    handleTouchEnd(e) {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }

        if (this.isLongPress) return;

        const touch = e.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;
        const deltaX = endX - this.startX;
        const deltaY = endY - this.startY;
        const deltaTime = Date.now() - this.startTime;

        // 快速点击
        if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 300) {
            this.onTap && this.onTap(e);
            return;
        }

        // 滑动检测
        if (Math.abs(deltaX) > this.options.threshold || Math.abs(deltaY) > this.options.threshold) {
            const direction = this.getSwipeDirection(deltaX, deltaY);
            this.onSwipe && this.onSwipe(direction, { deltaX, deltaY, deltaTime }, e);
        }
    }

    getSwipeDirection(deltaX, deltaY) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            return deltaX > 0 ? 'right' : 'left';
        } else {
            return deltaY > 0 ? 'down' : 'up';
        }
    }

    destroy() {
        if (this.element) {
            this.element.removeEventListener('touchstart', this.handleTouchStart);
            this.element.removeEventListener('touchmove', this.handleTouchMove);
            this.element.removeEventListener('touchend', this.handleTouchEnd);
        }
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
        }
    }
}

/**
 * 移动端性能优化
 */
export class MobilePerformanceOptimizer {
    constructor() {
        this.isLowEndDevice = this.detectLowEndDevice();
        this.reducedMotion = this.detectReducedMotion();
    }

    /**
     * 检测低端设备
     */
    detectLowEndDevice() {
        // 基于内存和CPU核心数判断
        const memory = navigator.deviceMemory || 4;
        const cores = navigator.hardwareConcurrency || 4;

        return memory <= 2 || cores <= 2;
    }

    /**
     * 检测用户是否偏好减少动画
     */
    detectReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * 获取优化配置
     */
    getOptimizationConfig() {
        return {
            // 是否启用动画
            enableAnimations: !this.isLowEndDevice && !this.reducedMotion,
            // 是否启用复杂效果
            enableComplexEffects: !this.isLowEndDevice,
            // 图片质量
            imageQuality: this.isLowEndDevice ? 'low' : 'high',
            // 列表虚拟化阈值
            virtualizationThreshold: this.isLowEndDevice ? 20 : 50,
            // 防抖延迟
            debounceDelay: this.isLowEndDevice ? 500 : 300,
        };
    }
}

// 全局性能优化器
export const mobileOptimizer = new MobilePerformanceOptimizer();

/**
 * Vue组合式API钩子：响应式设备检测
 */
export function useDeviceDetection() {
    const viewport = ref(deviceDetector.getViewport());
    const isMobile = ref(deviceDetector.isMobile);
    const isTablet = ref(deviceDetector.isTablet);
    const isTouch = ref(deviceDetector.isTouchDevice);

    const updateDevice = () => {
        viewport.value = deviceDetector.updateViewport();
    };

    onMounted(() => {
        window.addEventListener('resize', updateDevice);
        window.addEventListener('orientationchange', updateDevice);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', updateDevice);
        window.removeEventListener('orientationchange', updateDevice);
    });

    const isSmallScreen = computed(() => viewport.value.width < 768);
    const isMediumScreen = computed(() => viewport.value.width >= 768 && viewport.value.width < 1024);
    const isLargeScreen = computed(() => viewport.value.width >= 1024);

    return {
        viewport,
        isMobile,
        isTablet,
        isTouch,
        isSmallScreen,
        isMediumScreen,
        isLargeScreen,
        deviceDetector
    };
}

/**
 * Vue组合式API钩子：触摸手势
 */
export function useTouchGesture(elementRef, options = {}) {
    let gestureHandler = null;

    const onTap = ref(null);
    const onSwipe = ref(null);
    const onLongPress = ref(null);

    onMounted(() => {
        if (elementRef.value) {
            gestureHandler = new TouchGestureHandler(elementRef.value, options);
            gestureHandler.onTap = (e) => onTap.value && onTap.value(e);
            gestureHandler.onSwipe = (direction, details, e) => onSwipe.value && onSwipe.value(direction, details, e);
            gestureHandler.onLongPress = (e) => onLongPress.value && onLongPress.value(e);
        }
    });

    onUnmounted(() => {
        if (gestureHandler) {
            gestureHandler.destroy();
        }
    });

    return {
        onTap,
        onSwipe,
        onLongPress
    };
}

/**
 * 移动端滚动优化
 */
export function optimizeScrolling(element) {
    if (!element) return;

    // iOS滚动优化
    if (deviceDetector.isIOS) {
        element.style.webkitOverflowScrolling = 'touch';
    }

    // 防止橡皮筋效果
    element.addEventListener('touchmove', (e) => {
        const target = e.target;
        if (target.scrollHeight <= target.clientHeight) {
            e.preventDefault();
        }
    }, { passive: false });
}

/**
 * 移动端输入优化
 */
export function optimizeInput(inputElement) {
    if (!inputElement || !deviceDetector.isMobile) return;

    // 防止iOS输入时页面缩放
    if (deviceDetector.isIOS) {
        inputElement.addEventListener('focus', () => {
            const viewport = document.querySelector('meta[name=viewport]');
            if (viewport) {
                viewport.setAttribute('content',
                    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
                );
            }
        });

        inputElement.addEventListener('blur', () => {
            const viewport = document.querySelector('meta[name=viewport]');
            if (viewport) {
                viewport.setAttribute('content',
                    'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
                );
            }
        });
    }
}

/**
 * 图片懒加载优化
 */
export function createImageLazyLoader() {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;

                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '50px'
    });

    return {
        observe: (img) => imageObserver.observe(img),
        unobserve: (img) => imageObserver.unobserve(img),
        disconnect: () => imageObserver.disconnect()
    };
}

/**
 * 移动端友好的日期选择器配置
 */
export function getMobileDatePickerConfig() {
    if (!deviceDetector.isMobile) {
        return {};
    }

    return {
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        size: 'large',
        clearable: true,
        editable: false,
        placeholder: '选择日期',
        popperClass: 'mobile-date-picker',
        // 移动端使用原生选择器
        type: deviceDetector.isIOS ? 'date' : 'date'
    };
}