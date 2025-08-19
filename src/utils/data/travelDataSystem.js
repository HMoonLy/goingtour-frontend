/**
 * 🌟 GoingTour 旅行偏好管理系统 - 全新清晰架构
 * 
 * 📋 系统设计目标：
 * 1. 用户友好 - 让用户清楚每个设置的用途和影响
 * 2. 数据分层 - 个人档案 vs 行程偏好的明确分离  
 * 3. AI精确 - 将简单选择转换为详细AI指导
 * 4. 智能继承 - 个人档案自动影响行程推荐
 * 
 * 🏗️ 架构说明：
 * - PersonalProfile: 一次设置，终身受益的个人旅行档案
 * - TripPreferences: 每次旅行可调整的具体偏好
 * - AIPromptEngine: 将用户友好选择转换为AI理解的详细指导
 */

// ==============================================
// 📊 核心数据定义 - 用户友好的选项展示
// ==============================================

/**
 * 🎯 个人旅行档案 - 一次设置，终身受益
 * 这些是描述您旅行风格的基础信息，设置一次后会智能影响所有未来的行程推荐
 */
export const PERSONAL_PROFILE_OPTIONS = {
    // 性格特征 - 影响旅行风格和节奏偏好
    mbtiTypes: {
        title: "您的性格类型 (MBTI)",
        description: "帮助我们理解您的旅行风格和偏好节奏",
        options: {
            INTJ: {
                name: "建筑师",
                description: "理性规划，深度体验",
                travelStyle: "偏好精心规划的深度游，避开拥挤景点"
            },
            ENFP: {
                name: "活动家",
                description: "活力四射，多样体验",
                travelStyle: "喜欢丰富多彩的行程，乐于社交互动"
            },
            ISFP: {
                name: "探险家",
                description: "温和体验，艺术美学",
                travelStyle: "偏好宁静优美环境，注重情感体验"
            },
            ESTP: {
                name: "企业家",
                description: "冒险刺激，灵活自由",
                travelStyle: "喜欢刺激活动，适应性强，行程灵活"
            },
            INTP: {
                name: "逻辑学家",
                description: "独立思考，探索新知",
                travelStyle: "喜欢独立探索，对新事物和文化交流感兴趣"
            },
            ENTJ: {
                name: "指挥官",
                description: "领导决断，挑战竞争",
                travelStyle: "喜欢挑战和冒险，偏爱热门景点和极限运动"
            }
        }
    },

    // 核心兴趣爱好 - 影响景点类型推荐
    coreInterests: {
        title: "您的核心兴趣爱好",
        description: "选择您平时最感兴趣的领域，我们会在每次行程中优先推荐相关体验",
        maxSelections: 5,
        options: {
            nature: {
                name: "自然风光",
                icon: "🌿",
                description: "山川湖海、公园植物园等自然环境",
                aiImpact: "会优先安排30%以上的自然景观，考虑天气因素"
            },
            culture: {
                name: "文化体验",
                icon: "🏛️",
                description: "历史古迹、博物馆、传统文化",
                aiImpact: "会深入安排文化景点，包含历史背景介绍"
            },
            food: {
                name: "美食探索",
                icon: "🍜",
                description: "当地美食、特色餐厅、街头小吃",
                aiImpact: "每餐都会推荐当地特色，提高美食预算比例"
            },
            photography: {
                name: "摄影打卡",
                icon: "📸",
                description: "网红景点、拍照圣地、视觉效果",
                aiImpact: "会考虑光线条件，每个景点预留拍摄时间"
            },
            art: {
                name: "艺术体验",
                icon: "🎨",
                description: "艺术展览、创意街区、设计空间",
                aiImpact: "会推荐艺术类场馆和有设计感的空间"
            },
            adventure: {
                name: "冒险体验",
                icon: "🏔️",
                description: "户外运动、挑战性活动、刺激项目",
                aiImpact: "会安排户外活动和挑战性项目"
            }
        }
    },

    // 预算水平 - 影响推荐档次和消费建议
    budgetLevel: {
        title: "您的旅行预算水平",
        description: "选择您通常的旅行预算范围，影响住宿、餐饮、景点推荐档次",
        options: {
            budget: {
                name: "经济实惠",
                range: "300-500元/天",
                description: "注重性价比，优先免费和低价体验",
                aiStrategy: "推荐公共交通、平价美食、免费景点"
            },
            moderate: {
                name: "适中舒适",
                range: "500-800元/天",
                description: "平衡价格和体验，主流选择",
                aiStrategy: "平衡推荐，兼顾舒适度和特色体验"
            },
            comfort: {
                name: "舒适便利",
                range: "800-1200元/天",
                description: "更注重舒适度和便利性",
                aiStrategy: "推荐舒适住宿、便利交通、优质餐厅"
            },
            luxury: {
                name: "豪华奢华",
                range: "1200元以上/天",
                description: "追求高端体验和独特服务",
                aiStrategy: "推荐奢华体验、高端服务、独特项目"
            }
        }
    },

    // 饮食限制 - 影响所有餐饮推荐
    dietaryRestrictions: {
        title: "您的饮食限制",
        description: "选择您的饮食禁忌，所有餐厅推荐都会考虑这些限制",
        options: {
            halal: { name: "清真饮食", icon: "☪️" },
            vegetarian: { name: "素食主义", icon: "🥬" },
            vegan: { name: "纯素食", icon: "🌱" },
            no_pork: { name: "不吃猪肉", icon: "🚫🐷" },
            no_beef: { name: "不吃牛肉", icon: "🚫🐄" },
            no_seafood: { name: "不吃海鲜", icon: "🚫🦐" },
            no_spicy: { name: "不吃辣", icon: "🚫🌶️" },
            gluten_free: { name: "无麸质", icon: "🌾" },
            dairy_free: { name: "无乳制品", icon: "🥛" }
        }
    },

    // 出行方式偏好 - 影响交通路线规划
    transportPreferences: {
        title: "您偏好的出行方式",
        description: "选择您喜欢的交通方式，影响路线规划和景点安排",
        options: {
            public: {
                name: "公共交通",
                icon: "🚇",
                description: "地铁、公交等公共交通",
                aiImpact: "优先安排地铁/公交可达的景点"
            },
            walking: {
                name: "步行探索",
                icon: "🚶",
                description: "步行游览，深度体验",
                aiImpact: "控制景点间距离，设计步行友好路线"
            },
            bicycle: {
                name: "骑行游览",
                icon: "🚲",
                description: "自行车或共享单车",
                aiImpact: "推荐骑行路线和自行车友好景点"
            },
            taxi: {
                name: "打车出行",
                icon: "🚕",
                description: "出租车或网约车",
                aiImpact: "相对自由的路线安排，考虑打车成本"
            },
            driving: {
                name: "自驾游览",
                icon: "🚗",
                description: "自己开车或租车",
                aiImpact: "安排停车方便的景点，考虑郊外景点"
            }
        }
    }
};

