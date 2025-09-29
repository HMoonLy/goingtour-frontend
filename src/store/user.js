import { defineStore } from "pinia";
import { getAvatarUrl } from "@/utils/media/imageUrl.js";

/**
 * 用户状态管理 Store
 * 
 * 🎯 职责：纯状态管理，不发起API请求
 * - 状态存储和持久化
 * - 状态更新方法（接收数据）
 * - 计算属性和getter
 * - 本地存储管理
 */
export const useUserStore = defineStore("user", {
    state: () => ({
        // 用户登录状态
        isLoggedIn: false,

        // 当前用户信息
        currentUser: null,

        // JWT Token信息
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,

        // 登录页重定向路径
        redirectPath: null,
    }),

    getters: {
        // 获取用户ID
        userId: (state) => state.currentUser?.id,

        // 获取用户昵称
        nickname: (state) => state.currentUser?.nickname || "未设置昵称",

        // 获取用户邮箱
        email: (state) => state.currentUser?.email,

        // 获取用户头像（规范化URL）
        avatar: (state) => {
            const rawAvatar = state.currentUser?.avatar;
            if (!rawAvatar) {
                return "/images/default-avatar.jpg";
            }
            return getAvatarUrl(rawAvatar);
        },

        // 获取用户偏好设置
        userPreferences: (state) => {
            return state.currentUser?.preferences || {};
        },

        // 检查是否有偏好设置
        hasPreferences: (state) => {
            const preferences = state.currentUser?.preferences;
            return preferences && Object.keys(preferences).length > 0;
        },

        // 获取偏好设置标签数组
        preferenceLabels: (state) => {
            const preferences = state.currentUser?.preferences;
            if (!preferences) return [];

            const labels = [];

            // 旅行类型偏好
            if (preferences.travelTypes?.length > 0) {
                labels.push(...preferences.travelTypes.map(type => `${type}旅行`));
            }

            // 预算偏好
            if (preferences.budgetRange) {
                labels.push(`预算: ${preferences.budgetRange}`);
            }

            // 季节偏好
            if (preferences.preferredSeasons?.length > 0) {
                labels.push(...preferences.preferredSeasons.map(season => `${season}出行`));
            }

            return labels;
        },

        // Token是否有效
        isTokenValid: (state) => {
            return state.accessToken &&
                state.tokenExpiry &&
                Date.now() < state.tokenExpiry;
        },
    },

    actions: {
        // ========== 状态更新方法（接收数据，不发起API） ==========

        /**
         * 设置登录状态（接收认证数据，更新状态）
         * @param {Object} authData 认证数据
         */
        setLoginState(authData) {
            this.accessToken = authData.accessToken;
            this.refreshToken = authData.refreshToken;
            this.tokenExpiry = Date.now() + authData.expiresIn;
            this.currentUser = authData.userInfo;
            this.isLoggedIn = true;

            // 持久化存储
            this.saveTokensToStorage();
            this.saveToStorage();

            return authData.userInfo;
        },

        /**
         * 设置注册状态（接收注册数据，更新状态）
         * @param {Object} authData 注册认证数据
         */
        setRegisterState(authData) {
            this.accessToken = authData.accessToken;
            this.refreshToken = authData.refreshToken;
            this.tokenExpiry = Date.now() + authData.expiresIn;
            this.currentUser = authData.userInfo;
            this.isLoggedIn = true;

            // 持久化存储
            this.saveTokensToStorage();
            this.saveToStorage();

            return authData.userInfo;
        },

        /**
         * 更新Token信息
         * @param {Object} tokenData Token数据
         */
        updateTokens(tokenData) {
            this.accessToken = tokenData.accessToken;
            this.refreshToken = tokenData.refreshToken;
            this.tokenExpiry = Date.now() + tokenData.expiresIn;

            this.saveTokensToStorage();
        },

        /**
         * 更新用户信息（接收数据，更新状态）
         * @param {Object} userInfo 用户信息
         */
        updateUserInfo(userInfo) {
            if (this.currentUser) {
                this.currentUser = {...this.currentUser, ...userInfo };
                this.saveToStorage();
            }
        },

        /**
         * 设置用户偏好（接收偏好数据，更新状态）
         * @param {Object} preferences 偏好设置
         */
        setUserPreferences(preferences) {
            if (this.currentUser) {
                this.currentUser.preferences = preferences;
                this.saveToStorage();
            }
        },

        /**
         * 清除登录状态
         */
        logout() {
            this.isLoggedIn = false;
            this.currentUser = null;
            this.accessToken = null;
            this.refreshToken = null;
            this.tokenExpiry = null;
            this.redirectPath = null;

            this.clearStorage();
        },

        /**
         * 清除认证状态（保留其他数据）
         */
        clearAuthState() {
            this.isLoggedIn = false;
            this.accessToken = null;
            this.refreshToken = null;
            this.tokenExpiry = null;

            this.clearTokensFromStorage();
        },

        // ========== 重定向路径管理 ==========
        /**
         * 设置重定向路径
         * @param {string} path 路径
         */
        setRedirectPath(path) {
            this.redirectPath = path;
        },

        /**
         * 获取并清除重定向路径
         */
        getAndClearRedirectPath() {
            const path = this.redirectPath;
            this.redirectPath = null;
            return path;
        },

        // ========== 本地存储管理 ==========
        /**
         * 保存用户状态到本地存储
         */
        saveToStorage() {
            try {
                const userData = {
                    isLoggedIn: this.isLoggedIn,
                    currentUser: this.currentUser,
                };
                localStorage.setItem("goingtour_user", JSON.stringify(userData));
            } catch (error) {
                console.error("保存用户状态失败:", error);
            }
        },

        /**
         * 保存Token到本地存储
         */
        saveTokensToStorage() {
            try {
                if (this.accessToken) {
                    localStorage.setItem("goingtour_token", this.accessToken);
                }
                if (this.refreshToken) {
                    localStorage.setItem("goingtour_refresh_token", this.refreshToken);
                }
                if (this.tokenExpiry) {
                    localStorage.setItem("goingtour_token_expiry", this.tokenExpiry.toString());
                }
            } catch (error) {
                console.error("保存Token失败:", error);
            }
        },

        /**
         * 从本地存储加载用户状态
         */
        loadFromStorage() {
            try {
                // 加载用户数据
                const userData = localStorage.getItem("goingtour_user");
                if (userData) {
                    const parsed = JSON.parse(userData);
                    this.isLoggedIn = parsed.isLoggedIn || false;
                    this.currentUser = parsed.currentUser || null;
                }

                // 加载Token数据
                this.accessToken = localStorage.getItem("goingtour_token");
                this.refreshToken = localStorage.getItem("goingtour_refresh_token");
                const tokenExpiry = localStorage.getItem("goingtour_token_expiry");
                this.tokenExpiry = tokenExpiry?parseInt(tokenExpiry) : null;

                // 验证Token有效性
                if (!this.isTokenValid) {
                    this.clearAuthState();
                }
            } catch (error) {
                console.error("加载用户状态失败:", error);
                this.clearStorage();
            }
        },

        /**
         * 清除本地存储
         */
        clearStorage() {
            try {
                localStorage.removeItem("goingtour_user");
                this.clearTokensFromStorage();
            } catch (error) {
                console.error("清除存储失败:", error);
            }
        },

        /**
         * 清除Token存储
         */
        clearTokensFromStorage() {
            try {
                localStorage.removeItem("goingtour_token");
                localStorage.removeItem("goingtour_refresh_token");
                localStorage.removeItem("goingtour_token_expiry");
            } catch (error) {
                console.error("清除Token存储失败:", error);
            }
        },
    },
});