import type { GameState, IndicatorChanges, PolicyId, Trend, TrendState } from '@/types';
import { BALANCE } from '@/data/balance';
import { clamp } from './indicators';

const RECENT_TURNS_FOR_SUPPRESSION = 5;

/** 政策が直近Nターン以内に通過しているか */
function isPolicyRecentlyPassed(
  state: GameState,
  policyId: PolicyId,
  windowTurns: number,
): boolean {
  const since = state.currentTurn - windowTurns;
  return state.policyHistory.some(
    (h) => h.policyId === policyId && h.passed && h.turn >= since,
  );
}

/**
 * 設計書 §11.3: 抑制係数。対抗政策が直近5ターン以内に1つ以上実行されていれば τ_suppress、それ以外は 1.0。
 */
export function suppressionFactor(state: GameState, trend: Trend): number {
  for (const pid of trend.counterPolicyIds) {
    if (isPolicyRecentlyPassed(state, pid, RECENT_TURNS_FOR_SUPPRESSION)) {
      return BALANCE.tauSuppress;
    }
  }
  return 1.0;
}

/** 設計書 §11.2: 新進行度 = clamp(進行度 + 基準進行量 × 抑制係数, 0, 100) */
export function advanceTrend(state: GameState, trendState: TrendState, trend: Trend): TrendState {
  const factor = suppressionFactor(state, trend);
  const next = trendState.progress + trend.baseAdvancePerTurn * factor;
  return { ...trendState, progress: clamp(next) };
}

/** 設計書 §11.4: 当ターンの影響 = (進行度 / 100) × perTurnEffects */
export function trendEffectsForTurn(trendState: TrendState, trend: Trend): IndicatorChanges {
  const scale = trendState.progress / 100;
  const out: IndicatorChanges = {};
  for (const key of Object.keys(trend.perTurnEffects) as (keyof IndicatorChanges)[]) {
    const v = trend.perTurnEffects[key];
    if (v !== undefined) out[key] = v * scale;
  }
  return out;
}
