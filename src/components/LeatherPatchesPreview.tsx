import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Scissors, Eye, Maximize2, X, ArrowUpRight } from 'lucide-react';

interface LeatherPatchesPreviewProps {
  onGetSpot?: () => void;
  onOpenBidModal?: () => void;
}

export const LeatherPatchesPreview: React.FC<LeatherPatchesPreviewProps> = ({ onGetSpot, onOpenBidModal }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const features = [
    {
      icon: Scissors,
      title: 'Artisan Stitching',
      description: 'Every winning brand patch is sewn with heavy-duty bonded nylon thread directly onto the full-grain leather backpack by a leather craftsman.',
    },
    {
      icon: Eye,
      title: 'High-Contrast Real World Visibility',
      description: 'Embroidered and textured patches catch eyes from meters away at airport lounges, co-working spaces, and developer conferences.',
    },
    {
      icon: ShieldCheck,
      title: 'Weather & Travel Proof',
      description: 'Tough, fade-resistant twill and heat-sealed edges made to withstand monsoon rains, overhead luggage bins, and daily nomad transit.',
    },
  ];

  return (
    <section id="leather-preview" className="scroll-mt-20 py-24 bg-surface-100/50 border-t border-hairline relative overflow-hidden">
      
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cognac-soft/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto max-w-6xl px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-cognac-soft px-3.5 py-1.5 text-[12.5px] font-semibold text-cognac border border-cognac-light/40 shadow-2xs mb-4">
            <Sparkles className="h-3.5 w-3.5 text-cognac" />
            <span>Craftsmanship Preview</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-ink leading-tight">
            How your brand will look on leather.
          </h2>

          <p className="mt-4 text-[15px] sm:text-[17px] leading-relaxed text-ink-muted">
            See the finished aesthetic with custom embroidered and tactile patches secured on the nomad leather backpack. No flimsy stickers — genuine physical presence.
          </p>
        </div>

        {/* Main Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Big Image Display with interactive zoom preview */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-3xl bg-white border border-hairline shadow-float group">
              
              {/* Image with zoom click */}
              <div
                onClick={() => setIsLightboxOpen(true)}
                className="relative cursor-zoom-in overflow-hidden w-full aspect-[3/4] sm:aspect-[4/5] md:aspect-[3/4] flex items-center justify-center bg-[#F2ECE4]"
              >
                <img
                  src="/leather-patches-preview.jpg"
                  alt="Nomad leather backpack with custom sponsor patches"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  loading="lazy"
                />

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-ink/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-ink shadow-lg backdrop-blur-xs">
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>Click to expand high-res</span>
                  </span>
                </div>

                {/* Floating Badge */}
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto rounded-2xl bg-white/95 backdrop-blur-md px-4 py-3 border border-hairline/80 shadow-md">
                  <div className="flex items-center gap-2 text-ink text-xs font-bold">
                    <span className="flex h-2 w-2 rounded-full bg-accent-green animate-pulse"></span>
                    <span>Realistic Mockup & Texture Reference</span>
                  </div>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Authentic stitching, laser embroidery, and color-matched twill
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Feature highlights and Value Props */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
                Built for longevity, not a one-day gimmick.
              </h3>
              <p className="text-[14px] leading-relaxed text-ink-muted">
                Every patch spot won during this auction is individually produced and fastened to withstand thousands of kilometers across airports, metro lines, and tech conferences.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-4">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-2xl bg-white border border-hairline shadow-subtle hover:border-hairline-dark transition-all"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-100 text-cognac border border-hairline">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-semibold text-ink">{feat.title}</h4>
                      <p className="text-[13px] leading-relaxed text-ink-muted mt-1">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Box */}
            <div className="p-5 rounded-2xl bg-surface-200/80 border border-hairline flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-[13.5px] font-semibold text-ink">
                  Want your patch in the next batch?
                </p>
                <p className="text-[12px] text-ink-muted">
                  Limited to only 10 available spots.
                </p>
              </div>

              <button
                type="button"
                onClick={onGetSpot || onOpenBidModal || (() => document.getElementById('spots')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))}
                className="w-full sm:w-auto rounded-full bg-ink hover:bg-neutral-800 text-white px-5 py-2.5 text-[13px] font-semibold transition-all cursor-pointer shadow-sm active:scale-[0.99] flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Claim a Spot</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 cursor-zoom-out animate-fade-in"
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close image"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src="/leather-patches-preview.jpg"
            alt="Enlarged leather backpack with patches preview"
            className="max-h-[92vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}

    </section>
  );
};
