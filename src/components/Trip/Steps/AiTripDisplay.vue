<template>
  <div class="ai-trip-display">
    <!-- 行程标题卡片 -->
    <el-card class="trip-header-card" shadow="never">
      <div class="trip-header-content">
        <div class="trip-title-section">
          <div class="title-with-icon">
            <el-icon class="ai-icon" color="#409eff">
              <Cpu />
            </el-icon>
            <h1 class="trip-main-title">
              {{ (tripData?.destinationInfo?.name || "") + "智能行程推荐" }}
            </h1>
          </div>
          <p v-if="tripData?.destinationInfo" class="trip-subtitle">
            {{
              `为您推荐${tripData?.tripBasicInfo?.days || 3}天${
                tripData?.destinationInfo?.name || "目的地"
              }的精彩行程`
            }}
          </p>
        </div>

        <!-- 快速统计信息 -->
        <div class="trip-stats">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon color="#409eff">
                <Calendar />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">
                {{ tripData?.tripBasicInfo?.days || 0 }}
              </div>
              <div class="stat-label">天数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon color="#67c23a">
                <User />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">
                {{ tripData?.tripBasicInfo?.travelers || 0 }}
              </div>
              <div class="stat-label">出行人数</div>
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
              <div class="stat-label">质量评分</div>
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
              <div class="stat-label">用时</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 完整的行程内容 -->
    <el-card class="content-card" shadow="hover">
      <div class="markdown-content" data-safe="true" v-html="renderedContent" />
    </el-card>

    <!-- 操作按钮区域 -->
    <el-card class="actions-card" shadow="never">
      <div class="action-buttons">
        <el-button :loading="copying" @click="copyToClipboard">
          <el-icon><DocumentCopy /></el-icon>
          复制内容
        </el-button>
        <el-button type="primary" :loading="saving" @click="saveTrip">
          <el-icon><Folder /></el-icon>
          保存行程
        </el-button>
        <el-button type="success" :loading="sharing" @click="shareTrip">
          <el-icon><Share /></el-icon>
          分享
        </el-button>
        <el-button type="warning" @click="regenerateTrip">
          <el-icon><Refresh /></el-icon>
          重新生成
        </el-button>
      </div>
    </el-card>

    <!-- 用户反馈区域 -->
    <el-card class="feedback-card" shadow="hover">
      <template #header>
        <div class="card-title">
          <el-icon color="#67c23a">
            <ChatDotSquare />
          </el-icon>
          <span>反馈与评价</span>
        </div>
      </template>

      <div class="feedback-content">
        <div class="rating-section">
          <span class="rating-label">总体满意度</span>
          <el-rate
            v-model="userRating"
            :colors="['#F7BA2A', '#F7BA2A', '#F7BA2A']"
            show-text
            :texts="['非常不好', '不好', '一般', '好', '非常好']"
            @change="submitRating"
          />
        </div>

        <el-input
          v-model="userFeedback"
          type="textarea"
          :rows="3"
          placeholder="请分享您的看法和建议..."
          maxlength="200"
          show-word-limit
          class="feedback-input"
        />

        <div class="feedback-actions">
          <el-button
            size="small"
            :disabled="!userFeedback.trim()"
            @click="submitFeedback"
          >
            提交反馈
          </el-button>
          <el-button size="small" link @click="clearFeedback"> 重置 </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "@/store/user";
import { useRouter } from "vue-router";
import { http } from "@/api/request";
import {
  Cpu,
  Calendar,
  User,
  Trophy,
  Timer,
  DocumentCopy,
  Folder,
  Share,
  Refresh,
  ChatDotSquare,
} from "@element-plus/icons-vue";
import MarkdownIt from "markdown-it";
import { sanitizeMarkdownHtml } from "@/utils/security/xssFilter.js";

