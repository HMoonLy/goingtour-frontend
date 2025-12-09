<template>
  <div class="poi-content">
    <!-- 描述信息 -->
    <div v-if="description" class="description-section">
      <h3 class="section-title">
        <el-icon><Document /></el-icon>
        详细介绍
      </h3>
      <div class="description-content">
        {{ description }}
      </div>
    </div>

    <!-- AI推荐理由 -->
    <div v-if="poi.reasoning || poi.reason" class="reasoning-section">
      <h3 class="section-title">
        <el-icon><StarFilled /></el-icon>
        推荐理由
      </h3>
      <div class="reasoning-content">
        {{ poi.reasoning || poi.reason }}
      </div>
    </div>

    <!-- 匹配偏好 -->
    <div v-if="poi.matchedPreferences?.length" class="preferences-section">
      <h3 class="section-title">
        <el-icon><CollectionTag /></el-icon>
        匹配偏好
      </h3>
      <div class="preferences-tags">
        <el-tag
          v-for="preference in poi.matchedPreferences"
          :key="preference"
          size="large"
          type="info"
          effect="plain"
        >
          {{ preference }}
        </el-tag>
      </div>
    </div>

    <!-- 标签 -->
    <div v-if="tags.length > 0" class="tags-section">
      <h3 class="section-title">
        <el-icon><PriceTag /></el-icon>
        相关标签
      </h3>
      <div class="tags-container">
        <el-tag
          v-for="tag in tags"
          :key="tag"
          size="default"
          effect="plain"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Document, StarFilled, CollectionTag, PriceTag } from '@element-plus/icons-vue'
import { usePoiData } from '@/composables/trip/usePoiData'

const props = defineProps({
  poi: {
    type: Object,
    required: true
  }
})

const { getDescription, getTags } = usePoiData(props.poi)

const description = computed(() => getDescription())
const tags = computed(() => getTags())
</script>

<style scoped>
.description-section,
.reasoning-section,
.preferences-section,
.tags-section {
  margin-bottom: 28px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  padding-bottom: 8px;
  border-bottom: 2px solid #e8f4fd;
}

.section-title .el-icon {
  color: #409eff;
  font-size: 20px;
}

.description-content,
.reasoning-content {
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  color: #495057;
  line-height: 1.7;
  border: 1px solid #e8f4fd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  font-size: 15px;
}

.reasoning-content {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%);
  border-left: 4px solid #ffc107;
  border-color: rgba(255, 193, 7, 0.3);
}

.preferences-tags,
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.preferences-tags .el-tag,
.tags-container .el-tag {
  border-radius: 20px;
  padding: 8px 16px;
  font-weight: 500;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.preferences-tags .el-tag:hover,
.tags-container .el-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .section-title {
    font-size: 16px;
    margin-bottom: 16px;
  }
  
  .description-content,
  .reasoning-content {
    padding: 16px;
    font-size: 14px;
  }
}
</style>

