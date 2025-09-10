import {
    searchPlaces as apiSearchPlaces,
    getPoiDetail as apiGetPoiDetail,
    getCityCoordinate as apiGetCityCoordinate,
    getBatchCityCoordinates as apiGetBatchCityCoordinates,
    amapKey
} from '@/api/amap.js';

/**
 * POI类型映射
 */
export const POI_TYPES = {
    ATTRACTION: '110000', // 风景名胜
    RESTAURANT: '050000', // 餐饮服务
    HOTEL: '100000', // 住宿服务
    SHOPPING: '060000', // 购物服务
    ENTERTAINMENT: '080000', // 休闲娱乐
    TRANSPORT: '150000', // 交通设施
};

/**
 * 搜索关键词映射
 */
export const SEARCH_KEYWORDS = {
    ATTRACTION: '景点',
    RESTAURANT: '美食',
    HOTEL: '酒店',
    SHOPPING: '购物',
    ENTERTAINMENT: '娱乐',
};

/**
 * 默认图片映射
 */
const DEFAULT_IMAGES = {
    ATTRACTION: '/images/defaults/attraction.svg',
    RESTAURANT: '/images/defaults/restaurant.svg',
    HOTEL: '/images/defaults/hotel.svg',
    DEFAULT: '/images/defaults/attraction.svg'
};

/**
 * 根据POI类型获取默认图片
 * @param {string} type - POI类型
 * @returns {string} - 默认图片URL
 */
export const getDefaultImageByType = (type) => {
    if (!type) return DEFAULT_IMAGES.DEFAULT;

    // 景点类型
    if (type.includes('风景名胜') || type.includes('旅游景点') || type.includes('公园')) {
        return DEFAULT_IMAGES.ATTRACTION;
    }
    // 餐饮类型
    if (type.includes('餐饮') || type.includes('美食') || type.includes('中餐') || type.includes('西餐')) {
        return DEFAULT_IMAGES.RESTAURANT;
    }
    // 酒店类型
    if (type.includes('住宿') || type.includes('酒店') || type.includes('宾馆')) {
        return DEFAULT_IMAGES.HOTEL;
    }

    return DEFAULT_IMAGES.DEFAULT;
};

/**
 * 生成POI描述信息
 * @param {Object} poi - 原始POI数据
 * @returns {string} - 生成的描述
 */
export const generatePoiDescription = (poi) => {
    let description = '';

    if (poi.address) {
        description += `位于${poi.address}。`;
    }

    if (poi.type) {
        description += `这是一处${poi.type}。`;
    }

    if (poi.business_area) {
        description += `位于${poi.business_area}商圈。`;
    }

    if (poi.tel) {
        description += `联系电话：${poi.tel}。`;
    }

    if (poi.business_time) {
        description += `营业时间：${poi.business_time}。`;
    }

    return description || `${poi.name}是一个值得探访的地方。`;
};

/**
 * 处理并增强POI数据，添加图片和详细信息
 * @param {Array} pois - 原始POI数组
 * @returns {Promise<Array>} - 增强后的POI数组
 */
