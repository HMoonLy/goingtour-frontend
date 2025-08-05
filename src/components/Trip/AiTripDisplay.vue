<template>
  <div class="ai-trip-display">
    <!-- 头部信息卡片 -->
    <el-card class="trip-header-card" shadow="never">
      <div class="trip-header-content">
        <div class="trip-title-section">
          <div class="title-with-icon">
            <el-icon class="ai-icon" color="#409eff"><Cpu /></el-icon>
            <h1 class="trip-main-title">{{ structuredData?.title || '智能行程计划' }}</h1>
          </div>
          <p class="trip-subtitle" v-if="structuredData?.description">
            {{ cleanDescription(structuredData.description) }}
          </p>
        </div>
        
        <!-- 快速统计信息 -->
        <div class="trip-stats">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon color="#409eff"><Calendar /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ tripData?.tripBasicInfo?.days || 0 }}</div>
              <div class="stat-label">天数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon color="#67c23a"><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ tripData?.tripBasicInfo?.travelers || 0 }}</div>
              <div class="stat-label">人数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon color="#e6a23c"><Trophy /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ tripData?.qualityScore || 0 }}</div>
              <div class="stat-label">质量分</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon color="#f56c6c"><Timer /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ formatProcessingTime(tripData?.processingTime) }}</div>
              <div class="stat-label">用时</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 每日行程区域 -->
    <div class="daily-sections">
      <div 
        v-for="(day, index) in parsedDays" 
        :key="index"
        class="day-section"
      >
        <el-card class="day-card" shadow="hover">
          <!-- 日期头部 -->
          <template #header>
            <div class="day-header">
              <div class="day-number-badge">
                <span class="day-number">{{ index + 1 }}</span>
              </div>
              <div class="day-info">
                <h3 class="day-title">{{ day.title }}</h3>
                <div class="day-details">
                  <span class="day-theme" v-if="day.theme">
                    <el-icon><Star /></el-icon>
                    {{ day.theme }}
                  </span>
                  <span class="day-weather" v-if="day.weather">
                    <el-icon><Sunny /></el-icon>
                    {{ day.weather }}
                  </span>
                </div>
              </div>
            </div>
          </template>

          <!-- 日程内容 -->
          <div class="day-activities" v-html="day.contentHtml"></div>
        </el-card>
      </div>
    </div>

    <!-- 附加信息网格 -->
    <div class="info-grid">
      <!-- 预算分配卡片 -->
      <el-card 
        class="info-card budget-card" 
        v-if="structuredData?.budgetAllocation?.categories?.length" 
        shadow="hover"
      >
        <template #header>
          <div class="card-title">
            <el-icon color="#e6a23c"><Money /></el-icon>
            <span>预算分配</span>
          </div>
        </template>
        
        <div class="budget-summary" v-if="budgetTotal">
          <div class="budget-total-card">
            <div class="total-label">总预算</div>
            <div class="total-amount">{{ budgetTotal }}</div>
          </div>
        </div>
        
        <div class="budget-list">
          <div 
            v-for="(category, index) in structuredData.budgetAllocation.categories" 
            :key="index"
            class="budget-item"
          >
            <div class="budget-row">
              <span class="budget-category">{{ category.name }}</span>
              <span class="budget-amount">{{ category.amount }}</span>
            </div>
            <div class="budget-desc" v-if="category.description">
              {{ category.description }}
            </div>
          </div>
        </div>
      </el-card>

      <!-- 实用提示卡片 -->
      <el-card class="info-card tips-card" v-if="tipsHtml" shadow="hover">
        <template #header>
          <div class="card-title">
            <el-icon color="#f56c6c"><Warning /></el-icon>
            <span>实用提示</span>
          </div>
        </template>
        <div class="tips-content" v-html="tipsHtml"></div>
      </el-card>

      <!-- 必备物品卡片 -->
      <el-card class="info-card packing-card" v-if="packingItems.length" shadow="hover">
        <template #header>
          <div class="card-title">
            <el-icon color="#409eff"><Suitcase /></el-icon>
            <span>必备物品</span>
          </div>
        </template>
        <div class="packing-items">
          <el-tag 
            v-for="(item, index) in packingItems" 
            :key="index"
            class="packing-tag"
            size="small"
            type="info"
          >
            <el-icon><Check /></el-icon>
            {{ item }}
          </el-tag>
        </div>
      </el-card>

      <!-- 备选方案卡片 -->
      <el-card class="info-card backup-card" v-if="backupPlans.length" shadow="hover">
        <template #header>
          <div class="card-title">
            <el-icon color="#909399"><Cloudy /></el-icon>
            <span>备选方案</span>
          </div>
        </template>
        <div class="backup-list">
          <div v-for="(plan, index) in backupPlans" :key="index" class="backup-item">
            <el-icon class="backup-icon"><Right /></el-icon>
            <span>{{ plan }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 操作按钮区域 -->
    <el-card class="actions-card" shadow="never">
      <div class="action-buttons">
        <el-button @click="copyToClipboard" :loading="copying">
          <el-icon><DocumentCopy /></el-icon>
          复制行程
        </el-button>
        <el-button type="primary" @click="saveTrip" :loading="saving">
          <el-icon><Folder /></el-icon>
          保存行程
        </el-button>
        <el-button type="success" @click="shareTrip" :loading="sharing">
          <el-icon><Share /></el-icon>
          分享行程
        </el-button>
        <el-button type="warning" @click="regenerateTrip">
          <el-icon><Refresh /></el-icon>
          重新生成
        </el-button>
      </div>
    </el-card>

    <!-- 用户反馈区域 -->
    <el-card class="feedback-card" shadow="hover">
      <template #header>
        <div class="card-title">
          <el-icon color="#67c23a"><ChatDotSquare /></el-icon>
          <span>行程评价</span>
        </div>
      </template>
      
      <div class="feedback-content">
        <div class="rating-section">
          <span class="rating-label">整体满意度:</span>
          <el-rate
            v-model="userRating"
            :colors="['#F7BA2A', '#F7BA2A', '#F7BA2A']"
            @change="submitRating"
            show-text
            :texts="['很差', '一般', '还行', '不错', '很棒']"
          />
        </div>
        
        <el-input
          v-model="userFeedback"
          type="textarea"
          :rows="3"
          placeholder="对这个行程有什么建议或想法？（可选）"
          maxlength="200"
          show-word-limit
          class="feedback-input"
        />
        
        <div class="feedback-actions">
          <el-button size="small" @click="submitFeedback" :disabled="!userFeedback.trim()">
            提交反馈
          </el-button>
          <el-button size="small" type="text" @click="clearFeedback">
            清空
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Cpu, Calendar, User, Trophy, Timer, Star, Sunny, Money, Warning, 
  Suitcase, Check, Cloudy, Right, DocumentCopy, Folder, Share, 
  Refresh, ChatDotSquare
} from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'

