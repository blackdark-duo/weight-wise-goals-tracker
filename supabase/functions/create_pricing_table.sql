
-- SQL to create a pricing_clicks table to track user interactions with pricing page
-- This would be executed via the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.pricing_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  tier TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  location TEXT,
  browser TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricing_clicks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert rows
CREATE POLICY "Users can insert their pricing clicks"
ON public.pricing_clicks
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to view only their own clicks
CREATE POLICY "Users can view their own pricing clicks"
ON public.pricing_clicks
FOR SELECT
TO authenticated
USING (session_id = auth.uid()::text);

-- Allow admin to view all clicks
CREATE POLICY "Admins can view all pricing clicks"
ON public.pricing_clicks
FOR SELECT
TO authenticated
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);
