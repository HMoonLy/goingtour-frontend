/**
 * 行程详情项模型 (对应后端 TripDetailResponse)
 */
export class TripDetail {
  constructor(data = {}) {
    this.id = data.id || null;
    this.day = data.day || 1;
    this.timeSlot = data.timeSlot || 'morning'; // morning, afternoon, evening
    this.sequence = data.sequence || 1;
    this.duration = data.duration || 120; // 分钟
    this.notes = data.notes || '';
    
    // 关联 ID
    this.attractionId = data.attractionId || (data.attraction ? data.attraction.id : null);
    this.restaurantId = data.restaurantId || (data.restaurant ? data.restaurant.id : null);
    this.hotelId = data.hotelId || (data.hotel ? data.hotel.id : null);

    // 完整的实体数据 (Backend populated)
    this.attraction = data.attraction || null;
    this.restaurant = data.restaurant || null;
    this.hotel = data.hotel || null;

    // 前端辅助字段：具体时间点
    this.time = this._calculateTime();
  }

  /**
   * 根据时段和顺序计算具体时间点
   * @private
   */
  _calculateTime() {
    const timeMap = {
      morning: ["09:00", "10:30"],
      afternoon: ["13:00", "14:30", "16:00"],
      evening: ["18:00", "19:30"],
    };

    const times = timeMap[this.timeSlot] || timeMap["morning"];
    // 防止索引越界
    const index = Math.min((this.sequence || 1) - 1, times.length - 1);
    return times[Math.max(0, index)];
  }

  /**
   * 获取活动类型
   */
  get type() {
    if (this.attraction) return 'attraction';
    if (this.restaurant) return 'restaurant';
    if (this.hotel) return 'hotel';
    return 'other';
  }

  /**
   * 获取活动名称
   */
  get name() {
    if (this.attraction) return this.attraction.name;
    if (this.restaurant) return this.restaurant.name;
    if (this.hotel) return this.hotel.name;
    return '自定义活动';
  }

  /**
   * 获取关联数据对象
   */
  get data() {
    if (this.attraction) return this.attraction;
    if (this.restaurant) return this.restaurant;
    if (this.hotel) return this.hotel;
    return null;
  }

  /**
   * 转换为后端请求格式
   */
  toBackendJSON() {
    return {
      day: this.day,
      timeSlot: this.timeSlot,
      sequence: this.sequence,
      duration: this.duration,
      notes: this.notes,
      attractionId: this.attractionId,
      restaurantId: this.restaurantId,
      hotelId: this.hotelId
    };
  }
}