/**
 * ✈️ 本次行程偏好 - 每次旅行可调整
 * 这些设置针对当前这次旅行，可以根据具体情况灵活调整
 */
export const TRIP_PREFERENCES_OPTIONS = {
    // 旅行目的 - 影响整体行程风格
    tripPurpose: {
        title: "这次旅行的主要目的",
        description: "告诉我们这次旅行的特殊意义，我们会相应调整推荐风格",
        options: {
            leisure: {
                name: "休闲度假",
                icon: "🏖️",
                description: "放松身心，享受慢时光",
                aiStrategy: "轻松节奏，多安排休息时间，推荐舒适场所"
            },
            exploration: {
                name: "探索发现",
                icon: "🗺️",
                description: "发现新地方，体验新事物",
                aiStrategy: "多样化体验，包含小众景点和当地特色"
            },
            celebration: {
                name: "庆祝纪念",
                icon: "🎉",
                description: "生日、纪念日等特殊庆祝",
                aiStrategy: "营造特殊氛围，推荐有纪念意义的场所"
            },
            business: {
                name: "商务顺游",
                icon: "💼",
                description: "商务差旅间隙的游览",
                aiStrategy: "时间灵活，交通便利，高效经典路线"
            },
            family: {
                name: "家庭聚会",
                icon: "👨‍👩‍👧‍👦",
                description: "家人团聚，多代同游",
                aiStrategy: "照顾不同年龄需求，安全舒适优先"
            }
        }
    },

    // 体验重点 - 这次旅行最想体验什么
    focusAreas: {
        title: "这次最想体验什么？",
        description: "选择这次旅行您最期待的体验类型（最多3个）",
        maxSelections: 3,
        options: {
            historical_culture: {
                name: "历史文化",
                icon: "🏛️",
                description: "深入了解当地历史和文化传统"
            },
            natural_scenery: {
                name: "自然风光",
                icon: "🌄",
                description: "欣赏自然美景，亲近大自然"
            },
            local_cuisine: {
                name: "地道美食",
                icon: "🍲",
                description: "品尝当地特色美食和小吃"
            },
            urban_lifestyle: {
                name: "都市生活",
                icon: "🏙️",
                description: "体验现代都市的生活方式"
            },
            art_culture: {
                name: "艺术文化",
                icon: "🎨",
                description: "参观艺术展览和创意空间"
            },
            photo_spots: {
                name: "网红打卡",
                icon: "📱",
                description: "拍照分享，记录美好时刻"
            },
            shopping: {
                name: "购物休闲",
                icon: "🛍️",
                description: "购物娱乐，放松休闲"
            },
            outdoor_adventure: {
                name: "户外探险",
                icon: "🏔️",
                description: "户外活动和冒险体验"
            }
        }
    },

    // 行程节奏 - 这次想要什么样的节奏
    pacePreference: {
        title: "这次想要什么样的节奏？",
        description: "根据您的时间和体力情况选择合适的行程节奏",
        options: {
            slow: {
                name: "慢悠悠",
                icon: "🐌",
                description: "深度体验，充足休息时间",
                aiStrategy: "每天2-3个景点，留足时间深度体验"
            },
            balanced: {
                name: "刚刚好",
                icon: "⚖️",
                description: "平衡安排，景点与休息并重",
                aiStrategy: "每天3-4个景点，合理安排休息"
            },
            intensive: {
                name: "充实满满",
                icon: "⚡",
                description: "紧凑安排，最大化利用时间",
                aiStrategy: "每天4-5个景点，高效率行程安排"
            }
        }
    },

    // 社交偏好 - 这次想要什么样的氛围
    socialPreference: {
        title: "这次偏好什么样的氛围？",
        description: "选择您希望的旅行氛围和环境类型",
        options: {
            quiet: {
                name: "安静私密",
                icon: "🤫",
                description: "避开人群，享受宁静空间",
                aiStrategy: "推荐人少的景点，避开热门时段"
            },
            mixed: {
                name: "均衡体验",
                icon: "🔄",
                description: "有热闹也有安静的平衡体验",
                aiStrategy: "混合推荐，兼顾不同氛围的场所"
            },
            lively: {
                name: "热闹有趣",
                icon: "🎪",
                description: "喜欢热闹氛围，乐于社交互动",
                aiStrategy: "推荐热门景点，包含社交互动机会"
            }
        }
    },

    // 拍照需求 - 这次对拍照的重视程度
    photoPreference: {
        title: "这次旅行对拍照的重视程度",
        description: "帮助我们安排合适的拍照时间和推荐上镜景点",
        options: {
            minimal: {
                name: "随手记录",
                icon: "📷",
                description: "偶尔拍照留念即可",
                aiStrategy: "正常行程安排，不特别考虑拍照因素"
            },
            casual: {
                name: "适度拍照",
                icon: "📸",
                description: "会拍照分享，但不是重点",
                aiStrategy: "在景点推荐中提及拍照角度"
            },
            essential: {
                name: "拍照很重要",
                icon: "📱",
                description: "很重视拍照效果和分享",
                aiStrategy: "优先推荐上镜景点，考虑光线和拍摄时间"
            }
        }
    },

    // 临时特殊需求 - 这次旅行的特殊情况
    temporaryNeeds: {
        title: "这次旅行的特殊情况",
        description: "选择这次旅行需要特别考虑的因素",
        options: {
            hasChildren: {
                name: "同行有小孩",
                icon: "👶",
                description: "需要考虑儿童友好设施和安全",
                aiStrategy: "优先推荐家庭友好场所，控制步行距离"
            },
            hasElderly: {
                name: "同行有老人",
                icon: "👴",
                description: "需要考虑老人体力和无障碍设施",
                aiStrategy: "推荐无障碍景点，安排充足休息时间"
            },
            limitedMobility: {
                name: "行动不便",
                icon: "♿",
                description: "需要无障碍设施和通道",
                aiStrategy: "确保所有推荐场所有无障碍设施"
            },
            budgetTight: {
                name: "预算紧张",
                icon: "💰",
                description: "这次预算比较有限",
                aiStrategy: "优先推荐免费和低价的高质量体验"
            },
            timeFlexible: {
                name: "时间充裕",
                icon: "⏰",
                description: "时间比较宽松，可以深度游览",
                aiStrategy: "安排更多深度体验和隐藏景点"
            },
            weatherConcern: {
                name: "担心天气",
                icon: "🌦️",
                description: "天气可能不好，需要室内备选",
                aiStrategy: "每天安排室内外结合，准备天气备选方案"
            }
        }
    }
};

