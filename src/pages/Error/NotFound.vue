<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <!-- 404图标 -->
      <div class="error-icon">
        <el-icon
size="120" color="#FB8C00"
>
          <Warning />
        </el-icon>
      </div>

      <!-- 错误信息 -->
      <div class="error-info">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">
          {{ "页面不存在" }}
        </h2>
        <p class="error-description">
          {{ "抱歉，您访问的页面不存在或已被移除。" }}
          <br >
          {{ "请检查网址是否正确，或返回首页继续浏览。" }}
        </p>
      </div>

      <!-- 操作按钮 -->
      <div class="error-actions">
        <el-button
          type="primary"
          size="large"
          class="action-btn"
          @click="goHome"
        >
          <el-icon><House /></el-icon>
          {{ "返回首页" }}
        </el-button>

        <el-button size="large"
@click="goBack" class="action-btn"
>
          <el-icon><Back /></el-icon>
          {{ "返回上页" }}
        </el-button>
      </div>

      <!-- 建议链接 -->
      <div class="suggestions">
        <p class="suggestions-title">
          {{ "您可能在寻找：" }}
        </p>
        <div class="suggestions-links">
          <el-link
            type="primary"
            :underline="false"
            @click="$router.push('/login')"
          >
            {{ "登录" }}
          </el-link>
          <el-link
            type="primary"
            :underline="false"
            @click="$router.push('/destinations')"
          >
            {{ "选择目的地" }}
          </el-link>
          <el-link
            type="primary"
            :underline="false"
            @click="$router.push('/home')"
          >
            {{ "首页" }}
          </el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { Warning, House, Back } from "@element-plus/icons-vue";

export default {
  name: "NotFound",
  components: {
    Warning,
    House,
    Back,
  },
  setup() {
    const router = useRouter();

    const goHome = () => {
      router.push("/");
    };

    const goBack = () => {
      if (window.history.length > 1) {
        router.go(-1);
      } else {
        router.push("/");
      }
    };

    return {
      goHome,
      goBack,
    };
  },
};
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
}

.not-found-content {
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 48px 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 500px;
  width: 100%;
}

.error-icon {
  margin-bottom: 24px;
}

.error-info {
  margin-bottom: 32px;
}

.error-code {
  font-size: 72px;
  font-weight: 700;
  color: #f7cac9;
  margin: 0 0 16px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.error-title {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.error-description {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 32px;
}

.action-btn {
  height: 44px;
  padding: 0 24px;
  font-size: 15px;
  border-radius: 22px;
}

.suggestions {
  border-top: 1px solid #ebeef5;
  padding-top: 24px;
}

.suggestions-title {
  font-size: 14px;
  color: #909399;
  margin: 0 0 16px 0;
}

.suggestions-links {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.suggestions-links .el-link {
  font-size: 14px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .not-found-content {
    padding: 32px 24px;
  }

  .error-code {
    font-size: 60px;
  }

  .error-title {
    font-size: 24px;
  }

  .error-description {
    font-size: 14px;
  }

  .error-actions {
    flex-direction: column;
    align-items: center;
  }

  .action-btn {
    width: 100%;
    max-width: 200px;
  }

  .suggestions-links {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .not-found-page {
    padding: 16px;
  }

  .not-found-content {
    padding: 24px 20px;
  }

  .error-code {
    font-size: 48px;
  }

  .error-title {
    font-size: 20px;
  }
}
</style>
