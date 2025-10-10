// 结果显示和重选流程组件 - Minimalist redesign
// Clean recommendation result with subtle animations

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, RefreshCw, ArrowLeft, Sparkles } from 'lucide-react';
import { useApp } from '../hooks/useApp.js';
import { useSelection } from '../hooks/useSelection.js';
import { TIER_NAMES, MEAL_TYPE_NAMES } from '../utils/storage.js';
import { Button } from './ui/Button.jsx';
import { Card } from './ui/Card.jsx';
import { Avatar } from './ui/Avatar.jsx';

export function ResultScreen() {
  const { state } = useApp();
  const { acceptRecommendation, startReselection, selectFromReselectionOptions, skipTwoOptions } = useSelection();
  const [showAnimation, setShowAnimation] = useState(true);

  const { selectedRestaurant, selectedMealType, reselectionStep, reselectionOptions } = state.currentFlow;

  useEffect(() => {
    // 显示结果动画
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [selectedRestaurant]);

  if (!selectedRestaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="text-center max-w-sm">
          <div className="py-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <X size={32} className="text-secondary" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-body mb-2">没有找到合适的餐厅</h3>
            <p className="text-caption text-secondary">
              请添加更多餐厅或调整筛选条件
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // 加载动画界面
  if (showAnimation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, ease: "easeInOut", repeat: Infinity }}
            className="inline-block mb-6"
          >
            <Sparkles size={48} className="text-accent" aria-hidden="true" />
          </motion.div>
          <h2 className="text-section font-semibold text-primary mb-4">
            正在为你选择...
          </h2>
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 bg-accent rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 获取餐厅首字母
  const getRestaurantInitial = (name) => {
    return name.charAt(0).toUpperCase();
  };

  // 判断是否为特色餐厅
  const isFeatured = (tier) => {
    return tier === 'hàng' || tier === 'dǐngjí';
  };

  // 重选流程界面
  if (reselectionStep > 0) {
    let title, subtitle, buttonText;

    switch (reselectionStep) {
      case 1:
        title = "不满意？重新摇号！";
        subtitle = "给你一个新的选择";
        buttonText = "还是不喜欢";
        break;
      case 2:
        title = "选择困难？这里有两个选项";
        subtitle = "从这两个中选一个吧";
        buttonText = "显示更多选项";
        break;
      case 3:
        title = "所有可用选项";
        subtitle = "随便选一个，都很不错";
        buttonText = "重新开始";
        break;
      default:
        title = "推荐结果";
        subtitle = "";
        buttonText = "不满意";
    }

    return (
      <div className="min-h-screen bg-background p-4 pb-20">
        <div className="max-w-md mx-auto pt-8">
          <Card>
            <div className="text-center mb-6">
              <h2 className="text-section font-semibold mb-2">
                {title}
              </h2>
              <p className="text-caption text-secondary">
                {subtitle}
              </p>
            </div>

            {/* 单一选项 (步骤 1) */}
            {reselectionStep === 1 && (
              <div className="space-y-4">
                <div className="bg-muted rounded-xl p-4 border border-divider">
                  <div className="flex items-center gap-4">
                    <Avatar
                      initial={getRestaurantInitial(selectedRestaurant.name)}
                      featured={isFeatured(selectedRestaurant.tier)}
                    />
                    <div className="flex-1">
                      <h3 className="text-body font-semibold">{selectedRestaurant.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-caption text-secondary">
                        <span>{TIER_NAMES[selectedRestaurant.tier]}</span>
                        <span>·</span>
                        <span>{MEAL_TYPE_NAMES[selectedMealType]}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="primary"
                    onClick={acceptRecommendation}
                    className="flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    就吃它！
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={startReselection}
                  >
                    {buttonText}
                  </Button>
                </div>
              </div>
            )}

            {/* 两个选项 (步骤 2) */}
            {reselectionStep === 2 && (
              <div className="space-y-4">
                {reselectionOptions.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    onClick={() => selectFromReselectionOptions(restaurant)}
                    className="w-full bg-surface border-2 border-divider rounded-xl p-4 hover:border-accent hover:bg-muted transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar
                        initial={getRestaurantInitial(restaurant.name)}
                        featured={isFeatured(restaurant.tier)}
                      />
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-body">{restaurant.name}</h3>
                        <span className="text-caption text-secondary">
                          {TIER_NAMES[restaurant.tier]}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}

                <Button
                  variant="secondary"
                  onClick={skipTwoOptions}
                  className="w-full"
                >
                  {buttonText}
                </Button>
              </div>
            )}

            {/* 所有选项 (步骤 3) */}
            {reselectionStep === 3 && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {reselectionOptions.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    onClick={() => selectFromReselectionOptions(restaurant)}
                    className="w-full bg-surface border border-divider rounded-lg p-3 hover:border-accent hover:bg-muted transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        initial={getRestaurantInitial(restaurant.name)}
                        featured={isFeatured(restaurant.tier)}
                        className="w-8 h-8"
                      />
                      <div className="flex-1 text-left">
                        <h3 className="font-medium text-body">{restaurant.name}</h3>
                        <span className="text-caption text-secondary">
                          {TIER_NAMES[restaurant.tier]}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}

                <Button
                  variant="secondary"
                  onClick={() => window.location.reload()}
                  className="w-full mt-4"
                >
                  重新开始
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // 随机趣味文案
  const funTexts = ['今天就吃它！', '为你精选～', '随机推荐！'];
  const randomFunText = funTexts[Math.floor(Math.random() * funTexts.length)];

  // 初始推荐结果界面
  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-md mx-auto pt-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <Card>
            {/* 成功动画 */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.2 }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center"
              >
                <Check className="text-accent" size={32} aria-hidden="true" />
              </motion.div>
              <h2 className="text-section font-semibold mb-2">
                {randomFunText}
              </h2>
              <p className="text-caption text-secondary">
                基于你的偏好和历史记录
              </p>
            </div>

            {/* 推荐餐厅卡片 */}
            <div className="bg-muted rounded-2xl p-6 border border-divider mb-6">
              <div className="text-center">
                <Avatar
                  initial={getRestaurantInitial(selectedRestaurant.name)}
                  featured={isFeatured(selectedRestaurant.tier)}
                  className="w-16 h-16 mx-auto mb-4 text-title"
                />
                <h3 className="text-title font-semibold mb-2">
                  {selectedRestaurant.name}
                </h3>
                <div className="flex justify-center items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-accent/10 text-accent text-caption rounded-full font-medium">
                    {TIER_NAMES[selectedRestaurant.tier]}
                  </span>
                  <span className="text-secondary">·</span>
                  <span className="text-caption text-secondary">
                    {MEAL_TYPE_NAMES[selectedMealType]}
                  </span>
                </div>
                <div className="text-caption text-secondary">
                  权重算法推荐
                </div>
              </div>
            </div>

            {/* 行动按钮 */}
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={acceptRecommendation}
                size="large"
                className="w-full"
              >
                <Check size={20} />
                就吃它！
              </Button>

              <Button
                variant="secondary"
                onClick={startReselection}
                className="w-full"
              >
                <RefreshCw size={16} />
                不满意，重新选择
              </Button>

              <button
                onClick={() => window.location.reload()}
                className="w-full py-2 text-caption text-secondary hover:text-primary transition-colors flex items-center justify-center gap-2"
                aria-label="返回主菜单"
              >
                <ArrowLeft size={16} />
                返回主菜单
              </button>
            </div>
          </Card>

          {/* 底部提示 */}
          <div className="mt-6 text-center">
            <p className="text-caption text-secondary">
              选择后会记录你的偏好，下次推荐会更准确
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
