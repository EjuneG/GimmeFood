// 营养输入组件
// 用户输入食物描述，调用API进行营养分析

import React, { useState, useMemo } from 'react';
import { useApp } from '../hooks/useApp.js';
import { MEAL_TYPE_NAMES } from '../utils/storage.js';
import { callServerlessFunction } from '../utils/apiEndpoints.js';
import { getRestaurantDishes, getCachedNutritionData, getYesterdayTotal } from '../utils/nutritionStorage.js';

export function NutritionInput() {
  const { state, dispatch, ActionTypes } = useApp();
  const { selectedRestaurant, selectedMealType } = state.currentFlow;
  const targetDate = state.nutrition.targetDate || 'today';
  const [foodInput, setFoodInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 获取昨天的营养总和（用于显示）
  const yesterdayTotal = useMemo(() => getYesterdayTotal(), [targetDate]);

  const handleDateChange = (newDate) => {
    dispatch({ type: ActionTypes.SET_TARGET_DATE, payload: newDate });
  };

  const handleCancel = () => {
    // 取消营养记录，返回主界面
    dispatch({ type: ActionTypes.RESET_SELECTION_FLOW });
  };

  // 处理点击历史菜品按钮
  const handleExampleClick = (dishDescription) => {
    // 检查是否有缓存的营养数据
    const cachedData = getCachedNutritionData(
      selectedRestaurant?.name,
      dishDescription
    );

    if (cachedData) {
      // 使用缓存数据，直接跳转到结果页面
      dispatch({
        type: ActionTypes.SET_NUTRITION_DATA,
        payload: {
          ...cachedData,
          restaurant: selectedRestaurant?.name,
          mealType: selectedMealType,
          foodDescription: dishDescription
        }
      });

      dispatch({
        type: ActionTypes.SET_FOOD_DESCRIPTION,
        payload: dishDescription
      });

      dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'nutrition_result' });
    } else {
      // 没有缓存数据，只填充输入框
      setFoodInput(dishDescription);
    }
  };

  const handleSubmit = async () => {
    if (!foodInput.trim()) {
      setError('请输入你吃了什么');
      return;
    }

    setLoading(true);
    setError(null);

    let response;
    try {
      // 构建完整的食物描述
      const fullDescription = `在${selectedRestaurant?.name || '餐厅'}吃了：${foodInput}`;

      // 调用 API (自动检测 Netlify/Vercel)
      response = await callServerlessFunction('analyze-nutrition', {
        foodDescription: fullDescription
      });

      const result = await response.json();

      if (result.success) {
        // 保存分析结果到状态
        dispatch({
          type: ActionTypes.SET_NUTRITION_DATA,
          payload: {
            ...result.data,
            restaurant: selectedRestaurant?.name,
            mealType: selectedMealType,
            foodDescription: foodInput
          }
        });

        // 保存食物描述
        dispatch({
          type: ActionTypes.SET_FOOD_DESCRIPTION,
          payload: foodInput
        });

        // 跳转到结果页面
        dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'nutrition_result' });
      } else {
        // 显示详细错误信息
        console.error('API Error:', result);
        const errorMsg = result.error || '分析失败，请重试';
        const details = result.details ? `\n详情: ${result.details}` : '';
        setError(errorMsg + details);
      }
    } catch (err) {
      console.error('Nutrition analysis error:', err);
      console.error('Error details:', {
        message: err.message,
        status: response?.status
      });
      setError(`网络错误: ${err.message || '请检查连接'}`);
    } finally {
      setLoading(false);
    }
  };

  // 根据选择的餐厅获取历史菜品，如果没有历史则显示通用示例
  const examples = useMemo(() => {
    if (selectedRestaurant?.name) {
      const restaurantDishes = getRestaurantDishes(selectedRestaurant.name, 8);
      if (restaurantDishes.length > 0) {
        return restaurantDishes;
      }
    }
    // 如果没有历史记录，返回通用示例
    return [
      '牛肉拉面、加蛋、小菜',
      '香辣鸡腿堡套餐、可乐',
      '番茄炒蛋、米饭、青菜汤',
      '咖啡、三明治'
    ];
  }, [selectedRestaurant?.name]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* 标题 */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🍜</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              你吃了什么？
            </h2>
            <p className="text-sm text-gray-600">
              简单描述即可，AI会帮你分析营养
            </p>
          </div>

          {/* 日期选择器 */}
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-2">📅 记录到哪一天？</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDateChange('today')}
                className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                  targetDate === 'today'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={loading}
              >
                今天
              </button>
              <button
                onClick={() => handleDateChange('yesterday')}
                className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                  targetDate === 'yesterday'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={loading}
              >
                昨天
              </button>
            </div>
            {/* 显示昨天的当前总量（如果选择了昨天） */}
            {targetDate === 'yesterday' && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-medium text-blue-800 mb-1">昨天的营养统计：</p>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center">
                    <p className="text-blue-600 font-bold">{yesterdayTotal.calories}</p>
                    <p className="text-gray-600">千卡</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-600 font-bold">{yesterdayTotal.protein}g</p>
                    <p className="text-gray-600">蛋白</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-600 font-bold">{yesterdayTotal.carbs}g</p>
                    <p className="text-gray-600">碳水</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-600 font-bold">{yesterdayTotal.fat}g</p>
                    <p className="text-gray-600">脂肪</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 餐厅信息 */}
          {selectedRestaurant && (
            <div className="bg-purple-50 rounded-lg p-3 mb-4 border border-purple-200">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🍽️</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {selectedRestaurant.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {MEAL_TYPE_NAMES[selectedMealType]}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 输入提示 */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              食物描述
            </label>
            <p className="text-xs text-gray-500 mb-2">
              💡 提示：越详细越准确（例如：份量、配菜等）
            </p>
          </div>

          {/* 文本输入框 */}
          <textarea
            value={foodInput}
            onChange={(e) => setFoodInput(e.target.value)}
            placeholder="例如：牛肉拉面、加蛋、小菜"
            rows="4"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none resize-none text-gray-800 placeholder-gray-400"
            disabled={loading}
          />

          {/* 错误提示 */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">❌ {error}</p>
            </div>
          )}

          {/* 示例建议或历史菜品 */}
          <div className="mt-4 mb-6">
            <p className="text-xs text-gray-600 mb-2">
              {selectedRestaurant?.name && getRestaurantDishes(selectedRestaurant.name, 1).length > 0
                ? '🕐 你之前吃过：'
                : '💡 示例：'}
            </p>
            <div className="flex flex-wrap gap-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-200 transition-colors"
                  disabled={loading}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* 行动按钮 */}
          <div className="space-y-3">
            <button
              onClick={handleSubmit}
              disabled={loading || !foodInput.trim()}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>分析中...</span>
                </span>
              ) : (
                '分析营养 🔍'
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={loading}
              className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              取消
            </button>
          </div>

          {/* 底部提示 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              * 仅供参考，基于AI粗略估算
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
