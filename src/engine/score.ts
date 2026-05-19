import type { FinalScore, GameState, Policy } from '@/types';
import type { GameDataRegistry } from '@/types';
import { ideologyDeviation } from './ideology';

/**
 * 設計書 §10.3: 総合スコア = 0.5 × 指標平均 + 0.3 × 党理念達成度 + 0.2 × 在任比率
 */
export function calculateFinalScore(state: GameState, registry: GameDataRegistry): FinalScore {
  const ind = state.indicators;
  const indicatorAverage =
    (ind.approval + ind.economy + ind.finance + ind.diplomacy + ind.environment) / 5;

  const playerParty = state.parties.find((p) => p.id === state.playerPartyId);
  let ideologyAchievement = 0;
  if (playerParty) {
    const passedPolicies = state.policyHistory.filter((h) => h.passed);
    if (passedPolicies.length > 0) {
      const aligned = passedPolicies.filter((h) => {
        const policy = registry.policies[h.policyId];
        if (!policy) return false;
        return ideologyDeviation(policy.ideologyDirection, playerParty.ideology) < 1;
      });
      ideologyAchievement = (aligned.length / passedPolicies.length) * 100;
    }
  }

  const inOfficeRatio = (state.inOfficeTurns / state.config.totalTurns) * 100;
  const totalScore =
    0.5 * indicatorAverage + 0.3 * ideologyAchievement + 0.2 * inOfficeRatio;

  return {
    indicatorScores: { ...ind },
    ideologyAchievement,
    inOfficeTurns: state.inOfficeTurns,
    totalScore,
    rank: determineRank(state, indicatorAverage, ideologyAchievement, inOfficeRatio),
    endingType: state.endReason ?? 'normal',
  };
}

/**
 * 設計書 §10.4: エンディング種別と称号を判定する。特殊終了が優先される。
 */
function determineRank(
  state: GameState,
  indicatorAverage: number,
  ideologyAchievement: number,
  inOfficeRatio: number,
): string {
  if (state.endReason === 'scandal_resignation') return '失脚した政治家';
  if (state.endReason === 'coalition_collapse') return '連立崩壊';
  if (state.endReason === 'party_split') return '党分裂';

  const ind = state.indicators;
  const allOver80 =
    ind.approval >= 80 &&
    ind.economy >= 80 &&
    ind.finance >= 80 &&
    ind.diplomacy >= 80 &&
    ind.environment >= 80;
  if (allOver80) return '歴史的名宰相';
  if (ind.economy >= 75 && ind.finance >= 75) return '経済再生の立役者';
  if (ind.environment >= 85) return 'グリーンリーダー';
  if (ideologyAchievement >= 90) return '信念の人';
  if (inOfficeRatio >= 80 && indicatorAverage < 60) return '老獪な政治家';
  return '標準エンディング';
}

/** ポリシー一覧から平均importance (将来用) */
export function averageImportance(policies: Policy[]): number {
  if (policies.length === 0) return 0;
  return policies.reduce((s, p) => s + p.importance, 0) / policies.length;
}
