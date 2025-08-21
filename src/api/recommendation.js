/**
 * 推荐相关API
 */
import request from '@/api/request.js';

export const recommendationApi = {
    /**
     * 获取景点推荐
     */
    async getAttractions(city, options = {}) {
        try {
            const response = await request({
                url: '/api/recommendations/attractions',
                method: 'get',
                params: {
                    city,
                    limit: options.limit || 12,
                    preferences: JSON.stringify(options.preferences || {})
                }
            });
            return response;
        } catch (error) {
            console.error('获取景点推荐失败:', error);
            throw error;
        }
    },

    /**
     * 获取餐厅推荐
     */
    async getRestaurants(city, options = {}) {
        try {
            const response = await request({
                url: '/api/recommendations/restaurants',
                method: 'get',
                params: {
                    city,
                    limit: options.limit || 12,
                    preferences: JSON.stringify(options.preferences || {})
                }
            });
            return response;
        } catch (error) {
            console.error('获取餐厅推荐失败:', error);
            throw error;
        }
    },

    /**
     * 搜索景点和餐厅
     */
    async search(city, searchParams) {
        try {
            const response = await request({
                url: '/api/recommendations/search',
                method: 'get',
                params: {
                    city,
                    keyword: searchParams.keyword,
                    type: searchParams.type,
                    sortBy: searchParams.sortBy
                }
            });
            return response;
        } catch (error) {
            console.error('搜索失败:', error);
            throw error;
        }
    }
};