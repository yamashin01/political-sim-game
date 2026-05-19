import type { GameEvent } from '@/types';

export const ECONOMIC_SHOCK_EVENTS: GameEvent[] = [
  {
    id: 'E_EC_01',
    name: '大手企業の経営破綻',
    description: '国内大手企業が経営破綻。雇用と関連市場への影響が懸念される。',
    category: 'economic_shock',
    scale: 'small',
    trigger: { type: 'conditional', baseProbability: 0.1, conditionKey: 'economy_low' },
    immediateEffects: { economy: -4, approval: -2 },
    educationalNote: '経済情勢が悪化しているほど発生確率が上がる連動イベント。',
  },
];
