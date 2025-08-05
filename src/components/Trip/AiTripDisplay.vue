<template>
  <div class="ai-trip-display">
    <!-- 顶部信息卡片 -->
    <div class="trip-header">
      <div class="header-content">
        <div class="trip-title-section">
          <h1 class="trip-title">
            <el-icon class="title-icon"><Cpu /></el-icon>
            {{ structuredData?.title || '智能行程计划' }}
          </h1>
          <p class="trip-description" v-if="structuredData?.description">
            {{ cleanDescription(structuredData.description) }}
          </p>
        </div>
        
        <!-- 快速信息统计 -->
        <div class="quick-stats">
          <div class="stat-item">
            <div class="stat-value">{{ tripData?.tripBasicInfo?.days || 0 }}</div>
            <div class="stat-label">天数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ tripData?.tripBasicInfo?.travelers || 0 }}</div>
            <div class="stat-label">人数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ tripData?.qualityScore || 0 }}</div>
            <div class="stat-label">质量分</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 每日行程 - Markdown渲染 -->
    <div class="daily-itineraries">
      <div 
        v-for="(day, index) in parsedDays" 
        :key="index"
        class="day-section"
      >
        <!-- 日期标题 -->
        <div class="day-header">
          <div class="day-badge">
            <span class="day-number">{{ index + 1 }}</span>
          </div>
          <div class="day-title-content">
            <h2 class="day-title">{{ day.title }}</h2>
            <div class="day-meta">
              <span class="day-theme" v-if="day.theme">{{ day.theme }}</span>
              <span class="day-weather" v-if="day.weather">{{ day.weather }}</span>
            </div>
          </div>
        </div>

        <!-- 当日活动 - 渲染Markdown -->
        <div class="day-content" v-html="day.contentHtml"></div>
      </div>
    </div>

    <!-- 附加信息区域 -->
    <div class="additional-info">
      <!-- 预算分配 - 使用结构化数据 -->
      <el-card class="info-card budget-card" v-if="structuredData?.budgetAllocation?.categories?.length" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Money /></el-icon>
            <span>预算分配建议</span>
          </div>
        </template>
        
        <div class="budget-total" v-if="budgetTotal">
          <span class="total-label">总预算:</span>
          <span class="total-amount">{{ budgetTotal }}</span>
        </div>
        
        <div class="budget-categories">
          <div 
            v-for="(category, index) in structuredData.budgetAllocation.categories" 
            :key="index"
            class="budget-item"
          >
            <div class="budget-item-header">
              <span class="category-name">{{ category.name }}</span>
              <span class="category-amount">{{ category.amount }}</span>
            </div>
            <p class="category-description" v-if="category.description">
              {{ category.description }}
            </p>
          </div>
        </div>
      </el-card>

      <!-- 实用提示 - Markdown渲染 -->
      <el-card class="info-card tips-card" v-if="tipsHtml" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Warning /></el-icon>
            <span>实用出行提示</span>
          </div>
        </template>
        <div class="tips-content" v-html="tipsHtml"></div>
      </el-card>

      <!-- 必备物品清单 - 混合渲染 -->
      <el-card class="info-card packing-card" v-if="packingItems.length" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Suitcase /></el-icon>
            <span>必备物品清单</span>
          </div>
        </template>
        <div class="packing-grid">
          <div 
            v-for="(item, index) in packingItems" 
            :key="index"
            class="packing-item"
          >
            <el-icon><Check /></el-icon>
            <span>{{ item }}</span>
          </div>
        </div>
      </el-card>

      <!-- 备选方案 - 混合渲染 -->
      <el-card class="info-card backup-card" v-if="backupPlans.length" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Cloudy /></el-icon>
            <span>备选方案</span>
          </div>
        </template>
        <ul class="backup-list">
          <li v-for="(plan, index) in backupPlans" :key="index">
            {{ plan }}
          </li>
        </ul>
      </el-card>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="default" @click="copyToClipboard">
        <el-icon><DocumentCopy /></el-icon>
        复制行程
      </el-button>
      <el-button type="primary" @click="saveTrip">
        <el-icon><Folder /></el-icon>
        保存行程
      </el-button>
      <el-button type="success" @click="shareTrip">
        <el-icon><Share /></el-icon>
        分享行程
      </el-button>
      <el-button type="warning" @click="regenerateTrip">
        <el-icon><Refresh /></el-icon>
        重新生成
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Cpu, Money, Warning, Check, Cloudy, DocumentCopy, 
  Folder, Share, Refresh, Suitcase
} from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'

