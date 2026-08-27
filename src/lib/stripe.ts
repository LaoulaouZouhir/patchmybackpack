import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51U8ypQRsmDjseGFgkFfZrYdq5vLYAscLhgTFsjzvDSrX5MnsyaZne3YuIBJFANYDPoQ5Qj4RlyBDSlkRWiwQtxzP00X2HpPeIx';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

export interface CheckoutDepositParams {
  spotId: number;
  spotLabel: string;
  brandName: string;
  websiteUrl: string;
  logoUrl?: string;
  bidAmount: number;
  depositAmount: number;
  currency: 'EUR' | 'USD';
  bidderEmail: string;
  bidderTwitter?: string;
}

/**
 * Creates a Stripe Checkout Session for the 20% refundable deposit and redirects
 */
export async function redirectToStripeCheckout(params: CheckoutDepositParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
      body: {
        ...params,
        originUrl: window.location.origin,
      },
    });

    if (error || !data?.url) {
      throw new Error(error?.message || data?.error || 'Failed to initialize Stripe checkout');
    }

    // Redirect user to Stripe hosted checkout
    window.location.href = data.url;
    return { success: true };
  } catch (err: unknown) {
    console.error('Stripe redirect error:', err);
    const message = err instanceof Error ? err.message : 'Payment initialization failed';
    return { success: false, error: message };
  }
}
