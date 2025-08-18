<template>
  <div class="visited-cities-gallery">
    <!-- 标题区域 -->
    <div class="gallery-header">
      <div class="header-title">
        <el-icon size="20" class="title-icon">
          <Camera />
        </el-icon>
        <h3 class="title-text">去过的城市</h3>
        <span v-if="citiesWithPhotos.length > 0" class="photo-count">
          ({{ citiesWithPhotos.length }}个城市)
        </span>
      </div>

      <!-- 展开/收起按钮 -->
      <div v-if="needsToggle" class="toggle-section">
        <el-button
          type="text"
          size="small"
          class="toggle-btn"
          @click="toggleExpanded"
        >
          <span>{{
            isExpanded
              ? "收起"
              : `展示更多 (${citiesWithPhotos.length - props.maxDisplayCount}+)`
          }}</span>
          <el-icon class="toggle-icon" :class="{ expanded: isExpanded }">
            <ArrowDown />
          </el-icon>
        </el-button>
      </div>
    </div>

    <!-- 照片展示区域 -->
    <div class="photos-container">
      <!-- 有去过城市的情况 -->
      <div v-if="citiesWithPhotos.length > 0" class="photos-grid">
        <div
          v-for="(city, index) in displayedCities"
          :key="city.id"
          :data-city-id="city.id"
          class="city-photo-item"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="photo-wrapper" @click="handlePhotoClick(city)">
            <!-- 想再去标识 -->
            <div
              v-if="city.ever_visited && city.want_to_visit_again"
              class="want-again-badge"
            >
              <el-icon><Star /></el-icon>
              <span>想再去</span>
            </div>

            <!-- 有照片的情况（显示封面/第一张） -->
            <template v-if="getCoverUrl(city)">
              <img
                :src="getCoverUrl(city)"
                :alt="city.cityName"
                class="city-photo"
                @error="handleImageError"
              />
            </template>

            <!-- 没有照片的情况 - 上传引导 -->
            <template v-else>
              <div class="upload-placeholder">
                <el-icon size="32" class="upload-icon">
                  <Plus />
                </el-icon>
                <p class="upload-text">
                  {{ city.cityName }}
                </p>
                <p class="upload-hint">点击添加照片</p>
              </div>
            </template>

            <!-- 照片信息遮罩 - 固定在底部 -->
            <div v-if="getCoverUrl(city)" class="photo-info-overlay">
              <div class="city-info">
                <span class="city-name">{{ city.cityName }}</span>
                <span v-if="city.travelTime" class="travel-time">
                  {{ formatTravelTime(city.travelTime) }}
                </span>
                <span v-else class="visit-date">{{
                  formatVisitDate(city.updatedAt)
                }}</span>
                <span v-if="city.travelFeeling" class="travel-feeling">
                  {{ city.travelFeeling }}
                </span>
              </div>
            </div>

            <!-- 操作按钮层 - 悬浮居中显示 -->
            <div v-if="getCoverUrl(city)" class="photo-actions-overlay">
              <div class="actions-backdrop"></div>
              <div class="photo-actions">
                <el-tooltip content="编辑信息" placement="top">
                  <el-button
                    size="small"
                    type="info"
                    circle
                    class="action-btn"
                    @click.stop="handleEditCity(city)"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </el-tooltip>

                <!-- 想再去按钮 -->
                <el-tooltip 
                  :content="city.want_to_visit_again ? '取消想再去' : '标记想再去'" 
                  placement="top"
                >
                  <el-button
                    size="small"
                    :type="city.want_to_visit_again ? 'warning' : 'success'"
                    circle
                    class="action-btn"
                    @click.stop="handleToggleWantAgain(city)"
                  >
                    <el-icon>
                      <Star v-if="city.want_to_visit_again" />
                      <StarFilled v-else />
                    </el-icon>
                  </el-button>
                </el-tooltip>

                <el-tooltip content="更换照片" placement="top">
                  <el-button
                    size="small"
                    type="primary"
                    circle
                    class="action-btn"
                    @click.stop="handlePhotoClick(city)"
                  >
                    <el-icon><Camera /></el-icon>
                  </el-button>
                </el-tooltip>

                <el-dropdown
                  trigger="click"
                  placement="bottom-end"
                  @click.stop
                >
                  <el-button
                    size="small"
                    type="danger"
                    circle
                    class="action-btn"
                    @click.stop
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="handleDeletePhoto(city)">
                        <el-icon><Delete /></el-icon>
                        删除照片
                      </el-dropdown-item>
                      <el-dropdown-item
                        divided
                        class="delete-item"
                        @click="handleDeleteVisitedCity(city)"
                      >
                        <el-icon><Delete /></el-icon>
                        删除城市记录
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>

            <!-- 城市名称 (无照片时显示) -->
            <div v-if="!getCoverUrl(city)" class="city-name-bottom">
              {{ city.cityName }}
            </div>

            <!-- 胶片孔效果 -->
            <div v-if="city.photo" class="film-holes">
              <div class="hole" />
              <div class="hole" />
              <div class="hole" />
            </div>
          </div>
        </div>
      </div>

      <!-- 完全没有去过城市的空状态 -->
      <div v-else class="empty-gallery">
        <div class="empty-content">
          <el-icon size="64" class="empty-icon">
            <CameraFilled />
          </el-icon>
          <h4>还没有足迹照片</h4>
          <p>标记一些城市为"去过"，然后上传你的旅行照片</p>
          <el-button type="primary" @click="$emit('add-visited-city')">
            <el-icon><Plus /></el-icon>
            添加去过的城市
          </el-button>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/gif"
      style="display: none"
      @change="handleFileSelect"
    />

    <!-- 编辑城市信息对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑城市信息"
      width="500"
      :close-on-click-modal="false"
      class="edit-city-dialog"
    >
      <el-form
        v-if="editingCity"
        ref="editFormRef"
        :model="editForm"
        label-width="100px"
        label-position="left"
        class="edit-form"
      >
        <el-form-item label="城市名称">
          <el-input
            v-model="editForm.cityName"
            disabled
            class="disabled-input"
          />
        </el-form-item>

        <el-form-item label="旅行时间">
          <el-date-picker
            v-model="editForm.travelTime"
            type="month"
            placeholder="选择旅行时间"
            format="YYYY年MM月"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            class="travel-time-picker"
          />
        </el-form-item>

        <el-form-item label="旅行感受">
          <el-input
            v-model="editForm.travelFeeling"
            type="textarea"
            :rows="3"
            placeholder="分享一下你在这里的旅行感受..."
            maxlength="200"
            show-word-limit
            class="travel-feeling-input"
          />
        </el-form-item>

        <el-form-item label="标签">
          <el-tag
            v-for="tag in editForm.tags"
            :key="tag"
            closable
            @close="removeTag(tag)"
            class="tag-item"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="inputRef"
            v-model="inputValue"
            class="tag-input"
            size="small"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button
            v-else
            class="add-tag-btn"
            size="small"
            @click="showInput"
          >
            + 添加标签
          </el-button>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleEditCancel">取消</el-button>
          <el-button type="primary" @click="handleEditConfirm" :loading="updating">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Camera,
  Plus,
  Delete,
  CameraFilled,
  ArrowDown,
  Star,
  StarFilled,
  Edit,
} from "@element-plus/icons-vue";
import { useWishlistStore } from "@/store/wishlist.js";
import {
  getCityPhotoUrl,
  getCityThumbnailUrl,
} from "@/utils/media/imageUrl.js";
import { weatherApi } from "@/api/weather.js";

