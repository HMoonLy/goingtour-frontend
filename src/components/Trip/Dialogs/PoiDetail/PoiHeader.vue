<template>
  <div class="poi-header">
    <div class="poi-basic-info">
      <h2 class="poi-name">{{ poi.name }}</h2>
      <div class="poi-category">
        <el-tag v-if="poi.isEnhanced || poi.biz_ext" type="success" size="small">
          <el-icon><Check /></el-icon>
          高德数据
        </el-tag>
        <!-- 评分和价格信息 -->
        <div v-if="rating || cost" class="rating-cost-info">
          <el-rate
            v-if="rating"
            :model-value="rating"
            disabled
            show-score
            text-color="#ff9900"
            score-template="{value}分"
            size="small"
          />
          <el-tag v-if="cost" type="warning" size="small">
            人均 ¥{{ cost }}
          </el-tag>
        </div>
      </div>
    </div>
    
    <!-- 关闭按钮 -->
    <div class="poi-close-btn">
      <el-button
        type="info"
        :icon="Close"
        circle
        size="large"
        @click="$emit('close')"
        class="close-button"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Check, Close } from '@element-plus/icons-vue'
import { usePoiData } from '@/composables/trip/usePoiData'

const props = defineProps({
  poi: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])

const { getRating, getCost } = usePoiData(props.poi)

const rating = computed(() => getRating())
const cost = computed(() => getCost())
</script>

<style scoped>
.poi-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.poi-basic-info {
  flex: 1;
}

.poi-name {
  margin: 0 0 12px 0;
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1.2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.poi-category {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.rating-cost-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.rating-cost-info .el-rate {
  --el-rate-icon-size: 16px;
}

.rating-cost-info .el-rate__text {
  font-size: 14px;
  font-weight: 600;
  color: #ff9900;
}

.poi-close-btn {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 16px;
  border-radius: 12px;
}

.close-button {
  --el-button-bg-color: #f5f5f5;
  --el-button-border-color: #dcdfe6;
  --el-button-text-color: #606266;
  transition: all 0.3s ease;
}

.close-button:hover {
  --el-button-bg-color: #e74c3c;
  --el-button-border-color: #e74c3c;
  --el-button-text-color: #ffffff;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .poi-header {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    margin-bottom: 24px;
  }
  
  .poi-name {
    font-size: 24px;
  }
  
  .poi-close-btn {
    justify-content: center;
    margin-top: 16px;
  }
}

@media (max-width: 480px) {
  .poi-name {
    font-size: 20px;
  }
}
</style>

