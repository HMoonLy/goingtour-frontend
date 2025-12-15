import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import { http } from "@/api/request";

export function useAiTripDisplay(props, emit) {
  const userStore = useUserStore();
  const router = useRouter();

  // 响应式状态
  const copying = ref(false);
  const saving = ref(false);
  const sharing = ref(false);
  const userRating = ref(0);
  const userFeedback = ref("");

  // 工具函数：从行程内容中提取预算信息
  const extractBudgetFromContent = (content) => {
    if (!content) return null;
    const budgetPatterns = [
      /预算分配.*?(\d+)元/,
      /总计约?(\d+)元/,
      /费用.*?(\d+)元/,
      /预算.*?(\d+)元/,
      /约(\d+)元/,
    ];

    for (const pattern of budgetPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return parseFloat(match[1]);
      }
    }
    return null;
  };

  // 复制到剪贴板
  const copyToClipboard = async () => {
    copying.value = true;
    try {
      const content = props.tripData?.content || "";
      await navigator.clipboard.writeText(content);
      ElMessage.success("复制成功！");
    } catch (err) {
      ElMessage.error("复制失败，请重试");
    } finally {
      copying.value = false;
    }
  };

  // 保存行程
  const saveTrip = async () => {
    saving.value = true;
    try {
      // 构建保存请求数据
      const saveRequest = {
        userId: userStore.userId || 1,
        title: `${props.tripData?.destinationInfo?.name || "未知目的地"}${
          props.tripData?.tripBasicInfo?.days || 3
        }天${props.tripData?.tripBasicInfo?.travelers || 1}人行程`,
        city: props.tripData?.destinationInfo?.name || "未知目的地",
        days: props.tripData?.tripBasicInfo?.days || 3,
        travelers: props.tripData?.tripBasicInfo?.travelers || 1,
        totalBudget: extractBudgetFromContent(props.tripData?.content) || null,
        aiContent: props.tripData?.content || "",
        destinationInfo: JSON.stringify(props.tripData?.destinationInfo || {}),
        tripBasicInfo: JSON.stringify(props.tripData?.tripBasicInfo || {}),
        qualityScore: props.tripData?.qualityScore || null,
        processingTime: props.tripData?.processingTime || null,
        generationParams: JSON.stringify({
          aiProvider: props.tripData?.aiProvider || "DeepSeek",
          promptLength: props.tripData?.promptLength || null,
          responseLength: props.tripData?.responseLength || null,
          generatedAt: props.tripData?.generatedAt || new Date().toISOString(),
        }),
        feedbackRating: userRating.value > 0 ? userRating.value : null,
        feedbackContent: userFeedback.value.trim() || null,
      };

      // 调用后端API保存行程
      const response = await http.post("/ai/trip/save", saveRequest);

      if (response.code === 200) {
        ElMessage.success("保存成功！");
        emit("save", {
          ...props.tripData,
          savedTripId: response.data.id,
          saved: true,
        });

        // 延迟跳转到首页
        setTimeout(() => {
          router.push("/home");
        }, 1500);
      } else {
        throw new Error(response.msg || "保存失败");
      }
    } catch (err) {
      ElMessage.error(err.message || "保存失败，请重试");
    } finally {
      saving.value = false;
    }
  };

  // 分享行程
  const shareTrip = async () => {
    sharing.value = true;
    try {
      await ElMessageBox.confirm(
        "您想要将行程发布到社区广场，还是直接复制链接分享给好友？",
        "分享行程",
        {
          confirmButtonText: "发布到社区",
          cancelButtonText: "复制链接分享",
          distinguishCancelAndClose: true,
          type: "info",
          center: true,
        }
      )
        .then(() => {
          // 跳转到发布页，注意这里需要先保存行程
          if (!props.tripData.id && !props.tripData.savedTripId) {
            ElMessage.warning("请先保存行程后再发布");
            return;
          }
          
          const tripId = props.tripData.id || props.tripData.savedTripId;
          router.push({
            path: "/community/publish",
            query: { tripId: tripId },
          });
        })
        .catch(async (action) => {
          if (action === "cancel") {
            // 复制内容分享
            const content = props.tripData?.content || "";
            await navigator.clipboard.writeText(content);
            ElMessage.success("行程内容已复制到剪贴板！");
          }
        });
        
      emit("share", props.tripData);
    } catch (err) {
      if (err !== 'cancel' && err !== 'close') {
        console.error("分享失败:", err);
        ElMessage.error("分享操作异常");
      }
    } finally {
      sharing.value = false;
    }
  };

  // 重新生成行程
  const regenerateTrip = () => {
    ElMessageBox.confirm("重新生成将替换当前行程，确定继续吗？", "重新生成行程", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        emit("regenerate");
      })
      .catch(() => {});
  };

  // 提交评分
  const submitRating = () => {
    if (userRating.value > 0) {
      ElMessage.success(`感谢您的${userRating.value}星评价！`);
    }
  };

  // 提交反馈
  const submitFeedback = () => {
    if (!userFeedback.value.trim()) return;
    ElMessage.success("提交成功，感谢您的反馈！");
    userFeedback.value = "";
  };

  // 清空反馈
  const clearFeedback = () => {
    userFeedback.value = "";
    userRating.value = 0;
  };

  return {
    copying,
    saving,
    sharing,
    userRating,
    userFeedback,
    copyToClipboard,
    saveTrip,
    shareTrip,
    regenerateTrip,
    submitRating,
    submitFeedback,
    clearFeedback,
  };
}
