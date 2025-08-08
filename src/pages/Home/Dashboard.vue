<template>
  <div class="home-page">
    <!-- 快捷操作 -->
    <section class="quick-actions">
      <h3 class="section-title">{{ t('home.quickActions') }}</h3>
      <div class="action-grid">
        <!-- 仅保留 AI 行程生成入口 -->
        <div class="action-card" @click="openAiScenarios = true">
          <div class="action-icon violet">
            <el-icon size="24"><Cpu /></el-icon>
          </div>
          <h4>{{ t('home.aiEntry') }}</h4>
          <p>{{ t('home.aiEntryDesc') }}</p>
        </div>
      </div>
    </section>

    <!-- 继续未完成进度 -->
    <section v-if="hasProgress" class="progress-section">
      <el-card class="progress-card" shadow="hover">
        <div class="progress-content">
          <div class="progress-texts">
            <h4>{{ t('home.continueProgress') }}</h4>
            <p class="progress-desc">
              <el-tag size="small" type="info" effect="plain">{{ progressSummary.destination || t('common.none') }}</el-tag>
              <span class="dot" />
              <span>{{ progressSummary.stepName }}</span>
              <span class="dot" />
              <span>{{ progressSummary.timeAgo }}</span>
            </p>
          </div>
          <div class="progress-actions">
            <el-button type="primary" @click="resumeProgress">{{ t('home.resume') }}</el-button>
            <el-button type="danger" plain @click="discardProgress">{{ t('home.discard') }}</el-button>
          </div>
        </div>
      </el-card>
    </section>

    <!-- 我的行程 -->
    <section class="my-trips-section">
      <div class="section-header">
        <h3 class="section-title">{{ t('personal.myTrips') }}</h3>
        <div class="header-actions"><el-segmented v-model="tripTab" :options="tripTabs" size="small" /></div>
        <el-button size="small" type="primary" plain class="create-trip-btn" @click="goToCreate">
          <el-icon><Plus /></el-icon>
          {{ t('personal.createNewTrip') }}
        </el-button>
      </div>

      <div v-if="displayTrips.length > 0" class="trips-grid">
        <div v-for="trip in displayTrips" :key="trip.id" class="trip-card" @click="viewTripDetail(trip)">
          <div class="trip-header">
            <h4>{{ trip.title }}</h4>
            <div class="trip-tags">
              <el-tag v-if="trip.aiGenerated" type="primary" size="small" class="ai-tag">
                {{ t('personal.aiGenerated') }}
              </el-tag>
              <el-tag :type="trip.status === 'draft' ? 'info' : 'success'" size="small">
                {{ trip.status === 'draft' ? t('personal.status.draft') : t('personal.status.completed') }}
              </el-tag>
            </div>
          </div>
          <div class="trip-info">
            <div class="trip-detail"><el-icon><MapLocation /></el-icon><span>{{ trip.destinationName }}</span></div>
            <div class="trip-detail"><el-icon><Calendar /></el-icon><span>{{ trip.days }}{{ t('personal.daysSuffix') }}</span></div>
            <div class="trip-detail"><el-icon><User /></el-icon><span>{{ trip.travelers }}{{ t('personal.travelersSuffix') }}</span></div>
          </div>
          <div class="trip-actions">
            <el-button size="small" type="primary" plain @click.stop="editTrip(trip)">{{ t('common.edit') }}</el-button>
            <el-button size="small" type="danger" plain @click.stop="deleteTrip(trip.id)">{{ t('common.delete') }}</el-button>
          </div>
        </div>
      </div>

      <div v-else class="no-trips">
        <el-icon size="48" color="#C0C4CC"><DocumentCopy /></el-icon>
        <p>{{ t('personal.noTrips') }}</p>
        <el-button type="primary" @click="goToCreate">{{ t('personal.createNow') }}</el-button>
      </div>
    </section>

    

    <!-- 天气速览 -->
    <section class="weather-section">
      <h3 class="section-title">{{ t('home.weather.title') }}</h3>
      <el-card v-if="weather" class="weather-card" shadow="hover">
        <div class="weather-top">
          <div class="w-left">
            <div class="w-city">{{ weather.city }}</div>
            <div class="w-desc">{{ weather.weatherDesc }}</div>
          </div>
          <div class="w-right">
            <div class="w-temp">{{ weather.currentTemp }}°C</div>
            <div class="w-range">{{ weather.tempRange }}</div>
          </div>
        </div>
        <div class="forecast">
          <div v-for="(f, i) in (weather.forecast || []).slice(0,3)" :key="i" class="f-item">
            <div class="f-date">{{ f.date }}</div>
            <div class="f-weather">{{ f.dayWeather }}</div>
            <div class="f-temp">{{ f.dayTemp }} / {{ f.nightTemp }}</div>
          </div>
        </div>
      </el-card>
      <el-empty v-else :description="t('home.weather.none')" />
    </section>

    <!-- 模板与场景弹层 -->
    

    <el-dialog v-model="openAiScenarios" :title="t('home.scenarios.title')" width="600px">
      <div class="tpl-grid">
        <div v-for="sc in scenarios" :key="sc.id" class="tpl-card" @click="applyScenario(sc)">
          <h4>{{ sc.title }}</h4>
          <p>{{ sc.desc }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="openAiScenarios=false">{{ t('common.close') }}</el-button>
      </template>
    </el-dialog>

    <!-- 公告/发现 -->
    <section class="ann-section">
      <h3 class="section-title">{{ t('home.announcements') }}</h3>
      <div class="ann-list">
        <el-empty v-if="announcements.length === 0" :description="t('common.none')" />
        <el-alert
          v-for="(item, idx) in announcements"
          :key="idx"
          :title="item.title"
          :type="item.type"
          :description="item.desc"
          show-icon
          class="ann-item"
        />
      </div>
    </section>
  </div>
  
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MapLocation, Calendar, Cpu, Plus, User, DocumentCopy } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user.js'
import { useI18n } from '@/utils/i18n.js'
import { tripProgressManager } from '@/utils/tripProgress.js'
import { convertBackendTripToFrontend } from '@/utils/tripDataConverter.js'
import { handleApiError, handleSuccess } from '@/utils/errorHandler.js'
import { aiScenarios } from '@/data/aiScenarios.js'
import { weatherApi } from '@/api/weather.js'

