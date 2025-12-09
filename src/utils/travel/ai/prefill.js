/**
 * 智能预填引擎
 * 根据个人档案智能预填行程偏好
 */
import { PERSONAL_PROFILE_OPTIONS } from '../constants/options';

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

export default {
    SmartPrefillEngine
};

