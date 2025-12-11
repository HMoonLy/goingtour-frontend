<template>
  <el-card class="section" shadow="never">
    <template #header>
      <div class="section-header">
        <el-icon><User /></el-icon>
        <div>
          <div class="section-title">性格特征</div>
          <div class="section-desc">帮助AI理解您的旅行风格和节奏偏好</div>
        </div>
      </div>
    </template>

    <div class="form-item">
      <div class="item-label">
        <span>MBTI人格类型</span>
        <span class="optional-tag">可选</span>
      </div>
      <div class="item-help">
        选择您的MBTI类型，我们会据此推荐符合您性格的旅行方式
      </div>

      <el-select
        :model-value="modelValue"
        placeholder="选择您的MBTI类型"
        size="large"
        clearable
        style="width: 100%"
        @update:model-value="$emit('update:modelValue', $event)"
        @change="onMbtiChange"
      >
        <el-option-group
          v-for="group in mbtiGroups"
          :key="group.label"
          :label="group.label"
        >
          <el-option
            v-for="option in group.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-option-group>
      </el-select>

      <!-- MBTI影响预览 -->
      <div v-if="modelValue" class="mbti-preview">
        <div class="mbti-content">
          <div class="mbti-image-section">
            <img
              :src="`/images/mbti/${modelValue}.png`"
              :alt="getMbtiDisplayName(modelValue)"
              class="mbti-character-image"
              @error="handleImageError"
            />
          </div>
          <div class="mbti-info-section">
            <div class="preview-header">
              <el-icon><InfoFilled /></el-icon>
              <span
                >基于您的
                {{ getMbtiDisplayName(modelValue) }} 特质</span
              >
            </div>
            <p class="preview-desc">
              {{ getMbtiTravelStyle(modelValue) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { User, InfoFilled } from "@element-plus/icons-vue";
import { PERSONAL_PROFILE_OPTIONS } from "@/utils/data/travelDataSystem.js";

export default {
  name: "MbtiSection",
  components: { User, InfoFilled },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    // MBTI分组选项 - 从系统数据生成
    const mbtiGroups = (() => {
      const mbtiOptions = PERSONAL_PROFILE_OPTIONS.mbtiTypes.options;
      return [
        {
          label: "分析家 (NT)",
          options: [
            { label: `INTJ - ${mbtiOptions.INTJ.name}`, value: "INTJ" },
            { label: `INTP - ${mbtiOptions.INTP.name}`, value: "INTP" },
            { label: `ENTJ - ${mbtiOptions.ENTJ.name}`, value: "ENTJ" },
            { label: `ENTP - ${mbtiOptions.ENTP.name}`, value: "ENTP" },
          ],
        },
        {
          label: "外交家 (NF)",
          options: [
            { label: `INFJ - ${mbtiOptions.INFJ.name}`, value: "INFJ" },
            { label: `INFP - ${mbtiOptions.INFP.name}`, value: "INFP" },
            { label: `ENFJ - ${mbtiOptions.ENFJ.name}`, value: "ENFJ" },
            { label: `ENFP - ${mbtiOptions.ENFP.name}`, value: "ENFP" },
          ],
        },
        {
          label: "守护者 (SJ)",
          options: [
            { label: `ISTJ - ${mbtiOptions.ISTJ.name}`, value: "ISTJ" },
            { label: `ISFJ - ${mbtiOptions.ISFJ.name}`, value: "ISFJ" },
            { label: `ESTJ - ${mbtiOptions.ESTJ.name}`, value: "ESTJ" },
            { label: `ESFJ - ${mbtiOptions.ESFJ.name}`, value: "ESFJ" },
          ],
        },
        {
          label: "探索者 (SP)",
          options: [
            { label: `ISTP - ${mbtiOptions.ISTP.name}`, value: "ISTP" },
            { label: `ISFP - ${mbtiOptions.ISFP.name}`, value: "ISFP" },
            { label: `ESTP - ${mbtiOptions.ESTP.name}`, value: "ESTP" },
            { label: `ESFP - ${mbtiOptions.ESFP.name}`, value: "ESFP" },
          ],
        },
      ];
    })();

    const onMbtiChange = (value) => {
      // console.log("MBTI类型变更:", value);
      emit("update:modelValue", value);
    };

    const getMbtiDisplayName = (type) => {
      if (!type) return "";
      const mbtiOptions = PERSONAL_PROFILE_OPTIONS.mbtiTypes.options;
      const option = mbtiOptions[type];
      return option ? `${type} - ${option.name}` : type;
    };

    const getMbtiTravelStyle = (type) => {
      if (!type) return "";
      const mbtiOptions = PERSONAL_PROFILE_OPTIONS.mbtiTypes.options;
      const option = mbtiOptions[type];
      return option ? option.travelStyle : "";
    };

    const handleImageError = (event) => {
      console.warn("MBTI图片加载失败:", event.target.src);
      event.target.style.display = "none";
      const imageSection = event.target.parentElement;
      if (
        imageSection &&
        imageSection.classList.contains("mbti-image-section")
      ) {
        imageSection.style.display = "flex";
        imageSection.style.alignItems = "center";
        imageSection.style.justifyContent = "center";
        imageSection.style.fontSize = "24px";
        imageSection.style.color = "#1976d2";
        imageSection.innerHTML = "🧠";
      }
    };

    return {
      mbtiGroups,
      onMbtiChange,
      getMbtiDisplayName,
      getMbtiTravelStyle,
      handleImageError,
    };
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
}

.form-item {
  padding: 20px;
}

.item-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #303133;
}

.optional-tag {
  background: #e1f3d8;
  color: #67c23a;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.item-help {
  color: #909399;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
}

.mbti-preview {
  margin-top: 20px;
  padding: 20px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.mbti-content {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.mbti-image-section {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background-color: transparent;
  border: none;
}


.mbti-character-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  mix-blend-mode: multiply; 
}


.mbti-info-section {
  flex: 1;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-weight: 500;
  margin-bottom: 12px;
  font-size: 14px;
}

.preview-desc {
  margin: 0;
  color: #666;
  font-size: 13px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .mbti-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .mbti-image-section {
    margin: 0 auto;
    width: 60px;
    height: 60px;
  }
  
  .mbti-info-section {
    text-align: center;
  }
  
  .preview-header {
    justify-content: center;
    font-size: 12px;
  }
  
  .preview-desc {
    font-size: 12px;
  }
}
</style>

