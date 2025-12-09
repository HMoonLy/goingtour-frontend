<template>
  <div class="markdown-content" data-safe="true" v-html="renderedHtml" />
</template>

<script setup>
import { computed } from "vue";
import MarkdownIt from "markdown-it";
import { sanitizeMarkdownHtml } from "@/utils/security/xssFilter.js";

const props = defineProps({
  content: {
    type: String,
    default: "",
  },
});

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


const renderedHtml = computed(() => {
  if (!props.content) return `<p>无行程数据</p>`;
  
  // 优化：只要标题包含 "JSON" 或 "结构化" 就全部截断，防止 AI 乱起名导致匹配失败
  let processedContent = props.content
    .replace(/(?:^|\n)#*\s*.*(?:JSON|结构化|Structure).*[\s\S]*/i, '')
    
  let html = md.render(processedContent);

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
</script>

<style scoped>
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

/* 响应式设计 */
@media (max-width: 768px) {
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

