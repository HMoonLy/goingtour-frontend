-- 行程草稿表
-- 用于存储用户在创建行程过程中的草稿数据
CREATE TABLE `trip_drafts` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '草稿ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `name` varchar(255) NOT NULL COMMENT '草稿名称',
  `current_step` tinyint(4) NOT NULL DEFAULT '0' COMMENT '当前步骤 (0-基础信息, 1-个性化偏好, 2-智能生成, 3-行程预览)',
  `is_auto` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否为自动草稿 (0-手动保存, 1-自动保存)',
  
  -- 基础表单数据 (JSON格式存储)
  `base_form` json NOT NULL COMMENT '基础表单数据: {destination, destinationName, days, dateRange, travelers, budget}',
  
  -- 偏好表单数据 (JSON格式存储)  
  `preference_form` json NOT NULL COMMENT '偏好表单数据: {tripGoals, pacePreference, focusAreas, socialPreference, photoPreference, dietaryRestrictions, customDietaryNotes, specialRequirements}',
  
  -- 选择的景点和餐厅 (JSON格式存储)
  `selected_attractions` json DEFAULT NULL COMMENT '选择的景点列表',
  `selected_restaurants` json DEFAULT NULL COMMENT '选择的餐厅列表',
  
  -- 额外信息
  `extra_requirements` text DEFAULT NULL COMMENT '额外需求',
  `weather_suggestion` json DEFAULT NULL COMMENT '天气建议信息',
  
  -- 元数据
  `version` varchar(10) NOT NULL DEFAULT '1.0' COMMENT '数据版本，用于兼容性检查',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_user_updated` (`user_id`, `updated_at`),
  KEY `idx_auto_created` (`is_auto`, `created_at`),
  
  -- 外键约束 (假设用户表为users)
  CONSTRAINT `fk_trip_drafts_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行程创建草稿表';

-- 创建索引以优化查询性能
-- 1. 按用户查询最近更新的草稿
CREATE INDEX `idx_user_recent_drafts` ON `trip_drafts` (`user_id`, `updated_at` DESC);

-- 2. 按用户查询自动草稿
CREATE INDEX `idx_user_auto_drafts` ON `trip_drafts` (`user_id`, `is_auto`, `updated_at` DESC);

-- 3. 清理过期草稿的索引
CREATE INDEX `idx_created_for_cleanup` ON `trip_drafts` (`created_at`);

-- 示例数据 (可选，用于测试)
INSERT INTO `trip_drafts` (`user_id`, `name`, `current_step`, `is_auto`, `base_form`, `preference_form`) VALUES 
(1, '上海3日游草稿', 1, 0, 
 JSON_OBJECT('destination', '310000', 'destinationName', '上海市', 'days', 3, 'dateRange', JSON_ARRAY('2024-03-15', '2024-03-17'), 'travelers', 2, 'budget', 'moderate'),
 JSON_OBJECT('tripGoals', JSON_ARRAY('food', 'sightseeing'), 'pacePreference', 'balanced', 'focusAreas', JSON_ARRAY('local_cuisine', 'historical_culture'), 'socialPreference', 'mixed', 'photoPreference', 'casual', 'dietaryRestrictions', JSON_ARRAY(), 'customDietaryNotes', '', 'specialRequirements', '')
);

-- 草稿清理存储过程 (用于定期清理过期草稿)
DELIMITER //
CREATE PROCEDURE `CleanupExpiredDrafts`()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE draft_count INT DEFAULT 0;
    
    -- 删除7天前创建的自动草稿
    DELETE FROM `trip_drafts` 
    WHERE `is_auto` = 1 
    AND `created_at` < DATE_SUB(NOW(), INTERVAL 7 DAY);
    
    SELECT ROW_COUNT() AS deleted_auto_drafts;
    
    -- 删除30天前创建的手动草稿 (可选，根据业务需求调整)
    DELETE FROM `trip_drafts` 
    WHERE `is_auto` = 0 
    AND `created_at` < DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    SELECT ROW_COUNT() AS deleted_manual_drafts;
    
    -- 为每个用户保留最多10个草稿，删除多余的旧草稿
    CREATE TEMPORARY TABLE temp_excess_drafts AS (
        SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) as rn
            FROM `trip_drafts`
        ) ranked
        WHERE rn > 10
    );
    
    DELETE FROM `trip_drafts` WHERE id IN (SELECT id FROM temp_excess_drafts);
    SELECT ROW_COUNT() AS deleted_excess_drafts;
    
    DROP TEMPORARY TABLE temp_excess_drafts;
END //
DELIMITER ;

-- 创建定期执行清理任务的事件 (需要开启事件调度器)
-- SET GLOBAL event_scheduler = ON;
-- CREATE EVENT `event_cleanup_drafts`
-- ON SCHEDULE EVERY 1 DAY
-- STARTS CURRENT_TIMESTAMP
-- DO CALL CleanupExpiredDrafts();