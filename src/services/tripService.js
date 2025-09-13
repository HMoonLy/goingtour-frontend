/**
 * 行程业务服务
 * 处理行程相关的业务逻辑、数据转换和API调用
 */
import { tripApi } from '@/api/trip.js'
import { http } from '@/api/request.js'
import { ElMessage } from 'element-plus'
import {
    convertBackendTripToFrontend,
    convertFrontendTripToBackend
} from '@/utils/data/tripDataConverter.js'

class TripService {
    constructor() {
        this.cache = new Map()
        this.cacheTimeout = 5 * 60 * 1000 // 5分钟缓存
        this.retryConfig = {
            maxRetries: 3,
            retryDelay: 1000
        }
    }

    // ==================== 缓存管理 ====================

    /**
     * 生成缓存键
     */
    _generateCacheKey(type, ...params) {
        return `${type}_${params.join('_')}`
    }

    /**
     * 检查缓存是否有效
     */
    _isCacheValid(cacheData) {
        if (!cacheData) return false
        return Date.now() - cacheData.timestamp < this.cacheTimeout
    }

    /**
     * 获取缓存数据
     */
    _getFromCache(cacheKey) {
        const cacheData = this.cache.get(cacheKey)
        if (this._isCacheValid(cacheData)) {
            return cacheData.data
        }
        this.cache.delete(cacheKey)
        return null
    }

