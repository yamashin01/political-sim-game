import type { Policy } from '@/types';

export const TAX_FINANCE_POLICIES: Policy[] = [
  {
    id: 'P_TF_01',
    name: '消費税減税',
    category: 'tax_finance',
    importance: 2,
    ideologyDirection: { economic: -1, social: 0, diplomatic: 0 },
    timeliness: 'immediate',
    budgetCost: -5,
    effects: { approval: 8, economy: 4, finance: -8 },
    educationalNote: '消費税減税は需要喚起と支持率上昇に効くが、税収減で財政は悪化する。',
  },
  {
    id: 'P_TF_02',
    name: '法人税増税',
    category: 'tax_finance',
    importance: 2,
    ideologyDirection: { economic: 1, social: 1, diplomatic: 0 },
    timeliness: 'short',
    budgetCost: 4,
    effects: { economy: -3, finance: 6, approval: -2 },
    educationalNote: '法人税の増税は財政を改善するが企業活動を冷やしやすい。',
  },
];
