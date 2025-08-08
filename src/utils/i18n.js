import { ref, computed } from 'vue'
import zhCN from '../locales/zh-CN.js'
import enUS from '../locales/en-US.js'

// 支持的语言
export const SUPPORTED_LOCALES = {
    'zh-CN': '简体中文',
    'en-US': 'English'
}

// 语言包映射
const messages = {
    'zh-CN': zhCN,
    'en-US': enUS
}

// 当前语言设置
const currentLocale = ref(localStorage.getItem('locale') || 'zh-CN')

// 切换语言函数
export const setLocale = (locale) => {
    if (SUPPORTED_LOCALES[locale]) {
        currentLocale.value = locale
        localStorage.setItem('locale', locale)
            // 设置 HTML lang 属性
        document.documentElement.lang = locale
    }
}

// 获取当前语言
export const getLocale = () => currentLocale.value

// 国际化函数
export const t = (key, params = {}) => {
    const keys = key.split('.')
    let message = messages[currentLocale.value]

    for (const k of keys) {
        if (message && typeof message === 'object') {
            message = message[k]
        } else {
            // 如果找不到翻译，尝试使用中文作为后备
            if (currentLocale.value !== 'zh-CN') {
                let fallback = messages['zh-CN']
                for (const k of keys) {
                    if (fallback && typeof fallback === 'object') {
                        fallback = fallback[k]
                    } else {
                        fallback = key // 最终后备：返回键名
                        break
                    }
                }
                message = fallback
            } else {
                message = key // 返回键名作为后备
            }
            break
        }
    }

    if (typeof message !== 'string') {
        return key
    }

    // 简单的参数替换
    return message.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] !== undefined ? params[param] : match
    })
}

// 创建响应式的翻译函数
export const useI18n = () => {
    const locale = computed(() => currentLocale.value)

    const tt = (key, params = {}) => {
        // 触发响应式更新
        locale.value
        return t(key, params)
    }

    return {
        t: tt,
        locale,
        setLocale,
        getLocale,
        supportedLocales: SUPPORTED_LOCALES
    }
}

// 初始化语言设置
export const initI18n = () => {
    const savedLocale = localStorage.getItem('locale')
    if (savedLocale && SUPPORTED_LOCALES[savedLocale]) {
        setLocale(savedLocale)
    } else {
        // 尝试从浏览器语言检测
        const browserLang = navigator.language || navigator.userLanguage
        if (browserLang.startsWith('zh')) {
            setLocale('zh-CN')
        } else {
            setLocale('en-US')
        }
    }
}

// 格式化日期的国际化
export const formatDate = (date, options = {}) => {
    if (!date) return ''

    const locale = currentLocale.value === 'zh-CN' ? 'zh-CN' : 'en-US'
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }

    try {
        return new Intl.DateTimeFormat(locale, {...defaultOptions, ...options }).format(new Date(date))
    } catch (error) {
        return date.toString()
    }
}

// 格式化数字的国际化
export const formatNumber = (number, options = {}) => {
    if (number === undefined || number === null) return ''

    const locale = currentLocale.value === 'zh-CN' ? 'zh-CN' : 'en-US'

    try {
        return new Intl.NumberFormat(locale, options).format(number)
    } catch (error) {
        return number.toString()
    }
}

// 格式化货币
export const formatCurrency = (amount, currency = 'CNY') => {
    const locale = currentLocale.value === 'zh-CN' ? 'zh-CN' : 'en-US'
    const currencyMap = {
        'zh-CN': 'CNY',
        'en-US': 'USD'
    }

    const targetCurrency = currency || currencyMap[currentLocale.value] || 'CNY'

    return formatNumber(amount, {
        style: 'currency',
        currency: targetCurrency
    })
}