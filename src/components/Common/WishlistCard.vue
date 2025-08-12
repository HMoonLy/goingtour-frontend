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
          <el-button type="text"
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
          <el-button v-else
size="small" @click="showInput">
            <el-icon><Plus /></el-icon>
            添加标签
          </el-button>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false"> 取消 </el-button>
          <el-button type="primary"
@click="handleSave" :loading="saving">
            保存
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
    // 编辑对话框
    const editDialogVisible = ref(false);
    const editForm = ref({
      reason: "",
      tags: [],
    });
    const saving = ref(false);

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
      editForm.value = {
        reason: props.wishlistItem.reason || "",
        tags: [...(props.wishlistItem.tags || [])],
      };
      editDialogVisible.value = true;
    };

    // 保存编辑
    const handleSave = () => {
      saving.value = true;

      setTimeout(() => {
        emit("edit", {
          id: props.wishlistItem.id,
          updateData: {
            reason: editForm.value.reason,
            tags: editForm.value.tags,
          },
        });

        saving.value = false;
        editDialogVisible.value = false;
        ElMessage.success("保存成功");
      }, 500);
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
      if (inputValue.value && !editForm.value.tags.includes(inputValue.value)) {
        editForm.value.tags.push(inputValue.value);
      }
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
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
  position: relative;
}

.wishlist-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.wishlist-card.current-weather {
  border-color: #67c23a;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.wishlist-card.current-weather::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #67c23a, #85ce61);
  border-radius: 12px 12px 0 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.city-info {
  flex: 1;
}

.city-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.city-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.card-actions {
  flex-shrink: 0;
  margin-left: 12px;
}

.more-btn {
  color: #909399;
  padding: 4px;
}

.more-btn:hover {
  color: #409eff;
}

.card-content {
}

.reason {
  margin-bottom: 12px;
}

.reason-text {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.added-date {
  display: flex;
  align-items: center;
  gap: 4px;
}

.weather-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #67c23a;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 12px;
  }

  .card-actions {
    margin-left: 0;
    align-self: flex-end;
  }
}
</style>
