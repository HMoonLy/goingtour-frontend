/**
 * 🌟 GoingTour 旅行偏好管理系统 - Unified Data System
 * 
 * 核心职能：
 * 1. Source of Truth: 定义前端行程创建的所有数据结构和选项
 * 2. State Factory: 提供标准化的初始状态 (createInitialTripState)
 * 3. Data Mapping: 负责 UI 状态 -> 后端 DTO 的转换
 * 4. Validation: 集中管理数据校验规则
 */

import { AiTripRequest } from '@/models/AiTripRequest';

// ==============================================
// 📊 核心数据定义 - 用户友好的选项展示
// ==============================================

/**
 * 🎯 个人旅行档案 - 一次设置，终身受益
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
                travelStyle: "偏好精心规划的深度游，避开拥挤景点，喜欢探索有历史底蕴和设计感的地点",
                aiPrompt: "理性规划型旅行者：偏好有逻辑性和效率的行程安排，喜欢深度探索而非走马观花，对历史文化和建筑设计感兴趣，倾向于避开过度拥挤的景点，更愿意花时间在少数精选的高质量体验上。在餐厅选择上偏好有特色和口碑的店铺而非网红店。推荐策略：精选少量高质量景点，留出充足时间深度体验，优先推荐有历史底蕴或设计感的地点。" 
            },
            INTP: { 
                name: "逻辑学家", 
                description: "独立思考，探索新知", 
                travelStyle: "思维敏捷，喜欢独立思考和探索新事物，对文化交流和艺术展览感兴趣",
                aiPrompt: "独立思考型旅行者：思维敏捷，喜欢独立思考和探索新事物，对自然风光、艺术展览或文化交流感兴趣，偏好自由度较高的行程安排。推荐策略：提供多样化的文化和自然体验，保持行程灵活性，推荐有教育意义的场所。"
            },
            ENTJ: { 
                name: "指挥官", 
                description: "领导决断，挑战竞争", 
                travelStyle: "具有领导力和决断力，喜欢挑战和竞争，偏爱极限运动和热门景点",
                aiPrompt: "领导决断型旅行者：具有领导力和决断力，喜欢挑战和竞争，可能偏爱极限运动、探险或城市中的热门景点，追求效率和成就感。推荐策略：安排有挑战性的活动，推荐知名景点和高效率的行程安排。"
            },
            ENTP: { 
                name: "辩论家", 
                description: "充满好奇，喜欢交流", 
                travelStyle: "充满好奇心，喜欢交流，对文化体验、美食探索和新奇事物感兴趣",
                aiPrompt: "充满好奇，喜欢交流 - 充满好奇心，喜欢交流，对文化体验、美食探索和新奇事物感兴趣"
            },
            INFJ: { 
                name: "提倡者", 
                description: "富有同情心，深刻洞察", 
                travelStyle: "富有同情心和洞察力，偏爱文化交流、艺术体验和自然风光",
                aiPrompt: "深度体验，追求意义 - 喜欢有深度和意义的旅行体验，偏好小众而有特色的目的地"
            },
            INFP: { 
                name: "调停者", 
                description: "敏感创造，温和体验", 
                travelStyle: "敏感且富有创造力，偏爱文艺体验、特色民宿和宁静的自然环境",
                aiPrompt: "个性化体验，情感连接 - 注重个人感受和情感连接，喜欢能够激发内心共鸣的旅行体验"
            },
            ENFJ: { 
                name: "主人公", 
                description: "富有爱心，责任感强", 
                travelStyle: "富有爱心和责任感，喜欢社交，偏爱亲子活动和文化交流",
                aiPrompt: "关注他人，社交体验 - 善于照顾他人需求，喜欢能够与当地人交流互动的社交型旅行"
            },
            ENFP: { 
                name: "竞选者", 
                description: "活力四射，多样体验", 
                travelStyle: "热爱新奇体验和社交互动，喜欢丰富多彩的行程和当地文化体验",
                aiPrompt: "活力社交型旅行者：热爱新奇体验和社交互动，喜欢热闹的氛围和多样化的活动，对当地文化和人文风情特别感兴趣，愿意尝试各种新鲜事物包括特色美食，喜欢拍照分享和与当地人交流。推荐策略：安排丰富多样的活动类型，包含社交互动机会，推荐网红打卡地和当地特色体验。"
            },
            ISTJ: { 
                name: "物流师", 
                description: "注重细节，有序规划", 
                travelStyle: "注重细节和秩序，偏爱历史古迹、自然风光和文化景点",
                aiPrompt: "稳妥计划，经典路线 - 偏好稳妥可靠的计划，喜欢经典的旅游路线和成熟的旅游设施"
            },
            ISFJ: { 
                name: "守卫者", 
                description: "富有同情心，关怀他人", 
                travelStyle: "富有同情心，偏爱住宿便利、美食推荐和温馨体验",
                aiPrompt: "贴心周到，舒适安全 - 注重旅行的舒适性和安全性，喜欢温馨而贴心的旅行安排"
            },
            ESTJ: { 
                name: "总经理", 
                description: "领导力强，务实高效", 
                travelStyle: "具有领导力，偏爱商务旅行、极限运动和热门景点",
                aiPrompt: "高效组织，目标明确 - 追求高效和有组织的旅行，喜欢目标明确的行程安排"
            },
            ESFJ: { 
                name: "执政官", 
                description: "富有爱心，善于社交", 
                travelStyle: "富有爱心，喜欢社交，偏爱住宿便利、美食推荐和温馨体验",
                aiPrompt: "团体和谐，分享快乐 - 重视团体和谐，喜欢与他人分享旅行的快乐和美好时光"
            },
            ISTP: { 
                name: "鉴赏家", 
                description: "灵活独立，喜欢行动", 
                travelStyle: "喜欢独立行动，偏爱极限运动、自驾游和新奇体验",
                aiPrompt: "灵活自由，实用体验 - 喜欢灵活自由的旅行方式，偏好实用性强的旅行体验"
            },
            ISFP: { 
                name: "探险家", 
                description: "温和体验，艺术美学", 
                travelStyle: "注重个人感受和美学体验，偏好宁静优美的环境，对艺术和自然风光感兴趣",
                aiPrompt: "温和体验型旅行者：注重个人感受和美学体验，偏好宁静优美的环境，对艺术、自然和手工艺有浓厚兴趣，喜欢慢节奏的深度体验，重视情感连接和个人成长。推荐策略：推荐有艺术气息和自然美景的地点，安排充足时间感受和体验，避免过于商业化的景点。"
            },
            ESTP: { 
                name: "企业家", 
                description: "冒险刺激，灵活自由", 
                travelStyle: "喜欢刺激和新鲜的体验，行动力强，偏好户外活动和挑战性项目",
                aiPrompt: "冒险行动型旅行者：喜欢刺激和新鲜的体验，行动力强，适应性好，偏好户外活动和挑战性项目，对当下的享受很重视，喜欢灵活的行程安排。推荐策略：安排丰富的户外活动和体验项目，保持行程的灵活性，推荐有挑战性的景点和活动。"
            },
            ESFP: { 
                name: "娱乐家", 
                description: "活泼开朗，善于交流", 
                travelStyle: "活泼开朗，喜欢与人交流，偏爱热闹的活动和美食体验",
                aiPrompt: "热情开朗，享受当下 - 热情开朗，喜欢享受当下的快乐，偏好轻松愉快的旅行氛围"
            }
        }
    },

    // 核心兴趣爱好 - 对应 travelTags/focusAreas
    coreInterests: {
        title: "您的核心兴趣爱好",
        description: "选择您平时最感兴趣的领域，我们会在每次行程中优先推荐相关体验",
        maxSelections: 5,
        options: {
            nature: { 
                name: "自然风光", 
                icon: "🌿", 
                description: "山川湖海、公园植物园等自然环境",
                aiPrompt: "对自然景观有强烈偏好，建议安排至少30%的行程在自然环境中，优先选择视野开阔、空气清新的户外空间。对天气条件较为敏感，需要准备室内备选方案。推荐日出日落时段的观景点。"
            },
            culture: { 
                name: "文化体验", 
                icon: "🏛️", 
                description: "历史古迹、博物馆、传统文化",
                aiPrompt: "对历史文化和人文传统有深度兴趣，喜欢了解当地的历史背景、传统工艺和民俗文化。建议安排博物馆、历史遗迹、文化街区等有教育意义的场所。重视文化知识的获得，偏好深度了解而非走马观花，喜欢与当地人文化交流。"
            },
            food: { 
                name: "美食探索", 
                icon: "🍜", 
                description: "当地美食、特色餐厅、街头小吃",
                aiPrompt: "对当地美食文化有浓厚兴趣，愿意为了品尝特色料理而专门安排行程。建议每餐都安排当地特色，包括街头小吃、传统餐厅和现代创意料理。对餐厅环境和食物卖相有一定要求。美食预算可以适当提高，通过美食体验了解当地文化。"
            },
            photography: { 
                name: "摄影打卡", 
                icon: "📸", 
                description: "网红景点、拍照圣地、视觉效果",
                aiPrompt: "对视觉效果和拍照环境要求较高，偏好有设计感、色彩丰富或具有独特视角的场所。行程安排需要考虑最佳拍摄时间（光线条件），并预留足够时间进行摄影创作。每个景点需要额外15-30分钟拍摄时间，优先考虑光线条件好的时段，高度重视视觉效果和分享价值。"
            },
            art: { 
                name: "艺术体验", 
                icon: "🎨", 
                description: "艺术展览、创意街区、设计空间",
                aiPrompt: "对艺术和美学特别敏感，喜欢参观艺术展览、创意空间和设计场所。建议安排艺术类场馆、创意街区、设计商店等有艺术氛围的地点。重视文化内涵和美学体验。"
            },
            adventure: { 
                name: "冒险体验", 
                icon: "🏔️", 
                description: "户外运动、挑战性活动、刺激项目",
                aiPrompt: "喜欢刺激和挑战性的体验，偏好户外活动和冒险项目。建议安排徒步、攀岩、极限运动等有挑战性的活动。对安全性有一定要求但乐于接受适度风险。"
            }
        }
    },

    // 预算水平 - 对应 budget
    budgetLevel: {
        title: "您的旅行预算水平",
        description: "选择您通常的旅行预算范围，影响住宿、餐饮、景点推荐档次",
        options: {
            budget: { 
                name: "经济实惠", 
                range: "150-300元/天", 
                description: "精打细算，青旅民宿、公共交通", 
                icon: "Money", 
                avgCost: 225,
                aiPrompt: "经济实惠预算水平：注重性价比，需要在有限预算内最大化体验价值。优先推荐免费或低价的高质量景点，如公园、免费博物馆、历史街区等。餐饮推荐当地性价比高的特色小吃和平价餐厅。交通建议多使用公共交通工具。挖掘免费但有特色的体验。"
            },
            moderate: { 
                name: "适中舒适", 
                range: "300-500元/天", 
                description: "性价比之选，快捷酒店、特色餐厅", 
                icon: "Star", 
                avgCost: 400,
                aiPrompt: "适中舒适预算水平：平衡价格和体验质量，推荐主流的优质选择。在保证舒适度的前提下，选择性价比较好的住宿、餐饮和景点。可以适当安排一些收费但值得的特色体验。"
            },
            comfort: { 
                name: "舒适便利", 
                range: "500-800元/天", 
                description: "注重体验，星级酒店、品质餐饮", 
                icon: "Coffee", 
                avgCost: 650,
                aiPrompt: "舒适便利预算水平：更注重舒适度和便利性，可以推荐较高档的住宿、餐厅和交通方式。优先选择服务质量好、环境舒适的场所，减少排队等待时间。"
            },
            luxury: { 
                name: "豪华奢华", 
                range: "800元以上/天", 
                description: "尽享奢华，高端酒店、专车服务", 
                icon: "Setting", 
                avgCost: 1000,
                aiPrompt: "豪华奢华预算水平：追求高端体验和独特服务，推荐奢华体验、高端服务、独特项目。可以安排私人导游、高端餐厅、奢华住宿等顶级体验。注重服务品质和独特性。"
            }
        }
    },

    // 饮食限制 - 对应 dietaryRestrictions
    dietaryRestrictions: {
        title: "您的饮食限制",
        description: "选择您的饮食禁忌，所有餐厅推荐都会考虑这些限制",
        options: {
            halal: { name: "清真饮食", icon: "☪️" },
            vegetarian: { name: "素食主义", icon: "🥬" },
            vegan: { name: "纯素食", icon: "🌱" },
            no_pork: { name: "不吃猪肉", icon: "🐷" },
            no_beef: { name: "不吃牛肉", icon: "🐄" },
            no_seafood: { name: "不吃海鲜", icon: "🦐" },
            no_spicy: { name: "不吃辣", icon: "🌶️" },
            gluten_free: { name: "无麸质", icon: "🌾" },
            dairy_free: { name: "无乳制品", icon: "🥛" }
        }
    },

    // 出行方式偏好 - 对应 transports
    transportPreferences: {
        title: "您偏好的出行方式",
        description: "选择您喜欢的交通方式，影响路线规划和景点安排",
        options: {
            public_transport: { 
                name: "公共交通", 
                icon: "🚇", 
                description: "地铁、公交等公共交通",
                aiPrompt: "偏好公共交通：优先使用地铁、公交等公共交通工具，安排景点时重点考虑地铁/公交可达性。推荐公交一日票等优惠选择。"
            },
            walking: { 
                name: "步行探索", 
                icon: "🚶", 
                description: "步行游览，深度体验",
                aiPrompt: "偏好步行探索：喜欢步行深度体验，景点间距离控制在合理范围（建议单次步行不超过20分钟），设计步行友好的路线。"
            },
            cycling: { 
                name: "骑行游览", 
                icon: "🚲", 
                description: "自行车或共享单车",
                aiPrompt: "偏好骑行游览：推荐自行车友好的路线和景点，安排共享单车方便的区域，避免过于拥堵的道路。"
            },
            taxi_rideshare: { 
                name: "打车出行", 
                icon: "🚕", 
                description: "出租车或网约车",
                aiPrompt: "偏好打车出行：可以安排相对灵活的路线，但要考虑打车成本和交通拥堵情况。"
            },
            rental_car: { 
                name: "自驾游览", 
                icon: "🚗", 
                description: "自己开车或租车",
                aiPrompt: "偏好自驾游览：可以安排停车方便的景点，考虑包含郊外和远一些的优质景点，提供停车信息。"
            }
        }
    }
};

/**
 * ✈️ 本次行程偏好 - 每次旅行可调整
 */