// Props - 现在使用store中的数据
const props = defineProps({
  maxDisplayCount: {
    type: Number,
    default: 6,
  },
});

// Emits
const emit = defineEmits([
  "photo-uploaded",
  "photo-deleted",
  "city-deleted",
  "add-visited-city",
]);

// Store
const wishlistStore = useWishlistStore();

// 使用store中的citiesWithPhotos数据
const citiesWithPhotos = computed(() => wishlistStore.citiesWithPhotos);

// 响应式数据
const fileInput = ref(null);
const currentCity = ref(null);
const uploading = ref(false);
const coverMap = ref({}); // cityId -> cover URL
const isExpanded = ref(false); // 展开/收起状态
const maxDisplayCount = ref(10); // 默认显示的城市数量

// 编辑相关状态
const showEditDialog = ref(false);
const editingCity = ref(null);
const editFormRef = ref(null);
const inputRef = ref(null);
const updating = ref(false);
const inputVisible = ref(false);
const inputValue = ref("");

const editForm = ref({
  cityName: "",
  travelTime: null,
  travelFeeling: "",
  tags: [],
});

// 方法

const normalizePhotoUrl = (url) => {
  if (!url) return "";
  // 服务端在标记为 visited 时可能插入占位图片记录，路径为 /static/images/visited-placeholder*.jpg。
  // 该静态路径并不存在于前端工程，视为"无照片"以展示上传占位。
  if (url.startsWith("/static/images/visited-placeholder")) return "";

  // 使用统一的图片URL规范化工具
  return getCityPhotoUrl(url);
};

const getCoverUrl = (city) => coverMap.value[city.id] || "";

// 计算显示的城市列表
const displayedCities = computed(() => {
  if (
    isExpanded.value ||
    citiesWithPhotos.value.length <= props.maxDisplayCount
  ) {
    return citiesWithPhotos.value;
  }
  return citiesWithPhotos.value.slice(0, props.maxDisplayCount);
});

