<template>
  <div class="comment-section">
    <div class="section-title">
      <h3>评论 ({{ total }})</h3>
    </div>

    <!-- 发表评论框 -->
    <div class="comment-input-area">
      <el-avatar :size="40" :src="currentUserAvatar" class="user-avatar">
        <img src="@/assets/images/default-avatar.jpg" />
      </el-avatar>
      <div class="input-wrapper">
        <el-input
          v-model="commentContent"
          type="textarea"
          :rows="3"
          placeholder="写下你的想法..."
          resize="none"
          maxlength="1000"
          show-word-limit
        />
        <div class="input-actions">
          <el-button 
            type="primary" 
            :loading="submitting" 
            @click="handlePublish"
            :disabled="!commentContent.trim()"
          >
            发表评论
          </el-button>
        </div>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list" v-loading="loading">
      <div v-if="comments.length === 0 && !loading" class="empty-state">
        <el-empty description="还没有评论，快来抢沙发吧~" :image-size="100" />
      </div>

      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-main">
          <el-avatar 
            :size="40" 
            :src="comment.userAvatar" 
            class="comment-avatar clickable-avatar"
            @click="navigateToUser(comment.userId)"
          >
            <img src="@/assets/images/default-avatar.jpg" />
          </el-avatar>
          
          <div class="comment-content-wrapper">
            <div class="comment-header">
              <span 
                class="nickname clickable-name"
                @click="navigateToUser(comment.userId)"
              >
                {{ comment.userNickname }}
              </span>
              <span class="time">{{ formatTime(comment.createTime) }}</span>
            </div>
            
            <div class="comment-text">{{ comment.content }}</div>
            
            <div class="comment-actions">
              <div 
                class="action-item" 
                :class="{ 'active': comment.isLiked }"
                @click="handleLike(comment)"
              >
                <el-icon><component :is="comment.isLiked ? 'StarFilled' : 'Star'" /></el-icon>
                <span>{{ comment.likeCount || '点赞' }}</span>
              </div>
              
              <div class="action-item" @click="toggleReplyBox(comment)">
                <el-icon><ChatDotRound /></el-icon>
                <span>{{ comment.replyCount || '回复' }}</span>
              </div>
              
              <div 
                v-if="isOwner(comment.userId)" 
                class="action-item delete"
                @click="handleDelete(comment.id)"
              >
                <el-icon><Delete /></el-icon>
                <span>删除</span>
              </div>
            </div>

            <!-- 回复输入框 -->
            <div v-if="replyingTo === comment.id" class="reply-input-box">
              <el-input
                v-model="replyContent"
                :placeholder="`回复 @${comment.userNickname}`"
                size="small"
                @keyup.enter="handleReply(comment)"
              >
                <template #append>
                  <el-button @click="handleReply(comment)" :loading="replySubmitting">发送</el-button>
                </template>
              </el-input>
            </div>

            <!-- 回复列表 -->
            <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
              <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                <el-avatar 
                  :size="24" 
                  :src="reply.userAvatar" 
                  class="reply-avatar clickable-avatar"
                  @click="navigateToUser(reply.userId)"
                >
                  <img src="@/assets/images/default-avatar.jpg" />
                </el-avatar>
                
                <div class="reply-content-box">
                  <div class="reply-header">
                    <span 
                      class="nickname clickable-name"
                      @click="navigateToUser(reply.userId)"
                    >
                      {{ reply.userNickname }}
                    </span>
                    <span v-if="reply.parentUserNickname" class="reply-target">
                      回复 <span class="target-name clickable-name" @click="navigateToUser(reply.parentUserId)">@{{ reply.parentUserNickname }}</span>
                    </span>
                    <span class="time">{{ formatTime(reply.createTime) }}</span>
                  </div>
                  
                  <div class="reply-text">{{ reply.content }}</div>
                  
                  <div class="comment-actions small">
                    <div 
                      class="action-item" 
                      :class="{ 'active': reply.isLiked }"
                      @click="handleLike(reply)"
                    >
                      <el-icon><component :is="reply.isLiked ? 'StarFilled' : 'Star'" /></el-icon>
                      <span>{{ reply.likeCount || '' }}</span>
                    </div>
                    
                    <div class="action-item" @click="toggleReplyBox(reply, comment.id)">
                      <el-icon><ChatDotRound /></el-icon>
                      <span>回复</span>
                    </div>
                    
                    <div 
                      v-if="isOwner(reply.userId)" 
                      class="action-item delete"
                      @click="handleDelete(reply.id)"
                    >
                      <el-icon><Delete /></el-icon>
                      <span>删除</span>
                    </div>
                  </div>

                   <!-- 二级回复输入框 -->
                   <div v-if="replyingTo === reply.id" class="reply-input-box">
                    <el-input
                      v-model="replyContent"
                      :placeholder="`回复 @${reply.userNickname}`"
                      size="small"
                      @keyup.enter="handleReply(comment, reply)"
                    >
                      <template #append>
                        <el-button @click="handleReply(comment, reply)" :loading="replySubmitting">发送</el-button>
                      </template>
                    </el-input>
                  </div>

                </div>
              </div>
              
              <!-- 查看更多回复（仅作展示，API 目前只返回前3条） -->
              <div v-if="comment.replyCount > (comment.replies?.length || 0)" class="view-more-replies">
                <el-button link type="primary">
                  查看全部 {{ comment.replyCount }} 条回复
                </el-button>
              </div>
            </div>
          </div>
        </div>
        <el-divider v-if="comment !== comments[comments.length - 1]" />
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > pageSize">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="page"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { useUserStore } from '@/store/user';
import { communityApi } from '@/api/community';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Star, StarFilled, ChatDotRound, Delete } from '@element-plus/icons-vue';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'CommentSection',
  components: {
    Star, StarFilled, ChatDotRound, Delete
  },
  props: {
    postId: {
      type: [Number, String],
      required: true
    }
  },
  setup(props) {
    const userStore = useUserStore();
    const router = useRouter();
    const route = useRoute();
    
    const comments = ref([]);
    const total = ref(0);
    const page = ref(1);
    const pageSize = ref(10);
    const loading = ref(false);
    
    const commentContent = ref('');
    const submitting = ref(false);
    
    // 回复相关
    const replyingTo = ref(null); // 正在回复的评论ID (可以是以及或二级)
    const replyContent = ref('');
    const replySubmitting = ref(false);

    const currentUserAvatar = computed(() => {
      return userStore.currentUser?.avatar || '';
    });

    const isOwner = (userId) => {
      return userStore.currentUser && userStore.currentUser.id === userId;
    };

    const fetchComments = async () => {
      loading.value = true;
      try {
        const res = await communityApi.getComments({
          postId: props.postId,
          page: page.value,
          pageSize: pageSize.value
        });
        
        if (res.code === 200) {
          console.log('Comments data:', res.data.comments);
          comments.value = res.data.comments;
          total.value = res.data.total;
          page.value = res.data.page;
        }
      } catch (error) {
        console.error('获取评论失败', error);
      } finally {
        loading.value = false;
      }
    };

    const handlePublish = async () => {
      if (!checkLogin()) return;
      if (!commentContent.value.trim()) return;
      
      submitting.value = true;
      try {
        const res = await communityApi.publishComment({
          postId: props.postId,
          content: commentContent.value
        });
        
        if (res.code === 200) {
          ElMessage.success('评论成功');
          commentContent.value = '';
          // 刷新列表到第一页
          page.value = 1;
          fetchComments();
        } else {
          ElMessage.error(res.msg || '评论失败');
        }
      } catch (error) {
        ElMessage.error('网络错误');
      } finally {
        submitting.value = false;
      }
    };

    const toggleReplyBox = (targetComment, parentCommentId = null) => {
        // 如果点击的是已经打开的，则关闭
        if (replyingTo.value === targetComment.id) {
            replyingTo.value = null;
            replyContent.value = '';
            return;
        }
        
        // 切换到新的回复框
        replyingTo.value = targetComment.id;
        replyContent.value = '';
    };

    const handleReply = async (parentComment, replyTarget = null) => {
      if (!checkLogin()) return;
      if (!replyContent.value.trim()) return;
      
      replySubmitting.value = true;
      
      // 如果是回复二级评论，parentId 还是传一级评论的 ID (根据API文档逻辑，回复是扁平的或者只支持两级)
      // 文档说: parentId: 父评论ID（回复时传入，一级评论不传）
      // 通常这里 parentId 指的是被回复的那条评论的ID
      
      const targetId = replyTarget ? replyTarget.id : parentComment.id;
      
      try {
        const res = await communityApi.publishComment({
          postId: props.postId,
          content: replyContent.value,
          parentId: targetId 
        });
        
        if (res.code === 200) {
          ElMessage.success('回复成功');
          replyingTo.value = null;
          replyContent.value = '';
          fetchComments(); // 简单起见，刷新整个列表
        } else {
          ElMessage.error(res.msg || '回复失败');
        }
      } catch (error) {
        ElMessage.error('网络错误');
      } finally {
        replySubmitting.value = false;
      }
    };

    const handleDelete = async (commentId) => {
      try {
        await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        const res = await communityApi.deleteComment(commentId);
        if (res.code === 200) {
          ElMessage.success('删除成功');
          fetchComments();
        } else {
          ElMessage.error(res.msg || '删除失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('操作失败');
        }
      }
    };

    const handleLike = async (comment) => {
      if (!checkLogin()) return;
      
      // 乐观更新
      const originalLiked = comment.isLiked;
      const originalCount = comment.likeCount;
      
      comment.isLiked = !comment.isLiked;
      comment.likeCount = comment.isLiked ? (originalCount + 1) : (originalCount - 1);
      
      try {
        const res = await communityApi.toggleCommentLike(comment.id);
        if (res.code === 200) {
          comment.isLiked = res.data.isLiked;
          // count 可能会有偏差，最好是用返回的 count，但 API 只返回了 isLiked
          // 如果 backend 返回了 count 最好，否则保持乐观更新的结果
        } else {
            throw new Error(res.msg);
        }
      } catch (error) {
        // 回滚
        comment.isLiked = originalLiked;
        comment.likeCount = originalCount;
        ElMessage.error('操作失败');
      }
    };

    const handlePageChange = (newPage) => {
      page.value = newPage;
      fetchComments();
    };

    const checkLogin = () => {
      if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录');
        router.push(`/login?redirect=${route.fullPath}`);
        return false;
      }
      return true;
    };

    const navigateToUser = (userId) => {
      if (userId) {
        router.push(`/u/${userId}`);
      }
    };

    const formatTime = (time) => {
      if (!time) return '';
      const date = new Date(time);
      const now = new Date();
      const diff = now - date;
      
      // 小于1分钟
      if (diff < 60000) {
        return '刚刚';
      }
      // 小于1小时
      if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前';
      }
      // 小于24小时
      if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前';
      }
      // 大于24小时显示日期
      return date.toLocaleDateString();
    };

    // 监听 postId 变化
    watch(() => props.postId, (newVal) => {
      if (newVal) {
        page.value = 1;
        fetchComments();
      }
    }, { immediate: true });

    return {
      comments,
      total,
      page,
      pageSize,
      loading,
      currentUserAvatar,
      commentContent,
      submitting,
      replyingTo,
      replyContent,
      replySubmitting,
      isOwner,
      handlePublish,
      toggleReplyBox,
      handleReply,
      handleDelete,
      handleLike,
      handlePageChange,
      navigateToUser,
      formatTime
    };
  }
};
</script>

