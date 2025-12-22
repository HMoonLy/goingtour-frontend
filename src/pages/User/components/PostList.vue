<template>
  <section class="posts-section">
    <div class="section-header">
      <h3>
        <el-icon><Collection /></el-icon>
        我的帖子
      </h3>
    </div>

    <div class="posts-container">
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else-if="posts.length === 0" class="empty-state">
        <el-empty description="还没有发布过帖子" :image-size="120">
          <template #image>
            <el-icon size="80" color="#d3d3d3">
              <Document />
            </el-icon>
          </template>
          <el-button type="primary" @click="$router.push('/community/publish')"> 去发布 </el-button>
        </el-empty>
      </div>

      <div v-else class="posts-grid">
        <div
          v-for="post in posts"
          :key="post.id"
          class="post-card"
          @click="$emit('view', post)"
        >
          <div class="post-cover" v-if="post.coverImage">
            <el-image :src="post.coverImage" fit="cover" loading="lazy" class="cover-img" />
          </div>
          
          <div class="post-content">
            <div class="post-header">
              <h4 class="post-title" :title="post.title">
                {{ post.title }}
              </h4>
              <el-dropdown @command="(cmd) => handleCommand(cmd, post)" @click.stop>
                <el-button size="small" link class="more-btn">
                  <el-icon><More /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="delete" class="delete-item">
                      <el-icon><Delete /></el-icon>删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>

            <p class="post-summary" v-if="post.content">
              {{ truncateContent(post.content) }}
            </p>

            <div class="post-meta">
              <div class="meta-stats">
                <span class="stat-item">
                  <el-icon><Star /></el-icon>
                  {{ post.stats?.likeCount || 0 }}
                </span>
                <span class="stat-item">
                  <el-icon><CollectionTag /></el-icon>
                  {{ post.stats?.collectCount || 0 }}
                </span>
              </div>
              <span class="create-time">
                {{ formatTime(post.createTime) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { 
  Collection, 
  Document, 
  More, 
  Delete, 
  Star, 
  CollectionTag 
} from "@element-plus/icons-vue";

export default {
  name: "PostList",
  components: {
    Collection,
    Document,
    More,
    Delete,
    Star,
    CollectionTag
  },
  props: {
    posts: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["view", "delete"],
  setup(props, { emit }) {
    const formatTime = (timestamp) => {
      if (!timestamp) return "";
      try {
        const date = new Date(timestamp);
        return date.toLocaleDateString("zh-CN");
      } catch {
        return "";
      }
    };

    const truncateContent = (content) => {
      if (!content) return "";
      return content.length > 50 ? content.slice(0, 50) + "..." : content;
    };

    const handleCommand = (command, post) => {
      if (command === 'delete') {
        emit('delete', post);
      }
    };

    return {
      formatTime,
      truncateContent,
      handleCommand
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

.posts-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.post-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  display: flex;
  flex-direction: column;
}

.post-card:hover {
  border-color: #91a8d0;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.2);
  transform: translateY(-2px);
}

.post-cover {
  height: 160px;
  overflow: hidden;
  background-color: #f5f7fa;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.post-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  flex: 1;
  margin-right: 8px;
}

.post-summary {
  font-size: 14px;
  color: #606266;
  margin: 0 0 12px 0;
  line-height: 1.5;
  height: 42px; /* 2 lines approximately */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.post-meta {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.meta-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.delete-item {
  color: #f56c6c;
}

.more-btn {
  padding: 4px;
  height: auto;
}

.loading-state,
.empty-state {
  padding: 40px 20px;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
  
  .post-cover {
    height: 140px;
  }
}
</style>

