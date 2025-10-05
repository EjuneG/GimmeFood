// 营养数据本地存储工具

const STORAGE_KEY = 'gimmefood_nutrition_history';

/**
 * 保存营养记录
 * @param {Object} record - 营养记录对象
 * @param {string} record.restaurant - 餐厅名称
 * @param {string} record.mealType - 餐点类型
 * @param {string} record.foodDescription - 食物描述
 * @param {number} record.calories - 卡路里
 * @param {number} record.protein - 蛋白质(克)
 * @param {number} record.carbs - 碳水化合物(克)
 * @param {number} record.fat - 脂肪(克)
 * @param {string} record.note - 营养提示
 */
export function saveNutritionRecord(record) {
  const history = getNutritionHistory();
  const newRecord = {
    ...record,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString('zh-CN')
  };

  history.push(newRecord);

  // 只保留最近100条记录
  if (history.length > 100) {
    history.splice(0, history.length - 100);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('保存营养记录失败:', error);
    return false;
  }
}

/**
 * 获取所有营养历史记录
 * @returns {Array} 营养记录数组
 */
export function getNutritionHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('读取营养历史失败:', error);
    return [];
  }
}

/**
 * 获取今天的营养记录
 * @returns {Array} 今天的营养记录数组
 */
export function getTodayNutrition() {
  const today = new Date().toLocaleDateString('zh-CN');
  const history = getNutritionHistory();
  return history.filter(record => record.date === today);
}

/**
 * 计算今天的营养总和
 * @returns {Object} 营养总和对象 {calories, protein, carbs, fat}
 */
export function getTodayTotal() {
  const todayRecords = getTodayNutrition();
  return todayRecords.reduce((total, record) => ({
    calories: total.calories + (record.calories || 0),
    protein: total.protein + (record.protein || 0),
    carbs: total.carbs + (record.carbs || 0),
    fat: total.fat + (record.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

/**
 * 获取指定日期范围的营养记录
 * @param {Date} startDate - 开始日期
 * @param {Date} endDate - 结束日期
 * @returns {Array} 指定日期范围的营养记录数组
 */
export function getNutritionByDateRange(startDate, endDate) {
  const history = getNutritionHistory();
  return history.filter(record => {
    const recordDate = new Date(record.timestamp);
    return recordDate >= startDate && recordDate <= endDate;
  });
}

/**
 * 获取本周的营养总和
 * @returns {Object} 营养总和对象 {calories, protein, carbs, fat}
 */
export function getWeekTotal() {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // 周日开始
  weekStart.setHours(0, 0, 0, 0);

  const weekRecords = getNutritionByDateRange(weekStart, today);
  return weekRecords.reduce((total, record) => ({
    calories: total.calories + (record.calories || 0),
    protein: total.protein + (record.protein || 0),
    carbs: total.carbs + (record.carbs || 0),
    fat: total.fat + (record.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

/**
 * 清空所有营养记录
 * @returns {boolean} 是否成功
 */
export function clearNutritionHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('清空营养历史失败:', error);
    return false;
  }
}

/**
 * 删除指定时间戳的营养记录
 * @param {string} timestamp - 记录的时间戳
 * @returns {boolean} 是否成功
 */
export function deleteNutritionRecord(timestamp) {
  const history = getNutritionHistory();
  const filteredHistory = history.filter(record => record.timestamp !== timestamp);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHistory));
    return true;
  } catch (error) {
    console.error('删除营养记录失败:', error);
    return false;
  }
}
