// 现代底部标签导航组件

import React from 'react';
import { useApp } from '../hooks/useApp.js';
import { ActionTypes } from '../constants/index.js';

export function BottomTabNavigation() {
  const { state, dispatch } = useApp();
  const currentStep = state.currentFlow.step;

  const tabs = [
    {
      id: 'main',
      label: '首页',
      icon: '🏠',
      activeIcon: '🏠',
      active: currentStep === 'main'
    },
    {
      id: 'gimme-food',
      label: '给我食物',
      icon: '🎲',
      activeIcon: '🎲',
      special: true, // 特殊按钮样式
      active: ['question', 'mealType', 'result', 'reselection'].includes(currentStep)
    },
    {
      id: 'management',
      label: '管理',
      icon: '⚙️',
      activeIcon: '⚙️',
      active: currentStep === 'management'
    }
  ];

  const handleTabClick = (tabId) => {
    if (tabId === 'gimme-food') {
      // 直接跳转到选择流程的第一步
      dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'main' });
      // 触发选择流程
      setTimeout(() => {
        const gimmeFoodButton = document.querySelector('[data-gimme-food-btn]');
        if (gimmeFoodButton) {
          gimmeFoodButton.click();
        }
      }, 100);
    } else {
      dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: tabId });
    }
  };

  // 如果在欢迎或设置流程中，不显示底部导航
  if (['welcome', 'setup'].includes(currentStep)) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-md mx-auto px-2 py-2">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                tab.special
                  ? tab.active
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg scale-110 -translate-y-2'
                    : 'bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-md hover:scale-105'
                  : tab.active
                  ? 'bg-blue-100 text-blue-600 scale-105'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.special && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              )}

              <div className={`text-xl mb-1 ${tab.special ? 'animate-bounce' : ''}`}>
                {tab.active ? tab.activeIcon : tab.icon}
              </div>

              <span className={`text-xs font-medium ${
                tab.special
                  ? 'text-white'
                  : tab.active
                    ? 'text-blue-600'
                    : 'text-gray-500'
              }`}>
                {tab.label}
              </span>

              {tab.active && !tab.special && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-blue-600 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Safe area for iPhone home indicator */}
      <div className="h-safe-bottom bg-white"></div>
    </div>
  );
}