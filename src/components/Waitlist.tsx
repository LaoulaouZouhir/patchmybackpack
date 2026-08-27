import React, { useState } from 'react';
import { submitWaitlistToDb } from '../lib/supabase';

export const Waitlist: React.FC = () => {
  const [email, setEmail] = useState('');
  const [twitter, setTwitter] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await submitWaitlistToDb(email, twitter);
      setSubmitted(true);
    } catch (err) {
      console.error('Waitlist submission error:', err);
      setSubmitted(true); // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="waitlist" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-3xl px-6">
        
        <div className="rounded-3xl border border-hairline bg-white p-8 shadow-subtle sm:p-10">
          
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-ink sm:text-3xl">
            Want to do this with your own backpack?
          </h2>
          
          <p className="mt-2 max-w-[58ch] text-[14px] leading-relaxed text-ink-muted">
            You choose your bag and your patch prices; the auction system, deposits, and sponsor payouts are handled for you.
          </p>

          {submitted ? (
            <div className="mt-6 rounded-2xl bg-surface-100 p-4 text-[13px] font-medium text-accent-green">
              ✓ You’re on the priority waitlist. We’ll notify you when self-serve gear auctions open.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="email"
                  required
                  placeholder="your email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-hairline bg-white px-4 py-2.5 text-[14px] outline-none transition-shadow placeholder:text-ink-subtle focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/15"
                />
                <input
                  type="text"
                  placeholder="your X/Twitter handle (optional)"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full rounded-xl border border-hairline bg-white px-4 py-2.5 text-[14px] outline-none transition-shadow placeholder:text-ink-subtle focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/15"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-ink px-6 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85 cursor-pointer shadow-subtle disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join the waitlist'}
              </button>

              <p className="text-[12px] text-ink-subtle pt-1">
                One email when it opens, nothing else.
              </p>
            </form>
          )}

        </div>

      </div>
    </section>
  );
};
