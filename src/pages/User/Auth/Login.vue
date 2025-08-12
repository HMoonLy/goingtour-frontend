<template>
  <div class="login-page">
    <!-- 左侧品牌展示区 -->
    <div class="login-brand">
      <div class="brand-content">
        <!-- Logo和品牌名 -->
        <div class="brand-header">
          <div class="brand-logo">
            <el-icon
size="60" color="#ffffff"
>
              <MapLocation />
            </el-icon>
          </div>
          <h1 class="brand-title">GoingTour</h1>
          <p class="brand-subtitle">
智能旅行规划专家
</p>
        </div>

        <!-- 产品特性展示 -->
        <div class="features">
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon
size="32" color="#ffffff"
>
                <Location />
              </el-icon>
            </div>
            <div class="feature-text">
              <h3>智能规划</h3>
              <p>AI算法帮您制定最佳行程</p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <el-icon
size="32" color="#ffffff"
>
                <DataAnalysis />
              </el-icon>
            </div>
            <div class="feature-text">
              <h3>数据分析</h3>
              <p>优质旅游数据与内容推荐</p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <el-icon
size="32" color="#ffffff"
>
                <Share />
              </el-icon>
            </div>
            <div class="feature-text">
              <h3>行程分享</h3>
              <p>与朋友分享精彩旅行经历</p>
            </div>
          </div>
        </div>

        <!-- 底部装饰 -->
        <div class="brand-footer">
          <p>&copy; 2024 GoingTour. 版权所有</p>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单区 -->
    <div class="login-form-section">
      <div class="form-container">
        <!-- 表单头部 -->
        <div class="form-header">
          <h2 class="form-title">
欢迎回来
</h2>
          <p class="form-subtitle">
登录 - 智能旅行规划专家
</p>
        </div>

        <!-- 登录表单 -->
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          size="large"
          @submit.prevent="handleLogin"
        >
          <!-- 邮箱输入 -->
          <el-form-item
prop="email" class="form-item"
>
            <label class="form-label">邮箱</label>
            <el-input
              v-model="loginForm.email"
              :placeholder="邮箱"
              clearable
              class="form-input"
              @input="handleEmailInput"
            >
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 验证码输入 -->
          <el-form-item
prop="code" class="form-item"
>
            <label class="form-label">验证码</label>
            <div class="code-input-group">
              <el-input
                v-model="loginForm.code"
                :placeholder="验证码"
                clearable
                maxlength="6"
                class="form-input"
                @input="handleCodeInput"
              >
                <template #prefix>
                  <el-icon><Key /></el-icon>
                </template>
              </el-input>

              <!-- 发送验证码按钮 -->
              <el-button
                :disabled="!canSendCode || countdown > 0"
                :loading="sendingCode"
                class="send-code-btn"
                type="primary"
                plain
                @click="sendVerificationCode"
              >
                {{ countdown > 0 ? `${countdown}秒后重发` : "发送验证码" }}
              </el-button>
            </div>
          </el-form-item>

          <!-- 登录按钮 -->
          <el-form-item class="form-item">
            <el-button
              type="primary"
              :loading="loggingIn"
              class="login-btn"
              size="large"
              @click="handleLogin"
            >
              <el-icon v-if="!loggingIn">
                <User />
              </el-icon>
              {{ loggingIn ? "登录中..." : "登录" }}
            </el-button>
          </el-form-item>

          <!-- 其他登录方式 -->
          <div class="other-login">
            <el-divider>
              <span class="divider-text">{{ "其他登录方式" }}</span>
            </el-divider>

            <div class="social-login">
              <el-button
                class="social-btn wechat-btn"
                size="large"
                circle
                @click="handleWechatLogin"
              >
                <el-icon size="20">
                  <ChatDotRound />
                </el-icon>
              </el-button>

              <el-button
                class="social-btn qq-btn"
                size="large"
                circle
                disabled
                @click="handleQQLogin"
              >
                <el-icon size="20">
                  <User />
                </el-icon>
              </el-button>
            </div>
          </div>

          <!-- 注册链接 -->
          <div class="register-section">
            <span class="register-text">还没有账户？</span>
            <el-link
              type="primary"
              :underline="false"
              class="register-link"
              @click="goToRegister"
            >
              立即注册
            </el-link>
          </div>
        </el-form>

        <!-- 协议条款 -->
        <div class="agreement">
          <p>
            登录即表示您同意我们的
            <el-link type="primary"
:underline="false"
>
用户协议
</el-link>
            <el-link type="primary"
:underline="false"
>
隐私政策
</el-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/store/user";
import { ElMessage } from "element-plus";
import {
  MapLocation,
  Location,
  DataAnalysis,
  Share,
  Message,
  Key,
  User,
  ChatDotRound,
} from "@element-plus/icons-vue";
import { formRules } from "@/utils/validation.js";
import { handleApiError, handleSuccess } from "@/utils/errorHandler.js";

