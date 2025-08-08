<template>
  <div class="preferences-page">
    <!-- 加载提示 -->
    <div v-if="loading" class="loading-section">
      <el-skeleton animated :loading="true">
        <template #template>
          <div class="preferences-container">
            <el-skeleton-item
              variant="h1"
              style="width: 40%; margin-bottom: 20px"
            />
            <el-skeleton-item
              variant="text"
              style="width: 60%; margin-bottom: 30px"
            />

            <div class="preference-section">
              <el-skeleton-item
                variant="h3"
                style="width: 30%; margin-bottom: 15px"
              />
              <div style="display: flex; gap: 10px; flex-wrap: wrap">
                <el-skeleton-item
                  v-for="n in 6"
                  :key="n"
                  variant="button"
                  style="width: 80px; height: 32px"
                />
              </div>
            </div>

            <div class="preference-section">
              <el-skeleton-item
                variant="h3"
                style="width: 25%; margin-bottom: 15px"
              />
              <el-skeleton-item
                variant="rect"
                style="width: 100%; height: 40px"
              />
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>

    <!-- 主要内容 -->
    <div v-else class="preferences-container">
      <UserCenterNav />
      <div class="page-header">
        <h1>{{ t('settings.preferences') }}</h1>
        <p>{{ t('personal.preferencesDesc') }}</p>
      </div>

      <!-- 旅行偏好标签 -->
      <div class="preference-section">
        <h3 class="section-title">
          <el-icon><Collection /></el-icon>
          {{ t('personal.card.travelTypes') }}
        </h3>
        <p class="section-desc">{{ t('personal.preferencesDesc') }}</p>

        <div class="tags-grid">
          <el-check-tag
            v-for="tag in availableTags"
            :key="tag.value"
            :checked="selectedTags.includes(tag.value)"
            class="preference-tag"
            @change="toggleTag(tag.value)"
          >
            <component
              :is="tag.icon"
              style="width: 1em; height: 1em; margin-right: 6px"
            />
            {{ tag.label }}
          </el-check-tag>
        </div>
      </div>

      <!-- MBTI性格类型 -->
      <div class="preference-section">
        <h3 class="section-title">
          <el-icon><User /></el-icon>
          {{ t('personal.card.mbti') }}
        </h3>
        <p class="section-desc">
          选择您的MBTI性格类型，我们将据此为您推荐合适的旅行体验
        </p>

        <div class="mbti-selection">
          <el-select
            v-model="mbtiType"
            placeholder="请选择您的MBTI类型"
            size="large"
            @change="handleMbtiChange"
          >
            <el-option-group label="分析家 (NT)">
              <el-option label="INTJ - 建筑师" value="INTJ">
                <div class="mbti-option">
                  <span class="mbti-code">INTJ</span>
                  <span class="mbti-name">建筑师</span>
                </div>
              </el-option>
              <el-option label="INTP - 逻辑学家" value="INTP">
                <div class="mbti-option">
                  <span class="mbti-code">INTP</span>
                  <span class="mbti-name">逻辑学家</span>
                </div>
              </el-option>
              <el-option label="ENTJ - 指挥官" value="ENTJ">
                <div class="mbti-option">
                  <span class="mbti-code">ENTJ</span>
                  <span class="mbti-name">指挥官</span>
                </div>
              </el-option>
              <el-option label="ENTP - 辩论家" value="ENTP">
                <div class="mbti-option">
                  <span class="mbti-code">ENTP</span>
                  <span class="mbti-name">辩论家</span>
                </div>
              </el-option>
            </el-option-group>

            <el-option-group label="外交家 (NF)">
              <el-option label="INFJ - 提倡者" value="INFJ">
                <div class="mbti-option">
                  <span class="mbti-code">INFJ</span>
                  <span class="mbti-name">提倡者</span>
                </div>
              </el-option>
              <el-option label="INFP - 调停者" value="INFP">
                <div class="mbti-option">
                  <span class="mbti-code">INFP</span>
                  <span class="mbti-name">调停者</span>
                </div>
              </el-option>
              <el-option label="ENFJ - 主人公" value="ENFJ">
                <div class="mbti-option">
                  <span class="mbti-code">ENFJ</span>
                  <span class="mbti-name">主人公</span>
                </div>
              </el-option>
              <el-option label="ENFP - 活动家" value="ENFP">
                <div class="mbti-option">
                  <span class="mbti-code">ENFP</span>
                  <span class="mbti-name">活动家</span>
                </div>
              </el-option>
            </el-option-group>

            <el-option-group label="守护者 (SJ)">
              <el-option label="ISTJ - 物流师" value="ISTJ">
                <div class="mbti-option">
                  <span class="mbti-code">ISTJ</span>
                  <span class="mbti-name">物流师</span>
                </div>
              </el-option>
              <el-option label="ISFJ - 守护者" value="ISFJ">
                <div class="mbti-option">
                  <span class="mbti-code">ISFJ</span>
                  <span class="mbti-name">守护者</span>
                </div>
              </el-option>
              <el-option label="ESTJ - 总经理" value="ESTJ">
                <div class="mbti-option">
                  <span class="mbti-code">ESTJ</span>
                  <span class="mbti-name">总经理</span>
                </div>
              </el-option>
              <el-option label="ESFJ - 执政官" value="ESFJ">
                <div class="mbti-option">
                  <span class="mbti-code">ESFJ</span>
                  <span class="mbti-name">执政官</span>
                </div>
              </el-option>
            </el-option-group>

            <el-option-group label="探险家 (SP)">
              <el-option label="ISTP - 鉴赏家" value="ISTP">
                <div class="mbti-option">
                  <span class="mbti-code">ISTP</span>
                  <span class="mbti-name">鉴赏家</span>
                </div>
              </el-option>
              <el-option label="ISFP - 探险家" value="ISFP">
                <div class="mbti-option">
                  <span class="mbti-code">ISFP</span>
                  <span class="mbti-name">探险家</span>
                </div>
              </el-option>
              <el-option label="ESTP - 企业家" value="ESTP">
                <div class="mbti-option">
                  <span class="mbti-code">ESTP</span>
                  <span class="mbti-name">企业家</span>
                </div>
              </el-option>
              <el-option label="ESFP - 娱乐家" value="ESFP">
                <div class="mbti-option">
                  <span class="mbti-code">ESFP</span>
                  <span class="mbti-name">娱乐家</span>
                </div>
              </el-option>
            </el-option-group>
          </el-select>

          <div v-if="mbtiType" class="mbti-preview">
            <div class="mbti-avatar">
              <img :src="`/images/mbti/${mbtiType}.png`"
