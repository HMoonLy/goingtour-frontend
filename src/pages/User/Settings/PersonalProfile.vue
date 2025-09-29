<!--
个人旅行偏好设置页面
简洁但保留完整的指导性信息
-->

<template>
  <div class="personal-page simple" :class="{ embedded: embedded }">
    <!-- 页面头部 - 保留关键说明 -->
    <div class="page-intro" v-if="!embedded">
      <h2 class="title">旅行偏好设置</h2>
      <div class="intro-content">
        <p class="intro-text">完善您的旅行偏好，我们将为您提供更精准的个性化推荐</p>
        <div class="intro-benefits">
          <div class="benefit-item">
            <el-icon><Star /></el-icon>
            <span>个性化景点推荐</span>
          </div>
          <div class="benefit-item">
            <el-icon><Lightning /></el-icon>
            <span>智能行程规划</span>
          </div>
          <div class="benefit-item">
            <el-icon><Check /></el-icon>
            <span>避免重复设置</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 1. 性格特征 -->
    <el-card class="section" shadow="never">
      <template #header>
        <div class="section-header">
          <el-icon><User /></el-icon>
          <div>
            <div class="section-title">性格特征</div>
            <div class="section-desc">帮助AI理解您的旅行风格和节奏偏好</div>
          </div>
        </div>
      </template>
      
      <div class="form-item">
        <div class="item-label">
          <span>MBTI人格类型</span>
          <span class="optional-tag">可选</span>
        </div>
        <div class="item-help">选择您的MBTI类型，我们会据此推荐符合您性格的旅行方式</div>
        
        <el-select
          v-model="profileData.mbtiType"
          placeholder="选择您的MBTI类型"
          size="large"
          clearable
          style="width: 100%"
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
        <div v-if="profileData.mbtiType" class="mbti-preview">
          <div class="mbti-content">
            <div class="mbti-image-section">
              <img 
                :src="`/images/mbti/${profileData.mbtiType}.png`" 
                :alt="getMbtiDisplayName(profileData.mbtiType)"
                class="mbti-character-image"
                @error="handleImageError"
              />
            </div>
            <div class="mbti-info-section">
              <div class="preview-header">
                <el-icon><InfoFilled /></el-icon>
                <span>基于您的 {{ getMbtiDisplayName(profileData.mbtiType) }} 特质</span>
              </div>
              <p class="preview-desc">{{ getMbtiTravelStyle(profileData.mbtiType) }}</p>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 2. 核心兴趣爱好 -->
    <el-card class="section" shadow="never">
      <template #header>
        <div class="section-header">
          <el-icon><Collection /></el-icon>
          <div>
            <div class="section-title">核心兴趣爱好</div>
            <div class="section-desc">影响景点推荐、活动安排和路线规划</div>
          </div>
        </div>
      </template>
      
      <div class="form-item">
        <div class="item-label">
          <span>选择您最感兴趣的领域</span>
          <span class="limit-tag">最多5个</span>
        </div>
        <div class="item-help">
          这些兴趣将直接影响我们为您推荐的景点类型。例如：选择"历史文化"会优先推荐博物馆、古迹等
        </div>
        
        <div class="interests-grid">
          <div
            v-for="interest in coreInterestOptions"
            :key="interest.value"
            class="interest-item"
            :class="{
              selected: profileData.coreInterests.includes(interest.value),
              disabled: !profileData.coreInterests.includes(interest.value) && profileData.coreInterests.length >= 5
            }"
            @click="toggleInterest(interest.value)"
          >
            <span class="interest-icon">{{ interest.icon }}</span>
            <div class="interest-info">
              <span class="interest-name">{{ interest.name }}</span>
              <span class="interest-desc">{{ interest.description }}</span>
            </div>
            <el-icon v-if="profileData.coreInterests.includes(interest.value)" class="check-icon">
              <Check />
            </el-icon>
          </div>
        </div>
        
        <div class="selection-status">
          <span class="count">已选择 {{ profileData.coreInterests.length }}/5 个兴趣</span>
          <span v-if="profileData.coreInterests.length < 3" class="hint">建议至少选择3个以获得更好的推荐效果</span>
        </div>
      </div>
    </el-card>

    <!-- 3. 预算水平 -->
    <el-card class="section" shadow="never">
      <template #header>
        <div class="section-header">
          <el-icon><Money /></el-icon>
          <div>
            <div class="section-title">旅行预算水平</div>
            <div class="section-desc">影响住宿、餐厅、景点和交通方式的推荐</div>
          </div>
        </div>
      </template>
      
      <div class="form-item">
        <div class="item-label">选择您通常的旅行预算范围</div>
        <div class="item-help">
          我们会根据您的预算推荐合适价位的酒店、餐厅和活动。您可以在制定具体行程时再次调整
        </div>
        
        <div class="budget-options">
          <div
            v-for="budget in budgetLevelOptions"
            :key="budget.value"
            class="budget-option"
            :class="{ 
              selected: profileData.budgetLevel === budget.value,
              recommended: budget.value === 'moderate'
            }"
            @click="profileData.budgetLevel = budget.value"
          >
            <div class="budget-header">
              <span class="budget-name">{{ budget.name }}</span>
              <span v-if="budget.value === 'moderate'" class="recommend-tag">推荐</span>
            </div>
            <div class="budget-range">{{ budget.range }}</div>
            <div class="budget-desc">{{ budget.description }}</div>
            <div class="budget-examples">
              <small>例如：{{ budget.examples }}</small>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 4. 饮食限制 -->
    <el-card class="section" shadow="never">
      <template #header>
        <div class="section-header">
          <el-icon><Coffee /></el-icon>
          <div>
            <div class="section-title">饮食限制</div>
            <div class="section-desc">确保推荐的餐厅符合您的饮食要求</div>
          </div>
        </div>
      </template>
      
      <div class="form-item">
        <div class="item-label">选择您的饮食禁忌或偏好</div>
        <div class="item-help">
          <el-icon><Warning /></el-icon>
          <span>我们会严格过滤不符合您要求的餐厅，确保饮食安全</span>
        </div>
        
        <div class="dietary-grid">
          <div
            v-for="restriction in dietaryRestrictionOptions"
            :key="restriction.value"
            class="dietary-item"
            :class="{ selected: profileData.dietaryRestrictions.includes(restriction.value) }"
            @click="toggleDietaryRestriction(restriction.value)"
          >
            <span class="dietary-icon">{{ restriction.icon }}</span>
            <div class="dietary-info">
              <span class="dietary-name">{{ restriction.name }}</span>
              <span class="dietary-note">{{ restriction.note }}</span>
            </div>
            <el-icon v-if="profileData.dietaryRestrictions.includes(restriction.value)" class="check-icon">
              <Check />
            </el-icon>
          </div>
        </div>
        
        <div v-if="profileData.dietaryRestrictions.length === 0" class="no-restriction-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>如无特殊饮食要求，可跳过此项</span>
        </div>
      </div>
    </el-card>

    <!-- 5. 出行方式偏好 -->
    <el-card class="section" shadow="never">
      <template #header>
        <div class="section-header">
          <el-icon><MapLocation /></el-icon>
          <div>
            <div class="section-title">出行方式偏好</div>
            <div class="section-desc">影响行程安排和路线规划的交通建议</div>
          </div>
        </div>
      </template>
      
      <div class="form-item">
        <div class="item-label">选择您偏好的交通方式</div>
        <div class="item-help">
          我们会优先推荐您喜欢的交通方式，并在行程中合理安排换乘和路线
        </div>
        
        <!-- 紧凑标签式 -->
        <div class="transport-compact-wrapper">
          <div class="compact-grid">
            <div 
              v-for="transport in transportPreferenceOptions"
              :key="transport.value"
              class="compact-item"
              :class="{ selected: profileData.transportPreferences.includes(transport.value) }"
              @click="toggleTransport(transport.value)"
            >
              <span class="compact-icon">{{ transport.icon }}</span>
              <span class="compact-name">{{ transport.name }}</span>
            </div>
          </div>
          
          <!-- 紧凑模式的详情展示 -->
          <div v-if="selectedTransportDetails.length > 0" class="compact-details">
            <div class="compact-details-title">已选择：</div>
            <div class="compact-details-content">
              <div 
                v-for="item in selectedTransportDetails" 
                :key="item.value"
                class="compact-detail-item"
              >
                <strong>{{ item.icon }} {{ item.name }}</strong>：{{ item.benefit }}
              </div>
            </div>
          </div>
        </div>

      </div>
    </el-card>

    <!-- 设置完成提示 -->
    <div class="completion-guide">
      <div class="guide-content">
        <el-icon><CircleCheckFilled /></el-icon>
        <div class="guide-text">
          <div class="guide-title">设置完成后的效果</div>
          <ul class="guide-list">
            <li>创建行程时自动预填您的偏好</li>
            <li>景点推荐更加精准匹配</li>
            <li>餐厅筛选严格遵守饮食限制</li>
            <li>交通建议符合您的出行习惯</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="save-section">
      <el-button
        type="primary"
        size="large"
        :loading="saving"
        @click="saveProfile"
      >
        <el-icon><Check /></el-icon>
        保存偏好设置
      </el-button>
      <div class="save-tip">设置保存后，您随时可以回来修改</div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  UserFilled, User, Collection, Money, Coffee, MapLocation, 
  Star, Lightning, Check, MagicStick, InfoFilled, Warning,
  CircleCheckFilled
} from '@element-plus/icons-vue';
import { useUserStore } from '@/store/user.js';
import { useProfile } from '@/composables/user/useProfile.js';
import { PERSONAL_PROFILE_OPTIONS } from '@/utils/data/travelDataSystem.js';
import { PersonalProfileInterpreter } from '@/utils/data/aiPromptEngine.js';

