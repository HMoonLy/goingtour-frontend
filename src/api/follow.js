import { http } from "./request.js";

/**
 * 关注/社交关系 API
 */
export const followApi = {
  /**
   * 关注用户
   * @param {number} targetUserId 目标用户ID
   */
  followUser(targetUserId) {
    return http.post(`/follow/${targetUserId}`);
  },

  /**
   * 取消关注
   * @param {number} targetUserId 目标用户ID
   */
  unfollowUser(targetUserId) {
    return http.delete(`/follow/${targetUserId}`);
  },

  /**
   * 获取关注状态
   * @param {number} targetUserId 目标用户ID
   * @returns {Promise<{isFollowing: boolean, isFollower: boolean}>}
   */
  getFollowStatus(targetUserId) {
    return http.get(`/follow/status/${targetUserId}`);
  },

  /**
   * 获取关注列表
   * @param {number} userId 用户ID
   * @param {Object} params 分页参数 { page, pageSize }
   */
  getFollowings(userId, params = {}) {
    return http.get(`/follow/followings/${userId}`, params);
  },

  /**
   * 获取粉丝列表
   * @param {number} userId 用户ID
   * @param {Object} params 分页参数 { page, pageSize }
   */
  getFollowers(userId, params = {}) {
    return http.get(`/follow/followers/${userId}`, params);
  },

  /**
   * 获取互关列表
   * @param {number} userId 用户ID
   * @param {Object} params 分页参数 { page, pageSize }
   */
  getMutualFollows(userId, params = {}) {
    return http.get(`/follow/mutual/${userId}`, params);
  }
};

