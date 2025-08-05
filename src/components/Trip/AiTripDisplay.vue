<template>
  <div class="ai-trip-display">
    <!-- 行程标题卡片 -->
    <el-card class="trip-header-card" shadow="never">
      <div class="trip-header-content">
        <div class="trip-title-section">
          <div class="title-with-icon">
            <el-icon class="ai-icon" color="#409eff"><Cpu /></el-icon>
            <h1 class="trip-main-title">{{ tripTitle }}</h1>
          </div>
          <p class="trip-subtitle" v-if="tripData?.destinationInfo">
            AI为您精心规划的{{ tripData?.tripBasicInfo?.days || 3 }}天{{ tripData?.destinationInfo?.name || '智能' }}行程
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

    <!-- 完整的行程内容 -->
    <el-card class="content-card" shadow="hover">
      <div class="markdown-content" v-html="renderedContent"></div>
    </el-card>

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
          <el-button size="small" link @click="clearFeedback">
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
  Cpu, Calendar, User, Trophy, Timer, DocumentCopy, Folder, Share, 
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
  breaks: true
})

// 自定义渲染规则 - 优化行程展示
md.renderer.rules.strong_open = () => '<strong class="trip-highlight">'
md.renderer.rules.strong_close = () => '</strong>'

// 计算属性：从原始content解析标题
const tripTitle = computed(() => {
  if (!props.tripData?.content) return '智能行程计划'
  
  const content = props.tripData.content
  const titleMatch = content.match(/^### 📅 (.+)$/m)
  return titleMatch ? titleMatch[1] : `${props.tripData?.destinationInfo?.name || ''}智能行程计划`
})

// 计算属性：渲染完整的markdown内容
const renderedContent = computed(() => {
  if (!props.tripData?.content) return '<p>暂无行程数据</p>'
  return md.render(props.tripData.content)
})

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

/* 内容卡片 */
.content-card {
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
}

/* Markdown内容样式 */
.markdown-content {
  line-height: 1.8;
  color: #333;
  font-size: 16px;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin: 24px 0 16px 0;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
}

.markdown-content :deep(h1) {
  font-size: 32px;
  border-bottom: 3px solid #409eff;
  padding-bottom: 12px;
}

.markdown-content :deep(h2) {
  font-size: 28px;
  border-bottom: 2px solid #67c23a;
  padding-bottom: 10px;
}

.markdown-content :deep(h3) {
  font-size: 24px;
  border-left: 4px solid #e6a23c;
  padding-left: 16px;
}

.markdown-content :deep(h4) {
  font-size: 20px;
  border-left: 3px solid #f56c6c;
  padding-left: 12px;
  background: #fef0f0;
  padding: 8px 0 8px 12px;
  border-radius: 4px;
}

.markdown-content :deep(h5) {
  font-size: 18px;
  color: #409eff;
}

.markdown-content :deep(h6) {
  font-size: 16px;
  color: #909399;
}

.markdown-content :deep(p) {
  margin: 16px 0;
  line-height: 1.8;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 16px 0;
  padding-left: 32px;
}

.markdown-content :deep(li) {
  margin: 8px 0;
  line-height: 1.7;
}

.markdown-content :deep(ul li) {
  list-style-type: disc;
}

.markdown-content :deep(ol li) {
  list-style-type: decimal;
}

.markdown-content :deep(.trip-highlight) {
  background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%);
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 600;
  color: #333;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.markdown-content :deep(th) {
  background: #fafafa;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.markdown-content :deep(td) {
  font-size: 14px;
}

.markdown-content :deep(tr:hover) {
  background: #f8f9fa;
}

.markdown-content :deep(blockquote) {
  margin: 20px 0;
  padding: 16px 20px;
  border-left: 4px solid #409eff;
  background: #f0f9ff;
  border-radius: 0 8px 8px 0;
}

.markdown-content :deep(code) {
  background: #f1f2f3;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  color: #e74c3c;
}

.markdown-content :deep(pre) {
  background: #2d3748;
  color: #fff;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 20px 0;
}

.markdown-content :deep(pre code) {
  background: none;
  color: inherit;
  padding: 0;
}

.markdown-content :deep(hr) {
  border: none;
  height: 2px;
  background: linear-gradient(to right, #409eff, #67c23a);
  margin: 32px 0;
  border-radius: 1px;
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

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.feedback-content > * + * {
  margin-top: 20px;
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
  
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }
  
  .rating-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .markdown-content {
    font-size: 14px;
  }
  
  .markdown-content :deep(h1) {
    font-size: 24px;
  }
  
  .markdown-content :deep(h2) {
    font-size: 20px;
  }
  
  .markdown-content :deep(h3) {
    font-size: 18px;
  }
  
  .markdown-content :deep(h4) {
    font-size: 16px;
  }
}

/* 美化滚动条 */
.markdown-content :deep(*) {
  scrollbar-width: thin;
  scrollbar-color: #409eff #f1f1f1;
}

.markdown-content :deep(*::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

.markdown-content :deep(*::-webkit-scrollbar-track) {
  background: #f1f1f1;
  border-radius: 4px;
}

.markdown-content :deep(*::-webkit-scrollbar-thumb) {
  background: #409eff;
  border-radius: 4px;
}

.markdown-content :deep(*::-webkit-scrollbar-thumb:hover) {
  background: #337ecc;
}
</style>