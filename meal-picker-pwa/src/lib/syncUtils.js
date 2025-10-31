import { supabase } from './supabase'

// =====================================================
// DEVICE IDENTIFICATION
// =====================================================

/**
 * 生成或获取设备唯一标识符
 * 存储在 localStorage 中，跨会话持久化
 */
export const getDeviceId = () => {
  let deviceId = localStorage.getItem('gimme-food-device-id')

  if (!deviceId) {
    // 生成新的设备ID：时间戳 + 随机字符串
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem('gimme-food-device-id', deviceId)
  }

  return deviceId
}

/**
 * 获取设备信息
 */
export const getDeviceInfo = () => {
  const deviceId = getDeviceId()

  // 检测设备类型
  const ua = navigator.userAgent
  let deviceType = 'desktop'
  if (/mobile/i.test(ua)) deviceType = 'mobile'
  else if (/tablet|ipad/i.test(ua)) deviceType = 'tablet'

  // 检测平台
  let platform = 'web'
  if (window.matchMedia('(display-mode: standalone)').matches) {
    platform = 'pwa'
  }

  return {
    deviceId,
    deviceType,
    platform,
    deviceName: localStorage.getItem('gimme-food-device-name') || `${deviceType}设备`,
    appVersion: '1.0.0', // 从 package.json 读取
  }
}

/**
 * 设置设备友好名称
 */
export const setDeviceName = (name) => {
  localStorage.setItem('gimme-food-device-name', name)
}

// =====================================================
// SYNC METADATA MANAGEMENT
// =====================================================

/**
 * 更新设备同步元数据
 */
export const updateDeviceSyncMetadata = async (syncType = 'full') => {
  const deviceInfo = getDeviceInfo()
  const user = await supabase.auth.getUser()

  if (!user.data.user) {
    console.error('未登录，无法更新同步元数据')
    return null
  }

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('device_sync_metadata')
    .upsert({
      user_id: user.data.user.id,
      device_id: deviceInfo.deviceId,
      device_name: deviceInfo.deviceName,
      device_type: deviceInfo.deviceType,
      platform: deviceInfo.platform,
      app_version: deviceInfo.appVersion,
      last_sync_at: now,
      last_pull_at: syncType === 'pull' || syncType === 'full' ? now : undefined,
      last_push_at: syncType === 'push' || syncType === 'full' ? now : undefined,
    }, {
      onConflict: 'user_id,device_id',
      returning: 'minimal',
    })

  if (error) {
    console.error('更新同步元数据失败:', error)
    return null
  }

  return data
}

/**
 * 获取最后同步时间
 */
export const getLastSyncTime = async () => {
  const deviceInfo = getDeviceInfo()
  const user = await supabase.auth.getUser()

  if (!user.data.user) return null

  const { data, error } = await supabase
    .from('device_sync_metadata')
    .select('last_sync_at, last_pull_at, last_push_at')
    .eq('user_id', user.data.user.id)
    .eq('device_id', deviceInfo.deviceId)
    .single()

  if (error) {
    console.warn('获取同步时间失败:', error)
    return null
  }

  return data
}

// =====================================================
// CONFLICT DETECTION
// =====================================================

/**
 * 检测同步冲突 - 智能版本
 *
 * 只在以下情况标记为冲突：
 * 1. 两个设备都修改了相同的记录
 * 2. 修改的内容不同（真正的冲突）
 *
 * 不是冲突的情况：
 * - 远程有新记录，本地没有 → 直接同步
 * - 本地有新记录，远程没有 → 直接上传
 * - 远程版本更新 → 直接使用远程版本（newer wins）
 *
 * @param {object} localRecord - 本地记录
 * @param {object} remoteRecord - 远程记录
 * @returns {boolean} 是否存在真正的冲突
 */
