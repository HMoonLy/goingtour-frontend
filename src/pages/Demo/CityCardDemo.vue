<template>
  <div class="city-card-demo">
    <div class="demo-header">
      <h1 class="demo-title">增强版城市卡片设计展示</h1>
      <p class="demo-description">
        全新的悬浮操作栏设计，提供更好的用户体验和视觉效果
      </p>
    </div>

    <!-- 功能特性说明 -->
    <div class="features-section">
      <h2>新设计特性</h2>
      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">🎨</div>
          <h3>视觉升级</h3>
          <p>支持城市背景图片，渐变遮罩效果，让每个城市都有独特的视觉呈现</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">⚡</div>
          <h3>悬浮操作</h3>
          <p>鼠标悬浮时显示操作栏，界面更简洁，操作更直观</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📱</div>
          <h3>响应式设计</h3>
          <p>完美适配各种屏幕尺寸，移动端和桌面端都有良好体验</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🎯</div>
          <h3>操作优先级</h3>
          <p>明确的主要操作（规划行程）和次要操作区分</p>
        </div>
      </div>
    </div>

    <!-- 城市卡片演示 -->
    <div class="demo-section">
      <h2>设计演示</h2>
      <div class="demo-grid">
        <CityGridList
          :cities="demoCities"
          :wishlist-items="wishlistItems"
          :loading="false"
          @select-city="handleSelectCity"
          @toggle-wishlist="handleToggleWishlist"
          @plan-trip="handlePlanTrip"
          @view-details="handleViewDetails"
          @edit="handleEdit"
        />
      </div>
    </div>

    <!-- 操作反馈 -->
    <div v-if="lastAction" class="action-feedback">
      <div class="feedback-content">
        <h3>操作反馈</h3>
        <p><strong>动作：</strong>{{ lastAction.type }}</p>
        <p><strong>城市：</strong>{{ lastAction.city }}</p>
        <p><strong>时间：</strong>{{ lastAction.time }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import CityGridList from '@/components/Common/City/CityGridList.vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'CityCardDemo',
  components: {
    CityGridList,
  },
  setup() {
    const lastAction = ref(null);

    // 示例城市数据 - 展示不同内容长度的瀑布流效果
    const demoCities = reactive([
      {
        中文名: '北京市',
        adcode: '110000',
        coverImage: '/images/cities/beijing.jpg',
        description: '中国的首都，拥有3000多年的建城史和800多年的建都史。这里有故宫、天坛、长城等世界文化遗产，是中华文明的重要发源地。',
        tags: ['首都', '历史文化', '政治中心'],
        visitDate: '2023-08-15'
      },
      {
        中文名: '上海市',
        adcode: '310000',
        coverImage: '/images/cities/shanghai.jpg',
        tags: ['国际化', '金融中心'],
      },
      {
        中文名: '深圳市',
        adcode: '440300',
        coverImage: '/images/cities/shenzhen.jpg',
        description: '中国改革开放的窗口，从小渔村发展成为现代化国际大都市，科技创新实力雄厚。',
        tags: ['科技创新', '现代化', '经济特区'],
      },
      {
        中文名: '杭州市',
        adcode: '330100',
        coverImage: '/images/cities/hangzhou.jpg',
        description: '人间天堂，西湖美景享誉世界。同时也是中国电子商务之都，阿里巴巴等知名企业的发源地，数字经济发达。',
        tags: ['西湖', '电商之都', '数字经济'],
        visitDate: '2023-09-20'
      },
      {
        中文名: '成都市',
        adcode: '510100',
        coverImage: '/images/cities/chengdu.jpg',
        description: '天府之国的省会，以悠闲的生活节奏和丰富的美食文化闻名，是大熊猫的故乡。',
        tags: ['美食', '熊猫', '天府之国'],
        visitDate: '2023-07-10'
      },
      {
        中文名: '西安市',
        adcode: '610100',
        coverImage: '/images/cities/xian.jpg',
        tags: ['古都', '兵马俑'],
      },
      {
        中文名: '武汉市',
        adcode: '420100',
        description: '九省通衢的江城，长江与汉江在此交汇，是中国重要的交通枢纽和教育重镇。',
        tags: ['江城', '教育', '交通枢纽'],
      },
      {
        中文名: '青岛市',
        adcode: '370200',
        description: '美丽的海滨城市，以青岛啤酒和海鲜美食著称，拥有优美的海岸线和德式建筑风情。',
        tags: ['海滨', '啤酒', '德式建筑'],
      },
      {
        中文名: '苏州市',
        adcode: '320500',
        description: '江南水乡的代表，以精美的古典园林和深厚的文化底蕴闻名于世，被誉为人间天堂。拙政园、留园等古典园林是中华园林艺术的瑰宝。',
        tags: ['园林', '水乡', '古典'],
        visitDate: '2023-10-05'
      },
      {
        中文名: '厦门市',
        adcode: '350200',
        tags: ['海岛', '旅游'],
      },
      {
        中文名: '南京市',
        adcode: '320100',
        description: '六朝古都，有着深厚的历史文化底蕴。',
        tags: ['古都', '历史', '教育'],
      },
      {
        中文名: '重庆市',
        adcode: '500000',
        description: '山城重庆，以火锅、夜景和立体交通著称。这座城市建在山上，拥有独特的地形地貌，洪崖洞、解放碑等景点展现了山城的独特魅力。',
        tags: ['山城', '火锅', '夜景', '立体交通'],
        visitDate: '2023-06-18'
      }
    ]);

    // 示例收藏列表
    const wishlistItems = reactive([
      { adcode: '110000', cityName: '北京市' },
      { adcode: '330100', cityName: '杭州市' },
      { adcode: '320500', cityName: '苏州市' },
    ]);

    // 记录操作
    const recordAction = (type, city) => {
      lastAction.value = {
        type,
        city: city.中文名,
        time: new Date().toLocaleTimeString(),
      };
    };

    // 事件处理函数
    const handleSelectCity = (city) => {
      recordAction('选择城市', city);
      ElMessage.success(`选择了城市：${city.中文名}`);
    };

    const handleToggleWishlist = (city) => {
      const isInWishlist = wishlistItems.some(item => item.adcode === city.adcode);
      
      if (isInWishlist) {
        const index = wishlistItems.findIndex(item => item.adcode === city.adcode);
        wishlistItems.splice(index, 1);
        recordAction('移除收藏', city);
        ElMessage.warning(`已将 ${city.中文名} 从收藏中移除`);
      } else {
        wishlistItems.push({ adcode: city.adcode, cityName: city.中文名 });
        recordAction('添加收藏', city);
        ElMessage.success(`已将 ${city.中文名} 添加到收藏`);
      }
    };

    const handlePlanTrip = (city) => {
      recordAction('规划行程', city);
      ElMessage.info(`开始为 ${city.中文名} 规划行程`);
    };

    const handleViewDetails = (city) => {
      recordAction('查看详情', city);
      ElMessage.info(`查看 ${city.中文名} 的详细信息`);
    };

    const handleEdit = (city) => {
      recordAction('编辑信息', city);
      ElMessage.info(`编辑 ${city.中文名} 的信息`);
    };

    return {
      demoCities,
      wishlistItems,
      lastAction,
      handleSelectCity,
      handleToggleWishlist,
      handlePlanTrip,
      handleViewDetails,
      handleEdit,
    };
  },
};
</script>

<style scoped>
.city-card-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 24px;
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.demo-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.demo-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

.features-section {
  margin-bottom: 40px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.features-section h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px 0;
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.feature-item {
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.feature-item h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.feature-item p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.demo-section {
  margin-bottom: 40px;
}

.demo-section h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px 0;
  text-align: center;
}

.demo-grid {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.action-feedback {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.feedback-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  min-width: 240px;
}

.feedback-content h3 {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.feedback-content p {
  font-size: 12px;
  color: #6b7280;
  margin: 4px 0;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .city-card-demo {
    padding: 16px;
  }
  
  .demo-header {
    padding: 24px 16px;
  }
  
  .demo-title {
    font-size: 24px;
  }
  
  .features-section,
  .demo-grid {
    padding: 20px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .action-feedback {
    bottom: 16px;
    right: 16px;
    left: 16px;
  }
  
  .feedback-content {
    min-width: auto;
  }
}
</style>
