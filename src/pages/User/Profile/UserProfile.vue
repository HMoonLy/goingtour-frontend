<template>
  <div class="user-profile-page">
    <div class="page-header" v-loading="loadingProfile">
      <div class="cover-image" :style="coverStyle">
        <div class="cover-overlay"></div>
      </div>
      
      <div class="profile-info-container">
        <div class="profile-card">
          <div class="profile-header-row">
            <!-- 左侧头像 -->
            <div class="avatar-section">
              <div class="avatar-wrapper">
                <el-avatar 
                  :size="110" 
                  :src="getAvatarUrl(userInfo?.avatar)" 
                  class="user-avatar"
                  shape="circle"
                />
                <div class="verification-badge" v-if="userInfo?.verified">
                  <el-icon :size="14"><Select /></el-icon>
                </div>
              </div>
            </div>

            <!-- 右侧信息 -->
            <div class="info-section">
              <div class="info-top">
                <div class="name-wrap">
                  <h1 class="nickname">{{ userInfo?.nickname || '用户' }}</h1>
                  <el-tag v-if="userInfo?.verified" size="small" type="success" effect="light" round class="verified-tag">
                    <el-icon class="mr-1"><Select /></el-icon> 认证旅行家
                  </el-tag>
                </div>
                
                <div class="action-buttons">
                  <template v-if="isCurrentUser">
                    <el-button class="edit-btn" round @click="router.push('/user/settings')">
                      编辑资料
                    </el-button>
                  </template>
                  <template v-else>
                    <el-button 
                      :type="followStatus.isFollowing ? 'default' : 'primary'" 
                      round 
                      class="action-btn"
                      :class="{ 'following': followStatus.isFollowing }"
                      :loading="followLoading"
                      @click="toggleFollow"
                    >
                      <template v-if="!followStatus.isFollowing">
                        <el-icon><Plus /></el-icon> 关注
                      </template>
                      <template v-else>
                        {{ followStatus.isMutual ? '互相关注' : '已关注' }}
                      </template>
                    </el-button>
                    <el-button round class="action-btn" @click="handleMessage">
                      私信
                    </el-button>
                  </template>
                </div>
              </div>

              <div class="stats-bar">
                <div class="stat-item clickable" @click="openFollowList('following')">
                  <span class="count">{{ formatCount(userInfo?.followingCount) }}</span>
                  <span class="label">关注</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item clickable" @click="openFollowList('followers')">
                  <span class="count">{{ formatCount(userInfo?.followersCount) }}</span>
                  <span class="label">粉丝</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="count">{{ formatCount(userInfo?.totalLikes) }}</span>
                  <span class="label">获赞</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="count">{{ formatCount(userInfo?.visitedCitiesCount) }}</span>
                  <span class="label">足迹</span>
                </div>
              </div>
              
              <div class="bio-section">
                <p class="bio" :class="{ 'empty': !userInfo?.bio }">
                  {{ userInfo?.bio || '这个人很懒，什么都没写~' }}
                </p>
              </div>

              <div class="meta-info">
                <div class="meta-item" v-if="userInfo?.location">
                  <el-icon><Location /></el-icon>
                  <span>{{ userInfo.location }}</span>
                </div>
                <div class="meta-item">
                  <span class="id-label">ID:</span>
                  <span>{{ userInfo?.id }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="content-section">
      <el-tabs v-model="activeTab" class="profile-tabs">
        <el-tab-pane label="动态" name="moments">
          <div class="tab-content" v-loading="loadingPosts">
            <div v-if="posts.length > 0" class="posts-grid">
              <PostCard 
                v-for="post in posts" 
                :key="post.id" 
                :post="post"
                @click="router.push(`/community/post/${post.id}`)"
              />
            </div>
            <el-empty v-else description="暂无动态" />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="行程" name="trips">
          <div class="tab-content" v-loading="loadingTrips">
            <div v-if="trips.length > 0" class="trips-list">
              <div 
                v-for="trip in trips" 
                :key="trip.id" 
                class="trip-card"
                @click="viewTrip(trip)"
              >
                <div class="trip-cover" :style="{ backgroundImage: `url(${getTripCover(trip)})` }">
                  <div class="trip-status-badge">
                    {{ trip.status === 2 ? '已发布' : '规划中' }}
                  </div>
                </div>
                <div class="trip-info">
                  <h3>{{ trip.title }}</h3>
                  <div class="trip-meta">
                    <span><el-icon><Location /></el-icon> {{ trip.destination }}</span>
                    <span><el-icon><Calendar /></el-icon> {{ trip.days }}天</span>
                  </div>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无行程" />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="足迹" name="footprints">
          <div class="tab-content" v-loading="loadingFootprints">
            <VisitedCitiesGallery 
              :visited-cities-data="visitedCities"
              :readonly="true"
              :max-display-count="12"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 关注列表弹窗 -->
    <FollowListModal
      v-model="showFollowList"
      :type="followListType"
      :user-id="parseInt(route.params.userId)"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { userApi } from '@/api/user';
import { communityApi } from '@/api/community';
import { tripApi } from '@/api/trip';
import { followApi } from '@/api/follow';
import { footprintService } from '@/services/user/footprintService';
import { getAvatarUrl, getCityPhotoUrl } from '@/utils/media/imageUrl';
import { ElMessage } from 'element-plus';
import { Location, User, Edit, Plus, Message, Select, Calendar } from '@element-plus/icons-vue';

import PostCard from '@/components/Community/PostCard.vue';
import VisitedCitiesGallery from '@/components/Common/Footprints/VisitedCitiesGallery.vue';
import FollowListModal from '@/components/User/FollowListModal.vue';
import { convertBackendTripToFrontend } from "@/utils/data/tripDataConverter.js";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 状态
const loadingProfile = ref(false);
const userInfo = ref(null);
const followStatus = ref({ isFollowing: false, isMutual: false });
const followLoading = ref(false);

const activeTab = ref('moments');

// 动态数据
const loadingPosts = ref(false);
const posts = ref([]);

// 行程数据
const loadingTrips = ref(false);
const trips = ref([]);

// 足迹数据
const loadingFootprints = ref(false);
const visitedCities = ref([]);

// 关注列表弹窗
const showFollowList = ref(false);
const followListType = ref('followers');

// 计算属性
const isCurrentUser = computed(() => {
  return userStore.isLoggedIn && parseInt(route.params.userId) === userStore.userId;
});

const coverStyle = computed(() => {
  const url = userInfo.value?.coverImage;
  if (url) {
    return { backgroundImage: `url(${url})` };
  }
  return { background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' };
});

// 方法
const formatCount = (count) => {
  if (!count) return 0;
  if (count > 10000) return (count / 10000).toFixed(1) + 'w';
  return count;
};

const getTripCover = (trip) => {
  // 简单逻辑：如果有 destinationInfo 图片则使用，否则用默认
  return trip.destinationInfo?.coverImage || '/vite.svg';
};

const loadProfile = async () => {
  const userId = route.params.userId;
  if (!userId) return;
  
  loadingProfile.value = true;
  try {
    const res = await userApi.getUserProfile(userId);
    if (res.data) {
      userInfo.value = res.data;
      
      // 如果已登录且不是本人，获取关注状态
      if (userStore.isLoggedIn && !isCurrentUser.value) {
        const statusRes = await followApi.getFollowStatus(userId);
        if (statusRes.data) {
          followStatus.value = statusRes.data;
        }
      }
    }
  } catch (error) {
    console.error('Failed to load profile:', error);
    ElMessage.error('加载用户信息失败');
  } finally {
    loadingProfile.value = false;
  }
};

const loadPosts = async () => {
  const userId = route.params.userId;
  loadingPosts.value = true;
  try {
    const res = await communityApi.getUserPosts(userId, { page: 1, pageSize: 20 });
    if (res.data && res.data.list) {
      posts.value = res.data.list;
    }
  } catch (error) {
    console.error('Failed to load posts:', error);
  } finally {
    loadingPosts.value = false;
  }
};

const loadTrips = async () => {
  const userId = route.params.userId;
  loadingTrips.value = true;
  try {
    const res = await tripApi.getUserTrips(userId);
    if (res.data) {
      // 过滤只显示已发布的行程 (除非是看自己的)
      let list = res.data.map(convertBackendTripToFrontend);
      if (!isCurrentUser.value) {
        list = list.filter(t => t.status === 2); // 假设 2 是已发布
      }
      trips.value = list;
    }
  } catch (error) {
    console.error('Failed to load trips:', error);
  } finally {
    loadingTrips.value = false;
  }
};

const loadFootprints = async () => {
  const userId = route.params.userId;
  loadingFootprints.value = true;
  try {
    // 使用 service 加载
    const cities = await footprintService.loadUserVisitedCities(userId);
    visitedCities.value = cities || [];
  } catch (error) {
    console.error('Failed to load footprints:', error);
  } finally {
    loadingFootprints.value = false;
  }
};

const toggleFollow = async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }
  
  const userId = route.params.userId;
  followLoading.value = true;
  try {
    if (followStatus.value.isFollowing) {
      await followApi.unfollowUser(userId);
      followStatus.value.isFollowing = false;
      userInfo.value.followersCount = Math.max(0, (userInfo.value.followersCount || 0) - 1);
      ElMessage.success('已取消关注');
    } else {
      await followApi.followUser(userId);
      followStatus.value.isFollowing = true;
      userInfo.value.followersCount = (userInfo.value.followersCount || 0) + 1;
      ElMessage.success('关注成功');
    }
  } catch (error) {
    console.error('Follow action failed:', error);
    ElMessage.error('操作失败');
  } finally {
    followLoading.value = false;
  }
};

