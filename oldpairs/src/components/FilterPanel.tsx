'use client';

import { useState } from 'react';
import { FilterState, PRESET_FILTERS, DEFAULT_FILTERS } from '@/lib/types';
import { formatUsd, formatNumber } from '@/lib/format';

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

function RangeInput({
  label,
  min,
  max,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
  format = 'usd',
}: {
  label: string;
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
  format?: 'usd' | 'number' | 'days';
}) {
  const fmt = (v: number) => {
    if (format === 'usd') return formatUsd(v);
    if (format === 'days') return `${v}d`;
    return formatNumber(v, 0);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[var(--muted-light)] uppercase tracking-wider">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={valueMin || ''}
          onChange={(e) => onChangeMin(Number(e.target.value) || 0)}
          placeholder="Min"
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs num text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none transition-colors"
        />
        <span className="text-[var(--muted)] text-xs">-</span>
        <input
          type="number"
          value={valueMax || ''}
          onChange={(e) => onChangeMax(Number(e.target.value) || 0)}
          placeholder="Max"
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs num text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none transition-colors"
        />
      </div>
      <div className="flex justify-between text-[10px] text-[var(--muted)]">
        <span>{fmt(valueMin)}</span>
        <span>{fmt(valueMax)}</span>
      </div>
    </div>
  );
}

export default function FilterPanel({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const update = (partial: Partial<FilterState>) => {
    setActivePreset(null);
    onFiltersChange({ ...filters, ...partial });
  };

  const applyPreset = (preset: typeof PRESET_FILTERS[0]) => {
    setActivePreset(preset.name);
    onFiltersChange({ ...DEFAULT_FILTERS, ...preset.filters });
  };

  const resetFilters = () => {
    setActivePreset(null);
    onFiltersChange(DEFAULT_FILTERS);
  };

  return (
    <div className="bg-[var(--surface)] border-b border-[var(--border)]">
      {/* Preset bar */}
      <div className="px-4 py-2.5 flex items-center gap-2 border-b border-[var(--border)] overflow-x-auto">
        <span className="text-xs text-[var(--muted)] whitespace-nowrap mr-1">Presets:</span>
        {PRESET_FILTERS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => applyPreset(preset)}
            title={preset.description}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
              activePreset === preset.name
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface-hover)] text-[var(--muted-light)] hover:bg-[var(--surface-active)] hover:text-[var(--foreground)]'
            }`}
          >
            <span>{preset.icon}</span>
            <span>{preset.name}</span>
          </button>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--muted)]">
            <span className="text-[var(--cyan)] num font-medium">{filteredCount}</span>
            <span className="mx-1">/</span>
            <span className="num">{totalCount}</span>
            <span className="ml-1">tokens</span>
          </span>
          <button
            onClick={resetFilters}
            className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-[var(--muted-light)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            >
              <path d="M3 5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Filters
          </button>
        </div>
      </div>

      {/* Filter inputs */}
      {isExpanded && (
        <div className="px-4 py-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 fade-in">
          <RangeInput
            label="Age (days)"
            min={0}
            max={365}
            valueMin={filters.minAge}
            valueMax={filters.maxAge}
            onChangeMin={(v) => update({ minAge: v })}
            onChangeMax={(v) => update({ maxAge: v })}
            format="days"
          />
          <RangeInput
            label="Market Cap"
            min={0}
            max={50000000}
            valueMin={filters.minMcap}
            valueMax={filters.maxMcap}
            onChangeMin={(v) => update({ minMcap: v })}
            onChangeMax={(v) => update({ maxMcap: v })}
            format="usd"
          />
          <RangeInput
            label="Liquidity"
            min={0}
            max={10000000}
            valueMin={filters.minLiquidity}
            valueMax={filters.maxLiquidity}
            onChangeMin={(v) => update({ minLiquidity: v })}
            onChangeMax={(v) => update({ maxLiquidity: v })}
            format="usd"
          />
          <RangeInput
            label="24h Volume"
            min={0}
            max={100000000}
            valueMin={filters.minVolume24h}
            valueMax={filters.maxVolume24h}
            onChangeMin={(v) => update({ minVolume24h: v })}
            onChangeMax={(v) => update({ maxVolume24h: v })}
            format="usd"
          />
          <RangeInput
            label="Holders"
            min={0}
            max={1000000}
            valueMin={filters.minHolders}
            valueMax={filters.maxHolders}
            onChangeMin={(v) => update({ minHolders: v })}
            onChangeMax={(v) => update({ maxHolders: v })}
            format="number"
          />
          <RangeInput
            label="24h TXNs"
            min={0}
            max={100000}
            valueMin={filters.minTxns24h}
            valueMax={filters.maxTxns24h}
            onChangeMin={(v) => update({ minTxns24h: v })}
            onChangeMax={(v) => update({ maxTxns24h: v })}
            format="number"
          />

          {/* Toggle filters */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--muted-light)] uppercase tracking-wider">
              Options
            </label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.hasSocials}
                  onChange={(e) => update({ hasSocials: e.target.checked })}
                  className="w-3.5 h-3.5 rounded border-[var(--border)] bg-[var(--surface)] accent-[var(--accent)]"
                />
                <span className="text-xs text-[var(--muted-light)] group-hover:text-[var(--foreground)] transition-colors">
                  Has socials
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.hasWebsite}
                  onChange={(e) => update({ hasWebsite: e.target.checked })}
                  className="w-3.5 h-3.5 rounded border-[var(--border)] bg-[var(--surface)] accent-[var(--accent)]"
                />
                <span className="text-xs text-[var(--muted-light)] group-hover:text-[var(--foreground)] transition-colors">
                  Has website
                </span>
              </label>
            </div>

            {/* DEX filter */}
            <select
              value={filters.dex}
              onChange={(e) => update({ dex: e.target.value })}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none cursor-pointer"
            >
              <option value="all">All DEXes</option>
              <option value="raydium">Raydium</option>
              <option value="orca">Orca</option>
              <option value="meteora">Meteora</option>
              <option value="pump-swap">Pump.swap</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
