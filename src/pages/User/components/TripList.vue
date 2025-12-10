<template>
  <section class="trips-section">
    <div class="section-header">
      <h3>
        <el-icon><Tickets /></el-icon>
        我的行程
      </h3>
      <div class="header-actions">
        <el-button type="primary" size="small" @click="$emit('create')">
          <el-icon><Plus /></el-icon>
          创建新行程
        </el-button>
      </div>
    </div>

    <!-- 行程筛选标签 -->
    <div class="filter-tabs">
      <el-radio-group v-model="activeFilter" size="small">
        <el-radio-button value="all"> 全部 </el-radio-button>
        <el-radio-button value="saved"> 已保存 </el-radio-button>
        <el-radio-button value="draft"> 草稿 </el-radio-button>
        <el-radio-button value="ai"> AI生成 </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 行程列表 -->
    <div class="trips-container">
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else-if="filteredTrips.length === 0" class="empty-state">
        <el-empty :description="getEmptyDescription()" :image-size="120">
          <template #image>
            <el-icon size="80" color="#d3d3d3">
              <DocumentCopy />
            </el-icon>
          </template>
          <el-button type="primary" @click="$emit('create')"> 创建第一个行程 </el-button>
        </el-empty>
      </div>

      <div v-else class="trips-grid">
        <div
          v-for="trip in filteredTrips"
          :key="trip.id"
          class="trip-card"
          :class="{
            'is-draft': trip.isDraft,
            'is-ai': trip.aiGenerated,
          }"
          @click="$emit('view', trip)"
        >
          <div class="trip-header">
            <h4 class="trip-title">
              {{ trip.title }}
            </h4>
            <el-dropdown @command="(cmd) => $emit('action', cmd, trip)">
              <el-button size="small" link @click.stop>
                <el-icon><More /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">
                    <el-icon><Edit /></el-icon>编辑
                  </el-dropdown-item>
                  <el-dropdown-item command="duplicate">
                    <el-icon><DocumentCopy /></el-icon>复制
                  </el-dropdown-item>
                  <el-dropdown-item command="share">
                    <el-icon><Share /></el-icon>分享
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <el-icon><Delete /></el-icon>删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <div class="trip-meta">
            <div class="meta-item">
              <el-icon><MapLocation /></el-icon>
              <span>{{
                trip.destinationName || trip.destination || "未知目的地"
              }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Calendar /></el-icon>
              <span>{{ trip.days }}天</span>
            </div>
            <div v-if="trip.totalBudget" class="meta-item">
              <el-icon><Money /></el-icon>
              <span>{{ trip.totalBudget }}</span>
            </div>
          </div>

          <div class="trip-status">
            <el-tag v-if="trip.isDraft" type="warning" size="small"> 草稿 </el-tag>
            <el-tag v-else-if="trip.aiGenerated" type="primary" size="small">
              AI生成
            </el-tag>
            <el-tag v-else type="success" size="small"> 已完成 </el-tag>

            <span class="update-time">
              {{ formatTime(trip.updatedAt || trip.createdAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, computed } from "vue";
import {
  Tickets,
  Plus,
  DocumentCopy,
  More,
  Edit,
  Share,
  Delete,
  MapLocation,
  Calendar,
  Money,
} from "@element-plus/icons-vue";

export default {
  name: "TripList",
  components: {
    Tickets,
    Plus,
    DocumentCopy,
    More,
    Edit,
    Share,
    Delete,
    MapLocation,
    Calendar,
    Money,
  },
  props: {
    trips: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["create", "view", "action"],
  setup(props) {
    const activeFilter = ref("all");

    const filteredTrips = computed(() => {
      switch (activeFilter.value) {
        case "saved":
          return props.trips.filter((trip) => !trip.isDraft);
        case "draft":
          return props.trips.filter((trip) => trip.isDraft);
        case "ai":
          return props.trips.filter((trip) => trip.aiGenerated && !trip.isDraft);
        default:
          return props.trips;
      }
    });

    const getEmptyDescription = () => {
      switch (activeFilter.value) {
        case "saved":
          return "还没有已保存的行程";
        case "draft":
          return "还没有草稿行程";
        case "ai":
          return "还没有AI生成的行程";
        default:
          return "还没有任何行程，开始创建你的第一个行程吧！";
      }
    };

    const formatTime = (timestamp) => {
      if (!timestamp) return "";

      try {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 24 * 60 * 60 * 1000) {
          return "今天";
        } else if (diff < 48 * 60 * 60 * 1000) {
          return "昨天";
        } else {
          return date.toLocaleDateString("zh-CN");
        }
      } catch {
        return "";
      }
    };

    return {
      activeFilter,
      filteredTrips,
      getEmptyDescription,
      formatTime,
    };
  },
};
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 行程区域 */
.trips-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.filter-tabs {
  margin-bottom: 20px;
}

.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.trip-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.trip-card:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.2);
  transform: translateY(-2px);
}

.trip-card.is-draft {
  border-left: 4px solid #f7ba2a;
}

.trip-card.is-ai {
  border-left: 4px solid #91a8d0;
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.trip-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.trip-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.trip-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.update-time {
  font-size: 12px;
  color: #909399;
}

/* 空状态和加载状态 */
.loading-state,
.empty-state {
  padding: 40px 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .trips-grid {
    grid-template-columns: 1fr;
  }
}
</style>

