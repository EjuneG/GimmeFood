// 餐厅输入表单组件

import React, { useState } from 'react';
import { TIER_NAMES, TIERS, MEAL_TYPE_NAMES, MEAL_TYPES } from '../utils/storage.js';

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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {initialData ? '编辑餐厅' : '添加餐厅'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 餐厅名称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                餐厅名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.name ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="输入餐厅名称..."
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* 等级选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                餐厅等级
              </label>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(TIERS).map(([, value]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, tier: value })}
                    className={`py-2 px-1 text-sm font-medium rounded-lg transition-all ${
                      formData.tier === value
                        ? 'bg-blue-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {TIER_NAMES[value]}
                  </button>
                ))}
              </div>
            </div>

            {/* 餐点类型选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                适用餐点 *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(MEAL_TYPES).map(([, value]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleMealType(value)}
                    className={`py-3 px-4 text-sm font-medium rounded-xl transition-all ${
                      formData.mealTypes.includes(value)
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {MEAL_TYPE_NAMES[value]}
                  </button>
                ))}
              </div>
              {errors.mealTypes && (
                <p className="text-red-500 text-sm mt-2">{errors.mealTypes}</p>
              )}
            </div>

            {/* 按钮组 */}
            <div className="flex space-x-3 pt-4">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-3 px-4 bg-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-400 transition-colors"
                >
                  取消
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg"
              >
                {initialData ? '更新' : '添加'}
              </button>
            </div>
          </form>
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

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 餐厅名称 */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="餐厅名称..."
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
          required
        />

        {/* 等级选择 */}
        <div className="grid grid-cols-5 gap-1">
          {Object.entries(TIERS).map(([, value]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTier(value)}
              className={`py-1 px-1 text-xs font-medium rounded ${
                tier === value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {TIER_NAMES[value]}
            </button>
          ))}
        </div>

        {/* 餐点类型 */}
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(MEAL_TYPES).map(([, value]) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleMealType(value)}
              className={`py-2 px-3 text-sm font-medium rounded-lg ${
                selectedMealTypes.includes(value)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {MEAL_TYPE_NAMES[value]}
            </button>
          ))}
        </div>

        {/* 按钮 */}
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-lg font-medium"
          >
            稍后添加
          </button>
          <button
            type="submit"
            disabled={!name.trim() || selectedMealTypes.length === 0}
            className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:text-gray-500"
          >
            添加餐厅
          </button>
        </div>
      </form>
    </div>
  );
}