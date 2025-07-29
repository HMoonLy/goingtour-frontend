<template>
  <div class="step-content">
    <el-card class="info-card" shadow="hover">
      <div v-if="tripData" class="trip-preview">
        <!-- 行程概述 -->
        <div class="trip-summary">
          <div class="summary-header">
            <div class="summary-title">
              <h3>
                {{ getSelectedCityName() }} {{ baseForm?.days || 0 }}日游
              </h3>
              <div class="summary-stats">
                <div class="stat-item">
                  <el-icon><MapLocation /></el-icon>
                  <span>{{ tripData?.attractions?.length || 0 }} 个景点</span>
                </div>
                <div class="stat-item">
                  <el-icon><Shop /></el-icon>
                  <span>{{ tripData?.restaurants?.length || 0 }} 家餐厅</span>
                </div>
                <div class="stat-item">
                  <el-icon><Money /></el-icon>
                  <span>预计花费：{{ getEstimatedCost() }}</span>
                </div>
              </div>
            </div>
            <div class="summary-actions">
              <el-button type="primary" size="large" @click="shareTrip">
                <el-icon><Share /></el-icon>
                分享行程
              </el-button>
            </div>
          </div>

          <!-- 日程安排 -->
          <div class="daily-schedule">
            <div
              v-for="(day, index) in tripData.dailyPlan"
              :key="index"
              class="day-plan"
            >
              <div class="day-header">
                <h4>第{{ index + 1 }}天</h4>
                <span class="day-date">{{ formatDayDate(index) }}</span>
              </div>
              <div class="day-activities">
                <div
                  v-for="(activity, activityIndex) in day.activities"
                  :key="activityIndex"
                  class="activity-item"
                >
                  <div class="activity-time">{{ activity.time }}</div>
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
                        @click="replaceActivity(index, activityIndex)"
                      >
                        <el-icon><Refresh /></el-icon>
                      </el-button>
                      <el-popconfirm
                        title="确定要移除此活动吗？"
                        @confirm="removeActivity(index, activityIndex)"
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
        </div>
      </div>

      <!-- 加载中状态 -->
      <div v-else-if="isLoading" class="no-trip-data">
        <el-skeleton :rows="10" animated />
      </div>

      <!-- 无数据状态 -->
      <div v-else class="no-trip-data">
        <el-empty description="暂无行程数据，请先生成行程">
          <el-button type="primary" @click="$emit('prev-step')">返回生成行程</el-button>
        </el-empty>
      </div>
    </el-card>
    
    <!-- 步骤操作按钮 -->
    <div class="step-actions">
      <el-button size="large" @click="$emit('prev-step')">
        <el-icon><ArrowLeft /></el-icon>
        上一步
      </el-button>
      
      <el-button 
        type="primary" 
        size="large" 
        @click="saveTrip"
        :disabled="!tripData"
      >
        保存行程
      </el-button>
    </div>
  </div>
</template>
  
  <script>
  import { ref, computed, reactive, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import {
    MapLocation,
    Shop,
    Money,
    Share,
    Download,
    View,
    ArrowLeft,
    Delete,
    Refresh
  } from "@element-plus/icons-vue";

  export default {
    name: "TripPreview",
    components: {
      MapLocation,
      Shop,
      Money,
      Share,
      Download,
      View,
      ArrowLeft,
      Delete,
      Refresh
    },
    props: {
      // 基础表单数据
      baseForm: {
        type: Object,
        required: true
      },
      // 生成的行程数据
      tripData: {
        type: Object,
        default: null
      },
      // 加载状态
      isLoading: {
        type: Boolean,
        default: false
      }
    },
    emits: ["regenerate", "saved", "prev-step"],
    setup(props, { emit }) {
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
        
        const cityCode = props.baseForm.destination;
        
        // 从cityInfoDatabase获取城市名称
        if (cityInfoDatabase[cityCode]) {
          return cityInfoDatabase[cityCode].name;
        }
        
        // 没有找到城市信息，返回城市代码
        return cityCode;
      };

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

      // 获取预算文本
      const getBudgetText = () => {
        const budgetMap = {
          budget: { text: "经济实惠", price: "约400元/天" },
          moderate: { text: "适中舒适", price: "约750元/天" },
          comfort: { text: "舒适便利", price: "约1000元/天" },
          luxury: { text: "豪华奢华", price: "约1500元/天" },
        };
        
        const option = budgetMap[props.baseForm.budget];
        if (!option) return "";
        
        return `${option.text}(${option.price})`;
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

        const budgetMap = {
          budget: 400,
          moderate: 750,
          luxury: 1500,
        };
        const dailyBudget = budgetMap[props.baseForm.budget] || 750;
        const totalCost =
          dailyBudget * props.baseForm.days * props.baseForm.travelers;
        return `约 ¥${totalCost.toLocaleString()}`;
      };

      // 获取活动标签类型
      const getTagType = (tag, activityType) => {
        if (activityType === 'attraction') {
          return 'success'; // 景点
        } else if (activityType === 'restaurant') {
          return 'info'; // 餐厅
        } else {
          return 'primary'; // 其他
        }
      };

      // 跳转到生成步骤
      const goToGenerationStep = () => {
        emit('prev-step'); // 假设第三步（index 2）是生成步骤
      };

      // 替换活动
      const replaceActivity = (dayIndex, activityIndex) => {
        emit('regenerate', dayIndex, activityIndex);
      };

      // 移除活动
      const removeActivity = (dayIndex, activityIndex) => {
        emit('regenerate', dayIndex, activityIndex);
      };

      // 分享行程
      const shareTrip = () => {
        emit('saved');
      };

      // 导出行程
      const exportTrip = () => {
        emit('saved');
      };

      // 预览行程
      const previewTrip = () => {
        emit('saved');
      };

      // 保存行程
      const saveTrip = () => {
        emit('saved');
      };

      // 组件挂载时的处理
      onMounted(() => {
        console.log("�� TripPreview组件挂载");
      });

      return {
        getSelectedCityName,
        formatDayDate,
        getBudgetText,
        getEstimatedCost,
        getTagType,
        goToGenerationStep,
        replaceActivity,
        removeActivity,
        shareTrip,
        exportTrip,
        previewTrip,
        saveTrip
      };
    }
  };
  </script>
  <style scoped>
  .info-card {
    border-radius: 12px;
    margin-bottom: 24px;
  }

  .step-content {
    width: 100%;
  }

  .trip-preview {
    padding-top: 16px;
  }

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
    justify-content: center; /* 按钮内容居中对齐 */
  }

  .daily-schedule {
    margin-top: 24px;
  }

  .day-plan {
    margin-bottom: 24px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
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

  .no-trip-data {
    padding: 60px 20px;
    text-align: center;
  }

  .step-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
  }

  .step-actions .el-button {
    width: 120px;
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