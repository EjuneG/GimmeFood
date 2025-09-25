// 欢迎/首次设置界面组件

import React, { useState } from 'react';
import { QuickRestaurantForm } from './RestaurantForm.jsx';
import { useApp } from '../hooks/useApp.js';
import { useRestaurants } from '../hooks/useRestaurants.js';

export function WelcomeScreen() {
  const { dispatch, ActionTypes } = useApp();
  const { addRestaurant } = useRestaurants();
  const [currentStep, setCurrentStep] = useState('welcome'); // welcome, setup, complete

  // 进入设置流程
  const startSetup = () => {
    setCurrentStep('setup');
  };

  // 跳过设置，直接进入主界面
  const skipSetup = () => {
    dispatch({ type: ActionTypes.COMPLETE_SETUP });
  };

  // 添加餐厅
  const handleAddRestaurant = (restaurantData) => {
    addRestaurant(restaurantData.name, restaurantData.tier, restaurantData.mealTypes);
    setCurrentStep('complete');
  };

  // 完成设置
  const completeSetup = () => {
    dispatch({ type: ActionTypes.COMPLETE_SETUP });
  };

  if (currentStep === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">添加第一个餐厅</h1>
            <p className="text-gray-600">
              让我们先添加一些餐厅选项，这样就可以开始使用"给我食物!"功能了
            </p>
          </div>

          <QuickRestaurantForm
            onSubmit={handleAddRestaurant}
            onSkip={skipSetup}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              设置完成！
            </h2>
            <p className="text-gray-600 mb-6">
              太棒了！你已经添加了第一个餐厅选项。现在可以开始使用"给我食物!"功能来消除选择疲劳了！
            </p>
            <button
              onClick={completeSetup}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              开始使用 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 默认欢迎界面
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo/Icon */}
          <div className="text-6xl mb-6">🍽️</div>

          {/* 标题 */}
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            给我食物!
          </h1>

          {/* 副标题 */}
          <p className="text-xl text-gray-600 mb-8">
            消除选择疲劳的神奇按钮
          </p>

          {/* 功能介绍 */}
          <div className="text-left space-y-4 mb-8">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">✨</div>
              <div>
                <h3 className="font-semibold text-gray-800">智能推荐</h3>
                <p className="text-sm text-gray-600">根据你的喜好和历史记录智能推荐餐厅</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🎯</div>
              <div>
                <h3 className="font-semibold text-gray-800">消除疲劳</h3>
                <p className="text-sm text-gray-600">再也不用为吃什么而烦恼，一键解决选择困难</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">📱</div>
              <div>
                <h3 className="font-semibold text-gray-800">离线使用</h3>
                <p className="text-sm text-gray-600">数据保存在本地，随时随地可以使用</p>
              </div>
            </div>
          </div>

          {/* 按钮组 */}
          <div className="space-y-3">
            <button
              onClick={startSetup}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              开始设置 🚀
            </button>
            <button
              onClick={skipSetup}
              className="w-full py-3 px-6 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              稍后设置
            </button>
          </div>

          {/* 版权信息 */}
          <p className="text-xs text-gray-400 mt-6">
            所有数据仅保存在您的设备上，完全隐私安全
          </p>
        </div>
      </div>
    </div>
  );
}