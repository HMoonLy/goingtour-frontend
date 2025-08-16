<template>
  <div class="page-shell home-page">
    <!-- 主要操作区域 -->
    <section class="main-action-section">
      <div class="action-hero">
        <h2 class="hero-title">AI 智能行程规划</h2>
        <p class="hero-subtitle">
          告诉我们您的偏好，为您生成专属的个性化旅行方案
        </p>
        <el-button
          type="primary"
          size="large"
          class="primary-cta-btn"
          @click="goToCreate"
        >
          <el-icon><Cpu /></el-icon>
          开始规划我的行程
        </el-button>
      </div>
    </section>

    <!-- 继续未完成的行程 -->
    <section v-if="hasProgress"
class="progress-section">
      <el-card class="progress-card"
shadow="hover">
        <div class="progress-content">
          <div class="progress-texts">
            <h4>继续未完成的行程</h4>
            <p class="progress-desc">
              <el-tag size="small"
type="info" effect="plain">
                {{ progressSummary.destination || "无" }}
              </el-tag>
              <span class="dot" />
              <span>{{ progressSummary.stepName }}</span>
              <span class="dot" />
              <span>{{ progressSummary.timeAgo }}</span>
            </p>
          </div>
          <div class="progress-actions">
            <el-button
type="primary" @click="resumeProgress"> 继续 </el-button>
            <el-button type="danger"
