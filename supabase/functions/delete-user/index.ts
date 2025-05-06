
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

interface DeleteUserRequestBody {
  userIdToDelete: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the JWT token from the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create authenticated and admin clients
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    const supabaseAuthClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
    })

    // Verify the JWT and get the user
    const { data: { user: requestingUser }, error: authError } = await supabaseAuthClient.auth.getUser(token)
    if (authError || !requestingUser) {
      console.error('Authentication error:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if the requesting user is an admin
    const { data: adminCheck, error: adminCheckError } = await supabaseClient
      .from('profiles')
      .select('is_admin')
      .eq('id', requestingUser.id)
      .single()

    if (adminCheckError) {
      console.error('Admin check error:', adminCheckError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify admin status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!adminCheck?.is_admin) {
      // Log the unauthorized deletion attempt
      await supabaseClient.from('admin_logs').insert({
        action: 'unauthorized_deletion_attempt',
        admin_id: requestingUser.id,
        details: 'Non-admin user attempted to delete a user account',
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      })

      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the request to get the user ID to delete
    const { userIdToDelete } = await req.json() as DeleteUserRequestBody

    if (!userIdToDelete) {
      return new Response(
        JSON.stringify({ error: 'Missing user ID to delete' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log the deletion attempt
    await supabaseClient.from('admin_logs').insert({
      action: 'user_deletion',
      admin_id: requestingUser.id,
      target_user_id: userIdToDelete,
      details: 'Admin initiated user deletion',
      ip_address: req.headers.get('x-forwarded-for') || 'unknown'
    })

    // Delete all user data in proper order
    
    // 1. Delete weight entries
    const { error: weightError } = await supabaseClient
      .from('weight_entries')
      .delete()
      .eq('user_id', userIdToDelete)
    
    if (weightError) {
      console.error('Error deleting weight entries:', weightError)
    }
    
    // 2. Delete goals
    const { error: goalsError } = await supabaseClient
      .from('goals')
      .delete()
      .eq('user_id', userIdToDelete)
    
    if (goalsError) {
      console.error('Error deleting goals:', goalsError)
    }
    
    // 3. Delete webhook logs
    const { error: logsError } = await supabaseClient
      .from('webhook_logs')
      .delete()
      .eq('user_id', userIdToDelete)
    
    if (logsError) {
      console.error('Error deleting webhook logs:', logsError)
    }
    
    // 4. Delete profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .delete()
      .eq('id', userIdToDelete)
    
    if (profileError) {
      console.error('Error deleting profile:', profileError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete user profile', details: profileError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // 5. Delete auth user using admin API
    const { error: authDeleteError } = await supabaseClient.auth.admin.deleteUser(userIdToDelete)
    
    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete user authentication record', details: authDeleteError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User successfully deleted',
        deletedUserId: userIdToDelete
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
