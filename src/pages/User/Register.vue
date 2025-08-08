<template>
  <div class="register-page">
    <!-- 左侧品牌展示区 -->
    <div class="register-brand">
      <div class="brand-content">
        <!-- Logo和品牌名 -->
        <div class="brand-header">
          <div class="brand-logo">
            <el-icon size="60" color="#ffffff">
              <MapLocation />
            </el-icon>
          </div>
          <h1 class="brand-title">GoingTour</h1>
          <p class="brand-subtitle">{{ t('brand.tagline') }}</p>
        </div>

        <!-- 注册页面特有的展示内容 -->
        <div class="features">
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon size="32" color="#ffffff">
                <UserFilled />
              </el-icon>
            </div>
            <div class="feature-text">
              <h3>{{ t('auth.register') }}</h3>
              <p>{{ t('personal.createTripDesc') }}</p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <el-icon size="32" color="#ffffff">
                <Setting />
              </el-icon>
            </div>
            <div class="feature-text">
              <h3>{{ t('settings.preferences') }}</h3>
              <p>{{ t('personal.preferencesDesc') }}</p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <el-icon size="32" color="#ffffff">
                <Star />
              </el-icon>
            </div>
            <div class="feature-text">
              <h3>{{ t('brand.features.smartPlanning.title') }}</h3>
              <p>{{ t('brand.features.smartPlanning.desc') }}</p>
            </div>
          </div>
        </div>

        <!-- 底部装饰 -->
        <div class="brand-footer">
          <p>&copy; 2024 GoingTour. {{ t('brand.copyright') }}</p>
        </div>
      </div>
    </div>

    <!-- 右侧注册表单区 -->
    <div class="register-form-section">
      <div class="form-container">
        <!-- 表单头部 -->
        <div class="form-header">
          <h2 class="form-title">{{ t('auth.register') }}</h2>
          <p class="form-subtitle">{{ t('brand.tagline') }}</p>
        </div>

        <!-- 注册表单 -->
        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          class="register-form"
          size="large"
          @submit.prevent="handleRegister"
        >
          <!-- 邮箱输入 -->
          <el-form-item prop="email" class="form-item">
            <label class="form-label">{{ t('auth.email') }}</label>
            <el-input
              v-model="registerForm.email"
              :placeholder="t('auth.email')"
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
          <el-form-item prop="code" class="form-item code-form-item">
            <label class="form-label">{{ t('auth.verificationCode') }}</label>
            <div class="code-input-group">
              <el-input
                v-model="registerForm.code"
                :placeholder="t('auth.verificationCode')"
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
                {{ countdown > 0 ? t('auth.resendIn', { s: countdown }) : t('auth.sendCode') }}
              </el-button>
            </div>
          </el-form-item>

          <!-- 昵称输入（可选） -->
          <el-form-item prop="nickname" class="form-item">
            <label class="form-label">{{ t('auth.nickname') }} <span class="optional">({{ t('common.optional') }})</span></label>
            <el-input
              v-model="registerForm.nickname"
              :placeholder="t('auth.nickname')"
              clearable
              maxlength="20"
              class="form-input"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 用户协议确认 -->
          <el-form-item prop="agreement" class="form-item agreement-item">
            <el-checkbox
              v-model="registerForm.agreement"
              class="agreement-checkbox"
            >
              {{ t('common.info') }}
              <el-link
                type="primary"
                :underline="false"
                @click="showUserAgreement"
              >
                {{ t('auth.userAgreement') }}
              </el-link>
              和
              <el-link
                type="primary"
                :underline="false"
                @click="showPrivacyPolicy"
              >
                {{ t('auth.privacyPolicy') }}
              </el-link>
            </el-checkbox>
          </el-form-item>

          <!-- 注册按钮 -->
          <el-form-item class="form-item">
            <el-button
              type="primary"
              :loading="registering"
              class="register-btn"
              size="large"
              @click="handleRegister"
            >
              <el-icon v-if="!registering">
                <UserFilled />
              </el-icon>
              {{ registering ? t('auth.registering') : t('auth.register') }}
            </el-button>
          </el-form-item>

          <!-- 其他注册方式 -->
          <div class="other-register">
            <el-divider>
              <span class="divider-text">{{ t('auth.otherRegisterMethods') }}</span>
            </el-divider>

            <div class="social-register">
              <el-button
                class="social-btn wechat-btn"
                size="large"
                circle
                @click="handleWechatRegister"
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
                @click="handleQQRegister"
              >
                <el-icon size="20">
                  <User />
                </el-icon>
              </el-button>
            </div>
          </div>

          <!-- 登录链接 -->
          <div class="login-section">
            <span class="login-text">{{ t('auth.hasAccount') }}</span>
            <el-link
              type="primary"
              :underline="false"
              class="login-link"
              @click="goToLogin"
            >
              {{ t('auth.goToLogin') }}
            </el-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import { useI18n } from "@/utils/i18n.js";
