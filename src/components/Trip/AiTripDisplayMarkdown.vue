<template>
  <div class="ai-trip-display-md">
    <!-- 行程标题卡片 -->
    <el-card class="trip-header-card" shadow="never">
      <div class="trip-header">
        <div class="header-content">
          <div class="title-section">
            <el-icon class="ai-icon" color="#409eff"><Cpu /></el-icon>
            <h1 class="trip-title">{{ tripTitle }}</h1>
          </div>
          <p class="trip-subtitle">AI为您精心规划的智能行程</p>
        </div>
        
        <div class="trip-stats">
          <div class="stat-card">
            <el-icon color="#1890ff"><Calendar /></el-icon>
            <div class="stat-info">
              <span class="stat-value">{{ dailyPlansHtml.length }}</span>
              <span class="stat-label">天行程</span>
            </div>
          </div>
          <div class="stat-card">
            <el-icon color="#52c41a"><Suitcase /></el-icon>
            <div class="stat-info">
              <span class="stat-value">AI</span>
              <span class="stat-label">智能规划</span>
            </div>
          </div>
          <div class="stat-card">
            <el-icon color="#faad14"><Star /></el-icon>
            <div class="stat-info">
              <span class="stat-value">个性化</span>
              <span class="stat-label">定制推荐</span>
            </div>
          </div>
          <div class="stat-card">
            <el-icon color="#722ed1"><Trophy /></el-icon>
            <div class="stat-info">
              <span class="stat-value">优质</span>
              <span class="stat-label">精选体验</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 每日行程 - 使用markdown渲染 -->
    <div class="daily-itinerary">
      <div 
        v-for="(day, dayIndex) in dailyPlansHtml"
        :key="dayIndex"
        class="day-section"
      >
        <el-card class="day-card markdown-day" shadow="hover">
          <template #header>
            <div class="day-header">
              <div class="day-info">
                <h2 class="day-title">{{ day.title }}</h2>
              </div>
              <div class="day-stats">
                <span class="day-number">第{{ day.number }}天</span>
              </div>
            </div>
          </template>
          
          <div class="markdown-content" v-html="day.html"></div>
        </el-card>
      </div>
    </div>

    <!-- 附加信息网格 -->
    <div class="info-grid">
      <!-- 预算分配卡片 -->
      <el-card 
        class="info-card budget-card" 
        v-if="additionalInfoHtml.budget" 
        shadow="hover"
      >
        <template #header>
          <div class="card-title">
            <el-icon color="#e6a23c"><Money /></el-icon>
            <span>预算分配</span>
          </div>
        </template>
        
        <div class="markdown-content" v-html="additionalInfoHtml.budget"></div>
      </el-card>

      <!-- 实用提示卡片 -->
      <el-card class="info-card tips-card" v-if="additionalInfoHtml.tips" shadow="hover">
        <template #header>
          <div class="card-title">
            <el-icon color="#722ed1"><Star /></el-icon>
            <span>实用提示</span>
          </div>
        </template>
        <div class="markdown-content" v-html="additionalInfoHtml.tips"></div>
      </el-card>

      <!-- 打包清单卡片 -->
      <el-card class="info-card packing-card" v-if="additionalInfoHtml.packing" shadow="hover">
        <template #header>
          <div class="card-title">
            <el-icon color="#13c2c2"><Suitcase /></el-icon>
            <span>打包清单</span>
          </div>
        </template>
        <div class="markdown-content" v-html="additionalInfoHtml.packing"></div>
      </el-card>

      <!-- 备选方案卡片 -->
      <el-card class="info-card backup-card" v-if="additionalInfoHtml.backup" shadow="hover">
        <template #header>
          <div class="card-title">
            <el-icon color="#52c41a"><Refresh /></el-icon>
            <span>备选方案</span>
          </div>
        </template>
        <div class="markdown-content" v-html="additionalInfoHtml.backup"></div>
      </el-card>
    </div>

    <!-- 操作按钮 -->
    <el-card class="actions-card" shadow="never">
      <div class="actions">
        <el-button 
          type="primary" 
          size="large"
          :loading="saving"
          @click="handleSave"
        >
          <el-icon><DocumentCopy /></el-icon>
          保存行程
        </el-button>
        
        <el-button 
          type="success" 
          size="large"
          :loading="sharing"
          @click="handleShare"
        >
          <el-icon><Share /></el-icon>
          分享行程
        </el-button>
        
        <el-button 
          size="large"
          :loading="copied"
          @click="handleCopy"
        >
          <el-icon><Folder /></el-icon>
          {{ copied ? '已复制' : '复制内容' }}
        </el-button>
        
        <el-button 
          size="large"
          @click="handleRegenerate"
        >
          <el-icon><Refresh /></el-icon>
          重新生成
        </el-button>
      </div>
    </el-card>

    <!-- 反馈区域 -->
    <el-card class="feedback-card" shadow="hover">
      <template #header>
        <div class="card-title">
          <el-icon color="#f5222d"><ChatDotSquare /></el-icon>
          <span>行程反馈</span>
        </div>
      </template>
      
      <div class="feedback-content">
        <div class="rating-section">
          <label>对这个行程的评分：</label>
          <el-rate
            v-model="userRating"
            :colors="['#ff9900', '#ff9900', '#ff6600']"
            show-text
            size="large"
          />
        </div>
        
        <div class="feedback-section">
          <label>您的意见和建议：</label>
          <el-input
            v-model="userFeedback"
            type="textarea"
            :rows="3"
            placeholder="请分享您对这个行程的想法，或者需要调整的地方..."
            maxlength="500"
            show-word-limit
          />
        </div>
        
        <div class="feedback-actions">
          <el-button type="primary" @click="submitFeedback">
            <el-icon><ChatDotSquare /></el-icon>
            提交反馈
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useClipboard } from '@vueuse/core'
import {
  Cpu, Calendar, User, Trophy, Timer, Star, Sunny, Money, Warning, 
  Suitcase, Cloudy, DocumentCopy, Folder, Share, 
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
const saving = ref(false)
const sharing = ref(false)
const userRating = ref(0)
const userFeedback = ref('')

// 剪贴板功能
const { copy, copied } = useClipboard()

// 初始化Markdown解析器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
})

