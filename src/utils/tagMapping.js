/**
 * 标签映射工具文件
 * 统一管理所有组件中使用的标签映射关系
 */


// 完整的标签映射表（中文）
export const tagMappingZh = {
    // 旅行类型和兴趣
    nature: "自然风光",
    culture: "文化体验",
    relaxation: "休闲放松",
    food: "美食体验",
    shopping: "购物娱乐",
    nightlife: "夜生活",
    adventure: "冒险体验",
    hiking: "徒步",
    photography: "摄影打卡",
    history: "历史古迹",
    historical: "历史文化",
    art: "艺术文化",
    sports: "运动健身",
    family: "家庭亲子游",
    couple: "情侣出行",
    solo: "独行",
    group: "团体出行",
    luxury: "奢华体验",
    budget: "经济实惠",
    local_life: "体验当地生活",
    festivals: "节庆活动",
    beaches: "海滩度假",
    mountains: "山地风光",
    cities: "城市探索",
    countryside: "乡村体验",
    urban: "都市风情",
    city_life: "都市生活",

    // 交通偏好
    public: "公共交通",
    walk: "步行出行",
    walking: "步行",
    bicycle: "骑行",
    bike: "骑行",
    taxi: "打车出行",
    car: "自驾",
    driving: "自驾",
    metro: "地铁",
    bus: "公交",
    shared: "包车/拼车",
    motorcycle: "摩托车",
    train: "火车",
    flight: "飞机",

    // 住宿类型
    comfort: "舒适便利",
    budget: "经济实惠",
    luxury: "奢华享受",
    hotel: "酒店住宿",
    hostel: "青旅住宿",
    apartment: "公寓民宿",
    bnb: "特色民宿",
    resort: "度假村",
    guesthouse: "客栈",

    // 旅行节奏
    slow: "慢节奏",
    medium: "适中节奏",
    fast: "快节奏",
    relaxed: "轻松休闲",
    moderate: "适中节奏",
    intensive: "紧凑高效",

    // 数字形式的旅行节奏
    1: "🐌 慢悠悠 - 深度体验",
    2: "🚶 悠闲型 - 适度安排",
    3: "⚖️ 平衡型 - 景点与休息并重",
    4: "🏃 紧凑型 - 多看多玩",
    5: "⚡ 暴走型 - 最大化利用时间",

    // 美食偏好
    spicy: "辣味美食",
    sweet: "甜味美食",
    sour: "酸味美食",
    bitter: "苦味美食",
    salty: "咸味美食",
    light: "清淡",
    heavy: "重口味",
    umami: "鲜味",

    // 时间偏好
    morning: "早起型",
    afternoon: "午间型",
    evening: "夜猫子",
    night: "夜间",
    "early-morning": "清晨型",
    "late-night": "深夜型",
    "all-day": "全天型",

    // 其他常见标签
    cultural: "文化探索",
    modern: "现代都市",
    modern_attractions: "现代景点",
    traditional: "传统文化",
    scenic: "风景名胜",
    entertainment: "娱乐休闲",
    wellness: "健康养生",
    local_culture: "风土人情",
    urban_life: "都市风情",
    local_cuisine: "地道美食",

    // 其他偏好选项
    popularFirst: "优先热门景点",
    includeFood: "包含美食推荐",
    avoidCrowds: "避开人群",
    includeShopping: "包含购物",
    preferPublicTransport: "偏好公共交通",
    includeKidsActivities: "包含亲子活动",
    needAccessibility: "需要无障碍设施",
};

