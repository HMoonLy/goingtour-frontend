<template>
  <div v-if="count > 0" class="wishlist-cities-cards">
    <div class="section-header">
      <h4 class="section-title">
        <el-icon><Star /></el-icon>
        想去的城市 ({{ count }})
      </h4>
      <div class="section-controls">
        <div class="filter-controls">
          <el-select
            :model-value="sortValue"
            placeholder="排序方式"
            size="small"
            style="width: 120px"
            @change="$emit('update:sortValue', $event)"
          >
            <el-option label="添加时间" value="date" />
            <el-option label="城市名称" value="name" />
          </el-select>
        </div>

        <el-button size="small" type="primary" @click="$emit('add-city')">
          <el-icon><Plus /></el-icon>
          添加城市
        </el-button>
      </div>
    </div>

    <div class="simple-cards-container">
      <div
        v-for="item in items"
        :key="item.id"
        class="enhanced-wishlist-card"
        @click="$emit('card-click', item)"
      >
        <div class="card-main-content">
          <div class="card-header">
            <div class="city-info">
              <!-- 重访标识 -->
              <div
                v-if="item.ever_visited && item.want_to_visit_again"
                class="revisit-badge"
              >
                <el-icon><Star /></el-icon>
                <span>想再去</span>
              </div>

              <h5 class="card-city-name">
                {{ item.cityName }}
              </h5>
              <span class="added-time">
                {{ formatTime(item.createdAt) }}
              </span>
            </div>
            <div class="card-actions">
              <!-- 只有从未去过的城市才显示"标记为已去过"按钮 -->
              <div v-if="!item.ever_visited" class="primary-action">
                <el-button
                  size="small"
                  type="primary"
                  class="action-btn visited-btn"
                  @click.stop="$emit('mark-visited', item)"
                >
                  <el-icon><Check /></el-icon>
                  <span class="action-text">标记为已去过</span>
                </el-button>
              </div>
              <div class="secondary-actions">
                <el-button
                  size="small"
                  class="action-btn edit-btn"
                  @click.stop="$emit('edit', item)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  plain
                  class="action-btn delete-btn"
                  @click.stop="$emit('delete', item)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <div class="card-tags" v-if="item.tags && item.tags.length > 0">
            <el-tag
              v-for="tag in item.tags.slice(0, 3)"
              :key="tag"
              size="small"
              effect="plain"
              round
            >
              {{ tag }}
            </el-tag>
            <el-tag
              v-if="item.tags.length > 3"
              size="small"
              effect="plain"
              round
              type="info"
            >
              +{{ item.tags.length - 3 }}
            </el-tag>
          </div>

          <div class="card-reason" v-if="item.reason">
            <p class="reason-text">{{ item.reason }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Star, Plus, Check, Edit, Delete } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

defineProps({
  items: { type: Array, default: () => [] },
  count: { type: Number, default: 0 },
  sortValue: { type: String, default: 'date' }
});

defineEmits([
  'update:sortValue',
  'add-city',
  'card-click',
  'mark-visited',
  'edit',
  'delete'
]);

const formatTime = (time) => {
  if (!time) return '';
  return dayjs(time).format('YYYY-MM-DD');
};
</script>

<style scoped>
.wishlist-cities-cards {
  margin-top: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.simple-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.enhanced-wishlist-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.enhanced-wishlist-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  border-color: #dcdfe6;
}

.card-main-content {
  padding: 20px;
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

.revisit-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #e6a23c;
  background: #fdf6ec;
  padding: 2px 8px;
  border-radius: 12px;
  margin-bottom: 6px;
}

.card-city-name {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 4px 0;
}

.added-time {
  font-size: 12px;
  color: #909399;
}

.card-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.secondary-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.enhanced-wishlist-card:hover .secondary-actions {
  opacity: 1;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.card-reason {
  background: #f5f7fa;
  padding: 10px 12px;
  border-radius: 8px;
}

.reason-text {
  font-size: 13px;
  color: #606266;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 768px) {
  .simple-cards-container {
    grid-template-columns: 1fr;
  }
  
  .secondary-actions {
    opacity: 1;
  }
}
</style>

