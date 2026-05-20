import { IndicatorDelta } from '@/components/common/IndicatorDelta';
import { MiniSparkline } from '@/components/common/MiniSparkline';
import { Button } from '@/components/ui/button';
import { turnLabel } from '@/engine/turn';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import type { GameState, NationalIndicators } from '@/types';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  /** 「次へ」ボタンの動作 (省略時は非表示) */
  primaryAction?: { label: string; onClick: () => void; disabled?: boolean };
  /** 補助情報 (現在フェーズ等のラベル) */
  hint?: string;
}

export function Layout({ children, primaryAction, hint }: LayoutProps) {
  const state = useGameStore((s) => s.state);
  const lastDelta = useGameStore((s) => s.lastCompletedTurnDelta);
  const setScreen = useUiStore((s) => s.setScreen);
  if (!state) return <>{children}</>;

  const player = state.parties.find((p) => p.id === state.playerPartyId);
  const isInCoalition = state.coalitionPartyIds.includes(state.playerPartyId);
  const position =
    state.coalitionPartyIds.length > 1 && isInCoalition
      ? '連立与党'
      : isInCoalition
        ? '単独与党'
        : '野党';

  const dietLabel = state.currentTurn % 2 === 1 ? '通常国会' : '臨時国会';

  return (
    <div className="min-h-screen flex flex-col text-ink">
      {/* ═════ MASTHEAD ═════════════════════════════════════════════ */}
      <header className="border-b-2 border-ink bg-paper/80 backdrop-blur-[2px]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Edition strip */}
          <div className="flex items-baseline justify-between border-b border-ink/40 py-1.5 text-[10px] smallcaps font-mono tabular">
            <span>VOL. Ⅰ · 政 局 録</span>
            <span className="hidden sm:inline">編集発行 ／ 政局報・編集部</span>
            <span>EDITION 0.1.0</span>
          </div>

          {/* Title row */}
          <div className="flex flex-wrap items-end justify-between gap-3 pt-3 pb-2">
            <div className="flex items-baseline gap-3">
              <span
                className="hanko hidden md:inline-flex relative"
                style={{ width: '2.4rem', height: '2.4rem', fontSize: '0.65rem' }}
              >
                号外
              </span>
              <div>
                <div className="eyebrow eyebrow-red">{dietLabel}</div>
                <h1 className="font-display font-extrabold text-xl sm:text-2xl leading-none tracking-tight">
                  {turnLabel(state.currentTurn, 2026)}
                  <span className="ml-2 text-vermilion">·</span>
                  <span className="ml-2 font-mono tabular text-base text-ink-soft">
                    第{state.currentTurn}号 / 全{state.config.totalTurns}号
                  </span>
                </h1>
              </div>
            </div>

            <div className="flex flex-col items-end text-right text-xs sm:text-sm font-serif-jp">
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-base sm:text-lg">
                  {player?.name ?? '(無名党)'}
                </span>
                <span className="eyebrow !text-[10px]">{position}</span>
              </div>
              <div className="font-mono tabular text-xs text-ink-soft flex gap-4">
                <span>
                  議席 {player?.seats ?? 0}
                  <span className="text-ink-faint">/{state.config.houseTotalSeats}</span>
                </span>
                <span>
                  党資金 ¥{player?.funds ?? 0}
                  <span className="text-ink-faint">億</span>
                </span>
              </div>
            </div>
          </div>

          {/* ═════ INDICATOR TICKER (5 metrics + delta + sparkline) ═════════ */}
          <div className="rule-double pt-2 pb-3">
            <div className="grid grid-cols-5 gap-0 border border-ink/70 bg-paper">
              <IndicatorCell
                label="支持率"
                indicatorKey="approval"
                state={state}
                delta={lastDelta?.approval}
              />
              <IndicatorCell
                label="経済"
                indicatorKey="economy"
                state={state}
                delta={lastDelta?.economy}
              />
              <IndicatorCell
                label="財政"
                indicatorKey="finance"
                state={state}
                delta={lastDelta?.finance}
              />
              <IndicatorCell
                label="外交安保"
                indicatorKey="diplomacy"
                state={state}
                delta={lastDelta?.diplomacy}
              />
              <IndicatorCell
                label="環境"
                indicatorKey="environment"
                state={state}
                delta={lastDelta?.environment}
                last
              />
            </div>
          </div>
        </div>
      </header>

      {/* ═════ MAIN ═════════════════════════════════════════════════ */}
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
          <div className="rise">{children}</div>
        </div>
      </main>

      {/* ═════ FOOTER ═══════════════════════════════════════════════ */}
      <footer className="border-t-2 border-ink bg-paper/85">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setScreen('party_info')}>
              政党情報
            </Button>
            <span className="text-ink/30">|</span>
            <Button variant="ghost" size="sm" onClick={() => setScreen('help')}>
              ヘルプ
            </Button>
          </div>
          <div className="flex items-center gap-4">
            {hint && (
              <span className="font-serif-jp text-xs text-ink-soft italic">
                <span className="text-vermilion mr-1">▸</span>
                {hint}
              </span>
            )}
            {primaryAction && (
              <Button onClick={primaryAction.onClick} disabled={primaryAction.disabled}>
                {primaryAction.label} ▶
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function IndicatorCell({
  label,
  indicatorKey,
  state,
  delta,
  last,
}: {
  label: string;
  indicatorKey: keyof NationalIndicators;
  state: GameState;
  delta?: number;
  last?: boolean;
}) {
  const value = state.indicators[indicatorKey];
  // Heatmap accent: low values lean vermilion, high lean ink-strong
  const rounded = Math.round(value);
  const tone = rounded >= 60 ? 'text-ink' : rounded >= 40 ? 'text-ink-soft' : 'text-vermilion';

  // 過去最大6ターンの推移 + 現在値で sparkline 用データを構築
  const sparkData = [
    ...state.history.turns.slice(-6).map((t) => t.indicatorsAtEnd[indicatorKey]),
    value,
  ];

  return (
    <div className={`px-3 py-1.5 ${last ? '' : 'border-r border-ink/40'} flex flex-col gap-0.5`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display text-[10px] sm:text-xs uppercase tracking-widest text-ink-soft truncate">
          {label}
        </span>
        <IndicatorDelta delta={delta} className="text-[10px]" />
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className={`font-mono tabular font-bold text-base sm:text-lg leading-none ${tone}`}>
          {rounded}
        </span>
        <div className="flex-1 min-w-0 max-w-[60%]">
          <MiniSparkline data={sparkData} height={12} />
        </div>
      </div>
    </div>
  );
}
