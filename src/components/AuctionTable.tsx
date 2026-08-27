import React from 'react';
import type { Spot } from '../data/auctionData';
import { ExternalLink } from 'lucide-react';
import { getFaviconFromUrl } from '../lib/urlUtils';

interface AuctionTableProps {
  spots: Spot[];
  onBidSpot: (spot: Spot) => void;
  currency: 'EUR' | 'USD';
  currencyRate: number;
}

export const AuctionTable: React.FC<AuctionTableProps> = ({
  spots,
  onBidSpot,
  currency,
  currencyRate,
}) => {
  const formatPrice = (amountInEur: number) => {
    if (currency === 'USD') {
      return `$${Math.round(amountInEur * currencyRate)}`;
    }
    return `${amountInEur} €`;
  };

  return (
    <section id="spots" className="scroll-mt-20 py-20 bg-surface-100/50 border-t border-hairline">
      <div className="mx-auto max-w-4xl px-6">
        
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-[13px] text-ink-muted">
            <span className="flex h-2 w-2 rounded-full bg-accent-green"></span>
            <span>Live auction: all {spots.length} patch spots active</span>
          </div>
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-ink md:text-4xl">
            Live Leaderboard
          </h2>
          <p className="mt-2 text-[14px] text-ink-muted">
            Every spot shows its current top bid. Outbids require a minimum +10€ increment.
          </p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden overflow-hidden rounded-2xl bg-white shadow-subtle border border-hairline sm:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="border-b border-hairline text-[12px] font-medium text-ink-subtle">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Spot</th>
                  <th scope="col" className="px-5 py-3.5">Size</th>
                  <th scope="col" className="px-5 py-3.5">Held by</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Current bid</th>
                  <th scope="col" className="px-5 py-3.5 text-right"><span className="sr-only">Action</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {spots.map((spot) => (
                  <tr key={spot.id} className="hover:bg-surface-100/50 transition-colors">
                    
                    {/* Spot Number & Label */}
                    <td className="px-5 py-4 font-medium text-ink">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-surface-200 text-[11px] font-bold text-ink-muted tabular-nums">
                          {spot.id}
                        </span>
                        <span>{spot.label}</span>
                      </div>
                    </td>

                    {/* Size & Dimensions */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-surface-200 text-[10px] font-bold text-ink-muted">
                          {spot.size}
                        </span>
                        <span className="text-[12px] text-ink-muted">{spot.dimensions}</span>
                      </div>
                    </td>

                    {/* Held by Sponsor Link */}
                    <td className="px-5 py-4">
                      {spot.bidCount > 0 && spot.topBidder.brand ? (
                        <a
                          href={spot.topBidder.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 font-medium text-ink hover:text-cognac transition-colors group"
                        >
                          {(spot.topBidder.logo || getFaviconFromUrl(spot.topBidder.url)) && (
                            <img
                              src={spot.topBidder.logo || getFaviconFromUrl(spot.topBidder.url)}
                              alt={spot.topBidder.brand}
                              className="h-4 w-4 rounded object-contain shrink-0"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          )}
                          <span>{spot.topBidder.brand}</span>
                          <ExternalLink className="h-3 w-3 text-ink-subtle group-hover:text-cognac" />
                        </a>
                      ) : (
                        <span className="text-[12.5px] font-medium text-accent-green">
                          🟢 Available
                        </span>
                      )}
                    </td>

                    {/* Current Bid */}
                    <td className="px-5 py-4 text-right">
                      <span className="block font-semibold tabular-nums text-ink">
                        {formatPrice(spot.bidCount > 0 ? spot.currentBid : spot.startingBid)}
                      </span>
                      <span className="block text-[11px] text-ink-subtle">
                        {spot.bidCount > 0 ? `${spot.bidCount} ${spot.bidCount === 1 ? 'bid' : 'bids'}` : 'Starting price'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onBidSpot(spot)}
                        className={`rounded-full px-3.5 py-1 text-[12px] font-medium transition-all cursor-pointer ${
                          spot.bidCount > 0
                            ? 'border border-cognac/50 text-cognac hover:bg-cognac hover:text-white'
                            : 'bg-ink text-white hover:opacity-85 shadow-sm'
                        }`}
                      >
                        {spot.bidCount > 0 ? 'Outbid' : 'Claim Spot'}
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile List */}
        <div className="space-y-3 sm:hidden">
          {spots.map((spot) => (
            <div key={spot.id} className="rounded-2xl bg-white p-4 shadow-subtle border border-hairline space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-[12px] text-ink-muted">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-surface-200 text-[11px] font-bold">
                      {spot.id}
                    </span>
                    <span>Size {spot.size} · {spot.dimensions}</span>
                  </p>
                  <p className="mt-1 font-medium text-ink text-[14px]">{spot.label}</p>
                </div>
                <div className="text-right">
                  <span className="block font-semibold tabular-nums text-ink text-[15px]">
                    {formatPrice(spot.bidCount > 0 ? spot.currentBid : spot.startingBid)}
                  </span>
                  <span className="block text-[11px] text-ink-subtle">
                    {spot.bidCount > 0 ? `${spot.bidCount} bids` : 'Available'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-hairline pt-3">
                {spot.bidCount > 0 && spot.topBidder.brand ? (
                  <a
                    href={spot.topBidder.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-[13px] text-ink hover:text-cognac"
                  >
                    {(spot.topBidder.logo || getFaviconFromUrl(spot.topBidder.url)) && (
                      <img
                        src={spot.topBidder.logo || getFaviconFromUrl(spot.topBidder.url)}
                        alt={spot.topBidder.brand}
                        className="h-4 w-4 rounded object-contain shrink-0"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <span>{spot.topBidder.brand}</span>
                    <ExternalLink className="h-3 w-3 text-ink-subtle" />
                  </a>
                ) : (
                  <span className="text-[12.5px] font-medium text-accent-green">
                    🟢 Available
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onBidSpot(spot)}
                  className={`rounded-full px-3.5 py-1 text-[12px] font-medium transition-all cursor-pointer ${
                    spot.bidCount > 0
                      ? 'border border-cognac/50 text-cognac hover:bg-cognac hover:text-white'
                      : 'bg-ink text-white hover:opacity-85'
                  }`}
                >
                  {spot.bidCount > 0 ? 'Outbid' : 'Claim Spot'}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
