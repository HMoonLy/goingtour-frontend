<template>
  <div>
    <!-- 保存草稿对话框 -->
    <el-dialog
      v-model="saveDialogVisible"
      title="保存草稿"
      width="400px"
      :before-close="handleCloseSaveDraftDialog"
    >
      <el-form label-width="80px">
        <el-form-item label="草稿名称">
          <el-input
            v-model="localDraftName"
            placeholder="请输入草稿名称"
            maxlength="50"
            show-word-limit
            @keyup.enter="handleSaveDraft"
          />
        </el-form-item>
        <el-form-item label="当前进度">
          <el-tag type="info" size="small">
            第{{ currentStep + 1 }}步：{{ stepName }}
          </el-tag>
        </el-form-item>
        <el-form-item label="目的地">
          <span class="draft-destination">{{ destinationName }}</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseSaveDraftDialog"> 取消 </el-button>
          <el-button type="primary" :loading="saving" @click="handleSaveDraft">
            <el-icon><Document /></el-icon>
            保存草稿
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 草稿列表对话框 -->
    <el-dialog
      v-model="listDialogVisible"
      title="我的草稿"
      width="700px"
      :before-close="handleCloseDraftList"
    >
      <div class="draft-list-container">
        <div v-if="drafts.length === 0" class="empty-drafts">
          <el-empty description="暂无保存的草稿" image-size="120">
            <el-button type="primary" @click="handleCloseDraftList">
              开始创建行程
            </el-button>
          </el-empty>
        </div>

        <div v-else class="draft-grid">
          <div
            v-for="draft in drafts"
            :key="draft.id"
            class="draft-item"
            :class="{ 'draft-item-loading': loadingDraftId === draft.id }"
          >
            <div class="draft-content">
              <div class="draft-header">
                <h4 class="draft-title">
                  {{ draft.name }}
                </h4>
                <el-dropdown trigger="click" @command="handleDraftAction">
                  <el-button link size="small" class="draft-menu-btn">
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="{ action: 'load', id: draft.id }">
                        <el-icon><Folder /></el-icon>
                        加载草稿
                      </el-dropdown-item>
                      <el-dropdown-item :command="{ action: 'rename', id: draft.id }">
                        <el-icon><Edit /></el-icon>
                        重命名
                      </el-dropdown-item>
                      <el-dropdown-item :command="{ action: 'copy', id: draft.id }">
                        <el-icon><CopyDocument /></el-icon>
                        复制
                      </el-dropdown-item>
                      <el-dropdown-item
                        :command="{ action: 'delete', id: draft.id }"
                        divided
                      >
                        <el-icon><Delete /></el-icon>
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>

              <div class="draft-info">
                <div class="draft-destination">
                  <el-icon><Location /></el-icon>
                  {{ draft.baseForm?.destinationName || "未知目的地" }}
                </div>
                <div class="draft-step">
                  <el-icon><List /></el-icon>
                  {{ getStepName(draft.currentStep) }}
                </div>
                <div class="draft-time">
                  <el-icon><Clock /></el-icon>
                  {{ getDraftTimeAgo(draft.updatedAt) }}
                </div>
              </div>

              <div class="draft-actions">
                <el-button
                  type="primary"
                  size="small"
                  :loading="loadingDraftId === draft.id"
                  @click="emitLoadDraft(draft.id)"
                >
                  <el-icon><Folder /></el-icon>
                  加载草稿
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 草稿统计信息 -->
        <div v-if="drafts.length > 0" class="draft-stats">
          <el-divider />
          <div class="stats-row">
            <span>共 {{ drafts.length }} 个草稿</span>
            <el-button type="danger" size="small" plain @click="emitClearAllDrafts">
              <el-icon><Delete /></el-icon>
              清空所有草稿
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 重命名草稿对话框 -->
    <el-dialog v-model="renameDialogVisible" title="重命名草稿" width="400px">
      <el-form label-width="80px">
        <el-form-item label="草稿名称">
          <el-input
            v-model="localNewDraftName"
            placeholder="请输入新的草稿名称"
            maxlength="50"
            show-word-limit
            @keyup.enter="handleConfirmRename"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="renameDialogVisible = false"> 取消 </el-button>
          <el-button type="primary" :loading="renaming" @click="handleConfirmRename">
            确认重命名
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, watch, computed } from "vue";
import {
  Document,
  Folder,
  MoreFilled,
  Edit,
  CopyDocument,
  Delete,
  Location,
  List,
  Clock,
} from "@element-plus/icons-vue";

