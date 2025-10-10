// 营养追踪专用页面
// Dedicated page for nutrition tracking and goal management

import React from 'react';
import { useApp } from '../hooks/useApp.js';
import { NutritionGoalCard } from './NutritionGoalCard.jsx';

export function NutritionDashboard() {
  const { state } = useApp();
  const hasGoal = state.nutritionGoal !== null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white px-6 pt-12 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">营养追踪</h1>
            <p className="text-indigo-100 mt-1">
              {hasGoal ? '跟踪你的每日营养摄入' : '设置目标，开始追踪'}
            </p>
          </div>
          <div className="text-4xl">📊</div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 -mt-4 space-y-4">
        {/* Nutrition Goal Card */}
        <NutritionGoalCard />

        {/* Info Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">如何记录营养？</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>使用"给我食物"魔法按钮后，可选择记录营养</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>手动选择餐厅，直接记录吃过的食物</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>使用"自己做饭"记录家常菜营养</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {hasGoal && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-sm p-4 border border-purple-100">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">快速操作</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>📈 本周营养统计：展开营养卡片查看</p>
              <p>📅 切换日期：使用今天/昨天切换按钮</p>
              <p>⚙️ 调整目标：点击"调整目标"按钮</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
