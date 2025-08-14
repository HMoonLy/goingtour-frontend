/**
 * 愿望清单 Store - 管理用户的旅行愿望清单
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { wishlistApi } from '@/api/wishlist.js';
import { cityPhotosApi } from '@/api/cityPhotos.js';
import { ElMessage } from 'element-plus';

export const useWishlistStore = defineStore('wishlist', () => {
  // 状态
  const wishlistItems = ref([]);
  const loading = ref(false);
  const currentWeatherCity = ref(null); // 当前天气预览显示的城市

  // 计算属性
  const wishlistCount = computed(() => wishlistItems.value.length);

  const hasCities = computed(() => wishlistCount.value > 0);

  // 去过的城市数量
  const visitedCount = computed(
    () => wishlistItems.value.filter(item => item.status === 'visited').length
  );

  // 想去的城市数量
  const wishlistOnlyCount = computed(
    () => wishlistItems.value.filter(item => item.status === 'wishlist').length
  );

  // 已探索的省份数量（基于去过的城市）
  const exploredProvincesCount = computed(() => {
    const visitedCities = wishlistItems.value.filter(
      item => item.status === 'visited'
    );
    const provinces = new Set();

    visitedCities.forEach(city => {
      if (city.cityCode) {
        const provinceCode = city.cityCode.toString().substring(0, 2);
        provinces.add(provinceCode);
      }
    });

    return provinces.size;
  });

  // 足迹统计
  const footprintStats = computed(() => ({
    totalCities: wishlistCount.value,
    visitedCities: visitedCount.value,
    wishlistCities: wishlistOnlyCount.value,
    exploredProvinces: exploredProvincesCount.value,
    explorationRate:
      exploredProvincesCount.value > 0
        ? Math.round((exploredProvincesCount.value / 34) * 100)
        : 0, // 中国34个省级行政区
  }));

  const cityNames = computed(() =>
    wishlistItems.value.map(item => item.cityName)
  );

  const cityCodes = computed(() =>
    wishlistItems.value.map(item => item.cityCode)
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
    const { useUserStore } = await import('@/store/user.js');
    const userStore = useUserStore();
    const userId = userStore.currentUser?.id || userStore.userId;

    if (!userId) {
      console.warn('用户未登录，无法加载愿望清单');
      return;
    }

    loading.value = true;
    try {
      const response = await wishlistApi.getUserWishlist(userId);
      wishlistItems.value = response.data || [];
      console.log('✅ 愿望清单加载成功:', wishlistItems.value.length, '个城市');
    } catch (error) {
      console.error('❌ 加载愿望清单失败:', error);
      wishlistItems.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 添加城市到愿望清单
   */
  const addToWishlist = async cityData => {
    const { useUserStore } = await import('@/store/user.js');
    const userStore = useUserStore();
    const userId = userStore.currentUser?.id || userStore.userId;

    if (!userId) {
      ElMessage.warning('请先登录');
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
        reason: cityData.reason || '',
        tags: cityData.tags || [],
        status: cityData.status || 'wishlist', // 默认为想去
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
      console.error('❌ 添加到愿望清单失败:', error);
      ElMessage.error('添加失败，请重试');
      return false;
    }
  };

  /**
   * 从愿望清单删除城市
   */
  const removeFromWishlist = async wishlistId => {
    const { useUserStore } = await import('@/store/user.js');
    const userStore = useUserStore();
    const userId = userStore.currentUser?.id || userStore.userId;

    if (!userId) return false;

    try {
      await wishlistApi.removeFromWishlist(wishlistId, userId);

      // 从本地状态删除
      const index = wishlistItems.value.findIndex(
        item => item.id === wishlistId
      );
      if (index !== -1) {
        const cityName = wishlistItems.value[index].cityName;
        wishlistItems.value.splice(index, 1);
        ElMessage.success(`已从愿望清单移除 ${cityName}`);
      }

      return true;
    } catch (error) {
      console.error('❌ 从愿望清单删除失败:', error);
      ElMessage.error('删除失败，请重试');
      return false;
    }
  };

  /**
   * 检查城市是否在愿望清单中
   */
  const isCityInWishlist = cityCode => {
    return wishlistItems.value.some(item => item.cityCode === cityCode);
  };

  /**
   * 根据城市编码获取愿望清单项
   */
  const getWishlistItemByCityCode = cityCode => {
    return wishlistItems.value.find(item => item.cityCode === cityCode);
  };

  /**
   * 快速切换城市状态（想去/去过）
   */
  const toggleCityStatus = async (wishlistId, newStatus) => {
    const { useUserStore } = await import('@/store/user.js');
    const userStore = useUserStore();
    const userId = userStore.currentUser?.id || userStore.userId;

    if (!userId) {
      console.error('❌ 用户ID不存在，当前用户状态:', {
        isLoggedIn: userStore.isLoggedIn,
        currentUser: userStore.currentUser,
        userId: userStore.userId,
      });
      ElMessage.error('用户未登录，请先登录');
      return false;
    }

    try {
      await wishlistApi.updateWishlistItem(wishlistId, {
        userId,
        status: newStatus,
      });

      // 更新本地状态
      const index = wishlistItems.value.findIndex(
        item => item.id === wishlistId
      );
      if (index !== -1) {
        const cityName = wishlistItems.value[index].cityName;
        wishlistItems.value[index] = {
          ...wishlistItems.value[index],
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };

        const statusText = newStatus === 'visited' ? '去过' : '想去';
        ElMessage.success(`已将 ${cityName} 标记为${statusText}`);
      }

      return true;
    } catch (error) {
      console.error('❌ 切换城市状态失败:', error);
      ElMessage.error('操作失败，请重试');
      return false;
    }
  };

  /**
   * 批量标记城市状态
   */
  const batchUpdateStatus = async (cityIds, newStatus) => {
    const { useUserStore } = await import('@/store/user.js');
    const userStore = useUserStore();
    const userId = userStore.currentUser?.id || userStore.userId;

    if (!userId) return false;

    try {
      // 这里假设后端支持批量更新，如果不支持则需要逐个更新
      await Promise.all(
        cityIds.map(id =>
          wishlistApi.updateWishlistItem(id, { userId, status: newStatus })
        )
      );

      // 更新本地状态
      cityIds.forEach(id => {
        const index = wishlistItems.value.findIndex(item => item.id === id);
        if (index !== -1) {
          wishlistItems.value[index] = {
            ...wishlistItems.value[index],
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
      });

      const statusText = newStatus === 'visited' ? '去过' : '想去';
      ElMessage.success(`已批量标记 ${cityIds.length} 个城市为${statusText}`);
      return true;
    } catch (error) {
      console.error('❌ 批量更新状态失败:', error);
      ElMessage.error('批量操作失败，请重试');
      return false;
    }
  };

  /**
   * 更新愿望清单项
   */
  const updateWishlistItem = async (wishlistId, updateData) => {
    const { useUserStore } = await import('@/store/user.js');
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
        item => item.id === wishlistId
      );
      if (index !== -1) {
        wishlistItems.value[index] = {
          ...wishlistItems.value[index],
          ...updateData,
          updatedAt: new Date().toISOString(),
        };
        ElMessage.success('愿望清单更新成功');
      }

      return true;
    } catch (error) {
      console.error('❌ 更新愿望清单失败:', error);
      ElMessage.error('更新失败，请重试');
      return false;
    }
  };

  /**
   * 设置当前天气显示的城市
   */
  const setCurrentWeatherCity = city => {
    currentWeatherCity.value = city;
  };

  /**
   * 获取下一个城市（用于天气轮播）
   */
  const getNextWeatherCity = () => {
    if (!hasCities.value) return null;

    const currentIndex = currentWeatherCity.value
      ? wishlistItems.value.findIndex(
          item => item.id === currentWeatherCity.value.id
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

  // ========== 照片管理功能 ==========

  /**
   * 上传城市照片
   */
  const uploadCityPhoto = async (
    file,
    wishlistItemId,
    caption = '',
    tags = []
  ) => {
    const { useUserStore } = await import('@/store/user.js');
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      ElMessage.error('请先登录');
      return null;
    }

    try {
      // 验证文件
      const validation = cityPhotosApi.validateImageFile(file);
      if (!validation.valid) {
        ElMessage.error(validation.error);
        return null;
      }

      // 压缩图片
      const compressedFile = await cityPhotosApi.compressImage(file);

      // 上传照片
      const response = await cityPhotosApi.uploadPhoto({
        file: compressedFile,
        wishlistItemId,
        caption,
        tags,
      });

      if (response.data) {
        ElMessage.success('照片上传成功');
        return response.data;
      } else {
        throw new Error('上传失败');
      }
    } catch (error) {
      console.error('❌ 上传照片失败:', error);
      ElMessage.error('照片上传失败，请重试');
      return null;
    }
  };

  /**
   * 获取城市照片列表
   */
  const getCityPhotos = async wishlistItemId => {
    const { useUserStore } = await import('@/store/user.js');
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      return [];
    }

    try {
      const response = await cityPhotosApi.getCityPhotos(wishlistItemId);
      return response.data || [];
    } catch (error) {
      console.error('❌ 获取城市照片失败:', error);
      return [];
    }
  };

  /**
   * 获取用户所有照片
   */
  const getUserPhotos = async () => {
    const { useUserStore } = await import('@/store/user.js');
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      return [];
    }

    try {
      const response = await cityPhotosApi.getUserPhotos();
      return response.data || [];
    } catch (error) {
      console.error('❌ 获取用户照片失败:', error);
      return [];
    }
  };

  /**
   * 更新照片信息
   */
  const updatePhoto = async (photoId, caption, tags = []) => {
    const { useUserStore } = await import('@/store/user.js');
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      ElMessage.error('请先登录');
      return false;
    }

    try {
      const response = await cityPhotosApi.updatePhoto(photoId, {
        caption,
        tags,
      });

      if (response.data) {
        ElMessage.success('照片信息更新成功');
        return response.data;
      } else {
        throw new Error('更新失败');
      }
    } catch (error) {
      console.error('❌ 更新照片失败:', error);
      ElMessage.error('更新照片失败，请重试');
      return false;
    }
  };

  /**
   * 删除照片
   */
  const deletePhoto = async photoId => {
    const { useUserStore } = await import('@/store/user.js');
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      ElMessage.error('请先登录');
      return false;
    }

    try {
      const response = await cityPhotosApi.deletePhoto(photoId);

      if (response.success !== false) {
        ElMessage.success('照片删除成功');
        return true;
      } else {
        throw new Error('删除失败');
      }
    } catch (error) {
      console.error('❌ 删除照片失败:', error);
      ElMessage.error('删除照片失败，请重试');
      return false;
    }
  };

  /**
   * 设置封面照片
   */
  const setCoverPhoto = async photoId => {
    const { useUserStore } = await import('@/store/user.js');
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      ElMessage.error('请先登录');
      return false;
    }

    try {
      const response = await cityPhotosApi.setCoverPhoto(photoId);

      if (response.success !== false) {
        ElMessage.success('封面设置成功');
        return true;
      } else {
        throw new Error('设置封面失败');
      }
    } catch (error) {
      console.error('❌ 设置封面失败:', error);
      ElMessage.error('设置封面失败，请重试');
      return false;
    }
  };

  /**
   * 获取照片统计信息
   */
  const getPhotoStats = async () => {
    const { useUserStore } = await import('@/store/user.js');
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      return { totalPhotos: 0, citiesWithPhotos: 0 };
    }

    try {
      const response = await cityPhotosApi.getPhotoStats();
      return response.data || { totalPhotos: 0, citiesWithPhotos: 0 };
    } catch (error) {
      console.error('❌ 获取照片统计失败:', error);
      return { totalPhotos: 0, citiesWithPhotos: 0 };
    }
  };

  // ========== 新增照片管理方法 ==========

  /**
   * 批量上传照片
   */
  const batchUploadPhotos = async (files, wishlistItemId, options = {}) => {
    const { useUserStore } = await import('@/store/user.js');
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      ElMessage.error('请先登录');
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
          wishlistItemId,
          options.caption || `照片 ${i + 1}`,
          options.tags || []
        );

        if (result) {
          results.push({ file: file.name, success: true, data: result });
          successCount++;
        } else {
          results.push({ file: file.name, success: false, error: '上传失败' });
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
  const updatePhotoOrder = async photoIds => {
    const { useUserStore } = await import('@/store/user.js');
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      ElMessage.error('请先登录');
      return false;
    }

    try {
      const response = await cityPhotosApi.updatePhotoOrder(photoIds);

      if (response.success !== false) {
        ElMessage.success('照片排序更新成功');
        return true;
      } else {
        throw new Error('更新排序失败');
      }
    } catch (error) {
      console.error('❌ 更新照片排序失败:', error);
      ElMessage.error('更新排序失败，请重试');
      return false;
    }
  };

  /**
   * 批量删除照片
   */
  const batchDeletePhotos = async photoIds => {
    const { useUserStore } = await import('@/store/user.js');
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      ElMessage.error('请先登录');
      return 0;
    }

    try {
      const response = await cityPhotosApi.batchDeletePhotos(photoIds);
      const deletedCount = response.data || 0;

      ElMessage.success(`成功删除 ${deletedCount} 张照片`);
      return deletedCount;
    } catch (error) {
      console.error('❌ 批量删除照片失败:', error);
      ElMessage.error('批量删除失败，请重试');
      return 0;
    }
  };

  /**
   * 根据ID获取照片详情
   */
  const getPhotoById = async photoId => {
    const { useUserStore } = await import('@/store/user.js');
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
      return null;
    }

    try {
      const response = await cityPhotosApi.getPhotoById(photoId);
      return response.data || null;
    } catch (error) {
      console.error('❌ 获取照片详情失败:', error);
      return null;
    }
  };

  /**
   * 迁移legacy照片数据
   * 将wishlist item中的photo字段迁移到city_photos表
   */
  const migrateLegacyPhoto = async wishlistItem => {
    if (!wishlistItem.photo) {
      return false; // 没有legacy照片需要迁移
    }

    try {
      // 检查是否已经有新格式的照片
      const existingPhotos = await getCityPhotos(wishlistItem.id);
      if (existingPhotos.length > 0) {
        return false; // 已经有新照片了，不需要迁移
      }

      // 创建一个模拟的File对象用于上传（如果photo是URL的话）
      // 实际实现中，你可能需要从URL下载图片然后上传
      // 这里先记录需要迁移，但不实际实现复杂的迁移逻辑

      console.info(`发现需要迁移的legacy照片: ${wishlistItem.cityName}`);
      ElMessage.info(
        `检测到 ${wishlistItem.cityName} 有旧格式照片，建议重新上传以获得更好的功能`
      );

      return true;
    } catch (error) {
      console.error('❌ 迁移legacy照片失败:', error);
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

    // 愿望清单方法
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    isCityInWishlist,
    getWishlistItemByCityCode,
    updateWishlistItem,
    toggleCityStatus,
    batchUpdateStatus,
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

    // 新增照片管理方法
    batchUploadPhotos,
    updatePhotoOrder,
    batchDeletePhotos,
    getPhotoById,
    migrateLegacyPhoto,
  };
});
