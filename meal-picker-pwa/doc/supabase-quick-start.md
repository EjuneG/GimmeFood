# Supabase 快速开始指南

> 5分钟快速集成 Supabase 多设备同步

## ✅ 前置条件

- ✓ Supabase JavaScript 库已安装
- ✓ 环境变量已配置（.env）
- ✓ Supabase 客户端已初始化（src/lib/supabase.js）

## 🚀 快速开始

### 步骤 1: 运行数据库迁移

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目: `ktrezenysipikdyowzso`
3. 进入 **SQL Editor**
4. 复制 `supabase/migrations/20251031_initial_schema.sql` 的全部内容
5. 粘贴并点击 **Run** 执行

✅ 执行成功后，你会看到创建了 5 个表和多个索引。

### 步骤 2: 在应用中集成同步功能

#### 2.1 添加同步按钮

```jsx
// 在你的主界面添加同步功能
import useSync from './hooks/useSync'

function MainScreen() {
  const { sync, isSyncing, hasConflicts } = useSync()

  const handleSync = async () => {
    const result = await sync('all')

    if (result.success) {
      alert('✅ 同步成功！')
    } else if (result.hasConflicts) {
      // 冲突会在下一步处理
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      {isSyncing ? '同步中...' : '🔄 同步数据'}
    </button>
  )
}
```

#### 2.2 添加冲突解决 UI

```jsx
// 在 App.jsx 或主组件中
import { useState } from 'react'
import useSync from './hooks/useSync'
import SyncConflictResolver from './components/SyncConflictResolver'

function App() {
  const { hasConflicts, refreshConflicts } = useSync()
  const [showConflictResolver, setShowConflictResolver] = useState(false)

  // 监听冲突状态
  useEffect(() => {
    if (hasConflicts) {
      setShowConflictResolver(true)
    }
  }, [hasConflicts])

  return (
    <div>
      {/* 你的应用内容 */}

      {/* 冲突解决弹窗 */}
      {showConflictResolver && (
        <SyncConflictResolver
          onResolved={() => {
            setShowConflictResolver(false)
            refreshConflicts()
            alert('✅ 所有冲突已解决！')
          }}
          onCancel={() => {
            setShowConflictResolver(false)
          }}
        />
      )}
    </div>
  )
}
```

### 步骤 3: 修改现有的数据保存逻辑

#### 之前（仅本地存储）：
```javascript
// 保存餐厅到本地
const saveRestaurant = (restaurant) => {
  const restaurants = JSON.parse(localStorage.getItem('gimme-food-restaurants') || '[]')
  restaurants.push(restaurant)
  localStorage.setItem('gimme-food-restaurants', JSON.stringify(restaurants))
}
```

#### 之后（同时保存到 Supabase）：
```javascript
import { supabase } from './lib/supabase'
import { pushLocalChanges } from './lib/syncUtils'

const saveRestaurant = async (restaurant) => {
  const user = await supabase.auth.getUser()

  if (!user.data.user) {
    // 未登录，仅保存到本地
    const restaurants = JSON.parse(localStorage.getItem('gimme-food-restaurants') || '[]')
    restaurants.push(restaurant)
    localStorage.setItem('gimme-food-restaurants', JSON.stringify(restaurants))
    return
  }

  // 已登录，保存到 Supabase（自动同步到本地）
  const { data, error } = await supabase
    .from('restaurants')
    .insert([{
      ...restaurant,
      user_id: user.data.user.id,
    }])
    .select()
    .single()

  if (error) {
    console.error('保存失败:', error)
    alert('保存到云端失败，已保存到本地')
    // 降级到本地保存
    const restaurants = JSON.parse(localStorage.getItem('gimme-food-restaurants') || '[]')
    restaurants.push(restaurant)
    localStorage.setItem('gimme-food-restaurants', JSON.stringify(restaurants))
  } else {
    // 更新本地缓存
    const restaurants = JSON.parse(localStorage.getItem('gimme-food-restaurants') || '[]')
    restaurants.push(data)
    localStorage.setItem('gimme-food-restaurants', JSON.stringify(restaurants))
  }
}
```

### 步骤 4: 添加认证功能

#### 4.1 创建登录/注册界面

