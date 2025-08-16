<template>
  <div 
    class="city-card photo-wall" 
    :class="{
      'is-favorited': isInWishlist,
      'is-processing': isProcessing,
      'has-description': hasDescription,
      'has-extra-info': hasExtraInfo
    }"
    @mouseenter="handleMouseEnter" 
    @mouseleave="handleMouseLeave"
    @click="handleCardClick"
  >
    <!-- 城市封面图片区域 -->
    <div class="city-cover">
      <img 
        v-if="cityImage" 
        :src="cityImage" 
        :alt="city.中文名"
        loading="lazy"
        class="cover-image"
        @error="handleImageError"
      />
      <div 
        v-else 
        class="cover-placeholder"
        :style="{ background: cityGradient }"
      >
        <div class="city-initial">{{ cityInitial }}</div>
      </div>
      
      <!-- 收藏状态指示器 -->
      <div v-if="isInWishlist" class="wishlist-badge">
        <el-icon><StarFilled /></el-icon>
      </div>
    </div>
    
    <!-- 城市信息内容区域 - 自适应高度 -->
    <div class="city-info-content">
      <div class="city-basic-info">
        <h3 class="city-name">{{ city.中文名 }}</h3>
        <p class="city-province">{{ provinceName }}</p>
      </div>
      
      <!-- 城市描述 - 可选内容 -->
      <div v-if="city.description" class="city-description">
        <p class="description-text">{{ city.description }}</p>
      </div>
      
      <!-- 额外信息：访问日期、标签等 -->
      <div v-if="hasExtraInfo" class="extra-info">
        <div v-if="city.visitDate" class="visit-info">
          <el-icon class="visit-icon"><Calendar /></el-icon>
          <span class="visit-date">{{ formatDate(city.visitDate) }}</span>
        </div>
        
        <div v-if="city.tags && city.tags.length > 0" class="city-tags">
          <el-tag 
            v-for="tag in city.tags.slice(0, 3)" 
            :key="tag" 
            size="small"
            effect="light"
            class="city-tag"
          >
            {{ tag }}
          </el-tag>
          <span v-if="city.tags.length > 3" class="more-tags">
            +{{ city.tags.length - 3 }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- 悬浮操作遮罩层 -->
    <Transition name="overlay-fade">
      <div v-show="showActions" class="action-overlay">
        <div class="overlay-content">
          <!-- 主要操作 - 中央突出显示 -->
          <el-button 
            type="primary" 
            size="large"
            @click.stop="handlePlanTrip"
            class="primary-action-btn"
          >
            <el-icon><MapLocation /></el-icon>
            <span>规划行程</span>
          </el-button>
          
          <!-- 次要操作 - 四角分布 -->
          <div class="secondary-actions">
            <el-tooltip content="查看详情" placement="top">
              <el-button 
                size="default" 
                circle 
                @click.stop="handleViewDetails"
                class="action-btn top-left"
              >
                <el-icon><View /></el-icon>
              </el-button>
            </el-tooltip>
            
            <el-tooltip content="编辑信息" placement="top">
              <el-button 
                size="default" 
                circle 
                @click.stop="handleEdit"
                class="action-btn top-right"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
            </el-tooltip>
            
            <el-tooltip 
              :content="isInWishlist ? '移除收藏' : '添加收藏'" 
              placement="bottom"
            >
              <el-button 
                size="default" 
                circle
                :type="isInWishlist ? 'warning' : 'default'"
                @click.stop="handleToggleWishlist"
                :loading="isProcessing"
                class="action-btn bottom-center"
              >
                <el-icon><Star /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { computed, ref, defineComponent, onMounted } from "vue";
import { 
  StarFilled, 
  Star, 
  MapLocation, 
  View, 
  Edit,
  Calendar 
} from "@element-plus/icons-vue";

export default defineComponent({
  name: "CityCard",
  components: {
    StarFilled,
    Star,
    MapLocation,
    View,
    Edit,
    Calendar,
  },
  props: {
    city: {
      type: Object,
      required: true,
    },
    isInWishlist: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["selectCity", "toggleWishlist", "planTrip", "viewDetails", "edit"],
  setup(props, { emit }) {
    const isProcessing = ref(false);
    const showActions = ref(false);
    const isMobile = ref(false);

    // 检测设备类型
    onMounted(() => {
      isMobile.value = window.innerWidth <= 768;
      
      // 监听窗口大小变化
      const handleResize = () => {
        isMobile.value = window.innerWidth <= 768;
      };
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    });

    // 计算省份名称
    const provinceName = computed(() => {
      const adcode = String(props.city.adcode || "");
      if (!adcode || adcode.length < 2) return "";

      const provinceCode = adcode.substring(0, 2);
      const provinceMap = {
        11: "北京市",
        12: "天津市",
        13: "河北省",
        14: "山西省",
        15: "内蒙古",
        21: "辽宁省",
        22: "吉林省",
        23: "黑龙江省",
        31: "上海市",
        32: "江苏省",
        33: "浙江省",
        34: "安徽省",
        35: "福建省",
        36: "江西省",
        37: "山东省",
        41: "河南省",
        42: "湖北省",
        43: "湖南省",
        44: "广东省",
        45: "广西",
        46: "海南省",
        50: "重庆市",
        51: "四川省",
        52: "贵州省",
        53: "云南省",
        54: "西藏",
        61: "陕西省",
        62: "甘肃省",
        63: "青海省",
        64: "宁夏",
        65: "新疆",
        71: "台湾省",
        81: "香港",
        82: "澳门",
      };
      return provinceMap[provinceCode] || "";
    });

    // 城市背景图片
    const cityImage = computed(() => {
      // 优先使用城市自带的图片
      if (props.city.coverImage) return props.city.coverImage;
      
      // 根据城市名称生成默认背景
      return getCityDefaultImage(props.city.中文名);
    });

    // 是否有额外信息显示
    const hasExtraInfo = computed(() => {
      return props.city.visitDate || (props.city.tags && props.city.tags.length > 0);
    });

    // 是否有描述信息
    const hasDescription = computed(() => {
      return props.city.description && props.city.description.trim().length > 0;
    });

    // 城市首字母
    const cityInitial = computed(() => {
      return props.city.中文名 ? props.city.中文名.charAt(0) : '城';
    });

    // 城市渐变色
    const cityGradient = computed(() => {
      const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
      ];
      
      // 根据城市名称生成固定的渐变色
      const hash = props.city.中文名.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0);
      }, 0);
      
      return gradients[hash % gradients.length];
    });

    // 获取城市默认图片
    const getCityDefaultImage = (cityName) => {
      // 热门城市的默认图片映射
      const cityImageMap = {
        "北京市": "/images/cities/beijing.jpg",
        "上海市": "/images/cities/shanghai.jpg",
        "深圳市": "/images/cities/shenzhen.jpg",
        "广州市": "/images/cities/guangzhou.jpg",
        "杭州市": "/images/cities/hangzhou.jpg",
        "成都市": "/images/cities/chengdu.jpg",
        "西安市": "/images/cities/xian.jpg",
        "武汉市": "/images/cities/wuhan.jpg",
        "南京市": "/images/cities/nanjing.jpg",
        "重庆市": "/images/cities/chongqing.jpg",
        // 可以继续添加更多城市
      };
      
      return cityImageMap[cityName] || null;
    };

    // 格式化日期
    const formatDate = (date) => {
      if (!date) return "";
      const d = new Date(date);
      return d.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    };

    // 卡片点击处理
    const handleCardClick = () => {
      if (!showActions.value) {
        emit("selectCity", props.city);
      }
    };

    // 规划行程
    const handlePlanTrip = () => {
      emit("planTrip", props.city);
    };

    // 查看详情
    const handleViewDetails = () => {
      emit("viewDetails", props.city);
    };

    // 编辑信息
    const handleEdit = () => {
      emit("edit", props.city);
    };

    // 防抖处理收藏切换
    let toggleTimeout;
    const handleToggleWishlist = () => {
      if (isProcessing.value) return;

      clearTimeout(toggleTimeout);
      toggleTimeout = setTimeout(async () => {
        isProcessing.value = true;

        try {
          await emit("toggleWishlist", props.city);
        } finally {
          // 添加短暂延迟，让用户看到反馈
          setTimeout(() => {
            isProcessing.value = false;
          }, 300);
        }
      }, 50);
    };

    // 图片加载错误处理
    const handleImageError = (event) => {
      console.log('Image load error:', event.target.src);
      // 图片加载失败时，隐藏图片元素，显示占位符
      event.target.style.display = 'none';
    };

    // 鼠标进入处理 - 延迟显示操作栏
    let hoverTimeout;
    const handleMouseEnter = () => {
      if (isMobile.value) return;
      
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        showActions.value = true;
      }, 150); // 延迟150ms显示，避免意外触发
    };

    // 鼠标离开处理
    const handleMouseLeave = () => {
      clearTimeout(hoverTimeout);
      showActions.value = false;
    };

    // 移动端长按处理
    const handleLongPress = () => {
      if (isMobile.value) {
        showActions.value = !showActions.value;
      }
    };

    return {
      isProcessing,
      showActions,
      isMobile,
      provinceName,
      cityImage,
      hasExtraInfo,
      hasDescription,
      cityInitial,
      cityGradient,
      formatDate,
      handleCardClick,
      handlePlanTrip,
      handleViewDetails,
      handleEdit,
      handleToggleWishlist,
      handleImageError,
      handleMouseEnter,
      handleMouseLeave,
      handleLongPress,
    };
  },
});
</script>

