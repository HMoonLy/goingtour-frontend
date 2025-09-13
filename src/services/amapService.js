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
 * 判断POI类型是否为景点
 * @param {string} poiType - POI类型字符串
 * @returns {boolean} - 是否为景点
 */
export const isAttractionType = (poiType) => {
    if (!poiType) return false;

    // 风景名胜相关类型
    const attractionKeywords = [
        '风景名胜', '公园', '景区', '景点', '名胜古迹',
        '博物馆', '纪念馆', '寺庙', '教堂', '古迹',
        '山峰', '湖泊', '海滩', '森林', '自然保护区',
        '旅游景点', '游乐场', '度假区', '主题公园',
        '文化场所', '历史遗迹', '观光点', '娱乐场所'
    ];

    return attractionKeywords.some(keyword => poiType.includes(keyword));
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
 * 生成推荐理由
 * @param {Object} enhancedPoi - 增强后的POI数据
 * @param {Object} originalPoi - 原始POI数据
 * @returns {string} - 生成的推荐理由
 */
export const generateRecommendationReason = (enhancedPoi, originalPoi) => {
    const { name, rating, type, address } = enhancedPoi;
    const reasons = [];

    // 基于评分的推荐理由
    if (rating >= 4.5) {
        reasons.push('高评分口碑推荐');
    } else if (rating >= 4.0) {
        reasons.push('评价良好');
    }

    // 基于类型的推荐理由
    if (type) {
        if (type.includes('风景名胜')) {
            reasons.push('自然风光优美，值得游览');
        } else if (type.includes('文物古迹')) {
            reasons.push('历史文化底蕴深厚');
        } else if (type.includes('公园')) {
            reasons.push('环境优美，适合休闲漫步');
        } else if (type.includes('餐饮') || type.includes('美食')) {
            reasons.push('当地特色美食');
        } else if (type.includes('购物')) {
            reasons.push('购物休闲好去处');
        } else if (type.includes('住宿') || type.includes('酒店')) {
            reasons.push('住宿环境舒适');
        }
    }

    // 基于位置的推荐理由
    if (address) {
        if (address.includes('市中心') || address.includes('中心区')) {
            reasons.push('地理位置优越');
        } else if (address.includes('古城') || address.includes('老城')) {
            reasons.push('古韵浓厚');
        }
    }

    // 基于标签的推荐理由
    if (enhancedPoi.tags && enhancedPoi.tags.length > 0) {
        const tag = enhancedPoi.tags[0];
        if (tag && tag !== type) {
            reasons.push(`特色${tag}`);
        }
    }

    // 组合推荐理由
    if (reasons.length === 0) {
        // 默认推荐理由
        if (type && type.includes('风景名胜')) {
            return '这是一处值得游览的风景名胜，具有独特的观光价值';
        } else if (type && type.includes('餐饮')) {
            return '这是一家口碑不错的餐厅，值得品尝当地美食';
        } else {
            return `${name}在当地具有一定知名度，值得探访体验`;
        }
    }

    return reasons.slice(0, 2).join('，') + '，推荐游览';
};

/**
 * 生成匹配偏好标签
 * @param {Object} enhancedPoi - 增强后的POI数据
 * @param {Object} originalPoi - 原始POI数据
 * @returns {Array} - 匹配的偏好标签数组
 */
export const generateMatchedPreferences = (enhancedPoi, originalPoi) => {
    const preferences = [];
    const { type, rating, tags } = enhancedPoi;

    // 基于评分的偏好匹配
    if (rating >= 4.5) {
        preferences.push('高品质体验');
    } else if (rating >= 4.0) {
        preferences.push('口碑推荐');
    }

    // 基于类型的偏好匹配
    if (type) {
        if (type.includes('风景名胜')) {
            preferences.push('自然风光', '拍照打卡');
        } else if (type.includes('文物古迹')) {
            preferences.push('历史文化', '文化深度');
        } else if (type.includes('公园')) {
            preferences.push('休闲放松', '户外活动');
        } else if (type.includes('餐饮') || type.includes('美食')) {
            preferences.push('美食体验', '当地特色');
        } else if (type.includes('购物')) {
            preferences.push('购物休闲');
        } else if (type.includes('博物馆')) {
            preferences.push('文化学习', '知识探索');
        } else if (type.includes('娱乐')) {
            preferences.push('娱乐休闲');
        }
    }

    // 基于标签的偏好匹配
    if (tags && tags.length > 0) {
        tags.forEach(tag => {
            if (tag.includes('网红') || tag.includes('热门')) {
                preferences.push('网红打卡');
            } else if (tag.includes('传统') || tag.includes('老字号')) {
                preferences.push('传统文化');
            } else if (tag.includes('特色') || tag.includes('招牌')) {
                preferences.push('特色体验');
            }
        });
    }

    // 去重并限制数量
    return [...new Set(preferences)].slice(0, 3);
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
                    address: poi.address || (poi.pname + poi.cityname + poi.adname),
                    location: poi.location,
                    tel: Array.isArray(poi.tel) ? (poi.tel[0] || '') : (poi.tel || ''),
                    rating: (poi.biz_ext && poi.biz_ext.rating) ? parseFloat(poi.biz_ext.rating) : 0,
                    // 餐厅特有信息
                    cost: (poi.biz_ext && poi.biz_ext.cost) ? parseFloat(poi.biz_ext.cost) : null,
                    price: (poi.biz_ext && poi.biz_ext.cost) ? parseFloat(poi.biz_ext.cost) : null,
                    // 标签信息（餐厅的招牌菜等）
                    tag: Array.isArray(poi.tag) ? (poi.tag.length > 0 ? poi.tag.join(',') : '') : (poi.tag || ''),
                    tags: Array.isArray(poi.tag) ? poi.tag.filter(t => t) : (poi.tag ? poi.tag.split(',').map(t => t.trim()).filter(t => t) : []),
                    // 提取图片信息
                    images: [],
                    // 详细信息
                    businessArea: Array.isArray(poi.business_area) ? (poi.business_area[0] || '') : (poi.business_area || ''),
                    district: poi.adname || '',
                    category: poi.type || '',
                    type: poi.type || '',
                    website: Array.isArray(poi.website) ? (poi.website[0] || '') : (poi.website || ''),
                    openTime: poi.business_time || '',
                    // 坐标信息
                    coordinates: poi.location ? poi.location.split(',').map(Number) : null,
                    // 原始数据保留
                    rawData: poi
                };

                // 处理图片信息
                if (poi.photos && Array.isArray(poi.photos)) {
                    enhancedPoi.images = poi.photos
                        .filter(photo => photo && photo.url) // 确保有有效的URL
                        .map(photo => ({
                            url: photo.url,
                            title: Array.isArray(photo.title) ? (photo.title[0] || poi.name) : (photo.title || poi.name),
                            alt: Array.isArray(photo.title) ? (photo.title[0] || poi.name) : (photo.title || poi.name),
                            provider: Array.isArray(photo.provider) ? photo.provider[0] : photo.provider
                        }));
                    // 保持原始photos格式供组件使用，但确保数据结构正确
                    enhancedPoi.photos = poi.photos
                        .filter(photo => photo && photo.url)
                        .map(photo => ({
                            url: photo.url,
                            title: Array.isArray(photo.title) ? (photo.title[0] || poi.name) : (photo.title || poi.name),
                            provider: Array.isArray(photo.provider) ? photo.provider[0] : photo.provider
                        }));
                } else {
                    enhancedPoi.photos = [];
                }

                // 如果有主图片，设置为卡片显示的图片
                if (enhancedPoi.images && enhancedPoi.images.length > 0) {
                    enhancedPoi.imageUrl = enhancedPoi.images[0].url;
                } else {
                    // 如果没有图片，根据POI类型设置默认图片
                    enhancedPoi.imageUrl = getDefaultImageByType(poi.type);
                }

                // 生成描述信息
                enhancedPoi.description = generatePoiDescription(poi);

                // 生成推荐理由（如果没有的话）
                if (!enhancedPoi.reasoning && !enhancedPoi.reason) {
                    enhancedPoi.reasoning = generateRecommendationReason(enhancedPoi, poi);
                }

                // 生成默认的匹配偏好标签
                if (!enhancedPoi.matchedPreferences) {
                    enhancedPoi.matchedPreferences = generateMatchedPreferences(enhancedPoi, poi);
                }

                // 判断是否为景点类型
                const attractionResult = isAttractionType(poi.type);
                console.log(`POI: ${poi.name}, type: "${poi.type}", isAttraction: ${attractionResult}`);
                enhancedPoi.isAttraction = attractionResult;

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
                    isAttraction: isAttractionType(poi.type),
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