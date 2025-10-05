// 主界面组件 - 现代卡片化设计

import React, { useState } from 'react';
import { useApp } from '../hooks/useApp.js';
import { useSelection } from '../hooks/useSelection.js';
import { MEAL_TYPE_NAMES, MEAL_TYPES, TIER_NAMES } from '../utils/storage.js';
import { NutritionGoalCard } from './NutritionGoalCard.jsx';

export function MainScreen() {
  const { state, dispatch, ActionTypes } = useApp();
  const { selectMealType } = useSelection();
  const [showMealTypes, setShowMealTypes] = useState(false);

  // 开始选择流程
  const handleGimmeFoodClick = () => {
    setShowMealTypes(true);
  };

  // 选择餐点类型并开始推荐流程
  const handleMealTypeSelect = (mealType) => {
    setShowMealTypes(false);
    selectMealType(mealType);
  };

  // 获取当前时间对应的推荐餐点类型
  const getRecommendedMealType = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) return MEAL_TYPES.BREAKFAST;
    if (hour >= 10 && hour < 14) return MEAL_TYPES.LUNCH;
    if (hour >= 14 && hour < 18) return MEAL_TYPES.SNACK;
    return MEAL_TYPES.DINNER;
  };

  // 获取时间问候语
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早安';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  // 餐点类型选择界面
  if (showMealTypes) {
    const recommendedType = getRecommendedMealType();

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* 头部 */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white px-6 pt-12 pb-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">选择餐点类型</h1>
            <p className="text-blue-100">现在想吃什么类型的食物？</p>
          </div>
        </div>

        {/* 餐点类型卡片 */}
        <div className="px-4 -mt-4">
          <div className="space-y-3">
            {Object.entries(MEAL_TYPES).map(([, value]) => {
              const isRecommended = value === recommendedType;
              const mealEmojis = {
                breakfast: '🌅',
                lunch: '🍜',
                dinner: '🍽️',
                snack: '🍿'
              };

              return (
                <div
                  key={value}
                  className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 ${
                    isRecommended ? 'border-blue-200 shadow-lg' : 'border-gray-100 hover:shadow-md'
                  }`}
                >
                  <button
                    onClick={() => handleMealTypeSelect(value)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                          isRecommended
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                            : 'bg-gray-100'
                        }`}>
                          {mealEmojis[value]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{MEAL_TYPE_NAMES[value]}</h3>
                          {isRecommended && (
                            <p className="text-sm text-blue-600">基于当前时间推荐</p>
                          )}
                        </div>
                      </div>
                      {isRecommended && (
                        <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
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
            onClick={() => setShowMealTypes(false)}
            className="w-full mt-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    );
  }

  // 主界面
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 头部卡片 */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white px-6 pt-12 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">给我食物!</h1>
            <p className="text-blue-100 mt-1">{getGreeting()}，准备好选择了吗？</p>
          </div>
          <div className="text-4xl">🍽️</div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="px-4 -mt-4 space-y-4">
        {/* 主要操作卡片 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* 大号给我食物按钮 */}
          <button
            data-gimme-food-btn
            onClick={handleGimmeFoodClick}
            className="w-full h-32 bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
          >
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>

            <div className="relative z-10 flex items-center justify-center space-x-4">
              <div className="text-4xl animate-bounce">🎲</div>
              <div>
                <div className="text-2xl font-bold">给我食物!</div>
                <div className="text-sm opacity-90">Magic Button</div>
              </div>
            </div>
          </button>
        </div>

        {/* 营养目标卡片 */}
        <NutritionGoalCard />

        {/* 手动选择按钮 */}
        {state.restaurants.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <button
              onClick={() => dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'manual_selection' })}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-105 shadow-md"
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl">🍽️</span>
                <span>手动选择餐厅</span>
              </div>
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              直接选择餐厅并记录营养
            </p>
          </div>
        ) : (
          // 空状态卡片
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <div className="text-4xl mb-4">🏪</div>
            <h3 className="font-semibold text-gray-900 mb-2">还没有餐厅选项</h3>
            <p className="text-gray-600 text-sm mb-4">
              添加一些餐厅来开始使用智能推荐
            </p>
            <button
              onClick={() => dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'setup' })}
              className="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              添加第一家餐厅
            </button>
          </div>
        )}
      </div>
    </div>
  );
}