import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import useSync from '../hooks/useSync'

/**
 * 同步测试面板
 * 用于测试 Supabase 同步功能
 */
export function SyncTestPanel() {
  const [user, setUser] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const {
    sync,
    isSyncing,
    hasConflicts,
    conflicts,
    lastSyncTime,
    syncError,
    deviceInfo,
  } = useSync()

  const [testResults, setTestResults] = useState([])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setUserLoading(false)
  }

  const addTestResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('zh-CN')
    setTestResults(prev => [
      { message, type, timestamp },
      ...prev.slice(0, 9) // 保留最近 10 条
    ])
  }

  const handleSync = async (type) => {
    addTestResult(`开始同步: ${type}`, 'info')
    const result = await sync(type)

    if (result.success) {
      addTestResult(`✅ 同步成功: ${type}`, 'success')
    } else if (result.hasConflicts) {
      addTestResult(`⚠️ 发现 ${result.conflicts?.length || 0} 个冲突`, 'warning')
    } else {
      addTestResult(`❌ 同步失败: ${result.message || result.error}`, 'error')
    }
  }

  const handleTestConnection = async () => {
    addTestResult('测试 Supabase 连接...', 'info')

    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('count')
        .limit(1)

      if (error && error.code !== 'PGRST116') {
        addTestResult(`❌ 连接失败: ${error.message}`, 'error')
      } else {
        addTestResult('✅ Supabase 连接正常', 'success')
      }
    } catch (err) {
      addTestResult(`❌ 连接异常: ${err.message}`, 'error')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    addTestResult('✅ 已退出登录', 'success')
  }

  if (userLoading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <p className="text-gray-600">加载中...</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            🧪 同步功能测试
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            测试 Supabase 认证和多设备同步
          </p>
        </div>
      </div>

      {/* 用户信息 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          👤 当前用户
        </h3>
        {user ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              <span className="font-medium">邮箱:</span> {user.email}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">用户ID:</span>{' '}
              <code className="bg-white px-2 py-1 rounded text-xs">
                {user.id.slice(0, 8)}...
              </code>
            </p>
            <button
              onClick={handleLogout}
              className="mt-2 px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
            >
              退出登录
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            ⚠️ 未登录（仅使用本地存储）
          </p>
        )}
      </div>

      {/* 设备信息 */}
      {deviceInfo && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            📱 设备信息
          </h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">设备名称:</span> {deviceInfo.deviceName}</p>
            <p><span className="font-medium">设备类型:</span> {deviceInfo.deviceType}</p>
            <p><span className="font-medium">平台:</span> {deviceInfo.platform}</p>
            <p className="text-xs text-gray-500">
              <span className="font-medium">设备ID:</span> {deviceInfo.deviceId.slice(0, 20)}...
            </p>
          </div>
        </div>
      )}

      {/* 同步控制 */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          🔄 同步操作
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleTestConnection}
            disabled={!user}
            className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
          >
            测试连接
          </button>

          <button
            onClick={() => handleSync('all')}
            disabled={!user || isSyncing}
            className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
          >
            {isSyncing ? '同步中...' : '完整同步'}
          </button>

          <button
            onClick={() => handleSync('restaurants')}
            disabled={!user || isSyncing}
            className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
          >
            同步餐厅
          </button>

          <button
            onClick={() => handleSync('nutrition-goals')}
            disabled={!user || isSyncing}
            className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
          >
            同步目标
          </button>
        </div>

        {!user && (
          <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            ⚠️ 请先登录才能使用同步功能
          </p>
        )}
      </div>

      {/* 同步状态 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          📊 同步状态
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">最后同步:</span>
            <span className="font-medium">
              {lastSyncTime ? lastSyncTime.toLocaleTimeString('zh-CN') : '未同步'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">是否正在同步:</span>
            <span className={`font-medium ${isSyncing ? 'text-blue-600' : 'text-gray-800'}`}>
              {isSyncing ? '是' : '否'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">未解决冲突:</span>
            <span className={`font-medium ${hasConflicts ? 'text-red-600' : 'text-green-600'}`}>
              {hasConflicts ? `${conflicts.length} 个` : '无'}
            </span>
          </div>
          {syncError && (
            <div className="mt-2 p-2 bg-red-50 text-red-700 rounded text-xs">
              错误: {syncError}
            </div>
          )}
        </div>
      </div>

      {/* 测试结果日志 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            📝 操作日志
          </h3>
          <button
            onClick={() => setTestResults([])}
            className="text-xs text-gray-600 hover:text-gray-800"
          >
            清空
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              暂无操作记录
            </p>
          ) : (
            testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded text-sm ${
                  result.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : result.type === 'warning'
                    ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                    : result.type === 'error'
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span>{result.message}</span>
                  <span className="text-xs opacity-70">{result.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 使用说明 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
        <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
          💡 测试步骤
        </h3>
        <ol className="text-sm text-purple-800 space-y-1 list-decimal list-inside">
          <li>确保已登录 Supabase 账户</li>
          <li>点击"测试连接"验证数据库连接</li>
          <li>添加一些餐厅数据（在管理界面）</li>
          <li>点击"完整同步"将数据上传到云端</li>
          <li>在另一台设备/浏览器登录相同账户测试多设备同步</li>
          <li>在两个设备修改同一餐厅后同步，测试冲突解决</li>
        </ol>
      </div>
    </div>
  )
}

export default SyncTestPanel
