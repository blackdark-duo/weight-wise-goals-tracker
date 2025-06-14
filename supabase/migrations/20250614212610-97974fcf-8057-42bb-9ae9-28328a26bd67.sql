-- Security Fix Migration: Add missing RLS policies and fix recursive policy
-- This migration addresses critical security vulnerabilities

-- First, fix the recursive RLS policy on app_config by creating a security definer function
CREATE OR REPLACE FUNCTION public.get_current_user_admin_status()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = auth.uid();
$$;

-- Drop existing app_config policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Only admins can view app config" ON public.app_config;
DROP POLICY IF EXISTS "Only admins can update app config" ON public.app_config;

-- Create new non-recursive policies for app_config
CREATE POLICY "Only admins can view app config" 
ON public.app_config 
FOR SELECT 
USING (public.get_current_user_admin_status() = true);

CREATE POLICY "Only admins can update app config" 
ON public.app_config 
FOR UPDATE 
USING (public.get_current_user_admin_status() = true);

CREATE POLICY "Only admins can insert app config" 
ON public.app_config 
FOR INSERT 
WITH CHECK (public.get_current_user_admin_status() = true);

CREATE POLICY "Only admins can delete app config" 
ON public.app_config 
FOR DELETE 
USING (public.get_current_user_admin_status() = true);

-- Enable RLS on tables that don't have it yet
ALTER TABLE public.weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upgrade_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_rate_limits ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for goals (missing from original setup)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'goals' 
    AND policyname = 'Users can view their own goals'
  ) THEN
    CREATE POLICY "Users can view their own goals" 
    ON public.goals 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'goals' 
    AND policyname = 'Users can create their own goals'
  ) THEN
    CREATE POLICY "Users can create their own goals" 
    ON public.goals 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'goals' 
    AND policyname = 'Users can update their own goals'
  ) THEN
    CREATE POLICY "Users can update their own goals" 
    ON public.goals 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'goals' 
    AND policyname = 'Users can delete their own goals'
  ) THEN
    CREATE POLICY "Users can delete their own goals" 
    ON public.goals 
    FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add RLS policies for profiles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile" 
    ON public.profiles 
    FOR SELECT 
    USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" 
    ON public.profiles 
    FOR UPDATE 
    USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Admins can view all profiles'
  ) THEN
    CREATE POLICY "Admins can view all profiles" 
    ON public.profiles 
    FOR SELECT 
    USING (public.get_current_user_admin_status() = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Admins can update all profiles'
  ) THEN
    CREATE POLICY "Admins can update all profiles" 
    ON public.profiles 
    FOR UPDATE 
    USING (public.get_current_user_admin_status() = true);
  END IF;
END $$;

-- Add RLS policies for upgrade_interest
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'upgrade_interest' 
    AND policyname = 'Users can view their own upgrade interest'
  ) THEN
    CREATE POLICY "Users can view their own upgrade interest" 
    ON public.upgrade_interest 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'upgrade_interest' 
    AND policyname = 'Users can create their own upgrade interest'
  ) THEN
    CREATE POLICY "Users can create their own upgrade interest" 
    ON public.upgrade_interest 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'upgrade_interest' 
    AND policyname = 'Users can update their own upgrade interest'
  ) THEN
    CREATE POLICY "Users can update their own upgrade interest" 
    ON public.upgrade_interest 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add RLS policies for webhook_logs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'webhook_logs' 
    AND policyname = 'Users can view their own webhook logs'
  ) THEN
    CREATE POLICY "Users can view their own webhook logs" 
    ON public.webhook_logs 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'webhook_logs' 
    AND policyname = 'Admins can view all webhook logs'
  ) THEN
    CREATE POLICY "Admins can view all webhook logs" 
    ON public.webhook_logs 
    FOR SELECT 
    USING (public.get_current_user_admin_status() = true);
  END IF;
END $$;

-- Add RLS policies for admin_logs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_logs' 
    AND policyname = 'Admins can insert admin logs'
  ) THEN
    CREATE POLICY "Admins can insert admin logs" 
    ON public.admin_logs 
    FOR INSERT 
    WITH CHECK (public.get_current_user_admin_status() = true);
  END IF;
END $$;

-- Add RLS policies for webhook_rate_limits
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'webhook_rate_limits' 
    AND policyname = 'Users can view their own webhook rate limits'
  ) THEN
    CREATE POLICY "Users can view their own webhook rate limits" 
    ON public.webhook_rate_limits 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'webhook_rate_limits' 
    AND policyname = 'Users can insert their own webhook rate limits'
  ) THEN
    CREATE POLICY "Users can insert their own webhook rate limits" 
    ON public.webhook_rate_limits 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'webhook_rate_limits' 
    AND policyname = 'Users can update their own webhook rate limits'
  ) THEN
    CREATE POLICY "Users can update their own webhook rate limits" 
    ON public.webhook_rate_limits 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'webhook_rate_limits' 
    AND policyname = 'Admins can view all webhook rate limits'
  ) THEN
    CREATE POLICY "Admins can view all webhook rate limits" 
    ON public.webhook_rate_limits 
    FOR SELECT 
    USING (public.get_current_user_admin_status() = true);
  END IF;
END $$;