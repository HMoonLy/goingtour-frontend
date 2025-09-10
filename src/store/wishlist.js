/**
 * 愿望清单 Store - 轻量化全局状态管理
 * 整合愿望清单、足迹和照片的统一状态管理
 */
import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { useWishlist } from "@/composables/useWishlist.js"
import { useFootprint } from "@/composables/useFootprint.js"
import { usePhotos } from "@/composables/usePhotos.js"

export const useWishlistStore = defineStore("wishlist", () => {
    // 使用组合函数
    const wishlist = useWishlist()
    const footprint = useFootprint()
    const photos = usePhotos()

    // 天气轮播相关状态
    const currentWeatherCity = ref(null)

    // 整合的计算属性
    const totalCitiesCount = computed(() =>
        wishlist.wishlistCount.value + footprint.visitedCount.value
    )

    const hasCities = computed(() => totalCitiesCount.value > 0)

    // 足迹统计
    const footprintStats = computed(() =>
        footprint.calculateFootprintStats(wishlist.wishlistItems.value)
    )

    // 所有城市名称（心愿+足迹）
    const cityNames = computed(() => [
        ...wishlist.wishlistItems.value.map((item) => item.cityName),
        ...footprint.visitedCities.value.map((item) => item.cityName),
    ])

    // 所有城市编码（心愿+足迹）
    const cityCodes = computed(() => [
        ...wishlist.wishlistItems.value.map((item) => item.cityCode),
        ...footprint.visitedCities.value.map((item) => item.adcode || item.cityCode),
    ])

    // 获取随机城市（用于天气轮播）- 优先选择足迹城市
    const getRandomCity = computed(() => {
        const allCities = [...footprint.visitedCities.value, ...wishlist.wishlistItems.value]
        if (allCities.length === 0) return null
        const randomIndex = Math.floor(Math.random() * allCities.length)
        return allCities[randomIndex]
    })

    // 已探索的省份数量（基于足迹城市）
    const exploredProvincesCount = computed(() => {
        const provinces = new Set()

        footprint.visitedCities.value.forEach((city) => {
            const cityCode = city.adcode || city.cityCode
            if (cityCode) {
                const provinceCode = cityCode.toString().substring(0, 2)
                provinces.add(provinceCode)
            }
        })

        return provinces.size
    })

    // 整合的方法

    /**
     * 加载所有数据（愿望清单和足迹城市）
     */
    const loadWishlist = async(retryCount = 0, maxRetries = 3) => {
        await Promise.all([
            wishlist.loadWishlist(retryCount, maxRetries),
            footprint.loadVisitedCities(retryCount, maxRetries)
        ])
    }

    /**
     * 添加城市到系统（自动判断是愿望清单还是足迹）
     */
    const addToWishlist = async(cityData) => {
        // 如果是添加去过的城市，使用足迹API
        if (cityData.ever_visited) {
            return await footprint.addVisitedCity(cityData)
        } else {
            return await wishlist.addToWishlist(cityData)
        }
    }

    /**
     * 检查城市是否在系统中（心愿清单或足迹）
     */
    const isCityInWishlist = (cityCode) => {
        return wishlist.isCityInWishlistToVisit(cityCode) ||
            footprint.isCityVisited(cityCode)
    }

    /**
     * 根据城市编码获取城市记录（优先返回心愿清单项）
     */
    const getWishlistItemByCityCode = (cityCode) => {
        // 先检查心愿清单
        const wishlistItem = wishlist.getWishlistItemByCityCode(cityCode)
        if (wishlistItem) return wishlistItem

        // 再检查足迹城市
        const visitedItem = footprint.getVisitedCityByCityCode(cityCode)
        return visitedItem
    }

    /**
     * 天气轮播相关方法
     */
    const setCurrentWeatherCity = (city) => {
        currentWeatherCity.value = city
    }

    const getNextWeatherCity = () => {
        if (!hasCities.value) return null

        // 优先使用足迹城市，然后是心愿城市
        const allCities = [...footprint.visitedCities.value, ...wishlist.wishlistItems.value]

        const currentIndex = currentWeatherCity.value ?
            allCities.findIndex(
                (item) => item.id === currentWeatherCity.value.id,
            ) :
            -1

        const nextIndex = (currentIndex + 1) % allCities.length
        const nextCity = allCities[nextIndex]

        setCurrentWeatherCity(nextCity)
        return nextCity
    }

    /**
     * 清空所有数据
     */
    const clearWishlist = () => {
        wishlist.clearWishlist()
        footprint.clearVisitedCities()
        currentWeatherCity.value = null
    }

    /**
     * 删除访问城市记录（重写以处理wishlist清理）
     */
    const deleteVisitedCity = async(cityId) => {
        const result = await footprint.deleteVisitedCity(cityId)

        if (result) {
            // 在Store层处理wishlist清理，避免循环依赖
            const deletedCity = footprint.visitedCities.value.find(city => city.id === cityId)
            if (deletedCity) {
                const wishlistItem = wishlist.wishlistItems.value.find(
                    item => item.adcode === deletedCity.adcode && item.ever_visited
                )

                if (wishlistItem) {
                    if (wishlistItem.want_to_visit_again) {
                        // 如果还想再去，保留记录但标记为未去过
                        await wishlist.updateWishlistItem(wishlistItem.id, {
                            ever_visited: false,
                            want_to_visit_again: true,
                            visit_date: null
                        })
                    } else {
                        // 如果不想再去，完全删除wishlist记录
                        await wishlist.removeFromWishlist(wishlistItem.id)
                    }
                }
            }
        }

        return result
    }

    return {
        // 从组合函数导出的状态和方法
        ...wishlist,
        ...footprint,
        ...photos,

        // 天气轮播状态
        currentWeatherCity,

        // 整合的计算属性
        totalCitiesCount,
        hasCities,
        footprintStats,
        cityNames,
        cityCodes,
        getRandomCity,
        exploredProvincesCount,

        // 重写的整合方法
        loadWishlist,
        addToWishlist,
        isCityInWishlist,
        getWishlistItemByCityCode,
        deleteVisitedCity, // 重写的删除方法

        // 天气轮播方法
        setCurrentWeatherCity,
        getNextWeatherCity,

        // 清理方法
        clearWishlist,
    }
})