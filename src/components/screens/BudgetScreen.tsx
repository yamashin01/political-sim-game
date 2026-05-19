import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/common/Layout';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import type { IndicatorChanges } from '@/types';

interface BudgetCategory {
  key: string;
  label: string;
  effect: keyof IndicatorChanges;
  perTrillionYen: number;
}

/** 設計書 §7.4 の影響対応 (暫定値: 10兆円配分でその指標 +1 程度) */
const CATEGORIES: BudgetCategory[] = [
  { key: 'taxFinance', label: '税制財政', effect: 'finance', perTrillionYen: 0.1 },
  { key: 'economyIndustry', label: '経済産業', effect: 'economy', perTrillionYen: 0.12 },
  { key: 'welfare', label: '社会保障', effect: 'approval', perTrillionYen: 0.08 },
  { key: 'educationScience', label: '教育科技', effect: 'economy', perTrillionYen: 0.06 },
  { key: 'environmentEnergy', label: '環境エネルギー', effect: 'environment', perTrillionYen: 0.15 },
  { key: 'diplomacyDefense', label: '外交防衛', effect: 'diplomacy', perTrillionYen: 0.13 },
];

const REVENUE_TRILLION = 110;
const ALLOWED_DEFICIT = 30;

export function BudgetScreen() {
  const state = useGameStore((s) => s.state);
  const setScreen = useUiStore((s) => s.setScreen);
  const setPhase = useUiStore((s) => s.setPhase);
  const isFirstHalf = state ? state.currentTurn % 2 === 1 : true;

  // 本予算: スライダー / 補正予算: 簡易 (組む/組まない)
  const [allocations, setAllocations] = useState<Record<string, number>>({
    taxFinance: 8,
    economyIndustry: 15,
    welfare: 35,
    educationScience: 10,
    environmentEnergy: 8,
    diplomacyDefense: 8,
  });
  const [submitSupplementary, setSubmitSupplementary] = useState(false);
  const [supplementarySize, setSupplementarySize] = useState(5);

  const total = Object.values(allocations).reduce((s, v) => s + v, 0);

  const projectedChanges = useMemo<IndicatorChanges>(() => {
    if (!isFirstHalf) {
      if (!submitSupplementary) return {};
      // 補正予算: 規模に応じて支持率と経済+、財政-
      return {
        approval: 1 + supplementarySize * 0.1,
        economy: supplementarySize * 0.15,
        finance: -supplementarySize * 0.3,
      };
    }
    const changes: IndicatorChanges = {};
    for (const c of CATEGORIES) {
      const trillion = allocations[c.key] ?? 0;
      const delta = trillion * c.perTrillionYen;
      changes[c.effect] = (changes[c.effect] ?? 0) + delta;
    }
    // 赤字なら財政-
    if (total > REVENUE_TRILLION) {
      const deficit = total - REVENUE_TRILLION;
      changes.finance = (changes.finance ?? 0) - deficit * 0.2;
    } else {
      // 余剰は財政+
      changes.finance = (changes.finance ?? 0) + (REVENUE_TRILLION - total) * 0.05;
    }
    return changes;
  }, [isFirstHalf, allocations, total, submitSupplementary, supplementarySize]);

  if (!state) return null;

  const handleSubmit = () => {
    // 効果を pendingChanges に追加 (gameStoreにresolveEventがあるので、ここでは小細工せず resolveEvent を経由する代わりに直接ストアの内部状態へ書き込む)
    // シンプルな実装: pendingChanges を新規 resolveEventのように追加する関数が無いため、predicted を直接 applyTurnIndicators 前の pendingChanges に積む
    useGameStore.setState((draft) => {
      const next = { ...draft.pendingChanges };
      for (const k of Object.keys(projectedChanges) as (keyof IndicatorChanges)[]) {
        next[k] = (next[k] ?? 0) + (projectedChanges[k] ?? 0);
      }
      return { ...draft, pendingChanges: next };
    });
    setPhase('wrap_up');
    setScreen('dashboard');
  };

  const canSubmit = isFirstHalf ? total <= REVENUE_TRILLION + ALLOWED_DEFICIT : true;

  return (
    <Layout
      hint={
        isFirstHalf
          ? `合計 ${total}兆円 / 歳入 ${REVENUE_TRILLION}兆円 (許容赤字+${ALLOWED_DEFICIT})`
          : '補正予算は任意'
      }
      primaryAction={{
        label: isFirstHalf
          ? '提出'
          : submitSupplementary
            ? '補正予算を組む'
            : '組まずに進む',
        onClick: handleSubmit,
        disabled: !canSubmit,
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            {isFirstHalf ? '本予算編成' : '補正予算 (任意)'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isFirstHalf ? (
            <>
              <div className="text-sm text-muted-foreground">
                各分野に予算を配分してください (単位: 兆円)。許容赤字を超えると提出できません。
              </div>
              {CATEGORIES.map((c) => (
                <div key={c.key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{c.label}</span>
                    <span className="font-mono">{allocations[c.key] ?? 0} 兆円</span>
                  </div>
                  <Slider
                    value={[allocations[c.key] ?? 0]}
                    min={0}
                    max={50}
                    step={1}
                    onValueChange={(v) =>
                      setAllocations((s) => ({ ...s, [c.key]: v[0] ?? 0 }))
                    }
                  />
                </div>
              ))}
              <div className="border-t pt-3 text-sm">
                <div>合計: {total} 兆円</div>
                <div>
                  歳入差分:{' '}
                  <span className={total > REVENUE_TRILLION ? 'text-destructive' : ''}>
                    {total - REVENUE_TRILLION > 0 ? '+' : ''}
                    {total - REVENUE_TRILLION} 兆円
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Button
                  variant={submitSupplementary ? 'default' : 'outline'}
                  onClick={() => setSubmitSupplementary(true)}
                  size="sm"
                >
                  補正予算を組む
                </Button>
                <Button
                  variant={!submitSupplementary ? 'default' : 'outline'}
                  onClick={() => setSubmitSupplementary(false)}
                  size="sm"
                >
                  組まずに進む
                </Button>
              </div>
              {submitSupplementary && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>規模</span>
                    <span className="font-mono">{supplementarySize} 兆円</span>
                  </div>
                  <Slider
                    value={[supplementarySize]}
                    min={1}
                    max={30}
                    step={1}
                    onValueChange={(v) => setSupplementarySize(v[0] ?? 5)}
                  />
                </div>
              )}
            </>
          )}

          <div className="rounded-md border bg-muted/40 p-3 text-xs">
            予想される指標変化: {formatEffects(projectedChanges)}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}

function formatEffects(eff: IndicatorChanges): string {
  if (Object.keys(eff).length === 0) return '効果なし';
  const map: Record<string, string> = {
    approval: '支持率',
    economy: '経済',
    finance: '財政',
    diplomacy: '外交安保',
    environment: '環境',
  };
  return Object.entries(eff)
    .filter(([, v]) => v !== undefined && Math.abs(v as number) > 0.01)
    .map(([k, v]) => {
      const n = v as number;
      return `${map[k] ?? k}${n > 0 ? '+' : ''}${n.toFixed(1)}`;
    })
    .join(' / ');
}
