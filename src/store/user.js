import { defineStore } from "pinia";
import { userApi } from "../api/user";
import { ElMessage } from "element-plus";

export const useUserStore = defineStore("user", {
    state: () => ({
        // 用户登录状态
        isLoggedIn: false,

        // 当前用户信息
        currentUser: null,

        // 用户偏好设置
        userPreferences: {
            tags: [],
            budget: 500,
        },

        // Token信息（如果后期需要JWT）
        token: null,

        // 登录页重定向路径
        redirectPath: null,
    }),

    getters: {
        // 获取用户ID
        userId: (state) => state.currentUser ? .id,

        // 获取用户昵称
        nickname: (state) => state.currentUser ? .nickname || "未设置昵称",

        // 获取用户邮箱
        email: (state) => state.currentUser ? .email,

        // 获取用户头像
        avatar: (state) =>
            state.currentUser ? .avatar || "/images/default-avatar.jpg",

        // 检查是否完善了偏好设置
        hasPreferences: (state) => {
            return state.userPreferences.tags.length > 0;
        },

        // 格式化的偏好标签
        preferenceLabels: (state) => {
            const tagMap = {
                历史古迹: "🏛️ 历史古迹",
                自然风光: "🌄 自然风光",
                美食: "🍜 美食",
                亲子游: "👨‍👩‍👧‍👦 亲子游",
                文艺青年: "🎨 文艺青年",
                购物: "🛍️ 购物",
                运动健身: "💪 运动健身",
                放松休闲: "🧘‍♀️ 放松休闲",
            };
            return state.userPreferences.tags.map((tag) => tagMap[tag] || tag);
        },
    },

    actions: {
        // ========== 验证码相关 ==========
        /**
         * 发送验证码
         * @param {string} phone 手机号
         * @param {string} type 验证码类型 (login/register/reset)
         */
        async sendVerificationCode(phone, type = "login") {
            try {
                const response = await userApi.sendCode({
                    phone,
                    type,
                });
                return response.data;
            } catch (error) {
                console.error("发送验证码失败:", error);
                throw error;
            }
        },

        // ========== 用户认证 ==========
        /**
         * 用户登录
         * @param {string} phone 手机号
         * @param {string} code 验证码
         */
        async login(phone, code) {
            try {
                const response = await userApi.login({
                    phone,
                    code,
                });

                const user = response.data;

                // 保存用户信息到状态
                this.currentUser = user;
                this.isLoggedIn = true;

                // 如果有token，保存到本地存储
                if (user.token) {
                    this.token = user.token;
                    localStorage.setItem("goingtour_token", user.token);
                }

                // 保存登录状态到本地存储
                this.saveToStorage();

                return user;
            } catch (error) {
                console.error("登录失败:", error);
                throw error;
            }
        },

        /**
         * 用户注册
         * @param {string} phone 手机号
         * @param {string} code 验证码
         * @param {string} nickname 昵称
         */
        async register(phone, code, nickname) {
            try {
                const response = await userApi.register({
                    phone,
                    code,
                    nickname,
                });

                const user = response.data;

                // 注册成功后自动登录
                this.currentUser = user;
                this.isLoggedIn = true;

                if (user.token) {
                    this.token = user.token;
                    localStorage.setItem("goingtour_token", user.token);
                }

                this.saveToStorage();

                return user;
            } catch (error) {
                console.error("注册失败:", error);
                throw error;
            }
        },

        /**
         * 设置测试用户（用于开发和测试API对接）
         */
        setTestUser(userId = 1) {
            this.currentUser = {
                id: userId,
                phone: "13800138001",
                nickname: "测试用户",
                avatar: "/images/default-avatar.jpg",
                preferences: null,
                budget: 500,
            };
            this.isLoggedIn = true;
            this.saveToStorage();

            console.log("🧪 已设置测试用户:", this.currentUser);
            ElMessage.success(`已设置测试用户 (ID: ${userId})`);
        },

        /**
         * 清除用户登录状态
         */
        logout() {
            this.currentUser = null;
            this.isLoggedIn = false;
            this.userPreferences = {
                tags: [],
                budget: 500,
            };
            this.token = null;
            this.redirectPath = null;

            // 清除本地存储
            localStorage.removeItem("goingtour_user");
            localStorage.removeItem("goingtour_token");

            console.log("👋 用户已注销");
            ElMessage.info("已退出登录");
        },

        // ========== 用户信息管理 ==========
        /**
         * 更新用户基本信息
         * @param {string} nickname 昵称
         * @param {string} avatar 头像URL
         */
        async updateUserInfo(nickname, avatar) {
            if (!this.currentUser ? .id) {
                throw new Error("用户未登录");
            }

            try {
                const response = await userApi.updateInfo(this.currentUser.id, {
                    nickname,
                    avatar,
                });

                // 更新本地状态
                this.currentUser = {...this.currentUser, ...response.data };
                this.saveToStorage();

                return response.data;
            } catch (error) {
                console.error("更新用户信息失败:", error);
                throw error;
            }
        },

        /**
         * 获取用户偏好设置
         */
        async fetchUserPreferences() {
            if (!this.currentUser ? .id) {
                throw new Error("用户未登录");
            }

            try {
                const response = await userApi.getUserPreferences(this.currentUser.id);
                console.log("store api ");
                console.log(response);

                if (response && response.data) {
                    // 更新本地状态
                    const { preferences, budget } = response.data;

                    // 合并偏好数据
                    this.userPreferences = {
                        ...this.userPreferences,
                        ...preferences,
                        budget: budget || this.userPreferences.budget,
                    };

                    // 更新currentUser中的preferences字段
                    if (this.currentUser) {
                        this.currentUser.preferences = JSON.stringify(preferences || {});
                        this.currentUser.budget = budget;
                    }

                    this.saveToStorage();

                    console.log("✅ 从API获取用户偏好成功:", this.userPreferences);
                    return this.userPreferences;
                }

                throw new Error("获取偏好数据失败");
            } catch (error) {
                console.error("❌ 获取用户偏好失败:", error);
                throw error;
            }
        },

        /**
         * 更新用户偏好设置
         * @param {Object} preferences 偏好数据对象（匹配UserPreferencesRequest格式）
         */
        async updateUserPreferences(preferences) {
            if (!this.currentUser ? .id) {
                throw new Error("用户未登录");
            }

            try {
                const response = await userApi.updatePreferences(
                    this.currentUser.id,
                    preferences,
                );

                // 更新本地状态 - 从返回数据中提取preferences
                if (response.data) {
                    this.userPreferences = {
                        ...this.userPreferences,
                        budget: preferences.dailyBudget ||
                            preferences.budget ||
                            this.userPreferences.budget,
                    };

                    // 如果需要更新currentUser，可以重新获取用户信息
                    if (this.currentUser) {
                        this.currentUser.budget =
                            preferences.dailyBudget || preferences.budget;
                    }
                }

                this.saveToStorage();

                return response.data;
            } catch (error) {
                console.error("更新用户偏好失败:", error);
                throw error;
            }
        },

        /**
         * 获取用户完整信息
         */
        async fetchUserInfo() {
            if (!this.currentUser ? .id) {
                throw new Error("用户未登录");
            }

            try {
                const response = await userApi.getUserInfo(this.currentUser.id);

                // 更新用户信息
                this.currentUser = response.data;

                // 解析偏好设置
                if (response.data.preferences) {
                    try {
                        const preferences = JSON.parse(response.data.preferences);
                        this.userPreferences = {
                            tags: Array.isArray(preferences) ? preferences : [],
                            budget: response.data.budget || 500,
                        };
                    } catch (e) {
                        console.warn("解析用户偏好数据失败:", e);
                    }
                }

                this.saveToStorage();
                return response.data;
            } catch (error) {
                console.error("获取用户信息失败:", error);
                throw error;
            }
        },

        // ========== 本地存储管理 ==========
        /**
         * 保存状态到本地存储
         */
        saveToStorage() {
            const userData = {
                isLoggedIn: this.isLoggedIn,
                currentUser: this.currentUser,
                userPreferences: this.userPreferences,
                token: this.token,
            };
            localStorage.setItem("goingtour_user", JSON.stringify(userData));
        },

        /**
         * 从本地存储恢复状态
         */
        restoreFromStorage() {
            try {
                const userData = localStorage.getItem("goingtour_user");
                if (userData) {
                    const parsedData = JSON.parse(userData);
                    this.isLoggedIn = parsedData.isLoggedIn || false;
                    this.currentUser = parsedData.currentUser || null;
                    this.userPreferences = parsedData.userPreferences || {
                        tags: [],
                        budget: 500,
                    };
                    this.token = parsedData.token || null;
                }
            } catch (error) {
                console.warn("恢复用户数据失败:", error);
                // 清空可能损坏的数据
                localStorage.removeItem("goingtour_user");
            }
        },

        // ========== 路由重定向管理 ==========
        /**
         * 设置登录后重定向路径
         * @param {string} path 重定向路径
         */
        setRedirectPath(path) {
            this.redirectPath = path;
        },

        /**
         * 获取并清空重定向路径
         * @returns {string|null} 重定向路径
         */
        getAndClearRedirectPath() {
            const path = this.redirectPath;
            this.redirectPath = null;
            return path;
        },
    },
});