'use client';

import { useState } from 'react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  lastUpdated: number | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function Header({
  searchQuery,
  onSearchChange,
  lastUpdated,
  isRefreshing,
  onRefresh,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 py-3 bg-[var(--surface)] border-b border-[var(--border)]">
      {/* Logo + brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--cyan)] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--green)] pulse-dot" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">
              <span className="text-[var(--foreground)]">Old</span>
              <span className="text-[var(--accent-light)]">Pairs</span>
            </h1>
            <p className="text-[9px] text-[var(--muted)] tracking-wider uppercase">
              OG Token Screener
            </p>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="hidden md:flex items-center gap-1 ml-6">
          <button className="px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--surface-active)] text-[var(--foreground)]">
            Screener
          </button>
          <button className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors">
            Trending
          </button>
          <button className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors">
            Watchlist
          </button>
        </nav>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="2"
            className="absolute left-3 top-1/2 -translate-y-1/2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search token name, symbol, or address..."
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-9 pr-4 py-2 text-xs text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--accent)] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Right: Status + refresh */}
      <div className="flex items-center gap-3">
        {lastUpdated && (
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[var(--muted)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)] pulse-dot" />
            <span>
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          </div>
        )}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors ${
            isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Refresh data"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={isRefreshing ? 'animate-spin' : ''}
          >
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
        </button>
        <div className="hidden lg:flex items-center gap-1.5">
          <span className="text-[10px] text-[var(--muted)]">Solana</span>
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] flex items-center justify-center">
            <span className="text-[7px] font-bold text-white">S</span>
          </div>
        </div>
      </div>
    </header>
  );
}