export default {
  name: "Login",
  components: {
    MapLocation,
    Location,
    DataAnalysis,
    Share,
    Message,
    Key,
    User,
    ChatDotRound,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const userStore = useUserStore();

    // 表单引用
    const loginFormRef = ref();

    // 登录表单数据
    const loginForm = reactive({
      email: "",
      code: "",
    });

    // 状态管理
    const sendingCode = ref(false);
    const loggingIn = ref(false);
    const countdown = ref(0);
    let countdownTimer = null;

    // 表单验证规则 - 使用统一的验证工具
    const loginRules = {
      email: formRules.email,
      code: formRules.verificationCode,
    };

    // 计算属性
    const canSendCode = computed(() => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(loginForm.email);
    });

    // 输入处理
    const handleEmailInput = (value) => {
      loginForm.email = value.trim().toLowerCase();
    };

    const handleCodeInput = (value) => {
      loginForm.code = value.replace(/\D/g, "");
    };

    // 发送验证码
    const sendVerificationCode = async () => {
      if (!canSendCode.value) {
        ElMessage.warning("请输入正确的邮箱地址");
        return;
      }

      try {
        sendingCode.value = true;

        await userStore.sendVerificationCode(loginForm.email, "login");

        ElMessage.success("验证码已发送");

        // 开始倒计时
        startCountdown(60);
      } catch (error) {
        ElMessage.error(error.message || "操作失败");
      } finally {
        sendingCode.value = false;
      }
    };

    // 倒计时功能
    const startCountdown = (seconds) => {
      countdown.value = seconds;
      countdownTimer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(countdownTimer);
          countdownTimer = null;
        }
      }, 1000);
    };

    // 登录处理
    const handleLogin = async () => {
      if (!loginFormRef.value) return;

      try {
        await loginFormRef.value.validate();

        loggingIn.value = true;

        const user = await userStore.login(loginForm.email, loginForm.code);

        handleSuccess(`欢迎回来，${user.nickname || "用户"}！`, {
          showNotification: true,
        });

        const redirectPath =
          userStore.getAndClearRedirectPath() ||
          route.query.redirect ||
          "/home";

        await router.push(redirectPath);
      } catch (error) {
        handleApiError(error, "操作失败");
      } finally {
        loggingIn.value = false;
      }
    };

    // 微信登录
    const handleWechatLogin = () => {
      ElMessage.info("WeChat Login WIP");
    };

    // QQ登录
    const handleQQLogin = () => {
      ElMessage.info("QQ Login WIP");
    };

    // 跳转注册
    const goToRegister = () => {
      router.push("/register");
    };

    // 组件挂载
    onMounted(() => {
      if (userStore.isLoggedIn) {
        router.push("/home");
      }
    });

    // 组件卸载
    onUnmounted(() => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    });

    return {
      loginFormRef,
      loginForm,
      loginRules,
      sendingCode,
      loggingIn,
      countdown,
      canSendCode,
      handleEmailInput,
      handleCodeInput,
      sendVerificationCode,
      handleLogin,
      handleWechatLogin,
      handleQQLogin,
      goToRegister,
    };
  },
};
</script>

<style scoped>
/* 统一的页面布局 - 修复全屏显示 */
.login-page {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  display: flex !important;
  z-index: 1000 !important;
}

/* 重置可能影响布局的样式 */
.login-page * {
  box-sizing: border-box !important;
}

/* ========== 左侧品牌展示区 ========== */
.login-brand {
  flex: 0 0 35%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-brand::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.1) 1px,
    transparent 1px
  );
  background-size: 50px 50px;
  animation: float-dots 20s linear infinite;
}

@keyframes float-dots {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    transform: translate(-50px, -50px) rotate(360deg);
  }
}

.brand-content {
  color: white;
  width: 100%;
  max-width: 600px;
  position: relative;
  z-index: 2;
}

.brand-header {
  text-align: center;
  margin-bottom: 60px;
}

.brand-logo {
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.brand-title {
  font-size: 56px;
  font-weight: 700;
  margin: 0 0 16px 0;
  letter-spacing: 3px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #ffffff, #e3f2fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: title-glow 3s ease-in-out infinite alternate;
}

@keyframes title-glow {
  0% {
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
  }
  100% {
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.6));
  }
}

.brand-subtitle {
  font-size: 20px;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

.features {
  margin-bottom: 40px;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding: 25px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateX(15px);
  background: rgba(255, 255, 255, 0.2);
}

.feature-icon {
  margin-right: 20px;
  flex-shrink: 0;
}

.feature-text h3 {
  font-size: 18px;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.feature-text p {
  font-size: 14px;
  margin: 0;
  opacity: 0.8;
  line-height: 1.5;
}

.brand-footer {
  text-align: center;
  opacity: 0.7;
  font-size: 14px;
}

.brand-footer p {
  margin: 0;
}

/* ========== 右侧登录表单区 ========== */
.login-form-section {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
  position: relative;
}

.login-form-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.8) 50%,
    rgba(255, 255, 255, 0.9) 100%
  );
  z-index: 1;
}

