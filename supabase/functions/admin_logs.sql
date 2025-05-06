
-- Create admin_logs table to track admin operations
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  details JSONB,
  ip_address TEXT
);

-- Add RLS policy for admin_logs
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Only admins can view logs" 
  ON public.admin_logs 
  FOR SELECT 
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);

-- Only the system can insert logs (functions with security definer)
CREATE POLICY "Only system can insert logs" 
  ON public.admin_logs 
  FOR INSERT 
  WITH CHECK (true);
