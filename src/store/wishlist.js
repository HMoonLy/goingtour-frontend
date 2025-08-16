/**
 * 愿望清单 Store - 管理用户的旅行愿望清单
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { wishlistApi } from "@/api/wishlist.js";
import { cityPhotosApi } from "@/api/cityPhotos.js";
import { ElMessage } from "element-plus";

export const useWishlistStore = defineStore("wishlist", () => {
  // 状态 - 现在分离两个数据源
  const wishlistItems = ref([]); // 心愿城市（想去的城市）
  const visitedCities = ref([]); // 足迹城市（去过的城市）
  const loading = ref(false);
  const currentWeatherCity = ref(null); // 当前天气预览显示的城市

  // 计算属性 - 基于新的分离数据源
  const wishlistCount = computed(() => wishlistItems.value.length);
  const visitedCount = computed(() => visitedCities.value.length);
  const totalCitiesCount = computed(() => wishlistCount.value + visitedCount.value);

  const hasCities = computed(() => totalCitiesCount.value > 0);

  // 想去的城市数量（纯心愿清单）
  const wishlistOnlyCount = computed(() => wishlistItems.value.length);

  // 已探索的省份数量（基于足迹城市）
  const exploredProvincesCount = computed(() => {
    const provinces = new Set();

    visitedCities.value.forEach((city) => {
      if (city.cityCode) {
        const provinceCode = city.cityCode.toString().substring(0, 2);
        provinces.add(provinceCode);
      }
    });

    return provinces.size;
  });

  // 足迹统计
  const footprintStats = computed(() => ({
    totalCities: totalCitiesCount.value,
    visitedCities: visitedCount.value,
    wishlistCities: wishlistOnlyCount.value,
    exploredProvinces: exploredProvincesCount.value,
    explorationRate:
      exploredProvincesCount.value > 0
        ? Math.round((exploredProvincesCount.value / 34) * 100)
        : 0, // 中国34个省级行政区
  }));

  // 所有城市名称（心愿+足迹）
  const cityNames = computed(() => [
    ...wishlistItems.value.map((item) => item.cityName),
    ...visitedCities.value.map((item) => item.cityName),
  ]);

  // 所有城市编码（心愿+足迹）
  const cityCodes = computed(() => [
    ...wishlistItems.value.map((item) => item.cityCode),
    ...visitedCities.value.map((item) => item.cityCode),
  ]);

  // 获取随机城市（用于天气轮播）- 优先选择足迹城市
  const getRandomCity = computed(() => {
    const allCities = [...visitedCities.value, ...wishlistItems.value];
    if (allCities.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * allCities.length);
    return allCities[randomIndex];
  });

  // 新的计算属性：基于分离的数据源
  
  // 所有去过的城市（直接返回足迹城市状态）
  const citiesWithPhotos = computed(() => visitedCities.value);
  
  // 想去的城市列表（直接返回心愿清单状态）
  const wishlistCities = computed(() => wishlistItems.value);

  // 方法

  /**
   * 加载用户的愿望清单和足迹城市（分离数据源）
   */
  const loadWishlist = async (retryCount = 0, maxRetries = 3) => {
    const { useUserStore } = await import("@/store/user.js");
    const userStore = useUserStore();
    const userId = userStore.currentUser?.id || userStore.userId;

    console.log("🔍 尝试获取用户ID:", {
      currentUserId: userStore.currentUser?.id,
      userStoreUserId: userStore.userId,
      isLoggedIn: userStore.isLoggedIn,
      retryCount,
      currentWishlistCount: wishlistItems.value.length,
      currentVisitedCount: visitedCities.value.length
    });

    if (!userId) {
      console.warn("⚠️ 用户未登录，无法加载数据");
      
      // 如果是因为用户状态还未恢复，且重试次数未达到上限，则稍后重试
      if (retryCount < maxRetries && userStore.isLoggedIn) {
        console.log("🔄 用户已登录但ID未获取，500ms后重试...");
        setTimeout(() => {
          loadWishlist(retryCount + 1, maxRetries);
        }, 500);
        return;
      }
      
      // 只有在确实未登录时才清空数据
      if (!userStore.isLoggedIn) {
        wishlistItems.value = [];
        visitedCities.value = [];
      }
      return;
    }

    // 避免重复加载
    if (loading.value) {
      console.log("⏳ 正在加载中，跳过重复请求");
      return;
    }

    loading.value = true;
    try {
      console.log("📡 正在请求数据，用户ID:", userId);
      
      // 并行请求两个数据源
      const [wishlistResponse, visitedResponse] = await Promise.all([
        wishlistApi.getUserWishlist(userId),
        cityPhotosApi.getUserVisitedCities(userId)
      ]);
      
      // 处理心愿城市数据
      if (wishlistResponse && wishlistResponse.data) {
        wishlistItems.value = wishlistResponse.data;
        console.log("✅ 心愿城市加载成功:", wishlistItems.value.length, "个城市");
      } else {
        console.warn("⚠️ 心愿城市API返回的数据格式异常:", wishlistResponse);
        wishlistItems.value = [];
      }

      // 处理足迹城市数据
      if (visitedResponse && visitedResponse.data) {
        visitedCities.value = visitedResponse.data;
        console.log("✅ 足迹城市加载成功:", visitedCities.value.length, "个城市");
      } else {
        console.warn("⚠️ 足迹城市API返回的数据格式异常:", visitedResponse);
        visitedCities.value = [];
      }

      // 输出统计信息
      console.log("📊 数据加载统计:", {
        心愿城市: wishlistItems.value.length,
        足迹城市: visitedCities.value.length,
        总计: totalCitiesCount.value,
        已探索省份: exploredProvincesCount.value
      });

    } catch (error) {
      console.error("❌ 加载数据失败:", error);
      
      // 如果是网络错误或服务器错误，且重试次数未达到上限，则重试
      if (retryCount < maxRetries && (error.code === 'NETWORK_ERROR' || error.status >= 500)) {
        console.log(`🔄 网络错误，将在 ${(retryCount + 1) * 1000}ms 后进行第 ${retryCount + 1} 次重试...`);
        setTimeout(() => {
          loadWishlist(retryCount + 1, maxRetries);
        }, (retryCount + 1) * 1000);
        return;
      }
      
      // 只有在网络错误时才清空数据，保留原有数据以提供更好的用户体验
      if (wishlistItems.value.length === 0 && visitedCities.value.length === 0) {
        console.log("💡 保留现有数据，避免清空用户界面");
      }
      
      // 不在这里显示错误消息，让调用方决定是否显示
      if (retryCount >= maxRetries) {
        console.error("💥 重试次数已达上限，加载失败");
      }
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
    const userId = userStore.currentUser?.id || userStore.userId;

    if (!userId) {
      ElMessage.warning("请先登录");
      return false;
    }

    console.log("🏪 Store接收到的数据:", cityData);

    // 如果是添加去过的城市，使用visited cities API
    if (cityData.ever_visited) {
      try {
        // 使用visitedCities API添加去过的城市
        const response = await cityPhotosApi.addVisitedCity({
          cityCode: cityData.cityCode,
          cityName: cityData.cityName,
          travelTime: cityData.travelTime,
          travelFeeling: cityData.travelFeeling,
          tags: cityData.tags || [],
        });

        if (response.data) {
          console.log("✅ 去过的城市添加成功:", response.data);
          ElMessage.success(`已将 ${cityData.cityName} 添加到足迹`);
          
          // 重新加载愿望清单以更新状态
          await loadWishlist();
          return true;
        }
      } catch (error) {
        console.error("❌ 添加去过的城市失败:", error);
        ElMessage.error("添加失败，请重试");
        return false;
      }
    }

    // 检查是否已存在该城市
    const existingCity = getWishlistItemByCityCode(cityData.cityCode);
    if (existingCity) {
      // 如果已经去过，询问是否想再去
      if (existingCity.ever_visited && !existingCity.want_to_visit_again) {
        // 直接标记为想再去
        return await markWantToVisitAgain(existingCity.id, true);
      } else if (existingCity.want_to_visit_again || !existingCity.ever_visited) {
        ElMessage.info(`${cityData.cityName} 已在愿望清单中`);
        return false;
      }
    }

    try {
      const wishData = {
        userId,
        cityCode: cityData.cityCode,
        cityName: cityData.cityName,
        reason: cityData.reason || "",
        tags: cityData.tags || [],
        ever_visited: cityData.ever_visited ?? false, // 使用 ?? 避免 false 被替换
        want_to_visit_again: cityData.want_to_visit_again ?? true, // 使用 ?? 避免 false 被替换
      };

      console.log("🚀 Store发送到API的数据:", wishData);

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
    const userId = userStore.currentUser?.id || userStore.userId;

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
   * 检查城市是否在系统中（心愿清单或足迹）
   */
  const isCityInWishlist = (cityCode) => {
    return wishlistItems.value.some((item) => item.cityCode === cityCode) ||
           visitedCities.value.some((item) => item.cityCode === cityCode);
  };

  /**
   * 检查城市是否在心愿清单中（想去）
   */
  const isCityInWishlistToVisit = (cityCode) => {
    return wishlistItems.value.some((item) => item.cityCode === cityCode);
  };

  /**
   * 检查城市是否去过
   */
  const isCityVisited = (cityCode) => {
    return visitedCities.value.some((item) => item.cityCode === cityCode);
  };

  /**
   * 根据城市编码获取城市记录（优先返回心愿清单项）
   */
  const getWishlistItemByCityCode = (cityCode) => {
    // 先检查心愿清单
    const wishlistItem = wishlistItems.value.find((item) => item.cityCode === cityCode);
    if (wishlistItem) return wishlistItem;
    
    // 再检查足迹城市
    const visitedItem = visitedCities.value.find((item) => item.cityCode === cityCode);
    return visitedItem;
  };

  /**
   * 根据城市编码获取足迹城市记录
   */
  const getVisitedCityByCityCode = (cityCode) => {
    return visitedCities.value.find((item) => item.cityCode === cityCode);
  };

  /**
   * 标记城市为已去过
   */
  const markAsVisited = async (wishlistId) => {
    const { useUserStore } = await import("@/store/user.js");
    const userStore = useUserStore();
    const userId = userStore.currentUser?.id || userStore.userId;

    if (!userId) {
      ElMessage.error("用户未登录，请先登录");
      return false;
    }

    try {
      await wishlistApi.updateWishlistItem(wishlistId, {
        userId,
        ever_visited: true,
        want_to_visit_again: false,
        visit_date: new Date().toISOString(),
      });

      // 更新本地状态
      const index = wishlistItems.value.findIndex(
        (item) => item.id === wishlistId,
      );
      if (index !== -1) {
        const cityName = wishlistItems.value[index].cityName;
        wishlistItems.value[index] = {
          ...wishlistItems.value[index],
          ever_visited: true,
          want_to_visit_again: false,
          visit_date: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        ElMessage.success(`已将 ${cityName} 标记为去过`);
      }

      return true;
    } catch (error) {
      console.error("❌ 标记城市为已去过失败:", error);
      ElMessage.error("操作失败，请重试");
      return false;
    }
  };

  /**
   * 标记是否想再去
   */
  const markWantToVisitAgain = async (wishlistId, wantToVisit = true) => {
    const { useUserStore } = await import("@/store/user.js");
    const userStore = useUserStore();
    const userId = userStore.currentUser?.id || userStore.userId;

    if (!userId) {
      ElMessage.error("用户未登录，请先登录");
      return false;
    }

    try {
      await wishlistApi.updateWishlistItem(wishlistId, {
        userId,
        want_to_visit_again: wantToVisit,
      });

      // 更新本地状态
      const index = wishlistItems.value.findIndex(
        (item) => item.id === wishlistId,
      );
      if (index !== -1) {
        const cityName = wishlistItems.value[index].cityName;
        wishlistItems.value[index] = {
          ...wishlistItems.value[index],
          want_to_visit_again: wantToVisit,
          updatedAt: new Date().toISOString(),
        };

        const actionText = wantToVisit ? "想再去" : "取消想再去";
        ElMessage.success(`已将 ${cityName} 标记为${actionText}`);
      }

      return true;
    } catch (error) {
      console.error("❌ 更新想再去状态失败:", error);
      ElMessage.error("操作失败，请重试");
      return false;
    }
  };

  /**
   * 批量标记城市状态
   */
  const batchMarkAsVisited = async (cityIds) => {
    const { useUserStore } = await import("@/store/user.js");
    const userStore = useUserStore();
    const userId = userStore.currentUser?.id || userStore.userId;

    if (!userId) return false;

    try {
      // 批量更新为已去过
      await Promise.all(
        cityIds.map((id) =>
          wishlistApi.updateWishlistItem(id, { 
            userId, 
            ever_visited: true, 
            want_to_visit_again: false,
            visit_date: new Date().toISOString()
          }),
        ),
      );

      // 更新本地状态
      cityIds.forEach((id) => {
        const index = wishlistItems.value.findIndex((item) => item.id === id);
        if (index !== -1) {
          wishlistItems.value[index] = {
            ...wishlistItems.value[index],
            ever_visited: true,
            want_to_visit_again: false,
            visit_date: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
      });

      ElMessage.success(`已批量标记 ${cityIds.length} 个城市为去过`);
      return true;
    } catch (error) {
      console.error("❌ 批量标记为去过失败:", error);
      ElMessage.error("批量操作失败，请重试");
      return false;
    }
  };

  /**
   * 更新愿望清单项
   */
  const updateWishlistItem = async (wishlistId, updateData) => {
    const { useUserStore } = await import("@/store/user.js");
    const userStore = useUserStore();
    const userId = userStore.currentUser?.id || userStore.userId;

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
   * 获取下一个城市（用于天气轮播）- 优先使用足迹城市
   */
  const getNextWeatherCity = () => {
    if (!hasCities.value) return null;

    // 优先使用足迹城市，然后是心愿城市
    const allCities = [...visitedCities.value, ...wishlistItems.value];
    
    const currentIndex = currentWeatherCity.value
      ? allCities.findIndex(
          (item) => item.id === currentWeatherCity.value.id,
        )
      : -1;

    const nextIndex = (currentIndex + 1) % allCities.length;
    const nextCity = allCities[nextIndex];

    setCurrentWeatherCity(nextCity);
    return nextCity;
  };

  /**
   * 清空愿望清单（包括心愿和足迹城市）
   */
  const clearWishlist = () => {
    wishlistItems.value = [];
    visitedCities.value = [];
    currentWeatherCity.value = null;
  };

  // ========== 照片管理功能 ==========

  /**
   * 上传城市照片
   */
  const uploadCityPhoto = async (
    file,
    cityCode,
    cityName,
    caption = "",
    tags = [],
    travelTime = null,
    travelFeeling = ""
  ) => {
    const { useUserStore } = await import("@/store/user.js");
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      ElMessage.error("请先登录");
      return null;
    }

    console.log("📸 Store开始处理照片上传:", {
      fileName: file.name,
      fileSize: file.size,
      cityCode,
      cityName,
      caption,
      tags,
      travelTime,
      travelFeeling
    });

    try {
      // 验证文件
      const validation = cityPhotosApi.validateImageFile(file);
      if (!validation.valid) {
        console.error("❌ 文件验证失败:", validation.error);
        ElMessage.error(validation.error);
        return null;
      }

      console.log("✅ 文件验证通过");

      // 压缩图片
      console.log("🔄 开始压缩图片...");
      const compressedFile = await cityPhotosApi.compressImage(file);
      console.log("✅ 图片压缩完成:", {
        原始大小: file.size,
        压缩后大小: compressedFile.size,
        压缩率: Math.round((1 - compressedFile.size / file.size) * 100) + "%"
      });

      // 上传照片
      console.log("🚀 开始上传到服务器...");
      const response = await cityPhotosApi.uploadPhoto({
        file: compressedFile,
        cityCode,
        cityName,
        caption,
        tags,
        travelTime,
        travelFeeling
      });

      if (response.data) {
        console.log("✅ 服务器上传成功:", response.data);
        ElMessage.success("照片上传成功");
        
        // 直接返回上传成功的照片数据，无需重新获取
        return response.data;
      } else {
        throw new Error("服务器响应异常");
      }
    } catch (error) {
      console.error("❌ 照片上传失败:", {
        error: error.message,
        stack: error.stack,
        fileName: file.name
      });
      
      // 详细错误处理
      if (error.response) {
        console.error("❌ 服务器错误响应:", error.response);
        ElMessage.error(`照片上传失败: ${error.response.data?.message || '服务器错误'}`);
      } else if (error.request) {
        console.error("❌ 网络请求失败:", error.request);
        ElMessage.error("照片上传失败: 网络连接异常");
      } else {
        ElMessage.error("照片上传失败，请重试");
      }
      
      return null;
    }
  };

  /**
   * 获取城市照片列表
   */
  const getCityPhotos = async (cityCode, bustCache = false) => {
    const { useUserStore } = await import("@/store/user.js");
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      console.warn("⚠️ 用户未登录，无法获取照片");
      return [];
    }

    console.log("📷 获取城市照片:", {
      cityCode,
      bustCache,
      userId: userStore.userId
    });

    try {
      const response = await cityPhotosApi.getCityPhotos(
        cityCode,
        bustCache,
      );
      
      const cityData = response.data || null;
      console.log("✅ 获取照片成功:", {
        cityCode,
        cityData: cityData ? {
          id: cityData.id,
          cityName: cityData.cityName,
          photoUrl: cityData.photoUrl,
          thumbnailUrl: cityData.thumbnailUrl,
          travelTime: cityData.travelTime,
          travelFeeling: cityData.travelFeeling
        } : null
      });
      
      // 返回数组格式以保持兼容性
      return cityData ? [cityData] : [];
    } catch (error) {
      console.error("❌ 获取城市照片失败:", {
        cityCode,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // 详细错误处理 - 针对400错误特殊处理
      if (error.response?.status === 400) {
        console.warn("⚠️ 400错误，可能是参数问题或数据暂未同步");
        // 对于400错误，返回空数组但不抛出异常
        return [];
      } else if (error.response?.status === 401) {
        console.error("❌ 认证失败，需要重新登录");
        ElMessage.error("认证失败，请重新登录");
        return [];
      } else if (error.response?.status >= 500) {
        console.error("❌ 服务器内部错误");
        // 服务器错误时可以重试
        throw error;
      } else if (error.request) {
        console.error("❌ 网络请求失败:", error.request);
        throw error;
      }
      
      return [];
    }
  };

  /**
   * 获取用户所有照片
   */
  const getUserPhotos = async () => {
    const { useUserStore } = await import("@/store/user.js");
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      return [];
    }

    try {
      const response = await cityPhotosApi.getUserPhotos();
      return response.data || [];
    } catch (error) {
      console.error("❌ 获取用户照片失败:", error);
      return [];
    }
  };

  /**
   * 更新照片信息
   */
  const updatePhoto = async (photoId, caption, tags = []) => {
    const { useUserStore } = await import("@/store/user.js");
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      ElMessage.error("请先登录");
      return false;
    }

    try {
      const response = await cityPhotosApi.updatePhoto(photoId, {
        caption,
        tags,
      });

      if (response.data) {
        ElMessage.success("照片信息更新成功");
        return response.data;
      } else {
        throw new Error("更新失败");
      }
    } catch (error) {
      console.error("❌ 更新照片失败:", error);
      ElMessage.error("更新照片失败，请重试");
      return false;
    }
  };

  /**
   * 删除照片
   */
  const deletePhoto = async (photoId) => {
    const { useUserStore } = await import("@/store/user.js");
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      ElMessage.error("请先登录");
      return false;
    }

    try {
      const response = await cityPhotosApi.deletePhoto(photoId);

      if (response.success !== false) {
        ElMessage.success("照片删除成功");
        return true;
      } else {
        throw new Error("删除失败");
      }
    } catch (error) {
      console.error("❌ 删除照片失败:", error);
      ElMessage.error("删除照片失败，请重试");
      return false;
    }
  };

  /**
   * 设置封面照片
   */
  const setCoverPhoto = async (photoId) => {
    const { useUserStore } = await import("@/store/user.js");
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      ElMessage.error("请先登录");
      return false;
    }

    try {
      const response = await cityPhotosApi.setCoverPhoto(photoId);

      if (response.success !== false) {
        ElMessage.success("封面设置成功");
        return true;
      } else {
        throw new Error("设置封面失败");
      }
    } catch (error) {
      console.error("❌ 设置封面失败:", error);
      ElMessage.error("设置封面失败，请重试");
      return false;
    }
  };

  /**
   * 获取照片统计信息
   */
  const getPhotoStats = async () => {
    const { useUserStore } = await import("@/store/user.js");
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      return { totalPhotos: 0, citiesWithPhotos: 0 };
    }

    try {
      const response = await cityPhotosApi.getPhotoStats();
      return response.data || { totalPhotos: 0, citiesWithPhotos: 0 };
    } catch (error) {
      console.error("❌ 获取照片统计失败:", error);
      return { totalPhotos: 0, citiesWithPhotos: 0 };
    }
  };

  // ========== 新增照片管理方法 ==========

  /**
   * 批量上传照片
   */
  const batchUploadPhotos = async (files, cityCode, cityName, options = {}) => {
    const { useUserStore } = await import("@/store/user.js");
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      ElMessage.error("请先登录");
      return { success: 0, failed: 0, results: [] };
    }

    const results = [];
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const result = await uploadCityPhoto(
          file,
          cityCode,
          cityName,
          options.caption || `照片 ${i + 1}`,
          options.tags || [],
          options.travelTime || null,
          options.travelFeeling || ""
        );

        if (result) {
          results.push({ file: file.name, success: true, data: result });
          successCount++;
        } else {
          results.push({ file: file.name, success: false, error: "上传失败" });
          failedCount++;
        }

        // 调用进度回调
        if (options.onProgress) {
          options.onProgress({
            current: i + 1,
            total: files.length,
            currentFile: file.name,
            success: successCount,
            failed: failedCount,
          });
        }
      } catch (error) {
        console.error(`上传文件 ${file.name} 失败:`, error);
        results.push({ file: file.name, success: false, error: error.message });
        failedCount++;
      }
    }

    const message = `批量上传完成：成功 ${successCount} 张，失败 ${failedCount} 张`;
    if (successCount > 0 && failedCount === 0) {
      ElMessage.success(message);
    } else if (successCount > 0) {
      ElMessage.warning(message);
    } else {
      ElMessage.error(message);
    }

    return { success: successCount, failed: failedCount, results };
  };

  /**
   * 更新照片排序
   */
  const updatePhotoOrder = async (photoIds) => {
    const { useUserStore } = await import("@/store/user.js");
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      ElMessage.error("请先登录");
      return false;
    }

    try {
      const response = await cityPhotosApi.updatePhotoOrder(photoIds);

      if (response.success !== false) {
        ElMessage.success("照片排序更新成功");
        return true;
      } else {
        throw new Error("更新排序失败");
      }
    } catch (error) {
      console.error("❌ 更新照片排序失败:", error);
      ElMessage.error("更新排序失败，请重试");
      return false;
    }
  };

  /**
   * 批量删除照片
   */
  const batchDeletePhotos = async (photoIds) => {
    const { useUserStore } = await import("@/store/user.js");
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      ElMessage.error("请先登录");
      return 0;
    }

    try {
      const response = await cityPhotosApi.batchDeletePhotos(photoIds);
      const deletedCount = response.data || 0;

      ElMessage.success(`成功删除 ${deletedCount} 张照片`);
      return deletedCount;
    } catch (error) {
      console.error("❌ 批量删除照片失败:", error);
      ElMessage.error("批量删除失败，请重试");
      return 0;
    }
  };

  /**
   * 根据ID获取照片详情
   */
  const getPhotoById = async (photoId) => {
    const { useUserStore } = await import("@/store/user.js");
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      return null;
    }

    try {
      const response = await cityPhotosApi.getPhotoById(photoId);
      return response.data || null;
    } catch (error) {
      console.error("❌ 获取照片详情失败:", error);
      return null;
    }
  };

  /**
   * 迁移legacy照片数据
   * 将wishlist item中的photo字段迁移到visited_cities表
   */
  const migrateLegacyPhoto = async (cityItem) => {
    if (!cityItem.photo) {
      return false; // 没有legacy照片需要迁移
    }

    try {
      // 检查是否已经有新格式的照片
      const existingPhotos = await getCityPhotos(cityItem.cityCode || cityItem.city_code);
      if (existingPhotos.length > 0) {
        return false; // 已经有新照片了，不需要迁移
      }

      // 创建一个模拟的File对象用于上传（如果photo是URL的话）
      // 实际实现中，你可能需要从URL下载图片然后上传
      // 这里先记录需要迁移，但不实际实现复杂的迁移逻辑

      console.info(`发现需要迁移的legacy照片: ${cityItem.cityName}`);
      ElMessage.info(
        `检测到 ${cityItem.cityName} 有旧格式照片，建议重新上传以获得更好的功能`,
      );

      return true;
    } catch (error) {
      console.error("❌ 迁移legacy照片失败:", error);
      return false;
    }
  };

  /**
   * 更新城市信息
   */
  const updateCityInfo = async (cityId, updateData) => {
    const { useUserStore } = await import("@/store/user.js");
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      ElMessage.error("请先登录");
      return false;
    }

    try {
      const response = await cityPhotosApi.updateCityInfo(cityId, updateData);

      if (response.data) {
        ElMessage.success("城市信息更新成功");
        return response.data;
      } else {
        throw new Error("更新失败");
      }
    } catch (error) {
      console.error("❌ 更新城市信息失败:", error);
      ElMessage.error("更新城市信息失败，请重试");
      return false;
    }
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
    visitedCount,
    wishlistOnlyCount,
    exploredProvincesCount,
    footprintStats,

    // 新的计算属性
    citiesWithPhotos,
    wishlistCities,
    visitedCities,
    
    // 新的状态检查方法
    isCityInWishlistToVisit,
    isCityVisited,

    // 愿望清单方法
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    isCityInWishlist,
    getWishlistItemByCityCode,
    updateWishlistItem,
    markAsVisited,
    markWantToVisitAgain,
    batchMarkAsVisited,
    setCurrentWeatherCity,
    getNextWeatherCity,
    clearWishlist,

    // 照片管理方法
    uploadCityPhoto,
    getCityPhotos,
    getUserPhotos,
    updatePhoto,
    deletePhoto,
    setCoverPhoto,
    getPhotoStats,
    updateCityInfo, // 新增方法

    // 新增照片管理方法
    batchUploadPhotos,
    updatePhotoOrder,
    batchDeletePhotos,
    getPhotoById,
    migrateLegacyPhoto,
    
    // 足迹城市专用方法
    getVisitedCityByCityCode,
  };
});
