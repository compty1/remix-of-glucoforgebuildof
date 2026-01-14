import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schemas
const resetPasswordSchema = z.object({
  action: z.literal('reset_password'),
  userData: z.object({
    email: z.string().email()
  })
});

const deactivateUserSchema = z.object({
  action: z.literal('deactivate_user'),
  userId: z.string().uuid()
});

const updateRoleSchema = z.object({
  action: z.literal('update_role'),
  userId: z.string().uuid(),
  userData: z.object({
    role: z.enum(['admin', 'moderator', 'user'])
  })
});

const inviteUserSchema = z.object({
  action: z.literal('invite_user'),
  userData: z.object({
    email: z.string().email(),
    display_name: z.string().optional()
  })
});

const adminActionSchema = z.discriminatedUnion('action', [
  resetPasswordSchema,
  deactivateUserSchema,
  updateRoleSchema,
  inviteUserSchema
]);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Check if user is admin
    const { data: adminCheck } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!adminCheck) {
      throw new Error("Unauthorized: Admin access required");
    }

    if (req.method === 'GET') {
      // Fetch all users from auth.users with profiles
      const { data: authUsers, error: authError } = await supabaseClient.auth.admin.listUsers();
      if (authError) throw authError;

      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabaseClient
        .from('profiles')
        .select('*');
      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabaseClient
        .from('user_roles')
        .select('*');
      if (rolesError) throw rolesError;

      // Combine the data
      const users = authUsers.users.map(authUser => {
        const profile = profiles?.find(p => p.user_id === authUser.id);
        const role = userRoles?.find(r => r.user_id === authUser.id);
        
        return {
          id: authUser.id,
          email: authUser.email,
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at,
          display_name: profile?.display_name || authUser.user_metadata?.display_name,
          role: role?.role || 'user',
          email_confirmed_at: authUser.email_confirmed_at,
          phone: authUser.phone,
          app_metadata: authUser.app_metadata,
          user_metadata: authUser.user_metadata
        };
      });

      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (req.method === 'POST') {
      const requestBody = await req.json();
      const validation = adminActionSchema.safeParse(requestBody);
      
      if (!validation.success) {
        return new Response(
          JSON.stringify({ error: validation.error.issues[0].message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { action, userId, userData: updateData } = requestBody;

      switch (action) {
        case 'reset_password':
          // Send password reset email
          const { error: resetError } = await supabaseClient.auth.admin.generateLink({
            type: 'recovery',
            email: updateData.email,
          });
          if (resetError) throw resetError;
          
          return new Response(JSON.stringify({ message: 'Password reset email sent' }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });

        case 'deactivate_user':
          // Update user status (disable them)
          const { error: deactivateError } = await supabaseClient.auth.admin.updateUserById(
            userId,
            { user_metadata: { ...updateData.user_metadata, disabled: true } }
          );
          if (deactivateError) throw deactivateError;
          
          return new Response(JSON.stringify({ message: 'User deactivated' }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });

        case 'update_role':
          // Update user role
          const { error: roleError } = await supabaseClient
            .from('user_roles')
            .upsert({ user_id: userId, role: updateData.role }, { onConflict: 'user_id' });
          if (roleError) throw roleError;
          
          return new Response(JSON.stringify({ message: 'User role updated' }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });

        case 'invite_user':
          // Create invitation
          const { error: inviteError } = await supabaseClient.auth.admin.inviteUserByEmail(
            updateData.email,
            {
              data: { display_name: updateData.display_name },
              redirectTo: `${req.headers.get('origin')}/auth`
            }
          );
          if (inviteError) throw inviteError;
          
          return new Response(JSON.stringify({ message: 'User invited successfully' }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });

        default:
          throw new Error('Invalid action');
      }
    }

    throw new Error('Method not allowed');
  } catch (error) {
    console.error('Admin users error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});