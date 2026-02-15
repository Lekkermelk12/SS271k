'use client';

import { TokenData } from '@/lib/types';
import { formatPrice, formatUsd, formatPercent, formatNumber, formatDateFull, truncateAddress, getDexName } from '@/lib/format';
import { generateSparkline } from '@/lib/api';
import Sparkline from './Sparkline';

interface TokenDetailProps {
  token: TokenData;
  onClose: () => void;
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-3">
      <div className="text-[10px] text-[var(--muted-light)] uppercase tracking-wider mb-1">{label}</div>
      <div className={`num text-sm font-semibold ${color || 'text-[var(--foreground)]'}`}>{value}</div>
      {sub && <div className="text-[10px] text-[var(--muted)] mt-0.5 num">{sub}</div>}
    </div>
  );
}

function TxnBar({ buys, sells, label }: { buys: number; sells: number; label: string }) {
  const total = buys + sells;
  const buyPct = total > 0 ? (buys / total) * 100 : 50;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-[var(--muted-light)]">{label}</span>
        <span className="text-[var(--muted)]">{formatNumber(total, 0)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[var(--green)] num w-10">{buys}</span>
        <div className="flex-1 h-2 rounded-full bg-[var(--red)]/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--green)]"
            style={{ width: `${buyPct}%` }}
          />
        </div>
        <span className="text-[10px] text-[var(--red)] num w-10 text-right">{sells}</span>
      </div>
    </div>
  );
}

export default function TokenDetail({ token, onClose }: TokenDetailProps) {
  const sparkData = generateSparkline(token.priceChange);
  const txns24h = token.txns.h24.buys + token.txns.h24.sells;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg h-full bg-[var(--background)] border-l border-[var(--border)] overflow-y-auto fade-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {token.info?.imageUrl ? (
                <img
                  src={token.info.imageUrl}
                  alt={token.baseToken.symbol}
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[var(--surface-active)] flex items-center justify-center text-sm font-bold text-[var(--muted)]">
                  {token.baseToken.symbol.slice(0, 2)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">{token.baseToken.symbol}</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-active)] text-[var(--muted-light)]">
                    {getDexName(token.dexId)}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)]">{token.baseToken.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>

          {/* Price banner */}
          <div className="mt-3 flex items-end gap-3">
            <span className="num text-2xl font-bold">{formatPrice(parseFloat(token.priceUsd))}</span>
            <span
              className={`num text-sm font-medium mb-0.5 ${
                (token.priceChange?.h24 || 0) >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'
              }`}
            >
              {formatPercent(token.priceChange?.h24 || 0)}
            </span>
          </div>
          <div className="mt-2">
            <Sparkline data={sparkData} width={400} height={60} positive={(token.priceChange?.h24 || 0) >= 0} />
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Key stats grid */}
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Market Cap" value={formatUsd(token.marketCap)} />
            <StatCard label="Liquidity" value={formatUsd(token.liquidity?.usd || 0)} />
            <StatCard label="24h Volume" value={formatUsd(token.volume?.h24 || 0)} />
            <StatCard
              label="Age"
              value={token.ageFormatted}
              sub={formatDateFull(token.pairCreatedAt)}
              color="text-[var(--cyan)]"
            />
            <StatCard label="24h TXNs" value={formatNumber(txns24h, 0)} />
            <StatCard label="FDV" value={formatUsd(token.fdv || 0)} />
          </div>

          {/* Price changes */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--muted-light)] uppercase tracking-wider mb-2">
              Price Changes
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {(['m5', 'h1', 'h6', 'h24'] as const).map((tf) => {
                const val = token.priceChange?.[tf] || 0;
                return (
                  <div key={tf} className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-2.5 text-center">
                    <div className="text-[10px] text-[var(--muted)] uppercase mb-1">
                      {tf === 'm5' ? '5min' : tf === 'h1' ? '1hr' : tf === 'h6' ? '6hr' : '24hr'}
                    </div>
                    <div
                      className={`num text-xs font-semibold ${
                        val >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'
                      }`}
                    >
                      {formatPercent(val)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transactions breakdown */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--muted-light)] uppercase tracking-wider mb-2">
              Transactions (Buys / Sells)
            </h3>
            <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-3 space-y-2.5">
              <TxnBar buys={token.txns.m5.buys} sells={token.txns.m5.sells} label="5 min" />
              <TxnBar buys={token.txns.h1.buys} sells={token.txns.h1.sells} label="1 hour" />
              <TxnBar buys={token.txns.h6.buys} sells={token.txns.h6.sells} label="6 hours" />
              <TxnBar buys={token.txns.h24.buys} sells={token.txns.h24.sells} label="24 hours" />
            </div>
          </div>

          {/* Volume breakdown */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--muted-light)] uppercase tracking-wider mb-2">
              Volume
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {(['m5', 'h1', 'h6', 'h24'] as const).map((tf) => (
                <div key={tf} className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-2.5 text-center">
                  <div className="text-[10px] text-[var(--muted)] uppercase mb-1">
                    {tf === 'm5' ? '5min' : tf === 'h1' ? '1hr' : tf === 'h6' ? '6hr' : '24hr'}
                  </div>
                  <div className="num text-xs font-semibold">{formatUsd(token.volume?.[tf] || 0)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Contract & Links */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--muted-light)] uppercase tracking-wider mb-2">
              Contract & Links
            </h3>
            <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted)]">Token Address</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs num text-[var(--foreground)]">
                    {truncateAddress(token.baseToken.address, 6)}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(token.baseToken.address)}
                    className="text-[var(--muted)] hover:text-[var(--cyan)] transition-colors"
                    title="Copy address"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted)]">Pair Address</span>
                <code className="text-xs num text-[var(--foreground)]">
                  {truncateAddress(token.pairAddress, 6)}
                </code>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`https://dexscreener.com/solana/${token.pairAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-light)] transition-all"
            >
              DexScreener
            </a>
            <a
              href={`https://solscan.io/token/${token.baseToken.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-light)] transition-all"
            >
              Solscan
            </a>
            <a
              href={`https://birdeye.so/token/${token.baseToken.address}?chain=solana`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-light)] transition-all"
            >
              Birdeye
            </a>
            <a
              href={`https://jup.ag/swap/SOL-${token.baseToken.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--green)]/10 border border-[var(--green)]/20 text-xs font-bold text-[var(--green)] hover:bg-[var(--green)]/20 transition-all"
            >
              Trade on Jupiter
            </a>
          </div>

          {/* Social links */}
          {token.info?.socials && token.info.socials.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-[var(--muted-light)] uppercase tracking-wider mb-2">
                Socials
              </h3>
              <div className="flex flex-wrap gap-2">
                {token.info.socials.map((social, i) => (
                  <a
                    key={i}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--muted-light)] hover:text-[var(--cyan)] hover:border-[var(--cyan)]/30 transition-all"
                  >
                    {social.type === 'twitter' && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    )}
                    {social.type === 'telegram' && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                    )}
                    <span className="capitalize">{social.type}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
