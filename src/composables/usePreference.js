/**
 * 偏好设置管理 Composable
 * 整合用户档案偏好和行程偏好，提供统一的偏好管理接口
 */
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePreferenceStore } from '@/store/preference.js'
import { useUserStore } from '@/store/user.js'

/**
 * 偏好设置主要功能
 * 整合用户档案偏好和当前行程偏好
 */
export function usePreference() {
    const preferenceStore = usePreferenceStore()
    const userStore = useUserStore()

    // 状态管理
    const isInitialized = ref(false)
    const loading = ref(false)
    const error = ref(null)
    const hasChanges = ref(false)

    // 计算属性
    const tripPreferences = computed(() => preferenceStore.tripPreferenceForm)
    const mergedPreferences = computed(() => preferenceStore.mergedPreferences)
    const isFromDraft = computed(() => preferenceStore.isFromDraft)
    const isComplete = computed(() => preferenceStore.isPreferencesComplete)
    const completeness = computed(() => preferenceStore.preferencesCompleteness)

    const userProfile = computed(() => userStore.userPreferences || {})
    const hasUserProfile = computed(() => {
        const profile = userProfile.value
        return !!(profile.selectedTags ? .length || profile.mbtiType || profile.coreInterests ? .length)
    })

    const effectivePreferences = computed(() => {
        return preferenceStore.getEffectivePreferences()
    })

    /**
     * 偏好选项配置
     */
    const preferenceOptions = {
        tripGoals: [
            { key: 'family', name: '家庭亲子', description: '与家人共度美好时光', icon: '👨‍👩‍👧‍👦' },
            { key: 'romantic', name: '浪漫情侣', description: '创造浪漫回忆', icon: '💕' },
            { key: 'friendship', name: '朋友聚会', description: '和朋友一起探索', icon: '👫' },
            { key: 'solo', name: '独自旅行', description: '享受独处时光', icon: '🎒' },
            { key: 'business', name: '商务出行', description: '工作与休闲结合', icon: '💼' },
            { key: 'photography', name: '摄影创作', description: '捕捉美好瞬间', icon: '📸' },
            { key: 'adventure', name: '冒险探索', description: '挑战自我', icon: '🏔️' },
            { key: 'relaxation', name: '放松休闲', description: '缓解压力', icon: '🧘' },
            { key: 'learning', name: '文化学习', description: '增长见识', icon: '📚' },
            { key: 'celebration', name: '庆祝纪念', description: '特殊节日庆祝', icon: '🎉' }
        ],

        focusAreas: [
            { key: 'local_culture', name: '当地文化', description: '体验本土风情', icon: '🏛️' },
            { key: 'historical_sites', name: '历史古迹', description: '探寻历史印记', icon: '🏯' },
            { key: 'natural_scenery', name: '自然风光', description: '亲近大自然', icon: '🌄' },
            { key: 'food_experience', name: '美食体验', description: '品尝地道美食', icon: '🍜' },
            { key: 'urban_life', name: '都市生活', description: '感受城市活力', icon: '🏙️' },
            { key: 'modern_attractions', name: '现代景点', description: '体验现代文明', icon: '🎢' },
            { key: 'shopping', name: '购物娱乐', description: '享受购物乐趣', icon: '🛍️' },
            { key: 'nightlife', name: '夜生活', description: '体验夜间活动', icon: '🌃' }
        ],

        pacePreference: [
            { key: 'slow', name: '慢节奏', description: '悠闲漫步，深度体验', icon: '🐌' },
            { key: 'balanced', name: '适中', description: '劳逸结合，张弛有度', icon: '⚖️' },
            { key: 'fast', name: '快节奏', description: '高效游览，多样体验', icon: '⚡' }
        ],

        socialPreference: [
            { key: 'quiet', name: '安静环境', description: '偏爱宁静的场所', icon: '🤫' },
            { key: 'mixed', name: '适中', description: '安静和热闹都可以', icon: '🔄' },
            { key: 'lively', name: '热闹环境', description: '喜欢人气旺盛的地方', icon: '🎉' }
        ],

        photoPreference: [
            { key: 'casual', name: '随手拍', description: '偶尔拍照留念', icon: '📱' },
            { key: 'focused', name: '重点拍摄', description: '在特定场景认真拍摄', icon: '📷' },
            { key: 'essential', name: '摄影优先', description: '拍摄是行程重要部分', icon: '📸' }
        ],

        dietaryRestrictions: [
            { key: 'vegetarian', name: '素食主义', icon: '🥬' },
            { key: 'vegan', name: '严格素食', icon: '🌱' },
            { key: 'halal', name: '清真饮食', icon: '☪️' },
            { key: 'kosher', name: '犹太洁食', icon: '✡️' },
            { key: 'gluten_free', name: '无麸质', icon: '🌾' },
            { key: 'lactose_free', name: '无乳糖', icon: '🥛' },
            { key: 'nut_allergy', name: '坚果过敏', icon: '🥜' },
            { key: 'shellfish_allergy', name: '海鲜过敏', icon: '🦐' }
        ],

        temporaryNeeds: [
            { key: 'hasChildren', name: '带有小孩', description: '需要考虑儿童适宜的活动', icon: '👶' },
            { key: 'hasElderly', name: '带有老人', description: '需要考虑老人的体力和需求', icon: '👴' },
            { key: 'needAccessibility', name: '无障碍需求', description: '需要无障碍设施', icon: '♿' },
            { key: 'budgetConstraint', name: '预算紧张', description: '希望控制开支', icon: '💰' }
        ]
    }

    // 方法

    /**
     * 初始化偏好设置
     */
    const initializePreferences = async(options = {}) => {
        try {
            loading.value = true
            error.value = null

            const { force = false } = options

            if (isInitialized.value && !force) {
                return
            }

            // 等待用户store初始化
            if (!userStore.isInitialized) {
                await userStore.waitForInitialization ? .()
            }

            // 初始化行程偏好
            preferenceStore.initializeTripPreferences()

            isInitialized.value = true
            hasChanges.value = false

            console.log('✅ 偏好设置初始化完成')
        } catch (err) {
            console.error('偏好设置初始化失败:', err)
            error.value = err.message || '初始化失败'
            ElMessage.error('偏好设置初始化失败')
        } finally {
            loading.value = false
        }
    }

    /**
     * 更新单个偏好字段
     */
    const updatePreference = (field, value) => {
        try {
            preferenceStore.updateTripPreference(field, value)
            hasChanges.value = true

            console.log(`✅ 偏好字段 ${field} 已更新:`, value)
        } catch (err) {
            console.error(`更新偏好字段 ${field} 失败:`, err)
            error.value = err.message || '更新失败'
            ElMessage.error('偏好更新失败')
        }
    }

    /**
     * 批量更新偏好
     */
    const updatePreferences = (preferences) => {
        try {
            preferenceStore.updateTripPreferences(preferences)
            hasChanges.value = true

            console.log('✅ 偏好批量更新完成:', preferences)
        } catch (err) {
            console.error('批量更新偏好失败:', err)
            error.value = err.message || '批量更新失败'
            ElMessage.error('偏好批量更新失败')
        }
    }

    /**
     * 从草稿加载偏好
     */
    const loadFromDraft = (draftPreferenceData) => {
        try {
            preferenceStore.loadDraftPreferences(draftPreferenceData)
            hasChanges.value = false

            console.log('✅ 从草稿加载偏好成功')
            ElMessage.success('偏好设置已从草稿恢复')
        } catch (err) {
            console.error('从草稿加载偏好失败:', err)
            error.value = err.message || '加载失败'
            ElMessage.error('从草稿加载偏好失败')
        }
    }

    /**
     * 重置偏好设置
     */
    const resetPreferences = (options = {}) => {
        try {
            const { showConfirm = true } = options

            if (showConfirm && hasChanges.value) {
                ElMessageBox.confirm(
                    '重置将清除所有自定义偏好设置，确定要继续吗？',
                    '确认重置', {
                        confirmButtonText: '重置',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                ).then(() => {
                    preferenceStore.resetPreferences()
                    hasChanges.value = false
                    ElMessage.success('偏好设置已重置')
                })
            } else {
                preferenceStore.resetPreferences()
                hasChanges.value = false
                ElMessage.success('偏好设置已重置')
            }
        } catch (err) {
            console.error('重置偏好失败:', err)
            error.value = err.message || '重置失败'
        }
    }

    /**
     * 验证偏好完整性
     */
    const validatePreferences = () => {
        const validation = {
            isValid: true,
            missingFields: [],
            warnings: []
        }

        const current = tripPreferences.value

        // 检查必填字段
        if (!current.tripGoals || current.tripGoals.length === 0) {
            validation.missingFields.push('旅行目标')
            validation.isValid = false
        }

        if (!current.focusAreas || current.focusAreas.length === 0) {
            validation.missingFields.push('重点体验')
            validation.isValid = false
        }

        if (!current.pacePreference) {
            validation.missingFields.push('节奏偏好')
            validation.isValid = false
        }

        if (!current.socialPreference) {
            validation.missingFields.push('社交偏好')
            validation.isValid = false
        }

        if (!current.photoPreference) {
            validation.missingFields.push('拍照偏好')
            validation.isValid = false
        }

        // 检查警告项
        if (!hasUserProfile.value) {
            validation.warnings.push('未设置用户档案，建议完善个人信息以获得更好的推荐')
        }

        return validation
    }

    /**
     * 获取偏好摘要
     */
    const getPreferenceSummary = () => {
        const effective = effectivePreferences.value

        return {
            // 基本信息
            goals: effective.tripGoals ? .map(goal =>
                preferenceOptions.tripGoals.find(opt => opt.key === goal) ? .name || goal
            ).join('、') || '未设置',

            focus: effective.focusAreas ? .map(area =>
                preferenceOptions.focusAreas.find(opt => opt.key === area) ? .name || area
            ).join('、') || '未设置',

            pace: preferenceOptions.pacePreference.find(opt => opt.key === effective.pacePreference) ? .name || '未设置',

            social: preferenceOptions.socialPreference.find(opt => opt.key === effective.socialPreference) ? .name || '未设置',

            photo: preferenceOptions.photoPreference.find(opt => opt.key === effective.photoPreference) ? .name || '未设置',

            // 饮食限制
            dietary: effective.dietaryRestrictions ? .length > 0 ?
                effective.dietaryRestrictions.map(restriction =>
                    preferenceOptions.dietaryRestrictions.find(opt => opt.key === restriction) ? .name || restriction
                ).join('、') :
                '无限制',

            // 特殊需求
            specialNeeds: [
                effective.hasChildren && '有小孩',
                effective.hasElderly && '有老人',
                effective.needAccessibility && '需要无障碍',
                effective.budgetConstraint && '预算紧张'
            ].filter(Boolean).join('、') || '无特殊需求',

            // 来源
            source: effective.source === 'draft' ? '来自草稿' : '用户设置',

            // 完成度
            completeness: completeness.value
        }
    }

    /**
     * 获取推荐策略描述
     */
    const getRecommendationStrategy = () => {
        const effective = effectivePreferences.value
        const strategies = []

        // 基于节奏偏好
        if (effective.pacePreference === 'slow') {
            strategies.push('深度体验，减少景点数量，增加停留时间')
        } else if (effective.pacePreference === 'fast') {
            strategies.push('高效游览，丰富行程，多样化体验')
        } else {
            strategies.push('平衡安排，劳逸结合')
        }

        // 基于社交偏好
        if (effective.socialPreference === 'quiet') {
            strategies.push('优先推荐安静、人少的景点')
        } else if (effective.socialPreference === 'lively') {
            strategies.push('推荐热门、人气旺盛的地点')
        }

        // 基于拍照偏好
        if (effective.photoPreference === 'essential') {
            strategies.push('重点推荐摄影热门地点，考虑最佳拍摄时间')
        }

        // 基于饮食限制
        if (effective.dietaryRestrictions ? .length > 0) {
            strategies.push(`餐厅推荐将过滤${effective.dietaryRestrictions.length}项饮食限制`)
        }

        // 基于特殊需求
        if (effective.hasChildren) {
            strategies.push('优先推荐适合儿童的活动场所')
        }
        if (effective.hasElderly) {
            strategies.push('考虑老人体力，推荐轻松易达的景点')
        }
        if (effective.needAccessibility) {
            strategies.push('确保推荐地点具备无障碍设施')
        }
        if (effective.budgetConstraint) {
            strategies.push('优先推荐性价比高的选项')
        }

        return strategies
    }

    /**
     * 导出偏好配置
     */
    const exportPreferences = () => {
        return {
            timestamp: new Date().toISOString(),
            tripPreferences: {...tripPreferences.value },
            userProfile: {...userProfile.value },
            mergedPreferences: {...effectivePreferences.value },
            summary: getPreferenceSummary(),
            strategy: getRecommendationStrategy()
        }
    }

    /**
     * 导入偏好配置
     */
    const importPreferences = (preferencesData) => {
        try {
            if (preferencesData.tripPreferences) {
                updatePreferences(preferencesData.tripPreferences)
                ElMessage.success('偏好设置导入成功')
            } else {
                throw new Error('无效的偏好设置数据')
            }
        } catch (err) {
            console.error('导入偏好设置失败:', err)
            ElMessage.error('导入偏好设置失败')
            throw err
        }
    }

    // 监听变化
    watch(
        tripPreferences,
        (newVal, oldVal) => {
            if (oldVal && JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
                hasChanges.value = true
            }
        }, { deep: true }
    )

    return {
        // 状态
        isInitialized,
        loading,
        error,
        hasChanges,

        // 计算属性
        tripPreferences,
        mergedPreferences,
        effectivePreferences,
        userProfile,
        hasUserProfile,
        isFromDraft,
        isComplete,
        completeness,

        // 配置选项
        preferenceOptions,

        // 方法
        initializePreferences,
        updatePreference,
        updatePreferences,
        loadFromDraft,
        resetPreferences,
        validatePreferences,
        getPreferenceSummary,
        getRecommendationStrategy,
        exportPreferences,
        importPreferences
    }
}

/**
 * 专用于偏好表单的composable
 */
export function usePreferenceForm() {
    const {
        tripPreferences,
        preferenceOptions,
        updatePreference,
        validatePreferences,
        isComplete,
        completeness
    } = usePreference()

    // 表单状态
    const currentStep = ref(0)
    const stepValidation = ref({})

    const steps = [{
            key: 'goals',
            title: '旅行目标',
            description: '这次旅行最想达成什么目标？',
            field: 'tripGoals',
            type: 'multiple',
            required: true
        },
        {
            key: 'focus',
            title: '重点体验',
            description: '最想体验哪些方面？',
            field: 'focusAreas',
            type: 'multiple',
            required: true
        },
        {
            key: 'pace',
            title: '节奏偏好',
            description: '喜欢什么样的旅行节奏？',
            field: 'pacePreference',
            type: 'single',
            required: true
        },
        {
            key: 'social',
            title: '社交偏好',
            description: '更喜欢什么样的环境？',
            field: 'socialPreference',
            type: 'single',
            required: true
        },
        {
            key: 'photo',
            title: '拍照偏好',
            description: '拍照在旅行中的重要程度？',
            field: 'photoPreference',
            type: 'single',
            required: true
        },
        {
            key: 'dietary',
            title: '饮食限制',
            description: '是否有特殊的饮食要求？',
            field: 'temporaryDietaryRestrictions',
            type: 'multiple',
            required: false
        },
        {
            key: 'special',
            title: '特殊需求',
            description: '这次旅行有什么特殊考虑？',
            field: 'specialRequirements',
            type: 'multiple',
            required: false
        }
    ]

    const currentStepInfo = computed(() => steps[currentStep.value] || {})
    const isLastStep = computed(() => currentStep.value >= steps.length - 1)
    const canProceed = computed(() => {
        const step = currentStepInfo.value
        if (!step.required) return true

        const value = tripPreferences.value[step.field]
        return step.type === 'multiple' ? (value && value.length > 0) : !!value
    })

    const nextStep = () => {
        if (canProceed.value && !isLastStep.value) {
            currentStep.value++
        }
    }

    const prevStep = () => {
        if (currentStep.value > 0) {
            currentStep.value--
        }
    }

    const goToStep = (step) => {
        if (step >= 0 && step < steps.length) {
            currentStep.value = step
        }
    }

    const validateCurrentStep = () => {
        const step = currentStepInfo.value
        const validation = {
            isValid: true,
            message: ''
        }

        if (step.required) {
            const value = tripPreferences.value[step.field]
            if (step.type === 'multiple') {
                if (!value || value.length === 0) {
                    validation.isValid = false
                    validation.message = `请至少选择一个${step.title}选项`
                }
            } else {
                if (!value) {
                    validation.isValid = false
                    validation.message = `请选择${step.title}`
                }
            }
        }

        stepValidation.value[currentStep.value] = validation
        return validation
    }

    const validateAllSteps = () => {
        const allValid = steps.every((step, index) => {
            currentStep.value = index
            return validateCurrentStep().isValid
        })

        return allValid
    }

    return {
        // 状态
        currentStep,
        stepValidation,

        // 配置
        steps,

        // 计算属性
        currentStepInfo,
        isLastStep,
        canProceed,
        tripPreferences,
        preferenceOptions,
        isComplete,
        completeness,

        // 方法
        nextStep,
        prevStep,
        goToStep,
        validateCurrentStep,
        validateAllSteps,
        updatePreference
    }
}

/**
 * 专用于偏好预览和摘要的composable
 */
export function usePreferenceSummary() {
    const {
        effectivePreferences,
        getPreferenceSummary,
        getRecommendationStrategy,
        preferenceOptions
    } = usePreference()

    const summary = computed(() => getPreferenceSummary())
    const strategy = computed(() => getRecommendationStrategy())

    const formatPreferenceValue = (key, value) => {
        if (!value) return '未设置'

        if (Array.isArray(value)) {
            return value.map(v => {
                const option = preferenceOptions[key] ? .find(opt => opt.key === v)
                return option ? .name || v
            }).join('、')
        } else {
            const option = preferenceOptions[key] ? .find(opt => opt.key === value)
            return option ? .name || value
        }
    }

    const getPreferenceIcon = (key, value) => {
        if (!value) return '❓'

        if (Array.isArray(value)) {
            return value.map(v => {
                const option = preferenceOptions[key] ? .find(opt => opt.key === v)
                return option ? .icon || '•'
            }).join(' ')
        } else {
            const option = preferenceOptions[key] ? .find(opt => opt.key === value)
            return option ? .icon || '•'
        }
    }

    return {
        summary,
        strategy,
        effectivePreferences,
        formatPreferenceValue,
        getPreferenceIcon
    }
}