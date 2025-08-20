<!--
🎯 个人旅行档案设置页面 - 一次设置，终身受益
这个页面的设计重点：
1. 清晰说明这是"终身档案"，设置一次就会影响所有未来的行程推荐
2. 展示每个设置对推荐的具体影响
3. 实时预览AI如何理解用户的选择
4. 提供丰富的视觉反馈和说明
-->

<template>
  <div class="personal-profile-page" :class="{ 'embedded-mode': embedded }">
    <!-- 页面头部 - 清晰说明页面用途 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <el-icon><UserFilled /></el-icon>
        </div>
        <div class="header-text">
          <h1 class="page-title">🎯 建立您的个人旅行档案</h1>
          <p class="page-subtitle">一次设置，终身受益 - 我们将基于这些信息为您的每次旅行提供个性化推荐</p>
        </div>
      </div>
      
      <!-- 设置收益说明 -->
      <div class="benefits-showcase">
        <div class="benefit-item">
          <el-icon class="benefit-icon"><Star /></el-icon>
          <div class="benefit-text">
            <span class="benefit-title">个性化推荐</span>
            <span class="benefit-desc">基于您的性格和兴趣推荐最适合的景点</span>
          </div>
        </div>
        <div class="benefit-item">
          <el-icon class="benefit-icon"><Lightning /></el-icon>
          <div class="benefit-text">
            <span class="benefit-title">智能预填</span>
            <span class="benefit-desc">创建行程时自动预填合适的偏好选项</span>
          </div>
        </div>
        <div class="benefit-item">
          <el-icon class="benefit-icon"><Check /></el-icon>
          <div class="benefit-text">
            <span class="benefit-title">避免重复</span>
            <span class="benefit-desc">无需每次重复填写相同的限制和偏好</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 档案设置区域 -->
    <div class="profile-content">
      
      <!-- 1. 性格特征 -->
      <div class="profile-section personality-section">
        <div class="section-header">
          <div class="section-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="section-info">
            <h3 class="section-title">🧠 性格特征</h3>
            <p class="section-desc">
              帮助AI理解您的旅行风格和节奏偏好
              <span class="optional-tag">可选</span>
            </p>
          </div>
        </div>
        
        <div class="personality-content">
          <el-select
            v-model="profileData.mbtiType"
            placeholder="选择您的MBTI类型（不确定可跳过）"
            size="large"
            clearable
            class="mbti-selector"
            @change="onMbtiChange"
          >
            <el-option-group 
              v-for="group in mbtiGroups" 
              :key="group.label" 
              :label="group.label"
            >
              <el-option
                v-for="option in group.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-option-group>
          </el-select>
          
          <!-- MBTI影响预览 -->
          <div v-if="profileData.mbtiType" class="mbti-impact-preview">
            <div class="impact-header">
              <el-icon><MagicStick /></el-icon>
              <span>AI将如何理解您的性格：</span>
            </div>
            <div class="impact-content">
              <div class="mbti-personality-display">
                <div class="mbti-image-container">
                  <img 
                    :src="`/images/mbti/${profileData.mbtiType}.png`" 
                    :alt="getMbtiDisplayName(profileData.mbtiType)"
                    class="mbti-personality-image"
                    @error="handleImageError"
                  />
                </div>
                <div class="mbti-info">
                  <h4>{{ getMbtiDisplayName(profileData.mbtiType) }}</h4>
                  <p>{{ getMbtiTravelStyle(profileData.mbtiType) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. 核心兴趣爱好 -->
      <div class="profile-section interests-section">
        <div class="section-header">
          <div class="section-icon">
            <el-icon><Collection /></el-icon>
          </div>
          <div class="section-info">
            <h3 class="section-title">🎨 核心兴趣爱好</h3>
            <p class="section-desc">
              选择您平时最感兴趣的领域（最多5个），我们会在每次行程中优先推荐相关体验
            </p>
          </div>
        </div>
        
        <div class="interests-content">
          <div class="interests-grid">
            <div
              v-for="interest in coreInterestOptions"
              :key="interest.value"
              class="interest-card"
              :class="{
                selected: profileData.coreInterests.includes(interest.value),
                disabled: !profileData.coreInterests.includes(interest.value) && profileData.coreInterests.length >= 5
              }"
              @click="toggleInterest(interest.value)"
            >
              <div class="interest-icon">{{ interest.icon }}</div>
              <div class="interest-info">
                <span class="interest-name">{{ interest.name }}</span>
                <span class="interest-desc">{{ interest.description }}</span>
              </div>
              <div v-if="profileData.coreInterests.includes(interest.value)" class="selected-mark">
                <el-icon><Check /></el-icon>
              </div>
            </div>
          </div>
          
          <!-- 选择计数和影响说明 -->
          <div class="selection-summary">
            <div class="selection-count">
              已选择 {{ profileData.coreInterests.length }}/5 个兴趣
            </div>
            <div v-if="profileData.coreInterests.length > 0" class="ai-impact-tip">
              💡 这些兴趣会影响景点类型、活动推荐和行程安排
            </div>
          </div>
        </div>
      </div>

      <!-- 3. 预算水平 -->
      <div class="profile-section budget-section">
        <div class="section-header">
          <div class="section-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="section-info">
            <h3 class="section-title">💰 旅行预算水平</h3>
            <p class="section-desc">
              设置您通常的旅行预算范围，影响住宿、餐饮、景点推荐档次
            </p>
          </div>
        </div>
        
        <div class="budget-content">
          <!-- 预算等级卡片 -->
          <div class="budget-cards">
            <div
              v-for="budget in budgetLevelOptions"
              :key="budget.value"
              class="budget-card"
              :class="{ selected: profileData.budgetLevel === budget.value }"
              @click="profileData.budgetLevel = budget.value"
            >
              <div class="budget-header">
                <span class="budget-name">{{ budget.name }}</span>
                <span class="budget-range">{{ budget.range }}</span>
              </div>
              <p class="budget-desc">{{ budget.description }}</p>
              <div class="budget-strategy">
                <!-- <el-icon><Strategy /></el-icon> -->
                <span>{{ budget.aiStrategy }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. 饮食限制 -->
      <div class="profile-section dietary-section important-section">
        <div class="section-header">
          <div class="section-icon warning">
            <el-icon><Coffee /></el-icon>
          </div>
          <div class="section-info">
            <h3 class="section-title">🍽️ 饮食限制</h3>
            <p class="section-desc">
              选择您的饮食禁忌，所有餐厅推荐都会严格遵守这些限制
            </p>
          </div>
        </div>
        
        <div class="dietary-content">
          <div class="dietary-grid">
            <div
              v-for="restriction in dietaryRestrictionOptions"
              :key="restriction.value"
              class="dietary-item"
              :class="{ selected: profileData.dietaryRestrictions.includes(restriction.value) }"
              @click="toggleDietaryRestriction(restriction.value)"
            >
              <span class="dietary-icon">{{ restriction.icon }}</span>
              <span class="dietary-name">{{ restriction.name }}</span>
              <el-icon v-if="profileData.dietaryRestrictions.includes(restriction.value)" class="check-icon">
                <Check />
              </el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. 出行方式偏好 -->
      <div class="profile-section transport-section">
        <div class="section-header">
          <div class="section-icon">
            <el-icon><MapLocation /></el-icon>
          </div>
          <div class="section-info">
            <h3 class="section-title">🚗 出行方式偏好</h3>
            <p class="section-desc">
              选择您喜欢的交通方式，影响路线规划和景点安排
            </p>
          </div>
        </div>
        
        <div class="transport-content">
          <div class="transport-grid">
            <div
              v-for="transport in transportPreferenceOptions"
              :key="transport.value"
              class="transport-card"
              :class="{ selected: profileData.transportPreferences.includes(transport.value) }"
              @click="toggleTransport(transport.value)"
            >
              <div class="transport-header">
                <span class="transport-icon">{{ transport.icon }}</span>
                <span class="transport-name">{{ transport.name }}</span>
              </div>
              <p class="transport-desc">{{ transport.description }}</p>
              <div class="transport-impact">
                <el-icon><InfoFilled /></el-icon>
                <span>{{ transport.aiImpact }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI理解预览 -->
    <div v-if="hasValidProfile" class="ai-understanding-preview">
      <div class="preview-header">
        <!-- <el-icon><Robot /></el-icon> -->
        <h4>🤖 AI将如何理解您的档案</h4>
      </div>
      <div class="understanding-content">
        <div class="understanding-text">
          {{ generateAIUnderstanding() }}
        </div>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="save-section">
      <el-button
        type="primary"
        size="large"
        :loading="saving"
        class="save-button"
        @click="saveProfile"
      >
        <el-icon><Check /></el-icon>
        保存个人档案
      </el-button>
      <p class="save-tip">
        保存后，您的所有行程规划都会基于这些信息进行个性化推荐
      </p>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  UserFilled, User, Collection, Money, Coffee, MapLocation, 
  Star, Lightning, Check, MagicStick, InfoFilled,  Warning 
} from '@element-plus/icons-vue';
import { useUserStore } from '@/store/user.js';
import { PERSONAL_PROFILE_OPTIONS } from '@/utils/data/travelDataSystem.js';
import { PersonalProfileInterpreter } from '@/utils/data/aiPromptEngine.js';

export default {
  name: 'PersonalProfile',
  components: {
    UserFilled, User, Collection, Money, Coffee, MapLocation,
    Star, Lightning, Check, MagicStick, InfoFilled,
 Warning
  },
  props: {
    embedded: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const userStore = useUserStore();
    const saving = ref(false);

    // 个人档案数据
    const profileData = reactive({
      mbtiType: '',
      coreInterests: [],
      budgetLevel: 'moderate',
      dietaryRestrictions: [],
      transportPreferences: []
    });

    // MBTI分组选项
    const mbtiGroups = [
      {
        label: '分析家 (NT)',
        options: [
          { label: 'INTJ - 建筑师', value: 'INTJ' },
          { label: 'INTP - 逻辑学家', value: 'INTP' },
          { label: 'ENTJ - 指挥官', value: 'ENTJ' },
          { label: 'ENTP - 辩论家', value: 'ENTP' }
        ]
      },
      {
        label: '外交家 (NF)', 
        options: [
          { label: 'INFJ - 提倡者', value: 'INFJ' },
          { label: 'INFP - 调停者', value: 'INFP' },
          { label: 'ENFJ - 主人公', value: 'ENFJ' },
          { label: 'ENFP - 活动家', value: 'ENFP' }
        ]
      },
      {
        label: '守护者 (SJ)',
        options: [
          { label: 'ISTJ - 物流师', value: 'ISTJ' },
          { label: 'ISFJ - 守护者', value: 'ISFJ' },
          { label: 'ESTJ - 总经理', value: 'ESTJ' },
          { label: 'ESFJ - 执政官', value: 'ESFJ' }
        ]
      },
      {
        label: '探险家 (SP)',
        options: [
          { label: 'ISTP - 鉴赏家', value: 'ISTP' },
          { label: 'ISFP - 探险家', value: 'ISFP' },
          { label: 'ESTP - 企业家', value: 'ESTP' },
          { label: 'ESFP - 娱乐家', value: 'ESFP' }
        ]
      }
    ];

    // 选项数据（从新的数据系统获取）
    const coreInterestOptions = computed(() => 
      Object.entries(PERSONAL_PROFILE_OPTIONS.coreInterests.options).map(([key, value]) => ({
        value: key,
        ...value
      }))
    );

    const budgetLevelOptions = computed(() =>
      Object.entries(PERSONAL_PROFILE_OPTIONS.budgetLevel.options).map(([key, value]) => ({
        value: key,
        ...value
      }))
    );

    const dietaryRestrictionOptions = computed(() =>
      Object.entries(PERSONAL_PROFILE_OPTIONS.dietaryRestrictions.options).map(([key, value]) => ({
        value: key,
        ...value
      }))
    );

    const transportPreferenceOptions = computed(() =>
      Object.entries(PERSONAL_PROFILE_OPTIONS.transportPreferences.options).map(([key, value]) => ({
        value: key,
        ...value
      }))
    );

    // 档案完整性检查
    const hasValidProfile = computed(() => {
      return profileData.mbtiType || 
             profileData.coreInterests.length > 0 || 
             profileData.dietaryRestrictions.length > 0 ||
             profileData.transportPreferences.length > 0;
    });

    // 选择切换函数
    const toggleInterest = (interest) => {
      const index = profileData.coreInterests.indexOf(interest);
      if (index > -1) {
        profileData.coreInterests.splice(index, 1);
      } else if (profileData.coreInterests.length < 5) {
        profileData.coreInterests.push(interest);
      }
    };

    const toggleDietaryRestriction = (restriction) => {
      const index = profileData.dietaryRestrictions.indexOf(restriction);
      if (index > -1) {
        profileData.dietaryRestrictions.splice(index, 1);
      } else {
        profileData.dietaryRestrictions.push(restriction);
      }
    };

    const toggleTransport = (transport) => {
      const index = profileData.transportPreferences.indexOf(transport);
      if (index > -1) {
        profileData.transportPreferences.splice(index, 1);
      } else {
        profileData.transportPreferences.push(transport);
      }
    };

    // MBTI相关函数
    const onMbtiChange = (value) => {
      console.log('MBTI类型变更:', value);
    };

    // 图片错误处理
    const handleImageError = (event) => {
      console.warn('MBTI图片加载失败:', event.target.src);
      // 可以设置一个默认图片或隐藏图片
      event.target.style.display = 'none';
    };

    const getMbtiDisplayName = (type) => {
      if (!type) return '';
      const allOptions = mbtiGroups.flatMap(group => group.options);
      const option = allOptions.find(opt => opt.value === type);
      return option ? option.label : type;
    };

    const getMbtiTravelStyle = (type) => {
      const option = PERSONAL_PROFILE_OPTIONS.mbtiTypes.options[type];
      return option ? option.travelStyle : '';
    };

    // 生成AI理解说明
    const generateAIUnderstanding = () => {
      const interpreter = new PersonalProfileInterpreter(profileData);
      const profile = interpreter.generateCompleteProfile();
      
      // 简化显示，提取关键信息
      const lines = profile.split('\n\n').slice(0, 3); // 取前3段
      return lines.join(' ');
    };

    // 保存档案
    const saveProfile = async () => {
      if (saving.value) return;

      try {
        saving.value = true;

        // 调用用户存储保存个人档案
        await userStore.updateUserPreferences({
          ...profileData,
          profileCompleted: true,
          lastUpdated: new Date().toISOString()
        });

        ElMessage.success('个人旅行档案已保存！');
        
        // 可以添加跳转逻辑
        
      } catch (error) {
        console.error('保存档案失败:', error);
        ElMessage.error('保存失败：' + (error.message || '请重试'));
      } finally {
        saving.value = false;
      }
    };

    // 加载现有档案
    const loadProfile = async () => {
      try {
        await userStore.fetchUserPreferences();
        const userPrefs = userStore.currentUser?.preferences;
        
        if (userPrefs) {
          const parsed = typeof userPrefs === 'string' ? JSON.parse(userPrefs) : userPrefs;
          
          Object.assign(profileData, {
            mbtiType: parsed.mbtiType || '',
            coreInterests: parsed.coreInterests || [],
            budgetLevel: parsed.budgetLevel || 'moderate',
            dietaryRestrictions: parsed.dietaryRestrictions || [],
            transportPreferences: parsed.transportPreferences || []
          });
        }
      } catch (error) {
        console.warn('加载档案失败:', error);
      }
    };

    onMounted(() => {
      loadProfile();
    });

    return {
      profileData,
      saving,
      mbtiGroups,
      coreInterestOptions,
      budgetLevelOptions,
      dietaryRestrictionOptions,
      transportPreferenceOptions,
      hasValidProfile,
      toggleInterest,
      toggleDietaryRestriction,
      toggleTransport,
      onMbtiChange,
      handleImageError,
      getMbtiDisplayName,
      getMbtiTravelStyle,
      generateAIUnderstanding,
      saveProfile
    };
  }
};
</script>

<style scoped>
.personal-profile-page {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--page-padding);
  background: var(--page-bg);
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 40%, var(--secondary-color) 100%);
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 16px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%);
  pointer-events: none;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}

