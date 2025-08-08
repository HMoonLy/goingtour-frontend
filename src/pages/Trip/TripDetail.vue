<template>
  <div class="trip-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button type="text" @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          {{ t('trip.backToList') }}
        </el-button>
      </div>
      <div class="header-right">
        <el-button
          v-if="!isEditing"
          type="primary"
          class="edit-btn"
          @click="toggleEdit"
        >
          <el-icon><Edit /></el-icon>
          {{ t('trip.editTrip') }}
        </el-button>
        <template v-else>
          <el-button @click="cancelEdit">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="saveChanges">{{ t('trip.saveChanges') }}</el-button>
        </template>
      </div>
    </div>

    <!-- 行程概览卡片 -->
    <el-card
class="trip-overview-card" shadow="hover"
>
      <div class="trip-header">
        <div class="trip-title-section">
          <h1
v-if="!isEditing" class="trip-title"
>
            {{ tripData.title }}
          </h1>
          <el-input
            v-else
            v-model="editedTrip.title"
            size="large"
            class="title-input"
            :placeholder="t('trip.inputTitle')"
          />
          <div class="trip-status">
            <el-tag :type="tripData.status === 'draft' ? 'info' : 'success'">
              {{ tripData.status === 'draft' ? t('personal.status.draft') : t('personal.status.completed') }}
            </el-tag>
             <span class="create-time">{{ t('trip.createdAt', { date: formatDate(tripData.createdAt) }) }}</span>
          </div>
        </div>
        <div class="trip-actions">
          <el-button @click="shareTrip">
            <el-icon><Share /></el-icon>
            {{ t('trip.share') }}
          </el-button>
          <el-button @click="exportTrip">
            <el-icon><Download /></el-icon>
            {{ t('trip.export') }}
          </el-button>
          <el-dropdown @command="handleMoreAction">
            <el-button>
              {{ t('trip.more') }}<el-icon class="el-icon--right">
                <ArrowDown />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="duplicate">
                  {{ t('trip.duplicate') }}
                </el-dropdown-item>
                <el-dropdown-item command="template">
                  {{ t('trip.saveAsTemplate') }}
                </el-dropdown-item>
                <el-dropdown-item
