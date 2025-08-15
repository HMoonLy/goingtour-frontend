/**
 * XSS安全过滤工具
 * 用于过滤HTML内容，防止XSS攻击
 */

/**
 * 允许的HTML标签和属性
 */
const ALLOWED_TAGS = {
  // 文本格式
  p: ["class"],
  br: [],
  span: ["class"],
  div: ["class"],

  // 标题
  h1: ["class"],
  h2: ["class"],
  h3: ["class"],
  h4: ["class"],
  h5: ["class"],
  h6: ["class"],

  // 列表
  ul: ["class"],
  ol: ["class"],
  li: ["class"],

  // 表格
  table: ["class"],
  thead: ["class"],
  tbody: ["class"],
  tr: ["class"],
  th: ["class"],
  td: ["class"],

  // 强调
  strong: ["class"],
  b: ["class"],
  em: ["class"],
  i: ["class"],

  // 引用
  blockquote: ["class"],

  // 代码
  code: ["class"],
  pre: ["class"],

  // 分割线
  hr: ["class"],

  // 链接（仅允许安全属性）
  a: ["href", "title", "class"],
};

/**
 * 危险的属性（完全禁止）
 */
const DANGEROUS_ATTRS = [
  "onclick",
  "onload",
  "onerror",
  "onmouseover",
  "onfocus",
  "onblur",
  "javascript:",
  "vbscript:",
  "data:",
  "style",
];

/**
 * 简单的HTML标签过滤器
 * @param {string} html - 要过滤的HTML字符串
 * @returns {string} - 过滤后的安全HTML
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== "string") {
    return "";
  }

  // 1. 移除script标签及其内容
  html = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );

  // 2. 移除危险的事件属性
  DANGEROUS_ATTRS.forEach((attr) => {
    const regex = new RegExp(`\\s*${attr}\\s*=\\s*[^\\s>]*`, "gi");
    html = html.replace(regex, "");
  });

  // 3. 移除style属性（防止CSS注入）
  html = html.replace(/\s*style\s*=\s*[^>]*/gi, "");

  // 4. 过滤不允许的标签（简单实现）
  html = html.replace(
    /<(\/?)([\w\-]+)([^>]*)>/g,
    (match, slash, tagName, attrs) => {
      const lowerTagName = tagName.toLowerCase();

      // 检查是否是允许的标签
      if (!ALLOWED_TAGS[lowerTagName]) {
        return ""; // 移除不允许的标签
      }

      // 过滤属性
      const allowedAttrs = ALLOWED_TAGS[lowerTagName];
      if (attrs && allowedAttrs.length > 0) {
        // 简单的属性过滤（可以进一步优化）
        const filteredAttrs = attrs.replace(
          /(\w+)\s*=\s*["']?([^"'>\s]+)["']?/g,
          (attrMatch, attrName, attrValue) => {
            if (allowedAttrs.includes(attrName.toLowerCase())) {
              return ` ${attrName}="${attrValue}"`;
            }
            return "";
          },
        );
        return `<${slash}${tagName}${filteredAttrs}>`;
      }

      return `<${slash}${tagName}>`;
    },
  );

  return html;
}

/**
 * 专门用于Markdown渲染内容的安全过滤
 * @param {string} html - Markdown渲染后的HTML
 * @returns {string} - 安全的HTML
 */
export function sanitizeMarkdownHtml(html) {
  // 先进行基本的安全过滤
  let safeHtml = sanitizeHtml(html);

  // 对于Markdown内容，我们可能需要额外的处理
  // 比如确保链接是安全的
  safeHtml = safeHtml.replace(
    /<a\s+href\s*=\s*["']([^"']+)["']/gi,
    (match, href) => {
      // 只允许http/https链接
      if (href.match(/^https?:\/\//)) {
        return match;
      }
      // 移除不安全的链接
      return '<a href="#"';
    },
  );

  return safeHtml;
}

/**
 * 转义HTML特殊字符
 * @param {string} text - 要转义的文本
 * @returns {string} - 转义后的文本
 */
export function escapeHtml(text) {
  if (!text) return "";

  const escapeMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return text.replace(/[&<>"'\/]/g, (char) => escapeMap[char]);
}
