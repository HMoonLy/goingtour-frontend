import { http } from "./request.js";

/**
 * 用户相关API接口
 */
export const userApi = {
  // ========== 认证相关 ==========

  /**
   * 发送验证码
   * @param {Object} data - {phone: string, type: string}
   */
  sendCode(data) {
    return http.post("/user/send-code", data);
  },

  /**
   * 用户注册
   * @param {Object} data - {phone: string, code: string, nickname?: string}
   */
  register(data) {
    return http.post("/user/register", data);
  },

  /**
   * 用户登录
   * @param {Object} data - {phone: string, code: string}
   */
  login(data) {
    return http.post("/user/login", data);
  },

  // ========== 用户信息管理 ==========

  /**
   * 获取用户信息
   * @param {number} userId - 用户ID
   */
  getUserInfo(userId) {
    return http.get(`/user/${userId}`);
  },

  /**
   * 获取用户偏好设置
   * @param {number} userId - 用户ID
   */
  getUserPreferences(userId) {
    return http.get(`/user/${userId}/preferences`);
  },

  /**
   * 保存用户偏好设置
   * @param {number} userId - 用户ID
   * @param {Object} data - 完整的偏好设置对象
   */
  saveUserPreferences(userId, data) {
    return http.put(`/user/${userId}/preferences`, data);
  },

  /**
   * 删除用户偏好设置
   * @param {number} userId - 用户ID
   */
  deleteUserPreferences(userId) {
    return http.delete(`/user/${userId}/preferences`);
  },

  /**
   * 重置用户偏好为默认值
   * @param {number} userId - 用户ID
   */
  resetUserPreferences(userId) {
    return http.delete(`/user/${userId}/preferences`);
  },

  /**
   * 更新用户基本信息
   * @param {number} userId - 用户ID
   * @param {Object} data - {nickname?: string, avatar?: string}
   */
  updateInfo(userId, data) {
    return http.put(`/user/${userId}/info`, data);
  },

  /**
   * 更新用户偏好设置（兼容性别名）
   * @param {number} userId - 用户ID
   * @param {Object} data - 完整的偏好设置对象
   */
  updatePreferences(userId, data) {
    return this.saveUserPreferences(userId, data);
  },

  // ========== 用户查询 ==========

  /**
   * 根据手机号查询用户
   * @param {string} phone - 手机号
   */
  getUserByPhone(phone) {
    return http.get(`/user/phone/${phone}`);
  },

  /**
   * 根据偏好查找相似用户
   * @param {string} preference - 偏好标签
   */
  getUsersByPreference(preference) {
    return http.get(`/user/preference/${preference}`);
  },

  /**
   * 根据预算范围查询用户
   * @param {number} minBudget - 最小预算
   * @param {number} maxBudget - 最大预算
   */
  getUsersByBudget(minBudget, maxBudget) {
    return http.get("/user/budget", {
      minBudget,
      maxBudget,
    });
  },

  /**
   * 获取用户统计信息
   */
  getUserStats() {
    return http.get("/user/stats");
  },
};
