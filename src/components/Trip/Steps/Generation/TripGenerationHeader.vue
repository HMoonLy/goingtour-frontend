<template>
  <div class="page-title">
    <div class="title-content">
      <el-icon class="title-icon">
        <MagicStick />
      </el-icon>
      <div class="title-text">
        <h2 class="main-title">AI行程生成</h2>
        <p class="subtitle">基于您的偏好设置，为您生成专属的个性化旅行行程</p>
      </div>
    </div>
  </div>
</template>

<script>
import { MagicStick } from "@element-plus/icons-vue";

export default {
  name: "TripGenerationHeader",
  components: { MagicStick }
};
</script>

<style scoped>
.page-title {
  padding: 0;
}

.title-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 40px;
  height: 40px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-color-primary-light-9);
  border-radius: 12px;
  color: var(--el-color-primary);
}

.title-text .main-title {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.title-text .subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .page-title {
    padding: 16px;
    margin-bottom: 16px;
  }

  .title-content {
    gap: 12px;
  }

  .title-text .main-title {
    font-size: 20px;
  }
}
</style>
