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
          <h2 class="step-title">🗺️ {{ cityInfo?.destinationName || '目的地' }}热门推荐</h2>
          <p class="step-subtitle">基于高德地图数据为您推荐热门景点和餐厅，选择您感兴趣的进行旅行规划</p>
        </div>
      </div>
      
      <!-- 进度提示 -->
      <div class="progress-hint">
        <div class="hint-content">
          <el-icon><InfoFilled /></el-icon>
          <span>💡 基于高德地图数据，为您推荐该地区的热门景点和餐厅</span>
        </div>
      </div>
    </div>

    <!-- 推荐内容区域 -->
    <div class="recommendation-main">
      <RecommendationSection
        :city-info="cityInfo"
        :selected-attractions="selectedAttractions"
        :selected-restaurants="selectedRestaurants"
        :selected-hotels="selectedHotels"
        @add-attraction="handleAddAttraction"
        @remove-attraction="handleRemoveAttraction"
        @add-restaurant="handleAddRestaurant"
        @remove-restaurant="handleRemoveRestaurant"
        @add-hotel="handleAddHotel"
        @remove-hotel="handleRemoveHotel"
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
              <el-icon class="stat-icon" color="#91a8d0"><Location /></el-icon>
              <span>{{ selectedAttractions.length }} 个景点</span>
            </div>
            <div class="stat-item">
              <el-icon class="stat-icon" color="#f7cac9"><Food /></el-icon>
              <span>{{ selectedRestaurants.length }} 家餐厅</span>
            </div>
            <div class="stat-item">
              <el-icon class="stat-icon" color="#409EFF"><House /></el-icon>
              <span>{{ selectedHotels.length }} 家酒店</span>
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

    <!-- 推荐助手提示 -->
    <div v-if="showAiTip" class="ai-tip-card">
      <div class="ai-tip-content">
        <div class="ai-tip-header">
          <el-icon class="ai-icon"><MagicStick /></el-icon>
          <h4>💡 推荐建议</h4>
          <el-button 
            link 
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
  Star, InfoFilled, Location, Food, House, Check, Warning,
  ArrowLeft, ArrowRight, MagicStick, Close
} from '@element-plus/icons-vue';
import RecommendationSection from '../Cards/RecommendationSection.vue';

export default {
  name: 'TripRecommendationStep',
  components: {
    RecommendationSection,
    Star, InfoFilled, Location, Food, House, Check, Warning,
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
    // 选中的数据
    const selectedAttractions = ref([]);
    const selectedRestaurants = ref([]);
    const selectedHotels = ref([]);

    // AI提示
    const showAiTip = ref(true);

    // 计算属性
    const totalSelected = computed(() => 
      selectedAttractions.value.length + selectedRestaurants.value.length + selectedHotels.value.length
    );

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

    // 酒店操作
    const handleAddHotel = (hotel) => {
      selectedHotels.value.push(hotel);
      emitSelectionUpdate();
      ElMessage.success(`已添加酒店：${hotel.name}`);
    };

    const handleRemoveHotel = (hotel) => {
      const index = selectedHotels.value.findIndex(h => h.id === hotel.id);
      if (index > -1) {
        selectedHotels.value.splice(index, 1);
        emitSelectionUpdate();
        ElMessage.info(`已移除酒店：${hotel.name}`);
      }
    };

    // 清空所有选择
    const handleClearAllSelections = () => {
      selectedAttractions.value = [];
      selectedRestaurants.value = [];
      selectedHotels.value = [];
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
        selectedRestaurants: selectedRestaurants.value,
        selectedHotels: selectedHotels.value
      });
    };

    // 获取提示文本
    const getAiTipText = () => {
      if (totalSelected.value === 0) {
        return '💡 建议选择一些感兴趣的景点和餐厅，这样系统能为您制定更精准的行程安排。您也可以跳过此步骤直接生成行程。';
      } else if (totalSelected.value < 3) {
        return `✨ 很好！您已选择了 ${totalSelected.value} 项。可以继续添加更多选择，或直接进入下一步生成行程。`;
      } else {
        return `🎉 太棒了！您已选择了 ${totalSelected.value} 项丰富的内容，系统将为您制定完美的行程安排！`;
      }
    };

    // 组件挂载时的调试信息
    onMounted(() => {
      console.log('🚀 推荐选择步骤组件挂载');
    });

    return {
      // 数据
      selectedAttractions,
      selectedRestaurants,
      selectedHotels,
      showAiTip,
      totalSelected,
      
      // 方法
      handleAddAttraction,
      handleRemoveAttraction,
      handleAddRestaurant,
      handleRemoveRestaurant,
      handleAddHotel,
      handleRemoveHotel,
      handleClearAllSelections,
      handleContinue,
      getAiTipText
    };
  }
};
</script>

<style scoped>
.trip-recommendation-step {
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
  min-height: 100vh;
  padding: 0 16px;
}

/* 步骤头部 */
.step-header {
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
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
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  min-width: 120px;
  transition: all 0.3s ease;
}

.action-buttons .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 推荐助手提示卡片 */
.ai-tip-card {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 320px;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
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
  color: rgba(255, 255, 255, 0.9);
}

.ai-tip-text {
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .trip-recommendation-step {
    padding: 0 8px;
  }
  
  .step-header {
    padding: 24px 20px;
    margin-bottom: 20px;
    border-radius: 16px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .header-icon {
    width: 60px;
    height: 60px;
    font-size: 30px;
  }

  .step-title {
    font-size: 28px;
  }

  .step-subtitle {
    font-size: 14px;
    line-height: 1.6;
  }

  .progress-hint {
    padding: 16px 20px;
    border-radius: 12px;
  }

  .hint-content {
    font-size: 13px;
    gap: 8px;
  }

  .step-actions {
    padding: 24px 16px;
    border-radius: 16px;
    margin-bottom: 20px;
  }

  .actions-content {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .selection-summary {
    text-align: center;
  }

  .summary-stats {
    justify-content: center;
    gap: 16px;
  }

  .stat-item {
    font-size: 15px;
  }

  .action-buttons {
    justify-content: stretch;
    gap: 12px;
  }

  .action-buttons .el-button {
    flex: 1;
    min-width: auto;
    padding: 14px 20px;
    font-size: 15px;
  }

  .ai-tip-card {
    position: relative;
    width: auto;
    margin: 16px 8px;
    right: auto;
    bottom: auto;
    border-radius: 12px;
  }
}

@media (max-width: 480px) {
  .trip-recommendation-step {
    padding: 0 4px;
  }

  .step-header {
    padding: 20px 16px;
    margin-bottom: 16px;
    border-radius: 12px;
  }

  .header-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }

  .step-title {
    font-size: 22px;
    margin-bottom: 8px;
  }

  .step-subtitle {
    font-size: 13px;
  }

  .progress-hint {
    padding: 12px 16px;
  }

  .hint-content {
    font-size: 12px;
  }

  .step-actions {
    padding: 20px 16px;
    margin-bottom: 16px;
    border-radius: 12px;
  }

  .selection-summary {
    gap: 8px;
  }

  .summary-stats {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  .stat-item {
    font-size: 14px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 12px;
  }

  .action-buttons .el-button {
    padding: 12px 16px;
    font-size: 14px;
    min-width: 80px;
  }

  .ai-tip-card {
    margin: 12px 4px;
    border-radius: 8px;
  }
}
</style>