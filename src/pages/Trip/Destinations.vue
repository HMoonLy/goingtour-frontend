<template>
  <div class="destinations">
    <!-- 搜索部分 -->
    <div class="search-section">
      <!-- 搜索框 -->
      <el-input
        v-model="searchKeyword"
        placeholder="搜索更多城市..."
        size="large"
        class="search-input"
        clearable
        @input="debouncedSearch"
        @clear="loadCities"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <!-- 字母筛选 -->
      <div class="filter-buttons">
        <el-button 
          v-for="letter in ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']" 
          :key="letter"
          :type="selectedLetter === letter ? 'primary' : ''"
          size="small"
          @click="filterByLetter(letter)"
        >
          {{ letter }}
        </el-button>
        <el-button 
          :type="selectedLetter === 'all' ? 'primary' : ''"
          size="small"
          @click="filterByLetter('all')"
        >
          热门
        </el-button>
      </div>
    </div>
    
    <!-- 城市列表 -->
    <div class="cities-section">      
      <!-- Loading状态 -->
      <div v-if="loading" class="loading-container">
        <el-loading-directive class="loading-text">
          <p>正在加载城市数据...</p>
        </el-loading-directive>
      </div>
      
      <!-- 城市网格 -->
      <div v-else class="cities-grid">
        <div 
          v-for="city in displayCities" 
          :key="city.code"
          class="city-item"
          @click="selectCity(city)"
        >
          <div 
            class="city-image" 
            :class="{ 'image-error': imageErrors[city.code] || !city.image }"
            :style="{ backgroundImage: (imageErrors[city.code] || !city.image) ? 'none' : `url(${city.image})` }"
          >
            <!-- 隐藏的img用于检测图片加载状态 -->
            <img 
              v-if="city.image"
              :src="city.image" 
              :alt="city.name || '城市图片'" 
              style="display: none;"
              @error="handleImageError(city.code)"
              @load="handleImageLoad(city.code)"
            >
          </div>
          <div class="city-info">
            <h3>{{ city.name || '未知城市' }}</h3>
            <p>{{ city.description || '暂无描述' }}</p>
            <div class="city-tags">
              <el-tag v-for="tag in (city.highlights || []).slice(0, 2)" :key="tag" size="small">
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="!loading && displayCities.length === 0" class="empty-state">
        <p>暂无城市数据</p>
        <el-button @click="loadCities" type="primary">重新加载</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Star, Filter } from '@element-plus/icons-vue'
import { dataApi } from '@/api/data.js'

