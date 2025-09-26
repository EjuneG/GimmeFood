// 数据导入导出工具

const DATA_VERSION = 'V1';
const DATA_PREFIX = `GIMME_FOOD_DATA_${DATA_VERSION}_`;

// 将数据导出为Base64编码的文本字符串
export function exportDataToText(restaurants, userData = {}) {
  try {
    const exportData = {
      version: DATA_VERSION,
      exportDate: new Date().toISOString(),
      restaurants: restaurants || [],
      userData: userData || {},
      checksum: generateChecksum(restaurants)
    };

    const jsonString = JSON.stringify(exportData);
    const base64Data = btoa(unescape(encodeURIComponent(jsonString)));

    return DATA_PREFIX + base64Data;
  } catch (error) {
    console.error('导出数据失败:', error);
    throw new Error('数据导出失败，请重试');
  }
}

// 从文本字符串导入数据
export function importDataFromText(textData) {
  try {
    // 检查数据格式
    if (!textData || typeof textData !== 'string') {
      throw new Error('无效的数据格式');
    }

    // 检查前缀
    if (!textData.startsWith(DATA_PREFIX)) {
      throw new Error('不支持的数据版本或格式错误');
    }

    // 提取Base64数据
    const base64Data = textData.substring(DATA_PREFIX.length);

    // 解码Base64
    const jsonString = decodeURIComponent(escape(atob(base64Data)));
    const importData = JSON.parse(jsonString);

    // 验证数据结构
    if (!importData.version || !importData.restaurants || !Array.isArray(importData.restaurants)) {
      throw new Error('数据格式不正确');
    }

    // 验证校验和
    const expectedChecksum = generateChecksum(importData.restaurants);
    if (importData.checksum !== expectedChecksum) {
      console.warn('数据校验和不匹配，可能存在数据损坏');
    }

    return {
      success: true,
      data: importData,
      restaurantCount: importData.restaurants.length,
      exportDate: importData.exportDate
    };
  } catch (error) {
    console.error('导入数据失败:', error);
    return {
      success: false,
      error: error.message || '数据导入失败'
    };
  }
}

// 生成数据校验和
function generateChecksum(restaurants) {
  const dataString = JSON.stringify(restaurants.map(r => ({ name: r.name, tier: r.tier })));
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  return hash.toString();
}

// 检测并处理重复餐厅
export function detectDuplicates(existingRestaurants, importedRestaurants) {
  const duplicates = [];
  const newRestaurants = [];

  importedRestaurants.forEach(importedRestaurant => {
    const duplicate = existingRestaurants.find(existing =>
      existing.name.toLowerCase() === importedRestaurant.name.toLowerCase() &&
      existing.tier === importedRestaurant.tier
    );

    if (duplicate) {
      duplicates.push({
        existing: duplicate,
        imported: importedRestaurant,
        key: `${importedRestaurant.name}_${importedRestaurant.tier}`
      });
    } else {
      // 为导入的餐厅生成新ID
      newRestaurants.push({
        ...importedRestaurant,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      });
    }
  });

  return {
    duplicates,
    newRestaurants,
    hasDuplicates: duplicates.length > 0
  };
}

// 合并重复餐厅的数据
export function mergeDuplicateRestaurants(existing, imported, mergeStrategy) {
  const merged = { ...existing };

  switch (mergeStrategy) {
    case 'keep_existing':
      // 保持现有数据不变
      break;

    case 'keep_imported': {
      // 使用导入的数据，但保留ID和创建时间
      Object.assign(merged, imported, {
        id: existing.id,
        createdAt: existing.createdAt
      });
      break;
    }

    case 'smart_merge':
    default: {
      // 智能合并：保留更新的lastSelected，合并反馈历史
      merged.rejectionCount = Math.max(existing.rejectionCount || 0, imported.rejectionCount || 0);

      // 使用更新的lastSelected时间
      if (imported.lastSelected && existing.lastSelected) {
        merged.lastSelected = new Date(imported.lastSelected) > new Date(existing.lastSelected)
          ? imported.lastSelected
          : existing.lastSelected;
      } else {
        merged.lastSelected = imported.lastSelected || existing.lastSelected;
      }

      // 合并反馈历史
      const existingHistory = existing.feedbackHistory || [];
      const importedHistory = imported.feedbackHistory || [];
      merged.feedbackHistory = [...existingHistory, ...importedHistory];

      // 重新计算当前权重
      merged.currentWeight = imported.currentWeight || existing.currentWeight;
      break;
    }
  }

  return merged;
}

// 验证餐厅数据结构
export function validateRestaurantData(restaurant) {
  const required = ['name', 'tier', 'mealTypes'];

  for (const field of required) {
    if (!Object.prototype.hasOwnProperty.call(restaurant, field)) {
      return false;
    }
  }

  // 验证餐点类型数组
  if (!Array.isArray(restaurant.mealTypes)) {
    return false;
  }

  return true;
}

// 清理和标准化导入的餐厅数据
export function normalizeImportedRestaurants(restaurants) {
  return restaurants
    .filter(restaurant => validateRestaurantData(restaurant))
    .map(restaurant => ({
      ...restaurant,
      name: restaurant.name.trim(),
      mealTypes: Array.isArray(restaurant.mealTypes) ? restaurant.mealTypes : [],
      rejectionCount: restaurant.rejectionCount || 0,
      feedbackHistory: restaurant.feedbackHistory || [],
      currentWeight: restaurant.currentWeight || 1,
      originalTier: restaurant.originalTier || restaurant.tier
    }));
}