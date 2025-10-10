// 欢迎/首次设置界面组件 - Minimalist redesign
// Clean onboarding flow with subtle animations

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, Smartphone, Rocket, PartyPopper } from 'lucide-react';
import { QuickRestaurantForm } from './RestaurantForm.jsx';
import { useApp } from '../hooks/useApp.js';
import { useRestaurants } from '../hooks/useRestaurants.js';
import { Button } from './ui/Button.jsx';
import { Card } from './ui/Card.jsx';

export function WelcomeScreen() {
  const { dispatch, ActionTypes } = useApp();
  const { addRestaurant } = useRestaurants();
  const [currentStep, setCurrentStep] = useState('welcome'); // welcome, setup, complete

  // 进入设置流程
  const startSetup = () => {
    setCurrentStep('setup');
  };

  // 跳过设置，直接进入主界面
  const skipSetup = () => {
    dispatch({ type: ActionTypes.COMPLETE_SETUP });
  };

  // 添加餐厅
  const handleAddRestaurant = (restaurantData) => {
    addRestaurant(restaurantData.name, restaurantData.tier, restaurantData.mealTypes);
    setCurrentStep('complete');
  };

  // 完成设置
  const completeSetup = () => {
    dispatch({ type: ActionTypes.COMPLETE_SETUP });
  };

  // Setup screen
  if (currentStep === 'setup') {
    return (
      <div className="min-h-screen bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md mx-auto pt-8"
        >
          <div className="text-center mb-6">
            <h1 className="text-title font-semibold mb-2">添加第一个餐厅</h1>
            <p className="text-caption text-secondary">
              让我们先添加一些餐厅选项，开始使用智能推荐
            </p>
          </div>

          <QuickRestaurantForm
            onSubmit={handleAddRestaurant}
            onSkip={skipSetup}
          />
        </motion.div>
      </div>
    );
  }

  // Complete screen
  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="max-w-md mx-auto w-full"
        >
          <Card className="text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.2 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center"
            >
              <PartyPopper className="text-accent" size={32} aria-hidden="true" />
            </motion.div>

            <h2 className="text-section font-semibold mb-2">
              设置完成！
            </h2>
            <p className="text-body text-secondary mb-6">
              太棒了！你已经添加了第一个餐厅。<br />
              现在可以开始使用智能推荐功能了！
            </p>

            <Button
              variant="primary"
              size="large"
              onClick={completeSetup}
              className="w-full"
            >
              <Rocket size={20} />
              开始使用
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Welcome screen (default)
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto w-full"
      >
        <Card className="text-center">
          {/* Logo/Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center"
          >
            <Sparkles className="text-accent" size={40} aria-hidden="true" />
          </motion.div>

          {/* 标题 */}
          <h1 className="text-[2rem] font-bold mb-2">
            给我食物!
          </h1>

          {/* 副标题 */}
          <p className="text-section text-secondary mb-8">
            消除选择疲劳的神奇按钮
          </p>

          {/* 功能介绍 */}
          <div className="text-left space-y-4 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Sparkles size={20} className="text-accent" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-body mb-1">智能推荐</h3>
                <p className="text-caption text-secondary">
                  根据你的喜好和历史记录智能推荐餐厅
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Target size={20} className="text-accent" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-body mb-1">消除疲劳</h3>
                <p className="text-caption text-secondary">
                  再也不用为吃什么而烦恼，一键解决选择困难
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Smartphone size={20} className="text-accent" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-body mb-1">离线使用</h3>
                <p className="text-caption text-secondary">
                  数据保存在本地，随时随地可以使用
                </p>
              </div>
            </motion.div>
          </div>

          {/* 按钮组 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <Button
              variant="primary"
              size="large"
              onClick={startSetup}
              className="w-full"
            >
              <Rocket size={20} />
              开始设置
            </Button>
            <Button
              variant="secondary"
              onClick={skipSetup}
              className="w-full"
            >
              稍后设置
            </Button>
          </motion.div>

          {/* 隐私提示 */}
          <p className="text-caption text-secondary mt-6">
            所有数据仅保存在您的设备上，完全隐私安全
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
