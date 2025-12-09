<template>
  <div class="daily-schedule">
    <div v-for="(day, index) in tripData.dailyPlan" :key="index" class="day-plan">
      <div class="day-header">
        <h4>{{ `第${index + 1}天` }}</h4>
        <span class="day-date">{{ formatDayDate(index) }}</span>
      </div>
      <div class="day-activities">
        <div
          v-for="(activity, activityIndex) in day.activities"
          :key="activityIndex"
          class="activity-item"
        >
          <div class="activity-time">
            {{ activity.time }}
          </div>
          <div class="activity-content">
            <div class="activity-info">
              <h5>{{ activity.name }}</h5>
              <p>{{ activity.description }}</p>
              <div class="activity-tags">
                <el-tag
                  v-for="tag in activity.tags"
                  :key="tag"
                  size="small"
                  :type="getTagType(tag, activity.type)"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
            <div class="activity-actions">
              <el-button
                size="small"
                circle
                @click="$emit('regenerate', index, activityIndex)"
              >
                <el-icon><Refresh /></el-icon>
              </el-button>
              <el-popconfirm
                :title="'确定要删除吗？'"
                @confirm="$emit('regenerate', index, activityIndex)"
              >
                <template #reference>
                  <el-button size="small" circle type="danger">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Delete, Refresh } from "@element-plus/icons-vue";

export default {
  name: "DailySchedule",
  components: {
    Delete,
    Refresh,
  },
  props: {
    tripData: {
      type: Object,
      required: true,
    },
    baseForm: {
      type: Object,
      required: true,
    },
  },
  emits: ["regenerate"],
  setup(props) {
    // 格式化日期
    const formatDayDate = (dayIndex) => {
      if (
        !props.baseForm ||
        !props.baseForm.dateRange ||
        props.baseForm.dateRange.length !== 2
      ) {
        return `第${dayIndex + 1}天`;
      }

      try {
        const startDate = new Date(props.baseForm.dateRange[0]);
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + dayIndex);

        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();
        const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
        const weekday = weekdays[currentDate.getDay()];

        return `第${dayIndex + 1}天 ${month}月${day}日 (周${weekday})`;
      } catch (error) {
        console.error("日期格式化失败:", error);
        return `第${dayIndex + 1}天`;
      }
    };

    // 获取活动标签类型
    const getTagType = (tag, activityType) => {
      if (activityType === "attraction") {
        return "success"; // 景点
      } else if (activityType === "restaurant") {
        return "info"; // 餐厅
      } else {
        return "primary"; // 其他
      }
    };

    return {
      formatDayDate,
      getTagType,
    };
  },
};
</script>

<style scoped>
.daily-schedule {
  margin-top: 24px;
}

.day-plan {
  margin-bottom: 24px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.day-header {
  background: #f5f7fa;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e4e7ed;
}

.day-header h4 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.day-date {
  color: #606266;
  font-size: 14px;
}

.day-activities {
  padding: 16px;
}

.activity-item {
  display: flex;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.activity-time {
  width: 60px;
  flex-shrink: 0;
  font-weight: 500;
  color: #409eff;
  font-size: 14px;
}

.activity-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.activity-info {
  flex: 1;
}

.activity-info h5 {
  margin: 0 0 6px 0;
  color: #303133;
  font-size: 15px;
}

.activity-info p {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.activity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.activity-tags .el-tag {
  margin-right: 4px;
  font-size: 12px;
}

.activity-actions {
  display: flex;
  gap: 8px;
  margin-left: 10px;
}

@media (max-width: 768px) {
  .activity-item {
    flex-direction: column;
    gap: 8px;
  }

  .activity-time {
    width: auto;
    font-size: 13px;
  }

  .activity-content {
    flex-direction: column;
  }

  .activity-actions {
    margin-left: 0;
    margin-top: 10px;
  }
}
</style>

