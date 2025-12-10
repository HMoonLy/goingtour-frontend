<template>
  <section class="quick-actions">
    <div class="section-header">
      <h3>
        <el-icon><Grid /></el-icon>
        快捷功能
      </h3>
    </div>

    <div class="actions-grid">
      <div class="action-card" @click="$router.push('/destinations')">
        <el-icon><MapLocation /></el-icon>
        <div class="action-info">
          <h4>选择目的地</h4>
          <p>发现新的旅行目的地</p>
        </div>
      </div>

      <div class="action-card" @click="$router.push('/footprints')">
        <el-icon><Star /></el-icon>
        <div class="action-info">
          <h4>我的足迹</h4>
          <p>记录旅行足迹和照片</p>
        </div>
      </div>

      <div class="action-card" @click="$emit('export')">
        <el-icon><Download /></el-icon>
        <div class="action-info">
          <h4>导出数据</h4>
          <p>导出我的行程数据</p>
        </div>
      </div>

      <div class="action-card" @click="$router.push('/personal/settings')">
        <el-icon><Setting /></el-icon>
        <div class="action-info">
          <h4>账户设置</h4>
          <p>档案设置和账户管理</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { Grid, MapLocation, Star, Download, Setting } from "@element-plus/icons-vue";

export default {
  name: "QuickActions",
  components: {
    Grid,
    MapLocation,
    Star,
    Download,
    Setting,
  },
  emits: ["export"],
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

/* 快捷功能 */
.quick-actions {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card:hover {
  border-color: #91a8d0;
  background: rgba(145, 168, 208, 0.04);
  transform: translateY(-1px);
}

.action-card .el-icon {
  font-size: 24px;
  color: #91a8d0;
  flex-shrink: 0;
}

.action-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.action-info p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>

