// useApp Hook

import { useContext } from 'react';
import { AppContext } from '../contexts/AppContextDef.jsx';

// 自定义Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}