<style scoped>
.comment-section {
  padding: 20px 0;
  background: #fff;
}

.section-title h3 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
}

.comment-input-area {
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
}

.user-avatar {
  flex-shrink: 0;
}

.input-wrapper {
  flex: 1;
}

.input-actions {
  margin-top: 10px;
  text-align: right;
}

.comment-item {
  margin-bottom: 24px;
}

.comment-main {
  display: flex;
  gap: 16px;
}

.comment-content-wrapper {
  flex: 1;
}

.comment-header {
  margin-bottom: 6px;
}

.nickname {
  font-weight: 600;
  color: #333;
  font-size: 14px;
  margin-right: 10px;
}

.clickable-avatar {
  cursor: pointer;
  transition: opacity 0.2s;
}

.clickable-avatar:hover {
  opacity: 0.8;
}

.clickable-name {
  cursor: pointer;
  transition: color 0.2s;
}

.clickable-name:hover {
  color: #409eff;
}

.time {
  font-size: 12px;
  color: #999;
}

.comment-text {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
  margin-bottom: 8px;
  white-space: pre-wrap;
}

.comment-actions {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #888;
  user-select: none;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: color 0.2s;
}

.action-item:hover {
  color: #409eff;
}

.action-item.active {
  color: #409eff;
}

.action-item.delete:hover {
  color: #f56c6c;
}

.reply-input-box {
  margin-top: 12px;
  animation: fadeIn 0.3s ease;
}

.replies-list {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
}

.reply-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-content-box {
  flex: 1;
}

.reply-header {
  margin-bottom: 4px;
  font-size: 13px;
}

.reply-target {
  color: #666;
  margin: 0 8px;
}

.target-name {
  color: #409eff;
  font-weight: 500;
}

.reply-text {
  font-size: 13px;
  color: #555;
  margin-bottom: 6px;
  line-height: 1.5;
}

.comment-actions.small {
  font-size: 12px;
}

.view-more-replies {
  margin-top: 10px;
  padding-left: 36px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

