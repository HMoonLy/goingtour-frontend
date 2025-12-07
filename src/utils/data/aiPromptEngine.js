/**
 * 🤖 AI提示词转换引擎 - 核心智能
 * 将用户友好的选择转换为AI可理解的详细指导
 */

import { PERSONAL_PROFILE_OPTIONS, TRIP_PREFERENCES_OPTIONS } from './travelDataSystem.js';

/**
 * 个人档案AI解析器
 * 将用户友好的个人档案转换为AI可理解的详细画像
 */
export class PersonalProfileInterpreter {
    constructor(profile) {
        this.profile = profile;
    }

    /**
     * 生成MBTI性格的AI行为指导
     */
    getMBTIBehaviorPrompt() {
        const mbtiType = this.profile.mbtiType;
        if (!mbtiType) return "";

        const mbtiPrompts = {
            INTJ: "理性规划型旅行者：偏好有逻辑性和效率的行程安排，喜欢深度探索而非走马观花，对历史文化和建筑设计感兴趣，倾向于避开过度拥挤的景点，更愿意花时间在少数精选的高质量体验上。在餐厅选择上偏好有特色和口碑的店铺而非网红店。推荐策略：精选少量高质量景点，留出充足时间深度体验，优先推荐有历史底蕴或设计感的地点。",

            ENFP: "活力社交型旅行者：热爱新奇体验和社交互动，喜欢热闹的氛围和多样化的活动，对当地文化和人文风情特别感兴趣，愿意尝试各种新鲜事物包括特色美食，喜欢拍照分享和与当地人交流。推荐策略：安排丰富多样的活动类型，包含社交互动机会，推荐网红打卡地和当地特色体验。",

            ISFP: "温和体验型旅行者：注重个人感受和美学体验，偏好宁静优美的环境，对艺术、自然和手工艺有浓厚兴趣，喜欢慢节奏的深度体验，重视情感连接和个人成长。推荐策略：推荐有艺术气息和自然美景的地点，安排充足时间感受和体验，避免过于商业化的景点。",

            ESTP: "冒险行动型旅行者：喜欢刺激和新鲜的体验，行动力强，适应性好，偏好户外活动和挑战性项目，对当下的享受很重视，喜欢灵活的行程安排。推荐策略：安排丰富的户外活动和体验项目，保持行程的灵活性，推荐有挑战性的景点和活动。",

            INTP: "独立思考型旅行者：思维敏捷，喜欢独立思考和探索新事物，对自然风光、艺术展览或文化交流感兴趣，偏好自由度较高的行程安排。推荐策略：提供多样化的文化和自然体验，保持行程灵活性，推荐有教育意义的场所。",

            ENTJ: "领导决断型旅行者：具有领导力和决断力，喜欢挑战和竞争，可能偏爱极限运动、探险或城市中的热门景点，追求效率和成就感。推荐策略：安排有挑战性的活动，推荐知名景点和高效率的行程安排。"
        };

        return mbtiPrompts[mbtiType] || `${mbtiType}类型旅行者的个性化推荐`;
    }

