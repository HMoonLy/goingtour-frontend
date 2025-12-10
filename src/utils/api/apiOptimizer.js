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

/**
 * 创建带缓存的请求函数
 * @param {Function} requestFunction - 原始请求函数
 * @param {Object} options - 缓存配置选项
 * @param {string} options.cacheKey - 缓存键名
 * @param {number} options.ttl - 缓存时间（毫秒）
 * @param {boolean} options.enableCache - 是否启用缓存
 * @returns {Function} 带缓存功能的请求函数
 */
export function createCachedRequest(requestFunction, options = {}) {
    const {
        cacheKey,
        ttl = 5 * 60 * 1000, // 默认5分钟
        enableCache = true
    } = options;

    return async function(...args) {
        // 如果不启用缓存，直接调用原函数
        if (!enableCache) {
            return await requestFunction.apply(this, args);
        }

        const finalCacheKey = cacheKey || `cached_${requestFunction.name}_${JSON.stringify(args)}`;

        try {
            // 尝试从缓存获取数据
            const cachedData = localStorage.getItem(finalCacheKey);
            if (cachedData) {
                const parsed = JSON.parse(cachedData);
                const now = Date.now();

                // 检查缓存是否过期
                if (now - parsed.timestamp < ttl) {
                    return parsed.data;
                }
            }
        } catch (error) {
            console.warn(`读取缓存失败: ${finalCacheKey}`, error);
        }

        // 缓存不存在或已过期，发起新请求
        try {
            const result = await requestFunction.apply(this, args);

            // 将结果存入缓存
            try {
                const cacheData = {
                    data: result,
                    timestamp: Date.now()
                };
                localStorage.setItem(finalCacheKey, JSON.stringify(cacheData));

                if (
                    import.meta.env.DEV) {
                    console.log(`💾 数据已缓存: ${finalCacheKey}`);
                }
            } catch (cacheError) {
                console.warn(`缓存数据失败: ${finalCacheKey}`, cacheError);
            }

            return result;
        } catch (error) {
            // 如果请求失败，尝试返回过期的缓存数据
            try {
                const cachedData = localStorage.getItem(finalCacheKey);
                if (cachedData) {
                    const parsed = JSON.parse(cachedData);
                    console.warn(`请求失败，使用过期缓存: ${finalCacheKey}`);
                    return parsed.data;
                }
            } catch (cacheError) {
                // 忽略缓存读取错误
            }

            // 如果没有缓存数据，重新抛出原始错误
            throw error;
        }
    };
}