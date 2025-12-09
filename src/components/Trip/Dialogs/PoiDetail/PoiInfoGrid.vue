<template>
  <div class="details-grid">
    <!-- 基本信息 -->
    <div class="detail-section">
      <h3 class="section-title">
        <el-icon><InfoFilled /></el-icon>
        基本信息
      </h3>
      <div class="detail-items">
        <div v-if="address" class="detail-item">
          <span class="label">地址:</span>
          <span class="value">{{ address }}</span>
        </div>
        <div v-if="telephone" class="detail-item">
          <span class="label">电话:</span>
          <span class="value">{{ telephone }}</span>
        </div>
        <div v-if="openTime" class="detail-item">
          <span class="label">营业时间:</span>
          <span class="value">{{ openTime }}</span>
        </div>
        <div v-if="businessArea" class="detail-item">
          <span class="label">商圈:</span>
          <span class="value">{{ businessArea }}</span>
        </div>
        <div v-if="district" class="detail-item">
          <span class="label">所在区域:</span>
          <span class="value">{{ district }}</span>
        </div>
        <div v-if="website" class="detail-item">
          <span class="label">官网:</span>
          <a :href="website" target="_blank" class="value link">
            {{ website }}
          </a>
        </div>
        <div v-if="poi.adcode" class="detail-item">
          <span class="label">行政代码:</span>
          <span class="value">{{ poi.adcode }}</span>
        </div>
      </div>
    </div>

    <!-- 位置信息 -->
    <div v-if="coordinates" class="detail-section">
      <h3 class="section-title">
        <el-icon><MapLocation /></el-icon>
        位置信息
      </h3>
      <div class="detail-items">
        <div class="detail-item">
          <span class="label">坐标:</span>
          <span class="value">
            {{ formatCoordinates(coordinates) }}
          </span>
        </div>
        <div v-if="poi.cityname" class="detail-item">
          <span class="label">城市:</span>
          <span class="value">{{ poi.cityname }}</span>
        </div>
        <div class="map-actions">
          <el-button
            size="small"
            type="primary"
            @click="openInMap"
          >
            <el-icon><MapLocation /></el-icon>
            在地图中查看
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { InfoFilled, MapLocation } from '@element-plus/icons-vue'
import { usePoiData } from '@/composables/trip/usePoiData'

const props = defineProps({
  poi: {
    type: Object,
    required: true
  }
})

const {
  getAddress,
  getTelephone,
  getOpenTime,
  getBusinessArea,
  getDistrict,
  getWebsite,
  getCoordinates
} = usePoiData(props.poi)

const address = computed(() => getAddress())
const telephone = computed(() => getTelephone())
const openTime = computed(() => getOpenTime())
const businessArea = computed(() => getBusinessArea())
const district = computed(() => getDistrict())
const website = computed(() => getWebsite())
const coordinates = computed(() => getCoordinates())

const formatCoordinates = (coords) => {
  if (!coords || !Array.isArray(coords) || coords.length < 2) {
    return '坐标信息不可用'
  }
  const [lng, lat] = coords
  return `经度: ${lng.toFixed(6)}, 纬度: ${lat.toFixed(6)}`
}

const openInMap = () => {
  const coords = coordinates.value
  if (coords && Array.isArray(coords) && coords.length >= 2) {
    const [lng, lat] = coords
    // 打开高德地图
    const url = `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent(props.poi.name)}`
    window.open(url, '_blank')
  }
}
</script>

<style scoped>
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.detail-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e8f4fd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.detail-section:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
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

.detail-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f2f5;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 90px;
  flex-shrink: 0;
  font-size: 14px;
}

.detail-item .value {
  color: #34495e;
  word-break: break-all;
  line-height: 1.5;
  font-size: 14px;
}

.detail-item .value.link {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}

.detail-item .value.link:hover {
  text-decoration: underline;
  color: #66b1ff;
}

.map-actions {
  margin-top: 16px;
}

@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 24px;
  }
  
  .detail-section {
    padding: 20px;
  }
  
  .section-title {
    font-size: 16px;
    margin-bottom: 16px;
  }
}

@media (max-width: 480px) {
  .detail-section {
    padding: 12px;
  }
}
</style>

