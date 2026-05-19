import type { GameEvent } from '@/types';

export const INTERNATIONAL_EVENTS: GameEvent[] = [
  {
    id: 'E_INT_01',
    name: '尖閣諸島周辺で領海侵入',
    description: '中国海警局の船が日本の領海に侵入した。対応を迫られている。',
    category: 'international_political',
    scale: 'large',
    trigger: { type: 'random', baseProbability: 0.08 },
    choices: [
      {
        id: 'A',
        label: '海保増派・対米連携要請',
        effects: { approval: 5, diplomacy: 3 },
        explanation: '対米関係を強化しつつ国民への安心感を示す。',
      },
      {
        id: 'B',
        label: '外交ルートで強く抗議',
        effects: { approval: -3, diplomacy: 1 },
        explanation: '穏当な対応。国内タカ派には不評。',
      },
      {
        id: 'C',
        label: '静観・冷静対応',
        effects: { approval: -8, diplomacy: -3 },
        explanation: '事態をエスカレートさせない代わりに弱腰と評価されやすい。',
      },
    ],
    educationalNote: '尖閣諸島問題は日中関係の象徴的論点。対応次第で支持率と外交が大きく動く。',
  },
  {
    id: 'E_INT_02',
    name: '原油価格の急騰',
    description: '中東情勢の緊張で原油価格が高騰し、国内のエネルギーコストが上昇している。',
    category: 'international_economic',
    scale: 'small',
    trigger: { type: 'random', baseProbability: 0.12 },
    immediateEffects: { economy: -3, environment: -1 },
    educationalNote: '輸入依存度の高い日本にとって原油価格は経済の重大要素。',
  },
];