    /**
     * 生成核心兴趣的AI指导
     */
    getCoreInterestsPrompt() {
        const interests = this.profile.coreInterests || [];
        if (interests.length === 0) return "";

        const interestPrompts = {
            nature: "对自然景观有强烈偏好，建议安排至少30%的行程在自然环境中，优先选择视野开阔、空气清新的户外空间。对天气条件较为敏感，需要准备室内备选方案。推荐日出日落时段的观景点。",

            culture: "对历史文化和人文传统有深度兴趣，喜欢了解当地的历史背景、传统工艺和民俗文化。建议安排博物馆、历史遗迹、文化街区等有教育意义的场所。重视文化知识的获得，偏好深度了解而非走马观花，喜欢与当地人文化交流。",

            food: "对当地美食文化有浓厚兴趣，愿意为了品尝特色料理而专门安排行程。建议每餐都安排当地特色，包括街头小吃、传统餐厅和现代创意料理。对餐厅环境和食物卖相有一定要求。美食预算可以适当提高，通过美食体验了解当地文化。",

            photography: "对视觉效果和拍照环境要求较高，偏好有设计感、色彩丰富或具有独特视角的场所。行程安排需要考虑最佳拍摄时间（光线条件），并预留足够时间进行摄影创作。每个景点需要额外15-30分钟拍摄时间，优先考虑光线条件好的时段，高度重视视觉效果和分享价值。",

            art: "对艺术和美学特别敏感，喜欢参观艺术展览、创意空间和设计场所。建议安排艺术类场馆、创意街区、设计商店等有艺术氛围的地点。重视文化内涵和美学体验。",

            adventure: "喜欢刺激和挑战性的体验，偏好户外活动和冒险项目。建议安排徒步、攀岩、极限运动等有挑战性的活动。对安全性有一定要求但乐于接受适度风险。"
        };

        const descriptions = interests.map(interest =>
            interestPrompts[interest] || `对${interest}有兴趣`
        );

        return `核心兴趣偏好：${descriptions.join(' ')}`;
    }

    /**
     * 生成预算水平AI指导
     */
    getBudgetPrompt() {
        const budget = this.profile.budgetLevel;
        if (!budget) return "";

        const budgetPrompts = {
            budget: "经济实惠预算水平：注重性价比，需要在有限预算内最大化体验价值。优先推荐免费或低价的高质量景点，如公园、免费博物馆、历史街区等。餐饮推荐当地性价比高的特色小吃和平价餐厅。交通建议多使用公共交通工具。挖掘免费但有特色的体验。",

            moderate: "适中舒适预算水平：平衡价格和体验质量，推荐主流的优质选择。在保证舒适度的前提下，选择性价比较好的住宿、餐饮和景点。可以适当安排一些收费但值得的特色体验。",

            comfort: "舒适便利预算水平：更注重舒适度和便利性，可以推荐较高档的住宿、餐厅和交通方式。优先选择服务质量好、环境舒适的场所，减少排队等待时间。",

            luxury: "豪华奢华预算水平：追求高端体验和独特服务，推荐奢华体验、高端服务、独特项目。可以安排私人导游、高端餐厅、奢华住宿等顶级体验。注重服务品质和独特性。"
        };

        return budgetPrompts[budget];
    }

    /**
     * 生成饮食限制AI指导
     */
    getDietaryPrompt() {
        const restrictions = this.profile.dietaryRestrictions || [];
        if (restrictions.length === 0) return "";

        const restrictionNames = {
            halal: "清真饮食",
            vegetarian: "素食主义",
            vegan: "纯素食",
            no_pork: "不吃猪肉",
            no_beef: "不吃牛肉",
            no_seafood: "不吃海鲜",
            no_spicy: "不吃辣",
            gluten_free: "无麸质",
            dairy_free: "无乳制品"
        };

        const restrictionList = restrictions.map(r => restrictionNames[r] || r).join('、');
        return `饮食限制：${restrictionList}。所有餐厅推荐必须严格遵守这些饮食限制。`;
    }

    /**
     * 生成交通偏好AI指导
     */
    getTransportPrompt() {
        const transports = this.profile.transportPreferences || [];
        if (transports.length === 0) return "";

        const transportPrompts = {
            public: "偏好公共交通：优先使用地铁、公交等公共交通工具，安排景点时重点考虑地铁/公交可达性。推荐公交一日票等优惠选择。",
            walking: "偏好步行探索：喜欢步行深度体验，景点间距离控制在合理范围（建议单次步行不超过20分钟），设计步行友好的路线。",
            bicycle: "偏好骑行游览：推荐自行车友好的路线和景点，安排共享单车方便的区域，避免过于拥堵的道路。",
            taxi: "偏好打车出行：可以安排相对灵活的路线，但要考虑打车成本和交通拥堵情况。",
            driving: "偏好自驾游览：可以安排停车方便的景点，考虑包含郊外和远一些的优质景点，提供停车信息。"
        };

        const descriptions = transports.map(t => transportPrompts[t] || `偏好${t}出行`);
        return descriptions.join(' ');
    }

