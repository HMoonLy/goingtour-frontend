/**
 * AI 行程生成请求模型
 */
export class AiTripRequest {
  constructor(data = {}) {
    // 基础信息
    this.destination = data.destination || '';
    this.destinationName = data.destinationName || '';
    this.days = data.days || 3;
    this.travelers = data.travelers || 1;
    this.userType = data.userType || 'INDIVIDUAL';

    // 可选信息
    this.budget = data.budget || '';
    this.startDate = data.startDate || null;
    this.endDate = data.endDate || null;
    
    // 偏好
    this.travelTags = data.travelTags || [];
    this.foodTastes = data.foodTastes || [];
    this.accommodationType = data.accommodationType || '';
    this.pacePreference = data.pacePreference || 'balanced'; // slow, balanced, fast
    
    // 必去项
    this.selectedAttractions = data.selectedAttractions || [];
    this.selectedRestaurants = data.selectedRestaurants || [];
  }

  toBackendJSON() {
    return {
      destination: this.destination,
      destinationName: this.destinationName,
      days: this.days,
      travelers: this.travelers,
      userType: this.userType,
      budget: this.budget,
      startDate: this.startDate,
      endDate: this.endDate,
      travelTags: this.travelTags,
      foodTastes: this.foodTastes,
      accommodationType: this.accommodationType,
      pacePreference: this.pacePreference,
      // 确保是简单的对象数组，只包含 name 等必要信息
      selectedAttractions: (this.selectedAttractions || []).map(a => ({
        name: a.name,
        description: a.description || ''
      })),
      selectedRestaurants: (this.selectedRestaurants || []).map(r => ({
        name: r.name,
        description: r.description || ''
      }))
    };
  }
}

