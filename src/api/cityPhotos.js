/**
 * 城市照片相关API接口
 */
import { http } from "./request.js";

export const cityPhotosApi = {
  /**
   * 上传城市照片
   * @param {Object} uploadData - 上传数据
   * @param {File} uploadData.file - 图片文件
   * @param {number} uploadData.wishlistItemId - 愿望清单项ID
   * @param {string} uploadData.caption - 照片描述（可选）
   * @param {Array<string>} uploadData.tags - 照片标签（可选）
   * @returns {Promise} 上传结果
   */
  uploadPhoto(uploadData) {
    const formData = new FormData();
    formData.append("file", uploadData.file);
    formData.append("wishlistItemId", uploadData.wishlistItemId);

    if (uploadData.caption) {
      formData.append("caption", uploadData.caption);
    }

    if (uploadData.tags && uploadData.tags.length > 0) {
      formData.append("tags", uploadData.tags.join(","));
    }

    return http.post("/city-photos/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * 获取指定城市的照片列表
   * @param {number} wishlistItemId - 愿望清单项ID
   * @param {boolean} bustCache - 是否破坏缓存
   * @returns {Promise} 照片列表
   */
  getCityPhotos(wishlistItemId, bustCache = false) {
    const url = `/city-photos/city/${wishlistItemId}`;
    const params = bustCache ? { t: Date.now() } : {};
    return http.get(url, { params });
  },

  /**
   * 获取用户的所有照片
   * @returns {Promise} 用户照片列表
   */
  getUserPhotos() {
    return http.get("/city-photos/user");
  },

  /**
   * 获取照片详情
   * @param {number} photoId - 照片ID
   * @returns {Promise} 照片详情
   */
  getPhotoById(photoId) {
    return http.get(`/city-photos/${photoId}`);
  },

  /**
   * 更新照片信息
   * @param {number} photoId - 照片ID
   * @param {Object} updateData - 更新数据
   * @param {string} updateData.caption - 照片描述
   * @param {Array<string>} updateData.tags - 照片标签
   * @returns {Promise} 更新结果
   */
  updatePhoto(photoId, updateData) {
    const formData = new FormData();

    if (updateData.caption !== undefined) {
      formData.append("caption", updateData.caption);
    }

    if (updateData.tags && updateData.tags.length > 0) {
      formData.append("tags", updateData.tags.join(","));
    }

    return http.put(`/city-photos/${photoId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * 删除照片
   * @param {number} photoId - 照片ID
   * @returns {Promise} 删除结果
   */
  deletePhoto(photoId) {
    return http.delete(`/city-photos/${photoId}`);
  },

  /**
   * 设置封面照片
   * @param {number} photoId - 照片ID
   * @returns {Promise} 设置结果
   */
  setCoverPhoto(photoId) {
    return http.post(`/city-photos/${photoId}/set-cover`);
  },

  /**
   * 更新照片排序
   * @param {Array<number>} photoIds - 照片ID数组（按新顺序排列）
   * @returns {Promise} 更新结果
   */
  updatePhotoOrder(photoIds) {
    return http.put("/city-photos/reorder", {
      photoIds,
    });
  },

  /**
   * 批量删除照片
   * @param {Array<number>} photoIds - 照片ID数组
   * @returns {Promise} 删除结果
   */
  batchDeletePhotos(photoIds) {
    return http.delete("/city-photos/batch", {
      data: { photoIds },
    });
  },

  /**
   * 获取照片统计信息
   * @returns {Promise} 统计信息
   */
  getPhotoStats() {
    return http.get("/city-photos/stats");
  },

  /**
   * 压缩图片文件（客户端压缩）
   * @param {File} file - 原始图片文件
   * @param {number} maxWidth - 最大宽度
   * @param {number} maxHeight - 最大高度
   * @param {number} quality - 压缩质量 (0-1)
   * @returns {Promise<File>} 压缩后的文件
   */
  compressImage(file, maxWidth = 1200, maxHeight = 800, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // 计算新尺寸
        let { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxHeight / height);

        if (ratio < 1) {
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // 绘制并压缩
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error("图片压缩失败"));
            }
          },
          "image/jpeg",
          quality,
        );
      };

      img.onerror = () => reject(new Error("图片加载失败"));
      img.src = URL.createObjectURL(file);
    });
  },

  /**
   * 验证文件是否为有效的图片
   * @param {File} file - 文件对象
   * @returns {Object} 验证结果 { valid: boolean, error?: string }
   */
  validateImageFile(file) {
    // 检查文件是否存在
    if (!file) {
      return { valid: false, error: "请选择文件" };
    }

    // 检查文件大小 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: "文件大小不能超过10MB" };
    }

    // 检查文件类型
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return {
        valid: false,
        error: "只支持 JPG、PNG、GIF 格式的图片",
      };
    }

    return { valid: true };
  },

  /**
   * 获取图片的基本信息
   * @param {File} file - 图片文件
   * @returns {Promise<Object>} 图片信息 { width, height, size }
   */
  getImageInfo(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type,
          name: file.name,
        });
      };

      img.onerror = () => reject(new Error("无法读取图片信息"));
      img.src = URL.createObjectURL(file);
    });
  },
};
