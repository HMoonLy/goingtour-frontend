/**
 * 优化的心愿清单 Store - 减少重渲染，提升交互性能
 */
import { defineStore } from "pinia";
import { ref, computed, shallowRef } from "vue";
import { wishlistApi } from "@/api/wishlist.js";
import { ElMessage } from "element-plus";

// 防抖工具函数
const debounce = (fn, delay = 300) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
};

export const useOptimizedWishlistStore = defineStore(
  "optimizedWishlist",
  () => {
    // 状态 - 使用 shallowRef 减少深度响应式监听
    const wishlistItems = shallowRef([]);
    const loading = ref(false);
    const currentWeatherCity = ref(null);

    // 缓存城市编码映射，避免每次遍历
    const adcodeMap = ref(new Map());

    // 批量操作队列
    const operationQueue = ref([]);
    const processingQueue = ref(false);

    // 计算属性 - 优化版本
    const wishlistCount = computed(() => wishlistItems.value.length);
    const hasCities = computed(() => wishlistCount.value > 0);
    const cityNames = computed(() =>
      wishlistItems.value.map((item) => item.cityName),
    );

    // 更新城市编码映射
    const updateCityCodeMap = () => {
      const newMap = new Map();
      wishlistItems.value.forEach((item) => {
        newMap.set(item.adcode, item);
      });
      adcodeMap.value = newMap;
    };

    // 防抖的消息显示
    const debouncedMessage = debounce((type, message) => {
      ElMessage[type](message);
    }, 150);

    // 乐观更新 - 立即更新UI，后台同步数据
    const optimisticAdd = (cityData) => {
      const tempId = `temp_${Date.now()}`;
      const newItem = {
        id: tempId,
        userId: cityData.userId,
        adcode: cityData.adcode,
        cityName: cityData.cityName,
        reason: cityData.reason || "",
        tags: cityData.tags || [],
        createdAt: new Date().toISOString(),
        _isOptimistic: true,
      };

      // 立即更新UI
      wishlistItems.value = [...wishlistItems.value, newItem];
      updateCityCodeMap();

      return tempId;
    };

    const optimisticRemove = (adcode) => {
      const item = adcodeMap.value.get(adcode);
      if (!item) return null;

      // 立即更新UI
      wishlistItems.value = wishlistItems.value.filter(
        (i) => i.adcode !== adcode,
      );
      updateCityCodeMap();

      return item;
    };

    // 批量处理操作队列
    const processOperationQueue = async () => {
      if (processingQueue.value || operationQueue.value.length === 0) return;

      processingQueue.value = true;
      const operations = [...operationQueue.value];
      operationQueue.value = [];

      try {
        // 按类型分组操作
        const addOps = operations.filter((op) => op.type === "add");
        const removeOps = operations.filter((op) => op.type === "remove");

        // 并行处理同类型操作
        if (addOps.length > 0) {
          await Promise.all(addOps.map((op) => processAddOperation(op)));
        }

        if (removeOps.length > 0) {
          await Promise.all(removeOps.map((op) => processRemoveOperation(op)));
        }
      } catch (error) {
        console.error("批量操作失败:", error);
      } finally {
        processingQueue.value = false;
      }
    };

    const processAddOperation = async (operation) => {
      try {
        const response = await wishlistApi.addToWishlist(operation.data);

        if (response.data) {
          // 更新临时ID为真实ID
          const index = wishlistItems.value.findIndex(
            (item) => item.id === operation.tempId,
          );
          if (index !== -1) {
            wishlistItems.value[index] = {
              ...wishlistItems.value[index],
              id: response.data.id,
              _isOptimistic: false,
            };
            updateCityCodeMap();
          }

          operation.resolve(true);
        } else {
          throw new Error("添加失败");
        }
      } catch (error) {
        // 撤销乐观更新
        wishlistItems.value = wishlistItems.value.filter(
          (item) => item.id !== operation.tempId,
        );
        updateCityCodeMap();

        operation.reject(error);
      }
    };

    const processRemoveOperation = async (operation) => {
      try {
        await wishlistApi.removeFromWishlist(
          operation.wishlistId,
          operation.userId,
        );
        operation.resolve(true);
      } catch (error) {
        // 撤销乐观更新，恢复项目
        wishlistItems.value = [...wishlistItems.value, operation.originalItem];
        updateCityCodeMap();

        operation.reject(error);
      }
    };

    // 队列处理防抖
    const debouncedProcessQueue = debounce(processOperationQueue, 100);

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
        updateCityCodeMap();
        console.log(
          "✅ 愿望清单加载成功:",
          wishlistItems.value.length,
          "个城市",
        );
      } catch (error) {
        console.error("❌ 加载愿望清单失败:", error);
        wishlistItems.value = [];
        adcodeMap.value.clear();
      } finally {
        loading.value = false;
      }
    };

    /**
     * 优化的添加到愿望清单
     */
    const addToWishlist = async (cityData) => {
      const { useUserStore } = await import("@/store/user.js");
      const userStore = useUserStore();
      const userId = userStore.currentUser?.id;

      if (!userId) {
        debouncedMessage("warning", "请先登录");
        return false;
      }

      // 检查是否已存在
      if (isCityInWishlist(cityData.adcode)) {
        debouncedMessage("info", `${cityData.cityName} 已在愿望清单中`);
        return false;
      }

      const wishData = {
        userId,
        adcode: cityData.adcode,
        cityName: cityData.cityName,
        reason: cityData.reason || "",
        tags: cityData.tags || [],
      };

      // 乐观更新
      const tempId = optimisticAdd(wishData);

      return new Promise((resolve, reject) => {
        // 添加到队列
        operationQueue.value.push({
          type: "add",
          tempId,
          data: wishData,
          resolve: (success) => {
            if (success) {
              debouncedMessage(
                "success",
                `已将 ${cityData.cityName} 添加到愿望清单`,
              );
            }
            resolve(success);
          },
          reject: (error) => {
            console.error("❌ 添加到愿望清单失败:", error);
            debouncedMessage("error", "添加失败，请重试");
            reject(error);
          },
        });

        // 触发队列处理
        debouncedProcessQueue();
      });
    };

    /**
     * 优化的从愿望清单删除
     */
    const removeFromWishlist = async (wishlistId) => {
      const { useUserStore } = await import("@/store/user.js");
      const userStore = useUserStore();
      const userId = userStore.currentUser?.id;

      if (!userId) return false;

      const originalItem = wishlistItems.value.find(
        (item) => item.id === wishlistId,
      );
      if (!originalItem) return false;

      // 乐观更新
      const removedItem = optimisticRemove(originalItem.adcode);

      return new Promise((resolve, reject) => {
        // 添加到队列
        operationQueue.value.push({
          type: "remove",
          wishlistId,
          userId,
          originalItem: removedItem,
          resolve: (success) => {
            if (success) {
              debouncedMessage(
                "success",
                `已从愿望清单移除 ${originalItem.cityName}`,
              );
            }
            resolve(success);
          },
          reject: (error) => {
            console.error("❌ 从愿望清单删除失败:", error);
            debouncedMessage("error", "删除失败，请重试");
            reject(error);
          },
        });

        // 触发队列处理
        debouncedProcessQueue();
      });
    };

    /**
     * 优化的检查城市是否在愿望清单中
     */
    const isCityInWishlist = (adcode) => {
      return adcodeMap.value.has(adcode);
    };

    /**
     * 根据城市编码获取愿望清单项
     */
    const getWishlistItemByCityCode = (adcode) => {
      return adcodeMap.value.get(adcode) || null;
    };

    /**
     * 设置当前天气显示的城市
     */
    const setCurrentWeatherCity = (city) => {
      currentWeatherCity.value = city;
    };

    /**
     * 清空愿望清单
     */
    const clearWishlist = () => {
      wishlistItems.value = [];
      adcodeMap.value.clear();
      currentWeatherCity.value = null;
      operationQueue.value = [];
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

      // 方法
      loadWishlist,
      addToWishlist,
      removeFromWishlist,
      isCityInWishlist,
      getWishlistItemByCityCode,
      setCurrentWeatherCity,
      clearWishlist,
    };
  },
);
