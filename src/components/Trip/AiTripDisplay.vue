<template>
  <div class="ai-trip-display">
    <!-- 顶部渐变背景 -->
    <div class="display-header">
      <div class="header-content">
        <!-- 标题区域 -->
        <div class="title-section">
          <div class="title-badge">
            <el-icon class="badge-icon"><Cpu /></el-icon>
            <span>AI智能规划</span>
          </div>
          <h1 class="main-title">{{ tripData?.destinationInfo?.name || '未知目的地' }}行程计划</h1>
          <div class="quality-indicator">
            <div class="quality-score" :class="getQualityClass(tripData?.qualityScore)">
              <span class="score-value">{{ tripData?.qualityScore || 0 }}</span>
              <span class="score-max">/100</span>
            </div>
            <div class="quality-text">质量评分</div>
          </div>
        </div>

        <!-- 快速信息卡片 -->
        <div class="info-cards">
          <div class="info-card">
            <el-icon class="card-icon" color="#409EFF"><Calendar /></el-icon>
            <div class="card-content">
              <div class="card-value">{{ tripData?.tripBasicInfo?.days || 0 }}天</div>
              <div class="card-label">行程天数</div>
            </div>
          </div>
          <div class="info-card">
            <el-icon class="card-icon" color="#67C23A"><User /></el-icon>
            <div class="card-content">
              <div class="card-value">{{ tripData?.tripBasicInfo?.travelers || 0 }}人</div>
              <div class="card-label">出行人数</div>
            </div>
          </div>
          <div class="info-card">
            <el-icon class="card-icon" color="#E6A23C"><Timer /></el-icon>
            <div class="card-content">
              <div class="card-value">{{ Math.round((tripData?.processingTime || 0) / 1000) }}秒</div>
              <div class="card-label">生成用时</div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button class="action-btn" @click="copyToClipboard">
            <el-icon><DocumentCopy /></el-icon>
            复制行程
          </el-button>
          <el-button class="action-btn primary" @click="saveTrip">
            <el-icon><Folder /></el-icon>
            保存行程
          </el-button>
          <el-button class="action-btn success" @click="shareTrip">
            <el-icon><Share /></el-icon>
            分享行程
          </el-button>
          <el-button class="action-btn warning" @click="regenerateTrip">
            <el-icon><Refresh /></el-icon>
            重新生成
          </el-button>
        </div>
      </div>
    </div>

    <!-- 行程内容主体 -->
    <div class="trip-content">
      <div class="content-container">
        <div 
          class="enhanced-markdown" 
          v-html="formatTripContent(tripData?.content || '')"
        ></div>
      </div>
    </div>

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

// 获取质量评分样式类
const getQualityClass = (score) => {
  const numScore = Number(score) || 0
  if (numScore >= 90) return 'excellent'
  if (numScore >= 80) return 'good'
  if (numScore >= 70) return 'average'
  return 'poor'
}

