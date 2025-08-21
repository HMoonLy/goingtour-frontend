/**
 * 搜索服务
 * 提供景点和餐厅的搜索功能
 */

import { http } from '@/api/request.js'

class SearchService {
    constructor() {
        this.cache = new Map()
        this.cacheTimeout = 5 * 60 * 1000 // 5分钟缓存
    }

    /**
     * 生成缓存键
     */
    generateCacheKey(type, query, options = {}) {
        return `${type}_${query}_${JSON.stringify(options)}`
    }

    /**
     * 检查缓存是否有效
     */
    isCacheValid(cacheData) {
        if (!cacheData) return false
        return Date.now() - cacheData.timestamp < this.cacheTimeout
    }

    /**
     * 获取缓存数据
     */
    getFromCache(cacheKey) {
        const cacheData = this.cache.get(cacheKey)
        if (this.isCacheValid(cacheData)) {
            return cacheData.data
        }
        this.cache.delete(cacheKey)
        return null
    }

    /**
     * 设置缓存数据
     */
    setCache(cacheKey, data) {
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        })
    }

    /**
     * 搜索景点
     * @param {string} cityName - 城市名称
     * @param {Object} options - 搜索选项
     * @param {number} options.limit - 返回数量限制
     * @param {string} options.type - 景点类型
     * @param {number} options.minRating - 最低评分
     */
    async searchAttractions(cityName, options = {}) {
        const cacheKey = this.generateCacheKey('attractions', cityName, options)

        // 检查缓存
        const cachedResult = this.getFromCache(cacheKey)
        if (cachedResult) {
            return cachedResult
        }

        try {
            // 构建查询参数
            const params = new URLSearchParams({
                city: cityName,
                type: 'attractions',
                limit: options.limit || 20,
                ...(options.type && { attractionType: options.type }),
                ...(options.minRating && { minRating: options.minRating })
            })

            const response = await http.get(`/search/attractions?${params}`)

            if (response.success) {
                const result = {
                    items: response.data || [],
                    total: response.total || 0,
                    hasMore: response.hasMore || false
                }

                // 缓存结果
                this.setCache(cacheKey, result)
                return result
            } else {
                throw new Error(response.message || '搜索失败')
            }
        } catch (error) {
            console.error('搜索景点失败:', error)

            // 返回模拟数据作为降级方案
            return this.getMockAttractions(cityName, options)
        }
    }

    /**
     * 搜索餐厅
     * @param {string} cityName - 城市名称
     * @param {Object} options - 搜索选项
     * @param {number} options.limit - 返回数量限制
     * @param {string} options.cuisine - 菜系类型
     * @param {number} options.minRating - 最低评分
     */
    async searchRestaurants(cityName, options = {}) {
        const cacheKey = this.generateCacheKey('restaurants', cityName, options)

        // 检查缓存
        const cachedResult = this.getFromCache(cacheKey)
        if (cachedResult) {
            return cachedResult
        }

        try {
            // 构建查询参数
            const params = new URLSearchParams({
                city: cityName,
                type: 'restaurants',
                limit: options.limit || 20,
                ...(options.cuisine && { cuisine: options.cuisine }),
                ...(options.minRating && { minRating: options.minRating })
            })

            const response = await http.get(`/search/restaurants?${params}`)

            if (response.success) {
                const result = {
                    items: response.data || [],
                    total: response.total || 0,
                    hasMore: response.hasMore || false
                }

                // 缓存结果
                this.setCache(cacheKey, result)
                return result
            } else {
                throw new Error(response.message || '搜索失败')
            }
        } catch (error) {
            console.error('搜索餐厅失败:', error)

            // 返回模拟数据作为降级方案
            return this.getMockRestaurants(cityName, options)
        }
    }

    /**
     * 获取模拟景点数据（降级方案）
     */
    getMockAttractions(cityName, options = {}) {
        const mockAttractions = [{
                id: 1,
                name: `${cityName}著名景点1`,
                description: '这是一个很棒的景点',
                rating: 4.5,
                price: 50,
                tags: ['历史文化', '必游景点'],
                image: '/api/placeholder/300/200',
                location: `${cityName}市中心`
            },
            {
                id: 2,
                name: `${cityName}著名景点2`,
                description: '风景优美的好地方',
                rating: 4.3,
                price: 30,
                tags: ['自然风光', '拍照打卡'],
                image: '/api/placeholder/300/200',
                location: `${cityName}风景区`
            },
            {
                id: 3,
                name: `${cityName}著名景点3`,
                description: '现代化的娱乐场所',
                rating: 4.2,
                price: 80,
                tags: ['现代建筑', '娱乐休闲'],
                image: '/api/placeholder/300/200',
                location: `${cityName}新区`
            }
        ]

        const limit = options.limit || 20
        const filteredAttractions = mockAttractions.slice(0, Math.min(limit, mockAttractions.length))

        return {
            items: filteredAttractions,
            total: filteredAttractions.length,
            hasMore: false,
            isMock: true
        }
    }

    /**
     * 获取模拟餐厅数据（降级方案）
     */
    getMockRestaurants(cityName, options = {}) {
        const mockRestaurants = [{
                id: 1,
                name: `${cityName}特色餐厅1`,
                description: '地道的本地美食',
                rating: 4.4,
                price: 120,
                cuisineType: '本地菜',
                image: '/api/placeholder/300/200',
                location: `${cityName}老城区`
            },
            {
                id: 2,
                name: `${cityName}特色餐厅2`,
                description: '精致的川菜料理',
                rating: 4.2,
                price: 150,
                cuisineType: '川菜',
                image: '/api/placeholder/300/200',
                location: `${cityName}美食街`
            },
            {
                id: 3,
                name: `${cityName}特色餐厅3`,
                description: '新鲜的海鲜料理',
                rating: 4.6,
                price: 200,
                cuisineType: '海鲜',
                image: '/api/placeholder/300/200',
                location: `${cityName}海鲜市场`
            }
        ]

        const limit = options.limit || 20
        const filteredRestaurants = mockRestaurants.slice(0, Math.min(limit, mockRestaurants.length))

        return {
            items: filteredRestaurants,
            total: filteredRestaurants.length,
            hasMore: false,
            isMock: true
        }
    }

    /**
     * 清除缓存
     */
    clearCache() {
        this.cache.clear()
    }

    /**
     * 清除过期缓存
     */
    clearExpiredCache() {
        for (const [key, value] of this.cache.entries()) {
            if (!this.isCacheValid(value)) {
                this.cache.delete(key)
            }
        }
    }
}

export const searchService = new SearchService()