export const detectConflict = (localRecord, remoteRecord) => {
  // 情况1: 远程没有数据 → 不是冲突，本地数据需要上传
  if (!remoteRecord) return false

  // 情况2: 本地没有数据 → 不是冲突，直接使用远程数据
  if (!localRecord) return false

  // 情况3: 版本号相同 → 数据一致，不是冲突
  if (localRecord.version === remoteRecord.version) {
    return false
  }

  // 情况4: 远程版本更新（远程 > 本地）→ 不是冲突，使用远程版本
  const localVersion = localRecord.version || 0
  const remoteVersion = remoteRecord.version || 0

  if (remoteVersion > localVersion) {
    // 远程更新，直接使用远程数据（newer wins）
    return false
  }

  // 情况5: 本地版本更新（本地 > 远程）→ 检查是否基于相同的基础版本
  if (localVersion > remoteVersion) {
    // 本地更新了，但需要检查远程是否也基于旧版本修改了

    // 检查关键字段是否不同（真正的数据冲突）
    const fieldsToCheck = ['name', 'tier', 'mealTypes']
    let hasDataConflict = false

    for (const field of fieldsToCheck) {
      const localValue = JSON.stringify(localRecord[field])
      const remoteValue = JSON.stringify(remoteRecord[field])

      if (localValue !== remoteValue) {
        hasDataConflict = true
        break
      }
    }

    // 如果数据相同，即使版本不同也不是冲突（可能只是元数据变化）
    if (!hasDataConflict) {
      return false
    }

    // 检查时间戳：如果远程也是最近修改的，说明两边都在编辑 → 真正的冲突
    const localUpdated = new Date(localRecord.updated_at)
    const remoteUpdated = new Date(remoteRecord.updated_at)
    const timeDiff = Math.abs(localUpdated - remoteUpdated)

    // 如果两者修改时间接近（5分钟内），且数据不同 → 真正的冲突
    if (timeDiff < 5 * 60 * 1000 && hasDataConflict) {
      console.warn('🔥 检测到真实冲突:', {
        local: localRecord.name,
        remote: remoteRecord.name,
        localVersion,
        remoteVersion,
        timeDiff: `${Math.floor(timeDiff / 1000)}秒`,
      })
      return true
    }

    // 时间差较大 → 使用本地版本（本地是最新的）
    return false
  }

  // 默认：不是冲突
  return false
}

/**
 * 保存冲突记录到数据库
 */
export const saveConflict = async (tableName, recordId, localData, remoteData, conflictType) => {
  const deviceInfo = getDeviceInfo()
  const user = await supabase.auth.getUser()

  if (!user.data.user) {
    console.error('未登录，无法保存冲突')
    return null
  }

  const { data, error } = await supabase
    .from('sync_conflicts')
    .insert({
      user_id: user.data.user.id,
      table_name: tableName,
      record_id: recordId,
      local_data: localData,
      remote_data: remoteData,
      conflict_type: conflictType,
      device_id: deviceInfo.deviceId,
    })
    .select()
    .single()

  if (error) {
    console.error('保存冲突失败:', error)
    return null
  }

  return data
}

/**
 * 获取未解决的冲突
 */
export const getUnresolvedConflicts = async () => {
  const user = await supabase.auth.getUser()

  if (!user.data.user) return []

  const { data, error } = await supabase
    .from('sync_conflicts')
    .select('*')
    .eq('user_id', user.data.user.id)
    .is('resolved_at', null)
    .order('detected_at', { ascending: false })

  if (error) {
    console.error('获取冲突失败:', error)
    return []
  }

  return data || []
}

/**
 * 解决冲突
 * @param {string} conflictId - 冲突ID
 * @param {string} resolution - 解决方案: 'keep_local' | 'keep_remote' | 'merge'
 * @param {object} mergedData - 如果是 merge，提供合并后的数据
 */
export const resolveConflict = async (conflictId, resolution, mergedData = null) => {
  const { data: conflict, error: fetchError } = await supabase
    .from('sync_conflicts')
    .select('*')
    .eq('id', conflictId)
    .single()

  if (fetchError || !conflict) {
    console.error('获取冲突详情失败:', fetchError)
    return { success: false, error: fetchError }
  }

  let finalData = null

  // 根据解决方案确定最终数据
  switch (resolution) {
    case 'keep_local':
      finalData = conflict.local_data
      break
    case 'keep_remote':
      finalData = conflict.remote_data
      break
    case 'merge':
      finalData = mergedData || { ...conflict.remote_data, ...conflict.local_data }
      break
    default:
      return { success: false, error: '无效的解决方案' }
  }

  // 更新目标表的记录
  const { error: updateError } = await supabase
    .from(conflict.table_name)
    .update({
      ...finalData,
      version: (finalData.version || 0) + 1,
      device_id: getDeviceId(),
    })
    .eq('id', conflict.record_id)

  if (updateError) {
    console.error('更新记录失败:', updateError)
    return { success: false, error: updateError }
  }

  // 标记冲突为已解决
  const { error: resolveError } = await supabase
    .from('sync_conflicts')
    .update({
      resolved_at: new Date().toISOString(),
      resolution,
    })
    .eq('id', conflictId)

  if (resolveError) {
    console.error('标记冲突为已解决失败:', resolveError)
    return { success: false, error: resolveError }
  }

  return { success: true, data: finalData }
}

