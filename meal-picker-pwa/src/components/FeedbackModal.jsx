// 餐后反馈弹窗组件

import React, { useState } from 'react';
import { useApp } from '../hooks/useApp.js';
import { useSelection } from '../hooks/useSelection.js';
import { MEAL_TYPE_NAMES } from '../utils/storage.js';

export function FeedbackModal() {
  const { state } = useApp();
  const { submitFeedback, skipFeedback } = useSelection();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingFeedback = state.pendingFeedback;

  if (!pendingFeedback || !state.ui.showFeedback) {
    return null;
  }

  const handleFeedback = async (isPositive) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // 模拟网络请求
      submitFeedback(isPositive);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    skipFeedback();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
        {/* 头部 */}
        <div className="p-6 pb-4">
          <div className="text-center">
            <div className="text-4xl mb-3">🍽️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              上次的外卖怎么样？
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="font-medium text-gray-800">{pendingFeedback.restaurantName}</p>
              <p className="text-sm text-gray-600">
                {MEAL_TYPE_NAMES[pendingFeedback.mealType]} •
                {new Date(pendingFeedback.timestamp).toLocaleDateString()}
              </p>
            </div>
            <p className="text-gray-600 text-sm">
              你的反馈会帮助我们改进推荐算法
            </p>
          </div>
        </div>

        {/* 反馈选项 */}
        <div className="px-6 pb-4">
          <div className="space-y-3">
            <button
              onClick={() => handleFeedback(true)}
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
            >
              <div className="flex items-center justify-center space-x-2">
                <span>👍</span>
                <span>很好！</span>
              </div>
            </button>

            <button
              onClick={() => handleFeedback(false)}
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl font-medium hover:from-orange-500 hover:to-red-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
            >
              <div className="flex items-center justify-center space-x-2">
                <span>👎</span>
                <span>一般般</span>
              </div>
            </button>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="px-6 pb-6">
          <button
            onClick={handleSkip}
            disabled={isSubmitting}
            className="w-full py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm disabled:opacity-50"
          >
            跳过反馈
          </button>
        </div>

        {/* 加载状态 */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-2xl">
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              <span className="text-sm">处理中...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 反馈提示组件 (用于主界面显示)
export function FeedbackBanner() {
  const { state, dispatch, ActionTypes } = useApp();
  const pendingFeedback = state.pendingFeedback;

  if (!pendingFeedback || state.ui.showFeedback) {
    return null;
  }

  const showFeedbackModal = () => {
    dispatch({ type: ActionTypes.SET_SHOW_FEEDBACK, payload: true });
  };

  const skipFeedback = () => {
    dispatch({ type: ActionTypes.CLEAR_PENDING_FEEDBACK });
  };

  return (
    <div className="fixed top-4 left-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 shadow-lg z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🍽️</div>
          <div>
            <p className="font-medium text-sm">有个快速问题</p>
            <p className="text-xs opacity-90">上次在 {pendingFeedback.restaurantName} 吃得怎么样？</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={showFeedbackModal}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
          >
            反馈
          </button>
          <button
            onClick={skipFeedback}
            className="text-white/70 hover:text-white transition-colors text-sm"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}