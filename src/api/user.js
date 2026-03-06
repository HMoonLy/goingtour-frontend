import { http } from "./request.js";

/**
 * 用户相关API接口
 */
export const userApi = {
    // ========== 认证相关 ==========

    /**
     * 发送验证码
     * @param {Object} data - {email: string, type: string}
     */
    sendCode(data) {
        return http.post("/user/send-code", data);
    },

    /**
     * 用户注册
     * @param {Object} data - {email: string, code: string, nickname?: string}
     */
    register(data) {
        return http.post("/user/register", data);
    },

    /**
     * 用户登录
     * @param {Object} data - {email: string, code: string}
     */
    login(data) {
        return http.post("/user/login", data);
    },

    /**
     * 管理员账号密码登录
     * @param {Object} data - {account: string, password: string}
     */
    adminLogin(data) {
        return http.post("/user/admin-login", data);
    },

    /**
     * 刷新访问令牌
     * @param {string} refreshToken - 刷新令牌
     */
    refreshToken(refreshToken) {
        return http.post("/user/refresh-token", { refreshToken });
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
     * 获取用户公开主页信息（包含社交状态）
     * @param {number} userId - 用户ID
     */
    getUserProfile(userId) {
        return http.get(`/user/profile/${userId}`);
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
     * 上传头像
     * @param {number} userId - 用户ID
     * @param {File} file - 头像文件
     */
    uploadAvatar(userId, file) {
        const formData = new FormData();
        formData.append("file", file);
        return http.upload(`/user/${userId}/avatar`, formData);
    },

    /**
     * 获取头像访问URL（用于OSS私有存储的签名URL）
     * @param {number} userId - 用户ID
     */
    getAvatarUrl(userId) {
        return http.get(`/user/${userId}/avatar-url`);
    },

    /**
     * 更新用户偏好设置（兼容性别名）
     * @param {number} userId - 用户ID
     * @param {Object} data - 完整的偏好设置对象
     */
    updatePreferences(userId, data) {
        return this.saveUserPreferences(userId, data);
    },


    // ========== 账户设置 ==========

    /**
     * 设置密码
     * @param {number} userId - 用户ID
     * @param {Object} data - {password: string, confirmPassword: string}
     */
    setPassword(userId, data) {
        return http.post(`/user/${userId}/password`, data);
    },

    /**
     * 修改密码
     * @param {number} userId - 用户ID
     * @param {Object} data - {currentPassword: string, newPassword: string, confirmPassword: string}
     */
    changePassword(userId, data) {
        return http.put(`/user/${userId}/password`, data);
    },

    /**
     * 清除密码
     * @param {number} userId - 用户ID
     */
    clearPassword(userId) {
        return http.delete(`/user/${userId}/password`);
    },

    /**
     * 导出用户数据
     * @param {number} userId - 用户ID
     */
    exportUserData(userId) {
        return http.get(`/user/${userId}/export`);
    },

    /**
     * 注销账户
     * @param {number} userId - 用户ID
     * @param {Object} data - {email: string, confirmText: string}
     */
    deleteAccount(userId, data) {
        return http.delete(`/user/${userId}/account`, { data });
    },

    // ========== 登录记录 ========== 
    // 注意：登录记录相关功能当前未使用，已清理
};
