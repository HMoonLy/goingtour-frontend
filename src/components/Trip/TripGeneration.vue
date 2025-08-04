<template>
  <div class="step-content">
    <!-- AI提示词预览面板 -->
    <el-card class="ai-prompt-card"
shadow="hover">
      <template #header>
        <div class="ai-prompt-header">
          <div class="header-left">
            <el-icon size="18">
              <MagicStick />
            </el-icon>
            <span>AI提示词预览</span>
            <el-tag size="small"
:type="getPromptCompletionClass()">
              {{ getPromptCompletionText() }}
            </el-tag>
          </div>
          <div class="header-right">
            <el-tooltip content="查看完整提示词"
placement="top">
              <el-button type="info"
link @click="previewFullPrompt">
                <el-icon><View /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </template>

      <div class="ai-prompt-content">
        <div v-if="!generating && !generatedTrip">
          <div class="generation-intro">
            <el-icon size="48"
color="#409EFF">
              <MagicStick />
            </el-icon>
            <h3>准备生成您的专属行程</h3>
            <p>基于您的偏好和要求，AI将为您精心规划行程路线</p>
          </div>

          <div class="prompt-sections">
            <div class="prompt-section">
              <div class="section-header">
                <el-icon><MapLocation /></el-icon>
                <h4>基本信息</h4>
              </div>
              <div
                v-if="baseForm.destination && baseForm.days"
                class="prompt-text"
              >
                为我规划一次前往<span class="highlight">{{
                  getSelectedCityName()
                }}</span
                >的 <span class="highlight">{{ baseForm.days }}天</span>行程，
                共<span class="highlight">{{ baseForm.travelers }}人</span
                >出行， 预算约<span class="highlight">{{
                  getBudgetText()
                }}</span
                >。 出行日期为<span class="highlight">{{
                  formatDateRange(baseForm.dateRange)
                }}</span
                >。
              </div>
              <div v-else
class="prompt-placeholder">
                请填写基本信息（目的地、天数、日期等）
              </div>
            </div>

            <div class="prompt-section">
              <div class="section-header">
                <el-icon><User /></el-icon>
                <h4>个人偏好</h4>
              </div>
              <div
                v-if="hasUserPreferences"
                class="prompt-text"
              >
                我的旅行偏好是<span class="highlight">{{
                  selectedPreferenceTags.join("、")
                }}</span
                >。
                <template v-if="userPreferences.accommodationType">
                  住宿偏好<span class="highlight">{{
                    tagMapping[userPreferences.accommodationType] ||
                    userPreferences.accommodationType
                  }}</span
                  >。
                </template>
                <template v-if="userPreferences.travelPace">
                  旅行节奏偏好<span class="highlight">{{
                    tagMapping[userPreferences.travelPace] ||
                    userPreferences.travelPace
                  }}</span
                  >。
                </template>
                <template
                  v-if="
                    userPreferences.foodTastes &&
                    userPreferences.foodTastes.length > 0
                  "
                >
                  饮食偏好<span class="highlight">{{
                    userPreferences.foodTastes.map(taste => tagMapping[taste] || taste).join("、")
                  }}</span
                  >。
                </template>
              </div>
              <div v-else
class="prompt-placeholder">
                未设置个人偏好，可以在"个人中心-偏好设置"中设置
              </div>
            </div>

            <div class="prompt-section">
              <div class="section-header">
                <el-icon><MagicStick /></el-icon>
                <h4>本次行程偏好</h4>
              </div>
              <div
                v-if="
                  preferenceForm.tripStyle ||
                  preferenceForm.intensity ||
                  preferenceForm.focusAreas.length > 0
                "
                class="prompt-text"
              >
                <template v-if="preferenceForm.tripStyle">
                  本次行程风格为<span class="highlight">{{
                    getTripStyleText(preferenceForm.tripStyle)
                  }}</span
                  >。
                </template>
                <template v-if="preferenceForm.intensity">
                  活动强度为<span class="highlight">{{
                    getIntensityText(preferenceForm.intensity)
                  }}</span
                  >。
                </template>
                <template
                  v-if="
                    preferenceForm.focusAreas &&
                    preferenceForm.focusAreas.length > 0
                  "
                >
                  重点体验<span class="highlight">{{
                    getFocusAreasText(preferenceForm.focusAreas)
                  }}</span
                  >。
                </template>
                <template
                  v-if="
                    preferenceForm.specialExperiences &&
                    preferenceForm.specialExperiences.length > 0
                  "
                >
                  希望特别体验<span class="highlight">{{
                    getSpecialExperiencesText(preferenceForm.specialExperiences)
                  }}</span
                  >。
                </template>
                <template v-if="preferenceForm.specialRequirements">
                  特殊需求：<span class="highlight">{{
                    preferenceForm.specialRequirements
                  }}</span>
                </template>
              </div>
              <div v-else
