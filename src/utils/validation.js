/**
 * 统一表单验证工具
 * 提供常用的验证规则和函数
 */

/**
 * 手机号验证
 * @param {string} phone - 手机号
 * @returns {boolean} - 是否有效
 */
export function validatePhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
}

/**
 * 邮箱验证
 * @param {string} email - 邮箱
 * @returns {boolean} - 是否有效
 */
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * 密码强度验证
 * @param {string} password - 密码
 * @returns {Object} - 验证结果
 */
export function validatePassword(password) {
    const result = {
        valid: false,
        strength: 'weak',
        errors: []
    };

    if (!password) {
        result.errors.push('密码不能为空');
        return result;
    }

    if (password.length < 6) {
        result.errors.push('密码至少6位');
    }

    if (password.length > 20) {
        result.errors.push('密码不能超过20位');
    }

    // 计算强度
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (score >= 4) result.strength = 'strong';
    else if (score >= 2) result.strength = 'medium';

    result.valid = result.errors.length === 0;
    return result;
}

/**
 * 验证码验证
 * @param {string} code - 验证码
 * @returns {boolean} - 是否有效
 */
export function validateVerificationCode(code) {
    return /^\d{6}$/.test(code);
}

/**
 * 昵称验证
 * @param {string} nickname - 昵称
 * @returns {Object} - 验证结果
 */
export function validateNickname(nickname) {
    const result = {
        valid: false,
        errors: []
    };

    if (!nickname || !nickname.trim()) {
        result.errors.push('昵称不能为空');
        return result;
    }

    const trimmedNickname = nickname.trim();

    if (trimmedNickname.length < 2) {
        result.errors.push('昵称至少2个字符');
    }

    if (trimmedNickname.length > 20) {
        result.errors.push('昵称不能超过20个字符');
    }

    // 检查特殊字符
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9_-]+$/.test(trimmedNickname)) {
        result.errors.push('昵称只能包含中文、英文、数字、下划线和连字符');
    }

    result.valid = result.errors.length === 0;
    return result;
}

/**
 * 行程天数验证
 * @param {number} days - 天数
 * @returns {Object} - 验证结果
 */
export function validateTripDays(days) {
    const result = {
        valid: false,
        errors: []
    };

    if (!days || days <= 0) {
        result.errors.push('行程天数必须大于0');
        return result;
    }

    if (days > 30) {
        result.errors.push('行程天数不能超过30天');
    }

    result.valid = result.errors.length === 0;
    return result;
}

/**
 * 出行人数验证
 * @param {number} travelers - 人数
 * @returns {Object} - 验证结果
 */
export function validateTravelers(travelers) {
    const result = {
        valid: false,
        errors: []
    };

    if (!travelers || travelers <= 0) {
        result.errors.push('出行人数必须大于0');
        return result;
    }

    if (travelers > 20) {
        result.errors.push('出行人数不能超过20人');
    }

    result.valid = result.errors.length === 0;
    return result;
}

/**
 * 预算验证
 * @param {number} budget - 预算
 * @returns {Object} - 验证结果
 */
export function validateBudget(budget) {
    const result = {
        valid: false,
        errors: []
    };

    if (!budget || budget <= 0) {
        result.errors.push('预算必须大于0');
        return result;
    }

    if (budget > 1000000) {
        result.errors.push('预算不能超过100万');
    }

    result.valid = result.errors.length === 0;
    return result;
}

/**
 * 日期范围验证
 * @param {Date} startDate - 开始日期
 * @param {Date} endDate - 结束日期
 * @returns {Object} - 验证结果
 */
export function validateDateRange(startDate, endDate) {
    const result = {
        valid: false,
        errors: []
    };

    if (!startDate || !endDate) {
        result.errors.push('请选择完整的日期范围');
        return result;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
        result.errors.push('开始日期不能早于今天');
    }

    if (end <= start) {
        result.errors.push('结束日期必须晚于开始日期');
    }

    // 检查日期范围是否合理（不超过1年）
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
        result.errors.push('行程时间不能超过1年');
    }

    result.valid = result.errors.length === 0;
    return result;
}

/**
 * Element Plus 表单验证规则生成器
 */
export const formRules = {
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (validatePhone(value)) {
                    callback();
                } else {
                    callback(new Error('请输入正确的手机号'));
                }
            },
            trigger: 'blur'
        }
    ],

    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (validateEmail(value)) {
                    callback();
                } else {
                    callback(new Error('请输入正确的邮箱格式'));
                }
            },
            trigger: 'blur'
        }
    ],

    verificationCode: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (validateVerificationCode(value)) {
                    callback();
                } else {
                    callback(new Error('请输入6位数字验证码'));
                }
            },
            trigger: 'blur'
        }
    ],

    nickname: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                const result = validateNickname(value);
                if (result.valid) {
                    callback();
                } else {
                    callback(new Error(result.errors[0]));
                }
            },
            trigger: 'blur'
        }
    ],

    tripDays: [
        { required: true, message: '请选择行程天数', trigger: 'change' },
        {
            validator: (rule, value, callback) => {
                const result = validateTripDays(value);
                if (result.valid) {
                    callback();
                } else {
                    callback(new Error(result.errors[0]));
                }
            },
            trigger: 'change'
        }
    ],

    travelers: [
        { required: true, message: '请输入出行人数', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                const result = validateTravelers(value);
                if (result.valid) {
                    callback();
                } else {
                    callback(new Error(result.errors[0]));
                }
            },
            trigger: 'blur'
        }
    ],

    budget: [
        { required: true, message: '请输入预算', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                const result = validateBudget(value);
                if (result.valid) {
                    callback();
                } else {
                    callback(new Error(result.errors[0]));
                }
            },
            trigger: 'blur'
        }
    ]
};