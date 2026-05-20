import { REGISTRY } from '@/data/registry';
import { standardScenario } from '@/data/scenarios/standard';
import { formCoalition } from '@/engine/coalition';
import { calculateElection, oppositionElectionProbability } from '@/engine/election';
import { checkSpecialEnd } from '@/engine/end-conditions';
import { rollEventsForTurn } from '@/engine/event';
import { ideologyDeviation } from '@/engine/ideology';
import { applyChanges, clamp, combineChanges } from '@/engine/indicators';
import { evaluatePolicyPassage, unityDelta } from '@/engine/policy';
import { calculateFinalScore } from '@/engine/score';
import {
  applySeatDistribution,
  immediatePolicyEffects,
  processTrends,
  recordTurnHistory,
} from '@/engine/turn';
import type {
  ElectionResult,
  GameConfig,
  GameEvent,
  GameState,
  Ideology,
  IndicatorChanges,
  NationalIndicators,
  PartyId,
  Policy,
  PolicyId,
  TrendState,
  TurnHistory,
} from '@/types';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

const DEFAULT_CONFIG: GameConfig = {
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

interface GameStoreState {
  state: GameState | null;
  /** プレイヤーが今ターンに通そうとしている政策の選択リスト */
  selectedPolicyIds: PolicyId[];
  /** 当ターンで適用予定の効果 (フェーズ間で累積) */
  pendingChanges: IndicatorChanges;
  /** 当ターンで通過した政策の履歴 (UI表示用) */
  turnResults: { policyId: PolicyId; passed: boolean }[];
  /** 当ターンで発生したイベントの履歴 (UI表示用) */
  turnEvents: { eventId: string; choiceId?: string }[];
  /** ターン開始時 (指標更新前) の指標スナップショット。サマリ画面の差分表示用 */
  turnStartIndicators: NationalIndicators | null;
  /** ターン開始時の議席スナップショット */
  turnStartSeats: Record<PartyId, number> | null;
  /** ターン開始時のトレンド進行度スナップショット */
  turnStartTrends: TrendState[] | null;

  startNewGame: (partyName: string, ideology: Ideology) => string[];
  proposePolicies: (policyIds: PolicyId[]) => { policyId: PolicyId; passed: boolean }[];
  resolveEvent: (eventId: string, choiceId?: string) => void;
  applyTurnIndicators: () => void;
  advanceToNextTurn: () => { ended: boolean };
  triggerElection: () => ElectionResult | null;
  /** 設計書 §8.2 野党時の選挙発動確率を判定 */
  rollOppositionElection: () => boolean;
  selectPolicy: (id: PolicyId) => void;
  unselectPolicy: (id: PolicyId) => void;
  clearSelectedPolicies: () => void;
  resetGame: () => void;
}

function snapshotSeats(state: GameState): Record<PartyId, number> {
  const seats: Record<PartyId, number> = {};
  for (const p of state.parties) seats[p.id] = p.seats;
  return seats;
}

export const useGameStore = create<GameStoreState>()(
  immer((set, get) => ({
    state: null,
    selectedPolicyIds: [],
    pendingChanges: {},
    turnResults: [],
    turnEvents: [],
    turnStartIndicators: null,
    turnStartSeats: null,
    turnStartTrends: null,

    startNewGame: (partyName, ideology) => {
      const initial = standardScenario.createInitialState(DEFAULT_CONFIG);
      const playerIdx = initial.parties.findIndex((p) => p.id === initial.playerPartyId);
      if (playerIdx >= 0) {
        const player = initial.parties[playerIdx];
        if (player) {
          initial.parties[playerIdx] = { ...player, name: partyName, ideology };
        }
      }
      set((draft) => {
        draft.state = initial;
        draft.selectedPolicyIds = [];
        draft.pendingChanges = {};
        draft.turnResults = [];
        draft.turnEvents = [];
        draft.turnStartIndicators = { ...initial.indicators };
        draft.turnStartSeats = snapshotSeats(initial);
        draft.turnStartTrends = initial.trends.map((t) => ({ ...t }));
      });
      // 初回ターンのイベント発生判定
      const eventIds = rollEventsForTurn(initial, REGISTRY);
      return eventIds;
    },

    selectPolicy: (id) =>
      set((draft) => {
        if (draft.selectedPolicyIds.includes(id)) return;
        if (draft.selectedPolicyIds.length >= 3) return;
        draft.selectedPolicyIds.push(id);
      }),
    unselectPolicy: (id) =>
      set((draft) => {
        draft.selectedPolicyIds = draft.selectedPolicyIds.filter((x) => x !== id);
      }),
    clearSelectedPolicies: () => set((draft) => void (draft.selectedPolicyIds = [])),

    proposePolicies: (policyIds) => {
      const current = get().state;
      if (!current) return [];
      const results: { policyId: PolicyId; passed: boolean }[] = [];
      const accumulatedChanges: IndicatorChanges[] = [];
      let unityChange = 0;

      const playerParty = current.parties.find((p) => p.id === current.playerPartyId);

      for (const pid of policyIds) {
        const policy: Policy | undefined = REGISTRY.policies[pid];
        if (!policy) continue;
        const result = evaluatePolicyPassage(policy, current);
        results.push({ policyId: pid, passed: result.passed });
        if (result.passed) {
          accumulatedChanges.push(immediatePolicyEffects(policy));
        }
        if (playerParty) {
          const dev = ideologyDeviation(policy.ideologyDirection, playerParty.ideology);
          unityChange += unityDelta(dev);
        }
      }

      set((draft) => {
        if (!draft.state) return;
        // 履歴に追加
        for (const r of results) {
          draft.state.policyHistory.push({
            policyId: r.policyId,
            turn: draft.state.currentTurn,
            passed: r.passed,
          });
        }
        // 結束度更新
        const player = draft.state.parties.find((p) => p.id === draft.state?.playerPartyId);
        if (player) {
          player.unity = clamp((player.unity ?? 0) + unityChange);
        }
        // pendingChanges に積む
        draft.pendingChanges = combineChanges(draft.pendingChanges, ...accumulatedChanges);
        draft.turnResults = results;
        draft.selectedPolicyIds = [];
      });

      return results;
    },

    resolveEvent: (eventId, choiceId) => {
      const current = get().state;
      if (!current) return;
      const event: GameEvent | undefined = REGISTRY.events[eventId];
      if (!event) return;

      const changes: IndicatorChanges[] = [];
      if (event.immediateEffects) changes.push(event.immediateEffects);
      if (choiceId && event.choices) {
        const choice = event.choices.find((c) => c.id === choiceId);
        if (choice) changes.push(choice.effects);
      }

      set((draft) => {
        if (!draft.state) return;
        draft.state.events.push({
          eventId,
          occurredAt: draft.state.currentTurn,
          resolvedChoiceId: choiceId,
        });
        if (event.chainedEventIds && event.chainedEventIds.length > 0) {
          draft.state.pendingChainedEvents.push(...event.chainedEventIds);
        }
        draft.turnEvents.push({ eventId, choiceId });
        draft.pendingChanges = combineChanges(draft.pendingChanges, ...changes);
      });
    },

    applyTurnIndicators: () => {
      set((draft) => {
        if (!draft.state) return;
        const { newTrends, trendChanges } = processTrends(draft.state, REGISTRY);
        draft.state.trends = newTrends;
        const combined = combineChanges(draft.pendingChanges, trendChanges);
        draft.state.indicators = applyChanges(draft.state.indicators, combined);
        // 在任カウント
        if (draft.state.coalitionPartyIds.includes(draft.state.playerPartyId)) {
          draft.state.inOfficeTurns += 1;
        }
        draft.pendingChanges = {};
      });
    },

    rollOppositionElection: () => {
      const current = get().state;
      if (!current) return false;
      const isRuling = current.coalitionPartyIds.includes(current.playerPartyId);
      const turnsSince = current.currentTurn - current.lastElectionTurn;
      if (isRuling) return turnsSince >= 8; // 任期満了
      const prob = oppositionElectionProbability(turnsSince);
      return Math.random() < prob;
    },

    triggerElection: () => {
      const current = get().state;
      if (!current) return null;
      const election = calculateElection(current, current.currentTurn);
      const formation = formCoalition(current, election);

      set((draft) => {
        if (!draft.state) return;
        draft.state = applySeatDistribution(draft.state, election.seatsPerParty);
        draft.state.rulingPartyId = election.rulingPartyId;
        draft.state.coalitionPartyIds = formation.coalitionPartyIds;
        draft.state.coalitionHealth = formation.coalitionHealth;
        draft.state.lastElectionTurn = draft.state.currentTurn;
        draft.state.history.elections.push({
          ...election,
          coalitionPartyIds: formation.coalitionPartyIds,
        });
      });
      return election;
    },

    advanceToNextTurn: () => {
      const current = get().state;
      if (!current) return { ended: false };

      // 当ターン履歴を記録
      const turnResults = get().turnResults;
      const turnEvents = get().turnEvents;
      const proposed: TurnHistory['proposedPolicies'] = turnResults.map((r) => ({
        policyId: r.policyId,
        passed: r.passed,
      }));
      const events: TurnHistory['events'] = turnEvents.map((e) => ({
        eventId: e.eventId,
        ...(e.choiceId !== undefined && { choiceId: e.choiceId }),
      }));

      // 終了判定
      const endReason = checkSpecialEnd(current);
      const isFinalTurn = current.currentTurn >= current.config.totalTurns;
      const ended = !!endReason || isFinalTurn;

      set((draft) => {
        if (!draft.state) return;
        // 履歴記録
        draft.state = recordTurnHistory(draft.state, proposed, events);
        if (ended) {
          draft.state.isEnded = true;
          draft.state.endReason = endReason ?? 'normal';
        } else {
          draft.state.currentTurn += 1;
          if (draft.state.currentTurn % 2 === 1) {
            // 前半ターン (奇数) は年が進む
            draft.state.currentYear += 1;
          }
        }
        draft.turnResults = [];
        draft.turnEvents = [];
        draft.selectedPolicyIds = [];
        draft.pendingChanges = {};
        // 次ターン開始時点のスナップショットを保存 (サマリ画面の差分表示用)
        if (!ended) {
          draft.turnStartIndicators = { ...draft.state.indicators };
          draft.turnStartSeats = snapshotSeats(draft.state);
          draft.turnStartTrends = draft.state.trends.map((t) => ({ ...t }));
        }
      });

      return { ended };
    },

    resetGame: () =>
      set((draft) => {
        draft.state = null;
        draft.selectedPolicyIds = [];
        draft.pendingChanges = {};
        draft.turnResults = [];
        draft.turnEvents = [];
        draft.turnStartIndicators = null;
        draft.turnStartSeats = null;
        draft.turnStartTrends = null;
      }),
  })),
);

/** スコア計算 (純粋。状態を変更しない) */
export function getFinalScore(state: GameState) {
  return calculateFinalScore(state, REGISTRY);
}
