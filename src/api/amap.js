import axios from "axios";

// 读取环境变量中的API Key或使用默认密钥
// 注意：这个默认密钥仅用于开发测试，生产环境应从环境变量获取
const apiKey =
    import.meta.env.VITE_AMAP_API_KEY || "5808fc8e9ec5676905b0d0fe33a3c702"; // 提供一个备用测试密钥

// 如果环境变量中没有API Key，打印警告
if (!
    import.meta.env.VITE_AMAP_API_KEY) {
    console.warn(
        "提示: 正在使用默认的高德地图API Key，仅供开发测试，建议在.env.local文件中设置VITE_AMAP_API_KEY",
    );
}

// 导出API Key以供其他模块使用
export const amapKey = apiKey;

// 创建专用于高德地图API的axios实例，不使用项目的request实例（避免baseURL冲突）
const amapRequest = axios.create({
    timeout: 10000,
    headers: {
        "Content-Type": "application/json;charset=UTF-8",
    },
});

// 添加请求拦截器
amapRequest.interceptors.request.use(
    (config) => {
        // console.log(`🚀 发送高德API请求: ${config.url}`, config.params);
        return config;
    },
    (error) => {
        console.error("❌ 高德API请求拦截器错误:", error);
        return Promise.reject(error);
    },
);

// 请求队列管理类
class RequestQueue {
    constructor(concurrency = 1, interval = 300) {
        this.concurrency = concurrency;
        this.interval = interval;
        this.queue = [];
        this.activeCount = 0;
        this.lastRequestTime = 0;
    }

    async add(requestFn) {
        return new Promise((resolve, reject) => {
            this.queue.push({ requestFn, resolve, reject });
            this.process();
        });
    }

    async process() {
        if (this.activeCount >= this.concurrency || this.queue.length === 0) {
            return;
        }

        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.interval) {
            setTimeout(() => this.process(), this.interval - timeSinceLastRequest);
            return;
        }

        const { requestFn, resolve, reject } = this.queue.shift();
        this.activeCount++;
        this.lastRequestTime = Date.now();

        try {
            const result = await requestFn();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.activeCount--;
            this.process();
        }
    }
}

// 创建全局请求队列实例，限制并发数为1，请求间隔300ms
const requestQueue = new RequestQueue(1, 300);

// 添加响应拦截器
amapRequest.interceptors.response.use(
    (response) => {
        // console.log(`✅ 高德API响应成功: ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error("❌ 高德API响应错误:", error);
        if (error.response) {
            console.error("响应状态:", error.response.status);
            console.error("响应数据:", error.response.data);
        } else if (error.request) {
            console.error("请求发送但未收到响应:", error.request);
        } else {
            console.error("请求配置错误:", error.message);
        }
        return Promise.reject(error);
    },
);

const baseUrl = "https://restapi.amap.com/v3/place/text";

/**
 * 搜索地理位置信息 (POI)
 * @param {object} params - 请求参数
 * @param {string} params.keywords - 搜索关键字，如 "景点"、"美食" 或具体名称
 * @param {string} params.city - 城市名或citycode
 * @param {string} [params.types] - POI分类代码，如 "050000" 代表餐饮服务, "110000" 代表风景名胜
 * @param {number} [params.offset=10] - 每页记录数
 * @param {number} [params.page=1] - 当前页数
 * @returns {Promise<any>}
 */
export const searchPlaces = async(params) => {
    // 检查API Key是否存在
    if (!apiKey) {
        console.error("错误: 高德地图API Key未设置，无法发送请求");
        throw new Error("API Key未设置");
    }

    // 检查城市参数是否存在
    if (!params.city) {
        console.error("错误: 未提供城市参数");
        throw new Error("未提供城市参数");
    }

    const defaultParams = {
        key: apiKey,
        offset: 10,
        page: 1,
        extensions: "all", // 获取更详细的信息，如照片
        output: "json", // 输出格式
        children: 1, // 返回下级POI
        cityLimit: true, // 仅在指定城市搜索
    };

    const fullParams = {...defaultParams, ...params };
    // console.log('🔍 高德地图API搜索参数:', fullParams);

    try {
        // 使用请求队列发送请求
        const response = await requestQueue.add(() => amapRequest({
            url: baseUrl,
            method: "get",
            params: fullParams,
        }));

        // 高德地图API返回的数据在response.data中
        const data = response.data;

        // console.log(`📊 高德地图API返回结果: 状态=${data.status}, 数量=${data.count || '未知'}`);
        if (data && data.pois && data.pois.length > 0) {
            // console.log(`🎯 找到 ${data.pois.length} 个POI结果`);
        }

        // 检查API响应状态
        if (data && data.status === "1") {
            return data;
        } else {
            console.error(
                "❌ 高德地图API错误:",
                data && data.info?data.info : "未知错误",
            );
            throw new Error(data && data.info?data.info : "未知错误");
        }
    } catch (error) {
        console.error("❌ 高德地图API请求失败:", error);
        throw error;
    }
};

