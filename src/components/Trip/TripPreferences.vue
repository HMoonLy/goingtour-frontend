<template>
  <div class="step-content">
    <div class="city-guide-container">
      <!-- 统一的推荐区域 -->
      <div class="unified-recommendation-section">
        <!-- 切换标签 -->
        <div class="tab-switcher">
          <div
            class="tab-item"
            :class="{ active: SisShow }"
            @click="
              SisShow = true;
              RisShow = false;
            "
          >
            <el-icon><Location /></el-icon>
            <span>{{ cityInfo.destinationName }}推荐景点</span>
            <el-tag
size="small" type="success"> 高德地图数据 </el-tag>
          </div>
          <div
            class="tab-item"
            :class="{ active: RisShow }"
            @click="
              RisShow = true;
              SisShow = false;
            "
          >
            <el-icon><Food /></el-icon>
            <span>{{ cityInfo.destinationName }}美食推荐</span>
            <el-tag
size="small" type="warning"> 高德地图数据 </el-tag>
          </div>
        </div>

        <!-- 搜索功能 -->
        <div class="search-section">
          <div class="search-input-group">
            <el-input
              v-model="searchKeyword"
              :placeholder="
                SisShow ? '搜索景点名称、类型...' : '搜索餐厅名称、菜系...'
              "
              clearable
              @keyup.enter="handleSearch"
              @clear="handleClearSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button
              type="primary"
              :loading="searching"
              @click="handleSearch"
            >
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </div>
          <div class="search-filters">
            <el-select
              v-model="sortBy"
              placeholder="排序方式"
              size="small"
              style="width: 120px"
            >
              <el-option label="默认排序"
value="default" />
              <el-option label="评分最高"
value="rating" />
              <el-option label="距离最近"
value="distance" />
            </el-select>
          </div>
        </div>

        <!-- 景点推荐内容 -->
        <div v-show="SisShow"
class="recommendation-content" v-if="SisShow">
          <!-- 搜索模式提示 -->
          <div
            v-if="isSearchMode && searchResults.length > 0"
            class="search-mode-tip"
          >
            <el-alert
              :title="`搜索'${searchKeyword}'的结果 (${searchResults.filter((item) => item.isAttraction).length}个景点)`"
              type="info"
              :closable="false"
              show-icon
            />
            <div style="margin-top: 8px">
              <el-button size="small"
@click="handleClearSearch">
                返回推荐
              </el-button>
            </div>
          </div>

          <div v-if="loadingAttractions"
class="loading-state">
            <el-skeleton :rows="3"
animated />
          </div>

          <div
            v-else-if="recommendedAttractions.length === 0 && !apiError"
            class="empty-state"
          >
            <el-empty description="暂无推荐景点" />
          </div>

          <div v-else
if="apiError" class="error-state">
            <el-alert
              :title="apiError"
              type="error"
              :closable="false"
              show-icon
            />
          </div>

          <div v-else
class="recommendation-list">
            <div
              v-for="attraction in isSearchMode
                ? searchResults.filter((item) => item.isAttraction)
                : recommendedAttractions"
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
                <div v-else
class="no-image">
                  <el-icon><Picture /></el-icon>
                </div>
              </div>
              <div class="recommendation-content">
                <h4 :title="attraction.name"
class="full-width-name">
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
                  <el-tag size="small"
type="success" class="category-tag">
                    风景名胜
                  </el-tag>
                  <el-tag size="small"
class="tag-item">
                    {{ attraction.type }}
                  </el-tag>
                </div>

                <!-- 景点标签信息 -->
                <div class="attraction-tags">
                  <p class="tags-title">
                    <el-icon><Star /></el-icon>
                    景点特色:
                  </p>
                  <div
                    v-if="extractAttractionTags(attraction).length > 0"
                    class="feature-tags"
                  >
                    <el-tag
                      v-for="(tag, index) in extractAttractionTags(
                        attraction,
                      ).slice(0, 3)"
                      :key="index"
                      size="small"
                      effect="plain"
                      type="info"
                      class="feature-tag"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                  <div v-else
class="feature-tags">
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
            v-if="recommendedAttractions.length > 0 && !isSearchMode"
            class="view-more-container"
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
        </div>

        <!-- 餐厅推荐内容 -->
        <div v-show="RisShow"
class="recommendation-content" v-if="RisShow">
          <!-- 搜索模式提示 -->
          <div
            v-if="isSearchMode && searchResults.length > 0"
            class="search-mode-tip"
          >
            <el-alert
              :title="`搜索'${searchKeyword}'的结果 (${searchResults.filter((item) => !item.isAttraction).length}个餐厅)`"
              type="info"
              :closable="false"
              show-icon
            />
            <div style="margin-top: 8px">
              <el-button size="small"
@click="handleClearSearch">
                返回推荐
              </el-button>
            </div>
          </div>

          <div v-if="loadingRestaurants"
class="loading-state">
            <el-skeleton :rows="3"
animated />
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

          <div v-else
class="recommendation-list">
            <div
              v-for="restaurant in isSearchMode
                ? searchResults.filter((item) => !item.isAttraction)
                : recommendedRestaurants"
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
                <div v-else
class="no-image">
                  <el-icon><Food /></el-icon>
                </div>
              </div>
              <div class="recommendation-content">
                <h4 :title="restaurant.name"
class="full-width-name">
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
                  <el-tag size="small"
type="danger" class="price-tag">
                    人均￥{{ restaurant.price }}
                  </el-tag>
                  <el-tag size="small"
type="warning" class="category-tag">
                    餐饮服务
                  </el-tag>
                  <el-tag size="small"
class="tag-item">
                    {{ restaurant.type }}
                  </el-tag>
                </div>

                <!-- 招牌菜信息 -->
                <div class="signature-dishes">
                  <p class="signature-title">
                    <el-icon><Star /></el-icon>
                    招牌菜:
                  </p>
                  <div
                    v-if="extractSignatureDishes(restaurant).length > 0"
                    class="dish-tags"
                  >
                    <el-tag
                      v-for="(dish, index) in extractSignatureDishes(
                        restaurant,
                      ).slice(0, 3)"
                      :key="index"
                      size="small"
                      effect="plain"
                      type="success"
                      class="dish-tag"
                    >
                      {{ dish }}
                    </el-tag>
                  </div>
                  <div v-else
