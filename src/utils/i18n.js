import { computed } from 'vue'
import zhCN from '../locales/zh-CN.js'

// 固定中文：剔除多语言切换相关逻辑
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