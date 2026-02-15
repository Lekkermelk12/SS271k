'use client';

import { TokenData, SortField } from '@/lib/types';
import TokenRow from './TokenRow';

interface TokenTableProps {
  tokens: TokenData[];
  sortBy: SortField;
  sortDir: 'asc' | 'desc';
  onSort: (field: SortField) => void;
  onSelectToken: (token: TokenData) => void;
  loading: boolean;
}

interface ColumnDef {
  label: string;
  field: SortField | null;
  align: 'left' | 'right' | 'center';
  width?: string;
}

const COLUMNS: ColumnDef[] = [
  { label: '#', field: null, align: 'left', width: 'w-10' },
  { label: 'Score', field: 'score', align: 'center' },
  { label: 'Token', field: null, align: 'left' },
  { label: 'Price', field: 'price', align: 'right' },
  { label: 'Age', field: 'age', align: 'right' },
  { label: 'MCap', field: 'marketCap', align: 'right' },
  { label: 'Liquidity', field: 'liquidity', align: 'right' },
  { label: '24h Vol', field: 'volume24h', align: 'right' },
  { label: 'TXNs', field: 'txns24h', align: 'right' },
  { label: '5m', field: null, align: 'right' },
  { label: '1h', field: 'priceChange1h', align: 'right' },
  { label: '24h', field: 'priceChange24h', align: 'right' },
  { label: 'Chart', field: null, align: 'center' },
  { label: 'Links', field: null, align: 'left' },
  { label: 'Actions', field: null, align: 'left' },
];

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <span className={`ml-1 inline-block ${active ? 'text-[var(--cyan)]' : 'text-[var(--muted)]/0'}`}>
      {dir === 'asc' ? '▲' : '▼'}
    </span>
  );
}

function SkeletonRow({ index }: { index: number }) {
  return (
    <tr className="border-b border-[var(--border)]/30">
      <td className="px-3 py-3"><div className="skeleton h-3 w-4" /></td>
      <td className="px-3 py-3"><div className="skeleton h-5 w-10 mx-auto rounded-full" /></td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="skeleton w-7 h-7 rounded-full" />
          <div className="space-y-1.5">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-2 w-28" />
          </div>
        </div>
      </td>
      <td className="px-3 py-3"><div className="skeleton h-3 w-16 ml-auto" /></td>
      <td className="px-3 py-3"><div className="skeleton h-3 w-12 ml-auto" /></td>
      <td className="px-3 py-3"><div className="skeleton h-3 w-14 ml-auto" /></td>
      <td className="px-3 py-3"><div className="skeleton h-3 w-14 ml-auto" /></td>
      <td className="px-3 py-3"><div className="skeleton h-3 w-14 ml-auto" /></td>
      <td className="px-3 py-3"><div className="skeleton h-3 w-10 ml-auto" /></td>
      <td className="px-3 py-3"><div className="skeleton h-3 w-10 ml-auto" /></td>
      <td className="px-3 py-3"><div className="skeleton h-3 w-10 ml-auto" /></td>
      <td className="px-3 py-3"><div className="skeleton h-3 w-10 ml-auto" /></td>
      <td className="px-3 py-3"><div className="skeleton h-5 w-16" /></td>
      <td className="px-3 py-3"><div className="skeleton h-3 w-10" /></td>
      <td className="px-3 py-3"><div className="skeleton h-5 w-20" /></td>
    </tr>
  );
}

export default function TokenTable({
  tokens,
  sortBy,
  sortDir,
  onSort,
  onSelectToken,
  loading,
}: TokenTableProps) {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full min-w-[1200px]">
        <thead className="sticky top-0 z-10 bg-[var(--surface)]">
          <tr className="border-b border-[var(--border)]">
            {COLUMNS.map((col) => (
              <th
                key={col.label}
                className={`px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-light)] ${
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                } ${col.field ? 'cursor-pointer hover:text-[var(--foreground)] transition-colors select-none' : ''} ${
                  col.width || ''
                }`}
                onClick={() => col.field && onSort(col.field)}
              >
                <span className={col.field && sortBy === col.field ? 'sort-active' : ''}>
                  {col.label}
                  {col.field && <SortIcon active={sortBy === col.field} dir={sortDir} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 20 }).map((_, i) => <SkeletonRow key={i} index={i} />)
          ) : tokens.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="text-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="20" stroke="var(--border)" strokeWidth="2" />
                    <path d="M16 20h16M16 28h10" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <p className="text-sm text-[var(--muted)]">No tokens match your filters</p>
                  <p className="text-xs text-[var(--muted)]">Try adjusting your filter criteria</p>
                </div>
              </td>
            </tr>
          ) : (
            tokens.map((token, i) => (
              <TokenRow
                key={token.pairAddress}
                token={token}
                index={i}
                onSelect={onSelectToken}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
