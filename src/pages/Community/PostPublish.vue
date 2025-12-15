<template>
  <div class="publish-page">
    <div class="publish-container">
      <div class="page-header">
        <h1 class="title">发布游记</h1>
        <p class="subtitle">分享你的精彩旅程，启发更多旅行者</p>
      </div>

      <el-card class="publish-form-card">
        <el-form 
          ref="formRef" 
          :model="form" 
          :rules="rules" 
          label-position="top"
          size="large"
        >
          <!-- 1. 选择行程 -->
          <el-form-item label="选择要分享的行程" prop="tripId">
            <el-select 
              v-model="form.tripId" 
              placeholder="请选择你的行程" 
              class="trip-select"
              :loading="loadingTrips"
              @change="handleTripChange"
            >
              <el-option
                v-for="trip in trips"
                :key="trip.id"
                :label="trip.title"
                :value="trip.id"
              >
                <div class="trip-option">
                  <span class="trip-title">{{ trip.title }}</span>
                  <span class="trip-info">
                    {{ trip.city }} · {{ trip.days }}天
                    <el-tag size="small" type="success" v-if="trip.status === 'completed'">已完成</el-tag>
                    <el-tag size="small" type="info" v-else>草稿</el-tag>
                  </span>
                </div>
              </el-option>
            </el-select>
            <div class="form-tip" v-if="!trips.length && !loadingTrips">
              暂无可用行程，<el-button link type="primary" @click="$router.push('/trip/create')">去创建</el-button>
            </div>
          </el-form-item>

          <div v-if="selectedTrip" class="trip-preview-card">
            <el-descriptions :column="3" border>
              <el-descriptions-item label="目的地">{{ selectedTrip.city }}</el-descriptions-item>
              <el-descriptions-item label="天数">{{ selectedTrip.days }}天</el-descriptions-item>
              <el-descriptions-item label="预算">{{ selectedTrip.budgetText || '-' }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 2. 标题 -->
          <el-form-item label="游记标题" prop="title">
            <el-input 
              v-model="form.title" 
              placeholder="给你的游记起个吸引人的标题" 
              maxlength="50"
              show-word-limit
            />
          </el-form-item>

          <!-- 3. 心得体会 -->
          <el-form-item label="心得体会" prop="content">
            <el-input 
              v-model="form.content" 
              type="textarea" 
              :rows="8"
              placeholder="分享旅途中的趣事、避坑指南、必打卡点..."
              maxlength="2000"
              show-word-limit
            />
          </el-form-item>

          <!-- 4. 推荐指数 -->
          <el-form-item label="推荐指数" prop="rating">
            <div class="rating-wrapper">
              <el-rate 
                v-model="form.rating" 
                allow-half 
                show-score
                text-color="#ff9900"
                score-template="{value} 分"
              />
              <span class="rating-text">给这次旅行打个分吧</span>
            </div>
          </el-form-item>

          <!-- 5. 标签 -->
          <el-form-item label="添加标签" prop="tags">
            <el-select
              v-model="form.tags"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="选择或输入标签（回车添加）"
            >
              <el-option
                v-for="item in suggestedTags"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>

          <!-- 6. 封面图 (可选) -->
          <el-form-item label="封面图片" prop="coverImage">
            <div class="cover-image-upload">
              <el-input v-model="form.coverImage" placeholder="输入图片URL (可选，默认使用城市图片)">
                <template #prefix>
                  <el-icon><Picture /></el-icon>
                </template>
              </el-input>
              <div class="image-preview" v-if="form.coverImage">
                <el-image :src="form.coverImage" fit="cover" class="preview-img">
                  <template #error>
                    <div class="image-slot">
                      <el-icon><icon-picture /></el-icon>
                      <span>加载失败</span>
                    </div>
                  </template>
                </el-image>
              </div>
            </div>
            <div class="form-tip">留空则自动使用目的地精美图片作为封面</div>
          </el-form-item>

          <!-- 提交按钮 -->
          <div class="form-actions">
            <el-button @click="$router.back()">取消</el-button>
            <el-button type="primary" :loading="submitting" @click="submitForm">
              发布游记
            </el-button>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { tripService } from '@/services/trip/tripService';
import { communityApi } from '@/api/community';
import { Picture } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'PostPublish',
  components: {
    Picture
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    const formRef = ref(null);
    
    const loadingTrips = ref(false);
    const submitting = ref(false);
    const trips = ref([]);
    const selectedTrip = ref(null);

    const suggestedTags = ['亲子', '情侣', '美食', '摄影', '自驾', '穷游', '奢华', '深度游', '周末游', '古镇', '海岛'];

    const form = reactive({
      tripId: null,
      title: '',
      content: '',
      rating: 5.0,
      tags: [],
      coverImage: ''
    });

    const rules = {
      tripId: [{ required: true, message: '请选择一个行程', trigger: 'change' }],
      title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
      content: [{ required: true, message: '请输入心得体会', trigger: 'blur' }],
      rating: [{ required: true, message: '请评分', trigger: 'change' }]
    };

    const fetchUserTrips = async () => {
      if (!userStore.userInfo?.id) return;
      
      loadingTrips.value = true;
      try {
        const userTrips = await tripService.getUserTrips(userStore.userInfo.id);
        trips.value = userTrips || [];
        
        // 如果URL中有tripId，自动选中
        const queryTripId = route.query.tripId;
        if (queryTripId) {
          const tripId = parseInt(queryTripId);
          const exists = trips.value.find(t => t.id === tripId);
          if (exists) {
            form.tripId = tripId;
            handleTripChange(tripId);
          }
        }
      } catch (error) {
        console.error('获取行程失败:', error);
        ElMessage.error('获取行程列表失败');
      } finally {
        loadingTrips.value = false;
      }
    };

    const handleTripChange = (tripId) => {
      selectedTrip.value = trips.value.find(t => t.id === tripId);
      // 自动填充标题
      if (selectedTrip.value && !form.title) {
        form.title = `${selectedTrip.value.city}${selectedTrip.value.days}日游分享`;
      }
    };

    const submitForm = async () => {
      if (!formRef.value) return;
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          submitting.value = true;
          try {
            const data = {
              tripId: form.tripId,
              title: form.title,
              content: form.content,
              rating: form.rating,
              tags: form.tags,
              coverImage: form.coverImage || undefined // 如果为空则不传
            };
            
            const res = await communityApi.publishPost(data);
            if (res.code === 200) {
              ElMessage.success('发布成功！');
              router.push(`/community/post/${res.data.id}`);
            } else {
              ElMessage.error(res.msg || '发布失败');
            }
          } catch (error) {
            console.error('发布失败:', error);
            ElMessage.error('网络错误，请稍后重试');
          } finally {
            submitting.value = false;
          }
        }
      });
    };

    onMounted(() => {
      if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录');
        router.push('/login?redirect=/community/publish');
        return;
      }
      fetchUserTrips();
    });

    return {
      formRef,
      form,
      rules,
      loadingTrips,
      submitting,
      trips,
      selectedTrip,
      suggestedTags,
      handleTripChange,
      submitForm
    };
  }
};
</script>

<style scoped>
.publish-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 40px 20px;
}

.publish-container {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 8px;
}

.subtitle {
  color: #909399;
  font-size: 16px;
}

.publish-form-card {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.trip-select {
  width: 100%;
}

.trip-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trip-title {
  font-weight: 500;
}

.trip-info {
  color: #909399;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.trip-preview-card {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid #ebeef5;
}

.rating-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-text {
  font-size: 14px;
  color: #909399;
}

.cover-image-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-preview {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  background: #f5f7fa;
}

.preview-img {
  width: 100%;
  height: 100%;
}

.image-slot {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>

