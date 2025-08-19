<template>
  <div :class="embedded ? 'preferences-embedded' : 'preferences-page'">
    <!-- 加载提示 -->
    <div v-if="loading" class="loading-section">
      <el-skeleton animated :loading="true">
        <template #template>
          <div class="preferences-container">
            <el-skeleton-item variant="h1" style="width: 40%; margin-bottom: 20px" />
            <el-skeleton-item variant="text" style="width: 60%; margin-bottom: 30px" />
            <div class="preference-section">
              <el-skeleton-item variant="h3" style="width: 30%; margin-bottom: 15px" />
              <div style="display: flex; gap: 10px; flex-wrap: wrap">
                <el-skeleton-item
                  v-for="n in 6"
                  :key="n"
                  variant="button"
                  style="width: 80px; height: 32px"
                />
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>

    <!-- 主要内容 -->
    <div v-else class="preferences-container">
      <UserCenterNav v-if="!embedded" />
      
      <!-- 引导说明 -->
      <div class="setup-intro">
        <div class="intro-header">
          <el-icon class="intro-icon"><UserFilled /></el-icon>
          <div class="intro-content">
            <h1>🎯 建立您的旅行档案</h1>
            <p>一次设置，终身受益。我们将基于这些信息为您的每次旅行提供个性化推荐</p>
          </div>
        </div>
        
        <div class="intro-benefits">
          <div class="benefit-item">
            <el-icon><Star /></el-icon>
            <span>个性化推荐</span>
          </div>
          <div class="benefit-item">
            <el-icon><Timer /></el-icon>
            <span>快速创建行程</span>
          </div>
          <div class="benefit-item">
            <el-icon><Check /></el-icon>
            <span>避免重复填写</span>
          </div>
        </div>
      </div>

      <!-- 核心档案设置 -->
      <div class="profile-sections">
        
        <!-- 性格特征 -->
        <div class="profile-section personality-section">
          <div class="section-header">
            <div class="section-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="section-info">
              <h3 class="section-title">🧠 您的性格特征</h3>
              <p class="section-desc">帮助我们了解您的旅行风格，提供更精准的推荐</p>
            </div>
          </div>
          
          <div class="personality-content">
            <div class="mbti-selection-enhanced">
              <div class="mbti-header">
                <h4>MBTI性格类型</h4>
                <span class="optional-badge">可选</span>
              </div>
              
              <el-select
                v-model="mbtiType"
                placeholder="选择您的MBTI类型（如不确定可跳过）"
                size="large"
                clearable
                @change="handleMbtiChange"
              >
                <el-option-group label="分析家 (NT)">
                  <el-option label="INTJ - 建筑师" value="INTJ" />
                  <el-option label="INTP - 逻辑学家" value="INTP" />
                  <el-option label="ENTJ - 指挥官" value="ENTJ" />
                  <el-option label="ENTP - 辩论家" value="ENTP" />
                </el-option-group>
                
                <el-option-group label="外交家 (NF)">
                  <el-option label="INFJ - 提倡者" value="INFJ" />
                  <el-option label="INFP - 调停者" value="INFP" />
                  <el-option label="ENFJ - 主人公" value="ENFJ" />
                  <el-option label="ENFP - 活动家" value="ENFP" />
                </el-option-group>
                
                <el-option-group label="守护者 (SJ)">
                  <el-option label="ISTJ - 物流师" value="ISTJ" />
                  <el-option label="ISFJ - 守护者" value="ISFJ" />
                  <el-option label="ESTJ - 总经理" value="ESTJ" />
                  <el-option label="ESFJ - 执政官" value="ESFJ" />
                </el-option-group>
                
                <el-option-group label="探险家 (SP)">
                  <el-option label="ISTP - 鉴赏家" value="ISTP" />
                  <el-option label="ISFP - 探险家" value="ISFP" />
                  <el-option label="ESTP - 企业家" value="ESTP" />
                  <el-option label="ESFP - 娱乐家" value="ESFP" />
                </el-option-group>
              </el-select>
              
              <div v-if="mbtiType" class="mbti-preview">
                <div class="mbti-info">
                  <h4>{{ getMbtiName(mbtiType) }}</h4>
                  <p>{{ getMbtiTravelDescription(mbtiType) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 兴趣标签 -->
        <div class="profile-section interests-section">
          <div class="section-header">
            <div class="section-icon">
              <el-icon><Collection /></el-icon>
            </div>
            <div class="section-info">
              <h3 class="section-title">🎨 旅行兴趣标签</h3>
              <p class="section-desc">选择您感兴趣的旅行类型，我们会据此为您推荐相关内容</p>
            </div>
          </div>
          
          <div class="interests-content">
            <div class="tags-grid-enhanced">
              <el-check-tag
                v-for="tag in availableTags"
                :key="tag.value"
                :checked="selectedTags.includes(tag.value)"
                class="interest-tag"
                @change="toggleTag(tag.value)"
              >
                <component
                  :is="tag.icon"
                  class="tag-icon"
                />
                <span class="tag-label">{{ tag.label }}</span>
              </el-check-tag>
            </div>
            
            <div class="selection-summary">
              <span class="selection-count">已选择 {{ selectedTags.length }} 个兴趣</span>
              <el-button 
                v-if="selectedTags.length > 0" 
                type="text" 
                size="small" 
                @click="selectedTags = []"
              >
                清空选择
              </el-button>
            </div>
          </div>
        </div>

        <!-- 经济偏好 -->
        <div class="profile-section budget-section">
          <div class="section-header">
            <div class="section-icon">
              <el-icon><Money /></el-icon>
            </div>
            <div class="section-info">
              <h3 class="section-title">💰 经济偏好</h3>
              <p class="section-desc">设置您的预期花费范围，帮助我们推荐合适的选项</p>
            </div>
          </div>
          
          <div class="budget-content">
            <div class="budget-display-enhanced">
              <div class="budget-amount-display">
                <span class="budget-amount">¥{{ budget }}</span>
                <span class="budget-unit">每天</span>
              </div>
              
              <div class="budget-description">
                <span v-if="budget < 200" class="budget-level economy">🌿 经济实惠</span>
                <span v-else-if="budget < 500" class="budget-level comfort">🏨 舒适体验</span>
                <span v-else-if="budget < 1000" class="budget-level premium">🎆 品质享受</span>
                <span v-else class="budget-level luxury">👑 奢华体验</span>
              </div>
            </div>
            
            <div class="budget-slider-container">
              <el-slider
                v-model="budget"
                :min="100"
                :max="2000"
                :step="50"
                :show-tooltip="false"
                class="budget-slider-enhanced"
              />
              
              <div class="budget-range">
                <span>¥100</span>
                <span>¥2000+</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 限制条件 -->
        <div class="profile-section restrictions-section important-section">
          <div class="section-header">
            <div class="section-icon warning">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="section-info">
              <h3 class="section-title">⚠️ 重要限制条件</h3>
              <p class="section-desc">请告知我们您的重要限制，确保为您推荐合适的选项</p>
            </div>
          </div>
          
          <div class="restrictions-content">
            <!-- 饮食禁忌 -->
            <div class="restriction-category">
              <h4 class="category-title">
                <el-icon><Coffee /></el-icon>
                饮食禁忌
              </h4>
              
              <div class="dietary-restrictions">
                <el-checkbox-group v-model="preferences.dietaryRestrictions" class="restriction-group">
                  <el-checkbox value="halal">
                    {{ translateTag("halal", "dietary") }}
                  </el-checkbox>
                  <el-checkbox value="vegetarian">
                    {{ translateTag("vegetarian", "dietary") }}
                  </el-checkbox>
                  <el-checkbox value="vegan">
                    {{ translateTag("vegan", "dietary") }}
                  </el-checkbox>
                  <el-checkbox value="no_pork">
                    {{ translateTag("no_pork", "dietary") }}
                  </el-checkbox>
                  <el-checkbox value="no_beef">
                    {{ translateTag("no_beef", "dietary") }}
                  </el-checkbox>
                  <el-checkbox value="no_seafood">
                    {{ translateTag("no_seafood", "dietary") }}
                  </el-checkbox>
                  <el-checkbox value="no_spicy">
                    {{ translateTag("no_spicy", "dietary") }}
                  </el-checkbox>
                  <el-checkbox value="gluten_free">
                    {{ translateTag("gluten_free", "dietary") }}
                  </el-checkbox>
                  <el-checkbox value="no_alcohol">
                    {{ translateTag("no_alcohol", "dietary") }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
              
              <div class="custom-dietary">
                <label class="custom-label">其他特殊需求：</label>
                <el-input
                  v-model="preferences.customDietaryNotes"
                  type="textarea"
                  :rows="2"
                  placeholder="如：对花生过敏、不吃香菜等"
                  class="custom-input"
                />
              </div>
            </div>
            
            <!-- 身体限制 -->
            <div class="restriction-category">
              <h4 class="category-title">
                <el-icon><User /></el-icon>
                身体限制
              </h4>
              
              <div class="physical-restrictions">
                <div class="restriction-item">
                  <span>需要无障碍设施</span>
                  <el-switch v-model="preferences.needAccessibility" />
                </div>
                <div class="restriction-item">
                  <span>带有小孩</span>
                  <el-switch v-model="preferences.includeKidsActivities" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 出行习惯 -->
        <div class="profile-section transport-section">
          <div class="section-header">
            <div class="section-icon">
              <el-icon><MapLocation /></el-icon>
            </div>
            <div class="section-info">
              <h3 class="section-title">🚗 出行习惯</h3>
              <p class="section-desc">选择您常用的交通方式和住宿偏好</p>
            </div>
          </div>
          
          <div class="transport-content">
            <div class="transport-preferences">
              <h4 class="sub-title">交通方式</h4>
              <div class="transport-grid-enhanced">
                <div
                  v-for="transport in transportTypes"
                  :key="transport.value"
                  class="transport-card-enhanced"
                  :class="{
                    'is-selected': selectedTransports.includes(transport.value),
                  }"
                  @click="toggleTransport(transport.value)"
                >
                  <component :is="transport.icon" class="transport-icon" />
                  <div class="transport-info">
                    <span class="transport-label">{{ transport.label }}</span>
                    <span class="transport-desc">{{ transport.desc }}</span>
                  </div>
                  <el-icon v-if="selectedTransports.includes(transport.value)" class="selected-icon">
                    <Check />
                  </el-icon>
                </div>
              </div>
            </div>
            
            <div class="accommodation-preferences">
              <h4 class="sub-title">住宿偏好</h4>
              <div class="accommodation-grid-enhanced">
                <div
                  class="accommodation-card-enhanced"
                  :class="{
                    'is-selected': preferences.accommodationType === 'budget',
                  }"
                  @click="preferences.accommodationType = 'budget'"
                >
                  <el-icon class="accommodation-icon">
                    <House />
                  </el-icon>
                  <div class="accommodation-info">
                    <span class="accommodation-title">{{ translateTag("budget") }}</span>
                    <span class="accommodation-desc">经济实惠</span>
                  </div>
                </div>
                
                <div
                  class="accommodation-card-enhanced"
                  :class="{
                    'is-selected': preferences.accommodationType === 'comfort',
                  }"
                  @click="preferences.accommodationType = 'comfort'"
                >
                  <el-icon class="accommodation-icon">
                    <Monitor />
                  </el-icon>
                  <div class="accommodation-info">
                    <span class="accommodation-title">{{ translateTag("comfort") }}</span>
                    <span class="accommodation-desc">舒适体验</span>
                  </div>
                </div>
                
                <div
                  class="accommodation-card-enhanced"
                  :class="{
                    'is-selected': preferences.accommodationType === 'bnb',
                  }"
                  @click="preferences.accommodationType = 'bnb'"
                >
                  <el-icon class="accommodation-icon">
                    <Coffee />
                  </el-icon>
                  <div class="accommodation-info">
                    <span class="accommodation-title">{{ translateTag("bnb") }}</span>
                    <span class="accommodation-desc">当地体验</span>
                  </div>
                </div>
                
                <div
                  class="accommodation-card-enhanced"
                  :class="{
                    'is-selected': preferences.accommodationType === 'luxury',
                  }"
                  @click="preferences.accommodationType = 'luxury'"
                >
                  <el-icon class="accommodation-icon">
                    <Trophy />
                  </el-icon>
                  <div class="accommodation-info">
                    <span class="accommodation-title">{{ translateTag("luxury") }}</span>
                    <span class="accommodation-desc">奢华享受</span>
                  </div>
                </div>
              </div>
            </div>
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
          保存档案
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/store/user.js";
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
  UserFilled,
  Star,
  Timer,
  Warning,
} from "@element-plus/icons-vue";
import { useRouter, useRoute } from "vue-router";
import {
  getMbtiName,
  getMbtiTravelDescription,
  translateTag,
} from "@/utils/data/tagMapping.js";
import UserCenterNav from "@/components/User/UserCenterNav.vue";

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
    UserFilled,
    Star,
    Timer,
    Warning,
  },
  props: {
    embedded: { type: Boolean, default: false },
  },
  emits: ["saved", "close"],
  setup(props, { emit }) {
    const userStore = useUserStore();
    const router = useRouter();
    const route = useRoute();

    // 响应式数据
    const selectedTags = ref([]);
    const budget = ref(300);
    const saving = ref(false);
    const loading = ref(true);
    const preferences = reactive({
      accommodationType: "comfort",
      dietaryRestrictions: [],
      includeKidsActivities: false,
      needAccessibility: false,
      customDietaryNotes: "",
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

    // MBTI性格类型变化处理
    const handleMbtiChange = (value) => {
      mbtiType.value = value;
      console.log("MBTI类型变更:", value);
    };

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

        // 从userStore中加载偏好数据
        const userPrefs = userStore.currentUser.preferences;
        const userBudget = userStore.currentUser.budget;

        // 加载预算
        if (userBudget) {
          budget.value = parseInt(userBudget);
        }

        // 如果有偏好数据则解析并加载
        if (userPrefs) {
          const parsed = typeof userPrefs === "string" ? JSON.parse(userPrefs) : userPrefs;

          // 加载旅行类型标签
          if (parsed.selectedTags && Array.isArray(parsed.selectedTags)) {
            selectedTags.value = [...parsed.selectedTags];
          }

          // 加载MBTI性格类型
          if (parsed.mbtiType) {
            mbtiType.value = parsed.mbtiType;
          }

          // 加载预算（从偏好数据中）
          if (parsed.budget) {
            budget.value = parseInt(parsed.budget);
          }

          // 加载出行方式偏好
          if (parsed.selectedTransports && Array.isArray(parsed.selectedTransports)) {
            selectedTransports.value = [...parsed.selectedTransports];
          }

          // 加载住宿类型偏好
          if (parsed.accommodationType) {
            preferences.accommodationType = parsed.accommodationType;
          }

          // 加载饮食禁忌
          if (parsed.dietaryRestrictions && Array.isArray(parsed.dietaryRestrictions)) {
            preferences.dietaryRestrictions = [...parsed.dietaryRestrictions];
          }

          // 加载其他饮食需求
          if (parsed.customDietaryNotes) {
            preferences.customDietaryNotes = parsed.customDietaryNotes;
          }

          // 加载身体限制
          if (parsed.includeKidsActivities !== undefined) {
            preferences.includeKidsActivities = parsed.includeKidsActivities;
          }
          if (parsed.needAccessibility !== undefined) {
            preferences.needAccessibility = parsed.needAccessibility;
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

        // 构建偏好数据 - 精简的档案数据
        const preferencesData = {
          selectedTags: selectedTags.value,
          budget: budget.value,
          selectedTransports: selectedTransports.value,
          accommodationType: preferences.accommodationType,
          dietaryRestrictions: preferences.dietaryRestrictions,
          mbtiType: mbtiType.value,
          customDietaryNotes: preferences.customDietaryNotes,
          includeKidsActivities: preferences.includeKidsActivities,
          needAccessibility: preferences.needAccessibility,
          isCompleted: true,
        };

        console.log("💾 保存档案数据:", preferencesData);

        // 调用API保存偏好
        await userStore.updateUserPreferences(preferencesData);

        ElMessage.success("旅行档案已保存");

        // 嵌入模式下不跳转，发出事件交给父级关闭抽屉
        if (props.embedded) {
          emit("saved");
        } else {
          // 根据query参数决定跳转目标
          const returnTo = route.query.returnTo;
          const returnQuery = route.query.returnQuery;
          setTimeout(() => {
            if (returnTo) {
              try {
                const queryParams = returnQuery ? JSON.parse(returnQuery) : {};
                router.push({ path: returnTo, query: queryParams });
                console.log(`🔄 返回到: ${returnTo}`);
              } catch (error) {
                console.error("解析返回参数失败:", error);
                router.push(returnTo);
              }
            } else {
              router.push("/home");
            }
          }, 800);
        }
      } catch (error) {
        console.error("保存偏好设置失败:", error);
        ElMessage.error("保存失败：" + (error.message || "请重试"));
      } finally {
        saving.value = false;
      }
    };

    // 组件挂载时加载数据
    onMounted(async () => {
      loading.value = true;

      // 确保用户数据是最新的
      if (userStore.isLoggedIn && userStore.currentUser) {
        try {
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
      { deep: true }
    );

    return {
      selectedTags,
      budget,
      saving,
      loading,
      preferences,
      availableTags,
      toggleTag,
      savePreferences,
      transportTypes,
      selectedTransports,
      toggleTransport,
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
/* 统一的页面布局 */
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

/* 内嵌模式：用于抽屉/对话框中复用，不改变父级布局 */
.preferences-embedded {
  width: 100%;
  padding: 0 12px 12px 12px;
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
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 60px;
}

/* 引导说明区域 */
.setup-intro {
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  color: white;
  position: relative;
  overflow: hidden;
}

.setup-intro::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="a" cx="50" cy="50" r="50"><stop offset="0" stop-color="white" stop-opacity="0.1"/><stop offset="1" stop-color="white" stop-opacity="0.05"/></radialGradient></defs><rect width="100" height="20" fill="url(%23a)"/></svg>');
  opacity: 0.3;
}

.intro-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.intro-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  backdrop-filter: blur(10px);
}

.intro-content h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.intro-content p {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
}

.intro-benefits {
  display: flex;
  gap: 32px;
  position: relative;
  z-index: 1;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.benefit-item .el-icon {
  font-size: 18px;
}

/* 档案区域样式 */
.profile-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8eaed;
  transition: all 0.3s ease;
}

.profile-section:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.profile-section.important-section {
  border-left: 4px solid #f56c6c;
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
}

/* 区块头部 */
.section-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.section-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.2);
  flex-shrink: 0;
}

.section-icon.warning {
  background: linear-gradient(135deg, #f56c6c 0%, #ff7875 100%);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.section-info {
  flex: 1;
}

.section-title {
  margin: 0 0 8px;
  font-weight: 600;
  font-size: 20px;
  color: #303133;
}

.section-desc {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

/* MBTI选择增强样式 */
.mbti-selection-enhanced {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mbti-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mbti-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.optional-badge {
  background: #e6f7ff;
  color: #1890ff;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.mbti-preview {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid #91a8d0;
}

.mbti-info h4 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #303133;
}

.mbti-info p {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

/* 兴趣标签增强样式 */
.tags-grid-enhanced {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.interest-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  border-radius: 12px;
  transition: all 0.2s;
  cursor: pointer;
}

.interest-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
}

.tag-icon {
  width: 18px;
  height: 18px;
}

.selection-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  color: #606266;
}

/* 预算设置增强样式 */
.budget-display-enhanced {
  text-align: center;
  margin-bottom: 24px;
}

.budget-amount-display {
  margin-bottom: 12px;
}

.budget-amount {
  font-size: 36px;
  font-weight: 700;
  color: #91a8d0;
}

.budget-unit {
  font-size: 16px;
  color: #909399;
  margin-left: 8px;
}

.budget-level {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

.budget-level.economy {
  background: #f0f9ff;
  color: #0369a1;
}

.budget-level.comfort {
  background: #fef3c7;
  color: #d97706;
}

.budget-level.premium {
  background: #fce7f3;
  color: #be185d;
}

.budget-level.luxury {
  background: #f3e8ff;
  color: #7c3aed;
}

.budget-slider-container {
  padding: 0 16px;
}

.budget-slider-enhanced {
  margin: 20px 0;
}

.budget-range {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 14px;
}

/* 限制条件样式 */
.restrictions-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.restriction-category {
  padding: 20px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.restriction-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  margin-bottom: 16px;
}

.custom-dietary {
  margin-top: 16px;
}

.custom-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.physical-restrictions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.restriction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.restriction-item:last-child {
  border-bottom: none;
}

/* 出行习惯样式 */
.transport-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.sub-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.transport-grid-enhanced {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.transport-card-enhanced {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.transport-card-enhanced:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.transport-card-enhanced.is-selected {
  border-color: #91a8d0;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
}

.transport-icon {
  width: 32px;
  height: 32px;
  color: #91a8d0;
  flex-shrink: 0;
}

.transport-info {
  flex: 1;
}

.transport-label {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.transport-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.3;
}

.selected-icon {
  color: #67c23a;
  font-size: 18px;
}

.accommodation-grid-enhanced {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.accommodation-card-enhanced {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  min-height: 120px;
}

.accommodation-card-enhanced:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.accommodation-card-enhanced.is-selected {
  border-color: #91a8d0;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
}

.accommodation-icon {
  width: 36px;
  height: 36px;
  margin-bottom: 12px;
  color: #91a8d0;
}

.accommodation-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.accommodation-desc {
  font-size: 13px;
  color: #909399;
}

/* 保存按钮 */
.save-section {
  text-align: center;
  padding: 32px 0;
  margin-top: 24px;
}

.save-btn {
  padding: 16px 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  min-width: 200px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preferences-page {
    padding: 16px;
    top: 64px;
  }

  .preferences-container {
    padding-bottom: 40px;
  }

  .setup-intro {
    padding: 24px;
  }

  .intro-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .intro-benefits {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }

  .profile-section {
    padding: 24px 20px;
  }

  .section-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }

  .tags-grid-enhanced {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }

  .transport-grid-enhanced {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .accommodation-grid-enhanced {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .restriction-group {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .preferences-page {
    top: 56px;
    padding: 12px;
  }

  .setup-intro {
    padding: 20px;
  }

  .intro-content h1 {
    font-size: 24px;
  }

  .profile-section {
    padding: 20px 16px;
  }

  .tags-grid-enhanced {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .accommodation-grid-enhanced {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .save-btn {
    width: 100%;
    padding: 14px 32px;
  }
}
</style>