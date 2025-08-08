import { computed } from 'vue'
import zhCN from '../locales/zh-CN.js'

// 纯中文文本映射系统
const messages = zhCN

export const t = (key, params = {}) => {
    const keys = key.split('.')
    let message = messages

    for (const k of keys) {
        if (message && typeof message === 'object') {
            message = message[k]
        } else {
            message = key
            break
        }
    }

    if (typeof message !== 'string') return key
    return message.replace(/\{(\w+)\}/g, (match, param) => (params[param] !== undefined ? params[param] : match))
}

export const useI18n = () => {
    const locale = computed(() => 'zh-CN')
    return { t, locale }
}

// 为兼容现有组件，提供这些函数但固定返回中文
export const getLocale = () => 'zh-CN'

export const setLocale = (locale) => {
    // 空实现，固定为中文，避免组件报错
    console.warn('语言切换功能已移除，应用固定使用中文')
}

export const supportedLocales = ['zh-CN']

export const locale = computed(() => 'zh-CN')

export const initI18n = () => {
    document.documentElement.lang = 'zh-CN'
}

export const formatDate = (date, options = {}) => {
    if (!date) return ''
    const defaultOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    try { return new Intl.DateTimeFormat('zh-CN', {...defaultOptions, ...options }).format(new Date(date)) } catch { return String(date) }
}

export const formatNumber = (number, options = {}) => {
    if (number === undefined || number === null) return ''
    try { return new Intl.NumberFormat('zh-CN', options).format(number) } catch { return String(number) }
}

export const formatCurrency = (amount, currency = 'CNY') => {
    return formatNumber(amount, { style: 'currency', currency: 'CNY' })
}