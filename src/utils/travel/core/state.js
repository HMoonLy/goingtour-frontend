/**
 * 状态管理与转换逻辑
 */
import { AiTripRequest } from '@/models/AiTripRequest';

/**
 * 🏭 Factory: 创建行程生成的初始 UI 状态
 * 这个状态对象可以直接绑定到 Vue 组件的 v-model
 */
export function createInitialTripState() {
    return {
        // --- 基础信息 ---
        destination: '',
        destinationName: '',
        days: 3,
        travelers: 1,
        userType: 'INDIVIDUAL', // INDIVIDUAL, COUPLE, FAMILY, BUSINESS
        budget: '', // key from budgetLevel
        
        // --- 日期 (UI 专用) ---
        dateRange: [], // [Date, Date] for Element Plus
        
        // --- 偏好设置 ---
        travelTags: [], // 混合: coreInterests + temporaryNeeds + tripPurpose
        transports: [], // keys from transportPreferences
        foodTastes: [], // 暂时没有专门的 UI 字典，可以是 string array
        dietaryRestrictions: [], // keys from dietaryRestrictions
        customDietaryNotes: '',
        
        pacePreference: 'balanced',
        socialPreference: 'mixed',
        photoPreference: 'casual',
        focusAreas: [], // keys from focusAreas
        accommodationType: '', // 暂时没有 UI 字典，string
        
        // --- 必去项 ---
        selectedAttractions: [],
        selectedRestaurants: [],
        selectedHotels: []
    };
}

/**
 * 🔄 Converter: 将前端 UI 状态转换为后端 DTO
 * 这里处理所有的映射逻辑
 */
export function transformToBackendDTO(state) {
    // 1. 使用 Model 的工厂方法进行初步转换
    const request = AiTripRequest.fromFrontendState(state);
    
    // 2. 返回纯 JSON
    return request.toBackendJSON();
}

export default {
    createInitialTripState,
    transformToBackendDTO
};

