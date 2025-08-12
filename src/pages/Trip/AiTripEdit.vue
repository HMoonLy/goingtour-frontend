<template>
  <div class="ai-trip-edit-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button type="text" @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回个人中心
        </el-button>
      </div>
      <div class="header-right">
        <div v-if="!isReadOnly" class="header-actions">
          <el-button
:loading="saving" @click="saveChanges"
type="primary"
>
            <el-icon><Edit /></el-icon>
            保存修改
          </el-button>
        </div>
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
              <el-icon class="ai-icon" color="#409eff">
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
                <el-icon color="#409eff">
                  <Calendar />
                </el-icon>
              </div>
              <div class="stat-content">
                <div
v-if="isReadOnly" class="stat-number"
>
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
                <div class="stat-label">
天数
</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon color="#67c23a">
                  <User />
                </el-icon>
              </div>
              <div class="stat-content">
                <div
v-if="isReadOnly" class="stat-number"
>
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
                <div class="stat-label">
人数
</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon color="#e6a23c">
                  <Trophy />
                </el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">
                  {{ tripData?.qualityScore || 0 }}
                </div>
                <div class="stat-label">
质量分
</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon color="#f56c6c">
                  <Timer />
                </el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">
                  {{ formatProcessingTime(tripData?.processingTime) }}
                </div>
                <div class="stat-label">
用时
</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 行程标题卡片 -->
      <!-- <el-card class="trip-header-card" shadow="never">
        <div class="trip-header-content">
          <div class="trip-title-section">
            <div class="title-with-icon">
              <el-icon class="ai-icon" color="#409eff"><Cpu /></el-icon>
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
              AI为您精心规划的{{ editedTrip?.days || tripData.days || 3 }}天{{
                tripData?.destinationInfo?.name || tripData.city || "智能"
              }}行程
            </p>
          </div>
          <div class="trip-stats">
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon color="#409eff"><Calendar /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number" v-if="isReadOnly">
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
                <el-icon color="#67c23a"><User /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number" v-if="isReadOnly">
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
                <div class="stat-number">
                  {{ formatProcessingTime(tripData?.processingTime) }}
                </div>
                <div class="stat-label">用时</div>
              </div>
            </div>
          </div>
        </div>
      </el-card> -->

      <!-- 完整的行程内容 - 使用自定义div -->
      <div class="content-card-custom">
        <!-- 编辑模式选择（仅在非只读模式显示） -->
        <div v-if="!isReadOnly" class="editor-tabs">
          <el-radio-group v-model="editMode" class="edit-mode-selector">
            <el-radio-button label="preview">
预览模式
</el-radio-button>
            <el-radio-button label="markdown">
Markdown编辑
</el-radio-button>
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
        <div
          v-else
          class="markdown-content"
          data-safe="true"
          v-html="renderedContent"
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
} from "@element-plus/icons-vue";
import { http } from "@/api/request";
import { useUserStore } from "@/store/user";
import MarkdownIt from "markdown-it";
import { sanitizeMarkdownHtml } from "@/utils/xssFilter.js";
import { handleApiError, handleSuccess } from "@/utils/errorHandler.js";

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

// Markdown解析器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
});

// 自定义渲染规则 - 优化行程展示
md.renderer.rules.strong_open = (tokens, idx) => {
  const content = tokens[idx + 1]?.content || "";
  // 检查是否是时间格式（如 07:00-08:30）
  const isTimeRange = /^\d{2}:\d{2}-\d{2}:\d{2}$/.test(content);
  if (isTimeRange) {
    return '<p class="trip-highlight time-range">';
  }
  return '<p class="trip-highlight">';
};
md.renderer.rules.strong_close = () => "</p>";

// 计算属性
const tripId = computed(() => route.params.id);

// 渲染的内容 - 与AiTripDisplay保持一致
const renderedContent = computed(() => {
  const content = editedTrip.value.aiContent || tripData.value?.aiContent;
  if (!content) return `<p>暂无行程数据</p>`;
  let html = md.render(content);

  // 删除餐饮信息前的时间点 - 通用方法处理各种HTML结构
  const mealKeywords = [
    "晚餐",
    "午餐",
    "早餐",
    "下午茶",
    "夜宵",
    "小食",
    "点心",
    "茶歇",
    "返程前休整",
    "购物",
    "休息",
    "整理",
  ];

  mealKeywords.forEach((keyword) => {
    // 处理各种可能的HTML标签包装的时间
    html = html
      // 处理 <p class="trip-highlight">时间</p> 餐饮
      .replace(
        new RegExp(
          `<p[^>]*class="trip-highlight[^"]*"[^>]*>\\d{1,2}:\\d{2}</p>\\s*(${keyword}[:：])`,
          "g",
        ),
        "$1",
      )
      // 处理 <strong>时间</strong> 餐饮
      .replace(
        new RegExp(
          `<strong[^>]*>\\d{1,2}:\\d{2}</strong>\\s*(${keyword}[:：])`,
          "g",
        ),
        "$1",
      )
      // 处理 <span>时间</span> 餐饮
      .replace(
        new RegExp(
          `<span[^>]*>\\d{1,2}:\\d{2}</span>\\s*(${keyword}[:：])`,
          "g",
        ),
        "$1",
      )
      // 处理纯文本 时间 餐饮
      .replace(new RegExp(`\\b\\d{1,2}:\\d{2}\\s+(${keyword}[:：])`, "g"), "$1")
      // 处理任何标签包装的时间
      .replace(
        new RegExp(`<[^>]+>\\d{1,2}:\\d{2}</[^>]+>\\s*(${keyword}[:：])`, "g"),
        "$1",
      );
  });

  // 安全过滤HTML内容，防止XSS攻击
  html = sanitizeMarkdownHtml(html);

  return html;
});

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
      `/trips/${tripId.value}?userId=${userStore.userId || 1}`,
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
    },
  );
};

