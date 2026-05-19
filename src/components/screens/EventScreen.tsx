import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/common/Layout';
import { REGISTRY } from '@/data/registry';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';

export function EventScreen() {
  const resolveEvent = useGameStore((s) => s.resolveEvent);
  const resolvingId = useUiStore((s) => s.resolvingEventId);
  const startNextEvent = useUiStore((s) => s.startNextEvent);
  const queue = useUiStore((s) => s.pendingEventQueue);
  const setScreen = useUiStore((s) => s.setScreen);
  const setPhase = useUiStore((s) => s.setPhase);
  const finishEvent = useUiStore((s) => s.finishEvent);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  useEffect(() => {
    if (!resolvingId) {
      startNextEvent();
    }
  }, [resolvingId, startNextEvent]);

  if (!resolvingId) {
    // キューが完全に空 → 政策フェーズへ
    if (queue.length === 0) {
      setPhase('policy');
      setScreen('policy');
    }
    return null;
  }

  const event = REGISTRY.events[resolvingId];
  if (!event) {
    finishEvent();
    startNextEvent();
    return null;
  }

  const hasChoices = event.choices && event.choices.length > 0;

  const handleConfirm = () => {
    const choiceId = hasChoices ? selectedChoice : undefined;
    if (hasChoices && !choiceId) return;
    resolveEvent(event.id, choiceId ?? undefined);
    setSelectedChoice(null);
    finishEvent();
    const next = startNextEvent();
    if (!next) {
      setPhase('policy');
      setScreen('policy');
    }
  };

  return (
    <Layout
      hint={`残イベント: ${queue.length}`}
      primaryAction={{
        label: hasChoices ? '決定' : '了解',
        onClick: handleConfirm,
        disabled: !!hasChoices && !selectedChoice,
      }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{categoryLabel(event.category)}</Badge>
            <Badge variant={event.scale === 'large' ? 'destructive' : 'secondary'}>
              {event.scale === 'large' ? '大規模' : '小規模'}
            </Badge>
          </div>
          <CardTitle>{event.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm whitespace-pre-wrap">{event.description}</p>

          {event.immediateEffects && (
            <div className="text-xs text-muted-foreground border rounded-md p-2">
              即時効果: {formatEffects(event.immediateEffects)}
            </div>
          )}

          {hasChoices && (
            <div className="space-y-2">
              {event.choices?.map((c) => (
                <Button
                  key={c.id}
                  variant={selectedChoice === c.id ? 'default' : 'outline'}
                  className="w-full justify-start h-auto py-3 text-left whitespace-normal"
                  onClick={() => setSelectedChoice(c.id)}
                >
                  <div>
                    <div className="font-semibold">
                      {c.id}: {c.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatEffects(c.effects)}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}

function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    international_political: '国際政治',
    international_economic: '国際経済',
    national_disaster: '国内災害',
    regional_disaster: '地方災害',
    political_scandal: 'スキャンダル',
    economic_shock: '経済ショック',
    positive: 'ポジティブ',
    internal_party: '党内突発',
    scheduled: '定例',
  };
  return labels[cat] ?? cat;
}

function formatEffects(eff: Record<string, number | undefined>): string {
  const map: Record<string, string> = {
    approval: '支持率',
    economy: '経済',
    finance: '財政',
    diplomacy: '外交安保',
    environment: '環境',
  };
  return Object.entries(eff)
    .filter(([, v]) => v !== undefined && v !== 0)
    .map(([k, v]) => `${map[k] ?? k}${(v as number) > 0 ? '+' : ''}${v}`)
    .join(' / ');
}
