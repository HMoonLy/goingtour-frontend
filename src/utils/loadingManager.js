/**
 * 全局加载状态管理
 * 统一管理应用中的加载状态
 */

import { ref, computed } from 'vue';
import { ElLoading } from 'element-plus';

/**
 * 加载状态管理器
 */
class LoadingManager {
    constructor() {
        this.loadingTasks = ref(new Map());
        this.globalLoadingInstance = null;
    }

    /**
     * 开始加载任务
     * @param {string} taskId - 任务ID
     * @param {string} message - 加载消息
     * @param {Object} options - 选项
     */
    startTask(taskId, message = '加载中...', options = {}) {
        const {
            global = false, // 是否显示全局加载
                target = null, // 目标元素
                background = 'rgba(0, 0, 0, 0.7)',
                customClass = ''
        } = options;

        // 记录任务
        this.loadingTasks.value.set(taskId, {
            message,
            startTime: Date.now(),
            global,
            target,
            options: { background, customClass }
        });

        // 如果是全局加载且当前没有全局加载实例
        if (global && !this.globalLoadingInstance) {
            this.globalLoadingInstance = ElLoading.service({
                lock: true,
                text: message,
                background,
                customClass
            });
        }

        if (
            import.meta.env.DEV) {
            console.log(`🔄 开始加载任务: ${taskId} - ${message}`);
        }
    }

    /**
     * 结束加载任务
     * @param {string} taskId - 任务ID
     */
    endTask(taskId) {
        const task = this.loadingTasks.value.get(taskId);
        if (!task) {
            console.warn(`警告: 尝试结束不存在的加载任务: ${taskId}`);
            return;
        }

        // 移除任务
        this.loadingTasks.value.delete(taskId);

        // 如果是全局加载任务且没有其他全局任务
        if (task.global) {
            const hasOtherGlobalTasks = Array.from(this.loadingTasks.value.values())
                .some(t => t.global);

            if (!hasOtherGlobalTasks && this.globalLoadingInstance) {
                this.globalLoadingInstance.close();
                this.globalLoadingInstance = null;
            }
        }

        if (
            import.meta.env.DEV) {
            const duration = Date.now() - task.startTime;
            console.log(`✅ 结束加载任务: ${taskId} - 耗时: ${duration}ms`);
        }
    }

    /**
     * 检查任务是否正在加载
     * @param {string} taskId - 任务ID
     * @returns {boolean}
     */
    isLoading(taskId) {
        return this.loadingTasks.value.has(taskId);
    }

    /**
     * 获取所有加载中的任务
     * @returns {Array}
     */
    getActiveTasks() {
        return Array.from(this.loadingTasks.value.entries()).map(([id, task]) => ({
            id,
            ...task
        }));
    }

    /**
     * 清除所有加载任务
     */
    clearAllTasks() {
        this.loadingTasks.value.clear();

        if (this.globalLoadingInstance) {
            this.globalLoadingInstance.close();
            this.globalLoadingInstance = null;
        }

        if (
            import.meta.env.DEV) {
            console.log('🧹 清除所有加载任务');
        }
    }

    /**
     * 是否有任何加载任务
     */
    get hasAnyLoading() {
        return computed(() => this.loadingTasks.value.size > 0);
    }

    /**
     * 是否有全局加载任务
     */
    get hasGlobalLoading() {
        return computed(() => {
            return Array.from(this.loadingTasks.value.values()).some(task => task.global);
        });
    }
}

// 创建全局实例
export const loadingManager = new LoadingManager();

/**
 * 加载装饰器 - 自动管理函数的加载状态
 * @param {string} taskId - 任务ID
 * @param {Object} options - 选项
 */
export function withLoading(taskId, options = {}) {
    return function(target, propertyName, descriptor) {
        const method = descriptor.value;

        descriptor.value = async function(...args) {
            const {
                message = '处理中...',
                    global = false,
                    errorMessage = '操作失败'
            } = options;

            loadingManager.startTask(taskId, message, { global });

            try {
                const result = await method.apply(this, args);
                return result;
            } catch (error) {
                console.error(`加载任务失败 [${taskId}]:`, error);
                throw error;
            } finally {
                loadingManager.endTask(taskId);
            }
        };

        return descriptor;
    };
}

/**
 * 创建带加载状态的异步函数包装器
 * @param {Function} asyncFn - 异步函数
 * @param {string} taskId - 任务ID
 * @param {Object} options - 选项
 */
export function createLoadingWrapper(asyncFn, taskId, options = {}) {
    return async function(...args) {
        const {
            message = '处理中...',
                global = false
        } = options;

        loadingManager.startTask(taskId, message, { global });

        try {
            const result = await asyncFn.apply(this, args);
            return result;
        } finally {
            loadingManager.endTask(taskId);
        }
    };
}

/**
 * Vue组合式API钩子
 */
export function useLoading() {
    /**
     * 开始加载
     */
    const startLoading = (taskId, message, options) => {
        loadingManager.startTask(taskId, message, options);
    };

    /**
     * 结束加载
     */
    const endLoading = (taskId) => {
        loadingManager.endTask(taskId);
    };

    /**
     * 检查是否加载中
     */
    const isLoading = (taskId) => {
        return computed(() => loadingManager.isLoading(taskId));
    };

    /**
     * 执行带加载状态的异步操作
     */
    const executeWithLoading = async(asyncFn, taskId, options = {}) => {
        return createLoadingWrapper(asyncFn, taskId, options)();
    };

    return {
        startLoading,
        endLoading,
        isLoading,
        executeWithLoading,
        hasAnyLoading: loadingManager.hasAnyLoading,
        hasGlobalLoading: loadingManager.hasGlobalLoading,
        getActiveTasks: () => loadingManager.getActiveTasks(),
        clearAllTasks: () => loadingManager.clearAllTasks()
    };
}

/**
 * 页面离开时清理加载状态
 */
export function setupLoadingCleanup() {
    // 页面卸载时清理
    window.addEventListener('beforeunload', () => {
        loadingManager.clearAllTasks();
    });

    // 路由变化时清理（需要在路由守卫中调用）
    return () => {
        loadingManager.clearAllTasks();
    };
}