export const TRIP_PREFERENCES_OPTIONS = {
    // 旅行目的 - 对应 travelTags
    tripPurpose: {
        title: "这次旅行的主要目的",
        description: "告诉我们这次旅行的特殊意义，我们会相应调整推荐风格",
        options: {
            leisure: { 
                name: "休闲度假", 
                icon: "🏖️", 
                description: "放松身心，享受慢时光",
                aiStrategy: "安排轻松舒适的行程，多留自由时间",
                aiPrompt: "休闲度假目的：这是一次以放松身心为主的旅行，行程节奏应相对轻松，多安排休息时间和舒适的场所。避免过于紧密的时间安排，优先推荐能够让人放松的环境和体验。"
            },
            exploration: { 
                name: "探索发现", 
                icon: "🗺️", 
                description: "发现新地方，体验新事物",
                aiStrategy: "推荐小众特色景点和地道体验",
                aiPrompt: "探索发现目的：这是一次以发现新事物为主的旅行，应该安排多样化的体验，包含一些小众但有特色的景点。鼓励尝试当地独特的文化、美食和活动。"
            },
            celebration: { 
                name: "庆祝纪念", 
                icon: "🎉", 
                description: "生日、纪念日等特殊庆祝",
                aiStrategy: "精选有氛围的餐厅和特别体验",
                aiPrompt: "庆祝纪念目的：这是一次具有特殊意义的庆祝性旅行，需要营造温馨浪漫的氛围。优先推荐有纪念价值的景点、适合拍照留念的场所，以及能够提供特殊服务（如庆祝套餐、纪念品）的餐厅。行程节奏应相对轻松，留出享受美好时光的空间。"
            },
            business: { 
                name: "商务顺游", 
                icon: "💼", 
                description: "商务差旅间隙的游览",
                aiStrategy: "安排交通便利、高效的景点游览",
                aiPrompt: "商务顺游目的：这是商务差旅的间隙游览，时间相对有限且可能存在变动。优先推荐交通便利、时间灵活的景点，避免需要长时间投入的项目。重点关注高效率的经典体验，以及适合商务人士的餐饮和休息场所。"
            },
            family: { 
                name: "家庭聚会", 
                icon: "👨‍👩‍👧‍👦", 
                description: "家人团聚，多代同游",
                aiStrategy: "兼顾老少需求，安排舒适便利的行程",
                aiPrompt: "家庭聚会目的：这是多代人共同出行的家庭旅游，需要考虑不同年龄层的需求和体力。优先推荐家庭友好的景点，有儿童设施和老人休息区。行程安排要考虑用餐时间、休息频率，避免过于劳累的项目。"
            },
            romantic: { 
                name: "情侣蜜月", 
                icon: "💑", 
                description: "浪漫二人世界",
                aiStrategy: "营造浪漫氛围，推荐私密性好的场所",
                aiPrompt: "情侣蜜月目的：营造浪漫氛围，优先推荐风景优美、环境私密的餐厅和景点。行程安排不宜过紧，留出二人世界的时间。"
            },
            friendship: { 
                name: "朋友聚会", 
                icon: "👯", 
                description: "好友同行，欢聚时光",
                aiStrategy: "安排适合多人互动的有趣活动",
                aiPrompt: "朋友聚会目的：安排适合多人参与的活动，如剧本杀、KTV、多人聚餐等。推荐热闹、有氛围的场所。"
            },
            solo: { 
                name: "个人独旅", 
                icon: "🎒", 
                description: "享受一个人的自由时光",
                aiStrategy: "行程灵活自由，关注个人安全与体验",
                aiPrompt: "个人独旅目的：行程安排灵活自由，可以根据个人兴趣深入体验。注意推荐安全性高的住宿和活动，适合单人就餐的餐厅。"
            },
            learning: { 
                name: "文化学习", 
                icon: "📚", 
                description: "增长见识，了解历史文化",
                aiStrategy: "重点安排博物馆、古迹等文化场所",
                aiPrompt: "文化学习目的：以学习和了解当地文化为主要目的，重点安排博物馆、历史遗迹、高校等。建议提供详细的背景知识介绍。"
            },
            relaxation: { 
                name: "放松减压", 
                icon: "🧘", 
                description: "逃离压力，治愈身心",
                aiStrategy: "推荐疗愈系体验，如SPA、自然风光",
                aiPrompt: "放松减压目的：以舒缓压力、治愈身心为目的。推荐SPA、瑜伽、冥想等体验，以及风景优美、环境安静的自然场所。"
            },
            adventure: { 
                name: "冒险挑战", 
                icon: "🧗", 
                description: "寻求刺激，挑战自我",
                aiStrategy: "安排刺激的户外活动和挑战性项目",
                aiPrompt: "冒险挑战目的：安排具有挑战性的户外活动，如攀岩、漂流、滑翔伞等。确保安全措施到位。"
            },
            photography: { 
                name: "摄影采风", 
                icon: "📸", 
                description: "寻找绝美机位，拍出大片",
                aiStrategy: "推荐最佳摄影点和黄金拍摄时间",
                aiPrompt: "摄影采风目的：以摄影创作为主，优先推荐视觉效果好的景点和机位。考虑光线变化，安排日出日落时段的拍摄。"
            }
        }
    },

    // 体验重点 - 对应 focusAreas
    focusAreas: {
        title: "这次最想体验什么？",
        description: "选择这次旅行您最期待的体验类型（最多3个）",
        maxSelections: 3,
        options: {
            historical_culture: { 
                name: "历史文化", 
                icon: "🏛️", 
                description: "深入了解当地历史和文化传统",
                aiPrompt: "重点体验历史文化：深入安排历史文化类景点，包含历史背景介绍和文化故事。推荐博物馆、古迹、文化街区。"
            },
            natural_scenery: { 
                name: "自然风光", 
                icon: "🌄", 
                description: "欣赏自然美景，亲近大自然",
                aiPrompt: "重点体验自然风光：优先安排自然景观，考虑最佳观赏时间和天气条件。推荐公园、山景、水景等自然环境。"
            },
            local_cuisine: { 
                name: "地道美食", 
                icon: "🍲", 
                description: "品尝当地特色美食和小吃",
                aiPrompt: "重点体验地道美食：每餐都精心推荐当地特色，包含街头小吃、传统餐厅和特色料理。提供美食文化背景介绍。"
            },
            urban_lifestyle: { 
                name: "都市生活", 
                icon: "🏙️", 
                description: "体验现代都市的生活方式",
                aiPrompt: "重点体验都市生活：推荐能体现当地现代都市生活的场所，如商业区、文创园区、现代建筑等。"
            },
            art_culture: { 
                name: "艺术文化", 
                icon: "🎨", 
                description: "参观艺术展览和创意空间",
                aiPrompt: "重点体验艺术文化：安排艺术展览、创意空间、设计商店等有艺术氛围的场所。"
            },
            photo_spots: { 
                name: "网红打卡", 
                icon: "📱", 
                description: "拍照分享，记录美好时刻",
                aiPrompt: "重点网红打卡：优先推荐视觉效果好、适合拍照的景点，考虑光线条件和拍摄角度。"
            },
            shopping: { 
                name: "购物休闲", 
                icon: "🛍️", 
                description: "购物娱乐，放松休闲",
                aiPrompt: "重点购物休闲：安排购物中心、特色市场、纪念品店等购物场所。"
            },
            outdoor_adventure: { 
                name: "户外探险", 
                icon: "🏔️", 
                description: "户外活动和冒险体验",
                aiPrompt: "重点户外探险：安排户外活动和冒险体验项目。"
            }
        }
    },

    // 行程节奏 - 对应 pacePreference
    pacePreference: {
        title: "这次想要什么样的节奏？",
        description: "根据您的时间和体力情况选择合适的行程节奏",
        options: {
            slow: { 
                name: "慢悠悠", 
                icon: "🐌", 
                description: "深度体验，充足休息时间",
                aiPrompt: "慢悠悠节奏：采用深度体验的慢节奏安排，每天2-3个主要景点，在每个地方留出充足的时间深度体验和休息。避免匆忙赶路，重视体验质量而非数量。"
            },
            balanced: { 
                name: "刚刚好", 
                icon: "⚖️", 
                description: "平衡安排，景点与休息并重",
                aiPrompt: "刚刚好节奏：采用平衡的行程节奏，每天3-4个景点，在充实安排和适度休息之间找到平衡。既不会太赶也不会太松散。"
            },
            intensive: { 
                name: "充实满满", 
                icon: "⚡", 
                description: "紧凑安排，最大化利用时间",
                aiPrompt: "充实满满节奏：采用紧凑高效的行程安排，每天4-5个景点，最大化利用时间。确保交通连接顺畅，减少无效时间消耗。"
            }
        }
    },

    // 社交偏好 - 对应 socialPreference
    socialPreference: {
        title: "这次偏好什么样的氛围？",
        description: "选择您希望的旅行氛围和环境类型",
        options: {
            quiet: { 
                name: "安静私密", 
                icon: "🤫", 
                description: "避开人群，享受宁静空间",
                aiPrompt: "偏好安静私密：优先推荐人流较少的景点和时段，避开过于热闹和拥挤的场所。选择相对安静、私密的环境，让旅行者能够静心体验。"
            },
            mixed: { 
                name: "均衡体验", 
                icon: "🔄", 
                description: "有热闹也有安静的平衡体验",
                aiPrompt: "偏好均衡体验：在热闹和安静之间保持平衡，既安排一些热门的热闹景点，也包含一些相对安静的私密场所，提供多样化的氛围体验。"
            },
            lively: { 
                name: "热闹有趣", 
                icon: "🎪", 
                description: "喜欢热闹氛围，乐于社交互动",
                aiPrompt: "偏好热闹有趣：优先推荐热门景点和热闹的场所，包含有社交互动机会的活动。选择氛围活跃、人气较高的地方。"
            }
        }
    },

    // 拍照需求 - 对应 photoPreference
    photoPreference: {
        title: "这次旅行对拍照的重视程度",
        description: "帮助我们安排合适的拍照时间和推荐上镜景点",
        options: {
            minimal: { 
                name: "随手记录", 
                icon: "📷", 
                description: "偶尔拍照留念即可",
                aiPrompt: "随手记录拍照：按正常行程安排，不需要特别考虑拍照因素。偶尔提及值得拍照的角度即可。"
            },
            casual: { 
                name: "适度拍照", 
                icon: "📸", 
                description: "会拍照分享，但不是重点",
                aiPrompt: "适度拍照需求：在景点推荐中适当提及拍照角度和最佳时间，但不作为主要考虑因素。"
            },
            essential: { 
                name: "拍照很重要", 
                icon: "📱", 
                description: "很重视拍照效果和分享",
                aiPrompt: "拍照很重要：高度重视拍照效果，优先推荐视觉效果好、上镜的景点。考虑光线条件，建议最佳拍摄时间，每个景点预留额外的拍摄时间。提供拍摄角度和构图建议。"
            }
        }
    },

    // 临时特殊需求 - 对应 extraRequirements 或 travelTags
    temporaryNeeds: {
        title: "这次旅行的特殊情况",
        description: "选择这次旅行需要特别考虑的因素",
        options: {
            hasChildren: { 
                name: "同行有小孩", 
                icon: "👶", 
                description: "需要考虑儿童友好设施和安全",
                aiPrompt: "同行有小孩：所有推荐场所必须考虑儿童友好性。包括：安全的环境、适合儿童的设施、不过长的步行距离、有趣的互动体验。餐厅需要有儿童座椅和适合儿童的菜品。行程安排需要考虑儿童的作息时间和注意力持续时间。单个景点停留时间不宜过长（建议1-2小时）。"
            },
            hasElderly: { 
                name: "同行有老人", 
                icon: "👴", 
                description: "需要考虑老人体力和无障碍设施",
                aiPrompt: "同行有老人：需要特别考虑老人的体力和舒适度。推荐有休息设施的景点，避免需要大量步行或爬楼梯的地方。安排充足的休息时间，选择交通便利的景点。"
            },
            limitedMobility: { 
                name: "行动不便", 
                icon: "♿", 
                description: "需要无障碍设施和通道",
                aiPrompt: "行动不便：所有推荐必须确保无障碍通道和设施。包括轮椅可达的景点、有电梯的建筑、无障碍洗手间等。避免需要大量步行或爬楼梯的景点。餐厅和住宿也需要无障碍设施。"
            },
            budgetTight: { 
                name: "预算紧张", 
                icon: "💰", 
                description: "这次预算比较有限",
                aiPrompt: "预算紧张：这次旅行预算比平时更加有限，需要在有限预算内最大化体验价值。优先推荐免费或低价的高质量景点，如公园、免费博物馆、历史街区等。餐饮推荐当地性价比高的特色小吃和平价餐厅。"
            },
            timeFlexible: { 
                name: "时间充裕", 
                icon: "⏰", 
                description: "时间比较宽松，可以深度游览",
                aiPrompt: "时间充裕：时间比较宽松，可以安排更多深度体验和一些相对小众但有特色的景点。不用特别考虑时间效率，可以慢慢品味每个地方。"
            },
            weatherConcern: { 
                name: "担心天气", 
                icon: "🌦️", 
                description: "天气可能不好，需要室内备选",
                aiPrompt: "担心天气：天气可能不稳定，需要准备多种方案。每天的行程安排室内外结合，提供天气不好时的室内备选方案。推荐有室内空间的场所。"
            }
        }
    }
};

// ==============================================
// 🔧 工具函数 - 便捷的数据处理
// ==============================================

export function getOptionDisplayName(category, optionKey) {
    const categories = { ...PERSONAL_PROFILE_OPTIONS, ...TRIP_PREFERENCES_OPTIONS };
    const categoryData = categories[category];
    if (!categoryData || !categoryData.options) return optionKey;
    const option = categoryData.options[optionKey];
    return option ? option.name : optionKey;
}

export function getOptionDescription(category, optionKey) {
    const categories = { ...PERSONAL_PROFILE_OPTIONS, ...TRIP_PREFERENCES_OPTIONS };
    const categoryData = categories[category];
    if (!categoryData || !categoryData.options) return '';
    const option = categoryData.options[optionKey];
    return option ? option.description : '';
}

export function validateSelections(category, selections) {
    const categories = { ...PERSONAL_PROFILE_OPTIONS, ...TRIP_PREFERENCES_OPTIONS };
    const categoryData = categories[category];
    if (!categoryData) return { valid: true };
    if (categoryData.maxSelections && selections.length > categoryData.maxSelections) {
        return { valid: false, message: `最多只能选择${categoryData.maxSelections}个选项` };
    }
    return { valid: true };
}

// ==============================================
// 🧠 核心逻辑 - 状态管理与转换 (New System Core)
// ==============================================

/**
 * 🏭 Factory: 创建行程生成的初始 UI 状态
 * 这个状态对象可以直接绑定到 Vue 组件的 v-model
 */
export function createInitialTripState() {
    return {
        // --- 基础信息 ---
        destination: '',
        destinationName: '',
        days: 3,
        travelers: 1,
        userType: 'INDIVIDUAL', // INDIVIDUAL, COUPLE, FAMILY, BUSINESS
        budget: '', // key from budgetLevel
        
        // --- 日期 (UI 专用) ---
        dateRange: [], // [Date, Date] for Element Plus
        
        // --- 偏好设置 ---
        travelTags: [], // 混合: coreInterests + temporaryNeeds + tripPurpose
        transports: [], // keys from transportPreferences
        foodTastes: [], // 暂时没有专门的 UI 字典，可以是 string array
        dietaryRestrictions: [], // keys from dietaryRestrictions
        customDietaryNotes: '',
        
        pacePreference: 'balanced',
        socialPreference: 'mixed',
        photoPreference: 'casual',
        focusAreas: [], // keys from focusAreas
        accommodationType: '', // 暂时没有 UI 字典，string
        
        // --- 必去项 ---
        selectedAttractions: [],
        selectedRestaurants: [],
        selectedHotels: []
    };
}

