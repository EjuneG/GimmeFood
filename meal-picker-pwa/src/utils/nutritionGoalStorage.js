// 营养目标本地存储工具

const GOAL_STORAGE_KEY = 'gimmefood_nutrition_goal';

/**
 * 保存营养目标
 * @param {Object} goal - 营养目标对象
 * @param {number} goal.calories - 每日卡路里目标
 * @param {number} goal.protein - 每日蛋白质目标(克)
 * @param {number} goal.carbs - 每日碳水化合物目标(克)
 * @param {number} goal.fat - 每日脂肪目标(克)
 * @returns {boolean} 是否成功
 */
export function saveNutritionGoal(goal) {
  try {
    const goalData = {
      ...goal,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(goalData));
    return true;
  } catch (error) {
    console.error('保存营养目标失败:', error);
    return false;
  }
}

/**
 * 获取营养目标
 * @returns {Object|null} 营养目标对象，如果不存在则返回null
 */
export function getNutritionGoal() {
  try {
    const data = localStorage.getItem(GOAL_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('读取营养目标失败:', error);
    return null;
  }
}

/**
 * 检查是否已设置营养目标
 * @returns {boolean} 是否已设置
 */
export function hasNutritionGoal() {
  const goal = getNutritionGoal();
  return goal !== null &&
         goal.calories > 0 &&
         goal.protein >= 0 &&
         goal.carbs >= 0 &&
         goal.fat >= 0;
}

/**
 * 清除营养目标
 * @returns {boolean} 是否成功
 */
export function clearNutritionGoal() {
  try {
    localStorage.removeItem(GOAL_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('清除营养目标失败:', error);
    return false;
  }
}

/**
 * 计算当前进度百分比
 * @param {number} current - 当前摄入量
 * @param {number} goal - 目标值
 * @returns {number} 进度百分比 (0-100，可能超过100)
 */
export function calculateProgress(current, goal) {
  if (goal === 0) return 0;
  return Math.round((current / goal) * 100);
}

/**
 * 获取进度状态
 * @param {number} progress - 进度百分比
 * @returns {string} 状态：'low' (< 80%), 'good' (80-110%), 'high' (> 110%)
 */
export function getProgressStatus(progress) {
  if (progress < 80) return 'low';
  if (progress <= 110) return 'good';
  return 'high';
}
