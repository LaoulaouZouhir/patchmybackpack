import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@^14.19.0";
import { createClient } from "npm:@supabase/supabase-js@^2.49.1";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("stripe-signature");

  try {
    const body = await req.text();
    let event: Stripe.Event;

    // Verify webhook signature if secret configured, otherwise parse body
    if (endpointSecret && signature) {
      event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const meta = session.metadata;

      if (meta && meta.spotId && meta.brandName && meta.bidAmount) {
        console.log(`[Stripe Webhook] Processing successful bid for Spot #${meta.spotId} by ${meta.brandName}`);

        const { data, error } = await supabase.rpc("place_bid", {
          p_spot_id: Number(meta.spotId),
          p_brand_name: meta.brandName,
          p_website_url: meta.websiteUrl || "",
          p_logo_url: meta.logoUrl || "",
          p_amount: Number(meta.bidAmount),
          p_deposit_amount: Number(meta.depositAmount || 15),
          p_bidder_email: meta.bidderEmail || session.customer_email || null,
          p_bidder_twitter: meta.bidderTwitter || null,
        });

        if (error) {
          console.error("[Stripe Webhook] Error calling place_bid RPC:", error);
          return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        console.log("[Stripe Webhook] Bid successfully recorded in Supabase:", data);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error(`[Stripe Webhook Error]: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
