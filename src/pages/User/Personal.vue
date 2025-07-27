<template>
  <div class="personal-page">
    <!-- 用户信息卡片 -->
    <div class="user-info-card">
      <div class="user-avatar-section">
        <div class="user-avatar">
          <el-avatar 
            :size="80" 
            :src="userInfo.avatar" 
            :icon="UserFilled"
            class="avatar"
          />
          <el-button 
            size="small" 
            type="primary" 
            plain 
            @click="changeAvatar"
            class="change-avatar-btn"
          >
            更换头像
          </el-button>
        </div>
        <div class="user-basic-info">
          <h2 class="user-name">{{ userInfo.nickname || '用户' }}</h2>
          <p class="user-phone">{{ formatPhone(userInfo.phone) }}</p>
          <p class="user-join-date">
            <el-icon><Calendar /></el-icon>
            {{ formatJoinDate(userInfo.createTime) }}
          </p>
        </div>
      </div>
      
      <div class="user-stats">
        <div class="stat-item">
          <div class="stat-number">{{ userStats.tripCount }}</div>
          <div class="stat-label">创建行程</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ userStats.preferenceCount }}</div>
          <div class="stat-label">偏好标签</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ userStats.usageDays }}</div>
          <div class="stat-label">使用天数</div>
        </div>
      </div>
    </div>

    <!-- 快捷功能区 -->
    <div class="quick-actions">
      <h3 class="section-title">快捷功能</h3>
      <div class="action-grid">
        <div class="action-card" @click="createTrip">
          <div class="action-icon">
            <el-icon size="32" color="#667eea">
              <MapLocation />
            </el-icon>
          </div>
          <h4>创建行程</h4>
          <p>开始规划您的下一次旅行</p>
        </div>
        
        <div class="action-card" @click="goToPreferences">
          <div class="action-icon">
            <el-icon size="32" color="#07C160">
              <Setting />
            </el-icon>
          </div>
          <h4>偏好设置</h4>
          <p>个性化您的旅行推荐</p>
        </div>
        
        <div class="action-card" @click="viewTrips">
          <div class="action-icon">
            <el-icon size="32" color="#FF6B35">
              <Tickets />
            </el-icon>
          </div>
          <h4>我的行程</h4>
          <p>查看和管理历史行程</p>
        </div>
        
        <div class="action-card" @click="accountSettings">
          <div class="action-icon">
            <el-icon size="32" color="#8B5CF6">
              <Tools />
            </el-icon>
          </div>
          <h4>账户设置</h4>
          <p>安全设置和隐私管理</p>
        </div>
      </div>
    </div>

    <!-- 我的行程 -->
    <div class="my-trips-section">
      <div class="section-header">
        <h3 class="section-title">我的行程</h3>
        <el-button 
          size="small" 
          type="primary" 
          plain 
          @click="createTrip"
          class="create-trip-btn"
        >
          <el-icon><Plus /></el-icon>
          创建新行程
        </el-button>
      </div>
      
      <div class="trips-grid" v-if="savedTrips.length > 0">
        <div 
          v-for="trip in savedTrips" 
          :key="trip.id"
          class="trip-card"
          @click="viewTripDetail(trip)"
        >
          <div class="trip-header">
            <h4>{{ trip.title }}</h4>
            <el-tag :type="trip.status === 'draft' ? 'info' : 'success'" size="small">
              {{ trip.status === 'draft' ? '草稿' : '已完成' }}
            </el-tag>
          </div>
          <div class="trip-info">
            <div class="trip-detail">
              <el-icon><MapLocation /></el-icon>
              <span>{{ trip.destinationName }}</span>
            </div>
            <div class="trip-detail">
              <el-icon><Calendar /></el-icon>
              <span>{{ trip.days }}天</span>
            </div>
            <div class="trip-detail">
              <el-icon><User /></el-icon>
              <span>{{ trip.travelers }}人</span>
            </div>
            <div class="trip-detail">
              <el-icon><Money /></el-icon>
              <span>{{ trip.budgetText }}</span>
            </div>
          </div>
          <div class="trip-summary">
            <span>{{ trip.attractions?.length || 0 }}个景点</span>
            <span>{{ trip.restaurants?.length || 0 }}家餐厅</span>
            <span>{{ formatTripDate(trip.createdAt) }}</span>
          </div>
          <div class="trip-actions">
            <el-button size="small" type="primary" plain @click.stop="editTrip(trip)">
              编辑
            </el-button>
            <el-button size="small" type="danger" plain @click.stop="deleteTrip(trip.id)">
              删除
            </el-button>
          </div>
        </div>
      </div>
      
      <div v-else class="no-trips">
        <el-icon size="48" color="#C0C4CC">
          <DocumentCopy />
        </el-icon>
        <p>还没有创建任何行程</p>
        <el-button type="primary" @click="createTrip">
          立即创建行程
        </el-button>
      </div>
    </div>

    <!-- 我的偏好详细展示 -->
    <div class="my-preferences-section">
      <div class="section-header">
        <h3 class="section-title">我的偏好</h3>
        <el-button 
          size="small" 
          type="primary" 
          plain 
          @click="goToPreferences"
          class="edit-preferences-btn"
        >
          <el-icon><Setting /></el-icon>
          编辑偏好
        </el-button>
      </div>

      <div v-if="hasPreferences" class="preferences-grid">
        <!-- 旅行类型偏好 -->
        <div class="preference-card" v-if="parsedPreferences.selectedTags && parsedPreferences.selectedTags.length > 0">
          <div class="card-header">
            <el-icon class="card-icon"><Tickets /></el-icon>
            <h4>旅行类型</h4>
          </div>
          <div class="card-content">
            <div class="tags-display">
              <el-tag 
                v-for="tag in parsedPreferences.selectedTags" 
                :key="tag"
                size="small"
                class="preference-tag"
              >
                {{ getTravelTagLabel(tag) }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 日均预算 -->
        <div class="preference-card" v-if="parsedPreferences.budget">
          <div class="card-header">
            <el-icon class="card-icon"><Tools /></el-icon>
            <h4>日均预算</h4>
          </div>
          <div class="card-content">
            <div class="budget-display">
              <span class="budget-amount">¥{{ parsedPreferences.budget }}</span>
              <span class="budget-unit">/ 天</span>
            </div>
          </div>
        </div>

        <!-- MBTI性格类型 -->
        <div class="preference-card" v-if="parsedPreferences.mbtiType">
          <div class="card-header">
            <el-icon class="card-icon"><User /></el-icon>
            <h4>MBTI性格</h4>
          </div>
          <div class="card-content mbti-card-content">
            <div class="mbti-display">
              <div class="mbti-avatar">
                <img :src="`/images/mbti/${parsedPreferences.mbtiType}.png`" :alt="parsedPreferences.mbtiType" />
              </div>
              <div class="mbti-details">
                <h5 class="mbti-type">{{ parsedPreferences.mbtiType }}</h5>
                <p class="mbti-name">{{ getMbtiDisplayName(parsedPreferences.mbtiType) }}</p>
                <p class="mbti-description">{{ getMbtiTravelDescriptionShort(parsedPreferences.mbtiType) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 出行方式 -->
        <div class="preference-card" v-if="parsedPreferences.selectedTransports && parsedPreferences.selectedTransports.length > 0">
          <div class="card-header">
            <el-icon class="card-icon"><MapLocation /></el-icon>
            <h4>出行方式</h4>
          </div>
          <div class="card-content">
            <div class="transport-display">
              <span 
                v-for="transport in parsedPreferences.selectedTransports" 
                :key="transport"
                class="transport-item"
              >
                {{ getTransportLabel(transport) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 住宿偏好 -->
        <div class="preference-card" v-if="parsedPreferences.accommodationType">
          <div class="card-header">
            <el-icon class="card-icon"><UserFilled /></el-icon>
            <h4>住宿偏好</h4>
          </div>
          <div class="card-content">
            <div class="accommodation-display">
              <span class="accommodation-type">{{ getAccommodationLabel(parsedPreferences.accommodationType) }}</span>
            </div>
          </div>
        </div>

        <!-- 饮食偏好 -->
        <div class="preference-card" v-if="hasFoodPreferences">
          <div class="card-header">
            <el-icon class="card-icon"><Calendar /></el-icon>
            <h4>饮食偏好</h4>
          </div>
          <div class="card-content">
            <div class="food-display">
              <div v-if="parsedPreferences.foodTastes && parsedPreferences.foodTastes.length > 0" class="food-category">
                <span class="category-label">口味：</span>
                <span class="food-items">{{ getFoodTastesText(parsedPreferences.foodTastes) }}</span>
              </div>
              <div v-if="parsedPreferences.dietaryRestrictions && parsedPreferences.dietaryRestrictions.length > 0" class="food-category">
                <span class="category-label">限制：</span>
                <span class="food-items">{{ getDietaryRestrictionsText(parsedPreferences.dietaryRestrictions) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 活动时间 -->
        <div class="preference-card" v-if="parsedPreferences.preferredTimes && parsedPreferences.preferredTimes.length > 0">
          <div class="card-header">
            <el-icon class="card-icon"><DocumentCopy /></el-icon>
            <h4>活动时间</h4>
          </div>
          <div class="card-content">
            <div class="time-display">
              <span 
                v-for="time in parsedPreferences.preferredTimes" 
                :key="time"
                class="time-item"
              >
                {{ getTimeLabel(time) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 旅行节奏 -->
        <div class="preference-card" v-if="parsedPreferences.travelPace">
          <div class="card-header">
            <el-icon class="card-icon"><Tools /></el-icon>
            <h4>旅行节奏</h4>
          </div>
          <div class="card-content">
            <div class="pace-display">
              <span class="pace-text">{{ getTravelPaceText(parsedPreferences.travelPace) }}</span>
            </div>
          </div>
        </div>

        <!-- 其他偏好 -->
        <div class="preference-card" v-if="hasOtherPreferences">
          <div class="card-header">
            <el-icon class="card-icon"><Setting /></el-icon>
            <h4>其他偏好</h4>
          </div>
          <div class="card-content">
            <div class="other-display">
              <div v-for="(value, key) in activeOtherPreferences" :key="key" class="other-item">
                <span class="other-label">{{ getOtherPreferenceLabel(key) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 无偏好数据时的提示 -->
      <div v-else class="no-preferences">
        <el-icon size="48" color="#C0C4CC">
          <Setting />
        </el-icon>
        <p>还没有设置偏好信息</p>
        <el-button type="primary" @click="goToPreferences">
          立即设置
        </el-button>
      </div>
    </div>

    <!-- 更换头像对话框 -->
    <el-dialog
      v-model="avatarDialogVisible"
      title="更换头像"
      width="400px"
      center
    >
      <div class="avatar-upload-section">
        <p>暂时只支持预设头像，上传功能开发中...</p>
        <div class="preset-avatars">
          <div 
            v-for="avatar in presetAvatars" 
            :key="avatar"
            class="preset-avatar"
            @click="selectAvatar(avatar)"
          >
            <el-avatar :size="60" :src="avatar" />
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="avatarDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAvatar">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onActivated, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  UserFilled,
  Calendar,
  MapLocation,
  Setting,
  Tickets,
  Tools,
  DocumentCopy,
  Plus,
  User,
  Money
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user.js'
import { convertBackendTripToFrontend } from '@/utils/tripDataConverter.js'

export default {
  name: 'Personal',
  components: {
    UserFilled,
    Calendar,
    MapLocation,
    Setting,
    Tickets,
    Tools,
    DocumentCopy,
    Plus,
    User,
    Money
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()

    // 响应式数据
    const avatarDialogVisible = ref(false)
    const selectedAvatar = ref('')
    
    // 保存的行程数据
    const savedTrips = ref([])
    
    // 用户信息
    const userInfo = computed(() => userStore.currentUser || {})
    
    // 用户统计数据（模拟）
    const userStats = reactive({
      tripCount: 0,
      preferenceCount: 0,
      usageDays: 1
    })

    // 计算属性
    const userPreferences = computed(() => {
      try {
        const preferences = userStore.currentUser?.preferences
        if (!preferences) return []
        
        if (typeof preferences === 'string') {
          const parsed = JSON.parse(preferences)
          return parsed.selectedTags || []
        }
        
        return preferences.selectedTags || []
      } catch (error) {
        console.error('解析用户偏好失败:', error)
        return []
      }
    })

    // 解析完整的偏好数据
    const parsedPreferences = computed(() => {
      try {
        //此处的用户偏好信息 是login返回的
        const preferences = userStore.currentUser?.preferences
        if (!preferences) return {}
        
        if (typeof preferences === 'string') {
          return JSON.parse(preferences)
        }
        
        return preferences
      } catch (error) {
        console.error('解析偏好数据失败:', error)
        return {}
      }
    })

    // 是否有偏好数据
    const hasPreferences = computed(() => {
      const prefs = parsedPreferences.value
      return Object.keys(prefs).length > 0 && (
        (prefs.selectedTags && prefs.selectedTags.length > 0) ||
        prefs.budget ||
        (prefs.selectedTransports && prefs.selectedTransports.length > 0) ||
        prefs.accommodationType ||
        (prefs.foodTastes && prefs.foodTastes.length > 0) ||
        (prefs.dietaryRestrictions && prefs.dietaryRestrictions.length > 0) ||
        (prefs.preferredTimes && prefs.preferredTimes.length > 0) ||
        prefs.travelPace ||
        hasOtherPreferences.value
      )
    })

    // 是否有饮食偏好
    const hasFoodPreferences = computed(() => {
      const prefs = parsedPreferences.value
      return (prefs.foodTastes && prefs.foodTastes.length > 0) ||
             (prefs.dietaryRestrictions && prefs.dietaryRestrictions.length > 0)
    })

    // 其他偏好中被启用的项目
    const activeOtherPreferences = computed(() => {
      const prefs = parsedPreferences.value.otherPreferences || {}
      const active = {}
      Object.keys(prefs).forEach(key => {
        if (prefs[key] === true) {
          active[key] = true
        }
      })
      return active
    })

    // 是否有其他偏好
    const hasOtherPreferences = computed(() => {
      return Object.keys(activeOtherPreferences.value).length > 0
    })

    // Helper 方法
    const getTravelTagLabel = (tagValue) => {
      const labels = {
        historical: '历史古迹',
        nature: '自然风光', 
        food: '美食探索',
        photography: '拍照打卡',
        family: '亲子游',
        urban: '城市探索',
        culture: '文艺体验',
        relaxation: '休闲度假',
        adventure: '极限运动',
        wellness: '温泉养生'
      }
      return labels[tagValue] || tagValue
    }

    const getTransportLabel = (transport) => {
      const labels = {
        car: '自驾游',
        public: '公共交通',
        walk: '步行/骑行',
        shared: '包车/拼车',
        // 兼容旧值
        walking: '步行',
        driving: '自驾',
        taxi: '出租车',
        bicycle: '骑行',
        motorcycle: '摩托车',
        train: '火车',
        flight: '飞机'
      }
      return labels[transport] || transport
    }

    const getAccommodationLabel = (type) => {
      const labels = {
        budget: '经济实惠',
        comfort: '舒适便利',
        bnb: '特色民宿', 
        luxury: '奢华享受',
        // 兼容旧值
        hotel: '酒店',
        hostel: '青旅',
        apartment: '民宿',
        guesthouse: '客栈'
      }
      return labels[type] || type
    }

    const getFoodTastesText = (tastes) => {
      const labels = {
        spicy: '辣味',
        sweet: '甜味', 
        sour: '酸味',
        light: '清淡',
        heavy: '重口味',
        // 可能的其他值
        bitter: '苦味',
        salty: '咸味',
        umami: '鲜味'
      }
      return tastes.map(taste => labels[taste] || taste).join('、')
    }

    const getDietaryRestrictionsText = (restrictions) => {
      const labels = {
        vegetarian: '素食主义',
        halal: '清真食品',
        'no-seafood': '不吃海鲜',
        'no-alcohol': '不饮酒',
        'gluten-free': '无麸质',
        // 可能的其他值
        vegan: '纯素食',
        kosher: '犹太洁食',
        'no-pork': '不吃猪肉',
        'no-beef': '不吃牛肉',
        'dairy-free': '无乳制品'
      }
      return restrictions.map(restriction => labels[restriction] || restriction).join('、')
    }

    const getTimeLabel = (time) => {
      const labels = {
        morning: '早起型',
        afternoon: '午间型',
        evening: '夜猫子',
        // 可能的其他值
        'early-morning': '清晨型',
        'late-night': '深夜型',
        'all-day': '全天型'
      }
      return labels[time] || time
    }

    const getTravelPaceText = (pace) => {
      const labels = {
        1: '🐌 慢悠悠 - 深度体验',
        2: '🚶 悠闲型 - 适度安排',
        3: '⚖️ 平衡型 - 景点与休息并重',
        4: '🏃 紧凑型 - 多看多玩',
        5: '⚡ 暴走型 - 最大化利用时间'
      }
      return labels[pace] || `节奏${pace}`
    }

    const getOtherPreferenceLabel = (key) => {
      const labels = {
        popularFirst: '优先热门景点',
        includeFood: '包含美食推荐',
        avoidCrowds: '避开人群',
        includeShopping: '包含购物',
        preferPublicTransport: '偏好公共交通',
        includeKidsActivities: '包含亲子活动',
        needAccessibility: '需要无障碍设施'
      }
      return labels[key] || key
    }

    // MBTI相关辅助函数
    const getMbtiDisplayName = (type) => {
      const names = {
        'INTJ': '建筑师',
        'INTP': '逻辑学家',
        'ENTJ': '指挥官',
        'ENTP': '辩论家',
        'INFJ': '提倡者',
        'INFP': '调停者',
        'ENFJ': '主人公',
        'ENFP': '活动家',
        'ISTJ': '物流师',
        'ISFJ': '守护者',
        'ESTJ': '总经理',
        'ESFJ': '执政官',
        'ISTP': '鉴赏家',
        'ISFP': '探险家',
        'ESTP': '企业家',
        'ESFP': '娱乐家'
      }
      return names[type] || '未知类型'
    }

    const getMbtiTravelDescriptionShort = (type) => {
      const descriptions = {
        'INTJ': '喜欢规划性和逻辑性的旅行体验',
        'INTP': '偏爱独立思考和探索新事物',
        'ENTJ': '追求效率和挑战性的旅行',
        'ENTP': '喜欢辩论交流和文化体验',
        'INFJ': '富有同情心，偏爱文化艺术',
        'INFP': '敏感创造，喜欢文艺和自然',
        'ENFJ': '喜欢社交和团队旅行体验',
        'ENFP': '充满活力，喜欢参与体验',
        'ISTJ': '注重细节，偏爱历史文化',
        'ISFJ': '温和体贴，喜欢舒适体验',
        'ESTJ': '有组织性，偏爱热门景点',
        'ESFJ': '善于社交，喜欢温馨体验',
        'ISTP': '独立行动，喜欢刺激体验',
        'ISFP': '富有创造力，偏爱宁静环境',
        'ESTP': '充满活力，喜欢速度刺激',
        'ESFP': '热情开朗，喜欢多元体验'
      }
      return descriptions[type] || '个性化旅行推荐'
    }

    // 预设头像
    const presetAvatars = [
      'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
      'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    ]

    // 方法
    const formatPhone = (phone) => {
      if (!phone) return '未绑定手机号'
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    }

    const formatJoinDate = (createTime) => {
      if (!createTime) return '加入时间未知'
      const date = new Date(createTime)
      return `加入于 ${date.getFullYear()}年${date.getMonth() + 1}月`
    }

    const changeAvatar = () => {
      avatarDialogVisible.value = true
      selectedAvatar.value = userInfo.value.avatar || ''
    }

    const selectAvatar = (avatar) => {
      selectedAvatar.value = avatar
    }

    const saveAvatar = async () => {
      try {
        // TODO: 调用API更新头像
        ElMessage.success('头像更新成功！')
        avatarDialogVisible.value = false
      } catch (error) {
        ElMessage.error('头像更新失败，请重试')
      }
    }

    const createTrip = () => {
      router.push('/destinations')
    }

    const goToPreferences = () => {
      router.push('/preferences')
    }

    const viewTrips = () => {
      // 滚动到我的行程部分
      const tripsSection = document.querySelector('.my-trips-section')
      if (tripsSection) {
        tripsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    const accountSettings = () => {
      ElMessage.info('账户设置功能开发中，敬请期待！')
    }

    // 更新用户统计数据
    const updateUserStats = async () => {
      const currentUser = userStore.currentUser
      if (!currentUser) return

      // 强制重新加载保存的行程（确保数据最新）
      console.log('🔄 重新加载行程数据...')
      await loadSavedTrips()

      // 计算偏好标签数量
      let preferenceCount = 0
      try {
        const preferences = currentUser.preferences
        if (preferences) {
          const parsed = typeof preferences === 'string' ? JSON.parse(preferences) : preferences
          
          // 统计所有类型的偏好标签
          if (parsed.selectedTags) preferenceCount += parsed.selectedTags.length
          if (parsed.selectedTransports) preferenceCount += parsed.selectedTransports.length
          if (parsed.accommodationType) preferenceCount += 1
          if (parsed.travelPace) preferenceCount += 1
          if (parsed.foodTastes) preferenceCount += parsed.foodTastes.length
          if (parsed.otherPreferences) {
            const others = parsed.otherPreferences
            preferenceCount += Object.values(others).filter(Boolean).length
          }
        }
      } catch (error) {
        console.error('解析偏好数据失败:', error)
      }

      userStats.preferenceCount = preferenceCount
      userStats.tripCount = savedTrips.value.length

      // 计算使用天数（从创建时间开始计算）
      if (currentUser.createTime) {
        const createDate = new Date(currentUser.createTime)
        const today = new Date()
        const diffTime = Math.abs(today - createDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        userStats.usageDays = diffDays || 1
      }

      console.log('📊 用户统计数据更新:', userStats)
    }

    // 加载保存的行程
    const loadSavedTrips = async () => {
      try {
        if (!userStore.currentUser?.id) {
          console.warn('用户未登录，跳过行程加载')
          savedTrips.value = []
          return
        }

        console.log('🔄 从API加载行程数据...')
        
        // 调用后端API获取用户行程
        const { tripApi } = await import('@/api/trip.js')
        const response = await tripApi.getUserTrips(userStore.currentUser.id)
        
        if (response.data) {
          savedTrips.value = response.data.map(trip => convertBackendTripToFrontend(trip))
          console.log('📋 从API加载行程成功:', savedTrips.value.length, '个')
        } else {
          savedTrips.value = []
        }
      } catch (error) {
        console.error('❌ 从API加载行程数据失败:', error)
        // 降级到localStorage作为备选
        try {
          const trips = localStorage.getItem('savedTrips')
          if (trips) {
            savedTrips.value = JSON.parse(trips).map(trip => convertBackendTripToFrontend(trip))
            console.log('📋 降级使用本地存储数据:', savedTrips.value.length, '个')
          } else {
            savedTrips.value = []
          }
        } catch (localError) {
          console.error('❌ 本地存储也加载失败:', localError)
          savedTrips.value = []
        }
      }
    }

    // 删除行程
    const deleteTrip = async (tripId) => {
      try {
        await ElMessageBox.confirm(
          '确定要删除这个行程吗？删除后无法恢复。',
          '删除行程',
          {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        if (!userStore.currentUser?.id) {
          ElMessage.error('用户未登录')
          return
        }

        // 调用后端API删除行程
        const { tripApi } = await import('@/api/trip.js')
        await tripApi.deleteTrip(tripId, userStore.currentUser.id)
        
        // 删除成功后重新加载行程数据
        await loadSavedTrips()
        
        // 更新统计数据
        updateUserStats()
        
        ElMessage.success('行程删除成功')
        console.log('🗑️ 行程删除成功, ID:', tripId)
        
      } catch (error) {
        if (error === 'cancel') {
          // 用户取消删除
          return
        }
        
        console.error('❌ 删除行程失败:', error)
        ElMessage.error('删除行程失败：' + (error.message || '请重试'))
      }
    }

    // 格式化行程创建日期
    const formatTripDate = (dateString) => {
      try {
        const date = new Date(dateString)
        return `${date.getMonth() + 1}月${date.getDate()}日`
      } catch (error) {
        return '未知'
      }
    }

    // 查看行程详情
    const viewTripDetail = (trip) => {
      console.log('🔍 查看行程详情:', trip.title, trip.id)
      router.push({
        name: 'TripDetail',
        params: { id: trip.id }
      })
    }

    // 编辑行程
    const editTrip = (trip) => {
      console.log('✏️ 编辑行程:', trip.title, trip.id)
      router.push({
        name: 'TripDetail',
        params: { id: trip.id },
        query: { edit: 'true' } // 传递编辑标识
      })
    }

    // 监听路由变化，从特定页面返回时刷新数据
    watch(
      () => route.path,
      (newPath, oldPath) => {
        // 当切换到个人中心页面时，检查是否需要刷新数据
        if (newPath === '/personal' && oldPath && (
          oldPath.includes('/preferences') || 
          oldPath.includes('/trip/')
        )) {
          console.log('🔄 从其他页面返回个人中心，刷新数据')
          // 延迟执行，确保页面完全加载
          setTimeout(() => {
            loadUserData()
          }, 100)
        }
      }
    )

    // 监听用户偏好变化，自动更新统计数据
    watch(
      () => userStore.currentUser?.preferences,
      async (newPreferences) => {
        if (newPreferences) {
          console.log('🔄 检测到偏好数据变化，更新统计数据')
          await updateUserStats()
        }
      },
      { deep: true }
    )

    // 加载用户数据
    const loadUserData = async () => {
      const currentUser = userStore.currentUser
      if (currentUser) {
        try {
          // 重新获取用户信息，确保数据是最新的
          console.log('🔄 刷新用户信息...')
          await userStore.fetchUserInfo()
          console.log('✅ 用户信息刷新完成')
        } catch (error) {
          console.warn('⚠️ 刷新用户信息失败:', error)
        }
        
        // 更新统计数据（会自动加载保存的行程）
        await updateUserStats()

        console.log('✅ 用户数据加载完成')
      }
    }

    // 页面初始化
    onMounted(() => {
      // 检查登录状态
      if (!userStore.isLoggedIn) {
        router.push('/login')
        return
      }

      // 加载用户数据
      loadUserData()
    })

    // 页面激活时刷新数据（从其他页面返回时）
    onActivated(() => {
      console.log('🔄 页面激活，刷新数据')
      if (userStore.isLoggedIn) {
        loadUserData()
      }
    })

    // 监听页面可见性变化（处理浏览器标签页切换）
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && userStore.isLoggedIn) {
        console.log('🔄 页面可见，刷新数据')
        loadUserData()
      }
    }

    onMounted(() => {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    })

    return {
      userInfo,
      userStats,
      userPreferences,
      savedTrips,
      avatarDialogVisible,
      selectedAvatar,
      presetAvatars,
      formatPhone,
      formatJoinDate,
      formatTripDate,
      changeAvatar,
      selectAvatar,
      saveAvatar,
      createTrip,
      goToPreferences,
      viewTrips,
      viewTripDetail,
      editTrip,
      deleteTrip,
      accountSettings,
      updateUserStats, // 添加统计数据更新函数
      parsedPreferences,
      hasPreferences,
      hasFoodPreferences,
      activeOtherPreferences,
      hasOtherPreferences,
      getTravelTagLabel,
      getTransportLabel,
      getAccommodationLabel,
      getFoodTastesText,
      getDietaryRestrictionsText,
      getTimeLabel,
      getTravelPaceText,
      getOtherPreferenceLabel,
      getMbtiDisplayName,
      getMbtiTravelDescriptionShort,
      savedTrips, // 暴露保存的行程数据
      formatTripDate, // 暴露行程日期格式化函数
      viewTripDetail, // 暴露查看行程详情函数
      editTrip, // 暴露编辑行程函数
      deleteTrip // 暴露删除行程函数
    }
  }
}
</script>

<style scoped>
.personal-page {
  position: fixed !important;
  top: 64px !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: calc(100vh - 64px) !important;
  margin: 0 !important;
  padding: 20px !important;
  background: #f5f7fa !important;
  overflow-y: auto !important;
  z-index: 1 !important;
}

/* 重置可能影响布局的样式 */
.personal-page * {
  box-sizing: border-box !important;
}

.personal-page .el-avatar {
  flex-shrink: 0 !important;
}

/* ========== 用户信息卡片 ========== */
.user-info-card {
  background: white !important;
  border-radius: 16px !important;
  padding: 32px !important;
  margin: 0 auto 24px auto !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06) !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  width: 100% !important;
  max-width: 1200px !important;
}

.user-avatar-section {
  display: flex !important;
  align-items: center !important;
  gap: 24px !important;
  flex: 1 !important;
}

.user-avatar {
display: flex;
flex-direction: column;
align-items: center;
}

.avatar {
  margin-bottom: 12px !important;
  border: 3px solid #f0f2f5 !important;
}

.change-avatar-btn {
  font-size: 12px !important;
  padding: 4px 12px !important;
}

.user-basic-info {

}

.user-basic-info h2 {
  font-size: 28px !important;
  font-weight: 600 !important;
  color: #303133 !important;
  margin: 0 0 8px 0 !important;
}

.user-phone {
  color: #909399 !important;
  font-size: 16px !important;
  margin: 0 0 8px 0 !important;
}

.user-join-date {
  color: #909399 !important;
  font-size: 14px !important;
  margin: 0 !important;
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
}

.user-stats {
  display: flex !important;
  gap: 40px !important;
  flex-shrink: 0 !important;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

/* ========== 快捷功能区 ========== */
.quick-actions {
  margin: 0 auto 24px auto !important;
  width: 100% !important;
  max-width: 1200px !important;
}

.section-title {
  font-size: 20px !important;
  font-weight: 600 !important;
  color: #303133 !important;
  margin: 0 0 16px 0 !important;
}

.action-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
  gap: 16px !important;
  width: 100% !important;
}

.action-card {
  background: white !important;
  border-radius: 12px !important;
  padding: 24px !important;
  text-align: center !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
  width: 100% !important;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.action-icon {
  margin-bottom: 16px;
}

.action-card h4 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.action-card p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* ========== 我的行程 ========== */
.my-trips-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 24px;
  margin: 0 auto 24px auto !important;
  width: 100% !important;
  max-width: 1200px !important;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.trip-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.trip-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.trip-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.trip-header .el-tag {
  font-size: 12px;
}

.trip-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.trip-detail {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 14px;
}

.trip-summary {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-bottom: 12px;
}

.trip-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.create-trip-btn {
  font-size: 12px;
  height: 28px;
}

/* 无偏好数据提示 */
.no-trips {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.no-trips p {
  margin: 16px 0 24px 0;
  font-size: 16px;
}

/* ========== 偏好标签 ========== */
.preference-tags {
  background: white !important;
  border-radius: 16px !important;
  padding: 24px !important;
  margin: 0 auto !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06) !important;
  width: 100% !important;
  max-width: 1200px !important;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.preference-tag {
  font-size: 14px;
  height: 32px;
}

.edit-preferences-btn {
  font-size: 12px;
  height: 28px;
}

/* ========== 头像对话框 ========== */
.avatar-upload-section {
  text-align: center;
}

.preset-avatars {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.preset-avatar {
  cursor: pointer;
  padding: 8px;
  border: 2px solid transparent;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.preset-avatar:hover {
  border-color: #409EFF;
}

/* 偏好展示区域 */
.my-preferences-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 24px;
  margin: 0 auto 24px auto !important;
  width: 100% !important;
  max-width: 1200px !important;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.preferences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.preference-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  min-height: 100px;
  display: flex;
  flex-direction: column;
}

.preference-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.card-icon {
  margin-right: 8px;
  color: #409eff;
  font-size: 18px;
}

.card-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.card-content {
  color: #606266;
  flex: 1;
  display: flex;
  align-items: center;
  min-height: 40px;
}

/* 标签展示 */
.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preference-tag {
  --el-tag-bg-color: #ecf5ff;
  --el-tag-border-color: #b3d8ff;
  --el-tag-text-color: #409eff;
}

/* 预算展示 */
.budget-display {
  display: flex;
  align-items: baseline;
}

.budget-amount {
  font-size: 20px;
  font-weight: 600;
  color: #67c23a;
}

.budget-unit {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

/* 出行方式展示 */
.transport-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.transport-item {
  background: #e1f3d8;
  color: #67c23a;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* 住宿展示 */
.accommodation-display {
  display: flex;
  align-items: center;
}

.accommodation-type {
  background: #fdf6ec;
  color: #e6a23c;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
}

/* 饮食偏好展示 */
.food-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.food-category {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.category-label {
  font-weight: 500;
  color: #303133;
  min-width: 40px;
}

.food-items {
  color: #606266;
  font-size: 14px;
}

/* 活动时间展示 */
.time-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.time-item {
  background: #f0f9ff;
  color: #409eff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* 旅行节奏展示 */
.pace-display {
  display: flex;
  align-items: center;
}

.pace-text {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

/* 其他偏好展示 */
.other-display {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.other-item {
  display: flex;
  align-items: center;
}

.other-label {
  position: relative;
  padding-left: 16px;
  font-size: 14px;
  color: #606266;
}

.other-label::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #67c23a;
  font-weight: 600;
  font-size: 12px;
}

/* MBTI性格类型卡片内容 */
.mbti-card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mbti-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mbti-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.mbti-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mbti-details {
  flex: 1;
}

.mbti-type {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 4px;
}

.mbti-name {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.mbti-description {
  font-size: 12px;
  color: #909399;
}

/* 无偏好数据提示 */
.no-preferences {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.no-preferences p {
  margin: 16px 0 24px 0;
  font-size: 16px;
}

/* ========== 响应式设计 ========== */
@media (max-width: 768px) {
  .personal-page {
    padding: 12px !important;
  }
  
  .user-info-card {
    flex-direction: column !important;
    gap: 24px !important;
    padding: 20px !important;
  }
  
  .user-avatar-section {
    flex-direction: column !important;
    text-align: center !important;
    gap: 16px !important;
  }
  
  .user-stats {
    gap: 24px !important;
  }
  
  .action-grid {
    grid-template-columns: 1fr !important;
  }

  .personal-container {
    padding: 16px;
  }

  .user-info-card,
  .user-stats,
  .quick-actions,
  .my-trips-section,
  .my-preferences-section {
    margin: 12px auto;
    padding: 12px;
  }

  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .trips-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .trip-card {
    padding: 12px;
    min-height: 80px;
  }

  .trip-header h4 {
    font-size: 13px;
  }

  .trip-header .el-tag {
    font-size: 11px;
  }

  .trip-info {
    flex-direction: column;
    gap: 8px;
  }

  .trip-detail {
    font-size: 12px;
  }

  .trip-summary {
    font-size: 11px;
  }

  .trip-actions {
    justify-content: center;
  }

  .create-trip-btn {
    font-size: 11px;
    height: 26px;
  }

  .no-trips {
    padding: 40px 16px;
  }
  
  /* MBTI卡片移动端适配 */
  .mbti-card-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }
  
  .mbti-display {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  
  .mbti-avatar {
    width: 50px;
    height: 50px;
  }
  
  .mbti-type {
    font-size: 16px;
  }
  
  .mbti-name {
    font-size: 13px;
  }
  
  .mbti-description {
    font-size: 11px;
  }
}
</style> 