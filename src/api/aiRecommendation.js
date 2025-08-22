/**
 * AI推荐相关API接口
 */

import { http } from "./request.js";

export const aiRecommendationApi = {
    /**
     * 获取AI个性化推荐
     * @param {Object} params - 推荐参数
     * @param {Object} params.baseInfo - 基础行程信息
     * @param {Object} params.preferences - 用户偏好
     * @param {Object} params.userProfile - 用户画像（可选）
     */
    getPersonalizedRecommendations(params) {
        // 解析预算字符串为数字（兼容后端期望的Integer类型）
        const parseBudget = (budgetStr) => {
            if (!budgetStr) return null;
            // 提取数字，例如 "3000-5000元" -> 4000 (取中间值)
            const numbers = budgetStr.match(/\d+/g);
            if (!numbers || numbers.length === 0) return null;
            if (numbers.length === 1) return parseInt(numbers[0]);
            // 如果是范围，取中间值
            const min = parseInt(numbers[0]);
            const max = parseInt(numbers[1]);
            return Math.round((min + max) / 2);
        };

        return http.post('/ai/recommendations/personalized', {
            // 基础行程信息 - 对齐后端期望的字段名和类型
            destination: params.baseInfo?.destination || params.baseInfo?.destinationName, // 后端期望destination为目的地代码
            destinationName: params.baseInfo?.destinationName, // 目的地名称
            destinationCode: params.baseInfo?.destination, // 目的地代码
            days: params.baseInfo?.days,
            travelers: params.baseInfo?.travelers,
            budget: parseBudget(params.baseInfo?.budget), // 转换为Integer类型
            budgetString: params.baseInfo?.budget, // 保留原始字符串格式
            startDate: params.baseInfo?.dateRange?.[0],
            endDate: params.baseInfo?.dateRange?.[1],

            // 用户偏好 - 对齐后端期望的字段名
            travelStyle: params.preferences?.travelPurpose, // 后端期望travelStyle而不是travelPurpose
            travelPurpose: params.preferences?.travelPurpose, // 保留原字段用于兼容
            interests: params.preferences?.interests || [],
            budgetPreference: params.preferences?.budgetPreference,
            accommodationType: params.preferences?.accommodationLevel, // 住宿类型
            accommodationLevel: params.preferences?.accommodationLevel, // 保留原字段
            transportationMode: params.preferences?.transportationMode,
            pacePreference: params.preferences?.pacePreference,
            socialPreference: params.preferences?.socialPreference,
            photoPreference: params.preferences?.photoPreference,
            focusAreas: params.preferences?.focusAreas || [],
            specialRequirements: params.preferences?.specialRequirements,
            dietaryRestrictions: params.preferences?.dietaryRestrictions || [],
            customDietaryNotes: params.preferences?.customDietaryNotes,

            // 用户画像（历史行为数据）
            userProfile: params.userProfile || {},

            // 请求配置
            maxAttractions: params.maxAttractions || 15,
            maxRestaurants: params.maxRestaurants || 10,
            includeReasonings: true,
            includeConfidenceScores: true
        }, {
            timeout: 300000 // AI推荐需要更长的超时时间：5分钟
        });
    },

    /**
     * 预加载AI推荐（异步，不阻塞UI）
     * @param {Object} params - 推荐参数
     */
    preloadRecommendations(params) {
        return http.post('/ai/recommendations/preload', {
            ...params,
            priority: 'background'
        });
    },

    /**
     * 获取推荐理由详情
     * @param {string} recommendationId - 推荐ID
     */
    getRecommendationReasoning(recommendationId) {
        return http.get(`/ai/recommendations/${recommendationId}/reasoning`);
    },

    /**
     * 反馈推荐质量
     * @param {string} recommendationId - 推荐ID
     * @param {Object} feedback - 反馈数据
     */
    submitRecommendationFeedback(recommendationId, feedback) {
        return http.post(`/ai/recommendations/${recommendationId}/feedback`, feedback);
    },

    /**
     * 刷新推荐
     * @param {Object} params - 推荐参数
     * @param {Array} excludeIds - 要排除的项目ID列表
     */
    refreshRecommendations(params, excludeIds = []) {
        return http.post('/ai/recommendations/refresh', {
            ...params,
            excludeIds
        });
    },

    /**
     * 获取推荐统计信息
     * @param {string} sessionId - 会话ID
     */
    getRecommendationStats(sessionId) {
        return http.get(`/ai/recommendations/stats/${sessionId}`);
    }
};

