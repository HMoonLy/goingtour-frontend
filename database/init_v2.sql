SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =======================================================
-- 1. 用户与权限模块
-- =======================================================

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '邮箱地址',
  `nickname` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '昵称',
  `avatar` longtext COLLATE utf8mb4_unicode_ci COMMENT '头像URL或Base64数据',
  `preferences` json DEFAULT NULL COMMENT '偏好标签JSON',
  `budget` decimal(10,2) DEFAULT '500.00' COMMENT '日均预算',
  `password` varchar(255) DEFAULT NULL COMMENT '密码',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除标识 0-正常 1-删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ----------------------------
-- Table structure for user_preferences
-- ----------------------------
DROP TABLE IF EXISTS `user_preferences`;
CREATE TABLE `user_preferences` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `selected_tags` json DEFAULT NULL COMMENT '旅行标签',
  `budget` decimal(10,2) DEFAULT '500.00',
  `selected_transports` json DEFAULT NULL,
  `accommodation_type` varchar(50) DEFAULT NULL,
  `food_tastes` json DEFAULT NULL,
  `dietary_restrictions` json DEFAULT NULL,
  `preferred_times` json DEFAULT NULL,
  `travel_pace` varchar(20) DEFAULT 'medium',
  `mbti_type` varchar(10) DEFAULT NULL,
  `other_preferences` json DEFAULT NULL,
  `is_completed` tinyint(4) DEFAULT '0',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  CONSTRAINT `fk_user_preferences_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户偏好表';

-- ----------------------------
-- Table structure for verification_codes
-- ----------------------------
DROP TABLE IF EXISTS `verification_codes`;
CREATE TABLE `verification_codes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `code` varchar(6) NOT NULL,
  `type` varchar(20) DEFAULT 'login',
  `used` tinyint(1) DEFAULT '0',
  `expire_time` datetime NOT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email_code` (`email`,`code`),
  KEY `idx_expire_time` (`expire_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='验证码表';

-- ----------------------------
-- Table structure for login_history
-- ----------------------------
DROP TABLE IF EXISTS `login_history`;
CREATE TABLE `login_history` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `login_method` varchar(20) DEFAULT 'EMAIL_CODE',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `device_type` varchar(20) DEFAULT NULL,
  `browser` varchar(50) DEFAULT NULL,
  `operating_system` varchar(50) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'SUCCESS',
  `failure_reason` varchar(200) DEFAULT NULL,
  `login_time` datetime NOT NULL,
  `session_duration` int(11) DEFAULT NULL,
  `logout_time` datetime DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_login_history_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录历史表';


-- =======================================================
-- 2. 核心业务模块：行程 (Trips)
-- =======================================================

-- ----------------------------
-- Table structure for trips
-- ----------------------------
DROP TABLE IF EXISTS `trips`;
CREATE TABLE `trips` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '行程ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `title` varchar(100) DEFAULT NULL COMMENT '行程标题',
  `city` varchar(50) NOT NULL COMMENT '目的地城市',
  `days` int(11) NOT NULL COMMENT '出行天数',
  `mate` int(11) DEFAULT '1' COMMENT '同行人数',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态 1-草稿 2-已发布 3-已完成',
  `total_budget` decimal(10,2) DEFAULT '0.00' COMMENT '总预算',
  `actual_cost` decimal(10,2) DEFAULT '0.00' COMMENT '实际花费',
  `share_code` varchar(32) DEFAULT NULL COMMENT '分享码',
  
  -- AI 相关字段
  `ai_generated` tinyint(1) DEFAULT '0' COMMENT '是否AI生成',
  `ai_content` longtext COMMENT 'AI生成的Markdown原始内容',
  `destination_info` json DEFAULT NULL COMMENT '目的地信息JSON',
  `trip_basic_info` json DEFAULT NULL COMMENT '行程基础信息JSON',
  `quality_score` decimal(5,2) DEFAULT '0.00' COMMENT '质量评分',
  `processing_time` int(11) DEFAULT '0' COMMENT '生成耗时(ms)',
  `generation_params` json DEFAULT NULL COMMENT '生成参数',
  `feedback_rating` decimal(2,1) DEFAULT '0.0' COMMENT '用户评分',
  `feedback_content` text COMMENT '用户反馈',

  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_share_code` (`share_code`),
  CONSTRAINT `fk_trips_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行程主表';