export const enhancePoiData = async(pois) => {
    if (!Array.isArray(pois) || pois.length === 0) {
        return [];
    }

    console.log(`🔧 正在增强 ${pois.length} 个POI的数据...`);

    const enhancedPois = await Promise.all(
        pois.map(async(poi) => {
            try {
                // 基础信息处理
                const enhancedPoi = {
                    id: poi.id,
                    name: poi.name,
                    address: poi.address || poi.pname + poi.cityname + poi.adname,
                    location: poi.location,
                    tel: poi.tel || '',
                    rating: poi.rating || 0,
                    // 提取图片信息
                    images: [],
                    // 详细信息
                    businessArea: poi.business_area || '',
                    district: poi.adname || '',
                    category: poi.type || '',
                    website: poi.website || '',
                    openTime: poi.business_time || '',
                    // 坐标信息
                    coordinates: poi.location ? poi.location.split(',').map(Number) : null,
                    // 原始数据保留
                    rawData: poi
                };

                // 处理图片信息
                if (poi.photos && Array.isArray(poi.photos)) {
                    enhancedPoi.images = poi.photos.map(photo => ({
                        url: photo.url,
                        title: photo.title || poi.name,
                        alt: photo.title || poi.name
                    }));
                }

                // 如果有主图片，设置为卡片显示的图片
                if (enhancedPoi.images.length > 0) {
                    enhancedPoi.imageUrl = enhancedPoi.images[0].url;
                } else {
                    // 如果没有图片，根据POI类型设置默认图片
                    enhancedPoi.imageUrl = getDefaultImageByType(poi.type);
                }

                // 生成描述信息
                enhancedPoi.description = generatePoiDescription(poi);

                return enhancedPoi;
            } catch (error) {
                console.warn(`增强POI数据失败: ${poi.name}`, error);
                // 返回基础信息，确保不会因为单个POI失败而影响整体
                return {
                    id: poi.id,
                    name: poi.name,
                    address: poi.address || '地址信息待完善',
                    imageUrl: getDefaultImageByType(poi.type),
                    description: poi.name + '的详细信息正在完善中...',
                    rawData: poi
                };
            }
        })
    );

    console.log(`✅ POI数据增强完成，处理了 ${enhancedPois.length} 个POI`);
    return enhancedPois;
};

/**
 * 高德地图服务类
 */
export class AmapService {
    constructor() {
        this.apiKey = amapKey;
    }

    /**
     * 检查API Key是否可用
     * @returns {boolean}
     */
    isApiKeyAvailable() {
        return !!this.apiKey;
    }

    /**
     * 搜索POI
     * @param {Object} params - 搜索参数
     * @param {string} params.keywords - 搜索关键字
     * @param {string} params.city - 城市名或citycode
     * @param {string} [params.types] - POI分类代码
     * @param {number} [params.page=1] - 页码
     * @param {number} [params.pageSize=10] - 每页数量
     * @param {boolean} [params.enhance=true] - 是否增强数据
     * @returns {Promise<Object>}
     */
    async searchPlaces({ keywords, city, types, page = 1, pageSize = 10, enhance = true }) {
        try {
            const response = await apiSearchPlaces({
                keywords,
                city,
                types,
                page,
                offset: pageSize
            });

            if (enhance && response.pois && response.pois.length > 0) {
                response.pois = await enhancePoiData(response.pois);
            }

            return response;
        } catch (error) {
            console.error('搜索POI失败:', error);
            throw error;
        }
    }

    /**
     * 获取POI详细信息
     * @param {string} poiId - POI ID
     * @returns {Promise<Object>}
     */
    async getPoiDetail(poiId) {
        try {
            return await apiGetPoiDetail(poiId);
        } catch (error) {
            console.error('获取POI详情失败:', error);
            throw error;
        }
    }

    /**
     * 获取推荐景点
     * @param {string} city - 城市名
     * @param {Object} options - 选项
     * @param {number} [options.page=1] - 页码
     * @param {number} [options.pageSize=6] - 每页数量
     * @param {boolean} [options.enhance=true] - 是否增强数据
     * @returns {Promise<Object>}
     */
    async getRecommendedAttractions(city, { page = 1, pageSize = 6, enhance = true } = {}) {
        return this.searchPlaces({
            keywords: SEARCH_KEYWORDS.ATTRACTION,
            types: POI_TYPES.ATTRACTION,
            city,
            page,
            pageSize,
            enhance
        });
    }

    /**
     * 获取推荐餐厅
     * @param {string} city - 城市名
     * @param {Object} options - 选项
     * @param {number} [options.page=1] - 页码
     * @param {number} [options.pageSize=6] - 每页数量
     * @param {boolean} [options.enhance=true] - 是否增强数据
     * @returns {Promise<Object>}
     */
    async getRecommendedRestaurants(city, { page = 1, pageSize = 6, enhance = true } = {}) {
        return this.searchPlaces({
            keywords: SEARCH_KEYWORDS.RESTAURANT,
            types: POI_TYPES.RESTAURANT,
            city,
            page,
            pageSize,
            enhance
        });
    }