/**
 * AI推荐数据处理工具
 */
export const aiRecommendationUtils = {
    /**
     * 格式化推荐数据
     * @param {Object} rawData - 原始推荐数据
     */
    formatRecommendations(rawData) {
        if (!rawData || !rawData.data) {
            return {
                attractions: [],
                restaurants: [],
                reasoning: '暂无推荐数据',
                stats: { total: 0, ai: 0, confidence: 0 }
            };
        }

        const { attractions = [], restaurants = [], reasoning = '', stats = {} } = rawData.data;

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
                reasoning: item.reasoning || '',
                isAiRecommended: true,
                recommendationScore: item.recommendationScore || 0,
                matchedPreferences: item.matchedPreferences || [],
                estimatedDuration: item.estimatedDuration || '2-3小时',
                bestTimeToVisit: item.bestTimeToVisit || '全天',
                coordinates: item.coordinates || null
            })),
            restaurants: restaurants.map(item => ({
                id: item.id || item.name,
                name: item.name,
                description: item.description || '',
                rating: item.rating || 0,
                price: item.price || 0,
                cuisineType: item.cuisineType || '综合',
                image: item.image || '/api/placeholder/300/200',
                location: item.location || '',
                confidence: item.confidence || 0.8,
                reasoning: item.reasoning || '',
                isAiRecommended: true,
                recommendationScore: item.recommendationScore || 0,
                matchedPreferences: item.matchedPreferences || [],
                signature_dishes: item.signature_dishes || [],
                priceRange: item.priceRange || '中等消费',
                coordinates: item.coordinates || null
            })),
            reasoning: reasoning || '基于您的偏好和行程安排，AI为您精选了这些推荐',
            stats: {
                total: (attractions.length || 0) + (restaurants.length || 0),
                attractions: attractions.length || 0,
                restaurants: restaurants.length || 0,
                ai: stats.aiRecommendedCount || 0,
                confidence: stats.averageConfidence || 0.8
            },
            sessionId: rawData.sessionId,
            generatedAt: rawData.generatedAt || new Date().toISOString()
        };
    },

    /**
     * 检查推荐数据是否有效
     * @param {Object} recommendations - 推荐数据
     */
    isValidRecommendations(recommendations) {
        return recommendations &&
            (recommendations.attractions?.length > 0 || recommendations.restaurants?.length > 0);
    },

    /**
     * 合并多个推荐源的数据
     * @param {Array} sources - 推荐数据源数组
     */
    mergeRecommendationSources(sources) {
        const merged = {
            attractions: [],
            restaurants: [],
            reasoning: '',
            stats: { total: 0, ai: 0, confidence: 0 }
        };

        sources.forEach(source => {
            if (source.attractions) {
                merged.attractions.push(...source.attractions);
            }
            if (source.restaurants) {
                merged.restaurants.push(...source.restaurants);
            }
        });

        // 去重（基于名称）
        merged.attractions = this.deduplicateByName(merged.attractions);
        merged.restaurants = this.deduplicateByName(merged.restaurants);

        // 更新统计
        merged.stats.total = merged.attractions.length + merged.restaurants.length;
        merged.stats.attractions = merged.attractions.length;
        merged.stats.restaurants = merged.restaurants.length;
        merged.stats.ai = merged.attractions.filter(a => a.isAiRecommended).length +
            merged.restaurants.filter(r => r.isAiRecommended).length;

        return merged;
    },

    /**
     * 根据名称去重
     * @param {Array} items - 项目数组
     */
    deduplicateByName(items) {
        const seen = new Set();
        return items.filter(item => {
            if (seen.has(item.name)) {
                return false;
            }
            seen.add(item.name);
            return true;
        });
    },

    /**
     * 按推荐分数排序
     * @param {Array} items - 项目数组
     */
    sortByRecommendationScore(items) {
        return [...items].sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0));
    }
};