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

        <div v-if="wishlistStore.wishlistCount > 0"
class="header-stats">
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

    <!-- 愿望清单内容 -->
    <div class="page-content">
      <div
v-loading="wishlistStore.loading" class="wishlist-content"
>
        <div
v-if="wishlistStore.hasCities" class="wishlist-grid"
>
          <WishlistCard
            v-for="item in sortedWishlistItems"
            :key="item.id"
            :wishlist-item="item"
            :is-current-weather-city="isCurrentWeatherCity(item)"
            @remove="handleRemove"
            @edit="handleEdit"
            @view-weather="handleViewWeather"
            @plan-trip="handlePlanTrip"
          />
        </div>

        <!-- 空状态 -->
        <div
v-else class="empty-wishlist"
>
          <el-icon
size="64" color="#C0C4CC"
>
            <Star />
          </el-icon>
          <h4>还没有心仪的目的地</h4>
          <p>添加你想去的城市，让旅行灵感永不枯竭</p>

          <div class="empty-actions">
            <el-button
type="primary" @click="showQuickAdd = true"
>
              <el-icon><Plus /></el-icon>
              添加第一个城市
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速操作悬浮按钮 -->
    <div class="floating-actions">
      <el-button
        type="primary"
        circle
        size="large"
        class="fab-main"
        @click="showQuickAdd = true"
      >
      <el-icon><Plus /></el-icon>
      </el-button>
      
    </div>

    <!-- 快速添加对话框 -->
    <el-dialog
      v-model="showQuickAdd"
      title="快速添加城市"
      width="400px"
      :before-close="handleQuickAddClose"
    >
      <el-form
:model="quickAddForm" label-position="top"
>
        <el-form-item label="城市名称">
          <el-input
            v-model="quickAddForm.cityName"
            placeholder="输入城市名称..."
            autofocus
            @keyup.enter="handleQuickAddSubmit"
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
          <el-button @click="handleQuickAddClose"> 取消 </el-button>
          <el-button
            type="primary"
            :loading="quickAdding"
            :disabled="!quickAddForm.cityName.trim()"
            @click="handleQuickAddSubmit"
          >
            添加
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Star, Plus } from "@element-plus/icons-vue";
import { useWishlistStore } from "@/store/wishlist.js";
import WishlistCard from "@/components/Common/Wishlist/WishlistCard.vue";

export default {
  name: "WishlistPage",
  components: {
    WishlistCard,
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
      cityName: "",
      reason: "",
    });

    // 排序后的愿望清单
    const sortedWishlistItems = computed(() => {
      return [...wishlistStore.wishlistItems].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
    });

    // 检查是否为当前天气城市
    const isCurrentWeatherCity = (item) => {
      return wishlistStore.currentWeatherCity?.id === item.id;
    };

    // 处理卡片事件
    const handleRemove = async (wishlistId) => {
      await wishlistStore.removeFromWishlist(wishlistId);
    };

    const handleEdit = async ({ id, updateData }) => {
      await wishlistStore.updateWishlistItem(id, updateData);
    };

    const handleViewWeather = (city) => {
      wishlistStore.setCurrentWeatherCity(city);
      handleWeatherCityChange(city);
      ElMessage.success(`已切换到 ${city.cityName} 的天气预览`);
    };

    const handlePlanTrip = (city) => {
      router.push({
        path: "/trip/create",
        query: {
          city: city.cityCode,
          cityName: encodeURIComponent(city.cityName),
        },
      });
    };

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
      console.log("Weather city changed:", city);
    };

    // 快速添加城市
    const handleQuickAddSubmit = async () => {
      const cityName = quickAddForm.value.cityName.trim();
      if (!cityName) {
        ElMessage.warning("请输入城市名称");
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
          tags: ["快速添加"],
        });

        if (success) {
          handleQuickAddClose();
        }
      } catch (error) {
        console.error("快速添加失败:", error);
      } finally {
        quickAdding.value = false;
      }
    };

    // 关闭快速添加对话框
    const handleQuickAddClose = () => {
      showQuickAdd.value = false;
      quickAddForm.value = {
        cityName: "",
        reason: "",
      };
    };

    // 页面初始化
    onMounted(() => {
      wishlistStore.loadWishlist();
    });

    return {
      wishlistStore,
      uniqueTagsCount,
      sortedWishlistItems,
      isCurrentWeatherCity,
      handleRemove,
      handleEdit,
      handleViewWeather,
      handlePlanTrip,
      showQuickAdd,
      quickAdding,
      quickAddForm,
      handleWeatherCityChange,
      handleQuickAddSubmit,
      handleQuickAddClose,
    };
  },
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
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(145, 168, 208, 0.06);
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
  background: linear-gradient(135deg, #1f2937 0%, #91a8d0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title .el-icon {
  font-size: 36px;
  color: #91a8d0;
  animation: sparkle 3s ease-in-out infinite;
}

@keyframes sparkle {
  0%,
  100% {
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
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border: 1px solid rgba(145, 168, 208, 0.1);
  min-width: 80px;
}

.stat-number {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #91a8d0;
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

/* 愿望清单内容 */
.wishlist-content {
  min-height: 200px;
}

.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 4px;
}

/* 空状态 */
.empty-wishlist {
  text-align: center;
  padding: 80px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border: 2px dashed rgba(99, 102, 241, 0.2);
  margin: 20px 0;
}

.empty-wishlist .el-icon {
  color: #91a8d0 !important;
  margin-bottom: 20px;
  opacity: 0.7;
}

.empty-wishlist h4 {
  margin: 16px 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.empty-wishlist p {
  margin: 0 0 32px 0;
  font-size: 15px;
  line-height: 1.6;
  color: #6b7280;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.empty-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.empty-actions .el-button {
  border-radius: 12px;
  font-weight: 500;
  padding: 10px 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.empty-actions .el-button--primary {
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(145, 168, 208, 0.3);
}

.empty-actions .el-button--primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 24px rgba(145, 168, 208, 0.4);
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
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border: none;
  box-shadow:
    0 8px 32px rgba(145, 168, 208, 0.3),
    0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-main:hover {
  transform: scale(1.1) translateY(-2px);
  box-shadow:
    0 12px 40px rgba(145, 168, 208, 0.4),
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
    background: linear-gradient(135deg, #f9fafb 0%, #f7cac9 100%);
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
    color: #f7cac9;
  }

  .stat-label {
    color: #d1d5db;
  }
}
</style>
