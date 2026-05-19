import { ExplanationBox } from '@/components/common/ExplanationBox';
import { InfoTooltip } from '@/components/common/InfoTooltip';
import { Layout } from '@/components/common/Layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { REGISTRY } from '@/data/registry';
import { rollEventsForTurn } from '@/engine/event';
import { ideologyDistance } from '@/engine/ideology';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';

export function CoalitionScreen() {
  const state = useGameStore((s) => s.state);
  const advance = useGameStore((s) => s.advanceToNextTurn);
  const setScreen = useUiStore((s) => s.setScreen);
  const setPhase = useUiStore((s) => s.setPhase);
  const enqueueEvents = useUiStore((s) => s.enqueueEvents);

  if (!state) return null;

  const rulingId = state.rulingPartyId;
  const rulingParty = state.parties.find((p) => p.id === rulingId);
  const coalitionParties = state.coalitionPartyIds
    .map((id) => state.parties.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p);
  const coalitionSeats = coalitionParties.reduce((s, p) => s + p.seats, 0);
  const isPlayerInCoalition = state.coalitionPartyIds.includes(state.playerPartyId);

  const handleNext = () => {
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
    <Layout primaryAction={{ label: '次ターンへ', onClick: handleNext }}>
      <ExplanationBox title="連立構成">
        過半数を取れなかった第一党が、イデオロギーの近い党と連立交渉を行った結果です。MVPでは交渉は自動で行われ、結果のみが表示されます。連立健全度は今後のターン経過で変動し、低下しすぎると連立崩壊が発生する可能性があります。
      </ExplanationBox>

      <Card>
        <CardHeader>
          <CardTitle>連立交渉結果</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm">
            第一党: <span className="font-semibold">{rulingParty?.name ?? '―'}</span> (
            {rulingParty?.seats ?? 0}議席)
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">連立構成</div>
            {coalitionParties.map((p) => (
              <div key={p.id} className="flex justify-between border rounded-md p-2 text-sm">
                <span>
                  {p.name}
                  {p.id === rulingId && (
                    <Badge variant="secondary" className="ml-2">
                      第一党
                    </Badge>
                  )}
                  {p.isPlayer && (
                    <Badge variant="default" className="ml-2">
                      あなた
                    </Badge>
                  )}
                </span>
                <span className="font-mono inline-flex items-center gap-1">
                  {p.seats}議席 ・距離{' '}
                  {rulingParty
                    ? ideologyDistance(rulingParty.ideology, p.ideology).toFixed(2)
                    : '―'}
                  <InfoTooltip
                    label="イデオロギー距離"
                    content="第一党と当該党のイデオロギー軸 (経済・社会・外交) の差を数値化したものです。小さいほど連立しやすくなります。"
                  />
                </span>
              </div>
            ))}
          </div>

          <div className="border rounded-md p-3 text-sm bg-muted/40">
            <div>
              合計: <span className="font-mono">{coalitionSeats}</span> 議席 (過半数{' '}
              {state.config.majorityThreshold})
            </div>
            <div className="inline-flex items-center gap-1">
              連立健全度初期値: {Math.round(state.coalitionHealth ?? 0)}
              <InfoTooltip
                label="連立健全度"
                content="連立内の関係性を示す指標 (0-100)。ターン経過で変動し、低下しすぎると連立崩壊が発生する可能性があります。"
              />
            </div>
          </div>

          <div className="text-sm">
            {isPlayerInCoalition ? (
              <span className="text-green-700">
                あなたの党は与党 (連立) として政権に参加します。
              </span>
            ) : (
              <span>あなたの党は野党となります。</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
