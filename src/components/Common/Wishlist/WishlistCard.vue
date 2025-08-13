<template>
  <div
    class="wishlist-card"
    :class="{ 'current-weather': isCurrentWeatherCity }"
  >
    <div class="card-header">
      <div class="city-info">
        <h4 class="city-name">
          {{ wishlistItem.cityName }}
        </h4>
        <div
          v-if="wishlistItem.tags && wishlistItem.tags.length > 0"
          class="city-tags"
        >
          <el-tag
            v-for="tag in wishlistItem.tags.slice(0, 2)"
            :key="tag"
            size="small"
            type="info"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
          <el-tag
            v-if="wishlistItem.tags.length > 2"
            size="small"
            type="info"
            effect="plain"
          >
            +{{ wishlistItem.tags.length - 2 }}
          </el-tag>
        </div>
      </div>

      <div class="card-actions">
        <el-dropdown placement="bottom-end" @command="handleCommand">
          <el-button link
size="small" class="more-btn">
            <el-icon><More /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="weather">
                <el-icon><Sunny /></el-icon>
                查看天气
              </el-dropdown-item>
              <el-dropdown-item command="edit">
                <el-icon><Edit /></el-icon>
                编辑
              </el-dropdown-item>
              <el-dropdown-item command="plan">
                <el-icon><MapLocation /></el-icon>
                规划行程
              </el-dropdown-item>
              <el-dropdown-item command="remove"
divided>
                <el-icon><Delete /></el-icon>
                移除
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="card-content">
      <div v-if="wishlistItem.reason" class="reason">
        <p class="reason-text">
          {{ wishlistItem.reason }}
        </p>
      </div>

      <div class="card-footer">
        <div class="added-date">
          <el-icon><Clock /></el-icon>
          <span>{{ formatDate(wishlistItem.createdAt) }}</span>
        </div>

        <div v-if="isCurrentWeatherCity" class="weather-indicator">
          <el-icon><View /></el-icon>
          <span>天气预览中</span>
        </div>
      </div>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑愿望清单" width="400px">
      <el-form ref="editFormRef" :model="editForm" label-position="top">
        <el-form-item label="想去的原因">
          <el-input
            v-model="editForm.reason"
            type="textarea"
            :rows="3"
            placeholder="写下你想去这里的原因..."
            maxlength="200"
            show-word-limit
            clearable
          />
        </el-form-item>

        <el-form-item label="标签">
          <el-tag
            v-for="tag in editForm.tags"
            :key="tag"
            closable
            style="margin-right: 8px; margin-bottom: 8px"
            @close="removeTag(tag)"
          >
            {{ tag }}
          </el-tag>

          <el-input
            v-if="inputVisible"
            ref="inputRef"
            v-model="inputValue"
            size="small"
            style="width: 100px"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button
            v-else
            size="small"
            :disabled="editForm.tags.length >= 10"
            @click="showInput"
          >
            <el-icon><Plus /></el-icon>
            添加标签
            <span
              v-if="editForm.tags.length >= 10"
              style="font-size: 12px; margin-left: 4px"
            >(已达上限)</span>
          </el-button>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false"> 取消 </el-button>
          <el-button
            type="primary"
            :loading="saving"
            :disabled="!hasChanges"
            @click="handleSave"
          >
            {{ hasChanges ? "保存" : "无变更" }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  More,
  Sunny,
  Edit,
  MapLocation,
  Delete,
  Clock,
  View,
  Plus,
} from "@element-plus/icons-vue";
import { useWishlistStore } from "@/store/wishlist.js";

