import React from 'react';
import './App.css';
import { AppProvider } from './contexts/AppContext.jsx';
import { useApp } from './hooks/useApp.js';
import { useServiceWorker } from './hooks/useServiceWorker.js';
import { WelcomeScreen } from './components/WelcomeScreen.jsx';
import { MainScreen } from './components/MainScreen.jsx';
import { QuestionScreen } from './components/QuestionScreen.jsx';
import { ResultScreen } from './components/ResultScreen.jsx';
import { RestaurantForm } from './components/RestaurantForm.jsx';
import { ManagementScreen } from './components/ManagementScreen.jsx';
import { FeedbackModal, FeedbackBanner } from './components/FeedbackModal.jsx';
import { UpdateBanner } from './components/UpdateNotification.jsx';
import { BottomTabNavigation } from './components/BottomTabNavigation.jsx';
import { useRestaurants } from './hooks/useRestaurants.js';
import { ActionTypes } from './constants/index.js';

// 主应用路由组件
function AppRouter() {
  const { state, dispatch } = useApp();
  const { addRestaurant } = useRestaurants();

  // 处理设置页面的餐厅添加
  const handleSetupSubmit = (restaurantData) => {
    addRestaurant(restaurantData.name, restaurantData.tier, restaurantData.mealTypes);
    dispatch({ type: ActionTypes.COMPLETE_SETUP });
  };

  const handleSetupCancel = () => {
    dispatch({ type: ActionTypes.SET_FLOW_STEP, payload: 'main' });
  };

  // 根据当前流程步骤渲染对应组件
  switch (state.currentFlow.step) {
    case 'welcome':
      return <WelcomeScreen />;

    case 'setup':
      return (
        <RestaurantForm
          onSubmit={handleSetupSubmit}
          onCancel={handleSetupCancel}
        />
      );

    case 'main':
      return (
        <>
          <MainScreen />
          <FeedbackBanner />
          <FeedbackModal />
        </>
      );

    case 'question':
      return <QuestionScreen />;

    case 'mealType':
      // 这个状态已经在QuestionScreen中处理
      return <QuestionScreen />;

    case 'result':
      return <ResultScreen />;

    case 'reselection':
      // 重选流程也在ResultScreen中处理
      return <ResultScreen />;

    case 'management':
      return <ManagementScreen />;

    default:
      return <MainScreen />;
  }
}

function App() {
  const { updateAvailable, isUpdating, updateApp } = useServiceWorker();

  return (
    <AppProvider>
      <div className="App">
        <AppRouter />
        <BottomTabNavigation />
        <UpdateBanner
          updateAvailable={updateAvailable}
          isUpdating={isUpdating}
          onUpdate={updateApp}
        />
      </div>
    </AppProvider>
  );
}

export default App;