class="prompt-placeholder">
                请在"个性化偏好"步骤中设置本次行程偏好
              </div>
            </div>

            <!-- 饮食禁忌部分 -->
            <div
              v-if="
                preferenceForm.dietaryRestrictions &&
                (preferenceForm.dietaryRestrictions.length > 0 ||
                  preferenceForm.customDietaryNotes)
              "
              class="prompt-section"
            >
              <div class="section-header">
                <el-icon><Food /></el-icon>
                <h4>饮食禁忌</h4>
              </div>
              <div class="prompt-text">
                <span
                  v-if="
                    preferenceForm.dietaryRestrictions &&
                    preferenceForm.dietaryRestrictions.length > 0
                  "
                  class="highlight"
                  >{{
                    getDietaryRestrictionsText(
                      preferenceForm.dietaryRestrictions,
                    )
                  }}</span
                >
                <template v-if="preferenceForm.customDietaryNotes">
                  <template
                    v-if="
                      preferenceForm.dietaryRestrictions &&
                      preferenceForm.dietaryRestrictions.length > 0
                    "
                  >
                    ，
                  </template>
                  <span class="highlight">{{
                    preferenceForm.customDietaryNotes
                  }}</span>
                </template>
              </div>
            </div>

            <!-- 季节性建议部分 -->
            <div v-if="getSeasonalSuggestions"
class="prompt-section">
              <div class="section-header">
                <el-icon><Calendar /></el-icon>
                <h4>季节性建议</h4>
              </div>
              <div class="prompt-text">
                请考虑<span class="highlight">{{
                  getSeasonalSuggestions.seasonName
                }}</span
                >的特点，
                <template
                  v-if="
                    getSeasonalSuggestions.activities &&
                    getSeasonalSuggestions.activities.length > 0
                  "
                >
                  可以安排<span class="highlight">{{
                    getSeasonalSuggestions.activities.join("、")
                  }}</span
                  >等季节性活动。
                </template>
                <template
                  v-if="
                    getSeasonalSuggestions.tips &&
                    getSeasonalSuggestions.tips.length > 0
                  "
                >
                  请注意：<span class="highlight">{{
                    getSeasonalSuggestions.tips.join("；")
                  }}</span
                  >。
                </template>
                <template
                  v-if="
                    getSeasonalSuggestions.avoid &&
                    getSeasonalSuggestions.avoid.length > 0
                  "
                >
                  需要避免的事项：<span class="highlight">{{
                    getSeasonalSuggestions.avoid.join("；")
                  }}</span
                  >。
                </template>
              </div>
            </div>

            <!-- 替换为天气建议部分 -->
            <div v-if="weatherSuggestion"
class="prompt-section">
              <div class="section-header">
                <el-icon><Sunny /></el-icon>
                <h4>天气建议</h4>
              </div>
              <div class="prompt-text">
                <p>
                  出行期间天气预计<span class="highlight">{{
                    weatherSuggestion.weatherDesc
                  }}</span
                  >， 气温<span class="highlight">{{
                    weatherSuggestion.tempRange
                  }}</span
                  >。
                </p>
                <template
                  v-if="
                    weatherSuggestion.activities &&
                    weatherSuggestion.activities.length > 0
                  "
                >
                  <p>
                    适合安排<span class="highlight">{{
                      weatherSuggestion.activities.join("、")
                    }}</span
                    >等活动。
                  </p>
                </template>
                <template
                  v-if="
                    weatherSuggestion.tips && weatherSuggestion.tips.length > 0
                  "
                >
                  <p>
                    建议：<span class="highlight">{{
                      weatherSuggestion.tips.join("；")
                    }}</span
                    >。
                  </p>
                </template>
                <template
                  v-if="
                    weatherSuggestion.avoid &&
                    weatherSuggestion.avoid.length > 0
                  "
                >
                  <p>
                    注意事项：<span class="highlight">{{
                      weatherSuggestion.avoid.join("；")
                    }}</span
                    >。
                  </p>
                </template>
              </div>
            </div>

            <!-- 天气加载状态 -->
            <div v-else-if="loadingWeather"
class="prompt-section">
              <div class="section-header">
                <el-icon><Loading /></el-icon>
                <h4>天气建议</h4>
              </div>
              <div class="prompt-text loading-text">
                正在获取天气数据，请稍候...
              </div>
            </div>

            <!-- 天气错误状态 -->
            <div v-else-if="weatherError"
class="prompt-section">
              <div class="section-header">
                <el-icon><Warning /></el-icon>
                <h4>天气建议</h4>
              </div>
              <div class="prompt-text error-text">
                获取天气数据失败: {{ weatherError }}
              </div>
            </div>

            <div class="prompt-section">
              <div class="section-header">
                <el-icon><Location /></el-icon>
                <h4>必去景点</h4>
              </div>
              <div v-if="selectedAttractions.length > 0"
class="prompt-text">
                必去景点：<span class="highlight">{{
                  selectedAttractions.map((a) => a.name).join("、")
                }}</span>
              </div>
              <div v-else
class="prompt-placeholder">
                未选择必去景点，可以从推荐景点中添加
              </div>
            </div>

            <div class="prompt-section">
              <div class="section-header">
                <el-icon><Shop /></el-icon>
                <h4>必去餐厅</h4>
              </div>
              <div v-if="selectedRestaurants.length > 0"
class="prompt-text">
                必去餐厅：<span class="highlight">{{
                  selectedRestaurants.map((r) => r.name).join("、")
                }}</span>
              </div>
              <div v-else
