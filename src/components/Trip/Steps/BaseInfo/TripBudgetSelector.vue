<template>
  <div class="form-section budget-section">
    <div class="section-title">
      <el-icon><Money /></el-icon>
      <span>预算范围</span>
      <span class="section-subtitle">每人/天</span>
    </div>

    <el-form-item prop="budget">
      <div
        v-if="userPreferences && userPreferences.budget"
        class="preference-hint-banner"
      >
        <el-icon><Star /></el-icon>
        <span>根据您的偏好，推荐预算：¥{{ userPreferences.budget }}/天</span>
        <el-button type="link" size="small" @click="applyRecommendedBudget">
          应用推荐
        </el-button>
      </div>

      <div class="budget-selector">
        <div
          v-for="option in budgetOptions"
          :key="option.value"
          class="budget-card"
          :class="{
            selected: modelValue === option.value,
            recommended: isRecommendedBudget(option.value),
          }"
          @click="selectBudget(option.value)"
        >
          <div class="budget-icon">
            <el-icon>
              <component :is="option.icon" />
            </el-icon>
          </div>
          <div class="budget-content">
            <h4 class="budget-title">
              {{ option.title }}
              <el-tag
                v-if="isRecommendedBudget(option.value)"
                size="small"
                type="success"
              >
                推荐
              </el-tag>
            </h4>
            <div class="budget-price">
              {{ option.price }}
            </div>
            <div class="budget-desc">
              {{ option.description }}
            </div>
          </div>
          <div v-if="days && travelers" class="budget-preview">
            <div class="preview-label">总预算</div>
            <div class="preview-amount">
              {{ calculateBudgetPreview(option.value) }}
            </div>
          </div>
          <div v-if="modelValue === option.value" class="budget-check">
            <el-icon><Check /></el-icon>
          </div>
        </div>
      </div>
    </el-form-item>
  </div>
</template>

<script setup>
import { Money, Star, Check, Setting } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  modelValue: String,
  days: Number,
  travelers: Number,
  userPreferences: Object
});

const emit = defineEmits(['update:modelValue']);

const budgetOptions = [
  {
    value: "budget",
    title: "经济实惠",
    price: "¥400/人/天",
    description: "青旅/民宿 + 公共交通 + 特色小吃",
    icon: "Money",
  },
  {
    value: "moderate",
    title: "舒适适中",
    price: "¥750/人/天",
    description: "舒适酒店 + 打车出行 + 必吃餐厅",
    icon: "Star",
  },
  {
    value: "luxury",
    title: "豪华享受",
    price: "¥1500+/人/天",
    description: "高端酒店 + 专车接送 + 精致餐饮",
    icon: "Setting",
  },
];

// 是否为推荐预算
const isRecommendedBudget = (value) => {
  if (!props.userPreferences?.budget) return false;
  const userBudget = parseInt(props.userPreferences.budget);
  
  if (value === 'budget' && userBudget <= 500) return true;
  if (value === 'moderate' && userBudget > 500 && userBudget <= 1000) return true;
  if (value === 'luxury' && userBudget > 1000) return true;
  
  return false;
};

// 应用推荐预算
const applyRecommendedBudget = () => {
  if (!props.userPreferences?.budget) return;
  const userBudget = parseInt(props.userPreferences.budget);
  
  if (userBudget <= 500) selectBudget('budget');
  else if (userBudget > 1000) selectBudget('luxury');
  else selectBudget('moderate');
  
  ElMessage.success('已为您应用推荐预算');
};

const selectBudget = (value) => {
  emit('update:modelValue', value);
};

const calculateBudgetPreview = (budgetType) => {
  const travelers = props.travelers || 1;
  const days = props.days || 1;
  
  let perPersonPerDay = 0;
  if (budgetType === 'budget') perPersonPerDay = 400;
  else if (budgetType === 'moderate') perPersonPerDay = 750;
  else if (budgetType === 'luxury') perPersonPerDay = 1500;
  
  const total = perPersonPerDay * travelers * days;
  
  if (total >= 10000) {
    return `约 ${(total / 10000).toFixed(1)}万`;
  }
  return `约 ¥${total.toLocaleString()}`;
};
</script>

<style scoped>
.form-section {
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.section-title .el-icon {
  font-size: 22px;
  color: #409eff;
}

.section-subtitle {
  font-size: 13px;
  color: #909399;
  font-weight: normal;
  margin-left: 8px;
  background: #f4f4f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.budget-section {
  background: #fff;
}

.preference-hint-banner {
  display: flex;
  align-items: center;
  background: #f0f9eb;
  border: 1px solid #e1f3d8;
  color: #67c23a;
  padding: 8px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 13px;
  gap: 8px;
}

.budget-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.budget-card {
  position: relative;
  border: 2px solid #ebeef5;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.budget-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.budget-card.selected {
  border-color: #409eff;
  background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.2);
}

.budget-card.recommended {
  border-top-width: 4px;
  border-top-color: #67c23a;
}

.budget-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f2f6fc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 24px;
  color: #909399;
  transition: all 0.3s ease;
}

.budget-card.selected .budget-icon {
  background: #409eff;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(64, 158, 255, 0.3);
}

.budget-content {
  flex: 1;
}

.budget-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.budget-price {
  font-size: 15px;
  font-weight: 500;
  color: #409eff;
  margin-bottom: 8px;
}

.budget-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

.budget-preview {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-label {
  font-size: 12px;
  color: #909399;
}

.preview-amount {
  font-size: 14px;
  font-weight: 600;
  color: #f56c6c;
}

.budget-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.3s ease;
}

.budget-card.selected .budget-check {
  opacity: 1;
  transform: scale(1);
}

@media (max-width: 1024px) {
  .budget-selector {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .form-section {
    padding: 16px;
  }

  .budget-selector {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .budget-card {
    padding: 16px;
  }
}
</style>

