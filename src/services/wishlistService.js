/**
 * 愿望清单业务服务 - 优化版
 * 使用统一的缓存管理和错误处理
 */
import { wishlistApi } from '@/api/wishlist.js'
import { cityPhotosApi } from '@/api/cityPhotos.js'
import { BaseService } from './baseService.js'

class WishlistService extends BaseService {
    constructor() {
        super('WishlistService')
    }

    // ==================== 缓存管理 ====================
    _getCacheKey(userId, action = 'list') {
        return `wishlist_${action}_${userId}`
    }

    _getFromCache(key) {
        const cached = this.cache.get(key)
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data
        }
        this.cache.delete(key)
        return null
    }

    _setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        })
    }

    clearCache(userId) {
        if (userId) {
            this.cache.delete(this._getCacheKey(userId))
        } else {
            this.cache.clear()
        }
    }

    // ==================== 私有API方法 ====================

    /**
     * 从API获取用户愿望清单
     */
    async _getUserWishlistFromApi(userId) {
        const response = await wishlistApi.getUserWishlist(userId)
        return response ? .data || []
    }

    // ==================== 核心业务方法 ====================

    /**
     * 加载用户愿望清单（带缓存）
     */
    async loadUserWishlist(userId, useCache = true) {
        if (!userId) {
            throw new Error('用户ID不能为空')
        }

        return await this.withErrorHandling(
            async() => {
                if (useCache) {
                    // 创建带缓存的方法
                    const cachedMethod = this.createCachedMethod(
                        this._getUserWishlistFromApi, {
                            cacheKey: `wishlist_${userId}`,
                            ttl: 5 * 60 * 1000
                        }
                    )
                    return await cachedMethod(userId)
                } else {
                    return await this._getUserWishlistFromApi(userId)
                }
            },
            '加载愿望清单失败'
        )
    }

    /**
     * 添加城市到愿望清单
     */
    async addToWishlist(userId, cityData) {
        if (!userId || !cityData ? .cityCode) {
            throw new Error('用户ID和城市代码不能为空')
        }

        return await this.withErrorHandling(
            async() => {
                const response = await wishlistApi.addToWishlist(userId, cityData)

                // 清除相关缓存
                this.clearCache(`wishlist_${userId}`)

                return response
            },
            '添加到愿望清单失败'
        )
    }

    /**
     * 从愿望清单移除城市
     */
    async removeFromWishlist(userId, cityCode) {
        if (!userId || !cityCode) {
            throw new Error('用户ID和城市代码不能为空')
        }

        return await this.withErrorHandling(
            async() => {
                const response = await wishlistApi.removeFromWishlist(userId, cityCode)

                // 清除相关缓存
                this.clearCache(`wishlist_${userId}`)

                return response
            },
            '从愿望清单移除失败'
        )
    }

    /**
     * 更新愿望清单项
     */
    async updateWishlistItem(userId, cityCode, updateData) {
        if (!userId || !cityCode) {
            throw new Error('用户ID和城市代码不能为空')
        }

        try {
            const response = await wishlistApi.updateWishlistItem(userId, cityCode, updateData)

            // 清除缓存
            this.clearCache(userId)

            return response
        } catch (error) {
            console.error('更新愿望清单项失败:', error)
            throw error
        }
    }

    /**
     * 获取城市照片（带缓存）
     */
    async getCityPhotos(cityCode, useCache = true) {
        if (!cityCode) {
            return []
        }

        const cacheKey = `photos_${cityCode}`

        if (useCache) {
            const cached = this._getFromCache(cacheKey)
            if (cached) {
                return cached
            }
        }

        try {
            const response = await cityPhotosApi.getCityPhotos(cityCode)
            const photos = response ? .data || []

            if (useCache && photos.length > 0) {
                this._setCache(cacheKey, photos)
            }

            return photos
        } catch (error) {
            // 照片获取失败不抛出异常，返回空数组
            console.debug('获取城市照片失败:', error)
            return []
        }
    }

    /**
     * 批量获取城市照片
     */
    async batchGetCityPhotos(cityCodes) {
        if (!Array.isArray(cityCodes) || cityCodes.length === 0) {
            return {}
        }

        const results = {}

        // 并发获取所有城市照片
        await Promise.allSettled(
            cityCodes.map(async(cityCode) => {
                try {
                    const photos = await this.getCityPhotos(cityCode)
                    results[cityCode] = photos
                } catch (error) {
                    results[cityCode] = []
                }
            })
        )

        return results
    }

    /**
     * 验证愿望清单数据
     */
    validateWishlistData(cityData) {
        const errors = []

        if (!cityData.cityCode ? .trim()) {
            errors.push('城市代码不能为空')
        }

        if (!cityData.cityName ? .trim()) {
            errors.push('城市名称不能为空')
        }

        if (!cityData.provinceName ? .trim()) {
            errors.push('省份名称不能为空')
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    /**
     * 统计愿望清单数据
     */
    calculateWishlistStats(wishlistItems) {
        if (!Array.isArray(wishlistItems)) {
            return {
                total: 0,
                visited: 0,
                unvisited: 0,
                wantToRevisit: 0
            }
        }

        const stats = {
            total: wishlistItems.length,
            visited: 0,
            unvisited: 0,
            wantToRevisit: 0
        }

        wishlistItems.forEach(item => {
            if (item.ever_visited) {
                stats.visited++
                    if (item.want_to_visit_again) {
                        stats.wantToRevisit++
                    }
            } else {
                stats.unvisited++
            }
        })

        return stats
    }
}

// 创建单例实例
export const wishlistService = new WishlistService()