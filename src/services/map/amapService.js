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
    // 地标相关类型
    LANDMARK: '110000|120000|130000', // 风景名胜|文物古迹|政府机构及社会团体
    FAMOUS_BUILDING: '120000', // 文物古迹
    GOVERNMENT: '130000', // 政府机构
    CULTURAL_VENUE: '140000', // 科教文化服务
    SPORTS_VENUE: '080000', // 体育休闲服务
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
 * 地标搜索关键词
 */
export const LANDMARK_KEYWORDS = [
    '地标', '标志性建筑', '著名建筑', '纪念碑',
    '塔', '广场', '政府大楼', '火车站', '机场',
    '体育场', '博物馆', '文化中心', '会展中心',
    '大剧院', '音乐厅', '图书馆', '科技馆'
];

/**
 * 预设地标数据 - 为热门城市预设知名地标
 */
export const PRESET_LANDMARKS = {
    '北京': [
        { name: '天安门广场', type: '地标建筑', coordinates: { lat: 39.9042, lon: 116.4074 } },
        { name: '北京站', type: '交通枢纽', coordinates: { lat: 39.9021, lon: 116.4272 } },
        { name: '北京南站', type: '交通枢纽', coordinates: { lat: 39.8654, lon: 116.3786 } },
        { name: '首都机场', type: '交通枢纽', coordinates: { lat: 40.0799, lon: 116.6031 } },
        { name: '国家体育场', type: '体育场馆', coordinates: { lat: 39.9928, lon: 116.3970 } }
    ],
    '上海': [
        { name: '外滩', type: '风景名胜', coordinates: { lat: 31.2304, lon: 121.4737 } },
        { name: '上海站', type: '交通枢纽', coordinates: { lat: 31.2494, lon: 121.4658 } },
        { name: '虹桥机场', type: '交通枢纽', coordinates: { lat: 31.1979, lon: 121.3364 } },
        { name: '浦东机场', type: '交通枢纽', coordinates: { lat: 31.1443, lon: 121.8083 } },
        { name: '东方明珠', type: '地标建筑', coordinates: { lat: 31.2397, lon: 121.4999 } }
    ],
    '广州': [
        { name: '广州塔', type: '地标建筑', coordinates: { lat: 23.1051, lon: 113.3240 } },
        { name: '广州站', type: '交通枢纽', coordinates: { lat: 23.1496, lon: 113.2578 } },
        { name: '白云机场', type: '交通枢纽', coordinates: { lat: 23.3924, lon: 113.2988 } },
        { name: '珠江新城', type: '商业中心', coordinates: { lat: 23.1200, lon: 113.3240 } }
    ],
    '深圳': [
        { name: '深圳站', type: '交通枢纽', coordinates: { lat: 22.5329, lon: 114.1151 } },
        { name: '深圳北站', type: '交通枢纽', coordinates: { lat: 22.6097, lon: 114.0298 } },
        { name: '宝安机场', type: '交通枢纽', coordinates: { lat: 22.6390, lon: 113.8106 } },
        { name: '平安金融中心', type: '地标建筑', coordinates: { lat: 22.5431, lon: 114.1094 } }
    ],
    '杭州': [
        { name: '西湖', type: '风景名胜', coordinates: { lat: 30.2594, lon: 120.1628 } },
        { name: '杭州站', type: '交通枢纽', coordinates: { lat: 30.2422, lon: 120.1814 } },
        { name: '杭州东站', type: '交通枢纽', coordinates: { lat: 30.2906, lon: 120.2122 } },
        { name: '萧山机场', type: '交通枢纽', coordinates: { lat: 30.2295, lon: 120.4347 } }
    ],
    '南京': [
        { name: '夫子庙', type: '文化场馆', coordinates: { lat: 32.0192, lon: 118.7942 } },
        { name: '南京站', type: '交通枢纽', coordinates: { lat: 32.0861, lon: 118.7644 } },
        { name: '南京南站', type: '交通枢纽', coordinates: { lat: 31.9561, lon: 118.7178 } },
        { name: '禄口机场', type: '交通枢纽', coordinates: { lat: 31.7420, lon: 118.8620 } }
    ],
    '成都': [
        { name: '天府广场', type: '地标建筑', coordinates: { lat: 30.6598, lon: 104.0657 } },
        { name: '成都站', type: '交通枢纽', coordinates: { lat: 30.6970, lon: 104.0420 } },
        { name: '成都东站', type: '交通枢纽', coordinates: { lat: 30.6138, lon: 104.1414 } },
        { name: '双流机场', type: '交通枢纽', coordinates: { lat: 30.5728, lon: 103.9477 } }
    ],
    '重庆': [
        { name: '解放碑', type: '地标建筑', coordinates: { lat: 29.5583, lon: 106.5770 } },
        { name: '重庆站', type: '交通枢纽', coordinates: { lat: 29.5583, lon: 106.5770 } },
        { name: '重庆北站', type: '交通枢纽', coordinates: { lat: 29.6128, lon: 106.5347 } },
        { name: '江北机场', type: '交通枢纽', coordinates: { lat: 29.7192, lon: 106.6417 } }
    ]
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
 * 简化地标类型显示
 * @param {string} type - 原始POI类型
 * @returns {string} - 简化后的类型名称
 */
export const getSimplifiedLandmarkType = (type) => {
    if (!type) return '地标建筑';

    if (type.includes('火车站') || type.includes('机场') || type.includes('地铁') || type.includes('汽车站')) {
        return '交通枢纽';
    }
    if (type.includes('政府') || type.includes('市政') || type.includes('行政')) {
        return '政府机构';
    }
    if (type.includes('博物馆') || type.includes('纪念') || type.includes('文化') || type.includes('图书馆')) {
        return '文化场馆';
    }
    if (type.includes('体育') || type.includes('场馆') || type.includes('体育场') || type.includes('体育中心')) {
        return '体育场馆';
    }
    if (type.includes('风景') || type.includes('公园') || type.includes('广场')) {
        return '风景名胜';
    }
    if (type.includes('商场') || type.includes('购物') || type.includes('商业') || type.includes('中心')) {
        return '商业中心';
    }
    if (type.includes('医院') || type.includes('医疗')) {
        return '医疗机构';
    }
    if (type.includes('学校') || type.includes('大学') || type.includes('教育')) {
        return '教育机构';
    }
    if (type.includes('酒店') || type.includes('宾馆')) {
        return '住宿场所';
    }

    return '地标建筑';
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
                    tel: Array.isArray(poi.tel)?(poi.tel[0] || '') : (poi.tel || ''),
                    rating: (poi.biz_ext && poi.biz_ext.rating)?parseFloat(poi.biz_ext.rating) : 0,
                    // 餐厅特有信息
                    cost: (poi.biz_ext && poi.biz_ext.cost)?parseFloat(poi.biz_ext.cost) : null,
                    price: (poi.biz_ext && poi.biz_ext.cost)?parseFloat(poi.biz_ext.cost) : null,
                    // 标签信息（餐厅的招牌菜等）
                    tag: Array.isArray(poi.tag)?(poi.tag.length > 0?poi.tag.join(',') : '') : (poi.tag || ''),
                    tags: Array.isArray(poi.tag)?poi.tag.filter(t => t) : (poi.tag?poi.tag.split(',').map(t => t.trim()).filter(t => t) : []),
                    // 提取图片信息
                    images: [],
                    // 详细信息
                    businessArea: Array.isArray(poi.business_area)?(poi.business_area[0] || '') : (poi.business_area || ''),
                    district: poi.adname || '',
                    category: poi.type || '',
                    type: poi.type || '',
                    website: Array.isArray(poi.website)?(poi.website[0] || '') : (poi.website || ''),
                    openTime: poi.business_time || '',
                    // 坐标信息
                    coordinates: poi.location?poi.location.split(',').map(Number) : null,
                    // 原始数据保留
                    rawData: poi
                };

                // 处理图片信息
                if (poi.photos && Array.isArray(poi.photos)) {
                    enhancedPoi.images = poi.photos
                        .filter(photo => photo && photo.url) // 确保有有效的URL
                        .map(photo => ({
                            url: photo.url,
                            title: Array.isArray(photo.title)?(photo.title[0] || poi.name) : (photo.title || poi.name),
                            alt: Array.isArray(photo.title)?(photo.title[0] || poi.name) : (photo.title || poi.name),
                            provider: Array.isArray(photo.provider)?photo.provider[0] : photo.provider
                        }));
                    // 保持原始photos格式供组件使用，但确保数据结构正确
                    enhancedPoi.photos = poi.photos
                        .filter(photo => photo && photo.url)
                        .map(photo => ({
                            url: photo.url,
                            title: Array.isArray(photo.title)?(photo.title[0] || poi.name) : (photo.title || poi.name),
                            provider: Array.isArray(photo.provider)?photo.provider[0] : photo.provider
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

    /**
     * 获取城市地标
     * @param {string} city - 城市名
     * @param {Object} options - 选项
     * @param {boolean} [options.includePreset=true] - 是否包含预设地标
     * @param {number} [options.maxResults=20] - 最大结果数量
     * @returns {Promise<Array>} - 地标数组
     */
    async getCityLandmarks(city, { includePreset = true, maxResults = 20 } = {}) {
        const landmarks = [];

        // 1. 添加预设地标（如果有的话）
        if (includePreset && PRESET_LANDMARKS[city]) {
            landmarks.push(...PRESET_LANDMARKS[city]);
            console.log(`✅ 添加了 ${PRESET_LANDMARKS[city].length} 个预设地标`);
        }

        // 2. 通过API搜索地标
        const searchTypes = [
            { keywords: '地标 标志性建筑', types: POI_TYPES.FAMOUS_BUILDING },
            { keywords: '火车站 高铁站', types: POI_TYPES.TRANSPORT },
            { keywords: '机场', types: POI_TYPES.TRANSPORT },
            { keywords: '政府大楼 市政府 行政中心', types: POI_TYPES.GOVERNMENT },
            { keywords: '博物馆 纪念馆 文化中心', types: POI_TYPES.CULTURAL_VENUE },
            { keywords: '体育场 体育中心 体育馆', types: POI_TYPES.SPORTS_VENUE },
            { keywords: '广场 中心广场', types: POI_TYPES.ATTRACTION },
            { keywords: '大剧院 音乐厅 会展中心', types: POI_TYPES.CULTURAL_VENUE }
        ];

        for (const searchType of searchTypes) {
            try {
                console.log(`🔍 搜索地标类型: ${searchType.keywords}`);

                const response = await this.searchPlaces({
                    keywords: searchType.keywords,
                    city: city,
                    types: searchType.types,
                    pageSize: 3,
                    page: 1,
                    enhance: false // 地标不需要完整的增强处理
                });

                if (response.pois && response.pois.length > 0) {
                    const newLandmarks = response.pois
                        .filter(poi => poi.location && poi.name) // 确保有坐标和名称
                        .map(poi => {
                            const [lon, lat] = poi.location.split(',').map(parseFloat);
                            return {
                                id: poi.id,
                                name: poi.name,
                                type: getSimplifiedLandmarkType(poi.type),
                                coordinates: { lat, lon },
                                address: poi.address,
                                rating: (poi.biz_ext && poi.biz_ext.rating)?parseFloat(poi.biz_ext.rating) : 0,
                                category: poi.type || '',
                                source: 'api'
                            };
                        });

                    landmarks.push(...newLandmarks);
                    console.log(`✅ 找到 ${newLandmarks.length} 个 ${searchType.keywords} 地标`);
                }

                // 添加小延迟避免请求过快
                await new Promise(resolve => setTimeout(resolve, 50));

            } catch (error) {
                console.warn(`搜索${searchType.keywords}失败:`, error);
            }
        }

        // 3. 去重并排序
        const uniqueLandmarks = landmarks
            .filter((landmark, index, self) => {
                // 根据名称去重，保留第一个（预设地标优先）
                return index === self.findIndex(l => l.name === landmark.name);
            })
            .sort((a, b) => {
                // 预设地标排在前面
                if (a.source !== b.source) {
                    return a.source === 'preset'?-1 : 1;
                }
                // 按评分排序
                return (b.rating || 0) - (a.rating || 0);
            })
            .slice(0, maxResults);

        console.log(`🎯 ${city} 最终获取到 ${uniqueLandmarks.length} 个地标`);
        return uniqueLandmarks;
    }

    /**
     * 获取地标缓存键
     * @param {string} city - 城市名
     * @returns {string} - 缓存键
     */
    _getLandmarkCacheKey(city) {
        return `landmarks_${city}`;
    }

    /**
     * 缓存地标数据（简单内存缓存）
     */
    _landmarkCache = new Map();

    /**
     * 获取缓存的地标数据
     * @param {string} city - 城市名
     * @param {number} [maxAge=300000] - 缓存最大年龄（毫秒，默认5分钟）
     * @returns {Array|null} - 缓存的地标数据或null
     */
    getCachedLandmarks(city, maxAge = 300000) {
        const cacheKey = this._getLandmarkCacheKey(city);
        const cached = this._landmarkCache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp) < maxAge) {
            console.log(`📦 使用缓存的地标数据: ${city}`);
            return cached.data;
        }

        return null;
    }

    /**
     * 缓存地标数据
     * @param {string} city - 城市名
     * @param {Array} landmarks - 地标数据
     */
    setCachedLandmarks(city, landmarks) {
        const cacheKey = this._getLandmarkCacheKey(city);
        this._landmarkCache.set(cacheKey, {
            data: landmarks,
            timestamp: Date.now()
        });
        console.log(`💾 缓存地标数据: ${city}, ${landmarks.length} 个地标`);
    }

    /**
     * 获取城市地标（带缓存）
     * @param {string} city - 城市名
     * @param {Object} options - 选项
     * @returns {Promise<Array>} - 地标数组
     */
    async getCityLandmarksWithCache(city, options = {}) {
        // 先尝试从缓存获取
        const cached = this.getCachedLandmarks(city);
        if (cached) {
            return cached;
        }

        // 缓存未命中，从API获取
        try {
            const landmarks = await this.getCityLandmarks(city, options);
            // 缓存结果
            this.setCachedLandmarks(city, landmarks);
            return landmarks;
        } catch (error) {
            console.error('获取城市地标失败:', error);
            // 如果API失败，至少返回预设地标
            return PRESET_LANDMARKS[city] || [];
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
    getBatchRecommendations,
    getCityLandmarks,
    getCityLandmarksWithCache
} = amapService;