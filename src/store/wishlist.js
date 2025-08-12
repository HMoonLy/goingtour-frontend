/**
 * 愿望清单 Store - 管理用户的旅行愿望清单
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { wishlistApi } from "@/api/wishlist.js";
import { ElMessage } from "element-plus";

export const useWishlistStore = defineStore("wishlist", () => {
  // 状态
  const wishlistItems = ref([]);
  const loading = ref(false);
  const currentWeatherCity = ref(null); // 当前天气预览显示的城市

  // 计算属性
  const wishlistCount = computed(() => wishlistItems.value.length);

  const hasCities = computed(() => wishlistCount.value > 0);

  const cityNames = computed(() =>
    wishlistItems.value.map((item) => item.cityName),
  );

  const cityCodes = computed(() =>
    wishlistItems.value.map((item) => item.cityCode),
  );

  // 获取随机城市（用于天气轮播）
  const getRandomCity = computed(() => {
    if (!hasCities.value) return null;
    const randomIndex = Math.floor(Math.random() * wishlistItems.value.length);
    return wishlistItems.value[randomIndex];
  });

  // 方法

  /**
   * 加载用户的愿望清单
   */
  const loadWishlist = async () => {
    const { useUserStore } = await import("@/store/user.js");
    const userStore = useUserStore();
    const userId = userStore.currentUser?.id;

    if (!userId) {
      console.warn("用户未登录，无法加载愿望清单");
      return;
    }

    loading.value = true;
    try {
      const response = await wishlistApi.getUserWishlist(userId);
      wishlistItems.value = response.data || [];
      console.log("✅ 愿望清单加载成功:", wishlistItems.value.length, "个城市");
    } catch (error) {
      console.error("❌ 加载愿望清单失败:", error);
      wishlistItems.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 添加城市到愿望清单
   */
  const addToWishlist = async (cityData) => {
    const { useUserStore } = await import("@/store/user.js");
    const userStore = useUserStore();
    const userId = userStore.currentUser?.id;

    if (!userId) {
      ElMessage.warning("请先登录");
      return false;
    }

    // 检查是否已存在
    if (isCityInWishlist(cityData.cityCode)) {
      ElMessage.info(`${cityData.cityName} 已在愿望清单中`);
      return false;
    }

    try {
      const wishData = {
        userId,
        cityCode: cityData.cityCode,
        cityName: cityData.cityName,
        reason: cityData.reason || "",
        tags: cityData.tags || [],
      };

      const response = await wishlistApi.addToWishlist(wishData);

      if (response.data) {
        // 添加到本地状态
        wishlistItems.value.push({
          id: response.data.id,
          ...wishData,
          createdAt: new Date().toISOString(),
        });

        ElMessage.success(`已将 ${cityData.cityName} 添加到愿望清单`);
        return true;
      }
    } catch (error) {
      console.error("❌ 添加到愿望清单失败:", error);
      ElMessage.error("添加失败，请重试");
      return false;
    }
  };

  /**
   * 从愿望清单删除城市
   */
  const removeFromWishlist = async (wishlistId) => {
    const { useUserStore } = await import("@/store/user.js");
    const userStore = useUserStore();
    const userId = userStore.currentUser?.id;

    if (!userId) return false;

    try {
      await wishlistApi.removeFromWishlist(wishlistId, userId);

      // 从本地状态删除
      const index = wishlistItems.value.findIndex(
        (item) => item.id === wishlistId,
      );
      if (index !== -1) {
        const cityName = wishlistItems.value[index].cityName;
        wishlistItems.value.splice(index, 1);
        ElMessage.success(`已从愿望清单移除 ${cityName}`);
      }

      return true;
    } catch (error) {
      console.error("❌ 从愿望清单删除失败:", error);
      ElMessage.error("删除失败，请重试");
      return false;
    }
  };

  /**
   * 检查城市是否在愿望清单中
   */
  const isCityInWishlist = (cityCode) => {
    return wishlistItems.value.some((item) => item.cityCode === cityCode);
  };

  /**
   * 根据城市编码获取愿望清单项
   */
  const getWishlistItemByCityCode = (cityCode) => {
    return wishlistItems.value.find((item) => item.cityCode === cityCode);
  };

  /**
   * 更新愿望清单项
   */
  const updateWishlistItem = async (wishlistId, updateData) => {
    const { useUserStore } = await import("@/store/user.js");
    const userStore = useUserStore();
    const userId = userStore.currentUser?.id;

    if (!userId) return false;

    try {
      await wishlistApi.updateWishlistItem(wishlistId, {
        userId,
        ...updateData,
      });

      // 更新本地状态
      const index = wishlistItems.value.findIndex(
        (item) => item.id === wishlistId,
      );
      if (index !== -1) {
        wishlistItems.value[index] = {
          ...wishlistItems.value[index],
          ...updateData,
          updatedAt: new Date().toISOString(),
        };
        ElMessage.success("愿望清单更新成功");
      }

      return true;
    } catch (error) {
      console.error("❌ 更新愿望清单失败:", error);
      ElMessage.error("更新失败，请重试");
      return false;
    }
  };

  /**
   * 设置当前天气显示的城市
   */
  const setCurrentWeatherCity = (city) => {
    currentWeatherCity.value = city;
  };

  /**
   * 获取下一个城市（用于天气轮播）
   */
  const getNextWeatherCity = () => {
    if (!hasCities.value) return null;

    const currentIndex = currentWeatherCity.value
      ? wishlistItems.value.findIndex(
          (item) => item.id === currentWeatherCity.value.id,
        )
      : -1;

    const nextIndex = (currentIndex + 1) % wishlistItems.value.length;
    const nextCity = wishlistItems.value[nextIndex];

    setCurrentWeatherCity(nextCity);
    return nextCity;
  };

  /**
   * 清空愿望清单
   */
  const clearWishlist = () => {
    wishlistItems.value = [];
    currentWeatherCity.value = null;
  };

  return {
    // 状态
    wishlistItems,
    loading,
    currentWeatherCity,

    // 计算属性
    wishlistCount,
    hasCities,
    cityNames,
    cityCodes,
    getRandomCity,

    // 方法
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    isCityInWishlist,
    getWishlistItemByCityCode,
    updateWishlistItem,
    setCurrentWeatherCity,
    getNextWeatherCity,
    clearWishlist,
  };
});
