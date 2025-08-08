export default {
    // 通用
    common: {
        confirm: '确认',
        cancel: '取消',
        save: '保存',
        delete: '删除',
        edit: '编辑',
        add: '添加',
        search: '搜索',
        loading: '加载中...',
        success: '成功',
        error: '错误',
        warning: '警告',
        info: '信息',
        back: '返回',
        next: '下一步',
        previous: '上一步',
        submit: '提交',
        reset: '重置',
        close: '关闭',
        yes: '是',
        no: '否',
        required: '必填',
        optional: '可选'
    },

    // 导航和菜单
    nav: {
        home: '首页',
        trips: '行程',
        discover: '发现',
        profile: '个人中心',
        settings: '设置',
        logout: '退出登录'
    },

    // 用户认证
    auth: {
        login: '登录',
        register: '注册',
        email: '邮箱',
        password: '密码',
        confirmPassword: '确认密码',
        verificationCode: '验证码',
        sendCode: '发送验证码',
        nickname: '昵称',
        welcome: '欢迎回来',
        welcomeBack: '欢迎回来，{name}！',
        loginSuccess: '登录成功',
        registerSuccess: '注册成功',
        codeResent: '验证码已重新发送',
        agreementText: '登录即表示同意',
        userAgreement: '《用户协议》',
        privacyPolicy: '《隐私政策》',
        forgotPassword: '忘记密码？',
        noAccount: '还没有账号？',
        hasAccount: '已有账号？',
        goToRegister: '立即注册',
        goToLogin: '立即登录'
    },

    // 品牌信息
    brand: {
        name: 'GoingTour',
        tagline: '个性化旅行规划助手',
        features: {
            smartPlanning: {
                title: '智能行程规划',
                desc: 'AI驱动的个性化旅行路线推荐'
            },
            dataAnalysis: {
                title: '数据分析优化',
                desc: '基于用户偏好的精准景点匹配'
            },
            tripSharing: {
                title: '行程分享协作',
                desc: '与朋友实时分享和协同规划'
            }
        },
        copyright: '© 2024 GoingTour. 让每一次旅行都充满惊喜'
    },

    // 账户设置
    settings: {
        accountSettings: '账户设置',
        profileSettings: '个人信息',
        securitySettings: '安全设置',
        privacySettings: '隐私设置',
        systemSettings: '系统设置',
        nickname: '昵称',
        avatar: '头像',
        email: '邮箱',
        phone: '手机号',
        joinDate: '加入时间',
        updateProfile: '更新资料',
        emailLogin: '邮箱验证码登录',
        passwordLogin: '密码登录',
        setPassword: '设置密码',
        changePassword: '修改密码',
        clearPassword: '清除密码',
        loginHistory: '登录记录',
        language: '语言',
        theme: '主题',
        notifications: '通知设置',
        preferences: '偏好设置',
        exportData: '导出数据',
        deleteAccount: '注销账户',
        darkMode: '深色模式',
        lightMode: '浅色模式',
        systemMode: '跟随系统'
    },

    // 个人中心页面
    personal: {
        userDefault: '用户',
        quickActions: '快捷功能',
        createTripDesc: '开始规划您的下一次旅行',
        preferencesDesc: '个性化您的旅行推荐',
        myTrips: '我的行程',
        createNewTrip: '创建新行程',
        aiGenerated: 'AI生成',
        status: {
            draft: '草稿',
            completed: '已完成'
        },
        daysSuffix: '天',
        travelersSuffix: '人',
        noTrips: '还没有创建任何行程',
        createNow: '立即创建行程',
        myPreferences: '我的偏好',
        editPreferences: '编辑偏好',
        card: {
            travelTypes: '旅行类型',
            dailyBudget: '日均预算',
            mbti: 'MBTI性格',
            transport: '出行方式',
            accommodation: '住宿偏好',
            diet: '饮食偏好',
            taste: '口味',
            restrictions: '限制',
            activityTime: '活动时间',
            travelPace: '旅行节奏',
            others: '其他偏好'
        },
        perDay: '/ 天',
        noPreferences: '还没有设置偏好信息',
        setNow: '立即设置',
        stats: {
            createdTrips: '创建行程',
            preferenceTags: '偏好标签',
            usageDays: '使用天数'
        }
    },

    // 行程相关
    trip: {
        createTrip: '创建行程',
        editTrip: '编辑行程',
        tripDetails: '行程详情',
        destination: '目的地',
        startDate: '开始日期',
        endDate: '结束日期',
        budget: '预算',
        travelers: '出行人数',
        preferences: '偏好',
        aiGeneration: '智能生成',
        generationStyle: '生成格式',
        generateTrip: '生成行程',
        cancelGeneration: '取消生成',
        generating: '正在生成行程...',
        styles: {
            table: '表格',
            narrative: '叙述',
            card: '卡片',
            checklist: '清单'
        },
        styleDescriptions: {
            table: '时间清晰',
            narrative: '生动详细',
            card: '现代美观',
            checklist: '便于执行'
        }
    },

    // 表单验证
    validation: {
        required: '{field}不能为空',
        email: '请输入正确的邮箱地址',
        minLength: '{field}长度至少{min}位',
        maxLength: '{field}长度不能超过{max}位',
        passwordMismatch: '两次输入密码不一致',
        codeFormat: '验证码必须是6位数字'
    },

    // 消息提示
    messages: {
        updateSuccess: '更新成功',
        updateFailed: '更新失败',
        deleteSuccess: '删除成功',
        deleteFailed: '删除失败',
        operationSuccess: '操作成功',
        operationFailed: '操作失败',
        networkError: '网络错误，请重试',
        serverError: '服务器错误',
        unauthorized: '未授权访问',
        forbidden: '访问被拒绝'
    }
}