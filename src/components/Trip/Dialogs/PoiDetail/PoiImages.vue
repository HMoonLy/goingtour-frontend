<template>
  <div v-if="images.length > 0" class="poi-images">
    <h3 class="section-title">
      <el-icon><Picture /></el-icon>
      实景图片
    </h3>
    <div class="images-grid">
      <el-image
        v-for="(image, index) in images.slice(0, 6)"
        :key="`poi-image-${index}`"
        :src="image.url"
        :alt="image.alt || poi.name"
        fit="cover"
        class="poi-image"
        :preview-src-list="allImageUrls"
        :initial-index="index"
        :preview-teleported="true"
        :z-index="3000"
        lazy
        @click="handleImageClick(index)"
      >
        <template #error>
          <div class="image-error">
            <el-icon><Picture /></el-icon>
          </div>
        </template>
      </el-image>
    </div>
    <div v-if="images.length > 6" class="more-images">
      还有 {{ images.length - 6 }} 张图片...
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Picture } from '@element-plus/icons-vue'
import { usePoiData } from '@/composables/trip/usePoiData'

const props = defineProps({
  poi: {
    type: Object,
    required: true
  }
})

const { getImages } = usePoiData(props.poi)

const images = computed(() => getImages())
const allImageUrls = computed(() => images.value.map(img => img.url))

const handleImageClick = (index) => {
  console.log(`点击了第 ${index + 1} 张图片`)
}
</script>

<style scoped>
.poi-images {
  margin-bottom: 32px;
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

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.poi-image {
  width: 100%;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.poi-image:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #c0c4cc;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-size: 24px;
}

.more-images {
  margin-top: 12px;
  text-align: center;
  color: #909399;
  font-size: 14px;
  font-style: italic;
}

@media (max-width: 768px) {
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }
  
  .poi-image {
    height: 100px;
  }
  
  .section-title {
    font-size: 16px;
    margin-bottom: 16px;
  }
}

@media (max-width: 480px) {
  .images-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>

