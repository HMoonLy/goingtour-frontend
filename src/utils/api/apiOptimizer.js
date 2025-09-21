/**
 * API请求优化工具
 * 提供防抖、节流、请求去重等功能
 */

/**
 * 防抖函数
 */
export function debounce(func, wait, immediate = false) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };

        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);

        if (callNow) func.apply(this, args);
    };
}

/**
 * 节流函数
 */
export function throttle(func, limit) {
    let inThrottle;

    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * 请求去重器 - 防止相同请求重复发送
 */
class RequestDeduplicator {
    constructor() {
        this.pendingRequests = new Map();
    }

    /**
     * 包装API请求，自动去重
     */
    deduplicate(apiFunction) {
        return async function(...args) {
            const key = JSON.stringify([apiFunction.name, args]);

            // 如果有相同的请求正在进行，返回同一个Promise
            if (this.pendingRequests.has(key)) {
                if (
                    import.meta.env.DEV) {
                    console.log(`🔄 请求去重: ${key}`);
                }
                return this.pendingRequests.get(key);
            }

            // 创建新请求
            const promise = apiFunction.apply(this, args).finally(() => {
                // 请求完成后移除
                this.pendingRequests.delete(key);
            });

            this.pendingRequests.set(key, promise);
            return promise;
        }.bind(this);
    }
}

export const requestDeduplicator = new RequestDeduplicator();