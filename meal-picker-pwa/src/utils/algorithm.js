// 智能选择算法

import { TIER_WEIGHTS, TIERS } from './storage.js';

// 计算餐厅的当前权重
export function calculateRestaurantWeight(restaurant, preferences = {}) {
  let baseWeight = TIER_WEIGHTS[restaurant.tier] || 1;
  let dynamicWeight = restaurant.dynamicWeight || 0;
  let weight = baseWeight + dynamicWeight;

  // 最近选择惩罚 - 如果在最近24小时内选择过，临时降级
  const lastSelected = restaurant.lastSelected;
  if (lastSelected) {
    const hoursSinceLastSelection = (Date.now() - new Date(lastSelected).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastSelection < 24) {
      weight = Math.max(1, weight - 1); // 临时降一级
    }
  }

  // 确保权重至少为1
  return Math.max(1, weight);
}

// 根据权重进行随机选择
export function weightedRandomSelection(restaurants, preferences = {}) {
  if (restaurants.length === 0) return null;

  // 计算所有餐厅的权重
  const weightedRestaurants = restaurants.map(restaurant => ({
    ...restaurant,
    currentWeight: calculateRestaurantWeight(restaurant, preferences)
  }));

  // 计算总权重
  const totalWeight = weightedRestaurants.reduce((sum, restaurant) => sum + restaurant.currentWeight, 0);

  // 生成随机数
  let random = Math.random() * totalWeight;

  // 根据权重选择餐厅
  for (const restaurant of weightedRestaurants) {
    random -= restaurant.currentWeight;
    if (random <= 0) {
      return restaurant;
    }
  }

  // 备用：返回第一个餐厅
  return weightedRestaurants[0];
}

// 根据餐点类型筛选餐厅
export function filterRestaurantsByMealType(restaurants, mealType) {
  return restaurants.filter(restaurant =>
    restaurant.mealTypes && restaurant.mealTypes.includes(mealType)
  );
}

// 调整餐厅权重
export function adjustRestaurantWeight(restaurant, adjustment) {
  const updatedRestaurant = { ...restaurant };
  updatedRestaurant.dynamicWeight = (restaurant.dynamicWeight || 0) + adjustment;

  // 检查是否需要转换为等级变化
  return convertWeightToTierChange(updatedRestaurant);
}

// 将权重变化转换为等级变化
export function convertWeightToTierChange(restaurant) {
  const updatedRestaurant = { ...restaurant };
  const dynamicWeight = updatedRestaurant.dynamicWeight || 0;

  // 权重降低1.0或更多时降级
  if (dynamicWeight <= -1.0) {
    const tierDowngrades = Math.floor(Math.abs(dynamicWeight));
    for (let i = 0; i < tierDowngrades; i++) {
      switch (updatedRestaurant.tier) {
        case TIERS.HANG:
          updatedRestaurant.tier = TIERS.TOP;
          break;
        case TIERS.TOP:
          updatedRestaurant.tier = TIERS.RENSR;
          break;
        case TIERS.RENSR:
          updatedRestaurant.tier = TIERS.NPC;
          break;
        case TIERS.NPC:
          updatedRestaurant.tier = TIERS.TRASH;
          break;
        case TIERS.TRASH:
          // 已经是最低等级，不再降级
          break;
      }
    }
    // 重置动态权重，保留余数
    updatedRestaurant.dynamicWeight = dynamicWeight + tierDowngrades;
  }

  // 权重提升1.0或更多时升级
  else if (dynamicWeight >= 1.0) {
    const tierUpgrades = Math.floor(dynamicWeight);
    for (let i = 0; i < tierUpgrades; i++) {
      switch (updatedRestaurant.tier) {
        case TIERS.TRASH:
          updatedRestaurant.tier = TIERS.NPC;
          break;
        case TIERS.NPC:
          updatedRestaurant.tier = TIERS.RENSR;
          break;
        case TIERS.RENSR:
          updatedRestaurant.tier = TIERS.TOP;
          break;
        case TIERS.TOP:
          updatedRestaurant.tier = TIERS.HANG;
          break;
        case TIERS.HANG:
          // 已经是最高等级，不再升级
          break;
      }
    }
    // 重置动态权重，保留余数
    updatedRestaurant.dynamicWeight = dynamicWeight - tierUpgrades;
  }

  return updatedRestaurant;
}

// 处理餐厅拒绝 - 使用新的权重系统
export function handleRestaurantRejection(restaurant) {
  const updatedRestaurant = { ...restaurant };

  // 使用权重调整系统进行降级
  return adjustRestaurantWeight(updatedRestaurant, -1.0);
}