const props = defineProps({
  tripData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save', 'share', 'regenerate'])

// 初始化Markdown解析器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

// 自定义渲染规则
md.renderer.rules.strong_open = () => '<strong class="highlight">'
md.renderer.rules.strong_close = () => '</strong>'

// 计算属性：结构化数据
const structuredData = computed(() => {
  return props.tripData?.structuredData || null
})

// 计算属性：解析每日行程
const parsedDays = computed(() => {
  if (!props.tripData?.content) return []
  
  const content = props.tripData.content
  const days = []
  
  // 正则匹配每一天的内容
  const dayPattern = /#### \*{2}Day (\d+)：([^*]+)\*{2}([\s\S]*?)(?=#### \*{2}Day \d+|### 💰|$)/g
  let match
  
  while ((match = dayPattern.exec(content)) !== null) {
    const dayNumber = match[1]
    const dayTitle = match[2].trim()
    const dayContent = match[3].trim()
    
    // 提取主题和天气信息
    const themeMatch = dayContent.match(/\*{2}主题[：:]([^*]+)\*{2}/)
    const weatherMatch = dayContent.match(/\*{2}天气提示\*{2}[：:]([^\\n]+)/)
    
    // 清理内容，移除主题和天气行
    let cleanContent = dayContent
      .replace(/\*{2}主题[：:][^*]+\*{2}/, '')
      .replace(/\*{2}天气提示\*{2}[：:][^\\n]+/, '')
      .trim()
    
    // 将Markdown转换为HTML
    const contentHtml = md.render(cleanContent)
    
    days.push({
      number: dayNumber,
      title: `Day ${dayNumber}：${dayTitle}`,
      theme: themeMatch ? themeMatch[1].trim() : '',
      weather: weatherMatch ? weatherMatch[1].trim() : '',
      contentHtml: contentHtml
    })
  }
  
  return days
})

// 计算属性：预算总计
const budgetTotal = computed(() => {
  const categories = structuredData.value?.budgetAllocation?.categories
  if (!categories?.length) return null
  
  // 尝试从分类中计算总预算，或使用固定值
  const amounts = categories.map(cat => {
    const match = cat.amount?.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  })
  
  const total = amounts.reduce((sum, amount) => sum + amount, 0)
  return total > 0 ? `${total}元` : '约4500元'
})

// 计算属性：实用提示HTML
const tipsHtml = computed(() => {
  if (!props.tripData?.content) return ''
  
  const content = props.tripData.content
  const tipsMatch = content.match(/### 💡 \*{2}实用出行提示\*{2}([\s\S]*?)(?=###|$)/)
  
  if (tipsMatch) {
    return md.render(tipsMatch[1].trim())
  }
  
  return ''
})

// 计算属性：物品清单
const packingItems = computed(() => {
  const items = structuredData.value?.packingList || []
  return items.filter(item => 
    item && 
    item !== '必备物品清单' && 
    item !== '--' && 
    !item.includes('✨') &&
    !item.includes('深度游点睛建议')
  )
})

// 计算属性：备选方案
const backupPlans = computed(() => {
  const plans = structuredData.value?.backupPlans || []
  return plans.filter(plan => 
    plan && 
    plan !== '雨天备选方案' && 
    plan !== '--' && 
    plan !== '替换景点：' && 
    plan !== '室内体验：' &&
    !plan.includes('→')
  )
})

// 清理描述文本
const cleanDescription = (description) => {
  if (!description) return ''
  return description
    .replace(/\*{2}[^*]+\*{2}/g, '')
    .replace(/- \*{2}[^*]+\*{2}/g, '')
    .substring(0, 200) + (description.length > 200 ? '...' : '')
}

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    const content = props.tripData?.content || ''
    await navigator.clipboard.writeText(content)
    ElMessage.success('行程内容已复制到剪贴板！')
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage.error('复制失败，请手动选择复制')
  }
}

// 保存行程
const saveTrip = () => {
  ElMessage.success('保存功能开发中...')
  emit('save', props.tripData)
}

// 分享行程
const shareTrip = () => {
  ElMessage.success('分享功能开发中...')
  emit('share', props.tripData)
}

// 重新生成行程
const regenerateTrip = () => {
  ElMessageBox.confirm('重新生成将覆盖当前行程，确定要继续吗？', '确认重新生成', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      emit('regenerate')
    })
    .catch(() => {
      // 用户取消
    })
}
</script>

