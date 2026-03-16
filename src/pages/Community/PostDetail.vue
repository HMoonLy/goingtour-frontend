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
        <el-page-header @back="$router.push('/community')">
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
              :preview-src-list="previewImageList"
            />
          </div>

          <div class="post-gallery" v-if="galleryImages.length">
            <el-image
              v-for="(image, index) in galleryImages"
              :key="`${image}-${index}`"
              :src="image"
              fit="cover"
              class="gallery-image"
              :preview-src-list="previewImageList"
              :initial-index="index + (post.coverImage ? 1 : 0)"
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
                class="action-btn"
                :class="{ 'is-liked': post.isLiked }"
                circle
                @click="handleLike"
              >
                <el-icon :class="{ 'bounce-animation': triggerLikeAnimation }" :size="20">
                  <svg v-if="post.isLiked" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em">
                    <path d="M707.3 133.3c-30.9 0-60.9 6.4-89 17.8-39.3 12.6-74.9 35.2-102.6 66.1l-3.8 4.2-3.9-4.2c-27-29-60.3-50.5-96.6-63.5-29.8-13-61.8-20.4-95-20.4-139 0-252.1 121.3-252.1 270.5 0 245.3 271.6 412.1 388.4 472.4 18.4 9.5 38.8 14.4 59.4 14.4 20.4 0 40.5-4.8 58.7-14C687.8 817 959.4 652 959.4 403.7c0-149.1-113.1-270.4-252.1-270.4z" fill="#d81e06"></path>
                  </svg>
                  <svg v-else class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em">
                    <path d="M707.3 133.3c-30.9 0-60.9 6.4-89 17.8-39.3 12.6-74.9 35.2-102.6 66.1l-3.8 4.2-3.9-4.2c-27-29-60.3-50.5-96.6-63.5-29.8-13-61.8-20.4-95-20.4-139 0-252.1 121.3-252.1 270.5 0 245.3 271.6 412.1 388.4 472.4 18.4 9.5 38.8 14.4 59.4 14.4 20.4 0 40.5-4.8 58.7-14C687.8 817 959.4 652 959.4 403.7c0-149.1-113.1-270.4-252.1-270.4z" fill="#e6e6e6"></path>
                  </svg>
                </el-icon>
              </el-button>
              <span class="action-count">{{ post.stats.likeCount }}</span>
              
              <el-button 
                class="action-btn"
                :class="{ 'is-collected': post.isCollected }"
                circle
                @click="handleCollect"
              >
                <el-icon :class="{ 'bounce-animation': triggerCollectAnimation }" :size="20">
                  <svg v-if="post.isCollected" class="icon" viewBox="0 0 1426 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em">
                    <path d="M985.6 1022.976c-14.848 0-31.744-4.096-47.104-12.288L716.288 899.584l-223.744 111.104c-14.336 7.68-30.208 11.776-47.104 11.776-21.504 0-42.496-6.656-59.392-19.456-31.232-23.552-47.104-64-39.936-101.376l45.568-237.056-175.616-163.328c-27.136-27.648-37.376-67.072-27.136-104.448l0.512-1.024c12.8-38.4 44.544-65.024 82.944-70.144l243.712-44.544L625.152 58.88C642.56 23.552 678.4 1.024 716.288 1.024c39.424 0 76.288 23.552 91.648 58.368l109.056 221.696 243.712 42.496c38.4 5.632 70.656 33.28 81.408 71.168 12.288 36.864 2.048 77.312-25.6 104.96l-0.512 0.512-174.592 164.864 44.032 237.568c7.168 37.888-8.192 76.288-39.424 100.352-17.92 12.8-38.912 19.968-60.416 19.968z" fill="#f4ea2a"></path>
                  </svg>
                  <svg v-else class="icon" viewBox="0 0 1426 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em">
                    <path d="M985.6 1022.976c-14.848 0-31.744-4.096-47.104-12.288L716.288 899.584l-223.744 111.104c-14.336 7.68-30.208 11.776-47.104 11.776-21.504 0-42.496-6.656-59.392-19.456-31.232-23.552-47.104-64-39.936-101.376l45.568-237.056-175.616-163.328c-27.136-27.648-37.376-67.072-27.136-104.448l0.512-1.024c12.8-38.4 44.544-65.024 82.944-70.144l243.712-44.544L625.152 58.88C642.56 23.552 678.4 1.024 716.288 1.024c39.424 0 76.288 23.552 91.648 58.368l109.056 221.696 243.712 42.496c38.4 5.632 70.656 33.28 81.408 71.168 12.288 36.864 2.048 77.312-25.6 104.96l-0.512 0.512-174.592 164.864 44.032 237.568c7.168 37.888-8.192 76.288-39.424 100.352-17.92 12.8-38.912 19.968-60.416 19.968z" fill="#e6e6e6"></path>
                  </svg>
                </el-icon>
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

          <!-- 行程详情 -->
          <div class="trip-details-section">
            <div class="section-header">
              <!-- 使用可选链防止数据为空报错 -->
              <h3><el-icon><MapLocation /></el-icon> 关联行程：{{ post.trip?.city }} {{ post.trip?.days }}日游</h3>
              <div class="trip-budget-tag" v-if="post.trip?.totalBudget">
                预算: 约 ¥{{ post.trip.totalBudget }}
              </div>
            </div>
            
            <!-- 优先展示直接存储在 Post 中的 JSON 摘要 (新方案) -->
            <TripSummaryCard 
              v-if="post.tripSummary"
              :summary-data="post.tripSummary"
            />
            
            <div v-else class="empty-trip">
               <el-empty description="暂无详细行程内容" image-size="60" />
            </div>
          </div>

          <el-divider />

          <!-- 评论区 -->
          <CommentSection v-if="post && post.id" :post-id="post.id" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { communityApi } from '@/api/community';
