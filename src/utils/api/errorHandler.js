/**
 * API错误处理工具
 */
import { ElMessage } from 'element-plus'

/**
 * 处理API错误的通用函数
 * @param {Error} error - 错误对象
 * @param {string} defaultMessage - 默认错误消息
 * @param {Object} options - 配置选项
 */
function handleApiError(error, defaultMessage = '操作失败', options = {}) {
    const {
        showMessage = true,
            logError = true,
            rethrow = false
    } = options

    let message = defaultMessage
    let code = 'UNKNOWN_ERROR'

    if (error?.response) {
        // HTTP错误响应
        const status = error.response.status
        const data = error.response.data

        code = `HTTP_${status}`

        if (data?.msg) {
            message = data.msg
        } else if (data?.message) {
            message = data.message
        } else {
            switch (status) {
                case 400:
                    message = '请求参数错误'
                    break
                case 401:
                    message = '用户未登录或登录已过期'
                    break
                case 403:
                    message = '没有权限执行此操作'
                    break
                case 404:
                    message = '请求的资源不存在'
                    break
                case 500:
                    message = '服务器内部错误'
                    break
                default:
                    message = `请求失败 (${status})`
            }
        }
    } else if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
        // 网络错误
        code = 'NETWORK_ERROR'
        message = '网络连接失败，请检查网络设置'
    } else if (error?.message) {
        // 其他错误
        message = error.message
    }

    if (logError) {
        console.error('API错误:', error)
    }

    if (showMessage) {
        ElMessage.error(message)
    }

    const result = {
        success: false,
        message,
        code,
        originalError: error
    }

    if (rethrow) {
        throw result
    }

    return result
}

/**
 * 通用的异步函数错误处理包装器
 * @param {Function} asyncFn - 要执行的异步函数
 * @param {string} errorMessage - 错误时显示的消息
 * @param {Object} options - 配置选项
 */
async function withErrorHandling(asyncFn, errorMessage = '操作失败', options = {}) {
    try {
        const result = await asyncFn()
        return {
            success: true,
            data: result
        }
    } catch (error) {
        return handleApiError(error, errorMessage, options)
    }
}

/**
 * 创建带重试机制的错误处理器
 * @param {Function} asyncFn - 要执行的异步函数
 * @param {Object} retryOptions - 重试配置
 */
function withRetry(asyncFn, retryOptions = {}) {
    const {
        maxRetries = 3,
            retryDelay = 1000,
            retryCondition = (error) => error?.code === 'NETWORK_ERROR'
    } = retryOptions

    return async function(...args) {
        let lastError

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await asyncFn(...args)
            } catch (error) {
                lastError = error

                if (attempt === maxRetries || !retryCondition(error)) {
                    throw error
                }

                // 等待后重试
                await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
            }
        }

        throw lastError
    }
}

/**
 * 验证响应数据格式
 * @param {any} data - 响应数据
 * @param {Object} schema - 验证模式
 */
function validateResponse(data, schema = {}) {
    const {
        requiredFields = [],
            allowEmpty = false
    } = schema

    if (!allowEmpty && (!data || Object.keys(data).length === 0)) {
        throw new Error('响应数据为空')
    }

    for (const field of requiredFields) {
        if (!(field in data)) {
            throw new Error(`响应数据缺少必需字段: ${field}`)
        }
    }

    return true
}

/**
 * 处理成功消息
 * @param {string} message - 成功消息
 * @param {object} options - 配置选项
 * @param {string} options.title - 通知标题
 * @param {boolean} options.showNotification - 是否显示通知
 * @param {number} options.duration - 显示持续时间
 * @param {boolean} options.showClose - 是否显示关闭按钮
 */
function handleSuccess(message, options = {}) {
    const {
        title = '操作成功',
            showNotification = false,
            duration = 3000,
            showClose = true
    } = options

    try {
        // 动态导入 Element Plus 组件来避免循环依赖
        import ('element-plus').then(({ ElMessage, ElNotification }) => {
            if (showNotification && ElNotification) {
                ElNotification({
                    title,
                    message,
                    type: 'success',
                    duration,
                    showClose
                })
            } else if (ElMessage) {
                ElMessage({
                    message,
                    type: 'success',
                    duration,
                    showClose
                })
            }
        }).catch(() => {
            // 如果 Element Plus 不可用，则使用控制台输出
            console.log('Success:', message)
        })
    } catch (error) {
        console.error('Failed to show success message:', error)
        console.log('Original success message:', message)
    }

    return {
        message,
        type: 'success',
        title,
        timestamp: new Date().toISOString()
    }
}

/**
 * 处理业务逻辑错误
 * @param {string} message - 错误消息
 * @param {object} options - 配置选项
 * @param {string} options.type - 消息类型 ('success', 'warning', 'info', 'error')
 * @param {number} options.duration - 显示持续时间
 * @param {boolean} options.showClose - 是否显示关闭按钮
 */
function handleBusinessError(message, options = {}) {
    const {
        type = 'error',
            duration = 3000,
            showClose = true
    } = options

    try {
        // 动态导入 ElMessage 来避免循环依赖
        import ('element-plus').then(({ ElMessage }) => {
            ElMessage({
                message,
                type,
                duration,
                showClose
            })
        }).catch(() => {
            // 如果 ElMessage 不可用，则使用原生 alert
            console.error('Business Error:', message)
            if (type === 'error') {
                alert(`错误: ${message}`)
            }
        })
    } catch (error) {
        console.error('Failed to show business error:', error)
        console.error('Original business error:', message)
    }

    return {
        message,
        type,
        timestamp: new Date().toISOString()
    }
}

export {
    handleApiError,
    handleBusinessError,
    handleSuccess,
    withErrorHandling,
    withRetry,
    validateResponse
}

export default {
    handleApiError,
    handleBusinessError,
    handleSuccess,
    withErrorHandling,
    withRetry,
    validateResponse
}