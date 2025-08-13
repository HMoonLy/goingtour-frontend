<template>
  <div class="step-content">
    <!-- 页面标题区域 -->
    <div class="page-title">
      <div class="title-content">
        <el-icon class="title-icon">
          <MagicStick />
        </el-icon>
        <div class="title-text">
          <h2 class="main-title">
个人偏好
</h2>
          <p class="subtitle">
准备生成您的专属行程
</p>
        </div>
      </div>
    </div>

    <!-- 推荐区域 -->
    <div class="form-section">
      <div class="section-title">
        <el-icon><Location /></el-icon>
        <span>{{ (cityInfo?.destinationName || "目的地") + "推荐内容" }}</span>
      </div>

      <!-- 切换标签 -->
      <div class="tab-switcher">
        <div
          class="tab-item"
          :class="{ active: SisShow }"
          @click="
            SisShow = true;
            RisShow = false;
          "
        >
          <el-icon><Location /></el-icon>
          <span>必去景点</span>
          <el-tag size="small"
type="success"
>
高德天气API
</el-tag>
        </div>
        <div
          class="tab-item"
          :class="{ active: RisShow }"
          @click="
            RisShow = true;
            SisShow = false;
          "
        >
          <el-icon><Food /></el-icon>
          <span>必去餐厅</span>
          <el-tag size="small"
type="warning"
>
高德天气API
</el-tag>
        </div>
      </div>

      <!-- 搜索功能 -->
      <div class="search-section">
        <div class="search-input-group">
          <el-input
            v-model="searchKeyword"
            :placeholder="
              SisShow ? '请输入景点名称或关键词' : '请输入餐厅名称或关键词'
            "
            clearable
            @keyup.enter="handleSearch"
            @clear="handleClearSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary"
:loading="searching" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>
        <div class="search-filters">
          <el-select
            v-model="sortBy"
            placeholder="排序方式"
            size="small"
            style="width: 120px"
          >
            <el-option label="默认排序"
value="default" />
            <el-option label="评分优先"
value="rating" />
            <el-option label="距离优先"
value="distance" />
          </el-select>
        </div>
      </div>

      <!-- 景点推荐内容 -->
      <div v-show="SisShow"
class="recommendation-content">
        <!-- 搜索模式提示 -->
        <div
          v-if="isSearchMode && searchResults.length > 0"
          class="search-mode-tip"
        >
          <el-alert
            :title="
              '搜索结果：' +
                searchKeyword +
                '（共 ' +
                searchResults.filter((item) => item.isAttraction).length +
                ' 个景点）'
            "
            type="info"
            :closable="false"
            show-icon
          />
          <div style="margin-top: 8px">
            <el-button size="small"
@click="handleClearSearch">
              返回推荐
            </el-button>
          </div>
        </div>

        <div v-if="loadingAttractions"
class="loading-state">
          <el-skeleton :rows="3"
animated />
        </div>

        <div
          v-else-if="recommendedAttractions.length === 0 && !apiError"
          class="empty-state"
        >
          <el-empty :description="暂无推荐景点" />
        </div>

        <div v-else-if="apiError"
class="error-state">
          <el-alert
            :title="apiError"
            type="error"
            :closable="false"
            show-icon
          />
        </div>

        <div v-else
class="recommendation-list">
          <div
            v-for="attraction in isSearchMode
              ? searchResults.filter((item) => item.isAttraction)
              : recommendedAttractions"
            :key="attraction.id"
            class="recommendation-item vertical-layout"
          >
            <div class="recommendation-image">
              <img
                v-if="attraction.photos && attraction.photos.length > 0"
                :src="attraction.photos[0].url"
                :alt="attraction.name"
                @error="
                  (e) =>
                    (e.target.src =
                      'https://via.placeholder.com/300x200?text=Attraction')
                "
              />
              <div v-else
class="no-image">
                <el-icon><Picture /></el-icon>
              </div>
            </div>
            <div class="recommendation-content">
              <h4 :title="attraction.name"
class="full-width-name">
                {{ attraction.name }}
              </h4>
              <div class="recommendation-rating rating-with-number">
                <el-rate
                  :model-value="Number(attraction.rating)"
                  disabled
                  text-color="#ff9900"
                />
                <span class="rating-value">{{ attraction.rating }}</span>
              </div>
              <div class="recommendation-tags">
                <el-tag size="small"
type="success" class="category-tag">
                  风景名胜
                </el-tag>
                <el-tag size="small"
class="tag-item">
                  {{ attraction.type }}
                </el-tag>
              </div>

              <!-- 景点标签信息 -->
              <div class="attraction-tags">
                <p class="tags-title">
                  <el-icon><Star /></el-icon>
                  推荐 :
                </p>
                <div
                  v-if="extractAttractionTags(attraction).length > 0"
                  class="feature-tags"
                >
                  <el-tag
                    v-for="(tag, index) in extractAttractionTags(
                      attraction,
                    ).slice(0, 3)"
                    :key="index"
                    size="small"
                    effect="plain"
                    type="info"
                    class="feature-tag"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
                <div v-else
class="feature-tags">
                  <el-tag
                    size="small"
                    effect="plain"
                    type="info"
                    class="feature-tag empty-tag"
                  >
                    无
                  </el-tag>
                </div>
              </div>

              <p class="recommendation-address">
                <el-icon><Location /></el-icon>
                <span class="address-text">{{
                  attraction.address || "暂无地址信息"
                }}</span>
              </p>

              <!-- 添加到计划按钮 -->
              <div class="add-to-plan">
                <el-button
                  v-if="!isAttractionSelected(attraction)"
                  type="success"
                  size="small"
                  plain
                  @click="addAttractionToPlan(attraction)"
                >
                  <el-icon><Plus /></el-icon>
                  添加到计划
                </el-button>
                <el-button
                  v-else
                  type="success"
                  size="small"
                  @click="removeAttractionFromPlan(attraction)"
                >
                  <el-icon><Check /></el-icon>
                  已添加
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="recommendedAttractions.length > 0 && !isSearchMode"
          class="view-more-container"
        >
          <el-button
            type="primary"
            plain
            size="small"
            @click="loadMoreAttractions"
          >
            <el-icon><More /></el-icon>
            查看更多景点
          </el-button>
        </div>
      </div>

      <!-- 餐厅推荐内容 -->
      <div v-show="RisShow"
class="recommendation-content" v-if="RisShow">
        <!-- 搜索模式提示 -->
        <div
          v-if="isSearchMode && searchResults.length > 0"
          class="search-mode-tip"
        >
          <el-alert
            :title="
              '搜索\'' +
                searchKeyword +
                '\'\u7684结果（' +
                searchResults.filter((item) => !item.isAttraction).length +
                '家餐厅）'
            "
            type="info"
            :closable="false"
            show-icon
          />
          <div style="margin-top: 8px">
            <el-button size="small"
@click="handleClearSearch">
              返回推荐
            </el-button>
          </div>
        </div>

        <div v-if="loadingRestaurants"
class="loading-state">
          <el-skeleton :rows="3"
animated />
        </div>

        <div
          v-else-if="recommendedRestaurants.length === 0 && !apiError"
          class="empty-state"
        >
          <el-empty description="暂无推荐餐厅" />
        </div>

        <div
          v-else-if="apiError && recommendedAttractions.length === 0"
          class="error-state"
        >
          <el-alert
            :title="apiError"
            type="error"
            :closable="false"
            show-icon
          />
        </div>

        <div v-else
class="recommendation-list">
          <div
            v-for="restaurant in isSearchMode
              ? searchResults.filter((item) => !item.isAttraction)
              : recommendedRestaurants"
            :key="restaurant.id"
            class="recommendation-item vertical-layout"
          >
            <div class="recommendation-image">
              <img
                v-if="restaurant.photos && restaurant.photos.length > 0"
                :src="restaurant.photos[0].url"
                :alt="restaurant.name"
                @error="
                  (e) =>
                    (e.target.src =
                      'https://via.placeholder.com/300x200?text=Food')
                "
              />
              <div v-else
class="no-image">
                <el-icon><Food /></el-icon>
              </div>
            </div>
            <div class="recommendation-content">
              <h4 :title="restaurant.name"
class="full-width-name">
                {{ restaurant.name }}
              </h4>
              <div class="recommendation-rating rating-with-number">
                <el-rate
                  :model-value="Number(restaurant.rating)"
                  disabled
                  text-color="#ff9900"
                />
                <span class="rating-value">{{ restaurant.rating }}</span>
              </div>
              <div class="recommendation-tags">
                <el-tag size="small"
type="danger" class="price-tag">
                  人均￥{{ restaurant.price }}
                </el-tag>
                <el-tag size="small"
type="warning" class="category-tag">
                  餐饮服务
                </el-tag>
                <el-tag size="small"
class="tag-item">
                  {{ restaurant.type }}
                </el-tag>
              </div>

              <!-- 招牌菜信息 -->
              <div class="signature-dishes">
                <p class="signature-title">
                  <el-icon><Star /></el-icon>
                  {{ "推荐" || "Signature:" }}
                </p>
                <div
                  v-if="extractSignatureDishes(restaurant).length > 0"
                  class="dish-tags"
                >
                  <el-tag
                    v-for="(dish, index) in extractSignatureDishes(
                      restaurant,
                    ).slice(0, 3)"
                    :key="index"
                    size="small"
                    effect="plain"
                    type="success"
                    class="dish-tag"
                  >
                    {{ dish }}
                  </el-tag>
                </div>
                <div v-else
