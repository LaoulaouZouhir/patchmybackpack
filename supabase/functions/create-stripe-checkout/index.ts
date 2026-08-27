import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@^14.19.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      spotId,
      spotLabel,
      brandName,
      websiteUrl,
      logoUrl,
      bidAmount,
      depositAmount,
      currency = "eur",
      bidderEmail,
      bidderTwitter,
      originUrl,
      datafast_visitor_id,
      datafast_session_id,
    } = await req.json();

    if (!spotId || !brandName || !websiteUrl || !bidderEmail || !depositAmount) {
      return new Response(
        JSON.stringify({ error: "Missing required bidding parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const host = originUrl || "http://localhost:3000";

    // Build Stripe session metadata including DataFast attribution cookies
    const sessionMetadata: Record<string, string> = {
      spotId: String(spotId),
      spotLabel: String(spotLabel),
      brandName: String(brandName),
      websiteUrl: String(websiteUrl),
      logoUrl: String(logoUrl || ""),
      bidAmount: String(bidAmount),
      depositAmount: String(depositAmount),
      bidderEmail: String(bidderEmail),
      bidderTwitter: String(bidderTwitter || ""),
    };

    if (datafast_visitor_id) {
      sessionMetadata.datafast_visitor_id = String(datafast_visitor_id);
    }
    if (datafast_session_id) {
      sessionMetadata.datafast_session_id = String(datafast_session_id);
    }

    // Create Stripe Checkout Session for 20% Refundable Deposit
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: bidderEmail,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Refundable Bidding Deposit: Spot #${spotId} (${spotLabel})`,
              description: `20% deposit for ${brandName}'s ${bidAmount}€ bid. 100% refunded automatically if outbid.`,
            },
            unit_amount: Math.round(depositAmount * 100), // in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${host}/?bid_success=true&spot_id=${spotId}&brand=${encodeURIComponent(brandName)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${host}/?bid_cancelled=true`,
      metadata: sessionMetadata,
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create checkout session" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
