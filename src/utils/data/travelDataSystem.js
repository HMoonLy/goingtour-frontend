/**
 * 🌟 GoingTour 旅行偏好管理系统 - Unified Data System (Re-export)
 * 
 * 这是一个 Barrel File，用于导出拆分后的模块，保持向后兼容性。
 * 新的逻辑位于 src/utils/travel/ 目录下。
 */

import options from '../travel/constants/options';
import formatters from '../travel/formatters/index';
import state from '../travel/core/state';
import validator from '../travel/core/validator';

// 导出常量
export const { PERSONAL_PROFILE_OPTIONS, TRIP_PREFERENCES_OPTIONS } = options;

// 导出格式化工具
export const {
    getOptionDisplayName,
    getOptionDescription,
    getFullBudgetText,
    getBudgetText,
    getCityName,
    translateTag,
    translateTags,
    translateTagsToString,
    smartTranslateTag
} = formatters;

// 导出状态工厂和转换器
export const { createInitialTripState, transformToBackendDTO } = state;

// 导出验证器
export const { validateSelections, validateTripState, validateTripGenerationRules } = validator;

// 默认导出整合对象
export default {
    ...options,
    ...formatters,
    ...state,
    ...validator
};
