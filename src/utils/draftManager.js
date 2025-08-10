/**
 * 统一的草稿管理系统
 * 替换原来的 tripProgress.js，使用数据库存储草稿
 */

import { draftApi } from '@/api/draft.js'
import { useUserStore } from '@/store/user.js'
import { ElMessage, ElMessageBox } from 'element-plus'

class DraftManager {
  constructor() {
    this.currentDraft = null
    this.draftList = []
    this.hasUnsavedChanges = false
    this.originalData = null
  }

  /**
   * 获取当前用户ID
   */
  getCurrentUserId() {
    const userStore = useUserStore()
    return userStore.currentUser?.id
  }

  /**
   * 验证用户是否登录
   */
  validateUser() {
    const userId = this.getCurrentUserId()
    if (!userId) {
      console.warn('用户未登录，无法操作草稿')
      return false
    }
    return userId
  }

  /**
   * 获取用户所有草稿
   * @returns {Promise<Array>} 草稿列表
   */
  async getAllDrafts() {
    const userId = this.validateUser()
    if (!userId) return []

    try {
      const response = await draftApi.getUserDrafts(userId)
      this.draftList = response.data || []
      console.log('📝 获取草稿列表成功:', this.draftList.length, '个草稿')
      return this.draftList
    } catch (error) {
      console.error('❌ 获取草稿列表失败:', error)
      ElMessage.error('获取草稿列表失败')
      return []
    }
  }

  /**
   * 获取特定草稿
   * @param {number} draftId - 草稿ID
   * @returns {Promise<Object|null>} 草稿数据
   */
  async getDraft(draftId) {
    const userId = this.validateUser()
    if (!userId) return null

    try {
      const response = await draftApi.getDraft(draftId, userId)
      const draft = response.data
      
      if (!draft) {
        ElMessage.error('草稿不存在')
        return null
      }
      
      // 验证草稿数据完整性
      if (!this.validateDraftData(draft)) {
        console.warn('⚠️ 草稿数据不完整，可能导致加载问题:', draft)
        ElMessage.warning('草稿数据可能不完整，请检查加载结果')
      }
      
      console.log('📂 获取草稿成功:', draft.name)
      console.log('📄 草稿详细数据:', {
        id: draft.id,
        name: draft.name,
        currentStep: draft.currentStep,
        baseForm: draft.baseForm,
        preferenceForm: draft.preferenceForm,
        hasAttractions: !!draft.selectedAttractions,
        hasRestaurants: !!draft.selectedRestaurants
      })
      
      return draft
    } catch (error) {
      console.error('❌ 获取草稿失败:', error)
      ElMessage.error('获取草稿失败: ' + error.message)
      return null
    }
  }

  /**
   * 验证草稿数据完整性
   * @param {Object} draft - 草稿数据
   * @returns {boolean} 数据是否有效
   */
  validateDraftData(draft) {
    if (!draft) return false
    
    // 检查必要字段
    if (typeof draft.currentStep !== 'number') return false
    if (!draft.baseForm || typeof draft.baseForm !== 'object') return false
    if (!draft.preferenceForm || typeof draft.preferenceForm !== 'object') return false
    
    // 检查baseForm必要字段
    const baseForm = draft.baseForm
    if (!baseForm.destinationName && !baseForm.destination) return false
    
    return true
  }

  /**
   * 保存草稿
   * @param {Object} draftData - 草稿数据
   * @param {string} draftName - 草稿名称（可选）
   * @param {boolean} isAuto - 是否为自动草稿
   * @returns {Promise<number|null>} 草稿ID
   */
  async saveDraft(draftData, draftName = null, isAuto = false) {
    const userId = this.validateUser()
    if (!userId) return null

    // 验证草稿数据
    if (!this.isValidDraftData(draftData)) {
      console.warn('⚠️ 草稿数据无效，跳过保存')
      return null
    }

    try {
      const payload = {
        userId,
        name: draftName || `${isAuto ? '自动保存' : '草稿'} - ${draftData.baseForm?.destinationName || '未命名目的地'}`,
        currentStep: draftData.currentStep || 0,
        isAuto,
        baseForm: draftData.baseForm || {},
        preferenceForm: draftData.preferenceForm || {},
        selectedAttractions: draftData.selectedAttractions || [],
        selectedRestaurants: draftData.selectedRestaurants || [],
        extraRequirements: draftData.extraRequirements || '',
        weatherSuggestion: draftData.weatherSuggestion || null,
        version: '1.0'
      }

      const response = await draftApi.createDraft(payload)
      const draftId = response.data?.id
      
      if (draftId) {
        console.log('💾 草稿保存成功:', payload.name, 'ID:', draftId)
        if (!isAuto) {
          ElMessage.success(`草稿"${payload.name}"保存成功`)
        }
        
        // 更新本地缓存
        await this.getAllDrafts()
        return draftId
      }
      
      return null
    } catch (error) {
      console.error('❌ 保存草稿失败:', error)
      if (!isAuto) {
        ElMessage.error('保存草稿失败')
      }
      return null
    }
  }

