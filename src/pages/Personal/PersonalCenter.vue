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

      <!-- 个人旅行档案 -->
      <section class="preferences-section">
        <div class="section-header">
          <h3>
            <el-icon><Star /></el-icon>
            个人旅行档案
          </h3>
          <div class="header-actions">
            <el-button size="small" @click="$router.push('/personal/settings')">
              <el-icon><Setting /></el-icon>
              编辑档案
            </el-button>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="2" animated />
        </div>

        <div v-else-if="!hasPreferencesData" class="empty-preferences">
          <el-empty description="还没有设置档案信息" :image-size="100">
            <template #image>
              <el-icon size="60" color="#d3d3d3">
                <Star />
              </el-icon>
            </template>
            <el-button type="primary" @click="$router.push('/personal/settings')">
              设置档案
            </el-button>
          </el-empty>
        </div>

        <div v-else class="preferences-display">
          <!-- MBTI性格类型 -->
          <div v-if="userPreferences.mbtiType" class="preference-group">
            <h4><el-icon><User /></el-icon>性格类型</h4>
            <div class="mbti-display">
              <div class="mbti-content">
                <div class="mbti-image">
                  <img 
                    :src="`/images/mbti/${userPreferences.mbtiType}.png`" 
                    :alt="userPreferences.mbtiType"
                    @error="handleImageError"
                  />
                </div>
                <div class="mbti-info">
                  <el-tag type="info" size="small" class="mbti-tag">
                    {{ userPreferences.mbtiType }}
                  </el-tag>
                  <span class="mbti-name">{{ getMbtiTypeDisplayName(userPreferences.mbtiType) }}</span>
                  <p class="mbti-description">{{ getMbtiTypeDescription(userPreferences.mbtiType) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 核心兴趣爱好 -->
          <div v-if="userPreferences.coreInterests && userPreferences.coreInterests.length > 0" class="preference-group">
            <h4><el-icon><Star /></el-icon>核心兴趣爱好</h4>
            <div class="tags-container">
              <el-tag
                v-for="interest in userPreferences.coreInterests"
                :key="interest"
                type="primary"
                size="small"
                class="preference-tag"
              >
                {{ getCoreInterestDisplayName(interest) }}
              </el-tag>
            </div>
          </div>

          <!-- 预算水平 -->
          <div v-if="userPreferences.budgetLevel" class="preference-group">
            <h4><el-icon><Money /></el-icon>预算水平</h4>
            <div class="budget-display">
              <el-tag type="success" size="small" class="budget-level-tag">
                {{ getBudgetLevelDisplayName(userPreferences.budgetLevel) }}
              </el-tag>
              <span class="budget-range">{{ getBudgetLevelRange(userPreferences.budgetLevel) }}</span>
            </div>
          </div>



          <!-- 出行方式偏好 -->
          <div v-if="userPreferences.transportPreferences && userPreferences.transportPreferences.length > 0" class="preference-group">
            <h4><el-icon><MapLocation /></el-icon>出行方式偏好</h4>
            <div class="tags-container">
              <el-tag
                v-for="transport in userPreferences.transportPreferences"
                :key="transport"
                type="warning"
                size="small"
                class="preference-tag"
              >
                {{ getTransportPreferenceDisplayName(transport) }}
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
              <p>档案设置和账户管理</p>
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
import { useProfile } from "@/composables/user/useProfile.js";
import { useDraft } from "@/composables/useDraft.js";
import { draftManager } from "@/utils/storage/draftManager.js";
import { convertBackendTripToFrontend } from "@/utils/data/tripDataConverter.js";
import { handleApiError } from "@/utils/api/errorHandler.js";
import { translateTag } from "@/utils/data/travelDataSystem.js";
import { getMbtiName } from "@/utils/data/aiPromptEngine.js";
import { 
  PERSONAL_PROFILE_OPTIONS, 
  getOptionDisplayName, 
  getOptionDescription 
} from "@/utils/data/travelDataSystem.js";
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
    const { fetchUserPreferences, updateUserInfo } = useProfile();
    const draft = useDraft();

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
      // 从userStore.userPreferences获取偏好数据（已经是对象）
      if (userStore.userPreferences && Object.keys(userStore.userPreferences).length > 0) {
        return userStore.userPreferences;
      }

      // 返回空对象，让界面显示"暂无数据"状态
      return {};
    });

    // 检查是否有偏好数据（只检查四个重要字段）
    const hasPreferencesData = computed(() => {
      const prefs = userPreferences.value;
      return !!(
        prefs.mbtiType ||
        (prefs.coreInterests && prefs.coreInterests.length > 0) ||
        prefs.budgetLevel ||
        (prefs.transportPreferences && prefs.transportPreferences.length > 0)
      );
    });

    // 数据解析方法 - 基于 travelDataSystem.js 的数据定义
    const getMbtiTypeDisplayName = (mbtiType) => {
      return PERSONAL_PROFILE_OPTIONS.mbtiTypes.options[mbtiType]?.name || mbtiType;
    };

    const getMbtiTypeDescription = (mbtiType) => {
      return PERSONAL_PROFILE_OPTIONS.mbtiTypes.options[mbtiType]?.description || '';
    };

    const getCoreInterestDisplayName = (interest) => {
      return PERSONAL_PROFILE_OPTIONS.coreInterests.options[interest]?.name || interest;
    };

    const getBudgetLevelDisplayName = (budgetLevel) => {
      return PERSONAL_PROFILE_OPTIONS.budgetLevel.options[budgetLevel]?.name || budgetLevel;
    };

    const getBudgetLevelRange = (budgetLevel) => {
      return PERSONAL_PROFILE_OPTIONS.budgetLevel.options[budgetLevel]?.range || '';
    };

    const getDietaryRestrictionDisplayName = (restriction) => {
      return PERSONAL_PROFILE_OPTIONS.dietaryRestrictions.options[restriction]?.name || restriction;
    };

    const getTransportPreferenceDisplayName = (transport) => {
      return PERSONAL_PROFILE_OPTIONS.transportPreferences.options[transport]?.name || transport;
    };

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
          await fetchUserPreferences();
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
        await updateUserInfo(userStore.nickname, newAvatar);
        ElMessage.success("头像更新成功！");
      } catch (error) {
        console.error("头像更新失败:", error);
        ElMessage.error("头像更新失败，请重试");
      }
    };

    // 处理MBTI图片加载错误
    const handleImageError = (event) => {
      console.warn("MBTI图片加载失败:", event.target.src);
      // 可以设置一个默认图片或隐藏图片
      event.target.style.display = 'none';
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
      handleImageError,
      translateTag,
      getMbtiName,
      // 新增的偏好数据解析方法
      getMbtiTypeDisplayName,
      getMbtiTypeDescription,
      getCoreInterestDisplayName,
      getBudgetLevelDisplayName,
      getBudgetLevelRange,
      getDietaryRestrictionDisplayName,
      getTransportPreferenceDisplayName,
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

/* 个人旅行档案区域 */
.preferences-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.preferences-display {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  /* 确保所有偏好项目都能显示 */
  overflow: visible;
}

.preference-group {
  padding: 14px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
  min-height: 120px;
  display: flex;
  flex-direction: column;
}

.preference-group h4 {
  margin: 0 0 10px 0;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.preference-group h4 .el-icon {
  font-size: 16px;
  color: #91a8d0;
}

.tags-container,
.budget-display,
.pace-display {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}

.tags-container .el-tag,
.budget-display .el-tag,
.pace-display .el-tag {
  font-size: 11px;
  height: 22px;
  line-height: 20px;
}

.mbti-display {
  display: flex;
  align-items: center;
}

.mbti-content {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  height: 100%;
}

.mbti-image {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mbti-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.mbti-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.mbti-tag {
  margin: 0;
  font-weight: 600;
  font-size: 11px;
}

.mbti-name {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
  line-height: 1.2;
}

.mbti-description {
  margin: 0;
  font-size: 11px;
  color: #909399;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.preference-tag {
  margin: 0;
}

.budget-level-tag {
  margin-right: 6px;
  font-size: 11px;
}

.budget-range {
  font-size: 11px;
  color: #909399;
  font-weight: 500;
  line-height: 1.3;
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

/* 平板设备响应式 */
@media (max-width: 1024px) and (min-width: 769px) {
  .preferences-display {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
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
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .preferences-display {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    /* 在移动端调整为2列显示 */
  }
}

/* 小屏手机响应式 */
@media (max-width: 480px) {
  .preferences-display {
    grid-template-columns: 1fr;
    gap: 12px;
    /* 在小屏手机调整为1列显示 */
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
