<template>
  <el-card class="section" shadow="never">
    <template #header>
      <div class="section-header">
        <el-icon><Money /></el-icon>
        <div>
          <div class="section-title">旅行预算水平</div>
          <div class="section-desc">
            影响住宿、餐厅、景点和交通方式的推荐
          </div>
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
            selected: modelValue === budget.value,
            recommended: budget.value === 'moderate',
          }"
          @click="$emit('update:modelValue', budget.value)"
        >
          <div class="budget-header">
            <span class="budget-name">{{ budget.name }}</span>
            <span v-if="budget.value === 'moderate'" class="recommend-tag"
              >推荐</span
            >
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
</template>

<script>
import { computed } from "vue";
import { Money } from "@element-plus/icons-vue";
import { PERSONAL_PROFILE_OPTIONS } from "@/utils/data/travelDataSystem.js";

export default {
  name: "BudgetSection",
  components: { Money },
  props: {
    modelValue: {
      type: String,
      default: "moderate",
    },
  },
  emits: ["update:modelValue"],
  setup() {
    // 获取预算示例
    const getBudgetExamples = (budgetType) => {
      const examples = {
        budget: "青旅、快餐、公共交通、免费景点",
        moderate: "三星酒店、特色餐厅、地铁+出租车",
        comfort: "四星酒店、精品餐厅、专车接送",
        luxury: "五星酒店、米其林餐厅、私人定制",
      };
      return examples[budgetType] || "";
    };

    const budgetLevelOptions = computed(() => {
      const baseOptions = Object.entries(
        PERSONAL_PROFILE_OPTIONS.budgetLevel.options
      ).map(([key, value]) => ({
        value: key,
        ...value,
      }));

      // 扩展预算选项，添加更详细的说明
      return baseOptions.map((option) => ({
        ...option,
        examples: getBudgetExamples(option.value),
      }));
    });

    return {
      budgetLevelOptions,
    };
  },
};
</script>

<style scoped>
.section {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.section :deep(.el-card__header) {
  background: linear-gradient(
    90deg,
    rgba(145, 168, 208, 0.12),
    rgba(247, 202, 201, 0.06)
  );
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

.item-help {
  color: #909399;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
}

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

@media (max-width: 768px) {
  .budget-options {
    flex-direction: column;
  }
}
</style>

