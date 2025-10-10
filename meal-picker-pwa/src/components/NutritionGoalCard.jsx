// 营养目标卡片组件
// 显示在主界面，展示目标和进度或提示设置目标

import React, { useState } from 'react';
import { useApp } from '../hooks/useApp.js';
import { getTodayTotal } from '../utils/nutritionStorage.js';
import { calculateProgress, getProgressStatus } from '../utils/nutritionGoalStorage.js';
import { WeeklyNutritionView } from './WeeklyNutritionView.jsx';

export function NutritionGoalCard() {
  const { state, dispatch, ActionTypes } = useApp();
  const hasGoal = state.nutritionGoal !== null;
  const todayTotal = getTodayTotal();
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'weekly'

  const handleSetupGoal = () => {
    dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'nutrition_goal_setup' });
  };

  // 如果没有设置目标，显示设置按钮
  if (!hasGoal) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">🎯</span>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">设置营养目标</h3>
          <p className="text-sm text-gray-600 mb-4">
            追踪每日摄入，掌控健康饮食
          </p>
          <button
            onClick={handleSetupGoal}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-md"
          >
            立即设置 →
          </button>
        </div>
      </div>
    );
  }

  // 如果有目标，显示进度
  const goal = state.nutritionGoal;

  const nutrients = [
    {
      name: '热量',
      current: todayTotal.calories,
      target: goal.calories,
      unit: '千卡',
      color: 'orange',
      emoji: '🔥'
    },
    {
      name: '蛋白质',
      current: todayTotal.protein,
      target: goal.protein,
      unit: 'g',
      color: 'blue',
      emoji: '💪'
    },
    {
      name: '碳水',
      current: todayTotal.carbs,
      target: goal.carbs,
      unit: 'g',
      color: 'yellow',
      emoji: '🍞'
    },
    {
      name: '脂肪',
      current: todayTotal.fat,
      target: goal.fat,
      unit: 'g',
      color: 'purple',
      emoji: '🥑'
    }
  ];

  const getColorClasses = (color, status) => {
    const colorMap = {
      orange: {
        low: 'bg-orange-200',
        good: 'bg-orange-500',
        high: 'bg-red-500',
        bg: 'bg-orange-50',
        text: 'text-orange-700'
      },
      blue: {
        low: 'bg-blue-200',
        good: 'bg-blue-500',
        high: 'bg-red-500',
        bg: 'bg-blue-50',
        text: 'text-blue-700'
      },
      yellow: {
        low: 'bg-yellow-200',
        good: 'bg-yellow-500',
        high: 'bg-red-500',
        bg: 'bg-yellow-50',
        text: 'text-yellow-700'
      },
      purple: {
        low: 'bg-purple-200',
        good: 'bg-purple-500',
        high: 'bg-red-500',
        bg: 'bg-purple-50',
        text: 'text-purple-700'
      }
    };
    return colorMap[color][status];
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* 标题栏 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="font-bold text-gray-900">
                {viewMode === 'daily' ? '今日营养' : '本周统计'}
              </h3>
              <p className="text-xs text-gray-500">目标追踪</p>
            </div>
          </div>
          <button
            onClick={handleSetupGoal}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            调整目标
          </button>
        </div>

        {/* View toggle buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('daily')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'daily'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            今日
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'weekly'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            本周
          </button>
        </div>
      </div>

      {/* 内容区域 - 根据viewMode显示不同内容 */}
      <div className="p-4">
        {viewMode === 'daily' ? (
          // 今日进度条
          <div className="space-y-3">
            {nutrients.map(nutrient => {
              const progress = calculateProgress(nutrient.current, nutrient.target);
              const status = getProgressStatus(progress);
              const progressWidth = Math.min(progress, 100);

              return (
                <div key={nutrient.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">{nutrient.emoji}</span>
                      <span className="text-sm font-medium text-gray-700">{nutrient.name}</span>
                    </div>
                    <div className="text-sm">
                      <span className={`font-bold ${
                        status === 'good' ? 'text-green-600' :
                        status === 'low' ? 'text-gray-600' :
                        'text-red-600'
                      }`}>
                        {nutrient.current}
                      </span>
                      <span className="text-gray-500">/{nutrient.target}{nutrient.unit}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getColorClasses(nutrient.color, status)}`}
                      style={{ width: `${progressWidth}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // 本周统计
          <WeeklyNutritionView />
        )}
      </div>

      {/* 提示信息 */}
      {viewMode === 'daily' && goal.note && (
        <div className="px-4 pb-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <p className="text-xs text-indigo-700">
              💡 {goal.note}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
