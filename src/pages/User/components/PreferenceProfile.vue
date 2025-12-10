<template>
  <section class="preferences-section">
    <div class="section-header">
      <h3>
        <el-icon><Star /></el-icon>
        个人旅行档案
      </h3>
      <div class="header-actions">
        <el-button size="small" @click="$router.push('/personal/settings')">
          <el-icon><Setting /></el-icon>
          编辑档案
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="2" animated />
    </div>

    <div v-else-if="!hasPreferencesData" class="empty-preferences">
      <el-empty description="还没有设置档案信息" :image-size="100">
        <template #image>
          <el-icon size="60" color="#d3d3d3">
            <Star />
          </el-icon>
        </template>
        <el-button type="primary" @click="$router.push('/personal/settings')">
          设置档案
        </el-button>
      </el-empty>
    </div>

    <div v-else class="preferences-display">
      <!-- MBTI性格类型 -->
      <div v-if="preferences.mbtiType" class="preference-group">
        <h4><el-icon><User /></el-icon>性格类型</h4>
        <div class="mbti-display">
          <div class="mbti-content">
            <div class="mbti-image">
              <img 
                :src="`/images/mbti/${preferences.mbtiType}.png`" 
                :alt="preferences.mbtiType"
                @error="handleImageError"
              />
            </div>
            <div class="mbti-info">
              <el-tag type="info" size="small" class="mbti-tag">
                {{ preferences.mbtiType }}
              </el-tag>
              <span class="mbti-name">{{ getMbtiTypeDisplayName(preferences.mbtiType) }}</span>
              <p class="mbti-description">{{ getMbtiTypeDescription(preferences.mbtiType) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 核心兴趣爱好 -->
      <div v-if="preferences.coreInterests && preferences.coreInterests.length > 0" class="preference-group">
        <h4><el-icon><Star /></el-icon>核心兴趣爱好</h4>
        <div class="tags-container">
          <el-tag
            v-for="interest in preferences.coreInterests"
            :key="interest"
            type="primary"
            size="small"
            class="preference-tag"
          >
            {{ getCoreInterestDisplayName(interest) }}
          </el-tag>
        </div>
      </div>

      <!-- 预算水平 -->
      <div v-if="preferences.budgetLevel" class="preference-group">
        <h4><el-icon><Money /></el-icon>预算水平</h4>
        <div class="budget-display">
          <el-tag type="success" size="small" class="budget-level-tag">
            {{ getBudgetLevelDisplayName(preferences.budgetLevel) }}
          </el-tag>
          <span class="budget-range">{{ getBudgetLevelRange(preferences.budgetLevel) }}</span>
        </div>
      </div>

      <!-- 出行方式偏好 -->
      <div v-if="preferences.transportPreferences && preferences.transportPreferences.length > 0" class="preference-group">
        <h4><el-icon><MapLocation /></el-icon>出行方式偏好</h4>
        <div class="tags-container">
          <el-tag
            v-for="transport in preferences.transportPreferences"
            :key="transport"
            type="warning"
            size="small"
            class="preference-tag"
          >
            {{ getTransportPreferenceDisplayName(transport) }}
          </el-tag>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { computed } from "vue";
import { Star, Setting, User, Money, MapLocation } from "@element-plus/icons-vue";
import { PERSONAL_PROFILE_OPTIONS } from "@/utils/data/travelDataSystem.js";

export default {
  name: "PreferenceProfile",
  components: {
    Star,
    Setting,
    User,
    Money,
    MapLocation,
  },
  props: {
    preferences: {
      type: Object,
      default: () => ({}),
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    // 检查是否有偏好数据（只检查四个重要字段）
    const hasPreferencesData = computed(() => {
      const prefs = props.preferences;
      return !!(
        prefs.mbtiType ||
        (prefs.coreInterests && prefs.coreInterests.length > 0) ||
        prefs.budgetLevel ||
        (prefs.transportPreferences && prefs.transportPreferences.length > 0)
      );
    });

    const handleImageError = (event) => {
      console.warn("MBTI图片加载失败:", event.target.src);
      event.target.style.display = 'none';
    };

    // 数据解析方法
    const getMbtiTypeDisplayName = (mbtiType) => {
      return PERSONAL_PROFILE_OPTIONS.mbtiTypes.options[mbtiType]?.name || mbtiType;
    };

    const getMbtiTypeDescription = (mbtiType) => {
      return PERSONAL_PROFILE_OPTIONS.mbtiTypes.options[mbtiType]?.description || '';
    };

    const getCoreInterestDisplayName = (interest) => {
      return PERSONAL_PROFILE_OPTIONS.coreInterests.options[interest]?.name || interest;
    };

    const getBudgetLevelDisplayName = (budgetLevel) => {
      return PERSONAL_PROFILE_OPTIONS.budgetLevel.options[budgetLevel]?.name || budgetLevel;
    };

    const getBudgetLevelRange = (budgetLevel) => {
      return PERSONAL_PROFILE_OPTIONS.budgetLevel.options[budgetLevel]?.range || '';
    };

    const getTransportPreferenceDisplayName = (transport) => {
      return PERSONAL_PROFILE_OPTIONS.transportPreferences.options[transport]?.name || transport;
    };

    return {
      hasPreferencesData,
      handleImageError,
      getMbtiTypeDisplayName,
      getMbtiTypeDescription,
      getCoreInterestDisplayName,
      getBudgetLevelDisplayName,
      getBudgetLevelRange,
      getTransportPreferenceDisplayName,
    };
  },
};
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 个人旅行档案区域 */
.preferences-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.preferences-display {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  /* 确保所有偏好项目都能显示 */
  overflow: visible;
}

.preference-group {
  padding: 14px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
  min-height: 120px;
  display: flex;
  flex-direction: column;
}

.preference-group h4 {
  margin: 0 0 10px 0;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.preference-group h4 .el-icon {
  font-size: 16px;
  color: #91a8d0;
}

.tags-container,
.budget-display,
.pace-display {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}

.tags-container .el-tag,
.budget-display .el-tag,
.pace-display .el-tag {
  font-size: 11px;
  height: 22px;
  line-height: 20px;
}

.mbti-display {
  display: flex;
  align-items: center;
}

.mbti-content {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  height: 100%;
}

.mbti-image {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mbti-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.mbti-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.mbti-tag {
  margin: 0;
  font-weight: 600;
  font-size: 11px;
}

.mbti-name {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
  line-height: 1.2;
}

.mbti-description {
  margin: 0;
  font-size: 11px;
  color: #909399;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.preference-tag {
  margin: 0;
}

.budget-level-tag {
  margin-right: 6px;
  font-size: 11px;
}

.budget-range {
  font-size: 11px;
  color: #909399;
  font-weight: 500;
  line-height: 1.3;
}

.empty-preferences {
  padding: 40px 20px;
  text-align: center;
}

.loading-state {
  padding: 40px 20px;
  text-align: center;
}

/* 平板设备响应式 */
@media (max-width: 1024px) and (min-width: 769px) {
  .preferences-display {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preferences-display {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

/* 小屏手机响应式 */
@media (max-width: 480px) {
  .preferences-display {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .preference-group {
    padding: 12px;
  }

  .preference-group h4 {
    font-size: 13px;
  }
}
</style>

