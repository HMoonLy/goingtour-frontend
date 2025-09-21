/**
 * 统一的偏好管理Store
 * 用于更好地集成用户偏好和行程偏好设置
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useUserStore } from "./user.js";

export const usePreferenceStore = defineStore("preference", () => {
    // 用户Store引用
    const userStore = useUserStore();

    // 当前行程偏好表单数据
    const tripPreferenceForm = ref({
        tripGoals: [],
        focusAreas: [],
        pacePreference: "",
        socialPreference: "",
        photoPreference: "",
        temporaryDietaryRestrictions: [], // 临时饮食限制
        hasChildren: false, // 带有小孩
        hasElderly: false, // 带有老人
        needAccessibility: false, // 需要无障碍设施
        budgetConstraint: false, // 预算紧张
        specialRequirements: "", // 特殊请求
    });

    // 是否从草稿加载的标识
    const isFromDraft = ref(false);

    // 计算属性：获取合并后的偏好数据（用户偏好 + 行程偏好）
    const mergedPreferences = computed(() => {
        const userPrefs = userStore.userPreferences || {};
        const tripPrefs = tripPreferenceForm.value;

        // 如果是从草稿加载，优先使用草稿中的数据
        if (isFromDraft.value) {
            return {
                ...userPrefs,
                ...tripPrefs,
                // 确保草稿数据优先级更高
                source: "draft",
            };
        }

        // 否则将用户偏好作为默认值，行程偏好作为覆盖
        return {
            // 行程目标：优先使用行程偏好，否则从用户标签推导
            tripGoals: tripPrefs.tripGoals.length > 0 ?
                tripPrefs.tripGoals : mapUserTagsToTripGoals(userPrefs.selectedTags || []),

            // 重点体验：优先使用行程偏好，否则从用户标签推导
            focusAreas: tripPrefs.focusAreas.length > 0 ?
                tripPrefs.focusAreas : mapUserTagsToFocusAreas(userPrefs.selectedTags || []),

            // 节奏偏好：优先使用行程偏好，否则使用用户偏好或默认值
            pacePreference: tripPrefs.pacePreference || userPrefs.pacePreference || "balanced",

            // 社交偏好：优先使用行程偏好，否则基于MBTI推导
            socialPreference: tripPrefs.socialPreference ||
                deriveSocialPreference(userPrefs.mbtiType) ||
                "mixed",

            // 拍照偏好：优先使用行程偏好，否则基于标签推导
            photoPreference: tripPrefs.photoPreference ||
                derivePhotoPreference(userPrefs.selectedTags || []) ||
                "casual",

            // 饮食禁忌：合并用户档案和本次行程的临时饮食限制
            dietaryRestrictions: [
                ...(userPrefs.dietaryRestrictions || []),
                ...(tripPrefs.temporaryDietaryRestrictions || []),
            ].filter((item, index, arr) => arr.indexOf(item) === index), // 去重

            // 其他饮食需求：保持用户档案中的设置
            customDietaryNotes: userPrefs.customDietaryNotes || "",

            // 行程特殊限制
            hasChildren: tripPrefs.hasChildren || false,
            hasElderly: tripPrefs.hasElderly || false,
            needAccessibility: tripPrefs.needAccessibility || userPrefs.needAccessibility || false,
            budgetConstraint: tripPrefs.budgetConstraint || false,

            // 特殊需求：本次行程的特殊请求
            specialRequirements: tripPrefs.specialRequirements || "",

            source: "merged",
        };
    });

    // 用户标签到行程目标的映射
    const mapUserTagsToTripGoals = (tags) => {
        const tagGoalMap = {
            family: "family",
            romantic: "romantic",
            friends: "friendship",
            solo: "solo",
            business: "business",
            photography: "photography",
            adventure: "adventure",
            relaxation: "relaxation",
            culture: "learning",
            celebration: "celebration",
        };

        const mappedGoals = tags.map((tag) => tagGoalMap[tag]).filter(Boolean);

        return mappedGoals.length > 0 ? mappedGoals : ["relaxation"];
    };

    // 用户标签到重点体验的映射
    const mapUserTagsToFocusAreas = (tags) => {
        const tagFocusMap = {
            culture: "local_culture",
            history: "historical_sites",
            art: "local_culture",
            food: "food_experience",
            local_cuisine: "food_experience",
            nature: "natural_scenery",
            mountains: "natural_scenery",
            scenic: "natural_scenery",
            cities: "urban_life",
            urban: "urban_life",
            modern: "modern_attractions",
            shopping: "shopping",
            nightlife: "nightlife",
        };

        return tags.map((tag) => tagFocusMap[tag]).filter(Boolean);
    };

    // 基于MBTI推导社交偏好
    const deriveSocialPreference = (mbtiType) => {
        if (!mbtiType) return "mixed";
        return mbtiType.startsWith("E") ? "lively" : "quiet";
    };

    // 基于标签推导拍照偏好
    const derivePhotoPreference = (tags) => {
        const photoTags = ["photography", "urban", "modern"];
        return tags.some((tag) => photoTags.includes(tag)) ? "essential" : "casual";
    };

    // 初始化行程偏好（从用户偏好推导默认值）
    const initializeTripPreferences = () => {
        console.log("🔄 初始化行程偏好设置...");

        const userPrefs = userStore.userPreferences || {};
        console.log("👤 用户偏好数据:", userPrefs);

        // 只在没有草稿数据时才从用户偏好推导
        if (!isFromDraft.value) {
            tripPreferenceForm.value = {
                tripGoals: mapUserTagsToTripGoals(userPrefs.selectedTags || []),
                focusAreas: mapUserTagsToFocusAreas(userPrefs.selectedTags || []),
                pacePreference: userPrefs.pacePreference || "",
                socialPreference: deriveSocialPreference(userPrefs.mbtiType) || "",
                photoPreference: derivePhotoPreference(userPrefs.selectedTags || []) || "",
                temporaryDietaryRestrictions: [], // 临时饮食限制默认为空
                hasChildren: userPrefs.includeKidsActivities || false, // 从用户档案推导
                hasElderly: false, // 默认为false
                needAccessibility: userPrefs.needAccessibility || false, // 从用户档案推导
                budgetConstraint: false, // 默认为false
                specialRequirements: "", // 本次行程特殊请求默认为空
            };

            console.log("✅ 行程偏好初始化完成:", tripPreferenceForm.value);
        } else {
            console.log("📂 从草稿加载，跳过用户偏好初始化");
        }
    };

    // 加载草稿偏好数据
    const loadDraftPreferences = (draftPreferenceData) => {
        console.log("📂 加载草稿偏好数据:", draftPreferenceData);

        // 标记为从草稿加载
        isFromDraft.value = true;

        // 更新行程偏好表单
        tripPreferenceForm.value = {
            tripGoals: draftPreferenceData.tripGoals || [],
            focusAreas: draftPreferenceData.focusAreas || [],
            pacePreference: draftPreferenceData.pacePreference || "",
            socialPreference: draftPreferenceData.socialPreference || "",
            photoPreference: draftPreferenceData.photoPreference || "",
            dietaryRestrictions: draftPreferenceData.dietaryRestrictions || [],
            customDietaryNotes: draftPreferenceData.customDietaryNotes || "",
            specialRequirements: draftPreferenceData.specialRequirements || "",
        };

        console.log("✅ 草稿偏好数据加载完成");
    };

    // 重置偏好设置（清除草稿状态）
    const resetPreferences = () => {
        console.log("🔄 重置偏好设置...");

        // 重置草稿标识
        isFromDraft.value = false;

        // 重新从用户偏好初始化
        initializeTripPreferences();

        console.log("✅ 偏好设置已重置");
    };

    // 更新行程偏好的特定字段
    const updateTripPreference = (field, value) => {
        console.log(`🔧 更新行程偏好 ${field}:`, value);
        tripPreferenceForm.value[field] = value;
    };

    // 批量更新行程偏好
    const updateTripPreferences = (preferences) => {
        console.log("🔧 批量更新行程偏好:", preferences);
        Object.assign(tripPreferenceForm.value, preferences);
    };

    // 获取当前有效的偏好配置（用于AI生成等场景）
    const getEffectivePreferences = () => {
        return mergedPreferences.value;
    };

    // 检查偏好是否完整
    const isPreferencesComplete = computed(() => {
        const prefs = tripPreferenceForm.value;

        // 检查必要字段是否已填写
        const hasGoals = prefs.tripGoals.length > 0;
        const hasFocus = prefs.focusAreas.length > 0;
        const hasPace = !!prefs.pacePreference;
        const hasSocial = !!prefs.socialPreference;
        const hasPhoto = !!prefs.photoPreference;

        return hasGoals && hasFocus && hasPace && hasSocial && hasPhoto;
    });

    // 获取偏好完成度百分比
    const preferencesCompleteness = computed(() => {
        const prefs = tripPreferenceForm.value;
        let completed = 0;
        const total = 5; // 总共5个必要字段

        if (prefs.tripGoals.length > 0) completed++;
        if (prefs.focusAreas.length > 0) completed++;
        if (prefs.pacePreference) completed++;
        if (prefs.socialPreference) completed++;
        if (prefs.photoPreference) completed++;

        return Math.round((completed / total) * 100);
    });

    return {
        // 状态
        tripPreferenceForm,
        isFromDraft,

        // 计算属性
        mergedPreferences,
        isPreferencesComplete,
        preferencesCompleteness,

        // 方法
        initializeTripPreferences,
        loadDraftPreferences,
        resetPreferences,
        updateTripPreference,
        updateTripPreferences,
        getEffectivePreferences,

        // 映射函数（供外部使用）
        mapUserTagsToTripGoals,
        mapUserTagsToFocusAreas,
        deriveSocialPreference,
        derivePhotoPreference,
    };
});