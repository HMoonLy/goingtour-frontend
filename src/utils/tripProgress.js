/**
 * 行程创建进度管理工具
 * 用于保存和恢复用户的行程创建进度，提升用户体验
 */

class TripProgressManager {
    constructor() {
        this.storageKey = 'goingtour_trip_progress';
        this.maxSaveTime = 24 * 60 * 60 * 1000; // 24小时有效期
    }

    /**
     * 保存行程创建进度
     * @param {Object} progressData - 进度数据
     */
    saveProgress(progressData) {
        try {
            const saveData = {
                ...progressData,
                timestamp: Date.now(),
                version: '1.0' // 用于兼容性检查
            };

            localStorage.setItem(this.storageKey, JSON.stringify(saveData));
            console.log('💾 行程进度已保存:', {
                step: progressData.currentStep,
                destination: progressData.baseForm ? .destinationName,
                timestamp: new Date().toLocaleString()
            });

            return true;
        } catch (error) {
            console.error('❌ 保存行程进度失败:', error);
            return false;
        }
    }

    /**
     * 恢复行程创建进度
     * @returns {Object|null} 进度数据或null
     */
    restoreProgress() {
        try {
            const savedData = localStorage.getItem(this.storageKey);

            if (!savedData) {
                return null;
            }

            const progressData = JSON.parse(savedData);

            // 检查数据有效性
            if (!this.isValidProgress(progressData)) {
                console.log('🗑️ 进度数据无效，已清除');
                this.clearProgress();
                return null;
            }

            // 检查时间有效性
            if (Date.now() - progressData.timestamp > this.maxSaveTime) {
                console.log('⏰ 进度数据已过期，已清除');
                this.clearProgress();
                return null;
            }

            console.log('📂 恢复行程进度:', {
                step: progressData.currentStep,
                destination: progressData.baseForm ? .destinationName,
                savedTime: new Date(progressData.timestamp).toLocaleString()
            });

            return progressData;
        } catch (error) {
            console.error('❌ 恢复行程进度失败:', error);
            this.clearProgress();
            return null;
        }
    }

    /**
     * 检查进度数据是否有效
     * @param {Object} progressData - 进度数据
     * @returns {boolean}
     */
    isValidProgress(progressData) {
        return (
            progressData &&
            typeof progressData.currentStep === 'number' &&
            progressData.currentStep >= 0 &&
            progressData.currentStep <= 3 &&
            progressData.baseForm &&
            progressData.preferenceForm &&
            progressData.timestamp &&
            typeof progressData.timestamp === 'number'
        );
    }

    /**
     * 清除保存的进度
     */
    clearProgress() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('🗑️ 行程进度已清除');
            return true;
        } catch (error) {
            console.error('❌ 清除行程进度失败:', error);
            return false;
        }
    }

    /**
     * 检查是否有保存的进度
     * @returns {boolean}
     */
    hasProgress() {
        const savedData = localStorage.getItem(this.storageKey);
        if (!savedData) return false;

        try {
            const progressData = JSON.parse(savedData);
            return this.isValidProgress(progressData) &&
                (Date.now() - progressData.timestamp <= this.maxSaveTime);
        } catch {
            return false;
        }
    }

    /**
     * 获取进度摘要信息
     * @returns {Object|null} 进度摘要
     */
    getProgressSummary() {
        if (!this.hasProgress()) return null;

        try {
            const progressData = JSON.parse(localStorage.getItem(this.storageKey));
            return {
                step: progressData.currentStep,
                stepName: this.getStepName(progressData.currentStep),
                destination: progressData.baseForm ? .destinationName || '未选择',
                savedTime: new Date(progressData.timestamp).toLocaleString(),
                timeAgo: this.getTimeAgo(progressData.timestamp)
            };
        } catch {
            return null;
        }
    }

    /**
     * 获取步骤名称
     * @param {number} step - 步骤号
     * @returns {string} 步骤名称
     */
    getStepName(step) {
        const stepNames = {
            0: '基础信息',
            1: '个性化偏好',
            2: '智能生成',
            3: '行程预览'
        };
        return stepNames[step] || '未知步骤';
    }

    /**
     * 获取相对时间描述
     * @param {number} timestamp - 时间戳
     * @returns {string} 相对时间
     */
    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;

        if (diff < 60 * 1000) {
            return '刚刚';
        } else if (diff < 60 * 60 * 1000) {
            return `${Math.floor(diff / (60 * 1000))}分钟前`;
        } else if (diff < 24 * 60 * 60 * 1000) {
            return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
        } else {
            return '很久之前';
        }
    }

    /**
     * 自动保存进度（防抖处理）
     * @param {Object} progressData - 进度数据
     * @param {number} delay - 延迟时间（毫秒）
     */
    autoSave(progressData, delay = 1000) {
        // 清除之前的定时器
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }

        // 设置新的定时器
        this.autoSaveTimer = setTimeout(() => {
            this.saveProgress(progressData);
        }, delay);
    }

    /**
     * 导出进度数据（用于备份）
     * @returns {string|null} JSON字符串
     */
    exportProgress() {
        const progressData = this.restoreProgress();
        if (!progressData) return null;

        try {
            return JSON.stringify(progressData, null, 2);
        } catch (error) {
            console.error('❌ 导出进度数据失败:', error);
            return null;
        }
    }

    /**
     * 导入进度数据（用于恢复备份）
     * @param {string} jsonString - JSON字符串
     * @returns {boolean} 是否成功
     */
    importProgress(jsonString) {
        try {
            const progressData = JSON.parse(jsonString);

            if (!this.isValidProgress(progressData)) {
                throw new Error('无效的进度数据格式');
            }

            return this.saveProgress(progressData);
        } catch (error) {
            console.error('❌ 导入进度数据失败:', error);
            return false;
        }
    }
}

// 创建全局实例
export const tripProgressManager = new TripProgressManager();

// 开发环境下暴露到全局，便于调试
if (process.env.NODE_ENV === 'development') {
    window.tripProgressManager = tripProgressManager;
}

export default TripProgressManager;