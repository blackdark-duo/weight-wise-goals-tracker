
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
  
  RETURN COALESCE(config_data, '{"url":"http://n8n.cozyapp.uno:5678/webhook-test/36e520c4-f7a4-4872-8e21-e469701eb68e","days":30,"fields":{"user_data":true,"weight_data":true,"goal_data":true,"activity_data":false,"detailed_analysis":false}}'::jsonb);
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
