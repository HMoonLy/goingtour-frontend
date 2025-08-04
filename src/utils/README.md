# 标签映射工具 (tagMapping.js)

## 概述

`tagMapping.js` 是一个统一的标签映射工具文件，用于管理所有组件中的英文到中文标签映射关系。这个工具解决了之前各个组件中重复定义标签映射的问题，提供了统一的接口和数据结构。

## 功能特性

### 1. 完整的标签映射表
- **旅行类型和兴趣**: nature, culture, relaxation, food, shopping 等
- **交通偏好**: public, walk, bicycle, car 等
- **住宿类型**: comfort, hotel, hostel, apartment 等
- **旅行节奏**: slow, medium, fast, relaxed 等
- **美食偏好**: spicy, sweet, sour, light, heavy 等
- **时间偏好**: morning, afternoon, evening, night 等

### 2. 专业映射表
- **体验重点映射** (`focusAreaMapping`): 按类别组织的体验重点标签
  - 文化体验类: historical_culture, art_culture, local_culture 等
  - 自然风光类: natural_scenery, nature, outdoor_adventure 等
  - 美食体验类: local_cuisine, food_experience, food 等
  - 都市生活类: urban_lifestyle, modern_technology, nightlife 等
  - 休闲娱乐类: shopping, entertainment, sports, photo_spots 等
- **饮食禁忌映射** (`dietaryRestrictionMapping`): 按类型组织的饮食禁忌
  - 宗教饮食: halal
  - 素食类型: vegetarian, vegan
  - 肉类禁忌: no_pork, no_beef, no_seafood
  - 口味禁忌: no_spicy
  - 健康饮食: gluten_free, no_alcohol
- **行程风格映射** (`tripStyleMapping`): relaxed, cultural, adventure, foodie 等
- **活动强度映射** (`intensityMapping`): relaxed, moderate, intensive 等
- **特殊体验映射** (`specialExperienceMapping`): local_events, workshops, performances 等

### 3. 城市信息数据库
- **一线城市**: 北京、上海、广州、深圳
- **历史文化名城**: 西安、南京、杭州、苏州
- **自然风光城市**: 成都、昆明、拉萨
- **海滨城市**: 青岛、大连、厦门
- 每个城市包含名称、描述、地区、特色特征等信息

### 4. 工具函数
- `translateTag(tag, type)`: 将单个英文标签转换为中文
- `translateTags(tags, type)`: 将标签数组转换为中文
- `translateTagsToString(tags, type, separator)`: 将标签数组转换为字符串
- `getBudgetText(budgetType)`: 获取预算文本描述
- `getCityName(cityCode, cityName)`: 获取城市名称
- `getCityInfo(cityCode)`: 获取城市详细信息
- `getCitiesByRegion(region)`: 根据地区获取城市列表
- `searchCitiesByFeature(feature)`: 根据特征搜索城市
- `getMappingTypes()`: 获取所有可用的映射类型
- `getMbtiName(type)`: 获取MBTI中文名称
- `getMbtiTravelDescription(type)`: 获取MBTI旅行偏好描述

## 使用方法

### 基本导入
```javascript
import { tagMapping, translateTag, translateTags } from '@/utils/tagMapping.js';
```

### 标签转换
```javascript
// 单个标签转换
const chineseTag = translateTag('nature'); // "自然风光"

// 数组标签转换
const chineseTags = translateTags(['nature', 'culture'], 'general'); // ["自然风光", "文化体验"]

// 数组转字符串
const chineseString = translateTagsToString(['nature', 'culture']); // "自然风光、文化体验"

// 特定类型转换
const focusArea = translateTag('historical_culture', 'focus'); // "历史文化"
const dietary = translateTag('vegetarian', 'dietary'); // "素食"

// 获取所有映射类型
const mappingTypes = getMappingTypes(); // [{ key: 'general', name: '通用标签', mapping: {...} }, ...]
```

### 预算文本
```javascript
import { getBudgetText } from '@/utils/tagMapping.js';

const budgetText = getBudgetText('moderate'); // "适中舒适(约750元/天)"
```

### 城市相关功能
```javascript
import { getCityName, getCityInfo, getCitiesByRegion, searchCitiesByFeature } from '@/utils/tagMapping.js';

// 获取城市名称
const cityName = getCityName('beijing', '北京'); // "北京"
const cityName2 = getCityName('beijing'); // "北京"

// 获取城市详细信息
const cityInfo = getCityInfo('beijing'); // { name: "北京", description: "...", region: "华北", features: [...] }

// 根据地区获取城市列表
const northCities = getCitiesByRegion('华北'); // [{ code: 'beijing', name: '北京', ... }]

// 根据特征搜索城市
const culturalCities = searchCitiesByFeature('历史文化'); // [{ code: 'beijing', name: '北京', ... }]
```

### MBTI相关
```javascript
import { getMbtiName, getMbtiTravelDescription } from '@/utils/tagMapping.js';

const mbtiName = getMbtiName('INTJ'); // "建筑师"
const description = getMbtiTravelDescription('INTJ'); // "您喜欢规划和设计..."
```

## 映射类型说明

| 类型 | 说明 | 示例 |
|------|------|------|
| `general` | 通用标签映射 | nature → "自然风光" |
| `focus` | 体验重点映射 | historical_culture → "历史文化" |
| `dietary` | 饮食禁忌映射 | vegetarian → "素食" |
| `style` | 行程风格映射 | relaxed → "放松休闲型" |
| `intensity` | 活动强度映射 | moderate → "适中平衡" |
| `experience` | 特殊体验映射 | local_events → "当地节庆活动" |

## 已更新的组件

1. **Preferences.vue** - 用户偏好设置页面
   - 使用 `getMbtiName` 和 `getMbtiTravelDescription`
   - 移除了重复的MBTI映射代码

2. **TripGeneration.vue** - 行程生成组件
   - 使用所有映射表和工具函数
   - 移除了重复的标签映射定义
   - 简化了城市名称和预算文本获取

3. **TripPreferences.vue** - 行程偏好设置组件
   - 使用 `tagMapping` 进行标签转换
   - 移除了重复的标签映射表

## 扩展指南

### 添加新的标签映射
1. 在相应的映射表中添加新的键值对
2. 如果是新的映射类型，在 `translateTag` 函数中添加对应的 case

### 添加新的城市信息
在 `cityInfoDatabase` 中添加新的城市信息：
```javascript
export const cityInfoDatabase = {
  // 现有城市...
  newcity: {
    name: "新城市",
    description: "城市描述",
  },
};
```

### 添加新的工具函数
1. 在文件末尾添加新函数
2. 在 `export default` 中导出新函数
3. 更新此文档说明新函数的使用方法

## 注意事项

1. **命名冲突**: 如果函数名与组件中的函数名冲突，使用 `as` 重命名导入
2. **类型安全**: 所有映射函数都包含默认值处理，避免未定义的标签导致错误
3. **性能优化**: 映射表是静态的，不会在运行时改变，可以安全地缓存
4. **维护性**: 所有映射关系集中管理，便于维护和更新

## 未来改进

1. **国际化支持**: 可以扩展支持多语言映射
2. **动态映射**: 支持从API获取映射数据
3. **类型定义**: 添加TypeScript类型定义
4. **缓存机制**: 添加映射结果缓存以提高性能 