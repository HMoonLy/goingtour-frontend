<template>
  <div
    class="mini-wishlist-card"
    :class="{
      visited: wishlistItem.status === 'visited',
      wishlist: wishlistItem.status === 'wishlist',
      highlighted: isHighlighted,
    }"
    @click="handleCardClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 状态图标 -->
    <div class="status-icon">
      <el-icon v-if="wishlistItem.status === 'visited'" class="visited-icon">
        <Check />
      </el-icon>
      <el-icon v-else class="wishlist-icon">
        <Star />
      </el-icon>
    </div>

    <!-- 城市信息 -->
    <div class="city-info">
      <span class="city-name">{{ wishlistItem.cityName }}</span>
      <div class="city-meta">
        <!-- 主要标签 -->
        <span v-if="primaryTag" class="primary-tag">{{ primaryTag }}</span>
        <!-- 添加时间 -->
        <span class="added-time">{{ formatTime(wishlistItem.createdAt) }}</span>
      </div>
    </div>

    <!-- 快捷操作菜单 -->
    <div v-show="showActions" class="actions-menu">
      <el-dropdown trigger="click" @command="handleCommand">
        <el-button class="action-trigger" circle size="small" text>
          <el-icon><MoreFilled /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              :command="
                wishlistItem.status === 'visited'
                  ? 'mark-wishlist'
                  : 'mark-visited'
              "
            >
              <el-icon>
                <{{ wishlistItem.status === 'visited' ? 'Star' : 'Check' }}
              </el-icon>
              {{
                wishlistItem.status === 'visited' ? '标记为想去' : '标记为去过'
              }}
            </el-dropdown-item>
            <el-dropdown-item command="edit">
              <el-icon><Edit /></el-icon>
              编辑信息
            </el-dropdown-item>
            <el-dropdown-item command="weather">
              <el-icon><Sunny /></el-icon>
              查看天气
            </el-dropdown-item>
            <el-dropdown-item command="plan">
              <el-icon><MapLocation /></el-icon>
              规划行程
            </el-dropdown-item>
            <el-dropdown-item command="remove" divided>
              <el-icon><Delete /></el-icon>
              移除城市
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 状态切换快捷按钮 -->
    <div class="status-toggle" @click.stop="handleStatusToggle">
      <el-tooltip
        :content="
          wishlistItem.status === 'visited' ? '标记为想去' : '标记为去过'
        "
        placement="top"
      >
        <el-button
          class="toggle-btn"
          circle
          size="small"
          :type="wishlistItem.status === 'visited' ? 'warning' : 'success'"
          text
        >
          <el-icon>
            <Star v-if="wishlistItem.status === 'visited'" />
            <Check v-else />
          </el-icon>
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import {
  Star,
  Check,
  Edit,
  Sunny,
  MapLocation,
  Delete,
  MoreFilled,
} from '@element-plus/icons-vue';