// 自定义渲染规则 - 优化行程展示
md.renderer.rules.strong_open = () => '<strong class="trip-highlight">'
md.renderer.rules.strong_close = () => '</strong>'

// 自定义列表渲染
md.renderer.rules.list_item_open = (tokens, idx) => {
  return '<li class="trip-list-item">'
}

// 自定义标题渲染
md.renderer.rules.heading_open = (tokens, idx) => {
  const token = tokens[idx]
  const level = token.tag.slice(1)
  return `<${token.tag} class="trip-heading trip-h${level}">`
}

// 计算属性：从原始content解析标题
const tripTitle = computed(() => {
  if (!props.tripData?.content) return '智能行程计划'
  
  const content = props.tripData.content
  const titleMatch = content.match(/^### 📅 (.+)$/m)
  return titleMatch ? titleMatch[1] : '智能行程计划'
})

// 计算属性：分离的每日行程HTML
const dailyPlansHtml = computed(() => {
  if (!props.tripData?.content) return []
  
  const content = props.tripData.content
  const days = []
  
  // 正则匹配每一天的内容
  const dayPattern = /#### \*{2}Day (\d+)：([^*]+)\*{2}([\s\S]*?)(?=#### \*{2}Day \d+|### 💰|$)/g
  let match
  
  while ((match = dayPattern.exec(content)) !== null) {
    const dayNumber = parseInt(match[1])
    const dayTitle = match[2].trim()
    const dayContent = match[3].trim()
    
    // 渲染这一天的markdown内容
    const dayMarkdown = `${dayContent}`
    
    days.push({
      number: dayNumber,
      title: `Day ${dayNumber}：${dayTitle}`,
      html: md.render(dayMarkdown)
    })
  }
  
  return days
})

// 提取附加信息部分
const additionalInfoHtml = computed(() => {
  if (!props.tripData?.content) return {}
  
  const content = props.tripData.content
  const sections = {}
  
  // 提取预算分配
  const budgetMatch = content.match(/### 💰 \*{2}预算分配[^\\n]*\*{2}([\s\S]*?)(?=###|$)/)
  if (budgetMatch) {
    sections.budget = md.render(budgetMatch[1].trim())
  }
  
  // 提取实用提示
  const tipsMatch = content.match(/### 💡 \*{2}实用[^*]*提示\*{2}([\s\S]*?)(?=###|$)/)
  if (tipsMatch) {
    sections.tips = md.render(tipsMatch[1].trim())
  }
  
  // 提取打包清单
  const packingMatch = content.match(/### 🧳 \*{2}[^*]*清单\*{2}([\s\S]*?)(?=###|$)/)
  if (packingMatch) {
    sections.packing = md.render(packingMatch[1].trim())
  }
  
  // 提取备选方案
  const backupMatch = content.match(/### 🔄 \*{2}备选方案\*{2}([\s\S]*?)(?=###|$)/)
  if (backupMatch) {
    sections.backup = md.render(backupMatch[1].trim())
  }
  
  return sections
})

// 操作函数
const handleSave = () => {
  saving.value = true
  // 这里模拟保存操作
  setTimeout(() => {
    saving.value = false
    emit('save', props.tripData)
    ElMessage.success('行程已保存')
  }, 1000)
}

const handleShare = () => {
  sharing.value = true
  // 这里模拟分享操作
  setTimeout(() => {
    sharing.value = false
    emit('share', props.tripData)
    ElMessage.success('分享链接已生成')
  }, 1000)
}

const handleCopy = async () => {
  if (props.tripData?.content) {
    await copy(props.tripData.content)
    ElMessage.success('内容已复制到剪贴板')
  }
}

const handleRegenerate = () => {
  ElMessageBox.confirm(
    '重新生成将丢失当前行程，确定要继续吗？',
    '确认重新生成',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    emit('regenerate')
  })
}

const submitFeedback = () => {
  if (!userRating.value && !userFeedback.value.trim()) {
    ElMessage.warning('请至少提供评分或文字反馈')
    return
  }
  
  // 这里处理反馈提交
  ElMessage.success('感谢您的反馈！')
  userRating.value = 0
  userFeedback.value = ''
}
</script>

<style scoped>
.ai-trip-display-md {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 头部卡片样式 */
.trip-header-card {
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.header-content {
  flex: 1;
  min-width: 300px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.ai-icon {
  font-size: 32px;
}

.trip-title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.2;
}

.trip-subtitle {
  margin: 0;
  font-size: 16px;
  color: #666;
  font-weight: 400;
}

.trip-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  min-width: 120px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #666;
  line-height: 1;
  margin-top: 2px;
}

/* 每日行程样式 */
.daily-itinerary {
  margin-bottom: 24px;
}

.day-section {
  margin-bottom: 16px;
}

.day-card {
  border-radius: 12px;
  overflow: hidden;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.day-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.day-number {
  background: #409eff;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* Markdown内容样式 */
.markdown-content {
  line-height: 1.8;
  color: #333;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin: 16px 0 8px 0;
  font-weight: 600;
  color: #1a1a1a;
}

.markdown-content :deep(h4) {
  font-size: 16px;
  border-left: 4px solid #409eff;
  padding-left: 12px;
  margin-bottom: 12px;
}

.markdown-content :deep(p) {
  margin: 12px 0;
  line-height: 1.7;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 12px 0;
  padding-left: 24px;
}

.markdown-content :deep(li) {
  margin: 6px 0;
  line-height: 1.6;
}

.markdown-content :deep(.trip-highlight) {
  background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  color: #333;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.markdown-content :deep(th) {
  background: #fafafa;
  font-weight: 600;
  color: #333;
}

/* 信息网格样式 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.info-card {
  border-radius: 12px;
  overflow: hidden;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1a1a1a;
}

/* 操作按钮样式 */
.actions-card {
  margin-bottom: 24px;
  border-radius: 12px;
}

.actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

/* 反馈区域样式 */
.feedback-card {
  border-radius: 12px;
  overflow: hidden;
}

.feedback-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.rating-section,
.feedback-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-section label,
.feedback-section label {
  font-weight: 500;
  color: #333;
}

.feedback-actions {
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-trip-display-md {
    padding: 16px;
  }
  
  .trip-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .trip-stats {
    width: 100%;
    justify-content: space-between;
  }
  
  .stat-card {
    flex: 1;
    min-width: 0;
    justify-content: center;
  }
  
  .actions {
    justify-content: stretch;
  }
  
  .actions .el-button {
    flex: 1;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>