plain @click="discardProgress">
              舍弃
            </el-button>
          </div>
        </div>
      </el-card>
    </section>

    <!-- AI 场景推荐 -->
    <section class="scenarios-section">
      <div class="section-header">
        <h3 class="section-title">
          <i class="inspiration-icon">✨</i>
          热门场景推荐
        </h3>
        <p class="section-subtitle">
          快速选择您感兴趣的旅行场景，AI将为您定制专属行程
        </p>
      </div>
      <div class="scenarios-grid">
        <div
          v-for="sc in scenarios.slice(0, 4)"
          :key="sc.id"
          class="scenario-card"
          @click="applyScenario(sc)"
        >
          <div
            class="scenario-cover"
            :style="sc.cover ? { backgroundImage: `url(${sc.cover})` } : {}"
          >
            <div class="scenario-overlay">
              <div class="scenario-content">
                <h4>{{ sc.title }}</h4>
                <p>{{ sc.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 最近行程 -->
    <section v-if="recentTripsPreview.length > 0"
class="recent-section">
      <div class="section-header">
        <h3 class="section-title">最近的行程</h3>
        <el-button
          size="small"
          type="primary"
          plain
          @click="goToPersonalCenter"
        >
          查看全部
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <div class="recent-trips">
        <div
          v-for="trip in recentTripsPreview"
          :key="trip.id"
          class="trip-item"
          @click="viewTripDetail(trip)"
        >
          <div class="trip-info">
            <h4>{{ trip.title }}</h4>
            <div class="trip-meta">
              <span>{{ trip.destinationName }}</span>
              <span>{{ trip.days }}天</span>
              <el-tag v-if="trip.isDraft"
type="warning" size="small">
                草稿
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 天气速览 -->
    <section class="auxiliary-section">
      <WeatherSummary
        :weather="weather"
        :loading="loadingWeather"
        @refresh-weather="refreshWeatherFromWishlist"
      />
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  MapLocation,
  Calendar,
  Cpu,
  Plus,
  User,
  DocumentCopy,
  List,
  EditPen,
  Delete,
  Refresh,
  Timer,
  ArrowRight,
} from "@element-plus/icons-vue";
import { useUserStore } from "@/store/user.js";
import { useWishlistStore } from "@/store/wishlist.js";
import { draftManager } from "@/utils/storage/draftManager.js";
import { useDraftStore } from "@/store/draft.js";
import { convertBackendTripToFrontend } from "@/utils/data/tripDataConverter.js";
import { handleApiError, handleSuccess } from "@/utils/api/errorHandler.js";
import { aiScenarios } from "@/data/aiScenarios.js";
import { weatherApi } from "@/api/weather.js";
import WeatherSummary from "@/components/Common/Weather/WeatherSummary.vue";

export default {
  name: "HomeDashboard",
  components: {
    MapLocation,
    Calendar,
    Cpu,
    Plus,
    User,
    DocumentCopy,
    Refresh,
    Timer,
    ArrowRight,
    WeatherSummary,
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const wishlistStore = useWishlistStore();

    const savedTrips = ref([]);
    const hasProgress = ref(false);
    const progressSummary = ref({});
    const scenarios = ref(aiScenarios);
    const weather = ref(null);
    const isWishlistWeather = ref(false);
    const loadingWeather = ref(false);
    const autoRefreshEnabled = ref(false);
    const autoRefreshTimer = ref(null);

    const refreshProgress = async () => {
      // 检查是否有自动草稿（新的进度检查方式）
      hasProgress.value = await draftManager.hasAutoDraft();
      progressSummary.value = (await draftManager.getAutoDraftSummary()) || {};
    };

    // 草稿相关状态
    const drafts = ref([]);
    const draftStats = ref({});

    // 加载草稿列表
    const loadDrafts = async () => {
      drafts.value = await draftManager.getAllDrafts();
      draftStats.value = await draftManager.getDraftStats();
    };

    // 删除草稿
    const handleDeleteDraft = async (draftId) => {
      try {
        const draft = await draftManager.getDraft(draftId);
        if (!draft) return;

        await ElMessageBox.confirm(
          `确定要删除草稿"${draft.name}"吗？删除后无法恢复。`,
          "删除草稿",
          {
            confirmButtonText: "确定删除",
            cancelButtonText: "取消",
            type: "warning",
          },
        );

        const success = await draftManager.deleteDraft(draftId);
        if (success) {
          ElMessage.success("草稿删除成功！");
          loadDrafts();
        } else {
          ElMessage.error("草稿删除失败！");
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("删除草稿失败:", error);
          ElMessage.error("草稿删除失败！");
        }
      }
    };

    // 加载草稿
    const handleLoadDraft = async (draftId) => {
      try {
        console.log("🔄 点击继续编辑，草稿ID:", draftId);

        const draftStore = useDraftStore();

        // 加载草稿到store
        const success = await draftStore.loadDraft(draftId);
        if (success) {
          // 跳转到创建页面
          router.push("/trip/create");
          console.log("✅ 草稿已加载到store，跳转到创建页面");
        }
      } catch (error) {
        console.error("❌ 加载草稿失败:", error);
        ElMessage.error("加载草稿失败，请重试");
      }
    };

    // 获取步骤名称
    const getStepName = (step) => {
      return draftManager.getStepName(step);
    };

    // 获取相对时间
    const getDraftTimeAgo = (timestamp) => {
      return draftManager.getTimeAgo(new Date(timestamp));
    };

    const goToCreate = () => router.push("/destinations");

    // 跳转到目的地选择页面
    const goToDestinations = () => router.push("/destinations");

    // 跳转到个人中心
    const goToPersonalCenter = () => router.push("/personal");
    const resumeProgress = async () => {
      // 获取自动草稿并直接加载
      const autoDraft = await draftManager.getAutoDraft();
      if (autoDraft) {
        router.push(`/trip/create?loadDraft=${autoDraft.id}`);
      } else {
        router.push("/trip/create");
      }
    };
    const discardProgress = async () => {
      try {
        await ElMessageBox.confirm(
          "确定要舍弃当前进度吗？此操作无法撤销。",
          "警告",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          },
        );

        // 删除自动草稿
        const autoDraft = await draftManager.getAutoDraft();
        if (autoDraft) {
          await draftManager.deleteDraft(autoDraft.id);
        }

        refreshProgress();
        loadDrafts(); // 重新加载草稿列表
        ElMessage.success("操作成功！");
      } catch {}
    };

    const loadSavedTrips = async () => {
      try {
        if (!userStore.currentUser?.id) {
          savedTrips.value = [];
          return;
        }
        const { tripApi } = await import("@/api/trip.js");
        const response = await tripApi.getUserTrips(userStore.currentUser.id);
        if (response.data) {
          savedTrips.value = response.data.map(convertBackendTripToFrontend);
        } else {
          savedTrips.value = [];
        }
      } catch (error) {
        handleApiError(error, "加载行程数据失败", {
          showNotification: false,
          logError: true,
        });
        try {
          const trips = localStorage.getItem("savedTrips");
          savedTrips.value = trips
            ? JSON.parse(trips).map(convertBackendTripToFrontend)
            : [];
        } catch {
          savedTrips.value = [];
        }
      }
    };

    const displayTrips = computed(() => {
      const list = [...savedTrips.value];
      // 最近优先：按更新时间/创建时间倒序
      list.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0) -
          new Date(a.updatedAt || a.createdAt || 0),
      );
      return list.slice(0, 8);
    });

    // 最近行程预览（首页显示2-3个）
    const recentTripsPreview = computed(() => {
      const allTrips = [
        ...savedTrips.value,
        ...drafts.value.map((draft) => ({
          id: draft.id,
          title: draft.name,
          destinationName: draft.baseForm?.destinationName || "未知目的地",
          days: draft.baseForm?.days || 0,
          status: "draft",
          createdAt: draft.createdAt,
          updatedAt: draft.updatedAt,
          currentStep: draft.currentStep,
          isDraft: true,
          draftData: draft,
        })),
      ];

      // 按最新更新时间排序，取前3个
      allTrips.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0) -
          new Date(a.updatedAt || a.createdAt || 0),
      );
      return allTrips.slice(0, 3);
    });

    const viewTripDetail = (trip) => {
      try {
        // 如果是草稿，直接加载草稿
        if (trip.isDraft) {
          handleLoadDraft(trip.id);
          return;
        }

        if (trip.aiGenerated) {
          router.push({
            name: "AiTripEdit",
            params: { id: trip.id },
            query: { readonly: "true" },
          });
        } else {
          router.push({ name: "TripDetail", params: { id: trip.id } });
        }
      } catch {
        ElMessage.error("跳转失败，请重试");
      }
    };

    const editTrip = (trip) => {
      try {
        if (trip.aiGenerated) {
          router.push({ name: "AiTripEdit", params: { id: trip.id } });
        } else {
          router.push({
            name: "TripDetail",
            params: { id: trip.id },
            query: { edit: "true" },
          });
        }
      } catch {
        ElMessage.error("跳转失败，请重试");
      }
    };

    const deleteTrip = async (trip) => {
      try {
        // 检查是否是草稿
        if (trip.isDraft) {
          // 这是一个草稿，调用草稿删除方法
          await handleDeleteDraft(trip.id);
          return;
        }

        // 这是一个真实行程，调用后端API
        await ElMessageBox.confirm(
          "确定要删除这个行程吗？删除后无法恢复。",
          "删除行程",
          {
            confirmButtonText: "删除",
            cancelButtonText: "取消",
            type: "warning",
          },
        );
        if (!userStore.currentUser?.id) {
          ElMessage.error("请先登录");
          return;
        }
        const { tripApi } = await import("@/api/trip.js");
        await tripApi.deleteTrip(trip.id, userStore.currentUser.id);
        await loadSavedTrips();
        handleSuccess("行程删除成功！");
      } catch (error) {
        if (error === "cancel") return;
        handleApiError(error, "删除行程失败");
      }
    };

    // 天气相关方法
    const loadWeatherForCity = async (
      cityName,
      adcode = null,
      fromWishlist = false,
    ) => {
      if (!cityName) return;

      loadingWeather.value = true;
      isWishlistWeather.value = fromWishlist;

      try {
        const ws = await weatherApi.getWeatherSuggestions(
          adcode || cityName,
          new Date(),
          3,
        );
        weather.value = ws;
      } catch (e) {
        console.warn(`获取${cityName}天气失败:`, e);
      } finally {
        loadingWeather.value = false;
      }
    };

    // 从愿望清单随机获取天气
    const refreshWeatherFromWishlist = async (cityName = null) => {
      // 如果提供了城市名，直接获取该城市天气
      if (cityName) {
        await loadWeatherForCity(cityName, null, false);
        return;
      }

      if (!wishlistStore.hasCities) {
        // 如果没有愿望清单，显示空状态而不是默认城市天气
        if (cityName) {
          // 如果指定了城市名，则获取该城市天气（来自刷新按钮）
          await loadWeatherForCity(cityName, null, false);
        } else {
          // 没有指定城市且没有愿望清单，显示空状态
          weather.value = null;
        }
        return;
      }

      const randomCity = wishlistStore.getRandomCity;
      if (randomCity) {
        await loadWeatherForCity(
          randomCity.cityName,
          randomCity.adcode,
          true,
        );
        wishlistStore.setCurrentWeatherCity(randomCity);
        ElMessage.success(`已切换到 ${randomCity.cityName} 的天气`);
      }
    };

    // 处理愿望清单天气城市变更
    const handleWeatherCityChange = async (city) => {
      await loadWeatherForCity(city.cityName, city.adcode, true);
    };

    // 切换自动刷新
    const toggleAutoRefresh = () => {
      if (autoRefreshEnabled.value) {
        // 停止自动刷新
        if (autoRefreshTimer.value) {
          clearInterval(autoRefreshTimer.value);
          autoRefreshTimer.value = null;
        }
        autoRefreshEnabled.value = false;
        ElMessage.info("天气自动轮播已停止");
      } else {
        // 开始自动刷新
        if (!wishlistStore.hasCities) {
          ElMessage.warning("愿望清单为空，无法开启自动轮播");
          return;
        }

        autoRefreshEnabled.value = true;
        autoRefreshTimer.value = setInterval(() => {
          refreshWeatherFromWishlist();
        }, 30000); // 30秒切换一次

        ElMessage.success("天气自动轮播已开启，每30秒切换一次");
      }
    };

    onMounted(async () => {
      // 登录校验与数据加载
      if (!userStore.isLoggedIn) {
        router.push("/login");
        return;
      }

      await Promise.all([
        loadSavedTrips(),
        refreshProgress(),
        loadDrafts(),
        wishlistStore.loadWishlist(),
      ]);

      // 天气速览优先级: 1.愿望清单随机城市 2.空状态引导用户添加愿望清单
      if (wishlistStore.hasCities) {
        const randomCity = wishlistStore.getRandomCity;
        if (randomCity) {
          await loadWeatherForCity(
            randomCity.cityName,
            randomCity.adcode,
            true,
          );
          wishlistStore.setCurrentWeatherCity(randomCity);
        }
      } else {
        // 没有愿望城市时，将weather设为null，让WeatherSummary显示空状态
        weather.value = null;
      }
    });

    // 组件卸载时清理定时器
    onBeforeUnmount(() => {
      if (autoRefreshTimer.value) {
        clearInterval(autoRefreshTimer.value);
        autoRefreshTimer.value = null;
      }
    });

    // 应用模板/场景：通过 query 传递预填信息到创建页
    const applyScenario = (sc) => {
      const preset = encodeURIComponent(
        JSON.stringify({ type: "scenario", id: sc.id }),
      );
      // 若场景自带城市，则直达创建页；否则先选目的地
      if (sc.city && sc.city.adcode && sc.city.name) {
        router.push({
          path: "/trip/create",
          query: {
            preset,
            city: sc.city.adcode,
            cityName: encodeURIComponent(sc.city.name),
          },
        });
      } else {
        router.push({ path: "/destinations", query: { preset } });
      }
    };

    return {
      savedTrips,
      hasProgress,
      progressSummary,
      goToCreate,
      goToDestinations,
      goToPersonalCenter,
      resumeProgress,
      discardProgress,
      viewTripDetail,
      editTrip,
      deleteTrip,
      displayTrips,
      recentTripsPreview,
      weather,
      scenarios,
      applyScenario,
      // 草稿相关
      drafts,
      draftStats,
      loadDrafts,
      handleDeleteDraft,
      handleLoadDraft,
      getStepName,
      getDraftTimeAgo,
      // 愿望清单和天气相关
      wishlistStore,
      isWishlistWeather,
      loadingWeather,
      autoRefreshEnabled,
      refreshWeatherFromWishlist,
      handleWeatherCityChange,
      toggleAutoRefresh,
    };
  },
};
</script>