    /**
     * 生成完整的个人档案AI画像
     */
    generateCompleteProfile() {
        const sections = [
            this.getMBTIBehaviorPrompt(),
            this.getCoreInterestsPrompt(),
            this.getBudgetPrompt(),
            this.getDietaryPrompt(),
            this.getTransportPrompt()
        ].filter(section => section.length > 0);

        return sections.join('\n\n');
    }
}

/**
 * 行程偏好AI解析器  
 * 将用户的本次行程偏好转换为AI可理解的具体指导
 */
export class TripPreferencesInterpreter {
    constructor(preferences) {
        this.preferences = preferences;
    }

    /**
     * 生成旅行目的AI指导
     */
    getTripPurposePrompt() {
        const purpose = this.preferences.tripPurpose;
        if (!purpose) return "";

        const purposePrompts = {
            leisure: "休闲度假目的：这是一次以放松身心为主的旅行，行程节奏应相对轻松，多安排休息时间和舒适的场所。避免过于紧密的时间安排，优先推荐能够让人放松的环境和体验。",

            exploration: "探索发现目的：这是一次以发现新事物为主的旅行，应该安排多样化的体验，包含一些小众但有特色的景点。鼓励尝试当地独特的文化、美食和活动。",

            celebration: "庆祝纪念目的：这是一次具有特殊意义的庆祝性旅行，需要营造温馨浪漫的氛围。优先推荐有纪念价值的景点、适合拍照留念的场所，以及能够提供特殊服务（如庆祝套餐、纪念品）的餐厅。行程节奏应相对轻松，留出享受美好时光的空间。",

            business: "商务顺游目的：这是商务差旅的间隙游览，时间相对有限且可能存在变动。优先推荐交通便利、时间灵活的景点，避免需要长时间投入的项目。重点关注高效率的经典体验，以及适合商务人士的餐饮和休息场所。",

            family: "家庭聚会目的：这是多代人共同出行的家庭旅游，需要考虑不同年龄层的需求和体力。优先推荐家庭友好的景点，有儿童设施和老人休息区。行程安排要考虑用餐时间、休息频率，避免过于劳累的项目。"
        };

        return purposePrompts[purpose] || "";
    }

    /**
     * 生成体验重点AI指导
     */
    getFocusAreasPrompt() {
        const areas = this.preferences.focusAreas || [];
        if (areas.length === 0) return "";

        const areaPrompts = {
            historical_culture: "重点体验历史文化：深入安排历史文化类景点，包含历史背景介绍和文化故事。推荐博物馆、古迹、文化街区。",
            natural_scenery: "重点体验自然风光：优先安排自然景观，考虑最佳观赏时间和天气条件。推荐公园、山景、水景等自然环境。",
            local_cuisine: "重点体验地道美食：每餐都精心推荐当地特色，包含街头小吃、传统餐厅和特色料理。提供美食文化背景介绍。",
            urban_lifestyle: "重点体验都市生活：推荐能体现当地现代都市生活的场所，如商业区、文创园区、现代建筑等。",
            art_culture: "重点体验艺术文化：安排艺术展览、创意空间、设计商店等有艺术氛围的场所。",
            photo_spots: "重点网红打卡：优先推荐视觉效果好、适合拍照的景点，考虑光线条件和拍摄角度。",
            shopping: "重点购物休闲：安排购物中心、特色市场、纪念品店等购物场所。",
            outdoor_adventure: "重点户外探险：安排户外活动和冒险体验项目。"
        };

        const descriptions = areas.map(area => areaPrompts[area] || `重点体验${area}`);
        return `本次旅行体验重点：${descriptions.join(' ')}`;
    }

