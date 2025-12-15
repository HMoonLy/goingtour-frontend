# 后端开发任务清单 & 接口规范 (Backend Task List & API Spec)

本文档旨在明确 "行程社区 (Community)" 模块的后端开发需求，确保前后端字段严格对齐。请后端开发者严格按照此规范实现接口。

## 1. 数据库变更 (Database Changes)

请在现有数据库中执行以下 SQL 脚本，创建社区模块所需的 4 张表。

```sql
-- ----------------------------
-- 1. 社区帖子表 (community_posts)
-- ----------------------------
DROP TABLE IF EXISTS `community_posts`;
CREATE TABLE `community_posts` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '发布者ID',
  `trip_id` bigint(20) NOT NULL COMMENT '关联的行程ID',
  `title` varchar(100) NOT NULL COMMENT '帖子标题',
  `content` text COMMENT '心得体会/推荐理由',
  `cover_image` varchar(500) DEFAULT NULL COMMENT '封面图URL',
  `rating` decimal(2,1) DEFAULT '5.0' COMMENT '推荐指数(1-5)',
  `tags` json DEFAULT NULL COMMENT '标签JSON ["亲子", "美食"]',
  
  -- 冗余统计字段 (务必在交互时同步更新)
  `view_count` int(11) DEFAULT '0' COMMENT '浏览量',
  `like_count` int(11) DEFAULT '0' COMMENT '点赞数',
  `collect_count` int(11) DEFAULT '0' COMMENT '收藏数',
  `comment_count` int(11) DEFAULT '0' COMMENT '评论数',
  
  `is_public` tinyint(1) DEFAULT '1' COMMENT '是否公开',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_trip_id` (`trip_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='社区帖子表';

-- ----------------------------
-- 2. 社区评论表 (community_comments)
-- ----------------------------
DROP TABLE IF EXISTS `community_comments`;
CREATE TABLE `community_comments` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `post_id` bigint(20) NOT NULL COMMENT '帖子ID',
  `user_id` bigint(20) NOT NULL COMMENT '评论者ID',
  `content` varchar(1000) NOT NULL COMMENT '评论内容',
  `parent_id` bigint(20) DEFAULT NULL COMMENT '父评论ID(用于回复)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_post_id` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='社区评论表';

-- ----------------------------
-- 3. 帖子点赞表 (community_likes)
-- ----------------------------
DROP TABLE IF EXISTS `community_likes`;
CREATE TABLE `community_likes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `post_id` bigint(20) NOT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_post_like` (`user_id`, `post_id`) -- 核心：防止重复点赞
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帖子点赞记录';

-- ----------------------------
-- 4. 帖子收藏表 (community_collections)
-- ----------------------------
DROP TABLE IF EXISTS `community_collections`;
CREATE TABLE `community_collections` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `post_id` bigint(20) NOT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_post_coll` (`user_id`, `post_id`) -- 核心：防止重复收藏
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帖子收藏记录';
```

---

## 2. API 接口规范 (API Specifications)

> **基础约定**:
> - 所有接口返回 JSON 格式。
> - 成功响应码: `code: 200`。
> - 时间格式统一为: `yyyy-MM-dd HH:mm:ss`。

### 2.1 发布帖子 (Publish Post)

用户将自己的行程发布到广场。

- **URL**: `POST /api/community/posts`
- **Auth**: Required (User)

**Request Body:**

| 字段 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `tripId` | Long | Yes | 关联的行程 ID (必须属于当前用户) |
| `title` | String | Yes | 帖子标题 (默认可填行程标题) |
| `content` | String | Yes | 推荐理由/心得 (支持纯文本，前端不做富文本) |
| `rating` | Double | No | 推荐指数 (1.0 - 5.0)，默认 5.0 |
| `tags` | Array<String> | No | 标签数组，例: `["亲子", "特种兵"]` |
| `coverImage` | String | No | 封面图 URL。若为空，后端需自动获取行程对应城市的默认图片 |

**Response (200 OK):**

```json
{
  "code": 200,
  "msg": "发布成功",
  "data": {
    "id": 1001 // 新创建的帖子ID
  }
}
```

**后端逻辑**:
1. 校验 `tripId` 是否存在且属于 `userId`。
2. 检查该 `tripId` 是否已经发布过帖子 (可选限制：一个行程只能发一个帖)。
3. 如果 `coverImage` 为空，查询 `trips` -> `city`，再查 `destinations` 表获取该城市的 `cover_image`。

---

### 2.2 获取广场列表 (Get Feed)

瀑布流/列表展示所有公开帖子。

- **URL**: `GET /api/community/posts`
- **Auth**: Optional (游客可见)

**Query Parameters:**

| 参数 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `page` | Integer | No | 页码，默认 1 |
| `pageSize` | Integer | No | 每页数量，默认 10 |
| `sort` | String | No | `latest` (最新, 默认) 或 `hot` (最热) |
| `tag` | String | No | 按标签筛选 (可选) |

**Response (200 OK):**

```json
{
  "code": 200,
  "data": {
    "total": 50,
    "list": [
      {
        "id": 1001,
        "title": "成都5日深度游",
        "content": "摘要信息，截取前50个字...",
        "coverImage": "http://img.url...",
        "rating": 4.5,
        "tags": ["美食", "亲子"],
        "createTime": "2023-12-15 10:00:00",
        
        // 作者信息 (关联 users 表)
        "author": {
          "id": 123,
          "nickname": "旅行达人",
          "avatar": "http://avatar.url..."
        },
        
        // 统计数据
        "stats": {
          "viewCount": 1200,
          "likeCount": 45,
          "collectCount": 12,
          "commentCount": 5
        },
        
        // 简要行程信息 (关联 trips 表)
        "tripInfo": {
          "id": 500,
          "city": "成都市",
          "days": 5,
          "totalBudget": 3000.00
        },
        
        // 当前用户交互状态 (仅登录态返回)
        "isLiked": false,
        "isCollected": true
      }
    ]
  }
}
```

---

### 2.3 获取帖子详情 (Get Post Detail)

- **URL**: `GET /api/community/posts/{id}`
- **Auth**: Optional (游客可见)

**Response (200 OK):**

```json
{
  "code": 200,
  "data": {
    "id": 1001,
    "title": "成都5日深度游",
    "content": "完整的心得体会内容...",
    "coverImage": "...",
    "createTime": "...",
    
    "author": { ... }, // 同列表结构
    "stats": { ... }, // 同列表结构
    
    "isLiked": true, // 当前用户是否已赞
    "isCollected": false,
    
    // 关联的完整行程数据 (结构同 TripDetail)
    "trip": {
      "id": 500,
      "city": "成都市",
      "days": 5,
      "tripDetails": [ ... ] // 具体的每日行程列表
    }
  }
}
```

**后端逻辑**:
1. `view_count` 自增 +1。
2. 如果请求头包含 Token，需查询 `community_likes` 和 `community_collections` 表来填充 `isLiked` 和 `isCollected`。

---

### 2.4 交互操作 (Interact)

点赞、取消点赞、收藏、取消收藏。

- **URL**: `POST /api/community/posts/{id}/interact`
- **Auth**: Required

**Request Body:**

| 字段 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `type` | String | Yes | `like` (点赞) 或 `collect` (收藏) |
| `action` | String | Yes | `add` (添加) 或 `remove` (取消) |

**Response (200 OK):**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "newCount": 46 // 返回最新的计数，方便前端更新 UI
  }
}
```

**后端逻辑**:
1. `type=like, action=add`: 
   - 检查 `community_likes` 是否已存在。
   - 不存在则 insert，同时 `update community_posts set like_count = like_count + 1`。
2. `type=like, action=remove`:
   - delete from `community_likes`。
   - `update community_posts set like_count = like_count - 1`。
3. 收藏同理。

---

### 2.5 复制/复用行程 (Fork Trip)

用户浏览帖子时，一键将该行程复制为自己的草稿。

- **URL**: `POST /api/community/posts/{id}/fork`
- **Auth**: Required

**Request Body:** Empty JSON `{}`

**Response (200 OK):**

```json
{
  "code": 200,
  "msg": "复制成功",
  "data": {
    "newTripId": 600 // 返回新创建的行程 ID
  }
}
```

**后端逻辑 (关键)**:
1. 根据 `postId` 找到源 `tripId`。
2. **深度复制**:
   - 在 `trips` 表创建新记录:
     - `user_id`: 当前登录用户 ID
     - `title`: "复制自 [原作者名]: [原标题]"
     - `status`: 1 (草稿状态)
     - `ai_generated`: 继承原值
     - `city`, `days`, `total_budget` 等: 复制原值
   - 在 `trip_details` 表复制所有记录:
     - 将原 `trip_id` 下的所有 detail 复制一份，并将 `trip_id` 指向新创建的 ID。
3. 返回新行程的 ID。

---

### 2.6 评论列表 (可选 Phase 2)

- **URL**: `GET /api/community/posts/{id}/comments`
- **Auth**: Optional

**Response**: 标准评论列表结构，包含用户信息和回复关系。

---

## 3. 开发注意事项

1.  **图片处理**: 帖子封面图如果用户没有上传，必须有兜底策略（使用目的地城市图）。
2.  **性能优化**: 列表页查询尽量减少 `JOIN` 的层级，可以考虑 View Object (VO) 组装。
3.  **安全性**: `Fork` 接口需要确保源行程是公开的 (关联的 Post 是 public 的)。

