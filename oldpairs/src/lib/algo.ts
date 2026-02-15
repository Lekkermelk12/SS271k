import { TokenData } from './types';

/**
 * OldPairs Scoring Algorithm
 *
 * Composite 0-100 score built from 7 weighted sub-scores designed to
 * surface the best OG Solana token trading opportunities.
 *
 * Weights:
 *   Volume Momentum   20%  — high vol relative to mcap + acceleration
 *   Buy Pressure      15%  — multi-timeframe buy/sell ratio
 *   Price Action      15%  — multi-timeframe momentum + acceleration
 *   Liquidity Depth   15%  — deeper pools = safer trades
 *   Age Maturity      15%  — established tokens, sweet spot 14-180 days
 *   Capital Efficiency 10% — volume/mcap turnover ratio
 *   Social Proof       10% — socials, website, holder count
 */

export interface AlgoScore {
  total: number;            // 0-100 composite score
  volumeMomentum: number;   // 0-100
  buyPressure: number;      // 0-100
  priceAction: number;      // 0-100
  liquidityDepth: number;   // 0-100
  ageMaturity: number;      // 0-100
  capitalEfficiency: number;// 0-100
  socialProof: number;      // 0-100
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
}

const WEIGHTS = {
  volumeMomentum: 0.20,
  buyPressure: 0.15,
  priceAction: 0.15,
  liquidityDepth: 0.15,
  ageMaturity: 0.15,
  capitalEfficiency: 0.10,
  socialProof: 0.10,
};

// --- Helper: clamp a value between 0 and 100 ---
function clamp(v: number): number {
  return Math.max(0, Math.min(100, v));
}

// --- Helper: logarithmic scale mapping ---
// Maps a value from [minVal, maxVal] to [0, 100] on a log scale
function logScale(value: number, minVal: number, maxVal: number): number {
  if (value <= minVal) return 0;
  if (value >= maxVal) return 100;
  const logMin = Math.log10(Math.max(minVal, 1));
  const logMax = Math.log10(maxVal);
  const logVal = Math.log10(value);
  return clamp(((logVal - logMin) / (logMax - logMin)) * 100);
}

// -------------------------------------------------------------------
// 1. VOLUME MOMENTUM (20%)
//    - Base: log-scaled 24h volume ($1K → $10M)
//    - Bonus: volume acceleration — if recent hour volume extrapolated
//      exceeds 24h average, the token is heating up
// -------------------------------------------------------------------
function scoreVolumeMomentum(token: TokenData): number {
  const vol24h = token.volume?.h24 || 0;
  const vol1h = token.volume?.h1 || 0;

  // Base volume score on log scale
  const baseScore = logScale(vol24h, 1_000, 10_000_000);

  // Acceleration: compare hourly rate to 24h average rate
  // If vol1h * 24 > vol24h, volume is accelerating
  const avgHourly = vol24h / 24;
  let accelBonus = 0;
  if (avgHourly > 0 && vol1h > 0) {
    const accelRatio = vol1h / avgHourly;
    // accelRatio 1.0 = flat, 2.0 = 2x acceleration, etc.
    // Map 1-5x acceleration to 0-30 bonus points
    accelBonus = clamp((accelRatio - 1) * 15);
  }

  return clamp(baseScore * 0.7 + accelBonus + (baseScore > 0 ? 0 : 0));
}

// -------------------------------------------------------------------
// 2. BUY PRESSURE (15%)
//    - Weighted average of buy ratios across timeframes
//    - More recent timeframes weighted higher (m5 > h1 > h6 > h24)
//    - >50% buys = bullish, <50% = bearish
// -------------------------------------------------------------------
function scoreBuyPressure(token: TokenData): number {
  const timeframes = [
    { buys: token.txns?.m5?.buys || 0, sells: token.txns?.m5?.sells || 0, weight: 0.35 },
    { buys: token.txns?.h1?.buys || 0, sells: token.txns?.h1?.sells || 0, weight: 0.30 },
    { buys: token.txns?.h6?.buys || 0, sells: token.txns?.h6?.sells || 0, weight: 0.20 },
    { buys: token.txns?.h24?.buys || 0, sells: token.txns?.h24?.sells || 0, weight: 0.15 },
  ];

  let weightedRatio = 0;
  let totalWeight = 0;

  for (const tf of timeframes) {
    const total = tf.buys + tf.sells;
    if (total > 0) {
      const buyRatio = tf.buys / total; // 0 to 1
      weightedRatio += buyRatio * tf.weight;
      totalWeight += tf.weight;
    }
  }

  if (totalWeight === 0) return 50; // neutral if no data

  const avgRatio = weightedRatio / totalWeight; // 0 to 1, where 0.5 is neutral

  // Map: 0.3 → 0, 0.5 → 50, 0.7+ → 100
  // Exponential curve to reward strong buy pressure
  const normalized = (avgRatio - 0.3) / 0.4; // maps 0.3-0.7 to 0-1
  return clamp(normalized * 100);
}