// 英文标签映射（仅覆盖常用项，缺失时回退为原键名）
export const tagMappingEn = {
    // Travel types & interests
    nature: 'Nature',
    culture: 'Culture',
    relaxation: 'Relaxation',
    food: 'Food',
    shopping: 'Shopping',
    nightlife: 'Nightlife',
    adventure: 'Adventure',
    photography: 'Photography',
    history: 'History',
    historical: 'Historical',
    art: 'Art',
    sports: 'Sports',
    family: 'Family',
    couple: 'Couple',
    solo: 'Solo',
    group: 'Group',
    luxury: 'Luxury',
    budget: 'Budget',
    local_life: 'Local Life',
    festivals: 'Festivals',
    beaches: 'Beaches',
    mountains: 'Mountains',
    cities: 'Cities',
    countryside: 'Countryside',
    urban: 'Urban',

    // Transport
    public: 'Public transport',
    walk: 'Walk',
    walking: 'Walk',
    bicycle: 'Bicycle',
    bike: 'Bicycle',
    taxi: 'Taxi',
    car: 'Car',
    driving: 'Driving',
    metro: 'Metro',
    bus: 'Bus',
    shared: 'Ride sharing',
    motorcycle: 'Motorcycle',
    train: 'Train',
    flight: 'Flight',

    // Accommodation
    comfort: 'Comfort',
    hotel: 'Hotel',
    hostel: 'Hostel',
    apartment: 'Apartment',
    bnb: 'B&B',
    resort: 'Resort',
    guesthouse: 'Guesthouse',

    // Pace
    slow: 'Slow',
    medium: 'Medium',
    fast: 'Fast',
    relaxed: 'Relaxed',
    moderate: 'Moderate',
    intensive: 'Intensive',
    1: '🐌 Slow',
    2: '🚶 Leisurely',
    3: '⚖️ Balanced',
    4: '🏃 Compact',
    5: '⚡ Fast-paced',

    // Food tastes
    spicy: 'Spicy',
    sweet: 'Sweet',
    sour: 'Sour',
    bitter: 'Bitter',
    salty: 'Salty',
    light: 'Light',
    heavy: 'Rich',
    umami: 'Umami',

    // Times of day
    morning: 'Morning',
    afternoon: 'Noon',
    evening: 'Night',
    night: 'Night',

    // Other prefs
    popularFirst: 'Popular first',
    includeFood: 'Include food',
    avoidCrowds: 'Avoid crowds',
    includeShopping: 'Shopping',
    preferPublicTransport: 'Prefer public transport',
    includeKidsActivities: 'Kids friendly',
    needAccessibility: 'Accessibility',
};

// 体验重点映射
export const focusAreaMapping = {
    // 文化体验类
    historical_culture: "历史文化",
    historical: "历史文化",
    art_culture: "艺术文化",
    art: "艺术博物",
    local_culture: "风土人情",
    traditional_crafts: "传统工艺",
    religious_sites: "宗教文化",
    local_festivals: "节庆活动",

    // 自然风光类
    natural_scenery: "自然风光",
    nature: "自然风光",
    mountain: "山地风光",
    mountains: "山地风光",
    viewpoint: "观景台/观景点",
    outdoor_adventure: "户外探险",

    // 美食体验类
    local_cuisine: "地道美食",
    food_experience: "美食体验",
    food: "美食体验",
    market: "市集/集市",
    cafe: "咖啡馆",

    // 都市生活类
    urban_lifestyle: "都市生活",
    urban_life: "都市风情",
    city_life: "都市生活",
    urban: "都市风情",
    modern_technology: "现代科技",
    modern_attractions: "现代景点",
    nightlife: "夜生活",

    // 休闲娱乐类
    shopping: "购物休闲",
    entertainment: "娱乐活动",
    sports: "体育运动",
    leisure_entertainment: "休闲娱乐",
    photo_spots: "网红打卡",

    // 乡村体验类
    rural_life: "乡村风光",

    // 健康养生类
    wellness: "健康养生",

    // 文化体验补充
    culture: "文化体验",
    landmark: "地标景点",
};

// 饮食禁忌映射
export const dietaryRestrictionMappingZh = {
    // 宗教饮食
    halal: "清真饮食",
    kosher: "犹太洁食",

    // 素食类型
    vegetarian: "素食主义",
    vegan: "纯素食",

    // 肉类禁忌
    no_pork: "不吃猪肉",
    no_beef: "不吃牛肉",
    no_seafood: "不吃海鲜",

    // 口味禁忌
    no_spicy: "不吃辣",

    // 健康饮食
    gluten_free: "无麸质",
    no_alcohol: "不饮酒",
    dairy_free: "无乳制品",
};

export const dietaryRestrictionMappingEn = {
    halal: 'Halal',
    kosher: 'Kosher',
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    no_pork: 'No Pork',
    no_beef: 'No Beef',
    no_seafood: 'No Seafood',
    no_spicy: 'No Spicy',
    gluten_free: 'Gluten-free',
    no_alcohol: 'No Alcohol',
    dairy_free: 'Dairy-free',
};

// 行程风格映射
export const tripStyleMapping = {
    relaxed: "放松休闲型",
    cultural: "文化体验型",
    adventure: "探险刺激型",
    foodie: "美食享受型",
    shopping: "购物休闲型",
    nature: "自然探索型",
    balanced: "均衡体验型",
    exploration: "深度探索型",
};

