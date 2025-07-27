import { http } from './request.js'

/**
 * 行程相关API接口
 */
export const tripApi = {

    // ========== 行程CRUD ==========

    /**
     * 获取用户行程列表
     * @param {number} userId - 用户ID
     */
    getUserTrips(userId) {
        return http.get(`/trips/user/${userId}`)
    },

    /**
     * 获取行程详情
     * @param {number} tripId - 行程ID
     * @param {number} userId - 用户ID
     */
    getTripDetail(tripId, userId) {
        return http.get(`/trips/${tripId}?userId=${userId}`)
    },

    /**
     * 创建行程
     * @param {number} userId - 用户ID
     * @param {Object} data - 行程数据
     */
    createTrip(userId, data) {
        return http.post(`/trips?userId=${userId}`, data)
    },

    /**
     * 更新行程信息
     * @param {number} tripId - 行程ID
     * @param {number} userId - 用户ID
     * @param {Object} data - 更新数据
     */
    updateTrip(tripId, userId, data) {
        return http.put(`/trips/${tripId}?userId=${userId}`, data)
    },

    /**
     * 删除行程
     * @param {number} tripId - 行程ID
     * @param {number} userId - 用户ID
     */
    deleteTrip(tripId, userId) {
        return http.delete(`/trips/${tripId}?userId=${userId}`)
    },

    /**
     * 复制行程
     * @param {number} tripId - 行程ID
     * @param {number} userId - 用户ID
     * @param {string} newTitle - 新标题
     */
    duplicateTrip(tripId, userId, newTitle) {
        return http.post(`/trips/${tripId}/duplicate?userId=${userId}&newTitle=${encodeURIComponent(newTitle)}`)
    },

    /**
     * 更新行程状态
     * @param {number} tripId - 行程ID
     * @param {number} userId - 用户ID
     * @param {number} status - 状态值
     */
    updateTripStatus(tripId, userId, status) {
        return http.patch(`/trips/${tripId}/status?userId=${userId}&status=${status}`)
    },

    // ========== 行程详情管理 ==========

    /**
     * 获取行程详细安排
     * @param {number} tripId - 行程ID
     */
    getTripDetails(tripId) {
        return http.get(`/trip/${tripId}/details`)
    },

    /**
     * 添加行程项目
     * @param {number} tripId - 行程ID
     * @param {Object} data - {day: number, timeSlot: string, attractionId?: number, restaurantId?: number, duration?: number, notes?: string}
     */
    addTripItem(tripId, data) {
        return http.post(`/trip/${tripId}/items`, data)
    },

    /**
     * 更新行程项目
     * @param {number} itemId - 项目ID
     * @param {Object} data - 更新数据
     */
    updateTripItem(itemId, data) {
        return http.put(`/trip/item/${itemId}`, data)
    },

    /**
     * 删除行程项目
     * @param {number} itemId - 项目ID
     */
    deleteTripItem(itemId) {
        return http.delete(`/trip/item/${itemId}`)
    },

    // ========== 行程分享 ==========

    /**
     * 生成分享码
     * @param {number} tripId - 行程ID
     * @param {number} userId - 用户ID
     */
    generateShareCode(tripId, userId) {
        return http.post(`/trips/${tripId}/share?userId=${userId}`)
    },

    /**
     * 通过分享码获取行程
     * @param {string} shareCode - 分享码
     */
    getTripByShareCode(shareCode) {
        return http.get(`/trips/share/${shareCode}`)
    },

    /**
     * 统计用户行程数量
     * @param {number} userId - 用户ID
     */
    countUserTrips(userId) {
        return http.get(`/trips/user/${userId}/count`)
    },

    // ========== 协作功能 ==========

    /**
     * 添加协作者
     * @param {number} tripId - 行程ID
     * @param {Object} data - {phone: string, role: string}
     */
    addCollaborator(tripId, data) {
        return http.post(`/trip/${tripId}/collaborators`, data)
    },

    /**
     * 获取协作者列表
     * @param {number} tripId - 行程ID
     */
    getCollaborators(tripId) {
        return http.get(`/trip/${tripId}/collaborators`)
    },

    /**
     * 移除协作者
     * @param {number} tripId - 行程ID
     * @param {number} collaboratorId - 协作者ID
     */
    removeCollaborator(tripId, collaboratorId) {
        return http.delete(`/trip/${tripId}/collaborators/${collaboratorId}`)
    }
}