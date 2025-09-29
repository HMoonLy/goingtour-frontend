/**
 * 🚨 标签映射工具文件 - 逐步废弃中
 * 
 * ⚠️ 重要通知：
 * - 标签翻译功能已迁移到 travelDataSystem.js 的统一翻译系统
 * - 本文件保留用于向后兼容和特殊功能（如城市名称、预算文本）
 * - 新代码请使用 travelDataSystem.js 中的 translateTag() 等函数
 * 
 * 📋 迁移状态：
 * ✅ 通用标签翻译 - 已迁移到 travelDataSystem.js
 * ✅ AI相关功能 - 已迁移到 aiPromptEngine.js  
 * 🔄 城市名称映射 - 保留（特殊功能）
 * 🔄 预算文本获取 - 保留（特殊功能）
 * 
 * 📖 新的使用方式：
 * import { translateTag, translateTags } from '@/utils/data/travelDataSystem.js';
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
    plane: "飞机",
    boat: "轮船",

    // 住宿偏好
    hotel: "酒店",
    hostel: "青年旅社",
    bnb: "民宿",
    resort: "度假村",
    camping: "露营",
    apartment: "公寓",

    // 餐饮偏好
    local_cuisine: "当地特色",
    street_food: "街头小吃",
    fine_dining: "高端餐厅",
    vegetarian: "素食",
    halal: "清真",
    spicy: "辛辣",
    mild: "清淡",
    seafood: "海鲜",
    barbecue: "烧烤",
    desserts: "甜品",

    // 活动偏好
    museums: "博物馆",
    temples: "寺庙古刹",
    parks: "公园",
    markets: "集市",
    festivals_events: "节庆活动",
    concerts: "音乐会",
    theater: "戏剧表演",
    exhibitions: "展览",
    workshops: "手工体验",
    tours: "导览游",

    // 时间偏好
    morning: "早晨",
    afternoon: "下午",
    evening: "傍晚",
    night: "夜晚",
    weekend: "周末",
    weekday: "工作日",

    // 季节偏好
    spring: "春季",
    summer: "夏季",
    autumn: "秋季",
    winter: "冬季",

    // 预算等级
    low: "经济型",
    medium: "中等",
    high: "高端",
    luxury_budget: "奢华"
};

// 英文标签映射表
export const tagMappingEn = {
    nature: "Nature & Scenery",
    culture: "Cultural Experience",
    relaxation: "Relaxation",
    food: "Food Experience",
    shopping: "Shopping & Entertainment",
    nightlife: "Nightlife",
    adventure: "Adventure",
    hiking: "Hiking",
    photography: "Photography",
    history: "Historical Sites",
    historical: "Historical Culture",
    art: "Art & Culture",
    sports: "Sports & Fitness",
    family: "Family Travel",
    couple: "Couple Travel",
    solo: "Solo Travel",
    group: "Group Travel",
    luxury: "Luxury Experience",
    budget: "Budget-friendly",
    local_life: "Local Life Experience",
    festivals: "Festivals & Events",
    beaches: "Beach Vacation",
    mountains: "Mountain Scenery",
    cities: "City Exploration",
    countryside: "Countryside Experience",
    urban: "Urban Lifestyle",
    city_life: "City Life"
};

// 焦点区域映射
export const focusAreaMapping = {
    attractions: "景点推荐",
    restaurants: "餐厅推荐",
    hotels: "住宿推荐",
    transportation: "交通建议",
    activities: "活动安排",
    shopping: "购物指南",
    nightlife: "夜生活",
    culture: "文化体验",
    nature: "自然风光",
    local_tips: "当地贴士",
    safety: "安全提醒",
    weather: "天气建议",
    budget: "预算规划",
    itinerary: "行程安排",
    photography: "拍照建议",
    food_guide: "美食指南",
    seasonal: "季节性推荐",
    accessibility: "无障碍信息",
    family_friendly: "亲子友好",
    romantic: "浪漫推荐",
    adventure: "冒险活动",
    relaxation: "休闲放松",
    festivals: "节庆活动",
    history: "历史文化",
    art: "艺术文化",
    sports: "运动健身",
    wellness: "健康养生",
    education: "教育体验",
    volunteering: "志愿服务",
    business: "商务差旅",
    medical: "医疗旅游",
    spiritual: "精神修行",
    eco_tourism: "生态旅游",
    luxury: "奢华体验",
    backpacking: "背包客",
    road_trip: "自驾游",
    cruise: "邮轮旅行",
    camping: "露营体验",
    urban: "都市探索",
    rural: "乡村体验",
    coastal: "海岸风光",
    mountain: "山地体验",
    desert: "沙漠探险",
    forest: "森林探索",
    island: "岛屿度假",
    lake: "湖泊风光",
    river: "河流体验",
    hot_springs: "温泉体验",
    ski: "滑雪运动",
    beach: "海滩度假",
    diving: "潜水体验",
    hiking: "徒步旅行",
    cycling: "骑行体验"
};

// 饮食限制映射（中文）
export const dietaryRestrictionMappingZh = {
    vegetarian: "素食主义",
    vegan: "严格素食",
    halal: "清真饮食",
    kosher: "犹太洁食",
    gluten_free: "无麸质",
    dairy_free: "无乳制品",
    nut_free: "无坚果",
    seafood_allergy: "海鲜过敏",
    spicy_intolerant: "不能吃辣",
    low_sodium: "低钠饮食",
    diabetic: "糖尿病饮食",
    lactose_intolerant: "乳糖不耐",
    shellfish_allergy: "贝类过敏",
    egg_allergy: "鸡蛋过敏",
    soy_allergy: "大豆过敏",
    no_pork: "不吃猪肉",
    no_beef: "不吃牛肉",
    no_alcohol: "不饮酒",
    raw_food_only: "只吃生食",
    cooked_food_only: "只吃熟食"
};

// 饮食限制映射（英文）
export const dietaryRestrictionMappingEn = {
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    halal: "Halal",
    kosher: "Kosher",
    gluten_free: "Gluten-free",
    dairy_free: "Dairy-free",
    nut_free: "Nut-free",
    seafood_allergy: "Seafood Allergy",
    spicy_intolerant: "Cannot eat spicy food",
    low_sodium: "Low sodium diet",
    diabetic: "Diabetic diet",
    lactose_intolerant: "Lactose intolerant"
};

// 旅行风格映射
export const tripStyleMapping = {
    slow: "慢节奏深度游",
    fast: "快节奏打卡游",
    balanced: "平衡节奏",
    flexible: "灵活安排",
    structured: "结构化行程",
    spontaneous: "随性而为"
};

// 强度等级映射
export const intensityMapping = {
    low: "轻松休闲",
    medium: "适中强度",
    high: "高强度体验"
};

// 特殊体验映射
export const specialExperienceMapping = {
    sunrise: "日出体验",
    sunset: "日落体验",
    night_market: "夜市体验",
    local_festival: "当地节庆",
    cooking_class: "烹饪课程",
    art_workshop: "艺术工坊"
};

// 预算映射
export const budgetMapping = {
    budget: {
        text: "经济型",
        price: "100-300元/天",
        description: "注重性价比，选择经济实惠的选项"
    },
    mid_range: {
        text: "中等消费",
        price: "300-800元/天",
        description: "平衡价格与品质，追求舒适体验"
    },
    luxury: {
        text: "高端奢华",
        price: "800元以上/天",
        description: "追求高品质服务和独特体验"
    }
};

/**
 * 🚨 已废弃：翻译单个标签
 * @deprecated 请使用 travelDataSystem.js 中的 translateTag() 函数
 * @param {string} tag - 要翻译的标签
 * @param {string} type - 标签类型 (general, dietary, etc.)
 * @returns {string} 翻译后的标签
 */
