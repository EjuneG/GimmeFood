// 主界面组件 - Minimalist redesign
// Home screen with clean, monochrome aesthetic and Lucide icons

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shuffle, ChefHat, List, X, Sunrise, Sun, Moon, Sparkles, ChevronRight } from 'lucide-react';
import { useApp } from '../hooks/useApp.js';
import { useSelection } from '../hooks/useSelection.js';
import { MEAL_TYPE_NAMES, MEAL_TYPES } from '../utils/storage.js';
import { Button } from './ui/Button.jsx';
import { Card } from './ui/Card.jsx';
import { Radio } from './ui/Radio.jsx';

export function MainScreen() {
  const { state, dispatch, ActionTypes } = useApp();
  const { selectMealType } = useSelection();
  const [showMealTypes, setShowMealTypes] = useState(false);
  const [cookMyselfMode, setCookMyselfMode] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  // 开始选择流程
  const handleGimmeFoodClick = () => {
    setCookMyselfMode(false);
    setShowMealTypes(true);
  };

  // 开始"自己做饭"流程
  const handleCookMyselfClick = () => {
    setCookMyselfMode(true);
    setShowMealTypes(true);
  };

  // 选择餐点类型并开始推荐流程
  const handleMealTypeSelect = (mealType) => {
    setShowMealTypes(false);

    if (cookMyselfMode) {
      // Cook for myself flow: skip restaurant selection, go directly to nutrition input
      const homeCookingRestaurant = {
        id: 'home_cooking',
        name: '自己做饭',
        tier: null,
        isHomeCooking: true
      };

      dispatch({ type: ActionTypes.SET_SELECTED_RESTAURANT, payload: homeCookingRestaurant });
      dispatch({ type: ActionTypes.SET_SELECTED_MEAL_TYPE, payload: mealType });
      dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'nutrition_input' });
      setCookMyselfMode(false);
    } else {
      // Regular magic button flow with shuffle animation
      setIsShuffling(true);
      setTimeout(() => setIsShuffling(false), 600);
      selectMealType(mealType);
    }
  };

  // 获取当前时间对应的推荐餐点类型
  const getRecommendedMealType = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) return MEAL_TYPES.BREAKFAST;
    if (hour >= 10 && hour < 14) return MEAL_TYPES.LUNCH;
    if (hour >= 14 && hour < 18) return MEAL_TYPES.SNACK;
    return MEAL_TYPES.DINNER;
  };

  // 获取时间问候语
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早安';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  // 餐点类型图标映射 (emoji → Lucide icons)
  const getMealIcon = (mealType) => {
    const icons = {
      breakfast: Sunrise,
      lunch: Sun,
      dinner: Moon,
      snack: Sparkles
    };
    return icons[mealType] || Sun;
  };

  // 餐点类型选择界面
  if (showMealTypes) {
    const recommendedType = getRecommendedMealType();

    return (
      <motion.div
        initial={{ x: '100%', opacity: 0.8 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '-50%', opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
        className="min-h-screen bg-background pb-20"
      >
        {/* 头部 */}
        <div className="bg-surface border-b border-divider">
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-section font-semibold">选择餐点类型</h2>
              <p className="text-caption text-secondary mt-0.5">
                {cookMyselfMode ? '你做了什么类型的菜？' : '现在想吃什么类型的食物？'}
              </p>
            </div>
            <button
              onClick={() => setShowMealTypes(false)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="关闭"
            >
              <X size={20} className="text-secondary" />
            </button>
          </div>
        </div>

        {/* 餐点类型列表 */}
        <div className="px-4 pt-4 space-y-0">
          {Object.entries(MEAL_TYPES).map(([, value]) => {
            const isRecommended = value === recommendedType && !cookMyselfMode;
            const Icon = getMealIcon(value);

            return (
              <button
                key={value}
                onClick={() => handleMealTypeSelect(value)}
                className={`
                  flex items-center gap-4 w-full
                  h-16 px-5 py-3
                  border-b border-divider
                  hover:bg-muted
                  transition-colors duration-fast
                  ${isRecommended ? 'bg-muted' : ''}
                `}
              >
                {/* Radio */}
                <Radio checked={false} />

                {/* Icon + Text */}
                <Icon size={20} className="text-secondary flex-shrink-0" />
                <span className="flex-1 text-left font-medium text-body">{MEAL_TYPE_NAMES[value]}</span>

                {/* Recommended Badge */}
                {isRecommended && (
                  <div className="text-caption text-accent bg-accent/10 px-2 py-1 rounded-full font-medium">
                    推荐
                  </div>
                )}

                {/* Chevron */}
                <ChevronRight size={16} className="text-secondary" />
              </button>
            );
          })}

          {/* Helper text for recommended */}
          {!cookMyselfMode && (
            <p className="text-caption text-secondary px-5 py-3">
              基于当前时间推荐 {MEAL_TYPE_NAMES[recommendedType]}
            </p>
          )}
        </div>

        {/* 取消按钮 */}
        <div className="px-4 mt-6">
          <Button
            variant="secondary"
            onClick={() => setShowMealTypes(false)}
            className="w-full"
          >
            取消
          </Button>
        </div>
      </motion.div>
    );
  }

  // 主界面
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 头部 */}
      <div className="bg-surface border-b border-divider px-6 pt-12 pb-8">
        <div className="text-center">
          <h1 className="text-title font-semibold mb-2">给我食物!</h1>
          <p className="text-caption text-secondary">今天想吃什么?</p>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="px-4 pt-6 space-y-4">
        {/* 主要操作 - 随机推荐 */}
        <motion.div whileTap={{ scale: 0.98 }}>
          <button
            data-gimme-food-btn
            onClick={handleGimmeFoodClick}
            className="
              flex items-center justify-center gap-3
              w-full h-14 rounded-2xl
              bg-accent text-white font-semibold
              hover:bg-accent-light hover:scale-[1.02]
              active:scale-[0.98]
              transition-all duration-base
              shadow-md hover:shadow-lg
            "
            aria-label="随机推荐餐厅"
          >
            <motion.div
              animate={{ rotate: isShuffling ? 360 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <Shuffle size={20} />
            </motion.div>
            <div className="flex flex-col items-start">
              <span className="text-body">随机推荐</span>
              <span className="text-caption opacity-80">Surprise me</span>
            </div>
          </button>
        </motion.div>

        {/* 次要操作 - 两栏布局 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 自己做饭 */}
          <Button
            variant="secondary"
            onClick={handleCookMyselfClick}
            data-cook-myself-btn
            className="h-24 flex-col gap-2"
            aria-label="记录自己做的菜"
          >
            <ChefHat size={20} />
            <span className="text-sm">自己做饭</span>
          </Button>

          {/* 手动选择 */}
          {state.restaurants.length > 0 ? (
            <Button
              variant="secondary"
              onClick={() => dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'manual_selection' })}
              className="h-24 flex-col gap-2"
              aria-label="手动选择餐厅"
            >
              <List size={20} />
              <span className="text-sm">手动选择</span>
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'setup' })}
              className="h-24 flex-col gap-2"
              aria-label="添加餐厅"
            >
              <List size={20} />
              <span className="text-sm">添加餐厅</span>
            </Button>
          )}
        </div>

        {/* 空状态提示 */}
        {state.restaurants.length === 0 && (
          <Card className="text-center">
            <div className="py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <List size={32} className="text-secondary" />
              </div>
              <h3 className="font-semibold text-body mb-2">还没有餐厅选项</h3>
              <p className="text-caption text-secondary mb-4">
                添加一些餐厅来开始使用智能推荐
              </p>
              <Button
                variant="primary"
                onClick={() => dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'setup' })}
              >
                添加第一家餐厅
              </Button>
            </div>
          </Card>
        )}

        {/* 问候语提示 */}
        <div className="px-2 py-4 text-center">
          <p className="text-caption text-secondary">{getGreeting()}，准备好选择了吗？</p>
        </div>
      </div>
    </div>
  );
}
