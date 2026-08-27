import { useState, useEffect } from 'react';
import { initialSpots, initialCampaignGoal } from './data/auctionData';
import type { Spot, CampaignGoal } from './data/auctionData';
import { fetchSpotsFromDb, placeBidInDb, subscribeToSpotsRealtime } from './lib/supabase';
import { getFaviconFromUrl } from './lib/urlUtils';
import { Navbar } from './components/Navbar';
import { BackpackVisualizer } from './components/BackpackVisualizer';
import { AuctionTable } from './components/AuctionTable';
import { ProofOfTravel } from './components/ProofOfTravel';
import { LeatherPatchesPreview } from './components/LeatherPatchesPreview';
import { ExposureComparison } from './components/ExposureComparison';
import { CraftsmanshipSpecs } from './components/CraftsmanshipSpecs';
import { HowItWorks } from './components/HowItWorks';
import { TravelRoutes } from './components/TravelRoutes';
import { FAQ } from './components/FAQ';
import { Waitlist } from './components/Waitlist';
import { Footer } from './components/Footer';
import { BidModal } from './components/BidModal';
import { AuthModal } from './components/AuthModal';
import { LiveAnalytics } from './components/LiveAnalytics';

const STORAGE_KEY = 'buymybackpack_calibrated_spots';