export function translateTag(tag, type = "general") {
    console.warn('⚠️  translateTag() from tagMapping.js is deprecated. Use travelDataSystem.js instead.');
    console.warn('📖 Migration: import { translateTag } from "@/utils/data/travelDataSystem.js"');
    if (!tag) return "";

    switch (type) {
        case "dietary":
            return dietaryRestrictionMappingZh[tag] || tag;
        case "focus":
            return focusAreaMapping[tag] || tag;
        case "style":
            return tripStyleMapping[tag] || tag;
        case "intensity":
            return intensityMapping[tag] || tag;
        case "special":
            return specialExperienceMapping[tag] || tag;
        case "budget":
            return budgetMapping[tag] ? .text || tag;
        default:
            return tagMappingZh[tag] || tag;
    }
}

/**
 * 🚨 已废弃：翻译标签数组
 * @deprecated 请使用 travelDataSystem.js 中的 translateTags() 函数
 * @param {Array} tags - 标签数组
 * @param {string} type - 标签类型
 * @returns {Array} 翻译后的标签数组
 */
export function translateTags(tags, type = "general") {
    console.warn('⚠️  translateTags() from tagMapping.js is deprecated. Use travelDataSystem.js instead.');
    console.warn('📖 Migration: import { translateTags } from "@/utils/data/travelDataSystem.js"');
    if (!Array.isArray(tags)) return [];
    return tags.map((tag) => translateTag(tag, type));
}