    /**
     * 生成行程节奏AI指导
     */
    getPacePrompt() {
        const pace = this.preferences.pacePreference;
        if (!pace) return "";

        const pacePrompts = {
            slow: "慢悠悠节奏：采用深度体验的慢节奏安排，每天2-3个主要景点，在每个地方留出充足的时间深度体验和休息。避免匆忙赶路，重视体验质量而非数量。",
            balanced: "刚刚好节奏：采用平衡的行程节奏，每天3-4个景点，在充实安排和适度休息之间找到平衡。既不会太赶也不会太松散。",
            intensive: "充实满满节奏：采用紧凑高效的行程安排，每天4-5个景点，最大化利用时间。确保交通连接顺畅，减少无效时间消耗。"
        };

        return pacePrompts[pace] || "";
    }

    /**
     * 生成社交偏好AI指导
     */
    getSocialPrompt() {
        const social = this.preferences.socialPreference;
        if (!social) return "";

        const socialPrompts = {
            quiet: "偏好安静私密：优先推荐人流较少的景点和时段，避开过于热闹和拥挤的场所。选择相对安静、私密的环境，让旅行者能够静心体验。",
            mixed: "偏好均衡体验：在热闹和安静之间保持平衡，既安排一些热门的热闹景点，也包含一些相对安静的私密场所，提供多样化的氛围体验。",
            lively: "偏好热闹有趣：优先推荐热门景点和热闹的场所，包含有社交互动机会的活动。选择氛围活跃、人气较高的地方。"
        };

        return socialPrompts[social] || "";
    }

    /**
     * 生成拍照需求AI指导
     */
    getPhotoPrompt() {
        const photo = this.preferences.photoPreference;
        if (!photo) return "";

        const photoPrompts = {
            minimal: "随手记录拍照：按正常行程安排，不需要特别考虑拍照因素。偶尔提及值得拍照的角度即可。",
            casual: "适度拍照需求：在景点推荐中适当提及拍照角度和最佳时间，但不作为主要考虑因素。",
            essential: "拍照很重要：高度重视拍照效果，优先推荐视觉效果好、上镜的景点。考虑光线条件，建议最佳拍摄时间，每个景点预留额外的拍摄时间。提供拍摄角度和构图建议。"
        };

        return photoPrompts[photo] || "";
    }

    /**
     * 生成临时特殊需求AI指导
     */
    getTemporaryNeedsPrompt() {
        const needs = this.preferences.temporaryNeeds || [];
        if (needs.length === 0) return "";

        const needsPrompts = {
            hasChildren: "同行有小孩：所有推荐场所必须考虑儿童友好性。包括：安全的环境、适合儿童的设施、不过长的步行距离、有趣的互动体验。餐厅需要有儿童座椅和适合儿童的菜品。行程安排需要考虑儿童的作息时间和注意力持续时间。单个景点停留时间不宜过长（建议1-2小时）。",

            hasElderly: "同行有老人：需要特别考虑老人的体力和舒适度。推荐有休息设施的景点，避免需要大量步行或爬楼梯的地方。安排充足的休息时间，选择交通便利的景点。",

            limitedMobility: "行动不便：所有推荐必须确保无障碍通道和设施。包括轮椅可达的景点、有电梯的建筑、无障碍洗手间等。避免需要大量步行或爬楼梯的景点。餐厅和住宿也需要无障碍设施。",

            budgetTight: "预算紧张：这次旅行预算比平时更加有限，需要在有限预算内最大化体验价值。优先推荐免费或低价的高质量景点，如公园、免费博物馆、历史街区等。餐饮推荐当地性价比高的特色小吃和平价餐厅。",

            timeFlexible: "时间充裕：时间比较宽松，可以安排更多深度体验和一些相对小众但有特色的景点。不用特别考虑时间效率，可以慢慢品味每个地方。",

            weatherConcern: "担心天气：天气可能不稳定，需要准备多种方案。每天的行程安排室内外结合，提供天气不好时的室内备选方案。推荐有室内空间的场所。"
        };

        const descriptions = needs.map(need => needsPrompts[need] || `特殊需求：${need}`);
        return `本次旅行特殊需求：${descriptions.join(' ')}`;
    }

