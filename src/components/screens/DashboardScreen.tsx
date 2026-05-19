import { ExplanationBox } from '@/components/common/ExplanationBox';
import { InfoTooltip } from '@/components/common/InfoTooltip';
import { Layout } from '@/components/common/Layout';
import { REGISTRY } from '@/data/registry';
import { rollEventsForTurn } from '@/engine/event';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import type { ReactNode } from 'react';

const PHASE_ORDER = ['event', 'policy', 'budget', 'wrap_up'] as const;
const PHASE_LABELS: Record<(typeof PHASE_ORDER)[number], string> = {
  event: 'イベント',
  policy: '政 策',
  budget: '予 算',
  wrap_up: '党 運 営',
};
const PHASE_NUMERAL: Record<(typeof PHASE_ORDER)[number], string> = {
  event: '一',
  policy: '二',
  budget: '三',
  wrap_up: '四',
};

export function DashboardScreen() {
  const state = useGameStore((s) => s.state);
  const triggerElection = useGameStore((s) => s.triggerElection);
  const rollOpposition = useGameStore((s) => s.rollOppositionElection);
  const advance = useGameStore((s) => s.advanceToNextTurn);
  const applyTurn = useGameStore((s) => s.applyTurnIndicators);
  const setScreen = useUiStore((s) => s.setScreen);
  const setPhase = useUiStore((s) => s.setPhase);
  const enqueueEvents = useUiStore((s) => s.enqueueEvents);
  const currentPhase = useUiStore((s) => s.currentPhase);
  const queue = useUiStore((s) => s.pendingEventQueue);

  if (!state) return null;
  const player = state.parties.find((p) => p.id === state.playerPartyId);
  if (!player) return null;

  const handleNext = () => {
    switch (currentPhase) {
      case 'event': {
        if (queue.length > 0) {
          setScreen('event');
          return;
        }
        setPhase('policy');
        setScreen('policy');
        return;
      }
      case 'policy':
        setPhase('budget');
        setScreen('budget');
        return;
      case 'budget':
        setPhase('wrap_up');
        applyTurn();
        return;
      case 'wrap_up': {
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
        return;
      }
    }
  };

  const phaseLabel = (() => {
    switch (currentPhase) {
      case 'event':
        return queue.length > 0 ? `イベント (残${queue.length})` : 'イベント (該当なし)';
      case 'policy':
        return '政策フェーズ';
      case 'budget':
        return '予算フェーズ';
      case 'wrap_up':
        return '指標更新済み — ターン終了へ';
    }
  })();

  const phaseIdx = PHASE_ORDER.indexOf(currentPhase);

  const isInCoalition = state.coalitionPartyIds.includes(state.playerPartyId);

  return (
    <Layout
      hint={`フェーズ: ${phaseLabel}`}
      primaryAction={{
        label:
          currentPhase === 'event'
            ? queue.length > 0
              ? 'イベント対応へ'
              : '政策フェーズへ'
            : currentPhase === 'policy'
              ? '予算フェーズへ'
              : currentPhase === 'budget'
                ? '指標更新へ'
                : 'ターン終了',
        onClick: handleNext,
      }}
    >
      {/* ─── PAGE HEADLINE ───────────────────────────────────────── */}
      <div className="rise rule-thick border-b-0 pb-1 flex items-baseline justify-between text-[10px] smallcaps font-mono tabular">
        <span>第一面 · 政 局</span>
        <span className="text-vermilion">本日の議事</span>
        <span>FRONT PAGE</span>
      </div>
      <div className="rise rise-d1 rule-double-b mb-6 pt-3 pb-4 flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow eyebrow-red mb-1">政 局 一 面</div>
          <h1 className="headline text-3xl sm:text-5xl leading-none">今期、舵を取る。</h1>
        </div>
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="font-display text-xs tracking-widest text-ink-faint">在任ターン</span>
          <span className="font-mono tabular text-3xl font-bold leading-none">
            {state.currentTurn}
            <span className="text-ink-faint text-base">/{state.config.totalTurns}</span>
          </span>
        </div>
      </div>

      {/* ─── PHASE STEPPER (歩み) ─────────────────────────────────── */}
      <section className="rise rise-d2 mb-8">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="eyebrow">本日の議事日程</h2>
          <span className="font-serif-jp text-xs italic text-ink-soft">
            フェーズは順に進行します
          </span>
        </div>
        <ol className="grid grid-cols-4 gap-0 border border-ink">
          {PHASE_ORDER.map((p, i) => {
            const isActive = currentPhase === p;
            const isPast = phaseIdx > i;
            return (
              <li
                key={p}
                className={`relative px-3 py-3 ${i < 3 ? 'border-r border-ink' : ''} ${
                  isActive
                    ? 'bg-ink text-paper'
                    : isPast
                      ? 'bg-paper-deep text-ink-soft line-through decoration-1'
                      : 'bg-paper text-ink'
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <span
                    className={`font-display font-bold text-xs ${
                      isActive ? 'text-vermilion' : isPast ? 'text-ink-faint' : 'text-vermilion'
                    }`}
                  >
                    第{PHASE_NUMERAL[p]}章
                  </span>
                  {isActive && (
                    <span className="font-mono text-[10px] tracking-widest text-paper/70">
                      ▶ NOW
                    </span>
                  )}
                </div>
                <div className="font-display font-bold text-base sm:text-lg mt-0.5 tracking-wide">
                  {PHASE_LABELS[p]}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ─── EDITORIAL EXPLANATION ──────────────────────────────── */}
      <div className="rise rise-d2">
        <ExplanationBox title="政局録の読み方" kicker="編集主幹より">
          今ターンの状況を確認し、各フェーズを順に進めます。1ターンは「
          <strong>イベント → 政策 → 予算 → 党運営</strong>」の4章で構成されます。
          指標やトレンドの推移を読みながら、次の一手を判断してください。
        </ExplanationBox>
      </div>

      {/* ─── COLUMN LAYOUT: trends + party state ─────────────────── */}
      <div className="rise rise-d3 grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,360px)] gap-8">
        {/* LEFT COLUMN: trends as news ledger */}
        <section>
          <header className="flex items-baseline gap-3 border-b-2 border-ink pb-2 mb-4">
            <span className="font-display font-bold text-vermilion text-xs tabular tracking-widest">
              【 国 内 】
            </span>
            <h2 className="font-display font-bold text-xl">
              トレンドの進行
              <InfoTooltip
                label="トレンド"
                content="中長期で進行する社会課題。進行度が100に達すると大きな影響イベントが発生します。"
              />
            </h2>
            <span className="ml-auto font-serif-jp italic text-xs text-ink-soft">— 編集部調べ</span>
          </header>
          <ol className="space-y-3">
            {state.trends.map((ts, idx) => {
              const trend = REGISTRY.trends[ts.trendId];
              if (!trend) return null;
              const v = Math.round(ts.progress);
              return (
                <li
                  key={ts.trendId}
                  className="grid grid-cols-[2rem_8rem_1fr_3.5rem] items-center gap-3 border-b border-dashed border-ink/40 pb-2"
                >
                  <span className="font-display font-bold text-vermilion text-xs tabular">
                    №{String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="font-display font-bold text-sm leading-tight">{trend.name}</span>
                  <div className="relative h-2 bg-paper-deep border border-ink/50">
                    <div
                      className="absolute inset-y-0 left-0 bg-ink"
                      style={{ width: `${Math.max(0, Math.min(100, v))}%` }}
                    />
                    {/* tick marks */}
                    <div className="absolute inset-y-0 left-1/4 w-px bg-ink/30" />
                    <div className="absolute inset-y-0 left-1/2 w-px bg-vermilion" />
                    <div className="absolute inset-y-0 left-3/4 w-px bg-ink/30" />
                  </div>
                  <span className="font-mono tabular font-bold text-right text-sm">
                    {v}
                    <span className="text-ink-faint text-xs">/100</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        {/* RIGHT COLUMN: party internals */}
        <aside className="lg:border-l lg:border-ink/40 lg:pl-6 space-y-6">
          <section>
            <header className="flex items-baseline gap-3 border-b border-ink pb-1 mb-3">
              <span className="font-display font-bold text-vermilion text-xs tabular tracking-widest">
                【 党 内 】
              </span>
              <h2 className="font-display font-bold text-base">党 の 体 力</h2>
            </header>
            <div className="space-y-4">
              <MetricRow
                label="党結束度"
                tooltip={
                  <>
                    党内の意見の一致度を示す指標 (0-100)。
                    低下しすぎると党分裂のリスクが高まります。
                  </>
                }
                value={Math.round(player.unity ?? 0)}
              />
              <MetricRow
                label="連立健全度"
                tooltip={
                  <>
                    連立与党時のみ表示される指標 (0-100)。
                    低下しすぎると連立崩壊のリスクが高まります。
                  </>
                }
                value={isInCoalition ? Math.round(state.coalitionHealth ?? 0) : null}
                emptyLabel="― 野党につき非該当"
              />
            </div>
          </section>

          <section>
            <header className="flex items-baseline gap-3 border-b border-ink pb-1 mb-3">
              <span className="font-display font-bold text-vermilion text-xs tabular tracking-widest">
                【 記 録 】
              </span>
              <h2 className="font-display font-bold text-base">期 の 記 録</h2>
            </header>
            <dl className="font-serif-jp text-sm space-y-1.5">
              <div className="flex items-baseline justify-between border-b border-dashed border-ink/30 pb-1">
                <dt className="text-ink-soft">ターン</dt>
                <dd className="font-mono tabular font-bold">
                  {state.currentTurn}
                  <span className="text-ink-faint text-xs"> / {state.config.totalTurns}</span>
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-b border-dashed border-ink/30 pb-1">
                <dt className="text-ink-soft">前回選挙</dt>
                <dd className="font-mono tabular">
                  {state.lastElectionTurn}
                  <span className="text-ink-faint text-xs"> ターン目</span>
                </dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-ink-soft">議事進行</dt>
                <dd className="font-display text-vermilion font-bold tracking-wide">
                  {phaseLabel}
                </dd>
              </div>
            </dl>
          </section>

          <div className="border-t border-dashed border-ink/40 pt-3 text-[11px] font-serif-jp italic text-ink-faint leading-relaxed">
            ＊ フッターの「次へ」で各フェーズを進行できます。各章で行った選択は、
            ターン終了時に指標へ反映されます。
          </div>
        </aside>
      </div>

      {/* ─── BOTTOM RULE ─────────────────────────────────────────── */}
      <div className="rise rise-d4 mt-10 pt-3 border-t-2 border-ink flex items-baseline justify-between text-[10px] smallcaps font-mono tabular text-ink-faint">
        <span>政 局 報 · 第一面 · 編集部</span>
        <span className="font-display tracking-widest">❖ ❖ ❖</span>
        <span>本紙の見方は「ヘルプ」を参照</span>
      </div>
    </Layout>
  );
}

interface MetricRowProps {
  label: string;
  tooltip: ReactNode;
  value: number | null;
  emptyLabel?: string;
}

function MetricRow({ label, tooltip, value, emptyLabel }: MetricRowProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-display font-bold text-sm inline-flex items-center">
          {label}
          <InfoTooltip label={label} content={tooltip} />
        </span>
        {value !== null ? (
          <span className="font-mono tabular font-bold text-lg leading-none">
            {value}
            <span className="text-ink-faint text-xs">/100</span>
          </span>
        ) : (
          <span className="font-serif-jp text-xs text-ink-faint italic">{emptyLabel}</span>
        )}
      </div>
      {value !== null && (
        <div className="relative h-2 bg-paper-deep border border-ink/50">
          <div
            className="absolute inset-y-0 left-0 bg-vermilion"
            style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          />
        </div>
      )}
    </div>
  );
}
