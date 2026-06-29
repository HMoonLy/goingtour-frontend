const demoImage = (query) =>
  `https://images.unsplash.com/${query}?auto=format&fit=crop&w=800&q=80`;

const cityNames = {
  beijing: "北京",
  shanghai: "上海",
  hangzhou: "杭州",
  chengdu: "成都",
  guangzhou: "广州",
  shenzhen: "深圳",
  xian: "西安",
  nanjing: "南京",
  suzhou: "苏州",
  chongqing: "重庆",
};

export const isDemoMode = () => import.meta.env.VITE_DEMO_MODE === "true";

export const createDemoAuthData = (email = "demo@goingtour.local") => ({
  accessToken: `demo_access_${Date.now()}`,
  refreshToken: `demo_refresh_${Date.now()}`,
  expiresIn: 7 * 24 * 60 * 60 * 1000,
  userInfo: {
    id: 10001,
    email,
    nickname: "演示用户",
    avatar: "",
    role: "USER",
    status: "ACTIVE",
    preferences: {
      mbtiType: "ENFP",
      coreInterests: ["culture", "food", "citywalk"],
      budgetLevel: "moderate",
      transportPreferences: ["walk", "metro"],
      dietaryRestrictions: [],
    },
  },
});

export const getDemoCityName = (input = {}) => {
  const raw =
    input.destinationName ||
    input.destination ||
    input.city ||
    input.baseInfo?.destinationName ||
    input.baseInfo?.destination ||
    "杭州";

  return cityNames[String(raw).toLowerCase()] || raw;
};

export const createDemoRecommendations = (params = {}) => {
  const cityName = getDemoCityName(params);

  const attractions = [
    {
      id: "demo_attraction_1",
      name: `${cityName}城市文化漫步区`,
      description: "适合第一天建立城市印象，步行路线集中，拍照和休息点都比较多。",
      rating: 4.8,
      tags: ["城市文化", "轻松步行", "AI精选"],
      image: demoImage("photo-1500530855697-b586d89ba3ee"),
      location: `${cityName}市中心历史街区`,
      address: `${cityName}市中心历史街区`,
      coordinates: [120.1551, 30.2741],
      isAiRecommended: true,
      confidence: 0.93,
      reasoning: "根据您的偏好，优先安排低门槛、信息密度高的城市文化体验，适合作为行程开场。",
      matchedPreferences: ["文化体验", "轻松节奏", "适合拍照"],
    },
    {
      id: "demo_attraction_2",
      name: `${cityName}湖畔观景路线`,
      description: "傍晚光线好，适合安排在下午到日落前后，避免午间暴晒。",
      rating: 4.7,
      tags: ["自然风光", "日落", "慢节奏"],
      image: demoImage("photo-1507525428034-b723cf961d3e"),
      location: `${cityName}湖畔景观带`,
      address: `${cityName}湖畔景观带`,
      coordinates: [120.148, 30.245],
      isAiRecommended: true,
      confidence: 0.9,
      reasoning: "结合行程节奏和拍照需求，AI 将开阔景观安排在体力消耗较低的时段。",
      matchedPreferences: ["自然风光", "拍照", "舒适节奏"],
    },
    {
      id: "demo_attraction_3",
      name: `${cityName}在地生活市集`,
      description: "能快速体验本地小吃、手作和生活方式，适合穿插在景点之间。",
      rating: 4.6,
      tags: ["本地生活", "美食", "市集"],
      image: demoImage("photo-1514933651103-005eec06c04b"),
      location: `${cityName}老城区`,
      address: `${cityName}老城区`,
      coordinates: [120.171, 30.28],
      isAiRecommended: true,
      confidence: 0.88,
      reasoning: "您的偏好中包含真实城市体验，因此推荐市集作为非标准化景点补充。",
      matchedPreferences: ["本地体验", "美食探索", "轻量游览"],
    },
  ];

  const restaurants = [
    {
      id: "demo_restaurant_1",
      name: `${cityName}本帮风味餐厅`,
      description: "适合作为抵达后的第一顿正餐，菜品稳定，位置靠近核心游览区。",
      rating: 4.7,
      price: 95,
      averagePrice: "95元",
      openTime: "11:00-21:30",
      cuisineType: "本地菜",
      tags: ["本地菜", "口味稳定", "AI精选"],
      image: demoImage("photo-1555396273-367ea4eb4db5"),
      location: `${cityName}核心商圈`,
      address: `${cityName}核心商圈`,
      isAiRecommended: true,
      confidence: 0.91,
      reasoning: "AI 根据预算和行程动线，选择了距离景点近、等待时间可控的本地风味餐厅。",
      matchedPreferences: ["本地美食", "中等预算", "少排队"],
    },
    {
      id: "demo_restaurant_2",
      name: `${cityName}湖景轻食咖啡`,
      description: "适合下午休息和补充体力，也可以作为拍照点。",
      rating: 4.5,
      price: 58,
      averagePrice: "58元",
      openTime: "09:30-22:00",
      cuisineType: "咖啡轻食",
      tags: ["咖啡", "轻食", "景观位"],
      image: demoImage("photo-1501339847302-ac426a4a7cbb"),
      location: `${cityName}湖畔区域`,
      address: `${cityName}湖畔区域`,
      isAiRecommended: true,
      confidence: 0.86,
      reasoning: "为了避免连续高强度游览，AI 在下午插入休息型餐饮点。",
      matchedPreferences: ["慢节奏", "拍照", "轻食"],
    },
  ];

  const hotels = [
    {
      id: "demo_hotel_1",
      name: `${cityName}中心智选酒店`,
      description: "靠近地铁和主要游览区域，适合首次到访和多点移动。",
      rating: 4.6,
      price: "约420元/晚",
      facilities: "地铁近 / 早餐 / 行李寄存",
      tags: ["交通便利", "中等预算", "安静"],
      image: demoImage("photo-1566073771259-6a8506099945"),
      location: `${cityName}市中心`,
      address: `${cityName}市中心`,
      isAiRecommended: true,
      confidence: 0.89,
      reasoning: "AI 优先选择交通半径小的住宿，减少每天往返时间，把体力留给核心体验。",
      matchedPreferences: ["交通便利", "预算适中", "省心"],
    },
  ];

  return {
    attractions,
    restaurants,
    hotels,
    reasoning: `演示模式下，GoingTour 根据目的地“${cityName}”、预算、节奏和兴趣偏好，生成了可选择的景点、餐厅和酒店推荐。真实环境会调用后端 AI 服务返回动态结果。`,
    stats: {
      total: attractions.length + restaurants.length + hotels.length,
      attractions: attractions.length,
      restaurants: restaurants.length,
      hotels: hotels.length,
      ai: attractions.length + restaurants.length + hotels.length,
      confidence: 0.9,
    },
    isDemo: true,
    sessionId: `demo_${Date.now()}`,
    generatedAt: new Date().toISOString(),
    timestamp: Date.now(),
  };
};

