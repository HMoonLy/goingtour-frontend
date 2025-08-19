<!--
🌟 GoingTour 旅行数据系统演示页面
展示完整的解决方案：清晰的数据架构 + 用户友好的页面设计
-->

<template>
  <div class="demo-page">
    <!-- 系统介绍 -->
    <div class="demo-header">
      <div class="header-content">
        <h1 class="demo-title">🌟 GoingTour 旅行偏好管理系统</h1>
        <p class="demo-subtitle">清晰的数据架构 + 用户友好的界面设计</p>
        
        <div class="key-features">
          <div class="feature-item">
            <el-icon><UserFilled /></el-icon>
            <span>个人档案：一次设置，终身受益</span>
          </div>
          <div class="feature-item">
            <el-icon><Suitcase /></el-icon>
            <span>行程偏好：每次旅行可调整</span>
          </div>
          <div class="feature-item">
            <el-icon><MagicStick /></el-icon>
            <span>智能预填：个人档案自动影响行程推荐</span>
          </div>
          <div class="feature-item">
            <el-icon><Robot /></el-icon>
            <span>AI理解：将用户选择转换为详细指导</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 解决方案架构图 -->
    <div class="architecture-section">
      <h2>🏗️ 系统架构设计</h2>
      <div class="architecture-diagram">
        <div class="arch-layer user-layer">
          <h3>用户体验层</h3>
          <div class="layer-items">
            <div class="layer-item">
              <span class="item-icon">🎯</span>
              <span class="item-text">个人旅行档案<br><small>一次设置，终身受益</small></span>
            </div>
            <div class="layer-item">
              <span class="item-icon">✈️</span>
              <span class="item-text">本次行程偏好<br><small>每次旅行可调整</small></span>
            </div>
          </div>
        </div>

        <div class="arch-layer data-layer">
          <h3>数据架构层</h3>
          <div class="layer-items">
            <div class="layer-item">
              <span class="item-icon">📊</span>
              <span class="item-text">个人档案数据<br><small>MBTI、兴趣、预算、限制</small></span>
            </div>
            <div class="layer-item">
              <span class="item-icon">🎛️</span>
              <span class="item-text">行程偏好数据<br><small>目的、重点、节奏、氛围</small></span>
            </div>
            <div class="layer-item">
              <span class="item-icon">🔗</span>
              <span class="item-text">智能预填引擎<br><small>档案→偏好自动映射</small></span>
            </div>
          </div>
        </div>

        <div class="arch-layer ai-layer">
          <h3>AI转换层</h3>
          <div class="layer-items">
            <div class="layer-item">
              <span class="item-icon">🤖</span>
              <span class="item-text">个人档案解析器<br><small>档案→AI画像</small></span>
            </div>
            <div class="layer-item">
              <span class="item-icon">⚙️</span>
              <span class="item-text">偏好解析器<br><small>选择→AI指导</small></span>
            </div>
            <div class="layer-item">
              <span class="item-icon">📝</span>
              <span class="item-text">提示词生成器<br><small>完整AI提示词</small></span>
            </div>
          </div>
        </div>

        <div class="arch-layer output-layer">
          <h3>输出层</h3>
          <div class="layer-items">
            <div class="layer-item">
              <span class="item-icon">🎨</span>
              <span class="item-text">个性化行程<br><small>基于用户画像的精准推荐</small></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能演示区域 -->
    <div class="demo-sections">
      
      <!-- 功能选择 -->
      <div class="demo-nav">
        <el-tabs v-model="activeDemo" class="demo-tabs">
          <el-tab-pane label="📋 个人档案管理" name="profile">
            <div class="tab-desc">一次设置，终身受益的个人旅行档案</div>
          </el-tab-pane>
          <el-tab-pane label="✈️ 行程偏好设置" name="preferences">
            <div class="tab-desc">每次旅行可调整的具体偏好</div>
          </el-tab-pane>
          <el-tab-pane label="🤖 AI理解展示" name="ai-demo">
            <div class="tab-desc">查看AI如何理解用户的选择</div>
          </el-tab-pane>
          <el-tab-pane label="📊 数据流演示" name="data-flow">
            <div class="tab-desc">完整的数据处理流程展示</div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 个人档案演示 -->
      <div v-if="activeDemo === 'profile'" class="demo-content">
        <div class="demo-description">
          <h3>🎯 个人旅行档案</h3>
          <p>这是用户的<strong>终身旅行档案</strong>，一次设置后会影响所有未来的行程推荐。包含性格特征、核心兴趣、预算水平、饮食限制和出行偏好。</p>
          
          <div class="benefits-list">
            <div class="benefit">✅ 避免每次重复填写相同信息</div>
            <div class="benefit">✅ 基于性格和兴趣的个性化推荐</div>
            <div class="benefit">✅ 智能预填行程偏好选项</div>
            <div class="benefit">✅ 严格遵守饮食和身体限制</div>
          </div>
        </div>
        
        <div class="demo-component">
          <PersonalProfile />
        </div>
      </div>

      <!-- 行程偏好演示 -->
      <div v-if="activeDemo === 'preferences'" class="demo-content">
        <div class="demo-description">
          <h3>✈️ 本次行程偏好</h3>
          <p>这是针对<strong>当前这次旅行</strong>的具体偏好设置，可以根据每次旅行的不同情况灵活调整。系统会基于个人档案智能预填合适的选项。</p>
          
          <div class="features-list">
            <div class="feature">🎯 根据旅行目的调整推荐风格</div>
            <div class="feature">🌟 选择最想体验的内容重点</div>
            <div class="feature">⏰ 灵活调整行程节奏和氛围</div>
            <div class="feature">🤖 实时显示AI理解结果</div>
          </div>
        </div>
        
        <div class="demo-component">
          <TripPreferencesNew 
            :trip-context="demoTripContext"
            @preferences-updated="onPreferencesUpdated"
          />
        </div>
      </div>

      <!-- AI理解演示 -->
      <div v-if="activeDemo === 'ai-demo'" class="demo-content">
        <div class="demo-description">
          <h3>🤖 AI理解和转换</h3>
          <p>展示系统如何将用户友好的选择转换为AI可理解的详细指导。这是整个系统的核心创新。</p>
        </div>
        
        <div class="ai-demo-container">
          <div class="ai-input">
            <h4>用户输入</h4>
            <div class="input-example">
              <div class="input-item">
                <span class="input-label">性格类型：</span>
                <span class="input-value">ENFP - 活动家</span>
              </div>
              <div class="input-item">
                <span class="input-label">核心兴趣：</span>
                <span class="input-value">摄影打卡、美食探索、文化体验</span>
              </div>
              <div class="input-item">
                <span class="input-label">旅行目的：</span>
                <span class="input-value">探索发现</span>
              </div>
              <div class="input-item">
                <span class="input-label">体验重点：</span>
                <span class="input-value">地道美食、网红打卡</span>
              </div>
              <div class="input-item">
                <span class="input-label">行程节奏：</span>
                <span class="input-value">刚刚好</span>
              </div>
            </div>
          </div>
          
          <div class="ai-transform">
            <el-icon class="transform-icon"><Right /></el-icon>
            <span class="transform-text">AI转换</span>
          </div>
          
          <div class="ai-output">
            <h4>AI理解结果</h4>
            <div class="output-content">
              <div class="ai-section">
                <h5>性格解读：</h5>
                <p>活力社交型旅行者：热爱新奇体验和社交互动，喜欢热闹的氛围和多样化的活动，对当地文化和人文风情特别感兴趣，愿意尝试各种新鲜事物包括特色美食，喜欢拍照分享和与当地人交流。</p>
              </div>
              
              <div class="ai-section">
                <h5>推荐策略：</h5>
                <p>安排丰富多样的活动类型，包含社交互动机会，推荐网红打卡地和当地特色体验。每餐都精心推荐当地特色，包含街头小吃、传统餐厅和特色料理。优先推荐视觉效果好、适合拍照的景点，考虑光线条件和拍摄角度。</p>
              </div>
              
              <div class="ai-section">
                <h5>行程安排：</h5>
                <p>采用平衡的行程节奏，每天3-4个景点，在充实安排和适度休息之间找到平衡。多样化体验，包含一些小众但有特色的景点。每个景点预留额外15-30分钟拍摄时间。</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据流演示 -->
      <div v-if="activeDemo === 'data-flow'" class="demo-content">
        <div class="demo-description">
          <h3>📊 完整数据处理流程</h3>
          <p>展示从用户输入到AI理解的完整数据处理流程，包括智能预填、数据验证、AI转换等环节。</p>
        </div>
        
        <div class="data-flow-demo">
          <div class="flow-step" :class="{ active: currentStep >= 1 }">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>个人档案输入</h4>
              <p>用户填写MBTI、兴趣、预算等基础信息</p>
              <div class="step-data">
                <code>{{ JSON.stringify(demoPersonalProfile, null, 2) }}</code>
              </div>
            </div>
          </div>
          
          <div class="flow-arrow">
            <el-icon><ArrowDown /></el-icon>
          </div>
          
          <div class="flow-step" :class="{ active: currentStep >= 2 }">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>智能预填启动</h4>
              <p>基于个人档案自动预填行程偏好</p>
              <div class="step-data">
                <code>{{ JSON.stringify(demoSmartDefaults, null, 2) }}</code>
              </div>
            </div>
          </div>
          
          <div class="flow-arrow">
            <el-icon><ArrowDown /></el-icon>
          </div>
          
          <div class="flow-step" :class="{ active: currentStep >= 3 }">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>用户调整偏好</h4>
              <p>用户根据这次旅行的具体情况调整偏好</p>
              <div class="step-data">
                <code>{{ JSON.stringify(demoTripPreferences, null, 2) }}</code>
              </div>
            </div>
          </div>
          
          <div class="flow-arrow">
            <el-icon><ArrowDown /></el-icon>
          </div>
          
          <div class="flow-step" :class="{ active: currentStep >= 4 }">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>AI转换处理</h4>
              <p>将用户选择转换为详细的AI指导</p>
              <div class="step-data">
                <code>{{ aiPromptPreview }}</code>
              </div>
            </div>
          </div>
          
          <div class="flow-controls">
            <el-button @click="simulateDataFlow">▶️ 模拟数据流</el-button>
            <el-button @click="resetDataFlow">🔄 重置</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 技术亮点 -->
    <div class="highlights-section">
      <h2>✨ 技术亮点</h2>
      <div class="highlights-grid">
        <div class="highlight-card">
          <div class="highlight-icon">🎯</div>
          <h3>清晰的数据分层</h3>
          <p>明确区分个人档案和行程偏好，让用户清楚每个设置的用途和影响范围</p>
        </div>
        
        <div class="highlight-card">
          <div class="highlight-icon">🤖</div>
          <h3>智能AI转换</h3>
          <p>将用户友好的选择转换为AI可理解的详细指导，提升推荐精确性</p>
        </div>
        
        <div class="highlight-card">
          <div class="highlight-icon">🔗</div>
          <h3>智能预填系统</h3>
          <p>基于个人档案自动预填行程偏好，提升用户体验和设置效率</p>
        </div>
        
        <div class="highlight-card">
          <div class="highlight-icon">👁️</div>
          <h3>实时可视化反馈</h3>
          <p>让用户实时看到设置如何影响AI理解，增强用户控制感</p>
        </div>
        
        <div class="highlight-card">
          <div class="highlight-icon">📱</div>
          <h3>用户友好界面</h3>
          <p>直观的卡片式设计，清晰的说明文字，优秀的交互体验</p>
        </div>
        
        <div class="highlight-card">
          <div class="highlight-icon">⚡</div>
          <h3>高性能架构</h3>
          <p>模块化设计，可扩展的数据架构，支持未来功能扩展</p>
        </div>
      </div>
      
      <!-- 快速导航区域 -->
      <div class="quick-navigation">
        <h3>🚀 快速开始</h3>
        <div class="nav-cards">
          <router-link to="/user/personal-profile" class="nav-card">
            <div class="nav-icon">👤</div>
            <div class="nav-content">
              <h4>设置个人档案</h4>
              <p>建立您的专属旅行档案</p>
            </div>
          </router-link>
          
          <router-link to="/user/preferences" class="nav-card">
            <div class="nav-icon">⚙️</div>
            <div class="nav-content">
              <h4>配置旅行偏好</h4>
              <p>详细设置旅行习惯和限制</p>
            </div>
          </router-link>
          
          <router-link to="/trip/new" class="nav-card">
            <div class="nav-icon">✈️</div>
            <div class="nav-content">
              <h4>创建智能行程</h4>
              <p>体验AI个性化推荐</p>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { 
  UserFilled, Suitcase, MagicStick, Robot, Right, ArrowDown 
} from '@element-plus/icons-vue';
import PersonalProfile from '@/pages/User/Settings/PersonalProfile.vue';
import TripPreferencesNew from '@/components/Trip/TripPreferencesNew.vue';
import { 
  PersonalProfileInterpreter, 
  SmartPrefillEngine,
  CompletePromptGenerator 
} from '@/utils/data/aiPromptEngine.js';