<style scoped>
/* ===== 照片墙风格的城市卡片 ===== */
.city-card.photo-wall {
  position: relative;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.04);
  
  /* 关键：自适应高度，像照片墙一样 */
  height: auto;
  min-height: 240px;
  
  /* 防止卡片被挤压变形 */
  break-inside: avoid;
  
  /* 性能优化 */
  will-change: transform;
  backface-visibility: hidden;
}

.city-card.photo-wall:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 16px 32px rgba(0, 0, 0, 0.12),
    0 8px 16px rgba(0, 0, 0, 0.08);
}

/* ===== 城市封面图片区域 ===== */
.city-cover {
  position: relative;
  width: 100%;
  height: 180px; /* 固定封面高度，类似照片 */
  overflow: hidden;
  background: #f8fafc;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.city-card.photo-wall:hover .cover-image {
  transform: scale(1.05);
}

/* 封面占位符 - 当没有图片时 */
.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.city-initial {
  font-size: 48px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 收藏徽章 */
.wishlist-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  background: rgba(255, 193, 7, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
  }
  50% { 
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(255, 193, 7, 0.4);
  }
}

/* ===== 城市信息内容区域 - 自适应高度 ===== */
.city-info-content {
  padding: 20px;
  background: white;
  position: relative;
  
  /* 重要：让内容区域根据内容自适应高度 */
  min-height: 80px;
}

