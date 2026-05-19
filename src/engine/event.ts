import type { EventScale, GameDataRegistry, GameEvent, GameState, PolicyId } from '@/types';

const LARGE_EVENT_LIMIT_PER_TURN = 1;
const SMALL_EVENT_LIMIT_PER_TURN = 3;
const RECENT_POSITIVE_WINDOW = 3;
const REOCCURRENCE_COOLDOWN_TURNS = 10;

export interface RandomSource {
  /** 0以上1未満 */
  next(): number;
}

export const defaultRandom: RandomSource = {
  next: () => Math.random(),
};

/**
 * 当ターンに発生するイベントIDのリストを返す。
 * - 定例 (scripted) は scheduledTurn/scheduledTurnType に一致するものを必ず採用
 * - 連鎖は pendingChainedEvents から取り出す
 * - その他は trigger.baseProbability で抽選
 * - 大規模1個まで, 小規模3個まで, 定例は別枠
 */
export function rollEventsForTurn(
  state: GameState,
  registry: GameDataRegistry,
  rng: RandomSource = defaultRandom,
): string[] {
  const turn = state.currentTurn;
  const isFirstHalf = turn % 2 === 1;
  const turnType = isFirstHalf ? 'first_half' : 'second_half';

  const fired: string[] = [];
  let largeCount = 0;
  let smallCount = 0;

  const canFire = (scale: EventScale) => {
    if (scale === 'large') return largeCount < LARGE_EVENT_LIMIT_PER_TURN;
    return smallCount < SMALL_EVENT_LIMIT_PER_TURN;
  };
  const markFired = (scale: EventScale) => {
    if (scale === 'large') largeCount += 1;
    else smallCount += 1;
  };

  const allEvents = Object.values(registry.events);

  // 1) 定例 (scripted) — 別枠で必ず発生
  for (const ev of allEvents) {
    if (ev.trigger.type !== 'scripted') continue;
    const sched = ev.trigger.scheduledTurnType;
    const matchesTurnType = !sched || sched === turnType;
    const matchesExactTurn =
      ev.trigger.scheduledTurn === undefined || ev.trigger.scheduledTurn === turn;
    if (matchesTurnType && matchesExactTurn) {
      fired.push(ev.id);
    }
  }

  // 2) 連鎖 (pendingChainedEvents から)
  for (const eid of state.pendingChainedEvents) {
    const ev = registry.events[eid];
    if (!ev) continue;
    if (!canFire(ev.scale)) continue;
    fired.push(eid);
    markFired(ev.scale);
  }

  // 3) その他 — クールダウンチェック + 確率抽選
  const recentlyFired = new Set(
    state.events
      .filter((e) => state.currentTurn - e.occurredAt <= REOCCURRENCE_COOLDOWN_TURNS)
      .map((e) => e.eventId),
  );

  // 政策連動 → 条件付き → 完全ランダム の優先順 (§6.3)
  const orderTypes = ['policy_triggered', 'conditional', 'random'] as const;
  for (const t of orderTypes) {
    for (const ev of allEvents) {
      if (ev.trigger.type !== t) continue;
      if (recentlyFired.has(ev.id)) continue;
      if (!canFire(ev.scale)) continue;
      if (ev.category === 'positive' && !isPositiveCandidate(state, ev, registry)) continue;
      if (t === 'policy_triggered' && !hasRecentLinkedPolicy(state, ev)) continue;
      const prob = ev.trigger.baseProbability ?? 0;
      if (rng.next() < prob) {
        fired.push(ev.id);
        markFired(ev.scale);
      }
    }
  }
  return fired;
}

function isPositiveCandidate(
  state: GameState,
  ev: GameEvent,
  registry: GameDataRegistry,
): boolean {
  // §6.5: ポジティブイベントは関連政策が直近3ターン以内に実行されている場合のみ候補
  // 「関連政策」は MVP では linkedPolicyId、なければ常に候補
  const linked = ev.trigger.linkedPolicyId;
  if (!linked) return true;
  return hasRecentPolicy(state, linked, RECENT_POSITIVE_WINDOW);
  void registry;
}

function hasRecentLinkedPolicy(state: GameState, ev: GameEvent): boolean {
  const linked = ev.trigger.linkedPolicyId;
  if (!linked) return false;
  return hasRecentPolicy(state, linked, RECENT_POSITIVE_WINDOW);
}

function hasRecentPolicy(state: GameState, pid: PolicyId, window: number): boolean {
  const since = state.currentTurn - window;
  return state.policyHistory.some((h) => h.policyId === pid && h.passed && h.turn >= since);
}
