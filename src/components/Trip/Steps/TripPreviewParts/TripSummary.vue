<template>
  <div class="trip-summary">
    <div class="summary-header">
      <div class="summary-title">
        <h3>{{ getSelectedCityName() }} {{ baseForm?.days || 0 }}天</h3>
        <div class="summary-stats">
          <div class="stat-item">
            <el-icon><MapLocation /></el-icon>
            <span>{{ `${tripData?.attractions?.length || 0}个景点` }}</span>
          </div>
          <div class="stat-item">
            <el-icon><Shop /></el-icon>
            <span>{{ `${tripData?.restaurants?.length || 0}家餐厅` }}</span>
          </div>
          <div class="stat-item">
            <el-icon><Money /></el-icon>
            <span>{{ "预计花费" }}：{{ getEstimatedCost() }}</span>
          </div>
        </div>
      </div>
      <div class="summary-actions">
        <el-button type="primary" size="large" @click="$emit('share')">
          <el-icon><Share /></el-icon>
          {{ "分享" }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  MapLocation,
  Shop,
  Money,
  Share,
} from "@element-plus/icons-vue";
import { PERSONAL_PROFILE_OPTIONS } from "@/utils/data/travelDataSystem";

export default {
  name: "TripSummary",
  components: {
    MapLocation,
    Shop,
    Money,
    Share,
  },
  props: {
    baseForm: {
      type: Object,
      required: true,
    },
    tripData: {
      type: Object,
      default: null,
    },
  },
  emits: ["share"],
  setup(props) {
    // 城市信息数据库
    const cityInfoDatabase = {
      beijing: {
        name: "北京",
        description: "千年古都，文化底蕴深厚",
      },
      shanghai: {
        name: "上海",
        description: "国际化大都市，东西文化交汇",
      },
    };

    // 获取城市名称
    const getSelectedCityName = () => {
      if (!props.baseForm || !props.baseForm.destination) {
        return "未选择";
      }

      const adcode = props.baseForm.destination;

      // 从cityInfoDatabase获取城市名称
      if (cityInfoDatabase[adcode]) {
        return cityInfoDatabase[adcode].name;
      }

      // 没有找到城市信息，返回城市代码
      return adcode;
    };

    // 获取预计总花费
    const getEstimatedCost = () => {
      if (
        !props.baseForm ||
        !props.baseForm.budget ||
        !props.baseForm.days ||
        !props.baseForm.travelers
      ) {
        return "计算中...";
      }

      const options = PERSONAL_PROFILE_OPTIONS.budgetLevel.options;
      const budgetOption = options[props.baseForm.budget];
      const dailyBudget = budgetOption ? budgetOption.avgCost : 500; // 默认500

      const totalCost = dailyBudget * props.baseForm.days * props.baseForm.travelers;
      return `约 ¥${totalCost.toLocaleString()}`;
    };

    return {
      getSelectedCityName,
      getEstimatedCost,
    };
  },
};
</script>

<style scoped>
.trip-summary {
  margin-bottom: 32px;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.summary-title h3 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 20px;
}

.summary-stats {
  display: flex;
  gap: 24px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
}

.summary-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.summary-actions .el-button {
  width: 120px;
  justify-content: center;
}

@media (max-width: 768px) {
  .summary-header {
    flex-direction: column;
    align-items: center;
  }

  .summary-title {
    text-align: center;
    width: 100%;
  }

  .summary-stats {
    justify-content: center;
  }

  .summary-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>

