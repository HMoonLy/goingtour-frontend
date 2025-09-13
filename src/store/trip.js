import { defineStore } from 'pinia'
import { tripApi } from '@/api/trip.js'
// 注意：新代码建议使用 tripService 和 useTrip composable
// 本store保持向后兼容，但建议逐步迁移到新的架构

export const useTripStore = defineStore('trip', {
    state: () => ({
        // 当前编辑的行程
        currentTrip: null,

        // 用户的行程列表
        tripList: [],

        // 选择的目的地城市
        selectedCity: null,

        // 行程生成参数
        generateParams: {
            city: '',
            days: 3,
            preferences: []
        },

        // 行程详情页数据
        tripDetails: null,

        // 加载状态
        loading: {
            generating: false,
            fetching: false,
            updating: false
        }
    }),

    getters: {
        // 获取当前行程ID
        currentTripId: (state) => state.currentTrip ? .id,

        // 检查是否有选中的城市
        hasSelectedCity: (state) => !!state.selectedCity,

        // 格式化行程标题
        tripTitle: (state) => {
            if (!state.currentTrip) return ''
            return state.currentTrip.title || `${state.currentTrip.city}${state.currentTrip.days}日游`
        },

        // 获取行程总预算
        totalBudget: (state) => state.currentTrip ? .totalBudget || 0,

        // 获取实际花费
        actualCost: (state) => state.currentTrip ? .actualCost || 0,

        // 按状态分组的行程
        tripsByStatus: (state) => {
            const groups = {
                draft: [], // 草稿
                published: [], // 已发布
                completed: [] // 已完成
            }

            state.tripList.forEach(trip => {
                switch (trip.status) {
                    case 1:
                        groups.draft.push(trip)
                        break
                    case 2:
                        groups.published.push(trip)
                        break
                    case 3:
                        groups.completed.push(trip)
                        break
                }
            })

            return groups
        }
    },

    actions: {
        // ========== 行程生成相关 ==========

        /**
         * 设置目的地城市
         */
        setSelectedCity(city) {
            this.selectedCity = city
            this.generateParams.city = city
        },

        /**
         * 设置行程生成参数
         */
        setGenerateParams(params) {
            this.generateParams = {...this.generateParams, ...params }
        },

        /**
         * 生成个性化行程
         * @deprecated 建议使用 useTrip composable 中的 generateAiTrip 方法
         */
        async generateTrip(userId, params) {
            this.loading.generating = true

            try {
                // 注意：此方法依赖于后端AI接口，非tripApi的generateTrip方法
                // 如果后端没有此接口，可能需要调整实现
                console.warn('generateTrip方法已废弃，建议使用useTrip中的generateAiTrip')

                // 临时实现，实际应该调用AI接口
                const response = await fetch('/api/ai/trip/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId,
                        ...params
                    })
                })

                if (!response.ok) {
                    throw new Error('生成失败')
                }

                const result = await response.json()

                if (result.code === 200) {
                    this.currentTrip = result.data
                    return { success: true, trip: result.data }
                } else {
                    throw new Error(result.msg || '生成失败')
                }
            } catch (error) {
                return { success: false, message: error.message || '行程生成失败' }
            } finally {
                this.loading.generating = false
            }
        },

        // ========== 行程CRUD操作 ==========

        /**
         * 获取用户行程列表
         */
        async fetchUserTrips(userId) {
            this.loading.fetching = true

            try {
                const response = await tripApi.getUserTrips(userId)
                this.tripList = response.data || []
                return { success: true, trips: response.data }
            } catch (error) {
                return { success: false, message: error.message || '获取行程列表失败' }
            } finally {
                this.loading.fetching = false
            }
        },

        /**
         * 获取行程详情
         */
        async fetchTripDetail(tripId, userId) {
            this.loading.fetching = true

            try {
                const response = await tripApi.getTripDetail(tripId, userId)
                this.tripDetails = response.data
                return { success: true, trip: response.data }
            } catch (error) {
                return { success: false, message: error.message || '获取行程详情失败' }
            } finally {
                this.loading.fetching = false
            }
        },

        /**
         * 更新行程信息
         */
        async updateTrip(tripId, userId, updateData) {
            this.loading.updating = true

            try {
                const response = await tripApi.updateTrip(tripId, userId, updateData)

                // 更新本地状态
                if (this.currentTrip ? .id === tripId) {
                    this.currentTrip = {...this.currentTrip, ...response.data }
                }

                // 更新列表中的行程
                const index = this.tripList.findIndex(trip => trip.id === tripId)
                if (index !== -1) {
                    this.tripList[index] = {...this.tripList[index], ...response.data }
                }

                return { success: true, trip: response.data }
            } catch (error) {
                return { success: false, message: error.message || '行程更新失败' }
            } finally {
                this.loading.updating = false
            }
        },

        /**
         * 删除行程
         */
        async deleteTrip(tripId, userId) {
            try {
                await tripApi.deleteTrip(tripId, userId)

                // 从列表中移除
                this.tripList = this.tripList.filter(trip => trip.id !== tripId)

                // 如果删除的是当前行程，清空当前行程
                if (this.currentTrip ? .id === tripId) {
                    this.currentTrip = null
                }

                return { success: true }
            } catch (error) {
                return { success: false, message: error.message || '删除行程失败' }
            }
        },

        // ========== 行程详情管理 ==========

        /**
         * 添加行程项目
         */
        async addTripItem(tripId, day, timeSlot, itemData) {
            try {
                const response = await tripApi.addTripItem(tripId, {
                    day,
                    timeSlot,
                    ...itemData
                })

                // 更新本地行程详情
                if (this.tripDetails ? .id === tripId) {
                    // 这里需要更新 tripDetails 的具体逻辑
                    // 具体实现取决于后端返回的数据结构
                }

                return { success: true, item: response.data }
            } catch (error) {
                return { success: false, message: error.message || '添加行程项目失败' }
            }
        },

        /**
         * 更新行程项目
         */
        async updateTripItem(itemId, updateData) {
            try {
                const response = await tripApi.updateTripItem(itemId, updateData)
                return { success: true, item: response.data }
            } catch (error) {
                return { success: false, message: error.message || '更新行程项目失败' }
            }
        },

        /**
         * 删除行程项目
         */
        async deleteTripItem(itemId) {
            try {
                await tripApi.deleteTripItem(itemId)
                return { success: true }
            } catch (error) {
                return { success: false, message: error.message || '删除行程项目失败' }
            }
        },

        // ========== 行程分享相关 ==========

        /**
         * 生成分享码
         */
        async generateShareCode(tripId, userId) {
            try {
                const response = await tripApi.generateShareCode(tripId, userId)
                return { success: true, shareCode: response.data.shareCode }
            } catch (error) {
                return { success: false, message: error.message || '生成分享码失败' }
            }
        },

        /**
         * 通过分享码获取行程
         */
        async getTripByShareCode(shareCode) {
            try {
                const response = await tripApi.getTripByShareCode(shareCode)
                return { success: true, trip: response.data }
            } catch (error) {
                return { success: false, message: error.message || '获取分享行程失败' }
            }
        },

        // ========== 协作功能 ==========

        /**
         * 添加协作者
         */
        async addCollaborator(tripId, phone, role = 'viewer') {
            try {
                const response = await tripApi.addCollaborator(tripId, { phone, role })
                return { success: true, collaborator: response.data }
            } catch (error) {
                return { success: false, message: error.message || '添加协作者失败' }
            }
        },

        /**
         * 获取协作者列表
         */
        async getCollaborators(tripId) {
            try {
                const response = await tripApi.getCollaborators(tripId)
                return { success: true, collaborators: response.data }
            } catch (error) {
                return { success: false, message: error.message || '获取协作者列表失败' }
            }
        },

        // ========== 辅助方法 ==========

        /**
         * 清空当前行程
         */
        clearCurrentTrip() {
            this.currentTrip = null
            this.tripDetails = null
        },

        /**
         * 重置生成参数
         */
        resetGenerateParams() {
            this.generateParams = {
                city: '',
                days: 3,
                preferences: []
            }
            this.selectedCity = null
        },

        /**
         * 设置当前行程
         */
        setCurrentTrip(trip) {
            this.currentTrip = trip
        }
    }
})