class="dish-tags">
                  <el-tag
                    size="small"
                    effect="plain"
                    type="success"
                    class="dish-tag empty-tag"
                  >
                    {{ "无" }}
                  </el-tag>
                </div>
              </div>

              <p class="recommendation-address">
                <el-icon><Location /></el-icon>
                <span class="address-text">{{
                  restaurant.address || "暂无地址信息"
                }}</span>
              </p>

              <!-- 添加到计划按钮 -->
              <div class="add-to-plan">
                <el-button
                  v-if="!isRestaurantSelected(restaurant)"
                  type="danger"
                  size="small"
                  plain
                  @click="addRestaurantToPlan(restaurant)"
                >
                  <el-icon><Plus /></el-icon>
                  添加到计划
                </el-button>
                <el-button
                  v-else
                  type="danger"
                  size="small"
                  @click="removeRestaurantFromPlan(restaurant)"
                >
                  <el-icon><Check /></el-icon>
                  已添加
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="recommendedRestaurants.length > 0 && !isSearchMode"
          class="view-more-container"
        >
          <el-button
            type="primary"
            plain
            size="small"
            @click="loadMoreRestaurants"
          >
            <el-icon><More /></el-icon>
            查看更多餐厅
          </el-button>
        </div>
      </div>
    </div>
    <!-- 表单区域 -->
    <div class="form-sections">
      <!-- 选择摘要区域 -->
      <div
        v-if="selectedAttractions.length > 0 || selectedRestaurants.length > 0"
        class="form-section"
      >
        <div class="section-title">
          <el-icon><Check /></el-icon>
          <span>已选择</span>
          <el-tag size="small"
type="primary">
            {{ selectedAttractions.length + selectedRestaurants.length }}
          </el-tag>
        </div>

        <div class="selection-summary">
          <el-card class="summary-card"
shadow="hover">
            <div class="selected-items">
              <!-- 已选择的景点 -->
              <div
                v-if="selectedAttractions.length > 0"
                class="selected-section"
              >
                <div class="section-header">
                  <el-icon class="section-icon"
color="#409EFF">
                    <Location />
                    />
                  </el-icon>
                  <h4 class="section-title">
                    必去景点 ({{ selectedAttractions.length }})
                  </h4>
                </div>
                <div class="selected-list">
                  <el-tag
                    v-for="attraction in selectedAttractions"
                    :key="attraction.id"
                    type="primary"
                    closable
                    size="large"
                    class="selection-tag"
                    @close="removeAttractionFromPlan(attraction)"
                  >
                    <div class="tag-content">
                      <span class="tag-name">{{ attraction.name }}</span>
                      <span class="tag-rating">
                        <el-icon><Star /></el-icon>
                        {{ attraction.rating }}
                      </span>
                    </div>
                  </el-tag>
                </div>
              </div>

              <!-- 已选择的餐厅 -->
              <div
                v-if="selectedRestaurants.length > 0"
                class="selected-section"
              >
                <div class="section-header">
                  <el-icon class="section-icon"
color="#E6A23C">
                    <Food />
                    />
                  </el-icon>
                  <h4 class="section-title">
                    必去餐厅 ({{ selectedRestaurants.length }})
                  </h4>
                </div>
                <div class="selected-list">
                  <el-tag
                    v-for="restaurant in selectedRestaurants"
                    :key="restaurant.id"
                    type="warning"
                    closable
                    size="large"
                    class="selection-tag"
                    @close="removeRestaurantFromPlan(restaurant)"
                  >
                    <div class="tag-content">
                      <span class="tag-name">{{ restaurant.name }}</span>
                      <span class="tag-rating">
                        <el-icon><Star /></el-icon>
                        {{ restaurant.rating }}
                      </span>
                    </div>
                  </el-tag>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="summary-actions">
                <el-button type="danger"
link @click="clearAllSelections">
                  重置
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </div>
      <!-- 个性化偏好设置 -->
      <div class="form-section">
        <div class="section-title">
          <el-icon><MagicStick /></el-icon>
          <span>个人偏好</span>
          <div
            v-if="userPreferences && Object.keys(userPreferences).length > 0"
            class="section-subtitle"
          >
            <el-icon><Star /></el-icon>
            <span> 已为您智能预填推荐选项 </span>
          </div>
        </div>

        <el-form
          :model="localPreferenceForm"
          class="trip-preferences-form"
          label-position="top"
        >
          <!-- 行程目标 -->
          <div class="preference-group">
            <div class="group-header">
              <div class="group-icon">
                <el-icon><Trophy /></el-icon>
              </div>
              <div class="group-info">
                <h4 class="group-title">
本次行程偏好
</h4>
                <p class="group-desc">
请在“个性化偏好”步骤中设置本次行程偏好
</p>
              </div>
            </div>
            <div class="option-cards">
              <div
                v-for="goal in tripGoalOptions"
                :key="goal.value"
                class="option-card"
                :class="{
                  active: localPreferenceForm.tripGoals.includes(goal.value),
                }"
                @click="toggleTripGoal(goal.value)"
              >
                <div class="option-content">
                  <span class="option-label">{{ goal.label }}</span>
                </div>
                <div
                  v-if="localPreferenceForm.tripGoals.includes(goal.value)"
                  class="option-check"
                >
                  <el-icon><Check /></el-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- 行程节奏偏好 -->
          <div class="preference-group">
            <div class="group-header">
              <div class="group-icon">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="group-info">
                <h4 class="group-title">
行程节奏偏好
</h4>
                <p class="group-desc">
选择符合您这次旅行的时间安排和体验深度
</p>
              </div>
            </div>
            <div class="pace-cards">
              <div
                v-for="pace in paceOptions"
                :key="pace.value"
                class="pace-card"
                :class="{
                  active: localPreferenceForm.pacePreference === pace.value,
                }"
                @click="localPreferenceForm.pacePreference = pace.value"
              >
                <div class="pace-icon">
                  {{ pace.icon }}
                </div>
                <div class="pace-content">
                  <div class="pace-title">
                    {{ pace.title }}
                  </div>
                  <div class="pace-desc">
                    {{ pace.desc }}
                  </div>
                </div>
                <div
                  v-if="localPreferenceForm.pacePreference === pace.value"
                  class="pace-check"
                >
                  <el-icon><Check /></el-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- 重点体验 -->
          <div class="preference-group">
            <div class="group-header">
              <div class="group-icon">
                <el-icon><Star /></el-icon>
              </div>
              <div class="group-info">
                <h4 class="group-title">
特殊体验
</h4>
                <p class="group-desc">
                  选择本次行程最想体验的内容（最多5项）
                  <span
                    v-if="recommendedFocusAreas.length > 0"
                    class="smart-tip"
                  >
                    <el-icon><Star /></el-icon>
                    已为您推荐 {{ recommendedFocusAreas.length }} 项体验重点
                  </span>
                </p>
              </div>
            </div>
            <div class="experience-tags">
              <div
                v-for="option in allExperienceOptions"
                :key="option.value"
                class="experience-tag"
                :class="{
                  active: localPreferenceForm.focusAreas.includes(option.value),
                  recommended: isRecommendedFocusArea(option.value),
                  disabled:
                    !localPreferenceForm.focusAreas.includes(option.value) &&
                    localPreferenceForm.focusAreas.length >= 5,
                }"
                @click="toggleFocusArea(option.value)"
              >
                <span class="tag-label">{{ option.label }}</span>
                <el-icon
                  v-if="isRecommendedFocusArea(option.value)"
                  class="recommend-star"
                >
                  <Star />
                </el-icon>
                <el-icon
                  v-if="localPreferenceForm.focusAreas.includes(option.value)"
                  class="tag-check"
                >
                  <Check />
                </el-icon>
              </div>
            </div>
            <div class="selection-counter">
              已选择
              {{ localPreferenceForm.focusAreas.length }}/5
            </div>
          </div>

          <!-- 社交环境偏好 -->
          <div class="preference-group">
            <div class="group-header">
              <div class="group-icon">
                <el-icon><UserFilled /></el-icon>
              </div>
              <div class="group-info">
                <h4 class="group-title">
社交环境偏好
</h4>
                <p class="group-desc">
