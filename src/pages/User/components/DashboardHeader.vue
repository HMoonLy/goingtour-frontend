<template>
  <section class="personal-header">
    <div class="user-profile">
      <div class="avatar-section">
        <AvatarUploader
          :avatar="user.avatar"
          :user-name="user.nickname"
          size="large"
          @update:avatar="$emit('update:avatar', $event)"
        />
      </div>
      <div class="user-info">
        <h2>{{ user.nickname }}</h2>
        <p class="user-meta">
          <span>{{ user.email }}</span>
          <span class="dot">·</span>
          <span>{{ joinDateText }}</span>
        </p>
      </div>
    </div>

    <div class="quick-stats">
      <div class="stat-item">
        <span class="stat-number">{{ stats.total }}</span>
        <span class="stat-label">总行程</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ stats.saved }}</span>
        <span class="stat-label">已保存</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ stats.draft }}</span>
        <span class="stat-label">草稿</span>
      </div>
    </div>
  </section>
</template>

<script>
import { computed } from "vue";
import AvatarUploader from "@/components/Common/UI/AvatarUploader.vue";

export default {
  name: "DashboardHeader",
  components: {
    AvatarUploader,
  },
  props: {
    user: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    stats: {
      type: Object,
      required: true,
      default: () => ({
        total: 0,
        saved: 0,
        draft: 0,
      }),
    },
  },
  emits: ["update:avatar"],
  setup(props) {
    const joinDateText = computed(() => {
      const createTime = props.user?.createTime;
      if (!createTime) return "";

      try {
        const date = new Date(createTime);
        return `加入于 ${date.getFullYear()}年`;
      } catch {
        return "";
      }
    });

    return {
      joinDateText,
    };
  },
};
</script>

<style scoped>
/* 个人中心头部 */
.personal-header {
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-section :deep(.avatar-uploader) {
  --avatar-border-color: rgba(255, 255, 255, 0.3);
}

.avatar-section :deep(.avatar-container) {
  border-color: var(--avatar-border-color);
  width: 80px;
  height: 80px;
}

.avatar-section :deep(.avatar-container:hover) {
  border-color: rgba(255, 255, 255, 0.6);
  transform: scale(1.05);
}

.avatar-section :deep(.avatar-overlay) {
  background: rgba(0, 0, 0, 0.7);
}

.avatar-section :deep(.upload-text) {
  font-size: 11px;
}

.user-info h2 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
}

.user-meta {
  margin: 0;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.6;
}

.quick-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .personal-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .user-profile {
    flex-direction: column;
    text-align: center;
  }

  .quick-stats {
    gap: 24px;
  }
}
</style>

