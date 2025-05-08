
-- Function to get webhook config
CREATE OR REPLACE FUNCTION public.get_webhook_config()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  config_data JSONB;
BEGIN
  SELECT 
    jsonb_build_object(
      'url', url,
      'days', days,
      'fields', fields
    ) INTO config_data
  FROM public.webhook_config
  WHERE id = 1;
  
  RETURN COALESCE(config_data, '{"url":"https://n8n.cozyapp.uno/webhook/2c26d7e3-525a-4080-9282-21b6af883cf2","days":30,"fields":{"user_data":true,"weight_data":true,"goal_data":true,"activity_data":false,"detailed_analysis":false}}'::jsonb);
END;
$$;

-- Function to update webhook config
CREATE OR REPLACE FUNCTION public.update_webhook_config(
  config_url TEXT,
  config_days INTEGER,
  config_fields JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  INSERT INTO public.webhook_config (id, url, days, fields)
  VALUES (1, config_url, config_days, config_fields)
  ON CONFLICT (id) 
  DO UPDATE SET 
    url = config_url,
    days = config_days,
    fields = config_fields
  RETURNING jsonb_build_object(
    'id', id,
    'url', url,
    'days', days,
    'fields', fields
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to set up new user profiles with default webhook limit of 10
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, webhook_limit, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', SPLIT_PART(new.email, '@', 1)),
    10,
    new.email
  );
  RETURN new;
END;
$$;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;