.header-icon {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.header-icon:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.25);
}

.page-title {
  font-size: 12px;
  font-weight: 700;
  margin: 0 0 4px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  line-height: 1.3;
}

.page-subtitle {
  font-size: 12px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
  font-weight: 400;
}

.benefits-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  position: relative;
  z-index: 1;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.benefit-item:hover {
  background: rgba(255, 255, 255, 0.22);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.benefit-icon {
  font-size: 12px;
  color: #fff3cd;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  flex-shrink: 0;
}

.benefit-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.benefit-title {
  font-weight: 600;
  font-size: 14px;
}

.benefit-desc {
  font-size: 10px;
  opacity: 0.85;
  line-height: 1.4;
}

/* 档案内容区域 */
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.profile-section {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 32px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.profile-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.profile-section:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
  border-color: var(--primary-light-8, rgba(145, 168, 208, 0.2));
}

.profile-section:hover::before {
  opacity: 1;
}

.profile-section.important-section {
  border-left: 4px solid var(--error-color);
  background: linear-gradient(135deg, rgba(229, 57, 53, 0.02) 0%, var(--card-bg) 100%);
}

/* 区块头部 */
.section-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.section-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  box-shadow: 0 4px 16px rgba(145, 168, 208, 0.2);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.section-icon:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(145, 168, 208, 0.35);
}

