<template>
  <div class="ai-trip-edit-page">
    <!-- 页面头部 -->
    <TripEditHeader
      :is-read-only="isReadOnly"
      :saving="saving"
      @back="goBack"
      @save="saveChanges"
      @export="handleExport"
      @toggle-read-only="toggleReadOnly"
      @publish="handlePublish"
    />

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 行程展示内容 -->
    <div v-else-if="tripData && tripData.id" class="ai-trip-display">
      <!-- 行程标题卡片 -->
      <TripInfoCard
        :is-read-only="isReadOnly"
        :trip-data="tripData"
        :edited-trip="editedTrip"
      />

      <!-- 完整的行程内容 -->
      <TripContentEditor
        v-model:edit-mode="editMode"
        v-model:content="editedTrip.aiContent"
        :is-read-only="isReadOnly"
        :trip-data="tripData"
      />

      <!-- 预算设置 -->
      <TripBudgetCard
        v-model="editedTrip.totalBudget"
        :is-read-only="isReadOnly"
      />
    </div>

    <div v-else class="no-data">
      <el-empty description="暂无行程数据" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import { http } from "@/api/request";
import { useUserStore } from "@/store/user";
import { handleApiError, handleSuccess } from "@/utils/api/errorHandler.js";
import { TripExporter } from "@/utils/export/tripExporter";

// Components
import TripEditHeader from "@/components/Trip/TripEdit/TripEditHeader.vue";
import TripInfoCard from "@/components/Trip/TripEdit/TripInfoCard.vue";
import TripContentEditor from "@/components/Trip/TripEdit/TripContentEditor.vue";
import TripBudgetCard from "@/components/Trip/TripEdit/TripBudgetCard.vue";

// 路由和store
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const loading = ref(true);
const saving = ref(false);
const isReadOnly = ref(true);
const editMode = ref("preview");
const tripData = ref(null);
const editedTrip = ref({});

// 计算属性
const tripId = computed(() => route.params.id);

// 生命周期
onMounted(() => {
  // 根据路由参数判断是否为只读模式
  isReadOnly.value = route.query.readonly === "true";
  loadTripData();
});

// 方法
const toggleReadOnly = () => {
  isReadOnly.value = !isReadOnly.value;
  if (isReadOnly.value) {
    editMode.value = "preview";
  }
};

// 加载行程数据
const loadTripData = async () => {
  try {
    loading.value = true;

    // 调用后端API获取AI行程数据
    const response = await http.get(
      `/trips/${tripId.value}?userId=${userStore.userId || 1}`
    );

    if (response.code === 200 && response.data) {
      const data = response.data;

      // 解析JSON字段
      let destinationInfo = {};
      let tripBasicInfo = {};

      try {
        destinationInfo = data.destinationInfo
          ? JSON.parse(data.destinationInfo)
          : {};
      } catch (e) {
        console.warn("解析destinationInfo失败:", e);
      }

      try {
        tripBasicInfo = data.tripBasicInfo
          ? JSON.parse(data.tripBasicInfo)
          : {};
      } catch (e) {
        console.warn("解析tripBasicInfo失败:", e);
      }

      // 设置tripData
      tripData.value = {
        ...data,
        destinationInfo: destinationInfo,
        tripBasicInfo: {
          days: data.days,
          travelers: data.mate,
          ...tripBasicInfo,
        },
      };

      // 设置编辑数据
      editedTrip.value = {
        id: data.id,
        title: data.title,
        city: data.city,
        days: data.days,
        mate: data.mate,
        totalBudget: data.totalBudget,
        aiContent: data.aiContent || "",
      };

      // 数据加载成功，在开发环境下记录日志
      if (import.meta.env.DEV) {
        console.log("✅ AI行程数据加载成功");
      }
    } else {
      throw new Error(response.msg || "获取行程数据失败");
    }
  } catch (error) {
    handleApiError(error, "加载行程数据失败，请重试");
    router.push("/home");
  } finally {
    loading.value = false;
  }
};

