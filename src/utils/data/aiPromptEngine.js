/**
 * 🤖 AI提示词转换引擎 - 核心智能 (Re-export)
 * 
 * 这是一个 Barrel File，用于导出拆分后的模块，保持向后兼容性。
 * 新的逻辑位于 src/utils/travel/ai/ 目录下。
 */

import interpreters from '../travel/ai/interpreters';
import generators from '../travel/ai/generators';
import prefill from '../travel/ai/prefill';
import legacy from '../travel/ai/legacy';
import { getOptionDisplayName } from '../travel/formatters/index'; // Helper needed for exports
import { PERSONAL_PROFILE_OPTIONS } from '../travel/constants/options'; // Helper needed for exports

// 导出类
export const { PersonalProfileInterpreter, TripPreferencesInterpreter } = interpreters;
export const { SmartPrefillEngine } = prefill;
export const { CompletePromptGenerator } = legacy;
export const { AdvancedPromptGenerator, generateAIPrompt, generateCompletePrompt } = generators;

// 导出 MBTI 辅助函数 (原文件中定义的)
export function getMbtiName(type) {
    return getOptionDisplayName('mbtiTypes', type);
}

export function getMbtiTravelDescription(type) {
    const option = PERSONAL_PROFILE_OPTIONS.mbtiTypes.options[type];
    return option?.travelStyle || "您的旅行偏好将基于您的MBTI类型和预算来定制。";
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
