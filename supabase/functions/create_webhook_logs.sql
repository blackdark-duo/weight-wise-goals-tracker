
-- Create a table to store webhook request logs if it doesn't exist
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  request_payload JSONB NOT NULL,
  response_payload JSONB,
  status TEXT,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Add policies if they don't exist
DO $$ 
BEGIN
  -- Check if the policy exists before creating it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'webhook_logs' AND policyname = 'Admins can view all webhook logs'
  ) THEN
    CREATE POLICY "Admins can view all webhook logs"
      ON public.webhook_logs
      FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.is_admin = true
      ));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'webhook_logs' AND policyname = 'Users can view their own webhook logs'
  ) THEN
    CREATE POLICY "Users can view their own webhook logs"
      ON public.webhook_logs
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'webhook_logs' AND policyname = 'Users can insert their own webhook logs'
  ) THEN
    CREATE POLICY "Users can insert their own webhook logs"
      ON public.webhook_logs
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;
