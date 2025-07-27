import { http } from './request.js'

/**
 * 景点和餐厅数据相关API接口
 * 对应后端的 AttractionController 和 RestaurantController
 */
export const dataApi = {

    // ========== 城市信息 ==========

    /**
     * 获取所有启用的城市列表
     */
    getAllCities() {
        return http.get('/cities')
    },

    /**
     * 根据首字母筛选城市
     * @param {string} letter - 首字母 (A-Z)
     */
    getCitiesByLetter(letter) {
        return http.get(`/cities/letter/${letter}`)
    },

    /**
     * 根据城市代码获取城市信息
     * @param {string} code - 城市代码 (beijing/shanghai)
     */
    getCityByCode(code) {
        return http.get(`/cities/${code}`)
    },

    /**
     * 搜索城市
     * @param {string} keyword - 搜索关键词
     */
    searchCities(keyword) {
        const params = {}
        if (keyword) params.keyword = keyword
        return http.get('/cities/search', params)
    },

    /**
     * 根据省份获取城市列表
     * @param {string} province - 省份名称
     */
    getCitiesByProvince(province) {
        return http.get(`/cities/province/${province}`)
    },

    /**
     * 获取热门城市
     * @param {number} limit - 返回数量，默认8
     */
    getPopularCities(limit = 8) {
        return http.get('/cities/popular', { limit })
    },

    /**
     * 获取支持的城市列表（兼容旧接口）
     */
    getSupportedCities() {
        return this.getAllCities()
    },

    // ========== 景点相关接口 ==========

    /**
     * 根据城市获取所有景点
     * @param {string} city - 城市名称 (beijing/shanghai)
     */
    getAttractionsByCity(city) {
        return http.get(`/attractions/city/${city}`)
    },

    /**
     * 根据ID获取景点详情
     * @param {number} id - 景点ID
     */
    getAttractionById(id) {
        return http.get(`/attractions/${id}`)
    },

    /**
     * 根据标签筛选景点
     * @param {string} city - 城市名称
     * @param {string[]} tags - 标签数组
     */
    getAttractionsByTags(city, tags) {
        return http.get(`/attractions/city/${city}/tags`, { tags })
    },

    /**
     * 根据价格范围筛选景点
     * @param {string} city - 城市名称
     * @param {number} minPrice - 最低价格
     * @param {number} maxPrice - 最高价格
     */
    getAttractionsByPrice(city, minPrice, maxPrice) {
        const params = {}
        if (minPrice !== undefined) params.minPrice = minPrice
        if (maxPrice !== undefined) params.maxPrice = maxPrice
        return http.get(`/attractions/city/${city}/price`, params)
    },

    /**
     * 根据评分筛选景点
     * @param {string} city - 城市名称
     * @param {number} minRating - 最低评分
     */
    getAttractionsByRating(city, minRating) {
        const params = {}
        if (minRating !== undefined) params.minRating = minRating
        return http.get(`/attractions/city/${city}/rating`, params)
    },

    /**
     * 搜索景点
     * @param {string} city - 城市名称
     * @param {string} keyword - 搜索关键词
     */
    searchAttractions(city, keyword) {
        return http.get(`/attractions/city/${city}/search`, { keyword })
    },

    /**
     * 获取热门景点
     * @param {string} city - 城市名称
     * @param {number} limit - 返回数量，默认10
     */
    getPopularAttractions(city, limit = 10) {
        return http.get(`/attractions/city/${city}/popular`, { limit })
    },

    /**
     * 获取免费景点
     * @param {string} city - 城市名称
     */
    getFreeAttractions(city) {
        return http.get(`/attractions/city/${city}/free`)
    },

    // ========== 餐厅相关接口 ==========

    /**
     * 根据城市获取所有餐厅
     * @param {string} city - 城市名称
     */
    getRestaurantsByCity(city) {
        return http.get(`/restaurants/city/${city}`)
    },

    /**
     * 根据ID获取餐厅详情
     * @param {number} id - 餐厅ID
     */
    getRestaurantById(id) {
        return http.get(`/restaurants/${id}`)
    },

    /**
     * 根据标签筛选餐厅
     * @param {string} city - 城市名称
     * @param {string[]} tags - 标签数组
     */
    getRestaurantsByTags(city, tags) {
        return http.get(`/restaurants/city/${city}/tags`, { tags })
    },

    /**
     * 根据价格范围筛选餐厅
     * @param {string} city - 城市名称
     * @param {number} minPrice - 最低消费
     * @param {number} maxPrice - 最高消费
     */
    getRestaurantsByPrice(city, minPrice, maxPrice) {
        const params = {}
        if (minPrice !== undefined) params.minPrice = minPrice
        if (maxPrice !== undefined) params.maxPrice = maxPrice
        return http.get(`/restaurants/city/${city}/price`, params)
    },

    /**
     * 根据评分筛选餐厅
     * @param {string} city - 城市名称
     * @param {number} minRating - 最低评分
     */
    getRestaurantsByRating(city, minRating) {
        const params = {}
        if (minRating !== undefined) params.minRating = minRating
        return http.get(`/restaurants/city/${city}/rating`, params)
    },

    /**
     * 搜索餐厅
     * @param {string} city - 城市名称
     * @param {string} keyword - 搜索关键词
     */
    searchRestaurants(city, keyword) {
        return http.get(`/restaurants/city/${city}/search`, { keyword })
    },

    /**
     * 获取热门餐厅
     * @param {string} city - 城市名称
     * @param {number} limit - 返回数量，默认10
     */
    getPopularRestaurants(city, limit = 10) {
        return http.get(`/restaurants/city/${city}/popular`, { limit })
    },

    /**
     * 根据菜系筛选餐厅
     * @param {string} city - 城市名称
     * @param {string} cuisine - 菜系类型
     */
    getRestaurantsByCuisine(city, cuisine) {
        return http.get(`/restaurants/city/${city}/cuisine`, { cuisine })
    },

    /**
     * 搜索附近餐厅
     * @param {string} city - 城市名称
     * @param {number} lat - 纬度
     * @param {number} lng - 经度
     * @param {number} radius - 搜索半径（公里）
     */
    getNearbyRestaurants(city, lat, lng, radius = 1.0) {
        return http.get(`/restaurants/city/${city}/nearby`, { lat, lng, radius })
    },

    // ========== 组合查询接口 ==========

    /**
     * 综合搜索（同时搜索景点和餐厅）
     * @param {string} city - 城市名称
     * @param {string} keyword - 搜索关键词
     */
    async searchAll(city, keyword) {
        try {
            const [attractions, restaurants] = await Promise.all([
                this.searchAttractions(city, keyword),
                this.searchRestaurants(city, keyword)
            ])

            return {
                attractions: attractions.data || [],
                restaurants: restaurants.data || []
            }
        } catch (error) {
            console.error('综合搜索失败:', error)
            throw error
        }
    },

    /**
     * 获取城市热门推荐（景点+餐厅）
     * @param {string} city - 城市名称
     * @param {number} attractionLimit - 景点数量限制
     * @param {number} restaurantLimit - 餐厅数量限制
     */
    async getCityRecommendations(city, attractionLimit = 6, restaurantLimit = 4) {
        try {
            const [attractions, restaurants] = await Promise.all([
                this.getPopularAttractions(city, attractionLimit),
                this.getPopularRestaurants(city, restaurantLimit)
            ])

            return {
                attractions: attractions.data || [],
                restaurants: restaurants.data || []
            }
        } catch (error) {
            console.error('获取城市推荐失败:', error)
            throw error
        }
    }
}