export default {
  name: 'TravelDataSystemDemo',
  components: {
    UserFilled, Suitcase, MagicStick, Robot, Right, ArrowDown,
    PersonalProfile, TripPreferencesNew
  },
  setup() {
    const activeDemo = ref('profile');
    const currentStep = ref(0);
    
    // 演示数据
    const demoPersonalProfile = reactive({
      mbtiType: 'ENFP',
      coreInterests: ['photography', 'food', 'culture'],
      budgetLevel: 'moderate',
      dietaryRestrictions: [],
      transportPreferences: ['public', 'walking']
    });
    
    const demoTripContext = reactive({
      destination: '北京',
      duration: 3,
      startDate: '2024-01-15'
    });
    
    const demoTripPreferences = reactive({
      tripPurpose: 'exploration',
      focusAreas: ['local_cuisine', 'photo_spots'],
      pacePreference: 'balanced',
      socialPreference: 'lively',
      photoPreference: 'essential',
      temporaryNeeds: []
    });
    
    const demoSmartDefaults = reactive({
      socialPreference: 'lively',
      pacePreference: 'balanced', 
      photoPreference: 'essential',
      focusAreas: ['photo_spots', 'local_cuisine', 'art_culture']
    });
    
    const aiPromptPreview = ref('');
    
    // 生成AI提示词预览
    const generateAIPreview = () => {
      const generator = new CompletePromptGenerator(
        demoPersonalProfile,
        demoTripPreferences,
        demoTripContext
      );
      const prompt = generator.generateCompletePrompt();
      aiPromptPreview.value = prompt.substring(0, 300) + '...';
    };
    
    // 模拟数据流
    const simulateDataFlow = () => {
      currentStep.value = 0;
      const interval = setInterval(() => {
        currentStep.value++;
        if (currentStep.value >= 4) {
          clearInterval(interval);
        }
      }, 1000);
    };
    
    const resetDataFlow = () => {
      currentStep.value = 0;
    };
    
    const onPreferencesUpdated = (preferences) => {
      Object.assign(demoTripPreferences, preferences);
    };
    
    onMounted(() => {
      generateAIPreview();
    });
    
    return {
      activeDemo,
      currentStep,
      demoPersonalProfile,
      demoTripContext,
      demoTripPreferences,
      demoSmartDefaults,
      aiPromptPreview,
      simulateDataFlow,
      resetDataFlow,
      onPreferencesUpdated
    };
  }
};
</script>