// 是否需要显示展开/收起按钮
const needsToggle = computed(() => {
  return citiesWithPhotos.value.length > props.maxDisplayCount;
});

// 切换展开/收起状态
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const refreshCoverForCity = async (cityId, bustCache = false) => {
  try {
    console.log(`🔄 refreshCoverForCity called for cityId: ${cityId}, bustCache: ${bustCache}`);
    
    // 通过cityId找到对应的城市对象
    const city = citiesWithPhotos.value.find(c => c.id === cityId);
    if (!city) {
      console.warn(`找不到ID为 ${cityId} 的城市`);
      return;
    }
    
    console.log(`📍 refreshCoverForCity - 城市信息:`, {
      cityId,
      cityName: city.cityName,
      adcode: city.adcode,
      cityCode: city.cityCode,
      isNewCity: !previousCityIds.has(cityId)
    });
    
    // 使用城市记录中存储的编码，优先使用 adcode（对应数据库的city_code）
    const cityCodeForQuery = city.adcode || city.citycode;
    if (!cityCodeForQuery) {
      console.warn(`城市 ${city.cityName} 缺少有效的城市编码，可用字段:`, Object.keys(city));
      return;
    }
    
    console.log(`🏙️ 使用城市编码查询照片: ${cityCodeForQuery} for ${city.cityName}`);
    
    const photos = await wishlistStore.getCityPhotos(cityCodeForQuery, bustCache, true); // 使用静默模式
    if (photos && photos.length > 0) {
      const cover = photos.find((p) => p.isCover) || photos[0];
      // 优先使用缩略图，如果没有则使用原图
      let imageUrl = cover.thumbnailUrl
        ? getCityThumbnailUrl(cover.thumbnailUrl)
        : getCityPhotoUrl(cover.photoUrl);

      // 使用 normalizePhotoUrl 过滤占位符
      imageUrl = normalizePhotoUrl(imageUrl);

      if (imageUrl) {
        // 添加缓存破坏参数，确保显示最新照片
        const cacheBuster = `?t=${Date.now()}`;
        const finalUrl = imageUrl + cacheBuster;

        coverMap.value = {
          ...coverMap.value,
          [cityId]: finalUrl,
        };
      } else {
        // 如果是占位符或无有效照片，从 coverMap 中移除
        const { [cityId]: _, ...rest } = coverMap.value;
        coverMap.value = rest;
      }
    } else {
      // 无照片时静默处理，不显示错误信息
      const { [cityId]: _, ...rest } = coverMap.value;
      coverMap.value = rest;
    }
  } catch (error) {
    // 静默处理照片获取失败，避免干扰用户体验
    // 对于新添加的城市，没有照片是正常情况
    console.debug(`获取城市 ${cityId} 的封面照片失败:`, error.message);
    const { [cityId]: _, ...rest } = coverMap.value;
    coverMap.value = rest;
  }
};

const refreshAllCovers = async (onlyExistingCities = false) => {
  const ids = citiesWithPhotos.value.map((c) => c.id);
  
  console.log(`🔄 refreshAllCovers called`, {
    onlyExistingCities,
    allCityIds: ids,
    previousCityIds: [...previousCityIds]
  });
  
  if (onlyExistingCities && previousCityIds.size > 0) {
    // 只刷新之前已存在的城市
    const existingIds = ids.filter(id => previousCityIds.has(id));
    console.log(`📋 只刷新现有城市:`, existingIds);
    await Promise.all(existingIds.map((id) => refreshCoverForCity(id)));
  } else {
    // 刷新所有城市（初始加载时使用）
    console.log(`📋 刷新所有城市:`, ids);
    await Promise.all(ids.map((id) => refreshCoverForCity(id)));
  }
};

/**
 * 处理照片点击 - 上传或替换照片
 */
const handlePhotoClick = (city) => {
  currentCity.value = city;
  fileInput.value?.click();
};

/**
 * 处理文件选择
 */
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (!file || !currentCity.value) return;

  // 验证文件
  const validation = validateFile(file);
  if (!validation.valid) {
    ElMessage.error(validation.error);
    return;
  }

  uploadPhoto(file);
};

/**
 * 上传照片
 */
