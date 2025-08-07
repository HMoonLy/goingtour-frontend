/**
 * 头像生成器工具
 * 用于生成默认头像和个性化头像
 */

// 默认头像配色方案
export const avatarThemes = [{
        name: '经典蓝',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff'
    },
    {
        name: '温暖橙',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: '#ffffff'
    },
    {
        name: '清新绿',
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        color: '#ffffff'
    },
    {
        name: '优雅紫',
        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        color: '#333333'
    },
    {
        name: '活力红',
        background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        color: '#333333'
    },
    {
        name: '深邃黑',
        background: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
        color: '#ffffff'
    },
    {
        name: '森林绿',
        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        color: '#ffffff'
    },
    {
        name: '日落黄',
        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        color: '#ffffff'
    }
];

/**
 * 根据用户名生成头像颜色
 * @param {string} name - 用户名
 * @returns {object} 包含背景色和文字颜色的对象
 */
export function generateAvatarColor(name) {
    if (!name) return avatarThemes[0];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return avatarThemes[Math.abs(hash) % avatarThemes.length];
}

/**
 * 获取用户名的首字母
 * @param {string} name - 用户名
 * @returns {string} 首字母缩写
 */
export function getInitials(name) {
    if (!name) return 'U';

    const trimmedName = name.trim();
    const names = trimmedName.split(' ');

    if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
    }

    // 对于中文名字，取前两个字符
    if (trimmedName.length >= 2) {
        return trimmedName.substring(0, 2).toUpperCase();
    }

    return trimmedName.substring(0, 1).toUpperCase();
}

/**
 * 生成头像的Canvas DataURL
 * @param {string} name - 用户名
 * @param {number} size - 头像大小
 * @param {object} theme - 主题配色（可选）
 * @returns {string} Base64格式的图片数据
 */
export function generateAvatarDataURL(name, size = 200, theme = null) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = size;
    canvas.height = size;

    // 使用指定主题或根据用户名生成
    const avatarTheme = theme || generateAvatarColor(name);

    // 解析渐变色
    const gradientMatch = avatarTheme.background.match(/linear-gradient\(([^)]+)\)/);
    if (gradientMatch) {
        const gradientStr = gradientMatch[1];
        const colorMatches = gradientStr.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|\b\w+\b/g);

        if (colorMatches && colorMatches.length >= 2) {
            // 创建线性渐变
            const gradient = ctx.createLinearGradient(0, 0, size, size);
            gradient.addColorStop(0, colorMatches[0]);
            gradient.addColorStop(1, colorMatches[1]);
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = '#667eea'; // 默认颜色
        }
    } else {
        ctx.fillStyle = avatarTheme.background;
    }

    // 绘制背景
    ctx.fillRect(0, 0, size, size);

    // 绘制文字
    ctx.fillStyle = avatarTheme.color;
    ctx.font = `bold ${Math.floor(size * 0.4)}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const initials = getInitials(name);
    ctx.fillText(initials, size / 2, size / 2);

    return canvas.toDataURL('image/png');
}

/**
 * 压缩图片文件
 * @param {File} file - 图片文件
 * @param {number} maxWidth - 最大宽度
 * @param {number} maxHeight - 最大高度
 * @param {number} quality - 压缩质量 (0-1)
 * @returns {Promise<string>} 压缩后的Base64数据
 */
export function compressImage(file, maxWidth = 400, maxHeight = 400, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // 计算缩放比例
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

            const compressedDataURL = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataURL);
        };

        img.onerror = () => {
            reject(new Error('图片加载失败'));
        };

        img.src = URL.createObjectURL(file);
    });
}

/**
 * 裁剪图片为正方形
 * @param {string} dataURL - 图片的Base64数据
 * @param {number} size - 输出尺寸
 * @returns {Promise<string>} 裁剪后的Base64数据
 */
export function cropToSquare(dataURL, size = 200) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            const { width, height } = img;
            const minDimension = Math.min(width, height);

            // 计算裁剪区域
            const startX = (width - minDimension) / 2;
            const startY = (height - minDimension) / 2;

            canvas.width = size;
            canvas.height = size;

            // 裁剪并缩放到指定尺寸
            ctx.drawImage(
                img,
                startX, startY, minDimension, minDimension,
                0, 0, size, size
            );

            const croppedDataURL = canvas.toDataURL('image/png');
            resolve(croppedDataURL);
        };

        img.onerror = () => {
            reject(new Error('图片处理失败'));
        };

        img.src = dataURL;
    });
}

/**
 * 验证图片文件
 * @param {File} file - 图片文件
 * @returns {object} 验证结果
 */
export function validateImageFile(file) {
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

    const result = {
        valid: true,
        errors: []
    };

    // 检查文件类型
    if (!allowedTypes.includes(file.type)) {
        result.valid = false;
        result.errors.push('文件格式不支持，请选择 JPG、PNG 或 GIF 格式的图片');
    }

    // 检查文件大小
    if (file.size > maxSize) {
        result.valid = false;
        result.errors.push('文件大小不能超过 2MB');
    }

    return result;
}

// 默认导出
export default {
    avatarThemes,
    generateAvatarColor,
    getInitials,
    generateAvatarDataURL,
    compressImage,
    cropToSquare,
    validateImageFile
};