<template>
  <div class="step-content">
    <div class="city-guide-container">
      <div class="guide-section">
        <!-- 景点推荐卡片 -->
        <el-card class="recommendation-card" shadow="hover">
          <template #header>
            <div class="recommendation-header">
              <h3>
                <el-icon><Location /></el-icon>
                {{ cityInfo?.name || "目的地" }}推荐景点
              </h3>
              <el-tag size="small" type="success">高德地图数据</el-tag>
            </div>
          </template>

          <div v-if="loadingAttractions" class="loading-state">
            <el-skeleton :rows="3" animated />
          </div>

          <div
            v-else-if="recommendedAttractions.length === 0 && !apiError"
            class="empty-state"
          >
            <el-empty description="暂无推荐景点" />
          </div>

          <div v-else if="apiError" class="error-state">
            <el-alert
              :title="apiError"
              type="error"
              :closable="false"
              show-icon
            />
          </div>

          <div v-else class="recommendation-list">
            <div
              v-for="attraction in recommendedAttractions"
              :key="attraction.id"
              class="recommendation-item vertical-layout"
            >
              <div class="recommendation-image">
                <img
                  v-if="attraction.photos && attraction.photos.length > 0"
                  :src="attraction.photos[0].url"
                  :alt="attraction.name"
                  @error="
                    (e) =>
                      (e.target.src =
                        'https://via.placeholder.com/300x200?text=景点')
                  "
                />
                <div v-else class="no-image">
                  <el-icon><Picture /></el-icon>
                </div>
              </div>
              <div class="recommendation-content">
                <h4 :title="attraction.name" class="full-width-name">
                  {{ attraction.name }}
                </h4>
                <div class="recommendation-rating rating-with-number">
                  <el-rate
                    :model-value="Number(attraction.rating)"
                    disabled
                    text-color="#ff9900"
                  />
                  <span class="rating-value">{{ attraction.rating }}</span>
                </div>
                <div class="recommendation-tags">
                  <el-tag size="small" type="success" class="category-tag"
                    >风景名胜</el-tag
                  >
                  <el-tag size="small" class="tag-item">{{
                    attraction.type
                  }}</el-tag>
                </div>
                
                <!-- 景点标签信息 -->
                <div class="attraction-tags">
                  <p class="tags-title">
                    <el-icon><Star /></el-icon>
                    景点特色:
                  </p>
                  <div v-if="extractAttractionTags(attraction).length > 0" class="feature-tags">
                    <el-tag
                      v-for="(tag, index) in extractAttractionTags(attraction).slice(0, 3)"
                      :key="index"
                      size="small"
                      effect="plain"
                      type="info"
                      class="feature-tag"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                  <div v-else class="feature-tags">
                    <el-tag
                      size="small"
                      effect="plain"
                      type="info"
                      class="feature-tag empty-tag"
                    >
                      无
                    </el-tag>
                  </div>
                </div>
                
                <p class="recommendation-address">
                  <el-icon><Location /></el-icon>
                  <span class="address-text">{{
                    attraction.address || "暂无地址信息"
                  }}</span>
                </p>
                
                <!-- 添加到计划按钮 -->
                <div class="add-to-plan">
                  <el-button
                    v-if="!isAttractionSelected(attraction)"
                    type="success"
                    size="small"
                    plain
                    @click="addAttractionToPlan(attraction)"
                  >
                    <el-icon><Plus /></el-icon>
                    添加到计划
                  </el-button>
                  <el-button
                    v-else
                    type="success"
                    size="small"
                    @click="removeAttractionFromPlan(attraction)"
                  >
                    <el-icon><Check /></el-icon>
                    已添加
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <div
            class="view-more-container"
            v-if="recommendedAttractions.length > 0"
          >
            <el-button
              type="primary"
              plain
              size="small"
              @click="loadMoreAttractions"
            >
              <el-icon><More /></el-icon>
              查看更多景点
            </el-button>
          </div>
        </el-card>
      </div>
      
      <div class="guide-section">
        <!-- 餐厅推荐卡片 -->
        <el-card class="recommendation-card" shadow="hover">
          <template #header>
            <div class="recommendation-header">
              <h3>
                <el-icon><Food /></el-icon>
                {{ cityInfo?.name || "目的地" }}美食推荐
              </h3>
              <el-tag size="small" type="warning">高德地图数据</el-tag>
            </div>
          </template>

          <div v-if="loadingRestaurants" class="loading-state">
            <el-skeleton :rows="3" animated />
          </div>

          <div
            v-else-if="recommendedRestaurants.length === 0 && !apiError"
            class="empty-state"
          >
            <el-empty description="暂无推荐餐厅" />
          </div>

          <div
            v-else-if="apiError && recommendedAttractions.length === 0"
            class="error-state"
          >
            <el-alert
              :title="apiError"
              type="error"
              :closable="false"
              show-icon
            />
          </div>

          <div v-else class="recommendation-list">
            <div
              v-for="restaurant in recommendedRestaurants"
              :key="restaurant.id"
              class="recommendation-item vertical-layout"
            >
              <div class="recommendation-image">
                <img
                  v-if="restaurant.photos && restaurant.photos.length > 0"
                  :src="restaurant.photos[0].url"
                  :alt="restaurant.name"
                  @error="
                    (e) =>
                      (e.target.src =
                        'https://via.placeholder.com/300x200?text=美食')
                  "
                />
                <div v-else class="no-image">
                  <el-icon><Food /></el-icon>
                </div>
              </div>
              <div class="recommendation-content">
                <h4 :title="restaurant.name" class="full-width-name">
                  {{ restaurant.name }}
                </h4>
                <div class="recommendation-rating rating-with-number">
                  <el-rate
                    :model-value="Number(restaurant.rating)"
                    disabled
                    text-color="#ff9900"
                  />
                  <span class="rating-value">{{ restaurant.rating }}</span>
                </div>
                <div class="recommendation-tags">
                  <el-tag size="small" type="danger" class="price-tag">{{
                    restaurant.price || "¥¥"
                  }}</el-tag>
                  <el-tag size="small" type="warning" class="category-tag"
                    >餐饮服务</el-tag
                  >
                  <el-tag size="small" class="tag-item">{{
                    restaurant.type
                  }}</el-tag>
                </div>
                
                <!-- 招牌菜信息 -->
                <div class="signature-dishes">
                  <p class="signature-title">
                    <el-icon><Star /></el-icon>
                    招牌菜:
                  </p>
                  <div v-if="extractSignatureDishes(restaurant).length > 0" class="dish-tags">
                    <el-tag
                      v-for="(dish, index) in extractSignatureDishes(restaurant).slice(0, 3)"
                      :key="index"
                      size="small"
                      effect="plain"
                      type="success"
                      class="dish-tag"
                    >
                      {{ dish }}
                    </el-tag>
                  </div>
                  <div v-else class="dish-tags">
                    <el-tag
                      size="small"
                      effect="plain"
                      type="success"
                      class="dish-tag empty-tag"
                    >
                      无
                    </el-tag>
                  </div>
                </div>
                
                <p class="recommendation-address">
                  <el-icon><Location /></el-icon>
                  <span class="address-text">{{
                    restaurant.address || "暂无地址信息"
                  }}</span>
                </p>
                
                <!-- 添加到计划按钮 -->
                <div class="add-to-plan">
                  <el-button
                    v-if="!isRestaurantSelected(restaurant)"
                    type="danger"
                    size="small"
                    plain
                    @click="addRestaurantToPlan(restaurant)"
                  >
                    <el-icon><Plus /></el-icon>
                    添加到计划
                  </el-button>
                  <el-button
                    v-else
                    type="danger"
                    size="small"
                    @click="removeRestaurantFromPlan(restaurant)"
                  >
                    <el-icon><Check /></el-icon>
                    已添加
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <div
            class="view-more-container"
            v-if="recommendedRestaurants.length > 0"
          >
            <el-button
              type="primary"
              plain
              size="small"
              @click="loadMoreRestaurants"
            >
              <el-icon><More /></el-icon>
              查看更多餐厅
            </el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 个性化偏好设置卡片 -->
    <el-card class="preferences-card" shadow="hover">
      <div class="preferences-content">
        <!-- 简化的个性化问题 -->
        <div class="personalization-section">
          <h3>
            <el-icon><MagicStick /></el-icon>
            本次行程个性化
          </h3>
          <p class="section-desc">
            基于您的基础偏好的特色，为本次行程做进一步定制
            <span
              v-if="userPreferences && selectedPreferenceTags.length > 0"
              class="preference-hint"
            >
              （已根据您的{{
                selectedPreferenceTags.length
              }}项偏好智能推荐）
            </span>
          </p>

          <el-form :model="localPreferenceForm" class="simple-preferences-form">
            <!-- 核心偏好 - 卡片式选择 -->
            <div class="preference-group">
              <h4>行程风格</h4>
              <div class="style-cards">
                <div
                  v-for="style in tripStyles"
                  :key="style.value"
                  class="style-card"
                  :class="{
                    active: localPreferenceForm.tripStyle === style.value,
                  }"
                  @click="localPreferenceForm.tripStyle = style.value"
                >
                  <div class="style-icon">{{ style.icon }}</div>
                  <div class="style-title">{{ style.title }}</div>
                  <div class="style-desc">{{ style.desc }}</div>
                </div>
              </div>
            </div>

            <!-- 活动强度 -->
            <div class="preference-group">
              <h4>
                活动强度
                <span
                  v-if="recommendedIntensity"
                  class="recommendation-hint"
                >
                  （基于您的旅行节奏偏好推荐）
                </span>
              </h4>
              <el-select
                v-model="localPreferenceForm.intensity"
                size="large"
                style="width: 100%; max-width: 300px"
              >
                <el-option
                  v-for="option in intensityOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                  :class="{
                    'recommended-option':
                      option.value === recommendedIntensity,
                  }"
                >
                  <div class="intensity-option">
                    <span>
                      {{ option.label }}
                      <el-icon
                        v-if="option.value === recommendedIntensity"
                        class="recommend-icon"
                      >
                        <Star />
                      </el-icon>
                    </span>
                    <small>{{
                      getIntensityDescription(option.value)
                    }}</small>
                  </div>
                </el-option>
              </el-select>
            </div>

            <!-- 体验重点 -->
            <div class="preference-group">
              <h4>
                最想体验
                <span
                  v-if="recommendedFocusAreas.length > 0"
                  class="recommendation-hint"
                >
                  （已根据偏好推荐{{ recommendedFocusAreas.length }}项）
                </span>
              </h4>
              <div class="checkbox-grid">
                <el-checkbox-group v-model="localPreferenceForm.focusAreas">
                  <el-checkbox
                    v-for="option in focusAreaOptions"
                    :key="option.value"
                    :label="option.value"
                    :class="{
                      'recommended-option': isRecommendedFocusArea(
                        option.value
                      ),
                    }"
                  >
                    {{ option.label }}
                    <el-icon
                      v-if="isRecommendedFocusArea(option.value)"
                      class="recommend-icon"
                    >
                      <Star />
                    </el-icon>
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
            
            <!-- 特别体验 -->
            <div class="preference-group">
              <h4>特别体验</h4>
              <div class="checkbox-grid">
                <el-checkbox-group v-model="localPreferenceForm.specialExperiences">
                  <el-checkbox value="local_events">当地节庆活动</el-checkbox>
                  <el-checkbox value="workshops">传统工艺体验</el-checkbox>
                  <el-checkbox value="performances">文化表演</el-checkbox>
                  <el-checkbox value="hidden_gems">小众景点</el-checkbox>
                  <el-checkbox value="night_activities">夜间活动</el-checkbox>
                </el-checkbox-group>
              </div>
            </div>

            <!-- 饮食禁忌 -->
            <div class="preference-group">
              <h4>
                饮食禁忌
                <span class="preference-hint">（重要）</span>
              </h4>
              <div class="checkbox-grid">
                <el-checkbox-group v-model="localPreferenceForm.dietaryRestrictions">
                  <el-checkbox value="halal">清真饮食</el-checkbox>
                  <el-checkbox value="vegetarian">素食</el-checkbox>
                  <el-checkbox value="vegan">纯素食（全素）</el-checkbox>
                  <el-checkbox value="no_pork">不吃猪肉</el-checkbox>
                  <el-checkbox value="no_beef">不吃牛肉</el-checkbox>
                  <el-checkbox value="no_seafood">不吃海鲜</el-checkbox>
                  <el-checkbox value="no_spicy">不吃辣</el-checkbox>
                  <el-checkbox value="gluten_free">无麸质</el-checkbox>
                </el-checkbox-group>
              </div>

              <div class="dietary-note">
                <p>其他饮食禁忌或特殊需求：</p>
                <el-input
                  v-model="localPreferenceForm.customDietaryNotes"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入其他饮食禁忌或特殊需求，如宗教禁忌、过敏原等"
                ></el-input>
              </div>
            </div>
            
            <!-- 特殊需求 -->
            <div class="preference-group">
              <h4>其他特殊需求</h4>
              <el-input
                v-model="localPreferenceForm.specialRequirements"
                type="textarea"
                :rows="3"
                placeholder="请输入其他特殊需求，如行动不便、带小孩、带宠物等"
              ></el-input>
            </div>
          </el-form>
        </div>
      </div>
      
      <!-- 步骤操作按钮 -->
      <div class="step-actions">
        <el-button size="large" @click="$emit('prev-step')">
          <el-icon><ArrowLeft /></el-icon>
          上一步
        </el-button>
        <el-button type="primary" size="large" @click="$emit('next-step')">
          下一步
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import {
  ref,
  reactive,
  computed,
  watch,
  onMounted,
} from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  Location,
  Picture,
  Food,
  More,
  User,
  MagicStick,
  Edit,
  Setting,
  Check,
  Star,
  Plus,
  ArrowLeft,
  ArrowRight,
  Calendar,
  KnifeFork
} from "@element-plus/icons-vue";
import { getRecommendedAttractions, getRecommendedRestaurants } from "@/api/amap.js";
import baseForm from '../../pages/Trip/TripCreate.vue'
export default {
  name: "TripPreferences",
  components: {
    Location,
    Picture,
    Food,
    More,
    User,
    MagicStick,
    Edit,
    Setting,
    Check,
    Star,
    Plus,
    ArrowLeft,
    ArrowRight,
    Calendar,
    KnifeFork
  },
  props: {
    // 从父组件接收的表单数据
    baseForm: {
      type: Object,
      required: true
    },
    // 用户偏好
    userPreferences: {
      type: Object,
      default: () => ({})
    },
    // 偏好表单
    preferenceForm: {
      type: Object,
      required: true
    },
    // 已选择的景点
    selectedAttractions: {
      type: Array,
      default: () => []
    },
    // 已选择的餐厅
    selectedRestaurants: {
      type: Array,
      default: () => []
    }
  },
  emits: ["update:preferenceForm", "update:selectedAttractions", "update:selectedRestaurants", "prev-step", "next-step"],
  setup(props, { emit }) {
    const router = useRouter();
    
    // 使用父组件传递的值初始化本地数据
    const localPreferenceForm = ref({...props.preferenceForm});
    
    // 监听localPreferenceForm的变化，同步到父组件
    watch(localPreferenceForm, (newVal) => {
      emit("update:preferenceForm", newVal);
    }, { deep: true });
    
    // 监听props.preferenceForm的变化，同步到本地
    watch(() => props.preferenceForm, (newVal) => {
      if (JSON.stringify(newVal) !== JSON.stringify(localPreferenceForm.value)) {
        localPreferenceForm.value = {...newVal};
      }
    }, { deep: true });

    // 城市信息相关状态
    const cityInfo = ref(null);
    const loadingCityInfo = ref(false);

    // 推荐景点和餐厅
    const recommendedAttractions = ref([]);
    const recommendedRestaurants = ref([]);
    const loadingAttractions = ref(false);
    const loadingRestaurants = ref(false);
    const apiError = ref(null);

    // 分页状态
    const attractionsPage = ref(1);
    const restaurantsPage = ref(1);
    const attractionsPageSize = 6;
    const restaurantsPageSize = 6;
    const loadingMoreAttractions = ref(false);
    const loadingMoreRestaurants = ref(false);
    const noMoreAttractions = ref(false);
    const noMoreRestaurants = ref(false);

    // 行程风格选项
    const tripStyles = [
      {
        value: "exploration",
        title: "深度探索",
        desc: "深入了解当地文化",
        icon: "🔍",
      },
      {
        value: "relaxation",
        title: "休闲度假",
        desc: "放松身心的悠闲时光",
        icon: "🌴",
      },
      {
        value: "cultural",
        title: "文化体验",
        desc: "感受历史与艺术",
        icon: "🎭",
      },
      {
        value: "adventure",
        title: "冒险刺激",
        desc: "挑战自我的精彩体验",
        icon: "⚡",
      },
    ];

    // 体验重点选项
    const focusAreaOptions = [
      { value: "local_culture", label: "当地文化" },
      { value: "food_experience", label: "美食体验" },
      { value: "natural_scenery", label: "自然风光" },
      { value: "urban_life", label: "都市生活" },
      { value: "historical_sites", label: "历史古迹" },
      { value: "modern_attractions", label: "现代景观" },
    ];

    // 活动强度选项
    const intensityOptions = [
      { value: "relaxed", label: "轻松休闲" },
      { value: "moderate", label: "适中节奏" },
      { value: "intensive", label: "紧凑高效" },
    ];

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

      // 常见的英文标签
      historical: "历史文化",
      urban: "都市风情",
      heavy: "深度体验",
      cultural: "文化探索",
      modern: "现代都市",
      traditional: "传统文化",
      scenic: "风景名胜",
      entertainment: "娱乐休闲",
      wellness: "健康养生",

      // 交通偏好
      walk: "步行出行",
      walking: "步行",
      bicycle: "骑行",
      bike: "骑行",
      public_transport: "公共交通",
      public: "公共交通",
      taxi: "打车出行",
      car: "自驾",
      metro: "地铁",
      bus: "公交",

      // 住宿类型
      hotel: "酒店住宿",
      hostel: "青旅住宿",
      apartment: "公寓民宿",
      bnb: "民宿体验",
      resort: "度假村",
      guesthouse: "客栈",
      comfort: "舒适便利",
      luxury: "豪华奢华",
      budget: "经济实惠",

      // 旅行节奏
      slow: "慢节奏",
      medium: "适中节奏",
      fast: "快节奏",
      relaxed: "轻松休闲",
      moderate: "适中节奏",
      intensive: "紧凑高效",
      
      // 数字形式的旅行节奏
      1: "🐌 慢悠悠 - 深度体验",
      2: "🚶 悠闲型 - 适度安排",
      3: "⚖️ 平衡型 - 景点与休息并重",
      4: "🏃 紧凑型 - 多看多玩",
      5: "⚡ 暴走型 - 最大化利用时间",
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

      // 从交通偏好中提取中文标签
      if (props.userPreferences.selectedTransports?.length > 0) {
        props.userPreferences.selectedTransports.forEach((transport) => {
          const chineseTag = tagMapping[transport];
          if (chineseTag) {
            tags.push(chineseTag);
          }
        });
      }

      // 从其他偏好中提取标签
      if (props.userPreferences.accommodationType) {
        const chineseTag = tagMapping[props.userPreferences.accommodationType];
        if (chineseTag) {
          tags.push(chineseTag);
        }
      }

      // 从旅行节奏中提取标签
      if (props.userPreferences.travelPace) {
        const chineseTag = tagMapping[props.userPreferences.travelPace];
        if (chineseTag) {
          tags.push(chineseTag);
        }
      }

      // 从美食偏好中提取标签
      if (props.userPreferences.foodTastes?.length > 0) {
        props.userPreferences.foodTastes.forEach((taste) => {
          const chineseTag = tagMapping[taste] || taste;
          tags.push(chineseTag);
        });
      }

      return [...new Set(tags)].slice(0, 15);
    });

    // 根据用户偏好推荐行程风格
    const recommendedTripStyle = computed(() => {
      if (!props.userPreferences?.selectedTags?.length) return null;

      const tags = props.userPreferences.selectedTags;

      // 文化体验相关标签
      if (
        tags.some((tag) =>
          [
            "culture",
            "history",
            "art",
            "historical",
            "cultural",
            "traditional",
          ].includes(tag)
        )
      ) {
        return "cultural";
      }

      // 冒险相关标签
      if (
        tags.some((tag) =>
          ["adventure", "sports", "outdoor", "extreme_sports"].includes(tag)
        )
      ) {
        return "adventure";
      }

      // 休闲相关标签
      if (
        tags.some((tag) =>
          ["relaxation", "wellness", "peaceful", "beaches"].includes(tag)
        )
      ) {
        return "relaxation";
      }

      // 默认推荐探索
      return "exploration";
    });

    // 根据用户偏好推荐体验重点
    const recommendedFocusAreas = computed(() => {
      if (!props.userPreferences?.selectedTags?.length) return [];

      const tags = props.userPreferences.selectedTags;
      const recommendations = [];

      if (
        tags.some((tag) =>
          ["culture", "history", "art", "historical", "cultural"].includes(tag)
        )
      ) {
        recommendations.push("local_culture", "historical_sites");
      }

      if (
        tags.some((tag) =>
          ["food", "local_cuisine", "street_food"].includes(tag)
        )
      ) {
        recommendations.push("food_experience");
      }

      if (
        tags.some((tag) =>
          ["nature", "mountains", "scenic", "outdoor"].includes(tag)
        )
      ) {
        recommendations.push("natural_scenery");
      }

      if (
        tags.some((tag) =>
          ["cities", "urban", "modern", "shopping"].includes(tag)
        )
      ) {
        recommendations.push("urban_life", "modern_attractions");
      }

      return recommendations;
    });

    // 智能推荐：推荐活动强度
    const recommendedIntensity = computed(() => {
      if (!props.userPreferences?.travelPace) return null;

      const pace = props.userPreferences.travelPace;
      const paceMapping = {
        slow: "relaxed",
        medium: "moderate",
        fast: "intensive",
        relaxed: "relaxed",
        moderate: "moderate",
        intensive: "intensive",
        leisurely: "relaxed",
        balanced: "moderate",
        packed: "intensive",
      };

      return paceMapping[pace] || "moderate";
    });

    // 获取活动强度描述
    const getIntensityDescription = (intensity) => {
      const days = props.baseForm?.days || 0;
      const descriptions = {
        relaxed: {
          short: "每天2-3个景点",
          medium: "每天1-2个景点",
          long: "每天0-1个景点，更多自由时间",
        },
        moderate: {
          short: "每天3-4个景点",
          medium: "每天2-3个景点",
          long: "每天1-2个景点，张弛有度",
        },
        intensive: {
          short: "每天4-5个景点",
          medium: "每天3-4个景点",
          long: "每天2-3个景点，充实体验",
        },
      };

      if (!intensity || !descriptions[intensity]) return "";
      
      if (days <= 7) return descriptions[intensity]?.short || "";
      if (days <= 30) return descriptions[intensity]?.medium || "";
      return descriptions[intensity]?.long || "";
    };

    // 判断是否为推荐的体验重点
    const isRecommendedFocusArea = (areaValue) => {
      return recommendedFocusAreas.value.includes(areaValue);
    };

    // 跳过偏好设置
    const skipPreferences = () => {
      ElMessage.info("您可以随时在个人中心设置偏好以获得更好的推荐");
    };

    // 打开偏好设置页面
    const openPreferences = () => {
      router.push({
        name: "Preferences",
        query: {
          returnTo: "/trip/create", // 返回路径
          returnQuery: JSON.stringify({
            fromPreferences: "true", // 标记从偏好设置返回
          }),
        },
      });
    };

    // 加载城市信息和推荐
    const loadCityInfo = async (city) => {
      console.log("加载城市信息和推荐");
      
      console.log(city);
      
      if (!city) {
        cityInfo.value = null;
        recommendedAttractions.value = [];
        recommendedRestaurants.value = [];
        return;
      }

      try {
        loadingCityInfo.value = true;
        apiError.value = null;
        console.log("🔍 开始加载城市信息和推荐:", city);
          console.log(city.destinationName);
          
        // 2. 获取推荐景点 - 使用城市名称而不是cityCode
        loadingAttractions.value = true;
        attractionsPage.value = 1; // 重置页码
        noMoreAttractions.value = false;

        // 获取城市的中文名称
        const cityName =city.destinationName
        console.log("使用城市名称获取推荐:", cityName);

        try {
          console.log("🔄 调用高德API获取景点数据...");
          console.log("请求参数:", {
            city: city.destinationName,
            page: attractionsPage.value,
            pageSize: attractionsPageSize
          });
          
          const attractionsResponse = await getRecommendedAttractions(
            cityName,
            attractionsPage.value,
            attractionsPageSize
          );
          
          console.log("🔄 高德API景点响应:", attractionsResponse);
          
          if (attractionsResponse && attractionsResponse.pois && attractionsResponse.pois.length > 0) {
            console.log("✅ 成功获取景点数据，共", attractionsResponse.pois.length, "条");
            const attractions = attractionsResponse.pois.map((poi) => ({
              id: poi.id,
              name: poi.name,
              address: poi.address,
              rating: (poi.biz_ext && poi.biz_ext.rating) || "4.5",
              photos: poi.photos || [],
              type: poi.type.split(";")[0] || "景点",
              distance: poi.distance || null,
              tags: extractTags(poi),
              tag: poi.tag, // 保存原始tag字段，用于提取特色标签
              matchScore: 0, // 初始匹配分数
            }));

            // 根据用户偏好计算匹配分数
            calculateAttractionMatchScores(attractions);

            // 按匹配分数排序
            recommendedAttractions.value = sortByRelevance(attractions);

            // 检查是否还有更多数据
            if (
              attractionsResponse.pois.length < attractionsPageSize ||
              !attractionsResponse.count ||
              Number(attractionsResponse.count) <= attractionsPageSize
            ) {
              noMoreAttractions.value = true;
            }
          } else {
            console.log("⚠️ 景点数据为空");
            recommendedAttractions.value = [];
            noMoreAttractions.value = true;
          }
        } catch (error) {
          console.error("❌ 获取推荐景点失败:", error);
          apiError.value = "获取推荐景点失败，请稍后再试";
          recommendedAttractions.value = [];
        } finally {
          loadingAttractions.value = false;
        }

        // 3. 获取推荐餐厅 - 使用城市名称而不是cityCode
        loadingRestaurants.value = true;
        restaurantsPage.value = 1; // 重置页码
        noMoreRestaurants.value = false;

        try {
          console.log("🔄 调用高德API获取餐厅数据...");
          console.log("请求参数:", {
            city: cityName,
            page: restaurantsPage.value,
            pageSize: restaurantsPageSize
          });
          
          const restaurantsResponse = await getRecommendedRestaurants(
            cityName,
            restaurantsPage.value,
            restaurantsPageSize
          );
          
          console.log("🔄 高德API餐厅响应:", restaurantsResponse);
          
          if (restaurantsResponse && restaurantsResponse.pois && restaurantsResponse.pois.length > 0) {
            console.log("✅ 成功获取餐厅数据，共", restaurantsResponse.pois.length, "条");
            const restaurants = restaurantsResponse.pois.map((poi) => ({
              id: poi.id,
              name: poi.name,
              address: poi.address,
              rating: (poi.biz_ext && poi.biz_ext.rating) || "4.5",
              photos: poi.photos || [],
              type: poi.type.split(";")[0] || "餐厅",
              price: (poi.biz_ext && poi.biz_ext.cost) || "¥¥",
              tags: extractTags(poi),
              tag: poi.tag, // 保存原始tag字段，用于提取招牌菜
              matchScore: 0, // 初始匹配分数
            }));

            // 根据用户偏好计算匹配分数
            calculateRestaurantMatchScores(restaurants);

            // 按匹配分数排序
            recommendedRestaurants.value = sortByRelevance(restaurants);

            // 检查是否还有更多数据
            if (
              restaurantsResponse.pois.length < restaurantsPageSize ||
              !restaurantsResponse.count ||
              Number(restaurantsResponse.count) <= restaurantsPageSize
            ) {
              noMoreRestaurants.value = true;
            }
          } else {
            console.log("⚠️ 餐厅数据为空");
            recommendedRestaurants.value = [];
            noMoreRestaurants.value = true;
          }
        } catch (error) {
          console.error("❌ 获取推荐餐厅失败:", error);
          if (!apiError.value) {
            apiError.value = "获取推荐餐厅失败，请稍后再试";
          }
          recommendedRestaurants.value = [];
        } finally {
          loadingRestaurants.value = false;
        }
      } catch (error) {
        console.error("❌ 加载城市信息失败:", error);
        cityInfo.value = null;
        apiError.value = "加载城市信息失败，请稍后再试";
      } finally {
        loadingCityInfo.value = false;
      }
    };

    // 从POI数据中提取标签
    const extractTags = (poi) => {
      const tags = [];

      // 从类型中提取标签
      if (poi.type && typeof poi.type === 'string') {
        const typeTokens = poi.type.split(";");
        tags.push(...typeTokens);
      }

      // 从高德API的tag字段提取标签（这是最重要的标签来源）
      if (poi.tag && typeof poi.tag === 'string') {
        const tagTokens = poi.tag.split(",");
        tags.push(...tagTokens);
      }

      // 从商户类型提取标签
      if (poi.biz_type && typeof poi.biz_type === 'string') {
        tags.push(poi.biz_type);
      }

      return [...new Set(tags)]; // 去重
    };

    // 根据评分计算景点排序分数（简化版）
    const calculateAttractionMatchScores = (attractions) => {
      attractions.forEach((attraction) => {
        // 只使用评分作为排序依据
        const rating = parseFloat(attraction.rating || "0");
        attraction.matchScore = rating * 10; // 将评分转换为0-100分制
      });
    };

    // 根据评分计算餐厅排序分数（简化版）
    const calculateRestaurantMatchScores = (restaurants) => {
      restaurants.forEach((restaurant) => {
        // 只使用评分作为排序依据
        const rating = parseFloat(restaurant.rating || "0");
        restaurant.matchScore = rating * 10; // 将评分转换为0-100分制
      });
    };

    // 按相关性排序
    const sortByRelevance = (items) => {
      return [...items].sort((a, b) => {
        // 首先按匹配分数排序
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }
        // 其次按评分排序
        return parseFloat(b.rating) - parseFloat(a.rating);
      });
    };

    // 从景点POI数据中提取标签
    const extractAttractionTags = (attraction) => {
      if (!attraction || !attraction.tag || typeof attraction.tag !== 'string') {
        return [];
      }
      
      const tags = [];
      const tagContent = attraction.tag;
      
      // 常见的分隔符
      const separators = [',', '，', '、', ';', '；', '|'];
      
      // 尝试用不同分隔符分割
      let tagTokens = [tagContent];
      for (const separator of separators) {
        if (tagContent.includes(separator)) {
          tagTokens = tagContent.split(separator);
          break;
        }
      }
      
      // 景点特色关键词
      const featureKeywords = [
        "文化", "历史", "古迹", "自然", "风景", "公园", "博物馆", "寺庙", "古建筑",
        "休闲", "娱乐", "购物", "美食", "艺术", "科技", "亲子", "户外", "登山",
        "湖泊", "森林", "海滩", "名胜", "地标", "观光", "游览", "热门", "网红"
      ];
      
      // 检查每个标签是否为景点特色
      tagTokens.forEach(token => {
        const trimmedToken = token.trim();
        if (trimmedToken.length > 1) {
          // 检查是否包含特色关键词
          const isFeature = featureKeywords.some(keyword => trimmedToken.includes(keyword));
          
          // 排除一些明显不是特色的标签
          const notFeature = ["停车", "位置", "交通", "商圈", "商场", "广场", "服务", "环境"].some(
            keyword => trimmedToken.includes(keyword)
          );
          
          if (isFeature && !notFeature) {
            tags.push(trimmedToken);
          } else if (trimmedToken.length <= 6 && !notFeature) {
            // 短标签可能是特色，也加入
            tags.push(trimmedToken);
          }
        }
      });
      
      return tags;
    };

    // 从餐厅POI数据中提取招牌菜信息
    const extractSignatureDishes = (restaurant) => {
      if (!restaurant || !restaurant.tag || typeof restaurant.tag !== 'string') {
        return [];
      }
      
      const dishes = [];
      const tagContent = restaurant.tag;
      
      // 常见的分隔符
      const separators = [',', '，', '、', ';', '；', '|'];
      
      // 尝试用不同分隔符分割
      let tagTokens = [tagContent];
      for (const separator of separators) {
        if (tagContent.includes(separator)) {
          tagTokens = tagContent.split(separator);
          break;
        }
      }
      
      // 过滤出可能的菜品名称
      const dishKeywords = [
        "招牌", "特色", "推荐", "必点", "名菜", "人气", 
        "菜", "饭", "面", "粉", "汤", "锅", "煲", "炒", "烤", "蒸", "炖", "煮", "焖", "烧", "卤",
        "鱼", "虾", "蟹", "牛", "羊", "猪", "鸡", "鸭", "鹅"
      ];
      
      // 检查每个标签是否可能是菜品
      tagTokens.forEach(token => {
        const trimmedToken = token.trim();
        if (trimmedToken.length > 1) {
          // 检查是否包含菜品关键词
          const isDish = dishKeywords.some(keyword => trimmedToken.includes(keyword));
          
          // 排除一些明显不是菜品的标签
          const notDish = ["餐饮", "服务", "环境", "价格", "停车", "位置", "交通", "商圈", "商场", "广场"].some(
            keyword => trimmedToken.includes(keyword)
          );
          
          if (isDish && !notDish) {
            dishes.push(trimmedToken);
          }
        }
      });
      
      return dishes;
    };

    // 城市信息数据库
    const cityInfoDatabase = {
      beijing: {
        name: "北京",
        description: "千年古都，文化底蕴深厚",
        highlights: ["故宫", "长城", "天坛", "颐和园", "胡同文化"],
        specialties: ["北京烤鸭", "炸酱面", "豆汁", "驴打滚"],
        bestSeasons: ["春季(3-5月)", "秋季(9-11月)"],
        transportation: ["地铁发达", "公交便利", "共享单车"],
        culturalFeatures: ["皇家建筑", "传统文化", "现代都市"],
        foodScene: ["老字号餐厅", "胡同小吃", "高端餐厅"],
        nightlife: ["三里屯", "后海", "王府井"],
        shopping: ["王府井", "西单", "前门大街"],
        tips: ["春秋最佳旅游季节", "故宫需要提前预约", "地铁出行最便利"],
      },
      shanghai: {
        name: "上海",
        description: "国际化大都市，东西文化交汇",
        highlights: ["外滩", "东方明珠", "豫园", "田子坊", "新天地"],
        specialties: ["小笼包", "生煎包", "白切鸡", "红烧肉"],
        bestSeasons: ["春季(3-5月)", "秋季(9-11月)"],
        transportation: ["地铁网络完善", "磁悬浮列车", "黄浦江轮渡"],
        culturalFeatures: ["海派文化", "国际化氛围", "历史租界"],
        foodScene: ["本帮菜", "国际美食", "网红餐厅"],
        nightlife: ["新天地", "外滩", "衡山路"],
        shopping: ["南京路", "淮海路", "人民广场"],
        tips: ["避开梅雨季节", "外滩夜景最美", "地铁是最佳交通方式"],
      },
    };


    // 加载更多景点数据
    const loadMoreAttractions = async () => {
      try {
        loadingMoreAttractions.value = true;
        
        // 使用城市名称而不是cityCode
        const cityName = props.baseForm.destinationName
        console.log("加载更多景点，城市名称:", cityName);

        // 增加页码并调用API
        attractionsPage.value += 1;
        
        const response = await getRecommendedAttractions(
          cityName,
          attractionsPage.value,
          attractionsPageSize
        );
        
        console.log("加载更多景点响应:", response);
        
        if (response && response.pois && response.pois.length > 0) {
          const newAttractions = response.pois.map((poi) => ({
            id: poi.id,
            name: poi.name,
            address: poi.address,
            rating: (poi.biz_ext && poi.biz_ext.rating) || "4.5",
            photos: poi.photos || [],
            type: poi.type.split(";")[0] || "景点",
            distance: poi.distance || null,
            tags: extractTags(poi),
            tag: poi.tag, // 保存原始tag字段，用于提取特色标签
            matchScore: 0, // 初始匹配分数
          }));

          // 根据用户偏好计算匹配分数
          calculateAttractionMatchScores(newAttractions);

          // 添加新景点到现有列表
          recommendedAttractions.value = [
            ...recommendedAttractions.value,
            ...newAttractions
          ];

          ElMessage.success(`已加载${newAttractions.length}个新推荐景点`);
          
          // 检查是否还有更多数据
          if (
            response.pois.length < attractionsPageSize ||
            !response.count ||
            Number(response.count) <= attractionsPageSize * attractionsPage.value
          ) {
            noMoreAttractions.value = true;
            ElMessage.info("已加载全部推荐景点");
          }
        } else {
          noMoreAttractions.value = true;
          ElMessage.info("没有更多推荐景点了");
        }
      } catch (error) {
        console.error("❌ 加载更多景点失败:", error);
        ElMessage.error("加载推荐景点失败，请稍后再试");
      } finally {
        loadingMoreAttractions.value = false;
      }
    };
    
    // 加载更多餐厅数据
    const loadMoreRestaurants = async () => {
      try {
        loadingMoreRestaurants.value = true;
        
        // 使用城市名称而不是cityCode
        const cityName = cityInfo.value?.name || getSelectedCityName() || props.baseForm.destinationCity;
        console.log("加载更多餐厅，城市名称:", cityName);

        // 增加页码并调用API
        restaurantsPage.value += 1;
        
        const response = await getRecommendedRestaurants(
          cityName,
          restaurantsPage.value,
          restaurantsPageSize
        );
        
        console.log("加载更多餐厅响应:", response);
        
        if (response && response.pois && response.pois.length > 0) {
          const newRestaurants = response.pois.map((poi) => ({
            id: poi.id,
            name: poi.name,
            address: poi.address,
            rating: (poi.biz_ext && poi.biz_ext.rating) || "4.5",
            photos: poi.photos || [],
            type: poi.type.split(";")[0] || "餐厅",
            price: (poi.biz_ext && poi.biz_ext.cost) || "¥¥",
            tags: extractTags(poi),
            tag: poi.tag, // 保存原始tag字段，用于提取招牌菜
            matchScore: 0, // 初始匹配分数
          }));

          // 根据用户偏好计算匹配分数
          calculateRestaurantMatchScores(newRestaurants);

          // 添加新餐厅到现有列表
          recommendedRestaurants.value = [
            ...recommendedRestaurants.value,
            ...newRestaurants
          ];

          ElMessage.success(`已加载${newRestaurants.length}个新推荐餐厅`);
          
          // 检查是否还有更多数据
          if (
            response.pois.length < restaurantsPageSize ||
            !response.count ||
            Number(response.count) <= restaurantsPageSize * restaurantsPage.value
          ) {
            noMoreRestaurants.value = true;
            ElMessage.info("已加载全部推荐餐厅");
          }
        } else {
          noMoreRestaurants.value = true;
          ElMessage.info("没有更多推荐餐厅了");
        }
      } catch (error) {
        console.error("❌ 加载更多餐厅失败:", error);
        ElMessage.error("加载推荐餐厅失败，请稍后再试");
      } finally {
        loadingMoreRestaurants.value = false;
      }
    };

    // 景点和餐厅选择相关方法
    const isAttractionSelected = (attraction) => {
      return props.selectedAttractions.some(a => a.id === attraction.id);
    };

    const addAttractionToPlan = (attraction) => {
      if (!isAttractionSelected(attraction)) {
        const updatedAttractions = [...props.selectedAttractions, attraction];
        emit("update:selectedAttractions", updatedAttractions);
        ElMessage.success(`已将"${attraction.name}"添加到计划`);
      }
    };

    const removeAttractionFromPlan = (attraction) => {
      const index = props.selectedAttractions.findIndex(a => a.id === attraction.id);
      if (index !== -1) {
        const updatedAttractions = [...props.selectedAttractions];
        updatedAttractions.splice(index, 1);
        emit("update:selectedAttractions", updatedAttractions);
        ElMessage.info(`已将"${attraction.name}"从计划中移除`);
      }
    };

    const isRestaurantSelected = (restaurant) => {
      return props.selectedRestaurants.some(r => r.id === restaurant.id);
    };

    const addRestaurantToPlan = (restaurant) => {
      if (!isRestaurantSelected(restaurant)) {
        const updatedRestaurants = [...props.selectedRestaurants, restaurant];
        emit("update:selectedRestaurants", updatedRestaurants);
        ElMessage.success(`已将"${restaurant.name}"添加到计划`);
      }
    };

    const removeRestaurantFromPlan = (restaurant) => {
      const index = props.selectedRestaurants.findIndex(r => r.id === restaurant.id);
      if (index !== -1) {
        const updatedRestaurants = [...props.selectedRestaurants];
        updatedRestaurants.splice(index, 1);
        emit("update:selectedRestaurants", updatedRestaurants);
        ElMessage.info(`已将"${restaurant.name}"从计划中移除`);
      }
    };

    // 监听目的地变化，加载城市信息
    watch(
      () => props.baseForm.destinationCity,
      (newDestination) => {
        if (newDestination) {
          loadCityInfo(newDestination);
        }
      },
      { immediate: true }
    );

    // 应用智能推荐
    const applySmartRecommendations = () => {
      console.log("🤖 应用智能推荐...");

      // 只在用户未手动选择时应用推荐
      if (!localPreferenceForm.value.tripStyle && recommendedTripStyle.value) {
        localPreferenceForm.value.tripStyle = recommendedTripStyle.value;
        console.log("🎯 推荐行程风格:", recommendedTripStyle.value);
      }

      // 推荐活动强度（只在用户未手动选择时）
      if (!localPreferenceForm.value.intensity && recommendedIntensity.value) {
        localPreferenceForm.value.intensity = recommendedIntensity.value;
        console.log("🎯 推荐活动强度:", recommendedIntensity.value);
      }

      // 推荐体验重点（合并而不是覆盖）
      if (recommendedFocusAreas.value.length > 0) {
        const currentAreas = localPreferenceForm.value.focusAreas || [];
        const newAreas = [
          ...new Set([...currentAreas, ...recommendedFocusAreas.value]),
        ];
        if (newAreas.length !== currentAreas.length) {
          localPreferenceForm.value.focusAreas = newAreas;
          console.log("🎯 推荐体验重点:", recommendedFocusAreas.value);
        }
      }
    };


      // 组件加载时初始化
    onMounted( () => {
      console.log("🚀 TripPreferences组件挂载");           
      // 如果有目的地，加载相关信息
     if (props.baseForm) {
        console.log('pre 高德')
        setTimeout(async () => {
           await loadCityInfo(props.baseForm);
        }, 1000);
       
      }
      
      // 应用推荐的行程风格和强度（只在用户未设置时）
      applySmartRecommendations();
    });

    

    return {
      localPreferenceForm,
      cityInfo,
      recommendedAttractions,
      recommendedRestaurants,
      loadingAttractions,
      loadingRestaurants,
      apiError,
      loadMoreAttractions,
      loadMoreRestaurants,
      tripStyles,
      focusAreaOptions,
      intensityOptions,
      tagMapping,
      selectedPreferenceTags,
      recommendedTripStyle,
      recommendedFocusAreas,
      recommendedIntensity,
      getIntensityDescription,
      isRecommendedFocusArea,
      skipPreferences,
      openPreferences,
      extractTags,
      extractAttractionTags,
      extractSignatureDishes,
      isAttractionSelected,
      addAttractionToPlan,
      removeAttractionFromPlan,
      isRestaurantSelected,
      addRestaurantToPlan,
      removeRestaurantFromPlan
    };
  }
};
</script>