-- ----------------------------
-- Table structure for trip_details
-- 前端 "dailyPlan" 转换后的存储表
-- ----------------------------
DROP TABLE IF EXISTS `trip_details`;
CREATE TABLE `trip_details` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `trip_id` bigint(20) NOT NULL COMMENT '行程ID',
  `day` int(11) NOT NULL COMMENT '第几天',
  `time_slot` varchar(20) NOT NULL COMMENT 'morning/afternoon/evening',
  `sequence` int(11) DEFAULT '1' COMMENT '顺序',
  `duration` int(11) DEFAULT '120' COMMENT '分钟',
  `notes` text COMMENT '备注/描述',
  
  -- 关联字段 (前端converter需要这些)
  `attraction_id` bigint(20) DEFAULT NULL,
  `restaurant_id` bigint(20) DEFAULT NULL,
  
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_trip_id` (`trip_id`),
  KEY `idx_day_slot` (`day`,`time_slot`),
  CONSTRAINT `fk_trip_details_trip_id` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行程每日详情表';

-- ----------------------------
-- Table structure for ai_trip_activities
-- AI生成的具体活动建议 (更详细的结构化数据)
-- ----------------------------
DROP TABLE IF EXISTS `ai_trip_activities`;
CREATE TABLE `ai_trip_activities` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `trip_id` bigint(20) NOT NULL,
  `day` int(11) NOT NULL,
  `start_time` varchar(10) DEFAULT NULL,
  `end_time` varchar(10) DEFAULT NULL,
  `activity_type` varchar(20) NOT NULL COMMENT 'attraction/restaurant/transport/etc',
  `title` varchar(200) NOT NULL,
  `description` text,
  `location` varchar(500) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `price_info` varchar(200) DEFAULT NULL,
  `transport_info` varchar(500) DEFAULT NULL,
  `sequence` int(11) DEFAULT '1',
  `duration_minutes` int(11) DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `deleted` tinyint(1) DEFAULT '0',
  
  -- 新增兼容字段
  `attraction_id` bigint(20) DEFAULT NULL,
  `restaurant_id` bigint(20) DEFAULT NULL,

  PRIMARY KEY (`id`),
  KEY `idx_trip_id` (`trip_id`),
  CONSTRAINT `fk_ai_trip_activities_trip_id` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI行程活动详情表';

-- ----------------------------
-- Table structure for trip_drafts
-- ----------------------------
DROP TABLE IF EXISTS `trip_drafts`;
CREATE TABLE `trip_drafts` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `current_step` tinyint(4) DEFAULT '0',
  `is_auto` tinyint(1) DEFAULT '0',
  `base_form` json NOT NULL,
  `preference_form` json NOT NULL,
  `selected_attractions` json DEFAULT NULL,
  `selected_restaurants` json DEFAULT NULL,
  `extra_requirements` text,
  `weather_suggestion` json DEFAULT NULL,
  `version` varchar(10) DEFAULT '1.0',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_trip_drafts_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行程草稿表';


-- =======================================================
-- 3. 足迹与愿望清单模块
-- =======================================================

-- ----------------------------
-- Table structure for visited_cities
-- ----------------------------
DROP TABLE IF EXISTS `visited_cities`;
CREATE TABLE `visited_cities` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `adcode` varchar(20) NOT NULL,
  `city_name` varchar(100) NOT NULL,
  `travel_time` date DEFAULT NULL,
  `travel_feeling` text,
  `photo_url` varchar(500) DEFAULT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `caption` varchar(200) DEFAULT NULL,
  `is_cover` tinyint(1) DEFAULT '0',
  `tags` json DEFAULT NULL,
  `upload_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) DEFAULT '0',
  `citycode` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_city` (`user_id`,`adcode`),
  CONSTRAINT `fk_visited_cities_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='足迹表';

-- ----------------------------
-- Table structure for wishlist_items
-- ----------------------------
DROP TABLE IF EXISTS `wishlist_items`;
CREATE TABLE `wishlist_items` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `adcode` varchar(32) NOT NULL,
  `city_name` varchar(100) NOT NULL,
  `reason` text,
  `tags` json DEFAULT NULL,
  `status` enum('wishlist','visited') DEFAULT 'wishlist',
  `ever_visited` tinyint(1) DEFAULT '0',
  `want_to_visit_again` tinyint(1) DEFAULT '0',
  `visit_date` datetime DEFAULT NULL,
  `citycode` varchar(10) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_city` (`user_id`,`adcode`),
  CONSTRAINT `fk_wishlist_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='愿望清单表';


