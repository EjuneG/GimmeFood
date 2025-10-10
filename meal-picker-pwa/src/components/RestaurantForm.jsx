// 餐厅输入表单组件 - Minimalist redesign
// Clean form with proper validation and accessibility

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { TIER_NAMES, TIERS, MEAL_TYPE_NAMES, MEAL_TYPES } from '../utils/storage.js';
import { Button } from './ui/Button.jsx';
import { Card } from './ui/Card.jsx';

export function RestaurantForm({ onSubmit, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    tier: initialData?.tier || TIERS.TOP,
    mealTypes: initialData?.mealTypes || []
  });

  const [errors, setErrors] = useState({});

  // 验证表单
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入餐厅名称';
    }

    if (formData.mealTypes.length === 0) {
      newErrors.mealTypes = '请至少选择一种餐点类型';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // 处理餐点类型切换
  const toggleMealType = (mealType) => {
    const newMealTypes = formData.mealTypes.includes(mealType)
      ? formData.mealTypes.filter(type => type !== mealType)
      : [...formData.mealTypes, mealType];

    setFormData({ ...formData, mealTypes: newMealTypes });
    // 清除错误
    if (newMealTypes.length > 0 && errors.mealTypes) {
      setErrors({ ...errors, mealTypes: undefined });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-title font-semibold">
              {initialData ? '编辑餐厅' : '添加餐厅'}
            </h2>
            {onCancel && (
              <button
                onClick={onCancel}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="关闭"
              >
                <X size={20} className="text-secondary" />
              </button>
            )}
          </div>
          <p className="text-caption text-secondary">
            {initialData ? '修改餐厅信息' : '添加新的餐厅选项'}
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 餐厅名称 */}
            <div>
              <label htmlFor="restaurant-name" className="block text-body font-medium mb-2">
                餐厅名称 <span className="text-accent">*</span>
              </label>
              <input
                id="restaurant-name"
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name && e.target.value.trim()) {
                    setErrors({ ...errors, name: undefined });
                  }
                }}
                className={`w-full px-4 py-3 border-2 rounded-xl bg-surface
                  focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
                  transition-all text-body
                  ${errors.name ? 'border-accent' : 'border-divider'}
                `}
                placeholder="例如: 上海小馄饨"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-accent text-caption mt-1.5" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            {/* 等级选择 */}
            <div>
              <label className="block text-body font-medium mb-3">
                餐厅等级
              </label>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(TIERS).map(([, value]) => {
                  const isSelected = formData.tier === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({ ...formData, tier: value })}
                      className={`
                        py-2 px-1 text-caption font-medium rounded-lg
                        transition-all duration-base
                        ${isSelected
                          ? 'bg-accent text-white shadow-md scale-105'
                          : 'bg-muted text-secondary hover:bg-divider hover:text-primary'
                        }
                      `}
                      aria-pressed={isSelected}
                      aria-label={`选择等级: ${TIER_NAMES[value]}`}
                    >
                      {TIER_NAMES[value]}
                    </button>
                  );
                })}
              </div>
              <p className="text-caption text-secondary mt-2">
                等级影响推荐权重，越高优先级越高
              </p>
            </div>

            {/* 餐点类型选择 */}
            <div>
              <label className="block text-body font-medium mb-3">
                适用餐点 <span className="text-accent">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(MEAL_TYPES).map(([, value]) => {
                  const isSelected = formData.mealTypes.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleMealType(value)}
                      className={`
                        py-3 px-4 text-body font-medium rounded-xl
                        transition-all duration-base
                        flex items-center justify-center gap-2
                        ${isSelected
                          ? 'bg-accent text-white shadow-md'
                          : 'bg-muted text-secondary hover:bg-divider hover:text-primary border border-divider'
                        }
                      `}
                      aria-pressed={isSelected}
                      aria-label={`${isSelected ? '取消选择' : '选择'} ${MEAL_TYPE_NAMES[value]}`}
                    >
                      {isSelected && <Check size={16} />}
                      {MEAL_TYPE_NAMES[value]}
                    </button>
                  );
                })}
              </div>
              {errors.mealTypes && (
                <p className="text-accent text-caption mt-2" role="alert">
                  {errors.mealTypes}
                </p>
              )}
              <p className="text-caption text-secondary mt-2">
                可以选择多个餐点类型
              </p>
            </div>

            {/* 按钮组 */}
            <div className="flex gap-3 pt-4 border-t border-divider">
              {onCancel && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  className="flex-1"
                >
                  取消
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
              >
                {initialData ? '更新' : '添加'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Helper tip */}
        <div className="mt-4 px-2">
          <p className="text-caption text-secondary text-center">
            💡 添加后可以在管理页面随时编辑
          </p>
        </div>
      </div>
    </div>
  );
}

// 简化的内联表单版本（用于快速添加）
export function QuickRestaurantForm({ onSubmit, onSkip }) {
  const [name, setName] = useState('');
  const [tier, setTier] = useState(TIERS.TOP);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && selectedMealTypes.length > 0) {
      onSubmit({
        name: name.trim(),
        tier,
        mealTypes: selectedMealTypes
      });
      // 重置表单
      setName('');
      setTier(TIERS.TOP);
      setSelectedMealTypes([]);
    }
  };

  const toggleMealType = (mealType) => {
    setSelectedMealTypes(prev =>
      prev.includes(mealType)
        ? prev.filter(type => type !== mealType)
        : [...prev, mealType]
    );
  };

  const isValid = name.trim() && selectedMealTypes.length > 0;

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-body font-semibold mb-3">快速添加餐厅</h3>

        {/* 餐厅名称 */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="餐厅名称..."
          className="w-full px-3 py-2.5 border-2 border-divider rounded-lg
            focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20
            transition-all text-body bg-surface"
          required
        />

        {/* 等级选择 */}
        <div className="grid grid-cols-5 gap-1.5">
          {Object.entries(TIERS).map(([, value]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTier(value)}
              className={`py-1.5 text-[11px] font-medium rounded transition-all
                ${tier === value
                  ? 'bg-accent text-white'
                  : 'bg-muted text-secondary hover:bg-divider'
                }
              `}
              aria-pressed={tier === value}
            >
              {TIER_NAMES[value]}
            </button>
          ))}
        </div>

        {/* 餐点类型 */}
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(MEAL_TYPES).map(([, value]) => {
            const isSelected = selectedMealTypes.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleMealType(value)}
                className={`py-2 px-3 text-caption font-medium rounded-lg transition-all
                  flex items-center justify-center gap-1.5
                  ${isSelected
                    ? 'bg-accent text-white'
                    : 'bg-muted text-secondary hover:bg-divider'
                  }
                `}
                aria-pressed={isSelected}
              >
                {isSelected && <Check size={14} />}
                {MEAL_TYPE_NAMES[value]}
              </button>
            );
          })}
        </div>

        {/* 按钮 */}
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onSkip}
            size="small"
            className="flex-1"
          >
            稍后添加
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="small"
            disabled={!isValid}
            className="flex-1"
          >
            添加餐厅
          </Button>
        </div>
      </form>
    </Card>
  );
}
