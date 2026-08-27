import React from 'react';
import { faqItems } from '../data/auctionData';

export const FAQ: React.FC = () => {
  return (
    <section id="faq" className="scroll-mt-20 py-20 bg-surface-100/40 border-y border-hairline">
      <div className="mx-auto max-w-3xl px-6">
        
        <h2 className="text-3xl font-semibold tracking-[-0.03em] text-ink md:text-4xl">
          Questions &amp; Answers
        </h2>

        <div className="mt-8 divide-y divide-hairline">
          {faqItems.map((item, idx) => (
            <details key={idx} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <span className="shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-45 text-xl font-light">
                  +
                </span>
              </summary>
              <div className="max-w-[62ch] pb-5 text-[14px] leading-relaxed text-ink-muted space-y-2">
                {item.a.split('\n').map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>
            </details>
          ))}
        </div>

      </div>
    </section>
  );
};