:alt="mbtiType"
/>
            </div>
            <div class="mbti-info">
              <h4>{{ getMbtiName(mbtiType) }}</h4>
              <p>{{ getMbtiTravelDescription(mbtiType) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 预算设置 -->
      <div class="preference-section">
        <h3 class="section-title">
          <el-icon><Money /></el-icon>
          {{ t('personal.card.dailyBudget') }}
        </h3>
        <p class="section-desc">{{ t('personal.preferencesDesc') }}</p>

        <div class="budget-container">
          <div class="budget-display">
            <span class="budget-amount">¥{{ budget }}</span>
            <span class="budget-unit">{{ t('personal.perDay') }}</span>
          </div>

          <el-slider
            v-model="budget"
            :min="100"
            :max="2000"
            :step="50"
            :show-tooltip="false"
            class="budget-slider"
          />

          <div class="budget-range">
            <span>¥100</span>
            <span>¥2000+</span>
          </div>
        </div>
      </div>

      <!-- 出行方式偏好 -->
      <div class="preference-section">
        <h3 class="section-title">
          <el-icon><Trophy /></el-icon>
          {{ t('personal.card.transport') }}
        </h3>
        <p class="section-desc">{{ t('personal.preferencesDesc') }}</p>

        <div class="transport-grid">
          <div
            v-for="transport in transportTypes"
            :key="transport.value"
            class="transport-card"
            :class="{
              'is-selected': selectedTransports.includes(transport.value),
            }"
            @click="toggleTransport(transport.value)"
          >
            <component :is="transport.icon" class="transport-icon" />
            <span class="transport-label">{{ transport.label }}</span>
            <span class="transport-desc">{{ transport.desc }}</span>
          </div>
        </div>
      </div>

      <!-- 住宿偏好 -->
      <div class="preference-section">
        <h3 class="section-title">
          <el-icon><House /></el-icon>
          {{ t('personal.card.accommodation') }}
        </h3>
        <p class="section-desc">{{ t('personal.preferencesDesc') }}</p>

        <div class="accommodation-options">
          <div class="accommodation-grid">
            <div
              class="accommodation-card"
              :class="{
                'is-selected': preferences.accommodationType === 'budget',
              }"
              @click="preferences.accommodationType = 'budget'"
            >
              <el-icon class="accommodation-icon">
                <House />
              </el-icon>
              <span class="accommodation-title">{{ translateTag('budget') }}</span>
              <span class="accommodation-desc">Budget</span>
            </div>

            <div
              class="accommodation-card"
              :class="{
                'is-selected': preferences.accommodationType === 'comfort',
              }"
              @click="preferences.accommodationType = 'comfort'"
            >
              <el-icon class="accommodation-icon">
                <Monitor />
              </el-icon>
              <span class="accommodation-title">{{ translateTag('comfort') }}</span>
              <span class="accommodation-desc">3-star / Boutique</span>
            </div>

            <div
              class="accommodation-card"
              :class="{
                'is-selected': preferences.accommodationType === 'bnb',
              }"
              @click="preferences.accommodationType = 'bnb'"
            >
              <el-icon class="accommodation-icon">
                <Coffee />
              </el-icon>
              <span class="accommodation-title">{{ translateTag('bnb') }}</span>
              <span class="accommodation-desc">Local homestay</span>
            </div>

            <div
              class="accommodation-card"
              :class="{
                'is-selected': preferences.accommodationType === 'luxury',
              }"
              @click="preferences.accommodationType = 'luxury'"
            >
              <el-icon class="accommodation-icon">
                <Trophy />
              </el-icon>
              <span class="accommodation-title">{{ translateTag('luxury') }}</span>
              <span class="accommodation-desc">5-star / Resort</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 饮食偏好 -->
      <div class="preference-section">
        <h3 class="section-title">
          <el-icon><Coffee /></el-icon>
          {{ t('personal.card.diet') }}
        </h3>
        <p class="section-desc">
