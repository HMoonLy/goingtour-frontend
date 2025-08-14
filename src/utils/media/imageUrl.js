/**
 * 图片URL规范化工具
 * 统一处理头像、城市照片等图片资源的URL生成
 */

/**
 * 规范化图片URL
 * @param {string} path - 图片路径
 * @returns {string} 可访问的完整URL
 */
export function normalizeImageUrl(path) {
    if (!path) {
        return '';
    }

    // 如果是完整的HTTP/HTTPS URL或data URI，直接返回
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
        return path;
    }

    // 确保路径以 / 开头
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // 本地存储路径：以 /uploads/ 开头，使用 API 基础URL
    if (normalizedPath.startsWith('/uploads/')) {
        const apiBase =
            import.meta.env.VITE_API_BASE_URL || '/api';
        return `${apiBase}${normalizedPath}`;
    }

    // OSS 存储路径：以 /avatars/、/city-photos/ 等开头，使用 OSS 公共域名
    if (normalizedPath.startsWith('/avatars/') ||
        normalizedPath.startsWith('/city-photos/') ||
        normalizedPath.startsWith('/city-photos/thumbnails/')) {
        const ossDomain =
            import.meta.env.VITE_OSS_PUBLIC_DOMAIN;
        if (ossDomain) {
            return `${ossDomain}${normalizedPath}`;
        } else {
            console.warn('OSS路径但未配置VITE_OSS_PUBLIC_DOMAIN:', normalizedPath);
            return normalizedPath; // 返回原路径作为兜底
        }
    }

    // 其他情况直接返回原路径
    return normalizedPath;
}

/**
 * 获取有效的头像访问URL
 * @param {string} avatar - 头像字段值
 * @param {number} userId - 用户ID（保留参数兼容性）
 * @returns {string} 可访问的头像URL
 */
export function getAvatarUrl(avatar, userId = null) {
    return normalizeImageUrl(avatar);
}

/**
 * 获取城市照片访问URL
 * @param {string} photoUrl - 照片路径
 * @returns {string} 可访问的照片URL
 */
export function getCityPhotoUrl(photoUrl) {
    return normalizeImageUrl(photoUrl);
}

/**
 * 获取城市照片缩略图访问URL
 * @param {string} thumbnailUrl - 缩略图路径
 * @returns {string} 可访问的缩略图URL
 */
export function getCityThumbnailUrl(thumbnailUrl) {
    return normalizeImageUrl(thumbnailUrl);
}

/**
 * 判断图片是否为OSS存储
 * @param {string} imagePath - 图片路径
 * @returns {boolean}
 */
export function isOSSImage(imagePath) {
    if (!imagePath) return false;

    // 检查是否为OSS完整URL
    if (imagePath.startsWith('https://') && imagePath.includes('.aliyuncs.com')) {
        return true;
    }

    // 检查是否为OSS相对路径
    return imagePath.startsWith('/avatars/') ||
        imagePath.startsWith('/city-photos/') ||
        imagePath.startsWith('avatars/') ||
        imagePath.startsWith('city-photos/');
}

/**
 * 获取用户姓名的首字母（用于默认头像）
 * @param {string} name - 用户姓名
 * @returns {string} 首字母
 */
export function getInitials(name) {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
}