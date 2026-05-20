import { ExplanationBox } from '@/components/common/ExplanationBox';
import { InfoTooltip } from '@/components/common/InfoTooltip';
import { Layout } from '@/components/common/Layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { REGISTRY } from '@/data/registry';
import { rollEventsForTurn } from '@/engine/event';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import { useEffect, useState } from 'react';

export function ElectionResultScreen() {
  const state = useGameStore((s) => s.state);
  const turnStartSeats = useGameStore((s) => s.turnStartSeats);
  const advance = useGameStore((s) => s.advanceToNextTurn);
  const setScreen = useUiStore((s) => s.setScreen);
  const setPhase = useUiStore((s) => s.setPhase);
  const enqueueEvents = useUiStore((s) => s.enqueueEvents);

  if (!state) return null;

  const majority = state.config.majorityThreshold;
  const houseTotal = state.config.houseTotalSeats;

  const handleNext = () => {
    // 過半数判定: 連立で過半数 or 第一党単独過半数 でなければ連立画面へ
    const coalition = state.coalitionPartyIds;
    const coalitionSeats = coalition.reduce((s, id) => {
      return s + (state.parties.find((p) => p.id === id)?.seats ?? 0);
    }, 0);

    if (coalition.length > 1 && coalitionSeats >= majority) {
      // 連立で過半数を確保: 連立画面で結果表示
      setScreen('coalition');
      return;
    }
    if (
      coalition.length === 1 &&
      (state.parties.find((p) => p.id === coalition[0])?.seats ?? 0) >= majority
    ) {
      // 単独過半数: 次ターンへ進む
      proceedToNextTurn();
      return;
    }
    // 過半数未達: 連立画面
    setScreen('coalition');
  };

  const proceedToNextTurn = () => {
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

  return (
    <Layout primaryAction={{ label: '次へ', onClick: handleNext }}>
      <ExplanationBox title="選挙結果">
        衆議院議員総選挙の結果です。獲得議席は次ターン以降の政策通過力に直結します。過半数 (
        {majority}議席)
        を獲得できた党は単独政権を、できなかった場合は連立交渉に進みます。議席増減は支持率や経済などの指標から導かれます。
      </ExplanationBox>

      <Card>
        <CardHeader>
          <CardTitle>選挙結果 — 衆議院議員総選挙</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm inline-flex items-center gap-1">
            過半数ライン: <span className="font-mono">{majority}</span> / 定数{' '}
            <span className="font-mono">{houseTotal}</span>
            <InfoTooltip
              label="過半数"
              content="衆議院定数の半数+1 (= 233議席) が過半数の目安です。単独過半数を取れば単独政権を組めます。"
            />
          </div>

          <div className="space-y-2">
            {state.parties
              .slice()
              .sort((a, b) => {
                // プレイヤー党を最上段に固定、それ以外は議席数で降順
                if (a.isPlayer) return -1;
                if (b.isPlayer) return 1;
                return b.seats - a.seats;
              })
              .map((p, idx) => {
                const seats = p.seats;
                // turnStartSeats は当ターン開始時 (= 選挙前) のスナップショット。
                // triggerElection 後の history.elections.last は新議席と同値のため使えない。
                const previous = turnStartSeats?.[p.id] ?? 0;
                return (
                  <PartySeatRow
                    key={p.id}
                    name={p.name}
                    isPlayer={p.isPlayer}
                    previousSeats={previous}
                    finalSeats={seats}
                    houseTotal={houseTotal}
                    majority={majority}
                    delayMs={idx * 120}
                  />
                );
              })}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}

interface PartySeatRowProps {
  name: string;
  isPlayer: boolean;
  previousSeats: number;
  finalSeats: number;
  houseTotal: number;
  majority: number;
  delayMs: number;
}

/**
 * 議席数を「前回 → 今回」へカウントアップアニメで表示する行。
 * - 開始まで delayMs 待機 (順番に開く演出)
 * - 800ms かけて requestAnimationFrame で数値補間
 * - 過半数到達党には hanko 風スタンプ
 */
function PartySeatRow({
  name,
  isPlayer,
  previousSeats,
  finalSeats,
  houseTotal,
  majority,
  delayMs,
}: PartySeatRowProps) {
  const [displaySeats, setDisplaySeats] = useState(previousSeats);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // setTimeout のコールバック内の return は useEffect の cleanup として扱われないため、
    // rafId を useEffect スコープに持ち上げ、cleanup で両方キャンセルする。
    // アンマウント後の setDisplaySeats 呼び出し (React 警告 / メモリリーク) を防ぐ。
    let rafId = 0;
    const startTimer = setTimeout(() => {
      setRevealed(true);
      const durationMs = 800;
      const startTime = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - startTime) / durationMs);
        // easeOutQuad
        const eased = 1 - (1 - t) ** 2;
        const value = Math.round(previousSeats + (finalSeats - previousSeats) * eased);
        setDisplaySeats(value);
        if (t < 1) rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }, delayMs);
    return () => {
      clearTimeout(startTimer);
      cancelAnimationFrame(rafId);
    };
  }, [delayMs, previousSeats, finalSeats]);

  const delta = finalSeats - previousSeats;
  const reachedMajority = finalSeats >= majority;

  return (
    <div className={`space-y-1 ${isPlayer ? 'border-l-2 border-vermilion pl-3 -ml-3' : ''}`}>
      <div className="flex justify-between text-sm items-center gap-2">
        <span className={`flex items-baseline gap-2 ${isPlayer ? 'font-semibold' : ''}`}>
          {name}
          {isPlayer && (
            <Badge variant="secondary" className="ml-1">
              あなた
            </Badge>
          )}
          {reachedMajority && (
            <span
              className="hanko relative inline-flex shrink-0"
              style={{
                width: '2.2rem',
                height: '2.2rem',
                fontSize: '0.6rem',
                marginLeft: '0.25rem',
              }}
            >
              過半数
            </span>
          )}
        </span>
        <span className="font-mono tabular flex items-baseline gap-2">
          <span className="text-base font-bold">{displaySeats} 議席</span>
          {revealed && delta !== 0 && (
            <span
              className={`text-xs font-bold animate-in fade-in slide-in-from-right-2 duration-300 ${
                delta > 0 ? 'text-ink' : 'text-vermilion'
              }`}
            >
              ({delta > 0 ? '+' : ''}
              {delta})
            </span>
          )}
        </span>
      </div>
      <Progress value={(displaySeats / houseTotal) * 100} />
    </div>
  );
}
