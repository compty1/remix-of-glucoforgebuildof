/**
 * Gap 32: Mentor Match Notification Edge Function
 * Sends notification when a mentor request is created or accepted.
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

    const { mentorId, menteeId, action } = await req.json();
    if (!mentorId || !menteeId || !action) {
      return errorResponse('mentorId, menteeId, and action are required');
    }
    // Caller must be one of the two parties (IDOR fix)
    if (auth.userId !== mentorId && auth.userId !== menteeId) {
      return errorResponse('Forbidden: not a party to this match', 403);
    }
    if (!['request', 'accepted', 'declined'].includes(action)) {
      return errorResponse('Invalid action');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Log the notification event
    const message = action === 'request'
      ? `New mentor request received from mentee ${menteeId.slice(0, 8)}`
      : `Mentor request ${action} by ${mentorId.slice(0, 8)}`;

    // Could integrate with email/push in future; for now log to audit
    await supabase.from('audit_trail').insert({
      user_id: mentorId,
      table_name: 'mentor_matches',
      record_id: `${mentorId}-${menteeId}`,
      action: 'INSERT',
      new_value: { action, mentorId, menteeId },
      reason: message,
    });

    return jsonResponse({ success: true, message });
  } catch (err) {
    return errorResponse(err.message || 'Internal error', 500);
  }
});
