/**
 * 天气业务逻辑服务层
 * 处理天气数据的业务逻辑、数据转换和缓存
 */

import { weatherApi } from '@/api/weather.js'

class WeatherService {
    constructor() {
        this.cache = new Map()
        this.cacheExpiry = 10 * 60 * 1000 // 10分钟缓存
    }

    /**
     * 获取缓存键
     */
    getCacheKey(type, city) {
        return `${type}_${city}`
    }

    /**
     * 检查缓存是否有效
     */
    isCacheValid(cacheData) {
        if (!cacheData) return false
        return Date.now() - cacheData.timestamp < this.cacheExpiry
    }

    /**
     * 设置缓存
     */
    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        })
    }

    /**
     * 获取缓存
     */
    getCache(key) {
        const cacheData = this.cache.get(key)
        if (this.isCacheValid(cacheData)) {
            return cacheData.data
        }
        this.cache.delete(key)
        return null
    }

    /**
     * 清除缓存
     */
    clearCache() {
        this.cache.clear()
    }

    /**
     * 转换实时天气数据
     */
    transformLiveWeatherData(apiData) {
        if (!apiData || apiData.status !== '1' || !apiData.lives || !apiData.lives[0]) {
            throw new Error('无效的天气数据')
        }

        const liveData = apiData.lives[0]
        return {
            city: liveData.city,
            province: liveData.province,
            weather: liveData.weather,
            temperature: liveData.temperature,
            winddirection: liveData.winddirection,
            windpower: liveData.windpower,
            humidity: liveData.humidity,
            reporttime: liveData.reporttime,
            isLive: true,
            isMock: false
        }
    }

    /**
     * 转换预报天气数据
     */
    transformForecastWeatherData(apiData) {
        if (!apiData || apiData.status !== '1' || !apiData.forecasts || !apiData.forecasts[0]) {
            throw new Error('无效的天气预报数据')
        }

        const forecastData = apiData.forecasts[0]
        const casts = forecastData.casts.map(cast => ({
            date: cast.date,
            week: this.getWeekDay(cast.week),
            dayweather: cast.dayweather,
            nightweather: cast.nightweather,
            daytemp: cast.daytemp,
            nighttemp: cast.nighttemp,
            daywind: cast.daywind,
            nightwind: cast.nightwind,
            daypower: cast.daypower,
            nightpower: cast.nightpower,
            daytemp_float: parseFloat(cast.daytemp_float),
            nighttemp_float: parseFloat(cast.nighttemp_float),
            // 添加WeatherSummary期望的字段
            dayWeather: cast.dayweather,
            nightWeather: cast.nightweather,
            dayTemp: cast.daytemp,
            nightTemp: cast.nighttemp
        }))

        // 计算温度范围
        const temps = casts.map(cast => ({
            high: parseInt(cast.daytemp),
            low: parseInt(cast.nighttemp)
        }))
        const maxTemp = Math.max(...temps.map(t => t.high))
        const minTemp = Math.min(...temps.map(t => t.low))

        // 返回符合WeatherSummary组件期望的数据结构
        return {
            city: forecastData.city,
            province: forecastData.province,
            adcode: forecastData.adcode,
            reporttime: forecastData.reporttime,
            // WeatherSummary期望的字段
            currentTemp: casts[0]?.daytemp || '--',
            currentWeather: casts[0]?.dayweather || '晴',
            weatherDesc: casts[0]?.dayweather || '晴',
            tempRange: `${minTemp}°-${maxTemp}°`,
            forecast: casts,
            tips: [], // 出行建议，可以根据天气条件生成
            // 原始数据结构保持兼容
            casts: casts,
            isMock: false
        }
    }

    /**
     * 转换星期数字为中文
     */
    getWeekDay(weekNumber) {
        console.log(weekNumber);
        
        const weekDays = [ '一', '二', '三', '四', '五', '六','日']
        return `星期${weekDays[parseInt(weekNumber-1)]}`
    }

    /**
     * 获取实时天气
     */
    async getLiveWeather(city) {
        const cacheKey = this.getCacheKey('live', city)
        const cached = this.getCache(cacheKey)
        if (cached) {
            console.log('使用缓存的实时天气数据:', city)
            return cached
        }

        try {
            console.log('请求实时天气:', city)
            const response = await weatherApi.getLiveWeather(city)
            const transformedData = this.transformLiveWeatherData(response)

            this.setCache(cacheKey, transformedData)
            return transformedData

        } catch (error) {
            console.error('获取实时天气失败:', error)

            // 返回模拟数据
            const mockData = this.getMockLiveWeather(city)
            this.setCache(cacheKey, mockData)
            return mockData
        }
    }

    /**
     * 获取天气预报
     */
    async getForecastWeather(city) {
        const cacheKey = this.getCacheKey('forecast', city)
        const cached = this.getCache(cacheKey)
        if (cached) {
            console.log('使用缓存的天气预报数据:', city)
            return cached
        }

        try {
            console.log('请求天气预报:', city)
            const response = await weatherApi.getForecastWeather(city)
            const transformedData = this.transformForecastWeatherData(response)

            this.setCache(cacheKey, transformedData)
            return transformedData

        } catch (error) {
            console.error('获取天气预报失败:', error)

            // 返回模拟数据
            const mockData = this.getMockForecastWeather(city)
            this.setCache(cacheKey, mockData)
            return mockData
        }
    }

    /**
     * 获取天气建议
     */
    async getWeatherSuggestions(city, startDate, days = 7) {
        try {
            // 获取天气预报数据作为基础
            const forecast = await this.getForecastWeather(city)

            // 基于天气数据生成建议
            return this.generateWeatherSuggestions(forecast, startDate, days)

        } catch (error) {
            console.error('获取天气建议失败:', error)
            return this.getMockWeatherSuggestions(city, startDate, days)
        }
    }

    /**
     * 生成天气建议
     */
    generateWeatherSuggestions(forecast, startDate, days) {
        const suggestions = {
            city: forecast.city,
            period: `${startDate} 起 ${days} 天`,
            clothing: [],
            activities: [],
            tips: [],
            isMock: false
        }

        if (forecast.casts && forecast.casts.length > 0) {
            const temps = forecast.casts.map(cast => ({
                high: parseInt(cast.daytemp),
                low: parseInt(cast.nighttemp)
            }))

            const maxTemp = Math.max(...temps.map(t => t.high))
            const minTemp = Math.min(...temps.map(t => t.low))
            const hasRain = forecast.casts.some(cast =>
                cast.dayweather.includes('雨') || cast.nightweather.includes('雨')
            )

            // 衣物建议
            if (maxTemp >= 30) {
                suggestions.clothing.push('短袖T恤', '短裤/短裙', '凉鞋', '防晒帽')
                suggestions.tips.push('天气炎热，注意防晒和补水')
            } else if (minTemp <= 5) {
                suggestions.clothing.push('厚外套/羽绒服', '毛衣', '长裤', '保暖鞋')
                suggestions.tips.push('天气寒冷，注意保暖')
            } else {
                suggestions.clothing.push('薄外套', '长袖衬衫', '长裤', '运动鞋')
                if (maxTemp - minTemp > 10) {
                    suggestions.tips.push('早晚温差较大，建议准备可增减的衣物')
                }
            }

            // 活动建议
            if (hasRain) {
                suggestions.activities.push('博物馆参观', '购物中心', '室内娱乐场所')
                suggestions.tips.push('有降水天气，建议安排室内活动')
            } else {
                suggestions.activities.push('户外景点游览', '公园漫步', '街头摄影')
                suggestions.tips.push('天气晴好，适合户外活动')
            }

            if (hasRain) {
                suggestions.clothing.push('雨伞', '防水外套')
            }
        }

        return suggestions
    }
}

// 创建单例实例
export const weatherService = new WeatherService()