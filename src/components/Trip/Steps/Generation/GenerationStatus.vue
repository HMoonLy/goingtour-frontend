<template>
  <div v-if="generating" class="generation-status generating">
    <div class="status-content">
      <div class="status-icon">
        <el-icon size="64" color="#91A8D0" class="rotating">
          <Loading />
        </el-icon>
      </div>
      <div class="status-info">
        <h3 class="status-title">✨ AI正在为您工作...</h3>
        <p class="status-description">{{ generationProgress }}</p>
        
        <div class="progress-section">
          <el-progress
            :percentage="progressPercent"
            :stroke-width="8"
            :show-text="false"
            color="#91A8D0"
          />
          <div class="progress-details">
            <span class="progress-percentage">{{ progressPercent }}%</span>
            <span class="progress-time">
              预计剩余：{{ Math.max(0, Math.ceil((100 - progressPercent) * 1.2)) }}秒
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="generation-actions">
      <el-button type="danger" size="large" @click="$emit('cancel-generation')">
        <el-icon><Close /></el-icon>
        取消生成
      </el-button>
    </div>
  </div>

  <div v-if="generatedTrip && !generating" class="generation-status complete">
    <div class="status-content">
      <div class="status-icon success">
        <el-icon size="64" color="#67C23A">
          <Check />
        </el-icon>
      </div>
      <div class="status-info">
        <h3 class="status-title success">🎉 行程生成完成！</h3>
        <p class="status-description">
          已为您推荐 {{ generatedTrip?.attractions?.length || 0 }} 个景点和 
          {{ generatedTrip?.restaurants?.length || 0 }} 家餐厅
        </p>
      </div>
    </div>
    
    <div class="generation-actions">
      <el-button type="primary" size="large" @click="$emit('next-step')">
        查看详细行程
        <el-icon><ArrowRight /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script>
import { Loading, Close, Check, ArrowRight } from "@element-plus/icons-vue";

export default {
  name: "GenerationStatus",
  components: { Loading, Close, Check, ArrowRight },
  props: {
    generating: Boolean,
    generatedTrip: Object,
    generationProgress: String,
    progressPercent: Number
  },
  emits: ["cancel-generation", "next-step"]
};
</script>

<style scoped>
.generation-status {
  text-align: center;
  padding: 48px 32px;
  margin: 32px 0;
  border-radius: 20px;
  border: 1px solid #e8eaed;
  position: relative;
  overflow: hidden;
}

.generation-status.generating {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.generation-status.complete {
  background: linear-gradient(135deg, #f0fff4 0%, #ecfdf5 100%);
  border-color: #d1fae5;
}

.generation-status::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, transparent, #91a8d0, transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.status-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
}

.status-icon {
  position: relative;
}

.status-icon.success {
  animation: bounce 0.8s ease-out;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

.rotating {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.status-info {
  max-width: 500px;
  width: 100%;
}

.status-title {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 700;
  color: #1e40af;
}

.status-title.success {
  color: #059669;
}

.status-description {
  margin: 0 0 24px;
  font-size: 16px;
  color: #374151;
  line-height: 1.5;
}

.progress-section {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.progress-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 14px;
}

.progress-percentage {
  font-weight: 600;
  color: #1e40af;
}

.progress-time {
  color: #6b7280;
}

.generation-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.generation-actions .el-button {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  min-width: 120px;
  transition: all 0.3s ease;
}

.generation-actions .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .generation-status {
    padding: 32px 20px;
    margin: 24px 0;
  }

  .status-title {
    font-size: 20px;
  }

  .status-description {
    font-size: 14px;
  }
}
</style>

