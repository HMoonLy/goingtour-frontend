/**
 * AI 数据解析器
 */
import { PERSONAL_PROFILE_OPTIONS, TRIP_PREFERENCES_OPTIONS } from '../constants/options';

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

export default {
    PersonalProfileInterpreter,
    TripPreferencesInterpreter
};