.form-container {
  position: relative;
  z-index: 2;
}

.form-container {
  width: 100%;
  max-width: 380px;
  animation: slide-in-right 0.8s ease-out;
}

@keyframes slide-in-right {
  0% {
    transform: translateX(50px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-title {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.form-subtitle {
  font-size: 16px;
  color: #909399;
  margin: 0;
  line-height: 1.5;
}

.form-item {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.form-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 0 16px;
  border: 2px solid #e4e7ed;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 52px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.form-input :deep(.el-input__wrapper:hover) {
  border-color: #b3c0d1;
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.form-input :deep(.el-input.is-focus .el-input__wrapper) {
  border-color: #667eea;
  background: rgba(255, 255, 255, 1);
  box-shadow:
    0 0 0 3px rgba(102, 126, 234, 0.1),
    0 4px 16px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.code-input-group {
  display: flex;
  gap: 12px;
}

.code-input-group .form-input {
  flex: 1;
}

.send-code-btn {
  flex-shrink: 0;
  width: 110px;
  height: 52px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #0070f8;
  border: none;
  color: white;
}

.send-code-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-btn {
  width: 100%;
  height: 56px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 14px;
  margin-top: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s;
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

.login-btn:active {
  transform: translateY(-1px);
  transition: all 0.1s;
}

.other-login {
  margin: 32px 0;
}

.divider-text {
  color: #909399;
  font-size: 13px;
  padding: 0 16px;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.social-btn {
  width: 48px;
  height: 48px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.social-btn::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

.social-btn:hover::before {
  width: 100px;
  height: 100px;
}

.social-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.wechat-btn {
  background: #07c160;
  border-color: #07c160;
  color: white;
}

.wechat-btn:hover {
  background: #06ad56;
  border-color: #06ad56;
}

.qq-btn {
  background: #12b7f5;
  border-color: #12b7f5;
  color: white;
}

.register-section {
  text-align: center;
  margin: 24px 0;
}

.register-text {
  color: #909399;
  font-size: 14px;
}

.register-link {
  margin-left: 6px;
  font-weight: 500;
  font-size: 14px;
}

.agreement {
  text-align: center;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.agreement p {
  font-size: 12px;
  color: #c0c4cc;
  margin: 0;
  line-height: 1.5;
}

/* ========== 响应式设计 ========== */
@media (max-width: 1200px) {
  .login-brand {
    padding: 30px;
  }

  .brand-title {
    font-size: 48px;
  }

  .login-form-section {
    flex: 0 0 500px;
  }
}

@media (max-width: 1024px) {
  .login-page {
    flex-direction: column;
    height: auto;
    min-height: calc(100vh - 64px);
  }

  .login-brand {
    flex: 0 0 40vh;
    min-height: 300px;
    padding: 20px;
  }

  .brand-title {
    font-size: 36px;
  }

  .brand-subtitle {
    font-size: 16px;
  }

  .features {
    display: none;
  }

  .login-form-section {
    flex: 1;
    min-height: 60vh;
    box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.1);
  }
}

@media (max-width: 768px) {
  .login-brand {
    flex: 0 0 30vh;
    min-height: 250px;
    padding: 15px;
  }

  .brand-title {
    font-size: 28px;
    letter-spacing: 1px;
  }

  .brand-subtitle {
    font-size: 14px;
  }

  .form-container {
    max-width: 320px;
  }

  .form-title {
    font-size: 24px;
  }

  .form-subtitle {
    font-size: 14px;
  }

  .code-input-group {
    flex-direction: column;
    gap: 8px;
  }

  .send-code-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .login-page {
    top: 0 !important;
    height: 100vh !important;
  }

  .login-brand {
    flex: 0 0 25vh;
    min-height: 200px;
    padding: 10px;
  }

  .brand-header {
    margin-bottom: 20px;
  }

  .brand-title {
    font-size: 24px;
  }

  .brand-subtitle {
    font-size: 12px;
  }

  .form-container {
    max-width: 280px;
  }

  .form-header {
    margin-bottom: 30px;
  }

  .form-title {
    font-size: 20px;
  }

  .form-item {
    margin-bottom: 20px;
  }

  .social-login {
    gap: 12px;
  }

  .social-btn {
    width: 44px;
    height: 44px;
  }
}

/* ========== 动画增强 ========== */
.feature-item {
  animation: fade-in-up 0.6s ease-out forwards;
  animation-delay: var(--delay, 0s);
}

.feature-item:nth-child(1) {
  --delay: 0.2s;
}

.feature-item:nth-child(2) {
  --delay: 0.4s;
}

.feature-item:nth-child(3) {
  --delay: 0.6s;
}

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========== 高对比度和无障碍支持 ========== */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

@media (prefers-contrast: high) {
  .form-input :deep(.el-input__wrapper) {
    border-width: 3px;
  }

  .login-btn {
    border: 2px solid #333;
  }
}
</style>
