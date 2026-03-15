/**
 * 照片管理组合函数
 * 提供照片相关的响应式状态和方法
 */
import { ref } from 'vue'
import { photoService } from '@/services/common/photoService.js'
import { useUserStore } from '@/store/user.js'

export function usePhotos() {
    // 状态
    const uploading = ref(false)
    const uploadProgress = ref(0)

    // 方法

    /**
     * 上传城市照片
     */
    const uploadCityPhoto = async(
        file,
        cityCode,
        cityName,
        caption = "",
        tags = [],
        travelTime = null,
        travelFeeling = "",
        citycode = null,
        options = {}
    ) => {
        const userStore = useUserStore()

        if (!userStore.isLoggedIn) {
            return null
        }

        uploading.value = true
        try {
            const result = await photoService.uploadCityPhoto(
                file,
                cityCode,
                cityName,
                caption,
                tags,
                travelTime,
                travelFeeling,
                citycode,
                options
            )

            return result
        } catch (error) {
            return null
        } finally {
            uploading.value = false
        }
    }

    /**
     * 批量上传照片
     */
    const batchUploadPhotos = async(files, cityCode, cityName, options = {}) => {
        const userStore = useUserStore()

        if (!userStore.isLoggedIn) {
            return { success: 0, failed: 0, results: [] }
        }

        uploading.value = true
        uploadProgress.value = 0

        try {
            const progressCallback = (progress) => {
                uploadProgress.value = (progress.current / progress.total) * 100
                if (options.onProgress) {
                    options.onProgress(progress)
                }
            }

            const result = await photoService.batchUploadPhotos(
                files,
                cityCode,
                cityName, {...options, onProgress: progressCallback }
            )

            return result
        } catch (error) {
            return { success: 0, failed: 0, results: [] }
        } finally {
            uploading.value = false
            uploadProgress.value = 0
        }
    }

    /**
     * 获取城市照片列表
     */
    const getCityPhotos = async(cityCode, bustCache = false) => {
        const userStore = useUserStore()

        if (!userStore.isLoggedIn) {
            console.warn("⚠️ 用户未登录，无法获取照片")
            return []
        }

        try {
            return await photoService.getCityPhotos(cityCode, bustCache)
        } catch (error) {
            return []
        }
    }

    /**
     * 获取用户所有照片
     */
    const getUserPhotos = async() => {
        const userStore = useUserStore()

        if (!userStore.isLoggedIn) {
            return []
        }

        try {
            return await photoService.getUserPhotos()
        } catch (error) {
            return []
        }
    }

    /**
     * 更新照片信息
     */
    const updatePhoto = async(photoId, caption, tags = [], options = {}) => {
        const userStore = useUserStore()

        if (!userStore.isLoggedIn) {
            return false
        }

        try {
            return await photoService.updatePhoto(photoId, caption, tags, options)
        } catch (error) {
            return false
        }
    }

    /**
     * 删除照片
     */
    const deletePhoto = async(photoId, options = {}) => {
        const userStore = useUserStore()

        if (!userStore.isLoggedIn) {
            return false
        }

        try {
            return await photoService.deletePhoto(photoId, options)
        } catch (error) {
            return false
        }
    }

    /**
     * 批量删除照片
     */
    const batchDeletePhotos = async(photoIds, options = {}) => {
        const userStore = useUserStore()

        if (!userStore.isLoggedIn) {
            return 0
        }

        try {
            return await photoService.batchDeletePhotos(photoIds, options)
        } catch (error) {
            return 0
        }
    }

    /**
     * 设置封面照片
     */
    const setCoverPhoto = async(photoId, options = {}) => {
        const userStore = useUserStore()

        if (!userStore.isLoggedIn) {
            return false
        }

        try {
            return await photoService.setCoverPhoto(photoId, options)
        } catch (error) {
            return false
        }
    }

    /**
     * 更新照片排序
     */
    const updatePhotoOrder = async(photoIds, options = {}) => {
        const userStore = useUserStore()

        if (!userStore.isLoggedIn) {
            return false
        }

        try {
            return await photoService.updatePhotoOrder(photoIds, options)
        } catch (error) {
            return false
        }
    }

    /**
     * 根据ID获取照片详情
     */
    const getPhotoById = async(photoId) => {
        const userStore = useUserStore()

        if (!userStore.isLoggedIn) {
            return null
        }

        try {
            return await photoService.getPhotoById(photoId)
        } catch (error) {
            return null
        }
    }

    /**
     * 获取照片统计信息
     */
    const getPhotoStats = async() => {
        const userStore = useUserStore()

        if (!userStore.isLoggedIn) {
            return { totalPhotos: 0, citiesWithPhotos: 0 }
        }

        try {
            return await photoService.getPhotoStats()
        } catch (error) {
            return { totalPhotos: 0, citiesWithPhotos: 0 }
        }
    }

    /**
     * 迁移legacy照片数据
     */
    const migrateLegacyPhoto = async(cityItem) => {
        try {
            return await photoService.migrateLegacyPhoto(cityItem)
        } catch (error) {
            return false
        }
    }

    return {
        // 状态
        uploading,
        uploadProgress,

        // 方法
        uploadCityPhoto,
        batchUploadPhotos,
        getCityPhotos,
        getUserPhotos,
        updatePhoto,
        deletePhoto,
        batchDeletePhotos,
        setCoverPhoto,
        updatePhotoOrder,
        getPhotoById,
        getPhotoStats,
        migrateLegacyPhoto,
    }
}
