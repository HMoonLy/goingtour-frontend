<template>
  <div class="wishlist-summary">
    <div class="summary-header">
      <div class="header-left">
        <h3 class="section-title">
          <el-icon><Star /></el-icon>
          我的愿望清单
        </h3>
        <el-tag 
          v-if="wishlistStore.wishlistCount > 0" 
          size="small" 
          type="primary"
          class="count-tag"
        >
          {{ wishlistStore.wishlistCount }} 个城市
        </el-tag>
      </div>

      <div class="header-actions">
        <el-button
          size="small"
          type="primary"
          plain
          @click="$router.push('/wishlist')"
        >
          管理愿望清单
        </el-button>
      </div>
    </div>

    <!-- 城市列表 -->
    <div v-if="wishlistStore.hasCities" class="cities-grid">
      <div
        v-for="item in displayCities"
        :key="item.id"
        class="city-summary-card"
        :class="{ 'current-weather': isCurrentWeatherCity(item) }"
        @click="handleCityClick(item)"
      >
        <!-- 当前天气城市指示 -->
        <div v-if="isCurrentWeatherCity(item)" class="weather-indicator">
          <el-icon><View /></el-icon>
        </div>

        <div class="city-content">
          <h4 class="city-name">{{ item.cityName }}</h4>
          
          <!-- 第一个标签（如果有） -->
          <div v-if="item.tags && item.tags.length > 0" class="city-tag">
            <el-tag size="small" effect="plain">
              {{ item.tags[0] }}
            </el-tag>
          </div>
        </div>

        <!-- 快速操作 -->
        <div class="quick-actions">
          <el-button
            size="small"
            type="primary"
            plain
            :icon="Calendar"
            @click.stop="handlePlanTrip(item)"
          >
            规划行程
          </el-button>
          <el-button
            size="small"
            type="success"
            plain
            :icon="Sunny"
            @click.stop="handleViewWeather(item)"
          >
          查看天气
          </el-button>
        </div>
      </div>

      <!-- 显示更多按钮 -->
      <div 
        v-if="wishlistStore.wishlistCount > maxDisplayCount"
        class="more-cities-card"
        @click="$router.push('/wishlist')"
      >
        <div class="more-content">
          <el-icon><Plus /></el-icon>
          <span>更多</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-icon size="48" color="#C0C4CC">
        <Star />
      </el-icon>
      <p>还没有添加心仪的目的地</p>
      <div class="empty-actions">
        <el-button 
          size="small" 
          type="primary" 
          @click="$router.push('/wishlist')"
        >
          <el-icon><Plus /></el-icon>
          添加第一个城市
        </el-button>
      </div>
    </div>

    <!-- 天气提示 -->
    <div v-if="currentWeatherCity" class="weather-hint">
      <el-icon><Sunny /></el-icon>
      <span>正在显示 <strong>{{ currentWeatherCity.cityName }}</strong> 的天气</span>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { 
  Star, 
  Plus, 
  Calendar, 
  Sunny, 
  View 
} from '@element-plus/icons-vue';
import { useWishlistStore } from '@/store/wishlist.js';

export default {
  name: 'WishlistSummary',
  components: {
    Star,
    Plus,
    Calendar,
    Sunny,
    View,
  },
  emits: ['weather-city-change'],
  setup(props, { emit }) {
    const router = useRouter();
    const wishlistStore = useWishlistStore();

    // 显示的最大城市数量
    const maxDisplayCount = ref(5);

    // 显示的城市列表（最新的几个）
    const displayCities = computed(() => {
      return wishlistStore.wishlistItems
        .slice() // 创建副本避免修改原数组
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, maxDisplayCount.value);
    });

    // 当前天气城市
    const currentWeatherCity = computed(() => {
      return wishlistStore.currentWeatherCity;
    });

    // 检查是否为当前天气城市
    const isCurrentWeatherCity = (item) => {
      return wishlistStore.currentWeatherCity?.id === item.id;
    };

    // 处理城市点击
    const handleCityClick = (city) => {
      // 可以添加其他交互，比如显示详情弹窗
      console.log('City clicked:', city);
    };

    // 规划行程
    const handlePlanTrip = (city) => {
      router.push({
        path: '/trip/create',
        query: {
          city: city.cityCode,
          cityName: encodeURIComponent(city.cityName),
        },
      });
    };

    // 查看天气
    const handleViewWeather = (city) => {
      wishlistStore.setCurrentWeatherCity(city);
      emit('weather-city-change', city);
      ElMessage.success(`已切换到 ${city.cityName} 的天气预览`);
    };

    return {
      wishlistStore,
      maxDisplayCount,
      displayCities,
      currentWeatherCity,
      isCurrentWeatherCity,
      handleCityClick,
      handlePlanTrip,
      handleViewWeather,
    };
  }
};
</script>

<style scoped>
.wishlist-summary {
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(99, 102, 241, 0.08);
  box-shadow: 
    0 2px 12px rgba(0, 0, 0, 0.04),
    0 1px 4px rgba(99, 102, 241, 0.06);
}

/* 头部 */
.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title .el-icon {
  color: #6366f1;
  font-size: 20px;
}

.count-tag {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #ffffff;
  border: none;
  font-weight: 500;
}

/* 城市网格 */
.cities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.city-summary-card {
  position: relative;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.city-summary-card:hover {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}

.city-summary-card.current-weather {
  border-color: rgba(34, 197, 94, 0.4);
  background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%);
}

.weather-indicator {
  position: absolute;
  top: 6px;
  right: 6px;
  color: #22c55e;
  font-size: 12px;
}

.city-content {
  flex: 1;
  margin-bottom: 8px;
}

.city-name {
  margin: 0 0 6px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.city-tag .el-tag {
  font-size: 10px;
  padding: 2px 6px;
  height: auto;
  line-height: 1.2;
}

.quick-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.quick-actions .el-button {
  padding: 4px;

}

/* 更多城市卡片 */
.more-cities-card {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 2px dashed rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
}

.more-cities-card:hover {
  border-color: rgba(99, 102, 241, 0.5);
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
  transform: translateY(-2px);
}

.more-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #6b7280;
  font-size: 12px;
  text-align: center;
}

.more-content .el-icon {
  font-size: 20px;
  color: #6366f1;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: #6b7280;
}

.empty-state p {
  margin: 12px 0 16px 0;
  font-size: 14px;
}

.empty-actions {
  display: flex;
  justify-content: center;
}

/* 天气提示 */
.weather-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 8px;
  font-size: 12px;
  color: #065f46;
  border-left: 3px solid #22c55e;
}

.weather-hint .el-icon {
  color: #22c55e;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .wishlist-summary {
    padding: 16px;
  }

  .summary-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .header-left {
    justify-content: space-between;
  }

  .cities-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .city-summary-card {
    min-height: 70px;
    padding: 10px;
  }

  .city-name {
    font-size: 13px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .wishlist-summary {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border-color: rgba(99, 102, 241, 0.2);
  }

  .section-title {
    color: #f9fafb;
  }

  .city-summary-card {
    background: #374151;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .city-summary-card.current-weather {
    background: linear-gradient(135deg, #064e3b 0%, #374151 100%);
    border-color: rgba(34, 197, 94, 0.4);
  }

  .city-name {
    color: #f9fafb;
  }

  .more-cities-card {
    background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
    border-color: rgba(99, 102, 241, 0.3);
  }

  .more-content {
    color: #d1d5db;
  }

  .empty-state {
    color: #d1d5db;
  }

  .weather-hint {
    background: rgba(34, 197, 94, 0.2);
    color: #a7f3d0;
  }
}
</style>