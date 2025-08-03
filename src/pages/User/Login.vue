<template>
  <div class="login-page">
    <!-- 左侧品牌展示区 -->
    <div class="login-brand">
      <div class="brand-content">
        <!-- Logo和品牌名 -->
        <div class="brand-header">
          <div class="brand-logo">
            <el-icon size="60" color="#ffffff">
              <MapLocation />
            </el-icon>
          </div>
          <h1 class="brand-title">GoingTour</h1>
          <p class="brand-subtitle">个性化旅行规划助手</p>
        </div>

        <!-- 产品特性展示 -->
        <div class="features">
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon size="32" color="#ffffff">
                <Location />
              </el-icon>
            </div>
            <div class="feature-text">
              <h3>智能行程规划</h3>
              <p>AI驱动的个性化旅行路线推荐</p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <el-icon size="32" color="#ffffff">
                <DataAnalysis />
              </el-icon>
            </div>
            <div class="feature-text">
              <h3>数据分析优化</h3>
              <p>基于用户偏好的精准景点匹配</p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <el-icon size="32" color="#ffffff">
                <Share />
              </el-icon>
            </div>
            <div class="feature-text">
              <h3>行程分享协作</h3>
              <p>与朋友轻松分享和共同规划旅程</p>
            </div>
          </div>
        </div>

        <!-- 底部装饰 -->
        <div class="brand-footer">
          <p>&copy; 2024 GoingTour. 让每一次旅行都充满惊喜</p>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单区 -->
    <div class="login-form-section">
      <div class="form-container">
        <!-- 表单头部 -->
        <div class="form-header">
          <h2 class="form-title">欢迎回来</h2>
          <p class="form-subtitle">请登录您的账户，继续您的旅行规划</p>
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
          <!-- 手机号输入 -->
          <el-form-item prop="phone" class="form-item">
            <label class="form-label">手机号</label>
            <el-input
              v-model="loginForm.phone"
              placeholder="请输入手机号"
              clearable
              maxlength="11"
              class="form-input"
              @input="handlePhoneInput"
            >
              <template #prefix>
                <el-icon><Phone /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 验证码输入 -->
          <el-form-item prop="code" class="form-item">
            <label class="form-label">验证码</label>
            <div class="code-input-group">
              <el-input
                v-model="loginForm.code"
                placeholder="请输入验证码"
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
                {{ countdown > 0 ? `${countdown}s后重发` : "发送验证码" }}
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
              {{ loggingIn ? "登录中..." : "立即登录" }}
            </el-button>
          </el-form-item>

          <!-- 其他登录方式 -->
          <div class="other-login">
            <el-divider>
              <span class="divider-text">其他登录方式</span>
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
            <span class="register-text">还没有账号？</span>
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
            登录即表示同意
            <el-link type="primary" :underline="false"> 《用户协议》 </el-link>
            和
            <el-link type="primary" :underline="false"> 《隐私政策》 </el-link>
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
import { ElMessage, ElNotification } from "element-plus";
import {
  MapLocation,
  Location,
  DataAnalysis,
  Share,
  Phone,
  Key,
  User,
  ChatDotRound,
} from "@element-plus/icons-vue";

export default {
  name: "Login",
  components: {
    MapLocation,
    Location,
    DataAnalysis,
    Share,
    Phone,
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
      phone: "",
      code: "",
    });

    // 状态管理
    const sendingCode = ref(false);
    const loggingIn = ref(false);
    const countdown = ref(0);
    let countdownTimer = null;

    // 表单验证规则
    const loginRules = {
      phone: [
        { required: true, message: "请输入手机号", trigger: "blur" },
        {
          pattern: /^1[3-9]\d{9}$/,
          message: "请输入正确的手机号格式",
          trigger: "blur",
        },
      ],
      code: [
        { required: true, message: "请输入验证码", trigger: "blur" },
        {
          pattern: /^\d{6}$/,
          message: "验证码必须是6位数字",
          trigger: "blur",
        },
      ],
    };

    // 计算属性
    const canSendCode = computed(() => {
      return /^1[3-9]\d{9}$/.test(loginForm.phone);
    });

    // 输入处理
    const handlePhoneInput = (value) => {
      loginForm.phone = value.replace(/\D/g, "");
    };

    const handleCodeInput = (value) => {
      loginForm.code = value.replace(/\D/g, "");
    };

    // 发送验证码
    const sendVerificationCode = async () => {
      if (!canSendCode.value) {
        ElMessage.warning("请输入正确的手机号");
        return;
      }

      try {
        sendingCode.value = true;

        await userStore.sendVerificationCode(loginForm.phone, "login");

        ElMessage.success("验证码已发送，请查看控制台输出");

        // 开始倒计时
        startCountdown(60);
      } catch (error) {
        console.error("发送验证码失败:", error);
        ElMessage.error(error.message || "验证码发送失败，请重试");
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

        const user = await userStore.login(loginForm.phone, loginForm.code);

        ElNotification({
          title: "登录成功",
          message: `欢迎回来，${user.nickname || "用户"}！`,
          type: "success",
          duration: 3000,
        });

        const redirectPath =
          userStore.getAndClearRedirectPath() ||
          route.query.redirect ||
          "/personal";

        await router.push(redirectPath);
      } catch (error) {
        console.error("登录失败:", error);
        ElMessage.error(error.message || "登录失败，请检查手机号和验证码");
      } finally {
        loggingIn.value = false;
      }
    };

    // 微信登录
    const handleWechatLogin = () => {
      ElMessage.info("微信登录功能开发中，敬请期待！");
    };

    // QQ登录
    const handleQQLogin = () => {
      ElMessage.info("QQ登录功能开发中，敬请期待！");
    };

    // 跳转注册
    const goToRegister = () => {
      router.push("/register");
    };

    // 组件挂载
    onMounted(() => {
      if (userStore.isLoggedIn) {
        router.push("/personal");
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
      handlePhoneInput,
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
/* 统一的页面布局 - 与Personal.vue保持一致 */
.login-page {
  position: fixed !important;
  top: 64px !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: calc(100vh - 64px) !important;
  margin: 0 !important;
  padding: 0 !important;
  background: #f5f7fa !important;
  overflow-y: auto !important;
  z-index: 1 !important;
  display: flex !important;
}

/* 重置可能影响布局的样式 */
.login-page * {
  box-sizing: border-box !important;
}

/* ========== 左侧品牌展示区 ========== */
.login-brand {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-content {
  color: white;
  width: 100%;
  max-width: 600px;
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
  flex: 0 0 600px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
}

.form-container {
  width: 100%;
  max-width: 380px;
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
  border-radius: 8px;
  padding: 0 16px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
  height: 48px;
}

.form-input :deep(.el-input__wrapper:hover) {
  border-color: #c0c4cc;
}

.form-input :deep(.el-input.is-focus .el-input__wrapper) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
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
  height: 48px;
  border-radius: 8px;
  font-size: 13px;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  margin-top: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
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
  width: 44px;
  height: 44px;
  transition: all 0.3s ease;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
</style>
