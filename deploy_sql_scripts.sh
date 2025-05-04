
#!/bin/bash

# This script will execute the SQL files against your Supabase project.
# You need to have the Supabase CLI installed and be authenticated.

# Execute the pricing_clicks table creation script
supabase db execute --file supabase/functions/create_pricing_clicks.sql

# Execute the pricing_clicks function creation script
supabase db execute --file supabase/functions/record_pricing_click_function.sql

echo "SQL scripts executed successfully."