/**
 * 获取POI详细信息
 * @param {string} poiId - POI的ID
 * @returns {Promise<any>}
 */
export const getPoiDetail = async(poiId) => {
    if (!poiId) {
        console.error("错误: POI ID不能为空");
        throw new Error("POI ID不能为空");
    }

    // 检查API Key是否存在
    if (!apiKey) {
        console.error("错误: 高德地图API Key未设置，无法获取POI详情");
        throw new Error("API Key未设置");
    }

    try {
        console.log(`🔍 正在获取POI详情: ${poiId}`);

        const response = await requestQueue.add(() => amapRequest({
            url: "https://restapi.amap.com/v3/place/detail",
            method: "get",
            params: {
                key: apiKey,
                id: poiId,
                output: "json",
                extensions: "all"
            },
        }));

        const data = response.data;

        if (data && data.status === "1") {
            console.log(`✅ 获取POI详情成功: ${poiId}`);
            return data;
        } else {
            console.error("❌ 高德地图POI详情API错误:", data?.info || "未知错误");
            throw new Error(data?.info || "未知错误");
        }
    } catch (error) {
        console.error(`❌ 获取POI详情失败 [${poiId}]:`, error);
        throw error;
    }
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

    // console.log(`🔧 正在增强 ${pois.length} 个POI的数据...`);

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
                    coordinates: poi.location?poi.location.split(',').map(Number) : null,
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

    // console.log(`✅ POI数据增强完成，处理了 ${enhancedPois.length} 个POI`);
    return enhancedPois;
};

/**
 * 根据POI类型获取默认图片
 * @param {string} type - POI类型
 * @returns {string} - 默认图片URL
 */
const getDefaultImageByType = (type) => {
    if (!type) return '/images/default-poi.jpg';

    // 景点类型
    if (type.includes('风景名胜') || type.includes('旅游景点') || type.includes('公园')) {
        return '/images/default-attraction.jpg';
    }
    // 餐饮类型
    if (type.includes('餐饮') || type.includes('美食') || type.includes('中餐') || type.includes('西餐')) {
        return '/images/default-restaurant.jpg';
    }
    // 其他类型
    return '/images/default-poi.jpg';
};

/**
 * 生成POI描述信息
 * @param {Object} poi - 原始POI数据
 * @returns {string} - 生成的描述
 */