// -------------------------------------------------------------------
// 3. PRICE ACTION (15%)
//    - Multi-timeframe momentum score
//    - Bonus for consistent direction across timeframes
//    - Bonus for acceleration (short tf > long tf rate)
// -------------------------------------------------------------------
function scorePriceAction(token: TokenData): number {
  const m5 = token.priceChange?.m5 || 0;
  const h1 = token.priceChange?.h1 || 0;
  const h6 = token.priceChange?.h6 || 0;
  const h24 = token.priceChange?.h24 || 0;

  // Normalize each timeframe: map -20% to +50% → 0 to 100
  const norm = (v: number) => clamp(((v + 20) / 70) * 100);

  // Weighted average (recent matters more)
  const momentumScore =
    norm(m5) * 0.20 +
    norm(h1) * 0.30 +
    norm(h6) * 0.25 +
    norm(h24) * 0.25;

  // Consistency bonus: all positive = strong trend
  const allPositive = m5 > 0 && h1 > 0 && h6 > 0 && h24 > 0;
  const consistencyBonus = allPositive ? 15 : 0;

  // Acceleration bonus: short-term outpacing long-term
  let accelBonus = 0;
  if (h1 > 0 && h24 > 0) {
    // Annualize: h1 rate vs h24 rate
    const h1Rate = h1;
    const h24Rate = h24 / 24;
    if (h1Rate > h24Rate * 1.5) {
      accelBonus = clamp((h1Rate / Math.max(h24Rate, 0.01) - 1) * 5);
    }
  }

  return clamp(momentumScore * 0.7 + consistencyBonus + accelBonus);
}

// -------------------------------------------------------------------
// 4. LIQUIDITY DEPTH (15%)
//    - Log-scaled liquidity from $5K to $5M
//    - Bonus for healthy liq/mcap ratio (2%+ is good)
// -------------------------------------------------------------------
function scoreLiquidityDepth(token: TokenData): number {
  const liq = token.liquidity?.usd || 0;
  const mcap = token.marketCap || 0;

  // Base liquidity score
  const baseScore = logScale(liq, 5_000, 5_000_000);

  // Liq/MCap ratio bonus (healthy = 2-10%)
  let ratioBonus = 0;
  if (mcap > 0 && liq > 0) {
    const ratio = (liq / mcap) * 100; // percentage
    if (ratio >= 2 && ratio <= 50) {
      ratioBonus = clamp(ratio * 3); // 2% → 6pts, 10% → 30pts
    }
  }

  return clamp(baseScore * 0.75 + ratioBonus * 0.25);
}

// -------------------------------------------------------------------
// 5. AGE MATURITY (15%)
//    - Sweet spot: 14-180 days (established but still has momentum)
//    - Young (<3d): low score, too new
//    - Moderate (3-14d): building
//    - Prime (14-180d): peak score
//    - Veteran (180-365d): still good, slight decay
//    - Ancient (365d+): gradual further decay
// -------------------------------------------------------------------
function scoreAgeMaturity(token: TokenData): number {
  const ageDays = token.ageMs / 86_400_000;

  if (ageDays < 1) return 5;
  if (ageDays < 3) return 10 + (ageDays / 3) * 15;
  if (ageDays < 7) return 25 + ((ageDays - 3) / 4) * 20;
  if (ageDays < 14) return 45 + ((ageDays - 7) / 7) * 25;
  if (ageDays < 30) return 70 + ((ageDays - 14) / 16) * 20;
  if (ageDays < 90) return 90 + ((ageDays - 30) / 60) * 10;  // 90-100
  if (ageDays < 180) return 100;                               // peak
  if (ageDays < 365) return 100 - ((ageDays - 180) / 185) * 15; // 100→85
  return Math.max(60, 85 - ((ageDays - 365) / 365) * 20);     // slow decay, floor at 60
}