/**
 * 获取预算文本
 * @param {string} budgetType - 预算类型
 * @returns {string} 预算描述
 */
export function getBudgetText(budgetType) {
    const budget = budgetMapping[budgetType];
    return budget ? `${budget.text}(${budget.price})` : budgetType;
}

/**
 * 获取城市名称
 * @param {string} adcode - 城市代码
 * @param {string} cityName - 城市名称（备选）
 * @returns {string} 城市名称
 */
export function getCityName(adcode, cityName = null) {
    // 这里应该有城市代码到名称的映射
    // 暂时返回传入的城市名称或代码
    return cityName || adcode;
}

/**
 * 获取MBTI名称 - 迁移到aiPromptEngine.js
 * @deprecated 请使用 aiPromptEngine.js 中的 getMbtiName
 */
export function getMbtiName(type) {
    console.warn('getMbtiName 已迁移到 aiPromptEngine.js，请更新引用');
    const mbtiNames = {
        INTJ: "建筑师",
        INTP: "逻辑学家",
        ENTJ: "指挥官",
        ENTP: "辩论家",
        INFJ: "提倡者",
        INFP: "调停者",
        ENFJ: "主人公",
        ENFP: "竞选者",
        ISTJ: "物流师",
        ISFJ: "守护者",
        ESTJ: "总经理",
        ESFJ: "执政官",
        ISTP: "鉴赏家",
        ISFP: "探险家",
        ESTP: "企业家",
        ESFP: "娱乐家"
    };
    return mbtiNames[type] || type;
}

/**
 * 获取MBTI性格的旅行偏好描述 - 迁移到aiPromptEngine.js
 * @deprecated 请使用 aiPromptEngine.js 中的 getMbtiTravelDescription
 */
export function getMbtiTravelDescription(type) {
    console.warn('getMbtiTravelDescription 已迁移到 aiPromptEngine.js，请更新引用');
    const descriptions = {
        INTJ: "理性规划，深度体验 - 偏好精心规划的深度游，避开拥挤景点，喜欢探索有历史底蕴和设计感的地点",
        INTP: "独立思考，探索新知 - 思维敏捷，喜欢独立思考和探索新事物，对文化交流和艺术展览感兴趣",
        ENTJ: "领导决断，挑战竞争 - 具有领导力和决断力，喜欢挑战和竞争，偏爱极限运动和热门景点",
        ENTP: "充满好奇，喜欢交流 - 充满好奇心，喜欢交流，对文化体验、美食探索和新奇事物感兴趣"
    };
    return descriptions[type] || "您的旅行偏好将基于您的MBTI类型和预算来定制。";
}

/**
 * 🚨 已废弃：将标签数组转换为字符串
 * @deprecated 请使用 travelDataSystem.js 中的 translateTagsToString() 函数
 * @param {Array} tags - 标签数组
 * @param {string} type - 标签类型
 * @returns {string} 翻译后的标签字符串
 */
export function translateTagsToString(tags, type = "general") {
    console.warn('⚠️  translateTagsToString() from tagMapping.js is deprecated. Use travelDataSystem.js instead.');
    console.warn('📖 Migration: import { translateTagsToString } from "@/utils/data/travelDataSystem.js"');
    if (!Array.isArray(tags) || tags.length === 0) return "";

    const translatedTags = translateTags(tags, type);
    return translatedTags.join('、');
}

/**
 * 获取映射类型列表
 * @returns {Array} 可用的映射类型
 */
export function getMappingTypes() {
    return [
        'general',
        'dietary',
        'focus',
        'style',
        'intensity',
        'special',
        'budget'
    ];
}

export default {
    // 🔄 保留的映射表（向后兼容）
    tagMappingZh,
    tagMappingEn,
    focusAreaMapping,
    dietaryRestrictionMappingZh,
    dietaryRestrictionMappingEn,
    tripStyleMapping,
    intensityMapping,
    specialExperienceMapping,
    budgetMapping,

    // 🚨 已废弃的翻译函数（将在未来版本中移除）
    translateTag, // ⚠️ 使用 travelDataSystem.js
    translateTags, // ⚠️ 使用 travelDataSystem.js
    translateTagsToString, // ⚠️ 使用 travelDataSystem.js

    // 🔄 保留的特殊功能
    getBudgetText, // ✅ 预算文本获取
    getCityName, // ✅ 城市名称映射
    getMbtiName, // ✅ MBTI名称获取
    getMbtiTravelDescription, // ✅ MBTI旅行描述
    getMappingTypes // ✅ 映射类型列表
};