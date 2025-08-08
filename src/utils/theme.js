import { ref, computed } from 'vue'

// 支持的主题模式
export const THEME_MODES = {
    light: 'light',
    dark: 'dark',
    system: 'system'
}

// 当前主题模式
const currentTheme = ref(localStorage.getItem('theme') || 'system')

// 系统主题检测
const prefersDark = ref(false)

// 初始化主题检测
const initThemeDetection = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        prefersDark.value = mediaQuery.matches

        // 监听系统主题变化
        mediaQuery.addEventListener('change', (e) => {
            prefersDark.value = e.matches
            applyTheme()
        })
    }
}

// 计算实际应用的主题
const actualTheme = computed(() => {
    if (currentTheme.value === 'system') {
        return prefersDark.value ? 'dark' : 'light'
    }
    return currentTheme.value
})

// 应用主题到DOM
const applyTheme = () => {
    const theme = actualTheme.value
    const htmlElement = document.documentElement

    // 移除所有主题类
    htmlElement.classList.remove('light-theme', 'dark-theme')

    // 添加当前主题类
    htmlElement.classList.add(`${theme}-theme`)

    // 设置CSS变量属性
    htmlElement.setAttribute('data-theme', theme)

    // 更新Element Plus主题
    if (theme === 'dark') {
        htmlElement.classList.add('dark')
    } else {
        htmlElement.classList.remove('dark')
    }
}

// 设置主题
export const setTheme = (theme) => {
    if (THEME_MODES[theme]) {
        currentTheme.value = theme
        localStorage.setItem('theme', theme)
        applyTheme()
    }
}

// 获取当前主题
export const getTheme = () => currentTheme.value

// 获取实际应用的主题
export const getActualTheme = () => actualTheme.value

// 主题组合函数
export const useTheme = () => {
    return {
        currentTheme: computed(() => currentTheme.value),
        actualTheme,
        setTheme,
        getTheme,
        getActualTheme,
        themeOptions: {
            light: { label: '浅色模式', value: 'light' },
            dark: { label: '深色模式', value: 'dark' },
            system: { label: '跟随系统', value: 'system' }
        }
    }
}

// 初始化主题
export const initTheme = () => {
    initThemeDetection()
    applyTheme()
}

// 切换主题（用于快速切换）
export const toggleTheme = () => {
    const current = actualTheme.value
    setTheme(current === 'light' ? 'dark' : 'light')
}