class="prompt-placeholder">
                未选择必去餐厅，可以从推荐餐厅中添加
              </div>
            </div>
          </div>

          <div class="prompt-actions">
            <el-button
              type="primary"
              size="large"
              :disabled="!canGenerateTrip"
              @click="generateTrip"
            >
              <el-icon><MagicStick /></el-icon>
              使用此提示词生成行程
            </el-button>
          </div>
        </div>

        <div v-if="generating"
class="generating">
          <el-icon size="64"
color="#409EFF" class="rotating">
            <Loading />
          </el-icon>
          <h3>AI正在为您生成行程...</h3>
          <p>{{ generationProgress }}</p>
          <el-progress :percentage="progressPercent"
:stroke-width="8" />
        </div>

        <div v-if="generatedTrip && !generating"
class="generation-complete">
          <el-icon size="48"
color="#67C23A">
            <Check />
          </el-icon>
          <h3>行程生成完成！</h3>
          <p>
            为您推荐了 {{ generatedTrip?.attractions?.length || 0 }} 个景点和
            {{ generatedTrip?.restaurants?.length || 0 }} 家餐厅
          </p>
          <el-button type="primary"
size="large" @click="$emit('next-step')">
            查看行程详情
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 步骤操作按钮 -->
    <div v-if="!generating && !generatedTrip"
class="step-actions">
      <el-button size="large"
@click="$emit('prev-step')">
        <el-icon><ArrowLeft /></el-icon>
        上一步
      </el-button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  MapLocation,
  User,
  MagicStick,
  Calendar,
  Loading,
  Check,
  Shop,
  Money,
  View,
  Location,
  Food,
  Warning,
  Sunny,
  ArrowLeft,
  ArrowRight,
} from "@element-plus/icons-vue";

