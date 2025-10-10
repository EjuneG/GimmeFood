// 底部标签导航组件 - Minimalist redesign
// Clean, monochrome navigation with Lucide icons and spring animations

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Sparkles, BarChart3, Settings } from 'lucide-react';
import { useApp } from '../hooks/useApp.js';
import { ActionTypes } from '../constants/index.js';

export function BottomTabNavigation() {
  const { state, dispatch } = useApp();
  const currentStep = state.currentFlow.step;

  const tabs = [
    {
      id: 'main',
      label: '首页',
      Icon: Home,
      active: currentStep === 'main',
      ariaLabel: '首页导航'
    },
    {
      id: 'gimme-food',
      label: '给我食物',
      Icon: Sparkles,
      special: true, // 特殊按钮样式
      active: ['question', 'mealType', 'result', 'reselection'].includes(currentStep),
      ariaLabel: '随机推荐'
    },
    {
      id: 'nutrition_dashboard',
      label: '营养',
      Icon: BarChart3,
      active: ['nutrition_dashboard', 'nutrition_goal_setup', 'nutrition_prompt', 'nutrition_input', 'nutrition_result'].includes(currentStep),
      ariaLabel: '营养追踪'
    },
    {
      id: 'management',
      label: '管理',
      Icon: Settings,
      active: currentStep === 'management',
      ariaLabel: '餐厅管理'
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
    <nav
      className="fixed bottom-0 left-0 right-0 bg-surface border-t border-divider z-50 shadow-lg"
      aria-label="主导航"
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-16 safe-bottom">
        {tabs.map((tab) => {
          const { id, label, Icon, active, special, ariaLabel } = tab;

          return (
            <button
              key={id}
              onClick={() => handleTabClick(id)}
              className={`
                flex flex-col items-center justify-center
                w-full h-full
                transition-colors duration-base
                ${active ? 'text-accent' : 'text-secondary'}
                ${!special && 'hover:text-primary'}
              `}
              aria-label={ariaLabel}
              aria-current={active ? 'page' : undefined}
            >
              <motion.div
                animate={{
                  scale: active ? 1.1 : 1,
                  y: active ? -2 : 0
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25
                }}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 2}
                  aria-hidden="true"
                />
              </motion.div>
              <span
                className={`
                  text-[11px] mt-1
                  ${active ? 'font-semibold' : 'font-regular'}
                `}
              >
                {label}
              </span>

              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-accent rounded-full"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Screen reader only text for active tab */}
      <span className="sr-only">
        当前页面: {tabs.find(t => t.active)?.label}
      </span>
    </nav>
  );
}