// 处理正面反馈 - 使用新的权重系统
export function handlePositiveFeedback(restaurant) {
  const updatedRestaurant = { ...restaurant };

  // 添加正面反馈记录
  if (!updatedRestaurant.feedbackHistory) {
    updatedRestaurant.feedbackHistory = [];
  }

  updatedRestaurant.feedbackHistory.push({
    feedback: 'positive',
    timestamp: new Date().toISOString()
  });

  // 检查是否可以升级（需要连续几次正面反馈）
  const recentFeedback = updatedRestaurant.feedbackHistory
    .slice(-3) // 最近3次反馈
    .filter(f => f.feedback === 'positive');

  if (recentFeedback.length >= 2) { // 最近2次都是正面反馈才给予权重提升
    return adjustRestaurantWeight(updatedRestaurant, 0.5);
  }

  return updatedRestaurant;
}

// 处理负面反馈 - 使用新的权重系统
export function handleNegativeFeedback(restaurant) {
  const updatedRestaurant = { ...restaurant };

  // 添加负面反馈记录
  if (!updatedRestaurant.feedbackHistory) {
    updatedRestaurant.feedbackHistory = [];
  }

  updatedRestaurant.feedbackHistory.push({
    feedback: 'negative',
    timestamp: new Date().toISOString()
  });

  // 使用权重调整系统进行降级
  return adjustRestaurantWeight(updatedRestaurant, -1.0);
}

// 获取按等级分组的餐厅选择列表 (用于重选流程)
export function getRestaurantsByTier(restaurants, mealType, maxCount = 5, excludeIds = []) {
  const filteredRestaurants = filterRestaurantsByMealType(restaurants, mealType)
    .filter(restaurant => !excludeIds.includes(restaurant.id));

  // 按等级分组
  const tierGroups = {
    [TIERS.HANG]: [],
    [TIERS.TOP]: [],
    [TIERS.RENSR]: [],
    [TIERS.NPC]: [],
    [TIERS.TRASH]: []
  };

  filteredRestaurants.forEach(restaurant => {
    if (tierGroups[restaurant.tier]) {
      tierGroups[restaurant.tier].push(restaurant);
    }
  });

  // 从最高等级开始收集餐厅，直到达到maxCount
  const result = [];
  for (const tier of Object.keys(tierGroups)) {
    result.push(...tierGroups[tier]);
    if (result.length >= maxCount) {
      break;
    }
  }

  return result.slice(0, maxCount);
}

// 智能餐厅选择算法 - 考虑总餐厅数量来决定是否包含低等级餐厅
export function intelligentRestaurantSelection(restaurants, mealType, preferences = {}, excludeIds = []) {
  const filteredRestaurants = filterRestaurantsByMealType(restaurants, mealType)
    .filter(restaurant => !excludeIds.includes(restaurant.id));

  if (filteredRestaurants.length === 0) return null;

  // 按等级分组
  const tierGroups = {
    [TIERS.HANG]: [],
    [TIERS.TOP]: [],
    [TIERS.RENSR]: [],
    [TIERS.NPC]: [],
    [TIERS.TRASH]: []
  };

  filteredRestaurants.forEach(restaurant => {
    if (tierGroups[restaurant.tier]) {
      tierGroups[restaurant.tier].push(restaurant);
    }
  });

  // 根据总餐厅数量决定包含哪些等级
  let candidateRestaurants = [];

  if (filteredRestaurants.length <= 3) {
    // 餐厅很少，包含所有等级
    candidateRestaurants = filteredRestaurants;
  } else if (filteredRestaurants.length <= 6) {
    // 餐厅较少，包含前4个等级
    candidateRestaurants = [
      ...tierGroups[TIERS.HANG],
      ...tierGroups[TIERS.TOP],
      ...tierGroups[TIERS.RENSR],
      ...tierGroups[TIERS.NPC]
    ];
    if (candidateRestaurants.length === 0) {
      candidateRestaurants = [tierGroups[TIERS.TRASH]];
    }
  } else if (filteredRestaurants.length <= 10) {
    // 餐厅中等数量，包含前3个等级
    candidateRestaurants = [
      ...tierGroups[TIERS.HANG],
      ...tierGroups[TIERS.TOP],
      ...tierGroups[TIERS.RENSR]
    ];
    if (candidateRestaurants.length === 0) {
      candidateRestaurants = [...tierGroups[TIERS.NPC], ...tierGroups[TIERS.TRASH]];
    }
  } else {
    // 餐厅很多，优先选择高等级餐厅
    candidateRestaurants = [...tierGroups[TIERS.HANG], ...tierGroups[TIERS.TOP]];
    if (candidateRestaurants.length === 0) {
      candidateRestaurants = [...tierGroups[TIERS.RENSR], ...tierGroups[TIERS.NPC]];
      if (candidateRestaurants.length === 0) {
        candidateRestaurants = tierGroups[TIERS.TRASH];
      }
    }
  }

  return weightedRandomSelection(candidateRestaurants, preferences);
}