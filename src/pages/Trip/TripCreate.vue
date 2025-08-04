<template>
  <div class="trip-create-container">
    <h1 class="page-title">创建您的个性化行程</h1>

    <el-card class="steps-card">
      <el-steps :active="currentStep"
finish-status="success" align-center>
        <el-step title="基础信息" />
        <el-step title="个性化偏好" />
        <el-step title="智能生成" />
        <el-step title="行程预览" />
      </el-steps>
    </el-card>

    <!-- 步骤内容 -->
    <div class="step-container">
      <!-- 第一步：基础信息 -->
      <TripBaseInfo
        v-show="currentStep === 0"
        v-model:base-form="baseForm"
        :weather-suggestion="weatherSuggestion"
        :loading-weather="loadingWeather"
        :weather-error="weatherError"
        @next-step="nextStep"
        @fetch-weather="fetchWeatherForTrip"
      />

      <!-- 第二步：个性化偏好 -->
      <TripPreferences
        v-show="currentStep === 1"
        v-model:preference-form="preferenceForm"
        :base-form="baseForm"
        :user-preferences="userStore.userPreferences"
        :selected-attractions="selectedAttractions"
        :selected-restaurants="selectedRestaurants"
        @update:selected-attractions="selectedAttractions = $event"
        @update:selected-restaurants="selectedRestaurants = $event"
        @next-step="nextStep"
        @prev-step="prevStep"
      />

      <!-- 第三步：智能生成 -->
      <TripGeneration
        v-show="currentStep === 2"
        :base-form="baseForm"
        :preference-form="preferenceForm"
        :user-preferences="userStore.userPreferences"
        :selected-attractions="selectedAttractions"
        :selected-restaurants="selectedRestaurants"
        :extra-requirements="extraRequirements"
        :weather-suggestion="weatherSuggestion"
        :loading-weather="loadingWeather"
        :weather-error="weatherError"
        @update:extra-requirements="extraRequirements = $event"
        @generation-complete="handleGenerationComplete"
        @next-step="nextStep"
        @prev-step="prevStep"
      />

      <!-- 第四步：行程展示 -->
      <!-- AI生成的行程展示 -->
      <AiTripDisplay
        v-if="currentStep === 3 && tripData && tripData.content"
        :trip-data="tripData"
        @regenerate="regenerateTrip"
        @save="handleTripSaved"
        @share="handleTripShare"
      />
      
      <!-- 传统结构化行程展示 -->
      <TripPreview
        v-else-if="currentStep === 3 && tripData && tripData.dailyPlan"
        :trip-data="tripData"
        :is-loading="isLoadingTrip"
        :base-form="baseForm"
        @regenerate="regenerateTrip"
        @saved="handleTripSaved"
        @prev-step="prevStep"
      />
      
      <!-- 空状态展示 -->
      <div v-else-if="currentStep === 3" class="empty-trip-state">
        <el-empty 
          description="暂无行程数据"
          :image-size="200"
        >
          <el-button type="primary" @click="regenerateTrip">
            重新生成行程
          </el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/store/user.js";
import { weatherApi } from "@/api/weather.js";
import TripBaseInfo from "@/components/Trip/TripBaseInfo.vue";
import TripPreferences from "@/components/Trip/TripPreferences.vue";
import TripGeneration from "@/components/Trip/TripGeneration.vue";
import TripPreview from "@/components/Trip/TripPreview.vue";
import AiTripDisplay from "@/components/Trip/AiTripDisplay.vue";

