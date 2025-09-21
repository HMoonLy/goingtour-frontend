/**
 * 草稿管理Store - 简单直接的实现
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import { draftApi } from "@/api/draft.js";
import { ElMessage } from "element-plus";

export const useDraftStore = defineStore("draft", () => {
    // 当前活动的草稿数据
    const currentDraft = ref(null);
    const isLoadingFromDraft = ref(false);

    /**
     * 保存当前表单数据为草稿
     */
    const saveDraft = async(formData, draftName) => {
        try {
            // 需要获取当前用户ID
            const { useUserStore } = await
            import ("@/store/user.js");
            const userStore = useUserStore();
            const userId = userStore.currentUser ? .id;

            if (!userId) {
                ElMessage.error("用户未登录");
                return null;
            }

            const draftData = {
                userId: userId, // 添加 userId
                name: draftName,
                currentStep: formData.currentStep || 0,
                baseForm: formData.baseForm || {},
                preferenceForm: formData.preferenceForm || {},
                selectedAttractions: formData.selectedAttractions || [],
                selectedRestaurants: formData.selectedRestaurants || [],
                extraRequirements: formData.extraRequirements || "",
                weatherSuggestion: formData.weatherSuggestion || null,
            };

            const response = await draftApi.createDraft(draftData);
            if (response.data ? .id) {
                ElMessage.success("草稿保存成功");
                return response.data.id;
            }
        } catch (error) {
            console.error("保存草稿失败:", error);
            ElMessage.error("保存草稿失败");
            return null;
        }
    };

    /**
     * 加载草稿到store中
     */
    const loadDraft = async(draftId) => {
        try {
            console.log("🔄 加载草稿到store:", draftId);

            // 需要获取当前用户ID
            const { useUserStore } = await
            import ("@/store/user.js");
            const userStore = useUserStore();
            const userId = userStore.currentUser ? .id;

            if (!userId) {
                ElMessage.error("用户未登录");
                return false;
            }

            const response = await draftApi.getDraft(draftId, userId);
            const draft = response.data;

            if (!draft) {
                ElMessage.error("草稿不存在");
                return false;
            }

            // 解析JSON字段
            const parsedDraft = {
                id: draft.id,
                name: draft.name,
                currentStep: draft.currentStep || 0,
                baseForm: typeof draft.baseForm === "string" ?
                    JSON.parse(draft.baseForm) : draft.baseForm || {},
                preferenceForm: typeof draft.preferenceForm === "string" ?
                    JSON.parse(draft.preferenceForm) : draft.preferenceForm || {},
                selectedAttractions: typeof draft.selectedAttractions === "string" ?
                    JSON.parse(draft.selectedAttractions) : draft.selectedAttractions || [],
                selectedRestaurants: typeof draft.selectedRestaurants === "string" ?
                    JSON.parse(draft.selectedRestaurants) : draft.selectedRestaurants || [],
                extraRequirements: draft.extraRequirements || "",
                weatherSuggestion: typeof draft.weatherSuggestion === "string" ?
                    JSON.parse(draft.weatherSuggestion) : draft.weatherSuggestion,
            };

            // 保存到store
            currentDraft.value = parsedDraft;
            isLoadingFromDraft.value = true;

            console.log("✅ 草稿加载到store成功:", parsedDraft);
            return true;
        } catch (error) {
            console.error("加载草稿失败:", error);
            ElMessage.error("加载草稿失败");
            return false;
        }
    };

    /**
     * 清除当前草稿数据
     */
    const clearDraft = () => {
        currentDraft.value = null;
        isLoadingFromDraft.value = false;
        console.log("🧹 已清除草稿数据");
    };

    /**
     * 检查是否有草稿数据需要恢复
     */
    const hasDraftToRestore = () => {
        return !!(currentDraft.value && isLoadingFromDraft.value);
    };

    /**
     * 获取要恢复到的步骤
     */
    const getRestoreStep = () => {
        if (!hasDraftToRestore()) return 0;
        return currentDraft.value.currentStep || 0;
    };

    return {
        // 状态
        currentDraft,
        isLoadingFromDraft,

        // 方法
        saveDraft,
        loadDraft,
        clearDraft,
        hasDraftToRestore,
        getRestoreStep,
    };
});