export default {
  name: "WishlistCard",
  components: {
    More,
    Sunny,
    Edit,
    MapLocation,
    Delete,
    Clock,
    View,
    Plus,
  },
  props: {
    wishlistItem: {
      type: Object,
      required: true,
    },
    isCurrentWeatherCity: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["remove", "edit", "view-weather", "plan-trip"],
  setup(props, { emit }) {
    const wishlistStore = useWishlistStore();

    // 编辑对话框
    const editDialogVisible = ref(false);
    const editForm = ref({
      reason: "",
      tags: [],
    });
    const saving = ref(false);

    // 原始数据，用于检测变更
    const originalData = ref({
      reason: "",
      tags: [],
    });

    // 标签输入
    const inputVisible = ref(false);
    const inputValue = ref("");
    const inputRef = ref();

    // 处理操作命令
    const handleCommand = async (command) => {
      switch (command) {
        case "weather":
          emit("view-weather", props.wishlistItem);
          break;
        case "edit":
          openEditDialog();
          break;
        case "plan":
          emit("plan-trip", props.wishlistItem);
          break;
        case "remove":
          await handleRemove();
          break;
      }
    };

    // 打开编辑对话框
    const openEditDialog = () => {
      const currentReason = props.wishlistItem.reason || "";
      const currentTags = [...(props.wishlistItem.tags || [])];

      editForm.value = {
        reason: currentReason,
        tags: currentTags,
      };

      // 保存原始数据用于变更检测
      originalData.value = {
        reason: currentReason,
        tags: [...currentTags],
      };

      editDialogVisible.value = true;
    };

    // 检测数据是否有变更
    const hasChanges = computed(() => {
      return (
        editForm.value.reason !== originalData.value.reason ||
        JSON.stringify(editForm.value.tags.sort()) !==
          JSON.stringify(originalData.value.tags.sort())
      );
    });

    // 表单验证
    const validateForm = () => {
      // 验证原因长度
      if (editForm.value.reason && editForm.value.reason.length > 200) {
        ElMessage.warning("想去的原因不能超过200个字符");
        return false;
      }

      // 验证标签数量和长度
      if (editForm.value.tags.length > 10) {
        ElMessage.warning("标签数量不能超过10个");
        return false;
      }

      for (const tag of editForm.value.tags) {
        if (tag.length > 20) {
          ElMessage.warning("单个标签长度不能超过20个字符");
          return false;
        }
      }

      return true;
    };

    // 保存编辑
    const handleSave = async () => {
      // 检查是否有变更
      if (!hasChanges.value) {
        ElMessage.info("没有检测到数据变更");
        return;
      }

      // 表单验证
      if (!validateForm()) {
        return;
      }

      saving.value = true;

      try {
        // 调用Store的updateWishlistItem方法
        const success = await wishlistStore.updateWishlistItem(
          props.wishlistItem.id,
          {
            reason: editForm.value.reason,
            tags: editForm.value.tags,
          },
        );

        if (success) {
          // 发送事件给父组件（如果需要的话）
          emit("edit", {
            id: props.wishlistItem.id,
            updateData: {
              reason: editForm.value.reason,
              tags: editForm.value.tags,
            },
          });

          editDialogVisible.value = false;
          // Store已经显示成功消息，不需要重复显示
        }
      } catch (error) {
        console.error("保存愿望清单编辑失败:", error);
        // Store已经显示错误消息，不需要重复显示
      } finally {
        saving.value = false;
      }
    };

    // 删除确认
    const handleRemove = async () => {
      try {
        await ElMessageBox.confirm(
          `确定要将 ${props.wishlistItem.cityName} 从愿望清单中移除吗？`,
          "确认删除",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          },
        );

        emit("remove", props.wishlistItem.id);
      } catch {
        // 用户取消
      }
    };

    // 标签操作
    const removeTag = (tag) => {
      editForm.value.tags = editForm.value.tags.filter((t) => t !== tag);
    };

    const showInput = () => {
      inputVisible.value = true;
      nextTick(() => {
        inputRef.value?.focus();
      });
    };

    const handleInputConfirm = () => {
      const trimmedValue = inputValue.value.trim();

      if (!trimmedValue) {
        inputVisible.value = false;
        inputValue.value = "";
        return;
      }

      // 检查重复标签
      if (editForm.value.tags.includes(trimmedValue)) {
        ElMessage.warning("标签已存在");
        inputValue.value = "";
        return;
      }

      // 检查标签长度
      if (trimmedValue.length > 20) {
        ElMessage.warning("标签长度不能超过20个字符");
        return;
      }

      // 检查标签数量
      if (editForm.value.tags.length >= 10) {
        ElMessage.warning("标签数量不能超过10个");
        return;
      }

      editForm.value.tags.push(trimmedValue);
      inputVisible.value = false;
      inputValue.value = "";
    };

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return "";

      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now - date;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "今天";
      if (diffDays === 1) return "昨天";
      if (diffDays < 7) return `${diffDays}天前`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;

      return date.toLocaleDateString("zh-CN", {
        month: "short",
        day: "numeric",
      });
    };

    return {
      editDialogVisible,
      editForm,
      saving,
      inputVisible,
      inputValue,
      inputRef,
      hasChanges,
      handleCommand,
      handleSave,
      removeTag,
      showInput,
      handleInputConfirm,
      formatDate,
    };
  },
};
</script>

