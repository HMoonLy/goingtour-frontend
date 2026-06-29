# GoingTour - 智能旅游规划系统（前端）

GoingTour 是一个面向国内旅行者的智能旅游规划 Web 应用，支持 AI 行程推荐、社区分享、足迹地图等功能。

## 在线演示

本项目支持演示模式，适合部署到 Vercel/Netlify 作为求职作品展示。

- 演示模式开关：`VITE_DEMO_MODE=true`
- 演示范围：AI 景点/餐厅/酒店推荐、推荐选择、AI 行程生成、Markdown 行程预览
- 说明：演示模式使用前端内置示例数据，真实环境关闭该开关后会继续调用后端 AI 接口

Vercel 推荐配置：

| 配置项 | 值 |
|------|------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment Variable | `VITE_DEMO_MODE=true` |

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 + Vite 7 |
| UI 组件库 | Element Plus |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| HTTP 客户端 | Axios |
| 地图 | 高德地图 JS API |
| 图表 | ECharts 6 |
| 对象存储 | 阿里云 OSS |
| 部署 | Docker + Nginx |

## 功能特性

- **AI 行程规划** — 基于目的地和偏好，AI 自动生成包含景点、餐厅、酒店的多日行程
- **社区广场** — 发布和浏览旅行帖子，关注其他用户
- **足迹地图** — 在中国地图上可视化展示已去过的城市，记录旅行足迹
- **心愿清单** — 收藏想去的目的地，随时规划下一次旅行
- **行程导出** — 支持将行程导出为 PDF、Word 文档或图片
- **行程分享** — 生成分享链接，让他人查看你的行程

## 项目结构

```
src/
├── api/            # API 请求模块（Axios 封装）
├── assets/         # 静态资源
├── components/     # 可复用组件
│   ├── Common/     #   通用组件（城市选择、地图、统计）
│   ├── Community/  #   社区相关组件
│   ├── Trip/       #   行程相关组件
│   └── User/       #   用户相关组件
├── composables/    # 组合式函数（hooks）
├── data/           # 静态数据
├── layouts/        # 布局组件（DefaultLayout / AuthLayout）
├── models/         # 数据模型
├── pages/          # 页面组件
│   ├── Community/  #   社区广场、帖子详情、发帖
│   ├── Footprints/ #   足迹地图、心愿清单
│   ├── Home/       #   首页仪表盘
│   ├── Trip/       #   目的地选择、行程创建/编辑/分享
│   └── User/       #   登录、注册、个人中心、设置
├── router/         # 路由配置
├── services/       # 业务逻辑层
├── store/          # Pinia 状态管理
├── styles/         # 全局样式、主题
└── utils/          # 工具函数
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9
- 后端服务运行在 `http://localhost:8080`（[goingtour-backend](https://github.com/HMoonLy/goingtour-backend)）

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/HMoonLy/goingtour-frontend.git
cd goingtour-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

开发服务器启动后，`/api` 请求会自动代理到 `http://localhost:8080`。

### 构建

```bash
# 生产构建
npm run build

# 本地预览构建产物
npm run preview
```

## 环境变量

在项目根目录创建 `.env.local` 文件（或按环境创建 `.env.development`、`.env.production`）：

```env
# API 基础 URL（可选，默认 /api）
VITE_API_BASE_URL=/api

# 高德地图 API Key
VITE_AMAP_API_KEY=your_amap_api_key

# 阿里云 OSS 公共访问域名（使用 OSS 存储时必填）
VITE_OSS_PUBLIC_DOMAIN=https://your-bucket.oss-cn-beijing.aliyuncs.com

# 应用标题（可选）
VITE_APP_TITLE=GoingTour
```

### 图片存储模式

前端会根据图片路径自动识别存储模式：

| 模式 | 路径特征 | 访问方式 |
|------|---------|---------|
| 完整 URL | `http://` / `https://` | 直接使用 |
| 本地存储 | `/uploads/` 开头 | 拼接 `VITE_API_BASE_URL` 前缀 |
| OSS 存储 | `/avatars/`、`/city-photos/` 开头 | 拼接 `VITE_OSS_PUBLIC_DOMAIN` 前缀 |

> 修改环境变量后需要重启开发服务器。

## Docker 部署

```bash
# 构建镜像
docker build -t goingtour-frontend .

# 运行容器
docker run -d -p 80:80 goingtour-frontend
```

Nginx 配置（`nginx.conf`）已包含：
- 静态资源长期缓存（1 年，immutable）
- Gzip 压缩
- SPA 路由回退（`try_files → /index.html`）
- API 反向代理（`/api → goingtour-backend:8080`）
- 安全响应头（X-Frame-Options、CSP 等）
- 健康检查端点（`/health`）

> 容器内以非 root 用户运行，适合生产环境。

## 相关仓库

- 后端：[goingtour-backend](https://github.com/HMoonLy/goingtour-backend)
