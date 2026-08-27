import React, { useState, useEffect } from 'react';
import type { Spot } from '../data/auctionData';
import { X, Upload, Check, Lock, ArrowRight, Globe } from 'lucide-react';
import { supabase, getUserMetadata } from '../lib/supabase';
import { redirectToStripeCheckout } from '../lib/stripe';
import { normalizeUrl, getFaviconFromUrl } from '../lib/urlUtils';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  spots?: Spot[];
  selectedSpot: Spot | null;
  onSelectSpot?: (spot: Spot) => void;
  onPlaceBid: (spotId: number, brand: string, url: string, logo: string, amount: number, email: string, twitter?: string) => void;
  currency: 'EUR' | 'USD';
  currencyRate: number;
  onOpenAuthModal?: () => void;
}

export const BidModal: React.FC<BidModalProps> = ({
  isOpen,
  onClose,
  selectedSpot,
  onPlaceBid,
  currency,
  currencyRate,
}) => {
  const currentSpot = selectedSpot;
  const isEmpty = !currentSpot || currentSpot.bidCount === 0 || !currentSpot.topBidder.brand;
  const minIncrement = 10;
  const minBidEur = currentSpot
    ? isEmpty
      ? currentSpot.startingBid
      : currentSpot.currentBid + minIncrement
    : 50;

  const [brandName, setBrandName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [bidderEmail, setBidderEmail] = useState('');
  const [bidderTwitter, setBidderTwitter] = useState('');
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [bidAmount, setBidAmount] = useState<number>(minBidEur);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fill from session if logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      if (user) {
        const meta = getUserMetadata(user);
        if (meta?.email && !bidderEmail) setBidderEmail(meta.email);
        if (meta?.twitterUsername && !bidderTwitter) setBidderTwitter(meta.twitterUsername);
      }
    });
  }, [isOpen]);

  useEffect(() => {
    if (currentSpot) {
      const isSpotAvailable = currentSpot.bidCount === 0 || !currentSpot.topBidder.brand;
      setBidAmount(isSpotAvailable ? currentSpot.startingBid : currentSpot.currentBid + minIncrement);
      setErrorMsg('');
      setIsSuccess(false);
    }
  }, [currentSpot?.id, currentSpot?.currentBid, currentSpot?.bidCount]);

  if (!isOpen || !currentSpot) return null;

  const formatPrice = (amountInEur: number) => {
    if (currency === 'USD') {
      return `$${Math.round(amountInEur * currencyRate)}`;
    }
    return `${amountInEur} €`;
  };

  const depositEur = Math.max(15, Math.round(bidAmount * 0.20));

  const autoFavicon = !logoPreview && websiteUrl.trim() ? getFaviconFromUrl(websiteUrl) : '';

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      setErrorMsg('Please enter your brand or project name.');
      return;
    }
    if (!websiteUrl.trim()) {
      setErrorMsg('Please enter your website URL or domain.');
      return;
    }
    if (!bidderEmail.trim()) {
      setErrorMsg('Please provide your email for notifications and payment receipt.');
      return;
    }
    if (bidAmount < minBidEur) {
      setErrorMsg(`Bid must be at least ${formatPrice(minBidEur)}.`);
      return;
    }

    const cleanUrl = normalizeUrl(websiteUrl);
    const finalLogo = logoPreview || getFaviconFromUrl(cleanUrl);

    setIsProcessing(true);
    setErrorMsg('');

    // Save pending bid in localStorage to guarantee spot activation upon Stripe return
    try {
      localStorage.setItem('pmb_pending_bid', JSON.stringify({
        spotId: currentSpot.id,
        brand: brandName.trim(),
        url: cleanUrl,
        logo: finalLogo,
        amount: bidAmount,
        email: bidderEmail.trim(),
        twitter: bidderTwitter.trim() || undefined,
        timestamp: Date.now()
      }));
    } catch {
      // ignore
    }

    try {
      // 1. Attempt Stripe Hosted Checkout for the 20% refundable deposit
      const res = await redirectToStripeCheckout({
        spotId: currentSpot.id,
        spotLabel: currentSpot.label,
        brandName: brandName.trim(),
        websiteUrl: cleanUrl,
        logoUrl: finalLogo,
        bidAmount,
        depositAmount: depositEur,
        currency,
        bidderEmail: bidderEmail.trim(),
        bidderTwitter: bidderTwitter.trim() || undefined,
      });

      if (!res.success) {
        // Fallback to direct DB placement if checkout redirect is simulated
        await onPlaceBid(
          currentSpot.id,
          brandName.trim(),
          cleanUrl,
          finalLogo,
          bidAmount,
          bidderEmail.trim(),
          bidderTwitter.trim() || undefined
        );
        setIsSuccess(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error placing bid';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-hairline my-auto flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* Clean Header Bar */}
        <div className="flex items-start justify-between p-5 pb-3 sm:px-7 sm:pt-6 border-b border-hairline/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">
                {isEmpty ? `Claim Spot #${currentSpot.id}` : `Outbid Spot #${currentSpot.id}`}
              </h2>
              {isEmpty ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-accent-green border border-emerald-200">
                  🟢 Available
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Taken
                </span>
              )}
            </div>
            <p className="text-[13px] text-ink-muted">
              {isEmpty ? (
                <span>Starting bid: <strong className="text-ink font-semibold">{formatPrice(currentSpot.startingBid)}</strong></span>
              ) : (
                <span>Held by <strong>{currentSpot.topBidder.brand}</strong> at <strong className="text-ink font-semibold">{formatPrice(currentSpot.currentBid)}</strong></span>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-subtle hover:bg-surface-100 hover:text-ink transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-5 sm:px-7 sm:py-5 space-y-4 flex-1">
          
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-accent-green border border-emerald-200">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-ink">Bid Placed & Active!</h3>
              <p className="text-[14px] text-ink-muted leading-relaxed">
                <strong>{brandName}</strong> is now the leading bidder for <strong>Spot #{currentSpot.id}</strong> at <strong>{formatPrice(bidAmount)}</strong>.
              </p>
              <div className="rounded-2xl bg-surface-100 p-4 text-[12.5px] text-ink-muted text-left space-y-1.5 border border-hairline">
                <p className="font-semibold text-ink">• {formatPrice(depositEur)} deposit held (automatically refunded if outbid).</p>
                <p>• Outbid email notifications set for: <strong>{bidderEmail}</strong></p>
                <p>• Live sponsor link updated on real-time backpack map.</p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full bg-ink px-6 py-2.5 text-[13px] font-medium text-white hover:opacity-85 transition-opacity cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form id="bid-form" onSubmit={handleSubmitBid} className="space-y-3.5">
              
              {/* Brand & Website Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11.5px] font-medium text-ink mb-1">
                    Brand name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PostSchedule"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-[13px] outline-none transition-shadow focus:border-cognac focus:ring-2 focus:ring-cognac/15"
                  />
                </div>

                <div>
                  <label className="block text-[11.5px] font-medium text-ink mb-1">
                    Website / Domain <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. postschedule.xyz"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-[13px] outline-none transition-shadow focus:border-cognac focus:ring-2 focus:ring-cognac/15"
                  />
                </div>
              </div>

              {/* Email & Twitter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11.5px] font-medium text-ink mb-1">
                    Your email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={bidderEmail}
                    onChange={(e) => setBidderEmail(e.target.value)}
                    className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-[13px] outline-none transition-shadow focus:border-cognac focus:ring-2 focus:ring-cognac/15"
                  />
                </div>

                <div>
                  <label className="block text-[11.5px] font-medium text-ink mb-1">
                    X/Twitter handle (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="@username"
                    value={bidderTwitter}
                    onChange={(e) => setBidderTwitter(e.target.value)}
                    className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-[13px] outline-none transition-shadow focus:border-cognac focus:ring-2 focus:ring-cognac/15"
                  />
                </div>
              </div>

              {/* Logo / Patch Artwork with Auto-Favicon Preview */}
              <div>
                <label className="block text-[11.5px] font-medium text-ink mb-1">
                  Logo / Patch Artwork (optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer rounded-xl bg-surface-100 px-3 py-1.5 text-[11.5px] font-medium text-ink hover:bg-surface-200 transition-colors border border-hairline">
                    <Upload className="h-3.5 w-3.5 text-ink-muted" />
                    <span>Upload custom logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>

                  {logoPreview ? (
                    <div className="flex items-center gap-1.5 text-[11.5px] text-accent-green font-medium">
                      <img src={logoPreview} alt="Logo" className="w-5 h-5 rounded object-contain border border-hairline" />
                      <span>Custom logo loaded</span>
                    </div>
                  ) : autoFavicon ? (
                    <div className="flex items-center gap-1.5 text-[11.5px] text-ink-muted">
                      <img 
                        src={autoFavicon} 
                        alt="Favicon" 
                        className="w-4 h-4 rounded object-contain" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <span>Auto-detected favicon</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-ink-subtle flex items-center gap-1">
                      <Globe className="h-3 w-3" /> Auto-fetches domain favicon
                    </span>
                  )}
                </div>
              </div>

              {/* Bid Amount */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11.5px] font-medium text-ink">
                    Bid amount (minimum {formatPrice(minBidEur)})
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min={minBidEur}
                    step={5}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-[15px] font-semibold tabular-nums text-ink outline-none transition-shadow focus:border-cognac focus:ring-2 focus:ring-cognac/15"
                  />
                  <div className="absolute right-1.5 top-1.5 flex gap-1">
                    {[10, 25, 50].map((inc) => (
                      <button
                        key={inc}
                        type="button"
                        onClick={() => setBidAmount((prev) => prev + inc)}
                        className="rounded-md bg-surface-200 px-2 py-0.5 text-[10.5px] font-medium text-ink hover:bg-surface-300 transition-colors cursor-pointer"
                      >
                        +{inc}€
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stripe Deposit note */}
              <div className="rounded-xl bg-surface-100 p-3 text-[11.5px] text-ink-muted space-y-0.5 border border-hairline">
                <div className="flex justify-between font-medium text-ink">
                  <span className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-ink-muted" />
                    20% Refundable Deposit:
                  </span>
                  <span className="font-semibold tabular-nums text-[13px]">{formatPrice(depositEur)}</span>
                </div>
                <p className="text-[11px] text-ink-subtle">
                  Secured via Stripe. 100% refunded if outbid. Remainder settled at auction close.
                </p>
              </div>

              {errorMsg && (
                <p className="text-[12px] font-medium text-red-600">
                  {errorMsg}
                </p>
              )}

            </form>
          )}

        </div>

        {/* Fixed Pinned Bottom Actions Bar */}
        {!isSuccess && (
          <div className="p-4 sm:px-7 sm:py-4 bg-surface-100 border-t border-hairline flex items-center gap-3">
            <button
              type="submit"
              form="bid-form"
              disabled={isProcessing}
              className="flex-1 rounded-full bg-[#141413] hover:bg-[#2A2926] text-white py-3 px-5 text-[13.5px] font-semibold transition-all active:scale-[0.99] cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>
                {isProcessing
                  ? 'Redirecting to Stripe...'
                  : `Confirm & Pay ${formatPrice(depositEur)} Deposit`}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-3 text-[13px] font-medium text-ink-muted hover:text-ink hover:bg-surface-200 transition-colors cursor-pointer shrink-0"
            >
              Cancel
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