const uploadPhoto = async (file) => {
  if (uploading.value) return;

  uploading.value = true;
  const loadingMessage = ElMessage.info({
    message: `正在上传 ${currentCity.value.cityName} 的照片...`,
    duration: 0,
  });

  try {
    console.log("📸 开始上传照片:", currentCity.value.cityName);

    // 使用新的visited cities API上传照片
    const result = await wishlistStore.uploadCityPhoto(
      file,
      currentCity.value.adcode,  // 主要的城市编码（6位数字）
      currentCity.value.cityName,
      "",  // caption
      [],  // tags
      currentCity.value.travelTime,
      currentCity.value.travelFeeling,
      currentCity.value.citycode  // 电话区号（可选）
    );

    if (result) {
      console.log("✅ 照片上传返回结果:", result);

      ElMessage.success(`${currentCity.value.cityName} 的照片上传成功！`);

      // 立即更新 coverMap 以显示新照片
      const imageUrl = result.thumbnailUrl
        ? getCityThumbnailUrl(result.thumbnailUrl)
        : getCityPhotoUrl(result.photoUrl);

      if (imageUrl) {
        const cacheBuster = `?t=${Date.now()}`;
        coverMap.value = {
          ...coverMap.value,
          [currentCity.value.id]: normalizePhotoUrl(imageUrl) + cacheBuster,
        };
      }

      // 直接使用上传返回的照片数据，无需重新请求
      emit("photo-uploaded", currentCity.value, result);
    } else {
      ElMessage.error("照片上传失败，请重试");
    }
  } catch (error) {
    console.error("照片上传失败:", error);
    ElMessage.error("照片上传失败，请重试");
  } finally {
    loadingMessage.close();
    uploading.value = false;
    currentCity.value = null;
    // 清空文件输入
    if (fileInput.value) {
      fileInput.value.value = "";
    }
  }
};

/**
 * 删除照片
 */
const handleDeletePhoto = async (city) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${city.cityName} 的封面照片吗？`,
      "删除照片",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    // 查询该城市的照片并删除封面（或第一张）
    // 使用城市记录中存储的编码，优先使用 adcode（对应数据库的city_code）
    const cityCodeForQuery = city.adcode || city.citycode;
    if (!cityCodeForQuery) {
      console.warn(`城市 ${city.cityName} 缺少有效的城市编码，可用字段:`, Object.keys(city));
      return;
    }
    
    const photos = await wishlistStore.getCityPhotos(cityCodeForQuery);
    const cover = photos.find((p) => p.isCover) || photos[0];
    if (!cover) {
      ElMessage.info("当前城市没有可删除的照片");
      return;
    }

    const ok = await wishlistStore.deletePhoto(cover.id);
    if (ok) {
      ElMessage.success(`${city.cityName} 的照片已删除`);
      
      // 立即更新 coverMap，移除已删除照片的封面
      const { [city.id]: _, ...rest } = coverMap.value;
      coverMap.value = rest;
      
      // 直接发送删除事件，无需重新获取照片
      emit("photo-deleted", city);
    } else {
      ElMessage.error("照片删除失败，请重试");
    }
  } catch (error) {
    // 用户取消或删除失败
  }
};

/**
 * 切换想再去状态
 */
const handleToggleWantAgain = async (city) => {
  try {
    const newStatus = !city.want_to_visit_again;
    console.log("🎯 切换想再去状态:", { city, newStatus });
    
    // 传递完整的城市数据而不是ID，让store判断如何处理
    const success = await wishlistStore.markWantToVisitAgain(
      city, // 传递完整的城市对象
      newStatus
    );
    
    if (success) {
      // 更新本地状态
      city.want_to_visit_again = newStatus;
      
      // 不需要显示消息，store中已经显示了
    }
  } catch (error) {
    console.error("切换想再去状态失败:", error);
    ElMessage.error("操作失败，请重试");
  }
};

/**
 * 删除访问城市记录
 */
const handleDeleteVisitedCity = async (city) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${city.cityName} 的访问记录吗？\n\n删除后：\n- 该城市的访问记录和所有照片将被永久删除\n- 如果您还想去这个城市，它会回到愿望清单中`,
      "删除城市记录",
      {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
        confirmButtonClass: "el-button--danger",
      }
    );

    // 找到对应的visited_city记录
    const visitedCity = wishlistStore.visitedCities.find(vc => vc.adcode === city.adcode);
    if (!visitedCity) {
      ElMessage.error("未找到对应的城市记录");
      return;
    }

    const success = await wishlistStore.deleteVisitedCity(visitedCity.id);
    if (success) {
      // 发送删除事件，让父组件知道城市被删除了
      emit("city-deleted", city);
    }
  } catch (error) {
    // 用户取消删除或删除失败
    if (error !== 'cancel') {
      console.error("删除城市记录失败:", error);
    }
  }
};

// 跟踪之前的城市ID列表，用于判断是新增还是变更
let previousCityIds = new Set();

onMounted(() => {
  console.log('🚀 VisitedCitiesGallery mounted');
  if (citiesWithPhotos.value && citiesWithPhotos.value.length > 0) {
    console.log('📋 初始化时发现已有城市，开始刷新封面:', citiesWithPhotos.value.map(c => ({ id: c.id, name: c.cityName })));
    refreshAllCovers(false); // 明确指定为初始加载
    // 初始化previousCityIds
    previousCityIds = new Set(citiesWithPhotos.value.map((c) => c.id));
    console.log('📝 初始化 previousCityIds:', [...previousCityIds]);
  } else {
    console.log('📋 初始化时无城市数据');
  }
});

