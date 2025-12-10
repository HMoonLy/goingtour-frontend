<template>
  <div class="page-header">
    <div class="header-left">
      <el-button link class="back-btn" @click="$emit('back')">
        <el-icon><ArrowLeft /></el-icon>
        返回个人中心
      </el-button>
    </div>
    <div class="header-right">
      <el-button
        v-if="!isReadOnly"
        :loading="saving"
        type="primary"
        @click="$emit('save')"
      >
        <el-icon><Edit /></el-icon>
        保存修改
      </el-button>
      <!-- 导出按钮 -->
      <el-dropdown @command="(cmd) => $emit('export', cmd)" trigger="click">
        <el-button>
          <el-icon><Download /></el-icon>
          导出行程
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="word">
              <el-icon><Edit /></el-icon>
              导出Word文档
            </el-dropdown-item>
            <el-dropdown-item command="image">
              <el-icon><Picture /></el-icon>
              导出图片
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-button
        :type="isReadOnly ? 'primary' : 'default'"
        @click="$emit('toggleReadOnly')"
      >
        <el-icon><View v-if="isReadOnly" /><Edit v-else /></el-icon>
        {{ isReadOnly ? "编辑模式" : "预览模式" }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowLeft,
  Edit,
  View,
  Download,
  ArrowDown,
  Picture,
} from "@element-plus/icons-vue";

defineProps({
  isReadOnly: {
    type: Boolean,
    default: true,
  },
  saving: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["back", "save", "export", "toggleReadOnly"]);
</script>

<style scoped>
.page-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin: 0 auto 24px auto !important;
  padding: 0 4px !important;
  width: 100% !important;
  max-width: 1200px !important;
}

.page-header .header-right .el-dropdown {
  margin-right: 10px;
  margin-left: 10px;
}
.back-btn {
  font-size: 14px;
  color: #606266;
}

.back-btn:hover {
  color: #91a8d0;
}

@media (max-width: 768px) {
  .page-header {
    margin: 0 auto 16px auto !important;
    flex-direction: column !important;
    gap: 12px !important;
    align-items: stretch !important;
  }
}
</style>

