<template>
  <div class="trip-recommendation-step">
    <!-- 页面标题区域 -->
    <div class="page-title">
      <div class="title-content">
        <el-icon class="title-icon">
          <Star />
        </el-icon>
        <div class="title-text">
          <h2 class="main-title">推荐选择</h2>
          <p class="subtitle">为您精选的目的地推荐，自由搭配您的行程</p>
        </div>
      </div>
    </div>

    <!-- 推荐内容区域 -->
    <el-card class="info-card">
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
    </el-card>

    <!-- 底部操作区域 -->
    <div class="step-actions">
      <!-- 左侧：选择摘要 (保留统计功能但样式简化) -->
      <div class="action-left">
        <div class="selection-stats">
          <el-tag type="info" effect="plain" round>
            <el-icon><Location /></el-icon> {{ selectedAttractions.length }} 景点
          </el-tag>
          <el-tag type="info" effect="plain" round>
            <el-icon><Food /></el-icon> {{ selectedRestaurants.length }} 餐厅
          </el-tag>
          <el-tag type="info" effect="plain" round>
            <el-icon><House /></el-icon> {{ selectedHotels.length }} 酒店
          </el-tag>
        </div>
      </div>

      <!-- 右侧：按钮 -->
      <div class="action-right">
        <el-button size="large" @click="$emit('prev-step')">
          <el-icon><ArrowLeft /></el-icon>
          上一步
        </el-button>
        <el-button
          type="primary"
          size="large"
          :loading="generating"
          @click="handleContinue"
        >
          {{ totalSelected > 0 ? '生成行程' : '跳过生成' }}
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 推荐助手提示 -->
    <AiRecommendationTip
      :visible="showAiTip"
      :tip-text="getAiTipText()"
      @close="showAiTip = false"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Star, Location, Food, House, ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import RecommendationSection from '../Cards/RecommendationSection.vue';
import AiRecommendationTip from './TripRecommendationParts/AiRecommendationTip.vue';

export default {
  name: 'TripRecommendationStep',
  components: {
    RecommendationSection,
    AiRecommendationTip,
    Star, Location, Food, House, ArrowLeft, ArrowRight
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
    },
    initialSelectedAttractions: {
      type: Array,
      default: () => []
    },
    initialSelectedRestaurants: {
      type: Array,
      default: () => []
    },
    initialSelectedHotels: {
      type: Array,
      default: () => []
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
    const selectedAttractions = ref([...props.initialSelectedAttractions]);
    const selectedRestaurants = ref([...props.initialSelectedRestaurants]);
    const selectedHotels = ref([...props.initialSelectedHotels]);

    // 监听外部传入的初始选择变化
    watch(() => props.initialSelectedAttractions, (newVal) => {
      if (newVal && JSON.stringify(newVal) !== JSON.stringify(selectedAttractions.value)) {
        selectedAttractions.value = [...newVal];
      }
    }, { deep: true });

    watch(() => props.initialSelectedRestaurants, (newVal) => {
      if (newVal && JSON.stringify(newVal) !== JSON.stringify(selectedRestaurants.value)) {
        selectedRestaurants.value = [...newVal];
      }
    }, { deep: true });

    watch(() => props.initialSelectedHotels, (newVal) => {
      if (newVal && JSON.stringify(newVal) !== JSON.stringify(selectedHotels.value)) {
        selectedHotels.value = [...newVal];
      }
    }, { deep: true });


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
  width: 100%;
}

.page-title {
  padding: 24px 16px;
}

.title-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 48px;
  height: 48px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border-radius: 12px;
  color: var(--el-color-primary);
  border: 1px solid var(--el-color-primary-light-5);
}

.title-text .main-title {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.title-text .subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
  line-height: 1.4;
}

.info-card {
  border: none;
  box-shadow: none;
  margin-bottom: 24px;
  overflow: visible;
}

/* 操作区域 */
.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.action-left {
  display: flex;
  align-items: center;
}

.action-right {
  display: flex;
  gap: 16px;
}

.selection-stats {
  display: flex;
  gap: 8px;
}

.selection-stats .el-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  border-color: transparent;
  background-color: #f5f7fa;
  color: #606266;
}

.selection-stats .el-tag .el-icon {
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    padding: 16px;
    margin-bottom: 16px;
  }

  .title-content {
    gap: 12px;
  }

  .title-text .main-title {
    font-size: 20px;
  }

  .step-actions {
    flex-direction: column-reverse;
    gap: 16px;
    align-items: stretch;
  }
  
  .action-left, .action-right {
    width: 100%;
    justify-content: center;
  }
  
  .action-right .el-button {
    flex: 1;
  }
  
  .selection-stats {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