-- =======================================================
-- 4. 基础数据模块 (Destinations)
-- 补充此表以支持前端热门目的地展示
-- =======================================================

DROP TABLE IF EXISTS `destinations`;
CREATE TABLE `destinations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `adcode` varchar(20) DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `description` text,
  `tags` json DEFAULT NULL,
  `hot_level` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='热门目的地基础数据';


-- =======================================================
-- 5. 初始化数据
-- =======================================================

-- 1. 插入测试用户 (ID: 4, email: 1366456164@qq.com)
INSERT INTO `users` (`id`, `email`, `nickname`, `avatar`, `budget`, `password`) VALUES 
(4, '1366456164@qq.com', '小黄4821', '/avatars/user_小黄4821_1755182571826_6f31df86.jpg', 300.00, NULL);

-- 2. 插入测试用户偏好
INSERT INTO `user_preferences` (`user_id`, `mbti_type`, `travel_pace`, `budget`, `selected_tags`) VALUES
(4, 'ESTJ', 'fast', 1000.00, '["历史古迹", "亲子游"]');

-- 3. 插入热门目的地数据 (来源于前端 destinations.js)
INSERT INTO `destinations` (`name`, `adcode`, `cover_image`, `description`, `tags`, `hot_level`) VALUES
('北京市', '110000', '/images/destinations/beijing.jpg', '千年古都，现代与传统的完美融合', '["历史文化", "美食购物", "皇城风韵"]', 100),
('上海市', '310000', '/images/destinations/shanghai.jpg', '东方巴黎，国际化大都市', '["时尚购物", "外滩夜景", "摩登都市"]', 99),
('杭州市', '330100', '/images/destinations/hangzhou.jpg', '人间天堂，诗意江南水乡', '["西湖美景", "江南古韵", "茶香文化"]', 98),
('成都市', '510100', '/images/destinations/chengdu.jpg', '天府之国，美食与熊猫的故乡', '["巴蜀美食", "大熊猫", "慢生活"]', 97),
('重庆市', '500000', '/images/destinations/chongqing.jpg', '山城雾都，火辣的巴渝风情', '["火锅之都", "山城夜景", "魔幻8D"]', 96),
('西安市', '610100', '/images/destinations/xian.jpg', '十三朝古都，丝路起点', '["兵马俑", "古城墙", "汉唐遗风"]', 95),
('三亚市', '460200', '/images/destinations/sanya.jpg', '热带天堂，椰风海韵', '["阳光沙滩", "热带风情", "度假胜地"]', 94),
('厦门市', '350200', '/images/destinations/xiamen.jpg', '鹭岛风光，文艺清新', '["鼓浪屿", "海上花园", "闽南文化"]', 93),
('丽江市', '530700', '/images/destinations/lijiang.jpg', '艳遇之都，纳西古韵', '["古城文化", "雪山美景", "民族风情"]', 92),
('桂林市', '450300', '/images/destinations/guilin.jpg', '山水甲天下，漓江画廊', '["山水风光", "漓江竹筏", "溶洞奇观"]', 91);

-- 4. 插入示例行程数据
INSERT INTO `trips` (`id`, `user_id`, `title`, `city`, `days`, `mate`, `status`, `total_budget`, `ai_generated`, `ai_content`, `destination_info`, `trip_basic_info`) VALUES 
(30, 4, '北京市3天1人行程', '北京市', 3, 1, 1, 2250.00, 1, '### **北京3天紧凑型独旅计划**...', '{"code": "110000", "name": "北京市"}', '{"days": 3, "budget": "适中舒适", "travelers": 1}');

-- 5. 插入行程详情 (Trip Details)
INSERT INTO `trip_details` (`trip_id`, `day`, `time_slot`, `sequence`, `duration`, `notes`, `attraction_id`, `restaurant_id`) VALUES
(30, 1, 'morning', 1, 60, '天安门广场看升旗', NULL, NULL),
(30, 1, 'morning', 2, 210, '故宫博物院深度游', 101, NULL),
(30, 1, 'afternoon', 1, 90, '午餐：四季民福烤鸭店', NULL, 201);

SET FOREIGN_KEY_CHECKS = 1;
