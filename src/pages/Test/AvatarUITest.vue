<template>
  <div class="avatar-ui-test">
    <div class="test-container">
      <h1>头像UI交互测试</h1>
      
      <div class="test-section">
        <h2>🎯 上传交互测试</h2>
        <p class="test-description">
          测试选择图片后，上传区域是否正确隐藏，预览区域是否正确显示
        </p>
        
        <div class="test-card">
          <div class="test-item">
            <h3>头像上传器</h3>
            <AvatarUploader
              :avatar="testAvatar"
              :userName="'测试用户'"
              @update:avatar="handleAvatarUpdate"
            />
            
            <div class="test-status">
              <h4>当前状态：</h4>
              <div class="status-info">
                <p><strong>头像值：</strong> {{ testAvatar ? '已设置' : '未设置' }}</p>
                <p><strong>头像类型：</strong> {{ getAvatarType(testAvatar) }}</p>
                <p><strong>数据大小：</strong> {{ getDataSize(testAvatar) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="test-section">
        <h2>📋 测试步骤</h2>
        <div class="test-steps">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>选择图片</h4>
              <p>点击或拖拽图片到上传区域，验证上传区域是否隐藏</p>
            </div>
          </div>
          
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>查看预览</h4>
              <p>确认图片预览正确显示，且有"重新选择"按钮</p>
            </div>
          </div>
          
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>重新选择</h4>
              <p>点击"重新选择"按钮，验证是否回到上传界面</p>
            </div>
          </div>
          
          <div class="step-item">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>保存头像</h4>
              <p>点击"保存头像"，验证成功状态和自动关闭</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="test-section">
        <h2>✅ 预期结果</h2>
        <div class="expected-results">
          <div class="result-item success">
            <span class="icon">✅</span>
            <span>选择图片后，上传区域立即隐藏</span>
          </div>
          <div class="result-item success">
            <span class="icon">✅</span>
            <span>预览区域正确显示选择的图片</span>
          </div>
          <div class="result-item success">
            <span class="icon">✅</span>
            <span>"重新选择"按钮功能正常</span>
          </div>
          <div class="result-item success">
            <span class="icon">✅</span>
            <span>保存后显示成功状态，3秒后自动关闭</span>
          </div>
          <div class="result-item success">
            <span class="icon">✅</span>
            <span>个性头像生成无服务器错误</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import AvatarUploader from '@/components/Common/AvatarUploader.vue';

const testAvatar = ref('');

const handleAvatarUpdate = (newAvatar) => {
  testAvatar.value = newAvatar;
  
  const avatarType = getAvatarType(newAvatar);
  const dataSize = getDataSize(newAvatar);
  
  ElMessage.success(`头像更新成功！类型：${avatarType}，大小：${dataSize}`);
  
  console.log('🔄 头像更新:', {
    type: avatarType,
    size: dataSize,
    preview: newAvatar.substring(0, 100) + '...'
  });
};

const getAvatarType = (avatar) => {
  if (!avatar) return '未设置';
  if (avatar.startsWith('data:image/jpeg')) return '个性头像 (JPEG)';
  if (avatar.startsWith('data:image/png')) return '个性头像 (PNG)';
  if (avatar.startsWith('data:image/')) return '用户上传 (Base64)';
  if (avatar.startsWith('http')) return '在线头像 (URL)';
  return '未知类型';
};

const getDataSize = (avatar) => {
  if (!avatar) return '0 字节';
  if (avatar.startsWith('http')) return 'URL (无本地存储)';
  
  // 计算Base64数据大小
  const base64Data = avatar.split(',')[1] || avatar;
  const bytes = Math.ceil(base64Data.length * 0.75);
  
  if (bytes < 1024) return `${bytes} 字节`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};
</script>

<style scoped>
.avatar-ui-test {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.test-container {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

h1 {
  text-align: center;
  color: #303133;
  margin-bottom: 40px;
  font-size: 28px;
  font-weight: bold;
}

.test-section {
  margin-bottom: 40px;
  padding: 25px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fafafa;
}

.test-section h2 {
  margin-bottom: 15px;
  color: #409eff;
  font-size: 20px;
}

.test-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
  line-height: 1.6;
}

.test-card {
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.test-item h3 {
  color: #303133;
  margin-bottom: 20px;
  font-size: 16px;
}

.test-status {
  margin-top: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.test-status h4 {
  margin: 0 0 12px 0;
  color: #409eff;
  font-size: 14px;
}

.status-info p {
  margin: 8px 0;
  font-size: 13px;
  color: #666;
}

.status-info strong {
  color: #303133;
}

/* 测试步骤样式 */
.test-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.step-number {
  width: 32px;
  height: 32px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
}

.step-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

/* 预期结果样式 */
.expected-results {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 6px;
  border-left: 4px solid #67c23a;
}

.result-item .icon {
  font-size: 18px;
  color: #67c23a;
}

.result-item span:last-child {
  color: #303133;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-container {
    padding: 20px;
    margin: 10px;
  }
  
  .test-section {
    padding: 20px;
  }
  
  .step-item {
    flex-direction: column;
    text-align: center;
  }
  
  .step-number {
    align-self: center;
  }
}
</style>
