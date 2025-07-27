<template>
  <div class="trip-create-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>创建个性化行程</h1>
      <p>基于AI智能规划，为您生成专属旅行行程</p>
    </div>

    <!-- 步骤指示器 -->
    <div class="steps-container">
      <el-steps :active="currentStep" align-center>
        <el-step title="基础信息" description="选择目的地和时间"></el-step>
        <el-step title="个性化偏好" description="根据喜好定制行程"></el-step>
        <el-step title="智能生成" description="AI为您规划路线"></el-step>
        <el-step title="行程预览" description="查看和调整行程"></el-step>
      </el-steps>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 步骤1：基础信息 -->
      <div v-show="currentStep === 0" class="step-content">
        <el-card class="info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><MapLocation /></el-icon>
              <span>行程基础信息</span>
            </div>
          </template>

          <el-form
            :model="tripForm"
            :rules="tripRules"
            ref="tripFormRef"
            label-position="top"
          >
            <el-row :gutter="24">
              <!-- 目的地选择 -->
              <el-col :span="12">
                <el-form-item label="目的地" prop="destination">
                  <el-select
                    v-model="tripForm.destination"
                    placeholder="选择你想去的城市"
                    size="large"
                    style="width: 100%"
                    filterable
                  >
                    <el-option
                      v-for="city in availableCities"
                      :key="city.code"
                      :label="city.name"
                      :value="city.code"
                    >
                      <div class="city-option">
                        <span>{{ city.name }}</span>
                        <span class="city-desc">{{ city.description }}</span>
                      </div>
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <!-- 出行天数 -->
              <el-col :span="12">
                <el-form-item label="出行天数" prop="days">
                  <div class="days-input-container">
                    <!-- 快速选择按钮 -->
                    <div class="quick-days-buttons" v-if="!showCustomDaysInput">
                      <el-button-group>
                        <el-button 
                          v-for="option in quickDaysOptions" 
                          :key="option.value"
                          :type="tripForm.days === option.value ? 'primary' : ''"
                          size="small"
                          @click="selectQuickDays(option.value)"
                        >
                          {{ option.label }}
                        </el-button>
                      </el-button-group>
                      <el-button 
                        type="text" 
                        size="small" 
                        @click="showCustomDaysInput = true"
                        class="custom-days-trigger"
                      >
                        自定义天数
                      </el-button>
                    </div>

                    <!-- 自定义天数输入 -->
                    <div class="custom-days-input" v-if="showCustomDaysInput">
                      <el-input-number
                        v-model="tripForm.days"
                        :min="1"
                        :max="365"
                        size="large"
                        style="width: 200px"
                        placeholder="输入天数"
                        @change="handleDaysChange"
                      />
                      <el-button 
                        type="text" 
                        size="small" 
                        @click="showCustomDaysInput = false"
                        class="back-to-quick"
                      >
                        返回快选
                      </el-button>
                    </div>

                    <!-- 天数描述 -->
                    <div class="days-description" v-if="tripForm.days">
                      <span class="days-text">{{ getDaysDescription() }}</span>
                    </div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <!-- 出行日期 -->
              <el-col :span="12">
                <el-form-item label="出行日期" prop="dateRange">
                  <el-date-picker
                    v-model="tripForm.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    size="large"
                    style="width: 100%"
                    :disabled-date="disabledDate"
                    :clearable="true"
                    @change="handleDateChange"
                  />
                  <div class="form-tip">
                    <template
                      v-if="tripForm.days && !tripForm.dateRange?.length"
                    >
                      <el-button
                        type="primary"
                        link
                        size="small"
                        @click="autoSetDatesFromToday"
                      >
                        <el-icon><Calendar /></el-icon>
                        <b>点击此处自动设定日期（从今天开始{{ tripForm.days }}天）</b>
                      </el-button>
                    </template>
                    <template
                      v-else-if="
                        tripForm.days && tripForm.dateRange?.length === 2
                      "
                    >
                      <div class="date-info">
                        <span
                          v-if="getActualDays === tripForm.days"
                          class="date-match"
                        >
                          <el-icon><Check /></el-icon>
                          日期与天数匹配：{{ formatDateRange() }}
                        </span>
                        <span v-else class="date-mismatch">
                          <el-icon><Warning /></el-icon>
                          所选日期为{{ getActualDays }}天，与{{
                            tripForm.days
                          }}天设置不符
                          <el-button
                            type="warning"
                            link
                            size="small"
                            @click="adjustDatesToMatchDays"
                          >
                            调整日期
                          </el-button>
                        </span>
                      </div>
                    </template>
                    <template v-else>
                      请选择出行日期，或先选择天数后自动设定
                    </template>
                  </div>
                </el-form-item>
              </el-col>

              <!-- 出行人数 -->
              <el-col :span="12">
                <el-form-item label="出行人数" prop="travelers">
                  <el-input-number
                    v-model="tripForm.travelers"
                    :min="1"
                    :max="20"
                    size="large"
                    style="width: 100%"
                  />
                  <div class="form-tip">人数会影响餐厅和住宿推荐</div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <!-- 预算范围 -->
              <el-col >
                <el-form-item label="预算范围（每人每天）" prop="budget">
                  <div v-if="userPreferences && userPreferences.budget" class="preference-hint-banner">
                    <el-icon><Star /></el-icon>
                    <span>基于您的偏好设置，推荐预算：¥{{ userPreferences.budget }}/天</span>
                    <el-button type="text" size="small" @click="applyRecommendedBudget">
                      应用推荐
                    </el-button>
                  </div>

                  <div class="budget-selector">
                    <div
                      v-for="option in budgetOptions"
                      :key="option.value"
                      class="budget-card"
                      :class="{ 
                        selected: tripForm.budget === option.value,
                        recommended: isRecommendedBudget(option.value)
                      }"
                      @click="selectBudget(option.value)"
                    >
                      <div class="budget-icon">
                        <el-icon>
                          <component :is="option.icon" />
                        </el-icon>
                      </div>
                      <div class="budget-content">
                        <h4 class="budget-title">
                          {{ option.title }}
                          <el-tag v-if="isRecommendedBudget(option.value)" size="small" type="success">
                            推荐
                          </el-tag>
                        </h4>
                        <div class="budget-price">{{ option.price }}</div>
                        <div class="budget-desc">{{ option.description }}</div>
                      </div>
                      <div
                        class="budget-preview"
                        v-if="tripForm.days && tripForm.travelers"
                      >
                        <div class="preview-label">预计总花费</div>
                        <div class="preview-amount">
                          {{ calculateBudgetPreview(option.value) }}
                        </div>
                      </div>
                      <div
                        class="budget-check"
                        v-if="tripForm.budget === option.value"
                      >
                        <el-icon><Check /></el-icon>
                      </div>
                    </div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div class="form-tip">
            <template v-if="tripForm.budget">
              已选择{{ getBudgetText() }}档位
              <span v-if="tripForm.days && tripForm.travelers">
                ，{{ tripForm.days }}天{{ tripForm.travelers }}人预计花费{{
                  getEstimatedCost()
                }}
              </span>
            </template>
            <template v-else> 预算将影响景点、餐厅和住宿推荐 </template>
          </div>
        </el-card>
      </div>

      <!-- 步骤2：个性化偏好 -->
      <div v-show="currentStep === 1" class="step-content">
        <!-- 城市介绍卡片 - 暂时隐藏，待后续集成携程/大众点评API -->
        <!-- TODO: 集成携程或大众点评API展示真实景点和美食推荐 -->
        <div v-if="false" class="city-intro-placeholder">
          <!-- 预留位置，后续集成第三方API -->
        </div>

        <!-- 个性化偏好设置卡片 -->
        <el-card class="preferences-card" shadow="hover">
          <div class="preferences-content">
            <!-- 当前偏好设置显示 -->
            <div v-if="userPreferences && selectedPreferenceTags.length > 0" class="current-preferences">
              <div class="preferences-header">
                <h3>
                  <el-icon><User /></el-icon>
                  您的旅行偏好档案
                </h3>
                <el-button type="primary" link @click="openPreferences">
                  <el-icon><Edit /></el-icon>
                  修改偏好
                </el-button>
              </div>

              <!-- 偏好详情展示 -->
              <div class="preference-details">
                <div class="preference-row">
                  <div class="preference-item">
                    <span class="preference-label">旅行类型：</span>
                    <div class="preference-values">
                      <el-tag v-for="tag in selectedPreferenceTags.slice(0, 4)" :key="tag" size="small" class="preference-tag">
                        {{ tag }}
                      </el-tag>
                      <el-tag v-if="selectedPreferenceTags.length > 4" size="small" class="more-tag">
                        +{{ selectedPreferenceTags.length - 4 }}项
                      </el-tag>
                    </div>
                  </div>
                </div>

                <div class="preference-row" v-if="userPreferences.budget">
                  <div class="preference-item">
                    <span class="preference-label">预算偏好：</span>
                    <div class="preference-values">
                      <el-tag size="small" type="warning">¥{{ userPreferences.budget }}/天</el-tag>
                    </div>
                  </div>
                </div>

                <div class="preference-row" v-if="userPreferences.travelPace">
                  <div class="preference-item">
                    <span class="preference-label">旅行节奏：</span>
                    <div class="preference-values">
                      <el-tag size="small" type="info">{{ tagMapping[userPreferences.travelPace] || userPreferences.travelPace }}</el-tag>
                    </div>
                  </div>
                </div>

                <div class="preference-row" v-if="userPreferences.accommodationType">
                  <div class="preference-item">
                    <span class="preference-label">住宿偏好：</span>
                    <div class="preference-values">
                      <el-tag size="small" type="primary">{{ tagMapping[userPreferences.accommodationType] || userPreferences.accommodationType }}</el-tag>
                    </div>
                  </div>
                </div>
              </div>

              <div class="preference-impact">
                <el-icon><MagicStick /></el-icon>
                <span>基于以上偏好，系统已为您智能推荐相关选项</span>
              </div>
            </div>

            <!-- 没有偏好设置时的提示 -->
            <div v-else class="no-preferences">
              <div class="empty-state-enhanced">
                <div class="empty-icon">
                  <el-icon size="64" color="#f59e0b"><Setting /></el-icon>
                </div>
                <h4>完善偏好设置，获得更精准的行程推荐</h4>
                <p>设置您的旅行偏好后，系统将：</p>
                <ul class="benefits-list">
                  <li><el-icon><Check /></el-icon>自动推荐合适的预算范围</li>
                  <li><el-icon><Check /></el-icon>智能选择体验重点和活动</li>
                  <li><el-icon><Check /></el-icon>根据您的喜好定制行程风格</li>
                  <li><el-icon><Check /></el-icon>提供个性化的景点和餐厅推荐</li>
                </ul>
                <div class="action-buttons">
                  <el-button type="primary" size="large" @click="openPreferences">
                    <el-icon><Setting /></el-icon>
                    立即设置偏好
                  </el-button>
                  <el-button type="text" @click="skipPreferences">
                    暂时跳过
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 简化的个性化问题 -->
            <div class="personalization-section">
              <h3>
                <el-icon><MagicStick /></el-icon>
                本次行程个性化
              </h3>
              <p class="section-desc">
                基于您的基础偏好和{{ getSelectedCityName() }}的特色，为本次行程做进一步定制
                <span v-if="userPreferences && selectedPreferenceTags.length > 0" class="preference-hint">
                  （已根据您的{{ selectedPreferenceTags.length }}项偏好智能推荐）
                </span>
              </p>

              <el-form :model="preferenceForm" class="simple-preferences-form">
                <!-- 核心偏好 - 卡片式选择 -->
                <div class="preference-group">
                  <h4>行程风格</h4>
                  <div class="style-cards">
                    <div 
                      v-for="style in tripStyles" 
                      :key="style.value"
                      class="style-card"
                      :class="{ active: preferenceForm.tripStyle === style.value }"
                      @click="preferenceForm.tripStyle = style.value"
                    >
                      <div class="style-icon">{{ style.icon }}</div>
                      <div class="style-title">{{ style.title }}</div>
                      <div class="style-desc">{{ style.desc }}</div>
                    </div>
                  </div>
                </div>

                <!-- 活动强度 -->
                <div class="preference-group">
                  <h4>
                    活动强度
                    <span v-if="recommendedIntensity" class="recommendation-hint">
                      （基于您的旅行节奏偏好推荐）
                    </span>
                  </h4>
                  <el-select v-model="preferenceForm.intensity" size="large" style="width: 100%; max-width: 300px;">
                    <el-option 
                      v-for="option in intensityOptions" 
                      :key="option.value"
                      :label="option.label" 
                      :value="option.value"
                      :class="{ 'recommended-option': option.value === recommendedIntensity }"
                    >
                      <div class="intensity-option">
                        <span>
                          {{ option.label }}
                          <el-icon v-if="option.value === recommendedIntensity" class="recommend-icon">
                            <Star />
                          </el-icon>
                        </span>
                        <small>{{ getIntensityDescription(option.value) }}</small>
                      </div>
                    </el-option>
                  </el-select>
                </div>

                <!-- 体验重点 -->
                <div class="preference-group">
                  <h4>
                    最想体验
                    <span v-if="recommendedFocusAreas.length > 0" class="recommendation-hint">
                      （已根据偏好推荐{{ recommendedFocusAreas.length }}项）
                    </span>
                  </h4>
                  <div class="checkbox-grid">
                    <el-checkbox-group v-model="preferenceForm.focusAreas">
                      <el-checkbox 
                        v-for="option in focusAreaOptions" 
                        :key="option.value"
                        :label="option.value"
                        :class="{ 'recommended-option': isRecommendedFocusArea(option.value) }"
                      >
                        {{ option.label }}
                        <el-icon v-if="isRecommendedFocusArea(option.value)" class="recommend-icon">
                          <Star />
                        </el-icon>
                      </el-checkbox>
                    </el-checkbox-group>
                  </div>
                </div>

                <!-- 特殊体验 -->
                <div class="preference-group">
                  <h4>特别体验</h4>
                  <div class="checkbox-grid">
                    <el-checkbox-group v-model="preferenceForm.specialExperiences">
                      <el-checkbox label="photography">摄影打卡</el-checkbox>
                      <el-checkbox label="local_events">当地活动</el-checkbox>
                      <el-checkbox label="hidden_gems">小众景点</el-checkbox>
                      <el-checkbox label="seasonal_activities">季节特色</el-checkbox>
                      <el-checkbox label="workshops">手工体验</el-checkbox>
                      <el-checkbox label="performances">文艺演出</el-checkbox>
                    </el-checkbox-group>
                  </div>
                </div>

                <!-- 展开更多选项 -->
                <div class="expand-section">
                  <el-button 
                    type="text" 
                    @click="showAdvancedOptions = !showAdvancedOptions"
                    class="expand-button"
                  >
                    <el-icon><ArrowDown v-if="!showAdvancedOptions" /><ArrowUp v-else /></el-icon>
                    {{ showAdvancedOptions ? '收起' : '更多选项' }}
                  </el-button>
                </div>

                <!-- 高级选项 -->
                <div v-show="showAdvancedOptions" class="advanced-options">
                  <div class="preference-group">
                    <h4>出行偏好</h4>
                    <div class="checkbox-grid">
                      <el-checkbox-group v-model="preferenceForm.transportPreferences">
                        <el-checkbox label="walking_friendly">多步行</el-checkbox>
                        <el-checkbox label="public_transport">公共交通</el-checkbox>
                        <el-checkbox label="scenic_routes">风景路线</el-checkbox>
                        <el-checkbox label="efficient_routes">高效路线</el-checkbox>
                      </el-checkbox-group>
                    </div>
                  </div>

                  <div class="preference-group">
                    <h4>美食偏好</h4>
                    <div class="checkbox-grid">
                      <el-checkbox-group v-model="preferenceForm.foodFocus">
                        <el-checkbox label="street_food">街头小吃</el-checkbox>
                        <el-checkbox label="local_specialties">地方特色</el-checkbox>
                        <el-checkbox label="fine_dining">高端餐厅</el-checkbox>
                        <el-checkbox label="traditional_cuisine">传统老字号</el-checkbox>
                      </el-checkbox-group>
                    </div>
                  </div>
                </div>

                <!-- 特殊需求 -->
                <div class="preference-group">
                  <h4>特殊需求</h4>
                  <el-input
                    v-model="preferenceForm.specialRequests"
                    type="textarea"
                    :rows="3"
                    placeholder="如有特殊需求请在此说明，如：庆祝纪念日、带老人小孩、身体不便、食物过敏等..."
                    maxlength="500"
                    show-word-limit
                  />
                </div>
              </el-form>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 步骤3：智能生成 -->
      <div v-show="currentStep === 2" class="step-content">
        <el-card class="info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><MagicStick /></el-icon>
              <span>AI智能生成行程</span>
            </div>
          </template>

          <div class="generation-content">
            <div v-if="!generating && !generatedTrip" class="ready-to-generate">
              <el-icon size="64" color="#409EFF"><MagicStick /></el-icon>
              <h3>准备生成您的专属行程</h3>
              <p>基于您的偏好和要求，AI将为您精心规划行程路线</p>
              <div class="generation-info">
                <div class="info-item">
                  <span class="label">目的地：</span>
                  <span class="value">{{ getSelectedCityName() }}</span>
                </div>
                <div class="info-item">
                  <span class="label">天数：</span>
                  <span class="value">{{ tripForm?.days || 0 }}天</span>
                </div>
                <div class="info-item">
                  <span class="label">人数：</span>
                  <span class="value">{{ tripForm?.travelers || 0 }}人</span>
                </div>
                <div class="info-item">
                  <span class="label">预算：</span>
                  <span class="value">{{ getBudgetText() }}</span>
                </div>
                <div class="info-item">
                  <span class="label">预计花费：</span>
                  <span class="value">{{ getEstimatedCost() }}</span>
                </div>
              </div>
              <el-button
                type="primary"
                size="large"
                @click="generateTrip"
                :loading="generating"
              >
                <el-icon><MagicStick /></el-icon>
                开始生成行程
              </el-button>
            </div>

            <div v-if="generating" class="generating">
              <el-icon size="64" color="#409EFF" class="rotating"
                ><Loading
              /></el-icon>
              <h3>AI正在为您生成行程...</h3>
              <p>{{ generationProgress }}</p>
              <el-progress
                :percentage="progressPercent"
                :stroke-width="8"
              ></el-progress>
            </div>

            <div
              v-if="generatedTrip && !generating"
              class="generation-complete"
            >
              <el-icon size="48" color="#67C23A"><Check /></el-icon>
              <h3>行程生成完成！</h3>
              <p>
                为您推荐了 {{ generatedTrip.attractions?.length || 0 }} 个景点和
                {{ generatedTrip.restaurants?.length || 0 }} 家餐厅
              </p>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 步骤4：行程预览 -->
      <div v-show="currentStep === 3" class="step-content">
        <el-card class="info-card" shadow="hover">
          <div v-if="generatedTrip" class="trip-preview">
            <!-- 行程概述 -->
            <div class="trip-summary">
              <div class="summary-header">
                <div class="summary-title">
                  <h3>
                    {{ getSelectedCityName() }} {{ tripForm?.days || 0 }}日游
                  </h3>
                  <div class="summary-stats">
                    <div class="stat-item">
                      <el-icon><MapLocation /></el-icon>
                      <span
                        >{{
                          generatedTrip?.attractions?.length || 0
                        }}
                        个景点</span
                      >
                    </div>
                    <div class="stat-item">
                      <el-icon><Shop /></el-icon>
                      <span
                        >{{
                          generatedTrip?.restaurants?.length || 0
                        }}
                        家餐厅</span
                      >
                    </div>
                    <div class="stat-item">
                      <el-icon><Money /></el-icon>
                      <span>预计花费：{{ getEstimatedCost() }}</span>
                    </div>
                  </div>
                </div>
                <div class="summary-actions">
                  <el-button size="small" @click="shareTrip">
                    <el-icon><Share /></el-icon>
                    分享行程
                  </el-button>
                  <el-button size="small" @click="exportTrip">
                    <el-icon><Download /></el-icon>
                    导出行程
                  </el-button>
                  <el-button size="small" @click="previewTrip">
                    <el-icon><View /></el-icon>
                    预览效果
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 每日行程 -->
            <div class="daily-schedule">
              <div
                v-for="(day, index) in generatedTrip.dailyPlan"
                :key="index"
                class="day-plan"
              >
                <div class="day-header">
                  <h4>第{{ index + 1 }}天</h4>
                  <span class="day-date">{{ formatDayDate(index) }}</span>
                </div>
                <div class="day-activities">
                  <div
                    v-for="(activity, actIndex) in day.activities"
                    :key="actIndex"
                    class="activity-item"
                  >
                    <div class="activity-time">{{ activity.time }}</div>
                    <div class="activity-content">
                      <div class="activity-info">
                        <h5>{{ activity.name }}</h5>
                        <p>{{ activity.description }}</p>
                        <div class="activity-tags">
                          <el-tag
                            v-for="tag in activity.tags"
                            :key="tag"
                            size="small"
                            >{{ tag }}</el-tag
                          >
                        </div>
                      </div>
                      <div class="activity-actions">
                        <el-button
                          size="small"
                          type="text"
                          @click="replaceActivity(index, actIndex)"
                        >
                          替换
                        </el-button>
                        <el-button
                          size="small"
                          type="text"
                          @click="removeActivity(index, actIndex)"
                          style="color: #f56c6c"
                        >
                          删除
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="action-buttons">
      <el-button v-if="currentStep > 0" size="large" @click="previousStep">
        上一步
      </el-button>

      <el-button
        v-if="currentStep < 3"
        type="primary"
        size="large"
        @click="nextStep"
        :disabled="!canProceed"
      >
        下一步
      </el-button>

      <el-button
        v-if="currentStep === 3"
        type="success"
        size="large"
        @click="saveTrip"
      >
        保存行程
      </el-button>
    </div>
  </div>

  <!-- 隐藏的开发者面板 (按Ctrl+Shift+D显示) -->
  <div v-if="showDevPanel" class="dev-panel">
    <div class="dev-panel-header">
      <h4>🧪 开发者工具</h4>
      <el-button size="small" @click="showDevPanel = false">关闭</el-button>
    </div>
    <div class="dev-panel-content">
      <el-space direction="vertical" style="width: 100%">
        <div>
          <strong>用户状态:</strong>
          <span v-if="userStore.isLoggedIn"
            >已登录 (ID: {{ userStore.currentUser?.id }})</span
          >
          <span v-else>未登录</span>
        </div>

        <el-space wrap>
          <el-button size="small" type="primary" @click="setTestUser(1)">
            设置测试用户1
          </el-button>
          <el-button size="small" type="primary" @click="setTestUser(2)">
            设置测试用户2
          </el-button>
          <el-button size="small" type="warning" @click="userStore.logout()">
            退出登录
          </el-button>
        </el-space>

        <el-space wrap>
          <el-button size="small" type="success" @click="testPreferencesAPI">
            测试偏好API
          </el-button>
          <el-button size="small" type="info" @click="checkPreferencesStatus">
            检查偏好状态
          </el-button>
        </el-space>

        <div v-if="preferencesStatus !== null" class="preferences-status">
          <strong>偏好状态:</strong>
          <el-tag :type="preferencesStatus ? 'success' : 'warning'">
            {{ preferencesStatus ? "已完成" : "未完成" }}
          </el-tag>
        </div>
      </el-space>
    </div>
  </div>
