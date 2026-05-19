import type { ElectionResult, GameState, Party, PartyId } from '@/types';
import { ideologyDistance } from './ideology';

const MAX_IDEOLOGY_DISTANCE_DIVISOR = 7;

/** 設計書 §9.4: 連立成立率 = max(0, 1 - 距離 / 7) */
export function coalitionSuccessRate(distance: number): number {
  return Math.max(0, 1 - distance / MAX_IDEOLOGY_DISTANCE_DIVISOR);
}

/** 設計書 §9.5: 連立健全度の初期値 = 80 - 距離 × 5 (複数党時は距離の平均) */
export function initialCoalitionHealth(distances: number[]): number {
  if (distances.length === 0) return 100;
  const avg = distances.reduce((s, d) => s + d, 0) / distances.length;
  return Math.max(0, Math.min(100, 80 - avg * 5));
}

export interface CoalitionFormation {
  coalitionPartyIds: PartyId[];
  coalitionHealth: number;
  isPlayerInCoalition: boolean;
}

/**
 * 設計書 §9.3: 第一党を起点に、イデオロギー距離が近い党から順に過半数まで連立を組む。
 * 各候補は成立率の判定を経るが、MVPでは決定的に「距離が近い順にそのまま採用」する。
 * 単独過半数のときは連立交渉を行わない (rulingPartyのみ)。
 */
export function formCoalition(
  state: GameState,
  election: ElectionResult,
): CoalitionFormation {
  const houseTotal = state.config.houseTotalSeats;
  const majority = state.config.majorityThreshold;
  const rulingId = election.rulingPartyId;
  if (!rulingId) {
    return { coalitionPartyIds: [], coalitionHealth: 0, isPlayerInCoalition: false };
  }
  const rulingParty = state.parties.find((p) => p.id === rulingId);
  if (!rulingParty) {
    return { coalitionPartyIds: [], coalitionHealth: 0, isPlayerInCoalition: false };
  }
  const rulingSeats = election.seatsPerParty[rulingId] ?? 0;
  if (rulingSeats >= majority) {
    // 単独過半数
    return {
      coalitionPartyIds: [rulingId],
      coalitionHealth: 100,
      isPlayerInCoalition: rulingId === state.playerPartyId,
    };
  }

  // 候補党をイデオロギー距離順にソート
  const candidates: { party: Party; distance: number; seats: number }[] = state.parties
    .filter((p) => p.id !== rulingId)
    .map((p) => ({
      party: p,
      distance: ideologyDistance(rulingParty.ideology, p.ideology),
      seats: election.seatsPerParty[p.id] ?? 0,
    }))
    .sort((a, b) => a.distance - b.distance);

  const members: PartyId[] = [rulingId];
  const distances: number[] = [];
  let total = rulingSeats;
  for (const c of candidates) {
    if (total >= majority) break;
    // 成立率は今のところ採否ロジックには使わず (MVPは決定的)、健全度の素材として距離を貯める
    members.push(c.party.id);
    distances.push(c.distance);
    total += c.seats;
  }

  // 過半数到達できなかった場合は少数与党 (rulingPartyのみ) として返す。
  // 設計書 §9.9: どの党とも連立成立せず → 少数与党
  if (total < majority) {
    return {
      coalitionPartyIds: [rulingId],
      coalitionHealth: 50,
      isPlayerInCoalition: rulingId === state.playerPartyId,
    };
  }

  const health = initialCoalitionHealth(distances);
  return {
    coalitionPartyIds: members,
    coalitionHealth: health,
    isPlayerInCoalition: members.includes(state.playerPartyId),
  };
  // houseTotal は将来用 (参考情報)
  void houseTotal;
}