    /**
     * 生成完整的行程偏好AI指导
     */
    generateCompletePreferences() {
        const sections = [
            this.getTripPurposePrompt(),
            this.getFocusAreasPrompt(),
            this.getPacePrompt(),
            this.getSocialPrompt(),
            this.getPhotoPrompt(),
            this.getTemporaryNeedsPrompt()
        ].filter(section => section.length > 0);

        return sections.join('\n\n');
    }
}

/**
 * 智能预填引擎
 * 根据个人档案智能预填行程偏好
 */
export class SmartPrefillEngine {
    constructor(personalProfile) {
        this.profile = personalProfile;
    }

    /**
     * 根据MBTI类型预填社交和节奏偏好
     */
    getSmartDefaults() {
        const defaults = {
            socialPreference: 'mixed',
            pacePreference: 'balanced',
            photoPreference: 'casual',
            focusAreas: []
        };

        // 根据MBTI预设社交偏好
        if (this.profile.mbtiType) {
            const mbtiType = this.profile.mbtiType;
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

        // 根据核心兴趣映射体验重点
        if (this.profile.coreInterests?.length > 0) {
            const interestToFocusMapping = {
                'nature': 'natural_scenery',
                'culture': 'historical_culture',
                'food': 'local_cuisine',
                'photography': 'photo_spots',
                'art': 'art_culture',
                'adventure': 'outdoor_adventure'
            };

            this.profile.coreInterests.forEach(interest => {
                const focusArea = interestToFocusMapping[interest];
                if (focusArea && !defaults.focusAreas.includes(focusArea)) {
                    defaults.focusAreas.push(focusArea);
                }
            });

            // 如果包含摄影兴趣，提升拍照需求
            if (this.profile.coreInterests.includes('photography')) {
                defaults.photoPreference = 'essential';
            }
        }

        return defaults;
    }

    /**
     * 生成预填说明
     */
    getPreFillExplanation() {
        const explanations = [];

        if (this.profile.mbtiType) {
            const mbtiOption = PERSONAL_PROFILE_OPTIONS.mbtiTypes.options[this.profile.mbtiType];
            if (mbtiOption) {
                explanations.push(`基于您的${mbtiOption.name}性格，为您推荐了${mbtiOption.travelStyle}`);
            }
        }

        if (this.profile.coreInterests?.length > 0) {
            const interestNames = this.profile.coreInterests.map(interest => {
                const option = PERSONAL_PROFILE_OPTIONS.coreInterests.options[interest];
                return option?option.name : interest;
            });
            explanations.push(`根据您对${interestNames.join('、')}的兴趣，为您预选了相关体验重点`);
        }

        return explanations.length > 0 ?
            `💡 智能预填提示：${explanations.join('；')}。您可以根据这次旅行的具体情况进行调整。` :
            '';
    }
}

/**
 * 完整的AI提示词生成器
 * 整合个人档案和行程偏好，生成最终的AI提示词
 */
export class CompletePromptGenerator {
    constructor(personalProfile, tripPreferences, tripContext) {
        this.profileInterpreter = new PersonalProfileInterpreter(personalProfile);
        this.preferencesInterpreter = new TripPreferencesInterpreter(tripPreferences);
        this.tripContext = tripContext;
    }

