import type { ReactNode } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';
import { turnLabel } from '@/engine/turn';

interface LayoutProps {
  children: ReactNode;
  /** 「次へ」ボタンの動作 (省略時は非表示) */
  primaryAction?: { label: string; onClick: () => void; disabled?: boolean };
  /** 補助情報 (現在フェーズ等のラベル) */
  hint?: string;
}

export function Layout({ children, primaryAction, hint }: LayoutProps) {
  const state = useGameStore((s) => s.state);
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b">
        <div className="container max-w-5xl mx-auto py-3 flex flex-wrap items-baseline justify-between gap-2">
          <div className="text-sm sm:text-base">
            <span className="font-semibold">{turnLabel(state.currentTurn, 2026)}</span>
            <span className="ml-2 text-muted-foreground">
              {state.currentTurn % 2 === 1 ? '通常国会期間' : '臨時国会期間'}
            </span>
          </div>
          <div className="text-sm">
            <span className="font-semibold">{player?.name ?? '(無名党)'}</span>
            <span className="ml-2 text-muted-foreground">{position}</span>
            <span className="ml-3">議席: {player?.seats ?? 0}/{state.config.houseTotalSeats}</span>
            <span className="ml-3">党資金: {player?.funds ?? 0}億円</span>
          </div>
        </div>
        <div className="container max-w-5xl mx-auto pb-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs sm:text-sm">
          <IndicatorChip label="支持率" value={state.indicators.approval} />
          <IndicatorChip label="経済" value={state.indicators.economy} />
          <IndicatorChip label="財政" value={state.indicators.finance} />
          <IndicatorChip label="外交安保" value={state.indicators.diplomacy} />
          <IndicatorChip label="環境" value={state.indicators.environment} />
        </div>
      </header>

      <main className="flex-1 container max-w-5xl mx-auto py-4">{children}</main>

      <footer className="border-t">
        <div className="container max-w-5xl mx-auto py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => setScreen('party_info')}>
              政党情報
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setScreen('help')}>
              ヘルプ
            </Button>
          </div>
          <div className="flex items-center gap-3">
            {hint && <span className="text-sm text-muted-foreground">{hint}</span>}
            {primaryAction && (
              <Button onClick={primaryAction.onClick} disabled={primaryAction.disabled}>
                {primaryAction.label}
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function IndicatorChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-md border px-2 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold">{Math.round(value)}</span>
    </div>
  );
}