<style scoped>
.wishlist-card {
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(145, 168, 208, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(145, 168, 208, 0.08);
}

.wishlist-card:hover {
  border-color: rgba(145, 168, 208, 0.3);
  box-shadow:
    0 8px 32px rgba(145, 168, 208, 0.12),
    0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-4px) scale(1.01);
}

.wishlist-card.current-weather {
  border-color: rgba(34, 197, 94, 0.4);
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #fafbfc 100%);
  box-shadow:
    0 4px 20px rgba(34, 197, 94, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.06);
}

.wishlist-card.current-weather::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
  border-radius: 16px 16px 0 0;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.city-info {
  flex: 1;
}

.city-name {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.3;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.city-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 美化标签样式 */
.city-tags .el-tag {
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #6b7280;
  font-weight: 500;
  font-size: 12px;
  padding: 4px 12px;
  height: auto;
  line-height: 1.2;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.city-tags .el-tag:hover {
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(145, 168, 208, 0.3);
}

.card-actions {
  flex-shrink: 0;
  margin-left: 12px;
}

.more-btn {
  color: #9ca3af;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: rgba(145, 168, 208, 0.05);
}

.more-btn:hover {
  color: #91a8d0;
  background: rgba(145, 168, 208, 0.1);
  transform: scale(1.1);
}

.card-content {
}

.reason {
  margin-bottom: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border-left: 4px solid #91a8d0;
}

.reason-text {
  margin: 0;
  font-size: 15px;
  color: #475569;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-style: italic;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #6b7280;
  padding-top: 16px;
  border-top: 1px solid rgba(145, 168, 208, 0.1);
}

.added-date {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(145, 168, 208, 0.05);
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
}

.weather-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #22c55e;
  font-weight: 600;
  background: rgba(34, 197, 94, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid rgba(34, 197, 94, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .wishlist-card {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border-color: rgba(145, 168, 208, 0.3);
    color: #f9fafb;
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.3),
      0 1px 3px rgba(145, 168, 208, 0.2);
  }

  .wishlist-card.current-weather {
    background: linear-gradient(135deg, #064e3b 0%, #1f2937 100%);
    border-color: rgba(34, 197, 94, 0.4);
  }

  .city-name {
    background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .reason {
    background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
    border-left-color: #f7cac9;
  }

  .reason-text {
    color: #d1d5db;
  }

  .city-tags .el-tag {
    background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
    color: #d1d5db;
  }

  .more-btn {
    background: rgba(145, 168, 208, 0.2);
    color: #d1d5db;
  }

  .more-btn:hover {
    background: rgba(145, 168, 208, 0.3);
    color: #91a8d0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .wishlist-card {
    padding: 16px;
    border-radius: 14px;
  }

  .city-name {
    font-size: 16px;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 14px;
  }

  .card-actions {
    margin-left: 0;
    align-self: flex-end;
  }

  .reason {
    padding: 12px;
    margin-bottom: 14px;
  }

  .reason-text {
    font-size: 14px;
  }
}
</style>