const generatePoiDescription = (poi) => {
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

// 预设一些常用的搜索函数

/**
 * 搜索指定城市的推荐景点
 * @param {string} city - 城市名或citycode
 * @param {number} [page=1] - 页码
 * @param {number} [pageSize=6] - 每页数量
 * @returns {Promise<any>}
 */
export const getRecommendedAttractions = async(city, page = 1, pageSize = 6) => {
    // console.log(`🏛️ 获取城市[${city}]的推荐景点, 页码:${page}, 每页:${pageSize}`);

    try {
        const response = await searchPlaces({
            keywords: "景点",
            types: "110000", // 风景名胜
            city: city,
            offset: pageSize,
            page: page,
        });

        // 直接返回原始数据，不进行数据增强
        return response;
    } catch (error) {
        console.error(`获取推荐景点失败: ${city}`, error);
        throw error;
    }
};

/**
 * 搜索指定城市的推荐餐厅
 * @param {string} city - 城市名或citycode
 * @param {number} [page=1] - 页码
 * @param {number} [pageSize=6] - 每页数量
 * @returns {Promise<any>}
 */
export const getRecommendedRestaurants = async(city, page = 1, pageSize = 6) => {
    // console.log(`🍲 获取城市[${city}]的推荐餐厅, 页码:${page}, 每页:${pageSize}`);

    try {
        const response = await searchPlaces({
            keywords: "美食",
            types: "050000", // 餐饮服务
            city: city,
            offset: pageSize,
            page: page,
        });

        // 直接返回原始数据，不进行数据增强
        return response;
    } catch (error) {
        console.error(`获取推荐餐厅失败: ${city}`, error);
        throw error;
    }
};

/**
 * 搜索指定城市的推荐酒店
 * @param {string} city - 城市名或citycode
 * @param {number} [page=1] - 页码
 * @param {number} [pageSize=6] - 每页数量
 * @returns {Promise<any>}
 */
export const getRecommendedHotels = async(city, page = 1, pageSize = 6) => {
    // console.log(`🏨 获取城市[${city}]的推荐酒店, 页码:${page}, 每页:${pageSize}`);

    try {
        const response = await searchPlaces({
            keywords: "酒店",
            types: "100000", // 住宿服务
            city: city,
            offset: pageSize,
            page: page,
        });

        // 直接返回原始数据，不进行数据增强
        return response;
    } catch (error) {
        console.error(`获取推荐酒店失败: ${city}`, error);
        throw error;
    }
};

// ==================== 地理编码相关功能 ====================

// ==================== 坐标系转换 (GCJ-02 -> WGS-84) ====================
// 高德返回GCJ-02坐标，而ECharts的中国地图GeoJSON通常使用WGS-84
// 为避免偏移，这里统一将GCJ-02转换为WGS-84
const PI = Math.PI;
const A = 6378245.0; // 长半轴
const EE = 0.00669342162296594323; // 偏心率平方

const outOfChina = (lng, lat) => {
    return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
};

const transformLat = (x, y) => {
    let ret = -100.0 +
        2.0 * x +
        3.0 * y +
        0.2 * y * y +
        0.1 * x * y +
        0.2 * Math.sqrt(Math.abs(x));
    ret +=
        ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) /
        3.0;
    ret +=
        ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) / 3.0;
    ret +=
        ((160.0 * Math.sin((y / 12.0) * PI) + 320.0 * Math.sin((y * PI) / 30.0)) *
            2.0) /
        3.0;
    return ret;
};

const transformLng = (x, y) => {
    let ret =
        300.0 +
        x +
        2.0 * y +
        0.1 * x * x +
        0.1 * x * y +
        0.1 * Math.sqrt(Math.abs(x));
    ret +=
        ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) /
        3.0;
    ret +=
        ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) / 3.0;
    ret +=
        ((150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) *
            2.0) /
        3.0;
    return ret;
};

const gcj02ToWgs84 = (lng, lat) => {
    if (outOfChina(lng, lat)) {
        return [lng, lat];
    }
    let dLat = transformLat(lng - 105.0, lat - 35.0);
    let dLng = transformLng(lng - 105.0, lat - 35.0);
    const radLat = (lat / 180.0) * PI;
    let magic = Math.sin(radLat);
    magic = 1 - EE * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI);
    dLng = (dLng * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * PI);
    const mgLat = lat + dLat;
    const mgLng = lng + dLng;
    return [lng * 2 - mgLng, lat * 2 - mgLat];
};

// 城市坐标缓存key前缀（加入wgs84标识以清理旧的GCJ缓存）
const COORDINATE_CACHE_PREFIX = "amap_city_coordinates_wgs84_";
const COORDINATE_CACHE_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30天过期

/**
 * 从缓存获取城市坐标
 * @param {string} cityName - 城市名称
 * @returns {Object|null} - 坐标对象或null
 */
const getCachedCoordinate = (cityName) => {
    try {
        const cacheKey = COORDINATE_CACHE_PREFIX + cityName;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const data = JSON.parse(cached);
            // 检查是否过期
            if (data.timestamp + COORDINATE_CACHE_EXPIRY > Date.now()) {
                return data.coordinate;
            } else {
                localStorage.removeItem(cacheKey);
            }
        }
    } catch (error) {
        console.warn(`读取城市坐标缓存失败 [${cityName}]:`, error);
    }
    return null;
};

/**
 * 缓存城市坐标
 * @param {string} cityName - 城市名称
 * @param {Array} coordinate - [经度, 纬度]
 */
const setCachedCoordinate = (cityName, coordinate) => {
    try {
        const cacheKey = COORDINATE_CACHE_PREFIX + cityName;
        const data = {
            coordinate,
            timestamp: Date.now(),
        };
        localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
        console.warn(`缓存城市坐标失败 [${cityName}]:`, error);
    }
};

/**
 * 获取城市的精确经纬度坐标（地理编码）
 * @param {string} cityName - 城市名称
 * @returns {Promise<Array>} - 返回[经度, 纬度]数组
 */