export default {
  name: 'PersonalProfile',
  components: {
    UserFilled, User, Collection, Money, Coffee, MapLocation,
    Star, Lightning, Check, MagicStick, InfoFilled, Warning,
    CircleCheckFilled
  },
  props: {
    embedded: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const userStore = useUserStore();
    const { fetchUserPreferences, updateUserPreferences } = useProfile();
    const saving = ref(false);

    // 个人档案数据
    const profileData = reactive({
      mbtiType: '',
      coreInterests: [],
      budgetLevel: 'moderate',
      dietaryRestrictions: [],
      transportPreferences: []
    });



    // MBTI分组选项 - 从系统数据生成
    const mbtiGroups = (() => {
      const mbtiOptions = PERSONAL_PROFILE_OPTIONS.mbtiTypes.options;
      return [
        {
          label: '分析家 (NT)',
          options: [
            { label: `INTJ - ${mbtiOptions.INTJ.name}`, value: 'INTJ' },
            { label: `INTP - ${mbtiOptions.INTP.name}`, value: 'INTP' },
            { label: `ENTJ - ${mbtiOptions.ENTJ.name}`, value: 'ENTJ' },
            { label: `ENTP - ${mbtiOptions.ENTP.name}`, value: 'ENTP' }
          ]
        },
        {
          label: '外交家 (NF)', 
          options: [
            { label: `INFJ - ${mbtiOptions.INFJ.name}`, value: 'INFJ' },
            { label: `INFP - ${mbtiOptions.INFP.name}`, value: 'INFP' },
            { label: `ENFJ - ${mbtiOptions.ENFJ.name}`, value: 'ENFJ' },
            { label: `ENFP - ${mbtiOptions.ENFP.name}`, value: 'ENFP' }
          ]
        },
        {
          label: '守护者 (SJ)',
          options: [
            { label: `ISTJ - ${mbtiOptions.ISTJ.name}`, value: 'ISTJ' },
            { label: `ISFJ - ${mbtiOptions.ISFJ.name}`, value: 'ISFJ' },
            { label: `ESTJ - ${mbtiOptions.ESTJ.name}`, value: 'ESTJ' },
            { label: `ESFJ - ${mbtiOptions.ESFJ.name}`, value: 'ESFJ' }
          ]
        },
        {
          label: '探索者 (SP)',
          options: [
            { label: `ISTP - ${mbtiOptions.ISTP.name}`, value: 'ISTP' },
            { label: `ISFP - ${mbtiOptions.ISFP.name}`, value: 'ISFP' },
            { label: `ESTP - ${mbtiOptions.ESTP.name}`, value: 'ESTP' },
            { label: `ESFP - ${mbtiOptions.ESFP.name}`, value: 'ESFP' }
          ]
        }
      ];
    })();

    // 选项数据（从新的数据系统获取）
    const coreInterestOptions = computed(() => 
      Object.entries(PERSONAL_PROFILE_OPTIONS.coreInterests.options).map(([key, value]) => ({
        value: key,
        ...value
      }))
    );

    const budgetLevelOptions = computed(() => {
      const baseOptions = Object.entries(PERSONAL_PROFILE_OPTIONS.budgetLevel.options).map(([key, value]) => ({
        value: key,
        ...value
      }));
      
      // 扩展预算选项，添加更详细的说明
      return baseOptions.map(option => ({
        ...option,
        examples: getBudgetExamples(option.value)
      }));
    });

    const dietaryRestrictionOptions = computed(() => {
      const baseOptions = Object.entries(PERSONAL_PROFILE_OPTIONS.dietaryRestrictions.options).map(([key, value]) => ({
        value: key,
        ...value
      }));
      
      // 扩展饮食限制选项，添加注释说明
      return baseOptions.map(option => ({
        ...option,
        note: getDietaryNote(option.value)
      }));
    });

    const transportPreferenceOptions = computed(() => {
      return Object.entries(PERSONAL_PROFILE_OPTIONS.transportPreferences.options).map(([key, value]) => ({
        value: key,
        ...value
      }));
    });

    // 获取预算示例
    const getBudgetExamples = (budgetType) => {
      const examples = {
        budget: '青旅、快餐、公共交通、免费景点',
        moderate: '三星酒店、特色餐厅、地铁+出租车',
        comfort: '四星酒店、精品餐厅、专车接送',
        luxury: '五星酒店、米其林餐厅、私人定制'
      };
      return examples[budgetType] || '';
    };

    // 获取饮食限制注释
    const getDietaryNote = (restrictionType) => {
      const notes = {
        vegetarian: '不食用肉类',
        vegan: '不食用任何动物制品',
        halal: '符合伊斯兰教规',
        no_spicy: '避免辛辣食物',
        lactose_free: '避免乳制品',
        gluten_free: '避免含麸质食物',
        no_beef:'🚫',
        no_pork:'🚫',
        no_seafood:'🚫',
        dairy_free:'🚫'
      };
      return notes[restrictionType] || '';
    };



    // 选中的交通方式详情
    const selectedTransportDetails = computed(() => {
      return transportPreferenceOptions.value.filter(transport => 
        profileData.transportPreferences.includes(transport.value)
      );
    });

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

    const getMbtiDisplayName = (type) => {
      if (!type) return '';
      const mbtiOptions = PERSONAL_PROFILE_OPTIONS.mbtiTypes.options;
      const option = mbtiOptions[type];
      return option ? `${type} - ${option.name}` : type;
    };

    const getMbtiTravelStyle = (type) => {
      if (!type) return '';
      const mbtiOptions = PERSONAL_PROFILE_OPTIONS.mbtiTypes.options;
      const option = mbtiOptions[type];
      return option ? option.travelStyle : '';
    };

    // 图片错误处理
    const handleImageError = (event) => {
      console.warn('MBTI图片加载失败:', event.target.src);
      // 设置一个默认的占位符样式
      event.target.style.display = 'none';
      const imageSection = event.target.parentElement;
      if (imageSection && imageSection.classList.contains('mbti-image-section')) {
        imageSection.style.display = 'flex';
        imageSection.style.alignItems = 'center';
        imageSection.style.justifyContent = 'center';
        imageSection.style.fontSize = '24px';
        imageSection.style.color = '#1976d2';
        imageSection.innerHTML = '🧠';
      }
    };

    // 保存档案
    const saveProfile = async () => {
      if (saving.value) return;

      try {
        saving.value = true;

        // 调用用户存储保存个人档案
        await updateUserPreferences({
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
        await fetchUserPreferences();
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
      selectedTransportDetails,
      hasValidProfile,
      toggleInterest,
      toggleDietaryRestriction,
      toggleTransport,
      onMbtiChange,
      getMbtiDisplayName,
      getMbtiTravelStyle,
      handleImageError,
      saveProfile
    };
  }
};
</script>

<style scoped>
/* 使用与其他设置页面相同的样式风格 */
.personal-page.simple {
  max-width: 960px;
  margin: 24px auto;
  padding: 0 16px;
}

.personal-page.simple.embedded {
  max-width: 100%;
  margin: 0;
  padding: 0;
}

/* 页面介绍区域 */
.page-intro {
  margin-bottom: 32px;
}

.title {
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.intro-content {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #91a8d0;
}

.intro-text {
  margin: 0 0 16px 0;
  color: #606266;
  font-size: 16px;
}

.intro-benefits {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #91a8d0;
  font-size: 14px;
  font-weight: 500;
}

.benefit-item .el-icon {
  font-size: 16px;
}

/* 卡片样式 */
.section {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.section :deep(.el-card__header) {
  background: linear-gradient(90deg, rgba(145, 168, 208, 0.12), rgba(247, 202, 201, 0.06));
  padding: 20px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.section-header .el-icon {
  font-size: 20px;
  color: #91a8d0;
  margin-top: 2px;
}

.section-title {
  font-weight: 600;
  color: #303133;
  font-size: 18px;
  margin-bottom: 4px;
}

.section-desc {
  color: #909399;
  font-size: 14px;
}

/* 表单项样式 */
.form-item {
  padding: 20px;
}

.item-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #303133;
}

.optional-tag, .limit-tag {
  background: #e1f3d8;
  color: #67c23a;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.limit-tag {
  background: #fdf6ec;
  color: #e6a23c;
}

.item-help {
  color: #909399;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.item-help .el-icon {
  color: #e6a23c;
  margin-top: 2px;
  flex-shrink: 0;
}

/* MBTI预览 */
.mbti-preview {
  margin-top: 20px;
  padding: 20px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.mbti-content {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.mbti-image-section {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  border: 1px solid #e0e0e0;
  transition: transform 0.3s ease;
}

.mbti-image-section:hover {
  transform: scale(1.02);
}

.mbti-character-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.mbti-character-image:hover {
  transform: scale(1.05);
}

.mbti-info-section {
  flex: 1;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-weight: 500;
  margin-bottom: 12px;
  font-size: 14px;
}

.preview-desc {
  margin: 0;
  color: #666;
  font-size: 13px;
  line-height: 1.5;
}

/* 兴趣选择 */
.interests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.interest-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.interest-item:hover {
  border-color: #91a8d0;
  background: #f5f7fa;
}

.interest-item.selected {
  border-color: #91a8d0;
  background: rgba(145, 168, 208, 0.1);
}

.interest-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.interest-icon {
  font-size: 20px;
  width: 32px;
  text-align: center;
}

.interest-info {
  flex: 1;
}

.interest-name {
  display: block;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.interest-desc {
  color: #909399;
  font-size: 13px;
}

.check-icon {
  color: #67c23a;
  font-size: 16px;
}

.selection-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px;
  font-size: 14px;
}

.count {
  color: #606266;
  font-weight: 500;
}

.hint {
  color: #e6a23c;
}

/* 预算选项 */
.budget-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.budget-option {
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.budget-option:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
}

.budget-option.selected {
  border-color: #91a8d0;
  background: rgba(145, 168, 208, 0.1);
}

.budget-option.recommended {
  border-color: #67c23a;
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.budget-name {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.recommend-tag {
  background: #67c23a;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.budget-range {
  color: #91a8d0;
  font-weight: 600;
  margin-bottom: 8px;
}

.budget-desc {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.budget-examples {
  color: #909399;
  font-size: 12px;
}

/* 饮食限制网格 */
.dietary-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  width: 100%;
}

.dietary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  box-sizing: border-box;
  flex: 0 0 calc((100% - 24px) / 3);
  min-width: 0;
  max-width: calc((100% - 24px) / 3);
}

.dietary-item:hover {
  border-color: #91a8d0;
  background: #f5f7fa;
}

.dietary-item.selected {
  border-color: #91a8d0;
  background: rgba(145, 168, 208, 0.1);
}

.dietary-icon {
  font-size: 20px;
  width: 24px;
  min-width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.dietary-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.dietary-name {
  display: block;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dietary-note {
  color: #909399;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-restriction-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f0f9ff;
  border-radius: 8px;
  color: #1976d2;
  font-size: 14px;
}

/* 交通方式选择器 */
.transport-selector-wrapper {
  margin-top: 12px;
}

.transport-option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.option-icon {
  font-size: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 50%;
  flex-shrink: 0;
}

.option-content {
  flex: 1;
}

.option-name {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  line-height: 1.2;
}

.option-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.3;
  margin-top: 2px;
}



/* 已选择项详情 */
.selected-transport-details {
  margin-top: 16px;
  padding: 16px;
  background: linear-gradient(145deg, #f8faff 0%, #f0f4ff 100%);
  border: 1px solid #e3f2fd;
  border-radius: 8px;
}

.details-title {
  font-size: 14px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 12px;
}

.selected-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e8f0fe;
  border-radius: 6px;
}

.item-icon {
  font-size: 18px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 50%;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
}



/* 优雅列表布局 */
.transport-elegant-list {
  margin-top: 12px;
}

.elegant-list-item {
  margin-bottom: 12px;
  padding: 20px;
  border: 2px solid #e8f0fe;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(145deg, #ffffff 0%, #f8faff 100%);
  position: relative;
}

.elegant-list-item:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 16px rgba(145, 168, 208, 0.12);
  transform: translateX(4px);
}

.elegant-list-item.selected {
  border-color: #1976d2;
  background: linear-gradient(145deg, #e3f2fd 0%, #bbdefb 20%, #ffffff 100%);
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.15);
}

.list-item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-item-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.list-icon-wrapper {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.list-icon {
  font-size: 24px;
}

.list-text {
  flex: 1;
}

.list-name {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 6px;
  line-height: 1.3;
}

.list-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 8px;
}

.list-benefit {
  font-size: 13px;
  color: #1976d2;
  font-style: italic;
}

.list-item-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.check-icon-large {
  font-size: 28px;
  color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 50%;
  padding: 8px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.select-hint {
  font-size: 12px;
  color: #909399;
  text-align: center;
  padding: 4px 8px;
  background: rgba(144, 147, 153, 0.1);
  border-radius: 4px;
}

/* 紧凑布局 */
.transport-compact-wrapper {
  margin-top: 12px;
}

.compact-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}

.compact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px solid #e8f0fe;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  position: relative;
  min-width: 140px;
}

.compact-item:hover {
  border-color: #91a8d0;
  box-shadow: 0 2px 8px rgba(145, 168, 208, 0.15);
}

.compact-item.selected {
  border-color: #1976d2;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1976d2;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.25);
  transform: translateY(-1px);
  position: relative;
}

.compact-item.selected::before {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  bottom: -2px;
  left: -2px;
  background: linear-gradient(45deg, #1976d2, #42a5f5);
  border-radius: inherit;
  z-index: -1;
  opacity: 0.6;
}

.compact-item.selected .compact-icon {
  text-shadow: 0 1px 3px rgba(25, 118, 210, 0.3);
  transform: scale(1.1);
}

.compact-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.compact-name {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.compact-check {
  font-size: 16px;
  color: #4caf50;
  margin-left: auto;
}

.compact-details {
  margin-top: 16px;
  padding: 16px;
  background: #f8faff;
  border: 1px solid #e3f2fd;
  border-radius: 8px;
}

.compact-details-title {
  font-size: 14px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 12px;
}

.compact-details-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.compact-detail-item {
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  line-height: 1.2;
}

.item-benefit {
  font-size: 12px;
  color: #1976d2;
  line-height: 1.3;
  margin-top: 2px;
}



/* 完成指南 */
.completion-guide {
  background: linear-gradient(135deg, #f0f9ff 0%, #e8f5e8 100%);
  border-radius: 12px;
  padding: 24px;
  margin: 32px 0;
  border: 1px solid #e1f5fe;
}

.guide-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.guide-content .el-icon {
  font-size: 24px;
  color: #67c23a;
  margin-top: 4px;
  flex-shrink: 0;
}

.guide-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  font-size: 16px;
}

.guide-list {
  margin: 0;
  padding-left: 16px;
  color: #606266;
}

.guide-list li {
  margin-bottom: 6px;
  line-height: 1.5;
}

/* 保存区域 */
.save-section {
  text-align: center;
  padding: 40px 0;
}

.save-section .el-button {
  padding: 12px 32px;
  font-size: 16px;
}

.save-tip {
  margin-top: 12px;
  color: #909399;
  font-size: 14px;
}

/* 响应式设计 */
/* 中等屏幕优化 */
@media (max-width: 1024px) {
  .selected-items {
    gap: 6px;
  }
}

/* 移动端样式 */
@media (max-width: 768px) {
  .personal-page.simple {
    padding: 0 12px;
  }
  
  .intro-benefits {
    flex-direction: column;
    gap: 12px;
  }
  
  .interests-grid,
  .budget-options,
  .dietary-grid {
    flex-direction: column;
  }
  
  .dietary-item {
    flex: none;
    width: 100%;
    min-width: auto;
    margin: 0 0 16px 0;
  }
  
  .selected-transport-details {
    padding: 12px;
  }
  
  .selected-item {
    padding: 6px 10px;
  }
  
  /* 交通方式布局响应式 */
  .layout-mode-selector {
    margin-bottom: 16px;
  }
  
  .mode-selector {
    transform: scale(0.9);
  }
  
  .transport-cards-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .transport-card {
    padding: 16px;
  }
  
  .card-icon {
    font-size: 28px;
    width: 42px;
    height: 42px;
  }
  
  .card-title {
    font-size: 16px;
  }
  
  .card-description {
    font-size: 13px;
  }
  
  .elegant-list-item {
    padding: 16px;
  }
  
  .list-item-left {
    gap: 12px;
  }
  
  .list-icon-wrapper {
    width: 42px;
    height: 42px;
  }
  
  .list-icon {
    font-size: 20px;
  }
  
  .list-name {
    font-size: 16px;
  }
  
  .list-desc {
    font-size: 13px;
  }
  
  .compact-grid {
    gap: 8px;
  }
  
  .compact-item {
    padding: 10px 12px;
    min-width: 120px;
  }
  
  .compact-icon {
    font-size: 18px;
  }
  
  .compact-name {
    font-size: 13px;
  }
  
  .guide-content {
    flex-direction: column;
    text-align: center;
  }
  
  /* 移动端MBTI预览样式 */
  .mbti-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .mbti-image-section {
    width: 60px;
    height: 60px;
    margin: 0 auto;
    border-radius: 8px;
  }
  
  .mbti-info-section {
    text-align: center;
  }
  
  .preview-header {
    justify-content: center;
    font-size: 12px;
  }
  
  .preview-desc {
    font-size: 12px;
  }
}
</style>