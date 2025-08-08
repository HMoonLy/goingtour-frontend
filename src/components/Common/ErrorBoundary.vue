<template>
  <div class="error-boundary">
    <div v-if="hasError" class="error-display">
      <div class="error-icon">
        <el-icon :size="48" color="#f56c6c">
          <Warning />
        </el-icon>
      </div>
      <h3 class="error-title">页面出现了问题</h3>
      <p class="error-message">{{ errorMessage }}</p>
      <div class="error-actions">
        <el-button type="primary" @click="handleRetry">
          <el-icon><Refresh /></el-icon>
          重试
        </el-button>
        <el-button @click="handleGoHome">
          <el-icon><House /></el-icon>
          返回首页
        </el-button>
      </div>
      <el-collapse v-if="showDetails" class="error-details">
        <el-collapse-item title="错误详情" name="details">
          <pre class="error-stack">{{ errorDetails }}</pre>
        </el-collapse-item>
      </el-collapse>
      <div class="error-toggle">
        <el-button link @click="showDetails = !showDetails">
          {{ showDetails ? '隐藏' : '显示' }}错误详情
        </el-button>
      </div>
    </div>
    <slot v-else />
  </div>
</template>

<script setup>
import { ref, onErrorCaptured, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Warning, Refresh, House } from '@element-plus/icons-vue';

const props = defineProps({
  fallback: {
    type: Function,
    default: null
  },
  onError: {
    type: Function,
    default: null
  }
});

const router = useRouter();

const hasError = ref(false);
const errorMessage = ref('');
const errorDetails = ref('');
const showDetails = ref(false);

// 捕获子组件错误
onErrorCaptured((error, instance, info) => {
  console.error('Vue错误边界捕获到错误:', error);
  console.error('错误信息:', info);
  console.error('组件实例:', instance);

  // 设置错误状态
  hasError.value = true;
  errorMessage.value = error.message || '未知错误';
  errorDetails.value = `错误: ${error.message}\n\n堆栈信息:\n${error.stack}\n\n组件信息:\n${info}`;

  // 调用自定义错误处理函数
  if (props.onError) {
    props.onError(error, instance, info);
  }

  // 上报错误（可选）
  if (import.meta.env.PROD) {
    // 这里可以添加错误上报逻辑
    // reportError(error, instance, info);
  }

  // 阻止错误继续传播
  return false;
});

// 重试功能
const handleRetry = async () => {
  hasError.value = false;
  errorMessage.value = '';
  errorDetails.value = '';
  showDetails.value = false;

  // 等待下一个tick，让组件重新渲染
  await nextTick();
  
  // 如果有自定义的fallback函数，调用它
  if (props.fallback) {
    try {
      await props.fallback();
    } catch (error) {
      console.error('Fallback函数执行失败:', error);
      ElMessage.error('重试失败，请刷新页面');
    }
  }
};

// 返回首页
const handleGoHome = () => {
  router.push('/home');
};

// 重置错误状态的方法，供外部调用
const resetError = () => {
  hasError.value = false;
  errorMessage.value = '';
  errorDetails.value = '';
  showDetails.value = false;
};

// 暴露方法给父组件
defineExpose({
  resetError
});
</script>

<style scoped>
.error-boundary {
  width: 100%;
  height: 100%;
}

.error-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  min-height: 400px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.error-icon {
  margin-bottom: 16px;
}

.error-title {
  color: #303133;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px 0;
  text-align: center;
}

.error-message {
  color: #606266;
  font-size: 14px;
  margin: 0 0 24px 0;
  text-align: center;
  max-width: 500px;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.error-details {
  width: 100%;
  max-width: 600px;
  margin-bottom: 16px;
}

.error-stack {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: #606266;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}

.error-toggle {
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-display {
    padding: 20px 16px;
    min-height: 300px;
  }

  .error-title {
    font-size: 18px;
  }

  .error-actions {
    flex-direction: column;
    width: 100%;
    max-width: 200px;
  }

  .error-details {
    max-width: 100%;
  }
}
</style>