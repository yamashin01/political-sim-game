import type { Trend } from '@/types';

/**
 * 設計書 §5.9 + ゲームバランス §6: 5本のトレンド。
 * baseAdvancePerTurn の暫定値は game-balance の中央値を採用。
 */
export const TRENDS: Trend[] = [
  {
    id: 'aging',
    name: '少子高齢化',
    description: '人口構造の変化により社会保障費が増大し、経済成長率も低下傾向。',
    baseAdvancePerTurn: 3,
    perTurnEffects: { finance: -3, economy: -2 },
    counterPolicyIds: ['P_WF_01'],
    educationalNote: '社会保障給付の拡大と財政悪化を同時に進める長期トレンド。',
  },
  {
    id: 'climate_change',
    name: '気候変動',
    description: '異常気象や海面上昇の影響が顕在化。',
    baseAdvancePerTurn: 4,
    perTurnEffects: { environment: -3, economy: -1 },
    counterPolicyIds: ['P_EE_01'],
    educationalNote: '地球規模で進行する変化。対抗政策は再エネ拡大など。',
  },
  {
    id: 'us_china',
    name: '米中対立',
    description: '米中間の対立が経済・軍事の両面で深刻化。',
    baseAdvancePerTurn: 3,
    perTurnEffects: { diplomacy: -2, economy: -1 },
    counterPolicyIds: ['P_DD_02'],
    educationalNote: 'サプライチェーン分断や安全保障リスクの源泉。',
  },
  {
    id: 'ai_revolution',
    name: 'AI/技術革新',
    description: 'AIや自動化が産業構造を急速に書き換えつつある。',
    baseAdvancePerTurn: 5,
    perTurnEffects: { economy: 2, approval: -1 },
    counterPolicyIds: ['P_ES_02'],
    educationalNote: '経済成長を後押しする一方、雇用や格差の問題を生む。',
  },
  {
    id: 'rural_decline',
    name: '地方衰退',
    description: '地方の人口減少と産業空洞化が進行。',
    baseAdvancePerTurn: 3,
    perTurnEffects: { approval: -1, economy: -1 },
    counterPolicyIds: ['P_AD_02'],
    educationalNote: '地方分権や産業誘致で進行を抑えうる。',
  },
];