export default {
  name: 'HomeDashboard',
  components: { MapLocation, Calendar, Cpu, Plus, User, DocumentCopy },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const { t } = useI18n()

    const savedTrips = ref([])
    const hasProgress = ref(false)
    const progressSummary = ref({})
    const openAiScenarios = ref(false)
    const scenarios = ref(aiScenarios)
    const weather = ref(null)
    const tripTab = ref('recent')
    const tripTabs = [
      { label: t('home.trips.recent'), value: 'recent' },
      { label: t('home.trips.drafts'), value: 'drafts' },
    ]

    const announcements = ref([
      { title: t('home.ann.sample1.title'), desc: t('home.ann.sample1.desc'), type: 'info' },
    ])

    const refreshProgress = () => {
      hasProgress.value = tripProgressManager.hasProgress()
      progressSummary.value = tripProgressManager.getProgressSummary() || {}
    }

    const goToCreate = () => router.push('/destinations')
    const resumeProgress = () => router.push('/trip/create')
    const discardProgress = async () => {
      try {
        await ElMessageBox.confirm(t('home.discardConfirm'), t('common.warning'), {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning',
        })
        tripProgressManager.clearProgress()
        refreshProgress()
        ElMessage.success(t('messages.updateSuccess'))
      } catch {}
    }

    const loadSavedTrips = async () => {
      try {
        if (!userStore.currentUser?.id) {
          savedTrips.value = []
          return
        }
        const { tripApi } = await import('@/api/trip.js')
        const response = await tripApi.getUserTrips(userStore.currentUser.id)
        if (response.data) {
          savedTrips.value = response.data.map(convertBackendTripToFrontend)
        } else {
          savedTrips.value = []
        }
      } catch (error) {
        handleApiError(error, '加载行程数据失败', { showNotification: false, logError: true })
        try {
          const trips = localStorage.getItem('savedTrips')
          savedTrips.value = trips ? JSON.parse(trips).map(convertBackendTripToFrontend) : []
        } catch {
          savedTrips.value = []
        }
      }
    }

    const displayTrips = computed(() => {
      const list = [...savedTrips.value]
      // 最近优先：按更新时间/创建时间倒序
      list.sort((a,b)=> (new Date(b.updatedAt||b.createdAt||0)) - (new Date(a.updatedAt||a.createdAt||0)))
      if (tripTab.value === 'drafts') return list.filter(x=>x.status==='draft')
      return list.slice(0, 8)
    })

    const viewTripDetail = (trip) => {
      try {
        if (trip.aiGenerated) {
          router.push({ name: 'AiTripEdit', params: { id: trip.id }, query: { readonly: 'true' } })
        } else {
          router.push({ name: 'TripDetail', params: { id: trip.id } })
        }
      } catch {
        ElMessage.error(t('personal.messages.navigationFail'))
      }
    }

    const editTrip = (trip) => {
      try {
        if (trip.aiGenerated) {
          router.push({ name: 'AiTripEdit', params: { id: trip.id } })
        } else {
          router.push({ name: 'TripDetail', params: { id: trip.id }, query: { edit: 'true' } })
        }
      } catch {
        ElMessage.error(t('personal.messages.navigationFail'))
      }
    }

    const deleteTrip = async (tripId) => {
      try {
        await ElMessageBox.confirm(t('personal.dialog.deleteTripMessage'), t('personal.dialog.deleteTripTitle'), {
          confirmButtonText: t('common.delete'),
          cancelButtonText: t('common.cancel'),
          type: 'warning',
        })
        if (!userStore.currentUser?.id) {
          ElMessage.error(t('personal.messages.notLoggedIn'))
          return
        }
        const { tripApi } = await import('@/api/trip.js')
        await tripApi.deleteTrip(tripId, userStore.currentUser.id)
        await loadSavedTrips()
        handleSuccess(t('personal.messages.tripDeleteSuccess'))
      } catch (error) {
        if (error === 'cancel') return
        handleApiError(error, t('personal.messages.tripDeleteFail'))
      }
    }

    onMounted(async () => {
      // 登录校验与数据加载
      if (!userStore.isLoggedIn) {
        router.push('/login')
        return
      }
      await loadSavedTrips()
      refreshProgress()
      // 天气速览：优先使用进度中的目的地，否则取最近行程的目的地
      let city = progressSummary.value?.destination || (savedTrips.value[0]?.destinationName)
      if (city) {
        try {
          const ws = await weatherApi.getWeatherSuggestions(city, new Date(), 3)
          weather.value = ws
        } catch(e) { console.warn('获取天气失败', e) }
      }
    })

    // 应用模板/场景：通过 query 传递预填信息到创建页
    const applyScenario = (sc) => {
      openAiScenarios.value = false
      // 先到目的地选择，带上预设，选择城市后会透传到创建页
      router.push({ path: '/destinations', query: { preset: encodeURIComponent(JSON.stringify({ type: 'scenario', id: sc.id })) } })
    }

    return {
      t,
      savedTrips,
      hasProgress,
      progressSummary,
      announcements,
      goToCreate,
      resumeProgress,
      discardProgress,
      viewTripDetail,
      editTrip,
      deleteTrip,
      tripTab,
      tripTabs,
      displayTrips,
      weather,
      openAiScenarios,
      scenarios,
      applyScenario,
    }
  },
}
</script>

