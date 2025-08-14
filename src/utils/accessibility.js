/**
 * 无障碍访问增强工具
 * 提供键盘导航、屏幕阅读器支持等功能
 */

import { ref, nextTick, onMounted, onUnmounted } from 'vue';

/**
 * 键盘导航管理器
 */
export class KeyboardNavigationManager {
  constructor() {
    this.focusableElements = [];
    this.currentIndex = -1;
    this.trapFocus = false;
    this.container = null;
  }

  /**
   * 初始化键盘导航
   */
  init(container = document.body) {
    this.container = container;
    this.updateFocusableElements();
    this.bindEvents();
  }

  /**
   * 更新可聚焦元素列表
   */
  updateFocusableElements() {
    if (!this.container) return;

    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    this.focusableElements = Array.from(
      this.container.querySelectorAll(selector)
    ).filter(el => {
      return el.offsetWidth > 0 && el.offsetHeight > 0 && !el.hidden;
    });
  }

  /**
   * 绑定键盘事件
   */
  bindEvents() {
    this.container.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * 处理键盘事件
   */
  handleKeyDown(e) {
    switch (e.key) {
      case 'Tab':
        if (this.trapFocus) {
          this.handleTabNavigation(e);
        }
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        if (this.isInList(e.target)) {
          this.handleArrowNavigation(e);
        }
        break;
      case 'Enter':
      case ' ':
        this.handleActivation(e);
        break;
      case 'Escape':
        this.handleEscape(e);
        break;
    }
  }

  /**
   * 处理Tab导航
   */
  handleTabNavigation(e) {
    if (this.focusableElements.length === 0) return;

    const currentElement = document.activeElement;
    const currentIndex = this.focusableElements.indexOf(currentElement);

    let nextIndex;
    if (e.shiftKey) {
      // Shift + Tab (向前)
      nextIndex =
        currentIndex <= 0
          ? this.focusableElements.length - 1
          : currentIndex - 1;
    } else {
      // Tab (向后)
      nextIndex =
        currentIndex >= this.focusableElements.length - 1
          ? 0
          : currentIndex + 1;
    }

    e.preventDefault();
    this.focusableElements[nextIndex].focus();
  }

  /**
   * 处理箭头键导航
   */
  handleArrowNavigation(e) {
    const currentElement = e.target;
    const list = currentElement.closest(
      '[role="listbox"], [role="menu"], [role="list"]'
    );
    if (!list) return;

    const items = Array.from(
      list.querySelectorAll(
        '[role="option"], [role="menuitem"], [role="listitem"]'
      )
    );
    const currentIndex = items.indexOf(currentElement);

    let nextIndex;
    if (e.key === 'ArrowUp') {
      nextIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
    } else {
      nextIndex = currentIndex >= items.length - 1 ? 0 : currentIndex + 1;
    }

    e.preventDefault();
    items[nextIndex].focus();
  }

  /**
   * 处理激活事件
   */
  handleActivation(e) {
    const element = e.target;

    // 如果是按钮或链接，触发点击
    if (element.tagName === 'BUTTON' || element.tagName === 'A') {
      if (e.key === ' ') {
        e.preventDefault();
        element.click();
      }
    }

    // 如果是自定义可激活元素
    if (element.getAttribute('role') === 'button') {
      e.preventDefault();
      element.click();
    }
  }

  /**
   * 处理Escape键
   */
  handleEscape(e) {
    // 查找最近的模态框或弹出层
    const modal = e.target.closest('[role="dialog"], [role="alertdialog"]');
    if (modal) {
      const closeButton = modal.querySelector(
        '[data-dismiss], .el-dialog__close'
      );
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  /**
   * 检查元素是否在列表中
   */
  isInList(element) {
    return (
      element.closest('[role="listbox"], [role="menu"], [role="list"]') !== null
    );
  }

  /**
   * 设置焦点陷阱
   */
  setFocusTrap(enabled) {
    this.trapFocus = enabled;
    if (enabled) {
      this.updateFocusableElements();
    }
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.container) {
      this.container.removeEventListener('keydown', this.handleKeyDown);
    }
  }
}

/**
 * 屏幕阅读器支持
 */
export class ScreenReaderSupport {
  constructor() {
    this.announcements = [];
    this.createAriaLiveRegion();
  }

  /**
   * 创建ARIA Live区域
   */
  createAriaLiveRegion() {
    // 创建polite区域
    this.politeRegion = document.createElement('div');
    this.politeRegion.setAttribute('aria-live', 'polite');
    this.politeRegion.setAttribute('aria-atomic', 'true');
    this.politeRegion.className = 'sr-only';
    this.politeRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(this.politeRegion);

    // 创建assertive区域
    this.assertiveRegion = document.createElement('div');
    this.assertiveRegion.setAttribute('aria-live', 'assertive');
    this.assertiveRegion.setAttribute('aria-atomic', 'true');
    this.assertiveRegion.className = 'sr-only';
    this.assertiveRegion.style.cssText = this.politeRegion.style.cssText;
    document.body.appendChild(this.assertiveRegion);
  }

  /**
   * 向屏幕阅读器宣布消息
   */
  announce(message, priority = 'polite') {
    if (!message) return;

    const region =
      priority === 'assertive' ? this.assertiveRegion : this.politeRegion;

    // 清空区域然后添加新消息
    region.textContent = '';
    setTimeout(() => {
      region.textContent = message;
    }, 100);

    // 记录宣布历史
    this.announcements.push({
      message,
      priority,
      timestamp: Date.now(),
    });

    // 保持最近50条记录
    if (this.announcements.length > 50) {
      this.announcements.shift();
    }
  }

  /**
   * 宣布页面变化
   */
  announcePageChange(title) {
    this.announce(`页面已切换到 ${title}`, 'polite');
  }

  /**
   * 宣布加载状态
   */
  announceLoading(isLoading, message = '') {
    if (isLoading) {
      this.announce(message || '正在加载', 'polite');
    } else {
      this.announce('加载完成', 'polite');
    }
  }

  /**
   * 宣布错误消息
   */
  announceError(message) {
    this.announce(`错误：${message}`, 'assertive');
  }

  /**
   * 宣布成功消息
   */
  announceSuccess(message) {
    this.announce(`成功：${message}`, 'polite');
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.politeRegion) {
      document.body.removeChild(this.politeRegion);
    }
    if (this.assertiveRegion) {
      document.body.removeChild(this.assertiveRegion);
    }
  }
}

/**
 * 颜色对比度检查器
 */
export class ColorContrastChecker {
  /**
   * 计算相对亮度
   */
  getRelativeLuminance(rgb) {
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * 计算对比度
   */
  getContrastRatio(color1, color2) {
    const l1 = this.getRelativeLuminance(color1);
    const l2 = this.getRelativeLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * 检查对比度是否符合WCAG标准
   */
  checkContrast(foreground, background, level = 'AA', size = 'normal') {
    const ratio = this.getContrastRatio(foreground, background);

    let threshold;
    if (level === 'AAA') {
      threshold = size === 'large' ? 4.5 : 7;
    } else {
      threshold = size === 'large' ? 3 : 4.5;
    }

    return {
      ratio: ratio,
      passes: ratio >= threshold,
      level: level,
      size: size,
      threshold: threshold,
    };
  }

  /**
   * 从CSS颜色字符串解析RGB
   */
  parseColor(colorStr) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = colorStr;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r, g, b];
  }
}

/**
 * 无障碍访问检查器
 */
export class AccessibilityChecker {
  constructor() {
    this.issues = [];
  }