<style scoped>
.demo-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background: #fafafa;
  min-height: 100vh;
}

/* 演示头部 */
.demo-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 48px;
  margin-bottom: 40px;
  color: white;
  text-align: center;
}

.demo-title {
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.demo-subtitle {
  font-size: 18px;
  margin: 0 0 32px 0;
  opacity: 0.9;
}

.key-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 32px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.feature-item .el-icon {
  font-size: 20px;
  color: #ffd700;
}

/* 架构图 */
.architecture-section {
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.architecture-section h2 {
  text-align: center;
  margin-bottom: 32px;
  font-size: 28px;
  color: #303133;
}

.architecture-diagram {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.arch-layer {
  padding: 24px;
  border-radius: 16px;
  border: 2px solid #e4e7ed;
}

.arch-layer h3 {
  text-align: center;
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
}

.user-layer {
  background: linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%);
  border-color: #67c23a;
}

.data-layer {
  background: linear-gradient(135deg, #e1f5fe 0%, #ffffff 100%);
  border-color: #409eff;
}

.ai-layer {
  background: linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%);
  border-color: #9c27b0;
}

.output-layer {
  background: linear-gradient(135deg, #fff8e1 0%, #ffffff 100%);
  border-color: #ff9800;
}

.layer-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  text-align: left;
}

.item-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.item-text {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
}

.item-text small {
  display: block;
  font-size: 12px;
  color: #909399;
  font-weight: 400;
}

/* 演示区域 */
.demo-sections {
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.demo-nav {
  margin-bottom: 32px;
}

.demo-tabs {
  border-bottom: 2px solid #e4e7ed;
}

.tab-desc {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
  font-style: italic;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.demo-description h3 {
  margin: 0 0 16px 0;
  font-size: 24px;
  color: #303133;
}

.demo-description p {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
}

.benefits-list, .features-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.benefit, .feature {
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  color: #303133;
}

.demo-component {
  border: 1px solid #e4e7ed;
  border-radius: 16px;
  padding: 24px;
  background: #fafafa;
}

/* AI演示 */
.ai-demo-container {
  display: grid;
  grid-template-columns: 2fr auto 3fr;
  gap: 24px;
  align-items: center;
}

.ai-input, .ai-output {
  padding: 24px;
  border-radius: 16px;
  border: 2px solid #e4e7ed;
}

.ai-input {
  background: #f8f9fa;
}

.ai-output {
  background: #e8f4fd;
}

.ai-input h4, .ai-output h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #303133;
}

.input-example {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.input-label {
  font-weight: 600;
  color: #606266;
  min-width: 80px;
}

.input-value {
  color: #303133;
}

.ai-transform {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.transform-icon {
  font-size: 32px;
  color: #409eff;
}

.transform-text {
  font-weight: 600;
  color: #409eff;
}

.output-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ai-section h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
}

.ai-section p {
  margin: 0;
  font-size: 13px;
  color: #303133;
  line-height: 1.4;
}

/* 数据流演示 */
.data-flow-demo {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}

.flow-step {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 24px;
  border: 2px solid #e4e7ed;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.flow-step.active {
  opacity: 1;
  border-color: #409eff;
  background: #e8f4fd;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #303133;
}

.step-content p {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #606266;
}

.step-data {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e4e7ed;
}

.step-data code {
  font-size: 12px;
  color: #303133;
  white-space: pre-wrap;
  line-height: 1.4;
}

.flow-arrow {
  font-size: 24px;
  color: #409eff;
}

.flow-controls {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

/* 技术亮点 */
.highlights-section {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.highlights-section h2 {
  text-align: center;
  margin-bottom: 32px;
  font-size: 28px;
  color: #303133;
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.highlight-card {
  padding: 32px 24px;
  text-align: center;
  border-radius: 16px;
  border: 2px solid #e4e7ed;
  transition: all 0.3s ease;
}

.highlight-card:hover {
  border-color: #409eff;
  box-shadow: 0 8px 30px rgba(64, 158, 255, 0.15);
  transform: translateY(-4px);
}

.highlight-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.highlight-card h3 {
  margin: 0 0 16px 0;
  font-size: 20px;
  color: #303133;
}

.highlight-card p {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .demo-page {
    padding: 16px;
  }

  .demo-header {
    padding: 32px 24px;
  }

  .demo-title {
    font-size: 28px;
  }

  .key-features {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .architecture-diagram {
    gap: 16px;
  }

  .layer-items {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .ai-demo-container {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .ai-transform {
    transform: rotate(90deg);
    margin: 16px 0;
  }

  .highlights-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

/* 快速导航样式 */
.quick-navigation {
  margin-top: 40px;
  padding: 32px;
  background: linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%);
  border-radius: 20px;
  border: 1px solid #e8eaed;
}

.quick-navigation h3 {
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  text-align: center;
}

.nav-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.nav-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  text-decoration: none;
  color: inherit;
  border: 2px solid #e8eaed;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.nav-card:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
  text-decoration: none;
  color: inherit;
}

.nav-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.nav-content h4 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.nav-content p {
  margin: 0;
  font-size: 14px;
  color: #909399;
  line-height: 1.4;
}
</style>
