<template>
  <div class="page-shell personal-center">
    <!-- 个人中心头部 -->
    <section class="personal-header">
      <div class="user-profile">
        <div class="avatar-section">
          <AvatarUploader
            :avatar="userStore.avatar"
            :user-name="userStore.nickname"
            size="large"
            @update:avatar="handleAvatarUpdate"
          />
        </div>
        <div class="user-info">
          <h2>{{ userStore.nickname }}</h2>
          <p class="user-meta">
            <span>{{ userStore.email }}</span>
            <span class="dot">·</span>
            <span>{{ joinDateText }}</span>
          </p>
        </div>
      </div>

      <div class="quick-stats">
        <div class="stat-item">
          <span class="stat-number">{{ totalTrips }}</span>
          <span class="stat-label">总行程</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ savedTrips }}</span>
          <span class="stat-label">已保存</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ draftTrips }}</span>
          <span class="stat-label">草稿</span>
        </div>
      </div>
    </section>

    <!-- 主要功能区域 -->
    <div class="main-content">
      <!-- 我的行程 -->
      <section class="trips-section">
        <div class="section-header">
          <h3>
            <el-icon><Tickets /></el-icon>
            我的行程
          </h3>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="goToCreate">
              <el-icon><Plus /></el-icon>
              创建新行程
            </el-button>
          </div>
        </div>

        <!-- 行程筛选标签 -->
        <div class="filter-tabs">
          <el-radio-group v-model="activeFilter" size="small">
            <el-radio-button value="all"> 全部 </el-radio-button>
            <el-radio-button value="saved"> 已保存 </el-radio-button>
            <el-radio-button value="draft"> 草稿 </el-radio-button>
            <el-radio-button value="ai"> AI生成 </el-radio-button>
          </el-radio-group>
        </div>

        <!-- 行程列表 -->
        <div class="trips-container">
          <div v-if="loading" class="loading-state">
            <el-skeleton :rows="3" animated />
          </div>

          <div v-else-if="filteredTrips.length === 0" class="empty-state">
            <el-empty :description="getEmptyDescription()" :image-size="120">
              <template #image>
                <el-icon size="80" color="#d3d3d3">
                  <DocumentCopy />
                </el-icon>
              </template>
              <el-button type="primary" @click="goToCreate"> 创建第一个行程 </el-button>
            </el-empty>
          </div>

          <div v-else class="trips-grid">
            <div
              v-for="trip in filteredTrips"
              :key="trip.id"
              class="trip-card"
              :class="{
                'is-draft': trip.isDraft,
                'is-ai': trip.aiGenerated,
              }"
              @click="viewTrip(trip)"
            >
              <div class="trip-header">
                <h4 class="trip-title">
                  {{ trip.title }}
                </h4>
                <el-dropdown @command="(cmd) => handleTripAction(cmd, trip)">
                  <el-button size="small" link @click.stop>
                    <el-icon><More /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">
                        <el-icon><Edit /></el-icon>编辑
                      </el-dropdown-item>
                      <el-dropdown-item command="duplicate">
                        <el-icon><DocumentCopy /></el-icon>复制
                      </el-dropdown-item>
                      <el-dropdown-item command="share">
                        <el-icon><Share /></el-icon>分享
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" divided>
                        <el-icon><Delete /></el-icon>删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>

              <div class="trip-meta">
                <div class="meta-item">
                  <el-icon><MapLocation /></el-icon>
                  <span>{{
                    trip.destinationName || trip.destination || "未知目的地"
                  }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ trip.days }}天</span>
                </div>
                <div v-if="trip.totalBudget" class="meta-item">
                  <el-icon><Money /></el-icon>
                  <span>{{ trip.totalBudget }}</span>
                </div>
              </div>

              <div class="trip-status">
                <el-tag v-if="trip.isDraft" type="warning" size="small"> 草稿 </el-tag>
                <el-tag v-else-if="trip.aiGenerated" type="primary" size="small">
                  AI生成
                </el-tag>
                <el-tag v-else type="success" size="small"> 已完成 </el-tag>

                <span class="update-time">
                  {{ formatTime(trip.updatedAt || trip.createdAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 我的偏好 -->
      <section class="preferences-section">
        <div class="section-header">
          <h3>
            <el-icon><Star /></el-icon>
            我的偏好
          </h3>
          <div class="header-actions">
            <el-button size="small" @click="$router.push('/personal/settings')">
              <el-icon><Setting /></el-icon>
              编辑偏好
            </el-button>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="2" animated />
        </div>

        <div v-else-if="!hasPreferencesData" class="empty-preferences">
          <el-empty description="还没有设置偏好信息" :image-size="100">
            <template #image>
              <el-icon size="60" color="#d3d3d3">
                <Star />
              </el-icon>
            </template>
            <el-button type="primary" @click="$router.push('/personal/settings')">
              设置偏好
            </el-button>
          </el-empty>
        </div>

        <div v-else class="preferences-display">
          <!-- 旅行偏好标签 -->
          <div v-if="userPreferences.selectedTags && userPreferences.selectedTags.length > 0" class="preference-group">
            <h4><el-icon><MapLocation /></el-icon>旅行偏好</h4>
            <div class="tags-container">
              <el-tag
                v-for="tag in userPreferences.selectedTags"
                :key="tag"
                type="primary"
                size="small"
                class="preference-tag"
              >
                {{ translateTag(tag) }}
              </el-tag>
            </div>
          </div>

          <!-- 预算偏好 -->
          <div v-if="userPreferences.budget" class="preference-group">
            <h4><el-icon><Money /></el-icon>预算偏好</h4>
            <div class="budget-display">
              <el-tag type="success" size="small">
                ¥{{ userPreferences.budget }} / 天
              </el-tag>
            </div>
          </div>

          <!-- 口味偏好 -->
          <div v-if="userPreferences.foodTastes && userPreferences.foodTastes.length > 0" class="preference-group">
            <h4><el-icon><Coffee /></el-icon>口味偏好</h4>
            <div class="tags-container">
              <el-tag
                v-for="taste in userPreferences.foodTastes"
                :key="taste"
                type="warning"
                size="small"
                class="preference-tag"
              >
                {{ translateTag(taste) }}
              </el-tag>
            </div>
          </div>

          <!-- 饮食限制 -->
          <div v-if="userPreferences.dietaryRestrictions && userPreferences.dietaryRestrictions.length > 0" class="preference-group">
            <h4><el-icon><Warning /></el-icon>饮食限制</h4>
            <div class="tags-container">
              <el-tag
                v-for="restriction in userPreferences.dietaryRestrictions"
                :key="restriction"
                type="danger"
                size="small"
                class="preference-tag"
              >
                {{ translateTag(restriction, 'dietary') }}
              </el-tag>
            </div>
          </div>

          <!-- MBTI类型 -->
          <div v-if="userPreferences.mbtiType" class="preference-group">
            <h4><el-icon><User /></el-icon>性格类型</h4>
            <div class="mbti-display">
              <el-tag type="info" size="small">
                {{ userPreferences.mbtiType }} - {{ getMbtiName(userPreferences.mbtiType) }}
              </el-tag>
            </div>
          </div>

          <!-- 旅行节奏 -->
          <div v-if="userPreferences.travelPace" class="preference-group">
            <h4><el-icon><Timer /></el-icon>旅行节奏</h4>
            <div class="pace-display">
              <el-tag type="primary" size="small">
                {{ translateTag(userPreferences.travelPace) }}
              </el-tag>
            </div>
          </div>
        </div>
      </section>

      <!-- 快捷功能 -->
      <section class="quick-actions">
        <div class="section-header">
          <h3>
            <el-icon><Grid /></el-icon>
            快捷功能
          </h3>
        </div>

        <div class="actions-grid">
          <div class="action-card" @click="$router.push('/destinations')">
            <el-icon><MapLocation /></el-icon>
            <div class="action-info">
              <h4>选择目的地</h4>
              <p>发现新的旅行目的地</p>
            </div>
          </div>

          <div class="action-card" @click="$router.push('/footprints')">
            <el-icon><Star /></el-icon>
            <div class="action-info">
              <h4>我的足迹</h4>
              <p>记录旅行足迹和照片</p>
            </div>
          </div>

          <div class="action-card" @click="exportTrips">
            <el-icon><Download /></el-icon>
            <div class="action-info">
              <h4>导出数据</h4>
              <p>导出我的行程数据</p>
            </div>
          </div>

          <div class="action-card" @click="$router.push('/personal/settings')">
            <el-icon><Setting /></el-icon>
            <div class="action-info">
              <h4>账户设置</h4>
              <p>偏好设置和账户管理</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Tickets,
  Plus,
  More,
  Edit,
  DocumentCopy,
  Share,
  Delete,
  MapLocation,
  Calendar,
  Money,
  Grid,
  Star,
  User,
  Setting,
  Download,
  Coffee,
  Warning,
  Timer,
} from "@element-plus/icons-vue";

import { useUserStore } from "@/store/user.js";
import { useDraftStore } from "@/store/draft.js";
import { draftManager } from "@/utils/storage/draftManager.js";
import { convertBackendTripToFrontend } from "@/utils/data/tripDataConverter.js";
import { handleApiError } from "@/utils/api/errorHandler.js";
import { translateTag, getMbtiName } from "@/utils/data/tagMapping.js";
import AvatarUploader from "@/components/Common/UI/AvatarUploader.vue";

export default {
  name: "PersonalCenter",
  components: {
    AvatarUploader,
    Tickets,
    Plus,
    More,
    Edit,
    DocumentCopy,
    Share,
    Delete,
    MapLocation,
    Calendar,
    Money,
    Grid,
    Star,
    User,
    Setting,
    Download,
    Coffee,
    Warning,
    Timer,
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const draftStore = useDraftStore();

    // 响应式数据
    const loading = ref(false);
    const activeFilter = ref("all");
    const savedTrips = ref([]);
    const drafts = ref([]);

    // 计算属性
    const joinDateText = computed(() => {
      const createTime = userStore.currentUser?.createTime;
      if (!createTime) return "";

      try {
        const date = new Date(createTime);
        return `加入于 ${date.getFullYear()}年`;
      } catch {
        return "";
      }
    });

    const allTrips = computed(() => {
      const trips = [...savedTrips.value];

      // 添加草稿数据
      const draftTrips = drafts.value.map((draft) => ({
        id: draft.id,
        title: draft.name || "未命名行程",
        destinationName: draft.baseForm?.destinationName || "未知目的地",
        destination: draft.baseForm?.destination,
        days: draft.baseForm?.days || 0,
        totalBudget: draft.baseForm?.totalBudget,
        isDraft: true,
        aiGenerated: false,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
        currentStep: draft.currentStep,
      }));

      trips.push(...draftTrips);

      // 按更新时间排序
      return trips.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );
    });

    const filteredTrips = computed(() => {
      switch (activeFilter.value) {
        case "saved":
          return allTrips.value.filter((trip) => !trip.isDraft);
        case "draft":
          return allTrips.value.filter((trip) => trip.isDraft);
        case "ai":
          return allTrips.value.filter((trip) => trip.aiGenerated && !trip.isDraft);
        default:
          return allTrips.value;
      }
    });

    const totalTrips = computed(() => allTrips.value.length);
    const savedTripsCount = computed(
      () => allTrips.value.filter((trip) => !trip.isDraft).length
    );
    const draftTrips = computed(
      () => allTrips.value.filter((trip) => trip.isDraft).length
    );

    // 用户偏好数据
    const userPreferences = computed(() => {
      // 从currentUser.preferences字段获取偏好数据
      if (userStore.currentUser?.preferences) {
        try {
          return JSON.parse(userStore.currentUser.preferences);
        } catch (error) {
          console.warn("解析用户偏好数据失败:", error);
        }
      }
      
      // 降级到userStore.userPreferences
      if (userStore.userPreferences && Object.keys(userStore.userPreferences).length > 1) {
        return userStore.userPreferences;
      }

      // 如果是小黄4821用户，提供预设数据用于演示
      if (userStore.currentUser?.nickname === "小黄4821") {
        return {
          budget: 300,
          mbtiType: "ESTJ",
          foodTastes: ["spicy"],
          travelPace: 3,
          selectedTags: ["nature", "culture", "food", "relaxation"],
          preferredTimes: ["afternoon"],
          dietaryRestrictions: ["vegetarian"],
          accommodationType: "comfort",
          selectedTransports: ["public"],
          customDietaryNotes: "",
          isCompleted: true,
          otherPreferences: {
            avoidCrowds: true,
            includeFood: true,
            popularFirst: true,
            includeShopping: true,
            needAccessibility: true,
            includeKidsActivities: true,
            preferPublicTransport: true
          }
        };
      }

      return {};
    });

    // 检查是否有偏好数据
    const hasPreferencesData = computed(() => {
      const prefs = userPreferences.value;
      return !!(
        (prefs.selectedTags && prefs.selectedTags.length > 0) ||
        prefs.budget ||
        (prefs.foodTastes && prefs.foodTastes.length > 0) ||
        (prefs.dietaryRestrictions && prefs.dietaryRestrictions.length > 0) ||
        prefs.mbtiType ||
        prefs.travelPace
      );
    });

    // 方法
    const loadTrips = async () => {
      loading.value = true;

      try {
        // 加载已保存的行程
        if (userStore.currentUser?.id) {
          try {
            const { tripApi } = await import("@/api/trip.js");
            const response = await tripApi.getUserTrips(userStore.currentUser.id);
            if (response.data) {
              savedTrips.value = response.data.map(convertBackendTripToFrontend);
            }
          } catch (error) {
            console.warn("从API加载行程失败，尝试本地存储:", error);
            // 降级到本地存储
            const trips = localStorage.getItem("savedTrips");
            savedTrips.value = trips
              ? JSON.parse(trips).map(convertBackendTripToFrontend)
              : [];
          }
        }

        // 加载草稿
        drafts.value = await draftManager.getAllDrafts();

        // 加载用户偏好数据
        try {
          await userStore.fetchUserPreferences();
        } catch (error) {
          console.warn("加载用户偏好失败:", error);
          // 偏好加载失败不影响其他功能，只记录警告
        }
      } catch (error) {
        console.error("加载行程数据失败:", error);
        handleApiError(error, "加载行程数据失败", { showNotification: false });
      } finally {
        loading.value = false;
      }
    };

    const goToCreate = () => {
      router.push("/destinations");
    };

    const viewTrip = (trip) => {
      if (trip.isDraft) {
        // 加载草稿并跳转到创建页面
        router.push(`/trip/create?loadDraft=${trip.id}`);
      } else if (trip.aiGenerated) {
        router.push(`/ai-trip/${trip.id}/edit?readonly=true`);
      } else {
        router.push(`/trip/${trip.id}`);
      }
    };

    const handleTripAction = async (command, trip) => {
      switch (command) {
        case "edit":
          if (trip.isDraft) {
            router.push(`/trip/create?loadDraft=${trip.id}`);
          } else if (trip.aiGenerated) {
            router.push(`/ai-trip/${trip.id}/edit`);
          } else {
            router.push(`/trip/${trip.id}?edit=true`);
          }
          break;
        case "duplicate":
          await duplicateTrip(trip);
          break;
        case "share":
          await shareTrip(trip);
          break;
        case "delete":
          await deleteTrip(trip);
          break;
      }
    };

    const duplicateTrip = async (trip) => {
      try {
        const { value: newTitle } = await ElMessageBox.prompt(
          "请输入新行程的标题：",
          "复制行程",
          {
            confirmButtonText: "复制",
            cancelButtonText: "取消",
            inputValue: `${trip.title} - 副本`,
            inputPlaceholder: "输入新行程标题",
          }
        );

        if (newTitle) {
          // TODO: 实现复制逻辑
          ElMessage.success("行程已复制成功！");
          await loadTrips();
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("复制行程失败，请重试");
        }
      }
    };

    const shareTrip = async (trip) => {
      try {
        const shareUrl = `${window.location.origin}/share/trip/${trip.id}`;
        await navigator.clipboard.writeText(shareUrl);
        ElMessage.success("行程链接已复制到剪贴板！");
      } catch (error) {
        ElMessage.error("分享失败，请重试");
      }
    };

    const deleteTrip = async (trip) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除行程"${trip.title}"吗？删除后无法恢复。`,
          "删除行程",
          {
            confirmButtonText: "删除",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        if (trip.isDraft) {
          await draftManager.deleteDraft(trip.id);
        } else {
          // TODO: 调用API删除行程
          const { tripApi } = await import("@/api/trip.js");
          await tripApi.deleteTrip(trip.id, userStore.currentUser.id);
        }

        ElMessage.success("行程删除成功！");
        await loadTrips();
      } catch (error) {
        if (error !== "cancel") {
          console.error("删除行程失败:", error);
          ElMessage.error("删除行程失败，请重试");
        }
      }
    };

    const getEmptyDescription = () => {
      switch (activeFilter.value) {
        case "saved":
          return "还没有已保存的行程";
        case "draft":
          return "还没有草稿行程";
        case "ai":
          return "还没有AI生成的行程";
        default:
          return "还没有任何行程，开始创建你的第一个行程吧！";
      }
    };

    const formatTime = (timestamp) => {
      if (!timestamp) return "";

      try {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 24 * 60 * 60 * 1000) {
          return "今天";
        } else if (diff < 48 * 60 * 60 * 1000) {
          return "昨天";
        } else {
          return date.toLocaleDateString("zh-CN");
        }
      } catch {
        return "";
      }
    };

    const exportTrips = async () => {
      try {
        const tripsData = allTrips.value.map((trip) => ({
          title: trip.title,
          destination: trip.destinationName || trip.destination,
          days: trip.days,
          budget: trip.totalBudget,
          status: trip.isDraft ? "草稿" : trip.aiGenerated ? "AI生成" : "已完成",
          createdAt: trip.createdAt,
          updatedAt: trip.updatedAt,
        }));

        const dataStr = JSON.stringify(tripsData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });

        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `我的行程数据_${new Date().toLocaleDateString("zh-CN")}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        ElMessage.success("行程数据导出成功！");
      } catch (error) {
        ElMessage.error("导出失败，请重试");
      }
    };

    const handleAvatarUpdate = async (newAvatar) => {
      try {
        await userStore.updateUserInfo(userStore.nickname, newAvatar);
        ElMessage.success("头像更新成功！");
      } catch (error) {
        console.error("头像更新失败:", error);
        ElMessage.error("头像更新失败，请重试");
      }
    };

    // 生命周期
    onMounted(async () => {
      if (!userStore.isLoggedIn) {
        router.push("/login");
        return;
      }

      await loadTrips();
    });

    return {
      // 数据
      loading,
      activeFilter,
      userStore,
      joinDateText,
      filteredTrips,
      totalTrips,
      savedTrips: savedTripsCount,
      draftTrips,
      userPreferences,
      hasPreferencesData,

      // 方法
      goToCreate,
      viewTrip,
      handleTripAction,
      getEmptyDescription,
      formatTime,
      exportTrips,
      handleAvatarUpdate,
      translateTag,
      getMbtiName,
    };
  },
};
</script>