// =====================================================
// SYNC OPERATIONS
// =====================================================

// 本地存储键名（与实际应用保持一致）
const STORAGE_KEYS = {
  RESTAURANTS: 'gimme_food_restaurants',
  NUTRITION_GOALS: 'gimmefood_nutrition_goal', // Note: singular, no underscore prefix
  NUTRITION_LOGS: 'gimme_food_nutrition_logs',
  ID_MAPPING: 'gimme_food_id_mapping', // Maps local timestamp IDs to cloud UUIDs
}

/**
 * Get or create cloud UUID for a local ID
 */
const getCloudId = (localId) => {
  // If already a valid UUID, return as-is
  if (isValidUUID(localId)) {
    return localId
  }

  // Check if we have a mapping
  const mappingStr = localStorage.getItem(STORAGE_KEYS.ID_MAPPING)
  const mapping = mappingStr ? JSON.parse(mappingStr) : {}

  // If we have a cloud ID for this local ID, return it
  if (mapping[localId]) {
    return mapping[localId]
  }

  // Generate a new UUID and store the mapping
  const cloudId = generateUUID()
  mapping[localId] = cloudId
  localStorage.setItem(STORAGE_KEYS.ID_MAPPING, JSON.stringify(mapping))

  return cloudId
}

// Tier mapping: local pinyin -> database Chinese
const TIER_TO_DB = {
  'hàng': '夯',
  'dǐngjí': '顶级',
  'rénshàngrén': '人上人',
  'NPC': 'NPC',
  'lāwánle': '拉完了',
}

const TIER_FROM_DB = {
  '夯': 'hàng',
  '顶级': 'dǐngjí',
  '人上人': 'rénshàngrén',
  'NPC': 'NPC',
  '拉完了': 'lāwánle',
}

/**
 * Check if a string is a valid UUID
 */
const isValidUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

/**
 * Generate a UUID v4
 */
