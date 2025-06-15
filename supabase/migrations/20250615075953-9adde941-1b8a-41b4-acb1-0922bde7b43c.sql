-- Create table for console messages
CREATE TABLE public.console_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  page TEXT NOT NULL,
  message TEXT NOT NULL,
  log_level TEXT NOT NULL CHECK (log_level IN ('error', 'warn', 'info', 'debug', 'log')),
  stack_trace TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for toast messages
CREATE TABLE public.toast_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  page TEXT NOT NULL,
  message TEXT NOT NULL,
  toast_type TEXT NOT NULL CHECK (toast_type IN ('success', 'error', 'warning', 'info', 'default')),
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.console_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toast_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for console_logs
CREATE POLICY "Users can view their own console logs" 
ON public.console_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own console logs" 
ON public.console_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all console logs" 
ON public.console_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Create RLS policies for toast_logs
CREATE POLICY "Users can view their own toast logs" 
ON public.toast_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own toast logs" 
ON public.toast_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all toast logs" 
ON public.toast_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Create performance indexes
CREATE INDEX idx_console_logs_user_timestamp ON public.console_logs (user_id, timestamp DESC);
CREATE INDEX idx_console_logs_page ON public.console_logs (page);
CREATE INDEX idx_console_logs_level ON public.console_logs (log_level);

CREATE INDEX idx_toast_logs_user_timestamp ON public.toast_logs (user_id, timestamp DESC);
CREATE INDEX idx_toast_logs_page ON public.toast_logs (page);
CREATE INDEX idx_toast_logs_type ON public.toast_logs (toast_type);

-- Create cleanup function to prevent table bloat
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete console logs older than 30 days
  DELETE FROM public.console_logs 
  WHERE created_at < now() - interval '30 days';
  
  -- Delete toast logs older than 7 days
  DELETE FROM public.toast_logs 
  WHERE created_at < now() - interval '7 days';
END;
$$;