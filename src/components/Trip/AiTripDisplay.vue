<template>
  <div class="ai-trip-display">
    <!-- 头部信息卡片 -->
    <el-card class="trip-header-card" shadow="never">
      <div class="trip-header-content">
        <div class="trip-title-section">
          <div class="title-with-icon">
            <el-icon class="ai-icon" color="#409eff"><Cpu /></el-icon>
            <h1 class="trip-main-title">{{ tripTitle }}</h1>
          </div>
          <p class="trip-subtitle" v-if="props.tripData?.content">
            AI为您精心规划的{{ props.tripData?.tripBasicInfo?.days || 3 }}天行程
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
          <div class="day-activities">
            <div class="timeline">
              <div 
                v-for="(activity, actIndex) in day.activities" 
                :key="actIndex"
                class="timeline-item"
                :class="activity.type"
              >
                <!-- 时间线左侧 -->
                <div class="timeline-time">
                  <div class="time-badge">{{ activity.time }}</div>
                  <div class="time-dot" :class="activity.type"></div>
                </div>
                
                <!-- 时间线右侧内容 -->
                <div class="timeline-content">
                  <div class="activity-card" :class="activity.type">
                    <!-- 活动头部 -->
                    <div class="activity-header">
                      <div class="activity-icon" :class="activity.type">
                        <el-icon v-if="activity.type === 'meal'"><Bowl /></el-icon>
                        <el-icon v-else-if="activity.type === 'attraction'"><Location /></el-icon>
                        <el-icon v-else-if="activity.type === 'transport'"><Van /></el-icon>
                        <el-icon v-else-if="activity.type === 'shopping'"><ShoppingBag /></el-icon>
                        <el-icon v-else-if="activity.type === 'accommodation'"><House /></el-icon>
                        <el-icon v-else><Star /></el-icon>
                      </div>
                      <div class="activity-main">
                        <h4 class="activity-title">{{ activity.title }}</h4>
                        <div class="activity-subtitle" v-if="activity.subtitle">{{ activity.subtitle }}</div>
                      </div>
                      <div class="activity-tags" v-if="activity.tags && activity.tags.length > 0">
                        <el-tag 
                          v-for="tag in activity.tags" 
                          :key="tag" 
                          size="small" 
                          :type="getTagType(activity.type)"
                          effect="light"
                        >
                          {{ tag }}
                        </el-tag>
                      </div>
                    </div>
                    
                    <!-- 活动详情 -->
                    <div class="activity-details" v-if="activity.details && activity.details.length > 0">
                      <div 
                        v-for="(detail, detailIndex) in activity.details" 
                        :key="detailIndex"
                        class="detail-item"
                      >
                        <el-icon class="detail-icon" :class="detail.type">
                          <LocationFilled v-if="detail.type === 'address'" />
                          <Money v-else-if="detail.type === 'price'" />
                          <Clock v-else-if="detail.type === 'time'" />
                          <Star v-else-if="detail.type === 'recommend'" />
                          <InfoFilled v-else />
                        </el-icon>
                        <span class="detail-text">{{ detail.text }}</span>
                      </div>
                    </div>
                    
                    <!-- 活动描述 -->
                    <div class="activity-description" v-if="activity.description">
                      <p>{{ activity.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 附加信息网格 -->
    <div class="info-grid">
      <!-- 预算分配卡片 -->
      <el-card 
        class="info-card budget-card" 
        v-if="budgetHtml" 
        shadow="hover"
      >
        <template #header>
          <div class="card-title">
            <el-icon color="#e6a23c"><Money /></el-icon>
            <span>预算分配</span>
          </div>
        </template>
        
        <div class="budget-content" v-html="budgetHtml"></div>
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
      <el-card class="info-card packing-card" v-if="packingHtml" shadow="hover">
        <template #header>
          <div class="card-title">
            <el-icon color="#409eff"><Suitcase /></el-icon>
            <span>必备物品</span>
          </div>
        </template>
        <div class="packing-content" v-html="packingHtml"></div>
      </el-card>

      <!-- 备选方案卡片 -->
      <el-card class="info-card backup-card" v-if="backupHtml" shadow="hover">
        <template #header>
          <div class="card-title">
            <el-icon color="#909399"><Cloudy /></el-icon>
            <span>备选方案</span>
          </div>
        </template>
        <div class="backup-content" v-html="backupHtml"></div>
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
import { useClipboard } from '@vueuse/core'
import {
  Cpu, Calendar, User, Trophy, Timer, Star, Sunny, Money, Warning, 
  Suitcase, Cloudy, DocumentCopy, Folder, Share, 
  Refresh, ChatDotSquare, Bowl, Location, Van, ShoppingBag, House,
  LocationFilled, Clock, InfoFilled
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

// 剪贴板功能
// const { copy, copied } = useClipboard()

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
md.renderer.rules.list_item_open = () => {
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

// 计算属性：提取行程概览
// const tripOverview = computed(() => {
//   if (!props.tripData?.content) return null
//   
//   const content = props.tripData.content
//   // 提取概览部分（从开头到第一个Day）
//   const overviewMatch = content.match(/^([\s\S]*?)(?=#### \*{2}Day \d+|$)/m)
//   return overviewMatch ? overviewMatch[1].trim() : ''
// })

// 计算属性：渲染的markdown内容
// const renderedContent = computed(() => {
//   if (!props.tripData?.content) return ''
//   return md.render(props.tripData.content)
// })

// 计算属性：分离的每日行程HTML
// const dailyPlansHtml = computed(() => {
//   if (!props.tripData?.content) return []
//   
//   const content = props.tripData.content
//   const days = []
//   
//   // 正则匹配每一天的内容
//   const dayPattern = /#### \*{2}Day (\d+)：([^*]+)\*{2}([\s\S]*?)(?=#### \*{2}Day \d+|### 💰|$)/g
//   let match
//   
//   while ((match = dayPattern.exec(content)) !== null) {
//     const dayNumber = parseInt(match[1])
//     const dayTitle = match[2].trim()
//     const dayContent = match[3].trim()
//     
//     // 渲染这一天的markdown内容
//     const dayMarkdown = `#### **Day ${dayNumber}：${dayTitle}**\n\n${dayContent}`
//     
//     days.push({
//       number: dayNumber,
//       title: `Day ${dayNumber}：${dayTitle}`,
//       html: md.render(dayMarkdown)
//     })
//   }
//   
//   return days
// })

// 计算属性：解析每日行程（兼容原组件）
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
    
    // 解析活动
    const activities = parseActivities(cleanContent)
    
    days.push({
      number: dayNumber,
      title: `Day ${dayNumber}：${dayTitle}`,
      theme: themeMatch ? themeMatch[1].trim() : '',
      weather: weatherMatch ? weatherMatch[1].trim() : '',
      activities: activities
    })
  }
  
  return days
})

// 计算属性：统计信息
// const totalActivities = computed(() => {
//   return parsedDays.value.reduce((total, day) => total + (day.activities?.length || 0), 0)
// })

// const uniqueTypes = computed(() => {
//   const types = new Set()
//   parsedDays.value.forEach(day => {
//     day.activities?.forEach(activity => {
//       if (activity.type) types.add(activity.type)
//     })
//   })
//   return types.size
// })

// 解析活动的工具函数
const parseActivities = (content) => {
  const activities = []
  
  // 分割成时间段
  const sections = content.split(/(?=\d{2}:\d{2}[-–]\d{2}:\d{2}|\d{2}:\d{2})/)
  
  sections.forEach(section => {
    if (!section.trim()) return
    
    const lines = section.trim().split('\n').filter(line => line.trim())
    if (lines.length === 0) return
    
    // 解析时间和标题
    const firstLine = lines[0]
    const timeMatch = firstLine.match(/(\d{2}:\d{2}[-–]\d{2}:\d{2}|\d{2}:\d{2})/)
    const time = timeMatch ? timeMatch[1] : ''
    
    // 提取活动标题和类型
    let title = firstLine.replace(/\d{2}:\d{2}[-–]\d{2}:\d{2}|\d{2}:\d{2}/, '').trim()
    let subtitle = ''
    let activityType = 'other'
    
    // 判断活动类型
    if (title.includes('早餐') || title.includes('午餐') || title.includes('晚餐') || title.includes('餐厅') || title.includes('食府') || title.includes('小吃')) {
      activityType = 'meal'
    } else if (title.includes('景点') || title.includes('游览') || title.includes('参观') || title.includes('寺') || title.includes('宫') || title.includes('园') || title.includes('博物馆') || title.includes('广场')) {
      activityType = 'attraction'
    } else if (title.includes('购物') || title.includes('商场') || title.includes('街') || title.includes('市场')) {
      activityType = 'shopping'
    } else if (title.includes('返回') || title.includes('交通') || title.includes('地铁')) {
      activityType = 'transport'
    } else if (title.includes('酒店') || title.includes('住宿')) {
      activityType = 'accommodation'
    }
    
    // 解析详细信息
    const details = []
    const tags = []
    let description = ''
    
    // 从第二行开始解析详细信息
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      // 解析地址
      if (line.includes('地址：') || line.includes('📍')) {
        const address = line.replace(/.*地址[：:]/, '').replace('📍', '').trim()
        details.push({ type: 'address', text: address })
      }
      // 解析推荐
      else if (line.includes('推荐：') || line.includes('🍽')) {
        const recommend = line.replace(/.*推荐[：:]/, '').replace('🍽', '').trim()
        details.push({ type: 'recommend', text: recommend })
      }
      // 解析价格
      else if (line.includes('人均：') || line.includes('💰') || line.includes('门票：')) {
        const price = line.replace(/.*[人均门票][：:]/, '').replace('💰', '').trim()
        details.push({ type: 'price', text: price })
      }
      // 解析营业时间
      else if (line.includes('营业：') || line.includes('开放：') || line.includes('🕒')) {
        const time = line.replace(/.*[营业开放][：:]/, '').replace('🕒', '').trim()
        details.push({ type: 'time', text: time })
      }
      // 解析标签
      else if (line.includes('标签：') || line.includes('#')) {
        const tagText = line.replace(/.*标签[：:]/, '').replace(/#/g, '').trim()
        tags.push(...tagText.split(/[、,，\s]+/).filter(tag => tag.trim()))
      }
      // 解析贴士
      else if (line.includes('贴士：') || line.includes('💡')) {
        details.push({ type: 'tip', text: line.replace(/.*贴士[：:]/, '').replace('💡', '').trim() })
      }
      // 解析其他信息
      else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        const info = line.replace(/^[•\-*]\s*/, '').trim()
        if (info) {
          details.push({ type: 'info', text: info })
        }
      }
      // 解析简单格式的地址和价格信息
      else if (line.includes('区') || line.includes('路') || line.includes('街') || line.includes('号')) {
        // 可能是地址信息
        details.push({ type: 'address', text: line })
      }
      else if (line.includes('元') || line.includes('¥') || line.includes('免费')) {
        // 可能是价格信息
        details.push({ type: 'price', text: line })
      }
      // 作为描述处理
      else if (line.length > 10 && !line.includes('：')) {
        description = line
      }
      // 其他短信息作为详情处理
      else if (line.length > 0) {
        details.push({ type: 'info', text: line })
      }
    }
    
    // 从标题中提取场所名称
    const placeMatch = title.match(/[（(]([^）)]+)[）)]/)
    if (placeMatch) {
      subtitle = placeMatch[1]
      title = title.replace(/[（(][^）)]+[）)]/, '').trim()
    }
    
    if (time && title) {
      activities.push({
        time: time,
        title: title,
        subtitle: subtitle,
        type: activityType,
        details: details,
        tags: tags,
        description: description
      })
    }
  })
  
  return activities
}

