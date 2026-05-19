import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';

export function PartyInfoScreen() {
  const state = useGameStore((s) => s.state);
  const goBack = useUiStore((s) => s.goBack);

  if (!state) return null;

  const rulingId = state.rulingPartyId;

  return (
    <div className="min-h-screen container max-w-3xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>政党情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {state.parties
            .slice()
            .sort((a, b) => b.seats - a.seats)
            .map((p) => {
              const isRuling = p.id === rulingId;
              const inCoalition = state.coalitionPartyIds.includes(p.id);
              const positionLabel = isRuling
                ? '与党 (第一党)'
                : inCoalition
                  ? '連立与党'
                  : '野党';
              return (
                <div key={p.id} className="border rounded-md p-3 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold">
                      {p.name}
                      {p.isPlayer && (
                        <Badge variant="default" className="ml-2">
                          あなた
                        </Badge>
                      )}
                    </span>
                    <Badge variant={isRuling ? 'default' : inCoalition ? 'secondary' : 'outline'}>
                      {positionLabel}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {p.modelDescription ? `モデル: ${p.modelDescription}` : ''}
                  </div>
                  <div className="text-xs">
                    議席: {p.seats} ・党資金: {p.funds}億円 ・イデオロギー: 経済{format(
                      p.ideology.economic,
                    )} / 社会{format(p.ideology.social)} / 外交{format(p.ideology.diplomatic)}
                  </div>
                </div>
              );
            })}
          <Button onClick={() => goBack()}>前の画面へ戻る</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function format(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}
