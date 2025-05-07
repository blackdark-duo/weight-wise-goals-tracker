
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the current time
    const now = new Date().toISOString();
    
    // Find accounts scheduled for deletion whose deletion date has passed
    const { data: accountsToDelete, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('scheduled_for_deletion', true)
      .lt('deletion_date', now);
      
    if (fetchError) {
      throw fetchError;
    }
    
    const deletedCount = accountsToDelete?.length || 0;
    
    // Process each account scheduled for deletion
    for (const account of accountsToDelete || []) {
      console.log(`Deleting user account: ${account.id}`);
      
      // Delete the user from auth
      const { error: deleteError } = await supabase.auth.admin.deleteUser(account.id);
      
      if (deleteError) {
        console.error(`Error deleting user ${account.id}:`, deleteError);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Deleted ${deletedCount} accounts that were scheduled for deletion` 
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error processing account deletions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});
