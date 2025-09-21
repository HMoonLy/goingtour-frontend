/**
 * 高德地图状态管理组合函数
 * 提供地图搜索、POI获取、坐标查询等功能的响应式状态管理
 */

import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { amapService, POI_TYPES, SEARCH_KEYWORDS } from '@/services/amapService.js'

export function useAmap() {
    // ==================== 响应式状态 ====================

    // 搜索相关状态
    const searchResults = ref([])
    const isSearching = ref(false)
    const searchError = ref(null)
    const lastSearchParams = ref({})

    // POI详情状态
    const currentPoi = ref(null)
    const isLoadingPoi = ref(false)
    const poiError = ref(null)

    // 坐标查询状态
    const coordinates = ref({})
    const isLoadingCoordinates = ref(false)
    const coordinateError = ref(null)

    // 批量坐标查询状态
    const batchCoordinates = ref({})
    const isBatchLoading = ref(false)
    const batchProgress = ref(0)
    const batchError = ref(null)

    // 搜索历史和缓存
    const searchHistory = ref([])
    const cache = reactive(new Map())

    // ==================== 计算属性 ====================

    const hasSearchResults = computed(() => {
        return searchResults.value && searchResults.value.length > 0
    })

    const searchResultsCount = computed(() => {
        return searchResults.value?searchResults.value.length : 0
    })

    const isAnyLoading = computed(() => {
        return isSearching.value || isLoadingPoi.value || isLoadingCoordinates.value || isBatchLoading.value
    })

    const searchStats = computed(() => {
        if (!searchResults.value || searchResults.value.length === 0) {
            return null
        }

        const stats = {
            total: searchResults.value.length,
            hasPhotos: 0,
            hasRating: 0,
            avgRating: 0,
            types: {}
        }

        let totalRating = 0
        let ratingCount = 0

        searchResults.value.forEach(poi => {
            if (poi.photos && poi.photos.length > 0) {
                stats.hasPhotos++
            }

            if (poi.rating && poi.rating !== '暂无评分') {
                stats.hasRating++
                    const rating = parseFloat(poi.rating)
                if (!isNaN(rating)) {
                    totalRating += rating
                    ratingCount++
                }
            }

            if (poi.type) {
                stats.types[poi.type] = (stats.types[poi.type] || 0) + 1
            }
        })

        stats.avgRating = ratingCount > 0?(totalRating / ratingCount).toFixed(1) : 0

        return stats
    })

    // ==================== 搜索功能 ====================

    /**
     * 搜索POI
     * @param {Object} params - 搜索参数
     * @param {string} params.keywords - 搜索关键词
     * @param {string} params.city - 城市名称
     * @param {string} [params.types] - POI类型
     * @param {number} [params.page=1] - 页码
     * @param {number} [params.pageSize=10] - 每页大小
     * @param {boolean} [params.enhance=true] - 是否增强数据
     * @param {boolean} [params.useCache=true] - 是否使用缓存
     */
    const searchPlaces = async(params) => {
        const {
            keywords,
            city,
            types,
            page = 1,
            pageSize = 10,
            enhance = true,
            useCache = true
        } = params

        // 参数验证
        if (!keywords || !city) {
            const errorMsg = '搜索关键词和城市名称不能为空'
            searchError.value = errorMsg
            ElMessage.error(errorMsg)
            return
        }

        // 生成缓存键
        const cacheKey = `search_${keywords}_${city}_${types || 'all'}_${page}_${pageSize}`

        // 检查缓存
        if (useCache && cache.has(cacheKey)) {
            const cachedData = cache.get(cacheKey)
            if (Date.now() - cachedData.timestamp < 5 * 60 * 1000) { // 5分钟缓存
                searchResults.value = cachedData.data
                lastSearchParams.value = params
                return cachedData.data
            }
        }

        isSearching.value = true
        searchError.value = null

        try {
            console.log('🔍 开始搜索POI:', params)

            const response = await amapService.searchPlaces({
                keywords,
                city,
                types,
                page,
                pageSize,
                enhance
            })

            // amapService.searchPlaces 返回的是 {pois: [...]} 格式
            const pois = response && response.pois?response.pois : []

            if (pois && pois.length > 0) {
                searchResults.value = pois
                lastSearchParams.value = params

                // 缓存结果
                if (useCache) {
                    cache.set(cacheKey, {
                        data: pois,
                        timestamp: Date.now()
                    })
                }

                // 添加到搜索历史
                addToSearchHistory({ keywords, city, types, timestamp: Date.now() })

                console.log(`✅ 搜索成功，找到 ${pois.length} 个结果`)
                return pois
            } else {
                searchResults.value = []
                ElMessage.info(`在${city}未找到"${keywords}"相关的地点`)
                return []
            }

        } catch (error) {
            console.error('❌ 搜索POI失败:', error)
            searchError.value = error.message || '搜索失败'

            // 处理特定错误
            if (error.message && error.message.includes('CUQPS_HAS_EXCEEDED_THE_LIMIT')) {
                ElMessage.error('搜索次数已达上限，请稍后再试')
            } else if (error.message && error.message.includes('INVALID_USER_KEY')) {
                ElMessage.error('API密钥无效，请检查配置')
            } else {
                ElMessage.error('搜索失败，请稍后重试')
            }

            throw error
        } finally {
            isSearching.value = false
        }
    }

    /**
     * 快速搜索景点
     * @param {string} city - 城市名称
     * @param {string} keywords - 搜索关键词
     * @param {Object} options - 其他选项
     */
    const searchAttractions = async(city, keywords = '景点', options = {}) => {
        return await searchPlaces({
            keywords,
            city,
            types: POI_TYPES.ATTRACTION,
            ...options
        })
    }

    /**
     * 快速搜索餐厅
     * @param {string} city - 城市名称
     * @param {string} keywords - 搜索关键词
     * @param {Object} options - 其他选项
     */
    const searchRestaurants = async(city, keywords = '美食', options = {}) => {
        return await searchPlaces({
            keywords,
            city,
            types: POI_TYPES.RESTAURANT,
            ...options
        })
    }

    /**
     * 快速搜索酒店
     * @param {string} city - 城市名称
     * @param {string} keywords - 搜索关键词
     * @param {Object} options - 其他选项
     */
    const searchHotels = async(city, keywords = '酒店', options = {}) => {
        return await searchPlaces({
            keywords,
            city,
            types: POI_TYPES.HOTEL,
            ...options
        })
    }

    // ==================== POI详情功能 ====================

    /**
     * 获取POI详情
     * @param {string} poiId - POI ID
     * @param {boolean} useCache - 是否使用缓存
     */
    const getPoiDetail = async(poiId, useCache = true) => {
        if (!poiId) {
            const errorMsg = 'POI ID不能为空'
            poiError.value = errorMsg
            ElMessage.error(errorMsg)
            return
        }

        const cacheKey = `poi_${poiId}`

        // 检查缓存
        if (useCache && cache.has(cacheKey)) {
            const cachedData = cache.get(cacheKey)
            if (Date.now() - cachedData.timestamp < 10 * 60 * 1000) { // 10分钟缓存
                currentPoi.value = cachedData.data
                return cachedData.data
            }
        }

        isLoadingPoi.value = true
        poiError.value = null

        try {
            console.log('🔍 获取POI详情:', poiId)

            const response = await amapService.getPoiDetail(poiId)

            if (response) {
                currentPoi.value = response

                // 缓存结果
                if (useCache) {
                    cache.set(cacheKey, {
                        data: response,
                        timestamp: Date.now()
                    })
                }

                console.log('✅ POI详情获取成功')
                return response
            } else {
                ElMessage.warning('未找到POI详情')
                return null
            }

        } catch (error) {
            console.error('❌ 获取POI详情失败:', error)
            poiError.value = error.message || '获取POI详情失败'
            ElMessage.error('获取详情失败，请稍后重试')
            throw error
        } finally {
            isLoadingPoi.value = false
        }
    }

    // ==================== 坐标查询功能 ====================

    /**
     * 获取城市坐标
     * @param {string} cityName - 城市名称
     * @param {boolean} useCache - 是否使用缓存
     */
    const getCityCoordinate = async(cityName, useCache = true) => {
        if (!cityName) {
            const errorMsg = '城市名称不能为空'
            coordinateError.value = errorMsg
            ElMessage.error(errorMsg)
            return
        }

        const cacheKey = `coord_${cityName}`

        // 检查缓存
        if (useCache && cache.has(cacheKey)) {
            const cachedData = cache.get(cacheKey)
            if (Date.now() - cachedData.timestamp < 60 * 60 * 1000) { // 1小时缓存
                coordinates.value[cityName] = cachedData.data
                return cachedData.data
            }
        }

        isLoadingCoordinates.value = true
        coordinateError.value = null

        try {
            console.log('🔍 获取城市坐标:', cityName)

            const response = await amapService.getCityCoordinate(cityName)

            if (response) {
                coordinates.value[cityName] = response

                // 缓存结果
                if (useCache) {
                    cache.set(cacheKey, {
                        data: response,
                        timestamp: Date.now()
                    })
                }

                console.log('✅ 城市坐标获取成功:', response)
                return response
            } else {
                ElMessage.warning(`未找到城市"${cityName}"的坐标`)
                return null
            }

        } catch (error) {
            console.error('❌ 获取城市坐标失败:', error)
            coordinateError.value = error.message || '获取坐标失败'
            ElMessage.error('获取坐标失败，请稍后重试')
            throw error
        } finally {
            isLoadingCoordinates.value = false
        }
    }

    /**
     * 批量获取城市坐标
     * @param {Array} cityNames - 城市名称数组
     * @param {number} delay - 请求间隔(毫秒)
     * @param {boolean} useCache - 是否使用缓存
     */
    const getBatchCityCoordinates = async(cityNames, delay = 100, useCache = true) => {
        if (!cityNames || !Array.isArray(cityNames) || cityNames.length === 0) {
            const errorMsg = '城市名称数组不能为空'
            batchError.value = errorMsg
            ElMessage.error(errorMsg)
            return
        }

        isBatchLoading.value = true
        batchError.value = null
        batchProgress.value = 0

        try {
            console.log('🔍 批量获取城市坐标:', cityNames)

            const response = await amapService.getBatchCityCoordinates(cityNames, delay)

            if (response) {
                // 更新批量坐标数据
                Object.assign(batchCoordinates.value, response)

                // 同时更新单个坐标缓存
                Object.entries(response).forEach(([cityName, coordinate]) => {
                    coordinates.value[cityName] = coordinate

                    if (useCache) {
                        const cacheKey = `coord_${cityName}`
                        cache.set(cacheKey, {
                            data: coordinate,
                            timestamp: Date.now()
                        })
                    }
                })

                batchProgress.value = 100
                console.log(`✅ 批量坐标获取成功，共处理 ${Object.keys(response).length} 个城市`)
                return response
            } else {
                ElMessage.warning('批量获取坐标失败')
                return {}
            }

        } catch (error) {
            console.error('❌ 批量获取城市坐标失败:', error)
            batchError.value = error.message || '批量获取坐标失败'
            ElMessage.error('批量获取坐标失败，请稍后重试')
            throw error
        } finally {
            isBatchLoading.value = false
        }
    }

    // ==================== 辅助功能 ====================

    /**
     * 添加到搜索历史
     * @param {Object} searchItem - 搜索项
     */
    const addToSearchHistory = (searchItem) => {
        const maxHistory = 50

        // 去重并添加到历史记录开头
        searchHistory.value = [
            searchItem,
            ...searchHistory.value.filter(item =>
                !(item.keywords === searchItem.keywords &&
                    item.city === searchItem.city &&
                    item.types === searchItem.types)
            )
        ].slice(0, maxHistory)
    }

    /**
     * 清空搜索历史
     */
    const clearSearchHistory = () => {
        searchHistory.value = []
        ElMessage.success('搜索历史已清空')
    }

    /**
     * 清空缓存
     */
    const clearCache = () => {
        cache.clear()
        ElMessage.success('缓存已清空')
    }

    /**
     * 重置所有状态
     */
    const resetAllStates = () => {
        searchResults.value = []
        currentPoi.value = null
        coordinates.value = {}
        batchCoordinates.value = {}
        searchError.value = null
        poiError.value = null
        coordinateError.value = null
        batchError.value = null
        batchProgress.value = 0
        clearCache()
    }

    /**
     * 重新执行上次搜索
     */
    const reExecuteLastSearch = async() => {
        if (lastSearchParams.value && Object.keys(lastSearchParams.value).length > 0) {
            return await searchPlaces(lastSearchParams.value)
        } else {
            ElMessage.warning('没有上次搜索记录')
        }
    }

    // ==================== 返回的接口 ====================

    return {
        // 状态
        searchResults,
        isSearching,
        searchError,
        currentPoi,
        isLoadingPoi,
        poiError,
        coordinates,
        isLoadingCoordinates,
        coordinateError,
        batchCoordinates,
        isBatchLoading,
        batchProgress,
        batchError,
        searchHistory,
        lastSearchParams,

        // 计算属性
        hasSearchResults,
        searchResultsCount,
        isAnyLoading,
        searchStats,

        // 搜索方法
        searchPlaces,
        searchAttractions,
        searchRestaurants,
        searchHotels,

        // POI详情方法
        getPoiDetail,

        // 坐标方法
        getCityCoordinate,
        getBatchCityCoordinates,

        // 辅助方法
        addToSearchHistory,
        clearSearchHistory,
        clearCache,
        resetAllStates,
        reExecuteLastSearch,

        // 常量
        POI_TYPES,
        SEARCH_KEYWORDS
    }
}