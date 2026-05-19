import type { Policy } from '@/types';

export const ENVIRONMENT_ENERGY_POLICIES: Policy[] = [
  {
    id: 'P_EE_01',
    name: '再生可能エネルギー拡大',
    category: 'environment_energy',
    importance: 2,
    ideologyDirection: { economic: 1, social: 1, diplomatic: 0 },
    timeliness: 'medium',
    budgetCost: -4,
    effects: { environment: 8, economy: -2, finance: -3 },
    educationalNote: '気候変動対策の主軸。エネルギーコストが上がりやすい点が課題。',
  },
  {
    id: 'P_EE_02',
    name: '原発再稼働の推進',
    category: 'environment_energy',
    importance: 3,
    ideologyDirection: { economic: -1, social: -2, diplomatic: 0 },
    timeliness: 'medium',
    budgetCost: 2,
    effects: { economy: 4, environment: -3, approval: -3 },
    educationalNote: '電力供給と経済には正だが、世論との折り合いが難しい。',
  },
];
