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
              {{ calculateBudgetPreview(option.avgCost) }}
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
import { computed } from 'vue';
import { Money, Star, Check, Setting, Coffee } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { PERSONAL_PROFILE_OPTIONS } from '@/utils/data/travelDataSystem';

const props = defineProps({
  modelValue: String,
  days: Number,
  travelers: Number,
  userPreferences: Object
});

const emit = defineEmits(['update:modelValue']);

// 从统一数据系统生成选项
const budgetOptions = computed(() => {
  const options = PERSONAL_PROFILE_OPTIONS.budgetLevel.options;
  return Object.entries(options).map(([key, value]) => ({
    value: key,
    title: value.name,
    price: value.range,
    description: value.description,
    icon: value.icon,
    avgCost: value.avgCost
  }));
});

// 是否为推荐预算
const isRecommendedBudget = (value) => {
  if (!props.userPreferences?.budget) return false;
  const userBudget = parseInt(props.userPreferences.budget);
  
  if (value === 'budget' && userBudget <= 300) return true;
  if (value === 'moderate' && userBudget > 300 && userBudget <= 500) return true;
  if (value === 'comfort' && userBudget > 500 && userBudget <= 800) return true;
  if (value === 'luxury' && userBudget > 800) return true;
  
  return false;
};

// 应用推荐预算
const applyRecommendedBudget = () => {
  if (!props.userPreferences?.budget) return;
  const userBudget = parseInt(props.userPreferences.budget);
  
  if (userBudget <= 300) selectBudget('budget');
  else if (userBudget <= 500) selectBudget('moderate');
  else if (userBudget <= 800) selectBudget('comfort');
  else selectBudget('luxury');
  
  ElMessage.success('已为您应用推荐预算');
};

const selectBudget = (value) => {
  emit('update:modelValue', value);
};

const calculateBudgetPreview = (avgCost) => {
  const travelers = props.travelers || 1;
  const days = props.days || 1;
  
  const total = avgCost * travelers * days;
  
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
  border: 1px solid #e4e7ed;
  border-radius: 16px;
  box-shadow: none;
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
  padding-bottom: 0;
  border-bottom: none;
}

.section-title .el-icon {
  font-size: 30px;
  color: var(--el-color-primary);
  background: transparent;
  padding: 0;
  border-radius: 0;
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

/* .budget-section {} */

.budget-selector {
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
 gap: 20px;
 width:100%;
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
  border-color: var(--el-color-primary);
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}

.budget-card.selected {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  box-shadow: var(--shadow-md);
}

.budget-card.recommended {
  border-top-width: 4px;
  border-top-color: var(--el-color-success);
}

.budget-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 24px;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.budget-card.selected .budget-icon {
  background: var(--el-color-primary);
  color: white;
  transform: scale(1.1);
  box-shadow: var(--shadow-sm);
}

.budget-content {
  flex: 1;
}

.budget-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.budget-price {
  font-size: 15px;
  font-weight: 500;
  color: var(--el-color-primary);
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
  color: var(--el-color-danger);
}

.budget-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--el-color-primary);
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
