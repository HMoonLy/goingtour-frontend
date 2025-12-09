<template>
  <div class="preference-section photo-section">
    <div class="section-header">
      <div class="section-icon">
        <el-icon><Camera /></el-icon>
      </div>
      <div class="section-info">
        <h3 class="section-title">📸 这次旅行对拍照的重视程度</h3>
        <p class="section-desc">
          帮助我们安排合适的拍照时间和推荐上镜景点
          <span v-if="recommendedValue" class="smart-tip">
            <el-icon><MagicStick /></el-icon>
            基于您的兴趣，推荐：{{ getDisplayName(recommendedValue) }}
          </span>
        </p>
      </div>
    </div>

    <div class="photo-content">
      <div class="photo-levels">
        <div
          v-for="photo in options"
          :key="photo.value"
          class="photo-level"
          :class="{
            selected: modelValue === photo.value,
            recommended: recommendedValue === photo.value,
          }"
          @click="$emit('update:modelValue', photo.value)"
        >
          <div class="photo-header">
            <span class="photo-icon">{{ photo.icon }}</span>
            <span class="photo-name">{{ photo.name }}</span>
          </div>
          <p class="photo-desc">{{ photo.description }}</p>
          <div class="photo-strategy">
            <span>{{ photo.aiStrategy }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Camera, MagicStick } from "@element-plus/icons-vue";

export default {
  name: "PreferencePhoto",
  components: {
    Camera,
    MagicStick,
  },
  props: {
    modelValue: {
      type: String,
      default: "casual",
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
    const getDisplayName = (photo) => {
      const option = props.options.find((opt) => opt.value === photo);
      return option ? option.name : photo;
    };
    return { getDisplayName };
  },
};
</script>

<style scoped>
.preference-section {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8eaed;
  transition: all 0.3s ease;
}

.preference-section:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
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

/* 拍照需求 */
.photo-levels {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.photo-level {
  padding: 24px;
  border: 2px solid #e4e7ed;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.photo-level:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.photo-level.selected {
  border-color: #91a8d0;
  background: linear-gradient(
    135deg,
    rgba(145, 168, 208, 0.1) 0%,
    #ffffff 100%
  );
}

.photo-level.recommended {
  border-color: #f7cac9;
  background: linear-gradient(
    135deg,
    rgba(247, 202, 201, 0.1) 0%,
    #ffffff 100%
  );
}

.photo-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.photo-icon {
  font-size: 24px;
}

.photo-name {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.photo-desc {
  margin: 0 0 12px;
  font-size: 14px;
  color: #606266;
}

.photo-strategy {
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

  .photo-levels {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>

