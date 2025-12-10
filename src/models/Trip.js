import { TripDetail } from './TripDetail';

/**
 * 行程模型 (对应后端 TripResponse/TripRequest)
 */
export class Trip {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || '未命名行程';
    this.destination = data.city || ''; // 统一使用 destination 别名，对应后端 city
    this.city = data.city || '';
    
    this.days = data.days || 1;
    this.travelers = data.mate || 1; // 统一使用 travelers，对应后端 mate
    this.status = data.status || 1; // 1-draft, 2-published, 3-completed
    
    this.totalBudget = data.totalBudget || 0;
    this.actualCost = data.actualCost || 0;
    
    this.shareCode = data.shareCode || '';
    
    // AI 相关
    this.aiGenerated = data.aiGenerated === 1 || data.aiGenerated === true;
    this.aiContent = data.aiContent || '';
    this.qualityScore = data.qualityScore || 0;
    
    // 元数据
    this.destinationInfo = data.destinationInfo || {};
    this.tripBasicInfo = data.tripBasicInfo || {};

    // 详情列表
    this.details = [];
    if (data.tripDetails && Array.isArray(data.tripDetails)) {
      this.details = data.tripDetails.map(d => new TripDetail(d));
    } else if (data.dailyPlan) {
      // 兼容旧的前端 dailyPlan 结构
      this.fromDailyPlan(data.dailyPlan);
    }
    
    this.createTime = data.createTime || '';
    this.updateTime = data.updateTime || '';
  }

  /**
   * 获取每日计划视图 (前端展示用)
   * @returns {Array} 按天分组的活动列表
   */
  get dailyPlan() {
    const plan = [];
    // 初始化每一天
    for (let i = 1; i <= this.days; i++) {
      plan.push({
        day: i,
        activities: []
      });
    }

    // 填充活动
    this.details.forEach(detail => {
      const dayIndex = detail.day - 1;
      if (plan[dayIndex]) {
        plan[dayIndex].activities.push(detail);
      }
    });

    // 每日内排序
    plan.forEach(day => {
      day.activities.sort((a, b) => a.sequence - b.sequence);
    });

    return plan;
  }

  /**
   * 从前端 dailyPlan 结构加载数据
   */
  fromDailyPlan(dailyPlan) {
    this.details = [];
    if (!Array.isArray(dailyPlan)) return;

    dailyPlan.forEach((day, dayIndex) => {
      if (day.activities && Array.isArray(day.activities)) {
        day.activities.forEach((act, actIndex) => {
          // 如果 act 已经是 TripDetail 实例，直接用
          // 否则创建新实例
          const detailData = {
            ...act,
            day: day.day || (dayIndex + 1),
            sequence: actIndex + 1,
            timeSlot: this._getTimeSlotFromTime(act.time)
          };
          this.details.push(new TripDetail(detailData));
        });
      }
    });
  }

  _getTimeSlotFromTime(timeStr) {
    if (!timeStr) return "morning";
    const hour = parseInt(timeStr.split(":")[0]);
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  }

  /**
   * 获取所有景点列表 (去重)
   */
  get attractions() {
    const list = [];
    const ids = new Set();
    this.details.forEach(d => {
      if (d.type === 'attraction' && d.attraction && !ids.has(d.attraction.id)) {
        ids.add(d.attraction.id);
        list.push(d.attraction);
      }
    });
    return list;
  }

  /**
   * 获取所有餐厅列表 (去重)
   */
  get restaurants() {
    const list = [];
    const ids = new Set();
    this.details.forEach(d => {
      if (d.type === 'restaurant' && d.restaurant && !ids.has(d.restaurant.id)) {
        ids.add(d.restaurant.id);
        list.push(d.restaurant);
      }
    });
    return list;
  }

  /**
   * 获取所有酒店列表 (去重)
   */
  get hotels() {
    const list = [];
    const ids = new Set();
    this.details.forEach(d => {
      if (d.type === 'hotel' && d.hotel && !ids.has(d.hotel.id)) {
        ids.add(d.hotel.id);
        list.push(d.hotel);
      }
    });
    return list;
  }

  /**
   * 转换为后端请求格式 (创建/更新)
   */
  toBackendRequest() {
    return {
      title: this.title,
      city: this.destination, // 注意后端字段是 city
      days: this.days,
      mate: this.travelers,   // 注意后端字段是 mate
      status: this.status,
      totalBudget: this.totalBudget,
      tripDetails: this.details.map(d => d.toBackendJSON())
    };
  }

  /**
   * 静态工厂：从后端响应创建实例
   */
  static fromBackend(data) {
    return new Trip(data);
  }
}