export function App() {
  const [currency, setCurrency] = useState<'EUR' | 'USD'>('EUR');
  
  // Load saved calibrated spots or initial fallback
  const [spots, setSpots] = useState<Spot[]>(initialSpots);
  const [campaign, setCampaign] = useState<CampaignGoal>(initialCampaignGoal);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(initialSpots[0]);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBackpackHighlighted, setIsBackpackHighlighted] = useState(false);

  const handleScrollToBackpack = () => {
    const spotsElement = document.getElementById('spots');
    if (spotsElement) {
      spotsElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setIsBackpackHighlighted(true);
    setTimeout(() => {
      setIsBackpackHighlighted(false);
    }, 2200);
  };

  // Time remaining countdown
  const [timeLeft, setTimeLeft] = useState({ days: 11, hours: 14, mins: 32, secs: 40 });

  // 1. Fetch initial spots from Supabase + Subscribe to Realtime updates
  useEffect(() => {
    async function loadLiveSpots() {
      try {
        const liveSpots = await fetchSpotsFromDb();
        if (liveSpots && liveSpots.length > 0) {
          setSpots(liveSpots);
          setSelectedSpot(liveSpots[0]);
          const liveTotal = liveSpots.reduce((sum, s) => s.bidCount > 0 ? sum + s.currentBid : sum, 0);
          setCampaign((prev) => ({ ...prev, totalRaised: liveTotal }));
        }
      } catch (err) {
        console.warn('Using local fallback spots data:', err);
      }
    }

    loadLiveSpots();

    // Check if returning from successful Stripe Checkout
    const params = new URLSearchParams(window.location.search);
    if (params.get('bid_success') === 'true') {
      // 1. Trigger celebratory confetti
      import('canvas-confetti').then((confettiModule) => {
        const confetti = confettiModule.default;
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.55 },
        });
      });

      // 2. Finalize pending bid into database and state
      try {
        const pendingRaw = localStorage.getItem('pmb_pending_bid');
        if (pendingRaw) {
          const pending = JSON.parse(pendingRaw);
          localStorage.removeItem('pmb_pending_bid');
          const finalLogo = pending.logo || getFaviconFromUrl(pending.url);
          handlePlaceBid(
            pending.spotId,
            pending.brand,
            pending.url,
            finalLogo,
            pending.amount,
            pending.email,
            pending.twitter
          );
        }
      } catch (e) {
        console.error('Error activating pending bid:', e);
      }

      // Clean query string from browser bar
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Realtime subscription for instant updates across visitors
    const unsubscribe = subscribeToSpotsRealtime((updatedSpot) => {
      setSpots((prevSpots) => {
        const next = prevSpots.map((s) => (s.id === updatedSpot.id ? updatedSpot : s));
        const liveTotal = next.reduce((sum, s) => s.bidCount > 0 ? sum + s.currentBid : sum, 0);
        setCampaign((prev) => ({ ...prev, totalRaised: liveTotal }));
        return next;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatPrice = (amountInEur: number) => {
    if (currency === 'USD') {
      return `$${Math.round(amountInEur * campaign.currencyRate)}`;
    }
    return `${amountInEur} €`;
  };

  const handleUpdateSpots = (updatedSpots: Spot[]) => {
    setSpots(updatedSpots);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSpots));
  };

  const handleResetSpots = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSpots(initialSpots);
    setSelectedSpot(initialSpots[0]);
  };

  const handlePlaceBid = async (
    spotId: number,
    brand: string,
    url: string,
    logo: string,
    amount: number,
    email: string,
    twitter?: string
  ) => {
    const depositAmount = Math.max(15, Math.round(amount * 0.20));

    // 1. Optimistic UI update
    setSpots((prevSpots) => {
      const next = prevSpots.map((spot) => {
        if (spot.id === spotId) {
          return {
            ...spot,
            currentBid: amount,
            bidCount: spot.bidCount + 1,
            topBidder: {
              brand,
              url,
              logo: logo || spot.topBidder.logo,
              twitter: twitter || spot.topBidder.twitter,
            },
          };
        }
        return spot;
      });
      const newTotal = next.reduce((acc, curr) => curr.bidCount > 0 ? acc + curr.currentBid : acc, 0);
      setCampaign((prev) => ({ ...prev, totalRaised: newTotal }));
      return next;
    });

    // 2. Persist to Supabase Database
    try {
      await placeBidInDb({
        spotId,
        brandName: brand,
        websiteUrl: url,
        logoUrl: logo,
        amount,
        depositAmount,
        bidderEmail: email,
        bidderTwitter: twitter,
      });
    } catch (err) {
      console.error('Failed to submit bid to Supabase:', err);
    }
  };

  const percentageFunded = Math.round((campaign.totalRaised / campaign.targetAmount) * 100);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      
      {/* Sticky Top Nav */}
      <Navbar
        currency={currency}
        setCurrency={setCurrency}
        onGetSpot={handleScrollToBackpack}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Hero Section */}
      <header className="mx-auto max-w-5xl px-4 sm:px-6 pt-2 sm:pt-3 pb-4 text-center">
        
        {/* Live Auction Spots Taken Pill */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-[11px] sm:text-[11.5px] font-medium text-emerald-800 border border-emerald-200/80 shadow-2xs mb-1.5 sm:mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live auction — {spots.filter((s) => s.bidCount > 0).length} of {spots.length} patch spots taken</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold leading-tight tracking-[-0.03em] text-ink">
          Your brand, on my Backpack.
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-1 max-w-[55ch] text-[13px] sm:text-[14.5px] leading-snug text-ink-muted">
          Your logo travels with me on a founder's best friend: the Nomad Leather Backpack.
        </p>

        {/* Funding Progress Widget */}
        <div className="mx-auto mt-1.5 sm:mt-2 max-w-sm px-2">
          
          {/* Metric Stats Header */}
          <div className="flex items-baseline justify-between px-1 mb-1">
            <span className="text-base sm:text-lg font-bold tabular-nums text-emerald-600">
              {formatPrice(campaign.totalRaised)}{' '}
              <span className="text-[11.5px] font-normal text-ink-muted">raised</span>
            </span>
            <span className="text-[11px] sm:text-[12px] font-medium text-ink-muted">
              goal {formatPrice(campaign.targetAmount)} ({percentageFunded}%)
            </span>
          </div>

          {/* High-Contrast Progress Bar */}
          <div
            role="progressbar"
            aria-valuenow={percentageFunded}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2 w-full overflow-hidden rounded-full bg-surface-200 border border-hairline shadow-inner p-0.5"
          >
            <div
              className="h-full rounded-full bg-emerald-500 shadow-sm transition-all duration-700"
              style={{ width: `${Math.min(100, percentageFunded)}%` }}
            ></div>
          </div>

          <p className="mt-0.5 text-[10.5px] sm:text-[11.5px] text-ink-muted">
            Auction ends in {timeLeft.days}d {timeLeft.hours}h {timeLeft.mins}m · outbid any spot before time runs out
          </p>
        </div>

        {/* Interactive Backpack Hotspots Canvas */}
        <div className="mt-1 sm:mt-1.5">
          <BackpackVisualizer
            spots={spots}
            selectedSpotId={selectedSpot?.id || null}
            onSelectSpot={(spot) => setSelectedSpot(spot)}
            onBidSpot={(spot) => {
              setSelectedSpot(spot);
              setIsBidModalOpen(true);
            }}
            onUpdateSpots={handleUpdateSpots}
            onResetSpots={handleResetSpots}
            currency={currency}
            currencyRate={campaign.currencyRate}
            isHighlighted={isBackpackHighlighted}
          />
        </div>

        {/* Bottom Hero Statement */}
        <div className="mt-14 space-y-2">
          <p className="mx-auto max-w-[70ch] text-[15px] sm:text-[17px] leading-relaxed text-ink">
            I am funding my nomad travels by putting startup patches on my leather backpack.
          </p>
          <p className="mx-auto max-w-[70ch] text-[14px] sm:text-[15px] leading-relaxed text-ink-muted">
            Airports, subways, coworking spaces, and tech conferences. Put your brand in front of founders and builders everywhere I go.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleScrollToBackpack}
            className="rounded-full bg-ink hover:bg-neutral-800 px-7 py-3 text-[14px] font-semibold text-white transition-all cursor-pointer shadow-md active:scale-[0.99]"
          >
            Get a spot
          </button>
          <a
            href="#how-it-works"
            className="text-[14px] font-semibold text-ink-muted hover:text-ink transition-colors inline-flex items-center gap-1"
          >
            How it works &rsaquo;
          </a>
        </div>

      </header>

      {/* Live Auction Table Leaderboard */}
      <AuctionTable
        spots={spots}
        onBidSpot={(spot) => {
          setSelectedSpot(spot);
          setIsBidModalOpen(true);
        }}
        currency={currency}
        currencyRate={campaign.currencyRate}
      />

      {/* Proof of Travel / It Never Leaves My Shoulders */}
      <ProofOfTravel />

      {/* Live Verified Audience & DataFast Analytics */}
      <LiveAnalytics />

      {/* Leather Patches Real-World Preview */}
      <LeatherPatchesPreview onGetSpot={handleScrollToBackpack} />

      {/* Why Backpack beats Laptop (Statement section) */}
      <ExposureComparison />

      {/* Bespoke Craftsmanship & Bag Specs */}
      <CraftsmanshipSpecs />

      {/* 3-Step How it Works */}
      <HowItWorks onGetSpot={handleScrollToBackpack} />

      {/* Nomadic Itinerary */}
      <TravelRoutes />

      {/* FAQ */}
      <FAQ />

      {/* Creator Waitlist */}
      <Waitlist />

      {/* Footer */}
      <Footer />

      {/* Bid Modal */}
      <BidModal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        spots={spots}
        selectedSpot={selectedSpot}
        onSelectSpot={(spot) => setSelectedSpot(spot)}
        onPlaceBid={handlePlaceBid}
        currency={currency}
        currencyRate={campaign.currencyRate}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Auth Modal (Login with X / Email Magic Link) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

    </div>
  );
}

export default App;
