<!--
🎯 智能筛选组件
基于用户偏好的动态推荐筛选
-->

<template>
  <div class="smart-filters">
    <!-- 筛选头部 -->
    <div class="filters-header">
      <div class="header-left">
        <el-icon class="filter-icon"><Filter /></el-icon>
        <h3 class="filters-title">智能筛选</h3>
        <div class="filter-status">
          <el-tag 
            v-if="activeFiltersCount > 0" 
            type="primary" 
            size="small"
            class="active-count-tag"
          >
            {{ activeFiltersCount }}个筛选条件
          </el-tag>
          <el-tag 
            v-if="filteredItemsCount !== null"
            type="success" 
            size="small"
            effect="plain"
            class="result-count-tag"
          >
            {{ filteredItemsCount }}个结果
          </el-tag>
        </div>
      </div>
      <div class="header-right">
        <!-- 筛选预设 -->
        <el-dropdown 
          v-if="filterPresets.length > 0"
          trigger="click"
          @command="applyFilterPreset"
        >
          <el-button size="small" text type="primary">
            <el-icon><Collection /></el-icon>
            预设筛选
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="preset in filterPresets"
                :key="preset.id"
                :command="preset"
              >
                <div class="preset-item">
                  <span class="preset-name">{{ preset.name }}</span>
                  <span class="preset-desc">{{ preset.description }}</span>
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <el-button 
          v-if="activeFiltersCount > 0"
          size="small" 
          type="info" 
          text
          @click="clearAllFilters"
        >
          <el-icon><RefreshLeft /></el-icon>
          清除筛选
        </el-button>
        
        <el-button 
          size="small"
          type="primary"
          text
          @click="toggleExpanded"
        >
          <el-icon>
            <ArrowDown v-if="!isExpanded" />
            <ArrowUp v-if="isExpanded" />
          </el-icon>
          {{ isExpanded ? '收起' : '展开' }}
        </el-button>
      </div>
    </div>

    <!-- 活跃筛选条件显示 -->
    <div v-if="activeFiltersCount > 0 && !isExpanded" class="active-filters">
      <div class="active-filters-title">
        <el-icon><Filter /></el-icon>
        <span>当前筛选:</span>
      </div>
      <div class="active-filters-list">
        <el-tag
          v-for="activeFilter in activeFilterTags"
          :key="activeFilter.key"
          closable
          type="primary"
          effect="dark"
          size="small"
          class="active-filter-tag"
          @close="removeFilter(activeFilter)"
        >
          {{ activeFilter.label }}
        </el-tag>
      </div>
    </div>

    <!-- 快速筛选标签 -->
    <div v-if="!isExpanded" class="quick-filters">
      <div class="quick-filters-title">快速筛选:</div>
      <el-tag
        v-for="filter in quickFilters"
        :key="filter.key"
        :type="isFilterActive(filter) ? 'primary' : 'info'"
        :effect="isFilterActive(filter) ? 'dark' : 'plain'"
        class="quick-filter-tag"
        @click="toggleQuickFilter(filter)"
      >
        <el-icon>{{ filter.icon }}</el-icon>
        {{ filter.label }}
      </el-tag>
    </div>

    <!-- 详细筛选面板 -->
    <el-collapse-transition>
      <div v-if="isExpanded" class="detailed-filters">
        <el-row :gutter="20">
          <!-- 价格区间 -->
          <el-col :span="12">
            <div class="filter-group">
              <label class="filter-label">
                <el-icon><Money /></el-icon>
                价格区间
              </label>
              <el-slider
                v-model="filters.priceRange"
                range
                :min="0"
                :max="1000"
                :step="50"
                :format-tooltip="formatPrice"
                @change="updateFilters"
              />
              <div class="price-range-display">
                ¥{{ filters.priceRange[0] }} - ¥{{ filters.priceRange[1] }}
              </div>
            </div>
          </el-col>

          <!-- 评分要求 -->
          <el-col :span="12">
            <div class="filter-group">
              <label class="filter-label">
                <el-icon><Star /></el-icon>
                最低评分
              </label>
              <el-rate
                v-model="filters.minRating"
                :max="5"
                :allow-half="true"
                show-score
                @change="updateFilters"
              />
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- 景点类型 -->
          <el-col :span="12">
            <div class="filter-group">
              <label class="filter-label">
                <el-icon><MapLocation /></el-icon>
                景点类型
              </label>
              <el-checkbox-group
                v-model="filters.attractionTypes"
                @change="updateFilters"
              >
                <el-checkbox
                  v-for="type in attractionTypeOptions"
                  :key="type.value"
                  :label="type.value"
                  class="filter-checkbox"
                >
                  {{ type.label }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </el-col>

          <!-- 菜系类型 -->
          <el-col :span="12">
            <div class="filter-group">
              <label class="filter-label">
                <el-icon><Bowl /></el-icon>
                菜系偏好
              </label>
              <el-checkbox-group
                v-model="filters.cuisineTypes"
                @change="updateFilters"
              >
                <el-checkbox
                  v-for="cuisine in cuisineTypeOptions"
                  :key="cuisine.value"
                  :label="cuisine.value"
                  class="filter-checkbox"
                >
                  {{ cuisine.label }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </el-col>
        </el-row>

        <!-- AI推荐优先级 -->
        <div class="filter-group">
          <label class="filter-label">
            <el-icon><MagicStick /></el-icon>
            AI推荐优先级
          </label>
          <el-radio-group
            v-model="filters.aiPriority"
            @change="updateFilters"
          >
            <el-radio-button label="all">全部显示</el-radio-button>
            <el-radio-button label="ai-first">AI推荐优先</el-radio-button>
            <el-radio-button label="ai-only">仅AI推荐</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 距离偏好 -->
        <div class="filter-group">
          <label class="filter-label">
            <el-icon><Position /></el-icon>
            距离偏好
          </label>
          <el-select
            v-model="filters.distancePreference"
            placeholder="选择距离偏好"
            @change="updateFilters"
          >
            <el-option label="不限制" value="" />
            <el-option label="市中心优先" value="city-center" />
            <el-option label="交通便利" value="transport-friendly" />
            <el-option label="景点集中" value="attractions-cluster" />
          </el-select>
        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Filter,
  RefreshLeft,
  ArrowDown,
  ArrowUp,
  Money,
  Star,
  MapLocation,
  Bowl,
  MagicStick,
  Position,
  Collection
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  recommendations: {
    type: Object,
    default: () => ({})
  },
  filteredItemsCount: {
    type: Number,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'filter-change'])

// 响应式数据
const isExpanded = ref(false)

// 筛选条件
const filters = ref({
  priceRange: [0, 500],
  minRating: 0,
  attractionTypes: [],
  cuisineTypes: [],
  aiPriority: 'all',
  distancePreference: '',
  ...props.modelValue
})

// 景点类型选项
const attractionTypeOptions = [
  { label: '历史文化', value: '历史文化' },
  { label: '自然风光', value: '自然风光' },
  { label: '现代建筑', value: '现代建筑' },
  { label: '主题公园', value: '主题公园' },
  { label: '博物馆', value: '博物馆' },
  { label: '购物中心', value: '购物中心' }
]

// 菜系类型选项
const cuisineTypeOptions = [
  { label: '川菜', value: '川菜' },
  { label: '粤菜', value: '粤菜' },
  { label: '京菜', value: '京菜' },
  { label: '湘菜', value: '湘菜' },
  { label: '西餐', value: '西餐' },
  { label: '日韩料理', value: '日韩料理' },
  { label: '小吃', value: '小吃' }
]

// 筛选预设
const filterPresets = [
  {
    id: 'budget-traveler',
    name: '经济出行',
    description: '高性价比推荐',
    filters: {
      priceRange: [0, 200],
      minRating: 3.5,
      aiPriority: 'ai-first',
      distancePreference: 'transport-friendly'
    }
  },
  {
    id: 'culture-lover',
    name: '文化爱好者',
    description: '历史文化景点优先',
    filters: {
      attractionTypes: ['历史文化', '博物馆'],
      minRating: 4,
      aiPriority: 'ai-first'
    }
  },
  {
    id: 'foodie',
    name: '美食探索',
    description: '特色餐厅推荐',
    filters: {
      cuisineTypes: ['川菜', '粤菜', '小吃'],
      minRating: 4,
      priceRange: [0, 300]
    }
  },
  {
    id: 'luxury',
    name: '品质之旅',
    description: '高端体验推荐',
    filters: {
      minRating: 4.5,
      priceRange: [300, 1000],
      aiPriority: 'ai-only'
    }
  }
]

// 快速筛选选项
const quickFilters = [
  {
    key: 'high-rating',
    label: '高评分',
    icon: '⭐',
    condition: () => filters.value.minRating >= 4
  },
  {
    key: 'budget-friendly',
    label: '经济实惠',
    icon: '💰',
    condition: () => filters.value.priceRange[1] <= 200
  },
  {
    key: 'ai-recommended',
    label: 'AI推荐',
    icon: '🤖',
    condition: () => filters.value.aiPriority === 'ai-only'
  },
  {
    key: 'cultural',
    label: '文化景点',
    icon: '🏛️',
    condition: () => filters.value.attractionTypes.includes('历史文化')
  }
]

// 计算属性
const activeFiltersCount = computed(() => {
  let count = 0
  
  if (filters.value.minRating > 0) count++
  if (filters.value.priceRange[0] > 0 || filters.value.priceRange[1] < 500) count++
  if (filters.value.attractionTypes.length > 0) count++
  if (filters.value.cuisineTypes.length > 0) count++
  if (filters.value.aiPriority !== 'all') count++
  if (filters.value.distancePreference) count++
  
  return count
})

const activeFilterTags = computed(() => {
  const tags = []
  
  if (filters.value.minRating > 0) {
    tags.push({
      key: 'minRating',
      label: `评分≥${filters.value.minRating}`,
      type: 'rating'
    })
  }
  
  if (filters.value.priceRange[0] > 0 || filters.value.priceRange[1] < 500) {
    tags.push({
      key: 'priceRange',
      label: `¥${filters.value.priceRange[0]}-${filters.value.priceRange[1]}`,
      type: 'price'
    })
  }
  
  filters.value.attractionTypes.forEach(type => {
    tags.push({
      key: `attraction-${type}`,
      label: type,
      type: 'attractionType',
      value: type
    })
  })
  
  filters.value.cuisineTypes.forEach(type => {
    tags.push({
      key: `cuisine-${type}`,
      label: type,
      type: 'cuisineType',
      value: type
    })
  })
  
  if (filters.value.aiPriority !== 'all') {
    const priorityLabels = {
      'ai-first': 'AI优先',
      'ai-only': '仅AI推荐'
    }
    tags.push({
      key: 'aiPriority',
      label: priorityLabels[filters.value.aiPriority],
      type: 'aiPriority'
    })
  }
  
  if (filters.value.distancePreference) {
    const distanceLabels = {
      'city-center': '市中心优先',
      'transport-friendly': '交通便利',
      'attractions-cluster': '景点集中'
    }
    tags.push({
      key: 'distancePreference',
      label: distanceLabels[filters.value.distancePreference],
      type: 'distance'
    })
  }
  
  return tags
})

// 方法
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const clearAllFilters = () => {
  filters.value = {
    priceRange: [0, 500],
    minRating: 0,
    attractionTypes: [],
    cuisineTypes: [],
    aiPriority: 'all',
    distancePreference: ''
  }
  updateFilters()
}

const isFilterActive = (filter) => {
  return filter.condition()
}

const toggleQuickFilter = (filter) => {
  switch (filter.key) {
    case 'high-rating':
      filters.value.minRating = isFilterActive(filter) ? 0 : 4
      break
    case 'budget-friendly':
      filters.value.priceRange = isFilterActive(filter) ? [0, 500] : [0, 200]
      break
    case 'ai-recommended':
      filters.value.aiPriority = isFilterActive(filter) ? 'all' : 'ai-only'
      break
    case 'cultural':
      if (isFilterActive(filter)) {
        filters.value.attractionTypes = filters.value.attractionTypes.filter(
          type => type !== '历史文化'
        )
      } else {
        filters.value.attractionTypes.push('历史文化')
      }
      break
  }
  updateFilters()
}

const formatPrice = (value) => {
  return `¥${value}`
}

const updateFilters = () => {
  emit('update:modelValue', { ...filters.value })
  emit('filter-change', { ...filters.value })
}

// 新增方法
const applyFilterPreset = (preset) => {
  filters.value = {
    ...filters.value,
    ...preset.filters
  }
  updateFilters()
}

const removeFilter = (filterTag) => {
  switch (filterTag.type) {
    case 'rating':
      filters.value.minRating = 0
      break
    case 'price':
      filters.value.priceRange = [0, 500]
      break
    case 'attractionType':
      filters.value.attractionTypes = filters.value.attractionTypes.filter(
        type => type !== filterTag.value
      )
      break
    case 'cuisineType':
      filters.value.cuisineTypes = filters.value.cuisineTypes.filter(
        type => type !== filterTag.value
      )
      break
    case 'aiPriority':
      filters.value.aiPriority = 'all'
      break
    case 'distance':
      filters.value.distancePreference = ''
      break
  }
  updateFilters()
}

// 监听props变化
watch(
  () => props.modelValue,
  (newValue) => {
    filters.value = { ...filters.value, ...newValue }
  },
  { deep: true }
)
</script>

<style scoped>
.smart-filters {
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.filter-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}

.active-count-tag {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.result-count-tag {
  font-weight: 600;
}

.filter-icon {
  color: #409eff;
}

.filters-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 活跃筛选条件 */
.active-filters {
  background: #f0f9ff;
  border: 1px solid #bae7ff;
  border-radius: 6px;
  padding: 12px;
  margin-top: 12px;
}

.active-filters-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 8px;
}

.active-filters-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.active-filter-tag {
  transition: all 0.3s ease;
}

.active-filter-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

/* 快速筛选 */
.quick-filters {
  margin-top: 12px;
}

.quick-filters-title {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
}

.quick-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-filter-tag {
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.quick-filter-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.detailed-filters {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
  font-size: 14px;
}

.price-range-display {
  text-align: center;
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
}

.filter-checkbox {
  display: block;
  margin-bottom: 8px;
}

/* 筛选预设 */
.preset-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preset-name {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.preset-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filters-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-right {
    width: 100%;
    justify-content: flex-end;
  }

  .quick-filters {
    justify-content: center;
  }

  .detailed-filters .el-col {
    margin-bottom: 16px;
  }
}
</style>