// 活动强度映射
export const intensityMapping = {
    relaxed: "轻松舒适",
    moderate: "适中平衡",
    intensive: "充实紧凑",
};

// 特殊体验映射
export const specialExperienceMapping = {
    local_events: "当地节庆活动",
    workshops: "传统工艺体验",
    performances: "文化表演",
    hidden_gems: "小众景点",
    night_activities: "夜间活动",
};

// 预算映射
export const budgetMapping = {
    budget: { text: "经济实惠", price: "约400元/天" },
    moderate: { text: "适中舒适", price: "约750元/天" },
    comfort: { text: "舒适便利", price: "约1000元/天" },
    luxury: { text: "豪华奢华", price: "约1500元/天" },
};


// 工具函数

/**
 * 将英文标签转换为中文
 * @param {string|number} tag - 英文标签
 * @param {string} type - 映射类型 ('general', 'focus', 'dietary', 'style', 'intensity', 'experience')
 * @returns {string} 中文标签
 */
export function translateTag(tag, type = 'general') {
    if (!tag) return '';

    const isEn = getLocale && getLocale() === 'en-US';
    let mapping;
    switch (type) {
        case 'focus':
            mapping = focusAreaMapping;
            break;
        case 'dietary':
            mapping = isEn ? dietaryRestrictionMappingEn : dietaryRestrictionMappingZh;
            break;
        case 'style':
            mapping = tripStyleMapping;
            break;
        case 'intensity':
            mapping = intensityMapping;
            break;
        case 'experience':
            mapping = specialExperienceMapping;
            break;
        default:
            mapping = isEn ? tagMappingEn : tagMappingZh;
    }

    return mapping[tag] || tag;
}

/**
 * 将数组中的英文标签转换为中文
 * @param {Array} tags - 英文标签数组
 * @param {string} type - 映射类型
 * @returns {Array} 中文标签数组
 */
export function translateTags(tags, type = 'general') {
    if (!Array.isArray(tags)) return [];
    return tags.map(tag => translateTag(tag, type));
}

/**
 * 获取预算文本
 * @param {string} budgetType - 预算类型
 * @returns {string} 预算文本
 */
export function getBudgetText(budgetType) {
    const option = budgetMapping[budgetType];
    if (!option) return "";
    return `${option.text}(${option.price})`;
}

/**
 * 获取城市名称
 * @param {string} cityCode - 城市代码
 * @param {string} cityName - 城市名称（优先使用）
 * @returns {string} 城市名称
 */
export function getCityName(cityCode, cityName = null) {
    // 优先使用传入的城市名称
    if (cityName) {
        return cityName;
    }

    // 从数据库获取城市名称
    if (cityCode && cityInfoDatabase[cityCode]) {
        return cityInfoDatabase[cityCode].name;
    }

    // 没有找到城市信息，返回城市代码
    return cityCode || "未选择";
}

/**
 * 获取MBTI名称
 * @param {string} type - MBTI类型
 * @returns {string} MBTI中文名称
 */
export function getMbtiName(type) {
    const mbtiMapping = {
        INTJ: "建筑师",
        INTP: "逻辑学家",
        ENTJ: "指挥官",
        ENTP: "辩论家",
        INFJ: "提倡者",
        INFP: "调停者",
        ENFJ: "主人公",
        ENFP: "活动家",
        ISTJ: "物流师",
        ISFJ: "守护者",
        ESTJ: "总经理",
        ESFJ: "执政官",
        ISTP: "鉴赏家",
        ISFP: "探险家",
        ESTP: "企业家",
        ESFP: "娱乐家",
    };

    return mbtiMapping[type] || "未知";
}

/**
 * 获取MBTI性格的旅行偏好描述
 * @param {string} type - MBTI类型
 * @returns {string} 旅行偏好描述
 */
