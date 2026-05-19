import type { GameEvent } from '@/types';

export const SCANDAL_EVENTS: GameEvent[] = [
  {
    id: 'E_SC_01',
    name: '所属議員の汚職疑惑',
    description: '所属議員に金銭授受の疑惑が浮上。記者会見での対応が求められている。',
    category: 'political_scandal',
    scale: 'small',
    trigger: { type: 'random', baseProbability: 0.08 },
    choices: [
      {
        id: 'A',
        label: '即時離党勧告',
        effects: { approval: 2 },
        explanation: '迅速な対応で被害を最小化。',
      },
      {
        id: 'B',
        label: '本人弁明を待つ',
        effects: { approval: -4 },
        explanation: '対応の遅さが批判を呼ぶ。',
      },
    ],
    educationalNote: 'スキャンダル対応の遅れは支持率に直撃する。',
  },
];