<style scoped>
.home-page {
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
  overflow-x: hidden !important;
  z-index: 1 !important;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

/* 快捷操作 */
.quick-actions {
  margin: 0 auto 24px auto;
  max-width: 1200px;
}
.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.action-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: #fff;
}
.action-icon.primary { background: linear-gradient(135deg,#409eff,#67c23a); }
.action-icon.success { background: linear-gradient(135deg,#07C160,#34d399); }
.action-icon.violet { background: linear-gradient(135deg,#667eea,#764ba2); }
.action-card h4 { margin: 8px 0 6px; color: #303133; }
.action-card p { margin: 0; color: #909399; font-size: 13px; }

/* 继续进度 */
.progress-section { max-width: 1200px; margin: 0 auto 24px; }
.progress-card { border-radius: 12px; }
.progress-content { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.progress-desc { margin-top: 6px; color: #606266; display: flex; align-items: center; gap: 8px; }
.dot { width: 4px; height: 4px; border-radius: 50%; background: #dcdfe6; display: inline-block; }

/* 我的行程 */
.my-trips-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 20px;
  margin: 0 auto 24px auto;
  max-width: 1200px;
}
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0; }
.header-actions { margin-left: auto; margin-right: 12px; }
.trips-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.trip-card { background: #f8f9fa; border-radius: 8px; padding: 16px; border: 1px solid #e9ecef; transition: all 0.3s; display: flex; flex-direction: column; }
.trip-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-2px); }
.trip-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.trip-header h4 { margin: 0; font-size: 15px; color: #303133; }
.trip-tags { display: flex; align-items: center; gap: 6px; }
.ai-tag { background: linear-gradient(135deg,#667eea,#764ba2); border: none; color: #fff; font-weight: 500; }
.trip-info { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px; }
.trip-detail { display: inline-flex; align-items: center; gap: 6px; color: #909399; font-size: 13px; }
.trip-actions { display: flex; gap: 8px; justify-content: flex-end; }
.no-trips { text-align: center; padding: 40px 20px; color: #909399; }

/* 公告 */
.ann-section { max-width: 1200px; margin: 0 auto 24px; }
.ann-item { margin-bottom: 10px; }

/* 模板/场景弹层 */
.tpl-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.tpl-card { border: 1px solid #ebeef5; border-radius: 10px; padding: 12px; background: #fff; cursor: pointer; transition: .2s; }
.tpl-card:hover { border-color: #b3d8ff; box-shadow: 0 6px 16px rgba(0,0,0,.08); transform: translateY(-2px); }

/* 模板快捷区 */
.templates-section { max-width: 1200px; margin: 0 auto 24px; }

/* 天气速览 */
.weather-section { max-width: 1200px; margin: 0 auto 24px; }
.weather-card { border-radius: 12px; }
.weather-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.w-city { font-weight: 600; color: #303133; }
.w-desc { color: #909399; font-size: 13px; }
.w-temp { font-size: 28px; font-weight: 700; color: #303133; text-align: right; }
.w-range { color: #909399; font-size: 12px; text-align: right; }
.forecast { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.f-item { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 8px; text-align: center; }
.f-date { font-size: 12px; color: #606266; }
.f-weather { font-size: 13px; color: #303133; margin: 4px 0; }
.f-temp { font-size: 12px; color: #909399; }

@media (max-width: 768px) {
  .home-page { padding: 12px; }
  .action-grid { grid-template-columns: 1fr; }
  .progress-content { flex-direction: column; align-items: flex-start; }
}
</style>



