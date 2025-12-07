/**
 * 阿里云OSS上传工具
 * 用于处理头像和其他文件的上传
 */

import OSS from "ali-oss";

// 尝试导入配置文件，如果不存在则使用默认配置
let OSS_CONFIG = {
  region: "",
  bucket: "",
  accessKeyId: "",
  accessKeySecret: "",
  endpoint: "",
  secure: true,
  timeout: 60000,
};

let UPLOAD_CONFIG = {
  avatar: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/gif"],
    folder: "avatars/",
    compression: {
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
    },
  },
  trip: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png"],
    folder: "trips/",
    compression: {
      quality: 0.85,
      maxWidth: 1920,
      maxHeight: 1080,
    },
  },
};

// 尝试加载配置文件
let configLoaded = false;

const loadConfig = async () => {
  try {
    const configModule = await import("@/config/oss.config.js");
    if (configModule.OSS_CONFIG) {
      OSS_CONFIG = { ...OSS_CONFIG, ...configModule.OSS_CONFIG };
    }
    if (configModule.UPLOAD_CONFIG) {
      UPLOAD_CONFIG = { ...UPLOAD_CONFIG, ...configModule.UPLOAD_CONFIG };
    }
    configLoaded = true;
    console.log("✅ OSS配置文件加载成功", OSS_CONFIG);
  } catch (error) {
    console.warn(
      "⚠️ 未检测到OSS配置，已禁用直传模式（头像/图片请走后端上传接口）",
    );
    configLoaded = true; // 即使失败也标记为已加载，避免无限等待
  }
};

// 立即加载配置
loadConfig();

class OSSUploader {
  constructor() {
    this.client = null;
    // 延迟初始化，等待配置加载完成
    this.ensureInitialized();
  }

  /**
   * 确保OSS客户端已初始化
   */
  async ensureInitialized() {
    // 等待配置加载完成
    while (!configLoaded) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (!this.client) {
      this.initClient();
    }
  }

  /**
   * 初始化OSS客户端
   */
  initClient() {
    try {
      // 检查配置是否完整
      if (!OSS_CONFIG.region || !OSS_CONFIG.bucket || !OSS_CONFIG.accessKeyId) {
        console.warn("OSS配置不完整，请在 ossUpload.js 中配置相关信息");
        return;
      }

      this.client = new OSS({
        region: OSS_CONFIG.region,
        bucket: OSS_CONFIG.bucket,
        accessKeyId: OSS_CONFIG.accessKeyId,
        accessKeySecret: OSS_CONFIG.accessKeySecret,
        endpoint: OSS_CONFIG.endpoint,
        secure: OSS_CONFIG.secure,
        timeout: OSS_CONFIG.timeout,
      });

      console.log("✅ OSS客户端初始化成功");
    } catch (error) {
      console.error("❌ OSS客户端初始化失败:", error);
    }
  }

  /**
   * 检查OSS是否可用
   */
  isAvailable() {
    return this.client !== null;
  }

  /**
   * 生成唯一文件名
   * @param {string} originalName - 原始文件名
   * @param {string} prefix - 文件前缀
   * @returns {string} 新的文件名
   */
  generateFileName(originalName, prefix = "") {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split(".").pop();
    return `${prefix}${timestamp}_${randomStr}.${extension}`;
  }