选择您更喜欢的旅行环境和氛围
</p>
              </div>
            </div>
            <div class="social-cards">
              <div
                class="social-card"
                :class="{
                  active: localPreferenceForm.socialPreference === 'lively',
                }"
                @click="localPreferenceForm.socialPreference = 'lively'"
              >
                <div class="social-emoji">🎉</div>
                <div class="social-content">
                  <div class="social-title">热闹有趣</div>
                  <div class="social-desc">人气餐厅、热门景点</div>
                </div>
              </div>
              <div
                class="social-card"
                :class="{
                  active: localPreferenceForm.socialPreference === 'quiet',
                }"
                @click="localPreferenceForm.socialPreference = 'quiet'"
              >
                <div class="social-emoji">🌸</div>
                <div class="social-content">
                  <div class="social-title">安静私密</div>
                  <div class="social-desc">小众场所、人少景点</div>
                </div>
              </div>
              <div
                class="social-card"
                :class="{
                  active: localPreferenceForm.socialPreference === 'mixed',
                }"
                @click="localPreferenceForm.socialPreference = 'mixed'"
              >
                <div class="social-emoji">⚖️</div>
                <div class="social-content">
                  <div class="social-title">灵活搭配</div>
                  <div class="social-desc">热门与小众结合</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 拍照打卡需求 -->
          <div class="preference-group">
            <div class="group-header">
              <div class="group-icon">
                <el-icon><Camera /></el-icon>
              </div>
              <div class="group-info">
                <h4 class="group-title">
拍照打卡需求
</h4>
                <p class="group-desc">
告诉我们您对拍照和分享的重视程度
</p>
              </div>
            </div>
            <div class="photo-cards">
              <div
                class="photo-card"
                :class="{
                  active: localPreferenceForm.photoPreference === 'essential',
                }"
                @click="localPreferenceForm.photoPreference = 'essential'"
              >
                <div class="photo-emoji">📸</div>
                <div class="photo-content">
                  <div class="photo-title">
必须有
</div>
                  <div class="photo-desc">
网红打卡点优先
</div>
                </div>
              </div>
              <div
                class="photo-card"
                :class="{
                  active: localPreferenceForm.photoPreference === 'casual',
                }"
                @click="localPreferenceForm.photoPreference = 'casual'"
              >
                <div class="photo-emoji">🌅</div>
                <div class="photo-content">
                  <div class="photo-title">
随性拍拍
</div>
                  <div class="photo-desc">
自然美景即可
</div>
                </div>
              </div>
              <div
                class="photo-card"
                :class="{
                  active: localPreferenceForm.photoPreference === 'minimal',
                }"
                @click="localPreferenceForm.photoPreference = 'minimal'"
              >
                <div class="photo-emoji">👁️</div>
                <div class="photo-content">
                  <div class="photo-title">
不太在意
</div>
                  <div class="photo-desc">
体验优先
</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 饮食禁忌 -->
          <div class="preference-group important-group">
            <div class="group-header">
              <div class="group-icon important">
                <el-icon><KnifeFork /></el-icon>
              </div>
              <div class="group-info">
                <h4 class="group-title">
                  饮食禁忌
                  <el-tag type="danger"
size="small"
>
警告
</el-tag>
                </h4>
                <p class="group-desc">
                  请告知我们您的饮食限制，确保为您推荐合适的餐厅
                </p>
              </div>
            </div>
            <div class="dietary-tags">
              <div
                v-for="restriction in dietaryOptions"
                :key="restriction.value"
                class="dietary-tag"
                :class="{
                  active: localPreferenceForm.dietaryRestrictions.includes(
                    restriction.value,
                  ),
                }"
                @click="toggleDietaryRestriction(restriction.value)"
              >
                <span class="dietary-label">{{ restriction.label }}</span>
                <el-icon
                  v-if="
                    localPreferenceForm.dietaryRestrictions.includes(
                      restriction.value,
                    )
                  "
                  class="dietary-check"
                >
                  <Check />
                </el-icon>
              </div>
            </div>

            <div class="custom-dietary">
              <h5 class="custom-title">
                <el-icon><Edit /></el-icon>特殊请求
              </h5>
              <el-input
                v-model="localPreferenceForm.customDietaryNotes"
                type="textarea"
                :rows="2"
                :placeholder="'请输入其他饮食禁忌或特殊需求，如宗教禁忌、过敏原等'"
                class="custom-input"
              />
            </div>
          </div>

          <!-- 特殊需求 -->
          <div class="preference-group">
            <div class="group-header">
              <div class="group-icon">
                <el-icon><Setting /></el-icon>
              </div>
              <div class="group-info">
                <h4 class="group-title">
特殊请求
</h4>
                <p class="group-desc">
告诉我们任何需要特别考虑的情况
</p>
              </div>
            </div>
            <el-input
              v-model="localPreferenceForm.specialRequirements"
              type="textarea"
              :rows="3"
              :placeholder="'如：行动不便、带小孩、带宠物、无障碍设施需求等'"
              class="special-input"
            />
          </div>
        </el-form>
      </div>

      <!-- 操作按钮区域 -->
      <div class="action-section">
        <div class="action-left">
          <el-button size="large"
@click="$emit('prev-step')">
            <el-icon><ArrowLeft /></el-icon>
            上一步
          </el-button>
        </div>
        <div class="action-center">
          <el-button
            size="large"
            type="info"
            plain
            :loading="savingDraft"
            @click="$emit('save-draft')"
          >
            <el-icon><Document /></el-icon>
            保存草稿
          </el-button>
        </div>
        <div class="action-right">
          <el-button type="primary"
