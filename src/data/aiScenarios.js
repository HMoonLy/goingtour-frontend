// AI 场景化入口预设（可映射为提示词片段或参数）

export const aiScenarios = [
  {
    id: "changsha-food-3d",
    title: "长沙美食 · 3天",
    desc: "苍蝇馆+地方小吃为主，避开排队",
    city: { adcode: "430100", name: "长沙市" },
    cover: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80",
    preset: {
      baseForm: { days: 3 },
      preferenceForm: {
        tripGoals: ["food"],
        pacePreference: "balanced",
        focusAreas: ["food", "market"],
        specialRequirements: "避免网红排队店，注重口味与在地体验",
      },
      ai: {
        hint: "以长沙为目的地的美食主题行程，注重在地口味与小众餐厅，尽量避开排队。",
      },
    },
  },
  {
    id: "sichuan-ring-5d",
    title: "川西小环线 · 5天",
    desc: "自然风光+轻徒步，避开高强度线路",
    city: { adcode: "510100", name: "成都市" },
    cover: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    preset: {
      baseForm: { days: 5 },
      preferenceForm: {
        tripGoals: ["nature", "hiking"],
        pacePreference: "balanced",
        focusAreas: ["mountain", "viewpoint"],
      },
      ai: {
        hint: "川西小环线的自然风光行程，强度中等，安排观景与轻徒步。",
      },
    },
  },
  {
    id: "weekend-citywalk-2d",
    title: "周末 Citywalk · 2天",
    desc: "小众街区+咖啡馆+步行优先",
    // 该场景为泛城市，可不带默认城市
    cover: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
    preset: {
      baseForm: { days: 2 },
      preferenceForm: {
        tripGoals: ["relax", "citywalk"],
        pacePreference: "casual",
        focusAreas: ["culture", "cafe"],
      },
      ai: {
        hint: "强调 citywalk、小众街区和咖啡馆的周末轻旅行。",
      },
    },
  },
  {
    id: "shanghai-weekend-food-2d",
    title: "上海周末美食 · 2天",
    desc: "本帮菜+市集/咖啡，夜宵/夜生活",
    city: { adcode: "310000", name: "上海市" },
    // 首页卡片可选配封面图（尺寸建议 600x300 或 3:2）
    cover: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80",
    preset: {
      baseForm: { days: 2 },
      preferenceForm: {
        tripGoals: ["food"],
        pacePreference: "balanced",
        focusAreas: ["food", "market", "nightlife"],
      },
      ai: {
        hint: "以上海为目的地，强调地道本帮菜与夜宵场景，结合市集/咖啡小憩。",
      },
    },
  },
];

export function findScenarioById(id) {
  return aiScenarios.find((s) => s.id === id);
}
