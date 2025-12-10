<template>
  <el-card class="section" shadow="never">
    <template #header>
      <div class="section-header">
        <el-icon><Coffee /></el-icon>
        <div>
          <div class="section-title">饮食限制</div>
          <div class="section-desc">确保推荐的餐厅符合您的饮食要求</div>
        </div>
      </div>
    </template>

    <div class="form-item">
      <div class="item-label">选择您的饮食禁忌或偏好</div>
      <div class="item-help">
        <el-icon><Warning /></el-icon>
        <span>我们会严格过滤不符合您要求的餐厅，确保饮食安全</span>
      </div>

      <div class="dietary-grid">
        <div
          v-for="restriction in dietaryRestrictionOptions"
          :key="restriction.value"
          class="dietary-item"
          :class="{
            selected: modelValue.includes(
              restriction.value
            ),
          }"
          @click="toggleDietaryRestriction(restriction.value)"
        >
          <span class="dietary-icon">{{ restriction.icon }}</span>
          <div class="dietary-info">
            <span class="dietary-name">{{ restriction.name }}</span>
            <span class="dietary-note">{{ restriction.note }}</span>
          </div>
          <el-icon
            v-if="modelValue.includes(restriction.value)"
            class="check-icon"
          >
            <Check />
          </el-icon>
        </div>
      </div>

      <div
        v-if="modelValue.length === 0"
        class="no-restriction-tip"
      >
        <el-icon><InfoFilled /></el-icon>
        <span>如无特殊饮食要求，可跳过此项</span>
      </div>
    </div>
  </el-card>
</template>

<script>
import { computed } from "vue";
import { Coffee, Warning, InfoFilled, Check } from "@element-plus/icons-vue";
import { PERSONAL_PROFILE_OPTIONS } from "@/utils/data/travelDataSystem.js";

export default {
  name: "DietarySection",
  components: { Coffee, Warning, InfoFilled, Check },
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    // 获取饮食限制注释
    const getDietaryNote = (restrictionType) => {
      const notes = {
        vegetarian: "不食用肉类",
        vegan: "不食用任何动物制品",
        halal: "符合伊斯兰教规",
        no_spicy: "避免辛辣食物",
        lactose_free: "避免乳制品",
        gluten_free: "避免含麸质食物",
        no_beef: "🚫",
        no_pork: "🚫",
        no_seafood: "🚫",
        dairy_free: "🚫",
      };
      return notes[restrictionType] || "";
    };

    const dietaryRestrictionOptions = computed(() => {
      const baseOptions = Object.entries(
        PERSONAL_PROFILE_OPTIONS.dietaryRestrictions.options
      ).map(([key, value]) => ({
        value: key,
        ...value,
      }));

      // 扩展饮食限制选项，添加注释说明
      return baseOptions.map((option) => ({
        ...option,
        note: getDietaryNote(option.value),
      }));
    });

    const toggleDietaryRestriction = (restriction) => {
      const newValue = [...props.modelValue];
      const index = newValue.indexOf(restriction);
      if (index > -1) {
        newValue.splice(index, 1);
      } else {
        newValue.push(restriction);
      }
      emit("update:modelValue", newValue);
    };

    return {
      dietaryRestrictionOptions,
      toggleDietaryRestriction,
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

.item-help {
  color: #909399;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.item-help .el-icon {
  color: #e6a23c;
  margin-top: 2px;
  flex-shrink: 0;
}

.dietary-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  width: 100%;
}

.dietary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  box-sizing: border-box;
  flex: 0 0 calc((100% - 24px) / 3);
  min-width: 0;
  max-width: calc((100% - 24px) / 3);
}

.dietary-item:hover {
  border-color: #91a8d0;
  background: #f5f7fa;
}

.dietary-item.selected {
  border-color: #91a8d0;
  background: rgba(145, 168, 208, 0.1);
}

.dietary-icon {
  font-size: 20px;
  width: 24px;
  min-width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.dietary-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.dietary-name {
  display: block;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dietary-note {
  color: #909399;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.check-icon {
  color: #67c23a;
  font-size: 16px;
}

.no-restriction-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f0f9ff;
  border-radius: 8px;
  color: #1976d2;
  font-size: 14px;
}

@media (max-width: 768px) {
  .dietary-grid {
    flex-direction: column;
  }
  
  .dietary-item {
    flex: none;
    width: 100%;
    min-width: auto;
    margin: 0 0 16px 0;
    max-width: 100%;
  }
}
</style>

