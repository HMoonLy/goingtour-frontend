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
        console.log("🚀 AI推荐API - 发送请求参数:", params);

        return http.post('/ai/recommendations/personalized', params, {
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