import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto max-w-4xl px-6 py-14">
        
        {/* Creator Intro */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <img
            src="/zouhir-avatar.jpg"
            alt="Zouhir"
            className="h-14 w-14 shrink-0 rounded-full border border-hairline object-cover shadow-sm"
          />

          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-ink">Hey, I’m Zouhir 👋</p>
            <p className="mt-1.5 max-w-[58ch] text-[13.5px] leading-relaxed text-ink-muted">
              Solo founder building software in public. I am funding my global travels by auctioning patch spots on my everyday leather backpack. Have questions or want a custom arrangement?{' '}
              <a href="https://x.com/ZouhirLaoulaou" target="_blank" rel="noopener noreferrer" className="text-cognac hover:underline">
                Find me on X
              </a>{' '}
              or{' '}
              <a href="mailto:sizouhirl@gmail.com" className="text-cognac hover:underline">
                email me
              </a>.
            </p>
            <p className="mt-2 text-[13px] text-ink-muted">
              Want to do this with your own gear? <a href="#waitlist" className="text-cognac hover:underline">Join the waitlist</a>.
            </p>
          </div>
        </div>

        {/* Bottom Nav & Legal */}
        <div className="mt-10 flex flex-col gap-4 border-t border-hairline pt-6 text-[12px] leading-relaxed text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <a href="#spots" className="hover:text-ink transition-colors">Live auction</a>
            <a href="#goal" className="hover:text-ink transition-colors">The goal</a>
            <a href="#proof" className="hover:text-ink transition-colors">Proof of roam</a>
            <a href="#specs" className="hover:text-ink transition-colors">How funds are used</a>
            <a href="#faq" className="hover:text-ink transition-colors">FAQ</a>
          </nav>
          <span>Patch My Backpack © 2026</span>
        </div>

        <p className="mt-4 text-[11.5px] leading-relaxed text-ink-subtle">
          Patch My Backpack is an independent creative crowdfunding project. All brand trademarks and logos belong to their respective owners.
        </p>

      </div>
    </footer>
  );
};