size="large" @click="$emit('next-step')">
            下一步
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Location,
  Food,
  More,
  MagicStick,
  Edit,
  Setting,
  Check,
  Star,
  Plus,
  ArrowLeft,
  ArrowRight,
  KnifeFork,
  Search,
  Trophy,
  Timer,
  UserFilled,
  Camera,
  Document,
} from "@element-plus/icons-vue";
import {
  getRecommendedAttractions,
  getRecommendedRestaurants,
  searchPlaces,
} from "@/api/amap.js";
import { translateTag } from "@/utils/tagMapping.js";
import { dataCache } from "@/utils/dataCache.js";
import { usePreferenceStore } from "@/store/preference.js";
import { useUserStore } from "@/store/user.js";
export default {
  name: "TripPreferences",
  components: {
    Location,
    Food,
    More,
    MagicStick,
    Edit,
    Setting,
    Check,
    Star,
    Plus,
    ArrowLeft,
    ArrowRight,
    KnifeFork,
    Search,
    Trophy,
    Timer,
    UserFilled,
    Camera,
    Document,
  },
  props: {
    // 从父组件接收的表单数据
    baseForm: {
      type: Object,
      required: true,
    },
    // 用户偏好
    userPreferences: {
      type: Object,
      default: () => ({}),
    },
    // 偏好表单
    preferenceForm: {
      type: Object,
      required: true,
    },
    // 已选择的景点
    selectedAttractions: {
      type: Array,
      default: () => [],
    },
    // 已选择的餐厅
    selectedRestaurants: {
      type: Array,
      default: () => [],
    },
    // 是否来自草稿
    isFromDraft: {
      type: Boolean,
      default: false,
    },
    // 保存草稿状态
    savingDraft: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    "update:preferenceForm",
    "update:selectedAttractions",
    "update:selectedRestaurants",
    "prev-step",
    "next-step",
    "save-draft",
  ],
  setup(props, { emit }) {
    // 使用统一的偏好管理store
    const preferenceStore = usePreferenceStore();
    const userStore = useUserStore();

    // 计算属性：直接从store获取偏好表单数据
    const localPreferenceForm = computed({
      get: () => preferenceStore.tripPreferenceForm,
      set: (value) => preferenceStore.updateTripPreferences(value),
    });

    // 初始化偏好设置（替代原来的applyUserPreferences）
    const initializePreferences = () => {
      if (props.isFromDraft) {
        console.log("🔒 检测到草稿状态，跳过用户偏好初始化");
        return;
      }

      console.log("🔄 初始化偏好设置，使用preferenceStore");
      preferenceStore.initializeTripPreferences();
    };

    // 监听store中偏好表单的变化，同步到父组件
    watch(
      () => preferenceStore.tripPreferenceForm,
      (newVal) => {
        emit("update:preferenceForm", newVal);
      },
      { deep: true, immediate: true },
    );

    // 监听props.preferenceForm的变化，同步到store
    watch(
      () => props.preferenceForm,
      (newVal, oldVal) => {
        console.log("🔄 TripPreferences watch触发，props变化检测:", {
          newVal,
          oldVal,
          isFromDraft: props.isFromDraft,
          hasNewVal: !!newVal,
          hasOldVal: !!oldVal,
        });

        if (newVal && typeof newVal === "object") {
          // 检查是否真的有数据变化，避免无意义的更新
          const hasRealChange =
            JSON.stringify(newVal) !== JSON.stringify(oldVal);
          const isInitialLoad = !oldVal || Object.keys(oldVal).length === 0;

          console.log("🔍 数据变化分析:", {
            hasRealChange,
            isInitialLoad,
            isFromDraft: props.isFromDraft,
            newValKeys: Object.keys(newVal),
            oldValKeys: oldVal ? Object.keys(oldVal) : [],
          });

          if (hasRealChange || isInitialLoad) {
            console.log(
              "🔄 TripPreferences接收到preferenceForm数据变化，同步到store",
            );

            if (props.isFromDraft) {
              // 如果是从草稿加载，使用store的草稿加载方法
              console.log("🔒 从草稿加载偏好数据到store");
              preferenceStore.loadDraftPreferences(newVal);
            } else {
              // 否则直接更新store中的偏好表单
              console.log("📋 更新store中的偏好表单数据");
              preferenceStore.updateTripPreferences(newVal);
            }
          } else {
            console.log("🔄 数据无变化，跳过更新");
          }
        } else if (newVal === null || newVal === undefined) {
          // 如果传入空值，重置store
          console.log("🔄 接收到空的preferenceForm，重置store");
          preferenceStore.resetPreferences();
        }
      },
      { deep: true, immediate: true },
    );

    // 城市信息相关状态
    const cityInfo = ref(null);
    const loadingCityInfo = ref(false);

    // 推荐景点和餐厅
    const recommendedAttractions = ref([]);
    const recommendedRestaurants = ref([]);
    const loadingAttractions = ref(false);
    const loadingRestaurants = ref(false);
    const apiError = ref(null);
    const RisShow = ref(false);
    const SisShow = ref(true);

    // 搜索相关状态
    const searchKeyword = ref("");
    const sortBy = ref("default");
    const searching = ref(false);
    const searchResults = ref([]);
    const isSearchMode = ref(false);

    // 分页状态
    const attractionsPage = ref(1);
    const restaurantsPage = ref(1);
    const attractionsPageSize = 8;
    const restaurantsPageSize = 8;
    const loadingMoreAttractions = ref(false);
    const loadingMoreRestaurants = ref(false);
    const noMoreAttractions = ref(false);
    const noMoreRestaurants = ref(false);

    // 行程目标选项
    const tripGoalOptions = [
      { value: "celebration", label: "庆祝节日/生日" },
      { value: "business", label: "商务出差顺便游玩" },
      { value: "family", label: "家庭亲子游" },
      { value: "romantic", label: "情侣蜜月游" },
      { value: "friendship", label: "朋友聚会游" },
      { value: "solo", label: "个人独旅" },
      { value: "learning", label: "学习文化知识" },
      { value: "relaxation", label: "放松减压" },
      { value: "adventure", label: "寻求刺激冒险" },
      { value: "photography", label: "摄影创作" },
    ];

    // 行程节奏选项
    const paceOptions = [
      {
        value: "slow",
        title: "慢节奏",
        desc: "深度体验，充分休息",
        icon: "🐌",
      },
      {
        value: "balanced",
        title: "平衡型",
        desc: "景点与休息并重",
        icon: "⚖️",
      },
      {
        value: "fast",
        title: "紧凑型",
        desc: "多看多玩，充实行程",
        icon: "⚡",
      },
    ];

    // 所有体验选项（合并原来的最想体验和特别体验）
    const allExperienceOptions = [
      { value: "historical_culture", label: "历史文化" },
      { value: "natural_scenery", label: "自然风光" },
      { value: "local_cuisine", label: "地道美食" },
      { value: "photo_spots", label: "网红打卡" },
      { value: "art_culture", label: "文艺体验" },
      { value: "leisure_entertainment", label: "休闲娱乐" },
      { value: "outdoor_adventure", label: "户外探险" },
      { value: "urban_lifestyle", label: "城市风情" },
      { value: "shopping", label: "购物体验" },
      { value: "nightlife", label: "夜生活" },
      { value: "traditional_crafts", label: "传统工艺" },
      { value: "modern_technology", label: "现代科技" },
      { value: "religious_sites", label: "宗教文化" },
      { value: "local_festivals", label: "节庆活动" },
      { value: "wellness", label: "健康养生" },
    ];

    // 饮食禁忌选项
    const dietaryOptions = [
      { value: "halal", label: "清真饮食" },
      { value: "vegetarian", label: "素食" },
      { value: "vegan", label: "纯素食（全素）" },
      { value: "no_pork", label: "不吃猪肉" },
      { value: "no_beef", label: "不吃牛肉" },
      { value: "no_seafood", label: "不吃海鲜" },
      { value: "no_spicy", label: "不吃辣" },
      { value: "gluten_free", label: "无麸质" },
    ];

    // 使用导入的标签映射表
    // tagMapping 已从 tagMapping.js 导入

    // 计算用户偏好标签的中文显示
    const selectedPreferenceTags = computed(() => {
      if (!props.userPreferences) return [];
      const tags = [];

      // 从旅行类型标签中提取并转换为中文
      if (props.userPreferences.selectedTags?.length > 0) {
        props.userPreferences.selectedTags.forEach((tag) => {
          const chineseTag = translateTag(tag);
          tags.push(chineseTag);
        });
      }

      // 从交通偏好中提取中文标签
      if (props.userPreferences.selectedTransports?.length > 0) {
        props.userPreferences.selectedTransports.forEach((transport) => {
          const chineseTag = translateTag(transport);
          if (chineseTag && chineseTag !== transport) {
            tags.push(chineseTag);
          }
        });
      }

      // 从其他偏好中提取标签
      if (props.userPreferences.accommodationType) {
        const chineseTag = translateTag(
          props.userPreferences.accommodationType,
        );
        if (
          chineseTag &&
          chineseTag !== props.userPreferences.accommodationType
        ) {
          tags.push(chineseTag);
        }
      }

      // 从旅行节奏中提取标签
      if (props.userPreferences.travelPace) {
        const chineseTag = translateTag(props.userPreferences.travelPace);
        if (chineseTag && chineseTag !== props.userPreferences.travelPace) {
          tags.push(chineseTag);
        }
      }

      // 从美食偏好中提取标签
      if (props.userPreferences.foodTastes?.length > 0) {
        props.userPreferences.foodTastes.forEach((taste) => {
          const chineseTag = translateTag(taste);
          tags.push(chineseTag);
        });
      }

      return [...new Set(tags)].slice(0, 15);
    });

    // 根据用户偏好推荐体验重点 - 使用store中的映射方法
    const recommendedFocusAreas = computed(() => {
      if (!props.userPreferences?.selectedTags?.length) return [];
      return preferenceStore.mapUserTagsToFocusAreas(
        props.userPreferences.selectedTags,
      );
    });

    // 判断是否为推荐的体验重点
    const isRecommendedFocusArea = (areaValue) => {
      return recommendedFocusAreas.value.includes(areaValue);
    };

    // 加载城市信息和推荐
    const loadCityInfo = async (city) => {
      console.log("加载城市信息和推荐");

      console.log(city);

      if (!city) {
        cityInfo.value = null;
        recommendedAttractions.value = [];
        recommendedRestaurants.value = [];
        return;
      }

      try {
        loadingCityInfo.value = true;
        apiError.value = null;
        console.log("🔍 开始加载城市信息和推荐:", city);
        cityInfo.value = city;

        // 2. 获取推荐景点 - 使用城市名称而不是cityCode
        loadingAttractions.value = true;
        attractionsPage.value = 1; // 重置页码
        noMoreAttractions.value = false;

        // 获取城市的中文名称
        const cityName = city.destinationName;
        console.log("使用城市名称获取推荐:", cityName);

        try {
          console.log("🔄 获取景点数据...");

          // 检查缓存
          const cacheKey = dataCache.generateKey(
            "attractions",
            cityName,
            attractionsPage.value,
          );
          let attractionsResponse = dataCache.get(cacheKey);

          if (!attractionsResponse) {
            console.log("🌐 调用高德API获取景点数据...");
            attractionsResponse = await getRecommendedAttractions(
              cityName,
              attractionsPage.value,
              attractionsPageSize,
            );

            // 缓存响应数据
            if (attractionsResponse && attractionsResponse.pois) {
              dataCache.set(cacheKey, attractionsResponse);
            }
          } else {
            console.log("📦 使用缓存的景点数据");
          }

          console.log("🔄 高德API景点响应:", attractionsResponse);

          if (
            attractionsResponse &&
            attractionsResponse.pois &&
            attractionsResponse.pois.length > 0
          ) {
            console.log(
              "✅ 成功获取景点数据，共",
              attractionsResponse.pois.length,
              "条",
            );
            const attractions = attractionsResponse.pois.map((poi) => ({
              id: poi.id,
              name: poi.name,
              address: poi.address,
              rating: (poi.biz_ext && poi.biz_ext.rating) || "4.5",
              photos: poi.photos || [],
              type: poi.type.split(";")[0] || "景点",
              distance: poi.distance || null,
              tags: extractTags(poi),
              tag: poi.tag, // 保存原始tag字段，用于提取特色标签
              matchScore: 0, // 初始匹配分数
            }));

            // 根据用户偏好计算匹配分数
            calculateAttractionMatchScores(attractions);

            // 按匹配分数排序
            recommendedAttractions.value = sortByRelevance(attractions);

            // 检查是否还有更多数据
            if (
              attractionsResponse.pois.length < attractionsPageSize ||
              !attractionsResponse.count ||
              Number(attractionsResponse.count) <= attractionsPageSize
            ) {
              noMoreAttractions.value = true;
            }
          } else {
            console.log("⚠️ 景点数据为空");
            recommendedAttractions.value = [];
            noMoreAttractions.value = true;
          }
        } catch (error) {
          console.error("❌ 获取推荐景点失败:", error);
          apiError.value = "获取推荐景点失败，请稍后再试";
          recommendedAttractions.value = [];
        } finally {
          loadingAttractions.value = false;
        }

        // 3. 获取推荐餐厅 - 使用城市名称而不是cityCode
        loadingRestaurants.value = true;
        restaurantsPage.value = 1; // 重置页码
        noMoreRestaurants.value = false;

        try {
          console.log("🔄 获取餐厅数据...");

          // 检查缓存
          const restaurantCacheKey = dataCache.generateKey(
            "restaurants",
            cityName,
            restaurantsPage.value,
          );
          let restaurantsResponse = dataCache.get(restaurantCacheKey);

          if (!restaurantsResponse) {
            console.log("🌐 调用高德API获取餐厅数据...");
            restaurantsResponse = await getRecommendedRestaurants(
              cityName,
              restaurantsPage.value,
              restaurantsPageSize,
            );

            // 缓存响应数据
            if (restaurantsResponse && restaurantsResponse.pois) {
              dataCache.set(restaurantCacheKey, restaurantsResponse);
            }
          } else {
            console.log("📦 使用缓存的餐厅数据");
          }

          console.log("🔄 高德API餐厅响应:", restaurantsResponse);

          if (
            restaurantsResponse &&
            restaurantsResponse.pois &&
            restaurantsResponse.pois.length > 0
          ) {
            console.log(
              "✅ 成功获取餐厅数据，共",
              restaurantsResponse.pois.length,
              "条",
            );
            const restaurants = restaurantsResponse.pois.map((poi) => ({
              id: poi.id,
              name: poi.name,
              address: poi.address,
              rating: (poi.biz_ext && poi.biz_ext.rating) || "4.5",
              photos: poi.photos || [],
              type: poi.type.split(";")[0] || "餐厅",
              price: (poi.biz_ext && poi.biz_ext.cost) || "¥¥",
              tags: extractTags(poi),
              tag: poi.tag, // 保存原始tag字段，用于提取招牌菜
              matchScore: 0, // 初始匹配分数
            }));

            // 根据用户偏好计算匹配分数
            calculateRestaurantMatchScores(restaurants);

            // 按匹配分数排序
            recommendedRestaurants.value = sortByRelevance(restaurants);

            // 检查是否还有更多数据
            if (
              restaurantsResponse.pois.length < restaurantsPageSize ||
              !restaurantsResponse.count ||
              Number(restaurantsResponse.count) <= restaurantsPageSize
            ) {
              noMoreRestaurants.value = true;
            }
          } else {
            console.log("⚠️ 餐厅数据为空");
            recommendedRestaurants.value = [];
            noMoreRestaurants.value = true;
          }
        } catch (error) {
          console.error("❌ 获取推荐餐厅失败:", error);
          if (!apiError.value) {
            apiError.value = "获取推荐餐厅失败，请稍后再试";
          }
          recommendedRestaurants.value = [];
        } finally {
          loadingRestaurants.value = false;
        }
      } catch (error) {
        console.error("❌ 加载城市信息失败:", error);
        cityInfo.value = null;
        apiError.value = "加载城市信息失败，请稍后再试";
      } finally {
        loadingCityInfo.value = false;
      }
    };

    // 从POI数据中提取标签
    const extractTags = (poi) => {
      const tags = [];

      // 从类型中提取标签
      if (poi.type && typeof poi.type === "string") {
        const typeTokens = poi.type.split(";");
        tags.push(...typeTokens);
      }

      // 从高德API的tag字段提取标签（这是最重要的标签来源）
      if (poi.tag && typeof poi.tag === "string") {
        const tagTokens = poi.tag.split(",");
        tags.push(...tagTokens);
      }

      // 从商户类型提取标签
      if (poi.biz_type && typeof poi.biz_type === "string") {
        tags.push(poi.biz_type);
      }

      return [...new Set(tags)]; // 去重
    };

    // 根据评分计算景点排序分数（简化版）
    const calculateAttractionMatchScores = (attractions) => {
      attractions.forEach((attraction) => {
        // 只使用评分作为排序依据
        const rating = parseFloat(attraction.rating || "0");
        attraction.matchScore = rating * 10; // 将评分转换为0-100分制
      });
    };

    // 根据评分计算餐厅排序分数（简化版）
    const calculateRestaurantMatchScores = (restaurants) => {
      restaurants.forEach((restaurant) => {
        // 只使用评分作为排序依据
        const rating = parseFloat(restaurant.rating || "0");
        restaurant.matchScore = rating * 10; // 将评分转换为0-100分制
      });
    };

    // 按相关性排序
    const sortByRelevance = (items) => {
      return [...items].sort((a, b) => {
        // 首先按匹配分数排序
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }
        // 其次按评分排序
        return parseFloat(b.rating) - parseFloat(a.rating);
      });
    };

    // 从景点POI数据中提取标签
    const extractAttractionTags = (attraction) => {
      if (
        !attraction ||
        !attraction.tag ||
        typeof attraction.tag !== "string"
      ) {
        return [];
      }

      const tags = [];
      const tagContent = attraction.tag;

      // 常见的分隔符
      const separators = [",", "，", "、", ";", "；", "|"];

      // 尝试用不同分隔符分割
      let tagTokens = [tagContent];
      for (const separator of separators) {
        if (tagContent.includes(separator)) {
          tagTokens = tagContent.split(separator);
          break;
        }
      }

      // 景点特色关键词
      const featureKeywords = [
        "文化",
        "历史",
        "古迹",
        "自然",
        "风景",
        "公园",
        "博物馆",
        "寺庙",
        "古建筑",
        "休闲",
        "娱乐",
        "购物",
        "美食",
        "艺术",
        "科技",
        "亲子",
        "户外",
        "登山",
        "湖泊",
        "森林",
        "海滩",
        "名胜",
        "地标",
        "观光",
        "游览",
        "热门",
        "网红",
      ];

      // 检查每个标签是否为景点特色
      tagTokens.forEach((token) => {
        const trimmedToken = token.trim();
        if (trimmedToken.length > 1) {
          // 检查是否包含特色关键词
          const isFeature = featureKeywords.some((keyword) =>
            trimmedToken.includes(keyword),
          );

          // 排除一些明显不是特色的标签
          const notFeature = [
            "停车",
            "位置",
            "交通",
            "商圈",
            "商场",
            "广场",
            "服务",
            "环境",
          ].some((keyword) => trimmedToken.includes(keyword));

          if (isFeature && !notFeature) {
            tags.push(trimmedToken);
          } else if (trimmedToken.length <= 6 && !notFeature) {
            // 短标签可能是特色，也加入
            tags.push(trimmedToken);
          }
        }
      });

      return tags;
    };

    // 从餐厅POI数据中提取招牌菜信息
    const extractSignatureDishes = (restaurant) => {
      if (
        !restaurant ||
        !restaurant.tag ||
        typeof restaurant.tag !== "string"
      ) {
        return [];
      }

      const dishes = [];
      const tagContent = restaurant.tag;

      // 常见的分隔符
      const separators = [",", "，", "、", ";", "；", "|"];

      // 尝试用不同分隔符分割
      let tagTokens = [tagContent];
      for (const separator of separators) {
        if (tagContent.includes(separator)) {
          tagTokens = tagContent.split(separator);
          break;
        }
      }

      // 过滤出可能的菜品名称
      const dishKeywords = [
        "招牌",
        "特色",
        "推荐",
        "必点",
        "名菜",
        "人气",
        "菜",
        "饭",
        "面",
        "粉",
        "汤",
        "锅",
        "煲",
        "炒",
        "烤",
        "蒸",
        "炖",
        "煮",
        "焖",
        "烧",
        "卤",
        "鱼",
        "虾",
        "蟹",
        "牛",
        "羊",
        "猪",
        "鸡",
        "鸭",
        "鹅",
      ];

      // 检查每个标签是否可能是菜品
      tagTokens.forEach((token) => {
        const trimmedToken = token.trim();
        if (trimmedToken.length > 1) {
          // 检查是否包含菜品关键词
          const isDish = dishKeywords.some((keyword) =>
            trimmedToken.includes(keyword),
          );

          // 排除一些明显不是菜品的标签
          const notDish = [
            "餐饮",
            "服务",
            "环境",
            "价格",
            "停车",
            "位置",
            "交通",
            "商圈",
            "商场",
            "广场",
          ].some((keyword) => trimmedToken.includes(keyword));

          if (isDish && !notDish) {
            dishes.push(trimmedToken);
          }
        }
      });

      return dishes;
    };

    // 加载更多景点数据
    const loadMoreAttractions = async () => {
      try {
        loadingMoreAttractions.value = true;

        // 使用城市名称而不是cityCode
        const cityName = props.baseForm.destinationName;
        console.log("加载更多景点，城市名称:", cityName);

        // 增加页码
        attractionsPage.value += 1;

        // 检查缓存
        const cacheKey = dataCache.generateKey(
          "attractions",
          cityName,
          attractionsPage.value,
        );
        let response = dataCache.get(cacheKey);

        if (!response) {
          console.log("🌐 调用API加载更多景点...");
          response = await getRecommendedAttractions(
            cityName,
            attractionsPage.value,
            attractionsPageSize,
          );

          // 缓存响应数据
          if (response && response.pois) {
            dataCache.set(cacheKey, response);
          }
        } else {
          console.log("📦 使用缓存加载更多景点");
        }

        console.log("加载更多景点响应:", response);

        if (response && response.pois && response.pois.length > 0) {
          const newAttractions = response.pois.map((poi) => ({
            id: poi.id,
            name: poi.name,
            address: poi.address,
            rating: (poi.biz_ext && poi.biz_ext.rating) || "4.5",
            photos: poi.photos || [],
            type: poi.type.split(";")[0] || "景点",
            distance: poi.distance || null,
            tags: extractTags(poi),
            tag: poi.tag, // 保存原始tag字段，用于提取特色标签
            matchScore: 0, // 初始匹配分数
          }));

          // 根据用户偏好计算匹配分数
          calculateAttractionMatchScores(newAttractions);

          // 添加新景点到现有列表
          recommendedAttractions.value = [
            ...recommendedAttractions.value,
            ...newAttractions,
          ];

          ElMessage.success(`已加载${newAttractions.length}个新推荐景点`);

          // 检查是否还有更多数据
          if (
            response.pois.length < attractionsPageSize ||
            !response.count ||
            Number(response.count) <=
              attractionsPageSize * attractionsPage.value
          ) {
            noMoreAttractions.value = true;
            ElMessage.info("已加载全部推荐景点");
          }
        } else {
          noMoreAttractions.value = true;
          ElMessage.info("没有更多推荐景点了");
        }
      } catch (error) {
        console.error("❌ 加载更多景点失败:", error);
        ElMessage.error("加载推荐景点失败，请稍后再试");
      } finally {
        loadingMoreAttractions.value = false;
      }
    };

    // 搜索功能
    const handleSearch = async () => {
      if (!searchKeyword.value.trim()) {
        ElMessage.warning("请输入搜索关键词");
        return;
      }

      if (!cityInfo.value?.destinationName) {
        ElMessage.warning("目的地");
        return;
      }

      try {
        searching.value = true;
        isSearchMode.value = true;
        apiError.value = null;

        const searchParams = {
          keywords: searchKeyword.value.trim(),
          city: cityInfo.value.destinationName,
          offset: 20, // 搜索时返回更多结果
          page: 1,
        };

        // 根据当前标签页自动添加类型过滤
        if (SisShow.value) {
          searchParams.types = "110000"; // 风景名胜
        } else if (RisShow.value) {
          searchParams.types = "050000"; // 餐饮服务
        }

        console.log("🔍 开始搜索:", searchParams);
        const response = await searchPlaces(searchParams);

        if (response && response.pois && response.pois.length > 0) {
          console.log("✅ 搜索成功，找到", response.pois.length, "个结果");

          // 处理搜索结果
          const results = response.pois.map((poi) => {
            const isAttraction = poi.type && poi.type.includes("风景名胜");
            return {
              id: poi.id,
              name: poi.name,
              address: poi.address,
              rating: (poi.biz_ext && poi.biz_ext.rating) || "4.5",
              photos: poi.photos || [],
              type: poi.type.split(";")[0] || (isAttraction ? "景点" : "餐厅"),
              price: (poi.biz_ext && poi.biz_ext.cost) || "¥¥",
              distance: poi.distance || null,
              tags: extractTags(poi),
              tag: poi.tag,
              matchScore: 0,
              isAttraction: isAttraction,
            };
          });

          // 根据排序方式排序
          const sortedResults = sortSearchResults(results, sortBy.value);
          searchResults.value = sortedResults;

          ElMessage.success(`找到 ${results.length} 个搜索结果`);
        } else {
          searchResults.value = [];
          ElMessage.info("未找到相关结果，请尝试其他关键词");
        }
      } catch (error) {
        console.error("❌ 搜索失败:", error);
        apiError.value = "操作失败";
        searchResults.value = [];
        ElMessage.error("操作失败");
      } finally {
        searching.value = false;
      }
    };

    // 清除搜索
    const handleClearSearch = () => {
      searchKeyword.value = "";
      searchResults.value = [];
      isSearchMode.value = false;
      apiError.value = null;
    };

    // 排序搜索结果
    const sortSearchResults = (results, sortType) => {
      const sorted = [...results];

      switch (sortType) {
        case "rating":
          return sorted.sort(
            (a, b) => parseFloat(b.rating) - parseFloat(a.rating),
          );
        case "distance":
          return sorted.sort((a, b) => {
            const distA = parseFloat(a.distance) || Infinity;
            const distB = parseFloat(b.distance) || Infinity;
            return distA - distB;
          });
        default:
          return sorted;
      }
    };

    // 加载更多餐厅数据
    const loadMoreRestaurants = async () => {
      try {
        loadingMoreRestaurants.value = true;

        // 使用城市名称而不是cityCode
        const cityName = props.baseForm.destinationName;
        console.log("加载更餐厅，城市名称:", cityName);
        // 增加页码
        restaurantsPage.value += 1;

        // 检查缓存
        const cacheKey = dataCache.generateKey(
          "restaurants",
          cityName,
          restaurantsPage.value,
        );
        let response = dataCache.get(cacheKey);

        if (!response) {
          console.log("🌐 调用API加载更多餐厅...");
          response = await getRecommendedRestaurants(
            cityName,
            restaurantsPage.value,
            restaurantsPageSize,
          );

          // 缓存响应数据
          if (response && response.pois) {
            dataCache.set(cacheKey, response);
          }
        } else {
          console.log("📦 使用缓存加载更多餐厅");
        }

        console.log("加载更多餐厅响应:", response);

        if (response && response.pois && response.pois.length > 0) {
          const newRestaurants = response.pois.map((poi) => ({
            id: poi.id,
            name: poi.name,
            address: poi.address,
            rating: (poi.biz_ext && poi.biz_ext.rating) || "4.5",
            photos: poi.photos || [],
            type: poi.type.split(";")[0] || "餐厅",
            price: (poi.biz_ext && poi.biz_ext.cost) || "¥¥",
            tags: extractTags(poi),
            tag: poi.tag, // 保存原始tag字段，用于提取招牌菜
            matchScore: 0, // 初始匹配分数
          }));

          // 根据用户偏好计算匹配分数
          calculateRestaurantMatchScores(newRestaurants);

          // 添加新餐厅到现有列表
          recommendedRestaurants.value = [
            ...recommendedRestaurants.value,
            ...newRestaurants,
          ];

          ElMessage.success(`已加载${newRestaurants.length}个新推荐餐厅`);

          // 检查是否还有更多数据
          if (
            response.pois.length < restaurantsPageSize ||
            !response.count ||
            Number(response.count) <=
              restaurantsPageSize * restaurantsPage.value
          ) {
            noMoreRestaurants.value = true;
            ElMessage.info("已加载全部推荐餐厅");
          }
        } else {
          noMoreRestaurants.value = true;
          ElMessage.info("没有更多推荐餐厅了");
        }
      } catch (error) {
        console.error("❌ 加载更多餐厅失败:", error);
        ElMessage.error("加载推荐餐厅失败，请稍后再试");
      } finally {
        loadingMoreRestaurants.value = false;
      }
    };

    // 景点和餐厅选择相关方法
    const isAttractionSelected = (attraction) => {
      return props.selectedAttractions.some((a) => a.id === attraction.id);
    };

    const addAttractionToPlan = (attraction) => {
      if (!isAttractionSelected(attraction)) {
        const updatedAttractions = [...props.selectedAttractions, attraction];
        emit("update:selectedAttractions", updatedAttractions);
        ElMessage.success("操作成功");
      }
    };

    const removeAttractionFromPlan = (attraction) => {
      const index = props.selectedAttractions.findIndex(
        (a) => a.id === attraction.id,
      );
      if (index !== -1) {
        const updatedAttractions = [...props.selectedAttractions];
        updatedAttractions.splice(index, 1);
        emit("update:selectedAttractions", updatedAttractions);
        ElMessage.info("删除成功");
      }
    };

    const isRestaurantSelected = (restaurant) => {
      return props.selectedRestaurants.some((r) => r.id === restaurant.id);
    };

    const addRestaurantToPlan = (restaurant) => {
      if (!isRestaurantSelected(restaurant)) {
        const updatedRestaurants = [...props.selectedRestaurants, restaurant];
        emit("update:selectedRestaurants", updatedRestaurants);
        ElMessage.success("操作成功");
      }
    };

    const removeRestaurantFromPlan = (restaurant) => {
      const index = props.selectedRestaurants.findIndex(
        (r) => r.id === restaurant.id,
      );
      if (index !== -1) {
        const updatedRestaurants = [...props.selectedRestaurants];
        updatedRestaurants.splice(index, 1);
        emit("update:selectedRestaurants", updatedRestaurants);
        ElMessage.info("删除成功");
      }
    };

    // 清空所有选择
    const clearAllSelections = async () => {
      try {
        await ElMessageBox.confirm(
          `确定要清空所有选择吗？共 ${props.selectedAttractions.length} 个景点和 ${props.selectedRestaurants.length} 家餐厅。`,
          "警告",
          {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            type: "warning",
          },
        );

        emit("update:selectedAttractions", []);
        emit("update:selectedRestaurants", []);
        ElMessage.success("操作成功");
      } catch {
        // 用户取消
      }
    };

    // 监听目的地变化，加载城市信息
    watch(
      () => props.baseForm.destinationCity,
      (newDestination) => {
        if (newDestination) {
          loadCityInfo(newDestination);
        }
      },
      { immediate: true },
    );

    // 应用智能推荐（简化版本，主要逻辑由store处理）
    const applySmartRecommendations = () => {
      if (props.isFromDraft) {
        console.log("🔒 检测到草稿状态，跳过智能推荐，保留草稿设置");
        return;
      }

      console.log("🤖 使用store应用智能推荐...");
      // store的初始化方法已经包含了智能推荐逻辑
    };

    // 切换行程目标选择
    const toggleTripGoal = (goalValue) => {
      const goals = [...preferenceStore.tripPreferenceForm.tripGoals];
      const index = goals.indexOf(goalValue);
      if (index > -1) {
        goals.splice(index, 1);
      } else {
        goals.push(goalValue);
      }
      preferenceStore.updateTripPreference("tripGoals", goals);
    };

    // 切换体验重点选择
    const toggleFocusArea = (areaValue) => {
      const areas = [...preferenceStore.tripPreferenceForm.focusAreas];
      const index = areas.indexOf(areaValue);
      if (index > -1) {
        areas.splice(index, 1);
      } else if (areas.length < 5) {
        areas.push(areaValue);
      }
      preferenceStore.updateTripPreference("focusAreas", areas);
    };

    // 切换饮食禁忌选择
    const toggleDietaryRestriction = (restrictionValue) => {
      const restrictions = [
        ...preferenceStore.tripPreferenceForm.dietaryRestrictions,
      ];
      const index = restrictions.indexOf(restrictionValue);
      if (index > -1) {
        restrictions.splice(index, 1);
      } else {
        restrictions.push(restrictionValue);
      }
      preferenceStore.updateTripPreference("dietaryRestrictions", restrictions);
    };

    // 监听用户偏好变化，动态应用默认值
    watch(
      () => props.userPreferences,
      (newPreferences) => {
        // 如果是草稿状态，跳过用户偏好应用
        if (props.isFromDraft) {
          console.log("🔒 草稿状态中，跳过用户偏好变化处理");
          return;
        }

        if (newPreferences && Object.keys(newPreferences).length > 0) {
          console.log(
            "🔄 检测到用户偏好数据变化，重新应用默认值:",
            newPreferences,
          );
          initializePreferences();
        }
      },
      { deep: true, immediate: false },
    );

    // 组件加载时初始化
    onMounted(() => {
      // 根据状态初始化偏好设置
      if (!props.isFromDraft) {
        console.log("🔄 非草稿状态，初始化偏好设置");
        initializePreferences();
      } else {
        console.log("🔒 草稿状态，偏好已通过store加载");
      }

      // 如果有目的地，加载相关信息
      if (props.baseForm) {
        console.log("pre 高德");
        setTimeout(async () => {
          await loadCityInfo(props.baseForm);
        }, 1000);
      }

      // 应用智能推荐
      applySmartRecommendations();
    });

    return {
      localPreferenceForm,
      cityInfo,
      recommendedAttractions,
      recommendedRestaurants,
      loadingAttractions,
      loadingRestaurants,
      apiError,
      loadMoreAttractions,
      loadMoreRestaurants,
      tripGoalOptions,
      paceOptions,
      allExperienceOptions,
      dietaryOptions,
      translateTag,
      selectedPreferenceTags,
      recommendedFocusAreas,
      isRecommendedFocusArea,
      extractTags,
      extractAttractionTags,
      extractSignatureDishes,
      isAttractionSelected,
      addAttractionToPlan,
      removeAttractionFromPlan,
      isRestaurantSelected,
      addRestaurantToPlan,
      removeRestaurantFromPlan,
      clearAllSelections,
      SisShow,
      RisShow,
      // 新的切换方法
      toggleTripGoal,
      toggleFocusArea,
      toggleDietaryRestriction,
      // 搜索相关
      searchKeyword,
      sortBy,
      searching,
      searchResults,
      isSearchMode,
      handleSearch,
      handleClearSearch,
    };
  },
};
</script>

