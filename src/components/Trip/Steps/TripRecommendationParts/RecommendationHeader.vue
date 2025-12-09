<template>
  <div class="step-header">
    <div class="header-content">
      <div class="header-icon">
        <el-icon><Star /></el-icon>
      </div>
      <div class="header-text">
        <h2 class="step-title">🗺️ {{ cityName || '目的地' }}热门推荐</h2>
        <p class="step-subtitle">基于高德地图数据为您推荐热门景点和餐厅，选择您感兴趣的进行旅行规划</p>
      </div>
    </div>
    
    <!-- 进度提示 -->
    <div class="progress-hint">
      <div class="hint-content">
        <el-icon><InfoFilled /></el-icon>
        <span>💡 基于高德地图数据，为您推荐该地区的热门景点和餐厅</span>
      </div>
    </div>
  </div>
</template>

<script>
import { Star, InfoFilled } from '@element-plus/icons-vue';

export default {
  name: 'RecommendationHeader',
  components: {
    Star,
    InfoFilled
  },
  props: {
    cityName: {
      type: String,
      default: ''
    }
  }
};
</script>

<style scoped>
.step-header {
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 32px;
  color: white;
  position: relative;
  overflow: hidden;
}

.step-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="a" cx="50" cy="50" r="50"><stop offset="0" stop-color="white" stop-opacity="0.1"/><stop offset="1" stop-color="white" stop-opacity="0.05"/></radialGradient></defs><rect width="100" height="20" fill="url(%23a)"/></svg>');
  opacity: 0.3;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.header-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  backdrop-filter: blur(10px);
}

.step-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.step-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
}

.progress-hint {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 20px 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.hint-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .step-header {
    padding: 24px 20px;
    margin-bottom: 20px;
    border-radius: 16px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .header-icon {
    width: 60px;
    height: 60px;
    font-size: 30px;
  }

  .step-title {
    font-size: 28px;
  }

  .step-subtitle {
    font-size: 14px;
    line-height: 1.6;
  }

  .progress-hint {
    padding: 16px 20px;
    border-radius: 12px;
  }

  .hint-content {
    font-size: 13px;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .step-header {
    padding: 20px 16px;
    margin-bottom: 16px;
    border-radius: 12px;
  }

  .header-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }

  .step-title {
    font-size: 22px;
    margin-bottom: 8px;
  }

  .step-subtitle {
    font-size: 13px;
  }

  .progress-hint {
    padding: 12px 16px;
  }

  .hint-content {
    font-size: 12px;
  }
}
</style>

