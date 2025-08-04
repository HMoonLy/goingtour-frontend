<template>
  <div class="ai-trip-display">
    <!-- 行程标题和元信息 -->
    <div class="trip-header">
      <div class="trip-title-section">
        <h2 class="trip-title">
          <el-icon><MapLocation /></el-icon>
          AI智能规划行程
        </h2>
        <div class="trip-meta">
          <el-tag type="success" size="large">
            <el-icon><Star /></el-icon>
            质量评分：{{ tripData?.qualityScore || 0 }}/100
          </el-tag>
          <el-tag type="info" size="large">
            <el-icon><Timer /></el-icon>
            生成用时：{{ Math.round((tripData?.processingTime || 0) / 1000) }}秒
          </el-tag>
          <el-tag type="primary" size="large">
            <el-icon><Cpu /></el-icon>
            {{ tripData?.aiProvider || 'AI' }}生成
          </el-tag>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="trip-actions">
        <el-button @click="copyToClipboard">
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
        <el-button @click="regenerateTrip">
          <el-icon><Refresh /></el-icon>
          重新生成
        </el-button>
      </div>
    </div>

    <!-- 行程内容展示 -->
    <el-card class="trip-content-card" shadow="hover">
      <div 
        class="markdown-content" 
        v-html="formatTripContent(tripData?.content || '')"
      ></div>
    </el-card>

    <!-- 行程统计信息 -->
    <div class="trip-stats">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon color="#409EFF"><Calendar /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ tripData?.tripBasicInfo?.days || 0 }}天</div>
            <div class="stat-label">行程天数</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon color="#67C23A"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ tripData?.tripBasicInfo?.travelers || 0 }}人</div>
            <div class="stat-label">出行人数</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon color="#E6A23C"><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ tripData?.tripBasicInfo?.budget || '未设置' }}</div>
            <div class="stat-label">预算范围</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon color="#F56C6C"><Location /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ tripData?.destinationInfo?.name || '未知' }}</div>
            <div class="stat-label">目的地</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户反馈区域 -->
    <el-card class="feedback-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>行程反馈</span>
          <el-rate
            v-model="userRating"
            :colors="rateColors"
            @change="submitRating"
          />
        </div>
      </template>
      
      <el-input
        v-model="userFeedback"
        type="textarea"
        :rows="3"
        placeholder="对这个行程计划有什么建议或感想？（可选）"
        maxlength="200"
        show-word-limit
      />
      
      <div class="feedback-actions">
        <el-button type="primary" @click="submitFeedback">
          <el-icon><ChatLineRound /></el-icon>
          提交反馈
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  MapLocation, Star, Timer, Cpu, DocumentCopy, 
  Folder, Share, Refresh, Calendar, User, Money, 
  Location, ChatLineRound
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  tripData: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['regenerate', 'save', 'share'])

// 响应式数据
const userRating = ref(0)
const userFeedback = ref('')
const rateColors = ref(['#99A9BF', '#F7BA2A', '#FF9900'])