    /**
     * 获取推荐酒店
     * @param {string} city - 城市名
     * @param {Object} options - 选项
     * @param {number} [options.page=1] - 页码
     * @param {number} [options.pageSize=6] - 每页数量
     * @param {boolean} [options.enhance=true] - 是否增强数据
     * @returns {Promise<Object>}
     */
    async getRecommendedHotels(city, { page = 1, pageSize = 6, enhance = true } = {}) {
        return this.searchPlaces({
            keywords: SEARCH_KEYWORDS.HOTEL,
            types: POI_TYPES.HOTEL,
            city,
            page,
            pageSize,
            enhance
        });
    }

    /**
     * 根据类型批量获取推荐内容
     * @param {string} city - 城市名
     * @param {Array<string>} types - 类型数组 ['ATTRACTION', 'RESTAURANT', 'HOTEL']
     * @param {Object} options - 选项
     * @returns {Promise<Object>}
     */
    async getBatchRecommendations(city, types = ['ATTRACTION', 'RESTAURANT'], options = {}) {
        const { pageSize = 6, enhance = true } = options;

        const promises = types.map(async(type) => {
            try {
                switch (type) {
                    case 'ATTRACTION':
                        return {
                            type,
                            data: await this.getRecommendedAttractions(city, { pageSize, enhance })
                        };
                    case 'RESTAURANT':
                        return {
                            type,
                            data: await this.getRecommendedRestaurants(city, { pageSize, enhance })
                        };
                    case 'HOTEL':
                        return {
                            type,
                            data: await this.getRecommendedHotels(city, { pageSize, enhance })
                        };
                    default:
                        return { type, data: { pois: [] } };
                }
            } catch (error) {
                console.warn(`获取${type}推荐失败:`, error);
                return { type, data: { pois: [] } };
            }
        });

        const results = await Promise.all(promises);

        return results.reduce((acc, result) => {
            acc[result.type.toLowerCase()] = result.data;
            return acc;
        }, {});
    }

    /**
     * 获取城市坐标
     * @param {string} cityName - 城市名
     * @returns {Promise<Array>} [经度, 纬度]
     */
    async getCityCoordinate(cityName) {
        try {
            return await apiGetCityCoordinate(cityName);
        } catch (error) {
            console.error('获取城市坐标失败:', error);
            throw error;
        }
    }

    /**
     * 批量获取城市坐标
     * @param {Array<string>} cityNames - 城市名数组
     * @param {number} [delay=100] - 请求间隔
     * @returns {Promise<Object>}
     */
    async getBatchCityCoordinates(cityNames, delay = 100) {
        try {
            return await apiGetBatchCityCoordinates(cityNames, delay);
        } catch (error) {
            console.error('批量获取城市坐标失败:', error);
            throw error;
        }
    }

    /**
     * 根据POI名称搜索最佳匹配
     * @param {string} name - POI名称
     * @param {string} city - 城市名
     * @param {string} [type] - POI类型
     * @returns {Promise<Object|null>}
     */
    async findBestMatchPoi(name, city, type = null) {
        try {
            const searchParams = {
                keywords: name,
                city,
                pageSize: 5,
                enhance: true
            };

            if (type) {
                searchParams.types = type;
            }

            const response = await this.searchPlaces(searchParams);

            if (response && response.pois && response.pois.length > 0) {
                // 简单的名称匹配逻辑
                const exactMatch = response.pois.find(poi =>
                    poi.name === name || poi.name.includes(name) || name.includes(poi.name)
                );

                return exactMatch || response.pois[0];
            }

            return null;
        } catch (error) {
            console.error('搜索最佳匹配POI失败:', error);
            return null;
        }
    }
}

// 创建默认实例
export const amapService = new AmapService();

// 导出常用方法（保持向后兼容）
export const {
    searchPlaces,
    getPoiDetail,
    getRecommendedAttractions,
    getRecommendedRestaurants,
    getCityCoordinate,
    getBatchCityCoordinates,
    findBestMatchPoi,
    getBatchRecommendations
} = amapService;