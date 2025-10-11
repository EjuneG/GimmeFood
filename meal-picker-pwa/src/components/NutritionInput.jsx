// 营养输入组件
// 用户输入食物描述，调用API进行营养分析

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Clock, Plus } from 'lucide-react';
import { useApp } from '../hooks/useApp.js';
import { MEAL_TYPE_NAMES } from '../utils/storage.js';
import { callServerlessFunction } from '../utils/apiEndpoints.js';
import { getRestaurantDishes, getCachedNutritionData } from '../utils/nutritionStorage.js';
import { Button } from './ui/Button.jsx';
import { Card } from './ui/Card.jsx';
import { cn } from '../utils/cn.js';

export function NutritionInput() {
  const { state, dispatch, ActionTypes } = useApp();
  const { selectedRestaurant, selectedMealType } = state.currentFlow;
  const [foodInput, setFoodInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCancel = () => {
    // 取消营养记录，返回主界面
    dispatch({ type: ActionTypes.RESET_SELECTION_FLOW });
  };

  // 处理点击历史菜品按钮
  const handleExampleClick = (dishDescription) => {
    // 检查是否有缓存的营养数据
    const cachedData = getCachedNutritionData(
      selectedRestaurant?.name,
      dishDescription
    );

    if (cachedData) {
      // 使用缓存数据，直接跳转到结果页面
      dispatch({
        type: ActionTypes.SET_NUTRITION_DATA,
        payload: {
          ...cachedData,
          restaurant: selectedRestaurant?.name,
          mealType: selectedMealType,
          foodDescription: dishDescription
        }
      });

      dispatch({
        type: ActionTypes.SET_FOOD_DESCRIPTION,
        payload: dishDescription
      });

      dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'nutrition_result' });
    } else {
      // 没有缓存数据，只填充输入框
      setFoodInput(dishDescription);
    }
  };

  const handleSubmit = async () => {
    if (!foodInput.trim()) {
      setError('请输入你吃了什么');
      return;
    }

    setLoading(true);
    setError(null);

    let response;
    try {
      // 构建完整的食物描述
      const fullDescription = `在${selectedRestaurant?.name || '餐厅'}吃了：${foodInput}`;

      // 调用 API (自动检测 Netlify/Vercel)
      response = await callServerlessFunction('analyze-nutrition', {
        foodDescription: fullDescription
      });

      const result = await response.json();

      if (result.success) {
        // 保存分析结果到状态
        dispatch({
          type: ActionTypes.SET_NUTRITION_DATA,
          payload: {
            ...result.data,
            restaurant: selectedRestaurant?.name,
            mealType: selectedMealType,
            foodDescription: foodInput
          }
        });

        // 保存食物描述
        dispatch({
          type: ActionTypes.SET_FOOD_DESCRIPTION,
          payload: foodInput
        });

        // 跳转到结果页面
        dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'nutrition_result' });
      } else {
        // 显示详细错误信息
        console.error('API Error:', result);
        const errorMsg = result.error || '分析失败，请重试';
        const details = result.details ? `\n详情: ${result.details}` : '';
        setError(errorMsg + details);
      }
    } catch (err) {
      console.error('Nutrition analysis error:', err);
      console.error('Error details:', {
        message: err.message,
        status: response?.status
      });
      setError(`网络错误: ${err.message || '请检查连接'}`);
    } finally {
      setLoading(false);
    }
  };

  // 根据选择的餐厅获取历史菜品，如果没有历史则显示通用示例
  const examples = useMemo(() => {
    if (selectedRestaurant?.name) {
      const restaurantDishes = getRestaurantDishes(selectedRestaurant.name, 8);
      if (restaurantDishes.length > 0) {
        return restaurantDishes;
      }
    }
    // 如果没有历史记录，返回通用示例
    return [
      '牛肉拉面、加蛋、小菜',
      '香辣鸡腿堡套餐、可乐',
      '番茄炒蛋、米饭、青菜汤',
      '咖啡、三明治'
    ];
  }, [selectedRestaurant?.name]);

  const hasHistory = selectedRestaurant?.name &&
    getRestaurantDishes(selectedRestaurant.name, 1).length > 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-surface border-b border-divider px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="返回"
          >
            <ArrowLeft size={20} className="text-secondary" />
          </button>
        </div>
        <div>
          <h1 className="text-title font-semibold mb-2">记录营养</h1>
          <p className="text-caption text-secondary">
            简单描述即可，AI会帮你分析营养成分
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-4 pt-6 space-y-4"
      >
        {/* 餐厅/做饭信息 */}
        {selectedRestaurant && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                selectedRestaurant.isHomeCooking ? "bg-accent/10" : "bg-muted"
              )}>
                <Sparkles size={20} className={cn(
                  selectedRestaurant.isHomeCooking ? "text-accent" : "text-secondary"
                )} />
              </div>
              <div className="flex-1">
                <h3 className="text-body font-medium">{selectedRestaurant.name}</h3>
                <p className="text-caption text-secondary">
                  {MEAL_TYPE_NAMES[selectedMealType]}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* 输入区域 */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="food-input" className="block text-body font-medium mb-2">
                你吃了什么？<span className="text-accent">*</span>
              </label>
              <p className="text-caption text-secondary mb-3">
                提示：越详细越准确（例如：份量、配菜等）
              </p>
              <textarea
                id="food-input"
                value={foodInput}
                onChange={(e) => setFoodInput(e.target.value)}
                placeholder={
                  selectedRestaurant?.isHomeCooking
                    ? "例如：番茄炒蛋、米饭、青菜汤"
                    : "例如：牛肉拉面、加蛋、小菜"
                }
                rows="4"
                className={cn(
                  "w-full px-4 py-3 border-2 rounded-xl bg-surface",
                  "focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent",
                  "transition-all text-body resize-none",
                  error ? "border-accent" : "border-divider"
                )}
                disabled={loading}
                aria-invalid={!!error}
                aria-describedby={error ? "food-input-error" : undefined}
              />
              {error && (
                <p id="food-input-error" className="text-accent text-caption mt-1.5" role="alert">
                  {error}
                </p>
              )}
            </div>

            {/* 示例建议或历史菜品 */}
            {examples.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-secondary" />
                  <p className="text-caption text-secondary">
                    {hasHistory ? '你之前吃过：' : '示例：'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {examples.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-caption transition-colors",
                        "bg-muted text-secondary hover:bg-divider hover:text-primary",
                        "border border-divider"
                      )}
                      disabled={loading}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 行动按钮 */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="large"
            onClick={handleSubmit}
            disabled={loading || !foodInput.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, ease: "linear", repeat: Infinity }}
                >
                  <Sparkles size={20} />
                </motion.div>
                <span>分析中...</span>
              </>
            ) : (
              <>
                <Plus size={20} />
                <span>分析营养</span>
              </>
            )}
          </Button>

          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={loading}
            className="w-full"
          >
            取消
          </Button>
        </div>

        {/* 底部提示 */}
        <div className="text-center pt-2">
          <p className="text-caption text-secondary">
            * 仅供参考，基于AI粗略估算
          </p>
        </div>
      </motion.div>
    </div>
  );
}