const goBack = () => {
  if (!isReadOnly.value && hasUnsavedChanges()) {
    confirmUnsavedChanges()
      .then(() => {
        router.push("/home");
      })
      .catch(() => {
        // 用户选择继续编辑
      });
  } else {
    router.push("/home");
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

.back-btn {
  font-size: 14px;
  color: #606266;
}

.back-btn:hover {
  color: #409eff;
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
  color: #667eea;
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
  border-color: #667eea;
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
  color: #667eea;
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
  background: #667eea;
  color: white;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

/* Markdown内容样式 */
.markdown-content {
  line-height: 1.7;
  color: #4a5568;
  font-size: 15px;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  font-weight: 600;
  color: #2d3748;
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.markdown-content :deep(h1) {
  font-size: 24px;
  color: #2d3748;
  text-align: center;
  margin: 28px 0 24px 0;
  padding: 20px 24px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.markdown-content :deep(h2) {
  font-size: 20px;
  color: #2d3748;
  padding: 16px 0 12px 0;
  border-bottom: 2px solid #e2e8f0;
  margin: 32px 0 20px 0;
}

.markdown-content :deep(h3) {
  font-size: 18px;
  color: #2d3748;
  padding: 16px 20px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  margin: 28px 0 20px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.markdown-content :deep(h4) {
  font-size: 16px;
  color: #4a5568;
  background: transparent;
  padding: 0;
  border: none;
  margin: 24px 0 16px 0;
  font-weight: 600;
  line-height: 1.5;
}

.markdown-content :deep(h5) {
  font-size: 15px;
  color: #667eea;
  font-weight: 600;
  margin: 20px 0 12px 0;
  padding: 0;
  line-height: 1.5;
}

.markdown-content :deep(h6) {
  font-size: 14px;
  color: #718096;
  font-weight: 500;
  margin: 16px 0 8px 0;
  padding: 0;
  line-height: 1.4;
}

.markdown-content :deep(p) {
  margin: 12px 0;
  line-height: 1.7;
  color: #4a5568;
  display: inline-block;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  list-style: none;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 5px 5px 5px 8px;
  margin-top: 5px;
}

.markdown-content :deep(li) {
  line-height: 1.6;
  position: relative;
  padding: 5px 6px 5px 0px;
  color: #4a5568;
  font-size: 14px;
}

.markdown-content :deep(ol) {
  counter-reset: list-counter;
}

.markdown-content :deep(ol li) {
  counter-increment: list-counter;
}

.markdown-content :deep(h4 .trip-highlight) {
  margin: 0;
}

.markdown-content :deep(.trip-highlight) {
  display: inline-block;
  background: #f8fafc;
  padding: 1px 8px;
  margin-top: auto;
  border-radius: 4px;
  font-weight: 500;
  color: #667eea;
  border: 1px solid #e2e8f0;
}

/* 专门针对时间段的样式 */
.markdown-content :deep(.trip-highlight.time-range) {
  background: #f8fafc;
  color: #667eea;
  border: 1px solid #e2e8f0;
  font-weight: 600;
  padding: 2px 10px;
  display: block;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 24px 0;
  background: white;
  border-radius: 8px;
  overflow: visible;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  display: table;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.markdown-content :deep(th) {
  background: #f8fafc;
  font-weight: 600;
  color: #2d3748;
  font-size: 13px;
}

.markdown-content :deep(td) {
  font-size: 13px;
  color: #4a5568;
}

.markdown-content :deep(tr:hover) {
  background: #f8fafc;
}

.markdown-content :deep(blockquote) {
  margin: 20px 0;
  padding: 16px 20px;
  border-left: 3px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 0 6px 6px 0;
  color: #4a5568;
}

.markdown-content :deep(code) {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 12px;
  color: #718096;
  font-weight: 500;
}

.markdown-content :deep(pre) {
  background: #f8fafc;
  color: #4a5568;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 20px 0;
  border: 1px solid #e2e8f0;
}

.markdown-content :deep(pre code) {
  background: none;
  color: inherit;
  padding: 0;
}

.markdown-content :deep(hr) {
  border: none;
  height: 1px;
  background: #e2e8f0;
  margin: 28px 0;
  border-radius: 1px;
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
  color: #667eea;
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

  .markdown-content {
    font-size: 14px !important;
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
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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

  .markdown-content {
    font-size: 14px;
  }

  .markdown-content :deep(h1) {
    font-size: 20px;
    padding: 16px 20px;
    margin: 20px 0 16px 0;
  }

  .markdown-content :deep(h2) {
    font-size: 18px;
    margin: 24px 0 16px 0;
  }

  .markdown-content :deep(h3) {
    font-size: 16px;
    padding: 12px 16px;
    margin: 20px 0 14px 0;
  }
}

@media (max-width: 480px) {
  .ai-trip-edit-page {
    padding: 12px;
  }

  .trip-stats {
    grid-template-columns: 1fr;
  }

  .markdown-content {
    font-size: 13px;
  }
}
</style>
