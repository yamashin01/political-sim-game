import { describe, expect, it } from 'vitest';
import { evaluatePolicyPassage, requiredSeatsRatio, unityDelta } from './policy';
import { standardScenario } from '@/data/scenarios/standard';
import type { GameConfig, Party, Policy } from '@/types';

const baseConfig: GameConfig = {
  scenario: 'standard',
  totalTurns: 20,
  turnDurationMonths: 6,
  houseTotalSeats: 465,
  majorityThreshold: 233,
  electionTargets: ['house_of_reps'],
  startingPosition: 'opposition_first',
  winConditionType: 'composite_score',
  difficulty: 'normal',
  playerCount: 1,
};

function makePolicy(importance: 1 | 2 | 3, ideology = { economic: 0, social: 0, diplomatic: 0 }): Policy {
  return {
    id: 'TEST',
    name: 'test',
    category: 'administration',
    importance,
    ideologyDirection: ideology,
    timeliness: 'immediate',
    budgetCost: 0,
    effects: {},
    educationalNote: '',
  };
}

const neutralPlayer: Party = {
  id: 'player',
  name: 'X',
  isPlayer: true,
  ideology: { economic: 0, social: 0, diplomatic: 0 },
  seats: 110,
  funds: 60,
  unity: 60,
  approvalByRegion: {},
};

describe('requiredSeatsRatio', () => {
  it('重要度1・乖離0で 0.5', () => {
    expect(requiredSeatsRatio(makePolicy(1), neutralPlayer)).toBeCloseTo(0.5);
  });
  it('重要度2・乖離0で 0.6', () => {
    expect(requiredSeatsRatio(makePolicy(2), neutralPlayer)).toBeCloseTo(0.6);
  });
  it('重要度3・乖離2で 0.9', () => {
    const p = makePolicy(3, { economic: 2, social: 2, diplomatic: 2 });
    expect(requiredSeatsRatio(p, neutralPlayer)).toBeCloseTo(0.9);
  });
  it('結束度70以上のとき必要議席率が0.05下がる (重要度1・乖離0で 0.45)', () => {
    const player = { ...neutralPlayer, unity: 75 };
    expect(requiredSeatsRatio(makePolicy(1), player)).toBeCloseTo(0.45);
  });
  it('specialRequirements.requiredSeatsRatio が優先される', () => {
    const p: Policy = {
      ...makePolicy(1),
      specialRequirements: { requiredSeatsRatio: 0.67 },
    };
    expect(requiredSeatsRatio(p, neutralPlayer)).toBe(0.67);
  });
});

describe('evaluatePolicyPassage', () => {
  it('野党単独で議席率が低い場合は否決', () => {
    const state = standardScenario.createInitialState(baseConfig);
    // プレイヤーは連立外 (野党)
    state.coalitionPartyIds = ['minji', 'komei'];
    const policy = makePolicy(1);
    const result = evaluatePolicyPassage(policy, state);
    expect(result.passed).toBe(false);
    expect(result.actualSupportRatio).toBeLessThan(result.requiredSeatsRatio);
  });

  it('連立で過半数あれば通過', () => {
    const state = standardScenario.createInitialState(baseConfig);
    // プレイヤーを単独与党に置換 (議席を過半数まで盛る)
    const player = state.parties.find((p) => p.id === state.playerPartyId);
    if (player) player.seats = 300;
    state.rulingPartyId = state.playerPartyId;
    state.coalitionPartyIds = [state.playerPartyId];
    const policy = makePolicy(1);
    const result = evaluatePolicyPassage(policy, state);
    expect(result.passed).toBe(true);
  });
});

describe('unityDelta', () => {
  it('乖離 ≤1 のとき +2', () => {
    expect(unityDelta(0)).toBe(2);
    expect(unityDelta(1)).toBe(2);
  });
  it('乖離 >1 のとき -5×乖離', () => {
    expect(unityDelta(1.5)).toBe(-7.5);
    expect(unityDelta(2)).toBe(-10);
  });
});
