import { useState, useEffect, useCallback } from 'react'
import {
  syncAll,
  syncRestaurants,
  syncNutritionGoals,
  syncNutritionLogs,
  getUnresolvedConflicts,
  getDeviceInfo,
  setDeviceName,
} from '../lib/syncUtils'

/**
 * 自定义 Hook：数据同步
 *
 * 提供统一的同步接口和状态管理
 *
 * @example
 * const { sync, isSyncing, hasConflicts, conflicts, lastSyncTime } = useSync()
 *
 * // 执行同步
 * await sync()
 *
 * // 同步特定数据
 * await sync('restaurants')
 */
const useSync = () => {
  const [isSyncing, setIsSyncing] = useState(false)
  const [hasConflicts, setHasConflicts] = useState(false)
  const [conflicts, setConflicts] = useState([])
  const [lastSyncTime, setLastSyncTime] = useState(null)
  const [syncError, setSyncError] = useState(null)
  const [deviceInfo, setDeviceInfo] = useState(null)

  // 初始化设备信息
  useEffect(() => {
    const info = getDeviceInfo()
    setDeviceInfo(info)
  }, [])

  // 检查未解决的冲突
  const checkConflicts = useCallback(async () => {
    try {
      const unresolvedConflicts = await getUnresolvedConflicts()
      setConflicts(unresolvedConflicts)
      setHasConflicts(unresolvedConflicts.length > 0)
      return unresolvedConflicts
    } catch (err) {
      console.error('检查冲突失败:', err)
      return []
    }
  }, [])

  // 执行同步
  const sync = useCallback(async (type = 'all') => {
    setIsSyncing(true)
    setSyncError(null)

    try {
      let result

      switch (type) {
        case 'restaurants':
          result = await syncRestaurants()
          break
        case 'nutrition-goals':
          result = await syncNutritionGoals()
          break
        case 'nutrition-logs':
          result = await syncNutritionLogs()
          break
        case 'all':
        default:
          result = await syncAll()
          break
      }

      if (result.hasConflicts) {
        setHasConflicts(true)
        setConflicts(result.conflicts || [])
      } else if (result.success) {
        setHasConflicts(false)
        setConflicts([])
        setLastSyncTime(new Date())
      } else {
        setSyncError(result.error || result.message || '同步失败')
      }

      return result
    } catch (err) {
      console.error('同步失败:', err)
      setSyncError(err.message)
      return {
        success: false,
        error: err.message,
      }
    } finally {
      setIsSyncing(false)
    }
  }, [])

  // 重新加载冲突
  const refreshConflicts = useCallback(async () => {
    return await checkConflicts()
  }, [checkConflicts])

  // 设置设备友好名称
  const updateDeviceName = useCallback((name) => {
    setDeviceName(name)
    const updatedInfo = getDeviceInfo()
    setDeviceInfo(updatedInfo)
  }, [])

  // 组件挂载时检查冲突
  useEffect(() => {
    checkConflicts()
  }, [checkConflicts])

  return {
    // 同步操作
    sync,
    isSyncing,

    // 冲突管理
    hasConflicts,
    conflicts,
    refreshConflicts,

    // 同步状态
    lastSyncTime,
    syncError,

    // 设备信息
    deviceInfo,
    updateDeviceName,
  }
}

export default useSync
