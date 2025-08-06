/**
 * 统一错误处理工具
 */
import { ElMessage, ElNotification } from 'element-plus';

/**
 * API错误处理
 * @param {Error} error - 错误对象
 * @param {string} defaultMessage - 默认错误消息
 * @param {Object} options - 配置选项
 */
export function handleApiError(error, defaultMessage = '操作失败', options = {}) {
    const {
        showNotification = false, // 是否显示通知而不是消息
            duration = 3000,
            logError = true
    } = options;

    let errorMessage = defaultMessage;
    let errorCode = 'UNKNOWN_ERROR';

    // 记录错误日志
    if (logError) {
        console.error('API错误:', error);
    }

    // 解析错误信息
    if (error?.response) {
        // HTTP响应错误
        const { status, data } = error.response;
        errorCode = `HTTP_${status}`;

        switch (status) {
            case 400:
                errorMessage = data?.msg || '请求参数错误';
                break;
            case 401:
                errorMessage = '登录已过期，请重新登录';
                // 可以在这里处理登录跳转
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1000);
                break;
            case 403:
                errorMessage = '没有权限执行此操作';
                break;
            case 404:
                errorMessage = '请求的资源不存在';
                break;
            case 422:
                errorMessage = data?.msg || '数据验证失败';
                break;
            case 429:
                errorMessage = '请求过于频繁，请稍后重试';
                break;
            case 500:
                errorMessage = '服务器内部错误，请稍后重试';
                break;
            case 502:
            case 503:
            case 504:
                errorMessage = '服务暂时不可用，请稍后重试';
                break;
            default:
                errorMessage = data?.msg || `服务器错误 (${status})`;
        }
    } else if (error?.request) {
        // 网络错误
        errorCode = 'NETWORK_ERROR';
        errorMessage = '网络连接失败，请检查网络';
    } else if (error?.message) {
        // 其他错误
        errorMessage = error.message;
        errorCode = 'CLIENT_ERROR';
    }

    // 显示错误消息
    if (showNotification) {
        ElNotification.error({
            title: '操作失败',
            message: errorMessage,
            duration
        });
    } else {
        ElMessage.error({
            message: errorMessage,
            duration
        });
    }

    return {
        message: errorMessage,
        code: errorCode,
        originalError: error
    };
}

/**
 * 业务逻辑错误处理
 * @param {string} message - 错误消息
 * @param {Object} options - 配置选项
 */
export function handleBusinessError(message, options = {}) {
    const {
        type = 'error', // error, warning, info
            showNotification = false,
            duration = 3000
    } = options;

    if (showNotification) {
        ElNotification[type]({
            title: type === 'error' ? '操作失败' : '提示',
            message,
            duration
        });
    } else {
        ElMessage[type]({
            message,
            duration
        });
    }
}

/**
 * 成功消息处理
 * @param {string} message - 成功消息
 * @param {Object} options - 配置选项
 */
export function handleSuccess(message, options = {}) {
    const {
        showNotification = false,
            duration = 2000
    } = options;

    if (showNotification) {
        ElNotification.success({
            title: '操作成功',
            message,
            duration
        });
    } else {
        ElMessage.success({
            message,
            duration
        });
    }
}

/**
 * 表单验证错误处理
 * @param {Object} errors - 验证错误对象
 */
export function handleValidationErrors(errors) {
    if (!errors || typeof errors !== 'object') {
        return;
    }

    // 显示第一个验证错误
    const firstError = Object.values(errors)[0];
    if (Array.isArray(firstError) && firstError.length > 0) {
        ElMessage.error(firstError[0]);
    } else if (typeof firstError === 'string') {
        ElMessage.error(firstError);
    }
}

/**
 * 异步操作包装器，统一处理错误
 * @param {Function} asyncFn - 异步函数
 * @param {string} errorMessage - 错误消息
 * @param {Object} options - 配置选项
 */
export async function withErrorHandling(asyncFn, errorMessage = '操作失败', options = {}) {
    try {
        const result = await asyncFn();
        return { success: true, data: result };
    } catch (error) {
        const errorInfo = handleApiError(error, errorMessage, options);
        return {
            success: false,
            error: errorInfo,
            message: errorInfo.message
        };
    }
}