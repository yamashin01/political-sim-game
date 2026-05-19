import type { Policy } from '@/types';

export const EDUCATION_SCIENCE_POLICIES: Policy[] = [
  {
    id: 'P_ES_01',
    name: '大学教育の無償化',
    category: 'education_science',
    importance: 2,
    ideologyDirection: { economic: 2, social: 1, diplomatic: 0 },
    timeliness: 'long',
    budgetCost: -5,
    effects: { approval: 5, economy: 2, finance: -5 },
    educationalNote: '長期的な人材育成・所得向上を狙うが歳出は増える。',
  },
  {
    id: 'P_ES_02',
    name: 'AI研究開発投資',
    category: 'education_science',
    importance: 1,
    ideologyDirection: { economic: 0, social: 0, diplomatic: 0 },
    timeliness: 'medium',
    budgetCost: -3,
    effects: { economy: 4, finance: -2, environment: 1 },
    educationalNote: '将来の競争力に直結する戦略投資。',
  },
];
