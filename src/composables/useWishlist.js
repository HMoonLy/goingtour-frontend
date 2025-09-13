/**
 * 愿望清单组合函数
 * 提供愿望清单相关的响应式状态和方法
 */
import { ref, computed } from 'vue'
import { wishlistService } from '@/services/wishlistService.js'
import { useUserAuth } from '@/composables/useUser.js'

export function useWishlist() {
    // 使用用户认证组合函数
    const { requireUserReady, userId, waitForUserReady } = useUserAuth()

    // 状态
    const wishlistItems = ref([])
    const loading = ref(false)

    // 计算属性
    const wishlistCount = computed(() => wishlistItems.value.length)

    const wishlistCities = computed(() =>
        wishlistItems.value.filter(item => !item.ever_visited)
    )

    const wantToVisitAgainCities = computed(() =>
        wishlistItems.value.filter(item => item.ever_visited && item.want_to_visit_again)
    )

    const wishlistOnlyCount = computed(() => wishlistCities.value.length)
    const wantToVisitAgainCount = computed(() => wantToVisitAgainCities.value.length)

    // 方法

    /**
     * 加载愿望清单
     */
    const loadWishlist = async(retryCount = 0, maxRetries = 3) => {
        // 使用新的用户验证逻辑
        if (!requireUserReady({ showMessage: false })) {
            console.warn("⚠️ 用户未登录，无法加载愿望清单")

            // 如果有重试次数，等待用户状态就绪
            if (retryCount < maxRetries) {
                const userReady = await waitForUserReady(1000)
                if (userReady) {
                    return loadWishlist(retryCount + 1, maxRetries)
                }
            }

            wishlistItems.value = []
            return
        }

        if (loading.value) return

        loading.value = true
        try {
            const data = await wishlistService.loadUserWishlist(userId.value)
            wishlistItems.value = data
        } catch (error) {
            if (retryCount < maxRetries && (error.code === 'NETWORK_ERROR' || error.status >= 500)) {
                setTimeout(() => {
                    loadWishlist(retryCount + 1, maxRetries)
                }, (retryCount + 1) * 1000)
                return
            }

            if (retryCount >= maxRetries) {
                console.error("💥 重试次数已达上限，加载失败")
            }
        } finally {
            loading.value = false
        }
    }

    /**
     * 添加城市到愿望清单
     */
    const addToWishlist = async(cityData) => {
        if (!requireUserReady()) {
            return false
        }

        // 检查是否已存在该城市
        const existingCity = getWishlistItemByCityCode(cityData.cityCode || cityData.adcode)
        if (existingCity) {
            if (existingCity.ever_visited && !existingCity.want_to_visit_again) {
                return await markWantToVisitAgain(existingCity.id, true)
            } else if (existingCity.want_to_visit_again || !existingCity.ever_visited) {
                return false
            }
        }

        try {
            const newItem = await wishlistService.addCityToWishlist(userId.value, cityData)
            wishlistItems.value.push(newItem)
            return true
        } catch (error) {
            return false
        }
    }

    /**
     * 从愿望清单删除城市
     */
    const removeFromWishlist = async(wishlistId) => {
        if (!requireUserReady()) {
            return false
        }

        try {
            await wishlistService.removeCityFromWishlist(wishlistId, userId.value)

            const index = wishlistItems.value.findIndex(item => item.id === wishlistId)
            if (index !== -1) {
                const cityName = wishlistItems.value[index].cityName
                wishlistItems.value.splice(index, 1)
            }

            return true
        } catch (error) {
            return false
        }
    }

    /**
     * 标记城市为已去过
     */
    const markAsVisited = async(wishlistId) => {
        const userStore = useUserStore()
        const userId = userStore.currentUser ? .id || userStore.userId

        if (!userId) return false

        try {
            const updatedData = await wishlistService.markCityAsVisited(wishlistId, userId)

            const index = wishlistItems.value.findIndex(item => item.id === wishlistId)
            if (index !== -1) {
                wishlistItems.value[index] = {
                    ...wishlistItems.value[index],
                    ...updatedData
                }
            }

            return true
        } catch (error) {
            return false
        }
    }

    /**
     * 标记是否想再去
     */
    const markWantToVisitAgain = async(cityIdOrData, wantToVisit = true) => {
        const userStore = useUserStore()
        const userId = userStore.currentUser ? .id || userStore.userId

        if (!userId) return false

        try {
            // 处理从visited city转换的情况
            if (typeof cityIdOrData === 'object' && cityIdOrData.adcode) {
                const cityData = cityIdOrData

                if (wantToVisit) {
                    const newWishlistItem = await wishlistService.markWantToVisitAgain(
                        cityData, userId, wantToVisit
                    )
                    wishlistItems.value.push(newWishlistItem)
                    return true
                } else {
                    // 取消想再去：需要从wishlist中移除对应的记录
                    const wishlistItem = wishlistItems.value.find(
                        item => item.adcode === cityData.adcode &&
                        item.ever_visited &&
                        item.want_to_visit_again
                    )

                    if (wishlistItem) {
                        return await removeFromWishlist(wishlistItem.id)
                    } else {
                        console.warn("⚠️ 未找到要取消的wishlist项")
                        return false
                    }
                }
            } else {
                // 传统的wishlist ID更新方式
                const wishlistId = cityIdOrData
                const updatedData = await wishlistService.markWantToVisitAgain(
                    wishlistId, userId, wantToVisit
                )

                const index = wishlistItems.value.findIndex(item => item.id === wishlistId)
                if (index !== -1) {
                    wishlistItems.value[index] = {
                        ...wishlistItems.value[index],
                        ...updatedData
                    }
                }

                return true
            }
        } catch (error) {
            return false
        }
    }

    /**
     * 批量标记城市状态
     */
    const batchMarkAsVisited = async(cityIds) => {
        const userStore = useUserStore()
        const userId = userStore.currentUser ? .id || userStore.userId

        if (!userId) return false

        try {
            await wishlistService.batchMarkAsVisited(cityIds, userId)

            // 更新本地状态
            cityIds.forEach((id) => {
                const index = wishlistItems.value.findIndex((item) => item.id === id)
                if (index !== -1) {
                    wishlistItems.value[index] = {
                        ...wishlistItems.value[index],
                        ever_visited: true,
                        want_to_visit_again: false,
                        visit_date: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }
                }
            })

            return true
        } catch (error) {
            return false
        }
    }

    /**
     * 更新愿望清单项
     */
    const updateWishlistItem = async(wishlistId, updateData) => {
        const userStore = useUserStore()
        const userId = userStore.currentUser ? .id || userStore.userId

        if (!userId) return false

        try {
            const updatedData = await wishlistService.updateWishlistItem(
                wishlistId, userId, updateData
            )

            const index = wishlistItems.value.findIndex(item => item.id === wishlistId)
            if (index !== -1) {
                wishlistItems.value[index] = {
                    ...wishlistItems.value[index],
                    ...updatedData
                }
            }

            return true
        } catch (error) {
            return false
        }
    }

    /**
     * 检查城市是否在心愿清单中
     */
    const isCityInWishlistToVisit = (cityCode) => {
        return wishlistItems.value.some((item) => item.cityCode === cityCode)
    }

    /**
     * 根据城市编码获取城市记录
     */
    const getWishlistItemByCityCode = (cityCode) => {
        return wishlistItems.value.find((item) => item.cityCode === cityCode)
    }

    /**
     * 清空愿望清单
     */
    const clearWishlist = () => {
        wishlistItems.value = []
    }

    return {
        // 状态
        wishlistItems,
        loading,

        // 计算属性
        wishlistCount,
        wishlistCities,
        wantToVisitAgainCities,
        wishlistOnlyCount,
        wantToVisitAgainCount,

        // 方法
        loadWishlist,
        addToWishlist,
        removeFromWishlist,
        markAsVisited,
        markWantToVisitAgain,
        batchMarkAsVisited,
        updateWishlistItem,
        isCityInWishlistToVisit,
        getWishlistItemByCityCode,
        clearWishlist,
    }
}