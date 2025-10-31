import { createClient } from '@supabase/supabase-js'

// Supabase 项目配置
// 从环境变量中获取 URL 和 Anon Key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 验证环境变量是否正确配置
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 配置错误：缺少必需的环境变量')
  console.error('请确保 .env 文件中包含：')
  console.error('- VITE_SUPABASE_URL')
  console.error('- VITE_SUPABASE_ANON_KEY')
}

// 创建 Supabase 客户端实例
// 这是一个单例模式，整个应用共享同一个客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 持久化配置：使用 localStorage 保持用户会话
    persistSession: true,
    // 自动刷新令牌
    autoRefreshToken: true,
    // 检测会话变化（用于多标签页同步）
    detectSessionInUrl: true,
    // 存储键前缀（避免与其他应用冲突）
    storageKey: 'gimme-food-auth',
  },
  // 全局选项
  global: {
    headers: {
      'x-application-name': 'gimme-food-pwa',
    },
  },
  // 实时订阅配置（如果需要实时同步数据）
  realtime: {
    // 心跳间隔（毫秒）
    heartbeatIntervalMs: 30000,
    // 重连策略
    reconnectAfterMs: (tries) => {
      // 指数退避重连：第1次等1秒，第2次等2秒，第3次等4秒...
      return Math.min(1000 * Math.pow(2, tries), 30000)
    },
  },
})

// 辅助函数：检查 Supabase 连接状态
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('_health_check').select('*').limit(1)

    if (error && error.code !== 'PGRST116') {
      // PGRST116 表示表不存在，但连接正常
      console.warn('⚠️ Supabase 连接测试失败:', error.message)
      return false
    }

    console.log('✅ Supabase 连接正常')
    return true
  } catch (err) {
    console.error('❌ Supabase 连接错误:', err)
    return false
  }
}

// 辅助函数：获取当前用户
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('获取用户信息失败:', error)
    return null
  }

  return user
}

// 辅助函数：监听认证状态变化
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔐 认证状态变化:', event, session?.user?.email)
    callback(event, session)
  })
}

export default supabase
