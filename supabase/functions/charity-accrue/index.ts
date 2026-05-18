/**
 * Gap 33: Charity Point Accrual Edge Function
 * Awards charity points based on user engagement streaks.
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

    const { streakDays, reason } = await req.json();
    const userId = auth.userId; // Trust auth, not client-provided id (IDOR fix)
    if (typeof streakDays !== 'number' || streakDays < 0 || streakDays > 10000) {
      return errorResponse('streakDays must be a non-negative number');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Calculate points based on streak length
    let points = 0;
    if (streakDays >= 30) points = 50;
    else if (streakDays >= 14) points = 20;
    else if (streakDays >= 7) points = 10;
    else if (streakDays >= 3) points = 5;

    if (points === 0) {
      return jsonResponse({ awarded: false, reason: 'Streak too short for award' });
    }

    // Upsert charity points
    const { data: existing } = await supabase
      .from('charity_points')
      .select('total_points')
      .eq('user_id', userId)
      .maybeSingle();

    const newTotal = (existing?.total_points || 0) + points;

    await supabase
      .from('charity_points')
      .upsert({
        user_id: userId,
        total_points: newTotal,
        last_accrual_reason: reason || `${streakDays}-day streak`,
        last_accrual_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    return jsonResponse({ awarded: true, points, newTotal });
  } catch (err) {
    return errorResponse(err.message || 'Internal error', 500);
  }
});
