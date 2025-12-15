<template>
  <div class="post-card" @click="$emit('click')">
    <div class="card-cover">
      <el-image 
        :src="post.coverImage" 
        fit="cover" 
        loading="lazy"
        class="cover-image"
      >
        <template #error>
          <div class="image-placeholder">
            <el-icon><Picture /></el-icon>
          </div>
        </template>
      </el-image>
      <div class="card-overlay" v-if="post.tripInfo">
        <span class="city-tag">
          <el-icon><Location /></el-icon>
          {{ post.tripInfo.city }}
        </span>
        <span class="days-tag">{{ post.tripInfo.days }}天</span>
      </div>
    </div>
    
    <div class="card-content">
      <h3 class="post-title">{{ post.title }}</h3>
      
      <div class="author-info">
        <el-avatar :size="24" :src="post.author.avatar">
          <img src="@/assets/images/default-avatar.jpg" />
        </el-avatar>
        <span class="nickname">{{ post.author.nickname }}</span>
      </div>
      
      <div class="card-footer">
        <div class="stats">
          <span class="stat-item">
            <el-icon><View /></el-icon>
            {{ formatCount(post.stats.viewCount) }}
          </span>
          <span class="stat-item" :class="{ active: post.isLiked }">
            <el-icon><Star /></el-icon>
            {{ formatCount(post.stats.likeCount) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Picture, Location, View, Star } from '@element-plus/icons-vue';

export default {
  name: 'PostCard',
  components: {
    Picture,
    Location,
    View,
    Star
  },
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  emits: ['click'],
  setup() {
    const formatCount = (count) => {
      if (!count) return '0';
      if (count >= 10000) {
        return (count / 10000).toFixed(1) + 'w';
      }
      return count;
    };

    return {
      formatCount
    };
  }
};
</script>

<style scoped>
.post-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-cover {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.post-card:hover .cover-image {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 24px;
}

.card-overlay {
  position: absolute;
  bottom: 8px;
  left: 8px;
  display: flex;
  gap: 6px;
}

.city-tag, .days-tag {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 2px;
  backdrop-filter: blur(4px);
}

.card-content {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.post-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #303133;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  margin-bottom: 8px;
}

.nickname {
  font-size: 12px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f0f2f5;
  padding-top: 8px;
}

.stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-item.active {
  color: #ff9900;
}
</style>

