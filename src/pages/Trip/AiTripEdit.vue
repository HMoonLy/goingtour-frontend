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
        <el-button v-if="!isReadOnly" @click="toggleReadOnly">
          <el-icon><View /></el-icon>
          预览模式
        </el-button>
        <el-button v-else @click="toggleReadOnly" type="primary">
          <el-icon><Edit /></el-icon>
          编辑模式
        </el-button>
        <el-button v-if="!isReadOnly" @click="cancelEdit" :disabled="saving">
          取消
        </el-button>
        <el-button v-if="!isReadOnly" type="primary" @click="saveChanges" :loading="saving">
          保存修改
        </el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 行程展示内容 - 参考AiTripDisplay样式 -->
    <div v-else-if="tripData.id" class="ai-trip-display">
      <!-- 行程标题卡片 -->
      <el-card class="trip-header-card" shadow="never">
        <div class="trip-header-content">
          <div class="trip-title-section">
            <div class="title-with-icon">
              <el-icon class="ai-icon" color="#409eff"><Cpu /></el-icon>
              <h1 v-if="isReadOnly" class="trip-main-title">
                {{ tripData?.destinationInfo?.name || tripData.city }}旅游计划
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
            <p class="trip-subtitle" v-if="tripData?.destinationInfo">
              AI为您精心规划的{{ editedTrip?.days || 3 }}天{{
                tripData?.destinationInfo?.name || tripData.city || "智能"
              }}行程
            </p>
          </div>
          
          <!-- 快速统计信息 -->
          <div class="trip-stats">
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon color="#409eff"><Calendar /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number" v-if="isReadOnly">
                  {{ editedTrip?.days || 0 }}
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
                  {{ editedTrip?.mate || 0 }}
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
      </el-card>

      <!-- 完整的行程内容 -->
      <el-card class="content-card" shadow="hover">
        <!-- 编辑模式选择（仅在非只读模式显示） -->
        <div v-if="!isReadOnly" class="editor-tabs">
          <el-radio-group v-model="editMode" class="edit-mode-selector">
            <el-radio-button label="preview">预览模式</el-radio-button>
            <el-radio-button label="markdown">Markdown编辑</el-radio-button>
          </el-radio-group>
        </div>
        
        <!-- Markdown编辑器 -->
        <div v-if="!isReadOnly && editMode === 'markdown'" class="markdown-editor">
          <el-input
            v-model="editedTrip.aiContent"
            type="textarea"
            :rows="25"
            placeholder="请输入行程内容（支持Markdown格式）"
            class="content-textarea"
          />
          <div class="editor-tips">
            <el-alert
              title="编辑提示"
              type="info"
              :closable="false"
              show-icon
            >
              <template #default>
                <p>• 支持Markdown语法：**粗体**、*斜体*、### 标题等</p>
                <p>• 建议保持原有的行程结构和格式</p>
                <p>• 可以添加、删除或修改具体的景点、餐厅和活动安排</p>
              </template>
            </el-alert>
          </div>
        </div>
        
        <!-- 预览模式 - 使用与AiTripDisplay相同的样式 -->
        <div v-else class="markdown-content" v-html="renderedContent"></div>
      </el-card>

      <!-- 预算编辑卡片（仅在编辑模式显示） -->
      <el-card v-if="!isReadOnly" class="budget-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><Money /></el-icon>
            <span>预算设置</span>
          </div>
        </template>
        <el-form-item label="总预算">
          <el-input-number
            v-model="editedTrip.totalBudget"
            :min="0"
            :precision="2"
            controls-position="right"
            placeholder="预算金额"
            style="width: 200px;"
          />
          <span class="budget-unit">元</span>
        </el-form-item>
      </el-card>
    </div>

    <!-- 数据不存在 -->
    <el-empty v-else description="行程数据不存在" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  ArrowLeft,
  Edit,
  Document,
  DataLine,
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

