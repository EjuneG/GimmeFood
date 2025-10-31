import { Cloud, CloudOff, RefreshCw, AlertTriangle } from 'lucide-react'
import { useSync } from '../contexts/SyncContext'

/**
 * 同步状态指示器
 *
 * 显示在导航栏或其他位置的紧凑型同步状态组件
 */
export function SyncStatusIndicator({ variant = 'compact' }) {
  const {
    isLoggedIn,
    isSyncing,
    hasConflicts,
    lastSyncTime,
    promptLogin,
    performSync,
  } = useSync()

  // 格式化最后同步时间
  const formatSyncTime = (time) => {
    if (!time) return ''

    const now = new Date()
    const diff = Math.floor((now - time) / 1000) // 秒

    if (diff < 60) return '刚刚同步'
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
    return time.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
  }

  // 紧凑模式 - 仅图标（显示状态，不触发操作）
  if (variant === 'compact') {
    return (
      <div
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-default"
        title={
          isLoggedIn
            ? hasConflicts
              ? '⚠️ 有冲突需要解决（将自动弹出解决界面）'
              : isSyncing
              ? '🔄 正在同步...'
              : lastSyncTime
              ? `✅ 最后同步: ${formatSyncTime(lastSyncTime)}`
              : '☁️ 已启用云端同步'
            : '本地模式（点击管理页面的"登录"按钮启用云端同步）'
        }
      >
        {/* 同步状态图标 */}
        {!isLoggedIn ? (
          <CloudOff size={16} className="text-gray-400" />
        ) : hasConflicts ? (
          <AlertTriangle size={16} className="text-orange-500" />
        ) : isSyncing ? (
          <RefreshCw size={16} className="text-blue-500 animate-spin" />
        ) : (
          <Cloud size={16} className="text-green-500" />
        )}

        {/* 可选：显示时间（仅在足够空间时） */}
        {isLoggedIn && lastSyncTime && !isSyncing && (
          <span className="text-xs text-secondary hidden sm:inline">
            {formatSyncTime(lastSyncTime)}
          </span>
        )}
      </div>
    )
  }

  // 完整模式 - 图标 + 文字 + 详细信息
  if (variant === 'full') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-surface rounded-xl border border-divider">
        {/* 状态图标 */}
        <div className="flex-shrink-0">
          {!isLoggedIn ? (
            <CloudOff size={24} className="text-gray-400" />
          ) : hasConflicts ? (
            <AlertTriangle size={24} className="text-orange-500" />
          ) : isSyncing ? (
            <RefreshCw size={24} className="text-blue-500 animate-spin" />
          ) : (
            <Cloud size={24} className="text-green-500" />
          )}
        </div>

        {/* 状态文字 */}
        <div className="flex-1 min-w-0">
          <div className="text-body font-medium">
            {!isLoggedIn
              ? '本地模式'
              : hasConflicts
              ? '需要解决冲突'
              : isSyncing
              ? '正在同步...'
              : '云端同步'}
          </div>
          <div className="text-caption text-secondary">
            {!isLoggedIn
              ? '数据仅保存在本设备'
              : hasConflicts
              ? '多设备数据不一致'
              : lastSyncTime
              ? `最后同步: ${formatSyncTime(lastSyncTime)}`
              : '点击同步数据'}
          </div>
        </div>

        {/* 操作按钮 */}
        <button
          onClick={() => {
            if (isLoggedIn) {
              performSync('all')
            } else {
              promptLogin()
            }
          }}
          disabled={isSyncing}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isLoggedIn
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {!isLoggedIn ? '登录' : hasConflicts ? '解决' : isSyncing ? '同步中' : '同步'}
        </button>
      </div>
    )
  }

  // 横幅模式 - 用于顶部通知
  if (variant === 'banner') {
    // 仅在有重要信息时显示
    if (!hasConflicts && isLoggedIn) return null

    return (
      <div
        className={`px-4 py-2 flex items-center justify-between ${
          hasConflicts
            ? 'bg-orange-50 border-b border-orange-200'
            : 'bg-blue-50 border-b border-blue-200'
        }`}
      >
        <div className="flex items-center gap-2">
          {hasConflicts ? (
            <AlertTriangle size={18} className="text-orange-600" />
          ) : (
            <CloudOff size={18} className="text-blue-600" />
          )}
          <span className="text-sm font-medium">
            {hasConflicts ? '数据冲突需要解决' : '登录以启用云端同步'}
          </span>
        </div>

        <button
          onClick={() => {
            if (hasConflicts) {
              // 冲突会在 App.jsx 中自动显示解决器
              console.log('显示冲突解决器')
            } else {
              promptLogin()
            }
          }}
          className="text-sm font-medium underline"
        >
          {hasConflicts ? '立即解决' : '登录'}
        </button>
      </div>
    )
  }

  return null
}

export default SyncStatusIndicator
