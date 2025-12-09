/**
 * 验证逻辑
 */
import { PERSONAL_PROFILE_OPTIONS, TRIP_PREFERENCES_OPTIONS } from '../constants/options';

export function validateSelections(category, selections) {
    const categories = { ...PERSONAL_PROFILE_OPTIONS, ...TRIP_PREFERENCES_OPTIONS };
    const categoryData = categories[category];
    if (!categoryData) return { valid: true };
    if (categoryData.maxSelections && selections.length > categoryData.maxSelections) {
        return { valid: false, message: `最多只能选择${categoryData.maxSelections}个选项` };
    }
    return { valid: true };
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
 * 🔍 Complex Validator: 包含 TripGeneration.vue 中的复杂业务规则
 */
export function validateTripGenerationRules(baseForm, preferenceForm, userPreferences, selectedPreferenceTags) {
    const errors = [];
    const warnings = [];

    if (!baseForm || !preferenceForm) {
        return { isValid: false, errors: [], warnings: [] };
    }

    // 检查基础信息
    const travelers = baseForm.travelers;
    const prefForm = preferenceForm;
    const days = baseForm.days;
    const budget = baseForm.budget;

    // 获取实际的标签数据（可能是英文或中文）
    const rawTags = userPreferences?.selectedTags || userPreferences?.tags || [];
    const chineseTags = selectedPreferenceTags || [];

    // 定义标签检查函数（同时检查英文和中文标签）
    const hasTag = (englishTag, chineseTag) => {
        return (
            rawTags.includes(englishTag) ||
            rawTags.includes(chineseTag) ||
            chineseTags.includes(chineseTag)
        );
    };

    // 1. 严重错误检查（阻止生成）
    if (prefForm.tripGoals && Array.isArray(prefForm.tripGoals)) {
        if (prefForm.tripGoals.includes("family") && travelers < 3) {
            errors.push({
                type: "mismatch",
                message: "家庭亲子游通常需要至少3人（包含大人和小孩）",
                suggestion: "调整人数为3人或以上，或选择其他行程目标",
                allowIgnore: true,
            });
        }
        if (prefForm.tripGoals.includes("romantic") && travelers !== 2) {
            errors.push({
                type: "mismatch",
                message: "情侣蜜月游适合2人出行，当前设置不匹配",
                suggestion: "调整人数为2人，或选择其他行程目标",
                allowIgnore: true,
            });
        }
        if (prefForm.tripGoals.includes("solo") && travelers > 1) {
            errors.push({
                type: "mismatch",
                message: "个人独旅是一个人的旅行体验",
                suggestion: '调整人数为1人，或选择"朋友聚会游"等其他目标',
                allowIgnore: false,
            });
        }
    }

    // 2. 检查传统标签与人数匹配（向后兼容，但不强制）
    if (hasTag("family", "亲子出游") && travelers < 3) {
        warnings.push({
            type: "legacy_mismatch",
            message: '用户偏好标签"亲子出游"与人数不匹配',
            suggestion: "建议至少3人出行，或调整个人偏好设置",
            allowIgnore: true,
        });
    }

    // 6. 预算合理性检查
    if (budget && days && travelers) {
        const budgetMatch = budget.match(/(\d+)/g);
        if (budgetMatch && budgetMatch.length > 0) {
            const avgBudget = parseInt(budgetMatch[0]);
            const perPersonPerDay = avgBudget / (days * travelers);

            if (perPersonPerDay < 200) {
                warnings.push({
                    type: "budget",
                    message: `人均每日预算约${Math.round(perPersonPerDay)}元，可能偏低`,
                    suggestion: "建议适当增加预算或调整行程期望，确保旅行体验质量",
                    allowIgnore: true,
                });
            } else if (perPersonPerDay > 2000) {
                warnings.push({
                    type: "budget",
                    message: `人均每日预算约${Math.round(perPersonPerDay)}元，属于高端旅行`,
                    suggestion: "AI将为您推荐高品质的景点、餐厅和体验项目",
                    allowIgnore: true,
                });
            }
        }
    } else if (days > 7 && !budget) {
        warnings.push({
            type: "budget",
            message: "长途旅行建议设置预算范围",
            suggestion: "设置预算有助于AI推荐更符合您消费水平的景点和餐厅",
            allowIgnore: true,
        });
    }

    // 7. 体验类型冲突检查（更清晰的说明）
    if (prefForm.focusAreas && Array.isArray(prefForm.focusAreas)) {
        const hasNature = prefForm.focusAreas.some((area) =>
            ["natural_scenery", "outdoor_adventure"].includes(area)
        );
        const hasUrban = prefForm.focusAreas.some((area) =>
            ["urban_lifestyle", "shopping", "nightlife"].includes(area)
        );

        if (hasNature && hasUrban && days < 5) {
            warnings.push({
                type: "experience_conflict",
                message: "您同时选择了自然风光和城市体验",
                suggestion: `${days}天行程建议重点选择一种：自然风光（山水景观、户外活动）或城市体验（购物、夜生活、都市文化）`,
                allowIgnore: true,
            });
        }
    }

    // 8. 其他建议性检查
    if (prefForm.pacePreference && days) {
        if (prefForm.pacePreference === "fast" && days > 10) {
            warnings.push({
                type: "pace_mismatch",
                message: "长途旅行选择紧凑节奏可能比较辛苦",
                suggestion: '建议选择"平衡型"节奏，既能多看景点又有充分休息',
                allowIgnore: true,
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}

export default {
    validateSelections,
    validateTripState,
    validateTripGenerationRules
};