// -------------------------------------------------------------------
// 6. CAPITAL EFFICIENCY (10%)
//    - Volume/MCap ratio (turnover)
//    - Higher turnover = more active interest relative to size
//    - Log-scale: 1% → 0, 10% → 50, 100%+ → 100
// -------------------------------------------------------------------
function scoreCapitalEfficiency(token: TokenData): number {
  const vol24h = token.volume?.h24 || 0;
  const mcap = token.marketCap || 0;

  if (mcap === 0 || vol24h === 0) return 0;

  const turnover = (vol24h / mcap) * 100; // percentage

  // Log scale from 1% to 200%
  return logScale(turnover, 1, 200);
}

// -------------------------------------------------------------------
// 7. SOCIAL PROOF (10%)
//    - Has Twitter: +30
//    - Has Telegram: +20
//    - Has Website: +20
//    - Has holders data: scaled 0-30 based on count
// -------------------------------------------------------------------
function scoreSocialProof(token: TokenData): number {
  let score = 0;

  const socials = token.info?.socials || [];
  const websites = token.info?.websites || [];

  if (socials.some(s => s.type === 'twitter')) score += 30;
  if (socials.some(s => s.type === 'telegram')) score += 20;
  if (websites.length > 0) score += 20;

  // Holder count: log scale 100 → 100K
  if (token.holders && token.holders > 0) {
    score += logScale(token.holders, 100, 100_000) * 0.3;
  }

  return clamp(score);
}

// -------------------------------------------------------------------
// MAIN SCORING FUNCTION
// -------------------------------------------------------------------
export function computeAlgoScore(token: TokenData): AlgoScore {
  const volumeMomentum = scoreVolumeMomentum(token);
  const buyPressure = scoreBuyPressure(token);
  const priceAction = scorePriceAction(token);
  const liquidityDepth = scoreLiquidityDepth(token);
  const ageMaturity = scoreAgeMaturity(token);
  const capitalEfficiency = scoreCapitalEfficiency(token);
  const socialProof = scoreSocialProof(token);

  const total = Math.round(
    volumeMomentum * WEIGHTS.volumeMomentum +
    buyPressure * WEIGHTS.buyPressure +
    priceAction * WEIGHTS.priceAction +
    liquidityDepth * WEIGHTS.liquidityDepth +
    ageMaturity * WEIGHTS.ageMaturity +
    capitalEfficiency * WEIGHTS.capitalEfficiency +
    socialProof * WEIGHTS.socialProof
  );

  let grade: AlgoScore['grade'];
  if (total >= 85) grade = 'S';
  else if (total >= 70) grade = 'A';
  else if (total >= 55) grade = 'B';
  else if (total >= 40) grade = 'C';
  else if (total >= 25) grade = 'D';
  else grade = 'F';

  return {
    total: clamp(total),
    volumeMomentum: Math.round(volumeMomentum),
    buyPressure: Math.round(buyPressure),
    priceAction: Math.round(priceAction),
    liquidityDepth: Math.round(liquidityDepth),
    ageMaturity: Math.round(ageMaturity),
    capitalEfficiency: Math.round(capitalEfficiency),
    socialProof: Math.round(socialProof),
    grade,
  };
}

// Grade color mapping for UI
export function getGradeColor(grade: AlgoScore['grade']): string {
  switch (grade) {
    case 'S': return '#00e676';
    case 'A': return '#69f0ae';
    case 'B': return '#ffd600';
    case 'C': return '#ff9100';
    case 'D': return '#ff5252';
    case 'F': return '#d50000';
  }
}

// Score color: gradient from red (0) → yellow (50) → green (100)
export function getScoreColor(score: number): string {
  if (score >= 70) return '#00e676';
  if (score >= 50) return '#ffd600';
  if (score >= 30) return '#ff9100';
  return '#ff5252';
}

// Sub-score labels for UI
export const SCORE_LABELS: Record<string, string> = {
  volumeMomentum: 'Volume Momentum',
  buyPressure: 'Buy Pressure',
  priceAction: 'Price Action',
  liquidityDepth: 'Liquidity Depth',
  ageMaturity: 'Age Maturity',
  capitalEfficiency: 'Capital Efficiency',
  socialProof: 'Social Proof',
};

export const SCORE_WEIGHTS_DISPLAY: Record<string, number> = {
  volumeMomentum: 20,
  buyPressure: 15,
  priceAction: 15,
  liquidityDepth: 15,
  ageMaturity: 15,
  capitalEfficiency: 10,
  socialProof: 10,
};