<style scoped>
.ai-trip-display {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* 顶部信息卡片 */
.trip-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  color: white;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
}

.trip-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
}

.header-content {
  position: relative;
  z-index: 2;
}

.trip-title-section {
  text-align: center;
  margin-bottom: 24px;
}

.trip-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 36px;
  color: #fff;
}

.trip-description {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  line-height: 1.6;
}

.quick-stats {
  display: flex;
  justify-content: center;
  gap: 48px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  display: block;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
  margin-top: 4px;
}

/* 每日行程 */
.daily-itineraries {
  margin-bottom: 32px;
}

.day-section {
  margin-bottom: 40px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.day-header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 24px;
  color: white;
  display: flex;
  align-items: center;
  gap: 20px;
}

.day-badge {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.day-number {
  font-size: 20px;
  font-weight: 700;
}

.day-title-content {
  flex: 1;
}

.day-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.day-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  opacity: 0.9;
}

.day-theme {
  font-weight: 500;
}

.day-weather {
  font-style: italic;
}

/* Markdown内容样式 */
.day-content {
  padding: 24px;
  line-height: 1.8;
}

.day-content :deep(h3) {
  color: #303133;
  font-size: 18px;
  font-weight: 600;
  margin: 20px 0 12px 0;
  padding-left: 12px;
  border-left: 4px solid #409eff;
}

.day-content :deep(h4) {
  color: #606266;
  font-size: 16px;
  font-weight: 600;
  margin: 16px 0 8px 0;
}

.day-content :deep(ul) {
  padding-left: 20px;
  margin: 12px 0;
}

.day-content :deep(li) {
  margin: 8px 0;
  list-style-type: none;
  position: relative;
}

.day-content :deep(li::before) {
  content: '•';
  color: #409eff;
  font-weight: bold;
  position: absolute;
  left: -16px;
}

.day-content :deep(p) {
  margin: 12px 0;
  color: #606266;
}

.day-content :deep(.highlight) {
  background: linear-gradient(45deg, #409eff, #67c23a);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
}

.day-content :deep(em) {
  color: #909399;
  font-style: italic;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 附加信息区域 */
.additional-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.info-card {
  border: none;
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

/* 预算卡片 */
.budget-total {
  padding: 16px;
  background: #f0f7ff;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
}

.total-label {
  font-size: 14px;
  color: #666;
  margin-right: 8px;
}

.total-amount {
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
}

.budget-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.budget-item:last-child {
  border-bottom: none;
}

.budget-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.category-name {
  font-weight: 600;
  color: #303133;
}

.category-amount {
  font-weight: 600;
  color: #409eff;
}

.category-description {
  font-size: 13px;
  color: #666;
  margin: 0;
}

/* 提示内容 */
.tips-content :deep(h3) {
  color: #e6a23c;
  font-size: 16px;
  margin: 16px 0 8px 0;
}

.tips-content :deep(ul) {
  padding-left: 16px;
}

.tips-content :deep(li) {
  margin: 6px 0;
  color: #606266;
}

/* 必备物品网格 */
.packing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.packing-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f0f7ff;
  border-radius: 6px;
  font-size: 14px;
}

/* 备选方案列表 */
.backup-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.backup-list li {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  padding-left: 24px;
}

.backup-list li:last-child {
  border-bottom: none;
}

.backup-list li::before {
  content: '🌧️';
  position: absolute;
  left: 0;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
}

.action-buttons .el-button {
  padding: 12px 24px;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-trip-display {
    padding: 16px;
  }
  
  .trip-header {
    padding: 24px 20px;
  }
  
  .trip-title {
    font-size: 24px;
  }
  
  .quick-stats {
    gap: 24px;
  }
  
  .day-header {
    padding: 20px;
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .day-badge {
    margin: 0 auto;
  }
  
  .day-content {
    padding: 16px;
  }
  
  .additional-info {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>