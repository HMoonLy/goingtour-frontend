<template>
  <div class="restaurant-list-page">
    <div class="page-header">
      <h1>餐厅推荐</h1>
      <p>发现附近美食，丰富您的旅行体验</p>
    </div>

    <div class="coming-soon-card">
      <el-icon
size="64" color="#409EFF"
>
        <Food />
      </el-icon>
      <h3>餐厅推荐功能开发中</h3>
      <p>我们正在努力完善餐厅推荐功能，包括：</p>
      <ul class="feature-list">
        <li>附近餐厅展示</li>
        <li>按价格排序</li>
        <li>距离筛选</li>
        <li>菜系分类</li>
        <li>用户评价</li>
      </ul>
      <p class="stay-tuned">敬请期待！</p>
    </div>
  </div>
</template>

<script>
import { Food } from "@element-plus/icons-vue";

export default {
  name: "RestaurantList",
  components: {
    Food,
  },
};
</script>

<style scoped>
.restaurant-list-page {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-header p {
  font-size: 16px;
  color: #909399;
  margin: 0;
}

.coming-soon-card {
  background: white;
  border-radius: 12px;
  padding: 48px 32px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.coming-soon-card h3 {
  margin: 20px 0 16px 0;
  color: #606266;
  font-size: 24px;
}

.coming-soon-card > p {
  color: #909399;
  margin-bottom: 24px;
  font-size: 16px;
}

.feature-list {
  text-align: left;
  max-width: 250px;
  margin: 0 auto 24px auto;
  padding-left: 20px;
}

.feature-list li {
  color: #606266;
  margin-bottom: 8px;
  font-size: 15px;
}

.stay-tuned {
  color: #409eff;
  font-weight: 500;
  font-size: 16px;
}

@media (max-width: 768px) {
  .restaurant-list-page {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .coming-soon-card {
    padding: 32px 20px;
  }
}
</style>
