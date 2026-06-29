import { defineStore } from "pinia";
import { getAvatarUrl } from "@/utils/media/imageUrl.js";

export const useUserStore = defineStore("user", {
    state: () => ({
        isLoggedIn: false,
        currentUser: null,
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,
        redirectPath: null,
    }),

    getters: {
        userId: (state) => state.currentUser?.id,
        nickname: (state) => state.currentUser?.nickname || "未设置昵称",
        email: (state) => state.currentUser?.email,
        avatar: (state) => {
            const rawAvatar = state.currentUser?.avatar;
            return rawAvatar ? getAvatarUrl(rawAvatar) : "/vite.svg";
        },
        userPreferences: (state) => {
            const prefs = state.currentUser?.preferences;
            if (!prefs) return {};
            if (typeof prefs === "string") {
                try {
                    return JSON.parse(prefs);
                } catch {
                    return {};
                }
            }
            return prefs;
        },
        hasPreferences: (state) => {
            const prefs = state.currentUser?.preferences;
            if (!prefs) return false;
            if (typeof prefs === "string") {
                try {
                    return Object.keys(JSON.parse(prefs)).length > 0;
                } catch {
                    return false;
                }
            }
            return Object.keys(prefs).length > 0;
        },
        preferenceLabels() {
            const preferences = this.userPreferences;
            const labels = [];

            if (preferences.travelTypes?.length) {
                labels.push(...preferences.travelTypes.map((type) => `${type}旅行`));
            }
            if (preferences.budgetRange) {
                labels.push(`预算: ${preferences.budgetRange}`);
            }
            if (preferences.preferredSeasons?.length) {
                labels.push(...preferences.preferredSeasons.map((season) => `${season}出行`));
            }

            return labels;
        },
        isTokenValid: (state) =>
            Boolean(state.accessToken && state.tokenExpiry && Date.now() < state.tokenExpiry),
        isAdmin: (state) => {
            const role = (state.currentUser?.role || "").toUpperCase();
            return role === "ADMIN" || role === "ROLE_ADMIN";
        },
    },

    actions: {
        setLoginState(authData) {
            this.accessToken = authData.accessToken;
            this.refreshToken = authData.refreshToken;
            this.tokenExpiry = Date.now() + authData.expiresIn;
            this.currentUser = authData.userInfo;
            this.isLoggedIn = true;
            this.saveTokensToStorage();
            this.saveToStorage();
            return authData.userInfo;
        },

        setRegisterState(authData) {
            this.accessToken = authData.accessToken;
            this.refreshToken = authData.refreshToken;
            this.tokenExpiry = Date.now() + authData.expiresIn;
            this.currentUser = authData.userInfo;
            this.isLoggedIn = true;
            this.saveTokensToStorage();
            this.saveToStorage();
            return authData.userInfo;
        },

        updateTokens(tokenData) {
            this.accessToken = tokenData.accessToken;
            this.refreshToken = tokenData.refreshToken;
            this.tokenExpiry = Date.now() + tokenData.expiresIn;
            this.saveTokensToStorage();
        },

        updateUserInfo(userInfo) {
            if (!this.currentUser) return;
            this.currentUser = { ...this.currentUser, ...userInfo };
            this.saveToStorage();
        },

        setUserPreferences(preferences) {
            if (!this.currentUser) return;
            this.currentUser.preferences = preferences;
            this.saveToStorage();
        },

        logout() {
            this.isLoggedIn = false;
            this.currentUser = null;
            this.accessToken = null;
            this.refreshToken = null;
            this.tokenExpiry = null;
            this.redirectPath = null;
            this.clearStorage();
        },

        clearAuthState() {
            this.isLoggedIn = false;
            this.accessToken = null;
            this.refreshToken = null;
            this.tokenExpiry = null;
            this.clearTokensFromStorage();
        },

        setRedirectPath(path) {
            this.redirectPath = path;
        },

        getAndClearRedirectPath() {
            const path = this.redirectPath;
            this.redirectPath = null;
            return path;
        },

        saveToStorage() {
            try {
                localStorage.setItem(
                    "goingtour_user",
                    JSON.stringify({
                        isLoggedIn: this.isLoggedIn,
                        currentUser: this.currentUser,
                    }),
                );
            } catch (error) {
                console.error("保存用户状态失败:", error);
            }
        },

        saveTokensToStorage() {
            try {
                if (this.accessToken) localStorage.setItem("goingtour_token", this.accessToken);
                if (this.refreshToken) {
                    localStorage.setItem("goingtour_refresh_token", this.refreshToken);
                }
                if (this.tokenExpiry) {
                    localStorage.setItem("goingtour_token_expiry", String(this.tokenExpiry));
                }
            } catch (error) {
                console.error("保存 Token 失败:", error);
            }
        },

        loadFromStorage() {
            try {
                const userData = localStorage.getItem("goingtour_user");
                if (userData) {
                    const parsed = JSON.parse(userData);
                    this.isLoggedIn = Boolean(parsed.isLoggedIn);
                    this.currentUser = parsed.currentUser || null;
                }

                this.accessToken = localStorage.getItem("goingtour_token");
                this.refreshToken = localStorage.getItem("goingtour_refresh_token");
                const expiry = localStorage.getItem("goingtour_token_expiry");
                this.tokenExpiry = expiry ? parseInt(expiry, 10) : null;

                if (!this.isTokenValid) {
                    this.clearAuthState();
                }
            } catch (error) {
                console.error("加载用户状态失败:", error);
                this.clearStorage();
            }
        },

        clearStorage() {
            try {
                localStorage.removeItem("goingtour_user");
                this.clearTokensFromStorage();
            } catch (error) {
                console.error("清理存储失败:", error);
            }
        },

        clearTokensFromStorage() {
            try {
                localStorage.removeItem("goingtour_token");
                localStorage.removeItem("goingtour_refresh_token");
                localStorage.removeItem("goingtour_token_expiry");
            } catch (error) {
                console.error("清理 Token 失败:", error);
            }
        },
    },
});
