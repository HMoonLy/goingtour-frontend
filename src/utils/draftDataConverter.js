/**
 * 草稿数据格式转换工具
 * 统一处理前端组件数据和后端API数据格式的转换
 */

/**
 * 将前端表单数据转换为草稿保存格式
 * @param {Object} frontendData - 前端组件的数据
 * @returns {Object} 草稿保存格式的数据
 */
export function convertFrontendToDraft(frontendData) {
  const {
    baseForm = {},
    tripPreferenceForm = {},
    selectedAttractions = [],
    selectedRestaurants = [],
    currentStep = 0,
    extraRequirements = '',
    weatherSuggestion = null,
  } = frontendData;

  return {
    currentStep,
    isAuto: false,
    baseForm: cleanFormData(baseForm),
    preferenceForm: cleanFormData(tripPreferenceForm),
    selectedAttractions: selectedAttractions.map(cleanAttractionData),
    selectedRestaurants: selectedRestaurants.map(cleanRestaurantData),
    extraRequirements: extraRequirements || '',
    weatherSuggestion,
    version: '1.0',
  };
}

/**
 * 将草稿数据转换为前端组件数据格式
 * @param {Object} draftData - 草稿数据
 * @returns {Object} 前端组件期望的数据格式
 */
export function convertDraftToFrontend(draftData) {
  if (!draftData) return null;

  const {
    baseForm = {},
    preferenceForm = {},
    selectedAttractions = [],
    selectedRestaurants = [],
    currentStep = 0,
    extraRequirements = '',
    weatherSuggestion = null,
  } = draftData;

  return {
    // 基础表单数据
    baseForm: validateBaseForm(baseForm),

    // 偏好表单数据
    tripPreferenceForm: validatePreferenceForm(preferenceForm),

    // 选中的景点和餐厅
    selectedAttractions: selectedAttractions.filter(Boolean),
    selectedRestaurants: selectedRestaurants.filter(Boolean),

    // 步骤和其他信息
    currentStep,
    extraRequirements: extraRequirements || '',
    weatherSuggestion,

    // 元数据
    isFromDraft: true,
    draftId: draftData.id,
    draftName: draftData.name,
    lastModified: draftData.updatedAt,
  };
}

/**
 * 清理表单数据，移除空值和无效数据
 * @param {Object} formData - 表单数据
 * @returns {Object} 清理后的数据
 */
function cleanFormData(formData) {
  if (!formData || typeof formData !== 'object') {
    return {};
  }

  const cleaned = {};

  Object.entries(formData).forEach(([key, value]) => {
    // 跳过空值、undefined、null
    if (value === undefined || value === null || value === '') {
      return;
    }

    // 处理数组：移除空元素
    if (Array.isArray(value)) {
      const filteredArray = value.filter(
        item => item !== undefined && item !== null && item !== ''
      );
      if (filteredArray.length > 0) {
        cleaned[key] = filteredArray;
      }
    } else {
      cleaned[key] = value;
    }
  });

  return cleaned;
}

/**
 * 清理景点数据
 * @param {Object} attraction - 景点数据
 * @returns {Object} 清理后的景点数据
 */
function cleanAttractionData(attraction) {
  if (!attraction) return null;

  return {
    id: attraction.id,
    name: attraction.name,
    city: attraction.city,
    address: attraction.address,
    price: attraction.price || 0,
    image: attraction.image,
    rating: attraction.rating,
    openTime: attraction.openTime,
    tags: attraction.tags || [],
  };
}

/**
 * 清理餐厅数据
 * @param {Object} restaurant - 餐厅数据
 * @returns {Object} 清理后的餐厅数据
 */
function cleanRestaurantData(restaurant) {
  if (!restaurant) return null;

  return {
    id: restaurant.id,
    name: restaurant.name,
    city: restaurant.city,
    address: restaurant.address,
    pricePerPerson: restaurant.pricePerPerson || 0,
    image: restaurant.image,
    rating: restaurant.rating,
    openTime: restaurant.openTime,
    phone: restaurant.phone,
    tags: restaurant.tags || [],
  };
}

/**
 * 验证基础表单数据的完整性
 * @param {Object} baseForm - 基础表单数据
 * @returns {Object} 验证并补全的基础表单数据
 */
