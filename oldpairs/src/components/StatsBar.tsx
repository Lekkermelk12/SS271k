'use client';

import { TokenData } from '@/lib/types';
import { formatUsd, formatNumber } from '@/lib/format';

interface StatsBarProps {
  tokens: TokenData[];
}

export default function StatsBar({ tokens }: StatsBarProps) {
  if (tokens.length === 0) return null;

  const totalVolume = tokens.reduce((sum, t) => sum + (t.volume?.h24 || 0), 0);
  const totalLiquidity = tokens.reduce((sum, t) => sum + (t.liquidity?.usd || 0), 0);
  const totalMcap = tokens.reduce((sum, t) => sum + (t.marketCap || 0), 0);
  const avgAge = tokens.reduce((sum, t) => sum + t.ageMs, 0) / tokens.length;
  const avgAgeDays = Math.floor(avgAge / (1000 * 60 * 60 * 24));
  const gainers = tokens.filter((t) => (t.priceChange?.h24 || 0) > 0).length;
  const losers = tokens.filter((t) => (t.priceChange?.h24 || 0) < 0).length;

  const topGainer = tokens.reduce((best, t) =>
    (t.priceChange?.h24 || 0) > (best.priceChange?.h24 || 0) ? t : best
  );
  const topLoser = tokens.reduce((worst, t) =>
    (t.priceChange?.h24 || 0) < (worst.priceChange?.h24 || 0) ? t : worst
  );

  const stats = [
    { label: 'Total Volume 24h', value: formatUsd(totalVolume), color: '' },
    { label: 'Total Liquidity', value: formatUsd(totalLiquidity), color: '' },
    { label: 'Total MCap', value: formatUsd(totalMcap), color: '' },
    { label: 'Avg Age', value: `${avgAgeDays}d`, color: 'text-[var(--cyan)]' },
    { label: 'Gainers/Losers', value: `${gainers}/${losers}`, color: '' },
    {
      label: 'Top Gainer',
      value: `${topGainer.baseToken.symbol} +${(topGainer.priceChange?.h24 || 0).toFixed(1)}%`,
      color: 'text-[var(--green)]',
    },
    {
      label: 'Top Loser',
      value: `${topLoser.baseToken.symbol} ${(topLoser.priceChange?.h24 || 0).toFixed(1)}%`,
      color: 'text-[var(--red)]',
    },
  ];

  return (
    <div className="flex items-center gap-6 px-5 py-2 bg-[var(--surface)] border-b border-[var(--border)] overflow-x-auto">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-[10px] text-[var(--muted)]">{stat.label}:</span>
          <span className={`text-xs num font-medium ${stat.color || 'text-[var(--foreground)]'}`}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
