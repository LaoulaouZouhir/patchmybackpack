import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TheGoalProps {
  onGetSpot?: () => void;
}

export const TheGoal: React.FC<TheGoalProps> = () => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <section id="goal" className="scroll-mt-20 py-16 sm:py-20 bg-canvas border-t border-hairline">
      <div className="mx-auto max-w-3xl px-6 text-center">
        
        {/* Simple Honest Title & Subtitle */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-ink">
          What’s the goal of all of this?
        </h2>
        <p className="mt-3 text-[15px] sm:text-[16.5px] leading-relaxed text-ink-muted max-w-xl mx-auto">
          Let’s be 100% honest: the goal is to finance my next worldwide trip with a crazy cool idea.
        </p>

        {/* Real Backpack Photo Showcase */}
        <div className="mt-8 sm:mt-10 mx-auto max-w-md">
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="cursor-zoom-in relative overflow-hidden rounded-3xl border border-hairline bg-surface-100 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 hover:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.16)] hover:scale-[1.01] group"
          >
            <img
              src="/trip-goal.jpg"
              alt="Backpack ready for patches"
              className="w-full h-auto aspect-[3/4] object-cover object-center transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            
            <div className="absolute bottom-3.5 right-3.5 bg-ink/80 text-white backdrop-blur-md rounded-full px-3 py-1 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Click to enlarge
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
