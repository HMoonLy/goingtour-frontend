/**
 * 愿望清单业务服务
 * 处理愿望清单相关的业务逻辑和数据转换
 */
import { wishlistApi } from '@/api/wishlist.js'
import { cityPhotosApi } from '@/api/cityPhotos.js'
import { ElMessage } from 'element-plus'

class WishlistService {
    constructor() {
        this.retryConfig = {
            maxRetries: 3,
            retryDelay: 1000
        }
    }

    /**
     * 加载用户愿望清单数据
     */
    async loadUserWishlist(userId, retryCount = 0) {
        if (!userId) {
            throw new Error('用户ID不能为空')
        }

        try {
            const response = await wishlistApi.getUserWishlist(userId)

            if (response && response.data) {
                return response.data
            } else {
                console.warn("⚠️ 心愿城市API返回的数据格式异常:", response)
                return []
            }
        } catch (error) {
            if (retryCount < this.retryConfig.maxRetries &&
                (error.code === 'NETWORK_ERROR' || error.status >= 500)) {

                console.log(`🔄 重试加载愿望清单 (${retryCount + 1}/${this.retryConfig.maxRetries})`)
                await this._delay((retryCount + 1) * this.retryConfig.retryDelay)
                return this.loadUserWishlist(userId, retryCount + 1)
            }

            console.error("❌ 加载愿望清单失败:", error)
            throw error
        }
    }

    /**
     * 添加城市到愿望清单
     */
    async addCityToWishlist(userId, cityData) {
        if (!userId) {
            throw new Error('用户未登录')
        }

        // 标准化城市数据
        const normalizedCityData = this._normalizeCityData(cityData)

        try {
            // 增强城市数据
            const enhancedCityData = await this._enhanceCityData(normalizedCityData)

            const wishData = {
                userId,
                adcode: enhancedCityData.adcode,
                citycode: enhancedCityData.citycode,
                cityName: enhancedCityData.cityName,
                reason: enhancedCityData.reason || "",
                tags: enhancedCityData.tags || [],
                ever_visited: enhancedCityData.ever_visited,
                want_to_visit_again: enhancedCityData.want_to_visit_again,
            }

            const response = await wishlistApi.addToWishlist(wishData)

            if (response.data) {
                const newItem = {
                    id: response.data.id,
                    ...wishData,
                    createdAt: new Date().toISOString(),
                }

                ElMessage.success(`已将 ${cityData.cityName} 添加到愿望清单`)
                return newItem
            }

            throw new Error('添加失败')
        } catch (error) {
            console.error("❌ 添加到愿望清单失败:", error)
            ElMessage.error("添加失败，请重试")
            throw error
        }
    }

    /**
     * 从愿望清单删除城市
     */
    async removeCityFromWishlist(wishlistId, userId) {
        if (!userId) {
            throw new Error('用户未登录')
        }

        try {
            await wishlistApi.removeFromWishlist(wishlistId, userId)
            return true
        } catch (error) {
            console.error("❌ 从愿望清单删除失败:", error)
            ElMessage.error("删除失败，请重试")
            throw error
        }
    }

    /**
     * 更新愿望清单项
     */
    async updateWishlistItem(wishlistId, userId, updateData) {
        if (!userId) {
            throw new Error('用户未登录')
        }

        try {
            await wishlistApi.updateWishlistItem(wishlistId, {
                userId,
                ...updateData,
            })

            const updatedItem = {
                ...updateData,
                updatedAt: new Date().toISOString(),
            }

            ElMessage.success("愿望清单更新成功")
            return updatedItem
        } catch (error) {
            console.error("❌ 更新愿望清单失败:", error)
            ElMessage.error("更新失败，请重试")
            throw error
        }
    }

    /**
     * 标记城市为已去过
     */
    async markCityAsVisited(wishlistId, userId) {
        const updateData = {
            ever_visited: true,
            want_to_visit_again: false,
            visit_date: new Date().toISOString(),
        }

        return this.updateWishlistItem(wishlistId, userId, updateData)
    }

    /**
     * 批量标记城市为已去过
     */
    async batchMarkAsVisited(cityIds, userId) {
        if (!userId) {
            throw new Error('用户未登录')
        }

        try {
            const updatePromises = cityIds.map((id) =>
                wishlistApi.updateWishlistItem(id, {
                    userId,
                    ever_visited: true,
                    want_to_visit_again: false,
                    visit_date: new Date().toISOString()
                })
            )

            await Promise.all(updatePromises)

            ElMessage.success(`已批量标记 ${cityIds.length} 个城市为去过`)
            return true
        } catch (error) {
            console.error("❌ 批量标记为去过失败:", error)
            ElMessage.error("批量操作失败，请重试")
            throw error
        }
    }

    /**
     * 标记想再去状态
     */
    async markWantToVisitAgain(cityIdOrData, userId, wantToVisit = true) {
        if (!userId) {
            throw new Error('用户未登录')
        }

        try {
            // 处理从visited city转换的情况
            if (typeof cityIdOrData === 'object' && cityIdOrData.adcode) {
                const cityData = cityIdOrData

                if (wantToVisit) {
                    // 将已去过的城市添加到心愿清单
                    const response = await wishlistApi.addFromVisitedCity(
                        userId,
                        cityData.adcode,
                        cityData.cityName,
                        cityData.citycode
                    )

                    ElMessage.success(`已将 ${cityData.cityName} 标记为想再去`)
                    return response.data
                } else {
                    // 这种情况需要在上层处理，因为需要访问store状态
                    throw new Error('取消想再去需要在上层处理')
                }
            } else {
                // 传统的wishlist ID更新方式
                const wishlistId = cityIdOrData
                const updateData = { want_to_visit_again: wantToVisit }

                return this.updateWishlistItem(wishlistId, userId, updateData)
            }
        } catch (error) {
            console.error("❌ 更新想再去状态失败:", error)
            ElMessage.error("操作失败，请重试")
            throw error
        }
    }

    /**
     * 数据工具方法
     */

    /**
     * 标准化城市数据
     */
    _normalizeCityData(cityData) {
        return {
            ...cityData,
            cityCode: cityData.cityCode || cityData.adcode,
            adcode: cityData.adcode || cityData.cityCode
        }
    }

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

export const wishlistService = new WishlistService()