import { ElMessage, ElNotification, ElMessageBox } from "element-plus";
import {
  MapLocation,
  UserFilled,
  Setting,
  Star,
  Message,
  Key,
  User,
  ChatDotRound,
} from "@element-plus/icons-vue";

export default {
  name: "Register",
  components: {
    MapLocation,
    UserFilled,
    Setting,
    Star,
    Message,
    Key,
    User,
    ChatDotRound,
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const { t } = useI18n();

    // 表单引用
    const registerFormRef = ref();

    // 注册表单数据
    const registerForm = reactive({
      email: "",
      code: "",
      nickname: "",
      agreement: false,
    });

    // 状态管理
    const sendingCode = ref(false);
    const registering = ref(false);
    const countdown = ref(0);
    let countdownTimer = null;

    // 表单验证规则
    const registerRules = {
      email: [
        { required: true, message: "请输入邮箱地址", trigger: "blur" },
        {
          type: "email",
          message: "请输入正确的邮箱格式",
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
      nickname: [
        {
          min: 2,
          max: 20,
          message: "昵称长度应该在2-20个字符之间",
          trigger: "blur",
        },
      ],
      agreement: [
        {
          validator: (rule, value, callback) => {
            if (!value) {
              callback(new Error("请先同意用户协议和隐私政策"));
            } else {
              callback();
            }
          },
          trigger: "change",
        },
      ],
    };

    // 计算属性
    const canSendCode = computed(() => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(registerForm.email);
    });

    // 输入处理
    const handleEmailInput = (value) => {
      registerForm.email = value.trim().toLowerCase();
    };

    const handleCodeInput = (value) => {
      registerForm.code = value.replace(/\D/g, "");
    };

    // 发送验证码
    const sendVerificationCode = async () => {
      if (!canSendCode.value) {
        ElMessage.warning(t('validation.email'));
        return;
      }

      try {
        sendingCode.value = true;

        await userStore.sendVerificationCode(registerForm.email, "register");

        ElMessage.success(t('auth.codeResent'));

        // 开始倒计时
        startCountdown(60);
      } catch (error) {
        ElMessage.error(error.message || t('messages.operationFailed'));
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

    // 注册处理
    const handleRegister = async () => {
      if (!registerFormRef.value) return;

      try {
        await registerFormRef.value.validate();

        registering.value = true;

        const user = await userStore.register(
          registerForm.email,
          registerForm.code,
          registerForm.nickname || undefined
        );

        ElNotification({
          title: t('auth.registerSuccess'),
          message: t('auth.welcomeBack', { name: user.nickname }),
          type: "success",
          duration: 3000,
        });
        ElMessage.success(t('auth.registerSuccess'));

        // 注册成功后自动登录并跳转
        setTimeout(() => {
          router.push("/personal");
        }, 1500);
      } catch (error) {
        console.error("注册失败:", error);
        ElMessage.error(error.message || "注册失败，请检查信息后重试");
      } finally {
        registering.value = false;
      }
    };

    // 显示用户协议
    const showUserAgreement = () => {
      ElMessageBox.alert(
        `
        <h3>用户协议</h3>
        <p>1. 用户须遵守相关法律法规</p>
        <p>2. 禁止发布违法有害信息</p>
        <p>3. 尊重他人权益和隐私</p>
        <p>4. 合理使用平台服务</p>
        <p>5. 保护账号安全</p>
        <br>
        <p><small>完整协议内容请访问官网查看</small></p>
      `,
        "用户协议",
        {
          confirmButtonText: "我知道了",
          dangerouslyUseHTMLString: true,
        }
      );
    };

    // 显示隐私政策
    const showPrivacyPolicy = () => {
      ElMessageBox.alert(
        `
        <h3>隐私政策</h3>
        <p>1. 我们重视您的隐私保护</p>
        <p>2. 仅收集必要的个人信息</p>
        <p>3. 不会向第三方泄露您的信息</p>
        <p>4. 采用加密技术保护数据安全</p>
        <p>5. 您有权删除个人数据</p>
        <br>
        <p><small>完整政策内容请访问官网查看</small></p>
      `,
        "隐私政策",
        {
          confirmButtonText: "我知道了",
          dangerouslyUseHTMLString: true,
        }
      );
    };

    // 微信注册
    const handleWechatRegister = () => {
      ElMessage.info("微信注册功能开发中，敬请期待！");
    };

    // QQ注册
    const handleQQRegister = () => {
      ElMessage.info("QQ注册功能开发中，敬请期待！");
    };

    // 跳转登录
    const goToLogin = () => {
      router.push("/login");
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
      registerFormRef,
      registerForm,
      registerRules,
      sendingCode,
      registering,
      countdown,
      canSendCode,
      handleEmailInput,
      handleCodeInput,
      sendVerificationCode,
      handleRegister,
      showUserAgreement,
      showPrivacyPolicy,
      handleWechatRegister,
      handleQQRegister,
      goToLogin,
    };
  },
};
</script>

<style scoped>

.register-page {
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

.register-page * {
  box-sizing: border-box !important;
}

/* ========== 左侧品牌展示区 ========== */
.register-brand {
  flex: 0 0 35%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.register-brand::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
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
  margin-bottom: 50px;
}

.brand-logo {
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
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
  text-align: left;
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
  text-align: left;
}

.feature-text p {
  font-size: 14px;
  margin: 0;
  opacity: 0.8;
  line-height: 1.5;
  text-align: left;
}

.brand-footer {
  text-align: center;
  opacity: 0.7;
  font-size: 14px;
  margin-top: 20px;
}

.brand-footer p {
  margin: 0;
}

/* ========== 右侧注册表单区 ========== */
.register-form-section {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
  position: relative;
  margin-top: 60px;
}

.form-container {
  width: 100%;
  max-width: 380px;
  position: relative;
  z-index: 2;
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

}

.form-title {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 0px 0;
}

.form-subtitle {
  font-size: 16px;
  color: #909399;
  margin: 0;
  line-height: 1.5;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #606266;

}

.optional {
  color: #c0c4cc;
  font-weight: 400;
  font-size: 12px;
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
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1), 0 4px 16px rgba(102, 126, 234, 0.15);
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
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background:#0070f8;
  border: none;
  color: white;
}


.send-code-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  
}

.agreement-item {

}

.agreement-checkbox {
  width: 100%;
  text-align: left;
}

.agreement-checkbox :deep(.el-checkbox__label) {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

.register-btn {
  width: 100%;
  height: 56px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.register-btn::before {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.register-btn:hover::before {
  left: 100%;
}

.register-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

.register-btn:active {
  transform: translateY(-1px);
  transition: all 0.1s;
}

.other-register {
  margin: 32px 0;
}

.divider-text {
  color: #909399;
  font-size: 13px;
  padding: 0 16px;
}

.social-register {
  display: flex;
  justify-content: center;
  gap: 16px;
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
  content: '';
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

.login-section {
  text-align: center;
  margin: 22px 0;
}

.login-text {
  color: #909399;
  font-size: 14px;
}

.login-link {
  margin-left: 6px;
  font-weight: 500;
  font-size: 14px;
}

/* ========== 动画定义 ========== */
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

/* ========== 响应式设计 ========== */
@media (max-width: 1200px) {
  .register-brand {
    padding: 30px;
  }
  
  .brand-title {
    font-size: 48px;
  }
  
  .register-form-section {
    flex: 0 0 500px;
  }
}

@media (max-width: 1024px) {
  .register-page {
    flex-direction: column;
    height: auto;
    min-height: calc(100vh - 64px);
  }
  
  .register-brand {
    flex: 0 0 35vh;
    min-height: 280px;
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
  
  .register-form-section {
    flex: 1;
    min-height: 65vh;
    box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.1);
  }
}

@media (max-width: 768px) {
  .register-brand {
    flex: 0 0 25vh;
    min-height: 200px;
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
  
  .agreement-checkbox :deep(.el-checkbox__label) {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .register-page {
    top: 0 !important;
    height: 100vh !important;
  }
  
  .register-brand {
    flex: 0 0 20vh;
    min-height: 150px;
    padding: 10px;
  }
  
  .brand-header {
    margin-bottom: 15px;
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
  
  .social-register {
    gap: 12px;
  }
  
  .social-btn {
    width: 44px;
    height: 44px;
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
  
  .register-btn {
    border: 2px solid #333;
  }
}
</style>
