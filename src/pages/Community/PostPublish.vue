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

          <el-form-item label="帖子图片">
            <div class="post-image-uploader">
              <el-upload
                v-model:file-list="imageFileList"
                list-type="picture-card"
                :auto-upload="false"
                :limit="MAX_POST_IMAGES"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                :before-upload="beforeImageSelect"
                :on-change="handleImageChange"
                :on-remove="handleImageRemove"
                :on-preview="handleImagePreview"
                :on-exceed="handleImageExceed"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>

              <div class="form-tip">
                最多上传 {{ MAX_POST_IMAGES }} 张，单张不超过 10MB。第一张图片会自动作为封面图。
              </div>

              <div class="cover-preview-block" v-if="coverPreviewUrl">
                <span class="cover-preview-label">封面预览</span>
                <el-image
                  :src="coverPreviewUrl"
                  fit="cover"
                  class="cover-preview-image"
                  :preview-src-list="[coverPreviewUrl]"
                />
              </div>
            </div>
          </el-form-item>

          <el-form-item label="行程摘要" prop="tripSummary">
            <el-input
              v-model="form.tripSummary"
              type="textarea"
              :rows="8"
              placeholder="输入行程摘要"
            />
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

    <el-dialog v-model="previewVisible" width="720px" append-to-body>
      <img :src="previewImageUrl" alt="帖子图片预览" class="dialog-preview-image" />
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { tripService } from '@/services/trip/tripService';
import { communityApi } from '@/api/community';
import { normalizeImageUrl } from '@/utils/media/imageUrl';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'PostPublish',
  components: {
    Plus
  },
  setup() {
    const MAX_POST_IMAGES = 20;
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    const formRef = ref(null);
    
    const loadingTrips = ref(false);
    const submitting = ref(false);
    const trips = ref([]);
    const selectedTrip = ref(null);
    const imageFileList = ref([]);
    const previewVisible = ref(false);
    const previewImageUrl = ref('');

    const suggestedTags = ['亲子', '情侣', '美食', '摄影', '自驾', '穷游', '奢华', '深度游', '周末游', '古镇', '海岛'];

    const form = reactive({
      tripId: null,
      title: '',
      content: '',
      rating: 5.0,
      tags: [],
      tripSummary: null // 新增
    });

    const coverPreviewUrl = computed(() => {
      const firstImage = imageFileList.value[0];
      return firstImage?.url || '';
    });

    const rules = {
      tripId: [{ required: true, message: '请选择一个行程', trigger: 'change' }],
      title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
      content: [{ required: true, message: '请输入心得体会', trigger: 'blur' }],
      rating: [{ required: true, message: '请评分', trigger: 'change' }]
    };

    // 提取 JSON 的辅助函数
    const extractJsonFromContent = (content) => {
      if (!content) return null;
      try {
        let jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/i);
        if (!jsonMatch) {
             const codeBlocks = [...content.matchAll(/```\s*([\s\S]*?)\s*```/g)];
             if (codeBlocks.length > 0) {
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
        console.warn('提取JSON失败:', e);
        return null;
      }
    };

    const revokeObjectUrl = (file) => {
      if (file?.url && typeof file.url === 'string' && file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url);
      }
    };

    const beforeImageSelect = (rawFile) => {
      if (!rawFile.type.startsWith('image/')) {
        ElMessage.error('只能上传图片文件');
        return false;
      }
      if (rawFile.size > MAX_IMAGE_SIZE) {
        ElMessage.error('单张图片不能超过 10MB');
        return false;
      }
      if (imageFileList.value.length >= MAX_POST_IMAGES) {
        ElMessage.warning(`最多只能上传 ${MAX_POST_IMAGES} 张图片`);
        return false;
      }
      return true;
    };

    const handleImageChange = (uploadFile, uploadFiles) => {
      if (uploadFile.raw && !uploadFile.url) {
        uploadFile.url = URL.createObjectURL(uploadFile.raw);
      }
      imageFileList.value = uploadFiles.slice(0, MAX_POST_IMAGES);
    };

    const handleImageRemove = (uploadFile) => {
      revokeObjectUrl(uploadFile);
    };

    const handleImagePreview = (uploadFile) => {
      previewImageUrl.value = uploadFile.url || normalizeImageUrl(uploadFile.rawUrl || '');
      previewVisible.value = Boolean(previewImageUrl.value);
    };

    const handleImageExceed = () => {
      ElMessage.warning(`最多只能上传 ${MAX_POST_IMAGES} 张图片`);
    };

    const uploadSelectedImages = async () => {
      const uploadedUrls = [];
      for (let index = 0; index < imageFileList.value.length; index += 1) {
        const uploadFile = imageFileList.value[index];
        if (uploadFile.rawUrl) {
          uploadedUrls.push(uploadFile.rawUrl);
          continue;
        }

        ElMessage.info(`正在上传图片 ${index + 1}/${imageFileList.value.length}`);
        const uploadRes = await communityApi.uploadPostImage(uploadFile.raw);
        const storedUrl = uploadRes?.data?.url;
        if (!storedUrl) {
          throw new Error('图片上传失败');
        }
        uploadFile.rawUrl = storedUrl;
        uploadFile.url = normalizeImageUrl(storedUrl);
        uploadedUrls.push(storedUrl);
      }
      return uploadedUrls;
    };

    // 格式化行程摘要为文本
    const formatTripSummary = (data) => {
      if (!data) return '';
      
      let summary = '';
      
      // 1. 基础信息
      if (data.trip_summary) {
        const { destination, duration_days, travel_theme, hotel, traveler_count, start_date, end_date } = data.trip_summary;
        summary += `【行程概览】\n`;
        if (destination) summary += `📍 目的地：${destination}\n`;
        if (start_date && end_date) summary += `📅 时间：${start_date} 至 ${end_date} (${duration_days}天)\n`;
        else if (duration_days) summary += `⏱️ 行程天数：${duration_days}天\n`;
        if (traveler_count) summary += `👥 出行人数：${traveler_count}人\n`;
        if (travel_theme) summary += `🏷️ 旅行主题：${travel_theme}\n`;
        if (hotel) summary += `🏨 推荐住宿：${hotel}\n`;
        summary += '\n';
      }
      
      // 2. 每日行程
      if (data.daily_itineraries && Array.isArray(data.daily_itineraries)) {
        summary += `【每日行程】\n`;
        data.daily_itineraries.forEach(item => {
           summary += `D${item.day} (${item.date})：${item.theme || ''}\n`;
        });
        summary += '\n';
      }
      
      // 3. 实用建议
      if (data.general_recommendations) {
        summary += `【实用建议】\n`;
        const { transportation, clothing, booking, budget_note } = data.general_recommendations;
        if (transportation) summary += `🚗 交通：${transportation}\n`;
        if (clothing) summary += `👔 衣物：${clothing}\n`;
        if (booking) summary += `📅 预订：${booking}\n`;
        if (budget_note) summary += `💰 预算：${budget_note}\n`;
      }
      
      return summary;
    };

    const fetchUserTrips = async () => {
      if (!userStore.currentUser?.id) return;
      
      loadingTrips.value = true;
      try {
        const userTrips = await tripService.getUserTrips(userStore.currentUser.id);
        trips.value = userTrips || [];
        
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
      // 1. 自动填充标题
      if (selectedTrip.value && !form.title) {
        form.title = `${selectedTrip.value.city}${selectedTrip.value.days}日游分享`;
      }
      
      // 2. 自动提取行程摘要 JSON
      if (selectedTrip.value) {
         // 兼容字段名
         const aiContent = selectedTrip.value.aiContent || selectedTrip.value.ai_content;
         if (aiContent) {
             const extracted = extractJsonFromContent(aiContent);
             if (extracted) {
                 // 将 JSON 对象格式化为易读文本
                 form.tripSummary = formatTripSummary(extracted);
                 console.log('自动提取行程摘要成功:', extracted);
             }
         }
      }
    };

    const submitForm = async () => {
      if (!formRef.value) return;
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          submitting.value = true;
          try {
            const uploadedImageUrls = await uploadSelectedImages();

            // 处理 tripSummary，确保符合后端 JSON 字符串要求
            let summaryToSubmit = null;
            if (form.tripSummary && form.tripSummary.trim() !== '') {
              // 1. 如果是普通文本，包装为对象
              let summaryObj = form.tripSummary;
              if (typeof form.tripSummary === 'string') {
                 // 尝试判断是否已经是 JSON 字符串，如果不是则包装
                 if (!form.tripSummary.trim().startsWith('{')) {
                    summaryObj = { text_content: form.tripSummary };
                 } else {
                    // 如果已经是 JSON 字符串（比如复制粘贴的），尝试解析验证
                    try {
                       summaryObj = JSON.parse(form.tripSummary);
                    } catch (e) {
                       // 解析失败，当作普通文本处理
                       summaryObj = { text_content: form.tripSummary };
                    }
                 }
              }
              
              // 2. 转换为 JSON 字符串发送
              summaryToSubmit = JSON.stringify(summaryObj);
            }

            const data = {
              tripId: form.tripId,
              title: form.title,
              content: form.content,
              rating: form.rating,
              tags: form.tags,
              coverImage: uploadedImageUrls[0] || undefined,
              images: uploadedImageUrls,
              tripSummary: summaryToSubmit
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
      console.log('发布');
      
      if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录');
        router.push('/login?redirect=/community/publish');
        return;
      }
      fetchUserTrips();
    });

    onBeforeUnmount(() => {
      imageFileList.value.forEach(revokeObjectUrl);
    });

    return {
      MAX_POST_IMAGES,
      formRef,
      form,
      rules,
      loadingTrips,
      submitting,
      trips,
      selectedTrip,
      suggestedTags,
      imageFileList,
      previewVisible,
      previewImageUrl,
      coverPreviewUrl,
      beforeImageSelect,
      handleImageChange,
      handleImageRemove,
      handleImagePreview,
      handleImageExceed,
      handleTripChange,
      submitForm
    };
  }
};
</script>

<style scoped>
.publish-page {
  min-height: 100vh;
  background-color: #ffffff;
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

.post-image-uploader {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cover-preview-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cover-preview-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.cover-preview-image {
  width: 220px;
  height: 140px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
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

.dialog-preview-image {
  width: 100%;
  display: block;
  border-radius: 12px;
}

:deep(.el-upload--picture-card),
:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 132px;
  height: 132px;
}
</style>