    /**
     * 生成完整的AI旅行规划提示词
     */
    generateCompletePrompt() {
            const travelerProfile = this.profileInterpreter.generateCompleteProfile();
            const tripPreferences = this.preferencesInterpreter.generateCompletePreferences();

            const prompt = `# 🌟 个性化旅行规划助手

## 👤 旅行者画像分析
${travelerProfile || '暂无个人档案信息'}

## ✈️ 本次行程偏好
${tripPreferences || '暂无特殊偏好'}

## 📍 行程基本信息
- 目的地：${this.tripContext.destination || this.tripContext.destinationName || '待定'}
- 旅行天数：${this.tripContext.days || this.tripContext.duration || '待定'}天
- 出发时间：${this.tripContext.dateRange?(Array.isArray(this.tripContext.dateRange)?`${this.tripContext.dateRange[0]} 至 ${this.tripContext.dateRange[1]}` : this.tripContext.dateRange) : (this.tripContext.startDate || '待定')}

## 🎯 AI规划任务
请基于以上旅行者画像和偏好信息，为这位旅行者规划一份详细的个性化行程。请注意：

### 规划原则：
1. **个性匹配**：严格按照旅行者的性格特征和兴趣偏好进行推荐
2. **偏好优先**：重点体现本次行程的特定偏好和体验重点  
3. **实用可行**：提供具体可操作的建议，包含时间、地点、交通方式
4. **预算合理**：推荐内容符合旅行者的预算水平
5. **限制遵守**：严格遵守所有饮食限制和特殊需求

### 请提供：
- **每日详细行程**：包含景点、餐厅、交通路线
- **个性化解释**：说明为什么这样推荐（基于旅行者特征）
- **实用信息**：开放时间、预约需求、预估费用
- **贴心提示**：基于个人偏好的特别建议
- **备选方案**：应对天气或突发情况的Plan B

### 输出格式：
请以JSON格式输出，包含每日行程、预算估算、个性化建议等完整信息。`;

        return prompt;
    }

    /**
     * 生成用户友好的AI解读
     */
    generateUserFriendlyExplanation() {
        const explanations = [];

        // 解释AI如何理解用户的个人档案
        if (this.profileInterpreter.profile.mbtiType) {
            const mbtiOption = PERSONAL_PROFILE_OPTIONS.mbtiTypes.options[this.profileInterpreter.profile.mbtiType];
            explanations.push(`📋 基于您的${mbtiOption.name}性格，AI会${mbtiOption.travelStyle}`);
        }

        // 解释AI如何理解用户的行程偏好
        if (this.preferencesInterpreter.preferences.tripPurpose) {
            const purposeOption = TRIP_PREFERENCES_OPTIONS.tripPurpose.options[this.preferencesInterpreter.preferences.tripPurpose];
            explanations.push(`🎯 针对您的${purposeOption.name}目的，AI会${purposeOption.aiStrategy}`);
        }

        return explanations.join('\n');
    }
}

/**
 * 🎯 完整的AI提示词生成器 - 从tagMapping.js迁移
 * 将用户偏好转换为完整的AI指导文档
 */
export class AdvancedPromptGenerator {
    constructor(userPreferences, tripContext) {
        this.userPreferences = userPreferences;
        this.tripContext = tripContext;
    }

    /**
     * 生成完整的AI提示词结构
     */
    generateAIPrompt() {
        const prompt = {
            // 用户画像总结
            travelerProfile: this.generateTravelerProfile(),

            // 核心需求和约束
            coreRequirements: this.generateCoreRequirements(),

            // 详细的偏好指导
            detailedGuidance: this.generateDetailedGuidance(),

            // 特殊注意事项
            specialConsiderations: this.generateSpecialConsiderations(),

            // 推荐策略
            recommendationStrategy: this.generateRecommendationStrategy()
        };

        return prompt;
    }