<style scoped>
.global-sticky-hint {
  position: sticky;
  top: var(--header-height); /* 与顶部导航高度一致，避免遮挡 */
  z-index: 2;
}
/* 使用全局 .page-shell 提供的滚动背景，无需额外规则 */

/* 主要操作区域 */
.main-action-section {
  text-align: center;
  padding: 60px 20px;
  max-width: 800px;
  margin: 0 auto 40px;
}

.action-hero {
  max-width: 600px;
  margin: 0 auto;
}

.hero-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 16px 0;
}

.hero-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.primary-cta-btn {
  font-size: 16px;
  padding: 16px 32px;
  border-radius: 12px;
  background: linear-gradient(135deg, #91a8d0 0%, #b8c5d6 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(145, 168, 208, 0.3);
  transition: all 0.3s ease;
}

.primary-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(145, 168, 208, 0.4);
}

/* 进度续建区域 */
.progress-section {
  max-width: 1200px;
  margin: 0 auto 40px;
  padding: 0 20px;
}

.progress-card {
  border-radius: 12px;
  border: 1px solid rgba(145, 168, 208, 0.15);
}

.progress-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.progress-desc {
  margin-top: 6px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #d1d5db;
  display: inline-block;
}

/* AI场景推荐 */
.scenarios-section {
  max-width: 1200px;
  margin: 0 auto 40px;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.section-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.inspiration-icon {
  font-style: normal;
  font-size: 20px;
}

.scenarios-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.scenario-card {
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.scenario-card:hover {
  transform: translateY(-4px);
}

.scenario-cover {
  height: 180px;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  background-size: cover;
  background-position: center;
  position: relative;
}

.scenario-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
  display: flex;
  align-items: flex-end;
  padding: 20px;
  color: white;
}

.scenario-content h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.scenario-content p {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

/* 最近行程 */
.recent-section {
  max-width: 1200px;
  margin: 0 auto 40px;
  padding: 0 20px;
}

.recent-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  text-align: left;
}

.recent-section .section-title {
  justify-content: flex-start;
}

.recent-trips {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trip-item {
  padding: 16px;
  background: #ffffff;
  border: 1px solid rgba(145, 168, 208, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.trip-item:hover {
  border-color: rgba(145, 168, 208, 0.25);
  box-shadow: 0 2px 8px rgba(145, 168, 208, 0.1);
}

.trip-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.trip-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #6b7280;
}

/* 辅助区域 */
.auxiliary-section {
  max-width: 1200px;
  margin: 0 auto 32px;
  padding: 0 20px;
}

.progress-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.progress-desc {
  margin-top: 6px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
}
.progress-desc .el-tag {
  background: #91a8d0;
  color: #ffffff;
  border: none;
}
.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #d1d5db;
  display: inline-block;
}

/* 最近行程预览 */
.recent-trips-section {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(145, 168, 208, 0.12);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin: 0 auto 32px auto;
  max-width: 1200px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(145, 168, 208, 0.1);
}

.view-all-btn {
  background: #91a8d0;
  color: #ffffff;
  border: none;
  box-shadow: 0 1px 3px rgba(145, 168, 208, 0.3);
  gap: 4px;
}

.view-all-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(145, 168, 208, 0.4);
}

.recent-trips-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-trip-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  transition: all 0.2s ease;
  cursor: pointer;
}