export const createDemoTrip = (tripState = {}) => {
  const cityName = getDemoCityName(tripState);
  const days = Number(tripState.days || tripState.tripDays || 3);
  const travelers = Number(tripState.travelers || 1);
  const selectedAttractions = tripState.selectedAttractions || [];
  const selectedRestaurants = tripState.selectedRestaurants || [];
  const selectedHotels = tripState.selectedHotels || [];

  const attractionNames = selectedAttractions.length
    ? selectedAttractions.map((item) => item.name).slice(0, 4)
    : [`${cityName}城市文化漫步区`, `${cityName}湖畔观景路线`, `${cityName}在地生活市集`];

  const restaurantName = selectedRestaurants[0]?.name || `${cityName}本帮风味餐厅`;
  const hotelName = selectedHotels[0]?.name || `${cityName}中心智选酒店`;

  const dailyPlans = Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const morning = attractionNames[index % attractionNames.length];
    const afternoon = attractionNames[(index + 1) % attractionNames.length];

    return `## Day ${day} - ${cityName}主题体验

**上午 09:30-12:00｜${morning}**

- 先完成核心景点游览，保留足够拍照和休息时间。
- AI 建议：上午人流相对可控，适合安排信息密度较高的体验。

**午餐 12:15-13:30｜${restaurantName}**

- 选择本地风味餐厅，控制交通时间，避免跨区域移动。

**下午 14:30-17:30｜${afternoon}**

- 下午安排更轻松的路线，适合慢走、咖啡休息和补充照片素材。

**晚上 19:00 以后｜自由活动**

- 返回 ${hotelName} 周边活动，减少夜间长距离通勤。`;
  }).join("\n\n");

  const content = `# ${cityName}${days}天智能旅行方案

> 当前为演示模式：以下内容由前端内置示例数据生成，用于在线预览完整 AI 行程流程。真实环境会调用后端 AI 服务生成动态行程。

## 行程策略

- **目的地**：${cityName}
- **出行人数**：${travelers} 人
- **推荐节奏**：上午集中游览，下午降低强度，晚上保留弹性时间。
- **AI 规划重点**：控制通勤、保留休息、兼顾城市文化和本地生活体验。

${dailyPlans}

## AI 总结

这份方案把核心景点、餐饮和住宿放在较短交通半径内，适合求职演示中展示“偏好输入 -> AI 推荐 -> 选择地点 -> 生成行程”的完整链路。`;

  return {
    id: `demo_trip_${Date.now()}`,
    content,
    aiProvider: "GoingTour Demo AI",
    processingTime: 1800,
    qualityScore: 92,
    destinationInfo: {
      name: cityName,
      coverImage: demoImage("photo-1500530855697-b586d89ba3ee"),
      isDemo: true,
    },
    tripBasicInfo: {
      days,
      travelers,
      budget: tripState.budget || "moderate",
    },
  };
};