// 格式化行程内容（Markdown转HTML）
const formatTripContent = (content) => {
  if (!content) return ''
  
  let html = content
    // 标题处理
    .replace(/### (.*?)(?=\n|$)/g, '<h3 class="content-h3">$1</h3>')
    .replace(/#### (.*?)(?=\n|$)/g, '<h4 class="content-h4">$1</h4>')
    .replace(/##### (.*?)(?=\n|$)/g, '<h5 class="content-h5">$1</h5>')
    .replace(/# (.*?)(?=\n|$)/g, '<h1 class="content-h1">$1</h1>')
    
    // 粗体处理
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // 列表处理
    .replace(/^\- (.*?)$/gm, '<li class="content-li">$1</li>')
    .replace(/^(\d+)\. (.*?)$/gm, '<li class="content-oli">$2</li>')
    
    // 表格处理（简化）
    .replace(/\|([^|\n]+)\|([^|\n]+)\|([^|\n]+)\|/g, 
      '<div class="table-row"><div class="table-cell">$1</div><div class="table-cell">$2</div><div class="table-cell">$3</div></div>')
    
    // 分隔线处理
    .replace(/^---$/gm, '<hr class="content-divider">')
    
    // 换行处理
    .replace(/\n\n/g, '</p><p class="content-p">')
    .replace(/\n/g, '<br>')
    
    // 表情符号突出显示
    .replace(/(📅|🎯|👥|💰|🏷️|🏨|🚶|🍽️|✅|❌|💡|🌧️|🎒|📍|🎫|♿|🕒)/g, 
      '<span class="emoji">$1</span>')
  
  // 包装段落
  if (!html.includes('<p')) {
    html = '<p class="content-p">' + html + '</p>'
  }
  
  // 包装列表
  html = html.replace(/(<li class="content-li">.*?<\/li>)/gs, '<ul class="content-ul">$1</ul>')
  html = html.replace(/(<li class="content-oli">.*?<\/li>)/gs, '<ol class="content-ol">$1</ol>')
  
  return html
}

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.tripData?.content || '')
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
  ElMessageBox.confirm(
    '重新生成将覆盖当前行程，确定要继续吗？',
    '确认重新生成',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    emit('regenerate')
  }).catch(() => {
    // 用户取消
  })
}

// 提交评分
const submitRating = (rating) => {
  console.log('用户评分:', rating)
  ElMessage.success(`感谢您的${rating}星评价！`)
}

// 提交反馈
const submitFeedback = () => {
  if (!userFeedback.value.trim()) {
    ElMessage.warning('请输入反馈内容')
    return
  }
  
  console.log('用户反馈:', {
    rating: userRating.value,
    feedback: userFeedback.value,
    tripId: props.tripData?.tripId
  })
  
  ElMessage.success('感谢您的反馈！')
  userFeedback.value = ''
}
</script>

<style scoped>
.ai-trip-display {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.trip-title-section {
  flex: 1;
}

.trip-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 15px 0;
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
}

.trip-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.trip-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.trip-content-card {
  margin-bottom: 30px;
  border-radius: 12px;
  overflow: hidden;
}

.markdown-content {
  line-height: 1.8;
  font-size: 16px;
  color: #333;
}

/* Markdown样式 */
.content-h1 {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 30px 0 20px 0;
  padding-bottom: 15px;
  border-bottom: 3px solid #3498db;
}

.content-h3 {
  font-size: 24px;
  font-weight: 600;
  color: #27ae60;
  margin: 25px 0 15px 0;
  padding-left: 15px;
  border-left: 4px solid #27ae60;
}

.content-h4 {
  font-size: 20px;
  font-weight: 600;
  color: #e74c3c;
  margin: 20px 0 12px 0;
}

.content-h5 {
  font-size: 18px;
  font-weight: 500;
  color: #8e44ad;
  margin: 15px 0 10px 0;
}

.content-p {
  margin: 15px 0;
  color: #555;
  text-align: justify;
}

.content-ul, .content-ol {
  margin: 15px 0 15px 20px;
  padding-left: 20px;
}

.content-li, .content-oli {
  margin: 8px 0;
  color: #555;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #ddd;
  background: #f8f9fa;
  margin: 5px 0;
}

.table-cell {
  flex: 1;
  padding: 12px 15px;
  border-right: 1px solid #ddd;
  font-weight: 500;
}

.table-cell:last-child {
  border-right: none;
}

.content-divider {
  margin: 30px 0;
  border: none;
  border-top: 2px solid #ecf0f1;
}

.emoji {
  font-size: 18px;
  margin: 0 4px;
}

/* 统计卡片 */
.trip-stats {
  margin: 30px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 40px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
}

/* 反馈卡片 */
.feedback-card {
  margin-top: 30px;
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.feedback-actions {
  margin-top: 15px;
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-trip-display {
    padding: 15px;
  }
  
  .trip-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .trip-actions {
    width: 100%;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .trip-title {
    font-size: 24px;
  }
}
</style>