export default {
  name: "TripDraftDialogs",
  components: {
    Document,
    Folder,
    MoreFilled,
    Edit,
    CopyDocument,
    Delete,
    Location,
    List,
    Clock,
  },
  props: {
    // Visibility states (v-model)
    showSaveDialog: Boolean,
    showListDialog: Boolean,
    
    // Data
    currentStep: {
      type: Number,
      default: 0
    },
    destinationName: {
      type: String,
      default: ''
    },
    drafts: {
      type: Array,
      default: () => []
    },
    loadingDraftId: String,
    saving: Boolean,
    
    // For rename (handled internally or passed?)
    // Let's handle rename logic mainly here but emit events for API calls if needed
    // Actually the parent handles API calls in the original code. 
    // To keep it simple, we will emit events for actions.
  },
  emits: [
    "update:showSaveDialog",
    "update:showListDialog",
    "save-draft", // returns name
    "load-draft", // returns id
    "delete-draft", // returns id
    "copy-draft", // returns id
    "clear-all-drafts",
    "rename-draft", // returns { id, name }
    "refresh-drafts" // request to reload drafts
  ],
  setup(props, { emit }) {
    // --- Save Draft State ---
    const localDraftName = ref("");
    
    const saveDialogVisible = computed({
      get: () => props.showSaveDialog,
      set: (val) => emit("update:showSaveDialog", val)
    });

    const handleCloseSaveDraftDialog = () => {
      localDraftName.value = "";
      saveDialogVisible.value = false;
    };

    const handleSaveDraft = () => {
      emit("save-draft", localDraftName.value);
      // Close handled by parent on success or manually
    };

    // --- List Draft State ---
    const listDialogVisible = computed({
      get: () => props.showListDialog,
      set: (val) => emit("update:showListDialog", val)
    });

    const handleCloseDraftList = () => {
      listDialogVisible.value = false;
    };

    // --- Rename Draft State ---
    const renameDialogVisible = ref(false);
    const localNewDraftName = ref("");
    const currentRenamingDraftId = ref("");
    const renaming = ref(false); // Local loading state for rename

    // --- Helpers ---
    const getStepName = (step) => {
      const stepNames = ["基础信息", "个性化偏好", "推荐选择", "智能生成", "行程预览"];
      return stepNames[step] || "未知步骤";
    };
    
    const stepName = computed(() => getStepName(props.currentStep));

    const getDraftTimeAgo = (timestamp) => {
      const now = Date.now();
      const time = new Date(timestamp).getTime();
      const diff = now - time;

      if (diff < 60000) return "刚刚";
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
      return `${Math.floor(diff / 86400000)}天前`;
    };

    // --- Actions ---
    const emitLoadDraft = (id) => {
      emit("load-draft", id);
    };

    const emitClearAllDrafts = () => {
      emit("clear-all-drafts");
    };

    const handleDraftAction = (command) => {
      const { action, id } = command;
      switch (action) {
        case "load":
          emitLoadDraft(id);
          break;
        case "rename":
          openRenameDialog(id);
          break;
        case "copy":
          emit("copy-draft", id);
          break;
        case "delete":
          emit("delete-draft", id);
          break;
      }
    };

    const openRenameDialog = (id) => {
      const draft = props.drafts.find(d => d.id === id);
      if (draft) {
        currentRenamingDraftId.value = id;
        localNewDraftName.value = draft.name;
        renameDialogVisible.value = true;
      }
    };

    const handleConfirmRename = () => {
      if (!localNewDraftName.value.trim()) return;
      
      renaming.value = true;
      emit("rename-draft", { 
        id: currentRenamingDraftId.value, 
        name: localNewDraftName.value.trim(),
        callback: (success) => {
             renaming.value = false;
             if(success) renameDialogVisible.value = false;
        }
      });
    };

    return {
      saveDialogVisible,
      localDraftName,
      handleCloseSaveDraftDialog,
      handleSaveDraft,
      stepName,
      
      listDialogVisible,
      handleCloseDraftList,
      
      renameDialogVisible,
      localNewDraftName,
      renaming,
      handleConfirmRename,
      
      getStepName,
      getDraftTimeAgo,
      emitLoadDraft,
      emitClearAllDrafts,
      handleDraftAction
    };
  }
};
</script>

<style scoped>
/* Draft Styles */
.draft-destination {
  color: #606266;
  font-weight: 500;
}

.draft-list-container {
  max-height: 60vh;
  overflow-y: auto;
}

.empty-drafts {
  padding: 40px;
  text-align: center;
}

.draft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.draft-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: #fff;
}

.draft-item:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.draft-item-loading {
  opacity: 0.7;
  pointer-events: none;
}

.draft-content {
  padding: 16px;
}

.draft-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.draft-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  word-break: break-word;
  flex: 1;
  margin-right: 8px;
}

.draft-menu-btn {
  color: #909399;
  padding: 4px;
  min-height: auto;
}

.draft-menu-btn:hover {
  color: #91a8d0;
}

.draft-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.draft-destination,
.draft-step,
.draft-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.draft-destination .el-icon,
.draft-step .el-icon,
.draft-time .el-icon {
  color: #909399;
  font-size: 16px;
}

.draft-actions {
  display: flex;
  justify-content: flex-end;
}

.draft-stats {
  margin-top: 20px;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #606266;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .draft-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .draft-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .draft-header {
    align-items: center;
  }

  .stats-row {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
}
</style>

