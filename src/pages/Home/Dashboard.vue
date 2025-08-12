<template>
  <div class="page-shell home-page">
    <!-- 快捷操作 -->
    <section class="quick-actions">
      <h3 class="section-title">快捷操作</h3>
      <div class="action-grid">
        <!-- 仅保留 AI 行程生成入口：直接进入创建流程 -->
        <div class="action-card"
@click="goToCreate">
          <div class="action-icon violet">
            <el-icon size="24">
              <Cpu />
            </el-icon>
          </div>
          <h4>AI智能规划</h4>
          <p>智能生成个性化行程</p>
        </div>
      </div>
    </section>

    <!-- 继续未完成进度 -->
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

    <!-- AI 场景推荐（4条） -->
    <section class="templates-section">
      <h3 class="section-title">推荐场景</h3>
      <div class="tpl-grid">
        <div
          v-for="sc in scenarios.slice(0, 4)"
          :key="sc.id"
          class="tpl-card tpl-card--scenario"
          @click="applyScenario(sc)"
        >
          <div
            class="tpl-cover"
            :style="sc.cover ? { backgroundImage: `url(${sc.cover})` } : {}"
          >
            <div class="tpl-cover-mask" />
            <div class="tpl-cover-text">
              <div class="tpl-title">
                {{ sc.title }}
              </div>
              <div class="tpl-desc">
                {{ sc.desc }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 我的行程 -->
    <section class="my-trips-section">
      <div class="section-header">
        <h3 class="section-title">我的行程</h3>
        <div class="header-actions">
          <el-segmented v-model="tripTab"
:options="tripTabs" size="small" />
        </div>
        <el-button
          size="small"
          type="primary"
          plain
          class="create-trip-btn"
          @click="goToCreate"
        >
          <el-icon><Plus /></el-icon>
          新建行程
        </el-button>
      </div>

      <div v-if="displayTrips.length > 0"
class="trips-grid">
        <div
          v-for="trip in displayTrips"
          :key="trip.id"
          class="trip-card"
          :class="{ 'draft-card': trip.isDraft }"
          :data-auto-draft="trip.draftData?.isAuto || false"
          @click="viewTripDetail(trip)"
        >
          <div class="trip-header">
            <h4>{{ trip.title }}</h4>
            <div class="trip-tags">
              <el-tag
                v-if="trip.aiGenerated"
                type="primary"
                size="small"
                class="ai-tag"
              >
                AI生成
              </el-tag>
              <el-tag
                :type="
                  trip.isDraft
                    ? trip.draftData?.isAuto
                      ? 'info'
                      : 'warning'
                    : trip.status === 'draft'
                      ? 'info'
                      : 'success'
                "
                size="small"
                :effect="trip.isDraft ? 'plain' : 'dark'"
              >
                {{
                  trip.isDraft
                    ? trip.draftData?.isAuto
                      ? "自动保存"
                      : "草稿"
                    : trip.status === "draft"
                      ? "草稿"
                      : "已完成"
                }}
              </el-tag>
            </div>
          </div>
          <div class="trip-info">
            <div class="trip-detail">
              <el-icon><MapLocation /></el-icon><span>{{ trip.destinationName }}</span>
            </div>
            <div class="trip-detail">
              <el-icon><Calendar /></el-icon><span>{{ trip.days }}天</span>
            </div>
            <div v-if="trip.isDraft"
class="trip-detail">
              <el-icon><List /></el-icon>
              <span>{{ getStepName(trip.currentStep) }}</span>
            </div>
            <div class="trip-detail">
              <el-icon><User /></el-icon><span>{{ trip.travelers }}人</span>
            </div>
          </div>
          <div class="trip-actions">
            <template v-if="trip.isDraft">
              <!-- 草稿操作 -->
              <el-button
                size="small"
                type="primary"
                @click.stop="handleLoadDraft(trip.id)"
              >
                <el-icon><EditPen /></el-icon>
                继续编辑
              </el-button>
              <el-button
                size="small"
                type="danger"
                plain
                @click.stop="deleteTrip(trip)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
            <template v-else>
              <!-- 真实行程操作 -->
              <el-button
                size="small"
                type="primary"
                plain
                @click.stop="editTrip(trip)"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                type="danger"
                plain
                @click.stop="deleteTrip(trip)"
              >
                删除
              </el-button>
            </template>
          </div>
        </div>
      </div>

      <div v-else
class="no-trips">
        <el-icon size="48"
color="#C0C4CC">
          <DocumentCopy />
        </el-icon>
        <p>暂无行程</p>
        <el-button
type="primary" @click="goToCreate"> 立即创建 </el-button>
      </div>
    </section>

    <!-- 愿望清单管理 -->
    <section class="wishlist-section">
      <WishlistManager @weather-city-change="handleWeatherCityChange" />
    </section>

    <!-- 天气速览 -->
    <section class="weather-section">
      <div class="weather-header">
        <h3 class="section-title">天气预览</h3>
        <div v-if="wishlistStore.hasCities"
class="weather-controls">
          <el-button
            size="small"
            type="primary"
            plain
            :loading="loadingWeather"
            @click="refreshWeatherFromWishlist"
          >
            <el-icon><Refresh /></el-icon>
            随机切换
          </el-button>
          <el-button
            size="small"
            type="success"
            plain
            :class="{ 'auto-refresh-active': autoRefreshEnabled }"
            @click="toggleAutoRefresh"
          >
            <el-icon><Timer /></el-icon>
            {{ autoRefreshEnabled ? "停止自动" : "自动轮播" }}
          </el-button>
        </div>
      </div>
      <el-card v-if="weather"
class="weather-card" shadow="hover">
        <div class="weather-top">
          <div class="w-left">
            <div class="w-city">
              {{ weather.city }}
              <el-tag
                v-if="isWishlistWeather"
                size="small"
                type="success"
                effect="plain"
              >
                愿望清单
              </el-tag>
            </div>
            <div class="w-desc">
              {{ weather.weatherDesc }}
            </div>
          </div>
          <div class="w-right">
            <div class="w-temp">{{ weather.currentTemp }}°C</div>
            <div class="w-range">
              {{ weather.tempRange }}
            </div>
          </div>
        </div>
        <div class="forecast">
          <div
            v-for="(f, i) in (weather.forecast || []).slice(0, 3)"
            :key="i"
            class="f-item"
          >
            <div class="f-date">
              {{ f.date }}
            </div>
            <div class="f-weather">
              {{ f.dayWeather }}
            </div>
            <div class="f-temp">{{ f.dayTemp }} / {{ f.nightTemp }}</div>
          </div>
        </div>
      </el-card>
      <el-empty v-else
description="暂无天气信息" />
    </section>

    <!-- 公告/发现 -->
    <section class="ann-section">
      <h3 class="section-title">公告通知</h3>
      <div class="ann-list">
        <el-empty v-if="announcements.length === 0"
description="暂无公告" />
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
} from "@element-plus/icons-vue";
import { useUserStore } from "@/store/user.js";
import { useWishlistStore } from "@/store/wishlist.js";
import { draftManager } from "@/utils/draftManager.js";
import { useDraftStore } from "@/store/draft.js";
import { convertBackendTripToFrontend } from "@/utils/tripDataConverter.js";
import { handleApiError, handleSuccess } from "@/utils/errorHandler.js";
import { aiScenarios } from "@/data/aiScenarios.js";
import { weatherApi } from "@/api/weather.js";
import WishlistManager from "@/components/Common/WishlistManager.vue";

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
    WishlistManager,
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
    const tripTab = ref("recent");
    const tripTabs = [
      { label: "最近", value: "recent" },
      { label: "草稿", value: "drafts" },
    ];

    const announcements = ref([
      {
        title: "欢迎使用GoingTour",
        desc: "开始您的智能旅行规划之旅！",
        type: "info",
      },
    ]);

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
      if (tripTab.value === "drafts") {
        // 返回草稿数据，转换为与trips兼容的格式
        return drafts.value.map((draft) => ({
          id: draft.id,
          title: draft.name,
          destinationName: draft.baseForm?.destinationName || "未知目的地",
          days: draft.baseForm?.days || 0,
          status: "draft",
          createdAt: draft.createdAt,
          updatedAt: draft.updatedAt,
          currentStep: draft.currentStep,
          isDraft: true,
          // 添加草稿特有的数据
          draftData: draft,
        }));
      }

      const list = [...savedTrips.value];
      // 最近优先：按更新时间/创建时间倒序
      list.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0) -
          new Date(a.updatedAt || a.createdAt || 0),
      );
      return list.slice(0, 8);
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
      cityCode = null,
      fromWishlist = false,
    ) => {
      if (!cityName) return;

      loadingWeather.value = true;
      isWishlistWeather.value = fromWishlist;

      try {
        const ws = await weatherApi.getWeatherSuggestions(
          cityCode || cityName,
          new Date(),
          3,
        );
        weather.value = ws;
        console.log(`✅ 天气数据加载成功: ${cityName}`);
      } catch (e) {
        console.warn(`获取${cityName}天气失败:`, e);
      } finally {
        loadingWeather.value = false;
      }
    };

    // 从愿望清单随机获取天气
    const refreshWeatherFromWishlist = async () => {
      if (!wishlistStore.hasCities) {
        ElMessage.info("愿望清单为空，无法切换城市天气");
        return;
      }

      const randomCity = wishlistStore.getRandomCity;
      if (randomCity) {
        await loadWeatherForCity(
          randomCity.cityName,
          randomCity.cityCode,
          true,
        );
        wishlistStore.setCurrentWeatherCity(randomCity);
        ElMessage.success(`已切换到 ${randomCity.cityName} 的天气`);
      }
    };

    // 处理愿望清单天气城市变更
    const handleWeatherCityChange = async (city) => {
      await loadWeatherForCity(city.cityName, city.cityCode, true);
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

      // 天气速览优先级: 1.愿望清单随机城市 2.进度中的目的地 3.最近行程的目的地
      if (wishlistStore.hasCities) {
        const randomCity = wishlistStore.getRandomCity;
        if (randomCity) {
          await loadWeatherForCity(
            randomCity.cityName,
            randomCity.cityCode,
            true,
          );
          wishlistStore.setCurrentWeatherCity(randomCity);
        }
      } else {
        const city =
          progressSummary.value?.destination ||
          savedTrips.value[0]?.destinationName;
        if (city) {
          await loadWeatherForCity(city, null, false);
        }
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
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
.action-icon.primary {
  background: linear-gradient(135deg, #409eff, #67c23a);
}
.action-icon.success {
  background: linear-gradient(135deg, #07c160, #34d399);
}
.action-icon.violet {
  background: linear-gradient(135deg, #667eea, #764ba2);
}
.action-card h4 {
  margin: 8px 0 6px;
  color: #303133;
}
.action-card p {
  margin: 0;
  color: #909399;
  font-size: 13px;
}

/* 继续进度 */
.progress-section {
  max-width: 1200px;
  margin: 0 auto 24px;
}
.progress-card {
  border-radius: 12px;
}
.progress-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.progress-desc {
  margin-top: 6px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 8px;
}
.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #dcdfe6;
  display: inline-block;
}

/* 我的行程 */
.my-trips-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 20px;
  margin: 0 auto 24px auto;
  max-width: 1200px;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}
.header-actions {
  margin-left: auto;
  margin-right: 12px;
}
.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}
.trip-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}
.trip-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
.trip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.trip-header h4 {
  margin: 0;
  font-size: 15px;
  color: #303133;
}
.trip-tags {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ai-tag {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: #fff;
  font-weight: 500;
}
.trip-info {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}
.trip-detail {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 13px;
}
.trip-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.no-trips {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

/* 公告 */
.ann-section {
  max-width: 1200px;
  margin: 0 auto 24px;
}
.ann-item {
  margin-bottom: 10px;
}

/* 模板/场景弹层 */
.tpl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
.tpl-card {
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 12px;
  background: #fff;
  cursor: pointer;
  transition: 0.2s;
}
.tpl-card:hover {
  border-color: #b3d8ff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

/* 场景卡 - 图片封面布局 */
.tpl-card--scenario {
  padding: 0;
  overflow: hidden;
}
.tpl-cover {
  position: relative;
  height: 132px;
  background: linear-gradient(135deg, #e9eef3, #f5f7fa);
  background-size: cover;
  background-position: center;
  border-radius: 10px;
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
  font-size: 14px;
  line-height: 1.2;
}
.tpl-desc {
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.9;
}

/* 模板快捷区 */
.templates-section {
  max-width: 1200px;
  margin: 0 auto 24px;
}

/* 愿望清单 */
.wishlist-section {
  max-width: 1200px;
  margin: 0 auto 24px;
}

/* 天气速览 */
.weather-section {
  max-width: 1200px;
  margin: 0 auto 24px;
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
  background: #f0f9ff !important;
  border-color: #67c23a !important;
  color: #67c23a !important;
}
.weather-card {
  border-radius: 12px;
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
}
.w-desc {
  color: #909399;
  font-size: 13px;
}
.w-temp {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  text-align: right;
}
.w-range {
  color: #909399;
  font-size: 12px;
  text-align: right;
}
.forecast {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.f-item {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 8px;
  text-align: center;
}
.f-date {
  font-size: 12px;
  color: #606266;
}
.f-weather {
  font-size: 13px;
  color: #303133;
  margin: 4px 0;
}
.f-temp {
  font-size: 12px;
  color: #909399;
}

/* 草稿卡片样式 */
.draft-card {
  border: 2px dashed #e6a23c !important;
  background: linear-gradient(135deg, #fdf6ec, #fefefe) !important;
  position: relative;
}

/* 自动草稿特殊样式 */
.trip-card[data-auto-draft="true"] {
  border: 2px dashed #409eff !important;
  background: linear-gradient(135deg, #ecf5ff, #fefefe) !important;
}

.draft-card::before {
  position: absolute;
  top: -1px;
  right: -1px;
  background: linear-gradient(135deg, #e6a23c, #f39c12);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 0 6px 0 8px;
  z-index: 1;
}

.draft-card:hover {
  border-color: #cf9236 !important;
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.15) !important;
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
}
</style>
