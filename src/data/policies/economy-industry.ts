import type { Policy } from '@/types';

export const ECONOMY_INDUSTRY_POLICIES: Policy[] = [
  {
    id: 'P_EI_01',
    name: '半導体産業への補助金',
    category: 'economy_industry',
    importance: 2,
    ideologyDirection: { economic: 1, social: 0, diplomatic: -1 },
    timeliness: 'medium',
    budgetCost: -6,
    effects: { economy: 6, finance: -4, diplomacy: 2 },
    educationalNote: '戦略産業への支援は中長期の競争力に効くが歳出を増やす。',
  },
  {
    id: 'P_EI_02',
    name: '規制緩和パッケージ',
    category: 'economy_industry',
    importance: 1,
    ideologyDirection: { economic: -2, social: 0, diplomatic: 0 },
    timeliness: 'short',
    budgetCost: 0,
    effects: { economy: 4, approval: 2, finance: 1 },
    educationalNote: '規制緩和は経済活性化に直結するが、業界からの反発リスクを伴う。',
  },
];
