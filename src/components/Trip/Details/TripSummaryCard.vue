<template>
  <div class="trip-summary-card" v-if="summaryData">
    <!-- 纯文本摘要 (兼容编辑后的内容) -->
    <div v-if="summaryData.text_content" class="text-summary-section">
      <div class="summary-text">{{ summaryData.text_content }}</div>
      <el-divider border-style="dashed" v-if="summaryData.trip_summary" />
    </div>
  </div>
</template>

<script>
import { Calendar, User, House, Money } from '@element-plus/icons-vue';

export default {
  name: 'TripSummaryCard',
  components: { Calendar, User, House, Money },
  props: {
    summaryData: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
.trip-summary-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.text-summary-section {
  margin-bottom: 24px;
}

.summary-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap;
}

@media (max-width: 600px) {
  .summary-header {
    grid-template-columns: 1fr;
  }
}
</style>