<style scoped>
/* 整体布局 - 完全按照TripBaseInfo.vue */
.step-content {
  width: 100%;
  background: #f8f9fa;
  min-height: 100vh;
}

/* 页面标题区域 - 完全按照TripBaseInfo.vue */
.page-title {
  background: linear-gradient(135deg, #409eff 0%, #5dade2 100%);
  color: white;
  padding: 32px 24px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
}

.page-title::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="a" cx="50" cy="50" r="50"><stop offset="0" stop-color="white" stop-opacity="0.1"/><stop offset="1" stop-color="white" stop-opacity="0.05"/></radialGradient></defs><rect width="100" height="20" fill="url(%23a)"/></svg>');
  opacity: 0.3;
}

.title-content {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.title-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  backdrop-filter: blur(10px);
}

.title-text .main-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title-text .subtitle {
  font-size: 16px;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
}

/* 表单区域 - 完全按照TripBaseInfo.vue */
.form-sections {
  padding: 0 24px 32px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 表单分区样式 - 完全按照TripBaseInfo.vue */
.form-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8eaed;
  transition: all 0.3s ease;
}

.form-section:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 分区标题 - 完全按照TripBaseInfo.vue */
.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f2f5;
  position: relative;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(135deg, #409eff, #5dade2);
  border-radius: 1px;
}

