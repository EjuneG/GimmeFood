# Supabase 同步架构文档

> **Gimme Food PWA - Multi-Device Sync with Conflict Resolution**

## 📋 目录

1. [架构概览](#架构概览)
2. [数据库设计](#数据库设计)
3. [同步策略](#同步策略)
4. [冲突解决](#冲突解决)
5. [使用指南](#使用指南)
6. [部署步骤](#部署步骤)

---

## 🏗️ 架构概览

### 设计原则

- **Supabase as Primary**: 云端数据库为主要数据源
- **Local Cache**: 本地 localStorage 作为缓存层，提升性能和离线体验
- **User-Driven Conflict Resolution**: 数据冲突时由用户选择保留哪个版本
- **Multi-Device Sync**: 基于账户的跨设备数据同步
- **Optimistic Locking**: 使用版本号防止并发冲突

### 数据流

```
┌─────────────┐      Pull (Sync)      ┌──────────────┐
│   Device A  │ ◄──────────────────── │   Supabase   │
│  (Local)    │                        │  (Primary)   │
│             │ ─────────────────────► │              │
└─────────────┘      Push (Update)    └──────────────┘
                          ▲                    ▲
                          │                    │
                          │                    │
                          ▼                    ▼
┌─────────────┐      Pull (Sync)      ┌──────────────┐
│   Device B  │ ◄──────────────────── │   Conflict   │
│  (Local)    │                        │  Detection   │
│             │ ─────────────────────► │  & Resolver  │
└─────────────┘      Push (Update)    └──────────────┘
```

### 同步流程

1. **用户登录** → 建立与 Supabase 的连接
2. **自动拉取** → 从云端下载最新数据到本地
3. **冲突检测** → 比较本地与云端数据版本
4. **冲突解决** → 如有冲突，显示 UI 让用户选择
5. **数据合并** → 应用用户的选择，更新云端和本地
6. **后台同步** → 定期自动同步保持数据一致性

---

## 🗄️ 数据库设计

### 核心表结构

#### 1. `restaurants` - 餐厅配置表

存储用户的餐厅列表，包含所有算法所需数据。

```sql
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),

  -- 餐厅信息
  name TEXT NOT NULL,
  tier TEXT NOT NULL,  -- '夯', '顶级', '人上人', 'NPC', '拉完了'
  meal_types TEXT[],   -- ['早餐', '午餐', '晚餐', '零食']

  -- 算法数据
  weight DECIMAL(10, 2),
  last_selected_at TIMESTAMPTZ,
  feedback_history JSONB,

  -- 同步元数据
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,  -- 软删除
  device_id TEXT,          -- 最后修改的设备
  version INTEGER          -- 乐观锁版本号
);
```

**索引优化**:
- `idx_restaurants_user_id`: 按用户快速查询
- `idx_restaurants_tier`: 按等级筛选
- `idx_restaurants_updated_at`: 按更新时间排序（用于同步）

#### 2. `nutrition_goals` - 营养目标表

存储用户的每日营养目标。

```sql
CREATE TABLE public.nutrition_goals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),

  -- 营养目标
  calories_goal DECIMAL(10, 2),
  protein_goal DECIMAL(10, 2),
  carbs_goal DECIMAL(10, 2),
  fat_goal DECIMAL(10, 2),
  fiber_goal DECIMAL(10, 2),
  sugar_goal DECIMAL(10, 2),
  sodium_goal DECIMAL(10, 2),

  -- 同步元数据
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  device_id TEXT,
  version INTEGER,

  UNIQUE(user_id)  -- 每个用户只有一个目标
);
```

#### 3. `nutrition_logs` - 营养日志表

记录每日的营养摄入数据。

```sql
CREATE TABLE public.nutrition_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),

  -- 日志数据
  log_date DATE NOT NULL,
  meal_type TEXT,          -- '早餐', '午餐', '晚餐', '零食'
  meal_name TEXT,
  restaurant_id UUID REFERENCES restaurants(id),

  -- 营养值
  calories DECIMAL(10, 2),
  protein DECIMAL(10, 2),
  carbs DECIMAL(10, 2),
  fat DECIMAL(10, 2),
  fiber DECIMAL(10, 2),
  sugar DECIMAL(10, 2),
  sodium DECIMAL(10, 2),

  -- 同步元数据
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  device_id TEXT,
  version INTEGER
);
```

**索引优化**:
- `idx_nutrition_logs_user_date`: 按用户和日期查询（复合索引）
- `idx_nutrition_logs_date`: 按日期范围查询

#### 4. `device_sync_metadata` - 设备同步元数据表

跟踪每个设备的同步状态。

```sql
CREATE TABLE public.device_sync_metadata (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),

  -- 设备信息
  device_id TEXT NOT NULL,
  device_name TEXT,        -- 用户友好名称
  device_type TEXT,        -- 'mobile', 'desktop', 'tablet'
  platform TEXT,           -- 'ios', 'android', 'web', 'pwa'

  -- 同步跟踪
  last_sync_at TIMESTAMPTZ,
  last_pull_at TIMESTAMPTZ,
  last_push_at TIMESTAMPTZ,
  sync_count INTEGER,
  conflict_count INTEGER,

  UNIQUE(user_id, device_id)
);
```

#### 5. `sync_conflicts` - 同步冲突表

临时存储需要用户解决的冲突。

```sql
CREATE TABLE public.sync_conflicts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),

  -- 冲突详情
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  local_data JSONB NOT NULL,
  remote_data JSONB NOT NULL,
  conflict_type TEXT NOT NULL,

  -- 解决状态
  detected_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution TEXT,          -- 'keep_local', 'keep_remote', 'merge'
  device_id TEXT
);
```

### Row Level Security (RLS)

所有表都启用了 RLS，确保用户只能访问自己的数据：

```sql
-- 示例：restaurants 表的 RLS 策略
CREATE POLICY "Users can view own restaurants"
  ON public.restaurants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own restaurants"
  ON public.restaurants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ... 同样的策略应用于 UPDATE 和 DELETE
```

---

## 🔄 同步策略

### 1. 设备识别

每个设备在首次使用时生成唯一的 `device_id`：

```javascript
const deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
localStorage.setItem('gimme-food-device-id', deviceId)
```

### 2. 同步时机

#### 主动同步
- 用户登录时
- 用户手动点击"同步"按钮
- 用户切换账户后

#### 被动同步
- 应用启动时（检查上次同步时间）
- 后台定期同步（每15分钟）
- 从后台恢复到前台时

### 3. 同步方向

#### Pull (拉取)
```javascript
// 从 Supabase 拉取最新数据
const { data: remoteData } = await supabase
  .from('restaurants')
  .select('*')
  .eq('user_id', userId)
  .is('deleted_at', null)

// 保存到本地缓存
localStorage.setItem('gimme-food-restaurants', JSON.stringify(remoteData))
```

#### Push (推送)
```javascript
// 推送本地更改到 Supabase
const localData = JSON.parse(localStorage.getItem('gimme-food-restaurants'))

const { data, error } = await supabase
  .from('restaurants')
  .upsert(localData.map(item => ({
    ...item,
    device_id: getDeviceId(),
    version: item.version + 1,
  })))
```

### 4. 增量同步 vs 全量同步

#### 增量同步（推荐）
仅同步自上次同步以来发生变化的数据：

```javascript
const lastSyncTime = getLastSyncTime()

const { data } = await supabase
  .from('restaurants')
  .select('*')
  .eq('user_id', userId)
  .gt('updated_at', lastSyncTime)
```

#### 全量同步
下载所有数据（首次同步或手动刷新）。

---

## ⚔️ 冲突解决

### 冲突检测机制

#### 1. 版本号检测
```javascript
const hasConflict = localRecord.version !== remoteRecord.version
```

#### 2. 时间戳检测
```javascript
const timeDiff = Math.abs(
  new Date(localRecord.updated_at) - new Date(remoteRecord.updated_at)
)
const hasConflict = timeDiff > 1000  // 超过1秒视为冲突
```

### 冲突类型

#### Update Conflict（更新冲突）
两个设备同时修改了同一条记录。

**示例场景**：
- 设备A：将"麦当劳"等级改为"夯"
- 设备B：将"麦当劳"等级改为"顶级"
- 同步时检测到冲突

#### Delete Conflict（删除冲突）
一个设备删除了记录，另一个设备修改了同一记录。

### 冲突解决流程

```
1. 检测冲突
   ↓
2. 保存到 sync_conflicts 表
   ↓
3. 显示 SyncConflictResolver UI
   ↓
4. 用户选择版本
   ↓
5. 应用选择 (keep_local / keep_remote / merge)
   ↓
6. 更新 Supabase 和本地缓存
   ↓
7. 标记冲突为已解决
```

### 用户界面

`SyncConflictResolver` 组件提供直观的对比界面：

- **并排显示**：本地版本 vs 云端版本
- **高亮差异**：突出显示不同的字段
- **一键选择**：点击卡片选择要保留的版本
- **批量处理**：支持逐个解决多个冲突

---

## 📖 使用指南

### 1. 初始化 Supabase 客户端

```javascript
import { supabase } from './lib/supabase'

// 客户端已自动配置，直接使用即可
```

### 2. 使用同步 Hook

```javascript
import useSync from './hooks/useSync'

function MyComponent() {
  const {
    sync,
    isSyncing,
    hasConflicts,
    conflicts,
    lastSyncTime
  } = useSync()

  const handleSync = async () => {
    const result = await sync('all')

    if (result.hasConflicts) {
      // 显示冲突解决 UI
      setShowConflictResolver(true)
    } else if (result.success) {
      alert('同步成功！')
    }
  }

  return (
    <button onClick={handleSync} disabled={isSyncing}>
      {isSyncing ? '同步中...' : '同步数据'}
    </button>
  )
}
```

### 3. 集成冲突解决 UI

```javascript
import SyncConflictResolver from './components/SyncConflictResolver'

function App() {
  const { hasConflicts, refreshConflicts } = useSync()

  return (
    <>
      {hasConflicts && (
        <SyncConflictResolver
          onResolved={() => {
            refreshConflicts()
            alert('所有冲突已解决！')
          }}
          onCancel={() => {
            console.log('用户选择稍后处理')
          }}
        />
      )}
    </>
  )
}
```

### 4. 手动同步特定数据

```javascript
import { syncRestaurants, syncNutritionGoals } from './lib/syncUtils'

// 仅同步餐厅数据
const result = await syncRestaurants()

// 仅同步营养目标
const result = await syncNutritionGoals()
```

### 5. 推送本地更改

```javascript
import { pushLocalChanges } from './lib/syncUtils'

// 推送餐厅数据到 Supabase
const localRestaurants = JSON.parse(localStorage.getItem('gimme-food-restaurants'))
const result = await pushLocalChanges('restaurants', localRestaurants)
```

---

## 🚀 部署步骤

### 1. 在 Supabase 创建项目

1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 记录 Project URL 和 Anon Key

### 2. 配置环境变量

在 `.env` 文件中添加：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. 运行数据库迁移

在 Supabase Dashboard 中：

1. 进入 SQL Editor
2. 打开 `supabase/migrations/20251031_initial_schema.sql`
3. 复制全部内容并执行

### 4. 启用认证

在 Supabase Dashboard → Authentication：

1. 启用 Email/Password 认证
2. （可选）配置 OAuth providers (Google, GitHub)
3. 配置 Email Templates（欢迎邮件、重置密码）

### 5. 测试同步功能

```bash
# 启动开发服务器
npm run dev

# 测试步骤：
# 1. 注册新用户
# 2. 添加餐厅数据
# 3. 点击同步按钮
# 4. 在另一台设备登录同一账户
# 5. 验证数据已同步
```

### 6. 监控同步状态

在 Supabase Dashboard → Table Editor 中查看：

- `device_sync_metadata`: 查看各设备同步状态
- `sync_conflicts`: 查看未解决的冲突
- `restaurants`, `nutrition_logs`: 验证数据完整性

---

## 🔒 安全考虑

### 1. Row Level Security (RLS)

✅ **已启用**: 所有表都配置了 RLS 策略，用户无法访问其他人的数据。

### 2. API Key 安全

⚠️ **注意**: Anon Key 是公开的，但受 RLS 保护。Service Role Key 绝对不能暴露在客户端。

### 3. 数据验证

在 Supabase 端使用 CHECK 约束：

```sql
CONSTRAINT restaurants_name_check CHECK (length(name) > 0)
CONSTRAINT restaurants_tier_check CHECK (tier IN ('夯', '顶级', '人上人', 'NPC', '拉完了'))
```

---

## 📊 性能优化

### 1. 索引策略

- 为常用查询字段创建索引
- 使用复合索引优化多字段查询
- 避免在频繁更新的字段上建索引

### 2. 批量操作

使用 `upsert` 批量更新数据：

```javascript
await supabase.from('restaurants').upsert(restaurants)
```

### 3. 选择性同步

仅同步必要的字段：

```javascript
const { data } = await supabase
  .from('restaurants')
  .select('id, name, tier, updated_at')  // 不拉取 feedback_history
```

### 4. 本地缓存

使用 localStorage 作为一级缓存，减少网络请求。

---

## 🐛 故障排查

### 问题1: 同步失败

**症状**: 点击同步按钮后无响应或报错。

**排查步骤**:
1. 检查网络连接
2. 验证 Supabase URL 和 Key 是否正确
3. 查看浏览器控制台错误信息
4. 检查用户是否已登录

### 问题2: 冲突无法解决

**症状**: 点击"保留本地版本"或"保留云端版本"后仍显示冲突。

**排查步骤**:
1. 检查 `sync_conflicts` 表中的 `resolved_at` 字段
2. 验证目标表的 RLS 策略是否正确
3. 查看 Supabase Logs

### 问题3: 数据丢失

**症状**: 同步后部分数据消失。

**排查步骤**:
1. 检查 `deleted_at` 字段（可能是软删除）
2. 查看 `device_sync_metadata` 确认同步时间
3. 恢复备份数据（Supabase 提供时间点恢复）

---

## 📚 参考资料

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)

---

## 📝 更新日志

### v1.0.0 (2024-10-31)
- ✅ 初始数据库架构
- ✅ 同步工具函数
- ✅ 冲突检测与解决
- ✅ React Hook 封装
- ✅ UI 组件
- ✅ 完整文档

---

**维护者**: Gimme Food Team
**最后更新**: 2024-10-31
