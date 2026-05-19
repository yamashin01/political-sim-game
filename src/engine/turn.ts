import type { GameState, IndicatorChanges, Policy, TurnHistory } from '@/types';
import { applyChanges, combineChanges } from './indicators';
import { advanceTrend, trendEffectsForTurn } from './trend';
import type { GameDataRegistry } from '@/types';

/**
 * 設計書 §11.2 / §11.4: トレンドを進行させ、各トレンドの当ターン影響を合算する
 */
export function processTrends(
  state: GameState,
  registry: GameDataRegistry,
): { newTrends: typeof state.trends; trendChanges: IndicatorChanges } {
  const changes: IndicatorChanges[] = [];
  const newTrends = state.trends.map((ts) => {
    const trend = registry.trends[ts.trendId];
    if (!trend) return ts;
    const advanced = advanceTrend(state, ts, trend);
    changes.push(trendEffectsForTurn(advanced, trend));
    return advanced;
  });
  return { newTrends, trendChanges: combineChanges(...changes) };
}

/**
 * 指標更新フェーズ。当ターンに集まった効果 (政策・イベント・トレンド) を全合算して適用する。
 * §4.2 step 5.
 */
export function applyTurnEffects(
  state: GameState,
  effectsList: IndicatorChanges[],
): GameState {
  const combined = combineChanges(...effectsList);
  return { ...state, indicators: applyChanges(state.indicators, combined) };
}

/**
 * ターン終了時の履歴記録 (§4.2 step 7)。
 * proposedPolicies / events は呼び出し側で必要に応じて埋める。
 */
export function recordTurnHistory(
  state: GameState,
  proposedPolicies: TurnHistory['proposedPolicies'],
  events: TurnHistory['events'],
): GameState {
  const seatsAtEnd: Record<string, number> = {};
  for (const p of state.parties) seatsAtEnd[p.id] = p.seats;
  const newHistory: TurnHistory = {
    turn: state.currentTurn,
    proposedPolicies,
    events,
    indicatorsAtEnd: { ...state.indicators },
    seatsAtEnd,
  };
  return {
    ...state,
    history: { ...state.history, turns: [...state.history.turns, newHistory] },
  };
}

/** ターン番号から「○年目前半/後半」のラベルを返す */
export function turnLabel(turn: number, baseYear = 2026): string {
  const yearIndex = Math.floor((turn - 1) / 2); // 0,0,1,1,2,2,...
  const half = turn % 2 === 1 ? '前半' : '後半';
  return `${yearIndex + 1}年目${half} (${baseYear + yearIndex}年${turn % 2 === 1 ? '1-6月' : '7-12月'})`;
}

export function isFirstHalfTurn(turn: number): boolean {
  return turn % 2 === 1;
}

export function isElectionTurn(state: GameState): boolean {
  // MVP: 任期4年 (8ターン) で必ず選挙、または野党時の確率発動。
  // ここでは「強制発動条件」のみ判定 (確率分は別途処理)。
  const turnsSinceLast = state.currentTurn - state.lastElectionTurn;
  return turnsSinceLast >= 8;
}

/**
 * 議席分布から各党の Party.seats を更新する純粋関数 (選挙結果反映用)。
 */
export function applySeatDistribution(
  state: GameState,
  seatsPerParty: Record<string, number>,
): GameState {
  return {
    ...state,
    parties: state.parties.map((p) => ({ ...p, seats: seatsPerParty[p.id] ?? p.seats })),
  };
}

/** 政策の効果のみ取り出し (即時効果のみMVPで扱う) */
export function immediatePolicyEffects(policy: Policy): IndicatorChanges {
  if (policy.timeliness === 'immediate') return policy.effects;
  // 簡略: short/medium/long も MVP では即時効果として扱う (将来は遅延キューで処理)
  return policy.effects;
}