  /**
   * 更新草稿
   * @param {number} draftId - 草稿ID
   * @param {Object} draftData - 草稿数据
   * @returns {Promise<boolean>} 是否更新成功
   */
  async updateDraft(draftId, draftData) {
    const userId = this.validateUser()
    if (!userId) return false

    try {
      const payload = {
        userId,
        currentStep: draftData.currentStep || 0,
        baseForm: draftData.baseForm || {},
        preferenceForm: draftData.preferenceForm || {},
        selectedAttractions: draftData.selectedAttractions || [],
        selectedRestaurants: draftData.selectedRestaurants || [],
        extraRequirements: draftData.extraRequirements || '',
        weatherSuggestion: draftData.weatherSuggestion || null
      }

      await draftApi.updateDraft(draftId, payload)
      console.log('🔄 草稿更新成功:', draftId)
      
      // 更新本地缓存
      await this.getAllDrafts()
      return true
    } catch (error) {
      console.error('❌ 更新草稿失败:', error)
      ElMessage.error('更新草稿失败')
      return false
    }
  }

  /**
   * 删除草稿
   * @param {number} draftId - 草稿ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteDraft(draftId) {
    const userId = this.validateUser()
    if (!userId) return false

    try {
      await draftApi.deleteDraft(draftId, userId)
      console.log('🗑️ 草稿删除成功:', draftId)
      
      // 更新本地缓存
      await this.getAllDrafts()
      return true
    } catch (error) {
      console.error('❌ 删除草稿失败:', error)
      ElMessage.error('删除草稿失败')
      return false
    }
  }

  /**
   * 重命名草稿
   * @param {number} draftId - 草稿ID
   * @param {string} newName - 新名称
   * @returns {Promise<boolean>} 是否重命名成功
   */
  async renameDraft(draftId, newName) {
    const userId = this.validateUser()
    if (!userId) return false

    try {
      await draftApi.renameDraft(draftId, newName, userId)
      console.log('✏️ 草稿重命名成功:', draftId, '->', newName)
      
      // 更新本地缓存
      await this.getAllDrafts()
      ElMessage.success('重命名成功')
      return true
    } catch (error) {
      console.error('❌ 重命名草稿失败:', error)
      ElMessage.error('重命名失败')
      return false
    }
  }

  /**
   * 复制草稿
   * @param {number} draftId - 源草稿ID
   * @param {string} newName - 新草稿名称（可选）
   * @returns {Promise<number|null>} 新草稿ID
   */
  async copyDraft(draftId, newName = null) {
    const userId = this.validateUser()
    if (!userId) return null

    try {
      const sourceDraft = await this.getDraft(draftId)
      if (!sourceDraft) return null

      const copyName = newName || `${sourceDraft.name} - 副本`
      const response = await draftApi.copyDraft(draftId, copyName, userId)
      const newDraftId = response.data?.id

      if (newDraftId) {
        console.log('📋 草稿复制成功:', draftId, '->', newDraftId)
        ElMessage.success('草稿复制成功')
        
        // 更新本地缓存
        await this.getAllDrafts()
        return newDraftId
      }
      
      return null
    } catch (error) {
      console.error('❌ 复制草稿失败:', error)
      ElMessage.error('复制草稿失败')
      return null
    }
  }

  /**
   * 标记数据已更改
   * @param {Object} draftData - 当前草稿数据
   */
  markAsChanged(draftData) {
    this.hasUnsavedChanges = true
    
    // 如果没有原始数据，保存当前作为原始数据
    if (!this.originalData) {
      this.originalData = JSON.parse(JSON.stringify(draftData))
    }
  }

  /**
   * 重置更改状态
   */
  resetChangeState() {
    this.hasUnsavedChanges = false
    this.originalData = null
  }

  /**
   * 检查是否有未保存的更改
   * @returns {boolean} 是否有未保存的更改
   */
  checkUnsavedChanges() {
    return this.hasUnsavedChanges
  }

  /**
   * 退出前询问是否保存
   * @param {Object} draftData - 当前草稿数据
   * @returns {Promise<boolean>} 是否可以退出
   */
  async confirmBeforeExit(draftData) {
    if (!this.hasUnsavedChanges) {
      return true
    }

    try {
      const action = await ElMessageBox.confirm(
        '您有未保存的行程数据，是否要保存为草稿？',
        '提示',
        {
          confirmButtonText: '保存草稿',
          cancelButtonText: '不保存',
          type: 'warning',
          showClose: true,
          closeOnClickModal: false,
          closeOnPressEscape: false
        }
      )

      if (action === 'confirm') {
        // 用户选择保存
        const saved = await this.showSaveDraftDialog(draftData)
        return saved // 只有成功保存才允许退出
      }
      
      // 用户选择不保存，直接退出
      return true
    } catch (error) {
      // 用户点击了关闭或取消，不退出
      return false
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
          inputValidator: (value) => {
            if (!value || value.trim().length === 0) {
              return '草稿名称不能为空'
            }
            if (value.trim().length > 50) {
              return '草稿名称不能超过50个字符'
            }
            return true
          }
        }
      )

