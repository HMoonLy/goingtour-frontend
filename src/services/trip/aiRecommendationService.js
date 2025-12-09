/**
 * AI推荐服务 - 精简版
 * 专注于核心推荐逻辑，移除冗余功能
 */

import { aiRecommendationApi } from '@/api/aiRecommendation.js'

class AiRecommendationService {
    constructor() {
        this.cache = new Map()
        this.cacheTimeout = 10 * 60 * 1000 // 10分钟缓存
    }

    // ==================== 缓存管理 ====================
    _generateCacheKey(params) {
        const key = JSON.stringify({
            city: params.baseInfo?.city,
            days: params.baseInfo?.days,
            budget: params.baseInfo?.budget,
            travelers: params.baseInfo?.travelers,
            preferences: params.preferences
        })
        return `ai_recommendations_${btoa(key).slice(0, 16)}`
    }

    _getFromCache(cacheKey) {
        const cached = this.cache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data
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

    clearCache() {
        this.cache.clear()
    }

    // ==================== 数据处理 ====================
    parseBudget(budgetStr) {
        if (!budgetStr) return null
        const numbers = budgetStr.match(/\d+/g)
        if (!numbers || numbers.length === 0) return null
        if (numbers.length === 1) return parseInt(numbers[0])
        const min = parseInt(numbers[0])
        const max = parseInt(numbers[1])
        return Math.round((min + max) / 2)
    }

    formatRecommendations(rawData) {
        if (!rawData?.data) {
            return {
                attractions: [],
                restaurants: [],
                reasoning: '暂无推荐数据',
                stats: { total: 0, ai: 0, confidence: 0 }
            }
        }

        const { attractions = [], restaurants = [], reasoning = '', stats = {} } = rawData.data

        return {
            attractions: attractions.map(item => ({
                id: item.id || item.name,
                name: item.name,
                description: item.description || '',
                rating: item.rating || 0,
                price: item.price || 0,
                tags: item.tags || [],
                image: item.image || '/api/placeholder/300/200',
                location: item.location || '',
                confidence: item.confidence || 0.8,
                reasoning: item.reason || item.reasoning || '',
                isAiRecommended: true,
                coordinates: item.coordinates || null
            })),
            restaurants: restaurants.map(item => ({
                id: item.id || item.name,
                name: item.name,
                description: item.description || '',
                rating: item.rating || 0,
                price: item.price || 0,
                tags: item.tags || [],
                image: item.image || '/api/placeholder/300/200',
                location: item.location || '',
                confidence: item.confidence || 0.8,
                reasoning: item.reason || item.reasoning || '',
                isAiRecommended: true,
                coordinates: item.coordinates || null
            })),
            reasoning,
            stats: {
                total: (attractions.length + restaurants.length),
                ai: (attractions.length + restaurants.length),
                confidence: stats.confidence || 0.8,
                attractions: attractions.length,
                restaurants: restaurants.length
            },
            timestamp: Date.now()
        }
    }

    // ==================== 核心API方法 ====================

    /**
     * 获取AI推荐
     */
    async getRecommendations(params, useCache = true) {
        try {
            const cacheKey = this._generateCacheKey(params)

            if (useCache) {
                const cached = this._getFromCache(cacheKey)
                if (cached) {
                    return { success: true, data: cached }
                }
            }

            // 调用API
            const response = await aiRecommendationApi.getRecommendations(params)

            if (response?.data) {
                const formatted = this.formatRecommendations(response)

                if (useCache) {
                    this._setCache(cacheKey, formatted)
                }

                return { success: true, data: formatted }
            }

            return { success: false, message: '获取推荐失败' }

        } catch (error) {
            console.error('获取AI推荐失败:', error)

            // 返回降级数据
            return {
                success: false,
                data: this._getFallbackRecommendations(params),
                message: '使用默认推荐数据',
                isFallback: true
            }
        }
    }

    /**
     * 预加载推荐数据
     */
    async preloadRecommendations(params) {
        try {
            return await this.getRecommendations(params, true)
        } catch (error) {
            console.warn('预加载推荐数据失败:', error)
            return { success: false, message: error.message }
        }
    }

    /**
     * 过滤推荐结果
     */
    filterRecommendations(recommendations, filters) {
        if (!recommendations || !filters) {
            return recommendations
        }

        const { priceRange, minRating, attractionTypes, cuisineTypes, aiPriority } = filters

        const filterItems = (items) => {
            return items.filter(item => {
                // 价格过滤
                if (priceRange && (item.price < priceRange[0] || item.price > priceRange[1])) {
                    return false
                }

                // 评分过滤
                if (minRating && item.rating < minRating) {
                    return false
                }

                // AI优先级过滤
                if (aiPriority === 'ai_only' && !item.isAiRecommended) {
                    return false
                }
                if (aiPriority === 'regular_only' && item.isAiRecommended) {
                    return false
                }

                return true
            })
        }

        return {
            ...recommendations,
            attractions: filterItems(recommendations.attractions || []),
            restaurants: filterItems(recommendations.restaurants || [])
        }
    }

    /**
     * 获取降级推荐数据
     */
    _getFallbackRecommendations(params) {
        const cityName = params.baseInfo?.city || '目的地'

        return {
            attractions: [{
                id: 'fallback_1',
                name: `${cityName}热门景点`,
                description: '当地知名旅游景点',
                rating: 4.5,
                price: 50,
                tags: ['热门', '必游'],
                image: '/api/placeholder/300/200',
                location: cityName,
                confidence: 0.7,
                reasoning: '系统推荐的热门景点',
                isAiRecommended: false
            }],
            restaurants: [{
                id: 'fallback_2',
                name: `${cityName}特色餐厅`,
                description: '当地特色美食',
                rating: 4.3,
                price: 80,
                tags: ['特色', '美食'],
                image: '/api/placeholder/300/200',
                location: cityName,
                confidence: 0.7,
                reasoning: '系统推荐的特色餐厅',
                isAiRecommended: false
            }],
            reasoning: '当前使用默认推荐数据，建议稍后重试获取个性化推荐',
            stats: { total: 2, ai: 0, confidence: 0.7, attractions: 1, restaurants: 1 },
            isFallback: true,
            timestamp: Date.now()
        }
    }

    /**
     * 验证推荐参数
     */
    validateParams(params) {
        const errors = []

        if (!params.baseInfo?.city) {
            errors.push('目的地城市不能为空')
        }

        if (!params.baseInfo?.days || params.baseInfo.days < 1) {
            errors.push('行程天数必须大于0')
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }
}

// 创建单例实例
export const aiRecommendationService = new AiRecommendationService()