/**
 * 行程业务服务 - 精简版
 * 专注于业务逻辑和数据转换，API调用交由tripApi处理
 */
import { tripApi } from '@/api/trip.js'
import {
    convertBackendTripToFrontend,
    convertFrontendTripToBackend
} from '@/utils/data/tripDataConverter.js'

class TripService {
    constructor() {
        this.cache = new Map()
        this.cacheTimeout = 5 * 60 * 1000 // 5分钟缓存
    }

    // ==================== 缓存管理 ====================
    _generateCacheKey(type, ...params) {
        return `${type}_${params.join('_')}`
    }

    _isCacheValid(cacheData) {
        if (!cacheData) return false
        return Date.now() - cacheData.timestamp < this.cacheTimeout
    }

    _getFromCache(cacheKey) {
        const cacheData = this.cache.get(cacheKey)
        if (this._isCacheValid(cacheData)) {
            return cacheData.data
        }
        this.cache.delete(cacheKey)
        return null
    }

    _setCache(cacheKey, data) {
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        })
    }

    clearCache(pattern = null) {
        if (!pattern) {
            this.cache.clear()
            return
        }
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key)
            }
        }
    }

    // ==================== 业务逻辑方法 ====================

    /**
     * 获取用户行程列表（带缓存和数据转换）
     */
    async getUserTrips(userId, useCache = true) {
        if (!userId) {
            throw new Error('用户ID不能为空')
        }

        const cacheKey = this._generateCacheKey('user_trips', userId)

        if (useCache) {
            const cachedData = this._getFromCache(cacheKey)
            if (cachedData) {
                return cachedData
            }
        }

        try {
            const response = await tripApi.getUserTrips(userId)
            if (response && response.data) {
                // 转换后端数据格式
                const convertedTrips = response.data
                    .map(trip => convertBackendTripToFrontend(trip))
                    .filter(Boolean)

                if (useCache) {
                    this._setCache(cacheKey, convertedTrips)
                }

                return convertedTrips
            }
            return []
        } catch (error) {
            console.error('获取用户行程失败:', error)
            throw error
        }
    }

    /**
     * 获取行程详情（带缓存和数据转换）
     */
    async getTripDetail(tripId, userId) {
        if (!tripId || !userId) {
            throw new Error('行程ID和用户ID不能为空')
        }

        const cacheKey = this._generateCacheKey('trip_detail', tripId, userId)
        const cachedData = this._getFromCache(cacheKey)

        if (cachedData) {
            return cachedData
        }

        try {
            const response = await tripApi.getTripDetail(tripId, userId)
            if (response && response.data) {
                const convertedTrip = convertBackendTripToFrontend(response.data)
                if (convertedTrip) {
                    this._setCache(cacheKey, convertedTrip)
                    return convertedTrip
                }
            }
            return null
        } catch (error) {
            console.error('获取行程详情失败:', error)
            throw error
        }
    }

    /**
     * 创建行程（带数据转换和缓存清理）
     */
    async createTrip(userId, tripData) {
        if (!userId || !tripData ? .title || !tripData ? .city) {
            throw new Error('用户ID、行程标题和目的地不能为空')
        }

        try {
            // 转换前端数据格式为后端格式
            const backendTripData = convertFrontendTripToBackend(tripData)
            const response = await tripApi.createTrip(userId, backendTripData)

            if (response && response.data) {
                const convertedTrip = convertBackendTripToFrontend(response.data)

                // 清除用户行程列表缓存
                this.clearCache(`user_trips_${userId}`)

                return convertedTrip
            }
            return null
        } catch (error) {
            console.error('创建行程失败:', error)
            throw error
        }
    }

    /**
     * 更新行程（带数据转换和缓存清理）
     */
    async updateTrip(tripId, userId, tripData) {
        if (!tripId || !userId) {
            throw new Error('行程ID和用户ID不能为空')
        }

        try {
            const backendTripData = convertFrontendTripToBackend(tripData)
            const response = await tripApi.updateTrip(tripId, userId, backendTripData)

            if (response && response.data) {
                const convertedTrip = convertBackendTripToFrontend(response.data)

                // 清除相关缓存
                this.clearCache(`user_trips_${userId}`)
                this.clearCache(`trip_detail_${tripId}`)

                return convertedTrip
            }
            return null
        } catch (error) {
            console.error('更新行程失败:', error)
            throw error
        }
    }

    /**
     * 删除行程（带缓存清理）
     */
    async deleteTrip(tripId, userId) {
        if (!tripId || !userId) {
            throw new Error('行程ID和用户ID不能为空')
        }

        try {
            const response = await tripApi.deleteTrip(tripId, userId)

            // 清除相关缓存
            this.clearCache(`user_trips_${userId}`)
            this.clearCache(`trip_detail_${tripId}`)

            return response
        } catch (error) {
            console.error('删除行程失败:', error)
            throw error
        }
    }

    /**
     * AI行程生成（核心业务逻辑）
     */
    async generateAiTrip(params, onProgress) {
        if (!params ? .city || !params ? .days) {
            throw new Error('城市和天数不能为空')
        }

        try {
            // 生成AI行程的业务逻辑
            return await tripApi.generateAiTrip(params, onProgress)
        } catch (error) {
            console.error('AI行程生成失败:', error)
            throw error
        }
    }

    /**
     * 行程数据验证
     */
    validateTripData(tripData) {
        const errors = []

        if (!tripData.title ? .trim()) {
            errors.push('行程标题不能为空')
        }

        if (!tripData.city ? .trim()) {
            errors.push('目的地城市不能为空')
        }

        if (!tripData.days || tripData.days < 1 || tripData.days > 30) {
            errors.push('行程天数必须在1-30天之间')
        }

        if (!tripData.travelers || tripData.travelers < 1 || tripData.travelers > 20) {
            errors.push('出行人数必须在1-20人之间')
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    /**
     * 计算行程统计信息
     */
    calculateTripStats(tripData) {
        if (!tripData || !Array.isArray(tripData.itinerary)) {
            return {
                totalAttractions: 0,
                totalRestaurants: 0,
                estimatedCost: 0,
                avgRating: 0
            }
        }

        let totalAttractions = 0
        let totalRestaurants = 0
        let totalCost = 0
        let totalRating = 0
        let ratedItems = 0

        tripData.itinerary.forEach(day => {
            if (day.attractions) {
                totalAttractions += day.attractions.length
                day.attractions.forEach(item => {
                    if (item.price) totalCost += item.price
                    if (item.rating) {
                        totalRating += item.rating
                        ratedItems++
                    }
                })
            }
            if (day.restaurants) {
                totalRestaurants += day.restaurants.length
                day.restaurants.forEach(item => {
                    if (item.price) totalCost += item.price
                    if (item.rating) {
                        totalRating += item.rating
                        ratedItems++
                    }
                })
            }
        })

        return {
            totalAttractions,
            totalRestaurants,
            estimatedCost: totalCost,
            avgRating: ratedItems > 0 ? (totalRating / ratedItems).toFixed(1) : 0
        }
    }
}

// 创建单例实例
export const tripService = new TripService()