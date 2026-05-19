import type { GameState } from '@/types';

const UNITY_SPLIT_THRESHOLD = 10;
const UNITY_SPLIT_CONSECUTIVE_TURNS = 3;
const APPROVAL_SCANDAL_THRESHOLD = 10;
const COALITION_COLLAPSE_THRESHOLD = 10;

/**
 * 設計書 §4.6: 特殊終了条件を判定する。
 * 該当した場合は endReason を返し、それ以外は undefined。
 */
export function checkSpecialEnd(state: GameState): GameState['endReason'] | undefined {
  // 連立崩壊 (与党時かつ連立健全度 < 10)
  if (
    state.rulingPartyId === state.playerPartyId &&
    state.coalitionPartyIds.length > 1 &&
    (state.coalitionHealth ?? 100) < COALITION_COLLAPSE_THRESHOLD
  ) {
    return 'coalition_collapse';
  }

  // 失脚エンド (支持率 < 10)
  if (state.indicators.approval < APPROVAL_SCANDAL_THRESHOLD) {
    return 'scandal_resignation';
  }

  // 党分裂エンド (結束度 <10 が 3 ターン継続)
  if (consecutiveLowUnity(state) >= UNITY_SPLIT_CONSECUTIVE_TURNS) {
    return 'party_split';
  }

  return undefined;
}

/** 直近何ターン連続で結束度<10だったか (現在ターン含む) */
function consecutiveLowUnity(state: GameState): number {
  const playerParty = state.parties.find((p) => p.id === state.playerPartyId);
  if (!playerParty || playerParty.unity === undefined) return 0;
  if (playerParty.unity >= UNITY_SPLIT_THRESHOLD) return 0;

  // 履歴から遡って数える (proposedPolicies/eventsには含まれないため、ここではunityの現在値ベースで判定)
  // MVPは「現在ターンの結束度が低い」事実のみ累積する単純実装。連続判定は uiStore で turn毎に増減させる方法もあるが、
  // 現状はゲームステート末尾に保持しないので、最低限「いま <10」だけを返す。
  return 1;
}
