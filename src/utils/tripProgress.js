/**
 * 行程创建进度管理工具
 * 用于保存和恢复用户的行程创建进度，提升用户体验
 */

class TripProgressManager {
    constructor() {
        this.storageKey = 'goingtour_trip_progress';
        this.draftStorageKey = 'goingtour_trip_drafts'; // 草稿存储键
        this.maxSaveTime = 24 * 60 * 60 * 1000; // 24小时有效期
        this.maxDraftSaveTime = 7 * 24 * 60 * 60 * 1000; // 草稿保存7天
        this.maxDrafts = 10; // 最多保存10个草稿
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
                destination: progressData.baseForm?.destinationName,
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
                destination: progressData.baseForm?.destinationName,
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
        // 基础结构检查
        if (
            !progressData ||
            typeof progressData.currentStep !== 'number' ||
            progressData.currentStep < 0 ||
            progressData.currentStep > 3 ||
            !progressData.baseForm ||
            !progressData.preferenceForm ||
            !progressData.timestamp ||
            typeof progressData.timestamp !== 'number'
        ) {
            return false;
        }

        // 基础表单数据检查
        if (!progressData.baseForm.destinationName || !progressData.baseForm.destination) {
            console.warn('进度数据缺少必要的目的地信息');
            return false;
        }

        // 偏好表单数据检查
        if (!progressData.preferenceForm || typeof progressData.preferenceForm !== 'object') {
            console.warn('进度数据缺少偏好表单信息');
            return false;
        }

        return true;
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
                destination: progressData.baseForm?.destinationName || '未选择',
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
     * 调试：比较当前数据与保存的进度数据
     * @param {Object} currentData - 当前的表单数据
     * @returns {Object} 比较结果
     */
    debugCompareData(currentData) {
        const savedData = this.restoreProgress();
        if (!savedData) {
            return { hasSaved: false, message: '没有保存的进度数据' };
        }

        const differences = [];
        
        // 比较baseForm
        if (currentData.baseForm && savedData.baseForm) {
            Object.keys(currentData.baseForm).forEach(key => {
                if (JSON.stringify(currentData.baseForm[key]) !== JSON.stringify(savedData.baseForm[key])) {
                    differences.push({
                        type: 'baseForm',
                        field: key,
                        current: currentData.baseForm[key],
                        saved: savedData.baseForm[key]
                    });
                }
            });
        }

        // 比较preferenceForm
        if (currentData.preferenceForm && savedData.preferenceForm) {
            Object.keys(currentData.preferenceForm).forEach(key => {
                if (JSON.stringify(currentData.preferenceForm[key]) !== JSON.stringify(savedData.preferenceForm[key])) {
                    differences.push({
                        type: 'preferenceForm',
                        field: key,
                        current: currentData.preferenceForm[key],
                        saved: savedData.preferenceForm[key]
                    });
                }
            });
        }

        return {
            hasSaved: true,
            savedTime: new Date(savedData.timestamp).toLocaleString(),
            currentStep: savedData.currentStep,
            differences: differences,
            isDifferent: differences.length > 0
        };
    }

    /**
     * 保存行程草稿
     * @param {Object} draftData - 草稿数据
     * @param {string} draftName - 草稿名称（可选）
     * @returns {string|null} 草稿ID
     */
    saveDraft(draftData, draftName = null) {
        try {
            const draftId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const timestamp = Date.now();
            const saveData = {
                id: draftId,
                name: draftName || `草稿 - ${draftData.baseForm?.destinationName || '未命名目的地'}`,
                ...draftData,
                isDraft: true,
                timestamp: timestamp,
                createdAt: timestamp,
                updatedAt: timestamp,
                version: '1.0'
            };

            // 获取现有草稿列表
            const existingDrafts = this.getAllDrafts();
            existingDrafts.push(saveData);

            // 限制草稿数量，保留最新的
            if (existingDrafts.length > this.maxDrafts) {
                existingDrafts.sort((a, b) => b.timestamp - a.timestamp);
                existingDrafts.splice(this.maxDrafts);
            }

            localStorage.setItem(this.draftStorageKey, JSON.stringify(existingDrafts));
            console.log('📝 行程草稿已保存:', {
                id: draftId,
                name: saveData.name,
                step: draftData.currentStep,
                destination: draftData.baseForm?.destinationName,
                timestamp: new Date().toLocaleString()
            });

            return draftId;
        } catch (error) {
            console.error('❌ 保存行程草稿失败:', error);
            return null;
        }
    }

    /**
     * 获取所有草稿
     * @returns {Array} 草稿列表
     */
    getAllDrafts() {
        try {
            const draftsData = localStorage.getItem(this.draftStorageKey);
            if (!draftsData) return [];

            const drafts = JSON.parse(draftsData);
            // 过滤过期草稿
            const validDrafts = drafts.filter(draft => 
                Date.now() - draft.timestamp <= this.maxDraftSaveTime
            );

            // 如果有草稿被过期清理，更新存储
            if (validDrafts.length !== drafts.length) {
                localStorage.setItem(this.draftStorageKey, JSON.stringify(validDrafts));
            }

            return validDrafts.sort((a, b) => b.timestamp - a.timestamp); // 按时间降序排列
        } catch (error) {
            console.error('❌ 获取草稿列表失败:', error);
            return [];
        }
    }

    /**
     * 获取特定草稿
     * @param {string} draftId - 草稿ID
     * @returns {Object|null} 草稿数据
     */
    getDraft(draftId) {
        const drafts = this.getAllDrafts();
        return drafts.find(draft => draft.id === draftId) || null;
    }

    /**
     * 删除草稿
     * @param {string} draftId - 草稿ID
     * @returns {boolean} 是否删除成功
     */
    deleteDraft(draftId) {
        try {
            const drafts = this.getAllDrafts();
            const updatedDrafts = drafts.filter(draft => draft.id !== draftId);
            
            localStorage.setItem(this.draftStorageKey, JSON.stringify(updatedDrafts));
            console.log('🗑️ 草稿已删除:', draftId);
            return true;
        } catch (error) {
            console.error('❌ 删除草稿失败:', error);
            return false;
        }
    }

    /**
     * 重命名草稿
     * @param {string} draftId - 草稿ID
     * @param {string} newName - 新名称
     * @returns {boolean} 是否重命名成功
     */
    renameDraft(draftId, newName) {
        try {
            const drafts = this.getAllDrafts();
            const draftIndex = drafts.findIndex(draft => draft.id === draftId);
            
            if (draftIndex === -1) return false;
            
            drafts[draftIndex].name = newName;
            drafts[draftIndex].updatedAt = Date.now();
            
            localStorage.setItem(this.draftStorageKey, JSON.stringify(drafts));
            console.log('✏️ 草稿已重命名:', { id: draftId, newName });
            return true;
        } catch (error) {
            console.error('❌ 重命名草稿失败:', error);
            return false;
        }
    }

    /**
     * 复制草稿
     * @param {string} draftId - 源草稿ID
     * @param {string} newName - 新草稿名称（可选）
     * @returns {string|null} 新草稿ID
     */
    copyDraft(draftId, newName = null) {
        try {
            const sourceDraft = this.getDraft(draftId);
            if (!sourceDraft) return null;

            const copyData = { ...sourceDraft };
            delete copyData.id;
            delete copyData.timestamp;
            delete copyData.createdAt;
            delete copyData.updatedAt;

            const copyName = newName || `${sourceDraft.name} - 副本`;
            return this.saveDraft(copyData, copyName);
        } catch (error) {
            console.error('❌ 复制草稿失败:', error);
            return null;
        }
    }

    /**
     * 清空所有草稿
     */
    clearAllDrafts() {
        try {
            localStorage.removeItem(this.draftStorageKey);
            console.log('🗑️ 所有草稿已清除');
            return true;
        } catch (error) {
            console.error('❌ 清除草稿失败:', error);
            return false;
        }
    }

    /**
     * 获取草稿摘要信息
     * @param {string} draftId - 草稿ID
     * @returns {Object|null} 草稿摘要
     */
    getDraftSummary(draftId) {
        const draft = this.getDraft(draftId);
        if (!draft) return null;

        return {
            id: draft.id,
            name: draft.name,
            destination: draft.baseForm?.destinationName || '未选择',
            step: draft.currentStep,
            stepName: this.getStepName(draft.currentStep),
            createdTime: new Date(draft.createdAt).toLocaleString(),
            updatedTime: new Date(draft.updatedAt).toLocaleString(),
            timeAgo: this.getTimeAgo(draft.updatedAt)
        };
    }

    /**
     * 检查草稿数据是否有效
     * @param {Object} draftData - 草稿数据
     * @returns {boolean}
     */
    isValidDraft(draftData) {
        if (!draftData || typeof draftData !== 'object') return false;
        
        // 必须有基础结构
        if (typeof draftData.currentStep !== 'number' || 
            !draftData.baseForm || 
            !draftData.preferenceForm) {
            return false;
        }

        // 必须有目的地信息（至少一个步骤完成）
        if (!draftData.baseForm.destinationName) {
            return false;
        }

        return true;
    }

    /**
     * 获取草稿统计信息
     * @returns {Object} 统计信息
     */
    getDraftStats() {
        const drafts = this.getAllDrafts();
        const now = Date.now();
        
        return {
            total: drafts.length,
            recentCount: drafts.filter(d => now - d.updatedAt < 24 * 60 * 60 * 1000).length,
            oldestDate: drafts.length ? Math.min(...drafts.map(d => d.createdAt)) : null,
            newestDate: drafts.length ? Math.max(...drafts.map(d => d.updatedAt)) : null,
            destinations: [...new Set(drafts.map(d => d.baseForm?.destinationName).filter(Boolean))],
            storageUsed: localStorage.getItem(this.draftStorageKey)?.length || 0
        };
    }
}

// 创建全局实例
export const tripProgressManager = new TripProgressManager();

// 开发环境下暴露到全局，便于调试
if (process.env.NODE_ENV === 'development') {
    window.tripProgressManager = tripProgressManager;
}

export default TripProgressManager;