// 增强的Markdown格式化函数
const formatTripContent = (content) => {
  if (!content) return '<div class="empty-content">暂无行程内容</div>'
  
  let html = content
    // 主标题处理 - 添加时间线样式
    .replace(/# (.*?)(?=\n|$)/g, '<h1 class="main-section-title"><span class="section-icon">🎯</span>$1</h1>')
    
    // 日期标题处理 - 创建时间线节点
    .replace(/## Day (\d+)：(.*?)(?=\n|$)/g, 
      '<div class="day-section"><div class="day-header"><div class="day-number">Day $1</div><div class="day-title">$2</div></div><div class="day-content">')
    .replace(/## (\d+)月(\d+)日[：:](.*?)(?=\n|$)/g, 
      '<div class="day-section"><div class="day-header"><div class="day-number">$1/$2</div><div class="day-title">$3</div></div><div class="day-content">')
    
    // 子标题处理 - 时间点和活动
    .replace(/### (.*?)(?=\n|$)/g, '<h3 class="activity-title"><span class="activity-icon">📍</span>$1</h3>')
    .replace(/#### (.*?)(?=\n|$)/g, '<h4 class="time-point"><span class="time-icon">🕒</span>$1</h4>')
    .replace(/##### (.*?)(?=\n|$)/g, '<h5 class="sub-activity">$1</h5>')
    
    // 粗体处理 - 重要信息高亮
    .replace(/\*\*(.*?)\*\*/g, '<strong class="highlight">$1</strong>')
    
    // 特殊标记处理
    .replace(/💰 预算分配建议/g, '<div class="budget-section"><h3 class="section-header"><span class="budget-icon">💰</span>预算分配建议</h3>')
    .replace(/⚠️ 实用出行提示/g, '<div class="tips-section"><h3 class="section-header"><span class="tips-icon">⚠️</span>实用出行提示</h3>')
    .replace(/🌧️ 备选方案/g, '<div class="backup-section"><h3 class="section-header"><span class="backup-icon">🌧️</span>备选方案</h3>')
    .replace(/🎒 必备物品清单/g, '<div class="checklist-section"><h3 class="section-header"><span class="checklist-icon">🎒</span>必备物品清单</h3>')
    
    // 列表处理 - 增强样式
    .replace(/^\- (.*?)$/gm, '<li class="enhanced-li">$1</li>')
    .replace(/^(\d+)\. (.*?)$/gm, '<li class="numbered-li"><span class="list-number">$1</span>$2</li>')
    
    // 表格处理 - 更好的样式
    .replace(/\|([^|\n]+)\|([^|\n]+)\|([^|\n]+)\|/g, 
      '<div class="info-table-row"><div class="table-cell">$1</div><div class="table-cell">$2</div><div class="table-cell">$3</div></div>')
    
    // 价格和费用突出显示
    .replace(/(\d+)元/g, '<span class="price">$1元</span>')
    .replace(/人均[：:](\d+)元/g, '人均：<span class="price-highlight">$1元</span>')
    
    // 时间突出显示
    .replace(/(\d{1,2}:\d{2})/g, '<span class="time-highlight">$1</span>')
    
    // 地点和景点突出显示
    .replace(/(门票[：:].*?元)/g, '<span class="ticket-info">$1</span>')
    
    // 分隔线处理
    .replace(/^---$/gm, '<div class="content-divider"></div>')
    
    // 换行处理
    .replace(/\n\n/g, '</p><p class="content-paragraph">')
    .replace(/\n/g, '<br>')
    
    // 表情符号处理 - 更大更突出
    .replace(/(📅|🎯|👥|💰|🏷️|🏨|🚶|🍽️|✅|❌|💡|🌧️|🎒|📍|🎫|♿|🕒|🌟|⭐|🎉|🎊)/g, 
      '<span class="emoji-enhanced">$1</span>')
  
  // 包装段落
  if (!html.includes('<p')) {
    html = '<p class="content-paragraph">' + html + '</p>'
  }
  
  // 包装列表
  html = html.replace(/(<li class="enhanced-li">.*?<\/li>)/gs, '<ul class="enhanced-ul">$1</ul>')
  html = html.replace(/(<li class="numbered-li">.*?<\/li>)/gs, '<ol class="numbered-ol">$1</ol>')
  
  // 闭合day-content标签
  html = html.replace(/(Day \d+|\/\d+).*?<\/div><\/div>/g, (match) => {
    return match + '</div></div>'
  })
  
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
/* ================================ 
   全新设计的行程展示样式
================================ */

.ai-trip-display {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 0;
}

/* ================================ 
   顶部Header区域 - 渐变背景设计
================================ */

.display-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 20px;
  color: white;
  position: relative;
  overflow: hidden;
}

.display-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* 标题区域 */
.title-section {
  text-align: center;
  margin-bottom: 40px;
}

.title-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
}

.badge-icon {
  font-size: 16px;
  color: #ffd700;
}

.main-title {
  font-size: 48px;
  font-weight: 700;
  margin: 20px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.5px;
}

.quality-indicator {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  padding: 20px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.quality-score {
  display: flex;
  align-items: baseline;
  gap: 2px;
  font-weight: 700;
}

.quality-score.excellent .score-value { color: #00ff88; font-size: 36px; }
.quality-score.good .score-value { color: #66d9ff; font-size: 36px; }
.quality-score.average .score-value { color: #ffd700; font-size: 36px; }
.quality-score.poor .score-value { color: #ff6b6b; font-size: 36px; }

.score-max {
  font-size: 18px;
  opacity: 0.8;
}

.quality-text {
  font-size: 12px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 信息卡片网格 */
.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin: 40px 0;
}

.info-card {
  background: rgba(255, 255, 255, 0.15);
  padding: 25px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.25);
}

.card-icon {
  font-size: 32px;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 5px;
}

.card-label {
  font-size: 12px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.action-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  backdrop-filter: blur(10px);
  padding: 12px 24px !important;
  border-radius: 25px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-2px);
}

.action-btn.primary { background: rgba(64, 158, 255, 0.3) !important; }
.action-btn.success { background: rgba(103, 194, 58, 0.3) !important; }
.action-btn.warning { background: rgba(230, 162, 60, 0.3) !important; }

/* ================================ 
   内容区域 - 白色背景，圆角顶部
================================ */

.trip-content {
  background: white;
  border-radius: 30px 30px 0 0;
  margin-top: -30px;
  position: relative;
  z-index: 2;
  min-height: 500px;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 40px 40px;
}

/* ================================ 
   增强的Markdown样式 - 时间线设计
================================ */

.enhanced-markdown {
  line-height: 1.7;
  font-size: 16px;
  color: #333;
}

.empty-content {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 18px;
}

/* 主标题样式 */
.main-section-title {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 36px;
  font-weight: 700;
  color: #2c3e50;
  margin: 40px 0 30px 0;
  padding: 20px 0;
  border-bottom: 3px solid #667eea;
  position: relative;
}

.section-icon {
  font-size: 32px;
}

/* 日程时间线设计 */
.day-section {
  position: relative;
  margin: 40px 0;
  padding-left: 60px;
  border-left: 4px solid #e9ecef;
}

.day-section::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 20px;
  width: 16px;
  height: 16px;
  background: #667eea;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 0 0 4px #667eea;
}

.day-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 20px 25px;
  border-radius: 15px;
  margin-bottom: 20px;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.day-header::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(30px, -30px);
}

.day-number {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.day-title {
  font-size: 18px;
  font-weight: 500;
  opacity: 0.95;
}

.day-content {
  background: #f8f9ff;
  padding: 25px;
  border-radius: 15px;
  border: 2px solid #e9ecef;
  position: relative;
}

/* 活动和时间点样式 */
.activity-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 22px;
  font-weight: 600;
  color: #27ae60;
  margin: 25px 0 15px 0;
  padding: 15px 20px;
  background: linear-gradient(135deg, #a8e6cf, #88d8a3);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(39, 174, 96, 0.2);
}

.activity-icon {
  font-size: 20px;
}

.time-point {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #e74c3c;
  margin: 20px 0 12px 0;
  padding: 12px 18px;
  background: #ffeaea;
  border-left: 4px solid #e74c3c;
  border-radius: 8px;
}

.time-icon {
  font-size: 16px;
}

.sub-activity {
  font-size: 16px;
  font-weight: 500;
  color: #8e44ad;
  margin: 15px 0 10px 0;
  padding-left: 20px;
  border-left: 3px solid #8e44ad;
}

/* 特殊区域样式 */
.budget-section, .tips-section, .backup-section, .checklist-section {
  margin: 30px 0;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.budget-section {
  background: linear-gradient(135deg, #fff7e6, #ffeaa7);
  border-left: 5px solid #fdcb6e;
}

.tips-section {
  background: linear-gradient(135deg, #e8f5e8, #d4f4dd);
  border-left: 5px solid #00b894;
}

.backup-section {
  background: linear-gradient(135deg, #e6f3ff, #b3d9ff);
  border-left: 5px solid #0984e3;
}

.checklist-section {
  background: linear-gradient(135deg, #ffeee6, #ffb3b3);
  border-left: 5px solid #e17055;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
}

/* 文本增强 */
.content-paragraph {
  margin: 15px 0;
  color: #555;
  text-align: justify;
  line-height: 1.8;
}

.highlight {
  background: linear-gradient(120deg, #ffd700, #ffed4e);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  color: #2d3436;
}

/* 价格和时间高亮 */
.price, .price-highlight {
  background: linear-gradient(135deg, #00b894, #00cec9);
  color: white;
  padding: 3px 8px;
  border-radius: 15px;
  font-weight: 600;
  font-size: 14px;
}

.time-highlight {
  background: #667eea;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
}

.ticket-info {
  background: #ff7675;
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
}

/* 列表样式 */
.enhanced-ul, .numbered-ol {
  margin: 20px 0;
  padding-left: 0;
}

.enhanced-li, .numbered-li {
  list-style: none;
  margin: 12px 0;
  padding: 12px 20px;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;
  position: relative;
}

.enhanced-li:hover, .numbered-li:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.enhanced-li::before {
  content: '▪';
  color: #667eea;
  font-weight: bold;
  position: absolute;
  left: 8px;
}

.list-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
}

/* 表格样式 */
.info-table-row {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  margin: 8px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-cell {
  flex: 1;
  padding: 15px 20px;
  background: #f8f9fa;
  border-right: 2px solid white;
  font-weight: 500;
  transition: background 0.3s ease;
}

.table-cell:last-child {
  border-right: none;
}

.table-cell:hover {
  background: #e9ecef;
}

/* 分隔线 */
.content-divider {
  height: 3px;
  background: linear-gradient(90deg, transparent, #667eea, transparent);
  border: none;
  border-radius: 3px;
  margin: 40px 0;
}

/* 表情符号增强 */
.emoji-enhanced {
  font-size: 22px;
  margin: 0 6px;
  display: inline-block;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-5px); }
  60% { transform: translateY(-3px); }
}

/* ================================ 
   响应式设计
================================ */

@media (max-width: 768px) {
  .display-header {
    padding: 40px 15px;
  }
  
  .main-title {
    font-size: 32px;
  }
  
  .info-cards {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .content-container {
    padding: 40px 20px 20px;
  }
  
  .day-section {
    padding-left: 40px;
  }
  
  .main-section-title {
    font-size: 28px;
  }
  
  .activity-title {
    font-size: 18px;
  }
}

/* 统计卡片保持原样 */
.trip-stats {
  margin: 40px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.stat-card:hover {
  transform: translateY(-8px);
  border-color: #667eea;
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.2);
}

.stat-icon {
  font-size: 40px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 反馈卡片 */
.feedback-card {
  margin-top: 40px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 15px 15px 0 0;
}

.feedback-actions {
  margin-top: 20px;
  text-align: right;
  padding: 20px 25px;
}
</style>