/**
 * API请求优化工具
 * 提供缓存、防抖、节流等功能
 */

/**
 * 简单的内存缓存
 */
class MemoryCache {
    constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) {
        // 默认5分钟TTL
        this.cache = new Map();
        this.maxSize = maxSize;
        this.defaultTTL = defaultTTL;
    }

    /**
     * 生成缓存键
     */
    generateKey(url, params = {}) {
        const paramStr = JSON.stringify(params);
        return `${url}:${paramStr}`;
    }

    /**
     * 设置缓存
     */
    set(key, value, ttl = this.defaultTTL) {
        // 如果缓存满了，删除最旧的条目
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        const expireTime = Date.now() + ttl;
        this.cache.set(key, {
            value,
            expireTime,
            createdAt: Date.now(),
        });
    }

    /**
     * 获取缓存
     */
    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            return null;
        }

        // 检查是否过期
        if (Date.now() > item.expireTime) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    /**
     * 删除缓存
     */
    delete(key) {
        return this.cache.delete(key);
    }

    /**
     * 清空缓存
     */
    clear() {
        this.cache.clear();
    }

    /**
     * 获取缓存统计
     */
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            keys: Array.from(this.cache.keys()),
        };
    }
}

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
 * 创建全局缓存实例
 */
export const apiCache = new MemoryCache();

/**
 * 缓存装饰器函数
 */
export function withCache(cacheKey, ttl) {
    return function(target, propertyName, descriptor) {
        const method = descriptor.value;

        descriptor.value = async function(...args) {
            const key =
                typeof cacheKey === 'function' ?
                cacheKey.apply(this, args) :
                `${cacheKey}:${JSON.stringify(args)}`;

            // 尝试从缓存获取
            const cached = apiCache.get(key);
            if (cached) {
                if (
                    import.meta.env.DEV) {
                    console.log(`🎯 缓存命中: ${key}`);
                }
                return cached;
            }

            // 执行原方法
            const result = await method.apply(this, args);

            // 缓存结果
            if (result && !result.error) {
                apiCache.set(key, result, ttl);
                if (
                    import.meta.env.DEV) {
                    console.log(`💾 缓存存储: ${key}`);
                }
            }

            return result;
        };

        return descriptor;
    };
}

/**
 * 带缓存的API请求包装器
 */
export function createCachedRequest(apiFunction, options = {}) {
    const {
        cacheKey = null,
            ttl = 5 * 60 * 1000, // 5分钟
            enableCache = true,
    } = options;

    return async function(...args) {
        if (!enableCache) {
            return await apiFunction.apply(this, args);
        }

        // 生成缓存键
        const key = cacheKey ?
            typeof cacheKey === 'function' ?
            cacheKey(...args) :
            cacheKey :
            apiCache.generateKey(apiFunction.name, args);

        // 尝试从缓存获取
        const cached = apiCache.get(key);
        if (cached) {
            if (
                import.meta.env.DEV) {
                console.log(`🎯 缓存命中: ${key}`);
            }
            return cached;
        }

        // 执行API请求
        try {
            const result = await apiFunction.apply(this, args);

            // 缓存成功的结果
            if (result && !result.error) {
                apiCache.set(key, result, ttl);
                if (
                    import.meta.env.DEV) {
                    console.log(`💾 缓存存储: ${key}`);
                }
            }

            return result;
        } catch (error) {
            // 不缓存错误结果
            throw error;
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
 * 组合优化器 - 同时应用缓存、去重、防抖
 */
export function optimizeApiRequest(apiFunction, options = {}) {
    const {
        cache = true,
            cacheTTL = 5 * 60 * 1000,
            debounceWait = 0,
            deduplicate = true,
    } = options;

    let optimizedFunction = apiFunction;

    // 应用去重
    if (deduplicate) {
        optimizedFunction = requestDeduplicator.deduplicate(optimizedFunction);
    }

    // 应用缓存
    if (cache) {
        optimizedFunction = createCachedRequest(optimizedFunction, {
            ttl: cacheTTL,
            enableCache: true,
        });
    }

    // 应用防抖
    if (debounceWait > 0) {
        optimizedFunction = debounce(optimizedFunction, debounceWait);
    }

    return optimizedFunction;
}

/**
 * 清理过期缓存的定时任务
 */
export function startCacheCleanup(interval = 10 * 60 * 1000) {
    // 10分钟清理一次
    return setInterval(() => {
        const before = apiCache.getStats().size;

        // 强制触发一次垃圾回收（通过访问所有键）
        const keys = Array.from(apiCache.cache.keys());
        keys.forEach(key => {
            apiCache.get(key); // 这会自动清理过期的条目
        });

        const after = apiCache.getStats().size;

        if (
            import.meta.env.DEV && before !== after) {
            console.log(`🧹 缓存清理完成: ${before} -> ${after} 条目`);
        }
    }, interval);
}