export const OSS_CONFIG = {
    region: 'oss-cn-beijing', 
    bucket: 'goingtour',
    accessKeyId: 'LTAI5tFQMaispGMUDwNSJqzs', 
    accessKeySecret: 'RMjRUcpAUFQlfPNnXxXwcIauuPxos5',
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
            maxHeight: 800 
        }
    },

    trip: {
        maxSize: 10 * 1024 * 1024, 
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
        folder: 'trips/',
        compression: {
            quality: 0.85,
            maxWidth: 1920,
            maxHeight: 1080
        }
    }
};