告诉我们您的饮食习惯和偏好
</p>

        <div class="food-preferences">
          <div class="food-category">
            <h4>{{ t('personal.card.taste') }}</h4>
            <el-checkbox-group
              v-model="preferences.foodTastes"
              class="taste-group"
            >
            <el-checkbox value="spicy">{{ translateTag('spicy') }}</el-checkbox>
            <el-checkbox value="sweet">{{ translateTag('sweet') }}</el-checkbox>
            <el-checkbox value="sour">{{ translateTag('sour') }}</el-checkbox>
            <el-checkbox value="light">{{ translateTag('light') }}</el-checkbox>
            <el-checkbox value="heavy">{{ translateTag('heavy') }}</el-checkbox>
            </el-checkbox-group>
          </div>

          <div class="food-category">
            <h4>{{ t('personal.card.restrictions') }}</h4>
            <el-checkbox-group
              v-model="preferences.dietaryRestrictions"
              class="restriction-group"
            >
              <el-checkbox value="halal">{{ translateTag('halal', 'dietary') }}</el-checkbox>
              <el-checkbox value="vegetarian">{{ translateTag('vegetarian', 'dietary') }}</el-checkbox>
              <el-checkbox value="vegan">{{ translateTag('vegan', 'dietary') }}</el-checkbox>
              <el-checkbox value="no_pork">{{ translateTag('no_pork', 'dietary') }}</el-checkbox>
              <el-checkbox value="no_beef">{{ translateTag('no_beef', 'dietary') }}</el-checkbox>
              <el-checkbox value="no_seafood">{{ translateTag('no_seafood', 'dietary') }}</el-checkbox>
              <el-checkbox value="no_spicy">{{ translateTag('no_spicy', 'dietary') }}</el-checkbox>
              <el-checkbox value="gluten_free">{{ translateTag('gluten_free', 'dietary') }}</el-checkbox>
              <el-checkbox value="no_alcohol">{{ translateTag('no_alcohol', 'dietary') }}</el-checkbox>
            </el-checkbox-group>
          </div>

          <!-- 其他饮食禁忌或特殊需求 -->
          <div class="food-category">
            <h4>{{ t('personal.card.others') }}</h4>
            <el-input
              v-model="preferences.customDietaryNotes"
              type="textarea"
              :rows="2"
              :placeholder="t('personal.preferencesDesc')"
            />
          </div>
        </div>
      </div>

      <!-- 活动时间偏好 -->
      <div class="preference-section">
        <h3 class="section-title">
          <el-icon><Sunrise /></el-icon>
          {{ t('personal.card.activityTime') }}
        </h3>
        <p class="section-desc">
选择您喜欢的活动时间安排
</p>

        <div class="time-preferences">
          <div
            class="time-slot"
            :class="{
              'is-active': preferences.preferredTimes.includes('morning'),
            }"
            @click="toggleTime('morning')"
          >
            <el-icon><Sunrise /></el-icon>
            <div class="time-info">
              <span class="time-title">{{ translateTag('morning') }}</span>
              <span class="time-desc">6:00-10:00</span>
            </div>
          </div>

          <div
            class="time-slot"
            :class="{
              'is-active': preferences.preferredTimes.includes('afternoon'),
            }"
            @click="toggleTime('afternoon')"
          >
            <el-icon><Trophy /></el-icon>
            <div class="time-info">
              <span class="time-title">{{ translateTag('afternoon') }}</span>
              <span class="time-desc">10:00-16:00</span>
            </div>
          </div>

          <div
            class="time-slot"
            :class="{
              'is-active': preferences.preferredTimes.includes('evening'),
            }"
            @click="toggleTime('evening')"
          >
            <el-icon><Camera /></el-icon>
            <div class="time-info">
              <span class="time-title">{{ translateTag('evening') }}</span>
              <span class="time-desc">16:00-22:00</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 旅行节奏偏好 -->
      <div class="preference-section">
        <h3 class="section-title">
          <el-icon><MapLocation /></el-icon>
          {{ t('personal.card.travelPace') }}
        </h3>
        <p class="section-desc">
