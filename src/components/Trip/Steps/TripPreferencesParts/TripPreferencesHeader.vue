<template>
  <div class="page-header">
    <div class="header-content">
      <div class="header-icon">
        <el-icon><Suitcase /></el-icon>
      </div>
      <div class="header-text">
        <h1 class="page-title">✈️本次行程偏好设置</h1>
        <p class="page-subtitle">
          为这次旅行量身定制，随时可以调整的偏好设置
        </p>
        
        <!-- 填写提示 -->
        <div class="fill-hint">
          💡 <strong>提示</strong>：为了获得更精准的AI推荐，建议您完整填写所有偏好设置，特别是"旅行目的"选项。
        </div>
      </div>
    </div>

    <!-- 个人档案智能提示 -->
    <div v-if="hasPersonalProfile" class="smart-prefill-notice">
      <div class="notice-icon">
        <el-icon><MagicStick /></el-icon>
      </div>
      <div class="notice-content">
        <h4>🎯智能预填已启用</h4>
        <p>
          根据您的个人旅行档案，我们已为您预选了合适的选项。您可以根据这次旅行的具体情况随时调整。
        </p>
        <div class="profile-summary">
          <span v-if="personalProfile.mbtiType"
            >性格：{{ getMbtiDisplayName(personalProfile.mbtiType) }}</span
          >
          <span v-if="personalProfile.coreInterests?.length"
            >兴趣：{{ personalProfile.coreInterests.length }}项</span
          >
          <span v-if="personalProfile.budgetLevel"
            >预算：{{
              getBudgetDisplayName(personalProfile.budgetLevel)
            }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Suitcase, MagicStick } from "@element-plus/icons-vue";
import { PERSONAL_PROFILE_OPTIONS } from "@/utils/data/travelDataSystem.js";

export default {
  name: "TripPreferencesHeader",
  components: {
    Suitcase,
    MagicStick,
  },
  props: {
    personalProfile: {
      type: Object,
      default: () => ({}),
    },
    hasPersonalProfile: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const getMbtiDisplayName = (type) => {
      return type; // 简化显示
    };

    const getBudgetDisplayName = (level) => {
      const option = PERSONAL_PROFILE_OPTIONS.budgetLevel?.options[level];
      return option ? option.name : level;
    };

    return {
      getMbtiDisplayName,
      getBudgetDisplayName,
    };
  },
};
</script>

<style scoped>
/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 32px;
  color: white;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="a" cx="50" cy="50" r="50"><stop offset="0" stop-color="white" stop-opacity="0.1"/><stop offset="1" stop-color="white" stop-opacity="0.05"/></radialGradient></defs><rect width="100" height="20" fill="url(%23a)"/></svg>');
  opacity: 0.3;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
}

.header-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  backdrop-filter: blur(10px);
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
}

.smart-prefill-notice {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.notice-icon {
  font-size: 32px;
  color: #f7cac9;
  flex-shrink: 0;
}

.notice-content h4 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
}

.notice-content p {
  margin: 0 0 12px;
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.4;
}

.profile-summary {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.profile-summary span {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 填写提示样式 */
.fill-hint {
  background: rgba(255, 255, 255, 0.15);
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  margin-top: 16px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.fill-hint strong {
  color: #f7cac9;
}

@media (max-width: 768px) {
  .page-header {
    padding: 32px 24px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .page-title {
    font-size: 28px;
  }

  .smart-prefill-notice {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .profile-summary {
    justify-content: center;
  }
}
</style>

