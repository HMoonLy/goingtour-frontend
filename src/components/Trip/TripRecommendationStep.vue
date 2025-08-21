<!--
✈️ 推荐选择步骤 - 独立的推荐选择流程
让用户专注于选择景点和餐厅，不被其他信息干扰
-->

<template>
  <div class="trip-recommendation-step">
    <!-- 页面头部 -->
    <div class="step-header">
      <div class="header-content">
        <div class="header-icon">
          <el-icon><Star /></el-icon>
        </div>
        <div class="header-text">
          <h2 class="step-title">🎯 {{ cityInfo?.destinationName || '目的地' }}推荐选择</h2>
          <p class="step-subtitle">从智能推荐中选择您感兴趣的景点和餐厅，AI将据此制定个性化行程</p>
        </div>
      </div>
      
      <!-- 进度提示 -->
      <div class="progress-hint">
        <div class="hint-content">
          <el-icon><InfoFilled /></el-icon>
          <span>💡 基于您的偏好，我们为您推荐了最适合的景点和餐厅</span>
        </div>
      </div>
    </div>

    <!-- 推荐内容区域 -->
    <div class="recommendation-main">
      <RecommendationSection
        :city-info="cityInfo"
        :recommended-attractions="recommendedAttractions"
        :recommended-restaurants="recommendedRestaurants"
        :selected-attractions="selectedAttractions"
        :selected-restaurants="selectedRestaurants"
        :loading-attractions="loadingAttractions"
        :loading-restaurants="loadingRestaurants"
        :api-error="apiError"
        :search-results="searchResults"
        :is-search-mode="isSearchMode"
        :searching="searching"
        :extract-attraction-tags="extractAttractionTags"
        :extract-signature-dishes="extractSignatureDishes"
        @add-attraction="handleAddAttraction"
        @remove-attraction="handleRemoveAttraction"
        @add-restaurant="handleAddRestaurant"
        @remove-restaurant="handleRemoveRestaurant"
        @load-more-attractions="handleLoadMoreAttractions"
        @load-more-restaurants="handleLoadMoreRestaurants"
        @search="handleSearch"
        @clear-search="handleClearSearch"
        @clear-all-selections="handleClearAllSelections"
      />
    </div>

    <!-- 底部操作区域 -->
    <div class="step-actions">
      <div class="actions-content">
        <!-- 左侧：选择摘要 -->
        <div class="selection-summary">
          <div class="summary-stats">
            <div class="stat-item">
              <el-icon class="stat-icon" color="#91A8D0"><Location /></el-icon>
              <span>{{ selectedAttractions.length }} 个景点</span>
            </div>
            <div class="stat-item">
              <el-icon class="stat-icon" color="#E6A23C"><Food /></el-icon>
              <span>{{ selectedRestaurants.length }} 家餐厅</span>
            </div>
          </div>
          <div v-if="totalSelected > 0" class="selection-tip">
            <el-icon><Check /></el-icon>
            <span>已选择 {{ totalSelected }} 项，可以继续生成行程</span>
          </div>
          <div v-else class="no-selection-tip">
            <el-icon><Warning /></el-icon>
            <span>建议至少选择1个景点或餐厅</span>
          </div>
        </div>

        <!-- 右侧：操作按钮 -->
        <div class="action-buttons">
          <el-button
            size="large"
            :disabled="generating"
            @click="$emit('prev-step')"
          >
            <el-icon><ArrowLeft /></el-icon>
            上一步
          </el-button>
          
          <el-button
            type="primary"
            size="large"
            :disabled="generating"
            @click="handleContinue"
          >
            <el-icon><ArrowRight /></el-icon>
            {{ totalSelected > 0 ? '继续生成行程' : '跳过直接生成' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- AI助手提示 -->
    <div v-if="showAiTip" class="ai-tip-card">
      <div class="ai-tip-content">
        <div class="ai-tip-header">
          <el-icon class="ai-icon"><MagicStick /></el-icon>
          <h4>🤖 AI助手建议</h4>
          <el-button 
            type="text" 
            size="small" 
            @click="showAiTip = false"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        <div class="ai-tip-text">
          {{ getAiTipText() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Star, InfoFilled, Location, Food, Check, Warning,
  ArrowLeft, ArrowRight, MagicStick, Close
} from '@element-plus/icons-vue';
import RecommendationSection from './RecommendationSection.vue';
import { recommendationApi } from '@/api/recommendation.js';

export default {
  name: 'TripRecommendationStep',
  components: {
    RecommendationSection,
    Star, InfoFilled, Location, Food, Check, Warning,
    ArrowLeft, ArrowRight, MagicStick, Close
  },
  props: {
    // 城市信息
    cityInfo: {
      type: Object,
      default: () => ({})
    },
    // 行程基础信息
    baseForm: {
      type: Object,
      required: true
    },
    // 偏好信息
    preferenceForm: {
      type: Object,
      default: () => ({})
    },
    // 生成状态
    generating: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'prev-step',
    'next-step', 
    'selections-updated',
    'save-draft'
  ],
  setup(props, { emit }) {
    // 推荐数据
    const recommendedAttractions = ref([]);
    const recommendedRestaurants = ref([]);
    const selectedAttractions = ref([]);
    const selectedRestaurants = ref([]);

    // 加载状态
    const loadingAttractions = ref(false);
    const loadingRestaurants = ref(false);
    const apiError = ref(null);

    // 搜索相关
    const searchResults = ref([]);
    const isSearchMode = ref(false);
    const searching = ref(false);

    // AI提示
    const showAiTip = ref(true);

    // 计算属性
    const totalSelected = computed(() => 
      selectedAttractions.value.length + selectedRestaurants.value.length
    );

    // 加载推荐数据
    const loadRecommendations = async () => {
      if (!props.cityInfo?.destinationName) {
        console.warn('缺少城市信息，无法加载推荐');
        return;
      }

      try {
        loadingAttractions.value = true;
        loadingRestaurants.value = true;
        apiError.value = null;

        // 并行加载景点和餐厅推荐
        const [attractionsResponse, restaurantsResponse] = await Promise.all([
          recommendationApi.getAttractions(props.cityInfo.destinationName, {
            preferences: props.preferenceForm,
            limit: 12
          }),
          recommendationApi.getRestaurants(props.cityInfo.destinationName, {
            preferences: props.preferenceForm,
            limit: 12
          })
        ]);

        recommendedAttractions.value = attractionsResponse.data || [];
        recommendedRestaurants.value = restaurantsResponse.data || [];

        console.log('✅ 推荐数据加载完成', {
          attractions: recommendedAttractions.value.length,
          restaurants: recommendedRestaurants.value.length
        });

      } catch (error) {
        console.error('❌ 加载推荐数据失败:', error);
        apiError.value = error.message || '推荐数据加载失败';
      } finally {
        loadingAttractions.value = false;
        loadingRestaurants.value = false;
      }
    };

    // 景点操作
    const handleAddAttraction = (attraction) => {
      selectedAttractions.value.push(attraction);
      emitSelectionUpdate();
      ElMessage.success(`已添加景点：${attraction.name}`);
    };

    const handleRemoveAttraction = (attraction) => {
      const index = selectedAttractions.value.findIndex(a => a.id === attraction.id);
      if (index > -1) {
        selectedAttractions.value.splice(index, 1);
        emitSelectionUpdate();
        ElMessage.info(`已移除景点：${attraction.name}`);
      }
    };

    // 餐厅操作
    const handleAddRestaurant = (restaurant) => {
      selectedRestaurants.value.push(restaurant);
      emitSelectionUpdate();
      ElMessage.success(`已添加餐厅：${restaurant.name}`);
    };

    const handleRemoveRestaurant = (restaurant) => {
      const index = selectedRestaurants.value.findIndex(r => r.id === restaurant.id);
      if (index > -1) {
        selectedRestaurants.value.splice(index, 1);
        emitSelectionUpdate();
        ElMessage.info(`已移除餐厅：${restaurant.name}`);
      }
    };

    // 加载更多
    const handleLoadMoreAttractions = async () => {
      // 实现加载更多景点的逻辑
      console.log('加载更多景点');
    };

    const handleLoadMoreRestaurants = async () => {
      // 实现加载更多餐厅的逻辑
      console.log('加载更多餐厅');
    };

    // 搜索功能
    const handleSearch = async (searchParams) => {
      try {
        searching.value = true;
        const response = await recommendationApi.search(
          props.cityInfo.destinationName,
          searchParams
        );
        searchResults.value = response.data || [];
        isSearchMode.value = true;
      } catch (error) {
        console.error('搜索失败:', error);
        ElMessage.error('搜索失败');
      } finally {
        searching.value = false;
      }
    };

    const handleClearSearch = () => {
      searchResults.value = [];
      isSearchMode.value = false;
    };

    // 清空所有选择
    const handleClearAllSelections = () => {
      selectedAttractions.value = [];
      selectedRestaurants.value = [];
      emitSelectionUpdate();
      ElMessage.info('已清空所有选择');
    };

    // 继续到下一步
    const handleContinue = () => {
      // 发送选择更新事件
      emitSelectionUpdate();
      
      if (totalSelected.value > 0) {
        ElMessage.success(`已选择 ${totalSelected.value} 项，开始生成行程`);
      } else {
        ElMessage.info('跳过推荐选择，直接生成行程');
      }
      
      emit('next-step');
    };

    // 发送选择更新事件
    const emitSelectionUpdate = () => {
      emit('selections-updated', {
        selectedAttractions: selectedAttractions.value,
        selectedRestaurants: selectedRestaurants.value
      });
    };

    // 提取景点标签
    const extractAttractionTags = (attraction) => {
      // 简单的标签提取逻辑
      const tags = [];
      if (attraction.type) tags.push(attraction.type);
      if (attraction.features) tags.push(...attraction.features);
      return tags.slice(0, 3);
    };

    // 提取餐厅招牌菜
    const extractSignatureDishes = (restaurant) => {
      // 简单的招牌菜提取逻辑
      const dishes = [];
      if (restaurant.specialties) dishes.push(...restaurant.specialties);
      if (restaurant.signature) dishes.push(restaurant.signature);
      return dishes.slice(0, 3);
    };

    // 获取AI提示文本
    const getAiTipText = () => {
      if (totalSelected.value === 0) {
        return '💡 建议选择一些感兴趣的景点和餐厅，这样AI能为您制定更精准的行程安排。您也可以跳过此步骤，让AI为您自动推荐。';
      } else if (totalSelected.value < 3) {
        return `✨ 很好！您已选择了 ${totalSelected.value} 项。可以继续添加更多选择，或直接进入下一步生成行程。`;
      } else {
        return `🎉 太棒了！您已选择了 ${totalSelected.value} 项丰富的内容，AI将为您制定完美的行程安排！`;
      }
    };

    // 组件挂载时加载推荐数据
    onMounted(() => {
      console.log('🚀 推荐选择步骤组件挂载');
      loadRecommendations();
    });

    return {
      // 数据
      recommendedAttractions,
      recommendedRestaurants,
      selectedAttractions,
      selectedRestaurants,
      loadingAttractions,
      loadingRestaurants,
      apiError,
      searchResults,
      isSearchMode,
      searching,
      showAiTip,
      totalSelected,
      
      // 方法
      handleAddAttraction,
      handleRemoveAttraction,
      handleAddRestaurant,
      handleRemoveRestaurant,
      handleLoadMoreAttractions,
      handleLoadMoreRestaurants,
      handleSearch,
      handleClearSearch,
      handleClearAllSelections,
      handleContinue,
      extractAttractionTags,
      extractSignatureDishes,
      getAiTipText
    };
  }
};
</script>

<style scoped>
.trip-recommendation-step {
  max-width: 1200px;
  margin: 0 auto;
  background: #fafafa;
  min-height: 100vh;
}

/* 步骤头部 */
.step-header {
  background: linear-gradient(135deg, #91A8D0 0%, #A3B7DB 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 32px;
  color: white;
  position: relative;
  overflow: hidden;
}

.step-header::before {
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
  margin-bottom: 24px;
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

.step-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.step-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
}

.progress-hint {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 20px 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.hint-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
}

/* 推荐内容区域 */
.recommendation-main {
  margin-bottom: 32px;
}

/* 底部操作区域 */
.step-actions {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8eaed;
  margin-bottom: 32px;
  position: sticky;
  bottom: 20px;
  z-index: 50;
}

.actions-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
}

/* 选择摘要 */
.selection-summary {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.stat-icon {
  font-size: 20px;
}

.selection-tip,
.no-selection-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.selection-tip {
  color: #67c23a;
}

.no-selection-tip {
  color: #e6a23c;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 16px;
}

.action-buttons .el-button {
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  min-width: 140px;
}

/* AI助手提示卡片 */
.ai-tip-card {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 320px;
  background: linear-gradient(135deg, #F7CAC9 0%, #91A8D0 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  color: white;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.ai-tip-content {
  padding: 20px;
}

.ai-tip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.ai-tip-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-icon {
  font-size: 20px;
  color: #F7CAC9;
}

.ai-tip-text {
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .step-header {
    padding: 32px 24px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .step-title {
    font-size: 28px;
  }

  .actions-content {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .summary-stats {
    justify-content: center;
  }

  .action-buttons {
    justify-content: stretch;
  }

  .action-buttons .el-button {
    flex: 1;
    min-width: auto;
  }

  .ai-tip-card {
    position: relative;
    width: auto;
    margin: 20px;
    right: auto;
    bottom: auto;
  }
}

@media (max-width: 480px) {
  .step-header {
    padding: 24px 20px;
  }

  .step-title {
    font-size: 24px;
  }

  .step-actions {
    padding: 24px 20px;
  }

  .summary-stats {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  .action-buttons {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