选择适合您的旅行节奏
</p>

        <div class="pace-selector">
          <div class="pace-labels">
            <span class="pace-label">🐌</span>
            <span class="pace-label">🚶</span>
            <span class="pace-label">⚖️</span>
            <span class="pace-label">🏃</span>
            <span class="pace-label">⚡</span>
          </div>

          <el-slider
            v-model="preferences.travelPace"
            :min="1"
            :max="5"
            :step="1"
            :show-tooltip="false"
            class="pace-slider"
          />

          <div class="pace-description">{{ translateTag(preferences.travelPace) }}</div>
        </div>
      </div>

      <!-- 其他偏好 -->
      <div class="preference-section">
        <h3 class="section-title">
          <el-icon><Setting /></el-icon>
          {{ t('personal.card.others') }}
        </h3>

        <div class="other-preferences">
          <div class="preference-item">
            <span>{{ t('personal.card.others') }}</span>
            <el-switch v-model="preferences.popularFirst" />
          </div>

          <div class="preference-item">
            <span>{{ t('personal.card.diet') }}</span>
            <el-switch v-model="preferences.includeFood" />
          </div>

          <div class="preference-item">
            <span>{{ translateTag('avoidCrowds') }}</span>
            <el-switch v-model="preferences.avoidCrowds" />
          </div>

          <div class="preference-item">
            <span>{{ translateTag('includeShopping') }}</span>
            <el-switch v-model="preferences.includeShopping" />
          </div>

          <div class="preference-item">
            <span>{{ translateTag('preferPublicTransport') }}</span>
            <el-switch v-model="preferences.preferPublicTransport" />
          </div>

          <div class="preference-item">
            <span>{{ translateTag('includeKidsActivities') }}</span>
            <el-switch v-model="preferences.includeKidsActivities" />
          </div>

          <div class="preference-item">
            <span>{{ translateTag('needAccessibility') }}</span>
            <el-switch v-model="preferences.needAccessibility" />
          </div>
        </div>
      </div>

      <!-- 保存按钮 -->
      <div class="save-section">
        <el-button
          type="primary"
          size="large"
          :loading="saving"
          class="save-btn"
          @click="savePreferences"
        >
          <el-icon><Check /></el-icon>
          {{ t('common.save') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/store/user.js";
import { useI18n } from "@/utils/i18n.js";
import {
  Collection,
  Money,
  Setting,
  Check,
  MapLocation,
  Camera,
  Coffee,
  School,
  Trophy,
  Sunrise,
  House,
  Monitor,
  Bicycle,
  User,
} from "@element-plus/icons-vue";
import { useRouter, useRoute } from "vue-router";
import { getMbtiName, getMbtiTravelDescription, translateTag } from "@/utils/tagMapping.js";
import UserCenterNav from '@/components/User/UserCenterNav.vue';

export default {
  name: "Preferences",
  components: {
    UserCenterNav,
    Collection,
    Money,
    Setting,
    Check,
    MapLocation,
    Camera,
    Coffee,
    School,
    Trophy,
    Sunrise,
    House,
    Monitor,
    Bicycle,
    User,
  },
  setup() {
    const userStore = useUserStore();
    const { t } = useI18n();
    const router = useRouter();
    const route = useRoute();

    // 响应式数据
    const selectedTags = ref([]);
    const budget = ref(300);
    const saving = ref(false);
    const loading = ref(true); // 添加加载状态
    const preferences = reactive({
      popularFirst: true,
      includeFood: true,
      avoidCrowds: false,
      accommodationType: "comfort",
      foodTastes: [],
      dietaryRestrictions: [],
      preferredTimes: ["afternoon"],
      travelPace: 3,
      includeShopping: true,
      preferPublicTransport: true,
      includeKidsActivities: false,
      needAccessibility: false,
      customDietaryNotes: "", // 新增：用于存储其他饮食需求
    });

    // MBTI性格类型选择
    const mbtiType = ref("");

    // 可选择的旅行偏好标签 - 使用统一的标签映射
    const availableTags = [
      { label: translateTag("historical"), value: "historical", icon: School },
      { label: translateTag("nature"), value: "nature", icon: Sunrise },
      { label: translateTag("food"), value: "food", icon: Coffee },
      { label: translateTag("photography"), value: "photography", icon: Camera },
      { label: translateTag("family"), value: "family", icon: Trophy },
      { label: translateTag("urban"), value: "urban", icon: MapLocation },
      { label: translateTag("culture"), value: "culture", icon: School },
      { label: translateTag("relaxation"), value: "relaxation", icon: Coffee },
      { label: translateTag("adventure"), value: "adventure", icon: Trophy },
      { label: translateTag("wellness"), value: "wellness", icon: House },
    ];

    // 出行方式偏好 - 使用统一的标签映射
    const transportTypes = [
      {
        label: translateTag("car"),
        value: "car",
        icon: MapLocation,
        desc: "自由自在，不受公共交通限制",
      },
      {
        label: translateTag("public"),
        value: "public",
        icon: Monitor,
        desc: "环保出行，了解当地文化",
      },
      {
        label: translateTag("walk"),
        value: "walk",
        icon: Bicycle,
        desc: "深度体验，探索城市细节",
      },
      {
        label: translateTag("shared"),
        value: "shared",
        icon: House,
        desc: "灵活安排，节省时间",
      },
    ];

    // 切换标签选择
    const toggleTag = (tagValue) => {
      const index = selectedTags.value.indexOf(tagValue);
      if (index > -1) {
        selectedTags.value.splice(index, 1);
      } else {
        selectedTags.value.push(tagValue);
      }
    };

    // 切换出行方式偏好
    const selectedTransports = ref([]);
    const toggleTransport = (transportValue) => {
      const index = selectedTransports.value.indexOf(transportValue);
      if (index > -1) {
        selectedTransports.value.splice(index, 1);
      } else {
        selectedTransports.value.push(transportValue);
      }
    };

    // 切换活动时间偏好
    const toggleTime = (time) => {
      const index = preferences.preferredTimes.indexOf(time);
      if (index > -1) {
        preferences.preferredTimes.splice(index, 1);
      } else {
        preferences.preferredTimes.push(time);
      }
    };

    // MBTI性格类型变化处理
    const handleMbtiChange = (value) => {
      mbtiType.value = value;
      // 根据MBTI类型更新偏好
      if (value === "INTJ") {
        preferences.travelPace = 5; // 暴走型
        preferences.preferredTimes = ["morning", "afternoon"];
        preferences.includeFood = true;
        preferences.includeShopping = true;
        preferences.preferPublicTransport = false;
        preferences.includeKidsActivities = false;
        preferences.needAccessibility = false;
      } else if (value === "INTP") {
        preferences.travelPace = 3; // 平衡型
        preferences.preferredTimes = ["afternoon"];
        preferences.includeFood = true;
        preferences.includeShopping = true;
        preferences.preferPublicTransport = true;
        preferences.includeKidsActivities = false;
        preferences.needAccessibility = false;
      } else if (value === "ENTJ") {
        preferences.travelPace = 4; // 紧凑型
        preferences.preferredTimes = ["morning", "afternoon", "evening"];
        preferences.includeFood = true;
        preferences.includeShopping = true;
        preferences.preferPublicTransport = false;
        preferences.includeKidsActivities = false;
        preferences.needAccessibility = false;
      } else if (value === "ENTP") {
        preferences.travelPace = 2; // 悠闲型
        preferences.preferredTimes = ["afternoon"];
        preferences.includeFood = true;
        preferences.includeShopping = true;
        preferences.preferPublicTransport = true;
        preferences.includeKidsActivities = false;
        preferences.needAccessibility = false;
      } else if (value === "INFJ") {
        preferences.travelPace = 3; // 平衡型
        preferences.preferredTimes = ["afternoon"];
        preferences.includeFood = true;
        preferences.includeShopping = true;
        preferences.preferPublicTransport = true;
        preferences.includeKidsActivities = false;
        preferences.needAccessibility = false;
      } else if (value === "INFP") {
        preferences.travelPace = 2; // 悠闲型
        preferences.preferredTimes = ["afternoon"];
        preferences.includeFood = true;
        preferences.includeShopping = true;
        preferences.preferPublicTransport = true;
        preferences.includeKidsActivities = false;
        preferences.needAccessibility = false;
      } else if (value === "ENFJ") {
        preferences.travelPace = 4; // 紧凑型
        preferences.preferredTimes = ["morning", "afternoon", "evening"];
        preferences.includeFood = true;
        preferences.includeShopping = true;
        preferences.preferPublicTransport = false;
        preferences.includeKidsActivities = false;
        preferences.needAccessibility = false;
      } else if (value === "ENFP") {
        preferences.travelPace = 3; // 平衡型
        preferences.preferredTimes = ["afternoon"];
        preferences.includeFood = true;
        preferences.includeShopping = true;
        preferences.preferPublicTransport = true;
        preferences.includeKidsActivities = false;
        preferences.needAccessibility = false;
      } else if (value === "ISTJ") {
        preferences.travelPace = 1; // 慢悠悠
        preferences.preferredTimes = ["morning"];
        preferences.includeFood = true;
        preferences.includeShopping = true;
        preferences.preferPublicTransport = true;
        preferences.includeKidsActivities = false;
        preferences.needAccessibility = false;
      } else if (value === "ISFJ") {
        preferences.travelPace = 2; // 悠闲型
        preferences.preferredTimes = ["afternoon"];
        preferences.includeFood = true;
        preferences.includeShopping = true;
        preferences.preferPublicTransport = true;
        preferences.includeKidsActivities = false;
        preferences.needAccessibility = false;
      } else if (value === "ESTJ") {
        preferences.travelPace = 4; // 紧凑型
        preferences.preferredTimes = ["morning", "afternoon", "evening"];
        preferences.includeFood = true;
        preferences.includeShopping = true;
        preferences.preferPublicTransport = false;
        preferences.includeKidsActivities = false;
        preferences.needAccessibility = false;
      } else if (value === "ESFJ") {
        preferences.travelPace = 3; // 平衡型
        preferences.preferredTimes = ["afternoon"];
        preferences.includeFood = true;
        preferences.includeShopping = true;
        preferences.preferPublicTransport = true;
        preferences.includeKidsActivities = false;
        preferences.needAccessibility = false;
      } else if (value === "ISTP") {
        preferences.travelPace = 5; // 暴走型
        preferences.preferredTimes = ["morning", "afternoon", "evening"];
        preferences.includeFood = true;
        preferences.includeShopping = true;
        preferences.preferPublicTransport = false;
        preferences.includeKidsActivities = false;
        preferences.needAccessibility = false;
      } else if (value === "ISFP") {
        preferences.travelPace = 2; // 悠闲型
        preferences.preferredTimes = ["afternoon"];
        preferences.includeFood = true;
        preferences.includeShopping = true;
        preferences.preferPublicTransport = true;
        preferences.includeKidsActivities = false;
        preferences.needAccessibility = false;
      } else if (value === "ESTP") {
        preferences.travelPace = 4; // 紧凑型
        preferences.preferredTimes = ["morning", "afternoon", "evening"];
        preferences.includeFood = true;
        preferences.includeShopping = true;
        preferences.preferPublicTransport = false;
        preferences.includeKidsActivities = false;
        preferences.needAccessibility = false;
      } else if (value === "ESFP") {
        preferences.travelPace = 3; // 平衡型
        preferences.preferredTimes = ["afternoon"];
        preferences.includeFood = true;
        preferences.includeShopping = true;
        preferences.preferPublicTransport = true;
        preferences.includeKidsActivities = false;
        preferences.needAccessibility = false;
      }
    };

    // 使用导入的工具函数
    // getMbtiName 和 getMbtiTravelDescription 已从 tagMapping.js 导入

    // 加载用户偏好
    const loadPreferences = async () => {
      if (!userStore.currentUser?.id) {

        loading.value = false;
        return;
      }

      try {


        // 首先尝试从API获取最新的偏好数据
        try {
          await userStore.fetchUserPreferences();
          console.log("✅ 从API获取偏好数据成功");
        } catch (apiError) {
          console.warn("⚠️ API获取偏好失败，使用本地数据:", apiError.message);
        }

        // 从userStore中加载偏好数据（可能是从API获取的最新数据，也可能是本地缓存）
        const userPrefs = userStore.currentUser.preferences;
        const userBudget = userStore.currentUser.budget;

        // 加载预算
        if (userBudget) {
          budget.value = parseInt(userBudget);
        }

        // 如果有偏好数据则解析并加载
        if (userPrefs) {
          const parsed =
            typeof userPrefs === "string" ? JSON.parse(userPrefs) : userPrefs;

          // 加载旅行类型标签
          if (parsed.selectedTags && Array.isArray(parsed.selectedTags)) {
            selectedTags.value = [...parsed.selectedTags];
          }

          // 加载MBTI性格类型
          if (parsed.mbtiType) {
            mbtiType.value = parsed.mbtiType;
            handleMbtiChange(parsed.mbtiType); // 根据MBTI类型更新偏好
          }

          // 加载预算（从偏好数据中）
          if (parsed.budget) {
            budget.value = parseInt(parsed.budget);
          }

          // 加载出行方式偏好
          if (
            parsed.selectedTransports &&
            Array.isArray(parsed.selectedTransports)
          ) {
            selectedTransports.value = [...parsed.selectedTransports];
          }

          // 加载住宿类型偏好
          if (parsed.accommodationType) {
            preferences.accommodationType = parsed.accommodationType;
          }

          // 加载饮食偏好
          if (parsed.foodTastes && Array.isArray(parsed.foodTastes)) {
            preferences.foodTastes = [...parsed.foodTastes];
          }

          if (
            parsed.dietaryRestrictions &&
            Array.isArray(parsed.dietaryRestrictions)
          ) {
            preferences.dietaryRestrictions = [...parsed.dietaryRestrictions];
          }

          // 加载其他饮食需求
          if (parsed.customDietaryNotes) {
            preferences.customDietaryNotes = parsed.customDietaryNotes;
          }

          // 加载活动时间偏好
          if (parsed.preferredTimes && Array.isArray(parsed.preferredTimes)) {
            preferences.preferredTimes = [...parsed.preferredTimes];
          }

          // 加载旅行节奏
          if (parsed.travelPace) {
            preferences.travelPace = parsed.travelPace;
          }

          // 加载其他偏好
          if (
            parsed.otherPreferences &&
            typeof parsed.otherPreferences === "object"
          ) {
            const otherPrefs = parsed.otherPreferences;
            preferences.popularFirst = otherPrefs.popularFirst || false;
            preferences.includeFood = otherPrefs.includeFood || false;
            preferences.avoidCrowds = otherPrefs.avoidCrowds || false;
            preferences.includeShopping = otherPrefs.includeShopping || false;
            preferences.preferPublicTransport =
              otherPrefs.preferPublicTransport || false;
            preferences.includeKidsActivities =
              otherPrefs.includeKidsActivities || false;
            preferences.needAccessibility =
              otherPrefs.needAccessibility || false;
          }

          console.log("✅ 用户偏好加载完成:", {
            tags: selectedTags.value.length,
            transports: selectedTransports.value.length,
            budget: budget.value,
            mbti: mbtiType.value,
          });
        } else {
          console.log("⚠️ 未找到用户偏好数据，使用默认值");
        }
      } catch (error) {
        console.error("❌ 加载用户偏好失败:", error);
        ElMessage.error("加载偏好设置失败");
      } finally {
        loading.value = false;
      }
    };

    // 保存偏好设置
    const savePreferences = async () => {
      if (saving.value) return;

      try {
        saving.value = true;

        // 构建偏好数据 - 使用新的API格式
        const preferencesData = {
          selectedTags: selectedTags.value,
          budget: budget.value,
          selectedTransports: selectedTransports.value,
          accommodationType: preferences.accommodationType,
          foodTastes: preferences.foodTastes,
          dietaryRestrictions: preferences.dietaryRestrictions,
          preferredTimes: preferences.preferredTimes,
          travelPace: preferences.travelPace,
          mbtiType: mbtiType.value,
          otherPreferences: {
            popularFirst: preferences.popularFirst,
            includeFood: preferences.includeFood,
            avoidCrowds: preferences.avoidCrowds,
            includeShopping: preferences.includeShopping,
            preferPublicTransport: preferences.preferPublicTransport,
            includeKidsActivities: preferences.includeKidsActivities,
            needAccessibility: preferences.needAccessibility,
          },
          customDietaryNotes: preferences.customDietaryNotes, // 新增：保存其他饮食需求
          isCompleted: true,
        };

        console.log("💾 保存偏好数据:", preferencesData);

        // 调用新的API保存偏好
        await userStore.updateUserPreferences(preferencesData);

        ElMessage.success("偏好设置已保存");

        // 根据query参数决定跳转目标
        const returnTo = route.query.returnTo;
        const returnQuery = route.query.returnQuery;

        setTimeout(() => {
          if (returnTo) {
            // 如果有返回路径，跳转到指定页面
            try {
              const queryParams = returnQuery ? JSON.parse(returnQuery) : {};
              router.push({
                path: returnTo,
                query: queryParams,
              });
              console.log(`🔄 返回到: ${returnTo}`);
            } catch (error) {
              console.error("解析返回参数失败:", error);
              router.push(returnTo);
            }
          } else {
            // 默认跳转到首页
            router.push("/home");
          }
        }, 1000);
      } catch (error) {
        console.error("保存偏好设置失败:", error);
        ElMessage.error("保存失败：" + (error.message || "请重试"));
      } finally {
        saving.value = false;
      }
    };

    // 组件挂载时加载数据
    onMounted(async () => {
      loading.value = true; // 开始加载

      // 确保用户数据是最新的
      if (userStore.isLoggedIn && userStore.currentUser) {
        try {
          // 刷新用户信息，确保偏好数据是最新的
          await userStore.fetchUserInfo();
          console.log("🔄 用户信息已刷新");
        } catch (error) {
          console.warn("⚠️ 刷新用户信息失败:", error);
        }
      }

      // 加载偏好设置
      loadPreferences();
    });

    // 监听用户数据变化，自动重新加载偏好
    watch(
      () => userStore.currentUser?.preferences,
      (newPreferences, oldPreferences) => {
        if (newPreferences !== oldPreferences) {
          console.log("🔄 检测到用户偏好数据变化，重新加载");
          loadPreferences();
        }
      },
      { deep: true },
    );

    return {
      t,
      selectedTags,
      budget,
      saving,
      loading, // 暴露加载状态
      preferences,
      availableTags,
      toggleTag,
      savePreferences,
      transportTypes,
      selectedTransports,
      toggleTransport,
      toggleTime,
      mbtiType,
      handleMbtiChange,
      getMbtiName,
      getMbtiTravelDescription,
      translateTag,
    };
  },
};
</script>

<style scoped>
/* 统一的页面布局 - 与Personal.vue保持一致 */
.preferences-page {
  position: fixed !important;
  top: 64px !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: calc(100vh - 64px) !important;
  margin: 0 !important;
  padding: 20px !important;
  background: #f5f5f5 !important;
  overflow-y: auto !important;
  z-index: 1 !important;
}

/* 重置可能影响布局的样式 */
.preferences-page * {
  box-sizing: border-box !important;
}

/* 加载提示样式 */
.loading-section {
  max-width: 1200px;
  margin: 0 auto;
}

.preferences-container {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 60px; /* 增加底部空间，确保内容可见 */
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  padding-top: 20px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-header p {
  font-size: 16px;
  color: #909399;
  margin: 0;
}

.preference-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.section-desc {
  color: #909399;
  font-size: 14px;
  margin: 0 0 20px 0;
}

/* 标签网格 */
.tags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.preference-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 8px;
  transition: all 0.2s;
}

.preference-tag:hover {
  transform: translateY(-1px);
}

/* MBTI性格选择 */
.mbti-selection {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  margin-top: 20px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  min-height: 120px;
}

.mbti-selection .el-select {
  width: 380px;
  flex-shrink: 0;
}

.mbti-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #ecf5ff;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #dcdfe6;
  flex: 1;
  min-width: 300px;
}

.mbti-avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.mbti-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #303133;
}

