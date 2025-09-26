// 餐厅管理界面组件

import React, { useState } from 'react';
import { useApp } from '../hooks/useApp.js';
import { useRestaurants } from '../hooks/useRestaurants.js';
import { RestaurantForm } from './RestaurantForm.jsx';
import { DataManagement } from './DataManagement.jsx';
import { TIER_NAMES, MEAL_TYPE_NAMES } from '../utils/storage.js';

export function ManagementScreen() {
  const { ActionTypes } = useApp();
  const { restaurants, deleteRestaurant, updateRestaurant, addRestaurant } = useRestaurants();
  const [currentView, setCurrentView] = useState('list'); // list, add, edit
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [showDataManagement, setShowDataManagement] = useState(false);


  // 添加餐厅
  const handleAddRestaurant = () => {
    setEditingRestaurant(null);
    setCurrentView('add');
  };

  // 编辑餐厅
  const handleEditRestaurant = (restaurant) => {
    setEditingRestaurant(restaurant);
    setCurrentView('edit');
  };

  // 删除餐厅
  const handleDeleteRestaurant = (restaurantId, restaurantName) => {
    if (window.confirm(`确定要删除 "${restaurantName}" 吗？`)) {
      deleteRestaurant(restaurantId);
    }
  };

  // 处理表单提交
  const handleFormSubmit = (formData) => {
    if (currentView === 'edit' && editingRestaurant) {
      // 编辑现有餐厅
      updateRestaurant(editingRestaurant.id, {
        name: formData.name,
        tier: formData.tier,
        mealTypes: formData.mealTypes
      });
    } else {
      // 添加新餐厅
      addRestaurant(formData.name, formData.tier, formData.mealTypes);
    }
    setCurrentView('list');
  };

  // 取消表单
  const handleFormCancel = () => {
    setCurrentView('list');
  };

  // 餐厅表单视图
  if (currentView === 'add' || currentView === 'edit') {
    return (
      <RestaurantForm
        initialData={editingRestaurant}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  // 餐厅列表视图
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 头部卡片 */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">餐厅管理</h1>
            <p className="text-purple-100 mt-1">管理你的餐厅选项和偏好</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowDataManagement(true)}
              className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
              title="数据管理"
            >
              <span className="text-lg">⚙️</span>
            </button>
            <div className="text-4xl">🏪</div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{restaurants.length}</div>
              <div className="text-xs text-purple-100">总餐厅</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-200">{restaurants.filter(r => r.tier === 'hàng').length}</div>
              <div className="text-xs text-purple-100">夯级餐厅</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-200">{restaurants.filter(r => r.lastSelected).length}</div>
              <div className="text-xs text-purple-100">已尝试</div>
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="px-4 -mt-4">
        {restaurants.length === 0 ? (
          // 空状态卡片
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">还没有餐厅选项</h3>
            <p className="text-gray-600 mb-6">添加一些餐厅来开始使用智能推荐系统</p>
            <button
              onClick={handleAddRestaurant}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105"
            >
              添加第一家餐厅
            </button>
          </div>
        ) : (
          // 餐厅列表
          <div className="space-y-3">
            {/* 快速添加按钮 */}
            <button
              onClick={handleAddRestaurant}
              className="w-full p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all font-medium"
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xl">+</span>
                <span>添加新餐厅</span>
              </div>
            </button>

            {/* 餐厅卡片列表 */}
            {restaurants.map((restaurant) => {
              const tierColors = {
                'hàng': 'from-yellow-400 to-orange-500',
                'dǐngjí': 'from-purple-400 to-pink-500',
                'rénshàngrén': 'from-blue-400 to-indigo-500',
                'NPC': 'from-gray-400 to-gray-500',
                'lāwánle': 'from-red-400 to-red-600'
              };

              const tierTextColors = {
                'hàng': 'text-yellow-700 bg-yellow-100',
                'dǐngjí': 'text-purple-700 bg-purple-100',
                'rénshàngrén': 'text-blue-700 bg-blue-100',
                'NPC': 'text-gray-700 bg-gray-100',
                'lāwánle': 'text-red-700 bg-red-100'
              };

              return (
                <div
                  key={restaurant.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* 餐厅等级图标 */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tierColors[restaurant.tier]} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                        {TIER_NAMES[restaurant.tier][0]}
                      </div>

                      <div className="flex-1">
                        {/* 餐厅名称和等级 */}
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-bold text-gray-900 text-lg">{restaurant.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${tierTextColors[restaurant.tier]}`}>
                            {TIER_NAMES[restaurant.tier]}
                          </span>
                        </div>

                        {/* 餐点类型标签 */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {restaurant.mealTypes.map((mealType) => {
                            const mealEmojis = {
                              breakfast: '🌅',
                              lunch: '🍜',
                              dinner: '🍽️',
                              snack: '🍿'
                            };
                            return (
                              <span
                                key={mealType}
                                className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                              >
                                <span>{mealEmojis[mealType]}</span>
                                <span>{MEAL_TYPE_NAMES[mealType]}</span>
                              </span>
                            );
                          })}
                        </div>

                        {/* 统计信息 */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <span>👎</span>
                            <span>{restaurant.rejectionCount || 0} 次拒绝</span>
                          </div>
                          {restaurant.lastSelected && (
                            <div className="flex items-center space-x-1">
                              <span>📅</span>
                              <span>最后选择: {new Date(restaurant.lastSelected).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex flex-col space-y-2 ml-2">
                      <button
                        onClick={() => handleEditRestaurant(restaurant)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                        title="编辑餐厅"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteRestaurant(restaurant.id, restaurant.name)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors"
                        title="删除餐厅"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 底部间距 */}
        <div className="h-4"></div>
      </div>

      {/* 数据管理弹窗 */}
      <DataManagement
        isOpen={showDataManagement}
        onClose={() => setShowDataManagement(false)}
      />
    </div>
  );
}