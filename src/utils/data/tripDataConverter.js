/**
 * 行程数据转换工具
 * 用于在后端API数据格式和前端显示格式之间转换
 * [Refactored to use Trip Model]
 */
import { Trip } from "@/models/Trip";

/**
 * 将后端TripResponse转换为前端显示格式
 * @param {Object} backendTrip - 后端返回的行程数据
 * @returns {Object} 前端显示格式的行程数据 (兼容格式)
 */
export function convertBackendTripToFrontend(backendTrip) {
  if (!backendTrip) return null;

  // 使用 Model 解析数据
  const trip = Trip.fromBackend(backendTrip);

  // 返回兼容旧代码的结构
  // 新代码建议直接使用 Trip 实例
  return {
    // 基础属性
    id: trip.id,
    title: trip.title,
    destination: trip.destination,
    destinationName: trip.destinationInfo?.name || trip.destination, // 优先使用 info 中的名称
    city: trip.city,
    days: trip.days,
    travelers: trip.travelers,
    mate: trip.travelers, // 兼容字段
    status: getStatusText(trip.status),
    statusCode: trip.status,
    
    // 预算
    totalBudget: trip.totalBudget,
    actualCost: trip.actualCost,
    budgetText: formatBudgetText(trip.totalBudget),
    estimatedCost: formatEstimatedCost(trip.totalBudget),
    
    // AI 信息
    aiGenerated: trip.aiGenerated,
    aiContent: trip.aiContent,
    qualityScore: trip.qualityScore,
    destinationInfo: trip.destinationInfo,
    tripBasicInfo: trip.tripBasicInfo,
    
    // 时间
    createTime: trip.createTime,
    updateTime: trip.updateTime,
    createdAt: trip.createTime,
    updatedAt: trip.updateTime,
    shareCode: trip.shareCode,
    
    // 核心数据结构 (通过 Model Getter 获取)
    dailyPlan: trip.dailyPlan,
    attractions: trip.attractions,
    restaurants: trip.restaurants,
    
    // 原始数据保留
    tripDetails: backendTrip.tripDetails,
    
    // 原型引用 (方便访问 Model 方法)
    _model: trip
  };
}

/**
 * 将前端行程数据转换为后端API格式
 * @param {Object} frontendTrip - 前端的行程数据
 * @returns {Object} 后端API期望的数据格式
 */
export function convertFrontendTripToBackend(frontendTrip) {
  if (!frontendTrip) return null;

  // 如果已经是 Trip 实例
  if (frontendTrip instanceof Trip) {
    return frontendTrip.toBackendRequest();
  }

  // 如果是旧对象，尝试转换为 Trip 实例
  // 注意：旧对象可能包含 dailyPlan 但没有 tripDetails
  const tripData = {
    ...frontendTrip,
    city: frontendTrip.destination || frontendTrip.city,
    mate: frontendTrip.travelers || frontendTrip.mate,
    status: getFrontendStatusCode(frontendTrip.status)
  };
  
  const trip = new Trip(tripData);
  return trip.toBackendRequest();
}

/**
 * 辅助：将 dailyPlan 转换为 tripDetails (供旧代码单独调用)
 */
export function convertDailyPlanToTripDetails(dailyPlan) {
  const trip = new Trip();
  trip.fromDailyPlan(dailyPlan);
  return trip.details.map(d => d.toBackendJSON());
}


// --- 辅助函数保留 (用于显示格式化) ---

/**
 * 状态文本转换
 */
function getStatusText(statusCode) {
  switch (statusCode) {
    case 1: return "draft";
    case 2: return "published";
    case 3: return "completed";
    default: return "draft";
  }
}

/**
 * 前端状态转状态码
 */
function getFrontendStatusCode(status) {
  if (typeof status === 'number') return status;
  switch (status) {
    case "draft": return 1;
    case "published": return 2;
    case "completed": return 3;
    default: return 1;
  }
}

/**
 * 格式化预算文本
 */
function formatBudgetText(budget) {
  if (!budget) return "预算待定";
  if (budget < 1000) {
    return `约 ¥${budget}`;
  } else {
    return `约 ¥${(budget / 1000).toFixed(1)}k`;
  }
}

/**
 * 格式化预估花费
 */
function formatEstimatedCost(budget) {
  if (!budget) return "约 ¥0";
  return `约 ¥${budget.toLocaleString()}`;
}
