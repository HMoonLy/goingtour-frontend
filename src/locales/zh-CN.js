export default {
    route: {
        login: '登录',
        register: '注册',
        personal: '个人中心',
        home: '首页',
        accountSettings: '账户设置',
        preferences: '偏好设置',
        destinations: '选择目的地',
        tripCreate: '创建行程',
        tripDetail: '行程详情',
        aiTripEdit: '编辑AI行程',
        attractionDetail: '景点详情',
        restaurantList: '餐厅列表',
        search: '搜索结果',
        tripShare: '行程分享',
        notFound: '页面不存在'
    },
    // 首页
    home: {
        quickActions: '快捷操作',
        chooseDestinationDesc: '先选择一个你想去的城市',
        createTripDesc: '进入创建流程，填写基础信息',
        aiEntry: 'AI 行程生成',
        aiEntryDesc: '基于你的偏好快速生成行程',
        continueProgress: '继续未完成的创建',
        resume: '继续',
        discard: '丢弃',
        discardConfirm: '确定要丢弃未完成的创建进度吗？',
        announcements: '公告与动态',
        create: {
            manual: '手动创建',
            ai: 'AI 创建',
            fromTemplate: '从模板创建'
        },
        templates: { title: '选择一个模板' },
        scenarios: { title: '选择一个 AI 场景' },
        templates: { title: '选择一个模板', quick: '常用模板' },
        trips: { recent: '最近', drafts: '草稿' },
        weather: { title: '天气速览', none: '暂无天气信息' },
        ann: {
            sample1: { title: '欢迎使用 GoingTour', desc: '选择一个目的地开始吧！' }
        }
    },
    // 通用
    common: {
        confirm: '确认',
        cancel: '取消',
        confirmRemove: '确定要移除该项吗？',
        save: '保存',
        delete: '删除',
        edit: '编辑',
        add: '添加',
        search: '搜索',
        loading: '加载中...',
        refresh: '刷新',
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
        optional: '可选',
        selected: '已选择',
        to: '至',
        startDate: '开始日期',
        endDate: '结束日期',
        dateFormatYMD: 'YYYY-MM-DD',
        weekdayPrefix: '周',
        none: '无'
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
        resendIn: '{s}s后重发',
        loggingIn: '登录中...',
        registering: '注册中...',
        otherLoginMethods: '其他登录方式',
        otherRegisterMethods: '其他注册方式',
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
        aiPrompt: {
            preview: 'AI提示词预览',
            viewFull: '查看完整提示词'
        },
        messages: {
            fullPromptReady: '已生成完整提示词，可复制到 AI 工具中测试',
            copySuccess: '已复制到剪贴板！',
            copyFailed: '复制失败，请手动复制',
            cancelling: '正在取消生成...',
            cancelled: '已取消生成'
        },
        warnings: {
            completeBasicInfo: '请先完善基础信息'
        },
        progress: {
            start: '🚀 启动智能行程规划...',
            analyzingPrefs: '📊 正在分析您的偏好...',
            buildPrompt: '📝 正在构建专属提示词...',
            connectAi: '🤖 正在连接 AI 服务...',
            deepAnalyze: '🧠 AI 正在深度分析您的需求...',
            sending: '🌐 正在向 AI 服务器发送请求...',
            generating: '⚡ AI 正在生成行程...',
            formatting: '📋 正在整理行程内容...'
        },
        errors: {
            generateFailed: '生成失败',
            generateFailedRetry: '生成失败，请稍后重试',
            timeout: 'AI 服务超时，请重试',
            paymentRequired: 'AI 服务余额不足，请联系管理员',
            network: '网络错误，请重试',
            withMessage: '错误：'
        },
        generating: {
            aiWorking: 'AI 正在为您仔细规划行程...',
            timeRemaining: '预计还需 {s} 秒'
        },
        recommendedCounts: '已为您推荐{attractions}个景点和{restaurants}家餐厅',
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
        systemMode: '跟随系统',
        clearAllRecords: '清除所有记录',
        noLoginRecords: '暂无登录记录',
        loginTime: '登录时间',
        status: '状态',
        loginMethod: '登录方式',
        ipAddress: 'IP地址',
        location: '地理位置',
        deviceType: '设备类型',
        browser: '浏览器',
        operatingSystem: '操作系统',
        sessionDuration: '会话时长'
    },

    // 个人中心页面
    personal: {
        userDefault: '用户',
        quickActions: '快捷功能',
        createTripDesc: '开始规划您的下一次旅行',
        preferencesDesc: '个性化您的旅行推荐',
        myTripsDesc: '查看和管理历史行程',
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
        perDaySuffix: '每人/天',
        noPreferences: '还没有设置偏好信息',
        setNow: '立即设置',
        accountSettingsDesc: '安全设置和隐私管理',
        joinedAt: '加入于 {date}',
        noPhone: '未绑定手机号',
        stats: {
            createdTrips: '创建行程',
            preferenceTags: '偏好标签',
            usageDays: '使用天数'
        },
        messages: {
            avatarUpdateSuccess: '头像更新成功！',
            avatarUpdateFail: '头像更新失败，请重试',
            notLoggedIn: '用户未登录',
            tripDeleteSuccess: '行程删除成功',
            tripDeleteFail: '删除行程失败，请重试',
            navigationFail: '跳转失败，请重试'
        },
        dialog: {
            deleteTripTitle: '删除行程',
            deleteTripMessage: '确定要删除这个行程吗？删除后无法恢复。'
        }
    },

    // 行程相关
    trip: {
        aiPrompt: {
            preview: 'AI提示词预览',
            viewFull: '查看完整提示词'
        },
        messages: {
            fullPromptReady: '已生成完整提示词，可复制到 AI 工具中测试',
            copySuccess: '已复制到剪贴板！',
            copyFailed: '复制失败，请手动复制',
            cancelling: '正在取消生成...',
            cancelled: '已取消生成'
        },
        messages: {
            fullPromptReady: '已生成完整提示词，可复制到 AI 工具中测试',
            copySuccess: '已复制到剪贴板！',
            copyFailed: '复制失败，请手动复制',
            cancelling: '正在取消生成...',
            cancelled: '已取消生成'
        },
        baseInfo: {
            title: '行程基础信息',
            subtitle: '完善您的出行计划，我们将为您量身定制专属行程'
        },
        onboarding: {
            title: '创建向导',
            desc: '按步骤完成基础信息、偏好设置和AI生成；你可以随时返回修改。'
        },
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
        actions: {
            viewFullPrompt: '查看完整提示词',
            generateUsingPrompt: '使用该提示词生成',
            generating: '正在生成...',
            copy: '复制行程',
            regenerate: '重新生成'
        },
        generationStyle: '生成格式',
        generation: {
            format: '生成格式',
            styles: {
                table: '表格',
                narrative: '叙述',
                card: '卡片',
                checklist: '清单'
            },
            styleDesc: {
                table: '时间清晰',
                narrative: '生动详细',
                card: '现代美观',
                checklist: '便于执行'
            }
        },
        generateTrip: '生成行程',
        cancelGeneration: '取消生成',
        generating: '正在生成行程...',
        backToList: '返回行程列表',
        saveChanges: '保存修改',
        share: '分享',
        export: '导出',
        more: '更多',
        duplicate: '复制行程',
        saveAsTemplate: '保存为模板',
        deleteTrip: '删除行程',
        createdAt: '创建于 {date}',
        dailySchedule: '每日行程安排',
        dayN: '第{n}天',
        activitiesCount: '{count}个活动',
        tripTime: '行程时间',
        budgetRange: '预算范围',
        estimatedCost: '预计花费',
        contentStats: '内容统计',
        attractionCount: '{count}个景点',
        restaurantCount: '{count}家餐厅',
        activityTypes: {
            attraction: '景点',
            restaurant: '餐厅',
            transport: '交通',
            hotel: '住宿',
            other: '其他'
        },
        intensity: '行程强度',
        specialExperiences: '特殊体验',
        transportPreferences: '交通偏好',
        specialRequests: '特殊要求',
        backToProfile: '返回个人中心',
        previewMode: '预览模式',
        editMode: '编辑模式',
        markdownEdit: 'Markdown编辑',
        contentPlaceholder: '请输入行程内容（支持Markdown格式）',
        inputTitle: '请输入行程标题',
        daysLabel: '天数',
        travelersLabel: '人数',
        qualityScore: '质量分',
        durationLabel: '用时',
        budgetSettings: '预算设置',
        totalBudget: '总预算',
        budgetPlaceholder: '预算金额',
        yuan: '元',
        noTripData: '未找到行程数据',
        saveTrip: '保存行程',
        add: '添加到计划',
        added: '已添加',
        viewDetails: '查看行程详情',
        generated: '行程生成完成！',
        prepareGenerate: '准备生成您的专属行程',
        prepareGenerateDesc: '基于您的偏好和要求，AI将为您精心规划行程路线',
        fillBasicInfo: '请填写基本信息（目的地、天数、日期等）',
        personalPreferences: '个人偏好',
        noUserPreferences: '未设置个人偏好，可前往“个人中心-偏好设置”进行设置',
        thisTripPreferences: '本次行程偏好',
        setPreferencesInStep: '请在“个性化偏好”步骤中设置本次行程偏好',
        dietaryRestrictions: '饮食禁忌',
        weatherSuggestion: '天气建议',
        weatherForecast: '天气预报',
        weather: {
            amapApi: '高德天气API',
            noticeTitle: '天气提示',
            outOfRangeAdvice: '对于超出预报范围的日期，请关注当地实时天气，并准备适应性衣物。',
            noAccurateForecast: '选择的日期超出当前天气预报范围，无法提供准确预报。',
            checkBeforeTravel: '出发前请再次查看目的地天气。',
            suitableActivitiesPrefix: '适合安排',
            suitableActivitiesSuffix: '等活动。',
            tips: '建议：',
            cautions: '注意事项：',
            detail: '预报详情',
            partialForecastPrefix: '可获取的天气预报（前',
            daysSuffix: '天）',
            referenceForecast: '参考预报',
            historicalSim: '基于历史数据模拟',
            amapApiForecast: '高德API预报',
            dateOutOfRange: '日期超出预报范围',
            afterDayNeedsAttention: '第{day}天及以后请关注实时天气',
            loading: '正在获取天气信息...',
            fetchFailedPrefix: '获取天气数据失败:',
            outOfRangeWithDate: '所选日期范围（{date}）超出预报范围，以下信息仅供参考',
            forecastInsufficient: '您的行程有{days}天，但预报仅有{forecastDays}天',
            windLevel: '级',
            tempRange: '温度范围',
            forecastDays: '预报天数',
            dataSource: '数据来源',
            travelTips: '出行建议'
        },
        mustSee: '必去景点',
        noMustSeeSelected: '未选择必去景点，可以从推荐景点中添加',
        mustEat: '必去餐厅',
        noMustEatSelected: '未选择必去餐厅，可以从推荐餐厅中添加',
        daysAutoByDate: '根据日期自动计算',
        daysAutoTip: '天数将根据您选择的日期范围自动计算',
        selectedDateRange: '已选择日期范围',
        selectDateRangeTip: '请选择您计划出行的日期范围',
        travelersTip: '人数会影响餐厅和住宿推荐',
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
        },
        promptQuality: {
            high: '完善度高',
            medium: '基本完善',
            low: '需完善'
        },
        noAlternativeAttractions: '暂无其他景点可供替换',
        noAlternativeRestaurants: '暂无其他餐厅可供替换',
        noAttractionsToAdd: '暂无可添加的景点',
        noRestaurantsToAdd: '暂无可添加的餐厅',
        aiDisplay: {
            titleSuffix: '旅游计划',
            subtitle: 'AI为您精心规划的{days}天{city}行程',
            feedbackTitle: '行程评价',
            overallSatisfaction: '整体满意度：',
            rating: {
                veryBad: '很差',
                bad: '一般',
                ok: '还行',
                good: '不错',
                excellent: '很棒'
            },
            feedbackPlaceholder: '对这个行程有什么建议或想法？（可选）',
            submitFeedback: '提交反馈',
            thanksRating: '感谢您的{n}星评价！'
        },
        dialog: {
            fullPromptTitle: '完整 AI 提示词',
            copyPrompt: '复制提示词',
            close: '关闭',
            copyAndClose: '复制并关闭',
            regenerateTitle: '确认重新生成',
            regenerateMessage: '重新生成将覆盖当前行程，确定要继续吗？'
        }
    },

    // 轻量搜索文案（TripPreferences 内使用）
    search: {
        attractionPlaceholder: '搜索景点名称、类型...',
        restaurantPlaceholder: '搜索餐厅名称、菜系...',
        sortBy: '排序方式',
        sort: { default: '默认排序', rating: '评分最高', distance: '距离最近' },
        resultsFor: "搜索'{keyword}'的结果（{count}个景点）",
        resultsForRestaurant: "搜索'{keyword}'的结果（{count}家餐厅）",
        backToRecommend: '返回推荐',
        noAttraction: '暂无推荐景点',
        noRestaurant: '暂无推荐餐厅',
        noAddress: '暂无地址信息',
        viewMoreAttraction: '查看更多景点',
        viewMoreRestaurant: '查看更多餐厅',
        foundCount: '找到 {count} 个搜索结果',
        noResults: '未找到相关结果，请尝试其他关键词',
        enterKeyword: '请输入搜索关键词',
        recommendationFor: '{city}推荐内容'
    },

    // 偏好小文案（TripPreferences 内使用）
    preferences: {
        perDay: '每人/天',
        smartPrefilled: '已为您智能预填推荐选项',
        recommendedCount: '已为您推荐{count}项',
        pace: { title: '行程节奏偏好', desc: '选择符合您这次旅行的时间安排和体验深度' },
        social: { title: '社交环境偏好', desc: '选择您更喜欢的旅行环境和氛围' },
        photo: {
            title: '拍照打卡需求',
            desc: '告诉我们您对拍照和分享的重视程度',
            must: '必须有',
            mustDesc: '网红打卡点优先',
            casual: '随性拍拍',
            casualDesc: '自然美景即可',
            minimal: '不太在意',
            minimalDesc: '体验优先'
        },
        dietary: {
            desc: '请告知我们您的饮食限制，确保为您推荐合适的餐厅',
            placeholder: '请输入其他饮食禁忌或特殊需求，如宗教禁忌、过敏原等'
        },
        special: {
            desc: '告诉我们任何需要特别考虑的情况',
            placeholder: '如：行动不便、带小孩、带宠物、无障碍设施需求等'
        }
    },

    // 目的地选择页
    destinations: {
        title: '去哪里旅行',
        searchPlaceholder: '搜索城市、地区...',
        searchResults: '搜索结果',
        noMatch: '未找到匹配的城市，请尝试其他关键词',
        hotCities: '热门城市',
        hot: '热门',
        jumpTo: '跳至{letter}'
    },

    // 行程分享页
    share: {
        title: '行程分享',
        subtitle: '分享您的精彩旅行行程',
        comingTitle: '行程分享功能开发中',
        comingDesc: '我们正在努力完善行程分享功能，包括：',
        features: {
            poster: '行程海报生成',
            qr: '二维码分享',
            social: '社交媒体分享',
            link: '链接分享'
        },
        stayTuned: '敬请期待！'
    },

    // 数据与搜索相关占位页
    dataSearch: {
        title: '搜索结果',
        subtitle: '找到您感兴趣的景点和目的地',
        comingTitle: '搜索功能开发中',
        comingDesc: '我们正在努力完善搜索功能，包括：',
        features: {
            attraction: '景点搜索',
            city: '城市搜索',
            smart: '智能推荐',
            filter: '筛选功能',
            history: '搜索历史'
        },
        stayTuned: '敬请期待！'
    },

    attraction: {
        title: '景点详情',
        subtitle: '了解景点详细信息，添加到您的行程中',
        comingTitle: '景点详情功能开发中',
        comingDesc: '我们正在努力完善景点详情功能，包括：',
        features: {
            intro: '景点详细介绍',
            hours: '开放时间信息',
            ticket: '门票价格',
            reviews: '用户评价',
            add: '添加到行程'
        },
        stayTuned: '敬请期待！'
    },

    restaurant: {
        title: '餐厅推荐',
        subtitle: '发现附近美食，丰富您的旅行体验',
        comingTitle: '餐厅推荐功能开发中',
        comingDesc: '我们正在努力完善餐厅推荐功能，包括：',
        features: {
            nearby: '附近餐厅展示',
            price: '按价格排序',
            distance: '距离筛选',
            cuisine: '菜系分类',
            reviews: '用户评价',
            recommended: '招牌菜'
        },
        stayTuned: '敬请期待！',
        perCapita: '人均￥{price}'
    },

    // 通用类别标签
    category: {
        scenic: '风景名胜',
        catering: '餐饮服务'
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
        confirmLogout: '确定要退出登录吗？',
        unsavedTitle: '未保存的修改',
        unsavedMessage: '您有未保存的修改，确定要离开吗？',
        leave: '离开',
        stay: '继续编辑',
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