import { defineStore } from 'pinia';
import { userApi } from '../api/user';
import { ElMessage } from 'element-plus';
import { getAvatarUrl } from '@/utils/media/imageUrl.js';

export const useUserStore = defineStore('user', {
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

        // JWT Token信息
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,

        // 登录页重定向路径
        redirectPath: null,
    }),

    getters: {
        // 获取用户ID
        userId: state => state.currentUser?.id,

        // 获取用户昵称
        nickname: state => state.currentUser?.nickname || '未设置昵称',

        // 获取用户邮箱
        email: state => state.currentUser?.email,

        // 获取用户头像（规范化URL）
        avatar: state => {
            const rawAvatar = state.currentUser?.avatar;
            if (!rawAvatar) {
                return '/images/default-avatar.jpg';
            }
            return getAvatarUrl(rawAvatar);
        },

        // 检查是否完善了偏好设置
        hasPreferences: state => {
            return state.userPreferences.tags.length > 0;
        },

        // 格式化的偏好标签
        preferenceLabels: state => {
            const tagMap = {
                历史古迹: '🏛️ 历史古迹',
                自然风光: '🌄 自然风光',
                美食: '🍜 美食',
                亲子游: '👨‍👩‍👧‍👦 亲子游',
                文艺青年: '🎨 文艺青年',
                购物: '🛍️ 购物',
                运动健身: '💪 运动健身',
                放松休闲: '🧘‍♀️ 放松休闲',
            };
            return state.userPreferences.tags.map(tag => tagMap[tag] || tag);
        },
    },

    actions: {
        // ========== 验证码相关 ==========
        /**
         * 发送验证码
         * @param {string} email 邮箱地址
         * @param {string} type 验证码类型 (login/register/reset)
         */
        async sendVerificationCode(email, type = 'login') {
            try {
                const response = await userApi.sendCode({
                    email,
                    type,
                });
                return response.data;
            } catch (error) {
                console.error('发送验证码失败:', error);
                throw error;
            }
        },

        // ========== 用户认证 ==========
        /**
         * 用户登录
         * @param {string} email 邮箱地址
         * @param {string} code 验证码
         */
        async login(email, code) {
            try {
                const response = await userApi.login({
                    email,
                    code,
                });

                const authData = response.data;

                // 保存JWT令牌信息
                this.accessToken = authData.accessToken;
                this.refreshToken = authData.refreshToken;
                this.tokenExpiry = Date.now() + authData.expiresIn;

                // 保存用户信息到状态
                this.currentUser = authData.userInfo;
                this.isLoggedIn = true;

                // 保存令牌到本地存储
                localStorage.setItem('goingtour_token', authData.accessToken);
                localStorage.setItem('goingtour_refresh_token', authData.refreshToken);
                localStorage.setItem(
                    'goingtour_token_expiry',
                    this.tokenExpiry.toString()
                );

                // 保存登录状态到本地存储
                this.saveToStorage();

                return authData.userInfo;
            } catch (error) {
                console.error('登录失败:', error);
                throw error;
            }
        },

        /**
         * 用户注册
         * @param {string} email 邮箱地址
         * @param {string} code 验证码
         * @param {string} nickname 昵称
         */
        async register(email, code, nickname) {
            try {
                const response = await userApi.register({
                    email,
                    code,
                    nickname,
                });

                const authData = response.data;

                // 保存JWT令牌信息
                this.accessToken = authData.accessToken;
                this.refreshToken = authData.refreshToken;
                this.tokenExpiry = Date.now() + authData.expiresIn;

                // 保存用户信息到状态
                this.currentUser = authData.userInfo;
                this.isLoggedIn = true;

                // 保存令牌到本地存储
                localStorage.setItem('goingtour_token', authData.accessToken);
                localStorage.setItem('goingtour_refresh_token', authData.refreshToken);
                localStorage.setItem(
                    'goingtour_token_expiry',
                    this.tokenExpiry.toString()
                );

                // 保存登录状态到本地存储
                this.saveToStorage();

                return authData.userInfo;
            } catch (error) {
                console.error('注册失败:', error);
                throw error;
            }
        },

        /**
         * 刷新访问令牌
         */
        async refreshAccessToken() {
            try {
                if (!this.refreshToken) {
                    throw new Error('没有刷新令牌');
                }

                const response = await userApi.refreshToken(this.refreshToken);
                const authData = response.data;

                // 更新访问令牌
                this.accessToken = authData.accessToken;
                this.tokenExpiry = Date.now() + authData.expiresIn;

                // 更新本地存储
                localStorage.setItem('goingtour_token', authData.accessToken);
                localStorage.setItem(
                    'goingtour_token_expiry',
                    this.tokenExpiry.toString()
                );

                return authData.accessToken;
            } catch (error) {
                console.error('刷新令牌失败:', error);
                // 刷新失败，清除所有令牌信息
                this.logout();
                throw error;
            }
        },

        /**
         * 检查令牌是否即将过期并自动刷新
         */
        async checkAndRefreshToken() {
            if (!this.accessToken || !this.tokenExpiry) {
                return false;
            }

            // 如果令牌在5分钟内过期，自动刷新
            const fiveMinutes = 5 * 60 * 1000;
            if (Date.now() + fiveMinutes >= this.tokenExpiry) {
                try {
                    await this.refreshAccessToken();
                    return true;
                } catch (error) {
                    return false;
                }
            }

            return true;
        },

        /**
         * 退出登录
         */
        logout() {
            // 清除状态
            this.isLoggedIn = false;
            this.currentUser = null;
            this.accessToken = null;
            this.refreshToken = null;
            this.tokenExpiry = null;
            this.redirectPath = null;
            this.userPreferences = {
                tags: [],
                budget: 500,
            };

            // 清除本地存储
            localStorage.removeItem('goingtour_token');
            localStorage.removeItem('goingtour_refresh_token');
            localStorage.removeItem('goingtour_token_expiry');
            localStorage.removeItem('goingtour_user');
            localStorage.removeItem('goingtour_preferences');

            console.log('👋 用户已注销');
            ElMessage.info('已退出登录');
        },

        /**
         * 设置测试用户（用于开发和测试API对接）
         */
        setTestUser(userId = 1) {
            this.currentUser = {
                id: userId,
                phone: '13800138001',
                nickname: '测试用户',
                avatar: '/images/default-avatar.jpg',
                preferences: null,
                budget: 500,
            };
            this.isLoggedIn = true;
            this.saveToStorage();

            console.log('🧪 已设置测试用户:', this.currentUser);
            ElMessage.success(`已设置测试用户 (ID: ${userId})`);
        },

        // ========== 重定向路径管理 ==========
        /**
         * 设置登录后的重定向路径
         * @param {string} path - 重定向路径
         */
        setRedirectPath(path) {
            this.redirectPath = path;
        },

        /**
         * 获取并清除重定向路径
         * @returns {string|null} 重定向路径
         */
        getAndClearRedirectPath() {
            const path = this.redirectPath;
            this.redirectPath = null;
            return path;
        },

        // ========== 用户信息管理 ==========
        /**
         * 更新用户基本信息
         * @param {string} nickname 昵称
         * @param {string} avatar 头像URL
         */
        async updateUserInfo(nickname, avatar) {
            if (!this.currentUser?.id) {
                throw new Error('用户未登录');
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
                console.error('更新用户信息失败:', error);
                throw error;
            }
        },

        /**
         * 获取用户偏好设置
         */
        async fetchUserPreferences() {
            if (!this.currentUser?.id) {
                throw new Error('用户未登录');
            }

            try {
                const response = await userApi.getUserPreferences(this.currentUser.id);
                console.log('store api ');
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

                    console.log('✅ 从API获取用户偏好成功:', this.userPreferences);
                    return this.userPreferences;
                }

                throw new Error('获取偏好数据失败');
            } catch (error) {
                console.error('❌ 获取用户偏好失败:', error);
                throw error;
            }
        },

        /**
         * 更新用户偏好设置
         * @param {Object} preferences 偏好数据对象（匹配UserPreferencesRequest格式）
         */
        async updateUserPreferences(preferences) {
            if (!this.currentUser?.id) {
                throw new Error('用户未登录');
            }

            try {
                const response = await userApi.updatePreferences(
                    this.currentUser.id,
                    preferences
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
                console.error('更新用户偏好失败:', error);
                throw error;
            }
        },

        /**
         * 获取用户完整信息
         */
        async fetchUserInfo() {
            if (!this.currentUser?.id) {
                throw new Error('用户未登录');
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
                            tags: Array.isArray(preferences)?preferences : [],
                            budget: response.data.budget || 500,
                        };
                    } catch (e) {
                        console.warn('解析用户偏好数据失败:', e);
                    }
                }

                this.saveToStorage();
                return response.data;
            } catch (error) {
                console.error('获取用户信息失败:', error);
                throw error;
            }
        },

        // ========== 设置管理方法 ==========
        /**
         * 更新用户基本资料
         * @param {Object} profileData 基本资料数据
         */
        async updateProfile(profileData) {
            if (!this.currentUser?.id) {
                throw new Error('用户未登录');
            }

            try {
                // TODO: 调用后端API更新用户基本信息
                // const response = await userApi.updateProfile(this.currentUser.id, profileData)

                // 暂时模拟更新本地状态
                this.currentUser = {
                    ...this.currentUser,
                    ...profileData,
                };

                this.saveToStorage();
                console.log('✅ 用户基本资料更新成功:', profileData);
                return this.currentUser;
            } catch (error) {
                console.error('更新用户基本资料失败:', error);
                throw error;
            }
        },

        /**
         * 更新用户旅行偏好
         * @param {Object} preferences 偏好设置数据
         */
        async updatePreferences(preferences) {
            if (!this.currentUser?.id) {
                throw new Error('用户未登录');
            }

            try {
                // TODO: 调用后端API更新用户偏好设置
                // const response = await userApi.updatePreferences(this.currentUser.id, preferences)

                // 更新本地状态
                this.userPreferences = {
                    ...this.userPreferences,
                    ...preferences,
                };

                // 更新用户对象中的偏好信息
                if (this.currentUser) {
                    this.currentUser.preferences = JSON.stringify(preferences);
                }

                this.saveToStorage();
                console.log('✅ 用户偏好设置更新成功:', preferences);
                return this.userPreferences;
            } catch (error) {
                console.error('更新用户偏好设置失败:', error);
                throw error;
            }
        },

        /**
         * 更新用户通知设置
         * @param {Object} notificationSettings 通知设置数据
         */
        async updateNotificationSettings(notificationSettings) {
            if (!this.currentUser?.id) {
                throw new Error('用户未登录');
            }

            try {
                // TODO: 调用后端API更新通知设置
                // const response = await userApi.updateNotificationSettings(this.currentUser.id, notificationSettings)

                // 更新本地状态
                if (this.currentUser) {
                    this.currentUser.notificationSettings = {
                        ...this.currentUser.notificationSettings,
                        ...notificationSettings,
                    };
                }

                this.saveToStorage();
                console.log('✅ 用户通知设置更新成功:', notificationSettings);
                return notificationSettings;
            } catch (error) {
                console.error('更新用户通知设置失败:', error);
                throw error;
            }
        },

        /**
         * 更新用户隐私设置
         * @param {Object} privacySettings 隐私设置数据
         */
        async updatePrivacySettings(privacySettings) {
            if (!this.currentUser?.id) {
                throw new Error('用户未登录');
            }

            try {
                // TODO: 调用后端API更新隐私设置
                // const response = await userApi.updatePrivacySettings(this.currentUser.id, privacySettings)

                // 更新本地状态
                if (this.currentUser) {
                    this.currentUser.privacySettings = {
                        ...this.currentUser.privacySettings,
                        ...privacySettings,
                    };
                }

                this.saveToStorage();
                console.log('✅ 用户隐私设置更新成功:', privacySettings);
                return privacySettings;
            } catch (error) {
                console.error('更新用户隐私设置失败:', error);
                throw error;
            }
        },

        /**
         * 更新用户安全设置
         * @param {Object} securitySettings 安全设置数据
         */
        async updateSecuritySettings(securitySettings) {
            if (!this.currentUser?.id) {
                throw new Error('用户未登录');
            }

            try {
                // TODO: 调用后端API更新安全设置
                // const response = await userApi.updateSecuritySettings(this.currentUser.id, securitySettings)

                // 更新本地状态
                if (this.currentUser) {
                    this.currentUser.securitySettings = {
                        ...this.currentUser.securitySettings,
                        ...securitySettings,
                    };
                }

                this.saveToStorage();
                console.log('✅ 用户安全设置更新成功:', securitySettings);
                return securitySettings;
            } catch (error) {
                console.error('更新用户安全设置失败:', error);
                throw error;
            }
        },

        // ========== 本地存储管理 ==========
        /**
         * 保存状态到本地存储
         */
        saveToStorage() {
            try {
                if (this.currentUser) {
                    localStorage.setItem(
                        'goingtour_user',
                        JSON.stringify(this.currentUser)
                    );
                }
                if (this.userPreferences) {
                    localStorage.setItem(
                        'goingtour_preferences',
                        JSON.stringify(this.userPreferences)
                    );
                }
            } catch (error) {
                console.error('保存用户状态到本地存储失败:', error);
            }
        },

        /**
         * 从本地存储恢复状态
         */
        loadFromStorage() {
            try {
                // 恢复JWT令牌信息
                const token = localStorage.getItem('goingtour_token');
                const refreshToken = localStorage.getItem('goingtour_refresh_token');
                const tokenExpiry = localStorage.getItem('goingtour_token_expiry');

                if (token && refreshToken && tokenExpiry) {
                    this.accessToken = token;
                    this.refreshToken = refreshToken;
                    this.tokenExpiry = parseInt(tokenExpiry);

                    // 检查令牌是否已过期
                    if (Date.now() < this.tokenExpiry) {
                        this.isLoggedIn = true;
                    } else {
                        // 令牌已过期，清除相关信息
                        this.logout();
                        return;
                    }
                }

                // 恢复用户信息
                const userStr = localStorage.getItem('goingtour_user');
                if (userStr) {
                    this.currentUser = JSON.parse(userStr);
                }

                // 恢复用户偏好
                const preferencesStr = localStorage.getItem('goingtour_preferences');
                if (preferencesStr) {
                    this.userPreferences = JSON.parse(preferencesStr);
                }
            } catch (error) {
                console.error('从本地存储恢复用户状态失败:', error);
                // 如果恢复失败，清除可能损坏的数据
                this.logout();
            }
        },

        /**
         * 初始化用户状态（应用启动时调用）
         */
        init() {
            this.loadFromStorage();

            // 如果已登录，检查令牌有效性
            if (this.isLoggedIn && this.accessToken) {
                this.checkAndRefreshToken().catch(error => {
                    console.error('初始化时令牌检查失败:', error);
                    this.logout();
                });
            }
        },
    },
});