// 营养追踪设置工具
// 处理营养日边界等配置

const SETTINGS_STORAGE_KEY = 'gimmefood_nutrition_settings';

// 默认设置
const DEFAULT_SETTINGS = {
  dayBoundaryHour: 4 // 默认凌晨4点作为新一天的开始
};

/**
 * 获取营养追踪设置
 * @returns {Object} 设置对象 {dayBoundaryHour: number}
 */
export function getNutritionSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (data) {
      const settings = JSON.parse(data);
      // 确保有默认值
      return {
        ...DEFAULT_SETTINGS,
        ...settings
      };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('读取营养设置失败:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * 保存营养追踪设置
 * @param {Object} settings - 设置对象
 * @returns {boolean} 是否成功
 */
export function saveNutritionSettings(settings) {
  try {
    const updatedSettings = {
      ...getNutritionSettings(),
      ...settings,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
    return true;
  } catch (error) {
    console.error('保存营养设置失败:', error);
    return false;
  }
}

/**
 * 获取营养追踪的"今天"日期（考虑day boundary）
 * 例如：如果设置day boundary为4点，那么凌晨2点记录的食物会被算作昨天
 *
 * @returns {string} 格式化的日期字符串 (zh-CN locale)
 */
export function getNutritionDate() {
  const settings = getNutritionSettings();
  const now = new Date();
  const currentHour = now.getHours();

  // 如果当前时间小于day boundary时间，认为还是"昨天"
  if (currentHour < settings.dayBoundaryHour) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toLocaleDateString('zh-CN');
  }

  return now.toLocaleDateString('zh-CN');
}

/**
 * 获取指定时间戳的营养日期（考虑day boundary）
 * @param {string|Date} timestamp - 时间戳
 * @returns {string} 格式化的日期字符串 (zh-CN locale)
 */
export function getNutritionDateFromTimestamp(timestamp) {
  const settings = getNutritionSettings();
  const date = new Date(timestamp);
  const hour = date.getHours();

  // 如果该时间小于day boundary时间，认为是前一天
  if (hour < settings.dayBoundaryHour) {
    const adjustedDate = new Date(date);
    adjustedDate.setDate(adjustedDate.getDate() - 1);
    return adjustedDate.toLocaleDateString('zh-CN');
  }

  return date.toLocaleDateString('zh-CN');
}

/**
 * 设置营养日边界时间
 * @param {number} hour - 小时数 (0-23)
 * @returns {boolean} 是否成功
 */
export function setDayBoundaryHour(hour) {
  if (hour < 0 || hour > 23) {
    console.error('小时数必须在0-23之间');
    return false;
  }

  return saveNutritionSettings({ dayBoundaryHour: hour });
}

/**
 * 获取当前day boundary设置的小时数
 * @returns {number} 小时数 (0-23)
 */
export function getDayBoundaryHour() {
  const settings = getNutritionSettings();
  return settings.dayBoundaryHour;
}
