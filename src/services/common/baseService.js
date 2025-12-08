/**
 * 服务基类 - 提供统一的缓存和错误处理
 */
import { createCachedRequest } from '@/utils/api/apiOptimizer.js'
import { handleApiError, withErrorHandling } from '@/utils/api/errorHandler.js'

export class BaseService {
    constructor(serviceName) {
        this.serviceName = serviceName
    }

    /**
     * 创建带缓存的请求方法
     * @param {Function} apiMethod - API方法
     * @param {Object} cacheOptions - 缓存配置
     * @returns {Function} 带缓存的请求方法
     */
    createCachedMethod(apiMethod, cacheOptions = {}) {
        const defaultOptions = {
            ttl: 5 * 60 * 1000, // 默认5分钟
            enableCache: true
        }

        return createCachedRequest(
            apiMethod.bind(this), {...defaultOptions, ...cacheOptions }
        )
    }

    /**
     * 使用统一错误处理包装异步方法
     * @param {Function} asyncFn - 异步函数
     * @param {string} errorMessage - 错误消息
     * @param {Object} options - 错误处理选项
     * @returns {Promise} 处理结果
     */
    async withErrorHandling(asyncFn, errorMessage = '操作失败', options = {}) {
        const result = await withErrorHandling(
            asyncFn,
            errorMessage, { logError: true, ...options }
        )

        if (result.success) {
            return result.data
        } else {
            throw new Error(result.message)
        }
    }

    /**
     * 清除服务相关缓存
     * @param {string} pattern - 缓存键模式
     */
    clearCache(pattern = null) {
        const keys = Object.keys(localStorage)

        if (!pattern) {
            // 清除所有当前服务相关缓存
            keys.forEach(key => {
                if (key.includes('cached_') && key.includes(this.serviceName.toLowerCase())) {
                    localStorage.removeItem(key)
                }
            })
            return
        }

        // 清除匹配模式的缓存
        keys.forEach(key => {
            if (key.includes('cached_') && key.includes(pattern)) {
                localStorage.removeItem(key)
            }
        })
    }

    /**
     * 获取缓存统计信息
     */
    getCacheStats() {
        const keys = Object.keys(localStorage)
        const serviceKeys = keys.filter(key =>
            key.includes('cached_') && key.includes(this.serviceName.toLowerCase())
        )

        const stats = {
            totalCaches: serviceKeys.length,
            cacheSize: 0,
            validCaches: 0,
            expiredCaches: 0
        }

        serviceKeys.forEach(key => {
            try {
                const cached = localStorage.getItem(key)
                if (cached) {
                    stats.cacheSize += cached.length
                    const parsed = JSON.parse(cached)
                    const now = Date.now()

                    if (now - parsed.timestamp < 5 * 60 * 1000) {
                        stats.validCaches++
                    } else {
                        stats.expiredCaches++
                    }
                }
            } catch (error) {
                // 忽略解析错误的缓存项
            }
        })

        return stats
    }

    /**
     * 清理过期缓存
     */
    cleanExpiredCache() {
        const keys = Object.keys(localStorage)
        const serviceKeys = keys.filter(key =>
            key.includes('cached_') && key.includes(this.serviceName.toLowerCase())
        )

        let cleanedCount = 0

        serviceKeys.forEach(key => {
            try {
                const cached = localStorage.getItem(key)
                if (cached) {
                    const parsed = JSON.parse(cached)
                    const now = Date.now()

                    if (now - parsed.timestamp >= 5 * 60 * 1000) {
                        localStorage.removeItem(key)
                        cleanedCount++
                    }
                }
            } catch (error) {
                // 清理无效的缓存项
                localStorage.removeItem(key)
                cleanedCount++
            }
        })

        if (
            import.meta.env.DEV && cleanedCount > 0) {
            console.log(`🧹 ${this.serviceName}: 清理了 ${cleanedCount} 个过期缓存`)
        }

        return cleanedCount
    }
}