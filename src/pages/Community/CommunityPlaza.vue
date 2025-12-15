<template>
  <div class="community-plaza">
    <!-- 顶部Hero区域 -->
    <div class="plaza-hero">
      <div class="hero-content">
        <h1>探索精彩行程</h1>
        <p>发现旅行灵感，复制达人路线，开启你的完美旅程</p>
      </div>
    </div>

    <div class="plaza-container">
      <!-- 筛选工具栏 -->
      <div class="toolbar">
        <el-tabs v-model="currentSort" class="sort-tabs" @tab-change="handleSortChange">
          <el-tab-pane label="最新发布" name="latest"></el-tab-pane>
          <el-tab-pane label="热门推荐" name="hot"></el-tab-pane>
        </el-tabs>

        <div class="tags-filter">
          <span class="filter-label">热门标签：</span>
          <div class="tags-list">
            <el-tag 
              v-for="tag in hotTags" 
              :key="tag"
              :effect="currentTag === tag ? 'dark' : 'plain'"
              class="filter-tag"
              @click="handleTagClick(tag)"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 帖子列表 -->
      <div v-loading="loading" class="posts-grid-wrapper">
        <div v-if="posts.length > 0" class="posts-grid">
          <PostCard 
            v-for="post in posts" 
            :key="post.id" 
            :post="post"
            @click="goToDetail(post.id)"
          />
        </div>
        
        <el-empty v-else description="暂无相关帖子" />
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[12, 24, 36]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { communityApi } from '@/api/community';
import PostCard from '@/components/Community/PostCard.vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'CommunityPlaza',
  components: {
    PostCard
  },
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const posts = ref([]);
    const total = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(12);
    const currentSort = ref('latest');
    const currentTag = ref('');
    
    // 预设热门标签，后续可以从后端获取
    const hotTags = ['亲子', '美食', '摄影', '情侣', '毕业游', '自驾', '深度游', '穷游'];

    const fetchPosts = async () => {
      loading.value = true;
      try {
        const params = {
          page: currentPage.value,
          pageSize: pageSize.value,
          sort: currentSort.value,
          tag: currentTag.value || undefined
        };
        
        const res = await communityApi.getPosts(params);
        if (res.code === 200) {
          posts.value = res.data.list;
          total.value = res.data.total;
        }
      } catch (error) {
        console.error('获取帖子列表失败:', error);
        ElMessage.error('获取帖子列表失败，请稍后重试');
      } finally {
        loading.value = false;
      }
    };

    const handleSortChange = () => {
      currentPage.value = 1;
      fetchPosts();
    };

    const handleTagClick = (tag) => {
      if (currentTag.value === tag) {
        currentTag.value = ''; // 取消选择
      } else {
        currentTag.value = tag;
      }
      currentPage.value = 1;
      fetchPosts();
    };

    const handleSizeChange = (val) => {
      pageSize.value = val;
      currentPage.value = 1; // 重置到第一页
      fetchPosts();
    };

    const handleCurrentChange = (val) => {
      currentPage.value = val;
      fetchPosts();
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToDetail = (id) => {
      router.push(`/community/post/${id}`);
    };

    onMounted(() => {
      fetchPosts();
    });

    return {
      loading,
      posts,
      total,
      currentPage,
      pageSize,
      currentSort,
      currentTag,
      hotTags,
      handleSortChange,
      handleTagClick,
      handleSizeChange,
      handleCurrentChange,
      goToDetail
    };
  }
};
</script>

<style scoped>
.community-plaza {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.plaza-hero {
  background: linear-gradient(90deg, rgba(145, 168, 208, 0.15), rgba(247, 202, 201, 0.10));
  color: #303133;
  padding: 60px 20px;
  text-align: center;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(145, 168, 208, 0.1);
}

.hero-content h1 {
  font-size: 32px;
  margin-bottom: 16px;
  font-weight: 700;
  color: #2c3e50;
  letter-spacing: 1px;
}

.hero-content p {
  font-size: 18px;
  color: #606266;
  opacity: 0.9;
}

.plaza-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

.toolbar {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(145, 168, 208, 0.08);
  border: 1px solid rgba(145, 168, 208, 0.1);
}

.sort-tabs {
  margin-bottom: 16px;
}

/* 覆盖Element Plus Tabs样式 */
:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #f0f2f5;
}

:deep(.el-tabs__item.is-active) {
  color: #91a8d0;
}

:deep(.el-tabs__active-bar) {
  background-color: #91a8d0;
}

:deep(.el-tabs__item:hover) {
  color: #91a8d0;
  opacity: 0.8;
}

.tags-filter {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background-color: #f4f6f9;
  color: #606266;
}

.filter-tag:hover {
  transform: translateY(-1px);
  color: #91a8d0;
  background-color: rgba(145, 168, 208, 0.1);
}

/* 选中状态的 Tag */
.filter-tag.el-tag--dark {
  background: linear-gradient(135deg, #91a8d0 0%, #aabfd6 100%);
  color: white;
  border: none;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

@media (max-width: 1024px) {
  .posts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

/* Pagination 样式覆盖 */
:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #91a8d0;
}
</style>