/* 基本信息 */
.city-basic-info {
  margin-bottom: 12px;
}

.city-name {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.city-province {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

/* 城市描述 - 可变高度 */
.city-description {
  margin: 16px 0;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.description-text {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}

/* 额外信息区域 */
.extra-info {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.visit-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%);
  border-radius: 8px;
  border: 1px solid #bfdbfe;
}

.visit-icon {
  color: #3b82f6;
  font-size: 16px;
}

.visit-date {
  font-size: 13px;
  color: #1e40af;
  font-weight: 600;
}

.city-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.city-tag {
  --el-tag-bg-color: #f1f5f9;
  --el-tag-text-color: #475569;
  --el-tag-border-color: #e2e8f0;
  font-size: 12px;
  font-weight: 500;
}

.more-tags {
  font-size: 12px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

/* ===== 悬浮操作遮罩层 ===== */
.action-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.overlay-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 主要操作按钮 - 中央显示 */
.primary-action-btn {
  --el-button-bg-color: rgba(99, 102, 241, 0.95);
  --el-button-border-color: rgba(99, 102, 241, 0.95);
  --el-button-hover-bg-color: rgba(99, 102, 241, 1);
  --el-button-hover-border-color: rgba(99, 102, 241, 1);
  --el-button-text-color: white;
  backdrop-filter: blur(12px);
  font-weight: 600;
  font-size: 16px;
  padding: 12px 24px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
  transform: scale(1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.primary-action-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.4);
}

/* 次要操作按钮 - 四角分布 */
.secondary-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.action-btn {
  position: absolute;
  --el-button-bg-color: rgba(255, 255, 255, 0.95);
  --el-button-text-color: #374151;
  --el-button-border-color: rgba(255, 255, 255, 0.95);
  --el-button-hover-bg-color: rgba(255, 255, 255, 1);
  backdrop-filter: blur(12px);
  width: 44px;
  height: 44px;
  pointer-events: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn.top-left {
  top: 20px;
  left: 20px;
}

.action-btn.top-right {
  top: 20px;
  right: 20px;
}

.action-btn.bottom-center {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

/* 收藏按钮特殊样式 */
.action-btn[type="warning"] {
  --el-button-bg-color: rgba(255, 193, 7, 0.95);
  --el-button-text-color: white;
  --el-button-border-color: rgba(255, 193, 7, 0.95);
  --el-button-hover-bg-color: rgba(255, 193, 7, 1);
}

/* ===== 内容变体样式 ===== */

/* 有描述的卡片会更高 */
.city-card.photo-wall.has-description {
  min-height: 320px;
}

/* 有额外信息的卡片会更高 */
.city-card.photo-wall.has-extra-info {
  min-height: 280px;
}

/* 同时有描述和额外信息的卡片 */
.city-card.photo-wall.has-description.has-extra-info {
  min-height: 360px;
}

/* 收藏状态的卡片变体 */
.city-card.photo-wall.is-favorited {
  border: 2px solid rgba(255, 193, 7, 0.3);
  box-shadow: 
    0 4px 12px rgba(255, 193, 7, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.04);
}

.city-card.photo-wall.is-favorited:hover {
  box-shadow: 
    0 16px 32px rgba(255, 193, 7, 0.2),
    0 8px 16px rgba(0, 0, 0, 0.08);
}

/* ===== 过渡动画 ===== */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.overlay-fade-enter-to,
.overlay-fade-leave-from {
  opacity: 1;
  backdrop-filter: blur(8px);
}

/* ===== 响应式适配 ===== */
@media (max-width: 768px) {
  .city-card.photo-wall {
    min-height: 200px;
  }
  
  .city-cover {
    height: 140px;
  }
  
  .city-info-content {
    padding: 16px;
  }
  
  .city-name {
    font-size: 20px;
  }
  
  .city-initial {
    font-size: 36px;
  }
  
  .wishlist-badge {
    width: 28px;
    height: 28px;
    top: 8px;
    right: 8px;
  }
  
  .primary-action-btn {
    font-size: 14px;
    padding: 10px 20px;
  }
  
  .action-btn {
    width: 40px;
    height: 40px;
  }
  
  .action-btn.top-left,
  .action-btn.top-right {
    top: 16px;
  }
  
  .action-btn.top-left {
    left: 16px;
  }
  
  .action-btn.top-right {
    right: 16px;
  }
  
  .action-btn.bottom-center {
    bottom: 16px;
  }
  
  /* 移动端适配内容变体 */
  .city-card.photo-wall.has-description {
    min-height: 280px;
  }
  
  .city-card.photo-wall.has-extra-info {
    min-height: 240px;
  }
  
  .city-card.photo-wall.has-description.has-extra-info {
    min-height: 320px;
  }
}

/* ===== 暗色模式支持 ===== */
@media (prefers-color-scheme: dark) {
  .city-card.photo-wall {
    background: #1f2937;
    box-shadow: 
      0 4px 12px rgba(0, 0, 0, 0.25),
      0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .city-info-content {
    background: #1f2937;
  }
  
  .city-name {
    color: #f9fafb;
  }
  
  .city-province {
    color: #9ca3af;
  }
  
  .city-description {
    background: #374151;
    border-left-color: #60a5fa;
  }
  
  .description-text {
    color: #d1d5db;
  }
  
  .visit-info {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    border-color: #3b82f6;
  }
  
  .visit-date {
    color: #dbeafe;
  }
  
  .city-tag {
    --el-tag-bg-color: #374151;
    --el-tag-text-color: #d1d5db;
    --el-tag-border-color: #4b5563;
  }
  
  .more-tags {
    background: #374151;
    color: #9ca3af;
    border-color: #4b5563;
  }
}

/* ===== 性能优化 ===== */
.city-card.photo-wall * {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* 减少动画以提升性能 */
@media (prefers-reduced-motion: reduce) {
  .city-card.photo-wall,
  .cover-image,
  .overlay-fade-enter-active,
  .overlay-fade-leave-active,
  .primary-action-btn,
  .action-btn {
    transition: none;
  }
  
  .city-card.photo-wall:hover {
    transform: none;
  }
  
  .city-card.photo-wall:hover .cover-image {
    transform: none;
  }
  
  .wishlist-badge {
    animation: none;
  }
}

/* ===== 处理中状态 ===== */
.city-card.photo-wall.is-processing {
  opacity: 0.7;
  pointer-events: none;
}

.city-card.photo-wall.is-processing::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 15;
}

/* ===== 打印样式 ===== */
@media print {
  .city-card.photo-wall {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  
  .action-overlay {
    display: none;
  }
}
</style>