.section-icon.warning {
  background: linear-gradient(135deg, var(--error-color) 0%, #ff6b6b 100%);
  box-shadow: 0 6px 20px rgba(229, 57, 53, 0.25);
}

.section-icon.warning:hover {
  box-shadow: 0 8px 25px rgba(229, 57, 53, 0.35);
}

.section-info {
  flex: 1;
}

.section-title {
  margin: 0 0 8px;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.3;
}

.section-desc {
  margin: 0;
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.optional-tag {
  background: var(--primary-light-9, rgba(145, 168, 208, 0.1));
  color: var(--primary-color);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 12px;
  border: 1px solid var(--primary-light-8, rgba(145, 168, 208, 0.2));
}
.personality-content{
  background: #ffffff;
}
/* MBTI选择器 */
.mbti-selector {
  width: 100%;
  margin-bottom: 24px;
}

.mbti-impact-preview {
  background: #ffffff;
}

.impact-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  font-weight: 600;
  color: var(--primary-color);
  font-size: 14px;
}

.mbti-personality-display {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mbti-image-container {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  /* background: #ffffff; */
  /* border: 2px solid var(--primary-light-7, rgba(145, 168, 208, 0.3)); */
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); */
}

.mbti-personality-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.mbti-personality-image:hover {
  transform: scale(1.05);
}

.mbti-info {
  flex: 1;
}

.mbti-info h4 {
  margin: 0 0 8px;
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 600;
}

.mbti-info p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* 兴趣网格 */
.interests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.interest-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: var(--card-bg);
}

