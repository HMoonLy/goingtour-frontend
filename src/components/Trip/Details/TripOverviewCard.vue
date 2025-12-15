<template>
  <el-card class="trip-overview-card" shadow="hover">
    <div class="trip-header">
      <div class="trip-title-section">
        <h1 v-if="!isEditing" class="trip-title">
          {{ tripData.title }}
        </h1>
        <el-input
          v-else
          :model-value="editedTrip.title"
          @update:model-value="updateTitle"
          size="large"
          class="title-input"
          placeholder="请输入标题"
        />
        <div class="trip-status">
          <el-tag :type="tripData.status === 'draft' ? 'info' : 'success'">
            {{ tripData.status === "draft" ? "草稿" : "已完成" }}
          </el-tag>
          <span class="create-time">创建于 {{ formatDate(tripData.createdAt) }}</span>
        </div>
      </div>
      <div class="trip-actions">
        <el-button @click="$emit('share')">
          <el-icon><Share /></el-icon>
          分享
        </el-button>
        <el-dropdown @command="(cmd) => $emit('export', cmd)" trigger="click">
          <el-button type="primary">
            <el-icon><Download /></el-icon>
            导出行程
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="word">
                <el-icon><Edit /></el-icon>
                导出Word文档
              </el-dropdown-item>
              <el-dropdown-item command="image">
                <el-icon><Picture /></el-icon>
                导出图片
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown @command="(cmd) => $emit('more-action', cmd)">
          <el-button>
            更多<el-icon class="el-icon--right">
              <ArrowDown />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="publish">
                <el-icon><Promotion /></el-icon>
                发布到社区
              </el-dropdown-item>
              <el-dropdown-item command="duplicate"> 复制行程 </el-dropdown-item>
              <el-dropdown-item command="template"> 保存为模板 </el-dropdown-item>
              <el-dropdown-item command="delete" divided> 删除行程 </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 行程基本信息 -->
    <div class="trip-info-grid">
      <div class="info-item">
        <el-icon class="info-icon">
          <MapLocation />
        </el-icon>
        <div class="info-content">
          <h4>目的地</h4>
          <p>{{ tripData.city }}</p>
        </div>
      </div>
      <div class="info-item">
        <el-icon class="info-icon">
          <Calendar />
        </el-icon>
        <div class="info-content">
          <h4>出行时间</h4>
          <p>{{ formatDateRange(tripData.createTime) }}</p>
        </div>
      </div>
      <div class="info-item">
        <el-icon class="info-icon">
          <User />
        </el-icon>
        <div class="info-content">
          <h4>出行人数</h4>
          <p>{{ tripData.mate }}人</p>
        </div>
      </div>
      <div class="info-item">
        <el-icon class="info-icon">
          <Money />
        </el-icon>
        <div class="info-content">
          <h4>预算范围</h4>
          <p>{{ tripData.totalBudget }}</p>
        </div>
      </div>
      <div class="info-item">
        <el-icon class="info-icon">
          <DataLine />
        </el-icon>
        <div class="info-content">
          <h4>预计费用</h4>
          <p>{{ tripData.totalBudget }}</p>
        </div>
      </div>
      <div class="info-item">
        <el-icon class="info-icon">
          <Collection />
        </el-icon>
        <div class="info-content">
          <h4>内容统计</h4>
          <p>
            {{ (tripData.attractions?.length || 0) + "个景点" }}
            ·
            {{ (tripData.restaurants?.length || 0) + "家餐厅" }}
          </p>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import {
  Share,
  Download,
  ArrowDown,
  Edit,
  Picture,
  MapLocation,
  Calendar,
  User,
  Money,
  DataLine,
  Collection,
  Promotion,
} from "@element-plus/icons-vue";

export default {
  name: "TripOverviewCard",
  components: {
    Share,
    Download,
    ArrowDown,
    Edit,
    Picture,
    MapLocation,
    Calendar,
    User,
    Money,
    DataLine,
    Collection,
    Promotion,
  },
  props: {
    tripData: {
      type: Object,
      required: true,
    },
    editedTrip: {
      type: Object,
      required: true,
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["share", "export", "more-action", "update:editedTrip"],
  setup(props, { emit }) {
    const updateTitle = (val) => {
      emit("update:editedTrip", { ...props.editedTrip, title: val });
    };

    const formatDate = (dateString) => {
      try {
        return new Date(dateString).toLocaleDateString("zh-CN");
      } catch {
        return "";
      }
    };

    const formatDateRange = (createTime) => {
      // 如果传入了createTime参数，使用它来生成日期范围
      if (createTime) {
        try {
          const startDate = new Date(createTime);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + (props.tripData.days || 1) - 1);

          const start = startDate.toLocaleDateString("zh-CN");
          const end = endDate.toLocaleDateString("zh-CN");
          return `${start} - ${end}`;
        } catch {
          return "";
        }
      }

      // 原有逻辑：使用dateRange
      if (!props.tripData.dateRange || props.tripData.dateRange.length !== 2) {
        return "";
      }
      try {
        const start = new Date(props.tripData.dateRange[0]).toLocaleDateString(
          navigator.language || "en-US"
        );
        const end = new Date(props.tripData.dateRange[1]).toLocaleDateString(
          navigator.language || "en-US"
        );
        return `${start} - ${end}`;
      } catch {
        return "";
      }
    };

    return {
      updateTitle,
      formatDate,
      formatDateRange,
    };
  },
};
</script>

<style scoped>
/* 行程概览卡片 */
.trip-overview-card {
  margin-bottom: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.trip-overview-card :deep(.el-card__body) {
  padding: 32px;
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f2f5;
}

.trip-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 12px 0;
  line-height: 1;
}

.title-input {
  font-size: 20px;
  font-weight: 700;
}

.trip-status {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}

.create-time {
  color: #718096;
  font-size: 14px;
}

.trip-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 行程信息网格 */
.trip-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #91a8d0;
  background: #edf2f7;
}

.info-content h4 {
  font-size: 14px;
  color: #718096;
  margin: 0 0 4px 0;
  font-weight: 500;
}

.info-content p {
  font-size: 12px;
  color: #2d3748;
  margin: 0;
  font-weight: 400;
}

@media (max-width: 768px) {
  .trip-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .trip-actions {
    align-self: flex-end;
  }

  .trip-info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .info-item {
    padding: 12px 0;
  }

  .trip-title {
    font-size: 24px;
  }

  .title-input {
    font-size: 24px;
  }

  .info-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .trip-overview-card :deep(.el-card__body) {
    padding: 20px;
  }
}

@media (max-width: 360px) {
  .trip-overview-card :deep(.el-card__body) {
    padding: 16px;
  }
}
</style>

