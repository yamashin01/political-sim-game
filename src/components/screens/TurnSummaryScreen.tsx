import { ExplanationBox } from '@/components/common/ExplanationBox';
import { Layout } from '@/components/common/Layout';
import { REGISTRY } from '@/data/registry';
import { oppositionElectionProbability } from '@/engine/election';
import { rollEventsForTurn } from '@/engine/event';
import { turnLabel } from '@/engine/turn';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import type { IndicatorChanges, NationalIndicators, TrendState } from '@/types';

const INDICATOR_LABELS: { key: keyof NationalIndicators; label: string }[] = [
  { key: 'approval', label: '支持率' },
  { key: 'economy', label: '経済' },
  { key: 'finance', label: '財政' },
  { key: 'diplomacy', label: '外交安保' },
  { key: 'environment', label: '環境' },
];

const EFFECT_LABEL_MAP: Record<string, string> = {
  approval: '支持',
  economy: '経済',
  finance: '財政',
  diplomacy: '外交',
  environment: '環境',
};

export function TurnSummaryScreen() {
  const state = useGameStore((s) => s.state);
  const turnStartIndicators = useGameStore((s) => s.turnStartIndicators);
  const turnStartTrends = useGameStore((s) => s.turnStartTrends);
  const turnResults = useGameStore((s) => s.turnResults);
  const turnEvents = useGameStore((s) => s.turnEvents);
  const triggerElection = useGameStore((s) => s.triggerElection);
  const rollOpposition = useGameStore((s) => s.rollOppositionElection);
  const advance = useGameStore((s) => s.advanceToNextTurn);
  const setScreen = useUiStore((s) => s.setScreen);
  const setPhase = useUiStore((s) => s.setPhase);
  const enqueueEvents = useUiStore((s) => s.enqueueEvents);

  if (!state) return null;

  const handleNext = () => {
    const shouldElection = rollOpposition();
    if (shouldElection) {
      triggerElection();
      setScreen('election_result');
      return;
    }
    const { ended } = advance();
    if (ended) {
      setScreen('ending');
      return;
    }
    const nextState = useGameStore.getState().state;
    if (nextState) {
      const events = rollEventsForTurn(nextState, REGISTRY);
      enqueueEvents(events);
    }
    setPhase('event');
    setScreen('dashboard');
  };

  const startTrendMap = new Map<string, TrendState>(
    (turnStartTrends ?? []).map((t) => [t.trendId, t]),
  );

  const isRuling = state.coalitionPartyIds.includes(state.playerPartyId);
  const turnsSinceLastElection = state.currentTurn - state.lastElectionTurn;
  const electionHint = isRuling
    ? turnsSinceLastElection >= 8
      ? '任期満了 — 次号で総選挙が確定'
      : `任期満了まで ${8 - turnsSinceLastElection} ターン`
    : `選挙発動見込み: 約 ${Math.round(oppositionElectionProbability(turnsSinceLastElection) * 100)}%`;

  const nextTurnNumber = state.currentTurn + 1;
  const isFinalTurn = state.currentTurn >= state.config.totalTurns;

  return (
    <Layout
      hint="ターン総括"
      primaryAction={{
        label: isFinalTurn ? '結果発表へ' : '次号へ',
        onClick: handleNext,
      }}
    >
      {/* ─── PAGE HEADLINE ──────────────────────────────────────── */}
      <div className="rise rule-thick border-b-0 pb-1 flex items-baseline justify-between text-[10px] smallcaps font-mono tabular">
        <span>号 外 · 政 局 報</span>
        <span className="text-vermilion">本日の総括</span>
        <span>EXTRA EDITION</span>
      </div>
      <div className="rise rise-d1 rule-double-b mb-6 pt-3 pb-4 flex items-end justify-between gap-4">
        <div className="flex items-end gap-4">
          <span
            className="hanko relative shrink-0"
            style={{ width: '3.2rem', height: '3.2rem', fontSize: '0.8rem' }}
          >
            号外
          </span>
          <div>
            <div className="eyebrow eyebrow-red mb-1">第 {state.currentTurn} 号 · 総 括</div>
            <h1 className="headline text-3xl sm:text-5xl leading-none">今期、決した。</h1>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="font-display text-xs tracking-widest text-ink-faint">対象期間</span>
          <span className="font-serif-jp text-sm">{turnLabel(state.currentTurn, 2026)}</span>
        </div>
      </div>

      <ExplanationBox title="本日の総括の読み方" kicker="編集主幹より">
        当ターンに起きたことを「号外」として総括します。指標の変化・通過した政策・対応イベント・トレンド進行を1ページで確認できます。「次号へ」を押すと選挙判定や次ターンの準備に進みます。
      </ExplanationBox>

      {/* ─── COLUMN LAYOUT ─────────────────────────────────────── */}
      <div className="rise rise-d2 grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,360px)] gap-8 mt-6">
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          {/* ━━━ 一面: 指標の動き ━━━ */}
          <section>
            <header className="flex items-baseline gap-3 border-b-2 border-ink pb-2 mb-4">
              <span className="font-display font-bold text-vermilion text-xs tabular tracking-widest">
                【 一 面 】
              </span>
              <h2 className="font-display font-bold text-xl">指標の動き</h2>
              <span className="ml-auto font-serif-jp italic text-xs text-ink-soft">
                — ターン開始時 → 終了時
              </span>
            </header>
            <ol className="space-y-2">
              {INDICATOR_LABELS.map(({ key, label }) => {
                const before = Math.round(turnStartIndicators?.[key] ?? state.indicators[key]);
                const after = Math.round(state.indicators[key]);
                const delta = after - before;
                return (
                  <li
                    key={key}
                    className="grid grid-cols-[8rem_3.5rem_1rem_3.5rem_1fr] items-baseline gap-2 border-b border-dashed border-ink/40 pb-2"
                  >
                    <span className="font-display font-bold text-sm">{label}</span>
                    <span className="font-mono tabular text-right text-ink-soft">{before}</span>
                    <span className="text-ink-faint text-center">→</span>
                    <span className="font-mono tabular font-bold text-right text-base">
                      {after}
                    </span>
                    <DeltaBadge delta={delta} />
                  </li>
                );
              })}
            </ol>
          </section>

          {/* ━━━ 政策面 ━━━ */}
          <section>
            <header className="flex items-baseline gap-3 border-b-2 border-ink pb-2 mb-4">
              <span className="font-display font-bold text-vermilion text-xs tabular tracking-widest">
                【 政 策 面 】
              </span>
              <h2 className="font-display font-bold text-xl">議事録</h2>
            </header>
            {turnResults.length === 0 ? (
              <p className="font-serif-jp text-sm text-ink-soft italic">
                — 当ターン、提出された政策はありません。
              </p>
            ) : (
              <ul className="space-y-3">
                {turnResults.map((r) => {
                  const policy = REGISTRY.policies[r.policyId];
                  return (
                    <li
                      key={r.policyId}
                      className="flex items-start gap-4 border-b border-dashed border-ink/40 pb-3"
                    >
                      <span
                        className="hanko relative shrink-0"
                        style={{
                          width: '2.6rem',
                          height: '2.6rem',
                          fontSize: '0.95rem',
                          borderColor: r.passed ? 'hsl(var(--vermilion))' : 'hsl(var(--ink-faint))',
                          color: r.passed ? 'hsl(var(--vermilion))' : 'hsl(var(--ink-faint))',
                        }}
                      >
                        {r.passed ? '可' : '否'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-bold text-base">
                          {policy?.name ?? r.policyId}
                        </div>
                        {policy && (
                          <div className="font-mono tabular text-xs text-ink-soft mt-0.5">
                            {r.passed
                              ? formatEffects(policy.effects) || '— 効果なし'
                              : '議席不足等のため否決 (効果は発生せず)'}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* ━━━ 事件面 ━━━ */}
          <section>
            <header className="flex items-baseline gap-3 border-b-2 border-ink pb-2 mb-4">
              <span className="font-display font-bold text-vermilion text-xs tabular tracking-widest">
                【 事 件 面 】
              </span>
              <h2 className="font-display font-bold text-xl">本日の動き</h2>
            </header>
            {turnEvents.length === 0 ? (
              <p className="font-serif-jp text-sm text-ink-soft italic">
                — 当ターン、特筆すべき事件はありません。
              </p>
            ) : (
              <ul className="space-y-3">
                {turnEvents.map((e, idx) => {
                  const event = REGISTRY.events[e.eventId];
                  const choice =
                    e.choiceId && event?.choices
                      ? event.choices.find((c) => c.id === e.choiceId)
                      : undefined;
                  const effects: IndicatorChanges = {
                    ...(event?.immediateEffects ?? {}),
                    ...(choice?.effects ?? {}),
                  };
                  return (
                    <li
                      key={`${e.eventId}-${idx}`}
                      className="border-b border-dashed border-ink/40 pb-3"
                    >
                      <div className="font-display font-bold text-base">
                        {event?.name ?? e.eventId}
                      </div>
                      {choice && (
                        <div className="font-serif-jp text-sm mt-1">
                          対応: <span className="font-bold">{choice.label}</span>
                        </div>
                      )}
                      <div className="font-mono tabular text-xs text-ink-soft mt-1">
                        {formatEffects(effects) || '— 直接効果なし'}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <aside className="lg:border-l lg:border-ink/40 lg:pl-6 space-y-8">
          {/* ━━━ 経済面: トレンド進行 ━━━ */}
          <section>
            <header className="flex items-baseline gap-3 border-b border-ink pb-1 mb-3">
              <span className="font-display font-bold text-vermilion text-xs tabular tracking-widest">
                【 経 済 面 】
              </span>
              <h2 className="font-display font-bold text-base">トレンドの進行</h2>
            </header>
            <ol className="space-y-3">
              {state.trends.map((ts) => {
                const trend = REGISTRY.trends[ts.trendId];
                if (!trend) return null;
                const before = Math.round(startTrendMap.get(ts.trendId)?.progress ?? ts.progress);
                const after = Math.round(ts.progress);
                const delta = after - before;
                return (
                  <li key={ts.trendId} className="border-b border-dashed border-ink/40 pb-2">
                    <div className="flex items-baseline justify-between">
                      <span className="font-display font-bold text-sm">{trend.name}</span>
                      <span className="font-mono tabular text-xs">
                        <span className="text-ink-soft">{before}</span>
                        <span className="text-ink-faint mx-1">→</span>
                        <span className="font-bold">{after}</span>
                      </span>
                    </div>
                    <div className="relative h-1.5 bg-paper-deep border border-ink/50 mt-1">
                      {/* 前ターン位置 (薄) */}
                      <div
                        className="absolute inset-y-0 left-0 bg-ink/30"
                        style={{ width: `${Math.max(0, Math.min(100, before))}%` }}
                      />
                      {/* 今ターン位置 (濃) */}
                      <div
                        className="absolute inset-y-0 left-0 bg-ink"
                        style={{ width: `${Math.max(0, Math.min(100, after))}%` }}
                      />
                    </div>
                    <div className="mt-1 text-right">
                      <DeltaBadge delta={delta} inverted />
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* ━━━ 次期予告 ━━━ */}
          {!isFinalTurn && (
            <section>
              <header className="flex items-baseline gap-3 border-b border-ink pb-1 mb-3">
                <span className="font-display font-bold text-vermilion text-xs tabular tracking-widest">
                  【 次 期 予 告 】
                </span>
                <h2 className="font-display font-bold text-base">次号の予定</h2>
              </header>
              <dl className="font-serif-jp text-sm space-y-1.5">
                <div className="flex items-baseline justify-between border-b border-dashed border-ink/30 pb-1">
                  <dt className="text-ink-soft">次ターン</dt>
                  <dd className="font-mono tabular">
                    第 {nextTurnNumber} 号
                    <span className="text-ink-faint text-xs"> / 全{state.config.totalTurns}号</span>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-b border-dashed border-ink/30 pb-1">
                  <dt className="text-ink-soft">期間</dt>
                  <dd className="font-serif-jp text-xs">{turnLabel(nextTurnNumber, 2026)}</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-ink-soft">選挙動向</dt>
                  <dd className="font-display text-vermilion font-bold tracking-wide text-xs">
                    {electionHint}
                  </dd>
                </div>
              </dl>
            </section>
          )}

          {isFinalTurn && (
            <section>
              <header className="flex items-baseline gap-3 border-b border-ink pb-1 mb-3">
                <span className="font-display font-bold text-vermilion text-xs tabular tracking-widest">
                  【 終 報 】
                </span>
                <h2 className="font-display font-bold text-base">最終号</h2>
              </header>
              <p className="font-serif-jp text-sm leading-relaxed">
                本号をもって 10 年間の政局報は最終号となります。
                「結果発表へ」より総合スコアと称号をご確認ください。
              </p>
            </section>
          )}
        </aside>
      </div>

      {/* ─── BOTTOM RULE ─────────────────────────────────────── */}
      <div className="rise rise-d3 mt-10 pt-3 border-t-2 border-ink flex items-baseline justify-between text-[10px] smallcaps font-mono tabular text-ink-faint">
        <span>政 局 報 · 号 外 · 編集部</span>
        <span className="font-display tracking-widest">❖ ❖ ❖</span>
        <span>次号は「次号へ」より発刊</span>
      </div>
    </Layout>
  );
}

interface DeltaBadgeProps {
  delta: number;
  /** トレンド向け: 増加が「悪い」場合に色を反転 */
  inverted?: boolean;
}

function DeltaBadge({ delta, inverted }: DeltaBadgeProps) {
  if (delta === 0) {
    return <span className="font-mono tabular text-xs text-ink-faint">─ 0</span>;
  }
  const isPositive = delta > 0;
  // 通常の指標: 上昇=良い(墨色), 下降=悪い(朱)
  // トレンド: 上昇=悪化(朱), 下降=改善(墨)
  const isBad = inverted ? isPositive : !isPositive;
  const arrow = isPositive ? '▲' : '▼';
  const sign = isPositive ? '+' : '';
  return (
    <span
      className={`font-mono tabular text-xs font-bold ${isBad ? 'text-vermilion' : 'text-ink'}`}
    >
      {arrow} {sign}
      {delta}
    </span>
  );
}

function formatEffects(eff: IndicatorChanges): string {
  return Object.entries(eff)
    .filter(([, v]) => v !== undefined && v !== 0)
    .map(([k, v]) => `${EFFECT_LABEL_MAP[k] ?? k}${(v as number) > 0 ? '+' : ''}${v}`)
    .join(' / ');
}
