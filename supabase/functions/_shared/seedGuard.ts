/**
 * Wave 1 — Seed function guard.
 * Seed functions are destructive bulk-write helpers. They must be DISABLED
 * in production unless an operator explicitly opts in.
 *
 * SEED_ALLOWED env var:
 *   - Unset / "false" / "0" / "no"  → 403, function refuses to run (DEFAULT, recommended for prod)
 *   - "true" / "1" / "yes"          → function runs, BUT still requires an admin JWT
 *
 * Where to set it:
 *   Lovable Cloud → Backend → Edge Functions → Secrets → add `SEED_ALLOWED`.
 *   Leave unset in production. Set to "true" temporarily in staging/dev when
 *   you need to (re)seed catalog data, then unset again.
 *
 * Behavior when enabled:
 *   - Caller must present a valid Supabase JWT belonging to a user with the
 *     `admin` role (enforced by requireAdmin → user_roles table).
 *   - Non-admin or anonymous callers get 401/403.
 */
import { corsHeaders } from "./cors.ts";
import { requireAdmin } from "./auth.ts";

export async function guardSeedFunction(req: Request): Promise<Response | null> {
  const allowed = (Deno.env.get("SEED_ALLOWED") ?? "").toLowerCase();
  if (allowed !== "true" && allowed !== "1" && allowed !== "yes") {
    return new Response(
      JSON.stringify({
        error: "Seed functions are disabled. Set SEED_ALLOWED=true to enable.",
      }),
      {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;
  return null;
}

/** Wrap any external fetch with a 25s abort timeout (Wave 1). */
export function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 25_000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const signal = init.signal
    ? anySignal([init.signal, controller.signal])
    : controller.signal;
  return fetch(input, { ...init, signal }).finally(() => clearTimeout(timer));
}

function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const s of signals) {
    if (s.aborted) {
      controller.abort();
      break;
    }
    s.addEventListener("abort", () => controller.abort(), { once: true });
  }
  return controller.signal;
}