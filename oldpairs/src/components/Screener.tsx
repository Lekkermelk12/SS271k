'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { TokenData, FilterState, SortField, DEFAULT_FILTERS } from '@/lib/types';
import Header from './Header';
import StatsBar from './StatsBar';
import FilterPanel from './FilterPanel';
import TokenTable from './TokenTable';
import TokenDetail from './TokenDetail';

const REFRESH_INTERVAL = 30_000; // 30 seconds

export default function Screener() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTokens = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setIsRefreshing(true);

    try {
      const res = await fetch('/api/tokens');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTokens(data.pairs || []);
      setLastUpdated(Date.now());
    } catch (err) {
      console.error('Failed to fetch tokens:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchTokens(true);
  }, [fetchTokens]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => fetchTokens(false), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchTokens]);

  // Apply filters
  const filteredTokens = useMemo(() => {
    const now = Date.now();
    const msPerDay = 86_400_000;

    return tokens.filter((token) => {
      const ageDays = token.ageMs / msPerDay;
      const mcap = token.marketCap || 0;
      const liq = token.liquidity?.usd || 0;
      const vol24h = token.volume?.h24 || 0;
      const txns24h = (token.txns?.h24?.buys || 0) + (token.txns?.h24?.sells || 0);

      // Age filter
      if (ageDays < filters.minAge) return false;
      if (filters.maxAge > 0 && ageDays > filters.maxAge) return false;

      // Market cap filter
      if (mcap < filters.minMcap) return false;
      if (filters.maxMcap > 0 && mcap > filters.maxMcap) return false;

      // Liquidity filter
      if (liq < filters.minLiquidity) return false;
      if (filters.maxLiquidity > 0 && liq > filters.maxLiquidity) return false;

      // Volume filter
      if (vol24h < filters.minVolume24h) return false;
      if (filters.maxVolume24h > 0 && vol24h > filters.maxVolume24h) return false;

      // TXN filter
      if (txns24h < filters.minTxns24h) return false;
      if (filters.maxTxns24h > 0 && txns24h > filters.maxTxns24h) return false;

      // Holders filter
      if (token.holders !== undefined) {
        if (token.holders < filters.minHolders) return false;
        if (filters.maxHolders > 0 && token.holders > filters.maxHolders) return false;
      }

      // Socials filter
      if (filters.hasSocials) {
        if (!token.info?.socials || token.info.socials.length === 0) return false;
      }

      // Website filter
      if (filters.hasWebsite) {
        if (!token.info?.websites || token.info.websites.length === 0) return false;
      }

      // DEX filter
      if (filters.dex !== 'all' && token.dexId !== filters.dex) return false;

      // Search filter
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesName = token.baseToken.name.toLowerCase().includes(q);
        const matchesSymbol = token.baseToken.symbol.toLowerCase().includes(q);
        const matchesAddress = token.baseToken.address.toLowerCase().includes(q);
        if (!matchesName && !matchesSymbol && !matchesAddress) return false;
      }

      return true;
    });
  }, [tokens, filters]);

  // Sort tokens
  const sortedTokens = useMemo(() => {
    const sorted = [...filteredTokens];
    const dir = filters.sortDir === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      let aVal = 0;
      let bVal = 0;

      switch (filters.sortBy) {
        case 'marketCap':
          aVal = a.marketCap || 0;
          bVal = b.marketCap || 0;
          break;
        case 'liquidity':
          aVal = a.liquidity?.usd || 0;
          bVal = b.liquidity?.usd || 0;
          break;
        case 'volume24h':
          aVal = a.volume?.h24 || 0;
          bVal = b.volume?.h24 || 0;
          break;
        case 'age':
          aVal = a.ageMs;
          bVal = b.ageMs;
          break;
        case 'priceChange24h':
          aVal = a.priceChange?.h24 || 0;
          bVal = b.priceChange?.h24 || 0;
          break;
        case 'priceChange1h':
          aVal = a.priceChange?.h1 || 0;
          bVal = b.priceChange?.h1 || 0;
          break;
        case 'txns24h':
          aVal = (a.txns?.h24?.buys || 0) + (a.txns?.h24?.sells || 0);
          bVal = (b.txns?.h24?.buys || 0) + (b.txns?.h24?.sells || 0);
          break;
        case 'holders':
          aVal = a.holders || 0;
          bVal = b.holders || 0;
          break;
        case 'price':
          aVal = parseFloat(a.priceUsd) || 0;
          bVal = parseFloat(b.priceUsd) || 0;
          break;
      }

      return (aVal - bVal) * dir;
    });

    return sorted;
  }, [filteredTokens, filters.sortBy, filters.sortDir]);

  const handleSort = useCallback((field: SortField) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortDir: prev.sortBy === field && prev.sortDir === 'desc' ? 'asc' : 'desc',
    }));
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, search: query }));
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[var(--background)]">
      <Header
        searchQuery={filters.search}
        onSearchChange={handleSearchChange}
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchTokens(false)}
      />
      <StatsBar tokens={sortedTokens} />
      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={tokens.length}
        filteredCount={sortedTokens.length}
      />
      <TokenTable
        tokens={sortedTokens}
        sortBy={filters.sortBy}
        sortDir={filters.sortDir}
        onSort={handleSort}
        onSelectToken={setSelectedToken}
        loading={loading}
      />
      {selectedToken && (
        <TokenDetail
          token={selectedToken}
          onClose={() => setSelectedToken(null)}
        />
      )}
    </div>
  );
}
