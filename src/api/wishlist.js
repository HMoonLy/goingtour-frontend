/**
 * 愿望清单相关API接口
 */
import { http } from "./request.js";

export const wishlistApi = {
    /**
     * 获取用户的愿望清单
     * @param {number} userId - 用户ID
     * @returns {Promise} 愿望清单列表
     */
    getUserWishlist(userId) {
        return http.get(`/wishlist/user/${userId}`);
    },

    /**
     * 添加城市到愿望清单
     * @param {Object} wishData - 愿望数据
     * @param {number} wishData.userId - 用户ID
     * @param {string} wishData.adcode - 城市编码
     * @param {string} wishData.cityName - 城市名称
     * @param {string} wishData.reason - 想去的原因(可选)
     * @param {Array} wishData.tags - 标签(可选)
     * @returns {Promise} 创建结果
     */
    addToWishlist(wishData) {
        return http.post("/wishlist", wishData);
    },

    /**
     * 从愿望清单删除城市
     * @param {number} wishlistId - 愿望清单项ID
     * @param {number} userId - 用户ID
     * @returns {Promise} 删除结果
     */
    removeFromWishlist(wishlistId, userId) {
        return http.delete(`/wishlist/${wishlistId}`, { params: { userId } });
    },

    /**
     * 更新愿望清单项
     * @param {number} wishlistId - 愿望清单项ID
     * @param {Object} updateData - 更新数据
     * @param {number} updateData.userId - 用户ID
     * @param {string} updateData.reason - 想去的原因
     * @param {Array} updateData.tags - 标签
     * @returns {Promise} 更新结果
     */
    updateWishlistItem(wishlistId, updateData) {
        const { userId, ...requestBody } = updateData;
        return http.put(`/wishlist/${wishlistId}`, requestBody, {
            params: { userId },
        });
    },

    /**
     * 检查城市是否在愿望清单中
     * @param {number} userId - 用户ID
     * @param {string} adcode - 城市编码
     * @returns {Promise} 是否存在
     */
    checkCityInWishlist(userId, adcode) {
        return http.get(`/wishlist/check`, {
            params: { userId, adcode },
        });
    },

    /**
     * 获取愿望清单统计信息
     * @param {number} userId - 用户ID
     * @returns {Promise} 统计信息
     */
    getWishlistStats(userId) {
        return http.get(`/wishlist/user/${userId}/stats`);
    },

    /**
     * 批量添加推荐城市到愿望清单
     * @param {number} userId - 用户ID
     * @param {Array} cities - 城市列表
     * @returns {Promise} 批量添加结果
     */
    batchAddRecommendations(userId, cities) {
        return http.post("/wishlist/batch", {
            userId,
            cities,
        });
    },
};