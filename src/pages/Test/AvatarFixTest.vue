<template>
  <div class="avatar-fix-test">
    <div class="test-container">
      <h1>头像功能修复测试</h1>
      
      <!-- 测试区域 -->
      <div class="test-section">
        <h2>🎯 修复验证</h2>
        <div class="test-card">
          <div class="test-item">
            <h3>1. 个性头像生成</h3>
            <p>测试个性头像生成是否正常，不会产生服务器错误</p>
            <AvatarUploader
              :avatar="testAvatar1"
              :userName="'张三'"
              @update:avatar="handleAvatar1Update"
            />
            <div class="result">
              <p><strong>当前头像：</strong></p>
              <UserAvatar 
                :avatar="testAvatar1" 
                :userName="'张三'" 
                size="lg" 
              />
              <p class="result-text">{{ avatar1Status }}</p>
            </div>
          </div>
          
          <div class="test-item">
            <h3>2. 用户上传图片</h3>
            <p>测试用户上传图片是否去除格子问题，使用完整图片</p>
            <AvatarUploader
              :avatar="testAvatar2"
              :userName="'李四'"
              @update:avatar="handleAvatar2Update"
            />
            <div class="result">
              <p><strong>当前头像：</strong></p>
              <UserAvatar 
                :avatar="testAvatar2" 
                :userName="'李四'" 
                size="lg" 
              />
              <p class="result-text">{{ avatar2Status }}</p>
            </div>
          </div>
          
          <div class="test-item">
            <h3>3. 默认头像选择</h3>
            <p>测试默认头像选择功能</p>
            <AvatarUploader
              :avatar="testAvatar3"
              :userName="'王五'"
              @update:avatar="handleAvatar3Update"
            />
            <div class="result">
              <p><strong>当前头像：</strong></p>
              <UserAvatar 
                :avatar="testAvatar3" 
                :userName="'王五'" 
                size="lg" 
              />
              <p class="result-text">{{ avatar3Status }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 测试结果汇总 -->
      <div class="test-section">
        <h2>📊 测试结果汇总</h2>
        <div class="summary-card">
          <div class="summary-item" :class="{ success: avatar1Success, error: !avatar1Success && testAvatar1 }">
            <span class="icon">{{ avatar1Success ? '✅' : (testAvatar1 ? '❌' : '⏳') }}</span>
            <span>个性头像功能</span>
          </div>
          <div class="summary-item" :class="{ success: avatar2Success, error: !avatar2Success && testAvatar2 }">
            <span class="icon">{{ avatar2Success ? '✅' : (testAvatar2 ? '❌' : '⏳') }}</span>
            <span>用户上传功能</span>
          </div>
          <div class="summary-item" :class="{ success: avatar3Success, error: !avatar3Success && testAvatar3 }">
            <span class="icon">{{ avatar3Success ? '✅' : (testAvatar3 ? '❌' : '⏳') }}</span>
            <span>默认头像功能</span>
          </div>
        </div>
      </div>
      
      <!-- 修复说明 -->
      <div class="test-section">
        <h2>🔧 修复内容说明</h2>
        <div class="fix-list">
          <div class="fix-item">
            <h4>1. 个性头像服务器错误修复</h4>
            <ul>
              <li>减小生成图片尺寸（400px → 200px）</li>
              <li>使用JPEG格式替代PNG，避免透明背景</li>
              <li>添加白色背景，消除格子问题</li>
              <li>优化Base64数据大小</li>
            </ul>
          </div>
          
          <div class="fix-item">
            <h4>2. 用户上传图片优化</h4>
            <ul>
              <li>移除复杂的裁剪功能</li>
              <li>直接使用用户上传的完整图片</li>
              <li>添加智能压缩，最大300px</li>
              <li>保持图片比例，避免变形</li>
            </ul>
          </div>
          
          <div class="fix-item">
            <h4>3. 系统稳定性提升</h4>
            <ul>
              <li>优化错误处理和降级机制</li>
              <li>减少不必要的Canvas操作</li>
              <li>提供更好的用户反馈</li>
              <li>兼容各种网络环境</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import AvatarUploader from '@/components/Common/AvatarUploader.vue';
import UserAvatar from '@/components/Common/UserAvatar.vue';

// 测试数据
const testAvatar1 = ref('');
const testAvatar2 = ref('');
const testAvatar3 = ref('');

// 状态文本
const avatar1Status = ref('等待测试个性头像功能...');
const avatar2Status = ref('等待测试用户上传功能...');
const avatar3Status = ref('等待测试默认头像功能...');

// 成功状态
const avatar1Success = computed(() => {
  return testAvatar1.value && testAvatar1.value.startsWith('data:image/jpeg');
});

const avatar2Success = computed(() => {
  return testAvatar2.value && (
    testAvatar2.value.startsWith('data:image/') || 
    testAvatar2.value.startsWith('http')
  );
});

const avatar3Success = computed(() => {
  return testAvatar3.value && testAvatar3.value.startsWith('http');
});

// 处理头像更新
const handleAvatar1Update = (newAvatar) => {
  testAvatar1.value = newAvatar;
  
  if (newAvatar.startsWith('data:image/jpeg')) {
    avatar1Status.value = '✅ 个性头像生成成功，使用JPEG格式，无透明背景问题';
    ElMessage.success('个性头像测试通过！');
  } else if (newAvatar.startsWith('data:image/png')) {
    avatar1Status.value = '⚠️ 使用PNG格式，可能存在透明背景问题';
    ElMessage.warning('个性头像格式需要优化');
  } else {
    avatar1Status.value = '❌ 个性头像格式异常';
    ElMessage.error('个性头像测试失败');
  }
};

const handleAvatar2Update = (newAvatar) => {
  testAvatar2.value = newAvatar;
  
  if (newAvatar.startsWith('http')) {
    avatar2Status.value = '✅ 图片已上传到云端，使用OSS URL';
    ElMessage.success('用户上传测试通过（云端）！');
  } else if (newAvatar.startsWith('data:image/')) {
    avatar2Status.value = '✅ 使用本地存储，图片已压缩优化';
    ElMessage.success('用户上传测试通过（本地）！');
  } else {
    avatar2Status.value = '❌ 用户上传功能异常';
    ElMessage.error('用户上传测试失败');
  }
};

const handleAvatar3Update = (newAvatar) => {
  testAvatar3.value = newAvatar;
  
  if (newAvatar.startsWith('http') && newAvatar.includes('dicebear')) {
    avatar3Status.value = '✅ 默认头像选择成功，使用在线头像服务';
    ElMessage.success('默认头像测试通过！');
  } else if (newAvatar.startsWith('http')) {
    avatar3Status.value = '✅ 默认头像选择成功';
    ElMessage.success('默认头像测试通过！');
  } else {
    avatar3Status.value = '❌ 默认头像功能异常';
    ElMessage.error('默认头像测试失败');
  }
};
</script>

<style scoped>
.avatar-fix-test {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.test-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

h1 {
  text-align: center;
  color: #303133;
  margin-bottom: 40px;
  font-size: 32px;
  font-weight: bold;
}

.test-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fafafa;
}

.test-section h2 {
  margin-bottom: 20px;
  color: #409eff;
  font-size: 20px;
}

.test-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.test-item {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.test-item h3 {
  color: #303133;
  margin-bottom: 10px;
}

.test-item p {
  color: #666;
  margin-bottom: 15px;
  font-size: 14px;
}

.result {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  text-align: center;
}

.result p {
  margin: 10px 0;
  font-size: 14px;
}

.result-text {
  font-weight: bold;
  color: #303133;
}

/* 汇总样式 */
.summary-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 2px solid #e4e7ed;
  transition: all 0.3s ease;
}

.summary-item.success {
  border-color: #67c23a;
  background: #f0f9ff;
}

.summary-item.error {
  border-color: #f56c6c;
  background: #fef2f2;
}

.summary-item .icon {
  font-size: 20px;
}

/* 修复说明样式 */
.fix-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.fix-item {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.fix-item h4 {
  color: #409eff;
  margin-bottom: 15px;
  font-size: 16px;
}

.fix-item ul {
  list-style: none;
  padding: 0;
}

.fix-item li {
  padding: 8px 0;
  padding-left: 20px;
  position: relative;
  color: #666;
  font-size: 14px;
}

.fix-item li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #67c23a;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-container {
    padding: 20px;
  }
  
  .test-card {
    grid-template-columns: 1fr;
  }
  
  .summary-card {
    grid-template-columns: 1fr;
  }
  
  .fix-list {
    grid-template-columns: 1fr;
  }
}
</style>