// 应用状态管理上下文

import React, { useReducer, useEffect } from 'react';
import {
  getRestaurants,
  saveRestaurants,
  getUserData,
  saveUserData,
  getPendingFeedback,
  savePendingFeedback,
  shouldShowFeedback
} from '../utils/storage.js';
import {
  getNutritionGoal,
  saveNutritionGoal as saveGoalToStorage
} from '../utils/nutritionGoalStorage.js';
import { ActionTypes } from '../constants/index.js';
import { AppContext } from './AppContextDef.jsx';

// 应用状态初始值
const initialState = {
  // 用户数据
  user: {
    isFirstTime: true,
    setupCompleted: false,
    totalSelections: 0,
    preferences: {}
  },

  // 餐厅数据
  restaurants: [],

  // 当前选择流程状态
  currentFlow: {
    step: 'welcome', // welcome, setup, main, result, reselection, feedback, management, nutrition_prompt, nutrition_input, nutrition_result
    selectedMealType: null,
    selectedRestaurant: null,
    reselectionStep: 0, // 0: initial, 1: reshake, 2: two-options, 3: all-options
    reselectionOptions: [],
    shownRestaurantIds: [] // 记录在当前选择流程中已显示的餐厅ID
  },

  // 营养分析状态
  nutrition: {
    currentAnalysis: null, // 当前分析结果
    foodDescription: '', // 用户输入的食物描述
    targetDate: 'today' // 'today' 或 'yesterday' - 用户选择记录到哪一天
  },

  // 营养目标
  nutritionGoal: null, // {calories, protein, carbs, fat, note, updatedAt}

  // 待处理的反馈
  pendingFeedback: null,

  // UI状态
  ui: {
    loading: false,
    showFeedback: false,
    showMenu: false
  }
};


// Reducer函数
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_USER_DATA:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    case ActionTypes.COMPLETE_SETUP:
      return {
        ...state,
        user: {
          ...state.user,
          isFirstTime: false,
          setupCompleted: true
        },
        currentFlow: {
          ...state.currentFlow,
          step: 'main'
        }
      };

    case ActionTypes.UPDATE_USER_PREFERENCES:
      return {
        ...state,
        user: {
          ...state.user,
          preferences: { ...state.user.preferences, ...action.payload }
        }
      };

    case ActionTypes.SET_RESTAURANTS:
      return {
        ...state,
        restaurants: action.payload
      };

    case ActionTypes.ADD_RESTAURANT:
      return {
        ...state,
        restaurants: [...state.restaurants, action.payload]
      };

    case ActionTypes.UPDATE_RESTAURANT:
      return {
        ...state,
        restaurants: state.restaurants.map(restaurant =>
          restaurant.id === action.payload.id ? action.payload : restaurant
        )
      };

    case ActionTypes.DELETE_RESTAURANT:
      return {
        ...state,
        restaurants: state.restaurants.filter(restaurant => restaurant.id !== action.payload)
      };

    case ActionTypes.SET_FLOW_STEP:
      return {
        ...state,
        currentFlow: { ...state.currentFlow, step: action.payload }
      };

    case ActionTypes.SET_SELECTED_MEAL_TYPE:
      return {
        ...state,
        currentFlow: { ...state.currentFlow, selectedMealType: action.payload }
      };

    case ActionTypes.SET_SELECTED_RESTAURANT:
      return {
        ...state,
        currentFlow: { ...state.currentFlow, selectedRestaurant: action.payload }
      };

    case ActionTypes.SET_RESELECTION_STEP:
      return {
        ...state,
        currentFlow: { ...state.currentFlow, reselectionStep: action.payload }
      };

    case ActionTypes.SET_RESELECTION_OPTIONS:
      return {
        ...state,
        currentFlow: { ...state.currentFlow, reselectionOptions: action.payload }
      };

    case ActionTypes.ADD_SHOWN_RESTAURANT:
      return {
        ...state,
        currentFlow: {
          ...state.currentFlow,
          shownRestaurantIds: [...new Set([...state.currentFlow.shownRestaurantIds, action.payload])]
        }
      };

    case ActionTypes.RESET_SELECTION_FLOW:
      return {
        ...state,
        currentFlow: {
          step: 'main',
          selectedMealType: null,
          selectedRestaurant: null,
          reselectionStep: 0,
          reselectionOptions: [],
          shownRestaurantIds: []
        },
        nutrition: {
          currentAnalysis: null,
          foodDescription: '',
          targetDate: 'today'
        }
      };

    case ActionTypes.SET_PENDING_FEEDBACK:
      return {
        ...state,
        pendingFeedback: action.payload
      };

    case ActionTypes.CLEAR_PENDING_FEEDBACK:
      return {
        ...state,
        pendingFeedback: null
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        ui: { ...state.ui, loading: action.payload }
      };

    case ActionTypes.SET_SHOW_FEEDBACK:
      return {
        ...state,
        ui: { ...state.ui, showFeedback: action.payload }
      };

    case ActionTypes.SET_SHOW_MENU:
      return {
        ...state,
        ui: { ...state.ui, showMenu: action.payload }
      };

    case ActionTypes.SET_NUTRITION_DATA:
      return {
        ...state,
        nutrition: {
          ...state.nutrition,
          currentAnalysis: action.payload
        }
      };

    case ActionTypes.CLEAR_NUTRITION_DATA:
      return {
        ...state,
        nutrition: {
          currentAnalysis: null,
          foodDescription: '',
          targetDate: 'today'
        }
      };

    case ActionTypes.SET_FOOD_DESCRIPTION:
      return {
        ...state,
        nutrition: {
          ...state.nutrition,
          foodDescription: action.payload
        }
      };

    case ActionTypes.SET_TARGET_DATE:
      return {
        ...state,
        nutrition: {
          ...state.nutrition,
          targetDate: action.payload
        }
      };

    case ActionTypes.SET_NUTRITION_GOAL:
      return {
        ...state,
        nutritionGoal: action.payload
      };

    case ActionTypes.CLEAR_NUTRITION_GOAL:
      return {
        ...state,
        nutritionGoal: null
      };

    default:
      return state;
  }
}

