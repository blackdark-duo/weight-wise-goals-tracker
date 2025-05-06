
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the auth context of the requesting user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { 
          headers: { Authorization: req.headers.get('Authorization')! } 
        } 
      }
    );

    // Get the requesting user
    const {
      data: { user: callingUser },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !callingUser) {
      throw new Error('Authentication required');
    }

    // Check if the calling user is an admin
    const { data: callerProfile, error: callerProfileError } = await supabaseClient
      .from('profiles')
      .select('is_admin')
      .eq('id', callingUser.id)
      .single();

    if (callerProfileError) {
      throw new Error('Error checking admin status');
    }

    if (!callerProfile?.is_admin) {
      throw new Error('Admin privileges required');
    }

    // Get the target user ID from the request
    const { userId } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Log the deletion attempt
    await supabaseClient.from('admin_logs').insert({
      admin_id: callingUser.id,
      action: 'user_deletion_attempt',
      target_user_id: userId,
      details: {
        timestamp: new Date().toISOString(),
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      }
    });

    // Delete the user using the admin API
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(
      userId
    );

    if (deleteError) {
      throw new Error(`Error deleting user: ${deleteError.message}`);
    }

    // Log successful deletion
    await supabaseClient.from('admin_logs').insert({
      admin_id: callingUser.id,
      action: 'user_deletion_success',
      target_user_id: userId,
      details: {
        timestamp: new Date().toISOString(),
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      }
    });

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User deleted successfully' 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});
