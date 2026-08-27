import React from 'react';
import { Plane, Scissors, Laptop, Share2 } from 'lucide-react';

export const CraftsmanshipSpecs: React.FC = () => {
  return (
    <section id="specs" className="scroll-mt-20 py-20 bg-surface-100/40 border-b border-hairline">
      <div className="mx-auto max-w-4xl px-6">
        
        {/* Title */}
        <h2 className="text-3xl font-semibold tracking-[-0.03em] text-ink md:text-4xl">
          What will I do with the money?
        </h2>
        <p className="mt-2 text-[14px] text-ink-muted">
          Every dollar raised funds my upcoming travel transit, tech events, and custom patch production.
        </p>

        {/* Structured Breakdown Card */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-subtle border border-hairline">
          
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline px-6 py-5">
            <div>
              <h3 className="text-xl font-semibold text-ink">Nomad Travel and Sponsorship Budget</h3>
              <span className="text-[13px] text-ink-muted">Where your sponsorship investment goes</span>
            </div>
            <span className="text-[13px] font-semibold text-accent-green uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              Direct allocation
            </span>
          </div>

          <dl className="divide-y divide-hairline">
            
            {/* Planned Travels */}
            <div className="flex flex-col sm:flex-row gap-x-6 gap-y-2 px-6 py-4 text-[14px]">
              <dt className="w-48 shrink-0 text-ink font-semibold flex items-center gap-2">
                <Plane className="h-4 w-4 text-cognac" />
                <span>Planned Travels & Flights</span>
              </dt>
              <dd className="min-w-0 flex-1 text-ink-muted leading-relaxed">
                Flights and transit across upcoming stops: <strong>Indonesia 🇮🇩, Thailand 🇹🇭, Vietnam 🇻🇳, and Japan 🇯🇵</strong>. Worn daily through airport security, boarding gates, subways, and street walks.
              </dd>
            </div>

            {/* Custom Patch Crafting */}
            <div className="flex flex-col sm:flex-row gap-x-6 gap-y-2 px-6 py-4 text-[14px]">
              <dt className="w-48 shrink-0 text-ink font-semibold flex items-center gap-2">
                <Scissors className="h-4 w-4 text-cognac" />
                <span>Patch Production</span>
              </dt>
              <dd className="min-w-0 flex-1 text-ink-muted leading-relaxed">
                Producing durable embroidered badges and laser-engraved leather emblems, securely stitched onto your designated spot by a leather artisan.
              </dd>
            </div>

            {/* Tech Hubs & Co-working */}
            <div className="flex flex-col sm:flex-row gap-x-6 gap-y-2 px-6 py-4 text-[14px]">
              <dt className="w-48 shrink-0 text-ink font-semibold flex items-center gap-2">
                <Laptop className="h-4 w-4 text-cognac" />
                <span>Coworking & Tech Events</span>
              </dt>
              <dd className="min-w-0 flex-1 text-ink-muted leading-relaxed">
                Co-living spaces, developer conferences, and demo days across Southeast Asia and Tokyo, placing your brand in front of founders and engineers daily.
              </dd>
            </div>

            {/* Public Proof & Social Coverage */}
            <div className="flex flex-col sm:flex-row gap-x-6 gap-y-2 px-6 py-4 text-[14px]">
              <dt className="w-48 shrink-0 text-ink font-semibold flex items-center gap-2">
                <Share2 className="h-4 w-4 text-cognac" />
                <span>Travel Logs & Brand Tagging</span>
              </dt>
              <dd className="min-w-0 flex-1 text-ink-muted leading-relaxed">
                Dofollow backlinks on this website, plus tagged photos and trip updates on X (Twitter) and LinkedIn highlighting winning sponsors.
              </dd>
            </div>

          </dl>
        </div>

        <p className="mt-4 text-[13px] leading-relaxed text-ink-muted">
          I already own and use this leather backpack. Your bid helps fund my travel while giving your startup continuous real-world exposure.
        </p>

      </div>
    </section>
  );
};
