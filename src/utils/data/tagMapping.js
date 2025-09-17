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
    nature: "Nature",
    culture: "Culture",
    relaxation: "Relaxation",
    food: "Food",
    shopping: "Shopping",
    nightlife: "Nightlife",
    adventure: "Adventure",
    photography: "Photography",
    history: "History",
    historical: "Historical",
    art: "Art",
    sports: "Sports",
    family: "Family",
    couple: "Couple",
    solo: "Solo",
    group: "Group",
    luxury: "Luxury",
    budget: "Budget",
    local_life: "Local Life",
    festivals: "Festivals",
    beaches: "Beaches",
    mountains: "Mountains",
    cities: "Cities",
    countryside: "Countryside",
    urban: "Urban",

    // Transport
    public: "Public transport",
    walk: "Walk",
    walking: "Walk",
    bicycle: "Bicycle",
    bike: "Bicycle",
    taxi: "Taxi",
    car: "Car",
    driving: "Driving",
    metro: "Metro",
    bus: "Bus",
    shared: "Ride sharing",
    motorcycle: "Motorcycle",
    train: "Train",
    flight: "Flight",

    // Accommodation
    comfort: "Comfort",
    hotel: "Hotel",
    hostel: "Hostel",
    apartment: "Apartment",
    bnb: "B&B",
    resort: "Resort",
    guesthouse: "Guesthouse",

    // Pace
    slow: "Slow",
    medium: "Medium",
    fast: "Fast",
    relaxed: "Relaxed",
    moderate: "Moderate",
    intensive: "Intensive",
    1: "🐌 Slow",
    2: "🚶 Leisurely",
    3: "⚖️ Balanced",
    4: "🏃 Compact",
    5: "⚡ Fast-paced",

    // Food tastes
    spicy: "Spicy",
    sweet: "Sweet",
    sour: "Sour",
    bitter: "Bitter",
    salty: "Salty",
    light: "Light",
    heavy: "Rich",
    umami: "Umami",

    // Times of day
    morning: "Morning",
    afternoon: "Noon",
    evening: "Night",
    night: "Night",

    // Other prefs
    popularFirst: "Popular first",
    includeFood: "Include food",
    avoidCrowds: "Avoid crowds",
    includeShopping: "Shopping",
    preferPublicTransport: "Prefer public transport",
    includeKidsActivities: "Kids friendly",
    needAccessibility: "Accessibility",
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
    halal: "Halal",
    kosher: "Kosher",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    no_pork: "No Pork",
    no_beef: "No Beef",
    no_seafood: "No Seafood",
    no_spicy: "No Spicy",
    gluten_free: "Gluten-free",
    no_alcohol: "No Alcohol",
    dairy_free: "Dairy-free",
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
export function translateTag(tag, type = "general") {
    if (!tag) return "";

    const isEn = false; // 固定为中文，不再使用英文
    let mapping;
    switch (type) {
        case "focus":
            mapping = focusAreaMapping;
            break;
        case "dietary":
            mapping = isEn ?
                dietaryRestrictionMappingEn :
                dietaryRestrictionMappingZh;
            break;
        case "style":
            mapping = tripStyleMapping;
            break;
        case "intensity":
            mapping = intensityMapping;
            break;
        case "experience":
            mapping = specialExperienceMapping;
            break;
        default:
            mapping = isEn?tagMappingEn : tagMappingZh;
    }

    return mapping[tag] || tag;
}

/**
 * 将数组中的英文标签转换为中文
 * @param {Array} tags - 英文标签数组
 * @param {string} type - 映射类型
 * @returns {Array} 中文标签数组
 */