  /**
   * 检查页面无障碍性
   */
  checkPage() {
    this.issues = [];
    this.checkImages();
    this.checkForms();
    this.checkHeadings();
    this.checkLinks();
    this.checkColors();
    return this.issues;
  }

  /**
   * 检查图片
   */
  checkImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        this.issues.push({
          type: 'image',
          element: img,
          message: '图片缺少alt属性或aria-label',
          severity: 'error',
        });
      }
    });
  }

  /**
   * 检查表单
   */
  checkForms() {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const hasLabel = input.labels && input.labels.length > 0;
      const hasAriaLabel = input.getAttribute('aria-label');
      const hasAriaLabelledby = input.getAttribute('aria-labelledby');

      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledby) {
        this.issues.push({
          type: 'form',
          element: input,
          message: '表单控件缺少标签',
          severity: 'error',
        });
      }
    });
  }

  /**
   * 检查标题层次
   */
  checkHeadings() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;

    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));

      if (level - previousLevel > 1) {
        this.issues.push({
          type: 'heading',
          element: heading,
          message: `标题层次跳跃：从h${previousLevel}跳到h${level}`,
          severity: 'warning',
        });
      }

      previousLevel = level;
    });
  }

  /**
   * 检查链接
   */
  checkLinks() {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
      if (!link.textContent.trim() && !link.getAttribute('aria-label')) {
        this.issues.push({
          type: 'link',
          element: link,
          message: '链接缺少可访问的文本',
          severity: 'error',
        });
      }
    });
  }

  /**
   * 检查颜色对比度
   */
  checkColors() {
    const checker = new ColorContrastChecker();
    const elements = document.querySelectorAll('*');

    elements.forEach(el => {
      const style = getComputedStyle(el);
      const color = style.color;
      const backgroundColor = style.backgroundColor;

      if (
        color !== 'rgba(0, 0, 0, 0)' &&
        backgroundColor !== 'rgba(0, 0, 0, 0)'
      ) {
        try {
          const foreground = checker.parseColor(color);
          const background = checker.parseColor(backgroundColor);
          const result = checker.checkContrast(foreground, background);

          if (!result.passes) {
            this.issues.push({
              type: 'contrast',
              element: el,
              message: `颜色对比度不足：${result.ratio.toFixed(2)}:1 (需要${result.threshold}:1)`,
              severity: 'warning',
            });
          }
        } catch (e) {
          // 忽略颜色解析错误
        }
      }
    });
  }
}

