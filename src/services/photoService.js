/**
 * 照片管理业务服务
 * 处理城市照片相关的业务逻辑和数据转换
 */
import { cityPhotosApi } from '@/api/cityPhotos.js'
import { weatherApi } from '@/api/weather.js'
import { ElMessage } from 'element-plus'

class PhotoService {
    constructor() {
        this.uploadConfig = {
            maxFileSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        }
    }

    /**
     * 上传城市照片
     */
    async uploadCityPhoto(
        file,
        cityCode,
        cityName,
        caption = "",
        tags = [],
        travelTime = null,
        travelFeeling = "",
        citycode = null
    ) {
        try {
            // 验证文件
            const validation = this._validateImageFile(file)
            if (!validation.valid) {
                console.error("❌ 文件验证失败:", validation.error)
                ElMessage.error(validation.error)
                return null
            }

            // 压缩图片
            const compressedFile = await this._compressImage(file)

            // 上传照片
            const response = await cityPhotosApi.uploadPhoto({
                file: compressedFile,
                cityCode,
                citycode,
                cityName,
                caption,
                tags,
                travelTime,
                travelFeeling
            })

            if (response.data) {
                ElMessage.success("照片上传成功")
                return response.data
            } else {
                throw new Error("服务器响应异常")
            }
        } catch (error) {
            console.error("❌ 照片上传失败:", {
                error: error.message,
                stack: error.stack,
                fileName: file.name
            })

            this._handleUploadError(error)
            return null
        }
    }

    /**
     * 批量上传照片
     */
    async batchUploadPhotos(files, cityCode, cityName, options = {}) {
        const results = []
        let successCount = 0
        let failedCount = 0

        for (let i = 0; i < files.length; i++) {
            const file = files[i]

            try {
                const result = await this.uploadCityPhoto(
                    file,
                    cityCode,
                    cityName,
                    options.caption || `照片 ${i + 1}`,
                    options.tags || [],
                    options.travelTime || null,
                    options.travelFeeling || ""
                )

                if (result) {
                    results.push({ file: file.name, success: true, data: result })
                    successCount++
                } else {
                    results.push({ file: file.name, success: false, error: "上传失败" })
                    failedCount++
                }

                // 调用进度回调
                if (options.onProgress) {
                    options.onProgress({
                        current: i + 1,
                        total: files.length,
                        currentFile: file.name,
                        success: successCount,
                        failed: failedCount,
                    })
                }
            } catch (error) {
                console.error(`上传文件 ${file.name} 失败:`, error)
                results.push({ file: file.name, success: false, error: error.message })
                failedCount++
            }
        }

        const message = `批量上传完成：成功 ${successCount} 张，失败 ${failedCount} 张`
        if (successCount > 0 && failedCount === 0) {
            ElMessage.success(message)
        } else if (successCount > 0) {
            ElMessage.warning(message)
        } else {
            ElMessage.error(message)
        }

        return { success: successCount, failed: failedCount, results }
    }

    /**
     * 获取城市照片列表
     */
    async getCityPhotos(cityCode, bustCache = false) {
        try {
            const response = await cityPhotosApi.getCityPhotos(cityCode, bustCache)
            const cityData = response.data || null

            // 返回数组格式以保持兼容性
            return cityData ? [cityData] : []
        } catch (error) {
            console.error("❌ 获取城市照片失败:", {
                cityCode,
                error: error.response ? .data ? .message || error.message,
                status: error.response ? .status,
                statusText: error.response ? .statusText
            })

            return this._handlePhotoError(error)
        }
    }

    /**
     * 获取用户所有照片
     */
    async getUserPhotos() {
        try {
            const response = await cityPhotosApi.getUserPhotos()
            return response.data || []
        } catch (error) {
            console.error("❌ 获取用户照片失败:", error)
            return []
        }
    }

    /**
     * 更新照片信息
     */
    async updatePhoto(photoId, caption, tags = []) {
        try {
            const response = await cityPhotosApi.updatePhoto(photoId, {
                caption,
                tags,
            })

            if (response.data) {
                ElMessage.success("照片信息更新成功")
                return response.data
            } else {
                throw new Error("更新失败")
            }
        } catch (error) {
            console.error("❌ 更新照片失败:", error)
            ElMessage.error("更新照片失败，请重试")
            return false
        }
    }

    /**
     * 删除照片
     */
    async deletePhoto(photoId) {
        try {
            const response = await cityPhotosApi.deletePhoto(photoId)

            if (response.success !== false) {
                ElMessage.success("照片删除成功")
                return true
            } else {
                throw new Error("删除失败")
            }
        } catch (error) {
            console.error("❌ 删除照片失败:", error)
            ElMessage.error("删除照片失败，请重试")
            return false
        }
    }

