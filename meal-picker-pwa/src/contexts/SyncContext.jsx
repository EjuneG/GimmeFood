import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { syncAll, syncRestaurants, getUnresolvedConflicts } from '../lib/syncUtils'

const SyncContext = createContext(null)

/**
 * Sync Provider - 全局同步状态管理
 *
 * 提供认证状态、同步功能和冲突管理
 */
export function SyncProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState(null)
  const [hasConflicts, setHasConflicts] = useState(false)
  const [conflicts, setConflicts] = useState([])
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSyncPrompt, setShowSyncPrompt] = useState(false)

  // 初始化：检查用户认证状态
  useEffect(() => {
    checkAuthState()
    const unsubscribe = setupAuthListener()
    return unsubscribe
  }, [])

  // 自动后台同步：每5分钟同步一次（仅当登录时）
  useEffect(() => {
    if (!user) return

    // 立即执行一次同步
    performSync('all', true)

    // 设置定时同步
    const syncInterval = setInterval(() => {
      console.log('🔄 后台自动同步...')
      performSync('all', true)
    }, 5 * 60 * 1000) // 5分钟

    return () => clearInterval(syncInterval)
  }, [user])

  // 监听网络状态变化，恢复在线时自动同步
  useEffect(() => {
    if (!user) return

    const handleOnline = () => {
      console.log('🌐 网络已恢复，开始同步...')
      performSync('all', true)
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [user])

  // 检查认证状态
  const checkAuthState = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // 如果已登录，执行初始同步
      if (user) {
        await performSync('all', true)
      }
    } catch (err) {
      console.error('检查认证状态失败:', err)
    } finally {
      setIsLoadingAuth(false)
    }
  }

  // 监听认证状态变化
  const setupAuthListener = () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 认证状态变化:', event)
        setUser(session?.user ?? null)

        if (event === 'SIGNED_IN') {
          // 登录后自动同步
          await performSync('all', false)
        } else if (event === 'SIGNED_OUT') {
          // 退出登录时清理状态
          setLastSyncTime(null)
          setHasConflicts(false)
          setConflicts([])
        }
      }
    )

    return () => subscription.unsubscribe()
  }

  // 执行同步
  const performSync = useCallback(async (type = 'all', isSilent = false) => {
    if (!user) {
      console.warn('未登录，无法同步')
      return { success: false, error: '未登录' }
    }

    setIsSyncing(true)

    try {
      let result

      if (type === 'restaurants') {
        result = await syncRestaurants()
      } else {
        result = await syncAll()
      }

      if (result.success) {
        setLastSyncTime(new Date())
        setHasConflicts(false)
        setConflicts([])

        if (!isSilent) {
          console.log('✅ 同步成功')
        }

        // Dispatch event to trigger UI refresh
        window.dispatchEvent(new CustomEvent('sync-complete', {
          detail: { type, result }
        }))
      } else if (result.hasConflicts) {
        setHasConflicts(true)
        setConflicts(result.conflicts || [])
        console.warn('⚠️ 同步发现冲突')
      } else {
        console.error('❌ 同步失败:', result.message)
      }

      return result
    } catch (err) {
      console.error('同步异常:', err)
      return { success: false, error: err.message }
    } finally {
      setIsSyncing(false)
    }
  }, [user])

  // 刷新冲突状态
  const refreshConflicts = useCallback(async () => {
    if (!user) return

    try {
      const unresolvedConflicts = await getUnresolvedConflicts()
      setConflicts(unresolvedConflicts)
      setHasConflicts(unresolvedConflicts.length > 0)
    } catch (err) {
      console.error('刷新冲突失败:', err)
    }
  }, [user])

  // 登录
  const login = useCallback((email, password) => {
    return supabase.auth.signInWithPassword({ email, password })
  }, [])

  // 注册
  const signup = useCallback((email, password) => {
    return supabase.auth.signUp({ email, password })
  }, [])

  // 退出
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      return { success: true }
    } catch (err) {
      console.error('退出失败:', err)
      return { success: false, error: err.message }
    }
  }, [])

  // 显示登录弹窗
  const promptLogin = useCallback(() => {
    setShowAuthModal(true)
  }, [])

  // 显示同步提示
  const promptSync = useCallback(() => {
    if (!user) {
      setShowSyncPrompt(true)
    } else {
      performSync('all', false)
    }
  }, [user, performSync])

  // 检查是否应该显示同步提示（基于使用情况）
  const checkShouldPromptSync = useCallback(() => {
    // 如果已登录，不提示
    if (user) return false

    // 检查本地数据量
    const restaurantsStr = localStorage.getItem('gimme_food_restaurants')
    if (!restaurantsStr) return false

    try {
      const restaurants = JSON.parse(restaurantsStr)

      // 如果用户已添加3个或以上餐厅，且从未登录过，显示提示
      if (restaurants.length >= 3) {
        const hasPromptedBefore = localStorage.getItem('gimme-food-sync-prompted')
        if (!hasPromptedBefore) {
          localStorage.setItem('gimme-food-sync-prompted', 'true')
          return true
        }
      }
    } catch (err) {
      console.error('检查同步提示失败:', err)
    }

    return false
  }, [user])

  const value = {
    // 认证状态
    user,
    isLoadingAuth,
    isLoggedIn: !!user,

    // 同步状态
    isSyncing,
    lastSyncTime,
    hasConflicts,
    conflicts,

    // UI 状态
    showAuthModal,
    setShowAuthModal,
    showSyncPrompt,
    setShowSyncPrompt,

    // 操作方法
    performSync,
    refreshConflicts,
    login,
    signup,
    logout,
    promptLogin,
    promptSync,
    checkShouldPromptSync,
  }

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>
}

/**
 * 使用同步上下文的 Hook
 */
export function useSync() {
  const context = useContext(SyncContext)
  if (!context) {
    throw new Error('useSync must be used within SyncProvider')
  }
  return context
}

export default SyncContext
