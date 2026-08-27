import React from 'react';
import { travelDestinations } from '../data/auctionData';

export const TravelRoutes: React.FC = () => {
  return (
    <section className="py-16 bg-surface-100/50 border-t border-hairline">
      <div className="mx-auto max-w-5xl px-6">
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-ink">
            2026 Nomadic Route
          </h2>
          <p className="mt-1 text-[13px] text-ink-muted">
            The backpack will travel on my shoulders across these upcoming destinations.
          </p>
        </div>

        {/* Row of 4 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {travelDestinations.map((dest, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white p-5 border border-hairline shadow-subtle flex flex-col justify-between hover:shadow-float transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{dest.flag}</span>
                <span className="text-[11px] font-medium text-ink-subtle">Transit Stop</span>
              </div>
              <div>
                <h3 className="font-semibold text-ink text-[16px]">{dest.city}</h3>
                <p className="text-[12.5px] text-ink-muted mt-1 leading-snug">{dest.event}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
