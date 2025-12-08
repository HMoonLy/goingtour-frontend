/**
 * 🤖 AI提示词转换引擎 - 核心智能
 * 将用户友好的选择转换为AI可理解的详细指导
 */

import { 
    PERSONAL_PROFILE_OPTIONS, 
    TRIP_PREFERENCES_OPTIONS,
    getOptionDisplayName 
} from './travelDataSystem.js';

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

        const option = PERSONAL_PROFILE_OPTIONS.mbtiTypes.options[mbtiType];
        return option?.aiPrompt || `${mbtiType}类型旅行者的个性化推荐`;
    }

    /**
     * 生成核心兴趣的AI指导
     */
    getCoreInterestsPrompt() {
        const interests = this.profile.coreInterests || [];
        if (interests.length === 0) return "";

        const descriptions = interests.map(interest => {
            const option = PERSONAL_PROFILE_OPTIONS.coreInterests.options[interest];
            return option?.aiPrompt || `对${interest}有兴趣`;
        });

        return `核心兴趣偏好：${descriptions.join(' ')}`;
    }

    /**
     * 生成预算水平AI指导
     */
    getBudgetPrompt() {
        const budget = this.profile.budgetLevel;
        if (!budget) return "";

        const option = PERSONAL_PROFILE_OPTIONS.budgetLevel.options[budget];
        return option?.aiPrompt || "";
    }

    /**
     * 生成饮食限制AI指导
     */
    getDietaryPrompt() {
        const restrictions = this.profile.dietaryRestrictions || [];
        if (restrictions.length === 0) return "";

        const restrictionList = restrictions.map(r => {
            const option = PERSONAL_PROFILE_OPTIONS.dietaryRestrictions.options[r];
            return option?.name || r;
        }).join('、');
        
        return `饮食限制：${restrictionList}。所有餐厅推荐必须严格遵守这些饮食限制。`;
    }

    /**
     * 生成交通偏好AI指导
     */
    getTransportPrompt() {
        const transports = this.profile.transportPreferences || [];
        if (transports.length === 0) return "";

        const descriptions = transports.map(t => {
            const option = PERSONAL_PROFILE_OPTIONS.transportPreferences.options[t];
            return option?.aiPrompt || `偏好${t}出行`;
        });
        
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

        const option = TRIP_PREFERENCES_OPTIONS.tripPurpose.options[purpose];
        return option?.aiPrompt || "";
    }

    /**
     * 生成体验重点AI指导
     */
    getFocusAreasPrompt() {
        const areas = this.preferences.focusAreas || [];
        if (areas.length === 0) return "";

        const descriptions = areas.map(area => {
            const option = TRIP_PREFERENCES_OPTIONS.focusAreas.options[area];
            return option?.aiPrompt || `重点体验${area}`;
        });
        
        return `本次旅行体验重点：${descriptions.join(' ')}`;
    }

    /**
     * 生成行程节奏AI指导
     */
    getPacePrompt() {
        const pace = this.preferences.pacePreference;
        if (!pace) return "";

        const option = TRIP_PREFERENCES_OPTIONS.pacePreference.options[pace];
        return option?.aiPrompt || "";
    }

    /**
     * 生成社交偏好AI指导
     */
    getSocialPrompt() {
        const social = this.preferences.socialPreference;
        if (!social) return "";

        const option = TRIP_PREFERENCES_OPTIONS.socialPreference.options[social];
        return option?.aiPrompt || "";
    }

    /**
     * 生成拍照需求AI指导
     */
    getPhotoPrompt() {
        const photo = this.preferences.photoPreference;
        if (!photo) return "";

        const option = TRIP_PREFERENCES_OPTIONS.photoPreference.options[photo];
        return option?.aiPrompt || "";
    }

    /**
     * 生成临时特殊需求AI指导
     */
    getTemporaryNeedsPrompt() {
        const needs = this.preferences.temporaryNeeds || [];
        if (needs.length === 0) return "";

        const descriptions = needs.map(need => {
            const option = TRIP_PREFERENCES_OPTIONS.temporaryNeeds.options[need];
            return option?.aiPrompt || `特殊需求：${need}`;
        });

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
                // travelStyle is used here. It was available in old travelDataSystem.js too.
                explanations.push(`基于您的${mbtiOption.name}性格，为您推荐了${mbtiOption.travelStyle}`);
            }
        }

        if (this.profile.coreInterests?.length > 0) {
            const interestNames = this.profile.coreInterests.map(interest => {
                const option = PERSONAL_PROFILE_OPTIONS.coreInterests.options[interest];
                return option ? option.name : interest;
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
- 出发时间：${this.tripContext.dateRange ? (Array.isArray(this.tripContext.dateRange) ? `${this.tripContext.dateRange[0]} 至 ${this.tripContext.dateRange[1]}` : this.tripContext.dateRange) : (this.tripContext.startDate || '待定')}

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
            if (mbtiOption && mbtiOption.travelStyle) {
                explanations.push(`📋 基于您的${mbtiOption.name}性格，AI会${mbtiOption.travelStyle}`);
            }
        }

        // 解释AI如何理解用户的行程偏好
        if (this.preferencesInterpreter.preferences.tripPurpose) {
            const purposeOption = TRIP_PREFERENCES_OPTIONS.tripPurpose.options[this.preferencesInterpreter.preferences.tripPurpose];
            if (purposeOption && purposeOption.aiStrategy) {
                explanations.push(`🎯 针对您的${purposeOption.name}目的，AI会${purposeOption.aiStrategy}`);
            }
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
            const interpreter = new PersonalProfileInterpreter({ dietaryRestrictions: preferences.dietaryRestrictions });
            considerations.push(interpreter.getDietaryPrompt());
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
    return getOptionDisplayName('mbtiTypes', type);
}

export function getMbtiTravelDescription(type) {
    const option = PERSONAL_PROFILE_OPTIONS.mbtiTypes.options[type];
    return option?.travelStyle || "您的旅行偏好将基于您的MBTI类型和预算来定制。";
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
