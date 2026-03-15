import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user.js";
import { handleApiError, handleSuccess } from "@/utils/api/errorHandler.js";
import { userApi } from "@/api/user.js";
import { notify } from "@/utils/ui/notify.js";

function hasAdminRole(role) {
    const normalized = (role || "").toUpperCase();
    return normalized === "ADMIN" || normalized === "ROLE_ADMIN";
}

export function useAuth() {
    const userStore = useUserStore();
    const router = useRouter();

    const loading = ref(false);
    const verifyCodeLoading = ref(false);
    const countdown = ref(0);
    let timer = null;

    const isLoggedIn = computed(() => userStore.isLoggedIn);
    const currentUser = computed(() => userStore.currentUser);
    const userId = computed(() => userStore.currentUser?.id);

    async function sendVerificationCode(email, type = "login") {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            notify.warning("Invalid email format");
            return false;
        }

        if (verifyCodeLoading.value || countdown.value > 0) {
            return false;
        }

        try {
            verifyCodeLoading.value = true;
            await userApi.sendCode({ email, type });
            notify.success("Verification code has been sent");
            startCountdown(60);
            return true;
        } catch (error) {
            handleApiError(error, "Send code failed");
            return false;
        } finally {
            verifyCodeLoading.value = false;
        }
    }

    function startCountdown(seconds = 60) {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        countdown.value = seconds;
        timer = setInterval(() => {
            countdown.value -= 1;
            if (countdown.value <= 0) {
                clearInterval(timer);
                timer = null;
                countdown.value = 0;
            }
        }, 1000);
    }

    function cleanup() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    async function syncRoleIfNeeded(user) {
        if (!user?.id || user?.role) return;
        try {
            const profileRes = await userApi.getUserInfo(user.id);
            const profile = profileRes?.data || {};
            if (profile.role || profile.status) {
                userStore.updateUserInfo({
                    role: profile.role,
                    status: profile.status,
                });
            }
        } catch (error) {
            console.warn("Role sync failed:", error);
        }
    }

    async function login(email, code) {
        if (!email || !code) {
            notify.warning("Please complete login fields");
            return null;
        }

        try {
            loading.value = true;
            const response = await userApi.login({ email, code });
            const authData = response.data;
            const user = userStore.setLoginState(authData);

            await syncRoleIfNeeded(user);

            const latestRole = userStore.currentUser?.role || user?.role;
            const redirectPath = userStore.getAndClearRedirectPath();
            const finalPath = hasAdminRole(latestRole) ? "/admin" : redirectPath || "/home";

            handleSuccess(`Welcome back, ${userStore.currentUser?.nickname || "User"}!`, {
                showNotification: true,
            });

            await router.push(finalPath);
            return userStore.currentUser;
        } catch (error) {
            handleApiError(error, "Login failed");
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function adminLogin(account, password) {
        if (!account || !password) {
            notify.warning("Please enter admin account and password");
            return null;
        }

        try {
            loading.value = true;
            const response = await userApi.adminLogin({ account, password });
            const authData = response.data;
            const user = userStore.setLoginState(authData);
            await syncRoleIfNeeded(user);
            await router.push("/admin");
            handleSuccess("Admin login success", { showNotification: true });
            return userStore.currentUser;
        } catch (error) {
            handleApiError(error, "Admin login failed");
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function register(email, code, nickname) {
        if (!email || !code) {
            notify.warning("Please complete register fields");
            return null;
        }

        try {
            loading.value = true;
            const response = await userApi.register({ email, code, nickname });
            const authData = response.data;
            const user = userStore.setRegisterState(authData);

            handleSuccess("Register success", {
                showNotification: true,
                title: "Register",
            });

            setTimeout(() => {
                router.push("/home");
            }, 1000);

            return user;
        } catch (error) {
            handleApiError(error, "Register failed");
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function logout(showConfirm = true) {
        if (showConfirm) {
            try {
                await notify.confirm("Confirm logout?", "Notice", {
                    confirmButtonText: "OK",
                    cancelButtonText: "Cancel",
                    type: "warning",
                });
            } catch {
                return false;
            }
        }

        try {
            userStore.logout();
            handleSuccess("Logged out");
            await router.push("/login");
            return true;
        } catch (error) {
            handleApiError(error, "Logout failed");
            return false;
        }
    }

    function requireLogin(redirectToLogin = true) {
        if (!isLoggedIn.value) {
            notify.warning("Please login first");
            if (redirectToLogin) {
                userStore.setRedirectPath(router.currentRoute.value.fullPath);
                router.push("/login");
            }
            return false;
        }
        return true;
    }

    async function refreshToken() {
        if (!userStore.refreshToken) {
            throw new Error("No refresh token");
        }

        try {
            const response = await userApi.refreshToken(userStore.refreshToken);
            const tokenData = response.data;
            userStore.updateTokens(tokenData);
            return tokenData.accessToken;
        } catch (error) {
            userStore.clearAuthState();
            throw error;
        }
    }

    return {
        loading: computed(() => loading.value),
        verifyCodeLoading: computed(() => verifyCodeLoading.value),
        countdown: computed(() => countdown.value),
        isLoggedIn,
        currentUser,
        userId,
        sendVerificationCode,
        login,
        adminLogin,
        register,
        logout,
        requireLogin,
        refreshToken,
        cleanup,
    };
}
