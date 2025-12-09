/**
 * 格式化和翻译工具
 */

import { PERSONAL_PROFILE_OPTIONS, TRIP_PREFERENCES_OPTIONS } from '../constants/options';

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

/**
 * 🏷️ 辅助: 获取预算的完整描述文本
 * 用于将 budget key (如 'moderate') 转换为 '适中舒适 (300-500元/天)'
 */
export function getFullBudgetText(budgetKey) {
    if (!budgetKey) return '';
    const option = PERSONAL_PROFILE_OPTIONS.budgetLevel.options[budgetKey];
    return option ? `${option.name} (${option.range})` : budgetKey;
}

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

export default {
    getOptionDisplayName,
    getOptionDescription,
    getFullBudgetText,
    getBudgetText,
    getCityName,
    translateTag,
    translateTags,
    translateTagsToString,
    smartTranslateTag
};

