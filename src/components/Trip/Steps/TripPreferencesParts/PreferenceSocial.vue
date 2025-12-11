<template>
  <el-card class="section" shadow="never">
    <template #header>
      <div class="section-header">
        <el-icon><UserFilled /></el-icon>
        <div>
          <div class="section-title">这次偏好什么样的氛围？</div>
          <div class="section-desc">
            选择您希望的旅行氛围和环境类型
            <span v-if="recommendedValue" class="smart-tip">
              <el-icon><MagicStick /></el-icon>
              基于您的性格推荐：{{ getDisplayName(recommendedValue) }}
            </span>
          </div>
        </div>
      </div>
    </template>

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

           <!-- 推荐标记 (选中时隐藏) -->
           <div
            v-if="recommendedValue === social.value && modelValue !== social.value"
            class="recommended-badge"
          >
            <el-icon><Star /></el-icon>
            <span>推荐</span>
          </div>

          <el-icon
            v-if="modelValue === social.value"
            class="check-icon"
          >
            <Check />
          </el-icon>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { UserFilled, MagicStick, Check, Star } from "@element-plus/icons-vue";

export default {
  name: "PreferenceSocial",
  components: {
    UserFilled,
    MagicStick,
    Check,
    Star
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
.section {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.section :deep(.el-card__header) {
  background: linear-gradient(
    90deg,
    rgba(145, 168, 208, 0.12),
    rgba(247, 202, 201, 0.06)
  );
  padding: 20px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.section-header .el-icon {
  font-size: 20px;
  color: #91a8d0;
  margin-top: 2px;
}

.section-title {
  font-weight: 600;
  color: #303133;
  font-size: 18px;
  margin-bottom: 4px;
}

.section-desc {
  color: #909399;
  font-size: 14px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.smart-tip {
  background: rgba(145, 168, 208, 0.1);
  color: #91a8d0;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.social-content {
  padding: 20px;
}

.social-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.social-option {
  position: relative;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.social-option:hover {
  border-color: #91a8d0;
  background: #f5f7fa;
}

.social-option.selected {
  border-color: #91a8d0;
  background: rgba(145, 168, 208, 0.1);
}

.social-option.recommended {
  border-color: #f7cac9;
}

.social-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.social-icon {
  font-size: 20px;
}

.social-name {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.social-desc {
  margin: 0 0 8px;
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
}

.social-strategy {
  font-size: 12px;
  color: #909399;
  font-style: italic;
}

.recommended-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #f7cac9;
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 2px;
}

.check-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #67c23a;
  font-size: 18px;
}

@media (max-width: 768px) {
  .social-options {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
