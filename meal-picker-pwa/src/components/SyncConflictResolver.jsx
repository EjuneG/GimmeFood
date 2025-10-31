import { useState, useEffect } from 'react'
import { getUnresolvedConflicts, resolveConflict } from '../lib/syncUtils'

/**
 * 冲突解决器组件
 * 当检测到同步冲突时，显示对比界面让用户选择保留哪个版本
 */
const SyncConflictResolver = ({ onResolved, onCancel }) => {
  const [conflicts, setConflicts] = useState([])
  const [currentConflictIndex, setCurrentConflictIndex] = useState(0)
  const [isResolving, setIsResolving] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState(null)

  useEffect(() => {
    loadConflicts()
  }, [])

  const loadConflicts = async () => {
    const unresolvedConflicts = await getUnresolvedConflicts()
    setConflicts(unresolvedConflicts)

    if (unresolvedConflicts.length === 0 && onResolved) {
      onResolved()
    }
  }

  const currentConflict = conflicts[currentConflictIndex]

  const handleResolve = async (resolution) => {
    if (!currentConflict) return

    setIsResolving(true)

    try {
      const result = await resolveConflict(currentConflict.id, resolution)

      if (result.success) {
        // 移动到下一个冲突
        if (currentConflictIndex < conflicts.length - 1) {
          setCurrentConflictIndex(currentConflictIndex + 1)
          setSelectedVersion(null)
        } else {
          // 所有冲突已解决
          if (onResolved) {
            onResolved()
          }
        }
      } else {
        alert('解决冲突失败: ' + (result.error?.message || '未知错误'))
      }
    } catch (err) {
      console.error('解决冲突时出错:', err)
      alert('解决冲突时出错: ' + err.message)
    } finally {
      setIsResolving(false)
    }
  }

  if (!currentConflict) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">所有冲突已解决</h2>
            <p className="text-gray-600 mb-6">您的数据已成功同步</p>
            <button
              onClick={onResolved}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 格式化显示数据
  const formatData = (data, tableName) => {
    switch (tableName) {
      case 'restaurants':
        return {
          '餐厅名称': data.name,
          '等级': data.tier,
          '适用餐点': Array.isArray(data.meal_types) ? data.meal_types.join(', ') : data.meal_types,
          '权重': data.weight,
          '最后选择': data.last_selected_at ? new Date(data.last_selected_at).toLocaleString('zh-CN') : '从未',
          '更新时间': new Date(data.updated_at).toLocaleString('zh-CN'),
        }
      case 'nutrition_goals':
        return {
          '卡路里目标': `${data.calories_goal || 0} kcal`,
          '蛋白质目标': `${data.protein_goal || 0} g`,
          '碳水化合物目标': `${data.carbs_goal || 0} g`,
          '脂肪目标': `${data.fat_goal || 0} g`,
          '更新时间': new Date(data.updated_at).toLocaleString('zh-CN'),
        }
      case 'nutrition_logs':
        return {
          '日期': data.log_date,
          '餐次': data.meal_type,
          '餐厅/餐点': data.meal_name,
          '卡路里': `${data.calories || 0} kcal`,
          '蛋白质': `${data.protein || 0} g`,
          '碳水': `${data.carbs || 0} g`,
          '脂肪': `${data.fat || 0} g`,
          '更新时间': new Date(data.updated_at).toLocaleString('zh-CN'),
        }
      default:
        return data
    }
  }

  const localFormatted = formatData(currentConflict.local_data, currentConflict.table_name)
  const remoteFormatted = formatData(currentConflict.remote_data, currentConflict.table_name)

  const getTableDisplayName = (tableName) => {
    const names = {
      restaurants: '餐厅',
      nutrition_goals: '营养目标',
      nutrition_logs: '营养日志',
    }
    return names[tableName] || tableName
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-5xl my-8 shadow-2xl">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🔄 数据同步冲突</h2>
              <p className="text-orange-100">
                检测到数据不一致，请选择要保留的版本
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-orange-100">进度</div>
              <div className="text-2xl font-bold">
                {currentConflictIndex + 1} / {conflicts.length}
              </div>
            </div>
          </div>
        </div>

        {/* 冲突类型和表名 */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {getTableDisplayName(currentConflict.table_name)}
            </span>
            <span className="text-gray-600 text-sm">
              冲突类型: {currentConflict.conflict_type === 'update_conflict' ? '更新冲突' : '删除冲突'}
            </span>
            <span className="text-gray-400 text-sm ml-auto">
              检测时间: {new Date(currentConflict.detected_at).toLocaleString('zh-CN')}
            </span>
          </div>
        </div>

        {/* 对比区域 */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 本地版本 */}
            <div
              className={`border-2 rounded-lg p-5 transition-all cursor-pointer ${
                selectedVersion === 'local'
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-300 hover:border-blue-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedVersion('local')}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">📱</span>
                  本地版本（此设备）
                </h3>
                {selectedVersion === 'local' && (
                  <div className="text-blue-600 text-2xl">✓</div>
                )}
              </div>

              <div className="space-y-3">
                {Object.entries(localFormatted).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-start">
                    <span className="text-gray-600 text-sm font-medium">{key}:</span>
                    <span className="text-gray-900 text-sm font-semibold text-right ml-4">
                      {value || '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 远程版本 */}
            <div
              className={`border-2 rounded-lg p-5 transition-all cursor-pointer ${
                selectedVersion === 'remote'
                  ? 'border-green-500 bg-green-50 shadow-lg'
                  : 'border-gray-300 hover:border-green-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedVersion('remote')}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">☁️</span>
                  云端版本（其他设备）
                </h3>
                {selectedVersion === 'remote' && (
                  <div className="text-green-600 text-2xl">✓</div>
                )}
              </div>

              <div className="space-y-3">
                {Object.entries(remoteFormatted).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-start">
                    <span className="text-gray-600 text-sm font-medium">{key}:</span>
                    <span className="text-gray-900 text-sm font-semibold text-right ml-4">
                      {value || '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 说明文字 */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <h4 className="font-bold text-yellow-900 mb-1">如何选择？</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• <strong>本地版本</strong>：保留此设备上的数据，覆盖云端数据</li>
                  <li>• <strong>云端版本</strong>：使用其他设备同步的数据，覆盖此设备数据</li>
                  <li>• 选择后，所有设备都会同步到相同的数据版本</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-between items-center border-t border-gray-200">
          <button
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
            disabled={isResolving}
          >
            稍后处理
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => handleResolve('keep_local')}
              disabled={!selectedVersion || selectedVersion !== 'local' || isResolving}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedVersion === 'local'
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isResolving && selectedVersion === 'local' ? '处理中...' : '保留本地版本'}
            </button>

            <button
              onClick={() => handleResolve('keep_remote')}
              disabled={!selectedVersion || selectedVersion !== 'remote' || isResolving}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedVersion === 'remote'
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isResolving && selectedVersion === 'remote' ? '处理中...' : '保留云端版本'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SyncConflictResolver