const generateUUID = () => {
  // Use crypto.randomUUID() if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback to manual generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Transform local restaurant data to Supabase format
 */
const transformToDBFormat = (localRestaurant) => {
  // Get or create cloud UUID for this restaurant
  const cloudId = getCloudId(localRestaurant.id)

  return {
    id: cloudId,
    name: localRestaurant.name,
    tier: TIER_TO_DB[localRestaurant.tier] || localRestaurant.tier,
    meal_types: localRestaurant.mealTypes || [],
    weight: localRestaurant.currentWeight || localRestaurant.dynamicWeight || 1.0,
    last_selected_at: localRestaurant.lastSelected || null,
    feedback_history: localRestaurant.feedbackHistory || [],
    // created_at and updated_at will be handled by DB defaults if not provided
    updated_at: new Date().toISOString(),
  }
}

/**
 * Transform Supabase restaurant data to local format
 */
const transformFromDBFormat = (dbRestaurant) => {
  return {
    id: dbRestaurant.id,
    name: dbRestaurant.name,
    tier: TIER_FROM_DB[dbRestaurant.tier] || dbRestaurant.tier,
    mealTypes: dbRestaurant.meal_types || [],
    currentWeight: dbRestaurant.weight || 1.0,
    dynamicWeight: dbRestaurant.weight || 1.0,
    originalTier: TIER_FROM_DB[dbRestaurant.tier] || dbRestaurant.tier,
    lastSelected: dbRestaurant.last_selected_at || null,
    createdAt: dbRestaurant.created_at || new Date().toISOString(),
    feedbackHistory: dbRestaurant.feedback_history || [],
    selectionCount: 0, // Not stored in DB, reset
    rejectionCount: 0, // Not stored in DB, reset
    version: dbRestaurant.version || 1,
    updated_at: dbRestaurant.updated_at,
  }
}

/**
 * Transform local nutrition goal data to Supabase format
 */
const transformNutritionGoalToDBFormat = (localGoal) => {
  if (!localGoal) return null

  return {
    id: localGoal.id || generateUUID(),
    calories_goal: localGoal.calories || 0,
    protein_goal: localGoal.protein || 0,
    carbs_goal: localGoal.carbs || 0,
    fat_goal: localGoal.fat || 0,
    fiber_goal: localGoal.fiber || 0,
    sugar_goal: localGoal.sugar || 0,
    sodium_goal: localGoal.sodium || 0,
    goal_type: localGoal.goalType || 'daily',
    notes: localGoal.notes || null,
    updated_at: new Date().toISOString(),
  }
}

/**
 * Transform Supabase nutrition goal data to local format
 */
const transformNutritionGoalFromDBFormat = (dbGoal) => {
  if (!dbGoal) return null

  return {
    id: dbGoal.id,
    calories: dbGoal.calories_goal || 0,
    protein: dbGoal.protein_goal || 0,
    carbs: dbGoal.carbs_goal || 0,
    fat: dbGoal.fat_goal || 0,
    fiber: dbGoal.fiber_goal || 0,
    sugar: dbGoal.sugar_goal || 0,
    sodium: dbGoal.sodium_goal || 0,
    goalType: dbGoal.goal_type || 'daily',
    notes: dbGoal.notes || null,
    updatedAt: dbGoal.updated_at || new Date().toISOString(),
    version: dbGoal.version || 1,
  }
}

/**
 * 从本地存储读取数据
 */
const getLocalData = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (err) {
    console.error('读取本地数据失败:', err)
    return null
  }
}

/**
 * 保存数据到本地存储
 */
const saveLocalData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (err) {
    console.error('保存本地数据失败:', err)
    return false
  }
}

/**
 * 同步餐厅数据 - 双向同步（推送 + 拉取 + 智能合并）
 * @returns {object} { success, conflicts, data }
 */
