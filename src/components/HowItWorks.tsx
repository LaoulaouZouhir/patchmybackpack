import React from 'react';

interface HowItWorksProps {
  onGetSpot?: () => void;
  onOpenBidModal?: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = () => {
  return (
    <section id="how" className="scroll-mt-20 mx-auto max-w-4xl px-6 py-20">
      <h2 className="text-3xl font-semibold tracking-[-0.03em] text-ink md:text-4xl">
        How it works
      </h2>

      <ol className="mt-10 space-y-10">
        <li className="flex gap-5">
          <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-[14px] font-semibold text-white">
            1
          </span>
          <div>
            <h3 className="text-lg font-semibold text-ink">Pick your spot and size</h3>
            <p className="mt-1 max-w-[58ch] text-[14px] leading-relaxed text-ink-muted">
              Seven distinct zones in three patch sizes (Small, Medium, Large), priced by surface area and transit eye-level visibility.
            </p>
          </div>
        </li>

        <li className="flex gap-5">
          <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-[14px] font-semibold text-white">
            2
          </span>
          <div>
            <h3 className="text-lg font-semibold text-ink">Win the auction</h3>
            <p className="mt-1 max-w-[58ch] text-[14px] leading-relaxed text-ink-muted">
              The top bid at the end of the auction wins. A 20% refundable deposit holds your standing bid until the timer expires.
            </p>
          </div>
        </li>

        <li className="flex gap-5">
          <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-[14px] font-semibold text-white">
            3
          </span>
          <div>
            <h3 className="text-lg font-semibold text-ink">Your patch rides along</h3>
            <p className="mt-1 max-w-[58ch] text-[14px] leading-relaxed text-ink-muted">
              Your logo is crafted into a heavy-duty embroidered patch or laser-cut leather emblem, stitched onto the backpack, and featured with a backlink on this website.
            </p>
          </div>
        </li>
      </ol>
    </section>
  );
};