export default {
  name: 'Destinations',
  components: {
    Search,
    Star,
    Filter
  },
  setup() {
    const router = useRouter()
    
    // 响应式数据
    const searchKeyword = ref('')
    const selectedLetter = ref('all')
    const cities = ref([])
    const loading = ref(false)
    const isSearching = ref(false) // 标记是否在搜索模式
    
    // 图片加载错误状态
    const imageErrors = ref({})
    
    // 图片错误处理方法
    const handleImageError = (cityCode) => {
      imageErrors.value[cityCode] = true
      console.warn(`图片加载失败: ${cityCode}`)
    }
    
    const handleImageLoad = (cityCode) => {
      imageErrors.value[cityCode] = false
    }

    // 加载热门城市数据
    const loadCities = async () => {
      try {
        loading.value = true
        isSearching.value = false
        const response = await dataApi.getPopularCities(8)
        
        if (response && response.data) {
          cities.value = response.data
          console.log('成功加载热门城市数据:', cities.value.length, '个城市')
        } else {
          console.warn('热门城市数据响应格式异常:', response)
          ElMessage.warning('城市数据加载异常')
        }
        
      } catch (error) {
        console.error('加载热门城市数据失败:', error)
        ElMessage.error('加载城市数据失败，请刷新重试')
        cities.value = getFallbackCities()
      } finally {
        loading.value = false
      }
    }

    // 搜索城市数据
    const searchCitiesData = async (keyword) => {
      if (!keyword || keyword.trim() === '') {
        // 如果搜索关键词为空，重新加载热门城市
        loadCities()
        return
      }
      
      try {
        loading.value = true
        isSearching.value = true
        const response = await dataApi.searchCities(keyword.trim())
        
        if (response && response.data) {
          cities.value = response.data
          console.log('搜索到城市数据:', cities.value.length, '个城市')
        } else {
          cities.value = []
        }
        
      } catch (error) {
        console.error('搜索城市失败:', error)
        ElMessage.error('搜索失败，请重试')
        cities.value = []
      } finally {
        loading.value = false
      }
    }

    // 按字母筛选城市数据
    const filterCitiesByLetter = async (letter) => {
      if (letter === 'all') {
        // 显示热门城市
        loadCities()
        return
      }
      
      try {
        loading.value = true
        isSearching.value = true
        const response = await dataApi.getCitiesByLetter(letter)
        
        if (response && response.data) {
          cities.value = response.data
          console.log('按字母筛选到城市数据:', cities.value.length, '个城市')
        } else {
          cities.value = []
        }
        
      } catch (error) {
        console.error('按字母筛选城市失败:', error)
        ElMessage.error('筛选失败，请重试')
        cities.value = []
      } finally {
        loading.value = false
      }
    }

    // 备用城市数据（API失败时使用）
    const getFallbackCities = () => {
      return [
        {
          code: 'beijing',
          name: '北京',
          firstLetter: 'B',
          description: '千年古都，文化底蕴深厚',
          image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=250&fit=crop',
          highlights: ['历史古迹', '皇家建筑', '传统文化', '现代都市']
        },
        {
          code: 'shanghai',
          name: '上海',
          firstLetter: 'S',
          description: '国际化大都市，东西文化交汇',
          image: 'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=400&h=250&fit=crop',
          highlights: ['现代建筑', '外滩夜景', '时尚购物', '美食天堂']
        }
      ]
    }

    // 显示的城市列表（简化，因为数据已从API获取）
    const displayCities = computed(() => {
      return cities.value || []
    })

    // 方法
    const filterByLetter = (letter) => {
      selectedLetter.value = letter
      // 清空搜索关键词
      searchKeyword.value = ''
      // 调用API获取对应字母的城市
      filterCitiesByLetter(letter)
    }

    // 处理搜索输入变化
    const handleSearchInput = () => {
      // 清空字母筛选
      selectedLetter.value = 'all'
      // 调用搜索API
      searchCitiesData(searchKeyword.value)
    }

    // 防抖搜索
    let searchTimer = null
    const debouncedSearch = () => {
      clearTimeout(searchTimer)
      searchTimer = setTimeout(() => {
        handleSearchInput()
      }, 500) // 500ms防抖
    }

    const selectCity = (city) => {
      console.log('选择城市:', city.name, city.code)
      
      // 跳转到创建行程页面，并传递选中的城市
      router.push({
        name: 'TripCreate',
        query: {
          city: city.code,
          cityName: city.name
        }
      })
    }

    // 生命周期 - 组件挂载时加载数据
    onMounted(() => {
      loadCities()
    })

    return {
      searchKeyword,
      selectedLetter,
      cities,
      loading,
      displayCities,
      filterByLetter,
      selectCity,
      imageErrors,
      handleImageError,
      handleImageLoad,
      loadCities,
      debouncedSearch,
      handleSearchInput
    }
  }
}
</script>

<style scoped>
/* 统一的页面布局 - 与Personal.vue保持一致 */
.destinations {
  position: fixed !important;
  top: 64px !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: calc(100vh - 64px) !important;
  margin: 0 !important;
  padding: 0 !important;
  background: #f5f5f5 !important;
  overflow-y: auto !important;
  z-index: 1 !important;
}

/* 重置可能影响布局的样式 */
.destinations * {
  box-sizing: border-box !important;
}

/* 搜索部分 - 固定在顶部 */
.search-section {
  background: white !important;
  padding: 20px !important;
  text-align: center !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important;
  height: 160px !important;
  box-sizing: border-box !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 10 !important;
}

/* 城市列表 - 可滚动内容区域 */
.cities-section {
  max-width: 1200px !important;
  margin: 0 auto !important;
  padding: 15px !important;
  box-sizing: border-box !important;
}

.search-section h2 {
  font-size: 28px;
  color: #303133;
  margin: 0 0 20px 0;
  font-weight: 600;
}