export const getCityCoordinate = async(cityName) => {
    if (!cityName) {
        throw new Error("城市名称不能为空");
    }

    // 先检查缓存
    const cached = getCachedCoordinate(cityName);
    if (cached) {
        // console.log(`🎯 从缓存获取城市坐标 [${cityName}]:`, cached);
        return cached;
    }

    // 检查API Key是否存在
    if (!apiKey) {
        console.error("错误: 高德地图API Key未设置，无法获取城市坐标");
        throw new Error("API Key未设置");
    }

    try {
        // console.log(`📍 正在获取城市坐标: ${cityName}`);

        // 调用高德地理编码API
        const response = await requestQueue.add(() => amapRequest({
            url: "https://restapi.amap.com/v3/geocode/geo",
            method: "get",
            params: {
                key: apiKey,
                address: cityName,
                output: "JSON",
            },
        }));

        const data = response.data;

        if (
            data &&
            data.status === "1" &&
            data.geocodes &&
            data.geocodes.length > 0
        ) {
            const geocode = data.geocodes[0];
            if (geocode.location) {
                // 高德API返回GCJ-02坐标（"经度,纬度"）
                const [gcjLng, gcjLat] = geocode.location.split(",").map(Number);
                // 转换为WGS-84，避免在ECharts中国GeoJSON上出现偏移
                const [lng, lat] = gcj02ToWgs84(gcjLng, gcjLat);
                const coordinate = [lng, lat];

                // 缓存结果
                setCachedCoordinate(cityName, coordinate);
                return coordinate;
            }
        }

        // API调用成功但没有找到坐标
        console.warn(`⚠️ 未找到城市坐标: ${cityName}`);
        throw new Error(`未找到城市坐标: ${cityName}`);
    } catch (error) {
        console.error(`❌ 获取城市坐标失败 [${cityName}]:`, error);
        throw error;
    }
};

/**
 * 批量获取多个城市的坐标
 * @param {Array<string>} cityNames - 城市名称数组
 * @param {number} [delay=100] - 请求间隔（毫秒），避免API限流
 * @returns {Promise<Object>} - 返回城市名称到坐标的映射对象
 */
export const getBatchCityCoordinates = async(cityNames, delay = 100) => {
    if (!Array.isArray(cityNames) || cityNames.length === 0) {
        return {};
    }

    const results = {};
    const failedCities = [];

    // console.log(`🌍 批量获取 ${cityNames.length} 个城市的坐标`);

    for (const cityName of cityNames) {
        try {
            const coordinate = await getCityCoordinate(cityName); // 已为WGS-84
            results[cityName] = coordinate;

            // 添加延迟避免API限流
            if (delay > 0 && cityNames.indexOf(cityName) < cityNames.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        } catch (error) {
            console.warn(`获取城市坐标失败: ${cityName}`, error);
            failedCities.push(cityName);
            // 失败时使用中国中心点附近的随机坐标作为备选
            results[cityName] = [
                104 + Math.random() * 20 - 10,
                35 + Math.random() * 15 - 7.5,
            ];
        }
    }

    if (failedCities.length > 0) {
        console.warn(`⚠️ ${failedCities.length} 个城市坐标获取失败:`, failedCities);
    }

    // console.log(`✅ 批量坐标获取完成，成功: ${Object.keys(results).length - failedCities.length}, 失败: ${failedCities.length}`);
    return results;
};

/**
 * 清理过期的坐标缓存
 */
export const cleanExpiredCoordinateCache = () => {
    try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (
                key &&
                (key.startsWith(COORDINATE_CACHE_PREFIX) ||
                    key.startsWith("amap_city_coordinates_"))
            ) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data.timestamp + COORDINATE_CACHE_EXPIRY <= Date.now()) {
                        keysToRemove.push(key);
                    }
                } catch (error) {
                    // 解析失败的缓存项也删除
                    keysToRemove.push(key);
                }
            }
        }

        keysToRemove.forEach((key) => localStorage.removeItem(key));

        if (keysToRemove.length > 0) {
            console.log(
                `🧹 清理了 ${keysToRemove.length} 个过期/旧版本的城市坐标缓存`,
            );
        }
    } catch (error) {
        console.warn("清理坐标缓存失败:", error);
    }
};
// 在模块加载时自动清理过期缓存
cleanExpiredCoordinateCache();