<template>
  <div class="step-content">
    <el-card class="info-card" shadow="hover">
      <div v-if="tripData" class="trip-preview">
        <!-- 行程概述 -->
        <TripSummary
          :base-form="baseForm"
          :trip-data="tripData"
          @share="shareTrip"
        />

        <!-- 日程安排 -->
        <DailySchedule
          :trip-data="tripData"
          :base-form="baseForm"
          @regenerate="handleRegenerate"
        />
      </div>

      <!-- 加载中状态 -->
      <div v-else-if="isLoading" class="no-trip-data">
        <el-skeleton :rows="10" animated />
      </div>

      <!-- 无数据状态 -->
      <div v-else class="no-trip-data">
        <el-empty :description="'暂无行程数据'">
          <el-button type="primary" @click="$emit('prev-step')">
            {{ "生成行程" }}
          </el-button>
        </el-empty>
      </div>
    </el-card>

    <!-- 步骤操作按钮 -->
    <div class="step-actions">
      <el-button size="large" @click="$emit('prev-step')">
        <el-icon><ArrowLeft /></el-icon>
        {{ "上一步" }}
      </el-button>

      <el-button type="primary" size="large" :disabled="!tripData" @click="saveTrip">
        {{ "保存行程" }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { onMounted } from "vue";
import { ArrowLeft } from "@element-plus/icons-vue";
import TripSummary from "./TripPreviewParts/TripSummary.vue";
import DailySchedule from "./TripPreviewParts/DailySchedule.vue";

export default {
  name: "TripPreview",
  components: {
    ArrowLeft,
    TripSummary,
    DailySchedule,
  },
  props: {
    // 基础表单数据
    baseForm: {
      type: Object,
      required: true,
    },
    // 生成的行程数据
    tripData: {
      type: Object,
      default: null,
    },
    // 加载状态
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["regenerate", "saved", "prev-step"],
  setup(props, { emit }) {
    // 处理重新生成/替换/删除
    const handleRegenerate = (dayIndex, activityIndex) => {
      emit("regenerate", dayIndex, activityIndex);
    };

    // 分享行程
    const shareTrip = () => {
      emit("saved");
    };

    // 保存行程
    const saveTrip = () => {
      emit("saved");
    };

    // 组件挂载时的处理
    onMounted(() => {
      console.log("TripPreview组件挂载");
    });

    return {
      handleRegenerate,
      shareTrip,
      saveTrip,
    };
  },
};
</script>

<style scoped>
.info-card {
  border-radius: 12px;
  margin-bottom: 24px;
}

.step-content {
  width: 100%;
}

.trip-preview {
  padding-top: 16px;
}

.no-trip-data {
  padding: 60px 20px;
  text-align: center;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.step-actions .el-button {
  width: 120px;
}
</style>