command="delete" divided
>
                  {{ t('trip.deleteTrip') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 行程基本信息 -->
      <div class="trip-info-grid">
        <div class="info-item">
          <el-icon class="info-icon">
            <MapLocation />
          </el-icon>
          <div class="info-content">
            <h4>{{ t('trip.destination') }}</h4>
            <p>{{ tripData.city }}</p>
          </div>
        </div>
        <div class="info-item">
          <el-icon class="info-icon">
            <Calendar />
          </el-icon>
          <div class="info-content">
            <h4>{{ t('trip.tripTime') }}</h4>
            <p>{{ formatDateRange(tripData.createTime) }}</p>
          </div>
        </div>
        <div class="info-item">
          <el-icon class="info-icon">
            <User />
          </el-icon>
          <div class="info-content">
            <h4>{{ t('trip.travelers') }}</h4>
            <p>{{ tripData.mate }}人</p>
          </div>
        </div>
        <div class="info-item">
          <el-icon class="info-icon">
            <Money />
          </el-icon>
          <div class="info-content">
            <h4>{{ t('trip.budgetRange') }}</h4>
            <p>{{ tripData.totalBudget }}</p>
          </div>
        </div>
        <div class="info-item">
          <el-icon class="info-icon">
            <DataLine />
          </el-icon>
          <div class="info-content">
            <h4>{{ t('trip.estimatedCost') }}</h4>
            <p>{{ tripData.totalBudget }}</p>
          </div>
        </div>
        <div class="info-item">
          <el-icon class="info-icon">
            <Collection />
          </el-icon>
          <div class="info-content">
            <h4>{{ t('trip.contentStats') }}</h4>
            <p>
              {{ t('trip.attractionCount', { count: tripData.attractions?.length || 0 }) }} ·
              {{ t('trip.restaurantCount', { count: tripData.restaurants?.length || 0 }) }}
            </p>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 每日行程详情 -->
    <div class="daily-itinerary">
      <h2 class="section-title">
        <el-icon><Clock /></el-icon>
        {{ t('trip.dailySchedule') }}
      </h2>

      <div class="days-container">
        <div
          v-for="(day, dayIndex) in tripData.dailyPlan"
          :key="dayIndex"
          class="day-card"
        >
          <div class="day-header">
            <div class="day-info">
              <h3>{{ t('trip.dayN', { n: dayIndex + 1 }) }}</h3>
             <span class="day-date">{{ formatDayDate(dayIndex) }}</span>
            </div>
            <div class="day-stats">
              <span>{{ t('trip.activitiesCount', { count: day.activities?.length || 0 }) }}</span>
            </div>
          </div>

          <!-- 活动时间线 -->
          <div class="activities-timeline">
            <div
              v-for="(activity, actIndex) in day.activities"
              :key="actIndex"
              class="activity-item"
              :class="{ 'is-editing': isEditing }"
            >
              <div class="activity-time">
                <span class="time-text">{{ activity.time }}</span>
              </div>

              <div class="activity-content">
                <div class="activity-header">
                  <h4 class="activity-name">
                    {{ activity.name }}
                  </h4>
                  <div class="activity-meta">
                    <el-tag
                      size="small"
                      :type="getActivityTypeColor(activity.type)"
                    >
                      {{ getActivityTypeText(activity.type) }}
                    </el-tag>
                    <span
v-if="activity.price" class="activity-price"
                    >¥{{ activity.price }}</span>
                  </div>
                </div>

                <p class="activity-description">
                  {{ activity.description }}
                </p>

                <div class="activity-tags">
                  <el-tag
                    v-for="tag in activity.tags"
                    :key="tag"
                    size="small"
                    effect="plain"
                  >
                    {{ tag }}
                  </el-tag>
                </div>

                <!-- 编辑模式下的操作按钮 -->
                <div
v-if="isEditing" class="activity-actions"
>
                  <el-button
                    size="small"
                    @click="editActivity(dayIndex, actIndex)"
                  >
                    <el-icon><Edit /></el-icon>
                    {{ t('common.edit') }}
                  </el-button>
                  <el-button
                    size="small"
                    @click="replaceActivity(dayIndex, actIndex)"
                  >
                    <el-icon><Refresh /></el-icon>
                    {{ t('common.edit') }}
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    @click="removeActivity(dayIndex, actIndex)"
                  >
                    <el-icon><Delete /></el-icon>
                    {{ t('common.delete') }}
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 添加活动按钮（编辑模式） -->
            <div
v-if="isEditing" class="add-activity"
>
              <el-button
type="dashed" @click="addActivity(dayIndex)"
>
                <el-icon><Plus /></el-icon>
                {{ t('common.add') }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 行程偏好设置 -->
    <el-card
class="preferences-card" shadow="hover"
>
      <template #header>
        <div class="card-header">
          <h3>
            <el-icon><Setting /></el-icon>
            {{ t('trip.preferences') }}
          </h3>
        </div>
      </template>

      <div class="preferences-content">
        <div class="preference-group">
          <h4>{{ t('trip.intensity') }}</h4>
          <el-tag>
            {{ getIntensityText(tripData.preferences?.intensity) }}
          </el-tag>
        </div>

        <div
          v-if="tripData.preferences?.experiences?.length > 0"
          class="preference-group"
        >
          <h4>{{ t('trip.specialExperiences') }}</h4>
          <div class="tags-row">
            <el-tag
              v-for="exp in tripData.preferences.experiences"
              :key="exp"
              effect="plain"
            >
              {{ getExperienceText(exp) }}
            </el-tag>
          </div>
        </div>

        <div
          v-if="tripData.preferences?.transport?.length > 0"
          class="preference-group"
        >
          <h4>{{ t('trip.transportPreferences') }}</h4>
          <div class="tags-row">
            <el-tag
              v-for="transport in tripData.preferences.transport"
              :key="transport"
              effect="plain"
            >
              {{ getTransportText(transport) }}
            </el-tag>
          </div>
        </div>

        <div
          v-if="tripData.preferences?.specialRequests"
          class="preference-group"
        >
          <h4>{{ t('trip.specialRequests') }}</h4>
          <p class="special-requests">
            {{ tripData.preferences.specialRequests }}
          </p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  ArrowLeft,
  Edit,
  Share,
  Download,
  ArrowDown,
  MapLocation,
  Calendar,
  User,
  Money,
  DataLine,
  Collection,
  Clock,
  Plus,
  Refresh,
  Delete,
  Setting,
} from "@element-plus/icons-vue";
import { useUserStore } from "@/store/user.js";
import { useI18n } from "@/utils/i18n.js";
import {
  convertBackendTripToFrontend,
  convertFrontendTripToBackend,
} from "@/utils/tripDataConverter.js";

export default {
  name: "TripDetail",
  components: {
    ArrowLeft,
    Edit,
    Share,
    Download,
    ArrowDown,
    MapLocation,
    Calendar,
    User,
    Money,
    DataLine,
    Collection,
    Clock,
    Plus,
    Refresh,
    Delete,
    Setting,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { t } = useI18n();

    // 响应式数据
    const tripData = ref({});
    const editedTrip = ref({});
    const isEditing = ref(false);
    const loading = ref(false);

    // 计算属性
    const tripId = computed(() => route.params.id);

    // 生命周期
    onMounted(() => {
      loadTripData();
    });

    // 方法
    const loadTripData = async () => {
      try {
        loading.value = true;

        // 首先尝试从API加载数据
        try {
          const { userApi } = await import("@/api/user.js");
          const userStore = useUserStore();

          if (!userStore.currentUser?.id) {
            throw new Error("用户未登录");
          }

          const { tripApi } = await import("@/api/trip.js");
          const response = await tripApi.getTripDetail(
            tripId.value,
            userStore.currentUser.id,
          );

          if (response.data) {
            const convertedTrip = convertBackendTripToFrontend(response.data);
            tripData.value = convertedTrip;
            editedTrip.value = JSON.parse(JSON.stringify(convertedTrip)); // 深拷贝

            // 检查是否需要自动进入编辑模式
            if (route.query.edit === "true") {
              isEditing.value = true;
              console.log("🔧 自动进入编辑模式");
            }

            console.log("✅ 从API加载行程数据成功:", convertedTrip);
            return;
          }
        } catch (apiError) {
          console.warn("⚠️ 从API加载失败，尝试本地存储:", apiError);
        }

        // 降级到localStorage
        const savedTrips = JSON.parse(
          localStorage.getItem("savedTrips") || "[]",
        );
        const trip = savedTrips.find((t) => t.id === tripId.value);

        if (trip) {
          tripData.value = trip;
          editedTrip.value = JSON.parse(JSON.stringify(trip)); // 深拷贝

          // 检查是否需要自动进入编辑模式
          if (route.query.edit === "true") {
            isEditing.value = true;
            console.log("🔧 自动进入编辑模式");
          }

          console.log("✅ 从本地存储加载行程数据成功:", trip);
        } else {
          ElMessage.error(t('messages.notFound'));
          router.push("/home");
        }
      } catch (error) {
        console.error("❌ 加载行程数据失败:", error);
        ElMessage.error(t('messages.updateFailed'));
        router.push("/home");
      } finally {
        loading.value = false;
      }
    };

    const goBack = () => {
      // 如果正在编辑，询问用户是否保存
      if (isEditing.value) {
        ElMessageBox.confirm(
          "您有未保存的修改，确定要离开吗？",
          "未保存的修改",
          {
            confirmButtonText: "离开",
            cancelButtonText: "取消",
            type: "warning",
          },
        )
            .then(() => {
            router.push("/home");
          })
          .catch(() => {
            // 用户选择取消
          });
      } else {
        router.push("/home");
      }
    };

    const toggleEdit = () => {
      isEditing.value = !isEditing.value;
      if (isEditing.value) {
        editedTrip.value = JSON.parse(JSON.stringify(tripData.value));
      }
    };

    const cancelEdit = () => {
      isEditing.value = false;
      editedTrip.value = JSON.parse(JSON.stringify(tripData.value));
      router.push("/home");
    };

    // 解析预算字符串为数字（处理格式化字符串如"约 ¥1,600"）
    const parseBudgetToNumber = (budgetValue) => {
      if (typeof budgetValue === "number") {
        return budgetValue;
      }

      if (typeof budgetValue === "string") {
        // 移除所有非数字字符，只保留数字和小数点
        const numberStr = budgetValue.replace(/[^0-9.]/g, "");
        const number = parseFloat(numberStr);
        return isNaN(number) ? 0 : number;
      }

      return 0;
    };

    const saveChanges = async () => {
      try {
        loading.value = true;

        // 首先尝试调用API保存
        try {
          const { userApi } = await import("@/api/user.js");
          const userStore = useUserStore();

          if (!userStore.currentUser?.id) {
            throw new Error("用户未登录");
          }

          const { tripApi } = await import("@/api/trip.js");

          // 使用转换工具将前端数据转换为后端格式
          const tripRequest = convertFrontendTripToBackend(editedTrip.value);

          console.log("📤 发送到API的数据:", tripRequest); // 调试日志
          console.log("📋 行程详情数据:", tripRequest.tripDetails); // 调试详情数据

          const response = await tripApi.updateTrip(
            tripId.value,
            userStore.currentUser.id,
            tripRequest,
          );

          if (response.data) {
            const convertedTrip = convertBackendTripToFrontend(response.data);
            tripData.value = convertedTrip;
            editedTrip.value = JSON.parse(JSON.stringify(convertedTrip));
            isEditing.value = false;

            // 清理URL中的编辑参数
            if (route.query.edit === "true") {
              router.replace({
                name: "TripDetail",
                params: { id: tripId.value },
              });
            }

            ElMessage.success(t('messages.updateSuccess'));
            console.log("💾 API保存行程成功:", convertedTrip.title);

            // 确保数据保存完成后再跳转
            setTimeout(() => {
              router.push("/home");
            }, 500);
            return;
          }
        } catch (apiError) {
          console.warn("⚠️ API保存失败，尝试本地存储:", apiError);
        }

        // 降级到localStorage保存
        const savedTrips = JSON.parse(
          localStorage.getItem("savedTrips") || "[]",
        );
        const index = savedTrips.findIndex((t) => t.id === tripId.value);

        if (index !== -1) {
          editedTrip.value.updatedAt = new Date().toISOString();
          savedTrips[index] = editedTrip.value;
          localStorage.setItem("savedTrips", JSON.stringify(savedTrips));

          tripData.value = JSON.parse(JSON.stringify(editedTrip.value));
          isEditing.value = false;

          // 清理URL中的编辑参数
          if (route.query.edit === "true") {
            router.replace({
              name: "TripDetail",
              params: { id: tripId.value },
            });
          }

          ElMessage.success(t('messages.updateSuccess'));
          console.log("💾 本地保存行程成功:", editedTrip.value.title);

          // 确保数据保存完成后再跳转
            setTimeout(() => {
            router.push("/home");
          }, 500);
        }
      } catch (error) {
        console.error("❌ 保存失败:", error);
        ElMessage.error(t('messages.updateFailed'));
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (dateString) => {
      try {
        return new Date(dateString).toLocaleDateString("zh-CN");
      } catch {
        return '';
      }
    };

    const formatDateRange = (createTime) => {
      // 如果传入了createTime参数，使用它来生成日期范围
      if (createTime) {
        try {
          const startDate = new Date(createTime);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + (tripData.value.days || 1) - 1);

          const start = startDate.toLocaleDateString("zh-CN");
          const end = endDate.toLocaleDateString("zh-CN");
           return `${start} - ${end}`;
        } catch {
          return '';
        }
      }

      // 原有逻辑：使用dateRange
      if (!tripData.value.dateRange || tripData.value.dateRange.length !== 2) {
        return '';
      }
      try {
        const start = new Date(tripData.value.dateRange[0]).toLocaleDateString(
          navigator.language || 'en-US',
        );
        const end = new Date(tripData.value.dateRange[1]).toLocaleDateString(
          navigator.language || 'en-US',
        );
        return `${start} - ${end}`;
      } catch {
        return '';
      }
    };

    const formatDayDate = (dayIndex) => {
      if (!tripData.value.dateRange || tripData.value.dateRange.length !== 2) {
        return t('trip.dayN', { n: dayIndex + 1 });
      }
      try {
        const startDate = new Date(tripData.value.dateRange[0]);
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + dayIndex);

        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();
        return `${month}/${day}`;
      } catch {
        return t('trip.dayN', { n: dayIndex + 1 });
      }
    };

    const getActivityTypeColor = (type) => {
      const colors = {
        attraction: "primary",
        restaurant: "success",
        transport: "info",
        hotel: "warning",
      };
      return colors[type] || "default";
    };

    const getActivityTypeText = (type) => {
      const texts = {
        attraction: t('trip.activityTypes.attraction'),
        restaurant: t('trip.activityTypes.restaurant'),
        transport: t('trip.activityTypes.transport'),
        hotel: t('trip.activityTypes.hotel'),
      };
      return texts[type] || t('trip.activityTypes.other');
    };

    const getIntensityText = (intensity) => {
      const texts = {
        relaxed: "轻松休闲",
        moderate: "适中节奏",
        intensive: "紧凑高效",
      };
      return texts[intensity] || "未设置";
    };

    const getExperienceText = (experience) => {
      const texts = {
        photography: "摄影打卡",
        local_events: "当地活动",
        hidden_gems: "小众景点",
        seasonal: "季节特色",
      };
      return texts[experience] || experience;
    };

    const getTransportText = (transport) => {
      const texts = {
        walking: "多走路",
        scenic_route: "风景路线",
        fast_route: "快速到达",
      };
      return texts[transport] || transport;
    };

    // 分享行程
    const shareTrip = async () => {
      try {
        const shareText = `我的${tripData.value.destinationName}${tripData.value.days}日游行程！包含${tripData.value.attractions?.length || 0}个景点和${tripData.value.restaurants?.length || 0}家餐厅，预计花费${tripData.value.estimatedCost}。一起来看看吧！`;

        if (navigator.share) {
          // 使用原生分享API
          await navigator.share({
            title: `${tripData.value.title} - GoingTour行程`,
            text: shareText,
            url: window.location.href,
          });
          ElMessage.success("分享成功！");
        } else {
          // 降级到复制链接
          await navigator.clipboard.writeText(
            shareText + "\n\n查看详情：" + window.location.href,
          );
          ElMessage.success("行程信息已复制到剪贴板！");
        }
      } catch (error) {
        console.error("分享失败:", error);
        if (error.name === "NotAllowedError") {
          ElMessage.error("请允许访问剪贴板以完成分享");
        } else {
          ElMessage.error("分享失败，请重试");
        }
      }
    };

    // 导出行程
    const exportTrip = () => {
      try {
        // 创建并下载JSON文件
        const dataStr = JSON.stringify(tripData.value, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${tripData.value.title}-${new Date().toLocaleDateString()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        ElMessage.success("行程已导出到下载文件夹！");
      } catch (error) {
        console.error("导出失败:", error);
        ElMessage.error("导出失败，请重试");
      }
    };

    const handleMoreAction = async (command) => {
      switch (command) {
        case "duplicate":
          await duplicateTrip();
          break;
        case "template":
          await saveAsTemplate();
          break;
        case "delete":
          deleteTrip();
          break;
      }
    };

    // 复制行程
    const duplicateTrip = async () => {
      try {
        const { value: newTitle } = await ElMessageBox.prompt(
          "请输入新行程的标题：",
          "复制行程",
          {
            confirmButtonText: "复制",
            cancelButtonText: "取消",
            inputValue: `${tripData.value.title} - 副本`,
            inputPlaceholder: "输入新行程标题",
          },
        );

        if (newTitle) {
          const duplicatedTrip = {
            ...JSON.parse(JSON.stringify(tripData.value)),
            id: Date.now().toString(),
            title: newTitle,
            status: "draft",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // 保存到localStorage
          const savedTrips = JSON.parse(
            localStorage.getItem("savedTrips") || "[]",
          );
          savedTrips.push(duplicatedTrip);
          localStorage.setItem("savedTrips", JSON.stringify(savedTrips));

          ElMessage.success("行程已复制成功！");

          // 询问是否跳转到新行程
          try {
            await ElMessageBox.confirm("是否跳转到新复制的行程？", "跳转确认", {
              confirmButtonText: "跳转",
              cancelButtonText: "留在当前页面",
              type: "info",
            });
            router.push(`/trip/${duplicatedTrip.id}`);
          } catch {
            // 用户选择留在当前页面
          }
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("复制行程失败，请重试");
        }
      }
    };

    // 保存为模板
    const saveAsTemplate = async () => {
      try {
        const { value: templateName } = await ElMessageBox.prompt(
          "请输入模板名称：",
          "保存为模板",
          {
            confirmButtonText: "保存",
            cancelButtonText: "取消",
            inputValue: `${tripData.value.destinationName}${tripData.value.days}日游模板`,
            inputPlaceholder: "输入模板名称",
          },
        );

        if (templateName) {
          const template = {
            id: `template_${Date.now()}`,
            name: templateName,
            destination: tripData.value.destination,
            destinationName: tripData.value.destinationName,
            days: tripData.value.days,
            dailyPlan: tripData.value.dailyPlan.map((day) => ({
              ...day,
              activities: day.activities.map((activity) => ({
                ...activity,
                // 移除特定的行程ID，保留可复用的信息
                tripId: undefined,
              })),
            })),
            preferences: {
              intensity: tripData.value.preferences?.intensity,
              experiences: tripData.value.preferences?.experiences,
              transport: tripData.value.preferences?.transport,
            },
            createdAt: new Date().toISOString(),
            type: "template",
          };

          // 保存到localStorage的模板存储
          const savedTemplates = JSON.parse(
            localStorage.getItem("tripTemplates") || "[]",
          );
          savedTemplates.push(template);
          localStorage.setItem("tripTemplates", JSON.stringify(savedTemplates));

          ElMessage.success(`模板"${templateName}"已保存成功！`);

          ElMessage.info("模板已保存，可在创建新行程时使用");
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("保存模板失败，请重试");
        }
      }
    };

    const deleteTrip = async () => {
      try {
        await ElMessageBox.confirm(
          "确定要删除这个行程吗？删除后无法恢复。",
          "删除行程",
          {
            confirmButtonText: "删除",
            cancelButtonText: "取消",
            type: "warning",
          },
        );

        loading.value = true;

        // 首先尝试调用API删除
        try {
          const { userApi } = await import("@/api/user.js");
          const userStore = useUserStore();

          if (!userStore.currentUser?.id) {
            throw new Error("用户未登录");
          }

          const { tripApi } = await import("@/api/trip.js");
          await tripApi.deleteTrip(tripId.value, userStore.currentUser.id);

          ElMessage.success("行程删除成功");
          console.log("🗑️ API删除行程成功, ID:", tripId.value);

          // 确保删除操作完成后再跳转
          setTimeout(() => {
            router.push("/home");
          }, 500);
          return;
        } catch (apiError) {
          console.warn("⚠️ API删除失败，尝试本地存储:", apiError);
        }

        // 降级到localStorage删除
        const savedTrips = JSON.parse(
          localStorage.getItem("savedTrips") || "[]",
        );
        const filteredTrips = savedTrips.filter((t) => t.id !== tripId.value);
        localStorage.setItem("savedTrips", JSON.stringify(filteredTrips));

        ElMessage.success("行程删除成功");
        console.log("🗑️ 本地删除行程成功, ID:", tripId.value);

        // 确保删除操作完成后再跳转
        setTimeout(() => {
          router.push("/home");
        }, 500);
      } catch (error) {
        if (error === "cancel") {
          // 用户取消删除
          return;
        }
        console.error("❌ 删除行程失败:", error);
        ElMessage.error("删除行程失败：" + (error.message || "请重试"));
      } finally {
        loading.value = false;
      }
    };

    // 编辑活动
    const editActivity = async (dayIndex, actIndex) => {
      const activity =
        editedTrip.value.dailyPlan[dayIndex].activities[actIndex];

      try {
        const { value: formData } = await ElMessageBox.prompt(
          `编辑活动信息：\n当前：${activity.name}`,
          "编辑活动",
          {
            confirmButtonText: "保存",
            cancelButtonText: "取消",
            inputType: "textarea",
            inputValue: `名称：${activity.name}\n描述：${activity.description || ""}\n时间：${activity.time}`,
            inputPlaceholder:
              "请按格式修改：\n名称：xxx\n描述：xxx\n时间：xx:xx",
            inputValidator: (value) => {
              if (!value || !value.includes("名称：")) {
                return "请保持正确的格式";
              }
              return true;
            },
          },
        );

        // 解析用户输入
        const lines = formData.split("\n");
        const newName = lines
          .find((line) => line.startsWith("名称："))
          ?.replace("名称：", "")
          .trim();
        const newDesc = lines
          .find((line) => line.startsWith("描述："))
          ?.replace("描述：", "")
          .trim();
        const newTime = lines
          .find((line) => line.startsWith("时间："))
          ?.replace("时间：", "")
          .trim();

        if (newName) {
          editedTrip.value.dailyPlan[dayIndex].activities[actIndex].name =
            newName;
        }
        if (newDesc) {
          editedTrip.value.dailyPlan[dayIndex].activities[
            actIndex
          ].description = newDesc;
        }
        if (newTime && /^\d{2}:\d{2}$/.test(newTime)) {
          editedTrip.value.dailyPlan[dayIndex].activities[actIndex].time =
            newTime;
        }

        ElMessage.success("活动信息已更新");
      } catch (error) {
        // 用户取消编辑
      }
    };

    // 替换活动
    const replaceActivity = async (dayIndex, actIndex) => {
      const currentActivity =
        editedTrip.value.dailyPlan[dayIndex].activities[actIndex];

      try {
        if (currentActivity.type === "attraction") {
          await replaceWithAlternativeAttraction(
            dayIndex,
            actIndex,
            currentActivity,
          );
        } else if (currentActivity.type === "restaurant") {
          await replaceWithAlternativeRestaurant(
            dayIndex,
            actIndex,
            currentActivity,
          );
        }
      } catch (error) {
        console.error("替换活动失败:", error);
        ElMessage.error("替换失败，请重试");
      }
    };

    // 替换景点
    const replaceWithAlternativeAttraction = async (
      dayIndex,
      actIndex,
      currentActivity,
    ) => {
      try {
        // 获取备选景点（排除已选的）
        const usedAttractionIds = editedTrip.value.dailyPlan
          .flatMap((day) => day.activities)
          .filter((act) => act.type === "attraction")
          .map((act) => act.id);

        const response = await fetch(
          `http://localhost:8080/api/attractions/city/${tripData.value.destination}`,
        );

        if (response.ok) {
          const allAttractions = await response.json();
          const alternatives = (allAttractions.data || allAttractions)
            .filter((attr) => !usedAttractionIds.includes(attr.id))
            .slice(0, 5); // 最多5个备选

          if (alternatives.length === 0) {
            ElMessage.warning(t('trip.noAlternativeAttractions'));
            return;
          }

          // 用户选择替换的景点
          const { value: selectedIndex } = await ElMessageBox.prompt(
            "请选择要替换的景点（输入序号）：\n" +
              alternatives
                .map(
                  (attr, i) =>
                    `${i + 1}. ${attr.name} - ${attr.description || "精彩景点"}`,
                )
                .join("\n"),
            "选择替换景点",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              inputPattern: /^[1-5]$/,
              inputErrorMessage: "请输入有效的序号（1-5）",
            },
          );

          const selectedAttr = alternatives[parseInt(selectedIndex) - 1];
          if (selectedAttr) {
            // 替换活动
            editedTrip.value.dailyPlan[dayIndex].activities[actIndex] = {
              ...selectedAttr,
              type: "attraction",
              time: currentActivity.time, // 保持原时间
            };
            ElMessage.success(`已替换为：${selectedAttr.name}`);
          }
        } else {
          // 使用模拟数据
          const mockAlternatives = [
            {
              id: "alt_attr_1",
              name: "替代景点A",
              description: "精彩的替代景点",
              price: "￥30",
            },
            {
              id: "alt_attr_2",
              name: "替代景点B",
              description: "另一个不错的选择",
              price: "￥25",
            },
          ];

          const { value: selectedIndex } = await ElMessageBox.prompt(
            "请选择要替换的景点（输入序号）：\n1. 替代景点A\n2. 替代景点B",
            "选择替换景点",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              inputPattern: /^[1-2]$/,
              inputErrorMessage: "请输入有效的序号（1-2）",
            },
          );

          const selectedAttr = mockAlternatives[parseInt(selectedIndex) - 1];
          if (selectedAttr) {
            editedTrip.value.dailyPlan[dayIndex].activities[actIndex] = {
              ...selectedAttr,
              type: "attraction",
              time: currentActivity.time,
            };
            ElMessage.success(`已替换为：${selectedAttr.name}`);
          }
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("替换景点失败:", error);
          ElMessage.error("替换失败，请重试");
        }
      }
    };

    // 替换餐厅
    const replaceWithAlternativeRestaurant = async (
      dayIndex,
      actIndex,
      currentActivity,
    ) => {
      try {
        // 获取备选餐厅（排除已选的）
        const usedRestaurantIds = editedTrip.value.dailyPlan
          .flatMap((day) => day.activities)
          .filter((act) => act.type === "restaurant")
          .map((act) => act.id);

        const response = await fetch(
          `http://localhost:8080/api/restaurants/city/${tripData.value.destination}`,
        );

        if (response.ok) {
          const allRestaurants = await response.json();
          const alternatives = (allRestaurants.data || allRestaurants)
            .filter((rest) => !usedRestaurantIds.includes(rest.id))
            .slice(0, 5); // 最多5个备选

          if (alternatives.length === 0) {
            ElMessage.warning(t('trip.noAlternativeRestaurants'));
            return;
          }

          // 用户选择替换的餐厅
          const { value: selectedIndex } = await ElMessageBox.prompt(
            "请选择要替换的餐厅（输入序号）：\n" +
              alternatives
                .map(
                  (rest, i) =>
                    `${i + 1}. ${rest.name} - ${rest.cuisine || "美食"}`,
                )
                .join("\n"),
            "选择替换餐厅",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              inputPattern: /^[1-5]$/,
              inputErrorMessage: "请输入有效的序号（1-5）",
            },
          );

          const selectedRest = alternatives[parseInt(selectedIndex) - 1];
          if (selectedRest) {
            editedTrip.value.dailyPlan[dayIndex].activities[actIndex] = {
              ...selectedRest,
              type: "restaurant",
              time: currentActivity.time,
            };
            ElMessage.success(`已替换为：${selectedRest.name}`);
          }
        } else {
          // 使用模拟数据
          const mockAlternatives = [
            {
              id: "alt_rest_1",
              name: "替代餐厅A",
              cuisine: "本地美食",
              price: "￥80/人",
            },
            {
              id: "alt_rest_2",
              name: "替代餐厅B",
              cuisine: "特色料理",
              price: "￥60/人",
            },
          ];

          const { value: selectedIndex } = await ElMessageBox.prompt(
            "请选择要替换的餐厅（输入序号）：\n1. 替代餐厅A\n2. 替代餐厅B",
            "选择替换餐厅",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              inputPattern: /^[1-2]$/,
              inputErrorMessage: "请输入有效的序号（1-2）",
            },
          );

          const selectedRest = mockAlternatives[parseInt(selectedIndex) - 1];
          if (selectedRest) {
            editedTrip.value.dailyPlan[dayIndex].activities[actIndex] = {
              ...selectedRest,
              type: "restaurant",
              time: currentActivity.time,
            };
            ElMessage.success(`已替换为：${selectedRest.name}`);
          }
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("替换餐厅失败:", error);
          ElMessage.error("替换失败，请重试");
        }
      }
    };

    const removeActivity = async (dayIndex, actIndex) => {
      try {
        await ElMessageBox.confirm("确定要移除这个活动吗？", "移除活动", {
          confirmButtonText: "移除",
          cancelButtonText: "取消",
          type: "warning",
        });

        editedTrip.value.dailyPlan[dayIndex].activities.splice(actIndex, 1);
        ElMessage.success("活动已移除");
      } catch {
        // 用户取消
      }
    };

    // 添加活动
    const addActivity = async (dayIndex) => {
      try {
        const { value: activityType } = await ElMessageBox.prompt(
          "请选择要添加的活动类型（输入序号）：\n1. 景点参观\n2. 餐厅用餐\n3. 自定义活动",
          "选择活动类型",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            inputPattern: /^[1-3]$/,
            inputErrorMessage: "请输入有效的序号（1-3）",
          },
        );

        if (activityType === "1") {
          await addAttractionActivity(dayIndex);
        } else if (activityType === "2") {
          await addRestaurantActivity(dayIndex);
        } else if (activityType === "3") {
          await addCustomActivity(dayIndex);
        }
      } catch (error) {
        // 用户取消
      }
    };

    // 添加景点活动
    const addAttractionActivity = async (dayIndex) => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/attractions/city/${tripData.value.destination}`,
        );

        if (response.ok) {
          const allAttractions = await response.json();
          const usedAttractionIds = editedTrip.value.dailyPlan
            .flatMap((day) => day.activities)
            .filter((act) => act.type === "attraction")
            .map((act) => act.id);

          const availableAttractions = (allAttractions.data || allAttractions)
            .filter((attr) => !usedAttractionIds.includes(attr.id))
            .slice(0, 5);

          if (availableAttractions.length === 0) {
            ElMessage.warning(t('trip.noAttractionsToAdd'));
            return;
          }

          const { value: selectedIndex } = await ElMessageBox.prompt(
            "请选择要添加的景点（输入序号）：\n" +
              availableAttractions
                .map(
                  (attr, i) =>
                    `${i + 1}. ${attr.name} - ${attr.description || "精彩景点"}`,
                )
                .join("\n"),
            "选择景点",
            {
              confirmButtonText: "添加",
              cancelButtonText: "取消",
              inputPattern: /^[1-5]$/,
              inputErrorMessage: "请输入有效的序号",
            },
          );

          const selectedAttr =
            availableAttractions[parseInt(selectedIndex) - 1];
          if (selectedAttr) {
            const { value: timeInput } = await ElMessageBox.prompt(
              "请输入活动时间（例如：14:30）：",
              "设置时间",
              {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                inputPattern: /^\d{2}:\d{2}$/,
                inputErrorMessage: "请输入正确的时间格式（如：14:30）",
              },
            );

            editedTrip.value.dailyPlan[dayIndex].activities.push({
              ...selectedAttr,
              type: "attraction",
              time: timeInput,
            });

            ElMessage.success(`已添加景点：${selectedAttr.name}`);
          }
        } else {
          // 使用模拟数据
          await addCustomActivity(dayIndex, "attraction");
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("添加景点失败，请重试");
        }
      }
    };

    // 添加餐厅活动
    const addRestaurantActivity = async (dayIndex) => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/restaurants/city/${tripData.value.destination}`,
        );

        if (response.ok) {
          const allRestaurants = await response.json();
          const usedRestaurantIds = editedTrip.value.dailyPlan
            .flatMap((day) => day.activities)
            .filter((act) => act.type === "restaurant")
            .map((act) => act.id);

          const availableRestaurants = (allRestaurants.data || allRestaurants)
            .filter((rest) => !usedRestaurantIds.includes(rest.id))
            .slice(0, 5);

          if (availableRestaurants.length === 0) {
            ElMessage.warning(t('trip.noRestaurantsToAdd'));
            return;
          }

          const { value: selectedIndex } = await ElMessageBox.prompt(
            "请选择要添加的餐厅（输入序号）：\n" +
              availableRestaurants
                .map(
                  (rest, i) =>
                    `${i + 1}. ${rest.name} - ${rest.cuisine || "美食"}`,
                )
                .join("\n"),
            "选择餐厅",
            {
              confirmButtonText: "添加",
              cancelButtonText: "取消",
              inputPattern: /^[1-5]$/,
              inputErrorMessage: "请输入有效的序号",
            },
          );

          const selectedRest =
            availableRestaurants[parseInt(selectedIndex) - 1];
          if (selectedRest) {
            const { value: timeInput } = await ElMessageBox.prompt(
              "请输入用餐时间（例如：12:00）：",
              "设置时间",
              {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                inputPattern: /^\d{2}:\d{2}$/,
                inputErrorMessage: "请输入正确的时间格式（如：12:00）",
              },
            );

            editedTrip.value.dailyPlan[dayIndex].activities.push({
              ...selectedRest,
              type: "restaurant",
              time: timeInput,
            });

            ElMessage.success(`已添加餐厅：${selectedRest.name}`);
          }
        } else {
          // 使用模拟数据
          await addCustomActivity(dayIndex, "restaurant");
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("添加餐厅失败，请重试");
        }
      }
    };

    // 添加自定义活动
    const addCustomActivity = async (dayIndex, defaultType = "custom") => {
      try {
        const { value: formData } = await ElMessageBox.prompt(
          "请输入自定义活动信息：",
          "添加自定义活动",
          {
            confirmButtonText: "添加",
            cancelButtonText: "取消",
            inputType: "textarea",
            inputPlaceholder:
              "名称：xxx\n描述：xxx\n时间：xx:xx\n价格：￥xx（可选）",
            inputValidator: (value) => {
              if (
                !value ||
                !value.includes("名称：") ||
                !value.includes("时间：")
              ) {
                return "请填写名称和时间信息";
              }
              return true;
            },
          },
        );

        // 解析用户输入
        const lines = formData.split("\n");
        const name = lines
          .find((line) => line.startsWith("名称："))
          ?.replace("名称：", "")
          .trim();
        const description = lines
          .find((line) => line.startsWith("描述："))
          ?.replace("描述：", "")
          .trim();
        const time = lines
          .find((line) => line.startsWith("时间："))
          ?.replace("时间：", "")
          .trim();
        const price = lines
          .find((line) => line.startsWith("价格："))
          ?.replace("价格：", "")
          .trim();

        if (name && time && /^\d{2}:\d{2}$/.test(time)) {
          const newActivity = {
            id: `custom_${Date.now()}`,
            name,
            description: description || "自定义活动",
            time,
            type: defaultType,
            price: price || "自定义",
          };

          editedTrip.value.dailyPlan[dayIndex].activities.push(newActivity);
          ElMessage.success(`已添加活动：${name}`);
        } else {
          ElMessage.error("请确保名称和时间格式正确");
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("添加活动失败，请重试");
        }
      }
    };

    return {
      t,
      tripData,
      editedTrip,
      isEditing,
      loading,
      goBack,
      toggleEdit,
      cancelEdit,
      saveChanges,
      parseBudgetToNumber,
      formatDate,
      formatDateRange,
      formatDayDate,
      getActivityTypeColor,
      getActivityTypeText,
      getIntensityText,
      getExperienceText,
      getTransportText,
      shareTrip,
      exportTrip,
      handleMoreAction,
      deleteTrip,
      duplicateTrip,
      saveAsTemplate,
      editActivity,
      replaceActivity,
      replaceWithAlternativeAttraction,
      replaceWithAlternativeRestaurant,
      removeActivity,
      addActivity,
      addAttractionActivity,
      addRestaurantActivity,
      addCustomActivity,
    };
  },
};
</script>

