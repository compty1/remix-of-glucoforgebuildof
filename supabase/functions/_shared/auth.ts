/**
 * Shared authentication utilities for edge functions (Phase 2 Security)
 * Provides JWT verification and admin checks.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsHeaders, errorResponse } from "./cors.ts";

export interface AuthResult {
  userId: string;
  email?: string;
  role?: string;
}

/**
 * Verify JWT from Authorization header and return user claims.
 * Returns an error Response if auth fails, or AuthResult on success.
 */
export async function requireAuth(req: Request): Promise<AuthResult | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return errorResponse("Unauthorized: missing or invalid Authorization header", 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return errorResponse("Unauthorized: invalid or expired token", 401);
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
}

/**
 * Verify JWT and also check that the user has the 'admin' role.
 */
export async function requireAdmin(req: Request): Promise<AuthResult | Response> {
  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: adminCheck } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", authResult.userId)
    .eq("role", "admin")
    .maybeSingle();

  if (!adminCheck) {
    return errorResponse("Forbidden: admin access required", 403);
  }

  return authResult;
}

/**
 * Optional auth — returns AuthResult if valid token present, null if no token.
 * Only returns error Response for malformed tokens.
 */
export async function optionalAuth(req: Request): Promise<AuthResult | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
}

/**
 * Validate Content-Type is application/json for POST/PUT/PATCH requests.
 * Returns error Response if invalid, null if OK or not applicable.
 */
export function requireJsonContentType(req: Request): Response | null {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return errorResponse("Content-Type must be application/json", 415);
    }
  }
  return null;
}