/**
 * 🔍 Validator: 检查状态是否准备好提交
 */
export function validateTripState(state) {
    const errors = [];
    
    if (!state.destination) errors.push('请选择目的地');
    if (!state.days || state.days < 1) errors.push('行程天数必须大于0');
    if (!state.travelers || state.travelers < 1) errors.push('出行人数必须大于0');
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * 🔄 Converter: 将前端 UI 状态转换为后端 DTO
 * 这里处理所有的映射逻辑
 */
export function transformToBackendDTO(state) {
    // 1. 使用 Model 的工厂方法进行初步转换
    const request = AiTripRequest.fromFrontendState(state);
    
    // 2. 返回纯 JSON
    return request.toBackendJSON();
}

/**
 * 🏷️ 辅助: 获取预算的完整描述文本
 * 用于将 budget key (如 'moderate') 转换为 '适中舒适 (300-500元/天)'
 */
export function getFullBudgetText(budgetKey) {
    const option = PERSONAL_PROFILE_OPTIONS.budgetLevel.options[budgetKey];
    return option ? `${option.name} (${option.range})` : budgetKey;
}

// ==============================================
// ♻️ 兼容性层 - 恢复旧 API 以保持兼容性
// ==============================================

/**
 * 兼容旧代码的 budget 文本获取
 * @deprecated 建议使用 getFullBudgetText
 */
export const getBudgetText = getFullBudgetText;

/**
 * 获取城市名称
 * @param {string} adcode - 城市代码
 * @param {string} cityName - 城市名称（备选）
 */
export function getCityName(adcode, cityName = null) {
    return cityName || adcode;
}

/**
 * 简单的标签翻译函数 (恢复)
 */
export function translateTag(tag, category = null) {
    if (!tag) return '';
    // 尝试在所有类别中查找
    const categories = { ...PERSONAL_PROFILE_OPTIONS, ...TRIP_PREFERENCES_OPTIONS };
    
    // 如果指定了类别，直接查找
    if (category && categories[category]) {
        return getOptionDisplayName(category, tag);
    }

    // 否则遍历所有类别
    for (const catKey in categories) {
        const cat = categories[catKey];
        if (cat.options && cat.options[tag]) {
            return cat.options[tag].name;
        }
    }
    return tag; // 找不到返回原值
}

export function translateTags(tags, category = null) {
    if (!Array.isArray(tags)) return [];
    return tags.map(tag => translateTag(tag, category));
}

export function translateTagsToString(tags, category = null) {
    if (!Array.isArray(tags) || tags.length === 0) return '';
    return translateTags(tags, category).join('、');
}

export function smartTranslateTag(tag) {
    return translateTag(tag); // 简化版
}

// 默认导出整合对象
export default {
    PERSONAL_PROFILE_OPTIONS,
    TRIP_PREFERENCES_OPTIONS,
    getOptionDisplayName,
    getOptionDescription,
    validateSelections,
    createInitialTripState,
    validateTripState,
    transformToBackendDTO,
    getFullBudgetText,
    // 兼容层
    getBudgetText,
    getCityName,
    translateTag,
    translateTags,
    translateTagsToString,
    smartTranslateTag
};