// Context Provider组件
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 初始化数据
  useEffect(() => {
    const loadData = () => {
      const userData = getUserData();
      const restaurants = getRestaurants();
      const pendingFeedback = getPendingFeedback();
      const nutritionGoal = getNutritionGoal();

      dispatch({ type: ActionTypes.SET_USER_DATA, payload: userData });
      dispatch({ type: ActionTypes.SET_RESTAURANTS, payload: restaurants });
      dispatch({ type: ActionTypes.SET_PENDING_FEEDBACK, payload: pendingFeedback });
      if (nutritionGoal) {
        dispatch({ type: ActionTypes.SET_NUTRITION_GOAL, payload: nutritionGoal });
      }

      // 确定初始流程步骤 - 临时跳过欢迎屏幕以测试现代UI
      // if (userData.isFirstTime || restaurants.length === 0) {
      //   dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'welcome' });
      // } else if (shouldShowFeedback()) {
        dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'main' });
        if (shouldShowFeedback()) {
          dispatch({ type: ActionTypes.SET_SHOW_FEEDBACK, payload: true });
        }
      // } else {
      //   dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'main' });
      // }
    };

    // Load data on mount
    loadData();

    // Listen for sync completion events and reload data
    const handleSyncComplete = () => {
      console.log('🔄 检测到同步完成，重新加载数据...');
      loadData();
    };

    window.addEventListener('sync-complete', handleSyncComplete);

    return () => {
      window.removeEventListener('sync-complete', handleSyncComplete);
    };
  }, []);

  // 保存数据到本地存储的副作用
  useEffect(() => {
    saveUserData(state.user);
  }, [state.user]);

  useEffect(() => {
    saveRestaurants(state.restaurants);
  }, [state.restaurants]);

  useEffect(() => {
    savePendingFeedback(state.pendingFeedback);
  }, [state.pendingFeedback]);

  useEffect(() => {
    if (state.nutritionGoal) {
      saveGoalToStorage(state.nutritionGoal);
    }
  }, [state.nutritionGoal]);

  return (
    <AppContext.Provider value={{ state, dispatch, ActionTypes }}>
      {children}
    </AppContext.Provider>
  );
}