import { searchPlaces, enhancePoiData } from '@/api/amap.js';

/**
 * POI增强服务 - 将AI推荐的地点通过高德API获取详细信息
 */

/**
 * 根据AI推荐的地点名称和城市搜索高德地图POI信息
 * @param {string} placeName - 地点名称
 * @param {string} city - 城市名称
 * @param {string} type - 地点类型 ('attraction' | 'restaurant')
 * @returns {Promise<Object|null>} - 增强后的POI信息
 */
export const searchAndEnhancePoi = async(placeName, city, type = 'attraction') => {
    try {
        console.log(`🔍 正在搜索地点: ${placeName} (${city})`);

        // 根据类型设置搜索参数
        const searchParams = {
            keywords: placeName,
            city: city,
            offset: 5, // 只取前5个结果
            page: 1
        };

        // 根据类型添加分类过滤
        if (type === 'attraction') {
            searchParams.types = '110000'; // 风景名胜
        } else if (type === 'restaurant') {
            searchParams.types = '050000'; // 餐饮服务
        }

        const response = await searchPlaces(searchParams);

        if (response && response.pois && response.pois.length > 0) {
            // 查找最匹配的POI（名称相似度最高的）
            const bestMatch = findBestMatch(placeName, response.pois);

            if (bestMatch) {
                // 使用现有的增强功能
                const enhancedPois = await enhancePoiData([bestMatch]);
                const enhancedPoi = enhancedPois[0];

                console.log(`✅ 找到匹配地点: ${enhancedPoi.name}`);
                return enhancedPoi;
            }
        }

        console.warn(`⚠️ 未找到匹配的地点: ${placeName} (${city})`);
        return null;
    } catch (error) {
        console.error(`❌ 搜索地点失败: ${placeName} (${city})`, error);
        return null;
    }
};

/**
 * 批量增强AI推荐的地点列表
 * @param {Array} aiRecommendations - AI推荐的地点列表
 * @param {string} city - 城市名称
 * @returns {Promise<Array>} - 增强后的地点列表
 */
export const enhanceAiRecommendations = async(aiRecommendations, city) => {
    if (!Array.isArray(aiRecommendations) || aiRecommendations.length === 0) {
        return [];
    }

    console.log(`🚀 开始增强 ${aiRecommendations.length} 个AI推荐地点`);

    const enhancedRecommendations = await Promise.allSettled(
        aiRecommendations.map(async(item) => {
            try {
                // 确定地点类型
                const type = determinePoiType(item);

                // 搜索高德POI信息
                const enhancedPoi = await searchAndEnhancePoi(item.name, city, type);

                if (enhancedPoi) {
                    // 合并AI推荐信息和高德POI信息
                    return {
                        ...item, // 保留AI推荐的原始信息
                        poi: enhancedPoi, // 添加高德POI详细信息
                        imageUrl: enhancedPoi.imageUrl,
                        address: enhancedPoi.address,
                        rating: enhancedPoi.rating,
                        tel: enhancedPoi.tel,
                        openTime: enhancedPoi.openTime,
                        coordinates: enhancedPoi.coordinates,
                        isEnhanced: true
                    };
                } else {
                    // 如果没找到POI信息，返回原始推荐加默认信息
                    return {
                        ...item,
                        poi: null,
                        imageUrl: getDefaultImageByType(type),
                        address: '地址信息待完善',
                        isEnhanced: false
                    };
                }
            } catch (error) {
                console.warn(`增强地点失败: ${item.name}`, error);
                return {
                    ...item,
                    poi: null,
                    imageUrl: getDefaultImageByType(determinePoiType(item)),
                    address: '地址信息待完善',
                    isEnhanced: false
                };
            }
        })
    );

    // 处理Promise.allSettled结果
    const results = enhancedRecommendations
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);

    const successCount = results.filter(item => item.isEnhanced).length;
    console.log(`✅ 地点增强完成: ${successCount}/${results.length} 个地点获取到详细信息`);

    return results;
};

/**
 * 查找最佳匹配的POI
 * @param {string} targetName - 目标地点名称
 * @param {Array} pois - POI列表
 * @returns {Object|null} - 最佳匹配的POI
 */
const findBestMatch = (targetName, pois) => {
    if (!pois || pois.length === 0) return null;

    // 计算名称相似度
    const scored = pois.map(poi => ({
        poi,
        score: calculateNameSimilarity(targetName, poi.name)
    }));

    // 按相似度排序
    scored.sort((a, b) => b.score - a.score);

    // 如果最高分大于阈值，返回最佳匹配
    if (scored[0].score > 0.3) {
        return scored[0].poi;
    }

    // 否则返回第一个结果（通常是最相关的）
    return pois[0];
};

/**
 * 计算两个字符串的相似度
 * @param {string} str1 - 字符串1
 * @param {string} str2 - 字符串2
 * @returns {number} - 相似度分数 (0-1)
 */
const calculateNameSimilarity = (str1, str2) => {
    if (!str1 || !str2) return 0;

    str1 = str1.toLowerCase().trim();
    str2 = str2.toLowerCase().trim();

    // 完全匹配
    if (str1 === str2) return 1;

    // 包含关系
    if (str1.includes(str2) || str2.includes(str1)) {
        return 0.8;
    }

    // 简单的字符相似度计算
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1;

    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
        if (longer.includes(shorter[i])) {
            matches++;
        }
    }

    return matches / longer.length;
};

/**
 * 根据AI推荐项确定POI类型
 * @param {Object} item - AI推荐项
 * @returns {string} - POI类型
 */
const determinePoiType = (item) => {
    if (!item) return 'attraction';

    // 根据类型字段判断
    if (item.type) {
        const type = item.type.toLowerCase();
        if (type.includes('restaurant') || type.includes('food') || type.includes('餐') || type.includes('美食')) {
            return 'restaurant';
        }
    }

    // 根据类别字段判断
    if (item.category) {
        const category = item.category.toLowerCase();
        if (category.includes('restaurant') || category.includes('food') || category.includes('餐') || category.includes('美食')) {
            return 'restaurant';
        }
    }

    // 根据名称判断
    if (item.name) {
        const name = item.name.toLowerCase();
        if (name.includes('餐厅') || name.includes('酒店') || name.includes('美食') ||
            name.includes('小吃') || name.includes('菜馆') || name.includes('饭店')) {
            return 'restaurant';
        }
    }

    // 默认为景点
    return 'attraction';
};

/**
 * 根据类型获取默认图片
 * @param {string} type - 类型
 * @returns {string} - 默认图片路径
 */
const getDefaultImageByType = (type) => {
    switch (type) {
        case 'restaurant':
            return '/images/default-restaurant.jpg';
        case 'attraction':
            return '/images/default-attraction.jpg';
        default:
            return '/images/default-poi.jpg';
    }
};

/**
 * 为单个AI推荐地点获取详细信息（用于实时更新）
 * @param {Object} aiRecommendation - AI推荐的地点
 * @param {string} city - 城市名称
 * @returns {Promise<Object>} - 增强后的地点信息
 */
export const enhanceSingleRecommendation = async(aiRecommendation, city) => {
    const enhancedList = await enhanceAiRecommendations([aiRecommendation], city);
    return enhancedList[0] || aiRecommendation;
};

export default {
    searchAndEnhancePoi,
    enhanceAiRecommendations,
    enhanceSingleRecommendation
};