const handleMessage = () => {
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }
  ElMessage.info('私信功能开发中...');
};

const openFollowList = (type) => {
  followListType.value = type;
  showFollowList.value = true;
};

const viewTrip = (trip) => {
  // 如果是自己的且是草稿，去编辑；否则去详情
  if (isCurrentUser.value && trip.status === 1) { // 假设 1 是草稿
    router.push(`/trip/create?loadDraft=${trip.id}`);
  } else {
    router.push(`/share/trip/${trip.id}`); // 使用分享页或详情页
  }
};

// 监听路由参数变化（同一个组件复用）
watch(() => route.params.userId, (newId) => {
  if (newId) {
    loadProfile();
    // 重置 tab 并加载数据
    activeTab.value = 'moments';
    loadPosts();
  }
}, { immediate: true });

// 监听 tab 切换加载数据
watch(activeTab, (newTab) => {
  if (newTab === 'trips' && trips.value.length === 0) {
    loadTrips();
  } else if (newTab === 'footprints' && visitedCities.value.length === 0) {
    loadFootprints();
  }
});
</script>

<style scoped>
.user-profile-page {
  min-height: 100vh;
  background: #f6f7f8;
  padding-bottom: 40px;
}

.page-header {
  background: transparent;
  margin-bottom: 0;
  position: relative;
}

.cover-image {
  height: 280px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.2));
}

.profile-info-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 10;
  margin-top: -60px;
}

.profile-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  padding: 24px;
  position: relative;
}

.profile-header-row {
  display: flex;
  gap: 24px;
}

.avatar-section {
  flex-shrink: 0;
  margin-top: -60px;
}

.avatar-wrapper {
  position: relative;
  border-radius: 50%;
  padding: 4px;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.user-avatar {
  border: 1px solid #f0f0f0;
}

.verification-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: #18a058;
  color: white;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.info-section {
  flex: 1;
  padding-top: 4px;
}

.info-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.name-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.nickname {
  font-size: 24px;
  font-weight: 700;
  color: #1d2129;
  margin: 0;
  line-height: 1.2;
}

.verified-tag {
  border: none;
  background: #e6f7ef;
  color: #18a058;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  font-weight: 600;
  padding: 8px 20px;
}

.action-btn.following {
  background: #f2f3f5;
  border-color: #f2f3f5;
  color: #4e5969;
}

.stats-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
  cursor: default;
}

.stat-item.clickable {
  cursor: pointer;
  transition: opacity 0.2s;
}

.stat-item.clickable:hover {
  opacity: 0.7;
}

.stat-item .count {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  font-family: 'DIN Alternate', 'Roboto', sans-serif;
}

.stat-item .label {
  font-size: 14px;
  color: #86909c;
}

.stat-divider {
  width: 1px;
  height: 12px;
  background: #e5e6eb;
}

.bio-section {
  margin-bottom: 16px;
}

.bio {
  color: #4e5969;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  max-width: 700px;
}

.bio.empty {
  color: #c9cdd4;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 12px;
  color: #86909c;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f7f8fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.id-label {
  font-weight: 500;
}

/* Content Section */
.content-section {
  max-width: 1000px;
  margin: 20px auto 0;
  padding: 0 20px;
}

/* Tabs Optimization */
.profile-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #f2f3f5;
}

.profile-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  color: #4e5969;
  height: 48px;
  font-weight: 500;
}

.profile-tabs :deep(.el-tabs__item.is-active) {
  font-size: 18px;
  color: #1d2129;
  font-weight: 600;
}

.profile-tabs :deep(.el-tabs__active-bar) {
  height: 3px;
  border-radius: 2px;
  bottom: 5px;
}

.tab-content {
  min-height: 300px;
  padding-top: 16px;
}

/* Grid Layouts */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.trips-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.trip-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.3s ease;
}

.trip-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.trip-cover {
  height: 160px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.trip-status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0,0,0,0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  backdrop-filter: blur(4px);
}

.trip-info {
  padding: 16px;
}

.trip-info h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trip-meta {
  display: flex;
  gap: 16px;
  color: #999;
  font-size: 13px;
}

.trip-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Mobile Adaptation */
@media (max-width: 768px) {
  .cover-image {
    height: 160px;
  }
  
  .profile-info-container {
    margin-top: -20px;
    padding: 0 12px;
  }
  
  .profile-card {
    padding: 16px;
  }
  
  .profile-header-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .avatar-section {
    margin-top: -40px;
    margin-bottom: 0;
  }
  
  .avatar-wrapper {
    width: 88px;
    height: 88px;
    padding: 2px;
  }
  
  .avatar-wrapper :deep(.el-avatar) {
    width: 80px !important;
    height: 80px !important;
  }

  .info-top {
    flex-direction: column;
    gap: 12px;
  }
  
  .action-buttons {
    width: 100%;
  }
  
  .action-btn {
    flex: 1;
  }
  
  .stats-bar {
    justify-content: space-between;
    background: #f7f8fa;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;
    gap: 0;
  }
  
  .stat-divider {
    display: none;
  }
  
  .stat-item {
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  
  .stat-item .count {
    font-size: 16px;
  }
  
  .stat-item .label {
    font-size: 12px;
  }
}
</style>