.mbti-info p {
  margin: 0;
  font-size: 13px;
  color: #909399;
  line-height: 1.4;
}

.mbti-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.mbti-option:hover {
  background-color: #e6f7ff;
  color: #409eff;
}

.mbti-option .mbti-code {
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
}

.mbti-option .mbti-name {
  font-size: 14px;
  color: #606266;
}

/* 预算设置 */
.budget-container {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.budget-display {
  text-align: center;
  margin-bottom: 20px;
}

.budget-amount {
  font-size: 32px;
  font-weight: 600;
  color: #667eea;
}

.budget-unit {
  font-size: 16px;
  color: #909399;
  margin-left: 8px;
}

.budget-slider {
  margin: 20px 0;
}

.budget-range {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 14px;
}

/* 出行方式偏好 */
.transport-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 20px 0;
}

.transport-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 12px;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  min-height: 120px;
}

.transport-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.transport-card.is-selected {
  border-color: #409eff;
  background-color: #ecf5ff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.transport-icon {
  width: 36px;
  height: 36px;
  margin-bottom: 12px;
  color: #409eff;
}

.transport-label {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.transport-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.4;
}

/* 住宿偏好 */
.accommodation-options {
  padding: 20px 0;
}

.accommodation-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 20px 0;
}

.accommodation-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 12px;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  min-height: 120px;
}

