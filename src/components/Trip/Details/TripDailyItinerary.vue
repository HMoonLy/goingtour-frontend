<template>
  <div class="daily-itinerary">
    <h2 class="section-title">
      <el-icon><Clock /></el-icon>
      每日行程安排
    </h2>

    <div class="days-container">
      <div
        v-for="(day, dayIndex) in dailyPlan"
        :key="dayIndex"
        class="day-card"
      >
        <div class="day-header">
          <div class="day-info">
            <h3>第{{ dayIndex + 1 }}天</h3>
            <span class="day-date">{{ formatDayDate(dayIndex) }}</span>
          </div>
          <div class="day-stats">
            <span>{{ (day.activities?.length || 0) + "个活动" }}</span>
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
                  <el-tag size="small" :type="getActivityTypeColor(activity.type)">
                    {{ getActivityTypeText(activity.type) }}
                  </el-tag>
                  <span v-if="activity.price" class="activity-price"
                    >¥{{ activity.price }}</span
                  >
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
              <div v-if="isEditing" class="activity-actions">
                <el-button size="small" @click="editActivity(dayIndex, actIndex)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button size="small" @click="replaceActivity(dayIndex, actIndex)">
                  <el-icon><Refresh /></el-icon>
                  替换
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="removeActivity(dayIndex, actIndex)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>

          <!-- 添加活动按钮（编辑模式） -->
          <div v-if="isEditing" class="add-activity">
            <el-button type="dashed" @click="addActivity(dayIndex)">
              <el-icon><Plus /></el-icon>
              添加活动
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Clock, Edit, Refresh, Delete, Plus } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "TripDailyItinerary",
  components: {
    Clock,
    Edit,
    Refresh,
    Delete,
    Plus,
  },
  props: {
    dailyPlan: {
      type: Array,
      required: true,
    },
    dateRange: {
      type: Array,
      default: () => [],
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
    destination: {
      type: String,
      default: "",
    },
  },
  // 可以根据需要定义 emits，这里直接修改响应式对象
  setup(props) {
    const formatDayDate = (dayIndex) => {
      if (!props.dateRange || props.dateRange.length !== 2) {
        return `第${dayIndex + 1}天`;
      }
      try {
        const startDate = new Date(props.dateRange[0]);
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + dayIndex);

        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();
        return `${month}/${day}`;
      } catch {
        return `第${dayIndex + 1}天`;
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
        attraction: "景点",
        restaurant: "餐厅",
        transport: "交通",
        hotel: "酒店",
      };
      return texts[type] || "其他";
    };

    // 编辑活动
    const editActivity = async (dayIndex, actIndex) => {
      const activity = props.dailyPlan[dayIndex].activities[actIndex];

      try {
        const { value: formData } = await ElMessageBox.prompt(
          `编辑活动信息：\n当前：${activity.name}`,
          "编辑活动",
          {
            confirmButtonText: "保存",
            cancelButtonText: "取消",
            inputType: "textarea",
            inputValue: `名称：${activity.name}\n描述：${
              activity.description || ""
            }\n时间：${activity.time}`,
            inputPlaceholder: "请按格式修改：\n名称：xxx\n描述：xxx\n时间：xx:xx",
            inputValidator: (value) => {
              if (!value || !value.includes("名称：")) {
                return "请保持正确的格式";
              }
              return true;
            },
          }
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
          props.dailyPlan[dayIndex].activities[actIndex].name = newName;
        }
        if (newDesc) {
          props.dailyPlan[dayIndex].activities[actIndex].description = newDesc;
        }
        if (newTime && /^\d{2}:\d{2}$/.test(newTime)) {
          props.dailyPlan[dayIndex].activities[actIndex].time = newTime;
        }

        ElMessage.success("活动信息已更新");
      } catch (error) {
        // 用户取消编辑
      }
    };

    // 替换活动
    const replaceActivity = async (dayIndex, actIndex) => {
      const currentActivity = props.dailyPlan[dayIndex].activities[actIndex];

      try {
        if (currentActivity.type === "attraction") {
          await replaceWithAlternativeAttraction(dayIndex, actIndex, currentActivity);
        } else if (currentActivity.type === "restaurant") {
          await replaceWithAlternativeRestaurant(dayIndex, actIndex, currentActivity);
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
      currentActivity
    ) => {
      try {
        // 获取备选景点（排除已选的）
        const usedAttractionIds = props.dailyPlan
          .flatMap((day) => day.activities)
          .filter((act) => act.type === "attraction")
          .map((act) => act.id);

        const response = await fetch(
          `http://localhost:8080/api/attractions/city/${props.destination}`
        );

        if (response.ok) {
          const allAttractions = await response.json();
          const alternatives = (allAttractions.data || allAttractions)
            .filter((attr) => !usedAttractionIds.includes(attr.id))
            .slice(0, 5); // 最多5个备选

          if (alternatives.length === 0) {
            ElMessage.warning("没有更多备选景点");
            return;
          }

          // 用户选择替换的景点
          const { value: selectedIndex } = await ElMessageBox.prompt(
            "请选择要替换的景点（输入序号）：\n" +
              alternatives
                .map(
                  (attr, i) =>
                    `${i + 1}. ${attr.name} - ${attr.description || "精彩景点"}`
                )
                .join("\n"),
            "选择替换景点",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              inputPattern: /^[1-5]$/,
              inputErrorMessage: "请输入有效的序号（1-5）",
            }
          );

          const selectedAttr = alternatives[parseInt(selectedIndex) - 1];
          if (selectedAttr) {
            // 替换活动
            props.dailyPlan[dayIndex].activities[actIndex] = {
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
            }
          );

          const selectedAttr = mockAlternatives[parseInt(selectedIndex) - 1];
          if (selectedAttr) {
            props.dailyPlan[dayIndex].activities[actIndex] = {
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
      currentActivity
    ) => {
      try {
        // 获取备选餐厅（排除已选的）
        const usedRestaurantIds = props.dailyPlan
          .flatMap((day) => day.activities)
          .filter((act) => act.type === "restaurant")
          .map((act) => act.id);

        const response = await fetch(
          `http://localhost:8080/api/restaurants/city/${props.destination}`
        );

        if (response.ok) {
          const allRestaurants = await response.json();
          const alternatives = (allRestaurants.data || allRestaurants)
            .filter((rest) => !usedRestaurantIds.includes(rest.id))
            .slice(0, 5); // 最多5个备选

          if (alternatives.length === 0) {
            ElMessage.warning("没有更多备选餐厅");
            return;
          }

          // 用户选择替换的餐厅
          const { value: selectedIndex } = await ElMessageBox.prompt(
            "请选择要替换的餐厅（输入序号）：\n" +
              alternatives
                .map((rest, i) => `${i + 1}. ${rest.name} - ${rest.cuisine || "美食"}`)
                .join("\n"),
            "选择替换餐厅",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              inputPattern: /^[1-5]$/,
              inputErrorMessage: "请输入有效的序号（1-5）",
            }
          );

          const selectedRest = alternatives[parseInt(selectedIndex) - 1];
          if (selectedRest) {
            props.dailyPlan[dayIndex].activities[actIndex] = {
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
            }
          );

          const selectedRest = mockAlternatives[parseInt(selectedIndex) - 1];
          if (selectedRest) {
            props.dailyPlan[dayIndex].activities[actIndex] = {
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

        props.dailyPlan[dayIndex].activities.splice(actIndex, 1);
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
          }
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
          `http://localhost:8080/api/attractions/city/${props.destination}`
        );

        if (response.ok) {
          const allAttractions = await response.json();
          const usedAttractionIds = props.dailyPlan
            .flatMap((day) => day.activities)
            .filter((act) => act.type === "attraction")
            .map((act) => act.id);

          const availableAttractions = (allAttractions.data || allAttractions)
            .filter((attr) => !usedAttractionIds.includes(attr.id))
            .slice(0, 5);

          if (availableAttractions.length === 0) {
            ElMessage.warning("没有景点可添加");
            return;
          }

          const { value: selectedIndex } = await ElMessageBox.prompt(
            "请选择要添加的景点（输入序号）：\n" +
              availableAttractions
                .map(
                  (attr, i) =>
                    `${i + 1}. ${attr.name} - ${attr.description || "精彩景点"}`
                )
                .join("\n"),
            "选择景点",
            {
              confirmButtonText: "添加",
              cancelButtonText: "取消",
              inputPattern: /^[1-5]$/,
              inputErrorMessage: "请输入有效的序号",
            }
          );

          const selectedAttr = availableAttractions[parseInt(selectedIndex) - 1];
          if (selectedAttr) {
            const { value: timeInput } = await ElMessageBox.prompt(
              "请输入活动时间（例如：14:30）：",
              "设置时间",
              {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                inputPattern: /^\d{2}:\d{2}$/,
                inputErrorMessage: "请输入正确的时间格式（如：14:30）",
              }
            );

            props.dailyPlan[dayIndex].activities.push({
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
          `http://localhost:8080/api/restaurants/city/${props.destination}`
        );

        if (response.ok) {
          const allRestaurants = await response.json();
          const usedRestaurantIds = props.dailyPlan
            .flatMap((day) => day.activities)
            .filter((act) => act.type === "restaurant")
            .map((act) => act.id);

          const availableRestaurants = (allRestaurants.data || allRestaurants)
            .filter((rest) => !usedRestaurantIds.includes(rest.id))
            .slice(0, 5);

          if (availableRestaurants.length === 0) {
            ElMessage.warning("没有餐厅可添加");
            return;
          }

          const { value: selectedIndex } = await ElMessageBox.prompt(
            "请选择要添加的餐厅（输入序号）：\n" +
              availableRestaurants
                .map((rest, i) => `${i + 1}. ${rest.name} - ${rest.cuisine || "美食"}`)
                .join("\n"),
            "选择餐厅",
            {
              confirmButtonText: "添加",
              cancelButtonText: "取消",
              inputPattern: /^[1-5]$/,
              inputErrorMessage: "请输入有效的序号",
            }
          );

          const selectedRest = availableRestaurants[parseInt(selectedIndex) - 1];
          if (selectedRest) {
            const { value: timeInput } = await ElMessageBox.prompt(
              "请输入用餐时间（例如：12:00）：",
              "设置时间",
              {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                inputPattern: /^\d{2}:\d{2}$/,
                inputErrorMessage: "请输入正确的时间格式（如：12:00）",
              }
            );

            props.dailyPlan[dayIndex].activities.push({
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
            inputPlaceholder: "名称：xxx\n描述：xxx\n时间：xx:xx\n价格：￥xx（可选）",
            inputValidator: (value) => {
              if (!value || !value.includes("名称：") || !value.includes("时间：")) {
                return "请填写名称和时间信息";
              }
              return true;
            },
          }
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

          props.dailyPlan[dayIndex].activities.push(newActivity);
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
      formatDayDate,
      getActivityTypeColor,
      getActivityTypeText,
      editActivity,
      replaceActivity,
      removeActivity,
      addActivity,
    };
  },
};
</script>

<style scoped>
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
  border-bottom: 2px solid #91a8d0;
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
  transition: transform 0.3s, box-shadow 0.3s;
}

.day-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.day-header {
  background: linear-gradient(135deg, #91a8d0, #f7cac9);
  color: white;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.day-info h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.day-date {
  font-size: 14px;
  opacity: 0.9;
}

.day-stats {
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
  background: #91a8d0;
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  display: inline-block;
  width: 100%;
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

.activity-meta {
  display: flex;
  align-items: center;
  gap: 8px;
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

.add-activity {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

@media (max-width: 768px) {
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
  .activities-timeline {
    padding: 12px;
  }

  .activity-item {
    padding: 12px;
  }
}
</style>

