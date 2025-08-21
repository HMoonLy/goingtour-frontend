<!--
✈️ 本次行程偏好设置页面 - 每次旅行可调整
这个页面的设计重点：
1. 清晰说明这是"针对本次旅行"的设置，可以随时调整
2. 展示个人档案如何智能影响当前选择
3. 实时显示AI将如何理解这些偏好
4. 提供丰富的智能预填和推荐功能
-->

<template>
  <div class="trip-preferences-container">
    <!-- 页面头部 - 突出"本次旅行"概念 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <el-icon><Suitcase /></el-icon>
        </div>
        <div class="header-text">
          <h1 class="page-title">✈️ 本次行程偏好设置</h1>
          <p class="page-subtitle">为这次旅行量身定制，随时可以调整的偏好设置</p>
        </div>
      </div>
      
      <!-- 个人档案智能提示 -->
      <div v-if="hasPersonalProfile" class="smart-prefill-notice">
        <div class="notice-icon">
          <el-icon><MagicStick /></el-icon>
        </div>
        <div class="notice-content">
          <h4>🎯 智能预填已启用</h4>
          <p>根据您的个人旅行档案，我们已为您预选了合适的选项。您可以根据这次旅行的具体情况随时调整。</p>
          <div class="profile-summary">
            <span v-if="personalProfile.mbtiType">性格：{{ getMbtiDisplayName(personalProfile.mbtiType) }}</span>
            <span v-if="personalProfile.coreInterests?.length">兴趣：{{ personalProfile.coreInterests.length }}项</span>
            <span v-if="personalProfile.budgetLevel">预算：{{ getBudgetDisplayName(personalProfile.budgetLevel) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 行程偏好设置区域 -->
    <div class="preferences-content">

      <!-- 1. 旅行目的 -->
      <div class="preference-section purpose-section">
        <div class="section-header">
          <div class="section-icon">
            <el-icon><Flag /></el-icon>
          </div>
          <div class="section-info">
            <h3 class="section-title">🎯 这次旅行的主要目的</h3>
            <p class="section-desc">
              告诉我们这次旅行的特殊意义，我们会相应调整推荐风格
            </p>
          </div>
        </div>
        
        <div class="purpose-content">
          <div class="purpose-cards">
            <div
              v-for="purpose in tripPurposeOptions"
              :key="purpose.value"
              class="purpose-card"
              :class="{ selected: tripPreferences.tripPurpose === purpose.value }"
              @click="selectTripPurpose(purpose.value)"
            >
              <div class="purpose-header">
                <span class="purpose-icon">{{ purpose.icon }}</span>
                <span class="purpose-name">{{ purpose.name }}</span>
              </div>
              <p class="purpose-desc">{{ purpose.description }}</p>
              <div class="purpose-ai-strategy">
                🤖
                <span>{{ purpose.aiStrategy }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. 体验重点 -->
      <div class="preference-section focus-section">
        <div class="section-header">
          <div class="section-icon">
            <el-icon><Star /></el-icon>
          </div>
          <div class="section-info">
            <h3 class="section-title">🌟 这次最想体验什么？</h3>
            <p class="section-desc">
              选择这次旅行您最期待的体验类型（最多3个）
              <span v-if="recommendedFocusAreas.length > 0" class="smart-tip">
                <el-icon><Star /></el-icon>
                基于您的兴趣，推荐了 {{ recommendedFocusAreas.length }} 项
              </span>
            </p>
          </div>
        </div>
        
        <div class="focus-content">
          <div class="focus-grid">
            <div
              v-for="focus in focusAreaOptions"
              :key="focus.value"
              class="focus-item"
              :class="{
                selected: tripPreferences.focusAreas.includes(focus.value),
                recommended: recommendedFocusAreas.includes(focus.value),
                disabled: !tripPreferences.focusAreas.includes(focus.value) && tripPreferences.focusAreas.length >= 3
              }"
              @click="toggleFocusArea(focus.value)"
            >
              <div class="focus-header">
                <span class="focus-icon">{{ focus.icon }}</span>
                <span class="focus-name">{{ focus.name }}</span>
              </div>
              <p class="focus-desc">{{ focus.description }}</p>
              
              <!-- 推荐标记 -->
              <div v-if="recommendedFocusAreas.includes(focus.value)" class="recommended-badge">
                <el-icon><Star /></el-icon>
                <span>推荐</span>
              </div>
              
              <!-- 选中标记 -->
              <div v-if="tripPreferences.focusAreas.includes(focus.value)" class="selected-badge">
                <el-icon><Check /></el-icon>
              </div>
            </div>
          </div>
          
          <div class="selection-info">
            <span class="selection-count">已选择 {{ tripPreferences.focusAreas.length }}/3</span>
            <el-button 
              v-if="tripPreferences.focusAreas.length > 0" 
              type="text" 
              size="small"
              @click="clearFocusAreas"
            >
              清空选择
            </el-button>
          </div>
        </div>
      </div>

      <!-- 3. 行程节奏 -->
      <div class="preference-section pace-section">
        <div class="section-header">
          <div class="section-icon">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="section-info">
            <h3 class="section-title">⏰ 这次想要什么样的节奏？</h3>
            <p class="section-desc">
              根据您的时间和体力情况选择合适的行程节奏
              <span v-if="recommendedPace" class="smart-tip">
                <el-icon><MagicStick /></el-icon>
                基于您的性格，推荐：{{ getPaceDisplayName(recommendedPace) }}
              </span>
            </p>
          </div>
        </div>
        
        <div class="pace-content">
          <div class="pace-cards">
            <div
              v-for="pace in pacePreferenceOptions"
              :key="pace.value"
              class="pace-card"
              :class="{
                selected: tripPreferences.pacePreference === pace.value,
                recommended: recommendedPace === pace.value
              }"
              @click="selectPacePreference(pace.value)"
            >
              <div class="pace-visual">
                <span class="pace-icon">{{ pace.icon }}</span>
                <span class="pace-name">{{ pace.name }}</span>
              </div>
              <p class="pace-desc">{{ pace.description }}</p>
              <div class="pace-strategy">
                <el-icon><InfoFilled /></el-icon>
                <span>{{ pace.aiStrategy }}</span>
              </div>
              
              <!-- 推荐标记 -->
              <div v-if="recommendedPace === pace.value" class="pace-recommended">
                <el-icon><Star /></el-icon>
                <span>推荐</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. 社交偏好 -->
      <div class="preference-section social-section">
        <div class="section-header">
          <div class="section-icon">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="section-info">
            <h3 class="section-title">🎭 这次偏好什么样的氛围？</h3>
            <p class="section-desc">
              选择您希望的旅行氛围和环境类型
              <span v-if="recommendedSocial" class="smart-tip">
                <el-icon><MagicStick /></el-icon>
                基于您的性格，推荐：{{ getSocialDisplayName(recommendedSocial) }}
              </span>
            </p>
          </div>
        </div>
        
        <div class="social-content">
          <div class="social-options">
            <div
              v-for="social in socialPreferenceOptions"
              :key="social.value"
              class="social-option"
              :class="{
                selected: tripPreferences.socialPreference === social.value,
                recommended: recommendedSocial === social.value
              }"
              @click="selectSocialPreference(social.value)"
            >
              <div class="social-header">
                <span class="social-icon">{{ social.icon }}</span>
                <span class="social-name">{{ social.name }}</span>
              </div>
              <p class="social-desc">{{ social.description }}</p>
              <div class="social-strategy">
                <span>{{ social.aiStrategy }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. 拍照需求 -->
      <div class="preference-section photo-section">
        <div class="section-header">
          <div class="section-icon">
            <el-icon><Camera /></el-icon>
          </div>
          <div class="section-info">
            <h3 class="section-title">📸 这次旅行对拍照的重视程度</h3>
            <p class="section-desc">
              帮助我们安排合适的拍照时间和推荐上镜景点
              <span v-if="recommendedPhoto" class="smart-tip">
                <el-icon><MagicStick /></el-icon>
                基于您的兴趣，推荐：{{ getPhotoDisplayName(recommendedPhoto) }}
              </span>
            </p>
          </div>
        </div>
        
        <div class="photo-content">
          <div class="photo-slider-container">
            <div class="photo-levels">
              <div
                v-for="(photo, index) in photoPreferenceOptions"
                :key="photo.value"
                class="photo-level"
                :class="{
                  selected: tripPreferences.photoPreference === photo.value,
                  recommended: recommendedPhoto === photo.value
                }"
                @click="selectPhotoPreference(photo.value)"
              >
                <div class="photo-icon">{{ photo.icon }}</div>
                <div class="photo-info">
                  <span class="photo-name">{{ photo.name }}</span>
                  <span class="photo-desc">{{ photo.description }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 6. 临时特殊需求 -->
      <div class="preference-section needs-section">
        <div class="section-header">
          <div class="section-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="section-info">
            <h3 class="section-title">⚠️ 这次旅行的特殊情况</h3>
            <p class="section-desc">
              选择这次旅行需要特别考虑的因素（可多选）
            </p>
          </div>
        </div>
        
        <div class="needs-content">
          <div class="needs-grid">
            <div
              v-for="need in temporaryNeedsOptions"
              :key="need.value"
              class="need-item"
              :class="{ selected: tripPreferences.temporaryNeeds.includes(need.value) }"
              @click="toggleTemporaryNeed(need.value)"
            >
              <div class="need-header">
                <span class="need-icon">{{ need.icon }}</span>
                <span class="need-name">{{ need.name }}</span>
              </div>
              <p class="need-desc">{{ need.description }}</p>
              <div class="need-strategy">
                <el-icon><InfoFilled /></el-icon>
                <span>{{ need.aiStrategy }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI理解预览 -->
    <div v-if="hasValidPreferences" class="ai-preview">
      <div class="preview-header">
  
        <h4>🤖 AI将如何为您规划行程</h4>
      </div>
      <div class="preview-content">
        <div class="preview-text">
          {{ generateAIPreview() }}
        </div>
        <el-button type="text" @click="showDetailedAI = !showDetailedAI">
          {{ showDetailedAI ? '收起' : '查看详细' }}AI解读
        </el-button>
        
        <div v-if="showDetailedAI" class="detailed-ai-preview">
          <pre>{{ generateDetailedAI() }}</pre>
        </div>
      </div>
    </div>

    <!-- 保存/继续按钮 -->
    <div class="action-section">
      <el-button
        type="primary"
        size="large"
        :loading="saving"
        class="save-button"
        @click="savePreferences"
      >
        <el-icon><Check /></el-icon>
        保存并继续
      </el-button>
      <p class="save-tip">
        保存后将进入推荐选择，您可以挑选感兴趣的景点和餐厅
      </p>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  Suitcase, Flag, Star, Timer, UserFilled, Camera, Warning,
  MagicStick, Check, InfoFilled
} from '@element-plus/icons-vue';
import { TRIP_PREFERENCES_OPTIONS } from '@/utils/data/travelDataSystem.js';
import { 
  TripPreferencesInterpreter, 
  SmartPrefillEngine, 
  CompletePromptGenerator 
} from '@/utils/data/aiPromptEngine.js';
import { useUserStore } from '@/store/user.js';

export default {
  name: 'TripPreferencesNew',
  components: {
    Suitcase, Flag, Star, Timer, UserFilled, Camera, Warning,
    MagicStick,  Check, InfoFilled
  },
  props: {
    tripContext: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['preferences-updated', 'preferences-saved'],
  setup(props, { emit }) {
    const userStore = useUserStore();
    const saving = ref(false);
    const showDetailedAI = ref(false);

    // 个人档案数据
    const personalProfile = ref({});
    const hasPersonalProfile = computed(() => 
      Object.keys(personalProfile.value).length > 0
    );

    // 行程偏好数据
    const tripPreferences = reactive({
      tripPurpose: '',
      focusAreas: [],
      pacePreference: 'balanced',
      socialPreference: 'mixed',
      photoPreference: 'casual',
      temporaryNeeds: []
    });

    // 选项数据（从新的数据系统获取）
    const tripPurposeOptions = computed(() =>
      Object.entries(TRIP_PREFERENCES_OPTIONS.tripPurpose.options).map(([key, value]) => ({
        value: key,
        ...value
      }))
    );

    const focusAreaOptions = computed(() =>
      Object.entries(TRIP_PREFERENCES_OPTIONS.focusAreas.options).map(([key, value]) => ({
        value: key,
        ...value
      }))
    );

    const pacePreferenceOptions = computed(() =>
      Object.entries(TRIP_PREFERENCES_OPTIONS.pacePreference.options).map(([key, value]) => ({
        value: key,
        ...value
      }))
    );

    const socialPreferenceOptions = computed(() =>
      Object.entries(TRIP_PREFERENCES_OPTIONS.socialPreference.options).map(([key, value]) => ({
        value: key,
        ...value
      }))
    );

    const photoPreferenceOptions = computed(() =>
      Object.entries(TRIP_PREFERENCES_OPTIONS.photoPreference.options).map(([key, value]) => ({
        value: key,
        ...value
      }))
    );

    const temporaryNeedsOptions = computed(() =>
      Object.entries(TRIP_PREFERENCES_OPTIONS.temporaryNeeds.options).map(([key, value]) => ({
        value: key,
        ...value
      }))
    );

    // 智能推荐数据
    const smartPrefill = ref(null);
    const recommendedFocusAreas = ref([]);
    const recommendedPace = ref('');
    const recommendedSocial = ref('');
    const recommendedPhoto = ref('');

    // 偏好完整性检查
    const hasValidPreferences = computed(() => {
      return tripPreferences.tripPurpose || 
             tripPreferences.focusAreas.length > 0 || 
             tripPreferences.temporaryNeeds.length > 0;
    });

    // 选择函数
    const selectTripPurpose = (purpose) => {
      tripPreferences.tripPurpose = purpose;
      emit('preferences-updated', { ...tripPreferences });
    };

    const toggleFocusArea = (area) => {
      const index = tripPreferences.focusAreas.indexOf(area);
      if (index > -1) {
        tripPreferences.focusAreas.splice(index, 1);
      } else if (tripPreferences.focusAreas.length < 3) {
        tripPreferences.focusAreas.push(area);
      }
      emit('preferences-updated', { ...tripPreferences });
    };

    const clearFocusAreas = () => {
      tripPreferences.focusAreas = [];
      emit('preferences-updated', { ...tripPreferences });
    };

    const selectPacePreference = (pace) => {
      tripPreferences.pacePreference = pace;
      emit('preferences-updated', { ...tripPreferences });
    };

    const selectSocialPreference = (social) => {
      tripPreferences.socialPreference = social;
      emit('preferences-updated', { ...tripPreferences });
    };

    const selectPhotoPreference = (photo) => {
      tripPreferences.photoPreference = photo;
      emit('preferences-updated', { ...tripPreferences });
    };

    const toggleTemporaryNeed = (need) => {
      const index = tripPreferences.temporaryNeeds.indexOf(need);
      if (index > -1) {
        tripPreferences.temporaryNeeds.splice(index, 1);
      } else {
        tripPreferences.temporaryNeeds.push(need);
      }
      emit('preferences-updated', { ...tripPreferences });
    };

    // 显示名称函数
    const getMbtiDisplayName = (type) => {
      return type; // 简化显示，实际可以从选项中获取
    };

    const getBudgetDisplayName = (level) => {
      const option = TRIP_PREFERENCES_OPTIONS.budgetLevel?.options[level];
      return option ? option.name : level;
    };

    const getPaceDisplayName = (pace) => {
      const option = pacePreferenceOptions.value.find(opt => opt.value === pace);
      return option ? option.name : pace;
    };

    const getSocialDisplayName = (social) => {
      const option = socialPreferenceOptions.value.find(opt => opt.value === social);
      return option ? option.name : social;
    };

    const getPhotoDisplayName = (photo) => {
      const option = photoPreferenceOptions.value.find(opt => opt.value === photo);
      return option ? option.name : photo;
    };

    // AI预览生成
    const generateAIPreview = () => {
      const interpreter = new TripPreferencesInterpreter(tripPreferences);
      const preview = interpreter.generateCompletePreferences();
      
      // 简化显示前2行
      const lines = preview.split('\n\n').slice(0, 2);
      return lines.join(' ');
    };

    const generateDetailedAI = () => {
      if (!hasPersonalProfile.value) return '需要设置个人档案才能生成详细AI解读';
      
      const generator = new CompletePromptGenerator(
        personalProfile.value, 
        tripPreferences, 
        props.tripContext
      );
      return generator.generateCompletePrompt();
    };

    // 智能预填功能
    const initializeSmartPrefill = () => {
      if (!hasPersonalProfile.value) return;

      smartPrefill.value = new SmartPrefillEngine(personalProfile.value);
      const defaults = smartPrefill.value.getSmartDefaults();
      
      // 设置推荐项
      recommendedFocusAreas.value = defaults.focusAreas || [];
      recommendedPace.value = defaults.pacePreference || '';
      recommendedSocial.value = defaults.socialPreference || '';
      recommendedPhoto.value = defaults.photoPreference || '';
      
      // 应用默认值（如果用户还没有设置）
      if (!tripPreferences.pacePreference || tripPreferences.pacePreference === 'balanced') {
        tripPreferences.pacePreference = defaults.pacePreference;
      }
      if (!tripPreferences.socialPreference || tripPreferences.socialPreference === 'mixed') {
        tripPreferences.socialPreference = defaults.socialPreference;
      }
      if (!tripPreferences.photoPreference || tripPreferences.photoPreference === 'casual') {
        tripPreferences.photoPreference = defaults.photoPreference;
      }
      if (tripPreferences.focusAreas.length === 0 && defaults.focusAreas.length > 0) {
        tripPreferences.focusAreas = [...defaults.focusAreas.slice(0, 3)];
      }
    };

    // 保存偏好
    const savePreferences = async () => {
      if (saving.value) return;

      try {
        saving.value = true;

        // 这里可以调用API保存行程偏好
        // await api.saveTripPreferences(tripPreferences);

        ElMessage.success('行程偏好已保存！');
        emit('preferences-saved', { ...tripPreferences });
        
      } catch (error) {
        console.error('保存偏好失败:', error);
        ElMessage.error('保存失败：' + (error.message || '请重试'));
      } finally {
        saving.value = false;
      }
    };

    // 加载个人档案
    const loadPersonalProfile = async () => {
      try {
        await userStore.fetchUserPreferences();
        const userPrefs = userStore.currentUser?.preferences;
        
        if (userPrefs) {
          const parsed = typeof userPrefs === 'string' ? JSON.parse(userPrefs) : userPrefs;
          personalProfile.value = parsed;
          
          // 初始化智能预填
          initializeSmartPrefill();
        }
      } catch (error) {
        console.warn('加载个人档案失败:', error);
      }
    };

    onMounted(() => {
      loadPersonalProfile();
    });

    // 监听个人档案变化
    watch(() => userStore.currentUser?.preferences, (newPrefs) => {
      if (newPrefs) {
        const parsed = typeof newPrefs === 'string' ? JSON.parse(newPrefs) : newPrefs;
        personalProfile.value = parsed;
        initializeSmartPrefill();
      }
    }, { deep: true });

    return {
      tripPreferences,
      personalProfile,
      hasPersonalProfile,
      saving,
      showDetailedAI,
      tripPurposeOptions,
      focusAreaOptions,
      pacePreferenceOptions,
      socialPreferenceOptions,
      photoPreferenceOptions,
      temporaryNeedsOptions,
      recommendedFocusAreas,
      recommendedPace,
      recommendedSocial,
      recommendedPhoto,
      hasValidPreferences,
      selectTripPurpose,
      toggleFocusArea,
      clearFocusAreas,
      selectPacePreference,
      selectSocialPreference,
      selectPhotoPreference,
      toggleTemporaryNeed,
      getMbtiDisplayName,
      getBudgetDisplayName,
      getPaceDisplayName,
      getSocialDisplayName,
      getPhotoDisplayName,
      generateAIPreview,
      generateDetailedAI,
      savePreferences
    };
  }
};
</script>

<style scoped>
.trip-preferences-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  background: #fafafa;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #91A8D0 0%, #A3B7DB 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 32px;
  color: white;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="a" cx="50" cy="50" r="50"><stop offset="0" stop-color="white" stop-opacity="0.1"/><stop offset="1" stop-color="white" stop-opacity="0.05"/></radialGradient></defs><rect width="100" height="20" fill="url(%23a)"/></svg>');
  opacity: 0.3;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
}

.header-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  backdrop-filter: blur(10px);
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
}