.section-title .el-icon {
  color: #409eff;
  font-size: 24px;
}

.section-subtitle {
  font-size: 14px;
  color: #909399;
  font-weight: 400;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 操作按钮区域 - 完全按照TripBaseInfo.vue */
.action-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-left {
  flex: 0 0 auto;
}

.action-center {
  flex: 0 0 auto;
}

.action-right {
  flex: 0 0 auto;
}

/* 城市推荐布局 */
.city-guide-container {
  margin-bottom: 24px;
  position: relative;
}

.guide-tip {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(64, 158, 255, 0.1);
  border: 1px solid rgba(64, 158, 255, 0.2);
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 12px;
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 10;
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 统一推荐区域样式 */
.unified-recommendation-section {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ebeef5;
}

/* 标签切换器样式 */
.tab-switcher {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
  position: relative;
}

.tab-item:hover {
  background: #e3f2fd;
}

.tab-item.active {
  background: #fff;
  border-bottom-color: #409eff;
  color: #409eff;
  font-weight: 500;
}

.tab-item .el-icon {
  font-size: 16px;
}

.tab-item span {
  font-size: 14px;
  font-weight: 500;
}

.tab-item .el-tag {
  margin-left: auto;
}

/* 添加切换指示器动画 */
.tab-item.active::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 3px;
  background: #409eff;
  animation: slideIn 0.3s ease-out;
}

/* 优化标签内容布局 */
.tab-item {
  min-height: 60px;
}

/* 搜索区域样式 */
.search-section {
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}

.search-input-group {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.search-input-group .el-input {
  flex: 1;
}

.search-filters {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-mode-tip {
  margin-bottom: 16px;
}

/* 推荐内容样式 */
.recommendation-content {
  padding: 20px;
  background: #fff;
  border-radius: 0 0 8px 8px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 移除原来的header样式，因为现在使用tab-switcher */

.recommendation-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-state,
.empty-state,
.error-state {
  padding: 40px 20px;
  text-align: center;
}

.recommendation-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.recommendation-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.recommendation-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.recommendation-item.vertical-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.recommendation-image {
  height: 140px;
  overflow: hidden;
  position: relative;
}

.recommendation-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.5s;
}

.recommendation-item:hover .recommendation-image img {
  transform: scale(1.05);
}

.no-image {
  background: #f5f7fa;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 24px;
}

.recommendation-content {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.recommendation-content h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.full-width-name {
  width: 100%;
}

.recommendation-rating {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.rating-with-number .el-rate {
  font-size: 14px;
  line-height: 1;
}

.rating-value {
  margin-left: 8px;
  color: #ff9900;
  font-size: 13px;
  font-weight: 500;
}

.recommendation-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.category-tag {
  font-size: 11px;
}

.tag-item {
  font-size: 11px;
}

.recommendation-address {
  display: flex;
  align-items: flex-start;
  margin: 6px 0;
  color: #606266;
  font-size: 11px;
  line-height: 1.3;
}

.address-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  margin-left: 4px;
}

.view-more-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 特色标签和招牌菜样式 */
.attraction-tags,
.signature-dishes {
  margin: 6px 0;
}

.tags-title,
.signature-title {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 4px;
  font-size: 11px;
  color: #606266;
}

.feature-tags,
.dish-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.feature-tag,
.dish-tag {
  margin-right: 2px;
  margin-bottom: 2px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
}

.empty-tag {
  opacity: 0.6;
}

.add-to-plan {
  margin-top: auto;
  padding-top: 8px;
  text-align: right;
}

.add-to-plan .el-button {
  padding: 6px 12px;
  font-size: 12px;
}

@media (max-width: 480px) {
  .add-to-plan .el-button {
    padding: 4px 8px;
    font-size: 11px;
  }
}

/* 偏好区域样式 - 重新设计 */
.preferences-section {
  margin-bottom: 24px;
}

.preferences-card {
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.preferences-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.header-content {
  flex: 1;
}

.header-title {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  background: linear-gradient(135deg, #409eff, #67c23a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  margin: 0;
  font-size: 15px;
  color: #606266;
  line-height: 1.4;
}

.smart-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  border: 1px solid #b3e5ff;
  border-radius: 20px;
  padding: 8px 16px;
  color: #1890ff;
  font-size: 13px;
  font-weight: 500;
}

.smart-hint .el-icon {
  color: #faad14;
}

.preferences-content {
  padding: 32px;
}

.preferences-content h3 {
  color: #303133;
  font-size: 18px;
  margin: 0 0 16px 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preferences-content h3 .el-icon {
  color: #409eff;
  font-size: 20px;
}

.preferences-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preference-details {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.preference-row {
  margin-bottom: 12px;
}

.preference-row:last-child {
  margin-bottom: 0;
}

.preference-item {
  display: flex;
  align-items: center;
}

.preference-label {
  width: 100px;
  flex-shrink: 0;
  color: #606266;
}

.preference-values {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.preference-tag {
  margin-right: 4px;
  margin-bottom: 4px;
}

.preference-impact {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ecf5ff;
  border-radius: 4px;
  padding: 10px 16px;
  color: #409eff;
  font-size: 13px;
}

.no-preferences {
  padding: 24px 16px;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

.empty-state-enhanced {
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
}

.empty-state-enhanced h4 {
  margin: 0 0 8px;
  font-weight: 500;
}

.empty-state-enhanced p {
  margin: 0 0 16px;
  color: #606266;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  text-align: left;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.benefits-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #606266;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.personalization-section {
  margin-top: 32px;
  border-top: 1px solid #ebeef5;
  padding-top: 24px;
}

.section-desc {
  color: #909399;
  font-size: 14px;
  margin: 0 0 24px 0;
  line-height: 1.5;
  background: #f5f7fa;
  padding: 12px 16px;
  border-radius: 6px;
  border-left: 3px solid #409eff;
}

.preference-hint {
  color: #67c23a;
  font-size: 12px;
}

.recommendation-hint {
  color: #e6a23c;
  font-size: 12px;
  font-weight: normal;
}

.preference-group {
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 1px solid #f0f2f5;
}

.preference-group:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.preference-group.important-group {
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
  border: 1px solid #fde2e2;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 40px;
}

/* 组头部样式 */
.group-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.group-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #409eff 0%, #36cfc9 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  flex-shrink: 0;
}

.group-icon.important {
  background: linear-gradient(135deg, #f56c6c 0%, #ff7875 100%);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.group-info {
  flex: 1;
}

.group-title {
  margin: 0 0 8px;
  font-weight: 600;
  font-size: 18px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-desc {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.smart-tip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #fff7e6 0%, #fffbf0 100%);
  border: 1px solid #ffe7ba;
  border-radius: 12px;
  padding: 4px 8px;
  color: #d46b08;
  font-size: 12px;
  margin-left: 8px;
}

/* 选项卡片样式 */
.option-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.option-card {
  position: relative;
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.option-card.active {
  border-color: #409eff;
  background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.2);
}

.option-content {
  text-align: center;
  flex: 1;
}

.option-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.option-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: #67c23a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

/* 节奏卡片样式 */
.pace-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.pace-card {
  position: relative;
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 16px;
}

.pace-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.pace-card.active {
  border-color: #409eff;
  background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.2);
}

.pace-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.pace-content {
  flex: 1;
}

.pace-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.pace-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.4;
}

.pace-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 20px;
  height: 20px;
  background: #67c23a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

/* 体验标签样式 */
.experience-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.experience-tag {
  position: relative;
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 20px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
}

.experience-tag:hover:not(.disabled) {
  border-color: #409eff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.experience-tag.active {
  border-color: #409eff;
  background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
  color: #409eff;
}

.experience-tag.recommended {
  border-color: #faad14;
  background: linear-gradient(135deg, #fff7e6 0%, #ffffff 100%);
}

.experience-tag.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tag-label {
  font-size: 14px;
  font-weight: 500;
}

.recommend-star {
  color: #faad14;
  font-size: 12px;
}

.tag-check {
  color: #67c23a;
  font-size: 14px;
}

.selection-counter {
  margin-top: 12px;
  font-size: 13px;
  color: #909399;
  text-align: center;
}

/* 社交和拍照卡片样式 */
.social-cards,
.photo-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.social-card,
.photo-card {
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.social-card:hover,
.photo-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.social-card.active,
.photo-card.active {
  border-color: #409eff;
  background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
}

.social-emoji,
.photo-emoji {
  font-size: 32px;
  margin-bottom: 12px;
}

.social-content,
.photo-content {
  text-align: center;
}

.social-title,
.photo-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.social-desc,
.photo-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.4;
}

/* 表单组件样式 - 简化设计 */
.intensity-option {
  display: flex;
  flex-direction: column;
}

.intensity-option small {
  color: #909399;
  font-size: 12px;
}

.recommended-option {
  color: #e6a23c;
}

.recommend-icon {
  color: #e6a23c;
  margin-left: 4px;
}

.checkbox-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
}

.checkbox-grid .el-checkbox {
  margin-right: 0;
  margin-bottom: 0;
  flex: 0 0 auto;
  min-width: 120px;
}

/* 饮食禁忌标签样式 */
.dietary-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.dietary-tag {
  position: relative;
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 20px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
}

.dietary-tag:hover {
  border-color: #f56c6c;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.15);
}

.dietary-tag.active {
  border-color: #f56c6c;
  background: linear-gradient(135deg, #fef0f0 0%, #ffffff 100%);
  color: #f56c6c;
}

.dietary-label {
  font-size: 14px;
  font-weight: 500;
}

.dietary-check {
  color: #67c23a;
  font-size: 14px;
}

/* 自定义饮食需求 */
.custom-dietary {
  background: #fef9e7;
  border: 1px solid #faecd8;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #e6a23c;
}

.custom-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: #d46b08;
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-input {
  border-radius: 8px;
}

/* 特殊需求输入框 */
.special-input {
  border-radius: 8px;
  border: 2px solid #e4e7ed;
}

.special-input:focus-within {
  border-color: #409eff;
}

@media (max-width: 1200px) {
  .recommendation-list {
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
}

/* 平板端响应式设计 */
@media (max-width: 1024px) {
  .style-cards {
    gap: 12px;
  }

  .style-card {
    min-width: 140px;
  }
}

@media (max-width: 768px) {
  .tab-switcher {
    flex-direction: column;
  }

  .tab-item {
    padding: 12px 16px;
  }

  .search-section {
    padding: 12px 16px;
  }

  .search-input-group {
    flex-direction: column;
    gap: 8px;
  }

  .search-filters {
    flex-wrap: wrap;
    gap: 8px;
  }

  .recommendation-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .style-cards {
    flex-direction: column;
    gap: 12px;
  }

  .style-card {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .style-cards {
    flex-direction: column;
    gap: 12px;
  }

  .checkbox-grid {
    flex-direction: column;
    gap: 12px;
  }

  .recommendation-list {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .recommendation-image {
    height: 120px;
  }

  .recommendation-content {
    padding: 8px;
  }

  .recommendation-content h4 {
    font-size: 13px;
    margin-bottom: 6px;
  }

  .rating-with-number .el-rate {
    font-size: 12px;
  }

  .rating-value {
    font-size: 12px;
  }

  .attraction-tags,
  .signature-dishes {
    margin: 4px 0;
  }
}

.signature-dishes {
  margin: 6px 0;
}

.signature-title {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 4px;
  font-size: 11px;
  color: #606266;
}

.dish-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-height: 22px;
  overflow: hidden;
}

.dish-tag {
  margin-right: 0;
  margin-bottom: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
}

/* 选择摘要卡片样式 */
.selection-summary {
  margin: 20px 0;
}

.summary-card {
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.summary-card:hover {
  border-color: #409eff;
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.12);
}

.selected-items {
  padding: 20px;
}

.selected-section {
  margin-bottom: 24px;
}

.selected-section:last-of-type {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.section-icon {
  font-size: 18px;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.selection-tag {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.selection-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tag-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-name {
  font-weight: 500;
}

.tag-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  opacity: 0.8;
}

.summary-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  margin-top: 8px;
}

.summary-actions .el-button--primary {
  flex: 1;
  max-width: 300px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .selected-list {
    gap: 8px;
  }

  .selection-tag {
    padding: 6px 10px;
    font-size: 13px;
  }

  .summary-actions {
    flex-direction: column;
    gap: 12px;
  }

  .summary-actions .el-button--primary {
    max-width: 100%;
    order: 1;
  }

  .summary-actions .el-button--danger {
    order: 2;
  }
}

@media (max-width: 480px) {
  .selected-items {
    padding: 16px;
  }

  .selected-list {
    gap: 6px;
  }

  .selection-tag {
    padding: 4px 8px;
    font-size: 12px;
  }

  .tag-content {
    gap: 6px;
  }

  .tag-rating {
    font-size: 11px;
  }
}
</style>