// 路由和store
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 响应式数据
const loading = ref(true);
const saving = ref(false);
const editMode = ref("preview"); // 默认预览模式
const isReadOnly = ref(false); // 是否只读模式
const tripData = ref({});
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
  if (!editedTrip.value.aiContent) return "<p>暂无行程数据</p>";
  let html = md.render(editedTrip.value.aiContent);

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
          "g"
        ),
        "$1"
      )
      // 处理 <strong>时间</strong> 餐饮
      .replace(
        new RegExp(
          `<strong[^>]*>\\d{1,2}:\\d{2}</strong>\\s*(${keyword}[:：])`,
          "g"
        ),
        "$1"
      )
      // 处理 <span>时间</span> 餐饮
      .replace(
        new RegExp(
          `<span[^>]*>\\d{1,2}:\\d{2}</span>\\s*(${keyword}[:：])`,
          "g"
        ),
        "$1"
      )
      // 处理纯文本 时间 餐饮
      .replace(new RegExp(`\\b\\d{1,2}:\\d{2}\\s+(${keyword}[:：])`, "g"), "$1")
      // 处理任何标签包装的时间
      .replace(
        new RegExp(`<[^>]+>\\d{1,2}:\\d{2}</[^>]+>\\s*(${keyword}[:：])`, "g"),
        "$1"
      );
  });

  return html;
});

// 生命周期
onMounted(() => {
  // 根据路由参数判断是否为只读模式
  isReadOnly.value = route.query.readonly === 'true';
  loadTripData();
});

// 方法
const toggleReadOnly = () => {
  isReadOnly.value = !isReadOnly.value;
  if (isReadOnly.value) {
    editMode.value = "preview";
  }
};
const loadTripData = async () => {
  try {
    loading.value = true;
    
    // 调用后端API获取AI行程数据
    const response = await http.get(`/trips/${tripId.value}`, {
      params: {
        userId: userStore.userId || 1
      }
    });
    
    if (response.code === 200 && response.data) {
      tripData.value = response.data;
      
      // 解析JSON字段
      let destinationInfo = {};
      let tripBasicInfo = {};
      
      try {
        destinationInfo = response.data.destinationInfo ? JSON.parse(response.data.destinationInfo) : {};
      } catch (e) {
        console.warn("解析destinationInfo失败:", e);
      }
      
      try {
        tripBasicInfo = response.data.tripBasicInfo ? JSON.parse(response.data.tripBasicInfo) : {};
      } catch (e) {
        console.warn("解析tripBasicInfo失败:", e);
      }
      
      // 设置编辑数据，确保所有AI相关字段都被正确映射
      editedTrip.value = {
        id: response.data.id,
        title: response.data.title,
        city: response.data.city,
        days: response.data.days,
        mate: response.data.mate, // 人数字段
        totalBudget: response.data.totalBudget,
        aiContent: response.data.aiContent, // AI生成的内容
        aiGenerated: response.data.aiGenerated,
        destinationInfo: destinationInfo,
        tripBasicInfo: tripBasicInfo,
        qualityScore: response.data.qualityScore,
        processingTime: response.data.processingTime,
        generationParams: response.data.generationParams,
        feedbackRating: response.data.feedbackRating,
        feedbackContent: response.data.feedbackContent
      };
      
      // 同时更新tripData以供模板使用
      tripData.value = {
        ...response.data,
        destinationInfo: destinationInfo,
        tripBasicInfo: tripBasicInfo
      };
      
      console.log("✅ AI行程数据加载成功:", response.data);
      console.log("✅ 编辑数据设置:", editedTrip.value);
    } else {
      throw new Error(response.msg || "获取行程数据失败");
    }
  } catch (error) {
    console.error("❌ 加载AI行程数据失败:", error);
    ElMessage.error("加载行程数据失败，请重试");
    router.push("/personal");
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
        budget: editedTrip.value.totalBudget
      }),
      qualityScore: tripData.value.qualityScore,
      processingTime: tripData.value.processingTime,
      generationParams: tripData.value.generationParams,
      feedbackRating: tripData.value.feedbackRating,
      feedbackContent: tripData.value.feedbackContent
    };
    
    // 调用专门的AI行程更新API
    const response = await http.put(`/ai/trip/${tripId.value}`, updateRequest);
    
    if (response.code === 200) {
      ElMessage.success("行程修改保存成功！");
      
      // 延迟跳转回个人中心
      setTimeout(() => {
        router.push("/personal");
      }, 1000);
    } else {
      throw new Error(response.msg || "保存失败");
    }
  } catch (error) {
    console.error("❌ 保存AI行程失败:", error);
    ElMessage.error(error.message || "保存失败，请重试");
  } finally {
    saving.value = false;
  }
};

