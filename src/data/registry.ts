import type {
  GameDataRegistry,
  GameEvent,
  GameState,
  Policy,
  WinCondition,
} from '@/types';
import { calculateFinalScore } from '@/engine/score';
import { ADMINISTRATION_POLICIES } from './policies/administration';
import { DIPLOMACY_DEFENSE_POLICIES } from './policies/diplomacy-defense';
import { ECONOMY_INDUSTRY_POLICIES } from './policies/economy-industry';
import { EDUCATION_SCIENCE_POLICIES } from './policies/education-science';
import { ENVIRONMENT_ENERGY_POLICIES } from './policies/environment-energy';
import { TAX_FINANCE_POLICIES } from './policies/tax-finance';
import { WELFARE_POLICIES } from './policies/welfare';
import { DISASTER_EVENTS } from './events/disaster';
import { ECONOMIC_SHOCK_EVENTS } from './events/economic-shock';
import { INTERNATIONAL_EVENTS } from './events/international';
import { POSITIVE_EVENTS } from './events/positive';
import { SCANDAL_EVENTS } from './events/scandal';
import { SCHEDULED_EVENTS } from './events/scheduled';
import { NPC_PARTIES, createPlayerParty } from './parties';
import { REGIONS } from './regions';
import { standardScenario } from './scenarios/standard';
import { TRENDS } from './trends';

const ALL_POLICIES: Policy[] = [
  ...TAX_FINANCE_POLICIES,
  ...ECONOMY_INDUSTRY_POLICIES,
  ...WELFARE_POLICIES,
  ...EDUCATION_SCIENCE_POLICIES,
  ...ENVIRONMENT_ENERGY_POLICIES,
  ...DIPLOMACY_DEFENSE_POLICIES,
  ...ADMINISTRATION_POLICIES,
];

const ALL_EVENTS: GameEvent[] = [
  ...INTERNATIONAL_EVENTS,
  ...DISASTER_EVENTS,
  ...SCANDAL_EVENTS,
  ...ECONOMIC_SHOCK_EVENTS,
  ...POSITIVE_EVENTS,
  ...SCHEDULED_EVENTS,
];

function toMap<T extends { id: string }>(items: T[]): Record<string, T> {
  const map: Record<string, T> = {};
  for (const item of items) {
    if (map[item.id]) {
      console.error(`Duplicate id detected: ${item.id}`);
    }
    map[item.id] = item;
  }
  return map;
}

const compositeScoreWinCondition: WinCondition = {
  type: 'composite_score',
  evaluate: (state: GameState) => calculateFinalScore(state, REGISTRY),
};

const partiesTemplate = [createPlayerParty('プレイヤー党', { economic: 0, social: 0, diplomatic: 0 }), ...NPC_PARTIES];

export const REGISTRY: GameDataRegistry = {
  policies: toMap(ALL_POLICIES),
  events: toMap(ALL_EVENTS),
  trends: toMap(TRENDS),
  parties: toMap(partiesTemplate),
  regions: toMap(REGIONS),
  scenarios: { [standardScenario.id]: standardScenario },
  winConditions: { composite_score: compositeScoreWinCondition } as GameDataRegistry['winConditions'],
};

/** 起動時のデータ整合性チェック (緩め — 不整合は console.warn) */
export function validateRegistry(registry: GameDataRegistry): string[] {
  const errors: string[] = [];
  for (const policy of Object.values(registry.policies)) {
    for (const eff of policy.sideEffects ?? []) {
      if (eff.type === 'event_probability' || eff.type === 'trigger_event') {
        if (!registry.events[eff.targetId]) {
          errors.push(`Policy ${policy.id} references missing event: ${eff.targetId}`);
        }
      } else if (eff.type === 'policy_unlock' || eff.type === 'policy_lock') {
        if (!registry.policies[eff.targetId]) {
          errors.push(`Policy ${policy.id} references missing policy: ${eff.targetId}`);
        }
      }
    }
  }
  for (const ev of Object.values(registry.events)) {
    for (const cid of ev.chainedEventIds ?? []) {
      if (!registry.events[cid]) errors.push(`Event ${ev.id} chains missing event: ${cid}`);
    }
    if (ev.trigger.linkedPolicyId && !registry.policies[ev.trigger.linkedPolicyId]) {
      errors.push(`Event ${ev.id} links missing policy: ${ev.trigger.linkedPolicyId}`);
    }
  }
  for (const tr of Object.values(registry.trends)) {
    for (const pid of tr.counterPolicyIds) {
      if (!registry.policies[pid]) errors.push(`Trend ${tr.id} counter missing policy: ${pid}`);
    }
  }
  return errors;
}