// 获取标签类型
const getTagType = (activityType) => {
  const typeMap = {
    'meal': 'warning',
    'attraction': 'primary',
    'shopping': 'success',
    'transport': 'info',
    'accommodation': 'danger',
    'other': ''
  }
  return typeMap[activityType] || ''
}

// 计算属性：预算分配HTML
const budgetHtml = computed(() => {
  if (!props.tripData?.content) return ''
  
  const content = props.tripData.content  
  const budgetMatch = content.match(/### 💰 \*{2}预算分配[^\\n]*\*{2}[\\s\\S]*?(\\|[\\s\\S]*?)(?=###|$)/m)
  
  if (budgetMatch) {
    return md.render(budgetMatch[0])
  }
  
  return ''
})

// 计算属性：实用提示HTML
const tipsHtml = computed(() => {
  if (!props.tripData?.content) return ''
  
  const content = props.tripData.content
  const tipsMatch = content.match(/### 💡 \*{2}实用[^*]*提示\*{2}([\\s\\S]*?)(?=###|$)/m)
  
  if (tipsMatch) {
    return md.render(tipsMatch[1].trim())
  }
  
  return ''
})

// 计算属性：必备物品HTML
const packingHtml = computed(() => {
  if (!props.tripData?.content) return ''
  
  const content = props.tripData.content
  const packingMatch = content.match(/### 🎒 \*{2}必备物品[^*]*\*{2}([\\s\\S]*?)(?=###|$)/m)
  
  if (packingMatch) {
    return md.render(packingMatch[1].trim())
  }
  
  return ''
})

// 计算属性：备选方案HTML
const backupHtml = computed(() => {
  if (!props.tripData?.content) return ''
  
  const content = props.tripData.content
  const backupMatch = content.match(/### 🌧️ \*{2}[^*]*备选方案\*{2}([\\s\\S]*?)(?=###|$)/m)
  
  if (backupMatch) {
    return md.render(backupMatch[1].trim())
  }
  
  return ''
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

// 处理复制功能
const handleCopy = async () => {
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

// 处理保存功能
const handleSave = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    emit('save', props.tripData)
    ElMessage.success('行程已保存')
  }, 1000)
}

// 处理分享功能
const handleShare = () => {
  sharing.value = true
  setTimeout(() => {
    sharing.value = false
    emit('share', props.tripData)
    ElMessage.success('分享链接已生成')
  }, 1000)
}

// 处理重新生成功能
const handleRegenerate = () => {
  emit('regenerate')
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
  padding: 24px 20px;
}

/* 时间线布局 */
.timeline {
  position: relative;
  padding-left: 8px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 88px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #e4e7ed, #f5f7fa);
  border-radius: 1px;
}

.timeline-item {
  position: relative;
  display: flex;
  margin-bottom: 24px;
  min-height: 80px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

/* 时间线左侧 */
.timeline-time {
  position: relative;
  width: 90px;
  padding-right: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}

.time-badge {
  background: #fff;
  color: #606266;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  z-index: 2;
}

.time-dot {
  position: absolute;
  right: -6px;
  top: 24px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  z-index: 3;
}

.time-dot.meal {
  background: #e6a23c;
}

.time-dot.attraction {
  background: #409eff;
}

.time-dot.shopping {
  background: #67c23a;
}

.time-dot.transport {
  background: #909399;
}

.time-dot.accommodation {
  background: #f56c6c;
}

.time-dot.other {
  background: #c8c9cc;
}

/* 时间线右侧内容 */
.timeline-content {
  flex: 1;
  margin-left: 16px;
}

.activity-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.activity-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.activity-card.meal {
  border-left: 4px solid #e6a23c;
}

.activity-card.attraction {
  border-left: 4px solid #409eff;
}

.activity-card.shopping {
  border-left: 4px solid #67c23a;
}

.activity-card.transport {
  border-left: 4px solid #909399;
}

.activity-card.accommodation {
  border-left: 4px solid #f56c6c;
}

.activity-card.other {
  border-left: 4px solid #c8c9cc;
}

/* 活动头部 */
.activity-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #fafafa;
  border-bottom: 1px solid #f5f5f5;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
  flex-shrink: 0;
}

.activity-icon.meal {
  background: #e6a23c;
}

.activity-icon.attraction {
  background: #409eff;
}

.activity-icon.shopping {
  background: #67c23a;
}

.activity-icon.transport {
  background: #909399;
}

.activity-icon.accommodation {
  background: #f56c6c;
}

.activity-icon.other {
  background: #c8c9cc;
}

.activity-main {
  flex: 1;
  min-width: 0;
}

.activity-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.activity-subtitle {
  font-size: 14px;
  color: #909399;
  line-height: 1.4;
}

.activity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-self: flex-start;
}

/* 活动详情 */
.activity-details {
  padding: 16px;
  background: #fff;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.6;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-icon {
  margin-top: 2px;
  flex-shrink: 0;
  font-size: 16px;
}

.detail-icon.address {
  color: #f56c6c;
}

.detail-icon.price {
  color: #e6a23c;
}

.detail-icon.time {
  color: #409eff;
}

.detail-icon.recommend {
  color: #67c23a;
}

.detail-icon.tip {
  color: #909399;
}

.detail-text {
  color: #606266;
  flex: 1;
}

/* 活动描述 */
.activity-description {
  padding: 0 16px 16px;
  background: #fff;
}

.activity-description p {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid #e4e7ed;
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

.budget-list > * + * {
  margin-top: 12px;
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
.backup-list > * + * {
  margin-top: 8px;
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
  
  .day-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .day-details {
    justify-content: center;
  }
  
  .day-activities {
    padding: 16px 12px;
  }
  
  /* 移动端时间线优化 */
  .timeline {
    padding-left: 0;
  }
  
  .timeline::before {
    left: 72px;
  }
  
  .timeline-item {
    margin-bottom: 20px;
    min-height: auto;
  }
  
  .timeline-time {
    width: 80px;
  }
  
  .time-badge {
    font-size: 12px;
    padding: 3px 6px;
  }
  
  .time-dot {
    right: -6px;
    top: 20px;
    width: 10px;
    height: 10px;
  }
  
  .timeline-content {
    margin-left: 12px;
  }
  
  .activity-header {
    padding: 12px;
    flex-wrap: wrap;
  }
  
  .activity-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  
  .activity-title {
    font-size: 15px;
  }
  
  .activity-subtitle {
    font-size: 13px;
  }
  
  .activity-tags {
    width: 100%;
    margin-top: 8px;
  }
  
  .activity-details {
    padding: 12px;
  }
  
  .detail-item {
    font-size: 13px;
  }
  
  .activity-description {
    padding: 0 12px 12px;
  }
  
  .activity-description p {
    font-size: 13px;
    padding: 10px;
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

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .timeline-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .timeline::before {
    display: none;
  }
  
  .timeline-time {
    width: 100%;
    align-items: flex-start;
    margin-bottom: 8px;
  }
  
  .time-dot {
    display: none;
  }
  
  .timeline-content {
    margin-left: 0;
    width: 100%;
  }
  
  .activity-header {
    padding: 12px;
  }
  
  .day-activities {
    padding: 12px 8px;
  }
}
</style>