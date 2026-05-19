import { describe, expect, it } from 'vitest';
import { calculateElection, oppositionElectionProbability } from './election';
import { standardScenario } from '@/data/scenarios/standard';
import type { GameConfig } from '@/types';

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

describe('oppositionElectionProbability', () => {
  it('1年 (2ターン) で 25%', () => {
    expect(oppositionElectionProbability(2)).toBe(0.25);
  });
  it('2年 (4ターン) で 50%', () => {
    expect(oppositionElectionProbability(4)).toBe(0.5);
  });
  it('3年 (6ターン) で 75%', () => {
    expect(oppositionElectionProbability(6)).toBe(0.75);
  });
  it('4年 (8ターン) で 100% (任期満了)', () => {
    expect(oppositionElectionProbability(8)).toBe(1.0);
  });
});

describe('calculateElection', () => {
  it('議席合計が衆議院定数と一致する', () => {
    const state = standardScenario.createInitialState(baseConfig);
    const result = calculateElection(state, 1);
    const total = Object.values(result.seatsPerParty).reduce((s, v) => s + v, 0);
    expect(total).toBe(baseConfig.houseTotalSeats);
  });

  it('第一党 (rulingPartyId) が決まる', () => {
    const state = standardScenario.createInitialState(baseConfig);
    const result = calculateElection(state, 1);
    expect(result.rulingPartyId).toBeDefined();
    const topSeats = Math.max(...Object.values(result.seatsPerParty));
    const rulingSeats = result.seatsPerParty[result.rulingPartyId!];
    expect(rulingSeats).toBe(topSeats);
  });
});
