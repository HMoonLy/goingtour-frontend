<template>
  <div class="ai-trip-edit-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button link class="back-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回个人中心
        </el-button>
      </div>
      <div class="header-right">
        <el-button
          v-if="!isReadOnly"
          :loading="saving"
          type="primary"
          @click="saveChanges"
        >
          <el-icon><Edit /></el-icon>
          保存修改
        </el-button>
        <!-- 导出按钮 -->
        <el-dropdown @command="handleExport" trigger="click">
          <el-button>
            <el-icon><Download /></el-icon>
            导出行程
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="word">
                <el-icon><Edit /></el-icon>
                导出Word文档
              </el-dropdown-item>
              <el-dropdown-item command="image">
                <el-icon><Picture /></el-icon>
                导出图片
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-button
          :type="isReadOnly ? 'primary' : 'default'"
          @click="toggleReadOnly"
        >
          <el-icon><View v-if="isReadOnly" /><Edit v-else /></el-icon>
          {{ isReadOnly ? "编辑模式" : "预览模式" }}
        </el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 行程展示内容 -->
    <div v-else-if="tripData && tripData.id" class="ai-trip-display">
      <!-- 行程标题卡片 - 使用自定义div -->
      <div class="trip-header-card-custom">
        <div class="trip-header-content">
          <div class="trip-title-section">
            <div class="title-with-icon">
              <el-icon class="ai-icon" color="#91A8D0">
                <Cpu />
              </el-icon>
              <h1 v-if="isReadOnly" class="trip-main-title">
                {{ tripData.title }}
              </h1>
              <el-input
                v-else
                v-model="editedTrip.title"
                class="trip-title-input"
                placeholder="请输入行程标题"
                maxlength="100"
                show-word-limit
              />
            </div>
            <p class="trip-subtitle">
              AI {{ editedTrip?.days || tripData.days || 3 }}
              {{ tripData?.destinationInfo?.name || tripData.city || "" }}
            </p>
          </div>
          <div class="trip-stats">
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon color="#91A8D0">
                  <Calendar />
                </el-icon>
              </div>
              <div class="stat-content">
                <div v-if="isReadOnly" class="stat-number">
                  {{ editedTrip?.days || tripData.days || 0 }}
                </div>
                <el-input-number
                  v-else
                  v-model="editedTrip.days"
                  :min="1"
                  :max="30"
                  controls-position="right"
                  class="stat-input"
                />
                <div class="stat-label">天数</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon color="#91A8D0">
                  <User />
                </el-icon>
              </div>
              <div class="stat-content">
                <div v-if="isReadOnly" class="stat-number">
                  {{ editedTrip?.mate || tripData.mate || 0 }}
                </div>
                <el-input-number
                  v-else
                  v-model="editedTrip.mate"
                  :min="1"
                  :max="20"
                  controls-position="right"
                  class="stat-input"
                />
                <div class="stat-label">人数</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon color="#7CB342">
                  <Trophy />
                </el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">
                  {{ tripData?.qualityScore || 0 }}
                </div>
                <div class="stat-label">质量分</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon color="#96ACD2">
                  <Timer />
                </el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">
                  {{ formatProcessingTime(tripData?.processingTime) }}
                </div>
                <div class="stat-label">用时</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 完整的行程内容 - 使用自定义div -->
      <div class="content-card-custom">
        <!-- 编辑模式选择（仅在非只读模式显示） -->
        <div v-if="!isReadOnly" class="editor-tabs">
          <el-radio-group v-model="editMode" class="edit-mode-selector">
            <el-radio-button value="preview"> 预览模式 </el-radio-button>
            <el-radio-button value="markdown"> Markdown编辑 </el-radio-button>
          </el-radio-group>
        </div>

        <!-- Markdown编辑器 -->
        <div
          v-if="!isReadOnly && editMode === 'markdown'"
          class="editor-container"
        >
          <el-input
            v-model="editedTrip.aiContent"
            type="textarea"
            :rows="25"
            placeholder="请输入行程内容..."
            class="content-textarea"
          />
        </div>

        <!-- 预览模式 - 使用与AiTripDisplay相同的样式 -->
        <TripMarkdownRenderer
          v-else
          :content="editedTrip.aiContent || tripData.aiContent"
        />
      </div>

      <el-card v-if="!isReadOnly" class="budget-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon">
              <Money />
            </el-icon>
            <span>预算设置</span>
          </div>
        </template>
        <el-form-item label="总预算">
          <el-input-number
            v-model="editedTrip.totalBudget"
            :min="0"
            :precision="2"
            controls-position="right"
            placeholder="请输入预算"
            style="width: 200px"
          />
          <span class="budget-unit">元</span>
        </el-form-item>
      </el-card>
    </div>

    <div v-else class="no-data">
      <el-empty description="暂无行程数据" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import {
  ArrowLeft,
  Edit,
  View,
  Money,
  Cpu,
  Calendar,
  User,
  Trophy,
  Timer,
  Download,
  ArrowDown,
  Document,
  Picture,
} from "@element-plus/icons-vue";
import { http } from "@/api/request";
import { useUserStore } from "@/store/user";
import { handleApiError, handleSuccess } from "@/utils/api/errorHandler.js";
import { TripExporter } from "@/utils/export/tripExporter";
import { ElMessage } from "element-plus";
import TripMarkdownRenderer from "@/components/Trip/Steps/TripMarkdownRenderer.vue";

