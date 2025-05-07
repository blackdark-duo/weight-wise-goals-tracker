
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get current timestamp
    const now = new Date();
    
    // Find accounts scheduled for deletion that are past their deletion date
    const { data: accountsToDelete, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('scheduled_for_deletion', true)
      .lt('deletion_date', now.toISOString());
    
    if (fetchError) {
      throw fetchError;
    }

    // If no accounts to delete, return
    if (!accountsToDelete || accountsToDelete.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No accounts to delete at this time",
          processed: 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Found ${accountsToDelete.length} accounts to delete`);

    // Process deletions one by one
    const deletionResults = [];
    let successCount = 0;
    let failureCount = 0;
    
    for (const account of accountsToDelete) {
      try {
        // Delete the auth user - this will cascade to delete their profile
        const { error: deleteError } = await supabase.auth.admin.deleteUser(
          account.id
        );
        
        if (deleteError) {
          console.error(`Error deleting user ${account.id}:`, deleteError);
          failureCount++;
          deletionResults.push({
            user_id: account.id,
            success: false,
            error: deleteError.message
          });
        } else {
          successCount++;
          deletionResults.push({
            user_id: account.id,
            success: true
          });
          console.log(`Successfully deleted user ${account.id}`);
        }
      } catch (err) {
        console.error(`Error processing deletion for ${account.id}:`, err);
        failureCount++;
        deletionResults.push({
          user_id: account.id,
          success: false,
          error: err.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${successCount + failureCount} accounts. ${successCount} deleted successfully, ${failureCount} failed.`,
        results: deletionResults
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing account deletions:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
