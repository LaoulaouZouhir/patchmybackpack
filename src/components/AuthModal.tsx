import React, { useState } from 'react';
import { X as CloseIcon, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { signInWithTwitter, signInWithEmailOtp } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Sign in to Patch My Backpack",
  subtitle = "Sign in with X or your email to place bids and receive instant outbid notifications."
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleTwitterLogin = async () => {
    setErrorMsg('');
    try {
      await signInWithTwitter();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      console.warn('Twitter OAuth status:', err);
      setErrorMsg('X (Twitter) OAuth is pending configuration in Supabase Dashboard. Please use Email Magic Link below to sign in instantly.');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await signInWithEmailOtp(cleanEmail);
      setIsMagicLinkSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send login link';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-7 sm:p-9 shadow-modal border border-hairline my-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-ink-subtle hover:bg-surface-100 hover:text-ink transition-colors cursor-pointer"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        {isMagicLinkSent ? (
          <div className="text-center py-4 space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-accent-green border border-emerald-200">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-ink">Check your inbox</h3>
            <p className="text-[14px] text-ink-muted leading-relaxed">
              We sent a secure login link to <strong>{email}</strong>. Click the link in your email to sign in instantly.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 rounded-full bg-ink px-6 py-2.5 text-[13px] font-medium text-white hover:opacity-85 transition-opacity cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-200 text-cognac font-bold text-lg">
                🎒
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {title}
              </h2>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">
                {subtitle}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-[12.5px] text-red-700 border border-red-200">
                {errorMsg}
              </div>
            )}

            {/* Social Logins */}
            <div className="space-y-3">
              {/* Sign in with X */}
              <button
                type="button"
                onClick={handleTwitterLogin}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-black text-white px-4 py-3 text-[14px] font-semibold hover:bg-neutral-800 transition-all cursor-pointer shadow-subtle"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Continue with X (Twitter)</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="w-full border-t border-hairline"></div>
                <span className="absolute bg-white px-3 text-[11.5px] font-medium text-ink-subtle uppercase tracking-wider">
                  or email
                </span>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-hairline bg-white pl-10 pr-4 py-2.5 text-[14px] outline-none transition-shadow focus:border-cognac focus:ring-2 focus:ring-cognac/15"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-surface-200 text-ink px-4 py-2.5 text-[13.5px] font-semibold hover:bg-surface-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Sending link...' : 'Send Magic Link'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>

            <p className="mt-5 text-center text-[11.5px] text-ink-subtle leading-relaxed">
              We will only use your email to notify you if someone outbids your spot. No spam, ever.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
