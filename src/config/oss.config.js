// ⚠️ 安全警告：不要在前端配置文件中存储OSS密钥！
// 前端直传OSS已被禁用，请使用后端代理上传
export const OSS_CONFIG = {
  region: '',
  bucket: '',
  accessKeyId: '',
  accessKeySecret: '',
  endpoint: '',
  secure: true,
  timeout: 60000,
};
export const UPLOAD_CONFIG = {
  avatar: {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    folder: 'avatars/',

    compression: {
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
    },
  },

  trip: {
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    folder: 'trips/',
    compression: {
      quality: 0.85,
      maxWidth: 1920,
      maxHeight: 1080,
    },
  },
};
