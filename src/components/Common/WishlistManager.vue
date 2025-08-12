<template>
  <div class="wishlist-manager">
    <div class="wishlist-header">
      <div class="header-left">
        <h3 class="section-title">
          <el-icon><Star /></el-icon>
          我的愿望清单
        </h3>
        <el-tag
size="small" type="info"
v-if="wishlistStore.wishlistCount > 0"
>
          {{ wishlistStore.wishlistCount }} 个城市
        </el-tag>
      </div>

      <div class="header-actions">
        <el-button
          size="small"
          type="primary"
          plain
          :icon="Plus"
          @click="showAddDialog = true"
        >
          添加城市
        </el-button>

        <el-button
          v-if="wishlistStore.wishlistCount === 0"
          size="small"
          type="info"
          plain
          @click="showRecommendations = true"
        >
          <el-icon><MagicStick /></el-icon>
          推荐城市
        </el-button>
      </div>
    </div>

    <!-- 愿望清单列表 -->
    <div v-loading="wishlistStore.loading"
class="wishlist-content">
      <div
v-if="wishlistStore.hasCities" class="wishlist-grid"
>
        <WishlistCard
          v-for="item in wishlistStore.wishlistItems"
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
        <p>添加你想去的城市，让我们为你提供天气信息和旅行建议</p>

        <div class="empty-actions">
          <el-button
type="primary" @click="showAddDialog = true"
>
            <el-icon><Plus /></el-icon>
            添加第一个城市
          </el-button>
          <el-button
type="info" plain
@click="showRecommendations = true"
>
            <el-icon><MagicStick /></el-icon>
            看看推荐
          </el-button>
        </div>
      </div>
    </div>

    <!-- 添加城市对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="添加城市到愿望清单"
      width="500px"
      :before-close="handleAddDialogClose"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-position="top"
      >
        <el-form-item
label="选择城市" prop="cityCode"
required
>
          <el-select
            v-model="addForm.cityCode"
            placeholder="搜索城市名称"
            filterable
            remote
            reserve-keyword
            :remote-method="searchCities"
            :loading="searchingCities"
            style="width: 100%"
            @change="handleCitySelect"
          >
            <el-option
              v-for="city in cityOptions"
              :key="city.adcode"
              :label="city.name"
              :value="city.adcode"
              :disabled="wishlistStore.isCityInWishlist(city.adcode)"
            >
              <span>{{ city.name }}</span>
              <span style="color: #8492a6; font-size: 13px; float: right">
                {{ city.level }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item
label="想去的原因" prop="reason"
>
          <el-input
            v-model="addForm.reason"
            type="textarea"
            :rows="3"
            placeholder="写下你想去这里的原因..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="标签">
          <div class="tag-input-area">
            <el-tag
              v-for="tag in addForm.tags"
              :key="tag"
              closable
              style="margin-right: 8px; margin-bottom: 8px"
              @close="removeAddTag(tag)"
            >
              {{ tag }}
            </el-tag>

            <el-input
              v-if="addInputVisible"
              ref="addInputRef"
              v-model="addInputValue"
              size="small"
              style="width: 120px"
              placeholder="输入标签"
              @keyup.enter="handleAddInputConfirm"
              @blur="handleAddInputConfirm"
            />
            <el-button
v-else size="small"
@click="showAddInput"
>
              <el-icon><Plus /></el-icon>
              添加标签
            </el-button>
          </div>

          <!-- 推荐标签 -->
          <div class="recommended-tags">
            <span class="tag-label">推荐：</span>
            <el-tag
              v-for="tag in recommendedTags"
              :key="tag"
              size="small"
              type="info"
              effect="plain"
              style="margin-right: 6px; cursor: pointer"
              @click="addRecommendedTag(tag)"
            >
              {{ tag }}
            </el-tag>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleAddDialogClose"> 取消 </el-button>
          <el-button
            type="primary"
            :loading="addingCity"
            :disabled="!addForm.cityCode"
            @click="handleAddCity"
          >
            添加到愿望清单
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 推荐城市对话框 -->
    <el-dialog v-model="showRecommendations"
title="为你推荐" width="600px">
      <div class="recommendations-content">
        <div class="recommendation-section">
          <h4>热门目的地</h4>
          <div class="recommendation-tags">
            <el-tag
              v-for="city in popularCities"
              :key="city.code"
              size="large"
              type="primary"
              effect="plain"
              style="margin-right: 12px; margin-bottom: 12px; cursor: pointer"
              @click="quickAddCity(city)"
            >
              <el-icon><MapLocation /></el-icon>
              {{ city.name }}
            </el-tag>
          </div>
        </div>

        <div class="recommendation-section">
          <h4>四季之选</h4>
          <div class="recommendation-tags">
            <el-tag
              v-for="city in seasonalCities"
              :key="city.code"
              size="large"
              type="success"
              effect="plain"
              style="margin-right: 12px; margin-bottom: 12px; cursor: pointer"
              @click="quickAddCity(city)"
            >
              <el-icon><Sunny /></el-icon>
              {{ city.name }}
            </el-tag>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showRecommendations = false"> 关闭 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  Star,
  Plus,
  MagicStick,
  MapLocation,
  Sunny,
} from "@element-plus/icons-vue";
import { useWishlistStore } from "@/store/wishlist.js";
import WishlistCard from "./WishlistCard.vue";
import { createCachedRequest, debounce } from "@/utils/apiOptimizer.js";

