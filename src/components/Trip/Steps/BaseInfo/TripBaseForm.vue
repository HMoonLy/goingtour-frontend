<template>
  <div class="form-section">
    <div class="section-title">
      <el-icon><MapLocation /></el-icon>
      <span>基本信息</span>
    </div>

    <el-row :gutter="24">
      <!-- 目的地 -->
      <el-col :span="12">
        <el-form-item label="目的地" prop="destination">
          <el-input
            :model-value="modelValue.destinationName"
            size="large"
            disabled
            placeholder="搜索城市、地区..."
          />
          <div class="selected-city-info">
            <el-tag type="success" size="small">
              已选择: {{ modelValue.destinationName }}
            </el-tag>
          </div>
        </el-form-item>
      </el-col>

      <!-- 天数 -->
      <el-col :span="12">
        <el-form-item label="出行天数" prop="days">
          <div class="days-input-container">
            <el-input-number
              :model-value="modelValue.days"
              :min="1"
              :max="365"
              size="large"
              disabled
              placeholder="根据日期自动计算"
            />
            <div v-if="modelValue.days" class="days-description">
              <span class="days-text">{{ getDaysDescription(modelValue.days) }}</span>
            </div>
            <div class="form-tip">天数将根据您选择的日期范围自动计算</div>
          </div>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <!-- 日期范围 -->
      <el-col :span="12">
        <el-form-item label="行程时间" prop="dateRange" :error="dateRangeError">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="large"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
            :clearable="true"
            @change="handleDateChange"
          />
          <div class="form-tip">
            <template v-if="dateRange && dateRange.length === 2">
              <div class="date-info">
                <span class="date-match">
                  <el-icon><Check /></el-icon>
                  已选择日期范围：{{ formatDateRange() }}
                </span>
              </div>
            </template>
            <template v-else> 请选择您计划出行的日期范围 </template>
          </div>
        </el-form-item>
      </el-col>

      <!-- 人数 -->
      <el-col :span="12">
        <el-form-item label="人数" prop="travelers">
          <el-input-number
            v-model="travelers"
            :min="1"
            :max="20"
            size="large"
            style="width: 100%"
          />
          <div class="form-tip">人数会影响餐厅和住宿推荐</div>
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { MapLocation, Check } from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  dateRangeError: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'date-change']);

// 代理 modelValue 的属性
const dateRange = computed({
  get: () => props.modelValue.dateRange,
  set: (val) => emit('update:modelValue', { ...props.modelValue, dateRange: val })
});

const travelers = computed({
  get: () => props.modelValue.travelers,
  set: (val) => emit('update:modelValue', { ...props.modelValue, travelers: val })
});

// 工具函数
const getDaysDescription = (days) => {
  if (!days) return "";
  if (days <= 2) return "短途微度假";
  if (days <= 4) return "小长假休闲";
  if (days <= 7) return "深度体验游";
  return "长途探索之旅";
};

const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7;
};

const formatDateRange = () => {
  if (!dateRange.value || dateRange.value.length !== 2) return "";
  return `${dateRange.value[0]} 至 ${dateRange.value[1]} (${props.modelValue.days}天)`;
};

const handleDateChange = (val) => {
  emit('date-change', val);
};
</script>

<style scoped>
.form-section {
  padding: 0;
  background: #fff;
  border: none;
  box-shadow: none;
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

.days-input-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.days-text {
  font-size: 12px;
  color: #409eff;
  background: #ecf5ff;
  padding: 2px 8px;
  border-radius: 4px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  margin-top: 4px;
}

.selected-city-info {
  margin-top: 8px;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-match {
  color: #67c23a;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .form-section {
    padding: 16px;
  }
}
</style>