    /**
     * 生成旅行者画像总结
     */
    generateTravelerProfile() {
        let profile = [];
        const preferences = this.userPreferences;

        // MBTI性格解读
        if (preferences.mbtiType) {
            const mbtiInterpreter = new PersonalProfileInterpreter({ mbtiType: preferences.mbtiType });
            const mbtiPrompt = mbtiInterpreter.getMBTIBehaviorPrompt();
            profile.push(`性格特征: ${mbtiPrompt}`);
        }

        // 核心兴趣解读
        if (preferences.coreInterests?.length > 0) {
            const interpreter = new PersonalProfileInterpreter({ coreInterests: preferences.coreInterests });
            const interestPrompt = interpreter.getCoreInterestsPrompt();
            profile.push(`核心兴趣: ${interestPrompt}`);
        }

        // 预算和消费水平
        if (preferences.budget) {
            profile.push(`预算水平: ${preferences.budget}，需要在此预算范围内提供最优化的体验建议`);
        }

        return profile.join('\n');
    }

    /**
     * 生成核心需求和约束
     */
    generateCoreRequirements() {
        const requirements = [];
        const tripContext = this.tripContext;

        // 时间和地点约束
        if (tripContext.destination || tripContext.destinationName) {
            requirements.push(`目的地: ${tripContext.destination || tripContext.destinationName}`);
        }
        if (tripContext.days || tripContext.duration) {
            requirements.push(`旅行时长: ${tripContext.days || tripContext.duration}天`);
        }

        // 处理日期范围
        let dateInfo = '待定';
        if (tripContext.dateRange && Array.isArray(tripContext.dateRange) && tripContext.dateRange.length === 2) {
            dateInfo = `${tripContext.dateRange[0]} 至 ${tripContext.dateRange[1]}`;
        } else if (tripContext.startDate) {
            dateInfo = tripContext.startDate;
        }
        requirements.push(`出行时间: ${dateInfo}`);

        return requirements.join('\n');
    }

    /**
     * 生成详细偏好指导
     */
    generateDetailedGuidance() {
        const guidance = {
            景点选择: [],
            餐饮安排: [],
            交通方式: [],
            时间分配: [],
            体验重点: []
        };

        const preferences = this.userPreferences;

        // 根据兴趣生成景点选择指导
        if (preferences.coreInterests?.includes('nature')) {
            guidance.景点选择.push("至少30%的行程安排在自然环境中，优先选择视野开阔的户外空间");
            guidance.时间分配.push("自然景点建议安排在光线条件最佳的时段");
        }

        if (preferences.coreInterests?.includes('photography')) {
            guidance.景点选择.push("重视视觉效果和拍照环境，优先选择有设计感或独特视角的场所");
            guidance.时间分配.push("每个景点预留额外15-30分钟拍摄时间");
        }

        if (preferences.coreInterests?.includes('food')) {
            guidance.餐饮安排.push("每餐都安排当地特色，包括街头小吃、传统餐厅和创意料理");
            guidance.体验重点.push("通过美食体验了解当地文化");
        }

        return Object.entries(guidance)
            .filter(([, items]) => items.length > 0)
            .map(([category, items]) => `${category}: ${items.join('；')}`)
            .join('\n');
    }

