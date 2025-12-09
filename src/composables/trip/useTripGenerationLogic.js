import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { transformToBackendDTO } from '@/utils/data/travelDataSystem.js';
import { tripApi } from '@/api/trip.js';

export function useTripGenerationLogic(props, emit) {
  // Cancel controller
  let abortController = null;

  // Generate trip function
  const generateTrip = async (contextData) => {
    // contextData contains all necessary data for generation, prepared by the component/hook using this
    const {
      validation,
      canGenerateTrip,
      tripState,
      generatePromptText
    } = contextData;

    if (!validation.isValid) {
      validation.errors.forEach((error) => {
        if (typeof error === "string") {
          ElMessage.error(error);
        } else {
          ElMessage.error({
            message: error.message,
            duration: 6000,
            showClose: true,
          });
        }
      });
      return;
    }

    if (validation.warnings.length > 0) {
      validation.warnings.forEach((warning) => {
        if (typeof warning === "string") {
          ElMessage.warning(warning);
        } else {
          ElMessage.warning({
            message: `${warning.message}\n建议：${warning.suggestion}`,
            duration: 8000,
            showClose: true,
          });
        }
      });
    }

    if (!canGenerateTrip) {
      ElMessage.warning("请先完成基本信息填写");
      return;
    }

    try {
      emit("update:generating", true);
      emit("update:generationProgress", "开始生成行程...");
      emit("update:progressPercent", 5);

      await new Promise((resolve) => setTimeout(resolve, 800));

      emit("update:generationProgress", "分析用户偏好...");
      emit("update:progressPercent", 15);

      // Transform data
      const requestData = transformToBackendDTO(tripState);
      // Generate prompt text if not passed directly, or use a callback
      requestData.prompt = typeof generatePromptText === 'function' ? generatePromptText() : generatePromptText;

      // Add weather context if available
      if (props.weatherSuggestion) {
        requestData.weatherContext = {
          weatherDesc: props.weatherSuggestion.weatherDesc,
          tempRange: props.weatherSuggestion.tempRange,
          tips: props.weatherSuggestion.tips,
          avoid: props.weatherSuggestion.avoid,
          isHistorical: props.weatherSuggestion.isHistorical,
        };
      }

      console.log('🚀 AI Trip Generation Request:', requestData);

      emit("update:generationProgress", "构建提示词...");
      emit("update:progressPercent", 25);

      await new Promise((resolve) => setTimeout(resolve, 600));

      emit("update:generationProgress", "连接AI服务...");
      emit("update:progressPercent", 35);

      await new Promise((resolve) => setTimeout(resolve, 500));

      emit("update:generationProgress", "深度分析中...");
      emit("update:progressPercent", 45);

      emit("update:generationProgress", "发送请求...");
      emit("update:progressPercent", 55);

      abortController = new AbortController();

      const result = await tripApi.generateAiTrip(requestData, {
        signal: abortController.signal
      });

      emit("update:generationProgress", "AI正在生成行程...");
      emit("update:progressPercent", 75);

      emit("update:generationProgress", "正在格式化结果...");
      emit("update:progressPercent", 90);

      if (result.code === 200) {
        emit("update:generationProgress", "行程生成完成");
        emit("update:progressPercent", 100);

        const tripData = {
          id: result.data.tripId,
          content: result.data.content,
          aiProvider: result.data.aiProvider,
          processingTime: result.data.processingTime,
          qualityScore: result.data.qualityScore,
          destinationInfo: result.data.destinationInfo,
          tripBasicInfo: result.data.tripBasicInfo,
        };

        await new Promise((resolve) => setTimeout(resolve, 800));

        emit("update:generatedTrip", tripData);
        emit("generation-complete", tripData);

        ElMessage.success({
          message: `行程生成成功！质量评分：${result.data.qualityScore}，耗时：${Math.round(result.data.processingTime / 1000)}秒`,
          duration: 5000,
          showClose: true,
        });
      } else {
        throw new Error(result.msg || "行程生成失败");
      }
    } catch (error) {
      console.error("生成行程失败:", error);

      // 处理取消请求的错误
      if (
        error.name === "CanceledError" || 
        error.code === "ERR_CANCELED" || 
        error.name === "AbortError"
      ) {
        emit("update:generationProgress", "已取消生成");
        emit("update:progressPercent", 0);
        ElMessage.info({
          message: "已取消行程生成",
          duration: 3000,
        });
        emit("update:generating", false);
        abortController = null;
        return;
      }

      emit("update:generationProgress", "行程生成失败，请重试");
      emit("update:progressPercent", 0);

      let errorMessage = "行程生成失败";
      if (
        error.message.includes("timeout") ||
        error.message.includes("TimeoutException")
      ) {
        errorMessage = "请求超时，请稍后重试";
      } else if (
        error.message.includes("402") ||
        error.message.includes("Payment Required")
      ) {
        errorMessage = "余额不足，请检查账户余额";
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "网络连接失败，请检查网络连接";
      } else {
        errorMessage = `错误详情： ${error.message}`;
      }

      ElMessage.error({
        message: errorMessage,
        duration: 6000,
        showClose: true,
      });
    } finally {
      setTimeout(() => {
        emit("update:generating", false);
        abortController = null;
      }, 2000);
    }
  };

  const cancelGeneration = () => {
    if (abortController) {
      abortController.abort();
      ElMessage.info({
        message: "正在取消生成...",
        duration: 2000,
      });
    }
  };

  return {
    generateTrip,
    cancelGeneration
  };
}
