<template>
  <div class="personal-page simple" :class="{ embedded: embedded }">
    <!-- 页面头部 - 保留关键说明 -->
    <div class="page-intro" v-if="!embedded">
      <div class="header-row">
        <el-button
          v-if="showBackButton"
          link
          class="back-btn"
          @click="$router.back()"
        >
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2 class="title">
          旅行偏好设置
        </h2>
      </div>

      <div class="intro-content">
        <p class="intro-text">
          完善您的旅行偏好，我们将为您提供更精准的个性化推荐
        </p>
        <div class="intro-benefits">
          <div class="benefit-item">
            <el-icon><Star /></el-icon>
            <span>个性化景点推荐</span>
          </div>
          <div class="benefit-item">
            <el-icon><Lightning /></el-icon>
            <span>智能行程规划</span>
          </div>
          <div class="benefit-item">
            <el-icon><Check /></el-icon>
            <span>避免重复设置</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 1. 性格特征 -->
    <MbtiSection v-model="profileData.mbtiType" />

    <!-- 2. 核心兴趣爱好 -->
    <InterestSection v-model="profileData.coreInterests" />

    <!-- 3. 预算水平 -->
    <BudgetSection v-model="profileData.budgetLevel" />

    <!-- 4. 饮食限制 -->
    <DietarySection v-model="profileData.dietaryRestrictions" />

    <!-- 5. 出行方式偏好 -->
    <TransportSection v-model="profileData.transportPreferences" />

    <!-- 设置完成提示 -->
    <div class="completion-guide">
      <div class="guide-content">
        <el-icon><CircleCheckFilled /></el-icon>
        <div class="guide-text">
          <div class="guide-title">设置完成后的效果</div>
          <ul class="guide-list">
            <li>创建行程时自动预填您的偏好</li>
            <li>景点推荐更加精准匹配</li>
            <li>餐厅筛选严格遵守饮食限制</li>
            <li>交通建议符合您的出行习惯</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="save-section">
      <el-button
        type="primary"
        size="large"
        :loading="saving"
        @click="saveProfile"
      >
        <el-icon><Check /></el-icon>
        保存偏好设置
      </el-button>
      <div class="save-tip">设置保存后，您随时可以回来修改</div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import {
  Star,
  Lightning,
  Check,
  CircleCheckFilled,
  ArrowLeft,
} from "@element-plus/icons-vue";
import { useUserStore } from "@/store/user.js";
import { useProfile } from "@/composables/user/useProfile.js";
import MbtiSection from "./PersonalComponents/MbtiSection.vue";
import InterestSection from "./PersonalComponents/InterestSection.vue";
import BudgetSection from "./PersonalComponents/BudgetSection.vue";
import DietarySection from "./PersonalComponents/DietarySection.vue";
import TransportSection from "./PersonalComponents/TransportSection.vue";
import {useRouter} from "vue-router";

export default {
  name: "PersonalProfile",
  components: {
    Star,
    Lightning,
    Check,
    CircleCheckFilled,
    ArrowLeft,
    MbtiSection,
    InterestSection,
    BudgetSection,
    DietarySection,
    TransportSection,
  },
  props: {
    embedded: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const route = useRoute();
    const userStore = useUserStore();
    const { fetchUserPreferences, updateUserPreferences } = useProfile();
    const saving = ref(false);
    const router = useRouter();

    // 判断是否显示返回按钮
    const showBackButton = computed(() => route.query.from === "dashboard");

    // 个人档案数据
    const profileData = reactive({
      mbtiType: "",
      coreInterests: [],
      budgetLevel: "moderate",
      dietaryRestrictions: [],
      transportPreferences: [],
    });

    // 保存档案
    const saveProfile = async () => {
      if (saving.value) return;

      try {
        saving.value = true;

        // 调用用户存储保存个人档案
        await updateUserPreferences({
          ...profileData,
          profileCompleted: true,
          lastUpdated: new Date().toISOString(),
        });

      
        if (showBackButton.value) {
            setTimeout(() => {
                 ElMessage.success("个人旅行档案已保存！");
                 router.back();
            }, 500);
        }

      } catch (error) {
        console.error("保存档案失败:", error);
        ElMessage.error("保存失败：" + (error.message || "请重试"));
      } finally {
        saving.value = false;
      }
    };

    // 加载现有档案
    const loadProfile = async () => {
      try {
        await fetchUserPreferences();
        const userPrefs = userStore.currentUser?.preferences;

        if (userPrefs) {
          const parsed =
            typeof userPrefs === "string" ? JSON.parse(userPrefs) : userPrefs;

          Object.assign(profileData, {
            mbtiType: parsed.mbtiType || "",
            coreInterests: parsed.coreInterests || [],
            budgetLevel: parsed.budgetLevel || "moderate",
            dietaryRestrictions: parsed.dietaryRestrictions || [],
            transportPreferences: parsed.transportPreferences || [],
          });
        }
      } catch (error) {
        console.warn("加载档案失败:", error);
      }
    };

    onMounted(() => {
      loadProfile();
    });

    return {
      profileData,
      saving,
      saveProfile,
      showBackButton,
    };
  },
};
</script>

<style scoped>
/* 使用与其他设置页面相同的样式风格 */
.personal-page.simple {
  max-width: 960px;
  margin: 24px auto;
  padding: 0 16px;
}

.personal-page.simple.embedded {
  max-width: 100%;
  margin: 0;
  padding: 0;
}

/* 页面介绍区域 */
.page-intro {
  margin-bottom: 32px;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.back-btn {
  font-size: 15px;
  color: #606266;
  padding: 0;
  height: auto;
}

.back-btn:hover {
  color: #91a8d0;
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}


.intro-content {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #91a8d0;
}

.intro-text {
  margin: 0 0 16px 0;
  color: #606266;
  font-size: 16px;
}

.intro-benefits {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #91a8d0;
  font-size: 14px;
  font-weight: 500;
}

.benefit-item .el-icon {
  font-size: 16px;
}

/* 完成指南 */
.completion-guide {
  background: linear-gradient(135deg, #f0f9ff 0%, #e8f5e8 100%);
  border-radius: 12px;
  padding: 24px;
  margin: 32px 0;
  border: 1px solid #e1f5fe;
}

.guide-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.guide-content .el-icon {
  font-size: 24px;
  color: #67c23a;
  margin-top: 4px;
  flex-shrink: 0;
}

.guide-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  font-size: 16px;
}

.guide-list {
  margin: 0;
  padding-left: 16px;
  color: #606266;
}

.guide-list li {
  margin-bottom: 6px;
  line-height: 1.5;
}

/* 保存区域 */
.save-section {
  text-align: center;
  padding: 40px 0;
}

.save-section .el-button {
  padding: 12px 32px;
  font-size: 16px;
}

.save-tip {
  margin-top: 12px;
  color: #909399;
  font-size: 14px;
}

/* 响应式设计 */
/* 移动端样式 */
@media (max-width: 768px) {
  .personal-page.simple {
    padding: 0 12px;
  }

  .intro-benefits {
    flex-direction: column;
    gap: 12px;
  }
  
  .guide-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
