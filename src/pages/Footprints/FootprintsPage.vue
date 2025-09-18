<template>
  <div class="page-shell footprints-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">
            <el-icon><Star /></el-icon>
            我的足迹
          </h1>
          <p class="page-subtitle">记录你的足迹，分享你的旅行故事</p>

          <!-- 快捷操作按钮组 -->
          <div class="quick-actions-buttons">
            <!-- 去过的城市照片展示 - 新组件 -->
            <VisitedCitiesGallery
              :max-display-count="6"
              @photo-uploaded="handlePhotoUploaded"
              @photo-deleted="handlePhotoDeleted"
              @add-visited-city="handleAddVisitedCityDirect"
            />

            <!-- 足迹统计卡片 -->
            <FootprintStats
              :stats="wishlistStore.footprintStats"
              :has-data="wishlistStore.hasCities"
              @share="handleShareFootprint"
              @view-achievements="handleViewAchievements"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 足迹内容 -->
    <div class="page-content">
      <!-- 状态切换控制区域 -->
      <div v-if="wishlistStore.hasCities" class="view-control-section">
        <div class="control-header">
          <h3 class="control-title">
            <el-icon><View /></el-icon>
            地图显示模式
          </h3>
          <p class="control-subtitle">
            选择在地图上显示的城市类型，去过的城市已在上方展示
          </p>
        </div>

        <div class="view-mode-buttons">
          <el-button
            :type="mapDisplayMode === 'all' ? 'primary' : ''"
            size="large"
            class="mode-button"
            @click="mapDisplayMode = 'all'"
          >
            <el-icon><Location /></el-icon>
            全部显示
          </el-button>

          <el-button
            :type="mapDisplayMode === 'wishlist' ? 'primary' : ''"
            size="large"
            class="mode-button wishlist-mode"
            @click="mapDisplayMode = 'wishlist'"
          >
            <el-icon><Star /></el-icon>
            想去的城市
          </el-button>

          <el-button
            :type="mapDisplayMode === 'visited' ? 'primary' : ''"
            size="large"
            class="mode-button visited-mode"
            @click="mapDisplayMode = 'visited'"
          >
            <el-icon><Check /></el-icon>
            去过的城市
          </el-button>
        </div>
      </div>

      <!-- 地图区域 -->
      <div v-if="wishlistStore.hasCities" class="map-section">
        <div class="map-header">
          <div class="map-title-group">
            <h3 class="map-title">
              <el-icon><MapLocation /></el-icon>
              足迹地图
            </h3>
            <div class="footprint-stats">
              <span class="stat-badge visited">
                <el-icon><Check /></el-icon>
                已去过 {{ wishlistStore.visitedCount }}
              </span>
              <span class="stat-badge wishlist">
                <el-icon><Star /></el-icon>
                想去 {{ wishlistStore.wishlistOnlyCount }}
              </span>
              <span class="stat-badge provinces">
                <el-icon><Location /></el-icon>
                {{ wishlistStore.exploredProvincesCount }} 省份
              </span>
            </div>
          </div>
          <div class="map-controls">
            <el-button size="small" type="primary" @click="handleFullscreenMap">
              <el-icon><View /></el-icon>
              全屏查看
            </el-button>
          </div>
        </div>

        <div class="map-container">
          <ChinaWishlistMap
            :wishlist-items="mapDisplayItems"
            height="600px"
            :enable-map-click="true"
            :highlighted-city="highlightedCity"
            @city-click="handleMapCityClick"
            @map-click="handleMapClick"
            @map-right-click="handleMapRightClick"
          />
        </div>
      </div>

      <!-- 动态内容展示区域 -->
      <div v-if="wishlistStore.hasCities" class="content-display-area">
        <!-- 想去的城市卡片展示 -->
        <div v-if="wishlistStore.wishlistOnlyCount > 0" class="wishlist-cities-cards">
          <div class="section-header">
            <h4 class="section-title">
              <el-icon><Star /></el-icon>
              想去的城市 ({{ wishlistStore.wishlistOnlyCount }})
            </h4>
            <div class="section-controls">
              <div class="filter-controls">
                <el-select
                  v-model="sortBy"
                  placeholder="排序方式"
                  size="small"
                  style="width: 120px"
                  @change="handleSortChange"
                >
                  <el-option label="添加时间" value="date" />
                  <el-option label="城市名称" value="name" />
                </el-select>
              </div>

              <el-button size="small" type="primary" @click="handleAddWishlistCityDirect">
                <el-icon><Plus /></el-icon>
                添加城市
              </el-button>
            </div>
          </div>

          <div class="simple-cards-container">
            <div
              v-for="item in filteredAndSortedWishlistCities"
              :key="item.id"
              class="enhanced-wishlist-card"
              @click="handleCardClick(item)"
            >
              <div class="card-main-content">
                <div class="card-header">
                  <div class="city-info">
                    <!-- 重访标识 -->
                    <div
                      v-if="item.ever_visited && item.want_to_visit_again"
                      class="revisit-badge"
                    >
                      <el-icon><Star /></el-icon>
                      <span>想再去</span>
                    </div>

                    <h5 class="card-city-name">
                      {{ item.cityName }}
                    </h5>
                    <span class="added-time">
                      {{ formatAddedTime(item.createdAt) }}
                    </span>
                  </div>
                  <div class="card-actions">
                    <!-- 只有从未去过的城市才显示"标记为已去过"按钮 -->
                    <div v-if="!item.ever_visited" class="primary-action">
                      <el-button
                        size="small"
                        type="primary"
                        class="action-btn visited-btn"
                        @click.stop="handleMarkAsVisited(item)"
                      >
                        <el-icon><Check /></el-icon>
                        <span class="action-text">标记为已去过</span>
                      </el-button>
                    </div>
                    <div class="secondary-actions">
                      <el-button
                        size="small"
                        class="action-btn edit-btn"
                        @click.stop="handleEditCity(item)"
                      >
                        <el-icon><Edit /></el-icon>
                        <span class="action-text">编辑</span>
                      </el-button>
                      <el-dropdown trigger="click" placement="bottom-end" @click.stop>
                        <el-button size="small" class="action-btn more-btn" @click.stop>
                          <el-icon><MoreFilled /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item @click="handlePlanTrip(item)">
                              <el-icon><Calendar /></el-icon>
                              规划行程
                            </el-dropdown-item>
                            <el-dropdown-item
                              divided
                              class="delete-item"
                              @click="handleDeleteCity(item)"
                            >
                              <el-icon><Delete /></el-icon>
                              删除城市
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </div>
                </div>

                <div v-if="item.tags && item.tags.length > 0" class="card-tags">
                  <el-tag
                    v-for="tag in item.tags.slice(0, 3)"
                    :key="tag"
                    size="small"
                    :type="getTagType(tag)"
                    class="enhanced-tag"
                  >
                    <el-icon class="tag-icon">
                      <component :is="getTagIcon(tag)" />
                    </el-icon>
                    {{ tag }}
                  </el-tag>
                  <span v-if="item.tags.length > 3" class="more-tags">
                    +{{ item.tags.length - 3 }}
                  </span>
                </div>

                <p v-if="item.reason" class="card-reason">
                  {{ item.reason }}
                </p>

                <!-- 规划信息 -->
                <div v-if="item.plannedDate" class="planning-info">
                  <div v-if="item.plannedDate" class="plan-item">
                    <el-icon class="plan-icon">
                      <Calendar />
                    </el-icon>
                    <span>{{ formatPlannedDate(item.plannedDate) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div
              v-if="
                filteredAndSortedWishlistCities.length === 0 && wishlistCities.length > 0
              "
              class="empty-filtered"
            >
              <el-icon size="48">
                <Search />
              </el-icon>
              <p>没有符合条件的城市</p>
              <el-button size="small" link @click="clearFilters">
                清除筛选条件
              </el-button>
            </div>

            <!-- 完全空状态 -->
            <div v-if="wishlistCities.length === 0" class="empty-wishlist">
              <el-icon size="48">
                <Star />
              </el-icon>
              <p>还没有心愿城市</p>
              <el-button size="small" type="primary" @click="handleAddWishlistCityDirect">
                添加心愿城市
              </el-button>
            </div>
          </div>
        </div>

        <!-- 想去城市空状态 -->
        <div v-if="wishlistStore.wishlistOnlyCount === 0" class="empty-wishlist-state">
          <div class="empty-content">
            <el-icon size="64" color="#C0C4CC">
              <Star />
            </el-icon>
            <h4>还没有心愿城市</h4>
            <p>添加你想去的城市，开始规划你的旅行</p>
            <el-button type="primary" @click="handleAddWishlistCityDirect">
              <el-icon><Plus /></el-icon>
              添加第一个心愿城市
            </el-button>
          </div>
        </div>

        <!-- 想再去的城市卡片展示 -->
        <div
          v-if="wishlistStore.wantToVisitAgainCount > 0"
          class="want-again-cities-cards"
        >
          <div class="section-header">
            <h4 class="section-title">
              <el-icon><Star /></el-icon>
              想再去的城市 ({{ wishlistStore.wantToVisitAgainCount }})
            </h4>
            <div class="section-subtitle">去过但想再次探访的城市</div>
          </div>

          <div class="simple-cards-container">
            <div
              v-for="item in sortedWantToVisitAgainCities"
              :key="item.id"
              class="enhanced-wishlist-card want-again-card"
              @click="handleCardClick(item)"
            >
              <div class="card-main-content">
                <div class="card-header">
                  <div class="city-info">
                    <!-- 想再去标识 -->
                    <div class="revisit-badge want-again-badge">
                      <el-icon><Star /></el-icon>
                      <span>想再去</span>
                    </div>

                    <h5 class="card-city-name">
                      {{ item.cityName }}
                    </h5>
                    <span class="added-time">
                      首次访问：{{ formatVisitDate(item.visit_date) }}
                    </span>
                  </div>
                  <div class="card-actions">
                    <div class="secondary-actions">
                      <el-button
                        size="small"
                        class="action-btn edit-btn"
                        @click.stop="handleEditCity(item)"
                      >
                        <el-icon><Edit /></el-icon>
                        <span class="action-text">编辑</span>
                      </el-button>
                      <el-dropdown trigger="click" placement="bottom-end" @click.stop>
                        <el-button size="small" class="action-btn more-btn" @click.stop>
                          <el-icon><MoreFilled /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item @click="handlePlanTrip(item)">
                              <el-icon><Calendar /></el-icon>
                              规划行程
                            </el-dropdown-item>
                            <el-dropdown-item @click="handleCancelWantToVisitAgain(item)">
                              <el-icon><Close /></el-icon>
                              取消想再去
                            </el-dropdown-item>
                            <el-dropdown-item
                              divided
                              class="delete-item"
                              @click="handleDeleteCity(item)"
                            >
                              <el-icon><Delete /></el-icon>
                              删除城市
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </div>
                </div>

                <div v-if="item.tags && item.tags.length > 0" class="card-tags">
                  <el-tag
                    v-for="tag in item.tags.slice(0, 3)"
                    :key="tag"
                    size="small"
                    :type="getTagType(tag)"
                    class="enhanced-tag"
                  >
                    {{ tag }}
                  </el-tag>
                  <el-tag
                    v-if="item.tags.length > 3"
                    size="small"
                    type="info"
                    class="enhanced-tag more-tags"
                  >
                    +{{ item.tags.length - 3 }}
                  </el-tag>
                </div>

                <div v-if="item.reason" class="card-reason">
                  <el-icon><ChatRound /></el-icon>
                  <span>{{ item.reason }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 完全没有数据的空状态 -->
      <div v-if="!wishlistStore.hasCities" class="empty-wishlist">
        <el-icon size="64" color="#C0C4CC">
          <Star />
        </el-icon>
        <h4>开始你的足迹之旅</h4>
        <p>添加想去或去过的城市，在地图上记录你的足迹</p>

        <div class="empty-actions">
          <el-button type="primary" @click="handleOpenTypeSelection">
            <el-icon><Plus /></el-icon>
            添加第一个城市
          </el-button>
        </div>
      </div>
    </div>

    <!-- 快速操作悬浮按钮 -->
    <div class="floating-actions">
      <el-button
        type="primary"
        circle
        size="large"
        class="fab-main"
        @click="handleOpenTypeSelection"
      >
        <el-icon><Plus /></el-icon>
      </el-button>
    </div>

    <!-- 类型选择对话框 -->
    <el-dialog
      v-model="showTypeSelection"
      width="420px"
      class="type-selection-dialog"
      align-center
      :show-close="false"
    >
      <div class="type-selection-content">
        <div class="type-selection-header">
          <div class="header-icon">
            <el-icon size="24">
              <Plus />
            </el-icon>
          </div>
          <div class="header-text">
            <h3>选择添加类型</h3>
            <p>你想要添加哪种类型的城市？</p>
          </div>
        </div>

        <div class="type-options">
          <div
            class="type-option wishlist-option"
            @click="handleAddTypeSelection('wishlist')"
          >
            <div class="option-icon">
              <el-icon size="32">
                <Star />
              </el-icon>
            </div>
            <div class="option-content">
              <h4>心愿城市</h4>
              <p>添加你想去的城市</p>
            </div>
          </div>

          <div
            class="type-option visited-option"
            @click="handleAddTypeSelection('visited')"
          >
            <div class="option-icon">
              <el-icon size="32">
                <Check />
              </el-icon>
            </div>
            <div class="option-content">
              <h4>足迹城市</h4>
              <p>记录你去过的城市</p>
            </div>
          </div>
        </div>

        <div class="type-selection-actions">
          <el-button size="large" @click="showTypeSelection = false"> 取消 </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 快速添加对话框 -->
    <el-dialog
      v-model="showQuickAdd"
      width="480px"
      :before-close="handleQuickAddClose"
      class="wishlist-add-dialog"
      align-center
    >
      <div class="dialog-content">
        <!-- 对话框头部 -->
        <div class="dialog-header">
          <div class="header-icon">
            <el-icon size="24">
              <Star />
            </el-icon>
          </div>
          <div class="header-text">
            <h3>{{ dialogContent.title }}</h3>
            <p>{{ dialogContent.description }}</p>
          </div>
        </div>

        <el-form :model="quickAddForm" label-position="top" class="add-form">
          <el-form-item label="选择城市">
            <el-select
              v-model="quickAddForm.selectedCity"
              placeholder="请选择或搜索城市..."
              filterable
              remote
              reserve-keyword
              :remote-method="searchCities"
              :loading="searchLoading"
              clearable
              size="large"
              class="city-selector"
              @change="handleCitySelect"
            >
              <el-option-group
                v-if="displayCities.length > 0"
                :label="searchKeyword ? '搜索结果' : '热门城市'"
              >
                <el-option
                  v-for="city in displayCities"
                  :key="city.adcode"
                  :label="city.中文名"
                  :value="city.adcode"
                  class="city-option"
                >
                  <div class="city-option-content">
                    <span class="city-name">{{ city.中文名 }}</span>
                    <span class="city-code">{{ city.citycode }}</span>
                  </div>
                </el-option>
              </el-option-group>

              <div
                v-if="displayCities.length === 0 && searchKeyword && !searchLoading"
                class="no-results"
              >
                <el-icon><Search /></el-icon>
                <span>未找到匹配的城市</span>
              </div>
            </el-select>
          </el-form-item>

          <el-form-item label="选择标签" class="tags-form-item">
            <div class="tags-selection">
              <div class="predefined-tags">
                <el-check-tag
                  v-for="tag in predefinedTags"
                  :key="tag.name"
                  :checked="quickAddForm.selectedTags.includes(tag.name)"
                  class="tag-item"
                  :style="{ '--tag-color': tag.color }"
                  @change="toggleTag(tag.name)"
                >
                  {{ tag.name }}
                </el-check-tag>
              </div>
            </div>
          </el-form-item>

          <!-- 旅行时间选择 - 仅在添加去过的城市时显示 -->
          <el-form-item
            v-if="quickAddForm.ever_visited"
            label="旅行时间"
            class="travel-time-form-item"
          >
            <el-date-picker
              v-model="quickAddForm.travelTime"
              type="month"
              placeholder="选择旅行时间"
              format="YYYY年MM月"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              size="large"
              class="travel-time-picker"
            />
            <div class="form-hint">选择你去这个城市旅行的大致时间</div>
          </el-form-item>

          <!-- 旅行感受 - 仅在添加去过的城市时显示 -->
          <el-form-item
            v-if="quickAddForm.ever_visited"
            label="旅行感受"
            class="travel-feeling-form-item"
          >
            <el-input
              v-model="quickAddForm.travelFeeling"
              type="textarea"
              :rows="3"
              placeholder="分享一下你在这里的旅行感受..."
              maxlength="200"
              show-word-limit
              class="travel-feeling-input"
            />
          </el-form-item>

          <!-- 想去的原因 - 仅在添加心愿城市时显示 -->
          <el-form-item
            v-if="!quickAddForm.ever_visited"
            :label="dialogContent.reasonLabel"
            class="reason-form-item"
          >
            <el-input
              v-model="quickAddForm.reason"
              type="textarea"
              :rows="3"
              :placeholder="dialogContent.reasonPlaceholder"
              maxlength="200"
              show-word-limit
              class="reason-input"
            />
          </el-form-item>

          <div class="dialog-actions">
            <el-button size="large" class="cancel-btn" @click="handleQuickAddClose">
              取消
            </el-button>
            <el-button
              type="primary"
              size="large"
              :loading="quickAdding"
              :disabled="!quickAddForm.selectedCity"
              class="submit-btn"
              @click="handleQuickAddSubmit"
            >
              <el-icon v-if="!quickAdding">
                <Plus />
              </el-icon>
              {{ quickAdding ? "添加中..." : dialogContent.submitText }}
            </el-button>
          </div>
        </el-form>
      </div>
    </el-dialog>

    <!-- 全屏地图对话框 -->
    <el-dialog
      v-model="showFullscreenMap"
      :width="'95%'"
      :top="'2.5vh'"
      class="fullscreen-map-dialog"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
      destroy-on-close
    >
      <template #header>
        <div class="fullscreen-map-header">
          <div class="map-info">
            <h3>我的足迹地图</h3>
            <div class="map-stats">
              <span class="stat-item">
                <el-icon><Check /></el-icon>
                已访问 {{ wishlistStore.visitedCount }}
              </span>
              <span class="stat-item">
                <el-icon><Star /></el-icon>
                想去 {{ wishlistStore.wishlistOnlyCount }}
              </span>
              <span class="stat-item">
                <el-icon><Location /></el-icon>
                {{ wishlistStore.exploredProvincesCount }} 个省份
              </span>
            </div>
          </div>
          <div class="map-controls">
            <div class="display-mode-toggle">
              <el-button-group size="small">
                <el-button
                  :type="fullscreenMapMode === 'all' ? 'primary' : ''"
                  @click="fullscreenMapMode = 'all'"
                >
                  全部
                </el-button>
                <el-button
                  :type="fullscreenMapMode === 'visited' ? 'primary' : ''"
                  @click="fullscreenMapMode = 'visited'"
                >
                  已访问
                </el-button>
                <el-button
                  :type="fullscreenMapMode === 'wishlist' ? 'primary' : ''"
                  @click="fullscreenMapMode = 'wishlist'"
                >
                  想去
                </el-button>
              </el-button-group>
            </div>
            <el-button size="small" @click="showFullscreenMap = false">
              <el-icon><Close /></el-icon>
              关闭
            </el-button>
          </div>
        </div>
      </template>

      <div class="fullscreen-map-content">
        <ChinaWishlistMap
          :wishlist-items="fullscreenMapDisplayItems"
          height="calc(90vh - 120px)"
          :enable-map-click="true"
          :highlighted-city="highlightedCity"
          @city-click="handleMapCityClick"
          @map-click="handleMapClick"
          @map-right-click="handleMapRightClick"
        />
      </div>
    </el-dialog>

    <!-- 编辑城市对话框 -->
    <el-dialog
      v-model="showEditDialog"
      width="500px"
      class="edit-city-dialog"
      align-center
      :show-close="true"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
    >
      <div class="dialog-content">
        <!-- 对话框头部 -->
        <div class="dialog-header">
          <div class="header-icon">
            <el-icon size="24">
              <Edit />
            </el-icon>
          </div>
          <div class="header-text">
            <h3>编辑城市信息</h3>
            <p>修改 {{ editForm.cityName }} 的旅行信息</p>
          </div>
        </div>

        <el-form :model="editForm" label-position="top" class="edit-form">
          <el-form-item label="城市名称">
            <el-input v-model="editForm.cityName" disabled size="large" />
          </el-form-item>

          <el-form-item label="标签" class="tags-form-item">
            <div class="tags-selection">
              <div class="predefined-tags">
                <el-check-tag
                  v-for="tag in predefinedTags"
                  :key="tag.name"
                  :checked="editForm.selectedTags.includes(tag.name)"
                  class="tag-item"
                  :style="{ '--tag-color': tag.color }"
                  @change="toggleEditTag(tag.name)"
                >
                  {{ tag.name }}
                </el-check-tag>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="想去的原因" class="reason-form-item">
            <el-input
              v-model="editForm.reason"
              type="textarea"
              :rows="3"
              placeholder="分享一下你想去这里的理由..."
              maxlength="200"
              show-word-limit
              class="reason-input"
            />
          </el-form-item>

          <el-form-item label="计划时间">
            <el-date-picker
              v-model="editForm.plannedDate"
              type="month"
              placeholder="选择计划去的时间"
              format="YYYY年MM月"
              value-format="YYYY-MM"
              size="large"
              style="width: 100%"
            />
          </el-form-item>

          <div class="dialog-actions">
            <el-button size="large" class="cancel-btn" @click="showEditDialog = false">
              取消
            </el-button>
            <el-button
              type="primary"
              size="large"
              :loading="editLoading"
              class="submit-btn"
              @click="handleSaveEdit"
            >
              <el-icon v-if="!editLoading">
                <Check />
              </el-icon>
              {{ editLoading ? "保存中..." : "保存更改" }}
            </el-button>
          </div>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Star,
  Plus,
  MapLocation,
  View,
  Search,
  Check,
  Location,
  Share,
  Camera,
  Delete,
  Close,
  MoreFilled,
  Edit,
  Calendar,
  // 标签图标
  HomeFilled,
  ForkSpoon,
  Camera as CameraIcon,
  ShoppingBag,
  Coffee,
  Picture,
  Basketball,
  Location as LocationIcon,
  ChatRound,
} from "@element-plus/icons-vue";
import { useWishlistStore } from "@/store/wishlist.js";
import { useUserStore } from "@/store/user.js";
import WishlistCard from "@/components/Common/Wishlist/WishlistCard.vue";
import MiniWishlistCard from "@/components/Common/Wishlist/MiniWishlistCard.vue";
import ChinaWishlistMap from "@/components/Common/Map/ChinaWishlistMap.vue";
import FootprintStats from "@/components/Common/Stats/FootprintStats.vue";
import VisitedCitiesGallery from "@/components/Common/Footprints/VisitedCitiesGallery.vue";
import pinyin from "pinyin";
import { debounce } from "@/utils/api/apiOptimizer.js";
import { weatherApi } from "@/api/weather.js";

export default {
  name: "FootprintsPage",
  components: {
    WishlistCard,
    MiniWishlistCard,
    ChinaWishlistMap,
    FootprintStats,
    VisitedCitiesGallery,
    Star,
    Plus,
    MapLocation,
    View,
    Search,
    Check,
    Location,
    Share,
    Camera,
    Delete,
    Close,
    MoreFilled,
    Edit,
    Calendar,
    HomeFilled,
    ForkSpoon,
    CameraIcon,
    ShoppingBag,
    Coffee,
    Picture,
    Basketball,
    LocationIcon,
  },
  setup() {
    const router = useRouter();
    const wishlistStore = useWishlistStore();
    const userStore = useUserStore();

    // 快速添加功能
    const showQuickAdd = ref(false);
    const showTypeSelection = ref(false); // 添加类型选择对话框状态
    const selectedAddType = ref(""); // 选择的添加类型
    const quickAdding = ref(false);
    const quickAddForm = ref({
      selectedCity: null,
      selectedTags: [],
      reason: "",
      status: "wishlist", // 保留用于向后兼容
      ever_visited: false, // 新的数据模型字段
      want_to_visit_again: true, // 默认为想去
      travelTime: null, // 旅行时间
      travelFeeling: "", // 旅行感受
    });

    // 地图-卡片联动状态
    const highlightedCity = ref(null);
    const mapDisplayMode = ref("all"); // 地图显示模式：all, visited, wishlist

    // 全屏地图状态
    const showFullscreenMap = ref(false);
    const fullscreenMapMode = ref("all"); // 全屏地图的显示模式

    // 编辑对话框状态
    const showEditDialog = ref(false);
    const editLoading = ref(false);
    const editForm = ref({
      id: null,
      cityName: "",
      selectedTags: [],
      reason: "",
      plannedDate: null,
    });

    // 排序状态
    const sortBy = ref("date"); // 默认按时间排序

    // 预定义标签 - 使用统一的项目主题色彩
    const predefinedTags = ref([
      { name: "历史文化", color: "#91a8d0" },
      { name: "自然风光", color: "#91a8d0" },
      { name: "美食之旅", color: "#f7cac9" },
      { name: "度假休闲", color: "#91a8d0" },
      { name: "购物天堂", color: "#f7cac9" },
      { name: "艺术文化", color: "#6366f1" },
      { name: "夜生活", color: "#f7cac9" },
      { name: "亲子旅行", color: "#91a8d0" },
      { name: "冒险探索", color: "#6366f1" },
      { name: "古镇古村", color: "#91a8d0" },
      { name: "海滨城市", color: "#f7cac9" },
      { name: "山水之间", color: "#91a8d0" },
    ]);

    // 城市数据相关
    const allCities = ref([]);
    const hotCities = ref([]);
    const searchResults = ref([]);
    const searchLoading = ref(false);
    const searchKeyword = ref("");

    // 显示的城市列表（热门城市或搜索结果）
    const displayCities = computed(() => {
      if (searchKeyword.value && searchResults.value.length > 0) {
        return searchResults.value;
      }
      return hotCities.value;
    });

    // 动态对话框内容
    const dialogContent = computed(() => {
      const isVisited = quickAddForm.value.status === "visited";
      return {
        title: isVisited ? "记录足迹城市" : "添加心愿城市",
        description: isVisited
          ? "记录你去过的城市，分享你的旅行回忆"
          : "选择你想去的城市，开启下一段旅程",
        reasonLabel: isVisited ? "旅行感受" : "想去的原因",
        reasonPlaceholder: isVisited
          ? "分享一下你在这里的旅行感受..."
          : "分享一下你想去这里的理由...",
        submitText: isVisited ? "添加到足迹" : "添加到心愿单",
      };
    });

    // 地图显示的城市数据 - 适配新数据模型
    const mapDisplayItems = computed(() => {
      if (mapDisplayMode.value === "all") {
        // 合并心愿城市和足迹城市，添加类型标识
        return [
          ...wishlistStore.wishlistCities.map((city) => ({ ...city, _type: "wishlist" })),
          ...wishlistStore.visitedCities.map((city) => ({ ...city, _type: "visited" })),
        ];
      } else if (mapDisplayMode.value === "visited") {
        return wishlistStore.visitedCities.map((city) => ({ ...city, _type: "visited" }));
      } else if (mapDisplayMode.value === "wishlist") {
        return wishlistStore.wishlistCities.map((city) => ({
          ...city,
          _type: "wishlist",
        }));
      }
      return [];
    });

    // 去过的城市 - 使用新的数据模型
    const visitedCities = computed(() => {
      return wishlistStore.visitedCities;
    });

    // 想去的城市 - 使用新的数据模型
    const wishlistCities = computed(() => {
      return wishlistStore.wishlistCities;
    });

    // 筛选和排序后的想去城市
    const filteredAndSortedWishlistCities = computed(() => {
      let cities = [...wishlistCities.value];

      // 排序
      cities.sort((a, b) => {
        switch (sortBy.value) {
          case "name":
            // 按城市名称字母顺序排序
            return a.cityName.localeCompare(b.cityName, "zh-CN");

          case "date":
          default:
            // 按添加时间排序（最新的在前）
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });

      return cities;
    });

    // 排序后的想再去城市
    const sortedWantToVisitAgainCities = computed(() => {
      let cities = [...wishlistStore.wantToVisitAgainCities];

      // 按访问日期排序（最近访问的在前）
      cities.sort((a, b) => {
        const dateA = a.visit_date ? new Date(a.visit_date) : new Date(a.createdAt);
        const dateB = b.visit_date ? new Date(b.visit_date) : new Date(b.createdAt);
        return dateB - dateA;
      });

      return cities;
    });

    // 全屏地图显示的城市数据 - 适配新数据模型
    const fullscreenMapDisplayItems = computed(() => {
      if (fullscreenMapMode.value === "all") {
        // 合并心愿城市和足迹城市，添加类型标识
        return [
          ...wishlistStore.wishlistCities.map((city) => ({ ...city, _type: "wishlist" })),
          ...wishlistStore.visitedCities.map((city) => ({ ...city, _type: "visited" })),
        ];
      } else if (fullscreenMapMode.value === "visited") {
        return wishlistStore.visitedCities.map((city) => ({ ...city, _type: "visited" }));
      } else if (fullscreenMapMode.value === "wishlist") {
        return wishlistStore.wishlistCities.map((city) => ({
          ...city,
          _type: "wishlist",
        }));
      }
      return [];
    });

    // 地图-卡片联动事件
    const handleCardClick = (item) => {
      // 点击卡片时在地图上高亮对应城市
      highlightedCity.value = item.cityName;
      setTimeout(() => {
        highlightedCity.value = null;
      }, 3000); // 3秒后取消高亮
    };

    const handleCardHover = ({ item, type }) => {
      if (type === "enter") {
        highlightedCity.value = item.cityName;
      } else {
        highlightedCity.value = null;
      }
    };

    const handleMapCityClick = async (cityData) => {
      // 点击地图城市时，根据当前状态进行操作
      if (!cityData || !cityData.id) {
        ElMessage.warning('城市数据无效');
        return;
      }

      try {
        // 判断当前城市状态
        if (cityData.ever_visited) {
          // 已去过的城市，可以切换"想再去"状态
          if (cityData.want_to_visit_again) {
            // 取消想再去
            await handleCancelWantToVisitAgain(cityData);
          } else {
            // 标记为想再去
            const success = await wishlistStore.markWantToVisitAgain(cityData.id, true);
            if (success) {
              ElMessage.success(`已将 ${cityData.cityName} 标记为想再去`);
            }
          }
        } else {
          // 未去过的城市，标记为已去过
          await handleMarkAsVisited(cityData);
        }
      } catch (error) {
        console.error('处理地图城市点击失败:', error);
        ElMessage.error('操作失败，请重试');
      }
    };

    const handleMapClick = (mapData) => {
      // 点击地图空白区域，显示添加城市对话框
      if (mapData.provinceName) {
        ElMessage.info(`点击了${mapData.provinceName}，可以添加该省份的城市`);
        showQuickAdd.value = true;
      }
    };

    const handleMapRightClick = (mapData) => {
      // 右键点击地图，显示快速操作菜单
      if (mapData.provinceName) {
        // 可以在这里实现右键菜单功能
        // 暂时显示提示信息
        ElMessage.info(`右键点击${mapData.provinceName}，可添加该省份城市到愿望清单`);
        // 触发快速添加对话框
        showQuickAdd.value = true;
      }
    };

    // 标记城市为已去过
    const handleMarkAsVisited = async (item) => {
      try {
        const success = await wishlistStore.markAsVisited(item.id);
        if (success) {
          ElMessage.success(`已将 ${item.cityName} 标记为去过`);
        }
      } catch (error) {
        console.error("标记城市为已去过失败:", error);
        ElMessage.error("操作失败，请重试");
      }
    };

    // 取消想再去
    const handleCancelWantToVisitAgain = async (item) => {
      try {
        const success = await wishlistStore.markWantToVisitAgain(item, false);
        if (success) {
          ElMessage.success(`已取消 ${item.cityName} 的想再去状态`);
        }
      } catch (error) {
        console.error("取消想再去失败:", error);
        ElMessage.error("操作失败，请重试");
      }
    };

    // 状态切换处理（保留兼容性）
    const handleStatusChange = async ({ id, status }) => {
      if (status === "visited") {
        const item = wishlistStore.wishlistCities.find((i) => i.id === id);
        if (item) {
          await handleMarkAsVisited(item);
        }
      }
    };

    // 处理卡片事件
    const handleRemove = async (wishlistId) => {
      await wishlistStore.removeFromWishlist(wishlistId);
    };

    const handleEdit = async ({ id, updateData }) => {
      await wishlistStore.updateWishlistItem(id, updateData);
    };

    const handleViewWeather = (city) => {
      wishlistStore.setCurrentWeatherCity(city);
      handleWeatherCityChange(city);
      ElMessage.success(`已切换到 ${city.cityName} 的天气预览`);
    };

    const handlePlanTrip = (city) => {
      router.push({
        path: "/trip/create",
        query: {
          city: city.adcode,
          cityName: encodeURIComponent(city.cityName),
        },
      });
    };

    // 足迹分享和成就功能
    const handleShareFootprint = async (stats) => {
      try {
        // 这里实现分享功能，可以生成图片或分享链接
        ElMessage.success("正在生成足迹分享图片...");
        // TODO: 实现实际的分享功能
      } catch (error) {
        console.error("分享失败:", error);
        ElMessage.error("分享失败，请重试");
      }
    };

    const handleViewAchievements = () => {
      // 显示全部成就页面或弹窗
      ElMessage.info("成就系统开发中...");
    };

    // 城市数据加载 - 只加载热门城市
    const loadCityData = async () => {
      try {
        const response = await fetch("/data/city-codes.json");
        if (!response.ok) {
          throw new Error(`加载城市数据失败: ${response.status}`);
        }
        const cityData = await response.json();

        // 过滤市级城市（5位数adcode，且不含区县）
        const cities = cityData.filter((city) => {
          const adcode = parseInt(city.adcode);
          return (
            adcode >= 100000 &&
            adcode < 1000000 &&
            city.adcode.toString().endsWith("00") &&
            !city.中文名.includes("区") &&
            !city.中文名.includes("县")
          );
        });

        allCities.value = cities;

        // 扩展热门城市列表
        const hotCityNames = [
          "北京市",
          "上海市",
          "广州市",
          "深圳市",
          "杭州市",
          "南京市",
          "成都市",
          "西安市",
          "重庆市",
          "天津市",
          "苏州市",
          "武汉市",
          "厦门市",
          "青岛市",
          "大连市",
          "三亚市",
          "丽江市",
          "桂林市",
          "拉萨市",
          "乌鲁木齐市",
        ];
        hotCities.value = cities.filter((city) => hotCityNames.includes(city.中文名));
      } catch (error) {
        console.error("加载城市数据失败:", error);
        ElMessage.error("加载城市数据失败");
      }
    };

    // 城市搜索
    const searchCities = debounce((keyword) => {
      searchKeyword.value = keyword;
      if (!keyword || keyword.length < 1) {
        searchResults.value = allCities.value.slice(0, 20);
        return;
      }

      searchLoading.value = true;

      try {
        const filtered = allCities.value
          .filter((city) => {
            // 中文名匹配
            if (city.中文名.includes(keyword)) return true;

            // 拼音匹配
            const pinyinStr = pinyin(city.中文名, {
              style: pinyin.STYLE_NORMAL,
            })
              .flat()
              .join("");
            const pinyinFirst = pinyin(city.中文名, {
              style: pinyin.STYLE_FIRST_LETTER,
            })
              .flat()
              .join("");

            return (
              pinyinStr.toLowerCase().includes(keyword.toLowerCase()) ||
              pinyinFirst.toLowerCase().includes(keyword.toLowerCase())
            );
          })
          .slice(0, 50); // 限制搜索结果数量

        searchResults.value = filtered;
      } catch (error) {
        console.error("城市搜索失败:", error);
        searchResults.value = [];
      } finally {
        searchLoading.value = false;
      }
    }, 300);

    // 处理城市选择
    const handleCitySelect = async (cityAdcode) => {
      const selectedCity = allCities.value.find((city) => city.adcode === cityAdcode);
      if (selectedCity) {
        quickAddForm.value.cityName = selectedCity.中文名;
        // 直接使用选中城市的adcode（6位行政区划代码，如"110000", "420100"）
        quickAddForm.value.adcode = String(selectedCity.adcode);

        // 自动在地图上高亮选择的城市
        highlightedCity.value = selectedCity.中文名;
        setTimeout(() => {
          highlightedCity.value = null;
        }, 5000); // 5秒后取消高亮
      }
    };

    // 切换标签选择
    const toggleTag = (tagName) => {
      const index = quickAddForm.value.selectedTags.indexOf(tagName);
      if (index > -1) {
        quickAddForm.value.selectedTags.splice(index, 1);
      } else {
        quickAddForm.value.selectedTags.push(tagName);
      }
    };

    // 处理天气城市变更（传递给父级路由）
    const handleWeatherCityChange = (city) => {
      // 可以通过 router 或 emit 传递给其他页面
      console.log("Weather city changed:", city);
    };

    // 快速添加城市
    const handleQuickAddSubmit = async () => {
      if (!quickAddForm.value.selectedCity) {
        ElMessage.warning("请选择城市");
        return;
      }

      const selectedCity = allCities.value.find(
        (city) => city.adcode === quickAddForm.value.selectedCity
      );
      if (!selectedCity) {
        ElMessage.warning("请选择有效的城市");
        return;
      }

      quickAdding.value = true;
      try {
        const tags =
          quickAddForm.value.selectedTags.length > 0
            ? quickAddForm.value.selectedTags
            : ["快速添加"];

        // 使用选中城市的完整信息（adcode + citycode）
        const adcode = String(selectedCity.adcode);
        const citycode = selectedCity.citycode === "\\N" ? null : selectedCity.citycode;

        const success = await wishlistStore.addToWishlist({
          adcode: adcode,
          citycode: citycode,
          cityName: selectedCity.中文名,
          reason: quickAddForm.value.reason,
          tags: tags,
          status: quickAddForm.value.status, // 保留用于向后兼容
          ever_visited: quickAddForm.value.ever_visited, // 新的布尔字段
          want_to_visit_again: quickAddForm.value.want_to_visit_again, // 新的布尔字段
          travelTime: quickAddForm.value.travelTime, // 旅行时间
          travelFeeling: quickAddForm.value.travelFeeling, // 旅行感受
        });

        if (success) {
          handleQuickAddClose();
        }
      } catch (error) {
        console.error("快速添加失败:", error);
      } finally {
        quickAdding.value = false;
      }
    };

    // 处理类型选择
    const handleAddTypeSelection = (type) => {
      selectedAddType.value = type;

      // 设置新的数据模型字段
      if (type === "visited") {
        // 添加去过的城市
        quickAddForm.value.ever_visited = true;
        quickAddForm.value.want_to_visit_again = false;
      } else if (type === "wishlist") {
        // 添加想去的城市
        quickAddForm.value.ever_visited = false;
        quickAddForm.value.want_to_visit_again = true;
      }

      // 保留status字段用于向后兼容
      quickAddForm.value.status = type;

      console.log("🎯 类型选择后的表单状态:", {
        type,
        ever_visited: quickAddForm.value.ever_visited,
        want_to_visit_again: quickAddForm.value.want_to_visit_again,
        status: quickAddForm.value.status,
      });

      showTypeSelection.value = false;
      showQuickAdd.value = true;
    };

    // 打开类型选择对话框
    const handleOpenTypeSelection = () => {
      showTypeSelection.value = true;
    };

    // 直接添加去过的城市 - 从VisitedCitiesGallery触发
    const handleAddVisitedCityDirect = () => {
      // 直接设置为去过的城市，跳过类型选择
      selectedAddType.value = "visited";

      // 设置新的数据模型字段
      quickAddForm.value.ever_visited = true;
      quickAddForm.value.want_to_visit_again = false;
      quickAddForm.value.status = "visited"; // 保留status字段用于向后兼容

      console.log("🎯 直接添加去过城市 - 表单状态:", {
        ever_visited: quickAddForm.value.ever_visited,
        want_to_visit_again: quickAddForm.value.want_to_visit_again,
        status: quickAddForm.value.status,
      });

      // 直接打开添加对话框，不显示类型选择
      showQuickAdd.value = true;
    };

    // 直接添加心愿城市
    const handleAddWishlistCityDirect = () => {
      // 直接设置为心愿城市，跳过类型选择
      selectedAddType.value = "wishlist";

      // 设置新的数据模型字段
      quickAddForm.value.ever_visited = false;
      quickAddForm.value.want_to_visit_again = false;
      quickAddForm.value.status = "wishlist"; // 保留status字段用于向后兼容

      console.log("🎯 直接添加心愿城市 - 表单状态:", {
        ever_visited: quickAddForm.value.ever_visited,
        want_to_visit_again: quickAddForm.value.want_to_visit_again,
        status: quickAddForm.value.status,
      });

      // 直接打开添加对话框，不显示类型选择
      showQuickAdd.value = true;
    };

    // 关闭快速添加对话框
    const handleQuickAddClose = () => {
      showQuickAdd.value = false;
      quickAddForm.value = {
        selectedCity: null,
        selectedTags: [],
        reason: "",
        status: "wishlist", // 保留用于向后兼容
        ever_visited: false, // 重置新的数据模型字段
        want_to_visit_again: true, // 默认为想去
        travelTime: null, // 重置旅行时间
        travelFeeling: "", // 重置旅行感受
      };
      searchKeyword.value = "";
      searchResults.value = allCities.value.slice(0, 20);
    };

    // 照片事件处理
    const handlePhotoUploaded = async (city, photoData) => {
      console.log("🎉 父组件接收到照片上传成功事件:", city.cityName);

      // 子组件已经显示了成功提示，父组件不需要重复显示
      // ElMessage.success(`${city.cityName} 的照片上传成功！`);
      console.log("✅ 父组件照片上传处理完成");
    };

    const handlePhotoDeleted = async (city) => {
      console.log("🗑️ 父组件接收到照片删除成功事件:", city);

      // 直接信任子组件的删除操作，无需重新加载数据
      ElMessage.success("照片删除成功");
      console.log("✅ 父组件照片删除处理完成");
    };

    // 地图相关功能
    const handleFullscreenMap = () => {
      showFullscreenMap.value = true;
      fullscreenMapMode.value = mapDisplayMode.value; // 继承当前显示模式
    };

    // 标签相关方法
    const getTagType = (tag) => {
      const tagTypes = {
        历史文化: "info",
        自然风光: "success",
        美食之旅: "warning",
        度假休闲: "primary",
        购物天堂: "danger",
        艺术文化: "info",
        夜生活: "warning",
        亲子旅行: "success",
        冒险探索: "danger",
        古镇古村: "info",
        海滨城市: "primary",
        山水之间: "success",
      };
      return tagTypes[tag] || "";
    };

    const getTagIcon = (tag) => {
      const tagIcons = {
        历史文化: "HomeFilled",
        自然风光: "LocationIcon",
        美食之旅: "ForkSpoon",
        度假休闲: "Coffee",
        购物天堂: "ShoppingBag",
        艺术文化: "Picture",
        夜生活: "Basketball",
        亲子旅行: "HomeFilled",
        冒险探索: "Basketball",
        古镇古村: "HomeFilled",
        海滨城市: "CameraIcon",
        山水之间: "LocationIcon",
      };
      return tagIcons[tag] || "Star";
    };

    // 时间格式化方法
    const formatAddedTime = (dateStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const now = new Date();
      const diffTime = now - date;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "今天添加";
      if (diffDays === 1) return "昨天添加";
      if (diffDays < 7) return `${diffDays}天前添加`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前添加`;
      return date.toLocaleDateString();
    };

    const formatPlannedDate = (dateStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
      });
    };

    const formatVisitDate = (dateStr) => {
      if (!dateStr) return "未知";
      const date = new Date(dateStr);
      return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "short",
      });
    };

    // 新的操作方法
    const handleEditCity = (city) => {
      // 填充编辑表单
      editForm.value = {
        id: city.id,
        cityName: city.cityName,
        selectedTags: [...(city.tags || [])],
        reason: city.reason || "",
        plannedDate: city.plannedDate || null,
      };
      showEditDialog.value = true;
    };

    const handleDeleteCity = async (city) => {
      try {
        let confirmMessage = "";
        let deleteAction = null;

        if (city.ever_visited && city.want_to_visit_again) {
          // 这是"想再去"的城市，删除时需要说明会删除访问记录
          confirmMessage = `确定要删除 ${city.cityName} 的访问记录吗？\n\n删除后：\n- 该城市的访问记录和照片将被永久删除\n- 如果您还想去这个城市，它会回到愿望清单中`;
          deleteAction = async () => {
            // 这里需要找到对应的visited_city记录进行删除
            const visitedCity = wishlistStore.visitedCities.find(
              (vc) => vc.adcode === city.adcode
            );
            if (visitedCity) {
              return await wishlistStore.deleteVisitedCity(visitedCity.id);
            } else {
              console.warn("未找到对应的访问城市记录，降级为删除wishlist项");
              return await wishlistStore.removeFromWishlist(city.id);
            }
          };
        } else if (city.ever_visited) {
          // 这是只去过但不想再去的城市（理论上不应该出现在这里，但为了安全起见）
          confirmMessage = `确定要删除 ${city.cityName} 的访问记录吗？\n\n删除后该城市的访问记录和照片将被永久删除。`;
          deleteAction = async () => {
            const visitedCity = wishlistStore.visitedCities.find(
              (vc) => vc.adcode === city.adcode
            );
            if (visitedCity) {
              return await wishlistStore.deleteVisitedCity(visitedCity.id);
            } else {
              return await wishlistStore.removeFromWishlist(city.id);
            }
          };
        } else {
          // 这是纯粹的愿望清单项（想去但未去过）
          confirmMessage = `确定要从愿望清单中删除 ${city.cityName} 吗？`;
          deleteAction = async () => {
            return await wishlistStore.removeFromWishlist(city.id);
          };
        }

        await ElMessageBox.confirm(confirmMessage, "确认删除", {
          confirmButtonText: "删除",
          cancelButtonText: "取消",
          type: "warning",
          confirmButtonClass: "el-button--danger",
        });

        const success = await deleteAction();
        if (success) {
          ElMessage.success("删除成功");
        }
      } catch {
        // 用户取消删除或删除失败
      }
    };

    // 编辑表单相关方法
    const toggleEditTag = (tagName) => {
      const index = editForm.value.selectedTags.indexOf(tagName);
      if (index > -1) {
        editForm.value.selectedTags.splice(index, 1);
      } else {
        editForm.value.selectedTags.push(tagName);
      }
    };

    const handleSaveEdit = async () => {
      if (!editForm.value.id) return;

      editLoading.value = true;
      try {
        const updateData = {
          tags: editForm.value.selectedTags,
          reason: editForm.value.reason,
          plannedDate: editForm.value.plannedDate,
        };

        await wishlistStore.updateWishlistItem(editForm.value.id, updateData);
        showEditDialog.value = false;
        ElMessage.success("更新成功");
      } catch (error) {
        console.error("更新失败:", error);
        ElMessage.error("更新失败，请重试");
      } finally {
        editLoading.value = false;
      }
    };

    // 排序方法
    const handleSortChange = (value) => {
      sortBy.value = value;
      ElMessage.success(`已按${value === "date" ? "添加时间" : "城市名称"}排序`);
    };

    const clearFilters = () => {
      sortBy.value = "date";
      ElMessage.success("已清除筛选条件");
    };

    // 数据加载方法（必须在 watch 之前定义）
    const loadWishlistData = async () => {
      // 确保用户已登录且有用户ID
      if (!userStore.isLoggedIn || !userStore.userId) {
        console.warn("⚠️ 用户未登录或用户ID未获取，跳过愿望清单加载");
        return;
      }

      console.log("🔄 开始加载愿望清单数据，用户ID:", userStore.userId);
      try {
        await wishlistStore.loadWishlist();
        console.log("✅ 愿望清单数据加载完成");
      } catch (error) {
        console.error("❌ 愿望清单数据加载失败:", error);
      }
    };

    // 页面初始化
    onMounted(async () => {
      loadCityData();

      // 等待用户状态稳定后加载数据
      console.log("🔍 onMounted 检查用户状态:", {
        isLoggedIn: userStore.isLoggedIn,
        userId: userStore.userId,
        currentUser: !!userStore.currentUser,
      });

      // 如果用户状态已就绪，立即加载
      if (userStore.isLoggedIn && userStore.userId) {
        await loadWishlistData();
      } else if (userStore.isLoggedIn) {
        // 用户已登录但ID未获取，等待一下
        console.log("⏳ 用户已登录但状态未完全恢复，等待200ms...");
        setTimeout(async () => {
          if (userStore.userId) {
            await loadWishlistData();
          }
        }, 200);
      }
    });

    // 监听用户登录状态变化
    watch(
      () => userStore.isLoggedIn,
      (isLoggedIn, oldValue) => {
        console.log("👤 用户登录状态变化:", {
          from: oldValue,
          to: isLoggedIn,
          userId: userStore.userId,
        });

        if (isLoggedIn && userStore.userId) {
          loadWishlistData();
        }
      },
      { immediate: false } // 改为 false，避免初始化时执行
    );

    // 监听用户ID变化
    watch(
      () => userStore.userId,
      (userId, oldValue) => {
        console.log("🆔 用户ID变化:", {
          from: oldValue,
          to: userId,
          isLoggedIn: userStore.isLoggedIn,
        });

        if (userId && userStore.isLoggedIn) {
          loadWishlistData();
        }
      },
      { immediate: false } // 改为 false，避免初始化时执行
    );

    // 开发环境调试方法
    if (import.meta.env.DEV) {
      window.debugFootprints = () => {
        console.log("🐛 FootprintsPage 调试信息:");
        console.log("- 用户登录状态:", userStore.isLoggedIn);
        console.log("- 用户ID:", userStore.userId);
        console.log("- 用户信息:", userStore.currentUser);
        console.log("- 愿望清单项目数:", wishlistStore.wishlistItems.length);
        console.log("- 去过的城市数:", wishlistStore.visitedCount);
        console.log("- 想去的城市数:", wishlistStore.wishlistOnlyCount);
        console.log("- 愿望清单详情:", wishlistStore.wishlistItems);
        return {
          userStore: userStore,
          wishlistStore: wishlistStore,
          loadWishlistData: loadWishlistData,
        };
      };

      window.forceReloadWishlist = () => {
        console.log("🔄 强制重新加载愿望清单...");
        loadWishlistData();
      };
    }

    return {
      wishlistStore,
      userStore,
      dialogContent,
      loadWishlistData,
      // 地图显示控制
      mapDisplayMode,
      mapDisplayItems,
      visitedCities,
      wishlistCities,
      filteredAndSortedWishlistCities,
      sortedWantToVisitAgainCities,
      // 排序控制
      sortBy,
      handleSortChange,
      clearFilters,
      // 全屏地图控制
      showFullscreenMap,
      fullscreenMapMode,
      fullscreenMapDisplayItems,
      // 编辑功能状态和方法
      showEditDialog,
      editLoading,
      editForm,
      toggleEditTag,
      handleSaveEdit,
      // 地图-卡片联动
      highlightedCity,
      handleCardClick,
      handleCardHover,
      handleMapCityClick,
      handleMapClick,
      handleMapRightClick,
      handleStatusChange,
      handleMarkAsVisited,
      handleCancelWantToVisitAgain,
      // 足迹功能
      handleShareFootprint,
      handleViewAchievements,
      // 照片事件处理
      handlePhotoUploaded,
      handlePhotoDeleted,
      // 卡片事件
      handleRemove,
      handleEdit,
      handleViewWeather,
      handlePlanTrip,
      // 类型选择功能
      showTypeSelection,
      selectedAddType,
      handleAddTypeSelection,
      handleOpenTypeSelection,
      handleAddVisitedCityDirect,
      handleAddWishlistCityDirect,
      // 快速添加功能
      showQuickAdd,
      quickAdding,
      quickAddForm,
      handleWeatherCityChange,
      handleQuickAddSubmit,
      handleQuickAddClose,
      // 城市相关
      displayCities,
      hotCities,
      searchResults,
      searchLoading,
      searchKeyword,
      searchCities,
      handleCitySelect,
      // 标签相关
      predefinedTags,
      toggleTag,
      // 地图相关
      handleFullscreenMap,
      // 新增的卡片功能方法
      getTagType,
      getTagIcon,
      formatAddedTime,
      formatPlannedDate,
      formatVisitDate,
      handleEditCity,
      handleDeleteCity,
    };
  },
};
</script>

<style scoped>
.footprints-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* 页面头部 */
.page-header {
  margin-bottom: 32px;
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(76, 94, 124, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(145, 168, 208, 0.06);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quick-actions-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}

.quick-actions-buttons .el-button {
  border-radius: 20px;
  padding: 8px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* 想去城市空状态样式 */
.empty-wishlist-state {
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-radius: 16px;
  padding: 40px 24px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  box-shadow: 0 2px 12px rgba(145, 168, 208, 0.06);
  text-align: center;
}

.empty-content h4 {
  margin: 20px 0 10px 0;
  font-size: 20px;
  font-weight: 600;
  color: #374151;
}

.empty-content p {
  margin: 0 0 30px 0;
  font-size: 16px;
  line-height: 1.5;
  color: #6b7280;
}

.empty-content .el-button {
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.3);
  transition: all 0.3s ease;
}

.empty-content .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(145, 168, 208, 0.4);
}

.quick-actions-buttons .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.3);
}

/* 去过的城市展示区域 */
.visited-cities-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(145, 168, 208, 0.1);
}

.page-title {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #1f2937 0%, #91a8d0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title .el-icon {
  font-size: 36px;
  color: #91a8d0;
  animation: sparkle 3s ease-in-out infinite;
}

@keyframes sparkle {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  25% {
    transform: scale(1.1) rotate(5deg);
    opacity: 0.8;
  }
  50% {
    transform: scale(0.9) rotate(-3deg);
    opacity: 1;
  }
  75% {
    transform: scale(1.05) rotate(2deg);
    opacity: 0.9;
  }
}

.page-subtitle {
  margin: 0;
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
  max-width: 500px;
}

.header-stats {
  display: flex;
  gap: 24px;
  flex-shrink: 0;
  min-width: 300px;
}

.stat-item {
  text-align: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border: 1px solid rgba(145, 168, 208, 0.1);
  min-width: 80px;
}

.stat-number {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #91a8d0;
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

/* 页面内容布局优化 */
.page-content {
  position: relative;
}

/* 心愿城市列表样式 */
.wishlist-section {
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  box-shadow: 0 2px 12px rgba(145, 168, 208, 0.06);
  margin-bottom: 24px;
}

/* 地图区域样式 - 全宽度版本 */
.map-section {
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(145, 168, 208, 0.12);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(145, 168, 208, 0.08);
  margin-bottom: 24px;
  min-height: 500px;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.map-title-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.map-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.map-title .el-icon {
  color: #91a8d0;
  font-size: 20px;
}

.footprint-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid transparent;
}

  .stat-badge.visited {
    background: rgba(91, 155, 213, 0.15);
    color: #5B9BD5;
    border-color: rgba(91, 155, 213, 0.3);
}

.stat-badge.wishlist {
  background: rgba(247, 202, 201, 0.15);
  color: #D4969A;
  border-color: rgba(247, 202, 201, 0.3);
}

.stat-badge.provinces {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  color: #7c3aed;
  border-color: rgba(124, 58, 237, 0.2);
}

.map-controls {
  display: flex;
  gap: 12px;
}

.map-container {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  min-height: 400px;
}

/* 心愿城市列表样式 */
.wishlist-section {
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  box-shadow: 0 2px 12px rgba(145, 168, 208, 0.06);
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-controls .el-select {
  border-radius: 8px;
}

.filter-controls .el-select .el-input__inner {
  border-color: rgba(145, 168, 208, 0.2);
  transition: all 0.3s ease;
}

.filter-controls .el-select .el-input__inner:focus {
  border-color: #91a8d0;
  box-shadow: 0 0 0 2px rgba(145, 168, 208, 0.1);
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title .el-icon {
  color: #91a8d0;
  font-size: 18px;
}

.section-actions {
  flex-shrink: 0;
}

/* 心愿城市卡片容器 - 优化版本 */
.wishlist-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
  padding: 4px;
}

.wishlist-cards-container::-webkit-scrollbar {
  width: 4px;
}

.wishlist-cards-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.wishlist-cards-container::-webkit-scrollbar-thumb {
  background: #91a8d0;
  border-radius: 2px;
}

/* 小型空状态 */
.empty-wishlist-mini {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-wishlist-mini p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

/* 空状态 */
.empty-wishlist {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-wishlist h4 {
  margin: 20px 0 10px 0;
  font-size: 20px;
  font-weight: 600;
  color: #374151;
}

/* 想再去城市区域样式 */
.want-again-cities-cards {
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-radius: 16px;
  padding: 20px 24px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  box-shadow: 0 2px 12px rgba(145, 168, 208, 0.06);
  margin-bottom: 24px;
}

.want-again-cities-cards .section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.want-again-cities-cards .section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.want-again-cities-cards .section-title .el-icon {
  color: #f59e0b;
  font-size: 20px;
}

.want-again-cities-cards .section-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
  font-weight: 400;
}

.want-again-card {
  border-left: 4px solid #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #fefefe 100%);
  transition: all 0.3s ease;
}

.want-again-card:hover {
  border-left-color: #d97706;
  background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(251, 191, 36, 0.15);
}

.want-again-badge {
  background: linear-gradient(135deg, #f7cac9 0%, #f5b7b1 100%);
  color: #8b4513;
  border: 1px solid rgba(247, 202, 201, 0.3);
}

.empty-wishlist p {
  margin: 0 0 30px 0;
  font-size: 16px;
  line-height: 1.5;
}

.empty-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

/* 悬浮按钮 */
.floating-actions {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 1000;
}

.fab-main {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(145, 168, 208, 0.3);
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border: none;
  transition: all 0.3s ease;
}

.fab-main:hover {
  transform: translateY(-4px) scale(1.1);
  box-shadow: 0 8px 24px rgba(145, 168, 208, 0.4);
}

/* 对话框样式 */
.wishlist-add-dialog {
  border-radius: 20px;
}

/* 编辑城市对话框样式 */
.edit-city-dialog {
  border-radius: 20px;
}

/* 编辑对话框头部样式 - 只显示关闭按钮 */
.edit-city-dialog :deep(.el-dialog__header) {
  background: transparent !important;
  background-color: transparent !important;
  padding: 16px 20px 0 20px !important;
  border: none !important;
  position: relative !important;
  height: auto !important;
}

.edit-city-dialog :deep(.el-dialog__header.show-close) {
  background: transparent !important;
  background-color: transparent !important;
}

.edit-city-dialog :deep(.el-dialog.is-align-center .el-dialog__header) {
  background: transparent !important;
  background-color: transparent !important;
}

.edit-city-dialog :deep(.el-dialog__title) {
  display: none !important;
}

.edit-city-dialog :deep(.el-dialog__headerbtn) {
  position: absolute !important;
  top: 16px !important;
  right: 20px !important;
  z-index: 10 !important;
  background: transparent !important;
  background-color: transparent !important;
  border-radius: 50% !important;
  width: 32px !important;
  height: 32px !important;
  box-shadow: none !important;
  border: none !important;
}

.edit-city-dialog :deep(.el-dialog__headerbtn):before {
  background: transparent !important;
  background-color: transparent !important;
}

.edit-city-dialog :deep(.el-dialog__headerbtn):after {
  background: transparent !important;
  background-color: transparent !important;
}

.edit-city-dialog :deep(.el-dialog__close) {
  color: #6b7280 !important;
  font-size: 16px !important;
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
}

.edit-city-dialog :deep(.el-dialog__close):hover {
  color: #374151 !important;
  background: transparent !important;
  background-color: transparent !important;
}

.edit-city-dialog :deep(.el-dialog__close):focus {
  background: transparent !important;
  background-color: transparent !important;
}

.edit-city-dialog :deep(.el-dialog__close):active {
  background: transparent !important;
  background-color: transparent !important;
}

.edit-city-dialog :deep(.el-dialog__body) {
  padding: 0 !important;
  margin-top: -20px !important;
}

/* 全局强制移除编辑对话框头部和关闭按钮的背景 */
.el-dialog.edit-city-dialog .el-dialog__header,
.el-dialog.edit-city-dialog .el-dialog__header.show-close,
.el-dialog.edit-city-dialog.is-align-center .el-dialog__header {
  background: transparent !important;
  background-color: transparent !important;
}

.el-dialog.edit-city-dialog .el-dialog__headerbtn,
.el-dialog.edit-city-dialog .el-dialog__close {
  background: transparent !important;
  background-color: transparent !important;
}

.el-dialog.edit-city-dialog .el-dialog__headerbtn:hover,
.el-dialog.edit-city-dialog .el-dialog__close:hover,
.el-dialog.edit-city-dialog .el-dialog__headerbtn:focus,
.el-dialog.edit-city-dialog .el-dialog__close:focus,
.el-dialog.edit-city-dialog .el-dialog__headerbtn:active,
.el-dialog.edit-city-dialog .el-dialog__close:active {
  background: transparent !important;
  background-color: transparent !important;
}

/* 类型选择对话框样式 */
.type-selection-dialog {
  border-radius: 20px;
}

.type-selection-content {
  padding: 32px 24px;
}

.type-selection-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(145, 168, 208, 0.1);
}

.type-selection-header .header-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.type-selection-header .header-text h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.type-selection-header .header-text p {
  margin: 0;
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
}

.type-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.type-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
}

.type-option:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 16px rgba(145, 168, 208, 0.15);
  transform: translateY(-2px);
}

.wishlist-option:hover {
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
}

.visited-option:hover {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.type-option .option-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.wishlist-option .option-icon {
  background: linear-gradient(135deg, #91a8d0 0%, #6366f1 100%);
  color: white;
}

.visited-option .option-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.type-option .option-content h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.type-option .option-content p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.type-selection-actions {
  display: flex;
  justify-content: center;
  padding-top: 20px;
  border-top: 1px solid rgba(145, 168, 208, 0.1);
}

.type-selection-actions .el-button {
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 500;
  border-color: #d1d5db;
  color: #6b7280;
}

.dialog-content {
  padding: 32px 24px;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(145, 168, 208, 0.1);
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.header-text h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.header-text p {
  margin: 0;
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
}

.add-form .el-form-item {
  margin-bottom: 24px;
}

.add-form .el-form-item__label {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.city-selector {
  width: 100%;
}

.city-option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.city-option .city-name,
.city-option-content .city-name {
  font-weight: 400;
  color: #1f2937;
}

.city-code {
  font-size: 12px;
  color: #9ca3af;
}

.no-results {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #9ca3af;
  font-size: 14px;
}

/* 状态选择样式 */
.status-form-item .status-radio-group {
  width: 100%;
  display: flex;
}

.status-radio-group .el-radio-button {
  flex: 1;
}

.status-radio-group .el-radio-button__inner {
  width: 100%;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 20px;
}

.wishlist-radio .el-radio-button__inner {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #64748b;
}

.wishlist-radio.is-active .el-radio-button__inner {
  background: linear-gradient(135deg, #91a8d0 0%, #6366f1 100%);
  border-color: #91a8d0;
  color: white;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.3);
}

.visited-radio .el-radio-button__inner {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #64748b;
}

.visited-radio.is-active .el-radio-button__inner {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-color: #f59e0b;
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

/* 标签选择 */
.tags-selection {
  width: 100%;
}

.predefined-tags {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
}

.tag-item {
  background: var(--tag-color, #91a8d0) !important;
  color: white !important;
  border: 2px solid transparent !important;
  border-radius: 20px !important;
  padding: 8px 16px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  cursor: pointer;
  text-align: center;
  opacity: 0.8;
}

.tag-item:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  opacity: 0.9;
}

.tag-item.is-checked {
  opacity: 1 !important;
  border-color: #1f2937 !important;
  transform: translateY(-2px) scale(1.05) !important;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25) !important;
  font-weight: 600 !important;
}

/* 原因输入 */
.reason-input {
  width: 100%;
}

.reason-input .el-textarea__inner {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 15px;
  line-height: 1.6;
  resize: none;
}

.reason-input .el-textarea__inner:focus {
  border-color: #91a8d0;
  box-shadow: 0 0 0 3px rgba(145, 168, 208, 0.1);
}

/* 旅行时间选择器样式 */
.travel-time-form-item .el-form-item__label {
  color: #374151;
  font-weight: 600;
}

.travel-time-picker {
  width: 100%;
}

.travel-time-picker .el-input__inner {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 15px;
  transition: all 0.3s ease;
}

.travel-time-picker .el-input__inner:focus {
  border-color: #91a8d0;
  box-shadow: 0 0 0 3px rgba(145, 168, 208, 0.1);
}

/* 旅行感受输入框样式 */
.travel-feeling-form-item .el-form-item__label {
  color: #374151;
  font-weight: 600;
}

.travel-feeling-input {
  width: 100%;
}

.travel-feeling-input .el-textarea__inner {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 15px;
  line-height: 1.6;
  resize: none;
  transition: all 0.3s ease;
}

.travel-feeling-input .el-textarea__inner:focus {
  border-color: #91a8d0;
  box-shadow: 0 0 0 3px rgba(145, 168, 208, 0.1);
}

/* 表单提示文字样式 */
.form-hint {
  margin-top: 6px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

/* 对话框操作按钮 */
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid rgba(145, 168, 208, 0.1);
}

.cancel-btn {
  border-radius: 12px !important;
  padding: 12px 24px !important;
  font-weight: 500 !important;
  border-color: #d1d5db !important;
  color: #6b7280 !important;
}

.submit-btn {
  border-radius: 12px !important;
  padding: 12px 24px !important;
  font-weight: 600 !important;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.3) !important;
}

.submit-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(145, 168, 208, 0.4) !important;
}

/* 状态切换控制区域样式 */
.view-control-section {
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-radius: 16px;
  padding: 20px 24px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  box-shadow: 0 2px 12px rgba(145, 168, 208, 0.06);
  margin-bottom: 24px;
}

.control-header {
  margin-bottom: 20px;
}

.control-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-title .el-icon {
  color: #91a8d0;
  font-size: 20px;
}

.control-subtitle {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.view-mode-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.mode-button {
  border-radius: 12px !important;
  padding: 12px 20px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.mode-button:not(.el-button--primary) {
  background: #f8fafc !important;
  border-color: #e2e8f0 !important;
  color: #64748b !important;
}

.mode-button:not(.el-button--primary):hover {
  background: #f1f5f9 !important;
  border-color: #91a8d0 !important;
  color: #1f2937 !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.15) !important;
}

.mode-button.el-button--primary {
  background: linear-gradient(135deg, #91a8d0 0%, #6366f1 100%) !important;
  border: none !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.3) !important;
}

.mode-count {
  font-size: 12px;
  opacity: 0.8;
  margin-left: 4px;
}

/* 动态内容展示区域 */
.content-display-area {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 去过的城市照片展示区域 */
.visited-cities-photos {
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-radius: 16px;
  padding: 20px 24px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  box-shadow: 0 2px 12px rgba(145, 168, 208, 0.06);
}

.photos-scroll-container {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 8px 0;
  scroll-behavior: smooth;
}

.photos-scroll-container::-webkit-scrollbar {
  height: 6px;
}

.photos-scroll-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.photos-scroll-container::-webkit-scrollbar-thumb {
  background: #91a8d0;
  border-radius: 3px;
}

.city-photo-item {
  flex-shrink: 0;
  width: 200px;
}

.photo-wrapper {
  position: relative;
  width: 100%;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.photo-wrapper:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.city-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.photo-wrapper:hover .city-photo {
  transform: scale(1.05);
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 16px 12px 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  opacity: 0;
  transition: all 0.3s ease;
}

.photo-wrapper:hover .photo-overlay {
  opacity: 1;
}

.photo-overlay .city-name {
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.upload-btn {
  background: rgba(255, 255, 255, 0.9) !important;
  color: #1f2937 !important;
  border: none !important;
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  transition: all 0.3s ease !important;
}

.upload-btn:hover {
  background: white !important;
  transform: scale(1.1) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

.empty-photos {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
  min-width: 300px;
}

.empty-photos .el-icon {
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-photos p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

/* 想去的城市卡片展示区域 - 增强版 */
.wishlist-cities-cards {
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-radius: 16px;
  padding: 20px 24px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  box-shadow: 0 2px 12px rgba(145, 168, 208, 0.06);
}

.simple-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
  max-height: 450px;
  overflow-y: auto;
  padding: 4px;
}

.simple-cards-container::-webkit-scrollbar {
  width: 4px;
}

.simple-cards-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.simple-cards-container::-webkit-scrollbar-thumb {
  background: #91a8d0;
  border-radius: 2px;
}

/* 增强版卡片样式 */
.enhanced-wishlist-card {
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border: 1px solid rgba(145, 168, 208, 0.1);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(145, 168, 208, 0.08);
}

.enhanced-wishlist-card:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-color: #91a8d0;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(145, 168, 208, 0.15);
}

/* 卡片主要内容区域 - 优化按钮空间 */
.card-main-content {
  padding: 16px;
  padding-right: 160px; /* 为横向排列的操作按钮留出更多空间 */
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.city-info {
  flex: 1;
  position: relative;
}

/* 重访标识样式 */
.revisit-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  box-shadow: 0 2px 6px rgba(251, 191, 36, 0.4);
  animation: revisitPulse 2s ease-in-out infinite;
}

.revisit-badge .el-icon {
  font-size: 10px;
}

@keyframes revisitPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.card-city-name {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.2;
}

.added-time {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 400;
}

/* 卡片操作按钮重新设计 - 优化布局 */
.card-actions {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  min-width: 140px;
}

/* 当没有主要操作按钮时，调整布局 */
.card-actions:not(:has(.primary-action)) {
  justify-content: flex-end;
}

.card-actions:not(:has(.primary-action)) .secondary-actions {
  gap: 10px;
}

.primary-action {
  display: flex;
  flex-shrink: 0;
}

.secondary-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
  padding: 6px 10px !important;
  border-radius: 8px !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border: 1px solid transparent !important;
  min-height: 28px !important;
  white-space: nowrap !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

.action-btn .action-text {
  font-size: 10px;
  font-weight: 500;
}

  .visited-btn {
    background: linear-gradient(135deg, #409EFF 0%, #337ECC 100%) !important;
    color: white !important;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3) !important;
    border: none !important;
    position: relative !important;
    overflow: hidden !important;
}

  .visited-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  .visited-btn:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4) !important;
    background: linear-gradient(135deg, #66B1FF 0%, #409EFF 100%) !important;
  }

  .visited-btn:hover::before {
    left: 100%;
  }

  .visited-btn:active {
    transform: translateY(0) !important;
    box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3) !important;
  }

.edit-btn {
  background: #f8fafc !important;
  color: #6b7280 !important;
  border-color: #e2e8f0 !important;
}

.edit-btn:hover {
  background: #91a8d0 !important;
  color: white !important;
  border-color: #91a8d0 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 8px rgba(145, 168, 208, 0.3) !important;
}

.more-btn {
  background: #f8fafc !important;
  color: #6b7280 !important;
  border-color: #e2e8f0 !important;
  padding: 6px !important;
  min-width: 28px !important;
  width: 28px !important;
  height: 28px !important;
}

.more-btn:hover {
  background: #f1f5f9 !important;
  color: #374151 !important;
  border-color: #d1d5db !important;
}

/* 增强版标签样式 */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

/* 标签样式改进 - 使用统一色彩方案 */
.enhanced-tag {
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
  font-size: 11px !important;
  padding: 4px 8px !important;
  border-radius: 12px !important;
  font-weight: 500 !important;
  border: 1px solid transparent !important;
  transition: all 0.2s ease !important;
  background: var(--tag-color, #91a8d0) !important;
  color: white !important;
  opacity: 0.9;
}

.enhanced-tag .tag-icon {
  font-size: 10px;
}

.enhanced-tag:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1) !important;
  opacity: 1;
}

.more-tags {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
}

.card-reason {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 规划信息样式 */
.planning-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.plan-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  padding: 4px 8px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid rgba(145, 168, 208, 0.1);
}

.plan-icon {
  font-size: 12px;
  color: #91a8d0;
}

/* 下拉菜单样式 */
.delete-item {
  color: #ef4444 !important;
}

.delete-item:hover {
  background-color: #fee2e2 !important;
}

.empty-wishlist {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.empty-filtered {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 2px dashed #d1d5db;
}

.empty-filtered .el-icon {
  color: #9ca3af;
  margin-bottom: 8px;
}

.empty-filtered p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.empty-filtered .el-button {
  border-radius: 8px;
  font-size: 13px;
}

.empty-wishlist .el-icon {
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-wishlist p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

/* 响应式设计 */

/* 中等屏幕优化 (769px - 1024px) */
@media (max-width: 1024px) and (min-width: 769px) {
  .card-actions {
    min-width: 130px;
    gap: 8px;
  }

  .action-btn {
    font-size: 10px !important;
    padding: 5px 8px !important;
  }

  .card-main-content {
    padding-right: 150px;
  }
}

@media (max-width: 768px) {
  .footprints-page {
    padding: 16px 12px;
  }

  .page-header {
    padding: 24px 20px;
    margin-bottom: 24px;
  }

  .header-content {
    gap: 16px;
  }

  .header-left {
    gap: 12px;
  }

  /* 移动端头部照片展示 */
  .header-visited-cities {
    padding: 16px 20px;
    border-radius: 16px;
  }

  .header-visited-cities::after {
    font-size: 8px;
    letter-spacing: 1px;
  }

  .header-photos-container {
    gap: 12px;
    padding: 8px 4px 6px;
  }

  .header-visited-cities .city-photo-item {
    width: 80px;
  }

  .header-visited-cities .photo-wrapper {
    height: 60px;
  }

  .header-visited-cities .city-name {
    font-size: 10px;
  }

  .header-visited-cities .visit-date {
    font-size: 8px;
  }

  .film-holes .hole {
    width: 2px;
    height: 2px;
  }

  .more-cities-btn {
    width: 80px;
    height: 60px;
  }

  .more-cities-btn .el-button {
    font-size: 11px !important;
  }

  .quick-actions-buttons {
    gap: 12px;
  }

  .page-title {
    font-size: 28px;
    gap: 10px;
  }

  .page-title .el-icon {
    font-size: 32px;
  }

  .quick-actions-buttons {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .quick-actions-buttons .el-button {
    width: 100%;
  }

  .header-stats {
    gap: 16px;
    justify-content: center;
    min-width: unset;
    width: 100%;
  }

  /* 移动端地图区域优化 */
  .map-section {
    padding: 16px;
    min-height: 300px;
    margin-bottom: 16px;
  }

  .map-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .map-title-group {
    width: 100%;
  }

  .footprint-stats {
    flex-wrap: wrap;
    gap: 8px;
  }

  .stat-badge {
    font-size: 12px;
    padding: 4px 8px;
  }

  .map-title {
    font-size: 16px;
  }

  .map-container {
    min-height: 250px;
  }

  /* 移动端单栏布局 - 移除不需要的样式 */
  .wishlist-section {
    padding: 16px;
  }

  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .section-title {
    font-size: 14px;
  }

  .section-actions {
    width: 100%;
  }

  .section-actions .el-button-group {
    width: 100%;
  }

  .section-actions .el-button {
    flex: 1;
    font-size: 12px;
  }

  /* 移动端卡片容器 */
  .wishlist-cards-container {
    grid-template-columns: 1fr;
    gap: 8px;
    max-height: 300px;
  }

  .empty-wishlist-mini {
    padding: 30px 16px;
  }

  .floating-actions {
    bottom: 24px;
    right: 24px;
  }

  .fab-main {
    width: 48px;
    height: 48px;
  }

  /* 移动端状态切换控制区域 */
  .view-control-section {
    padding: 16px 20px;
    margin-bottom: 16px;
  }

  .control-header {
    margin-bottom: 16px;
  }

  .control-title {
    font-size: 16px;
  }

  .control-subtitle {
    font-size: 13px;
  }

  /* 移动端空状态样式 */
  .empty-wishlist-state {
    padding: 30px 20px;
  }

  .empty-content h4 {
    font-size: 18px;
  }

  .empty-content p {
    font-size: 14px;
    margin-bottom: 24px;
  }

  .empty-content .el-button {
    padding: 10px 20px;
    font-size: 14px;
  }

  .view-mode-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .mode-button {
    width: 100% !important;
    justify-content: center !important;
    padding: 10px 16px !important;
    font-size: 14px !important;
  }

  /* 移动端动态内容展示区域 */
  .content-display-area {
    gap: 16px;
  }

  /* 移动端照片展示区域 */
  .visited-cities-photos {
    padding: 16px 20px;
  }

  .photos-scroll-container {
    gap: 12px;
  }

  .city-photo-item {
    width: 160px;
  }

  .photo-wrapper {
    height: 120px;
  }

  .photo-overlay {
    padding: 12px 10px 8px;
  }

  .city-name {
    font-size: 13px;
  }

  .upload-btn {
    width: 28px !important;
    height: 28px !important;
  }

  .empty-photos {
    padding: 30px 16px;
    min-width: 250px;
  }

  .empty-photos .el-icon {
    font-size: 40px !important;
  }

  .empty-photos p {
    font-size: 13px;
  }

  /* 移动端卡片展示区域 */
  /* 移动端卡片展示区域优化 */
  .wishlist-cities-cards,
  .want-again-cities-cards {
    padding: 16px 20px;
  }

  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .section-controls {
    width: 100%;
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .filter-controls {
    width: 100%;
    justify-content: space-between;
  }

  .filter-controls .el-select {
    flex: 1;
  }

  .section-controls .el-button {
    width: 100%;
    justify-content: center;
  }

  .simple-cards-container {
    grid-template-columns: 1fr;
    gap: 14px;
    max-height: 350px;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }

  /* 移动端滚动优化 */
  .simple-cards-container::-webkit-scrollbar {
    width: 3px;
  }

  .simple-cards-container::-webkit-scrollbar-thumb {
    background: rgba(145, 168, 208, 0.5);
    border-radius: 2px;
  }

  /* 移动端性能优化 */
  .enhanced-wishlist-card {
    will-change: transform;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }

  .enhanced-wishlist-card:active {
    transform: translateY(0px) scale(0.98);
    transition: transform 0.1s ease;
  }

  .enhanced-wishlist-card {
    border-radius: 12px;
  }

  .enhanced-wishlist-card:hover {
    transform: translateY(-2px); /* 移动端减少移动距离 */
  }

  /* 移动端触摸优化 */
  .enhanced-wishlist-card {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  /* 移动端卡片操作按钮优化 */
  .card-actions {
    position: static !important;
    flex-direction: row !important;
    gap: 6px !important;
    margin-top: 12px !important;
    margin-left: 0 !important;
    padding-top: 12px !important;
    border-top: 1px solid #f1f5f9 !important;
    min-width: auto !important;
  }

  .card-main-content {
    padding: 14px;
    padding-right: 14px;
  }

  .primary-action {
    flex: 1;
  }

  .secondary-actions {
    flex-shrink: 0;
  }

  .action-btn {
    min-height: 36px !important;
    touch-action: manipulation;
    font-size: 11px !important;
  }

  .visited-btn {
    width: 100% !important;
    justify-content: center !important;
  }

  .action-btn .action-text {
    font-size: 10px;
  }

  .enhanced-tag {
    font-size: 10px !important;
    padding: 3px 6px !important;
    min-height: 24px !important;
    touch-action: manipulation;
  }

  /* 移动端下拉菜单优化 */
  .el-dropdown-menu {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
  }

  .el-dropdown-menu .el-dropdown-menu__item {
    padding: 12px 16px !important;
    font-size: 14px !important;
    line-height: 1.5 !important;
    min-height: 44px !important;
    display: flex !important;
    align-items: center !important;
  }

  .priority-indicator {
    top: 12px;
    right: 12px;
    padding: 4px 8px;
  }

  .priority-label {
    font-size: 10px;
  }

  .priority-star {
    font-size: 8px;
  }

  .card-main-content {
    padding: 14px;
    padding-top: 18px;
  }

  .card-city-name {
    font-size: 16px;
  }

  .added-time {
    font-size: 11px;
  }

  .card-actions .el-button {
    width: 26px !important;
    height: 26px !important;
    padding: 4px !important;
  }

  .enhanced-tag {
    font-size: 11px !important;
    padding: 3px 8px !important;
  }

  .enhanced-tag .tag-icon {
    font-size: 9px;
  }

  .more-tags {
    font-size: 11px;
    padding: 3px 6px;
  }

  .card-reason {
    font-size: 13px;
  }

  .planning-info {
    gap: 8px;
    padding-top: 10px;
  }

  .plan-item {
    font-size: 12px;
    padding: 3px 6px;
  }

  .plan-icon {
    font-size: 11px;
  }

  .empty-wishlist {
    padding: 30px 16px;
    min-height: 150px;
  }

  .empty-wishlist .el-icon {
    font-size: 40px !important;
  }

  .empty-wishlist p {
    font-size: 13px;
  }

  /* 移动端对话框优化 */
  .wishlist-add-dialog {
    width: 95% !important;
    margin: 0 auto !important;
    max-height: 90vh !important;
    overflow-y: auto !important;
  }

  .edit-city-dialog {
    width: 95% !important;
    margin: 0 auto !important;
    max-height: 90vh !important;
    overflow-y: auto !important;
  }

  /* 移动端表单优化 */
  .edit-form .el-form-item {
    margin-bottom: 20px;
  }

  .edit-form .el-input,
  .edit-form .el-textarea,
  .edit-form .el-select,
  .edit-form .el-date-picker,
  .edit-form .el-input-number {
    font-size: 16px !important; /* 防止iOS自动缩放 */
    min-height: 44px !important; /* 符合苹果触摸指南 */
  }

  .edit-form .el-radio-button__inner {
    min-height: 44px !important;
    padding: 12px 16px !important;
    font-size: 14px !important;
    touch-action: manipulation;
  }

  .edit-form .el-check-tag {
    min-height: 36px !important;
    padding: 8px 16px !important;
    font-size: 14px !important;
    touch-action: manipulation;
  }

  /* 移动端按钮优化 */
  .dialog-footer .el-button {
    min-height: 44px !important;
    font-size: 16px !important;
    touch-action: manipulation;
  }

  .type-selection-dialog {
    width: 95% !important;
    margin: 0 auto !important;
  }

  .type-selection-content {
    padding: 24px 20px;
  }

  .type-selection-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
  }

  .type-selection-header .header-icon {
    width: 40px;
    height: 40px;
  }

  .type-selection-header .header-text h3 {
    font-size: 20px;
  }

  .type-selection-header .header-text p {
    font-size: 14px;
  }

  .type-options {
    gap: 12px;
    margin-bottom: 24px;
  }

  .type-option {
    padding: 16px;
  }

  .type-option .option-icon {
    width: 48px;
    height: 48px;
  }

  .type-option .option-content h4 {
    font-size: 16px;
  }

  .type-option .option-content p {
    font-size: 13px;
  }

  .dialog-content {
    padding: 24px 20px;
  }

  .dialog-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
  }

  .header-icon {
    width: 40px;
    height: 40px;
  }

  .header-text h3 {
    font-size: 20px;
  }

  .header-text p {
    font-size: 14px;
  }

  .add-form .el-form-item {
    margin-bottom: 20px;
  }

  .add-form .el-form-item__label {
    font-size: 15px;
  }

  .status-radio-group .el-radio-button__inner {
    padding: 10px 16px;
    font-size: 14px;
  }

  .predefined-tags {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 6px;
  }

  .tag-item {
    font-size: 12px !important;
    padding: 6px 12px !important;
  }

  .dialog-actions {
    margin-top: 24px;
    padding-top: 16px;
    flex-direction: column;
    gap: 12px;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
    padding: 14px 20px;
    font-size: 14px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .page-header {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border-color: rgba(99, 102, 241, 0.2);
  }

  .page-title {
    background: linear-gradient(135deg, #f9fafb 0%, #f7cac9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .page-subtitle {
    color: #d1d5db;
  }

  .stat-item {
    background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
    border-color: rgba(99, 102, 241, 0.2);
  }

  .stat-number {
    color: #f7cac9;
  }

  .stat-label {
    color: #d1d5db;
  }
}

/* 全屏地图对话框样式 */
.fullscreen-map-dialog {
  border-radius: 16px;
}

.fullscreen-map-dialog .el-dialog__body {
  padding: 0;
}

.fullscreen-map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-bottom: 1px solid rgba(145, 168, 208, 0.1);
  border-radius: 16px 16px 0 0;
}

.fullscreen-map-header .map-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.fullscreen-map-header .map-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.fullscreen-map-header .stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  border: 1px solid rgba(145, 168, 208, 0.1);
}

.fullscreen-map-header .map-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.display-mode-toggle .el-button-group .el-button {
  border-radius: 8px !important;
  font-size: 12px;
  padding: 8px 16px;
  border-color: #e2e8f0 !important;
}

.fullscreen-map-content {
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 0 0 16px 16px;
}

/* 移动端全屏地图优化 */
@media (max-width: 768px) {
  .fullscreen-map-dialog {
    width: 100% !important;
    top: 0 !important;
    margin: 0 !important;
    border-radius: 0;
  }

  .fullscreen-map-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    padding: 16px 20px;
    border-radius: 0;
  }

  .fullscreen-map-header .map-info h3 {
    font-size: 18px;
  }

  .fullscreen-map-header .map-stats {
    gap: 8px;
  }

  .fullscreen-map-header .stat-item {
    font-size: 12px;
    padding: 4px 8px;
  }

  .fullscreen-map-header .map-controls {
    width: 100%;
    justify-content: space-between;
    flex-direction: row-reverse;
  }

  .display-mode-toggle .el-button-group {
    flex: 1;
  }

  .display-mode-toggle .el-button-group .el-button {
    flex: 1;
    font-size: 11px;
    padding: 6px 8px;
  }

  .fullscreen-map-content {
    padding: 12px;
    border-radius: 0;
  }
}
</style>
