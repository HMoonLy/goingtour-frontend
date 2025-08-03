<template>
  <div class="register-page">
    <!-- 左侧品牌展示区 -->
    <div class="register-brand">
      <div class="brand-content">
        <!-- Logo和品牌名 -->
        <div class="brand-header">
          <div class="brand-logo">
            <el-icon size="60"
color="#ffffff">
              <MapLocation />
            </el-icon>
          </div>
          <h1 class="brand-title">GoingTour</h1>
          <p class="brand-subtitle">个性化旅行规划助手</p>
        </div>

        <!-- 注册页面特有的展示内容 -->
        <div class="features">
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon size="32"
color="#ffffff">
                <UserFilled />
              </el-icon>
            </div>
            <div class="feature-text">
              <h3>免费注册</h3>
              <p>仅需手机号，即可开启专属旅行规划</p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <el-icon size="32"
color="#ffffff">
                <Setting />
              </el-icon>
            </div>
            <div class="feature-text">
              <h3>个性化设置</h3>
              <p>根据您的偏好，定制专属旅行体验</p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <el-icon size="32"
color="#ffffff">
                <Star />
              </el-icon>
            </div>
            <div class="feature-text">
              <h3>智能推荐</h3>
              <p>AI算法为您匹配最合适的旅行路线</p>
            </div>
          </div>
        </div>

        <!-- 底部装饰 -->
        <div class="brand-footer">
          <p>&copy; 2024 GoingTour. 开启你的专属旅行之旅</p>
        </div>
      </div>
    </div>

    <!-- 右侧注册表单区 -->
    <div class="register-form-section">
      <div class="form-container">
        <!-- 表单头部 -->
        <div class="form-header">
          <h2 class="form-title">创建账号</h2>
          <p class="form-subtitle">加入GoingTour，开启你的个性化旅行规划</p>
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
          <!-- 手机号输入 -->
          <el-form-item prop="phone"
class="form-item">
            <label class="form-label">手机号</label>
            <el-input
              v-model="registerForm.phone"
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
          <el-form-item prop="code"
class="form-item code-form-item">
            <label class="form-label">验证码</label>
            <div class="code-input-group">
              <el-input
                v-model="registerForm.code"
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

          <!-- 昵称输入（可选） -->
          <el-form-item prop="nickname"
class="form-item">
            <label class="form-label">昵称 <span class="optional">(可选)</span></label>
            <el-input
              v-model="registerForm.nickname"
              placeholder="请输入昵称，不填写将自动生成"
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
          <el-form-item prop="agreement"
class="form-item agreement-item">
            <el-checkbox
              v-model="registerForm.agreement"
              class="agreement-checkbox"
            >
              我已阅读并同意
              <el-link
                type="primary"
                :underline="false"
                @click="showUserAgreement"
              >
                《用户协议》
              </el-link>
              和
              <el-link
                type="primary"
                :underline="false"
                @click="showPrivacyPolicy"
              >
                《隐私政策》
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
              {{ registering ? "注册中..." : "立即注册" }}
            </el-button>
          </el-form-item>

          <!-- 其他注册方式 -->
          <div class="other-register">
            <el-divider>
              <span class="divider-text">其他注册方式</span>
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
            <span class="login-text">已有账号？</span>
            <el-link
              type="primary"
              :underline="false"
              class="login-link"
              @click="goToLogin"
            >
              立即登录
            </el-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/store/user";
import { ElMessage, ElNotification, ElMessageBox } from "element-plus";
import {
  MapLocation,
  UserFilled,
  Setting,
  Star,
  Phone,
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
    const registerFormRef = ref();

    // 注册表单数据
    const registerForm = reactive({
      phone: "",
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
      return /^1[3-9]\d{9}$/.test(registerForm.phone);
    });

    // 输入处理
    const handlePhoneInput = (value) => {
      registerForm.phone = value.replace(/\D/g, "");
    };

    const handleCodeInput = (value) => {
      registerForm.code = value.replace(/\D/g, "");
    };

    // 发送验证码
    const sendVerificationCode = async () => {
      if (!canSendCode.value) {
        ElMessage.warning("请输入正确的手机号");
        return;
      }

      try {
        sendingCode.value = true;

        await userStore.sendVerificationCode(registerForm.phone, "register");

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

    // 注册处理
    const handleRegister = async () => {
      if (!registerFormRef.value) return;

      try {
        await registerFormRef.value.validate();

        registering.value = true;

        const user = await userStore.register(
          registerForm.phone,
          registerForm.code,
          registerForm.nickname || undefined,
        );

        ElNotification({
          title: "注册成功",
          message: `欢迎加入GoingTour，${user.nickname}！`,
          type: "success",
          duration: 3000,
        });

        ElMessage.success("注册成功，正在为您跳转...");

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
        },
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
        },
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
      handlePhoneInput,
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
/* 统一的页面布局 - 与Personal.vue保持一致 */
.register-page {
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
.register-page * {
  box-sizing: border-box !important;
}

/* ========== 左侧品牌展示区 ========== */
.register-brand {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-content {
  color: white;
  width: 100%;
  max-width: 500px;
}

.brand-header {
  text-align: center;
  margin-bottom: 40px;
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
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 12px 0;
  letter-spacing: 2px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.brand-subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

.features {
  margin-bottom: 30px;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  text-align: left;
}

.feature-item:hover {
  transform: translateX(10px);
  background: rgba(255, 255, 255, 0.2);
}

.feature-icon {
  margin-right: 16px;
  flex-shrink: 0;
}

.feature-text h3 {
  font-size: 16px;
  margin: 0 0 6px 0;
  font-weight: 600;
  text-align: left;
}

.feature-text p {
  font-size: 13px;
  margin: 0;
  opacity: 0.85;
  line-height: 1.4;
  text-align: left;
}

.brand-footer {
  text-align: center;
  opacity: 0.7;
  font-size: 12px;
  margin-top: 20px;
}

.brand-footer p {
  margin: 0;
}

/* ========== 右侧注册表单区 ========== */
.register-form-section {
  flex: 0 0 540px;
  background: white;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 60px 30px 40px 30px;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
}

.form-container {
  width: 100%;
  max-width: 400px;
  margin-top: 60px;
}

.form-header {
  text-align: center;
  margin-bottom: 35px;
}

.form-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 10px 0;
}

.form-subtitle {
  font-size: 15px;
  color: #909399;
  margin: 0;
  line-height: 1.4;
}

.form-item {
  margin-bottom: 25px;
}

.code-form-item {
  margin-bottom: 28px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.optional {
  color: #c0c4cc;
  font-weight: 400;
  font-size: 12px;
}

.form-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  padding: 0 16px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
  height: 46px;
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
  gap: 16px;
  align-items: flex-end;
}

.code-input-group .form-input {
  flex: 1;
}

.send-code-btn {
  flex-shrink: 0;
  width: 120px;
  height: 46px;
  border-radius: 8px;
  font-size: 13px;
  white-space: nowrap;
}

.agreement-item {
  margin-bottom: 28px;
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
  height: 46px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  margin-top: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.other-register {
  margin: 28px 0;
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
  margin-top: 18px;
}

.social-btn {
  width: 42px;
  height: 42px;
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
</style>
