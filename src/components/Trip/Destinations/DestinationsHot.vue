<template>
  <div class="city-section hot-destinations-section" id="hot-cities">
    <h2><i class="hot-icon">🔥</i> 热门目的地</h2>
    <div v-if="destinations?.length > 0" class="hot-destinations-grid">
      <div
        v-for="city in destinations"
        :key="city.name"
        class="hot-destination-card"
        @click="$emit('select', { 中文名: city.name, adcode: city.adcode })"
      >
        <LazyImage
          :src="city.cover"
          :alt="city.name"
          :height="200"
          :show-skeleton="true"
          class="destination-image"
        >
          <div class="destination-overlay">
            <div class="destination-tags">
              <span v-for="tag in city.tags" :key="tag" class="destination-tag">
                {{ tag }}
              </span>
            </div>
          </div>
        </LazyImage>
        <div class="destination-info">
          <h3 class="destination-name">
            {{ city.name.replace("市", "") }}
          </h3>
          <p class="destination-description">
            {{ city.description }}
          </p>
        </div>
      </div>
    </div>
    <div v-else class="loading-placeholder">
      <el-skeleton :rows="3" animated />
    </div>
  </div>
</template>

<script setup>
import LazyImage from "@/components/Common/UI/LazyImage.vue";

defineProps({
  destinations: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["select"]);
</script>

<style scoped>
.city-section {
  margin: 0 0 24px 0;
  padding: 20px;
  background: var(--card-bg, #fff);
  border-radius: 8px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  transition: all 0.3s;
}

.city-section h2 {
  font-size: 20px;
  color: #303133;
  margin: 0 0 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  font-weight: 600;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--card-bg, #fff);
}

.hot-icon {
  font-style: normal;
  margin-right: 8px;
  font-size: 18px;
  color: #f56c6c;
}

.hot-destinations-section {
  margin-bottom: 32px;
}

.hot-destinations-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 16px;
}

.hot-destination-card {
  position: relative;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.hot-destination-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.destination-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.destination-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.6) 100%);
  display: flex;
  align-items: flex-end;
  padding: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
  will-change: opacity;
}

.hot-destination-card:hover .destination-overlay {
  opacity: 1;
}

.destination-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.destination-tag {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

.destination-info {
  padding: 16px 20px 20px;
}

.destination-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.destination-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Responsive */
@media (max-width: 1200px) {
  .hot-destinations-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
}

@media (max-width: 992px) {
  .hot-destinations-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .hot-destinations-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .destination-image {
    height: 160px;
  }

  .destination-info {
    padding: 14px 16px 18px;
  }

  .destination-name {
    font-size: 16px;
  }

  .destination-description {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .hot-destinations-grid {
    grid-template-columns: 1fr;
  }
}
</style>

