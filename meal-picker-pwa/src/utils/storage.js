// 数据模型和本地存储工具

// 餐厅等级常量
export const TIERS = {
  HANG: 'hàng', // 夯
  TOP: 'dǐngjí', // 顶级
  RENSR: 'rénshàngrén', // 人上人
  NPC: 'NPC',
  TRASH: 'lāwánle' // 拉完了
};

// 等级显示名称
export const TIER_NAMES = {
  [TIERS.HANG]: '夯',
  [TIERS.TOP]: '顶级',
  [TIERS.RENSR]: '人上人',
  [TIERS.NPC]: 'NPC',
  [TIERS.TRASH]: '拉完了'
};

// 等级权重 (数字越大权重越高)
export const TIER_WEIGHTS = {
  [TIERS.HANG]: 5,
  [TIERS.TOP]: 4,
  [TIERS.RENSR]: 3,
  [TIERS.NPC]: 2,
  [TIERS.TRASH]: 1
};

// 餐点类型
export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK: 'snack'
};

// 餐点显示名称
export const MEAL_TYPE_NAMES = {
  [MEAL_TYPES.BREAKFAST]: '早餐',
  [MEAL_TYPES.LUNCH]: '午餐',
  [MEAL_TYPES.DINNER]: '晚餐',
  [MEAL_TYPES.SNACK]: '零食'
};

// 本地存储键名
const STORAGE_KEYS = {
  RESTAURANTS: 'gimme_food_restaurants',
  USER_DATA: 'gimme_food_user_data',
  SELECTION_HISTORY: 'gimme_food_selection_history',
  PENDING_FEEDBACK: 'gimme_food_pending_feedback'
};

// 创建新餐厅对象
export function createRestaurant(name, tier, mealTypes = []) {
  return {
    id: Date.now().toString(),
    name: name.trim(),
    tier,
    mealTypes: [...mealTypes],
    currentWeight: TIER_WEIGHTS[tier],
    originalTier: tier,
    selectionCount: 0,
    lastSelected: null,
    createdAt: new Date().toISOString(),
    feedbackHistory: []
  };
}

// 保存餐厅数据到本地存储
export function saveRestaurants(restaurants) {
  try {
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(restaurants));
    return true;
  } catch (error) {
    console.error('保存餐厅数据失败:', error);
    return false;
  }
}

// 从本地存储获取餐厅数据
export function getRestaurants() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESTAURANTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('读取餐厅数据失败:', error);
    return [];
  }
}

// 保存用户数据
export function saveUserData(userData) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('保存用户数据失败:', error);
    return false;
  }
}

// 获取用户数据
export function getUserData() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : {
      isFirstTime: true,
      setupCompleted: false,
      totalSelections: 0,
      preferences: {}
    };
  } catch (error) {
    console.error('读取用户数据失败:', error);
    return {
      isFirstTime: true,
      setupCompleted: false,
      totalSelections: 0,
      preferences: {}
    };
  }
}

// 保存选择历史
export function saveSelectionHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTION_HISTORY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('保存选择历史失败:', error);
    return false;
  }
}

// 获取选择历史
export function getSelectionHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SELECTION_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('读取选择历史失败:', error);
    return [];
  }
}

// 保存待反馈的选择
export function savePendingFeedback(pendingFeedback) {
  try {
    localStorage.setItem(STORAGE_KEYS.PENDING_FEEDBACK, JSON.stringify(pendingFeedback));
    return true;
  } catch (error) {
    console.error('保存待反馈数据失败:', error);
    return false;
  }
}

// 获取待反馈的选择
export function getPendingFeedback() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PENDING_FEEDBACK);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('读取待反馈数据失败:', error);
    return null;
  }
}

// 添加选择记录
export function addSelectionRecord(restaurantId, mealType, acceptedImmediately, reselectionStep = 0) {
  const history = getSelectionHistory();
  const record = {
    id: Date.now().toString(),
    restaurantId,
    mealType,
    acceptedImmediately,
    reselectionStep,
    timestamp: new Date().toISOString()
  };

  history.push(record);

  // 只保留最近100条记录
  if (history.length > 100) {
    history.splice(0, history.length - 100);
  }

  return saveSelectionHistory(history);
}

// 获取餐厅最近选择时间
export function getLastSelectionTime(restaurantId) {
  const history = getSelectionHistory();
  const recentSelections = history
    .filter(record => record.restaurantId === restaurantId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return recentSelections.length > 0 ? new Date(recentSelections[0].timestamp) : null;
}

// 检查是否需要显示反馈弹窗
export function shouldShowFeedback() {
  const pendingFeedback = getPendingFeedback();
  if (!pendingFeedback) return false;

  // 检查是否已经超过一定时间 (比如6小时后才询问反馈)
  const feedbackDelay = 6 * 60 * 60 * 1000; // 6小时
  const now = new Date().getTime();
  const selectionTime = new Date(pendingFeedback.timestamp).getTime();

  return (now - selectionTime) >= feedbackDelay;
}