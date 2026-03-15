/**
 * 足迹管理业务服务
 * 处理足迹城市相关的业务逻辑和数据转换
 */
import { cityPhotosApi } from '@/api/cityPhotos.js'
import { wishlistApi } from '@/api/wishlist.js'
import { handleApiError } from '@/utils/api/errorHandler.js'
import { notify } from '@/utils/ui/notify.js'

class FootprintService {
    constructor() {
        this.retryConfig = {
            maxRetries: 3,
            retryDelay: 1000
        }
    }

    /**
     * 加载用户足迹城市数据
     */
    async loadUserVisitedCities(userId, retryCount = 0) {
        if (!userId) {
            throw new Error('用户ID不能为空')
        }

        try {
            const response = await cityPhotosApi.getUserVisitedCities(userId)

            if (response && response.data) {
                // 增强城市数据，确保有完整的adcode和citycode信息
                try {
                    const { enhanceCitiesWithCodes } = await
                    import ('@/utils/cityCodeUtils.js')
                    const enhancedCities = await enhanceCitiesWithCodes(response.data)
                    console.log('✅ 足迹城市数据已增强:', enhancedCities.length, '个城市')
                    return enhancedCities
                } catch (error) {
                    console.warn('⚠️ 增强城市数据失败，使用原始数据:', error)
                    return response.data
                }
            } else {
                console.warn("⚠️ 足迹城市API返回的数据格式异常:", response)
                return []
            }
        } catch (error) {
            if (retryCount < this.retryConfig.maxRetries &&
                (error.code === 'NETWORK_ERROR' || error.status >= 500)) {

                console.log(`🔄 重试加载足迹城市 (${retryCount + 1}/${this.retryConfig.maxRetries})`)
                await this._delay((retryCount + 1) * this.retryConfig.retryDelay)
                return this.loadUserVisitedCities(userId, retryCount + 1)
            }

            console.error("❌ 加载足迹城市失败:", error)
            throw error
        }
    }

    /**
     * 添加访问过的城市
     */
    async addVisitedCity(cityData, options = {}) {
        const { showMessage = true } = options
        try {
            // 增强城市数据
            const enhancedCityData = await this._enhanceCityData(cityData)

            // 使用visitedCities API添加去过的城市
            const response = await cityPhotosApi.addVisitedCity({
                adcode: enhancedCityData.adcode,
                citycode: enhancedCityData.citycode,
                cityName: enhancedCityData.cityName,
                travelTime: enhancedCityData.travelTime,
                travelFeeling: enhancedCityData.travelFeeling,
                tags: enhancedCityData.tags || [],
            })

            if (response.data) {
                if (showMessage) {
                    notify.success(`已将 ${cityData.cityName} 添加到足迹`)
                }

                // 创建新的城市记录
                const newCityRecord = {
                    id: response.data.id || Date.now(),
                    adcode: enhancedCityData.adcode,
                    cityCode: enhancedCityData.adcode, // 兼容性
                    cityName: enhancedCityData.cityName,
                    travelTime: enhancedCityData.travelTime,
                    travelFeeling: enhancedCityData.travelFeeling,
                    tags: enhancedCityData.tags || [],
                    photos: [], // 新添加的城市还没有照片
                    createdAt: new Date().toISOString(),
                    ...response.data
                }

                return newCityRecord
            }

            throw new Error('添加失败')
        } catch (error) {
            console.error("❌ 添加去过的城市失败:", error)
            handleApiError(error, "添加失败，请重试", {
                showMessage,
                logError: false
            })
            throw error
        }
    }

    /**
     * 删除访问城市记录
     */
    async deleteVisitedCity(cityId) {
        try {
            await cityPhotosApi.deleteVisitedCity(cityId)
            return true
        } catch (error) {
            console.error("❌ 删除访问城市记录失败:", error)
            handleApiError(error, "删除失败，请重试", {
                logError: false
            })
            throw error
        }
    }

    /**
     * 更新城市信息
     */
    async updateCityInfo(cityId, updateData, options = {}) {
        const { showMessage = false } = options
        try {
            const response = await cityPhotosApi.updateCityInfo(cityId, updateData)

            if (response.data) {
                if (showMessage) {
                    notify.success("城市信息更新成功")
                }
                return response.data
            } else {
                throw new Error("更新失败")
            }
        } catch (error) {
            console.error("❌ 更新城市信息失败:", error)
            handleApiError(error, "更新城市信息失败，请重试", {
                showMessage,
                logError: false
            })
            throw error
        }
    }

    /**
     * 清理相关的wishlist记录
     * 当删除足迹城市时，处理相关的愿望清单记录
     */
    async cleanupRelatedWishlistRecord(adcode, userId) {
        // 这个方法需要在上层调用，因为需要访问wishlist状态
        // 这里只是定义接口，实际逻辑在composable中处理
        throw new Error('此方法需要在上层实现')
    }

    /**
     * 计算足迹统计
     */
    calculateFootprintStats(visitedCities, wishlistItems) {
        const visitedCount = visitedCities.length
        const wishlistOnlyCount = wishlistItems.filter(item => !item.ever_visited).length

        // 计算探索的省份数量
        const provinces = new Set()
        visitedCities.forEach((city) => {
            const cityCode = city.adcode || city.cityCode
            if (cityCode) {
                const provinceCode = cityCode.toString().substring(0, 2)
                provinces.add(provinceCode)
            }
        })

        return {
            totalCities: visitedCount + wishlistOnlyCount,
            visitedCities: visitedCount,
            wishlistCities: wishlistOnlyCount,
            exploredProvinces: provinces.size,
        }
    }

    /**
     * 检查城市是否已访问
     */
    isCityVisited(cityCode, visitedCities) {
        return visitedCities.some((item) => (item.adcode || item.cityCode) === cityCode)
    }

    /**
     * 根据城市编码获取足迹城市记录
     */
    getVisitedCityByCityCode(cityCode, visitedCities) {
        return visitedCities.find((item) => (item.adcode || item.cityCode) === cityCode)
    }

    /**
     * 数据工具方法
     */

    /**
     * 增强城市数据
     */
    async _enhanceCityData(cityData) {
        try {
            const { findCityByName, findCityByAdcode } = await
            import ('@/utils/cityCodeUtils.js')

            let enhancedCityData = {...cityData }

            // 如果有adcode但缺少citycode，尝试查找完整信息
            if (cityData.adcode && !cityData.citycode) {
                const cityInfo = await findCityByAdcode(cityData.adcode)
                if (cityInfo) {
                    enhancedCityData = {...enhancedCityData, ...cityInfo }
                }
            } else if (cityData.cityName && !cityData.adcode) {
                const cityInfo = await findCityByName(cityData.cityName)
                if (cityInfo) {
                    enhancedCityData = {...enhancedCityData, ...cityInfo }
                }
            }

            return enhancedCityData
        } catch (error) {
            console.warn('⚠️ 增强城市数据失败，使用原始数据:', error)
            return cityData
        }
    }

    /**
     * 延迟工具方法
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

export const footprintService = new FootprintService()
