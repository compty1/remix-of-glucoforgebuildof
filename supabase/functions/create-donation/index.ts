import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsHeaders, handleCors, errorResponse, jsonResponse, validateBodySize } from "../_shared/cors.ts";

serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  // Initialize Supabase client
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Validate body size (Item 2085)
    const sizeErr = await validateBodySize(req);
    if (sizeErr) return sizeErr;

    const { amount, isRecurring, recurringFrequency } = await req.json();
    
    // Strict input validation
    if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
      return errorResponse("Invalid donation amount: must be a valid number");
    }
    
    if (amount < 5) {
      return errorResponse("Minimum donation amount is $5");
    }
    
    if (amount > 100000) {
      return errorResponse("Maximum donation amount is $100,000");
    }

    // Get user info if authenticated
    let userEmail = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        userEmail = data.user?.email;
      } catch (error) {
        console.log("No authenticated user, proceeding as guest");
      }
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe is not configured. Please add STRIPE_SECRET_KEY.");
    }
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Check for existing customer if user is authenticated
    let customerId;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    // Determine checkout mode based on recurring flag (Item 1801-1805)
    const mode = isRecurring ? 'subscription' : 'payment';

    // Build price data
    const priceData: Record<string, unknown> = {
      currency: 'usd',
      product_data: {
        name: isRecurring ? 'Recurring Donation to GlucoForge' : 'Donation to GlucoForge',
        description: 'Support Type 1 Diabetes research and development',
      },
      unit_amount: Math.round(amount * 100),
    };

    // Add recurring interval for subscriptions
    if (isRecurring) {
      const interval = recurringFrequency === 'yearly' ? 'year' : 'month';
      (priceData as any).recurring = { interval };
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price_data: priceData as any,
          quantity: 1,
        },
      ],
      mode,
      success_url: `${req.headers.get('origin')}/donation-result?donation=success`,
      cancel_url: `${req.headers.get('origin')}/donation-result?donation=cancelled`,
      metadata: {
        donation: 'true',
        amount: amount.toString(),
        recurring: isRecurring ? 'true' : 'false',
        frequency: recurringFrequency || 'one-time',
      },
    });

    return jsonResponse({ url: session.url, sessionId: session.id });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(errorMessage, 500);
  }
});