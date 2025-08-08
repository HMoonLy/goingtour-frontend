<template>
  <div class="account-settings-page">
    <div class="settings-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">{{ t('settings.accountSettings') }}</h1>
          <p class="page-subtitle">{{ t('brand.tagline') }}</p>
        </div>
        <el-button @click="goBack" plain>
          <el-icon><ArrowLeft /></el-icon>
          {{ t('common.back') }}
        </el-button>
      </div>

      <!-- 设置选项卡 -->
      <el-tabs v-model="activeTab" class="settings-tabs">
        <!-- 个人信息 -->
        <el-tab-pane :label="t('settings.profileSettings')" name="profile">
          <div class="tab-content">
            <div class="setting-section">
              <h3 class="section-title">{{ t('settings.profileSettings') }}</h3>
              
              <!-- 头像设置 -->
              <div class="setting-item">
                <div class="item-label">
                  <span class="label-text">{{ t('settings.avatar') }}</span>
                  <span class="label-desc">{{ t('common.edit') }}</span>
                </div>
                <div class="item-control">
                  <AvatarUploader
                    :avatar="profileForm.avatar"
                    :userName="profileForm.nickname"
                    @update:avatar="handleAvatarChange"
                    size="large"
                  />
                </div>
              </div>

              <!-- 昵称设置 -->
              <div class="setting-item">
                <div class="item-label">
                  <span class="label-text">{{ t('settings.nickname') }}</span>
                  <span class="label-desc">{{ t('common.optional') }}</span>
                </div>
                <div class="item-control">
                  <el-input
                    v-model="profileForm.nickname"
                    :placeholder="t('settings.nickname')"
                    maxlength="20"
                    show-word-limit
                    :disabled="profileLoading"
                  />
                  <el-button
                    type="primary"
                    :loading="profileLoading"
                    @click="updateProfile"
                    :disabled="!isProfileChanged"
                  >
                    {{ t('common.save') }}
                  </el-button>
                </div>
              </div>

              <!-- 邮箱显示 -->
              <div class="setting-item">
                <div class="item-label">
                  <span class="label-text">{{ t('settings.email') }}</span>
                  <span class="label-desc">{{ t('common.info') }}</span>
                </div>
                <div class="item-control">
                  <el-input
                    :value="userInfo.email"
                    readonly
                    disabled
                  />
                   <el-tag type="info" size="small">{{ t('common.info') }}</el-tag>
                </div>
              </div>

              <!-- 注册时间 -->
              <div class="setting-item">
                <div class="item-label">
                  <span class="label-text">{{ t('settings.joinDate') }}</span>
                  <span class="label-desc">{{ t('common.info') }}</span>
                </div>
                <div class="item-control">
                  <span class="info-text">{{ formatJoinDate(userInfo.createTime) }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 安全设置 -->
        <el-tab-pane :label="t('settings.securitySettings')" name="security">
          <div class="tab-content">
            <div class="setting-section">
              <h3 class="section-title">{{ t('settings.securitySettings') }}</h3>
              
              <!-- 邮箱验证登录 -->
              <div class="setting-item">
                <div class="item-label">
                  <span class="label-text">{{ t('settings.emailLogin') }}</span>
                  <span class="label-desc">{{ t('common.info') }}</span>
                </div>
                <div class="item-control">
                   <el-tag type="success" size="small">{{ t('common.success') }}</el-tag>
                   <el-button plain size="small" @click="testEmailVerification">
                    {{ t('common.submit') }}
                   </el-button>
                </div>
              </div>

              <!-- 密码登录（可选） -->
              <div class="setting-item">
                <div class="item-label">
                  <span class="label-text">密码登录</span>
                  <span class="label-desc">可选的备用登录方式</span>
                </div>
                <div class="item-control">
                  <el-tag v-if="hasPassword" type="primary" size="small">已设置</el-tag>
                  <el-tag v-else type="info" size="small">未设置</el-tag>
                  
                  <el-button 
                    v-if="!hasPassword" 
                    type="primary" 
                    size="small" 
                    @click="showSetPasswordDialog = true"
                  >
                    设置密码
                  </el-button>
                  
                  <template v-else>
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="showChangePasswordDialog = true"
                    >
                      修改密码
                    </el-button>
                    <el-button 
                      type="danger" 
                      plain 
                      size="small" 
                      @click="clearPassword"
                    >
                      清除密码
                    </el-button>
                  </template>
                </div>
              </div>

              <!-- 登录记录 -->
              <div class="setting-item">
                <div class="item-label">
                  <span class="label-text">登录记录</span>
                  <span class="label-desc">查看最近的登录活动</span>
                </div>
                <div class="item-control">
                  <el-button plain @click="showLoginHistory">
                    查看记录
                  </el-button>
                </div>
              </div>
            </div>

            <div class="setting-section danger-section">
              <h3 class="section-title">危险操作</h3>
              
              <!-- 注销账户 -->
              <div class="setting-item">
                <div class="item-label">
                  <span class="label-text">注销账户</span>
                  <span class="label-desc">永久删除您的账户和所有数据</span>
                </div>
                <div class="item-control">
                  <el-button type="danger" plain @click="showDeleteAccountDialog = true">
                    注销账户
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 隐私设置 -->
        <el-tab-pane :label="t('settings.privacySettings')" name="privacy">
          <div class="tab-content">
            <div class="setting-section">
              <h3 class="section-title">{{ t('settings.privacySettings') }}</h3>
              
              <!-- 数据导出 -->
              <div class="setting-item">
                <div class="item-label">
                  <span class="label-text">{{ t('settings.exportData') }}</span>
                  <span class="label-desc">{{ t('common.info') }}</span>
                </div>
                <div class="item-control">
                  <el-button type="primary" @click="exportUserData" :loading="exportLoading">
                    {{ t('settings.exportData') }}
                  </el-button>
                </div>
              </div>

              <!-- 数据清理 -->
              <div class="setting-item">
                <div class="item-label">
                  <span class="label-text">{{ t('common.delete') }}</span>
                  <span class="label-desc">{{ t('common.warning') }}</span>
                </div>
                <div class="item-control">
                  <el-button plain @click="clearUserData">
                    {{ t('common.delete') }}
                  </el-button>
                </div>
              </div>
            </div>

            <div class="setting-section">
              <h3 class="section-title">隐私选项</h3>
              
              <!-- 个人资料可见性 -->
              <div class="setting-item">
                <div class="item-label">
                  <span class="label-text">个人资料</span>
                  <span class="label-desc">设置个人资料的可见性</span>
                </div>
                <div class="item-control">
                  <el-radio-group v-model="privacySettings.profileVisibility" @change="updatePrivacySettings">
                    <el-radio value="public">公开</el-radio>
                    <el-radio value="private">私有</el-radio>
                  </el-radio-group>
                </div>
              </div>

              <!-- 行程分享 -->
              <div class="setting-item">
                <div class="item-label">
                  <span class="label-text">行程分享</span>
                  <span class="label-desc">允许其他用户查看您的公开行程</span>
                </div>
                <div class="item-control">
                  <el-switch 
                    v-model="privacySettings.allowTripSharing"
                    @change="updatePrivacySettings"
                  />
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 系统设置 -->
        <el-tab-pane :label="t('settings.systemSettings')" name="system">
          <div class="tab-content">
            <div class="setting-section">
              <h3 class="section-title">{{ t('settings.systemSettings') }}</h3>
              
              <!-- 主题设置 -->
              <div class="setting-item">
                <div class="item-label">
                  <span class="label-text">{{ t('settings.theme') }}</span>
                  <span class="label-desc">{{ t('common.optional') }}</span>
                </div>
                <div class="item-control">
                  <el-radio-group v-model="selectedTheme" @change="handleThemeChange">
                    <el-radio 
                      v-for="(option, key) in themeOptions" 
                      :key="key"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </el-radio>
                  </el-radio-group>
                </div>
              </div>
            </div>

            <div class="setting-section">
              <h3 class="section-title">通知设置</h3>
              
              <!-- 邮件通知 -->
              <div class="setting-item">
                <div class="item-label">
                  <span class="label-text">邮件通知</span>
                  <span class="label-desc">接收系统邮件通知</span>
                </div>
                <div class="item-control">
                  <el-switch 
                    v-model="notificationSettings.emailNotifications"
                    @change="updateNotificationSettings"
                  />
                </div>
              </div>

              <!-- 行程提醒 -->
              <div class="setting-item">
                <div class="item-label">
                  <span class="label-text">行程提醒</span>
                  <span class="label-desc">行程开始前的提醒通知</span>
                </div>
                <div class="item-control">
                  <el-switch 
                    v-model="notificationSettings.tripReminders"
                    @change="updateNotificationSettings"
                  />
                </div>
              </div>

              <!-- 系统公告 -->
              <div class="setting-item">
                <div class="item-label">
                  <span class="label-text">系统公告</span>
                  <span class="label-desc">接收系统更新和公告</span>
                </div>
                <div class="item-control">
                  <el-switch 
                    v-model="notificationSettings.systemAnnouncements"
                    @change="updateNotificationSettings"
                  />
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 设置密码对话框 -->
    <el-dialog
      v-model="showSetPasswordDialog"
      title="设置密码"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="setPasswordFormRef"
        :model="setPasswordForm"
        :rules="setPasswordRules"
        label-width="80px"
      >
        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="setPasswordForm.password"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="setPasswordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSetPasswordDialog = false">取消</el-button>
          <el-button
            type="primary"
            :loading="passwordLoading"
            @click="setPassword"
          >
            设置密码
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="showChangePasswordDialog"
      title="修改密码"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="changePasswordFormRef"
        :model="changePasswordForm"
        :rules="changePasswordRules"
        label-width="80px"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            v-model="changePasswordForm.currentPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="changePasswordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="changePasswordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showChangePasswordDialog = false">取消</el-button>
          <el-button
            type="primary"
            :loading="passwordLoading"
            @click="changePassword"
          >
            修改密码
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 登录记录对话框 -->
    <el-dialog
      v-model="showLoginHistoryDialog"
      title="登录记录"
      width="80%"
      :close-on-click-modal="false"
    >
      <!-- 统计信息 -->
      <div class="login-stats-summary" v-if="loginStats.totalLogins">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ loginStats.totalLogins || 0 }}</div>
              <div class="stat-label">总登录次数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ loginStats.recentLogins || 0 }}</div>
              <div class="stat-label">近30天登录</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ formatLoginTime(loginStats.lastLoginTime) }}</div>
              <div class="stat-label">最近登录</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ loginStats.lastLoginDevice || '-' }}</div>
              <div class="stat-label">常用设备</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 操作按钮 -->
      <div class="history-actions">
        <el-button type="danger" plain @click="clearLoginHistory">
          {{ t('settings.clearAllRecords') }}
        </el-button>
      </div>

      <!-- 登录记录表格 -->
      <el-table 
        :data="loginHistoryData" 
        v-loading="loginHistoryLoading"
        style="width: 100%"
        :empty-text="t('settings.noLoginRecords')"
      >
        <el-table-column prop="loginTime" :label="t('settings.loginTime')" width="160">
          <template #default="{ row }">
            {{ formatLoginTime(row.loginTime) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="status" :label="t('settings.status')" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="loginMethod" :label="t('settings.loginMethod')" width="100">
          <template #default="{ row }">
            {{ row.loginMethod === 'EMAIL_CODE' ? '邮箱验证码' : '密码登录' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="ipAddress" :label="t('settings.ipAddress')" width="140" />
        
        <el-table-column prop="location" :label="t('settings.location')" width="100" />
        
        <el-table-column prop="deviceType" :label="t('settings.deviceType')" width="80" />
        
        <el-table-column prop="browser" :label="t('settings.browser')" width="100" />
        
        <el-table-column prop="operatingSystem" :label="t('settings.operatingSystem')" width="120" />
        
        <el-table-column prop="sessionDuration" :label="t('settings.sessionDuration')" width="100">
          <template #default="{ row }">
            {{ row.sessionDuration ? `${row.sessionDuration}分钟` : '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="failureReason" label="失败原因" min-width="150">
          <template #default="{ row }">
            {{ row.failureReason || '-' }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="history-pagination">
        <el-pagination
          v-model:current-page="historyPagination.page"
          :page-size="historyPagination.size"
          :total="historyPagination.total"
          layout="prev, pager, next, jumper"
          @current-change="handlePageChange"
        />
      </div>
    </el-dialog>

    <!-- 注销账户确认对话框 -->
    <el-dialog
      v-model="showDeleteAccountDialog"
      title="注销账户"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="delete-account-content">
        <el-alert
          title="警告"
          type="error"
          :closable="false"
          show-icon
        >
          <p>注销账户是不可逆的操作，将会：</p>
          <ul>
            <li>永久删除您的所有行程数据</li>
            <li>清除所有个人信息和偏好设置</li>
            <li>无法恢复任何已删除的数据</li>
          </ul>
        </el-alert>
        <div class="confirmation-input">
          <p>请输入您的邮箱地址确认注销：</p>
          <el-input
            v-model="deleteConfirmEmail"
            placeholder="请输入邮箱地址"
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDeleteAccountDialog = false">取消</el-button>
          <el-button
            type="danger"
            :loading="deleteAccountLoading"
            :disabled="deleteConfirmEmail !== userInfo.email"
            @click="deleteAccount"
          >
            确认注销
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from '@/utils/i18n.js'
import { useTheme } from '@/utils/theme.js'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user.js'
import AvatarUploader from '@/components/Common/AvatarUploader.vue'

export default {
  name: 'AccountSettings',
  components: {
    ArrowLeft,
    AvatarUploader
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const { t } = useI18n()
    const { currentTheme, setTheme, themeOptions } = useTheme()

    // 响应式数据
    const activeTab = ref('profile')
    const profileLoading = ref(false)
    const passwordLoading = ref(false)
    const exportLoading = ref(false)
    const deleteAccountLoading = ref(false)

    // 对话框显示状态
    const showSetPasswordDialog = ref(false)
    const showChangePasswordDialog = ref(false)
    const showDeleteAccountDialog = ref(false)
    const deleteConfirmEmail = ref('')

    // 用户信息
    const userInfo = computed(() => userStore.currentUser || {})

    // 个人信息表单
    const profileForm = reactive({
      nickname: '',
      avatar: ''
    })

    // 设置密码表单
    const setPasswordForm = reactive({
      password: '',
      confirmPassword: ''
    })

    // 修改密码表单
    const changePasswordForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    // 表单验证规则
    const setPasswordRules = {
      password: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少6位', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== setPasswordForm.password) {
              callback(new Error('两次输入密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }

    const changePasswordRules = {
      currentPassword: [
        { required: true, message: '请输入当前密码', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少6位', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== changePasswordForm.newPassword) {
              callback(new Error('两次输入密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }

    // 隐私设置
    const privacySettings = reactive({
      profileVisibility: 'public',
      allowTripSharing: true
    })

    // 系统设置
    const systemSettings = reactive({
      language: 'zh-CN',
      theme: 'light'
    })

    // 通知设置
    const notificationSettings = reactive({
      emailNotifications: true,
      tripReminders: true,
      systemAnnouncements: true
    })



    // 计算属性
    const isProfileChanged = computed(() => {
      return (
        profileForm.nickname !== userInfo.value.nickname ||
        profileForm.avatar !== userInfo.value.avatar
      )
    })

    const hasPassword = computed(() => {
      // 这里需要从用户信息中判断是否已设置密码
      // 由于安全原因，后端不会返回实际密码，我们需要添加一个标识字段
      return userInfo.value.hasPassword || false
    })

    const selectedTheme = computed({
      get: () => currentTheme.value,
      set: (value) => setTheme(value)
    })

    // 方法
    const goBack = () => {
      router.back()
    }

    const formatJoinDate = (createTime) => {
      if (!createTime) return '未知'
      const date = new Date(createTime)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const handleAvatarChange = (newAvatar) => {
      profileForm.avatar = newAvatar
    }

    const updateProfile = async () => {
      profileLoading.value = true
      try {
        await userStore.updateUserInfo(profileForm.nickname, profileForm.avatar)
        ElMessage.success('个人信息更新成功')
      } catch (error) {
        ElMessage.error('更新失败，请重试')
      } finally {
        profileLoading.value = false
      }
    }

    const testEmailVerification = async () => {
      try {
        const { userApi } = await import('@/api/user.js')
        await userApi.sendCode({
          email: userInfo.value.email,
          type: 'test'
        })
        ElMessage.success('验证码发送成功，请查看邮箱（开发环境请查看控制台）')
      } catch (error) {
        ElMessage.error('验证码发送失败，请重试')
      }
    }

    const setPassword = async () => {
      passwordLoading.value = true
      try {
        const { userApi } = await import('@/api/user.js')
        await userApi.setPassword(userInfo.value.id, {
          password: setPasswordForm.password,
          confirmPassword: setPasswordForm.confirmPassword
        })
        ElMessage.success('密码设置成功')
        showSetPasswordDialog.value = false
        // 重置表单
        Object.assign(setPasswordForm, {
          password: '',
          confirmPassword: ''
        })
        // 刷新用户信息
        await userStore.fetchUserInfo()
      } catch (error) {
        ElMessage.error(error.message || '密码设置失败，请重试')
      } finally {
        passwordLoading.value = false
      }
    }

    const changePassword = async () => {
      passwordLoading.value = true
      try {
        const { userApi } = await import('@/api/user.js')
        await userApi.changePassword(userInfo.value.id, {
          currentPassword: changePasswordForm.currentPassword,
          newPassword: changePasswordForm.newPassword,
          confirmPassword: changePasswordForm.confirmPassword
        })
        ElMessage.success('密码修改成功')
        showChangePasswordDialog.value = false
        // 重置表单
        Object.assign(changePasswordForm, {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } catch (error) {
        ElMessage.error(error.message || '密码修改失败，请重试')
      } finally {
        passwordLoading.value = false
      }
    }

    const clearPassword = async () => {
      try {
        await ElMessageBox.confirm(
          '清除密码后，您只能使用邮箱验证码登录，确定继续吗？',
          '清除密码',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        const { userApi } = await import('@/api/user.js')
        await userApi.clearPassword(userInfo.value.id)
        ElMessage.success('密码已清除')
        // 刷新用户信息
        await userStore.fetchUserInfo()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('密码清除失败，请重试')
        }
      }
    }

    // 登录记录相关状态
    const showLoginHistoryDialog = ref(false)
    const loginHistoryLoading = ref(false)
    const loginHistoryData = ref([])
    const loginStats = ref({})
    const historyPagination = reactive({
      page: 1,
      size: 10,
      total: 0
    })

    const showLoginHistory = async () => {
      showLoginHistoryDialog.value = true
      await loadLoginHistory()
      await loadLoginStats()
    }

    const loadLoginHistory = async () => {
      try {
        loginHistoryLoading.value = true
        const { userApi } = await import('@/api/user.js')
        const response = await userApi.getLoginHistory(
          userInfo.value.id, 
          historyPagination.page, 
          historyPagination.size
        )
        
        loginHistoryData.value = response.data.records || []
        historyPagination.total = response.data.total || 0
      } catch (error) {
        ElMessage.error('获取登录记录失败')
      } finally {
        loginHistoryLoading.value = false
      }
    }

    const loadLoginStats = async () => {
      try {
        const { userApi } = await import('@/api/user.js')
        const response = await userApi.getLoginStats(userInfo.value.id)
        loginStats.value = response.data || {}
      } catch (error) {
        console.warn('获取登录统计失败:', error)
      }
    }

    const handlePageChange = (page) => {
      historyPagination.page = page
      loadLoginHistory()
    }

    const clearLoginHistory = async () => {
      try {
        await ElMessageBox.confirm(
          '清除登录记录后，您将无法查看历史登录信息，确定继续吗？',
          '清除登录记录',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        const { userApi } = await import('@/api/user.js')
        await userApi.clearLoginHistory(userInfo.value.id)
        ElMessage.success('登录记录已清除')
        
        // 重新加载数据
        await loadLoginHistory()
        await loadLoginStats()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('清除登录记录失败')
        }
      }
    }

    const formatLoginTime = (time) => {
      if (!time) return '-'
      return new Date(time).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getStatusColor = (status) => {
      switch (status) {
        case 'SUCCESS': return 'success'
        case 'FAILED': return 'danger'
        case 'BLOCKED': return 'warning'
        default: return 'info'
      }
    }

    const getStatusText = (status) => {
      switch (status) {
        case 'SUCCESS': return '成功'
        case 'FAILED': return '失败'
        case 'BLOCKED': return '阻止'
        default: return status
      }
    }

    const handleThemeChange = (newTheme) => {
      setTheme(newTheme)
      ElMessage.success(t('messages.updateSuccess'))
    }

    const exportUserData = async () => {
      exportLoading.value = true
      try {
        const { userApi } = await import('@/api/user.js')
        const response = await userApi.exportUserData(userInfo.value.id)
        
        // 创建下载链接
        const dataStr = JSON.stringify(response.data, null, 2)
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
        
        const exportFileName = `goingtour_user_data_${userInfo.value.id}_${new Date().toISOString().split('T')[0]}.json`
        
        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileName)
        linkElement.click()
        
        ElMessage.success('数据导出完成，请检查下载文件')
      } catch (error) {
        ElMessage.error(error.message || '导出失败，请重试')
      } finally {
        exportLoading.value = false
      }
    }

    const clearUserData = async () => {
      try {
        await ElMessageBox.confirm(
          '这将清理浏览器缓存和临时数据，确定继续吗？',
          '清理数据',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        // 清理localStorage
        const keysToKeep = ['access_token', 'refresh_token', 'token_expiry', 'user_info']
        const keysToRemove = []
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (!keysToKeep.includes(key)) {
            keysToRemove.push(key)
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key))
        
        ElMessage.success('缓存清理完成')
      } catch (error) {
        // 用户取消操作
      }
    }

    const updatePrivacySettings = () => {
      // TODO: 保存隐私设置到后端
      ElMessage.success('隐私设置已更新')
    }

    const updateSystemSettings = () => {
      // TODO: 保存系统设置到后端
      ElMessage.success('系统设置已更新')
    }

    const updateNotificationSettings = () => {
      // TODO: 保存通知设置到后端
      ElMessage.success('通知设置已更新')
    }

    const deleteAccount = async () => {
      deleteAccountLoading.value = true
      try {
        const { userApi } = await import('@/api/user.js')
        await userApi.deleteAccount(userInfo.value.id, {
          email: deleteConfirmEmail.value,
          confirmText: 'DELETE'
        })
        ElMessage.success('账户注销成功')
        userStore.logout()
        router.push('/login')
      } catch (error) {
        ElMessage.error(error.message || '注销失败，请重试')
      } finally {
        deleteAccountLoading.value = false
      }
    }

    // 初始化数据
    const initializeData = () => {
      // 初始化个人信息表单
      if (userInfo.value.nickname) {
        profileForm.nickname = userInfo.value.nickname
      }
      if (userInfo.value.avatar) {
        profileForm.avatar = userInfo.value.avatar
      }

      // 从localStorage加载设置
      const savedPrivacySettings = localStorage.getItem('privacy_settings')
      if (savedPrivacySettings) {
        Object.assign(privacySettings, JSON.parse(savedPrivacySettings))
      }

      const savedSystemSettings = localStorage.getItem('system_settings')
      if (savedSystemSettings) {
        Object.assign(systemSettings, JSON.parse(savedSystemSettings))
      }

      const savedNotificationSettings = localStorage.getItem('notification_settings')
      if (savedNotificationSettings) {
        Object.assign(notificationSettings, JSON.parse(savedNotificationSettings))
      }
    }

    onMounted(() => {
      initializeData()
    })

    return {
      activeTab,
      profileLoading,
      passwordLoading,
      exportLoading,
      deleteAccountLoading,
      showSetPasswordDialog,
      showChangePasswordDialog,
      showDeleteAccountDialog,
      showLoginHistoryDialog,
      deleteConfirmEmail,
      loginHistoryLoading,
      loginHistoryData,
      loginStats,
      historyPagination,
      userInfo,
      profileForm,
      setPasswordForm,
      changePasswordForm,
      setPasswordRules,
      changePasswordRules,
      privacySettings,
      systemSettings,
      notificationSettings,
      isProfileChanged,
      hasPassword,
      selectedTheme,
      themeOptions,
      t,
      goBack,
      formatJoinDate,
      handleAvatarChange,
      updateProfile,
      testEmailVerification,
      setPassword,
      changePassword,
      clearPassword,
      showLoginHistory,
      loadLoginHistory,
      loadLoginStats,
      handlePageChange,
      clearLoginHistory,
      formatLoginTime,
      getStatusColor,
      getStatusText,
      handleThemeChange,
      exportUserData,
      clearUserData,
      updatePrivacySettings,
      updateSystemSettings,
      updateNotificationSettings,
      deleteAccount
    }
  }
}
</script>

<style scoped>
.account-settings-page {
  position: fixed !important;
  top: 64px !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: calc(100vh - 64px) !important;
  margin: 0 !important;
  padding: 20px !important;
  background: var(--bg-color) !important;
  overflow-y: auto !important;
  z-index: 1 !important;
}

.settings-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-content p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

/* 设置选项卡 */
.settings-tabs {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.settings-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 24px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.settings-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0;
}

.settings-tabs :deep(.el-tabs__item) {
  font-weight: 500;
  color: var(--text-secondary);
}

.settings-tabs :deep(.el-tabs__item.is-active) {
  color: var(--primary-color);
  font-weight: 600;
}

.tab-content {
  padding: 24px;
}

/* 设置区块 */
.setting-section {
  margin-bottom: 32px;
}

.setting-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.danger-section .section-title {
  color: #f56c6c;
  border-bottom-color: #fed0d0;
}

/* 设置项 */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.setting-item:last-child {
  border-bottom: none;
}

.item-label {
  flex: 1;
  margin-right: 20px;
}

.label-text {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.label-desc {
  display: block;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.item-controltext{
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  width: 100px;
}
.item-control {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.info-text {
  color: var(--text-secondary);
  font-size: 14px;
}

/* 对话框样式 */
.delete-account-content {
  padding: 8px 0;
}

.delete-account-content .el-alert {
  margin-bottom: 20px;
}

.delete-account-content ul {
  margin: 8px 0 0 20px;
  padding: 0;
}

.delete-account-content li {
  margin-bottom: 4px;
  color: #f56c6c;
}

.confirmation-input {
  margin-top: 16px;
}

.confirmation-input p {
  margin-bottom: 12px;
  color: #606266;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .account-settings-page {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    text-align: center;
  }

  .tab-content {
    padding: 16px;
  }

  .setting-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px 0;
  }

  .item-label {
    margin-right: 0;
  }

  .item-control {
    justify-content: stretch;
  }

  .item-control .el-input {
    flex: 1;
  }

  .section-title {
    font-size: 16px;
  }

  .label-text {
    font-size: 14px;
  }

  .label-desc {
    font-size: 13px;
  }
}

/* 登录记录对话框样式 */
.login-stats-summary {
  margin-bottom: 20px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.history-actions {
  margin-bottom: 16px;
  text-align: right;
}

.history-pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