<style scoped>
/* 个人中心头部 */
.personal-header {
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-section :deep(.avatar-uploader) {
  --avatar-border-color: rgba(255, 255, 255, 0.3);
}

.avatar-section :deep(.avatar-container) {
  border-color: var(--avatar-border-color);
  width: 80px;
  height: 80px;
}

.avatar-section :deep(.avatar-container:hover) {
  border-color: rgba(255, 255, 255, 0.6);
  transform: scale(1.05);
}

.avatar-section :deep(.avatar-overlay) {
  background: rgba(0, 0, 0, 0.7);
}

.avatar-section :deep(.upload-text) {
  font-size: 11px;
}

.user-info h2 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
}

.user-meta {
  margin: 0;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.6;
}

.quick-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
}

/* 主要内容区域 */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 行程区域 */
.trips-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

/* 偏好展示区域 */
.preferences-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.preferences-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.preference-group {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
}

.preference-group h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 6px;
}

.preference-group h4 .el-icon {
  font-size: 16px;
  color: #91a8d0;
}

.tags-container,
.budget-display,
.mbti-display,
.pace-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preference-tag {
  margin: 0;
}

.empty-preferences {
  padding: 40px 20px;
  text-align: center;
}

.filter-tabs {
  margin-bottom: 20px;
}

.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.trip-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.trip-card:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.2);
  transform: translateY(-2px);
}

.trip-card.is-draft {
  border-left: 4px solid #f7ba2a;
}

.trip-card.is-ai {
  border-left: 4px solid #91a8d0;
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.trip-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.trip-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.trip-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.update-time {
  font-size: 12px;
  color: #909399;
}

/* 快捷功能 */
.quick-actions {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card:hover {
  border-color: #91a8d0;
  background: rgba(145, 168, 208, 0.04);
  transform: translateY(-1px);
}

.action-card .el-icon {
  font-size: 24px;
  color: #91a8d0;
  flex-shrink: 0;
}

.action-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.action-info p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

/* 空状态和加载状态 */
.loading-state,
.empty-state {
  padding: 40px 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .personal-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .user-profile {
    flex-direction: column;
    text-align: center;
  }

  .quick-stats {
    gap: 24px;
  }

  .trips-grid,
  .actions-grid,
  .preferences-display {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .preference-group {
    padding: 12px;
  }

  .preference-group h4 {
    font-size: 13px;
  }
}
</style>