<style scoped>
/* 统一的页面布局 - 与Personal.vue保持一致 */
.trip-detail-page {
  position: fixed !important;
  top: 64px !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: calc(100vh - 64px) !important;
  margin: 0 !important;
  padding: 20px !important;
  background: #f5f7fa !important;
  overflow-y: auto !important;
  z-index: 1 !important;
}

/* 重置可能影响布局的样式 */
.trip-detail-page * {
  box-sizing: border-box !important;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.back-btn {
  font-size: 14px;
  color: #606266;
}

.back-btn:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  gap: 12px;
}

/* 行程概览卡片 */
.trip-overview-card {
  margin-bottom: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.trip-overview-card .el-card__body {
  padding: 32px;
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f2f5;
}

.trip-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 12px 0;
  line-height: 1;
}

.title-input {
  font-size: 20px;
  font-weight: 700;
}

.trip-status {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}

.create-time {
  color: #718096;
  font-size: 14px;
}

.trip-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 行程信息网格 */
.trip-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #667eea;
  background: #edf2f7;
}

.info-content h4 {
  font-size: 14px;
  color: #718096;
  margin: 0 0 4px 0;
  font-weight: 500;
}

.info-content p {
  font-size: 12px;
  color: #2d3748;
  margin: 0;
  font-weight: 400;
}