class="dish-tags">
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
            v-if="recommendedRestaurants.length > 0 && !isSearchMode"
            class="view-more-container"
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
        </div>
      </div>
    </div>

    <!-- 个性化偏好设置 -->
    <div class="preferences-section">
      <el-card class="preferences-card"
shadow="hover">
        <template #header>
          <div class="preferences-header">
            <div class="header-left">
              <div class="header-icon">
                <el-icon><MagicStick /></el-icon>
              </div>
              <div class="header-content">
                <h2 class="header-title">本次行程个性化</h2>
                <p class="header-subtitle">
                  告诉我们您的具体需求，AI将为您量身定制专属行程
                </p>
              </div>
            </div>
            <div
              v-if="userPreferences && Object.keys(userPreferences).length > 0"
              class="smart-hint"
            >
              <el-icon><Star /></el-icon>
              <span>已为您智能预填推荐选项</span>
            </div>
          </div>
        </template>

        <div class="preferences-content">
          <el-form
            :model="localPreferenceForm"
            class="trip-preferences-form"
            label-position="top"
          >
            <!-- 行程目标 -->
            <div class="preference-group">
              <div class="group-header">
                <div class="group-icon">
                  <el-icon><Trophy /></el-icon>
                </div>
                <div class="group-info">
                  <h4 class="group-title">本次行程目标</h4>
                  <p class="group-desc">
                    选择这次旅行的主要目的，AI会据此安排最合适的行程节奏和内容
                  </p>
                </div>
              </div>
              <div class="option-cards">
                <div
                  v-for="goal in tripGoalOptions"
                  :key="goal.value"
                  class="option-card"
                  :class="{
                    active: localPreferenceForm.tripGoals.includes(goal.value),
                  }"
                  @click="toggleTripGoal(goal.value)"
                >
                  <div class="option-content">
                    <span class="option-label">{{ goal.label }}</span>
                  </div>
                  <div
                    v-if="localPreferenceForm.tripGoals.includes(goal.value)"
                    class="option-check"
                  >
                    <el-icon><Check /></el-icon>
                  </div>
                </div>
              </div>
            </div>

            <!-- 行程节奏偏好 -->
            <div class="preference-group">
              <div class="group-header">
                <div class="group-icon">
                  <el-icon><Timer /></el-icon>
                </div>
                <div class="group-info">
                  <h4 class="group-title">行程节奏偏好</h4>
                  <p class="group-desc">
                    选择符合您这次旅行的时间安排和体验深度
                  </p>
                </div>
              </div>
              <div class="pace-cards">
                <div
                  v-for="pace in paceOptions"
                  :key="pace.value"
                  class="pace-card"
                  :class="{
                    active: localPreferenceForm.pacePreference === pace.value,
                  }"
                  @click="localPreferenceForm.pacePreference = pace.value"
                >
                  <div class="pace-icon">
                    {{ pace.icon }}
                  </div>
                  <div class="pace-content">
                    <div class="pace-title">
                      {{ pace.title }}
                    </div>
                    <div class="pace-desc">
                      {{ pace.desc }}
                    </div>
                  </div>
                  <div
                    v-if="localPreferenceForm.pacePreference === pace.value"
                    class="pace-check"
                  >
                    <el-icon><Check /></el-icon>
                  </div>
                </div>
              </div>
            </div>

            <!-- 重点体验 -->
            <div class="preference-group">
              <div class="group-header">
                <div class="group-icon">
                  <el-icon><Star /></el-icon>
                </div>
                <div class="group-info">
                  <h4 class="group-title">重点体验内容</h4>
                  <p class="group-desc">
                    选择本次行程最想体验的内容（最多5项）
                    <span
                      v-if="recommendedFocusAreas.length > 0"
                      class="smart-tip"
                    >
                      <el-icon><Star /></el-icon>
                      已为您推荐{{ recommendedFocusAreas.length }}项
                    </span>
                  </p>
                </div>
              </div>
              <div class="experience-tags">
                <div
                  v-for="option in allExperienceOptions"
                  :key="option.value"
                  class="experience-tag"
                  :class="{
                    active: localPreferenceForm.focusAreas.includes(
                      option.value,
                    ),
                    recommended: isRecommendedFocusArea(option.value),
                    disabled:
                      !localPreferenceForm.focusAreas.includes(option.value) &&
                      localPreferenceForm.focusAreas.length >= 5,
                  }"
                  @click="toggleFocusArea(option.value)"
                >
                  <span class="tag-label">{{ option.label }}</span>
                  <el-icon
                    v-if="isRecommendedFocusArea(option.value)"
                    class="recommend-star"
                  >
                    <Star />
                  </el-icon>
                  <el-icon
                    v-if="localPreferenceForm.focusAreas.includes(option.value)"
                    class="tag-check"
                  >
                    <Check />
                  </el-icon>
                </div>
              </div>
              <div class="selection-counter">
                已选择 {{ localPreferenceForm.focusAreas.length }}/5 项
              </div>
            </div>

            <!-- 社交环境偏好 -->
            <div class="preference-group">
              <div class="group-header">
                <div class="group-icon">
                  <el-icon><UserFilled /></el-icon>
                </div>
                <div class="group-info">
                  <h4 class="group-title">社交环境偏好</h4>
                  <p class="group-desc">选择您更喜欢的旅行环境和氛围</p>
                </div>
              </div>
              <div class="social-cards">
                <div
                  class="social-card"
                  :class="{
                    active: localPreferenceForm.socialPreference === 'lively',
                  }"
                  @click="localPreferenceForm.socialPreference = 'lively'"
                >
                  <div class="social-emoji">🎉</div>
                  <div class="social-content">
                    <div class="social-title">热闹有趣</div>
                    <div class="social-desc">人气餐厅、热门景点</div>
                  </div>
                </div>
                <div
                  class="social-card"
                  :class="{
                    active: localPreferenceForm.socialPreference === 'quiet',
                  }"
                  @click="localPreferenceForm.socialPreference = 'quiet'"
                >
                  <div class="social-emoji">🌸</div>
                  <div class="social-content">
                    <div class="social-title">安静私密</div>
                    <div class="social-desc">小众场所、人少景点</div>
                  </div>
                </div>
                <div
                  class="social-card"
                  :class="{
                    active: localPreferenceForm.socialPreference === 'mixed',
                  }"
                  @click="localPreferenceForm.socialPreference = 'mixed'"
                >
                  <div class="social-emoji">⚖️</div>
                  <div class="social-content">
                    <div class="social-title">灵活搭配</div>
                    <div class="social-desc">热门与小众结合</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 拍照打卡需求 -->
            <div class="preference-group">
              <div class="group-header">
                <div class="group-icon">
                  <el-icon><Camera /></el-icon>
                </div>
                <div class="group-info">
                  <h4 class="group-title">拍照打卡需求</h4>
                  <p class="group-desc">告诉我们您对拍照和分享的重视程度</p>
                </div>
              </div>
              <div class="photo-cards">
                <div
                  class="photo-card"
                  :class="{
                    active: localPreferenceForm.photoPreference === 'essential',
                  }"
                  @click="localPreferenceForm.photoPreference = 'essential'"
                >
                  <div class="photo-emoji">📸</div>
                  <div class="photo-content">
                    <div class="photo-title">必须有</div>
                    <div class="photo-desc">网红打卡点优先</div>
                  </div>
                </div>
                <div
                  class="photo-card"
                  :class="{
                    active: localPreferenceForm.photoPreference === 'casual',
                  }"
                  @click="localPreferenceForm.photoPreference = 'casual'"
                >
                  <div class="photo-emoji">🌅</div>
                  <div class="photo-content">
                    <div class="photo-title">随性拍拍</div>
                    <div class="photo-desc">自然美景即可</div>
                  </div>
                </div>
                <div
                  class="photo-card"
                  :class="{
                    active: localPreferenceForm.photoPreference === 'minimal',
                  }"
                  @click="localPreferenceForm.photoPreference = 'minimal'"
                >
                  <div class="photo-emoji">👁️</div>
                  <div class="photo-content">
                    <div class="photo-title">不太在意</div>
                    <div class="photo-desc">体验优先</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 饮食禁忌 -->
            <div class="preference-group important-group">
              <div class="group-header">
                <div class="group-icon important">
                  <el-icon><KnifeFork /></el-icon>
                </div>
                <div class="group-info">
                  <h4 class="group-title">
                    饮食禁忌
                    <el-tag