.recent-trip-card:hover {
  background: #f1f5f9;
  border-color: rgba(145, 168, 208, 0.2);
  transform: translateY(-1px);
}

.trip-summary h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.trip-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #6b7280;
}

.destination {
  color: #91a8d0;
  font-weight: 500;
}

.duration {
  color: #6b7280;
}

.no-recent-trips {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

.no-recent-trips p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

/* AI 场景推荐区域 */
.templates-section {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(145, 168, 208, 0.12);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin: 0 auto 32px auto;
  max-width: 1200px;
}

.section-header-with-description {
  text-align: center;
  margin-bottom: 32px;
}

.section-header-with-description .section-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.inspiration-icon {
  font-style: normal;
  font-size: 24px;
}

.section-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

/* 模板/场景弹层 */
.tpl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.tpl-card {
  border: 1px solid rgba(145, 168, 208, 0.1);
  border-radius: 12px;
  padding: 0;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.tpl-card.enhanced:hover {
  border-color: rgba(145, 168, 208, 0.35);
  box-shadow: 0 12px 32px rgba(145, 168, 208, 0.2);
  transform: translateY(-6px);
}

.tpl-card:hover {
  border-color: rgba(145, 168, 208, 0.25);
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

/* 场景卡 - 图片封面布局 */
.tpl-card--scenario {
  padding: 0;
  overflow: hidden;
}

.tpl-cover {
  position: relative;
  height: 160px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  overflow: hidden;
}

.tpl-cover-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 30%,
    rgba(0, 0, 0, 0.7) 100%
  );
}

.tpl-cover-text {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 16px;
  color: #fff;
}

.tpl-title {
  font-weight: 600;
  font-size: 16px;
  line-height: 1.3;
  margin-bottom: 4px;
}

.tpl-desc {
  font-size: 12px;
  opacity: 0.9;
  line-height: 1.4;
}

.try-button {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.95);
  color: #91a8d0;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tpl-card.enhanced:hover .try-button {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 768px) {
  .tpl-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .tpl-cover {
    height: 140px;
  }
}
.tpl-cover-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 30%,
    rgba(0, 0, 0, 0.45) 100%
  );
}
.tpl-cover-text {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 10px;
  color: #fff;
}
.tpl-title {
  font-weight: 600;
  font-size: 15px;
  line-height: 1.3;
}
.tpl-desc {
  margin-top: 4px;
  font-size: 13px;
  opacity: 0.9;
  line-height: 1.4;
}