export function getMbtiTravelDescription(type) {
    const descriptions = {
        INTJ: "您喜欢规划和设计，追求效率和逻辑性。您可能偏爱探索城市的历史遗迹、现代建筑或科技景点。",
        INTP: "您思维敏捷，喜欢独立思考和探索新事物。您可能对自然风光、艺术展览或文化交流感兴趣。",
        ENTJ: "您具有领导力和决断力，喜欢挑战和竞争。您可能偏爱极限运动、探险或城市中的热门景点。",
        ENTP: "您充满好奇心，喜欢辩论和交流。您可能对文化体验、美食探索或城市中的新奇事物感兴趣。",
        INFJ: "您富有同情心和洞察力，喜欢帮助他人。您可能偏爱文化交流、艺术体验或自然风光。",
        INFP: "您敏感且富有创造力，喜欢探索内心世界。您可能偏爱文艺体验、特色民宿或宁静的自然环境。",
        ENFJ: "您富有爱心和责任感，喜欢社交和团队合作。您可能偏爱亲子活动、文化交流或城市中的热门景点。",
        ENFP: "您充满活力和热情，喜欢参与和体验。您可能偏爱极限运动、美食探索或城市中的新奇事物。",
        ISTJ: "您注重细节和秩序，喜欢规划和组织。您可能偏爱历史古迹、自然风光或城市中的文化景点。",
        ISFJ: "您富有同情心和责任感，喜欢照顾他人。您可能偏爱住宿便利、美食推荐或城市中的温馨体验。",
        ESTJ: "您具有领导力和决断力，喜欢规划和组织。您可能偏爱商务旅行、极限运动或城市中的热门景点。",
        ESFJ: "您富有爱心和责任感，喜欢社交和团队合作。您可能偏爱住宿便利、美食推荐或城市中的温馨体验。",
        ISTP: "您喜欢独立行动和探索，喜欢速度和刺激。您可能偏爱极限运动、自驾游或城市中的新奇体验。",
        ISFP: "您富有同情心和创造力，喜欢探索和体验。您可能偏爱特色民宿、美食探索或城市中的宁静环境。",
        ESTP: "您充满活力和热情，喜欢速度和刺激。您可能偏爱极限运动、自驾游或城市中的新奇体验。",
        ESFP: "您富有同情心和创造力，喜欢探索和体验。您可能偏爱特色民宿、美食探索或城市中的宁静环境。",
    };

    return descriptions[type] || "您的旅行偏好将基于您的MBTI类型和预算来定制。";
}

/**
 * 获取城市详细信息
 * @param {string} cityCode - 城市代码
 * @returns {object|null} 城市详细信息
 */
export function getCityInfo(cityCode) {
    if (!cityCode || !cityInfoDatabase[cityCode]) {
        return null;
    }
    return cityInfoDatabase[cityCode];
}

/**
 * 根据地区获取城市列表
 * @param {string} region - 地区名称
 * @returns {Array} 该地区的城市列表
 */
export function getCitiesByRegion(region) {
    return Object.entries(cityInfoDatabase)
        .filter(([, info]) => info.region === region)
        .map(([code, info]) => ({
            code,
            name: info.name,
            description: info.description,
            features: info.features,
        }));
}

/**
 * 根据特征搜索城市
 * @param {string} feature - 特征关键词
 * @returns {Array} 包含该特征的城市列表
 */
export function searchCitiesByFeature(feature) {
    return Object.entries(cityInfoDatabase)
        .filter(([, info]) =>
            info.features.some(f => f.includes(feature) || feature.includes(f))
        )
        .map(([code, info]) => ({
            code,
            name: info.name,
            description: info.description,
            features: info.features,
        }));
}

/**
 * 获取所有可用的映射类型
 * @returns {Array} 映射类型列表
 */
export function getMappingTypes() {
    return [
        { key: 'general', name: '通用标签', mapping: tagMapping },
        { key: 'focus', name: '体验重点', mapping: focusAreaMapping },
        { key: 'dietary', name: '饮食禁忌', mapping: dietaryRestrictionMapping },
        { key: 'style', name: '行程风格', mapping: tripStyleMapping },
        { key: 'intensity', name: '活动强度', mapping: intensityMapping },
        { key: 'experience', name: '特殊体验', mapping: specialExperienceMapping },
    ];
}

/**
 * 批量翻译标签
 * @param {Array} tags - 标签数组
 * @param {string} type - 映射类型
 * @param {string} separator - 分隔符
 * @returns {string} 翻译后的字符串
 */
export function translateTagsToString(tags, type = 'general', separator = '、') {
    const translatedTags = translateTags(tags, type);
    return translatedTags.join(separator);
}

export default {
    tagMappingZh,
    tagMappingEn,
    focusAreaMapping,
    dietaryRestrictionMappingZh,
    dietaryRestrictionMappingEn,
    tripStyleMapping,
    intensityMapping,
    specialExperienceMapping,
    budgetMapping,
    translateTag,
    translateTags,
    translateTagsToString,
    getBudgetText,
    getCityName,
    getCityInfo,
    getCitiesByRegion,
    searchCitiesByFeature,
    getMappingTypes,
    getMbtiName,
    getMbtiTravelDescription,
};