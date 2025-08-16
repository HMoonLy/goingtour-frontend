/**
 * 城市代码工具函数
 * 用于在城市数据中查找对应的adcode和citycode
 */

let cityData = null;

/**
 * 异步加载城市数据
 */
async function loadCityData() {
    if (cityData) return cityData;

    try {
        const response = await fetch('/data/city-codes.json');
        cityData = await response.json();
        return cityData;
    } catch (error) {
        console.error('加载城市数据失败:', error);
        return [];
    }
}

/**
 * 根据城市名称查找城市信息
 * @param {string} cityName - 城市名称
 * @returns {Object|null} 城市信息 {中文名, adcode, citycode}
 */
export async function findCityByName(cityName) {
    const cities = await loadCityData();

    // 移除城市名称中的"市"、"区"、"县"等后缀进行匹配
    const cleanCityName = cityName.replace(/[市区县]/g, '');

    // 首先精确匹配
    let city = cities.find(c => c.中文名 === cityName);

    // 如果没找到，尝试部分匹配
    if (!city) {
        city = cities.find(c =>
            c.中文名.includes(cleanCityName) ||
            cleanCityName.includes(c.中文名.replace(/[市区县]/g, ''))
        );
    }

    // 如果还没找到，尝试更宽松的匹配（针对特殊情况）
    if (!city) {
        city = cities.find(c => {
            const cleanDbName = c.中文名.replace(/[市区县]/g, '');
            return cleanDbName === cleanCityName ||
                cleanCityName.startsWith(cleanDbName) ||
                cleanDbName.startsWith(cleanCityName);
        });
    }

    if (city) {
        return {
            cityName: city.中文名,
            adcode: String(city.adcode),
            citycode: city.citycode === '\\N'?null : city.citycode
        };
    }

    console.warn(`未找到城市 "${cityName}" 的对应数据`);
    return null;
}

/**
 * 根据adcode查找城市信息
 * @param {string|number} adcode - 行政区划代码
 * @returns {Object|null} 城市信息
 */
export async function findCityByAdcode(adcode) {
    const cities = await loadCityData();
    const city = cities.find(c => String(c.adcode) === String(adcode));

    if (city) {
        return {
            cityName: city.中文名,
            adcode: String(city.adcode),
            citycode: city.citycode === '\\N'?null : city.citycode
        };
    }

    console.warn(`未找到adcode "${adcode}" 的对应城市`);
    return null;
}

/**
 * 批量查找城市信息（用于处理现有数据）
 * @param {Array} cities - 城市列表，每项包含cityName或adcode
 * @returns {Array} 增强后的城市列表
 */
export async function enhanceCitiesWithCodes(cities) {
    const results = [];

    for (const city of cities) {
        let cityInfo = null;

        // 优先使用adcode查找
        if (city.adcode) {
            cityInfo = await findCityByAdcode(city.adcode);
        }

        // 如果adcode查找失败，使用城市名称查找
        if (!cityInfo && city.cityName) {
            cityInfo = await findCityByName(city.cityName);
        }

        // 合并原始数据和查找到的数据
        results.push({
            ...city,
            ...(cityInfo || {}),
            // 保持原有的必要字段
            cityName: city.cityName || cityInfo?.cityName,
            adcode: city.adcode || cityInfo?.adcode,
            citycode: city.citycode || cityInfo?.citycode
        });
    }

    return results;
}

/**
 * 验证城市数据完整性
 * @param {Object} cityData - 城市数据
 * @returns {boolean} 是否完整
 */
export function validateCityData(cityData) {
    return !!(cityData && cityData.cityName && cityData.adcode);
}