function validateBaseForm(baseForm) {
  return {
    destinationName: baseForm.destinationName || '',
    destination: baseForm.destination || '',
    days: baseForm.days || 1,
    travelers: baseForm.travelers || 1,
    startDate: baseForm.startDate || null,
    endDate: baseForm.endDate || null,
    budget: baseForm.budget || '',
    budgetRange: baseForm.budgetRange || '',
    ...baseForm,
  };
}

/**
 * 验证偏好表单数据的完整性
 * @param {Object} preferenceForm - 偏好表单数据
 * @returns {Object} 验证并补全的偏好表单数据
 */
function validatePreferenceForm(preferenceForm) {
  return {
    tripGoals: preferenceForm.tripGoals || [],
    focusAreas: preferenceForm.focusAreas || [],
    pacePreference: preferenceForm.pacePreference || '',
    socialPreference: preferenceForm.socialPreference || '',
    photoPreference: preferenceForm.photoPreference || '',
    dietaryRestrictions: preferenceForm.dietaryRestrictions || [],
    customDietaryNotes: preferenceForm.customDietaryNotes || '',
    specialRequirements: preferenceForm.specialRequirements || '',
    ...preferenceForm,
  };
}

/**
 * 检查草稿数据是否包含有效信息
 * @param {Object} draftData - 草稿数据
 * @returns {boolean} 是否包含有效信息
 */
export function isDraftDataValid(draftData) {
  if (!draftData || typeof draftData !== 'object') {
    return false;
  }

  // 检查是否有基础表单数据
  const hasBaseForm =
    draftData.baseForm &&
    typeof draftData.baseForm === 'object' &&
    Object.keys(draftData.baseForm).length > 0;

  // 检查是否有偏好数据
  const hasPreferences =
    draftData.preferenceForm &&
    typeof draftData.preferenceForm === 'object' &&
    Object.keys(draftData.preferenceForm).length > 0;

  // 检查是否有选择的景点或餐厅
  const hasSelections =
    (draftData.selectedAttractions &&
      draftData.selectedAttractions.length > 0) ||
    (draftData.selectedRestaurants && draftData.selectedRestaurants.length > 0);

  // 至少要有其中一项有效数据
  return hasBaseForm || hasPreferences || hasSelections;
}

/**
 * 生成草稿摘要信息
 * @param {Object} draftData - 草稿数据
 * @returns {Object} 草稿摘要
 */
export function generateDraftSummary(draftData) {
  if (!draftData) return null;

  const baseForm = draftData.baseForm || {};
  const preferenceForm = draftData.preferenceForm || {};

  return {
    destination: baseForm.destinationName || '未选择目的地',
    days: baseForm.days || 0,
    travelers: baseForm.travelers || 1,
    currentStep: draftData.currentStep || 0,
    stepName: getStepName(draftData.currentStep || 0),
    hasPreferences: Object.keys(preferenceForm).length > 0,
    hasSelections:
      (draftData.selectedAttractions?.length || 0) +
      (draftData.selectedRestaurants?.length || 0),
    completeness: calculateCompleteness(draftData),
    lastModified: draftData.updatedAt,
  };
}

/**
 * 获取步骤名称
 * @param {number} step - 步骤号
 * @returns {string} 步骤名称
 */
function getStepName(step) {
  const stepNames = {
    0: '选择目的地',
    1: '设置偏好',
    2: '智能生成',
    3: '行程预览',
  };
  return stepNames[step] || '未知步骤';
}

/**
 * 计算草稿完成度
 * @param {Object} draftData - 草稿数据
 * @returns {number} 完成度百分比 (0-100)
 */
function calculateCompleteness(draftData) {
  let score = 0;
  let total = 4;

  // 基础信息 (25%)
  if (draftData.baseForm?.destinationName) score += 1;

  // 偏好设置 (25%)
  if (
    draftData.preferenceForm &&
    Object.keys(draftData.preferenceForm).length > 0
  )
    score += 1;

  // 景点选择 (25%)
  if (draftData.selectedAttractions?.length > 0) score += 1;

  // 餐厅选择 (25%)
  if (draftData.selectedRestaurants?.length > 0) score += 1;

  return Math.round((score / total) * 100);
}
