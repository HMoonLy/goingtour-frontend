/**
 * 头像URL处理工具类
 * 现在使用统一的图片URL规范化工具
 */

import { getAvatarUrl as getAvatarUrlFromImageUtils, isOSSImage, getInitials as getInitialsFromImageUtils } from './imageUrl.js';

/**
 * 获取有效的头像访问URL
 * @param {string} avatar - 头像字段值
 * @param {number} userId - 用户ID（保留参数兼容性）
 * @returns {string} 可访问的头像URL
 */
export function getAvatarUrl(avatar, userId = null) {
    return getAvatarUrlFromImageUtils(avatar, userId);
}

/**
 * 判断头像是否为OSS存储
 * @param {string} avatar - 头像字段值
 * @returns {boolean}
 */
export function isOSSAvatar(avatar) {
    return isOSSImage(avatar);
}

/**
 * 获取用户姓名的首字母（用于默认头像）
 * @param {string} name - 用户姓名
 * @returns {string} 首字母
 */
export function getInitials(name) {
    return getInitialsFromImageUtils(name);
}