.search-input {
  max-width: 600px;
  margin: 0 auto 20px auto;
}

.search-input :deep(.el-input__inner) {
  border-radius: 25px;
  padding-left: 10px;
  height: 40px;
  font-size: 14px;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  overflow: visible;
  padding: 0 10px;
}

.filter-buttons .el-button {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  font-size: 13px;
  flex-shrink: 0;
  border-radius: 4px;
}

/* 城市网格 - 优化以适应大量城市 */
.cities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* 自适应列数，最小宽度280px */
  gap: 15px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 当屏幕足够大时，最多显示4列 */
@media (min-width: 1200px) {
  .cities-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 城市项目 - 紧凑版本 */
.city-item {
  background: white;
  border-radius: 8px; /* 从12px减小到8px */
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  height: 240px; /* 从280px减小到240px */
  position: relative;
}

.city-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

/* Loading状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #606266;
}

.loading-text {
  text-align: center;
}

.loading-text p {
  margin-top: 16px;
  font-size: 16px;
  color: #909399;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #909399;
  text-align: center;
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 20px;
}

/* 城市图片 - 添加错误处理和备用显示 */
.city-image {
  position: relative;
  height: 140px;
  overflow: hidden;
  background-color: #f0f2f5;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: transform 0.3s ease;
}

/* 图片加载失败时的备用显示 */
.city-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.city-image::after {
  content: '📍';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

/* 当图片加载失败时显示备用内容 */
.city-image.image-error::before,
.city-image.image-error::after {
  opacity: 1;
}

.city-item:hover .city-image {
  transform: scale(1.05);
}

/* 城市信息 - 减小内边距 */
.city-info {
  padding: 15px; /* 从24px减小到15px */
}

.city-info h3 {
  font-size: 18px; /* 从24px减小到18px */
  color: #303133;
  margin: 0 0 6px 0; /* 减小间距 */
}

.city-info p {
  color: #606266;
  font-size: 13px; /* 从15px减小到13px */
  line-height: 1.4; /* 从1.6减小到1.4 */
  margin: 0 0 10px 0; /* 减小间距 */
}

.city-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px; /* 从8px减小到6px */
}

.city-tags .el-tag {
  font-size: 11px; /* 从12px减小到11px */
}

/* 状态提示样式 */
.status-tip {
  text-align: center;
  margin-bottom: 20px;
  padding: 12px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
}

.status-tip p {
  margin: 0;
  font-size: 14px;
  color: #606266;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.status-tip .el-icon {
  font-size: 16px;
  color: #409EFF;
}

/* 响应式设计 - 修复移动端布局 */
/* 中大屏幕 - 3-4列 */
@media (max-width: 1200px) and (min-width: 768px) {
  .cities-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 15px;
  }
}

/* 中等屏幕 - 强制2列 */
@media (max-width: 767px) and (min-width: 480px) {
  .cities-grid {
    grid-template-columns: repeat(2, 1fr); /* 强制2列，避免auto-fit导致的宽度问题 */
    gap: 12px;
  }
  
  .cities-section {
    padding: 12px;
  }
  
  .search-section {
    padding: 15px 12px;
    height: 140px;
  }
  
  .destinations {
    padding-top: 70px;
  }
  
  .city-image {
    height: 120px;
  }
  
  .city-info {
    padding: 12px;
  }
  
  .city-info h3 {
    font-size: 16px;
  }
  
  .city-info p {
    font-size: 12px;
  }
}

/* 小屏幕 - 单列 */
@media (max-width: 479px) {
  .cities-grid {
    grid-template-columns: 1fr; /* 只有很小的屏幕才使用单列 */
    gap: 10px;
  }
  
  .cities-section {
    padding: 10px;
  }
  
  .search-section {
    padding: 12px 10px;
    height: 120px;
  }
  
  .destinations {
    padding-top: 70px;
  }
  
  .city-image {
    height: 140px; /* 单列时可以稍微高一些 */
  }
  
  .city-info {
    padding: 12px;
  }
  
  .city-info h3 {
    font-size: 16px;
  }
  
  .city-info p {
    font-size: 12px;
  }
}
</style> 