.interest-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 6px 20px rgba(145, 168, 208, 0.15);
  transform: translateY(-3px);
}

.interest-card.selected {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, var(--primary-light-9, rgba(145, 168, 208, 0.1)) 0%, var(--card-bg) 100%);
  box-shadow: 0 4px 16px rgba(145, 168, 208, 0.2);
}

.interest-card.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  filter: grayscale(0.3);
}

.interest-icon {
  font-size: 12px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 2px solid var(--border-light);
  flex-shrink: 0;
}

.interest-card:hover .interest-icon {
  background: var(--primary-light-9, rgba(145, 168, 208, 0.1));
  border-color: var(--primary-light-8, rgba(145, 168, 208, 0.2));
  transform: scale(1.05);
}

.interest-card.selected .interest-icon {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.interest-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.interest-name {
  font-weight: 600;
  font-size: 12px;
  color: var(--text-primary);
  line-height: 1.3;
}

.interest-desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.4;
}

.selected-mark {
  color: var(--success-color);
  font-size: 14px;
  filter: drop-shadow(0 2px 4px rgba(124, 179, 66, 0.3));
}

.selection-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid var(--border-light);
}

.selection-count {
  font-weight: 600;
  color: var(--text-primary);
}

.ai-impact-tip {
  color: var(--primary-color);
  font-style: italic;
  font-weight: 500;
}

