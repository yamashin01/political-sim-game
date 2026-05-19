import type { GameEvent } from '@/types';

export const DISASTER_EVENTS: GameEvent[] = [
  {
    id: 'E_DIS_01',
    name: '大規模地震が発生',
    description: '関東地方で大地震が発生。被害状況の把握と緊急対応が必要。',
    category: 'national_disaster',
    scale: 'large',
    trigger: { type: 'random', baseProbability: 0.05 },
    immediateEffects: { economy: -5, finance: -3 },
    choices: [
      {
        id: 'A',
        label: '大規模補正予算で迅速対応',
        effects: { approval: 6, finance: -5 },
      },
      {
        id: 'B',
        label: '既存予算の範囲で対応',
        effects: { approval: -4, finance: 0 },
      },
    ],
    educationalNote: '災害対応は政権の評価を大きく左右する典型イベント。',
  },
  {
    id: 'E_DIS_02',
    name: '九州で台風被害',
    description: '九州地方を大型台風が襲い、農業・インフラに被害が出ている。',
    category: 'regional_disaster',
    scale: 'small',
    trigger: { type: 'random', baseProbability: 0.1 },
    affectedRegions: ['kyushu_okinawa'],
    immediateEffects: { economy: -2 },
    educationalNote: '地方限定災害も対応次第で地方支持率が変動する。',
  },
];