export const syncRestaurants = async () => {
  const deviceInfo = getDeviceInfo()
  const user = await supabase.auth.getUser()

  if (!user.data.user) {
    return { success: false, error: '未登录' }
  }

  const conflicts = []

  // 1. 从 Supabase 拉取远程数据
  const { data: remoteData, error: fetchError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('user_id', user.data.user.id)
    .is('deleted_at', null)

  if (fetchError) {
    console.error('拉取餐厅数据失败:', fetchError)
    return { success: false, error: fetchError }
  }

  // 2. 获取本地数据
  const localData = getLocalData(STORAGE_KEYS.RESTAURANTS) || []

  // 3. Transform remote data to local format for comparison
  const remoteDataLocal = remoteData.map(transformFromDBFormat)

  // 4. Create deduplication maps (by ID and by name)
  const remoteMap = new Map(remoteDataLocal.map(r => [r.id, r]))
  const remoteByName = new Map(remoteDataLocal.map(r => [r.name.toLowerCase().trim(), r]))

  const localMap = new Map(localData.map(r => [getCloudId(r.id), r]))
  const localByName = new Map(localData.map(r => [r.name.toLowerCase().trim(), r]))

  // 4. 三路合并：本地、远程、冲突
  const mergedData = []
  const itemsToPush = []

  // 4a. 处理本地数据 (with deduplication)
  const processedNames = new Set() // Track which names we've already processed

  for (const localRecord of localData) {
    const cloudId = getCloudId(localRecord.id)
    const normalizedName = localRecord.name.toLowerCase().trim()

    // Skip if we've already processed a restaurant with this name
    if (processedNames.has(normalizedName)) {
      console.log(`⚠️ 跳过重复餐厅: ${localRecord.name}`)
      continue
    }

    let remoteRecord = remoteMap.get(cloudId)

    // If no ID match, try matching by name (deduplication)
    if (!remoteRecord) {
      remoteRecord = remoteByName.get(normalizedName)

      if (remoteRecord) {
        // Found same restaurant by name! Use cloud version and update ID mapping
        console.log(`🔗 匹配餐厅 "${localRecord.name}" (本地ID: ${localRecord.id} → 云端ID: ${remoteRecord.id})`)

        // Update ID mapping so future syncs use the same cloud ID
        const mappingStr = localStorage.getItem(STORAGE_KEYS.ID_MAPPING)
        const mapping = mappingStr ? JSON.parse(mappingStr) : {}
        mapping[localRecord.id] = remoteRecord.id
        localStorage.setItem(STORAGE_KEYS.ID_MAPPING, JSON.stringify(mapping))

        // Use the remote version (it's the authoritative one)
        mergedData.push(remoteRecord)
        processedNames.add(normalizedName)
        continue
      }
    }

    // No match by ID or name - this is a new restaurant
    if (!remoteRecord) {
      // 本地有，远程没有 → 需要上传到云端
      const dbFormat = transformToDBFormat(localRecord)
      itemsToPush.push({
        ...dbFormat,
        user_id: user.data.user.id,
        device_id: deviceInfo.deviceId,
        version: (localRecord.version || 0) + 1,
      })
      mergedData.push(localRecord)
      processedNames.add(normalizedName)
    } else if (detectConflict(localRecord, remoteRecord)) {
      // 真正的冲突 → 保存到冲突表
      const conflict = await saveConflict(
        'restaurants',
        localRecord.id,
        localRecord,
        remoteRecord,
        'update_conflict'
      )
      if (conflict) {
        conflicts.push(conflict)
      }
      // 冲突情况下暂时保留本地版本
      mergedData.push(localRecord)
      processedNames.add(normalizedName)
    } else {
      // 远程版本更新或相同 → 使用远程版本
      mergedData.push(remoteRecord)
      processedNames.add(normalizedName)
    }
  }

  // 4b. 处理远程独有的数据（本地没有的，且名字也没重复）
  for (const remoteRecordLocal of remoteDataLocal) {
    const normalizedName = remoteRecordLocal.name.toLowerCase().trim()

    // Skip if we've already processed this restaurant name
    if (processedNames.has(normalizedName)) {
      continue
    }

    if (!localMap.has(remoteRecordLocal.id) && !localByName.has(normalizedName)) {
      // 远程有，本地没有（ID和名字都不匹配）→ 添加到本地
      mergedData.push(remoteRecordLocal)
      processedNames.add(normalizedName)
    }
  }

  // 5. 如果有冲突，返回冲突信息，等待用户解决
  if (conflicts.length > 0) {
    // 即使有冲突，也先保存合并的数据（不含冲突项）
    saveLocalData(STORAGE_KEYS.RESTAURANTS, mergedData)

    return {
      success: false,
      hasConflicts: true,
      conflicts,
      message: `发现 ${conflicts.length} 个冲突，需要手动解决`,
    }
  }

  // 6. 推送本地新增/修改的数据到云端
  if (itemsToPush.length > 0) {
    console.log(`📤 推送 ${itemsToPush.length} 条本地数据到云端...`)

    const { error: pushError } = await supabase
      .from('restaurants')
      .upsert(itemsToPush, {
        onConflict: 'id',
      })

    if (pushError) {
      console.error('推送数据失败:', pushError)
      return { success: false, error: pushError }
    }

    // 7. After successful push, update local records to use cloud IDs
    for (let i = 0; i < mergedData.length; i++) {
      const localRecord = mergedData[i]
      const cloudId = getCloudId(localRecord.id)

      // Update the record's ID to match cloud
      if (localRecord.id !== cloudId) {
        mergedData[i] = { ...localRecord, id: cloudId }
      }
    }
  }

  // 8. 保存合并后的数据到本地（现在使用云端 UUID）
  saveLocalData(STORAGE_KEYS.RESTAURANTS, mergedData)

  // 9. 更新同步元数据
  await updateDeviceSyncMetadata('full')

  console.log(`✅ 同步成功: ${mergedData.length} 条记录 (推送 ${itemsToPush.length} 条)`)

  return {
    success: true,
    data: mergedData,
    message: '同步成功',
    stats: {
      total: mergedData.length,
      pushed: itemsToPush.length,
      pulled: remoteDataLocal.filter(r => !localMap.has(r.id)).length,
    }
  }
}

/**
 * 同步营养目标数据 - 双向同步
 */
export const syncNutritionGoals = async () => {
  const deviceInfo = getDeviceInfo()
  const user = await supabase.auth.getUser()

  if (!user.data.user) {
    return { success: false, error: '未登录' }
  }

  // 拉取远程数据 - 使用 maybeSingle() 以处理0或1条记录
  const { data: remoteData, error: fetchError } = await supabase
    .from('nutrition_goals')
    .select('*')
    .eq('user_id', user.data.user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fetchError) {
    console.error('拉取营养目标失败:', fetchError)
    return { success: false, error: fetchError }
  }

  // 获取本地数据
  const localData = getLocalData(STORAGE_KEYS.NUTRITION_GOALS)

  // Transform remote data to local format for comparison
  const remoteDataLocal = remoteData ? transformNutritionGoalFromDBFormat(remoteData) : null

  // 决定使用哪个数据
  let finalDataLocal = null
  let shouldPush = false

  if (!localData && !remoteDataLocal) {
    // 两边都没有数据
    return { success: true, data: null, message: '无数据需要同步' }
  } else if (!remoteDataLocal) {
    // 本地有，远程没有 → 推送本地到云端
    finalDataLocal = localData
    shouldPush = true
  } else if (!localData) {
    // 远程有，本地没有 → 拉取到本地
    finalDataLocal = remoteDataLocal
  } else if (detectConflict(localData, remoteDataLocal)) {
    // 检测冲突
    const conflict = await saveConflict(
      'nutrition_goals',
      localData.id,
      localData,
      remoteDataLocal,
      'update_conflict'
    )

    return {
      success: false,
      hasConflicts: true,
      conflicts: [conflict],
      message: '发现冲突，需要手动解决',
    }
  } else {
    // 使用远程版本（更新的）
    finalDataLocal = remoteDataLocal
  }

  // 推送到云端（如果需要）
  if (shouldPush && finalDataLocal) {
    const dbFormat = transformNutritionGoalToDBFormat(finalDataLocal)

    const { error: pushError } = await supabase
      .from('nutrition_goals')
      .upsert({
        ...dbFormat,
        user_id: user.data.user.id,
        device_id: deviceInfo.deviceId,
        version: (finalDataLocal.version || 0) + 1,
      }, {
        onConflict: 'user_id',  // Use user_id conflict since nutrition_goals has unique constraint on user_id
      })

    if (pushError) {
      console.error('推送营养目标失败:', pushError)
      return { success: false, error: pushError }
    }
  }

  // 保存到本地（使用本地格式）
  if (finalDataLocal) {
    saveLocalData(STORAGE_KEYS.NUTRITION_GOALS, finalDataLocal)
  }

  await updateDeviceSyncMetadata('full')

  console.log(`✅ 营养目标同步成功${shouldPush ? ' (已推送到云端)' : ''}`)

  return {
    success: true,
    data: finalDataLocal,
    message: '同步成功',
  }
}

/**
 * 同步营养日志数据 - 双向同步
 * @param {Date} startDate - 开始日期
 * @param {Date} endDate - 结束日期
 */
export const syncNutritionLogs = async (startDate, endDate) => {
  const deviceInfo = getDeviceInfo()
  const user = await supabase.auth.getUser()

  if (!user.data.user) {
    return { success: false, error: '未登录' }
  }

  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 默认30天
  const end = endDate || new Date()

  // 拉取远程数据
  const { data: remoteData, error: fetchError } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', user.data.user.id)
    .gte('log_date', start.toISOString().split('T')[0])
    .lte('log_date', end.toISOString().split('T')[0])
    .is('deleted_at', null)
    .order('log_date', { ascending: false })

  if (fetchError) {
    console.error('拉取营养日志失败:', fetchError)
    return { success: false, error: fetchError }
  }

  // 获取本地数据
  const localData = getLocalData(STORAGE_KEYS.NUTRITION_LOGS) || []

  // 创建映射
  const remoteMap = new Map(remoteData.map(r => [r.id, r]))
  const localMap = new Map(localData.map(r => [r.id, r]))

  // 三路合并
  const mergedData = []
  const itemsToPush = []
  const conflicts = []

  // 处理本地数据
  for (const localRecord of localData) {
    const remoteRecord = remoteMap.get(localRecord.id)

    if (!remoteRecord) {
      // 本地有，远程没有 → 需要上传
      itemsToPush.push({
        ...localRecord,
        user_id: user.data.user.id,
        device_id: deviceInfo.deviceId,
        version: (localRecord.version || 0) + 1,
      })
      mergedData.push(localRecord)
    } else if (detectConflict(localRecord, remoteRecord)) {
      // 冲突
      const conflict = await saveConflict(
        'nutrition_logs',
        localRecord.id,
        localRecord,
        remoteRecord,
        'update_conflict'
      )
      if (conflict) conflicts.push(conflict)
      mergedData.push(localRecord)
    } else {
      // 使用远程版本
      mergedData.push(remoteRecord)
    }
  }

  // 处理远程独有的数据
  for (const remoteRecord of remoteData) {
    if (!localMap.has(remoteRecord.id)) {
      mergedData.push(remoteRecord)
    }
  }

  if (conflicts.length > 0) {
    saveLocalData(STORAGE_KEYS.NUTRITION_LOGS, mergedData)
    return {
      success: false,
      hasConflicts: true,
      conflicts,
      message: `发现 ${conflicts.length} 个冲突，需要手动解决`,
    }
  }

  // 推送本地新增的数据
  if (itemsToPush.length > 0) {
    const { error: pushError } = await supabase
      .from('nutrition_logs')
      .upsert(itemsToPush, {
        onConflict: 'id',
      })

    if (pushError) {
      console.error('推送营养日志失败:', pushError)
      return { success: false, error: pushError }
    }
  }

  // 保存合并后的数据
  saveLocalData(STORAGE_KEYS.NUTRITION_LOGS, mergedData)

  await updateDeviceSyncMetadata('full')

  return {
    success: true,
    data: mergedData,
    message: '同步成功',
  }
}

/**
 * 完整同步 - 同步所有数据
 */
export const syncAll = async () => {
  console.log('🔄 开始完整同步...')

  const results = {
    restaurants: await syncRestaurants(),
    nutritionGoals: await syncNutritionGoals(),
    nutritionLogs: await syncNutritionLogs(),
  }

  const hasConflicts = Object.values(results).some(r => r.hasConflicts)
  const allSuccess = Object.values(results).every(r => r.success)

  if (hasConflicts) {
    const totalConflicts = Object.values(results)
      .flatMap(r => r.conflicts || [])
      .length

    console.warn(`⚠️ 同步完成，但发现 ${totalConflicts} 个冲突`)

    return {
      success: false,
      hasConflicts: true,
      results,
      message: `发现 ${totalConflicts} 个冲突，需要手动解决`,
    }
  }

  if (allSuccess) {
    console.log('✅ 完整同步成功')
    return {
      success: true,
      results,
      message: '所有数据同步成功',
    }
  }

  console.error('❌ 同步失败')
  return {
    success: false,
    results,
    message: '部分数据同步失败',
  }
}

/**
 * 推送本地更改到 Supabase
 */
export const pushLocalChanges = async (tableName, localData) => {
  const deviceInfo = getDeviceInfo()
  const user = await supabase.auth.getUser()

  if (!user.data.user) {
    return { success: false, error: '未登录' }
  }

  // 为每条记录添加用户ID和设备ID
  const dataWithMetadata = Array.isArray(localData)
    ? localData.map(item => ({
        ...item,
        user_id: user.data.user.id,
        device_id: deviceInfo.deviceId,
        version: (item.version || 0) + 1,
      }))
    : {
        ...localData,
        user_id: user.data.user.id,
        device_id: deviceInfo.deviceId,
        version: (localData.version || 0) + 1,
      }

  // Upsert 到 Supabase
  const { data, error } = await supabase
    .from(tableName)
    .upsert(dataWithMetadata, {
      onConflict: 'id',
    })
    .select()

  if (error) {
    console.error('推送数据失败:', error)
    return { success: false, error }
  }

  await updateDeviceSyncMetadata('push')

  return {
    success: true,
    data,
    message: '推送成功',
  }
}
