<template>
  <div class="search-page">
    <div class="page-header">
      <h1>搜索结果</h1>
      <p>找到您感兴趣的景点和目的地</p>
    </div>

    <div class="coming-soon-card">
      <el-icon size="64"
color="#91A8D0">
        <Search />
      </el-icon>
      <h3>搜索功能开发中</h3>
      <p>我们正在努力完善搜索功能，包括：</p>
      <ul class="feature-list">
        <li>景点搜索</li>
        <li>城市搜索</li>
        <li>智能推荐</li>
        <li>筛选功能</li>
        <li>搜索历史</li>
      </ul>
      <p class="stay-tuned">
敬请期待！
</p>
    </div>
  </div>
</template>

<script>
import { Search } from "@element-plus/icons-vue";

export default {
  name: "Search",
  components: {
    Search,
  },
  setup() {},
};
</script>

<style scoped>
.search-page {
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
  max-width: 200px;
  margin: 0 auto 24px auto;
  padding-left: 20px;
}

.feature-list li {
  color: #606266;
  margin-bottom: 8px;
  font-size: 15px;
}

.stay-tuned {
  color: #91a8d0;
  font-weight: 500;
  font-size: 16px;
}

@media (max-width: 768px) {
  .search-page {
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
