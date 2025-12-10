<template>
  <div class="page-header">
    <div class="header-left">
      <el-button link class="back-btn" @click="$emit('back')">
        <el-icon><ArrowLeft /></el-icon>
        返回列表
      </el-button>
    </div>
    <div class="header-right">
      <el-button v-if="!isEditing" type="primary" class="edit-btn" @click="$emit('toggle-edit')">
        <el-icon><Edit /></el-icon>
        编辑行程
      </el-button>
      <template v-else>
        <el-button @click="$emit('cancel-edit')"> 取消 </el-button>
        <el-button type="primary" @click="$emit('save-changes')"> 保存修改 </el-button>
      </template>
    </div>
  </div>
</template>

<script>
import { ArrowLeft, Edit } from "@element-plus/icons-vue";

export default {
  name: "TripDetailHeader",
  components: {
    ArrowLeft,
    Edit,
  },
  props: {
    isEditing: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["back", "toggle-edit", "cancel-edit", "save-changes"],
};
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.back-btn {
  font-size: 14px;
  color: #606266;
}

.back-btn:hover {
  color: #91a8d0;
}

.header-right {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .page-header {
    padding: 12px 16px;
    margin-bottom: 16px;
  }
}

@media (max-width: 480px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .header-right {
    justify-content: center;
  }
}

@media (max-width: 360px) {
  .page-header {
    padding: 8px 12px;
  }
}
</style>