const saveChanges = async () => {
  try {
    saving.value = true;

    // 构建更新请求数据 - 使用AiTripSaveRequest格式
    const updateRequest = {
      userId: userStore.userId || 1,
      title: editedTrip.value.title,
      city: editedTrip.value.city,
      days: editedTrip.value.days,
      travelers: editedTrip.value.mate,
      totalBudget: editedTrip.value.totalBudget,
      aiContent: editedTrip.value.aiContent,
      destinationInfo: JSON.stringify(tripData.value.destinationInfo || {}),
      tripBasicInfo: JSON.stringify({
        days: editedTrip.value.days,
        travelers: editedTrip.value.mate,
        budget: editedTrip.value.totalBudget,
      }),
      qualityScore: tripData.value.qualityScore,
      processingTime: tripData.value.processingTime,
      generationParams: tripData.value.generationParams,
      feedbackRating: tripData.value.feedbackRating,
      feedbackContent: tripData.value.feedbackContent,
    };

    const response = await http.put(`/ai/trip/${tripId.value}`, updateRequest);

    if (response.code === 200) {
      handleSuccess("行程修改已保存！");
      // 更新本地数据
      tripData.value = { ...tripData.value, ...editedTrip.value };
      // 切换回预览模式
      isReadOnly.value = true;
      editMode.value = "preview";
    } else {
      throw new Error(response.msg || "保存失败");
    }
  } catch (error) {
    handleApiError(error, "保存失败，请重试");
  } finally {
    saving.value = false;
  }
};

const confirmUnsavedChanges = () => {
  return ElMessageBox.confirm(
    "您有未保存的修改，确定要离开吗？",
    "未保存的修改",
    {
      confirmButtonText: "离开",
      cancelButtonText: "继续编辑",
      type: "warning",
    }
  );
};

const goBack = () => {
  if (!isReadOnly.value && hasUnsavedChanges()) {
    confirmUnsavedChanges()
      .then(() => {
        router.push("/personal");
      })
      .catch(() => {
        // 用户选择继续编辑
      });
  } else {
    router.push("/personal");
  }
};

const hasUnsavedChanges = () => {
  if (!tripData.value) return false;

  return (
    editedTrip.value.title !== tripData.value.title ||
    editedTrip.value.city !== tripData.value.city ||
    editedTrip.value.days !== tripData.value.days ||
    editedTrip.value.mate !== tripData.value.mate ||
    editedTrip.value.totalBudget !== tripData.value.totalBudget ||
    editedTrip.value.aiContent !== tripData.value.aiContent
  );
};

// 导出功能
const handleExport = async (format) => {
  const loadingMessage = ElMessage({
    message: "正在生成文件，请稍候...",
    type: "info",
    duration: 0,
  });

  try {
    // 使用当前编辑的数据
    const exportData = isReadOnly.value ? tripData.value : editedTrip.value;
    const exporter = new TripExporter(exportData);

    switch (format) {
      case "word":
        await exporter.exportToWord();
        ElMessage.success("Word文档导出成功！");
        break;
      case "image":
        await exporter.exportToImage();
        ElMessage.success("图片导出成功！");
        break;
    }
  } catch (error) {
    console.error("导出失败:", error);
    ElMessage.error("导出失败，请重试");
  } finally {
    loadingMessage.close();
  }
};

const handlePublish = () => {
  if (hasUnsavedChanges()) {
    ElMessageBox.confirm(
      "您有未保存的修改，发布前请先保存。是否立即保存？",
      "提示",
      {
        confirmButtonText: "保存并发布",
        cancelButtonText: "取消",
        type: "warning",
      }
    )
      .then(async () => {
        await saveChanges();
        router.push({
          path: "/community/publish",
          query: { tripId: tripId.value },
        });
      })
      .catch(() => {});
  } else {
    router.push({
      path: "/community/publish",
      query: { tripId: tripId.value },
    });
  }
};
</script>

<style scoped>
.ai-trip-edit-page {
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
.ai-trip-edit-page * {
  box-sizing: border-box !important;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  background: white;
  border-radius: 8px;
  padding: 24px;
}

/* AI Trip Display 样式 */
.ai-trip-display {
  max-width: 1200px !important;
  margin: 0 auto !important;
  background: transparent !important;
  padding-bottom: 60px !important;
  min-height: auto !important;
  overflow: visible !important;
  width: 100% !important;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  background: white;
  border-radius: 8px;
  padding: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-trip-edit-page {
    padding: 12px !important;
  }
}

@media (max-width: 480px) {
  .ai-trip-edit-page {
    padding: 12px;
  }
}
</style>
