<template>
  <div class="form-section">
    <div class="section-title">
      <el-icon>
        <MapLocation />
      </el-icon>
      <span>基本信息</span>
    </div>

    <div class="section-content">
      <el-row :gutter="24">

        <!-- 目的地 -->
        <el-col :span="12">
          <el-form-item label="目的地" prop="destination">
            <el-input :model-value="modelValue.destinationName" size="large" disabled placeholder="搜索城市、地区..."
              style="width: 100%" />
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
            <div class="days-input-container" style="width: 100%">
              <el-input-number v-model="days" :min="1" :max="365" size="large" placeholder="请输入或根据日期计算"
                style="width: 100%" @change="handleDaysChange" />
              <div v-if="modelValue.days" class="days-description">
                <span class="days-text">{{ getDaysDescription(modelValue.days) }}</span>
              </div>
              <div class="form-tip">输入天数可自动调整结束日期</div>
            </div>
          </el-form-item>
        </el-col>
      </el-row>


      <el-row :gutter="24">
        <!-- 日期范围 -->
        <el-col :span="12">
          <el-form-item label="行程时间" prop="dateRange" :error="dateRangeError">
            <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" size="large" style="width: 100%" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
              :disabled-date="disabledDate" :clearable="true" @change="handleDateChange" />
            <div class="form-tip">
              <template v-if="dateRange && dateRange.length === 2">
                <div class="date-info">
                  <span class="date-match">
                    <el-icon>
                      <Check />
                    </el-icon>
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
            <el-input-number v-model="travelers" :min="1" :max="20" size="large" style="width: 100%" />
            <div class="form-tip">人数会影响餐厅和住宿推荐</div>
          </el-form-item>
        </el-col>
      </el-row>
    </div>
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

const emit = defineEmits(['update:modelValue', 'date-change', 'days-change']);

// 代理 modelValue 的属性
const dateRange = computed({
  get: () => props.modelValue.dateRange,
  set: (val) => emit('update:modelValue', { ...props.modelValue, dateRange: val })
});

const days = computed({
  get: () => props.modelValue.days,
  set: (val) => emit('update:modelValue', { ...props.modelValue, days: val })
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

const handleDaysChange = (val) => {
  emit('days-change', val);
};
</script>

<style scoped>
  .community-plaza {
    min-height: 100vh;
    background-color: #f8fafc; /* 稍微冷一点的灰，更有质感 */
  }
  
  /* Hero 区域：增加底部圆角，优化渐变 */
  .plaza-hero {
    /* 莫兰迪色系渐变，保持低饱和度 */
    background: linear-gradient(135deg, rgba(145, 168, 208, 0.18) 0%, rgba(247, 202, 201, 0.12) 100%);
    padding: 80px 20px 60px;
    text-align: center;
    /* 底部圆角，让头部和内容区分隔更柔和 */
    border-radius: 0 0 32px 32px;
    margin-bottom: 32px;
  }
  
  .hero-content h1 {
    font-size: 36px;
    margin-bottom: 16px;
    font-weight: 800;
    color: #2c3e50;
    letter-spacing: 1px;
  }
  
  .hero-content p {
    font-size: 16px;
    color: #606266;
    opacity: 0.8;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .plaza-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px 40px;
    /* 让内容向上浮动一点，产生重叠效果（可选，这里先保持分离） */
  }
  
  /* 工具栏优化：更干净的卡片风格 */
  .toolbar {
    background: white;
    padding: 24px 32px;
    border-radius: 16px;
    margin-bottom: 32px;
    box-shadow: 0 8px 24px rgba(145, 168, 208, 0.06); /* 更柔和的投影 */
    border: 1px solid rgba(255, 255, 255, 0.8);
  }
  
  .sort-tabs {
    margin-bottom: 24px;
  }
  
  /* --- Element Plus Tabs 深度定制 --- */
  /* 移除默认的灰色底线 */
  :deep(.el-tabs__nav-wrap::after) {
    display: none !important;
  }
  
  /* Tab 文字样式优化 */
  :deep(.el-tabs__item) {
    font-size: 16px;
    color: #909399;
    padding: 0 24px !important; /* 增加点击区域 */
    font-weight: 500;
    transition: all 0.3s ease;
  }
  
  /* 选中状态：更大、更黑、更重 */
  :deep(.el-tabs__item.is-active) {
    font-size: 18px;
    font-weight: 700;
    color: #303133;
  }
  
  /* 底部指示条：变成一个小短横线/圆点风格 */
  :deep(.el-tabs__active-bar) {
    height: 4px;
    border-radius: 2px;
    background-color: #91a8d0; /* 主题色 */
    bottom: 0px;
    /* 配合 padding 可能会显得长，但 Element 计算宽度是基于 item 的 */
  }
  
  /* 标签筛选区 */
  .tags-filter {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px dashed #ebeef5; /* 添加虚线分割，增加层次 */
  }
  
  .filter-label {
    font-size: 14px;
    color: #909399;
    font-weight: 500;
    margin-right: 8px;
  }
  
  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  /* 标签样式：胶囊按钮风格 */
  .filter-tag {
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
    background-color: #f5f7fa;
    color: #606266;
    border-radius: 20px; /* 圆角胶囊 */
    padding: 6px 16px;
    height: auto;
    line-height: 1.4;
    font-size: 13px;
  }
  
  .filter-tag:hover {
    transform: translateY(-1px);
    background-color: white;
    border-color: #91a8d0;
    color: #91a8d0;
    box-shadow: 0 2px 8px rgba(145, 168, 208, 0.15);
  }
  
  /* 选中状态的 Tag */
  .filter-tag.el-tag--dark {
    background: #91a8d0;
    color: white;
    border-color: #91a8d0;
    box-shadow: 0 4px 12px rgba(145, 168, 208, 0.3);
  }
  
  /* 列表网格 */
  .posts-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    margin-bottom: 32px;
  }
  
  @media (max-width: 1024px) {
    .posts-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  @media (max-width: 768px) {
    .posts-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .toolbar {
      padding: 16px;
    }
  }
  
  @media (max-width: 480px) {
    .posts-grid {
      grid-template-columns: 1fr;
    }
  }
  
  /* 分页器美化 */
  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 40px;
    padding-bottom: 40px;
  }
  
  :deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
    background-color: #91a8d0 !important;
  }
  
  :deep(.el-pagination.is-background .el-pager li:hover) {
    color: #91a8d0;
  }
  </style>
