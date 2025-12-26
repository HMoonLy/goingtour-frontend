<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="500px"
    :close-on-click-modal="true"
    append-to-body
    class="follow-list-modal"
    @closed="handleClose"
  >
    <div
      class="user-list"
      v-loading="loading"
      v-infinite-scroll="loadMore"
      :infinite-scroll-disabled="disabled"
      :infinite-scroll-distance="10"
    >
      <div v-for="user in userList" :key="user.id" class="user-item">
        <div class="user-info" @click="navigateToUser(user.id)">
          <el-avatar :size="40" :src="getAvatarUrl(user.avatar)" />
          <div class="info-content">
            <span class="nickname">{{ user.nickname }}</span>
            <span class="bio" v-if="user.bio">{{ user.bio }}</span>
          </div>
        </div>
        
        <!-- 不显示关注按钮给当前登录用户自己 -->
        <div class="action-btn" v-if="currentUserId !== user.id">
          <el-button
            v-if="user.isFollowing"
            size="small"
            type="info"
            plain
            round
            @click="handleUnfollow(user)"
            :loading="user.actionLoading"
          >
            已关注
          </el-button>
          <el-button
            v-else
            size="small"
            type="primary"
            round
            @click="handleFollow(user)"
            :loading="user.actionLoading"
          >
            关注
          </el-button>
        </div>
      </div>
      
      <div v-if="loading" class="loading-more">加载中...</div>
      <div v-if="noMore && userList.length > 0" class="no-more">没有更多了</div>
      <div v-if="!loading && userList.length === 0" class="empty-state">
        <el-empty description="暂无数据" :image-size="100" />
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { followApi } from '@/api/follow';
import { useUserStore } from '@/store/user';
import { getAvatarUrl } from '@/utils/media/imageUrl';
import { ElMessage } from 'element-plus';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ['followers', 'following', 'mutual'].includes(value)
  },
  userId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const router = useRouter();
const userStore = useUserStore();
const currentUserId = computed(() => userStore.userId);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const title = computed(() => {
  switch (props.type) {
    case 'followers': return '粉丝列表';
    case 'following': return '关注列表';
    case 'mutual': return '互关列表';
    default: return '列表';
  }
});

const userList = ref([]);
const loading = ref(false);
const page = ref(1);
const pageSize = 20;
const total = ref(0);
const noMore = computed(() => userList.value.length >= total.value && total.value > 0);
const disabled = computed(() => loading.value || noMore.value);

const loadData = async () => {
  if (loading.value) return;
  loading.value = true;
  
  try {
    let res;
    const params = { page: page.value, pageSize };
    
    if (props.type === 'followers') {
      res = await followApi.getFollowers(props.userId, params);
    } else if (props.type === 'following') {
      res = await followApi.getFollowings(props.userId, params);
    } else if (props.type === 'mutual') {
      res = await followApi.getMutualFollows(props.userId, params);
    }
    
    if (res && res.data) {
      const newList = res.data.list || [];
      total.value = res.data.total || 0;
      
      if (page.value === 1) {
        userList.value = newList.map(u => ({ ...u, actionLoading: false }));
      } else {
        userList.value.push(...newList.map(u => ({ ...u, actionLoading: false })));
      }
      
      page.value++;
    }
  } catch (error) {
    console.error('Failed to load user list:', error);
    ElMessage.error('加载列表失败');
  } finally {
    loading.value = false;
  }
};

const loadMore = () => {
  if (!disabled.value) {
    loadData();
  }
};

const reset = () => {
  userList.value = [];
  page.value = 1;
  total.value = 0;
};

watch(() => props.modelValue, (val) => {
  if (val) {
    reset();
    loadData();
  }
});

const handleClose = () => {
  reset();
};

const navigateToUser = (targetUserId) => {
  visible.value = false;
  router.push(`/u/${targetUserId}`);
};

const handleFollow = async (user) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    return;
  }
  
  user.actionLoading = true;
  try {
    await followApi.followUser(user.id);
    user.isFollowing = true;
    ElMessage.success('关注成功');
  } catch (error) {
    console.error('Follow failed:', error);
    ElMessage.error('关注失败');
  } finally {
    user.actionLoading = false;
  }
};

const handleUnfollow = async (user) => {
  user.actionLoading = true;
  try {
    await followApi.unfollowUser(user.id);
    user.isFollowing = false;
    ElMessage.success('已取消关注');
  } catch (error) {
    console.error('Unfollow failed:', error);
    ElMessage.error('取消关注失败');
  } finally {
    user.actionLoading = false;
  }
};
</script>

<style scoped>
.follow-list-modal :deep(.el-dialog__body) {
  padding: 0;
  max-height: 60vh;
  overflow-y: auto;
}

.user-list {
  padding: 10px 20px;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
}

.user-item:last-child {
  border-bottom: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex: 1;
}

.info-content {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-weight: 600;
  color: #333;
  font-size: 15px;
}

.bio {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.loading-more, .no-more {
  text-align: center;
  padding: 10px;
  color: #999;
  font-size: 12px;
}

.empty-state {
  padding: 40px 0;
  display: flex;
  justify-content: center;
}
</style>
