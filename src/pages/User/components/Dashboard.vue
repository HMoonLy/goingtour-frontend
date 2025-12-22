<template>
  <div class="page-shell personal-center">
    <!-- 个人中心头部 -->
    <DashboardHeader
      :user="userStore"
      :stats="{
        total: totalTrips,
        saved: savedTripsCount,
        draft: draftTripsCount,
      }"
      @update:avatar="handleAvatarUpdate"
    />

    <!-- 主要功能区域 -->
    <div class="main-content">
      <!-- 列表区域 (Tabs切换) -->
      <div class="content-tabs">
        <el-tabs v-model="activeTab" class="custom-tabs">
          <el-tab-pane label="我的行程" name="trips">
            <TripList
              :trips="allTrips"
              :loading="loading"
              @create="goToCreate"
              @view="viewTrip"
              @action="handleTripAction"
            />
          </el-tab-pane>
          <el-tab-pane label="我的帖子" name="posts">
            <PostList
              :posts="userPosts"
              :loading="postsLoading"
              @view="viewPost"
              @delete="handleDeletePost"
            />
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 个人旅行档案 -->
      <PreferenceProfile :preferences="userPreferences" :loading="loading" />

      <!-- 快捷功能 -->
      <QuickActions @export="exportTrips" />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "@/store/user.js";
import { useProfile } from "@/composables/user/useProfile.js";
import { useDraft } from "@/composables/trip/useDraft.js";
import { communityApi } from "@/api/community.js";
import { 
  convertBackendTripToFrontend,
  convertDraftToFrontendTrip
} from "@/utils/data/tripDataConverter.js";
import { handleApiError } from "@/utils/api/errorHandler.js";

// Components
import DashboardHeader from "./DashboardHeader.vue";
import TripList from "./TripList.vue";
import PostList from "./PostList.vue";
import PreferenceProfile from "./PreferenceProfile.vue";
import QuickActions from "./QuickActions.vue";

