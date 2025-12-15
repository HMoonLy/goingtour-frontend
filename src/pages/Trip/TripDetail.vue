<template>
  <div class="trip-detail-page">
    <!-- 页面头部 -->
    <TripDetailHeader
      :is-editing="isEditing"
      @back="goBack"
      @toggle-edit="toggleEdit"
      @cancel-edit="cancelEdit"
      @save-changes="saveChanges"
    />

    <!-- 行程概览卡片 -->
    <TripOverviewCard
      :trip-data="tripData"
      :edited-trip="editedTrip"
      :is-editing="isEditing"
      @update:editedTrip="(val) => (editedTrip = val)"
      @share="shareTrip"
      @export="handleExport"
      @more-action="handleMoreAction"
    />

    <!-- 每日行程详情 -->
    <TripDailyItinerary
      :daily-plan="currentDailyPlan"
      :date-range="currentDateRange"
      :is-editing="isEditing"
      :destination="tripData.destination"
    />

    <!-- 行程偏好设置 -->
    <TripPreferencesCard
      :preferences="tripData.preferences"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "@/store/user.js";
import { TripExporter } from "@/utils/export/tripExporter";

// 引入子组件
import TripDetailHeader from "@/components/Trip/Details/TripDetailHeader.vue";
import TripOverviewCard from "@/components/Trip/Details/TripOverviewCard.vue";
import TripDailyItinerary from "@/components/Trip/Details/TripDailyItinerary.vue";
import TripPreferencesCard from "@/components/Trip/Details/TripPreferencesCard.vue";

// 引入转换工具（如果需要的话，虽然这里主要用API里的）
// import { convertBackendTripToFrontend, convertFrontendTripToBackend } from "@/utils/data/tripDataConverter.js";

