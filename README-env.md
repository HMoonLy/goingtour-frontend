# 环境变量配置说明

## 前端环境变量

在项目根目录创建 `.env.local` 文件（或根据环境创建对应的 `.env.development`、`.env.production` 文件）：

```env
# API 基础URL（可选，默认为 /api）
VITE_API_BASE_URL=/api

# OSS 公共访问域名（当后端使用 OSS 存储时必须配置）
# 示例：https://your-bucket.oss-cn-beijing.aliyuncs.com
VITE_OSS_PUBLIC_DOMAIN=https://goingtour.oss-cn-beijing.aliyuncs.com

# 应用配置
VITE_APP_TITLE=GoingTour
```

## 配置说明

### VITE_API_BASE_URL
- **用途**：本地存储模式下的图片访问前缀
- **默认值**：`/api`
- **示例**：当图片路径为 `/uploads/avatars/user.jpg` 时，实际访问URL为 `/api/uploads/avatars/user.jpg`

### VITE_OSS_PUBLIC_DOMAIN
- **用途**：OSS存储模式下的公共访问域名
- **必需性**：当后端启用OSS存储时必须配置
- **格式**：完整的域名，包含协议，不包含尾部斜杠
- **示例**：`https://goingtour.oss-cn-beijing.aliyuncs.com`
- **使用场景**：
  - 头像路径 `/avatars/user.jpg` → `https://goingtour.oss-cn-beijing.aliyuncs.com/avatars/user.jpg`
  - 城市照片路径 `/city-photos/photo.jpg` → `https://goingtour.oss-cn-beijing.aliyuncs.com/city-photos/photo.jpg`

## 存储模式对比

### 本地存储模式
- 后端存储：`/uploads/avatars/xxx.jpg`、`/uploads/city-photos/xxx.jpg`
- 前端访问：`/api/uploads/avatars/xxx.jpg`、`/api/uploads/city-photos/xxx.jpg`
- 环境变量：只需配置 `VITE_API_BASE_URL`（可选）

### OSS存储模式
- 后端存储：`/avatars/xxx.jpg`、`/city-photos/xxx.jpg`
- 前端访问：`${VITE_OSS_PUBLIC_DOMAIN}/avatars/xxx.jpg`、`${VITE_OSS_PUBLIC_DOMAIN}/city-photos/xxx.jpg`
- 环境变量：必须配置 `VITE_OSS_PUBLIC_DOMAIN`

## 自动识别机制

前端的图片URL规范化工具会自动识别路径类型：

1. **完整URL**（`http://`、`https://`、`data:`）：直接使用
2. **本地存储路径**（`/uploads/`开头）：添加 API 基础URL前缀
3. **OSS存储路径**（`/avatars/`、`/city-photos/`开头）：添加 OSS 公共域名前缀
4. **其他路径**：原样返回

## 注意事项

- 环境变量修改后需要重启开发服务器
- 生产环境部署时确保正确配置对应的环境变量
- OSS域名配置错误会导致图片无法加载，请仔细检查