// Add missing t function
const t = (key) => {
  const translations = {
    "trip.inputTitle": "请输入行程标题",
    "trip.daysLabel": "天数",
    "trip.travelersLabel": "人数",
    "trip.qualityScore": "质量分",
    "trip.durationLabel": "用时",
    "trip.previewMode": "预览模式",
    "trip.markdownEdit": "Markdown编辑",
    "trip.contentPlaceholder": "请输入行程内容...",
    "trip.budgetSettings": "预算设置",
    "trip.totalBudget": "总预算",
    "trip.budgetPlaceholder": "请输入预算",
    "trip.yuan": "元",
    "trip.noTripData": "暂无行程数据",
    "messages.unsavedMessage": "您有未保存的修改，确定要离开吗？",
    "messages.unsavedTitle": "未保存的修改",
    "messages.leave": "离开",
    "messages.stay": "继续编辑",
  };
  return translations[key] || key;
};

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

// 工具函数
const formatProcessingTime = (time) => {
  if (!time) return "0s";
  return time < 1000 ? `${time}ms` : `${Math.round(time / 1000)}s`;
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

/* 自定义头部卡片 */
.trip-header-card-custom {
  margin: 0 auto 24px auto !important;
  border-radius: 12px !important;
  border: 1px solid #e2e8f0 !important;
  background: white !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06) !important;
  padding: 24px !important;
  overflow: visible !important;
  width: 100% !important;
  max-width: 1200px !important;
}

.page-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin: 0 auto 24px auto !important;
  padding: 0 4px !important;
  width: 100% !important;
  max-width: 1200px !important;
}

.page-header .header-right .el-dropdown {
  margin-right: 10px;
  margin-left: 10px;
}
.back-btn {
  font-size: 14px;
  color: #606266;
}

.back-btn:hover {
  color: #91a8d0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
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

/* 头部卡片 */
.trip-header-card {
  margin-bottom: 24px;
  border-radius: 12px;
  border: none;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.trip-header-card :deep(.el-card__body) {
  padding: 32px;
  background: transparent;
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
  color: #91a8d0;
}

.trip-main-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.trip-title-input {
  max-width: 400px;
  margin: 0 auto;
}

.trip-title-input :deep(.el-input__inner) {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  color: #2d3748;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
}

.trip-subtitle {
  font-size: 16px;
  color: #718096;
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
  background: #ffffff;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #91a8d0;
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  border-radius: 8px;
  font-size: 24px;
  color: #91a8d0;
  border: 1px solid #e2e8f0;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  line-height: 1;
}

.stat-input {
  width: 100%;
}

.stat-input :deep(.el-input-number__input) {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #718096;
  margin-top: 4px;
  font-weight: 500;
}

/* 自定义内容卡片 */
.content-card-custom {
  margin: 0 auto 24px auto !important;
  border-radius: 12px !important;
  overflow: visible !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06) !important;
  background: white !important;
  padding: 24px !important;
  min-height: auto !important;
  width: 100% !important;
  max-width: 1200px !important;
}

/* 内容卡片 */
.content-card {
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: visible;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background: white;
}

.content-card :deep(.el-card__body) {
  padding: 24px !important;
}

/* 编辑器标签页 */
.editor-tabs {
  margin-bottom: 20px;
  text-align: center;
}

.edit-mode-selector {
  background: #f8fafc;
  border-radius: 8px;
  padding: 4px;
  border: 1px solid #e2e8f0;
}

.edit-mode-selector :deep(.el-radio-button__inner) {
  border: none;
  background: transparent;
  color: #718096;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.edit-mode-selector
  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #91a8d0;
  color: white;
  box-shadow: 0 2px 4px rgba(145, 168, 208, 0.3);
}

/* 预算卡片 */
.budget-card {
  margin: 0 auto 24px auto !important;
  border-radius: 12px !important;
  border: 1px solid #e2e8f0 !important;
  background: #ffffff !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06) !important;
  width: 100% !important;
  max-width: 1200px !important;
}

.budget-card :deep(.el-card__body) {
  padding: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  color: #2d3748;
}

.header-icon {
  font-size: 18px;
  color: #91a8d0;
}

.budget-unit {
  margin-left: 8px;
  color: #718096;
  font-size: 14px;
}

/* ========== 响应式设计 ========== */
@media (max-width: 768px) {
  .ai-trip-edit-page {
    padding: 12px !important;
  }

  .trip-header-card-custom,
  .content-card-custom,
  .budget-card {
    margin: 0 auto 16px auto !important;
    padding: 16px !important;
  }

  .page-header {
    margin: 0 auto 16px auto !important;
    flex-direction: column !important;
    gap: 12px !important;
    align-items: stretch !important;
  }

  .trip-title {
    font-size: 20px !important;
  }

  .trip-subtitle {
    font-size: 14px !important;
  }

  .trip-stats {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 12px !important;
  }

  .stat-card {
    padding: 12px !important;
  }

  .editor-tabs {
    margin-bottom: 16px !important;
  }
}

/* Textarea样式 */
.content-textarea {
  width: 100%;
}

.content-textarea :deep(.el-textarea__inner) {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  resize: vertical;
}

.content-textarea :deep(.el-textarea__inner):focus {
  border-color: #91a8d0;
  box-shadow: 0 0 0 3px rgba(145, 168, 208, 0.1);
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
    padding: 16px;
  }

  .trip-header-card :deep(.el-card__body) {
    padding: 24px;
  }

  .trip-main-title {
    font-size: 24px;
  }

  .trip-subtitle {
    font-size: 14px;
  }

  .trip-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .stat-card {
    padding: 16px;
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .ai-trip-edit-page {
    padding: 12px;
  }

  .trip-stats {
    grid-template-columns: 1fr;
  }
}
</style>