.smart-prefill-notice {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.notice-icon {
  font-size: 32px;
  color: #F7CAC9;
  flex-shrink: 0;
}

.notice-content h4 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
}

.notice-content p {
  margin: 0 0 12px;
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.4;
}

.profile-summary {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.profile-summary span {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 偏好内容区域 */
.preferences-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.preference-section {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8eaed;
  transition: all 0.3s ease;
}

.preference-section:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 区块头部 */
.section-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 32px;
}

.section-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #91A8D0 0%, #A3B7DB 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.2);
  flex-shrink: 0;
}

.section-info {
  flex: 1;
}

.section-title {
  margin: 0 0 8px;
  font-weight: 600;
  font-size: 24px;
  color: #303133;
}

.section-desc {
  margin: 0;
  font-size: 16px;
  color: #606266;
  line-height: 1.5;
}

.smart-tip {
  background: rgba(145, 168, 208, 0.1);
  color: #91A8D0;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* 旅行目的卡片 */
.purpose-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.purpose-card {
  padding: 24px;
  border: 2px solid #e4e7ed;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.purpose-card:hover {
  border-color: #91A8D0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.purpose-card.selected {
  border-color: #91A8D0;
  background: linear-gradient(135deg, rgba(145, 168, 208, 0.1) 0%, #ffffff 100%);
}

.purpose-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.purpose-icon {
  font-size: 24px;
}

.purpose-name {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.purpose-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

.purpose-ai-strategy {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #909399;
  font-style: italic;
}

/* 体验重点网格 */
.focus-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.focus-item {
  position: relative;
  padding: 20px;
  border: 2px solid #e4e7ed;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.focus-item:hover {
  border-color: #91A8D0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.focus-item.selected {
  border-color: #91A8D0;
  background: linear-gradient(135deg, rgba(145, 168, 208, 0.1) 0%, #ffffff 100%);
}

.focus-item.recommended {
  border-color: #F7CAC9;
  background: linear-gradient(135deg, rgba(247, 202, 201, 0.1) 0%, #ffffff 100%);
}

.focus-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.focus-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.focus-icon {
  font-size: 20px;
}

.focus-name {
  font-weight: 600;
  color: #303133;
}

.focus-desc {
  margin: 0;
  font-size: 13px;
  color: #606266;
}

.recommended-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #F7CAC9;
  color: #2c3e50;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 2px;
}

.selected-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  color: #67c23a;
  font-size: 18px;
}

.selection-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  font-size: 14px;
}

.selection-count {
  font-weight: 600;
  color: #303133;
}

/* 节奏卡片 */
.pace-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.pace-card {
  position: relative;
  padding: 24px;
  border: 2px solid #e4e7ed;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.pace-card:hover {
  border-color: #91A8D0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.pace-card.selected {
  border-color: #91A8D0;
  background: linear-gradient(135deg, rgba(145, 168, 208, 0.1) 0%, #ffffff 100%);
}

.pace-card.recommended {
  border-color: #F7CAC9;
  background: linear-gradient(135deg, rgba(247, 202, 201, 0.1) 0%, #ffffff 100%);
}

.pace-visual {
  margin-bottom: 16px;
}

.pace-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.pace-name {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.pace-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: #606266;
}

.pace-strategy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: #909399;
  font-style: italic;
}

.pace-recommended {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #F7CAC9;
  color: #2c3e50;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 2px;
}

/* 社交选项 */
.social-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.social-option {
  padding: 24px;
  border: 2px solid #e4e7ed;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-option:hover {
  border-color: #91A8D0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.social-option.selected {
  border-color: #91A8D0;
  background: linear-gradient(135deg, rgba(145, 168, 208, 0.1) 0%, #ffffff 100%);
}

.social-option.recommended {
  border-color: #F7CAC9;
  background: linear-gradient(135deg, rgba(247, 202, 201, 0.1) 0%, #ffffff 100%);
}

.social-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.social-icon {
  font-size: 24px;
}

.social-name {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.social-desc {
  margin: 0 0 12px;
  font-size: 14px;
  color: #606266;
}

.social-strategy {
  font-size: 13px;
  color: #909399;
  font-style: italic;
}

/* 拍照需求 */
.photo-levels {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.photo-level {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid #e4e7ed;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.photo-level:hover {
  border-color: #91A8D0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.photo-level.selected {
  border-color: #91A8D0;
  background: linear-gradient(135deg, rgba(145, 168, 208, 0.1) 0%, #ffffff 100%);
}

.photo-level.recommended {
  border-color: #F7CAC9;
  background: linear-gradient(135deg, rgba(247, 202, 201, 0.1) 0%, #ffffff 100%);
}

.photo-icon {
  font-size: 24px;
  width: 40px;
  text-align: center;
}

.photo-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.photo-name {
  font-weight: 600;
  color: #303133;
}

.photo-desc {
  font-size: 13px;
  color: #606266;
}

/* 特殊需求网格 */
.needs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.need-item {
  padding: 24px;
  border: 2px solid #e4e7ed;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.need-item:hover {
  border-color: #E53935;
  box-shadow: 0 4px 12px rgba(229, 57, 53, 0.15);
  transform: translateY(-2px);
}

.need-item.selected {
  border-color: #E53935;
  background: linear-gradient(135deg, rgba(229, 57, 53, 0.05) 0%, #ffffff 100%);
}

.need-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.need-icon {
  font-size: 20px;
}

.need-name {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.need-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

.need-strategy {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #909399;
  font-style: italic;
}

/* AI预览 */
.ai-preview {
  background: linear-gradient(135deg, #91A8D0 0%, #A3B7DB 100%);
  border-radius: 20px;
  padding: 32px;
  margin: 32px 0;
  color: white;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.preview-header h4 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.preview-content {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.preview-text {
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.9;
  margin-bottom: 16px;
}

.detailed-ai-preview {
  margin-top: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.detailed-ai-preview pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  opacity: 0.8;
}

/* 操作区域 */
.action-section {
  text-align: center;
  padding: 40px 0;
}

.save-button {
  padding: 16px 48px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 16px;
  min-width: 240px;
  margin-bottom: 16px;
}

.save-tip {
  margin: 0;
  font-size: 14px;
  color: #909399;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .trip-preferences-container {
    padding: 16px;
  }

  .page-header {
    padding: 32px 24px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .page-title {
    font-size: 28px;
  }

  .smart-prefill-notice {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .profile-summary {
    justify-content: center;
  }

  .preference-section {
    padding: 24px 20px;
  }

  .section-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
  }

  .purpose-cards,
  .focus-grid,
  .pace-cards,
  .social-options,
  .needs-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .photo-levels {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