      if (draftName && draftName.trim()) {
        const draftId = await this.saveDraft(draftData, draftName.trim())
        if (draftId) {
          this.resetChangeState()
          ElMessage.success('草稿保存成功')
          return true
        }
      }
      return false
    } catch (error) {
      console.log('用户取消了保存操作')
      return false
    }
  }

  /**
   * 生成默认草稿名称
   * @param {Object} draftData - 草稿数据
   * @returns {string} 草稿名称
   */
  generateDraftName(draftData) {
    const destination = draftData.baseForm?.destinationName || draftData.baseForm?.destination || '未知目的地'
    const days = draftData.baseForm?.days || 0
    const today = new Date().toLocaleDateString('zh-CN')
    
    return `${destination}${days > 0 ? days + '日' : ''}行程 - ${today}`
  }

  /**
   * 获取自动草稿
   * @returns {Promise<Object|null>} 自动草稿数据
   */
  async getAutoDraft() {
    const drafts = await this.getAllDrafts()
    return drafts.find(draft => draft.isAuto) || null
  }

  /**
   * 检查是否有自动草稿
   * @returns {Promise<boolean>} 是否有自动草稿
   */
  async hasAutoDraft() {
    const autoDraft = await this.getAutoDraft()
    return !!autoDraft
  }

  /**
   * 获取自动草稿摘要
   * @returns {Promise<Object|null>} 自动草稿摘要
   */
  async getAutoDraftSummary() {
    const autoDraft = await this.getAutoDraft()
    if (!autoDraft) return null

    return {
      step: autoDraft.currentStep,
      stepName: this.getStepName(autoDraft.currentStep),
      destination: autoDraft.baseForm?.destinationName || '未选择',
      savedTime: new Date(autoDraft.updatedAt).toLocaleString(),
      timeAgo: this.getTimeAgo(new Date(autoDraft.updatedAt))
    }
  }

  /**
   * 获取草稿统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async getDraftStats() {
    const userId = this.validateUser()
    if (!userId) return { total: 0 }

    try {
      const response = await draftApi.getDraftStats(userId)
      return response.data || { total: 0 }
    } catch (error) {
      console.error('❌ 获取草稿统计失败:', error)
      return { total: 0 }
    }
  }

  /**
   * 清空所有草稿
   * @returns {Promise<boolean>} 是否成功
   */
  async clearAllDrafts() {
    const userId = this.validateUser()
    if (!userId) return false

    try {
      const drafts = await this.getAllDrafts()
      const draftIds = drafts.map(draft => draft.id)
      
      if (draftIds.length === 0) return true

      await draftApi.batchDeleteDrafts(draftIds, userId)
      console.log('🗑️ 所有草稿已清空')
      
      this.draftList = []
      ElMessage.success('所有草稿已清空')
      return true
    } catch (error) {
      console.error('❌ 清空草稿失败:', error)
      ElMessage.error('清空草稿失败')
      return false
    }
  }

  /**
   * 验证草稿数据是否有效
   * @param {Object} draftData - 草稿数据
   * @returns {boolean} 是否有效
   */
  isValidDraftData(draftData) {
    if (!draftData || typeof draftData !== 'object') return false
    
    // 必须有基础表单数据
    if (!draftData.baseForm || typeof draftData.baseForm !== 'object') return false
    
    // 必须有目的地信息
    if (!draftData.baseForm.destinationName) return false
    
    // 必须有偏好表单数据
    if (!draftData.preferenceForm || typeof draftData.preferenceForm !== 'object') return false
    
    return true
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
    }
    return stepNames[step] || '未知步骤'
  }

  /**
   * 获取相对时间描述
   * @param {Date} date - 日期对象
   * @returns {string} 相对时间
   */
  getTimeAgo(date) {
    const now = new Date()
    const diff = now - date

    if (diff < 60 * 1000) {
      return '刚刚'
    } else if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))}分钟前`
    } else if (diff < 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
    } else {
      return date.toLocaleDateString()
    }
  }

  /**
   * 清理过期草稿
   * @returns {Promise<boolean>} 是否成功
   */
  async cleanupExpiredDrafts() {
    const userId = this.validateUser()
    if (!userId) return false

    try {
      await draftApi.cleanupExpiredDrafts(userId)
      console.log('🧹 过期草稿清理完成')
      
      // 更新本地缓存
      await this.getAllDrafts()
      return true
    } catch (error) {
      console.error('❌ 清理过期草稿失败:', error)
      return false
    }
  }

  /**
   * 销毁管理器，清理定时器
   */
  destroy() {
    this.currentDraft = null
    this.draftList = []
    this.resetChangeState()
  }
}

// 创建全局实例
export const draftManager = new DraftManager()

// 开发环境下暴露到全局，便于调试
if (process.env.NODE_ENV === 'development') {
  window.draftManager = draftManager
}

export default DraftManager