const cancelEdit = () => {
  ElMessageBox.confirm(
    "确定要取消编辑吗？未保存的修改将会丢失。",
    "确认取消",
    {
      confirmButtonText: "确定",
      cancelButtonText: "继续编辑",
      type: "warning",
    }
  )
    .then(() => {
      router.push("/personal");
    })
    .catch(() => {
      // 用户选择继续编辑
    });
};

const goBack = () => {
  router.push("/personal");
};

// 工具函数
const formatProcessingTime = (time) => {
  if (!time) return "0s";
  return time < 1000 ? `${time}ms` : `${Math.round(time / 1000)}s`;
};

const formatDate = (dateString) => {
  if (!dateString) return "未知";
  try {
    return new Date(dateString).toLocaleString("zh-CN");
  } catch {
    return "未知";
  }
};

const getAiProvider = () => {
  try {
    const params = JSON.parse(tripData.value.generationParams || "{}");
    return params.aiProvider || "DeepSeek";
  } catch {
    return "DeepSeek";
  }
};
</script>

<style scoped>
.ai-trip-edit-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 4px;
}

.back-btn {
  font-size: 14px;
  color: #606266;
}

.back-btn:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  gap: 12px;
}

.loading-container {
  background: white;
  border-radius: 8px;
  padding: 24px;
}

/* AI行程展示样式 - 复制自AiTripDisplay */
.ai-trip-display {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  background: transparent;
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
  font-size: 24px;
  font-weight: 600;
  text-align: center;
}

.trip-title-input :deep(.el-input__inner) {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  border: 2px dashed #e2e8f0;
  background: #f8fafc;
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
  width: 80px;
}

.stat-input :deep(.el-input__inner) {
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  padding: 8px;
}

.stat-label {
  font-size: 14px;
  color: #718096;
  margin-top: 4px;
  font-weight: 500;
}

/* 内容卡片 */
.content-card {
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background: white;
}

.content-card :deep(.el-card__body) {
  padding: 24px;
}

/* 编辑器样式 */
.editor-tabs {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.edit-mode-selector {
  display: flex;
}

.markdown-editor {
  margin-top: 16px;
}

.content-textarea {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.content-textarea :deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.editor-tips {
  margin-top: 16px;
}

/* 预算卡片 */
.budget-card {
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.budget-card :deep(.el-card__body) {
  padding: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  color: #409eff;
}

.budget-unit {
  margin-left: 8px;
  color: #909399;
}

/* Markdown内容样式 - 与AiTripDisplay保持完全一致 */
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
  padding:5px 6px 5px 0px;
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
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-trip-edit-page {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-right {
    justify-content: flex-end;
  }
  
  .trip-header-card :deep(.el-card__body) {
    padding: 24px;
  }
  
  .trip-main-title {
    font-size: 26px;
  }

  .trip-subtitle {
    font-size: 16px;
  }
  
  .trip-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .stat-card {
    padding: 20px;
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .content-card :deep(.el-card__body) {
    padding: 24px;
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
</style>