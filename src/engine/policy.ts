import type { GameState, Party, PartyId, Policy, PolicyPassageResult } from '@/types';
import { ideologyDeviation } from './ideology';

const UNITY_BONUS_THRESHOLD = 70;
const UNITY_BONUS_DELTA = 0.05;

/**
 * 設計書 §5.4: 必要議席率 = 0.4 + 0.1 × 重要度 + 0.1 × イデオロギー乖離
 * 党結束度 ≥70 のとき必要議席率を 0.05 引き下げる (§12.1)。
 * 特殊条件 (憲法改正等) を持つ政策は specialRequirements.requiredSeatsRatio を優先する。
 */
export function requiredSeatsRatio(policy: Policy, playerParty: Party): number {
  if (policy.specialRequirements?.requiredSeatsRatio !== undefined) {
    return policy.specialRequirements.requiredSeatsRatio;
  }
  const deviation = ideologyDeviation(policy.ideologyDirection, playerParty.ideology);
  let ratio = 0.4 + 0.1 * policy.importance + 0.1 * deviation;
  if ((playerParty.unity ?? 0) >= UNITY_BONUS_THRESHOLD) {
    ratio -= UNITY_BONUS_DELTA;
  }
  return ratio;
}

/**
 * 設計書 §5.4: 実際の支持議席率 = (プレイヤー議席 + Σ連立相手議席) / 衆議院定数
 * プレイヤーが与党の場合は連立メンバー全員、野党の場合はプレイヤー単独の議席のみ。
 */
export function actualSupportRatio(state: GameState): number {
  const houseTotal = state.config.houseTotalSeats;
  const playerParty = findParty(state, state.playerPartyId);
  if (!playerParty) return 0;

  // プレイヤーが与党陣営にいる場合は連立全体、それ以外は単独
  const isPlayerInCoalition = state.coalitionPartyIds.includes(state.playerPartyId);
  if (!isPlayerInCoalition) {
    return playerParty.seats / houseTotal;
  }
  const total = state.coalitionPartyIds.reduce((sum, id) => {
    const p = findParty(state, id);
    return sum + (p?.seats ?? 0);
  }, 0);
  return total / houseTotal;
}

/** 政策通過判定 (設計書 §5.4) */
export function evaluatePolicyPassage(policy: Policy, state: GameState): PolicyPassageResult {
  const playerParty = findParty(state, state.playerPartyId);
  if (!playerParty) {
    return { passed: false, requiredSeatsRatio: 1, actualSupportRatio: 0, ideologyDeviation: 0 };
  }
  const required = requiredSeatsRatio(policy, playerParty);
  const actual = actualSupportRatio(state);
  const deviation = ideologyDeviation(policy.ideologyDirection, playerParty.ideology);
  return {
    passed: actual >= required,
    requiredSeatsRatio: required,
    actualSupportRatio: actual,
    ideologyDeviation: deviation,
  };
}

/**
 * 設計書 §5.5: 党結束度の変化
 *   乖離 > 1 のとき -5 × 乖離
 *   乖離 ≤ 1 のとき +2
 */
export function unityDelta(deviation: number): number {
  return deviation > 1 ? -5 * deviation : 2;
}

function findParty(state: GameState, id: PartyId): Party | undefined {
  return state.parties.find((p) => p.id === id);
}
