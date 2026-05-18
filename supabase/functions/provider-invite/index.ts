/**
 * Gap 34: Provider Invite Edge Function
 * Handles provider-to-patient invitation and consent workflow.
 */
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { requireAuth } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;

    // Read body ONCE (previous code called req.json() twice — bug)
    const body = await req.json();
    const { providerId, patientEmail, action, linkId } = body ?? {};
    if (!action) return errorResponse('action is required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    if (action === 'invite') {
      if (!providerId) return errorResponse('providerId is required');
      if (!patientEmail) return errorResponse('patientEmail is required for invite');
      // Only the provider themself can send the invite (IDOR fix)
      if (auth.userId !== providerId) {
        return errorResponse('Forbidden: not authorized for this provider', 403);
      }

      // Check if provider exists
      const { data: provider } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', providerId)
        .maybeSingle();

      if (!provider) return errorResponse('Provider not found', 404);

      // Look up patient by email
      const { data: users } = await supabase.auth.admin.listUsers();
      const patient = users?.users?.find(u => u.email === patientEmail);

      if (!patient) {
        return jsonResponse({
          success: false,
          message: 'No account found with that email. Patient must register first.',
        });
      }

      // Create pending link
      const { error } = await supabase
        .from('provider_patient_links')
        .insert({
          provider_id: providerId,
          patient_id: patient.id,
          consent_status: 'pending',
        });

      if (error?.code === '23505') {
        return jsonResponse({ success: false, message: 'Invitation already exists' });
      }
      if (error) throw error;

      return jsonResponse({ success: true, message: 'Invitation sent' });
    }

    if (action === 'accept' || action === 'reject') {
      if (!linkId) return errorResponse('linkId is required');
      const status = action === 'accept' ? 'active' : 'rejected';

      // Only the invited patient may accept/reject (IDOR fix)
      const { data: link } = await supabase
        .from('provider_patient_links')
        .select('patient_id')
        .eq('id', linkId)
        .maybeSingle();
      if (!link) return errorResponse('Invitation not found', 404);
      if (link.patient_id !== auth.userId) {
        return errorResponse('Forbidden: not your invitation', 403);
      }

      await supabase
        .from('provider_patient_links')
        .update({ consent_status: status })
        .eq('id', linkId);

      return jsonResponse({ success: true, status });
    }

    return errorResponse('Invalid action. Use: invite, accept, reject');
  } catch (err) {
    return errorResponse(err.message || 'Internal error', 500);
  }
});
