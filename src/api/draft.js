/**
 * 行程草稿相关API接口
 */
import { http } from "./request.js";

export const draftApi = {
  /**
   * 获取用户所有草稿列表
   * @param {number} userId - 用户ID
   * @returns {Promise} 草稿列表
   */
  getUserDrafts(userId) {
    return http.get(`/drafts/user/${userId}`);
  },

  /**
   * 获取特定草稿详情
   * @param {number} draftId - 草稿ID  
   * @param {number} userId - 用户ID
   * @returns {Promise} 草稿详情
   */
  getDraft(draftId, userId) {
    return http.get(`/drafts/${draftId}?userId=${userId}`);
  },

  /**
   * 创建新草稿
   * @param {Object} draftData - 草稿数据 (包含userId)
   * @returns {Promise} 创建结果
   */
  createDraft(draftData) {
    const { userId, ...requestBody } = draftData;
    return http.post("/drafts", requestBody, { params: { userId } });
  },

  /**
   * 更新草稿
   * @param {number} draftId - 草稿ID
   * @param {Object} draftData - 草稿数据 (包含userId)
   * @returns {Promise} 更新结果
   */
  updateDraft(draftId, draftData) {
    const { userId, ...requestBody } = draftData;
    return http.put(`/drafts/${draftId}`, requestBody, { params: { userId } });
  },

  /**
   * 删除草稿
   * @param {number} draftId - 草稿ID
   * @param {number} userId - 用户ID
   * @returns {Promise} 删除结果
   */
  deleteDraft(draftId, userId) {
    return http.delete(`/drafts/${draftId}`, { params: { userId } });
  },

  /**
   * 重命名草稿
   * @param {number} draftId - 草稿ID
   * @param {string} newName - 新名称
   * @param {number} userId - 用户ID
   * @returns {Promise} 重命名结果
   */
  renameDraft(draftId, newName, userId) {
    return http.put(
      `/drafts/${draftId}/rename`,
      {
        name: newName,
      },
      { params: { userId } },
    );
  },

  /**
   * 复制草稿
   * @param {number} draftId - 源草稿ID
   * @param {string} newName - 新草稿名称
   * @param {number} userId - 用户ID
   * @returns {Promise} 复制结果
   */
  copyDraft(draftId, newName, userId) {
    return http.post(
      `/drafts/${draftId}/copy`,
      {},
      { params: { userId, newName } },
    );
  },

  /**
   * 获取或创建自动草稿
   * 如果用户已有自动草稿则返回，否则创建新的
   * @param {number} userId - 用户ID
   * @param {Object} draftData - 草稿数据
   * @returns {Promise} 自动草稿
   */
  getOrCreateAutoDraft(userId, draftData) {
    return http.post("/drafts/auto", draftData, { params: { userId } });
  },

  /**
   * 更新自动草稿
   * @param {number} userId - 用户ID
   * @param {Object} draftData - 草稿数据
   * @returns {Promise} 更新结果
   */
  updateAutoDraft(userId, draftData) {
    return http.put("/drafts/auto", draftData, { params: { userId } });
  },

  /**
   * 获取草稿统计信息
   * @param {number} userId - 用户ID
   * @returns {Promise} 统计信息
   */
  getDraftStats(userId) {
    return http.get(`/drafts/user/${userId}/stats`);
  },

  /**
   * 批量删除草稿
   * @param {Array} draftIds - 草稿ID数组
   * @param {number} userId - 用户ID
   * @returns {Promise} 删除结果
   */
  batchDeleteDrafts(draftIds, userId) {
    return http.delete("/drafts/batch", {
      params: { userId },
      data: { draftIds },
    });
  },

  /**
   * 清理过期草稿
   * @param {number} userId - 用户ID
   * @returns {Promise} 清理结果
   */
  cleanupExpiredDrafts(userId) {
    return http.post(`/drafts/user/${userId}/cleanup`);
  },
};
