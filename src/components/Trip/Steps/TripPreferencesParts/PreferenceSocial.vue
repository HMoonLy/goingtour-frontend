<template>
  <div class="preference-section social-section">
    <div class="section-header">
      <div class="section-icon">
        <el-icon><UserFilled /></el-icon>
      </div>
      <div class="section-info">
        <h3 class="section-title">🎭 这次偏好什么样的氛围？</h3>
        <p class="section-desc">
          选择您希望的旅行氛围和环境类型
          <span v-if="recommendedValue" class="smart-tip">
            <el-icon><MagicStick /></el-icon>
            基于您的性格，推荐：{{ getDisplayName(recommendedValue) }}
          </span>
        </p>
      </div>
    </div>

    <div class="social-content">
      <div class="social-options">
        <div
          v-for="social in options"
          :key="social.value"
          class="social-option"
          :class="{
            selected: modelValue === social.value,
            recommended: recommendedValue === social.value,
          }"
          @click="$emit('update:modelValue', social.value)"
        >
          <div class="social-header">
            <span class="social-icon">{{ social.icon }}</span>
            <span class="social-name">{{ social.name }}</span>
          </div>
          <p class="social-desc">{{ social.description }}</p>
          <div class="social-strategy">
            <span>{{ social.aiStrategy }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { UserFilled, MagicStick } from "@element-plus/icons-vue";

export default {
  name: "PreferenceSocial",
  components: {
    UserFilled,
    MagicStick,
  },
  props: {
    modelValue: {
      type: String,
      default: "mixed",
    },
    options: {
      type: Array,
      default: () => [],
    },
    recommendedValue: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
  setup(props) {
    const getDisplayName = (social) => {
      const option = props.options.find((opt) => opt.value === social);
      return option ? option.name : social;
    };
    return { getDisplayName };
  },
};
</script>

<style scoped>
.preference-section {
  background: white;
  padding: 0;
  box-shadow: none;
  border: none;
}



.section-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 32px;
}

.section-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.2);
  flex-shrink: 0;
}

.section-info {
  flex: 1;
}

.section-title {
  margin: 0 0 8px;
  font-weight: 600;
  font-size: 24px;
  color: #303133;
}

.section-desc {
  margin: 0;
  font-size: 16px;
  color: #606266;
  line-height: 1.5;
}

.smart-tip {
  background: rgba(145, 168, 208, 0.1);
  color: #91a8d0;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* 社交选项 */
.social-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.social-option {
  padding: 24px;
  border: 2px solid #e4e7ed;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-option:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.social-option.selected {
  border-color: #91a8d0;
  background: linear-gradient(
    135deg,
    rgba(145, 168, 208, 0.1) 0%,
    #ffffff 100%
  );
}

.social-option.recommended {
  border-color: #f7cac9;
  background: linear-gradient(
    135deg,
    rgba(247, 202, 201, 0.1) 0%,
    #ffffff 100%
  );
}

.social-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.social-icon {
  font-size: 24px;
}

.social-name {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.social-desc {
  margin: 0 0 12px;
  font-size: 14px;
  color: #606266;
}

.social-strategy {
  font-size: 13px;
  color: #909399;
  font-style: italic;
}

@media (max-width: 768px) {
  .preference-section {
    padding: 24px 20px;
  }

  .section-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
  }

  .social-options {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>

