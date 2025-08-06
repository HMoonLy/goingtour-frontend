/**
 * 行程数据转换工具
 * 用于在后端API数据格式和前端显示格式之间转换
 */

/**
 * 将后端TripResponse转换为前端显示格式
 * @param {Object} backendTrip - 后端返回的行程数据
 * @returns {Object} 前端显示格式的行程数据
 */
export function convertBackendTripToFrontend(backendTrip) {
    if (!backendTrip) return null;

    // 从tripDetails中提取景点和餐厅信息
    const attractions = [];
    const restaurants = [];
    const dailyPlan = [];

    if (backendTrip.tripDetails && Array.isArray(backendTrip.tripDetails)) {
        // 构建每日计划结构
        const dayMap = new Map();

        backendTrip.tripDetails.forEach((detail) => {
            const dayIndex = detail.day - 1; // 转换为0-based索引

            if (!dayMap.has(dayIndex)) {
                dayMap.set(dayIndex, {
                    day: detail.day,
                    activities: [],
                });
            }

            const activity = {
                time: getTimeFromSlot(detail.timeSlot, detail.sequence),
                duration: detail.duration || 120,
                notes: detail.notes || "",
                description: detail.notes || "",
            };

            if (detail.attraction) {
                activity.name = detail.attraction.name;
                activity.type = "attraction";
                activity.id = detail.attraction.id;
                activity.data = detail.attraction;
                activity.tags = getAttractionTags(detail.attraction);

                // 添加到景点列表（去重）
                if (!attractions.find((a) => a.id === detail.attraction.id)) {
                    attractions.push({
                        id: detail.attraction.id,
                        name: detail.attraction.name,
                        city: detail.attraction.city,
                        address: detail.attraction.address,
                        price: detail.attraction.price,
                        pricePerPerson: detail.attraction.price,
                        image: detail.attraction.image,
                        rating: detail.attraction.rating,
                        openTime: detail.attraction.openTime,
                        tags: getAttractionTags(detail.attraction),
                    });
                }
            } else if (detail.restaurant) {
                activity.name = detail.restaurant.name;
                activity.type = "restaurant";
                activity.id = detail.restaurant.id;
                activity.data = detail.restaurant;
                activity.tags = getRestaurantTags(detail.restaurant);

                // 添加到餐厅列表（去重）
                if (!restaurants.find((r) => r.id === detail.restaurant.id)) {
                    restaurants.push({
                        id: detail.restaurant.id,
                        name: detail.restaurant.name,
                        city: detail.restaurant.city,
                        address: detail.restaurant.address,
                        pricePerPerson: detail.restaurant.pricePerPerson,
                        image: detail.restaurant.image,
                        rating: detail.restaurant.rating,
                        openTime: detail.restaurant.openTime,
                        phone: detail.restaurant.phone,
                        tags: getRestaurantTags(detail.restaurant),
                    });
                }
            }

            dayMap.get(dayIndex).activities.push(activity);
        });

        // 转换为数组并排序
        for (let i = 0; i < (backendTrip.days || 1); i++) {
            if (dayMap.has(i)) {
                const dayPlan = dayMap.get(i);
                // 按时间排序活动
                dayPlan.activities.sort((a, b) => {
                    const timeA = a.time.replace(":", "");
                    const timeB = b.time.replace(":", "");
                    return parseInt(timeA) - parseInt(timeB);
                });
                dailyPlan.push(dayPlan);
            } else {
                // 空的天数
                dailyPlan.push({
                    day: i + 1,
                    activities: [],
                });
            }
        }
    }

    // 生成城市名称映射
    const cityNameMap = {
        beijing: "北京",
        shanghai: "上海",
        guangzhou: "广州",
        shenzhen: "深圳",
        hangzhou: "杭州",
        nanjing: "南京",
        suzhou: "苏州",
        chengdu: "成都",
        chongqing: "重庆",
        xian: "西安",
    };

    return {
        id: backendTrip.id,
        title: backendTrip.title,
        destination: backendTrip.city,
        destinationName: cityNameMap[backendTrip.city] || backendTrip.city,
        city: backendTrip.city,
        days: backendTrip.days,
        travelers: backendTrip.mate || 1,
        mate: backendTrip.mate || 1,
        status: getStatusText(backendTrip.status),
        statusCode: backendTrip.status,
        budget: backendTrip.totalBudget,
        budgetText: formatBudgetText(backendTrip.totalBudget),
        estimatedCost: formatEstimatedCost(backendTrip.totalBudget),
        totalBudget: backendTrip.totalBudget,
        actualCost: backendTrip.actualCost,
        shareCode: backendTrip.shareCode,
        createdAt: backendTrip.createTime,
        updatedAt: backendTrip.updateTime,
        createTime: backendTrip.createTime,
        updateTime: backendTrip.updateTime,

        // AI相关字段
        aiGenerated: backendTrip.aiGenerated === 1, // 转换为布尔值
        aiContent: backendTrip.aiContent,
        destinationInfo: backendTrip.destinationInfo,
        tripBasicInfo: backendTrip.tripBasicInfo,
        qualityScore: backendTrip.qualityScore,
        processingTime: backendTrip.processingTime,
        generationParams: backendTrip.generationParams,
        feedbackRating: backendTrip.feedbackRating,
        feedbackContent: backendTrip.feedbackContent,

        // 前端特有的结构
        attractions: attractions,
        restaurants: restaurants,
        dailyPlan: dailyPlan,

        // 保持兼容性
        tripDetails: backendTrip.tripDetails,
    };
}

