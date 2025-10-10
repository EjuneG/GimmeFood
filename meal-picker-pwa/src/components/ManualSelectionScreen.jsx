// 手动选择餐厅组件 - Minimalist redesign
// Clean restaurant selection without the magic button

import React, { useState } from 'react';
import { ChevronRight, ArrowLeft, Filter, Sunrise, Sun, Moon, Sparkles as SparklesIcon } from 'lucide-react';
import { useApp } from '../hooks/useApp.js';
import { MEAL_TYPE_NAMES, MEAL_TYPES, TIER_NAMES } from '../utils/storage.js';
import { Button } from './ui/Button.jsx';
import { Avatar } from './ui/Avatar.jsx';
import { Radio } from './ui/Radio.jsx';

export function ManualSelectionScreen() {
  const { state, dispatch, ActionTypes } = useApp();
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [filterTier, setFilterTier] = useState('all');

  const handleCancel = () => {
    dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'main' });
  };

  const handleRestaurantSelect = (restaurant) => {
    // 设置选中的餐厅和餐点类型
    dispatch({ type: ActionTypes.SET_SELECTED_RESTAURANT, payload: restaurant });
    dispatch({ type: ActionTypes.SET_SELECTED_MEAL_TYPE, payload: selectedMealType });

    // 直接跳转到营养输入界面
    dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'nutrition_input' });
  };

  // 获取当前时间推荐的餐点类型
  const getRecommendedMealType = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) return MEAL_TYPES.BREAKFAST;
    if (hour >= 10 && hour < 14) return MEAL_TYPES.LUNCH;
    if (hour >= 14 && hour < 18) return MEAL_TYPES.SNACK;
    return MEAL_TYPES.DINNER;
  };

  // 根据餐点类型和等级筛选餐厅
  const filteredRestaurants = state.restaurants.filter(r => {
    const mealTypeMatch = !selectedMealType || r.mealTypes.includes(selectedMealType);
    const tierMatch = filterTier === 'all' || r.tier === filterTier;
    return mealTypeMatch && tierMatch;
  });

  // 餐点类型图标映射
  const getMealIcon = (mealType) => {
    const icons = {
      breakfast: Sunrise,
      lunch: Sun,
      dinner: Moon,
      snack: SparklesIcon
    };
    return icons[mealType] || Sun;
  };

  // 获取餐厅首字母
  const getRestaurantInitial = (name) => {
    return name.charAt(0).toUpperCase();
  };

  // 判断是否为特色餐厅
  const isFeatured = (tier) => {
    return tier === 'hàng' || tier === 'dǐngjí';
  };

  // 如果还没选择餐点类型
  if (!selectedMealType) {
    const recommendedType = getRecommendedMealType();

    return (
      <div className="min-h-screen bg-background pb-20">
        {/* 头部 */}
        <div className="bg-surface border-b border-divider px-6 pt-12 pb-8">
          <div className="text-center">
            <h1 className="text-title font-semibold mb-2">手动选择</h1>
            <p className="text-caption text-secondary">选择餐点类型</p>
          </div>
        </div>

        {/* 餐点类型列表 */}
        <div className="px-4 pt-4 space-y-0">
          {Object.entries(MEAL_TYPES).map(([, value]) => {
            const isRecommended = value === recommendedType;
            const Icon = getMealIcon(value);

            return (
              <button
                key={value}
                onClick={() => setSelectedMealType(value)}
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
        </div>

        {/* 取消按钮 */}
        <div className="px-4 mt-6">
          <Button
            variant="secondary"
            onClick={handleCancel}
            className="w-full"
          >
            取消
          </Button>
        </div>
      </div>
    );
  }

  // 已选择餐点类型，显示餐厅列表
  const MealIcon = getMealIcon(selectedMealType);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 头部 */}
      <div className="bg-surface border-b border-divider px-6 pt-12 pb-8">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent/10 flex items-center justify-center">
            <MealIcon size={24} className="text-accent" />
          </div>
          <h1 className="text-title font-semibold mb-2">
            选择 {MEAL_TYPE_NAMES[selectedMealType]}
          </h1>
          <p className="text-caption text-secondary">
            选择一家餐厅记录营养
          </p>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="px-4 pt-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter size={16} className="text-secondary" />
          <span className="text-caption font-medium">等级筛选</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterTier('all')}
            className={`px-3 py-1.5 rounded-lg text-caption font-medium whitespace-nowrap transition-all
              ${filterTier === 'all'
                ? 'bg-accent text-white'
                : 'bg-muted text-secondary hover:bg-divider'
              }
            `}
          >
            全部
          </button>
          {Object.entries(TIER_NAMES).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setFilterTier(key)}
              className={`px-3 py-1.5 rounded-lg text-caption font-medium whitespace-nowrap transition-all
                ${filterTier === key
                  ? 'bg-accent text-white'
                  : 'bg-muted text-secondary hover:bg-divider'
                }
              `}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* 餐厅列表 */}
      <div className="px-4 space-y-0">
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map(restaurant => (
            <button
              key={restaurant.id}
              onClick={() => handleRestaurantSelect(restaurant)}
              className="flex items-center gap-3 w-full px-4 py-4 border-b border-divider hover:bg-muted transition-colors"
            >
              <Avatar
                initial={getRestaurantInitial(restaurant.name)}
                featured={isFeatured(restaurant.tier)}
              />
              <div className="flex-1 text-left">
                <h3 className="font-medium text-body">{restaurant.name}</h3>
                <p className="text-caption text-secondary">{TIER_NAMES[restaurant.tier]}</p>
              </div>
              <ChevronRight size={16} className="text-secondary" />
            </button>
          ))
        ) : (
          <div className="bg-surface rounded-2xl border border-divider p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
              <Filter size={24} className="text-secondary" />
            </div>
            <p className="text-body text-secondary mb-3">没有符合条件的餐厅</p>
            <button
              onClick={() => setFilterTier('all')}
              className="text-caption text-accent hover:text-accent-dark font-medium"
            >
              查看全部餐厅
            </button>
          </div>
        )}
      </div>

      {/* 返回按钮 */}
      <div className="px-4 mt-6">
        <Button
          variant="secondary"
          onClick={() => setSelectedMealType(null)}
          className="w-full"
        >
          <ArrowLeft size={16} />
          重选餐点类型
        </Button>
      </div>
    </div>
  );
}