    /**
     * 批量删除照片
     */
    async batchDeletePhotos(photoIds) {
        try {
            const response = await cityPhotosApi.batchDeletePhotos(photoIds)
            const deletedCount = response.data || 0

            ElMessage.success(`成功删除 ${deletedCount} 张照片`)
            return deletedCount
        } catch (error) {
            console.error("❌ 批量删除照片失败:", error)
            ElMessage.error("批量删除失败，请重试")
            return 0
        }
    }

    /**
     * 设置封面照片
     */
    async setCoverPhoto(photoId) {
        try {
            const response = await cityPhotosApi.setCoverPhoto(photoId)

            if (response.success !== false) {
                ElMessage.success("封面设置成功")
                return true
            } else {
                throw new Error("设置封面失败")
            }
        } catch (error) {
            console.error("❌ 设置封面失败:", error)
            ElMessage.error("设置封面失败，请重试")
            return false
        }
    }

    /**
     * 更新照片排序
     */
    async updatePhotoOrder(photoIds) {
        try {
            const response = await cityPhotosApi.updatePhotoOrder(photoIds)

            if (response.success !== false) {
                ElMessage.success("照片排序更新成功")
                return true
            } else {
                throw new Error("更新排序失败")
            }
        } catch (error) {
            console.error("❌ 更新照片排序失败:", error)
            ElMessage.error("更新排序失败，请重试")
            return false
        }
    }

    /**
     * 根据ID获取照片详情
     */
    async getPhotoById(photoId) {
        try {
            const response = await cityPhotosApi.getPhotoById(photoId)
            return response.data || null
        } catch (error) {
            console.error("❌ 获取照片详情失败:", error)
            return null
        }
    }

    /**
     * 获取照片统计信息
     */
    async getPhotoStats() {
        try {
            const response = await cityPhotosApi.getPhotoStats()
            return response.data || { totalPhotos: 0, citiesWithPhotos: 0 }
        } catch (error) {
            console.error("❌ 获取照片统计失败:", error)
            return { totalPhotos: 0, citiesWithPhotos: 0 }
        }
    }

    /**
     * 迁移legacy照片数据
     */
    async migrateLegacyPhoto(cityItem) {
        if (!cityItem.photo) {
            return false // 没有legacy照片需要迁移
        }

        try {
            // 检查是否已经有新格式的照片
            const cityCode = await weatherApi.getCityCode(cityItem.cityName)
            const existingPhotos = await this.getCityPhotos(cityCode)
            if (existingPhotos.length > 0) {
                return false // 已经有新照片了，不需要迁移
            }

            ElMessage.info(
                `检测到 ${cityItem.cityName} 有旧格式照片，建议重新上传以获得更好的功能`
            )

            return true
        } catch (error) {
            console.error("❌ 迁移legacy照片失败:", error)
            return false
        }
    }

    /**
     * 私有方法
     */

    /**
     * 验证图片文件
     */
    _validateImageFile(file) {
        if (!file) {
            return { valid: false, error: '请选择文件' }
        }

        if (file.size > this.uploadConfig.maxFileSize) {
            return { valid: false, error: '文件大小不能超过10MB' }
        }

        if (!this.uploadConfig.allowedTypes.includes(file.type)) {
            return { valid: false, error: '只支持JPG、PNG、GIF、WebP格式的图片' }
        }

        return { valid: true }
    }

    /**
     * 压缩图片
     */
    async _compressImage(file) {
        // 使用API中的压缩方法
        return await cityPhotosApi.compressImage(file)
    }

    /**
     * 处理上传错误
     */
    _handleUploadError(error) {
        if (error.response) {
            console.error("❌ 服务器错误响应:", error.response)
            ElMessage.error(`照片上传失败: ${error.response.data?.message || '服务器错误'}`)
        } else if (error.request) {
            console.error("❌ 网络请求失败:", error.request)
            ElMessage.error("照片上传失败: 网络连接异常")
        } else {
            ElMessage.error("照片上传失败，请重试")
        }
    }

    /**
     * 处理照片获取错误
     */
    _handlePhotoError(error) {
        // 详细错误处理 - 针对400错误特殊处理
        if (error.response ? .status === 400) {
            console.warn("⚠️ 400错误，可能是参数问题或数据暂未同步")
            return []
        } else if (error.response ? .status === 401) {
            console.error("❌ 认证失败，需要重新登录")
            ElMessage.error("认证失败，请重新登录")
            return []
        } else if (error.response ? .status >= 500) {
            console.error("❌ 服务器内部错误")
            throw error
        } else if (error.request) {
            console.error("❌ 网络请求失败:", error.request)
            throw error
        }

        return []
    }
}

export const photoService = new PhotoService()