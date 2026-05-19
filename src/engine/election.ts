import type {
  ElectionResult,
  GameState,
  Party,
  PartyId,
  Region,
  RegionId,
  TurnNumber,
} from '@/types';
import { BALANCE } from '@/data/balance';

/**
 * 設計書 §8.3: 党のウェイト = 地方支持率 × (1 + 経済情勢補正)
 *   与党:   +(経済 - 50) × α_ruling
 *   連立党: +(経済 - 50) × α_coalition
 *   野党:   -(経済 - 50) × α_opposition
 */
function economicCorrection(state: GameState, partyId: PartyId): number {
  const economyDelta = state.indicators.economy - 50;
  const isRuling = state.rulingPartyId === partyId;
  const isCoalition = state.coalitionPartyIds.includes(partyId) && !isRuling;
  if (isRuling) return economyDelta * BALANCE.alphaRuling;
  if (isCoalition) return economyDelta * BALANCE.alphaCoalition;
  return -economyDelta * BALANCE.alphaOpposition;
}

function partyWeightInRegion(state: GameState, party: Party, regionId: RegionId): number {
  const approval = party.approvalByRegion[regionId] ?? 0;
  const correction = economicCorrection(state, party.id);
  return Math.max(0, approval * (1 + correction));
}

/**
 * 地方ブロックごとに議席を割り当てる。
 * 設計書 §8.3: round(地方の総議席 × 党のウェイト / 全党のウェイト合計)
 * 端数は最大ウェイトの党に集約 (§8.7)。
 */
function allocateRegionSeats(
  state: GameState,
  region: Region,
): Record<PartyId, number> {
  const weights: { id: PartyId; weight: number }[] = state.parties.map((p) => ({
    id: p.id,
    weight: partyWeightInRegion(state, p, region.id),
  }));
  const total = weights.reduce((s, w) => s + w.weight, 0);
  const result: Record<PartyId, number> = {};
  for (const p of state.parties) result[p.id] = 0;

  if (total <= 0) {
    // 防御的に均等分配
    const each = Math.floor(region.totalSeats / state.parties.length);
    let remainder = region.totalSeats - each * state.parties.length;
    for (const p of state.parties) {
      result[p.id] = each + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder -= 1;
    }
    return result;
  }

  let assigned = 0;
  let maxWeight = -Infinity;
  let maxId: PartyId = weights[0]?.id ?? '';
  for (const w of weights) {
    const seats = Math.round((region.totalSeats * w.weight) / total);
    result[w.id] = seats;
    assigned += seats;
    if (w.weight > maxWeight) {
      maxWeight = w.weight;
      maxId = w.id;
    }
  }
  // 端数調整 (最大ウェイトの党に寄せる)
  const diff = region.totalSeats - assigned;
  if (diff !== 0) {
    result[maxId] = (result[maxId] ?? 0) + diff;
    if ((result[maxId] ?? 0) < 0) result[maxId] = 0;
  }
  return result;
}

/** 設計書 §8: 全地方の議席を合算 */
export function calculateElection(state: GameState, turn: TurnNumber): ElectionResult {
  const seatsPerParty: Record<PartyId, number> = {};
  for (const p of state.parties) seatsPerParty[p.id] = 0;

  for (const region of state.regions) {
    const regionSeats = allocateRegionSeats(state, region);
    for (const [pid, seats] of Object.entries(regionSeats)) {
      seatsPerParty[pid] = (seatsPerParty[pid] ?? 0) + seats;
    }
  }

  // 第一党を仮の rulingPartyId とする (連立判定は coalition.ts で実施)
  let topPartyId: PartyId | undefined;
  let topSeats = -1;
  for (const [pid, seats] of Object.entries(seatsPerParty)) {
    if (seats > topSeats) {
      topSeats = seats;
      topPartyId = pid;
    }
  }

  return {
    turn,
    seatsPerParty,
    rulingPartyId: topPartyId,
    coalitionPartyIds: topPartyId ? [topPartyId] : [],
  };
}

/**
 * 設計書 §8.2: 野党時の選挙発動確率 (前回選挙からの経過ターン数による)。
 */
export function oppositionElectionProbability(turnsSinceLast: number): number {
  if (turnsSinceLast >= 8) return 1.0;
  if (turnsSinceLast >= 6) return 0.75;
  if (turnsSinceLast >= 4) return 0.5;
  if (turnsSinceLast >= 2) return 0.25;
  return 0;
}
