<template>
  <div class="step-actions">
    <div class="actions-content">
      <!-- 左侧：选择摘要 -->
      <div class="selection-summary">
        <div class="summary-stats">
          <div class="stat-item">
            <el-icon class="stat-icon" color="#91a8d0"><Location /></el-icon>
            <span>{{ selectedAttractionsCount }} 个景点</span>
          </div>
          <div class="stat-item">
            <el-icon class="stat-icon" color="#f7cac9"><Food /></el-icon>
            <span>{{ selectedRestaurantsCount }} 家餐厅</span>
          </div>
          <div class="stat-item">
            <el-icon class="stat-icon" color="#409EFF"><House /></el-icon>
            <span>{{ selectedHotelsCount }} 家酒店</span>
          </div>
        </div>
        <div v-if="totalSelected > 0" class="selection-tip">
          <el-icon><Check /></el-icon>
          <span>已选择 {{ totalSelected }} 项，可以继续生成行程</span>
        </div>
        <div v-else class="no-selection-tip">
          <el-icon><Warning /></el-icon>
          <span>建议至少选择1个景点或餐厅</span>
        </div>
      </div>

      <!-- 右侧：操作按钮 -->
      <div class="action-buttons">
        <el-button
          size="large"
          :disabled="generating"
          @click="$emit('prev-step')"
        >
          <el-icon><ArrowLeft /></el-icon>
          上一步
        </el-button>
        
        <el-button
          type="primary"
          size="large"
          :disabled="generating"
          @click="$emit('continue')"
        >
          <el-icon><ArrowRight /></el-icon>
          {{ totalSelected > 0 ? '继续生成行程' : '跳过直接生成' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import {
  Location, Food, House, Check, Warning,
  ArrowLeft, ArrowRight
} from '@element-plus/icons-vue';

export default {
  name: 'RecommendationActions',
  components: {
    Location, Food, House, Check, Warning,
    ArrowLeft, ArrowRight
  },
  props: {
    selectedAttractionsCount: {
      type: Number,
      default: 0
    },
    selectedRestaurantsCount: {
      type: Number,
      default: 0
    },
    selectedHotelsCount: {
      type: Number,
      default: 0
    },
    generating: {
      type: Boolean,
      default: false
    }
  },
  emits: ['prev-step', 'continue'],
  setup(props) {
    const totalSelected = computed(() => 
      props.selectedAttractionsCount + props.selectedRestaurantsCount + props.selectedHotelsCount
    );

    return {
      totalSelected
    };
  }
};
</script>

<style scoped>
.step-actions {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8eaed;
  margin-bottom: 32px;
  position: sticky;
  bottom: 20px;
  z-index: 50;
}

.actions-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
}

.selection-summary {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.stat-icon {
  font-size: 20px;
}

.selection-tip,
.no-selection-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.selection-tip {
  color: #67c23a;
}

.no-selection-tip {
  color: #e6a23c;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.action-buttons .el-button {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  min-width: 120px;
  transition: all 0.3s ease;
}

.action-buttons .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .step-actions {
    padding: 24px 16px;
    border-radius: 16px;
    margin-bottom: 20px;
  }

  .actions-content {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .selection-summary {
    text-align: center;
  }

  .summary-stats {
    justify-content: center;
    gap: 16px;
  }

  .stat-item {
    font-size: 15px;
  }

  .action-buttons {
    justify-content: stretch;
    gap: 12px;
  }

  .action-buttons .el-button {
    flex: 1;
    min-width: auto;
    padding: 14px 20px;
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .step-actions {
    padding: 20px 16px;
    margin-bottom: 16px;
    border-radius: 12px;
  }

  .selection-summary {
    gap: 8px;
  }

  .summary-stats {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  .stat-item {
    font-size: 14px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 12px;
  }

  .action-buttons .el-button {
    padding: 12px 16px;
    font-size: 14px;
    min-width: 80px;
  }
}
</style>

