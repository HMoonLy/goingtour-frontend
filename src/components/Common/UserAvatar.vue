<template>
  <div class="user-avatar" :class="[`size-${size}`, { clickable: clickable }]" @click="handleClick">
    <div class="avatar-wrapper">
      <img
        v-if="avatar"
        :src="avatar"
        :alt="userName"
        class="avatar-image"
        @error="handleImageError"
      />
      <div v-else class="default-avatar" :style="defaultAvatarStyle">
        <span class="avatar-text">{{ getInitials(userName) }}</span>
      </div>
      
      <!-- 在线状态指示器 -->
      <div v-if="showStatus" class="status-indicator" :class="status"></div>
      
      <!-- 悬浮信息 -->
      <div v-if="showTooltip && userName" class="avatar-tooltip">
        {{ userName }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // 头像URL
  avatar: {
    type: String,
    default: ''
  },
  // 用户名
  userName: {
    type: String,
    default: '用户'
  },
  // 头像大小: xs, sm, md, lg, xl
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  // 是否可点击
  clickable: {
    type: Boolean,
    default: false
  },
  // 是否显示状态指示器
  showStatus: {
    type: Boolean,
    default: false
  },
  // 状态类型: online, offline, busy, away
  status: {
    type: String,
    default: 'offline',
    validator: (value) => ['online', 'offline', 'busy', 'away'].includes(value)
  },
  // 是否显示悬浮提示
  showTooltip: {
    type: Boolean,
    default: false
  },
  // 自定义默认头像背景色
  backgroundColor: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['click']);

// 计算初始字母
const getInitials = (name) => {
  if (!name) return 'U';
  const names = name.trim().split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// 生成默认头像颜色
const generateColor = (name) => {
  if (props.backgroundColor) return props.backgroundColor;
  
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// 默认头像样式
const defaultAvatarStyle = computed(() => ({
  background: generateColor(props.userName),
  color: '#ffffff'
}));

// 处理图片加载错误
const handleImageError = (e) => {
  e.target.style.display = 'none';
};

// 处理点击事件
const handleClick = () => {
  if (props.clickable) {
    emit('click');
  }
};
</script>

<style scoped>
.user-avatar {
  display: inline-block;
  position: relative;
}

.user-avatar.clickable {
  cursor: pointer;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  border-radius: 50%;
  overflow: hidden;
  transition: all 0.3s ease;
}

.user-avatar.clickable .avatar-wrapper:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.default-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-radius: 50%;
}

.avatar-text {
  user-select: none;
}

/* 状态指示器 */
.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 25%;
  height: 25%;
  border-radius: 50%;
  border: 2px solid #ffffff;
  background: #d1d5db;
}

.status-indicator.online {
  background: #10b981;
}

.status-indicator.busy {
  background: #ef4444;
}

.status-indicator.away {
  background: #f59e0b;
}

.status-indicator.offline {
  background: #6b7280;
}

/* 悬浮提示 */
.avatar-tooltip {
  position: absolute;
  bottom: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 10;
}

.user-avatar:hover .avatar-tooltip {
  opacity: 1;
}

/* 大小变体 */
.size-xs .avatar-wrapper {
  width: 24px;
  height: 24px;
}

.size-xs .avatar-text {
  font-size: 10px;
}

.size-xs .status-indicator {
  width: 8px;
  height: 8px;
  border-width: 1px;
}

.size-sm .avatar-wrapper {
  width: 32px;
  height: 32px;
}

.size-sm .avatar-text {
  font-size: 12px;
}

.size-sm .status-indicator {
  width: 10px;
  height: 10px;
  border-width: 1px;
}

.size-md .avatar-wrapper {
  width: 48px;
  height: 48px;
}

.size-md .avatar-text {
  font-size: 16px;
}

.size-md .status-indicator {
  width: 12px;
  height: 12px;
  border-width: 2px;
}

.size-lg .avatar-wrapper {
  width: 80px;
  height: 80px;
}

.size-lg .avatar-text {
  font-size: 28px;
}

.size-lg .status-indicator {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

.size-xl .avatar-wrapper {
  width: 120px;
  height: 120px;
}

.size-xl .avatar-text {
  font-size: 40px;
}

.size-xl .status-indicator {
  width: 20px;
  height: 20px;
  border-width: 3px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .size-lg .avatar-wrapper {
    width: 64px;
    height: 64px;
  }
  
  .size-lg .avatar-text {
    font-size: 22px;
  }
  
  .size-xl .avatar-wrapper {
    width: 96px;
    height: 96px;
  }
  
  .size-xl .avatar-text {
    font-size: 32px;
  }
}
</style>