export function translateTags(tags, type = "general") {
    if (!Array.isArray(tags)) return [];
    return tags.map((tag) => translateTag(tag, type));
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
 * @param {string} adcode - 城市代码
 * @param {string} cityName - 城市名称（优先使用）
 * @returns {string} 城市名称
 */
export function getCityName(adcode, cityName = null) {
    // 优先使用传入的城市名称
    if (cityName) {
        return cityName;
    }

    // 从数据库获取城市名称
    if (adcode && cityInfoDatabase[adcode]) {
        return cityInfoDatabase[adcode].name;
    }

    // 没有找到城市信息，返回城市代码
    return adcode || "未选择";
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
 * @param {string} adcode - 城市代码
 * @returns {object|null} 城市详细信息
 */
export function getCityInfo(adcode) {
    if (!adcode || !cityInfoDatabase[adcode]) {
        return null;
    }
    return cityInfoDatabase[adcode];
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
            info.features.some((f) => f.includes(feature) || feature.includes(f)),
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
        { key: "general", name: "通用标签", mapping: tagMapping },
        { key: "focus", name: "体验重点", mapping: focusAreaMapping },
        { key: "dietary", name: "饮食禁忌", mapping: dietaryRestrictionMapping },
        { key: "style", name: "行程风格", mapping: tripStyleMapping },
        { key: "intensity", name: "活动强度", mapping: intensityMapping },
        { key: "experience", name: "特殊体验", mapping: specialExperienceMapping },
    ];
}

/**
 * 批量翻译标签
 * @param {Array} tags - 标签数组
 * @param {string} type - 映射类型
 * @param {string} separator - 分隔符
 * @returns {string} 翻译后的字符串
 */
export function translateTagsToString(
    tags,
    type = "general",
    separator = "、",
) {
    const translatedTags = translateTags(tags, type);
    return translatedTags.join(separator);
}

// ==============================================
// AI提示词生成系统 - 核心功能
// ==============================================

/**
 * AI提示词精确映射 - 将用户友好的选择转换为AI可理解的详细指导
 */
export const aiPromptMapping = {
    // 性格特征的AI解读
    personalityPrompts: {
        // MBTI类型对应的详细旅行行为描述
        INTJ: {
            shortPrompt: "理性规划型旅行者",
            detailedPrompt: "偏好有逻辑性和效率的行程安排，喜欢深度探索而非走马观花，对历史文化和建筑设计感兴趣，倾向于避开过度拥挤的景点，更愿意花时间在少数精选的高质量体验上。在餐厅选择上偏好有特色和口碑的店铺而非网红店。",
            behaviorPatterns: [
                "喜欢提前规划，不喜欢临时变动",
                "重视体验质量over数量",
                "偏好小众但有深度的景点",
                "对嘈杂环境有一定抗性较低"
            ],
            recommendationStyle: "精选少量高质量景点，留出充足时间深度体验，优先推荐有历史底蕴或设计感的地点"
        },

        ENFP: {
            shortPrompt: "活力社交型旅行者",
            detailedPrompt: "热爱新奇体验和社交互动，喜欢热闹的氛围和多样化的活动，对当地文化和人文风情特别感兴趣，愿意尝试各种新鲜事物包括特色美食，喜欢拍照分享和与当地人交流。",
            behaviorPatterns: [
                "喜欢多样化的体验类型",
                "对社交性强的活动有兴趣",
                "乐于尝试新鲜事物",
                "重视拍照和分享体验"
            ],
            recommendationStyle: "安排丰富多样的活动类型，包含社交互动机会，推荐网红打卡地和当地特色体验"
        },

        ISFP: {
            shortPrompt: "温和体验型旅行者",
            detailedPrompt: "注重个人感受和美学体验，偏好宁静优美的环境，对艺术、自然和手工艺有浓厚兴趣，喜欢慢节奏的深度体验，重视情感连接和个人成长。",
            behaviorPatterns: [
                "偏好安静优美的环境",
                "注重个人感受和情感体验",
                "对艺术和美学敏感",
                "喜欢慢节奏的深度探索"
            ],
            recommendationStyle: "推荐有艺术气息和自然美景的地点，安排充足时间感受和体验，避免过于商业化的景点"
        },

        ESTP: {
            shortPrompt: "冒险行动型旅行者",
            detailedPrompt: "喜欢刺激和新鲜的体验，行动力强，适应性好，偏好户外活动和挑战性项目，对当下的享受很重视，喜欢灵活的行程安排。",
            behaviorPatterns: [
                "喜欢刺激和挑战性活动",
                "行动力强，适应性好",
                "重视当下的享受",
                "偏好灵活的行程安排"
            ],
            recommendationStyle: "安排丰富的户外活动和体验项目，保持行程的灵活性，推荐有挑战性的景点和活动"
        }
        // 其他MBTI类型可以继续扩展...
    },

    // 兴趣标签的AI行为解读
    interestPrompts: {
        nature: {
            userDisplay: "自然风光",
            aiPrompt: "对自然景观有强烈偏好，包括山川、湖泊、公园、植物园等。建议安排至少30%的行程在自然环境中，优先选择视野开阔、空气清新的户外空间。对天气条件较为敏感，需要准备室内备选方案。",
            timeAllocation: "建议占行程30-40%",
            weatherSensitivity: "高度依赖天气条件",
            photographyTips: "推荐日出日落时段的观景点"
        },

        food: {
            userDisplay: "美食体验",
            aiPrompt: "对当地美食文化有浓厚兴趣，愿意为了品尝特色料理而专门安排行程。建议每餐都安排当地特色，包括街头小吃、传统餐厅和现代创意料理。对餐厅环境和食物卖相有一定要求。",
            mealPlanning: "每餐都需要特色推荐",
            budgetImpact: "美食预算可以适当提高",
            culturalAspect: "通过美食了解当地文化"
        },

        photography: {
            userDisplay: "摄影打卡",
            aiPrompt: "对视觉效果和拍照环境要求较高，偏好有设计感、色彩丰富或具有独特视角的场所。行程安排需要考虑最佳拍摄时间（光线条件），并预留足够时间进行摄影创作。",
            timeConsideration: "每个景点需要额外15-30分钟拍摄时间",
            lightingRequirement: "优先考虑光线条件好的时段",
            instagramability: "高度重视视觉效果和分享价值"
        },

        culture: {
            userDisplay: "文化体验",
            aiPrompt: "对历史文化和人文传统有深度兴趣，喜欢了解当地的历史背景、传统工艺和民俗文化。建议安排博物馆、历史遗迹、文化街区等有教育意义的场所。",
            learningAspect: "重视文化知识的获得",
            depthOverQuantity: "偏好深度了解而非走马观花",
            interactionImportance: "喜欢与当地人文化交流"
        }
    },

    // 旅行目的的AI策略解读
    tripPurposePrompts: {
        celebration: {
            userDisplay: "庆祝纪念",
            aiPrompt: "这是一次具有特殊意义的庆祝性旅行，需要营造温馨浪漫的氛围。优先推荐有纪念价值的景点、适合拍照留念的场所，以及能够提供特殊服务（如庆祝套餐、纪念品）的餐厅和酒店。行程节奏应相对轻松，留出享受美好时光的空间。",
            atmosphereRequirement: "温馨浪漫、有纪念价值",
            serviceExpectation: "期望特殊的庆祝服务和关怀",
            pacePreference: "轻松悠闲，不宜过于紧密安排",
            photoImportance: "极高 - 需要大量美好回忆的拍摄机会"
        },

        business: {
            userDisplay: "商务顺游",
            aiPrompt: "商务差旅的间隙游览，时间相对有限且可能存在变动。优先推荐交通便利、时间灵活的景点，避免需要长时间投入的项目。重点关注高效率的经典体验，以及适合商务人士的餐饮和休息场所。",
            timeFlexibility: "高度要求时间灵活性",
            transportationPriority: "交通便利性是首要考虑",
            efficiencyFocus: "追求时间效率，经典必游优先",
            businessFriendly: "适合商务人士的场所和服务"
        },

        family: {
            userDisplay: "家庭亲子游",
            aiPrompt: "多代人共同出行，需要考虑不同年龄层的需求和体力。优先推荐家庭友好的景点，有儿童设施和老人休息区。行程安排要考虑用餐时间、休息频率，避免过于劳累的项目。",
            ageConsideration: "需要照顾不同年龄层需求",
            facilityRequirement: "儿童设施和无障碍设施",
            paceAdjustment: "适当放慢节奏，增加休息时间",
            safetyPriority: "安全性是首要考虑"
        }
    },

    // 限制条件的AI注意事项
    constraintPrompts: {
        hasChildren: {
            userDisplay: "带有小孩",
            aiPrompt: "同行有儿童，所有推荐场所必须考虑儿童友好性。包括：安全的环境、适合儿童的设施、不过长的步行距离、有趣的互动体验。餐厅需要有儿童座椅和适合儿童的菜品。行程安排需要考虑儿童的作息时间和注意力持续时间。",
            safetyRequirement: "高度重视安全性",
            facilityNeeds: "儿童友好设施（洗手间、座椅、活动空间）",
            attentionSpan: "单个景点停留时间不宜过长（建议1-2小时）",
            restNeeds: "需要安排充足的休息时间"
        },

        budgetTight: {
            userDisplay: "预算紧张",
            aiPrompt: "本次旅行预算受限，需要在有限预算内最大化体验价值。优先推荐免费或低价的高质量景点，如公园、免费博物馆、历史街区等。餐饮推荐当地性价比高的特色小吃和平价餐厅。交通建议多使用公共交通工具。",
            priceRange: "优先推荐免费和低价选项",
            valueOriented: "高度重视性价比",
            transportSuggestion: "建议使用公共交通",
            hiddenGems: "挖掘免费但有特色的体验"
        },

        needAccessibility: {
            userDisplay: "需要无障碍设施",
            aiPrompt: "同行人员有无障碍需求，所有推荐必须确保无障碍通道。包括轮椅可达的景点、有电梯的建筑、无障碍洗手间等。避免需要大量步行或爬楼梯的景点。餐厅和住宿也需要无障碍设施。",
            accessRequirement: "必须有无障碍通道和设施",
            transportConsideration: "优先推荐无障碍交通工具",
            venueSelection: "避免需要大量步行的景点",
            facilitySafety: "确保设施的安全性和便利性"
        }
    }
};

/**
 * 生成完整的AI旅行规划提示词
 * @param {Object} userPreferences - 用户偏好设置
 * @param {Object} tripContext - 行程上下文信息
 * @returns {Object} 结构化的AI提示词
 */
export function generateAIPrompt(userPreferences, tripContext) {
    const prompt = {
        // 用户画像总结
        travelerProfile: generateTravelerProfile(userPreferences),

        // 核心需求和约束
        coreRequirements: generateCoreRequirements(userPreferences, tripContext),

        // 详细的偏好指导
        detailedGuidance: generateDetailedGuidance(userPreferences),

        // 特殊注意事项
        specialConsiderations: generateSpecialConsiderations(userPreferences, tripContext),

        // 推荐策略
        recommendationStrategy: generateRecommendationStrategy(userPreferences, tripContext)
    };

    return prompt;
}

/**
 * 生成旅行者画像总结
 */
function generateTravelerProfile(preferences) {
    let profile = [];

    // MBTI性格解读
    if (preferences.mbtiType && aiPromptMapping.personalityPrompts[preferences.mbtiType]) {
        const mbtiPrompt = aiPromptMapping.personalityPrompts[preferences.mbtiType];
        profile.push(`性格特征: ${mbtiPrompt.shortPrompt} - ${mbtiPrompt.detailedPrompt}`);
    }

    // 核心兴趣解读
    if (preferences.selectedTags?.length > 0) {
        const interestDescriptions = preferences.selectedTags.map(interest => {
            const interestPrompt = aiPromptMapping.interestPrompts[interest];
            return interestPrompt?.aiPrompt || `对${translateTag(interest)}有兴趣`;
        });
        profile.push(`核心兴趣: ${interestDescriptions.join('；')}`);
    }

    // 预算和消费水平
    if (preferences.budget) {
        const budgetInfo = budgetMapping[getBudgetLevel(preferences.budget)];
        if (budgetInfo) {
            profile.push(`预算水平: ${budgetInfo.text}(${budgetInfo.price})，需要在此预算范围内提供最优化的体验建议`);
        }
    }

    return profile.join('\n');
}

/**
 * 生成核心需求和约束
 */
function generateCoreRequirements(preferences, tripContext) {
    const requirements = [];

    // 旅行目的的特殊要求
    if (tripContext.tripPurpose && aiPromptMapping.tripPurposePrompts[tripContext.tripPurpose]) {
        const purposePrompt = aiPromptMapping.tripPurposePrompts[tripContext.tripPurpose];
        requirements.push(`旅行目的: ${purposePrompt.aiPrompt}`);
    }

    // 时间和地点约束
    requirements.push(`目的地: ${tripContext.destination || tripContext.destinationName}`);
    requirements.push(`旅行时长: ${tripContext.days || tripContext.duration}天`);

    // 处理日期范围
    let dateInfo = '待定';
    if (tripContext.dateRange && Array.isArray(tripContext.dateRange) && tripContext.dateRange.length === 2) {
        dateInfo = `${tripContext.dateRange[0]} 至 ${tripContext.dateRange[1]}`;
    } else if (tripContext.startDate) {
        dateInfo = tripContext.startDate;
    }
    requirements.push(`出行时间: ${dateInfo}`);

    // 同行人员约束
    if (tripContext.constraints?.length > 0) {
        const companionConstraints = tripContext.constraints.map(constraint => {
            const constraintPrompt = aiPromptMapping.constraintPrompts[constraint];
            return constraintPrompt?.aiPrompt || constraint;
        }).join('；');
        requirements.push(`特殊需求: ${companionConstraints}`);
    }

    return requirements.join('\n');
}

/**
 * 生成详细偏好指导
 */
function generateDetailedGuidance(preferences) {
    const guidance = {
        景点选择: [],
        餐饮安排: [],
        交通方式: [],
        时间分配: [],
        体验重点: []
    };

    // 根据兴趣生成景点选择指导
    if (preferences.selectedTags?.includes('nature')) {
        guidance.景点选择.push("至少30%的行程安排在自然环境中，优先选择视野开阔的户外空间");
        guidance.时间分配.push("自然景点建议安排在光线条件最佳的时段");
    }

    if (preferences.selectedTags?.includes('photography')) {
        guidance.景点选择.push("重视视觉效果和拍照环境，优先选择有设计感或独特视角的场所");
        guidance.时间分配.push("每个景点预留额外15-30分钟拍摄时间");
    }

    if (preferences.selectedTags?.includes('food')) {
        guidance.餐饮安排.push("每餐都安排当地特色，包括街头小吃、传统餐厅和创意料理");
        guidance.体验重点.push("通过美食体验了解当地文化");
    }

    // 根据交通偏好生成交通指导
    if (preferences.selectedTransports?.includes('public')) {
        guidance.交通方式.push("优先使用公共交通，安排景点时考虑地铁/公交可达性");
    } else if (preferences.selectedTransports?.includes('walk')) {
        guidance.交通方式.push("步行友好的路线设计，景点间距离控制在合理范围");
    }

    return Object.entries(guidance)
        .filter(([, items]) => items.length > 0)
        .map(([category, items]) => `${category}: ${items.join('；')}`)
        .join('\n');
}

/**
 * 生成特殊注意事项
 */
function generateSpecialConsiderations(preferences, tripContext) {
    const considerations = [];

    // 饮食禁忌
    if (preferences.dietaryRestrictions?.length > 0) {
        considerations.push(`饮食禁忌: ${preferences.dietaryRestrictions.map(r => translateTag(r, 'dietary')).join('、')}`);
    }

    // 临时饮食限制
    if (tripContext.temporaryDietaryRestrictions?.length > 0) {
        considerations.push(`本次旅行临时饮食限制: ${tripContext.temporaryDietaryRestrictions.join('、')}`);
    }

    // 特殊需求
    if (preferences.needAccessibility) {
        considerations.push("必须考虑无障碍设施和通道");
    }

    if (preferences.includeKidsActivities) {
        considerations.push("需要安排适合儿童的活动和设施");
    }

    return considerations.join('\n');
}

/**
 * 生成推荐策略
 */
function generateRecommendationStrategy(preferences, tripContext) {
    const strategies = [];

    // 基于MBTI的推荐策略
    if (preferences.mbtiType && aiPromptMapping.personalityPrompts[preferences.mbtiType]) {
        const mbtiPrompt = aiPromptMapping.personalityPrompts[preferences.mbtiType];
        strategies.push(`推荐策略: ${mbtiPrompt.recommendationStyle}`);
    }

    // 基于行程目的的策略调整
    if (tripContext.tripPurpose === 'celebration') {
        strategies.push("重点创造温馨难忘的回忆，优先推荐有纪念价值和拍照效果的场所");
    } else if (tripContext.tripPurpose === 'business') {
        strategies.push("以高效便利为原则，推荐交通便利的经典必游景点");
    }

    // 预算策略
    const budgetLevel = getBudgetLevel(preferences.budget);
    if (budgetLevel === 'budget' || tripContext.budgetConstraint) {
        strategies.push("高性价比策略：优先推荐免费或低价的高质量体验，挖掘当地特色的平价选择");
    } else if (budgetLevel === 'luxury') {
        strategies.push("高端体验策略：推荐独特的奢华体验和高端服务，注重服务品质和独特性");
    }

    return strategies.join('\n');
}

/**
 * 生成最终的AI提示词模板
 * @param {Object} userPreferences - 用户偏好
 * @param {Object} tripContext - 行程上下文
 * @returns {string} 完整的AI提示词
 */
export function generateCompletePrompt(userPreferences, tripContext) {
    const promptStructure = generateAIPrompt(userPreferences, tripContext);

    return `# 旅行规划AI助手指令

## 旅行者画像
${promptStructure.travelerProfile}

## 核心需求
${promptStructure.coreRequirements}

## 详细偏好指导
${promptStructure.detailedGuidance}

## 特殊注意事项
${promptStructure.specialConsiderations || '无特殊限制'}

## 推荐策略
${promptStructure.recommendationStrategy}

## 任务要求
请基于以上信息，为这位旅行者规划一份详细的${tripContext.days || tripContext.duration}天${tripContext.destination || tripContext.destinationName}行程，包括：

1. **景点安排**: 根据兴趣偏好和时间分配建议选择景点
2. **餐饮推荐**: 每餐提供符合预算和口味的具体餐厅推荐
3. **交通路线**: 提供具体的交通方式和路线指导
4. **时间安排**: 合理安排每日时间，考虑个人作息和景点特点
5. **预算估算**: 提供详细的费用预估和省钱建议
6. **实用提示**: 根据季节、天气、当地特色提供实用建议

## 输出格式
请按照以下JSON格式输出详细行程：
{
  "summary": "行程概述",
  "daily_plans": [
    {
      "day": 1,
      "theme": "当日主题",
      "schedule": [...],
      "meals": [...],
      "transport": [...],
      "budget": "当日预算",
      "tips": "当日小贴士"
    }
  ],
  "total_budget": "总预算估算",
  "packing_list": "打包建议",
  "emergency_contacts": "紧急联系方式"
}`;
}

/**
 * 根据预算数值获取预算等级
 */
function getBudgetLevel(budget) {
    if (!budget) return 'moderate';

    const budgetNum = parseInt(budget);
    if (budgetNum < 500) return 'budget';
    if (budgetNum < 800) return 'moderate';
    if (budgetNum < 1200) return 'comfort';
    return 'luxury';
}

/**
 * 智能预填功能 - 将用户档案映射到行程偏好
 */
export function mapUserPreferencesToTripDefaults(userPreferences) {
    const defaults = {
        tripGoals: [],
        focusAreas: [],
        pacePreference: 'balanced',
        socialPreference: 'mixed',
        photoPreference: 'casual'
    };

    if (!userPreferences) return defaults;

    // 根据MBTI预设社交偏好
    if (userPreferences.mbtiType) {
        const mbtiType = userPreferences.mbtiType;
        if (mbtiType.startsWith('E')) {
            defaults.socialPreference = 'lively';
        } else if (mbtiType.startsWith('I')) {
            defaults.socialPreference = 'quiet';
        }

        // 根据MBTI预设节奏偏好
        if (mbtiType.includes('J')) {
            defaults.pacePreference = 'balanced';
        } else if (mbtiType.includes('P')) {
            defaults.pacePreference = 'slow';
        }
    }

    // 根据兴趣标签映射体验重点
    if (userPreferences.selectedTags?.length > 0) {
        const tagToFocusMapping = {
            'nature': 'natural_scenery',
            'culture': 'historical_culture',
            'food': 'local_cuisine',
            'photography': 'photo_spots',
            'art': 'art_culture',
            'historical': 'historical_culture',
            'urban': 'urban_lifestyle',
            'relaxation': 'wellness',
            'adventure': 'outdoor_adventure',
            'shopping': 'shopping'
        };

        userPreferences.selectedTags.forEach(tag => {
            const focusArea = tagToFocusMapping[tag];
            if (focusArea && !defaults.focusAreas.includes(focusArea)) {
                defaults.focusAreas.push(focusArea);
            }
        });

        // 如果包含摄影兴趣，提升拍照需求
        if (userPreferences.selectedTags.includes('photography')) {
            defaults.photoPreference = 'essential';
        }
    }

    return defaults;
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
    // 新增的AI提示词功能
    aiPromptMapping,
    generateAIPrompt,
    generateCompletePrompt,
    mapUserPreferencesToTripDefaults,
};