import React from 'react';

export const ExposureComparison: React.FC = () => {
  return (
    <section id="impact" className="scroll-mt-20 bg-ink py-20 text-white md:py-28">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-[clamp(1.8rem,4.5vw,3.25rem)] font-medium leading-[1.1] tracking-[-0.03em]">
          Get your brand seen{' '}
          <span className="text-white/50">in the real world.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-white/70">
          From airport boarding gates to subway commutes and tech meetups, your patch travels with me everywhere I go.
        </p>
      </div>
    </section>
  );
};
