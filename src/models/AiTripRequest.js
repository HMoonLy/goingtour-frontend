/**
 * AI 行程生成请求模型 (DTO)
 * 严格对应后端接口: POST /api/ai-trip/generate
 * 文档参考: BACKEND_API_STRUCTURE.md Section 5.1
 */
export class AiTripRequest {
  constructor(data = {}) {
    // ========== 1. 基础信息 (必填) ==========
    this.destination = data.destination || '';
    this.destinationName = data.destinationName || '';
    // 限制范围: 1-30天
    this.days = typeof data.days === 'number' ? data.days : 3;
    // 限制范围: >=1
    this.travelers = typeof data.travelers === 'number' ? data.travelers : 1;
    // 枚举: "INDIVIDUAL" | "COUPLE" | "FAMILY" | "BUSINESS"
    this.userType = data.userType || 'INDIVIDUAL';

    // ========== 2. 可选基础信息 ==========
    // 预算描述字符串 (e.g. "150-300元/天")
    this.budget = data.budget || '';
    // 日期格式: YYYY-MM-DD
    this.startDate = data.startDate || null;
    this.endDate = data.endDate || null;
    // 生成样式: "table" | "narrative" | "card" | "checklist"
    this.generationStyle = data.generationStyle || 'table';

    // ========== 3. 用户偏好 (User Preferences) ==========
    // 对应 PERSONAL_PROFILE_OPTIONS 和 TRIP_PREFERENCES_OPTIONS 中的 key
    
    // 旅行标签 (数组)
    this.travelTags = Array.isArray(data.travelTags) ? data.travelTags : [];
    
    // 交通方式 (数组)
    this.transports = Array.isArray(data.transports) ? data.transports : [];
    
    // 住宿类型 (单选字符串)
    this.accommodationType = data.accommodationType || '';
    
    // 口味偏好 (数组)
    this.foodTastes = Array.isArray(data.foodTastes) ? data.foodTastes : [];
    
    // 饮食限制 (数组) - 新增
    this.dietaryRestrictions = Array.isArray(data.dietaryRestrictions) ? data.dietaryRestrictions : [];
    this.customDietaryNotes = data.customDietaryNotes || '';

    // 节奏偏好 (单选): "slow" | "balanced" | "fast"
    this.pacePreference = data.pacePreference || 'balanced';
    
    // 社交偏好 (单选): "lively" | "quiet" | "mixed" - 新增
    this.socialPreference = data.socialPreference || 'mixed';
    
    // 拍照偏好 (单选): "essential" | "casual" | "minimal" - 新增
    this.photoPreference = data.photoPreference || 'casual';
    
    // 重点关注区域 (数组) - 新增
    this.focusAreas = Array.isArray(data.focusAreas) ? data.focusAreas : [];

    // ========== 4. 必去项 (Selection) ==========
    // 格式: Array<{ name: string; description?: string; address?: string }>
    this.selectedAttractions = Array.isArray(data.selectedAttractions) 
      ? data.selectedAttractions.map(this._sanitizeSelection) 
      : [];
      
    this.selectedRestaurants = Array.isArray(data.selectedRestaurants) 
      ? data.selectedRestaurants.map(this._sanitizeSelection) 
      : [];
      
    this.selectedHotels = Array.isArray(data.selectedHotels) 
      ? data.selectedHotels.map(this._sanitizeSelection) 
      : [];
  }

  /**
   * 清洗选择项数据，确保符合后端结构
   */
  _sanitizeSelection(item) {
    if (!item) return null;
    return {
      name: item.name || '',
      description: item.description || item.reason || '',
      address: item.address || ''
    };
  }

  /**
   * 转换为后端需要的纯 JSON 对象
   * 可以在这里做最后的数据清洗
   */
  toBackendJSON() {
    return {
      destination: this.destination,
      destinationName: this.destinationName,
      days: Number(this.days),
      travelers: Number(this.travelers),
      userType: this.userType,
      
      budget: this.budget,
      startDate: this.startDate,
      endDate: this.endDate,
      generationStyle: this.generationStyle,
      
      travelTags: this.travelTags,
      transports: this.transports,
      accommodationType: this.accommodationType,
      foodTastes: this.foodTastes,
      dietaryRestrictions: this.dietaryRestrictions,
      customDietaryNotes: this.customDietaryNotes,
      
      pacePreference: this.pacePreference,
      socialPreference: this.socialPreference,
      photoPreference: this.photoPreference,
      focusAreas: this.focusAreas,
      
      selectedAttractions: this.selectedAttractions.filter(i => i && i.name),
      selectedRestaurants: this.selectedRestaurants.filter(i => i && i.name),
      selectedHotels: this.selectedHotels.filter(i => i && i.name)
    };
  }

  /**
   * 静态工厂：从前端组件的混合状态创建实例
   * 包含智能推断逻辑
   */
  static fromFrontendState(state) {
    // 1. 处理日期
    let startDate = state.startDate;
    let endDate = state.endDate;
    
    if (Array.isArray(state.dateRange) && state.dateRange.length === 2) {
      startDate = state.dateRange[0];
      endDate = state.dateRange[1];
    }
    
    // 2. 智能推断 UserType (如果未显式指定)
    let userType = state.userType || 'INDIVIDUAL';
    const travelers = typeof state.travelers === 'number' ? state.travelers : 1;
    
    // 简单的推断逻辑：
    // 如果人数 > 2 -> FAMILY (默认假设，也可能是 GROUP)
    // 如果人数 == 2 -> COUPLE
    // 如果有 tripPurpose (travelTags) 明确指定了目的，则优先
    const tags = Array.isArray(state.travelTags) ? state.travelTags : [];
    const goals = Array.isArray(state.tripGoals) ? state.tripGoals : []; // 兼容旧字段
    const allTags = [...tags, ...goals];

    if (allTags.includes('business')) userType = 'BUSINESS';
    else if (allTags.includes('family')) userType = 'FAMILY';
    else if (allTags.includes('romantic') || allTags.includes('couple')) userType = 'COUPLE';
    else {
      // 没有任何标签指示，仅凭人数推断
      if (travelers > 2) userType = 'FAMILY'; 
      else if (travelers === 2) userType = 'COUPLE';
      else userType = 'INDIVIDUAL';
    }

    // 3. 创建实例
    const dto = new AiTripRequest({
      ...state,
      startDate,
      endDate,
      userType,
      // 兼容可能传入的旧字段名
      travelTags: allTags,
    });
    
    return dto;
  }
}