import { normalizeImageUrl } from '@/utils/media/imageUrl';
import { convertBackendTripToFrontend } from '@/utils/data/tripDataConverter';
import TripSummaryCard from '@/components/Trip/Details/TripSummaryCard.vue';
import TripMarkdownRenderer from '@/components/Trip/Steps/TripMarkdownRenderer.vue';
import CommentSection from '@/components/Community/CommentSection.vue';
import { 
  Star, StarFilled, CollectionTag, CopyDocument, 
  More, Delete, MapLocation 
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
  name: 'PostDetail',
  components: {
    TripSummaryCard,
    TripMarkdownRenderer,
    CommentSection,
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
    const extractedTripSummary = ref(null);
    const triggerLikeAnimation = ref(false);
    const triggerCollectAnimation = ref(false);

    const isAuthor = computed(() => {
      return post.value && userStore.currentUser && post.value.author.id === userStore.currentUser.id;
    });

    const galleryImages = computed(() => {
      if (!post.value?.images || !Array.isArray(post.value.images)) {
        return [];
      }
      const seen = new Set();
      const images = [];
      post.value.images.forEach((image) => {
        const normalized = normalizeImageUrl(image);
        if (!normalized || normalized === post.value.coverImage || seen.has(normalized)) {
          return;
        }
        seen.add(normalized);
        images.push(normalized);
      });
      return images;
    });

    const previewImageList = computed(() => {
      const images = [];
      if (post.value?.coverImage) {
        images.push(post.value.coverImage);
      }
      galleryImages.value.forEach((image) => {
        if (!images.includes(image)) {
          images.push(image);
        }
      });
      return images;
    });

    const normalizePostImages = (rawPost) => {
      const normalizedImages = Array.isArray(rawPost.images)
        ? rawPost.images.map((image) => normalizeImageUrl(image)).filter(Boolean)
        : [];
      const coverImage = normalizeImageUrl(rawPost.coverImage) || normalizedImages[0] || '';
      return {
        ...rawPost,
        coverImage,
        images: normalizedImages
      };
    };


    const extractJsonFromMarkdown = (content) => {
      console.log('content', content);
      
      if (!content) return null;
      try {
        // 1. 优先匹配明确标记为 json 的块
        let jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/i);
        
        // 2. 如果没匹配到，尝试匹配最后一个代码块 (通常 summary 在最后)
        if (!jsonMatch) {
             const codeBlocks = [...content.matchAll(/```\s*([\s\S]*?)\s*```/g)];
             if (codeBlocks.length > 0) {
                 // 取最后一个代码块，检查是否像 JSON
                 const lastBlock = codeBlocks[codeBlocks.length - 1][1];
                 if (lastBlock.trim().startsWith('{')) {
                     jsonMatch = [null, lastBlock];
                 }
             }
        }

        if (jsonMatch && jsonMatch[1]) {
           return JSON.parse(jsonMatch[1]);
        }
        return null;
      } catch (e) {
        console.warn('Failed to parse trip summary JSON:', e);
        return null;
      }
    };

    const fetchDetail = async () => {
      loading.value = true;
      try {
        const id = route.params.id;
        console.log(id);
        
        const res = await communityApi.getPostDetail(id);
        if (res.code === 200) {
          post.value = normalizePostImages(res.data);
          
          // 解析 tripSummary JSON 字符串
          if (post.value.tripSummary && typeof post.value.tripSummary === 'string') {
             try {
                post.value.tripSummary = JSON.parse(post.value.tripSummary);
             } catch (e) {
                console.warn('解析 tripSummary 失败', e);
                // 尝试作为纯文本处理
                post.value.tripSummary = { text_content: post.value.tripSummary };
             }
          }
          
          const tripData = post.value.trip || {};
          // 兼容下划线和驼峰
          const aiContent = tripData.aiContent || tripData.ai_content;
          
          // 尝试提取 JSON Summary
          if (aiContent) {
            console.log(aiContent);
            
            extractedTripSummary.value = extractJsonFromMarkdown(aiContent);
            
            // 确保 aiContent 字段有值，供 Markdown 渲染器降级使用
            if (!post.value.trip.aiContent) {
                post.value.trip.aiContent = aiContent;
            }
          }
          
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
      
      if (post.value.isLiked) {
        triggerLikeAnimation.value = true;
        setTimeout(() => {
          triggerLikeAnimation.value = false;
        }, 1000);
      }
      
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
      
      if (post.value.isCollected) {
        triggerCollectAnimation.value = true;
        setTimeout(() => {
          triggerCollectAnimation.value = false;
        }, 1000);
      }

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
          ElMessage.success('复制成功！正在跳转个人中心...');
          setTimeout(() => {
            router.push('/user/dashboard');
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
      if (userId) {
        router.push(`/u/${userId}`);
      }
    };

    onMounted(() => {
      fetchDetail();
    });

    return {
      loading,
      post,
      formattedTrip,
      extractedTripSummary,
      galleryImages,
      previewImageList,
      triggerLikeAnimation,
      triggerCollectAnimation,
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
  background-color: #ffffff;
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

.post-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.gallery-image {
  width: 100%;
  height: 180px;
  border-radius: 10px;
  overflow: hidden;
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

.empty-trip {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 20px;
    border-radius: 0;
  }
  
  .cover-image-container {
    height: 200px;
  }

  .post-gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .gallery-image {
    height: 140px;
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

@keyframes like-bounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.like-animation {
  animation: like-bounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}


</style>

