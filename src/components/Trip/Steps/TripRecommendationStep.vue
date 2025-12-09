<template>
  <div class="trip-recommendation-step">
    <!-- 页面头部 -->
    <RecommendationHeader 
      :city-name="cityInfo?.destinationName" 
    />

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
    <RecommendationActions
      :selected-attractions-count="selectedAttractions.length"
      :selected-restaurants-count="selectedRestaurants.length"
      :selected-hotels-count="selectedHotels.length"
      :generating="generating"
      @prev-step="$emit('prev-step')"
      @continue="handleContinue"
    />

    <!-- 推荐助手提示 -->
    <AiRecommendationTip
      :visible="showAiTip"
      :tip-text="getAiTipText()"
      @close="showAiTip = false"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import RecommendationSection from '../Cards/RecommendationSection.vue';
import RecommendationHeader from './TripRecommendationParts/RecommendationHeader.vue';
import RecommendationActions from './TripRecommendationParts/RecommendationActions.vue';
import AiRecommendationTip from './TripRecommendationParts/AiRecommendationTip.vue';

export default {
  name: 'TripRecommendationStep',
  components: {
    RecommendationSection,
    RecommendationHeader,
    RecommendationActions,
    AiRecommendationTip
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

/* 推荐内容区域 */
.recommendation-main {
  margin-bottom: 32px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .trip-recommendation-step {
    padding: 0 8px;
  }
}

@media (max-width: 480px) {
  .trip-recommendation-step {
    padding: 0 4px;
  }
}
</style>
