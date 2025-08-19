<template>
  <div class="integration-test">
    <h2>偏好设置集成测试</h2>
    
    <!-- 用户档案预览 -->
    <div class="test-section">
      <h3>用户基础档案（来自 Preferences.vue）</h3>
      <div class="profile-preview">
        <div v-if="userPreferences">
          <p><strong>兴趣标签:</strong> {{ userPreferences.selectedTags?.join(', ') || '未设置' }}</p>
          <p><strong>MBTI类型:</strong> {{ userPreferences.mbtiType || '未设置' }}</p>
          <p><strong>预算范围:</strong> ¥{{ userPreferences.budget || '未设置' }}/天</p>
          <p><strong>饮食禁忌:</strong> {{ userPreferences.dietaryRestrictions?.join(', ') || '无' }}</p>
          <p><strong>无障碍需求:</strong> {{ userPreferences.needAccessibility ? '是' : '否' }}</p>
        </div>
        <div v-else class="no-data">
          <p>暂无用户档案数据</p>
          <el-button type="primary" @click="goToPreferences">
            设置用户档案
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 行程偏好预览 -->
    <div class="test-section">
      <h3>本次行程偏好（来自 TripPreferences.vue）</h3>
      <div class="trip-preview">
        <p><strong>行程目标:</strong> {{ tripPreferences.tripGoals?.join(', ') || '未设置' }}</p>
        <p><strong>重点体验:</strong> {{ tripPreferences.focusAreas?.join(', ') || '未设置' }}</p>
        <p><strong>行程节奏:</strong> {{ tripPreferences.pacePreference || '未设置' }}</p>
        <p><strong>环境偏好:</strong> {{ tripPreferences.socialPreference || '未设置' }}</p>
        <p><strong>拍照需求:</strong> {{ tripPreferences.photoPreference || '未设置' }}</p>
        <p><strong>临时饮食限制:</strong> {{ tripPreferences.temporaryDietaryRestrictions?.join(', ') || '无' }}</p>
        <p><strong>带有小孩:</strong> {{ tripPreferences.hasChildren ? '是' : '否' }}</p>
        <p><strong>需要无障碍:</strong> {{ tripPreferences.needAccessibility ? '是' : '否' }}</p>
        <p><strong>特殊请求:</strong> {{ tripPreferences.specialRequirements || '无' }}</p>
      </div>
    </div>
    
    <!-- 合并后的有效偏好 -->
    <div class="test-section">
      <h3>合并后的有效偏好（用于AI生成）</h3>
      <div class="merged-preview">
        <pre>{{ JSON.stringify(effectivePreferences, null, 2) }}</pre>
      </div>
    </div>
    
    <!-- 测试按钮 -->
    <div class="test-actions">
      <el-button @click="refreshData">刷新数据</el-button>
      <el-button type="warning" @click="resetTripPreferences">重置行程偏好</el-button>
      <el-button type="info" @click="simulateDraftLoad">模拟草稿加载</el-button>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user.js';
import { usePreferenceStore } from '@/store/preference.js';
import { ElMessage } from 'element-plus';

export default {
  name: 'PreferencesIntegrationTest',
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const preferenceStore = usePreferenceStore();
    
    // 计算属性
    const userPreferences = computed(() => userStore.currentUser?.preferences ? 
      (typeof userStore.currentUser.preferences === 'string' ? 
        JSON.parse(userStore.currentUser.preferences) : 
        userStore.currentUser.preferences) : null
    );
    
    const tripPreferences = computed(() => preferenceStore.tripPreferenceForm);
    const effectivePreferences = computed(() => preferenceStore.getEffectivePreferences());
    
    // 方法
    const goToPreferences = () => {
      router.push('/user/preferences');
    };
    
    const refreshData = async () => {
      try {
        await userStore.fetchUserInfo();
        preferenceStore.initializeTripPreferences();
        ElMessage.success('数据已刷新');
      } catch (error) {
        console.error('刷新数据失败:', error);
        ElMessage.error('刷新失败');
      }
    };
    
    const resetTripPreferences = () => {
      preferenceStore.resetPreferences();
      ElMessage.info('行程偏好已重置');
    };
    
    const simulateDraftLoad = () => {
      const mockDraftData = {
        tripGoals: ['relaxation', 'photography'],
        focusAreas: ['natural_scenery', 'local_cuisine'],
        pacePreference: 'slow',
        socialPreference: 'quiet',
        photoPreference: 'essential',
        temporaryDietaryRestrictions: ['vegetarian'],
        hasChildren: true,
        needAccessibility: false,
        specialRequirements: '需要安静的环境，适合拍照'
      };
      
      preferenceStore.loadDraftPreferences(mockDraftData);
      ElMessage.success('已加载模拟草稿数据');
    };
    
    // 生命周期
    onMounted(async () => {
      try {
        // 确保用户数据是最新的
        await userStore.fetchUserInfo();
        // 初始化行程偏好
        preferenceStore.initializeTripPreferences();
      } catch (error) {
        console.warn('初始化数据时出错:', error);
      }
    });
    
    return {
      userPreferences,
      tripPreferences,
      effectivePreferences,
      goToPreferences,
      refreshData,
      resetTripPreferences,
      simulateDraftLoad,
    };
  },
};
</script>

<style scoped>
.integration-test {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.test-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.test-section h3 {
  margin: 0 0 16px;
  color: #303133;
  font-weight: 600;
  font-size: 18px;
  border-bottom: 2px solid #f0f2f5;
  padding-bottom: 8px;
}

.profile-preview,
.trip-preview {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #91a8d0;
}

.profile-preview p,
.trip-preview p {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.5;
}

.no-data {
  text-align: center;
  color: #909399;
  padding: 32px;
}

.merged-preview {
  background: #2d3748;
  color: #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
}

.merged-preview pre {
  margin: 0;
  white-space: pre-wrap;
}

.test-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .integration-test {
    padding: 16px;
  }
  
  .test-section {
    padding: 16px;
  }
  
  .test-actions {
    flex-direction: column;
  }
  
  .test-actions .el-button {
    width: 100%;
  }
}
</style>

