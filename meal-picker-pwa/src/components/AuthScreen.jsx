import { useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * 认证界面 - 登录/注册
 * 简单的测试界面，用于验证 Supabase 认证功能
 */
export function AuthScreen({ onAuthSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      if (isLogin) {
        // 登录
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        setMessage('✅ 登录成功！')
        console.log('登录成功:', data.user)

        // 通知父组件认证成功
        if (onAuthSuccess) {
          onAuthSuccess(data.user)
        }
      } else {
        // 注册
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) throw error

        if (data.user?.identities?.length === 0) {
          setMessage('⚠️ 该邮箱已注册，请直接登录')
        } else {
          setMessage('✅ 注册成功！请查收验证邮件（开发环境可能不需要）')
          // 自动切换到登录模式
          setTimeout(() => setIsLogin(true), 2000)
        }
      }
    } catch (error) {
      console.error('认证错误:', error)
      setMessage('❌ ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo/标题 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🍜</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gimme Food</h1>
          <p className="text-gray-600">
            {isLogin ? '登录以同步数据' : '注册新账户'}
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位字符"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>

          {/* 消息提示 */}
          {message && (
            <div className={`p-4 rounded-lg text-sm ${
              message.startsWith('✅')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : message.startsWith('⚠️')
                ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                {isLogin ? '登录中...' : '注册中...'}
              </span>
            ) : (
              isLogin ? '登录' : '注册'
            )}
          </button>
        </form>

        {/* 切换登录/注册 */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setMessage('')
            }}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-700 font-medium transition"
          >
            {isLogin ? '没有账户？点击注册 →' : '已有账户？点击登录 →'}
          </button>
        </div>

        {/* 测试说明 */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold text-gray-800 text-sm mb-2">💡 测试提示</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 使用任意邮箱注册（开发环境无需验证）</li>
            <li>• 密码至少 6 位字符</li>
            <li>• 登录后可测试多设备同步</li>
            <li>• 可在不同浏览器/设备使用同一账户</li>
          </ul>
        </div>

        {/* 跳过按钮（游客模式） */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              console.log('使用游客模式（仅本地存储）')
              if (onAuthSuccess) {
                onAuthSuccess(null) // null 表示游客模式
              }
            }}
            className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm transition"
          >
            暂时跳过（仅本地存储，不同步）
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthScreen
