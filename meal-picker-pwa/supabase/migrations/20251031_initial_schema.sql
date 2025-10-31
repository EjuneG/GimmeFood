-- =====================================================
-- Gimme Food - Initial Database Schema
-- =====================================================
-- This migration creates the complete database schema for
-- multi-device sync with conflict resolution support.
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: restaurants
-- Stores user's restaurant configurations with tier system
-- =====================================================
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Restaurant basic info
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('夯', '顶级', '人上人', 'NPC', '拉完了')),

  -- Meal types (stored as array for flexibility)
  meal_types TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  -- Valid values: '早餐', '午餐', '晚餐', '零食'

  -- Algorithm data
  weight DECIMAL(10, 2) NOT NULL DEFAULT 1.0,
  last_selected_at TIMESTAMPTZ,

  -- Feedback history (stored as JSONB for flexibility)
  -- Format: [{ "date": "2024-01-01", "action": "accepted/rejected", "tier_at_time": "夯" }]
  feedback_history JSONB DEFAULT '[]'::JSONB,

  -- Sync metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete for sync conflict resolution
  device_id TEXT, -- Track which device made last change
  version INTEGER NOT NULL DEFAULT 1, -- Optimistic locking

  -- Indexes for performance
  CONSTRAINT restaurants_name_check CHECK (length(name) > 0)
);

-- Create indexes for common queries
CREATE INDEX idx_restaurants_user_id ON public.restaurants(user_id);
CREATE INDEX idx_restaurants_tier ON public.restaurants(tier);
CREATE INDEX idx_restaurants_deleted_at ON public.restaurants(deleted_at);
CREATE INDEX idx_restaurants_updated_at ON public.restaurants(updated_at DESC);

-- =====================================================
-- TABLE: nutrition_goals
-- Stores user's daily nutrition targets
-- =====================================================
CREATE TABLE IF NOT EXISTS public.nutrition_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Nutrition targets (in grams or kcal)
  calories_goal DECIMAL(10, 2), -- 卡路里目標 (kcal)
  protein_goal DECIMAL(10, 2),  -- 蛋白質目標 (g)
  carbs_goal DECIMAL(10, 2),    -- 碳水化合物目標 (g)
  fat_goal DECIMAL(10, 2),      -- 脂肪目標 (g)

  -- Additional goals (optional)
  fiber_goal DECIMAL(10, 2),    -- 纖維目標 (g)
  sugar_goal DECIMAL(10, 2),    -- 糖分目標 (g)
  sodium_goal DECIMAL(10, 2),   -- 鈉目標 (mg)

  -- Goal metadata
  goal_type TEXT DEFAULT 'daily', -- 'daily', 'weekly', 'custom'
  notes TEXT,

  -- Sync metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_id TEXT,
  version INTEGER NOT NULL DEFAULT 1,

  -- Ensure one active goal per user
  CONSTRAINT nutrition_goals_user_unique UNIQUE (user_id)
);

CREATE INDEX idx_nutrition_goals_user_id ON public.nutrition_goals(user_id);

-- =====================================================
-- TABLE: nutrition_logs
-- Stores daily nutrition intake records
-- =====================================================
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Date tracking
  log_date DATE NOT NULL,
  meal_type TEXT, -- '早餐', '午餐', '晚餐', '零食'

  -- Nutrition values (actual intake)
  calories DECIMAL(10, 2) DEFAULT 0,
  protein DECIMAL(10, 2) DEFAULT 0,
  carbs DECIMAL(10, 2) DEFAULT 0,
  fat DECIMAL(10, 2) DEFAULT 0,
  fiber DECIMAL(10, 2) DEFAULT 0,
  sugar DECIMAL(10, 2) DEFAULT 0,
  sodium DECIMAL(10, 2) DEFAULT 0,

  -- Meal details
  meal_name TEXT, -- Restaurant or meal name
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  portion_size TEXT, -- '小份', '中份', '大份', or custom

  -- Notes
  notes TEXT,

  -- Sync metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete
  device_id TEXT,
  version INTEGER NOT NULL DEFAULT 1
);

-- Create indexes for common queries
CREATE INDEX idx_nutrition_logs_user_id ON public.nutrition_logs(user_id);
CREATE INDEX idx_nutrition_logs_date ON public.nutrition_logs(log_date DESC);
CREATE INDEX idx_nutrition_logs_user_date ON public.nutrition_logs(user_id, log_date DESC);
CREATE INDEX idx_nutrition_logs_deleted_at ON public.nutrition_logs(deleted_at);

-- =====================================================
-- TABLE: device_sync_metadata
-- Tracks sync state per device for conflict detection
-- =====================================================
CREATE TABLE IF NOT EXISTS public.device_sync_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Device identification
  device_id TEXT NOT NULL,
  device_name TEXT, -- User-friendly name: "iPhone 13", "工作電腦"
  device_type TEXT, -- 'mobile', 'desktop', 'tablet'

  -- Sync tracking
  last_sync_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_pull_at TIMESTAMPTZ, -- Last time device pulled data
  last_push_at TIMESTAMPTZ, -- Last time device pushed data

  -- Sync statistics
  sync_count INTEGER DEFAULT 0,
  conflict_count INTEGER DEFAULT 0,

  -- Device metadata
  app_version TEXT,
  platform TEXT, -- 'ios', 'android', 'web', 'pwa'

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT device_sync_user_device_unique UNIQUE (user_id, device_id)
);

CREATE INDEX idx_device_sync_user_id ON public.device_sync_metadata(user_id);
CREATE INDEX idx_device_sync_last_sync ON public.device_sync_metadata(last_sync_at DESC);

-- =====================================================
-- TABLE: sync_conflicts
-- Temporary storage for conflicts that need user resolution
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sync_conflicts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Conflict details
  table_name TEXT NOT NULL, -- 'restaurants', 'nutrition_goals', 'nutrition_logs'
  record_id UUID NOT NULL,

  -- Conflicting versions
  local_data JSONB NOT NULL,  -- Data from current device
  remote_data JSONB NOT NULL, -- Data from Supabase

  -- Conflict metadata
  conflict_type TEXT NOT NULL, -- 'update_conflict', 'delete_conflict'
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolution TEXT, -- 'keep_local', 'keep_remote', 'merge'

  -- Device that detected the conflict
  device_id TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sync_conflicts_user_id ON public.sync_conflicts(user_id);
CREATE INDEX idx_sync_conflicts_unresolved ON public.sync_conflicts(user_id, resolved_at) WHERE resolved_at IS NULL;

-- =====================================================
-- FUNCTIONS: Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_goals_updated_at BEFORE UPDATE ON public.nutrition_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_logs_updated_at BEFORE UPDATE ON public.nutrition_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_device_sync_updated_at BEFORE UPDATE ON public.device_sync_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_sync_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_conflicts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICY: restaurants
-- Users can only access their own restaurants
-- =====================================================
CREATE POLICY "Users can view own restaurants"
  ON public.restaurants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own restaurants"
  ON public.restaurants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own restaurants"
  ON public.restaurants FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own restaurants"
  ON public.restaurants FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICY: nutrition_goals
-- Users can only access their own nutrition goals
-- =====================================================
CREATE POLICY "Users can view own nutrition goals"
  ON public.nutrition_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition goals"
  ON public.nutrition_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition goals"
  ON public.nutrition_goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition goals"
  ON public.nutrition_goals FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICY: nutrition_logs
-- Users can only access their own nutrition logs
-- =====================================================
CREATE POLICY "Users can view own nutrition logs"
  ON public.nutrition_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition logs"
  ON public.nutrition_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition logs"
  ON public.nutrition_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition logs"
  ON public.nutrition_logs FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICY: device_sync_metadata
-- Users can only access their own device sync data
-- =====================================================
CREATE POLICY "Users can view own device sync metadata"
  ON public.device_sync_metadata FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own device sync metadata"
  ON public.device_sync_metadata FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own device sync metadata"
  ON public.device_sync_metadata FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own device sync metadata"
  ON public.device_sync_metadata FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICY: sync_conflicts
-- Users can only access their own sync conflicts
-- =====================================================
CREATE POLICY "Users can view own sync conflicts"
  ON public.sync_conflicts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync conflicts"
  ON public.sync_conflicts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync conflicts"
  ON public.sync_conflicts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sync conflicts"
  ON public.sync_conflicts FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get daily nutrition summary
CREATE OR REPLACE FUNCTION get_daily_nutrition_summary(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  log_date DATE,
  total_calories DECIMAL,
  total_protein DECIMAL,
  total_carbs DECIMAL,
  total_fat DECIMAL,
  total_fiber DECIMAL,
  total_sugar DECIMAL,
  total_sodium DECIMAL,
  meal_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    nl.log_date,
    SUM(nl.calories) as total_calories,
    SUM(nl.protein) as total_protein,
    SUM(nl.carbs) as total_carbs,
    SUM(nl.fat) as total_fat,
    SUM(nl.fiber) as total_fiber,
    SUM(nl.sugar) as total_sugar,
    SUM(nl.sodium) as total_sodium,
    COUNT(*) as meal_count
  FROM public.nutrition_logs nl
  WHERE nl.user_id = p_user_id
    AND nl.log_date = p_date
    AND nl.deleted_at IS NULL
  GROUP BY nl.log_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- This will be commented out in production
-- Uncomment to insert sample data for testing

/*
-- Sample user (you'll need to create this user in Supabase Auth first)
-- Replace with actual user_id from auth.users table

DO $$
DECLARE
  sample_user_id UUID := 'YOUR_USER_ID_HERE';
BEGIN
  -- Sample restaurants
  INSERT INTO public.restaurants (user_id, name, tier, meal_types, weight) VALUES
    (sample_user_id, '麥當勞', '夯', ARRAY['早餐', '午餐', '晚餐'], 1.5),
    (sample_user_id, '鼎泰豐', '顶级', ARRAY['午餐', '晚餐'], 2.0),
    (sample_user_id, '路邊攤', 'NPC', ARRAY['午餐', '晚餐', '零食'], 0.8);

  -- Sample nutrition goal
  INSERT INTO public.nutrition_goals (user_id, calories_goal, protein_goal, carbs_goal, fat_goal) VALUES
    (sample_user_id, 2000, 150, 250, 65);

  -- Sample nutrition log
  INSERT INTO public.nutrition_logs (user_id, log_date, meal_type, meal_name, calories, protein, carbs, fat) VALUES
    (sample_user_id, CURRENT_DATE, '早餐', '麥當勞早餐', 500, 20, 60, 25);
END $$;
*/
