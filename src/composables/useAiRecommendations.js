/**
 * AI推荐状态管理组合函数
 * 处理推荐数据的获取、缓存和状态管理
 */

import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { aiRecommendationService } from '@/services/aiRecommendationService'

export function useAiRecommendations() {
    // 响应式状态
    const recommendations = ref({
        attractions: [],
        restaurants: [],
        reasoning: '',
        isFallback: false,
        isError: false,
        timestamp: null
    })

    const isLoading = ref(false)
    const isPreloading = ref(false)
    const error = ref(null)
    const filters = ref({
        priceRange: [0, 500],
        minRating: 0,
        attractionTypes: [],
        cuisineTypes: [],
        aiPriority: 'all',
        distancePreference: ''
    })

    // 计算属性
    const filteredRecommendations = computed(() => {
        if (!recommendations.value || Object.keys(filters.value).length === 0) {
            return recommendations.value
        }

        return aiRecommendationService.filterRecommendations(
            recommendations.value,
            filters.value
        )
    })

    const hasRecommendations = computed(() => {
        const filtered = filteredRecommendations.value
        return filtered && (
            (filtered.attractions && filtered.attractions.length > 0) ||
            (filtered.restaurants && filtered.restaurants.length > 0)
        )
    })

    const aiRecommendationsCount = computed(() => {
        const filtered = filteredRecommendations.value
        if (!filtered) return 0

        const aiAttractions = (filtered.attractions || []).filter(item => item.isAiRecommended)
        const aiRestaurants = (filtered.restaurants || []).filter(item => item.isAiRecommended)

        return aiAttractions.length + aiRestaurants.length
    })

    const recommendationStats = computed(() => {
        const filtered = filteredRecommendations.value
        if (!filtered) return { total: 0, ai: 0, regular: 0, attractions: 0, restaurants: 0, confidence: 0 }

        // 如果推荐数据中已包含统计信息，优先使用
        if (filtered.stats) {
            return {
                total: filtered.stats.total || 0,
                ai: filtered.stats.ai || 0,
                regular: (filtered.stats.total || 0) - (filtered.stats.ai || 0),
                attractions: filtered.stats.attractions || 0,
                restaurants: filtered.stats.restaurants || 0,
                confidence: filtered.stats.confidence || 0
            }
        }

        // 否则计算统计信息
        const totalAttractions = (filtered.attractions || []).length
        const totalRestaurants = (filtered.restaurants || []).length
        const total = totalAttractions + totalRestaurants

        const aiCount = aiRecommendationsCount.value
        const regular = total - aiCount

        // 计算平均置信度
        const allItems = [
            ...(filtered.attractions || []),
            ...(filtered.restaurants || [])
        ]
        const aiItems = allItems.filter(item => item.isAiRecommended)
        const avgConfidence = aiItems.length > 0 ?
            aiItems.reduce((sum, item) => sum + (item.confidence || 0.8), 0) / aiItems.length :
            0.8

        return {
            total,
            ai: aiCount,
            regular,
            attractions: totalAttractions,
            restaurants: totalRestaurants,
            confidence: avgConfidence
        }
    })

    // 方法

    /**
     * 预加载推荐
     */
    const preloadRecommendations = async(baseForm, preferenceForm) => {
        if (!baseForm?.destinationName) {
            console.warn('预加载推荐失败：缺少目的地信息')
            return
        }

        try {
            isPreloading.value = true
            error.value = null

            console.log('开始预加载AI推荐...', {
                destination: baseForm.destinationName,
                preferences: preferenceForm
            })

            const result = await aiRecommendationService.preloadRecommendations(
                baseForm,
                preferenceForm
            )

            recommendations.value = result

            // 显示预加载完成提示
            if (!result.isError && !result.isFallback) {
                ElMessage.success({
                    message: `为您预加载了 ${result.attractions.length} 个景点和 ${result.restaurants.length} 个餐厅推荐`,
                    duration: 2000
                })
            } else if (result.isFallback) {
                ElMessage.warning({
                    message: 'AI推荐服务暂时不可用，为您展示基础推荐',
                    duration: 3000
                })
            }

        } catch (err) {
            console.error('预加载推荐失败:', err)
            error.value = err.message || '预加载推荐失败'

            ElMessage.error({
                message: '预加载推荐失败，将在需要时重新获取',
                duration: 3000
            })
        } finally {
            isPreloading.value = false
        }
    }

    /**
     * 获取推荐
     */
    const fetchRecommendations = async(baseForm, preferenceForm, forceRefresh = false) => {
        if (!baseForm?.destinationName) {
            error.value = '缺少目的地信息'
            return
        }

        try {
            isLoading.value = true
            error.value = null

            // 尝试从缓存获取
            if (!forceRefresh) {
                const cached = aiRecommendationService.getCachedRecommendations(baseForm, preferenceForm)
                if (cached) {
                    console.log('使用缓存的推荐数据')
                    recommendations.value = cached
                    return cached
                }
            }

            console.log('获取新的AI推荐...', {
                destination: baseForm.destinationName,
                forceRefresh
            })

            const result = await aiRecommendationService.fetchAiRecommendations(
                baseForm,
                preferenceForm
            )

            recommendations.value = result
            return result

        } catch (err) {
            console.error('获取推荐失败:', err)
            error.value = err.message || '获取推荐失败'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 刷新推荐
     */
    const refreshRecommendations = async(baseForm, preferenceForm) => {
        try {
            const result = await aiRecommendationService.refreshRecommendations(baseForm, preferenceForm)
            recommendations.value = result
            return result
        } catch (err) {
            // 如果刷新失败，回退到常规获取
            return fetchRecommendations(baseForm, preferenceForm, true)
        }
    }

    /**
     * 异步预加载推荐（不阻塞UI）
     * 适用于在第二步完成时调用
     */
    const preloadRecommendationsAsync = async(baseForm, preferenceForm) => {
        if (!baseForm?.destinationName) {
            console.warn('异步预加载推荐失败：缺少目的地信息')
            return false
        }

        try {
            console.log('🚀 开始异步预加载AI推荐...', {
                destination: baseForm.destinationName
            })

            const success = await aiRecommendationService.preloadRecommendationsAsync(baseForm, preferenceForm)

            if (success) {
                console.log('✅ AI推荐异步预加载成功')
            }

            return success
        } catch (err) {
            console.warn('⚠️ AI推荐异步预加载失败:', err)
            return false
        }
    }

    /**
     * 更新筛选条件
     */
    const updateFilters = (newFilters) => {
        filters.value = {...filters.value, ...newFilters }
    }

    /**
     * 清除筛选条件
     */
    const clearFilters = () => {
        filters.value = {
            priceRange: [0, 500],
            minRating: 0,
            attractionTypes: [],
            cuisineTypes: [],
            aiPriority: 'all',
            distancePreference: ''
        }
    }

    /**
     * 清除缓存
     */
    const clearCache = () => {
        aiRecommendationService.clearCache()
        recommendations.value = {
            attractions: [],
            restaurants: [],
            reasoning: '',
            isFallback: false,
            isError: false,
            timestamp: null
        }
    }

    /**
     * 获取推荐理由
     */
    const getRecommendationReasoning = () => {
        return recommendations.value?.reasoning || ''
    }

    /**
     * 检查是否有AI推荐
     */
    const hasAiRecommendations = () => {
        const current = recommendations.value
        if (!current) return false

        const hasAiAttractions = (current.attractions || []).some(item => item.isAiRecommended)
        const hasAiRestaurants = (current.restaurants || []).some(item => item.isAiRecommended)

        return hasAiAttractions || hasAiRestaurants
    }

    /**
     * 获取推荐项目详情
     */
    const getItemDetails = (item, type) => {
        return {
            ...item,
            type,
            isAiRecommended: item.isAiRecommended || false,
            aiReason: item.aiReason || '',
            confidence: item.confidence || 0.8,
            matchingFactors: item.matchingFactors || []
        }
    }

    // 监听筛选条件变化
    watch(
        filters,
        (newFilters) => {
            console.log('筛选条件已更新:', newFilters)
        }, { deep: true }
    )

    return {
        // 状态
        recommendations,
        filteredRecommendations,
        isLoading,
        isPreloading,
        error,
        filters,

        // 计算属性
        hasRecommendations,
        aiRecommendationsCount,
        recommendationStats,

        // 方法
        preloadRecommendations,
        preloadRecommendationsAsync,
        fetchRecommendations,
        refreshRecommendations,
        updateFilters,
        clearFilters,
        clearCache,
        getRecommendationReasoning,
        hasAiRecommendations,
        getItemDetails
    }
}