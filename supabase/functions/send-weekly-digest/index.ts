import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, validateBodySize, errorResponse } from "../_shared/cors.ts";
import { requireAdmin, requireJsonContentType } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof Response) return authResult;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendKey);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get active subscribers
    const { data: subscribers, error: subError } = await supabase
      .from("email_subscriptions")
      .select("*")
      .eq("is_active", true)
      .eq("subscription_type", "weekly_digest");

    if (subError) throw subError;
    if (!subscribers?.length) {
      return new Response(JSON.stringify({ message: "No active subscribers" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get papers from last 7 days with TLDR
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data: papers, error: papersError } = await supabase
      .from("medical_research_papers")
      .select("*")
      .gte("created_at", weekAgo.toISOString())
      .not("tldr_summary", "is", null)
      .order("influential_citation_count", { ascending: false })
      .limit(10);

    if (papersError) throw papersError;

    // Generate email HTML
    const generateEmailHtml = (papers: any[]) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0B1F3A, #6A4C93); color: white; padding: 30px; border-radius: 8px; text-align: center; }
          .paper { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 16px 0; }
          .tldr { background: #f5f0ff; border-left: 4px solid #6A4C93; padding: 12px; margin: 12px 0; }
          .metrics { color: #666; font-size: 14px; }
          .footer { text-align: center; color: #888; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔬 GlucoForge Weekly Research Digest</h1>
          <p>Top T1D research from the past week</p>
        </div>
        
        <p>Here are this week's most important diabetes research papers with AI-generated summaries:</p>
        
        ${papers.map((p, i) => `
          <div class="paper">
            <h3>${i + 1}. ${p.title}</h3>
            <div class="tldr">
              <strong>✨ AI Summary:</strong> ${p.tldr_summary}
            </div>
            <div class="metrics">
              📊 ${p.citation_count || 0} citations • ⭐ ${p.influential_citation_count || 0} influential
              ${p.doi ? `• <a href="https://doi.org/${p.doi}">Read Paper</a>` : ''}
            </div>
          </div>
        `).join('')}
        
        <div class="footer">
          <p>You're receiving this because you subscribed to GlucoForge Weekly Digest.</p>
        </div>
      </body>
      </html>
    `;

    let sentCount = 0;
    const emailHtml = generateEmailHtml(papers || []);

    for (const subscriber of subscribers) {
      try {
        await resend.emails.send({
          from: "GlucoForge <onboarding@resend.dev>",
          to: [subscriber.email],
          subject: `🔬 Weekly Research Digest - ${new Date().toLocaleDateString()}`,
          html: emailHtml,
        });
        
        await supabase
          .from("email_subscriptions")
          .update({ last_sent_at: new Date().toISOString() })
          .eq("id", subscriber.id);
        
        sentCount++;
      } catch (e) {
        console.error(`Failed to send to ${subscriber.email}:`, e);
      }
    }

    // Log the digest
    await supabase.from("email_digest_logs").insert({
      recipient_count: sentCount,
      papers_included: papers?.length || 0,
      status: "sent",
    });

    return new Response(JSON.stringify({ success: true, sentCount, papersIncluded: papers?.length || 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