/* 预算卡片 */
.budget-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.budget-card {
  padding: 24px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  background: var(--card-bg);
  position: relative;
  overflow: hidden;
}

.budget-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.budget-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 6px 20px rgba(145, 168, 208, 0.15);
  transform: translateY(-4px);
}

.budget-card:hover::before {
  opacity: 1;
}

.budget-card.selected {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, var(--primary-light-9, rgba(145, 168, 208, 0.1)) 0%, var(--card-bg) 100%);
  box-shadow: 0 4px 16px rgba(145, 168, 208, 0.2);
}

.budget-card.selected::before {
  opacity: 1;
}

.budget-header {
  margin-bottom: 14px;
}

.budget-name {
  display: block;
  font-weight: 600;
  font-size: 12px;
  color: var(--text-primary);
  margin-bottom: 6px;
  line-height: 1.3;
}

.budget-range {
  font-size: 12px;
  color: var(--primary-color);
  font-weight: 600;
}

.budget-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.budget-strategy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
  font-style: italic;
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 10px;
  margin-top: 4px;
}

/* 饮食限制网格 */
.dietary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.dietary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--card-bg);
}

.dietary-item:hover {
  border-color: var(--error-color);
  box-shadow: 0 4px 16px rgba(229, 57, 53, 0.15);
  transform: translateY(-2px);
}

