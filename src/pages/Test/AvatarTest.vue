<template>
  <div class="avatar-test-page">
    <div class="test-container">
      <h1>头像功能测试</h1>
      
      <!-- 测试区域 -->
      <div class="test-section">
        <h2>🎯 头像上传组件测试</h2>
        <div class="avatar-demo">
          <AvatarUploader
            :avatar="testAvatar"
            :userName="testUserName"
            @update:avatar="handleAvatarUpdate"
          />
          
          <div class="current-avatar">
            <h3>当前头像预览：</h3>
            <UserAvatar
              :avatar="testAvatar"
              :userName="testUserName"
              size="xl"
              :showTooltip="true"
            />
          </div>
        </div>
      </div>

      <!-- 不同尺寸展示 -->
      <div class="test-section">
        <h2>📏 不同尺寸展示</h2>
        <div class="size-demo">
          <div class="size-item">
            <UserAvatar :avatar="testAvatar" :userName="testUserName" size="xs" />
            <span>xs (24px)</span>
          </div>
          <div class="size-item">
            <UserAvatar :avatar="testAvatar" :userName="testUserName" size="sm" />
            <span>sm (32px)</span>
          </div>
          <div class="size-item">
            <UserAvatar :avatar="testAvatar" :userName="testUserName" size="md" />
            <span>md (48px)</span>
          </div>
          <div class="size-item">
            <UserAvatar :avatar="testAvatar" :userName="testUserName" size="lg" />
            <span>lg (80px)</span>
          </div>
          <div class="size-item">
            <UserAvatar :avatar="testAvatar" :userName="testUserName" size="xl" />
            <span>xl (120px)</span>
          </div>
        </div>
      </div>

      <!-- 状态指示器测试 -->
      <div class="test-section">
        <h2>🟢 状态指示器测试</h2>
        <div class="status-demo">
          <div class="status-item">
            <UserAvatar 
              :avatar="testAvatar" 
              :userName="testUserName" 
              size="lg" 
              :showStatus="true" 
              status="online"
            />
            <span>在线</span>
          </div>
          <div class="status-item">
            <UserAvatar 
              :avatar="testAvatar" 
              :userName="testUserName" 
              size="lg" 
              :showStatus="true" 
              status="busy"
            />
            <span>忙碌</span>
          </div>
          <div class="status-item">
            <UserAvatar 
              :avatar="testAvatar" 
              :userName="testUserName" 
              size="lg" 
              :showStatus="true" 
              status="away"
            />
            <span>离开</span>
          </div>
          <div class="status-item">
            <UserAvatar 
              :avatar="testAvatar" 
              :userName="testUserName" 
              size="lg" 
              :showStatus="true" 
              status="offline"
            />
            <span>离线</span>
          </div>
        </div>
      </div>

      <!-- 不同用户名测试 -->
      <div class="test-section">
        <h2>👤 不同用户名测试</h2>
        <div class="username-demo">
          <div class="username-item">
            <UserAvatar avatar="" userName="张三" size="lg" />
            <span>张三</span>
          </div>
          <div class="username-item">
            <UserAvatar avatar="" userName="李小明" size="lg" />
            <span>李小明</span>
          </div>
          <div class="username-item">
            <UserAvatar avatar="" userName="John Smith" size="lg" />
            <span>John Smith</span>
          </div>
          <div class="username-item">
            <UserAvatar avatar="" userName="Alice" size="lg" />
            <span>Alice</span>
          </div>
          <div class="username-item">
            <UserAvatar avatar="" userName="محمد" size="lg" />
            <span>محمد</span>
          </div>
        </div>
      </div>

      <!-- 测试控制 -->
      <div class="test-section">
        <h2>🎮 测试控制</h2>
        <div class="test-controls">
          <el-button @click="clearAvatar">清空头像</el-button>
          <el-button @click="changeUserName">更换用户名</el-button>
          <el-button @click="testOSS">测试OSS上传</el-button>
        </div>
        
        <div class="test-info">
          <h3>测试信息：</h3>
          <p><strong>用户名：</strong>{{ testUserName }}</p>
          <p><strong>头像URL：</strong>{{ testAvatar || '无' }}</p>
          <p><strong>OSS配置状态：</strong>{{ ossStatus }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElButton } from 'element-plus';
import AvatarUploader from '@/components/Common/AvatarUploader.vue';
import UserAvatar from '@/components/Common/UserAvatar.vue';

// 响应式数据
const testAvatar = ref('');
const testUserName = ref('测试用户');
const ossStatus = ref('检查中...');

// 测试用户名列表
const testNames = ['测试用户', '张三', '李小明', 'John Doe', 'Alice', 'Bob'];
let currentNameIndex = 0;

// 组件挂载时检查OSS状态
onMounted(async () => {
  checkOSSStatus();
});

// 检查OSS配置状态
const checkOSSStatus = async () => {
  try {
    const { ossUploader } = await import('@/utils/ossUpload.js');
    if (ossUploader.isAvailable()) {
      ossStatus.value = '✅ OSS已配置';
    } else {
      ossStatus.value = '❌ OSS未配置';
    }
  } catch (error) {
    ossStatus.value = '❌ OSS模块加载失败';
    console.error('OSS状态检查失败:', error);
  }
};

// 处理头像更新
const handleAvatarUpdate = (newAvatar) => {
  testAvatar.value = newAvatar;
  console.log('🎉 头像更新成功:', newAvatar);
  ElMessage.success('头像更新成功！');
};

// 清空头像
const clearAvatar = () => {
  testAvatar.value = '';
  ElMessage.info('头像已清空');
};

// 更换用户名
const changeUserName = () => {
  currentNameIndex = (currentNameIndex + 1) % testNames.length;
  testUserName.value = testNames[currentNameIndex];
  ElMessage.info(`用户名已更换为：${testUserName.value}`);
};

// 测试OSS上传
const testOSS = async () => {
  try {
    const { ossUploader } = await import('@/utils/ossUpload.js');
    if (!ossUploader.isAvailable()) {
      ElMessage.warning('OSS未配置，请先配置OSS服务');
      return;
    }
    
    ElMessage.success('OSS配置正常，可以进行文件上传');
  } catch (error) {
    ElMessage.error('OSS测试失败：' + error.message);
  }
};
</script>

<style scoped>
.avatar-test-page {
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

/* 头像演示 */
.avatar-demo {
  display: flex;
  align-items: flex-start;
  gap: 40px;
}

.current-avatar {
  text-align: center;
}

.current-avatar h3 {
  margin-bottom: 16px;
  color: #606266;
}

/* 尺寸演示 */
.size-demo {
  display: flex;
  gap: 30px;
  align-items: center;
  flex-wrap: wrap;
}

.size-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.size-item span {
  font-size: 12px;
  color: #909399;
}

/* 状态演示 */
.status-demo {
  display: flex;
  gap: 30px;
  align-items: center;
  flex-wrap: wrap;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.status-item span {
  font-size: 14px;
  color: #606266;
}

/* 用户名演示 */
.username-demo {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.username-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.username-item span {
  font-size: 12px;
  color: #909399;
  max-width: 80px;
  text-align: center;
  word-break: break-all;
}

/* 测试控制 */
.test-controls {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.test-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.test-info h3 {
  margin-bottom: 12px;
  color: #303133;
  font-size: 16px;
}

.test-info p {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-container {
    padding: 20px;
  }
  
  .avatar-demo {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  
  .size-demo,
  .status-demo,
  .username-demo {
    justify-content: center;
  }
  
  .test-controls {
    justify-content: center;
  }
}
</style>