watch(
  () => citiesWithPhotos.value.map((c) => c.id).join(","),
  (newIdString, oldIdString) => {
    const currentCityIds = new Set(citiesWithPhotos.value.map((c) => c.id));
    
    // 如果是初始加载（从空到有数据）
    if (!oldIdString && newIdString) {
      console.log('🚀 初始加载城市列表，刷新所有城市封面');
      refreshAllCovers(false); // 初始加载时刷新所有城市
      previousCityIds = new Set(currentCityIds);
      return;
    }
    
    // 找出新增的城市和需要刷新的城市
    const newCities = [...currentCityIds].filter(id => !previousCityIds.has(id));
    const existingCities = [...currentCityIds].filter(id => previousCityIds.has(id));
    
    console.log('城市列表变化:', {
      新增城市: newCities,
      现有城市: existingCities.length
    });
    
    // 只对现有城市刷新封面（可能有新照片）
    if (existingCities.length > 0) {
      console.log(`🔄 刷新现有城市封面:`, existingCities);
      Promise.all(existingCities.map(id => refreshCoverForCity(id)));
    }
    
    // 新增城市：明确跳过照片获取，确保显示占位符
    if (newCities.length > 0) {
      console.log(`🆕 发现新增城市，跳过照片获取:`, newCities);
      newCities.forEach(cityId => {
        // 确保新城市不在coverMap中，这样会显示占位符
        if (coverMap.value[cityId]) {
          const { [cityId]: _, ...rest } = coverMap.value;
          coverMap.value = rest;
          console.log(`🗑️ 清除新城市 ${cityId} 的 coverMap 条目`);
        }
        console.log(`📍 新增城市 ${cityId} 将显示上传占位符`);
      });
    }
    
    // 更新previousCityIds为当前状态
    previousCityIds = new Set(currentCityIds);
  }
);

/**
 * 处理图片加载错误
 */
const handleImageError = (event) => {
  const img = event.target;

  // 若已尝试过回退且已处理，则直接返回
  if (img.dataset.errorHandled === "true") {
    return;
  }

  // 优先尝试从缩略图回退到原图
  const currentSrc = img.getAttribute("src") || "";
  const hasTriedFallback = img.dataset.fallbackTried === "true";
  if (!hasTriedFallback && currentSrc.includes("/thumbnails/")) {
    const fallbackSrc = currentSrc.replace("/thumbnails/", "/");
    img.dataset.fallbackTried = "true";
    img.src = fallbackSrc;
    return;
  }

  // 回退失败或无回退路径时，显示占位符
  img.dataset.errorHandled = "true";
  img.style.display = "none";

  const placeholder = document.createElement("div");
  placeholder.className = "image-error-placeholder";
  placeholder.style.cssText = `
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    border: 2px dashed rgba(145, 168, 208, 0.3);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #91a8d0;
    font-size: 12px;
    font-weight: 500;
    text-align: center;
    position: absolute;
    top: 0;
    left: 0;
    transition: all 0.3s ease;
  `;

  // 创建图标元素
  const iconElement = document.createElement("div");
  iconElement.innerHTML = "📷";
  iconElement.style.cssText = `
    font-size: 24px;
    margin-bottom: 4px;
    opacity: 0.6;
  `;

  // 创建文字元素
  const textElement = document.createElement("div");
  textElement.textContent = "图片加载失败";
  textElement.style.cssText = `
    margin-bottom: 2px;
  `;

  // 创建提示元素
  const hintElement = document.createElement("div");
  hintElement.textContent = "点击重新上传";
  hintElement.style.cssText = `
    font-size: 10px;
    opacity: 0.7;
  `;

  placeholder.appendChild(iconElement);
  placeholder.appendChild(textElement);
  placeholder.appendChild(hintElement);

  const parent = img.parentNode;
  if (parent) {
    parent.style.position = "relative";
    parent.appendChild(placeholder);
  }
};

/**
 * 验证文件
 */
const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: "请选择文件" };
  }

  // 检查文件大小 (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: "文件大小不能超过5MB" };
  }

  // 检查文件类型
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return { valid: false, error: "只支持 JPG、PNG、GIF 格式的图片" };
  }

  return { valid: true };
};

/**
 * 压缩图片
 */
const compressImage = (
  file,
  maxWidth = 800,
  maxHeight = 600,
  quality = 0.8
) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // 计算新尺寸
      let { width, height } = img;
      const ratio = Math.min(maxWidth / width, maxHeight / height);

      if (ratio < 1) {
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // 绘制并压缩
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error("图片压缩失败"));
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => reject(new Error("图片加载失败"));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * 文件转Base64
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
};