</template>

<script>
import {
  ref,
  reactive,
  computed,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/store/user.js";
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import {
  MapLocation,
  User,
  MagicStick,
  Calendar,
  Loading,
  Check,
  Shop,
  Money,
  Share,
  Download,
  View,
  Edit,
  Setting,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Plus,
  Minus,
  Delete,
  Clock,
  Star,
  Warning,
} from "@element-plus/icons-vue";
import { dataApi } from "@/api/data.js";
import { userApi } from "@/api/user.js";
import { convertFrontendTripToBackend } from "@/utils/tripDataConverter.js";

export default {
  name: "TripCreate",
  components: {
    MapLocation,
    User,
    MagicStick,
    Calendar,
    Loading,
    Check,
    Shop,
    Money,
    Share,
    Download,
    View,
    Edit,
    Setting,
    ArrowLeft,
    ArrowRight,
    ArrowDown,
    ArrowUp,
    Plus,
    Minus,
    Delete,
    Clock,
    Star,
    Warning,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const userStore = useUserStore();

    // ========== 立即初始化所有响应式变量 ==========

    // 当前步骤
    const currentStep = ref(0);
    const steps = ["基本信息", "个性化偏好", "AI生成", "预览调整"];

    // 行程基础信息表单
    const tripForm = ref({
      destination: "",
      days: null,
      dateRange: [],
      travelers: 2,
      budget: "",
    });

    // 个性化偏好表单
    const preferenceForm = ref({
      // 基础设置
      intensity: "",
      tripStyle: "",
      
      // 体验重点
      focusAreas: [],
      specialExperiences: [],
      
      // 社交和时间偏好
      socialPreferences: [],
      timePreferences: [],
      
      // 交通和路线
      transportPreferences: [],
      
      // 美食和购物
      foodFocus: [],
      shoppingPreferences: [],
      
      // 特殊需求
      specialRequests: "",
    });

    // 表单引用
    const tripFormRef = ref(null);

    // 用户偏好数据
    const userPreferences = ref({
      selectedTags: [],
      selectedTransports: [],
      accommodationType: "",
      travelPace: "",
      foodTastes: [],
      otherPreferences: [],
      budget: "",
    });

    // 生成相关状态
    const generating = ref(false);
    const generatedTrip = ref(null);
    const generationProgress = ref("");
    const progressPercent = ref(0);

    // 可用城市列表 - 从API获取
    const availableCities = ref([]);
    const loadingCities = ref(false);

    // 天数选择相关状态
    const showCustomDaysInput = ref(false);
    
    // 快速天数选择选项
    const quickDaysOptions = [
      { value: 1, label: '1天' },
      { value: 2, label: '2天' },
      { value: 3, label: '3天' },
      { value: 5, label: '5天' },
      { value: 7, label: '1周' },
      { value: 14, label: '2周' },
      { value: 30, label: '1月' }
    ];

    // 个性化偏好相关状态
    const showAdvancedOptions = ref(false);

    // 行程风格选项
    const tripStyles = [
      {
        value: 'exploration',
        title: '深度探索',
        desc: '深入了解当地文化',
        icon: '🔍'
      },
      {
        value: 'relaxation',
        title: '休闲度假',
        desc: '放松身心的悠闲时光',
        icon: '🌴'
      },
      {
        value: 'cultural',
        title: '文化体验',
        desc: '感受历史与艺术',
        icon: '🎭'
      },
      {
        value: 'adventure',
        title: '冒险刺激',
        desc: '挑战自我的精彩体验',
        icon: '⚡'
      }
    ];

    // 体验重点选项
    const focusAreaOptions = [
      { value: 'local_culture', label: '当地文化' },
      { value: 'food_experience', label: '美食体验' },
      { value: 'natural_scenery', label: '自然风光' },
      { value: 'urban_life', label: '都市生活' },
      { value: 'historical_sites', label: '历史古迹' },
      { value: 'modern_attractions', label: '现代景观' }
    ];

    // 活动强度选项
    const intensityOptions = [
      { value: 'relaxed', label: '轻松休闲' },
      { value: 'moderate', label: '适中节奏' },
      { value: 'intensive', label: '紧凑高效' }
    ];

    // 预算选项配置
    const budgetOptions = [
      {
        value: "budget",
        title: "经济实惠",
        price: "< ¥500/天",
        description: "青旅、经济型酒店、当地小吃",
        icon: "Money",
        dailyAmount: 400,
      },
      {
        value: "moderate",
        title: "舒适享受",
        price: "¥500-1000/天",
        description: "三星酒店、特色餐厅、景点门票",
        icon: "Star",
        dailyAmount: 750,
      },
      {
        value: "luxury",
        title: "豪华体验",
        price: "> ¥1000/天",
        description: "高端酒店、精品餐厅、VIP服务",
        icon: "Setting",
        dailyAmount: 1500,
      },
    ];

    // 选择预算
    const selectBudget = (value) => {
      tripForm.value.budget = value;

      // 重新验证表单
      nextTick(() => {
        tripFormRef.value?.validateField("budget");
      });
    };

    // 计算预算预览
    const calculateBudgetPreview = (budgetType) => {
      if (!tripForm.value.days || !tripForm.value.travelers) return "¥0";

      const option = budgetOptions.find((opt) => opt.value === budgetType);
      if (!option) return "¥0";

      const totalAmount =
        option.dailyAmount * tripForm.value.days * tripForm.value.travelers;
      return `¥${totalAmount.toLocaleString()}`;
    };

    // 加载城市列表
    const loadAvailableCities = async () => {
      try {
        loadingCities.value = true;
        const response = await dataApi.getAllCities();

        if (response && response.data) {
          // 转换数据格式以适配现有组件
          availableCities.value = response.data.map((city) => ({
            code: city.code,
            name: city.name,
            description: city.description || city.province,
          }));
          console.log(
            "✅ 加载城市列表成功:",
            availableCities.value.length,
            "个城市"
          );
        } else {
          throw new Error("城市数据格式异常");
        }
      } catch (error) {
        console.error("❌ 加载城市列表失败:", error);
        ElMessage.error("加载城市列表失败");

        // 使用备用数据
        availableCities.value = [
          {
            code: "beijing",
            name: "北京",
            description: "千年古都，文化底蕴深厚",
          },
          {
            code: "shanghai",
            name: "上海",
            description: "国际化大都市，东西文化交汇",
          },
        ];
      } finally {
        loadingCities.value = false;
      }
    };

    // 加载城市详细信息
    const loadCityInfo = async (cityCode) => {
      if (!cityCode) {
        cityInfo.value = null;
        return;
      }

      try {
        loadingCityInfo.value = true;
        
        // 首先从本地数据库获取
        if (cityInfoDatabase[cityCode]) {
          cityInfo.value = cityInfoDatabase[cityCode];
          console.log("✅ 从本地数据库加载城市信息:", cityCode);
          return;
        }

        // 如果本地没有，尝试从API获取（未来扩展）
        console.log("⚠️ 城市信息暂未收录:", cityCode);
        cityInfo.value = {
          name: getSelectedCityName(),
          description: "精彩城市，等待您的探索",
          highlights: ["热门景点", "特色体验"],
          specialties: ["当地美食", "特色小吃"],
          bestSeasons: ["全年适宜"],
          tips: ["提前规划行程", "注意天气变化"]
        };
      } catch (error) {
        console.error("❌ 加载城市信息失败:", error);
        cityInfo.value = null;
      } finally {
        loadingCityInfo.value = false;
      }
    };

    // 自定义日期范围验证器（必须在tripRules之前定义）
    const validateDateRange = (rule, value, callback) => {
      if (!value || value.length !== 2) {
        callback();
        return;
      }

      const startDate = new Date(value[0]);
      const endDate = new Date(value[1]);
      const daysDifference =
        Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      // 验证日期差与选择天数是否匹配
      if (tripForm.value.days && daysDifference !== tripForm.value.days) {
        callback(
          new Error(
            `日期范围应为${tripForm.value.days}天，当前选择了${daysDifference}天`
          )
        );
        return;
      }

      // 验证开始日期不能早于今天
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        callback(new Error("开始日期不能早于今天"));
        return;
      }

      // 验证日期范围不能超过365天
      if (daysDifference > 365) {
        callback(new Error("行程不能超过365天"));
        return;
      }

      callback();
    };

    // 表单验证规则（必须在validateDateRange之后定义）
    const tripRules = {
      destination: [
        { required: true, message: "请选择目的地", trigger: "change" },
      ],
      days: [{ required: true, message: "请选择出行天数", trigger: "change" }],
      dateRange: [
        { required: true, message: "请选择出行日期", trigger: "change" },
        { validator: validateDateRange, trigger: "change" },
      ],
      travelers: [
        { required: true, message: "请填写出行人数", trigger: "blur" },
      ],
      budget: [
        { required: true, message: "请选择预算范围", trigger: "change" },
      ],
    };

    // 监听天数变化，智能调整日期范围
    watch(
      () => tripForm.value.days,
      (newDays, oldDays) => {
        if (newDays && tripForm.value.dateRange.length === 2) {
          const startDate = new Date(tripForm.value.dateRange[0]);
          const newEndDate = new Date(startDate);
          newEndDate.setDate(startDate.getDate() + newDays - 1);

          tripForm.value.dateRange = [tripForm.value.dateRange[0], newEndDate];

          // 重新验证表单
          nextTick(() => {
            tripFormRef.value?.validateField("dateRange");
          });

          ElMessage.info(
            `已自动调整结束日期为${newEndDate.toLocaleDateString()}`
          );
        }
      }
    );

    // 监听目的地变化，加载城市信息
    watch(
      () => tripForm.value.destination,
      (newDestination) => {
        if (newDestination) {
          loadCityInfo(newDestination);
        }
      },
      { immediate: true }
    );

    // 监听用户偏好变化，应用智能推荐
    watch(
      () => userPreferences.value,
      (newPreferences) => {
        if (newPreferences && selectedPreferenceTags.value.length > 0) {
          applySmartRecommendations();
        }
      },
      { deep: true }
    );

    // 应用智能推荐
    const applySmartRecommendations = () => {
      console.log("🤖 应用智能推荐...");
      
      // 只在用户未手动选择时应用推荐
      if (!preferenceForm.value.tripStyle && recommendedTripStyle.value) {
        preferenceForm.value.tripStyle = recommendedTripStyle.value;
        console.log("🎯 推荐行程风格:", recommendedTripStyle.value);
      }
      
      // 推荐活动强度（只在用户未手动选择时）
      if (!preferenceForm.value.intensity && recommendedIntensity.value) {
        preferenceForm.value.intensity = recommendedIntensity.value;
        console.log("🎯 推荐活动强度:", recommendedIntensity.value);
      }
      
      // 推荐体验重点（合并而不是覆盖）
      if (recommendedFocusAreas.value.length > 0) {
        const currentAreas = preferenceForm.value.focusAreas || [];
        const newAreas = [...new Set([...currentAreas, ...recommendedFocusAreas.value])];
        if (newAreas.length !== currentAreas.length) {
          preferenceForm.value.focusAreas = newAreas;
          console.log("🎯 推荐体验重点:", recommendedFocusAreas.value);
        }
      }
      
      // 推荐特殊体验（合并而不是覆盖）
      if (recommendedSpecialExperiences.value.length > 0) {
        const currentExperiences = preferenceForm.value.specialExperiences || [];
        const newExperiences = [...new Set([...currentExperiences, ...recommendedSpecialExperiences.value])];
        if (newExperiences.length !== currentExperiences.length) {
          preferenceForm.value.specialExperiences = newExperiences;
          console.log("🎯 推荐特殊体验:", recommendedSpecialExperiences.value);
        }
      }
    };

    // 预算推荐计算
    const budgetRecommendation = computed(() => {
      if (!userPreferences.value?.budget) return null;
      
      const userBudget = parseInt(userPreferences.value.budget);
      if (userBudget <= 200) return 'budget';
      if (userBudget <= 500) return 'moderate';
      if (userBudget <= 1000) return 'comfort';
      return 'luxury';
    });

    // 判断是否为推荐的预算选项
    const isRecommendedBudget = (budgetValue) => {
      return budgetRecommendation.value === budgetValue;
    };

    // 获取预算文本
    const getBudgetText = () => {
      const budgetOptions = {
        'budget': '经济实惠',
        'moderate': '适中舒适', 
        'comfort': '舒适便利',
        'luxury': '豪华奢华'
      };
      return budgetOptions[tripForm.value.budget] || '';
    };

    // 应用推荐预算
    const applyRecommendedBudget = () => {
      if (budgetRecommendation.value) {
        tripForm.value.budget = budgetRecommendation.value;
        ElMessage.success(`已应用推荐预算：${getBudgetText()}`);
      }
    };

    // 判断是否为推荐的体验重点
    const isRecommendedFocusArea = (areaValue) => {
      return recommendedFocusAreas.value.includes(areaValue);
    };

    // 跳过偏好设置
    const skipPreferences = () => {
      ElMessage.info("您可以随时在个人中心设置偏好以获得更好的推荐");
    };

    // 处理日期变化
    const handleDateChange = (newDateRange) => {
      console.log("日期范围变化:", newDateRange);

      if (!newDateRange || newDateRange.length !== 2) {
        return;
      }

      const startDate = new Date(newDateRange[0]);
      const endDate = new Date(newDateRange[1]);
      const actualDays =
        Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      console.log(`计算得出实际天数: ${actualDays}天`);

      // 如果日期对应的天数与当前设定不符，询问用户是否调整天数
      if (tripForm.value.days && actualDays !== tripForm.value.days) {
        ElMessageBox.confirm(
          `您选择的日期为${actualDays}天，但当前设置为${tripForm.value.days}天。是否要调整天数设置？`,
          "日期与天数不匹配",
          {
            confirmButtonText: "调整天数",
            cancelButtonText: "保持现有天数",
            type: "warning",
          }
        )
          .then(() => {
            tripForm.value.days = actualDays;
            ElMessage.success(`已调整天数为${actualDays}天`);

            // 重新验证表单
            nextTick(() => {
              tripFormRef.value?.validateField("days");
            });
          })
          .catch(() => {
            ElMessage.info("已保持现有天数设置，请注意日期与天数的差异");
          });
      }

      // 重新验证日期字段
      nextTick(() => {
        tripFormRef.value?.validateField("dateRange");
      });
    };

    // 监听日期变化，智能调整天数
    watch(
      () => tripForm.value.dateRange,
      (newDateRange) => {
        if (newDateRange && newDateRange.length === 2) {
          const startDate = new Date(newDateRange[0]);
          const endDate = new Date(newDateRange[1]);
          const daysDifference =
            Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

          // 如果日期差与当前天数不符，询问用户如何处理
          if (tripForm.value.days && daysDifference !== tripForm.value.days) {
            setTimeout(() => {
              ElMessageBox.confirm(
                `您选择的日期为${daysDifference}天，但当前设置为${tripForm.value.days}天。要调整天数设置吗？`,
                "日期与天数不匹配",
                {
                  confirmButtonText: `调整为${daysDifference}天`,
                  cancelButtonText: "保持当前设置",
                  type: "warning",
                }
              )
                .then(() => {
                  tripForm.value.days = daysDifference;
                  ElMessage.success(`已调整为${daysDifference}天`);
                })
                .catch(() => {
                  // 用户选择保持当前设置，需要调整日期
                  const startDate = new Date(newDateRange[0]);
                  const correctEndDate = new Date(startDate);
                  correctEndDate.setDate(
                    startDate.getDate() + tripForm.value.days - 1
                  );
                  tripForm.value.dateRange = [newDateRange[0], correctEndDate];
                  ElMessage.info(
                    `已调整结束日期为${correctEndDate.toLocaleDateString()}`
                  );
                });
            }, 100);
          }
        }
      },
      { deep: true }
    );

    // ========== 计算属性 ==========

    // 完整的标签映射表
    const tagMapping = {
      // 旅行类型和兴趣
      nature: "自然风光",
      culture: "文化体验", 
      relaxation: "休闲放松",
      food: "美食探索",
      shopping: "购物娱乐",
      nightlife: "夜生活",
      adventure: "冒险体验",
      photography: "摄影打卡",
      history: "历史古迹",
      art: "艺术文化",
      sports: "运动健身",
      family: "亲子出游",
      couple: "情侣出行",
      solo: "独行",
      group: "团体出行",
      luxury: "奢华体验",
      budget: "经济实惠",
      local_life: "体验当地生活",
      festivals: "节庆活动",
      beaches: "海滩度假",
      mountains: "山景",
      cities: "城市探索",
      countryside: "乡村体验",
      
      // 常见的英文标签（从Preferences页面可能传来的）
      historical: "历史文化",
      urban: "都市风情",
      heavy: "深度体验",
      cultural: "文化探索",
      modern: "现代都市",
      traditional: "传统文化",
      scenic: "风景名胜",
      entertainment: "娱乐休闲",
      wellness: "健康养生",
      
      // 交通偏好
      walk: "步行出行",
      walking: "步行",
      bicycle: "骑行",
      bike: "骑行",
      public_transport: "公共交通",
      public: "公共交通",
      taxi: "打车出行",
      car: "自驾",
      metro: "地铁",
      bus: "公交",
      
      // 住宿类型
      hotel: "酒店住宿",
      hostel: "青旅住宿", 
      apartment: "公寓民宿",
      bnb: "民宿体验",
      resort: "度假村",
      guesthouse: "客栈",
      comfort: "舒适便利",
      luxury: "豪华奢华",
      budget: "经济实惠",
      
      // 旅行节奏
      slow: "慢节奏",
      medium: "适中节奏",
      fast: "快节奏",
      relaxed: "轻松休闲",
      moderate: "适中节奏",
      intensive: "紧凑高效",
      
      // 美食偏好
      local_cuisine: "当地菜系",
      international: "国际美食",
      street_food: "街头小吃",
      fine_dining: "精品餐厅",
      vegetarian: "素食主义",
      spicy: "嗜辣",
      sweet: "甜食爱好",
      seafood: "海鲜",
      meat: "肉食",
      healthy: "健康饮食",
      
      // 活动类型
      outdoor: "户外活动",
      indoor: "室内活动",
      water_sports: "水上运动",
      extreme_sports: "极限运动",
      sightseeing: "观光游览",
      museum: "博物馆",
      temple: "寺庙古迹",
      park: "公园",
      market: "市场集市",
      
      // 季节偏好
      spring: "春季",
      summer: "夏季",
      autumn: "秋季",
      winter: "冬季",
      
      // 其他常见标签
      romantic: "浪漫",
      peaceful: "宁静",
      bustling: "热闹",
      unique: "独特",
      popular: "热门",
      hidden: "小众",
      instagram: "网红打卡",
      local: "当地特色"
    };

    // 计算用户偏好标签的中文显示
    const selectedPreferenceTags = computed(() => {
      if (!userPreferences.value) return [];
      const tags = [];

      // 从旅行类型标签中提取并转换为中文
      if (userPreferences.value.selectedTags?.length > 0) {
        userPreferences.value.selectedTags.forEach((tag) => {
          const chineseTag = tagMapping[tag] || tag;
          tags.push(chineseTag);
        });
      }

      // 从交通偏好中提取中文标签
      if (userPreferences.value.selectedTransports?.length > 0) {
        userPreferences.value.selectedTransports.forEach((transport) => {
          const chineseTag = tagMapping[transport];
          if (chineseTag) {
            tags.push(chineseTag);
          }
        });
      }

      // 从其他偏好中提取标签
      if (userPreferences.value.accommodationType) {
        const chineseTag = tagMapping[userPreferences.value.accommodationType];
        if (chineseTag) {
          tags.push(chineseTag);
        }
      }

      // 从旅行节奏中提取标签
      if (userPreferences.value.travelPace) {
        const chineseTag = tagMapping[userPreferences.value.travelPace];
        if (chineseTag) {
          tags.push(chineseTag);
        }
      }

      // 从美食偏好中提取标签
      if (userPreferences.value.foodTastes?.length > 0) {
        userPreferences.value.foodTastes.forEach((taste) => {
          const chineseTag = tagMapping[taste] || taste;
          tags.push(chineseTag);
        });
      }

      return [...new Set(tags)].slice(0, 15);
    });

    // 根据用户偏好推荐行程风格
    const recommendedTripStyle = computed(() => {
      if (!userPreferences.value?.selectedTags?.length) return null;
      
      const tags = userPreferences.value.selectedTags;
      
      // 文化体验相关标签
      if (tags.some(tag => ['culture', 'history', 'art', 'historical', 'cultural', 'traditional'].includes(tag))) {
        return 'cultural';
      }
      
      // 冒险相关标签
      if (tags.some(tag => ['adventure', 'sports', 'outdoor', 'extreme_sports'].includes(tag))) {
        return 'adventure';
      }
      
      // 休闲相关标签
      if (tags.some(tag => ['relaxation', 'wellness', 'peaceful', 'beaches'].includes(tag))) {
        return 'relaxation';
      }
      
      // 默认推荐探索
      return 'exploration';
    });

    // 根据用户偏好推荐体验重点
    const recommendedFocusAreas = computed(() => {
      if (!userPreferences.value?.selectedTags?.length) return [];
      
      const tags = userPreferences.value.selectedTags;
      const recommendations = [];
      
      if (tags.some(tag => ['culture', 'history', 'art', 'historical', 'cultural'].includes(tag))) {
        recommendations.push('local_culture', 'historical_sites');
      }
      
      if (tags.some(tag => ['food', 'local_cuisine', 'street_food'].includes(tag))) {
        recommendations.push('food_experience');
      }
      
      if (tags.some(tag => ['nature', 'mountains', 'scenic', 'outdoor'].includes(tag))) {
        recommendations.push('natural_scenery');
      }
      
      if (tags.some(tag => ['cities', 'urban', 'modern', 'shopping'].includes(tag))) {
        recommendations.push('urban_life', 'modern_attractions');
      }
      
      return recommendations;
    });

    // 根据用户偏好推荐特殊体验
    const recommendedSpecialExperiences = computed(() => {
      if (!userPreferences.value?.selectedTags?.length) return [];
      
      const tags = userPreferences.value.selectedTags;
      const recommendations = [];
      
      if (tags.some(tag => ['photography', 'instagram'].includes(tag))) {
        recommendations.push('photography');
      }
      
      if (tags.some(tag => ['local_life', 'culture', 'traditional'].includes(tag))) {
        recommendations.push('local_events', 'workshops');
      }
      
      if (tags.some(tag => ['art', 'culture'].includes(tag))) {
        recommendations.push('performances');
      }
      
      if (tags.some(tag => ['hidden', 'unique'].includes(tag))) {
        recommendations.push('hidden_gems');
      }
      
      return recommendations;
    });

    // 智能推荐：推荐活动强度
    const recommendedIntensity = computed(() => {
      if (!userPreferences.value?.travelPace) return null;
      
      const pace = userPreferences.value.travelPace;
      const paceMapping = {
        'slow': 'relaxed',
        'medium': 'moderate', 
        'fast': 'intensive',
        'relaxed': 'relaxed',
        'moderate': 'moderate',
        'intensive': 'intensive',
        'leisurely': 'relaxed',
        'balanced': 'moderate',
        'packed': 'intensive'
      };
      
      return paceMapping[pace] || 'moderate';
    });

    // 获取活动强度描述
    const getIntensityDescription = (intensity) => {
      const days = tripForm.value.days;
      const descriptions = {
        relaxed: {
          short: '每天2-3个景点',
          medium: '每天1-2个景点',
          long: '每天0-1个景点，更多自由时间'
        },
        moderate: {
          short: '每天3-4个景点',
          medium: '每天2-3个景点',
          long: '每天1-2个景点，张弛有度'
        },
        intensive: {
          short: '每天4-5个景点',
          medium: '每天3-4个景点',
          long: '每天2-3个景点，充实体验'
        }
      };

      if (days <= 7) return descriptions[intensity]?.short || '';
      if (days <= 30) return descriptions[intensity]?.medium || '';
      return descriptions[intensity]?.long || '';
    };

    // ========== 表单验证和日期处理 ==========

    // 获取日期范围的实际天数
    const getActualDays = computed(() => {
      if (!tripForm.value.dateRange || tripForm.value.dateRange.length !== 2) {
        return 0;
      }
      const startDate = new Date(tripForm.value.dateRange[0]);
      const endDate = new Date(tripForm.value.dateRange[1]);
      return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    });

    // 改进的canProceed计算
    const canProceed = computed(() => {
      switch (currentStep.value) {
        case 0: // 基本信息步骤
          return (
            tripForm.value.destination &&
            tripForm.value.days &&
            tripForm.value.dateRange?.length === 2 &&
            tripForm.value.travelers &&
            tripForm.value.budget
          );

        case 1: // 个性化偏好步骤
          return tripForm.value.destination; // 基本信息已填写即可

        case 2: // AI生成步骤
          return true; // 可以随时进入生成步骤

        case 3: // 预览调整步骤
          return generatedTrip.value !== null;

        default:
          return false;
      }
    });

    // 步骤特定的验证计算属性
    const canProceedToStep2 = computed(() => {
      return (
        tripForm.value.destination &&
        tripForm.value.days &&
        tripForm.value.dateRange?.length === 2 &&
        tripForm.value.travelers &&
        tripForm.value.budget
      );
    });

    const canProceedToStep3 = computed(() => {
      return canProceedToStep2.value; // 基本信息填写完整即可
    });

    const canGenerateTrip = computed(() => {
      return (
        tripForm.value.destination &&
        tripForm.value.days &&
        tripForm.value.travelers
      );
    });

    // 方法
    const loadUserPreferences = async () => {
      try {
        console.log("🔄 开始加载用户偏好...");
        
        // 首先尝试从API获取（如果用户已登录）
        if (userStore.currentUser?.id) {
          console.log("🔄 从API获取用户偏好...");

          try {
            const response = await userApi.getUserPreferences(
              userStore.currentUser.id
            );

            console.log("📡 API响应数据:", response);

            if (response && response.data) {
              const apiData = response.data;
              
              // 兼容不同的API响应格式
              const preferences = apiData.preferences || apiData;

              // 更完整地设置用户偏好数据
              userPreferences.value = {
                selectedTags: preferences.selectedTags || preferences.travelTypes || [],
                selectedTransports: preferences.selectedTransports || preferences.transportPreferences || [],
                accommodationType: preferences.accommodationType || preferences.accommodation || "",
                travelPace: preferences.travelPace || preferences.pace || "",
                foodTastes: preferences.foodTastes || preferences.foodPreferences || [],
                otherPreferences: preferences.otherPreferences || [],
                budget: preferences.budget || apiData.budget || "",
                // 添加可能遗漏的字段
                activities: preferences.activities || [],
                specialInterests: preferences.specialInterests || [],
                travelStyle: preferences.travelStyle || "",
                seasonPreference: preferences.seasonPreference || "",
              };

              console.log("✅ 从API加载用户偏好成功:", userPreferences.value);

              // 根据用户偏好自动设置预算（只在用户未设置时）
              if (budgetRecommendation.value && !tripForm.value.budget) {
                tripForm.value.budget = budgetRecommendation.value;
                console.log("🎯 自动设置预算:", budgetRecommendation.value);
              }

              // 根据偏好自动设置行程强度（只在用户未手动选择时）
              if (preferences.travelPace && !preferenceForm.value.intensity) {
                const paceMapping = {
                  slow: "relaxed",
                  medium: "moderate", 
                  fast: "intensive",
                  relaxed: "relaxed",
                  moderate: "moderate",
                  intensive: "intensive"
                };
                if (paceMapping[preferences.travelPace]) {
                  preferenceForm.value.intensity = paceMapping[preferences.travelPace];
                  console.log("🎯 自动设置行程强度:", preferenceForm.value.intensity);
                }
              }

              // 根据偏好自动设置行程风格
              if (preferences.travelStyle && !preferenceForm.value.tripStyle) {
                preferenceForm.value.tripStyle = preferences.travelStyle;
                console.log("🎯 自动设置行程风格:", preferenceForm.value.tripStyle);
              }

              return;
            }
          } catch (apiError) {
            console.warn("⚠️ API获取偏好失败，降级到其他方式:", apiError.message);
          }
        }

        // 降级策略1：从userStore获取
        if (userStore.currentUser?.preferences) {
          console.log("🔄 从userStore获取用户偏好...");
          try {
            const prefsString = userStore.currentUser.preferences;
            const parsed = typeof prefsString === "string" ? JSON.parse(prefsString) : prefsString;

            userPreferences.value = {
              selectedTags: parsed.selectedTags || parsed.travelTypes || [],
              selectedTransports: parsed.selectedTransports || parsed.transportPreferences || [],
              accommodationType: parsed.accommodationType || parsed.accommodation || "",
              travelPace: parsed.travelPace || parsed.pace || "",
              foodTastes: parsed.foodTastes || parsed.foodPreferences || [],
              otherPreferences: parsed.otherPreferences || [],
              budget: parsed.budget || "",
              activities: parsed.activities || [],
              specialInterests: parsed.specialInterests || [],
              travelStyle: parsed.travelStyle || "",
              seasonPreference: parsed.seasonPreference || "",
            };

            console.log("✅ 从userStore加载偏好成功:", userPreferences.value);
            return;
          } catch (error) {
            console.warn("⚠️ userStore偏好解析失败:", error.message);
          }
        }

        // 降级策略2：从localStorage获取
        console.log("🔄 从localStorage获取用户偏好...");
        loadFromLocalStorage();
      } catch (error) {
        console.error("❌ 加载用户偏好失败:", error);
        // 保持默认的空对象结构，不影响页面正常使用
      }
    };

    // 从localStorage加载偏好数据
    const loadFromLocalStorage = () => {
      try {
        const savedPrefs = localStorage.getItem("userPreferences");
        if (savedPrefs) {
          const parsed = JSON.parse(savedPrefs);
          userPreferences.value = {
            selectedTags: parsed.selectedTags || parsed.travelTypes || [],
            selectedTransports: parsed.selectedTransports || parsed.transportPreferences || [],
            accommodationType: parsed.accommodationType || parsed.accommodation || "",
            travelPace: parsed.travelPace || parsed.pace || "",
            foodTastes: parsed.foodTastes || parsed.foodPreferences || [],
            otherPreferences: parsed.otherPreferences || [],
            budget: parsed.budget || "",
            activities: parsed.activities || [],
            specialInterests: parsed.specialInterests || [],
            travelStyle: parsed.travelStyle || "",
            seasonPreference: parsed.seasonPreference || "",
          };
          console.log("✅ 从本地存储加载偏好成功:", userPreferences.value);
        } else {
          console.log("⚠️ 本地存储中没有找到偏好数据");
        }
      } catch (error) {
        console.error("❌ 从本地存储加载失败:", error);
        // 保持默认的空对象结构
      }
    };

    const disabledDate = (time) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 禁用今天之前的日期
      if (time.getTime() < today.getTime()) {
        return true;
      }

      // 禁用超过两年后的日期（支持长期旅居）
      const twoYearsLater = new Date();
      twoYearsLater.setFullYear(today.getFullYear() + 2);
      if (time.getTime() > twoYearsLater.getTime()) {
        return true;
      }

      // 如果已选择天数但还没有选择日期，不限制（让用户自由选择开始日期）
      if (
        tripForm.value.days &&
        (!tripForm.value.dateRange || tripForm.value.dateRange.length === 0)
      ) {
        return false;
      }

      // 如果已选择开始日期且设定了天数，限制结束日期范围
      if (
        tripForm.value.days &&
        tripForm.value.dateRange &&
        tripForm.value.dateRange.length === 1
      ) {
        const startDate = new Date(tripForm.value.dateRange[0]);
        startDate.setHours(0, 0, 0, 0);

        const timeDiff = Math.ceil(
          (time.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // 只允许选择符合天数的日期范围（0到days-1天后）
        if (timeDiff < 0 || timeDiff >= tripForm.value.days) {
          return true;
        }
      }

      // 如果已选择完整日期范围，且用户重新选择，根据新的第一个日期限制第二个日期
      if (
        tripForm.value.days &&
        tripForm.value.dateRange &&
        tripForm.value.dateRange.length === 2
      ) {
        // 允许重新选择，当用户点击时会清空原有选择
        return false;
      }

      return false;
    };

    const getSelectedCityName = () => {
      if (
        !tripForm.value ||
        !tripForm.value.destination ||
        !availableCities.value
      ) {
        return "未选择";
      }
      const city = availableCities.value.find(
        (c) => c.code === tripForm.value.destination
      );
      return city ? city.name : "未选择";
    };

    const getEstimatedCost = () => {
      if (
        !tripForm.value ||
        !tripForm.value.budget ||
        !tripForm.value.days ||
        !tripForm.value.travelers
      ) {
        return "计算中...";
      }

      const budgetMap = {
        budget: 400,
        moderate: 750,
        luxury: 1500,
      };
      const dailyBudget = budgetMap[tripForm.value.budget] || 750;
      const totalCost =
        dailyBudget * tripForm.value.days * tripForm.value.travelers;
      return `约 ¥${totalCost.toLocaleString()}`;
    };

    // 获取纯数字格式的预算（用于API调用）
    const getEstimatedCostNumber = () => {
      if (
        !tripForm.value ||
        !tripForm.value.budget ||
        !tripForm.value.days ||
        !tripForm.value.travelers
      ) {
        return 0;
      }

      const budgetMap = {
        budget: 400,
        moderate: 750,
        luxury: 1500,
      };
      const dailyBudget = budgetMap[tripForm.value.budget] || 750;
      return dailyBudget * tripForm.value.days * tripForm.value.travelers;
    };

    const formatDayDate = (dayIndex) => {
      if (
        !tripForm.value ||
        !tripForm.value.dateRange ||
        tripForm.value.dateRange.length !== 2
      ) {
        return `第${dayIndex + 1}天`;
      }

      try {
        const startDate = new Date(tripForm.value.dateRange[0]);
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + dayIndex);

        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();
        const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
        const weekday = weekdays[currentDate.getDay()];

        return `第${dayIndex + 1}天 ${month}月${day}日 (周${weekday})`;
      } catch (error) {
        console.error("日期格式化失败:", error);
        return `第${dayIndex + 1}天`;
      }
    };

    const nextStep = async () => {
      if (currentStep.value < steps.length - 1) {
        currentStep.value++;
      }
    };

    // 上一步
    const prevStep = () => {
      if (currentStep.value > 0) {
        currentStep.value--;
      }
    };

    // previousStep作为prevStep的别名，保持模板兼容性
    const previousStep = prevStep;

    // 跳转到指定步骤
    const goToStep = (step) => {
      if (step >= 0 && step < steps.length) {
        currentStep.value = step;
      }
    };

    // 跳转到偏好设置页面
    const goToPreferences = () => {
      // 跳转到偏好设置页面，并传递返回路径参数
      router.push({
        name: "Preferences",
        query: {
          from: "trip-create", // 标记来源，用于返回时的路由处理
        },
      });
    };

    const openPreferences = () => {
      // 跳转到偏好设置页面，并传递返回路径参数
      router.push({
        name: "Preferences",
        query: {
          returnTo: "/trip/create", // 返回路径
          returnQuery: JSON.stringify(route.query), // 保存当前页面的query参数
        },
      });
    };

    const generateTrip = async () => {
      generating.value = true;
      generationProgress.value = "正在分析您的偏好...";
      progressPercent.value = 0;

      try {
        // 模拟AI生成过程的各个步骤
        const steps = [
          {
            text: "正在分析您的偏好...",
            percent: 10,
            action: () => analyzePreferences(),
          },
          {
            text: "搜索推荐景点...",
            percent: 30,
            action: () => fetchAttractions(),
          },
          {
            text: "筛选优质餐厅...",
            percent: 50,
            action: () => fetchRestaurants(),
          },
          {
            text: "规划最佳路线...",
            percent: 70,
            action: () => optimizeRoute(),
          },
          {
            text: "生成完整行程...",
            percent: 90,
            action: () => buildDailyPlan(),
          },
          {
            text: "行程生成完成！",
            percent: 100,
            action: null,
          },
        ];

        let attractions = [];
        let restaurants = [];

        for (const step of steps) {
          generationProgress.value = step.text;
          progressPercent.value = step.percent;

          if (step.action) {
            const result = await step.action();
            if (result?.attractions) attractions = result.attractions;
            if (result?.restaurants) restaurants = result.restaurants;
          }

          // 每步延迟，提供真实的生成体验
          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        // 构建最终行程数据
        generatedTrip.value = {
          attractions,
          restaurants,
          dailyPlan: createOptimizedDailyPlan(attractions, restaurants),
        };

        console.log("🎉 行程生成完成:", generatedTrip.value);
      } catch (error) {
        console.error("❌ 行程生成失败:", error);
        ElMessage.error("行程生成失败，请重试");
        generating.value = false;
        return;
      }

      generating.value = false;
      setTimeout(() => {
        nextStep();
      }, 1000);
    };

    // 分析用户偏好
    const analyzePreferences = async () => {
      console.log("🧠 分析用户偏好中...");
      return Promise.resolve();
    };

    // 获取景点数据
    const fetchAttractions = async () => {
      try {
        console.log("🏛️ 正在获取景点数据...");
        // 使用封装的dataApi获取景点数据
        const response = await dataApi.getAttractionsByCity(
          tripForm.value.destination
        );

        if (response && response.data) {
          const allAttractions = response.data;
          console.log("🏛️ 获取到景点数据:", allAttractions.length, "个景点");

          // 根据用户偏好筛选景点
          const filteredAttractions =
            filterAttractionsByPreferences(allAttractions);

          return { attractions: filteredAttractions };
        } else {
          throw new Error("景点数据格式异常");
        }
      } catch (error) {
        console.error("❌ 获取景点数据失败:", error);
        ElMessage.warning("获取景点数据失败，使用模拟数据");

        // 如果API失败，使用模拟数据
        return { attractions: generateMockAttractions() };
      }
    };

    // 获取餐厅数据
    const fetchRestaurants = async () => {
      try {
        console.log("🍽️ 正在获取餐厅数据...");
        // 使用封装的dataApi获取餐厅数据
        const response = await dataApi.getRestaurantsByCity(
          tripForm.value.destination
        );

        if (response && response.data) {
          const allRestaurants = response.data;
          console.log("🍽️ 获取到餐厅数据:", allRestaurants.length, "家餐厅");

          // 根据用户偏好筛选餐厅
          const filteredRestaurants =
            filterRestaurantsByPreferences(allRestaurants);

          return { restaurants: filteredRestaurants };
        } else {
          throw new Error("餐厅数据格式异常");
        }
      } catch (error) {
        console.error("❌ 获取餐厅数据失败:", error);
        ElMessage.warning("获取餐厅数据失败，使用模拟数据");

        // 如果API失败，使用模拟数据
        return { restaurants: generateMockRestaurants() };
      }
    };

    // 优化路线
    const optimizeRoute = async () => {
      console.log("🗺️ 优化路线中...");
      // 这里可以添加路线优化算法
      return Promise.resolve();
    };

    // 构建每日计划
    const buildDailyPlan = async () => {
      console.log("📅 构建每日计划中...");
      return Promise.resolve();
    };

    // 根据偏好筛选景点
    const filterAttractionsByPreferences = (attractions) => {
      if (!attractions || attractions.length === 0) return [];

      let filtered = [...attractions];

      // 根据预算筛选
      if (tripForm.value.budget === "budget") {
        filtered = filtered.filter(
          (attr) => (attr.price || attr.pricePerPerson || 0) <= 100
        );
      } else if (tripForm.value.budget === "luxury") {
        filtered = filtered.filter(
          (attr) => (attr.price || attr.pricePerPerson || 0) >= 50
        );
      }

      // 根据特色体验筛选
      if (preferenceForm.value.extraExperiences.includes("photography")) {
        filtered = filtered.filter((attr) =>
          attr.tags?.some((tag) => ["摄影", "打卡", "景点"].includes(tag))
        );
      }
      if (preferenceForm.value.extraExperiences.includes("local_events")) {
        filtered = filtered.filter((attr) =>
          attr.tags?.some((tag) => ["活动", "节日", "文化"].includes(tag))
        );
      }
      if (preferenceForm.value.extraExperiences.includes("hidden_gems")) {
        filtered = filtered.filter((attr) =>
          attr.tags?.some((tag) => ["小众", "冷门", "独特"].includes(tag))
        );
      }
      if (preferenceForm.value.extraExperiences.includes("seasonal")) {
        filtered = filtered.filter((attr) =>
          attr.tags?.some((tag) => ["季节", "特色", "节日"].includes(tag))
        );
      }

      // 根据用户偏好标签筛选
      if (userPreferences.value?.selectedTags?.length > 0) {
        const userTags = userPreferences.value.selectedTags;
        filtered = filtered.filter((attr) =>
          userTags.some(
            (userTag) =>
              attr.category?.includes(userTag) ||
              attr.tags?.some((tag) => tag.includes(userTag))
          )
        );
      }

      // 根据行程强度决定景点数量
      const maxAttractions =
        {
          relaxed: Math.min(6, tripForm.value.days * 2),
          moderate: Math.min(8, tripForm.value.days * 3),
          intensive: Math.min(12, tripForm.value.days * 4),
        }[preferenceForm.value.intensity] || 8;

      // 按评分和热度排序，取前N个
      filtered.sort((a, b) => {
        const scoreA = (a.rating || 4.0) * (a.popularity || 1);
        const scoreB = (b.rating || 4.0) * (b.popularity || 1);
        return scoreB - scoreA;
      });

      return filtered.slice(0, maxAttractions);
    };

    // 根据偏好筛选餐厅
    const filterRestaurantsByPreferences = (restaurants) => {
      if (!restaurants || restaurants.length === 0) return [];

      let filtered = [...restaurants];

      // 根据预算筛选
      const budgetRanges = {
        budget: [0, 80],
        moderate: [40, 150],
        luxury: [100, 500],
      };
      const [minPrice, maxPrice] = budgetRanges[tripForm.value.budget] || [
        0, 200,
      ];

      filtered = filtered.filter((rest) => {
        const price = rest.pricePerPerson || rest.avgPrice || 100;
        return price >= minPrice && price <= maxPrice;
      });

      // 根据美食偏好筛选
      if (preferenceForm.value.extraExperiences.includes("local_food")) {
        filtered = filtered.filter(
          (rest) =>
            rest.specialty === "本地菜" ||
            rest.tags?.some((tag) => ["本地", "特色", "传统"].includes(tag))
        );
      }

      // 根据用户偏好筛选
      if (userPreferences.value?.foodTastes?.length > 0) {
        const userTastes = userPreferences.value.foodTastes;
        filtered = filtered.filter((rest) =>
          userTastes.some(
            (taste) => rest.cuisine === taste || rest.specialty?.includes(taste)
          )
        );
      }

      // 需要的餐厅数量（每天至少2餐）
      const maxRestaurants = Math.min(8, tripForm.value.days * 2);

      // 按评分排序
      filtered.sort((a, b) => (b.rating || 4.0) - (a.rating || 4.0));

      return filtered.slice(0, maxRestaurants);
    };

    // 生成模拟景点数据（API失败时使用）
    const generateMockAttractions = () => {
      const cityName = getSelectedCityName();
      return Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        name: `${cityName}景点${i + 1}`,
        description: "这是一个很棒的景点，值得一游",
        category: "历史文化",
        rating: 4.0 + Math.random(),
        pricePerPerson: Math.floor(Math.random() * 100) + 20,
        tags: ["必游景点", "历史文化"],
      }));
    };

    // 生成模拟餐厅数据（API失败时使用）
    const generateMockRestaurants = () => {
      const cityName = getSelectedCityName();
      return Array.from({ length: 4 }, (_, i) => ({
        id: i + 1,
        name: `${cityName}特色餐厅${i + 1}`,
        description: "地道美食，口碑很好",
        cuisine: "本地菜",
        rating: 4.0 + Math.random(),
        pricePerPerson: Math.floor(Math.random() * 100) + 50,
        tags: ["当地美食", "高评分"],
      }));
    };

    // 创建优化的每日计划
    const createOptimizedDailyPlan = (attractions, restaurants) => {
      const days = tripForm.value.days;
      const plans = [];

      // 根据行程强度和天数确定每日活动数量
      let dailyIntensity;
      if (days <= 7) {
        // 短期旅行：正常强度
        dailyIntensity = {
          relaxed: { attractions: 2, restaurants: 2 },
          moderate: { attractions: 3, restaurants: 2 },
          intensive: { attractions: 4, restaurants: 2 },
        }[preferenceForm.value.intensity] || { attractions: 3, restaurants: 2 };
      } else if (days <= 30) {
        // 中期旅行：适度降低强度
        dailyIntensity = {
          relaxed: { attractions: 1, restaurants: 2 },
          moderate: { attractions: 2, restaurants: 2 },
          intensive: { attractions: 3, restaurants: 2 },
        }[preferenceForm.value.intensity] || { attractions: 2, restaurants: 2 };
      } else {
        // 长期旅居：低强度，更多自由时间
        dailyIntensity = {
          relaxed: { attractions: 0.5, restaurants: 1 },
          moderate: { attractions: 1, restaurants: 2 },
          intensive: { attractions: 2, restaurants: 2 },
        }[preferenceForm.value.intensity] || { attractions: 1, restaurants: 2 };
      }

      // 分配景点和餐厅到各天
      const attractionsPerDay = Math.max(1, Math.ceil(attractions.length / days));
      const restaurantsPerDay = Math.max(1, Math.ceil(restaurants.length / days));

      for (let dayIndex = 0; dayIndex < days; dayIndex++) {
        const dayAttractions = attractions.slice(
          dayIndex * attractionsPerDay,
          (dayIndex + 1) * attractionsPerDay
        );
        const dayRestaurants = restaurants.slice(
          dayIndex * restaurantsPerDay,
          (dayIndex + 1) * restaurantsPerDay
        );

        const activities = [];

        // 添加上午景点
        if (dayAttractions[0]) {
          activities.push({
            time: "09:00",
            name: dayAttractions[0].name,
            description: dayAttractions[0].description || "精彩景点等你探索",
            tags: dayAttractions[0].tags || ["必游景点"],
            type: "attraction",
            id: dayAttractions[0].id, // 添加id字段
            data: dayAttractions[0],
          });
        }

        // 添加午餐
        if (dayRestaurants[0]) {
          activities.push({
            time: "12:00",
            name: dayRestaurants[0].name,
            description: dayRestaurants[0].description || "美味佳肴等你品尝",
            tags: dayRestaurants[0].tags || ["当地美食"],
            type: "restaurant",
            id: dayRestaurants[0].id, // 添加id字段
            data: dayRestaurants[0],
          });
        }

        // 添加下午景点
        if (dayAttractions[1]) {
          activities.push({
            time: "14:30",
            name: dayAttractions[1].name,
            description: dayAttractions[1].description || "精彩景点等你探索",
            tags: dayAttractions[1].tags || ["必游景点"],
            type: "attraction",
            id: dayAttractions[1].id, // 添加id字段
            data: dayAttractions[1],
          });
        }

        // 添加晚餐
        if (dayRestaurants[1]) {
          activities.push({
            time: "18:00",
            name: dayRestaurants[1].name,
            description: dayRestaurants[1].description || "美味佳肴等你品尝",
            tags: dayRestaurants[1].tags || ["当地美食"],
            type: "restaurant",
            id: dayRestaurants[1].id, // 添加id字段
            data: dayRestaurants[1],
          });
        }

        // 如果是高强度行程，添加更多景点
        if (
          preferenceForm.value.intensity === "intensive" &&
          dayAttractions[2]
        ) {
          activities.push({
            time: "16:00",
            name: dayAttractions[2].name,
            description: dayAttractions[2].description || "精彩景点等你探索",
            tags: dayAttractions[2].tags || ["必游景点"],
            type: "attraction",
            id: dayAttractions[2].id, // 添加id字段
            data: dayAttractions[2],
          });
        }

        plans.push({ activities });
      }

      return plans;
    };

    // 分享行程
    const shareTrip = async () => {
      try {
        const tripData = {
          destination: getSelectedCityName(),
          days: tripForm.value.days,
          travelers: tripForm.value.travelers,
          budget: getBudgetText(),
          attractions: generatedTrip.value.attractions.length,
          restaurants: generatedTrip.value.restaurants.length,
          estimatedCost: getEstimatedCost(),
        };

        const shareText = `我刚刚用GoingTour生成了一个${tripData.destination}${tripData.days}日游行程！包含${tripData.attractions}个景点和${tripData.restaurants}家餐厅，预计花费${tripData.estimatedCost}。一起来看看吧！`;

        if (navigator.share) {
          // 使用原生分享API
          await navigator.share({
            title: `${tripData.destination}${tripData.days}日游 - GoingTour行程`,
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
        ElMessage.error("分享失败，请重试");
      }
    };

    // 导出行程
    const exportTrip = () => {
      try {
        const tripData = {
          title: `${getSelectedCityName()}${tripForm.value.days}日游`,
          destination: getSelectedCityName(),
          days: tripForm.value.days,
          dateRange: tripForm.value.dateRange,
          travelers: tripForm.value.travelers,
          budget: getBudgetText(),
          estimatedCost: getEstimatedCost(),
          preferences: {
            intensity: preferenceForm.value.intensity,
            experiences: preferenceForm.value.extraExperiences,
            transport: preferenceForm.value.tripTransport,
            specialRequests: preferenceForm.value.specialRequests,
          },
          attractions: generatedTrip.value.attractions,
          restaurants: generatedTrip.value.restaurants,
          dailyPlan: generatedTrip.value.dailyPlan,
          generatedAt: new Date().toISOString(),
        };

        // 创建并下载JSON文件
        const dataStr = JSON.stringify(tripData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${getSelectedCityName()}${tripForm.value.days}日游-${new Date().toLocaleDateString()}.json`;
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

    // 预览行程
    const previewTrip = () => {
      const tripSummary = `
${getSelectedCityName()}${tripForm.value.days}日游 - 行程预览

📍 目的地：${getSelectedCityName()}
📅 天数：${tripForm.value.days}天
👥 人数：${tripForm.value.travelers}人
💰 预算：${getBudgetText()}
💵 预计花费：${getEstimatedCost()}

📊 行程概述：
🏛️ 包含景点：${generatedTrip.value.attractions?.length || 0}个
🍽️ 包含餐厅：${generatedTrip.value.restaurants?.length || 0}家

📅 详细安排：
${generatedTrip.value.dailyPlan
  .map(
    (day, index) =>
      `第${index + 1}天 ${formatDayDate(index)}：\n${day.activities
        .map((activity) => `  ${activity.time} - ${activity.name}`)
        .join("\n")}`
  )
  .join("\n\n")}

---
由GoingTour AI智能生成 🤖
      `.trim();

      ElMessageBox.alert(tripSummary, "行程预览", {
        confirmButtonText: "关闭",
        dangerouslyUseHTMLString: false,
        customClass: "trip-preview-dialog",
      });
    };

    // 保存行程（增强版）
    const saveTrip = async () => {
      try {
        await ElMessageBox.confirm(
          "确定要保存这个行程吗？保存后可以在个人中心查看和管理。",
          "保存行程",
          {
            confirmButtonText: "保存",
            cancelButtonText: "取消",
            type: "info",
          }
        );

        // 构建保存的行程数据
        const tripToSave = {
          title: `${getSelectedCityName()}${tripForm.value.days}日游`,
          destination: tripForm.value.destination,
          destinationName: getSelectedCityName(),
          days: tripForm.value.days,
          dateRange: tripForm.value.dateRange,
          travelers: tripForm.value.travelers,
          budget: tripForm.value.budget,
          budgetText: getBudgetText(),
          estimatedCost: getEstimatedCost(),
          preferences: {
            intensity: preferenceForm.value.intensity,
            experiences: preferenceForm.value.extraExperiences,
            transport: preferenceForm.value.tripTransport,
            specialRequests: preferenceForm.value.specialRequests,
          },
          attractions: generatedTrip.value.attractions,
          restaurants: generatedTrip.value.restaurants,
          dailyPlan: generatedTrip.value.dailyPlan,
          status: "draft", // 草稿状态
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // 首先尝试调用后端API保存行程
        try {
          if (userStore.currentUser?.id) {
            const { tripApi } = await import("../../api/trip.js");

            // 使用转换工具将前端数据转换为后端格式
            const tripRequest = convertFrontendTripToBackend(tripToSave);

            console.log("📤 发送到API的数据:", tripRequest); // 调试日志
            console.log("📋 行程详情数据:", tripRequest.tripDetails); // 调试详情数据

            const response = await tripApi.createTrip(
              userStore.currentUser.id,
              tripRequest
            );

            if (response.data) {
              ElMessage.success("行程保存成功！已保存到数据库");
              console.log("💾 API保存行程成功:", response.data);

              // 询问用户是否要继续编辑或查看
              setTimeout(async () => {
                try {
                  await ElMessageBox.confirm(
                    "行程已保存成功！您想要：",
                    "下一步操作",
                    {
                      confirmButtonText: "查看个人中心",
                      cancelButtonText: "继续编辑",
                      type: "success",
                    }
                  );
                  router.push("/personal");
                } catch (error) {
                  // 用户选择继续编辑，不做任何操作
                }
              }, 1000);
              return;
            }
          }
        } catch (apiError) {
          console.warn("⚠️ API保存失败，降级到本地存储:", apiError);
        }

        // 降级到localStorage保存
        const savedTrips = JSON.parse(
          localStorage.getItem("savedTrips") || "[]"
        );
        tripToSave.id = Date.now().toString(); // 临时ID
        savedTrips.push(tripToSave);
        localStorage.setItem("savedTrips", JSON.stringify(savedTrips));

        ElMessage.success("行程保存成功！已保存到个人中心");

        // 询问用户是否要继续编辑或查看
        setTimeout(async () => {
          try {
            await ElMessageBox.confirm(
              "行程已保存成功！您想要：",
              "下一步操作",
              {
                confirmButtonText: "查看个人中心",
                cancelButtonText: "继续编辑",
                type: "success",
              }
            );
            router.push("/personal");
          } catch (error) {
            // 用户选择继续编辑，不做任何操作
          }
        }, 1000);
      } catch (error) {
        if (error !== "cancel") {
          console.error("保存行程失败:", error);
          ElMessage.error("保存失败，请重试");
        }
      }
    };

    // 替换活动
    const replaceActivity = async (dayIndex, activityIndex) => {
      const currentActivity =
        generatedTrip.value.dailyPlan[dayIndex].activities[activityIndex];

      try {
        if (currentActivity.type === "attraction") {
          await replaceWithAlternativeAttraction(
            dayIndex,
            activityIndex,
            currentActivity
          );
        } else if (currentActivity.type === "restaurant") {
          await replaceWithAlternativeRestaurant(
            dayIndex,
            activityIndex,
            currentActivity
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
      activityIndex,
      currentActivity
    ) => {
      try {
        // 获取备选景点（排除已选的）
        const usedAttractionIds = generatedTrip.value.attractions.map(
          (attr) => attr.id
        );
        const response = await fetch(
          `http://localhost:8080/api/attractions/city/${tripForm.value.destination}`
        );

        if (response.ok) {
          const allAttractions = await response.json();
          const alternatives = (allAttractions.data || allAttractions)
            .filter((attr) => !usedAttractionIds.includes(attr.id))
            .slice(0, 5); // 最多5个备选

          if (alternatives.length === 0) {
            ElMessage.warning("暂无其他景点可供替换");
            return;
          }

          // 让用户选择替换的景点
          const { value: selectedAttr } = await ElMessageBox.prompt(
            "请选择要替换的景点：\n" +
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
              inputErrorMessage: "请输入1-5之间的数字",
            }
          );

          const chosenIndex = parseInt(selectedAttr) - 1;
          if (chosenIndex >= 0 && chosenIndex < alternatives.length) {
            const newAttraction = alternatives[chosenIndex];

            // 更新活动
            generatedTrip.value.dailyPlan[dayIndex].activities[activityIndex] =
              {
                time: currentActivity.time,
                name: newAttraction.name,
                description: newAttraction.description || "精彩景点等你探索",
                tags: newAttraction.tags || ["推荐景点"],
                type: "attraction",
                data: newAttraction,
              };

            // 更新景点列表
            const originalIndex = generatedTrip.value.attractions.findIndex(
              (attr) => attr.id === currentActivity.data.id
            );
            if (originalIndex !== -1) {
              generatedTrip.value.attractions[originalIndex] = newAttraction;
            }

            ElMessage.success(`已替换为：${newAttraction.name}`);
          }
        } else {
          ElMessage.error("获取备选景点失败");
        }
      } catch (error) {
        if (error === "cancel") return; // 用户取消
        console.error("替换景点失败:", error);
        ElMessage.error("替换失败，请重试");
      }
    };

    // 替换餐厅
    const replaceWithAlternativeRestaurant = async (
      dayIndex,
      activityIndex,
      currentActivity
    ) => {
      try {
        // 获取备选餐厅
        const usedRestaurantIds = generatedTrip.value.restaurants.map(
          (rest) => rest.id
        );
        const response = await fetch(
          `http://localhost:8080/api/restaurants/city/${tripForm.value.destination}`
        );

        if (response.ok) {
          const allRestaurants = await response.json();
          const alternatives = (allRestaurants.data || allRestaurants)
            .filter((rest) => !usedRestaurantIds.includes(rest.id))
            .slice(0, 5); // 最多5个备选

          if (alternatives.length === 0) {
            ElMessage.warning("暂无其他餐厅可供替换");
            return;
          }

          // 让用户选择替换的餐厅
          const { value: selectedRest } = await ElMessageBox.prompt(
            "请选择要替换的餐厅：\n" +
              alternatives
                .map(
                  (rest, i) =>
                    `${i + 1}. ${rest.name} - ${rest.description || "美味佳肴"}`
                )
                .join("\n"),
            "选择替换餐厅",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              inputPattern: /^[1-5]$/,
              inputErrorMessage: "请输入1-5之间的数字",
            }
          );

          const chosenIndex = parseInt(selectedRest) - 1;
          if (chosenIndex >= 0 && chosenIndex < alternatives.length) {
            const newRestaurant = alternatives[chosenIndex];

            // 更新活动
            generatedTrip.value.dailyPlan[dayIndex].activities[activityIndex] =
              {
                time: currentActivity.time,
                name: newRestaurant.name,
                description: newRestaurant.description || "美味佳肴等你品尝",
                tags: newRestaurant.tags || ["推荐餐厅"],
                type: "restaurant",
                data: newRestaurant,
              };

            // 更新餐厅列表
            const originalIndex = generatedTrip.value.restaurants.findIndex(
              (rest) => rest.id === currentActivity.data.id
            );
            if (originalIndex !== -1) {
              generatedTrip.value.restaurants[originalIndex] = newRestaurant;
            }

            ElMessage.success(`已替换为：${newRestaurant.name}`);
          }
        } else {
          ElMessage.error("获取备选餐厅失败");
        }
      } catch (error) {
        if (error === "cancel") return; // 用户取消
        console.error("替换餐厅失败:", error);
        ElMessage.error("替换失败，请重试");
      }
    };

    // 删除活动
    const removeActivity = async (dayIndex, activityIndex) => {
      try {
        const activity =
          generatedTrip.value.dailyPlan[dayIndex].activities[activityIndex];

        await ElMessageBox.confirm(
          `确定要删除"${activity.name}"吗？删除后该时间段将变为空闲时间。`,
          "删除活动",
          {
            confirmButtonText: "确定删除",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        // 从每日计划中删除活动
        generatedTrip.value.dailyPlan[dayIndex].activities.splice(
          activityIndex,
          1
        );

        // 从对应的景点或餐厅列表中删除
        if (activity.type === "attraction") {
          const attractionIndex = generatedTrip.value.attractions.findIndex(
            (attr) => attr.id === activity.data.id
          );
          if (attractionIndex !== -1) {
            generatedTrip.value.attractions.splice(attractionIndex, 1);
          }
        } else if (activity.type === "restaurant") {
          const restaurantIndex = generatedTrip.value.restaurants.findIndex(
            (rest) => rest.id === activity.data.id
          );
          if (restaurantIndex !== -1) {
            generatedTrip.value.restaurants.splice(restaurantIndex, 1);
          }
        }

        ElMessage.success("活动已删除");
      } catch (error) {
        // 用户取消删除
      }
    };

    // 生命周期钩子
    onMounted(async () => {
      console.log("🚀 TripCreate组件挂载");

      // 添加键盘事件监听器
      document.addEventListener("keydown", handleKeydown);

      // 并行加载数据
      await Promise.all([loadAvailableCities(), loadUserPreferences()]);

      // 处理路由参数（从Destinations页面传递的城市选择）
      if (route.query.city && route.query.cityName) {
        console.log(
          "📍 从路由获取城市参数:",
          route.query.city,
          route.query.cityName
        );
        tripForm.value.destination = route.query.city;

        // 验证城市是否在可用列表中
        const cityExists = availableCities.value.find(
          (c) => c.code === route.query.city
        );
        if (!cityExists && availableCities.value.length > 0) {
          console.warn("⚠️ 路由中的城市不在可用列表中，将添加到列表");
          availableCities.value.push({
            code: route.query.city,
            name: route.query.cityName,
            description: "从目的地页面选择",
          });
        }
      }

      console.log("✅ TripCreate组件初始化完成");
    });

    // 组件卸载时清理事件监听器
    onUnmounted(() => {
      document.removeEventListener("keydown", handleKeydown);
    });

    // 快速选择天数
    const selectQuickDays = (days) => {
      tripForm.value.days = days;
      handleDaysChange(days);
    };

    // 获取天数描述
    const getDaysDescription = () => {
      const days = tripForm.value.days;
      if (!days) return '';
      
      if (days === 1) return '当日往返，短途游览';
      if (days <= 3) return '短途旅行，周末休闲';
      if (days <= 7) return '一周以内，深度游览';
      if (days <= 14) return '两周行程，充分探索';
      if (days <= 30) return '一个月旅行，深度体验';
      if (days <= 90) return '长期旅居，季度体验';
      if (days <= 180) return '半年旅居，深度融入';
      return '长期旅居，生活体验';
    };

    // 处理天数变化
    const handleDaysChange = (newDays) => {
      console.log(`天数变更为: ${newDays}天`);

      // 验证天数范围
      if (newDays && (newDays < 1 || newDays > 365)) {
        ElMessage.warning('天数应在1-365天之间');
        return;
      }

      // 如果已有日期范围，提示用户是否调整
      if (tripForm.value.dateRange?.length === 2) {
        const actualDays = getActualDays.value;
        if (actualDays !== newDays) {
          ElMessageBox.confirm(
            `您当前选择的日期为${actualDays}天，但刚设定为${newDays}天。是否要调整日期以匹配新的天数？`,
            "日期与天数不匹配",
            {
              confirmButtonText: "调整日期",
              cancelButtonText: "保持现有日期",
              type: "warning",
            }
          )
            .then(() => {
              adjustDatesToMatchDays();
            })
            .catch(() => {
              ElMessage.info("已保持现有日期，请注意日期与天数的差异");
            });
        }
      } else if (newDays) {
        // 根据天数给出不同的提示
        if (newDays <= 30) {
          ElMessage.info(
            `已选择${newDays}天行程，您可点击"自动设定日期"快速设定从今天开始的日期`
          );
        } else {
          ElMessage.info(
            `已选择${newDays}天长期旅居，建议合理安排出行时间`
          );
        }
      }
    };

    // 编辑活动（暂时简单实现）
    const editActivity = async (dayIndex, activityIndex) => {
      ElMessage.info("编辑功能暂未实现，请使用替换功能");
    };

    // 添加活动（暂时简单实现）
    const addActivity = async (dayIndex) => {
      ElMessage.info("添加活动功能暂未实现");
    };

    // 图片加载错误状态
    const imageErrors = ref({});

    // 开发者面板状态
    const showDevPanel = ref(false);
    const preferencesStatus = ref(null);

    // 城市信息相关状态
    const cityInfo = ref(null);
    const loadingCityInfo = ref(false);

    // 城市特色信息数据库
    const cityInfoDatabase = {
      beijing: {
        name: "北京",
        description: "千年古都，文化底蕴深厚",
        highlights: ["故宫", "长城", "天坛", "颐和园", "胡同文化"],
        specialties: ["北京烤鸭", "炸酱面", "豆汁", "驴打滚"],
        bestSeasons: ["春季(3-5月)", "秋季(9-11月)"],
        transportation: ["地铁发达", "公交便利", "共享单车"],
        culturalFeatures: ["皇家建筑", "传统文化", "现代都市"],
        foodScene: ["老字号餐厅", "胡同小吃", "高端餐厅"],
        nightlife: ["三里屯", "后海", "王府井"],
        shopping: ["王府井", "西单", "前门大街"],
        tips: ["春秋最佳旅游季节", "故宫需要提前预约", "地铁出行最便利"]
      },
      shanghai: {
        name: "上海",
        description: "国际化大都市，东西文化交汇",
        highlights: ["外滩", "东方明珠", "豫园", "田子坊", "新天地"],
        specialties: ["小笼包", "生煎包", "白切鸡", "红烧肉"],
        bestSeasons: ["春季(3-5月)", "秋季(9-11月)"],
        transportation: ["地铁网络完善", "磁悬浮列车", "黄浦江轮渡"],
        culturalFeatures: ["海派文化", "国际化氛围", "历史租界"],
        foodScene: ["本帮菜", "国际美食", "网红餐厅"],
        nightlife: ["新天地", "外滩", "衡山路"],
        shopping: ["南京路", "淮海路", "人民广场"],
        tips: ["避开梅雨季节", "外滩夜景最美", "地铁是最佳交通方式"]
      }
    };

    // 图片错误处理方法
    const handleImageError = (cityCode) => {
      imageErrors.value[cityCode] = true;
      console.warn(`图片加载失败: ${cityCode}`);
    };

    // 设置测试用户
    const setTestUser = (userId) => {
      userStore.setTestUser(userId);
      // 重新加载用户偏好
      loadUserPreferences();
    };

    // 测试偏好API
    const testPreferencesAPI = async () => {
      if (!userStore.currentUser?.id) {
        ElMessage.error("请先设置测试用户");
        return;
      }

      try {
        ElMessage.info("正在测试偏好API...");
        await loadUserPreferences();
        ElMessage.success("偏好API测试成功！请查看控制台日志");
      } catch (error) {
        ElMessage.error(`偏好API测试失败: ${error.message}`);
      }
    };

    // 检查偏好状态
    const checkPreferencesStatus = async () => {
      if (!userStore.currentUser?.id) {
        ElMessage.error("请先设置测试用户");
        return;
      }

      try {
        ElMessage.info("正在检查偏好状态...");
        const completed = await userStore.checkPreferencesCompleted();
        preferencesStatus.value = completed;

        ElMessage.success(`偏好状态: ${completed ? "已完成" : "未完成"}`);
      } catch (error) {
        ElMessage.error(`检查偏好状态失败: ${error.message}`);
        preferencesStatus.value = null;
      }
    };

    // 监听键盘事件以显示开发者面板
    const handleKeydown = (event) => {
      // Ctrl+Shift+D 显示开发者面板
      if (event.ctrlKey && event.shiftKey && event.key === "D") {
        event.preventDefault();
        showDevPanel.value = !showDevPanel.value;
        ElMessage.info(
          showDevPanel.value ? "开发者面板已打开" : "开发者面板已关闭"
        );
      }
    };

    // 自动设定日期（从今天开始）
    const autoSetDatesFromToday = () => {
      if (!tripForm.value.days) return;

      const today = new Date();
      const startDate = new Date(today);
      const endDate = new Date(today);
      endDate.setDate(startDate.getDate() + tripForm.value.days - 1);

      tripForm.value.dateRange = [startDate, endDate];

      ElMessage.success(
        `已自动设定日期：${startDate.toLocaleDateString()} 至 ${endDate.toLocaleDateString()}`
      );

      // 重新验证表单
      nextTick(() => {
        tripFormRef.value?.validateField("dateRange");
      });
    };

    // 调整日期以匹配天数
    const adjustDatesToMatchDays = () => {
      if (!tripForm.value.days || !tripForm.value.dateRange?.length) return;

      const startDate = new Date(tripForm.value.dateRange[0]);
      const newEndDate = new Date(startDate);
      newEndDate.setDate(startDate.getDate() + tripForm.value.days - 1);

      tripForm.value.dateRange = [startDate, newEndDate];

      ElMessage.success(`已调整结束日期为：${newEndDate.toLocaleDateString()}`);

      // 重新验证表单
      nextTick(() => {
        tripFormRef.value?.validateField("dateRange");
      });
    };

    // 格式化日期范围显示
    const formatDateRange = () => {
      if (!tripForm.value.dateRange || tripForm.value.dateRange.length !== 2) {
        return "未设置";
      }
      const startDate = new Date(tripForm.value.dateRange[0]);
      const endDate = new Date(tripForm.value.dateRange[1]);
      return `${startDate.toLocaleDateString()} 至 ${endDate.toLocaleDateString()}`;
    };

    return {
      // 基础状态
      currentStep,
      steps,
      generating,
      generationProgress,
      progressPercent,

      // 表单数据
      tripForm,
      preferenceForm,
      tripFormRef,

      // 数据和状态
      availableCities,
      loadingCities,
      userPreferences,
      generatedTrip,

      // 计算属性
      selectedPreferenceTags,
      budgetRecommendation,
      recommendedTripStyle,
      recommendedFocusAreas,
      recommendedSpecialExperiences,
      getActualDays,
      canProceedToStep2,
      canProceedToStep3,
      canGenerateTrip,
      canProceed,

      // 方法
      nextStep,
      prevStep,
      previousStep,
      goToStep,
      loadAvailableCities,
      loadUserPreferences,
      applySmartRecommendations,
      generateTrip,
      editActivity,
      replaceActivity,
      removeActivity,
      addActivity,
      saveTrip,
      shareTrip,
      exportTrip,
      goToPreferences,
      openPreferences: goToPreferences, // 保持模板兼容性

      // 验证
      tripRules,

      // 工具方法
      getSelectedCityName,
      getBudgetText,
      getEstimatedCost,
      getEstimatedCostNumber,

      formatDayDate,

      // 开发者面板相关
      imageErrors,
      showDevPanel,
      handleImageError,
      setTestUser,
      testPreferencesAPI,
      checkPreferencesStatus,
      handleKeydown,
      autoSetDatesFromToday,
      adjustDatesToMatchDays,
      formatDateRange,

      // 预算选项
      budgetOptions,
      selectBudget,
      calculateBudgetPreview,

      // 表单处理
      handleDaysChange,
      handleDateChange,

      // 天数选择相关
      showCustomDaysInput,
      quickDaysOptions,
      selectQuickDays,
      getDaysDescription,

      // 城市信息相关
      cityInfo,
      loadingCityInfo,
      loadCityInfo,
      cityInfoDatabase,
      tagMapping,

      // 个性化偏好相关
      showAdvancedOptions,
      tripStyles,
      focusAreaOptions,
      intensityOptions,
      recommendedIntensity,
      getIntensityDescription,
      budgetRecommendation,
      isRecommendedBudget,
      getBudgetText,
      applyRecommendedBudget,
      isRecommendedFocusArea,
      skipPreferences,
    };
  },
};
</script>

<style scoped>
/* 统一的页面布局 - 与Personal.vue保持一致 */
.trip-create-page {
  position: fixed !important;
  top: 64px !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: calc(100vh - 64px) !important;
  margin: 0 !important;
  padding: 20px !important;
  background: #f7fafc !important;
  overflow-y: auto !important;
  z-index: 1 !important;
}

/* 重置可能影响布局的样式 */
.trip-create-page * {
  box-sizing: border-box !important;
}

/* 内容容器 */
.trip-create-page > * {
  max-width: 1000px !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  margin-top: 60px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-header p {
  font-size: 16px;
  color: #909399;
  margin: 0;
}

.steps-container {
  margin-bottom: 32px;
}

.main-content {
  margin-bottom: 32px;
}

.step-content {
  min-height: 400px;
}

.info-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.city-option {
  display: flex;
  flex-direction: column;
}

.city-desc {
  font-size: 12px;
  color: #909399;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
  margin-left: 10px;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-match {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #67c23a;
  font-size: 12px;
}

.date-mismatch {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #f56c6c;
  font-size: 12px;
}

.date-mismatch .el-button {
  margin-left: 8px;
}

.intensity-option {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}

.intensity-option small {
  color: #909399;
  font-size: 10px;
  margin-top: 1px;
}

.preferences-content h3 {
  color: #303133;
  font-size: 16px;
  margin: 0 0 16px 0;
  font-weight: 500;
}

.current-preferences {
  margin-bottom: 24px;
}

.preference-summary {
  margin: 12px 0;
}

.preference-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.preference-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.preference-note {
  color: #909399;
  font-size: 13px;
}

.no-preferences {
  padding: 40px 20px;
  text-align: center;
}

.section-desc {
  color: #909399;
  font-size: 14px;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.current-preferences h3 {
  color: #303133;
  font-size: 16px;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.generation-content {
  text-align: center;
  padding: 40px 20px;
}

.ready-to-generate h3,
.generating h3,
.generation-complete h3 {
  margin: 16px 0;
  color: #303133;
}

.generation-info {
  margin: 24px 0;
  text-align: left;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.label {
  color: #909399;
}

.value {
  font-weight: 500;
  color: #303133;
}

.rotating {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.trip-preview h3 {
  margin: 0 0 16px 0;
  color: #303133;
}

.trip-preview {
  padding-top: 16px; /* 确保整个预览区域有足够的顶部空间 */
}

.trip-summary {
  margin-bottom: 32px;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-top: 8px; /* 避免被卡片标题遮挡 */
}

.summary-title h3 {
  margin: 0 0 16px 0;
  color: #303133;
}

.summary-stats {
  display: flex;
  gap: 24px;
  margin-top: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
}

.summary-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
  align-items: flex-end; /* 确保按钮右对齐 */
  min-width: 120px; /* 给按钮区域固定宽度 */
}

.summary-actions .el-button {
  width: 120px;
  justify-content: center; /* 按钮内容居中对齐 */
}

.daily-schedule {
  margin-top: 24px;
}

.day-plan {
  margin-bottom: 32px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.day-header {
  background: #f5f7fa;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e4e7ed;
}

.day-header h4 {
  margin: 0;
  color: #303133;
}

.day-date {
  color: #909399;
  font-size: 14px;
}

.day-activities {
  padding: 16px 20px;
}

.activity-item {
  display: flex;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.activity-time {
  width: 80px;
  flex-shrink: 0;
  font-weight: 500;
  color: #409eff;
  font-size: 14px;
}

.activity-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.activity-info h5 {
  margin: 0 0 4px 0;
  color: #303133;
}

.activity-info p {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
}

.activity-tags .el-tag {
  margin-right: 4px;
  font-size: 12px;
}

.activity-actions {
  display: flex;
  gap: 8px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .trip-create-page {
    padding: 15px !important;
  }

  .trip-create-page > * {
    max-width: 100% !important;
    padding: 0 5px !important;
  }

  .summary-stats {
    flex-direction: column;
    gap: 12px;
  }

  .activity-item {
    flex-direction: column;
    gap: 8px;
  }

  .activity-time {
    width: auto;
  }
}

.days-option {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.days-option small {
  color: #909399;
  font-size: 10px;
  margin-top: 5px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .trip-preview-container {
    padding: 12px;
  }

  .preview-actions {
    flex-direction: column;
    gap: 12px;
  }

  .steps-container {
    padding: 16px;
  }

  .form-section {
    padding: 16px;
  }
}

/* 开发者面板样式 */
.dev-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  font-size: 12px;
}

.dev-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.dev-panel-header h4 {
  margin: 0;
  font-size: 14px;
}

.dev-panel-content {
  padding: 16px;
}

.dev-panel .el-button {
  font-size: 11px;
  padding: 4px 8px;
}

.preferences-status {
  margin-top: 16px;
  font-size: 14px;
  color: #606266;
}

.budget-selector {
  display: flex;
  margin: 16px 0;
  width: 100%;
  justify-content: space-around;
}

.budget-card {
  position: relative;
  background: #ffffff;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.budget-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.budget-card.selected {
  border-color: #409eff;
  background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.2);
}

.budget-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: white;
  font-size: 20px;
}

.budget-card.selected .budget-icon {
  background: linear-gradient(135deg, #67c23a, #409eff);
}

.budget-content {
  flex: 1;
}

.budget-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.budget-price {
  font-size: 16px;
  font-weight: 500;
  color: #409eff;
  margin-bottom: 8px;
}

.budget-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.4;
  margin-bottom: 12px;
}

.budget-preview {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 8px 12px;
  margin-top: 12px;
}

.preview-label {
  font-size: 11px;
  color: #909399;
  margin-bottom: 2px;
}

.preview-amount {
  font-size: 14px;
  font-weight: 600;
  color: #e6a23c;
}

.budget-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: #67c23a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

@media (max-width: 768px) {
  .budget-selector {
    grid-template-columns: 1fr;
  }
}

/* 天数选择相关样式 */
.days-input-container {
  width: 100%;
}

.quick-days-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}

.quick-days-buttons .el-button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.quick-days-buttons .el-button-group .el-button {
  margin: 0;
  border-radius: 6px;
  font-size: 13px;
  padding: 8px 16px;
  transition: all 0.3s ease;
}

.quick-days-buttons .el-button-group .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.2);
}

.custom-days-trigger {
  color: #409eff;
  font-size: 13px;
  padding: 4px 8px;
  margin-top: 8px;
}

.custom-days-trigger:hover {
  color: #337ecc;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 4px;
}

.custom-days-input {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.back-to-quick {
  color: #909399;
  font-size: 12px;
  padding: 4px 8px;
}

.back-to-quick:hover {
  color: #606266;
  background: rgba(144, 147, 153, 0.1);
  border-radius: 4px;
}

.days-description {
  margin-top: 8px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%);
  border-radius: 6px;
  border-left: 3px solid #409eff;
}

.days-text {
  color: #409eff;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.days-text::before {
  content: "📅";
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .quick-days-buttons .el-button-group {
    justify-content: center;
  }
  
  .custom-days-input {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .custom-days-input .el-input-number {
    width: 100% !important;
  }
}

/* 城市介绍卡片样式 */
.city-intro-card {
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

.city-intro-content {
  padding: 20px;
}

.city-header {
  margin-bottom: 20px;
}

.city-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.city-title h3 {
  color: #303133;
  font-size: 18px;
  margin: 0;
  font-weight: 600;
}

.city-desc {
  color: #606266;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.city-highlights {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.highlight-item {
  flex: 1;
  min-width: 200px;
}

.highlight-label {
  display: block;
  color: #909399;
  font-size: 12px;
  margin-bottom: 8px;
  font-weight: 500;
}

.highlight-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.highlight-tag {
  background: #f0f9ff;
  color: #409eff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid #d1ecf1;
}

/* 个性化偏好卡片样式 */
.preferences-card {
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

.preferences-content {
  padding: 24px;
}

/* 当前偏好设置样式 */
.current-preferences {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 32px;
  border: 1px solid #e2e8f0;
}

.preferences-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preferences-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #334155;
  font-size: 16px;
  margin: 0;
  font-weight: 600;
}

.preference-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preference-tag {
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
}

.more-tag {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #cbd5e1;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
}

.empty-state p {
  margin: 16px 0;
  font-size: 14px;
}

/* 增强版空状态 */
.empty-state-enhanced {
  text-align: center;
  padding: 40px 30px;
  background: linear-gradient(135deg, #fefbf3 0%, #fef7e6 100%);
  border: 2px dashed #fbbf24;
  border-radius: 12px;
}

.empty-icon {
  margin-bottom: 20px;
}

.empty-state-enhanced h4 {
  color: #92400e;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.empty-state-enhanced p {
  color: #a16207;
  font-size: 14px;
  margin: 0 0 16px 0;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  text-align: left;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.benefits-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #059669;
  font-size: 14px;
}

.benefits-list .el-icon {
  color: #10b981;
  font-size: 16px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

/* 个性化设置区域 */
.personalization-section {
  margin-top: 32px;
}

.personalization-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1e293b;
  font-size: 18px;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.section-desc {
  color: #64748b;
  font-size: 14px;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.preference-hint {
  color: #059669;
  font-size: 13px;
  font-weight: 500;
  background: #ecfdf5;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 8px;
}

/* 偏好提示横幅 */
.preference-hint-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%);
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  color: #92400e;
  font-size: 14px;
}

.preference-hint-banner .el-icon {
  color: #f59e0b;
}

/* 偏好详情展示 */
.preference-details {
  margin: 16px 0;
}

.preference-row {
  margin-bottom: 12px;
}

.preference-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preference-label {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  min-width: 80px;
}

.preference-values {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preference-impact {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 8px 12px;
  background: #f0f9ff;
  border-radius: 6px;
  color: #0369a1;
  font-size: 13px;
}

.preference-impact .el-icon {
  color: #3b82f6;
}

/* 推荐选项样式 */
.budget-card.recommended {
  border-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%);
}

.recommended-option {
  position: relative;
}

.recommend-icon {
  color: #10b981;
  font-size: 14px;
  margin-left: 4px;
}

.recommendation-hint {
  color: #10b981;
  font-size: 12px;
  font-weight: normal;
  margin-left: 8px;
}

/* 活动强度选项样式 */
.intensity-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.intensity-option span {
  display: flex;
  align-items: center;
  font-weight: 500;
  margin-bottom: 4px;
}

.intensity-option small {
  color: #64748b;
  font-size: 12px;
  line-height: 1.2;
}

/* 推荐选项在下拉框中的样式 */
.el-select-dropdown .recommended-option .el-select-dropdown__item {
  background-color: #f0fdf4;
  border-left: 3px solid #10b981;
}

/* 简化表单样式 */
.simple-preferences-form {
  max-width: none;
}

.preference-group {
  margin-bottom: 32px;
}

.preference-group h4 {
  color: #374151;
  font-size: 15px;
  margin: 0 0 16px 0;
  font-weight: 600;
}

/* 风格卡片 */
.style-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.style-card {
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.style-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.style-card.active {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.style-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.style-title {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  margin-bottom: 4px;
}

.style-desc {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

/* 复选框网格 */
.checkbox-grid .el-checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px 16px;
}

.checkbox-grid .el-checkbox {
  margin: 0;
  font-size: 14px;
}

/* 展开按钮 */
.expand-section {
  text-align: center;
  margin: 24px 0;
}

.expand-button {
  color: #6b7280;
  font-size: 14px;
  padding: 8px 16px;
}

.expand-button:hover {
  color: #374151;
  background: #f9fafb;
}

/* 高级选项 */
.advanced-options {
  border-top: 1px solid #e5e7eb;
  padding-top: 24px;
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .city-highlights {
    flex-direction: column;
    gap: 20px;
  }
  
  .highlight-item {
    min-width: auto;
  }
  
  .style-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .checkbox-grid .el-checkbox-group {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .preferences-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .preference-tags {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .style-cards {
    grid-template-columns: 1fr;
  }
  
  .city-intro-content,
  .preferences-content {
    padding: 16px;
  }
}
</style>

