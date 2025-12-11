/**
 * 天气状态管理组合函数
 * 处理天气数据的获取、缓存和状态管理
 */

import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { weatherService } from '@/services/common/weatherService.js'

export function useWeather() {
    // 响应式状态
    const currentWeather = ref(null)
    const forecastWeather = ref(null)
    const weatherSuggestions = ref(null)
    const isLoading = ref(false)
    const isLoadingForecast = ref(false)
    const isLoadingSuggestions = ref(false)
    const error = ref(null)

    // 计算属性
    const hasWeatherData = computed(() => {
        return currentWeather.value || forecastWeather.value
    })

    const weatherSummary = computed(() => {
        if (!currentWeather.value) return null

        return {
            city: currentWeather.value.city,
            weather: currentWeather.value.weather,
            temperature: currentWeather.value.temperature,
            windInfo: `${currentWeather.value.winddirection}风 ${currentWeather.value.windpower}级`,
            humidity: `湿度 ${currentWeather.value.humidity}%`,
            isLive: currentWeather.value.isLive,
            isMock: currentWeather.value.isMock
        }
    })

    const forecastSummary = computed(() => {
        if (!forecastWeather.value || !forecastWeather.value.casts) return null

        const casts = forecastWeather.value.casts.slice(0, 4) // 取前4天
        return casts.map(cast => ({
            date: cast.date,
            weather: cast.dayweather,
            tempRange: `${cast.nighttemp}°C - ${cast.daytemp}°C`,
            dayTemp: cast.daytemp,
            nightTemp: cast.nighttemp
        }))
    })

    const temperatureRange = computed(() => {
        if (!forecastSummary.value) return null

        const temps = forecastSummary.value.map(day => ({
            high: parseInt(day.dayTemp),
            low: parseInt(day.nightTemp)
        }))

        return {
            maxTemp: Math.max(...temps.map(t => t.high)),
            minTemp: Math.min(...temps.map(t => t.low)),
            avgTemp: Math.round(temps.reduce((sum, t) => sum + (t.high + t.low) / 2, 0) / temps.length)
        }
    })

    // 方法

    /**
     * 获取实时天气
     */
    const fetchCurrentWeather = async(city) => {
        if (!city) {
            error.value = '城市名称不能为空'
            return
        }

        try {
            isLoading.value = true
            error.value = null

            console.log('获取实时天气:', city)

            const result = await weatherService.getLiveWeather(city)
            currentWeather.value = result

            if (result.isMock) {
                ElMessage.warning({
                    message: '天气服务暂时不可用，显示模拟数据',
                    duration: 3000
                })
            }

            return result

        } catch (err) {
            console.error('获取实时天气失败:', err)
            error.value = err.message || '获取天气信息失败'

            ElMessage.error({
                message: '获取天气信息失败，请稍后重试',
                duration: 3000
            })

            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 获取天气预报
     */
    const fetchForecastWeather = async(city) => {
        if (!city) {
            error.value = '城市名称不能为空'
            return
        }

        try {
            isLoadingForecast.value = true
            error.value = null

            console.log('获取天气预报:', city)

            const result = await weatherService.getForecastWeather(city)
            forecastWeather.value = result

            if (result.isMock) {
                ElMessage.warning({
                    message: '天气预报服务暂时不可用，显示模拟数据',
                    duration: 3000
                })
            }

            return result

        } catch (err) {
            console.error('获取天气预报失败:', err)
            error.value = err.message || '获取天气预报失败'

            ElMessage.error({
                message: '获取天气预报失败，请稍后重试',
                duration: 3000
            })

            throw err
        } finally {
            isLoadingForecast.value = false
        }
    }

    /**
     * 获取天气建议
     */
    const fetchWeatherSuggestions = async(city, startDate, days = 7) => {
        if (!city || !startDate) {
            error.value = '参数不完整'
            return
        }

        try {
            isLoadingSuggestions.value = true
            error.value = null

            console.log('获取天气建议:', { city, startDate, days })

            const result = await weatherService.getWeatherSuggestions(city, startDate, days)
            weatherSuggestions.value = result

            if (result.isMock) {
                ElMessage.warning({
                    message: '天气建议服务暂时不可用，显示通用建议',
                    duration: 3000
                })
            } else if (result.isHistorical) {
                ElMessage.info({
                    message: '使用历史天气数据生成建议',
                    duration: 2000
                })
            }

            return result

        } catch (err) {
            console.error('获取天气建议失败:', err)
            error.value = err.message || '获取天气建议失败'

            ElMessage.error({
                message: '获取天气建议失败，请稍后重试',
                duration: 3000
            })

            throw err
        } finally {
            isLoadingSuggestions.value = false
        }
    }

    /**
     * 获取完整天气信息（实时 + 预报）
     */
    const fetchCompleteWeatherInfo = async(city) => {
        const results = await Promise.allSettled([
            fetchCurrentWeather(city),
            fetchForecastWeather(city)
        ])

        const currentResult = results[0].status === 'fulfilled'?results[0].value : null
        const forecastResult = results[1].status === 'fulfilled'?results[1].value : null

        return {
            current: currentResult,
            forecast: forecastResult,
            hasErrors: results.some(r => r.status === 'rejected')
        }
    }

    /**
     * 刷新天气数据
     */
    const refreshWeatherData = async(city) => {
        // 清除缓存
        weatherService.clearCache()

        // 重新获取数据
        return await fetchCompleteWeatherInfo(city)
    }

    /**
     * 清除天气数据
     */
    const clearWeatherData = () => {
        currentWeather.value = null
        forecastWeather.value = null
        weatherSuggestions.value = null
        error.value = null
    }


    return {
        // 状态
        currentWeather,
        forecastWeather,
        weatherSuggestions,
        isLoading,
        isLoadingForecast,
        isLoadingSuggestions,
        error,

        // 计算属性
        hasWeatherData,
        weatherSummary,
        forecastSummary,
        temperatureRange,

        // 方法
        fetchCurrentWeather,
        fetchForecastWeather,
        fetchWeatherSuggestions,
        fetchCompleteWeatherInfo,
        refreshWeatherData,
        clearWeatherData
    }
}