    /**
     * 生成特殊注意事项
     */
    generateSpecialConsiderations() {
        const considerations = [];
        const preferences = this.userPreferences;

        // 饮食禁忌
        if (preferences.dietaryRestrictions?.length > 0) {
            considerations.push(`饮食禁忌: ${preferences.dietaryRestrictions.join('、')}`);
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
    generateRecommendationStrategy() {
        const strategies = [];
        const preferences = this.userPreferences;
        const tripContext = this.tripContext;

        // 基于MBTI的推荐策略
        if (preferences.mbtiType) {
            const mbtiInterpreter = new PersonalProfileInterpreter({ mbtiType: preferences.mbtiType });
            const mbtiPrompt = mbtiInterpreter.getMBTIBehaviorPrompt();
            strategies.push(`推荐策略: ${mbtiPrompt}`);
        }

        // 基于行程目的的策略调整
        if (tripContext.tripPurpose === 'celebration') {
            strategies.push("重点创造温馨难忘的回忆，优先推荐有纪念价值和拍照效果的场所");
        } else if (tripContext.tripPurpose === 'business') {
            strategies.push("以高效便利为原则，推荐交通便利的经典必游景点");
        }

        return strategies.join('\n');
    }

    /**
     * 生成最终的完整AI提示词
     */
    generateCompletePrompt() {
        const promptStructure = this.generateAIPrompt();

        return `# 旅行规划AI助手指令

## 用户画像
${promptStructure.travelerProfile}

## 核心需求
${promptStructure.coreRequirements}

## 详细指导
${promptStructure.detailedGuidance}

## 特殊注意事项
${promptStructure.specialConsiderations}

## 推荐策略
${promptStructure.recommendationStrategy}

请基于以上信息，为用户生成个性化的旅行推荐。确保推荐内容符合用户的性格特征、兴趣偏好和实际约束条件。`;
    }
}

/**
 * 🏷️ MBTI相关工具函数 - 从tagMapping.js迁移
 */
export function getMbtiName(type) {
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

export function getMbtiTravelDescription(type) {
    const descriptions = {
        INTJ: "理性规划，深度体验 - 偏好精心规划的深度游，避开拥挤景点，喜欢探索有历史底蕴和设计感的地点",
        INTP: "独立思考，探索新知 - 思维敏捷，喜欢独立思考和探索新事物，对文化交流和艺术展览感兴趣",
        ENTJ: "领导决断，挑战竞争 - 具有领导力和决断力，喜欢挑战和竞争，偏爱极限运动和热门景点",
        ENTP: "充满好奇，喜欢交流 - 充满好奇心，喜欢交流，对文化体验、美食探索和新奇事物感兴趣",
        INFJ: "深度体验，追求意义 - 喜欢有深度和意义的旅行体验，偏好小众而有特色的目的地",
        INFP: "个性化体验，情感连接 - 注重个人感受和情感连接，喜欢能够激发内心共鸣的旅行体验",
        ENFJ: "关注他人，社交体验 - 善于照顾他人需求，喜欢能够与当地人交流互动的社交型旅行",
        ENFP: "活力四射，多样体验 - 热爱新奇体验和多样化活动，喜欢充满惊喜和变化的旅行安排",
        ISTJ: "稳妥计划，经典路线 - 偏好稳妥可靠的计划，喜欢经典的旅游路线和成熟的旅游设施",
        ISFJ: "贴心周到，舒适安全 - 注重旅行的舒适性和安全性，喜欢温馨而贴心的旅行安排",
        ESTJ: "高效组织，目标明确 - 追求高效和有组织的旅行，喜欢目标明确的行程安排",
        ESFJ: "团体和谐，分享快乐 - 重视团体和谐，喜欢与他人分享旅行的快乐和美好时光",
        ISTP: "灵活自由，实用体验 - 喜欢灵活自由的旅行方式，偏好实用性强的旅行体验",
        ISFP: "温和体验，美学追求 - 注重美学体验，喜欢温和而富有艺术气息的旅行环境",
        ESTP: "冒险刺激，即时享受 - 喜欢冒险刺激的活动，追求即时的快乐和新鲜体验",
        ESFP: "热情开朗，享受当下 - 热情开朗，喜欢享受当下的快乐，偏好轻松愉快的旅行氛围"
    };
    return descriptions[type] || "您的旅行偏好将基于您的MBTI类型和预算来定制。";
}

/**
 * 便捷函数 - 直接生成AI提示词
 */
export function generateAIPrompt(userPreferences, tripContext) {
    const generator = new AdvancedPromptGenerator(userPreferences, tripContext);
    return generator.generateAIPrompt();
}

export function generateCompletePrompt(userPreferences, tripContext) {
    const generator = new AdvancedPromptGenerator(userPreferences, tripContext);
    return generator.generateCompletePrompt();
}

export default {
    PersonalProfileInterpreter,
    TripPreferencesInterpreter,
    SmartPrefillEngine,
    CompletePromptGenerator,
    AdvancedPromptGenerator,
    generateAIPrompt,
    generateCompletePrompt,
    getMbtiName,
    getMbtiTravelDescription
};