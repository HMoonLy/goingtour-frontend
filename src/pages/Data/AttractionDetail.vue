<template>
  <div class="attraction-detail-page">
    <div class="page-header">
      <h1>{{ t('attraction.title') }}</h1>
      <p>{{ t('attraction.subtitle') }}</p>
    </div>

    <div class="coming-soon-card">
      <el-icon
size="64" color="#409EFF"
>
        <Camera />
      </el-icon>
      <h3>{{ t('attraction.comingTitle') }}</h3>
      <p>{{ t('attraction.comingDesc') }}</p>
      <ul class="feature-list">
        <li>{{ t('attraction.features.intro') }}</li>
        <li>{{ t('attraction.features.hours') }}</li>
        <li>{{ t('attraction.features.ticket') }}</li>
        <li>{{ t('attraction.features.reviews') }}</li>
        <li>{{ t('attraction.features.add') }}</li>
      </ul>
      <p class="stay-tuned">{{ t('attraction.stayTuned') }}</p>
    </div>
  </div>
</template>

<script>
import { Camera } from "@element-plus/icons-vue";
import { useI18n } from "@/utils/i18n.js";

export default {
  name: "AttractionDetail",
  components: {
    Camera,
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
};
</script>

<style scoped>
.attraction-detail-page {
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
  .attraction-detail-page {
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