<style scoped>
/* 城市推荐布局 */
.city-guide-container {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.guide-section {
  flex: 1;
  min-width: 0;
}

/* 推荐卡片样式 */
.recommendation-card {
  height: 100%;
  border-radius: 8px;
  margin-bottom: 16px;
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recommendation-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-state, .empty-state, .error-state {
  padding: 40px 20px;
  text-align: center;
}

.recommendation-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.recommendation-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.recommendation-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.recommendation-item.vertical-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.recommendation-image {
  height: 140px;
  overflow: hidden;
  position: relative;
}

.recommendation-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.5s;
}

.recommendation-item:hover .recommendation-image img {
  transform: scale(1.05);
}

.no-image {
  background: #f5f7fa;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 24px;
}

.recommendation-content {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.recommendation-content h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.full-width-name {
  width: 100%;
}

.recommendation-rating {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.rating-with-number .el-rate {
  font-size: 14px;
  line-height: 1;
}

.rating-value {
  margin-left: 8px;
  color: #ff9900;
  font-size: 13px;
  font-weight: 500;
}

.recommendation-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.category-tag {
  font-size: 11px;
}

.tag-item {
  font-size: 11px;
}

.recommendation-address {
  display: flex;
  align-items: flex-start;
  margin: 6px 0;
  color: #606266;
  font-size: 11px;
  line-height: 1.3;
}

.address-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  margin-left: 4px;
}

.view-more-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 特色标签和招牌菜样式 */
.attraction-tags, .signature-dishes {
  margin: 6px 0;
}

.tags-title, .signature-title {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 4px;
  font-size: 11px;
  color: #606266;
}

.feature-tags, .dish-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.feature-tag, .dish-tag {
  margin-right: 2px;
  margin-bottom: 2px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
}

.empty-tag {
  opacity: 0.6;
}

.add-to-plan {
  margin-top: auto;
  padding-top: 8px;
  text-align: right;
}

.add-to-plan .el-button {
  padding: 6px 12px;
  font-size: 12px;
}

@media (max-width: 480px) {
  .add-to-plan .el-button {
    padding: 4px 8px;
    font-size: 11px;
  }
}

/* 偏好卡片样式 */
.preferences-card {
  margin-bottom: 24px;
  border-radius: 8px;
}

.preferences-content h3 {
  color: #303133;
  font-size: 16px;
  margin: 0 0 16px 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preferences-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preference-details {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.preference-row {
  margin-bottom: 12px;
}

.preference-row:last-child {
  margin-bottom: 0;
}

.preference-item {
  display: flex;
  align-items: center;
}

.preference-label {
  width: 100px;
  flex-shrink: 0;
  color: #606266;
}

.preference-values {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.preference-tag {
  margin-right: 4px;
  margin-bottom: 4px;
}

.preference-impact {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ecf5ff;
  border-radius: 4px;
  padding: 10px 16px;
  color: #409eff;
  font-size: 13px;
}

.no-preferences {
  padding: 24px 16px;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

.empty-state-enhanced {
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
}

.empty-state-enhanced h4 {
  margin: 0 0 8px;
  font-weight: 500;
}

.empty-state-enhanced p {
  margin: 0 0 16px;
  color: #606266;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  text-align: left;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.benefits-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #606266;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.personalization-section {
  margin-top: 32px;
  border-top: 1px solid #ebeef5;
  padding-top: 24px;
}

.section-desc {
  color: #909399;
  font-size: 14px;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.preference-hint {
  color: #67c23a;
  font-size: 12px;
}

.recommendation-hint {
  color: #e6a23c;
  font-size: 12px;
  font-weight: normal;
}

.preference-group {
  margin-bottom: 32px;
}

.preference-group h4 {
  margin: 0 0 16px;
  font-weight: 500;
  font-size: 15px;
}

/* 行程风格卡片样式 */
.style-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.style-card {
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.style-card:hover {
  transform: translateY(-2px);
  border-color: #c0c4cc;
}

.style-card.active {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.05);
}

.style-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.style-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
}

.style-desc {
  font-size: 12px;
  color: #909399;
}

.intensity-option {
  display: flex;
  flex-direction: column;
}

.intensity-option small {
  color: #909399;
  font-size: 12px;
}

.recommended-option {
  color: #e6a23c;
}

.recommend-icon {
  color: #e6a23c;
  margin-left: 4px;
}

  .checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.checkbox-grid .el-checkbox {
  margin-right: 0;
}

.dietary-note {
  margin-top: 16px;
}

.dietary-note p {
  margin: 0 0 8px;
  font-size: 14px;
  color: #606266;
}

@media (max-width: 768px) {
  .city-guide-container {
    flex-direction: column;
  }
  
  .recommendation-list {
    grid-template-columns: 1fr;
  }
  
  .style-cards {
    grid-template-columns: 1fr 1fr;
  }
  
  .checkbox-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .style-cards {
    grid-template-columns: 1fr;
  }
  
  .checkbox-grid {
    grid-template-columns: 1fr;
  }
  
  .recommendation-list {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }
  
  .recommendation-image {
    height: 120px;
  }
  
  .recommendation-content {
    padding: 8px;
  }
  
  .recommendation-content h4 {
    font-size: 13px;
    margin-bottom: 6px;
  }
  
  .rating-with-number .el-rate {
    font-size: 12px;
  }
  
  .rating-value {
    font-size: 12px;
  }
  
  .attraction-tags, .signature-dishes {
    margin: 4px 0;
  }
}

.signature-dishes {
  margin: 6px 0;
}

.signature-title {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 4px;
  font-size: 11px;
  color: #606266;
}

.dish-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-height: 22px;
  overflow: hidden;
}

.dish-tag {
  margin-right: 0;
  margin-bottom: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
}
</style>