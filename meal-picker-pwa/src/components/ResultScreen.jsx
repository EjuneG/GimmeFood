// 结果显示和重选流程组件

import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp.js';
import { useSelection } from '../hooks/useSelection.js';
import { TIER_NAMES, MEAL_TYPE_NAMES } from '../utils/storage.js';

export function ResultScreen() {
  const { state } = useApp();
  const { acceptRecommendation, startReselection, selectFromReselectionOptions, skipTwoOptions } = useSelection();
  const [showAnimation, setShowAnimation] = useState(true);

  const { selectedRestaurant, selectedMealType, reselectionStep, reselectionOptions } = state.currentFlow;

  useEffect(() => {
    // 显示结果动画
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [selectedRestaurant]);

  if (!selectedRestaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">😅</div>
          <p className="text-gray-600">没有找到合适的餐厅...</p>
        </div>
      </div>
    );
  }

  // 加载动画界面
  if (showAnimation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-6 animate-bounce">🎲</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            正在为你选择...
          </h2>
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // 重选流程界面
  if (reselectionStep > 0) {
    let title, subtitle, buttonText;

    switch (reselectionStep) {
      case 1:
        title = "不满意？重新摇号！";
        subtitle = "给你一个新的选择";
        buttonText = "还是不喜欢";
        break;
      case 2:
        title = "选择困难？这里有两个选项";
        subtitle = "从这两个中选一个吧";
        buttonText = "显示更多选项";
        break;
      case 3:
        title = "所有可用选项";
        subtitle = "随便选一个，都很不错";
        buttonText = "重新开始";
        break;
      default:
        title = "推荐结果";
        subtitle = "";
        buttonText = "不满意";
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              {title}
            </h2>
            <p className="text-gray-600 text-center mb-6">
              {subtitle}
            </p>

            {/* 单一选项 (步骤 1) */}
            {reselectionStep === 1 && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">🍽️</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{selectedRestaurant.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {TIER_NAMES[selectedRestaurant.tier]}
                        </span>
                        <span className="text-sm text-gray-600">
                          {MEAL_TYPE_NAMES[selectedMealType]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={acceptRecommendation}
                    className="flex-1 py-3 px-4 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                  >
                    就吃它！
                  </button>
                  <button
                    onClick={startReselection}
                    className="flex-1 py-3 px-4 bg-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-400 transition-colors"
                  >
                    {buttonText}
                  </button>
                </div>
              </div>
            )}

            {/* 两个选项 (步骤 2) */}
            {reselectionStep === 2 && (
              <div className="space-y-4">
                {reselectionOptions.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    onClick={() => selectFromReselectionOptions(restaurant)}
                    className="w-full bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 hover:border-purple-400 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">🍽️</div>
                      <div className="flex-1 text-left">
                        <h3 className="font-bold text-gray-800">{restaurant.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {TIER_NAMES[restaurant.tier]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}

                <button
                  onClick={skipTwoOptions}
                  className="w-full py-3 px-4 bg-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-400 transition-colors mt-4"
                >
                  {buttonText}
                </button>
              </div>
            )}

            {/* 所有选项 (步骤 3) */}
            {reselectionStep === 3 && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {reselectionOptions.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    onClick={() => selectFromReselectionOptions(restaurant)}
                    className="w-full bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">🍽️</div>
                      <div className="flex-1 text-left">
                        <h3 className="font-medium text-gray-800">{restaurant.name}</h3>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                          {TIER_NAMES[restaurant.tier]}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}

                <button
                  onClick={() => {
                    // 重新开始整个选择流程
                    window.location.reload(); // 简单重新开始
                  }}
                  className="w-full py-3 px-4 bg-red-300 text-red-800 rounded-xl font-medium hover:bg-red-400 transition-colors mt-4"
                >
                  重新开始
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 随机趣味文案
  const funTexts = ['今天就吃它！', '为你精选～', '随机推荐！'];
  const randomFunText = funTexts[Math.floor(Math.random() * funTexts.length)];

  // 初始推荐结果界面
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-md mx-auto pt-12">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* 成功图标 */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {randomFunText}
            </h2>
            <p className="text-gray-600">
              基于你的偏好和历史记录
            </p>
          </div>

          {/* 推荐餐厅卡片 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 mb-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🍽️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedRestaurant.name}
              </h3>
              <div className="flex justify-center items-center space-x-2 mb-3">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                  {TIER_NAMES[selectedRestaurant.tier]}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-600">
                  {MEAL_TYPE_NAMES[selectedMealType]}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                ID: {selectedRestaurant.id.slice(-6)} • 权重算法推荐
              </div>
            </div>
          </div>

          {/* 行动按钮 */}
          <div className="space-y-3">
            <button
              onClick={acceptRecommendation}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
            >
              就吃它！ 🚀
            </button>

            <button
              onClick={startReselection}
              className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              不满意，重新选择
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 text-gray-500 hover:text-gray-700 transition-colors text-sm"
            >
              返回主菜单
            </button>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            选择后会记录你的偏好，下次推荐会更准确
          </p>
        </div>
      </div>
    </div>
  );
}