// 抽象问题界面组件

import React, { useState } from 'react';
import { useApp } from '../hooks/useApp.js';
import { useSelection } from '../hooks/useSelection.js';
import { MEAL_TYPE_NAMES } from '../utils/storage.js';

export function QuestionScreen() {
  const { state } = useApp();
  const { selectAnswer, selectMealType } = useSelection();
  const [showMealTypeStep, setShowMealTypeStep] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const question = state.currentFlow.selectedQuestion;
  const mealType = state.currentFlow.selectedMealType;

  // 处理问题答案选择
  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);

    // 短暂延迟以显示选择效果
    setTimeout(() => {
      selectAnswer(answer);
      // 如果已经选择了餐点类型，直接进行推荐；否则显示餐点类型选择
      if (mealType) {
        selectMealType(mealType);
      } else {
        setShowMealTypeStep(true);
      }
    }, 800);
  };

  // 处理餐点类型选择
  const handleMealTypeSelect = (selectedMealType) => {
    selectMealType(selectedMealType);
  };

  // 获取当前时间对应的推荐餐点类型
  const getRecommendedMealType = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) return 'breakfast';
    if (hour >= 10 && hour < 14) return 'lunch';
    if (hour >= 14 && hour < 18) return 'snack';
    return 'dinner';
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🤔</div>
          <p className="text-gray-600">正在准备问题...</p>
        </div>
      </div>
    );
  }

  // 餐点类型选择步骤
  if (showMealTypeStep) {
    const recommendedType = getRecommendedMealType();

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-4">
        <div className="max-w-md mx-auto pt-12">
          {/* 进度指示 */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              选择餐点类型
            </h2>
            <p className="text-gray-600 text-center mb-6">
              现在想吃什么类型的食物？
            </p>

            <div className="space-y-4">
              {Object.entries(MEAL_TYPE_NAMES).map(([key, name]) => {
                const isRecommended = key === recommendedType;

                return (
                  <button
                    key={key}
                    onClick={() => handleMealTypeSelect(key)}
                    className={`w-full py-4 px-6 rounded-xl font-medium text-lg transition-all transform hover:scale-105 ${
                      isRecommended
                        ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{name}</span>
                      {isRecommended && (
                        <div className="flex items-center space-x-1">
                          <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                            推荐
                          </span>
                          <span className="text-sm">⏰</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 抽象问题选择步骤
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-md mx-auto pt-12">
        {/* 进度指示 */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* 问题标题 */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🔮</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {question.question}
            </h2>
            <p className="text-gray-600 text-sm">
              选择一个选项，让魔法为你决定...
            </p>
          </div>

          {/* 选项按钮 */}
          <div className="space-y-4">
            {question.options.map((option, index) => (
              <button
                key={option}
                onClick={() => handleAnswerSelect(option)}
                disabled={selectedAnswer !== null}
                className={`w-full py-4 px-6 rounded-xl font-medium text-lg transition-all transform hover:scale-105 ${
                  selectedAnswer === option
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
                    : selectedAnswer
                    ? 'bg-gray-200 text-gray-400'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-purple-100 hover:to-pink-100'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-2xl">{index === 0 ? '🌟' : '✨'}</span>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* 加载状态 */}
          {selectedAnswer && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center space-x-2 text-purple-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span className="text-sm">正在分析你的选择...</span>
              </div>
            </div>
          )}

          {/* 底部提示 */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              {question.effect ? '这个选择会影响推荐结果' : '纯心理作用，选择你的直觉'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}