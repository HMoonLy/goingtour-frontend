/**
 * 去过的城市相关API接口
 */
import { http } from "./request.js";

export const cityPhotosApi = {
    /**
     * 上传城市照片
     * @param {Object} uploadData - 上传数据
     * @param {File} uploadData.file - 图片文件
     * @param {string} uploadData.cityCode - 城市编码
     * @param {string} uploadData.cityName - 城市名称
     * @param {string} uploadData.caption - 照片描述（可选）
     * @param {string} uploadData.travelTime - 旅行时间（YYYY-MM-DD格式，可选）
     * @param {string} uploadData.travelFeeling - 旅行感受（可选）
     * @param {Array<string>} uploadData.tags - 照片标签（可选）
     * @returns {Promise} 上传结果
     */
    uploadPhoto(uploadData) {
        const formData = new FormData();
        formData.append("file", uploadData.file);
        formData.append("cityCode", uploadData.cityCode);
        formData.append("cityName", uploadData.cityName);

        if (uploadData.caption) {
            formData.append("caption", uploadData.caption);
        }

        if (uploadData.travelTime) {
            formData.append("travelTime", uploadData.travelTime);
        }

        if (uploadData.travelFeeling) {
            formData.append("travelFeeling", uploadData.travelFeeling);
        }

        if (uploadData.tags && uploadData.tags.length > 0) {
            formData.append("tags", uploadData.tags.join(","));
        }

        return http.post("/visited-cities/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    /**
     * 添加去过的城市（不含照片）
     * @param {Object} cityData - 城市数据
     * @param {string} cityData.adcode - 城市行政区划代码
     * @param {string} cityData.citycode - 城市电话区号（可选）
     * @param {string} cityData.cityName - 城市名称
     * @param {string} cityData.travelTime - 旅行时间（YYYY-MM-DD格式，可选）
     * @param {string} cityData.travelFeeling - 旅行感受（可选）
     * @param {Array<string>} cityData.tags - 标签（可选）
     * @returns {Promise} 添加结果
     */
    addVisitedCity(cityData) {
        const formData = new FormData();
        formData.append("adcode", cityData.adcode);
        formData.append("cityName", cityData.cityName);

        if (cityData.citycode) {
            formData.append("citycode", cityData.citycode);
        }

        if (cityData.travelTime) {
            formData.append("travelTime", cityData.travelTime);
        }

        if (cityData.travelFeeling) {
            formData.append("travelFeeling", cityData.travelFeeling);
        }

        if (cityData.tags && cityData.tags.length > 0) {
            formData.append("tags", cityData.tags.join(","));
        }

        return http.post("/visited-cities/add", formData);
    },

    /**
     * 获取指定城市的记录
     * @param {string} cityCode - 城市编码
     * @param {boolean} bustCache - 是否破坏缓存
     * @returns {Promise} 城市记录
     */
    getCityPhotos(cityCode, bustCache = false) {
        const url = `/visited-cities/city/${cityCode}`;

        if (bustCache) {
            return http.get(url, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'X-Requested-At': Date.now().toString()
                },
                params: { _t: Date.now() }
            });
        } else {
            return http.get(url, { params: { _t: Date.now() } });
        }
    },

    /**
     * 获取用户的所有去过城市
     * @param {number} userId - 用户ID
     * @returns {Promise} 城市列表
     */
    getUserVisitedCities(userId) {
        return http.get(`/visited-cities/user/${userId}`);
    },

    /**
     * 更新城市信息
     * @param {number} cityId - 城市记录ID
     * @param {Object} updateData - 更新数据
     * @param {string} updateData.travelTime - 旅行时间（YYYY-MM-DD格式，可选）
     * @param {string} updateData.travelFeeling - 旅行感受（可选）
     * @param {Array<string>} updateData.tags - 标签（可选）
     * @returns {Promise} 更新结果
     */
    updateCityInfo(cityId, updateData) {
        const formData = new FormData();

        if (updateData.travelTime) {
            formData.append("travelTime", updateData.travelTime);
        }

        if (updateData.travelFeeling) {
            formData.append("travelFeeling", updateData.travelFeeling);
        }

        if (updateData.tags && updateData.tags.length > 0) {
            formData.append("tags", updateData.tags.join(","));
        }

        return http.put(`/visited-cities/${cityId}`, formData);
    },

    /**
     * 更新城市照片
     * @param {number} cityId - 城市记录ID
     * @param {File} file - 新照片文件
     * @param {string} caption - 照片描述（可选）
     * @returns {Promise} 更新结果
     */
    updateCityPhoto(cityId, file, caption) {
        const formData = new FormData();
        formData.append("file", file);

        if (caption) {
            formData.append("caption", caption);
        }

        return http.put(`/visited-cities/${cityId}/photo`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    /**
     * 删除城市记录
     * @param {number} cityId - 城市记录ID
     * @returns {Promise} 删除结果
     */
    deleteVisitedCity(cityId) {
        return http.delete(`/visited-cities/${cityId}`);
    },

    /**
     * 删除城市照片（保留城市记录）
     * @param {number} cityId - 城市记录ID
     * @returns {Promise} 删除结果
     */
    deletePhoto(cityId) {
        return http.delete(`/visited-cities/${cityId}/photo`);
    },

    /**
     * 获取城市统计信息
     * @returns {Promise} 统计信息
     */
    getCityStats() {
        return http.get("/visited-cities/stats");
    },

    // 文件验证辅助方法
    validateImageFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

        if (!file) {
            return { valid: false, error: '请选择文件' };
        }

        if (file.size > maxSize) {
            return { valid: false, error: '文件大小不能超过10MB' };
        }

        if (!allowedTypes.includes(file.type)) {
            return { valid: false, error: '只支持 JPG、PNG、GIF 格式的图片' };
        }

        return { valid: true };
    },

    // 图片压缩辅助方法
    compressImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // 计算新尺寸
                let { width, height } = img;
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // 绘制压缩后的图像
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error('图片压缩失败'));
                    }
                }, 'image/jpeg', quality);
            };

            img.onerror = () => reject(new Error('图片加载失败'));
            img.src = URL.createObjectURL(file);
        });
    }
};