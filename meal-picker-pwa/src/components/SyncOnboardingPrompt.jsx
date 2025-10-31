import { Cloud, X, Check } from 'lucide-react'
import { useState } from 'react'

/**
 * 同步功能引导提示
 *
 * 在用户积累一定数据后，温和地推荐启用云端同步
 */
export function SyncOnboardingPrompt({ onEnableSync, onDismiss }) {
  const [isVisible, setIsVisible] = useState(true)

  const handleEnable = () => {
    setIsVisible(false)
    if (onEnableSync) {
      onEnableSync()
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    if (onDismiss) {
      onDismiss()
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      {/* 卡片 */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-slide-up sm:animate-none">
        {/* 关闭按钮 */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          aria-label="关闭"
        >
          <X size={18} className="text-gray-500" />
        </button>

        {/* 内容 */}
        <div className="p-6">
          {/* 图标 */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Cloud size={32} className="text-white" />
          </div>

          {/* 标题 */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            启用云端同步？
          </h2>

          {/* 描述 */}
          <p className="text-gray-600 mb-6">
            你已经添加了一些餐厅选项！登录账户可以：
          </p>

          {/* 功能列表 */}
          <div className="space-y-3 mb-6">
            <FeatureItem text="在多台设备间同步数据" />
            <FeatureItem text="云端备份，永不丢失" />
            <FeatureItem text="随时随地访问你的餐厅列表" />
          </div>

          {/* 按钮组 */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleEnable}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all active:scale-95 shadow-md"
            >
              启用同步
            </button>
            <button
              onClick={handleDismiss}
              className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              稍后再说
            </button>
          </div>

          {/* 底部说明 */}
          <p className="text-xs text-gray-500 text-center mt-4">
            免费注册，不需要信用卡
          </p>
        </div>
      </div>
    </div>
  )
}

// 功能项组件
function FeatureItem({ text }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
        <Check size={14} className="text-green-600" />
      </div>
      <span className="text-gray-700">{text}</span>
    </div>
  )
}

export default SyncOnboardingPrompt
