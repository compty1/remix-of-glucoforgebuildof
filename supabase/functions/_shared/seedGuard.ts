/**
 * Wave 1 — Seed function guard.
 * Seed functions must be disabled in production unless explicitly allowed
 * via the SEED_ALLOWED env var. Also requires admin auth when allowed.
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