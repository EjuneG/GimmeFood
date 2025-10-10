// 本周营养统计视图
// 显示本周的营养摄入总和和平均值

import React, { useMemo } from 'react';
import { useApp } from '../hooks/useApp.js';
import { getWeekTotal, getNutritionByDateRange } from '../utils/nutritionStorage.js';
import { calculateProgress, getProgressStatus } from '../utils/nutritionGoalStorage.js';

export function WeeklyNutritionView() {
  const { state } = useApp();
  const goal = state.nutritionGoal;
  const weekTotal = useMemo(() => getWeekTotal(), []);

  // 计算每日平均值
  const dailyAverage = useMemo(() => ({
    calories: Math.round(weekTotal.calories / 7),
    protein: Math.round(weekTotal.protein / 7),
    carbs: Math.round(weekTotal.carbs / 7),
    fat: Math.round(weekTotal.fat / 7)
  }), [weekTotal]);

  // 获取本周每一天的数据（用于详细视图）
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

      days.push({
        date: day,
        dateStr: day.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', weekday: 'short' }),
        ...dayTotal
      });
    }
    return days;
  }, []);

  const nutrients = [
    {
      name: '热量',
      weekly: weekTotal.calories,
      daily: dailyAverage.calories,
      weeklyGoal: goal ? goal.calories * 7 : null,
      dailyGoal: goal ? goal.calories : null,
      unit: '千卡',
      color: 'orange',
      emoji: '🔥'
    },
    {
      name: '蛋白质',
      weekly: weekTotal.protein,
      daily: dailyAverage.protein,
      weeklyGoal: goal ? goal.protein * 7 : null,
      dailyGoal: goal ? goal.protein : null,
      unit: 'g',
      color: 'blue',
      emoji: '💪'
    },
    {
      name: '碳水',
      weekly: weekTotal.carbs,
      daily: dailyAverage.carbs,
      weeklyGoal: goal ? goal.carbs * 7 : null,
      dailyGoal: goal ? goal.carbs : null,
      unit: 'g',
      color: 'yellow',
      emoji: '🍞'
    },
    {
      name: '脂肪',
      weekly: weekTotal.fat,
      daily: dailyAverage.fat,
      weeklyGoal: goal ? goal.fat * 7 : null,
      dailyGoal: goal ? goal.fat : null,
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
      {/* 本周总计 */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <span className="mr-2">📊</span>
          本周总计
        </h4>
        <div className="space-y-3">
          {nutrients.map(nutrient => {
            const progress = nutrient.weeklyGoal
              ? calculateProgress(nutrient.weekly, nutrient.weeklyGoal)
              : 0;
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
                      nutrient.weeklyGoal ? (
                        status === 'good' ? 'text-green-600' :
                        status === 'low' ? 'text-gray-600' :
                        'text-red-600'
                      ) : 'text-gray-700'
                    }`}>
                      {nutrient.weekly}
                    </span>
                    {nutrient.weeklyGoal && (
                      <span className="text-gray-500">/{nutrient.weeklyGoal}{nutrient.unit}</span>
                    )}
                    {!nutrient.weeklyGoal && (
                      <span className="text-gray-500"> {nutrient.unit}</span>
                    )}
                  </div>
                </div>
                {nutrient.weeklyGoal && (
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getColorClasses(nutrient.color, status)}`}
                      style={{ width: `${progressWidth}%` }}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 日均摄入 */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <span className="mr-2">📈</span>
          日均摄入
        </h4>
        <div className="grid grid-cols-4 gap-3">
          {nutrients.map(nutrient => (
            <div key={nutrient.name} className="text-center">
              <div className={`text-lg font-bold ${getColorClasses(nutrient.color, 'text')}`}>
                {nutrient.daily}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {nutrient.emoji} {nutrient.unit}
              </div>
              {nutrient.dailyGoal && (
                <div className="text-xs text-gray-500 mt-0.5">
                  / {nutrient.dailyGoal}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 每日详情 */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <span className="mr-2">📅</span>
          每日详情
        </h4>
        <div className="space-y-2">
          {weeklyBreakdown.map((day, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">
                  {day.dateStr}
                </span>
                <div className="flex space-x-3 text-xs">
                  <span className="text-orange-600">
                    {day.calories}<span className="text-gray-500 ml-0.5">kcal</span>
                  </span>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