/**
 * 将前端行程数据转换为后端API格式
 * @param {Object} frontendTrip - 前端的行程数据
 * @returns {Object} 后端API期望的数据格式
 */
export function convertFrontendTripToBackend(frontendTrip) {
    if (!frontendTrip) return null;

    return {
        title: frontendTrip.title,
        city: frontendTrip.destination || frontendTrip.city,
        days: frontendTrip.days,
        mate: frontendTrip.travelers || frontendTrip.mate || 1,
        status: getFrontendStatusCode(frontendTrip.status),
        totalBudget: parseBudgetValue(
            frontendTrip.budget ||
            frontendTrip.estimatedCost ||
            frontendTrip.totalBudget,
        ),
        tripDetails: convertDailyPlanToTripDetails(frontendTrip.dailyPlan),
    };
}

/**
 * 将前端dailyPlan转换为后端tripDetails格式
 * @param {Array} dailyPlan - 前端的每日计划数组
 * @returns {Array} 后端tripDetails格式的数组
 */
export function convertDailyPlanToTripDetails(dailyPlan) {
    const tripDetails = [];

    if (!dailyPlan || !Array.isArray(dailyPlan)) {
        return tripDetails;
    }

    dailyPlan.forEach((day, dayIndex) => {
        if (!day.activities || !Array.isArray(day.activities)) {
            return;
        }

        day.activities.forEach((activity, actIndex) => {
            const timeSlot = getTimeSlot(activity.time);

            const detail = {
                day: dayIndex + 1,
                timeSlot: timeSlot,
                sequence: actIndex + 1,
                duration: activity.duration || 120,
                notes: activity.description || activity.notes || "",
            };

            // 根据活动类型设置对应的ID
            if (activity.type === "attraction" && activity.id) {
                detail.attractionId = parseInt(activity.id) || null;
            } else if (activity.type === "restaurant" && activity.id) {
                detail.restaurantId = parseInt(activity.id) || null;
            }

            tripDetails.push(detail);
        });
    });

    return tripDetails;
}

// 辅助函数

/**
 * 根据时段和顺序生成时间
 */
function getTimeFromSlot(timeSlot, sequence = 1) {
    const timeMap = {
        morning: ["09:00", "10:30"],
        afternoon: ["13:00", "14:30", "16:00"],
        evening: ["18:00", "19:30"],
    };

    const times = timeMap[timeSlot] || timeMap["morning"];
    const index = Math.min(sequence - 1, times.length - 1);
    return times[index];
}

/**
 * 根据时间判断时段
 */
function getTimeSlot(timeStr) {
    if (!timeStr) return "morning";

    const time = timeStr.split(":")[0];
    const hour = parseInt(time);

    if (hour >= 6 && hour < 12) {
        return "morning";
    } else if (hour >= 12 && hour < 18) {
        return "afternoon";
    } else {
        return "evening";
    }
}

/**
 * 获取景点标签
 */
function getAttractionTags(attraction) {
    const tags = [];
    if (attraction.rating && attraction.rating > 4.5) {
        tags.push("高评分");
    }
    if (attraction.price === 0) {
        tags.push("免费");
    }
    tags.push("必游景点");
    return tags;
}

/**
 * 获取餐厅标签
 */
function getRestaurantTags(restaurant) {
    const tags = [];
    if (restaurant.rating && restaurant.rating > 4.5) {
        tags.push("高评分");
    }
    tags.push("当地美食");
    return tags;
}

/**
 * 状态文本转换
 */
function getStatusText(statusCode) {
    switch (statusCode) {
        case 1:
            return "draft";
        case 2:
            return "published";
        case 3:
            return "completed";
        default:
            return "draft";
    }
}

/**
 * 前端状态转状态码
 */
function getFrontendStatusCode(status) {
    switch (status) {
        case "draft":
            return 1;
        case "published":
            return 2;
        case "completed":
            return 3;
        default:
            return 1;
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

/**
 * 解析预算数值
 */
function parseBudgetValue(budgetValue) {
    if (typeof budgetValue === "number") {
        return budgetValue;
    }

    if (typeof budgetValue === "string") {
        // 移除所有非数字字符，只保留数字和小数点
        const numberStr = budgetValue.replace(/[^0-9.]/g, "");
        const number = parseFloat(numberStr);
        return isNaN(number) ? 0 : number;
    }

    return 0;
}