export default {
  name: "TripDetail",
  components: {
    TripDetailHeader,
    TripOverviewCard,
    TripDailyItinerary,
    TripPreferencesCard,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const userStore = useUserStore();

    // 响应式数据
    const tripData = ref({});
    const editedTrip = ref({});
    const isEditing = ref(false);
    const loading = ref(false);

    // 计算属性
    const tripId = computed(() => route.params.id);

    const currentDailyPlan = computed(() => {
      return isEditing.value
        ? editedTrip.value.dailyPlan
        : tripData.value.dailyPlan;
    });

    const currentDateRange = computed(() => {
      return isEditing.value
        ? editedTrip.value.dateRange
        : tripData.value.dateRange;
    });

    // 生命周期
    onMounted(() => {
      loadTripData();
    });

    // 工具函数：转换数据
    // 注意：原代码中直接使用了 convertBackendTripToFrontend，但该函数未导入
    // 我们假设它在 utils 中，或者直接在 API 调用中处理了。
    // 检查原代码发现 convertBackendTripToFrontend 在 loadTripData 内部被调用，但似乎没有 import？
    // 仔细看原代码，它似乎是在 setup 内部定义的或者全局引入的？
    // 不，原代码 lines 399 和 508 使用了 convert... 函数，但在 import 部分没有看到。
    // 这可能是一个潜在的 bug 或者它是全局混入的？
    // 让我们再检查一下原文件 imports...
    // 原文件 imports:
    // import { translateTag... } from "@/utils/data/travelDataSystem.js";
    // import { TripExporter } from "@/utils/export/tripExporter";
    // 并没有 convertBackendTripToFrontend。
    // 也许这些函数是在 <script setup> 中自动引入的？不，这是普通 <script>。
    // 也许在 main.js 中全局注册了？
    // 无论如何，我会尝试保留原有逻辑，如果报错再修复。为了安全起见，我应该引入这些函数如果它们存在于 utils 中。
    // 刚才的文件列表显示有 src/utils/data/tripDataConverter.js。我应该显式引入它。

    const loadTripData = async () => {
      try {
        loading.value = true;

        // 引入转换工具
        const {
          convertBackendTripToFrontend,
        } = await import("@/utils/data/tripDataConverter.js");

        // 首先尝试从API加载数据
        try {
          if (!userStore.currentUser?.id) {
            // throw new Error("用户未登录"); // 允许未登录查看本地数据
          }

          if (userStore.currentUser?.id) {
            const { tripApi } = await import("@/api/trip.js");
            const response = await tripApi.getTripDetail(
              tripId.value,
              userStore.currentUser.id
            );

            if (response.data) {
              const convertedTrip = convertBackendTripToFrontend(response.data);
              tripData.value = convertedTrip;
              editedTrip.value = JSON.parse(JSON.stringify(convertedTrip)); // 深拷贝

              // 检查是否需要自动进入编辑模式
              if (route.query.edit === "true") {
                isEditing.value = true;
              }

              return;
            }
          }
        } catch (apiError) {
          console.warn("⚠️ 从API加载失败，尝试本地存储:", apiError);
        }

        // 降级到localStorage
        const savedTrips = JSON.parse(localStorage.getItem("savedTrips") || "[]");
        const trip = savedTrips.find((t) => t.id === tripId.value);

        if (trip) {
          tripData.value = trip;
          editedTrip.value = JSON.parse(JSON.stringify(trip)); // 深拷贝

          // 检查是否需要自动进入编辑模式
          if (route.query.edit === "true") {
            isEditing.value = true;
          }
        } else {
          ElMessage.error("找不到该行程");
          router.push("/home");
        }
      } catch (error) {
        console.error("❌ 加载行程数据失败:", error);
        ElMessage.error("加载失败，请重试");
        router.push("/home");
      } finally {
        loading.value = false;
      }
    };

    const goBack = () => {
      // 如果正在编辑，询问用户是否保存
      if (isEditing.value) {
        ElMessageBox.confirm("您有未保存的修改，确定要离开吗？", "未保存的修改", {
          confirmButtonText: "离开",
          cancelButtonText: "取消",
          type: "warning",
        })
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
      // 可以在这里清除 URL query 参数
      if (route.query.edit === "true") {
         router.replace({ query: null });
      }
    };

    const saveChanges = async () => {
      try {
        loading.value = true;

        const {
           convertFrontendTripToBackend,
           convertBackendTripToFrontend
        } = await import("@/utils/data/tripDataConverter.js");

        // 首先尝试调用API保存
        try {
          if (!userStore.currentUser?.id) {
             // throw new Error("用户未登录");
          }

          if (userStore.currentUser?.id) {
            const { tripApi } = await import("@/api/trip.js");

            // 使用转换工具将前端数据转换为后端格式
            const tripRequest = convertFrontendTripToBackend(editedTrip.value);

            const response = await tripApi.updateTrip(
              tripId.value,
              userStore.currentUser.id,
              tripRequest
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

              ElMessage.success("保存成功！");

              // 确保数据保存完成后再跳转
              setTimeout(() => {
                router.push("/home");
              }, 500);
              return;
            }
          }
        } catch (apiError) {
          console.warn("⚠️ API保存失败，尝试本地存储:", apiError);
        }

        // 降级到localStorage保存
        const savedTrips = JSON.parse(localStorage.getItem("savedTrips") || "[]");
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

          ElMessage.success("保存成功！");

          // 确保数据保存完成后再跳转
          setTimeout(() => {
            router.push("/home");
          }, 500);
        }
      } catch (error) {
        console.error("❌ 保存失败:", error);
        ElMessage.error("保存失败，请重试");
      } finally {
        loading.value = false;
      }
    };

    // 分享行程
    const shareTrip = async () => {
      try {
        const shareText = `我的${tripData.value.destinationName}${
          tripData.value.days
        }日游行程！包含${tripData.value.attractions?.length || 0}个景点和${
          tripData.value.restaurants?.length || 0
        }家餐厅，预计花费${tripData.value.estimatedCost}。一起来看看吧！`;

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
            shareText + "\n\n查看详情：" + window.location.href
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
    const handleExport = async (format) => {
      const loadingMessage = ElMessage({
        message: "正在生成文件，请稍候...",
        type: "info",
        duration: 0,
      });

      try {
        const exporter = new TripExporter(tripData.value);

        switch (format) {
          case "word":
            await exporter.exportToWord();
            ElMessage.success("Word文档导出成功！文件已保存到下载文件夹");
            break;
          case "image":
            await exporter.exportToImage();
            ElMessage.success("图片导出成功！文件已保存到下载文件夹");
            break;
        }
      } catch (error) {
        console.error("导出失败:", error);
        ElMessage.error("导出失败，请重试");
      } finally {
        loadingMessage.close();
      }
    };

    const handleMoreAction = async (command) => {
      switch (command) {
        case "publish":
          router.push({
            path: "/community/publish",
            query: { tripId: tripData.value.id },
          });
          break;
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
          }
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
          const savedTrips = JSON.parse(localStorage.getItem("savedTrips") || "[]");
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
          }
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
            localStorage.getItem("tripTemplates") || "[]"
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
        await ElMessageBox.confirm("确定要删除这个行程吗？删除后无法恢复。", "删除行程", {
          confirmButtonText: "删除",
          cancelButtonText: "取消",
          type: "warning",
        });

        loading.value = true;

        // 首先尝试调用API删除
        try {
          if (userStore.currentUser?.id) {
             const { tripApi } = await import("@/api/trip.js");
             await tripApi.deleteTrip(tripId.value, userStore.currentUser.id);

             ElMessage.success("行程删除成功");

             // 确保删除操作完成后再跳转
             setTimeout(() => {
               router.push("/home");
             }, 500);
             return;
          }
        } catch (apiError) {
          console.warn("⚠️ API删除失败，尝试本地存储:", apiError);
        }

        // 降级到localStorage删除
        const savedTrips = JSON.parse(localStorage.getItem("savedTrips") || "[]");
        const filteredTrips = savedTrips.filter((t) => t.id !== tripId.value);
        localStorage.setItem("savedTrips", JSON.stringify(filteredTrips));

        ElMessage.success("行程删除成功");

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

    return {
      tripData,
      editedTrip,
      isEditing,
      currentDailyPlan,
      currentDateRange,
      loading,
      goBack,
      toggleEdit,
      cancelEdit,
      saveChanges,
      shareTrip,
      handleExport,
      handleMoreAction,
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

/* 响应式设计 */
@media (max-width: 768px) {
  .trip-detail-page {
    padding: 80px 16px 24px 16px !important; /* 移动端适度减少padding */
  }
}

@media (max-width: 480px) {
  .trip-detail-page {
    padding: 60px 12px 20px 12px !important; /* 小屏幕进一步减少padding */
  }
}

/* 超小屏幕优化 */
@media (max-width: 360px) {
  .trip-detail-page {
    padding: 40px 8px 16px 8px !important; /* 超小屏幕大幅减少padding */
  }
}
</style>