```jsx
import { useState } from 'react'
import { supabase } from './lib/supabase'

function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)

  const handleAuth = async (e) => {
    e.preventDefault()

    if (isLogin) {
      // 登录
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        alert('登录失败: ' + error.message)
      } else {
        alert('✅ 登录成功！')
        // 触发自动同步
      }
    } else {
      // 注册
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        alert('注册失败: ' + error.message)
      } else {
        alert('✅ 注册成功！请查收验证邮件')
      }
    }
  }

  return (
    <form onSubmit={handleAuth} className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">
        {isLogin ? '登录' : '注册'}
      </h2>

      <input
        type="email"
        placeholder="邮箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 border rounded mb-4"
        required
      />

      <input
        type="password"
        placeholder="密码（至少6位）"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-3 border rounded mb-6"
        required
        minLength={6}
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-3 rounded font-bold"
      >
        {isLogin ? '登录' : '注册'}
      </button>

      <button
        type="button"
        onClick={() => setIsLogin(!isLogin)}
        className="w-full mt-4 text-blue-600"
      >
        {isLogin ? '没有账户？点击注册' : '已有账户？点击登录'}
      </button>
    </form>
  )
}
```

#### 4.2 监听认证状态

```jsx
import { useEffect, useState } from 'react'
import { supabase, onAuthStateChange } from './lib/supabase'
import { syncAll } from './lib/syncUtils'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 获取当前用户
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)

      // 如果已登录，自动同步
      if (user) {
        syncAll()
      }
    })

    // 监听认证状态变化
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)

      if (event === 'SIGNED_IN') {
        // 登录后自动同步
        syncAll()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return <div>加载中...</div>
  }

  if (!user) {
    return <AuthScreen />
  }

  return <MainScreen user={user} />
}
```

## 🧪 测试同步功能

### 测试场景 1: 单设备同步

1. 注册并登录账户
2. 添加几个餐厅
3. 点击"同步数据"按钮
4. 打开 Supabase Dashboard → Table Editor → `restaurants`
5. ✅ 验证数据已出现在云端

### 测试场景 2: 多设备同步

1. **设备 A**: 登录账户，添加餐厅 "麦当劳"
2. **设备 A**: 点击同步
3. **设备 B**: 登录相同账户
4. **设备 B**: 点击同步
5. ✅ 验证设备 B 可以看到 "麦当劳"

### 测试场景 3: 冲突解决

1. **设备 A**: 离线状态下，将 "麦当劳" 等级改为 "夯"
2. **设备 B**: 离线状态下，将 "麦当劳" 等级改为 "顶级"
3. **设备 A**: 联网后同步（成功推送）
4. **设备 B**: 联网后同步（检测到冲突）
5. ✅ 验证冲突解决 UI 出现，可选择保留哪个版本

## 📊 监控同步状态

### 在 Supabase Dashboard 查看

1. **Table Editor** → `device_sync_metadata`
   - 查看所有设备的同步时间
   - 识别哪些设备长时间未同步

2. **Table Editor** → `sync_conflicts`
   - 查看未解决的冲突
   - 分析冲突发生的频率

3. **Logs** → Real-time
   - 监控同步请求
   - 排查错误和性能问题

## 🎯 下一步

完成基础同步后，你可以：

1. **添加实时订阅**
   ```javascript
   // 监听餐厅表变化
   supabase
     .channel('restaurants')
     .on('postgres_changes', {
       event: '*',
       schema: 'public',
       table: 'restaurants'
     }, (payload) => {
       console.log('餐厅数据变化:', payload)
       // 自动更新 UI
     })
     .subscribe()
   ```

2. **优化同步频率**
   - 根据网络状态调整同步间隔
   - 使用增量同步减少数据传输

3. **添加离线检测**
   ```javascript
   window.addEventListener('online', () => {
     console.log('网络已连接，开始同步...')
     syncAll()
   })
   ```

4. **性能监控**
   - 记录同步耗时
   - 分析哪些操作最慢
   - 优化数据库查询

## ❓ 常见问题

### Q: 忘记密码怎么办？

A: 使用 Supabase 的密码重置功能：
```javascript
const { data, error } = await supabase.auth.resetPasswordForEmail(email)
```

### Q: 如何删除账户？

A: 在 Supabase Dashboard → Authentication → Users 中手动删除，或实现自助删除功能。

### Q: 同步很慢怎么办？

A:
1. 使用增量同步而非全量同步
2. 只同步最近 30 天的营养日志
3. 压缩 `feedback_history` 数据

### Q: 如何备份数据？

A: Supabase 提供自动备份，也可以手动导出：
```javascript
const { data } = await supabase
  .from('restaurants')
  .select('*')
  .csv()
```

## 📚 更多资源

- [完整架构文档](./supabase-sync-architecture.md)
- [Supabase 官方文档](https://supabase.com/docs)
- [故障排查指南](./supabase-sync-architecture.md#故障排查)

---

**需要帮助？** 查看完整文档或提交 issue。
