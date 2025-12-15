<template>
  <div class="post-detail-page">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else-if="!post" class="error-container">
      <el-empty description="帖子不存在或已被删除" />
      <el-button type="primary" @click="$router.push('/community')">返回广场</el-button>
    </div>

    <div v-else class="post-container">
      <!-- 帖子头部 -->
      <div class="post-header">
        <el-page-header @back="$router.back()">
          <template #content>
            <span class="header-title">帖子详情</span>
          </template>
        </el-page-header>
      </div>

      <div class="content-wrapper">
        <!-- 左侧：帖子内容 -->
        <div class="post-main">
          <!-- 封面图 -->
          <div class="cover-image-container" v-if="post.coverImage">
            <el-image 
              :src="post.coverImage" 
              fit="cover" 
              class="cover-image"
              :preview-src-list="[post.coverImage]"
            />
          </div>

          <!-- 标题和元数据 -->
          <h1 class="post-title">{{ post.title }}</h1>
          
          <div class="post-meta-row">
            <div class="author-info" @click="goToUser(post.author.id)">
              <el-avatar :size="40" :src="post.author.avatar">
                <img src="@/assets/images/default-avatar.jpg" />
              </el-avatar>
              <div class="author-text">
                <span class="author-name">{{ post.author.nickname }}</span>
                <span class="post-time">{{ formatTime(post.createTime) }}</span>
              </div>
            </div>

            <div class="post-actions">
              <el-button 
                :type="post.isLiked ? 'warning' : 'default'"
                :plain="!post.isLiked"
                circle
                @click="handleLike"
              >
                <el-icon><StarFilled v-if="post.isLiked" /><Star v-else /></el-icon>
              </el-button>
              <span class="action-count">{{ post.stats.likeCount }}</span>
              
              <el-button 
                :type="post.isCollected ? 'warning' : 'default'" 
                :plain="!post.isCollected"
                circle
                @click="handleCollect"
              >
                <el-icon><CollectionTag /></el-icon>
              </el-button>
              <span class="action-count">{{ post.stats.collectCount }}</span>
              
              <el-button circle @click="handleFork">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
              <span class="action-count">复制行程</span>

              <el-dropdown v-if="isAuthor" @command="handleCommand">
                <el-button circle class="more-btn">
                  <el-icon><More /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="delete" style="color: red;">
                      <el-icon><Delete /></el-icon>删除帖子
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <!-- 帖子正文 -->
          <div class="post-content">
            <p>{{ post.content }}</p>
          </div>

          <!-- 标签 -->
          <div class="post-tags" v-if="post.tags && post.tags.length">
            <el-tag v-for="tag in post.tags" :key="tag" class="tag-item" effect="plain">
              # {{ tag }}
            </el-tag>
          </div>
          
          <el-divider />

          <!-- 行程详情 (复用 TripDailyItinerary) -->
          <div class="trip-details-section" v-if="formattedTrip">
            <div class="section-header">
              <h3><el-icon><MapLocation /></el-icon> 关联行程：{{ formattedTrip.destinationName }} {{ formattedTrip.days }}日游</h3>
              <div class="trip-budget-tag">
                预算: {{ formattedTrip.budgetText }}
              </div>
            </div>
            
            <TripDailyItinerary 
              :daily-plan="formattedTrip.dailyPlan"
              :destination="formattedTrip.destination"
              :is-editing="false"
            />
          </div>
        </div>

        <!-- 右侧：侧边栏 (可选，预留) -->
        <!-- <div class="post-sidebar"></div> -->
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { communityApi } from '@/api/community';
import { convertBackendTripToFrontend } from '@/utils/data/tripDataConverter';
import TripDailyItinerary from '@/components/Trip/Details/TripDailyItinerary.vue';
import { 
  Star, StarFilled, CollectionTag, CopyDocument, 
  More, Delete, MapLocation 
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
  name: 'PostDetail',
  components: {
    TripDailyItinerary,
    Star, StarFilled, CollectionTag, CopyDocument, 
    More, Delete, MapLocation
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    
    const loading = ref(true);
    const post = ref(null);
    const formattedTrip = ref(null);

    const isAuthor = computed(() => {
      return post.value && userStore.userInfo && post.value.author.id === userStore.userInfo.id;
    });

    const fetchDetail = async () => {
      loading.value = true;
      try {
        const id = route.params.id;
        const res = await communityApi.getPostDetail(id);
        if (res.code === 200) {
          post.value = res.data;
          
          // 转换行程数据格式
          if (post.value.trip) {
            formattedTrip.value = convertBackendTripToFrontend(post.value.trip);
          }
        } else {
          ElMessage.error(res.msg || '获取详情失败');
        }
      } catch (error) {
        console.error('获取帖子详情失败:', error);
        ElMessage.error('网络错误，请稍后重试');
      } finally {
        loading.value = false;
      }
    };

    const handleLike = async () => {
      if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录');
        router.push(`/login?redirect=${route.fullPath}`);
        return;
      }
      
      const type = 'like';
      const action = post.value.isLiked ? 'remove' : 'add';
      
      // 乐观更新
      const originalState = post.value.isLiked;
      const originalCount = post.value.stats.likeCount;
      
      post.value.isLiked = !post.value.isLiked;
      post.value.stats.likeCount += (action === 'add' ? 1 : -1);
      
      try {
        const res = await communityApi.interact(post.value.id, type, action);
        if (res.code !== 200) {
          throw new Error(res.msg);
        }
        // 更新为实际数值
        post.value.stats.likeCount = res.data.newCount;
      } catch (error) {
        // 回滚
        post.value.isLiked = originalState;
        post.value.stats.likeCount = originalCount;
        ElMessage.error('操作失败');
      }
    };

    const handleCollect = async () => {
       if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录');
        router.push(`/login?redirect=${route.fullPath}`);
        return;
      }
      
      const type = 'collect';
      const action = post.value.isCollected ? 'remove' : 'add';
      
       // 乐观更新
      const originalState = post.value.isCollected;
      const originalCount = post.value.stats.collectCount;
      
      post.value.isCollected = !post.value.isCollected;
      post.value.stats.collectCount += (action === 'add' ? 1 : -1);
      
      try {
        const res = await communityApi.interact(post.value.id, type, action);
        if (res.code !== 200) {
          throw new Error(res.msg);
        }
        post.value.stats.collectCount = res.data.newCount;
      } catch (error) {
        post.value.isCollected = originalState;
        post.value.stats.collectCount = originalCount;
        ElMessage.error('操作失败');
      }
    };

    const handleFork = async () => {
      if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录');
        router.push(`/login?redirect=${route.fullPath}`);
        return;
      }

      try {
        await ElMessageBox.confirm(
          '确定要复制这个行程到你的草稿箱吗？',
          '复制行程',
          {
            confirmButtonText: '确定复制',
            cancelButtonText: '取消',
            type: 'info',
          }
        );

        const res = await communityApi.forkTrip(post.value.id);
        if (res.code === 200) {
          ElMessage.success('复制成功！即将跳转到编辑页面...');
          setTimeout(() => {
            router.push(`/trip/${res.data.newTripId}`); // 跳转到详情页或编辑页
            // 如果需要编辑，可以跳转到 /trip/${id}/edit 或 ai-trip/${id}/edit
            // 根据后端返回的trip类型可能需要判断，这里先跳到详情页
          }, 1500);
        } else {
          ElMessage.error(res.msg || '复制失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error(error);
          ElMessage.error('操作失败');
        }
      }
    };

    const handleCommand = async (command) => {
      if (command === 'delete') {
        try {
          await ElMessageBox.confirm(
            '确定要删除这篇帖子吗？此操作无法撤销。',
            '删除确认',
            {
              confirmButtonText: '删除',
              cancelButtonText: '取消',
              type: 'warning',
            }
          );
          
          const res = await communityApi.deletePost(post.value.id);
          if (res.code === 200) {
            ElMessage.success('删除成功');
            router.replace('/community');
          } else {
            ElMessage.error(res.msg || '删除失败');
          }
        } catch (error) {
           if (error !== 'cancel') {
            ElMessage.error('操作失败');
           }
        }
      }
    };

    const formatTime = (time) => {
      if (!time) return '';
      return new Date(time).toLocaleDateString();
    };
    
    const goToUser = (userId) => {
      // router.push(`/user/${userId}`); // 暂时没有用户主页
    };

    onMounted(() => {
      fetchDetail();
    });

    return {
      loading,
      post,
      formattedTrip,
      isAuthor,
      handleLike,
      handleCollect,
      handleFork,
      handleCommand,
      formatTime,
      goToUser
    };
  }
};
</script>

<style scoped>
.post-detail-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 40px;
}

.loading-container, .error-container {
  max-width: 1000px;
  margin: 40px auto;
  padding: 40px;
  background: white;
  border-radius: 12px;
  text-align: center;
}

.post-container {
  max-width: 1000px;
  margin: 0 auto;
}

.post-header {
  padding: 20px 0;
}

.header-title {
  font-weight: 600;
  font-size: 16px;
}

.content-wrapper {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  padding: 40px;
}

.cover-image-container {
  width: 100%;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.post-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 20px;
}

.post-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.author-text {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.post-time {
  font-size: 12px;
  color: #909399;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-count {
  font-size: 14px;
  color: #606266;
  margin-left: -8px; /* 紧贴按钮 */
}

.post-content {
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  margin-bottom: 24px;
  white-space: pre-wrap;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30px 0 20px;
}

.section-header h3 {
  font-size: 20px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.trip-budget-tag {
  background: #f0f9eb;
  color: #67c23a;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 20px;
    border-radius: 0;
  }
  
  .cover-image-container {
    height: 200px;
  }
  
  .post-title {
    font-size: 22px;
  }
  
  .post-meta-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .post-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .action-count {
    margin-left: 0;
  }
}
</style>

