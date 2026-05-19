import type { Policy } from '@/types';

export const DIPLOMACY_DEFENSE_POLICIES: Policy[] = [
  {
    id: 'P_DD_01',
    name: '防衛費GDP比2%への増額',
    category: 'diplomacy_defense',
    importance: 3,
    ideologyDirection: { economic: 0, social: -1, diplomatic: -2 },
    timeliness: 'medium',
    budgetCost: -8,
    effects: { diplomacy: 8, finance: -6, approval: -2 },
    educationalNote: '対米同盟の強化と抑止力向上に効くが、財政負担は重い。',
  },
  {
    id: 'P_DD_02',
    name: '近隣諸国との対話強化',
    category: 'diplomacy_defense',
    importance: 1,
    ideologyDirection: { economic: 0, social: 1, diplomatic: 2 },
    timeliness: 'short',
    budgetCost: 0,
    effects: { diplomacy: 3, approval: 1 },
    educationalNote: '緊張緩和のための外交努力。短期効果は限定的でも長期的な安定に寄与。',
  },
];
