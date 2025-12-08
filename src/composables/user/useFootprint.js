/**
 * 足迹管理组合函数
 * 提供足迹相关的响应式状态和方法
 */
import { ref, computed } from 'vue'
import { footprintService } from '@/services/user/footprintService.js'
import { useUserStore } from '@/store/user.js'
// import { useWishlist } from './useWishlist.js' // 避免循环依赖

export function useFootprint() {
    // 状态
    const visitedCities = ref([])
    const loading = ref(false)

    // 计算属性
    const visitedCount = computed(() => visitedCities.value.length)

    // 方法

    /**
     * 加载足迹城市
     */
    const loadVisitedCities = async(retryCount = 0, maxRetries = 3) => {
        const userStore = useUserStore()
        const userId = (userStore.currentUser && userStore.currentUser.id) || userStore.userId
        if (!userId) {
            if (retryCount < maxRetries && userStore.isLoggedIn) {
                setTimeout(() => {
                    loadVisitedCities(retryCount + 1, maxRetries)
                }, 500)
                return
            }

            if (!userStore.isLoggedIn) {
                visitedCities.value = []
            }
            return
        }

        if (loading.value) return
        loading.value = true
        try {
            const data = await footprintService.loadUserVisitedCities(userId)
            visitedCities.value = data
        } catch (error) {
            if (retryCount < maxRetries && (error.code === 'NETWORK_ERROR' || error.status >= 500)) {
                setTimeout(() => {
                    loadVisitedCities(retryCount + 1, maxRetries)
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
     * 添加访问过的城市
     */
    const addVisitedCity = async(cityData) => {
        // 检查是否已经在足迹中
        const existingCity = getVisitedCityByCityCode(cityData.cityCode || cityData.adcode)
        if (existingCity) {
            return false
        }

        try {
            const newCityRecord = await footprintService.addVisitedCity(cityData)
            visitedCities.value.push(newCityRecord)
            return true
        } catch (error) {
            return false
        }
    }

    /**
     * 删除访问城市记录
     */
    const deleteVisitedCity = async(cityId) => {
        const userStore = useUserStore()
        const userId = (userStore.currentUser && userStore.currentUser.id) || userStore.userId

        if (!userId) return false

        try {
            console.log("🔄 开始删除城市记录，cityId:", cityId, "类型:", typeof cityId)
            console.log("📊 当前本地状态中的城市记录:", visitedCities.value.map(city => ({ id: city.id, name: city.cityName, type: typeof city.id })))

            // 调用后端API删除
            await footprintService.deleteVisitedCity(cityId)
            console.log("✅ 后端删除成功")

            // 从本地状态中移除 - 使用更宽松的比较
            const index = visitedCities.value.findIndex(city =>
                String(city.id) === String(cityId) || city.id === cityId
            )

            if (index !== -1) {
                const cityName = visitedCities.value[index].cityName
                const adcode = visitedCities.value[index].adcode

                console.log(`🗑️ 找到要删除的城市记录: ${cityName} (index: ${index})`)
                visitedCities.value.splice(index, 1)
                console.log("✅ 本地状态已更新，剩余城市数量:", visitedCities.value.length)

                // 处理相关的wishlist记录
                await _cleanupRelatedWishlistRecord(adcode, userId, cityName)

                return true
            } else {
                console.warn("⚠️ 在本地状态中未找到要删除的城市记录，cityId:", cityId)
                console.warn("⚠️ 可能的原因：数据类型不匹配或数据未正确加载")

                // 即使本地状态没找到，也返回true，因为后端删除成功了
                // 触发重新加载数据
                await loadVisitedCities()
                return true
            }
        } catch (error) {
            console.error("❌ 删除城市记录失败:", error)
            return false
        }
    }

    /**
     * 更新城市信息
     */
    const updateCityInfo = async(cityId, updateData) => {
        try {
            const updatedData = await footprintService.updateCityInfo(cityId, updateData)

            // 更新本地状态
            const index = visitedCities.value.findIndex(city => city.id === cityId)
            if (index !== -1) {
                visitedCities.value[index] = {
                    ...visitedCities.value[index],
                    ...updatedData
                }
            }

            return updatedData
        } catch (error) {
            return false
        }
    }

    /**
     * 计算足迹统计
     */
    const calculateFootprintStats = (wishlistItems = []) => {
        return footprintService.calculateFootprintStats(visitedCities.value, wishlistItems)
    }

    /**
     * 检查城市是否已访问
     */
    const isCityVisited = (cityCode) => {
        return footprintService.isCityVisited(cityCode, visitedCities.value)
    }

    /**
     * 根据城市编码获取足迹城市记录
     */
    const getVisitedCityByCityCode = (cityCode) => {
        return footprintService.getVisitedCityByCityCode(cityCode, visitedCities.value)
    }

    /**
     * 清空足迹城市
     */
    const clearVisitedCities = () => {
        visitedCities.value = []
    }

    /**
     * 私有方法：清理相关的wishlist记录
     * 注意：这个方法需要在Store层调用，避免循环依赖
     */
    const _cleanupRelatedWishlistRecord = async(adcode, userId, cityName) => {
        // 这个方法的实现移动到Store层，避免循环依赖
        console.log("🔄 需要清理相关的wishlist记录:", { adcode, userId, cityName })
            // 实际清理逻辑在Store层的deleteVisitedCity方法中实现
    }

    return {
        // 状态
        visitedCities,
        loading,

        // 计算属性
        visitedCount,

        // 方法
        loadVisitedCities,
        addVisitedCity,
        deleteVisitedCity,
        updateCityInfo,
        calculateFootprintStats,
        isCityVisited,
        getVisitedCityByCityCode,
        clearVisitedCities,
    }
}