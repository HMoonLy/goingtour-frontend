/**
 * 统一的草稿管理系统
 * 替换原来的 tripProgress.js，使用数据库存储草稿
 */

import { draftApi } from '@/api/draft.js';
import { useUserStore } from '@/store/user.js';
import { ElMessage, ElMessageBox } from 'element-plus';
class DraftManager {
  constructor() {
    this.currentDraft = null;
    this.draftList = [];
    this.hasUnsavedChanges = false;
    this.originalData = null;
  }

  /**
   * 获取当前用户ID
   */
  getCurrentUserId() {
    const userStore = useUserStore();
    return userStore.currentUser?.id;
  }

  /**
   * 验证用户是否登录
   */
  validateUser() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.warn('用户未登录，无法操作草稿');
      return false;
    }
    return userId;
  }

  /**
   * 获取用户所有草稿
   * @returns {Promise<Array>} 草稿列表
   */
  async getAllDrafts() {
    const userId = this.validateUser();
    if (!userId) return [];

    try {
      const response = await draftApi.getUserDrafts(userId);
      this.draftList = response.data || [];
      console.log('📝 获取草稿列表成功:', this.draftList.length, '个草稿');
      return this.draftList;
    } catch (error) {
      console.error('❌ 获取草稿列表失败:', error);
      ElMessage.error('获取草稿列表失败');
      return [];
    }
  }

  /**
   * 获取特定草稿
   * @param {number} draftId - 草稿ID
   * @returns {Promise<Object|null>} 草稿数据
   */
  async getDraft(draftId) {
    const userId = this.validateUser();
    if (!userId) return null;

    try {
      console.log('🔍 开始获取草稿，draftId:', draftId, 'userId:', userId);
      const response = await draftApi.getDraft(draftId, userId);
      console.log('🌐 服务器原始响应:', response);

      const draft = response.data;
      console.log('📄 解析后的草稿数据:', draft);

      if (!draft) {
        console.error('❌ 草稿数据为空');
        ElMessage.error('草稿不存在');
        return null;
      }

      // 详细分析草稿数据结构
      console.log('🔍 草稿数据详细分析:', {
        id: draft.id,
        name: draft.name,
        currentStep: draft.currentStep || draft.current_step,
        hasBaseForm: !!(draft.baseForm || draft.base_form),
        baseFormType: typeof (draft.baseForm || draft.base_form),
        baseFormKeys:
          draft.baseForm || draft.base_form
            ? Object.keys(draft.baseForm || draft.base_form)
            : null,
        baseFormData: draft.baseForm || draft.base_form,
        hasPreferenceForm: !!(draft.preferenceForm || draft.preference_form),
        preferenceFormType: typeof (
          draft.preferenceForm || draft.preference_form
        ),
        preferenceFormKeys:
          draft.preferenceForm || draft.preference_form
            ? Object.keys(draft.preferenceForm || draft.preference_form)
            : null,
        preferenceFormData: draft.preferenceForm || draft.preference_form,
        hasAttractions: !!(
          draft.selectedAttractions || draft.selected_attractions
        ),
        attractionsCount:
          draft.selectedAttractions || draft.selected_attractions
            ? (draft.selectedAttractions || draft.selected_attractions).length
            : 0,
        hasRestaurants: !!(
          draft.selectedRestaurants || draft.selected_restaurants
        ),
        restaurantsCount:
          draft.selectedRestaurants || draft.selected_restaurants
            ? (draft.selectedRestaurants || draft.selected_restaurants).length
            : 0,
        extraRequirements: draft.extraRequirements || draft.extra_requirements,
        weatherSuggestion: draft.weatherSuggestion || draft.weather_suggestion,
      });

      // 标准化数据格式 - 处理数据库字段命名和前端命名的差异
      const normalizedDraft = this.normalizeDraftData(draft);
      console.log('📋 标准化后的草稿数据:', normalizedDraft);

      // 验证草稿数据完整性
      if (!this.validateDraftData(normalizedDraft)) {
        console.warn('⚠️ 草稿数据不完整，可能导致加载问题:', normalizedDraft);
        ElMessage.warning('草稿数据可能不完整，请检查加载结果');
      }

      console.log('📂 草稿获取成功:', normalizedDraft.name);
      return normalizedDraft;
    } catch (error) {
      console.error('❌ 获取草稿失败:', error);
      console.error('❌ 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      ElMessage.error('获取草稿失败: ' + error.message);
      return null;
    }
  }

  /**
   * 标准化草稿数据格式 - 简化版本，主要处理JSON解析
   * @param {Object} rawDraft - 原始草稿数据
   * @returns {Object} 标准化后的草稿数据
   */
  normalizeDraftData(rawDraft) {
    if (!rawDraft) {
      console.error('⚠️ 草稿数据为空');
      return null;
    }

    console.log('🔄 开始数据标准化，原始数据:', rawDraft);

    const normalized = { ...rawDraft };

    // 处理JSON字段解析
    const jsonFields = [
      'baseForm',
      'preferenceForm',
      'selectedAttractions',
      'selectedRestaurants',
      'weatherSuggestion',
    ];

    jsonFields.forEach(field => {
      if (normalized[field] && typeof normalized[field] === 'string') {
        try {
          normalized[field] = JSON.parse(normalized[field]);
          console.log(`✅ 成功解析JSON字段: ${field}`);
        } catch (error) {
          console.warn(`⚠️ 解析JSON字段失败: ${field}`, error);
          normalized[field] = field.includes('Form') ? {} : [];
        }
      }
    });

    // 设置默认值
    const defaults = {
      currentStep: 0,
      isAuto: false,
      baseForm: {},
      preferenceForm: {},
      selectedAttractions: [],
      selectedRestaurants: [],
      extraRequirements: '',
      weatherSuggestion: null,
      version: '1.0',
    };

    Object.entries(defaults).forEach(([key, defaultValue]) => {
      if (normalized[key] === undefined || normalized[key] === null) {
        normalized[key] = defaultValue;
      }
    });

    console.log('✅ 数据标准化完成:', {
      hasDestinationName: !!normalized.baseForm?.destinationName,
      destinationName: normalized.baseForm?.destinationName,
      currentStep: normalized.currentStep,
      dataKeys: Object.keys(normalized),
    });

    return normalized;
  }

  /**
   * 验证草稿数据完整性
   * @param {Object} draft - 草稿数据
   * @returns {boolean} 数据是否有效
   */
  validateDraftData(draft) {
    if (!draft) {
      console.log('❌ 草稿验证失败：草稿为空');
      return false;
    }

    // 检查步骤号（可选）
    if (typeof draft.currentStep !== 'number') {
      console.log('⚠️ 草稿步骤号异常，使用默认值0');
      draft.currentStep = 0;
    }

    // 检查baseForm（必需，但可以为空对象）
    if (!draft.baseForm || typeof draft.baseForm !== 'object') {
      console.log('⚠️ 草稿baseForm缺失，使用默认对象');
      draft.baseForm = {};
    }

    // 检查preferenceForm（必需，但可以为空对象）
    if (!draft.preferenceForm || typeof draft.preferenceForm !== 'object') {
      console.log('⚠️ 草稿preferenceForm缺失，使用默认对象');
      draft.preferenceForm = {};
    }

    console.log('✅ 草稿数据验证通过（使用宽松验证条件）');
    return true;
  }

  /**
   * 保存草稿
   * @param {Object} draftData - 草稿数据
   * @param {string} draftName - 草稿名称（可选）
   * @param {boolean} isAuto - 是否为自动草稿
   * @returns {Promise<number|null>} 草稿ID
   */
  async saveDraft(draftData, draftName = null, isAuto = false) {
    const userId = this.validateUser();
    if (!userId) return null;

    // 验证草稿数据
    if (!this.isValidDraftData(draftData)) {
      console.warn('⚠️ 草稿数据无效，跳过保存');
      return null;
    }

    try {
      const payload = {
        userId,
        name:
          draftName ||
          `${isAuto ? '自动保存' : '草稿'} - ${draftData.baseForm?.destinationName || '未命名目的地'}`,
        currentStep: draftData.currentStep || 0,
        isAuto,
        baseForm: draftData.baseForm || {},
        preferenceForm: draftData.preferenceForm || {},
        selectedAttractions: draftData.selectedAttractions || [],
        selectedRestaurants: draftData.selectedRestaurants || [],
        extraRequirements: draftData.extraRequirements || '',
        weatherSuggestion: draftData.weatherSuggestion || null,
        version: '1.0',
      };

      const response = await draftApi.createDraft(payload);
      const draftId = response.data?.id;

      if (draftId) {
        console.log('💾 草稿保存成功:', payload.name, 'ID:', draftId);
        if (!isAuto) {
          ElMessage.success(`草稿"${payload.name}"保存成功`);
        }

        // 更新本地缓存
        await this.getAllDrafts();
        return draftId;
      }

      return null;
    } catch (error) {
      console.error('❌ 保存草稿失败:', error);
      if (!isAuto) {
        ElMessage.error('保存草稿失败');
      }
      return null;
    }
  }

  /**
   * 更新草稿
   * @param {number} draftId - 草稿ID
   * @param {Object} draftData - 草稿数据
   * @returns {Promise<boolean>} 是否更新成功
   */
  async updateDraft(draftId, draftData) {
    const userId = this.validateUser();
    if (!userId) return false;

    try {
      const payload = {
        userId,
        currentStep: draftData.currentStep || 0,
        baseForm: draftData.baseForm || {},
        preferenceForm: draftData.preferenceForm || {},
        selectedAttractions: draftData.selectedAttractions || [],
        selectedRestaurants: draftData.selectedRestaurants || [],
        extraRequirements: draftData.extraRequirements || '',
        weatherSuggestion: draftData.weatherSuggestion || null,
      };

      await draftApi.updateDraft(draftId, payload);
      console.log('🔄 草稿更新成功:', draftId);

      // 更新本地缓存
      await this.getAllDrafts();
      return true;
    } catch (error) {
      console.error('❌ 更新草稿失败:', error);
      ElMessage.error('更新草稿失败');
      return false;
    }
  }

  /**
   * 删除草稿
   * @param {number} draftId - 草稿ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteDraft(draftId) {
    const userId = this.validateUser();
    if (!userId) return false;

    try {
      await draftApi.deleteDraft(draftId, userId);
      console.log('🗑️ 草稿删除成功:', draftId);

      // 更新本地缓存
      await this.getAllDrafts();
      return true;
    } catch (error) {
      console.error('❌ 删除草稿失败:', error);
      ElMessage.error('删除草稿失败');
      return false;
    }
  }

  /**
   * 重命名草稿
   * @param {number} draftId - 草稿ID
   * @param {string} newName - 新名称
   * @returns {Promise<boolean>} 是否重命名成功
   */
  async renameDraft(draftId, newName) {
    const userId = this.validateUser();
    if (!userId) return false;

    try {
      await draftApi.renameDraft(draftId, newName, userId);
      console.log('✏️ 草稿重命名成功:', draftId, '->', newName);

      // 更新本地缓存
      await this.getAllDrafts();
      ElMessage.success('重命名成功');
      return true;
    } catch (error) {
      console.error('❌ 重命名草稿失败:', error);
      ElMessage.error('重命名失败');
      return false;
    }
  }

  /**
   * 复制草稿
   * @param {number} draftId - 源草稿ID
   * @param {string} newName - 新草稿名称（可选）
   * @returns {Promise<number|null>} 新草稿ID
   */
  async copyDraft(draftId, newName = null) {
    const userId = this.validateUser();
    if (!userId) return null;

    try {
      const sourceDraft = await this.getDraft(draftId);
      if (!sourceDraft) return null;

      const copyName = newName || `${sourceDraft.name} - 副本`;
      const response = await draftApi.copyDraft(draftId, copyName, userId);
      const newDraftId = response.data?.id;

      if (newDraftId) {
        console.log('📋 草稿复制成功:', draftId, '->', newDraftId);
        ElMessage.success('草稿复制成功');

        // 更新本地缓存
        await this.getAllDrafts();
        return newDraftId;
      }

      return null;
    } catch (error) {
      console.error('❌ 复制草稿失败:', error);
      ElMessage.error('复制草稿失败');
      return null;
    }
  }

  /**
   * 标记数据已更改
   * @param {Object} draftData - 当前草稿数据
   */
  markAsChanged(draftData) {
    this.hasUnsavedChanges = true;

    // 如果没有原始数据，保存当前作为原始数据
    if (!this.originalData) {
      this.originalData = JSON.parse(JSON.stringify(draftData));
    }
  }

  /**
   * 重置更改状态
   * @param {boolean} clearAll - 是否清理所有相关状态
   */
  resetChangeState(clearAll = false) {
    console.log('🧹 重置更改状态, clearAll:', clearAll);

    // 重置基本状态
    this.hasUnsavedChanges = false;
    this.originalData = null;

    if (clearAll) {
      // 清理更多相关状态
      console.log('🧹 执行完整状态清理');

      // 如果存在localStorage中的临时数据，也清理掉
      try {
        const tempKeys = [
          'temp_trip_data',
          'temp_preference_data',
          'temp_draft_changes',
        ];
        tempKeys.forEach(key => {
          if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            console.log(`🗑️ 清理临时数据: ${key}`);
          }
        });
      } catch (error) {
        console.warn('清理localStorage时出错:', error);
      }

      // 发送事件通知其他组件清理状态
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent('draftStateReset', {
            detail: { timestamp: Date.now() },
          })
        );
        console.log('📢 发送草稿状态重置事件');
      }
    }

    console.log('✅ 状态重置完成');
  }

  /**
   * 检查是否有未保存的更改
   * @returns {boolean} 是否有未保存的更改
   */
  checkUnsavedChanges() {
    return this.hasUnsavedChanges;
  }

  /**
   * 退出前询问是否保存
   * @param {Object} draftData - 当前草稿数据
   * @returns {Promise<boolean>} 是否可以退出
   */
  async confirmBeforeExit(draftData) {
    console.log(
      '🔍 confirmBeforeExit调用，hasUnsavedChanges:',
      this.hasUnsavedChanges
    );

    if (!this.hasUnsavedChanges) {
      console.log('✅ 没有未保存更改，直接允许退出');
      return true;
    }

    try {
      console.log('⚠️ 检测到未保存更改，显示确认对话框');
      await ElMessageBox.confirm(
        '您有未保存的行程数据，是否要保存为草稿？',
        '提示',
        {
          confirmButtonText: '保存草稿',
          cancelButtonText: '不保存',
          type: 'warning',
          showClose: true,
          closeOnClickModal: false,
          closeOnPressEscape: false,
        }
      );

      // 如果到达这里，说明用户点击了"保存草稿"
      console.log('💾 用户选择保存草稿');
      const saved = await this.showSaveDraftDialog(draftData);
      console.log('💾 保存结果:', saved);
      return saved; // 只有成功保存才允许退出
    } catch (action) {
      console.log('📝 捕获到异常，action:', action);

      // Element Plus的confirm在用户点击"不保存"时会抛出'cancel'
      // 在用户点击X或ESC时会抛出'close'或其他错误
      if (action === 'cancel') {
        // 用户选择"不保存"
        console.log('🚮 用户选择不保存，开始清理状态');
        this.resetChangeState(true); // 传入true进行完整清理
        console.log('🚮 用户选择不保存，已执行完整状态清理');
        ElMessage.info('已放弃当前编辑的内容');
        console.log('✅ 返回true，允许路由跳转');
        return true;
      } else {
        // 用户点击了关闭按钮或ESC，真正的取消操作
        console.log('❌ 用户真正取消操作，阻止路由跳转:', action);
        return false;
      }
    }
  }

  /**
   * 显示保存草稿对话框
   * @param {Object} draftData - 草稿数据
   * @returns {Promise<boolean>} 是否保存成功
   */
  async showSaveDraftDialog(draftData) {
    try {
      const { value: draftName } = await ElMessageBox.prompt(
        '请输入草稿名称：',
        '保存草稿',
        {
          confirmButtonText: '保存',
          cancelButtonText: '取消',
          inputValue: this.generateDraftName(draftData),
          inputValidator: value => {
            if (!value || value.trim().length === 0) {
              return '草稿名称不能为空';
            }
            if (value.trim().length > 50) {
              return '草稿名称不能超过50个字符';
            }
            return true;
          },
        }
      );

      if (draftName && draftName.trim()) {
        const draftId = await this.saveDraft(draftData, draftName.trim());
        if (draftId) {
          this.resetChangeState();
          ElMessage.success('草稿保存成功');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.log('用户取消了保存操作');
      return false;
    }
  }

  /**
   * 生成默认草稿名称
   * @param {Object} draftData - 草稿数据
   * @returns {string} 草稿名称
   */
  generateDraftName(draftData) {
    const destination =
      draftData.baseForm?.destinationName ||
      draftData.baseForm?.destination ||
      '未知目的地';
    const days = draftData.baseForm?.days || 0;
    const today = new Date().toLocaleDateString('zh-CN');

    return `${destination}${days > 0 ? days + '日' : ''}行程 - ${today}`;
  }

  /**
   * 获取自动草稿
   * @returns {Promise<Object|null>} 自动草稿数据
   */
  async getAutoDraft() {
    const drafts = await this.getAllDrafts();
    const autoDraft =
      drafts.find(draft => draft.isAuto || draft.is_auto) || null;

    if (autoDraft) {
      // 对自动草稿也进行数据标准化
      return this.normalizeDraftData(autoDraft);
    }

    return null;
  }

  /**
   * 检查是否有自动草稿
   * @returns {Promise<boolean>} 是否有自动草稿
   */
  async hasAutoDraft() {
    const autoDraft = await this.getAutoDraft();
    return !!autoDraft;
  }

  /**
   * 获取自动草稿摘要
   * @returns {Promise<Object|null>} 自动草稿摘要
   */
  async getAutoDraftSummary() {
    const autoDraft = await this.getAutoDraft();
    if (!autoDraft) return null;

    return {
      step: autoDraft.currentStep,
      stepName: this.getStepName(autoDraft.currentStep),
      destination: autoDraft.baseForm?.destinationName || '未选择',
      savedTime: new Date(autoDraft.updatedAt).toLocaleString(),
      timeAgo: this.getTimeAgo(new Date(autoDraft.updatedAt)),
    };
  }

  /**
   * 获取草稿统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async getDraftStats() {
    const userId = this.validateUser();
    if (!userId) return { total: 0 };

    try {
      const response = await draftApi.getDraftStats(userId);
      return response.data || { total: 0 };
    } catch (error) {
      console.error('❌ 获取草稿统计失败:', error);
      return { total: 0 };
    }
  }

  /**
   * 清空所有草稿
   * @returns {Promise<boolean>} 是否成功
   */
  async clearAllDrafts() {
    const userId = this.validateUser();
    if (!userId) return false;

    try {
      const drafts = await this.getAllDrafts();
      const draftIds = drafts.map(draft => draft.id);

      if (draftIds.length === 0) return true;

      await draftApi.batchDeleteDrafts(draftIds, userId);
      console.log('🗑️ 所有草稿已清空');

      this.draftList = [];
      ElMessage.success('所有草稿已清空');
      return true;
    } catch (error) {
      console.error('❌ 清空草稿失败:', error);
      ElMessage.error('清空草稿失败');
      return false;
    }
  }

  /**
   * 验证草稿数据是否有效
   * @param {Object} draftData - 草稿数据
   * @returns {boolean} 是否有效
   */
  isValidDraftData(draftData) {
    if (!draftData || typeof draftData !== 'object') {
      console.log('❌ 草稿数据验证失败：数据为空或非对象');
      return false;
    }

    // 放宽验证条件：只要有基础表单对象即可，不要求目的地信息
    if (!draftData.baseForm || typeof draftData.baseForm !== 'object') {
      console.log('❌ 草稿数据验证失败：缺少baseForm');
      return false;
    }

    // 不再强制要求目的地信息，因为用户可能正在选择目的地过程中
    // 这样可以保存更多的用户输入状态
    console.log('✅ 草稿数据验证通过');
    return true;
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
      3: '行程预览',
    };
    return stepNames[step] || '未知步骤';
  }

  /**
   * 获取相对时间描述
   * @param {Date} date - 日期对象
   * @returns {string} 相对时间
   */
  getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;

    if (diff < 60 * 1000) {
      return '刚刚';
    } else if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))}分钟前`;
    } else if (diff < 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * 清理过期草稿
   * @returns {Promise<boolean>} 是否成功
   */
  async cleanupExpiredDrafts() {
    const userId = this.validateUser();
    if (!userId) return false;

    try {
      await draftApi.cleanupExpiredDrafts(userId);
      console.log('🧹 过期草稿清理完成');

      // 更新本地缓存
      await this.getAllDrafts();
      return true;
    } catch (error) {
      console.error('❌ 清理过期草稿失败:', error);
      return false;
    }
  }

  /**
   * 销毁管理器，清理定时器
   */
  destroy() {
    this.currentDraft = null;
    this.draftList = [];
    this.resetChangeState();
  }
}

// 创建全局实例
export const draftManager = new DraftManager();

// 开发环境下暴露到全局，便于调试
if (process.env.NODE_ENV === 'development') {
  window.draftManager = draftManager;
}

export default DraftManager;
