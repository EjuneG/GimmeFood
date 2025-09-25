// 智能选择算法

import { TIER_WEIGHTS, TIERS } from './storage.js';

// 抽象问题数据库
export const ABSTRACT_QUESTIONS = {
  // 纯心理作用问题 (不影响算法)
  PSYCHOLOGICAL: [
    { question: '太阳还是月亮？', options: ['太阳', '月亮'] },
    { question: '海洋还是山脉？', options: ['海洋', '山脉'] },
    { question: '春天还是秋天？', options: ['春天', '秋天'] },
    { question: '猫还是狗？', options: ['猫', '狗'] },
    { question: '蓝色还是红色？', options: ['蓝色', '红色'] },
    { question: '早晨还是夜晚？', options: ['早晨', '夜晚'] },
    { question: '咖啡还是茶？', options: ['咖啡', '茶'] },
    { question: '电影还是音乐？', options: ['电影', '音乐'] },
    { question: '雨天还是晴天？', options: ['雨天', '晴天'] },
    { question: '左还是右？', options: ['左', '右'] }
  ],

  // 算法影响问题
  ALGORITHMIC: [
    {
      question: '冒险还是舒适？',
      options: ['冒险', '舒适'],
      effect: 'adventure_comfort'
    },
    {
      question: '新鲜还是熟悉？',
      options: ['新鲜', '熟悉'],
      effect: 'adventure_comfort'
    },
    {
      question: '探索还是安全？',
      options: ['探索', '安全'],
      effect: 'adventure_comfort'
    },
    {
      question: '挑战还是稳定？',
      options: ['挑战', '稳定'],
      effect: 'adventure_comfort'
    }
  ]
};

// 获取随机抽象问题
export function getRandomAbstractQuestion() {
  const allQuestions = [...ABSTRACT_QUESTIONS.PSYCHOLOGICAL, ...ABSTRACT_QUESTIONS.ALGORITHMIC];
  const randomIndex = Math.floor(Math.random() * allQuestions.length);
  return allQuestions[randomIndex];
}

// 计算餐厅的当前权重
export function calculateRestaurantWeight(restaurant, preferences = {}) {
  let weight = TIER_WEIGHTS[restaurant.tier] || 1;

  // 最近选择惩罚 - 如果在最近24小时内选择过，临时降级
  const lastSelected = restaurant.lastSelected;
  if (lastSelected) {
    const hoursSinceLastSelection = (Date.now() - new Date(lastSelected).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastSelection < 24) {
      weight = Math.max(1, weight - 1); // 临时降一级
    }
  }

  // 抽象问题影响权重
  if (preferences.questionEffect === 'adventure_comfort') {
    if (preferences.selectedOption === '冒险' || preferences.selectedOption === '新鲜' ||
        preferences.selectedOption === '探索' || preferences.selectedOption === '挑战') {
      // 冒险选择：提升长期未选餐厅权重
      const daysSinceLastSelection = lastSelected ?
        (Date.now() - new Date(lastSelected).getTime()) / (1000 * 60 * 60 * 24) : 999;

      if (daysSinceLastSelection > 7) {
        weight += 1; // 提升约1个等级
      }
    } else {
      // 舒适选择：提升最近选择餐厅权重
      const daysSinceLastSelection = lastSelected ?
        (Date.now() - new Date(lastSelected).getTime()) / (1000 * 60 * 60 * 24) : 999;

      if (daysSinceLastSelection <= 7) {
        weight += 1; // 提升约1个等级
      }
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

// 处理餐厅拒绝 - 降级处理
export function handleRestaurantRejection(restaurant) {
  const updatedRestaurant = { ...restaurant };
  updatedRestaurant.rejectionCount = (updatedRestaurant.rejectionCount || 0) + 1;

  // 根据当前等级进行降级
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

  return updatedRestaurant;
}

// 处理正面反馈 - 可能升级
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

  if (recentFeedback.length >= 2) { // 最近2次都是正面反馈才升级
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

  return updatedRestaurant;
}

// 处理负面反馈 - 降级
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

  // 立即降级
  return handleRestaurantRejection(updatedRestaurant);
}

// 获取按等级分组的餐厅选择列表 (用于重选流程)
export function getRestaurantsByTier(restaurants, mealType, maxCount = 5) {
  const filteredRestaurants = filterRestaurantsByMealType(restaurants, mealType);

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