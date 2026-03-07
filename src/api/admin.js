import { http } from "./request.js";

export const adminApi = {
    getUsers(params = {}) {
        return http.get("/admin/users", params);
    },

    banUser(userId, data) {
        return http.put(`/admin/users/${userId}/ban`, data);
    },

    unbanUser(userId) {
        return http.put(`/admin/users/${userId}/unban`, {});
    },

    getReports(params = {}) {
        return http.get("/admin/reports", params);
    },

    handleReport(reportId, data) {
        return http.put(`/admin/reports/${reportId}/handle`, data);
    },

    getDashboardStats() {
        return http.get("/admin/dashboard/stats");
    },

    getPosts(params = {}) {
        return http.get("/admin/content/posts", params);
    },

    removePost(postId, data = {}) {
        return http.put(`/admin/content/posts/${postId}/remove`, data);
    },

    getComments(params = {}) {
        return http.get("/admin/content/comments", params);
    },

    removeComment(commentId, data = {}) {
        return http.put(`/admin/content/comments/${commentId}/remove`, data);
    },

    getMonitorOverview() {
        return http.get("/admin/monitor/overview");
    },

    getConfigs(params = {}) {
        return http.get("/admin/configs", params);
    },

    updateConfig(configKey, data) {
        return http.put(`/admin/configs/${configKey}`, data);
    },

    getOperationLogs(params = {}) {
        return http.get("/admin/logs/operations", params);
    },

    getSecurityEvents(params = {}) {
        return http.get("/admin/security/events", params);
    },

    emergencyBanUser(userId, data) {
        return http.put(`/admin/security/users/${userId}/emergency-ban`, data);
    },
};

export const reportApi = {
    createReport(data) {
        return http.post("/reports", data);
    },
};