export default {
  name: 'MiniWishlistCard',
  components: {
    Star,
    Check,
    Edit,
    Sunny,
    MapLocation,
    Delete,
    MoreFilled,
  },
  props: {
    wishlistItem: {
      type: Object,
      required: true,
    },
    isHighlighted: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'click',
    'hover',
    'status-change',
    'edit',
    'weather',
    'plan',
    'remove',
  ],
  setup(props, { emit }) {
    const showActions = ref(false);

    // 获取主要标签
    const primaryTag = computed(() => {
      if (props.wishlistItem.tags && props.wishlistItem.tags.length > 0) {
        return props.wishlistItem.tags[0];
      }
      return null;
    });

    // 格式化时间
    const formatTime = dateString => {
      if (!dateString) return '';

      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now - date;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return '今天';
      if (diffDays === 1) return '昨天';
      if (diffDays < 7) return `${diffDays}天前`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;

      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      });
    };

    // 卡片点击
    const handleCardClick = () => {
      emit('click', props.wishlistItem);
    };

    // 鼠标悬停
    const handleMouseEnter = () => {
      showActions.value = true;
      emit('hover', { item: props.wishlistItem, type: 'enter' });
    };

    const handleMouseLeave = () => {
      showActions.value = false;
      emit('hover', { item: props.wishlistItem, type: 'leave' });
    };

    // 状态切换
    const handleStatusToggle = () => {
      const newStatus =
        props.wishlistItem.status === 'visited' ? 'wishlist' : 'visited';
      emit('status-change', {
        id: props.wishlistItem.id,
        status: newStatus,
      });
    };

    // 下拉菜单命令处理
    const handleCommand = command => {
      switch (command) {
        case 'mark-visited':
          emit('status-change', {
            id: props.wishlistItem.id,
            status: 'visited',
          });
          break;
        case 'mark-wishlist':
          emit('status-change', {
            id: props.wishlistItem.id,
            status: 'wishlist',
          });
          break;
        case 'edit':
          emit('edit', props.wishlistItem);
          break;
        case 'weather':
          emit('weather', props.wishlistItem);
          break;
        case 'plan':
          emit('plan', props.wishlistItem);
          break;
        case 'remove':
          emit('remove', props.wishlistItem.id);
          break;
      }
    };

    return {
      showActions,
      primaryTag,
      formatTime,
      handleCardClick,
      handleMouseEnter,
      handleMouseLeave,
      handleStatusToggle,
      handleCommand,
    };
  },
};
</script>

<style scoped>
.mini-wishlist-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 12px;
  border: 1px solid rgba(145, 168, 208, 0.1);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  min-width: 200px;
  max-width: 300px;
}

.mini-wishlist-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: transparent;
  transition: background 0.3s ease;
}

.mini-wishlist-card.visited::before {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.mini-wishlist-card.wishlist::before {
  background: linear-gradient(90deg, #91a8d0 0%, #6366f1 100%);
}

.mini-wishlist-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 24px rgba(145, 168, 208, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: rgba(145, 168, 208, 0.3);
}

.mini-wishlist-card.highlighted {
  transform: translateY(-2px) scale(1.02);
  box-shadow:
    0 12px 32px rgba(145, 168, 208, 0.2),
    0 6px 16px rgba(0, 0, 0, 0.1);
  border-color: #91a8d0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.status-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.3s ease;
}

.mini-wishlist-card.visited .status-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.mini-wishlist-card.wishlist .status-icon {
  background: linear-gradient(135deg, #91a8d0 0%, #6366f1 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.3);
}

.city-info {
  flex: 1;
  min-width: 0;
}

.city-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  display: block;
  line-height: 1.3;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.city-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.primary-tag {
  background: rgba(145, 168, 208, 0.1);
  color: #91a8d0;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.added-time {
  color: #6b7280;
  font-weight: 400;
}

.actions-menu {
  opacity: 0;
  transition: opacity 0.3s ease;
  position: absolute;
  top: 8px;
  right: 8px;
}

.mini-wishlist-card:hover .actions-menu {
  opacity: 1;
}

.action-trigger {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(145, 168, 208, 0.2) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-toggle {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mini-wishlist-card:hover .status-toggle {
  opacity: 1;
}

.toggle-btn {
  font-size: 14px !important;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  transform: scale(1.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mini-wishlist-card {
    min-width: 180px;
    max-width: 250px;
    padding: 10px 14px;
    gap: 10px;
  }

  .status-icon {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .city-name {
    font-size: 15px;
  }

  .city-meta {
    font-size: 11px;
    gap: 6px;
  }

  .actions-menu {
    opacity: 1; /* 移动端始终显示 */
  }

  .status-toggle {
    opacity: 1; /* 移动端始终显示 */
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .mini-wishlist-card {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border-color: rgba(145, 168, 208, 0.2);
    color: #f9fafb;
  }

  .mini-wishlist-card.highlighted {
    background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  }

  .city-name {
    color: #f9fafb;
  }

  .added-time {
    color: #d1d5db;
  }

  .action-trigger {
    background: rgba(31, 41, 55, 0.9) !important;
    color: #d1d5db !important;
  }
}
</style>
