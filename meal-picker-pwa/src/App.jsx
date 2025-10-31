import React, { useState, useEffect } from 'react';
import './App.css';
import { AppProvider } from './contexts/AppContext.jsx';
import { SyncProvider, useSync } from './contexts/SyncContext.jsx';
import { useApp } from './hooks/useApp.js';
import { useServiceWorker } from './hooks/useServiceWorker.js';
import { WelcomeScreen } from './components/WelcomeScreen.jsx';
import { MainScreen } from './components/MainScreen.jsx';
import { ResultScreen } from './components/ResultScreen.jsx';
import { RestaurantForm } from './components/RestaurantForm.jsx';
import { ManagementScreen } from './components/ManagementScreen.jsx';
import { FeedbackModal, FeedbackBanner } from './components/FeedbackModal.jsx';
import { UpdateBanner } from './components/UpdateNotification.jsx';
import { BottomTabNavigation } from './components/BottomTabNavigation.jsx';
import { NutritionPrompt } from './components/NutritionPrompt.jsx';
import { NutritionInput } from './components/NutritionInput.jsx';
import { NutritionResult } from './components/NutritionResult.jsx';
import { NutritionGoalSetup } from './components/NutritionGoalSetup.jsx';
import { NutritionDashboard } from './components/NutritionDashboard.jsx';
import { ManualSelectionScreen } from './components/ManualSelectionScreen.jsx';
import { useRestaurants } from './hooks/useRestaurants.js';
import { ActionTypes } from './constants/index.js';
import SyncConflictResolver from './components/SyncConflictResolver.jsx';
import { AuthScreen } from './components/AuthScreen.jsx';
import { SyncOnboardingPrompt } from './components/SyncOnboardingPrompt.jsx';

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

    case 'result':
      return <ResultScreen />;

    case 'reselection':
      // 重选流程也在ResultScreen中处理
      return <ResultScreen />;

    case 'management':
      return <ManagementScreen />;

    case 'nutrition_prompt':
      return <NutritionPrompt />;

    case 'nutrition_input':
      return <NutritionInput />;

    case 'nutrition_result':
      return <NutritionResult />;

    case 'nutrition_goal_setup':
      return <NutritionGoalSetup />;

    case 'nutrition_dashboard':
      return <NutritionDashboard />;

    case 'manual_selection':
      return <ManualSelectionScreen />;

    default:
      return <MainScreen />;
  }
}

function App() {
  const { updateAvailable, isUpdating, updateApp } = useServiceWorker();

  return (
    <AppProvider>
      <SyncProvider>
        <AppContent
          updateAvailable={updateAvailable}
          isUpdating={isUpdating}
          updateApp={updateApp}
        />
      </SyncProvider>
    </AppProvider>
  );
}

// 将 App 内容分离出来，以便在 SyncProvider 内部使用 useSync
function AppContent({ updateAvailable, isUpdating, updateApp }) {
  const {
    hasConflicts,
    refreshConflicts,
    showAuthModal,
    setShowAuthModal,
    showSyncPrompt,
    setShowSyncPrompt,
    checkShouldPromptSync,
  } = useSync();

  const [showConflictResolver, setShowConflictResolver] = useState(false);

  // 监听冲突状态
  useEffect(() => {
    if (hasConflicts && !showConflictResolver) {
      setShowConflictResolver(true);
    }
  }, [hasConflicts, showConflictResolver]);

  // 检查是否应该显示同步提示（延迟检查，避免干扰首次体验）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (checkShouldPromptSync()) {
        setShowSyncPrompt(true);
      }
    }, 3000); // 3秒后检查

    return () => clearTimeout(timer);
  }, [checkShouldPromptSync, setShowSyncPrompt]);

  return (
    <div className="App">
      <AppRouter />
      <BottomTabNavigation />
      <UpdateBanner
        updateAvailable={updateAvailable}
        isUpdating={isUpdating}
        onUpdate={updateApp}
      />

      {/* 同步冲突解决器 */}
      {showConflictResolver && hasConflicts && (
        <SyncConflictResolver
          onResolved={() => {
            setShowConflictResolver(false);
            refreshConflicts();
            console.log('✅ 所有冲突已解决');
          }}
          onCancel={() => {
            setShowConflictResolver(false);
            console.log('⏸️ 用户选择稍后处理冲突');
          }}
        />
      )}

      {/* 认证弹窗 */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50">
          <AuthScreen
            onAuthSuccess={(user) => {
              setShowAuthModal(false);
              console.log('✅ 登录成功，已启用同步');
            }}
          />
          <button
            onClick={() => setShowAuthModal(false)}
            className="fixed top-4 right-4 z-10 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-2xl hover:bg-gray-100 transition text-2xl"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>
      )}

      {/* 同步引导提示 */}
      {showSyncPrompt && (
        <SyncOnboardingPrompt
          onEnableSync={() => {
            setShowSyncPrompt(false);
            setShowAuthModal(true);
          }}
          onDismiss={() => {
            setShowSyncPrompt(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
