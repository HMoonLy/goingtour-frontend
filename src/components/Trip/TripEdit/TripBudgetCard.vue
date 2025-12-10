<template>
  <el-card v-if="!isReadOnly" class="budget-card" shadow="never">
    <template #header>
      <div class="card-header">
        <el-icon class="header-icon">
          <Money />
        </el-icon>
        <span>预算设置</span>
      </div>
    </template>
    <el-form-item label="总预算">
      <el-input-number
        v-model="localBudget"
        :min="0"
        :precision="2"
        controls-position="right"
        placeholder="请输入预算"
        style="width: 200px"
      />
      <span class="budget-unit">元</span>
    </el-form-item>
  </el-card>
</template>

<script setup>
import { computed } from "vue";
import { Money } from "@element-plus/icons-vue";

const props = defineProps({
  isReadOnly: Boolean,
  modelValue: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["update:modelValue"]);

const localBudget = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>

<style scoped>
.budget-card {
  margin: 0 auto 24px auto !important;
  border-radius: 12px !important;
  border: 1px solid #e2e8f0 !important;
  background: #ffffff !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06) !important;
  width: 100% !important;
  max-width: 1200px !important;
}

.budget-card :deep(.el-card__body) {
  padding: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  color: #2d3748;
}

.header-icon {
  font-size: 18px;
  color: #91a8d0;
}

.budget-unit {
  margin-left: 8px;
  color: #718096;
  font-size: 14px;
}

@media (max-width: 768px) {
  .budget-card {
    margin: 0 auto 16px auto !important;
    padding: 16px !important;
  }
}
</style>