/* 每日行程 */
.daily-itinerary {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid #667eea;
}

.days-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.day-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.day-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.day-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.day-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.activities-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
}

/* 活动时间轴 */
.activities-timeline {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s;
}

.activity-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e0;
}

.activity-item.is-editing {
  background: #fff7ed;
  border-color: #fed7aa;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 16px;
}

.activity-time {
  width: 80px;
  flex-shrink: 0;
}

.time-text {
  background: #667eea;
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.activity-name {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.activity-price {
  color: #e53e3e;
  font-weight: 600;
  font-size: 14px;
}

.activity-description {
  color: #718096;
  font-size: 14px;
  line-height: 1.5;
  margin: 8px 0;
}

.activity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 12px 0;
}

.activity-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

/* 偏好设置卡片 */
.preferences-card {
  margin-bottom: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.preferences-card .el-card__header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-bottom: none;
}

.preferences-card .el-card__header h3 {
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.preferences-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preference-group h4 {
  font-size: 14px;
  color: #4a5568;
  margin: 0 0 8px 0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.special-requests {
  font-size: 14px;
  line-height: 1.6;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  color: #4a5568;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .trip-detail-page {
    padding: 800px 16px 24px 16px; /* 移动端适度减少padding */
  }

  .page-header {
    padding: 12px 16px;
    margin-bottom: 16px;
  }

  .trip-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .trip-actions {
    align-self: flex-end;
  }

  .trip-info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .info-item {
    padding: 12px 0;
  }

  .day-header {
    padding: 16px 20px;
  }

  .activities-timeline {
    padding: 16px;
    gap: 16px;
  }

  .activity-item {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }

  .activity-actions {
    flex-direction: column;
  }

  .trip-title {
    font-size: 24px;
  }

  .title-input {
    font-size: 24px;
  }

  .info-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .time-text {
    padding: 6px 10px;
    font-size: 12px;
  }

  .activity-name {
    font-size: 15px;
  }

  .activity-description {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .trip-detail-page {
    padding: 600px 12px 20px 12px; /* 小屏幕进一步减少padding */
  }

  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .header-right {
    justify-content: center;
  }

  .trip-overview-card .el-card__body {
    padding: 20px;
  }

  .activities-timeline {
    padding: 12px;
  }

  .activity-item {
    padding: 12px;
  }

  .preferences-content {
    padding: 16px;
  }
}

/* 超小屏幕优化 */
@media (max-width: 360px) {
  .trip-detail-page {
    padding: 400px 8px 16px 8px; /* 超小屏幕大幅减少padding */
  }

  .page-header {
    padding: 8px 12px;
  }

  .trip-overview-card .el-card__body {
    padding: 16px;
  }
}
</style>
