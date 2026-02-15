'use client';

import { TokenData } from '@/lib/types';
import { formatPrice, formatUsd, formatPercent, formatNumber, truncateAddress, getDexName } from '@/lib/format';
import { generateSparkline } from '@/lib/api';
import Sparkline from './Sparkline';

interface TokenRowProps {
  token: TokenData;
  index: number;
  onSelect: (token: TokenData) => void;
}

function PriceChange({ value }: { value: number }) {
  if (value === 0 || value === undefined || value === null) {
    return <span className="text-[var(--muted)] num text-xs">0%</span>;
  }
  const isPositive = value > 0;
  return (
    <span
      className={`num text-xs font-medium ${
        isPositive ? 'text-[var(--green)] glow-green' : 'text-[var(--red)] glow-red'
      }`}
    >
      {formatPercent(value)}
    </span>
  );
}

function SocialLinks({ info }: { info?: TokenData['info'] }) {
  if (!info) return <span className="text-[var(--muted)]">-</span>;

  const socials = info.socials || [];
  const websites = info.websites || [];

  return (
    <div className="flex items-center gap-1.5">
      {socials.map((s, i) => {
        if (s.type === 'twitter') {
          return (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[var(--muted)] hover:text-[var(--cyan)] transition-colors"
              title="Twitter"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          );
        }
        if (s.type === 'telegram') {
          return (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[var(--muted)] hover:text-[var(--cyan)] transition-colors"
              title="Telegram"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </a>
          );
        }
        return null;
      })}
      {websites.length > 0 && (
        <a
          href={websites[0].url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[var(--muted)] hover:text-[var(--cyan)] transition-colors"
          title="Website"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
          </svg>
        </a>
      )}
    </div>
  );
}

export default function TokenRow({ token, index, onSelect }: TokenRowProps) {
  const sparkData = generateSparkline(token.priceChange);
  const txns24h = (token.txns?.h24?.buys || 0) + (token.txns?.h24?.sells || 0);
  const buyRatio = txns24h > 0 ? ((token.txns?.h24?.buys || 0) / txns24h) * 100 : 50;

  return (
    <tr
      className="token-row cursor-pointer border-b border-[var(--border)]/30"
      onClick={() => onSelect(token)}
    >
      {/* Rank */}
      <td className="px-3 py-2.5 text-xs text-[var(--muted)] num w-10">
        {index + 1}
      </td>

      {/* Token info */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          {token.info?.imageUrl ? (
            <img
              src={token.info.imageUrl}
              alt={token.baseToken.symbol}
              className="w-7 h-7 rounded-full flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[var(--surface-active)] flex items-center justify-center text-[10px] font-bold text-[var(--muted)] flex-shrink-0">
              {token.baseToken.symbol.slice(0, 2)}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-[var(--foreground)] truncate max-w-[120px]">
                {token.baseToken.symbol}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-active)] text-[var(--muted-light)]">
                {getDexName(token.dexId)}
              </span>
            </div>
            <div className="text-[10px] text-[var(--muted)] truncate max-w-[150px]">
              {token.baseToken.name}
            </div>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="px-3 py-2.5 text-right">
        <span className="num text-xs text-[var(--foreground)]">
          {formatPrice(parseFloat(token.priceUsd))}
        </span>
      </td>

      {/* Age */}
      <td className="px-3 py-2.5 text-right">
        <span className="num text-xs text-[var(--cyan)]">{token.ageFormatted}</span>
      </td>

      {/* Market Cap */}
      <td className="px-3 py-2.5 text-right">
        <span className="num text-xs">{formatUsd(token.marketCap)}</span>
      </td>

      {/* Liquidity */}
      <td className="px-3 py-2.5 text-right">
        <span className="num text-xs">{formatUsd(token.liquidity?.usd || 0)}</span>
      </td>

      {/* 24h Volume */}
      <td className="px-3 py-2.5 text-right">
        <span className="num text-xs">{formatUsd(token.volume?.h24 || 0)}</span>
      </td>

      {/* TXNs */}
      <td className="px-3 py-2.5 text-right">
        <div className="flex flex-col items-end gap-0.5">
          <span className="num text-xs">{formatNumber(txns24h, 0)}</span>
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-[var(--green)]">{token.txns?.h24?.buys || 0}</span>
            <span className="text-[var(--muted)]">/</span>
            <span className="text-[var(--red)]">{token.txns?.h24?.sells || 0}</span>
          </div>
          {/* Buy/sell ratio bar */}
          <div className="w-12 h-1 rounded-full bg-[var(--red)]/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--green)]"
              style={{ width: `${buyRatio}%` }}
            />
          </div>
        </div>
      </td>

      {/* Price Changes */}
      <td className="px-3 py-2.5 text-right">
        <PriceChange value={token.priceChange?.m5 || 0} />
      </td>
      <td className="px-3 py-2.5 text-right">
        <PriceChange value={token.priceChange?.h1 || 0} />
      </td>
      <td className="px-3 py-2.5 text-right">
        <PriceChange value={token.priceChange?.h24 || 0} />
      </td>

      {/* Sparkline */}
      <td className="px-3 py-2.5">
        <Sparkline data={sparkData} positive={(token.priceChange?.h24 || 0) >= 0} />
      </td>

      {/* Socials */}
      <td className="px-3 py-2.5">
        <SocialLinks info={token.info} />
      </td>

      {/* Actions */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <a
            href={`https://dexscreener.com/solana/${token.pairAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-2 py-1 rounded text-[10px] font-medium bg-[var(--surface-active)] text-[var(--muted-light)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
            title="View on DexScreener"
          >
            DEX
          </a>
          <a
            href={`https://solscan.io/token/${token.baseToken.address}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-2 py-1 rounded text-[10px] font-medium bg-[var(--surface-active)] text-[var(--muted-light)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
            title="View on Solscan"
          >
            SCAN
          </a>
          <a
            href={`https://jup.ag/swap/SOL-${token.baseToken.address}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-2 py-1 rounded text-[10px] font-bold bg-[var(--green)]/10 text-[var(--green)] hover:bg-[var(--green)]/20 transition-colors"
            title="Trade on Jupiter"
          >
            BUY
          </a>
        </div>
      </td>
    </tr>
  );
}
