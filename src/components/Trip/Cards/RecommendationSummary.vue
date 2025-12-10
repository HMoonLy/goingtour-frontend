<template>
  <div
    v-if="hasSelections"
    class="selection-summary-float"
  >
    <div class="summary-float-card">
      <div class="summary-header">
        <div class="summary-title">
          <el-icon><Check /></el-icon>
          <span>已选择</span>
              <el-tag size="small" type="primary" effect="light">
            {{ totalSelected }}
          </el-tag>
        </div>
        <el-button
          type="primary"
          link
          size="small"
          @click="toggleSummaryDetail"
        >
          {{ showSummaryDetail ? '收起' : '查看详情' }}
        </el-button>
      </div>
      
      <!-- 详情展开区域 -->
      <div v-if="showSummaryDetail" class="summary-detail">
        <div class="selected-items-compact">
          <!-- 已选择的景点 -->
          <div v-if="selectedAttractions.length > 0" class="selected-section-compact">
            <div class="section-header-compact">
              <el-icon class="section-icon" color="#91a8d0">
                <Location />
              </el-icon>
              <span class="section-title-compact">
                必去景点 ({{ selectedAttractions.length }})
              </span>
            </div>
            <div class="selected-list-compact">
              <el-tag
                v-for="attraction in selectedAttractions"
                :key="attraction.id"
                type="primary"
                closable
                size="small"
                class="selection-tag-compact"
                @close="$emit('remove-attraction', attraction)"
              >
                {{ attraction.name }}
              </el-tag>
            </div>
          </div>

          <!-- 已选择的餐厅 -->
          <div v-if="selectedRestaurants.length > 0" class="selected-section-compact">
            <div class="section-header-compact">
              <el-icon class="section-icon" color="#E6A23C">
                <Food />
              </el-icon>
              <span class="section-title-compact">
                必去餐厅 ({{ selectedRestaurants.length }})
              </span>
            </div>
            <div class="selected-list-compact">
              <el-tag
                v-for="restaurant in selectedRestaurants"
                :key="restaurant.id"
                type="warning"
                closable
                size="small"
                class="selection-tag-compact"
                @close="$emit('remove-restaurant', restaurant)"
              >
                {{ restaurant.name }}
              </el-tag>
            </div>
          </div>

          <!-- 已选择的酒店 -->
          <div v-if="selectedHotels.length > 0" class="selected-section-compact">
            <div class="section-header-compact">
              <div class="section-header-compact">
                <el-icon class="section-icon" color="#409EFF">
                  <House />
                </el-icon>
                <span class="section-title-compact">
                  酒店 ({{ selectedHotels.length }})
                </span>
              </div>
              <div class="selected-list-compact">
                <el-tag
                  v-for="hotel in selectedHotels"
                  :key="hotel.id"
                  type="success"
                  closable
                  size="small"
                  class="selection-tag-compact"
                  @close="$emit('remove-hotel', hotel)"
                >
                  {{ hotel.name }}
                </el-tag>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="summary-actions-compact">
            <el-button type="info" link size="small" @click="confirmClearAll">
              重置所有选择
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { ElMessageBox } from "element-plus";
import { Check, Location, Food, House } from "@element-plus/icons-vue";

export default {
  name: "RecommendationSummary",
  components: {
    Check,
    Location,
    Food,
    House
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
          `确定要清空所有选择吗？共 ${props.selectedAttractions.length} 个景点、${props.selectedRestaurants.length} 家餐厅和 ${props.selectedHotels.length} 家酒店。`,
          "警告",
          {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            type: "warning",
            confirmButtonClass: "el-button--danger",
          }
        );
        emit("clear-all-selections");
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
/* 悬浮选择摘要卡片 */
.selection-summary-float {
  position: sticky;
  top: 20px;
  z-index: 100;
  margin-bottom: 20px;
}

.summary-float-card {
  background-color: white;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #f2f6fc;
}

.summary-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.summary-detail {
  padding: 16px 20px;
  background: #fafafa;
  border-top: none;
  animation: slideDown 0.2s ease-out;
}

.selected-items-compact {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selected-section-compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-header-compact {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.section-title-compact {
  font-size: 14px;
}

.selected-list-compact {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.selection-tag-compact {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
}

.summary-actions-compact {
  display: flex;
  justify-content: center;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

@media (max-width: 768px) {
  .summary-float-card {
    margin: 0 8px 16px;
  }

  .summary-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    padding: 16px;
  }

  .summary-title {
    justify-content: center;
  }

  .selected-list-compact {
    gap: 6px;
  }
  
  .selection-tag-compact {
    font-size: 13px;
    padding: 6px 10px;
  }
}

@media (max-width: 480px) {
  .summary-float-card {
    margin: 0 4px 12px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(145, 168, 208, 0.15);
  }

  .summary-header {
    padding: 14px 16px;
  }

  .summary-detail {
    padding: 12px 16px;
  }
}
</style>