type="danger" size="small"> 重要 </el-tag>
                  </h4>
                  <p class="group-desc">
                    请告知我们您的饮食限制，确保为您推荐合适的餐厅
                  </p>
                </div>
              </div>
              <div class="dietary-tags">
                <div
                  v-for="restriction in dietaryOptions"
                  :key="restriction.value"
                  class="dietary-tag"
                  :class="{
                    active: localPreferenceForm.dietaryRestrictions.includes(
                      restriction.value,
                    ),
                  }"
                  @click="toggleDietaryRestriction(restriction.value)"
                >
                  <span class="dietary-label">{{ restriction.label }}</span>
                  <el-icon
                    v-if="
                      localPreferenceForm.dietaryRestrictions.includes(
                        restriction.value,
                      )
                    "
                    class="dietary-check"
                  >
                    <Check />
                  </el-icon>
                </div>
              </div>

              <div class="custom-dietary">
                <h5 class="custom-title">
                  <el-icon><Edit /></el-icon>
                  其他特殊需求
                </h5>
                <el-input
                  v-model="localPreferenceForm.customDietaryNotes"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入其他饮食禁忌或特殊需求，如宗教禁忌、过敏原等"
                  class="custom-input"
                />
              </div>
            </div>

            <!-- 特殊需求 -->
            <div class="preference-group">
              <div class="group-header">
                <div class="group-icon">
                  <el-icon><Setting /></el-icon>
                </div>
                <div class="group-info">
                  <h4 class="group-title">其他特殊需求</h4>
                  <p class="group-desc">告诉我们任何需要特别考虑的情况</p>
                </div>
              </div>
              <el-input
                v-model="localPreferenceForm.specialRequirements"
                type="textarea"
                :rows="3"
                placeholder="如：行动不便、带小孩、带宠物、无障碍设施需求等"
                class="special-input"
              />
            </div>
          </el-form>
        </div>
      </el-card>

      <!-- 步骤操作按钮 -->
      <div class="step-actions">
        <el-button size="large"
@click="$emit('prev-step')">
          <el-icon><ArrowLeft /></el-icon>
          上一步
        </el-button>
        <el-button type="primary"