const props = defineProps({
  tripData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["save", "share", "regenerate"]);

// 获取用户store和路由
const userStore = useUserStore();
const router = useRouter();

// 响应式数据
const copying = ref(false);
const saving = ref(false);
const sharing = ref(false);
const userRating = ref(0);
const userFeedback = ref("");

// 初始化Markdown解析器
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

// 计算属性：渲染完整的markdown内容
const renderedContent = computed(() => {
  if (!props.tripData?.content) return `<p>无行程数据</p>`;
  let html = md.render(props.tripData.content);

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
        new RegExp(`<strong[^>]*>\\d{1,2}:\\d{2}</strong>\\s*(${keyword}[:：])`, "g"),
        "$1"
      )
      // 处理 <span>时间</span> 餐饮
      .replace(
        new RegExp(`<span[^>]*>\\d{1,2}:\\d{2}</span>\\s*(${keyword}[:：])`, "g"),
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

  // 安全过滤HTML内容，防止XSS攻击
  html = sanitizeMarkdownHtml(html);

  return html;
});

// 工具函数：格式化处理时间
const formatProcessingTime = (time) => {
  if (!time) return "0s";
  return time < 1000?`${time}ms` : `${Math.round(time / 1000)}s`;
};

// 工具函数：从行程内容中提取预算信息
const extractBudgetFromContent = (content) => {
  if (!content) return null;

  // 尝试匹配预算信息的正则表达式
  const budgetPatterns = [
    /预算分配.*?(\d+)元/,
    /总计约?(\d+)元/,
    /费用.*?(\d+)元/,
    /预算.*?(\d+)元/,
    /约(\d+)元/,
  ];

  for (const pattern of budgetPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return parseFloat(match[1]);
    }
  }

  return null;
};

// 复制到剪贴板
const copyToClipboard = async () => {
  copying.value = true;
  try {
    const content = props.tripData?.content || "";
    await navigator.clipboard.writeText(content);
    ElMessage.success("复制成功！");
  } catch (err) {
    ElMessage.error("复制失败，请重试");
  } finally {
    copying.value = false;
  }
};

// 保存行程
const saveTrip = async () => {
  saving.value = true;
  try {
    // 构建保存请求数据
    const saveRequest = {
      userId: userStore.userId || 1, // 如果没有用户ID则使用默认值1
      title: `${props.tripData?.destinationInfo?.name || "未知目的地"}${
        props.tripData?.tripBasicInfo?.days || 3
      }天${props.tripData?.tripBasicInfo?.travelers || 1}人行程`,
      city: props.tripData?.destinationInfo?.name || "未知目的地",
      days: props.tripData?.tripBasicInfo?.days || 3,
      travelers: props.tripData?.tripBasicInfo?.travelers || 1,
      totalBudget: extractBudgetFromContent(props.tripData?.content) || null,
      aiContent: props.tripData?.content || "",
      destinationInfo: JSON.stringify(props.tripData?.destinationInfo || {}),
      tripBasicInfo: JSON.stringify(props.tripData?.tripBasicInfo || {}),
      qualityScore: props.tripData?.qualityScore || null,
      processingTime: props.tripData?.processingTime || null,
      generationParams: JSON.stringify({
        aiProvider: props.tripData?.aiProvider || "DeepSeek",
        promptLength: props.tripData?.promptLength || null,
        responseLength: props.tripData?.responseLength || null,
        generatedAt: props.tripData?.generatedAt || new Date().toISOString(),
      }),
      feedbackRating: userRating.value > 0?userRating.value : null,
      feedbackContent: userFeedback.value.trim() || null,
    };

    // 调用后端API保存行程
    const response = await http.post("/ai/trip/save", saveRequest);

    if (response.code === 200) {
      ElMessage.success("保存成功！");
      emit("save", {
        ...props.tripData,
        savedTripId: response.data.id,
        saved: true,
      });

      // 延迟跳转到首页
      setTimeout(() => {
        router.push("/home");
      }, 1500);
    } else {
      throw new Error(response.msg || "保存失败");
    }
  } catch (err) {
    ElMessage.error(err.message || "保存失败，请重试");
  } finally {
    saving.value = false;
  }
};

// 分享行程
const shareTrip = async () => {
  sharing.value = true;
  try {
    // 模拟分享操作
    await new Promise((resolve) => setTimeout(resolve, 800));
    ElMessage.success("分享成功！");
    emit("share", props.tripData);
  } catch (err) {
    ElMessage.error("分享失败，请重试");
  } finally {
    sharing.value = false;
  }
};

// 重新生成行程
const regenerateTrip = () => {
  ElMessageBox.confirm("重新生成将替换当前行程，确定继续吗？", "重新生成行程", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      emit("regenerate");
    })
    .catch(() => {
      // 用户取消
    });
};

// 提交评分
const submitRating = () => {
  if (userRating.value > 0) {
    ElMessage.success(`感谢您的${userRating.value}星评价！`);
  }
};

