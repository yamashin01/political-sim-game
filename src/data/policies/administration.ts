import type { Policy } from '@/types';

export const ADMINISTRATION_POLICIES: Policy[] = [
  {
    id: 'P_AD_01',
    name: '行政DXの推進',
    category: 'administration',
    importance: 1,
    ideologyDirection: { economic: 0, social: 0, diplomatic: 0 },
    timeliness: 'medium',
    budgetCost: -2,
    effects: { approval: 3, economy: 2, finance: 1 },
    educationalNote: '行政手続きのデジタル化で生産性が向上する。地味だが効果は持続的。',
  },
  {
    id: 'P_AD_02',
    name: '地方分権の推進',
    category: 'administration',
    importance: 2,
    ideologyDirection: { economic: 0, social: 0, diplomatic: 0 },
    timeliness: 'long',
    budgetCost: -1,
    effects: { approval: 2, economy: 1 },
    educationalNote: '地方創生の文脈で議論される構造改革。中央 vs 地方の綱引きが伴う。',
  },
];
