import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

// 创建axios实例
const request = axios.create({
    baseURL: '/api', // 基础URL，与vite.config.js中的proxy配置对应
    timeout: 10000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
})

/**
 * 发起HTTP请求前的处理函数
 * @param {object} config - 请求配置
 * @returns {object} 处理后的请求配置
 */
const requestHandler = (config) => {
    // 添加时间戳防止缓存
    const timestamp = Date.now();

    // 根据请求方法设置参数
    if (config.method === 'get') {
        config.params = {
            ...config.params,
            _t: timestamp
        };
    }

    // 打印API请求信息（避免显示API密钥）
    let logParams = {...config.params };

    // 隐藏敏感信息
    if (logParams && logParams.key) {
        logParams.key = '***隐藏***';
    }

    console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`, logParams);

    return config;
};

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        // 添加token（如果存在）
        const token = localStorage.getItem('goingtour_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // 显示loading（可选，根据配置决定）
        if (config.loading !== false) {
            // 这里可以添加全局loading逻辑
            // store.commit('setGlobalLoading', true)
        }

        // 使用请求处理函数处理请求
        return requestHandler(config);
    },
    (error) => {
        // 对请求错误做些什么
        console.error('❌ Request Error:', error)
        ElMessage.error('请求配置错误')
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    (response) => {
        // 对响应数据做点什么
        const { data } = response

        // 处理统一的后端响应格式 {code: 200, msg: "success", data: {}}
        if (data.code !== undefined) {
            if (data.code === 200) {
                // 成功响应
                return data
            } else {
                // 业务错误
                const errorMsg = data.msg || '请求失败'

                // 根据错误类型显示不同的提示
                if (data.code >= 1000 && data.code < 2000) {
                    // 用户相关错误 (1xxx)
                    ElMessage.warning(errorMsg)
                } else if (data.code >= 2000 && data.code < 3000) {
                    // 行程相关错误 (2xxx)
                    ElMessage.warning(errorMsg)
                } else if (data.code >= 3000 && data.code < 4000) {
                    // 数据相关错误 (3xxx)
                    ElMessage.warning(errorMsg)
                } else if (data.code >= 9000) {
                    // 业务逻辑错误 (9xxx)
                    ElMessage.error(errorMsg)
                } else {
                    ElMessage.error(errorMsg)
                }

                return Promise.reject(new Error(errorMsg))
            }
        }

        // 非统一格式响应，直接返回
        return data
    },
    (error) => {
        // 对响应错误做点什么
        console.error('❌ API Response Error:', error)

        let errorMessage = '请求失败'

        if (error.response) {
            // 服务器响应了错误状态码
            const { status, data } = error.response

            switch (status) {
                case 400:
                    errorMessage = data && data.msg ? data.msg : '请求参数错误'
                    ElMessage.error(errorMessage)
                    break
                case 401:
                    errorMessage = '未授权，请重新登录'
                    ElMessage.warning(errorMessage)
                        // 清除token并跳转到登录页
                    localStorage.removeItem('goingtour_token')
                    localStorage.removeItem('goingtour_user')
                    window.location.href = '/login'
                    break
                case 403:
                    errorMessage = '拒绝访问'
                    ElMessage.error(errorMessage)
                    break
                case 404:
                    errorMessage = '请求的资源不存在'
                    ElMessage.error(errorMessage)
                    break
                case 500:
                    errorMessage = '服务器内部错误'
                    ElMessage.error(errorMessage)
                    break
                default:
                    errorMessage = data && data.msg ? data.msg : `请求失败 (${status})`
                    ElMessage.error(errorMessage)
            }
        } else if (error.request) {
            // 请求已发出但没有收到响应
            errorMessage = '网络连接失败，请检查网络'
            ElMessage.error(errorMessage)
        } else {
            // 其他错误
            errorMessage = error.message || '请求配置错误'
            ElMessage.error(errorMessage)
        }

        return Promise.reject(new Error(errorMessage))
    }
)

// 封装常用的HTTP方法
export const http = {
    /**
     * GET请求
     * @param {string} url 请求URL
     * @param {object} params 请求参数
     * @param {object} config 额外配置
     */
    get(url, params , config = {}) {
        return request({
            method: 'get',
            url,
            params,
            ...config
        })
    },

    /**
     * POST请求
     * @param {string} url 请求URL
     * @param {object} data 请求数据
     * @param {object} config 额外配置
     */
    post(url, data = {}, config = {}) {
        return request({
            method: 'post',
            url,
            data,
            ...config
        })
    },

    /**
     * PUT请求
     * @param {string} url 请求URL
     * @param {object} data 请求数据
     * @param {object} config 额外配置
     */
    put(url, data = {}, config = {}) {
        return request({
            method: 'put',
            url,
            data,
            ...config
        })
    },

    /**
     * DELETE请求
     * @param {string} url 请求URL
     * @param {object} config 额外配置
     */
    delete(url, config = {}) {
        return request({
            method: 'delete',
            url,
            ...config
        })
    },

    /**
     * 文件上传
     * @param {string} url 上传URL
     * @param {FormData} formData 文件数据
     * @param {object} config 额外配置
     */
    upload(url, formData, config = {}) {
        return request({
            method: 'post',
            url,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            ...config
        })
    }
}

// 导出axios实例（如果需要更复杂的自定义）
export default request