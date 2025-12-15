<template>
  <div class="trip-daily-itinerary">
    <div v-if="!dailyPlan || dailyPlan.length === 0" class="empty-plan">
      <el-empty description="暂无详细行程安排" :image-size="100" />
    </div>

    <div v-else class="timeline-container">
      <div v-for="(day, index) in dailyPlan" :key="index" class="day-section">
        <!-- 天次头部 -->
        <div class="day-header">
          <div class="day-badge">DAY {{ index + 1 }}</div>
          <div class="day-info" v-if="destination">
             <span class="day-location">{{ destination.city }}</span>
          </div>
        </div>

        <!-- 当天活动时间轴 -->
        <div class="activities-timeline">
          <div 
            v-for="(activity, actIndex) in day.activities" 
            :key="actIndex" 
            class="activity-item"
          >
            <!-- 时间点 -->
            <div class="time-column">
              <span class="time-text">{{ activity.time }}</span>
              <div class="time-dot"></div>
              <div class="time-line" v-if="actIndex < day.activities.length - 1"></div>
            </div>

            <!-- 活动内容 -->
            <div class="content-card">
              <div class="card-header">
                <h4 class="activity-title">{{ activity.name }}</h4>
                <el-tag 
                  size="small" 
                  effect="light" 
                  :type="getTagType(activity.type)"
                  class="activity-type-tag"
                >
                  {{ getActivityTypeName(activity.type) }}
                </el-tag>
              </div>
              
              <p class="activity-desc">{{ activity.description }}</p>
              
              <div class="activity-tags" v-if="activity.tags && activity.tags.length">
                <el-tag 
                  v-for="tag in activity.tags" 
                  :key="tag" 
                  size="small" 
                  type="info" 
                  effect="plain"
                  class="feature-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TripDailyItinerary',
  props: {
    dailyPlan: {
      type: Array,
      default: () => []
    },
    destination: {
      type: Object,
      default: () => null
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const getTagType = (type) => {
      switch (type) {
        case 'attraction': return 'success';
        case 'restaurant': return 'warning';
        case 'hotel': return 'primary';
        case 'transport': return 'info';
        default: return '';
      }
    };

    const getActivityTypeName = (type) => {
       switch (type) {
        case 'attraction': return '景点';
        case 'restaurant': return '美食';
        case 'hotel': return '住宿';
        case 'transport': return '交通';
        default: return '活动';
      }
    };

    return {
      getTagType,
      getActivityTypeName
    };
  }
};
</script>

<style scoped>
.trip-daily-itinerary {
  padding: 10px 0;
}

.day-section {
  margin-bottom: 40px;
}

.day-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.day-badge {
  background: #409eff;
  color: white;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 16px;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

.day-location {
  font-size: 14px;
  color: #909399;
}

/* Timeline Styles */
.activities-timeline {
  padding-left: 10px;
}

.activity-item {
  display: flex;
  gap: 20px;
  position: relative;
  padding-bottom: 24px;
}

.activity-item:last-child {
  padding-bottom: 0;
}

.time-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
  flex-shrink: 0;
  position: relative;
}

.time-text {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 4px;
}

.time-dot {
  width: 10px;
  height: 10px;
  background: #e4e7ed;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #dcdfe6;
  z-index: 1;
}

.activity-item:hover .time-dot {
  background: #409eff;
  box-shadow: 0 0 0 2px #a0cfff;
}

.time-line {
  position: absolute;
  top: 30px;
  bottom: -10px;
  width: 2px;
  background: #e4e7ed;
  left: 50%;
  transform: translateX(-50%);
}

.content-card {
  flex: 1;
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
}

.content-card:hover {
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: #dcdfe6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.activity-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.activity-desc {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.activity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feature-tag {
  border: none;
  background: #f0f2f5;
  color: #909399;
}

@media (max-width: 768px) {
  .activity-item {
    gap: 12px;
  }
  
  .time-column {
    width: 44px;
  }
  
  .time-text {
    font-size: 12px;
  }
  
  .activity-title {
    font-size: 15px;
  }
}
</style>