.dietary-item.selected {
  border-color: var(--error-color);
  background: linear-gradient(135deg, rgba(229, 57, 53, 0.05) 0%, var(--card-bg) 100%);
  box-shadow: 0 4px 12px rgba(229, 57, 53, 0.2);
}

.dietary-icon {
  font-size: 12px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 10px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.dietary-item:hover .dietary-icon {
  background: rgba(229, 57, 53, 0.1);
}

.dietary-item.selected .dietary-icon {
  background: var(--error-color);
  color: white;
}

.dietary-name {
  flex: 1;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.3;
}

.check-icon {
  color: var(--success-color);
  font-size: 12px;
  filter: drop-shadow(0 2px 4px rgba(124, 179, 66, 0.3));
  flex-shrink: 0;
}

/* 交通方式网格 */
.transport-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.transport-card {
  padding: 24px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--card-bg);
  position: relative;
  overflow: hidden;
}

.transport-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.transport-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 6px 20px rgba(145, 168, 208, 0.15);
  transform: translateY(-4px);
}

.transport-card:hover::before {
  opacity: 1;
}

.transport-card.selected {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, var(--primary-light-9, rgba(145, 168, 208, 0.1)) 0%, var(--card-bg) 100%);
  box-shadow: 0 4px 16px rgba(145, 168, 208, 0.2);
}

.transport-card.selected::before {
  opacity: 1;
}

.transport-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.transport-icon {
  font-size: 24px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 2px solid var(--border-light);
  flex-shrink: 0;
}

.transport-card:hover .transport-icon {
  background: var(--primary-light-9, rgba(145, 168, 208, 0.1));
  border-color: var(--primary-light-8, rgba(145, 168, 208, 0.2));
  transform: scale(1.05);
}