  /**
   * 压缩图片
   * @param {File} file - 原始文件
   * @param {Object} options - 压缩选项
   * @returns {Promise<Blob>} 压缩后的文件
   */
  async compressImage(file, options = {}) {
    const { quality = 0.8, maxWidth = 800, maxHeight = 800 } = options;

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

        canvas.toBlob(resolve, "image/jpeg", quality);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 验证文件
   * @param {File} file - 要验证的文件
   * @param {string} type - 文件类型 ('avatar' | 'trip')
   * @returns {Object} 验证结果
   */
  validateFile(file, type = "avatar") {
    const config = UPLOAD_CONFIG[type];
    const result = { valid: true, errors: [] };

    if (!config) {
      result.valid = false;
      result.errors.push("不支持的文件类型配置");
      return result;
    }

    // 检查文件大小
    if (file.size > config.maxSize) {
      result.valid = false;
      result.errors.push(
        `文件大小超过限制 (${Math.round(config.maxSize / 1024 / 1024)}MB)`,
      );
    }

    // 检查文件类型
    if (!config.allowedTypes.includes(file.type)) {
      result.valid = false;
      result.errors.push(
        `不支持的文件格式，请选择 ${config.allowedTypes.join(", ")} 格式的文件`,
      );
    }

    return result;
  }

  /**
   * 上传文件到OSS
   * @param {File} file - 要上传的文件
   * @param {string} type - 文件类型 ('avatar' | 'trip')
   * @param {Object} options - 上传选项
   * @returns {Promise<Object>} 上传结果
   */
  async uploadFile(file, type = "avatar", options = {}) {
    try {
      // 确保客户端已初始化
      await this.ensureInitialized();

      if (!this.isAvailable()) {
        throw new Error("OSS服务不可用，请检查配置");
      }

      // 验证文件
      const validation = this.validateFile(file, type);
      if (!validation.valid) {
        throw new Error(validation.errors.join("; "));
      }

      const config = UPLOAD_CONFIG[type];
      let fileToUpload = file;

      // 如果是图片，进行压缩
      if (file.type.startsWith("image/") && config.compression) {
        console.log("🗜️ 正在压缩图片...");
        fileToUpload = await this.compressImage(file, config.compression);
      }

      // 生成文件名
      const fileName =
        config.folder + this.generateFileName(file.name, options.prefix || "");

      // 上传进度回调
      const progressCallback =
        options.onProgress ||
        ((p) => {
          console.log(`📤 上传进度: ${Math.round(p * 100)}%`);
        });

      // 执行上传
      console.log("📤 开始上传到OSS:", fileName);
      const result = await this.client.put(fileName, fileToUpload, {
        progress: progressCallback,
        headers: {
          "x-oss-storage-class": "Standard",
          "x-oss-object-acl": "private", // 私有访问
        },
      });

      console.log("✅ 文件上传成功:", result.name);

      // 生成访问URL（带签名）
      const signedUrl = await this.getSignedUrl(result.name, 7 * 24 * 60 * 60); // 7天有效期

      return {
        success: true,
        fileName: result.name,
        url: result.url,
        signedUrl: signedUrl,
        size: fileToUpload.size || file.size,
        type: file.type,
      };
    } catch (error) {
      console.error("❌ 文件上传失败:", error);
      return {
        success: false,
        error: error.message || "上传失败",
      };
    }
  }

  /**
   * 获取签名URL（用于私有文件访问）
   * @param {string} fileName - 文件名
   * @param {number} expires - 过期时间（秒）
   * @returns {Promise<string>} 签名URL
   */
  async getSignedUrl(fileName, expires = 3600) {
    try {
      // 确保客户端已初始化
      await this.ensureInitialized();

      if (!this.isAvailable()) {
        throw new Error("OSS服务不可用");
      }

      const url = this.client.signatureUrl(fileName, { expires });
      return url;
    } catch (error) {
      console.error("❌ 获取签名URL失败:", error);
      throw error;
    }
  }

  /**
   * 删除文件
   * @param {string} fileName - 要删除的文件名
   * @returns {Promise<boolean>} 删除结果
   */
  async deleteFile(fileName) {
    try {
      // 确保客户端已初始化
      await this.ensureInitialized();

      if (!this.isAvailable()) {
        throw new Error("OSS服务不可用");
      }

      await this.client.delete(fileName);
      console.log("🗑️ 文件删除成功:", fileName);
      return true;
    } catch (error) {
      console.error("❌ 文件删除失败:", error);
      return false;
    }
  }

  /**
   * 批量上传文件
   * @param {Array<File>} files - 文件列表
   * @param {string} type - 文件类型
   * @param {Object} options - 选项
   * @returns {Promise<Array>} 上传结果列表
   */
  async uploadMultiple(files, type = "trip", options = {}) {
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`📤 上传文件 ${i + 1}/${files.length}: ${file.name}`);

      const result = await this.uploadFile(file, type, {
        ...options,
        onProgress: (progress) => {
          if (options.onProgress) {
            options.onProgress(i, progress, files.length);
          }
        },
      });

      results.push(result);
    }

    return results;
  }
}

// 创建单例实例
export const ossUploader = new OSSUploader();

// 便捷方法
export const uploadAvatar = (file, options = {}) => {
  return ossUploader.uploadFile(file, "avatar", options);
};

export const uploadTripImages = (files, options = {}) => {
  if (Array.isArray(files)) {
    return ossUploader.uploadMultiple(files, "trip", options);
  }
  return ossUploader.uploadFile(files, "trip", options);
};

export default ossUploader;
