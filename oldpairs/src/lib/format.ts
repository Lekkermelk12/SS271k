export function formatNumber(num: number, decimals = 2): string {
  if (num === 0) return '0';
  if (Math.abs(num) >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(decimals)}B`;
  if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(decimals)}M`;
  if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(decimals)}K`;
  if (Math.abs(num) >= 1) return num.toFixed(decimals);
  // For very small numbers, show more decimals
  if (Math.abs(num) >= 0.0001) return num.toFixed(6);
  return num.toExponential(2);
}

export function formatUsd(num: number): string {
  if (num === 0) return '$0';
  if (Math.abs(num) >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(num) >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (Math.abs(num) >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  if (Math.abs(num) >= 1) return `$${num.toFixed(2)}`;
  if (Math.abs(num) >= 0.0001) return `$${num.toFixed(6)}`;
  return `$${num.toExponential(2)}`;
}

export function formatPrice(price: number | string): string {
  const p = typeof price === 'string' ? parseFloat(price) : price;
  if (p === 0) return '$0';
  if (p >= 1000) return `$${p.toFixed(2)}`;
  if (p >= 1) return `$${p.toFixed(4)}`;
  if (p >= 0.0001) return `$${p.toFixed(6)}`;

  // For extremely small prices, use subscript notation like 0.0₅1234
  const str = p.toFixed(20);
  const match = str.match(/^0\.0*[1-9]/);
  if (match) {
    const zerosAfterDot = match[0].length - 2; // subtract "0."
    const significantDigits = p.toFixed(zerosAfterDot + 4).slice(match[0].length - 1);
    if (zerosAfterDot > 3) {
      return `$0.0{${zerosAfterDot - 1}}${significantDigits}`;
    }
  }
  return `$${p.toExponential(2)}`;
}

export function formatAge(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years}y ${days % 365}d`;
  if (months > 0) return `${months}mo ${days % 30}d`;
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

export function formatPercent(pct: number): string {
  if (pct === 0) return '0%';
  const sign = pct > 0 ? '+' : '';
  if (Math.abs(pct) >= 1000) return `${sign}${(pct / 1000).toFixed(1)}K%`;
  return `${sign}${pct.toFixed(2)}%`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateFull(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncateAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function getDexName(dexId: string): string {
  const dexNames: Record<string, string> = {
    raydium: 'Raydium',
    orca: 'Orca',
    'pump-swap': 'Pump.swap',
    meteora: 'Meteora',
    jupiter: 'Jupiter',
    phoenix: 'Phoenix',
    lifinity: 'Lifinity',
    openbook: 'OpenBook',
  };
  return dexNames[dexId] || dexId;
}
