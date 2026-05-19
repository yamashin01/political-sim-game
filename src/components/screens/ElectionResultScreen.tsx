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

export function ElectionResultScreen() {
  const state = useGameStore((s) => s.state);
  const advance = useGameStore((s) => s.advanceToNextTurn);
  const setScreen = useUiStore((s) => s.setScreen);
  const setPhase = useUiStore((s) => s.setPhase);
  const enqueueEvents = useUiStore((s) => s.enqueueEvents);

  if (!state) return null;

  const lastElection = state.history.elections[state.history.elections.length - 1];
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
              .sort((a, b) => b.seats - a.seats)
              .map((p) => {
                const seats = p.seats;
                const previous = lastElection?.seatsPerParty[p.id] ?? 0;
                const delta = seats - previous;
                return (
                  <div key={p.id} className="space-y-1">
                    <div className="flex justify-between text-sm items-baseline">
                      <span className={p.isPlayer ? 'font-semibold' : ''}>
                        {p.name}
                        {p.isPlayer && (
                          <Badge variant="secondary" className="ml-2">
                            あなた
                          </Badge>
                        )}
                      </span>
                      <span className="font-mono">
                        {seats} 議席
                        {delta !== 0 && (
                          <span
                            className={`ml-1 text-xs ${delta > 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            ({delta > 0 ? '+' : ''}
                            {delta})
                          </span>
                        )}
                      </span>
                    </div>
                    <Progress value={(seats / houseTotal) * 100} />
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
