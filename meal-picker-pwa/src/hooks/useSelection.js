// 选择流程相关的自定义Hook

import { useApp } from './useApp.js';
import { useRestaurants } from './useRestaurants.js';
import {
  intelligentRestaurantSelection,
  handleRestaurantRejection,
  handlePositiveFeedback,
  handleNegativeFeedback,
  getRestaurantsByTier,
  adjustRestaurantWeight
} from '../utils/algorithm.js';
import { addSelectionRecord } from '../utils/storage.js';

export function useSelection() {
  const { state, dispatch, ActionTypes } = useApp();
  const { updateRestaurant, updateLastSelected } = useRestaurants();

  // 选择餐点类型并进行推荐
  const selectMealType = (mealType) => {
    dispatch({
      type: ActionTypes.SET_SELECTED_MEAL_TYPE,
      payload: mealType
    });

    // 进行餐厅推荐
    const recommendation = recommendRestaurant(mealType);
    if (recommendation) {
      // 记录初始推荐的餐厅
      dispatch({
        type: ActionTypes.ADD_SHOWN_RESTAURANT,
        payload: recommendation.id
      });

      dispatch({
        type: ActionTypes.SET_SELECTED_RESTAURANT,
        payload: recommendation
      });
      dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'result' });
    } else {
      // 没有符合条件的餐厅
      alert('没有找到符合条件的餐厅，请先添加一些餐厅选项。');
      dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'setup' });
    }
  };

  // 推荐餐厅
  const recommendRestaurant = (mealType, excludeIds = []) => {
    return intelligentRestaurantSelection(
      state.restaurants,
      mealType,
      state.user.preferences,
      excludeIds
    );
  };

  // 接受推荐
  const acceptRecommendation = () => {
    const { selectedRestaurant, selectedMealType, reselectionStep } = state.currentFlow;

    if (selectedRestaurant) {
      // 更新餐厅最后选择时间
      updateLastSelected(selectedRestaurant.id);

      // 增加餐厅被选择次数
      const updatedRestaurant = {
        ...selectedRestaurant,
        selectionCount: (selectedRestaurant.selectionCount || 0) + 1
      };
      updateRestaurant(selectedRestaurant.id, updatedRestaurant);

      // 记录选择历史
      addSelectionRecord(
        selectedRestaurant.id,
        selectedMealType,
        reselectionStep === 0, // 是否立即接受
        reselectionStep
      );

      // 设置待反馈
      dispatch({
        type: ActionTypes.SET_PENDING_FEEDBACK,
        payload: {
          restaurantId: selectedRestaurant.id,
          restaurantName: selectedRestaurant.name,
          mealType: selectedMealType,
          timestamp: new Date().toISOString()
        }
      });

      // 更新用户总选择次数
      dispatch({
        type: ActionTypes.UPDATE_USER_PREFERENCES,
        payload: {
          totalSelections: (state.user.preferences.totalSelections || 0) + 1
        }
      });

      // 显示营养记录提示（新增功能）
      dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'nutrition_prompt' });
    }
  };

  // 开始重选流程
  const startReselection = () => {
    const { selectedRestaurant, reselectionStep } = state.currentFlow;
    const nextStep = reselectionStep + 1;
    dispatch({ type: ActionTypes.SET_RESELECTION_STEP, payload: nextStep });

    // 对当前餐厅应用权重惩罚（步骤1和2）
    if (selectedRestaurant && (nextStep === 1 || nextStep === 2)) {
      const adjustedRestaurant = adjustRestaurantWeight(selectedRestaurant, -0.5);
      updateRestaurant(selectedRestaurant.id, adjustedRestaurant);
    }

    if (nextStep === 1) {
      // 步骤1：重新摇号 - 提供新的单一选项
      rerollSingleOption();
    } else if (nextStep === 2) {
      // 步骤2：提供2个选项
      provideTwoOptions();
    } else if (nextStep === 3) {
      // 步骤3：显示所有可用选项
      provideAllOptions();
    }

    dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'reselection' });
  };

  // 重新摇号 - 单一选项
  const rerollSingleOption = () => {
    const { selectedMealType, selectedRestaurant, shownRestaurantIds = [] } = state.currentFlow;

    // 排除已经显示过的餐厅
    const excludeIds = [...shownRestaurantIds, selectedRestaurant?.id].filter(Boolean);
    const newRecommendation = recommendRestaurant(selectedMealType, excludeIds);

    if (newRecommendation) {
      // 更新已显示的餐厅列表
      dispatch({
        type: ActionTypes.ADD_SHOWN_RESTAURANT,
        payload: newRecommendation.id
      });

      dispatch({
        type: ActionTypes.SET_SELECTED_RESTAURANT,
        payload: newRecommendation
      });
    }
  };

  // 提供两个选项
  const provideTwoOptions = () => {
    const { selectedMealType, shownRestaurantIds = [] } = state.currentFlow;
    const topOptions = getRestaurantsByTier(
      state.restaurants,
      selectedMealType,
      2,
      shownRestaurantIds
    );

    // 更新已显示的餐厅列表
    topOptions.forEach(restaurant => {
      dispatch({
        type: ActionTypes.ADD_SHOWN_RESTAURANT,
        payload: restaurant.id
      });
    });

    dispatch({
      type: ActionTypes.SET_RESELECTION_OPTIONS,
      payload: topOptions
    });
  };

  // 处理步骤2中用户选择跳过两个选项的情况
  const skipTwoOptions = () => {
    const { reselectionOptions } = state.currentFlow;

    // 对两个选项都应用权重惩罚
    if (reselectionOptions && reselectionOptions.length === 2) {
      reselectionOptions.forEach(restaurant => {
        const adjustedRestaurant = adjustRestaurantWeight(restaurant, -0.5);
        updateRestaurant(restaurant.id, adjustedRestaurant);
      });
    }

    // 继续到步骤3
    startReselection();
  };

  // 提供所有选项
  const provideAllOptions = () => {
    const { selectedMealType, shownRestaurantIds = [] } = state.currentFlow;
    const allOptions = getRestaurantsByTier(
      state.restaurants,
      selectedMealType,
      10,
      shownRestaurantIds
    );

    dispatch({
      type: ActionTypes.SET_RESELECTION_OPTIONS,
      payload: allOptions
    });
  };

  // 从重选选项中选择餐厅
  const selectFromReselectionOptions = (restaurant) => {
    const { reselectionOptions, reselectionStep } = state.currentFlow;

    // 如果是步骤2（两个选项），对未选中的餐厅应用权重惩罚
    if (reselectionStep === 2 && reselectionOptions && reselectionOptions.length === 2) {
      const nonSelectedRestaurant = reselectionOptions.find(r => r.id !== restaurant.id);
      if (nonSelectedRestaurant) {
        const adjustedRestaurant = adjustRestaurantWeight(nonSelectedRestaurant, -0.5);
        updateRestaurant(nonSelectedRestaurant.id, adjustedRestaurant);
      }
    }

    dispatch({
      type: ActionTypes.SET_SELECTED_RESTAURANT,
      payload: restaurant
    });
    dispatch({
      type: ActionTypes.SET_RESELECTION_STEP,
      payload: 0
    });
    dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'result' });
  };

  // 拒绝推荐 - 降级餐厅
  const rejectRecommendation = () => {
    const { selectedRestaurant } = state.currentFlow;

    if (selectedRestaurant) {
      // 处理餐厅拒绝 - 降级
      const downgraded = handleRestaurantRejection(selectedRestaurant);
      updateRestaurant(selectedRestaurant.id, downgraded);
    }

    // 开始重选流程
    startReselection();
  };

  // 处理餐后反馈
  const submitFeedback = (isPositive) => {
    const pendingFeedback = state.pendingFeedback;
    if (!pendingFeedback) return;

    const restaurant = state.restaurants.find(r => r.id === pendingFeedback.restaurantId);
    if (restaurant) {
      let updatedRestaurant;
      if (isPositive) {
        updatedRestaurant = handlePositiveFeedback(restaurant);
      } else {
        updatedRestaurant = handleNegativeFeedback(restaurant);
      }
      updateRestaurant(restaurant.id, updatedRestaurant);
    }

    // 清除待反馈
    dispatch({ type: ActionTypes.CLEAR_PENDING_FEEDBACK });
    dispatch({ type: ActionTypes.SET_SHOW_FEEDBACK, payload: false });
  };

  // 跳过反馈
  const skipFeedback = () => {
    dispatch({ type: ActionTypes.CLEAR_PENDING_FEEDBACK });
    dispatch({ type: ActionTypes.SET_SHOW_FEEDBACK, payload: false });
  };

  // 重置选择流程
  const resetFlow = () => {
    dispatch({ type: ActionTypes.RESET_SELECTION_FLOW });
  };

  return {
    currentFlow: state.currentFlow,
    pendingFeedback: state.pendingFeedback,
    selectMealType,
    acceptRecommendation,
    rejectRecommendation,
    startReselection,
    selectFromReselectionOptions,
    skipTwoOptions,
    submitFeedback,
    skipFeedback,
    resetFlow
  };
}