export default {
  name: "WishlistManager",
  components: {
    WishlistCard,
    Star,
    Plus,
    MagicStick,
    MapLocation,
    Sunny,
  },
  emits: ["weather-city-change"],
  setup(props, { emit }) {
    const router = useRouter();
    const wishlistStore = useWishlistStore();

    // 添加城市对话框
    const showAddDialog = ref(false);
    const addForm = ref({
      cityCode: "",
      cityName: "",
      reason: "",
      tags: [],
    });
    const addingCity = ref(false);

    // 表单验证规则
    const addFormRules = {
      cityCode: [{ required: true, message: "请选择城市", trigger: "change" }],
    };

    // 城市搜索
    const cityOptions = ref([]);
    const searchingCities = ref(false);

    // 标签输入
    const addInputVisible = ref(false);
    const addInputValue = ref("");
    const addInputRef = ref();

    // 推荐标签
    const recommendedTags = ref([
      "美食",
      "风景",
      "历史",
      "文化",
      "购物",
      "海滩",
      "山景",
      "古建筑",
    ]);

    // 推荐城市
    const showRecommendations = ref(false);
    const popularCities = ref([
      { name: "北京", code: "110000" },
      { name: "上海", code: "310000" },
      { name: "广州", code: "440100" },
      { name: "深圳", code: "440300" },
      { name: "杭州", code: "330100" },
      { name: "成都", code: "510100" },
      { name: "西安", code: "610100" },
      { name: "南京", code: "320100" },
    ]);

    const seasonalCities = ref([
      { name: "三亚", code: "460200" },
      { name: "厦门", code: "350200" },
      { name: "青岛", code: "370200" },
      { name: "大连", code: "210200" },
      { name: "昆明", code: "530100" },
      { name: "桂林", code: "450300" },
    ]);

    // 检查是否为当前天气城市
    const isCurrentWeatherCity = (item) => {
      return wishlistStore.currentWeatherCity?.id === item.id;
    };

    // 城市数据加载函数
    const fetchCityData = async () => {
      const response = await fetch("/data/city-codes.json");
      if (!response.ok) {
        throw new Error(`加载城市数据失败: ${response.status}`);
      }
      return await response.json();
    };

    // 带缓存的城市数据加载
    const cachedFetchCityData = createCachedRequest(fetchCityData, {
      cacheKey: "wishlist-city-data",
      ttl: 30 * 60 * 1000, // 缓存30分钟
      enableCache: true,
    });

    // 搜索城市
    const searchCities = async (keyword) => {
      if (!keyword || keyword.length < 2) {
        cityOptions.value = [];
        return;
      }

      searchingCities.value = true;
      try {
        const cityData = await cachedFetchCityData();
        const searchTerm = keyword.toLowerCase().trim();

        // 过滤匹配的城市（只保留市级城市）
        const matchedCities = cityData.filter((city) => {
          if (!city.中文名 || !city.adcode) return false;

          const cityName = city.中文名.toLowerCase();
          const isCity =
            cityName.includes("市") ||
            cityName.includes("自治州") ||
            cityName.includes("地区") ||
            cityName.includes("盟");

          return (
            isCity &&
            (cityName.includes(searchTerm) || searchTerm.includes(cityName))
          );
        });

        // 格式化结果
        cityOptions.value = matchedCities
          .slice(0, 20) // 限制20个结果
          .map((city) => ({
            adcode: String(city.adcode),
            name: city.中文名,
            level: getCityLevel(city.adcode),
          }));
      } catch (error) {
        console.error("搜索城市失败:", error);
        cityOptions.value = [];
      } finally {
        searchingCities.value = false;
      }
    };

    // 根据adcode判断城市级别
    const getCityLevel = (adcode) => {
      const code = String(adcode);
      if (code === "100000") return "国家";
      if (code.endsWith("0000") && code !== "100000") return "省/直辖市";
      if (code.endsWith("00") && !code.endsWith("0000")) return "市";
      return "区/县";
    };

    // 选择城市
    const handleCitySelect = (cityCode) => {
      const selectedCity = cityOptions.value.find(
        (city) => city.adcode === cityCode,
      );
      if (selectedCity) {
        addForm.value.cityName = selectedCity.name;
      }
    };

    // 添加城市
    const handleAddCity = async () => {
      if (!addForm.value.cityCode || !addForm.value.cityName) {
        ElMessage.warning("请先选择城市");
        return;
      }

      addingCity.value = true;
      try {
        const success = await wishlistStore.addToWishlist({
          cityCode: addForm.value.cityCode,
          cityName: addForm.value.cityName,
          reason: addForm.value.reason,
          tags: addForm.value.tags,
        });

        if (success) {
          handleAddDialogClose();
        }
      } finally {
        addingCity.value = false;
      }
    };

    // 快速添加推荐城市
    const quickAddCity = async (city) => {
      const success = await wishlistStore.addToWishlist({
        cityCode: city.code,
        cityName: city.name,
        reason: "来自推荐",
        tags: ["推荐"],
      });

      if (success) {
        showRecommendations.value = false;
      }
    };

    // 关闭添加对话框
    const handleAddDialogClose = () => {
      showAddDialog.value = false;

      // 重置表单
      addForm.value = {
        cityCode: "",
        cityName: "",
        reason: "",
        tags: [],
      };
      cityOptions.value = [];
    };

    // 标签相关操作
    const removeAddTag = (tag) => {
      addForm.value.tags = addForm.value.tags.filter((t) => t !== tag);
    };

    const showAddInput = () => {
      addInputVisible.value = true;
      nextTick(() => {
        addInputRef.value?.focus();
      });
    };

    const handleAddInputConfirm = () => {
      if (
        addInputValue.value &&
        !addForm.value.tags.includes(addInputValue.value)
      ) {
        addForm.value.tags.push(addInputValue.value);
      }
      addInputVisible.value = false;
      addInputValue.value = "";
    };

    const addRecommendedTag = (tag) => {
      if (!addForm.value.tags.includes(tag)) {
        addForm.value.tags.push(tag);
      }
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
      emit("weather-city-change", city);
      ElMessage.success(`已切换到 ${city.cityName} 的天气预览`);
    };

    const handlePlanTrip = (city) => {
      // 跳转到行程创建页面，并预选择城市
      router.push({
        path: "/trip/create",
        query: {
          city: city.cityCode,
          cityName: encodeURIComponent(city.cityName),
        },
      });
    };

    // 生命周期
    onMounted(() => {
      wishlistStore.loadWishlist();
    });

    return {
      // Store
      wishlistStore,

      // 对话框状态
      showAddDialog,
      showRecommendations,

      // 表单
      addForm,
      addFormRules,
      addingCity,

      // 城市搜索
      cityOptions,
      searchingCities,
      searchCities,
      handleCitySelect,

      // 标签
      addInputVisible,
      addInputValue,
      addInputRef,
      recommendedTags,
      removeAddTag,
      showAddInput,
      handleAddInputConfirm,
      addRecommendedTag,

      // 推荐
      popularCities,
      seasonalCities,
      quickAddCity,

      // 方法
      isCurrentWeatherCity,
      handleAddCity,
      handleAddDialogClose,
      handleRemove,
      handleEdit,
      handleViewWeather,
      handlePlanTrip,
    };
  },
};
</script>

<style scoped>
.wishlist-manager {
  margin-bottom: 24px;
}

.wishlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.wishlist-content {
  min-height: 200px;
}

.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.empty-wishlist {
  text-align: center;
  padding: 60px 20px;
  color: #606266;
}

.empty-wishlist h4 {
  margin: 16px 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.empty-wishlist p {
  margin: 0 0 24px 0;
  font-size: 14px;
  line-height: 1.5;
}

.empty-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.tag-input-area {
  margin-bottom: 12px;
}

.recommended-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.tag-label {
  font-size: 12px;
  color: #909399;
  margin-right: 6px;
}

.recommendations-content {
}

.recommendation-section {
  margin-bottom: 24px;
}

.recommendation-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.recommendation-tags {
  display: flex;
  flex-wrap: wrap;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .wishlist-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }

  .wishlist-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
