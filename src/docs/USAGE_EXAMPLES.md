# GoingTour 新架构使用示例

本文档展示如何使用重构后的 Composable + Service 架构进行开发。

## 📋 目录

- [🎯 核心概念](#核心概念)
- [✈️ 行程管理](#行程管理)
- [📝 草稿管理](#草稿管理)  
- [⚙️ 偏好设置](#偏好设置)
- [🏔️ 足迹管理](#足迹管理)
- [🌤️ 天气服务](#天气服务)
- [🤖 AI推荐](#ai推荐)
- [🔄 迁移指南](#迁移指南)

## 🎯 核心概念

### 架构模式
```javascript
// 新架构模式：Composable + Service
import { useTrip } from '@/composables/useTrip.js'        // 状态管理
import { tripService } from '@/services/tripService.js'  // 业务逻辑（可选直接使用）

// 旧架构模式：Store
import { useTripStore } from '@/store/trip.js'           // 全局状态
```

### 错误处理模式
```javascript
// 统一的返回格式
const result = await someOperation()
if (result.success) {
  console.log('操作成功:', result.data)
} else {
  console.error('操作失败:', result.message)
  // 错误已自动显示给用户
}
```

## ✈️ 行程管理

### 基础使用
```vue
<script setup>
import { onMounted } from 'vue'
import { useTrip } from '@/composables/useTrip.js'

// 获取完整的行程管理功能
const {
  tripList,
  currentTrip,
  loading,
  loadUserTrips,
  createTrip,
  updateTrip,
  deleteTrip
} = useTrip()

onMounted(() => {
  loadUserTrips()
})

// 创建新行程
const handleCreateTrip = async () => {
  const tripData = {
    title: '北京3天2夜',
    destination: 'beijing',
    destinationName: '北京',
    days: 3,
    travelers: 2,
    budget: 5000
  }
  
  const result = await createTrip(tripData)
  if (result.success) {
    console.log('行程创建成功:', result.data)
  }
}

// 删除行程
const handleDeleteTrip = async (tripId) => {
  const result = await deleteTrip(tripId)
  if (result.success) {
    console.log('行程删除成功')
    // 列表会自动更新
  }
}
</script>

<template>
  <div>
    <div v-if="loading.list">加载中...</div>
    
    <div v-for="trip in tripList" :key="trip.id" class="trip-card">
      <h3>{{ trip.title }}</h3>
      <p>{{ trip.destinationName }} · {{ trip.days }}天</p>
      <button @click="handleDeleteTrip(trip.id)">删除</button>
    </div>
    
    <button @click="handleCreateTrip">创建新行程</button>
  </div>
</template>
```

### 专用场景使用
```vue
<script setup>
// 行程创建页面 - 使用专用 composable
import { useTripCreation } from '@/composables/useTrip.js'

const {
  generatedTrip,
  generationProgress,
  isGenerating,
  generateAiTrip,
  saveAiTrip
} = useTripCreation()

// 生成AI行程
const handleGenerateTrip = async () => {
  const params = {
    destination: 'beijing',
    destinationName: '北京',
    days: 3,
    travelers: 2,
    budget: 5000,
    tripGoals: ['sightseeing', 'culture'],
    focusAreas: ['historical_sites', 'food_experience']
  }
  
  const result = await generateAiTrip(params)
  if (result.success) {
    console.log('AI行程生成成功:', result.data)
  }
}

// 保存AI行程
const handleSaveTrip = async () => {
  const result = await saveAiTrip(generatedTrip.value, {
    title: '自定义标题',
    feedbackRating: 5
  })
  
  if (result.success) {
    router.push(`/trip/${result.data.id}`)
  }
}
</script>

<template>
  <div>
    <button @click="handleGenerateTrip" :disabled="isGenerating">
      {{ isGenerating ? '生成中...' : '生成AI行程' }}
    </button>
    
    <div v-if="isGenerating">
      <p>{{ generationProgress.message }}</p>
      <div class="progress-bar">
        <div :style="{ width: generationProgress.percent + '%' }"></div>
      </div>
    </div>
    
    <div v-if="generatedTrip">
      <h3>{{ generatedTrip.title }}</h3>
      <button @click="handleSaveTrip">保存行程</button>
    </div>
  </div>
</template>
```

## 📝 草稿管理

### 基础草稿操作
```vue
<script setup>
import { useDraft } from '@/composables/useDraft.js'

const {
  draftList,
  currentDraft,
  loading,
  loadDraftList,
  saveDraft,
  loadDraft,
  deleteDraft
} = useDraft()

// 保存草稿
const handleSaveDraft = async () => {
  const formData = {
    currentStep: 2,
    baseForm: {
      destination: 'beijing',
      destinationName: '北京',
      days: 3
    },
    preferenceForm: {
      tripGoals: ['sightseeing'],
      pacePreference: 'balanced'
    }
  }
  
  const result = await saveDraft(formData, '北京旅行草稿')
  if (result.success) {
    console.log('草稿保存成功')
  }
}

// 加载草稿
const handleLoadDraft = async (draftId) => {
  const result = await loadDraft(draftId)
  if (result.success) {
    console.log('草稿加载成功:', result.data)
    // 可以将数据应用到表单
  }
}
</script>
```

### 自动保存功能
```vue
<script setup>
import { watch } from 'vue'
import { useDraft } from '@/composables/useDraft.js'

const { startAutoSave, stopAutoSave } = useDraft()

// 表单数据
const formData = reactive({
  baseForm: {},
  preferenceForm: {}
})

// 启动自动保存（每30秒）
onMounted(() => {
  startAutoSave(formData, 30000)
})

// 停止自动保存
onBeforeUnmount(() => {
  stopAutoSave()
})

// 监听表单变化，触发自动保存逻辑
watch(formData, () => {
  // 自动保存逻辑会在后台运行
}, { deep: true })
</script>
```

### 草稿列表管理
```vue
<script setup>
import { useDraftList } from '@/composables/useDraft.js'

const {
  draftList,          // 过滤后的草稿列表
  selectedDrafts,     // 选中的草稿
  searchKeyword,      // 搜索关键词
  sortOrder,          // 排序方式
  hasSelectedDrafts,  // 是否有选中项
  selectAllDrafts,    // 全选
  clearSelection,     // 清空选择
  batchDeleteSelected // 批量删除
} = useDraftList()

// 搜索草稿
const handleSearch = (keyword) => {
  searchKeyword.value = keyword
}

// 改变排序
const handleSort = (order) => {
  sortOrder.value = order // 'name', 'createdAt', 'updatedAt'
}

// 批量删除
const handleBatchDelete = async () => {
  const success = await batchDeleteSelected()
  if (success) {
    console.log('批量删除成功')
  }
}
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <input 
      v-model="searchKeyword" 
      placeholder="搜索草稿..."
    />
    
    <!-- 排序选择 -->
    <select v-model="sortOrder">
      <option value="updatedAt">按修改时间</option>
      <option value="createdAt">按创建时间</option>
      <option value="name">按名称</option>
    </select>
    
    <!-- 批量操作 -->
    <button 
      v-if="hasSelectedDrafts" 
      @click="handleBatchDelete"
    >
      删除选中 ({{ selectedDrafts.length }})
    </button>
    
    <!-- 草稿列表 -->
    <div v-for="draft in draftList" :key="draft.id">
      <input 
        type="checkbox" 
        :value="draft.id"
        v-model="selectedDrafts"
      />
      <span>{{ draft.name }}</span>
      <span>{{ draft.formattedDate }}</span>
    </div>
  </div>
</template>
```

## ⚙️ 偏好设置

### 基础偏好管理
```vue
<script setup>
import { usePreference } from '@/composables/usePreference.js'

const {
  tripPreferences,      // 当前行程偏好
  effectivePreferences, // 合并后的有效偏好
  preferenceOptions,    // 偏好选项配置
  updatePreference,     // 更新单个偏好
  updatePreferences,    // 批量更新偏好
  isComplete,          // 偏好是否完整
  completeness         // 完成度百分比
} = usePreference()

// 更新单个偏好
const handleUpdateGoals = (goals) => {
  updatePreference('tripGoals', goals)
}

// 批量更新偏好
const handleBatchUpdate = () => {
  updatePreferences({
    tripGoals: ['family', 'relaxation'],
    focusAreas: ['natural_scenery', 'food_experience'],
    pacePreference: 'slow'
  })
}
</script>

<template>
  <div>
    <!-- 进度显示 -->
    <div class="progress">
      偏好设置完成度：{{ completeness }}%
    </div>
    
    <!-- 旅行目标选择 -->
    <div>
      <h3>旅行目标</h3>
      <div v-for="option in preferenceOptions.tripGoals" :key="option.key">
        <label>
          <input 
            type="checkbox" 
            :value="option.key"
            v-model="tripPreferences.tripGoals"
          />
          {{ option.icon }} {{ option.name }}
          <small>{{ option.description }}</small>
        </label>
      </div>
    </div>
    
    <!-- 节奏偏好选择 -->
    <div>
      <h3>节奏偏好</h3>
      <div v-for="option in preferenceOptions.pacePreference" :key="option.key">
        <label>
          <input 
            type="radio" 
            :value="option.key"
            v-model="tripPreferences.pacePreference"
          />
          {{ option.icon }} {{ option.name }}
          <small>{{ option.description }}</small>
        </label>
      </div>
    </div>
  </div>
</template>
```

### 偏好表单向导
```vue
<script setup>
import { usePreferenceForm } from '@/composables/usePreference.js'

const {
  currentStep,        // 当前步骤
  steps,             // 所有步骤配置
  currentStepInfo,   // 当前步骤信息
  isLastStep,        // 是否最后一步
  canProceed,        // 是否可以继续
  nextStep,          // 下一步
  prevStep,          // 上一步
  validateCurrentStep // 验证当前步骤
} = usePreferenceForm()

// 下一步处理
const handleNext = () => {
  const validation = validateCurrentStep()
  if (validation.isValid) {
    nextStep()
  } else {
    ElMessage.error(validation.message)
  }
}
</script>

<template>
  <div class="preference-wizard">
    <!-- 步骤指示器 -->
    <div class="steps">
      <div 
        v-for="(step, index) in steps" 
        :key="step.key"
        :class="{ active: index === currentStep }"
      >
        {{ step.title }}
      </div>
    </div>
    
    <!-- 当前步骤内容 -->
    <div class="step-content">
      <h2>{{ currentStepInfo.title }}</h2>
      <p>{{ currentStepInfo.description }}</p>
      
      <!-- 动态渲染步骤内容 -->
      <component 
        :is="`Step${currentStepInfo.key}`"
        v-model="tripPreferences[currentStepInfo.field]"
      />
    </div>
    
    <!-- 导航按钮 -->
    <div class="navigation">
      <button 
        @click="prevStep" 
        :disabled="currentStep === 0"
      >
        上一步
      </button>
      
      <button 
        @click="handleNext"
        :disabled="!canProceed"
      >
        {{ isLastStep ? '完成' : '下一步' }}
      </button>
    </div>
  </div>
</template>
```

### 偏好摘要显示
```vue
<script setup>
import { usePreferenceSummary } from '@/composables/usePreference.js'

const {
  summary,                // 偏好摘要
  strategy,              // 推荐策略
  formatPreferenceValue, // 格式化偏好值
  getPreferenceIcon     // 获取偏好图标
} = usePreferenceSummary()
</script>

<template>
  <div class="preference-summary">
    <h3>偏好设置摘要</h3>
    
    <div class="summary-item">
      <span>旅行目标：</span>
      <span>{{ summary.goals }}</span>
    </div>
    
    <div class="summary-item">
      <span>重点体验：</span>
      <span>{{ summary.focus }}</span>
    </div>
    
    <div class="summary-item">
      <span>节奏偏好：</span>
      <span>{{ summary.pace }}</span>
    </div>
    
    <h4>推荐策略</h4>
    <ul>
      <li v-for="item in strategy" :key="item">{{ item }}</li>
    </ul>
  </div>
</template>
```

## 🏔️ 足迹管理

```vue
<script setup>
import { useFootprint } from '@/composables/useFootprint.js'

const {
  visitedCities,
  loading,
  visitedCount,
  loadVisitedCities,
  addVisitedCity,
  deleteVisitedCity,
  isCityVisited
} = useFootprint()

// 添加城市到足迹
const handleAddCity = async (cityData) => {
  const success = await addVisitedCity({
    cityCode: cityData.adcode,
    cityName: cityData.name,
    travelTime: '2024-03-15',
    travelFeeling: '非常棒的体验！',
    tags: ['美食', '文化']
  })
  
  if (success) {
    console.log('城市已添加到足迹')
  }
}

// 检查城市是否已访问
const checkCityStatus = (cityCode) => {
  return isCityVisited(cityCode)
}
</script>
```

## 🌤️ 天气服务

```vue
<script setup>
import { useWeather } from '@/composables/useWeather.js'

const {
  currentWeather,
  forecastWeather,
  weatherSummary,
  temperatureRange,
  getClothingRecommendation,
  fetchCompleteWeatherInfo,
  isLoading
} = useWeather()

// 获取完整天气信息
const handleGetWeather = async (city) => {
  const result = await fetchCompleteWeatherInfo(city)
  if (result.current) {
    console.log('当前天气:', result.current)
  }
  if (result.forecast) {
    console.log('天气预报:', result.forecast)
  }
}
</script>

<template>
  <div>
    <div v-if="isLoading">获取天气信息中...</div>
    
    <div v-if="weatherSummary">
      <h3>{{ weatherSummary.city }} 天气</h3>
      <p>{{ weatherSummary.weather }} {{ weatherSummary.temperature }}°C</p>
      <p>{{ weatherSummary.windInfo }}</p>
    </div>
    
    <div v-if="getClothingRecommendation">
      <h4>着装建议</h4>
      <p>{{ getClothingRecommendation.category }}</p>
      <ul>
        <li v-for="item in getClothingRecommendation.items" :key="item">
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>
```

## 🤖 AI推荐

```vue
<script setup>
import { useAiRecommendations } from '@/composables/useAiRecommendations.js'

const {
  recommendations,
  filteredRecommendations,
  isLoading,
  hasRecommendations,
  fetchRecommendations,
  updateFilters,
  getRecommendationReasoning
} = useAiRecommendations()

// 获取AI推荐
const handleGetRecommendations = async () => {
  const baseForm = {
    destinationName: '北京',
    days: 3,
    budget: 5000
  }
  
  const preferenceForm = {
    tripGoals: ['sightseeing'],
    focusAreas: ['historical_sites']
  }
  
  await fetchRecommendations(baseForm, preferenceForm)
}

// 更新筛选条件
const handleUpdateFilters = () => {
  updateFilters({
    priceRange: [0, 300],
    minRating: 4.0,
    attractionTypes: ['历史文化']
  })
}
</script>

<template>
  <div>
    <button @click="handleGetRecommendations">获取AI推荐</button>
    
    <div v-if="isLoading">AI正在为您生成推荐...</div>
    
    <div v-if="hasRecommendations">
      <h3>景点推荐</h3>
      <div v-for="attraction in filteredRecommendations.attractions" :key="attraction.id">
        <h4>{{ attraction.name }}</h4>
        <p>{{ attraction.description }}</p>
        <p v-if="attraction.isAiRecommended">
          AI推荐理由：{{ attraction.reasoning }}
        </p>
      </div>
      
      <h3>餐厅推荐</h3>
      <div v-for="restaurant in filteredRecommendations.restaurants" :key="restaurant.id">
        <h4>{{ restaurant.name }}</h4>
        <p>{{ restaurant.description }}</p>
        <p>菜系：{{ restaurant.cuisineType }}</p>
      </div>
    </div>
  </div>
</template>
```

## 🔄 迁移指南

### 从Store迁移到Composable

#### 旧方式 (Store)
```javascript
// 旧的Store方式
import { useTripStore } from '@/store/trip.js'

const tripStore = useTripStore()
await tripStore.fetchUserTrips(userId)
await tripStore.createTrip(userId, tripData)
```

#### 新方式 (Composable)
```javascript
// 新的Composable方式
import { useTrip } from '@/composables/useTrip.js'

const { loadUserTrips, createTrip } = useTrip()
await loadUserTrips()  // 自动获取userId
const result = await createTrip(tripData)  // 统一错误处理
```

### 优势对比

| 特性 | Store方式 | Composable方式 |
|------|-----------|----------------|
| 用户认证 | 手动传递userId | 自动检查和获取 |
| 错误处理 | 手动try/catch | 统一返回格式 |
| 缓存管理 | 需要手动实现 | 内置智能缓存 |
| 重试机制 | 需要手动实现 | 自动网络重试 |
| 代码复用 | 有限 | 高度可复用 |
| 类型安全 | 基础 | 完整JSDoc |

### 迁移步骤

1. **新功能使用新架构**
   ```javascript
   // 新页面直接使用
   import { useTrip } from '@/composables/useTrip.js'
   ```

2. **现有功能逐步迁移**
   ```javascript
   // 可以并存使用
   import { useTripStore } from '@/store/trip.js'      // 临时保留
   import { useTrip } from '@/composables/useTrip.js'  // 逐步替换
   ```

3. **完全迁移后清理**
   ```javascript
   // 最终只使用新架构
   import { useTrip } from '@/composables/useTrip.js'
   ```

---

## 📚 更多资源

- [模块重构总结文档](./MODULE_REFACTOR_SUMMARY.md)
- [Vue 3 Composition API 官方文档](https://v3.vuejs.org/guide/composition-api-introduction.html)
- [Pinia 状态管理文档](https://pinia.vuejs.org/)

---

*这些示例展示了新架构的强大功能和易用性。建议在新功能开发中优先使用这些模式。*
