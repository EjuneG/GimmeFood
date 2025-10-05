// 营养记录提示组件
// 在用户接受推荐后显示，询问是否要记录营养

import React from 'react';
import { useApp } from '../hooks/useApp.js';

export function NutritionPrompt() {
  const { state, dispatch, ActionTypes } = useApp();
  const { selectedRestaurant, selectedMealType } = state.currentFlow;

  const handleSkip = () => {
    // 跳过营养记录，返回主界面
    dispatch({ type: ActionTypes.RESET_SELECTION_FLOW });
  };

  const handleRecord = () => {
    // 进入营养输入界面
    dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'nutrition_input' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* 图标和标题 */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            要记录这餐的营养吗？
          </h2>
          <p className="text-gray-600 text-sm">
            (可选功能，不影响正常使用)
          </p>
        </div>

        {/* 餐厅信息 */}
        {selectedRestaurant && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🍽️</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">
                  {selectedRestaurant.name}
                </h3>
                <p className="text-sm text-gray-600">
                  记录营养成分，追踪每日摄入
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 功能说明 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <div className="text-lg">💡</div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                <strong>AI营养分析</strong>：通过简单描述你吃了什么，AI会估算卡路里、蛋白质、碳水和脂肪。
              </p>
              <p className="text-xs text-gray-600 mt-1">
                * 仅供参考，基于粗略估算
              </p>
            </div>
          </div>
        </div>

        {/* 行动按钮 */}
        <div className="space-y-3">
          <button
            onClick={handleRecord}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
          >
            记录营养 📝
          </button>

          <button
            onClick={handleSkip}
            className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
          >
            跳过，下次再说
          </button>
        </div>

        {/* 底部提示 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            营养数据仅保存在本地，不会上传到服务器
          </p>
        </div>
      </div>
    </div>
  );
}