// ==============================================
// 🔧 工具函数 - 便捷的数据处理
// ==============================================

/**
 * 获取选项的显示名称
 */
export function getOptionDisplayName(category, optionKey) {
    const categories = {
        ...PERSONAL_PROFILE_OPTIONS,
        ...TRIP_PREFERENCES_OPTIONS
    };

    const categoryData = categories[category];
    if (!categoryData || !categoryData.options) return optionKey;

    const option = categoryData.options[optionKey];
    return option ? option.name : optionKey;
}

/**
 * 获取选项的描述信息
 */
export function getOptionDescription(category, optionKey) {
    const categories = {
        ...PERSONAL_PROFILE_OPTIONS,
        ...TRIP_PREFERENCES_OPTIONS
    };

    const categoryData = categories[category];
    if (!categoryData || !categoryData.options) return '';

    const option = categoryData.options[optionKey];
    return option ? option.description : '';
}

/**
 * 验证选择是否符合限制
 */
export function validateSelections(category, selections) {
    const categories = {
        ...PERSONAL_PROFILE_OPTIONS,
        ...TRIP_PREFERENCES_OPTIONS
    };

    const categoryData = categories[category];
    if (!categoryData) return { valid: true };

    if (categoryData.maxSelections && selections.length > categoryData.maxSelections) {
        return {
            valid: false,
            message: `最多只能选择${categoryData.maxSelections}个选项`
        };
    }

    return { valid: true };
}

/**
 * 格式化标签列表为可读字符串
 */
export function formatTagsToString(tags, category) {
    if (!Array.isArray(tags) || tags.length === 0) return '';

    const displayNames = tags.map(tag => getOptionDisplayName(category, tag));
    return displayNames.join('、');
}

export default {
    PERSONAL_PROFILE_OPTIONS,
    TRIP_PREFERENCES_OPTIONS,
    getOptionDisplayName,
    getOptionDescription,
    validateSelections,
    formatTagsToString
};