// 全局实例
export const keyboardNav = new KeyboardNavigationManager();
export const screenReader = new ScreenReaderSupport();
export const accessibilityChecker = new AccessibilityChecker();

/**
 * Vue组合式API钩子：键盘导航
 */
export function useKeyboardNavigation(containerRef) {
  onMounted(() => {
    if (containerRef.value) {
      keyboardNav.init(containerRef.value);
    }
  });

  onUnmounted(() => {
    keyboardNav.destroy();
  });

  return {
    setFocusTrap: enabled => keyboardNav.setFocusTrap(enabled),
    updateFocusableElements: () => keyboardNav.updateFocusableElements(),
  };
}

/**
 * Vue组合式API钩子：屏幕阅读器支持
 */
export function useScreenReader() {
  const announce = (message, priority) =>
    screenReader.announce(message, priority);
  const announcePageChange = title => screenReader.announcePageChange(title);
  const announceLoading = (isLoading, message) =>
    screenReader.announceLoading(isLoading, message);
  const announceError = message => screenReader.announceError(message);
  const announceSuccess = message => screenReader.announceSuccess(message);

  return {
    announce,
    announcePageChange,
    announceLoading,
    announceError,
    announceSuccess,
  };
}

/**
 * 添加跳转到主内容的链接
 */
export function addSkipToMainLink() {
  const existingLink = document.querySelector('.skip-to-main');
  if (existingLink) return;

  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = '跳转到主内容';
  skipLink.className = 'skip-to-main';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    border-radius: 4px;
    z-index: 10000;
    transition: top 0.3s;
  `;

  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });

  document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * 初始化无障碍访问功能
 */
export function initAccessibility() {
  addSkipToMainLink();

  // 为主内容区域添加ID
  const mainContent = document.querySelector('main, #app > div, .main-content');
  if (mainContent && !mainContent.id) {
    mainContent.id = 'main-content';
  }

  // 添加焦点样式
  const style = document.createElement('style');
  style.textContent = `
    .focus-visible {
      outline: 2px solid #409EFF;
      outline-offset: 2px;
    }
    
    .sr-only {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    }
  `;
  document.head.appendChild(style);
}

// 在模块加载时自动初始化
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initAccessibility);
}
