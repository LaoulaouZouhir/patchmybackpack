import React, { useState } from 'react';
import { Compass, Sparkles, Plane, ArrowUpRight, CheckCircle2, X } from 'lucide-react';

interface TheGoalProps {
  onGetSpot?: () => void;
}

export const TheGoal: React.FC<TheGoalProps> = ({ onGetSpot }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const keyPoints = [
    {
      icon: Plane,
      title: 'Funding the next trip, 100% in public',
      description: 'Every single patch bid directly funds flights, trains, coffees, and nomad visas for my next global travel chapter as an indie hacker.',
    },
    {
      icon: Sparkles,
      title: 'A crazy, creative experiment',
      description: 'Instead of dry sponsorships or begging for donations, turning an everyday leather backpack into a real-world, roaming internet billboard.',
    },
    {
      icon: Compass,
      title: 'Permanent real-world mileage',
      description: 'Your laser-engraved patch stays stitched to my bag permanently across airports, coworking spaces, cafes, and tech events worldwide.',
    },
  ];

  return (
    <section id="goal" className="scroll-mt-20 py-20 sm:py-24 bg-surface-50/50 border-t border-hairline relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 -z-10 h-80 w-80 rounded-full bg-cognac/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-5xl px-6">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-cognac/10 px-3 py-1 text-[11.5px] font-semibold text-cognac border border-cognac/20 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-cognac" />
            <span className="uppercase tracking-wider">The Real Story & Goal</span>
          </div>
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl md:text-[38px] leading-tight">
            What’s the goal of all of this?
          </h2>
          <p className="mt-3 text-[15px] sm:text-[16px] leading-relaxed text-ink-muted">
            Let’s be 100% honest: <strong className="text-ink font-semibold">the goal is to finance my next worldwide trip with a crazy cool idea.</strong>
          </p>
        </div>

        {/* 2-Column Story Grid: Photo on one side, Personal Letter + Value Pillars on other */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Real Photo of Zouhir with the Bag */}
          <div className="lg:col-span-5">
            <div className="relative group">
              {/* Photo Frame */}
              <div 
                onClick={() => setIsLightboxOpen(true)}
                className="cursor-zoom-in relative overflow-hidden rounded-3xl border border-hairline/80 bg-surface-100 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 group-hover:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.16)] group-hover:scale-[1.01]"
              >
                <img
                  src="/trip-goal.jpg"
                  alt="Zouhir with the brand new backpack ready for patches"
                  className="w-full h-auto aspect-[3/4] object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Overlay Badge */}
                <div className="absolute top-3.5 left-3.5 bg-canvas/90 backdrop-blur-md border border-hairline/90 rounded-full px-3 py-1 text-[11.5px] font-medium text-ink flex items-center gap-1.5 shadow-2xs">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Day 0 · Ready for patches</span>
                </div>

                {/* Click to zoom prompt */}
                <div className="absolute bottom-3.5 right-3.5 bg-ink/80 text-white backdrop-blur-md rounded-full px-3 py-1 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to enlarge
                </div>
              </div>

              {/* Caption */}
              <p className="mt-2.5 text-[12px] text-ink-subtle text-center italic">
                Brand new leather backpack, ready to be stitched with your logos.
              </p>
            </div>
          </div>

          {/* Right Column: Founder Note & Transparent Breakdown */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            
            {/* Direct Personal Manifesto Box */}
            <div className="rounded-2xl border border-hairline bg-surface-100/90 p-6 sm:p-7 shadow-subtle mb-6">
              <p className="text-[14.5px] sm:text-[15px] leading-relaxed text-ink-muted">
                <span className="text-ink font-semibold">“I’m Zouhir</span>, an indie hacker who loves building apps in public and roaming the globe. I didn’t want to run boring banner ads or ask people for donations.
              </p>
              <p className="mt-3 text-[14.5px] sm:text-[15px] leading-relaxed text-ink-muted">
                Instead, I bought this genuine leather backpack and decided to turn it into <strong className="text-ink font-semibold">a collaborative piece of internet history</strong>. If you believe in bold marketing and indie projects, grab a patch spot and ride along on my journey.”
              </p>
            </div>

            {/* Value Pillars List */}
            <div className="space-y-4">
              {keyPoints.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div 
                    key={idx} 
                    className="flex items-start gap-3.5 p-3 rounded-xl transition-colors hover:bg-surface-200/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cognac/10 text-cognac border border-cognac/20 mt-0.5">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-semibold text-ink">{item.title}</h4>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA action */}
            <div className="mt-8 pt-6 border-t border-hairline flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[13px] text-ink-muted">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>12 customizable patch spots available</span>
              </div>

              <button
                type="button"
                onClick={onGetSpot || (() => document.getElementById('spots')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink hover:bg-neutral-800 text-white px-5 py-2.5 text-[13px] font-semibold transition-all cursor-pointer shadow-sm active:scale-[0.99]"
              >
                <span>Claim your spot</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-8 backdrop-blur-sm cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-h-[90vh] max-w-2xl overflow-hidden rounded-2xl bg-black">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
              aria-label="Close image"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src="/trip-goal.jpg"
              alt="Backpack real photo full resolution"
              className="max-h-[85vh] w-auto object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </section>
  );
};
