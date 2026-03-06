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
};

export const reportApi = {
    createReport(data) {
        return http.post("/reports", data);
    },
};

