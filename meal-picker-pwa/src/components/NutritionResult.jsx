// 营养结果显示组件
// 显示AI分析的营养成分并保存到本地

import React, { useEffect } from 'react';
import { useApp } from '../hooks/useApp.js';
import { saveNutritionRecord, getTodayTotal } from '../utils/nutritionStorage.js';

export function NutritionResult() {
  const { state, dispatch, ActionTypes } = useApp();
  const { currentAnalysis } = state.nutrition;

  // 保存营养记录到本地存储
  useEffect(() => {
    if (currentAnalysis) {
      saveNutritionRecord({
        restaurant: currentAnalysis.restaurant,
        mealType: currentAnalysis.mealType,
        foodDescription: currentAnalysis.foodDescription,
        calories: currentAnalysis.calories,
        protein: currentAnalysis.protein,
        carbs: currentAnalysis.carbs,
        fat: currentAnalysis.fat,
        note: currentAnalysis.note
      });
    }
  }, [currentAnalysis]);

  const handleClose = () => {
    // 清除营养数据，返回主界面
    dispatch({ type: ActionTypes.RESET_SELECTION_FLOW });
  };

  const handleViewHistory = () => {
    // 未来功能：查看营养历史
    // 暂时显示今日总计
    const todayTotal = getTodayTotal();
    alert(`今日总计：
卡路里: ${todayTotal.calories} 千卡
蛋白质: ${todayTotal.protein}g
碳水: ${todayTotal.carbs}g
脂肪: ${todayTotal.fat}g`);
  };

  if (!currentAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">😅</div>
          <p className="text-gray-600">没有找到分析结果...</p>
          <button
            onClick={handleClose}
            className="mt-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            返回主页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* 成功图标 */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              营养分析完成！
            </h2>
            <p className="text-sm text-gray-600">
              * 仅供参考，基于AI粗略估算
            </p>
          </div>

          {/* 餐厅和食物描述 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🍽️</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">
                  {currentAnalysis.restaurant}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {currentAnalysis.foodDescription}
                </p>
              </div>
            </div>
          </div>

          {/* 营养成分网格 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* 卡路里 */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-700 mb-1">
                  {currentAnalysis.calories}
                </div>
                <div className="text-xs text-orange-600 font-medium">
                  千卡
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  🔥 热量
                </div>
              </div>
            </div>

            {/* 蛋白质 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700 mb-1">
                  {currentAnalysis.protein}g
                </div>
                <div className="text-xs text-blue-600 font-medium">
                  蛋白质
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  💪 Protein
                </div>
              </div>
            </div>

            {/* 碳水化合物 */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-700 mb-1">
                  {currentAnalysis.carbs}g
                </div>
                <div className="text-xs text-yellow-600 font-medium">
                  碳水化合物
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  🍞 Carbs
                </div>
              </div>
            </div>

            {/* 脂肪 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-700 mb-1">
                  {currentAnalysis.fat}g
                </div>
                <div className="text-xs text-purple-600 font-medium">
                  脂肪
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  🥑 Fat
                </div>
              </div>
            </div>
          </div>

          {/* 营养提示 */}
          {currentAnalysis.note && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-2">
                <div className="text-lg">💡</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 font-medium">
                    {currentAnalysis.note}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 今日统计预览 */}
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">📊</span>
                <span className="text-sm text-gray-700">
                  已记录到今日数据
                </span>
              </div>
              <button
                onClick={handleViewHistory}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                查看今日总计 →
              </button>
            </div>
          </div>

          {/* 行动按钮 */}
          <div className="space-y-3">
            <button
              onClick={handleClose}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
            >
              完成 🎉
            </button>
          </div>

          {/* 底部提示 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              数据已保存到本地，仅在你的设备上
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