/**
 * 格式化旅行时间
 */
const formatTravelTime = (travelTime) => {
  if (!travelTime) return "";
  const date = new Date(travelTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}年${month}月`;
};

/**
 * 处理编辑城市信息
 */
const handleEditCity = (city) => {
  editingCity.value = city;
  editForm.value = {
    cityName: city.cityName,
    travelTime: city.travelTime || null,
    travelFeeling: city.travelFeeling || "",
    tags: Array.isArray(city.tags) ? [...city.tags] : [],
  };
  showEditDialog.value = true;
};

/**
 * 处理编辑确认
 */
const handleEditConfirm = async () => {
  if (!editingCity.value) return;

  updating.value = true;
  try {
    // 调用API更新城市信息
    const success = await wishlistStore.updateCityInfo(
      editingCity.value.id,
      {
        travelTime: editForm.value.travelTime,
        travelFeeling: editForm.value.travelFeeling,
        tags: editForm.value.tags,
      }
    );

    if (success) {
      ElMessage.success("城市信息更新成功");
      showEditDialog.value = false;
      // 重新加载数据
      await wishlistStore.loadWishlist();
    } else {
      ElMessage.error("更新失败，请重试");
    }
  } catch (error) {
    console.error("更新城市信息失败:", error);
    ElMessage.error("更新失败，请重试");
  } finally {
    updating.value = false;
  }
};

/**
 * 处理编辑取消
 */
const handleEditCancel = () => {
  showEditDialog.value = false;
  editingCity.value = null;
  editForm.value = {
    cityName: "",
    travelTime: null,
    travelFeeling: "",
    tags: [],
  };
};

/**
 * 显示输入框
 */
const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    inputRef.value?.focus();
  });
};

/**
 * 处理标签输入确认
 */
const handleInputConfirm = () => {
  if (inputValue.value && !editForm.value.tags.includes(inputValue.value)) {
    editForm.value.tags.push(inputValue.value);
  }
  inputVisible.value = false;
  inputValue.value = "";
};

/**
 * 移除标签
 */
const removeTag = (tag) => {
  const index = editForm.value.tags.indexOf(tag);
  if (index > -1) {
    editForm.value.tags.splice(index, 1);
  }
};

/**
 * 格式化访问日期
 */
const formatVisitDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}.${month}`;
};
</script>

<style scoped>
.visited-cities-gallery {
  /* background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%); */
  /* border-radius: 16px; */
  /* padding: 24px; */
  /* border: 1px solid rgba(145, 168, 208, 0.08); */
  /* box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(145, 168, 208, 0.06); */
  margin-top: 10px;
  position: relative;
  overflow: hidden;
}

.visited-cities-gallery::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(
      circle at 20% 30%,
      rgba(145, 168, 208, 0.02) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(247, 202, 201, 0.02) 0%,
      transparent 50%
    );
  pointer-events: none;
}