.accommodation-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.accommodation-card.is-selected {
  border-color: #409eff;
  background-color: #ecf5ff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.accommodation-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 12px;
  color: #409eff;
}

.accommodation-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.accommodation-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.4;
}

/* 饮食偏好 */
.food-preferences {
  padding: 16px 0;
}

.food-category h4 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.taste-group .el-checkbox,
.restriction-group .el-checkbox {
  margin-right: 20px;
  margin-bottom: 10px;
}

.taste-group .el-checkbox__label,
.restriction-group .el-checkbox__label {
  font-size: 14px;
  color: #606266;
}

/* 活动时间偏好 */
.time-preferences {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.time-slot {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 10px;
  border: 1px solid #ebeef5;
  transition: all 0.2s;
}

.time-slot:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.time-slot.is-active {
  border-color: #409eff;
  background-color: #ecf5ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.time-slot .el-icon {
  width: 30px;
  height: 30px;
  margin-right: 10px;
  color: #409eff;
}

.time-info {
  display: flex;
  flex-direction: column;
}

.time-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.time-desc {
  font-size: 13px;
  color: #909399;
}

/* 旅行节奏偏好 */
.pace-selector {
  padding: 20px 0;
}

.pace-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0 10px;
}

.pace-label {
  font-size: 13px;
  color: #909399;
  text-align: center;
  flex: 1;
}