// 提交反馈
const submitFeedback = () => {
  if (!userFeedback.value.trim()) return;

  ElMessage.success("提交成功，感谢您的反馈！");
  userFeedback.value = "";
};

// 清空反馈
const clearFeedback = () => {
  userFeedback.value = "";
  userRating.value = 0;
};
</script>

<style scoped>
.ai-trip-display {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
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

/* Markdown内容样式 */
.markdown-content {
  line-height: 1.7;
  color: #4a5568;
  font-size: 15px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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

.markdown-content :deep(ul li)::before {
}

.markdown-content :deep(ol) {
  counter-reset: list-counter;
}

.markdown-content :deep(ol li) {
  counter-increment: list-counter;
}

.markdown-content :deep(ol li)::before {
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
  /* border: 1px solid #e2e8f0; */
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

/* 操作按钮 */
.actions-card {
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.actions-card :deep(.el-card__body) {
  padding: 24px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.action-buttons :deep(.el-button) {
  min-width: 120px;
  height: 40px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
}

.action-buttons :deep(.el-button):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 反馈卡片 */
.feedback-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background: white;
}

.feedback-card :deep(.el-card__body) {
  padding: 24px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  color: #2d3748;
  margin-bottom: 20px;
}

.feedback-content > * + * {
  margin-top: 20px;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.rating-label {
  font-size: 14px;
  color: #2d3748;
  font-weight: 500;
}

.feedback-input {
  margin: 16px 0;
}

.feedback-input :deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  font-size: 14px;
  line-height: 1.6;
}

.feedback-input :deep(.el-textarea__inner):focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.feedback-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.feedback-actions :deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-trip-display {
    padding: 16px;
    background: #f8fafc;
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

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .rating-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
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

  .markdown-content :deep(h4) {
    font-size: 15px;
    margin: 18px 0 12px 0;
  }

  .markdown-content :deep(h5) {
    font-size: 14px;
    margin: 16px 0 8px 0;
  }

  .markdown-content :deep(h6) {
    font-size: 13px;
    margin: 14px 0 6px 0;
  }

  .markdown-content :deep(p) {
    margin: 10px 0;
  }

  .markdown-content :deep(ul),
  .markdown-content :deep(ol) {
    margin: 16px 0;
  }

  .markdown-content :deep(li) {
    margin: 6px 0;
    padding: 4px 0 4px 24px;
    font-size: 13px;
  }

  .markdown-content :deep(ul li)::before {
    left: 6px;
    top: 6px;
    font-size: 10px;
  }

  .markdown-content :deep(ol li)::before {
    left: 2px;
    top: 5px;
    width: 14px;
    height: 14px;
    font-size: 9px;
  }

  .markdown-content :deep(table) {
    font-size: 12px;
    margin: 16px 0;
  }

  .markdown-content :deep(th),
  .markdown-content :deep(td) {
    padding: 8px 12px;
  }
}

@media (max-width: 480px) {
  .ai-trip-display {
    padding: 12px;
  }

  .trip-stats {
    grid-template-columns: 1fr;
  }

  .markdown-content {
    font-size: 13px;
  }

  .markdown-content :deep(h1) {
    font-size: 18px;
    padding: 12px 16px;
    margin: 16px 0 12px 0;
  }

  .markdown-content :deep(h2) {
    font-size: 16px;
    margin: 20px 0 12px 0;
  }

  .markdown-content :deep(h3) {
    font-size: 15px;
    padding: 10px 12px;
    margin: 16px 0 12px 0;
  }

  .markdown-content :deep(h4) {
    font-size: 14px;
    margin: 14px 0 10px 0;
  }

  .markdown-content :deep(h5) {
    font-size: 13px;
    margin: 12px 0 6px 0;
  }

  .markdown-content :deep(li) {
    margin: 4px 0;
    padding: 3px 0 3px 20px;
    font-size: 12px;
  }
}

/* 美化滚动条 */
.markdown-content :deep(*) {
  scrollbar-width: thin;
  scrollbar-color: #667eea #f1f5f9;
}

.markdown-content :deep(*::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

.markdown-content :deep(*::-webkit-scrollbar-track) {
  background: #f1f5f9;
  border-radius: 3px;
}

.markdown-content :deep(*::-webkit-scrollbar-thumb) {
  background: #667eea;
  border-radius: 3px;
}

.markdown-content :deep(*::-webkit-scrollbar-thumb:hover) {
  background: #5a67d8;
}
</style>