    /**
     * 设置缓存数据
     */
    _setCache(cacheKey, data) {
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        })
    }

    /**
     * 清除缓存
     */
    clearCache(pattern = null) {
        if (!pattern) {
            this.cache.clear()
            return
        }

        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key)
            }
        }
    }

    // ==================== 错误处理 ====================

    /**
     * 处理API响应
     */
    _handleResponse(response, operation = '') {
        if (response && response.data !== undefined) {
            return {
                success: true,
                data: response.data,
                message: response.msg || 'success'
            }
        }

        return {
            success: false,
            data: null,
            message: response ? .msg || response ? .message || `${operation}失败`
        }
    }

    /**
     * 处理错误
     */
    _handleError(error, operation = '', retryCount = 0) {
        console.error(`❌ ${operation}失败:`, error)

        let errorMessage = '操作失败，请稍后重试'

        if (error.response) {
            // HTTP错误响应
            const status = error.response.status
            const data = error.response.data

            if (status === 401) {
                errorMessage = '登录已过期，请重新登录'
            } else if (status === 403) {
                errorMessage = '没有权限执行此操作'
            } else if (status === 404) {
                errorMessage = '请求的资源不存在'
            } else if (status >= 500) {
                errorMessage = '服务器错误，请稍后重试'
            } else {
                errorMessage = data ? .msg || data ? .message || errorMessage
            }
        } else if (error.code === 'NETWORK_ERROR') {
            errorMessage = '网络连接失败，请检查网络'
        } else if (error.message) {
            errorMessage = error.message
        }

        return {
            success: false,
            data: null,
            message: errorMessage,
            error: error,
            status: error.response ? .status,
            code: error.code
        }
    }

    /**
     * 带重试的API调用
     */
    async _apiCallWithRetry(apiCall, operation = '', retryCount = 0) {
        try {
            const response = await apiCall()
            return this._handleResponse(response, operation)
        } catch (error) {
            // 检查是否需要重试
            if (retryCount < this.retryConfig.maxRetries &&
                (error.code === 'NETWORK_ERROR' ||
                    (error.response && error.response.status >= 500))) {

                console.log(`🔄 ${operation}重试 (${retryCount + 1}/${this.retryConfig.maxRetries})`)
                await this._delay((retryCount + 1) * this.retryConfig.retryDelay)
                return this._apiCallWithRetry(apiCall, operation, retryCount + 1)
            }

            return this._handleError(error, operation, retryCount)
        }
    }

    /**
     * 延迟工具
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    // ==================== 行程CRUD操作 ====================

    /**
     * 获取用户行程列表
     * @param {number} userId 用户ID
     * @param {Object} options 选项
     */
    async getUserTrips(userId, options = {}) {
        if (!userId) {
            return {
                success: false,
                message: '用户ID不能为空'
            }
        }

        const { useCache = true } = options
        const cacheKey = this._generateCacheKey('user_trips', userId)

        // 检查缓存
        if (useCache) {
            const cachedData = this._getFromCache(cacheKey)
            if (cachedData) {
                console.log('📂 使用缓存的行程列表数据')
                return { success: true, data: cachedData }
            }
        }

        const result = await this._apiCallWithRetry(
            () => tripApi.getUserTrips(userId),
            '获取用户行程列表'
        )

        if (result.success && result.data) {
            // 转换后端数据格式
            const convertedTrips = result.data.map(trip =>
                    convertBackendTripToFrontend(trip)
                ).filter(Boolean) // 过滤掉转换失败的数据

            result.data = convertedTrips

            // 缓存结果
            if (useCache) {
                this._setCache(cacheKey, convertedTrips)
            }
        }

        return result
    }

    /**
     * 获取行程详情
     * @param {number} tripId 行程ID
     * @param {number} userId 用户ID
     */
    async getTripDetail(tripId, userId) {
        if (!tripId || !userId) {
            return {
                success: false,
                message: '行程ID和用户ID不能为空'
            }
        }

        const cacheKey = this._generateCacheKey('trip_detail', tripId, userId)
        const cachedData = this._getFromCache(cacheKey)

        if (cachedData) {
            console.log('📂 使用缓存的行程详情数据')
            return { success: true, data: cachedData }
        }

        const result = await this._apiCallWithRetry(
            () => tripApi.getTripDetail(tripId, userId),
            '获取行程详情'
        )

        if (result.success && result.data) {
            // 转换后端数据格式
            const convertedTrip = convertBackendTripToFrontend(result.data)
            if (convertedTrip) {
                result.data = convertedTrip
                this._setCache(cacheKey, convertedTrip)
            }
        }

        return result
    }

    /**
     * 创建行程
     * @param {number} userId 用户ID
     * @param {Object} tripData 行程数据
     */
    async createTrip(userId, tripData) {
        if (!userId) {
            return {
                success: false,
                message: '用户ID不能为空'
            }
        }

        if (!tripData || !tripData.title || !tripData.city) {
            return {
                success: false,
                message: '行程标题和目的地不能为空'
            }
        }

        // 转换前端数据格式为后端格式
        const backendTripData = convertFrontendTripToBackend(tripData)

        const result = await this._apiCallWithRetry(
            () => tripApi.createTrip(userId, backendTripData),
            '创建行程'
        )

        if (result.success && result.data) {
            // 转换后端返回的数据格式
            const convertedTrip = convertBackendTripToFrontend(result.data)
            if (convertedTrip) {
                result.data = convertedTrip

                // 清除用户行程列表缓存
                this.clearCache(`user_trips_${userId}`)
            }
        }

        return result
    }

    /**
     * 更新行程
     * @param {number} tripId 行程ID
     * @param {number} userId 用户ID
     * @param {Object} updateData 更新数据
     */
    async updateTrip(tripId, userId, updateData) {
        if (!tripId || !userId) {
            return {
                success: false,
                message: '行程ID和用户ID不能为空'
            }
        }

        // 转换前端数据格式为后端格式
        const backendUpdateData = convertFrontendTripToBackend(updateData)

        const result = await this._apiCallWithRetry(
            () => tripApi.updateTrip(tripId, userId, backendUpdateData),
            '更新行程'
        )

        if (result.success && result.data) {
            // 转换后端返回的数据格式
            const convertedTrip = convertBackendTripToFrontend(result.data)
            if (convertedTrip) {
                result.data = convertedTrip

                // 清除相关缓存
                this.clearCache(`trip_detail_${tripId}`)
                this.clearCache(`user_trips_${userId}`)
            }
        }

        return result
    }

    /**
     * 删除行程
     * @param {number} tripId 行程ID
     * @param {number} userId 用户ID
     */
    async deleteTrip(tripId, userId) {
        if (!tripId || !userId) {
            return {
                success: false,
                message: '行程ID和用户ID不能为空'
            }
        }

        const result = await this._apiCallWithRetry(
            () => tripApi.deleteTrip(tripId, userId),
            '删除行程'
        )

        if (result.success) {
            // 清除相关缓存
            this.clearCache(`trip_detail_${tripId}`)
            this.clearCache(`user_trips_${userId}`)
        }

        return result
    }

    /**
     * 复制行程
     * @param {number} tripId 行程ID
     * @param {number} userId 用户ID
     * @param {string} newTitle 新标题
     */
    async duplicateTrip(tripId, userId, newTitle) {
        if (!tripId || !userId) {
            return {
                success: false,
                message: '行程ID和用户ID不能为空'
            }
        }

        const result = await this._apiCallWithRetry(
            () => tripApi.duplicateTrip(tripId, userId, newTitle),
            '复制行程'
        )

        if (result.success && result.data) {
            // 转换后端返回的数据格式
            const convertedTrip = convertBackendTripToFrontend(result.data)
            if (convertedTrip) {
                result.data = convertedTrip

                // 清除用户行程列表缓存
                this.clearCache(`user_trips_${userId}`)
            }
        }

        return result
    }

    /**
     * 更新行程状态
     * @param {number} tripId 行程ID
     * @param {number} userId 用户ID
     * @param {number} status 状态值
     */
    async updateTripStatus(tripId, userId, status) {
        if (!tripId || !userId || status === undefined) {
            return {
                success: false,
                message: '行程ID、用户ID和状态不能为空'
            }
        }

        const result = await this._apiCallWithRetry(
            () => tripApi.updateTripStatus(tripId, userId, status),
            '更新行程状态'
        )

        if (result.success) {
            // 清除相关缓存
            this.clearCache(`trip_detail_${tripId}`)
            this.clearCache(`user_trips_${userId}`)
        }

        return result
    }

    // ==================== 行程分享功能 ====================

    /**
     * 生成分享码
     * @param {number} tripId 行程ID
     * @param {number} userId 用户ID
     */
    async generateShareCode(tripId, userId) {
        if (!tripId || !userId) {
            return {
                success: false,
                message: '行程ID和用户ID不能为空'
            }
        }

        const result = await this._apiCallWithRetry(
            () => tripApi.generateShareCode(tripId, userId),
            '生成分享码'
        )

        if (result.success) {
            // 清除行程详情缓存，因为分享码可能已更新
            this.clearCache(`trip_detail_${tripId}`)
        }

        return result
    }

    /**
     * 通过分享码获取行程
     * @param {string} shareCode 分享码
     */
    async getTripByShareCode(shareCode) {
        if (!shareCode) {
            return {
                success: false,
                message: '分享码不能为空'
            }
        }

        const cacheKey = this._generateCacheKey('shared_trip', shareCode)
        const cachedData = this._getFromCache(cacheKey)

        if (cachedData) {
            console.log('📂 使用缓存的分享行程数据')
            return { success: true, data: cachedData }
        }

        const result = await this._apiCallWithRetry(
            () => tripApi.getTripByShareCode(shareCode),
            '获取分享行程'
        )

        if (result.success && result.data) {
            // 转换后端数据格式
            const convertedTrip = convertBackendTripToFrontend(result.data)
            if (convertedTrip) {
                result.data = convertedTrip
                this._setCache(cacheKey, convertedTrip)
            }
        }

        return result
    }

    // ==================== AI行程生成功能 ====================

    /**
     * 生成AI行程
     * @param {number} userId 用户ID
     * @param {Object} generationParams 生成参数
     * @param {Object} options 选项
     */
    async generateAiTrip(userId, generationParams, options = {}) {
        if (!userId) {
            return {
                success: false,
                message: '用户ID不能为空'
            }
        }

        if (!generationParams || !generationParams.destination) {
            return {
                success: false,
                message: '生成参数不完整，缺少目的地信息'
            }
        }

        const { onProgress } = options

        try {
            // 构建AI请求数据
            const requestData = {
                userId: userId,
                ...generationParams,
                // 确保必要字段存在
                days: generationParams.days || 3,
                travelers: generationParams.travelers || 1,
                userType: generationParams.userType || 'normal'
            }

            // 开始生成进度
            if (onProgress) {
                onProgress({ message: '开始生成行程...', percent: 5 })
                await this._delay(300)

                onProgress({ message: '分析用户偏好...', percent: 15 })
                await this._delay(300)

                onProgress({ message: '构建提示词...', percent: 25 })
                await this._delay(300)

                onProgress({ message: '连接AI服务...', percent: 35 })
                await this._delay(300)

                onProgress({ message: 'AI正在生成行程...', percent: 55 })
            }

            // 调用后端AI接口
            const response = await http.post('/ai/trip/generate', requestData)

            if (onProgress) {
                onProgress({ message: '正在格式化结果...', percent: 90 })
                await this._delay(500)
            }

            if (response.code === 200) {
                if (onProgress) {
                    onProgress({ message: '行程生成完成！', percent: 100 })
                }

                // 处理成功结果
                const tripData = {
                    id: response.data.tripId,
                    content: response.data.content,
                    aiProvider: response.data.aiProvider,
                    processingTime: response.data.processingTime,
                    qualityScore: response.data.qualityScore,
                    destinationInfo: response.data.destinationInfo,
                    tripBasicInfo: response.data.tripBasicInfo,
                    title: `${generationParams.destinationName || generationParams.destination}${generationParams.days || 3}天行程`,
                    aiGenerated: true,
                    // 添加其他必要字段
                    destination: generationParams.destination,
                    destinationName: generationParams.destinationName,
                    days: generationParams.days || 3,
                    travelers: generationParams.travelers || 1,
                    budget: generationParams.budget || 0
                }

                console.log('✅ AI行程生成成功:', tripData)

                return {
                    success: true,
                    data: tripData,
                    message: `行程生成成功！质量评分：${response.data.qualityScore}`
                }
            } else {
                throw new Error(response.msg || '行程生成失败')
            }
        } catch (error) {
            return this._handleError(error, 'AI行程生成')
        }
    }

    /**
     * 保存AI生成的行程
     * @param {number} userId 用户ID
     * @param {Object} aiTripData AI行程数据
     * @param {Object} saveOptions 保存选项
     */
    async saveAiTrip(userId, aiTripData, saveOptions = {}) {
        if (!userId) {
            return {
                success: false,
                message: '用户ID不能为空'
            }
        }

        if (!aiTripData || !aiTripData.content) {
            return {
                success: false,
                message: 'AI行程数据不完整'
            }
        }

        try {
            // 构建保存请求数据
            const saveRequest = {
                userId: userId,
                title: saveOptions.title || aiTripData.title ||
                    `${aiTripData.destinationName || aiTripData.destination}${aiTripData.days || 3}天行程`,
                city: aiTripData.destination || aiTripData.destinationName,
                days: aiTripData.days || 3,
                travelers: aiTripData.travelers || 1,
                totalBudget: this._extractBudgetFromContent(aiTripData.content) || aiTripData.budget || null,
                aiContent: aiTripData.content,
                destinationInfo: JSON.stringify(aiTripData.destinationInfo || {}),
                tripBasicInfo: JSON.stringify(aiTripData.tripBasicInfo || {}),
                qualityScore: aiTripData.qualityScore || null,
                processingTime: aiTripData.processingTime || null,
                generationParams: JSON.stringify({
                    aiProvider: aiTripData.aiProvider || 'DeepSeek',
                    generatedAt: new Date().toISOString(),
                    ...saveOptions.generationParams
                }),
                feedbackRating: saveOptions.feedbackRating || null,
                feedbackContent: saveOptions.feedbackContent || null
            }

            const response = await http.post('/ai/trip/save', saveRequest)

            if (response.code === 200) {
                // 转换保存后的数据格式
                const savedTrip = convertBackendTripToFrontend(response.data)

                if (savedTrip) {
                    // 清除用户行程列表缓存
                    this.clearCache(`user_trips_${userId}`)

                    console.log('✅ AI行程保存成功:', savedTrip.title)

                    return {
                        success: true,
                        data: savedTrip,
                        message: 'AI行程保存成功'
                    }
                }
            }

            throw new Error(response.msg || '保存失败')
        } catch (error) {
            return this._handleError(error, '保存AI行程')
        }
    }

    /**
     * 从行程内容中提取预算信息
     * @param {string} content 行程内容
     * @returns {number|null} 预算金额
     */
    _extractBudgetFromContent(content) {
        if (!content) return null

        try {
            // 简单的预算提取逻辑，可以根据实际AI返回格式调整
            const budgetMatch = content.match(/预算[：:]\s*([￥¥]?\d+(?:[,，]\d{3})*(?:\.\d{2})?)/i)
            if (budgetMatch) {
                const budgetStr = budgetMatch[1].replace(/[￥¥,，]/g, '')
                const budget = parseFloat(budgetStr)
                return isNaN(budget) ? null : budget
            }

            // 尝试其他可能的格式
            const totalMatch = content.match(/总计[：:]\s*([￥¥]?\d+(?:[,，]\d{3})*(?:\.\d{2})?)/i)
            if (totalMatch) {
                const totalStr = totalMatch[1].replace(/[￥¥,，]/g, '')
                const total = parseFloat(totalStr)
                return isNaN(total) ? null : total
            }

            return null
        } catch (error) {
            console.warn('提取预算失败:', error)
            return null
        }
    }

    // ==================== 行程统计功能 ====================

    /**
     * 获取用户行程统计
     * @param {number} userId 用户ID
     */
    async getUserTripStats(userId) {
        if (!userId) {
            return {
                success: false,
                message: '用户ID不能为空'
            }
        }

        const cacheKey = this._generateCacheKey('trip_stats', userId)
        const cachedData = this._getFromCache(cacheKey)

        if (cachedData) {
            return { success: true, data: cachedData }
        }

        try {
            const response = await tripApi.countUserTrips(userId)
            const result = this._handleResponse(response, '获取行程统计')

            if (result.success) {
                this._setCache(cacheKey, result.data)
            }

            return result
        } catch (error) {
            return this._handleError(error, '获取行程统计')
        }
    }

    // ==================== 工具方法 ====================

    /**
     * 验证行程数据
     * @param {Object} tripData 行程数据
     * @returns {Object} 验证结果
     */
    validateTripData(tripData) {
        const errors = []

        if (!tripData) {
            errors.push('行程数据不能为空')
            return { valid: false, errors }
        }

        if (!tripData.title || tripData.title.trim().length === 0) {
            errors.push('行程标题不能为空')
        }

        if (!tripData.city || tripData.city.trim().length === 0) {
            errors.push('目的地不能为空')
        }

        if (!tripData.days || tripData.days < 1 || tripData.days > 30) {
            errors.push('行程天数必须在1-30天之间')
        }

        if (!tripData.travelers || tripData.travelers < 1 || tripData.travelers > 20) {
            errors.push('出行人数必须在1-20人之间')
        }

        return {
            valid: errors.length === 0,
            errors
        }
    }

    /**
     * 格式化行程标题
     * @param {Object} tripData 行程数据
     * @returns {string} 格式化后的标题
     */
    formatTripTitle(tripData) {
        if (!tripData) return '未知行程'

        const { destinationName, destination, days, travelers } = tripData
        const cityName = destinationName || destination || '未知目的地'
        const dayText = days ? `${days}天` : ''
        const travelerText = travelers && travelers > 1 ? `${travelers}人` : ''

        return `${cityName}${dayText}${travelerText}行程`.replace(/行程行程$/, '行程')
    }

    /**
     * 获取行程状态文本
     * @param {number} statusCode 状态码
     * @returns {string} 状态文本
     */
    getStatusText(statusCode) {
        switch (statusCode) {
            case 1:
                return '草稿'
            case 2:
                return '已发布'
            case 3:
                return '已完成'
            default:
                return '未知状态'
        }
    }

    /**
     * 计算行程完成度
     * @param {Object} tripData 行程数据
     * @returns {number} 完成度百分比
     */
    calculateCompletionRate(tripData) {
        if (!tripData) return 0

        let completedFields = 0
        const totalFields = 6

        if (tripData.title) completedFields++
            if (tripData.destination) completedFields++
                if (tripData.days > 0) completedFields++
                    if (tripData.travelers > 0) completedFields++
                        if (tripData.budget > 0) completedFields++
                            if (tripData.dailyPlan && tripData.dailyPlan.length > 0) completedFields++

                                return Math.round((completedFields / totalFields) * 100)
    }
}

// 创建服务实例
export const tripService = new TripService()

// 开发环境下暴露到全局，便于调试
if (process.env.NODE_ENV === 'development') {
    window.tripService = tripService
}

export default TripService