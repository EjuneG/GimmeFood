// 主界面组件 - 现代卡片化设计

import React, { useState } from 'react';
import { useApp } from '../hooks/useApp.js';
import { useSelection } from '../hooks/useSelection.js';
import { MEAL_TYPE_NAMES, MEAL_TYPES, TIER_NAMES } from '../utils/storage.js';

export function MainScreen() {
  const { state, dispatch, ActionTypes } = useApp();
  const { startSelection } = useSelection();
  const [showMealTypes, setShowMealTypes] = useState(false);

  // 开始选择流程
  const handleGimmeFoodClick = () => {
    setShowMealTypes(true);
  };

  // 选择餐点类型并开始推荐流程
  const handleMealTypeSelect = (mealType) => {
    setShowMealTypes(false);
    dispatch({
      type: ActionTypes.SET_SELECTED_MEAL_TYPE,
      payload: mealType
    });
    startSelection();
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">给我食物!</h1>
            <p className="text-blue-100 mt-1">{getGreeting()}，准备好选择了吗？</p>
          </div>
          <div className="text-4xl">🍽️</div>
        </div>

        {/* 统计卡片 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex justify-between text-center">
            <div>
              <div className="text-2xl font-bold">{state.restaurants.length}</div>
              <div className="text-xs text-blue-100">餐厅选项</div>
            </div>
            <div className="w-px bg-white/20"></div>
            <div>
              <div className="text-2xl font-bold">{state.user.preferences?.totalSelections || 0}</div>
              <div className="text-xs text-blue-100">总选择次数</div>
            </div>
            <div className="w-px bg-white/20"></div>
            <div>
              <div className="text-2xl font-bold">{
                state.restaurants.filter(r => r.tier === 'hàng').length
              }</div>
              <div className="text-xs text-blue-100">夯级餐厅</div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="px-4 -mt-4 space-y-4">
        {/* 主要操作卡片 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">准备好消除选择疲劳了吗？</h2>
            <p className="text-gray-600 text-sm">点击下方按钮，让算法为你选择最适合的餐厅</p>
          </div>

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

        {/* 快速操作卡片 */}
        {state.restaurants.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {/* 最近餐厅 */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg">⭐</span>
                </div>
                <h3 className="font-semibold text-sm text-gray-900">最爱餐厅</h3>
                <p className="text-xs text-gray-600 mt-1">
                  {state.restaurants.filter(r => r.tier === 'hàng').length} 家夯级
                </p>
              </div>
            </div>

            {/* 今日推荐 */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg">📅</span>
                </div>
                <h3 className="font-semibold text-sm text-gray-900">今日建议</h3>
                <p className="text-xs text-gray-600 mt-1">
                  {MEAL_TYPE_NAMES[getRecommendedMealType()]}时间
                </p>
              </div>
            </div>
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

        {/* 功能说明卡片 */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
          <h3 className="font-semibold text-gray-900 mb-3">智能推荐系统</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>基于餐厅等级智能权重分配</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>避免重复选择相同餐厅</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>根据反馈自动调整推荐</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}