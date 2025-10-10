// 本周营养统计视图
// 显示每日目标达成情况

import React, { useMemo } from 'react';
import { useApp } from '../hooks/useApp.js';
import { getNutritionByDateRange } from '../utils/nutritionStorage.js';
import { calculateProgress, getProgressStatus } from '../utils/nutritionGoalStorage.js';

export function WeeklyNutritionView() {
  const { state } = useApp();
  const goal = state.nutritionGoal;

  // 获取本周每一天的数据
  const weeklyBreakdown = useMemo(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // 周日开始
    weekStart.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const dayRecords = getNutritionByDateRange(day, dayEnd);
      const dayTotal = dayRecords.reduce((total, record) => ({
        calories: total.calories + (record.calories || 0),
        protein: total.protein + (record.protein || 0),
        carbs: total.carbs + (record.carbs || 0),
        fat: total.fat + (record.fat || 0)
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      // 计算每个营养素的进度
      const caloriesProgress = goal ? calculateProgress(dayTotal.calories, goal.calories) : 0;
      const proteinProgress = goal ? calculateProgress(dayTotal.protein, goal.protein) : 0;
      const carbsProgress = goal ? calculateProgress(dayTotal.carbs, goal.carbs) : 0;
      const fatProgress = goal ? calculateProgress(dayTotal.fat, goal.fat) : 0;

      days.push({
        date: day,
        dateStr: day.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', weekday: 'short' }),
        ...dayTotal,
        caloriesProgress,
        proteinProgress,
        carbsProgress,
        fatProgress,
        caloriesStatus: getProgressStatus(caloriesProgress)
      });
    }
    return days;
  }, [goal]);

  // 计算本周平均达成率（基于热量）
  const weekStats = useMemo(() => {
    const totalDays = weeklyBreakdown.length;
    const daysWithData = weeklyBreakdown.filter(day => day.calories > 0).length;
    const avgProgress = weeklyBreakdown.reduce((sum, day) => sum + day.caloriesProgress, 0) / totalDays;
    const daysOnTarget = weeklyBreakdown.filter(day => day.caloriesStatus === 'good').length;

    return { daysWithData, avgProgress: Math.round(avgProgress), daysOnTarget };
  }, [weeklyBreakdown]);

  const getColorClasses = (color, status) => {
    const colorMap = {
      orange: {
        low: 'bg-orange-200',
        good: 'bg-orange-500',
        high: 'bg-red-500',
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200'
      },
      blue: {
        low: 'bg-blue-200',
        good: 'bg-blue-500',
        high: 'bg-red-500',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200'
      },
      yellow: {
        low: 'bg-yellow-200',
        good: 'bg-yellow-500',
        high: 'bg-red-500',
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200'
      },
      purple: {
        low: 'bg-purple-200',
        good: 'bg-purple-500',
        high: 'bg-red-500',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200'
      }
    };
    return colorMap[color][status];
  };

  return (
    <div className="space-y-4">
      {/* 本周概览 */}
      {goal && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-indigo-700">{weekStats.daysOnTarget}</div>
              <div className="text-xs text-gray-600 mt-1">天达标</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-700">{weekStats.daysWithData}</div>
              <div className="text-xs text-gray-600 mt-1">天有记录</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">{weekStats.avgProgress}%</div>
              <div className="text-xs text-gray-600 mt-1">平均达成</div>
            </div>
          </div>
        </div>
      )}

      {/* 每日详情 */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <span className="mr-2">📅</span>
          每日目标达成
        </h4>
        <div className="space-y-3">
          {weeklyBreakdown.map((day, index) => {
            const hasData = day.calories > 0;
            const status = day.caloriesStatus;
            const progressWidth = Math.min(day.caloriesProgress, 100);

            return (
              <div key={index} className={`rounded-lg p-3 border ${
                hasData ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
              }`}>
                {/* Day header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {day.dateStr}
                  </span>
                  {goal && hasData && (
                    <span className={`text-xs font-semibold ${
                      status === 'good' ? 'text-green-600' :
                      status === 'low' ? 'text-gray-600' :
                      'text-red-600'
                    }`}>
                      {day.caloriesProgress}%
                    </span>
                  )}
                  {!hasData && (
                    <span className="text-xs text-gray-400">未记录</span>
                  )}
                </div>

                {/* Progress bar for calories */}
                {goal && hasData && (
                  <div className="mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          status === 'good' ? 'bg-green-500' :
                          status === 'low' ? 'bg-gray-400' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${progressWidth}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Nutrient details */}
                {hasData && (
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <span className="text-orange-600 font-semibold">{day.calories}</span>
                      <span className="text-gray-500">
                        {goal ? `/ ${goal.calories}` : ''} 千卡
                      </span>
                    </div>
                    <div className="flex space-x-3">
                      <span className="text-blue-600">
                        {day.protein}<span className="text-gray-500 ml-0.5">P</span>
                      </span>
                      <span className="text-yellow-600">
                        {day.carbs}<span className="text-gray-500 ml-0.5">C</span>
                      </span>
                      <span className="text-purple-600">
                        {day.fat}<span className="text-gray-500 ml-0.5">F</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
