/**
 * 统一搜索服务组合函数
 * 整合高德地图搜索和AI推荐，提供统一的搜索接口
 */

import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useAmap } from './useAmap.js'
import { useAiRecommendations } from './useAiRecommendations.js'

export function useSearch() {
    // 使用现有的高德地图搜索功能
    const {
        searchPlaces,
        searchAttractions: amapSearchAttractions,
        searchRestaurants: amapSearchRestaurants,
        searchHotels: amapSearchHotels,
        searchResults: amapResults,
        isSearching: amapSearching,
        searchError: amapError
    } = useAmap()

    // 搜索状态管理
    const searchResults = ref([])
    const isSearching = ref(false)
    const searchError = ref(null)
    const searchHistory = ref([])
    const searchMode = ref('comprehensive') // comprehensive | attractions | restaurants | hotels

    // 搜索缓存
    const searchCache = reactive(new Map())
    const cacheTimeout = 5 * 60 * 1000 // 5分钟缓存

    // 计算属性
    const hasSearchResults = computed(() => {
        return searchResults.value && searchResults.value.length > 0
    })

    const searchStats = computed(() => {
        if (!searchResults.value || searchResults.value.length === 0) {
            return null
        }

        const stats = {
            total: searchResults.value.length,
            attractions: 0,
            restaurants: 0,
            hotels: 0
        }

        searchResults.value.forEach(item => {
            if (item.type && item.type.includes('风景名胜')) {
                stats.attractions++
            } else if (item.type && item.type.includes('餐饮')) {
                stats.restaurants++
            } else if (item.type && item.type.includes('住宿')) {
                stats.hotels++
            }
        })

        return stats
    })

    // ==================== 缓存管理 ====================

    /**
     * 生成缓存键
     */
    const generateCacheKey = (type, city, keywords, options = {}) => {
        return `${type}_${city}_${keywords}_${JSON.stringify(options)}`
    }

    /**
     * 检查缓存是否有效
     */
    const isCacheValid = (cacheData) => {
        if (!cacheData) return false
        return Date.now() - cacheData.timestamp < cacheTimeout
    }

    /**
     * 获取缓存数据
     */
    const getFromCache = (cacheKey) => {
        const cacheData = searchCache.get(cacheKey)
        if (isCacheValid(cacheData)) {
            return cacheData.data
        }
        searchCache.delete(cacheKey)
        return null
    }

    /**
     * 设置缓存数据
     */
    const setCache = (cacheKey, data) => {
        searchCache.set(cacheKey, {
            data,
            timestamp: Date.now()
        })
    }

    // ==================== 搜索功能 ====================

    /**
     * 统一搜索入口 - 整合高德地图搜索
     * @param {Object} params - 搜索参数
     * @param {string} params.keywords - 搜索关键词
     * @param {string} params.city - 城市名称
     * @param {string} [params.type] - 搜索类型: 'attractions' | 'restaurants' | 'hotels' | 'all'
     * @param {Object} [params.options] - 其他搜索选项
     */
    const search = async(params) => {
        const { keywords, city, type = 'all', options = {} } = params

        if (!keywords || !city) {
            searchError.value = '搜索关键词和城市不能为空'
            ElMessage.error(searchError.value)
            return
        }

        // 检查缓存
        const cacheKey = generateCacheKey(type, city, keywords, options)
        const cachedResult = getFromCache(cacheKey)
        if (cachedResult) {
            console.log('使用缓存的搜索结果:', keywords)
            searchResults.value = cachedResult
            return cachedResult
        }

        isSearching.value = true
        searchError.value = null

        try {
            let results = []

            // 根据搜索类型调用相应的搜索方法
            if (type === 'attractions' || type === 'all') {
                const attractionResults = await amapSearchAttractions(city, keywords, {
                    offset: options.limit || 10,
                    page: options.page || 1
                })
                if (attractionResults && attractionResults.pois) {
                    results.push(...formatSearchResults(attractionResults.pois, 'attraction'))
                }
            }

            if (type === 'restaurants' || type === 'all') {
                const restaurantResults = await amapSearchRestaurants(city, keywords, {
                    offset: options.limit || 10,
                    page: options.page || 1
                })
                if (restaurantResults && restaurantResults.pois) {
                    results.push(...formatSearchResults(restaurantResults.pois, 'restaurant'))
                }
            }

            if (type === 'hotels' || type === 'all') {
                const hotelResults = await amapSearchHotels(city, keywords, {
                    offset: options.limit || 10,
                    page: options.page || 1
                })
                if (hotelResults && hotelResults.pois) {
                    results.push(...formatSearchResults(hotelResults.pois, 'hotel'))
                }
            }

            // 去重和排序
            results = deduplicateResults(results)
            results = sortSearchResults(results, keywords)

            searchResults.value = results

            // 缓存结果
            setCache(cacheKey, results)

            // 添加到搜索历史
            addToSearchHistory({ keywords, city, type, timestamp: Date.now() })

            console.log(`🔍 搜索完成: ${keywords} (${city}), 找到 ${results.length} 个结果`)
            return results

        } catch (error) {
            console.error('搜索失败:', error)
            searchError.value = error.message || '搜索失败'
            ElMessage.error(searchError.value)

            // 返回模拟数据作为降级方案
            const mockResults = getMockSearchResults(keywords, city, type)
            searchResults.value = mockResults
            return mockResults

        } finally {
            isSearching.value = false
        }
    }

    /**
     * 快速搜索景点
     */
    const searchAttractions = async(city, keywords = '景点', options = {}) => {
        return await search({ keywords, city, type: 'attractions', options })
    }

    /**
     * 快速搜索餐厅
     */
    const searchRestaurants = async(city, keywords = '美食', options = {}) => {
        return await search({ keywords, city, type: 'restaurants', options })
    }

    /**
     * 快速搜索酒店
     */
    const searchHotels = async(city, keywords = '酒店', options = {}) => {
        return await search({ keywords, city, type: 'hotels', options })
    }

    // ==================== 数据处理工具 ====================

    /**
     * 格式化搜索结果
     */
    const formatSearchResults = (pois, category) => {
        return pois.map(poi => ({
            id: poi.id,
            name: poi.name,
            address: poi.address,
            category: category,
            type: poi.type || category,
            rating: (poi.biz_ext && poi.biz_ext.rating) || null,
            price: (poi.biz_ext && poi.biz_ext.cost) || null,
            photos: poi.photos || [],
            distance: poi.distance || null,
            location: poi.location?{
                longitude: parseFloat(poi.location.split(',')[0]),
                latitude: parseFloat(poi.location.split(',')[1])
            } : null,
            tags: extractTags(poi),
            tel: poi.tel,
            website: poi.website,
            openTime: poi.openTime,
            isEnhanced: true,
            source: 'amap'
        }))
    }

    /**
     * 提取标签
     */
    const extractTags = (poi) => {
        const tags = []

        if (poi.tag) {
            tags.push(...poi.tag.split(';').filter(tag => tag.trim()))
        }

        if (poi.type) {
            tags.push(...poi.type.split(';').filter(type => type.trim()))
        }

        // 去重
        return [...new Set(tags)].slice(0, 5)
    }

    /**
     * 去重处理
     */
    const deduplicateResults = (results) => {
        const seen = new Set()
        return results.filter(item => {
            const key = `${item.name}_${item.address}`
            if (seen.has(key)) {
                return false
            }
            seen.add(key)
            return true
        })
    }

    /**
     * 结果排序
     */
    const sortSearchResults = (results, keywords) => {
        return results.sort((a, b) => {
            // 优先显示名称匹配度高的
            const aNameMatch = a.name.includes(keywords)?1 : 0
            const bNameMatch = b.name.includes(keywords)?1 : 0

            if (aNameMatch !== bNameMatch) {
                return bNameMatch - aNameMatch
            }

            // 然后按评分排序
            const aRating = parseFloat(a.rating) || 0
            const bRating = parseFloat(b.rating) || 0

            return bRating - aRating
        })
    }

    /**
     * 添加到搜索历史
     */
    const addToSearchHistory = (searchParams) => {
        const history = searchHistory.value

        // 避免重复
        const exists = history.some(item =>
            item.keywords === searchParams.keywords &&
            item.city === searchParams.city
        )

        if (!exists) {
            history.unshift(searchParams)

            // 限制历史记录数量
            if (history.length > 20) {
                history.splice(20)
            }
        }
    }

    /**
     * 获取模拟搜索结果（降级方案）
     */
    const getMockSearchResults = (keywords, city, type) => {
        const mockData = []

        if (type === 'attractions' || type === 'all') {
            mockData.push({
                id: 'mock_attraction_1',
                name: `${city}${keywords}景点1`,
                address: `${city}市中心`,
                category: 'attraction',
                type: '风景名胜',
                rating: '4.5',
                price: '¥50',
                photos: [],
                tags: ['热门景点', '历史文化'],
                source: 'mock',
                isMock: true
            })
        }

        if (type === 'restaurants' || type === 'all') {
            mockData.push({
                id: 'mock_restaurant_1',
                name: `${city}${keywords}餐厅1`,
                address: `${city}美食街`,
                category: 'restaurant',
                type: '餐饮服务',
                rating: '4.3',
                price: '¥120',
                photos: [],
                tags: ['本地菜', '环境优雅'],
                source: 'mock',
                isMock: true
            })
        }

        return mockData
    }

    // ==================== 工具方法 ====================

    /**
     * 清除搜索结果
     */
    const clearSearchResults = () => {
        searchResults.value = []
        searchError.value = null
    }

    /**
     * 清除搜索历史
     */
    const clearSearchHistory = () => {
        searchHistory.value = []
    }

    /**
     * 清除搜索缓存
     */
    const clearSearchCache = () => {
        searchCache.clear()
    }

    /**
     * 重新执行最后一次搜索
     */
    const reExecuteLastSearch = async() => {
        const lastSearch = searchHistory.value[0]
        if (lastSearch) {
            return await search({
                keywords: lastSearch.keywords,
                city: lastSearch.city,
                type: lastSearch.type
            })
        }
    }

    return {
        // 状态
        searchResults,
        isSearching,
        searchError,
        searchHistory,
        searchMode,

        // 计算属性
        hasSearchResults,
        searchStats,

        // 主要搜索方法
        search,
        searchAttractions,
        searchRestaurants,
        searchHotels,

        // 工具方法
        clearSearchResults,
        clearSearchHistory,
        clearSearchCache,
        reExecuteLastSearch,
        addToSearchHistory,

        // 底层方法（如需直接使用高德地图搜索）
        searchPlaces
    }
}