.pace-label .el-icon {
  width: 18px;
  height: 18px;
}

.pace-slider {
  margin: 0 0 20px 0;
}

.pace-description {
  text-align: center;
  font-size: 16px;
  color: #606266;
  font-weight: 500;
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 10px;
}

/* 其他偏好 */
.other-preferences {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preference-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.preference-item:last-child {
  border-bottom: none;
}

/* 保存按钮 */
.save-section {
  text-align: center;
  padding: 24px 0;
}

.save-btn {
  padding: 12px 32px;
  font-size: 16px;
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preferences-page {
    padding: 16px;
    top: 64px; /* 确保移动端也有正确的顶部偏移 */
  }

  .page-header {
    padding-top: 10px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .tags-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
  }

  .preference-section {
    padding: 20px 16px;
  }

  .budget-amount {
    font-size: 24px;
  }

  .transport-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .transport-card {
    padding: 12px 8px;
    min-height: 90px;
  }

  .transport-icon {
    width: 24px;
    height: 24px;
    margin-bottom: 6px;
  }

  .transport-label {
    font-size: 13px;
    margin-bottom: 4px;
  }

  .transport-desc {
    font-size: 11px;
    line-height: 1.3;
  }

  .accommodation-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .accommodation-card {
    padding: 12px 8px;
    min-height: 90px;
  }

  .accommodation-icon {
    width: 28px;
    height: 28px;
    margin-bottom: 6px;
  }

  .accommodation-title {
    font-size: 13px;
    margin-bottom: 4px;
  }

  .accommodation-desc {
    font-size: 11px;
    line-height: 1.3;
  }

  .food-category h4 {
    font-size: 14px;
  }

  .taste-group .el-checkbox,
  .restriction-group .el-checkbox {
    margin-right: 15px;
    margin-bottom: 8px;
  }

  .taste-group .el-checkbox__label,
  .restriction-group .el-checkbox__label {
    font-size: 13px;
  }

  .time-preferences {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .time-slot {
    width: 100%;
    justify-content: flex-start;
    padding: 10px 15px;
  }

  .time-slot .el-icon {
    margin-right: 10px;
  }

  .time-info {
    flex-direction: row;
    align-items: center;
  }

  .time-title {
    font-size: 14px;
  }

  .time-desc {
    font-size: 12px;
  }

  .pace-description {
    font-size: 14px;
    padding: 10px 16px;
  }

  .pace-description span .el-icon {
    width: 20px;
    height: 20px;
    margin-bottom: 3px;
  }

  .pace-description span {
    flex-direction: row;
    align-items: center;
  }

  .pace-labels {
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 15px;
    padding: 0 5px;
  }

  .pace-label {
    font-size: 12px;
    flex: none;
    min-width: 60px;
  }

  .pace-description {
    font-size: 14px;
    padding: 12px 16px;
    margin-top: 8px;
  }

  .mbti-selection {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    padding: 15px;
  }

  .mbti-selection .el-select {
    width: 100%;
  }

  .mbti-preview {
    width: 100%;
    flex-direction: column;
    align-items: center;
    padding: 10px 15px;
  }

  .mbti-avatar img {
    width: 40px;
    height: 40px;
  }

  .mbti-info h4 {
    font-size: 14px;
  }

  .mbti-info p {
    font-size: 12px;
  }

  .mbti-option {
    padding: 6px 10px;
    font-size: 13px;
  }

  .mbti-option .mbti-code {
    font-size: 13px;
  }

  .mbti-option .mbti-name {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .preferences-page {
    top: 56px; /* 移动端导航栏高度较小 */
    padding: 12px;
  }

  .preferences-container {
    padding-bottom: 40px;
  }

  .preference-section {
    padding: 16px 12px;
  }

  .tags-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 6px;
  }

  .preference-tag {
    padding: 6px 10px;
    font-size: 13px;
  }

  .pace-labels {
    justify-content: center;
    gap: 10px;
    margin-bottom: 12px;
    padding: 0;
  }

  .pace-label {
    font-size: 11px;
    min-width: 50px;
  }

  .pace-description {
    font-size: 13px;
    padding: 10px 14px;
    margin-top: 6px;
  }

  .mbti-selection {
    padding: 10px;
  }

  .mbti-selection .el-select {
    width: 100%;
  }

  .mbti-preview {
    padding: 8px 12px;
  }

  .mbti-avatar img {
    width: 35px;
    height: 35px;
  }

  .mbti-info h4 {
    font-size: 13px;
  }

  .mbti-info p {
    font-size: 11px;
  }

  .mbti-option {
    padding: 5px 8px;
    font-size: 12px;
  }

  .mbti-option .mbti-code {
    font-size: 12px;
  }

  .mbti-option .mbti-name {
    font-size: 12px;
  }
}
</style>