size="large" @click="$emit('next-step')">
          下一步
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from "vue";
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
  KnifeFork,
  TurnOff,
  Mouse,
  Search,
  Trophy,
  Timer,
  UserFilled,
  Camera,
} from "@element-plus/icons-vue";
import {
  getRecommendedAttractions,
  getRecommendedRestaurants,
  searchPlaces,
} from "@/api/amap.js";
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
    KnifeFork,
    Mouse,
    Search,
    Trophy,
    Timer,
    UserFilled,
    Camera,
  },
  props: {
    // 从父组件接收的表单数据
    baseForm: {
      type: Object,
      required: true,
    },
    // 用户偏好
    userPreferences: {
      type: Object,
      default: () => ({}),
    },
    // 偏好表单
    preferenceForm: {
      type: Object,
      required: true,
    },
    // 已选择的景点
    selectedAttractions: {
      type: Array,
      default: () => [],
    },
    // 已选择的餐厅
    selectedRestaurants: {
      type: Array,
      default: () => [],
    },
  },
  emits: [
    "update:preferenceForm",
    "update:selectedAttractions",
    "update:selectedRestaurants",
    "prev-step",
    "next-step",
  ],
  setup(props, { emit }) {
    const router = useRouter();

    // 使用父组件传递的值初始化本地数据
    const localPreferenceForm = ref({ ...props.preferenceForm });

    // 应用用户偏好默认值 - 更新为新的字段结构
    const applyUserPreferences = () => {
      if (
        props.userPreferences &&
        Object.keys(props.userPreferences).length > 0
      ) {
        console.log("🎯 开始应用用户偏好到个性化设置:", props.userPreferences);

        // 应用行程节奏偏好（基于旅行节奏和MBTI）
        if (
          props.userPreferences.travelPace &&
          !localPreferenceForm.value.pacePreference
        ) {
          const pace = parseInt(props.userPreferences.travelPace);
          let pacePreference = "balanced"; // 默认平衡型

          if (pace <= 2) {
            pacePreference = "slow"; // 慢节奏
          } else if (pace >= 4) {
            pacePreference = "fast"; // 快节奏
          }

          localPreferenceForm.value.pacePreference = pacePreference;
          console.log("✅ 应用行程节奏偏好:", pace, "-> 节奏:", pacePreference);
        }

        // 基于MBTI推荐行程目标
        if (
          props.userPreferences.mbtiType &&
          localPreferenceForm.value.tripGoals.length === 0
        ) {
          const mbti = props.userPreferences.mbtiType;
          const mbtiGoalMapping = {
            INTJ: ["learning", "solo"],
            INFP: ["relaxation", "photography"],
            ENFP: ["friendship", "adventure"],
            ESFP: ["friendship", "photography"],
            ISFJ: ["family", "relaxation"],
            ESTJ: ["business", "learning"],
            ENTP: ["adventure", "learning"],
            ISTP: ["solo", "adventure"],
          };

          const suggestedGoals = mbtiGoalMapping[mbti] || ["relaxation"];
          localPreferenceForm.value.tripGoals = [...suggestedGoals];
          console.log(
            "✅ 基于MBTI推荐行程目标:",
            mbti,
            "-> 目标:",
            suggestedGoals,
          );
        }

        // 应用重点体验偏好（基于用户标签）
        if (
          props.userPreferences.selectedTags &&
          Array.isArray(props.userPreferences.selectedTags)
        ) {
          if (!localPreferenceForm.value.focusAreas) {
            localPreferenceForm.value.focusAreas = [];
          }

          // 映射用户标签到新的体验偏好
          const newTagMapping = {
            historical: "historical_culture",
            nature: "natural_scenery",
            food: "local_cuisine",
            photography: "photo_spots",
            culture: "art_culture",
            relaxation: "leisure_entertainment",
            adventure: "outdoor_adventure",
            urban: "urban_lifestyle",
            shopping: "shopping",
            nightlife: "nightlife",
          };

          const mappedExperiences = props.userPreferences.selectedTags
            .map((tag) => newTagMapping[tag])
            .filter(
              (exp) =>
                exp && !localPreferenceForm.value.focusAreas.includes(exp),
            );

          localPreferenceForm.value.focusAreas.push(...mappedExperiences);
          console.log("✅ 应用体验偏好:", mappedExperiences);
        }

        // 应用社交偏好（基于MBTI外向性）
        if (
          props.userPreferences.mbtiType &&
          !localPreferenceForm.value.socialPreference
        ) {
          const mbti = props.userPreferences.mbtiType;
          const isExtrovert = mbti.startsWith("E");
          localPreferenceForm.value.socialPreference = isExtrovert
            ? "lively"
            : "quiet";
          console.log(
            "✅ 基于MBTI应用社交偏好:",
            mbti,
            "-> 偏好:",
            localPreferenceForm.value.socialPreference,
          );
        }

        // 应用拍照偏好（基于用户标签）
        if (
          props.userPreferences.selectedTags &&
          !localPreferenceForm.value.photoPreference
        ) {
          const hasPhotoTags = props.userPreferences.selectedTags.some((tag) =>
            ["photography", "urban", "modern"].includes(tag),
          );
          localPreferenceForm.value.photoPreference = hasPhotoTags
            ? "essential"
            : "casual";
          console.log(
            "✅ 应用拍照偏好:",
            hasPhotoTags ? "essential" : "casual",
          );
        }

        // 应用饮食禁忌偏好
        if (
          props.userPreferences.dietaryRestrictions &&
          Array.isArray(props.userPreferences.dietaryRestrictions)
        ) {
          if (!localPreferenceForm.value.dietaryRestrictions) {
            localPreferenceForm.value.dietaryRestrictions = [];
          }

          const restrictionMapping = {
            halal: "halal",
            vegetarian: "vegetarian",
            vegan: "vegan",
            no_pork: "no_pork",
            no_beef: "no_beef",
            no_seafood: "no_seafood",
            no_spicy: "no_spicy",
            gluten_free: "gluten_free",
          };

          const mappedRestrictions = props.userPreferences.dietaryRestrictions
            .map((restriction) => restrictionMapping[restriction])
            .filter(
              (res) =>
                res &&
                !localPreferenceForm.value.dietaryRestrictions.includes(res),
            );

          localPreferenceForm.value.dietaryRestrictions.push(
            ...mappedRestrictions,
          );
          console.log("✅ 应用饮食禁忌偏好:", mappedRestrictions);
        }

        // 应用其他饮食需求
        if (
          props.userPreferences.customDietaryNotes &&
          !localPreferenceForm.value.customDietaryNotes
        ) {
          localPreferenceForm.value.customDietaryNotes =
            props.userPreferences.customDietaryNotes;
          console.log(
            "✅ 应用其他饮食需求:",
            props.userPreferences.customDietaryNotes,
          );
        }
      }
    };

    // 监听localPreferenceForm的变化，同步到父组件
    watch(
      localPreferenceForm,
      (newVal) => {
        emit("update:preferenceForm", newVal);
      },
      { deep: true },
    );

    // 监听props.preferenceForm的变化，同步到本地
    watch(
      () => props.preferenceForm,
      (newVal) => {
        if (
          JSON.stringify(newVal) !== JSON.stringify(localPreferenceForm.value)
        ) {
          localPreferenceForm.value = { ...newVal };
        }
      },
      { deep: true },
    );

    //人均提示词
    const priceNull = ref("暂无价格参考");
    // 城市信息相关状态
    const cityInfo = ref(null);
    const loadingCityInfo = ref(false);

    // 推荐景点和餐厅
    const recommendedAttractions = ref([]);
    const recommendedRestaurants = ref([]);
    const loadingAttractions = ref(false);
    const loadingRestaurants = ref(false);
    const apiError = ref(null);
    const RisShow = ref(false);
    const SisShow = ref(true);

    // 搜索相关状态
    const searchKeyword = ref("");
    const sortBy = ref("default");
    const searching = ref(false);
    const searchResults = ref([]);
    const isSearchMode = ref(false);

    // 分页状态
    const attractionsPage = ref(1);
    const restaurantsPage = ref(1);
    const attractionsPageSize = 8;
    const restaurantsPageSize = 8;
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

    // 行程目标选项
    const tripGoalOptions = [
      { value: "celebration", label: "庆祝节日/生日" },
      { value: "business", label: "商务出差顺便游玩" },
      { value: "family", label: "家庭亲子游" },
      { value: "romantic", label: "情侣蜜月游" },
      { value: "friendship", label: "朋友聚会游" },
      { value: "solo", label: "个人独旅" },
      { value: "learning", label: "学习文化知识" },
      { value: "relaxation", label: "放松减压" },
      { value: "adventure", label: "寻求刺激冒险" },
      { value: "photography", label: "摄影创作" },
    ];

    // 行程节奏选项
    const paceOptions = [
      {
        value: "slow",
        title: "慢节奏",
        desc: "深度体验，充分休息",
        icon: "🐌",
      },
      {
        value: "balanced",
        title: "平衡型",
        desc: "景点与休息并重",
        icon: "⚖️",
      },
      {
        value: "fast",
        title: "紧凑型",
        desc: "多看多玩，充实行程",
        icon: "⚡",
      },
    ];

    // 所有体验选项（合并原来的最想体验和特别体验）
    const allExperienceOptions = [
      { value: "historical_culture", label: "历史文化" },
      { value: "natural_scenery", label: "自然风光" },
      { value: "local_cuisine", label: "地道美食" },
      { value: "photo_spots", label: "网红打卡" },
      { value: "art_culture", label: "文艺体验" },
      { value: "leisure_entertainment", label: "休闲娱乐" },
      { value: "outdoor_adventure", label: "户外探险" },
      { value: "urban_lifestyle", label: "城市风情" },
      { value: "shopping", label: "购物体验" },
      { value: "nightlife", label: "夜生活" },
      { value: "traditional_crafts", label: "传统工艺" },
      { value: "modern_technology", label: "现代科技" },
      { value: "religious_sites", label: "宗教文化" },
      { value: "local_festivals", label: "节庆活动" },
      { value: "wellness", label: "健康养生" },
    ];

    // 饮食禁忌选项
    const dietaryOptions = [
      { value: "halal", label: "清真饮食" },
      { value: "vegetarian", label: "素食" },
      { value: "vegan", label: "纯素食（全素）" },
      { value: "no_pork", label: "不吃猪肉" },
      { value: "no_beef", label: "不吃牛肉" },
      { value: "no_seafood", label: "不吃海鲜" },
      { value: "no_spicy", label: "不吃辣" },
      { value: "gluten_free", label: "无麸质" },
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
          ].includes(tag),
        )
      ) {
        return "cultural";
      }

      // 冒险相关标签
      if (
        tags.some((tag) =>
          ["adventure", "sports", "outdoor", "extreme_sports"].includes(tag),
        )
      ) {
        return "adventure";
      }

      // 休闲相关标签
      if (
        tags.some((tag) =>
          ["relaxation", "wellness", "peaceful", "beaches"].includes(tag),
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
          ["culture", "history", "art", "historical", "cultural"].includes(tag),
        )
      ) {
        recommendations.push("local_culture", "historical_sites");
      }

      if (
        tags.some((tag) =>
          ["food", "local_cuisine", "street_food"].includes(tag),
        )
      ) {
        recommendations.push("food_experience");
      }

      if (
        tags.some((tag) =>
          ["nature", "mountains", "scenic", "outdoor"].includes(tag),
        )
      ) {
        recommendations.push("natural_scenery");
      }

      if (
        tags.some((tag) =>
          ["cities", "urban", "modern", "shopping"].includes(tag),
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
        cityInfo.value = city;

        // 2. 获取推荐景点 - 使用城市名称而不是cityCode
        loadingAttractions.value = true;
        attractionsPage.value = 1; // 重置页码
        noMoreAttractions.value = false;

        // 获取城市的中文名称
        const cityName = city.destinationName;
        console.log("使用城市名称获取推荐:", cityName);

        try {
          console.log("🔄 调用高德API获取景点数据...");
          const attractionsResponse = await getRecommendedAttractions(
            cityName,
            attractionsPage.value,
            attractionsPageSize,
          );

          console.log("🔄 高德API景点响应:", attractionsResponse);

          if (
            attractionsResponse &&
            attractionsResponse.pois &&
            attractionsResponse.pois.length > 0
          ) {
            console.log(
              "✅ 成功获取景点数据，共",
              attractionsResponse.pois.length,
              "条",
            );
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
          const restaurantsResponse = await getRecommendedRestaurants(
            cityName,
            restaurantsPage.value,
            restaurantsPageSize,
          );

          console.log("🔄 高德API餐厅响应:", restaurantsResponse);

          if (
            restaurantsResponse &&
            restaurantsResponse.pois &&
            restaurantsResponse.pois.length > 0
          ) {
            console.log(
              "✅ 成功获取餐厅数据，共",
              restaurantsResponse.pois.length,
              "条",
            );
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
      if (poi.type && typeof poi.type === "string") {
        const typeTokens = poi.type.split(";");
        tags.push(...typeTokens);
      }

      // 从高德API的tag字段提取标签（这是最重要的标签来源）
      if (poi.tag && typeof poi.tag === "string") {
        const tagTokens = poi.tag.split(",");
        tags.push(...tagTokens);
      }

      // 从商户类型提取标签
      if (poi.biz_type && typeof poi.biz_type === "string") {
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
      if (
        !attraction ||
        !attraction.tag ||
        typeof attraction.tag !== "string"
      ) {
        return [];
      }

      const tags = [];
      const tagContent = attraction.tag;

      // 常见的分隔符
      const separators = [",", "，", "、", ";", "；", "|"];

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
        "文化",
        "历史",
        "古迹",
        "自然",
        "风景",
        "公园",
        "博物馆",
        "寺庙",
        "古建筑",
        "休闲",
        "娱乐",
        "购物",
        "美食",
        "艺术",
        "科技",
        "亲子",
        "户外",
        "登山",
        "湖泊",
        "森林",
        "海滩",
        "名胜",
        "地标",
        "观光",
        "游览",
        "热门",
        "网红",
      ];

      // 检查每个标签是否为景点特色
      tagTokens.forEach((token) => {
        const trimmedToken = token.trim();
        if (trimmedToken.length > 1) {
          // 检查是否包含特色关键词
          const isFeature = featureKeywords.some((keyword) =>
            trimmedToken.includes(keyword),
          );

          // 排除一些明显不是特色的标签
          const notFeature = [
            "停车",
            "位置",
            "交通",
            "商圈",
            "商场",
            "广场",
            "服务",
            "环境",
          ].some((keyword) => trimmedToken.includes(keyword));

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
      if (
        !restaurant ||
        !restaurant.tag ||
        typeof restaurant.tag !== "string"
      ) {
        return [];
      }

      const dishes = [];
      const tagContent = restaurant.tag;

      // 常见的分隔符
      const separators = [",", "，", "、", ";", "；", "|"];

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
        "招牌",
        "特色",
        "推荐",
        "必点",
        "名菜",
        "人气",
        "菜",
        "饭",
        "面",
        "粉",
        "汤",
        "锅",
        "煲",
        "炒",
        "烤",
        "蒸",
        "炖",
        "煮",
        "焖",
        "烧",
        "卤",
        "鱼",
        "虾",
        "蟹",
        "牛",
        "羊",
        "猪",
        "鸡",
        "鸭",
        "鹅",
      ];

      // 检查每个标签是否可能是菜品
      tagTokens.forEach((token) => {
        const trimmedToken = token.trim();
        if (trimmedToken.length > 1) {
          // 检查是否包含菜品关键词
          const isDish = dishKeywords.some((keyword) =>
            trimmedToken.includes(keyword),
          );

          // 排除一些明显不是菜品的标签
          const notDish = [
            "餐饮",
            "服务",
            "环境",
            "价格",
            "停车",
            "位置",
            "交通",
            "商圈",
            "商场",
            "广场",
          ].some((keyword) => trimmedToken.includes(keyword));

          if (isDish && !notDish) {
            dishes.push(trimmedToken);
          }
        }
      });

      return dishes;
    };

    // 加载更多景点数据
    const loadMoreAttractions = async () => {
      try {
        loadingMoreAttractions.value = true;

        // 使用城市名称而不是cityCode
        const cityName = props.baseForm.destinationName;
        console.log("加载更多景点，城市名称:", cityName);

        // 增加页码并调用API
        attractionsPage.value += 1;

        const response = await getRecommendedAttractions(
          cityName,
          attractionsPage.value,
          attractionsPageSize,
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
            ...newAttractions,
          ];

          ElMessage.success(`已加载${newAttractions.length}个新推荐景点`);

          // 检查是否还有更多数据
          if (
            response.pois.length < attractionsPageSize ||
            !response.count ||
            Number(response.count) <=
              attractionsPageSize * attractionsPage.value
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

    // 搜索功能
    const handleSearch = async () => {
      if (!searchKeyword.value.trim()) {
        ElMessage.warning("请输入搜索关键词");
        return;
      }

      if (!cityInfo.value?.destinationName) {
        ElMessage.warning("请先选择目的地");
        return;
      }

      try {
        searching.value = true;
        isSearchMode.value = true;
        apiError.value = null;

        const searchParams = {
          keywords: searchKeyword.value.trim(),
          city: cityInfo.value.destinationName,
          offset: 20, // 搜索时返回更多结果
          page: 1,
        };

        // 根据当前标签页自动添加类型过滤
        if (SisShow.value) {
          searchParams.types = "110000"; // 风景名胜
        } else if (RisShow.value) {
          searchParams.types = "050000"; // 餐饮服务
        }

        console.log("🔍 开始搜索:", searchParams);
        const response = await searchPlaces(searchParams);

        if (response && response.pois && response.pois.length > 0) {
          console.log("✅ 搜索成功，找到", response.pois.length, "个结果");

          // 处理搜索结果
          const results = response.pois.map((poi) => {
            const isAttraction = poi.type && poi.type.includes("风景名胜");
            return {
              id: poi.id,
              name: poi.name,
              address: poi.address,
              rating: (poi.biz_ext && poi.biz_ext.rating) || "4.5",
              photos: poi.photos || [],
              type: poi.type.split(";")[0] || (isAttraction ? "景点" : "餐厅"),
              price: (poi.biz_ext && poi.biz_ext.cost) || "¥¥",
              distance: poi.distance || null,
              tags: extractTags(poi),
              tag: poi.tag,
              matchScore: 0,
              isAttraction: isAttraction,
            };
          });

          // 根据排序方式排序
          const sortedResults = sortSearchResults(results, sortBy.value);
          searchResults.value = sortedResults;

          ElMessage.success(`找到 ${results.length} 个搜索结果`);
        } else {
          searchResults.value = [];
          ElMessage.info("未找到相关结果，请尝试其他关键词");
        }
      } catch (error) {
        console.error("❌ 搜索失败:", error);
        apiError.value = "搜索失败，请稍后再试";
        searchResults.value = [];
        ElMessage.error("搜索失败，请稍后再试");
      } finally {
        searching.value = false;
      }
    };

    // 清除搜索
    const handleClearSearch = () => {
      searchKeyword.value = "";
      searchResults.value = [];
      isSearchMode.value = false;
      apiError.value = null;
    };

    // 排序搜索结果
    const sortSearchResults = (results, sortType) => {
      const sorted = [...results];

      switch (sortType) {
        case "rating":
          return sorted.sort(
            (a, b) => parseFloat(b.rating) - parseFloat(a.rating),
          );
        case "distance":
          return sorted.sort((a, b) => {
            const distA = parseFloat(a.distance) || Infinity;
            const distB = parseFloat(b.distance) || Infinity;
            return distA - distB;
          });
        default:
          return sorted;
      }
    };

    // 加载更多餐厅数据
    const loadMoreRestaurants = async () => {
      try {
        loadingMoreRestaurants.value = true;

        // 使用城市名称而不是cityCode
        const cityName = props.baseForm.destinationName;
        console.log("加载更餐厅，城市名称:", cityName);
        // 增加页码并调用API
        restaurantsPage.value += 1;

        const response = await getRecommendedRestaurants(
          cityName,
          restaurantsPage.value,
          restaurantsPageSize,
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
            ...newRestaurants,
          ];

          ElMessage.success(`已加载${newRestaurants.length}个新推荐餐厅`);

          // 检查是否还有更多数据
          if (
            response.pois.length < restaurantsPageSize ||
            !response.count ||
            Number(response.count) <=
              restaurantsPageSize * restaurantsPage.value
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
      return props.selectedAttractions.some((a) => a.id === attraction.id);
    };

    const addAttractionToPlan = (attraction) => {
      if (!isAttractionSelected(attraction)) {
        const updatedAttractions = [...props.selectedAttractions, attraction];
        emit("update:selectedAttractions", updatedAttractions);
        ElMessage.success(`已将"${attraction.name}"添加到计划`);
      }
    };

    const removeAttractionFromPlan = (attraction) => {
      const index = props.selectedAttractions.findIndex(
        (a) => a.id === attraction.id,
      );
      if (index !== -1) {
        const updatedAttractions = [...props.selectedAttractions];
        updatedAttractions.splice(index, 1);
        emit("update:selectedAttractions", updatedAttractions);
        ElMessage.info(`已将"${attraction.name}"从计划中移除`);
      }
    };

    const isRestaurantSelected = (restaurant) => {
      return props.selectedRestaurants.some((r) => r.id === restaurant.id);
    };

    const addRestaurantToPlan = (restaurant) => {
      if (!isRestaurantSelected(restaurant)) {
        const updatedRestaurants = [...props.selectedRestaurants, restaurant];
        emit("update:selectedRestaurants", updatedRestaurants);
        ElMessage.success(`已将"${restaurant.name}"添加到计划`);
      }
    };

    const removeRestaurantFromPlan = (restaurant) => {
      const index = props.selectedRestaurants.findIndex(
        (r) => r.id === restaurant.id,
      );
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
      { immediate: true },
    );

    // 应用智能推荐 - 更新为新的字段结构
    const applySmartRecommendations = () => {
      console.log("🤖 应用智能推荐...");

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

    // 切换行程目标选择
    const toggleTripGoal = (goalValue) => {
      const goals = localPreferenceForm.value.tripGoals;
      const index = goals.indexOf(goalValue);
      if (index > -1) {
        goals.splice(index, 1);
      } else {
        goals.push(goalValue);
      }
    };

    // 切换体验重点选择
    const toggleFocusArea = (areaValue) => {
      const areas = localPreferenceForm.value.focusAreas;
      const index = areas.indexOf(areaValue);
      if (index > -1) {
        areas.splice(index, 1);
      } else if (areas.length < 5) {
        areas.push(areaValue);
      }
    };

    // 切换饮食禁忌选择
    const toggleDietaryRestriction = (restrictionValue) => {
      const restrictions = localPreferenceForm.value.dietaryRestrictions;
      const index = restrictions.indexOf(restrictionValue);
      if (index > -1) {
        restrictions.splice(index, 1);
      } else {
        restrictions.push(restrictionValue);
      }
    };

    // 监听用户偏好变化，动态应用默认值
    watch(
      () => props.userPreferences,
      (newPreferences) => {
        if (newPreferences && Object.keys(newPreferences).length > 0) {
          console.log(
            "🔄 检测到用户偏好数据变化，重新应用默认值:",
            newPreferences,
          );
          applyUserPreferences();
        }
      },
      { deep: true, immediate: true },
    );

    // 组件加载时初始化
    onMounted(() => {
      console.log("🚀 TripPreferences组件挂载");

      // 应用用户偏好默认值
      applyUserPreferences();

      // 如果有目的地，加载相关信息
      if (props.baseForm) {
        console.log("pre 高德");
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
      tripGoalOptions,
      paceOptions,
      allExperienceOptions,
      dietaryOptions,
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
      removeRestaurantFromPlan,
      SisShow,
      RisShow,
      // 新的切换方法
      toggleTripGoal,
      toggleFocusArea,
      toggleDietaryRestriction,
      // 搜索相关
      searchKeyword,
      sortBy,
      searching,
      searchResults,
      isSearchMode,
      handleSearch,
      handleClearSearch,
    };
  },
};
</script>

<style scoped>
/* 城市推荐布局 */
.city-guide-container {
  margin-bottom: 24px;
  position: relative;
}

.guide-tip {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(64, 158, 255, 0.1);
  border: 1px solid rgba(64, 158, 255, 0.2);
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 12px;
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 10;
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 统一推荐区域样式 */
.unified-recommendation-section {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ebeef5;
}

/* 标签切换器样式 */
.tab-switcher {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
  position: relative;
}

.tab-item:hover {
  background: #e3f2fd;
}

.tab-item.active {
  background: #fff;
  border-bottom-color: #409eff;
  color: #409eff;
  font-weight: 500;
}

.tab-item .el-icon {
  font-size: 16px;
}

.tab-item span {
  font-size: 14px;
  font-weight: 500;
}

.tab-item .el-tag {
  margin-left: auto;
}

/* 添加切换指示器动画 */
.tab-item.active::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 3px;
  background: #409eff;
  animation: slideIn 0.3s ease-out;
}

/* 优化标签内容布局 */
.tab-item {
  min-height: 60px;
}

/* 搜索区域样式 */
.search-section {
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}

.search-input-group {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.search-input-group .el-input {
  flex: 1;
}

.search-filters {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-mode-tip {
  margin-bottom: 16px;
}

/* 推荐内容样式 */
.recommendation-content {
  padding: 20px;
  background: #fff;
  border-radius: 0 0 8px 8px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 移除原来的header样式，因为现在使用tab-switcher */

.recommendation-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-state,
.empty-state,
.error-state {
  padding: 40px 20px;
  text-align: center;
}

.recommendation-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 16px;
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
.attraction-tags,
.signature-dishes {
  margin: 6px 0;
}

.tags-title,
.signature-title {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 4px;
  font-size: 11px;
  color: #606266;
}

.feature-tags,
.dish-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.feature-tag,
.dish-tag {
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

/* 偏好区域样式 - 重新设计 */
.preferences-section {
  margin-bottom: 24px;
}

.preferences-card {
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.preferences-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.header-content {
  flex: 1;
}

.header-title {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  background: linear-gradient(135deg, #409eff, #67c23a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  margin: 0;
  font-size: 15px;
  color: #606266;
  line-height: 1.4;
}

.smart-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  border: 1px solid #b3e5ff;
  border-radius: 20px;
  padding: 8px 16px;
  color: #1890ff;
  font-size: 13px;
  font-weight: 500;
}

.smart-hint .el-icon {
  color: #faad14;
}

.preferences-content {
  padding: 32px;
}

.preferences-content h3 {
  color: #303133;
  font-size: 18px;
  margin: 0 0 16px 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preferences-content h3 .el-icon {
  color: #409eff;
  font-size: 20px;
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
  margin: 0 0 24px 0;
  line-height: 1.5;
  background: #f5f7fa;
  padding: 12px 16px;
  border-radius: 6px;
  border-left: 3px solid #409eff;
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
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 1px solid #f0f2f5;
}

.preference-group:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.preference-group.important-group {
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
  border: 1px solid #fde2e2;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 40px;
}

/* 组头部样式 */
.group-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.group-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #409eff 0%, #36cfc9 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  flex-shrink: 0;
}

.group-icon.important {
  background: linear-gradient(135deg, #f56c6c 0%, #ff7875 100%);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.group-info {
  flex: 1;
}

.group-title {
  margin: 0 0 8px;
  font-weight: 600;
  font-size: 18px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-desc {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.smart-tip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #fff7e6 0%, #fffbf0 100%);
  border: 1px solid #ffe7ba;
  border-radius: 12px;
  padding: 4px 8px;
  color: #d46b08;
  font-size: 12px;
  margin-left: 8px;
}

/* 选项卡片样式 */
.option-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.option-card {
  position: relative;
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.option-card.active {
  border-color: #409eff;
  background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.2);
}

.option-content {
  text-align: center;
  flex: 1;
}

.option-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.option-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: #67c23a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

/* 节奏卡片样式 */
.pace-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.pace-card {
  position: relative;
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 16px;
}

.pace-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.pace-card.active {
  border-color: #409eff;
  background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.2);
}

.pace-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.pace-content {
  flex: 1;
}

.pace-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.pace-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.4;
}

.pace-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 20px;
  height: 20px;
  background: #67c23a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

/* 体验标签样式 */
.experience-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.experience-tag {
  position: relative;
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 20px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
}

.experience-tag:hover:not(.disabled) {
  border-color: #409eff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.experience-tag.active {
  border-color: #409eff;
  background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
  color: #409eff;
}

.experience-tag.recommended {
  border-color: #faad14;
  background: linear-gradient(135deg, #fff7e6 0%, #ffffff 100%);
}

.experience-tag.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tag-label {
  font-size: 14px;
  font-weight: 500;
}

.recommend-star {
  color: #faad14;
  font-size: 12px;
}

.tag-check {
  color: #67c23a;
  font-size: 14px;
}

.selection-counter {
  margin-top: 12px;
  font-size: 13px;
  color: #909399;
  text-align: center;
}

/* 社交和拍照卡片样式 */
.social-cards,
.photo-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.social-card,
.photo-card {
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.social-card:hover,
.photo-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.social-card.active,
.photo-card.active {
  border-color: #409eff;
  background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
}

.social-emoji,
.photo-emoji {
  font-size: 32px;
  margin-bottom: 12px;
}

.social-content,
.photo-content {
  text-align: center;
}

.social-title,
.photo-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.social-desc,
.photo-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.4;
}

/* 表单组件样式 - 简化设计 */
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
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
}

.checkbox-grid .el-checkbox {
  margin-right: 0;
  margin-bottom: 0;
  flex: 0 0 auto;
  min-width: 120px;
}

/* 饮食禁忌标签样式 */
.dietary-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.dietary-tag {
  position: relative;
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 20px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
}

.dietary-tag:hover {
  border-color: #f56c6c;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.15);
}

.dietary-tag.active {
  border-color: #f56c6c;
  background: linear-gradient(135deg, #fef0f0 0%, #ffffff 100%);
  color: #f56c6c;
}

.dietary-label {
  font-size: 14px;
  font-weight: 500;
}

.dietary-check {
  color: #67c23a;
  font-size: 14px;
}

/* 自定义饮食需求 */
.custom-dietary {
  background: #fef9e7;
  border: 1px solid #faecd8;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #e6a23c;
}

.custom-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: #d46b08;
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-input {
  border-radius: 8px;
}

/* 特殊需求输入框 */
.special-input {
  border-radius: 8px;
  border: 2px solid #e4e7ed;
}

.special-input:focus-within {
  border-color: #409eff;
}

@media (max-width: 1200px) {
  .recommendation-list {
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
}

/* 平板端响应式设计 */
@media (max-width: 1024px) {
  .style-cards {
    gap: 12px;
  }

  .style-card {
    min-width: 140px;
  }
}

@media (max-width: 768px) {
  .tab-switcher {
    flex-direction: column;
  }

  .tab-item {
    padding: 12px 16px;
  }

  .search-section {
    padding: 12px 16px;
  }

  .search-input-group {
    flex-direction: column;
    gap: 8px;
  }

  .search-filters {
    flex-wrap: wrap;
    gap: 8px;
  }

  .recommendation-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .style-cards {
    flex-direction: column;
    gap: 12px;
  }

  .style-card {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .style-cards {
    flex-direction: column;
    gap: 12px;
  }

  .checkbox-grid {
    flex-direction: column;
    gap: 12px;
  }

  .recommendation-list {
    grid-template-columns: 1fr;
    gap: 12px;
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

  .attraction-tags,
  .signature-dishes {
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
