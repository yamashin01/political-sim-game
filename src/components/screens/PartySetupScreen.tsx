import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import { NPC_PARTIES } from '@/data/parties';
import type { Ideology } from '@/types';

const NPC_NAMES = NPC_PARTIES.map((p) => p.name);

const AXES = [
  {
    key: 'economic' as const,
    label: '経済軸',
    negative: '小さな政府',
    positive: '大きな政府',
  },
  {
    key: 'social' as const,
    label: '社会軸',
    negative: '保守',
    positive: 'リベラル',
  },
  {
    key: 'diplomatic' as const,
    label: '外交軸',
    negative: '同盟重視',
    positive: '自主路線',
  },
];

export function PartySetupScreen() {
  const setScreen = useUiStore((s) => s.setScreen);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const enqueueEvents = useUiStore((s) => s.enqueueEvents);

  const [partyName, setPartyName] = useState('新政党');
  const [ideology, setIdeology] = useState<Ideology>({
    economic: 0,
    social: 0,
    diplomatic: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const positioning = describePosition(ideology);

  const handleStart = () => {
    if (!partyName.trim()) {
      setError('党名を入力してください');
      return;
    }
    if (NPC_NAMES.includes(partyName.trim())) {
      setError(`「${partyName}」は他の党と重複します。別の党名にしてください。`);
      return;
    }
    setError(null);
    const eventIds = startNewGame(partyName.trim(), ideology);
    enqueueEvents(eventIds);
    setScreen('dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>党設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="partyName">党名</Label>
            <Input
              id="partyName"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              maxLength={20}
              placeholder="例: 新政党"
            />
          </div>

          <div className="space-y-3">
            <Label>イデオロギー</Label>
            {AXES.map((axis) => (
              <div key={axis.key} className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{axis.label}</span>
                  <span className="font-mono">
                    {ideology[axis.key] > 0 ? `+${ideology[axis.key]}` : ideology[axis.key]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs w-20 text-right">{axis.negative}</span>
                  <div className="flex gap-1">
                    {[-2, -1, 0, 1, 2].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setIdeology((s) => ({ ...s, [axis.key]: v }))}
                        className={`w-9 h-9 rounded-md border text-xs ${
                          ideology[axis.key] === v
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-accent'
                        }`}
                      >
                        {v > 0 ? `+${v}` : v}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs w-20">{axis.positive}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <div className="text-muted-foreground text-xs mb-1">推測されるポジショニング</div>
            <div>{positioning}</div>
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setScreen('title')}>
              タイトルへ戻る
            </Button>
            <Button onClick={handleStart}>決定</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function describePosition(i: Ideology): string {
  if (i.economic === 0 && i.social === 0 && i.diplomatic === 0) {
    return '中道 (全軸0)。特徴のない党との評価に注意。';
  }
  const parts: string[] = [];
  if (i.social <= -1) parts.push('保守');
  else if (i.social >= 1) parts.push('リベラル');
  else parts.push('中道');

  if (i.economic <= -1) parts.push('小さな政府');
  else if (i.economic >= 1) parts.push('大きな政府');

  if (i.diplomatic <= -1) parts.push('同盟重視');
  else if (i.diplomatic >= 1) parts.push('自主路線');

  return parts.join('・') + '寄り';
}