.transport-card.selected .transport-icon {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.transport-name {
  font-weight: 600;
  font-size: 12px;
  color: var(--text-primary);
  line-height: 1.3;
}

.transport-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.transport-impact {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
  font-style: italic;
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 10px;
  border: 1px solid var(--border-light);
}

/* AI理解预览 */
.ai-understanding-preview {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 40%, var(--secondary-color) 100%);
  border-radius: 20px;
  padding: 32px;
  margin: 32px 0;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ai-understanding-preview::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%);
  pointer-events: none;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.preview-header h4 {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.understanding-content {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 20px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.understanding-text {
  font-size: 15px;
  line-height: 1.6;
  opacity: 0.95;
  font-weight: 400;
}

/* 保存区域 */
.save-section {
  text-align: center;
  padding: 40px 0;
  position: relative;
}

.save-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: 2px;
}

.save-button {
  padding: 8px 24px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  min-width: 120px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(145, 168, 208, 0.25);
  transition: all 0.3s ease;
}

.save-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(145, 168, 208, 0.35);
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
}

.save-button:active {
  transform: translateY(0);
}

.save-tip {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
  font-style: italic;
  max-width: 320px;
  margin: 0 auto;
  line-height: 1.5;
}

/* 中等屏幕响应式设计 */
@media (max-width: 768px) and (min-width: 481px) {
  .benefits-showcase {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
  }
}

/* 小屏幕响应式设计 */
@media (max-width: 480px) {
  .personal-profile-page {
    padding: 16px;
  }

  .page-header {
    padding: 24px 20px;
    margin-bottom: 24px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
    margin-bottom: 20px;
  }

  .header-icon {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }

  .page-title {
    font-size: 16px;
  }

  .page-subtitle {
    font-size: 11px;
  }

  .benefits-showcase {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .benefit-item {
    padding: 16px;
    gap: 12px;
  }

  .mbti-personality-display {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .mbti-image-container {
    width: 60px;
    height: 60px;
  }

  .mbti-info h4 {
    font-size: 14px;
  }

  .mbti-info p {
    font-size: 12px;
  }

  .profile-content {
    gap: 24px;
  }

  .profile-section {
    padding: 24px 16px;
    border-radius: 8px;
  }

  .section-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
    margin-bottom: 20px;
  }

  .section-icon {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .section-title {
    font-size: 12px;
  }

  .interests-grid,
  .budget-cards,
  .transport-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .dietary-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 10px;
  }

  .ai-understanding-preview {
    padding: 24px 16px;
    margin: 24px 0;
  }

  .save-section {
    padding: 32px 0;
  }

  .save-button {
    padding: 8px 16px;
    font-size: 12px;
    min-width: 100px;
  }
}

/* 嵌入模式样式 */
.personal-profile-page.embedded-mode {
  background: transparent;
  padding: 0;
  min-height: auto;
}

.personal-profile-page.embedded-mode .page-header {
  margin-bottom: 32px;
  padding: 36px;
  border-radius: 20px;
}

.personal-profile-page.embedded-mode .profile-content {
  gap: 32px;
}

.personal-profile-page.embedded-mode .profile-section {
  margin-bottom: 0;
  padding: 32px;
  border-radius: 20px;
}

.personal-profile-page.embedded-mode .ai-understanding-preview {
  margin: 32px 0;
  padding: 32px;
  border-radius: 20px;
}

.personal-profile-page.embedded-mode .save-section {
  padding: 40px 0;
}

@media (max-width: 768px) {
  .personal-profile-page.embedded-mode {
    padding: 0;
  }
  
  .personal-profile-page.embedded-mode .page-header {
    padding: 28px 20px;
    margin-bottom: 24px;
    border-radius: 8px;
  }
  
  .personal-profile-page.embedded-mode .profile-section {
    padding: 24px 20px;
    border-radius: 8px;
  }

  .personal-profile-page.embedded-mode .ai-understanding-preview {
    padding: 24px 20px;
    margin: 24px 0;
    border-radius: 8px;
  }

  .personal-profile-page.embedded-mode .save-section {
    padding: 32px 0;
  }
}
</style>
