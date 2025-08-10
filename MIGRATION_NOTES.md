# 草稿系统迁移说明

## 已完成的工作

### 1. 数据库设计
- ✅ 创建了 `trip_drafts` 数据表结构 (`sql/trip_drafts.sql`)
- ✅ 支持JSON字段存储复杂数据
- ✅ 包含索引和清理机制

### 2. API设计
- ✅ 创建了完整的草稿API接口 (`src/api/draft.js`)
- ✅ 支持CRUD操作、批量操作、统计等功能

### 3. 新的管理器
- ✅ 创建了统一的 `draftManager` (`src/utils/draftManager.js`)
- ✅ 替换原来的 `tripProgressManager`
- ✅ 支持防抖自动保存、异步操作

### 4. 部分组件更新
- 🔄 正在更新 `TripCreate.vue` 中的API调用

## 待完成的工作

### 需要后端实现
1. 实现草稿相关的REST API接口
2. 创建数据库表
3. 实现定期清理机制

### 前端需要完成
1. 完成TripCreate.vue中所有tripProgressManager的替换
2. 更新Dashboard.vue使用新的草稿API
3. 测试草稿功能的完整流程

## API接口列表（后端需要实现）

```
GET    /api/drafts/user/{userId}           - 获取用户草稿列表
GET    /api/drafts/{draftId}               - 获取草稿详情
POST   /api/drafts                         - 创建草稿
PUT    /api/drafts/{draftId}               - 更新草稿
DELETE /api/drafts/{draftId}               - 删除草稿
PATCH  /api/drafts/{draftId}/rename        - 重命名草稿
POST   /api/drafts/{draftId}/copy          - 复制草稿
POST   /api/drafts/auto                    - 获取或创建自动草稿
PUT    /api/drafts/auto                    - 更新自动草稿
GET    /api/drafts/user/{userId}/stats     - 获取统计信息
DELETE /api/drafts/batch                   - 批量删除
POST   /api/drafts/user/{userId}/cleanup   - 清理过期草稿
```

## 优势

1. **数据可靠性**: 使用数据库存储，不会丢失
2. **多设备同步**: 可以跨设备访问草稿
3. **防抖保存**: 减少服务器压力
4. **统计分析**: 可以分析用户使用习惯
5. **批量操作**: 支持高效的管理操作

## 下一步

请先实现后端接口，然后我可以继续完成前端的集成和测试。