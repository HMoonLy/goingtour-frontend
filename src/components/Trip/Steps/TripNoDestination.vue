<template>
  <div class="no-destination-notice">
    <el-card class="notice-card" shadow="hover">
      <div class="notice-content">
        <el-icon class="notice-icon" color="#F56C6C" size="48">
          <Location />
        </el-icon>
        <h2>目的地</h2>
        <p>创建行程</p>
        <div class="notice-actions">
          <el-button type="primary" size="large" @click="$emit('go-to-destinations')">
            <el-icon><Location /></el-icon>
            目的地
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { Location } from "@element-plus/icons-vue";

export default {
  name: "TripNoDestination",
  components: {
    Location,
  },
  emits: ["go-to-destinations"],
};
</script>

<style scoped>
.no-destination-notice {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 20px;
}

.notice-card {
  max-width: 500px;
  width: 100%;
  border-radius: 16px;
  border: 2px solid #f7cac9;
  background: linear-gradient(135deg, rgba(247, 202, 201, 0.1) 0%, #ffffff 100%);
}

.notice-card :deep(.el-card__body) {
  padding: 48px 32px;
}

.notice-content {
  text-align: center;
}

.notice-icon {
  margin-bottom: 24px;
  animation: bounce 2s infinite;
  color: #91a8d0;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.notice-content h2 {
  color: #91a8d0;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.notice-content p {
  color: #666;
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 32px 0;
}

.notice-actions {
  display: flex;
  justify-content: center;
}

.notice-actions .el-button {
  height: 48px;
  padding: 0 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.notice-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(145, 168, 208, 0.3);
}

@media (max-width: 768px) {
  .no-destination-notice {
    min-height: 50vh;
    padding: 16px;
  }

  .notice-card :deep(.el-card__body) {
    padding: 32px 24px;
  }

  .notice-content h2 {
    font-size: 20px;
  }

  .notice-content p {
    font-size: 14px;
  }

  .notice-actions .el-button {
    height: 44px;
    padding: 0 24px;
    font-size: 15px;
  }
}
</style>

