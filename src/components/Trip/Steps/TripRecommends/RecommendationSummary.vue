<template>
  <div class="summary-wrapper">
    <!-- 展开后的详情面板 -->
    <transition name="pop-up">
      <div v-if="showSummaryDetail && hasSelections" class="summary-panel">
        <div class="panel-header">
          <span class="panel-title">已选行程 ({{ totalSelected }})</span>
          <el-button link type="info" size="small" @click="confirmClearAll">
            清空
          </el-button>
        </div>
        
        <div class="details-scroll">
          <!-- 景点 -->
          <div v-if="selectedAttractions.length" class="detail-group">
            <div class="group-header">
              <span class="group-title">景点</span>
              <span class="group-count">{{ selectedAttractions.length }}</span>
            </div>
            <div class="tags-wrapper">
              <el-tag
                v-for="item in selectedAttractions"
                :key="item.id"
                closable
                effect="light"
                class="custom-tag"
                @close="$emit('remove-attraction', item)"
              >
                {{ item.name }}
              </el-tag>
            </div>
          </div>

          <!-- 餐厅 -->
          <div v-if="selectedRestaurants.length" class="detail-group">
            <div class="group-header">
              <span class="group-title">餐厅</span>
              <span class="group-count">{{ selectedRestaurants.length }}</span>
            </div>
            <div class="tags-wrapper">
              <el-tag
                v-for="item in selectedRestaurants"
                :key="item.id"
                closable
                effect="light"
                type="warning"
                class="custom-tag"
                @close="$emit('remove-restaurant', item)"
              >
                {{ item.name }}
              </el-tag>
            </div>
          </div>

          <!-- 酒店 -->
          <div v-if="selectedHotels.length" class="detail-group">
            <div class="group-header">
              <span class="group-title">酒店</span>
              <span class="group-count">{{ selectedHotels.length }}</span>
            </div>
            <div class="tags-wrapper">
              <el-tag
                v-for="item in selectedHotels"
                :key="item.id"
                closable
                effect="light"
                type="success"
                class="custom-tag"
                @close="$emit('remove-hotel', item)"
              >
                {{ item.name }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 悬浮按钮 -->
    <transition name="fade">
      <div 
        v-if="hasSelections" 
        class="floating-btn" 
        :class="{ 'is-active': showSummaryDetail }"
        @click="toggleSummaryDetail"
      >
        <el-badge :value="totalSelected" class="custom-badge" :max="99">
          <div class="btn-icon">
            <el-icon v-if="!showSummaryDetail"><List /></el-icon>
            <el-icon v-else><Close /></el-icon>
          </div>
        </el-badge>
        <div class="btn-label">{{ showSummaryDetail ? '关闭' : '清单' }}</div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { ElMessageBox } from "element-plus";
import { List, Close } from "@element-plus/icons-vue";

export default {
  name: "RecommendationSummary",
  components: {
    List,
    Close
  },
  props: {
    selectedAttractions: {
      type: Array,
      default: () => [],
    },
    selectedRestaurants: {
      type: Array,
      default: () => [],
    },
    selectedHotels: {
      type: Array,
      default: () => [],
    }
  },
  emits: [
    "remove-attraction",
    "remove-restaurant",
    "remove-hotel",
    "clear-all-selections"
  ],
  setup(props, { emit }) {
    const showSummaryDetail = ref(false);

    const totalSelected = computed(() => 
      props.selectedAttractions.length + 
      props.selectedRestaurants.length + 
      props.selectedHotels.length
    );

    const hasSelections = computed(() => totalSelected.value > 0);

    const toggleSummaryDetail = () => {
      showSummaryDetail.value = !showSummaryDetail.value;
    };

    const confirmClearAll = async () => {
      try {
        await ElMessageBox.confirm(
          `确定要清空所有选择吗？`,
          "提示",
          {
            confirmButtonText: "确认清空",
            cancelButtonText: "取消",
            type: "warning",
            confirmButtonClass: "el-button--danger",
          }
        );
        emit("clear-all-selections");
        showSummaryDetail.value = false;
      } catch {
        // 用户取消
      }
    };

    return {
      showSummaryDetail,
      totalSelected,
      hasSelections,
      toggleSummaryDetail,
      confirmClearAll
    };
  }
};
</script>

<style scoped>
.summary-wrapper {
  position: fixed;
  right: 40px;
  bottom: 40px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none; /* 容器不挡点击，子元素恢复 */
}

/* 悬浮按钮 */
.floating-btn {
  pointer-events: auto;
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 28px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #ebeef5;
}

.floating-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  border-color: var(--el-color-primary-light-5);
}

.floating-btn.is-active {
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
  color: white;
}

.btn-icon {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  color: var(--el-color-primary);
}

.floating-btn.is-active .btn-icon {
  color: white;
}

.btn-label {
  font-size: 10px;
  margin-top: 2px;
  color: #606266;
}

.floating-btn.is-active .btn-label {
  color: rgba(255, 255, 255, 0.9);
}

/* 自定义 Badge 样式覆盖 */
:deep(.custom-badge .el-badge__content) {
  width: 20px;
  height: 20px;
  border: 2px solid white;
  background-color: var(--el-color-danger);
  top: -6px;
  left:-20px;
  transform: scale(0.85); /* 稍微缩小一点更精致 */
}

/* 详情面板 */
.summary-panel {
  pointer-events: auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  width: 320px;
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  transform-origin: bottom right;
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f2f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fcfcfc;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.details-scroll {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
}

.detail-group:not(:last-child) {
  margin-bottom: 16px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.group-title {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.group-count {
  font-size: 11px;
  color: #909399;
  background: #f0f2f5;
  padding: 1px 6px;
  border-radius: 10px;
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.custom-tag {
  background: #fff;
  border-color: #e4e7ed;
  color: #606266;
}

/* 动画 */
.pop-up-enter-active,
.pop-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.pop-up-enter-from,
.pop-up-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .summary-wrapper {
    right: 16px;
    bottom: 80px;
  }
  
  .summary-panel {
    width: 280px;
  }
}
</style>