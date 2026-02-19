import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, handleCors, errorResponse, jsonResponse } from "../_shared/cors.ts";

serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) {
      throw new Error("Stripe is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    // Verify webhook signature if secret is configured (Item 1911)
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (_err) {
        return errorResponse("Webhook signature verification failed", 400);
      }
    } else {
      // No webhook secret — accept for development only
      event = JSON.parse(body);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Update order status
        const { data: order, error: findError } = await supabase
          .from("shop_orders")
          .select("*")
          .eq("stripe_session_id", session.id)
          .maybeSingle();

        if (findError || !order) {
          break;
        }

        // Update order with payment info and shipping address
        const updateData: Record<string, unknown> = {
          status: "paid",
          stripe_payment_intent: session.payment_intent as string,
          updated_at: new Date().toISOString(),
        };

        // Add shipping info if available
        if (session.shipping_details?.address) {
          updateData.shipping_info = {
            name: session.shipping_details.name,
            address: session.shipping_details.address,
            paid_at: new Date().toISOString(),
          };
        }

        const { error: updateError } = await supabase
          .from("shop_orders")
          .update(updateData)
          .eq("id", order.id);

        // Update error is non-critical — order will still be marked paid by Stripe

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Mark order as expired
        await supabase
          .from("shop_orders")
          .update({ status: "expired" })
          .eq("stripe_session_id", session.id);

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        await supabase
          .from("shop_orders")
          .update({ status: "failed" })
          .eq("stripe_payment_intent", paymentIntent.id);

        break;
      }

      default:
        // Unhandled event type — no action needed
    }

    return jsonResponse({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
});