export default {
  name: "TripGeneration",
  components: {
    MapLocation,
    User,
    MagicStick,
    Calendar,
    Loading,
    Check,
    Shop,
    Money,
    View,
    Location,
    Food,
    Warning,
    Sunny,
    ArrowLeft,
    ArrowRight,
  },
  props: {
    // 基础表单数据
    baseForm: {
      type: Object,
      required: true,
    },
    // 偏好表单数据
    preferenceForm: {
      type: Object,
      required: true,
    },
    // 用户偏好数据
    userPreferences: {
      type: Object,
      default: () => ({}),
    },
    // 选择的景点
    selectedAttractions: {
      type: Array,
      default: () => [],
    },
    // 选择的餐厅
    selectedRestaurants: {
      type: Array,
      default: () => [],
    },
    // 额外需求
    extraRequirements: {
      type: String,
      default: "",
    },
    // 天气建议
    weatherSuggestion: {
      type: Object,
      default: null,
    },
    // 天气加载状态
    loadingWeather: {
      type: Boolean,
      default: false,
    },
    // 天气错误状态
    weatherError: {
      type: String,
      default: null,
    },
    // 生成的行程
    generatedTrip: {
      type: Object,
      default: null,
    },
    // 生成状态
    generating: {
      type: Boolean,
      default: false,
    },
    // 生成进度
    generationProgress: {
      type: String,
      default: "",
    },
    // 进度百分比
    progressPercent: {
      type: Number,
      default: 0,
    },
  },
  emits: [
    "update:extraRequirements",
    "generation-complete",
    "next-step",
    "prev-step",
  ],
  setup(props, { emit }) {
    // 使用父组件传递的数据
    const generatedTrip = computed({
      get: () => props.generatedTrip,
      set: (value) => emit("update:generatedTrip", value),
    });

    // 完整的标签映射表
    const tagMapping = {
      // 旅行类型和兴趣
      nature: "自然风光",
      culture: "文化体验",
      relaxation: "休闲放松",
      food: "美食探索",
      shopping: "购物娱乐",
      nightlife: "夜生活",
      adventure: "冒险体验",
      photography: "摄影打卡",
      history: "历史古迹",
      historical: "历史文化",
      art: "艺术文化",
      sports: "运动健身",
      family: "亲子出游",
      couple: "情侣出行",
      solo: "独行",
      group: "团体出行",
      luxury: "奢华体验",
      budget: "经济实惠",
      local_life: "体验当地生活",
      festivals: "节庆活动",
      beaches: "海滩度假",
      mountains: "山景",
      cities: "城市探索",
      countryside: "乡村体验",
      urban: "都市风情",

      // 交通偏好
      public: "公共交通",
      walk: "步行出行",
      bicycle: "骑行",
      taxi: "打车出行",
      car: "自驾",

      // 住宿类型
      comfort: "舒适便利",
      hotel: "酒店住宿",
      hostel: "青旅住宿",
      apartment: "公寓民宿",

      // 旅行节奏
      slow: "慢节奏",
      medium: "适中节奏",
      fast: "快节奏",
      relaxed: "轻松休闲",
      moderate: "适中节奏",
      intensive: "紧凑高效",

      // 数字形式的旅行节奏
      1: "慢节奏",
      2: "悠闲型",
      3: "平衡型",
      4: "紧凑型",
      5: "暴走型",

      // 美食偏好
      spicy: "辣味美食",
      sweet: "甜味美食",
      sour: "酸味美食",
      bitter: "苦味美食",
      salty: "咸味美食",

      // 时间偏好
      morning: "上午",
      afternoon: "下午",
      evening: "晚上",
      night: "夜间",
    };

    // 城市信息数据库
    const cityInfoDatabase = {
      beijing: {
        name: "北京",
        description: "千年古都，文化底蕴深厚",
      },
      shanghai: {
        name: "上海",
        description: "国际化大都市，东西文化交汇",
      },
    };

    // 计算用户偏好标签的中文显示
    const selectedPreferenceTags = computed(() => {
      if (!props.userPreferences) return [];
      const tags = [];

      // 从旅行类型标签中提取并转换为中文
      if (props.userPreferences.selectedTags?.length > 0) {
        props.userPreferences.selectedTags.forEach((tag) => {
          const chineseTag = tagMapping[tag] || tag;
          tags.push(chineseTag);
        });
      }

      // 从其他各种偏好中提取标签
      if (props.userPreferences.selectedTransports?.length > 0) {
        props.userPreferences.selectedTransports.forEach((transport) => {
          const chineseTag = tagMapping[transport];
          if (chineseTag) tags.push(chineseTag);
        });
      }

      if (props.userPreferences.accommodationType) {
        const chineseTag = tagMapping[props.userPreferences.accommodationType];
        if (chineseTag) tags.push(chineseTag);
      }

      if (props.userPreferences.travelPace) {
        const chineseTag = tagMapping[props.userPreferences.travelPace];
        if (chineseTag) tags.push(chineseTag);
      }

      if (props.userPreferences.foodTastes?.length > 0) {
        props.userPreferences.foodTastes.forEach((taste) => {
          const chineseTag = tagMapping[taste] || taste;
          tags.push(chineseTag);
        });
      }

      return [...new Set(tags)].slice(0, 15);
    });

    // 判断用户是否有设置偏好
    const hasUserPreferences = computed(() => {
      if (!props.userPreferences) return false;
      
      // 检查是否有任何偏好设置
      return !!(
        props.userPreferences.selectedTags?.length > 0 ||
        props.userPreferences.selectedTransports?.length > 0 ||
        props.userPreferences.accommodationType ||
        props.userPreferences.travelPace ||
        props.userPreferences.foodTastes?.length > 0 ||
        props.userPreferences.dietaryRestrictions?.length > 0 ||
        props.userPreferences.mbtiType ||
        props.userPreferences.budget
      );
    });

    // 获取城市名称
    const getSelectedCityName = () => {
      if (!props.baseForm) {
        return "未选择";
      }

      // 优先使用destinationName（中文名称）
      if (props.baseForm.destinationName) {
        return props.baseForm.destinationName;
      }

      // 如果没有destinationName，尝试从cityInfoDatabase获取
      if (props.baseForm.destination) {
        const cityCode = props.baseForm.destination;
        if (cityInfoDatabase[cityCode]) {
          return cityInfoDatabase[cityCode].name;
        }
        // 没有找到城市信息，返回城市代码
        return cityCode;
      }

      return "未选择";
    };

    // 格式化日期范围显示
    const formatDateRange = () => {
      if (!props.baseForm.dateRange || props.baseForm.dateRange.length !== 2) {
        return "未设置";
      }
      const startDate = new Date(props.baseForm.dateRange[0]);
      const endDate = new Date(props.baseForm.dateRange[1]);
      return `${startDate.toLocaleDateString()} 至 ${endDate.toLocaleDateString()}`;
    };

    // 获取预算文本
    const getBudgetText = () => {
      const budgetMap = {
        budget: { text: "经济实惠", price: "约400元/天" },
        moderate: { text: "适中舒适", price: "约750元/天" },
        comfort: { text: "舒适便利", price: "约1000元/天" },
        luxury: { text: "豪华奢华", price: "约1500元/天" },
      };

      const option = budgetMap[props.baseForm.budget];
      if (!option) return "";

      return `${option.text}(${option.price})`;
    };

    // 获取不同偏好的文本表示
    const getTripStyleText = (style) => {
      if (!style) return "";
      const styleMap = {
        relaxed: "放松休闲型",
        cultural: "文化体验型",
        adventure: "探险刺激型",
        foodie: "美食享受型",
        shopping: "购物休闲型",
        nature: "自然探索型",
        balanced: "均衡体验型",
      };
      return styleMap[style] || style;
    };

    const getIntensityText = (intensity) => {
      if (!intensity) return "";
      const intensityMap = {
        relaxed: "轻松舒适",
        moderate: "适中平衡",
        intensive: "充实紧凑",
      };
      return intensityMap[intensity] || intensity;
    };

    const getFocusAreasText = (areas) => {
      if (!areas || areas.length === 0) return "";
      const areaMap = {
        historical_culture: "历史文化",
        historical: "历史文化",
        art_culture: "艺术文化",
        art: "艺术博物",
        natural_scenery: "自然风光",
        nature: "自然风光",
        local_cuisine: "地道美食",
        food_experience: "美食体验",
        food: "美食体验",
        shopping: "购物休闲",
        entertainment: "娱乐活动",
        sports: "体育运动",
        urban_lifestyle: "都市生活",
        urban_life: "都市风情",
        rural_life: "乡村风光",
        local_culture: "风土人情",
        photo_spots: "网红打卡",
        leisure_entertainment: "休闲娱乐",
        outdoor_adventure: "户外探险",
        modern_technology: "现代科技",
        traditional_crafts: "传统工艺",
        religious_sites: "宗教文化",
        local_festivals: "节庆活动",
        wellness: "健康养生",
        nightlife: "夜生活",
      };
      return areas.map((area) => areaMap[area] || area).join("、");
    };

    const getSpecialExperiencesText = (experiences) => {
      if (!experiences || experiences.length === 0) return "";
      const expMap = {
        local_events: "当地节庆活动",
        workshops: "传统工艺体验",
        performances: "文化表演",
        hidden_gems: "小众景点",
        night_activities: "夜间活动",
      };
      return experiences.map((exp) => expMap[exp] || exp).join("、");
    };

    const getDietaryRestrictionsText = (restrictions) => {
      if (!restrictions || restrictions.length === 0) return "";
      const restrictionMap = {
        halal: "清真饮食",
        vegetarian: "素食",
        vegan: "纯素食",
        no_pork: "不吃猪肉",
        no_beef: "不吃牛肉",
        no_seafood: "不吃海鲜",
        no_spicy: "不吃辣",
        gluten_free: "无麸质",
      };
      return restrictions.map((r) => restrictionMap[r] || r).join("、");
    };

    // 季节性建议数据
    const seasonalSuggestions = {
      spring: {
        beijing: {
          activities: ["赏花", "踏青", "公园游览"],
          tips: [
            "春季是北京最佳旅游季节之一，气候宜人",
            "可以去颐和园、北海公园赏花",
          ],
          avoid: ["春季北京可能有沙尘天气，请关注天气预报"],
        },
        shanghai: {
          activities: ["赏花", "城市公园", "户外咖啡"],
          tips: [
            "春季上海温度适宜，非常适合户外活动",
            "可以去外滩、豫园感受春日氛围",
          ],
          avoid: ["春季上海多雨，请携带雨具"],
        },
      },
      summer: {
        beijing: {
          activities: ["室内博物馆", "晚间活动", "水上项目"],
          tips: [
            "夏季北京较热，建议早晚游览，中午休息",
            "可以去室内场所如故宫博物院、国家博物馆",
          ],
          avoid: ["避免中午高温时段户外活动", "注意防晒补水"],
        },
        shanghai: {
          activities: ["水上活动", "室内购物", "夜游"],
          tips: [
            "夏季上海炎热多雨，建议携带遮阳伞",
            "可以去室内场所如博物馆、购物中心",
          ],
          avoid: ["避开午后高温时段", "注意防暑降温"],
        },
      },
      autumn: {
        beijing: {
          activities: ["赏红叶", "登长城", "户外徒步"],
          tips: [
            "秋季是北京最佳旅游季节，天高气爽",
            "可以去香山、颐和园赏红叶",
          ],
          avoid: ["秋季温差较大，请准备适当衣物"],
        },
        shanghai: {
          activities: ["户外活动", "公园游览", "外滩漫步"],
          tips: [
            "秋季上海气候宜人，适合各类户外活动",
            "可以去外滩、豫园、静安寺游览",
          ],
          avoid: ["秋季仍有雨天，请关注天气预报"],
        },
      },
      winter: {
        beijing: {
          activities: ["滑雪", "温泉", "室内活动"],
          tips: [
            "冬季北京寒冷干燥，请做好保暖措施",
            "可以去故宫、博物馆等室内场所",
          ],
          avoid: ["注意防寒保暖", "雪天路滑，注意安全"],
        },
        shanghai: {
          activities: ["室内活动", "美食", "购物"],
          tips: [
            "冬季上海湿冷，建议穿着保暖防潮",
            "可以去室内场所如博物馆、购物中心",
          ],
          avoid: ["注意防寒防潮", "雨天路滑，注意安全"],
        },
      },
    };

    // 获取当前季节
    const getCurrentSeason = (date) => {
      if (!date) return null;

      const month = new Date(date).getMonth() + 1; // 月份从0开始，需要+1

      if (month >= 3 && month <= 5) return "spring"; // 春季：3-5月
      if (month >= 6 && month <= 8) return "summer"; // 夏季：6-8月
      if (month >= 9 && month <= 11) return "autumn"; // 秋季：9-11月
      return "winter"; // 冬季：12-2月
    };

    // 获取季节名称
    const getSeasonName = (season) => {
      const seasonMap = {
        spring: "春季",
        summer: "夏季",
        autumn: "秋季",
        winter: "冬季",
      };
      return seasonMap[season] || season;
    };

    // 获取季节性建议
    const getSeasonalSuggestions = computed(() => {
      if (
        !props.baseForm.dateRange ||
        props.baseForm.dateRange.length !== 2 ||
        !props.baseForm.destination
      ) {
        return null;
      }

      const season = getCurrentSeason(props.baseForm.dateRange[0]);
      const city = props.baseForm.destination.toLowerCase();

      // 如果没有特定城市的季节建议，返回null
      if (
        !season ||
        !seasonalSuggestions[season] ||
        !seasonalSuggestions[season][city]
      ) {
        return null;
      }

      return {
        season,
        seasonName: getSeasonName(season),
        ...seasonalSuggestions[season][city],
      };
    });

    // 生成提示词完整度评估
    const getPromptCompletionScore = () => {
      let score = 0;

      // 基本信息 (40分)
      if (props.baseForm.destination) score += 10;
      if (props.baseForm.days) score += 10;
      if (props.baseForm.dateRange && props.baseForm.dateRange.length === 2)
        score += 10;
      if (props.baseForm.budget) score += 10;

      // 个人偏好 (20分)
      if (props.userPreferences && selectedPreferenceTags.value.length > 0)
        score += 10;
      if (props.userPreferences && props.userPreferences.travelPace) score += 5;
      if (
        props.userPreferences &&
        props.userPreferences.foodTastes &&
        props.userPreferences.foodTastes.length > 0
      )
        score += 5;

      // 本次行程偏好 (30分)
      if (props.preferenceForm.tripStyle) score += 10;
      if (props.preferenceForm.intensity) score += 10;
      if (
        props.preferenceForm.focusAreas &&
        props.preferenceForm.focusAreas.length > 0
      )
        score += 10;

      // 必去景点和餐厅 (10分)
      if (props.selectedAttractions.length > 0) score += 5;
      if (props.selectedRestaurants.length > 0) score += 5;

      return score;
    };

    // 获取提示词完成度样式
    const getPromptCompletionClass = () => {
      const score = getPromptCompletionScore();
      if (score >= 80) return "success";
      if (score >= 50) return "warning";
      return "danger";
    };

    // 获取提示词完成度文本
    const getPromptCompletionText = () => {
      const score = getPromptCompletionScore();
      if (score >= 80) return "完善度高";
      if (score >= 50) return "基本完善";
      return "需完善";
    };

    // 生成完整提示词文本
    const generatePromptText = () => {
      let prompt = "";

      // 基本信息
      if (props.baseForm.destination && props.baseForm.days) {
        prompt += `为我规划一次前往${getSelectedCityName()}的${props.baseForm.days}天行程，共${props.baseForm.travelers}人出行，`;
        prompt += `预算约${getBudgetText()}。`;
        if (props.baseForm.dateRange && props.baseForm.dateRange.length === 2) {
          prompt += `出行日期为${formatDateRange()}。\n\n`;
        } else {
          prompt += "\n\n";
        }
      }

      // 个人偏好
      if (props.userPreferences && selectedPreferenceTags.value.length > 0) {
        prompt += `我的旅行偏好是${selectedPreferenceTags.value.join("、")}。`;
        if (props.userPreferences.accommodationType) {
          prompt += `住宿偏好${tagMapping[props.userPreferences.accommodationType] || props.userPreferences.accommodationType}。`;
        }
        if (props.userPreferences.travelPace) {
          prompt += `旅行节奏偏好${tagMapping[props.userPreferences.travelPace] || props.userPreferences.travelPace}。`;
        }
        if (
          props.userPreferences.foodTastes &&
          props.userPreferences.foodTastes.length > 0
        ) {
          prompt += `饮食偏好${props.userPreferences.foodTastes.join("、")}。`;
        }
        prompt += "\n\n";
      }

      // 本次行程偏好
      if (
        props.preferenceForm.tripStyle ||
        props.preferenceForm.intensity ||
        props.preferenceForm.focusAreas.length > 0
      ) {
        if (props.preferenceForm.tripStyle) {
          prompt += `本次行程风格为${getTripStyleText(props.preferenceForm.tripStyle)}。`;
        }
        if (props.preferenceForm.intensity) {
          prompt += `活动强度为${getIntensityText(props.preferenceForm.intensity)}。`;
        }
        if (props.preferenceForm.focusAreas.length > 0) {
          prompt += `重点体验${getFocusAreasText(props.preferenceForm.focusAreas)}。`;
        }
        if (
          props.preferenceForm.specialExperiences &&
          props.preferenceForm.specialExperiences.length > 0
        ) {
          prompt += `希望特别体验${getSpecialExperiencesText(props.preferenceForm.specialExperiences)}。`;
        }
        if (props.preferenceForm.specialRequirements) {
          prompt += `特殊需求：${props.preferenceForm.specialRequirements}。`;
        }
        prompt += "\n\n";
      }

      // 季节性建议
      if (getSeasonalSuggestions.value) {
        prompt += `请考虑${getSeasonalSuggestions.value.seasonName}的特点，`;
        if (
          getSeasonalSuggestions.value.activities &&
          getSeasonalSuggestions.value.activities.length > 0
        ) {
          prompt += `可以安排${getSeasonalSuggestions.value.activities.join("、")}等季节性活动。`;
        }
        if (
          getSeasonalSuggestions.value.tips &&
          getSeasonalSuggestions.value.tips.length > 0
        ) {
          prompt += `请注意：${getSeasonalSuggestions.value.tips.join("；")}。`;
        }
        if (
          getSeasonalSuggestions.value.avoid &&
          getSeasonalSuggestions.value.avoid.length > 0
        ) {
          prompt += `需要避免的事项：${getSeasonalSuggestions.value.avoid.join("；")}。`;
        }
        prompt += "\n\n";
      }

      // 天气建议
      if (props.weatherSuggestion) {
        prompt += `出行期间天气预计${props.weatherSuggestion.weatherDesc}，气温${props.weatherSuggestion.tempRange}。`;

        if (
          props.weatherSuggestion.activities &&
          props.weatherSuggestion.activities.length > 0
        ) {
          prompt += `适合安排${props.weatherSuggestion.activities.join("、")}等活动。`;
        }

        if (
          props.weatherSuggestion.tips &&
          props.weatherSuggestion.tips.length > 0
        ) {
          prompt += `建议：${props.weatherSuggestion.tips.join("；")}。`;
        }

        if (
          props.weatherSuggestion.avoid &&
          props.weatherSuggestion.avoid.length > 0
        ) {
          prompt += `注意事项：${props.weatherSuggestion.avoid.join("；")}。`;
        }

        prompt += "\n\n";
      }

      // 饮食禁忌
      // 饮食禁忌
      if (
        props.preferenceForm.dietaryRestrictions &&
        (props.preferenceForm.dietaryRestrictions.length > 0 ||
          props.preferenceForm.customDietaryNotes)
      ) {
        prompt += "饮食禁忌：";
        if (
          props.preferenceForm.dietaryRestrictions &&
          props.preferenceForm.dietaryRestrictions.length > 0
        ) {
          prompt += getDietaryRestrictionsText(
            props.preferenceForm.dietaryRestrictions,
          );
        }
        if (props.preferenceForm.customDietaryNotes) {
          if (
            props.preferenceForm.dietaryRestrictions &&
            props.preferenceForm.dietaryRestrictions.length > 0
          ) {
            prompt += "，";
          }
          prompt += props.preferenceForm.customDietaryNotes;
        }
        prompt += "。\n\n";
      }

      // 必去景点和餐厅
      if (props.selectedAttractions.length > 0) {
        prompt += `必去景点：${props.selectedAttractions.map((a) => a.name).join("、")}。\n`;
      }
      if (props.selectedRestaurants.length > 0) {
        prompt += `必去餐厅：${props.selectedRestaurants.map((r) => r.name).join("、")}。\n`;
      }

      return prompt;
    };

    // 预览完整提示词
    const previewFullPrompt = () => {
      const promptText = generatePromptText();
      ElMessage({
        message: "完整提示词已生成",
        type: "info",
        duration: 2000,
      });
      // 这里需要实现弹窗显示完整提示词，可以根据实际UI需要替换
      // 例如使用Element Plus的MessageBox
      ElMessageBox.alert(promptText, "AI提示词预览", {
        confirmButtonText: "确定",
        dangerouslyUseHTMLString: false,
        customClass: "full-prompt-preview",
      });
    };

    // 检查是否可以生成行程
    const canGenerateTrip = computed(() => {
      return (
        props.baseForm.destination &&
        props.baseForm.days &&
        props.baseForm.travelers
      );
    });

    // 生成行程
    const generateTrip = async () => {
      if (!canGenerateTrip.value) {
        ElMessage.warning("请先完善基本信息");
        return;
      }

      try {
        // 状态设置
        generating.value = true;
        generationProgress.value = "正在分析您的偏好...";
        progressPercent.value = 0;

        // 模拟AI生成过程的各个步骤
        const steps = [
          {
            text: "正在分析您的偏好...",
            percent: 10,
            action: () => analyzePreferences(),
          },
          {
            text: "搜索推荐景点...",
            percent: 30,
            action: () => fetchAttractions(),
          },
          {
            text: "筛选优质餐厅...",
            percent: 50,
            action: () => fetchRestaurants(),
          },
          {
            text: "规划最佳路线...",
            percent: 70,
            action: () => optimizeRoute(),
          },
          {
            text: "生成完整行程...",
            percent: 90,
            action: () => buildDailyPlan(),
          },
          {
            text: "行程生成完成！",
            percent: 100,
            action: null,
          },
        ];

        let attractions = [];
        let restaurants = [];

        for (const step of steps) {
          generationProgress.value = step.text;
          progressPercent.value = step.percent;

          if (step.action) {
            const result = await step.action();
            if (result?.attractions) attractions = result.attractions;
            if (result?.restaurants) restaurants = result.restaurants;
          }

          // 每步延迟，提供真实的生成体验
          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        // 构建最终行程数据
        const tripData = {
          attractions,
          restaurants,
          dailyPlan: createOptimizedDailyPlan(attractions, restaurants),
        };

        console.log("🎉 行程生成完成:", tripData);

        // 将生成的行程数据传递给父组件
        emit("generation-complete", tripData);
      } catch (error) {
        console.error("❌ 行程生成失败:", error);
        ElMessage.error("行程生成失败，请重试");
      } finally {
        generating.value = false;
      }
    };

    // 创建优化的每日计划 (简化版)
    const createOptimizedDailyPlan = (attractions, restaurants) => {
      const days = props.baseForm.days || 1;
      const plans = [];

      // 简单分配景点和餐厅
      for (let dayIndex = 0; dayIndex < days; dayIndex++) {
        const activities = [];

        // 上午景点
        if (attractions[dayIndex % attractions.length]) {
          const attraction = attractions[dayIndex % attractions.length];
          activities.push({
            time: "09:00",
            name: attraction.name,
            description: attraction.description || "精彩景点等你探索",
            tags: attraction.tags || ["景点"],
            type: "attraction",
            data: attraction,
          });
        }

        // 午餐
        if (restaurants[dayIndex % restaurants.length]) {
          const restaurant = restaurants[dayIndex % restaurants.length];
          activities.push({
            time: "12:00",
            name: restaurant.name,
            description: restaurant.description || "美味佳肴等你品尝",
            tags: restaurant.tags || ["餐厅"],
            type: "restaurant",
            data: restaurant,
          });
        }

        // 下午景点 (如果有足够的景点)
        if (attractions[(dayIndex + 1) % attractions.length]) {
          const attraction = attractions[(dayIndex + 1) % attractions.length];
          activities.push({
            time: "14:30",
            name: attraction.name,
            description: attraction.description || "精彩景点等你探索",
            tags: attraction.tags || ["景点"],
            type: "attraction",
            data: attraction,
          });
        }

        plans.push({ activities });
      }

      return plans;
    };

    // 分析用户偏好
    const analyzePreferences = async () => {
      console.log("🧠 分析用户偏好中...");
      return Promise.resolve();
    };

    // 获取景点数据 (简化版)
    const fetchAttractions = async () => {
      return {
        attractions: [
          {
            id: "1",
            name: "故宫博物院",
            description:
              "中国明清两代的皇家宫殿，世界上现存规模最大、保存最为完整的木质结构古建筑之一。",
            rating: "4.8",
            tags: ["历史古迹", "博物馆", "宫殿"],
          },
          {
            id: "2",
            name: "长城",
            description: "中国古代的伟大防御工程，是中华民族的象征之一。",
            rating: "4.9",
            tags: ["历史古迹", "自然风光", "世界遗产"],
          },
          {
            id: "3",
            name: "颐和园",
            description:
              "中国清朝时期的皇家园林，以昆明湖、万寿山为基址，以杭州西湖为蓝本。",
            rating: "4.7",
            tags: ["园林", "湖泊", "历史景点"],
          },
        ],
      };
    };

    // 获取餐厅数据 (简化版)
    const fetchRestaurants = async () => {
      return {
        restaurants: [
          {
            id: "1",
            name: "全聚德烤鸭店",
            description: "北京著名的烤鸭老字号，以其独特的挂炉烤鸭而闻名。",
            rating: "4.6",
            tags: ["中餐", "烤鸭", "老字号"],
          },
          {
            id: "2",
            name: "南锣鼓巷小吃街",
            description: "汇集了众多北京传统小吃的美食街区。",
            rating: "4.5",
            tags: ["小吃", "传统美食", "街区"],
          },
        ],
      };
    };

    // 优化路线
    const optimizeRoute = async () => {
      console.log("🗺️ 优化路线中...");
      return Promise.resolve();
    };

    // 构建每日计划
    const buildDailyPlan = async () => {
      console.log("📅 构建每日计划中...");
      return Promise.resolve();
    };

    // 定义状态变量
    const generating = ref(false);
    const generationProgress = ref("准备中...");
    const progressPercent = ref(0);

    // 组件挂载时的处理
    onMounted(() => {
      console.log("🚀 TripGeneration组件挂载");
    });

    return {
      generatePromptText,
      previewFullPrompt,
      getPromptCompletionClass,
      getPromptCompletionText,
      canGenerateTrip,
      generateTrip,
      generatedTrip,
      generating,
      generationProgress,
      progressPercent,
      getSelectedCityName,
      formatDateRange,
      getBudgetText,
      getTripStyleText,
      getIntensityText,
      getFocusAreasText,
      getSpecialExperiencesText,
      getDietaryRestrictionsText,
      getSeasonalSuggestions,
      selectedPreferenceTags,
      hasUserPreferences,
    };
  },
};
</script>

<style scoped>
.ai-prompt-card {
  border-radius: 8px;
  margin-bottom: 24px;
}

.ai-prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-prompt-content {
  padding: 0;
}

.generation-intro {
  text-align: center;
  margin-bottom: 24px;
  padding: 24px 0;
}

.generation-intro h3 {
  margin: 16px 0 8px;
  font-weight: 600;
}

.generation-intro p {
  color: #606266;
}

.prompt-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
}

.prompt-section {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
  background-color: #fafafa;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.section-header h4 {
  margin: 0;
  font-weight: 500;
  font-size: 15px;
}

.prompt-text {
  color: #303133;
  line-height: 1.6;
  font-size: 14px;
}

.prompt-placeholder {
  color: #c0c4cc;
  font-style: italic;
  font-size: 14px;
}

.highlight {
  color: #409eff;
  font-weight: 500;
}

.error-text {
  color: #f56c6c;
}

.loading-text {
  color: #909399;
}

.prompt-actions {
  text-align: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.generating {
  text-align: center;
  padding: 40px 20px;
}

.generating h3 {
  margin: 16px 0 8px;
  font-weight: 600;
}

.generating p {
  margin-bottom: 24px;
  color: #606266;
}

.rotating {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.generation-complete {
  text-align: center;
  padding: 40px 20px;
}

.generation-complete h3 {
  margin: 16px 0 8px;
  font-weight: 600;
  color: #67c23a;
}

.generation-complete p {
  color: #606266;
}

.step-content {
  width: 100%;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .prompt-section {
    padding: 12px;
  }

  .prompt-text {
    font-size: 13px;
  }

  .generating,
  .generation-complete {
    padding: 20px 12px;
  }
}
</style>