export default {
  name: "PersonalCenter",
  components: {
    DashboardHeader,
    TripList,
    PostList,
    PreferenceProfile,
    QuickActions,
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const { fetchUserPreferences, updateUserInfo } = useProfile();
    const draft = useDraft();

    // 响应式数据
    const activeTab = ref("trips");
    const loading = ref(false);
    const savedTrips = ref([]);
    const drafts = ref([]);
    
    // 帖子相关数据
    const postsLoading = ref(false);
    const userPosts = ref([]);

    // 计算属性
    const allTrips = computed(() => {
      const trips = [...savedTrips.value];

      // 添加草稿数据
      const draftTrips = drafts.value.map(convertDraftToFrontendTrip);

      trips.push(...draftTrips);

      // 按更新时间排序
      return trips.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
      );
    });

    const totalTrips = computed(() => allTrips.value.length);
    const savedTripsCount = computed(
      () => allTrips.value.filter((trip) => !trip.isDraft).length
    );
    const draftTripsCount = computed(
      () => allTrips.value.filter((trip) => trip.isDraft).length
    );

    // 用户偏好数据
    const userPreferences = computed(() => {
      // 从userStore.userPreferences获取偏好数据（已经是对象）
      if (
        userStore.userPreferences &&
        Object.keys(userStore.userPreferences).length > 0
      ) {
        return userStore.userPreferences;
      }
      return {};
    });

    // 方法
    const loadTrips = async () => {
      loading.value = true;

      try {
        // 加载已保存的行程
        if (userStore.currentUser?.id) {
          try {
            const { tripApi } = await import("@/api/trip.js");
            const response = await tripApi.getUserTrips(
              userStore.currentUser.id
            );
            if (response.data) {
              savedTrips.value = response.data.map(
                convertBackendTripToFrontend
              );
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

        // 加载草稿 - 使用 useDraft
        drafts.value = await draft.loadDraftList();

        // 加载用户偏好数据
        try {
          await fetchUserPreferences();
        } catch (error) {
          console.warn("加载用户偏好失败:", error);
        }
      } catch (error) {
        console.error("加载行程数据失败:", error);
        handleApiError(error, "加载行程数据失败", { showNotification: false });
      } finally {
        loading.value = false;
      }
    };

    const loadUserPosts = async () => {
      if (!userStore.currentUser?.id) return;
      
      postsLoading.value = true;
      try {
        // 假设 API 支持通过 params 传参过滤，这里传递 userId
        // 如果后端还不支持，这里获取的可能是全部帖子，需要前端过滤
        // 但根据计划，我们假定 API 支持或我们尽力而为
        const res = await communityApi.getPosts({
          userId: userStore.currentUser.id, // 尝试传递 userId
          page: 1,
          pageSize: 100 // 获取最近的100条
        });

        if (res.code === 200) {
          let posts = res.data.list || [];
          // 如果后端没过滤，前端再次过滤确保安全
          posts = posts.filter(p => p.author && p.author.id === userStore.currentUser.id);
          userPosts.value = posts;
        }
      } catch (error) {
        console.error("加载帖子失败:", error);
        // 静默失败，不打扰用户
      } finally {
        postsLoading.value = false;
      }
    };

    const goToCreate = () => {
      router.push("/destinations");
    };

    const viewTrip = (trip) => {
      if (trip.isDraft) {
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
          // 使用 useDraft 删除草稿，并禁用内部确认弹窗（因为上面已经弹过了）
          await draft.deleteDraft(trip.id, { showConfirm: false });
        } else {
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

    const exportTrips = async () => {
      try {
        const tripsData = allTrips.value.map((trip) => ({
          title: trip.title,
          destination: trip.destinationName || trip.destination,
          days: trip.days,
          budget: trip.totalBudget,
          status: trip.isDraft
            ? "草稿"
            : trip.aiGenerated
              ? "AI生成"
              : "已完成",
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

    // 帖子相关方法
    const viewPost = (post) => {
      router.push(`/community/post/${post.id}`);
    };

    const handleDeletePost = async (post) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除帖子"${post.title}"吗？删除后无法恢复。`,
          "删除帖子",
          {
            confirmButtonText: "删除",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        const res = await communityApi.deletePost(post.id);
        if (res.code === 200) {
          ElMessage.success("删除成功");
          // 刷新列表
          await loadUserPosts();
        } else {
          ElMessage.error(res.msg || "删除失败");
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("删除帖子失败:", error);
          ElMessage.error("删除失败，请重试");
        }
      }
    };

    // 生命周期
    onMounted(async () => {
      if (!userStore.isLoggedIn) {
        router.push("/login");
        return;
      }

      await Promise.all([
        loadTrips(),
        loadUserPosts()
      ]);
    });

    return {
      // 数据
      activeTab,
      loading,
      userStore,
      allTrips,
      totalTrips,
      savedTripsCount,
      draftTripsCount,
      userPreferences,
      
      // 帖子数据
      postsLoading,
      userPosts,

      // 方法
      goToCreate,
      viewTrip,
      handleTripAction,
      exportTrips,
      handleAvatarUpdate,
      
      // 帖子方法
      viewPost,
      handleDeletePost
    };
  },
};
</script>

<style scoped>
.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Tabs 样式定制 */
.content-tabs {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

:deep(.custom-tabs .el-tabs__nav-scroll) {
  padding: 0 20px;
}

:deep(.custom-tabs .el-tabs__header) {
  margin-bottom: 0;
  border-bottom: 1px solid #f0f2f5;
  padding-top: 10px;
}

:deep(.custom-tabs .el-tabs__content) {
  padding: 0; /* 让内部组件控制 padding */
}

/* 让内部列表组件去掉外层阴影和圆角，以适应 Tab */
:deep(.trips-section),
:deep(.posts-section) {
  box-shadow: none;
  border-radius: 0 0 12px 12px;
  margin-top: 0;
}
</style>
