// 餐厅管理相关的自定义Hook

import { useApp } from './useApp.js';
import { createRestaurant } from '../utils/storage.js';

export function useRestaurants() {
  const { state, dispatch, ActionTypes } = useApp();

  // 添加餐厅
  const addRestaurant = (name, tier, mealTypes) => {
    const newRestaurant = createRestaurant(name, tier, mealTypes);
    dispatch({
      type: ActionTypes.ADD_RESTAURANT,
      payload: newRestaurant
    });
    return newRestaurant;
  };

  // 更新餐厅
  const updateRestaurant = (restaurantId, updates) => {
    const restaurant = state.restaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      const updatedRestaurant = { ...restaurant, ...updates };
      dispatch({
        type: ActionTypes.UPDATE_RESTAURANT,
        payload: updatedRestaurant
      });
      return updatedRestaurant;
    }
    return null;
  };

  // 删除餐厅
  const deleteRestaurant = (restaurantId) => {
    dispatch({
      type: ActionTypes.DELETE_RESTAURANT,
      payload: restaurantId
    });
  };

  // 根据ID获取餐厅
  const getRestaurant = (restaurantId) => {
    return state.restaurants.find(r => r.id === restaurantId) || null;
  };

  // 根据餐点类型获取餐厅
  const getRestaurantsByMealType = (mealType) => {
    return state.restaurants.filter(restaurant =>
      restaurant.mealTypes && restaurant.mealTypes.includes(mealType)
    );
  };

  // 更新餐厅的最后选择时间
  const updateLastSelected = (restaurantId) => {
    const restaurant = getRestaurant(restaurantId);
    if (restaurant) {
      updateRestaurant(restaurantId, {
        lastSelected: new Date().toISOString()
      });
    }
  };

  return {
    restaurants: state.restaurants,
    addRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getRestaurant,
    getRestaurantsByMealType,
    updateLastSelected
  };
}