const props = defineProps({
  tripData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save', 'share', 'regenerate'])

// 响应式数据
const copying = ref(false)
const saving = ref(false)
const sharing = ref(false)
const userRating = ref(0)
const userFeedback = ref('')

// 初始化Markdown解析器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

// 自定义渲染规则 - 符合项目风格
md.renderer.rules.strong_open = () => '<strong class="text-highlight">'
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
  
  // 尝试从分类中计算总预算
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
    !item.includes('深度游点睛建议') &&
    item.length < 50
  ).slice(0, 20) // 限制显示数量
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
    !plan.includes('→') &&
    plan.length > 5
  ).slice(0, 10) // 限制显示数量
})

// 工具函数：清理描述文本
const cleanDescription = (description) => {
  if (!description) return ''
  return description
    .replace(/\*{2}[^*]+\*{2}/g, '')
    .replace(/- \*{2}[^*]+\*{2}/g, '')
    .substring(0, 150) + (description.length > 150 ? '...' : '')
}

// 工具函数：格式化处理时间
const formatProcessingTime = (time) => {
  if (!time) return '0s'
  return time < 1000 ? `${time}ms` : `${Math.round(time / 1000)}s`
}

// 复制到剪贴板
const copyToClipboard = async () => {
  copying.value = true
  try {
    const content = props.tripData?.content || ''
    await navigator.clipboard.writeText(content)
    ElMessage.success('行程内容已复制到剪贴板！')
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage.error('复制失败，请手动选择复制')
  } finally {
    copying.value = false
  }
}

