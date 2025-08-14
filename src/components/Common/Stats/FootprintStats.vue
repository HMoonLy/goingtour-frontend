<template>
  <div class="footprint-stats-card">
    <div class="stats-header">
      <h3 class="stats-title">
        <el-icon><TrophyBase /></el-icon>
        我的足迹成就
      </h3>
      <div class="exploration-rate">
        <el-progress
          :percentage="stats.explorationRate"
          :color="progressColor"
          :stroke-width="8"
          striped
          striped-flow
        />
        <span class="rate-text">已探索中国 {{ stats.explorationRate }}%</span>
      </div>
    </div>

    <!-- 空状态提示 -->
    <div v-if="!hasData" class="empty-state">
      <div class="empty-icon">
        <el-icon size="48" color="#C0C4CC">
          <LocationInformation />
        </el-icon>
      </div>
      <div class="empty-content">
        <h4>开始记录你的足迹</h4>
        <p>添加城市到愿望清单，开启你的旅行统计之旅</p>
      </div>
    </div>

    <div v-if="hasData" class="stats-grid">
      <!-- 总城市数 -->
      <div class="stat-item total">
        <div class="stat-icon">
          <el-icon><LocationInformation /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">
            {{ stats.totalCities }}
          </div>
          <div class="stat-label">总城市</div>
        </div>
      </div>

      <!-- 已去过 -->
      <div class="stat-item visited">
        <div class="stat-icon">
          <el-icon><Check /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">
            {{ stats.visitedCities }}
          </div>
          <div class="stat-label">已去过</div>
        </div>
      </div>

      <!-- 想去的 -->
      <div class="stat-item wishlist">
        <div class="stat-icon">
          <el-icon><Star /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">
            {{ stats.wishlistCities }}
          </div>
          <div class="stat-label">想去的</div>
        </div>
      </div>

      <!-- 探索省份 -->
      <div class="stat-item provinces">
        <div class="stat-icon">
          <el-icon><MapLocation /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">
            {{ stats.exploredProvinces }}
          </div>
          <div class="stat-label">个省份</div>
        </div>
      </div>
    </div>

    <!-- 成就徽章 -->
    <div v-if="hasData && achievements.length > 0" class="achievements-section">
      <h4 class="achievements-title">
        <el-icon><Medal /></el-icon>
        最新成就
      </h4>
      <div class="achievements-list">
        <div
          v-for="achievement in achievements.slice(0, 3)"
          :key="achievement.id"
          class="achievement-badge"
          :class="achievement.level"
        >
          <div class="achievement-icon">
            <el-icon>
              <component :is="achievement.icon" />
            </el-icon>
          </div>
          <div class="achievement-info">
            <div class="achievement-title">
              {{ achievement.title }}
            </div>
            <div class="achievement-desc">
              {{ achievement.description }}
            </div>
          </div>
          <div class="achievement-date">
            {{ formatDate(achievement.unlockedAt) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 分享按钮 -->
    <div v-if="hasData" class="stats-actions">
      <el-button
        type="primary"
        :loading="sharing"
        class="share-btn"
        @click="handleShare"
      >
        <el-icon><Share /></el-icon>
        {{ sharing ? '正在生成...' : '分享我的足迹' }}
      </el-button>
      <el-button class="view-all-btn" @click="handleViewAllAchievements">
        <el-icon><View /></el-icon>
        查看全部成就
      </el-button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { FootprintShareUtil } from '@/utils/footprintShare.js';
import {
  TrophyBase,
  LocationInformation,
  Check,
  Star,
  MapLocation,
  Medal,
  Share,
  View,
  Trophy,
  Flag,
  Compass,
} from '@element-plus/icons-vue';

export default {
  name: 'FootprintStats',
  components: {
    TrophyBase,
    LocationInformation,
    Check,
    Star,
    MapLocation,
    Medal,
    Share,
    View,
    Trophy,
    Flag,
    Compass,
  },
  props: {
    stats: {
      type: Object,
      required: true,
    },
    hasData: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['share', 'view-achievements'],
  setup(props, { emit }) {
    const sharing = ref(false);

    // 进度条颜色
    const progressColor = computed(() => {
      const rate = props.stats.explorationRate;
      if (rate >= 50) return '#10b981'; // 绿色
      if (rate >= 25) return '#f59e0b'; // 橙色
      if (rate >= 10) return '#3b82f6'; // 蓝色
      return '#91a8d0'; // 默认色
    });

    // 模拟成就数据（实际应该从store获取）
    const achievements = computed(() => {
      const result = [];
      const { visitedCities, exploredProvinces, totalCities } = props.stats;

      // 第一次添加城市
      if (totalCities >= 1) {
        result.push({
          id: 'first-city',
          title: '旅行启程',
          description: '添加了第一个心愿城市',
          icon: 'Flag',
          level: 'bronze',
          unlockedAt: new Date(),
        });
      }

      // 去过5个城市
      if (visitedCities >= 5) {
        result.push({
          id: 'visited-5',
          title: '足迹初现',
          description: '已经去过5个城市',
          icon: 'Check',
          level: 'silver',
          unlockedAt: new Date(),
        });
      }

      // 去过10个城市
      if (visitedCities >= 10) {
        result.push({
          id: 'visited-10',
          title: '城市达人',
          description: '已经去过10个城市',
          icon: 'Trophy',
          level: 'gold',
          unlockedAt: new Date(),
        });
      }

      // 探索3个省份
      if (exploredProvinces >= 3) {
        result.push({
          id: 'provinces-3',
          title: '跨省旅行者',
          description: '足迹遍布3个省份',
          icon: 'MapLocation',
          level: 'silver',
          unlockedAt: new Date(),
        });
      }

      // 探索5个省份
      if (exploredProvinces >= 5) {
        result.push({
          id: 'provinces-5',
          title: '地理专家',
          description: '足迹遍布5个省份',
          icon: 'Compass',
          level: 'gold',
          unlockedAt: new Date(),
        });
      }

      return result.sort(
        (a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt)
      );
    });

    // 格式化日期
    const formatDate = date => {
      const now = new Date();
      const diffTime = now - new Date(date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return '今天解锁';
      if (diffDays === 1) return '昨天解锁';
      if (diffDays < 7) return `${diffDays}天前解锁`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前解锁`;

      return (
        new Date(date).toLocaleDateString('zh-CN', {
          month: 'short',
          day: 'numeric',
        }) + '解锁'
      );
    };

    // 分享功能
    const handleShare = async () => {
      sharing.value = true;
      try {
        // 获取整个统计卡片元素
        const element = document.querySelector('.footprint-stats-card');
        if (!element) {
          throw new Error('找不到统计卡片元素');
        }

        // 使用新的分享工具类
        await FootprintShareUtil.shareFootprint(element, {
          ...props.stats,
          wishlistCities: props.stats.totalCities - props.stats.visitedCities, // 计算想去的城市数量
        });

        emit('share', props.stats);
      } catch (error) {
        console.error('分享失败:', error);
        ElMessage.error(`分享失败: ${error.message}`);
      } finally {
        sharing.value = false;
      }
    };

    // 查看全部成就
    const handleViewAllAchievements = () => {
      emit('view-achievements');
    };

    return {
      sharing,
      progressColor,
      achievements,
      formatDate,
      handleShare,
      handleViewAllAchievements,
    };
  },
};
</script>

<style scoped>
.footprint-stats-card {
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  margin-top: 20px;
}

.stats-header {
  margin-bottom: 24px;
}

.stats-title {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stats-title .el-icon {
  color: #f59e0b;
  font-size: 24px;
}

.exploration-rate {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rate-text {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  text-align: center;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 16px;
  text-align: center;
}

.empty-icon {
  opacity: 0.6;
}

.empty-content h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #4b5563;
}

.empty-content p {
  margin: 0;
  font-size: 14px;
  color: #9ca3af;
  line-height: 1.5;
  max-width: 280px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  border-radius: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-item.total {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
}

.stat-item.total::before {
  background: linear-gradient(90deg, #6b7280 0%, #4b5563 100%);
}

.stat-item.visited {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.stat-item.visited::before {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.stat-item.wishlist {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.stat-item.wishlist::before {
  background: linear-gradient(90deg, #91a8d0 0%, #6366f1 100%);
}

.stat-item.provinces {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
}

.stat-item.provinces::before {
  background: linear-gradient(90deg, #7c3aed 0%, #5b21b6 100%);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.stat-item.total .stat-icon {
  color: #4b5563;
}

.stat-item.visited .stat-icon {
  color: #d97706;
}

.stat-item.wishlist .stat-icon {
  color: #2563eb;
}

.stat-item.provinces .stat-icon {
  color: #7c3aed;
}

.stat-content {
  text-align: center;
}

.stat-number {
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-item.total .stat-number {
  color: #1f2937;
}

.stat-item.visited .stat-number {
  color: #d97706;
}

.stat-item.wishlist .stat-number {
  color: #2563eb;
}

.stat-item.provinces .stat-number {
  color: #7c3aed;
}

.stat-label {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
}

/* 成就系统 */
.achievements-section {
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border: 1px solid rgba(145, 168, 208, 0.1);
}

.achievements-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}

.achievements-title .el-icon {
  color: #f59e0b;
  font-size: 18px;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.achievement-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.achievement-badge:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
}

.achievement-badge.bronze {
  border-color: rgba(217, 119, 6, 0.2);
}

.achievement-badge.silver {
  border-color: rgba(107, 114, 128, 0.2);
}

.achievement-badge.gold {
  border-color: rgba(245, 158, 11, 0.2);
}

.achievement-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.achievement-badge.bronze .achievement-icon {
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  color: #d97706;
}

.achievement-badge.silver .achievement-icon {
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  color: #4b5563;
}

.achievement-badge.gold .achievement-icon {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #f59e0b;
}

.achievement-info {
  flex: 1;
  min-width: 0;
}

.achievement-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.achievement-desc {
  font-size: 12px;
  color: #6b7280;
}

.achievement-date {
  font-size: 11px;
  color: #9ca3af;
  flex-shrink: 0;
  text-align: right;
}

/* 操作按钮 */
.stats-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.share-btn {
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%) !important;
  border: none !important;
  border-radius: 12px !important;
  font-weight: 600 !important;
  padding: 12px 24px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 16px rgba(145, 168, 208, 0.3) !important;
}

.share-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 24px rgba(145, 168, 208, 0.4) !important;
}

.view-all-btn {
  border-radius: 12px !important;
  font-weight: 600 !important;
  padding: 12px 24px !important;
  transition: all 0.3s ease !important;
  border-color: #91a8d0 !important;
  color: #91a8d0 !important;
}

.view-all-btn:hover {
  background: #91a8d0 !important;
  color: white !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.3) !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footprint-stats-card {
    padding: 16px;
    margin-bottom: 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-item {
    padding: 16px 12px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .stat-number {
    font-size: 24px;
  }

  .achievements-section {
    padding: 16px;
  }

  .achievement-badge {
    padding: 10px 12px;
  }

  .achievement-icon {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .stats-actions {
    flex-direction: column;
    gap: 8px;
  }

  .share-btn,
  .view-all-btn {
    width: 100% !important;
    padding: 12px 16px !important;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .footprint-stats-card {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border-color: rgba(145, 168, 208, 0.2);
    color: #f9fafb;
  }

  .stats-title {
    color: #f9fafb;
  }

  .achievements-section {
    background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
    border-color: rgba(145, 168, 208, 0.2);
  }

  .achievement-badge {
    background: rgba(31, 41, 55, 0.8);
  }

  .achievement-title {
    color: #f9fafb;
  }

  .empty-content h4 {
    color: #f9fafb;
  }

  .empty-content p {
    color: #d1d5db;
  }
}
</style>
