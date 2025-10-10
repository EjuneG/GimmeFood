// 餐厅管理界面组件 - Minimalist redesign
// Clean, compact list design with avatars and subtle interactions

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Settings as SettingsIcon, Store } from 'lucide-react';
import { useRestaurants } from '../hooks/useRestaurants.js';
import { RestaurantForm } from './RestaurantForm.jsx';
import { DataManagement } from './DataManagement.jsx';
import { TIER_NAMES, MEAL_TYPE_NAMES } from '../utils/storage.js';
import { Avatar } from './ui/Avatar.jsx';
import { Button } from './ui/Button.jsx';
import { Card } from './ui/Card.jsx';

export function ManagementScreen() {
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

  // 获取餐厅首字母
  const getRestaurantInitial = (name) => {
    return name.charAt(0).toUpperCase();
  };

  // 判断是否为特色餐厅（顶级餐厅）
  const isFeatured = (tier) => {
    return tier === 'hàng' || tier === 'dǐngjí';
  };

  // 餐厅列表视图
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 头部 */}
      <div className="bg-surface border-b border-divider px-6 pt-12 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-title font-semibold mb-2">餐厅管理</h1>
            <p className="text-caption text-secondary">管理你的餐厅选项相册</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddRestaurant}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="添加餐厅"
            >
              <Plus size={20} className="text-secondary" />
            </button>
            <button
              onClick={() => setShowDataManagement(true)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="数据管理"
            >
              <SettingsIcon size={20} className="text-secondary" />
            </button>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="px-4 pt-6 space-y-4">
        {restaurants.length === 0 ? (
          // 空状态卡片
          <Card className="text-center">
            <div className="py-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Store size={32} className="text-secondary" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-body mb-2">还没有餐厅选项</h3>
              <p className="text-caption text-secondary mb-4">
                添加一些餐厅来开始使用智能推荐系统
              </p>
              <Button variant="primary" onClick={handleAddRestaurant}>
                添加第一家餐厅
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* 统计卡片 */}
            <Card className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-title font-semibold">{restaurants.length}</div>
                  <div className="text-caption text-secondary">总餐厅</div>
                </div>
                <div>
                  <div className="text-title font-semibold">{restaurants.filter(r => r.tier === 'hàng' || r.tier === 'dǐngjí').length}</div>
                  <div className="text-caption text-secondary">特色餐厅</div>
                </div>
                <div>
                  <div className="text-title font-semibold">{restaurants.filter(r => r.lastSelected).length}</div>
                  <div className="text-caption text-secondary">已尝试</div>
                </div>
              </div>
            </Card>

            {/* 餐厅列表 */}
            <div className="space-y-0">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="bg-surface border-b border-divider py-4 first:rounded-t-2xl last:rounded-b-2xl last:border-b-0 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 px-4">
                    {/* Avatar */}
                    <Avatar
                      initial={getRestaurantInitial(restaurant.name)}
                      featured={isFeatured(restaurant.tier)}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-body font-medium truncate mb-1">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center gap-2 text-caption text-secondary">
                        <span>{TIER_NAMES[restaurant.tier]}</span>
                        <span>·</span>
                        <span>{restaurant.mealTypes.map(m => MEAL_TYPE_NAMES[m]).join(' · ')}</span>
                      </div>
                      {restaurant.lastSelected ? (
                        <p className="text-caption text-secondary mt-0.5">
                          {restaurant.selectionCount || 0} 次访问 · 最后 {new Date(restaurant.lastSelected).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                        </p>
                      ) : (
                        <p className="text-caption text-secondary mt-0.5">
                          0 次访问
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEditRestaurant(restaurant)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        aria-label={`编辑 ${restaurant.name}`}
                      >
                        <Edit2 size={16} className="text-secondary" />
                      </button>
                      <button
                        onClick={() => handleDeleteRestaurant(restaurant.id, restaurant.name)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        aria-label={`删除 ${restaurant.name}`}
                      >
                        <Trash2 size={16} className="text-secondary" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 添加按钮 */}
            <button
              onClick={handleAddRestaurant}
              className="w-full p-4 border-2 border-dashed border-divider text-secondary rounded-2xl hover:border-accent hover:text-accent hover:bg-muted transition-all font-medium"
              aria-label="添加新餐厅"
            >
              <div className="flex items-center justify-center gap-2">
                <Plus size={20} />
                <span className="text-body">添加新餐厅</span>
              </div>
            </button>
          </>
        )}
      </div>

      {/* 数据管理弹窗 */}
      <DataManagement
        isOpen={showDataManagement}
        onClose={() => setShowDataManagement(false)}
      />
    </div>
  );
}
