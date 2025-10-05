// 手动选择餐厅组件
// 允许用户不通过摇骰子，直接选择餐厅并记录营养

import React, { useState } from 'react';
import { useApp } from '../hooks/useApp.js';
import { MEAL_TYPE_NAMES, MEAL_TYPES, TIER_NAMES } from '../utils/storage.js';

export function ManualSelectionScreen() {
  const { state, dispatch, ActionTypes } = useApp();
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [filterTier, setFilterTier] = useState('all');

  const handleCancel = () => {
    dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'main' });
  };

  const handleRestaurantSelect = (restaurant) => {
    // 设置选中的餐厅和餐点类型
    dispatch({ type: ActionTypes.SET_SELECTED_RESTAURANT, payload: restaurant });
    dispatch({ type: ActionTypes.SET_SELECTED_MEAL_TYPE, payload: selectedMealType });

    // 直接跳转到营养输入界面
    dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'nutrition_input' });
  };

  // 获取当前时间推荐的餐点类型
  const getRecommendedMealType = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) return MEAL_TYPES.BREAKFAST;
    if (hour >= 10 && hour < 14) return MEAL_TYPES.LUNCH;
    if (hour >= 14 && hour < 18) return MEAL_TYPES.SNACK;
    return MEAL_TYPES.DINNER;
  };

  // 根据餐点类型和等级筛选餐厅
  const filteredRestaurants = state.restaurants.filter(r => {
    const mealTypeMatch = !selectedMealType || r.mealTypes.includes(selectedMealType);
    const tierMatch = filterTier === 'all' || r.tier === filterTier;
    return mealTypeMatch && tierMatch;
  });

  // 等级图标
  const tierEmojis = {
    'hàng': '🌟',
    'dǐngjí': '⭐',
    'rénshàngrén': '✨',
    'NPC': '💫',
    'lā wán le': '🌙'
  };

  // 餐点类型图标
  const mealTypeEmojis = {
    breakfast: '🌅',
    lunch: '🍜',
    dinner: '🍽️',
    snack: '🍿'
  };

  // 如果还没选择餐点类型
  if (!selectedMealType) {
    const recommendedType = getRecommendedMealType();

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* 头部 */}
        <div className="bg-gradient-to-br from-green-600 to-teal-700 text-white px-6 pt-12 pb-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">手动选择</h1>
            <p className="text-green-100">选择餐点类型</p>
          </div>
        </div>

        {/* 餐点类型卡片 */}
        <div className="px-4 -mt-4">
          <div className="space-y-3">
            {Object.entries(MEAL_TYPES).map(([, value]) => {
              const isRecommended = value === recommendedType;

              return (
                <div
                  key={value}
                  className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 ${
                    isRecommended ? 'border-green-200 shadow-lg' : 'border-gray-100 hover:shadow-md'
                  }`}
                >
                  <button
                    onClick={() => setSelectedMealType(value)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                          isRecommended
                            ? 'bg-gradient-to-br from-green-500 to-teal-600 text-white'
                            : 'bg-gray-100'
                        }`}>
                          {mealTypeEmojis[value]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{MEAL_TYPE_NAMES[value]}</h3>
                          {isRecommended && (
                            <p className="text-sm text-green-600">基于当前时间推荐</p>
                          )}
                        </div>
                      </div>
                      {isRecommended && (
                        <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                          推荐
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* 取消按钮 */}
          <button
            onClick={handleCancel}
            className="w-full mt-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    );
  }

  // 已选择餐点类型，显示餐厅列表
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 头部 */}
      <div className="bg-gradient-to-br from-green-600 to-teal-700 text-white px-6 pt-12 pb-8">
        <div className="text-center">
          <div className="text-3xl mb-2">{mealTypeEmojis[selectedMealType]}</div>
          <h1 className="text-2xl font-bold mb-2">选择 {MEAL_TYPE_NAMES[selectedMealType]}</h1>
          <p className="text-green-100">选择一家餐厅记录营养</p>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="px-4 -mt-4 mb-4">
        <div className="bg-white rounded-2xl shadow-sm p-3">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <button
              onClick={() => setFilterTier('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterTier === 'all'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {Object.entries(TIER_NAMES).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setFilterTier(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filterTier === key
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tierEmojis[key]} {value}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 餐厅列表 */}
      <div className="px-4 space-y-3">
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map(restaurant => (
            <div
              key={restaurant.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <button
                onClick={() => handleRestaurantSelect(restaurant)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-teal-100 rounded-xl flex items-center justify-center text-xl">
                      {tierEmojis[restaurant.tier]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                      <p className="text-xs text-gray-500">{TIER_NAMES[restaurant.tier]}</p>
                    </div>
                  </div>
                  <div className="text-gray-400">→</div>
                </div>
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-4xl mb-3">😅</div>
            <p className="text-gray-600">没有符合条件的餐厅</p>
            <button
              onClick={() => setFilterTier('all')}
              className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
            >
              查看全部餐厅
            </button>
          </div>
        )}
      </div>

      {/* 返回按钮 */}
      <div className="px-4 mt-4">
        <button
          onClick={() => setSelectedMealType(null)}
          className="w-full py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
        >
          ← 重选餐点类型
        </button>
      </div>
    </div>
  );
}
