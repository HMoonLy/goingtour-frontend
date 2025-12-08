/**
 * 行程业务服务 - 优化版
 * 使用统一的缓存管理和错误处理
 */
import { tripApi } from '@/api/trip.js'
import {
    convertBackendTripToFrontend,
    convertFrontendTripToBackend
} from '@/utils/data/tripDataConverter.js'
import { BaseService } from '../common/baseService.js'

class TripService extends BaseService {
    constructor() {
        super('TripService')

        // 使用基类方法创建带缓存的API请求函数
        this.getUserTripsWithCache = this.createCachedMethod(
            this._getUserTripsFromApi, { cacheKey: 'user_trips', ttl: 5 * 60 * 1000 }
        )

        this.getTripDetailWithCache = this.createCachedMethod(
            this._getTripDetailFromApi, { ttl: 5 * 60 * 1000 }
        )
    }

    // ==================== 业务专用缓存管理 ====================
    /**
     * 清除用户相关的行程缓存
     * @param {string} userId - 用户ID
     */
    clearUserCache(userId) {
        this.clearCache(`user_trips_${userId}`)
        this.clearCache(`trip_detail`)
    }

    /**
     * 清除行程详情缓存
     * @param {string} tripId - 行程ID
     */
    clearTripDetailCache(tripId) {
        this.clearCache(`trip_detail_${tripId}`)
    }

    // ==================== 业务逻辑方法 ====================

    /**
     * 获取用户行程列表（使用统一缓存和错误处理）
     */
    async getUserTrips(userId, useCache = true) {
        if (!userId) {
            throw new Error('用户ID不能为空')
        }

        // 使用基类的错误处理方法
        return await this.withErrorHandling(
            async() => {
                if (useCache) {
                    return await this.getUserTripsWithCache(userId)
                } else {
                    return await this._getUserTripsFromApi(userId)
                }
            },
            '获取用户行程失败'
        )
    }

    /**
     * 内部方法：从API获取用户行程（不带缓存）
     */
    async _getUserTripsFromApi(userId) {
        const response = await tripApi.getUserTrips(userId)
        if (response && response.data) {
            // 转换后端数据格式
            return response.data
                .map(trip => convertBackendTripToFrontend(trip))
                .filter(Boolean)
        }
        return []
    }

    /**
     * 获取行程详情（使用统一缓存和错误处理）
     */
    async getTripDetail(tripId, userId) {
        if (!tripId || !userId) {
            throw new Error('行程ID和用户ID不能为空')
        }

        // 使用基类的错误处理方法
        return await this.withErrorHandling(
            async() => {
                return await this.getTripDetailWithCache(tripId, userId)
            },
            '获取行程详情失败'
        )
    }

    /**
     * 内部方法：从API获取行程详情（不带缓存）
     */
    async _getTripDetailFromApi(tripId, userId) {
        const response = await tripApi.getTripDetail(tripId, userId)
        if (response && response.data) {
            const convertedTrip = convertBackendTripToFrontend(response.data)
            if (convertedTrip) {
                return convertedTrip
            }
        }
        return null
    }

    /**
     * 创建行程（使用统一错误处理和缓存清理）
     */
    async createTrip(userId, tripData) {
        if (!userId || !tripData ? .title || !tripData ? .city) {
            throw new Error('用户ID、行程标题和目的地不能为空')
        }

        // 使用基类的错误处理方法
        return await this.withErrorHandling(
            async() => {
                // 转换前端数据格式为后端格式
                const backendTripData = convertFrontendTripToBackend(tripData)
                const response = await tripApi.createTrip(userId, backendTripData)

                if (response && response.data) {
                    const convertedTrip = convertBackendTripToFrontend(response.data)

                    // 清除相关缓存
                    this.clearUserCache(userId)
                    this.clearTripDetailCache(response.data.id)

                    return convertedTrip
                }
                return null
            },
            '创建行程失败'
        )
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