export default {
  name: "TripCreate",
  components: {
    TripBaseInfo,
    TripPreferences,
    TripGeneration,
    TripPreview,
    AiTripDisplay,
  },

  setup() {
    const route = useRoute();
    const userStore = useUserStore();

    // 当前步骤
    const currentStep = ref(0);

    // 基础表单数据
    const baseForm = reactive({
      destination: "",
      destinationName: "",
      days: 3,
      dateRange: null, // 初始设置为null而不是空数组
      travelers: 1,
      budget: "moderate", // 修改为字符串类型以匹配子组件期望
    });

    // 偏好表单数据 - 更新为新的AI-focused结构
    const preferenceForm = reactive({
      tripGoals: [], // 行程目标
      pacePreference: "balanced", // 行程节奏偏好
      focusAreas: [], // 重点体验（合并了最想体验和特别体验）
      socialPreference: "mixed", // 社交环境偏好
      photoPreference: "casual", // 拍照打卡需求
      dietaryRestrictions: [], // 饮食禁忌
      customDietaryNotes: "", // 其他饮食禁忌
      specialRequirements: "", // 特殊需求
    });

    // 已选景点和餐厅
    const selectedAttractions = ref([]);
    const selectedRestaurants = ref([]);

    // 额外需求
    const extraRequirements = ref("");

    // 生成的行程数据
    const tripData = ref({});
    const isLoadingTrip = ref(false);

    // 天气相关状态
    const weatherSuggestion = ref(null);
    const loadingWeather = ref(false);
    const weatherError = ref(null);

    // 步骤控制
    const nextStep = () => {
      if (currentStep.value < 3) {
        currentStep.value += 1;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    const prevStep = () => {
      if (currentStep.value > 0) {
        currentStep.value -= 1;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    // 处理行程生成完成事件
    const handleGenerationComplete = (generatedTripData) => {
      tripData.value = generatedTripData;
      nextStep(); // 进入行程预览步骤
    };

    // 重新生成行程
    const regenerateTrip = () => {
      // 回到生成步骤
      currentStep.value = 2;
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // 处理行程保存成功事件
    const handleTripSaved = () => {
      ElMessage.success("行程保存成功！");
      // 保存后的跳转逻辑已经在TripPreview组件中处理
    };

    // 处理行程分享事件
    const handleTripShare = (tripData) => {
      console.log('分享行程:', tripData);
      ElMessage.success("分享功能开发中，敬请期待！");
    };

    // 获取天气信息
    const fetchWeatherForTrip = async (city, startDate, days) => {
      if (!city) {
        console.log("🌤️ 缺少城市信息，跳过天气获取");
        return;
      }

      try {
        loadingWeather.value = true;
        weatherError.value = null;
        
        if (startDate && days) {
          console.log(`🌤️ 开始获取天气信息：${city}, ${startDate}, ${days}天`);
          const weatherData = await weatherApi.getWeatherSuggestions(city, new Date(startDate), days);
          if (weatherData) {
            weatherSuggestion.value = weatherData;
            console.log("✅ 天气信息获取成功", weatherData);
          }
        } else {
          console.log(`🌤️ 开始获取${city}的基础天气数据（不依赖日期选择）`);
          // 获取基础天气数据，不依赖用户的具体日期选择
          const weatherData = await weatherApi.getWeatherSuggestions(city, new Date(), 3); // 默认3天
          if (weatherData) {
            weatherSuggestion.value = weatherData;
            console.log("✅ 基础天气信息获取成功", weatherData);
          }
        }
        
        if (!weatherSuggestion.value) {
          weatherError.value = "获取天气信息失败";
          console.log("❌ 天气信息获取失败");
        }
      } catch (error) {
        console.error("❌ 获取天气信息时出错:", error);
        weatherError.value = error.message || "获取天气信息失败";
      } finally {
        loadingWeather.value = false;
      }
    };

    // 监听城市变化，立即获取天气数据
    watch(
      () => baseForm.destinationName,
      (city) => {
        console.log(`🔍 监听到城市变化：${city}`);
        
        if (city) {
          // 清空之前的天气数据
          weatherSuggestion.value = null;
          weatherError.value = null;
          
          console.log(`🌤️ 城市确定，立即获取天气数据：${city}`);
          // 立即获取天气数据，不依赖用户的日期选择
          fetchWeatherForTrip(city, null, null);
        }
      },
      { immediate: true }
    );

    // 组件挂载后检查URL参数并加载用户偏好
    onMounted(async () => {
      console.log("🚀 TripCreate组件挂载，获取路由参数:", route.query);
      console.log("🌤️ 当前基础表单数据:", {
        destination: baseForm.destination,
        destinationName: baseForm.destinationName,
        dateRange: baseForm.dateRange,
        days: baseForm.days
      });

      // 确保用户偏好数据已加载
      if (userStore.isLoggedIn && userStore.currentUser?.id) {
        try {
          console.log("🔄 加载用户偏好数据...");
          await userStore.fetchUserPreferences();
          console.log("✅ 用户偏好数据加载完成");
        } catch (error) {
          console.warn("⚠️ 加载用户偏好失败:", error);
        }
      }

      // 检查是否从偏好设置返回
      if (route.query.fromPreferences === "true") {
        // 从偏好设置返回时，强制重新加载偏好数据
        ElMessage.success("偏好设置已更新");
      }

      // 检查URL中是否包含城市信息
      if (route.query.city && route.query.cityName) {
        baseForm.destination = route.query.city;
        baseForm.destinationName = decodeURIComponent(route.query.cityName); // 解码中文名称
        console.log(
          `从URL获取到目的地城市：${baseForm.destinationName}(${baseForm.destination})`,
        );
        ElMessage.success(`已选择目的地: ${baseForm.destinationName}`);
        
        // 注意：天气获取将由watch监听器自动触发，不需要在这里手动调用
      }
    });

    return {
      currentStep,
      baseForm,
      preferenceForm,
      selectedAttractions,
      selectedRestaurants,
      extraRequirements,
      tripData,
      isLoadingTrip,
      weatherSuggestion,
      loadingWeather,
      weatherError,
      userStore,
      nextStep,
      prevStep,
      handleGenerationComplete,
      regenerateTrip,
      handleTripSaved,
      handleTripShare,
      fetchWeatherForTrip,
    };
  },
};
</script>

<style scoped>
.empty-trip-state {
  padding: 60px 20px;
  text-align: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  margin: 20px 0;
}

.empty-trip-state :deep(.el-empty__description) {
  font-size: 16px;
  color: #666;
  margin: 20px 0;
}

.empty-trip-state :deep(.el-button--primary) {
  padding: 12px 30px;
  font-size: 16px;
  border-radius: 8px;
}

.trip-create-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f5f7fa;
  box-sizing: border-box;
  position: relative;
  height: calc(100vh - 64px);
  /* overflow: hidden; */
}

.page-title {
  text-align: center;
  margin-bottom: 24px;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
  position: relative;
}

.page-title::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background-color: #409eff;
  border-radius: 3px;
}

.steps-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.step-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  min-height: auto;
  margin-bottom: 40px;
  overflow: visible;
}

@media (max-width: 768px) {
  .trip-create-container {
    padding: 16px;
    min-height: calc(100vh - 56px); /* 移动端导航栏可能更矮 */
  }

  .page-title {
    font-size: 24px;
    margin-bottom: 16px;
  }

  .steps-card {
    margin-bottom: 16px;
  }

  .step-container {
    padding: 16px;
    margin-bottom: 24px;
  }
}

@media (max-width: 480px) {
  .trip-create-container {
    padding: 10px;
    min-height: calc(100vh - 56px);
  }

  .page-title {
    font-size: 20px;
  }

  .step-container {
    padding: 12px;
    margin-bottom: 16px;
  }
}
</style>
