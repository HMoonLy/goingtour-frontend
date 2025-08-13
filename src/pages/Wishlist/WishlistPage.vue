<template>
  <div class="page-shell wishlist-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <el-icon><Star /></el-icon>
            我的愿望清单
          </h1>
          <p class="page-subtitle">
            收集你想去的目的地，让旅行灵感永不枯竭
          </p>
        </div>

        <div class="header-stats" v-if="wishlistStore.wishlistCount > 0">
          <div class="stat-item">
            <span class="stat-number">{{ wishlistStore.wishlistCount }}</span>
            <span class="stat-label">个城市</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ uniqueTagsCount }}</span>
            <span class="stat-label">个标签</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 愿望清单管理器 -->
    <div class="page-content">
      <WishlistManager 
        @weather-city-change="handleWeatherCityChange"
        class="full-featured-manager"
      />
    </div>

    <!-- 快速操作悬浮按钮 -->
    <div class="floating-actions">
      <el-button
        type="primary"
        :icon="Plus"
        circle
        size="large"
        class="fab-main"
        @click="showQuickAdd = true"
        :title="'快速添加城市'"
      />
    </div>

    <!-- 快速添加对话框 -->
    <el-dialog
      v-model="showQuickAdd"
      title="快速添加城市"
      width="400px"
      :before-close="handleQuickAddClose"
    >
      <el-form :model="quickAddForm" label-position="top">
        <el-form-item label="城市名称">
          <el-input
            v-model="quickAddForm.cityName"
            placeholder="输入城市名称..."
            @keyup.enter="handleQuickAddSubmit"
            autofocus
          />
        </el-form-item>
        <el-form-item label="想去的原因（可选）">
          <el-input
            v-model="quickAddForm.reason"
            type="textarea"
            :rows="2"
            placeholder="简单描述一下..."
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleQuickAddClose">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleQuickAddSubmit"
            :loading="quickAdding"
            :disabled="!quickAddForm.cityName.trim()"
          >
            添加
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Star, Plus } from '@element-plus/icons-vue';
import { useWishlistStore } from '@/store/wishlist.js';
import WishlistManager from '@/components/Common/WishlistManager.vue';

export default {
  name: 'WishlistPage',
  components: {
    WishlistManager,
    Star,
    Plus,
  },
  setup() {
    const router = useRouter();
    const wishlistStore = useWishlistStore();

    // 快速添加功能
    const showQuickAdd = ref(false);
    const quickAdding = ref(false);
    const quickAddForm = ref({
      cityName: '',
      reason: ''
    });

    // 统计信息
    const uniqueTagsCount = computed(() => {
      const allTags = wishlistStore.wishlistItems.reduce((tags, item) => {
        return tags.concat(item.tags || []);
      }, []);
      return new Set(allTags).size;
    });

    // 处理天气城市变更（传递给父级路由）
    const handleWeatherCityChange = (city) => {
      // 可以通过 router 或 emit 传递给其他页面
      console.log('Weather city changed:', city);
    };

    // 快速添加城市
    const handleQuickAddSubmit = async () => {
      const cityName = quickAddForm.value.cityName.trim();
      if (!cityName) {
        ElMessage.warning('请输入城市名称');
        return;
      }

      quickAdding.value = true;
      try {
        // 这里应该有城市搜索和验证逻辑
        // 暂时使用简单的假设逻辑
        const success = await wishlistStore.addToWishlist({
          cityCode: Date.now().toString(), // 临时方案
          cityName: cityName,
          reason: quickAddForm.value.reason,
          tags: ['快速添加']
        });

        if (success) {
          handleQuickAddClose();
        }
      } catch (error) {
        console.error('快速添加失败:', error);
      } finally {
        quickAdding.value = false;
      }
    };

    // 关闭快速添加对话框
    const handleQuickAddClose = () => {
      showQuickAdd.value = false;
      quickAddForm.value = {
        cityName: '',
        reason: ''
      };
    };

    // 页面初始化
    onMounted(() => {
      wishlistStore.loadWishlist();
    });

    return {
      wishlistStore,
      uniqueTagsCount,
      showQuickAdd,
      quickAdding,
      quickAddForm,
      handleWeatherCityChange,
      handleQuickAddSubmit,
      handleQuickAddClose,
    };
  }
};
</script>

<style scoped>
.wishlist-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* 页面头部 */
.page-header {
  margin-bottom: 32px;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(99, 102, 241, 0.08);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(99, 102, 241, 0.06);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #1f2937 0%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title .el-icon {
  font-size: 36px;
  color: #6366f1;
  animation: sparkle 3s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { 
    transform: scale(1) rotate(0deg); 
    opacity: 1; 
  }
  25% { 
    transform: scale(1.1) rotate(5deg); 
    opacity: 0.8; 
  }
  50% { 
    transform: scale(0.9) rotate(-3deg); 
    opacity: 1; 
  }
  75% { 
    transform: scale(1.05) rotate(2deg); 
    opacity: 0.9; 
  }
}

.page-subtitle {
  margin: 0;
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
  max-width: 500px;
}

.header-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  text-align: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 16px;
  border: 1px solid rgba(99, 102, 241, 0.1);
  min-width: 80px;
}

.stat-number {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #6366f1;
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

/* 页面内容 */
.page-content {
  position: relative;
}

.full-featured-manager {
  box-shadow: none;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
}

/* 悬浮操作按钮 */
.floating-actions {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 1000;
}

.fab-main {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  box-shadow: 
    0 8px 32px rgba(99, 102, 241, 0.3),
    0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-main:hover {
  transform: scale(1.1) translateY(-2px);
  box-shadow: 
    0 12px 40px rgba(99, 102, 241, 0.4),
    0 6px 20px rgba(0, 0, 0, 0.15);
}

.fab-main:active {
  transform: scale(0.95);
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .wishlist-page {
    padding: 16px 12px;
  }

  .page-header {
    padding: 24px 20px;
    margin-bottom: 24px;
  }

  .header-content {
    flex-direction: column;
    gap: 20px;
  }

  .page-title {
    font-size: 28px;
    gap: 10px;
  }

  .page-title .el-icon {
    font-size: 32px;
  }

  .header-stats {
    gap: 16px;
    justify-content: center;
  }

  .stat-item {
    padding: 12px 16px;
    min-width: 70px;
  }

  .stat-number {
    font-size: 24px;
  }

  .floating-actions {
    bottom: 24px;
    right: 24px;
  }

  .fab-main {
    width: 48px;
    height: 48px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .page-header {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border-color: rgba(99, 102, 241, 0.2);
  }

  .page-title {
    background: linear-gradient(135deg, #f9fafb 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .page-subtitle {
    color: #d1d5db;
  }

  .stat-item {
    background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
    border-color: rgba(99, 102, 241, 0.2);
  }

  .stat-number {
    color: #8b5cf6;
  }

  .stat-label {
    color: #d1d5db;
  }
}
</style>