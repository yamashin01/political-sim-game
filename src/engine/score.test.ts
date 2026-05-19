import { describe, expect, it } from 'vitest';
import { calculateFinalScore } from './score';
import { standardScenario } from '@/data/scenarios/standard';
import { REGISTRY } from '@/data/registry';
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

describe('calculateFinalScore', () => {
  it('初期状態の総合スコアは指標平均を中心に算出される', () => {
    const state = standardScenario.createInitialState(baseConfig);
    const score = calculateFinalScore(state, REGISTRY);
    // 党理念達成度=0, 在任比率=0, 指標平均は約 46 程度
    // 総合 = 0.5 * 平均 ≈ 23 前後
    expect(score.totalScore).toBeGreaterThan(15);
    expect(score.totalScore).toBeLessThan(35);
  });

  it('全指標80以上なら歴史的名宰相', () => {
    const state = standardScenario.createInitialState(baseConfig);
    state.indicators = { approval: 85, economy: 85, finance: 85, diplomacy: 85, environment: 85 };
    state.inOfficeTurns = 10;
    const score = calculateFinalScore(state, REGISTRY);
    expect(score.rank).toBe('歴史的名宰相');
  });

  it('特殊終了 (失脚) なら称号は固定', () => {
    const state = standardScenario.createInitialState(baseConfig);
    state.endReason = 'scandal_resignation';
    const score = calculateFinalScore(state, REGISTRY);
    expect(score.rank).toBe('失脚した政治家');
  });
});
