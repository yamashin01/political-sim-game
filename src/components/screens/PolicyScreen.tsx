import { ExplanationBox } from '@/components/common/ExplanationBox';
import { InfoTooltip } from '@/components/common/InfoTooltip';
import { Layout } from '@/components/common/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { REGISTRY } from '@/data/registry';
import { evaluatePolicyPassage } from '@/engine/policy';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import type { Policy, PolicyCategory } from '@/types';
import { useMemo, useState } from 'react';

const CATEGORIES: { id: PolicyCategory; label: string }[] = [
  { id: 'tax_finance', label: '税制財政' },
  { id: 'economy_industry', label: '経済産業' },
  { id: 'welfare', label: '社会保障' },
  { id: 'education_science', label: '教育科技' },
  { id: 'environment_energy', label: '環境エネルギー' },
  { id: 'diplomacy_defense', label: '外交防衛' },
  { id: 'administration', label: '行政' },
];

export function PolicyScreen() {
  const state = useGameStore((s) => s.state);
  const selected = useGameStore((s) => s.selectedPolicyIds);
  const select = useGameStore((s) => s.selectPolicy);
  const unselect = useGameStore((s) => s.unselectPolicy);
  const propose = useGameStore((s) => s.proposePolicies);
  const setScreen = useUiStore((s) => s.setScreen);
  const setPhase = useUiStore((s) => s.setPhase);
  const [results, setResults] = useState<{ policyId: string; passed: boolean }[] | null>(null);

  const policiesByCategory = useMemo(() => {
    const result: Record<PolicyCategory, Policy[]> = {
      tax_finance: [],
      economy_industry: [],
      welfare: [],
      education_science: [],
      environment_energy: [],
      diplomacy_defense: [],
      administration: [],
    };
    for (const p of Object.values(REGISTRY.policies)) {
      result[p.category].push(p);
    }
    return result;
  }, []);

  if (!state) return null;

  const handleSubmit = () => {
    const res = propose(selected);
    setResults(res);
  };

  const handleProceed = () => {
    setPhase('budget');
    setScreen('budget');
  };

  if (results) {
    return (
      <Layout primaryAction={{ label: '予算フェーズへ', onClick: handleProceed }}>
        <ExplanationBox title="政策の通過結果">
          提出した政策の通過/否決の判定結果です。通過した政策のみが指標に効果を反映します。否決された政策は今ターンの効果が発生しません。
        </ExplanationBox>

        <Card>
          <CardHeader>
            <CardTitle>政策の通過結果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {results.length === 0 && <div className="text-sm">提出した政策はありません。</div>}
            {results.map((r) => {
              const policy = REGISTRY.policies[r.policyId];
              return (
                <div
                  key={r.policyId}
                  className="flex justify-between rounded-md border p-3 items-center"
                >
                  <span>{policy?.name ?? r.policyId}</span>
                  <Badge variant={r.passed ? 'default' : 'destructive'}>
                    {r.passed ? '通過' : '否決'}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout
      hint={`選択中: ${selected.length}/3`}
      primaryAction={{
        label: '提出',
        onClick: handleSubmit,
        disabled: selected.length === 0,
      }}
    >
      <div className="space-y-3">
        <ExplanationBox title="政策フェーズ">
          今ターン提出する政策を最大3本まで選びます。党の議席率と他党の協力度合いで通過判定が行われ、通過した政策のみが指標に効果を与えます。重要な政策ほど通過に必要な議席率が高くなります。
        </ExplanationBox>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            重要度
            <InfoTooltip
              label="重要度"
              content="1〜3。値が大きいほど効果も大きいですが、通過に必要な議席率も高くなります。"
            />
          </span>
          <span className="inline-flex items-center gap-1">
            通過予想
            <InfoTooltip
              label="通過予想"
              content="現在の議席数と他党の親和性から推定した通過可能性です。確保が必要を上回ると「通過予想」となります。"
            />
          </span>
          <span className="inline-flex items-center gap-1">
            必要議席率
            <InfoTooltip
              label="必要議席率"
              content="この政策が通過するために必要な賛成議席の割合です。重要度とイデオロギー乖離で変動します。"
            />
          </span>
        </div>

        {selected.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">選択中の政策</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {selected.map((id) => {
                const policy = REGISTRY.policies[id];
                return (
                  <Button key={id} variant="secondary" size="sm" onClick={() => unselect(id)}>
                    {policy?.name ?? id} ×
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue={CATEGORIES[0]?.id}>
          <TabsList className="flex-wrap h-auto">
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c.id} value={c.id}>
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {CATEGORIES.map((c) => (
            <TabsContent key={c.id} value={c.id} className="space-y-2">
              {policiesByCategory[c.id].length === 0 && (
                <div className="text-sm text-muted-foreground p-3">
                  このカテゴリの政策はまだ未実装です。
                </div>
              )}
              {policiesByCategory[c.id].map((p) => {
                const judgment = evaluatePolicyPassage(p, state);
                const willPass = judgment.passed;
                const isSelected = selected.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => (isSelected ? unselect(p.id) : select(p.id))}
                    className={`w-full text-left rounded-md border p-3 transition-colors ${
                      isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
                    }`}
                  >
                    <div className="flex justify-between items-baseline gap-2">
                      <div className="font-semibold">{p.name}</div>
                      <div className="flex gap-1 items-center">
                        <Badge variant="outline">重要度{p.importance}</Badge>
                        <Badge variant={willPass ? 'default' : 'destructive'}>
                          {willPass ? '通過予想' : '否決予想'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      必要 {(judgment.requiredSeatsRatio * 100).toFixed(0)}% / 確保{' '}
                      {(judgment.actualSupportRatio * 100).toFixed(0)}% ・効果:{' '}
                      {formatEffects(p.effects)}
                    </div>
                  </button>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
}

function formatEffects(eff: Record<string, number | undefined>): string {
  const map: Record<string, string> = {
    approval: '支持',
    economy: '経済',
    finance: '財政',
    diplomacy: '外交',
    environment: '環境',
  };
  return Object.entries(eff)
    .filter(([, v]) => v !== undefined && v !== 0)
    .map(([k, v]) => `${map[k] ?? k}${(v as number) > 0 ? '+' : ''}${v}`)
    .join(' / ');
}
