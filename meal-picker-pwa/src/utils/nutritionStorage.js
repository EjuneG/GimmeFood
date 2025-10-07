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

/**
 * 获取指定餐厅的所有不重复菜品描述
 * @param {string} restaurantName - 餐厅名称
 * @param {number} limit - 返回的最大数量，默认10
 * @returns {Array<string>} 菜品描述数组，按最近使用时间排序
 */
export function getRestaurantDishes(restaurantName, limit = 10) {
  if (!restaurantName) return [];

  const history = getNutritionHistory();

  // 过滤指定餐厅的记录
  const restaurantRecords = history.filter(
    record => record.restaurant === restaurantName && record.foodDescription
  );

  // 按时间倒序排序（最近的在前）
  restaurantRecords.sort((a, b) =>
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  // 去重：保留每个菜品描述的最新记录
  const uniqueDishes = [];
  const seenDescriptions = new Set();

  for (const record of restaurantRecords) {
    const description = record.foodDescription.trim();
    if (!seenDescriptions.has(description)) {
      seenDescriptions.add(description);
      uniqueDishes.push(description);

      if (uniqueDishes.length >= limit) break;
    }
  }

  return uniqueDishes;
}

/**
 * 获取所有餐厅的菜品历史统计
 * @returns {Object} 餐厅名称为key，菜品数组为value
 */
export function getAllRestaurantDishes() {
  const history = getNutritionHistory();
  const restaurantMap = {};

  history.forEach(record => {
    if (record.restaurant && record.foodDescription) {
      if (!restaurantMap[record.restaurant]) {
        restaurantMap[record.restaurant] = [];
      }

      const description = record.foodDescription.trim();
      if (!restaurantMap[record.restaurant].includes(description)) {
        restaurantMap[record.restaurant].push(description);
      }
    }
  });

  return restaurantMap;
}

/**
 * 获取指定餐厅和菜品的缓存营养数据（如果存在）
 * @param {string} restaurantName - 餐厅名称
 * @param {string} foodDescription - 食物描述
 * @returns {Object|null} 营养数据对象，如果没有缓存则返回null
 */
export function getCachedNutritionData(restaurantName, foodDescription) {
  if (!restaurantName || !foodDescription) return null;

  const history = getNutritionHistory();
  const trimmedDescription = foodDescription.trim();

  // 按时间倒序查找，返回最新的匹配记录
  for (let i = history.length - 1; i >= 0; i--) {
    const record = history[i];
    if (
      record.restaurant === restaurantName &&
      record.foodDescription?.trim() === trimmedDescription &&
      record.calories !== undefined // 确保有营养数据
    ) {
      // 返回营养数据（不包括 timestamp 和 date，因为这次是新的记录）
      return {
        calories: record.calories,
        protein: record.protein,
        carbs: record.carbs,
        fat: record.fat,
        note: record.note
      };
    }
  }

  return null;
}
