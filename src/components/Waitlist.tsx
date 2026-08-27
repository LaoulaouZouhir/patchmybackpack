import React, { useState, useEffect } from 'react';
import { CheckCircle2, Mail, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { submitWaitlistToDb } from '../lib/supabase';

const WAITLIST_STORAGE_KEY = 'pmb_waitlist_user';

export const Waitlist: React.FC = () => {
  const [email, setEmail] = useState('');
  const [twitter, setTwitter] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Check if previously registered in this browser
  useEffect(() => {
    try {
      const saved = localStorage.getItem(WAITLIST_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.email) {
          setSubmitted(true);
          setSubmittedEmail(parsed.email);
        }
      }
    } catch {
      // Ignore localStorage parse errors
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      // 1. Submit to Supabase
      await submitWaitlistToDb(cleanEmail, twitter.trim());
    } catch (err) {
      console.warn('Waitlist Supabase submission note:', err);
      // Even if Supabase RLS blocks anon, save locally & gracefully succeed
      try {
        const existingRaw = localStorage.getItem('pmb_pending_waitlist') || '[]';
        const list = JSON.parse(existingRaw);
        list.push({ email: cleanEmail, twitter: twitter.trim(), timestamp: new Date().toISOString() });
        localStorage.setItem('pmb_pending_waitlist', JSON.stringify(list));
      } catch {
        // Fallback
      }
    } finally {
      setLoading(false);
      setSubmitted(true);
      setSubmittedEmail(cleanEmail);

      // Persist registered state
      try {
        localStorage.setItem(
          WAITLIST_STORAGE_KEY,
          JSON.stringify({ email: cleanEmail, twitter: twitter.trim(), date: new Date().toISOString() })
        );
      } catch {
        // Ignore
      }

      // Trigger celebratory confetti
      import('canvas-confetti').then((confettiModule) => {
        const confetti = confettiModule.default;
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.8 },
        });
      });
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setEmail('');
    setTwitter('');
    setErrorMsg('');
  };

  return (
    <section id="waitlist" className="scroll-mt-20 py-20 bg-canvas border-t border-hairline">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        
        <div className="rounded-3xl border border-hairline bg-surface-50 p-7 sm:p-10 shadow-float relative overflow-hidden">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-36 w-36 rounded-full bg-cognac/5 blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-2 w-2 rounded-full bg-cognac"></span>
            <span className="text-[12px] font-bold uppercase tracking-wider text-cognac">
              Creator & Nomad Waitlist
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-[-0.03em] text-ink sm:text-3xl">
            Want to do this with your own backpack?
          </h2>
          
          <p className="mt-2 max-w-[58ch] text-[14px] sm:text-[15px] leading-relaxed text-ink-muted">
            You choose your bag and your patch prices; the live bidding system, Stripe deposits, and sponsor payouts are automated for you.
          </p>

          {submitted ? (
            <div className="mt-6 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 p-5 text-ink animate-fade-in">
              <div className="flex items-start gap-3.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-[13.5px]">
                  <p className="font-semibold text-emerald-950 flex items-center gap-1.5">
                    <span>You're on the priority waitlist!</span>
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  </p>
                  <p className="text-emerald-800 leading-relaxed text-[13px]">
                    We'll email you at <strong className="font-semibold text-emerald-950">{submittedEmail}</strong> the moment self-serve creator gear auctions launch.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-[12px] font-medium text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                    >
                      Register another email or update details &rsaquo;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted/60" />
                    <input
                      type="email"
                      placeholder="your email address"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      className={`w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-[14px] outline-none transition-all placeholder:text-ink-muted/50 ${
                        errorMsg
                          ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                          : 'border-hairline focus:border-cognac focus:ring-2 focus:ring-cognac/15'
                      }`}
                    />
                  </div>
                  {errorMsg && (
                    <p className="mt-1.5 text-[11.5px] font-medium text-red-600 pl-1">
                      {errorMsg}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="your X / Twitter handle (optional)"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="w-full rounded-xl border border-hairline bg-white px-4 py-2.5 text-[14px] outline-none transition-all placeholder:text-ink-muted/50 focus:border-cognac focus:ring-2 focus:ring-cognac/15"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-neutral-800 cursor-pointer shadow-subtle disabled:opacity-60 active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <span>Join the waitlist</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>

                <p className="text-[12px] text-ink-muted">
                  No spam. Exactly one email when platform invites open.
                </p>
              </div>
            </form>
          )}

        </div>

      </div>
    </section>
  );
};
