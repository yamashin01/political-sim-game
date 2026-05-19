import type { Policy } from '@/types';

export const WELFARE_POLICIES: Policy[] = [
  {
    id: 'P_WF_01',
    name: '子育て給付の拡充',
    category: 'welfare',
    importance: 2,
    ideologyDirection: { economic: 2, social: 1, diplomatic: 0 },
    timeliness: 'short',
    budgetCost: -7,
    effects: { approval: 7, finance: -6, economy: 1 },
    educationalNote: '少子化対策の一環。即効性のある支持率上昇が見込めるが財政負担は重い。',
  },
  {
    id: 'P_WF_02',
    name: '年金支給開始年齢の引き上げ',
    category: 'welfare',
    importance: 3,
    ideologyDirection: { economic: -1, social: -1, diplomatic: 0 },
    timeliness: 'long',
    budgetCost: 6,
    effects: { approval: -10, finance: 8 },
    educationalNote: '財政再建に効くが高齢層からの支持を大きく失う典型的なトレードオフ。',
  },
];