// 保存行程
const saveTrip = async () => {
  saving.value = true
  try {
    // 模拟保存操作
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('行程已保存到我的行程中！')
    emit('save', props.tripData)
  } catch (err) {
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 分享行程
const shareTrip = async () => {
  sharing.value = true
  try {
    // 模拟分享操作
    await new Promise(resolve => setTimeout(resolve, 800))
    ElMessage.success('分享链接已生成！')
    emit('share', props.tripData)
  } catch (err) {
    ElMessage.error('分享失败，请重试')
  } finally {
    sharing.value = false
  }
}

// 重新生成行程
const regenerateTrip = () => {
  ElMessageBox.confirm(
    '重新生成将覆盖当前行程，确定要继续吗？', 
    '确认重新生成', 
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      emit('regenerate')
    })
    .catch(() => {
      // 用户取消
    })
}

// 提交评分
const submitRating = () => {
  if (userRating.value > 0) {
    ElMessage.success(`感谢您的${userRating.value}星评价！`)
  }
}

// 提交反馈
const submitFeedback = () => {
  if (!userFeedback.value.trim()) return
  
  ElMessage.success('感谢您的宝贵反馈！')
  userFeedback.value = ''
}

// 清空反馈
const clearFeedback = () => {
  userFeedback.value = ''
  userRating.value = 0
}
</script>

<style scoped>
.ai-trip-display {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #fafafa;
}

/* 头部卡片 */
.trip-header-card {
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

.trip-header-card :deep(.el-card__body) {
  padding: 32px;
}

.trip-header-content {
  text-align: center;
}

.title-with-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.ai-icon {
  font-size: 32px;
}

.trip-main-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.trip-subtitle {
  font-size: 16px;
  color: #606266;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.trip-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  font-size: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

/* 每日行程区域 */
.daily-sections {
  margin-bottom: 32px;
}

.day-section {
  margin-bottom: 24px;
}

.day-card {
  border-radius: 12px;
  overflow: hidden;
}

.day-card :deep(.el-card__header) {
  background: #f0f9eb;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.day-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.day-number-badge {
  width: 48px;
  height: 48px;
  background: #67c23a;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  flex-shrink: 0;
}

.day-info {
  flex: 1;
}

.day-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.day-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.day-theme, .day-weather {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #606266;
}

/* 日程内容 */
.day-activities {
  padding: 24px;
  line-height: 1.8;
}

.day-activities :deep(h3) {
  color: #303133;
  font-size: 18px;
  font-weight: 600;
  margin: 20px 0 12px 0;
  padding-left: 12px;
  border-left: 3px solid #409eff;
}

.day-activities :deep(h4) {
  color: #606266;
  font-size: 16px;
  font-weight: 600;
  margin: 16px 0 8px 0;
}

.day-activities :deep(ul) {
  padding-left: 16px;
  margin: 12px 0;
}

.day-activities :deep(li) {
  margin: 8px 0;
  list-style-type: none;
  position: relative;
  color: #606266;
}

.day-activities :deep(li::before) {
  content: '•';
  color: #409eff;
  font-weight: bold;
  position: absolute;
  left: -16px;
}

.day-activities :deep(p) {
  margin: 12px 0;
  color: #606266;
}

.day-activities :deep(.text-highlight) {
  color: #409eff;
  font-weight: 600;
}

.day-activities :deep(em) {
  color: #909399;
  font-style: italic;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.info-card {
  border-radius: 12px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

/* 预算卡片 */
.budget-summary {
  margin-bottom: 20px;
}

.budget-total-card {
  background: #f0f7ff;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.total-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
  display: block;
}

.total-amount {
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
}

.budget-list {
  space-y: 12px;
}

.budget-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.budget-item:last-child {
  border-bottom: none;
}

.budget-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.budget-category {
  font-weight: 600;
  color: #303133;
}

.budget-amount {
  font-weight: 600;
  color: #e6a23c;
}

.budget-desc {
  font-size: 13px;
  color: #909399;
}

/* 实用提示 */
.tips-content :deep(h3) {
  color: #f56c6c;
  font-size: 16px;
  margin: 16px 0 8px 0;
}

.tips-content :deep(ul) {
  padding-left: 16px;
}

.tips-content :deep(li) {
  margin: 8px 0;
  color: #606266;
}

/* 必备物品 */
.packing-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.packing-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 备选方案 */
.backup-list {
  space-y: 8px;
}

.backup-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
  color: #606266;
  line-height: 1.5;
}

.backup-icon {
  color: #909399;
  margin-top: 2px;
  flex-shrink: 0;
}

/* 操作按钮 */
.actions-card {
  margin-bottom: 24px;
  border-radius: 12px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  min-width: 120px;
}

/* 反馈卡片 */
.feedback-card {
  border-radius: 12px;
}

.feedback-content {
  space-y: 20px;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.rating-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.feedback-input {
  margin: 16px 0;
}

.feedback-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-trip-display {
    padding: 16px;
  }
  
  .trip-header-card :deep(.el-card__body) {
    padding: 20px;
  }
  
  .trip-main-title {
    font-size: 24px;
  }
  
  .trip-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .stat-card {
    padding: 16px;
    flex-direction: column;
    text-align: center;
  }
  
  .day-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .day-details {
    justify-content: center;
  }
  
  .day-activities {
    padding: 16px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }
  
  .rating-section {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>