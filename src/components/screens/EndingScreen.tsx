import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getFinalScore, useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';

export function EndingScreen() {
  const state = useGameStore((s) => s.state);
  const resetGame = useGameStore((s) => s.resetGame);
  const setScreen = useUiStore((s) => s.setScreen);

  if (!state) return null;

  const score = getFinalScore(state);
  const player = state.parties.find((p) => p.id === state.playerPartyId);

  const reasonLabel = (() => {
    switch (state.endReason) {
      case 'scandal_resignation':
        return '失脚エンド';
      case 'coalition_collapse':
        return '連立崩壊エンド';
      case 'party_split':
        return '党分裂エンド';
      default:
        return '通常終了 (10年間の任期満了)';
    }
  })();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-center">★ ゲーム終了 ★</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="text-center text-muted-foreground">{reasonLabel}</div>
          <div className="text-center text-lg font-semibold">{player?.name ?? 'プレイヤー党'} の最終結果</div>

          <div className="space-y-2">
            <IndicatorBar label="支持率" value={score.indicatorScores.approval} />
            <IndicatorBar label="経済" value={score.indicatorScores.economy} />
            <IndicatorBar label="財政" value={score.indicatorScores.finance} />
            <IndicatorBar label="外交安保" value={score.indicatorScores.diplomacy} />
            <IndicatorBar label="環境" value={score.indicatorScores.environment} />
          </div>

          <div className="border rounded-md p-3 space-y-1">
            <div className="flex justify-between">
              <span>党理念達成度</span>
              <span className="font-mono">{score.ideologyAchievement.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>在任ターン数</span>
              <span className="font-mono">
                {score.inOfficeTurns}/{state.config.totalTurns} (
                {((score.inOfficeTurns / state.config.totalTurns) * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="flex justify-between text-base font-semibold pt-2 border-t mt-2">
              <span>総合スコア</span>
              <span className="font-mono">{score.totalScore.toFixed(1)}</span>
            </div>
          </div>

          <div className="border rounded-md p-4 text-center bg-muted/40">
            <div className="text-xs text-muted-foreground">称号</div>
            <div className="text-xl font-bold mt-1">{score.rank}</div>
          </div>

          <Button
            className="w-full"
            onClick={() => {
              resetGame();
              setScreen('title');
            }}
          >
            タイトルへ戻る
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function IndicatorBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-muted-foreground">{label}</span>
      <Progress value={value} className="flex-1" />
      <span className="w-10 text-right font-mono">{Math.round(value)}</span>
    </div>
  );
}
