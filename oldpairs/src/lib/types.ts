export interface TokenPair {
  pairAddress: string;
  chainId: string;
  dexId: string;
  url: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info?: {
    imageUrl?: string;
    header?: string;
    openGraph?: string;
    websites?: { label: string; url: string }[];
    socials?: { type: string; url: string }[];
  };
  boosts?: {
    active: number;
  };
}

import type { AlgoScore } from './algo';

export interface TokenData extends TokenPair {
  ageMs: number;
  ageFormatted: string;
  holders?: number;
  topHoldersPercent?: number;
  devHoldingPercent?: number;
  sparklineData?: number[];
  algoScore?: AlgoScore;
}

export interface FilterState {
  minAge: number;       // in days
  maxAge: number;       // in days
  minMcap: number;
  maxMcap: number;
  minLiquidity: number;
  maxLiquidity: number;
  minVolume24h: number;
  maxVolume24h: number;
  minHolders: number;
  maxHolders: number;
  minTxns24h: number;
  maxTxns24h: number;
  hasSocials: boolean;
  hasWebsite: boolean;
  dex: string;          // 'all' | 'raydium' | 'orca' | 'pump' | etc
  sortBy: SortField;
  sortDir: 'asc' | 'desc';
  search: string;
}

export type SortField =
  | 'score'
  | 'marketCap'
  | 'liquidity'
  | 'volume24h'
  | 'age'
  | 'priceChange24h'
  | 'priceChange1h'
  | 'txns24h'
  | 'holders'
  | 'price';

export interface ApiResponse {
  pairs: TokenPair[];
  cursor?: string;
}

export const DEFAULT_FILTERS: FilterState = {
  minAge: 3,
  maxAge: 365,
  minMcap: 10000,
  maxMcap: 50000000,
  minLiquidity: 5000,
  maxLiquidity: 10000000,
  minVolume24h: 0,
  maxVolume24h: 100000000,
  minHolders: 0,
  maxHolders: 1000000,
  minTxns24h: 0,
  maxTxns24h: 100000,
  hasSocials: false,
  hasWebsite: false,
  dex: 'all',
  sortBy: 'score',
  sortDir: 'desc',
  search: '',
};

export type TimeFrame = '5m' | '1h' | '6h' | '24h';

export interface PresetFilter {
  name: string;
  description: string;
  icon: string;
  filters: Partial<FilterState>;
}

export const PRESET_FILTERS: PresetFilter[] = [
  {
    name: 'Algo Picks',
    description: 'Top scoring tokens ranked by the composite algorithm',
    icon: '🧠',
    filters: {
      minAge: 3,
      minLiquidity: 5000,
      sortBy: 'score',
      sortDir: 'desc',
    },
  },
  {
    name: 'OG Gems',
    description: 'Established tokens 30+ days old with strong liquidity',
    icon: '💎',
    filters: {
      minAge: 30,
      minLiquidity: 50000,
      minVolume24h: 10000,
      sortBy: 'volume24h',
      sortDir: 'desc',
    },
  },
  {
    name: 'Sleeping Giants',
    description: 'High MC tokens with low recent volume',
    icon: '🏔️',
    filters: {
      minAge: 14,
      minMcap: 500000,
      maxVolume24h: 50000,
      sortBy: 'marketCap',
      sortDir: 'desc',
    },
  },
  {
    name: 'Revival Plays',
    description: 'Old tokens showing renewed activity',
    icon: '🔥',
    filters: {
      minAge: 7,
      minVolume24h: 25000,
      minTxns24h: 100,
      sortBy: 'priceChange24h',
      sortDir: 'desc',
    },
  },
  {
    name: 'Diamond Hands',
    description: 'Tokens with high holder count and steady volume',
    icon: '🤲',
    filters: {
      minAge: 14,
      minHolders: 500,
      minVolume24h: 5000,
      sortBy: 'holders',
      sortDir: 'desc',
    },
  },
  {
    name: 'Liquidity Kings',
    description: 'Deepest liquidity pools in the market',
    icon: '🌊',
    filters: {
      minAge: 7,
      minLiquidity: 100000,
      sortBy: 'liquidity',
      sortDir: 'desc',
    },
  },
  {
    name: 'Micro Caps',
    description: 'Small MC OG tokens that could still run',
    icon: '🎯',
    filters: {
      minAge: 7,
      minMcap: 10000,
      maxMcap: 100000,
      minVolume24h: 1000,
      sortBy: 'priceChange24h',
      sortDir: 'desc',
    },
  },
];
