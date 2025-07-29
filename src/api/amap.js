import axios from 'axios';

// 读取环境变量中的API Key或使用默认密钥
// 注意：这个默认密钥仅用于开发测试，生产环境应从环境变量获取
const apiKey =
    import.meta.env.VITE_AMAP_API_KEY || '5808fc8e9ec5676905b0d0fe33a3c702'; // 提供一个备用测试密钥

// 如果环境变量中没有API Key，打印警告
if (!
    import.meta.env.VITE_AMAP_API_KEY) {
    console.warn('提示: 正在使用默认的高德地图API Key，仅供开发测试，建议在.env.local文件中设置VITE_AMAP_API_KEY');
}

// 导出API Key以供其他模块使用
export const amapKey = apiKey;

// 创建专用于高德地图API的axios实例，不使用项目的request实例（避免baseURL冲突）
const amapRequest = axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
});

// 添加请求拦截器
amapRequest.interceptors.request.use(
    config => {
        console.log(`🚀 发送高德API请求: ${config.url}`, config.params);
        return config;
    },
    error => {
        console.error('❌ 高德API请求拦截器错误:', error);
        return Promise.reject(error);
    }
);

// 添加响应拦截器
amapRequest.interceptors.response.use(
    response => {
        console.log(`✅ 高德API响应成功: ${response.config.url}`);
        return response;
    },
    error => {
        console.error('❌ 高德API响应错误:', error);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        } else if (error.request) {
            console.error('请求发送但未收到响应:', error.request);
        } else {
            console.error('请求配置错误:', error.message);
        }
        return Promise.reject(error);
    }
);

const baseUrl = 'https://restapi.amap.com/v3/place/text';

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
        console.error('错误: 高德地图API Key未设置，无法发送请求');
        throw new Error('API Key未设置');
    }

    // 检查城市参数是否存在
    if (!params.city) {
        console.error('错误: 未提供城市参数');
        throw new Error('未提供城市参数');
    }

    const defaultParams = {
        key: apiKey,
        offset: 10,
        page: 1,
        extensions: 'all', // 获取更详细的信息，如照片
    };

    const fullParams = {...defaultParams, ...params };
    console.log('🔍 高德地图API搜索参数:', fullParams);

    try {
        // 使用专用的amapRequest实例，直接请求完整URL
        const response = await amapRequest({
            url: baseUrl,
            method: 'get',
            params: fullParams,
        });

        // 高德地图API返回的数据在response.data中
        const data = response.data;

        console.log(`📊 高德地图API返回结果: 状态=${data.status}, 数量=${data.count || '未知'}`);
        if (data && data.pois && data.pois.length > 0) {
            console.log(`🎯 找到 ${data.pois.length} 个POI结果`);
        }

        // 检查API响应状态
        if (data && data.status === '1') {
            return data;
        } else {
            console.error('❌ 高德地图API错误:', data && data.info ? data.info : '未知错误');
            throw new Error(data && data.info ? data.info : '未知错误');
        }
    } catch (error) {
        console.error('❌ 高德地图API请求失败:', error);
        throw error;
    }
};

// 预设一些常用的搜索函数

/**
 * 搜索指定城市的推荐景点
 * @param {string} city - 城市名或citycode
 * @param {number} [page=1] - 页码
 * @param {number} [pageSize=6] - 每页数量
 * @returns {Promise<any>}
 */
export const getRecommendedAttractions = (city, page = 1, pageSize = 6) => {
    console.log(`🏛️ 获取城市[${city}]的推荐景点, 页码:${page}, 每页:${pageSize}`);
    return searchPlaces({
        keywords: '景点',
        types: '110000', // 风景名胜
        city: city,
        offset: pageSize,
        page: page,
    });
};

/**
 * 搜索指定城市的推荐餐厅
 * @param {string} city - 城市名或citycode
 * @param {number} [page=1] - 页码
 * @param {number} [pageSize=6] - 每页数量
 * @returns {Promise<any>}
 */
export const getRecommendedRestaurants = (city, page = 1, pageSize = 6) => {
    console.log(`🍲 获取城市[${city}]的推荐餐厅, 页码:${page}, 每页:${pageSize}`);
    return searchPlaces({
        keywords: '美食',
        types: '050000', // 餐饮服务
        city: city,
        offset: pageSize,
        page: page,
    });
};