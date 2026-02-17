import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return new Response(
          JSON.stringify({ error: "Webhook signature verification failed" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // For development/testing without webhook secret
      event = JSON.parse(body);
    }

    console.log("Received Stripe event:", event.type);

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
          console.error("Order not found for session:", session.id);
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

        if (updateError) {
          console.error("Failed to update order:", updateError);
        } else {
          console.log("Order updated successfully:", order.id);
        }

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Mark order as expired
        await supabase
          .from("shop_orders")
          .update({ status: "expired" })
          .eq("stripe_session_id", session.id);

        console.log("Order marked as expired for session:", session.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Mark order as failed
        await supabase
          .from("shop_orders")
          .update({ status: "failed" })
          .eq("stripe_payment_intent", paymentIntent.id);

        console.log("Order marked as failed for payment intent:", paymentIntent.id);
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
