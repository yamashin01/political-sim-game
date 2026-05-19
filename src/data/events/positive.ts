import type { GameEvent } from '@/types';

export const POSITIVE_EVENTS: GameEvent[] = [
  {
    id: 'E_POS_01',
    name: '半導体投資が結実',
    description: '半導体産業への投資が実を結び、国内の生産能力が大きく向上。',
    category: 'positive',
    scale: 'small',
    trigger: { type: 'policy_triggered', baseProbability: 0.25, linkedPolicyId: 'P_EI_01' },
    immediateEffects: { economy: 5, approval: 3 },
    educationalNote: '関連政策の実行が報われるポジティブイベント。',
  },
];