/* 标题区域 */
.gallery-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(145, 168, 208, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.title-icon {
  color: #91a8d0;
  flex-shrink: 0;
}

.title-text {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  flex-shrink: 0;
}

.photo-count {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  background: rgba(145, 168, 208, 0.08);
  padding: 4px 8px;
  border-radius: 12px;
  white-space: nowrap;
}

/* 展开/收起按钮区域 */
.toggle-section {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px !important;
  border-radius: 20px !important;
  background: linear-gradient(
    135deg,
    rgba(145, 168, 208, 0.08) 0%,
    rgba(247, 202, 201, 0.08) 100%
  ) !important;
  border: 1px solid rgba(145, 168, 208, 0.15) !important;
  color: #4a5568 !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  height: auto !important;
}

.toggle-btn:hover {
  background: linear-gradient(
    135deg,
    rgba(145, 168, 208, 0.12) 0%,
    rgba(247, 202, 201, 0.12) 100%
  ) !important;
  border-color: rgba(145, 168, 208, 0.25) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(145, 168, 208, 0.15) !important;
}

.toggle-icon {
  transition: transform 0.3s ease;
  font-size: 14px;
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

/* 照片展示区域 */
.photos-container {
  position: relative;
}

/* 滚动提示渐变 */
.photos-container::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(transparent, rgba(255, 255, 255, 0.8));
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photos-container:hover::after {
  opacity: 1;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  padding: 16px 8px;
  transition: all 0.5s ease;
  scroll-behavior: smooth;
  /* 优化滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: rgba(145, 168, 208, 0.3) transparent;
}

.photos-grid::-webkit-scrollbar {
  width: 6px;
}

.photos-grid::-webkit-scrollbar-track {
  background: rgba(145, 168, 208, 0.1);
  border-radius: 3px;
  margin: 4px 0;
}

.photos-grid::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #91a8d0, #f7cac9);
  border-radius: 3px;
}

.photos-grid::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #7a94c2, #f0b5b4);
}

/* 想再去标识 */
.want-again-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  box-shadow: 0 2px 6px rgba(251, 191, 36, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

.want-again-badge .el-icon {
  font-size: 10px;
}

/* 旅行时间显示样式 */
.travel-time {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  font-family: "Courier New", monospace;
  letter-spacing: 0.5px;
  background: rgba(145, 168, 208, 0.6);
  padding: 2px 6px;
  border-radius: 8px;
  margin-bottom: 2px;
  display: inline-block;
}

/* 旅行感受显示样式 */
.travel-feeling {
  font-size: 9px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.3;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-style: italic;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* 城市照片项 */
.city-photo-item {
  width: 100%;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: photoSlideIn 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes photoSlideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 创建错落有致的布局 */
.city-photo-item:nth-child(4n + 1) {
  transform: rotate(-1.5deg) translateY(-8px);
  margin-top: 12px;
}

.city-photo-item:nth-child(4n + 2) {
  transform: rotate(1deg) translateY(4px);
  margin-bottom: 8px;
}

.city-photo-item:nth-child(4n + 3) {
  transform: rotate(-0.8deg) translateY(-12px);
  margin-top: 16px;
}

.city-photo-item:nth-child(4n + 4) {
  transform: rotate(1.2deg) translateY(8px);
  margin-bottom: 12px;
}

.photo-wrapper {
  position: relative;
  width: 100%;
  height: 135px;
  background: #fff;
  padding: 4px;
  border-radius: 6px;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 0, 0, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
}

.photo-wrapper:hover {
  transform: rotate(0deg) translateY(-8px) scale(1.05);
  box-shadow:
    0 16px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(0, 0, 0, 0.2),
    inset 0 0 0 1px rgba(255, 255, 255, 0.9);
}

/* 照片样式 */
.city-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  transition: all 0.4s ease;
  filter: grayscale(20%) contrast(1.1);
}

.photo-wrapper:hover .city-photo {
  filter: grayscale(0%) contrast(1.2) brightness(1.05);
}

/* 上传占位符 */
.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafe 0%, #eef1f9 100%);
  border: 2px dashed rgba(145, 168, 208, 0.4);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.upload-placeholder:hover {
  border-color: rgba(145, 168, 208, 0.7);
  background: linear-gradient(135deg, #ffffff 0%, #f8fafe 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15);
}

.upload-icon {
  color: #91a8d0;
  margin-bottom: 8px;
  opacity: 0.8;
}

.upload-text {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
}

.upload-hint {
  margin: 0;
  font-size: 11px;
  color: #91a8d0;
  opacity: 0.8;
}

/* 照片信息遮罩 - 固定在底部，不与操作按钮争夺空间 */
.photo-info-overlay {
  position: absolute;
  bottom: 4px;
  left: 4px;
  right: 4px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 12px 8px 8px;
  opacity: 0;
  transition: all 0.3s ease;
  border-radius: 0 0 4px 4px;
  pointer-events: none; /* 不阻挡操作按钮的交互 */
}

.photo-wrapper:hover .photo-info-overlay {
  opacity: 1;
}

/* 操作按钮层 - 悬浮居中显示 */
.photo-actions-overlay {
  position: absolute;
  inset: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
}

.photo-wrapper:hover .photo-actions-overlay {
  opacity: 1;
}

/* 操作按钮背景遮罩 */
.actions-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 4px;
}

.city-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.city-name {
  font-size: 13px;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  line-height: 1.2;
  font-family: "Helvetica Neue", Arial, sans-serif;
  letter-spacing: 0.5px;
}

.visit-date {
  font-size: 10px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  font-family: "Courier New", monospace;
  letter-spacing: 0.5px;
}

/* 操作按钮 - 居中排列 */
.photo-actions {
  position: relative;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.action-btn {
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  border: none !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
  backdrop-filter: blur(4px) !important;
}

/* 移除主要操作按钮的特殊大小，保持一致性 */

.action-btn[type="info"] {
  background: rgba(107, 114, 128, 0.95) !important;
  color: white !important;
}

.action-btn[type="info"]:hover {
  background: #6b7280 !important;
  transform: scale(1.15) !important;
  box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4) !important;
}

.action-btn[type="primary"] {
  background: rgba(145, 168, 208, 0.95) !important;
  color: white !important;
}

.action-btn[type="primary"]:hover {
  background: #91a8d0 !important;
  transform: scale(1.15) !important;
  box-shadow: 0 6px 20px rgba(145, 168, 208, 0.4) !important;
}

.action-btn[type="danger"] {
  background: rgba(239, 68, 68, 0.95) !important;
  color: white !important;
}

.action-btn[type="danger"]:hover {
  background: #ef4444 !important;
  transform: scale(1.15) !important;
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4) !important;
}

.action-btn[type="warning"] {
  background: rgba(245, 158, 11, 0.95) !important;
  color: white !important;
}

.action-btn[type="warning"]:hover {
  background: #f59e0b !important;
  transform: scale(1.15) !important;
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4) !important;
}

.action-btn[type="success"] {
  background: rgba(34, 197, 94, 0.95) !important;
  color: white !important;
}

.action-btn[type="success"]:hover {
  background: #22c55e !important;
  transform: scale(1.15) !important;
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4) !important;
}

/* 城市名称（无照片时） */
.city-name-bottom {
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #495057;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
}

/* 胶片孔效果 */
.film-holes {
  position: absolute;
  left: 2px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.film-holes .hole {
  width: 4px;
  height: 4px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.8);
}

/* 空状态 */
.empty-gallery {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 40px 20px;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  color: rgba(145, 168, 208, 0.4);
  margin-bottom: 20px;
}

.empty-content h4 {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.empty-content p {
  margin: 0 0 24px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #6b7280;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .visited-cities-gallery {
    padding: 16px;
    border-radius: 16px;
  }

  .gallery-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-title {
    width: 100%;
    justify-content: space-between;
  }

  .title-text {
    font-size: 18px;
  }

  .toggle-section {
    width: 100%;
    justify-content: center;
  }

  .toggle-btn {
    padding: 10px 20px !important;
    font-size: 14px !important;
  }

  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    padding: 12px 4px;
  }

  .photo-wrapper {
    height: 105px;
  }

  .action-btn {
    width: 36px !important;
    height: 36px !important;
  }

  /* 移动端保持按钮大小一致 */

  /* 移动端操作按钮间距调整 */
  .photo-actions {
    gap: 10px;
  }

  /* 移动端操作按钮背景增强 */
  .actions-backdrop {
    background: rgba(0, 0, 0, 0.75);
  }

  /* 移动端减少错落效果 */
  .city-photo-item:nth-child(4n + 1),
  .city-photo-item:nth-child(4n + 2),
  .city-photo-item:nth-child(4n + 3),
  .city-photo-item:nth-child(4n + 4) {
    margin-top: 4px;
    margin-bottom: 4px;
  }

  .city-photo-item:nth-child(4n + 1) {
    transform: rotate(-1deg) translateY(-4px);
  }

  .city-photo-item:nth-child(4n + 2) {
    transform: rotate(0.5deg) translateY(2px);
  }

  .city-photo-item:nth-child(4n + 3) {
    transform: rotate(-0.5deg) translateY(-2px);
  }

  .city-photo-item:nth-child(4n + 4) {
    transform: rotate(1deg) translateY(4px);
  }
}

/* 编辑对话框样式 */
:deep(.edit-city-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.edit-city-dialog .el-dialog__header) {
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  padding: 20px 24px;
  margin: 0;
}

:deep(.edit-city-dialog .el-dialog__title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

:deep(.edit-city-dialog .el-dialog__close) {
  color: white;
  font-size: 18px;
}

:deep(.edit-city-dialog .el-dialog__body) {
  padding: 24px;
}

.edit-form {
  max-width: 100%;
}

.edit-form .el-form-item {
  margin-bottom: 20px;
}

.edit-form .el-form-item__label {
  color: #374151;
  font-weight: 600;
  font-size: 14px;
}

.disabled-input :deep(.el-input__inner) {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.travel-time-picker :deep(.el-input__inner) {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.travel-time-picker :deep(.el-input__inner):focus {
  border-color: #91a8d0;
  box-shadow: 0 0 0 3px rgba(145, 168, 208, 0.1);
}

.travel-feeling-input :deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  resize: none;
  transition: all 0.3s ease;
}

.travel-feeling-input :deep(.el-textarea__inner):focus {
  border-color: #91a8d0;
  box-shadow: 0 0 0 3px rgba(145, 168, 208, 0.1);
}

/* 标签样式 */
.tag-item {
  margin-right: 8px;
  margin-bottom: 8px;
  background: rgba(145, 168, 208, 0.1);
  border-color: rgba(145, 168, 208, 0.3);
  color: #4a5568;
}

.tag-input {
  width: 120px;
  margin-right: 8px;
  margin-bottom: 8px;
}

.add-tag-btn {
  margin-bottom: 8px;
  border: 1px dashed rgba(145, 168, 208, 0.5);
  color: #91a8d0;
  background: transparent;
  transition: all 0.3s ease;
}

.add-tag-btn:hover {
  border-color: #91a8d0;
  color: #7a94c2;
  background: rgba(145, 168, 208, 0.05);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer .el-button {
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
}
</style>