/* AI 场景推荐区域 */
.templates-section {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(145, 168, 208, 0.12);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin: 0 auto 32px auto;
  max-width: 1200px;
}

/* 愿望清单 */
.wishlist-section {
  max-width: 1200px;
  margin: 0 auto 32px;
}

/* 天气速览 */
.weather-section {
  max-width: 1200px;
  margin: 0 auto 32px;
}
.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.weather-controls {
  display: flex;
  gap: 8px;
}
.auto-refresh-active {
  background: rgba(247, 202, 201, 0.1) !important;
  border-color: #f7cac9 !important;
  color: #b87c7a !important;
}
.weather-card {
  border-radius: 12px;
  border: 1px solid rgba(145, 168, 208, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.weather-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.w-city {
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}
.w-desc {
  color: #6b7280;
  font-size: 14px;
}
.w-temp {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  text-align: right;
}
.w-range {
  color: #6b7280;
  font-size: 14px;
  text-align: right;
}
.forecast {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.f-item {
  background: #ffffff;
  border: 1px solid rgba(145, 168, 208, 0.1);
  border-radius: 8px;
  padding: 12px 8px;
  text-align: center;
}
.f-date {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
}
.f-weather {
  font-size: 14px;
  color: #303133;
  margin: 4px 0;
  font-weight: 500;
}
.f-temp {
  font-size: 13px;
  color: #6b7280;
}

/* 草稿卡片样式 */
.draft-card {
  border: 2px dashed rgba(145, 168, 208, 0.4) !important;
  background: rgba(145, 168, 208, 0.02) !important;
  position: relative;
}

/* 自动草稿特殊样式 */
.trip-card[data-auto-draft="true"] {
  border: 2px dashed rgba(247, 202, 201, 0.4) !important;
  background: rgba(247, 202, 201, 0.02) !important;
}

.draft-card::before {
  position: absolute;
  top: -1px;
  right: -1px;
  background: #91a8d0;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 0 8px 0 8px;
  z-index: 1;
}

.draft-card:hover {
  border-color: rgba(145, 168, 208, 0.6) !important;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.1) !important;
}

@media (max-width: 768px) {
  .home-page {
    padding: 12px;
  }
  .action-grid {
    grid-template-columns: 1fr;
  }
  .progress-content {
    flex-direction: column;
    align-items: flex-start;
  }
  .scenarios-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 1200px) {
  .scenarios-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }
}

@media (max-width: 992px) {
  .scenarios-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}
</style>
