import React, { useState } from 'react';
import { Globe } from 'lucide-react';

export const ProofOfTravel: React.FC = () => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const countriesVisited = [
    { name: 'China', flag: '🇨🇳' },
    { name: 'Qatar', flag: '🇶🇦' },
    { name: 'Turkey', flag: '🇹🇷' },
    { name: 'Egypt', flag: '🇪🇬' },
    { name: 'Morocco', flag: '🇲🇦' },
  ];

  return (
    <section id="proof" className="scroll-mt-20 py-24 bg-canvas border-t border-hairline">
      <div className="mx-auto max-w-5xl px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-accent-green"></span>
              <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted">
                Proven Daily Roam
              </span>
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-ink md:text-4xl">
              It never leaves my shoulders.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
              Every flight, subway commute, and tech summit. This leather backpack has already traveled across <strong>5 countries</strong>, and your patch travels with me on every future stop.
            </p>
          </div>

          {/* Countries Visited Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-semibold text-ink-muted flex items-center gap-1 mr-1">
              <Globe className="h-3.5 w-3.5 text-cognac" />
              <span>Traveled to:</span>
            </span>
            {countriesVisited.map((c) => (
              <span
                key={c.name}
                className="inline-flex items-center gap-1.5 rounded-full bg-surface-200/90 px-3 py-1 text-[12.5px] font-medium text-ink border border-hairline/60 shadow-subtle"
              >
                <span>{c.flag}</span>
                <span>{c.name}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Single High-Res Proof Image Showcase */}
        <div className="relative mx-auto overflow-hidden rounded-3xl bg-surface-100/60 border border-hairline shadow-float group">
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="cursor-zoom-in relative w-full overflow-hidden"
          >
            <img
              src="/proof.png"
              alt="Real-world proof of wearing the backpack across countries"
              className="w-full h-auto object-cover max-h-[640px] transition-transform duration-700 ease-out group-hover:scale-[1.01]"
              loading="lazy"
            />

            {/* Subtle floating badge */}
            <div className="absolute bottom-4 left-4 rounded-full bg-ink/80 backdrop-blur-md px-3.5 py-1.5 text-[12px] font-medium text-white shadow-md flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent-green"></span>
              <span>5 Countries & Growing · Always in active transit</span>
            </div>
          </div>
        </div>

        {/* Footnote Guarantee */}
        <div className="mt-12 border-t border-hairline pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[13px] text-ink-muted">
          <p>
            🛡️ <strong>Physical Roam Guarantee:</strong> All winning sponsor patches stay permanently sewn to the bag across all flights, subways, and vlogs.
          </p>
          <a
            href="#spots"
            className="font-medium text-accent-blue hover:underline whitespace-nowrap"
          >
            Claim your patch spot ›
          </a>
        </div>

      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 cursor-zoom-out"
        >
          <img
            src="/proof.png"
            alt="Enlarged proof"
            className="max-h-[92vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </section>
  );
};
