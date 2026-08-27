import { useState, useEffect } from 'react';
import { initialSpots, initialCampaignGoal } from './data/auctionData';
import type { Spot, CampaignGoal } from './data/auctionData';
import { fetchSpotsFromDb, placeBidInDb, subscribeToSpotsRealtime } from './lib/supabase';
import { getFaviconFromUrl } from './lib/urlUtils';
import { Navbar } from './components/Navbar';
import { BackpackVisualizer } from './components/BackpackVisualizer';
import { AuctionTable } from './components/AuctionTable';
import { ProofOfTravel } from './components/ProofOfTravel';
import { ExposureComparison } from './components/ExposureComparison';
import { CraftsmanshipSpecs } from './components/CraftsmanshipSpecs';
import { HowItWorks } from './components/HowItWorks';
import { TravelRoutes } from './components/TravelRoutes';
import { FAQ } from './components/FAQ';
import { Waitlist } from './components/Waitlist';
import { Footer } from './components/Footer';
import { BidModal } from './components/BidModal';
import { AuthModal } from './components/AuthModal';

const STORAGE_KEY = 'buymybackpack_calibrated_spots';

export function App() {
  const [currency, setCurrency] = useState<'EUR' | 'USD'>('EUR');
  
  // Load saved calibrated spots or initial fallback
  const [spots, setSpots] = useState<Spot[]>(initialSpots);
  const [campaign, setCampaign] = useState<CampaignGoal>(initialCampaignGoal);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(initialSpots[0]);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
          const liveTotal = liveSpots.reduce((sum, s) => sum + s.currentBid, 0);
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
        const liveTotal = next.reduce((sum, s) => sum + s.currentBid, 0);
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
            },
          };
        }
        return spot;
      });
      const newTotal = next.reduce((acc, curr) => acc + curr.currentBid, 0);
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
        onOpenBidModal={() => setIsBidModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Hero Section */}
      <header className="mx-auto max-w-5xl px-6 pt-16 pb-14 text-center md:pt-20">
        
        {/* Live Visitor / Total Stats */}
        <div className="inline-flex items-center gap-2 text-[12px] text-ink-muted mb-4 font-medium">
          <span className="h-2 w-2 rounded-full bg-accent-green"></span>
          <span>{campaign.activeVisitors} people visiting this site now</span>
          <span className="text-ink-subtle">·</span>
          <span>{campaign.totalViews.toLocaleString()} total</span>
        </div>

        {/* Hero Title */}
        <h1 className="mt-1 text-[clamp(2.5rem,5.5vw,4.25rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-ink">
          Your brand, on my Backpack.
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-4 max-w-[60ch] text-[15px] leading-relaxed text-ink-muted sm:text-[17px]">
          Your logo travels with me on my daily leather backpack across Asia and global tech hubs.
        </p>

        {/* Funding Progress Widget - Bold & Visible */}
        <div className="mx-auto mt-8 max-w-md px-2">
          {/* Prominent High-Contrast Progress Bar (Above Money Raised) */}
          <div
            role="progressbar"
            aria-valuenow={percentageFunded}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mb-3 h-3 w-full overflow-hidden rounded-full bg-surface-200 border border-hairline-dark/60 shadow-inner p-0.5"
          >
            <div
              className="h-full rounded-full bg-emerald-500 shadow-sm transition-all duration-700"
              style={{ width: `${Math.min(100, percentageFunded)}%` }}
            ></div>
          </div>

          {/* Metric Stats */}
          <div className="flex items-baseline justify-between px-0.5">
            <span className="text-2xl font-semibold tabular-nums text-emerald-600">
              {formatPrice(campaign.totalRaised)}{' '}
              <span className="text-[13px] font-normal text-ink-muted">raised</span>
            </span>
            <span className="text-[13px] text-ink-muted">
              goal passed · <strong className="font-semibold tabular-nums text-emerald-600">{percentageFunded}%</strong>
            </span>
          </div>

          <p className="mt-2 text-[12.5px] text-ink-muted">
            Auction ends in {timeLeft.days}d {timeLeft.hours}h {timeLeft.mins}m · outbid any spot before time runs out
          </p>
        </div>

        {/* Interactive Backpack Hotspots Canvas */}
        <div className="mt-8">
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
            onClick={() => setIsBidModalOpen(true)}
            className="rounded-full bg-accent-blue px-6 py-3 text-[14px] font-medium text-white transition-opacity hover:opacity-90 cursor-pointer shadow-subtle"
          >
            Get a spot
          </button>
          <a
            href="#how"
            className="text-[14px] font-medium text-accent-blue hover:underline"
          >
            How it works ›
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

      {/* Why Backpack beats Laptop (Statement section) */}
      <ExposureComparison />

      {/* Bespoke Craftsmanship & Bag Specs */}
      <CraftsmanshipSpecs />

      {/* 3-Step How it Works */}
      <HowItWorks onOpenBidModal={() => setIsBidModalOpen(true)} />

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
