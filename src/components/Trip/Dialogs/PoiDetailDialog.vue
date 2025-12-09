<!--
POI详情对话框组件
展示高德API获取的完整地点信息
-->

<template>
  <el-dialog
    v-model="visible"
    :title="''"
    width="80%"
    :max-width="800"
    center
    :show-close="false"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :append-to-body="true"
    :lock-scroll="true"
    class="poi-detail-dialog"
  >
    <div v-if="poi && poi.name" class="poi-detail-content">
      <!-- 头部信息 -->
      <PoiHeader :poi="poi" @close="visible = false" />

      <!-- 图片展示 -->
      <PoiImages :poi="poi" />

      <!-- 详细信息 -->
      <div class="poi-details">
        <PoiInfoGrid :poi="poi" />
        <PoiContent :poi="poi" />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button v-if="!isSelected" type="primary" @click="handleSelect">
          <el-icon><Plus /></el-icon>
          选择此地点
        </el-button>
        <el-button v-else type="success" @click="handleUnselect">
          <el-icon><Check /></el-icon>
          已选择
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { Plus, Check } from '@element-plus/icons-vue'

// 子组件
import PoiHeader from './PoiDetail/PoiHeader.vue'
import PoiImages from './PoiDetail/PoiImages.vue'
import PoiInfoGrid from './PoiDetail/PoiInfoGrid.vue'
import PoiContent from './PoiDetail/PoiContent.vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  poi: {
    type: Object,
    default: () => ({})
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'select', 'unselect'])

// Computed
const visible = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

// Methods
const handleSelect = () => {
  emit('select', props.poi)
}

const handleUnselect = () => {
  emit('unselect', props.poi)
}
</script>

<style scoped>
.poi-detail-dialog {
  --el-dialog-border-radius: 20px;
  --el-dialog-box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* 确保图片预览组件的层级高于对话框 */
.poi-detail-dialog :deep(.el-image-viewer__wrapper) {
  z-index: 3000 !important;
}

.poi-detail-dialog :deep(.el-image-viewer__mask) {
  z-index: 3000 !important;
}

.poi-detail-dialog :deep(.el-dialog) {
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.poi-detail-dialog :deep(.el-dialog__header) {
  padding: 24px 32px 16px;
  border-bottom: 1px solid #f0f2f5;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px 20px 0 0;
}

.poi-detail-dialog :deep(.el-dialog__title) {
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.poi-detail-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
  font-size: 18px;
}

.poi-detail-dialog :deep(.el-dialog__body) {
  padding: 32px;
}

.poi-detail-content {
  padding: 0;
}

.poi-details {
  margin-bottom: 24px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #f0f2f5;
  margin-top: 32px;
}

.dialog-footer .el-button {
  border-radius: 24px;
  padding: 12px 24px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.dialog-footer .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .poi-detail-dialog :deep(.el-dialog__body) {
    padding: 20px;
  }
  
  .dialog-footer {
    flex-direction: column;
    gap: 8px;
  }
  
  .dialog-footer .el-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
