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
        // 選挙判定
        const shouldElection = rollOpposition();
        if (shouldElection) {
          triggerElection();
          setScreen('election_result');
          return;
        }
        // 次ターンへ
        const { ended } = advance();
        if (ended) {
          setScreen('ending');
          return;
        }
        // 次ターンのイベントをroll
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
      <div className="space-y-4">
        <ExplanationBox title="メインダッシュボード">
          今ターンの状況を確認し、各フェーズを順に進めます。1ターンは「イベント → 政策 → 予算 →
          党運営」の4フェーズで構成されています。指標やトレンドの推移を見ながら、次にどのフェーズへ進むかを判断してください。
        </ExplanationBox>

        <Card>
          <CardHeader>
            <CardTitle>党の内部状態</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground inline-flex items-center gap-1">
                党結束度
                <InfoTooltip
                  label="党結束度"
                  content="党内の意見の一致度を示す指標 (0-100)。低下しすぎると党分裂のリスクが高まります。"
                />
              </div>
              <div className="flex items-center gap-2">
                <Progress value={player.unity ?? 0} className="flex-1" />
                <span className="font-mono w-10 text-right">{Math.round(player.unity ?? 0)}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground inline-flex items-center gap-1">
                連立健全度
                <InfoTooltip
                  label="連立健全度"
                  content="連立与党時のみ表示される指標 (0-100)。低下しすぎると連立崩壊のリスクが高まります。"
                />
              </div>
              <div className="flex items-center gap-2">
                {state.coalitionPartyIds.includes(state.playerPartyId) ? (
                  <>
                    <Progress value={state.coalitionHealth ?? 0} className="flex-1" />
                    <span className="font-mono w-10 text-right">
                      {Math.round(state.coalitionHealth ?? 0)}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">―</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-1">
              トレンドの進行
              <InfoTooltip
                label="トレンド"
                content="中長期で進行する社会課題。進行度が100に達すると大きな影響イベントが発生します。"
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {state.trends.map((ts) => {
              const trend = REGISTRY.trends[ts.trendId];
              if (!trend) return null;
              return (
                <div key={ts.trendId} className="flex items-center gap-3">
                  <span className="w-32">{trend.name}</span>
                  <Progress value={ts.progress} className="flex-1" />
                  <span className="w-10 text-right font-mono">{Math.round(ts.progress)}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>今ターンの状況</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <div>
              <Badge variant="secondary" className="mr-2">
                ターン {state.currentTurn}/{state.config.totalTurns}
              </Badge>
              <Badge variant="outline">前回選挙: {state.lastElectionTurn} ターン目</Badge>
            </div>
            <div className="text-muted-foreground">
              フッターの「次へ」で各フェーズを進めてください。
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
