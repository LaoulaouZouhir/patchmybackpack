import React, { useState, useEffect } from 'react';
import { Backpack, LogOut, User as UserIcon } from 'lucide-react';
import { supabase, signOutUser, getUserMetadata } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface NavbarProps {
  currency: 'EUR' | 'USD';
  setCurrency: (c: 'EUR' | 'USD') => void;
  onOpenBidModal: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currency,
  setCurrency,
  onOpenBidModal,
  onOpenAuthModal,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const profile = getUserMetadata(user);

  return (
    <nav className="sticky top-0 z-40 border-b border-hairline bg-canvas/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        
        {/* Brand Logo & Wordmark */}
        <a href="#" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.02em] text-ink hover:opacity-80 transition-opacity">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-200 text-cognac">
            <Backpack className="h-4 w-4" />
          </div>
          <span>Patch My Backpack</span>
        </a>

        {/* Center links */}
        <div className="hidden items-center gap-6 text-[13px] font-medium text-ink-muted md:flex">
          <a href="#spots" className="transition-colors hover:text-ink">Live auction</a>
          <a href="#proof" className="transition-colors hover:text-ink">Proof of roam</a>
          <a href="#leather-preview" className="transition-colors hover:text-ink">Patch preview</a>
          <a href="#impact" className="transition-colors hover:text-ink">Why it works</a>
          <a href="#specs" className="transition-colors hover:text-ink">How funds are used</a>
          <a href="#how" className="transition-colors hover:text-ink">How it works</a>
          <a href="#faq" className="transition-colors hover:text-ink">FAQ</a>
        </div>

        {/* Right actions: Currency + User Profile / Sign in + CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Subtle Currency Segmented Pill */}
          <div role="group" aria-label="Currency" className="flex rounded-full bg-surface-200 p-0.5 text-[12px] font-medium">
            <button
              type="button"
              onClick={() => setCurrency('EUR')}
              className={`rounded-full px-2.5 py-0.5 transition-all cursor-pointer ${
                currency === 'EUR'
                  ? 'bg-surface-50 text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              €
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`rounded-full px-2.5 py-0.5 transition-all cursor-pointer ${
                currency === 'USD'
                  ? 'bg-surface-50 text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              $
            </button>
          </div>

          {/* User Auth Pill / Button */}
          {user && profile ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 rounded-full bg-surface-200/90 pl-1 pr-2.5 py-1 text-[12px] font-medium text-ink hover:bg-surface-300 transition-colors border border-hairline cursor-pointer"
              >
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cognac/15 text-cognac text-[10px] font-bold">
                    {profile.displayName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="max-w-[80px] truncate">{profile.twitterUsername ? `@${profile.twitterUsername}` : profile.displayName}</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white p-2 shadow-modal border border-hairline text-[13px] z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-hairline text-ink">
                    <p className="font-semibold truncate">{profile.displayName}</p>
                    <p className="text-[11px] text-ink-muted truncate">{profile.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsDropdownOpen(false);
                      await signOutUser();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer mt-1"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-surface-200 px-3 py-1.5 text-[12.5px] font-medium text-ink hover:bg-surface-300 transition-colors cursor-pointer"
            >
              <UserIcon className="h-3.5 w-3.5 text-ink-muted" />
              <span>Sign in</span>
            </button>
          )}

          {/* Clean Black Rounded Button */}
          <button
            type="button"
            onClick={onOpenBidModal}
            className="rounded-full bg-ink px-4 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85 cursor-pointer shadow-subtle"
          >
            Get a spot
          </button>
        </div>

      </div>
    </nav>
  );
};
