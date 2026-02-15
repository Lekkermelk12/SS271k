import { TokenPair, TokenData } from './types';
import { formatAge } from './format';

const DEXSCREENER_BASE = 'https://api.dexscreener.com';

// Fetch token profiles (trending/boosted tokens on Solana)
export async function fetchBoostedTokens(): Promise<TokenPair[]> {
  const res = await fetch(`${DEXSCREENER_BASE}/token-boosts/top/v1`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error('Failed to fetch boosted tokens');
  const data = await res.json();
  return data.filter((t: TokenPair) => t.chainId === 'solana');
}

// Search for Solana pairs by query
export async function searchPairs(query: string): Promise<TokenPair[]> {
  const res = await fetch(
    `${DEXSCREENER_BASE}/latest/dex/search?q=${encodeURIComponent(query)}`,
    { next: { revalidate: 15 } }
  );
  if (!res.ok) throw new Error('Failed to search pairs');
  const data = await res.json();
  return (data.pairs || []).filter((p: TokenPair) => p.chainId === 'solana');
}

// Get pairs by token addresses
export async function fetchPairsByTokens(addresses: string[]): Promise<TokenPair[]> {
  const chunks = [];
  for (let i = 0; i < addresses.length; i += 30) {
    chunks.push(addresses.slice(i, i + 30));
  }

  const allPairs: TokenPair[] = [];
  for (const chunk of chunks) {
    const res = await fetch(
      `${DEXSCREENER_BASE}/tokens/v1/solana/${chunk.join(',')}`,
      { next: { revalidate: 15 } }
    );
    if (res.ok) {
      const data = await res.json();
      allPairs.push(...(Array.isArray(data) ? data : data.pairs || []));
    }
  }
  return allPairs;
}

// Get token pairs from DexScreener token profiles
export async function fetchTokenProfiles(): Promise<TokenPair[]> {
  const res = await fetch(`${DEXSCREENER_BASE}/token-profiles/latest/v1`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error('Failed to fetch token profiles');
  const data = await res.json();
  const solanaTokens = data.filter((t: { chainId: string }) => t.chainId === 'solana');
  const addresses = solanaTokens.map((t: { tokenAddress: string }) => t.tokenAddress);

  if (addresses.length === 0) return [];
  return fetchPairsByTokens(addresses);
}

// Fetch pairs for multiple well-known Solana tokens to seed the screener
export async function fetchSolanaPairs(): Promise<TokenPair[]> {
  // Use DexScreener search with common Solana pair queries to get a variety of tokens
  const queries = [
    'SOL',
    'BONK',
    'WIF',
    'POPCAT',
    'MEW',
    'BOME',
    'WEN',
    'MYRO',
    'SLERF',
    'SAMO',
    'ACHI',
    'MUMU',
    'PONKE',
    'NOS',
    'ZEUS',
    'JUP',
    'RENDER',
    'HNT',
    'PYTH',
  ];

  const results = await Promise.allSettled(
    queries.map(q => searchPairs(q))
  );

  const pairMap = new Map<string, TokenPair>();
  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const pair of result.value) {
        if (
          pair.chainId === 'solana' &&
          pair.pairCreatedAt &&
          pair.liquidity?.usd > 0
        ) {
          // Deduplicate by pairAddress, keep pair with highest liquidity
          const existing = pairMap.get(pair.pairAddress);
          if (!existing || (pair.liquidity?.usd || 0) > (existing.liquidity?.usd || 0)) {
            pairMap.set(pair.pairAddress, pair);
          }
        }
      }
    } else {
      console.warn('Token search query failed:', result.reason);
    }
  }

  return Array.from(pairMap.values());
}

// Main function to fetch and enrich data for the screener
export async function fetchScreenerData(): Promise<TokenData[]> {
  const pairs = await fetchSolanaPairs();
  const now = Date.now();

  const tokens: TokenData[] = pairs
    .map((pair): TokenData => {
      const ageMs = now - pair.pairCreatedAt;
      return {
        ...pair,
        ageMs,
        ageFormatted: formatAge(ageMs),
        marketCap: pair.marketCap || pair.fdv || 0,
      };
    })
    .filter(p => p.ageMs > 0 && p.priceUsd);

  // Fetch holder counts in parallel (best-effort, capped to avoid rate limits)
  const batch = tokens.slice(0, 50);
  const holderResults = await Promise.allSettled(
    batch.map(t => fetchHolderCount(t.baseToken.address))
  );
  for (let i = 0; i < batch.length; i++) {
    const result = holderResults[i];
    if (result.status === 'fulfilled' && result.value !== undefined) {
      batch[i].holders = result.value;
    }
  }

  return tokens;
}

// Fetch pair data for a specific token address
export async function fetchTokenDetail(address: string): Promise<TokenData | null> {
  const res = await fetch(
    `${DEXSCREENER_BASE}/tokens/v1/solana/${address}`,
    { next: { revalidate: 10 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const pairs: TokenPair[] = Array.isArray(data) ? data : data.pairs || [];

  if (pairs.length === 0) return null;

  // Get the pair with highest liquidity
  const pair = pairs.reduce((best, p) =>
    (p.liquidity?.usd || 0) > (best.liquidity?.usd || 0) ? p : best
  );

  const now = Date.now();
  const ageMs = now - pair.pairCreatedAt;

  return {
    ...pair,
    ageMs,
    ageFormatted: formatAge(ageMs),
    marketCap: pair.marketCap || pair.fdv || 0,
  };
}

// Generate sparkline data from price changes (approximation)
export function generateSparkline(priceChange: TokenPair['priceChange']): number[] {
  // Create a rough sparkline from available price change data
  const base = 100;
  const points: number[] = [];
  const steps = 20;

  // Work backwards from 24h change
  const h24Factor = 1 + (priceChange.h24 || 0) / 100;
  const h6Factor = 1 + (priceChange.h6 || 0) / 100;
  const h1Factor = 1 + (priceChange.h1 || 0) / 100;
  const m5Factor = 1 + (priceChange.m5 || 0) / 100;

  // Generate points by interpolating between timeframes
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    let value: number;

    if (t < 0.25) {
      // First 6 hours
      const localT = t / 0.25;
      const startVal = base / h24Factor;
      const endVal = base / h6Factor;
      value = startVal + (endVal - startVal) * localT;
    } else if (t < 0.75) {
      // 6h to 1h ago
      const localT = (t - 0.25) / 0.5;
      const startVal = base / h6Factor;
      const endVal = base / h1Factor;
      value = startVal + (endVal - startVal) * localT;
    } else {
      // Last hour
      const localT = (t - 0.75) / 0.25;
      const startVal = base / h1Factor;
      const endVal = base;
      value = startVal + (endVal - startVal) * localT;
    }

    // Add some noise for realism
    const noise = (Math.sin(i * 2.7) * 0.02 + Math.cos(i * 4.1) * 0.015) * value;
    points.push(value + noise);
  }

  return points;
}

// Solscan API for holder data (public endpoint)
export async function fetchHolderCount(tokenAddress: string): Promise<number | undefined> {
  try {
    const res = await fetch(
      `https://api.solscan.io/v2/token/meta?token=${tokenAddress}`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    return data?.data?.holder ?? undefined;
  } catch {
    return undefined;
  }
}
