
-- Add deletion_date and scheduled_for_deletion columns to profiles table
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS scheduled_for_deletion BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS deletion_date TIMESTAMP WITH TIME ZONE;

-- Set default for show_ai_insights to true
ALTER TABLE IF EXISTS profiles ALTER COLUMN show_ai_insights SET DEFAULT TRUE;

-- Update existing NULL values for show_ai_insights to TRUE
UPDATE profiles SET show_ai_insights = TRUE WHERE show_ai_insights IS NULL;

-- Ensure all profiles have a timezone set
UPDATE profiles SET timezone = 'UTC' WHERE timezone IS NULL;

-- Ensure all profiles have the global webhook URL
WITH webhook_config_url AS (
  SELECT url FROM webhook_config LIMIT 1
)
UPDATE profiles 
SET webhook_url = webhook_config_url.url 
FROM webhook_config_url 
WHERE profiles.webhook_url IS NULL OR profiles.webhook_url = '';

-- Set default webhook URL for the global config if not set
INSERT INTO webhook_config (id, url, days)
VALUES (1, 'http://n8n.cozyapp.uno:5678/webhook-test/36e520c4-f7a4-4872-8e21-e469701eb68e', 30)
ON CONFLICT (id) 
DO NOTHING;

-- Add columns to weight_entries for storing original values
ALTER TABLE IF EXISTS weight_entries 
ADD COLUMN IF NOT EXISTS original_weight NUMERIC;

ALTER TABLE IF EXISTS weight_entries 
ADD COLUMN IF NOT EXISTS original_unit TEXT;

ALTER TABLE IF EXISTS weight_entries 
ADD COLUMN IF NOT EXISTS original_time TIME WITHOUT TIME ZONE;

-- Initialize original columns with current values for existing entries
UPDATE weight_entries 
SET 
  original_weight = weight,
  original_unit = unit,
  original_time = time
WHERE original_weight IS NULL;
